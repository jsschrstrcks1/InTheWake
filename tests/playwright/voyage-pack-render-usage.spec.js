// The three offline HTML pack renders emit anonymous usage events and nothing else.
// Reads the outbound payloads literally by intercepting the network. Soli Deo Gloria.
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const packs = JSON.parse(fs.readFileSync(path.join(ROOT, 'admin/voyage-packs/packs.json'), 'utf8'));
const renders = packs.filter((p) => p.html);

for (const pack of renders) {
  test.describe(`render ${pack.slug}`, () => {
    test('names its pack, loads the usage module before the card script, and sends only slug + scope', async ({ page }) => {
      const sent = [];
      // The Umami site script is blocked here, so the module falls back to its own POST; capture it.
      await page.route('https://cloud.umami.is/**', (route) => {
        if (route.request().method() === 'POST') {
          sent.push(JSON.parse(route.request().postData() || '{}'));
          return route.fulfill({ status: 200, body: '{}' });
        }
        return route.abort();
      });
      await page.route('https://cdn.jsdelivr.net/**', (route) => route.abort());

      await page.goto('/' + pack.html);
      await expect(page.locator('main[data-pack]')).toHaveAttribute('data-pack', pack.slug);
      const order = await page.evaluate(() => Array.from(document.scripts).map((s) => s.getAttribute('src') || '').filter((s) => /voyage-usage|handoff-card/.test(s)));
      expect(order[0]).toContain('voyage-usage.js');
      expect(order[1]).toContain('handoff-card.js');

      // Type into the first handoff field: exactly one vp_handoff_filled, carrying the slug only.
      const first = page.locator('.handoff-card input[type="text"]').first();
      await first.scrollIntoViewIfNeeded();
      await first.fill('Jane Example');
      await first.fill('Jane Example 555-0100');
      await page.waitForTimeout(200);
      const filled = sent.filter((s) => s.payload && s.payload.name === 'vp_handoff_filled');
      expect(filled).toHaveLength(1);
      expect(filled[0].payload.data).toEqual({ pack: pack.slug });
      expect(JSON.stringify(sent)).not.toContain('Jane');
      expect(JSON.stringify(sent)).not.toContain('555');

      // A print button sends vp_print with the scope; window.print is stubbed so no dialog opens.
      await page.evaluate(() => { window.print = () => {}; });
      const printBtn = page.locator('button[data-print-scope="emergency-only"]').first();
      await printBtn.scrollIntoViewIfNeeded();
      await printBtn.click();
      await page.waitForTimeout(200);
      const prints = sent.filter((s) => s.payload && s.payload.name === 'vp_print');
      expect(prints).toHaveLength(1);
      expect(prints[0].payload.data).toEqual({ pack: pack.slug, scope: 'emergency-only' });
    });
  });
}
