// Lexicon C5: ship deployments stored in one direction (Tekton itw-c5-deployments-one-direction). Soli Deo Gloria.
// These are the CI twin of the two gates admin/lexicon/deployments.mjs --check enforces: itw_link_one_direction
// (port_to_ships is exactly what ships[*] says) and itw_ships_visiting_stale (every generated port block is
// exactly what the data renders).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DATA, MARK_START, MARK_END, callsOf, derivePortToShips, resolveShipPage, renderRegion, classifyBlock,
  linkedPages, blockHtml, plan, migrate, renderData,
} from '../../admin/lexicon/deployments.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const read = (rel) => readFileSync(path.join(ROOT, rel), 'utf8');
const data = JSON.parse(read(DATA));

test('port_to_ships is exactly what ships[*] says (itw_link_one_direction)', () => {
  assert.equal(renderData({ ...data, port_to_ships: derivePortToShips(data.ships) }), read(DATA));
  // and the file is in its own form, so a regenerate never reflows it
  assert.equal(renderData(data), read(DATA));
});

test('a link added in the derived direction only is refused', () => {
  const edited = structuredClone(data);
  const port = Object.keys(data.port_to_ships).find((p) => !callsOf(data.ships['msc-grandiosa']).includes(p));
  edited.port_to_ships[port] = [...edited.port_to_ships[port], 'msc-grandiosa'];
  assert.notEqual(renderData({ ...edited, port_to_ships: derivePortToShips(edited.ships) }), renderData(edited));
  // the remedy works: the same call filed in the stored direction derives cleanly
  edited.ships['msc-grandiosa'].also_calls_at = [...(edited.ships['msc-grandiosa'].also_calls_at ?? []), port].sort();
  assert.ok(derivePortToShips(edited.ships)[port].includes('msc-grandiosa'));
});

test('every generated port block is what the data renders (itw_ships_visiting_stale), and every link resolves', () => {
  const p = plan(ROOT);
  assert.ok(Object.keys(p.files).length > 300, `${Object.keys(p.files).length} generated blocks`);
  for (const [rel, text] of Object.entries(p.files)) {
    assert.equal(read(rel), text, `${rel} is stale: run node admin/lexicon/deployments.mjs`);
    const region = text.slice(text.indexOf(MARK_START), text.indexOf(MARK_END));
    for (const href of linkedPages(region)) assert.ok(existsSync(path.join(ROOT, href)), `${rel} links ${href}, which exists`);
  }
});

test('the migration lost nothing: one direction, every call a ship page shows still stored', () => {
  const m = data.metadata;
  assert.match(m.one_direction, /only stored direction/);
  assert.deepEqual(
    { reverse: m.migrated_to_one_direction.filed_from_reverse, pages: m.migrated_to_one_direction.filed_from_port_page_links },
    { reverse: 5015, pages: 32 },
  );
  assert.equal(m.last_updated, '2026-01-25', 'no deployment was re-researched, so the data is not fresher');
  for (const [slug, ship] of Object.entries(data.ships)) {
    for (const port of ship.also_calls_at ?? []) {
      assert.ok(!(ship.typical_ports ?? []).includes(port) && !(ship.homeports ?? []).includes(port), `${slug}: ${port} listed once`);
    }
  }
  assert.throws(() => migrate(ROOT, data), (e) => e.code === 'itw_migration_refused');
});

test('hand-written blocks are never rewritten; the generated grammar is adopted only when exact', () => {
  const p = plan(ROOT);
  const hand = new Set(p.hand.map((h) => h.port));
  for (const port of ['abidjan', 'abu-dhabi', 'juneau', 'petersburg', 'shanghai']) {
    assert.ok(hand.has(port), `${port} is hand-written`);
    assert.ok(!p.files[`ports/${port}.html`], `${port} is not rewritten`);
  }
  const block = (body, h = 'h3', I = '        ') => `<section class="card ships-visiting" aria-labelledby="ships-visiting-title">
${I}<${h} id="ships-visiting-title">Ships That Visit Here</${h}>
${I}<p class="tiny" style="margin-bottom: 0.75rem; color: var(--ink-mid, #3d5a6a); line-height: 1.5;">Cruise ships with Testport on their itineraries:</p>
${body}${I}<p class="tiny" style="margin-top: 0.75rem; color: var(--ink-light, #6b8a9a);"><a href="/ships/">Browse all cruise ships →</a></p>
${I.slice(2)}</section>`;
  const pills = (I = '        ') => `${I}<div class="ship-links">\n${I}  <a href="/ships/rcl/x.html" class="ship-link-pill" data-line="rcl" title="X (Icon Class)">X</a>\n${I}</div>\n`;
  assert.equal(classifyBlock(block(pills())).kind, 'adoptable');
  assert.equal(classifyBlock(block(pills('          '), 'h4', '          ')).kind, 'adoptable', 'h4 and another indent are still generated');
  assert.equal(classifyBlock(block(`${pills()}        <p class="tiny">Large ships cannot dock here.</p>\n`)).kind, 'hand', 'a note makes it hand-written');
  assert.equal(classifyBlock(block(`${pills()}        <noscript><ul><li>X</li></ul></noscript>\n`)).kind, 'hand');
  assert.equal(classifyBlock('<div class="card ships-visiting" aria-labelledby="ships-visiting-title"><h4 id="ships-visiting-title">Ships</h4></div>').kind, 'hand');
  assert.equal(classifyBlock(`<h3 id="ships-visiting-title">S</h3> ${MARK_START} y`).kind, 'hand', 'a start marker without its end is not trusted');
});

test('the renderer reproduces the old injector\'s output byte for byte (only the data changes a page)', () => {
  const ships = {
    'msc-world-europa': { name: 'MSC World Europa', class: 'World', cruise_line: 'msc' },
    'msc-bellissima': { name: 'MSC Bellissima', class: 'Meraviglia', cruise_line: 'msc' },
    'costa-firenze': { name: 'Costa Firenze', class: 'Venice', cruise_line: 'costa' },
  };
  const pages = { 'msc-world-europa': '/ships/msc/msc-world-europa.html', 'msc-bellissima': '/ships/msc/msc-bellissima.html', 'costa-firenze': '/ships/costa/costa-firenze.html' };
  // As scripts/inject-ships-visiting.js wrote it (origin/main before C5), with the label style later removed.
  const old = [
    '        <p class="cruise-line-label">MSC Cruises</p>',
    '        <div class="ship-links">',
    '          <a href="/ships/msc/msc-world-europa.html" class="ship-link-pill" data-line="msc" title="MSC World Europa (World Class)">MSC World Europa</a>',
    '          <a href="/ships/msc/msc-bellissima.html" class="ship-link-pill" data-line="msc" title="MSC Bellissima (Meraviglia Class)">MSC Bellissima</a>',
    '        </div>',
    '        <p class="cruise-line-label">Costa Cruises</p>',
    '        <div class="ship-links">',
    '          <a href="/ships/costa/costa-firenze.html" class="ship-link-pill" data-line="costa" title="Costa Firenze (Venice Class)">Costa Firenze</a>',
    '        </div>',
  ].join('\n');
  assert.equal(renderRegion(['costa-firenze', 'msc-bellissima', 'msc-world-europa'], ships, pages), old);
  assert.ok(!renderRegion(['msc-bellissima'], ships, pages).includes('cruise-line-label'), 'one line: no label');
  // a name is text, never markup: escaped in the title attribute and in the link text
  const odd = renderRegion(['x'], { x: { name: 'A & "B" <C>', class: 'Icon', cruise_line: 'rcl' } }, { x: '/ships/rcl/x.html' });
  assert.match(odd, /title="A &amp; &quot;B&quot; &lt;C&gt; \(Icon Class\)">A &amp; &quot;B&quot; &lt;C&gt;<\/a>/);
});

test('a line prefix is stripped from a slug only onto the ship\'s own page', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'itw-c5-'));
  mkdirSync(path.join(root, 'ships', 'oceania'), { recursive: true });
  writeFileSync(path.join(root, 'ships', 'oceania', 'insignia.html'), '');
  writeFileSync(path.join(root, 'ships', 'oceania', 'vista.html'), '');
  assert.equal(resolveShipPage(root, 'oceania-insignia', { cruise_line: 'oceania', name: 'Insignia' }), '/ships/oceania/insignia.html');
  assert.equal(resolveShipPage(root, 'oceania-insignia', { cruise_line: 'oceania', name: 'Vista' }), null, 'a different ship\'s page is never borrowed');
  assert.equal(resolveShipPage(root, 'oceania-nautica', { cruise_line: 'oceania', name: 'Nautica' }), null, 'no page, no link');
  assert.equal(resolveShipPage(root, 'insignia', { cruise_line: 'unknown-line', name: 'Insignia' }), null);
});

test('the old injector command now runs the new tool and cannot write with its stale folder map', () => {
  const src = read('scripts/inject-ships-visiting.js');
  assert.match(src, /admin', 'lexicon', 'deployments\.mjs'/);
  assert.ok(!/\/ships\/ncl\/|\/ships\/hal\/|\/ships\/virgin\//.test(src), 'no folder that does not exist');
  assert.equal(blockHtml('<p>no block</p>'), '');
});
