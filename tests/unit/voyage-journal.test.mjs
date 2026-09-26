// The voyage companion Journal: private, on this phone, and honest about what that means. Soli Deo Gloria.
// Plan: admin/claude/plans/voyage-journal.md (operator decisions 2026-09-26). Browser behavior (save,
// reload, keepsake, load, whose-entry) was checked in Chromium when this was built; these pin the promises.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const js = readFileSync(new URL('../../admin/voyage-pwa/companion.js', import.meta.url), 'utf8');
const journal = js.slice(js.indexOf('// ---- Journal:'), js.indexOf('initFs();buildSel();'));

test('Journal is a tab, and Alerts stays last', () => {
  const nav = js.slice(js.indexOf('aria-label="Voyage views"'), js.indexOf("+'</nav>'"));
  const tabs = [...nav.matchAll(/data-t="([a-z]+)"/g)].map((m) => m[1]);
  assert.ok(tabs.includes('journal'));
  assert.equal(tabs[tabs.length - 1], 'alerts');
});

test('the privacy promise and its cost are said in the words the traveler sees', () => {
  assert.match(journal, /It lives only on this phone\. We never see it, and it is never sent anywhere\./);
  assert.match(journal, /if you delete this app, your journal is deleted with it\. If you lose this phone, your journal is gone too\./);
  assert.match(journal, /On iPhone: the app on your home screen keeps its own storage, separate from Safari\./);
  assert.match(journal, /Cloud backup: coming soon\. Your journal is not backed up anywhere yet\./);
});

test('nothing is sent anywhere: no network calls in the Journal code', () => {
  assert.doesNotMatch(journal, /\bfetch\(|XMLHttpRequest|sendBeacon|WebSocket/);
  assert.match(journal, /indexedDB\.open\("itw-journal",1\)/);
});

test('typed text never reaches the page as HTML, and the keepsake escapes quotes too', () => {
  assert.doesNotMatch(journal, /innerHTML|insertAdjacentHTML|outerHTML/);
  assert.match(journal, /ta\.value=/);
  assert.match(journal, /replace\(\/\[&<>"'\]\/g/, 'jEsc must escape & < > " and \'');
});

// Loading a journal data copy is the one untrusted input: the file can come from anywhere. Rendering is
// already textContent / textarea.value and the keepsake escapes via jEsc, so imported text cannot execute;
// these pin the defence-in-depth added 2026-09-26 so a hostile file cannot smuggle invisible content,
// exhaust storage, or balloon the names list.
test('imported journal data is sanitized on the way in', () => {
  assert.match(journal, /person=jClean\(String\(e\.person\|\|""\)\)\.slice\(0,40\)/, 'imported person runs through jClean');
  assert.match(journal, /text=jClean\(String\(e\.text\|\|""\)\)\.slice\(0,20000\)/, 'imported text runs through jClean');
  assert.match(journal, /f\.size>5\*1024\*1024/, 'an over-large file is refused before parsing');
  assert.match(journal, /MAXE=2000,rows=d\.entries\.slice\(0,MAXE\)/, 'entry count is capped');
  assert.match(journal, /if\(!e\|\|typeof e!=="object"\)return;/, 'non-object rows are skipped');
  assert.match(journal, /ns\.indexOf\(person\)<0&&ns\.length<50/, 'names growth is bounded');
});

test('jClean strips control, zero-width and bidi characters but keeps visible text, tabs and newlines', () => {
  const m = js.match(/function jClean\(s\)\{[\s\S]*?return String\(s==null\?"":s\)\.replace\(re,""\);\}/);
  assert.ok(m, 'jClean is present');
  const jClean = eval('(' + m[0].replace('function jClean', 'function') + ')'); // eslint-disable-line no-eval
  assert.equal(jClean('a\u0000b​c‮d'), 'abcd', 'strips NUL, zero-width space, bidi override');
  assert.equal(jClean('﻿ship 🚢'), 'ship 🚢', 'strips BOM, keeps emoji');
  assert.equal(jClean('keep\ttab\nline\rreturn'), 'keep\ttab\nline\rreturn', 'keeps tab, newline and carriage return');
  assert.equal(jClean('line sep'), 'linesep', 'strips the U+2028 line separator');
});
