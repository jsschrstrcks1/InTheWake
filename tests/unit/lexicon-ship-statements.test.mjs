// Lexicon C2: the five pilot ships, filed from this repository's own records (Tekton itw-c2-ship-pilot-five).
// Soli Deo Gloria. The parsing rules run everywhere; the statement checks use Project-Sophos's contract and
// skip, saying so, when it is not beside this repo.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync, mkdtempSync, mkdirSync, copyFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { readField, readOfficial, buildShipStatements, loadContract, PILOT, OUT_DIR } from '../../admin/lexicon/ship-statements.mjs';
import { outcomeOf, figureLabel, factSheetFigures, factSheetUpdated, OFFICIAL } from '../../admin/lexicon/capture-official.mjs';

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
  // Radiance's own two records disagree on crew and double-occupancy guests. The conflict stays listed, and
  // Royal Caribbean's fact sheet, the primary source, is preferred and resolves it.
  const radiance = entity('radiance-of-the-seas').statements;
  assert.deepEqual([...new Set(findConflicts(radiance).map((c) => c.subject))].sort(),
    ['ship:radiance-of-the-seas#crew', 'ship:radiance-of-the-seas#guests_double']);
  for (const [p, v] of [['crew', 894], ['guests_double', 2143]]) {
    const cv = currentValue(radiance, `ship:radiance-of-the-seas#${p}`, at);
    assert.equal(cv.state, 'resolved', p);
    assert.equal(cv.statement.epistemic.status, 'verified', p);
    assert.equal(cv.statement.ext.value, v, p);
  }
  assert.equal(currentValue(entity('legend-of-the-seas-1995').statements, 'ship:legend-of-the-seas-1995#guests_double', at).state, 'conflicting');
  const grandiosa = entity('msc-grandiosa').statements;
  // One disagreement, listed not hidden: MSC's own 331.43 m against this repo's rounded 331. The line's page
  // is the primary source (operator ruling 2026-10-25), so its statement is preferred and resolves it.
  assert.deepEqual(findConflicts(grandiosa).map((c) => c.subject), ['ship:msc-grandiosa#length_m']);
  for (const s of grandiosa) assert.equal(currentValue(grandiosa, s.subject, at).state, 'resolved', s.subject);
  assert.equal(currentValue(grandiosa, 'ship:msc-grandiosa#length_m', at).statement.ext.value, 331.43);
  for (const ship of PILOT) {
    const d = entity(ship.entity.split(':')[1]);
    const captured = new Set(d.checks.filter((c) => c.outcome === 'captured').map((c) => c.url));
    for (const s of d.statements) {
      assert.equal(validateStatement(JSON.parse(JSON.stringify(s))).ok, true, s.subject);
      assert.ok(['inference', 'verified'].includes(s.epistemic.status), `${s.subject}: never known (training recall)`);
      for (const e of s.epistemic.evidence) {
        if (s.epistemic.status === 'verified') {
          // verified only from a line page this repo actually captured, as primary evidence, ranked preferred
          assert.equal(e.tier, 'primary');
          assert.ok(captured.has(e.ref), `${s.subject} cites ${e.ref}, a captured line page`);
          assert.equal(s.ext.rank, 'preferred');
        } else {
          assert.equal(e.tier, 'secondary');
          const file = e.ref.replace(/^itw:/, '').split('#')[0];
          assert.ok(existsSync(path.join(ROOT, file)), `${s.subject} cites ${file}, which exists`);
        }
      }
    }
  }
});

test('a figure on the line\'s own page is read only when its label says plainly what it is', () => {
  assert.deepEqual(readOfficial('Gross Tonnage:', '181.541 tons'), [{ property: 'gross_tonnage', value: 181541, unit: 'GT' }]);
  assert.deepEqual(readOfficial('Gross Tonnage', '133,500'), [{ property: 'gross_tonnage', value: 133500, unit: 'GT' }]);
  assert.match(readOfficial('Gross Tonnage:', '181.54 tons')[0].skip, /not a plain tonnage/, 'a decimal is never read as a thousands group');
  assert.match(readOfficial('Gross Tonnage:', '181,541.5 tons')[0].skip, /not a plain tonnage/);
  assert.deepEqual(readOfficial('Onboard Crew', '1,450'), [{ property: 'crew', value: 1450, unit: 'crew' }]);
  assert.match(readOfficial('Guest Capacity', '3,934')[0].skip, /double occupancy or maximum/);
  assert.match(readOfficial('Number of passengers:', '6,334 guests')[0].skip, /double occupancy or maximum/);
  assert.match(readOfficial('Length In Feet', '1,055')[0].skip, /feet only/);
  assert.deepEqual(readOfficial('Length/Beam/Height:', '331.43 m / 43 m / 75.5 m'), [{ property: 'length_m', value: 331.43, unit: 'm' }]);
  assert.match(readOfficial('Crew members:', 'about 1,700')[0].skip, /approximate|not a plain/);
});

test('the line\'s page wins where it speaks, and Royal Caribbean\'s speaks through its fact-sheet PDF', { skip }, async () => {
  const { currentValue } = await import(pathToFileURL(path.join(LEX, 'statement.mjs')).href);
  const at = { at: '2026-10-25T04:00:00Z' };
  const vista = entity('carnival-vista');
  assert.equal(vista.checks[0].outcome, 'captured');
  for (const p of ['gross_tonnage', 'crew']) {
    const cv = currentValue(vista.statements, `ship:carnival-vista#${p}`, at);
    assert.equal(cv.state, 'resolved');
    assert.equal(cv.statement.epistemic.status, 'verified', p);
    assert.equal(cv.statement.timestamps.observed_at, vista.checks[0].retrieved_at, 'observed when the page was read');
  }
  assert.ok(vista.not_filed.some((n) => n.source.endsWith('#Guest Capacity') && /double occupancy or maximum/.test(n.reason)));
  // Royal Caribbean: royalcaribbean.com serves a headless browser a block page, so its figures are read from the
  // fact-sheet PDF its press center links. Every figure the sheet prints is verified and wins.
  for (const slug of ['radiance-of-the-seas', 'quantum-of-the-seas', 'legend-of-the-seas-2026']) {
    const d = entity(slug);
    const obs = JSON.parse(readFileSync(path.join(ROOT, 'assets/data/lexicon/observations', `${slug}.json`), 'utf8'));
    assert.equal(d.checks.length, 1, `${slug} records the line page it tried`);
    assert.equal(d.checks[0].outcome, 'captured', slug);
    assert.match(d.checks[0].url, /^https:\/\/royalcaribbeanmedia\.com\/files\/fact-sheets\/en\/[a-z]+-fact-sheet\.pdf$/, slug);
    assert.match(obs.found_via, /^https:\/\/royalcaribbeanpresscenter\.com\/fact-sheet\/[a-z]+$/, slug);
    assert.match(obs.document_sha256, /^[0-9a-f]{64}$/, `${slug}: the PDF read is pinned by its hash`);
    for (const item of obs.items) {
      for (const r of readOfficial(item.label, item.raw).filter((x) => !x.skip)) {
        const cv = currentValue(d.statements, `ship:${slug}#${r.property}`, at);
        assert.equal(cv.statement.epistemic.status, 'verified', `${slug} ${r.property}`);
        assert.equal(cv.statement.ext.value, r.value, `${slug} ${r.property}`);
      }
    }
  }
  assert.deepEqual(entity('legend-of-the-seas-1995').checks, [], 'a retired ship has no line page; none is claimed');
});

test('a page the line did not serve verifies nothing, even if a capture file carried figures', { skip }, async (t) => {
  // Real data no longer has an unserved pilot page, so the rule is pinned on a throwaway tree: Quantum's two
  // records, and an observation that says content_not_served yet lists a figure. Nothing may be verified.
  const dir = mkdtempSync(path.join(tmpdir(), 'itw-obs-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  for (const rel of ['assets/data/lexicon/cruise.ship.pack.json', 'assets/data/lexicon/line-aliases.json', 'ships/rcl/quantum-of-the-seas.html', 'assets/data/ships/rcl/quantum-of-the-seas.page.json']) {
    mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
    copyFileSync(path.join(ROOT, rel), path.join(dir, rel));
  }
  const obsRel = 'assets/data/lexicon/observations/quantum-of-the-seas.json';
  mkdirSync(path.dirname(path.join(dir, obsRel)), { recursive: true });
  const served = (outcome) => writeFileSync(path.join(dir, obsRel), JSON.stringify({ format: 'lexicon-observation/1', entity: 'ship:quantum-of-the-seas',
    source_kind: 'line-official', publisher: 'Royal Caribbean', url: 'https://example.invalid/sheet.pdf', retrieved_at: '2026-10-26T00:00:00.000Z', outcome, items: [{ label: 'CREW', raw: '9,999' }] }));
  const git = (...a) => spawnSync('git', ['-C', dir, ...a], { encoding: 'utf8' });
  git('init', '-q'); git('config', 'user.email', 't@example.invalid'); git('config', 'user.name', 't'); git('config', 'core.hooksPath', '/dev/null');
  git('add', '-A'); git('commit', '-qm', 'fixture');
  const quantum = PILOT.filter((p) => p.entity === 'ship:quantum-of-the-seas');
  const verifiedCrew = async () => {
    const { files } = await buildShipStatements(dir, await loadContract(), quantum);
    const d = JSON.parse(files[`${OUT_DIR}/quantum-of-the-seas.json`]);
    return d.statements.filter((s) => s.epistemic.status === 'verified').map((s) => s.ext.value);
  };
  served('content_not_served');
  assert.deepEqual(await verifiedCrew(), [], 'an unserved page verifies nothing');
  served('captured');
  assert.deepEqual(await verifiedCrew(), [9999], 'the same file marked captured does: the guard is the outcome, not the items');
});

test('a Royal Caribbean fact sheet is read figure by label, as printed, and a sheet that contradicts itself is not', () => {
  // Lines as pdftotext prints Quantum of the Seas' sheet (updated 7.22.26): reading order, and -layout for length.
  const raw = '1,500 CREW\n(INTERNATIONAL)\n\n2,094 STATEROOMS\n4,180 GUESTS\n(DOUBLE OCCUPANCY)\n\n168,666 GT\n1,141\n\nUpdated 7.22.26\n';
  const layout = '• WINDJAMMER         1,500 CREW\n                     1,141   FEET,    348      METRES   LONG\n                     136   FEET,   41   METRES   WIDE\n';
  assert.deepEqual(factSheetFigures(raw, layout), [
    { label: 'CREW', raw: '1,500' }, { label: 'GUESTS (DOUBLE OCCUPANCY)', raw: '4,180' }, { label: 'GT', raw: '168,666' },
    { label: 'FEET LONG', raw: '1,141' }, { label: 'METRES LONG', raw: '348' }]);
  assert.equal(factSheetUpdated(raw), '7.22.26');
  assert.deepEqual(factSheetFigures('4,180 GUESTS\n', ''), [], 'a guest count with no (DOUBLE OCCUPANCY) under it is not read');
  assert.deepEqual(factSheetFigures('1,500 CREW\n1,600 CREW\n', ''), [], 'two different crew figures: the sheet contradicts itself');
  assert.deepEqual(factSheetFigures('1,500 CREW\n1,500 CREW\n', ''), [{ label: 'CREW', raw: '1,500' }], 'the same figure printed twice is one figure');
  assert.deepEqual(factSheetFigures('', '136   FEET,   41   METRES   WIDE'), [], 'width is not length');
  assert.deepEqual(readOfficial('CREW', '1,500'), [{ property: 'crew', value: 1500, unit: 'crew' }]);
  assert.deepEqual(readOfficial('GUESTS (DOUBLE OCCUPANCY)', '4,180'), [{ property: 'guests_double', value: 4180, unit: 'guests' }]);
  assert.deepEqual(readOfficial('GT', '168,666'), [{ property: 'gross_tonnage', value: 168666, unit: 'GT' }]);
  assert.deepEqual(readOfficial('METRES LONG', '348'), [{ property: 'length_m', value: 348, unit: 'm' }]);
  assert.match(readOfficial('FEET LONG', '1,141')[0].skip, /feet only/);
  assert.ok(readOfficial('GUESTS', '4,180')[0].skip, 'GUESTS without (DOUBLE OCCUPANCY) says neither double nor maximum');
  assert.match(readOfficial('GUESTS (DOUBLE OCCUPANCY)', '~4,180')[0].skip, /approximate/);
  for (const t of OFFICIAL.filter((x) => x.publisher === 'Royal Caribbean')) {
    assert.equal(t.extractor, 'rcl-fact-sheet-pdf', t.entity);
    assert.match(t.url, /^https:\/\/royalcaribbeanpresscenter\.com\/fact-sheet\/[a-z]+$/, t.entity);
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

test('the capture tool never calls a page it was not shown "no figures"', () => {
  assert.equal(outcomeOf([{ label: 'Onboard Crew', raw: '1,450' }], 180000), 'captured');
  assert.equal(outcomeOf([], 170), 'content_not_served', 'a 170-character bot check is not a ship page');
  assert.equal(outcomeOf([], 40000), 'no_figures_on_page');
  for (const l of ['Gross Tonnage:', 'Gross Tonnage', 'Onboard Crew', 'Crew members:', 'Number of passengers:', 'Guest Capacity', 'Length In Feet', 'Length/Beam/Height:']) assert.ok(figureLabel(l), l);
  for (const l of ['Number of cabins:', 'Maximum Speed:', 'Find out what our guests have to say about MSC Grandiosa.']) assert.ok(!figureLabel(l), l);
});
