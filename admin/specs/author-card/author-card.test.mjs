// author-card.test.mjs — M3.5: the card is placed by REPLACE, never append; exactly one card and one
// heading; the markup obeys the spec's accessibility contract and In The Wake's no-eval rule.
//
// Run: node --test admin/specs/author-card/author-card.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { injectAuthorCard, matchElement, OPEN, CLOSE } from "./inject-author-card.mjs";

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

test("matchElement finds the matching close tag through nesting, not the first close", () => {
  const html = `<div id="outer"><div id="inner">x</div></div><p>after</p>`;
  const m = matchElement(html, html.indexOf("<div"));
  assert.equal(m.tag, "div");
  assert.equal(html.slice(m.end - "</div>".length, m.end), "</div>");
  assert.ok(m.end <= html.indexOf("<p>"), "it closed the OUTER div, not the inner one");
});

test("MUST-FAIL (#1916): a page that already carries two cards leaves with exactly one, and a rerun changes nothing", () => {
  const variant = (h, id) => `<section class="card author-card-vertical" aria-labelledby="${id}"><${h} id="${id}">About the Author</${h}><p>x</p></section>`;
  const page = `<html><body><main><h2>A</h2>${variant("h3", "author-heading")}<p>mid</p>${variant("h4", "author-heading-2")}</main></body></html>`;
  const once = injectAuthorCard(page);
  const twice = injectAuthorCard(once.html);
  const cards = (s) => (s.match(/author-card-vertical/g) || []).length;
  assert.equal(cards(once.html), 1);
  assert.equal(once.removed, 1);
  assert.ok(!once.html.includes("author-heading-2"), "the band-aid duplicate is gone, not renamed");
  assert.ok(once.html.indexOf("About the Author") < once.html.indexOf("<p>mid</p>"), "the card stands where the first one stood");
  assert.equal(twice.html, once.html, "idempotent");
  assert.equal(twice.removed, 0);
  // A marked card with a stray unmarked copy before it: still exactly one, at the marked place.
  const marked = injectAuthorCard(`<main>${variant("h4", "x")}<p>between</p></main>`).html;
  const stray = `<main>${variant("h3", "y")}<p>lead</p>${marked.replace("<main>", "")}`;
  const fixed = injectAuthorCard(stray);
  assert.equal(cards(fixed.html), 1);
  assert.equal(fixed.mode, "replaced-marker");
  assert.equal(fixed.removed, 1);
  assert.ok(fixed.html.indexOf("<p>lead</p>") < fixed.html.indexOf("About the Author"), "the marked place wins, and the stray copy before it is removed");
  const component = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "author-card.html"), "utf8").trim();
  assert.equal(fixed.html, `<main><p>lead</p>${component}<p>between</p></main>`, "the card lands exactly at the marked place, shifted for the removal before it");
});

test("MUST-FAIL: a stray open marker with no close never pairs with ours; nothing between them is cut", () => {
  const variant = `<section class="card author-card-vertical" aria-labelledby="author-heading"><h3 id="author-heading">About the Author</h3></section>`;
  // The ports/ocean-cay.html shape: a stray open comment before an aside, the card after it.
  const page = `<main><!-- Author Card -->\n<aside class="card">keep me</aside>\n${variant}</main>`;
  const once = injectAuthorCard(page);
  const twice = injectAuthorCard(once.html);
  assert.ok(twice.html.includes("keep me"), "the aside survives the second run");
  assert.equal(twice.html, once.html, "idempotent");
  // The bimini.html shape: a stray open comment directly before the card is the card's, and goes with it.
  const lead = injectAuthorCard(`<main><p>a</p>\n<!-- Author Card -->\n${variant}</main>`).html;
  assert.equal(lead.split(OPEN).length - 1, 1, "one open marker, not two");
  assert.equal(injectAuthorCard(lead).html, lead);
});
