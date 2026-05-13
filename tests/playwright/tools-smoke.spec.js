// tests/playwright/tools-smoke.spec.js
//
// Smoke regression spec for the 8 site tools that did not previously have
// Playwright coverage. Caught by the 2026-05-09 careful-not-clever audit
// (P3): the cruise-tipping-calculator commit landed without verification
// that the OTHER tools still loaded — a future shared-CSS or shared-nav
// change could silently break, say, the drink calculator without anyone
// noticing until a user reports it.
//
// Bar: each tool's page must (a) return 200, (b) render its primary <h1>,
// (c) have a non-empty <title>, (d) throw zero JS pageerrors during load,
// (e) make zero requests to `/[object Object]` from anywhere (page, frames,
// service worker).
//
// (d) was originally an annotation rather than an assertion because the
// smoke spec's first run on 2026-05-09 surfaced four pre-existing inline-
// script escape bugs (port-tracker / ship-tracker had `\${...}` instead of
// `${...}` inside template literals; drink-calculator / drink-calculatorv2
// had `classList.remove(\\'no-js\\')` with backslash-escaped quotes outside
// a string context). All four were fixed in the same audit pass and the
// assertion was tightened. Any future regression of the same shape will
// fail this spec immediately rather than slipping through unnoticed.
//
// (e) was added 2026-05-13 after B1.2 of the audit batch found that
// sw.js:warmPrecache was treating the precache-manifest's
// { url, priority } entries as bare URL strings, so `new URL({}, base)`
// coerced every entry to `[object Object]` and fired ~64 404s per page
// load. Fix in sw.js extracts the .url property explicitly and hardens
// isSameOrigin against non-strings. This assertion guards against any
// future manifest consumer with the same bug.

import { test, expect } from "@playwright/test";

const OBJECT_OBJECT_RE = /\[object(?:%20|\s|_)?Object\]/i;

const TOOLS = [
  { url: "/tools/cruise-budget-calculator.html",  h1: /Cruise Budget Calculator/ },
  { url: "/tools/port-day-planner.html",          h1: /Port Day Planner/ },
  { url: "/tools/port-tracker.html",              h1: /Port Logbook/ },
  { url: "/tools/ship-tracker.html",              h1: /Ship Logbook/ },
  { url: "/tools/ship-size-atlas.html",           h1: /Ship Size Atlas/ },
  { url: "/drink-calculator.html",                h1: /Drink Package Calculator/ },
  { url: "/drink-calculatorv2.html",              h1: /Drink Package Calculator/ },
  { url: "/stateroom-check.html",                 h1: /Stateroom Sanity Check/ }
];

for (const tool of TOOLS) {
  test(`smoke: ${tool.url} loads, renders h1, no JS pageerrors, no [object Object] requests`, async ({ page, context }) => {
    const errors = [];
    const objectObjectHits = [];
    page.on("pageerror", (err) => errors.push(err.message));
    // context.on('request') catches service-worker traffic too — page.on
    // misses SW-originated fetches.
    context.on("request", (req) => {
      try {
        const u = req.url();
        let decoded = u;
        try { decoded = decodeURIComponent(u); } catch { /* keep raw */ }
        if (OBJECT_OBJECT_RE.test(u) || OBJECT_OBJECT_RE.test(decoded)) {
          let referer = null;
          try { referer = req.headers().referer || null; } catch { /* SW has none */ }
          objectObjectHits.push({ url: u, referer });
        }
      } catch { /* never let a listener exception break the test */ }
    });

    const response = await page.goto(tool.url);
    expect(response?.status(), `HTTP status for ${tool.url}`).toBe(200);

    await expect(page.locator("h1").first()).toContainText(tool.h1);
    await expect(page).toHaveTitle(/.+/); // non-empty title

    await page.waitForLoadState("networkidle");
    // Give the service worker (if registered on this page) time to fire
    // warmPrecache. The pre-fix bug surfaced AFTER networkidle.
    await page.waitForTimeout(2000);

    expect(errors, `JS pageerrors during ${tool.url} load`).toEqual([]);
    expect(objectObjectHits, `[object Object] requests during ${tool.url} load`).toEqual([]);
  });
}
