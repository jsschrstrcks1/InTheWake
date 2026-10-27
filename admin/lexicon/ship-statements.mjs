#!/usr/bin/env node
// Ship statements from In the Wake's own data (Tekton itw-c2-ship-pilot-five; Project-Sophos
// docs/lexicon/LEXICON-PLAN-3.1.md Track C; rules in assets/data/entities/README.md).
//
// WHAT IT DOES. For each pilot ship it reads the repository's own records (the page.json data file and the
// stats block on the ship page), files every value they state as a Lexicon statement with its source,
// and writes assets/data/entities/ship/<slug>.json. This is source kind `itw-data` (operator directive
// 7f0df2b6, item c): evidence tier `secondary`, status `inference`. Checking a fact against the line's own
// page, which is what can make it `verified`, is a separate step that needs the web and two sources.
//
// WHAT IT REFUSES TO DO. It reads only what a record plainly says. A value it would have to interpret is
// NOT filed; it is listed under `not_filed` with the reason, so nothing is lost and nothing is guessed:
//   an approximate value ("~720"), a placeholder ("TBD"), a guest count with no "(double)" or "(max)"
//   label, a length given only in feet (no conversion), a maiden-voyage date offered as entered service.
// Two records that disagree give two statements; the contract's currentValue then reports `conflicting`
// and no page may show a value for it. Nothing here picks a side.
//
// IDENTITY. Which records describe which ship is written in PILOT below, and checked: every record of one
// entity must carry the same IMO where it states one, and two entities may not share an IMO.
//
//   node admin/lexicon/ship-statements.mjs           write the entity files
//   node admin/lexicon/ship-statements.mjs --check   exit 1 if any file is not what the records say
//
// Exit codes:
//   0  written, or --check found every file current
//   1  itw_ship_statements_stale: --check found a file that differs. Remedy: run without --check, commit.
//   2  itw_contract_unavailable: Project-Sophos's statement contract was not found beside this repo (or at
//      $LEXICON_CONTRACT_DIR). Remedy: clone Project-Sophos beside InTheWake, or set the variable.
//   3  itw_identity_split: one entity's records name two IMOs, or two entities share one. Remedy: fix PILOT
//      or the records; the generator will not guess which ship a record describes.
//   4  itw_source_uncommitted: a source record has no commit or has uncommitted edits. A statement cites
//      committed content only. Remedy: commit the record first.
//   5  itw_statement_refused: the contract or the pack refused a statement this tool built (a defect here).
// Soli Deo Gloria.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
export const OUT_DIR = "assets/data/entities/ship";
const PACK_FILE = "assets/data/lexicon/cruise.ship.pack.json";
const ALIASES_FILE = "assets/data/lexicon/line-aliases.json";
const ACTOR = Object.freeze({ kind: "tool", id: "itw-lexicon-ship-statements", provider: "household" });

// The five pilot ships (plan 3.1 section 7). Legend of the Seas is two ships on three pages: the 1995
// Vision-class ship (IMO 9102978 on both of its pages) and the 2026 Icon-class ship (IMO 9888560).
export const PILOT = Object.freeze([
  { entity: "ship:msc-grandiosa", lineDir: "msc", pages: ["msc/msc-grandiosa"] },
  { entity: "ship:carnival-vista", lineDir: "carnival", pages: ["carnival/carnival-vista"] },
  { entity: "ship:radiance-of-the-seas", lineDir: "rcl", pages: ["rcl/radiance-of-the-seas"] },
  { entity: "ship:quantum-of-the-seas", lineDir: "rcl", pages: ["rcl/quantum-of-the-seas"] },
  { entity: "ship:legend-of-the-seas-1995", lineDir: "rcl", pages: ["rcl/legend-of-the-seas", "rcl/legend-of-the-seas-1995-built"] },
  { entity: "ship:legend-of-the-seas-2026", lineDir: "rcl", pages: ["rcl/legend-of-the-seas-icon-class-entering-service-in-2026"] },
]);

const fail = (code, message) => Object.assign(new Error(message), { code });

// ── reading a value only when the record plainly states it ────────────────────────────────────────
const APPROX = /~|≈|approx/i;
const INT = /^\d{1,3}(?:,\d{3})+$|^\d+$/;
const toInt = (s) => Number(String(s).replace(/,/g, ""));

/** Parse one raw field into { property, value, unit } entries, or { skip: reason }. */
export function readField(key, raw) {
  if (raw === null || raw === undefined || raw === "") return [];
  const s = typeof raw === "string" ? raw.trim() : raw;
  if (typeof s === "string" && /^(tbd|tba|n\/a|unknown|-+)$/i.test(s)) return [{ skip: `a placeholder ("${s}"), not a value` }];
  switch (key) {
    case "gt": case "gross_tonnage": {
      if (typeof s === "number") return Number.isInteger(s) ? [{ property: "gross_tonnage", value: s, unit: "GT" }] : [{ skip: "not a whole number" }];
      if (APPROX.test(s)) return [{ skip: "approximate" }];
      const m = /^([\d,]+)\s*GT$/i.exec(s) || (INT.test(s) ? [s, s] : null);
      return m && INT.test(m[1]) ? [{ property: "gross_tonnage", value: toInt(m[1]), unit: "GT" }] : [{ skip: "not a plain tonnage" }];
    }
    case "guests_double": case "guests_max": {
      if (typeof s !== "number" || !Number.isInteger(s)) return [{ skip: "not a whole number" }];
      return [{ property: key, value: s, unit: "guests" }];
    }
    case "guests": {
      if (typeof s !== "string") return [{ skip: "an unlabelled guest count (neither double nor max is stated)" }];
      const out = [];
      for (const [label, property] of [["double", "guests_double"], ["max", "guests_max"]]) {
        const m = new RegExp(`(~\\s*)?([\\d,]+)\\s*\\(${label}\\)`, "i").exec(s);
        if (!m) continue;
        out.push(m[1] ? { skip: `the ${label} figure is approximate` } : { property, value: toInt(m[2]), unit: "guests" });
      }
      return out.length ? out : [{ skip: "an unlabelled guest count (neither double nor max is stated)" }];
    }
    case "crew": {
      if (typeof s === "number") return Number.isInteger(s) ? [{ property: "crew", value: s, unit: "crew" }] : [{ skip: "not a whole number" }];
      if (APPROX.test(s)) return [{ skip: "approximate" }];
      return INT.test(s) ? [{ property: "crew", value: toInt(s), unit: "crew" }] : [{ skip: "not a plain count" }];
    }
    case "length": {
      if (typeof s !== "string") return [{ skip: "no unit stated" }];
      if (APPROX.test(s)) return [{ skip: "approximate" }];
      const m = /\((\d+(?:\.\d+)?)\s*m\)/.exec(s);
      return m ? [{ property: "length_m", value: Number(m[1]), unit: "m" }] : [{ skip: "feet only; not converted" }];
    }
    case "length_m":
      return typeof s === "number" && Number.isFinite(s) ? [{ property: "length_m", value: s, unit: "m" }] : [{ skip: "not a number" }];
    case "entered_service": {
      const y = String(s);
      return /^\d{4}$/.test(y) ? [{ property: "entered_service", value: y, unit: null }] : [{ skip: "not a year" }];
    }
    case "class":
      return typeof s === "string" && s ? [{ property: "ship_class", value: s, unit: null }] : [];
    case "imo":
      return /^\d{7}$/.test(String(s)) ? [{ property: "imo", value: String(s), unit: null }] : [{ skip: "not a 7-digit IMO number" }];
    case "maiden_voyage":
      return [{ skip: "a maiden-voyage date is not the entered-service year; not filed as one" }];
    default:
      return [];
  }
}

const OBS_DIR = "assets/data/lexicon/observations";
// What a figure on the cruise line's own page means, read from its label exactly as the page shows it
// (captured by admin/lexicon/capture-official.mjs). The same strictness as readField: a figure the page
// does not label plainly is not filed. Thousands may be grouped with "," or "." (MSC's international page
// writes "181.541 tons"); a group must be exactly three digits, so a decimal is never misread as one.
const GROUPED = /^\d{1,3}(?:([.,])\d{3})(?:\1\d{3})*$|^\d+$/;
export function readOfficial(label, raw) {
  const l = String(label).trim().replace(/:$/, "").toLowerCase();
  const r = String(raw).trim();
  if (APPROX.test(r)) return [{ skip: "approximate" }];
  // "GT", "CREW", "GUESTS (DOUBLE OCCUPANCY)" and "METRES LONG" are how Royal Caribbean's fact sheets print them.
  if (l === "gross tonnage" || l === "gt") {
    const n = r.replace(/\s*tons?$/i, "");
    return GROUPED.test(n) ? [{ property: "gross_tonnage", value: Number(n.replace(/[.,]/g, "")), unit: "GT" }] : [{ skip: "not a plain tonnage" }];
  }
  if (l === "onboard crew" || l === "crew members" || l === "crew" || l === "ship crew") {
    return GROUPED.test(r) ? [{ property: "crew", value: Number(r.replace(/[.,]/g, "")), unit: "crew" }] : [{ skip: "not a plain count" }];
  }
  if (l === "guests (double occupancy)" || l === "guest capacity (double occupancy)") {
    return GROUPED.test(r) ? [{ property: "guests_double", value: Number(r.replace(/[.,]/g, "")), unit: "guests" }] : [{ skip: "not a plain count" }];
  }
  if (l === "metres long") {
    return /^\d+(?:\.\d+)?$/.test(r) ? [{ property: "length_m", value: Number(r), unit: "m" }] : [{ skip: "not a plain length in metres" }];
  }
  if (["guest capacity", "number of passengers", "number of guests"].includes(l)) {
    return [{ skip: "the line does not say whether this is double occupancy or maximum" }];
  }
  if (l === "length in feet" || l === "feet long" || l === "overall length") return [{ skip: "feet only; not converted" }];
  if (l === "length/beam/height") {
    const m = /^(\d+(?:\.\d+)?)\s*m\b/.exec(r);
    return m ? [{ property: "length_m", value: Number(m[1]), unit: "m" }] : [{ skip: "no length in metres first" }];
  }
  return [{ skip: "a label this pack does not read" }];
}

function observationFor(root, entity) {
  const file = path.join(root, OBS_DIR, `${entity.split(":")[1]}.json`);
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : null;
}

const FIELDS = ["gt", "gross_tonnage", "guests", "guests_double", "guests_max", "crew", "length", "length_m", "entered_service", "class", "imo", "maiden_voyage"];

/** The records for one page: the stats block on the HTML page, and the page.json data file. */
function recordsFor(root, page) {
  const out = [];
  const html = `ships/${page}.html`;
  if (fs.existsSync(path.join(root, html))) {
    const m = /<script[^>]*id="ship-stats-fallback"[^>]*>([\s\S]*?)<\/script>/.exec(fs.readFileSync(path.join(root, html), "utf8"));
    if (m) out.push({ file: html, at: "#ship-stats-fallback", data: JSON.parse(m[1]) });
  }
  const json = `assets/data/ships/${page}.page.json`;
  if (fs.existsSync(path.join(root, json))) {
    const d = JSON.parse(fs.readFileSync(path.join(root, json), "utf8"));
    if (d.ship_info) out.push({ file: json, at: "#ship_info", data: d.ship_info });
    else if (d.stats_fallback) out.push({ file: json, at: "#stats_fallback", data: { ...d.stats_fallback, class: d.stats_fallback.class ?? d.class, imo: d.stats_fallback.imo ?? d.imo } });
    else out.push({ file: json, at: "", data: d });
  }
  return out;
}

function commitDate(root, file) {
  const run = (args) => execFileSync("git", ["-C", root, ...args], { encoding: "utf8" }).trim();
  let iso;
  try { iso = run(["log", "-1", "--format=%cI", "--", file]); } catch { iso = ""; }
  if (!iso) throw fail("itw_source_uncommitted", `${file} has no commit`);
  if (run(["status", "--porcelain", "--", file])) throw fail("itw_source_uncommitted", `${file} has uncommitted edits`);
  return new Date(iso).toISOString();
}

export async function loadContract(env = process.env) {
  const dir = env.LEXICON_CONTRACT_DIR ? path.resolve(env.LEXICON_CONTRACT_DIR) : path.resolve(ROOT, "..", "Project-Sophos", "sophos", "src", "lexicon");
  try {
    const st = await import(pathToFileURL(path.join(dir, "statement.mjs")).href);
    const pk = await import(pathToFileURL(path.join(dir, "packs.mjs")).href);
    return { makeStatement: st.makeStatement, validateStatement: st.validateStatement, checkStatement: pk.checkStatement, validatePack: pk.validatePack, dir };
  } catch (err) {
    throw fail("itw_contract_unavailable", `no statement contract at ${dir} (${String(err?.message ?? err).split("\n")[0]})`);
  }
}

/** Build every pilot entity file. Returns { files: { relPath: text } }. Deterministic for a given tree. */
export async function buildShipStatements(root = ROOT, contract, pilot = PILOT) {
  const pack = JSON.parse(fs.readFileSync(path.join(root, PACK_FILE), "utf8"));
  const v = contract.validatePack(pack);
  if (!v.ok) throw fail("itw_statement_refused", `the cruise pack is invalid: ${v.errors.join("; ")}`);
  const aliases = JSON.parse(fs.readFileSync(path.join(root, ALIASES_FILE), "utf8")).lines;
  const lineOf = (dir) => Object.entries(aliases).find(([, l]) => l.aliases.some((a) => a.vocabulary === "ships/" && a.alias === dir));
  const imoOwner = new Map();
  const files = {};

  for (const ship of pilot) {
    const records = ship.pages.flatMap((p) => recordsFor(root, p));
    const found = new Map(); // property|value|unit -> { property, value, unit, refs:Set }
    const fileOfRef = new Map();
    const notFiled = [];
    const file = (property, value, unit, ref) => {
      const key = JSON.stringify([property, value, unit]);
      if (!found.has(key)) found.set(key, { property, value, unit, refs: new Set() });
      found.get(key).refs.add(ref);
    };
    for (const r of records) {
      for (const key of FIELDS) {
        if (!(key in r.data)) continue;
        for (const got of readField(key, r.data[key])) {
          const ref = `itw:${r.file}${r.at || "#"}.${key}`;
          fileOfRef.set(ref, r.file);
          if (got.skip) notFiled.push({ source: ref, raw: r.data[key], reason: got.skip });
          else file(got.property, got.value, got.unit, ref);
        }
      }
    }
    const line = lineOf(ship.lineDir);
    if (line) { const ref = `itw:${ALIASES_FILE}#ships/=${ship.lineDir}`; fileOfRef.set(ref, ALIASES_FILE); file("line", line[1].entity, null, ref); }
    else notFiled.push({ source: `ships/${ship.lineDir}/`, raw: ship.lineDir, reason: "no line alias for this folder" });

    // The line's own page (operator ruling 2026-10-25: the primary source).
    const obs = observationFor(root, ship.entity);
    const checks = obs ? [{ source_kind: obs.source_kind, publisher: obs.publisher, url: obs.url, retrieved_at: obs.retrieved_at, outcome: obs.outcome, figures: obs.items.length }] : [];
    const official = [];
    for (const item of obs?.outcome === "captured" ? obs.items : []) {
      for (const got of readOfficial(item.label, item.raw)) {
        if (got.skip) notFiled.push({ source: `${obs.url}#${item.label}`, raw: item.raw, reason: got.skip });
        else official.push({ ...got, url: obs.url, publisher: obs.publisher, at: obs.retrieved_at });
      }
    }

    const imos = [...found.values()].filter((f) => f.property === "imo").map((f) => f.value);
    if (new Set(imos).size > 1) throw fail("itw_identity_split", `${ship.entity}: its records name ${imos.length} IMOs (${imos.join(", ")})`);
    for (const imo of imos) {
      if (imoOwner.has(imo) && imoOwner.get(imo) !== ship.entity) throw fail("itw_identity_split", `IMO ${imo} is claimed by ${imoOwner.get(imo)} and ${ship.entity}`);
      imoOwner.set(imo, ship.entity);
    }

    const statements = [];
    for (const f of [...found.values()].sort((a, b) => a.property.localeCompare(b.property) || JSON.stringify(a.value).localeCompare(JSON.stringify(b.value)))) {
      const refs = [...f.refs].sort();
      const at = refs.map((ref) => commitDate(root, fileOfRef.get(ref))).sort().at(-1);
      const s = contract.makeStatement({
        pack: pack.pack, entity: ship.entity, property: f.property, value: f.value, unit: f.unit, partition: pack.partition,
        status: "inference", evidence: refs.map((ref) => ({ ref, tier: "secondary" })), sourceRef: refs[0], publisher: "In the Wake",
        assertedAt: at, observedAt: at, actor: ACTOR, clock: () => at,
      });
      const ok = contract.validateStatement(JSON.parse(JSON.stringify(s)));
      const fits = contract.checkStatement(pack, s);
      if (!ok.ok || !fits.ok) throw fail("itw_statement_refused", `${ship.entity} ${f.property}: ${[...(ok.errors ?? []), ...(fits.errors ?? [])].join("; ")}`);
      statements.push(s);
    }
    for (const o of official.sort((a, b) => a.property.localeCompare(b.property))) {
      const s = contract.makeStatement({
        pack: pack.pack, entity: ship.entity, property: o.property, value: o.value, unit: o.unit, partition: pack.partition,
        status: "verified", rank: "preferred", evidence: [{ ref: o.url, tier: "primary" }], sourceRef: o.url, uri: o.url,
        publisher: o.publisher, trustTier: "primary", observedAt: o.at, actor: ACTOR, clock: () => o.at,
      });
      const ok = contract.validateStatement(JSON.parse(JSON.stringify(s)));
      const fits = contract.checkStatement(pack, s);
      if (!ok.ok || !fits.ok) throw fail("itw_statement_refused", `${ship.entity} ${o.property} (line page): ${[...(ok.errors ?? []), ...(fits.errors ?? [])].join("; ")}`);
      statements.push(s);
    }
    const slug = ship.entity.split(":")[1];
    files[`${OUT_DIR}/${slug}.json`] = `${JSON.stringify({
      format: "lexicon-entity/1",
      entity: ship.entity,
      _about: "Generated by admin/lexicon/ship-statements.mjs. Statements from this repository's own records are status inference (source kind itw-data); statements from the cruise line's own page are status verified, rank preferred (source kind line-official; operator ruling 2026-10-25), read by admin/lexicon/capture-official.mjs. Do not edit by hand: each statement's id is a hash of its content. checks lists every line page opened and what it showed; not_filed lists every value a source states that was not filed, and why.",
      sources: records.map((r) => r.file),
      checks,
      statements,
      not_filed: notFiled,
    }, null, 2)}\n`;
  }
  return { files };
}

async function main(argv) {
  let built;
  try { built = await buildShipStatements(ROOT, await loadContract()); }
  catch (err) {
    const exit = { itw_contract_unavailable: 2, itw_identity_split: 3, itw_source_uncommitted: 4, itw_statement_refused: 5 }[err.code] ?? 5;
    process.stderr.write(`ship-statements: ${err.code ?? "itw_statement_refused"}: ${err.message}\n  remedy: see the exit codes at the top of admin/lexicon/ship-statements.mjs\n`);
    return exit;
  }
  const stale = [];
  for (const [rel, text] of Object.entries(built.files)) {
    const abs = path.join(ROOT, rel);
    const current = fs.existsSync(abs) ? fs.readFileSync(abs, "utf8") : null;
    if (current === text) continue;
    if (argv.includes("--check")) { stale.push(rel); continue; }
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, text);
    process.stdout.write(`ship-statements: wrote ${rel}\n`);
  }
  if (stale.length) {
    process.stderr.write(`ship-statements: itw_ship_statements_stale: ${stale.join(", ")}\n  remedy: node admin/lexicon/ship-statements.mjs, then commit\n`);
    return 1;
  }
  if (argv.includes("--check")) process.stdout.write(`ship-statements: current (${Object.keys(built.files).length} files)\n`);
  return 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = await main(process.argv.slice(2));
