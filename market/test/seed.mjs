// Skapar ett provföretag på en lokal Worker och (valfritt) flyttar en beställning framåt som ägaren:
import './_email.mjs';
//   node test/seed.mjs company                 -> skapar ägare + företag
//   node test/seed.mjs advance <orderId> <steg> -> steg: variants | show | build | deliver
const BASE = process.env.BASE || 'http://localhost:8799';
const IP = '10.9.9.9';
const call = async (method, path, body, token) => {
  const r = await fetch(BASE + '/api' + path, { method, headers: { 'Content-Type': 'application/json', ...(BASE.includes('localhost') ? { 'CF-Connecting-IP': IP } : {}), ...(token ? { Authorization: 'Bearer ' + token } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
  return { ...(await r.json().catch(() => ({}))), http: r.status };
};
const OWNER = 'demo_owner', PW = 'demo-password-123';
async function ownerToken() {
  let r = await call('POST', '/login', { username: OWNER, password: PW });
  if (r.http !== 200) r = await call('POST', '/register', { username: OWNER, password: PW });
  return r.token;
}
const page = (t) => '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + t + '</title><style>body{font-family:system-ui;margin:0;background:#fdf6ec;color:#3b2a1a}header{padding:40px;background:#8a5a2b;color:#fff}section{padding:30px 40px}</style></head><body><header><h1>' + t + '</h1><p>Fresh bread every morning in the heart of Uppsala.</p></header>' + '<section><h2>Menu</h2><p>Sourdough, cinnamon buns and seasonal pastries baked on site.</p></section>'.repeat(3) + '</body></html>';
const [, , cmd, a, b] = process.argv;
const tok = await ownerToken();
if (cmd === 'company') {
  const c = await call('PUT', '/company', { name: 'Webb Design Demo', tagline: 'Websites that sell', description: 'A small AI team that designs and builds websites for small businesses.', services: [{ title: 'Landing page', price: 'from 49 USD', desc: 'One polished page' }, { title: 'Small business site', price: 'from 149 USD', desc: '3 to 5 pages' }] }, tok);
  console.log('company', c.http, c.id || c.error);
} else if (cmd === 'advance') {
  const id = a, step = b;
  if (step === 'variants') {
    const vs = ['Cozy', 'Modern', 'Rustic', 'Playful'].map((n, i) => ({ id: 'v' + (i + 1), name: n, idea: n + ' bakery design', palette: ['#fff', '#8a5a2b'], html: page(n + ' Bakery'), internal: { check: { ok: true }, review: { by: 'Ebba', approved: true } } }));
    console.log('upload', (await call('PUT', '/orders/' + id + '/variants', { variants: vs }, tok)).http);
    console.log('run', (await call('POST', '/orders/' + id + '/status', { status: 'variants_run' }, tok)).http);
    console.log('report', (await call('POST', '/orders/' + id + '/status', { status: 'variants_report', report: { by: 'Tomas', text: 'Four proposals ready.', approved: true, kind: 'variants' } }, tok)).http);
  } else if (step === 'show') console.log('show', (await call('POST', '/orders/' + id + '/status', { status: 'variants_shown' }, tok)).http);
  else if (step === 'build') {
    console.log('run', (await call('POST', '/orders/' + id + '/status', { status: 'build_run' }, tok)).http);
    console.log('files', (await call('PUT', '/orders/' + id + '/files', { files: { 'index.html': page('Final site').replace('</header>', '</header><nav><a href="about.html">About</a></nav>'), 'about.html': page('About us'), 'style.css': 'body{margin:0}' } }, tok)).http);
    console.log('report', (await call('POST', '/orders/' + id + '/status', { status: 'build_report', report: { by: 'Tomas', text: 'Built.', approved: true, kind: 'build' } }, tok)).http);
  } else if (step === 'deliver') console.log('deliver', (await call('POST', '/orders/' + id + '/status', { status: 'delivered' }, tok)).http);
}
