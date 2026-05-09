// tests/playwright/cruise-tipping-calculator.spec.js
//
// Playwright coverage for the Cruise Tipping Calculator (Task 9 of the
// 2026-05-08 cruise-tipping-calculator plan). Six tests:
//   1. Golden path — Carnival 7-night standard, 2 adults → $238
//   2. Bundled-fare line — Regent → $0 daily, banner visible
//   3. Compare mode — Royal Caribbean vs. Norwegian
//   4. URL hash share-and-restore preserves a configured plan
//   5. Specialty dining math — 2 × $80 × 20% = $32 (Carnival post-Dec-2025)
//   6. HAL date-effective — sailing 2026-07-15 → 7 × $18 × 2 = $252

import { test, expect } from "@playwright/test";

const URL = "/tools/cruise-tipping-calculator.html";

test.describe("Cruise tipping calculator", () => {
  test("golden path: 7-night Carnival standard for 2 adults shows $238 daily charge", async ({ page }) => {
    await page.goto(URL);
    await page.selectOption("#line-select", "carnival");
    await page.selectOption("#cabin-tier", "standard");
    await page.fill("#nights", "7");
    await page.fill("#adults", "2");
    await page.fill("#children", "0");
    // 7 nights × $17 standard × 2 adults = $238 daily auto-charge
    const dailyRow = page.locator("#result-breakdown li", { hasText: "Daily auto-charge" });
    await expect(dailyRow).toContainText("$238");
    await expect(page.locator("#result-headline")).toContainText("Carnival Cruise Line");
  });

  test("bundled-gratuity line: Regent shows the included banner and no daily auto-charge", async ({ page }) => {
    await page.goto(URL);
    await page.selectOption("#line-select", "regent");
    await expect(page.locator("#bundled-banner")).toBeVisible();
    await expect(page.locator("#bundled-banner")).toContainText(/included/i);
    // Headline total may include cash extras, but daily auto-charge must not appear.
    await expect(page.locator("#result-breakdown")).not.toContainText("Daily auto-charge");
  });

  test("compare mode shows a side-by-side total for a second line", async ({ page }) => {
    await page.goto(URL);
    await page.selectOption("#line-select", "royal-caribbean");
    await page.click("#compare-toggle");
    await expect(page.locator("#compare-column")).toBeVisible();
    await page.selectOption("#compare-line", "norwegian");
    await expect(page.locator("#compare-output")).toContainText("Norwegian");
    await expect(page.locator("#compare-output")).toContainText("$");
  });

  test("URL hash share-and-restore preserves a configured plan", async ({ page, context }) => {
    await page.goto(URL);
    await page.selectOption("#line-select", "princess");
    await page.fill("#nights", "10");
    await page.fill("#adults", "3");
    await page.waitForFunction(() => location.hash.length > 1);
    const url = page.url();
    const fresh = await context.newPage();
    await fresh.goto(url);
    await expect(fresh.locator("#line-select")).toHaveValue("princess");
    await expect(fresh.locator("#nights")).toHaveValue("10");
    await expect(fresh.locator("#adults")).toHaveValue("3");
  });

  test("specialty dining auto-gratuity math: 2 meals × $80 × 20% = $32 (Carnival)", async ({ page }) => {
    await page.goto(URL);
    await page.selectOption("#line-select", "carnival");
    await page.click("[aria-controls=panel-onboard]");
    await page.fill("#specialty-cost", "80");
    await page.fill("#specialty-meals", "2");
    await expect(page.locator("#result-breakdown")).toContainText("Specialty dining auto-grats");
    await expect(page.locator("#result-breakdown")).toContainText("$32");
  });

  test("HAL with sailing date >= 2026-06-01 uses upcoming $18 standard rate", async ({ page }) => {
    await page.goto(URL);
    await page.selectOption("#line-select", "holland-america");
    await page.fill("#sailing-date", "2026-07-15");
    await page.fill("#nights", "7");
    await page.fill("#adults", "2");
    // 7 × $18 × 2 = $252 daily auto-charge (post-2026-06-01 rate)
    const dailyRow = page.locator("#result-breakdown li", { hasText: "Daily auto-charge" });
    await expect(dailyRow).toContainText("$252");
  });
});
