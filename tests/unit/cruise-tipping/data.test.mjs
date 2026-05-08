// tests/unit/cruise-tipping/data.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { loadAll, getLine, listLines } from "../../../assets/js/tools/cruise-tipping-calculator/data.js";

test("loadAll fetches brands and tipping configs", async () => {
  globalThis.fetch = async (url) => {
    if (url.endsWith("/brands.json")) {
      return new Response(JSON.stringify({
        brands: [{ id: "carnival", label: "Carnival", active: true }, { id: "regent", label: "Regent", active: true }]
      }));
    }
    if (url.endsWith("/tipping/carnival.json")) {
      return new Response(JSON.stringify({ lineId: "carnival", displayName: "Carnival", bundledInFare: false }));
    }
    if (url.endsWith("/tipping/regent.json")) {
      return new Response(JSON.stringify({ lineId: "regent", displayName: "Regent", bundledInFare: true }));
    }
    throw new Error("Unexpected fetch: " + url);
  };
  await loadAll();
  assert.equal(listLines().length, 2);
  assert.equal(getLine("carnival").bundledInFare, false);
  assert.equal(getLine("regent").bundledInFare, true);
});

test("getLine returns null for unknown slug", async () => {
  assert.equal(getLine("unknown"), null);
});

test("loadAll against real on-disk files yields 15 lines", async () => {
  const root = resolve(import.meta.dirname, "../../..");
  globalThis.fetch = async (url) => {
    const path = url.startsWith("/") ? resolve(root, "." + url) : url;
    return new Response(readFileSync(path, "utf-8"));
  };
  // Reset module state — reimport.
  const mod = await import("../../../assets/js/tools/cruise-tipping-calculator/data.js?v=" + Date.now());
  await mod.loadAll();
  const lines = mod.listLines();
  // 15 lines per brands.json + tipping/ folder.
  // (Assert >= 15 in case brands.json grows; the tipping folder is the floor.)
  const tippingSlugs = lines.map(l => l.lineId).sort();
  const expected = ["carnival","celebrity","costa","cunard","explora-journeys","holland-america","msc","norwegian","oceania","princess","regent","royal-caribbean","seabourn","silversea","virgin-voyages"].sort();
  for (const slug of expected) {
    assert.ok(tippingSlugs.includes(slug), `expected ${slug} loaded`);
  }
});
