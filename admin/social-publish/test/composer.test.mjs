import { test } from 'node:test';
import assert from 'node:assert/strict';
import { composeFacebookPost } from '../templates/facebook.js';

test('composeFacebookPost: message is "{ai-summary or og:description}\\n\\n{url}"', () => {
  const r = composeFacebookPost({
    title: 'Article Title',
    description: "A 2-sentence punchline that's specific.",
    aiSummary: "A longer, 2-3 sentence summary with the specifics — like dollar ranges and named lines — that's the best raw material for FB.",
    canonicalUrl: 'https://cruisinginthewake.com/articles/foo.html',
  });
  assert.equal(r.link, 'https://cruisinginthewake.com/articles/foo.html');
  assert.ok(r.message.startsWith("A longer, 2-3 sentence summary"));
  assert.ok(r.message.endsWith('https://cruisinginthewake.com/articles/foo.html'));
  assert.ok(r.message.includes('\n\n'));
});

test('composeFacebookPost: falls back to description when ai-summary absent', () => {
  const r = composeFacebookPost({
    title: 'T',
    description: 'Just the description.',
    aiSummary: null,
    canonicalUrl: 'https://x.com/y',
  });
  assert.equal(r.message, 'Just the description.\n\nhttps://x.com/y');
});

test('composeFacebookPost: no emojis, no exclamation, no banned phrases', () => {
  const r = composeFacebookPost({
    title: 'T',
    description: 'Real specifics here.',
    aiSummary: null,
    canonicalUrl: 'https://x.com/y',
  });
  assert.ok(!/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(r.message), 'no emojis');
  assert.ok(!/!/.test(r.message), 'no exclamation');
  assert.ok(!/\b(Discover|Unlock|Learn|Wondering)\b/.test(r.message), 'no banned hook words');
});

test('composeFacebookPost: throws if source body trips voice rules', () => {
  assert.throws(
    () => composeFacebookPost({
      title: 'T', description: 'Unlock the secrets!', aiSummary: null, canonicalUrl: 'u',
    }),
    /voice rules/i
  );
});
