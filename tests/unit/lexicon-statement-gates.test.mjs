// Lexicon C4: the statement gates (Tekton itw-c4-statement-gates). Soli Deo Gloria.
// Each refusal is attacked on a small fixture tree; the committed tree must pass at both depths. The checks that
// need Project-Sophos's contract skip, saying so, when it is not beside this repo.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, copyFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { checkUnsourced, checkConflicts } from '../../admin/lexicon/statement-gates.mjs';
import { verifyManifest, manifestText, MANIFEST, RENDERER, markStart, MARK_END } from '../../admin/lexicon/render-infobox.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const LEX = path.resolve(ROOT, '..', 'Project-Sophos', 'sophos', 'src', 'lexicon');
const skip = !existsSync(path.join(LEX, 'statement.mjs')) && 'Project-Sophos not beside this checkout';
const contract = skip ? null : await import(pathToFileURL(path.join(LEX, 'statement.mjs')).href);
const PILOT = [{ entity: 'ship:test-ship', pages: ['x/test-ship'] }];
const AT = '2026-10-29T00:00:00Z';

// A statement as ship-statements.mjs files them, without the contract (shape only), for the unsourced checks.
const raw = (status, evidence, sourceRef = 'itw:ships/x/test-ship.html#crew') => ({
  subject: 'ship:test-ship#crew', provenance: { source_ref: sourceRef }, epistemic: { status, evidence },
  ext: { entity: 'ship:test-ship', property: 'crew', value: 1, rank: 'normal' },
});
function tree({ statements = [], card = null, fallback = '{"beam":"100 ft"}' } = {}) {
  const root = mkdtempSync(path.join(tmpdir(), 'itw-gates-'));
  mkdirSync(path.join(root, 'assets/data/entities/ship'), { recursive: true });
  mkdirSync(path.join(root, 'assets/data/lexicon'), { recursive: true });
  mkdirSync(path.join(root, 'admin/lexicon'), { recursive: true });
  mkdirSync(path.join(root, 'ships/x'), { recursive: true });
  copyFileSync(path.join(ROOT, RENDERER), path.join(root, RENDERER));
  writeFileSync(path.join(root, 'assets/data/entities/ship/test-ship.json'), JSON.stringify({ format: 'lexicon-entity/1', entity: 'ship:test-ship', statements }));
  const mount = card ?? '<div id="ship-stats" class="stats-grid" data-infobox="statements">\n  <div class="stat-line" data-prop="crew"><span class="stat-key">Crew</span><span class="stat-val">894</span></div>\n</div>';
  const html = `<main>\n${markStart('test-ship')}\n${mount}\n${MARK_END}\n<script type="application/json" id="ship-stats-fallback">${fallback}</script>\n</main>\n`;
  writeFileSync(path.join(root, 'ships/x/test-ship.html'), html);
  return { root, html, done: () => rmSync(root, { recursive: true, force: true }) };
}
const record = (t) => writeFileSync(path.join(t.root, MANIFEST), manifestText(t.root, [{ rel: 'ships/x/test-ship.html', kind: 'marked', next: t.html, withheld: [] }], PILOT));

test('unsourced: a claim with no evidence, a blank ref, or no source is refused; an abstention is not', () => {
  const t = tree({ statements: [
    raw('inference', []), raw('known', [{ ref: '  ' }]), raw('inference', [{ ref: 'itw:x' }], null), raw('unknown', []), raw('inference', [{ ref: 'itw:x' }]),
  ] });
  try {
    const why = checkUnsourced(t.root).map((f) => f.why);
    assert.deepEqual(why, ['status inference with no evidence', 'status known with a blank evidence ref', 'status inference with no provenance.source_ref']);
  } finally { t.done(); }
});

test('unsourced: verified must rest on a web page read in the session, not on this site\'s records', () => {
  const t = tree({ statements: [raw('verified', [{ ref: 'itw:ships/x/test-ship.html#crew' }]), raw('verified', [{ ref: 'https://line.example/ship' }], 'https://line.example/ship')] });
  try {
    const f = checkUnsourced(t.root);
    assert.equal(f.length, 1);
    assert.match(f[0].why, /verified, but no evidence is a web page/);
  } finally { t.done(); }
});

test('manifest depth: a recorded card verifies; each kind of change after it is named', () => {
  const t = tree();
  try {
    assert.deepEqual(verifyManifest(t.root, PILOT).map((f) => f.why), ['cannot be read (ENOENT); run the renderer'].map((w) => w), 'no manifest yet');
    record(t);
    assert.deepEqual(verifyManifest(t.root, PILOT), []);
    const page = path.join(t.root, 'ships/x/test-ship.html');
    writeFileSync(page, t.html.replace('>894<', '>999<'));
    assert.deepEqual(verifyManifest(t.root, PILOT).map((f) => f.why), ['the card was edited after it was rendered']);
    writeFileSync(page, t.html.replace('"100 ft"', '"101 ft"'));
    assert.deepEqual(verifyManifest(t.root, PILOT).map((f) => f.why), ["the page's #ship-stats-fallback changed since the card was rendered"]);
    writeFileSync(page, t.html);
    writeFileSync(path.join(t.root, 'assets/data/entities/ship/test-ship.json'), '{"statements":[]}');
    assert.match(verifyManifest(t.root, PILOT)[0].why, /test-ship\.json changed since the card was rendered/);
  } finally { t.done(); }
});

test('manifest depth: a renderer changed since the render, or a card no longer marked, is drift', () => {
  const t = tree();
  try {
    record(t);
    writeFileSync(path.join(t.root, RENDERER), `${readFileSync(path.join(t.root, RENDERER), 'utf8')}\n// changed\n`);
    assert.deepEqual(verifyManifest(t.root, PILOT).map((f) => f.why), ['the renderer changed since the cards were rendered']);
    copyFileSync(path.join(ROOT, RENDERER), path.join(t.root, RENDERER));
    writeFileSync(path.join(t.root, 'ships/x/test-ship.html'), t.html.replace(markStart('test-ship'), ''));
    assert.match(verifyManifest(t.root, PILOT)[0].why, /not marked/);
  } finally { t.done(); }
});

const stmt = (property, value, at = '2026-10-26T10:00:00.000Z') => contract.makeStatement({
  pack: 'cruise.ship', entity: 'ship:test-ship', property, value, partition: 'public', status: 'inference',
  evidence: [{ ref: `itw:ships/x/test-ship.html#${property}`, tier: 'secondary' }], sourceRef: `itw:ships/x/test-ship.html#${property}`,
  publisher: 'In the Wake', assertedAt: at, observedAt: at, clock: () => at,
});

test('conflict: a card showing a value its statements dispute is refused; a resolved one is not', { skip }, () => {
  const disputed = tree({ statements: [stmt('crew', 894), stmt('crew', 900)] });
  const settled = tree({ statements: [stmt('crew', 894)] });
  try {
    assert.deepEqual(checkConflicts(disputed.root, contract.currentValue, { at: AT, pilot: PILOT }).map((f) => f.why), ['crew is shown but its statements are conflicting']);
    assert.deepEqual(checkConflicts(settled.root, contract.currentValue, { at: AT, pilot: PILOT }), []);
  } finally { disputed.done(); settled.done(); }
});

test('conflict: the page\'s own figure may not stand in where statements exist; only the shown guests half is judged', { skip }, () => {
  const pageRow = '<div id="ship-stats" class="stats-grid" data-infobox="statements">\n  <div class="stat-line" data-prop="page:crew"><span class="stat-key">Crew</span><span class="stat-val">894</span></div>\n</div>';
  const guests = '<div id="ship-stats" class="stats-grid" data-infobox="statements">\n  <div class="stat-line" data-prop="guests"><span class="stat-key">Guests</span><span class="stat-val">1,804 (double)</span></div>\n</div>';
  const a = tree({ statements: [stmt('crew', 894), stmt('crew', 900)], card: pageRow });
  const b = tree({ statements: [stmt('guests_double', 1804), stmt('guests_max', 2076), stmt('guests_max', 2100)], card: guests });
  try {
    assert.deepEqual(checkConflicts(a.root, contract.currentValue, { at: AT, pilot: PILOT }).map((f) => f.why), ["the page's own crew is shown where the statements hold crew (conflicting)"]);
    assert.deepEqual(checkConflicts(b.root, contract.currentValue, { at: AT, pilot: PILOT }), [], 'the disputed maximum is not shown, so nothing is published');
  } finally { a.done(); b.done(); }
});

const gates = (args, env = {}) => spawnSync(process.execPath, ['admin/lexicon/statement-gates.mjs', ...args], { cwd: ROOT, encoding: 'utf8', env: { ...process.env, ...env } });

test('the committed tree passes at the manifest depth, and says what that depth does not check', () => {
  const r = gates(['--ci']);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /manifest depth \(--ci\)/);
  assert.match(r.stdout, /NOT checked here: .*itw_conflict_published/);
});

test('the committed tree passes at full depth', { skip }, () => {
  const r = gates([]);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /full depth \(contract found\)/);
});

test('a missing contract falls back loudly to the manifest depth, never to a silent pass', () => {
  const r = gates([], { LEXICON_CONTRACT_DIR: path.join(tmpdir(), 'no-such-contract') });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /contract UNAVAILABLE/);
  assert.doesNotMatch(r.stdout, /full depth/);
});
