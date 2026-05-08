// tests/unit/cruise-tipping/state.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { createState } from "../../../assets/js/tools/cruise-tipping-calculator/state.js";
import {
  encodeHash,
  decodeHash,
  saveToStorage,
  loadFromStorage,
  clearStorage
} from "../../../assets/js/tools/cruise-tipping-calculator/persist.js";

test("createState defaults", () => {
  const s = createState();
  assert.equal(s.get().nights, 7);
  assert.equal(s.get().adults, 2);
  assert.equal(s.get().cabinTier, "standard");
});

test("update emits to subscribers", () => {
  const s = createState();
  let calls = 0;
  s.subscribe(() => { calls++; });
  s.update({ nights: 5 });
  assert.equal(calls, 1);
  assert.equal(s.get().nights, 5);
});

test("hash round-trip preserves shape", () => {
  const v = { line: "carnival", cabinTier: "suite", nights: 10, adults: 2, children: 1, childAges: [4] };
  const hash = encodeHash(v);
  const back = decodeHash(hash);
  assert.deepEqual(back, v);
});

test("localStorage save and restore", () => {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (k) => store.has(k) ? store.get(k) : null,
    setItem: (k, v) => store.set(k, v),
    removeItem: (k) => store.delete(k)
  };
  saveToStorage({ line: "carnival", nights: 5 });
  assert.deepEqual(loadFromStorage(), { line: "carnival", nights: 5 });
  clearStorage();
  assert.equal(loadFromStorage(), null);
});
