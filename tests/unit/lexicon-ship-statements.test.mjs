// Lexicon C2: the five pilot ships, filed from this repository's own records (Tekton itw-c2-ship-pilot-five).
// Soli Deo Gloria. The parsing rules run everywhere; the statement checks use Project-Sophos's contract and
// skip, saying so, when it is not beside this repo.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { readField, buildShipStatements, loadContract, PILOT, OUT_DIR } from '../../admin/lexicon/ship-statements.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const LEX = path.resolve(ROOT, '..', 'Project-Sophos', 'sophos', 'src', 'lexicon');
const skip = !existsSync(path.join(LEX, 'statement.mjs')) && 'Project-Sophos not beside this checkout';
const entity = (slug) => JSON.parse(readFileSync(path.join(ROOT, OUT_DIR, `${slug}.json`), 'utf8'));

test('a value is read only when the record plainly states it', () => {
  assert.deepEqual(readField('gt', '181,541 GT'), [{ property: 'gross_tonnage', value: 181541, unit: 'GT' }]);
  assert.deepEqual(readField('guests', '4,888 (double) / 6,334 (max)').map((x) => x.value), [4888, 6334]);
  assert.deepEqual(readField('length', '1,086 ft (331 m)'), [{ property: 'length_m', value: 331, unit: 'm' }]);
  assert.match(readField('crew', '~720')[0].skip, /approximate/);
  assert.match(readField('guests', '1,804 (double) ~2,076 (max)')[1].skip, /max figure is approximate/);
  assert.equal(readField('guests', '1,804 (double) ~2,076 (max)')[0].value, 1804);
  assert.match(readField('guests', '4,180')[0].skip, /unlabelled/);
  assert.match(readField('length', '~867 ft')[0].skip, /approximate/);
  assert.match(readField('length', '867 ft')[0].skip, /feet only/);
  assert.match(readField('gt', 'TBD')[0].skip, /placeholder/);
  assert.match(readField('maiden_voyage', '1995-05-16')[0].skip, /not the entered-service year/);
  assert.match(readField('imo', '91029')[0].skip, /7-digit/);
});

test('the entity files are exactly what the records say (regenerate if this fails)', { skip }, async () => {
  const { files } = await buildShipStatements(ROOT, await loadContract());
  for (const [rel, text] of Object.entries(files)) assert.equal(readFileSync(path.join(ROOT, rel), 'utf8'), text, rel);
  assert.deepEqual(Object.keys(files).sort(), readdirSync(path.join(ROOT, OUT_DIR)).map((f) => `${OUT_DIR}/${f}`).sort());
});

test('the contract finds the census conflicts and picks no side; the clean ship resolves', { skip }, async () => {
  const { currentValue, findConflicts, validateStatement } = await import(pathToFileURL(path.join(LEX, 'statement.mjs')).href);
  const at = { at: '2026-10-25T00:00:00Z' };
  const radiance = entity('radiance-of-the-seas').statements;
  for (const p of ['crew', 'guests_double']) assert.equal(currentValue(radiance, `ship:radiance-of-the-seas#${p}`, at).state, 'conflicting', p);
  assert.equal(findConflicts(radiance).length, 2);
  assert.equal(currentValue(entity('legend-of-the-seas-1995').statements, 'ship:legend-of-the-seas-1995#guests_double', at).state, 'conflicting');
  const grandiosa = entity('msc-grandiosa').statements;
  assert.equal(findConflicts(grandiosa).length, 0);
  for (const s of grandiosa) assert.equal(currentValue(grandiosa, s.subject, at).state, 'resolved', s.subject);
  for (const ship of PILOT) {
    for (const s of entity(ship.entity.split(':')[1]).statements) {
      assert.equal(validateStatement(JSON.parse(JSON.stringify(s))).ok, true, s.subject);
      assert.equal(s.epistemic.status, 'inference', `${s.subject}: itw-data is secondary, never verified or known`);
      for (const e of s.epistemic.evidence) {
        assert.equal(e.tier, 'secondary');
        const file = e.ref.replace(/^itw:/, '').split('#')[0];
        assert.ok(existsSync(path.join(ROOT, file)), `${s.subject} cites ${file}, which exists`);
      }
    }
  }
});

test('nothing interpreted is filed: every approximate or placeholder value sits in not_filed with its reason', { skip }, () => {
  for (const ship of PILOT) {
    const d = entity(ship.entity.split(':')[1]);
    // A source that was not filed is never evidence for any statement. (The same NUMBER may still be filed
    // from another record that states it plainly: Legend's "~720" is not filed, its plain "720" is.)
    const cited = new Set(d.statements.flatMap((s) => s.epistemic.evidence.map((e) => e.ref)));
    for (const n of d.not_filed) {
      assert.ok(n.reason && n.source, `${d.entity}: a not_filed row has a source and a reason`);
      // A guests field can be half filed (its plain double figure filed, its approximate max not), and both
      // halves share one reference, so guests rows are checked by the Legend assertion below instead.
      if (!/guests$/.test(n.source)) assert.ok(!cited.has(n.source), `${d.entity}: ${n.source} (${JSON.stringify(n.raw)}) is not evidence`);
    }
  }
  const legend = entity('legend-of-the-seas-1995');
  assert.ok(!legend.statements.some((s) => s.ext.property === 'guests_max'), 'the only max figure for Legend 1995 is approximate');
});

test('identity: the two 1995 Legend pages share an IMO and fold; a pilot entry mixing ships is refused', { skip }, async () => {
  const legend = entity('legend-of-the-seas-1995');
  assert.equal(legend.sources.length, 4);
  assert.deepEqual(legend.statements.filter((s) => s.ext.property === 'imo').map((s) => s.ext.value), ['9102978']);
  const imos = PILOT.map((p) => entity(p.entity.split(':')[1]).statements.find((s) => s.ext.property === 'imo')?.ext.value).filter(Boolean);
  assert.equal(new Set(imos).size, imos.length, 'no two entities share an IMO');
  const mixed = [{ entity: 'ship:legend-mixed', lineDir: 'rcl', pages: ['rcl/legend-of-the-seas', 'rcl/legend-of-the-seas-icon-class-entering-service-in-2026'] }];
  await assert.rejects(buildShipStatements(ROOT, await loadContract(), mixed), (e) => e.code === 'itw_identity_split');
});
