import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { extractArticleMeta } from '../lib/extract.js';

const fixture = readFileSync(new URL('./fixtures/article-tipping.html', import.meta.url), 'utf8');

test('extracts all required fields from a real article head', () => {
  const meta = extractArticleMeta(fixture);
  assert.equal(meta.title, "Cruise Tipping for 2026: What You'll Actually Owe, by Line");
  assert.equal(meta.description, "2026 daily rates across all 15 major lines, plus the auto-grats most calculators miss.");
  assert.equal(meta.canonicalUrl, "https://cruisinginthewake.com/articles/cruise-tipping-2026.html");
  assert.equal(meta.ogImageUrl, "https://cruisinginthewake.com/assets/social/articles/cruise-tipping-2026.jpg");
  assert.equal(meta.ogImagePath, "/assets/social/articles/cruise-tipping-2026.jpg");
  assert.equal(meta.publishedDate, "2026-05-08");
  assert.equal(meta.authorName, "Ken Baker");
  assert.equal(meta.slug, "cruise-tipping-2026");
});

test('throws with explicit list of missing tags', () => {
  const incomplete = `<!doctype html><html><head>
    <meta property="og:title" content="Test"/>
  </head></html>`;
  assert.throws(
    () => extractArticleMeta(incomplete),
    /missing.*og:description.*og:image.*canonical/i
  );
});

test('falls back to "Ken Baker" if article:author is absent', () => {
  const minimal = fixture.replace(/<meta property="article:author"[^/]*\/>/, '');
  const meta = extractArticleMeta(minimal);
  assert.equal(meta.authorName, "Ken Baker");
});

test('derives author name from URL slug (e.g. tina-maulsby -> Tina Maulsby)', () => {
  const swapped = fixture.replace(
    'authors/ken-baker.html',
    'authors/tina-maulsby.html'
  );
  const meta = extractArticleMeta(swapped);
  assert.equal(meta.authorName, "Tina Maulsby");
});

test('extracts ai-summary when present', () => {
  const meta = extractArticleMeta(fixture);
  assert.ok(meta.aiSummary.includes('$17–$25 per guest per day'));
});

test('aiSummary is null when absent', () => {
  const stripped = fixture.replace(/<meta name="ai-summary"[^/]*\/>/, '');
  const meta = extractArticleMeta(stripped);
  assert.equal(meta.aiSummary, null);
});
