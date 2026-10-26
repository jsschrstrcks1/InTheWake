// Companion FAQs answer real questions with sourced facts. Soli Deo Gloria.
// Every answer names where it came from, and every on-site link points at a page that exists.
// Pinned when the World America family FAQ was added (2026-10-04) alongside Prima's.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ROOT = new URL('../../', import.meta.url);
const pwaDir = new URL('admin/voyage-pwa/', ROOT);

function voyageOf(html) {
  const m = html.match(/window\.__VOYAGE\s*=\s*(\{[\s\S]*?\});/);
  if (!m) return null;
  // eslint-disable-next-line no-new-func
  return Function('return (' + m[1] + ')')();
}

const withFaq = readdirSync(pwaDir)
  .filter((f) => f.endsWith('.html'))
  .map((f) => [f, voyageOf(readFileSync(new URL(f, pwaDir), 'utf8'))])
  .filter(([, V]) => V && Array.isArray(V.faq) && V.faq.length);

test('at least Prima and the World America family companion carry an FAQ', () => {
  const names = withFaq.map(([f]) => f);
  assert.ok(names.includes('prima-caribbean.html'));
  assert.ok(names.includes('world-america-family-dec-2026.html'));
});

test('every FAQ answer has a question, an answer and a named source', () => {
  for (const [f, V] of withFaq) {
    for (const x of V.faq) {
      assert.ok(x.q && x.q.trim(), `${f}: a question is empty`);
      assert.ok(Array.isArray(x.a) && x.a.length && x.a.every((p) => p && p.trim()), `${f}: "${x.q}" has no answer`);
      assert.ok(x.source && x.source.trim(), `${f}: "${x.q}" names no source`);
    }
  }
});

test('every on-site FAQ link points at a page that exists', () => {
  for (const [f, V] of withFaq) {
    for (const x of V.faq) {
      for (const l of x.links || []) {
        if (!l.href.startsWith('/')) continue;
        const path = l.href.split('#')[0].split('?')[0];
        assert.ok(existsSync(fileURLToPath(new URL('.' + path, ROOT))), `${f}: "${x.q}" links to missing ${path}`);
      }
    }
  }
});
