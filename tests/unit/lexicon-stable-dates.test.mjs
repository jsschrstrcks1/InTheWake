// Statement dates survive a squash merge (Tekton itw-lexicon-stable-dates). Soli Deo Gloria.
// The rule: an unchanged statement keeps the dates it was committed with; only a new or changed one is dated by
// its sources' commits. Earlier dates are read from HEAD, never the working tree. These tests run on a scratch
// git repository with hand-made envelopes, so they need neither the network nor Project-Sophos.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { signature, priorDates, keepDates } from '../../admin/lexicon/stable-dates.mjs';

// The fields signature() reads, shaped like a contract envelope; `at` stands for every date-derived field.
const env = (value, at, extra = {}) => ({
  subject: 'ship:x#crew', id: `env-${at}`, uncertainty: { basis: at },
  ext: { pack: 'cruise.ship', value, unit: null, rank: 'normal', partition: 'public', ...extra.ext },
  epistemic: { status: 'inference', evidence: [{ ref: 'itw:ships/x.html#crew', tier: 'secondary' }], ...extra.epistemic },
  provenance: { publisher: 'In the Wake', source_ref: 'itw:ships/x.html#crew', uri: null },
  actor: { id: 'itw-lexicon-ship-statements' },
  timestamps: { asserted_at: at, observed_at: at },
});

test('a signature ignores the dates and what is derived from them, and nothing else', () => {
  assert.equal(signature(env(1450, '2026-01-01T00:00:00.000Z')), signature(env(1450, '2026-10-30T09:00:00.000Z')));
  assert.notEqual(signature(env(1450, 'A')), signature(env(1451, 'A')), 'value');
  assert.notEqual(signature(env(1450, 'A')), signature(env(1450, 'A', { ext: { rank: 'preferred' } })), 'rank');
  assert.notEqual(signature(env(1450, 'A')), signature(env(1450, 'A', { epistemic: { status: 'verified' } })), 'status');
  assert.notEqual(signature(env(1450, 'A')), signature(env(1450, 'A', { epistemic: { evidence: [{ ref: 'itw:other#crew', tier: 'secondary' }] } })), 'evidence');
  assert.notEqual(signature(env(1450, 'A')), signature(env(1450, 'A', { ext: { tolerance_m: 500 } })), 'tolerance');
});

test('an unchanged statement keeps its committed date; a changed one asks its sources', () => {
  const prior = new Map([[signature(env(1450, 'x')), { asserted_at: '2026-10-29T17:59:37.000Z', observed_at: '2026-10-29T17:59:37.000Z' }]]);
  let asked = 0;
  const fresh = () => { asked++; return '2026-10-30T09:00:00.000Z'; };
  assert.equal(keepDates(prior, (at) => env(1450, at), fresh).timestamps.asserted_at, '2026-10-29T17:59:37.000Z');
  assert.equal(asked, 0, 'the sources are not asked for an unchanged fact, so an uncommitted edit elsewhere cannot refuse it');
  assert.equal(keepDates(prior, (at) => env(1451, at), fresh).timestamps.asserted_at, '2026-10-30T09:00:00.000Z');
  assert.equal(asked, 1);
  // A committed statement whose two dates differ was not made by this rule; it is dated afresh, never half-kept.
  const split = new Map([[signature(env(1450, 'x')), { asserted_at: '2026-10-29T00:00:00.000Z', observed_at: '2026-10-28T00:00:00.000Z' }]]);
  assert.equal(keepDates(split, (at) => env(1450, at), fresh).timestamps.asserted_at, '2026-10-30T09:00:00.000Z');
});

test('earlier dates come from HEAD, never the working tree, and survive a squash merge', () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'itw-stable-dates-'));
  const git = (...a) => execFileSync('git', ['-C', dir, '-c', 'core.hooksPath=/dev/null', '-c', 'user.name=t', '-c', 'user.email=t@t', ...a], { encoding: 'utf8', env: { ...process.env, GIT_COMMITTER_DATE: '2026-10-30T09:00:00Z' } });
  try {
    git('init', '-q', '-b', 'main');
    mkdirSync(path.join(dir, 'e'));
    const write = (s) => writeFileSync(path.join(dir, 'e/x.json'), JSON.stringify({ statements: [s] }));
    write(env(1450, '2026-10-29T17:59:37.000Z'));
    git('add', '-A'); git('commit', '-qm', 'branch generated the file');
    // A squash merge keeps the file's content and gives it a new commit: the committed date is still read.
    git('checkout', '-qb', 'feature'); git('commit', '-q', '--allow-empty', '-m', 'feature');
    git('checkout', '-q', 'main'); git('merge', '-q', '--squash', 'feature'); git('commit', '-q', '--allow-empty', '-m', 'squash');
    write(env(1450, '1999-01-01T00:00:00.000Z')); // a hand edit, even staged, plants nothing
    git('add', '-A');
    const prior = priorDates(dir, ['e/x.json', 'e/missing.json']);
    assert.equal(prior.size, 1);
    assert.deepEqual(prior.get(signature(env(1450, 'any'))), { asserted_at: '2026-10-29T17:59:37.000Z', observed_at: '2026-10-29T17:59:37.000Z' });
    assert.deepEqual(priorDates(path.join(dir, 'not-a-repo'), ['e/x.json']), new Map(), 'an unreadable repository falls back to the sources');
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
