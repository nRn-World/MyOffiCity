#!/usr/bin/env node
'use strict';
/**
 * MyOffiCity Hybrid Local-AI Bridge
 * Exposes your local Ollama GPU (RTX 4070 SUPER) securely to nrnworld.one/MyOffiCity
 * via a free Cloudflare Tunnel + Bearer token auth (zero daily limits, 0 kr).
 * When your PC is turned off, MyOffiCity automatically falls back to Gemini 3 Flash in the cloud.
 */
const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { spawn } = require('child_process');

const PORT = 11435;
const OLLAMA_HOST = '127.0.0.1';
const OLLAMA_PORT = 11434;
const WORKER_REGISTER_URL = 'https://nrnworld.one/MyOffiCity/api/local-ai/register';
const KEY_FILE = path.join(__dirname, '.local-ai.key');
const CLOUDFLARED = path.join(__dirname, 'tools', process.platform === 'win32' ? 'cloudflared.exe' : 'cloudflared');

const LEAD_MODEL = process.env.LOCAL_LEAD_MODEL || 'gemma4:12b';
const DESIGN_MODEL = process.env.LOCAL_DESIGN_MODEL || 'gemma4:12b';
const CODER_MODEL = process.env.LOCAL_CODER_MODEL || 'qwen3.5:9b';

function findBrowser() {
  const candidates = [
    process.env.MYOFFICITY_BROWSER,
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  ].filter(Boolean);
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return '';
}

function captureScreenshot(url) {
  return new Promise((resolve, reject) => {
    const browser = findBrowser();
    if (!browser) return reject(new Error('No headless Edge/Chrome browser found'));
    const tmpFile = path.join(os.tmpdir(), `moc_audit_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.png`);
    const args = [
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--hide-scrollbars',
      '--window-size=1280,720',
      '--virtual-time-budget=3500',
      `--screenshot=${tmpFile}`,
      url,
    ];
    const child = spawn(browser, args, { stdio: 'ignore', windowsHide: true });
    let done = false;
    const finish = (err) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      if (err) {
        try { fs.unlinkSync(tmpFile); } catch { /* */ }
        return reject(err);
      }
      try {
        if (!fs.existsSync(tmpFile)) return reject(new Error('Screenshot file was not created'));
        const buf = fs.readFileSync(tmpFile);
        try { fs.unlinkSync(tmpFile); } catch { /* */ }
        if (!buf.length) return reject(new Error('Screenshot file is empty'));
        resolve(buf);
      } catch (e) {
        reject(e);
      }
    };
    const timer = setTimeout(() => {
      try { child.kill('SIGKILL'); } catch { /* */ }
      finish(new Error('Screenshot timed out'));
    }, 40000);
    child.on('error', (e) => finish(e));
    child.on('exit', () => finish(null));
  });
}

function ollamaVisionCritique(pngBuf, url, focus) {
  return new Promise((resolve, reject) => {
    const b64 = pngBuf.toString('base64');
    const payload = JSON.stringify({
      model: LEAD_MODEL,
      stream: false,
      think: false,
      keep_alive: '30m',
      options: { num_ctx: 8192, num_predict: 380, temperature: 0.35 },
      messages: [
        {
          role: 'system',
          content: 'You are Tomas, Chief Architect & Senior UI/UX Art Director for MyOffiCity. You inspect REAL live screenshots of the website. Be concrete, specific, and visual. Never invent elements not visible in the screenshot.',
        },
        {
          role: 'user',
          content: `Granska denna skärmdump av live-hemsidan (${url}). Fokus: ${focus || 'helhetsintryck, design, typografi, kontrast, kortlayout och 3D/visuell elegans'}.\nSkriv en skarp, konkret designgranskning på svenska (max 220 ord):\n1) VAD SOM SER BRA UT: 2 tydliga visuella styrkor i bilden.\n2) TOPP 3 DESIGNFÖRBÄTTRINGAR: 3 konkreta förbättringar av utseende, typografi, mellanrum, kontrast, kort-hierarki eller subtila hover-effekter som kan byggas rent i market/public/agent-addons.css (och/eller små mikro-interaktioner i market/public/agent-addons.js utan att skräpa ner #topbar eller lägga till flytande popups).`,
          images: [b64],
        },
      ],
    });
    const req = http.request({
      hostname: OLLAMA_HOST,
      port: OLLAMA_PORT,
      path: '/api/chat',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
      timeout: 90000,
    }, (res) => {
      const out = [];
      res.on('data', (c) => out.push(c));
      res.on('end', () => {
        try {
          const j = JSON.parse(Buffer.concat(out).toString('utf8'));
          const text = String(j?.message?.content || '').replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
          if (!text) return reject(new Error('Empty vision response from Ollama'));
          resolve(text);
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Ollama vision timed out')); });
    req.write(payload);
    req.end();
  });
}

function getOrCreateKey() {
  if (fs.existsSync(KEY_FILE)) {
    const k = fs.readFileSync(KEY_FILE, 'utf8').trim();
    if (k.length >= 24) return k;
  }
  const k = 'moc_local_' + crypto.randomBytes(24).toString('hex');
  fs.writeFileSync(KEY_FILE, k + '\n', { mode: 0o600 });
  return k;
}

const API_KEY = getOrCreateKey();

// 1. Authenticated HTTP proxy -> local Ollama (127.0.0.1:11434) + /visual-audit (Headless Edge + Gemma 4 Vision)
const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, leadModel: LEAD_MODEL, designModel: DESIGN_MODEL, coderModel: CODER_MODEL, vision: Boolean(findBrowser()) }));
    return;
  }
  const auth = String(req.headers.authorization || '');
  if (auth !== 'Bearer ' + API_KEY) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'unauthorized' }));
    return;
  }

  const chunks = [];
  req.on('data', (c) => chunks.push(c));
  req.on('end', async () => {
    let bodyBuf = Buffer.concat(chunks);
    const t0 = Date.now();
    if (req.method === 'POST' && req.url === '/visual-audit') {
      try {
        const j = bodyBuf.length ? JSON.parse(bodyBuf.toString('utf8')) : {};
        const targetUrl = String(j.url || 'https://nrnworld.one/MyOffiCity/#/').trim();
        if (!/^https:\/\/[a-z0-9.-]+/i.test(targetUrl)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'invalid_url' }));
          return;
        }
        const focus = String(j.focus || '').slice(0, 300);
        console.log(`[MyOffiCity Local-AI] 👁️ Tar live-skärmdump av ${targetUrl}...`);
        const pngBuf = await captureScreenshot(targetUrl);
        console.log(`[MyOffiCity Local-AI] 🖼️ Skärmdump klar (${Math.round(pngBuf.length / 1024)} KB) — analyserar med ${LEAD_MODEL} Vision...`);
        const critique = await ollamaVisionCritique(pngBuf, targetUrl, focus);
        console.log(`[MyOffiCity Local-AI] ✅ Visuell designgranskning klar på ${((Date.now() - t0) / 1000).toFixed(1)}s`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, url: targetUrl, model: LEAD_MODEL, bytes: pngBuf.length, critique }));
      } catch (err) {
        console.error('[MyOffiCity Local-AI] ⚠️ Visual audit misslyckades:', err.message || err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: String(err.message || err) }));
      }
      return;
    }
    let reqModel = '';
    // For chat completions, keep model hot in VRAM, disable verbose thinking tokens (so code outputs directly & 5x faster!), and keep 12k context inside 12GB VRAM
    if (req.method === 'POST' && req.url.startsWith('/v1/chat/completions') && bodyBuf.length) {
      try {
        const j = JSON.parse(bodyBuf.toString('utf8'));
        reqModel = j.model || '';
        j.keep_alive = '30m';
        j.reasoning_effort = 'none';
        j.think = false;
        j.options = { ...(j.options || {}), num_ctx: 12288 };
        bodyBuf = Buffer.from(JSON.stringify(j), 'utf8');
      } catch { /* pass through raw */ }
    }
    const headers = {
      'Content-Type': req.headers['content-type'] || 'application/json',
      'Content-Length': bodyBuf.length,
    };
    const proxy = http.request({
      hostname: OLLAMA_HOST,
      port: OLLAMA_PORT,
      path: req.url,
      method: req.method,
      headers,
      timeout: 120000,
    }, (pRes) => {
      if (reqModel) {
        pRes.on('end', () => console.log(`[MyOffiCity Local-AI] ⚡ ${reqModel} -> HTTP ${pRes.statusCode} (${((Date.now() - t0) / 1000).toFixed(1)}s)`));
      }
      res.writeHead(pRes.statusCode || 502, pRes.headers);
      pRes.pipe(res);
    });
    proxy.on('error', (err) => {
      if (!res.headersSent) {
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'ollama_unreachable', detail: String(err.message || err) }));
      }
    });
    if (bodyBuf.length) proxy.write(bodyBuf);
    proxy.end();
  });
});

let currentTunnelUrl = '';

async function registerTunnel(url) {
  if (!url) return;
  try {
    const res = await fetch(WORKER_REGISTER_URL, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        leadModel: LEAD_MODEL,
        designModel: DESIGN_MODEL,
        coderModel: CODER_MODEL,
      }),
    });
    const txt = await res.text();
    if (res.ok) {
      console.log(`[MyOffiCity Local-AI] ✅ Kopplad till nrnworld.one/MyOffiCity (${url})`);
      console.log(`[MyOffiCity Local-AI] 🧠 Tomas & Design: ${LEAD_MODEL} | Kod: ${CODER_MODEL}`);
    } else {
      console.error(`[MyOffiCity Local-AI] ⚠️ Registrering misslyckades (HTTP ${res.status}): ${txt}`);
    }
  } catch (e) {
    console.error('[MyOffiCity Local-AI] ⚠️ Nätverksfel vid registrering:', e.message || e);
  }
}

function startTunnel() {
  if (!fs.existsSync(CLOUDFLARED)) {
    console.error(`[MyOffiCity Local-AI] ❌ Hittar inte ${CLOUDFLARED}`);
    process.exit(1);
  }
  console.log('[MyOffiCity Local-AI] 🚀 Startar krypterad Cloudflare Tunnel...');
  const cf = spawn(CLOUDFLARED, ['tunnel', '--no-autoupdate', '--url', `http://127.0.0.1:${PORT}`], {
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const onData = (buf) => {
    const s = buf.toString('utf8');
    const m = s.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/i);
    if (m && m[0] !== currentTunnelUrl) {
      currentTunnelUrl = m[0];
      registerTunnel(currentTunnelUrl);
    }
  };
  cf.stdout.on('data', onData);
  cf.stderr.on('data', onData);
  cf.on('exit', (code) => {
    console.log(`[MyOffiCity Local-AI] Tunnel avslutades (${code}), startar om om 5 sek...`);
    currentTunnelUrl = '';
    setTimeout(startTunnel, 5000);
  });
}

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[MyOffiCity Local-AI] 🔒 Säker lokal AI-brygga lyssnar på http://127.0.0.1:${PORT}`);
  startTunnel();
  setInterval(() => { if (currentTunnelUrl) registerTunnel(currentTunnelUrl); }, 10 * 60 * 1000);
});
