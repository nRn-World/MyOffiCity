// Fas 4a: API-nycklar, MCP-servern och verktygsvägen (/api/tools) för modell-API:er.
import './_email.mjs';
//   BASE=http://localhost:8799 node test/e2e4.mjs
import assert from 'node:assert/strict';
const BASE = process.env.BASE || 'http://localhost:8799';
const LOCAL = BASE.includes('localhost');
const sfx = Math.random().toString(36).slice(2, 7);
const ipr = () => '10.' + [1, 2, 3].map(() => Math.floor(Math.random() * 250)).join('.');
let n = 0;
const ok = (name) => console.log('  ok', ++n, name);
const PW = 'correct-horse-battery';
const html = (t) => '<!DOCTYPE html><html><head><meta charset="utf-8"><title>' + t + '</title></head><body><h1>' + t + '</h1>' + '<p>x</p>'.repeat(60) + '</body></html>';
async function call(method, path, body, token, extra = {}) {
  const res = await fetch(BASE + '/api' + path, { method, headers: { 'Content-Type': 'application/json', ...(LOCAL ? { 'CF-Connecting-IP': ipr() } : {}), ...(token ? { Authorization: 'Bearer ' + token } : {}), ...extra }, body: body === undefined ? undefined : JSON.stringify(body) });
  const j = await res.json().catch(() => ({}));
  return { ...j, status: res.status, _headers: res.headers };
}
let rpcId = 0;
const rpc = async (method, params, token) => {
  const res = await fetch(BASE + '/api/mcp', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream', ...(token ? { Authorization: 'Bearer ' + token } : {}) }, body: JSON.stringify({ jsonrpc: '2.0', id: ++rpcId, method, params }) });
  return { http: res.status, ...(await res.json().catch(() => ({}))) };
};
const tool = async (token, name, args = {}) => { const r = await rpc('tools/call', { name, arguments: args }, token); assert.equal(r.http, 200, name + ' http'); const res = r.result; const text = res.content[0].text; let data; try { data = JSON.parse(text); } catch { data = text; } return { isError: !!res.isError, data, text }; };
const reg = async (name) => { const r = await call('POST', '/register', { username: name + '_' + sfx, password: PW }); assert.equal(r.status, 200, JSON.stringify(r)); return r; };
const mkKey = async (session, name, scope) => { const r = await call('POST', '/keys', { name, scope }, session); assert.equal(r.status, 200, JSON.stringify(r)); return r; };

// --- nycklar ---
const own = await reg('own'), cus = await reg('cus'), plain = await reg('plain');
assert.equal((await call('POST', '/keys', { name: 'x', scope: 'read' }, plain.token)).status, 403); ok('a plain customer account cannot create a key (company accounts only)');
assert.equal((await call('PUT', '/company', { name: 'Buyer Co ' + sfx }, cus.token)).status, 200);   // kunden i testet är också ett företag så att nyckeln får användas
const co = (await call('PUT', '/company', { name: 'Key Studio ' + sfx, tagline: 'Websites made by agents', tags: ['web'], services: [{ title: 'Landing page', price: '49 USD' }] }, own.token)); assert.equal(co.status, 200);
assert.equal((await call('POST', '/keys', { name: 'x', scope: 'read' })).status, 401); ok('creating a key needs a signed-in session');
assert.equal((await call('POST', '/keys', { name: '', scope: 'read' }, own.token)).status, 400); ok('a key needs a name');
assert.equal((await call('POST', '/keys', { name: 'x', scope: 'root' }, own.token)).status, 400); ok('unknown scope rejected');
const kRead = await mkKey(own.token, 'read key', 'read');
assert.match(kRead.token, /^nrnm_[A-Za-z0-9_-]{40,}$/); ok('key has the nrnm_ format');
const list = await call('GET', '/keys', undefined, own.token); assert.equal(list.keys.length, 1); assert.ok(!JSON.stringify(list).includes(kRead.token)); assert.equal(list.keys[0].prefix, kRead.token.slice(0, 9)); ok('the list shows a prefix, never the key');
assert.equal((await call('GET', '/keys', undefined, kRead.token)).status, 403); ok('a key cannot list or create keys (session only)');
assert.equal((await call('POST', '/keys', { name: 'x', scope: 'full' }, kRead.token)).status, 403); ok('a key cannot mint another key');
assert.equal((await call('POST', '/password/change', { oldPassword: PW, newPassword: PW + 'x' }, kRead.token)).status, 403); ok('a key cannot change the password');
assert.equal((await call('GET', '/me', undefined, kRead.token)).user.username, 'own_' + sfx); ok('a read key can read');
assert.equal((await call('PUT', '/company', { name: 'Hack ' + sfx }, kRead.token)).status, 403); ok('a read key cannot write');
const kWrite = await mkKey(own.token, 'write key', 'write'), kFull = await mkKey(own.token, 'full key', 'full');
assert.equal((await call('PUT', '/company', { name: 'Key Studio ' + sfx, tagline: 'Updated by a write key', tags: ['web'] }, kWrite.token)).status, 200); ok('a write key can edit the company');
const cWrite = await mkKey(cus.token, 'cust write', 'write'), cFull = await mkKey(cus.token, 'cust full', 'full');
assert.equal((await call('POST', '/orders', { companyId: co.id, brief: 'A website for my bakery in Uppsala please' }, cWrite.token)).status, 403); ok('a write key cannot place an order');
assert.equal((await call('POST', '/login', { username: 'own_' + sfx, password: PW })).status, 200);
for (let i = 0; i < 7; i++) await mkKey(own.token, 'extra ' + i, 'read');
assert.equal((await call('POST', '/keys', { name: 'eleventh', scope: 'read' }, own.token)).status, 409); ok('at most 10 keys per account');
const del = (await call('GET', '/keys', undefined, own.token)).keys.find(k => k.name === 'extra 0');
assert.equal((await call('DELETE', '/keys/' + del.id, undefined, own.token)).status, 200); ok('delete a key');
assert.equal((await call('DELETE', '/keys/' + del.id, undefined, own.token)).status, 404); ok('deleting twice answers 404');
const other = await mkKey(cus.token, 'tmp', 'read'); const otherId = (await call('GET', '/keys', undefined, cus.token)).keys.find(k => k.name === 'tmp').id;
assert.equal((await call('DELETE', '/keys/' + otherId, undefined, own.token)).status, 404); ok('you cannot delete someone else\'s key');
assert.equal((await call('DELETE', '/keys/' + otherId, undefined, cus.token)).status, 200);
assert.equal((await call('GET', '/me', undefined, other.token)).status, 401); ok('a removed key stops working at once');

// --- MCP: protokoll ---
const noAuth = await rpc('initialize', { protocolVersion: '2025-06-18' }); assert.equal(noAuth.http, 401); ok('MCP needs a key');
const ses = await rpc('initialize', { protocolVersion: '2025-06-18' }, own.token); assert.equal(ses.http, 401); ok('a session token is not accepted as an MCP key');
const init = await rpc('initialize', { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 'test', version: '1' } }, kRead.token);
assert.equal(init.http, 200); assert.equal(init.result.protocolVersion, '2025-03-26'); assert.equal(init.result.serverInfo.name, 'nrn-market'); assert.match(init.result.instructions, /untrusted/i); ok('initialize negotiates the protocol and carries safety instructions');
const unk = await rpc('initialize', { protocolVersion: '1999-01-01' }, kRead.token); assert.equal(unk.result.protocolVersion, '2025-06-18'); ok('unknown protocol versions fall back to the latest');
assert.deepEqual((await rpc('ping', {}, kRead.token)).result, {}); ok('ping');
const note = await fetch(BASE + '/api/mcp', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + kRead.token }, body: JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) }); assert.equal(note.status, 202); ok('notifications answer 202');
const tl = await rpc('tools/list', {}, kRead.token); assert.ok(tl.result.tools.length >= 15); assert.ok(tl.result.tools.every(t => t.name && t.description && t.inputSchema && t.annotations)); ok('tools/list: ' + tl.result.tools.length + ' tools with schemas and annotations');
assert.equal((await rpc('nope/nothing', {}, kRead.token)).error.code, -32601); ok('unknown method -> -32601');
assert.equal((await rpc('tools/call', { name: 'rm_rf', arguments: {} }, kRead.token)).error.code, -32602); ok('unknown tool -> -32602');
const getRes = await fetch(BASE + '/api/mcp', { headers: { Authorization: 'Bearer ' + kRead.token } }); assert.equal(getRes.status, 405); ok('GET is not allowed (no SSE stream)');
const batch = await fetch(BASE + '/api/mcp', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + kRead.token }, body: JSON.stringify([{ jsonrpc: '2.0', id: 1, method: 'ping' }, { jsonrpc: '2.0', id: 2, method: 'tools/list' }]) });
assert.equal((await batch.json()).length, 2); ok('batch requests work');

// --- MCP: verktyg och nyckelnivåer ---
const who = await tool(kRead.token, 'whoami'); assert.equal(who.data.keyScope, 'read'); assert.equal(who.data.company.name, 'Key Studio ' + sfx); ok('whoami shows the scope and the company');
const sr = await tool(kRead.token, 'search_companies', { query: 'key studio ' + sfx }); assert.equal(sr.data.companies.length, 1); ok('search_companies');
const gc = await tool(kRead.token, 'get_company', { companyId: co.id }); assert.match(gc.data._notice, /untrusted/i); ok('results with user-written text carry an untrusted-data notice');
assert.equal((await tool(kRead.token, 'update_company', { name: 'Hacked ' + sfx })).isError, true); ok('a read key cannot write through MCP either');
assert.equal((await tool(cWrite.token, 'create_order', { companyId: co.id, brief: 'A bakery website in Uppsala, warm style please' })).isError, true); ok('create_order is refused for a write key');
const crt = await tool(cFull.token, 'create_order', { companyId: co.id, brief: 'A bakery website in Uppsala, warm style please', title: 'Bakery', size: 'small' }); assert.equal(crt.isError, false); const id = crt.data.order.id; ok('create_order works with a full key');
const lo = await tool(kWrite.token, 'list_company_orders'); assert.equal(lo.data.orders.length, 1); assert.match(lo.data._notice, /untrusted/i); ok('the owner lists incoming orders');
assert.equal((await tool(cFull.token, 'list_company_orders')).data.orders.length, 0); ok('a customer sees no company orders');
const sm = await tool(cWrite.token, 'send_message', { orderId: id, text: 'Hello from the customer key' }); assert.equal(sm.isError, false); ok('send_message');
const gm = await tool(kWrite.token, 'get_messages', { orderId: id }); assert.equal(gm.data.messages.length, 2); ok('get_messages');

// --- ägarens hela flöde via MCP-verktyg ---
const vs = [1, 2].map(i => ({ id: 'v' + i, name: 'Design ' + i, idea: 'Idea ' + i, html: html('Variant ' + i), internal: { check: { ok: true }, review: { by: 'Ebba', approved: true } } }));
assert.equal((await tool(kRead.token, 'upload_variants', { orderId: id, variants: vs })).isError, true); ok('upload_variants is refused for a read key');
assert.equal((await tool(kWrite.token, 'set_order_status', { orderId: id, status: 'variants_run' })).isError, false); ok('set_order_status variants_run');
assert.equal((await tool(kWrite.token, 'upload_variants', { orderId: id, variants: vs })).isError, false); ok('upload_variants');
assert.equal((await tool(kWrite.token, 'set_order_status', { orderId: id, status: 'variants_report', report: { by: 'Tomas', text: 'Two proposals ready.', approved: true, kind: 'variants' } })).isError, false); ok('report to the owner');
const go1 = await tool(kWrite.token, 'get_order', { orderId: id }); assert.equal(go1.data.order.variants[0].html, undefined); assert.ok(go1.data.order.variants[0].htmlChars > 200); ok('get_order leaves out proposal HTML by default');
const go2 = await tool(kWrite.token, 'get_order', { orderId: id, includeHtml: true }); assert.ok(go2.data.order.variants[0].html.includes('Variant 1')); ok('...and includes it when asked');
assert.equal((await tool(cWrite.token, 'choose_variant', { orderId: id, variantId: 'v1' })).isError, true); ok('the customer cannot choose before proposals are shown');
assert.equal((await tool(kWrite.token, 'set_order_status', { orderId: id, status: 'variants_shown' })).isError, false);
const noVar = await tool(cWrite.token, 'get_order', { orderId: id }); assert.equal(noVar.data.order.variants.length, 2); assert.equal(noVar.data.order.variants[0].internal, undefined); ok('the customer sees proposals, but never the internal notes');
assert.equal((await tool(cWrite.token, 'choose_variant', { orderId: id, variantId: 'v2', note: 'greener button' })).isError, false); ok('choose_variant');
assert.equal((await tool(kWrite.token, 'set_order_status', { orderId: id, status: 'build_run' })).isError, false);
assert.equal((await tool(kWrite.token, 'upload_files', { orderId: id, files: JSON.stringify({ 'index.html': html('Final'), 'style.css': 'body{margin:0}' }) })).isError, false); ok('upload_files (also accepts the files as a JSON string, for Gemini)');
assert.equal((await tool(kWrite.token, 'set_order_status', { orderId: id, status: 'build_report', report: { by: 'Tomas', text: 'Built.', approved: true, kind: 'build' } })).isError, false);
const dw = await tool(kWrite.token, 'set_order_status', { orderId: id, status: 'delivered' }); assert.equal(dw.isError, true); assert.match(dw.text, /full/); ok('a write key cannot deliver');
assert.equal((await tool(kFull.token, 'set_order_status', { orderId: id, status: 'delivered' })).isError, false); ok('a full key can deliver');
const gf = await tool(cWrite.token, 'get_order', { orderId: id, includeFiles: true }); assert.ok(gf.data.order.files['index.html'].includes('Final')); ok('the customer gets the files after delivery');
assert.equal((await tool(cWrite.token, 'rate_order', { orderId: id, stars: 5, text: 'Great' })).isError, false); ok('rate_order');
assert.equal((await tool(kRead.token, 'get_company', { companyId: co.id })).data.company.rating.avg, 5); ok('rating shows on the company');
assert.equal((await tool(cWrite.token, 'get_order', { orderId: 'o' + 'a'.repeat(9) })).isError, true); ok('unknown order is a tool error, not a crash');

// --- verktygsvägen för modell-API:er (OpenAI, OpenRouter, Anthropic, Gemini) ---
const oa = await call('GET', '/tools'); assert.equal(oa.tools[0].type, 'function'); assert.ok(oa.tools[0].function.parameters.type === 'object'); ok('GET /tools gives OpenAI/OpenRouter function definitions');
const an = await call('GET', '/tools?format=anthropic'); assert.ok(an.tools[0].input_schema); ok('format=anthropic');
const ge = await call('GET', '/tools?format=gemini'); const gs = JSON.stringify(ge);
assert.ok(!gs.includes('additionalProperties')); assert.ok(ge.tools[0].functionDeclarations.length >= 15); ok('format=gemini has no unsupported keywords');
const freeObjects = []; (function walk(x, path) { if (Array.isArray(x)) return x.forEach((v, i) => walk(v, path + '[' + i + ']')); if (x && typeof x === 'object') { if (x.type === 'object' && !x.properties) freeObjects.push(path); Object.entries(x).forEach(([k, v]) => walk(v, path + '.' + k)); } })(ge, '$');
assert.deepEqual(freeObjects, []); ok('gemini: no free-form objects (sent as JSON strings instead)');
assert.equal((await call('POST', '/tools/call', { name: 'whoami' })).status, 401); ok('/tools/call needs a key');
assert.equal((await call('POST', '/tools/call', { name: 'rm_rf' }, kRead.token)).status, 400); ok('unknown tool -> 400');
const w1 = await call('POST', '/tools/call', { name: 'whoami', arguments: {} }, kRead.token); assert.equal(w1.isError, false); assert.equal(JSON.parse(w1.text).keyScope, 'read'); ok('a read key can run a read tool');
const w2 = await call('POST', '/tools/call', { name: 'update_company', arguments: { name: 'X ' + sfx } }, kRead.token); assert.equal(w2.status, 200); assert.equal(w2.isError, true); ok('a read key running a write tool gets a tool error (scopes hold on this path)');
const w3 = await call('POST', '/tools/call', { name: 'search_companies', arguments: JSON.stringify({ query: 'key studio' }) }, kRead.token); assert.equal(w3.isError, false); ok('arguments may be a JSON string (as OpenAI sends them)');
const oas = await call('GET', '/openapi.json'); assert.equal(oas.openapi, '3.1.0'); assert.ok(oas.paths['/api/orders'] && oas.paths['/api/tools/call']); ok('OpenAPI description is served');
console.log('\nKEYS + MCP + TOOLS: ALL ' + n + ' CHECKS PASSED');
