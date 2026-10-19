// author-card.test.mjs — M3.5: the card is placed by REPLACE, never append; exactly one card and one
// heading; the markup obeys the spec's accessibility contract and In The Wake's no-eval rule.
//
// Run: node --test admin/specs/author-card/author-card.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { injectAuthorCard, OPEN, CLOSE } from "./inject-author-card.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CARD = fs.readFileSync(path.join(HERE, "author-card.html"), "utf8");
const page = (inner) => `<!doctype html><html><body><main>\n<h1>Port</h1>\n${inner}\n</main><footer>f</footer></body></html>`;
const count = (html, re) => (html.match(re) || []).length;
const cards = (html) => count(html, /author-card-vertical/g);
const authorHeadings = (html) => count(html, /<h[1-6][^>]*id="author-heading"/g);

const VARIANT_A = `<section class="card author-card-vertical" aria-labelledby="author-heading"><h3 id="author-heading">About the Author</h3><p>old</p></section>`;
const VARIANT_B = `<div class="card author-card-vertical" aria-labelledby="author-heading"><h4 id="author-heading">About the Author</h4><div class="inner"><p>old</p></div></div>`;
const VARIANT_C = `<details class="card" open=""><summary>About the Author</summary><div class="card-content author-card-vertical"><p>old</p></div></details>`;

test("MUST-FAIL: a second injection REPLACES the card — the page never gets two", () => {
  const once = injectAuthorCard(page(VARIANT_A), CARD);
  const twice = injectAuthorCard(once.html, CARD);
  assert.equal(cards(once.html), 1);
  assert.equal(cards(twice.html), 1, "an append implementation would leave 2");
  assert.equal(once.html, twice.html, "idempotent: a second run changes nothing");
  assert.equal(twice.mode, "replaced-marker");
});

test("the marked region is replaced, and the invocation comments are preserved exactly once", () => {
  const marked = page(`${OPEN}\n<section class="card author-card-vertical" aria-labelledby="author-heading"><h3 id="author-heading">About the Author</h3></section>\n${CLOSE}`);
  const r = injectAuthorCard(marked, CARD);
  assert.equal(r.mode, "replaced-marker");
  assert.equal(count(r.html, /<!-- Author Card -->/g), 1);
  assert.equal(count(r.html, /<!-- \/Author Card -->/g), 1);
  assert.equal(cards(r.html), 1);
});

test("variant B (div/h4) is replaced in place, normalised to h3", () => {
  const r = injectAuthorCard(page(VARIANT_B), CARD);
  assert.equal(cards(r.html), 1);
  assert.equal(authorHeadings(r.html), 1);
  assert.doesNotMatch(r.html, /<h4 id="author-heading"/, "the h4 variant is gone");
  assert.match(r.html, /<h3 id="author-heading">About the Author<\/h3>/);
});

test("variant C (details/summary) is replaced whole: no duplicate summary remains", () => {
  const r = injectAuthorCard(page(VARIANT_C), CARD);
  assert.equal(cards(r.html), 1);
  assert.doesNotMatch(r.html, /<summary>About the Author<\/summary>/, "the details wrapper went with it");
  assert.equal(authorHeadings(r.html), 1);
});

test("a page with no card gets exactly one, before </main>", () => {
  const r = injectAuthorCard(page("<p>no card here</p>"), CARD);
  assert.equal(r.mode, "inserted");
  assert.equal(cards(r.html), 1);
  const cardAt = r.html.indexOf("author-card-vertical");
  assert.ok(cardAt !== -1 && cardAt < r.html.indexOf("</main>"), "inside main");
  assert.ok(cardAt < r.html.indexOf("<footer>"), "before the footer");
});

test("the emitted markup meets the contract: one label target, an h3, and no eval or inline handlers", () => {
  const html = injectAuthorCard(page(VARIANT_A), CARD).html;
  assert.equal(count(html, /aria-labelledby="author-heading"/g), 1);
  assert.equal(count(html, /id="author-heading"/g), 1, "the label resolves to exactly one element");
  assert.match(html, /<h3 id="author-heading">/);
  assert.equal(count(html, /class="author-avatar"/g), 1);
  assert.match(html, /alt="[^"]+"/, "the avatar carries alt text");
  assert.doesNotMatch(html, /<script/i);
  assert.doesNotMatch(html, /\bon[a-z]+\s*=/i, "no inline handlers");
  assert.doesNotMatch(html, /\beval\s*\(|new\s+Function\b/);
});

test("the component file is inert data (no script, no handlers, no eval)", () => {
  assert.doesNotMatch(CARD, /<script|\bon[a-z]+\s*=|eval\s*\(|new\s+Function\b/i);
});
