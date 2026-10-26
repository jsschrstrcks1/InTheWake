// tests/playwright/ship-stats-card.spec.js
//
// The ship stats card, in a real browser (Tekton itw-stats-card-wiped-on-8-ship-pages). Soli Deo Gloria.
//
// Measured 2026-10-26 over all 278 ship pages: 152 showed an empty stats card because nothing filled
// #ship-stats, and on Quantum and Radiance an inline loader drew the card and then replaced it with a
// fetched logbook persona file once that fetch landed (Quantum was left showing "Class" alone).
// assets/js/ship-stats.js now draws every card from the page's own #ship-stats-fallback.
//
// Each case waits for the logbook persona fetch where the page makes one, because the old wipe happened
// only after that response arrived: a check taken before it would pass on the broken page too.
// Hosts other than the test server are refused so a CDN cannot make the run slow or flaky.

import { test, expect } from "@playwright/test";

const CASES = [
  // The wipe: the page still fetches this persona file for its logbook, and the card must survive it.
  { url: "/ships/rcl/quantum-of-the-seas.html", lines: 8, waitFor: "/ships/rcl/assets/quantum-of-the-seas.json", first: ["Class", "Quantum Class"] },
  { url: "/ships/rcl/radiance-of-the-seas.html", lines: 8, waitFor: "/ships/rcl/assets/radiance-of-the-seas.json" },
  { url: "/ships/rcl/grandeur-of-the-seas.html", lines: 8 },
  { url: "/ships/carnival/carnival-jubilee.html", lines: 8 },
  // Never filled before.
  { url: "/ships/carnival/carnival-elation.html", lines: 8, first: ["Class", "Fantasy Class"] },
  { url: "/ships/celebrity-cruises/celebrity-eclipse.html", lines: 5 },
  // "N/A" states no fact and is not shown: four keys, three lines.
  { url: "/ships/celebrity-cruises/celebrity-compass.html", lines: 3, absent: "N/A" },
  // Only "Historic" in every key: nothing is drawn and the mount is not marked.
  { url: "/ships/holland-america-line/amsterdam.html", lines: 0 },
];

test.beforeEach(async ({ context, baseURL }) => {
  await context.route("**/*", (route) =>
    route.request().url().startsWith(baseURL) ? route.continue() : route.abort());
});

for (const c of CASES) {
  test(`stats card: ${c.url} shows ${c.lines} line(s)`, async ({ page }) => {
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    const waited = c.waitFor ? page.waitForResponse((r) => r.url().endsWith(c.waitFor)) : null;
    await page.goto(c.url, { waitUntil: "load" });
    if (waited) { await waited; await page.waitForTimeout(500); }
    const mount = page.locator("#ship-stats");
    await expect(mount.locator(".stat-line")).toHaveCount(c.lines);
    if (c.lines) await expect(mount).toHaveAttribute("data-stats-rendered", String(c.lines));
    else expect(await mount.getAttribute("data-stats-rendered")).toBeNull();
    if (c.first) {
      await expect(mount.locator(".stat-line").first().locator(".stat-key")).toHaveText(c.first[0]);
      await expect(mount.locator(".stat-line").first().locator(".stat-val")).toHaveText(c.first[1]);
    }
    if (c.absent) await expect(mount).not.toContainText(c.absent);
    expect(errors.filter((m) => /ship-stats/.test(m))).toEqual([]);
  });
}

test("stats card: a hand-written card is left as written", async ({ page }) => {
  await page.goto("/ships/carnival/carnival-adventure.html", { waitUntil: "load" });
  const mount = page.locator("#ship-stats");
  await expect(mount.locator(".stat-item")).toHaveCount(6);
  await expect(mount.locator(".stat-line")).toHaveCount(0);
  expect(await mount.getAttribute("data-stats-rendered")).toBeNull();
});
