// Pins for the voyage archive, photos by day, and the "where he is, by the clock" strip
// (plan sections 4.1 and 4.3, admin/claude/plans/jerusha-UPGRADE-PLAN-2026-11.md).
// Clock facts used below: in December, Eastern is UTC-5 and Lahore is UTC+5.
// Run: npx playwright test jerusha-voyage
import { test, expect } from "@playwright/test";
import { open, hasSource } from "./jerusha-open.js";

test.beforeEach(() => { test.skip(!hasSource(), "gitignored payload source not present (run jerusha-payload.mjs extract)"); });

const strip = (page) => page.locator("#rn-strip");

// ---- 4.3 the strip ----

test("strip, between voyages: home clock, countdown, no port window yet", async ({ page }) => {
  await open(page, "2026-11-12T12:00:00Z");
  await expect(strip(page)).toContainText("home clock");
  await expect(strip(page)).toContainText("Ken 7:00 AM");
  await expect(strip(page)).toContainText("Jerusha 5:00 PM");
  await expect(strip(page)).toContainText("departs in 23 days");
  await expect(strip(page)).not.toContainText("Likely in port");
  await expect(strip(page)).not.toContainText("By the schedule");
});

test("strip, the day before sailing: the first port window appears", async ({ page }) => {
  await open(page, "2026-12-04T15:00:00Z");
  await expect(strip(page)).toContainText("departs in 1 day");
  await expect(strip(page)).toContainText("Likely in port next: Roatán, Honduras");
});

test("strip, sea day: says at sea by the schedule, and gives the next port in her clock", async ({ page }) => {
  await open(page, "2026-12-06T18:00:00Z");
  await expect(strip(page)).toContainText("ship’s clock");
  await expect(strip(page)).toContainText("By the schedule: at sea today (Day 2).");
  // 9:00 AM to 6:00 PM Eastern on Mon Dec 7 is Mon 7:00 PM to Tue 4:00 AM in Lahore.
  await expect(strip(page)).toContainText("Likely in port next: Roatán, Honduras, Mon 9:00 AM to 6:00 PM ship’s clock. For Jerusha: Mon 7:00 PM to Tue 4:00 AM. Port hours can change.");
});

test("strip, port day before arrival", async ({ page }) => {
  await open(page, "2026-12-07T12:00:00Z");
  await expect(strip(page)).toContainText("By the schedule: arrives Roatán, Honduras at 9:00 AM ship’s clock (Mon 7:00 PM for Jerusha).");
});

test("strip, in port: until when, in both clocks, and the NEXT port is a different one", async ({ page }) => {
  await open(page, "2026-12-07T16:00:00Z");
  await expect(strip(page)).toContainText("By the schedule: in port at Roatán, Honduras until 6:00 PM ship’s clock (Tue 4:00 AM for Jerusha).");
  await expect(strip(page)).toContainText("Likely in port next: Costa Maya, Mexico");
});

test("strip, after sailing the same day", async ({ page }) => {
  await open(page, "2026-12-08T00:30:00Z");   // Dec 7, 7:30 PM Eastern
  await expect(strip(page)).toContainText("By the schedule: sailed from Roatán, Honduras at 6:00 PM ship’s clock. At sea.");
});

test("strip: no phone fix means no last-seen line", async ({ page }) => {
  await open(page, "2026-12-09T18:00:00Z", { loc: [] });
  await expect(strip(page)).toContainText("By the schedule");
  await expect(strip(page)).not.toContainText("last reported");
});

test("strip: a phone fix shows where and how old", async ({ page }) => {
  await open(page, "2026-12-09T18:00:00Z", { loc: [{ v: 1, lat: 20.44, lon: -86.99, ts: "2026-12-09T15:00:00.000Z" }] });
  await expect(strip(page)).toContainText("Ken’s phone last reported near Cozumel, Mexico, 3 hr ago.");
});

test("strip: a fix far from any known place gives coordinates, not a guessed name", async ({ page }) => {
  await open(page, "2026-12-09T18:00:00Z", { loc: [{ v: 1, lat: 10.0, lon: -50.0, ts: "2026-12-09T17:40:00.000Z" }] });
  await expect(strip(page)).toContainText("last reported at 10.00, -50.00, 20 min ago.");
});

test("strip: port hours corrected in the overrides file are used", async ({ page }) => {
  await open(page, "2026-12-07T16:00:00Z", { overrides: { voyages: { "world-america-dec": { days: { "3": { dep: "16:30" } } } } } });
  await expect(strip(page)).toContainText("until 4:30 PM ship’s clock");
});

// ---- 4.1 the archive ----

test("archive: past voyages sit in one closed Archive, each kept whole", async ({ page }) => {
  await open(page, "2026-11-12T12:00:00Z");
  const arch = page.locator("#voy-archive");
  await expect(arch).toHaveCount(1);
  await expect(arch.locator("summary").first()).toContainText("ARCHIVE · 2 past voyages");
  expect(await arch.evaluate((d) => d.open)).toBe(false);
  await arch.locator("summary").first().click();
  await expect(arch).toContainText("Anthem of the Seas");
  await expect(arch).toContainText("Norwegian Getaway");
  // Alaska keeps all eight days, and Getaway all five.
  const alaska = arch.locator("details.voy-pastv", { hasText: "Anthem of the Seas" });
  await expect(alaska.locator("details.voy-row")).toHaveCount(8);
  await expect(arch.locator("details.voy-pastv", { hasText: "Norwegian Getaway" }).locator("details.voy-row")).toHaveCount(5);
  await expect(page.locator("#voy-note")).toContainText("kept whole in the Archive");
  await expect(page.locator("#voy-note")).not.toContainText("Alaska is all still here");
});

test("archive: staying open survives a re-render", async ({ page }) => {
  await open(page, "2026-11-12T12:00:00Z");
  const arch = page.locator("#voy-archive");
  await arch.locator("summary").first().click();
  await page.locator("#wx-unit").click();          // forces refresh() -> renderVoyage()
  expect(await page.locator("#voy-archive").evaluate((d) => d.open)).toBe(true);
});

test("archive: nothing is archived before the first voyage ends", async ({ page }) => {
  await open(page, "2026-06-20T12:00:00Z");
  await expect(page.locator("#voy-archive")).toHaveCount(0);
});

// ---- 4.1 photos by day ----

const MEDIA = [
  { v: 1, id: "sitka-1", kind: "photo", mime: "image/webp", lat: null, lon: null, day: "2026-07-01", ts: "2026-07-01T20:00:00.000Z" },
  // Tagged to the December sailing, taken in Miami. It must NOT show under another voyage's Miami day.
  { v: 1, id: "miami-dec", kind: "photo", mime: "image/webp", lat: 25.7788, lon: -80.1779, day: "2026-12-05", ts: "2026-12-05T20:00:00.000Z" },
];
async function dayBox(page, voyageText, dayIndex) {
  const arch = page.locator("#voy-archive");
  await arch.evaluate((d) => { d.open = true; d.querySelectorAll("details").forEach((x) => { x.open = true; }); });
  const row = arch.locator("details.voy-pastv", { hasText: voyageText }).locator("details.voy-row").nth(dayIndex);
  await row.locator(".voy-phbtn").click();
  return row.locator(".voy-phbody");
}

test("photos by day: an archived day shows its own tagged photo", async ({ page }) => {
  await open(page, "2026-11-12T12:00:00Z", { media: MEDIA });
  const box = await dayBox(page, "Anthem of the Seas", 2);      // day 3, Sitka, 2026-07-01
  // The stub has no real ciphertext, so the one item resolves to the "could not be opened" marker: exactly one.
  await expect(box.locator("span.muted")).toHaveCount(1);
  await expect(box).toContainText("one photo could not be opened");
});

test("photos by day: a day with none says so", async ({ page }) => {
  await open(page, "2026-11-12T12:00:00Z", { media: MEDIA });
  const box = await dayBox(page, "Anthem of the Seas", 1);      // day 2, at sea
  await expect(box).toHaveText("No photos from this day yet.");
});

test("photos by day: a photo tagged to one sailing does not leak into another voyage's same port", async ({ page }) => {
  await open(page, "2026-11-12T12:00:00Z", { media: MEDIA });
  const box = await dayBox(page, "Norwegian Getaway", 0);       // Getaway day 1, Miami, 2026-08-24
  await expect(box).toHaveText("No photos from this day yet.");
});

test("photos by day: an unread list is not reported as an empty day", async ({ page }) => {
  await open(page, "2026-11-12T12:00:00Z", { mediaStatus: 500 });
  const box = await dayBox(page, "Anthem of the Seas", 2);
  await expect(box).toContainText("Couldn’t load photos just now");
  await expect(box).not.toContainText("No photos");
});
