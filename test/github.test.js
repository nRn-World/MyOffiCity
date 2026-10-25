// Kör: node test/github.test.js  – kontrollerar github.js mot en låtsas-GitHub (inga riktiga anrop).
const fs = require('fs'), path = require('path'), assert = require('assert');
const calls = [];
globalThis.fetch = async (url, opt = {}) => {
  assert.strictEqual(url, '/api/gh', 'alla anrop går via den lokala proxyn');
  const req = JSON.parse(opt.body), m = req.method || 'GET', u = req.path, body = req.body;
  calls.push(m + ' ' + u);
  const ok = j => ({ ok: true, status: 200, statusText: 'OK', json: async () => j });
  const fail = (status, message) => ({ ok: false, status, statusText: message, json: async () => ({ error: { status, message } }) });
  if (u.includes('/git/ref/heads/nrn/new')) return fail(404, 'Not Found');
  if (u.includes('/git/ref/heads/')) return ok({ object: { sha: 'base1' } });
  if (u.includes('/git/commits/base1')) return ok({ tree: { sha: 'tree0' } });
  if (u.endsWith('/git/blobs')) {
    assert.strictEqual(Buffer.from(body.content, 'base64').toString('utf8'), 'hej åäö');
    return ok({ sha: 'blob1' });
  }
  if (u.endsWith('/git/trees')) return ok({ sha: 'tree1', _t: body });
  if (u.endsWith('/git/commits')) return ok({ sha: 'c1' });
  if (u.endsWith('/git/refs')) return ok({ ref: body.ref });
  if (u.includes('/contents/')) return ok({ encoding: 'base64', size: 5, content: Buffer.from('héllo').toString('base64') });
  return ok({});
};
eval(fs.readFileSync(path.join(__dirname, '..', 'github.js'), 'utf8') + ';globalThis.GH=GH;');
(async () => {
  // hemliga filer
  for (const p of ['.env', 'config/.env.local', 'id_rsa', 'keys/server.pem', 'secrets.json']) assert(GH.isSecret(p), p);
  assert(!GH.isSecret('src/env.ts')); assert(!GH.okPath('../x')); assert(!GH.okPath('/abs'));
  // dagliga granskningar får inte röra CI, licenser eller beroendefiler
  assert(GH.okAuditPath('src/app.js')); assert(GH.okAuditPath('docs/guide.md'));
  for (const p of ['package.json', 'pnpm-lock.yaml', '.github/workflows/deploy.yml', 'LICENSE', 'Dockerfile', 'requirements-dev.txt', 'go.mod']) assert(!GH.okAuditPath(p), p);
  // vägrar skriva utanför nrn/-gren
  await assert.rejects(GH.commitFiles('o/r', 'main', 'main', [{ path: 'a', action: 'create', content: 'x' }], 'm'));
  // ny gren: blob → tree → commit → ref; hemlig fil och ../ filtreras bort
  const r = await GH.commitFiles('o/r', 'main', 'nrn/new', [{ path: 'a.md', action: 'create', content: 'hej åäö' }, { path: '.env', action: 'update', content: 'S=1' }, { path: '../x', action: 'create', content: 'x' }], 'msg');
  assert.deepStrictEqual(r.files, ['a.md']);
  assert(calls.some(c => c === 'POST /repos/o/r/git/refs'), 'branch created');
  assert(!calls.some(c => c.includes('PATCH')), 'no force update of an existing ref');
  assert.strictEqual(await GH.readFile('o/r', 'x.txt', 'main'), 'héllo');
  assert.strictEqual(await GH.readFile('o/r', '.env', 'main'), null);
  console.log('github.js OK');
})().catch(e => { console.error(e); process.exit(1); });
