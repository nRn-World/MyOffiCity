'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');

function extractDisposeTree(src) {
  const start = src.indexOf('function disposeTree(obj)');
  assert.notEqual(start, -1, 'disposeTree(obj) must exist in office.js');
  let depth = 0, i = src.indexOf('{', start);
  for (; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}' && --depth === 0) break;
  }
  return src.slice(start, i + 1);
}

function makeNode(name, { geo, mat, userData = {}, children = [] } = {}) {
  const node = {
    name,
    geometry: geo || null,
    material: mat || null,
    userData,
    children,
    traverse(fn) {
      fn(this);
      for (const c of this.children) c.traverse(fn);
    },
  };
  return node;
}

function makeAsset(label) {
  const tex = { label: label + ':tex', disposed: false, dispose() { this.disposed = true; } };
  const mat = { label: label + ':mat', map: tex, disposed: false, dispose() { this.disposed = true; } };
  const geo = { label: label + ':geo', disposed: false, dispose() { this.disposed = true; } };
  const template = makeNode(label, { geo, mat });
  return { tex, mat, geo, template };
}

for (const rel of ['office.js', 'market/public/office.js']) {
  test(`${rel}: disposeTree preserves all cached 3D model geometries, materials, and textures`, () => {
    const src = fs.readFileSync(path.join(ROOT, rel), 'utf8');
    const fnSrc = extractDisposeTree(src);

    const oak = makeAsset('oak');
    const taxi = makeAsset('civil-taxi');
    const sedan = makeAsset('carpack-sedan');
    const bike = makeAsset('bike');
    const human = makeAsset('human-glb');
    const cityHumanGeo = { label: 'cityassets-human:geo', disposed: false, dispose() { this.disposed = true; } };
    const cityHumanTex = { label: 'cityassets-human:recolorTex', disposed: false, dispose() { this.disposed = true; } };
    const cityHumanMat = { label: 'cityassets-human:recolorMat', map: cityHumanTex, disposed: false, dispose() { this.disposed = true; } };

    const gkGeo = { label: 'gk:geo', disposed: false, dispose() { this.disposed = true; } };
    const gkThin = { label: 'gk:thin', disposed: false, dispose() { this.disposed = true; } };
    const gkThin8 = { label: 'gk:thin8', disposed: false, dispose() { this.disposed = true; } };
    const gkTex = { label: 'gk:tex', disposed: false, dispose() { this.disposed = true; } };
    const gpMat = { label: 'gpMat', disposed: false, dispose() { this.disposed = true; } };
    const lawnTex = { label: 'LAWN', disposed: false, dispose() { this.disposed = true; } };
    const taxiTex = { label: 'TAXI_TEX', disposed: false, dispose() { this.disposed = true; } };
    const beamGeo = { label: 'BEAM_GEO', disposed: false, dispose() { this.disposed = true; } };
    const coneGeo = { label: 'CONE_GEO', disposed: false, dispose() { this.disposed = true; } };

    const tempWall = makeAsset('per-build-wall');

    const root = makeNode('root', {
      children: [
        makeNode('oak-clone', { geo: oak.geo, mat: oak.mat }),
        makeNode('taxi-clone', { geo: taxi.geo, mat: taxi.mat }),
        makeNode('sedan-clone', { geo: sedan.geo, mat: sedan.mat }),
        makeNode('bike-clone', { geo: bike.geo, mat: bike.mat }),
        makeNode('human-clone', { geo: human.geo, mat: human.mat }),
        makeNode('cityassets-human', {
          userData: { glb: true },
          children: [makeNode('cityassets-mesh', { geo: cityHumanGeo, mat: cityHumanMat })],
        }),
        makeNode('grass-inst', { geo: gkGeo, mat: gpMat }),
        makeNode('ground', { mat: { map: lawnTex, disposed: false, dispose() { this.disposed = true; } } }),
        makeNode('taxi-sign', { mat: { map: taxiTex, disposed: false, dispose() { this.disposed = true; } } }),
        makeNode('beam', { geo: beamGeo }),
        makeNode('cone', { geo: coneGeo }),
        tempWall.template,
      ],
    });

    const ctx = vm.createContext({
      BEAM_GEO: beamGeo,
      CONE_GEO: coneGeo,
      GK: { tex: gkTex, geos: [gkGeo], thin: [gkThin], thin8: [gkThin8] },
      gpMat,
      beamMat: null, coneMat: null, glowMat: null, tailMat: null,
      dark: null, metal: null, wood: null, woodD: null, chairM: null, white: null, trim: null,
      FLAME_TEX: null, GT: null, LAWN: lawnTex, TAXI_TEX: taxiTex,
      FACE_CACHE: new Map(),
      OAKS: [oak.template],
      CIVIL: { taxi: { g: taxi.template } },
      CARPACK: { sedan: { g: sedan.template } },
      BIKES: [{ g: bike.template }],
      HUMAN_GLBS: { tomas: { scene: human.template } },
    });

    vm.runInContext(`${fnSrc}; disposeTree;`, ctx)(root);

    for (const [name, a] of [['oak', oak], ['civil-taxi', taxi], ['carpack-sedan', sedan], ['bike', bike], ['human-glb', human]]) {
      assert.equal(a.geo.disposed, false, `${name} geometry must NOT be disposed`);
      assert.equal(a.mat.disposed, false, `${name} material must NOT be disposed`);
      assert.equal(a.tex.disposed, false, `${name} texture must NOT be disposed`);
    }
    assert.equal(cityHumanGeo.disposed, false, 'CityAssets human geometry must NOT be disposed');
    assert.equal(gkGeo.disposed, false, 'GK grass geometry must NOT be disposed');
    assert.equal(gpMat.disposed, false, 'gpMat must NOT be disposed');
    assert.equal(gkTex.disposed, false, 'GK.tex must NOT be disposed');
    assert.equal(lawnTex.disposed, false, 'LAWN texture must NOT be disposed');
    assert.equal(taxiTex.disposed, false, 'TAXI_TEX must NOT be disposed');
    assert.equal(beamGeo.disposed, false, 'BEAM_GEO must NOT be disposed');
    assert.equal(coneGeo.disposed, false, 'CONE_GEO must NOT be disposed');

    // Per-build objects MUST still be disposed to avoid GPU memory leaks
    assert.equal(tempWall.geo.disposed, true, 'non-shared geometry should be disposed');
    assert.equal(tempWall.mat.disposed, true, 'non-shared material should be disposed');
    assert.equal(tempWall.tex.disposed, true, 'non-shared texture should be disposed');
  });
}

test('market/public/_headers allows Referer origin for Google Sign-In', () => {
  const headers = fs.readFileSync(path.join(ROOT, 'market/public/_headers'), 'utf8');
  const m = /^\s*Referrer-Policy:\s*(.+)$/im.exec(headers);
  assert.ok(m, 'Referrer-Policy header must be set in market/public/_headers');
  const policy = m[1].trim().toLowerCase();
  assert.notEqual(policy, 'no-referrer', 'Referrer-Policy: no-referrer breaks Google Identity Services (400 Bad Request)');
  assert.ok(
    ['strict-origin-when-cross-origin', 'no-referrer-when-downgrade', 'origin', 'origin-when-cross-origin'].includes(policy),
    `Referrer-Policy "${policy}" must send origin to accounts.google.com`
  );
});

test('market/src/index.js AI relay rotates providers, trims oversized prompts, and preserves external errors', () => {
  const src = fs.readFileSync(path.join(ROOT, 'market/src/index.js'), 'utf8');
  assert.match(src, /Math\.floor\(Date\.now\(\)\s*\/\s*3600000\)\s*%\s*active\.length/, 'activeRelaySpecs must rotate starting provider hourly');
  assert.match(src, /compactRelayMessages/, 'runExternalRelay must retry with compact prompt on 413/400');
  assert.match(src, /extSummary/, 'callSprintAi must preserve external provider failure summary alongside Cloudflare errors');
});
