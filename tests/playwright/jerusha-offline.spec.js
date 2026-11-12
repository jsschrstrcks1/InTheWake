// Offline pin for the Jerusha service worker (plan item 1.1,
// admin/claude/plans/jerusha-UPGRADE-PLAN-2026-11.md).
// Until 2026-11 the worker cached and fell back to /admin/weather-jerusha.html, which is a
// redirect stub, so an installed app could never open offline. These tests load the REAL
// shipped files (gate page + sw-jerusha.js) from the local server, then cut the network.
// The passphrase is never needed: the gate rendering offline is the claim under test.
// Run: npx playwright test jerusha-offline
import { test, expect } from "@playwright/test";

// The repo config blocks service workers by default (playwright.config.js). This spec tests one, so it opts in.
test.use({ serviceWorkers: "allow" });

const SHELL = "/admin/alaska-trip.html";
const LEGACY = "/admin/weather-jerusha.html";

async function installWorker(page) {
  await page.goto(SHELL);
  await expect(page.locator("#gp")).toBeVisible();
  // Wait until the worker is active AND controls this page, and the shell is in its cache.
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) {
      await new Promise((res) => navigator.serviceWorker.addEventListener("controllerchange", res, { once: true }));
    }
  });
  await expect.poll(async () => page.evaluate(async (shell) => {
    const keys = await caches.keys();
    for (const k of keys) { if (await (await caches.open(k)).match(shell)) return k; }
    return null;
  }, SHELL)).toMatch(/^jerusha-v\d+$/);
}

test("the gate opens offline at its real address", async ({ page, context }) => {
  await installWorker(page);
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator("#gp")).toBeVisible();
  await expect(page.locator("#gf button[type=submit]")).toHaveText(/unlock/i);
  expect(new URL(page.url()).pathname).toBe(SHELL);
});

test("the old address also opens the gate offline", async ({ page, context }) => {
  await installWorker(page);
  await context.setOffline(true);
  await page.goto(LEGACY);
  await expect(page.locator("#gp")).toBeVisible();
});

test("the worker does not answer for other admin pages when offline", async ({ page, context }) => {
  await installWorker(page);
  await context.setOffline(true);
  // A sibling page under the worker's /admin/ scope must fail as the browser fails it,
  // not come back as this page's passphrase gate.
  const res = await page.goto("/admin/LIBRARY.md").catch((e) => e);
  expect(res instanceof Error).toBe(true);
  expect(await page.locator("#gp").count()).toBe(0);
});
