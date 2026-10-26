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
import { collect, compare, judge, parseBaseline, renderBaseline, BASELINE } from '../../admin/lexicon/cross-check.mjs';

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

test('cross-check: this repository has no ship-fact disagreement the baseline does not hold', () => {
  const r = spawnSync(process.execPath, [CLI], { encoding: 'utf8', cwd: ROOT });
  assert.equal(r.status, 0, `${r.stdout}\n${r.stderr}\nremedy: correct the wrong copy; see admin/lexicon/CROSS-CHECK.md`);
});
