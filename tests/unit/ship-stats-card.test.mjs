// The ship stats card is drawn by one renderer, from the page's own fallback, and nothing overwrites it.
// Tekton itw-stats-card-wiped-on-8-ship-pages. Soli Deo Gloria.
//
// Found 2026-10-23, measured 2026-10-26 in a browser over all 278 ship pages: 152 showed an empty stats
// card (nothing ever filled #ship-stats), and on Quantum, Radiance, Grandeur and Carnival Jubilee an
// inline loader drew the card and then replaced it with a fetched logbook persona file holding no stats.
// assets/js/ship-stats.js now draws every card from #ship-stats-fallback. This test fails if an inline
// loader comes back, if a page loses the script, or if the renderer's rules change.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { migratePage, shipPagesWithMount, SCRIPT_TAG } from '../../admin/migrate-ship-stats-card.mjs';

const ROOT = new URL('../../', import.meta.url).pathname;
const RENDERER = readFileSync(`${ROOT}assets/js/ship-stats.js`, 'utf8');

test('every ship page with a stats card loads the shared renderer once and carries no inline loader', () => {
  const pages = shipPagesWithMount(ROOT);
  assert.ok(pages.length > 250, `expected the full ship fleet, found ${pages.length}`);
  const bad = [];
  for (const rel of pages) {
    const html = readFileSync(ROOT + rel, 'utf8');
    if (html.includes('function renderStats')) bad.push(`${rel}: inline renderStats loader`);
    const n = html.split(SCRIPT_TAG).length - 1;
    if (n !== 1) bad.push(`${rel}: ship-stats.js tag appears ${n} times`);
    const fb = html.match(/id="ship-stats-fallback">([\s\S]*?)<\/script>/);
    if (!fb) bad.push(`${rel}: no #ship-stats-fallback`);
    else { try { JSON.parse(fb[1]); } catch (e) { bad.push(`${rel}: fallback JSON does not parse (${e.message})`); } }
  }
  assert.deepEqual(bad, [], 'remedy: node admin/migrate-ship-stats-card.mjs');
});

const LOADER = [
  '  <script src="/assets/js/a.js" defer></script>',
  '',
  '  <!-- ===== Ship stats loader ===== -->',
  '  <script>',
  '  (function initStats(){',
  "    const mount=document.getElementById('ship-stats'); if(!mount) return;",
  "    const fallbackEl=document.getElementById('ship-stats-fallback');",
  '    function abs(p){return p;}',
  '    function renderStats(obj){ mount.innerHTML=String(obj); }',
  '    function tryFetch(i){ return Promise.resolve(null); }',
  '  })();',
  '  </script>',
  '',
  '  <!-- ===== Dining loader ===== -->',
  '</body>',
  '</html>',
].join('\n');

test('migration removes the loader and its comment, adds the tag once, and is idempotent', () => {
  const r = migratePage(LOADER);
  assert.equal(r.removed, 1);
  assert.equal(r.added, true);
  assert.equal(r.html, [
    '  <script src="/assets/js/a.js" defer></script>',
    '',
    '',
    '  <!-- ===== Dining loader ===== -->',
    `  ${SCRIPT_TAG}`,
    '</body>',
    '</html>',
  ].join('\n'), 'only the loader block and its own comment line go; neighbours stay byte for byte');
  assert.equal(migratePage(r.html).html, r.html, 'a second run changes nothing');
});

test('migration refuses a renderStats block that also does something else', () => {
  const mixed = LOADER.replace('function tryFetch', 'function initVideos(){} function tryFetch');
  assert.throws(() => migratePage(mixed), (e) => e.code === 'unknown_shape');
  const otherId = LOADER.replace("getElementById('ship-stats-fallback')", "getElementById('dining-card')");
  assert.throws(() => migratePage(otherId), (e) => e.code === 'unknown_shape');
});

// A small DOM: enough for the renderer, nothing more.
function el(tag, attrs = {}) {
  return {
    nodeType: 1, tagName: tag.toUpperCase(), className: '', textContent: '', childNodes: [], attrs: { ...attrs }, parentNode: null,
    appendChild(c) { c.parentNode = this; this.childNodes.push(c); return c; },
    removeChild(c) { this.childNodes = this.childNodes.filter((x) => x !== c); c.parentNode = null; return c; },
    setAttribute(k, v) { this.attrs[k] = v; },
    getAttribute(k) { return this.attrs[k] ?? null; },
    querySelectorAll(sel) { return this.childNodes.filter((c) => c.nodeType === 1 && c.tagName === sel.toUpperCase()); },
  };
}
const text = (s) => ({ nodeType: 3, nodeValue: s });

function run({ fallback, children = [], funDistance } = {}) {
  const mount = el('div', { id: 'ship-stats' });
  for (const c of children) mount.appendChild(c);
  const fb = fallback === undefined ? null : Object.assign(el('script'), { textContent: typeof fallback === 'string' ? fallback : JSON.stringify(fallback) });
  const document = {
    readyState: 'complete',
    getElementById: (id) => (id === 'ship-stats' ? mount : id === 'ship-stats-fallback' ? fb : null),
    createElement: (t) => el(t),
    addEventListener() {},
  };
  vm.runInNewContext(RENDERER, { document, window: { funDistance } });
  const lines = mount.childNodes.filter((c) => c.className === 'stat-line')
    .map((l) => l.childNodes.map((s) => `${s.className}=${s.textContent}`).join(' | '));
  return { mount, lines };
}

const FULL = { class: 'Quantum Class', entered_service: 2014, gt: '168,666 GT', guests: '4,180', crew: '1,500', length: '1,142 ft (348 m)', beam: '136 ft (41 m)', registry: 'Bahamas' };

test('renderer draws every stat from the fallback, in order, as text', () => {
  const { lines, mount } = run({ fallback: FULL });
  assert.deepEqual(lines, [
    'stat-key=Class | stat-val=Quantum Class',
    'stat-key=Entered Service | stat-val=2014',
    'stat-key=Gross Tonnage | stat-val=168,666 GT',
    'stat-key=Guests | stat-val=4,180',
    'stat-key=Crew | stat-val=1,500',
    'stat-key=Length | stat-val=1,142 ft (348 m)',
    'stat-key=Beam | stat-val=136 ft (41 m)',
    'stat-key=Registry | stat-val=Bahamas',
  ]);
  assert.equal(mount.getAttribute('data-stats-rendered'), '8');
  const markup = run({ fallback: { class: '<img src=x onerror=alert(1)>' } }).lines[0];
  assert.equal(markup, 'stat-key=Class | stat-val=<img src=x onerror=alert(1)>', 'markup in data stays text');
});

test('renderer skips values that state no fact, and keeps TBD', () => {
  const { lines } = run({ fallback: { class: 'Historic', gt: 'N/A', guests: 'unknown', crew: ' ', entered_service: 'TBD' } });
  assert.deepEqual(lines, ['stat-key=Entered Service | stat-val=TBD']);
  const none = run({ fallback: { class: 'Historic', gt: 'Historic' } });
  assert.deepEqual(none.lines, []);
  assert.equal(none.mount.getAttribute('data-stats-rendered'), null, 'nothing to show: the mount is not marked');
});

test('renderer leaves hand-written content alone and replaces only a <noscript>', () => {
  const hand = el('div'); hand.className = 'stat-item';
  assert.deepEqual(run({ fallback: FULL, children: [hand] }).lines, [], 'a mount with its own markup is not touched');
  assert.deepEqual(run({ fallback: FULL, children: [text('  Built 2014  ')] }).lines, [], 'nor one with its own text');
  const ns = el('noscript'); const json = el('script');
  const { mount, lines } = run({ fallback: FULL, children: [text('\n  '), ns, json] });
  assert.equal(lines.length, 8);
  assert.ok(!mount.childNodes.includes(ns), 'the <noscript> copy goes');
  assert.ok(mount.childNodes.includes(json), 'a <script> inside the mount (the fallback itself, on some pages) stays');
});

test('renderer adds the fun-distance line for length and beam only when funDistance is on the page', () => {
  const funDistance = { shipLength: (ft) => ({ practical: `${ft} ft long`, absurd: 'many hot dogs' }), shipBeam: () => ({ practical: 'wide' }) };
  const { lines } = run({ fallback: FULL, funDistance });
  assert.equal(lines[5], 'stat-key=Length | stat-val=1,142 ft (348 m) | stat-fun=1142 ft long, or many hot dogs');
  assert.equal(lines[6], 'stat-key=Beam | stat-val=136 ft (41 m) | stat-fun=wide');
  assert.equal(lines[0], 'stat-key=Class | stat-val=Quantum Class');
  const other = run({ fallback: { registry: '40 ft barge registry' }, funDistance });
  assert.deepEqual(other.lines, ['stat-key=Registry | stat-val=40 ft barge registry'], 'a feet-shaped value in another key gets no fun line');
});

test('renderer does nothing when the fallback is missing or broken', () => {
  assert.deepEqual(run({}).lines, []);
  assert.deepEqual(run({ fallback: '{not json' }).lines, []);
});
