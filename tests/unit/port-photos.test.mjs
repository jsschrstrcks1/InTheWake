// The Ports tab: quick-links parity with the Ship tab, and a credited photo per port day sourced from
// that port's own page on the site. Photos are online enhancement (like the videos and live map); the
// port text stays offline. Operator 2026-09-26. Soli Deo Gloria.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const ROOT = new URL('../../', import.meta.url);
const js = readFileSync(new URL('admin/voyage-pwa/companion.js', ROOT), 'utf8');
const prima = readFileSync(new URL('admin/voyage-pwa/prima-caribbean.html', ROOT), 'utf8');

test('the Ports tab builds quick links and inserts port photos, like the Ship tab', () => {
  const fn = js.slice(js.indexOf('function renderPackTab('), js.indexOf('\nfunction schedNow('));
  assert.match(fn, /else if\(which==="ports"\)\{insertPortPhotos\(body\)/, 'ports branch inserts photos');
  assert.match(fn, /if\(qlp\.length>1\)el\.appendChild\(quickLinks\(qlp\)\)/, 'ports gets an "On this page" box');
  assert.match(js, /function insertPortPhotos\(body\)\{var P=V\.portPhotos/);
  assert.match(js, /function portFigure\(P\)\{[\s\S]*loading="lazy"/, 'port photos lazy-load');
});

test("a photo's credit matches its source: Flickers own vs Wikimedia", () => {
  const fig = js.slice(js.indexOf('function portFigure('), js.indexOf('function insertPortPhotos('));
  assert.match(fig, /P\.flickers\)\{[\s\S]*Photo © [\s\S]*flickersofmajesty\.com/, 'Flickers photos carry Ken’s copyright line');
  assert.match(fig, /Photo: "\+\(P\.credit\|\|""\)[\s\S]*Wikimedia Commons/, 'Wikimedia photos link their source');
});

test('Prima carries portPhotos for its ports, each image under /ports/img and none invented', () => {
  const m = prima.match(/window\.__VOYAGE\s*=\s*(\{[\s\S]*?\});/);
  // eslint-disable-next-line no-eval
  const V = eval('(' + m[1] + ')');
  const P = V.portPhotos;
  assert.ok(P, 'portPhotos present');
  assert.deepEqual(Object.keys(P).sort(), ['cozumel', 'falmouth', 'grand-cayman', 'great-stirrup-cay']);
  for (const k of Object.keys(P)) {
    assert.match(P[k].src, /^\/ports\/img\//, `${k} src is a real port image path`);
    assert.ok(P[k].alt && P[k].alt.length > 10, `${k} has alt text`);
    assert.ok(P[k].flickers || P[k].source, `${k} names a source`);
  }
  // Port Canaveral (embarkation/debarkation) has no sourced photo, so it must not be invented.
  assert.ok(!P['port-canaveral'] && !P.canaveral, 'no photo invented for Port Canaveral');
});
