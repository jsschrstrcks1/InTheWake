// The offline guides: every companion carries the full pack, readable with no signal. Soli Deo Gloria.
// No pandoc here (CI may not have it): these read what the builder committed, and unit-test its pure parts.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { sectionsOf, setGuide, page, packContent, contentBlock, setContent, MARK_START } from '../../../admin/scripts/build-voyage-guides.mjs';

const ROOT = new URL('../../../', import.meta.url);
const voyageOf = (html) => {
  const m = html.match(/window\.__VOYAGE=(\{[\s\S]*?\});<\/script>/);
  return Function('"use strict";return (' + m[1] + ')')();
};

test('every registered companion links a committed guide that has the pack sections and no script', async () => {
  const packs = JSON.parse(await readFile(new URL('admin/voyage-packs/packs.json', ROOT), 'utf8'));
  let n = 0;
  for (const p of packs) {
    if (!p.pwa || !existsSync(new URL(`admin/voyage-packs/${p.slug}.md`, ROOT))) continue;
    const V = voyageOf(await readFile(new URL(p.pwa, ROOT), 'utf8'));
    assert.ok(V.guide && V.guide.url, `${p.pwa} has no guide`);
    assert.match(V.guide.url, /^\/admin\/voyage-pwa\/guides\/[a-z0-9-]+-guide\.html\?v=[0-9a-f]{10}$/, `${p.pwa} guide url shape`);
    const file = V.guide.url.slice(1).replace(/\?.*$/, '');
    const g = await readFile(new URL(file, ROOT), 'utf8');
    assert.ok(!/<script/i.test(g), `${file} must carry no script`);
    assert.ok(g.includes(`href="/${p.pwa}"`), `${file} links back to its companion`);
    const ids = V.guide.sections.map((s) => s.id);
    for (const id of ids) assert.ok(g.includes(`id="${id}"`), `${file} lacks #${id}`);
    assert.ok(V.guide.sections.some((s) => /ship/i.test(s.label)), `${p.slug} guide has no ship section`);
    assert.ok(V.guide.sections.some((s) => /emergency/i.test(s.label)), `${p.slug} guide has no emergency section`);
    n++;
  }
  assert.ok(n >= 11, `only ${n} companions carry a guide`);
});

test('the service worker precaches the guide stylesheet, and companions may fetch their own origin', async () => {
  const sw = await readFile(new URL('admin/voyage-pwa/sw.js', ROOT), 'utf8');
  assert.ok(sw.includes('"/admin/voyage-pwa/guide.css?v='), 'guide.css not precached');
  const html = await readFile(new URL('admin/voyage-pwa/prima-caribbean.html', ROOT), 'utf8');
  const connect = html.match(/connect-src ([^;"]*)/)[1];
  assert.ok(connect.split(/\s+/).includes("'self'"), "connect-src needs 'self' or the guide prefetch is refused");
});

test('sectionsOf skips the table of contents and strips markup from labels', () => {
  const s = sectionsOf('<h2 id="toc">Table of Contents</h2><h2 id="section-1">Section 1 — <em>Your Ship</em></h2>');
  assert.deepEqual(s, [{ id: 'section-1', label: 'Section 1 — Your Ship' }]);
});

test('setGuide inserts once and replaces in place, never duplicating', () => {
  const html = '<script>window.__VOYAGE={slug:"v0.1.9-x",ship:"X"};</script>';
  const g1 = { url: '/a?v=1111111111', sections: [{ id: 'a', label: 'A {b}' }] };
  const once = setGuide(html, 'v0.1.9-x', g1);
  const again = setGuide(once, 'v0.1.9-x', { url: '/a?v=2222222222', sections: [] });
  assert.equal((again.match(/guide:/g) || []).length, 1);
  assert.ok(again.includes('/a?v=2222222222') && !again.includes('1111111111'));
  assert.ok(again.includes('ship:"X"'));
});

test('the page template escapes the title and forbids script by CSP', () => {
  const out = page({ title: 'A <b> & "c"', companionUrl: '/x.html', companionName: 'Ship', fragment: '<p>hi</p>' });
  assert.ok(out.includes('A &lt;b&gt; &amp; &quot;c&quot;'));
  assert.ok(out.includes("script-src 'none'"));
  assert.ok(out.includes('<main id="content"'));
});

test('every companion embeds its Ship and Ports tabs and an offline search index, once', async () => {
  const packs = JSON.parse(await readFile(new URL('admin/voyage-packs/packs.json', ROOT), 'utf8'));
  for (const p of packs) {
    if (!p.pwa || !existsSync(new URL(`admin/voyage-packs/${p.slug}.md`, ROOT))) continue;
    const html = await readFile(new URL(p.pwa, ROOT), 'utf8');
    assert.equal(html.split(MARK_START).length, 2, `${p.pwa} pack-content block missing or duplicated`);
    const ship = html.match(/<template id="tpl-ship">([\s\S]*?)<\/template>/);
    assert.ok(ship && /<h2 id="pk-[^"]+"[^>]*>[^<]*Your Ship/i.test(ship[1]), `${p.pwa} has no Ship tab content`);
    const ports = html.match(/<template id="tpl-ports">([\s\S]*?)<\/template>/);
    assert.ok(ports && (ports[1].match(/<h3 /g) || []).length >= 3, `${p.pwa} has too few port days`);
    const idx = JSON.parse(html.match(/<script type="application\/json" id="pack-index">([\s\S]*?)<\/script>/)[1]);
    assert.ok(idx.length >= 20 && idx.every((b) => b.t && b.a && ['ship', 'ports', 'guide'].includes(b.s)), `${p.pwa} search index shape`);
    assert.ok(!/<script(?! type="application\/json")/.test(ship[1] + ports[1]), `${p.pwa} embedded content carries a script`);
  }
});

test('packContent: ship from Your Ship, ports from the day-by-day minus sea days, search spans the pack', () => {
  const f = '<h2 id="welcome">Welcome</h2><p>hi</p>'
    + '<h2 id="section-1">Section 1 — Your Ship: X</h2><h3 id="cabins">Cabins</h3><p>quiet aft <a href="#section-6">see</a></p>'
    + '<h2 id="section-2">Section 2 — Day by Day</h2><h3 id="d1">Day 1 — Port A</h3><p>tender</p><h3 id="d2">Day 2 — Cruising at sea</h3><p>spa</p><h3 id="d3">Day 3 — Port B</h3><p>walk</p>'
    + '<h2 id="section-4">Section 4 — Packing</h2><p>hat</p>';
  const c = packContent(f, '/g.html?v=1');
  assert.ok(c.shipHtml.includes('id="pk-cabins"') && c.shipHtml.includes('href="/g.html?v=1#section-6"'));
  assert.ok(c.portsHtml.includes('Port A') && c.portsHtml.includes('Port B') && !c.portsHtml.includes('Cruising at sea'));
  const by = Object.fromEntries(c.index.map((b) => [b.t, b]));
  assert.equal(by['Cabins'].s, 'ship'); assert.equal(by['Cabins'].a, 'pk-cabins');
  assert.equal(by['Day 1 — Port A'].s, 'ports');
  assert.equal(by['Day 2 — Cruising at sea'].s, 'guide');
  assert.equal(by['Section 4 — Packing'].s, 'guide'); assert.equal(by['Section 4 — Packing'].x, 'hat');
});

test('setContent replaces its own block in place and the JSON cannot close its script tag', () => {
  const html = "<div id=app></div>\n<script>if('serviceWorker' in navigator){}</script>";
  const b1 = contentBlock({ shipHtml: '<h2>A</h2>', portsHtml: '', index: [{ t: '</script><b>', s: 'guide', a: 'x', x: '' }] });
  const once = setContent(html, b1);
  const twice = setContent(once, contentBlock({ shipHtml: '<h2>B</h2>', portsHtml: '', index: [] }));
  assert.equal(twice.split(MARK_START).length, 2);
  assert.ok(twice.includes('<h2>B</h2>') && !twice.includes('<h2>A</h2>'));
  assert.ok(!b1.includes('</script><b>'), 'index JSON must escape <');
});
