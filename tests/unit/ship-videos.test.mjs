// Ship video lists carry only videos YouTube itself says are of that ship. Soli Deo Gloria.
// Found 2026-09-26: three Norwegian Pearl vlogs were listed 470 times across ships under invented
// titles ("Prima Suite Tour"), and Ruby Princess listed an Adele music video.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { matches, clean, videoFiles, RECORD, categoryOf } from '../../admin/scripts/verify-ship-videos.mjs';

const ROOT = new URL('../../', import.meta.url);
process.chdir(ROOT.pathname);

test('the match rule: the ship must be named, and plain names need the brand', () => {
  assert.equal(matches('norwegian', 'Norwegian Prima', 'Florence via Train from Livorno | Norwegian Pearl Vlog'), false);
  assert.equal(matches('norwegian', 'Norwegian Prima', 'NCL Prima | Full Ship Walkthrough Tour & Review 4K'), true);
  assert.equal(matches('norwegian', 'Norwegian Prima', 'Norwegian Prima Studio Cabin Tour'), true);
  assert.equal(matches('oceania', 'Vista', 'Corner Suite Ocean View | Dreams Vista Cancun'), false);
  assert.equal(matches('oceania', 'Vista', 'Oceania Vista | Penthouse Suite Tour'), true);
  assert.equal(matches('carnival', 'Mardi Gras', 'Mardi Gras parade New Orleans 2024'), false);
  assert.equal(matches('carnival', 'Mardi Gras', 'The Carnival Mardi Gras | Full Ship Tour'), true);
  assert.equal(matches('holland-america-line', 'Zaandam', 'Zaandam Ship Tour (Deck-by-Deck)'), true);
  assert.equal(matches('holland-america-line', 'Rotterdam', 'A day in Rotterdam'), false);
  assert.equal(matches('princess', 'Ruby Princess', 'Adele - Hello (Official Music Video)'), false);
  assert.equal(matches('rcl', 'Symphony of the Seas', 'Symphony of the Seas | Ultimate Family Suite'), true);
});

test('clean() retitles from YouTube, dedupes, drops dead and off-ship videos, and invents nothing', () => {
  const lookups = {
    aaaaaaaaaaa: { status: 'ok', title: 'NCL Prima Deck 8 walk', author: 'Chan' },
    bbbbbbbbbbb: { status: 'ok', title: 'NCL Pearl in Porto', author: 'Chan' },
    ccccccccccc: { status: 'gone' },
  };
  const d = { ship: 'Norwegian Prima', videos: { suite: [
    { videoId: 'aaaaaaaaaaa', title: 'Norwegian Prima Suite Tour', description: 'made up' },
    { videoId: 'aaaaaaaaaaa', title: 'Norwegian Prima Balcony' },
    { videoId: 'bbbbbbbbbbb', title: 'Norwegian Prima Dining Guide' },
    { videoId: 'ccccccccccc', title: 'Norwegian Prima Review' },
  ] } };
  const r = clean('assets/data/videos/norwegian/norwegian-prima.json', d, lookups);
  assert.deepEqual(r.out.videos, { verified: [{ videoId: 'aaaaaaaaaaa', provider: 'youtube', title: 'NCL Prima Deck 8 walk', channel: 'Chan', verified: '2026-09-26' }] });
  assert.deepEqual(r.dropped, { dup: 1, dead: 1, nomatch: 1 });
});

test('every committed video entry is in the YouTube record, under YouTube\'s own title, and names its ship', () => {
  const lookups = JSON.parse(readFileSync(RECORD, 'utf8')).lookups;
  let n = 0;
  for (const f of videoFiles()) {
    const d = JSON.parse(readFileSync(f, 'utf8'));
    const items = Array.isArray(d.videos) ? d.videos : Object.values(d.videos || {}).flat();
    for (const v of items) {
      const r = lookups[v.videoId];
      assert.ok(r && r.status === 'ok', `${f}: ${v.videoId} has no ok YouTube lookup`);
      assert.equal(v.title, r.title, `${f}: ${v.videoId} title is not YouTube's`);
      n++;
    }
    assert.deepEqual(clean(f, d, lookups).out.videos, d.videos, `${f} would change under the rule; rerun verify-ship-videos.mjs`);
  }
  assert.ok(n > 3000, `only ${n} verified videos; the record or files look truncated`);
});

test('a category comes only from words in YouTube\'s own title, first rule wins, and nothing is guessed', () => {
  const cases = [
    ['NCL Prima | Full Ship Walkthrough Tour & Review 4K', 'ship walk through'],
    ['Norwegian Prima Ship Tour - NEW for 2026 + MUST-KNOW tips!', 'ship walk through'],
    ['Norwegian Prima | The HAVEN Full Walkthrough Tour & Review 4K', 'suite'],
    ['Norwegian Prima | Balcony Stateroom Walkthrough Tour & Review 4K', 'balcony'],
    ['NCL Prima Handicap Accessible Inside Cabin Tour', 'accessible'],
    ['Norwegian Prima Cabin 12212 (Wheelchair Accessible Balcony) Tour', 'accessible'],
    ['Top 10 Must-Do Experiences on Norwegian Prima', 'top ten'],
    ['10 Things You Must Do On NCL Prima!', 'top ten'],
    ['Norwegian Prima LARGE Oceanview Cabin Tour', 'oceanview'],
    ['Norwegian Prima | Inside Stateroom Walkthrough Tour & Review 4K', 'interior'],
    ['Everything We Ate At Indulge Food Hall on NCL Prima', 'food'],
    ['Full Ship Tour of Norwegian Prima: every restaurant and bar', 'ship walk through'],
    ['Norwegian Prima Studio Cabin Tour (Studio Lounge, Too!)', null],
    ['Norwegian Prima Full Review (2025): What we loved', null],
    ['NCL Prima Deck 8 walk', null],
    ['Norwegian Prima interior design details', null],
    ['Day 10 on Norwegian Prima', null],
  ];
  for (const [title, want] of cases) assert.equal(categoryOf(title), want, title);
});

test('clean() stamps the category from YouTube\'s title, never from the old list\'s heading', () => {
  const lookups = { aaaaaaaaaaa: { status: 'ok', title: 'Norwegian Prima Oceanview Cabin Tour', author: 'Chan' } };
  const d = { ship: 'Norwegian Prima', videos: { suite: [{ videoId: 'aaaaaaaaaaa', title: 'Norwegian Prima Suite Tour' }] } };
  const r = clean('assets/data/videos/norwegian/norwegian-prima.json', d, lookups);
  assert.equal(r.out.videos.verified[0].category, 'oceanview');
});
