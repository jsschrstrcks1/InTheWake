// Pins for Ken's calendar in her app (plan section 4.4, admin/claude/plans/jerusha-UPGRADE-PLAN-2026-11.md).
// Fixtures hold made-up events only. The clock is fixed at Sun 2026-11-15 15:00 UTC unless a test says
// otherwise: 10:00 AM Eastern, 8:00 PM in Lahore. Eastern is UTC-5 then, Lahore UTC+5.
// Run: npx playwright test jerusha-calendar
import { test, expect } from "@playwright/test";
import fs from "node:fs";
import { open, hasSource } from "./jerusha-open.js";

const BASIC = fs.readFileSync("tests/playwright/fixtures/jerusha-cal-basic.ics", "utf8");
const ODD = fs.readFileSync("tests/playwright/fixtures/jerusha-cal-odd.ics", "utf8");
const NOW = "2026-11-15T15:00:00Z";

test.beforeEach(() => { test.skip(!hasSource(), "gitignored payload source not present (run jerusha-payload.mjs extract)"); });

async function calPane(page) {
  await page.locator('.wtab[data-t="cal"]').click();
  return page.locator("#pane-cal");
}
const titled = (pane, title) => pane.locator(".cal-ev").filter({ has: pane.page().locator(".cal-t", { hasText: new RegExp("^" + title + "( ·.*)?$") }) });

test("weekly event: both clocks on one line, and the excluded date is left out", async ({ page }) => {
  await open(page, NOW, { cal: { body: BASIC } });
  const pane = await calPane(page);
  const worship = titled(pane, "Morning worship");
  // Sundays in the window: Nov 15, 22 (excluded by EXDATE), 29, Dec 6, 13, 20. Dec 27 starts after the window ends.
  await expect(worship).toHaveCount(5);
  await expect(worship.first()).toContainText("Ken 10:30 AM to 12:00 PM · Jerusha Sun 8:30 PM to Sun 10:00 PM");
  await expect(worship.first()).toContainText("Fixture Hall");
  await expect(pane).not.toContainText("This alarm must be ignored");
});

test("cancelled events are left out; a moved occurrence replaces the one it names", async ({ page }) => {
  await open(page, NOW, { cal: { body: BASIC } });
  const pane = await calPane(page);
  await expect(pane).toContainText("Morning worship");
  await expect(pane).not.toContainText("Cancelled lunch");
  await expect(titled(pane, "Midweek study moved earlier")).toHaveCount(1);
  await expect(titled(pane, "Midweek study moved earlier")).toContainText("Ken 6:00 PM to 7:00 PM");
  // Wednesdays Nov 18 (replaced), 25, Dec 2, 9, 16, 23.
  await expect(titled(pane, "Midweek study")).toHaveCount(5);
});

test("all-day, COUNT, yearly, a folded line, and an event that crosses midnight for her only", async ({ page }) => {
  await open(page, NOW, { cal: { body: BASIC } });
  const pane = await calPane(page);
  await expect(titled(pane, "Day off")).toContainText("All day");
  await expect(titled(pane, "Short series")).toHaveCount(2);
  await expect(titled(pane, "Yearly marker")).toHaveCount(1);
  const late = pane.locator(".cal-ev", { hasText: "long enough to be folded across two lines" });
  await expect(late).toHaveCount(1);
  // 03:30 UTC Mon is 10:30 PM Sun for Ken and 8:30 AM Mon for Jerusha.
  await expect(late).toContainText("Ken 10:30 PM to 11:30 PM · Jerusha Mon 8:30 AM to Mon 9:30 AM");
});

test("every view says when the calendar was fetched and whose clocks it shows", async ({ page }) => {
  await open(page, NOW, { cal: { body: BASIC } });
  const pane = await calPane(page);
  await expect(pane.locator(".cal-stamp")).toContainText("As of ");
  await expect(pane.locator(".cal-stamp")).toContainText("Ken’s home clock and Jerusha’s");
});

test("a repeat rule it cannot expand is named, not dropped and not guessed", async ({ page }) => {
  await open(page, NOW, { cal: { body: ODD } });
  const pane = await calPane(page);
  await expect(pane.locator(".cal-odd")).toContainText("First Monday meeting (first on Mon, Jan 5)");
  await expect(pane.locator(".cal-ev", { hasText: "First Monday meeting" })).toHaveCount(0);
});

test("a time with no zone, or an unknown zone, is flagged as unclear", async ({ page }) => {
  await open(page, NOW, { cal: { body: ODD } });
  const pane = await calPane(page);
  await expect(pane.locator(".cal-ev", { hasText: "Floating time event" })).toContainText("time zone unclear");
  await expect(pane.locator(".cal-ev", { hasText: "Unknown zone event" })).toContainText("time zone unclear");
});

test("an empty calendar says what the calendar says, never that he is free", async ({ page }) => {
  await open(page, NOW, { cal: { body: "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nEND:VCALENDAR\r\n" } });
  const pane = await calPane(page);
  await expect(pane).toContainText("Nothing on Ken’s shared calendar in the next 6 weeks");
  await expect(pane).toContainText("It does not mean he is free");
});

test("not connected (404) says so", async ({ page }) => {
  await open(page, NOW, {});
  const pane = await calPane(page);
  await expect(pane).toContainText("Ken’s calendar isn’t connected yet.");
});

test("a feed that cannot be read, with no copy, is not shown as an empty week", async ({ page }) => {
  await open(page, NOW, { cal: { status: 502 } });
  const pane = await calPane(page);
  await expect(pane).toContainText("Couldn’t read Ken’s calendar just now");
  await expect(pane).toContainText("This is not an empty week");
  await expect(pane).not.toContainText("Nothing on Ken’s shared calendar");
});

test("something that is not a calendar is treated as unreadable", async ({ page }) => {
  await open(page, NOW, { cal: { body: "<html>sign in</html>" } });
  const pane = await calPane(page);
  await expect(pane).toContainText("Couldn’t read Ken’s calendar just now");
});

test("when a refresh fails, the last copy is shown and marked as the last copy", async ({ page }) => {
  let mode = "ok";
  await open(page, NOW, { cal: () => (mode === "ok" ? { body: BASIC } : { status: 502 }) });
  let pane = await calPane(page);
  await expect(titled(pane, "Morning worship")).toHaveCount(5);
  // The saved copy is encrypted on the phone: the title must not be readable in localStorage.
  await expect.poll(() => page.evaluate(() => localStorage.getItem("jerusha:cal:ken"))).toBeTruthy();   // the save is async
  const raw = await page.evaluate(() => localStorage.getItem("jerusha:cal:ken"));
  expect(raw).not.toContain("Morning worship");
  mode = "down";
  await page.reload();
  pane = await calPane(page);
  await expect(titled(pane, "Morning worship")).toHaveCount(5);
  await expect(pane.locator(".cal-stamp")).toContainText("couldn’t refresh just now, so this is the last copy");
});

test("switching the calendar off (404) removes the saved copy from the phone", async ({ page }) => {
  let mode = "ok";
  await open(page, NOW, { cal: () => (mode === "ok" ? { body: BASIC } : null) });
  let pane = await calPane(page);
  await expect(titled(pane, "Morning worship")).toHaveCount(5);
  await expect.poll(() => page.evaluate(() => localStorage.getItem("jerusha:cal:ken"))).toBeTruthy();
  mode = "off";
  await page.reload();
  pane = await calPane(page);
  await expect(pane).toContainText("isn’t connected yet");
  await expect(pane).not.toContainText("Morning worship");
  expect(await page.evaluate(() => localStorage.getItem("jerusha:cal:ken"))).toBeNull();
});

test("the strip reads the calendar: next, then now", async ({ page }) => {
  await open(page, NOW, { cal: { body: BASIC } });
  await expect(page.locator("#rn-strip")).toContainText("Next on Ken’s calendar: Morning worship, Sun 10:30 AM his time (Sun 8:30 PM for Jerusha).", { timeout: 15000 });
});

test("the strip says what is on his calendar right now", async ({ page }) => {
  await open(page, "2026-11-15T16:00:00Z", { cal: { body: BASIC } });
  await expect(page.locator("#rn-strip")).toContainText("On Ken’s calendar now: Morning worship, until 12:00 PM his time (Sun 10:00 PM for Jerusha).", { timeout: 15000 });
});

test("the page asks the worker for who=ken and nothing else about calendars", async ({ page }) => {
  const calls = [];
  await open(page, NOW, { cal: { body: BASIC }, calls });
  await calPane(page);
  await expect.poll(() => calls.filter((c) => c.startsWith("/cal")).length).toBeGreaterThan(0);
  expect(calls.filter((c) => c.startsWith("/cal")).every((c) => c === "/cal?who=ken")).toBe(true);
});
