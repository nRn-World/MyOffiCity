/* MyOffiCity: lyxiga animationer. Allt är valfritt; med "minska rörelse" i systemet visas sidan stilla. */
(function () {
'use strict';
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const dark = matchMedia('(prefers-color-scheme: dark)');
const $ = (s, r = document) => r.querySelector(s);

/* 1. natthimmel: stjärnor, skyline med tindrande fönster, mjuk glöd som följer musen */
const cv = document.createElement('canvas'); cv.id = 'bgfx'; cv.setAttribute('aria-hidden', 'true'); document.body.prepend(cv);
const g = cv.getContext('2d');
let W = 0, H = 0, dpr = 1, stars = [], bl = [], mx = .5, sy = 0, raf = 0, last = 0;
const rnd = (a, b) => a + Math.random() * (b - a);
function build() {
  dpr = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight;
  cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px'; g.setTransform(dpr, 0, 0, dpr, 0, 0);
  stars = Array.from({ length: Math.round(W * H / 9000) }, () => ({ x: rnd(0, W), y: rnd(0, H * .75), r: rnd(.4, 1.5), p: rnd(0, 6.28), s: rnd(.4, 1.6) }));
  bl = []; let x = -20;
  while (x < W + 40) {   // två lager skyline
    const w = rnd(26, 70), h = rnd(H * .08, H * .34), layer = Math.random() < .5 ? 0 : 1;
    const win = []; for (let wx = 5; wx < w - 6; wx += 9) for (let wy = 10; wy < h - 6; wy += 11) if (Math.random() < .5) win.push({ x: wx, y: wy, p: rnd(0, 6.28), s: rnd(.3, 1.1), on: Math.random() });
    bl.push({ x, w, h, layer, win }); x += w * rnd(.55, .95);
  }
}
let fxW = { kind: 'clear', int: 0 }, drops = [], flash = 0, nextFlash = 0;
function makeWx() {
  const k = fxW.kind, n = k === 'snow' ? Math.round(80 + fxW.int * 170) : (k === 'rain' || k === 'thunder') ? Math.round(110 + fxW.int * 260) : 0;
  drops = Array.from({ length: n }, () => ({ x: rnd(0, W), y: rnd(0, H), s: k === 'snow' ? rnd(28, 70) : rnd(620, 980), r: k === 'snow' ? rnd(1, 2.8) : rnd(9, 18), p: rnd(0, 6.28) }));
}
addEventListener('myoffi-weather', (e) => { fxW = e.detail || { kind: 'clear', int: 0 }; makeWx(); });
function drawWx(tt) {
  if (!drops.length) return;
  const dt = .033, snow = fxW.kind === 'snow';
  if (snow) g.fillStyle = 'rgba(255,255,255,.75)'; else { g.strokeStyle = 'rgba(190,210,255,.38)'; g.lineWidth = 1; g.beginPath(); }
  for (const d of drops) {
    d.y += d.s * dt; d.x += snow ? Math.sin(tt + d.p) * .6 : 70 * dt;
    if (d.y > H) { d.y = -10; d.x = rnd(0, W); } if (d.x > W + 20) d.x = -10;
    if (snow) { g.beginPath(); g.arc(d.x, d.y, d.r, 0, 6.283); g.fill(); } else { g.moveTo(d.x, d.y); g.lineTo(d.x - 4, d.y - d.r); }
  }
  if (!snow) g.stroke();
  if (fxW.kind === 'thunder') { if (tt * 1000 > nextFlash) { flash = .55; nextFlash = tt * 1000 + 7000 + Math.random() * 9000; } if (flash > .02) { g.fillStyle = 'rgba(220,230,255,' + flash.toFixed(3) + ')'; g.fillRect(0, 0, W, H); flash *= .86; } }
}
function frame(t) {
  raf = requestAnimationFrame(frame);
  if (t - last < 33) return; last = t;   // ~30 bilder/s räcker och sparar batteri
  const tt = t / 1000; g.clearRect(0, 0, W, H);
  const glow = g.createRadialGradient(W * (.2 + mx * .6), H * .25, 0, W * (.2 + mx * .6), H * .25, Math.max(W, H) * .7);
  glow.addColorStop(0, 'rgba(233,162,76,.07)'); glow.addColorStop(.5, 'rgba(80,110,200,.05)'); glow.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = glow; g.fillRect(0, 0, W, H);
  for (const s of stars) { const a = .25 + .55 * (.5 + .5 * Math.sin(tt * s.s + s.p)); g.fillStyle = 'rgba(255,244,220,' + a.toFixed(3) + ')'; g.beginPath(); g.arc(s.x, s.y - sy * .03, s.r, 0, 6.283); g.fill(); }
  for (let layer = 0; layer < 2; layer++) {
    const off = (layer ? 18 : 0) - sy * (layer ? .06 : .03) + (mx - .5) * (layer ? -14 : -6);
    for (const b of bl) if (b.layer === layer) {
      const by = H - b.h + off; g.fillStyle = layer ? 'rgba(14,20,36,.92)' : 'rgba(22,30,52,.85)'; g.fillRect(b.x, by, b.w, b.h + 40);
      g.strokeStyle = 'rgba(217,180,106,.07)'; g.strokeRect(b.x + .5, by + .5, b.w - 1, b.h + 40);
      for (const w of b.win) { const a = .12 + .5 * Math.max(0, Math.sin(tt * w.s + w.p)) * (w.on > .45 ? 1 : .25); g.fillStyle = 'rgba(244,196,120,' + a.toFixed(3) + ')'; g.fillRect(b.x + w.x, by + w.y, 3.2, 4.2); }
    }
  }
  drawWx(tt);
}
function toggle() { cv.style.display = dark.matches ? 'block' : 'none'; cancelAnimationFrame(raf); if (dark.matches && !reduce) raf = requestAnimationFrame(frame); else if (dark.matches) { frame(100); cancelAnimationFrame(raf); } }
build(); toggle();
addEventListener('resize', () => { build(); if (dark.matches && reduce) { frame(100); cancelAnimationFrame(raf); } });
addEventListener('scroll', () => { sy = scrollY; }, { passive: true });
addEventListener('pointermove', (e) => { mx = e.clientX / Math.max(1, innerWidth); }, { passive: true });
dark.addEventListener && dark.addEventListener('change', toggle);
document.addEventListener('visibilitychange', () => { cancelAnimationFrame(raf); if (!document.hidden && dark.matches && !reduce) raf = requestAnimationFrame(frame); });

if (reduce) return;

/* 2. sidövergång och avslöjande vid scroll */
const app = $('#app');
const pg = () => { app.classList.remove('pg'); void app.offsetWidth; app.classList.add('pg'); };
addEventListener('hashchange', pg); pg();
const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .08, rootMargin: '0px 0px -6% 0px' });
const SEL = '.card,.co,.cat,.item,.var,.city-wrap,.showcase>*,h1,.city-res,#mq';
let n = 0;
function tag(root) {
  root.querySelectorAll(SEL).forEach((el) => { if (el.dataset.rv) return; el.dataset.rv = '1'; el.classList.add('rv'); el.style.setProperty('--d', (n++ % 8) * 70 + 'ms'); io.observe(el); });
}
new MutationObserver((ms) => { n = 0; ms.forEach((m) => m.addedNodes.forEach((x) => { if (x.nodeType === 1) { if (x.matches && x.matches(SEL) && !x.dataset.rv) { x.dataset.rv = '1'; x.classList.add('rv'); x.style.setProperty('--d', (n++ % 8) * 70 + 'ms'); io.observe(x); } tag(x); } })); }).observe(app, { childList: true, subtree: true });
tag(app);

/* 3. spotlight som följer musen över kort */
document.addEventListener('pointermove', (e) => {
  const c = e.target.closest && e.target.closest('.card,.co,.choose,.cat');
  if (!c) return; const r = c.getBoundingClientRect(); c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px');
}, { passive: true });

/* 4. karusellen glider sakta av sig själv, stannar vid hover/beröring */
let rail = null, dir = 1, hold = 0, pos = 0;
setInterval(() => { const r = $('#rail'); if (r !== rail) { rail = r; dir = 1; if (r) { ['pointerenter', 'pointerdown', 'wheel', 'touchstart', 'focusin'].forEach((ev) => r.addEventListener(ev, () => { hold = Date.now() + 4000; }, { passive: true })); r.addEventListener('pointerleave', () => { hold = Date.now() + 800; }); } } }, 500);
(function drift() {
  requestAnimationFrame(drift);
  if (!rail || document.hidden) return;
  if (Date.now() < hold) { pos = rail.scrollLeft; return; }
  const max = rail.scrollWidth - rail.clientWidth; if (max < 10) return;
  rail.style.scrollSnapType = 'none'; pos += dir * .6; rail.scrollLeft = pos;
  if (pos >= max - 1) dir = -1; else if (pos <= 0) dir = 1;
})();
})();
