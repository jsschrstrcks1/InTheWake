// tests/unit/port-weather-faq/extract.test.mjs
// Locks extractVisibleFAQQuestions() against silent regression of the four FAQ
// render formats the port fleet uses. Format 4 (<div class="faq-item"><h3>) was
// a blind spot that produced ~28 false FAQ_COUNT / FAQ_<topic> failures (#2444).
import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

// port-weather-validator-core.js is CommonJS; bridge it into this ESM test.
const require = createRequire(import.meta.url);
const { PortWeatherValidator } = require("../../../scripts/port-weather-validator-core.js");

function extract(html) {
  const v = new PortWeatherValidator("/virtual/test.html");
  v.content = html;
  return v.extractVisibleFAQQuestions();
}

test("format 1: <details class=faq-item><summary> plain question", () => {
  const q = extract(`<details class="faq-item"><summary>How far is the port?</summary><p>A.</p></details>`);
  assert.deepEqual(q, ["How far is the port?"]);
});

test("format 2: <summary> with Q: prefix is stripped", () => {
  const q = extract(`<details class="faq-item"><summary>Q: Is it safe?</summary><p>A.</p></details>`);
  assert.deepEqual(q, ["Is it safe?"]);
});

test("format 3: inline <p><strong>Q: ...</strong>", () => {
  const q = extract(`<p><strong>Q: What should I pack?</strong><br>A: Layers.</p>`);
  assert.deepEqual(q, ["What should I pack?"]);
});

test("format 4: <div class=faq-item><h3> (the #2444 fix)", () => {
  const q = extract(`<div class="faq-item"><h3>Is Guam a US territory?</h3><p>Yes.</p></div>`);
  assert.deepEqual(q, ["Is Guam a US territory?"]);
});

test("format 4: div faq-item with extra classes and attrs", () => {
  const q = extract(`<div id="x" class="card faq-item open"><h2>Where do ships dock?</h2><p>Apra.</p></div>`);
  assert.deepEqual(q, ["Where do ships dock?"]);
});

test("false-positive guard: faq-item-wrapper / myfaq-item / heading-less div are NOT FAQs", () => {
  assert.deepEqual(extract(`<div class="faq-item-wrapper"><h3>Not a FAQ</h3></div>`), []);
  assert.deepEqual(extract(`<div class="myfaq-item"><h3>Not a FAQ</h3></div>`), []);
  assert.deepEqual(extract(`<div class="faq-item"><p>no heading here</p></div>`), []);
});

test("mixed formats accumulate across all four", () => {
  const html = `
    <details class="faq-item"><summary>One?</summary></details>
    <p><strong>Q: Two?</strong></p>
    <div class="faq-item"><h3>Three?</h3></div>`;
  const q = extract(html);
  assert.deepEqual(q.sort(), ["One?", "Three?", "Two?"]);
});

test("FAQ_COUNT regex counts indented details.faq-item (not Page:0)", () => {
  const v = new PortWeatherValidator("/virtual/petersburg.html");
  v.content = `<details class="faq-item">
        <summary>What is Petersburg Alaska known for?</summary>
        <p>Little Norway.</p>
      </details>`;
  assert.equal(v.count(/<details class="faq-item"[^>]*>\s*<summary/), 1);
  v.content = `<details class="faq-item" style="margin:0"><summary>Q?</summary></details>`;
  assert.equal(v.count(/<details class="faq-item"[^>]*>\s*<summary/), 1);
});
