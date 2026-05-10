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

  test("Carnival toddler exemption: setting age=1 drops daily charge from $357 to $238", async ({ page }) => {
    // Regression for the careful-not-clever audit finding (2026-05-09):
    // entering a child count without the per-age UI was synthesizing all kids as
    // age 99 (full-fare), overcharging Carnival/Norwegian/MSC families with toddlers
    // by ~$119 on a 7-night standard cabin. After the fix, the family enters the
    // toddler's age and the calc applies the line's exemptUnderAge rule.
    await page.goto(URL);
    await page.selectOption("#line-select", "carnival");
    await page.selectOption("#cabin-tier", "standard");
    await page.fill("#nights", "7");
    await page.fill("#adults", "2");
    await page.fill("#children", "1");

    // Default age is 99 (safe-side: charged like an adult). Confirm the
    // pre-fix behavior is still the conservative default for users who don't
    // touch the new age input.
    const dailyRow = page.locator("#result-breakdown li", { hasText: "Daily auto-charge" });
    await expect(dailyRow).toContainText("$357"); // 7 × $17 × 3 charged guests

    // Now enter a real toddler age. Carnival exempts under 2.
    await page.fill('input[data-child-index="0"]', "1");
    await expect(dailyRow).toContainText("$238"); // 7 × $17 × 2 charged guests (toddler exempt)

    // The exemption note should mention Carnival's under-2 rule so the user
    // understands why the number changed.
    await expect(page.locator(".children-ages__note")).toContainText("under 2");
  });

  test("Costa region picker: switching to Med flips currency to EUR and rate to €11", async ({ page }) => {
    // Regression for the careful-not-clever audit P1 #2 (2026-05-09): Costa's
    // tool was showing only the South America USD $14.50 rate; Mediterranean
    // sailings (the dominant Costa deployment) actually price at EUR 11/night.
    // After the fix, the form exposes a region picker for multi-region lines.
    await page.goto(URL);
    await page.selectOption("#line-select", "costa");

    // Region picker should be visible only on multi-region lines.
    const regionSelect = page.locator("#region-select");
    await expect(regionSelect).toBeVisible();

    // Default region is South America (USD) — daily charge for 7 × 2 = $203.
    const dailyRow = page.locator("#result-breakdown li", { hasText: "Daily auto-charge" });
    await expect(dailyRow).toContainText("$203");

    // Switch to Mediterranean / Northern Europe (EUR). Daily charge becomes
    // 7 × 2 × €11 = €154, displayed with the euro symbol.
    await page.selectOption("#region-select", "med-northern-europe");
    await expect(dailyRow).toContainText("€154");
    // The headline should explicitly say euros, not dollars.
    await expect(page.locator("#result-headline")).toContainText("€");
  });

  test("MSC three-region picker: standard cabin rate updates with region", async ({ page }) => {
    await page.goto(URL);
    await page.selectOption("#line-select", "msc");
    await expect(page.locator("#region-select")).toBeVisible();
    const dailyRow = page.locator("#result-breakdown li", { hasText: "Daily auto-charge" });

    // Caribbean/Alaska USD $17 standard × 7 × 2 = $238
    await page.selectOption("#region-select", "caribbean-alaska");
    await expect(dailyRow).toContainText("$238");

    // Mediterranean EUR 12 × 7 × 2 = €168
    await page.selectOption("#region-select", "med-northern-europe");
    await expect(dailyRow).toContainText("€168");

    // South America USD $19 × 7 × 2 = $266
    await page.selectOption("#region-select", "south-america");
    await expect(dailyRow).toContainText("$266");
  });

  test("region picker is hidden on single-region lines", async ({ page }) => {
    await page.goto(URL);
    await page.selectOption("#line-select", "carnival");
    // Carnival has no regions array — the picker (and its label) should be hidden.
    await expect(page.locator("#region-select")).toBeHidden();
    await expect(page.locator("#region-label")).toBeHidden();
  });

  test("Costa half-rate: family with one school-age child on Med EUR sailing pays €192.50, not €231", async ({ page }) => {
    // Regression for the careful-not-clever audit P-future (2026-05-09):
    // Costa's tipping model has tiered child rates — under 4 free, ages 4-14
    // half-rate, 15+ full. Without the ageMultipliers schema extension, a
    // family of 2 adults + 1 child age 8 on a 7-night Costa Med sailing was
    // billed (2 + 1) × 7 × €11 = €231 (full rate for the 8-year-old).
    // Correct: (2 + 0.5) × 7 × €11 = €192.50.
    await page.goto(URL);
    await page.selectOption("#line-select", "costa");
    await page.selectOption("#region-select", "med-northern-europe");
    await page.fill("#nights", "7");
    await page.fill("#adults", "2");
    await page.fill("#children", "1");
    await page.fill('input[data-child-index="0"]', "8");

    const dailyRow = page.locator("#result-breakdown li", { hasText: "Daily auto-charge" });
    await expect(dailyRow).toContainText("€192.50");

    // Note should explain the tiered model so families understand why the number
    // dropped from the default-99 baseline.
    await expect(page.locator(".children-ages__note")).toContainText(/Half[- ]rate/i);
  });

  test("Virgin Voyages prepaid vs. onboard: cabin tier toggles between $20 and $22", async ({ page }) => {
    // Regression for the careful-not-clever audit P2 (2026-05-09): Virgin
    // Voyages charges $20/night when gratuities are pre-paid before sailing
    // and $22/night when posted onboard. The tool was hard-coded to the
    // prepaid rate; users planning to pay onboard saw the wrong number.
    await page.goto(URL);
    await page.selectOption("#line-select", "virgin-voyages");
    await page.fill("#nights", "7");
    await page.fill("#adults", "2");
    await page.fill("#children", "0");

    const dailyRow = page.locator("#result-breakdown li", { hasText: "Daily auto-charge" });

    // Default: pre-paid — $20 × 7 × 2 = $280
    await page.selectOption("#cabin-tier", "standard");
    await expect(dailyRow).toContainText("$280");

    // Switch to posted-onboard — $22 × 7 × 2 = $308
    await page.selectOption("#cabin-tier", "onboard");
    await expect(dailyRow).toContainText("$308");

    // Single-region line — region picker stays hidden.
    await expect(page.locator("#region-select")).toBeHidden();
  });
});
