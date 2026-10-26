// Voyage-pack registry checker: CLEAN / REPORT / UNAVAILABLE, never two states. Soli Deo Gloria.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { checkRegistry } from '../../../admin/scripts/check-voyage-registry.mjs';

const ROOT = path.resolve(new URL('../../../', import.meta.url).pathname);

test('the committed registry is CLEAN against the files on disk', async () => {
  const r = await checkRegistry({ root: ROOT });
  assert.equal(r.state, 'CLEAN', JSON.stringify(r.drift, null, 2));
  assert.ok(r.packs >= 17, `expected at least 17 packs, saw ${r.packs}`);
});

test('a missing referenced file is drift, not a crash', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'vu-reg-'));
  await mkdir(path.join(root, 'admin/voyage-packs'), { recursive: true });
  await mkdir(path.join(root, 'admin/voyage-pwa'), { recursive: true });
  const r = await checkRegistry({
    root,
    registry: [{ slug: 'v0.9-x', pdf: { full: 'admin/voyage-packs/x.pdf', condensed: null, handoff: null }, instrumented: {}, sail_start: null, sail_end: null }],
  });
  assert.equal(r.state, 'REPORT');
  assert.ok(r.drift.some((d) => d.kind === 'missing-file' && d.file === 'admin/voyage-packs/x.pdf'));
  assert.ok(r.drift.some((d) => d.kind === 'missing-source'));
});

test('a file on disk that no record references is drift', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'vu-reg-'));
  await mkdir(path.join(root, 'admin/voyage-packs'), { recursive: true });
  await mkdir(path.join(root, 'admin/voyage-pwa'), { recursive: true });
  await writeFile(path.join(root, 'admin/voyage-pwa/stray.html'), '<!doctype html>');
  const r = await checkRegistry({ root, registry: [] });
  assert.equal(r.state, 'REPORT');
  assert.deepEqual(r.drift, [{ kind: 'unregistered-file', file: 'admin/voyage-pwa/stray.html' }]);
});

test('duplicate slugs and malformed dates are reported by name', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'vu-reg-'));
  await mkdir(path.join(root, 'admin/voyage-packs'), { recursive: true });
  await mkdir(path.join(root, 'admin/voyage-pwa'), { recursive: true });
  const rec = { slug: 'v0.9-dup', pdf: { full: null, condensed: null, handoff: null }, instrumented: {}, sail_start: '2027-13-01', sail_end: '2027-01-01' };
  const r = await checkRegistry({ root, registry: [rec, { ...rec }] });
  const kinds = r.drift.map((d) => d.kind);
  assert.ok(kinds.includes('duplicate-slug'));
  assert.ok(kinds.includes('bad-date'));
});

test('an unreadable registry is UNAVAILABLE, never CLEAN', async () => {
  const r = await checkRegistry({ root: path.join(tmpdir(), 'nowhere-' + Date.now()) });
  assert.equal(r.state, 'UNAVAILABLE');
  assert.match(r.reason, /unreadable/);
});
