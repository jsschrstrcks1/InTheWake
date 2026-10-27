#!/usr/bin/env node
// Set In the Wake's machine-readable copies of a ship fact to the cruise line's own figure (Tekton
// itw-c2b-rcl-fleet-fact-sheets; doc admin/lexicon/CROSS-CHECK.md, "Applying the line's figure").
// Soli Deo Gloria.
//
// WHY. The cross-check (cross-check.mjs) finds where two copies disagree and picks no side. Its remedy is to
// correct the wrong copy from the line's own page (operator ruling 2026-10-25: the cruise line is the primary
// source). Once the line's figure has been captured (capture-official.mjs, assets/data/lexicon/observations/),
// that remedy is mechanical, and ninety hand edits is how a wrong digit gets in. This does it the same way
// every time and shows every change before it makes one.
//
// WHAT IT CHANGES. For each disagreement in which the line-official reading takes part, each copy holding a
// different value is set to the line's value, but only in these places, each by a surgical text edit so that
// nothing else in the file moves:
//   data/atlas/ship-size-atlas.json  gt, crew, pax_double; the field's `sources` entry becomes
//                                    ["Royal Caribbean Official"], the label the atlas already uses
//   assets/data/fleet_index.json      gt
//   assets/data/rc_ships_meta.json,  ships[].gt and ships[].crew
//   assets/data/ncl_ships_meta.json
//   ships/<line>/<slug>.html          the #ship-stats-fallback block: gt, crew, and the "(double)" figure of guests;
//                                    and the page's own labelled stat slots holding exactly the old figure: the
//                                    "<strong>Tonnage:</strong>", "Crew:", "Guests:" list and the stat-key/stat-val
//                                    grid ("Gross Tonnage", "Crew", "Guests")
// A copy in any other file (a voyage pack's fact sheet, a ship record) is listed and left alone: those carry
// their own cited sources and are a person's to correct.
//
// WHAT IT NEVER DOES. It never picks between two line readings (a fact the line itself states two ways is
// skipped), never edits prose, and never edits a record it cannot find exactly once. A labelled slot states the
// ship's figure today; a sentence may state history ("At 225,282 GT she was the largest ship afloat" was true in
// 2009, before a refit changed her tonnage), so prose is a person's call. Every place the old figure is still
// written after the slots are set is named, page by page, so a person can look.
//
//   node admin/lexicon/apply-official.mjs            dry run: print every change it would make
//   node admin/lexicon/apply-official.mjs --apply    make them, then re-read each copy to prove it took
//
// @exit 0 dry run printed, or every change applied and re-read as the line's figure
// @exit 1 refused (itw_apply_official_unverified): after --apply, a changed copy did not read back as the line's figure. remedy: inspect the named file; the edit that failed is printed
// @exit 3 could not look (itw_cross_check_unavailable): a source file could not be read or parsed. remedy: fix the file the message names
import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { collect, compare } from "./cross-check.mjs";

const ROOT = fileURLToPath(new URL("../..", import.meta.url));
const OFFICIAL = "assets/data/lexicon/observations/";
const LINE_LABEL = { "Royal Caribbean": "Royal Caribbean Official", "Norwegian Cruise Line": "Norwegian Cruise Line Official" };

const group = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** The new token for a field, in the style the old one was written: number, "1,500", "1500" or "168,666 GT". */
export function restyle(oldToken, value) {
  const t = oldToken.trim();
  if (!t.startsWith('"')) return String(value);
  const inner = t.slice(1, -1);
  if (/\bGT\b/i.test(inner)) return `"${group(value)} GT"`;
  return inner.includes(",") ? `"${group(value)}"` : `"${value}"`;
}

/** Replace the first `"field": <token>` inside text[start, end). Returns the new text, or null if not exactly found. */
export function setField(text, start, end, field, makeToken) {
  const re = new RegExp(`("${esc(field)}"\\s*:\\s*)("(?:[^"\\\\]|\\\\.)*"|-?\\d+(?:\\.\\d+)?)`, "g");
  re.lastIndex = start;
  const m = re.exec(text);
  if (!m || m.index >= end) return null;
  const token = makeToken(m[2]);
  if (token === null) return null;
  const at = m.index + m[1].length;
  return text.slice(0, at) + token + text.slice(at + m[2].length);
}

/** [start, end) of the one block a key line opens, ending where the next block of the same kind begins. */
function blockOf(text, opener, nextOpener) {
  const first = text.indexOf(opener);
  if (first < 0 || text.indexOf(opener, first + 1) >= 0) return null; // absent, or not exactly once
  const next = text.indexOf(nextOpener, first + opener.length);
  return [first, next < 0 ? text.length : next];
}

// Where each logical property lives in each file. The cross-check reports a source as "<file> <path>.<key>",
// with <key> the name it passed to readField (gt, guests_double, crew ...), not always the file's own field.
const WRITERS = [
  { match: /^data\/atlas\/ship-size-atlas\.json$/, fields: { gross_tonnage: "gt", crew: "crew", guests_double: "pax_double" },
    edit(text, slug, field, value, line) {
      // The atlas keys a ship as <line>-<slug> (rcl-, ncl-, carnival- ...): found the way the cross-check joins it,
      // by any one line prefix, and only when exactly one row matches.
      const ids = [...text.matchAll(new RegExp(`"ship_id": "(?:[a-z0-9]+-)?${esc(slug)}"`, "g"))];
      if (ids.length !== 1) return null;
      const b = blockOf(text, ids[0][0], `"ship_id":`);
      if (!b) return null;
      let t = setField(text, b[0], b[1], field, () => String(value));
      if (t === null) return null;
      const end = b[1] + (t.length - text.length);
      const label = LINE_LABEL[line];
      if (!label) return t;
      const src = t.indexOf('"sources": {', b[0]);
      if (src < 0 || src >= end) return t;
      const existing = new RegExp(`("${field}"\\s*:\\s*)\\[[^\\]]*\\]`).exec(t.slice(src, end));
      if (existing) {
        const at = src + existing.index + existing[1].length;
        return t.slice(0, at) + `["${label}"]` + t.slice(at + existing[0].length - existing[1].length);
      }
      const open = src + '"sources": {'.length;
      return t.slice(0, open) + `\n        "${field}": ["${label}"],` + t.slice(open);
    } },
  { match: /^assets\/data\/fleet_index\.json$/, fields: { gross_tonnage: "gt" },
    edit(text, slug, field, value) {
      const b = blockOf(text, `"slug": "${slug}"`, `"slug":`);
      return b && setField(text, b[0], b[1], field, (old) => restyle(old, value));
    } },
  { match: /^assets\/data\/(rc|ncl)_ships_meta\.json$/, fields: { gross_tonnage: "gt", crew: "crew" },
    edit(text, slug, field, value) {
      const b = blockOf(text, `"slug": "${slug}"`, `"slug":`);
      return b && setField(text, b[0], b[1], field, (old) => restyle(old, value));
    } },
  { match: /^ships\/[^/]+\/[^/]+\.html$/, fields: { gross_tonnage: "gt", crew: "crew", guests_double: "guests" },
    edit(text, slug, field, value) {
      const m = /(<script[^>]*id="ship-stats-fallback"[^>]*>)([\s\S]*?)<\/script>/.exec(text);
      if (!m) return null;
      const start = m.index + m[1].length, end = start + m[2].length;
      if (field !== "guests") return setField(text, start, end, field, (old) => restyle(old, value));
      // Only the figure labelled "(double)" changes; a "(max)" figure beside it stays as written.
      return setField(text, start, end, field, (old) => {
        const d = /(~\s*)?(\d[\d,]*)(\s*\(double\))/i.exec(old);
        return d && !d[1] ? old.replace(d[0], `${group(value)}${d[3]}`) : null;
      });
    } },
];

/** Every change the line's figures call for, and every copy left alone with the reason. */
export function plan(root = ROOT) {
  const { observations } = collect(root);
  const { disagreements } = compare(observations);
  const changes = [], left = [];
  for (const d of disagreements) {
    const official = d.values.filter((v) => v.sources.some((s) => s.startsWith(OFFICIAL)));
    if (official.length !== 1) { if (official.length > 1) left.push({ key: d.key, why: "the line's own readings disagree" }); continue; }
    const value = Number(official[0].value);
    const obsFile = official[0].sources.find((s) => s.startsWith(OFFICIAL)).split(" ")[0];
    const line = JSON.parse(readFileSync(join(root, obsFile), "utf8")).publisher;
    const [slug, property] = d.key.split("#");
    for (const v of d.values) {
      if (v === official[0]) continue;
      for (const src of v.sources) {
        const file = src.split(" ")[0];
        const w = WRITERS.find((x) => x.match.test(file));
        const field = w && w.fields[property];
        if (!field) { left.push({ key: d.key, file, from: v.value, why: "not a file this tool edits" }); continue; }
        changes.push({ key: d.key, slug, property, file, field, from: v.value, to: value, line, writer: w });
      }
    }
  }
  return { changes, left };
}

// The labelled stat slots on a ship page, by property. Each matches the text before the figure.
const SLOTS = {
  gross_tonnage: [/<strong>Tonnage:<\/strong>\s*/, /stat-key">Gross Tonnage<\/span>\s*<span class="stat-val">\s*/],
  crew: [/<strong>Crew:<\/strong>\s*/, /stat-key">Crew<\/span>\s*<span class="stat-val">\s*/],
  guests_double: [/<strong>Guests:<\/strong>\s*/, /stat-key">Guests<\/span>\s*<span class="stat-val">\s*/],
};

/** Set every labelled slot on a page that holds exactly `from` to `to`. Returns { text, count }. */
export function setSlots(text, property, from, to) {
  let count = 0;
  for (const label of SLOTS[property] || []) {
    const re = new RegExp(`(${label.source})${esc(group(from))}(?![\\d,])`, "g");
    text = text.replace(re, (m, before) => { count += 1; return `${before}${group(to)}`; });
  }
  return { text, count };
}

/** Apply the planned changes. Returns { applied, failed, slots, proseHits }. */
export function apply(root, changes) {
  const byFile = new Map();
  for (const c of changes) { if (!byFile.has(c.file)) byFile.set(c.file, []); byFile.get(c.file).push(c); }
  const applied = [], failed = [], proseHits = [], slots = [];
  for (const [file, list] of byFile) {
    let text = readFileSync(join(root, file), "utf8");
    for (const c of list) {
      const next = c.writer.edit(text, c.slug, c.field, c.to, c.line);
      if (next === null || next === text) { failed.push({ ...c, why: "the record or field was not found exactly once" }); continue; }
      text = next;
      applied.push(c);
      if (file.endsWith(".html")) {
        const set = setSlots(text, c.property, c.from, c.to);
        text = set.text;
        if (set.count) slots.push({ file, key: c.key, count: set.count });
        const outside = text.replace(/<script[^>]*id="ship-stats-fallback"[^>]*>[\s\S]*?<\/script>/, "");
        const old = group(c.from);
        const left = [...outside.matchAll(new RegExp(`(?<![\\d,])${esc(old)}(?![\\d,])`, "g"))].length;
        if (left) proseHits.push({ file, key: c.key, old, left });
      }
    }
    writeFileSync(join(root, file), text);
  }
  return { applied, failed, slots, proseHits };
}

function main(argv) {
  const root = argv.includes("--root") ? argv[argv.indexOf("--root") + 1] : ROOT;
  const { changes, left } = plan(root);
  for (const c of changes) console.log(`apply-official: ${c.key}  ${c.file} ${c.field}: ${c.from} -> ${c.to} (${c.line})`);
  for (const l of left) console.log(`apply-official: left alone ${l.key}${l.file ? ` in ${l.file}` : ""}: ${l.why}`);
  if (!argv.includes("--apply")) { console.log(`apply-official: dry run, ${changes.length} change(s); --apply to make them`); return 0; }
  const { applied, failed, slots, proseHits } = apply(root, changes);
  for (const x of slots) console.log(`apply-official: ${x.file}: ${x.count} labelled stat slot(s) for ${x.key} set`);
  for (const p of proseHits) console.log(`apply-official: look at ${p.file}: the old figure ${p.old} (${p.key}) is still written ${p.left} time(s) outside the stat slots`);
  // Re-read: every changed copy must now be absent from every disagreement, or carry the line's value.
  const again = plan(root).changes.filter((c) => applied.some((a) => a.key === c.key && a.file === c.file));
  for (const f of [...failed, ...again]) console.error(`apply-official: REFUSED itw_apply_official_unverified: ${f.key} in ${f.file} does not read ${f.to}${f.why ? ` (${f.why})` : ""}`);
  console.log(`apply-official: ${applied.length} change(s) applied, ${failed.length + again.length} unverified`);
  return failed.length || again.length ? 1 : 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  let code;
  try { code = main(process.argv.slice(2)); }
  catch (e) {
    if (e.code !== "itw_cross_check_unavailable") throw e;
    console.error(`apply-official: UNAVAILABLE itw_cross_check_unavailable: ${e.message}`);
    code = 3;
  }
  process.exit(code);
}
