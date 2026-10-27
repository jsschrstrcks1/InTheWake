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
// ROYAL CARIBBEAN (2026-10-26). royalcaribbean.com serves a headless browser its "ON VACATION" block page
// (170 characters), and the ship pages carry no figure table anyway. The line's official figures are the
// "Fast Facts" PDF each fact sheet on its press center (royalcaribbeanpresscenter.com/ships) links as
// "Download PDF", hosted on royalcaribbeanmedia.com. For those ships the browser opens the fact sheet, follows
// that link, and the figures are read from the PDF's own text (pdftotext). The observation's `url` is the PDF
// the figures came from; `found_via` is the press-center page that linked it.
//
// Needs network access, Playwright's Chromium and, for a fact sheet, pdftotext (poppler-utils). It is not
// run by the tests; the files it writes are, and the PDF reader (factSheetFigures) is tested on the text.
// Exit codes: 0 every target recorded (whatever its outcome); 2 itw_capture_unavailable (Playwright,
// Chromium or pdftotext missing; remedy: npm ci, or run where Chromium and poppler-utils are installed, or
// set ITW_CHROMIUM_PATH to an installed Chromium).
// Soli Deo Gloria.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
export const OBS_DIR = "assets/data/lexicon/observations";
const MIN_PAGE_CHARS = 1000;
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36";

// Norwegian's guest count for Aqua and Bliss differs from the figure a voyage pack quotes (from Wikipedia) and
// repeats in its prose. A pack is a person's to reconcile, so these two are held, not fed to the cross-check.
const PACK_HOLD = "A voyage pack quotes a different figure, from Wikipedia, and repeats it in its prose. Held until a person reconciles the pack: admin/lexicon/NCL-PROSE-TO-REVIEW.md";

// Each line's own page, and how that page lays out its figures. Royal Caribbean's are its press-center fact
// sheets (see ROYAL CARIBBEAN above); the old /fact-sheet/15/... address answers 404.
export const OFFICIAL = Object.freeze([
  { entity: "ship:carnival-vista", publisher: "Carnival Cruise Line", url: "https://www.carnival.com/cruise-ships/carnival-vista", extractor: "carnival-li" },
  { entity: "ship:msc-grandiosa", publisher: "MSC Cruises", url: "https://www.msccruises.com/int/our-cruises/ships/msc-grandiosa", extractor: "label-then-value" },
  { entity: "ship:radiance-of-the-seas", publisher: "Royal Caribbean", url: "https://royalcaribbeanpresscenter.com/fact-sheet/radiance", extractor: "rcl-fact-sheet-pdf" },
  { entity: "ship:quantum-of-the-seas", publisher: "Royal Caribbean", url: "https://royalcaribbeanpresscenter.com/fact-sheet/quantum", extractor: "rcl-fact-sheet-pdf" },
  { entity: "ship:legend-of-the-seas-2026", publisher: "Royal Caribbean", url: "https://royalcaribbeanpresscenter.com/fact-sheet/legend", extractor: "rcl-fact-sheet-pdf" },
  // The rest of the fleet the press center lists (royalcaribbeanpresscenter.com/ships, read 2026-10-26: 31 fact
  // sheets). Each slug is written out, never derived: "<name>-of-the-seas" is the page name In the Wake uses for
  // every one but Hero, which has no page here yet and so joins nothing.
  { entity: "ship:hero-of-the-seas", publisher: "Royal Caribbean", url: "https://royalcaribbeanpresscenter.com/fact-sheet/hero", extractor: "rcl-fact-sheet-pdf" },
  { entity: "ship:icon-of-the-seas", publisher: "Royal Caribbean", url: "https://royalcaribbeanpresscenter.com/fact-sheet/icon", extractor: "rcl-fact-sheet-pdf" },
  { entity: "ship:star-of-the-seas", publisher: "Royal Caribbean", url: "https://royalcaribbeanpresscenter.com/fact-sheet/star", extractor: "rcl-fact-sheet-pdf" },
  { entity: "ship:oasis-of-the-seas", publisher: "Royal Caribbean", url: "https://royalcaribbeanpresscenter.com/fact-sheet/oasis", extractor: "rcl-fact-sheet-pdf" },
  { entity: "ship:symphony-of-the-seas", publisher: "Royal Caribbean", url: "https://royalcaribbeanpresscenter.com/fact-sheet/symphony", extractor: "rcl-fact-sheet-pdf" },
  { entity: "ship:utopia-of-the-seas", publisher: "Royal Caribbean", url: "https://royalcaribbeanpresscenter.com/fact-sheet/utopia", extractor: "rcl-fact-sheet-pdf" },
  { entity: "ship:wonder-of-the-seas", publisher: "Royal Caribbean", url: "https://royalcaribbeanpresscenter.com/fact-sheet/wonder", extractor: "rcl-fact-sheet-pdf" },
  { entity: "ship:allure-of-the-seas", publisher: "Royal Caribbean", url: "https://royalcaribbeanpresscenter.com/fact-sheet/allure", extractor: "rcl-fact-sheet-pdf" },
  { entity: "ship:harmony-of-the-seas", publisher: "Royal Caribbean", url: "https://royalcaribbeanpresscenter.com/fact-sheet/harmony", extractor: "rcl-fact-sheet-pdf" },
  { entity: "ship:odyssey-of-the-seas", publisher: "Royal Caribbean", url: "https://royalcaribbeanpresscenter.com/fact-sheet/odyssey", extractor: "rcl-fact-sheet-pdf" },
  { entity: "ship:spectrum-of-the-seas", publisher: "Royal Caribbean", url: "https://royalcaribbeanpresscenter.com/fact-sheet/spectrum", extractor: "rcl-fact-sheet-pdf" },
  { entity: "ship:anthem-of-the-seas", publisher: "Royal Caribbean", url: "https://royalcaribbeanpresscenter.com/fact-sheet/anthem", extractor: "rcl-fact-sheet-pdf" },
  { entity: "ship:ovation-of-the-seas", publisher: "Royal Caribbean", url: "https://royalcaribbeanpresscenter.com/fact-sheet/ovation", extractor: "rcl-fact-sheet-pdf" },
  { entity: "ship:freedom-of-the-seas", publisher: "Royal Caribbean", url: "https://royalcaribbeanpresscenter.com/fact-sheet/freedom", extractor: "rcl-fact-sheet-pdf" },
  { entity: "ship:independence-of-the-seas", publisher: "Royal Caribbean", url: "https://royalcaribbeanpresscenter.com/fact-sheet/independence", extractor: "rcl-fact-sheet-pdf" },
  { entity: "ship:liberty-of-the-seas", publisher: "Royal Caribbean", url: "https://royalcaribbeanpresscenter.com/fact-sheet/liberty", extractor: "rcl-fact-sheet-pdf" },
  { entity: "ship:explorer-of-the-seas", publisher: "Royal Caribbean", url: "https://royalcaribbeanpresscenter.com/fact-sheet/explorer", extractor: "rcl-fact-sheet-pdf" },
  { entity: "ship:mariner-of-the-seas", publisher: "Royal Caribbean", url: "https://royalcaribbeanpresscenter.com/fact-sheet/mariner", extractor: "rcl-fact-sheet-pdf" },
  { entity: "ship:navigator-of-the-seas", publisher: "Royal Caribbean", url: "https://royalcaribbeanpresscenter.com/fact-sheet/navigator", extractor: "rcl-fact-sheet-pdf" },
  { entity: "ship:voyager-of-the-seas", publisher: "Royal Caribbean", url: "https://royalcaribbeanpresscenter.com/fact-sheet/voyager", extractor: "rcl-fact-sheet-pdf" },
  { entity: "ship:adventure-of-the-seas", publisher: "Royal Caribbean", url: "https://royalcaribbeanpresscenter.com/fact-sheet/adventure", extractor: "rcl-fact-sheet-pdf" },
  { entity: "ship:brilliance-of-the-seas", publisher: "Royal Caribbean", url: "https://royalcaribbeanpresscenter.com/fact-sheet/brilliance", extractor: "rcl-fact-sheet-pdf" },
  { entity: "ship:jewel-of-the-seas", publisher: "Royal Caribbean", url: "https://royalcaribbeanpresscenter.com/fact-sheet/jewel", extractor: "rcl-fact-sheet-pdf" },
  { entity: "ship:serenade-of-the-seas", publisher: "Royal Caribbean", url: "https://royalcaribbeanpresscenter.com/fact-sheet/serenade", extractor: "rcl-fact-sheet-pdf" },
  { entity: "ship:enchantment-of-the-seas", publisher: "Royal Caribbean", url: "https://royalcaribbeanpresscenter.com/fact-sheet/enchantment", extractor: "rcl-fact-sheet-pdf" },
  { entity: "ship:grandeur-of-the-seas", publisher: "Royal Caribbean", url: "https://royalcaribbeanpresscenter.com/fact-sheet/grandeur", extractor: "rcl-fact-sheet-pdf" },
  { entity: "ship:rhapsody-of-the-seas", publisher: "Royal Caribbean", url: "https://royalcaribbeanpresscenter.com/fact-sheet/rhapsody", extractor: "rcl-fact-sheet-pdf" },
  { entity: "ship:vision-of-the-seas", publisher: "Royal Caribbean", url: "https://royalcaribbeanpresscenter.com/fact-sheet/vision", extractor: "rcl-fact-sheet-pdf" },
  // Norwegian Cruise Line: every ship In the Wake has a page for (ships/norwegian/, read 2026-10-27), each slug
  // written out. ncl.com prints a figure above its label ("4,218" / "Guest Capacity" / "(Double Occupancy)",
  // "1,733" / "Ship Crew"). Norwegian Sky is not listed: her address redirects to the fleet list, so there is
  // no page of hers to read.
  { entity: "ship:norwegian-aqua", publisher: "Norwegian Cruise Line", url: "https://www.ncl.com/cruise-ships/norwegian-aqua", extractor: "ncl-value-then-label", hold: { "Guest Capacity (Double Occupancy)": PACK_HOLD } },
  { entity: "ship:norwegian-bliss", publisher: "Norwegian Cruise Line", url: "https://www.ncl.com/cruise-ships/norwegian-bliss", extractor: "ncl-value-then-label", hold: { "Guest Capacity (Double Occupancy)": PACK_HOLD } },
  { entity: "ship:norwegian-breakaway", publisher: "Norwegian Cruise Line", url: "https://www.ncl.com/cruise-ships/norwegian-breakaway", extractor: "ncl-value-then-label" },
  { entity: "ship:norwegian-dawn", publisher: "Norwegian Cruise Line", url: "https://www.ncl.com/cruise-ships/norwegian-dawn", extractor: "ncl-value-then-label" },
  { entity: "ship:norwegian-encore", publisher: "Norwegian Cruise Line", url: "https://www.ncl.com/cruise-ships/norwegian-encore", extractor: "ncl-value-then-label" },
  { entity: "ship:norwegian-epic", publisher: "Norwegian Cruise Line", url: "https://www.ncl.com/cruise-ships/norwegian-epic", extractor: "ncl-value-then-label" },
  { entity: "ship:norwegian-escape", publisher: "Norwegian Cruise Line", url: "https://www.ncl.com/cruise-ships/norwegian-escape", extractor: "ncl-value-then-label" },
  { entity: "ship:norwegian-gem", publisher: "Norwegian Cruise Line", url: "https://www.ncl.com/cruise-ships/norwegian-gem", extractor: "ncl-value-then-label" },
  { entity: "ship:norwegian-getaway", publisher: "Norwegian Cruise Line", url: "https://www.ncl.com/cruise-ships/norwegian-getaway", extractor: "ncl-value-then-label" },
  { entity: "ship:norwegian-jade", publisher: "Norwegian Cruise Line", url: "https://www.ncl.com/cruise-ships/norwegian-jade", extractor: "ncl-value-then-label" },
  { entity: "ship:norwegian-jewel", publisher: "Norwegian Cruise Line", url: "https://www.ncl.com/cruise-ships/norwegian-jewel", extractor: "ncl-value-then-label" },
  { entity: "ship:norwegian-joy", publisher: "Norwegian Cruise Line", url: "https://www.ncl.com/cruise-ships/norwegian-joy", extractor: "ncl-value-then-label" },
  { entity: "ship:norwegian-pearl", publisher: "Norwegian Cruise Line", url: "https://www.ncl.com/cruise-ships/norwegian-pearl", extractor: "ncl-value-then-label" },
  { entity: "ship:norwegian-prima", publisher: "Norwegian Cruise Line", url: "https://www.ncl.com/cruise-ships/norwegian-prima", extractor: "ncl-value-then-label" },
  { entity: "ship:norwegian-spirit", publisher: "Norwegian Cruise Line", url: "https://www.ncl.com/cruise-ships/norwegian-spirit", extractor: "ncl-value-then-label" },
  { entity: "ship:norwegian-star", publisher: "Norwegian Cruise Line", url: "https://www.ncl.com/cruise-ships/norwegian-star", extractor: "ncl-value-then-label" },
  { entity: "ship:norwegian-sun", publisher: "Norwegian Cruise Line", url: "https://www.ncl.com/cruise-ships/norwegian-sun", extractor: "ncl-value-then-label" },
  { entity: "ship:norwegian-viva", publisher: "Norwegian Cruise Line", url: "https://www.ncl.com/cruise-ships/norwegian-viva", extractor: "ncl-value-then-label" },
  { entity: "ship:pride-of-america", publisher: "Norwegian Cruise Line", url: "https://www.ncl.com/cruise-ships/pride-of-america", extractor: "ncl-value-then-label" },
]);

// Where a fact sheet's PDF may live: Royal Caribbean's own media and press hosts, nothing else.
const RCL_DOC_HOST = /^(?:www\.)?royalcaribbean(?:media|presscenter)\.com$/;

/**
 * The figures on a Royal Caribbean "Fast Facts" sheet, from the PDF's text: `raw` is pdftotext's reading order,
 * `layout` its -layout output. The sheet prints a figure before its label ("1,500 CREW", "168,666 GT", "4,180
 * GUESTS" over "(DOUBLE OCCUPANCY)", "1,141 FEET, 348 METRES LONG"). Each is recorded with the label as printed.
 *
 * Some sheets come out of pdftotext with a label away from its figure, so two readings are taken and must agree:
 * - Guests: reading order puts "(DOUBLE OCCUPANCY)" on the next line; on some sheets only the layout keeps them
 *   together, with "(DOUBLE OCCUPANCY)" ending a line within three lines below, starting in the same column
 *   (two characters of slack). Any other text after it on that line, or another column, is not that label.
 * - Length: "1,141 FEET, 348 METRES LONG" on one line, or the figures on one line ("1,141   348   LONG") with
 *   "FEET,   METRES" ending a line within two lines below.
 * A figure whose readings give two different values is not recorded: the sheet would be contradicting itself.
 */
export function factSheetFigures(raw, layout) {
  const only = (values) => { const v = [...new Set(values.map((x) => JSON.stringify(x)))]; return v.length === 1 ? JSON.parse(v[0]) : null; };
  const all = (re, text) => [...String(text).matchAll(re)].map((m) => m.slice(1));
  const lines = String(layout).split("\n");
  const guests = all(/^(\d[\d,]*) GUESTS[ \t]*\n[ \t]*\(DOUBLE OCCUPANCY\)/gm, raw).map((g) => g[0]);
  const length = all(/(\d[\d,]*)\s+FEET,\s+(\d+(?:\.\d+)?)\s+METRES\s+LONG/g, layout);
  lines.forEach((line, i) => {
    const g = /(\d[\d,]*) GUESTS\s*$/.exec(line);
    if (g) {
      for (let k = 1; k <= 3 && i + k < lines.length; k += 1) {
        const at = lines[i + k].indexOf("(DOUBLE OCCUPANCY)");
        if (at >= 0 && Math.abs(at - g.index) <= 2 && /^\(DOUBLE OCCUPANCY\)\s*$/.test(lines[i + k].slice(at))) { guests.push(g[1]); break; }
      }
    }
    const n = /(\d[\d,]*)\s+(\d+(?:\.\d+)?)\s+LONG\s*$/.exec(line);
    if (n && !/FEET|METRES/.test(line)) {
      for (let k = 1; k <= 2 && i + k < lines.length; k += 1) if (/FEET,\s+METRES\s*$/.test(lines[i + k])) { length.push([n[1], n[2]]); break; }
    }
  });
  const out = [];
  const crew = only(all(/^(\d[\d,]*) CREW$/gm, raw).map((g) => g[0]));
  if (crew) out.push({ label: "CREW", raw: crew });
  const dbl = only(guests);
  if (dbl) out.push({ label: "GUESTS (DOUBLE OCCUPANCY)", raw: dbl });
  const gt = only(all(/^(\d[\d,]*) GT$/gm, raw).map((g) => g[0]));
  if (gt) out.push({ label: "GT", raw: gt });
  const len = only(length);
  if (len) out.push({ label: "FEET LONG", raw: len[0] }, { label: "METRES LONG", raw: len[1] });
  return out;
}

/**
 * The figures on a Norwegian ship page, from its text lines (innerText, trimmed, blanks dropped). The page prints
 * each figure on the line above its label: "4,218" / "Guest Capacity" / "(Double Occupancy)", "1,733" / "Ship Crew",
 * "1069ft" / "Overall Length". A guest capacity is read only with "(Double Occupancy)" on the line below it, and
 * the figure line must be a number and nothing else. A label printed twice with different figures records nothing.
 */
export function nclFigures(lines) {
  const L = lines.map((x) => String(x).trim()).filter(Boolean);
  const found = new Map();
  const add = (label, raw) => { if (!found.has(label)) found.set(label, new Set()); found.get(label).add(raw); };
  L.forEach((line, i) => {
    const above = L[i - 1] ?? "";
    if (/^guest capacity$/i.test(line) && /^\(double occupancy\)$/i.test(L[i + 1] ?? "") && /^\d[\d,]*$/.test(above)) add("Guest Capacity (Double Occupancy)", above);
    if (/^ship crew$/i.test(line) && /^\d[\d,]*$/.test(above)) add("Ship Crew", above);
    if (/^overall length$/i.test(line) && /^\d[\d,]*\s*ft$/i.test(above)) add("Overall Length", above);
  });
  return [...found].filter(([, v]) => v.size === 1).map(([label, v]) => ({ label, raw: [...v][0] }));
}

/** The date a fact sheet says it was last updated ("Updated 7.22.26"), as printed, or null. */
export const factSheetUpdated = (raw) => (/\bUpdated\s+(\d{1,2}\.\d{1,2}\.\d{2,4})\b/.exec(String(raw)) || [])[1] ?? null;

function pdfText(buf, layout) {
  return execFileSync("pdftotext", [...(layout ? ["-layout"] : []), "-", "-"], { input: buf, encoding: "utf8", maxBuffer: 16 << 20 });
}

// The labels a figure may sit beside. Matched against the label exactly as the page shows it.
const LABEL = /^(gross tonnage|number of passengers|number of guests|guest capacity|crew members|onboard crew|length(\s*\/.*|\s+in\s+feet)?)\s*:?$/i;

/** What a read found: figures, a real page with none, or no page content at all. */
/**
 * Move the figures a target holds out of `items` and into `held`, with the reason. A held figure is still
 * recorded, word for word, so nothing the line said is lost; the cross-check reads only `items`. Holding is
 * for a figure a person must reconcile first, never a way to make a disagreement go quiet.
 */
export function withHolds(obs, hold) {
  if (!hold || !obs.items?.length) return obs;
  const held = obs.items.filter((i) => Object.hasOwn(hold, i.label)).map((i) => ({ ...i, reason: hold[i.label] }));
  if (!held.length) return obs;
  const items = obs.items.filter((i) => !Object.hasOwn(hold, i.label));
  return { ...obs, items, held };
}

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
  if (targets.some((t) => t.extractor === "rcl-fact-sheet-pdf")) {
    try { execFileSync("pdftotext", ["-v"], { stdio: "ignore" }); }
    catch { throw Object.assign(new Error("pdftotext not found (poppler-utils)"), { code: "itw_capture_unavailable" }); }
  }
  // ITW_CHROMIUM_PATH points at an installed Chromium when the repo's Playwright wants a build that is not on
  // this machine (its own error says "Executable doesn't exist").
  const executablePath = process.env.ITW_CHROMIUM_PATH || undefined;
  let browser;
  try { browser = await chromium.launch(executablePath ? { executablePath } : {}); }
  catch (err) { throw Object.assign(new Error(String(err?.message ?? err).split("\n")[0]), { code: "itw_capture_unavailable" }); }
  const page = await browser.newPage({ userAgent: UA });
  const results = [];
  try {
    for (const t of targets) {
      const base = { format: "lexicon-observation/1", entity: t.entity, source_kind: "line-official", publisher: t.publisher, url: t.url, extractor: t.extractor };
      let obs;
      try {
        if (t.extractor === "rcl-fact-sheet-pdf") { results.push(await factSheet(page, t, base, now)); continue; }
        if (t.extractor === "ncl-value-then-label") { results.push(withHolds(await nclPage(page, t, base, now), t.hold)); continue; }
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

/** Open a Royal Caribbean fact sheet, follow its "Download PDF" link, and read the figures from the PDF. */
async function factSheet(page, t, base, now) {
  await page.goto(t.url, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForTimeout(4000);
  const links = await page.evaluate(() => [...document.querySelectorAll("a")]
    .filter((a) => /^\s*download pdf\s*$/i.test(a.textContent)).map((a) => a.href));
  const pdfs = [...new Set(links)].filter((h) => { try { const u = new URL(h); return u.protocol === "https:" && RCL_DOC_HOST.test(u.hostname); } catch { return false; } });
  // No link, or more than one, is never guessed at: the page did not say which document is the fact sheet.
  if (pdfs.length !== 1) return { ...base, retrieved_at: now(), outcome: "no_figures_on_page", note: `found ${pdfs.length} "Download PDF" link(s) on Royal Caribbean's hosts`, items: [] };
  const res = await page.request.get(pdfs[0], { timeout: 45000 });
  const retrievedAt = now();
  const buf = Buffer.from(await res.body());
  if (!res.ok() || buf.subarray(0, 5).toString("latin1") !== "%PDF-") {
    return { ...base, url: pdfs[0], found_via: t.url, retrieved_at: retrievedAt, http_status: res.status(), outcome: "content_not_served", items: [] };
  }
  const raw = pdfText(buf, false), layout = pdfText(buf, true);
  const items = factSheetFigures(raw, layout);
  return { ...base, url: pdfs[0], found_via: t.url, retrieved_at: retrievedAt, http_status: res.status(),
    document_sha256: crypto.createHash("sha256").update(buf).digest("hex"), published_as_of: factSheetUpdated(raw),
    text_sha256: crypto.createHash("sha256").update(raw).digest("hex"), text_chars: raw.length,
    outcome: outcomeOf(items, raw.length), items };
}

/** Open a Norwegian ship page and read its figures. A redirect away from the ship's own page is not her page. */
async function nclPage(page, t, base, now) {
  const res = await page.goto(t.url, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForTimeout(5000);
  const retrievedAt = now();
  const landed = page.url().replace(/\/$/, "");
  const text = await page.evaluate(() => document.body.innerText);
  const common = { ...base, retrieved_at: retrievedAt, http_status: res ? res.status() : null,
    text_sha256: crypto.createHash("sha256").update(text).digest("hex"), text_chars: text.length };
  if (landed !== t.url.replace(/\/$/, "")) return { ...common, outcome: "content_not_served", note: `redirected to ${landed}`, items: [] };
  const items = nclFigures(text.split("\n"));
  return { ...common, outcome: outcomeOf(items, text.length), items };
}

async function main(argv) {
  const want = argv.filter((a) => a.startsWith("ship:"));
  const targets = want.length ? OFFICIAL.filter((t) => want.includes(t.entity)) : OFFICIAL;
  let results;
  try { results = await capture(targets); }
  catch (err) { process.stderr.write(`capture-official: ${err.code ?? "itw_capture_unavailable"}: ${err.message}\n  remedy: npm ci, or run where Playwright's Chromium and poppler-utils (pdftotext) are installed; or set ITW_CHROMIUM_PATH to an installed Chromium\n`); return 2; }
  fs.mkdirSync(path.join(ROOT, OBS_DIR), { recursive: true });
  for (const o of results) {
    const rel = `${OBS_DIR}/${o.entity.split(":")[1]}.json`;
    fs.writeFileSync(path.join(ROOT, rel), `${JSON.stringify(o, null, 2)}\n`);
    process.stdout.write(`capture-official: ${o.entity} ${o.outcome} (${o.items.length} figures) -> ${rel}\n`);
  }
  return 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = await main(process.argv.slice(2));
