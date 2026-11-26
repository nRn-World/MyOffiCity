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
const path = require('path');
const crypto = require('crypto');
const { spawn } = require('child_process');

const PORT = 11435;
const OLLAMA_HOST = '127.0.0.1';
const OLLAMA_PORT = 11434;
const WORKER_REGISTER_URL = 'https://nrnworld.one/MyOffiCity/api/local-ai/register';
const KEY_FILE = path.join(__dirname, '.local-ai.key');
const CLOUDFLARED = path.join(__dirname, 'tools', process.platform === 'win32' ? 'cloudflared.exe' : 'cloudflared');

const LEAD_MODEL = process.env.LOCAL_LEAD_MODEL || 'gemma4:latest';
const DESIGN_MODEL = process.env.LOCAL_DESIGN_MODEL || 'gemma4:latest';
const CODER_MODEL = process.env.LOCAL_CODER_MODEL || 'qwen3.5:9b';

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

// 1. Authenticated HTTP proxy -> local Ollama (127.0.0.1:11434)
const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, leadModel: LEAD_MODEL, designModel: DESIGN_MODEL, coderModel: CODER_MODEL }));
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
  req.on('end', () => {
    let bodyBuf = Buffer.concat(chunks);
    // For chat completions, keep model hot in VRAM & give generous 16k context window
    if (req.method === 'POST' && req.url.startsWith('/v1/chat/completions') && bodyBuf.length) {
      try {
        const j = JSON.parse(bodyBuf.toString('utf8'));
        j.keep_alive = '30m';
        j.options = { ...(j.options || {}), num_ctx: 16384 };
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
