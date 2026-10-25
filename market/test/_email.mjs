// Registrering kräver e-post: lägger automatiskt till en testadress i anrop som saknar den.
const f = globalThis.fetch;
globalThis.fetch = (u, o) => { if (String(u).endsWith('/api/register') && o && typeof o.body === 'string') { try { const b = JSON.parse(o.body); if (b.username && b.username.length > 2 && !('email' in b)) { b.email = b.username + '@example.com'; o = { ...o, body: JSON.stringify(b) }; } } catch { /* */ } } return f(u, o); };
