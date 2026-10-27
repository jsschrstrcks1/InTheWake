// catalog.test.mjs — M3.6: the need, the five anti-pattern lessons, and the code-library card are
// present, shaped, and cross-referenced.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../../..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");

test("the need record is a need.v1 shape", () => {
  const need = JSON.parse(read("admin/specs/author-card/need.json"));
  for (const f of ["need_id", "household_id", "statement", "source", "refs"]) assert.ok(f in need, f);
  assert.match(need.need_id, /^need:/);
  assert.ok(need.refs.includes(1916));
});

test("five anti-pattern lessons, in the household memory-record shape", () => {
  const rows = read("admin/specs/author-card/lessons.jsonl").trim().split("\n").map((l) => JSON.parse(l));
  assert.equal(rows.length, 5);
  for (const r of rows) {
    assert.match(r.id, /^[0-9a-f]{8}$/);
    assert.equal(r.type, "anti-pattern");
    assert.ok(r.content.length > 40);
    assert.match(r.source, /github\.com\/jsschrstrcks1\/InTheWake\/issues\/\d+/);
    assert.ok(r.tags.includes("author-card"));
    for (const f of ["created", "domain", "confidence", "verification_state"]) assert.ok(f in r, f);
  }
  const titles = rows.map((r) => r.content).join("\n");
  for (const phrase of ["appends", "Renaming a duplicated id", "Hand-copying", "green build", "closed issue"]) {
    assert.ok(titles.includes(phrase), `missing anti-pattern: ${phrase}`);
  }
});

test("the card is kind code, household-born, and points at the need", () => {
  const catalog = JSON.parse(read("admin/lib/CATALOG.json"));
  const need = JSON.parse(read("admin/specs/author-card/need.json"));
  assert.equal(catalog.cards.length, 1);
  const card = catalog.cards[0];
  assert.equal(card.kind, "code");
  assert.deepEqual(card.inspired_by, [], "household-born code is inspired by nothing outside");
  assert.equal(card.need, need.need_id);
  assert.equal(card.household_id, "InTheWake");
});

test("the card's module exists and really exports what it claims; its test exists", () => {
  const card = JSON.parse(read("admin/lib/CATALOG.json")).cards[0];
  const src = read(card.module);
  for (const name of card.exports) assert.match(src, new RegExp(`export\\s+(?:async\\s+)?(?:function|const|class)\\s+${name}\\b`), name);
  for (const t of card.tests) {
    assert.ok(fs.existsSync(path.join(ROOT, t)), t);
    const body = read(t);
    for (const name of card.exports) assert.ok(body.includes(name), `${t} never mentions ${name}`);
  }
});
