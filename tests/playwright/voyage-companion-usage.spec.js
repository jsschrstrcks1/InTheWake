// A PWA companion emits vp_pwa_open at boot and one vp_pwa_session when the sitting ends, through the
// relay endpoint, with only whitelisted properties. The footer promise is on the page. Soli Deo Gloria.
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

  const opens = sent.filter((s) => s.payload && s.payload.name === 'vp_pwa_open');
  expect(opens).toHaveLength(1);
  const d = opens[0].payload.data;
  expect(d.pack).toBe(SLUG);
  expect(['before', 'during', 'after']).toContain(d.phase);
  expect(Object.keys(d).sort()).toEqual(['day', 'offline', 'pack', 'phase', 'standalone']);
  expect(opens[0].payload.url).toBe(PAGE);
  expect(JSON.stringify(sent)).not.toContain(RELAY.replace('/send', '') + '/api');

  // Use two tabs, then end the sitting: exactly one session summary with those tabs, sorted.
  await page.locator('.wtab[data-t="voyage"]').click();
  await page.locator('.wtab[data-t="averages"]').click();
  await page.locator('.wtab[data-t="voyage"]').click();
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.waitForTimeout(300);
  const sessions = sent.filter((s) => s.payload && s.payload.name === 'vp_pwa_session');
  expect(sessions).toHaveLength(1);
  expect(sessions[0].payload.data.tabs).toBe('averages,voyage');
  expect(Object.keys(sessions[0].payload.data).sort()).toEqual(['day', 'pack', 'phase', 'tabs']);

  // Nothing from localStorage preferences leaks: set a location + unit, end another sitting, inspect.
  await page.evaluate(() => { localStorage.setItem('itw:sel', 'Secret Harbor'); localStorage.setItem('itw:unit', 'celsius'); });
  await page.locator('.wtab[data-t="now"]').click();
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  await page.waitForTimeout(300);
  expect(JSON.stringify(sent)).not.toContain('Secret Harbor');
  expect(JSON.stringify(sent)).not.toContain('celsius');
  expect(sent.every((s) => s.payload.website && !('ip' in s.payload))).toBe(true);
});
