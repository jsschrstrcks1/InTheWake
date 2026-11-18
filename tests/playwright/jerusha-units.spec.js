// Behaviour pins for the Jerusha app's Phase 1a fixes (plan: admin/claude/plans/jerusha-UPGRADE-PLAN-2026-11.md).
// The app is one IIFE, so nothing is callable from outside; every pin reads the DOM.
// Loads the plaintext payload source (gitignored -> test.skips where it is absent; create it with
//   JERUSHA_PASS=... node admin/jerusha-worker/jerusha-payload.mjs extract).
// No network: the worker, weather and CDN-independent paths are stubbed or left to fail quietly.
// Run: npx playwright test jerusha-units
import { test, expect } from "@playwright/test";
import fs from "node:fs";

const SRC_REL = "/admin/jerusha-src/alaska-trip.payload.html";
const SRC_ABS = "admin/jerusha-src/alaska-trip.payload.html";
const TESTPASS = "render-test-passphrase";

// opts: media (worker /media list), nws ("404" | "empty" | features array), overrides (object served as the
// itinerary-overrides file), push ("404" | status object), meteo (array that collects Open-Meteo request URLs).
async function open(page, isoInstant, opts = {}) {
  const media = opts.media || [];
  await page.clock.setFixedTime(new Date(isoInstant));
  await page.addInitScript((p) => { window.__JPW = p; }, TESTPASS);
  await page.route("**/*.workers.dev/**", (r) => {
    const u = new URL(r.request().url());
    const json = (o, status = 200) => r.fulfill({ status, contentType: "application/json", body: JSON.stringify(o) });
    if (u.pathname === "/media") return json({ media });
    if (u.pathname === "/notes") return json({ notes: [], deletions: [] });
    if (u.pathname === "/loc") return json({ points: [] });
    if (u.pathname === "/push-status" || u.pathname === "/push-test") {
      if (!opts.push || opts.push === "404") return json({ error: "not found" }, 404);
      return json(u.pathname === "/push-test" ? { role: "jerusha", results: ["push.example -> 201"] } : opts.push);
    }
    return json({}, 404);
  });
  await page.route("**/api.open-meteo.com/**", (r) => {
    if (opts.meteo) opts.meteo.push(r.request().url());
    return r.fulfill({ status: 503, body: "" });
  });
  await page.route("**/api.weather.gov/**", (r) => {
    if (!opts.nws || opts.nws === "404") return r.fulfill({ status: 404, contentType: "application/problem+json", body: JSON.stringify({ title: "Data Unavailable For Requested Point" }) });
    return r.fulfill({ status: 200, contentType: "application/geo+json", body: JSON.stringify({ features: opts.nws === "empty" ? [] : opts.nws }) });
  });
  if (opts.overrides) {
    await page.route("**/admin/family/itinerary-overrides.json*", (r) => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(opts.overrides) }));
  }
  await page.goto(SRC_REL);
}

test.beforeEach(() => {
  test.skip(!fs.existsSync(SRC_ABS), "gitignored payload source not present (run jerusha-payload.mjs extract)");
});

// 1.14 — "today" is read in the voyage's own zone.
// 2026-12-05T06:00Z is Dec 5 01:00 in New York and Dec 4 21:00 in Anchorage. The old code
// (Anchorage for every voyage) would still say "departs in 1 day".
test("World America reads its day in Eastern time, not Alaska time", async ({ page }) => {
  await open(page, "2026-12-05T06:00:00Z");
  const status = page.locator("#voy-status");
  await expect(status).toContainText("MSC World America");
  await expect(status).toContainText("Day 1");
  await expect(status).not.toContainText("departs in");
});

// Control for 1.14: Alaska still reads in Anchorage time.
// 2026-06-29T05:00Z is Jun 28 21:00 in Anchorage and Jun 29 01:00 in New York. A blanket
// switch to Eastern would wrongly say "Day 1".
test("Anthem Alaska still reads its day in Alaska time", async ({ page }) => {
  await open(page, "2026-06-29T05:00:00Z");
  const status = page.locator("#voy-status");
  await expect(status).toContainText("Anthem of the Seas");
  await expect(status).toContainText("departs in 1 day");
});

// 1.11 — values that come back from the worker cannot break out of an HTML attribute.
// The hostile mime closes the attribute and tries to add an element and a handler.
test("hostile media metadata stays inside its attribute", async ({ page }) => {
  const hostile = '"><img src=x onerror="window.__pwned=1"><i x="';
  await open(page, "2026-11-12T12:00:00Z", { media: [
    { v: 1, id: 'a"b', kind: "photo", mime: hostile, lat: null, lon: null, day: null, ts: "2026-11-12T00:00:00.000Z" },
  ] });
  await page.locator('.wtab[data-t="gallery"]').click();
  const slide = page.locator("#jgm-body .swiper-slide").first();
  await expect(slide).toBeAttached({ timeout: 15000 });
  await expect(slide).toHaveAttribute("data-mime", hostile);
  await expect(slide).toHaveAttribute("data-mid", 'a"b');
  expect(await page.locator("#jgm-body img[src='x']").count()).toBe(0);
  expect(await page.evaluate(() => window.__pwned)).toBeUndefined();
});

// 1.3 — the page names its real address.
test("canonical and og:url name alaska-trip.html", async ({ page }) => {
  await open(page, "2026-11-12T12:00:00Z");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://cruisinginthewake.com/admin/alaska-trip.html");
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", "https://cruisinginthewake.com/admin/alaska-trip.html");
});

// ---- Phase 1b ------------------------------------------------------------------------------

// 1.21 — a feed that gave no answer is "unknown", never "no alerts".
test("alerts: no answer from the feed reads as unknown, not as all-clear", async ({ page }) => {
  await open(page, "2026-11-12T12:00:00Z", { nws: "404" });
  await page.locator('.wtab[data-t="alerts"]').click();
  const pane = page.locator("#pane-alerts");
  await expect(pane).toContainText("Alert status unknown", { timeout: 15000 });
  await expect(pane).toContainText("not an all-clear");
  await expect(pane).not.toContainText("No active NWS alerts");
});

// Control for 1.21: a feed that answered with nothing active still says so.
test("alerts: an answered, empty feed still reads as no active alerts", async ({ page }) => {
  await open(page, "2026-11-12T12:00:00Z", { nws: "empty" });
  await page.locator('.wtab[data-t="alerts"]').click();
  const pane = page.locator("#pane-alerts");
  await expect(pane).toContainText("No active NWS alerts", { timeout: 15000 });
  await expect(pane).not.toContainText("unknown");
});

// 1.13 — an override that renames a port reaches the location picker, not only the voyage list.
test("overrides rebuild the location picker", async ({ page }) => {
  await open(page, "2026-11-12T12:00:00Z", { overrides: { voyages: { "world-america-dec": { days: { "3": { loc: "Override Port Zed" } } } } } });
  await expect(page.locator("#wloc option", { hasText: "Override Port Zed" })).toHaveCount(1);
  await expect(page.locator("#voy-list")).toContainText("Override Port Zed");
});

// 1.22 — a voyage day beyond the forecast range is not asked for, and the page says when it opens.
test("voyage days beyond the forecast range are not requested", async ({ page }) => {
  const meteo = [];
  await open(page, "2026-11-12T12:00:00Z", { meteo });
  await expect(page.locator("#voy-wx-1")).toContainText("Forecast opens about two weeks before this day");
  expect(meteo.filter((u) => u.includes("start_date=2026-12-")).length).toBe(0);
});

// Control for 1.22: inside the range the day IS requested.
test("voyage days inside the forecast range are requested", async ({ page }) => {
  const meteo = [];
  await open(page, "2026-12-01T12:00:00Z", { meteo });
  await expect.poll(() => meteo.filter((u) => u.includes("start_date=2026-12-05")).length).toBeGreaterThan(0);
  await expect(page.locator("#voy-wx-1")).not.toContainText("Forecast opens");
});

// 1.9 — push diagnostics. An old worker (404) is named plainly; a new one is read out.
test("alerts status says so when the server is the old version", async ({ page }) => {
  await open(page, "2026-11-12T12:00:00Z", { push: "404" });
  await page.locator('.wtab[data-t="us"]').click();
  await page.locator("#us-pstat").click();
  await expect(page.locator("#us-pstatus")).toContainText("needs the newer version deployed");
});

test("alerts status reads out devices and the last nudge", async ({ page }) => {
  await open(page, "2026-11-12T12:00:00Z", { push: { vapidPrivateSet: true, roles: {
    jerusha: { subscriptions: 1, endpoints: ["push.example"], lastPush: { ts: "2026-11-12T03:00:00.000Z", results: ["push.example -> 201"] } },
    me: { subscriptions: 0, endpoints: [], lastPush: null } } } });
  await page.locator('.wtab[data-t="us"]').click();
  await page.locator("#us-pstat").click();
  const out = page.locator("#us-pstatus");
  await expect(out).toContainText("Jerusha: 1 device signed up");
  await expect(out).toContainText("push.example -> 201");
  await expect(out).not.toContainText("NOT set");
  await page.locator("#us-ptest").click();
  await expect(out).toContainText("Test sent to Jerusha's devices");
});

// 1.18 — tabs name their panels and answer to the arrow keys.
test("tabs: panels are named, arrow keys move, one tab stop", async ({ page }) => {
  await open(page, "2026-11-12T12:00:00Z");
  const voyage = page.locator('.wtab[data-t="voyage"]'), us = page.locator('.wtab[data-t="us"]');
  await expect(voyage).toHaveAttribute("aria-controls", "pane-voyage");
  await expect(page.locator("#pane-voyage")).toHaveAttribute("role", "tabpanel");
  await expect(page.locator("#pane-voyage")).toHaveAttribute("aria-labelledby", "tab-voyage");
  await expect(voyage).toHaveAttribute("tabindex", "0");
  await expect(us).toHaveAttribute("tabindex", "-1");
  await voyage.focus();
  await page.keyboard.press("ArrowRight");
  await expect(us).toHaveAttribute("aria-selected", "true");
  await expect(us).toBeFocused();
  await expect(page.locator("#pane-us")).toHaveClass(/on/);
  await page.keyboard.press("Home");
  await expect(voyage).toBeFocused();
});

// 1.10 — tapping a voyage day's pin opens that day's photos (wired in drawRoute; was dead code).
// Pin order on the map with no "today": 2 faint routes, 2 active-route lines, then one circle per day.
// Index 6 is therefore day 3. If drawRoute's drawing order changes, change this index with it.
test("map: a day pin opens that day's photo popup", async ({ page }) => {
  await open(page, "2026-11-12T12:00:00Z");
  await page.locator('.wtab[data-t="radar"]').click();
  const pins = page.locator("#map path.leaflet-interactive");
  await expect(pins.nth(6)).toBeAttached({ timeout: 20000 });
  await pins.nth(6).dispatchEvent("click");
  const pop = page.locator(".leaflet-popup");
  await expect(pop).toContainText("Day 3", { timeout: 15000 });
  await expect(pop).toContainText("No photos from this day yet");
});

// 1.6 — the gallery says who added a photo. No uploader on record reads as Ken (older records).
test("gallery caption names the uploader", async ({ page }) => {
  await open(page, "2026-11-12T12:00:00Z", { media: [
    { v: 1, id: "old-1", kind: "photo", mime: "image/webp", lat: null, lon: null, day: null, ts: "2026-07-01T00:00:00.000Z" },
    { v: 1, id: "hers-1", kind: "photo", mime: "image/webp", lat: null, lon: null, day: null, by: "jerusha", ts: "2026-11-11T00:00:00.000Z" },
  ] });
  await page.locator('.wtab[data-t="gallery"]').click();
  // Newest first: her photo is the first slide.
  await expect(page.locator("#jgm-body")).toContainText("Added by Jerusha", { timeout: 15000 });
  await expect(page.locator('#jgm-body .swiper-slide[data-mid="old-1"]')).toHaveAttribute("data-by", "");
  await page.locator("#jgm-body .swiper-button-next").click();
  await expect(page.locator("#jgm-body")).toContainText("Added by Ken");
});
