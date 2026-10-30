// Lexicon C7a: one line-scoped identity for every venue store (Tekton itw-c7a-venue-identity). Soli Deo Gloria.
// The identity and matching rules run everywhere; the statement checks need Project-Sophos's contract and skip,
// saying so, when it is not beside this checkout.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { matchInLine, lineOfShipKeys, pageProviders, readStores, buildVenueStatements, venueId, OUT_DIR, ALIASES_FILE, REVIEW_FILE } from '../../admin/lexicon/venue-statements.mjs';
import { loadContract } from '../../admin/lexicon/ship-statements.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const LEX = process.env.LEXICON_CONTRACT_DIR ? path.resolve(process.env.LEXICON_CONTRACT_DIR) : path.resolve(ROOT, '..', 'Project-Sophos', 'sophos', 'src', 'lexicon');
const skip = existsSync(path.join(LEX, 'statement.mjs')) ? false : 'Project-Sophos not beside this checkout';
const json = (rel) => JSON.parse(readFileSync(path.join(ROOT, rel), 'utf8'));
const src = readStores(ROOT);

test('a store key maps only within its own line: slug, then prefixed slug, then a name one venue carries', () => {
  const byLine = new Map([
    ['norwegian', new Map([['ncl-taste', { slug: 'ncl-taste', name: 'Taste' }], ['ncl-cagneys', { slug: 'ncl-cagneys', name: "Cagney's Steakhouse" }]])],
    ['royal-caribbean', new Map([['teppanyaki', { slug: 'teppanyaki', name: 'Teppanyaki' }]])],
    ['msc', new Map([['top-sail-a', { slug: 'top-sail-a', name: 'Top Sail Lounge' }], ['top-sail-b', { slug: 'top-sail-b', name: 'Top Sail Lounge' }]])],
  ]);
  assert.equal(matchInLine('teppanyaki', 'Teppanyaki', 'norwegian', 'ncl', byLine), null, "another line's slug is never a match");
  assert.deepEqual(matchInLine('taste', 'Taste', 'norwegian', 'ncl', byLine), { slug: 'ncl-taste', how: 'prefixed slug' });
  assert.deepEqual(matchInLine('cagneys-steakhouse', "Cagney's Steakhouse", 'norwegian', 'ncl', byLine), { slug: 'ncl-cagneys', how: 'name' });
  assert.deepEqual(matchInLine('top-sail-lounge', 'Top Sail Lounge', 'msc', 'msc', byLine), { ambiguous: ['top-sail-a', 'top-sail-b'] });
  assert.equal(matchInLine('teppanyaki', 'Teppanyak', 'royal-caribbean', null, new Map()), null);
});

test('a venue listed on ships of two lines is placed on neither', () => {
  const ships = new Map([['a', { ship: 'ship:a', line: 'carnival' }], ['b', { ship: 'ship:b', line: 'msc' }], ['c', { ship: 'ship:c', line: 'carnival' }]]);
  assert.deepEqual(lineOfShipKeys(['a', 'c'], ships), { line: 'carnival' });
  assert.deepEqual(lineOfShipKeys(['a', 'b'], ships), { lines: ['carnival', 'msc'] });
  assert.equal(lineOfShipKeys(['unknown'], ships), null);
});

test("a page names its line only through a provider's name", () => {
  assert.deepEqual(pageProviders('<script type="application/ld+json">{"provider": {"@type": "Organization", "name": "Royal Caribbean International"}}</script>'), ['Royal Caribbean International']);
  assert.deepEqual(pageProviders('<p>Royal Caribbean International</p>'), []);
});

test('the colliding slugs are different venues on different lines', () => {
  const ids = [...src.facts.keys()];
  assert.ok(ids.includes(venueId('royal-caribbean', 'teppanyaki')));
  assert.ok(!ids.includes(venueId('norwegian', 'teppanyaki')), "Norwegian's teppanyaki maps to its own ncl- venue, never to Royal Caribbean's");
  const ncl = json(ALIASES_FILE).lists.find((l) => l.file === 'assets/data/ncl-venues.json');
  assert.ok(ncl.matched.teppanyaki.venue.startsWith('venue:norwegian.'), ncl.matched.teppanyaki.venue);
});

test('every venue sits on ships of one line, and every key is mapped, listed or new: none is dropped', () => {
  for (const [id, facts] of src.facts) {
    const lines = new Set(facts.filter((f) => f.property === 'line').map((f) => f.value));
    assert.equal(lines.size, 1, `${id} has ${lines.size} lines`);
    assert.equal([...lines][0], `line:${id.slice(6, id.indexOf('.'))}`);
  }
  for (const l of json(ALIASES_FILE).lists.filter((x) => x.file.endsWith('-venues.json'))) {
    const keys = json(l.file).venues.map((v) => v.slug);
    const seen = new Set([...Object.keys(l.matched), ...l.ambiguous.map((a) => a.key), ...l.unmatched.map((u) => u.key), ...l.new_venues.map((id) => id.slice(id.indexOf('.') + 1))]);
    for (const k of keys) assert.ok(seen.has(k), `${l.file} ${k} is neither mapped, listed nor new`);
  }
});

test('ships is filed from venues-v2 alone; an older store that disagrees is listed for review, never filed', { skip }, () => {
  const chops = json(`${OUT_DIR}/royal-caribbean.chops.json`);
  const ships = chops.statements.filter((s) => s.ext.property === 'ships');
  assert.equal(ships.length, 1);
  assert.deepEqual(ships[0].epistemic.evidence.map((e) => e.ref), ['itw:assets/data/venues-v2.json#ships[*].venues']);
  for (const r of json(REVIEW_FILE).ship_review) assert.notEqual(r.store, 'assets/data/venues-v2.json');
});

test('the entity files, alias table and review list are exactly what the stores say (regenerate if this fails)', { skip }, async () => {
  const { files } = await buildVenueStatements(ROOT, await loadContract({ LEXICON_CONTRACT_DIR: LEX }));
  for (const [rel, text] of Object.entries(files)) assert.equal(readFileSync(path.join(ROOT, rel), 'utf8'), text, rel);
  assert.deepEqual(readdirSync(path.join(ROOT, OUT_DIR)).map((f) => `${OUT_DIR}/${f}`).sort(), Object.keys(files).filter((r) => r.startsWith(OUT_DIR)).sort());
});

test('a price and prose are listed as not filed, with the reason', { skip }, () => {
  const withCost = json('assets/data/venues-v2.json').venues.find((v) => v.cost && src.facts.has(venueId('royal-caribbean', v.slug)));
  assert.ok(withCost, 'a Royal Caribbean venue with a cost');
  const e = json(`${OUT_DIR}/royal-caribbean.${withCost.slug}.json`);
  assert.ok(e.not_filed.some((n) => n.source.endsWith('.cost') && /Track C7b/.test(n.reason)));
  assert.ok(!e.statements.some((s) => JSON.stringify(s.ext.value).includes('$')));
});
