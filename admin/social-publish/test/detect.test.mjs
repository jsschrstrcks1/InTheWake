import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newArticlesFromDiff, articleOptOut } from '../lib/detect.js';

test('newArticlesFromDiff: returns added files matching articles/*.html', () => {
  const diff = [
    'A\tarticles/new-cruise-piece.html',
    'M\tarticles/existing-cruise-piece.html',
    'A\tarticles/subdir/ignored.html',                // subdir not allowed
    'A\tassets/social/articles/new-card.jpg',         // not articles/
    'A\tdocs/something.md',
  ].join('\n');
  const result = newArticlesFromDiff(diff);
  assert.deepEqual(result, ['articles/new-cruise-piece.html']);
});

test('newArticlesFromDiff: empty when no additions', () => {
  const diff = 'M\tarticles/foo.html\nD\tarticles/bar.html';
  assert.deepEqual(newArticlesFromDiff(diff), []);
});

test('articleOptOut: returns true if <meta name="social-publish" content="skip"> present', () => {
  const html = `<!doctype html><html><head>
    <meta name="social-publish" content="skip"/>
  </head></html>`;
  assert.equal(articleOptOut(html), true);
});

test('articleOptOut: returns false if meta absent or other value', () => {
  assert.equal(articleOptOut('<html></html>'), false);
  assert.equal(articleOptOut('<meta name="social-publish" content="auto"/>'), false);
});
