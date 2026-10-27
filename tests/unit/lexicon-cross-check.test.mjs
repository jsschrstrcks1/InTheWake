// Ship facts carried by more than one file are compared, and a new disagreement is refused
// (Tekton itw-c8-data-cross-check-ci; admin/lexicon/cross-check.mjs). Soli Deo Gloria.
//
// Each adapter is run on a throwaway tree whose right answers are known; the judge is checked rule by rule; the
// CLI is run for real, including the baseline-growth check against a git base. The last test runs the check on
// this repository, which is how CI enforces it (as tests/unit/lexicon-deployments.test.mjs does for C5).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { collect, compare, judge, parseBaseline, renderBaseline, baselineSources, readPackSpec, unjoinedPacks, FIRST_SOURCES, BASELINE, PACK_SHIPS } from '../../admin/lexicon/cross-check.mjs';

const ROOT = new URL('../../', import.meta.url).pathname;
const CLI = join(ROOT, 'admin/lexicon/cross-check.mjs');

function tree(t, files) {
  const dir = mkdtempSync(join(tmpdir(), 'xcheck-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  for (const [rel, body] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, rel)), { recursive: true });
    writeFileSync(join(dir, rel), typeof body === 'string' ? body : JSON.stringify(body));
  }
  return dir;
}
const page = (fb) => `<html><script type="application/json" id="ship-stats-fallback">${JSON.stringify(fb)}</script></html>`;

const FIXTURE = {
  'ships/rcl/alpha-of-the-seas.html': page({ gt: '100,000 GT', guests: '2,000 (double) ~2,500 (max)', crew: '900', imo: '1234567' }),
  'ships/rcl/beta-of-the-seas.html': page({ gt: '~90,000 GT', crew: 'TBD' }),
  'assets/data/ships/rcl/alpha-of-the-seas.page.json': { imo: '1234567', gt: 100000, tracker: { imo: '7654321' } },
  'assets/data/rc_ships_meta.json': { 'royal-caribbean': { 'alpha-of-the-seas': { imo: '1234567' } }, ships: [{ slug: 'alpha-of-the-seas', imo: '1234567', gt: '100,000 GT' }] },
  'assets/data/fleet_index.json': { cruise_lines: [{ ships: [{ slug: 'alpha-of-the-seas', gt: '101,000' }, { slug: 'beta-of-the-seas', gt: '90,500' }] }] },
  'data/atlas/ship-size-atlas.json': { ships: [{ ship_id: 'rcl-alpha-of-the-seas', gt: 100000, pax_double: 2000, crew: 905 }, { ship_id: 'rcl-gamma-of-the-seas', gt: 1 }] },
};

test('cross-check: every adapter reads its shape; approximate and placeholder values are never compared', (t) => {
  const { observations, perSource } = collect(tree(t, FIXTURE));
  const at = (slug, prop) => observations.filter((o) => o.slug === slug && o.property === prop).map((o) => `${o.value} ${o.source.split(' ')[0]}`).sort();
  assert.deepEqual(at('alpha-of-the-seas', 'imo'), [
    '1234567 assets/data/rc_ships_meta.json', '1234567 assets/data/rc_ships_meta.json',
    '1234567 assets/data/ships/rcl/alpha-of-the-seas.page.json', '1234567 ships/rcl/alpha-of-the-seas.html',
    '7654321 assets/data/ships/rcl/alpha-of-the-seas.page.json',
  ], 'both meta shapes, the record and its tracker copy, and the page');
  assert.deepEqual(at('alpha-of-the-seas', 'guests_double'), ['2000 data/atlas/ship-size-atlas.json', '2000 ships/rcl/alpha-of-the-seas.html']);
  assert.deepEqual(at('alpha-of-the-seas', 'guests_max'), [], 'an approximate max (~2,500) is not a value to compare');
  assert.deepEqual(at('beta-of-the-seas', 'gross_tonnage'), ['90500 assets/data/fleet_index.json'], '~90,000 and TBD are skipped');
  assert.equal(observations.some((o) => o.slug.includes('gamma')), false, 'an atlas id whose slug no other source uses is not joined');
  assert.equal(perSource['ship-size-atlas'], 3);
});

test('cross-check: compare finds every ship fact with two or more distinct values, and only those', (t) => {
  const { disagreements, compared } = compare(collect(tree(t, FIXTURE)).observations);
  assert.deepEqual(disagreements.map((d) => `${d.key}=${d.values.map((v) => v.value).join('|')}`), [
    'alpha-of-the-seas#crew=900|905',
    'alpha-of-the-seas#gross_tonnage=100000|101000',
    'alpha-of-the-seas#imo=1234567|7654321',
  ]);
  assert.equal(compared, 4, 'crew, tonnage, imo and guests_double each have two or more sources; beta has one');
});

const D = (key, ...values) => ({ key, values: values.map((value) => ({ value, sources: [] })) });

test('cross-check: judge refuses the unknown, accepts the known and the narrowed, reports the resolved', () => {
  const known = { 'a#imo': ['1', '2', '3'], 'b#crew': ['5', '6'], 'gone#crew': ['1', '2'] };
  const r = judge([D('a#imo', '1', '2'), D('b#crew', '5', '7'), D('new#gross_tonnage', '9', '8')], known, null);
  assert.deepEqual(r.fresh.map((d) => d.key), ['b#crew', 'new#gross_tonnage'], 'a value the baseline never held is new; an unknown key is new');
  assert.deepEqual(r.narrowed, ['a#imo'], 'fixing one copy of a three-way split is progress, not a fault');
  assert.deepEqual(r.resolved, ['gone#crew']);
});

test('cross-check: the baseline may not grow: a new key or a new value against the prior baseline', () => {
  const prior = { 'a#imo': ['1', '2'] };
  assert.deepEqual(judge([], { 'a#imo': ['1', '2'], 'b#crew': ['5', '6'] }, prior).grew, ['b#crew']);
  assert.deepEqual(judge([], { 'a#imo': ['1', '2', '3'] }, prior).grew, ['a#imo']);
  assert.deepEqual(judge([], { 'a#imo': ['1'] }, prior).grew, [], 'dropping a value is shrinking');
});

test('cross-check: the baseline file is read strictly', () => {
  assert.throws(() => parseBaseline('{"known":[]}'), /must be an object/);
  assert.throws(() => parseBaseline('{"known":{"Bad Key":["1"]}}'), /bad entry/);
  assert.deepEqual(parseBaseline(renderBaseline({ 'z#imo': ['2', '1'] })), { 'z#imo': ['1', '2'] });
});

const cli = (root, ...args) => spawnSync(process.execPath, [CLI, '--root', root, ...args], { encoding: 'utf8' });

test('cross-check CLI: a disagreement the baseline does not hold is refused with its code; a known one passes', (t) => {
  const dir = tree(t, FIXTURE);
  const bad = cli(dir);
  assert.equal(bad.status, 1, bad.stderr);
  assert.match(bad.stderr, /REFUSED itw_data_cross_check/);
  assert.match(bad.stderr, /alpha-of-the-seas#imo/);
  assert.match(bad.stderr, /admin\/lexicon\/CROSS-CHECK\.md/);
  mkdirSync(dirname(join(dir, BASELINE)), { recursive: true });
  writeFileSync(join(dir, BASELINE), renderBaseline({ 'alpha-of-the-seas#crew': ['900', '905'], 'alpha-of-the-seas#gross_tonnage': ['100000', '101000'], 'alpha-of-the-seas#imo': ['1234567', '7654321'] }));
  assert.equal(cli(dir).status, 0);
});

test('cross-check CLI: an unreadable source or baseline is UNAVAILABLE (exit 3), never a pass', (t) => {
  const dir = tree(t, { ...FIXTURE, 'assets/data/fleet_index.json': '{not json' });
  const r = cli(dir);
  assert.equal(r.status, 3); assert.match(r.stderr, /itw_cross_check_unavailable/); assert.match(r.stderr, /fleet_index\.json/);
  const dir2 = tree(t, { ...FIXTURE, [BASELINE]: '{"known":"x"}' });
  assert.equal(cli(dir2).status, 3);
});

test('cross-check CLI: --shrink-baseline drops resolved keys and values no copy still has, and adds nothing', (t) => {
  const dir = tree(t, { ...FIXTURE, [BASELINE]: renderBaseline({
    'alpha-of-the-seas#imo': ['1234567', '7654321', '1111111'], 'alpha-of-the-seas#crew': ['900', '905'],
    'alpha-of-the-seas#gross_tonnage': ['100000', '101000'], 'old-ship#crew': ['1', '2'] }) });
  assert.equal(cli(dir, '--shrink-baseline').status, 0);
  assert.deepEqual(parseBaseline(readFileSync(join(dir, BASELINE), 'utf8')), {
    'alpha-of-the-seas#crew': ['900', '905'], 'alpha-of-the-seas#gross_tonnage': ['100000', '101000'], 'alpha-of-the-seas#imo': ['1234567', '7654321'] });
});

test('cross-check CLI: with --base, a baseline that grew since the base is refused', (t) => {
  const dir = tree(t, { ...FIXTURE, [BASELINE]: renderBaseline({ 'alpha-of-the-seas#crew': ['900', '905'], 'alpha-of-the-seas#gross_tonnage': ['100000', '101000'] }) });
  const git = (...a) => spawnSync('git', ['-C', dir, ...a], { encoding: 'utf8' });
  git('init', '-q'); git('config', 'user.email', 't@example.invalid'); git('config', 'user.name', 't'); git('config', 'core.hooksPath', '/dev/null');
  git('add', '-A'); git('commit', '-qm', 'base');
  writeFileSync(join(dir, BASELINE), renderBaseline({ 'alpha-of-the-seas#crew': ['900', '905'], 'alpha-of-the-seas#gross_tonnage': ['100000', '101000'], 'alpha-of-the-seas#imo': ['1234567', '7654321'] }));
  assert.equal(cli(dir).status, 0, 'without a base, the grown file just makes the disagreement known');
  const r = cli(dir, '--base', 'HEAD');
  assert.equal(r.status, 1); assert.match(r.stderr, /grew at "alpha-of-the-seas#imo"/);
});

// The two sources C8 added second: the line's own captured page (C2b) and the voyage-pack fact sheets.
const PACK = (specs) => ({ ship_specs: specs });
const OFFICIAL = (entity, outcome, items) => ({ format: 'lexicon-observation/1', entity, outcome, items });
const SECOND = {
  'assets/data/lexicon/observations/alpha-of-the-seas.json': OFFICIAL('ship:alpha-of-the-seas', 'captured', [
    { label: 'Gross Tonnage', raw: '100,000' }, { label: 'Guest Capacity', raw: '2,000' }, { label: 'Onboard Crew', raw: '910' }]),
  'assets/data/lexicon/observations/beta-of-the-seas.json': OFFICIAL('ship:beta-of-the-seas', 'content_not_served', [{ label: 'Gross Tonnage', raw: '1' }]),
  'admin/voyage-packs/v1-alpha.factcheck.json': PACK({ gross_tonnage: { value: '100,000 GT', source: 'x' }, crew: { value: '900 crew' },
    capacity_double_max: { value: '2,000 double occupancy / 2,600 maximum' }, imo: { value: '1234567' } }),
  'admin/voyage-packs/v1-beta.factcheck.json': PACK({ gross_tonnage: { value: 'about 90,000 GT' }, crew: '~1,000' }),
  'admin/voyage-packs/v1-stray.factcheck.json': PACK({ gross_tonnage: { value: '5 GT' } }),
  [PACK_SHIPS]: { packs: { 'v1-alpha': 'alpha-of-the-seas', 'v1-beta': 'beta-of-the-seas' } },
};

test('cross-check: a pack figure is read only when it carries its own label; approximate prose is skipped whole', () => {
  const v = (k, raw) => readPackSpec(k, raw).filter((r) => !r.skip).map((r) => `${r.property}=${r.value}`);
  assert.deepEqual(v('crew', '1,733 crew'), ['crew=1733']);
  assert.deepEqual(v('crew', '647 (Wikipedia); pack does not assert a crew count'), []);
  assert.deepEqual(v('crew', 'about 1,150 to 1,160'), []);
  assert.deepEqual(v('gross_tonnage', 'about 170,000 GT'), []);
  assert.deepEqual(v('guests', 'about 2,000 guests at double occupancy'), [], 'approximate prose is skipped even where the label is plain');
  assert.deepEqual(v('capacity', 'roughly 3,000 maximum'), []);
  assert.deepEqual(v('gross_tonnage', '93,502'), ['gross_tonnage=93502']);
  assert.deepEqual(v('guests', '4,218 guests at double occupancy'), ['guests_double=4218']);
  assert.deepEqual(v('capacity_double_max', '5,610 double / 7,600 max'), ['guests_double=5610', 'guests_max=7600']);
  assert.deepEqual(v('capacity_double_max', '1,432 guests (double occupancy)'), ['guests_double=1432']);
  assert.deepEqual(v('capacity_double_max', '3,998 lower berths / 4,004 at double occupancy'), ['guests_double=4004'], 'lower berths is not double occupancy');
  assert.deepEqual(v('capacity_double_max', '2,114 guests at lower berths; 2,680 at full occupancy'), [], 'neither label is double or max');
  assert.deepEqual(v('capacity', '2,394 guests'), []);
  assert.deepEqual(v('guests', '2,770 Sailors (Virgin fleet figure); no double-occupancy figure published'), []);
  assert.deepEqual(v('guests_double_occupancy', '3,879'), ['guests_double=3879']);
  assert.deepEqual(v('imo', '9677076'), ['imo=9677076']);
  assert.deepEqual(v('decks', '20'), [], 'a property the check does not compare is not read');
});

test('cross-check: the line-official and voyage-pack sources read their shapes, and a pack joins only through the map', (t) => {
  const dir = tree(t, { ...FIXTURE, ...SECOND });
  const { observations, perSource } = collect(dir);
  const via = (id) => observations.filter((o) => o.via === id).map((o) => `${o.slug}#${o.property}=${o.value}`).sort();
  assert.deepEqual(via('line-official'), ['alpha-of-the-seas#crew=910', 'alpha-of-the-seas#gross_tonnage=100000'],
    'an unlabelled guest capacity is not read, and a page the line did not serve holds no figure');
  assert.deepEqual(via('voyage-pack'), ['alpha-of-the-seas#crew=900', 'alpha-of-the-seas#gross_tonnage=100000',
    'alpha-of-the-seas#guests_double=2000', 'alpha-of-the-seas#guests_max=2600', 'alpha-of-the-seas#imo=1234567']);
  assert.equal(observations.some((o) => o.value === '5'), false, 'an unmapped pack is never guessed onto a ship');
  assert.deepEqual(unjoinedPacks(dir), ['v1-stray']);
  assert.equal(perSource['voyage-pack'], 5);
});

test('cross-check CLI: a pack map that is not slug-shaped is UNAVAILABLE; an unmapped pack is named on every run', (t) => {
  const dir = tree(t, { ...SECOND, [PACK_SHIPS]: { packs: { 'v1-alpha': 'Alpha of the Seas' } } });
  const r = cli(dir);
  assert.equal(r.status, 3); assert.match(r.stderr, /must map to a ship slug/);
  const ok = cli(tree(t, { ...SECOND, [BASELINE]: renderBaseline({}) }), '--report');
  assert.match(ok.stdout, /not joined to a ship .*: v1-stray/);
});

// A tree whose committed baseline predates the second sources, as main's did.
function adoptable(t, files) {
  const dir = tree(t, { ...FIXTURE, ...SECOND, [BASELINE]: renderBaseline({
    'alpha-of-the-seas#crew': ['900', '905'], 'alpha-of-the-seas#gross_tonnage': ['100000', '101000'], 'alpha-of-the-seas#imo': ['1234567', '7654321'] }, FIRST_SOURCES) });
  const git = (...a) => spawnSync('git', ['-C', dir, ...a], { encoding: 'utf8' });
  git('init', '-q'); git('config', 'user.email', 't@example.invalid'); git('config', 'user.name', 't'); git('config', 'core.hooksPath', '/dev/null');
  git('add', '-A'); git('commit', '-qm', 'base');
  for (const [rel, body] of Object.entries(files || {})) writeFileSync(join(dir, rel), typeof body === 'string' ? body : JSON.stringify(body));
  return dir;
}

test('cross-check CLI: a source the baseline does not record is refused until adopted; adoption admits what only it reveals', (t) => {
  const dir = adoptable(t);
  const before = cli(dir);
  assert.equal(before.status, 1); assert.match(before.stderr, /differs at line-official, voyage-pack/);
  const a = cli(dir, '--adopt-sources');
  assert.equal(a.status, 0, a.stderr);
  const b = parseBaseline(readFileSync(join(dir, BASELINE), 'utf8'));
  assert.deepEqual(b['alpha-of-the-seas#crew'], ['900', '905', '910'], 'the line page adds a third crew reading');
  assert.equal(cli(dir).status, 0);
  const based = cli(dir, '--base', 'HEAD');
  assert.equal(based.status, 0, based.stderr); assert.match(based.stdout, /admitted because only the newly read/);
});

test('cross-check CLI: adoption refuses a disagreement an old copy caused in the same commit', (t) => {
  // The page.json gross tonnage is edited at the same time the new sources arrive.
  const dir = adoptable(t, { 'assets/data/ships/rcl/alpha-of-the-seas.page.json': { imo: '1234567', gt: 99999, tracker: { imo: '7654321' } } });
  const a = cli(dir, '--adopt-sources');
  assert.equal(a.status, 1); assert.match(a.stderr, /not the new source's alone/); assert.match(a.stderr, /alpha-of-the-seas#gross_tonnage/);
});

test('cross-check CLI: with --base, an adopted entry may not park a value nobody reads, and a dropped source is refused', (t) => {
  const dir = adoptable(t);
  assert.equal(cli(dir, '--adopt-sources').status, 0);
  const b = parseBaseline(readFileSync(join(dir, BASELINE), 'utf8'));
  writeFileSync(join(dir, BASELINE), renderBaseline({ ...b, 'alpha-of-the-seas#crew': [...b['alpha-of-the-seas#crew'], '1999'] }));
  const parked = cli(dir, '--base', 'HEAD');
  assert.equal(parked.status, 1); assert.match(parked.stderr, /grew at "alpha-of-the-seas#crew"/);
  // A baseline recording a source the tool no longer reads.
  writeFileSync(join(dir, BASELINE), renderBaseline(b, [...FIRST_SOURCES, 'line-official', 'voyage-pack', 'retired-reader']));
  const stale = cli(dir);
  assert.equal(stale.status, 1); assert.match(stale.stderr, /differs at retired-reader/);
});

test('cross-check CLI: with --base, a commit that stops reading a source and drops it from the baseline is refused', (t) => {
  const dir = adoptable(t);
  assert.equal(cli(dir, '--adopt-sources').status, 0);
  const b = parseBaseline(readFileSync(join(dir, BASELINE), 'utf8'));
  const git = (...a) => spawnSync('git', ['-C', dir, ...a], { encoding: 'utf8' });
  writeFileSync(join(dir, BASELINE), renderBaseline(b, [...baselineSources(readFileSync(join(dir, BASELINE), 'utf8')), 'retired-reader']));
  git('add', '-A'); git('commit', '-qm', 'a baseline that once recorded another reader');
  writeFileSync(join(dir, BASELINE), renderBaseline(b));
  const r = cli(dir, '--base', 'HEAD');
  assert.equal(r.status, 1); assert.match(r.stderr, /grew at "sources:retired-reader"/);
});

test('cross-check CLI: --shrink-baseline keeps the recorded sources; it never adopts one', (t) => {
  const dir = adoptable(t);
  assert.equal(cli(dir, '--shrink-baseline').status, 0);
  assert.deepEqual(baselineSources(readFileSync(join(dir, BASELINE), 'utf8')), [...FIRST_SOURCES].sort());
  assert.equal(cli(dir).status, 1, 'still refused until --adopt-sources');
});

test('cross-check: this repository has no ship-fact disagreement the baseline does not hold', () => {
  const r = spawnSync(process.execPath, [CLI], { encoding: 'utf8', cwd: ROOT });
  assert.equal(r.status, 0, `${r.stdout}\n${r.stderr}\nremedy: correct the wrong copy; see admin/lexicon/CROSS-CHECK.md`);
});
