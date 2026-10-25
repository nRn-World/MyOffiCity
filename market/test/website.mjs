// Hemsida och organisationsnummer: node test/website.mjs [BASE]
import './_email.mjs';
const BASE = process.argv[2] || 'http://localhost:8799', local = BASE.includes('localhost');
let ok = 0, fail = 0; const check = (n, c) => { c ? ok++ : (fail++, console.log('FAIL', n)); };
const ip = () => '10.6.' + Math.floor(Math.random() * 250) + '.' + Math.floor(Math.random() * 250);
const call = async (m, p, tok, body) => { const r = await fetch(BASE + '/api' + p, { method: m, headers: { 'Content-Type': 'application/json', ...(local ? { 'CF-Connecting-IP': ip() } : {}), ...(tok ? { Authorization: 'Bearer ' + tok } : {}) }, body: body ? JSON.stringify(body) : undefined }); return { s: r.status, b: await r.json().catch(() => ({})) }; };
const nm = 'web' + Date.now().toString(36);
const u = await call('POST', '/register', null, { username: nm, password: 'long-enough-pw-1' });
const c1 = await call('PUT', '/company', u.b.token, { name: 'Webb ' + nm, website: 'example.se', orgNo: '556123-4567' });
check('hemsida får https och sparas', c1.s === 200 && c1.b.website === 'https://example.se/' && c1.b.orgNo === '556123-4567');
check('javascript: avvisas', (await call('PUT', '/company', u.b.token, { name: 'Webb ' + nm, website: 'javascript:alert(1)' })).s === 400);
check('ogiltigt org.nr avvisas', (await call('PUT', '/company', u.b.token, { name: 'Webb ' + nm, orgNo: '<x>' })).s === 400);
const c2 = await call('PUT', '/company', u.b.token, { name: 'Webb ' + nm, tagline: 'ändrad av appen' });
check('anrop utan fälten (appen) ändrar inte hemsida/org.nr', c2.b.website === 'https://example.se/' && c2.b.orgNo === '556123-4567');
const c3 = await call('PUT', '/company', u.b.token, { name: 'Webb ' + nm, website: '', orgNo: '' });
check('tomma fält tar bort dem', c3.b.website === '' && c3.b.orgNo === '');
console.log(fail ? `FAILED ${fail}, ok ${ok}` : `WEBSITE TEST PASSED (${ok})`); process.exit(fail ? 1 : 0);
