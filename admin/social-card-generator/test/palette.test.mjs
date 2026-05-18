import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PALETTE, assertTextColorPair } from '../lib/palette.js';

test('palette exports the site tokens by name', () => {
  assert.equal(PALETTE.sky, '#f7fdff');
  assert.equal(PALETTE.sea, '#0a3d62');
  assert.equal(PALETTE.rope, '#d9b382');
  assert.equal(PALETTE.ink, '#083041');
  assert.equal(PALETTE.inkMid, '#3d5a6a');
  assert.equal(PALETTE.textMuted, '#2a4a5a');
  assert.equal(PALETTE.accent, '#0e6e8e');
});

test('assertTextColorPair accepts WCAG AA pairings on pale background', () => {
  assert.doesNotThrow(() => assertTextColorPair(PALETTE.sea, PALETTE.sky));
  assert.doesNotThrow(() => assertTextColorPair(PALETTE.ink, PALETTE.sky));
  assert.doesNotThrow(() => assertTextColorPair(PALETTE.inkMid, PALETTE.sky));
  assert.doesNotThrow(() => assertTextColorPair(PALETTE.textMuted, PALETTE.sky));
});

test('assertTextColorPair rejects rope-on-pale (fails AA)', () => {
  assert.throws(
    () => assertTextColorPair(PALETTE.rope, PALETTE.sky),
    /rope.*text.*pale|contrast.*1\.\d/i
  );
});

test('assertTextColorPair accepts rope-on-sea (passes AA)', () => {
  assert.doesNotThrow(() => assertTextColorPair(PALETTE.rope, PALETTE.sea));
});
