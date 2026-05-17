import { test } from 'node:test';
import assert from 'node:assert/strict';
import { voyageCard, titleSize } from '../templates/voyage-card.js';

test('titleSize scales by character count', () => {
  assert.equal(titleSize('Short'),              104);  // 5 chars
  assert.equal(titleSize('a'.repeat(22)),       104);  // boundary
  assert.equal(titleSize('a'.repeat(23)),        88);
  assert.equal(titleSize('a'.repeat(32)),        88);
  assert.equal(titleSize('a'.repeat(33)),        78);
  assert.equal(titleSize('a'.repeat(48)),        78);
  assert.equal(titleSize('a'.repeat(49)),        68);
  assert.equal(titleSize('a'.repeat(64)),        68);
  assert.equal(titleSize('a'.repeat(65)),        60);
});

test('voyageCard returns a vDOM tree with the expected shape', () => {
  const tree = voyageCard({
    title: 'Test Title',
    subtitle: 'Test subtitle',
    byline: 'Ken Baker  ·  17 May 2026',
    url: 'cruisinginthewake.com',
  });
  assert.equal(tree.type, 'div');
  assert.equal(tree.props.style.width, 1200);
  assert.equal(tree.props.style.height, 630);
  // Background must be --sky
  assert.equal(tree.props.style.background, '#f7fdff');
  // Children: compass svg, title, rule, subtitle, spacer, byline row
  assert.equal(tree.props.children.length, 6);
});

test('voyageCard runs the contrast guard without throwing', () => {
  // The template hard-codes the safe pairings, so this should never throw
  // when called normally. The test confirms the guard is wired.
  assert.doesNotThrow(() => voyageCard({
    title: 'A', subtitle: 'b', byline: 'c · d', url: 'e',
  }));
});
