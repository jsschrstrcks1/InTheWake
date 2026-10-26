#!/usr/bin/env node
// Capture a cruise line's own published ship facts (Tekton itw-c2b-line-official-verification).
//
// OPERATOR RULING (Ken, 2026-10-25): "the primary source should be the cruise lines website it self."
// This tool opens the line's own ship page in a real browser (Chromium via Playwright) and records,
// VERBATIM, each figure the page shows beside its label. It writes nothing it did not read: an
// observation file per ship in assets/data/lexicon/observations/, with the URL, the time it was read,
// a hash of the page text, and the label/value pairs exactly as shown. The statement generator
// (ship-statements.mjs) turns those into `verified` statements; this tool only witnesses.
//
// A page that shows no figures, or that cannot be read, is recorded as such: `no_figures_on_page` (a real
// page, no figures on it), `content_not_served` (under MIN_PAGE_CHARS of text: a bot check or error
// shell, so nothing about the ship was seen), `fetch_failed`. A check that found nothing is a fact too,
// and never an empty pass.
//
//   node admin/lexicon/capture-official.mjs [ship:slug ...]   capture all (or the named) ships
//
// Needs network access and Playwright's Chromium. It is not run by the tests; the files it writes are.
// Exit codes: 0 every target recorded (whatever its outcome); 2 itw_capture_unavailable (Playwright or
// Chromium missing; remedy: npm ci, or run where Chromium is installed).
// Soli Deo Gloria.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
export const OBS_DIR = "assets/data/lexicon/observations";
const MIN_PAGE_CHARS = 1000;
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36";

// Each line's own page, and how that page lays out its figures. Royal Caribbean publishes no figures on
// royalcaribbean.com; its press center fact sheets are its official figures, and they are what is tried.
export const OFFICIAL = Object.freeze([
  { entity: "ship:carnival-vista", publisher: "Carnival Cruise Line", url: "https://www.carnival.com/cruise-ships/carnival-vista", extractor: "carnival-li" },
  { entity: "ship:msc-grandiosa", publisher: "MSC Cruises", url: "https://www.msccruises.com/int/our-cruises/ships/msc-grandiosa", extractor: "label-then-value" },
  { entity: "ship:radiance-of-the-seas", publisher: "Royal Caribbean", url: "https://www.royalcaribbeanpresscenter.com/fact-sheet/15/radiance-of-the-seas/", extractor: "label-then-value" },
  { entity: "ship:quantum-of-the-seas", publisher: "Royal Caribbean", url: "https://www.royalcaribbean.com/cruise-ships/quantum-of-the-seas", extractor: "label-then-value" },
  { entity: "ship:legend-of-the-seas-2026", publisher: "Royal Caribbean", url: "https://www.royalcaribbean.com/cruise-ships/legend-of-the-seas", extractor: "label-then-value" },
]);

// The labels a figure may sit beside. Matched against the label exactly as the page shows it.
const LABEL = /^(gross tonnage|number of passengers|number of guests|guest capacity|crew members|onboard crew|length(\s*\/.*|\s+in\s+feet)?)\s*:?$/i;

/** What a read found: figures, a real page with none, or no page content at all. */
export function outcomeOf(items, textChars) {
  if (items.length) return "captured";
  return textChars < MIN_PAGE_CHARS ? "content_not_served" : "no_figures_on_page";
}

/** Keep only label/value pairs whose label is one a ship figure sits beside. */
export const figureLabel = (label) => LABEL.test(label);

// Runs in the page. Returns [{ label, raw }] exactly as rendered.
function extractInPage(kind) {
  const clean = (s) => String(s).replace(/\s+/g, " ").trim();
  if (kind === "carnival-li") {
    // Carnival lists each figure as one <li>: "133,500 Gross Tonnage" on screen. The gap is markup, so
    // textContent reads "133,500Gross Tonnage": the number runs straight into its label.
    return [...document.querySelectorAll("li")].map((li) => clean(li.textContent))
      .map((t) => /^([\d.,]+)\s*([A-Za-z].*)$/.exec(t)).filter(Boolean)
      .map((m) => ({ label: m[2], raw: m[1] }));
  }
  const lines = document.body.innerText.split("\n").map(clean).filter(Boolean);
  const out = [];
  for (let i = 0; i + 1 < lines.length; i += 1) out.push({ label: lines[i], raw: lines[i + 1] });
  return out;
}

export async function capture(targets = OFFICIAL, { now = () => new Date().toISOString() } = {}) {
  let chromium;
  try { ({ chromium } = createRequire(import.meta.url)("playwright")); }
  catch (err) { throw Object.assign(new Error(`playwright not loadable: ${err.message}`), { code: "itw_capture_unavailable" }); }
  const browser = await chromium.launch();
  const page = await browser.newPage({ userAgent: UA });
  const results = [];
  try {
    for (const t of targets) {
      const base = { format: "lexicon-observation/1", entity: t.entity, source_kind: "line-official", publisher: t.publisher, url: t.url, extractor: t.extractor };
      let obs;
      try {
        const res = await page.goto(t.url, { waitUntil: "domcontentloaded", timeout: 45000 });
        await page.waitForTimeout(6000);
        const retrievedAt = now();
        const text = await page.evaluate(() => document.body.innerText);
        const pairs = (await page.evaluate(extractInPage, t.extractor)).filter((p) => LABEL.test(p.label));
        const seen = new Set();
        const items = pairs.filter((p) => { const k = `${p.label}\u0000${p.raw}`; if (seen.has(k)) return false; seen.add(k); return true; });
        obs = { ...base, retrieved_at: retrievedAt, http_status: res ? res.status() : null,
          text_sha256: crypto.createHash("sha256").update(text).digest("hex"), text_chars: text.length,
          // A few hundred characters is not a ship page (a bot check, an error shell). Saying "no figures on
          // the page" would claim more than was seen: the page's content was never served.
          outcome: outcomeOf(items, text.length), items };
      } catch (err) {
        obs = { ...base, retrieved_at: now(), outcome: "fetch_failed", error: String(err?.message ?? err).split("\n")[0], items: [] };
      }
      results.push(obs);
    }
  } finally { await browser.close(); }
  return results;
}

async function main(argv) {
  const want = argv.filter((a) => a.startsWith("ship:"));
  const targets = want.length ? OFFICIAL.filter((t) => want.includes(t.entity)) : OFFICIAL;
  let results;
  try { results = await capture(targets); }
  catch (err) { process.stderr.write(`capture-official: ${err.code ?? "itw_capture_unavailable"}: ${err.message}\n  remedy: npm ci, or run where Playwright's Chromium is installed\n`); return 2; }
  fs.mkdirSync(path.join(ROOT, OBS_DIR), { recursive: true });
  for (const o of results) {
    const rel = `${OBS_DIR}/${o.entity.split(":")[1]}.json`;
    fs.writeFileSync(path.join(ROOT, rel), `${JSON.stringify(o, null, 2)}\n`);
    process.stdout.write(`capture-official: ${o.entity} ${o.outcome} (${o.items.length} figures) -> ${rel}\n`);
  }
  return 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = await main(process.argv.slice(2));
