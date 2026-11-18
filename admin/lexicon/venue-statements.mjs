#!/usr/bin/env node
// Venue statements: one line-scoped identity for every venue store (Tekton itw-c7a-venue-identity; Project-Sophos
// docs/lexicon/LEXICON-PLAN-3.1.md section 6, cruise.venue; operator 2026-10-30: "Date fix, then C7").
//
// WHY. A venue lived in six stores with no shared identity: venues-v2.json (2,101 venues over 290 ships),
// venues.json (an older 83), one venue file per line for Carnival, Norwegian, MSC and Virgin, the restaurant
// pages, and a per-ship file. Their slugs collide ACROSS lines (main-dining-room is in the Carnival file and the
// MSC file; teppanyaki is a Royal Caribbean venue in venues-v2 and a Norwegian one in ncl-venues), so a bare slug
// is not an identity, and 186 names carry two or more slugs.
//
// IDENTITY: venue:<line>.<slug> (pack assets/data/lexicon/cruise.venue.pack.json).
//   venues-v2   a venue's line is the line of every ship that lists it (no venue is on two lines: measured); for a
//               venue on no ship, its own `line` field, else the line of the venue it consolidates into, else the
//               line its own restaurants/<slug>.html names as provider (mapped through the C2 line alias table);
//               else it is listed as unplaced and not filed.
//   line files  carnival-, ncl-, msc- and virgin-venues.json are each one line's. A key maps to a venues-v2 venue
//               OF THAT LINE by exact slug, then the line's prefixed slug (ncl-taste for taste), then a normalised
//               name exactly one venue of the line carries. Two candidates: listed as ambiguous, not filed. None:
//               a venue venues-v2 does not have, filed as venue:<line>.<slug> from that file alone.
//   venues.json a venue's line is the line of every ship its own ships map lists it on; then matched as above.
//   pages       restaurants/<slug>.html maps to the venues-v2 venue with that slug.
//   per ship    venues_by_ship/<ship>.json keys map within that ship's line as above; used for the ship review.
// A ship key maps to a ship entity through the pages each ship entity is filed from (assets/data/entities/ship),
// never by guessing from its spelling.
//
// WHAT IT FILES, per venue, from this repository's own committed files (status inference):
//   name, category, subcategory, premium   as each store writes them (a "-" subcategory is a placeholder, not
//                                          filed); venues.json's category is another scheme and is not filed
//   line                                   the line the identity rests on, cited on the stores that place it
//   ships                                  { ships: [ship entities] }, from venues-v2 only: the one store that
//                                          covers every ship (the C5 rule: a relation is stored once)
//   consolidate_into                       venues-v2's own pointer to the venue this one is a variant of
// Not filed, and listed per venue under not_filed: cost (a price, Track C7b) and description (prose).
//
// WHAT IT LISTS (assets/data/lexicon/venue-disputes.json), never settling anything:
//   disputes       two stores giving one venue different values (the contract's findConflicts)
//   same_name      venues of one line sharing a normalised name: possible duplicates for a person to read
//   ship_review    a store that puts a venue on a ship venues-v2 does not, or the reverse for a ship it covers
//   unplaced       venues-v2 venues with no line, and store keys that matched ambiguously
//
//   node admin/lexicon/venue-statements.mjs           write the entity files, the alias table and the review lists
//   node admin/lexicon/venue-statements.mjs --check   change nothing; exit 1 if any of them is not what the files say
//
// @exit 0 written, or --check found everything current
// @exit 1 refused: itw_venue_statements_stale, an entity file, the alias table or the review list differs from what the stores say. remedy: commit the source change, then run node admin/lexicon/venue-statements.mjs and commit what it writes
// @exit 2 could not look: itw_venue_statements_unavailable, the statement contract or a store could not be read, or a source has uncommitted edits or no history in this clone. remedy: the message names the file; commit it, or fetch full history (git fetch --unshallow)
// Soli Deo Gloria.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { commitDate, loadContract } from "./ship-statements.mjs";
import { priorDates, keepDates } from "./stable-dates.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
export const OUT_DIR = "assets/data/entities/venue";
export const PACK_FILE = "assets/data/lexicon/cruise.venue.pack.json";
export const ALIASES_FILE = "assets/data/lexicon/venue-aliases.json";
export const REVIEW_FILE = "assets/data/lexicon/venue-disputes.json";
const V2 = "assets/data/venues-v2.json";
const V1 = "assets/data/venues.json";
const BRANDS = "assets/data/brands.json";
const SHIP_DIR = "assets/data/entities/ship";
const BY_SHIP_DIR = "assets/data/venues_by_ship";
const LINE_ALIASES = "assets/data/lexicon/line-aliases.json";
const FLEET_INDEX = "assets/data/fleet_index.json";
const PAGES_DIR = "restaurants";
// Each line's own venue file, the line it belongs to, and the prefix venues-v2 gives that line's slugs.
export const LINE_FILES = Object.freeze([
  { file: "assets/data/carnival-venues.json", line: "carnival", prefix: "carnival" },
  { file: "assets/data/ncl-venues.json", line: "norwegian", prefix: "ncl" },
  { file: "assets/data/msc-venues.json", line: "msc", prefix: "msc" },
  { file: "assets/data/virgin-venues.json", line: "virgin-voyages", prefix: "virgin" },
]);
const ACTOR = Object.freeze({ kind: "tool", id: "itw-lexicon-venue-statements", provider: "household" });
const fail = (code, message) => Object.assign(new Error(message), { code });
const readJson = (root, rel) => {
  try { return JSON.parse(fs.readFileSync(path.join(root, rel), "utf8")); }
  catch (e) { throw fail("itw_venue_statements_unavailable", `${rel} could not be read (${e.message})`); }
};
export const norm = (s) => String(s).normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
export const venueId = (line, slug) => `venue:${line}.${slug}`;
const sorted = (xs) => [...xs].sort();

/** Ship key (a ship page's file stem) -> { ship, line } from the ship entity files' own sources. */
export function shipIndex(root) {
  const out = new Map();
  for (const f of fs.readdirSync(path.join(root, SHIP_DIR)).filter((x) => x.endsWith(".json")).sort()) {
    const e = readJson(root, `${SHIP_DIR}/${f}`);
    const line = e.statements.find((s) => s.ext.property === "line")?.ext.value ?? null;
    for (const src of e.sources ?? []) {
      const m = /^ships\/[^/]+\/([^/]+)\.html$/.exec(src);
      if (m) out.set(m[1], { ship: e.entity, line: line ? line.replace(/^line:/, "") : null });
    }
  }
  return out;
}

/**
 * Organisation name -> line id, from the line alias table (C2): each line's own name, and the name fleet_index.json
 * gives the entry the table maps to that line. Only names the table already stands behind; nothing fuzzy.
 */
export function lineNames(root) {
  const out = new Map();
  const table = readJson(root, LINE_ALIASES).lines ?? {};
  const fleet = readJson(root, FLEET_INDEX).cruise_lines ?? [];
  for (const [id, l] of Object.entries(table)) {
    out.set(norm(l.name), id);
    for (const a of l.aliases ?? []) {
      if (a.vocabulary !== "fleet_index.json") continue;
      const e = fleet.find((f) => f.slug === a.alias);
      if (e?.name) out.set(norm(e.name), id);
    }
  }
  return out;
}

/** The organisation names a page's JSON-LD gives as a provider. */
export function pageProviders(html) {
  return sorted(new Set([...html.matchAll(/"provider"\s*:\s*\{[^}]*?"name"\s*:\s*"([^"]+)"/g)].map((m) => m[1])));
}

/**
 * Match one store key to a venues-v2 venue of `line`: exact slug, the line's prefixed slug, then a normalised
 * name exactly one venue of the line carries. Returns { slug, how } | { ambiguous: [slugs] } | null.
 */
export function matchInLine(key, name, line, prefix, v2ByLine) {
  const mine = v2ByLine.get(line) ?? new Map();
  if (mine.has(key)) return { slug: key, how: "slug" };
  if (prefix && mine.has(`${prefix}-${key}`)) return { slug: `${prefix}-${key}`, how: "prefixed slug" };
  if (name) {
    const hits = [...mine.values()].filter((v) => norm(v.name) === norm(name)).map((v) => v.slug);
    if (hits.length === 1) return { slug: hits[0], how: "name" };
    if (hits.length > 1) return { ambiguous: sorted(hits) };
  }
  return null;
}

/** The line of the ships a venue is listed on: { line } when they are all one line's, { lines } when not, else null. */
export function lineOfShipKeys(keys, ships) {
  const ls = sorted(new Set([...keys].map((k) => ships.get(k)?.line).filter(Boolean)));
  return ls.length === 1 ? { line: ls[0] } : ls.length > 1 ? { lines: ls } : null;
}

/** Read every store and place every venue. Pure over the files; no dates, no contract. */
export function readStores(root) {
  const lines = new Set((readJson(root, BRANDS).brands ?? []).map((b) => b.id));
  const ships = shipIndex(root);
  const v2 = readJson(root, V2);
  const v2BySlug = new Map(v2.venues.map((v) => [v.slug, v]));
  const onShips = new Map(); // v2 slug -> Set(ship key)
  const unknownShips = [];
  for (const [key, sh] of Object.entries(v2.ships)) {
    if (!ships.has(key)) unknownShips.push({ store: V2, ship_key: key, reason: "no ship entity is filed from a page with this name" });
    for (const v of sh.venues ?? []) (onShips.get(v) ?? onShips.set(v, new Set()).get(v)).add(key);
  }
  const lineOfShips = (keys) => new Set([...keys].map((k) => ships.get(k)?.line).filter(Boolean));
  const placed = new Map(); // v2 slug -> { line, by }
  const unplaced = [];
  for (const v of v2.venues) {
    const at = lineOfShipKeys(onShips.get(v.slug) ?? [], ships);
    if (at?.line) placed.set(v.slug, { line: at.line, by: "ships" });
    else if (at?.lines) unplaced.push({ store: V2, key: v.slug, reason: `listed on ships of ${at.lines.length} lines (${at.lines.join(", ")})` });
  }
  for (const v of v2.venues) {
    if (placed.has(v.slug) || (onShips.get(v.slug)?.size && lineOfShips(onShips.get(v.slug)).size > 1)) continue;
    if (v.line && lines.has(v.line)) placed.set(v.slug, { line: v.line, by: "line field" });
  }
  for (const v of v2.venues) {
    if (placed.has(v.slug) || !v.consolidate_into) continue;
    const t = placed.get(v.consolidate_into);
    if (t && (t.by === "ships" || t.by === "line field")) placed.set(v.slug, { line: t.line, by: "consolidate_into" });
  }
  // A venue on no ship whose own page names its provider: the line that provider name maps to in the line alias
  // table, when it maps to exactly one.
  const names = lineNames(root);
  for (const v of v2.venues) {
    if (placed.has(v.slug) || onShips.get(v.slug)?.size) continue;
    const page = `${PAGES_DIR}/${v.slug}.html`;
    if (!fs.existsSync(path.join(root, page))) continue;
    const ls = new Set(pageProviders(fs.readFileSync(path.join(root, page), "utf8")).map((n) => names.get(norm(n))).filter(Boolean));
    if (ls.size === 1) placed.set(v.slug, { line: [...ls][0], by: "page provider", page });
  }
  for (const v of v2.venues) if (!placed.has(v.slug) && !unplaced.some((u) => u.key === v.slug)) unplaced.push({ store: V2, key: v.slug, reason: "on no ship, with no line field and no placed venue to consolidate into" });
  const v2ByLine = new Map();
  for (const [slug, p] of placed) (v2ByLine.get(p.line) ?? v2ByLine.set(p.line, new Map()).get(p.line)).set(slug, v2BySlug.get(slug));

  // Facts, by venue id: { property, value, file, ref }.
  const facts = new Map();
  const add = (id, property, value, file, ref) => (facts.get(id) ?? facts.set(id, []).get(id)).push({ property, value, file, ref });
  const notFiled = new Map();
  const skip = (id, source, reason) => (notFiled.get(id) ?? notFiled.set(id, []).get(id)).push({ source, reason });
  const record = (id, v, file, refBase, { category = true } = {}) => {
    if (typeof v.name === "string" && v.name.trim()) add(id, "name", v.name.trim(), file, `${refBase}.name`);
    if (category && typeof v.category === "string" && v.category.trim()) add(id, "category", v.category.trim(), file, `${refBase}.category`);
    if (!category && v.category !== undefined) skip(id, `${refBase}.category`, "venues.json's category is another scheme (casual, bar, specialty, mdr), not this pack's");
    if (typeof v.subcategory === "string" && v.subcategory.trim() && v.subcategory.trim() !== "-") add(id, "subcategory", v.subcategory.trim(), file, `${refBase}.subcategory`);
    else if (v.subcategory === "-") skip(id, `${refBase}.subcategory`, "a placeholder (\"-\"), not a subcategory");
    if (typeof v.premium === "boolean") add(id, "premium", v.premium, file, `${refBase}.premium`);
    if (v.cost !== undefined) skip(id, `${refBase}.cost`, "a price: filed by the price pack (Track C7b)");
    if (v.description !== undefined) skip(id, `${refBase}.description`, "prose, not a fact");
  };

  for (const [slug, p] of [...placed].sort(([a], [b]) => (a < b ? -1 : 1))) {
    const v = v2BySlug.get(slug), id = venueId(p.line, slug), ref = `itw:${V2}#venues[slug=${slug}]`;
    record(id, v, V2, ref);
    if (p.by === "page provider") add(id, "line", `line:${p.line}`, p.page, `itw:${p.page}#provider.name`);
    else add(id, "line", `line:${p.line}`, V2, p.by === "ships" ? `itw:${V2}#ships[*].venues` : p.by === "line field" ? `${ref}.line` : `${ref}.consolidate_into`);
    const on = sorted([...(onShips.get(slug) ?? [])].map((k) => ships.get(k)?.ship).filter(Boolean));
    if (on.length) add(id, "ships", { ships: [...new Set(on)] }, V2, `itw:${V2}#ships[*].venues`);
    if (v.consolidate_into && placed.get(v.consolidate_into)?.line === p.line) add(id, "consolidate_into", venueId(p.line, v.consolidate_into), V2, `${ref}.consolidate_into`);
  }

  const aliasLists = [];
  const ambiguous = [];
  const storeList = (file, keyed_by) => { const l = { file, keyed_by, matched: {}, ambiguous: [], unmatched: [], new_venues: [] }; aliasLists.push(l); return l; };
  for (const lf of LINE_FILES) {
    const list = storeList(lf.file, `slug within line:${lf.line}`);
    for (const v of readJson(root, lf.file).venues ?? []) {
      const m = matchInLine(v.slug, v.name, lf.line, lf.prefix, v2ByLine);
      const ref = `itw:${lf.file}#venues[slug=${v.slug}]`;
      if (m?.ambiguous) { list.ambiguous.push({ key: v.slug, candidates: m.ambiguous.map((s) => venueId(lf.line, s)) }); ambiguous.push({ store: lf.file, key: v.slug, candidates: m.ambiguous.map((s) => venueId(lf.line, s)) }); continue; }
      const id = venueId(lf.line, m ? m.slug : v.slug);
      if (m) list.matched[v.slug] = { venue: id, by: m.how };
      else { list.new_venues.push(id); add(id, "line", `line:${lf.line}`, lf.file, `itw:${lf.file}`); }
      record(id, v, lf.file, ref);
    }
  }

  const v1 = readJson(root, V1);
  const v1On = new Map();
  for (const [key, sh] of Object.entries(v1.ships ?? {})) for (const s of sh.venues ?? []) (v1On.get(s) ?? v1On.set(s, new Set()).get(s)).add(key);
  const v1List = storeList(V1, "slug within the line of the ships its own ships map lists");
  for (const v of v1.venues ?? []) {
    const ls = lineOfShips(v1On.get(v.slug) ?? []);
    if (ls.size !== 1) { v1List.unmatched.push({ key: v.slug, reason: ls.size ? `on ships of ${ls.size} lines` : "on no ship its ships map can place" }); continue; }
    const line = [...ls][0];
    const m = matchInLine(v.slug, v.name, line, null, v2ByLine);
    if (m?.ambiguous) { v1List.ambiguous.push({ key: v.slug, candidates: m.ambiguous.map((s) => venueId(line, s)) }); ambiguous.push({ store: V1, key: v.slug, candidates: m.ambiguous.map((s) => venueId(line, s)) }); continue; }
    if (!m) { v1List.unmatched.push({ key: v.slug, reason: `no venue of line:${line} has this slug or name` }); continue; }
    v1List.matched[v.slug] = { venue: venueId(line, m.slug), by: m.how };
    record(venueId(line, m.slug), v, V1, `itw:${V1}#venues[slug=${v.slug}]`, { category: false });
  }

  const pages = fs.readdirSync(path.join(root, PAGES_DIR)).filter((f) => f.endsWith(".html")).map((f) => f.slice(0, -5)).sort();
  const pageList = storeList(`${PAGES_DIR}/*.html`, "page slug = venues-v2 slug");
  for (const p of pages) {
    const pl = placed.get(p);
    if (pl) pageList.matched[p] = { venue: venueId(pl.line, p), by: "slug" };
    else pageList.unmatched.push({ key: p, reason: v2BySlug.has(p) ? "its venues-v2 venue has no line" : "no venues-v2 venue has this slug" });
  }

  // Ship review: where an older store puts a venue on a ship (or not) and venues-v2 disagrees.
  const shipReview = [];
  const v2Ships = (id) => new Set(facts.get(id)?.find((f) => f.property === "ships")?.value.ships ?? []);
  for (const [key, sh] of Object.entries(v1.ships ?? {})) {
    const s = ships.get(key);
    if (!s) continue;
    for (const slug of sh.venues ?? []) {
      const m = v1List.matched[slug];
      if (m && !v2Ships(m.venue).has(s.ship)) shipReview.push({ venue: m.venue, ship: s.ship, store: V1, says: "on this ship", venues_v2: "not on this ship" });
    }
  }
  for (const f of fs.existsSync(path.join(root, BY_SHIP_DIR)) ? fs.readdirSync(path.join(root, BY_SHIP_DIR)).filter((x) => x.endsWith(".json")).sort() : []) {
    const rel = `${BY_SHIP_DIR}/${f}`, d = readJson(root, rel), s = ships.get(d.ship);
    const list = storeList(rel, `key within ${d.ship}'s line`);
    if (!s?.line) { list.unmatched.push({ key: d.ship, reason: "no ship entity for this ship" }); continue; }
    for (const v of d.venues ?? []) {
      const m = matchInLine(v.key, null, s.line, null, v2ByLine);
      if (!m || m.ambiguous) { list.unmatched.push({ key: v.key, reason: m ? "ambiguous" : `no venue of line:${s.line} has this slug` }); continue; }
      const id = venueId(s.line, m.slug);
      list.matched[v.key] = { venue: id, by: m.how };
      if (!v2Ships(id).has(s.ship)) shipReview.push({ venue: id, ship: s.ship, store: rel, says: "on this ship", venues_v2: "not on this ship" });
    }
  }
  for (const lf of LINE_FILES) {
    for (const v of readJson(root, lf.file).venues ?? []) {
      if (!Array.isArray(v.ships)) continue;
      const m = aliasLists.find((l) => l.file === lf.file).matched[v.slug];
      const id = m ? m.venue : venueId(lf.line, v.slug);
      for (const key of v.ships) {
        const s = ships.get(key);
        if (s && !v2Ships(id).has(s.ship)) shipReview.push({ venue: id, ship: s.ship, store: lf.file, says: "on this ship", venues_v2: facts.get(id)?.some((x) => x.property === "ships") ? "not on this ship" : "no ship list for this venue" });
      }
    }
  }

  // Same-name review: venues of one line sharing a normalised name.
  const sameName = [];
  const byLineName = new Map();
  for (const [id, fs_] of facts) {
    const line = id.slice("venue:".length, id.indexOf("."));
    for (const n of new Set(fs_.filter((f) => f.property === "name").map((f) => norm(f.value)))) {
      const k = `${line}|${n}`;
      (byLineName.get(k) ?? byLineName.set(k, new Set()).get(k)).add(id);
    }
  }
  for (const [k, ids] of [...byLineName].sort(([a], [b]) => (a < b ? -1 : 1))) if (ids.size > 1) sameName.push({ line: `line:${k.split("|")[0]}`, name: k.split("|")[1], venues: sorted(ids) });

  return { facts, notFiled, aliasLists, ambiguous, unplaced, unknownShips, shipReview, sameName, pages: pages.length, v2Count: v2.venues.length };
}

const sameJson = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/** Build every entity file, the alias table and the review list. Deterministic for a committed tree. */
export async function buildVenueStatements(root = ROOT, contract) {
  const pack = readJson(root, PACK_FILE);
  const v = contract.validatePack(pack);
  if (!v.ok) throw fail("itw_venue_statements_unavailable", `the venue pack is invalid: ${v.errors.join("; ")}`);
  const { currentValue, findConflicts } = await import(new URL(`file://${path.join(contract.dir, "statement.mjs")}`).href);
  const st = readStores(root);
  const ids = sorted(st.facts.keys());
  const prior = priorDates(root, ids.map((id) => `${OUT_DIR}/${id.slice("venue:".length)}.json`));
  const dates = new Map();
  const dated = (file) => { if (!dates.has(file)) dates.set(file, commitDate(root, file)); return dates.get(file); };
  const files = {}, disputes = [];
  for (const id of ids) {
    const groups = [];
    for (const f of st.facts.get(id)) {
      const g = groups.find((x) => x.property === f.property && sameJson(x.value, f.value));
      if (g) g.items.push(f); else groups.push({ property: f.property, value: f.value, items: [f] });
    }
    const statements = [];
    for (const g of groups.sort((a, b) => (a.property < b.property ? -1 : a.property > b.property ? 1 : JSON.stringify(a.value) < JSON.stringify(b.value) ? -1 : 1))) {
      const p = pack.properties[g.property];
      const refs = sorted(new Set(g.items.map((i) => i.ref)));
      const s = keepDates(prior, (at) => contract.makeStatement({
        pack: pack.pack, entity: id, property: g.property, value: g.value, unit: p.unit, partition: pack.partition,
        status: "inference", evidence: refs.map((ref) => ({ ref, tier: "secondary" })), sourceRef: refs[0], publisher: "In the Wake",
        assertedAt: at, observedAt: at, actor: ACTOR, clock: () => at,
      }), () => g.items.map((i) => dated(i.file)).sort().at(-1));
      const ok = contract.validateStatement(JSON.parse(JSON.stringify(s)));
      const fits = contract.checkStatement(pack, s);
      if (!ok.ok || !fits.ok) throw fail("itw_venue_statements_unavailable", `${id} ${g.property}: ${[...(ok.errors ?? []), ...(fits.errors ?? [])].join("; ")}`);
      statements.push(s);
    }
    for (const c of findConflicts(statements)) {
      const side = (x) => ({ value: x.ext.value, refs: x.epistemic.evidence.map((e) => e.ref) });
      disputes.push({ entity: id, property: c.a.ext.property, sides: [side(c.a), side(c.b)] });
    }
    const states = Object.fromEntries(Object.keys(pack.properties).map((p) => [p, currentValue(statements, `${id}#${p}`, { at: "2026-10-30T00:00:00Z" }).state]));
    files[`${OUT_DIR}/${id.slice("venue:".length)}.json`] = `${JSON.stringify({
      format: "lexicon-entity/1", entity: id,
      _about: "Generated by admin/lexicon/venue-statements.mjs from this repository's own committed files; do not edit by hand (each statement's id is a hash of its content). Identical values from several stores are one statement citing all of them. assets/data/entities/README.md#venues-track-c7a",
      sources: sorted(new Set(st.facts.get(id).map((f) => f.file))),
      states, statements,
      ...(st.notFiled.has(id) ? { not_filed: st.notFiled.get(id) } : {}),
    }, null, 2)}\n`;
  }
  files[ALIASES_FILE] = `${JSON.stringify({
    format: "itw-venue-aliases/1",
    _about: "Generated by admin/lexicon/venue-statements.mjs; do not edit by hand. Every venue store's key mapped to venue:<line>.<slug>, and how. A key maps only within its own line: exact slug, the line's prefixed slug, or a name exactly one venue of the line carries. Ambiguous and unmatched keys are listed for a person to settle, never guessed. new_venues are venues a line's own file has and venues-v2 does not.",
    identity: "venue:<line>.<slug>", venues: ids.length, venues_v2: st.v2Count,
    lists: st.aliasLists,
  }, null, 2)}\n`;
  files[REVIEW_FILE] = `${JSON.stringify({
    format: "itw-venue-disputes/1",
    _about: "Generated by admin/lexicon/venue-statements.mjs; do not edit by hand. Nothing here is settled: disputes are stores giving one venue different values; same_name lists venues of one line that share a name (possible duplicates); ship_review lists a store putting a venue on a ship venues-v2 does not; unplaced lists venues and keys the tool could not give an identity without guessing.",
    counts: { disputes: disputes.length, same_name: st.sameName.length, ship_review: st.shipReview.length, unplaced: st.unplaced.length + st.ambiguous.length, unknown_ships: st.unknownShips.length },
    by_property: Object.fromEntries(sorted(new Set(disputes.map((d) => d.property))).map((p) => [p, disputes.filter((d) => d.property === p).length])),
    disputes, same_name: st.sameName, ship_review: st.shipReview, unplaced: [...st.unplaced, ...st.ambiguous.map((a) => ({ ...a, reason: "matched more than one venue of its line" }))], unknown_ships: st.unknownShips,
  }, null, 2)}\n`;
  return { files, disputes, venues: ids.length };
}

async function main(argv) {
  const check = argv.includes("--check");
  try {
    const contract = await loadContract().catch((e) => { throw fail("itw_venue_statements_unavailable", e.message); });
    const { files, disputes, venues } = await buildVenueStatements(ROOT, contract);
    const stale = Object.entries(files).filter(([rel, text]) => { try { return fs.readFileSync(path.join(ROOT, rel), "utf8") !== text; } catch { return true; } }).map(([rel]) => rel);
    const onDisk = fs.existsSync(path.join(ROOT, OUT_DIR)) ? fs.readdirSync(path.join(ROOT, OUT_DIR)).map((f) => `${OUT_DIR}/${f}`) : [];
    const orphans = onDisk.filter((rel) => !(rel in files));
    if (check) {
      if (stale.length || orphans.length) {
        process.stderr.write(`venue-statements: itw_venue_statements_stale: ${stale.length} file(s) differ, ${orphans.length} entity file(s) name no venue: ${[...stale, ...orphans].slice(0, 10).join(", ")}\n  remedy: commit the source change, then run node admin/lexicon/venue-statements.mjs and commit what it writes\n`);
        return 1;
      }
      process.stdout.write(`venue-statements: current (${venues} venues, ${disputes.length} disputes named)\n`);
      return 0;
    }
    fs.mkdirSync(path.join(ROOT, OUT_DIR), { recursive: true });
    for (const rel of stale) fs.writeFileSync(path.join(ROOT, rel), files[rel]);
    for (const rel of orphans) fs.rmSync(path.join(ROOT, rel));
    process.stdout.write(`venue-statements: ${stale.length} file(s) written, ${orphans.length} orphan(s) removed (${venues} venues, ${disputes.length} disputes named in ${REVIEW_FILE})\n`);
    return 0;
  } catch (err) {
    const known = { itw_venue_statements_unavailable: 2, itw_source_uncommitted: 2, itw_source_history_shallow: 2 };
    if (!known[err.code]) throw err;
    process.stderr.write(`venue-statements: ${err.code === "itw_venue_statements_unavailable" ? err.code : `itw_venue_statements_unavailable (${err.code})`}: ${err.message}\n  remedy: the message names the file; commit it, or fetch full history (git fetch --unshallow)\n`);
    return 2;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = await main(process.argv.slice(2));
