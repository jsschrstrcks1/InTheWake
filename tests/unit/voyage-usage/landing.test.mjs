// voyage-packs.html cards: the free download link carries vp_pdf_open and the tip link carries
// vp_tip_click, both naming a registered pack slug whose landing flags agree with the page. Packs
// are free with a tip jar since 2026-09-05, so no card shows a price and the registry holds none.
// Soli Deo Gloria.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const cheerio = require('cheerio');
const ROOT = new URL('../../../', import.meta.url);

async function load() {
  const $ = cheerio.load(await readFile(new URL('voyage-packs.html', ROOT), 'utf8'));
  const packs = JSON.parse(await readFile(new URL('admin/voyage-packs/packs.json', ROOT), 'utf8'));
  return { $, packs, bySlug: new Map(packs.map((p) => [p.slug, p])) };
}

test('every download link declares vp_pdf_open (variant full) for a registered pack that is flagged landing', async () => {
  const { $, bySlug } = await load();
  const links = $('a.vp-buy-button');
  assert.ok(links.length >= 8, `expected at least 8 download links, found ${links.length}`);
  links.each((_, el) => {
    const a = $(el);
    assert.equal(a.attr('data-umami-event'), 'vp_pdf_open', a.text());
    assert.equal(a.attr('data-umami-event-variant'), 'full', a.text());
    assert.ok(a.attr('download') !== undefined, `${a.text()} is not a download link`);
    const slug = a.attr('data-umami-event-pack');
    const pack = bySlug.get(slug);
    assert.ok(pack, `download link "${a.text()}" names unregistered pack ${slug}`);
    assert.ok(a.attr('href').endsWith(`/${slug}.pdf`), `${slug} href does not point at that pack's PDF`);
    assert.equal(pack.landing, true, `${slug} is on the landing page but registry says landing:false`);
    assert.equal(pack.instrumented.landing, true, `${slug} landing flag not flipped`);
    assert.equal(pack.price_usd, null, `${slug} still carries a price in the registry`);
    assert.match(a.text(), /free/i, `${slug} download link does not say it is free`);
  });
});

test('every card tip link declares vp_tip_click for the same pack as its download link', async () => {
  const { $ } = await load();
  const cards = $('article.vp-product-card');
  assert.ok(cards.length >= 8, `expected at least 8 cards, found ${cards.length}`);
  cards.each((_, el) => {
    const card = $(el);
    const dl = card.find('a.vp-buy-button');
    const tip = card.find('a[data-umami-event="vp_tip_click"]');
    assert.equal(dl.length, 1, `${card.find('h3').text()} download link count`);
    assert.equal(tip.length, 1, `${card.find('h3').text()} tip link count`);
    assert.equal(tip.attr('data-umami-event-pack'), dl.attr('data-umami-event-pack'), `${card.find('h3').text()} tip and download name different packs`);
    assert.equal(tip.attr('href'), 'https://buymeacoffee.com/inthewake');
    assert.equal(tip.attr('data-umami-event-price'), undefined, 'no price property under the tip model');
  });
});

test('no landing pack in the registry is missing from the page, and nothing on the page still says Buy', async () => {
  const { $, packs } = await load();
  const onPage = new Set($('a.vp-buy-button').map((_, el) => $(el).attr('data-umami-event-pack')).get());
  for (const p of packs.filter((p) => p.landing)) assert.ok(onPage.has(p.slug), `${p.slug} is flagged landing but has no card`);
  assert.equal($('[data-umami-event="vp_buy_click"]').length, 0, 'vp_buy_click is retired');
  assert.doesNotMatch($('#available-now').text(), /Buy this pack/, 'a Buy button survived the free-with-tip change');
});

test('the Umami site script is present on the landing page (the attributes are inert without it)', async () => {
  const html = await readFile(new URL('voyage-packs.html', ROOT), 'utf8');
  assert.ok(html.includes('cloud.umami.is/script.js'));
  assert.ok(html.includes('9661a449-3ba9-49ea-88e8-4493363578d2'));
});
