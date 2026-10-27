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
import { readField, readOfficial, buildShipStatements, loadContract, fleet, PILOT, OUT_DIR } from '../../admin/lexicon/ship-statements.mjs';
import { outcomeOf, figureLabel, factSheetFigures, factSheetUpdated, nclFigures, withHolds, OFFICIAL } from '../../admin/lexicon/capture-official.mjs';

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
  // Sheets whose reading order parts a label from its figure (Allure, Enchantment; Anthem, Independence, Liberty):
  // the layout keeps them together, by column for guests and by the line below for length.
  const allure = [
    '                                                                      5,718 GUESTS',
    '• CANDY BEACH           • GIOVANNI’S TABLE       • SAMBA GRILL',
    '• CHEF’S TABLE          • IZUMI                  • STARBUCKS',
    '• CHOPS GRILLE          • JOHNNY ROCKETS                              (DOUBLE OCCUPANCY)',
  ].join('\n');
  assert.deepEqual(factSheetFigures('5,718 GUESTS\n225,282 GT\n', allure), [{ label: 'GUESTS (DOUBLE OCCUPANCY)', raw: '5,718' }, { label: 'GT', raw: '225,282' }]);
  assert.deepEqual(factSheetFigures('', allure.replace('(DOUBLE OCCUPANCY)', '          (DOUBLE OCCUPANCY)')), [], 'the label in another column is not this figure\'s');
  assert.deepEqual(factSheetFigures('', allure.replace('(DOUBLE OCCUPANCY)', '(DOUBLE OCCUPANCY) 9')), [], 'text after the label: not the label alone');
  assert.deepEqual(factSheetFigures('', `${allure}\n\n\n\n`.replace(/\n• CHOPS/, '\n\n• CHOPS')), [], 'more than three lines below is too far');
  const anthem = '          1,141            348            LONG\nTAGES\n                      FEET,          METRES\n';
  assert.deepEqual(factSheetFigures('', anthem), [{ label: 'FEET LONG', raw: '1,141' }, { label: 'METRES LONG', raw: '348' }]);
  assert.deepEqual(factSheetFigures('', anthem.replace('METRES\n', 'METRES   WIDE\n')), [], 'the line below must end FEET, METRES');
  assert.deepEqual(factSheetFigures('', `${anthem}1,141   FEET,   350   METRES   LONG\n`), [], 'two readings that disagree: nothing');
  assert.deepEqual(factSheetFigures('5,718 GUESTS\n(DOUBLE OCCUPANCY)\n', allure.replace('5,718 GUESTS', '5,719 GUESTS')), [], 'raw and layout disagree on guests: nothing');
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
  assert.deepEqual(legend.statements.filter((s) => s.ext.property === 'imo').map((s) => s.ext.value), ['9070620']);
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

test('a Norwegian ship page is read value-above-label, and only where the label says what the number is', () => {
  // The shape of ncl.com/cruise-ships/<ship> as Chromium renders it: the number on the line above its label.
  const page = ['Ship Facts', '3,565', 'Guest Capacity', '(Double Occupancy)', '1,597', 'Ship Crew', '1056ft', 'Overall Length', '20', 'Decks'];
  assert.deepEqual(nclFigures(page), [
    { label: 'Guest Capacity (Double Occupancy)', raw: '3,565' },
    { label: 'Ship Crew', raw: '1,597' },
    { label: 'Overall Length', raw: '1056ft' },
  ]);
  assert.deepEqual(nclFigures(['3,565', 'Guest Capacity']), [], 'guest capacity without "(Double Occupancy)" says neither double nor maximum');
  assert.deepEqual(nclFigures(['about 1,600', 'Ship Crew']), [], 'an approximate figure is not read');
  assert.deepEqual(nclFigures(['1056', 'Overall Length']), [], 'a length with no unit is not read');
  assert.deepEqual(nclFigures(['1,597', 'Ship Crew', '1,650', 'Ship Crew']), [], 'a page that gives two crews gives none');
  assert.deepEqual(readOfficial('Guest Capacity (Double Occupancy)', '3,565'), [{ property: 'guests_double', value: 3565, unit: 'guests' }]);
  assert.deepEqual(readOfficial('Ship Crew', '1,597'), [{ property: 'crew', value: 1597, unit: 'crew' }]);
  assert.match(readOfficial('Overall Length', '1056ft')[0].skip, /feet only/, 'feet are never converted into a metre figure');
});

test('a held figure is kept word for word, out of the items the cross-check reads, and only where a target holds it', () => {
  const obs = { outcome: 'captured', items: [{ label: 'Guest Capacity (Double Occupancy)', raw: '3,565' }, { label: 'Ship Crew', raw: '1,597' }] };
  const held = withHolds(obs, { 'Guest Capacity (Double Occupancy)': 'pack' });
  assert.deepEqual(held.items, [{ label: 'Ship Crew', raw: '1,597' }]);
  assert.deepEqual(held.held, [{ label: 'Guest Capacity (Double Occupancy)', raw: '3,565', reason: 'pack' }]);
  assert.equal(held.outcome, 'captured');
  assert.equal(withHolds(obs, undefined), obs, 'no hold, no change');
  assert.equal(withHolds(obs, { 'Gross Tonnage': 'x' }), obs, 'a hold on a figure the page did not give changes nothing');
  const holders = OFFICIAL.filter((t) => t.hold).map((t) => t.entity).sort();
  assert.deepEqual(holders, ['ship:norwegian-aqua', 'ship:norwegian-bliss'], 'a new hold is a decision to name in review, not a quiet edit');
  for (const t of OFFICIAL.filter((x) => x.hold)) for (const reason of Object.values(t.hold)) assert.match(reason, /NCL-PROSE-TO-REVIEW\.md/);
});

test('the committed Norwegian captures: Sky (whose page redirects) is no target, and the held counts stay out of items', () => {
  const sky = OFFICIAL.find((t) => t.entity === 'ship:norwegian-sky');
  assert.equal(sky, undefined, 'Norwegian Sky\'s page redirects to the fleet list, so she is not a target');
  for (const s of ['aqua', 'bliss']) {
    const o = JSON.parse(readFileSync(path.join(ROOT, `assets/data/lexicon/observations/norwegian-${s}.json`), 'utf8'));
    assert.ok(!o.items.some((i) => /guest capacity/i.test(i.label)), `${s}: the held guest count must not be in items`);
    assert.equal(o.held.length, 1, s);
  }
});

test('the store holds every ship: one page is one ship, the pilot identities win, and a capture with no page still counts', (t) => {
  const dir = mkdtempSync(path.join(tmpdir(), 'itw-fleet-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const put = (rel, text = '') => { mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true }); writeFileSync(path.join(dir, rel), text); };
  for (const p of ['rcl/index', 'rcl/venues', 'rcl/legend-of-the-seas', 'rcl/legend-of-the-seas-1995-built', 'rcl/grandeur-of-the-seas', 'norwegian/norwegian-aqua']) put(`ships/${p}.html`);
  put('ships/rcl/rc_ship_videos.json', '{}');
  const obs = (slug, publisher) => put(`assets/data/lexicon/observations/${slug}.json`, JSON.stringify({ publisher }));
  obs('hero-of-the-seas', 'Royal Caribbean');
  obs('norwegian-aqua', 'Norwegian Cruise Line');
  const legend = PILOT.filter((p) => p.entity === 'ship:legend-of-the-seas-1995');
  const got = fleet(dir, legend);
  assert.deepEqual(got.map((e) => e.entity), ['ship:legend-of-the-seas-1995', 'ship:norwegian-aqua', 'ship:grandeur-of-the-seas', 'ship:hero-of-the-seas']);
  assert.deepEqual(got.find((e) => e.entity === 'ship:grandeur-of-the-seas'), { entity: 'ship:grandeur-of-the-seas', lineDir: 'rcl', pages: ['rcl/grandeur-of-the-seas'] });
  assert.deepEqual(got.find((e) => e.entity === 'ship:hero-of-the-seas'), { entity: 'ship:hero-of-the-seas', lineDir: 'rcl', pages: [] }, 'a capture with no page is filed from the capture alone');
  assert.equal(got.find((e) => e.entity === 'ship:norwegian-aqua').pages.length, 1, 'a capture of a ship with a page adds no second entity');

  put('ships/norwegian/grandeur-of-the-seas.html');
  assert.throws(() => fleet(dir, legend), (e) => e.code === 'itw_identity_split', 'one name on two lines is two ships the tool cannot tell apart');
  rmSync(path.join(dir, 'ships/norwegian/grandeur-of-the-seas.html'));
  obs('mystery-of-the-seas', 'Some Other Line');
  assert.throws(() => fleet(dir, legend), (e) => e.code === 'itw_statement_refused', 'a capture from a line with no folder is refused, not guessed into one');
});

test('the real store: every ship page is an entity, no IMO is shared, and every held figure is listed, not filed', () => {
  const entities = fleet();
  const pages = readdirSync(path.join(ROOT, 'ships'), { withFileTypes: true }).filter((d) => d.isDirectory())
    .flatMap((d) => readdirSync(path.join(ROOT, 'ships', d.name)).filter((f) => f.endsWith('.html') && !['index.html', 'venues.html'].includes(f)).map((f) => `${d.name}/${f.slice(0, -5)}`));
  const covered = new Set(entities.flatMap((e) => e.pages));
  assert.deepEqual(pages.filter((p) => !covered.has(p)), [], 'every ship page belongs to an entity');
  assert.deepEqual(readdirSync(path.join(ROOT, OUT_DIR)).sort(), entities.map((e) => `${e.entity.split(':')[1]}.json`).sort(), 'one file per entity, and no orphan files');
  const imoOwner = new Map();
  for (const f of readdirSync(path.join(ROOT, OUT_DIR))) {
    const d = JSON.parse(readFileSync(path.join(ROOT, OUT_DIR, f), 'utf8'));
    for (const s of d.statements.filter((x) => x.ext.property === 'imo')) {
      assert.ok(!imoOwner.has(s.ext.value) || imoOwner.get(s.ext.value) === d.entity, `IMO ${s.ext.value}: ${imoOwner.get(s.ext.value)} and ${d.entity}`);
      imoOwner.set(s.ext.value, d.entity);
    }
  }
  for (const slug of ['norwegian-aqua', 'norwegian-bliss']) {
    const d = JSON.parse(readFileSync(path.join(ROOT, OUT_DIR, `${slug}.json`), 'utf8'));
    assert.ok(!d.statements.some((s) => s.ext.property === 'guests_double' && s.epistemic.status === 'verified'), `${slug}: a held count is never filed`);
    assert.ok(d.not_filed.some((n) => n.reason.startsWith('held: ')), `${slug}: the held count is listed with its reason`);
  }
  assert.equal(JSON.parse(readFileSync(path.join(ROOT, OUT_DIR, 'legend-of-the-seas-1995.json'), 'utf8')).statements.find((s) => s.ext.property === 'imo').ext.value, '9070620');
});

// 2026-10-27: #2667 was generated in a shallow clone, and `git log -1 -- <file>` there names the shallow
// boundary for any record last changed before it, so 103 ships carried the boundary's date. A boundary
// commit is now UNAVAILABLE (itw_source_history_shallow), never a date; a record changed after the boundary
// still dates correctly in the same clone.
import { commitDate } from '../../admin/lexicon/ship-statements.mjs';

function shallowFixture() {
  const base = mkdtempSync(path.join(tmpdir(), 'itw-shallow-'));
  const full = path.join(base, 'full');
  mkdirSync(full);
  const git = (cwd, ...args) => spawnSync('git', ['-C', cwd, '-c', 'user.email=t@t', '-c', 'user.name=t', ...args], { encoding: 'utf8' });
  // The author date is set a year earlier than the committer date: the generator dates by COMMIT (%cI).
  const at = (cwd, date, ...args) => spawnSync('git', ['-C', cwd, '-c', 'user.email=t@t', '-c', 'user.name=t', ...args], { encoding: 'utf8', env: { ...process.env, GIT_COMMITTER_DATE: date, GIT_AUTHOR_DATE: date.replace(/^2026/, '2025') } });
  git(full, 'init', '-q');
  writeFileSync(path.join(full, 'old.json'), '{"a":1}\n');
  at(full, '2026-04-26T23:31:18Z', 'add', 'old.json'); at(full, '2026-04-26T23:31:18Z', 'commit', '-qm', 'old record');
  writeFileSync(path.join(full, 'other.txt'), 'x\n');
  at(full, '2026-09-26T18:11:04Z', 'add', 'other.txt'); at(full, '2026-09-26T18:11:04Z', 'commit', '-qm', 'unrelated');
  writeFileSync(path.join(full, 'new.json'), '{"b":2}\n');
  at(full, '2026-10-26T10:00:00Z', 'add', 'new.json'); at(full, '2026-10-26T10:00:00Z', 'commit', '-qm', 'new record');
  const shallow = path.join(base, 'shallow');
  spawnSync('git', ['clone', '-q', '--depth', '1', pathToFileURL(full).href, shallow], { encoding: 'utf8' });
  return { base, full, shallow };
}

test('a full clone dates a record by its own last commit', () => {
  const { base, full } = shallowFixture();
  try { assert.equal(commitDate(full, 'old.json'), '2026-04-26T23:31:18.000Z'); }
  finally { rmSync(base, { recursive: true, force: true }); }
});

test('a shallow clone refuses to date a record whose last commit is behind its boundary', () => {
  const { base, shallow } = shallowFixture();
  try {
    assert.equal(spawnSync('git', ['-C', shallow, 'rev-parse', '--is-shallow-repository'], { encoding: 'utf8' }).stdout.trim(), 'true');
    assert.throws(() => commitDate(shallow, 'old.json'), (e) => e.code === 'itw_source_history_shallow');
  } finally { rmSync(base, { recursive: true, force: true }); }
});

test('in a two-deep clone the newest record still dates normally and the cut-off one is refused', () => {
  // The rule is precise, not "refuse every shallow clone": only a record whose dating commit is a boundary
  // commit is unknowable. Two deep, new.json's commit sits above the boundary and dates as in full history.
  const { base, full } = shallowFixture();
  const two = path.join(base, 'two');
  spawnSync('git', ['clone', '-q', '--depth', '2', pathToFileURL(full).href, two], { encoding: 'utf8' });
  try {
    assert.equal(commitDate(two, 'new.json'), '2026-10-26T10:00:00.000Z');
    assert.throws(() => commitDate(two, 'old.json'), (e) => e.code === 'itw_source_history_shallow');
  } finally { rmSync(base, { recursive: true, force: true }); }
});
