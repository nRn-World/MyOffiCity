// Kör mot en lokal Worker:  BASE=http://localhost:8799 node test/e2e.mjs
import './_email.mjs';
// Provar konton, behörigheter och hela beställningsflödet (inkl. att inget läcker för tidigt).
import assert from 'node:assert/strict';
const BASE = process.env.BASE || 'http://localhost:8799';
const sfx = Math.random().toString(36).slice(2, 7);
const IP = '10.' + [1,2,3].map(() => Math.floor(Math.random() * 250)).join('.'); // lokalt; Cloudflare skriver över rubriken på riktigt
let n = 0;
async function call(method, path, body, token) {
  const res = await fetch(BASE + '/api' + path, {
    method, headers: { 'Content-Type': 'application/json', ...(BASE.includes('localhost') ? { 'CF-Connecting-IP': IP } : {}), ...(token ? { Authorization: 'Bearer ' + token } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const j = await res.json().catch(() => ({}));
  return { ...j, status: res.status };
}
const ok = (name) => console.log('  ok', ++n, name);
const PW = 'correct-horse-battery';
const html = (t) => '<!DOCTYPE html><html><head><meta charset="utf-8"><title>' + t + '</title></head><body><h1>' + t + '</h1>' + '<p>x</p>'.repeat(60) + '</body></html>';

// --- konton ---
const owner = await call('POST', '/register', { username: 'owner_' + sfx, password: PW }); assert.equal(owner.status, 200); assert.ok(owner.token); ok('register owner');
const cust = await call('POST', '/register', { username: 'cust_' + sfx, password: PW }); assert.equal(cust.status, 200); ok('register customer');
const spy = await call('POST', '/register', { username: 'spy_' + sfx, password: PW }); assert.equal(spy.status, 200); ok('register third user');
assert.equal((await call('POST', '/register', { username: 'owner_' + sfx, password: PW })).status, 409); ok('duplicate username rejected');
assert.equal((await call('POST', '/register', { username: 'x', password: PW })).status, 400); ok('bad username rejected');
assert.equal((await call('POST', '/register', { username: 'short_' + sfx, password: 'short' })).status, 400); ok('short password rejected');
assert.equal((await call('POST', '/login', { username: 'owner_' + sfx, password: 'wrong-password-1' })).status, 401); ok('wrong password rejected');
const li = await call('POST', '/login', { username: 'owner_' + sfx, password: PW }); assert.equal(li.status, 200); ok('login');
assert.equal((await call('GET', '/me')).status, 401); ok('me needs a token');
assert.equal((await call('GET', '/me', undefined, 'x'.repeat(40))).status, 401); ok('fake token rejected');
const T = { o: owner.token, c: cust.token, s: spy.token };

// --- företag ---
assert.equal((await call('PUT', '/company', { name: 'A' }, T.o)).status, 400); ok('company needs a real name');
const co = await call('PUT', '/company', { name: 'Webb Design ' + sfx, tagline: 'Websites that sell', description: 'We build sites.', services: [{ title: 'Landing page', price: 'from 49 USD', desc: 'One page' }] }, T.o);
assert.equal(co.status, 200); assert.equal(co.name, 'Webb Design ' + sfx); const coId = co.id; ok('create company');
assert.equal((await call('PUT', '/company', { name: 'Webb Design ' + sfx }, T.c)).status, 409); ok('company name must be unique');
const list = await call('GET', '/companies?q=websites'); assert.ok(list.companies.some(c => c.id === coId)); ok('company search');
assert.ok(!JSON.stringify(list).includes('owner_id')); ok('company list does not expose owner');

// --- beställning ---
assert.equal((await call('POST', '/orders', { companyId: coId, brief: 'I want a nice bakery website' }, T.o)).status, 400); ok('cannot order from own company');
assert.equal((await call('POST', '/orders', { companyId: coId, brief: 'short' }, T.c)).status, 400); ok('brief must be real');
assert.equal((await call('POST', '/orders', { companyId: coId, brief: 'I want a nice bakery website in Uppsala', title: 'Bakery', customerName: 'Emma', size: 'small' })).status, 401); ok('ordering needs sign-in');
const ord = await call('POST', '/orders', { companyId: coId, brief: 'I want a nice bakery website in Uppsala', title: 'Bakery', customerName: 'Emma', size: 'small' }, T.c);
assert.equal(ord.status, 200); const id = ord.order.id; ok('create order');
assert.equal((await call('GET', '/orders/' + id, undefined, T.s)).status, 404); ok('outsider cannot read the order');
assert.equal((await call('GET', '/orders/' + id + '/messages', undefined, T.s)).status, 404); ok('outsider cannot read messages');
assert.equal((await call('POST', '/orders/' + id + '/messages', { text: 'hi' }, T.s)).status, 404); ok('outsider cannot post messages');
const ol = await call('GET', '/company/orders', undefined, T.o); assert.equal(ol.orders.length, 1); assert.equal(ol.orders[0].customer, 'Emma'); ok('owner sees the order');
assert.equal((await call('GET', '/company/orders', undefined, T.s)).orders.length, 0); ok('other users see no company orders');
assert.equal((await call('GET', '/orders', undefined, T.c)).orders.length, 1); ok('customer sees own orders');

// --- behörigheter och ordning ---
assert.equal((await call('POST', '/orders/' + id + '/status', { status: 'variants_run' }, T.c)).status, 403); ok('customer cannot change status');
assert.equal((await call('POST', '/orders/' + id + '/choose', { variantId: 'v1' }, T.o)).status, 403); ok('owner cannot choose for the customer');
assert.equal((await call('POST', '/orders/' + id + '/status', { status: 'delivered' }, T.o)).status, 409); ok('cannot skip to delivered');
assert.equal((await call('POST', '/orders/' + id + '/status', { status: 'variants_run' }, T.o)).status, 200); ok('owner starts the proposals');
assert.equal((await call('POST', '/orders/' + id + '/status', { status: 'variants_shown' }, T.o)).status, 409); ok('cannot show proposals before they exist');
const vs = [1, 2, 3, 4].map(i => ({ id: 'v' + i, name: 'Design ' + i, idea: 'Idea ' + i, palette: ['#fff', '#000'], html: html('Variant ' + i), internal: { check: { ok: true }, review: { by: 'Ebba', approved: true } } }));
assert.equal((await call('PUT', '/orders/' + id + '/variants', { variants: vs }, T.c)).status, 403); ok('customer cannot upload proposals');
assert.equal((await call('PUT', '/orders/' + id + '/variants', { variants: [{ id: 'v1', name: 'x', html: '<p>no</p>' }] }, T.o)).status, 400); ok('tiny proposals rejected');
assert.equal((await call('PUT', '/orders/' + id + '/variants', { variants: vs }, T.o)).status, 200); ok('owner uploads 4 proposals');
assert.equal((await call('POST', '/orders/' + id + '/status', { status: 'variants_report', report: { by: 'Tomas', text: 'All four are ready.', approved: true, kind: 'variants' } }, T.o)).status, 200); ok('report to owner');
let c1 = await call('GET', '/orders/' + id, undefined, T.c); assert.equal(c1.order.variants, undefined); ok('customer does NOT see proposals before they are shown');
let o1 = await call('GET', '/orders/' + id, undefined, T.o); assert.equal(o1.order.variants.length, 4); assert.ok(o1.order.variants[0].internal); ok('owner sees proposals with internal review');
assert.equal((await call('POST', '/orders/' + id + '/choose', { variantId: 'v2' }, T.c)).status, 409); ok('cannot choose before they are shown');
assert.equal((await call('POST', '/orders/' + id + '/status', { status: 'variants_shown' }, T.o)).status, 200); ok('owner shows proposals');
c1 = await call('GET', '/orders/' + id, undefined, T.c); assert.equal(c1.order.variants.length, 4); assert.equal(c1.order.variants[0].internal, undefined); assert.ok(c1.order.variants[0].html); ok('customer sees 4 proposals without internal notes');
assert.equal((await call('POST', '/orders/' + id + '/choose', { variantId: 'nope' }, T.c)).status, 400); ok('unknown proposal rejected');
assert.equal((await call('POST', '/orders/' + id + '/choose', { variantId: 'v2', note: 'greener button please' }, T.c)).status, 200); ok('customer chooses');
const ro = await call('GET', '/orders/' + id, undefined, T.o); assert.equal(ro.order.status, 'chosen'); assert.equal(ro.order.chosen, 'v2'); assert.equal(ro.order.choiceNote, 'greener button please'); ok('owner sees the choice');
assert.equal((await call('PUT', '/orders/' + id + '/variants', { variants: vs }, T.o)).status, 409); ok('proposals are locked after the choice');
assert.equal((await call('POST', '/orders/' + id + '/status', { status: 'build_run' }, T.o)).status, 200); ok('owner starts the build');
const files = { 'index.html': html('Final'), 'style.css': 'body{margin:0}' };
assert.equal((await call('PUT', '/orders/' + id + '/files', { files: { '../evil.html': 'x', 'index.html': html('x') } }, T.o)).status, 400); ok('bad file names rejected');
assert.equal((await call('PUT', '/orders/' + id + '/files', { files: { 'style.css': 'x' } }, T.o)).status, 400); ok('index.html is required');
assert.equal((await call('PUT', '/orders/' + id + '/files', { files }, T.o)).status, 200); ok('owner uploads files');
assert.equal((await call('POST', '/orders/' + id + '/status', { status: 'build_report', report: { by: 'Tomas', text: 'Built and checked.', approved: true, kind: 'build' } }, T.o)).status, 200); ok('build report');
c1 = await call('GET', '/orders/' + id, undefined, T.c); assert.equal(c1.order.files, undefined); ok('customer does NOT get files before delivery');
assert.equal((await call('POST', '/orders/' + id + '/status', { status: 'delivered' }, T.o)).status, 200); ok('owner delivers');
c1 = await call('GET', '/orders/' + id, undefined, T.c); assert.equal(Object.keys(c1.order.files).length, 2); ok('customer gets the files after delivery');

// --- meddelanden ---
const m1 = await call('POST', '/orders/' + id + '/messages', { text: 'Thank you!' }, T.c); assert.equal(m1.message.from, 'customer'); ok('customer message');
const m2 = await call('POST', '/orders/' + id + '/messages', { text: 'You are welcome.' }, T.o); assert.equal(m2.message.from, 'owner'); ok('owner message');
const ml = await call('GET', '/orders/' + id + '/messages', undefined, T.c); assert.ok(ml.messages.length >= 3); ok('message list');
const after = await call('GET', '/orders/' + id + '/messages?after=' + m1.message.id, undefined, T.o); assert.equal(after.messages.length, 1); ok('messages after an id');

// --- utloggning ---
assert.equal((await call('POST', '/logout', {}, T.s)).status, 200); assert.equal((await call('GET', '/me', undefined, T.s)).status, 401); ok('logout kills the token');
console.log('\nALL ' + n + ' CHECKS PASSED');
