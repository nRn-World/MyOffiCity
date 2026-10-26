/* MyOffiCity: gratis 3D-modeller (CC0 1.0) till stadsdelen.
   Modellerna är hämtade från poly.pizza och är märkta CC0 1.0, vilket betyder att de
   får användas fritt – även kommersiellt – utan krav på attribution. Se models/CREDITS.md.
   Filen laddar bara det som efterfrågas, delar geometri och material mellan kopior och
   normaliserar storlek/orientering så att scenen kan placera dem i stadens skala.
   API: CityAssets.loadAll([...]).then(...) och fabrikerna tree/pine/bush/flowers/grass/
        car/person/lamp/bench. Alla returnerar en THREE.Group (eller {group, ...}).   */
window.CityAssets = (() => {
  'use strict';
  const T = () => window.THREE;
  const DIR = 'models/';
  const FILES = {
    bush: 'bush.glb',
    bushFlower: 'bush-flower.glb',
    flowers: 'flowers.glb',
    grass: 'grass.glb',
    pine: 'pine.glb',
    treeRound: 'tree-round.glb',
    treeTall: 'tree-tall.glb',
    bike: 'bicycle.glb',
    car: 'car-sedan.glb',
    taxi: 'car-taxi.glb',
    woman: 'person-woman.glb',
    man: 'person-man.glb',
    lamp: 'streetlight.glb',
    bench: 'bench.glb',
  };
  const cache = {}, loading = {};
  let loader = null;

  function getLoader() {
    const THREE = T();
    if (!THREE) throw new Error('3D: three.js saknas');
    if (!THREE.GLTFLoader) throw new Error('3D: GLTFLoader saknas');
    if (!loader) loader = new THREE.GLTFLoader();
    return loader;
  }

  function prepare(key, gltf) {
    const THREE = T(), scene = gltf.scene;
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3()), center = box.getCenter(new THREE.Vector3());
    const meta = { scene, clips: gltf.animations || [], size, center, min: box.min.clone(), bodyMats: [], wheelNodes: [], lightMats: [], leafMats: [] };
    scene.traverse((o) => {
      if (!o.isMesh) return;
      o.castShadow = o.receiveShadow = false;
      o.frustumCulled = key !== 'woman' && key !== 'man';
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      mats.forEach((m) => {
        if (!m) return;
        m.side = THREE.FrontSide;
        if (m.map) m.encoding = THREE.sRGBEncoding;
        if (m.emissiveMap) m.emissiveMap.encoding = THREE.sRGBEncoding;
        if (/^(windows|black|grey|headlights|taillights|material\.007)$/i.test(m.name)) return;
        if (/wheel/i.test(o.name)) return;
        meta.bodyMats.push({ mesh: o, mat: m });
      });
      if (/wheel/i.test(o.name)) meta.wheelNodes.push(o);
      if (/^(light|lamp|headlight)$/i.test((o.material && o.material.name) || '')) meta.lightMats.push(o.material);
    });
    if (key === 'lamp') {
      scene.traverse((o) => {
        if (!o.isMesh || !o.material) return;
        const m = o.material;
        if (/^(light|lamp)$/i.test(m.name || '')) {
          m.emissive = new THREE.Color(0xffe6b8); m.emissiveIntensity = 1.6; m.color.setHex(0xfff3d6);
          meta.lightMats.push(m);
        } else { m.color.setHex(0x2b3547); m.roughness = 0.55; m.metalness = 0.65; }
      });
    }
    if (key === 'treeRound' || key === 'treeTall') {
      /* riktiga lövträd: bark och lövverk har egna texturerade material.
         Fyra diskreta nyanser ger variation utan att skogen blir en grön massa. */
      const colors = [0xffffff, 0xf1f2e8, 0xdfe6cf, 0xefe8d5];
      scene.traverse((o) => {
        if (!o.isMesh || !o.material) return;
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        mats.forEach((m) => {
          m.roughness = 0.94; m.metalness = 0;
          if (/leaves|leaf/i.test(m.name || '')) {
            m.alphaTest = 0.38; m.transparent = false; m.depthWrite = true;
            if (!meta.leafMats.includes(m)) meta.leafMats.push(m);
          } else if (m.map) m.map.encoding = THREE.sRGBEncoding;
        });
      });
      meta.leafVariants = meta.leafMats.map((m) => colors.map((hex, i) => {
        if (i === 0) return m;
        const c = m.clone(); c.color = new THREE.Color(hex); return c;
      }));
    }
    if (key === 'pine') {
      scene.traverse((o) => {
        if (!o.isMesh || !o.material) return;
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        mats.forEach((m) => {
          m.roughness = 0.96; m.metalness = 0;
          if (/green|leaf|pine|needle/i.test(m.name || '')) {
            m.color.setHex(0x0a1f0d);
            m.emissive = new THREE.Color(0x0a1a10); m.emissiveIntensity = 0.35;
            meta.leafMats.push(m);
          } else { m.color.setHex(0x251b12); }
        });
      });
    }
    if (key === 'bench') {
      scene.traverse((o) => { if (o.isMesh && o.material) { o.material.roughness = 0.82; o.material.metalness = 0.08; } });
    }
    if (key === 'bush' || key === 'bushFlower' || key === 'flowers' || key === 'grass') {
      scene.traverse((o) => {
        if (!o.isMesh || !o.material) return;
        o.material.roughness = 0.92; o.material.metalness = 0;
        if (o.material.map) o.material.alphaTest = 0.32;
        if (!/flower/i.test(o.material.name || '')) o.material.color.setHex(0xffffff);
        meta.leafMats.push(o.material);
      });
    }
    if (key === 'bush' || key === 'bushFlower') {
      /* fyra tonvarianter så att träden inte blir en enda grön massa */
      const leaf = (meta.leafMats || []).find((m) => /leaves/i.test(m.name || '')) || meta.leafMats[0];
      if (leaf) {
        meta.leaf = leaf;
        meta.leafVariants = [leaf];
        [0x132512, 0x3a3612, 0x33190b].forEach((hex) => {
          const c = leaf.clone(); c.color.setHex(hex); meta.leafVariants.push(c);
        });
      }
    }
    meta.bodyMats = meta.bodyMats.filter((x, i, a) => a.indexOf(x) === i);
    return meta;
  }

  function load(key) {
    if (cache[key]) return Promise.resolve(cache[key]);
    if (loading[key]) return loading[key];
    if (!FILES[key]) return Promise.reject(new Error('3D: okänd modell ' + key));
    loading[key] = new Promise((ok, no) => {
      getLoader().load(DIR + FILES[key], (gltf) => {
        try { cache[key] = prepare(key, gltf); ok(cache[key]); }
        catch (e) { delete loading[key]; no(e); }
      }, undefined, (e) => { delete loading[key]; no(e); });
    });
    return loading[key];
  }

  const loadAll = (keys) => Promise.all(keys.filter((k) => FILES[k]).map(load));
  const has = (key) => !!cache[key];

  function cloneScene(src) {
    const THREE = T();
    return THREE.SkeletonUtils ? THREE.SkeletonUtils.clone(src) : src.clone(true);
  }

  /* --- delad geometri för stammar, stolpar och ljuspölar --- */
  let trunkGeo = null, trunkMat = null, poolTex = null, glowTex = null;
  function trunk() {
    const THREE = T();
    if (!trunkGeo) {
      trunkGeo = new THREE.CylinderGeometry(0.055, 0.095, 1, 7);
      trunkMat = new THREE.MeshStandardMaterial({ color: 0x130c06, roughness: 0.95, metalness: 0 });
    }
    return { geo: trunkGeo, mat: trunkMat };
  }
  function radialTex(inner, outer) {
    const THREE = T(), c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 2, 64, 64, 62);
    gr.addColorStop(0, inner); gr.addColorStop(0.55, outer); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding;
    return t;
  }
  function pool() {
    const THREE = T();
    if (!poolTex) poolTex = radialTex('rgba(255,214,150,.42)', 'rgba(255,196,120,.14)');
    return poolTex;
  }
  function glow() {
    const THREE = T();
    if (!glowTex) glowTex = radialTex('rgba(255,246,220,.95)', 'rgba(255,205,130,.35)');
    return glowTex;
  }

  /* --- träd: en frisk krona av lövverk (samma CC0-löv som buskarna) --- */
  function paintLeaf(obj, meta, r) {
    if (!meta.leaf || !meta.leafVariants) return;
    const pick = meta.leafVariants[Math.floor(r() * meta.leafVariants.length)] || meta.leaf;
    if (pick === meta.leaf) return;
    obj.traverse((o) => { if (o.isMesh && o.material === meta.leaf) o.material = pick; });
  }
  /* lövträd: två gratis CC0-modeller med riktig bark och lövverk.
     Modellen normaliseras till önskad höjd och förankras i marken. */
  function tree(opts) {
    const THREE = T(), o = opts || {}, r = o.rnd || Math.random;
    const key = o.species || (r() > 0.52 ? 'treeRound' : 'treeTall');
    const meta = cache[key] || cache.treeRound || cache.treeTall;
    const g = new THREE.Group();
    if (!meta) return g;
    const m = cloneScene(meta.scene);
    const h = o.h || 2.5, s = h / (meta.size.y || 1);
    m.scale.setScalar(s);
    m.position.set(-meta.center.x * s, -meta.min.y * s, -meta.center.z * s);
    m.rotation.y = r() * Math.PI * 2;
    m.rotation.z = (r() - 0.5) * 0.035;
    if (meta.leafVariants && meta.leafVariants.length) {
      const set = meta.leafVariants.map((list) => list[Math.floor(r() * list.length)]);
      m.traverse((x) => {
        if (!x.isMesh || !x.material) return;
        const i = meta.leafMats.indexOf(x.material);
        if (i >= 0) x.material = set[i];
      });
    }
    g.add(m);
    g.userData.sway = (o.sway == null ? 1 : o.sway);
    return g;
  }

  function pine(opts) {
    const THREE = T(), o = opts || {}, meta = cache.pine;
    const g = new THREE.Group();
    if (!meta) return g;
    const m = cloneScene(meta.scene);
    const h = o.h || 2.7, s = h / (meta.size.y || 1);
    m.scale.setScalar(s);
    m.position.set(-meta.center.x * s, -meta.min.y * s, -meta.center.z * s);
    m.rotation.y = (o.rnd || Math.random)() * Math.PI * 2;
    g.add(m);
    const t = trunk();
    const th = h * 0.16;
    const tm = new THREE.Mesh(t.geo, t.mat); tm.scale.set(0.8, th, 0.8); tm.position.y = th / 2 - 0.02; g.add(tm);
    g.userData.sway = 0.5;
    return g;
  }

  function bush(opts) {
    const THREE = T(), o = opts || {}, meta = cache[o.flower ? 'bushFlower' : 'bush'];
    const g = new THREE.Group();
    if (!meta) return g;
    const m = cloneScene(meta.scene);
    const r = o.rnd || Math.random;
    paintLeaf(m, meta, r);
    const h = o.h || 0.6, s = h / (meta.size.y || 1);
    m.scale.setScalar(s);
    m.position.set(-meta.center.x * s, -meta.min.y * s, -meta.center.z * s);
    m.rotation.y = r() * Math.PI * 2;
    g.add(m);
    return g;
  }

  function flowers(opts) {
    const THREE = T(), o = opts || {}, meta = cache.flowers;
    const g = new THREE.Group();
    if (!meta) return g;
    const n = o.n || 3, r = o.rnd || Math.random;
    for (let i = 0; i < n; i++) {
      const m = cloneScene(meta.scene);
      const s = (0.34 + r() * 0.2) * (o.h || 1) / (meta.size.y || 1);
      m.scale.setScalar(s);
      m.position.set((r() - 0.5) * (o.spread || 0.55), -meta.min.y * s, (r() - 0.5) * (o.spread || 0.55));
      m.rotation.y = r() * Math.PI * 2;
      g.add(m);
    }
    return g;
  }

  function grass(opts) {
    const THREE = T(), o = opts || {}, meta = cache.grass;
    const g = new THREE.Group();
    if (!meta) return g;
    const m = cloneScene(meta.scene);
    const h = o.h || 0.22, s = h / (meta.size.y || 1);
    m.scale.setScalar(s);
    m.position.set(-meta.center.x * s, -meta.min.y * s, -meta.center.z * s);
    m.rotation.y = (o.rnd || Math.random)() * Math.PI * 2;
    g.add(m);
    return g;
  }

  function lamp(opts) {
    const THREE = T(), o = opts || {}, meta = cache.lamp;
    const g = new THREE.Group();
    if (!meta) return g;
    const h = o.h || 3.3, s = h / (meta.size.y || 1);
    const m = cloneScene(meta.scene);
    m.scale.setScalar(s);
    m.position.set(-meta.center.x * s, -meta.min.y * s, -meta.center.z * s);
    m.rotation.y = o.rot || 0;
    g.add(m);
    const p = new THREE.Mesh(
      new THREE.PlaneGeometry(4.2, 4.2),
      new THREE.MeshBasicMaterial({ map: pool(), transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending })
    );
    p.rotation.x = -Math.PI / 2; p.position.y = 0.04; g.add(p);
    const s2 = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow(), color: 0xffe0a8, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending }));
    s2.scale.set(1.25, 1.25, 1); s2.position.y = h * 0.97; g.add(s2);
    return g;
  }

  function bench(opts) {
    const THREE = T(), o = opts || {}, meta = cache.bench;
    const g = new THREE.Group();
    if (!meta) return g;
    const m = cloneScene(meta.scene);
    const h = o.h || 0.5, s = h / (meta.size.y || 1);
    m.scale.setScalar(s);
    m.position.set(-meta.center.x * s, -meta.min.y * s, -meta.center.z * s);
    m.rotation.y = o.rot || 0;
    g.add(m);
    return g;
  }

  const CAR_COLORS = [0xd8dde6, 0x2b3a50, 0x8e2f34, 0x2f6b57, 0xb8863f, 0x55606e, 0x7a2f55, 0xe7e2d8];
  function car(opts) {
    const THREE = T(), o = opts || {}, key = o.taxi ? 'taxi' : 'car', meta = cache[key];
    const res = { group: new THREE.Group(), wheels: [], len: 1.5, kind: key };
    if (!meta) return res;
    const m = cloneScene(meta.scene);
    const target = o.len || 1.55, s = target / (meta.size.x || 1);
    m.scale.setScalar(s);
    m.position.set(-meta.center.x * s, -meta.min.y * s, -meta.center.z * s);
    const tint = o.color == null ? null : new THREE.Color(o.color);
    if (tint) {
      m.traverse((x) => {
        if (!x.isMesh || !x.material) return;
        const mats = Array.isArray(x.material) ? x.material : [x.material];
        const out = mats.map((mm) => {
          if (/^(windows|black|grey|headlights|taillights|material\.007)$/i.test(mm.name || '')) return mm;
          const c = mm.clone(); c.color.copy(tint); c.roughness = 0.38; c.metalness = 0.55; return c;
        });
        x.material = out.length === 1 ? out[0] : out;
      });
    }
    if (o.headlights !== false) {
      const hm = new THREE.MeshBasicMaterial({ color: 0xfff1c8 });
      for (const z of [-0.26, 0.26]) {
        const l = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.055, 0.12), hm);
        l.position.set(target * 0.49, 0.24, z);
        res.group.add(l);
      }
      const tail = new THREE.MeshBasicMaterial({ color: 0xff3b30 });
      for (const z of [-0.26, 0.26]) {
        const l = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.05, 0.11), tail);
        l.position.set(-target * 0.49, 0.24, z);
        res.group.add(l);
      }
    }
    res.group.add(m);
    res.len = target;
    res.wheels = [];
    meta.wheelNodes.forEach(() => {});
    m.traverse((x) => { if (/wheel/i.test(x.name)) res.wheels.push(x); });
    return res;
  }

  /* --- människor: två CC0-modeller med gång-, stå- och sitt-animationer --- */
  function person(opts) {
    const THREE = T(), o = opts || {}, key = o.kind === 'man' ? 'man' : 'woman', meta = cache[key];
    const res = { group: new THREE.Group(), mixer: null, actions: {}, key };
    if (!meta) return res;
    const m = cloneScene(meta.scene);
    const h = o.h || 0.84, s = h / (meta.size.y || 1);
    m.scale.setScalar(s);
    m.position.set(-meta.center.x * s, -meta.min.y * s, -meta.center.z * s);
    res.group.add(m);
    const mixer = new THREE.AnimationMixer(m);
    const pick = (re) => meta.clips.find((c) => re.test(c.name));
    const walkClip = pick(/walk/i), idleClip = pick(/_idle/i) || pick(/standing/i), sitClip = pick(/sitting|sit/i);
    if (walkClip) res.actions.walk = mixer.clipAction(walkClip);
    if (idleClip) res.actions.idle = mixer.clipAction(idleClip);
    if (sitClip) res.actions.sit = mixer.clipAction(sitClip);
    res.mixer = mixer;
    res.play = (name, speed) => {
      const a = res.actions[name]; if (!a) return;
      a.reset(); a.timeScale = speed || 1; a.play(); a.fadeIn(0.2);
    };
    res.stop = (name) => { const a = res.actions[name]; if (a) a.fadeOut(0.2); };
    res.h = h;
    return res;
  }

  /* --- cyklist: gratis cykelmodell + sittande CC0-person, redo att rulla --- */
  function bicycle(opts) {
    const THREE = T(), o = opts || {}, meta = cache.bike;
    const g = new THREE.Group();
    if (!meta) return g;
    const m = cloneScene(meta.scene);
    /* modellen är byggd i centimeter och har sin längd längs Z – normalisera
       efter den längsta horisontella sidan och vrid den till +X. */
    const raw = Math.max(meta.size.x, meta.size.z) || 1;
    const len = o.len || 1.06, s = len / raw;
    m.scale.setScalar(s);
    m.position.set(-meta.center.x * s, -meta.min.y * s, -meta.center.z * s);
    m.traverse((x) => { if (x.isMesh && x.material) { x.material.roughness = 0.5; x.material.metalness = 0.35; } });
    const inner = new THREE.Group();
    inner.rotation.y = Math.PI / 2 + (o.rot || 0);
    inner.add(m);
    g.add(inner);
    return g;
  }
  function cyclist(opts) {
    const THREE = T(), o = opts || {}, g = new THREE.Group();
    const bikeLen = o.len || 1.06;
    g.add(bicycle({ len: bikeLen, rot: o.rot || 0 }));
    const p = person({ kind: o.kind, h: 0.82 });
    if (p.group.children.length) {
      /* sittande kropp strax bakom sadeln, händerna mot styret */
      p.group.position.set(-0.1, 0.13, 0);
      p.group.rotation.y = Math.PI / 2;
      if (p.actions.sit) { p.actions.sit.reset().fadeIn(0.2).play(); p.actions.sit.timeScale = 0.16; }
      g.add(p.group);
    }
    g.userData.mixer = p.mixer;
    return g;
  }

  function warm(material, color, intensity) {
    if (!material) return material;
    material.emissive = new T().Color(color);
    material.emissiveIntensity = intensity == null ? 1 : intensity;
    return material;
  }

  return { load, loadAll, has, tree, pine, bush, flowers, grass, car, person, bicycle, cyclist, lamp, bench, warm, CAR_COLORS, pool, glow };
})();
