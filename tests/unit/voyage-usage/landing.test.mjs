// voyage-packs.html cards: the free download link carries vp_pdf_open and the tip link carries
// vp_tip_click, both naming a registered pack slug whose landing flags agree with the page. Packs
// are free with a tip jar since 2026-09-05, so no card shows a price and the registry holds none.
// No HTML library: the CI unit job runs `node --test` with no install step, so this test parses
// the page with the same string discipline as the other suites. Soli Deo Gloria.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const ROOT = new URL('../../../', import.meta.url);

function attrs(tag) {
  const out = {};
  for (const m of tag.matchAll(/([a-zA-Z0-9:-]+)="([^"]*)"/g)) out[m[1]] = m[2];
  if (/\sdownload(\s|>)/.test(tag)) out.download = '';
  return out;
}

function cards(html) {
  return [...html.matchAll(/<article class="vp-product-card">([\s\S]*?)<\/article>/g)].map((m) => {
    const body = m[1];
    const title = (body.match(/<h3>([\s\S]*?)<\/h3>/) || [, '?'])[1].replace(/\s+/g, ' ').trim();
    const dl = [...body.matchAll(/<a ([^>]*class="vp-buy-button"[^>]*)>([\s\S]*?)<\/a>/g)]
      .map((x) => ({ ...attrs(x[1]), text: x[2].trim() }));
    const tip = [...body.matchAll(/<a ([^>]*data-umami-event="vp_tip_click"[^>]*)>/g)].map((x) => attrs(x[1]));
    return { title, body, dl, tip };
  });
}

async function load() {
  const html = await readFile(new URL('voyage-packs.html', ROOT), 'utf8');
  const packs = JSON.parse(await readFile(new URL('admin/voyage-packs/packs.json', ROOT), 'utf8'));
  return { html, packs, bySlug: new Map(packs.map((p) => [p.slug, p])), cards: cards(html) };
}

test('every download link declares vp_pdf_open (variant full) for a registered pack that is flagged landing', async () => {
  const { cards, bySlug } = await load();
  const links = cards.flatMap((c) => c.dl);
  assert.ok(links.length >= 8, `expected at least 8 download links, found ${links.length}`);
  for (const a of links) {
    assert.equal(a['data-umami-event'], 'vp_pdf_open', a.text);
    assert.equal(a['data-umami-event-variant'], 'full', a.text);
    assert.equal(a.download, '', `${a.text} is not a download link`);
    const slug = a['data-umami-event-pack'];
    const pack = bySlug.get(slug);
    assert.ok(pack, `download link "${a.text}" names unregistered pack ${slug}`);
    assert.ok(a.href.endsWith(`/${slug}.pdf`), `${slug} href does not point at that pack's PDF`);
    assert.equal(pack.landing, true, `${slug} is on the landing page but registry says landing:false`);
    assert.equal(pack.instrumented.landing, true, `${slug} landing flag not flipped`);
    assert.equal(pack.price_usd, null, `${slug} still carries a price in the registry`);
    assert.match(a.text, /free/i, `${slug} download link does not say it is free`);
  }
});

test('every card tip link declares vp_tip_click for the same pack as its download link', async () => {
  const { cards } = await load();
  assert.ok(cards.length >= 8, `expected at least 8 cards, found ${cards.length}`);
  for (const c of cards) {
    assert.equal(c.dl.length, 1, `${c.title} download link count`);
    assert.equal(c.tip.length, 1, `${c.title} tip link count`);
    assert.equal(c.tip[0]['data-umami-event-pack'], c.dl[0]['data-umami-event-pack'], `${c.title} tip and download name different packs`);
    assert.equal(c.tip[0].href, 'https://buymeacoffee.com/inthewake');
    assert.equal(c.tip[0]['data-umami-event-price'], undefined, 'no price property under the tip model');
  }
});

test('no landing pack in the registry is missing from the page, and nothing on the page still says Buy', async () => {
  const { html, packs, cards } = await load();
  const onPage = new Set(cards.flatMap((c) => c.dl.map((a) => a['data-umami-event-pack'])));
  for (const p of packs.filter((p) => p.landing)) assert.ok(onPage.has(p.slug), `${p.slug} is flagged landing but has no card`);
  assert.equal((html.match(/data-umami-event="vp_buy_click"/g) || []).length, 0, 'vp_buy_click is retired');
  const available = html.slice(html.indexOf('id="available-now"'));
  assert.doesNotMatch(available, /Buy this pack/, 'a Buy button survived the free-with-tip change');
});

test('the Umami site script is present on the landing page (the attributes are inert without it)', async () => {
  const { html } = await load();
  assert.ok(html.includes('cloud.umami.is/script.js'));
  assert.ok(html.includes('9661a449-3ba9-49ea-88e8-4493363578d2'));
});
