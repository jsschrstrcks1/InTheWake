import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadManifest, saveManifest, alreadyPosted, recordPost } from '../lib/manifest.js';

const tmp = () => mkdtempSync(join(tmpdir(), 'pub-manifest-'));

test('loadManifest returns {} when missing', () => {
  const r = loadManifest(join(tmp(), 'm.json'));
  assert.deepEqual(r, {});
});

test('saveManifest/loadManifest roundtrip', () => {
  const path = join(tmp(), 'm.json');
  const data = {
    'articles/foo.html': {
      url: 'https://example.com/foo',
      platforms: { facebook: { posted_at: 'X', post_id: '1_2' } },
    },
  };
  saveManifest(path, data);
  assert.deepEqual(loadManifest(path), data);
});

test('alreadyPosted: true when platform key exists', () => {
  const m = { 'articles/foo.html': { platforms: { facebook: { post_id: '1' } } } };
  assert.equal(alreadyPosted(m, 'articles/foo.html', 'facebook'), true);
});

test('alreadyPosted: false when article or platform missing', () => {
  const m = { 'articles/foo.html': { platforms: { bluesky: { uri: 'at://' } } } };
  assert.equal(alreadyPosted(m, 'articles/foo.html', 'facebook'), false);
  assert.equal(alreadyPosted(m, 'articles/missing.html', 'facebook'), false);
});

test('recordPost adds/overwrites platform entry', () => {
  const m = {};
  recordPost(m, 'articles/foo.html', 'https://x.com/foo', 'facebook', {
    post_id: '1_2', permalink: 'https://facebook.com/InTheWake/posts/2',
  });
  assert.equal(m['articles/foo.html'].url, 'https://x.com/foo');
  assert.equal(m['articles/foo.html'].platforms.facebook.post_id, '1_2');
  assert.ok(m['articles/foo.html'].platforms.facebook.posted_at);
});
