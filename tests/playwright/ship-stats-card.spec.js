// Regression: the ship stats card must still show its stats after the page's
// stats loader finishes. The loader renders the inline #ship-stats-fallback JSON,
// then fetches SOURCES; on some pages the second source is the logbook/persona
// file (ships/<line>/assets/<slug>.json), which carries no stat keys. Rendering
// that over the fallback emptied the card (only "Class" on Quantum).
// Found 2026-10-23. Run: npx playwright test ship-stats-card
import { test, expect } from "@playwright/test";

// The page registers /sw.js; requests it serves bypass page.route, and its
// takeover reloads the page mid-test. The loader is under test, not the worker.
test.use({ serviceWorkers: "block" });

// The four pages whose second source resolves to a non-stats file, plus one
// control whose sources both 404 (the fallback must survive either way).
const PAGES = [
  "/ships/carnival/carnival-jubilee.html",
  "/ships/rcl/grandeur-of-the-seas.html",
  "/ships/rcl/quantum-of-the-seas.html",
  "/ships/rcl/radiance-of-the-seas.html",
  "/ships/rcl/allure-of-the-seas.html",
];

for (const path of PAGES) {
  test(`stats card keeps Gross Tonnage after load: ${path}`, async ({ page }) => {
    // Only the local test server is under test; drop third-party requests.
    await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
    await page.goto(path, { waitUntil: "load" });
    // The logbook loader fetches the same ships/<line>/assets/<slug>.json URL, so
    // waiting on one response races. Wait for the network to go quiet, give the
    // last .then() a beat, and settle again before reading the card.
    // simplify: fixed 1.5s settle — replace with a loader-done signal if one is added.
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);
    await page.waitForLoadState("networkidle");

    // One read of the settled card, not a retrying matcher: a retrying matcher
    // can pass on the fallback render before the fetch overwrites it.
    const keys = await page.locator("#ship-stats .stat-key").allInnerTexts();
    expect(keys).toContain("Gross Tonnage");
    expect(keys).toContain("Guests");
  });
}

// The guard must not block genuine stats data: a stats file at the first source
// still replaces the fallback, as it did before the fix.
test("genuine stats data still replaces the fallback", async ({ page }) => {
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
  await page.route("**/assets/data/ships/quantum-of-the-seas.json", (r) =>
    r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ gt: "999,999 GT (test)", guests: "1 (test)" }) }));
  await page.goto("/ships/rcl/quantum-of-the-seas.html", { waitUntil: "load" });
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1500);
  await page.waitForLoadState("networkidle");
  const vals = await page.locator("#ship-stats .stat-val").allInnerTexts();
  expect(vals).toContain("999,999 GT (test)");
});
