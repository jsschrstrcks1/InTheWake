// Render smoke test for the Jerusha "Our photos & videos" gallery.
// Loads the plaintext payload source (gitignored, M4-only -> test.skips elsewhere),
// stubs the worker /media with a real test-ciphertext image in the CHUNKED (JCM1)
// format so the chunked decoder is exercised in a real browser, opens the Gallery
// tab, and asserts the photo renders at a sane height + the lightbox opens.
// Run: npx playwright test jerusha-gallery
import { test, expect } from "@playwright/test";
import { webcrypto as wc } from "node:crypto";
import fs from "node:fs";

const SRC_REL = "/admin/jerusha-src/alaska-trip.payload.html";
const SRC_ABS = "admin/jerusha-src/alaska-trip.payload.html";
const TESTPASS = "render-test-passphrase";
const NOTES_SALT = "amVydXNoYS1ub3Rlcy12MQ==";
const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64");

async function key() {
  const bk = await wc.subtle.importKey("raw", new TextEncoder().encode(TESTPASS), "PBKDF2", false, ["deriveKey"]);
  return wc.subtle.deriveKey({ name: "PBKDF2", salt: Buffer.from(NOTES_SALT, "base64"), iterations: 150000, hash: "SHA-256" }, bk, { name: "AES-GCM", length: 256 }, false, ["encrypt"]);
}
// CHUNKED (JCM1): split into 2 pieces to exercise the multi-chunk decode path
async function encMediaChunked(bytes) {
  const k = await key();
  const mid = Math.max(1, Math.floor(bytes.length / 2));
  const pieces = [bytes.subarray(0, mid), bytes.subarray(mid)];
  const cts = [], hdr = { c: [] };
  for (const p of pieces) {
    const iv = wc.getRandomValues(new Uint8Array(12));
    const ct = new Uint8Array(await wc.subtle.encrypt({ name: "AES-GCM", iv }, k, p));
    cts.push(Buffer.from(ct)); hdr.c.push({ i: Buffer.from(iv).toString("base64"), n: ct.length });
  }
  const hj = Buffer.from(JSON.stringify(hdr)); const hl = Buffer.alloc(4); hl.writeUInt32LE(hj.length, 0);
  return Buffer.concat([Buffer.from([0x4A, 0x43, 0x4D, 0x31]), hl, hj, ...cts]);
}

test("Jerusha gallery: chunked photo renders at a sane height + lightbox opens", async ({ page }) => {
  test.skip(!fs.existsSync(SRC_ABS), "gitignored payload source not present (run jerusha-payload.mjs extract on the M4)");
  await page.addInitScript((p) => { window.__JPW = p; }, TESTPASS);
  const ct = await encMediaChunked(PNG);
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
  expect(box.height, "not collapsed/blank").toBeGreaterThan(120);
  expect(box.height, "not autoHeight-runaway").toBeLessThan(460);
  await img.click();
  await page.locator("#jlb").waitFor({ state: "visible", timeout: 5000 });
  await expect(page.locator("#jlb img")).toBeVisible();
});
