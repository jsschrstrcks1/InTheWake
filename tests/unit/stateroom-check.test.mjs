// Stateroom Sanity Check: every verdict says only what the ship's data supports.
// Runs the real engine (assets/js/stateroom-check.js) against the real data files.
// Soli Deo Gloria.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const ROOT = new URL('../../', import.meta.url);
const read = (p) => readFile(new URL(p, ROOT), 'utf8');

const engineSrc = await read('assets/js/stateroom-check.js');
const page = await read('stateroom-check.html');

// A minimal window: fetch serves the repo's own data files; nothing touches the network.
const sandbox = {
  console,
  fetch: async (url) => {
    try {
      const body = await read(String(url).replace(/^\//, ''));
      return { ok: true, status: 200, json: async () => JSON.parse(body) };
    } catch {
      return { ok: false, status: 404, json: async () => null };
    }
  },
  document: { createElement: () => ({ set textContent(v) { this._t = v; }, get innerHTML() { return this._t; } }) },
};
sandbox.window = sandbox;
vm.runInNewContext(engineSrc, sandbox);
const SC = sandbox.StateroomCheck;

async function data(slug) {
  const d = JSON.parse(await read(`assets/data/staterooms/stateroom-exceptions.${slug}.v2.json`));
  return d[slug] && typeof d[slug] === 'object' ? { ...d, ...d[slug] } : d;
}

const offered = (() => {
  const block = page.slice(page.indexOf('const SHIP_CLASSES = {'), page.indexOf('const LINES = {'));
  return [...block.matchAll(/value: '([a-z0-9-]+)'/g)].map((m) => m[1]);
})();

test('the picker offers exactly the ships whose data is complete or checked, and no placeholder', async () => {
  assert.ok(offered.length === 49, `expected 29 RCL + 20 Norwegian ships, found ${offered.length}`);
  for (const slug of offered) {
    const tier = SC.dataTier(await data(slug));
    assert.ok(tier === 'complete' || tier === 'partial', `${slug} is offered but its data tier is ${tier}`);
  }
  for (const slug of ['msc-world-america', 'resilient-lady', 'carnival-jubilee', 'celebrity-beyond', 'volendam']) {
    assert.ok(!offered.includes(slug), `${slug} has only a placeholder file and must not be offered`);
    assert.equal(SC.dataTier(await data(slug)), 'none');
  }
});

test('a complete ship: a listed clean cabin is a wonderful choice, with its real type', async () => {
  const d = await data('radiance-of-the-seas');
  const cabin = d.category_overrides.Balcony[0];
  const r = await SC.check('radiance-of-the-seas', String(cabin), 'couple');
  assert.equal(r.verdict.verdict, 'great');
  assert.equal(r.verdict.category, 'Balcony');
  assert.ok(!/most travelers find it comfortable/i.test(r.verdict.summary), 'no claim the data does not hold');
});

test('a complete ship: a cabin not on the verified list is never called a wonderful choice', async () => {
  const r = await SC.check('radiance-of-the-seas', '99999', 'couple');
  assert.equal(r.verdict.verdict, 'note');
  assert.match(r.verdict.title, /Not on Our List/);
  assert.equal(r.verdict.category, null);
});

test('a partial ship: nothing flagged is stated as good news, not a guarantee, and no type is guessed', async () => {
  const r = await SC.check('norwegian-prima', '10000', 'solo');
  assert.equal(r.verdict.verdict, 'note');
  assert.match(r.verdict.title, /Nothing Flagged/);
  assert.match(r.verdict.summary, /not a guarantee/);
  assert.equal(r.verdict.category, null);
  assert.equal(r.shipName, 'Norwegian Prima');
});

test('a Norwegian finding is shown in its own words at its own severity', async () => {
  const r = await SC.check('norwegian-gem', '8100', 'couple');
  assert.equal(r.verdict.verdict, 'caution', 'a 100% obstructed view is graded critical in the data');
  assert.equal(r.verdict.issues[0].heading, 'Fully Obstructed View');
  assert.match(r.verdict.issues[0].description, /lifeboats/);
});

test('an "all interior cabins" entry reaches every interior cabin on that ship and no other', async () => {
  const d = await data('norwegian-epic');
  const interior = d.category_overrides.Interior[0];
  const balcony = d.category_overrides.Balcony[0];
  const hit = await SC.check('norwegian-epic', String(interior), 'couple');
  assert.ok(hit.verdict.issues.some((i) => i.heading === 'Unusual Bathroom Layout'), 'interior cabin should carry the note');
  const miss = await SC.check('norwegian-epic', String(balcony), 'couple');
  assert.ok(!miss.verdict.issues.some((i) => i.heading === 'Unusual Bathroom Layout'), 'balcony cabin must not');
});

test('a Royal Caribbean finding still reads exactly as before', async () => {
  const d = await data('allure-of-the-seas');
  const ex = d.exceptions.find((e) => e.flag === 'NOISE_POOL_ABOVE');
  const cabin = String(SC.parseRoomRange(ex.rooms)[0]);
  const r = await SC.check('allure-of-the-seas', cabin, 'couple');
  const issue = r.verdict.issues.find((i) => i.heading === 'Pool Deck Noise Above');
  assert.ok(issue, 'pool-noise finding lost');
  assert.equal(issue.type, 'minor');
});

test('a ship with only a placeholder file gets an honest refusal, not a verdict', async () => {
  const r = await SC.check('msc-world-america', '10000', 'couple');
  assert.equal(r.error, true);
  assert.match(r.message, /don't have cabin data for this ship yet/);
});

test('no self-written star rating, and no page claim of lines the tool cannot serve', () => {
  assert.ok(!engineSrc.includes('ratingValue'), 'the Accommodation schema must not carry a rating we wrote ourselves');
  assert.ok(!/Carnival, Norwegian, MSC, Virgin Voyages, and others are supported/.test(page), 'HowTo still overclaims');
  assert.ok(!page.includes('cruise-line" required disabled'), 'line picker still locked');
});
