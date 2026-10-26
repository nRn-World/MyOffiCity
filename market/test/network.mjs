// Stadsdelen: tomter, delningsnivåer och öppna uppdrag. Kör mot lokal Worker:
//   node test/network.mjs [BASE]
import './_email.mjs';
const BASE = process.argv[2] || 'http://localhost:8799', local = BASE.includes('localhost');
let ok = 0, fail = 0;
const check = (n, c) => { c ? ok++ : (fail++, console.log('FAIL', n)); };
const ip = () => '10.7.' + Math.floor(Math.random() * 250) + '.' + Math.floor(Math.random() * 250);
const call = async (m, p, tok, body) => {
  const r = await fetch(BASE + '/api' + p, { method: m, headers: { 'Content-Type': 'application/json', ...(local ? { 'CF-Connecting-IP': ip() } : {}), ...(tok ? { Authorization: 'Bearer ' + tok } : {}) }, body: body ? JSON.stringify(body) : undefined });
  return { s: r.status, b: await r.json().catch(() => ({})) };
};
const sfx = Date.now().toString(36).slice(-5);
const mk = async (name) => {
  const u = await call('POST', '/register', null, { username: name + sfx, password: 'long-enough-pw-1' });
  const c = await call('PUT', '/company', u.b.token, { name: 'Nät ' + name + ' ' + sfx, description: 'Testar stadsdelen.', services: [{ title: 'Landing page', price: '49 USD', desc: 'En sida' }], tags: ['webb', 'design'] });
  return { token: u.b.token, co: c.b };
};
const a = await mk('na'), b = await mk('nb');

/* --- grannskapet --- */
const na = await call('GET', '/network?company=' + a.co.id);
check('nätverket svarar med mitten', na.s === 200 && na.b.center && na.b.center.id === a.co.id);
check('mitten har profil och tjänster', na.b.center.services.length === 1 && na.b.center.description === 'Testar stadsdelen.');
const bInA = na.b.neighbors.find((n) => n.id === b.co.id);
check('det andra företaget är med i grannskapet', !!bInA);
check('grannar ligger nära och delar tjänster', bInA.level === 'granne' && bInA.meters <= 64 && bInA.services.length === 1);
check('grannar delar även beskrivning', typeof bInA.description === 'string' && bInA.description.length > 0);
check('inga uppdrag innan något skapats', na.b.posts.length === 0);

/* --- skapa uppdrag --- */
check('inloggning krävs för att skapa uppdrag', (await call('POST', '/collab', null, { title: 'Hjälp', brief: 'Behöver hjälp med en sajt.' })).s === 401);
check('för kort beskrivning avvisas', (await call('POST', '/collab', a.token, { title: 'Hjälp', brief: 'kort' })).s === 400);
const made = await call('POST', '/collab', a.token, { title: 'Behöver logotyp', brief: 'Vi behöver en logotyp och färgprofil till en kund. Kan du ta det?', skills: 'logo, design', budget: '79 USD' });
check('ägaren kan skapa ett uppdrag', made.s === 200 && made.b.post.id);
check('uppdraget syns hos grannen', (await call('GET', '/network?company=' + b.co.id)).b.posts.some((p) => p.id === made.b.post.id && p.companyId === a.co.id));
check('uppdraget syns inte i en annan stadsdel', !((await call('GET', '/network')).b.posts || []).some((p) => p.id === made.b.post.id));
const mine = await call('GET', '/collab', a.token);
check('ägaren listar sina öppna uppdrag', mine.b.posts.some((p) => p.id === made.b.post.id));
check('en annan ägare kan inte stänga uppdraget', (await call('DELETE', '/collab/' + made.b.post.id, b.token)).s === 404);
check('ägaren kan stänga uppdraget', (await call('DELETE', '/collab/' + made.b.post.id, a.token)).s === 200);
check('stängt uppdrag försvinner från nätverket', !(await call('GET', '/network?company=' + b.co.id)).b.posts.some((p) => p.id === made.b.post.id));

/* --- delningsnivåer --- */
const levels = ['granne', 'kvarter', 'stadsdel'];
const far = (await call('GET', '/network')).b.neighbors;
check('nivåerna följer avståndet', far.every((n) => levels.includes(n.level) && n.meters <= 248));
check('stadsdelen delar inte tjänster', far.filter((n) => n.level === 'stadsdel').every((n) => n.services === undefined));
check('kvarteret delar tjänster men inte beskrivning', far.filter((n) => n.level === 'kvarter').every((n) => n.services !== undefined && n.description === undefined));

console.log(fail ? `FAILED ${fail}, ok ${ok}` : `NETWORK TEST PASSED (${ok})`);
process.exit(fail ? 1 : 0);
