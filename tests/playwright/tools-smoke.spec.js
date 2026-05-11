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
// (c) have a non-empty <title>, (d) throw zero JS pageerrors during load.
//
// (d) was originally an annotation rather than an assertion because the
// smoke spec's first run on 2026-05-09 surfaced four pre-existing inline-
// script escape bugs (port-tracker / ship-tracker had `\${...}` instead of
// `${...}` inside template literals; drink-calculator / drink-calculatorv2
// had `classList.remove(\\'no-js\\')` with backslash-escaped quotes outside
// a string context). All four were fixed in the same audit pass and the
// assertion was tightened. Any future regression of the same shape will
// fail this spec immediately rather than slipping through unnoticed.

import { test, expect } from "@playwright/test";

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
  test(`smoke: ${tool.url} loads, renders h1, throws zero JS pageerrors`, async ({ page }) => {
    const errors = [];
    page.on("pageerror", (err) => errors.push(err.message));

    const response = await page.goto(tool.url);
    expect(response?.status(), `HTTP status for ${tool.url}`).toBe(200);

    await expect(page.locator("h1").first()).toContainText(tool.h1);
    await expect(page).toHaveTitle(/.+/); // non-empty title

    await page.waitForLoadState("networkidle");
    expect(errors, `JS pageerrors during ${tool.url} load`).toEqual([]);
  });
}
