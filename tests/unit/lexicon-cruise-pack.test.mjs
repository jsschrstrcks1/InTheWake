// Lexicon cruise pack and line alias table (Tekton itw-c1-cruise-pack-schema). Soli Deo Gloria.
// The pack is checked by the household's own pack format (Project-Sophos sophos/src/lexicon/packs.mjs)
// when Project-Sophos sits beside this repo; the structural checks below run everywhere.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import { buildLineAliases, render, normaliseName, OUT } from '../../admin/lexicon/line-aliases.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const pack = JSON.parse(readFileSync(path.join(ROOT, 'assets/data/lexicon/cruise.ship.pack.json'), 'utf8'));
const LEX = path.resolve(ROOT, '..', 'Project-Sophos', 'sophos', 'src', 'lexicon');
const skip = !existsSync(path.join(LEX, 'packs.mjs')) && 'Project-Sophos not beside this checkout';

test('the cruise pack lists every source kind it names, authority in the directive order', () => {
  assert.deepEqual(Object.keys(pack.source_kinds), ['line-official', 'trade-press', 'itw-data']);
  for (const [name, p] of Object.entries(pack.properties)) {
    assert.deepEqual(p.authority, ['line-official', 'trade-press', 'itw-data'], name);
  }
  assert.equal(pack.partition, 'public');
});

test('the cruise pack is a valid lexicon-pack/1 and files a real statement, refusing a wrong unit', { skip }, async () => {
  const { validatePack, checkStatement } = await import(pathToFileURL(path.join(LEX, 'packs.mjs')).href);
  const { makeStatement } = await import(pathToFileURL(path.join(LEX, 'statement.mjs')).href);
  assert.deepEqual(validatePack(pack), { ok: true, errors: [] });
  const make = (extra) => makeStatement({ pack: 'cruise.ship', entity: 'ship:quantum-of-the-seas', property: 'gross_tonnage', value: 168666, unit: 'GT',
    partition: 'public', status: 'inference', evidence: [{ ref: 'itw:assets/data/ships/rcl/quantum-of-the-seas.page.json', tier: 'secondary' }],
    actor: { kind: 'agent', id: 'test', provider: 'household' }, clock: () => '2026-10-25T00:00:00.000Z', ...extra });
  assert.equal(checkStatement(pack, make()).ok, true);
  assert.match(checkStatement(pack, make({ unit: 'tons' })).errors.join(' '), /unit 'tons' differs/);
  assert.match(checkStatement(pack, make({ property: 'top_speed' })).errors.join(' '), /not declared/);
});

test('line-aliases.json is exactly what the data says (regenerate if this fails)', () => {
  assert.equal(readFileSync(path.join(ROOT, OUT), 'utf8'), render(buildLineAliases(ROOT)));
});

test('every brand maps its own spellings, each with evidence, and no spelling means two lines', () => {
  const t = buildLineAliases(ROOT);
  const seen = new Map();
  for (const [id, line] of Object.entries(t.lines)) {
    assert.equal(line.entity, `line:${id}`);
    assert.ok(line.aliases.length >= 3, `${id} has ${line.aliases.length} aliases`);
    for (const a of line.aliases) {
      assert.ok(a.evidence && a.evidence.length > 5, `${id} ${a.vocabulary}=${a.alias} carries evidence`);
      const key = `${a.vocabulary}\u0000${a.alias}`;
      assert.ok(!seen.has(key), `${a.vocabulary}=${a.alias} maps to both ${seen.get(key)} and ${id}`);
      seen.set(key, id);
    }
  }
  const rc = t.lines['royal-caribbean'].aliases;
  assert.ok(rc.some((a) => a.vocabulary === 'ships/' && a.alias === 'rcl' && /ship files are in this line's fleet lists/.test(a.evidence)), 'rcl is matched by ship overlap, not by hand');
  assert.ok(t.lines.norwegian.aliases.some((a) => a.vocabulary === 'fleets.json' && a.alias === 'ncl'));
});

test('an unmatchable spelling is listed with its reason, never folded into a line', () => {
  const t = buildLineAliases(ROOT);
  const disney = t.unmatched.find((u) => u.alias === 'dcl');
  assert.ok(disney && /matches no brand label/.test(disney.reason));
  for (const line of Object.values(t.lines)) assert.ok(!line.aliases.some((a) => a.alias === 'dcl'));
});

test('name normalisation drops only the words that differ between spellings of one line', () => {
  assert.equal(normaliseName('Royal Caribbean International'), normaliseName('Royal Caribbean'));
  assert.equal(normaliseName('Holland America Line'), 'holland america');
  assert.equal(normaliseName('P&O Cruises (UK)'), 'p and o uk');
  assert.notEqual(normaliseName('Viking Ocean Cruises'), normaliseName('Viking River Cruises'));
});
