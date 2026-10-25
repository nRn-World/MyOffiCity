// Fas 3: sök, taggar, betyg, återställningskod, lösenordsbyte, e-post.
import './_email.mjs';
//   Lokalt (med DEV_MAIL=1):  BASE=http://localhost:8799 node test/e2e3.mjs
//   Drift: e-poststeg hoppas över automatiskt om servern saknar e-postleverantör.
import assert from 'node:assert/strict';
const BASE = process.env.BASE || 'http://localhost:8799';
const LOCAL = BASE.includes('localhost');
const sfx = Math.random().toString(36).slice(2, 7);
const IP = '10.' + [1, 2, 3].map(() => Math.floor(Math.random() * 250)).join('.');
let n = 0;
async function call(method, path, body, token) {
  const res = await fetch(BASE + '/api' + path, {
    method, headers: { 'Content-Type': 'application/json', ...(LOCAL ? { 'CF-Connecting-IP': path === '/register' ? '10.' + [1, 2, 3].map(() => Math.floor(Math.random() * 250)).join('.') : IP } : {}), ...(token ? { Authorization: 'Bearer ' + token } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { ...(await res.json().catch(() => ({}))), status: res.status };
}
const ok = (name) => console.log('  ok', ++n, name);
const PW = 'correct-horse-battery', PW2 = 'another-long-password-9';
const html = (t) => '<!DOCTYPE html><html><head><meta charset="utf-8"><title>' + t + '</title></head><body><h1>' + t + '</h1>' + '<p>x</p>'.repeat(60) + '</body></html>';
const reg = async (name, extra = {}) => { const r = await call('POST', '/register', { username: name + '_' + sfx, password: PW, ...extra }); assert.equal(r.status, 200, name + ' ' + JSON.stringify(r)); return r; };
const mails = async (to) => (await call('GET', '/dev/outbox?to=' + encodeURIComponent(to))).mails || [];
const linkToken = (body) => /token=([A-Za-z0-9_-]+)/.exec(body)[1];

// --- registrering: återställningskod och e-post ---
const emailA = 'a_' + sfx + '@example.com';
const a = await reg('alice', { email: emailA });
assert.match(a.recoveryCode, /^[A-Z2-9]{4}(-[A-Z2-9]{4}){4}$/); ok('registration returns a recovery code');
assert.ok(!JSON.stringify(a).includes('recovery_hash')); ok('hash is never returned');
assert.equal((await call('POST', '/register', { username: 'dup_' + sfx, password: PW, email: emailA })).status, 409); ok('email already used is rejected');
assert.equal((await call('POST', '/register', { username: 'bad_' + sfx, password: PW, email: 'not-an-email' })).status, 400); ok('bad email is rejected');
const me = await call('GET', '/me', undefined, a.token); assert.equal(me.user.email, emailA); assert.equal(me.user.emailVerified, false); ok('/me shows the email and that it is unverified');
const MAIL = !!me.features.email;
console.log('  (mail provider:', MAIL ? 'yes' : 'no, mail steps skipped', ')');

// --- e-postverifiering ---
if (MAIL && LOCAL) {
  const m = await mails(emailA); assert.ok(m.length >= 1 && /verify\?token=/.test(m[0].body)); ok('verification mail was sent');
  const tok = linkToken(m[0].body);
  assert.equal((await call('POST', '/email/verify', { token: 'x'.repeat(30) })).status, 400); ok('bad verify token rejected');
  assert.equal((await call('POST', '/email/verify', { token: tok })).status, 200); ok('verify email');
  assert.equal((await call('POST', '/email/verify', { token: tok })).status, 400); ok('verify link is single use');
  assert.equal((await call('GET', '/me', undefined, a.token)).user.emailVerified, true); ok('email now verified');

  // --- glömt lösenord via e-post ---
  const before = (await mails('nobody_' + sfx + '@example.com')).length;
  assert.equal((await call('POST', '/password/forgot', { email: 'nobody_' + sfx + '@example.com' })).status, 200); ok('forgot for unknown email answers the same');
  assert.equal((await mails('nobody_' + sfx + '@example.com')).length, before); ok('and sends nothing');
  assert.equal((await call('POST', '/password/forgot', { email: emailA })).status, 200);
  await new Promise(r => setTimeout(r, 600));
  const rm = (await mails(emailA)).find(x => /reset\?token=/.test(x.body)); assert.ok(rm); ok('reset mail was sent');
  const rt = linkToken(rm.body);
  assert.equal((await call('POST', '/password/reset', { token: rt, newPassword: 'short' })).status, 400); ok('weak new password rejected without burning the link');
  const rr = await call('POST', '/password/reset', { token: rt, newPassword: PW2 }); assert.equal(rr.status, 200); assert.ok(rr.token); ok('reset password with the mailed link');
  assert.equal((await call('POST', '/password/reset', { token: rt, newPassword: PW2 + 'x' })).status, 400); ok('reset link is single use');
  assert.equal((await call('GET', '/me', undefined, a.token)).status, 401); ok('old sessions are logged out after a reset');
  assert.equal((await call('POST', '/login', { username: 'alice_' + sfx, password: PW })).status, 401); ok('old password no longer works');
  assert.equal((await call('POST', '/login', { username: 'alice_' + sfx, password: PW2 })).status, 200); ok('new password works');
} else {
  assert.equal((await call('POST', '/password/forgot', { email: emailA })).status, 200); ok('forgot answers 200 even without a mail provider');
}
assert.equal((await call('GET', '/dev/outbox?to=x')).status, LOCAL ? 200 : 404); ok(LOCAL ? 'dev outbox exists locally' : 'dev outbox does NOT exist in production');

// --- återställningskod ---
const b = await reg('bob');
assert.equal((await call('POST', '/password/recover', { username: 'bob_' + sfx, recoveryCode: 'AAAA-BBBB-CCCC-DDDD-EEEE', newPassword: PW2 })).status, 401); ok('wrong recovery code rejected');
assert.equal((await call('POST', '/password/recover', { username: 'nobody_' + sfx, recoveryCode: b.recoveryCode, newPassword: PW2 })).status, 401); ok('wrong username rejected');
assert.equal((await call('POST', '/password/recover', { username: 'bob_' + sfx, recoveryCode: b.recoveryCode, newPassword: 'tiny' })).status, 400); ok('weak password rejected');
const rc = await call('POST', '/password/recover', { username: 'bob_' + sfx, recoveryCode: b.recoveryCode.toLowerCase().replace(/-/g, ' '), newPassword: PW2 });
assert.equal(rc.status, 200); assert.ok(rc.recoveryCode && rc.recoveryCode !== b.recoveryCode); ok('recover with the code (spaces and lowercase are fine)');
assert.equal((await call('POST', '/password/recover', { username: 'bob_' + sfx, recoveryCode: b.recoveryCode, newPassword: PW })).status, 401); ok('a used recovery code cannot be reused');
assert.equal((await call('GET', '/me', undefined, b.token)).status, 401); ok('old sessions logged out after recovery');
assert.equal((await call('POST', '/login', { username: 'bob_' + sfx, password: PW2 })).status, 200); ok('login with the recovered password');

// --- byta lösenord / ny återställningskod ---
const c = await reg('carol');
assert.equal((await call('POST', '/password/change', { oldPassword: 'wrong-wrong-1', newPassword: PW2 }, c.token)).status, 403); ok('wrong current password rejected');
assert.equal((await call('GET', '/me', undefined, c.token)).status, 200); ok('...and the session stays valid');
const ch = await call('POST', '/password/change', { oldPassword: PW, newPassword: PW2 }, c.token); assert.equal(ch.status, 200); ok('change password');
assert.equal((await call('GET', '/me', undefined, c.token)).status, 401); ok('old token dies');
assert.equal((await call('GET', '/me', undefined, ch.token)).status, 200); ok('new token works');
assert.equal((await call('POST', '/recovery', { password: 'nope-nope-nope' }, ch.token)).status, 403); ok('new recovery code needs the password');
const nr = await call('POST', '/recovery', { password: PW2 }, ch.token); assert.ok(nr.recoveryCode && nr.recoveryCode !== c.recoveryCode); ok('new recovery code issued');
assert.equal((await call('POST', '/password/recover', { username: 'carol_' + sfx, recoveryCode: c.recoveryCode, newPassword: PW })).status, 401); ok('the old recovery code stops working');

// --- e-post på befintligt konto ---
assert.equal((await call('POST', '/email', { email: 'c_' + sfx + '@example.com', password: 'wrong-wrong-1' }, ch.token)).status, 403); ok('changing email needs the password');
assert.equal((await call('POST', '/email', { email: emailA, password: PW2 }, ch.token)).status, 409); ok('cannot take someone else\'s email');
assert.equal((await call('POST', '/email', { email: 'c_' + sfx + '@example.com', password: PW2 }, ch.token)).status, 200); ok('set email on an existing account');
assert.equal((await call('GET', '/me', undefined, ch.token)).user.email, 'c_' + sfx + '@example.com'); ok('email saved');

// --- företag: taggar, sök, sortering, sidor ---
const owners = [];
const defs = [
  { n: 'owa', name: 'Pixel Forge ' + sfx, tagline: 'Landing pages that convert', tags: ['web', 'design'], services: [{ title: 'Landing page', price: '49 USD', desc: 'One page' }] },
  { n: 'owb', name: 'Logo Lab ' + sfx, tagline: 'Brand identity', tags: ['logo', 'design', 'Brand!'], services: [{ title: 'Logo pack', price: '29 USD', desc: 'Three logos' }] },
  { n: 'owc', name: 'Text Smith ' + sfx, tagline: 'Copywriting in Swedish', tags: ['text'], services: [{ title: 'Website copy', price: '99 USD', desc: 'Words' }] },
];
for (const d of defs) {
  const u = await reg(d.n);
  const co = await call('PUT', '/company', { name: d.name, tagline: d.tagline, description: 'We do ' + d.tagline, tags: d.tags, services: d.services }, u.token);
  assert.equal(co.status, 200); owners.push({ ...u, co });
}
assert.deepEqual(owners[1].co.tags, ['logo', 'design', 'brand']); ok('tags are normalised');
const find = async (qs) => (await call('GET', '/companies?' + qs)).companies.filter(x => x.name.endsWith(sfx));
assert.equal((await find('q=landing')).length, 1); ok('search by tagline word');
assert.equal((await find('q=logo+three')).length, 1); ok('search with several words (services text too)');
assert.equal((await find('q=zzzzqqq')).length, 0); ok('search with no match');
assert.equal((await find('tag=design')).length, 2); ok('filter by tag');
assert.equal((await find('tag=design&q=logo')).length, 1); ok('tag + text');
assert.ok((await call('GET', '/tags')).tags.some(t => t.tag === 'design' && t.n >= 2)); ok('tag list with counts');
const newest = await find('sort=new'); assert.equal(newest[0].name, 'Text Smith ' + sfx); ok('sort by newest');
const pg = await call('GET', '/companies?page=1'); assert.ok(pg.pages >= 1 && pg.total >= 3); ok('pagination fields');

// --- beställning -> leverans -> betyg ---
const cust = await reg('dave');
const target = owners[0], tok = target.token;
const ord = await call('POST', '/orders', { companyId: target.co.id, brief: 'I need a landing page for my new bakery please', size: 'small' }, cust.token); assert.equal(ord.status, 200);
const id = ord.order.id;
assert.equal((await call('POST', '/orders/' + id + '/review', { stars: 5 }, cust.token)).status, 409); ok('cannot rate before delivery');
await call('POST', '/orders/' + id + '/status', { status: 'variants_run' }, tok);
await call('PUT', '/orders/' + id + '/variants', { variants: [1, 2].map(i => ({ id: 'v' + i, name: 'D' + i, idea: 'i', html: html('V' + i) })) }, tok);
await call('POST', '/orders/' + id + '/status', { status: 'variants_shown' }, tok);
await call('POST', '/orders/' + id + '/choose', { variantId: 'v1' }, cust.token);
await call('POST', '/orders/' + id + '/status', { status: 'build_run' }, tok);
await call('PUT', '/orders/' + id + '/files', { files: { 'index.html': html('Final') } }, tok);
await call('POST', '/orders/' + id + '/status', { status: 'build_report', report: { by: 'T', text: 'ok' } }, tok);
assert.equal((await call('POST', '/orders/' + id + '/status', { status: 'delivered' }, tok)).status, 200); ok('order delivered');
assert.equal((await call('POST', '/orders/' + id + '/review', { stars: 6 }, cust.token)).status, 400); ok('6 stars rejected');
assert.equal((await call('POST', '/orders/' + id + '/review', { stars: 4, text: 'x' }, tok)).status, 403); ok('the owner cannot rate their own work');
assert.equal((await call('POST', '/orders/' + id + '/review', { stars: 4, text: 'x' }, spyToken())).status, 404); ok('an outsider cannot rate');
function spyToken() { return owners[2].token; }
assert.equal((await call('POST', '/orders/' + id + '/review', { stars: 4, text: 'Nice and fast, thanks!' }, cust.token)).status, 200); ok('customer rates the work');
let prof = await call('GET', '/companies/' + target.co.id); assert.equal(prof.company.rating.count, 1); assert.equal(prof.company.rating.avg, 4); assert.equal(prof.company.done, 1); assert.equal(prof.reviews[0].text, 'Nice and fast, thanks!'); ok('profile shows rating, finished jobs and the review');
assert.ok(!JSON.stringify(prof).includes(cust.user.id) && !JSON.stringify(prof).includes('customer_id')); ok('reviews do not expose account ids');
assert.equal((await call('POST', '/orders/' + id + '/review', { stars: 5, text: 'Even better after a week' }, cust.token)).status, 200);
prof = await call('GET', '/companies/' + target.co.id); assert.equal(prof.company.rating.count, 1); assert.equal(prof.company.rating.avg, 5); ok('a rating can be updated (still one per order)');
assert.equal((await call('GET', '/orders/' + id, undefined, cust.token)).order.review.stars, 5); ok('order shows the review to the customer');
assert.equal((await call('GET', '/orders/' + id, undefined, tok)).order.review.stars, 5); ok('and to the owner');
const best = await find('sort=rating'); assert.equal(best[0].name, 'Pixel Forge ' + sfx); ok('sort by rating puts the rated company first');
console.log('\nPHASE 3: ALL ' + n + ' CHECKS PASSED');
