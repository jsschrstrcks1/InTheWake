#!/usr/bin/env node
// Drink-package prices and line gratuity rates as statements (Tekton itw-c7b-package-prices; Project-Sophos
// docs/lexicon/LEXICON-PLAN-3.1.md section 6, cruise.line / cruise.price).
//
// OPERATOR RULING (Ken, 2026-10-31, memory 446c35a2): "Include gratuity but that's a piece of knowledge that can go
// stale it should be marked as such." So a stored package price INCLUDES the gratuity, and the gratuity rate is its
// own statement that reads stale once its pack's window (ttl_days) passes since its last check. A price computed
// from a base price and that rate names both in its lineage (makeStatement derivedFrom), so the contract's
// freshness() reads the price stale too when the rate is. This needs a contract with freshness.mjs and derivedFrom
// (Project-Sophos #1509); against an older contract the tool refuses rather than file prices without lineage.
//
// WHAT IT READS, both this site's own committed files (status inference):
//   assets/data/calculator-config.json   lines.<key>: rules.gratuity (the fraction ADDED on top of a package price),
//                                         _sources.gratuityNote, packages.<tier>: name, priceMid, priceNote
//   assets/data/lines/<line>.json        rules.gratuity, packages.<key>: name, priceMid (or price), range
//
// HOW A FIGURE IS FILED, never guessed:
//   a rate         line:<id>#beverage_gratuity_rate, only where rules.gratuity is above 0 AND the same file states
//                  that percentage in words (the calculator's gratuityNote, or a package note "+N% gratuity"). A
//                  stored 0 means nothing is added on top (MSC's prices already include it; Virgin adds none); it is
//                  listed, never filed as a 0 percent rate. Checked: the note's own "verified YYYY-MM-DD" when it
//                  gives one, else the calculator's lastUpdated, else the line file's commit.
//   a price        only where the source's own note says how the gratuity is treated:
//                    "+N% gratuity" or "+N% service charge", N equal to the file's rate: base_price_per_day is the
//                      figure as given, and price_per_day = base x (1 + rate), to the cent, derived from both
//                    "gratuity included": price_per_day is the figure as given
//                  Anything else (no note, a different percentage, no price) is listed with the reason.
//   identity       package:<line>.<slug>, the package name in kebab case within its line; the calculator's line
//                  keys map through the line alias table, the calculator line's own slug, or its exact name.
//
//   node admin/lexicon/package-statements.mjs                       write the entity files and the review list
//   node admin/lexicon/package-statements.mjs --check               change nothing; exit 1 if any is stale
//   node admin/lexicon/package-statements.mjs --freshness [--at T]  print each rate and price's freshness at T
//
// @exit 0 written, --check found everything current, or --freshness printed
// @exit 1 refused: itw_package_statements_stale, an entity file or the review list differs from what the files say. remedy: commit the source change, then run node admin/lexicon/package-statements.mjs and commit what it writes
// @exit 2 could not look: itw_package_statements_unavailable, the contract (with freshness and derivedFrom, Project-Sophos #1509) or a source could not be read, or a source has uncommitted edits. remedy: the message names what is missing; set LEXICON_CONTRACT_DIR to a contract that has them, or commit the source
// Soli Deo Gloria.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { commitDate, loadContract } from "./ship-statements.mjs";
import { priorDates, keepDates } from "./stable-dates.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
export const PACKAGE_DIR = "assets/data/entities/package";
export const LINE_DIR = "assets/data/entities/line";
export const PACKAGE_PACK = "assets/data/lexicon/cruise.package.pack.json";
export const LINE_PACK = "assets/data/lexicon/cruise.line.pack.json";
export const REVIEW_FILE = "assets/data/lexicon/package-review.json";
const CALC = "assets/data/calculator-config.json";
const LINES_DIR = "assets/data/lines";
const BRANDS = "assets/data/brands.json";
const LINE_ALIASES = "assets/data/lexicon/line-aliases.json";
const ACTOR = Object.freeze({ kind: "tool", id: "itw-lexicon-package-statements", provider: "household" });
const DERIVED_BY = "base_price_per_day x (1 + beverage_gratuity_rate), rounded to the cent";
const fail = (code, message) => Object.assign(new Error(message), { code });
const readJson = (root, rel) => {
  try { return JSON.parse(fs.readFileSync(path.join(root, rel), "utf8")); }
  catch (e) { throw fail("itw_package_statements_unavailable", `${rel} could not be read (${e.message})`); }
};
export const norm = (s) => String(s).normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
export const slugOf = (name) => norm(name).replace(/ /g, "-");
const sorted = (xs) => [...xs].sort();
export const cents = (x) => Math.round(x * 100) / 100;

/** How a note says the gratuity is treated: { add: fraction } | { included: true } | null. */
export function gratuityTreatment(note) {
  if (typeof note !== "string") return null;
  const add = /\+\s*(\d+(?:\.\d+)?)\s*%\s*(?:gratuity|service charge)/i.exec(note);
  if (add) return { add: Number(add[1]) / 100 };
  if (/gratuity included|gratuities included/i.test(note)) return { included: true };
  return null;
}

/**
 * How one package figure is filed, given its note and the file's filed rate (or null):
 *   { kind: "added", base, price } | { kind: "included", price } | { kind: "name_only", reason }
 */
export function priceFigure(mid, note, rate) {
  if (!(Number.isFinite(mid) && mid > 0)) return { kind: "name_only", reason: "no price (included in the fare, or not sold)" };
  const t = gratuityTreatment(note);
  if (!t) return { kind: "name_only", reason: "the source does not say whether this price includes the gratuity" };
  if (t.included) return { kind: "included", price: mid };
  if (rate === null) return { kind: "name_only", reason: "the note adds a gratuity but the file's rate could not be filed" };
  if (Math.abs(t.add - rate) > 1e-9) return { kind: "name_only", reason: `the note adds ${Math.round(t.add * 1000) / 10}% but the file's rate is ${Math.round(rate * 1000) / 10}%` };
  return { kind: "added", base: mid, price: cents(mid * (1 + rate)) };
}

/** "verified 2026-04-14" in a note, as an ISO time, or null. */
export function verifiedDate(note) {
  const m = /verified\s+(\d{4}-\d{2}-\d{2})/i.exec(note ?? "");
  return m ? `${m[1]}T00:00:00.000Z` : null;
}

/** A calculator line key to a line id: the line alias table, the calculator line's own slug, then its exact name. */
export function calculatorLine(key, calcLine, brands, aliasTable) {
  const byAlias = Object.entries(aliasTable).filter(([id, l]) => id === key || (l.aliases ?? []).some((a) => a.alias === key)).map(([id]) => id);
  if (byAlias.length === 1) return { line: byAlias[0], by: "line alias table" };
  if (calcLine?.slug && brands.has(calcLine.slug)) return { line: calcLine.slug, by: "its slug" };
  const byName = Object.entries(aliasTable).filter(([, l]) => calcLine?.name && norm(l.name) === norm(calcLine.name)).map(([id]) => id);
  if (byName.length === 1) return { line: byName[0], by: "its name" };
  return null;
}

/** Every figure the two stores give, as plans to file; nothing dated or sealed yet. Pure over the files. */
export function readFigures(root) {
  const brands = new Set((readJson(root, BRANDS).brands ?? []).map((b) => b.id));
  const aliasTable = readJson(root, LINE_ALIASES).lines ?? {};
  const calc = readJson(root, CALC);
  const sources = [];
  const unmatched = [];
  for (const [key, l] of Object.entries(calc.lines ?? {}).sort(([a], [b]) => (a < b ? -1 : 1))) {
    const at = calculatorLine(key, l, brands, aliasTable);
    if (!at) { unmatched.push({ store: CALC, key, reason: "no line id through the alias table, its slug or its exact name" }); continue; }
    const checked = verifiedDate(l._sources?.gratuityNote) ?? (calc.lastUpdated ? `${calc.lastUpdated}T00:00:00.000Z` : null);
    sources.push({
      file: CALC, line: at.line, key, by: at.by, rate: l.rules?.gratuity, rateNote: l._sources?.gratuityNote ?? null,
      rateRef: `itw:${CALC}#lines.${key}.rules.gratuity`, checked, priceChecked: calc.lastUpdated ? `${calc.lastUpdated}T00:00:00.000Z` : null,
      packages: Object.entries(l.packages ?? {}).map(([k, p]) => ({ key: k, name: p.name, mid: p.priceMid, note: p.priceNote, ref: `itw:${CALC}#lines.${key}.packages.${k}` })),
    });
  }
  for (const f of fs.readdirSync(path.join(root, LINES_DIR)).filter((x) => x.endsWith(".json")).sort()) {
    const line = f.slice(0, -5), rel = `${LINES_DIR}/${f}`;
    if (!brands.has(line)) { unmatched.push({ store: rel, key: line, reason: "file name is not a line id in brands.json" }); continue; }
    const d = readJson(root, rel);
    sources.push({
      file: rel, line, key: line, by: "file name", rate: d.rules?.gratuity, rateNote: null, rateRef: `itw:${rel}#rules.gratuity`,
      checked: null, priceChecked: null,
      packages: Object.entries(d.packages ?? {}).map(([k, p]) => ({ key: k, name: p.name, mid: p.priceMid ?? p.price, note: p.range, ref: `itw:${rel}#packages.${k}` })),
    });
  }

  const rates = [], prices = [], notFiled = [], zeroRates = [];
  for (const s of sources) {
    const pct = Number.isFinite(s.rate) ? Math.round(s.rate * 1000) / 10 : null;
    const stated = s.rateNote ? new RegExp(`\\b${pct}\\s*%`).test(s.rateNote)
      : s.packages.some((p) => gratuityTreatment(p.note)?.add === s.rate);
    let rate = null;
    if (!(Number.isFinite(s.rate))) notFiled.push({ source: s.rateRef, reason: "no gratuity rate in this file" });
    else if (s.rate === 0) zeroRates.push({ line: `line:${s.line}`, source: s.rateRef, note: s.rateNote, reason: "adds nothing on top of the package price (already included, or none charged): not filed as a 0 percent rate" });
    else if (!stated) notFiled.push({ source: s.rateRef, reason: `the file does not state ${pct}% in words anywhere it could be checked against` });
    else { rate = { line: s.line, value: s.rate, ref: s.rateRef, file: s.file, checked: s.checked }; rates.push(rate); }
    for (const p of s.packages) {
      if (typeof p.name !== "string" || !p.name.trim()) { notFiled.push({ source: p.ref, reason: "no package name" }); continue; }
      const pkg = `package:${s.line}.${slugOf(p.name)}`;
      const base = { pkg, line: s.line, name: p.name.trim(), file: s.file, ref: p.ref, key: p.key, checked: s.priceChecked };
      const fig = priceFigure(p.mid, p.note, rate ? rate.value : null);
      if (fig.kind === "name_only") { prices.push({ ...base, kind: "name_only" }); notFiled.push({ source: `${p.ref}.priceMid`, reason: fig.reason }); continue; }
      prices.push(fig.kind === "added" ? { ...base, ...fig, rate } : { ...base, ...fig });
    }
  }
  return { rates, prices, notFiled, zeroRates, unmatched, sources: sources.map((s) => ({ file: s.file, key: s.key, line: `line:${s.line}`, by: s.by })) };
}

/** Load the contract and refuse one without freshness.mjs or derivedFrom (Project-Sophos #1509). */
export async function loadPriceContract(env = process.env) {
  const c = await loadContract(env);
  let fresh;
  try { fresh = await import(pathToFileURL(path.join(c.dir, "freshness.mjs")).href); }
  catch { throw fail("itw_package_statements_unavailable", `the contract at ${c.dir} has no freshness.mjs (Project-Sophos #1509)`); }
  const probe = c.makeStatement({ pack: "probe", entity: "probe:x", property: "p", value: 1, partition: "public", status: "inference",
    derivedFrom: ["env-0000000000000000"], derivedBy: "probe", clock: () => "2026-01-01T00:00:00.000Z" });
  if (!(probe.lineage?.parents?.length === 1)) throw fail("itw_package_statements_unavailable", `the contract at ${c.dir} ignores derivedFrom (Project-Sophos #1509)`);
  return { ...c, freshness: fresh.freshness };
}

/** Build every entity file and the review list. Deterministic for a committed tree. */
export async function buildPackageStatements(root = ROOT, contract) {
  const packs = { pkg: readJson(root, PACKAGE_PACK), line: readJson(root, LINE_PACK) };
  for (const p of Object.values(packs)) { const v = contract.validatePack(p); if (!v.ok) throw fail("itw_package_statements_unavailable", `${p.pack} pack is invalid: ${v.errors.join("; ")}`); }
  const { findConflicts } = await import(pathToFileURL(path.join(contract.dir, "statement.mjs")).href);
  const fig = readFigures(root);
  const lineIds = sorted(new Set(fig.rates.map((r) => r.line)));
  const pkgIds = sorted(new Set(fig.prices.map((p) => p.pkg)));
  const prior = priorDates(root, [...lineIds.map((l) => `${LINE_DIR}/${l}.json`), ...pkgIds.map((p) => `${PACKAGE_DIR}/${p.slice("package:".length)}.json`)]);
  const dated = new Map();
  const dateOf = (file, checked) => checked ?? (dated.has(file) ? dated.get(file) : (dated.set(file, commitDate(root, file)), dated.get(file)));
  const seal = (pack, entity, property, value, refs, at, extra = {}) => {
    const p = pack.properties[property];
    const make = (when) => contract.makeStatement({
      pack: pack.pack, entity, property, value, unit: p.unit, partition: pack.partition, status: "inference",
      evidence: refs.map((ref) => ({ ref, tier: "secondary" })), sourceRef: refs[0], publisher: "In the Wake",
      assertedAt: when, observedAt: when, actor: ACTOR, clock: () => when, ...extra,
    });
    const s = at.fixed ? make(at.fixed) : keepDates(prior, make, at.fresh);
    const ok = contract.validateStatement(JSON.parse(JSON.stringify(s)));
    const fits = contract.checkStatement(pack, s);
    if (!ok.ok || !fits.ok) throw fail("itw_package_statements_unavailable", `${entity} ${property}: ${[...(ok.errors ?? []), ...(fits.errors ?? [])].join("; ")}`);
    return s;
  };
  const when = (file, checked) => (checked ? { fixed: checked } : { fresh: () => dateOf(file, null) });

  // Rates first: prices name their ids.
  const rateStmt = new Map(); // ref -> statement
  const byEntity = new Map();
  const push = (entity, s) => (byEntity.get(entity) ?? byEntity.set(entity, []).get(entity)).push(s);
  for (const r of fig.rates) {
    const s = seal(packs.line, `line:${r.line}`, "beverage_gratuity_rate", r.value, [r.ref], when(r.file, r.checked));
    rateStmt.set(r.ref, s);
    push(`line:${r.line}`, s);
  }
  // Group identical facts from the same file into one statement; different files stay separate witnesses.
  const groups = new Map();
  const add = (entity, property, value, ref, file, checked, extra = {}) => {
    const k = JSON.stringify([entity, property, value, file, extra.derivedFrom ?? []]);
    const g = groups.get(k) ?? groups.set(k, { entity, property, value, refs: new Set(), file, checked, extra }).get(k);
    g.refs.add(ref);
  };
  for (const p of fig.prices) {
    add(p.pkg, "name", p.name, `${p.ref}.name`, p.file, p.checked);
    add(p.pkg, "line", `line:${p.line}`, `${p.ref}`, p.file, p.checked);
    if (p.kind === "included") add(p.pkg, "price_per_day", p.price, `${p.ref}.priceMid`, p.file, p.checked);
    if (p.kind === "added") {
      const baseKey = JSON.stringify([p.pkg, "base_price_per_day", p.base, p.file, []]);
      add(p.pkg, "base_price_per_day", p.base, `${p.ref}.priceMid`, p.file, p.checked);
      groups.get(baseKey).priceOf ??= [];
      groups.get(baseKey).priceOf.push(p);
    }
  }
  const baseStmt = new Map();
  for (const g of [...groups.values()].sort((a, b) => (JSON.stringify([a.entity, a.property, a.value, a.file]) < JSON.stringify([b.entity, b.property, b.value, b.file]) ? -1 : 1))) {
    const s = seal(packs.pkg, g.entity, g.property, g.value, sorted(g.refs), when(g.file, g.checked));
    push(g.entity, s);
    for (const p of g.priceOf ?? []) baseStmt.set(p, s);
  }
  // Derived prices last: each names its base and its rate.
  const seen = new Set();
  for (const p of fig.prices.filter((x) => x.kind === "added")) {
    const base = baseStmt.get(p), rate = rateStmt.get(p.rate.ref);
    const k = JSON.stringify([p.pkg, p.price, base.id, rate.id]);
    if (seen.has(k)) continue;
    seen.add(k);
    push(p.pkg, seal(packs.pkg, p.pkg, "price_per_day", p.price, [`${p.ref}.priceMid`, p.rate.ref], when(p.file, p.checked),
      { derivedFrom: [base.id, rate.id], derivedBy: DERIVED_BY }));
  }

  const files = {}, disputes = [];
  for (const [entity, statements] of [...byEntity].sort(([a], [b]) => (a < b ? -1 : 1))) {
    const ordered = statements.sort((a, b) => (a.ext.property < b.ext.property ? -1 : a.ext.property > b.ext.property ? 1 : a.id < b.id ? -1 : 1));
    for (const c of findConflicts(ordered)) {
      const side = (x) => ({ value: x.ext.value, refs: x.epistemic.evidence.map((e) => e.ref), ...(x.lineage?.parents?.length ? { derived_from: x.lineage.parents } : {}) });
      disputes.push({ entity, property: c.a.ext.property, sides: [side(c.a), side(c.b)] });
    }
    const [type, slug] = entity.split(":");
    files[`${type === "line" ? LINE_DIR : PACKAGE_DIR}/${slug}.json`] = `${JSON.stringify({
      format: "lexicon-entity/1", entity,
      _about: "Generated by admin/lexicon/package-statements.mjs from this repository's own committed files; do not edit by hand (each statement's id is a hash of its content). A price_per_day computed from a base price and a gratuity rate names both in lineage.parents; Project-Sophos freshness() reads it stale when either is (operator ruling 2026-10-31). assets/data/entities/README.md#drink-package-prices-track-c7b",
      sources: sorted(new Set(statements.flatMap((s) => s.epistemic.evidence.map((e) => e.ref.replace(/^itw:/, "").split("#")[0])))),
      statements: ordered,
    }, null, 2)}\n`;
  }
  files[REVIEW_FILE] = `${JSON.stringify({
    format: "itw-package-review/1",
    _about: "Generated by admin/lexicon/package-statements.mjs; do not edit by hand. Nothing here is settled. disputes: two stores giving one package or line different values (gratuity-inclusive prices compared). zero_rates: lines whose files add nothing on top of a package price, which is not a 0 percent gratuity. not_filed: each figure left out, and why. unmatched: store keys with no line id. Freshness is not stored here because it changes with the clock: run node admin/lexicon/package-statements.mjs --freshness.",
    counts: { lines_with_a_rate: lineIds.length, packages: pkgIds.length, disputes: disputes.length, zero_rates: fig.zeroRates.length, not_filed: fig.notFiled.length, unmatched: fig.unmatched.length },
    sources: fig.sources, disputes, zero_rates: fig.zeroRates, not_filed: fig.notFiled, unmatched: fig.unmatched,
  }, null, 2)}\n`;
  return { files, disputes, statements: [...byEntity.values()].flat(), packs };
}

async function main(argv) {
  const check = argv.includes("--check"), fresh = argv.includes("--freshness");
  try {
    const contract = await loadPriceContract().catch((e) => { throw e.code === "itw_package_statements_unavailable" ? e : fail("itw_package_statements_unavailable", e.message); });
    const { files, disputes, statements, packs } = await buildPackageStatements(ROOT, contract);
    if (fresh) {
      const i = argv.indexOf("--at");
      const at = i >= 0 ? argv[i + 1] : new Date().toISOString();
      const ttl = (s) => (s.ext.pack === packs.line.pack ? packs.line : packs.pkg).properties[s.ext.property]?.ttl_days ?? null;
      const parents = new Map(statements.map((s) => [s.id, { statement: s, ttlDays: ttl(s) }]));
      const rows = statements.filter((s) => ttl(s) !== null).map((s) => ({ s, f: contract.freshness(s, { ttlDays: ttl(s), at, parents }) }));
      for (const { s, f } of rows.sort((a, b) => (a.s.subject < b.s.subject ? -1 : 1))) {
        process.stdout.write(`${f.state.padEnd(16)} ${s.subject} = ${s.ext.value}${f.checked_at ? `  checked ${f.checked_at.slice(0, 10)}` : ""}${f.stale_after ? `  stale after ${f.stale_after.slice(0, 10)}` : ""}\n`);
      }
      const n = (st) => rows.filter((r) => r.f.state === st).length;
      process.stdout.write(`package-statements: at ${at}: ${n("fresh")} fresh, ${n("stale")} stale, ${n("rests_on_stale")} resting on a stale fact, ${n("rests_on_unknown")} unknown\n`);
      return 0;
    }
    const dirs = [PACKAGE_DIR, LINE_DIR];
    const stale = Object.entries(files).filter(([rel, text]) => { try { return fs.readFileSync(path.join(ROOT, rel), "utf8") !== text; } catch { return true; } }).map(([rel]) => rel);
    const orphans = dirs.flatMap((d) => (fs.existsSync(path.join(ROOT, d)) ? fs.readdirSync(path.join(ROOT, d)).map((f) => `${d}/${f}`) : [])).filter((rel) => !(rel in files));
    if (check) {
      if (stale.length || orphans.length) {
        process.stderr.write(`package-statements: itw_package_statements_stale: ${stale.length} file(s) differ, ${orphans.length} orphan(s): ${[...stale, ...orphans].slice(0, 10).join(", ")}\n  remedy: commit the source change, then run node admin/lexicon/package-statements.mjs and commit what it writes\n`);
        return 1;
      }
      process.stdout.write(`package-statements: current (${Object.keys(files).length - 1} entity files, ${disputes.length} disputes named)\n`);
      return 0;
    }
    for (const d of dirs) fs.mkdirSync(path.join(ROOT, d), { recursive: true });
    for (const rel of stale) fs.writeFileSync(path.join(ROOT, rel), files[rel]);
    for (const rel of orphans) fs.rmSync(path.join(ROOT, rel));
    process.stdout.write(`package-statements: ${stale.length} file(s) written, ${orphans.length} orphan(s) removed (${disputes.length} disputes named in ${REVIEW_FILE})\n`);
    return 0;
  } catch (err) {
    const known = { itw_package_statements_unavailable: 2, itw_contract_unavailable: 2, itw_source_uncommitted: 2, itw_source_history_shallow: 2 };
    if (!known[err.code]) throw err;
    process.stderr.write(`package-statements: itw_package_statements_unavailable${err.code === "itw_package_statements_unavailable" ? "" : ` (${err.code})`}: ${err.message}\n  remedy: set LEXICON_CONTRACT_DIR to a contract with freshness.mjs and derivedFrom (Project-Sophos #1509), or commit the source the message names\n`);
    return 2;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = await main(process.argv.slice(2));
