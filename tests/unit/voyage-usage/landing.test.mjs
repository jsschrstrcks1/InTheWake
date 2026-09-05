// voyage-packs.html buy buttons carry vp_buy_click attributes whose pack slugs exist in the registry,
// and the registry's landing flags agree with the page. Soli Deo Gloria.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const cheerio = require('cheerio');
const ROOT = new URL('../../../', import.meta.url);

test('every Buy button declares vp_buy_click with a registered pack slug and its price', async () => {
  const $ = cheerio.load(await readFile(new URL('voyage-packs.html', ROOT), 'utf8'));
  const packs = JSON.parse(await readFile(new URL('admin/voyage-packs/packs.json', ROOT), 'utf8'));
  const bySlug = new Map(packs.map((p) => [p.slug, p]));
  const buttons = $('a.vp-buy-button');
  assert.ok(buttons.length >= 4, `expected at least 4 buy buttons, found ${buttons.length}`);
  buttons.each((_, el) => {
    const a = $(el);
    assert.equal(a.attr('data-umami-event'), 'vp_buy_click', a.text());
    const slug = a.attr('data-umami-event-pack');
    const pack = bySlug.get(slug);
    assert.ok(pack, `buy button "${a.text()}" names unregistered pack ${slug}`);
    assert.equal(pack.landing, true, `${slug} is on the landing page but registry says landing:false`);
    assert.equal(pack.instrumented.landing, true, `${slug} landing flag not flipped`);
    assert.equal(String(pack.price_usd), a.attr('data-umami-event-price'), `${slug} price attribute disagrees with registry`);
    assert.match(a.text(), new RegExp('\\$' + pack.price_usd + '\\b'), `${slug} visible price disagrees with registry`);
  });
});

test('the Umami site script is present on the landing page (the attributes are inert without it)', async () => {
  const html = await readFile(new URL('voyage-packs.html', ROOT), 'utf8');
  assert.ok(html.includes('cloud.umami.is/script.js'));
  assert.ok(html.includes('9661a449-3ba9-49ea-88e8-4493363578d2'));
});
