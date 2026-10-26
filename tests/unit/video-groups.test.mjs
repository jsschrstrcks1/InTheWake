// Ship-tab videos are grouped into collapsible sections by what each title shows (operator 2026-09-26).
// The grouping is presentation only; titles are YouTube's own (verified), so it stays honest, and a
// title nothing places lands in "More videos". Soli Deo Gloria.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const js = readFileSync(new URL('../../admin/voyage-pwa/companion.js', import.meta.url), 'utf8');

// Pull the pure categorizer out of the source and exercise it directly.
const vcats = js.match(/var VCATS=\[[\s\S]*?\];/);
const vcat = js.match(/function videoCat\(t\)\{[^}]*\}/);
assert.ok(vcats && vcat, 'VCATS and videoCat must be present');
// eslint-disable-next-line no-eval
const videoCat = eval('(function(){' + vcats[0] + vcat[0] + 'return videoCat;})()');

test('titles land in the bucket their words name; whole-ship tours win over a stray cabin word', () => {
  assert.equal(videoCat('NCL Prima | Full Ship Walkthrough Tour & Review 4K'), 'ship');
  assert.equal(videoCat('Norwegian Prima Full Ship Tour including the Haven suites'), 'ship', 'ship wins first');
  assert.equal(videoCat('Norwegian Prima Studio Cabin Tour (Studio Lounge, Too!)'), 'cabin');
  assert.equal(videoCat('Norwegian Prima LARGE Oceanview Cabin Tour'), 'cabin');
  assert.equal(videoCat('Everything We Ate At Indulge Food Hall on NCL Prima'), 'food');
  assert.equal(videoCat('Accessible Stateroom Tour - Wheelchair Cabin'), 'access', 'accessibility before cabin');
  assert.equal(videoCat('10 Things You Must Do On NCL Prima'), 'tips');
  assert.equal(videoCat('Top 10 Must-Do Experiences on Norwegian Prima'), 'tips');
  assert.equal(videoCat('A quiet sunrise sailaway montage'), 'more', 'unplaced titles fall to More');
});

test('videoSection renders collapsible groups, ship tours first and open, built with DOM calls', () => {
  const fn = js.slice(js.indexOf('function videoSection('), js.indexOf('\n// Live search over the whole pack'));
  assert.match(fn, /createElement\("details"\)/, 'each group is a <details>');
  assert.match(fn, /d\.className="voy-row pk-vgroup"/);
  assert.match(fn, /if\(firstOpen\)\{d\.open=true;firstOpen=false;\}/, 'only the first non-empty group opens');
  assert.match(fn, /\["ship","Ship tours"\],\["cabin","Cabin & room tours"\]/, 'ship tours come first');
  assert.doesNotMatch(fn, /innerHTML|insertAdjacentHTML/, 'no HTML-string building');
});
