// Stadskarta + förfrågningschatt: node test/city.mjs [BASE] [--keep]  (--keep lämnar kvar testföretagen, bara lokalt)
import './_email.mjs';
const BASE = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : 'http://localhost:8799', local = BASE.includes('localhost'), keep = process.argv.includes('--keep');
const H = () => ({ 'Content-Type': 'application/json', ...(local ? { 'CF-Connecting-IP': '10.' + [1, 2, 3].map(() => Math.floor(Math.random() * 250)).join('.') } : {}) });
let ok = 0, fail = 0; const check = (n, c) => { c ? ok++ : (fail++, console.log('FAIL', n)); };
const call = async (m, p, tok, body) => { const r = await fetch(BASE + '/api' + p, { method: m, headers: { ...H(), ...(tok ? { Authorization: 'Bearer ' + tok } : {}) }, body: body ? JSON.stringify(body) : undefined }); return { s: r.status, b: await r.json().catch(() => ({})) }; };
const s = Math.random().toString(36).slice(2, 6), cos = [];
for (let i = 0; i < 4; i++) {
  const u = await call('POST', '/register', null, { username: 'city' + i + s, password: 'city-test-password-1' });
  const c = await call('PUT', '/company', u.b.token, { name: ['Nordic Pixel ', 'Blue Harbor ', 'Gold Tower ', 'Pine Studio '][i] + s, tagline: 'Websites that sell', description: 'We build fast websites for small businesses.', tags: ['web', 'design'], services: [{ title: 'Landing page', price: '49 USD' }], building: i % 3 });
  check('företag ' + i + ' med byggnad ' + (i % 3), c.s === 200 && c.b.building === i % 3);
  cos.push({ tok: u.b.token, id: c.b.id });
}
const list = await call('GET', '/companies?map=1');
check('kartlistan innehåller byggnadstyp', list.b.companies.length >= 4 && list.b.companies.every(c => [0, 1, 2].includes(c.building)));
const cust = await call('POST', '/register', null, { username: 'cust' + s, password: 'city-test-password-1' });
const own = await call('POST', '/companies/' + cos[0].id + '/inquiry', cos[0].tok);
check('ägaren kan inte chatta med sig själv', own.s === 400);
const q = await call('POST', '/companies/' + cos[0].id + '/inquiry', cust.b.token);
const q2 = await call('POST', '/companies/' + cos[0].id + '/inquiry', cust.b.token);
check('chatt skapas, samma id andra gången', q.s === 200 && q.b.id === q2.b.id);
await call('POST', '/inquiries/' + q.b.id + '/messages', cust.b.token, { text: 'Hej! Kan ni bygga en sajt åt mitt bageri?' });
check('tomt meddelande avvisas', (await call('POST', '/inquiries/' + q.b.id + '/messages', cust.b.token, { text: '  ' })).s === 400);
check('ägaren ser chatten i listan', (await call('GET', '/inquiries', cos[0].tok)).b.inquiries.some(i => i.id === q.b.id && i.role === 'owner'));
await call('POST', '/inquiries/' + q.b.id + '/messages', cos[0].tok, { text: 'Absolut, berätta mer!' });
const m = await call('GET', '/inquiries/' + q.b.id + '/messages', cust.b.token);
check('kunden ser båda meddelandena', m.b.messages.length === 2 && !m.b.messages[0].fromOwner && m.b.messages[1].fromOwner && m.b.role === 'customer');
check('after= ger bara nya', (await call('GET', '/inquiries/' + q.b.id + '/messages?after=' + m.b.messages[0].id, cust.b.token)).b.messages.length === 1);
check('utomstående nekas', (await call('GET', '/inquiries/' + q.b.id + '/messages', cos[1].tok)).s === 404);
check('utan inloggning nekas', (await call('GET', '/inquiries')).s === 401);
console.log(fail ? `FAILED ${fail}, ok ${ok}` : `CITY TEST PASSED (${ok})`);
process.exit(fail ? 1 : 0);
