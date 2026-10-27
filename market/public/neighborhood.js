/* MyOffiCity: 3D-stadsdelen.
   En självständig scen ovanpå three.js r128: kvarterets byggnader, takskyltar,
   ljuslänkar mellan företag – och ett levande stadsliv med gratis CC0-modeller
   (träd, buskar, blommor, gräs, bilar, cyklister och människor). Ju närmare två
   företag står varandra, desto starkare guldlinje – och desto mer delar de.
   API: Neighborhood.create(host, data) → { select, dispose }                        */
window.Neighborhood = (() => {
  'use strict';
  const S = 8;                                  // enheter per tomt (40 m)
  const GY = 0.02;                              // marknivå för möbler och folk
  const LEVEL = {
    granne: { color: 0xf2cd88, opacity: 0.62, radius: 0.06, pulse: 0.11 },
    kvarter: { color: 0x8dbdff, opacity: 0.26, radius: 0.032, pulse: 0.08 },
    stadsdel: { color: 0x7d93b8, opacity: 0.15, radius: 0.026, pulse: 0.07 },
  };
  const FACADE = [
    { base: '#dcc79f', trim: '#6a563c', warm: true },
    { base: '#c98d6d', trim: '#6b3f2d', warm: true },
    { base: '#cdb587', trim: '#5a4629', warm: true },
    { base: '#bcc4a6', trim: '#4d5442', warm: true },
    { base: '#b3bec2', trim: '#414c50', warm: false },
  ];
  let live = null;

  const hash = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  const rnd = (seed) => () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const shade = (hex, k) => {
    const n = parseInt(hex.slice(1), 16), r = clamp(Math.round(((n >> 16) & 255) * k), 0, 255),
      g = clamp(Math.round(((n >> 8) & 255) * k), 0, 255), b = clamp(Math.round((n & 255) * k), 0, 255);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  };

  function facadeTex(tier, seed, warmTop) {
    const T = window.THREE, r = rnd(seed), cfg = FACADE[(seed >>> 5) % FACADE.length];
    const w = 192, h = 384, mk = () => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
    const map = mk(), glow = mk(), g = map.getContext('2d'), e = glow.getContext('2d');
    const base = g.createLinearGradient(0, 0, 0, h);
    base.addColorStop(0, shade(cfg.base, warmTop ? 1.1 : 1.14));
    base.addColorStop(0.55, cfg.base);
    base.addColorStop(1, shade(cfg.base, 0.72));
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    e.fillStyle = '#000'; e.fillRect(0, 0, w, h);

    /* våningsband, puts och hörnpelare */
    for (let y = 40; y < h; y += 24) {
      g.fillStyle = 'rgba(0,0,0,.075)'; g.fillRect(0, y, w, 2);
      g.fillStyle = 'rgba(255,255,255,.07)'; g.fillRect(0, y + 2, w, 1);
    }
    const pg = g.createLinearGradient(0, 0, 13, 0);
    pg.addColorStop(0, shade(cfg.base, 1.12)); pg.addColorStop(1, shade(cfg.base, 0.86));
    g.fillStyle = pg; g.fillRect(0, 0, 13, h); g.fillRect(w - 13, 0, 13, h);
    g.fillStyle = 'rgba(255,255,255,.09)'; g.fillRect(13, 0, 1, h); g.fillRect(w - 14, 0, 1, h);

    /* fönster: 4 kolumner, tätare rytm längst ner */
    const cols = 4, padX = 20, padY = 26, cw = (w - padX * 2) / cols, ch = 24;
    const rows = Math.floor((h - padY - 46) / ch);
    for (let ry = 0; ry < rows; ry++) for (let cx = 0; cx < cols; cx++) {
      const x = padX + cx * cw + 4, y = padY + ry * ch + 3, ww = cw - 8, hh = ch - 9;
      const lit = r() < 0.16, blind = r() < 0.3;
      g.fillStyle = 'rgba(8,12,20,.6)'; g.fillRect(x - 2, y - 2, ww + 4, hh + 4);
      if (lit) {
        const wg = g.createLinearGradient(x, y, x, y + hh);
        wg.addColorStop(0, cfg.warm ? '#ffe2ad' : '#dcefff');
        wg.addColorStop(0.6, cfg.warm ? '#f2c17e' : '#bcdcf4');
        wg.addColorStop(1, cfg.warm ? '#c98f52' : '#8fb6d4');
        g.fillStyle = wg;
      } else {
        const dg = g.createLinearGradient(x, y, x + ww, y + hh);
        dg.addColorStop(0, '#5b6f78'); dg.addColorStop(0.42, '#2b3a42'); dg.addColorStop(0.52, '#7d94a0'); dg.addColorStop(1, '#1d2a31');
        g.fillStyle = dg;
      }
      g.fillRect(x, y, ww, hh);
      if (blind) { g.fillStyle = 'rgba(240,232,214,.42)'; for (let b = 3; b < hh - 2; b += 3) g.fillRect(x + 1, y + b, ww - 2, 1); }
      else { g.fillStyle = 'rgba(255,255,255,.13)'; g.fillRect(x + 1, y + 1, 2, hh - 2); }
      g.strokeStyle = cfg.trim; g.lineWidth = 1; g.strokeRect(x - 0.5, y - 0.5, ww + 1, hh + 1);
      g.fillStyle = 'rgba(255,255,255,.16)'; g.fillRect(x - 2, y + hh + 1, ww + 4, 2);
      g.fillStyle = 'rgba(0,0,0,.14)'; g.fillRect(x - 2, y - 3, ww + 4, 2);
      if (lit) {
        const eg = e.createLinearGradient(x, y, x, y + hh);
        eg.addColorStop(0, cfg.warm ? 'rgba(255,214,150,.95)' : 'rgba(186,224,255,.9)');
        eg.addColorStop(1, cfg.warm ? 'rgba(232,157,82,.55)' : 'rgba(120,172,214,.5)');
        e.fillStyle = eg; e.fillRect(x, y, ww, hh);
      }
    }

    /* bottenvåning: glasad butik/entré med varmt ljus */
    const sy = h - 44;
    g.fillStyle = 'rgba(9,14,22,.94)'; g.fillRect(8, sy, w - 16, 42);
    const sg = g.createLinearGradient(0, sy, 0, h);
    sg.addColorStop(0, 'rgba(255,214,150,.34)'); sg.addColorStop(1, 'rgba(60,40,24,.1)');
    g.fillStyle = sg; g.fillRect(10, sy + 2, w - 20, 40);
    for (let i = 1; i < 4; i++) { g.fillStyle = cfg.trim; g.fillRect(8 + i * ((w - 16) / 4), sy, 3, 42); }
    g.fillStyle = cfg.trim; g.fillRect(8, sy, w - 16, 3);
    e.fillStyle = 'rgba(255,204,140,.32)'; e.fillRect(10, sy + 4, w - 20, 38);

    const t1 = new T.CanvasTexture(map), t2 = new T.CanvasTexture(glow);
    t1.colorSpace = T.SRGBColorSpace; t2.colorSpace = T.SRGBColorSpace;
    t1.anisotropy = t2.anisotropy = 4;
    return { map: t1, emissive: t2 };
  }

  const signCache = {};
  function signTex(name) {
    if (signCache[name]) return signCache[name];
    const T = window.THREE, c = document.createElement('canvas');
    c.width = 512; c.height = 112;
    const g = c.getContext('2d');
    g.fillStyle = '#0a0f1c'; g.fillRect(0, 0, 512, 112);
    const gr = g.createLinearGradient(0, 0, 0, 112);
    gr.addColorStop(0, 'rgba(255,236,200,.09)'); gr.addColorStop(1, 'rgba(0,0,0,.25)');
    g.fillStyle = gr; g.fillRect(0, 0, 512, 112);
    g.strokeStyle = '#e6c07b'; g.lineWidth = 4; g.strokeRect(3, 3, 506, 106);
    g.fillStyle = '#f6efe2';
    g.font = '600 46px Figtree, "Segoe UI", Arial, sans-serif';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    let label = String(name || 'Company');
    while (g.measureText(label).width > 470 && label.length > 4) label = label.slice(0, -2);
    g.fillText(label, 256, 60);
    const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 4;
    signCache[name] = t;
    return t;
  }

  /* ------------------------------------------------------------------ */
  /*  gatunätet: normalgator mellan tomterna och breda avenyer mellan    */
  /*  kvarteren (datamodellen har 4×4 tomter per kvarter)                */
  /* ------------------------------------------------------------------ */
  function roadLayout(cx, cz) {
    const streets = [], avenues = [];
    const avX = [], avZ = [];
    for (let k = -10; k <= 10; k++) {
      const x = (4 + 5 * k - cx) * S, z = (4 + 5 * k - cz) * S;
      if (Math.abs(x) < 78) avX.push(x);
      if (Math.abs(z) < 78) avZ.push(z);
    }
    for (let k = -9; k <= 9; k++) {
      const c = (k + 0.5) * S;
      if (Math.abs(c) > 70) continue;
      if (!avX.some((a) => Math.abs(a - c) < 3.2)) streets.push({ c, axis: 'x' });
      if (!avZ.some((a) => Math.abs(a - c) < 3.2)) streets.push({ c, axis: 'z' });
    }
    avX.forEach((c) => avenues.push({ c, axis: 'x' }));
    avZ.forEach((c) => avenues.push({ c, axis: 'z' }));
    return { streets, avenues, avX, avZ };
  }

  function groundTex(cx, cz, all, centerId) {
    const T = window.THREE, SIZE = 1536, R = 150, half = R / 2;
    const px = SIZE / R, X = (v) => (v + half) * px;
    const c = document.createElement('canvas'); c.width = c.height = SIZE;
    const g = c.getContext('2d');
    const L = roadLayout(cx, cz);
    const r = rnd(hash('ground') ^ 0x9e3779b9);

    /* kvarterens gräsmattor */
    g.fillStyle = '#4f7538'; g.fillRect(0, 0, SIZE, SIZE);
    for (let i = 0; i < 5200; i++) {
      const x = r() * SIZE, y = r() * SIZE, a = 0.014 + r() * 0.028;
      g.fillStyle = r() > 0.5 ? 'rgba(255,255,255,' + a + ')' : 'rgba(0,0,0,' + a + ')';
      g.fillRect(x, y, 1 + r() * 3, 1 + r());
    }

    const band = (axis, c0, width, color) => {
      if (axis === 'x') { g.fillStyle = color; g.fillRect(X(c0 - width / 2), 0, width * px, SIZE); }
      else { g.fillStyle = color; g.fillRect(0, X(c0 - width / 2), SIZE, width * px); }
    };
    const line = (axis, c0, off, color, wid) => {
      g.fillStyle = color;
      if (axis === 'x') g.fillRect(X(c0 + off) - wid / 2, 0, wid, SIZE);
      else g.fillRect(0, X(c0 + off) - wid / 2, SIZE, wid);
    };

    /* trottoarer + gator, först de smala gatorna och sedan avenyerna */
    const draw = (road, wide) => {
      const sw = wide ? 1.15 : 0.55, rw = wide ? 3.0 : 1.7;
      band(road.axis, road.c, rw + sw * 2, '#c8bc9e');
      band(road.axis, road.c, rw, '#6c675a');
      /* trottoarkanter */
      line(road.axis, road.c, (rw / 2 + 0.06), 'rgba(92,74,46,.2)', 2);
      line(road.axis, road.c, -(rw / 2 + 0.06), 'rgba(92,74,46,.2)', 2);
      /* kantlinje + mittstreck */
      line(road.axis, road.c, rw / 2 - 0.13, 'rgba(255,248,226,.34)', 2);
      line(road.axis, road.c, -rw / 2 + 0.13, 'rgba(255,248,226,.34)', 2);
      if (wide) {
        band(road.axis, road.c, 0.09, 'rgba(255,244,214,.5)');
        /* cykelbana längs ena sidan */
        line(road.axis, road.c, rw / 2 + 0.5, 'rgba(188,86,58,.34)', 0.9 * px);
        line(road.axis, road.c, rw / 2 + 0.95, 'rgba(150,66,44,.3)', 1.5);
      }
    };
    /* trottoarernas fogar */
    const joints = (road, wide) => {
      const sw = wide ? 1.15 : 0.55, rw = wide ? 3.0 : 1.7;
      g.fillStyle = 'rgba(92,74,46,.14)';
      for (let v = -half; v < half; v += wide ? 1.4 : 0.9) {
        if (road.axis === 'x') {
          g.fillRect(X(road.c + rw / 2) - 0.5, X(v), sw * px, 1);
          g.fillRect(X(road.c - rw / 2 - sw) - 0.5, X(v), sw * px, 1);
        } else {
          g.fillRect(X(v), X(road.c + rw / 2) - 0.5, 1, sw * px);
          g.fillRect(X(v), X(road.c - rw / 2 - sw) - 0.5, 1, sw * px);
        }
      }
    };

    /* gröna remsor längs avenyerna */
    L.avenues.forEach((a) => {
      const off = a.axis === 'x' ? a.c : a.c;
      const gs = 1.5;
      if (a.axis === 'x') { g.fillStyle = '#5f8a3d'; g.fillRect(X(off + 4.2), 0, gs * px, SIZE); g.fillRect(X(off - 4.2 - gs), 0, gs * px, SIZE); }
      else { g.fillStyle = '#5f8a3d'; g.fillRect(0, X(off + 4.2), SIZE, gs * px); g.fillRect(0, X(off - 4.2 - gs), SIZE, gs * px); }
    });

    L.streets.forEach((s) => draw(s, false));
    L.avenues.forEach((s) => draw(s, true));
    L.streets.forEach((s) => joints(s, false));
    L.avenues.forEach((s) => joints(s, true));

    /* gröna förgårdar kring tomterna och en stenlagd plats vid torget */
    if (all) all.forEach((c) => {
      if (c.id === centerId) return;
      const x = (c.x - cx) * S, z = (c.z - cz) * S;
      if (Math.abs(x) > 64 || Math.abs(z) > 64) return;
      const hw = 3.7 * px;
      g.fillStyle = '#5b7f3c'; g.fillRect(X(x) - hw, X(z) - hw, hw * 2, hw * 2);
      g.strokeStyle = 'rgba(214,228,178,.26)'; g.lineWidth = 2; g.strokeRect(X(x) - hw, X(z) - hw, hw * 2, hw * 2);
      for (let i = 0; i < 26; i++) {
        g.fillStyle = 'rgba(255,255,240,' + (0.01 + r() * 0.016) + ')';
        g.fillRect(X(x) - hw + r() * hw * 2, X(z) - hw + r() * hw * 2, 2, 1 + r() * 2);
      }
    });
    g.beginPath(); g.arc(X(0), X(0), 3.85 * px, 0, 7); g.fillStyle = '#d3c6a6'; g.fill();
    g.strokeStyle = 'rgba(255,240,206,.55)'; g.lineWidth = 2.5; g.stroke();

    /* övergångsställen vid avenyns korsningar */
    const zebra = (road, cross) => {
      const rw = road.axis === 'x' ? 3.0 : 3.0;
      g.fillStyle = 'rgba(255,249,229,.58)';
      for (let k = -4; k <= 4; k++) {
        if (road.axis === 'x') g.fillRect(X(road.c + k * 0.34) - 2, X(cross + 2.1), 0.18 * px, 1.1 * px);
        else g.fillRect(X(cross + 2.1), X(road.c + k * 0.34) - 2, 1.1 * px, 0.18 * px);
      }
    };
    L.avenues.filter((a) => a.axis === 'x').forEach((road) => {
      L.avenues.filter((b) => b.axis === 'z').forEach((cross) => {
        if (Math.abs(road.c) < 48 && Math.abs(cross.c) < 48) { zebra(road, cross.c); zebra(cross, road.c); }
      });
    });

    /* brunnar och asfaltslagningar */
    for (let i = 0; i < 26; i++) {
      const road = L.streets[Math.floor(r() * L.streets.length)];
      if (!road) continue;
      const along = (r() - 0.5) * 110, off = (r() - 0.5) * 1.1;
      const x = road.axis === 'x' ? road.c + off : along, z = road.axis === 'x' ? along : road.c + off;
      g.beginPath(); g.arc(X(x), X(z), 0.19 * px, 0, 7);
      g.fillStyle = 'rgba(94,86,70,.88)'; g.fill(); g.strokeStyle = 'rgba(255,255,255,.16)'; g.lineWidth = 1.5; g.stroke();
    }

    const t = new T.CanvasTexture(c);
    t.colorSpace = T.SRGBColorSpace; t.anisotropy = 4;
    return t;
  }

  function radial(inner, outer) {
    const T = window.THREE, c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 2, 64, 64, 62);
    gr.addColorStop(0, inner); gr.addColorStop(0.5, outer); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
    const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace;
    return t;
  }

  function create(host, data, opts = {}) {
    if (!host) throw new Error('3D: ingen yta');
    const T = window.THREE;
    if (!T) throw new Error('3D: three.js saknas');
    if (live) live.dispose();
    if (!data || !data.center) throw new Error('3D: ingen stadsdel');

    const ac = new AbortController();
    const scene = new T.Scene();
    /* Blå dagshimmel: ljus himmelsdis i fjärran så att staden läser som en
       stadskarta i dagsljus i stället för en nattlig kuliss. */
    scene.fog = new T.Fog(0xbfdcf5, 88, 225);

    const camera = new T.PerspectiveCamera(42, 1, 0.5, 460);
    const renderer = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.94;
    /* Långa, mjuka skuggor från en låg sol ger staden djup – som en stadskarta. */
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFShadowMap;
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.touchAction = 'pan-y';
    renderer.domElement.style.cursor = 'grab';
    renderer.domElement.setAttribute('aria-label', '3D map of the neighbourhood: drag to turn, scroll to zoom, click a building');
    host.appendChild(renderer.domElement);

    const tip = document.createElement('div');
    tip.className = 'net-tip';
    tip.setAttribute('aria-hidden', 'true');
    host.appendChild(tip);

    scene.add(new T.AmbientLight(0xfff6e8, 0.4 * Math.PI));
    const hemi = new T.HemisphereLight(0xfffbf1, 0x8ea15c, 0.5 * Math.PI); scene.add(hemi);
    const sun = new T.DirectionalLight(0xfff1dc, 1.34 * Math.PI); sun.position.set(-32, 27, 14); scene.add(sun);
    sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -52, right: 52, top: 52, bottom: -52, near: 1, far: 160 });
    sun.shadow.camera.updateProjectionMatrix();
    sun.shadow.bias = -0.0009; sun.shadow.normalBias = 0.025;
    sun.shadow.radius = 2.5;
    /* svagt svalt motljus ger byggnaderna form även när solen ligger på */
    const fill = new T.DirectionalLight(0xbfd6ea, 0.28 * Math.PI); fill.position.set(-22, 16, -18); scene.add(fill);
    const heart = new T.PointLight(0xffcf8c, 0.75 * Math.PI, 44); heart.position.set(0, 9, 0); scene.add(heart);
    [[-1, 1], [1, -1], [1, 1], [-1, -1]].forEach(([dx, dz]) => {
      const warm = new T.PointLight(0xffc287, 0.4 * Math.PI, 26);
      warm.position.set(dx * S, 3.4, dz * S); scene.add(warm);
    });

    const root = new T.Group(); scene.add(root);
    const buildings = [], links = [], pulses = [], signs = [], blinkers = [];
    const life = { people: [], walkers: [], cars: [], bikes: [], mixers: [] };
    const owned = { geo: [], mat: [], tex: [] };
    const keepGeo = (g) => { owned.geo.push(g); return g; };
    const keepMat = (m) => { owned.mat.push(m); return m; };
    const keepTex = (t) => { owned.tex.push(t); return t; };

    const cx = data.center.x, cz = data.center.z;
    const sx = (x) => (x - cx) * S, sz = (z) => (z - cz) * S;
    const all = [data.center, ...(data.neighbors || [])];
    const layout = roadLayout(cx, cz);
    /* Kameran ramar in hela grannskapet, inte bara mitten: den nyaste tomten
       ligger ofta i kanten av ormbanan, så staden annars hamnar i ena hörnet. */
    const px = all.map((p) => (p.x - cx) * S), pz = all.map((p) => (p.z - cz) * S);
    const fx0 = Math.min(0, ...px), fx1 = Math.max(0, ...px), fz0 = Math.min(0, ...pz), fz1 = Math.max(0, ...pz);
    const fx = (fx0 + fx1) / 2, fz = (fz0 + fz1) / 2, spread = Math.max(fx1 - fx0, fz1 - fz0, 12);

    /* --- mark, trottoarer, gator och gröna remsor --- */
    const groundTexMap = keepTex(groundTex(cx, cz, all, data.center.id));
    const groundMat = keepMat(new T.MeshStandardMaterial({ map: groundTexMap, color: 0xffffff, roughness: 0.94, metalness: 0.04 }));
    const ground = new T.Mesh(keepGeo(new T.PlaneGeometry(150, 150)), groundMat);
    ground.rotation.x = -Math.PI / 2; ground.position.y = 0; ground.receiveShadow = true; root.add(ground);
    const baseMat = keepMat(new T.MeshStandardMaterial({ color: 0x39501b, roughness: 1 }));
    const base = new T.Mesh(keepGeo(new T.PlaneGeometry(420, 420)), baseMat);
    base.rotation.x = -Math.PI / 2; base.position.y = -0.05; root.add(base);

    const padGeo = keepGeo(new T.BoxGeometry(5.2, 0.16, 5.2));
    const padMat = keepMat(new T.MeshStandardMaterial({ color: 0x86734c, roughness: 0.82, metalness: 0.05 }));
    const paveGeo = keepGeo(new T.BoxGeometry(4.72, 0.02, 4.72));
    const paveMat = keepMat(new T.MeshStandardMaterial({ color: 0xa69264, roughness: 1 }));
    const shadowTex = keepTex(radial('rgba(40,26,10,.5)', 'rgba(40,26,10,.18)'));
    const shadowGeo = keepGeo(new T.PlaneGeometry(7.6, 7.6));
    const shadowMat = keepMat(new T.MeshBasicMaterial({ map: shadowTex, transparent: true, opacity: 0.55, depthWrite: false }));
    /* solens skugga: en lång, mjuk strimma som huset kastar över gatan.
       Riktningen följer solen (-32, 27, 14) → skuggan faller mot +x/-z. */
    const SUN_SHADOW = new T.Vector2(32, -14).normalize();
    const SHADOW_ANGLE = Math.atan2(-SUN_SHADOW.y, SUN_SHADOW.x);
    const shadowStripGeo = keepGeo(new T.PlaneGeometry(1, 1).rotateX(-Math.PI / 2));
    const shadowStripMat = keepMat(new T.MeshBasicMaterial({ map: shadowTex, color: 0x2a3446, transparent: true, opacity: 0.5, depthWrite: false }));

    /* --- ljuspölar, skyltar och små ljus --- */
    const poolTex = keepTex(radial('rgba(255,216,158,.34)', 'rgba(255,196,120,.1)'));
    const poolGeo = keepGeo(new T.PlaneGeometry(1, 1));
    const warmPool = (size) => {
      const m = new T.Mesh(poolGeo, keepMat(new T.MeshBasicMaterial({ map: poolTex, transparent: true, opacity: 0.8, depthWrite: false, blending: T.AdditiveBlending })));
      m.rotation.x = -Math.PI / 2; m.scale.set(size, size, 1);
      return m;
    };

    /* --- himmelssilhuetten av resten av staden --- */
    /* Fjärran stad: platt silhuettfärg (påverkas bara av dimman) så att horisonten
       läser som en målning i stället för en rad överljusa kuber. */
    const farMat = keepMat(new T.MeshBasicMaterial({ color: 0x5d6f82, fog: true }));
    const farGeo = keepGeo(new T.BoxGeometry(1, 1, 1));
    const farLitMat = keepMat(new T.MeshBasicMaterial({ color: 0xfff0d4, transparent: true, opacity: 0.08, blending: T.AdditiveBlending, depthWrite: false }));
    const FAR_N = 40;
    const farMesh = new T.InstancedMesh(farGeo, farMat, FAR_N);
    const farLit = new T.InstancedMesh(farGeo, farLitMat, FAR_N);
    const dummy = new T.Object3D();
    for (let i = 0; i < FAR_N; i++) {
      const a = (i / FAR_N) * Math.PI * 2 + 0.4, rad = 104 + (i % 7) * 8, bh = 7 + ((i * 7) % 16), bw = 5 + (i % 4) * 3;
      dummy.position.set(Math.sin(a) * rad, bh / 2 - 1, Math.cos(a) * rad);
      dummy.rotation.set(0, a, 0); dummy.scale.set(bw, bh, bw); dummy.updateMatrix();
      farMesh.setMatrixAt(i, dummy.matrix);
      dummy.position.set(Math.sin(a) * (rad - bw / 2 - 0.05), bh * 0.46, Math.cos(a) * (rad - bw / 2 - 0.05));
      dummy.scale.set(bw * 0.52, bh * 0.62, 0.06); dummy.updateMatrix();
      farLit.setMatrixAt(i, dummy.matrix);
    }
    farMesh.instanceMatrix.needsUpdate = farLit.instanceMatrix.needsUpdate = true;
    root.add(farMesh, farLit);

    /* --- delad geometri för byggnadsdetaljer --- */
    const poleGeo = keepGeo(new T.CylinderGeometry(0.035, 0.05, 2.6, 6));
    const poleMat = keepMat(new T.MeshStandardMaterial({ color: 0x6d6a5e, roughness: 0.72, metalness: 0.45 }));
    const darkMat = keepMat(new T.MeshStandardMaterial({ color: 0x4b4740, roughness: 0.82, metalness: 0.35 }));
    const trimMat = keepMat(new T.MeshStandardMaterial({ color: 0x8e8676, roughness: 0.55, metalness: 0.55 }));
    const glassMat = keepMat(new T.MeshStandardMaterial({ color: 0xdaf1ec, transparent: true, opacity: 0.22, roughness: 0.1, metalness: 0.4, emissive: 0x2f6f6b, emissiveIntensity: 0.35 }));
    const warmMat = keepMat(new T.MeshBasicMaterial({ color: 0xffdca8 }));
    const railGeo = keepGeo(new T.BoxGeometry(0.05, 0.34, 0.05));

    /* slå ihop husets smådetaljer per material – gruppen finns kvar för hover */
    function compact(group) {
      const U2 = T.BufferGeometryUtils;
      if (!U2) return;
      group.updateMatrixWorld(true);
      const inv = new T.Matrix4().copy(group.matrixWorld).invert(), buckets = new Map();
      group.traverse((o) => {
        if (!o.isMesh || o.userData.keep || o.isInstancedMesh) return;
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        if (!mats[0] || mats.length !== 1) return;
        if (!buckets.has(mats[0])) buckets.set(mats[0], []);
        buckets.get(mats[0]).push(o);
      });
      buckets.forEach((list, mat) => {
        if (list.length < 2) return;
        const geos = list.map((o) => {
          const g = plain(o.geometry.clone());
          g.applyMatrix4(new T.Matrix4().multiplyMatrices(inv, o.matrixWorld));
          return g;
        });
        let merged = null;
        try { merged = U2.mergeGeometries(geos, false); } catch (e) { merged = null; }
        if (!merged) { geos.forEach((g) => g.dispose()); return; }
        merged.computeBoundingSphere();
        list.forEach((o) => { if (o.parent) o.parent.remove(o); });
        group.add(new T.Mesh(merged, mat));
        geos.forEach((g) => g.dispose());
      });
    }

    function makeBuilding(c, isCenter) {
      const hashed = hash(c.id), r = rnd(hashed), tier = Math.max(0, Math.min(2, Number(c.building) || 0));
      const w = [3.5, 3.9, 4.3][tier], h = ([5.9, 8.8, 11.8][tier] + r() * 1.5) * (0.9 + r() * 0.2);
      const g = new T.Group();
      g.position.set(sx(c.x), 0, sz(c.z));
      g.userData = { id: c.id, name: c.name, level: c.level, meters: c.meters, isCenter, topY: 0.2 + h, w, onPick: opts.onSelect || null };

      const shadow = new T.Mesh(shadowGeo, shadowMat); shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.19; g.add(shadow);
      /* lång, mjuk skugga från solen som faller över gata och gräsmatta */
      const slen = h * 0.9 + w * 0.35;
      const strip = new T.Mesh(shadowStripGeo, shadowStripMat);
      strip.rotation.y = SHADOW_ANGLE;
      strip.scale.set(slen * 1.5, 1, w * 1.5);
      strip.position.set(SUN_SHADOW.x * (slen / 2), 0.21, SUN_SHADOW.y * (slen / 2));
      g.add(strip);
      const pad = new T.Mesh(padGeo, padMat); pad.position.y = 0.08; g.add(pad);
      const pave = new T.Mesh(paveGeo, paveMat); pave.position.y = 0.17; g.add(pave);

      const ft = facadeTex(tier, hashed, isCenter);
      keepTex(ft.map); keepTex(ft.emissive);
      const bodyMat = keepMat(new T.MeshStandardMaterial({ color: isCenter ? 0xfff6e2 : 0xf2ebdb, map: ft.map, emissive: 0xffffff, emissiveMap: ft.emissive, emissiveIntensity: 0.3, roughness: 0.78, metalness: 0.08 }));
      const bodyGeo = keepGeo(new T.BoxGeometry(w, h, w));
      /* de högsta husen får en smalare överdel – en modern, avtrappad silhuett */
      const split = tier === 2 && !isCenter, lowH = split ? h * 0.68 : h, topW = split ? w * 0.64 : w;
      const body = new T.Mesh(split ? keepGeo(new T.BoxGeometry(w, lowH, w)) : bodyGeo, bodyMat);
      body.castShadow = body.receiveShadow = true;
      body.position.y = 0.2 + lowH / 2; g.add(body);
      if (split) {
        const upper = new T.Mesh(keepGeo(new T.BoxGeometry(topW, h - lowH, topW)), bodyMat);
        upper.castShadow = upper.receiveShadow = true;
        upper.position.y = 0.2 + lowH + (h - lowH) / 2; g.add(upper);
        const ledge = new T.Mesh(keepGeo(new T.BoxGeometry(topW + 0.2, 0.14, topW + 0.2)), trimMat);
        ledge.position.y = 0.2 + lowH + 0.05; g.add(ledge);
      }
      if (isCenter) {
        const edges = new T.LineSegments(keepGeo(new T.EdgesGeometry(bodyGeo)), keepMat(new T.LineBasicMaterial({ color: 0xf3d093, transparent: true, opacity: 0.42 })));
        body.add(edges);
      }

      /* glasad bottenvåning */
      const lobby = new T.Mesh(keepGeo(new T.BoxGeometry(w + 0.06, 2.5, w + 0.06)), glassMat);
      lobby.position.y = 1.45; g.add(lobby);
      const lobbyTrim = new T.Mesh(keepGeo(new T.BoxGeometry(w + 0.1, 0.1, w + 0.1)), trimMat);
      lobbyTrim.position.y = 2.74; g.add(lobbyTrim);

      /* tak: list, räcke och teknik */
      const roof = new T.Mesh(keepGeo(new T.BoxGeometry(topW + 0.3, 0.34, topW + 0.3)), darkMat);
      roof.castShadow = true; roof.position.y = 0.2 + h + 0.17; g.add(roof);
      const parapetTop = 0.2 + h + 0.4;
      [[0, topW / 2 - 0.1], [0, -topW / 2 + 0.1], [topW / 2 - 0.1, 0], [-topW / 2 + 0.1, 0]].forEach(([px, pz]) => {
        const rail = new T.Mesh(railGeo, trimMat);
        rail.scale.set(1, pz ? 1 : 1.3, 1);
        rail.position.set(px, parapetTop, pz);
        g.add(rail);
      });
      if (tier > 0) {
        const box = new T.Mesh(keepGeo(new T.BoxGeometry(w * 0.32, 0.85, w * 0.28)), darkMat);
        box.position.set(w * 0.2, 0.2 + h + 0.82, -w * 0.18); g.add(box);
        const vent = new T.Mesh(keepGeo(new T.CylinderGeometry(0.13, 0.13, 0.16, 10)), trimMat);
        vent.position.set(w * 0.2, 0.2 + h + 1.3, -w * 0.18); g.add(vent);
      }
      if (tier === 2) {
        const ant = new T.Mesh(keepGeo(new T.CylinderGeometry(0.018, 0.03, 2.1, 5)), trimMat);
        ant.position.set(-w * 0.28, 0.2 + h + 1.35, w * 0.22); g.add(ant);
        const bulb = new T.Mesh(keepGeo(new T.SphereGeometry(0.055, 8, 6)), keepMat(new T.MeshBasicMaterial({ color: 0xff5a66 })));
        bulb.position.set(-w * 0.28, 0.2 + h + 2.4, w * 0.22); bulb.userData.keep = true; g.add(bulb);
        blinkers.push({ mesh: bulb, phase: r() * 6 });
      }

      /* entré mot torgets mitt: dörr, skärmtak och varmt ljus */
      let dx = -g.position.x, dz = -g.position.z;
      if (!dx && !dz) { dx = 0; dz = 1; }
      const dl = Math.hypot(dx, dz) || 1; dx /= dl; dz /= dl;
      const entry = new T.Group();
      entry.position.set(dx * (w / 2 + 0.03), 0.2, dz * (w / 2 + 0.03));
      entry.rotation.y = Math.atan2(dx, dz);
      g.add(entry);
      const door = new T.Mesh(keepGeo(new T.BoxGeometry(1.28, 2.1, 0.05)), keepMat(new T.MeshStandardMaterial({ color: 0x0d1a26, emissive: 0x2a4a5c, emissiveIntensity: 0.5, roughness: 0.2, metalness: 0.4 })));
      door.position.set(0, 1.15, 0.02); entry.add(door);
      const doorFrame = new T.Mesh(keepGeo(new T.BoxGeometry(1.46, 2.24, 0.07)), trimMat);
      doorFrame.position.set(0, 1.16, -0.01); entry.add(doorFrame);
      const canopy = new T.Mesh(keepGeo(new T.BoxGeometry(2.3, 0.09, 1.05)), darkMat);
      canopy.position.set(0, 2.72, 0.48); entry.add(canopy);
      const canopyGlow = new T.Mesh(poolGeo, warmPool(1).material);
      canopyGlow.rotation.x = Math.PI / 2; canopyGlow.scale.set(1.7, 0.8, 1);
      canopyGlow.position.set(0, 2.66, 0.5); entry.add(canopyGlow);
      const step = new T.Mesh(keepGeo(new T.BoxGeometry(2.5, 0.07, 1.3)), paveMat);
      step.position.set(0, 0.03, 0.58); entry.add(step);
      const spill = warmPool(3.2);
      spill.position.set(0, 0.06, 0.85); entry.add(spill);
      for (const s of [-1, 1]) {
        const lamp = new T.Mesh(keepGeo(new T.BoxGeometry(0.09, 0.26, 0.05)), warmMat);
        lamp.position.set(s * 0.86, 2.34, 0.03); entry.add(lamp);
      }

      /* takskylt: bara de närmaste grannarna får en läsbar skylt */
      if (isCenter || c.level === 'granne') {
        const len = Math.hypot(g.position.x, g.position.z) || 1;
        const ox = isCenter ? 0 : (g.position.x / len) * (topW / 2 - 0.34);
        const oz = isCenter ? topW / 2 - 0.34 : (g.position.z / len) * (topW / 2 - 0.34);
        const post = new T.Mesh(keepGeo(new T.BoxGeometry(0.1, 1.3, 0.1)), trimMat);
        post.position.set(ox, 0.2 + h + 0.9, oz); g.add(post);
        const frame = new T.Mesh(keepGeo(new T.BoxGeometry((isCenter ? 4.5 : 3.4) + 0.08, (isCenter ? 1.06 : 0.82), 0.06)), darkMat);
        frame.position.set(ox, 0.2 + h + 1.75, oz); g.add(frame);
        const signMat = keepMat(new T.MeshBasicMaterial({ map: keepTex(signTex(c.name)), transparent: true, side: T.DoubleSide }));
        const sign = new T.Mesh(keepGeo(new T.PlaneGeometry(isCenter ? 4.4 : 3.3, isCenter ? 1.02 : 0.78)), signMat);
        sign.position.set(ox, 0.2 + h + 1.75, oz);
        sign.position.z += 0.04;
        sign.userData.keep = true;
        g.add(sign);
        signs.push({ mesh: sign, world: new T.Vector3(g.position.x + ox, sign.position.y, g.position.z + oz), baseY: 0.2 + h + 1.75 });
      }

      /* liten pool av ljus runt huset */
      if (isCenter) {
        const ringMat = keepMat(new T.MeshBasicMaterial({ color: 0xe6c07b, transparent: true, opacity: 0.5, side: T.DoubleSide, blending: T.AdditiveBlending, depthWrite: false }));
        const ring = new T.Mesh(keepGeo(new T.RingGeometry(3.3, 3.55, 64)), ringMat);
        ring.rotation.x = -Math.PI / 2; ring.position.y = 0.26; g.add(ring);
        const halo = warmPool(10);
        halo.position.y = 0.24; g.add(halo);
      }

      compact(g);
      root.add(g);
      buildings.push(g);
      return g;
    }

    const centerGroup = makeBuilding(data.center, true);
    const centerTop = centerGroup.userData.topY || 9;
    all.slice(1).forEach((c) => makeBuilding(c, false));

    /* ljusstråle över det egna kontoret */
    const beaconMat = keepMat(new T.MeshBasicMaterial({ color: 0xf3d093, transparent: true, opacity: 0.42, blending: T.AdditiveBlending, depthWrite: false }));
    const beacon = new T.Mesh(keepGeo(new T.CylinderGeometry(0.06, 0.06, 6.6, 6, 1, true)), beaconMat);
    beacon.position.y = centerTop + 3.3; root.add(beacon);
    const beaconDot = new T.Mesh(keepGeo(new T.OctahedronGeometry(0.24)), keepMat(new T.MeshBasicMaterial({ color: 0xffe3ae })));
    beaconDot.position.y = centerTop + 7; root.add(beaconDot);

    /* --- ljuslänkar: bara de som faktiskt delar något får en synlig länk --- */
    (data.neighbors || []).filter((c) => c.level === 'granne' || c.level === 'kvarter').forEach((c) => {
      const lv = LEVEL[c.level] || LEVEL.stadsdel;
      const target = buildings.find((b) => b.userData.id === c.id);
      if (!target) return;
      const start = new T.Vector3(0, centerGroup.userData.topY || 6, 0);
      const end = new T.Vector3(target.position.x, (target.userData.topY || 8), target.position.z);
      const mid = start.clone().add(end).multiplyScalar(0.5); mid.y = Math.max(start.y, end.y) + 2.4 + Math.abs(end.x - start.x + end.z - start.z) * 0.06;
      const curve = new T.QuadraticBezierCurve3(start, mid, end);
      const geo = keepGeo(new T.TubeGeometry(curve, 30, lv.radius, 6, false));
      const mat = keepMat(new T.MeshBasicMaterial({ color: lv.color, transparent: true, opacity: lv.opacity, blending: T.AdditiveBlending, depthWrite: false }));
      root.add(new T.Mesh(geo, mat));
      links.push({ mat, base: lv.opacity });
      const dot = new T.Mesh(keepGeo(new T.SphereGeometry(lv.pulse, 8, 6)), keepMat(new T.MeshBasicMaterial({ color: lv.color, transparent: true, opacity: 0.95, blending: T.AdditiveBlending, depthWrite: false })));
      root.add(dot);
      pulses.push({ dot, curve, t: Math.random(), speed: 0.055 + Math.random() * 0.05 });
    });

    /* --- eldflugor i luften ger staden liv även stilla --- */
    const flyGeo = keepGeo(new T.BufferGeometry());
    const flyN = 90, flyPos = new Float32Array(flyN * 3);
    for (let i = 0; i < flyN; i++) {
      flyPos[i * 3] = (Math.random() - 0.5) * 48;
      flyPos[i * 3 + 1] = 0.6 + Math.random() * 9;
      flyPos[i * 3 + 2] = (Math.random() - 0.5) * 48;
    }
    flyGeo.setAttribute('position', new T.BufferAttribute(flyPos, 3));
    const flies = new T.Points(flyGeo, keepMat(new T.PointsMaterial({ color: 0xffd79a, size: 0.055, transparent: true, opacity: 0.65, depthWrite: false, blending: T.AdditiveBlending })));
    root.add(flies);

    /* ------------------------------------------------------------------ */
    /*  stadsliv: träd, planteringar, bänkar, lyktor, bilar, cyklister     */
    /* ------------------------------------------------------------------ */
    const A = window.CityAssets;
    const rp = rnd(hash(data.center.id) ^ 0x51ed270b);
    const rnd2 = () => rp();
    const groundY = GY;
    const bedGeo = keepGeo(new T.BoxGeometry(1, 0.24, 1));
    const bedMat = keepMat(new T.MeshStandardMaterial({ color: 0xa89b7d, roughness: 0.9, metalness: 0.05 }));
    const soilMat = keepMat(new T.MeshStandardMaterial({ color: 0x4a3a26, roughness: 1 }));
    /* statisk grönska slås ihop per material: hundratals små mesh blir några få */
    const U = T.BufferGeometryUtils, batches = new Map();
    function plain(g) {   // merge kräver vanliga float-attribut (glTF kan vara interleaved/normaliserat)
      Object.keys(g.attributes).forEach((name) => {
        const a = g.attributes[name];
        const float = a.array instanceof Float32Array && !a.normalized;
        if (float && !a.isInterleavedBufferAttribute) return;
        const n = a.count, is = a.itemSize, arr = new Float32Array(n * is);
        for (let i = 0; i < n; i++) {
          arr[i * is] = a.getX(i);
          if (is > 1) arr[i * is + 1] = a.getY(i);
          if (is > 2) arr[i * is + 2] = a.getZ(i);
          if (is > 3) arr[i * is + 3] = a.getW(i);
        }
        g.setAttribute(name, new T.BufferAttribute(arr, is));
      });
      return g;
    }
    function batch(obj) {
      if (!U) { root.add(obj); return; }
      obj.updateMatrixWorld(true);
      obj.traverse((o) => {
        if (!o.isMesh || o.isInstancedMesh || !o.geometry) return;
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        if (!mats[0] || mats.length > 1) return;
        const g = plain(o.geometry.clone());
        g.applyMatrix4(o.matrixWorld);
        if (!batches.has(mats[0])) batches.set(mats[0], []);
        batches.get(mats[0]).push(g);
      });
    }
    function flushBatches() {
      batches.forEach((geos, mat) => {
        if (!geos.length) return;
        let merged = null;
        if (geos.length > 1) { try { merged = U.mergeGeometries(geos, false); } catch { merged = null; } }
        if (merged) {
          merged.computeBoundingSphere();
          const msh = new T.Mesh(merged, mat); msh.castShadow = true; msh.receiveShadow = true;
          root.add(msh);
          geos.forEach((g) => g.dispose());
        } else geos.forEach((g) => { const msh = new T.Mesh(g, mat); msh.castShadow = true; msh.receiveShadow = true; root.add(msh); });
      });
      batches.clear();
    }
    const nearBuilding = (x, z, pad = 3.1) => buildings.some((b) => Math.abs(b.position.x - x) < pad && Math.abs(b.position.z - z) < pad);
    /* asfalt + trottoar: gator är 2,8 breda, avenyer 5,3. Inga träd eller buskar där. */
    const roads = [...layout.streets.map((r) => [r, 1.4]), ...layout.avenues.map((r) => [r, 2.65])];
    const onRoad = (x, z, pad = 0.35) => roads.some(([r, h]) => Math.abs((r.axis === 'x' ? x : z) - r.c) < h + pad);
    const addBed = (x, z, w, d) => {
      const b = new T.Mesh(bedGeo, bedMat); b.scale.set(w, 1, d); b.position.set(x, 0.12, z); root.add(b);
      const s = new T.Mesh(keepGeo(new T.PlaneGeometry(w * 0.9, d * 0.9)), soilMat);
      s.rotation.x = -Math.PI / 2; s.position.set(x, 0.245, z); root.add(s);
    };

    function plantTree(x, z, h, pine) {
      if (!A || onRoad(x, z)) return;
      const tree = pine ? A.pine({ h, rnd: rnd2 }) : A.tree({ h, rnd: rnd2 });
      if (!tree.children.length) return;
      tree.position.set(x, groundY, z);
      batch(tree);
    }
    function plantBush(x, z, h, flower) {
      if (!A || onRoad(x, z)) return;
      const b = A.bush({ h, flower, rnd: rnd2 });
      if (!b.children.length) return;
      b.position.set(x, groundY + 0.02, z);
      b.rotation.y = rnd2() * 6.28;
      batch(b);
    }
    function plantFlowers(x, z, spread) {
      if (!A || onRoad(x, z)) return;
      const f = A.flowers({ n: 3, spread, h: 0.85, rnd: rnd2 });
      if (!f.children.length) return;
      f.position.set(x, groundY + 0.02, z);
      batch(f);
    }
    function plantGrass(x, z, h) {
      if (!A || onRoad(x, z)) return;
      const gr = A.grass({ h, rnd: rnd2 });
      if (!gr.children.length) return;
      gr.position.set(x, groundY + 0.01, z);
      batch(gr);
    }

    /* grönt runt varje hus */
    buildings.forEach((b) => {
      const u = b.userData, w = u.w || 3.7, baseY = 0.245;
      const close = u.isCenter || u.level === 'granne' || u.level === 'kvarter';
      const corner = (ax, az, h, pine) => {
        const x = b.position.x + ax, z = b.position.z + az;
        addBed(x + 0.5, z + 0.4, 0.9, 0.7);
        plantTree(x, z, h, pine);
        if (A) {
          const bush = A.bush({ h: 0.38, flower: rnd2() > 0.6, rnd: rnd2 });
          if (bush.children.length) { bush.position.set(x + 0.55, baseY, z + 0.32); batch(bush); }
        }
      };
      if (close || rnd2() > 0.5) corner(w / 2 + 0.65, w / 2 + 0.55, 1.9 + rnd2() * 0.5, rnd2() > 0.76);
      if (close && rnd2() > 0.56) corner(-w / 2 - 0.62, w / 2 + 0.5, 1.7 + rnd2() * 0.45, rnd2() > 0.84);
      if (u.isCenter) corner(w / 2 + 0.6, -w / 2 - 0.55, 1.8 + rnd2() * 0.4, false);

      /* rabatt längs fasaden med blommor och gräs */
      const side = Math.round(rnd2() * 3);
      const off = (side % 2 === 0 ? 1 : -1) * (w / 2 + 0.5);
      const bx = side < 2 ? b.position.x + off : b.position.x + (rnd2() - 0.5) * w * 0.6;
      const bz = side < 2 ? b.position.z + (rnd2() - 0.5) * w * 0.6 : b.position.z + off;
      addBed(bx, bz, 1.15, 0.7);
      plantBush(bx - 0.15, bz, 0.42, rnd2() > 0.5);
      plantFlowers(bx + 0.22, bz + 0.1, 0.55);
      for (let i = 0; i < 3; i++) plantGrass(bx + (rnd2() - 0.5) * 0.9, bz + (rnd2() - 0.5) * 0.5, 0.2 + rnd2() * 0.1);

      /* entréljus på marken */
      const g2 = new T.Group(); g2.position.copy(b.position); g2.position.y = 0.24;
      const l = warmPool(u.isCenter ? 5.2 : 3.4);
      g2.add(l); root.add(g2);
    });

    /* trädalléer och gröna remsor längs avenyerna */
    layout.avenues.filter((r) => Math.abs(r.c) < 36).forEach((road) => {
      const rw = 3.0;
      for (let v = -30; v <= 30; v += 9.5) {
        for (const s of [-1, 1]) {
          const off = s * 4.35, x = road.axis === 'x' ? road.c + off : v, z = road.axis === 'x' ? v : road.c + off;
          if (nearBuilding(x, z, 2.4)) continue;
          if (rnd2() > 0.36) plantTree(x, z, 2.1 + rnd2() * 1.5, rnd2() > 0.74);
          if (rnd2() > 0.6) plantBush(x + 0.55, z - 0.5, 0.4, rnd2() > 0.7);
          if (rnd2() > 0.72) plantGrass(x - 0.4, z + 0.45, 0.24 + rnd2() * 0.12);
        }
      }
      /* bänkar och lyktor längs trottoaren */
      for (let v = -38; v <= 38; v += 19) {
        const s = rnd2() > 0.5 ? 1 : -1;
        const lx = road.axis === 'x' ? road.c + s * (rw / 2 + 0.62) : v, lz = road.axis === 'x' ? v : road.c + s * (rw / 2 + 0.62);
        if (!nearBuilding(lx, lz, 1.6)) {
          if (A) {
            const lamp = A.lamp({ h: 3.1, rot: road.axis === 'x' ? (s > 0 ? Math.PI : 0) : (s > 0 ? Math.PI / 2 : -Math.PI / 2) });
            if (lamp.children.length) { lamp.position.set(lx, groundY, lz); root.add(lamp); }
          }
        }
        const bx2 = road.axis === 'x' ? road.c - s * (rw / 2 + 0.72) : v + 1.6, bz2 = road.axis === 'x' ? v + 1.6 : road.c - s * (rw / 2 + 0.72);
        if (!nearBuilding(bx2, bz2, 1.4) && rnd2() > 0.5) {
          if (A) {
            const bench = A.bench({ h: 0.44, rot: road.axis === 'x' ? (s > 0 ? -Math.PI / 2 : Math.PI / 2) : (s > 0 ? 0 : Math.PI) });
            if (bench.children.length) { bench.position.set(bx2, groundY, bz2); batch(bench); }
          }
        }
      }
    });

    /* parker på tomma tomter: träd, buskar och blommor så staden inte ekar tom */
    const occupied = new Set(all.map((c) => c.x + ':' + c.z));
    for (let i = -5; i <= 5; i++) for (let j = -5; j <= 5; j++) {
      if (!i && !j) continue;
      const gx = data.center.x + i, gz = data.center.z + j;
      if (occupied.has(gx + ':' + gz)) continue;
      const x = i * S, z = j * S;
      if (Math.hypot(x, z) > 46) continue;
      const n = 2 + Math.floor(rnd2() * 3);
      for (let k = 0; k < n; k++) {
        const ox = (rnd2() - 0.5) * 4.8, oz = (rnd2() - 0.5) * 4.8;
        if (!nearBuilding(x + ox, z + oz, 2.2)) plantTree(x + ox, z + oz, 1.7 + rnd2() * 1.3, rnd2() > 0.76);
      }
      if (rnd2() > 0.45) plantBush(x + (rnd2() - 0.5) * 4, z + (rnd2() - 0.5) * 4, 0.38 + rnd2() * 0.2, rnd2() > 0.62);
      if (rnd2() > 0.52) plantFlowers(x + (rnd2() - 0.5) * 4, z + (rnd2() - 0.5) * 4, 0.6);
    }

    /* några träd och blommor på torget runt det egna kontoret */
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * 6.28 + 0.3, rad = 4.9 + rnd2() * 1.1;
      const x = Math.cos(a) * rad, z = Math.sin(a) * rad;
      if (!nearBuilding(x, z, 3.1)) { plantTree(x, z, 1.85 + rnd2() * 0.5, i % 4 === 0); plantFlowers(x + 0.3, z - 0.2, 0.5); }
    }

    /* ------------------------------------------------------------------ */
    /*  människor och agenter                                              */
    /* ------------------------------------------------------------------ */
    const glowTex = keepTex(radial('rgba(255,246,220,.9)', 'rgba(255,205,130,.32)'));
    const carGlowMat = keepMat(new T.SpriteMaterial({ map: glowTex, color: 0xffeccb, transparent: true, opacity: 0.85, depthWrite: false, blending: T.AdditiveBlending }));
    const ringGeo = keepGeo(new T.RingGeometry(0.24, 0.32, 32));
    const agentRingMat = keepMat(new T.MeshBasicMaterial({ color: 0xf2cd88, transparent: true, opacity: 0.6, side: T.DoubleSide, blending: T.AdditiveBlending, depthWrite: false }));

    function addWalker(spec) {
      if (!A) return;
      const p = A.person({ kind: spec.kind, h: spec.h || 0.96 });
      if (!p.group.children.length) return;
      p.group.position.set(spec.axis === 'x' ? spec.pos : spec.fixed, groundY, spec.axis === 'x' ? spec.fixed : spec.pos);
      p.group.rotation.y = spec.axis === 'x' ? (spec.dir > 0 ? Math.PI / 2 : -Math.PI / 2) : (spec.dir > 0 ? 0 : Math.PI);
      root.add(p.group);
      p.play('walk', 1 + Math.random() * 0.25);
      const w = { p, axis: spec.axis, fixed: spec.fixed, pos: spec.pos, dir: spec.dir, speed: spec.speed, min: spec.min, max: spec.max };
      life.walkers.push(w);
      life.mixers.push(p.mixer);
    }

    function addAgent(x, z, ry) {
      if (!A) return;
      const p = A.person({ kind: Math.random() > 0.45 ? 'man' : 'woman', h: 0.92 });
      if (!p.group.children.length) return;
      p.group.position.set(x, groundY, z);
      p.group.rotation.y = ry == null ? Math.random() * 6.28 : ry;
      root.add(p.group);
      p.play('idle', 0.8);
      life.mixers.push(p.mixer);
      const ring = new T.Mesh(ringGeo, agentRingMat);
      ring.rotation.x = -Math.PI / 2; ring.position.set(x, groundY + 0.012, z); root.add(ring);
      const sp = new T.Sprite(carGlowMat); sp.scale.set(0.28, 0.28, 1); sp.position.set(x, groundY + 1.02, z); root.add(sp);
    }

    /* gångstråk på trottoarerna längs de två närmaste avenyerna */
    const walkLanes = [];
    ['x', 'z'].forEach((axis) => {
      const road = layout.avenues.filter((a) => a.axis === axis).sort((a, b) => Math.abs(a.c) - Math.abs(b.c))[0];
      if (!road) return;
      /* aveny: 3,0 bred väg + 1,15 trottoar → trottoarens mitt ligger 2,08 ut */
      const travel = axis === 'x' ? 'z' : 'x';
      walkLanes.push({ axis: travel, fixed: road.c + 2.08, dir: -1 }, { axis: travel, fixed: road.c - 2.08, dir: 1 });
    });
    walkLanes.forEach((ln, i) => {
      for (let k = 0; k < 2; k++) {
        const pos = -26 + k * 26 + (i % 2 ? 5 : -5);
        addWalker({ axis: ln.axis, fixed: ln.fixed, pos, dir: ln.dir, speed: 0.42 + Math.random() * 0.24, min: -34, max: 34, kind: (k + i) % 2 ? 'woman' : 'man' });
      }
    });
    /* några som står och pratar vid torget */
    addAgent(3.2, 4.5, -0.7);
    addAgent(-4.2, 3.4, 0.5);
    (data.neighbors || []).forEach((c) => {
      if (c.level !== 'granne') return;
      const b = buildings.find((x) => x.userData.id === c.id);
      if (!b) return;
      const dir = Math.hypot(b.position.x, b.position.z) || 1;
      addAgent(b.position.x - (b.position.x / dir) * 2.9, b.position.z - (b.position.z / dir) * 2.9, Math.atan2(-b.position.x, -b.position.z));
    });

    /* bilar och taxibilar: höger­trafik i riktiga körfält på gator och avenyer */
    const CAR_SPAN = 44;
    const carShadowMat = keepMat(new T.MeshBasicMaterial({ map: shadowTex, transparent: true, opacity: 0.42, depthWrite: false }));
    function addCar(spec) {
      if (!A) return;
      const c = A.car({ taxi: spec.taxi, color: A.CAR_COLORS[Math.floor(Math.random() * A.CAR_COLORS.length)], len: 1.55 });
      if (!c.group.children.length) return;
      /* sidled: i höger­trafik ligger körfältet på höger sida om vägens mitt */
      const off = (spec.axis === 'x' ? spec.dir : -spec.dir) * spec.lane;
      const side = spec.fixed + off;
      c.group.position.set(spec.axis === 'x' ? spec.pos : side, GY + 0.015, spec.axis === 'x' ? side : spec.pos);
      c.group.rotation.y = spec.axis === 'x' ? (spec.dir > 0 ? 0 : Math.PI) : (spec.dir > 0 ? -Math.PI / 2 : Math.PI / 2);
      const sh = new T.Mesh(shadowGeo, carShadowMat);
      sh.rotation.x = -Math.PI / 2; sh.scale.set(0.3, 0.24, 1); sh.position.set(-0.04, 0.004, 0); c.group.add(sh);
      const gl = new T.Sprite(carGlowMat); gl.scale.set(0.42, 0.24, 1); gl.position.set(0.84, 0.19, 0); c.group.add(gl);
      root.add(c.group);
      const rec = { c, axis: spec.axis, lat: side, pos: spec.pos, dir: spec.dir, speed: spec.speed, v: spec.speed, wait: 0, min: -CAR_SPAN, max: CAR_SPAN, cross: carCrossings(spec.axis, spec.fixed), res: new Set() };
      /* ny bil: flytta fram den tills den inte står i någon annan */
      for (let k = 0; k < 60 && !carFree(rec, rec.pos, life.cars); k++) rec.pos += rec.dir * 0.9;
      if (rec.axis === 'x') c.group.position.x = rec.pos; else c.group.position.z = rec.pos;
      life.cars.push(rec);
    }
    /* bilarna får aldrig åka genom varandra:
       - i samma fil håller de avstånd till bilen framför
       - varje korsning reserveras av en körriktning i taget, den andra väntar vid kanten */
    const CAR_HEADWAY = 2.4;                 // bil 1,55 + marginal
    const CAR_NOSE = 0.8, CAR_APPROACH = 1.3;
    function carCrossings(axis, fixed) {
      return [...layout.streets, ...layout.avenues]
        .filter((r) => r.axis === axis && Math.abs(r.c) <= CAR_SPAN + 5)
        .map((r) => ({
          key: axis === 'x' ? 'x' + r.c + ':z' + fixed : 'x' + fixed + ':z' + r.c,
          ctr: r.c,
          half: (layout.avenues.includes(r) ? 1.5 : 0.85) + CAR_NOSE,
        }));
    }
    function carsOverlap(a, b, margin) {
      const lim = (0.8 + margin) ** 2;
      for (const ao of [-0.55, 0, 0.55]) for (const bo of [-0.55, 0, 0.55]) {
        const ax = a.axis === 'x' ? a.pos + ao : a.lat, az = a.axis === 'x' ? a.lat : a.pos + ao;
        const bx = b.axis === 'x' ? b.pos + bo : b.lat, bz = b.axis === 'x' ? b.lat : b.pos + bo;
        if ((ax - bx) ** 2 + (az - bz) ** 2 < lim) return true;
      }
      return false;
    }
    const carFree = (c, p, cars) => !cars.some((o) => o !== c && carsOverlap({ axis: c.axis, lat: c.lat, pos: p }, o, 0.7));
    function carBlocked(c, cars) {
      for (const o of cars) {
        if (o === c || o.axis !== c.axis || o.dir !== c.dir || Math.abs(o.lat - c.lat) > 0.1) continue;
        const d = (o.pos - c.pos) * c.dir;
        if (d > 0 && d < CAR_HEADWAY) return true;
      }
      let stop = false;
      for (const x of c.cross) {
        const rel = (x.ctr - c.pos) * c.dir;                // avstånd framåt till korsningens mitt
        if (rel + x.half <= 0) { c.res.delete(x.key); continue; }   // bilen har passerat
        if (c.res.has(x.key) || rel - x.half > CAR_APPROACH) continue;
        if (cars.some((o) => o !== c && o.axis !== c.axis && o.res.has(x.key))) stop = true;
        else c.res.add(x.key);
      }
      return stop;
    }
    /* körfält: alla avenyer inom kartan + de två närmaste smågatorna per riktning */
    const traffic = [];
    layout.avenues.forEach((r, i) => {
      if (Math.abs(r.c) > 44) return;
      traffic.push({ axis: r.axis === 'x' ? 'z' : 'x', fixed: r.c, lane: 0.74, speed: 3.5 + (i % 3) * 0.32 });
    });
    ['x', 'z'].forEach((axis) => {
      layout.streets
        .filter((r) => r.axis === axis && Math.abs(r.c) < 20)
        .sort((a, b) => Math.abs(a.c) - Math.abs(b.c))
        .slice(0, 2)
        .forEach((r, i) => traffic.push({ axis: axis === 'x' ? 'z' : 'x', fixed: r.c, lane: 0.48, speed: 2.6 + i * 0.28 }));
    });
    traffic.forEach((road, i) => {
      for (const dir of [1, -1]) {
        addCar({
          axis: road.axis, fixed: road.fixed, lane: road.lane, dir, speed: road.speed,
          pos: -CAR_SPAN + ((i * 0.37 + (dir > 0 ? 0.18 : 0.63)) % 1) * CAR_SPAN * 2,
          taxi: (i + dir) % 5 === 0,
        });
      }
    });

    /* cyklister på avenyns cykelbana – gratis cykelmodell med sittande person */
    function cyclist(spec) {
      if (!A) return;
      const g = A.cyclist({ kind: spec.kind, len: 1.06 });
      if (!g.children.length) return;
      g.position.set(spec.axis === 'x' ? spec.pos : spec.fixed, GY, spec.axis === 'x' ? spec.fixed : spec.pos);
      g.rotation.y = spec.axis === 'x' ? (spec.dir > 0 ? 0 : Math.PI) : (spec.dir > 0 ? -Math.PI / 2 : Math.PI / 2);
      root.add(g);
      if (g.userData.mixer) life.mixers.push(g.userData.mixer);
      life.bikes.push({ g, axis: spec.axis, fixed: spec.fixed, pos: spec.pos, dir: spec.dir, speed: spec.speed, phase: Math.random() * 6.28, min: -40, max: 40 });
    }
    const bikeAv = layout.avenues.find((a) => a.axis === 'z' && Math.abs(a.c) < 20) || layout.avenues[0];

    if (bikeAv) {
      for (let i = 0; i < 4; i++) {
        const side = i % 2 ? 1 : -1, axis = bikeAv.axis === 'x' ? 'z' : 'x';
        cyclist({ axis, fixed: bikeAv.c + side * 2.02, pos: -30 + i * 15, dir: axis === 'x' ? side : -side, speed: 2.4 + i * 0.22, kind: i % 2 ? 'woman' : 'man' });
      }
    }

    flushBatches();

    /* kameran, pekaren och animationen */
    let az = 0.72, el = 0.5, dist = Math.min(120, Math.max(60, spread * 1.02)), zoomed = false, hovered = null, auto = 0, drag = null, down = null;
    const ray = new T.Raycaster(), ptr = new T.Vector2();

    function applyCamera() {
      const ce = Math.cos(el), se = Math.sin(el);
      camera.position.set(fx + dist * ce * Math.sin(az), 3 + dist * se, fz + dist * ce * Math.cos(az));
      camera.lookAt(fx, Math.min(centerTop * 0.62, 9), fz);
    }
    function resize() {
      const w = host.clientWidth || 640, h = host.clientHeight || 420;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      if (!zoomed) dist = Math.min(120, Math.max(56, spread * (w < 620 ? 1.22 : 1.02)));
      applyCamera();
    }
    const ro = new ResizeObserver(resize); ro.observe(host);

    const el2 = renderer.domElement;
    el2.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY }; down = { ...drag }; el2.style.cursor = 'grabbing'; el2.setPointerCapture(e.pointerId); auto = 0; }, { signal: ac.signal });
    el2.addEventListener('pointermove', (e) => {
      if (drag) {
        az -= (e.clientX - drag.x) * 0.006;
        el = Math.max(0.16, Math.min(1.15, el + (e.clientY - drag.y) * 0.004));
        drag = { x: e.clientX, y: e.clientY }; applyCamera();
        tip.style.opacity = '0';
        return;
      }
      const r = host.getBoundingClientRect();
      ptr.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
      ray.setFromCamera(ptr, camera);
      const hit = ray.intersectObjects(buildings, true)[0];
      let g = hit && hit.object; while (g && !buildings.includes(g)) g = g.parent;
      if (g !== hovered) {
        if (hovered) hovered.scale.setScalar(1);
        hovered = g || null;
        if (hovered) hovered.scale.setScalar(1.035);
        el2.style.cursor = g ? 'pointer' : 'grab';
      }
      if (g) {
        const u = g.userData;
        tip.innerHTML = '<b>' + escapeHtml(u.name) + '</b><span>' + (u.isCenter ? 'Här står du' : (u.meters + ' m bort')) + '</span>';
        tip.style.opacity = '1';
        tip.style.transform = 'translate(' + (e.clientX - r.left + 14) + 'px,' + (e.clientY - r.top + 12) + 'px)';
      } else tip.style.opacity = '0';
    }, { signal: ac.signal });
    el2.addEventListener('pointerup', (e) => {
      drag = null; el2.style.cursor = 'grab';
      if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6) return;
      const r = host.getBoundingClientRect();
      ptr.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
      ray.setFromCamera(ptr, camera);
      const hit = ray.intersectObjects(buildings, true)[0];
      let g = hit && hit.object; while (g && !buildings.includes(g)) g = g.parent;
      if (g && g.userData.onPick) g.userData.onPick(g.userData.id);
    }, { signal: ac.signal });
    el2.addEventListener('pointerleave', () => { drag = null; tip.style.opacity = '0'; }, { signal: ac.signal });
    el2.addEventListener('wheel', (e) => {
      e.preventDefault();
      zoomed = true;
      dist = Math.max(26, Math.min(170, dist * (1 + Math.sign(e.deltaY) * 0.09)));
      auto = 0; applyCamera();
    }, { passive: false, signal: ac.signal });

    const reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    let inView = true;
    const io = 'IntersectionObserver' in window ? new IntersectionObserver((es) => { inView = es[0].isIntersecting; }, { threshold: 0.01 }) : null;
    if (io) io.observe(host);

    let raf = 0, last = performance.now(), dead = false, elapsed = 0;
    function frame(now) {
      if (dead) return;
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (!inView || document.hidden) return;   // spara GPU när kartan inte syns
      elapsed += dt;
      auto += dt;
      if (!drag && auto > 2.6 && !reduceMotion) az += dt * 0.04;
      beaconDot.rotation.y += dt * 0.8; beaconDot.position.y = centerTop + 7 + Math.sin(now / 900) * 0.16;
      pulses.forEach((p) => {
        p.t = (p.t + dt * p.speed) % 1;
        const pos = p.curve.getPoint(p.t);
        p.dot.position.copy(pos);
        p.dot.visible = p.t > 0.04;
      });
      signs.forEach((s) => {
        s.mesh.rotation.y = Math.atan2(camera.position.x - s.world.x, camera.position.z - s.world.z);
      });
      blinkers.forEach((b) => { b.mesh.visible = Math.sin(elapsed * 2.4 + b.phase) > 0; });
      flies.rotation.y += dt * 0.015;

      /* människor */
      life.walkers.forEach((w) => {
        w.pos += w.dir * w.speed * dt;
        if (w.pos > w.max) { w.pos = w.max; w.dir = -1; }
        if (w.pos < w.min) { w.pos = w.min; w.dir = 1; }
        if (w.axis === 'x') {
          w.p.group.position.x = w.pos;
          w.p.group.rotation.y = w.dir > 0 ? Math.PI / 2 : -Math.PI / 2;
        } else {
          w.p.group.position.z = w.pos;
          w.p.group.rotation.y = w.dir > 0 ? 0 : Math.PI;
        }
      });
      life.mixers.forEach((m) => m.update(dt));

      /* bilar */
      const cdt = Math.min(dt, 0.05);
      life.cars.forEach((c) => {
        const blocked = carBlocked(c, life.cars);
        c.v += ((blocked ? 0 : c.speed) - c.v) * Math.min(1, cdt * (blocked ? 10 : 4));
        c.wait = blocked && c.v < 0.05 ? c.wait + cdt : 0;
        c.pos += c.dir * c.v * cdt;
        if (c.wait > 10) { if (carFree(c, c.min, life.cars)) { c.pos = c.min; c.v = c.speed; c.res.clear(); } c.wait = 0; }   // ur en ev. dödlåsning
        if (c.pos > c.max) { if (carFree(c, c.min, life.cars)) { c.pos = c.min; c.res.clear(); } else c.pos = c.max; }
        if (c.pos < c.min) { if (carFree(c, c.max, life.cars)) { c.pos = c.max; c.res.clear(); } else c.pos = c.min; }
        if (c.axis === 'x') c.c.group.position.x = c.pos;
        else c.c.group.position.z = c.pos;
      });

      /* cyklister */
      life.bikes.forEach((b) => {
        b.pos += b.dir * b.speed * dt;
        if (b.pos > b.max) b.pos = b.min;
        if (b.pos < b.min) b.pos = b.max;
        if (b.axis === 'x') b.g.position.x = b.pos; else b.g.position.z = b.pos;
        b.phase += dt * b.speed * 1.4;
        b.g.position.y = GY + Math.sin(b.phase) * 0.006;
        b.g.rotation.z = Math.sin(b.phase * 0.6) * 0.022;
      });

      renderer.render(scene, camera);
    }
    let pulseT = 0;
    const t0 = setInterval(() => { pulseT += 0.05; links.forEach((l, i) => { l.mat.opacity = l.base * (0.86 + Math.sin(pulseT + i) * 0.14); }); }, 90);

    function select(id) {
      buildings.forEach((b) => b.scale.setScalar(b.userData.id === id ? 1.045 : 1));
      const picked = buildings.find((b) => b.userData.id === id);
      if (picked) {
        az = Math.atan2(picked.position.x - 0.001, picked.position.z) + 0.45;
        applyCamera();
      }
    }

    resize(); applyCamera(); raf = requestAnimationFrame(frame);

    const api = {
      select,
      dispose() {
        dead = true; cancelAnimationFrame(raf); clearInterval(t0); ro.disconnect(); if (io) io.disconnect(); ac.abort();
        owned.geo.forEach((g) => g.dispose());
        owned.mat.forEach((m) => m.dispose());
        owned.tex.forEach((t) => t.dispose());
        renderer.dispose();
        if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
        if (tip.parentNode) tip.parentNode.removeChild(tip);
        live = null;
      },
    };
    live = api;
    return api;
  }

  function escapeHtml(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  return { create, dispose() { if (live) live.dispose(); } };
})();
