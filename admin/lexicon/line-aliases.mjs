#!/usr/bin/env node
// Line alias table for the Lexicon (Tekton itw-c1-cruise-pack-schema; Project-Sophos
// docs/lexicon/LEXICON-PLAN-3.1.md ADR-9: "one alias table for the five line vocabularies").
//
// WHY. This repo spells one cruise line up to five ways: `rcl` (ships/ and assets/data/ships/),
// `royal-caribbean` (brands.json, lines/), `ncl` (fleets.json), `norwegian-cruise-line` (fleet_index.json).
// A statement names a line once, as `line:<brands.json id>`; this table says which spelling in which file
// means that line.
//
// NO HAND MAPPING. Every alias is DERIVED from evidence the repository already holds, and the evidence is
// written beside it: the same id, the same display name (normalised), or ship overlap (a ships/ folder's
// pages are the ships a line's fleet lists). Anything that cannot be matched is listed under `unmatched`
// with the reason. Nothing is guessed: an unmatched alias is a question for a person, not a default.
//
//   node admin/lexicon/line-aliases.mjs           write assets/data/entities/line-aliases.json
//   node admin/lexicon/line-aliases.mjs --check   exit 1 if the file is not what the data says
//
// Exit codes (every refusal names its code and remedy):
//   0  written, or --check found the file current
//   1  itw_line_aliases_stale: --check found the file differs from what the data says.
//      Remedy: run without --check and commit the result.
//   2  itw_line_aliases_unreadable: a source file could not be read or parsed. Remedy: fix the named file.
// Soli Deo Gloria.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
export const OUT = "assets/data/entities/line-aliases.json";
const SHIP_PAGE_SKIP = new Set(["index", "venues"]);
const MIN_SHIP_OVERLAP = 2;

/** Lowercase, drop punctuation and the words that differ between spellings of one line's name. */
export function normaliseName(s) {
  return String(s ?? "").toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9 ]+/g, " ")
    .split(/\s+/).filter((w) => w && !["cruises", "cruise", "line", "international", "the"].includes(w)).join(" ");
}
export const slugify = (s) => String(s ?? "").toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function readJson(root, rel) {
  try { return JSON.parse(fs.readFileSync(path.join(root, rel), "utf8")); }
  catch (err) { throw Object.assign(new Error(`${rel}: ${String(err?.message ?? err).split("\n")[0]}`), { code: "itw_line_aliases_unreadable" }); }
}
const listDirs = (root, rel) => (fs.existsSync(path.join(root, rel)) ? fs.readdirSync(path.join(root, rel), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort() : []);
const shipSlugsIn = (root, rel, ext) => fs.readdirSync(path.join(root, rel)).filter((f) => f.endsWith(ext)).map((f) => f.slice(0, -ext.length)).filter((s) => !SHIP_PAGE_SKIP.has(s));

/** Build the table from the repository at `root`. Deterministic: same files, same bytes. */
export function buildLineAliases(root = ROOT) {
  const brands = readJson(root, "assets/data/brands.json").brands;
  const fleets = readJson(root, "assets/data/fleets.json").groups.flatMap((g) => g.brands ?? []);
  const fleetIndex = readJson(root, "assets/data/fleet_index.json").cruise_lines;
  const lineFiles = fs.readdirSync(path.join(root, "assets/data/lines")).filter((f) => f.endsWith(".json")).sort()
    .map((f) => ({ file: f.slice(0, -5), lineId: readJson(root, `assets/data/lines/${f}`).lineId ?? null }));

  const lines = {};
  for (const b of brands) lines[b.id] = { entity: `line:${b.id}`, name: b.label, short: b.shortLabel ?? null, aliases: [], ships: new Set() };
  const byName = new Map(brands.map((b) => [normaliseName(b.label), b.id]));
  const unmatched = [];
  const add = (id, vocabulary, alias, evidence) => lines[id].aliases.push({ vocabulary, alias, evidence });

  for (const b of brands) add(b.id, "brands.json", b.id, "the canonical id");
  for (const lf of lineFiles) {
    const id = lines[lf.lineId] ? lf.lineId : lines[lf.file] ? lf.file : null;
    if (id) add(id, "assets/data/lines", lf.file, lf.lineId === id ? "lineId equals the brand id" : "file name equals the brand id");
    else unmatched.push({ vocabulary: "assets/data/lines", alias: lf.file, reason: `lineId '${lf.lineId}' and file name match no brand id` });
  }
  for (const f of fleets) {
    const id = byName.get(normaliseName(f.name));
    if (id) {
      add(id, "fleets.json", f.slug, `name '${f.name}' matches brand label '${lines[id].name}'`);
      for (const c of f.classes ?? []) for (const s of c.ships ?? []) lines[id].ships.add(slugify(s));
    } else unmatched.push({ vocabulary: "fleets.json", alias: f.slug, reason: `name '${f.name}' matches no brand label` });
  }
  for (const l of fleetIndex) {
    const id = byName.get(normaliseName(l.name));
    if (id) {
      add(id, "fleet_index.json", l.slug, `name '${l.name}' matches brand label '${lines[id].name}'`);
      for (const s of l.ships ?? []) lines[id].ships.add(s.slug || slugify(s.name));
    } else unmatched.push({ vocabulary: "fleet_index.json", alias: l.slug, reason: `name '${l.name}' matches no brand label` });
  }
  // Folders: the same id, else the line whose fleet lists the most of the folder's ships (at least
  // MIN_SHIP_OVERLAP, and strictly more than any other line).
  for (const [vocabulary, rel, ext] of [["ships/", "ships", ".html"], ["assets/data/ships/", "assets/data/ships", ".page.json"]]) {
    for (const dir of listDirs(root, rel)) {
      const slugs = shipSlugsIn(root, `${rel}/${dir}`, ext);
      if (!slugs.length) continue;
      if (lines[dir]) { add(dir, vocabulary, dir, "folder name equals the brand id"); continue; }
      const scored = Object.entries(lines).map(([id, l]) => [id, slugs.filter((s) => l.ships.has(s)).length]).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
      const [best, second] = scored;
      if (best[1] >= MIN_SHIP_OVERLAP && best[1] > (second?.[1] ?? 0)) add(best[0], vocabulary, dir, `${best[1]} of its ${slugs.length} ship files are in this line's fleet lists`);
      else unmatched.push({ vocabulary, alias: dir, reason: best[1] ? `ship overlap too weak or tied (${best[0]}: ${best[1]}${second ? `, ${second[0]}: ${second[1]}` : ""} of ${slugs.length})` : `none of its ${slugs.length} ship files is in any line's fleet lists` });
    }
  }
  const out = {};
  for (const id of Object.keys(lines).sort()) {
    const l = lines[id];
    out[id] = { entity: l.entity, name: l.name, short: l.short,
      aliases: l.aliases.sort((a, b) => a.vocabulary.localeCompare(b.vocabulary) || a.alias.localeCompare(b.alias)) };
  }
  return {
    format: "lexicon-line-aliases/1",
    _about: "Generated by admin/lexicon/line-aliases.mjs from brands.json, fleets.json, fleet_index.json, assets/data/lines/ and the ships/ folders. Do not edit by hand; edit the data and regenerate. Every alias carries its evidence; unmatched spellings are questions, not defaults. Soli Deo Gloria.",
    lines: out,
    unmatched: unmatched.sort((a, b) => a.vocabulary.localeCompare(b.vocabulary) || a.alias.localeCompare(b.alias)),
  };
}

export const render = (table) => `${JSON.stringify(table, null, 2)}\n`;

function main(argv) {
  let text;
  try { text = render(buildLineAliases(ROOT)); }
  catch (err) { process.stderr.write(`line-aliases: ${err.code ?? "itw_line_aliases_unreadable"}: ${err.message}\n  remedy: fix the named file\n`); return 2; }
  const file = path.join(ROOT, OUT);
  if (argv.includes("--check")) {
    const current = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : null;
    if (current === text) { process.stdout.write(`line-aliases: current (${OUT})\n`); return 0; }
    process.stderr.write(`line-aliases: itw_line_aliases_stale: ${OUT} is ${current === null ? "missing" : "not what the data says"}\n  remedy: node admin/lexicon/line-aliases.mjs, then commit ${OUT}\n`);
    return 1;
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
  process.stdout.write(`line-aliases: wrote ${OUT}\n`);
  return 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = main(process.argv.slice(2));
