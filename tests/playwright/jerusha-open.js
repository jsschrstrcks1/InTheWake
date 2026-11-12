// Shared opener for the Jerusha app specs (plan: admin/claude/plans/jerusha-UPGRADE-PLAN-2026-11.md).
// The app is one IIFE, so nothing is callable from a test: every pin reads the DOM.
// This loads the plaintext payload source (gitignored; make it with
//   JERUSHA_PASS=... node admin/jerusha-worker/jerusha-payload.mjs extract),
// fixes the clock, and stubs every outside call so no test touches a live service.
import fs from "node:fs";

export const SRC_REL = "/admin/jerusha-src/alaska-trip.payload.html";
export const SRC_ABS = "admin/jerusha-src/alaska-trip.payload.html";
export const TESTPASS = "render-test-passphrase";
export const hasSource = () => fs.existsSync(SRC_ABS);

// opts:
//   media        array served as the worker's /media list        mediaStatus  HTTP status for that list (default 200)
//   loc          array of {lat,lon,ts} served by /loc             cal          {status, body} served by /cal (default 404)
//   overrides    object served as the itinerary-overrides file   nws          "404" | "empty"
//   calls        array that collects every worker request path
export async function open(page, isoInstant, opts = {}) {
  await page.clock.setFixedTime(new Date(isoInstant));
  await page.addInitScript((p) => { window.__JPW = p; }, TESTPASS);
  await page.route("**/*.workers.dev/**", (r) => {
    const u = new URL(r.request().url());
    if (opts.calls) opts.calls.push(u.pathname + u.search);
    const json = (o, status = 200) => r.fulfill({ status, contentType: "application/json", body: JSON.stringify(o) });
    if (u.pathname === "/media") return json({ media: opts.media || [] }, opts.mediaStatus || 200);
    if (u.pathname.startsWith("/media/")) return json({ error: "not found" }, 404);
    if (u.pathname === "/notes") return json({ notes: [], deletions: [] });
    if (u.pathname === "/loc") return json({ points: opts.loc || [] });
    if (u.pathname === "/cal") {
      const c = typeof opts.cal === "function" ? opts.cal() : opts.cal;
      if (!c) return json({ error: "calendar not configured" }, 404);
      if (c.status && c.status !== 200) return json({ error: "calendar unreachable" }, c.status);
      return r.fulfill({ status: 200, contentType: "text/calendar; charset=utf-8", body: c.body });
    }
    return json({ error: "not found" }, 404);
  });
  await page.route("**/api.open-meteo.com/**", (r) => r.fulfill({ status: 503, body: "" }));
  await page.route("**/api.weather.gov/**", (r) => {
    if (opts.nws === "empty") return r.fulfill({ status: 200, contentType: "application/geo+json", body: JSON.stringify({ features: [] }) });
    return r.fulfill({ status: 404, contentType: "application/problem+json", body: "{}" });
  });
  if (opts.overrides) {
    await page.route("**/admin/family/itinerary-overrides.json*", (r) => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(opts.overrides) }));
  }
  await page.goto(SRC_REL);
}
