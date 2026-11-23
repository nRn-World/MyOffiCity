/* nRn Company – rena hjälpfunktioner för AI-svar. Testas i test/core.test.js. */
const Core = (() => {
  // Plockar ut det första giltiga JSON-objektet ur ett modellsvar, även om
  // modellen skriver förklaringar, kodstaket eller klammer i löptext.
  function balanced(text, start) {
    let depth = 0, inStr = false, esc = false;
    for (let i = start; i < text.length; i++) {
      const ch = text[i];
      if (inStr) {
        if (esc) esc = false;
        else if (ch === '\\') esc = true;
        else if (ch === '"') inStr = false;
        continue;
      }
      if (ch === '"') { inStr = true; continue; }
      if (ch === '{') depth++;
      else if (ch === '}') {
        depth--;
        if (depth === 0) return text.slice(start, i + 1);
        if (depth < 0) return null;
      }
    }
    return null;
  }

  function parse(text) {
    const s = String(text ?? '');
    const candidates = [];
    const fence = /```(?:json|javascript|js)?\s*([\s\S]*?)```/gi;
    let m;
    while ((m = fence.exec(s))) candidates.push(m[1].trim());
    let at = -1, count = 0;
    while (count < 40 && (at = s.indexOf('{', at + 1)) >= 0) {
      count++;
      const json = balanced(s, at);
      if (json) candidates.push(json);
    }
    for (const c of candidates) {
      try {
        const v = JSON.parse(c.trim());
        if (v && typeof v === 'object' && !Array.isArray(v)) return v;
      } catch { /* prova nästa kandidat */ }
    }
    return null;
  }

  const bool = v => (v === true || v === 'true' ? true : v === false || v === 'false' ? false : null);
  const str = (v, max) => String(v ?? '').slice(0, max);

  function plan(v) {
    if (!v || typeof v !== 'object') return null;
    const assignments = (Array.isArray(v.assignments) ? v.assignments : [])
      .map(a => ({ to: str(a && a.to, 80).trim(), task: str(a && a.task, 4000).trim() }))
      .filter(a => a.to && a.task);
    const text = str(v.plan, 4000).trim();
    if (!assignments.length && !text) return null;
    return { plan: text, assignments };
  }

  function review(v) {
    if (!v || typeof v !== 'object') return null;
    const approved = bool(v.approved);
    if (approved === null) return null;
    return { approved, feedback: str(v.feedback, 4000).trim() };
  }

  function decision(v) {
    if (!v || typeof v !== 'object') return null;
    const notify = bool(v.notify);
    if (notify === null) return null;
    return { notify, message: str(v.message, 8000).trim() };
  }

  function files(v) {
    if (!v || typeof v !== 'object' || !Array.isArray(v.files)) return null;
    const out = [];
    for (const f of v.files) {
      if (!f || typeof f.path !== 'string') continue;
      const action = ['create', 'update', 'delete'].includes(f.action) ? f.action : 'update';
      out.push({ path: f.path, action, content: typeof f.content === 'string' ? f.content : '' });
    }
    return { summary: str(v.summary, 2000).trim(), files: out };
  }

  function tierFor(pin, pout) {
    if (pin <= 0 && pout <= 0) return 0;
    if (pin <= 1) return 0;
    if (pin <= 10) return 1;
    return 2;
  }

  // Daglig granskning: modellen svarar med fynd och en rekommendation per fynd.
  // Allt saneras här så att varken okända fält eller hemliga filvägar tar sig in.
  function audit(v) {
    if (!v || typeof v !== 'object') return null;
    const kinds = ['bug', 'improvement', 'idea'];
    const severities = ['low', 'medium', 'high'];
    const actions = ['fix', 'skip'];
    const findings = [];
    const raw = Array.isArray(v.findings) ? v.findings.slice(0, 12) : [];
    for (const f of raw) {
      if (!f || typeof f !== 'object') continue;
      const title = str(f.title, 300).trim();
      if (!title) continue;
      const kind = String(f.kind || '').toLowerCase();
      const severity = String(f.severity || '').toLowerCase();
      const action = String(f.action || '').toLowerCase();
      const files = (Array.isArray(f.files) ? f.files : [])
        .map(x => str(x, 300).trim())
        .filter(x => x && !x.startsWith('/') && !x.split('/').includes('..') && !/^\.env/i.test(x))
        .slice(0, 20);
      findings.push({
        title,
        kind: kinds.includes(kind) ? kind : 'improvement',
        severity: severities.includes(severity) ? severity : 'medium',
        action: actions.includes(action) ? action : 'skip',
        reason: str(f.reason, 2000).trim(),
        detail: str(f.detail, 4000).trim(),
        files,
      });
    }
    const summary = str(v.summary, 4000).trim();
    if (!summary && !findings.length) return null;
    return { summary, findings };
  }

  // Schemat är företagets lokala tid. lastRun är YYYY-MM-DD så att en dag
  // bara körs en gång, även om appen laddas om eller är öppen hela dagen.
  function routineDue(routine, hour, today) {
    if (!routine || !routine.enabled || !routine.repo) return false;
    const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(String(routine.time || '07:00'));
    const hh = m ? Number(m[1]) : 7;
    const mm = m ? Number(m[2]) : 0;
    if (!(Number(hour) >= hh + mm / 60)) return false;
    return routine.lastRun !== today;
  }

  // Skift: flera uppdrag per dag (r.runs 2-5). Nästa startar när klockslaget passerat, dagens kvot inte är full
  // och minst en minut gått sedan förra uppdraget. Med runs < 2 gäller den vanliga dagsrutinen.
  function shiftDue(r, hour, today, now) {
    if (!r || !r.enabled || !r.repo) return false;
    const runs = Math.max(1, Math.min(5, Number(r.runs) || 1));
    if (runs < 2) return routineDue(r, hour, today);
    const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(String(r.time || '07:00'));
    const at = (m ? Number(m[1]) : 7) + (m ? Number(m[2]) : 0) / 60;
    if (!(Number(hour) >= at)) return false;
    const done = r.shiftDate === today ? Number(r.shiftDone) || 0 : 0;
    if (done >= runs) return false;
    return Number(now) - (Number(r.lastAt) || 0) >= 60000;
  }

  function reportCounts(findings) {
    const list = Array.isArray(findings) ? findings : [];
    const fixed = list.filter(f => f && f.status === 'fixed').length;
    return { found: list.length, fixed, skipped: list.length - fixed };
  }

  function validState(s) {
    if (!s || typeof s !== 'object') return false;
    if (typeof s.company !== 'string' || !s.company.trim()) return false;
    if (!['loft', 'kontor', 'hq'].includes(s.tier)) return false;
    for (const key of ['employees', 'projects', 'ledger', 'revenue']) {
      if (!Array.isArray(s[key])) return false;
    }
    return s.employees.every(e => e && typeof e.id === 'string' && typeof e.name === 'string'
      && typeof e.model === 'string' && ['leader', 'lead', 'worker'].includes(e.rank));
  }

  function summarizeChanges(beforeFiles, afterFiles, maxLines = 120) {
    const before = new Map((beforeFiles || []).map(f => [f.path, String(f.content || '')]));
    const out = [];
    for (const f of (afterFiles || [])) {
      if (!f || !f.path) continue;
      const prev = before.get(f.path);
      const next = String(f.content || '');
      if (prev === undefined) {
        out.push(`+ NEW ${f.path} (${next.split('\n').length} lines)`);
      } else if (prev !== next) {
        const pLines = prev.split('\n'), nLines = next.split('\n');
        const changed = [];
        const len = Math.max(pLines.length, nLines.length);
        for (let i = 0; i < len && changed.length < maxLines; i++) {
          if (pLines[i] !== nLines[i]) {
            if (pLines[i] !== undefined) changed.push(`- ${i + 1}: ${pLines[i]}`);
            if (nLines[i] !== undefined) changed.push(`+ ${i + 1}: ${nLines[i]}`);
          }
        }
        out.push(`~ MOD ${f.path}\n${changed.join('\n')}`);
      }
    }
    return out.join('\n\n');
  }

  function mergeProjectMemory(memory, note, maxItems = 12) {
    const list = Array.isArray(memory) ? memory.filter(x => typeof x === 'string' && x.trim()) : [];
    const clean = typeof note === 'string' ? note.trim() : '';
    if (!clean || list.includes(clean)) return list.slice(-maxItems);
    return [...list, clean].slice(-maxItems);
  }

  return { parse, plan, review, decision, files, audit, routineDue, shiftDue, reportCounts, tierFor, validState, summarizeChanges, mergeProjectMemory };
})();
if (typeof module !== 'undefined') module.exports = Core;
