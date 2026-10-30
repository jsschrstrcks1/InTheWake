#!/usr/bin/env node
// Port statements: one identity for every port list (Tekton itw-c6-port-pack; Project-Sophos
// docs/lexicon/LEXICON-PLAN-3.1.md section 6, cruise.port; operator rulings 2026-10-29: positions are geo
// values with a pack-declared tolerance, and the gazetteer reads for the disputed ports come in the next build).
//
// WHY. A port lived in seven files that shared no identity: the page itself, port-registry.json, ports-geo.json,
// port-summaries.json, seasonal-guides.json, maps/<slug>.map.json and data/ports.csv. Each gave its own copy of
// the facts, and nothing said where they disagreed. This tool files every port as `port:<slug>` (the page slug)
// with its facts as statements, maps every list's key to that identity, and names every disagreement.
//
// WHAT IT FILES, per port page (ports/<slug>.html), from this repository's own committed files only:
//   name               the registry's short name ("Abu Dhabi"; ports-geo carries the same, cited on it)
//   page_place_name    the name the page uses for its place (JSON-LD mainEntity), often qualified with a terminal
//                      or region ("Abu Dhabi / Zayed Port"): a second fact, not a disputed copy of name. Where
//                      neither name contains the other, the port is listed under name_review in the dispute list
//                      for a person to read (a substring test is a heuristic, so it is a review list, not a conflict)
//   place_position     the destination the guide is about: the page's JSON-LD mainEntity geo, the registry, and
//                      ports-geo (which matches the registry to the metre on every port: a copy, not a second
//                      witness, so it is cited on the same statement, never counted as agreement)
//   terminal_position  where a ship docks or tenders: the map's port_pin. A different place from the town, not a
//                      disputed copy of it, so it is its own property
//   tender_port        the registry's tenderPort
// Identical values from several files are ONE statement citing all of them. Different values are separate
// statements; the contract's findConflicts names a disagreement only beyond the pack's tolerance (5 km for a
// destination, 500 m for a terminal), and every disagreement is written to assets/data/lexicon/port-disputes.json,
// the work list for the gazetteer reads. Every statement is status inference (this site's own records); training
// recall is never a source. A record dated by its file's last commit, so committed content only.
//
//   node admin/lexicon/port-statements.mjs           write the entity files, the alias table and the dispute list
//   node admin/lexicon/port-statements.mjs --check   change nothing; exit 1 if any of them is not what the files say
//
// @exit 0 written, or --check found everything current
// @exit 1 refused: itw_port_statements_stale, an entity file, the alias table or the dispute list differs from what the sources say. remedy: commit the source change, then run node admin/lexicon/port-statements.mjs and commit what it writes
// @exit 2 could not look: itw_port_statements_unavailable, the statement contract or a source file could not be read, or a source has uncommitted edits or no history in this clone. remedy: the message names the file; commit it, or fetch full history (git fetch --unshallow)
// Soli Deo Gloria.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { commitDate, loadContract } from "./ship-statements.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
export const OUT_DIR = "assets/data/entities/port";
export const PACK_FILE = "assets/data/lexicon/cruise.port.pack.json";
export const ALIASES_FILE = "assets/data/lexicon/port-aliases.json";
export const DISPUTES_FILE = "assets/data/lexicon/port-disputes.json";
const REGISTRY = "assets/data/ports/port-registry.json";
const GEO = "assets/data/ports/ports-geo.json";
const SUMMARIES = "assets/data/ports/port-summaries.json";
const SEASONAL = "assets/data/ports/seasonal-guides.json";
const MAPS_DIR = "assets/data/maps";
const CSV = "data/ports.csv";
const ACTOR = Object.freeze({ kind: "tool", id: "itw-lexicon-port-statements", provider: "household" });
const fail = (code, message) => Object.assign(new Error(message), { code });
const readJson = (root, rel) => {
  try { return JSON.parse(fs.readFileSync(path.join(root, rel), "utf8")); }
  catch (e) { throw fail("itw_port_statements_unavailable", `${rel} could not be read (${e.message})`); }
};

/** The page's own Place: name and position from its JSON-LD WebPage.mainEntity. Null fields when absent. */
export function pagePlace(html) {
  const out = { name: null, position: null, count: 0 };
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    let doc;
    try { doc = JSON.parse(m[1]); } catch { continue; }
    const stack = [doc];
    while (stack.length) {
      const o = stack.pop();
      if (Array.isArray(o)) { stack.push(...o); continue; }
      if (!o || typeof o !== "object") continue;
      const me = o["@type"] === "WebPage" && o.mainEntity && typeof o.mainEntity === "object" ? o.mainEntity : null;
      if (me) {
        out.count++;
        if (typeof me.name === "string" && me.name.trim()) out.name = me.name.trim();
        const g = me.geo;
        if (g && Number.isFinite(Number(g.latitude)) && Number.isFinite(Number(g.longitude))) out.position = { lat: Number(g.latitude), lon: Number(g.longitude) };
      }
      stack.push(...Object.values(o));
    }
  }
  return out;
}

const norm = (s) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

/** Parse data/ports.csv's first column (quoted fields allowed). */
function csvPorts(text) {
  const rows = [];
  for (const line of text.split(/\r?\n/).slice(1)) {
    if (!line.trim()) continue;
    const m = /^"((?:[^"]|"")*)"|^([^,]*)/.exec(line);
    rows.push((m[1] !== undefined ? m[1].replace(/""/g, '"') : m[2]).trim());
  }
  return rows;
}

/** Every source read, per port slug: the facts each file states, with the file and a ref. */
export function readSources(root) {
  const pages = fs.readdirSync(path.join(root, "ports")).filter((f) => f.endsWith(".html")).map((f) => f.slice(0, -5)).sort();
  const registry = readJson(root, REGISTRY).ports || {};
  const geo = Object.fromEntries((readJson(root, GEO).ports || []).map((p) => [p.id, p]));
  const summaries = Object.fromEntries((readJson(root, SUMMARIES).ports || []).map((p) => [p.slug, p]));
  const seasonal = Object.fromEntries(Object.entries(readJson(root, SEASONAL)).filter(([k]) => !k.startsWith("_")));
  const maps = {};
  for (const f of fs.readdirSync(path.join(root, MAPS_DIR)).filter((f) => f.endsWith(".map.json")).sort()) {
    const d = readJson(root, `${MAPS_DIR}/${f}`);
    maps[d.port_slug] = { file: `${MAPS_DIR}/${f}`, pin: d.port_pin };
  }
  const facts = {};
  const add = (slug, property, value, file, ref) => (facts[slug] ||= []).push({ property, value, file, ref });
  for (const slug of pages) {
    const file = `ports/${slug}.html`;
    const place = pagePlace(fs.readFileSync(path.join(root, file), "utf8"));
    if (place.name) add(slug, "page_place_name", place.name, file, `itw:${file}#mainEntity.name`);
    if (place.position) add(slug, "place_position", place.position, file, `itw:${file}#mainEntity.geo`);
    const r = registry[slug];
    if (r) {
      if (typeof r.name === "string" && r.name.trim()) add(slug, "name", r.name.trim(), REGISTRY, `itw:${REGISTRY}#ports.${slug}.name`);
      if (Number.isFinite(r.lat) && Number.isFinite(r.lon)) add(slug, "place_position", { lat: r.lat, lon: r.lon }, REGISTRY, `itw:${REGISTRY}#ports.${slug}.lat,lon`);
      if (typeof r.tenderPort === "boolean") add(slug, "tender_port", r.tenderPort, REGISTRY, `itw:${REGISTRY}#ports.${slug}.tenderPort`);
    }
    const g = geo[slug];
    if (g) {
      if (typeof g.name === "string" && g.name.trim()) add(slug, "name", g.name.trim(), GEO, `itw:${GEO}#ports[id=${slug}].name`);
      if (Number.isFinite(g.lat) && Number.isFinite(g.lon)) add(slug, "place_position", { lat: g.lat, lon: g.lon }, GEO, `itw:${GEO}#ports[id=${slug}].lat,lon`);
    }
    const m = maps[slug];
    if (m && m.pin && Number.isFinite(m.pin.lat) && Number.isFinite(m.pin.lon)) add(slug, "terminal_position", { lat: m.pin.lat, lon: m.pin.lon }, m.file, `itw:${m.file}#port_pin`);
  }
  return { pages, registry, geo, summaries, seasonal, maps, facts, csv: csvPorts(fs.readFileSync(path.join(root, CSV), "utf8")) };
}

/** Every list's key mapped to a port identity; a name that does not match exactly one port is listed, never guessed. */
export function aliasTable(src) {
  const page = new Set(src.pages);
  const byKey = (keys, file) => {
    const ks = [...keys].sort();
    return { file, keyed_by: "slug", matched: ks.filter((k) => page.has(k)).length, unmatched: ks.filter((k) => !page.has(k)).map((k) => ({ key: k, reason: "no port page with this slug" })) };
  };
  const names = new Map();
  for (const slug of src.pages) {
    for (const n of [slug.replace(/-/g, " "), ...(src.facts[slug] || []).filter((f) => f.property === "name" || f.property === "page_place_name").map((f) => f.value)]) {
      const k = norm(n);
      if (!names.has(k)) names.set(k, new Set());
      names.get(k).add(slug);
    }
  }
  const csv = { file: CSV, keyed_by: "name (exact after normalising case, accents and punctuation)", matched: {}, ambiguous: [], unmatched: [] };
  for (const n of src.csv) {
    const hit = names.get(norm(n));
    if (!hit) csv.unmatched.push({ key: n, reason: "no port page or recorded name matches it exactly" });
    else if (hit.size > 1) csv.ambiguous.push({ key: n, candidates: [...hit].sort().map((s) => `port:${s}`) });
    else csv.matched[n] = `port:${[...hit][0]}`;
  }
  return {
    format: "itw-port-aliases/1",
    _about: "Generated by admin/lexicon/port-statements.mjs; do not edit by hand. Every port list's key mapped to port:<slug>. A list keyed by name matches only on an exact normalised name; ambiguous and unmatched names are listed for a person to settle, never guessed. ken's whatsinport list (1,663 names, another site's index) lives in another repository and is not read here.",
    identity: "port:<slug>, the In the Wake port page slug",
    ports: src.pages.length,
    lists: [
      byKey(Object.keys(src.registry), REGISTRY), byKey(Object.keys(src.geo), GEO), byKey(Object.keys(src.summaries), SUMMARIES),
      byKey(Object.keys(src.seasonal), SEASONAL), byKey(Object.keys(src.maps), `${MAPS_DIR}/*.map.json`), csv,
    ],
    pages_in_no_list: src.pages.filter((s) => !src.registry[s] && !src.geo[s] && !src.summaries[s] && !src.seasonal[s] && !src.maps[s]),
  };
}

const sameJson = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/** Build every entity file, the alias table and the dispute list. Deterministic for a committed tree. */
export async function buildPortStatements(root = ROOT, contract) {
  const pack = readJson(root, PACK_FILE);
  const v = contract.validatePack(pack);
  if (!v.ok) throw fail("itw_port_statements_unavailable", `the port pack is invalid: ${v.errors.join("; ")}`);
  const { currentValue, findConflicts, distanceM } = await import(new URL(`file://${path.join(contract.dir, "statement.mjs")}`).href);
  const src = readSources(root);
  const dates = new Map();
  const dated = (file) => { if (!dates.has(file)) dates.set(file, commitDate(root, file)); return dates.get(file); };
  const files = {}, disputes = [], nameReview = [];
  for (const slug of src.pages) {
    const entity = `port:${slug}`;
    const groups = [];
    for (const f of src.facts[slug] || []) {
      const g = groups.find((x) => x.property === f.property && sameJson(x.value, f.value));
      if (g) g.items.push(f); else groups.push({ property: f.property, value: f.value, items: [f] });
    }
    const statements = [];
    for (const g of groups.sort((a, b) => (a.property < b.property ? -1 : a.property > b.property ? 1 : JSON.stringify(a.value) < JSON.stringify(b.value) ? -1 : 1))) {
      const p = pack.properties[g.property];
      const refs = [...new Set(g.items.map((i) => i.ref))].sort();
      const at = g.items.map((i) => dated(i.file)).sort().at(-1);
      const s = contract.makeStatement({
        pack: pack.pack, entity, property: g.property, value: g.value, unit: p.unit, partition: pack.partition,
        status: "inference", evidence: refs.map((ref) => ({ ref, tier: "secondary" })), sourceRef: refs[0], publisher: "In the Wake",
        assertedAt: at, observedAt: at, actor: ACTOR, clock: () => at, ...(p.value_type === "geo" ? { toleranceM: p.tolerance_m } : {}),
      });
      const ok = contract.validateStatement(JSON.parse(JSON.stringify(s)));
      const fits = contract.checkStatement(pack, s);
      if (!ok.ok || !fits.ok) throw fail("itw_port_statements_unavailable", `${entity} ${g.property}: ${[...(ok.errors ?? []), ...(fits.errors ?? [])].join("; ")}`);
      statements.push(s);
    }
    for (const c of findConflicts(statements)) {
      const side = (x) => ({ value: x.ext.value, refs: x.epistemic.evidence.map((e) => e.ref) });
      disputes.push({ entity, property: c.a.ext.property, ...(c.a.ext.tolerance_m ? { distance_m: Math.round(distanceM(c.a.ext.value, c.b.ext.value)), tolerance_m: c.a.ext.tolerance_m } : {}), sides: [side(c.a), side(c.b)] });
    }
    const short = groups.filter((g) => g.property === "name").map((g) => g.value), shown = groups.filter((g) => g.property === "page_place_name").map((g) => g.value);
    for (const a of short) for (const b of shown) {
      if (!norm(b).includes(norm(a)) && !norm(a).includes(norm(b))) nameReview.push({ entity, name: a, page_place_name: b });
    }
    const states = Object.fromEntries(Object.keys(pack.properties).map((p) => [p, currentValue(statements, `${entity}#${p}`, { at: "2026-10-29T00:00:00Z" }).state]));
    files[`${OUT_DIR}/${slug}.json`] = `${JSON.stringify({
      format: "lexicon-entity/1", entity,
      _about: "Generated by admin/lexicon/port-statements.mjs from this repository's own committed files; do not edit by hand (each statement's id is a hash of its content). Identical values from several files are one statement citing all of them. assets/data/entities/README.md#ports-track-c6",
      sources: [...new Set((src.facts[slug] || []).map((f) => f.file))].sort(),
      states, statements,
    }, null, 2)}\n`;
  }
  files[ALIASES_FILE] = `${JSON.stringify(aliasTable(src), null, 2)}\n`;
  files[DISPUTES_FILE] = `${JSON.stringify({
    format: "itw-port-disputes/1",
    _about: "Generated by admin/lexicon/port-statements.mjs; do not edit by hand. Every disagreement between this site's own files beyond the pack's tolerance (5 km for a destination, 500 m for a terminal), with each side's sources. Neither side is picked: these are the ports the next build reads a gazetteer for (operator ruling 2026-10-29).",
    count: disputes.length, by_property: Object.fromEntries([...new Set(disputes.map((d) => d.property))].sort().map((p) => [p, disputes.filter((d) => d.property === p).length])),
    disputes,
    name_review: { _about: "Ports whose registry name and page place name share no part (neither contains the other after normalising case, accents and punctuation). A heuristic for a person to read, not a conflict.", count: nameReview.length, ports: nameReview },
  }, null, 2)}\n`;
  return { files, disputes, pages: src.pages.length };
}

async function main(argv) {
  const check = argv.includes("--check");
  try {
    const contract = await loadContract().catch((e) => { throw fail("itw_port_statements_unavailable", e.message); });
    const { files, disputes, pages } = await buildPortStatements(ROOT, contract);
    const stale = Object.entries(files).filter(([rel, text]) => { try { return fs.readFileSync(path.join(ROOT, rel), "utf8") !== text; } catch { return true; } }).map(([rel]) => rel);
    const onDisk = fs.existsSync(path.join(ROOT, OUT_DIR)) ? fs.readdirSync(path.join(ROOT, OUT_DIR)).map((f) => `${OUT_DIR}/${f}`) : [];
    const orphans = onDisk.filter((rel) => !(rel in files));
    if (check) {
      if (stale.length || orphans.length) {
        process.stderr.write(`port-statements: itw_port_statements_stale: ${stale.length} file(s) differ, ${orphans.length} entity file(s) have no port page: ${[...stale, ...orphans].slice(0, 10).join(", ")}\n  remedy: commit the source change, then run node admin/lexicon/port-statements.mjs and commit what it writes\n`);
        return 1;
      }
      process.stdout.write(`port-statements: current (${pages} ports, ${disputes.length} disputes named)\n`);
      return 0;
    }
    fs.mkdirSync(path.join(ROOT, OUT_DIR), { recursive: true });
    for (const rel of stale) fs.writeFileSync(path.join(ROOT, rel), files[rel]);
    for (const rel of orphans) fs.rmSync(path.join(ROOT, rel));
    process.stdout.write(`port-statements: ${stale.length} file(s) written, ${orphans.length} orphan(s) removed (${pages} ports, ${disputes.length} disputes named in ${DISPUTES_FILE})\n`);
    return 0;
  } catch (err) {
    const known = { itw_port_statements_unavailable: 2, itw_source_uncommitted: 2, itw_source_history_shallow: 2 };
    if (!known[err.code]) throw err;
    process.stderr.write(`port-statements: ${err.code === "itw_port_statements_unavailable" ? err.code : `itw_port_statements_unavailable (${err.code})`}: ${err.message}\n  remedy: the message names the file; commit it, or fetch full history (git fetch --unshallow)\n`);
    return 2;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = await main(process.argv.slice(2));
