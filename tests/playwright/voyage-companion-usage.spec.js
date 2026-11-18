// A PWA companion emits vp_pwa_open at boot and one vp_pwa_session when the sitting ends, through the
// relay endpoint, with only whitelisted properties. The footer promise is on the page. Soli Deo Gloria.
//
// WHAT THE PHONE SENDS. Since 3f6bf6bb (2026-10-05) a companion posts only {name, data} to the relay. The relay
// (admin/voyage-usage-relay/worker.js) builds Umami's envelope itself, with the website, hostname and a url made
// from the pack slug, so nothing about the page or the device leaves the phone. This spec still read the old
// envelope (s.payload.name) and found no events at all; CI never ran it, so it stayed red from that day until
// 2026-11-08. tests/unit/voyage-usage/contract.test.mjs runs the tracker's real output through the relay's
// real handler.
const { test, expect } = require('@playwright/test');

const PAGE = '/admin/voyage-pwa/prima-caribbean.html';
const SLUG = 'v0.1.9-ncl-prima-solo-group-sep-2026';
const RELAY = 'https://usage.cruisinginthewake.com/send';

test('companion: open event, session summary, whitelisted keys only, promise intact', async ({ page }) => {
  const sent = [];
  await page.route('https://usage.cruisinginthewake.com/**', (route) => {
    sent.push(JSON.parse(route.request().postData() || '{}'));
    return route.fulfill({ status: 204, body: '' });
  });
  // No live weather in tests; the companion tolerates a dead API.
  await page.route(/api\.open-meteo\.com|api\.rainviewer\.com|api\.weather\.gov|cdnjs\.cloudflare\.com/, (route) => route.abort());

  await page.goto(PAGE);
  await expect(page.locator('.wfoot .disc')).toContainText('No tracking, no ads, not a financial product.');
  await page.waitForTimeout(300);

  const opens = sent.filter((s) => s.name === 'vp_pwa_open');
  expect(opens).toHaveLength(1);
  const d = opens[0].data;
  expect(d.pack).toBe(SLUG);
  expect(['before', 'during', 'after']).toContain(d.phase);
  expect(Object.keys(d).sort()).toEqual(['day', 'offline', 'pack', 'phase', 'standalone']);
  expect(JSON.stringify(sent)).not.toContain(RELAY.replace('/send', '') + '/api');

  // Use a few tabs, then end the sitting: exactly one session summary with those tabs, sorted. Since c80cb9d9
  // (2026-09-26) the weather views are sub-tabs, shown only once Weather is chosen, and Weather opens on Now. So
  // a traveler who reaches Averages has also been on Now, and the summary says so.
  await page.locator('.wtab[data-t="voyage"]').click();
  await page.locator('.wtab[data-t="weather"]').click();
  await page.locator('.wsub[data-t="averages"]').click();
  await page.locator('.wtab[data-t="voyage"]').click();
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.waitForTimeout(300);
  const sessions = sent.filter((s) => s.name === 'vp_pwa_session');
  expect(sessions).toHaveLength(1);
  expect(sessions[0].data.tabs).toBe('averages,now,voyage');
  expect(Object.keys(sessions[0].data).sort()).toEqual(['day', 'pack', 'phase', 'tabs']);

  // Nothing from localStorage preferences leaks: set a location + unit, end another sitting, inspect.
  await page.evaluate(() => { localStorage.setItem('itw:sel', 'Secret Harbor'); localStorage.setItem('itw:unit', 'celsius'); });
  await page.locator('.wtab[data-t="weather"]').click();
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  await page.waitForTimeout(300);
  expect(JSON.stringify(sent)).not.toContain('Secret Harbor');
  expect(JSON.stringify(sent)).not.toContain('celsius');
  // Each body is the event name and its whitelisted data, and nothing else: no page, title, screen or language.
  expect(sent.map((s) => Object.keys(s).sort().join(','))).toEqual(sent.map(() => 'data,name'));
});
