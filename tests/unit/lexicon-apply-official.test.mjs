// Setting In the Wake's copies of a ship fact to the cruise line's own figure (Tekton itw-c2b-rcl-fleet-fact-sheets;
// admin/lexicon/apply-official.mjs). Soli Deo Gloria.
//
// Each case runs on a throwaway tree whose right answer is written down: what changes, what stays byte for byte,
// and what is named for a person instead of edited.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { plan, apply, restyle, setField, setSlots } from '../../admin/lexicon/apply-official.mjs';

const ROOT = new URL('../../', import.meta.url).pathname;
const CLI = join(ROOT, 'admin/lexicon/apply-official.mjs');

function tree(t, files) {
  const dir = mkdtempSync(join(tmpdir(), 'apply-official-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  for (const [rel, body] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, rel)), { recursive: true });
    writeFileSync(join(dir, rel), body);
  }
  return dir;
}

const OBS = (entity, items) => JSON.stringify({ format: 'lexicon-observation/1', entity, source_kind: 'line-official', publisher: 'Royal Caribbean', url: 'https://royalcaribbeanmedia.com/files/fact-sheets/en/x.pdf', retrieved_at: '2026-10-27T00:00:00Z', outcome: 'captured', items });
const PAGE = `<html><head><meta name="description" content="Alpha (2009, 225,282 GT, 5,400 guests)."></head><body>
<ul><li><strong>Tonnage:</strong> 225,282 GT</li><li><strong>Guests:</strong> 5,400</li><li><strong>Crew:</strong> 2,165</li></ul>
<div><span class="stat-key">Crew</span><span class="stat-val">2,165</span></div>
<div><span class="stat-key">Guests</span><span class="stat-val">5,400 (double) / 6,771 (max)</span></div>
<p>At 225,282 GT she was the largest ship afloat when she debuted, with a crew of 2,165.</p>
<script type="application/json" id="ship-stats-fallback">{"slug":"alpha-of-the-seas","gt":"225,282 GT","guests":"5,400 (double) / 6,771 (max)","crew":"2,165"}</script>
</body></html>
`;
const ATLAS = `{
  "ships": [
    {
      "ship_id": "rcl-alpha-of-the-seas",
      "gt": 225282,
      "pax_double": 5400,
      "pax_max": 6771,
      "crew": 2165,
      "sources": {
        "gt": ["Vacations To Go"],
        "length_m": ["Royal Caribbean Official"]
      },
      "confidence": "verified"
    },
    {
      "ship_id": "rcl-beta-of-the-seas",
      "gt": 1000,
      "crew": 10,
      "sources": {
        "gt": ["x"]
      }
    }
  ]
}
`;
const FILES = {
  'assets/data/lexicon/observations/alpha-of-the-seas.json': OBS('ship:alpha-of-the-seas', [
    { label: 'CREW', raw: '2,109' }, { label: 'GUESTS (DOUBLE OCCUPANCY)', raw: '5,602' }, { label: 'GT', raw: '226,838' }]),
  'ships/rcl/alpha-of-the-seas.html': PAGE,
  'data/atlas/ship-size-atlas.json': ATLAS,
  'assets/data/fleet_index.json': JSON.stringify({ cruise_lines: [{ ships: [{ slug: 'alpha-of-the-seas', gt: '225,282' }] }] }, null, 2) + '\n',
};

test('apply-official: a copy is restyled the way it was written', () => {
  assert.equal(restyle('"225,282 GT"', 226838), '"226,838 GT"');
  assert.equal(restyle('"2,165"', 2109), '"2,109"');
  assert.equal(restyle('"894"', 1001), '"1001"', 'an ungrouped string stays ungrouped');
  assert.equal(restyle('225282', 226838), '226838', 'a number stays a number');
  const text = '{"a": {"crew": 1}, "b": {"crew": 2}}';
  assert.equal(setField(text, text.indexOf('"b"'), text.length, 'crew', () => '9'), '{"a": {"crew": 1}, "b": {"crew": 9}}', 'only inside the block');
  assert.equal(setField(text, 0, 5, 'crew', () => '9'), null, 'a field past the block end is not found');
});

test('apply-official: slots holding exactly the old figure change, and nothing else does', () => {
  const { text, count } = setSlots(PAGE, 'crew', '2165', 2109);
  assert.equal(count, 2);
  assert.ok(text.includes('<strong>Crew:</strong> 2,109') && text.includes('stat-val">2,109<'));
  assert.ok(text.includes('with a crew of 2,165.'), 'prose is never edited');
  assert.equal(setSlots('<strong>Crew:</strong> 2,1650', 'crew', '2165', 2109).count, 0, 'a longer number that starts the same is not the figure');
});

test('apply-official: every copy is set to the line\'s figure, by surgical edits, and prose is named, not changed', (t) => {
  const dir = tree(t, FILES);
  const { changes, left } = plan(dir);
  assert.deepEqual(left, []);
  assert.deepEqual(changes.map((c) => `${c.key} ${c.file} ${c.field} ${c.from}->${c.to}`).sort(), [
    'alpha-of-the-seas#crew data/atlas/ship-size-atlas.json crew 2165->2109',
    'alpha-of-the-seas#crew ships/rcl/alpha-of-the-seas.html crew 2165->2109',
    'alpha-of-the-seas#gross_tonnage assets/data/fleet_index.json gt 225282->226838',
    'alpha-of-the-seas#gross_tonnage data/atlas/ship-size-atlas.json gt 225282->226838',
    'alpha-of-the-seas#gross_tonnage ships/rcl/alpha-of-the-seas.html gt 225282->226838',
    'alpha-of-the-seas#guests_double data/atlas/ship-size-atlas.json pax_double 5400->5602',
    'alpha-of-the-seas#guests_double ships/rcl/alpha-of-the-seas.html guests 5400->5602',
  ]);
  const r = apply(dir, changes);
  assert.equal(r.failed.length, 0);
  const page = readFileSync(join(dir, 'ships/rcl/alpha-of-the-seas.html'), 'utf8');
  assert.match(page, /"gt":"226,838 GT","guests":"5,602 \(double\) \/ 6,771 \(max\)","crew":"2,109"/, 'the max figure beside the double one stays');
  assert.ok(page.includes('<strong>Tonnage:</strong> 226,838 GT') && page.includes('stat-val">5,602 (double) / 6,771 (max)<'));
  assert.ok(page.includes('At 225,282 GT she was the largest ship afloat when she debuted, with a crew of 2,165.'), 'history stays as written');
  assert.ok(page.includes('content="Alpha (2009, 225,282 GT, 5,400 guests)."'), 'meta prose stays as written');
  assert.deepEqual(r.proseHits.map((p) => `${p.key} ${p.left}`).sort(), ['alpha-of-the-seas#crew 1', 'alpha-of-the-seas#gross_tonnage 2', 'alpha-of-the-seas#guests_double 1']);
  const atlas = readFileSync(join(dir, 'data/atlas/ship-size-atlas.json'), 'utf8');
  assert.equal(atlas, ATLAS
    .replace('"gt": 225282', '"gt": 226838').replace('"pax_double": 5400', '"pax_double": 5602').replace('"crew": 2165', '"crew": 2109')
    .replace('"gt": ["Vacations To Go"]', '"gt": ["Royal Caribbean Official"]')
    // Each new entry opens the sources object, so the one added last reads first.
    .replace('"sources": {\n        "gt": ["Royal', '"sources": {\n        "pax_double": ["Royal Caribbean Official"],\n        "crew": ["Royal Caribbean Official"],\n        "gt": ["Royal'),
    'the atlas changes only in those fields and their sources; beta-of-the-seas is untouched');
  assert.deepEqual(plan(dir).changes, [], 'nothing left to change: every copy now reads the line\'s figure');
});

test('apply-official: it refuses to guess', (t) => {
  // An approximate double figure on the page is not a reading, so nothing is planned for it; a record found twice
  // is never edited; and two different readings from the line itself are left alone.
  const twice = tree(t, { ...FILES, 'assets/data/fleet_index.json': JSON.stringify({ cruise_lines: [
    { ships: [{ slug: 'alpha-of-the-seas', gt: '225,282' }] }, { ships: [{ slug: 'alpha-of-the-seas', gt: '225,282' }] }] }, null, 2) + '\n' });
  const r = apply(twice, plan(twice).changes);
  assert.deepEqual(r.failed.map((f) => f.file), ['assets/data/fleet_index.json', 'assets/data/fleet_index.json'], 'both copies of the twice-listed ship are refused');
  const out = spawnSync(process.execPath, [CLI, '--root', twice, '--apply'], { encoding: 'utf8' });
  const fresh = tree(t, { ...FILES, 'assets/data/fleet_index.json': JSON.stringify({ cruise_lines: [
    { ships: [{ slug: 'alpha-of-the-seas', gt: '225,282' }] }, { ships: [{ slug: 'alpha-of-the-seas', gt: '225,282' }] }] }, null, 2) + '\n' });
  const cli = spawnSync(process.execPath, [CLI, '--root', fresh, '--apply'], { encoding: 'utf8' });
  assert.equal(cli.status, 1, cli.stdout + cli.stderr);
  assert.match(cli.stderr, /REFUSED itw_apply_official_unverified: alpha-of-the-seas#gross_tonnage in assets\/data\/fleet_index\.json/);
  assert.equal(out.status, 1);

  const split = tree(t, { ...FILES,
    'assets/data/lexicon/observations/alpha-of-the-seas.json': OBS('ship:alpha-of-the-seas', [{ label: 'CREW', raw: '2,109' }]),
    'assets/data/lexicon/observations/alpha-of-the-seas-dup.json': OBS('ship:alpha-of-the-seas', [{ label: 'CREW', raw: '2,110' }]) });
  const p = plan(split);
  assert.equal(p.changes.some((c) => c.property === 'crew'), false);
  assert.deepEqual(p.left.map((l) => l.why), ['the line\'s own readings disagree']);

  const approx = tree(t, { ...FILES, 'ships/rcl/alpha-of-the-seas.html': PAGE.replace('"guests":"5,400 (double)', '"guests":"~5,400 (double)') });
  assert.equal(plan(approx).changes.some((c) => c.file.endsWith('.html') && c.property === 'guests_double'), false);
});

test('apply-official: an edit that changes text but not what the file says is refused on re-read', (t) => {
  // A hand-edited record can carry a key twice; a JSON reader keeps the last, and the edit changes the first.
  const dupe = tree(t, { ...FILES, 'data/atlas/ship-size-atlas.json': ATLAS.replace('"crew": 2165,', '"crew": 2165,\n      "crew": 2165,') });
  const r = spawnSync(process.execPath, [CLI, '--root', dupe, '--apply'], { encoding: 'utf8' });
  assert.equal(r.status, 1, r.stdout);
  assert.match(r.stderr, /REFUSED itw_apply_official_unverified: alpha-of-the-seas#crew in data\/atlas\/ship-size-atlas\.json does not read 2109/);
});

test('apply-official: an atlas row is found under any line prefix, never guessed', (t) => {
  // Norwegian rows are ncl-<slug>; the first build looked only for rcl- and found none (caught by the re-read).
  const ncl = tree(t, { ...FILES,
    'assets/data/lexicon/observations/alpha-of-the-seas.json': OBS('ship:alpha-of-the-seas', [{ label: 'CREW', raw: '2,109' }]),
    'data/atlas/ship-size-atlas.json': ATLAS.replace('"ship_id": "rcl-alpha-of-the-seas"', '"ship_id": "ncl-alpha-of-the-seas"') });
  const r = apply(ncl, plan(ncl).changes);
  assert.equal(r.failed.length, 0);
  assert.match(readFileSync(join(ncl, 'data/atlas/ship-size-atlas.json'), 'utf8'), /"ship_id": "ncl-alpha-of-the-seas",[\s\S]*?"crew": 2109/);
  const two = tree(t, { ...FILES,
    'assets/data/lexicon/observations/alpha-of-the-seas.json': OBS('ship:alpha-of-the-seas', [{ label: 'CREW', raw: '2,109' }]),
    'data/atlas/ship-size-atlas.json': ATLAS.replace('"ship_id": "rcl-beta-of-the-seas"', '"ship_id": "ncl-alpha-of-the-seas"') });
  const before = readFileSync(join(two, 'data/atlas/ship-size-atlas.json'), 'utf8');
  const r2 = apply(two, plan(two).changes);
  assert.ok(r2.failed.length >= 1 && r2.failed.every((f) => f.file === 'data/atlas/ship-size-atlas.json'), 'two rows for one slug: every atlas edit is refused');
  assert.equal(readFileSync(join(two, 'data/atlas/ship-size-atlas.json'), 'utf8'), before, 'and the atlas is not touched');
});

test('apply-official: a dry run changes nothing', (t) => {
  const dir = tree(t, FILES);
  const r = spawnSync(process.execPath, [CLI, '--root', dir], { encoding: 'utf8' });
  assert.equal(r.status, 0);
  assert.match(r.stdout, /dry run, 7 change\(s\)/);
  assert.equal(readFileSync(join(dir, 'ships/rcl/alpha-of-the-seas.html'), 'utf8'), PAGE);
});
