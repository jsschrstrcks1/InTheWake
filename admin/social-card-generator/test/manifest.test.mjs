import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  loadManifest, saveManifest, computeContentHash, decideAction,
} from '../lib/manifest.js';

function tmp() { return mkdtempSync(join(tmpdir(), 'manifest-test-')); }

test('loadManifest returns empty object if file is missing', () => {
  const dir = tmp();
  const m = loadManifest(join(dir, 'missing.json'));
  assert.deepEqual(m, {});
});

test('saveManifest then loadManifest roundtrips', () => {
  const dir = tmp();
  const path = join(dir, '.generated-manifest.json');
  const m = { 'cruise-tipping-2026': { contentHash: 'abc123', generatedAt: '2026-05-17T00:00:00Z' }};
  saveManifest(path, m);
  assert.deepEqual(loadManifest(path), m);
});

test('computeContentHash is stable for the same title+description', () => {
  const a = computeContentHash('Title', 'Description');
  const b = computeContentHash('Title', 'Description');
  assert.equal(a, b);
  assert.equal(a.length, 8); // sha1 truncated to 8 chars for query-string brevity
});

test('computeContentHash differs when title changes', () => {
  const a = computeContentHash('Title A', 'Same Desc');
  const b = computeContentHash('Title B', 'Same Desc');
  assert.notEqual(a, b);
});

test('decideAction: generate when JPG missing', () => {
  const dir = tmp();
  const r = decideAction({
    cardPath: join(dir, 'nonexistent.jpg'),
    slug: 'foo',
    currentHash: 'aaaaaaaa',
    manifest: {},
  });
  assert.equal(r.action, 'generate');
});

test('decideAction: skip when JPG present and not in manifest (human photo)', () => {
  const dir = tmp();
  const cardPath = join(dir, 'photo.jpg');
  writeFileSync(cardPath, 'fake jpg bytes');
  const r = decideAction({ cardPath, slug: 'foo', currentHash: 'aaaaaaaa', manifest: {} });
  assert.equal(r.action, 'skip-human-photo');
});

test('decideAction: regenerate when JPG present, in manifest, hash differs', () => {
  const dir = tmp();
  const cardPath = join(dir, 'gen.jpg');
  writeFileSync(cardPath, 'fake');
  const r = decideAction({
    cardPath, slug: 'foo', currentHash: 'newhash1',
    manifest: { foo: { contentHash: 'oldhash9', generatedAt: '2026-01-01T00:00:00Z' }},
  });
  assert.equal(r.action, 'regenerate');
});

test('decideAction: skip when JPG present, in manifest, hash matches', () => {
  const dir = tmp();
  const cardPath = join(dir, 'gen.jpg');
  writeFileSync(cardPath, 'fake');
  const r = decideAction({
    cardPath, slug: 'foo', currentHash: 'samehash',
    manifest: { foo: { contentHash: 'samehash', generatedAt: '2026-01-01T00:00:00Z' }},
  });
  assert.equal(r.action, 'skip-fresh');
});
