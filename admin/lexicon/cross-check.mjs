#!/usr/bin/env node
// Cross-check of ship facts that more than one of In the Wake's own files carries (Tekton itw-c8-data-cross-check-ci;
// Project-Sophos docs/lexicon/LEXICON-PLAN-3.1.md section 8, gate itw_data_cross_check). Doc: admin/lexicon/CROSS-CHECK.md.
// Soli Deo Gloria.
//
// WHY. The plan's census found that nothing in CI compared any data file with another, or with the pages: a ship's
// IMO number, tonnage, guest count or crew can sit in seven places, and when one copy is corrected the others are
// not. This reads every copy, normalises each value with the same strict reader C2 files statements with
// (readField in ./ship-statements.mjs: an approximate figure, a placeholder or an unlabelled guest count is never
// compared), and reports every ship and property where two sources disagree. It never picks a side and never
// edits data: which copy is right is a research question for a person.
//
// IDENTITY. Sources are joined on the ship slug alone, exactly as each file spells it. Nothing is matched by
// name or by similarity, so two spellings of one ship are not compared (an honest miss, counted as `unjoined`),
// and two different ships are never merged. The size atlas keys ships as `<line>-<slug>`; its line prefix is
// removed only when what remains is a slug some other source uses.
//
//   node admin/lexicon/cross-check.mjs                    check: refuse a disagreement the baseline does not hold
//   node admin/lexicon/cross-check.mjs --base <ref>       same, and refuse a baseline that grew since <ref> (CI)
//   node admin/lexicon/cross-check.mjs --report           print every disagreement and what each source says
//   node admin/lexicon/cross-check.mjs --shrink-baseline  drop baseline entries that no longer disagree
//
// @exit 0 nothing refused: every disagreement is a known one in the baseline (resolved ones are reported, not refused)
// @exit 1 refused (itw_data_cross_check): two files disagree on a ship fact the baseline does not hold, or the baseline grew. remedy: correct the wrong copy from a primary source (the line's own page or the IMO register), never edit the baseline to admit it
// @exit 3 could not look (itw_cross_check_unavailable): a source file could not be read or parsed, or the baseline is malformed. remedy: fix the file the message names; a source that cannot be read is never a pass
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { readField } from "./ship-statements.mjs";

const ROOT = fileURLToPath(new URL("../..", import.meta.url));
export const BASELINE = "assets/data/lexicon/cross-check-baseline.json";
const DOC = "admin/lexicon/CROSS-CHECK.md";
export const PROPERTIES = ["imo", "gross_tonnage", "guests_double", "guests_max", "crew"];

const unavailable = (detail) => Object.assign(new Error(detail), { code: "itw_cross_check_unavailable" });

function readJson(root, rel) {
  let text;
  try { text = readFileSync(join(root, rel), "utf8"); } catch { throw unavailable(`${rel} could not be read`); }
  try { return JSON.parse(text); } catch (e) { throw unavailable(`${rel} is not valid JSON (${e.message})`); }
}

/** Every value readField accepts for these raw keys, as observations. */
function observe(out, slug, fields, file, path) {
  for (const [key, raw] of Object.entries(fields)) {
    if (raw === undefined) continue;
    for (const r of readField(key, raw)) {
      if (r.skip || !PROPERTIES.includes(r.property)) continue;
      out.push({ slug, property: r.property, value: String(r.value), source: `${file} ${path}.${key}` });
    }
  }
}

// One adapter per source shape. Each returns observations; an unreadable file throws unavailable.
export const SOURCES = [
  { id: "ship-page", describe: "ships/<line>/<slug>.html, the #ship-stats-fallback block readers see",
    collect(root) {
      const out = [];
      const dir = join(root, "ships");
      if (!existsSync(dir)) return out;
      for (const line of readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory())) {
        for (const f of readdirSync(join(dir, line.name)).filter((n) => n.endsWith(".html"))) {
          const rel = `ships/${line.name}/${f}`;
          const html = readFileSync(join(root, rel), "utf8");
          const m = /id="ship-stats-fallback"[^>]*>([\s\S]*?)<\/script>/.exec(html);
          if (!m) continue;
          let fb;
          try { fb = JSON.parse(m[1]); } catch { throw unavailable(`${rel}: #ship-stats-fallback is not valid JSON`); }
          observe(out, f.slice(0, -5), { gt: fb.gt, guests: fb.guests, crew: fb.crew, imo: fb.imo }, rel, "#ship-stats-fallback");
        }
      }
      return out;
    } },
  { id: "ship-record", describe: "assets/data/ships/<line>/<slug>.page.json",
    collect(root) {
      const out = [];
      const dir = join(root, "assets/data/ships");
      if (!existsSync(dir)) return out;
      for (const line of readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory())) {
        for (const f of readdirSync(join(dir, line.name)).filter((n) => n.endsWith(".page.json"))) {
          const rel = `assets/data/ships/${line.name}/${f}`;
          const j = readJson(root, rel);
          const slug = f.slice(0, -".page.json".length);
          observe(out, slug, { imo: j.imo, gt: j.gt, guests_double: j.guests_double, guests_max: j.guests_max, crew: j.crew }, rel, "$");
          if (j.tracker && typeof j.tracker === "object") observe(out, slug, { imo: j.tracker.imo }, rel, "$.tracker");
        }
      }
      return out;
    } },
  ...["assets/data/rc_ships_meta.json", "assets/data/ncl_ships_meta.json"].map((rel) => ({
    id: rel.split("/").pop().replace(".json", ""), describe: `${rel}: a map keyed by slug under the line's name, and a ships[] array`,
    collect(root) {
      if (!existsSync(join(root, rel))) return [];
      const out = [], j = readJson(root, rel);
      for (const [top, v] of Object.entries(j)) {
        if (top === "ships" || !v || typeof v !== "object" || Array.isArray(v)) continue;
        for (const [slug, s] of Object.entries(v)) if (s && typeof s === "object") observe(out, slug, { imo: s.imo }, rel, `$["${top}"]["${slug}"]`);
      }
      (Array.isArray(j.ships) ? j.ships : []).forEach((s, i) => s && s.slug &&
        observe(out, s.slug, { imo: s.imo, gt: s.gt, crew: s.crew }, rel, `$.ships[${i}]`));
      return out;
    } })),
  { id: "vf_overrides", describe: "assets/data/vf_overrides.json, keyed by slug",
    collect(root) {
      const rel = "assets/data/vf_overrides.json";
      if (!existsSync(join(root, rel))) return [];
      const out = [];
      for (const [slug, s] of Object.entries(readJson(root, rel))) observe(out, slug, { imo: s && s.imo }, rel, `$["${slug}"]`);
      return out;
    } },
  { id: "ship-space-and-crew", describe: "assets/data/ship-space-and-crew.json, ships[].slug",
    collect(root) {
      const rel = "assets/data/ship-space-and-crew.json";
      if (!existsSync(join(root, rel))) return [];
      const out = [];
      (readJson(root, rel).ships || []).forEach((s, i) => s && s.slug && observe(out, s.slug,
        { gross_tonnage: s.gross_tonnage, guests_double: s.guests_double_occupancy, crew: s.crew }, rel, `$.ships[${i}]`));
      return out;
    } },
  { id: "fleet_index", describe: "assets/data/fleet_index.json, cruise_lines[].ships[].slug",
    collect(root) {
      const rel = "assets/data/fleet_index.json";
      if (!existsSync(join(root, rel))) return [];
      const out = [];
      (readJson(root, rel).cruise_lines || []).forEach((l, i) => (l.ships || []).forEach((s, k) => s && s.slug &&
        observe(out, s.slug, { gt: s.gt }, rel, `$.cruise_lines[${i}].ships[${k}]`)));
      return out;
    } },
  { id: "ship-size-atlas", describe: "data/atlas/ship-size-atlas.json, ships[].ship_id as <line>-<slug>",
    collect(root, knownSlugs) {
      const rel = "data/atlas/ship-size-atlas.json";
      if (!existsSync(join(root, rel))) return [];
      const out = [];
      (readJson(root, rel).ships || []).forEach((s, i) => {
        if (!s || typeof s.ship_id !== "string") return;
        const rest = s.ship_id.replace(/^[a-z0-9]+-/, "");
        const slug = knownSlugs.has(s.ship_id) ? s.ship_id : knownSlugs.has(rest) ? rest : null;
        if (!slug) return;
        observe(out, slug, { gt: s.gt, guests_double: s.pax_double, guests_max: s.pax_max, crew: s.crew }, rel, `$.ships[${i}]`);
      });
      return out;
    } },
];

/** Read every source. Returns { observations, perSource }. */
export function collect(root = ROOT, sources = SOURCES) {
  const observations = [], perSource = {};
  const later = [];
  for (const s of sources) {
    if (s.collect.length >= 2) { later.push(s); continue; }
    const got = s.collect(root);
    perSource[s.id] = got.length;
    observations.push(...got);
  }
  const known = new Set(observations.map((o) => o.slug));
  for (const s of later) { const got = s.collect(root, known); perSource[s.id] = got.length; observations.push(...got); }
  return { observations, perSource };
}

/** Group observations by ship and property; a disagreement is two or more distinct values. */
export function compare(observations) {
  const groups = new Map();
  for (const o of observations) {
    const key = `${o.slug}#${o.property}`;
    if (!groups.has(key)) groups.set(key, new Map());
    const byValue = groups.get(key);
    if (!byValue.has(o.value)) byValue.set(o.value, []);
    byValue.get(o.value).push(o.source);
  }
  const disagreements = [];
  let compared = 0;
  for (const [key, byValue] of [...groups].sort(([a], [b]) => a.localeCompare(b))) {
    const sources = [...byValue.values()].flat().length;
    if (sources >= 2) compared++;
    if (byValue.size < 2) continue;
    disagreements.push({ key, values: [...byValue].map(([value, from]) => ({ value, sources: from.sort() })).sort((a, b) => a.value.localeCompare(b.value)) });
  }
  return { disagreements, compared };
}

export function parseBaseline(text) {
  if (text == null) return {};
  const b = JSON.parse(text);
  if (!b || typeof b.known !== "object" || Array.isArray(b.known)) throw new Error(`${BASELINE}: "known" must be an object`);
  for (const [k, v] of Object.entries(b.known)) {
    if (!/^[a-z0-9-]+#[a-z_]+$/.test(k) || !Array.isArray(v) || v.some((x) => typeof x !== "string")) throw new Error(`${BASELINE}: bad entry "${k}"`);
  }
  return b.known;
}

export function renderBaseline(known) {
  const sorted = Object.fromEntries(Object.keys(known).sort().map((k) => [k, [...known[k]].sort()]));
  return JSON.stringify({
    _about: `Lexicon C8 shrink-only baseline: ship facts on which In the Wake's own files already disagreed when the check was built, with the values each disagreement had. ${DOC}. An entry may be removed when the copies are reconciled (node admin/lexicon/cross-check.mjs --shrink-baseline), never added. A new value in a known disagreement is a new disagreement.`,
    known: sorted,
  }, null, 2) + "\n";
}

/**
 * Judge the disagreements against the baseline. A disagreement is known when the baseline holds its key and every
 * value it now has is one the baseline already held: correcting one copy of a three-way split leaves a two-way split
 * that is still known, because that is progress, not a new fault. A value the baseline never held is new.
 * Returns { fresh, resolved, narrowed, grew }.
 */
export function judge(disagreements, known, priorKnown) {
  const fresh = [], narrowed = [], seen = new Set();
  for (const d of disagreements) {
    seen.add(d.key);
    const now = d.values.map((v) => v.value);
    const was = known[d.key];
    if (!was || now.some((v) => !was.includes(v))) fresh.push(d);
    else if (now.length < was.length) narrowed.push(d.key);
  }
  const resolved = Object.keys(known).filter((k) => !seen.has(k)).sort();
  const grew = [];
  if (priorKnown) {
    for (const [k, vals] of Object.entries(known)) {
      const p = priorKnown[k];
      if (!p) { grew.push(k); continue; }
      if (vals.some((v) => !p.includes(v))) grew.push(k);
    }
  }
  return { fresh, resolved, narrowed, grew: grew.sort() };
}

function show(d) {
  return [`  ${d.key}`, ...d.values.map((v) => `      ${v.value}  <- ${v.sources.join(" ; ")}`)].join("\n");
}

function main(argv) {
  const root = argv.includes("--root") ? argv[argv.indexOf("--root") + 1] : ROOT;
  const { observations, perSource } = collect(root);
  const { disagreements, compared } = compare(observations);
  const baselinePath = join(root, BASELINE);
  let known;
  try { known = parseBaseline(existsSync(baselinePath) ? readFileSync(baselinePath, "utf8") : null); }
  catch (e) { throw unavailable(e.message); }

  if (argv.includes("--report")) {
    console.log(`cross-check: ${observations.length} values from ${Object.keys(perSource).length} sources (${Object.entries(perSource).map(([k, v]) => `${k} ${v}`).join(", ")})`);
    console.log(`cross-check: ${compared} ship facts carried by two or more sources; ${disagreements.length} disagree`);
    for (const d of disagreements) console.log(show(d));
    return 0;
  }
  if (argv.includes("--shrink-baseline")) {
    // Only ever removes: a resolved key goes, and a narrowed key keeps only the values it still has.
    const now = new Map(disagreements.map((d) => [d.key, d.values.map((v) => v.value)]));
    const next = {};
    let removedValues = 0;
    for (const [k, vals] of Object.entries(known)) {
      if (!now.has(k)) { removedValues += vals.length; continue; }
      const keep = vals.filter((v) => now.get(k).includes(v));
      removedValues += vals.length - keep.length;
      next[k] = keep;
    }
    writeFileSync(baselinePath, renderBaseline(next));
    console.log(`cross-check: baseline shrunk (${Object.keys(known).length - Object.keys(next).length} resolved, ${removedValues} value(s) dropped); stage ${BASELINE}`);
    return 0;
  }
  let priorKnown = null;
  const base = argv.includes("--base") ? argv[argv.indexOf("--base") + 1] : null;
  if (base) {
    let text = null;
    try { text = execFileSync("git", ["-C", root, "show", `${base}:${BASELINE}`], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }); } catch { text = null; }
    try { priorKnown = text == null ? null : parseBaseline(text); } catch (e) { throw unavailable(`${base}:${BASELINE}: ${e.message}`); }
  }
  const { fresh, resolved, narrowed, grew } = judge(disagreements, known, priorKnown);
  if (resolved.length || narrowed.length) console.log(`cross-check: ${resolved.length} known disagreement(s) resolved and ${narrowed.length} narrowed (not refused). Shrink with: node admin/lexicon/cross-check.mjs --shrink-baseline`);
  if (fresh.length || grew.length) {
    for (const d of fresh) console.error(`cross-check: REFUSED itw_data_cross_check: two files disagree on a ship fact the baseline does not hold:\n${show(d)}`);
    for (const k of grew) console.error(`cross-check: REFUSED itw_data_cross_check: ${BASELINE} grew at "${k}"; the baseline only shrinks`);
    console.error(`  remedy: correct the wrong copy from a primary source (the line's own ship page or the IMO register), so every file says the same; never add a baseline entry. ${DOC}`);
    return 1;
  }
  console.log(`cross-check: ${compared} shared ship facts compared; ${disagreements.length} disagreement(s), all known`);
  return 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  let code;
  try { code = main(process.argv.slice(2)); }
  catch (e) {
    if (e.code !== "itw_cross_check_unavailable") throw e;
    console.error(`cross-check: UNAVAILABLE itw_cross_check_unavailable: ${e.message}`);
    console.error(`  remedy: fix the file named above. A source that cannot be read is never a pass. ${DOC}`);
    code = 3;
  }
  process.exit(code);
}
