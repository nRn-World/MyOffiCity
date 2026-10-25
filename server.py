#!/usr/bin/env python3
"""nRn Company – lokal server.

Serverar appen och proxar alla AI- och GitHub-anrop. API-nycklarna ligger i
.env på den här datorn och skickas aldrig till webbläsaren.

Kör:  python server.py     (Windows: start.bat, macOS/Linux: ./start.sh)
Bara standardbibliotek – ingen installation behövs.
"""

import html
import ipaddress
import json
import os
import random
import re
import socket
import sys
import threading
import time
import urllib.error
import urllib.request
import urllib.robotparser
import webbrowser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, unquote, urljoin, urlparse

ROOT = os.path.dirname(os.path.abspath(__file__))
TIMEOUT = 90
MAX_CONCURRENT = 8
_cache_lock = threading.Lock()
_slots = threading.BoundedSemaphore(MAX_CONCURRENT)


def load_env():
    path = os.path.join(ROOT, ".env")
    if not os.path.exists(path):
        return
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            key, value = key.strip(), value.strip()
            if len(value) >= 2 and value[0] == value[-1] and value[0] in "\"'":
                value = value[1:-1]
            # .env är facit för den här lokala appen – annars kan ett ärvt PORT=0
            # eller en gammal nyckel i skalet tyst ta över.
            if key:
                os.environ[key] = value


load_env()
PORT = int(os.environ.get("PORT", "8765"))
OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://localhost:11434").rstrip("/")
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN", "").strip()

PROVIDERS = {
    "openrouter": {
        "key": os.environ.get("OPENROUTER_API_KEY", "").strip(),
        "models": "https://openrouter.ai/api/v1/models",
        "chat": "https://openrouter.ai/api/v1/chat/completions",
        "check": "https://openrouter.ai/api/v1/key",
    },
    "openai": {
        "key": os.environ.get("OPENAI_API_KEY", "").strip(),
        "models": "https://api.openai.com/v1/models",
        "chat": "https://api.openai.com/v1/chat/completions",
    },
    "anthropic": {
        "key": os.environ.get("ANTHROPIC_API_KEY", "").strip(),
        "models": "https://api.anthropic.com/v1/models",
        "chat": "https://api.anthropic.com/v1/messages",
    },
}

OPENAI_PRICES = {
    "gpt-4o-mini": (0.15, 0.6),
    "gpt-4o": (2.5, 10),
    "gpt-4.1": (2, 8),
    "gpt-4.1-mini": (0.4, 1.6),
    "gpt-4.1-nano": (0.1, 0.4),
    "gpt-4-turbo": (10, 30),
    "gpt-3.5-turbo": (0.5, 1.5),
    "o1": (15, 60),
    "o1-mini": (1.1, 4.4),
    "o3": (2, 8),
    "o3-mini": (1.1, 4.4),
    "o4-mini": (1.1, 4.4),
    "gpt-5": (1.25, 10),
    "gpt-5-mini": (0.25, 2),
    "gpt-5-nano": (0.05, 0.4),
}


class Upstream(Exception):
    def __init__(self, status, payload):
        self.status = status
        self.payload = payload
        super().__init__(self.message)

    @property
    def message(self):
        payload = self.payload or {}
        if isinstance(payload, dict):
            err = payload.get("error")
            if isinstance(err, dict) and err.get("message"):
                return str(err["message"])
            if isinstance(err, str) and err:
                return err
            if payload.get("message"):
                return str(payload["message"])
        return "Uppströmsfel"


# ---------------------------------------------------------------------------
# Säker sidhämtning för bevakningar (/api/fetch).
# Regler: bara http(s), aldrig privata/lokala adresser, följer robots.txt, redirects
# valideras steg för steg, och sajter som kräver skriftligt tillstånd för robotar
# (blocket.se) hämtas inte om du inte själv anger WATCH_ALLOW_HOSTS i .env.
# ---------------------------------------------------------------------------
BOT_UA = "nRnCompanyBot/1.0 (personal use; respects robots.txt)"
NO_BOT_HOSTS = {"blocket.se"}
ALLOW_HOSTS = {h.strip().lower() for h in os.environ.get("WATCH_ALLOW_HOSTS", "").split(",") if h.strip()}
MAX_PAGE = 1_500_000
_robots = {}


class FetchError(Exception):
    def __init__(self, code, message, status=400):
        super().__init__(message)
        self.code, self.message, self.status = code, message, status


def _host_in(host, hosts):
    return any(host == h or host.endswith("." + h) for h in hosts)


def check_host(host):
    host = (host or "").lower().rstrip(".")
    if not host:
        raise FetchError("url", "Invalid URL")
    if _host_in(host, NO_BOT_HOSTS) and not _host_in(host, ALLOW_HOSTS):
        raise FetchError("blocked", f"{host} forbids automated access without the site's written permission, "
                         "so the team will not fetch it. Use the site's own saved-search alerts instead.", 403)
    try:
        infos = socket.getaddrinfo(host, None)
    except socket.gaierror:
        raise FetchError("dns", f"Cannot resolve {host}", 502)
    for info in infos:
        if not ipaddress.ip_address(info[4][0]).is_global:
            raise FetchError("private", "Private or local addresses are not allowed", 403)
    # shortcut: DNS kan i teorin ändras mellan kontrollen och anropet; acceptabelt för lokal enanvändarapp


def robots_allows(parsed):
    base = f"{parsed.scheme}://{parsed.netloc}"
    now = time.time()
    ent = _robots.get(base)
    if not ent or now - ent[0] > 3600:
        rp = urllib.robotparser.RobotFileParser()
        try:
            req = urllib.request.Request(base + "/robots.txt", headers={"User-Agent": BOT_UA})
            with urllib.request.urlopen(req, timeout=10) as r:
                rp.parse(r.read(500_000).decode("utf-8", "replace").splitlines())
        except urllib.error.HTTPError as err:
            if err.code in (401, 403):
                rp.disallow_all = True
            else:
                rp.allow_all = True
        except Exception:  # noqa: BLE001 - robots.txt onåbar = som utan robots.txt
            rp.allow_all = True
        _robots[base] = ent = (now, rp)
    path = (parsed.path or "/") + ("?" + parsed.query if parsed.query else "")
    return ent[1].can_fetch(BOT_UA, base + path)


class _NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *args, **kwargs):
        return None


def extract_html(src, base):
    t = re.search(r"<title[^>]*>(.*?)</title>", src, re.I | re.S)
    title = html.unescape(re.sub(r"\s+", " ", t.group(1))).strip() if t else ""
    links, seen = [], set()
    for m in re.finditer(r'<a\b[^>]*?href\s*=\s*["\']([^"\'#][^"\']*)["\'][^>]*>(.*?)</a>', src, re.I | re.S):
        href = urljoin(base, html.unescape(m.group(1)).strip())
        if not href.startswith(("http://", "https://")) or href in seen:
            continue
        label = re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", m.group(2)))).strip()
        seen.add(href)
        links.append({"href": href[:500], "text": label[:200]})
        if len(links) >= 250:
            break
    s = re.sub(r"(?is)<(script|style|noscript|svg|template)\b.*?</\1>", " ", src)
    s = re.sub(r"(?s)<!--.*?-->", " ", s)
    s = re.sub(r"(?i)</?(p|div|br|li|tr|h[1-6]|article|section)[^>]*>", "\n", s)
    s = html.unescape(re.sub(r"<[^>]+>", " ", s))
    s = re.sub(r"[ \t\r\f\v]+", " ", s)
    s = re.sub(r"\n\s*\n+", "\n", s).strip()
    return title, s, links


def fetch_page(payload):
    url = str(payload.get("url", "")).strip()
    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https") or not parsed.netloc:
        raise FetchError("url", "Only http(s) URLs are allowed")
    opener = urllib.request.build_opener(_NoRedirect)
    raw = ctype = charset = None
    for _hop in range(4):
        check_host(parsed.hostname)
        if not robots_allows(parsed):
            raise FetchError("robots", f"robots.txt on {parsed.hostname} does not allow bots to read this page", 403)
        req = urllib.request.Request(url, headers={
            "User-Agent": BOT_UA, "Accept-Language": "sv,en;q=0.8",
            "Accept": "text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.5"})
        try:
            with opener.open(req, timeout=15) as r:
                ctype = r.headers.get("Content-Type", "")
                charset = r.headers.get_content_charset() or "utf-8"
                raw = r.read(MAX_PAGE + 1)[:MAX_PAGE]
                break
        except urllib.error.HTTPError as err:
            loc = err.headers.get("Location") if err.headers else None
            if err.code in (301, 302, 303, 307, 308) and loc:
                url = urljoin(url, loc)
                parsed = urlparse(url)
                if parsed.scheme not in ("http", "https"):
                    raise FetchError("url", "Redirect to an unsupported address", 502)
                continue
            raise FetchError("http", f"The site answered HTTP {err.code}", 502)
        except Exception as err:  # noqa: BLE001
            raise FetchError("net", f"Network error: {err}", 502)
    if raw is None:
        raise FetchError("redirect", "Too many redirects", 502)
    text = raw.decode(charset, "replace")
    if "html" in (ctype or "").lower() or "<html" in text[:2000].lower():
        title, body, links = extract_html(text, url)
    else:
        title, body, links = "", text, []
    return {"ok": True, "url": url, "status": 200, "title": title, "text": body[:60000], "links": links}


def ollama_models():
    """Installerade lokala modeller (Ollama) – tom lista om Ollama inte körs."""
    try:
        data = http_json(OLLAMA_URL + "/api/tags", timeout=2)
    except Exception:  # noqa: BLE001
        return []
    out = []
    for m in data.get("models") or []:
        name = str(m.get("name") or "")
        if name:
            out.append({"id": "ollama:" + name, "provider": "ollama", "model": name,
                        "label": f"Ollama · {name} (local, free)", "pin": 0.0, "pout": 0.0,
                        "tier": 0, "free": True, "unknown": False, "ctx": 0})
    return out


# Gratismodeller på OpenRouter är ofta överbelastade eller försvinner – prova nästa i stället för att ge upp.
FREE_FALLBACK = ["google/gemma-4-26b-a4b-it:free", "cohere/north-mini-code:free",
                 "google/gemma-4-31b-it:free", "openrouter/free"]


def http_json(url, method="GET", headers=None, body=None, timeout=TIMEOUT):
    data = json.dumps(body).encode("utf-8") if body is not None else None
    hdrs = {"User-Agent": "nRn-Company/2", "Accept": "application/json"}
    if data is not None:
        hdrs["Content-Type"] = "application/json"
    hdrs.update(headers or {})
    last = None
    for attempt in range(3):
        req = urllib.request.Request(url, data=data, headers=hdrs, method=method)
        try:
            with urllib.request.urlopen(req, timeout=timeout) as res:
                raw = res.read().decode("utf-8", "replace")
                return json.loads(raw) if raw.strip() else {}
        except urllib.error.HTTPError as err:
            raw = err.read().decode("utf-8", "replace")
            try:
                payload = json.loads(raw) if raw.strip() else {}
            except ValueError:
                payload = {"error": {"message": raw[:500]}}
            last = Upstream(err.code, payload)
            if err.code in (429, 500, 502, 503, 504) and attempt < 2:
                wait = (2 ** attempt) + random.random()
                retry_after = err.headers.get("Retry-After")
                if retry_after and retry_after.isdigit():
                    wait = min(20, float(retry_after))
                time.sleep(wait)
                continue
            raise last
        except (urllib.error.URLError, TimeoutError, OSError) as err:
            reason = getattr(err, "reason", err)
            last = Upstream(0, {"error": {"message": f"Network error: {reason}"}})
            if attempt < 2:
                time.sleep(1 + random.random())
                continue
            raise last
    raise last or Upstream(0, {"error": {"message": "Okänt fel"}})


def tier_for(pin, pout):
    if pin <= 0 and pout <= 0:
        return 0
    if pin <= 1:
        return 0
    if pin <= 10:
        return 1
    return 2


def price_for(provider, model):
    name = model.lower()
    if provider == "openai":
        for known in sorted(OPENAI_PRICES, key=len, reverse=True):
            if name == known:
                return OPENAI_PRICES[known]
        return None
    if provider == "anthropic":
        if "opus" in name:
            return (15, 75)
        if "sonnet" in name:
            return (3, 15)
        if "haiku" in name:
            return (1, 5)
        return None
    return None


def norm_model(provider, model, name=None, pin=0.0, pout=0.0, ctx=None, free=False, unknown=False):
    # Okänt pris får en försiktig uppskattning så att varken budget eller
    # byggnadsnivåer underskattar kostnaden.
    if unknown and pin <= 0 and pout <= 0:
        pin, pout = 5.0, 15.0
    return {
        "id": f"{provider}:{model}",
        "provider": provider,
        "model": model,
        "label": name or model,
        "pin": round(pin, 4),
        "pout": round(pout, 4),
        "tier": tier_for(pin, pout),
        "free": bool(free),
        "unknown": bool(unknown),
        "ctx": ctx,
    }


def fetch_models(provider):
    cfg = PROVIDERS[provider]
    key = cfg["key"]
    if provider != "openrouter" and not key:
        return []
    headers = {}
    if provider == "openrouter":
        if key:
            headers["Authorization"] = "Bearer " + key
    elif provider == "openai":
        headers["Authorization"] = "Bearer " + key
    else:
        headers["x-api-key"] = key
        headers["anthropic-version"] = "2023-06-01"
    data = http_json(cfg["models"], headers=headers, timeout=40)
    out = []
    if provider == "openrouter":
        skip = ("embed", "moderation", "guard", "rerank", "whisper", "tts", "transcribe",
                "safety", "lyria", "music", "clip", "image", "video", ":batch")
        for m in data.get("data", []):
            mid = str(m.get("id", ""))
            if not mid or any(s in mid.lower() for s in skip):
                continue
            arch = m.get("architecture") or {}
            outs = arch.get("output_modalities") or []
            # bara ren textmodeller (routern openrouter/auto och openrouter/free undantas)
            if outs and outs != ["text"] and not mid.startswith("openrouter/"):
                continue
            if isinstance(m.get("context_length"), int) and m["context_length"] < 4096:
                continue
            pricing = m.get("pricing") or {}
            try:
                pin = float(pricing.get("prompt", 0)) * 1_000_000
                pout = float(pricing.get("completion", 0)) * 1_000_000
            except (TypeError, ValueError):
                pin = pout = 0.0
            unknown = pin < 0 or pout < 0
            if unknown:
                pin = pout = 0.0
            free = (pin == 0 and pout == 0 and not unknown)
            out.append(norm_model("openrouter", mid, m.get("name") or mid, pin, pout,
                                  m.get("context_length"), free, unknown))
    elif provider == "openai":
        skip = ("audio", "realtime", "transcribe", "tts", "image", "embed", "moderation", "search", "dall-e")
        for m in data.get("data", []):
            mid = str(m.get("id", ""))
            if not mid or any(s in mid.lower() for s in skip):
                continue
            if not mid.startswith(("gpt-", "o1", "o3", "o4", "chatgpt")):
                continue
            price = price_for("openai", mid)
            if price:
                out.append(norm_model("openai", mid, mid, price[0], price[1]))
            else:
                out.append(norm_model("openai", mid, mid, unknown=True))
    else:
        for m in data.get("data", []):
            mid = str(m.get("id", ""))
            if not mid:
                continue
            price = price_for("anthropic", mid)
            label = m.get("display_name") or mid
            if price:
                out.append(norm_model("anthropic", mid, label, price[0], price[1], unknown=False))
            else:
                out.append(norm_model("anthropic", mid, label, unknown=True))
    return out


_catalog = {"t": 0.0, "models": [], "errors": {}}


def get_catalog(force=False):
    with _cache_lock:
        fresh = _catalog["t"] and (time.time() - _catalog["t"] < 6 * 3600)
        if fresh and not force:
            return _catalog["models"], _catalog["errors"]
        models, errors = [], {}
        for provider in PROVIDERS:
            if provider != "openrouter" and not PROVIDERS[provider]["key"]:
                continue
            try:
                models.extend(fetch_models(provider))
            except Upstream as err:
                errors[provider] = err.message
            except Exception as err:  # noqa: BLE001 - surface any provider problem
                errors[provider] = str(err)
        models.extend(ollama_models())
        seen, unique = set(), []
        for m in sorted(models, key=lambda x: (x["tier"], x["unknown"], x["pin"], x["label"].lower())):
            if m["id"] in seen:
                continue
            seen.add(m["id"])
            unique.append(m)
        _catalog.update(t=time.time(), models=unique, errors=errors)
        return unique, errors


def check_provider(provider):
    cfg = PROVIDERS[provider]
    if not cfg["key"]:
        return {"configured": False, "ok": False, "detail": "No key in .env"}
    headers = {}
    if provider == "openrouter":
        headers["Authorization"] = "Bearer " + cfg["key"]
    elif provider == "openai":
        headers["Authorization"] = "Bearer " + cfg["key"]
    else:
        headers["x-api-key"] = cfg["key"]
        headers["anthropic-version"] = "2023-06-01"
    try:
        data = http_json(cfg.get("check") or cfg["models"], headers=headers, timeout=25)
        if provider == "openrouter":
            info = data.get("data") or {}
            usage = info.get("usage")
            limit = info.get("limit")
            parts = ["Key OK"]
            if isinstance(usage, (int, float)):
                parts.append(f"usage ${usage:.4f}")
            if isinstance(limit, (int, float)):
                left = info.get("limit_remaining")
                parts.append(f"limit ${limit:.2f}" + (f" (remaining ${left:.2f})" if isinstance(left, (int, float)) else ""))
            if info.get("is_free_tier"):
                parts.append("free tier")
            return {"configured": True, "ok": True, "detail": " · ".join(parts)}
        count = len(data.get("data") or [])
        return {"configured": True, "ok": True, "detail": f"Key OK · {count} models"}
    except Upstream as err:
        return {"configured": True, "ok": False, "detail": f"HTTP {err.status}: {err.message}"}
    except Exception as err:  # noqa: BLE001
        return {"configured": True, "ok": False, "detail": str(err)}


def check_github():
    if not GITHUB_TOKEN:
        return {"configured": False, "ok": False, "detail": "No GITHUB_TOKEN in .env"}
    try:
        user = http_json("https://api.github.com/user", headers=github_headers(), timeout=20)
        return {"configured": True, "ok": True, "detail": f"Signed in as {user.get('login', '?')}"}
    except Upstream as err:
        return {"configured": True, "ok": False, "detail": f"HTTP {err.status}: {err.message}"}
    except Exception as err:  # noqa: BLE001
        return {"configured": True, "ok": False, "detail": str(err)}


ENV_NAMES = {
    "openrouter": "OPENROUTER_API_KEY",
    "openai": "OPENAI_API_KEY",
    "anthropic": "ANTHROPIC_API_KEY",
}


def save_env(name, value):
    """Skriver en nyckel till .env utan att röra övriga rader."""
    if not re.fullmatch(r"[A-Z][A-Z0-9_]*", name):
        raise ValueError("invalid env name")
    if not value or "\n" in value or "\r" in value or len(value) > 500:
        raise ValueError("invalid value")
    path = os.path.join(ROOT, ".env")
    lines = []
    if os.path.exists(path):
        with open(path, encoding="utf-8") as f:
            lines = f.read().splitlines()
    line = f"{name}={value}"
    found = False
    for i, old in enumerate(lines):
        if old.split("=", 1)[0].strip() == name:
            lines[i] = line
            found = True
            break
    if not found:
        lines.append(line)
    with open(path, "w", encoding="utf-8", newline="\n") as f:
        f.write("\n".join(lines).rstrip("\n") + "\n")


def save_credential(payload):
    """Testar en nyckel och sparar den bara om leverantören accepterar den."""
    global GITHUB_TOKEN
    provider = str(payload.get("provider", "")).lower()
    value = str(payload.get("key", "")).strip()
    if not value or len(value) > 500 or "\n" in value or "\r" in value:
        return {"ok": False, "detail": "Invalid key"}
    if provider == "github":
        old = GITHUB_TOKEN
        GITHUB_TOKEN = value
        result = check_github()
        if not result.get("ok"):
            GITHUB_TOKEN = old
            return result
        save_env("GITHUB_TOKEN", value)
        _status.update(t=0.0, data=None)
        return result
    if provider in PROVIDERS:
        cfg = PROVIDERS[provider]
        old = cfg["key"]
        cfg["key"] = value
        result = check_provider(provider)
        if not result.get("ok"):
            cfg["key"] = old
            return result
        save_env(ENV_NAMES[provider], value)
        _catalog.update(t=0.0, models=[], errors={})
        _status.update(t=0.0, data=None)
        return result
    return {"ok": False, "detail": "Unknown provider"}


def check_ollama(base=None):
    url = (base or OLLAMA_URL).rstrip("/") + "/v1/models"
    try:
        data = http_json(url, timeout=4)
        count = len(data.get("data") or [])
        return {"configured": True, "ok": True, "detail": f"Ollama responds · {count} models"}
    except Upstream as err:
        return {"configured": True, "ok": False, "detail": err.message}
    except Exception as err:  # noqa: BLE001
        return {"configured": True, "ok": False, "detail": str(err)}


_status = {"t": 0.0, "data": None}


def get_status(force=False):
    with _cache_lock:
        if _status["data"] and not force and time.time() - _status["t"] < 120:
            return _status["data"]
        data = {
            "server": True,
            "providers": {p: check_provider(p) for p in PROVIDERS},
            "github": check_github(),
            "ollama": check_ollama(),
        }
        _status.update(t=time.time(), data=data)
        return data


def github_headers():
    return {
        "Accept": "application/vnd.github+json",
        "Authorization": "Bearer " + GITHUB_TOKEN,
        "X-GitHub-Api-Version": "2022-11-28",
    }


def gh_request(payload):
    if not GITHUB_TOKEN:
        raise Upstream(0, {"error": {"message": "No GITHUB_TOKEN in .env"}})
    path = str(payload.get("path", ""))
    if not path.startswith("/") or ".." in path:
        raise Upstream(0, {"error": {"message": "Ogiltig GitHub-sökväg"}})
    method = str(payload.get("method", "GET")).upper()
    if method not in ("GET", "POST", "PUT", "PATCH", "DELETE"):
        raise Upstream(0, {"error": {"message": "Ogiltig metod"}})
    body = payload.get("body")
    data = http_json("https://api.github.com" + path, method=method, headers=github_headers(),
                     body=body if method != "GET" else None, timeout=60)
    return data


def chat(payload):
    provider = str(payload.get("provider", ""))
    if provider not in ("openrouter", "openai", "anthropic", "ollama", "custom"):
        raise Upstream(0, {"error": {"message": "Okänd leverantör"}})
    model = str(payload.get("model", ""))[:200]
    if not model:
        raise Upstream(0, {"error": {"message": "Modell saknas"}})
    system = str(payload.get("system", ""))[:60000]
    raw = payload.get("messages") or []
    messages = []
    for m in raw[:40]:
        role = m.get("role") if isinstance(m, dict) else None
        content = m.get("content") if isinstance(m, dict) else None
        if role in ("user", "assistant") and isinstance(content, str):
            messages.append({"role": role, "content": content[:60000]})
    if not messages:
        raise Upstream(0, {"error": {"message": "Inga meddelanden"}})
    try:
        max_tokens = int(payload.get("maxTokens") or 4096)
    except (TypeError, ValueError):
        max_tokens = 4096
    max_tokens = max(64, min(8192, max_tokens))

    if provider == "anthropic":
        cfg = PROVIDERS["anthropic"]
        if not cfg["key"]:
            raise Upstream(0, {"error": {"message": "ANTHROPIC_API_KEY saknas i .env"}})
        body = {"model": model, "max_tokens": max_tokens, "messages": messages}
        if system:
            body["system"] = system
        res = http_json(cfg["chat"], method="POST",
                        headers={"x-api-key": cfg["key"], "anthropic-version": "2023-06-01"}, body=body)
        text = "".join(c.get("text", "") for c in (res.get("content") or []) if isinstance(c, dict))
        usage = res.get("usage") or {}
        return {"text": text, "inTok": usage.get("input_tokens", 0),
                "outTok": usage.get("output_tokens", 0), "cost": None}

    if provider == "ollama":
        base = str(payload.get("baseUrl") or OLLAMA_URL).rstrip("/")
        if not base.startswith(("http://", "https://")):
            raise Upstream(0, {"error": {"message": "Invalid Ollama address"}})
        url = base + "/v1/chat/completions"
        key = ""
    elif provider == "custom":
        base = str(payload.get("baseUrl") or "").rstrip("/")
        if not base.startswith(("http://", "https://")):
            raise Upstream(0, {"error": {"message": "Invalid base URL"}})
        url = base + "/chat/completions"
        key = str(payload.get("apiKey") or "")
    else:
        cfg = PROVIDERS[provider]
        if not cfg["key"]:
            raise Upstream(0, {"error": {"message": f"{provider.upper()}_API_KEY saknas i .env"}})
        url = cfg["chat"]
        key = cfg["key"]

    body = {
        "model": model,
        "messages": ([{"role": "system", "content": system}] if system else []) + messages,
        "max_tokens": max_tokens,
    }
    headers = {"Authorization": "Bearer " + key} if key else {}
    used = model
    try:
        res = http_json(url, method="POST", headers=headers, body=body)
    except Upstream as err:
        free = provider == "openrouter" and (model.endswith(":free") or model == "openrouter/free")
        if not (free and err.status in (404, 408, 429, 500, 502, 503, 504)):
            raise
        res = None
        for alt in [m for m in FREE_FALLBACK if m != model]:
            try:
                res = http_json(url, method="POST", headers=headers, body={**body, "model": alt})
                used = alt
                break
            except Upstream:
                continue
        if res is None:
            raise
    choice = (res.get("choices") or [{}])[0]
    text = (choice.get("message") or {}).get("content") or ""
    usage = res.get("usage") or {}
    cost = usage.get("cost")
    return {"text": text, "inTok": usage.get("prompt_tokens", 0) or 0,
            "outTok": usage.get("completion_tokens", 0) or 0,
            "cost": cost if isinstance(cost, (int, float)) else None, "usedModel": used}


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def log_message(self, fmt, *args):
        try:
            line = fmt % args if args else fmt
        except (TypeError, ValueError):
            line = str(fmt)
        if "/api/" in line:
            return  # never log request bodies (they can contain code, not keys)
        super().log_message(fmt, *args)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        super().end_headers()

    def same_origin(self):
        host = (self.headers.get("Host") or "").lower()
        allowed = {f"localhost:{PORT}", f"127.0.0.1:{PORT}"}
        if host and host not in allowed:
            return False
        origin = self.headers.get("Origin")
        if origin and origin not in (f"http://localhost:{PORT}", f"http://127.0.0.1:{PORT}"):
            return False
        return True

    def send_json(self, obj, status=200):
        raw = json.dumps(obj).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)

    def read_json(self):
        try:
            length = int(self.headers.get("Content-Length") or 0)
        except ValueError:
            length = 0
        if length <= 0 or length > 4_000_000:
            return {}
        try:
            return json.loads(self.rfile.read(length).decode("utf-8"))
        except ValueError:
            return {}

    def do_GET(self):
        url = urlparse(self.path)
        if not url.path.startswith("/api/"):
            # Servera aldrig .env eller andra dotfiler – nycklarna får inte gå att hämta.
            path = unquote(url.path)
            if "/." in path or path.rstrip("/").endswith("/server.py"):
                return self.send_error(404)
            return super().do_GET()
        if not self.same_origin():
            return self.send_json({"error": {"message": "Fel origin"}}, 403)
        query = parse_qs(url.query)
        if url.path == "/api/status":
            try:
                return self.send_json(get_status(force="refresh" in query))
            except Exception as err:  # noqa: BLE001
                return self.send_json({"error": {"message": str(err)}}, 500)
        if url.path == "/api/models":
            try:
                models, errors = get_catalog(force="refresh" in query)
                return self.send_json({"models": models, "errors": errors,
                                       "providers": {p: check_provider(p) for p in PROVIDERS}})
            except Exception as err:  # noqa: BLE001
                return self.send_json({"error": {"message": str(err)}}, 500)
        return self.send_json({"error": {"message": "Okänd endpoint"}}, 404)

    def do_POST(self):
        url = urlparse(self.path)
        if not url.path.startswith("/api/"):
            return self.send_json({"error": {"message": "Okänd endpoint"}}, 404)
        if not self.same_origin():
            return self.send_json({"error": {"message": "Fel origin"}}, 403)
        payload = self.read_json()
        try:
            if url.path == "/api/chat":
                with _slots:
                    return self.send_json(chat(payload))
            if url.path == "/api/fetch":
                with _slots:
                    try:
                        return self.send_json(fetch_page(payload))
                    except FetchError as err:
                        return self.send_json({"error": {"message": err.message, "code": err.code}}, err.status)
            if url.path == "/api/gh":
                with _slots:
                    data = gh_request(payload)
                if data is None:
                    return self.send_json({})
                return self.send_json(data)
            if url.path == "/api/test":
                provider = str(payload.get("provider", ""))
                if provider == "github":
                    return self.send_json(check_github())
                if provider in PROVIDERS:
                    return self.send_json(check_provider(provider))
                if provider == "ollama":
                    return self.send_json(check_ollama(payload.get("baseUrl")))
                if provider == "custom":
                    base = str(payload.get("baseUrl", "")).rstrip("/")
                    if not base.startswith(("http://", "https://")):
                        return self.send_json({"ok": False, "detail": "Invalid base URL"})
                    headers = {"Authorization": "Bearer " + str(payload.get("apiKey", ""))} \
                        if payload.get("apiKey") else {}
                    try:
                        data = http_json(base + "/models", headers=headers, timeout=10)
                        return self.send_json({"ok": True, "detail": f"Responds · {len(data.get('data') or [])} models"})
                    except Upstream as err:
                        return self.send_json({"ok": False, "detail": f"HTTP {err.status}: {err.message}"})
                return self.send_json({"ok": False, "detail": "Okänd leverantör"}, 400)
            if url.path == "/api/config":
                return self.send_json(save_credential(payload))
            if url.path == "/api/refresh":
                get_catalog(force=True)
                return self.send_json(get_status(force=True))
            return self.send_json({"error": {"message": "Okänd endpoint"}}, 404)
        except Upstream as err:
            status = err.status if 400 <= err.status < 600 else 502
            return self.send_json({"error": {"status": err.status, "message": err.message}}, status)
        except Exception as err:  # noqa: BLE001
            return self.send_json({"error": {"message": str(err)}}, 500)


def main():
    if not os.path.exists(os.path.join(ROOT, "index.html")):
        print("Kör server.py från nrn-company-mappen.")
        return 1
    try:
        httpd = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    except OSError as err:
        print(f"Kan inte starta på port {PORT}: {err}")
        print("Stäng appen som redan körs på porten, eller sätt PORT=... i .env.")
        return 1
    url = f"http://localhost:{PORT}/index.html"
    configured = [p for p in PROVIDERS if PROVIDERS[p]["key"]]
    print(f"nRn Company körs på {url}")
    print(f"AI-nycklar: {', '.join(configured) if configured else 'inga (demo-läge fungerar)'}"
          f" · GitHub: {'ja' if GITHUB_TOKEN else 'nej'}")
    print("Stoppa med Ctrl+C.")
    if os.environ.get("NO_BROWSER") != "1":
        threading.Timer(0.7, lambda: webbrowser.open(url)).start()
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStoppar.")
    finally:
        httpd.server_close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
