#!/usr/bin/env node
// Ship infobox rendered from statements (Tekton itw-c3-infobox-renderer; Project-Sophos
// docs/lexicon/LEXICON-PLAN-3.1.md ADR-4 and Track C: "infobox rendered between markers"; operator decision D7,
// 2026-10-29: render infoboxes from statements).
//
// WHY. A pilot ship's figures were typed into its page by hand, in the stats card's <noscript> copy and in the
// #ship-stats-fallback JSON that assets/js/ship-stats.js draws the card from. The statement store
// (assets/data/entities/ship/<slug>.json, Track C2) now holds those figures with their sources, and the cruise
// line's own figure where its page or fact sheet gave one. This tool writes the card from the statements, so a
// fact is written once and every page that shows it agrees.
//
// WHAT IT WRITES. On each pilot page (PILOT in admin/lexicon/ship-statements.mjs, which carries the identity
// calls, e.g. Legend of the Seas is two ships on three pages) the whole #ship-stats mount is replaced, between
// markers, by:
//   - one row per figure the statements give, chosen by the contract's currentValue (Project-Sophos
//     sophos/src/lexicon/statement.mjs): the line's own figure where it is the one preferred statement;
//   - NO value where the statements disagree (currentValue says conflicting). The figure is named under the card
//     as not shown until a person settles it. Neither side is picked, and the page's typed figure is not shown
//     in its place;
//   - the page's own typed figure, labelled as the page's records, only for a card row no statement covers at all
//     (beam, registry, or a figure no record states plainly). This is what ship-stats.js shows today, unchanged;
//   - a line under the card naming every source shown and the date it was read.
// Because the mount then holds markup, ship-stats.js leaves it alone (its rule, pinned in
// tests/unit/ship-stats-card.test.mjs), and the card reads the same with JavaScript off.
// Hand-written prose, the Key Facts list, meta tags and JSON-LD are NOT touched: they still repeat figures and can
// still drift. That is a named gap, not a solved one.
//
//   node admin/lexicon/render-infobox.mjs            render the pilot pages' cards
//   node admin/lexicon/render-infobox.mjs --check    change nothing; exit non-zero if a card is not current
//
// MANIFEST. Each render also writes assets/data/lexicon/infobox-manifest.json: per pilot page, the sha256 of
// the card as rendered, of the entity file it came from, of the page's fallback JSON, and of this renderer.
// verifyManifest() checks those hashes against the tree WITHOUT the statement contract, which lives in
// Project-Sophos (private) and so is not available to this public repo's CI. It cannot prove a card is right;
// it proves the card is what the renderer last wrote and that nothing it was written from has changed since
// (Track C4, admin/lexicon/statement-gates.mjs).
//
// @exit 0 every pilot card is what the statements render (or, without --check, now is)
// @exit 1 refused: itw_infobox_drift, a pilot card differs from what the statements render, or is not yet converted. remedy: run node admin/lexicon/render-infobox.mjs and commit the pages it rewrites; change a figure in the statements (admin/lexicon/ship-statements.mjs), never in the marked block
// @exit 2 could not look: itw_infobox_unavailable, the statement contract (Project-Sophos beside this checkout, or LEXICON_CONTRACT_DIR), an entity file, a page or its fallback JSON could not be read. remedy: fix or provide the named file; an unreadable card is never reported as current
// @exit 3 refused: itw_infobox_hand_mount, a pilot page's #ship-stats holds hand-written markup outside the markers, so it was left alone. remedy: move the hand-written facts into the statements or the fallback JSON, empty the mount (a <noscript> copy is fine), then render
// Soli Deo Gloria.
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath, pathToFileURL } from "node:url";
import { PILOT, OUT_DIR } from "./ship-statements.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
export const MANIFEST = "assets/data/lexicon/infobox-manifest.json";
export const RENDERER = "admin/lexicon/render-infobox.mjs";
export const MARK_END = "<!-- /itw:infobox -->";
export const markStart = (slug) => `<!-- itw:infobox generated from ${OUT_DIR}/${slug}.json by admin/lexicon/render-infobox.mjs; edit the statements, not this block -->`;
const MARK_START_RE = /<!-- itw:infobox generated from [^>]*-->/;

// The card's rows in ship-stats.js order. `props` are the statement properties a row is made of; a row with no
// props comes only from the page's own fallback JSON. `key` is the fallback JSON key ship-stats.js reads.
export const ROWS = Object.freeze([
  { key: "class", label: "Class", props: ["ship_class"] },
  { key: "entered_service", label: "Entered Service", props: ["entered_service"] },
  { key: "gt", label: "Gross Tonnage", props: ["gross_tonnage"] },
  { key: "guests", label: "Guests", props: ["guests_double", "guests_max"] },
  { key: "crew", label: "Crew", props: ["crew"] },
  { key: "length", label: "Length", props: ["length_m"] },
  { key: "beam", label: "Beam", props: [] },
  { key: "registry", label: "Registry", props: [] },
  { key: "imo", label: "IMO", props: ["imo"], statementOnly: true },
]);
// What a withheld figure is called under the card.
const PROP_NAME = Object.freeze({
  ship_class: "class", entered_service: "year entered service", gross_tonnage: "gross tonnage",
  guests_double: "guests (double occupancy)", guests_max: "guests (maximum)", crew: "crew", length_m: "length", imo: "IMO",
});
const NO_FACT = /^(historic|n\/a|unknown)$/i; // ship-stats.js shows none of these, so neither does this

const fail = (code, message) => Object.assign(new Error(message), { code });
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const int = (n) => Number(n).toLocaleString("en-US");
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const day = (iso) => { const d = new Date(iso); return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`; };

/** The text a resolved statement shows. Units come from the statement, never assumed. */
export function formatValue(prop, s) {
  const v = s.ext.value;
  if (prop === "gross_tonnage") return `${int(v)} GT`;
  if (prop === "crew") return int(v);
  if (prop === "length_m") return `${Number(v).toLocaleString("en-US", { maximumFractionDigits: 2 })} m`;
  return String(v);
}

/** Where a shown statement came from: one group per publisher and link, dated by its latest reading. */
function sourceOf(s) {
  const p = s.provenance || {};
  // Only an http(s) address becomes a link: escaping stops markup, not a javascript: or data: scheme.
  const url = [p.uri, p.source_ref].find((u) => typeof u === "string" && /^https?:\/\//i.test(u)) || null;
  const official = s.epistemic?.status === "verified";
  return { label: official ? (p.publisher || "the cruise line") : "In the Wake's ship records", url: official ? url : null, official };
}

/**
 * Render one card. `statements` are the entity's; `fallback` is the page's #ship-stats-fallback object (or {}).
 * Returns { rows, withheld, html } where html is the region between and including the markers.
 */
export function renderCard({ entity, slug, statements, fallback = {}, openTag, indent = "", at, currentValue }) {
  const rows = [], withheld = [], unknown = [], sources = new Map();
  const note = (s) => {
    const src = sourceOf(s), k = `${src.official}\u0000${src.label}\u0000${src.url || ""}`;
    const prev = sources.get(k);
    const when = s.timestamps?.observed_at;
    if (!prev || (when && when > prev.when)) sources.set(k, { ...src, when: when || prev?.when });
  };
  let pageRows = 0;
  for (const row of ROWS) {
    const got = row.props.map((p) => [p, currentValue(statements, `${entity}#${p}`, { at })]);
    const conflicted = got.filter(([, r]) => r.state === "conflicting").map(([p]) => p);
    withheld.push(...conflicted);
    unknown.push(...got.filter(([, r]) => r.state === "unknown").map(([p]) => p));
    const resolved = got.filter(([, r]) => r.state === "resolved");
    let text = null, from = "statements";
    if (row.key === "guests") {
      const d = got.find(([p]) => p === "guests_double")[1], m = got.find(([p]) => p === "guests_max")[1];
      const parts = [];
      if (d.state === "resolved") parts.push(`${int(d.statement.ext.value)} (double)`);
      if (m.state === "resolved") parts.push(`${int(m.statement.ext.value)} (max)`);
      if (parts.length) text = parts.join(" / ");
    } else if (resolved.length) {
      text = formatValue(row.props[0], resolved[0][1].statement);
    }
    // The page's own figure stands in only where no statement covers the row at all: never beside a conflict,
    // never beside a half the statements gave.
    if (text === null && !row.statementOnly && got.every(([, r]) => r.state === "none")) {
      const raw = fallback[row.key];
      const t = raw === null || raw === undefined ? "" : String(raw).trim();
      if (t && !NO_FACT.test(t)) { text = t; from = "page"; pageRows++; }
    }
    if (text === null) continue;
    for (const [, r] of resolved) note(r.statement);
    rows.push({ key: row.key, label: row.label, text, from });
  }
  const i = indent, j = `${indent}  `;
  const out = [markStart(slug), `${i}${openTag}`];
  for (const r of rows) {
    out.push(`${j}<div class="stat-line" data-prop="${esc(r.from === "page" ? `page:${r.key}` : r.key)}"><span class="stat-key">${esc(r.label)}</span><span class="stat-val">${esc(r.text)}</span></div>`);
  }
  out.push(`${i}</div>`);
  // The line's own page first (it is the preferred source), then this site's records. Only a line page carries a
  // date: the day it was read, from its capture. A record of this site's is dated by the commit that last changed
  // its source, and the ship page is one of those sources, so printing that date here would change the page
  // every time the page is committed and never settle.
  const cites = [...sources.values()]
    .sort((a, b) => (b.official - a.official) || (a.label < b.label ? -1 : a.label > b.label ? 1 : 0))
    .map((s) => {
      const name = s.url ? `<a href="${esc(s.url)}" rel="noopener">${esc(s.label)}${/\.pdf(?:$|[?#])/i.test(s.url) ? " (PDF)" : ""}</a>` : esc(s.label);
      return `${name}${s.official && s.when ? `, read ${day(s.when)}` : ""}`;
    });
  if (pageRows) cites.push("this page's own records");
  let foot = cites.length ? `Sources: ${cites.join("; ")}.` : "";
  const named = (ps) => [...new Set(ps)].map((p) => PROP_NAME[p] || p).join(", ");
  if (withheld.length) foot += `${foot ? " " : ""}Not shown while sources disagree: ${named(withheld)}.`;
  // A statement of status unknown records that a source was looked for and none found; it is said, not dropped.
  if (unknown.length) foot += `${foot ? " " : ""}No source found yet for: ${named(unknown)}.`;
  if (foot) out.push(`${i}<p class="tiny infobox-sources">${foot}</p>`);
  out.push(`${i}${MARK_END}`);
  return { rows, withheld: [...new Set(withheld)], html: out.join("\n") };
}

/**
 * Find the card on a page.
 *   marked     rendered before: start and end bound the markers
 *   adoptable  the mount holds nothing but whitespace and <noscript> copies: start and end bound the mount
 *   hand       anything else; left alone, with why
 *   none       no #ship-stats on the page
 */
export function classifyMount(html) {
  const ms = MARK_START_RE.exec(html);
  if (ms) {
    const e = html.indexOf(MARK_END, ms.index);
    if (e === -1) return { kind: "hand", why: "start marker without end marker" };
    const region = html.slice(ms.index, e);
    const open = /<div id="ship-stats"[^>]*>/.exec(region);
    if (!open) return { kind: "hand", why: "marked region holds no #ship-stats mount" };
    return { kind: "marked", start: ms.index, end: e + MARK_END.length, openTag: open[0], indent: html.slice(html.lastIndexOf("\n", ms.index) + 1, ms.index) };
  }
  const at = html.indexOf('id="ship-stats"');
  if (at === -1) return { kind: "none" };
  if (html.indexOf('id="ship-stats"', at + 1) !== -1) return { kind: "hand", why: "more than one #ship-stats" };
  const start = html.lastIndexOf("<div", at);
  const openEnd = html.indexOf(">", at) + 1;
  // The mount's own </div>: count nested <div> and </div> from its opening tag.
  const tags = /<div\b[^>]*>|<\/div>/g;
  tags.lastIndex = openEnd;
  let depth = 1, m, end = -1;
  while ((m = tags.exec(html))) {
    depth += m[0] === "</div>" ? -1 : 1;
    if (depth === 0) { end = m.index + m[0].length; break; }
  }
  if (start === -1 || end === -1) return { kind: "hand", why: "mount is not a closed <div>" };
  const inner = html.slice(openEnd, end - "</div>".length);
  if (inner.replace(/<noscript>[\s\S]*?<\/noscript>/g, "").trim() !== "") return { kind: "hand", why: "mount holds markup besides <noscript>" };
  return { kind: "adoptable", start, end, openTag: html.slice(start, openEnd), indent: html.slice(html.lastIndexOf("\n", start) + 1, start) };
}

/** The page's #ship-stats-fallback object; {} when the page has none. Throws when it is there and unreadable. */
export function readFallback(html, rel) {
  const m = /<script type="application\/json" id="ship-stats-fallback">([\s\S]*?)<\/script>/.exec(html);
  if (!m) return {};
  try { return JSON.parse(m[1]); } catch (e) { throw fail("itw_infobox_unavailable", `${rel}: #ship-stats-fallback is not valid JSON (${e.message})`); }
}

/** The opening tag the card is written with: the page's own, marked as generated. */
export const markOpenTag = (tag) => tag.replace(/\s+data-infobox="[^"]*"/, "").replace(/>$/, ' data-infobox="statements">');

export async function loadCurrentValue(env = process.env) {
  const dir = env.LEXICON_CONTRACT_DIR ? path.resolve(env.LEXICON_CONTRACT_DIR) : path.resolve(ROOT, "..", "Project-Sophos", "sophos", "src", "lexicon");
  try {
    const st = await import(pathToFileURL(path.join(dir, "statement.mjs")).href);
    if (typeof st.currentValue !== "function") throw new Error("statement.mjs exports no currentValue");
    return st.currentValue;
  } catch (err) {
    throw fail("itw_infobox_unavailable", `no statement contract at ${dir} (${String(err?.message ?? err).split("\n")[0]})`);
  }
}

/** Every pilot page: what it holds now and what the statements render. Deterministic for a given tree and `at`. */
export function plan(root, currentValue, { at = new Date().toISOString(), pilot = PILOT } = {}) {
  const pages = [];
  for (const p of pilot) {
    const slug = p.entity.split(":")[1];
    let entity;
    try { entity = JSON.parse(fs.readFileSync(path.join(root, OUT_DIR, `${slug}.json`), "utf8")); }
    catch (e) { throw fail("itw_infobox_unavailable", `${OUT_DIR}/${slug}.json could not be read (${e.message})`); }
    for (const page of p.pages) {
      const rel = `ships/${page}.html`;
      let html;
      try { html = fs.readFileSync(path.join(root, rel), "utf8"); }
      catch (e) { throw fail("itw_infobox_unavailable", `${rel} could not be read (${e.message})`); }
      const where = classifyMount(html);
      if (where.kind === "none" || where.kind === "hand") { pages.push({ rel, kind: where.kind, why: where.why, html, next: html }); continue; }
      const card = renderCard({
        entity: p.entity, slug, statements: entity.statements, fallback: readFallback(html, rel),
        openTag: markOpenTag(where.openTag), indent: where.indent, at, currentValue,
      });
      const next = html.slice(0, where.start) + card.html + html.slice(where.end);
      pages.push({ rel, kind: where.kind, html, next, rows: card.rows.length, withheld: card.withheld });
    }
  }
  return pages;
}

const sha = (text) => createHash("sha256").update(text).digest("hex");
const fallbackText = (html) => /<script type="application\/json" id="ship-stats-fallback">([\s\S]*?)<\/script>/.exec(html)?.[1] ?? null;

/** The hashes of one page's card and of everything it was written from, read from the tree. */
function pageHashes(root, entityRel, html) {
  const where = classifyMount(html);
  if (where.kind !== "marked") return { card: null, kind: where.kind };
  const fb = fallbackText(html);
  return {
    card_sha256: sha(html.slice(where.start, where.end)),
    entity_sha256: sha(fs.readFileSync(path.join(root, entityRel))),
    fallback_sha256: fb === null ? null : sha(fb),
  };
}

/** The manifest text for a set of rendered pages (their `next` html). Stable: sorted keys, two-space JSON. */
export function manifestText(root, pages, pilot = PILOT) {
  const entityOf = new Map(pilot.flatMap((p) => p.pages.map((pg) => [`ships/${pg}.html`, p.entity])));
  const out = {
    format: "itw-infobox-manifest/1",
    _about: "Written by admin/lexicon/render-infobox.mjs on every render; do not edit by hand. sha256 of each pilot card as rendered and of what it was written from, so admin/lexicon/statement-gates.mjs can tell a stale or hand-edited card without the statement contract. assets/data/entities/README.md#gates-track-c4",
    renderer_sha256: sha(fs.readFileSync(path.join(root, RENDERER))),
    pages: {},
  };
  for (const p of [...pages].sort((a, b) => (a.rel < b.rel ? -1 : 1))) {
    if (p.kind === "hand" || p.kind === "none") continue;
    const entity = entityOf.get(p.rel);
    const h = pageHashes(root, `${OUT_DIR}/${entity.split(":")[1]}.json`, p.next);
    out.pages[p.rel] = { entity, ...h, withheld: p.withheld };
  }
  return `${JSON.stringify(out, null, 2)}\n`;
}

/**
 * Contract-free check: is every pilot card what the renderer last wrote, written from the files as they are now?
 * Returns a list of { rel, why }; empty means current. Never throws for a missing page or manifest: it reports it.
 */
export function verifyManifest(root, pilot = PILOT) {
  const found = [];
  let m;
  try { m = JSON.parse(fs.readFileSync(path.join(root, MANIFEST), "utf8")); }
  catch (e) { return [{ rel: MANIFEST, why: `cannot be read (${e.code || e.message}); run the renderer` }]; }
  const rendererNow = sha(fs.readFileSync(path.join(root, RENDERER)));
  if (m.renderer_sha256 !== rendererNow) found.push({ rel: RENDERER, why: "the renderer changed since the cards were rendered" });
  for (const p of pilot) {
    const entityRel = `${OUT_DIR}/${p.entity.split(":")[1]}.json`;
    for (const pg of p.pages) {
      const rel = `ships/${pg}.html`;
      let html;
      try { html = fs.readFileSync(path.join(root, rel), "utf8"); } catch (e) { found.push({ rel, why: `cannot be read (${e.code})` }); continue; }
      const want = m.pages?.[rel];
      if (!want) { found.push({ rel, why: "not in the manifest (never rendered)" }); continue; }
      const now = pageHashes(root, entityRel, html);
      if (!now.card_sha256) { found.push({ rel, why: `the card is not marked (${now.kind})` }); continue; }
      if (now.card_sha256 !== want.card_sha256) found.push({ rel, why: "the card was edited after it was rendered" });
      if (now.entity_sha256 !== want.entity_sha256) found.push({ rel, why: `${entityRel} changed since the card was rendered` });
      if (now.fallback_sha256 !== want.fallback_sha256) found.push({ rel, why: "the page's #ship-stats-fallback changed since the card was rendered" });
    }
  }
  return found;
}

async function main(argv) {
  const check = argv.includes("--check");
  try {
    const pages = plan(ROOT, await loadCurrentValue());
    const hand = pages.filter((p) => p.kind === "hand" || p.kind === "none");
    const stale = pages.filter((p) => p.next !== p.html);
    const manifest = manifestText(ROOT, pages);
    let manifestNow = null;
    try { manifestNow = fs.readFileSync(path.join(ROOT, MANIFEST), "utf8"); } catch { /* absent: stale below */ }
    if (manifestNow !== manifest) stale.push({ rel: MANIFEST });
    if (!check) for (const p of stale) fs.writeFileSync(path.join(ROOT, p.rel), p.rel === MANIFEST ? manifest : p.next);
    for (const p of pages) {
      const state = p.kind === "hand" || p.kind === "none" ? `LEFT ALONE (${p.why || "no #ship-stats"})` : p.next === p.html ? "current" : check ? "STALE" : "rendered";
      process.stdout.write(`  ${p.rel}: ${state}${p.rows !== undefined ? `, ${p.rows} rows${p.withheld.length ? `, withheld while sources disagree: ${p.withheld.join(", ")}` : ""}` : ""}\n`);
    }
    if (hand.length) {
      process.stderr.write(`render-infobox: itw_infobox_hand_mount: ${hand.map((p) => p.rel).join(", ")}\n  remedy: move the hand-written facts into the statements or the fallback JSON, empty the mount (a <noscript> copy is fine), then run node admin/lexicon/render-infobox.mjs\n`);
      return 3;
    }
    if (check && stale.length) {
      process.stderr.write(`render-infobox: itw_infobox_drift: ${stale.length} pilot card(s) differ from what the statements render: ${stale.map((p) => p.rel).join(", ")}\n  remedy: run node admin/lexicon/render-infobox.mjs and commit the pages it rewrites; change a figure in the statements, never in the marked block\n`);
      return 1;
    }
    process.stdout.write(`render-infobox: ${check ? "current" : `${stale.length} page(s) rendered`} (${pages.length} pilot pages)\n`);
    return 0;
  } catch (err) {
    if (err.code !== "itw_infobox_unavailable") throw err;
    process.stderr.write(`render-infobox: ${err.code}: ${err.message}\n  remedy: fix or provide the named file; see the exit codes at the top of admin/lexicon/render-infobox.mjs\n`);
    return 2;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = await main(process.argv.slice(2));
