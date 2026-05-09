// tests/playwright/tools-smoke.spec.js
//
// Smoke regression spec for the 8 site tools that did not previously have
// Playwright coverage. Caught by the 2026-05-09 careful-not-clever audit
// (P3): the cruise-tipping-calculator commit landed without verification
// that the OTHER tools still loaded — a future shared-CSS or shared-nav
// change could silently break, say, the drink calculator without anyone
// noticing until a user reports it.
//
// Bar set deliberately low: each tool's page must (a) return 200, (b) render
// its primary heading, (c) have a non-empty <title>. Detailed behavior tests
// are for each tool's own future spec; this is the regression baseline.
//
// Pre-existing JS pageerrors found during initial run on 2026-05-09 — 4 of
// the 8 tools (port-tracker, ship-tracker, drink-calculator, drink-calculatorv2)
// throw "Invalid or unexpected token" with an empty stack trace, suggesting
// an inline script issue. Logged as a separate audit finding in
// admin/UNFINISHED_TASKS.md. The smoke spec records errors via pageerror
// listener but does NOT fail on them — that would conflate "this commit
// regressed something" with "this defect was already here." When those four
// tools are debugged and fixed, flip the assertion below to require errors
// to be empty.

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
  test(`smoke: ${tool.url} loads, renders h1, has title (JS errors annotated)`, async ({ page }) => {
    const errors = [];
    page.on("pageerror", (err) => errors.push(err.message));

    const response = await page.goto(tool.url);
    expect(response?.status(), `HTTP status for ${tool.url}`).toBe(200);

    await expect(page.locator("h1").first()).toContainText(tool.h1);
    await expect(page).toHaveTitle(/.+/); // non-empty title

    await page.waitForLoadState("networkidle");
    // Annotate (don't assert) any pageerrors so they show up in the test report
    // without failing the suite. See file-level comment for the rationale.
    if (errors.length > 0) {
      test.info().annotations.push({
        type: "pre-existing-jserror",
        description: `${tool.url}: ${errors.join(" | ")}`
      });
    }
  });
}
