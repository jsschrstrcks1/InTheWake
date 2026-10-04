// Emergency numbers in the voyage companions and packs. Soli Deo Gloria.
// Two promises, each pinned because each was broken once:
//  1. A companion with an Emergency tab carries the free 24/7 State Department line (first, on the
//     World America family tab; Volendam deliberately leads with Holland America's own lines).
//  2. +504 2236-9320 never returns. v0.1-v0.1.2-FACT-CHECK.md rejected it, it was copied back into
//     the World America packs and cards labeled "after-hours emergency", and was corrected again on
//     2026-10-04 to the U.S. Embassy Tegucigalpa number the operator read off hn.usembassy.gov.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const ROOT = new URL('../../', import.meta.url);
const pwaDir = new URL('admin/voyage-pwa/', ROOT);
const packDir = new URL('admin/voyage-packs/', ROOT);

function voyageOf(html) {
  const m = html.match(/window\.__VOYAGE\s*=\s*(\{[\s\S]*?\});/);
  if (!m) return null;
  // eslint-disable-next-line no-new-func
  return Function('return (' + m[1] + ')')();
}

const companions = readdirSync(pwaDir).filter((f) => f.endsWith('.html'));

test('every companion with an Emergency tab carries the State Department line', () => {
  let withTab = 0;
  for (const f of companions) {
    const V = voyageOf(readFileSync(new URL(f, pwaDir), 'utf8'));
    if (!V || !V.emergency) continue;
    withTab++;
    const sd = V.emergency.numbers.find((n) => /State Department/.test(n.label));
    assert.ok(sd, `${f}: State Department line present`);
    assert.equal(sd.tel, '+1 (888) 407-4747', `${f}: State Department US/Canada line`);
    assert.ok(V.emergency.storageKey, `${f}: storage key present (the card saves offline)`);
    // A generic pack (Icon) carries the tab without a printed card; where a card is linked, it is a PDF.
    if (V.emergency.cardPdf) assert.match(V.emergency.cardPdf, /\.pdf$/, `${f}: card link is a PDF`);
  }
  assert.ok(withTab >= 2, 'at least Prima and the World America family companion carry the tab');
});

test('the World America family companion has its Emergency tab with the corrected Honduras line', () => {
  const V = voyageOf(readFileSync(new URL('world-america-family-dec-2026.html', pwaDir), 'utf8'));
  assert.ok(V.emergency, 'emergency data present');
  assert.match(V.emergency.numbers[0].label, /State Department/, 'State Department line first');
  const hn = V.emergency.numbers.find((n) => /Tegucigalpa/.test(n.label));
  assert.ok(hn, 'Honduras line present (Roatán call)');
  assert.equal(hn.tel, '+504 2217-5000');
  assert.match(hn.label, /Embassy/, 'an Embassy, not a Consulate');
  assert.doesNotMatch(hn.note, /24\/7|after-hours/i, 'no unverified round-the-clock claim');
});

test('the rejected Honduras number +504 2236-9320 appears in no companion, guide or pack', () => {
  const files = [
    ...companions.map((f) => new URL(f, pwaDir)),
    ...readdirSync(new URL('guides/', pwaDir)).filter((f) => f.endsWith('.html')).map((f) => new URL('guides/' + f, pwaDir)),
    // The historical fact-check log keeps the old number on purpose, as the record of the error.
    ...readdirSync(packDir).filter((f) => f.endsWith('.md') && !/FACT-CHECK/.test(f)).map((f) => new URL(f, packDir)),
  ];
  for (const u of files) {
    assert.doesNotMatch(readFileSync(u, 'utf8'), /2236-9320/, `${u.pathname.split('/').slice(-2).join('/')}`);
  }
});
