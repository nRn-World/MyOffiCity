// Kör: node test/core.test.js
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const Core = require('../core.js');

// --- JSON-utdragning ------------------------------------------------------
assert.deepStrictEqual(Core.parse('{"a":1}'), { a: 1 });
assert.deepStrictEqual(Core.parse('Here you go:\n```json\n{"plan":"x","assignments":[{"to":"Ebba","task":"t"}]}\n```\nDone'), {
  plan: 'x', assignments: [{ to: 'Ebba', task: 't' }],
});
// klammer i löptext och i strängar får inte förstöra tolkningen
assert.deepStrictEqual(Core.parse('Use {curly} braces. Result: {"summary":"a } b { c","files":[]}'), {
  summary: 'a } b { c', files: [],
});
assert.deepStrictEqual(Core.parse('noise {"a":{"b":2}} tail'), { a: { b: 2 } });
assert.strictEqual(Core.parse('no json here'), null);
assert.strictEqual(Core.parse('{"broken": '), null);
assert.strictEqual(Core.parse('[1,2,3]'), null);
// escape:ade citattecken
assert.deepStrictEqual(Core.parse('{"feedback":"say \\"hi\\" {ok}"}'), { feedback: 'say "hi" {ok}' });

// --- validering -----------------------------------------------------------
assert.deepStrictEqual(Core.plan({ plan: 'p', assignments: [{ to: 'Kia', task: 'x' }, { to: '', task: 'y' }] }), {
  plan: 'p', assignments: [{ to: 'Kia', task: 'x' }],
});
assert.strictEqual(Core.plan(null), null);
assert.strictEqual(Core.plan({ assignments: [] }), null);
assert.deepStrictEqual(Core.review({ approved: 'false', feedback: 'fix' }), { approved: false, feedback: 'fix' });
assert.deepStrictEqual(Core.review({ approved: true }), { approved: true, feedback: '' });
assert.strictEqual(Core.review({ approved: 'maybe' }), null);
assert.deepStrictEqual(Core.decision({ notify: 'true', message: 'klart' }), { notify: true, message: 'klart' });
assert.strictEqual(Core.decision({ message: 'utan notify' }), null);
assert.deepStrictEqual(Core.files({ summary: 's', files: [{ path: 'a.md', action: 'create', content: 'x' }, { path: 3 }] }), {
  summary: 's', files: [{ path: 'a.md', action: 'create', content: 'x' }],
});
assert.strictEqual(Core.files({}), null);

// --- daglig granskning ----------------------------------------------------
const audit = Core.audit({ summary: 'Bra', findings: [
  { title: 'Fix typo', kind: 'BUG', severity: 'HIGH', action: 'FIX', reason: '', files: ['src/a.js', '../secret', '/etc/passwd', '.env'] },
  { title: '', kind: 'idea', action: 'skip' },
  { title: 'Idea', kind: 'nonsense', severity: 'huge', action: 'later', detail: 'x' },
] });
assert.deepStrictEqual(audit.findings.length, 2);
assert.deepStrictEqual(audit.findings[0], { title: 'Fix typo', kind: 'bug', severity: 'high', action: 'fix', reason: '', detail: '', files: ['src/a.js'] });
assert.strictEqual(audit.findings[1].kind, 'improvement');
assert.strictEqual(audit.findings[1].severity, 'medium');
assert.strictEqual(audit.findings[1].action, 'skip');
assert.strictEqual(Core.audit(null), null);
assert.strictEqual(Core.audit({ findings: [] }), null);
assert.strictEqual(Core.audit({ summary: 'only summary' }).findings.length, 0);
assert.deepStrictEqual(Core.reportCounts([{ status: 'fixed' }, { status: 'skipped' }, {}]), { found: 3, fixed: 1, skipped: 2 });

// --- schemaläggning -------------------------------------------------------
const routine = { enabled: true, time: '07:00', repo: 'a/b', lastRun: '' };
assert.strictEqual(Core.routineDue(routine, 6.99, '2026-10-25'), false);
assert.strictEqual(Core.routineDue(routine, 7, '2026-10-25'), true);
assert.strictEqual(Core.routineDue({ ...routine, lastRun: '2026-10-25' }, 9, '2026-10-25'), false);
assert.strictEqual(Core.routineDue({ ...routine, enabled: false }, 9, '2026-10-25'), false);
assert.strictEqual(Core.routineDue({ ...routine, repo: '' }, 9, '2026-10-25'), false);
assert.strictEqual(Core.routineDue({ ...routine, time: 'nonsense' }, 7.5, '2026-10-26'), true);
assert.strictEqual(Core.routineDue({ ...routine, time: '07:30' }, 7.4, '2026-10-26'), false);
assert.strictEqual(Core.routineDue({ ...routine, time: '07:30' }, 7.5, '2026-10-26'), true);

// --- prisnivåer -----------------------------------------------------------
assert.strictEqual(Core.tierFor(0, 0), 0);
assert.strictEqual(Core.tierFor(1, 5), 0);
assert.strictEqual(Core.tierFor(2.5, 10), 1);
assert.strictEqual(Core.tierFor(3, 15), 1);
assert.strictEqual(Core.tierFor(15, 75), 2);

// --- state-validering (import) -------------------------------------------
const good = {
  company: 'Test AB', tier: 'kontor',
  employees: [{ id: '1', name: 'Tomas', model: 'openrouter:auto', rank: 'leader' }],
  projects: [], ledger: [], revenue: [],
};
assert.strictEqual(Core.validState(good), true);
assert.strictEqual(Core.validState({ ...good, company: '  ' }), false);
assert.strictEqual(Core.validState({ ...good, tier: 'slott' }), false);
assert.strictEqual(Core.validState({ ...good, ledger: null }), false);
assert.strictEqual(Core.validState({ ...good, employees: [{ id: '1', name: 'Tomas', rank: 'boss' }] }), false);

// i18n: inga påhittade nycklar, svenska är komplett och appens alla t('...') finns på engelska
const src = fs.readFileSync(path.join(__dirname, '..', 'i18n.js'), 'utf8');
eval(src.replace(/^const I18N=/m, 'globalThis.I18N='));
eval(fs.readFileSync(path.join(__dirname, '..', 'i18n-daily.js'), 'utf8'));
eval(fs.readFileSync(path.join(__dirname, '..', 'i18n-orders.js'), 'utf8'));
for (const lang of Object.keys(I18N)) {
  const extra = Object.keys(I18N[lang]).filter(k => !(k in I18N.en));
  assert.deepStrictEqual(extra, [], `${lang} har okända nycklar: ${extra.join(', ')}`);
}
const missingSv = Object.keys(I18N.en).filter(k => !(k in I18N.sv));
assert.deepStrictEqual(missingSv, [], `sv saknar: ${missingSv.join(', ')}`);
// andra språk faller tillbaka på engelska, men får inte ha egna påhittade nycklar
const appSrc = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
const used = [...appSrc.matchAll(/\bt\('([^']+)'/g)].map(m => m[1]).filter(k => !k.endsWith('_') && k !== 'tier');
const missingEn = [...new Set(used)].filter(k => !(k in I18N.en));
assert.deepStrictEqual(missingEn, [], `en saknar: ${missingEn.join(', ')}`);
assert(I18N.en.st_rejected && I18N.sv.only_leader_chat, 'nya nycklar finns');

// skift: flera uppdrag per dag
{
  const base = { enabled: true, repo: 'a/b', time: '07:00', runs: 5, shiftDate: '2026-10-26', shiftDone: 0, lastAt: 0 };
  const D = '2026-10-26';
  assert.strictEqual(Core.shiftDue(base, 6.9, D, 1e12), false, 'före klockslaget');
  assert.strictEqual(Core.shiftDue(base, 7, D, 1e12), true, 'första uppdraget');
  assert.strictEqual(Core.shiftDue({ ...base, shiftDone: 5 }, 12, D, 1e12), false, 'kvoten full');
  assert.strictEqual(Core.shiftDue({ ...base, shiftDone: 2, lastAt: 1e12 - 1000 }, 12, D, 1e12), false, 'paus mellan uppdrag');
  assert.strictEqual(Core.shiftDue({ ...base, shiftDone: 2, lastAt: 1e12 - 120000 }, 12, D, 1e12), true, 'nästa uppdrag');
  assert.strictEqual(Core.shiftDue({ ...base, shiftDate: '2026-10-25', shiftDone: 5 }, 8, D, 1e12), true, 'ny dag nollställer kvoten');
  assert.strictEqual(Core.shiftDue({ ...base, enabled: false }, 8, D, 1e12), false, 'avstängd');
  assert.strictEqual(Core.shiftDue({ ...base, runs: 1, lastRun: D }, 8, D, 1e12), false, 'runs=1 = vanliga dagsrutinen');
  assert.strictEqual(Core.shiftDue({ ...base, runs: 1, lastRun: '' }, 8, D, 1e12), true, 'runs=1 körs en gång per dag');
}

// summarizeChanges & mergeProjectMemory
{
  const before = [{ path: 'a.js', content: 'const x = 1;\nconst y = 2;' }];
  const after = [
    { path: 'a.js', content: 'const x = 1;\nconst y = 3;' },
    { path: 'b.js', content: 'console.log(1);' }
  ];
  const diff = Core.summarizeChanges(before, after);
  assert(diff.includes('~ MOD a.js'), 'visar ändrad fil');
  assert(diff.includes('- 2: const y = 2;') && diff.includes('+ 2: const y = 3;'), 'visar ändrad rad');
  assert(diff.includes('+ NEW b.js'), 'visar ny fil');

  let mem = Core.mergeProjectMemory([], 'Använd alltid strict mode');
  mem = Core.mergeProjectMemory(mem, 'Använd alltid strict mode');
  mem = Core.mergeProjectMemory(mem, 'Undvik globala variabler');
  assert.deepStrictEqual(mem, ['Använd alltid strict mode', 'Undvik globala variabler'], 'deduplicerar minne');
}

// buildPreviewHtml, formatTestFailure, pickNeighborForSubcontract
{
  const html = Core.buildPreviewHtml([
    { path: 'index.html', content: '<html><head></head><body><h1>Hej</h1></body></html>' },
    { path: 'style.css', content: 'body{color:red}' },
    { path: 'app.js', content: 'console.log(1)' }
  ]);
  assert(html.includes('<style>body{color:red}</style>') && html.includes('<script>console.log(1)</script>'), 'bygger preview html');

  const fail = Core.formatTestFailure('node test/core.test.js', 1, 'AssertionError: expected 1 to equal 2');
  assert(fail.includes('Test failed (node test/core.test.js, exit 1)'), 'formaterar testfel');

  const pick = Core.pickNeighborForSubcontract([
    { id: 'c2', distance: 50, services: ['design', 'web'] },
    { id: 'c1', distance: 12, services: ['web', 'seo'] }
  ], 'web');
  assert.strictEqual(pick.id, 'c1', 'väljer närmaste matchande granne');
}

console.log('core.js + i18n OK');
