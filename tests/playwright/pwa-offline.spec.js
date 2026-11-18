// tests/playwright/pwa-offline.spec.js
//
// The cruise tipping calculator works with no network once the site's service worker has installed: the case of a
// reader who opened it at home and needs it at sea. Soli Deo Gloria.
//
// It loads the page online, waits for the service worker to activate and warm its precache from
// /precache-manifest.json, cuts the network, reloads, and checks that the calculator fills in: every cruise line in the
// selector, the cabin tiers, and a total. Measured 2026-11-07 before the fix: the page came back from the cache but
// main.js and its modules did not (they were precached and never copied to the cache the fetch handler reads), so
// the selector stayed empty.

import { test, expect } from "@playwright/test";

const URL = "/tools/cruise-tipping-calculator.html";

// playwright.config.js blocks service workers for every spec; this one tests the worker, so it allows it.
test.use({ serviceWorkers: "allow" });

test("the tipping calculator fills in offline after the service worker has installed", async ({ page, context }) => {
  await context.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
  await page.goto(URL);
  // The lines load from the data files after the module runs, so wait for them rather than read the count at once.
  await expect.poll(() => page.locator("#line-select option").count(), { timeout: 15000 }).toBeGreaterThan(5);
  const online = await page.locator("#line-select option").count();

  await page.evaluate(() => navigator.serviceWorker.ready);
  // Wait for warmPrecache() to fill the runtime caches (it runs on activate and copies the precache over).
  await expect.poll(async () => page.evaluate(async () => {
    const names = await caches.keys();
    const assets = names.find((n) => n.includes("-assets-"));
    if (!assets) return 0;
    const keys = await (await caches.open(assets)).keys();
    return keys.filter((r) => r.url.includes("/cruise-tipping-calculator/")).length;
  }), { timeout: 30000 }).toBeGreaterThan(0);

  await context.setOffline(true);
  await page.reload();
  await expect(page.locator("#line-select option")).toHaveCount(online, { timeout: 15000 });
  await page.selectOption("#line-select", "carnival");
  await page.fill("#nights", "7");
  await page.fill("#adults", "2");
  await expect(page.locator("#result-headline")).toContainText("Carnival", { timeout: 10000 });
});

// The drink calculator, the same way. Measured 2026-11-07 before the fix: offline the page came back but every one of
// its scripts and its versioned data (calculator-config.json?v=1.003.001 and others) failed, so the calculator never
// started and the cards showed the page's built-in placeholder prices as if they were real.
test("the drink calculator starts offline after the service worker has installed", async ({ page, context }) => {
  await context.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
  await page.goto("/drink-calculator.html");
  await page.waitForFunction(() => window.ITW_LINE_CONFIG && window.ITW_LINE_CONFIG.id, null, { timeout: 15000 });
  const online = await page.evaluate(() => ({ line: window.ITW_LINE_CONFIG.id, grat: window.ITW?.store?.get?.("economics")?.grat }));
  expect(online.line).toBe("royal-caribbean");

  await page.evaluate(() => navigator.serviceWorker.ready);
  await expect.poll(async () => page.evaluate(async () => {
    const names = await caches.keys();
    const assets = names.find((n) => n.includes("-assets-"));
    if (!assets) return 0;
    const keys = await (await caches.open(assets)).keys();
    return keys.filter((r) => r.url.includes("/assets/js/calculator-v2.js")).length;
  }), { timeout: 30000 }).toBeGreaterThan(0);

  await context.setOffline(true);
  await page.reload();
  await page.waitForFunction(() => window.ITW_LINE_CONFIG && window.ITW_LINE_CONFIG.id, null, { timeout: 15000 });
  const offline = await page.evaluate(() => ({ line: window.ITW_LINE_CONFIG.id, grat: window.ITW?.store?.get?.("economics")?.grat }));
  expect(offline).toEqual(online);
});
