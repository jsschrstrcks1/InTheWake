// Render smoke test for the Jerusha "Our photos & videos" gallery.
//
// This is the safety net the gallery saga (PRs #1965-#1989) lacked: every fix was
// verified only by `node --check` + round-trip decrypt, never RENDERED — so blank
// boxes, crops, and runaway heights all shipped and were caught only by the operator
// on-device. This loads the *plaintext payload source* (admin/jerusha-src/, gitignored
// — so this test runs only on the M4 where edits happen), stubs the worker /media with
// a real test-ciphertext image, opens the Gallery tab, and asserts the photo renders at
// a sane height and the tap-to-enlarge lightbox opens.
//
// Run: JERUSHA (no secrets needed) -> `npx playwright test jerusha-gallery`
import { test, expect } from "@playwright/test";
import { webcrypto as wc } from "node:crypto";
import fs from "node:fs";

const SRC_REL = "/admin/jerusha-src/alaska-trip.payload.html";
const SRC_ABS = "admin/jerusha-src/alaska-trip.payload.html";
const TESTPASS = "render-test-passphrase";          // NOT the real one; only for this stub
const NOTES_SALT = "amVydXNoYS1ub3Rlcy12MQ==";       // _notesKey salt baked in the payload
// 1x1 red PNG
const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64");

async function encMedia(bytes) {
  const bk = await wc.subtle.importKey("raw", new TextEncoder().encode(TESTPASS), "PBKDF2", false, ["deriveKey"]);
  const key = await wc.subtle.deriveKey({ name: "PBKDF2", salt: Buffer.from(NOTES_SALT, "base64"), iterations: 150000, hash: "SHA-256" }, bk, { name: "AES-GCM", length: 256 }, false, ["encrypt"]);
  const iv = wc.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await wc.subtle.encrypt({ name: "AES-GCM", iv }, key, bytes));
  return Buffer.concat([Buffer.from(iv), Buffer.from(ct)]);
}

test("Jerusha gallery: photo renders at a sane height + lightbox opens", async ({ page }) => {
  test.skip(!fs.existsSync(SRC_ABS), "gitignored payload source not present (run `jerusha-payload.mjs extract` on the M4)");
  await page.addInitScript((p) => { window.__JPW = p; }, TESTPASS);
  const ct = await encMedia(PNG);
  await page.route("**/media", (r) => r.fulfill({ status: 200, contentType: "application/json",
    body: JSON.stringify({ media: [{ v: 1, id: "t1", kind: "photo", mime: "image/png", lat: 57.05, lon: -135.33, day: "2026-07-01", ts: "2026-07-01T00:00:00Z" }] }) }));
  await page.route("**/media/*", (r) => r.fulfill({ status: 200, contentType: "application/octet-stream", body: ct }));
  await page.route("**/notes**", (r) => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ notes: [], deletions: [] }) }));
  await page.route("**/loc**", (r) => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ points: [] }) }));

  await page.goto(SRC_REL, { waitUntil: "load" });
  await page.click('.wtab[data-t="gallery"]');

  const img = page.locator(".jgm-swiper .jg-img").first();
  await img.waitFor({ state: "visible", timeout: 20000 });
  const box = await img.boundingBox();
  expect(box, "gallery image has a layout box").toBeTruthy();
  expect(box.height, "gallery image not collapsed/blank").toBeGreaterThan(120);
  expect(box.height, "gallery image not autoHeight-runaway").toBeLessThan(460);

  await img.click();
  const lb = page.locator("#jlb");
  await lb.waitFor({ state: "visible", timeout: 5000 });
  await expect(page.locator("#jlb img")).toBeVisible();
});
