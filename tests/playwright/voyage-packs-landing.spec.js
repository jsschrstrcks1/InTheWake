// Voyage Packs landing page — feature cards + install-guide dialog.
// Soli Deo Gloria.
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const PAGE = '/voyage-packs.html';

test.describe('feature cards', () => {
  test('eight feature cards, each with a heading, an explanation, and one wayfinding control', async ({ page }) => {
    await page.goto(PAGE);
    const cards = page.locator('.vp-feature');
    await expect(cards).toHaveCount(8);
    for (let i = 0; i < 8; i++) {
      const card = cards.nth(i);
      await expect(card.locator('h3')).toHaveCount(1);
      await expect(card.locator('p').first()).not.toBeEmpty();
      await expect(card.locator('.vp-feature-cta a, .vp-feature-cta button')).toHaveCount(1);
    }
  });

  test('every internal link on a feature card points at a file that exists in the repo', async ({ page }) => {
    await page.goto(PAGE);
    const hrefs = await page.locator('.vp-feature-cta a[href^="/"]').evaluateAll((els) => els.map((a) => a.getAttribute('href')));
    expect(hrefs.length).toBeGreaterThan(0);
    const root = path.resolve(__dirname, '..', '..');
    for (const href of hrefs) {
      const clean = href.split('#')[0].split('?')[0];
      let file = path.join(root, clean);
      if (clean.endsWith('/')) file = path.join(file, 'index.html');
      expect(fs.existsSync(file), `${href} → ${file}`).toBe(true);
    }
  });

  test('no inline event handlers in the new markup', async ({ page }) => {
    await page.goto(PAGE);
    const count = await page.locator('.vp-features [onclick], .vp-dialog [onclick], .vp-features [onkeydown], .vp-dialog [onkeydown]').count();
    expect(count).toBe(0);
  });
});

test.describe('install-guide dialog', () => {
  test('is hidden until opened, then traps focus and restores it on Escape', async ({ page }) => {
    await page.goto(PAGE);
    const dialog = page.locator('#vp-install-dialog');
    await expect(dialog).toBeHidden();
    await expect(dialog).toHaveAttribute('aria-hidden', 'true');

    const trigger = page.locator('[data-vp-install-open]').first();
    await trigger.click();
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('aria-hidden', 'false');
    await expect(dialog).toHaveAttribute('role', 'dialog');
    await expect(dialog).toHaveAttribute('aria-modal', 'true');

    // Focus landed inside the dialog, on the selected tab.
    const active = await page.evaluate(() => document.activeElement && document.activeElement.getAttribute('role'));
    expect(active).toBe('tab');

    // Tab wraps: from the last focusable, Tab goes back to the first.
    const items = await dialog.locator('button:not([disabled]), [href]').evaluateAll((els) => els.filter((e) => e.offsetParent !== null).length);
    for (let i = 0; i < items + 1; i++) await page.keyboard.press('Tab');
    const stillInside = await page.evaluate(() => !!document.activeElement.closest('#vp-install-dialog'));
    expect(stillInside).toBe(true);

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    const returned = await page.evaluate(() => document.activeElement.hasAttribute('data-vp-install-open'));
    expect(returned).toBe(true);
  });

  test('platform tabs switch panels with click and arrow keys', async ({ page }) => {
    await page.goto(PAGE);
    await page.locator('[data-vp-install-open]').first().click();
    const tabs = page.locator('#vp-install-dialog [role="tab"]');
    await expect(tabs).toHaveCount(3);

    const android = tabs.filter({ hasText: 'Android' });
    await android.click();
    await expect(android).toHaveAttribute('aria-selected', 'true');
    const androidPanelId = await android.getAttribute('aria-controls');
    await expect(page.locator(`#${androidPanelId}`)).toBeVisible();
    const visiblePanels = await page.locator('#vp-install-dialog [role="tabpanel"]:visible').count();
    expect(visiblePanels).toBe(1);

    await page.keyboard.press('ArrowRight');
    const selected = await page.locator('#vp-install-dialog [role="tab"][aria-selected="true"]').count();
    expect(selected).toBe(1);
    const nowVisible = await page.locator('#vp-install-dialog [role="tabpanel"]:visible').count();
    expect(nowVisible).toBe(1);
  });

  test('close button and backdrop both close it', async ({ page }) => {
    await page.goto(PAGE);
    const dialog = page.locator('#vp-install-dialog');
    await page.locator('[data-vp-install-open]').first().click();
    await dialog.locator('.vp-dialog-close').click();
    await expect(dialog).toBeHidden();

    await page.locator('[data-vp-install-open]').first().click();
    await expect(dialog).toBeVisible();
    await dialog.click({ position: { x: 5, y: 5 } });
    await expect(dialog).toBeHidden();
  });

  test('every trigger on the page opens the same dialog', async ({ page }) => {
    await page.goto(PAGE);
    const triggers = page.locator('[data-vp-install-open]');
    const n = await triggers.count();
    expect(n).toBeGreaterThanOrEqual(2);
    for (let i = 0; i < n; i++) {
      await triggers.nth(i).scrollIntoViewIfNeeded();
      await triggers.nth(i).click();
      await expect(page.locator('#vp-install-dialog')).toBeVisible();
      await page.keyboard.press('Escape');
    }
  });
});
