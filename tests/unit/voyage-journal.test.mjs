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
