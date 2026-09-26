// The voyage companion Alerts tab: data rules and placement. Soli Deo Gloria.
// Built 2026-09-26 (pre-ship checklist class N). The colour rules are operator-approved; the
// State Department traps below are real errors found in its feed that day.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  usLevel, usColour, ukColour, caColour, parseCdc, cdcFor, cdcColour, usFind, voyagesFromCompanions, UK_SLUG, US_NAME,
} from '../../admin/scripts/build-voyage-alerts.mjs';

const ROOT = new URL('../../', import.meta.url).pathname;

test('US levels: 3 and 4 are red, 2 is yellow, 1 is nothing', () => {
  assert.equal(usLevel('Honduras - Level 3: Reconsider Travel'), 3);
  assert.equal(usColour(4), 'red'); assert.equal(usColour(3), 'red');
  assert.equal(usColour(2), 'yellow'); assert.equal(usColour(1), 'none'); assert.equal(usColour(null), 'none');
});

test('UK: whole-country advice is red, advice about parts is yellow', () => {
  assert.equal(ukColour(['avoid_all_but_essential_travel_to_whole_country']), 'red');
  assert.equal(ukColour(['avoid_all_travel_to_whole_country']), 'red');
  assert.equal(ukColour(['avoid_all_but_essential_travel_to_parts']), 'yellow');
  assert.equal(ukColour([]), 'none');
});

test('Canada: states 2 and 3 are red; state 1 or a regional advisory is yellow', () => {
  assert.equal(caColour(3, false), 'red'); assert.equal(caColour(2, false), 'red');
  assert.equal(caColour(1, false), 'yellow'); assert.equal(caColour(0, true), 'yellow'); assert.equal(caColour(0, false), 'none');
});

test('the State Department feed errors of 2026-09-26 are not believed', () => {
  const feed = [
    { Category: ['AR'], Title: 'United Arab Emirates - Level 3: Reconsider Travel' },
    { Category: ['AR'], Title: 'Argentina - Level 1: Exercise Normal Precautions' },
    { Category: ['BR'], Title: 'Brunei - Level 1: Exercise Normal Precautions' },
    { Category: ['BF'], Title: 'The Bahamas - Level 2: Exercise Increased Caution' },
  ];
  assert.equal(usFind(feed, 'AR').Title.startsWith('Argentina'), true, 'UAE filed under AR must not be read as Argentina');
  assert.equal(usFind(feed, 'BR'), null, 'Brunei (BR) must not be read as Brazil');
  assert.equal(usFind(feed, 'BS').Title.startsWith('The Bahamas'), true);
});

test('CDC links parse, including a second outbreak in the same month and a brand-less ship name', () => {
  const html = '<a href="/vessel-sanitation/cruise-ship-outbreaks/caribbean-princess-may-2026.html">x</a>'
    + '<a href="/vessel-sanitation/cruise-ship-outbreaks/national-geographic-sea-bird-july-2026-2.html">y</a>'
    + '<a href="/vessel-sanitation/cruise-ship-outbreaks/insignia-april-2026.html">z</a>'
    + '<a href="/vessel-sanitation/cruise-ship-outbreaks/earlier-outbreaks-2023.html">old</a>';
  const posts = parseCdc(html);
  assert.equal(posts.length, 3);
  assert.deepEqual(posts[1], { ship: 'national-geographic-sea-bird', month: 7, year: 2026, url: 'https://www.cdc.gov/vessel-sanitation/cruise-ship-outbreaks/national-geographic-sea-bird-july-2026-2.html' });
  assert.equal(cdcFor('Oceania Insignia', posts).length, 1);
  assert.equal(cdcFor('Norwegian Prima', posts).length, 0);
  assert.equal(cdcFor('Ruby Princess', posts).length, 0, 'Caribbean Princess must not match Ruby Princess');
});

test('CDC colour: this month or last is red, older is yellow', () => {
  const now = new Date(Date.UTC(2026, 8, 26));
  assert.equal(cdcColour([{ month: 9, year: 2026 }], now), 'red');
  assert.equal(cdcColour([{ month: 8, year: 2026 }], now), 'red');
  assert.equal(cdcColour([{ month: 7, year: 2026 }], now), 'yellow');
  assert.equal(cdcColour([], now), 'none');
});

test('every companion port is placed in a country, and Prima calls at BS, JM, KY and MX', () => {
  const { voyages, unmapped } = voyagesFromCompanions();
  assert.deepEqual(unmapped, []);
  assert.equal(voyages.length >= 15, true);
  assert.deepEqual(voyages.find((v) => v.slug === 'v0.1.9-ncl-prima-solo-group-sep-2026').countries, ['BS', 'JM', 'KY', 'MX']);
  for (const v of voyages) for (const iso of v.countries) assert.ok(UK_SLUG[iso], `${iso} has no UK slug`);
  for (const iso of Object.keys(US_NAME)) assert.ok(UK_SLUG[iso], `${iso} in US_NAME but not UK_SLUG`);
});

test('the companion puts Alerts last as a top-level tab, and never calls a failed check "no alerts"', () => {
  const js = readFileSync(ROOT + 'admin/voyage-pwa/companion.js', 'utf8');
  const nav = js.slice(js.indexOf('role="tablist" aria-label="Voyage views"'), js.indexOf("+'</nav>'"));
  const tabs = [...nav.matchAll(/data-t="([a-z]+)"/g)].map((m) => m[1]);
  assert.equal(tabs[tabs.length - 1], 'alerts');
  assert.doesNotMatch(js, /class="wtab wsub" data-t="alerts"/, 'Alerts must not also be a weather sub-tab');
  assert.match(js, /if\(fs===null\)\{[^}]*Couldn\\'t check weather warnings/);
  assert.match(js, /r\.status===400\)return\{outside:true\}/, 'NWS 400 (outside coverage) is "not covered", not a failure');
  const sw = readFileSync(ROOT + 'admin/voyage-pwa/sw.js', 'utf8');
  assert.match(sw, /url\.pathname === "\/admin\/voyage-pwa\/alerts\.json"/, 'alerts.json must be network-first');
});
