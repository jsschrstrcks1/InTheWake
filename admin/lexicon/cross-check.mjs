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
// removed only when what remains is a slug some other source uses. A voyage pack names its ship only in prose, so a
// pack is joined through the hand-declared map in assets/data/lexicon/pack-ships.json and through nothing else.
//
//   node admin/lexicon/cross-check.mjs                    check: refuse a disagreement the baseline does not hold
//   node admin/lexicon/cross-check.mjs --base <ref>       same, and refuse a baseline that grew since <ref> (CI)
//   node admin/lexicon/cross-check.mjs --report           print every disagreement and what each source says
//   node admin/lexicon/cross-check.mjs --shrink-baseline  drop baseline entries that no longer disagree
//   node admin/lexicon/cross-check.mjs --adopt-sources    record a newly read source, admitting only what it alone reveals
//
// @exit 0 nothing refused: every disagreement is a known one in the baseline (resolved ones are reported, not refused)
// @exit 1 refused (itw_data_cross_check): two files disagree on a ship fact the baseline does not hold, the baseline grew beyond what a newly read source alone reveals, or its "sources" list is not the tool's. remedy: correct the wrong copy from a primary source (the line's own page or the IMO register), never edit the baseline to admit it
// @exit 3 could not look (itw_cross_check_unavailable): a source file could not be read or parsed, or the baseline is malformed. remedy: fix the file the message names; a source that cannot be read is never a pass
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { readField, readOfficial } from "./ship-statements.mjs";

const ROOT = fileURLToPath(new URL("../..", import.meta.url));
export const BASELINE = "assets/data/lexicon/cross-check-baseline.json";
const DOC = "admin/lexicon/CROSS-CHECK.md";
export const PROPERTIES = ["imo", "gross_tonnage", "guests_double", "guests_max", "crew"];
const OBS_DIR = "assets/data/lexicon/observations";
const PACK_DIR = "admin/voyage-packs";
// A pack names its ship in prose ("NCL Escape"), not by slug, so the join is declared by hand here and never
// inferred from a name.
export const PACK_SHIPS = "assets/data/lexicon/pack-ships.json";
const APPROX_WORDS = /~|≈|approx|\babout\b|\baround\b|\broughly\b/i;
const INT_ONLY = /^\d{1,3}(?:,\d{3})+$|^\d+$/;

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
  { id: "line-official", describe: `${OBS_DIR}/<slug>.json, figures captured from the line's own ship page (C2b)`,
    collect(root) {
      const dir = join(root, OBS_DIR);
      if (!existsSync(dir)) return [];
      const out = [];
      for (const f of readdirSync(dir).filter((n) => n.endsWith(".json")).sort()) {
        const rel = `${OBS_DIR}/${f}`, o = readJson(root, rel);
        // Only a page the line actually served is a reading; content_not_served and the like hold no figures.
        if (o.outcome !== "captured" || typeof o.entity !== "string" || !o.entity.startsWith("ship:")) continue;
        (Array.isArray(o.items) ? o.items : []).forEach((it, i) => {
          if (!it || typeof it !== "object") return;
          for (const r of readOfficial(it.label, it.raw)) {
            if (r.skip || !PROPERTIES.includes(r.property)) continue;
            out.push({ slug: o.entity.slice(5), property: r.property, value: String(r.value), source: `${rel} $.items[${i}]` });
          }
        });
      }
      return out;
    } },
  { id: "voyage-pack", describe: `${PACK_DIR}/<pack>.factcheck.json ship_specs, joined to a ship only through ${PACK_SHIPS}`,
    collect(root) {
      const dir = join(root, PACK_DIR);
      if (!existsSync(dir)) return [];
      const map = packShips(root);
      const out = [];
      for (const f of readdirSync(dir).filter((n) => n.endsWith(".factcheck.json")).sort()) {
        const slug = map[f.slice(0, -".factcheck.json".length)];
        if (typeof slug !== "string") continue; // not joined: named by unjoinedPacks, never guessed from the name
        const rel = `${PACK_DIR}/${f}`, specs = readJson(root, rel).ship_specs;
        if (!specs || typeof specs !== "object") continue;
        for (const [key, entry] of Object.entries(specs)) {
          const raw = entry && typeof entry === "object" ? entry.value : entry;
          for (const r of readPackSpec(key, raw)) {
            if (r.skip || !PROPERTIES.includes(r.property)) continue;
            out.push({ slug, property: r.property, value: String(r.value), source: `${rel} $.ship_specs.${key}` });
          }
        }
      }
      return out;
    } },
];

function packShips(root) {
  if (!existsSync(join(root, PACK_SHIPS))) return {};
  const map = readJson(root, PACK_SHIPS).packs;
  if (!map || typeof map !== "object" || Array.isArray(map)) throw unavailable(`${PACK_SHIPS}: "packs" must be an object`);
  for (const [k, v] of Object.entries(map)) {
    if (!/^[a-z0-9-]+$/.test(String(v))) throw unavailable(`${PACK_SHIPS}: pack "${k}" must map to a ship slug`);
  }
  return map;
}

/** Packs with a fact sheet that PACK_SHIPS does not join to a ship: compared with nothing, and said so on every run. */
export function unjoinedPacks(root = ROOT) {
  const dir = join(root, PACK_DIR);
  if (!existsSync(dir)) return [];
  const map = packShips(root);
  return readdirSync(dir).filter((n) => n.endsWith(".factcheck.json")).map((n) => n.slice(0, -".factcheck.json".length))
    .filter((p) => !(p in map)).sort();
}

/**
 * A voyage pack's ship_specs value, read as strictly as readField. A pack writes prose ("1,733 crew", "4,218 guests
 * at double occupancy", "5,610 double / 7,600 max"), so only a figure carrying its own label is read: a guest count
 * is double or maximum only when it says so ("lower berths" and "full occupancy" are read as neither), and anything
 * approximate ("~", "about") is skipped whole.
 */
export function readPackSpec(key, raw) {
  if (typeof raw !== "string" && typeof raw !== "number") return [];
  const s = String(raw).trim();
  if (APPROX_WORDS.test(s)) return [{ skip: "approximate" }];
  const count = (t) => Number(t.replace(/,/g, ""));
  switch (key) {
    case "gross_tonnage": return readField("gross_tonnage", s);
    case "crew": return readField("crew", s.replace(/\s+crew$/i, ""));
    case "imo": return readField("imo", s);
    case "guests_double_occupancy":
      return INT_ONLY.test(s) ? [{ property: "guests_double", value: count(s), unit: "guests" }] : [{ skip: "not a plain count" }];
    case "guests": case "capacity": case "capacity_double_max": {
      const out = [];
      const dbl = /(\d[\d,]*)\s+(?:guests\s+)?(?:at\s+)?\(?double\b/i.exec(s);
      const max = /(\d[\d,]*)\s+(?:guests\s+)?(?:at\s+)?(?:maximum|max)\b/i.exec(s);
      if (dbl && INT_ONLY.test(dbl[1])) out.push({ property: "guests_double", value: count(dbl[1]), unit: "guests" });
      if (max && INT_ONLY.test(max[1])) out.push({ property: "guests_max", value: count(max[1]), unit: "guests" });
      return out.length ? out : [{ skip: "an unlabelled guest count (neither double nor max is stated)" }];
    }
    default: return [];
  }
}

/** Read every source. Returns { observations, perSource }. */
export function collect(root = ROOT, sources = SOURCES) {
  const observations = [], perSource = {};
  const later = [];
  for (const s of sources) {
    if (s.collect.length >= 2) { later.push(s); continue; }
    const got = s.collect(root).map((o) => ({ ...o, via: s.id }));
    perSource[s.id] = got.length;
    observations.push(...got);
  }
  const known = new Set(observations.map((o) => o.slug));
  for (const s of later) {
    const got = s.collect(root, known).map((o) => ({ ...o, via: s.id }));
    perSource[s.id] = got.length;
    observations.push(...got);
  }
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

// The sources the first baseline (2026-10-26, #2661) was built with. It recorded none, so a baseline without a
// "sources" list means exactly these.
export const FIRST_SOURCES = Object.freeze(["ship-page", "ship-record", "rc_ships_meta", "ncl_ships_meta", "vf_overrides", "ship-space-and-crew", "fleet_index", "ship-size-atlas"]);

/** The source ids a baseline was built with. */
export function baselineSources(text) {
  if (text == null) return null;
  const s = JSON.parse(text).sources;
  if (s === undefined) return [...FIRST_SOURCES];
  if (!Array.isArray(s) || s.some((x) => typeof x !== "string")) throw new Error(`${BASELINE}: "sources" must be a list of source ids`);
  return s;
}

export function renderBaseline(known, sources = SOURCES.map((s) => s.id)) {
  const sorted = Object.fromEntries(Object.keys(known).sort().map((k) => [k, [...known[k]].sort()]));
  return JSON.stringify({
    _about: `Lexicon C8 shrink-only baseline: ship facts on which In the Wake's own files already disagreed when each source was first read, with the values each disagreement had. ${DOC}. An entry may be removed when the copies are reconciled (node admin/lexicon/cross-check.mjs --shrink-baseline), never added, except in the commit that adds a source to "sources", and then only for what that new source alone reveals. A new value in a known disagreement is a new disagreement.`,
    sources: [...sources].sort(),
    known: sorted,
  }, null, 2) + "\n";
}

/**
 * The one way the baseline may grow: the commit that adds a source may admit what that source alone reveals. A grown
 * key is admitted only when, with the new sources' readings removed, it either does not disagree or holds no value
 * the prior baseline lacked. So a copy edited in an old file in the same commit is still refused, and a source that
 * was dropped is refused outright, because dropping a reader is the quiet way to make a disagreement disappear. With
 * `known` (the baseline being judged), an admitted entry may hold only values read today or already known.
 * Returns { admitted, refused, dropped }.
 */
export function adoption(grew, observations, priorSources, currentSources, priorKnown, known = null) {
  const added = currentSources.filter((s) => !priorSources.includes(s));
  const dropped = priorSources.filter((s) => !currentSources.includes(s)).sort();
  const admitted = [], refused = [];
  for (const key of grew) {
    if (!added.length) { refused.push(key); continue; }
    const old = new Set(observations.filter((o) => `${o.slug}#${o.property}` === key && !added.includes(o.via)).map((o) => o.value));
    const p = priorKnown[key] || [];
    // The entry itself may hold only values that are read today or were already known: no spare value to park.
    const seen = new Set(observations.filter((o) => `${o.slug}#${o.property}` === key).map((o) => o.value));
    const honest = !known || (known[key] || []).every((v) => seen.has(v) || p.includes(v));
    (honest && (old.size < 2 || [...old].every((v) => p.includes(v))) ? admitted : refused).push(key);
  }
  return { admitted, refused, dropped, added };
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
  const current = SOURCES.map((s) => s.id);
  let known, recorded;
  try {
    const text = existsSync(baselinePath) ? readFileSync(baselinePath, "utf8") : null;
    known = parseBaseline(text);
    recorded = baselineSources(text) || [...current];
  } catch (e) { throw unavailable(e.message); }
  const unjoined = unjoinedPacks(root);
  if (unjoined.length) console.log(`cross-check: ${unjoined.length} voyage pack(s) not joined to a ship in ${PACK_SHIPS}, so compared with nothing: ${unjoined.join(", ")}`);

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
    writeFileSync(baselinePath, renderBaseline(next, recorded));
    console.log(`cross-check: baseline shrunk (${Object.keys(known).length - Object.keys(next).length} resolved, ${removedValues} value(s) dropped); stage ${BASELINE}`);
    return 0;
  }
  if (argv.includes("--adopt-sources")) {
    // Records the sources the tool now reads, admitting only what a newly read source alone reveals.
    const { fresh } = judge(disagreements, known, null);
    const r = adoption(fresh.map((d) => d.key), observations, recorded, current, known);
    if (r.dropped.length || r.refused.length) {
      for (const id of r.dropped) console.error(`cross-check: REFUSED itw_data_cross_check: source "${id}" is in the baseline but no longer read`);
      for (const d of fresh.filter((x) => r.refused.includes(x.key))) console.error(`cross-check: REFUSED itw_data_cross_check: this disagreement is not the new source's alone:\n${show(d)}`);
      console.error(`  remedy: correct the wrong copy among the sources already read, then adopt again. ${DOC}`);
      return 1;
    }
    const next = { ...known };
    for (const d of fresh) next[d.key] = d.values.map((v) => v.value);
    writeFileSync(baselinePath, renderBaseline(next, current));
    console.log(`cross-check: adopted ${r.added.length ? r.added.join(", ") : "no new source"}; ${fresh.length} disagreement(s) that only the new source reveals were recorded; stage ${BASELINE}`);
    return 0;
  }
  const stale = [...current.filter((s) => !recorded.includes(s)), ...recorded.filter((s) => !current.includes(s))];
  if (stale.length) {
    console.error(`cross-check: REFUSED itw_data_cross_check: the baseline's "sources" (${recorded.join(", ")}) is not the list the tool reads; differs at ${stale.join(", ")}`);
    console.error(`  remedy: run node admin/lexicon/cross-check.mjs --adopt-sources in the commit that adds or removes a source. ${DOC}`);
    return 1;
  }
  let priorKnown = null, priorSources = null;
  const base = argv.includes("--base") ? argv[argv.indexOf("--base") + 1] : null;
  if (base) {
    let text = null;
    try { text = execFileSync("git", ["-C", root, "show", `${base}:${BASELINE}`], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }); } catch { text = null; }
    try {
      priorKnown = text == null ? null : parseBaseline(text);
      priorSources = baselineSources(text);
    } catch (e) { throw unavailable(`${base}:${BASELINE}: ${e.message}`); }
  }
  const { fresh, resolved, narrowed, grew: grown } = judge(disagreements, known, priorKnown);
  let grew = grown;
  if (priorKnown && (grown.length || priorSources.some((s) => !recorded.includes(s)))) {
    const r = adoption(grown, observations, priorSources, recorded, priorKnown, known);
    if (r.admitted.length) console.log(`cross-check: ${r.admitted.length} baseline entr(ies) admitted because only the newly read ${r.added.join(", ")} reveals them`);
    grew = [...r.refused, ...r.dropped.map((id) => `sources:${id}`)];
  }
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
