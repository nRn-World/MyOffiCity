/* nRn Company – GitHub-koppling. Alla anrop går via den lokala servern (server.py),
   som håller GITHUB_TOKEN i .env. Agenterna jobbar alltid på en egen gren (nrn/…)
   och lämnar en pull request; main ändras aldrig direkt. */
const GH = (() => {
  const MAX_FILE = 200 * 1024, MAX_FILES = 40;
  // hemliga filer skickas aldrig till AI-modellerna och får aldrig ändras
  const SECRET = /(^|\/)(\.env[^/]*|[^/]*\.(pem|key|p12|pfx|keystore|jks)|id_rsa[^/]*|secrets?(\.[^/]*)?)$/i;
  // Dagliga autonoma granskningar får inte röra CI, licenser, containrar eller beroendefiler.
  const AUDIT_BLOCK = /(^|\/)(\.github|\.gitlab-ci\.yml|\.circleci|package(-lock)?\.json|yarn\.lock|pnpm-lock\.yaml|bun\.lockb|requirements[^/]*\.txt|pyproject\.toml|poetry\.lock|Pipfile(\.lock)?|go\.(mod|sum)|Cargo\.(toml|lock)|composer\.(json|lock)|Gemfile(\.lock)?|pom\.xml|build\.gradle(\.kts)?|LICENSE|COPYING|Dockerfile)(\/|$)/i;

  async function gh(path, opt = {}) {
    const payload = { method: opt.method || 'GET', path };
    if (opt.body) {
      try { payload.body = JSON.parse(opt.body); } catch { throw new Error('GitHub: ogiltig body'); }
    }
    let r;
    try {
      r = await fetch('/api/gh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      throw new Error('GitHub: ' + e.message);
    }
    if (r.status === 204) return null;
    const j = await r.json().catch(() => ({}));
    if (!r.ok || j.error) {
      const status = (j.error && j.error.status) || r.status;
      const message = (j.error && j.error.message) || r.statusText || 'fel';
      throw new Error('GitHub ' + status + ': ' + message);
    }
    return j;
  }

  const b64e = s => { const b = new TextEncoder().encode(s); let o = ''; for (let i = 0; i < b.length; i += 8192) o += String.fromCharCode(...b.subarray(i, i + 8192)); return btoa(o); };
  const b64d = s => new TextDecoder().decode(Uint8Array.from(atob(s.replace(/\n/g, '')), c => c.charCodeAt(0)));
  const enc = p => p.split('/').map(encodeURIComponent).join('/');
  const okPath = p => typeof p === 'string' && p && !p.startsWith('/') && !p.split('/').includes('..') && !SECRET.test(p);

  return {
    // behålls för bakåtkompatibilitet – token ligger nu i .env på servern
    setToken: () => {},
    hasToken: () => true,
    isSecret: p => SECRET.test(p),
    okPath,
    okAuditPath: p => okPath(p) && !AUDIT_BLOCK.test(p),
    me: () => gh('/user'),
    listRepos: () => gh('/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator'),
    createRepo: (name, priv = true) => gh('/user/repos', { method: 'POST', body: JSON.stringify({ name, private: priv, auto_init: true, description: 'Built by nRn Company' }) }),
    repo: full => gh('/repos/' + full),
    async tree(full, ref) {
      const j = await gh(`/repos/${full}/git/trees/${encodeURIComponent(ref)}?recursive=1`);
      return (j.tree || []).filter(x => x.type === 'blob').map(x => ({ path: x.path, size: x.size || 0 }));
    },
    async readFile(full, path, ref) {
      if (SECRET.test(path)) return null;
      const j = await gh(`/repos/${full}/contents/${enc(path)}?ref=${encodeURIComponent(ref)}`);
      if (!j || j.encoding !== 'base64' || j.size > MAX_FILE) return null;
      try { return b64d(j.content); } catch { return null; }
    },
    // en commit med alla ändringar på grenen newBranch (skapas från baseBranch, eller byggs vidare om den finns)
    async commitFiles(full, baseBranch, newBranch, files, message) {
      if (!/^nrn\//.test(newBranch) || newBranch === baseBranch) throw new Error('Refusing to write outside an nrn/ branch');
      files = files.filter(f => f && okPath(f.path) && (f.action === 'delete' || String(f.content ?? '').length <= MAX_FILE)).slice(0, MAX_FILES);
      if (!files.length) throw new Error('No files to commit');
      const existing = await gh(`/repos/${full}/git/ref/heads/${enc(newBranch)}`).catch(() => null);
      const parentSha = (existing || await gh(`/repos/${full}/git/ref/heads/${enc(baseBranch)}`)).object.sha;
      const parent = await gh(`/repos/${full}/git/commits/${parentSha}`);
      const tree = [];
      for (const f of files) {
        if (f.action === 'delete') { tree.push({ path: f.path, mode: '100644', type: 'blob', sha: null }); continue; }
        const b = await gh(`/repos/${full}/git/blobs`, { method: 'POST', body: JSON.stringify({ content: b64e(String(f.content ?? '')), encoding: 'base64' }) });
        tree.push({ path: f.path, mode: '100644', type: 'blob', sha: b.sha });
      }
      const nt = await gh(`/repos/${full}/git/trees`, { method: 'POST', body: JSON.stringify({ base_tree: parent.tree.sha, tree }) });
      const c = await gh(`/repos/${full}/git/commits`, { method: 'POST', body: JSON.stringify({ message, tree: nt.sha, parents: [parentSha] }) });
      if (existing) await gh(`/repos/${full}/git/refs/heads/${enc(newBranch)}`, { method: 'PATCH', body: JSON.stringify({ sha: c.sha, force: false }) });
      else await gh(`/repos/${full}/git/refs`, { method: 'POST', body: JSON.stringify({ ref: 'refs/heads/' + newBranch, sha: c.sha }) });
      return { sha: c.sha, files: tree.map(x => x.path) };
    },
    async openPR(full, head, base, title, body) {
      const open = await gh(`/repos/${full}/pulls?state=open&head=${encodeURIComponent(full.split('/')[0] + ':' + head)}`);
      if (open && open.length) return open[0];
      return gh(`/repos/${full}/pulls`, { method: 'POST', body: JSON.stringify({ title, head, base, body }) });
    },
    mergePR: (full, num) => gh(`/repos/${full}/pulls/${num}/merge`, { method: 'PUT', body: JSON.stringify({ merge_method: 'squash' }) }),
  };
})();
