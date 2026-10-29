// Lexicon C6: one identity for every port list, its facts as statements (Tekton itw-c6-port-pack).
// Soli Deo Gloria. The parsing and identity rules run everywhere; the statement checks need Project-Sophos's
// contract with geo positions (Project-Sophos #1488) and skip, saying so, when it is not there.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { pagePlace, readSources, aliasTable, buildPortStatements, OUT_DIR, DISPUTES_FILE } from '../../admin/lexicon/port-statements.mjs';
import { loadContract } from '../../admin/lexicon/ship-statements.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const LEX = process.env.LEXICON_CONTRACT_DIR ? path.resolve(process.env.LEXICON_CONTRACT_DIR) : path.resolve(ROOT, '..', 'Project-Sophos', 'sophos', 'src', 'lexicon');
const st = existsSync(path.join(LEX, 'statement.mjs')) ? await import(pathToFileURL(path.join(LEX, 'statement.mjs')).href) : null;
const skip = !st ? 'Project-Sophos not beside this checkout' : typeof st.distanceM !== 'function' ? 'the contract here has no geo positions yet (Project-Sophos #1488)' : false;
const entity = (slug) => JSON.parse(readFileSync(path.join(ROOT, OUT_DIR, `${slug}.json`), 'utf8'));

test('a page states its own place in its JSON-LD mainEntity; other positions on the page are not it', () => {
  const html = `<script type="application/ld+json">{"@type":"WebPage","mainEntity":{"@type":"Place","name":"Corfu","geo":{"latitude":39.6243,"longitude":19.9217}},
    "hasPart":[{"@type":"TouristAttraction","name":"Old Fortress","geo":{"latitude":39.62,"longitude":19.93}}]}</script>`;
  assert.deepEqual(pagePlace(html), { name: 'Corfu', position: { lat: 39.6243, lon: 19.9217 }, count: 1 });
  assert.deepEqual(pagePlace('<p>no data</p>'), { name: null, position: null, count: 0 });
});

test('every list keyed by slug maps onto a port page; a name that does not match exactly is listed, never guessed', () => {
  const a = aliasTable(readSources(ROOT));
  for (const l of a.lists.filter((x) => x.keyed_by === 'slug')) assert.equal(l.unmatched.length, 0, `${l.file} has keys with no page`);
  const csv = a.lists.find((x) => x.file === 'data/ports.csv');
  const guessed = csv.unmatched.filter((u) => u.key in csv.matched);
  assert.deepEqual(guessed, []);
  assert.equal(Object.keys(csv.matched).length + csv.unmatched.length + csv.ambiguous.length, readFileSync(path.join(ROOT, 'data/ports.csv'), 'utf8').split(/\r?\n/).slice(1).filter((l) => l.trim()).length);
});

test('a name two ports share is ambiguous and a name no port has is unmatched; neither is mapped', () => {
  const src = { pages: ['st-john-usvi', 'st-johns-antigua'], registry: {}, geo: {}, summaries: {}, seasonal: {}, maps: {},
    facts: { 'st-john-usvi': [{ property: 'name', value: 'St. John' }], 'st-johns-antigua': [{ property: 'page_place_name', value: 'St John' }] },
    csv: ['St. John', 'Atlantis', 'St Johns Antigua'] };
  const csv = aliasTable(src).lists.find((x) => x.keyed_by !== 'slug');
  assert.deepEqual(csv.ambiguous, [{ key: 'St. John', candidates: ['port:st-john-usvi', 'port:st-johns-antigua'] }]);
  assert.deepEqual(csv.unmatched.map((u) => u.key), ['Atlantis']);
  assert.deepEqual(csv.matched, { 'St Johns Antigua': 'port:st-johns-antigua' });
});

test('the entity files, alias table and dispute list are exactly what the files say (regenerate if this fails)', { skip }, async () => {
  const { files } = await buildPortStatements(ROOT, { ...(await loadContract({ LEXICON_CONTRACT_DIR: LEX })) });
  for (const [rel, text] of Object.entries(files)) assert.equal(readFileSync(path.join(ROOT, rel), 'utf8'), text, rel);
  assert.deepEqual(readdirSync(path.join(ROOT, OUT_DIR)).map((f) => `${OUT_DIR}/${f}`).sort(), Object.keys(files).filter((r) => r.startsWith(OUT_DIR)).sort());
});

test('identical copies are one statement citing every file; ports-geo never counts as a second witness', { skip }, () => {
  const corfu = entity('corfu').statements.filter((s) => s.ext.property === 'place_position');
  assert.equal(corfu.length, 1);
  assert.equal(corfu[0].ext.tolerance_m, 5000);
  assert.deepEqual(corfu[0].epistemic.evidence.map((e) => e.ref.split('#')[0]).sort(),
    ['itw:assets/data/ports/port-registry.json', 'itw:assets/data/ports/ports-geo.json', 'itw:ports/corfu.html']);
});

test('a town and its terminal are two facts: the map pin is terminal_position, never a disputed place_position', { skip }, () => {
  const corfu = entity('corfu');
  assert.equal(corfu.statements.filter((s) => s.ext.property === 'terminal_position').length, 1);
  assert.ok(!corfu.statements.some((s) => s.ext.property === 'place_position' && s.epistemic.evidence.some((e) => e.ref.includes('/maps/'))));
});

test("every named dispute is beyond the pack's tolerance, and no two positions within it are named", { skip }, () => {
  const d = JSON.parse(readFileSync(path.join(ROOT, DISPUTES_FILE), 'utf8'));
  assert.ok(d.count > 0);
  for (const x of d.disputes) {
    const [a, b] = x.sides.map((s) => s.value);
    assert.ok(st.distanceM(a, b) > x.tolerance_m, `${x.entity} named at ${x.distance_m} m within ${x.tolerance_m} m`);
  }
});
