// Data-key ring pins for the Jerusha app (admin/jerusha-worker/ROTATION-RUNBOOK.md).
//
// The claim under test: the REAL page opens notes and photos that the Node tools sealed, with whichever key in
// its ring fits, and seals new notes with the first key only. The ciphertext here is made by
// admin/jerusha-worker/jerusha-keys.mjs, the same module the rotate and re-key tools use, so if the page and
// the tools ever disagree about a format, this file fails.
//
// The page source is served with a made-up ring swapped in; the file on disk is never changed. Every key,
// passphrase and note below is a fixture.
// Run: npx playwright test jerusha-keys
import { test, expect } from "@playwright/test";
import fs from "node:fs";
import * as K from "../../admin/jerusha-worker/jerusha-keys.mjs";
import { SRC_REL, SRC_ABS, TESTPASS, hasSource } from "./jerusha-open.js";

const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64");
const rec = async (key, id, text, ts, sender = "me") => { const e = await K.encNote(key, text); return { v: 1, id, sender, ts, iv: e.iv, ct: e.ct }; };

// opts: ring (array of base64 keys, or null to serve the source as shipped), notes(since) -> array,
//       media [{meta, bytes}], cache (array seeded into the device's note cache), posts / gets (collectors)
async function openWith(page, opts) {
  const src = fs.readFileSync(SRC_ABS, "utf8");
  const salt = K.readConst(src, "NOTES_SALT");
  const body = opts.ring ? K.writeRing(src, opts.ring) : src;
  await page.addInitScript((p) => { window.__JPW = p; }, TESTPASS);
  if (opts.cache) await page.addInitScript((c) => { try { localStorage.setItem("jerusha:us:cache", c); } catch (e) {} }, JSON.stringify(opts.cache));
  await page.route("**" + SRC_REL, (r) => r.fulfill({ status: 200, contentType: "text/html; charset=utf-8", body }));
  await page.route("**/*.workers.dev/**", async (r) => {
    const q = r.request(), u = new URL(q.url());
    const json = (o, status = 200) => r.fulfill({ status, contentType: "application/json", body: JSON.stringify(o) });
    if (u.pathname === "/notes" && q.method() === "GET") {
      const since = u.searchParams.get("since") || "";
      if (opts.gets) opts.gets.push(since);
      return json({ notes: opts.notes ? opts.notes(since) : [], deletions: [] });
    }
    if (u.pathname === "/notes" && q.method() === "POST") {
      const b = JSON.parse(q.postData());
      if (opts.posts) opts.posts.push(b);
      return json({ ok: true, id: "posted-" + (opts.posts ? opts.posts.length : 0), ts: new Date().toISOString() }, 201);
    }
    if (u.pathname === "/media") return json({ media: (opts.media || []).map((m) => m.meta) });
    if (u.pathname.startsWith("/media/")) {
      const m = (opts.media || []).find((x) => x.meta.id === decodeURIComponent(u.pathname.slice(7)));
      return m ? r.fulfill({ status: 200, contentType: "application/octet-stream", body: Buffer.from(m.bytes) }) : json({ error: "not found" }, 404);
    }
    if (u.pathname === "/loc") return json({ points: [] });
    return json({ error: "not found" }, 404);
  });
  await page.route("**/api.open-meteo.com/**", (r) => r.fulfill({ status: 503, body: "" }));
  await page.route("**/api.weather.gov/**", (r) => r.fulfill({ status: 404, contentType: "application/problem+json", body: "{}" }));
  await page.goto(SRC_REL, { waitUntil: "load" });
  return { salt };
}
const pageSalt = () => K.readConst(fs.readFileSync(SRC_ABS, "utf8"), "NOTES_SALT");

test.beforeEach(() => { test.skip(!hasSource(), "gitignored payload source not present (run jerusha-payload.mjs extract)"); });

test("as shipped, with an empty ring, the page still derives its key from the passphrase", async ({ page }) => {
  // Once a rotation has filled the ring, the page on disk never takes this path again, so there is nothing to pin.
  test.skip(K.readRing(fs.readFileSync(SRC_ABS, "utf8")).length > 0, "the page has been rotated: the empty-ring path no longer ships");
  const derived = await K.deriveKey(TESTPASS, pageSalt());
  const n = await rec(derived, "n1", "sealed the old way", "2026-01-01T00:00:00.000Z");
  await openWith(page, { ring: null, notes: () => [n] });
  await page.click('.wtab[data-t="us"]');
  await expect(page.locator("#us-thread")).toContainText("sealed the old way");
});

test("with a ring, old-key and new-key notes both open, and a new note is sealed with the first key only", async ({ page }) => {
  const fresh = K.newKeyB64(), legacy = K.b64e(await K.deriveRaw(TESTPASS, pageSalt()));
  const kFresh = await K.importRaw(fresh), kLegacy = await K.importRaw(legacy);
  const posts = [];
  const notes = [await rec(kLegacy, "n-old", "from before the change", "2026-01-01T00:00:00.000Z"), await rec(kFresh, "n-new", "from after the change", "2026-01-02T00:00:00.000Z", "jerusha")];
  await openWith(page, { ring: [fresh, legacy], notes: (since) => (since ? [] : notes), posts });
  await page.click('.wtab[data-t="us"]');
  const thread = page.locator("#us-thread");
  await expect(thread).toContainText("from before the change");
  await expect(thread).toContainText("from after the change");
  await expect(thread).not.toContainText("[locked]");
  // The passphrase is not kept in a global once the ring is in use.
  expect(await page.evaluate(() => window.__JPW)).toBeNull();

  await page.fill("#us-text", "typed in the test");
  await page.click("#us-send");
  await expect.poll(() => posts.length).toBe(1);
  expect((await K.decNoteAny([kFresh], posts[0].iv, posts[0].ct)).text).toBe("typed in the test");
  await expect(K.decNoteAny([kLegacy], posts[0].iv, posts[0].ct)).rejects.toThrow(/no key/);
});

test("after a re-key, a device holding the old ciphertext in its cache takes the server's copy once", async ({ page }) => {
  const fresh = K.newKeyB64(), kFresh = await K.importRaw(fresh);
  const kOld = await K.importRaw(K.newKeyB64()); // a key this page no longer has
  const ts = "2026-01-01T00:00:00.000Z";
  const stale = await rec(kOld, "n1", "our first note", ts), rekeyed = await rec(kFresh, "n1", "our first note", ts);
  const gets = [];
  await openWith(page, { ring: [fresh], cache: [{ id: "n1", sender: "me", ts, iv: stale.iv, ct: stale.ct }], notes: (since) => (since ? [] : [rekeyed]), gets });
  await page.click('.wtab[data-t="us"]');
  const thread = page.locator("#us-thread");
  await expect(thread).toContainText("our first note");
  await expect(thread).not.toContainText("[locked]");
  const cached = JSON.parse(await page.evaluate(() => localStorage.getItem("jerusha:us:cache")));
  expect(cached).toHaveLength(1);
  expect(cached[0].ct).toBe(rekeyed.ct);
  expect(gets.filter((s) => s === "").length, "one full fetch to heal, no more").toBe(1);
});

test("a note no key opens stays shown as locked, is never dropped, and is asked about only once", async ({ page }) => {
  const fresh = K.newKeyB64();
  const kLost = await K.importRaw(K.newKeyB64());
  const ts = "2026-01-01T00:00:00.000Z";
  const lost = await rec(kLost, "n1", "unreachable", ts);
  const gets = [];
  await openWith(page, { ring: [fresh], cache: [{ id: "n1", sender: "me", ts, iv: lost.iv, ct: lost.ct }], notes: (since) => (since ? [] : [lost]), gets });
  await page.click('.wtab[data-t="us"]');
  await expect(page.locator("#us-thread")).toContainText("[locked]");
  await expect.poll(() => gets.filter((s) => s === "").length).toBe(1);
  // provoke more renders: the heal must not fire again, and the record must still be in the cache
  await page.click('.wtab[data-t="now"]'); await page.click('.wtab[data-t="us"]');
  await page.waitForTimeout(1500);
  expect(gets.filter((s) => s === "").length).toBe(1);
  const cached = JSON.parse(await page.evaluate(() => localStorage.getItem("jerusha:us:cache")));
  expect(cached).toHaveLength(1);
  expect(cached[0].ct).toBe(lost.ct);
});

test("photos open with whichever key fits: an old-key chunked blob and a new-key small one", async ({ page }) => {
  const fresh = K.newKeyB64(), legacy = K.b64e(await K.deriveRaw(TESTPASS, pageSalt()));
  const mid = Math.floor(PNG.length / 2);
  const oldBlob = await K.encBytesLike(await K.importRaw(legacy), { chunked: true, chunks: [new Uint8Array(PNG.subarray(0, mid)), new Uint8Array(PNG.subarray(mid))] });
  const newBlob = await K.encBytesLike(await K.importRaw(fresh), { chunked: false, chunks: [new Uint8Array(PNG)] });
  const meta = (id, day) => ({ v: 1, id, kind: "photo", mime: "image/png", lat: 57.05, lon: -135.33, day, ts: day + "T00:00:00Z" });
  await openWith(page, { ring: [fresh, legacy], media: [{ meta: meta("old1", "2026-07-01"), bytes: oldBlob }, { meta: meta("new1", "2026-07-02"), bytes: newBlob }] });
  await page.click('.wtab[data-t="gallery"]');
  const first = page.locator(".jgm-swiper .jg-img").first();
  await first.waitFor({ state: "visible", timeout: 20000 });
  // every slide that has loaded did so by decrypting; none may have fallen to the error state
  await expect.poll(async () => page.locator('.jgm-swiper [data-mid][data-loaded="1"]').count(), { timeout: 20000 }).toBeGreaterThanOrEqual(1);
  const loaded = await page.evaluate(async () => {
    const out = {};
    for (const sl of document.querySelectorAll(".jgm-swiper [data-mid]")) out[sl.getAttribute("data-mid")] = sl.getAttribute("data-loaded") === "1" ? "loaded" : (sl.textContent || "").trim();
    return out;
  });
  expect(Object.values(loaded)).not.toContain("could not load");
  expect(Object.keys(loaded).sort()).toEqual(["new1", "old1"]);
});
