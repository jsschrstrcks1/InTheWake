#!/usr/bin/env node
// Gazetteer reads for the disputed port positions (Tekton itw-c6b-port-gazetteer; operator ruling 2026-10-29:
// "Geo type with tolerance", then "Next build" for the gazetteer reads; the port pack names `gazetteer` as the
// most authoritative source kind for place_position).
//
// WHY. port-statements.mjs names 46 ports whose own files place them beyond the pack's 5 km tolerance of each
// other (assets/data/lexicon/port-disputes.json). Nothing outside this repository had been asked which side is
// the place. This tool asks GeoNames, a public gazetteer (CC BY 4.0, https://www.geonames.org), and records what
// it says, VERBATIM, so the statement generator can file it and a person can settle the dispute with it in hand.
//
// HOW A FEATURE IS FOUND, never guessed:
//   names     the names this site already gives the port: the slug's words, the registry name, the page's place
//             name, and each part of a qualified name ("Bangkok (Laem Chabang)" gives "Bangkok" and "Laem
//             Chabang"), normalised for case, accents and punctuation. A GeoNames feature matches when its name,
//             ASCII name or one of its alternate names normalises to one of them exactly.
//   kinds     a place a guide can be about: populated places (class P), islands, capes and other land (T),
//             water such as fjords, bays, lakes and canals (H), parks and regions (L), and a country or dependency
//             (A, codes PCL*). Never a building, a road, an airport or an administrative district (S, R, U, V, and
//             A other than PCL*): those are not the destination, and an admin centroid is not a place on the map.
//   where     the countries the dispute's sides lie in (the country of the nearest cities500 place within
//             COUNTRY_SEARCH_M of each side; a side with none, as in Antarctica, is searched in AQ), and only
//             features within COUNTRY_SEARCH_M of either side. The window is wide on purpose: only a feature within
//             the pack's tolerance of a side counts for the verdict, and the rest are what a person reads when no
//             side is named (a city's GeoNames point can lie well inland of both its port and its page's pin).
// Every feature that passes is recorded. Which one the guide is about is NOT decided here: see verdict().
//
// WHAT A VERDICT SAYS (verdict(), read by port-statements.mjs into the dispute list):
//   supports_one_side   name-matched features lie within the tolerance of exactly one side: the gazetteer agrees
//                       with that side. The generator files the nearest such feature as a gazetteer statement.
//   names_both_sides    each side lies within tolerance of a feature carrying one of the port's names (a city and
//                       its cruise terminal, say). Both are real places; which one the guide is about is a
//                       person's call. Nothing is filed.
//   names_neither       features were found, none within tolerance of either side. Nothing is filed.
//   no_match            no feature carries any of the port's names in the window. Nothing is filed.
// Settling a dispute stays a person's act (rank preferred on the side the evidence supports); nothing here, and
// nothing in the generator, picks a side.
//
//   node admin/lexicon/port-gazetteer.mjs capture [--cache DIR]   read GeoNames, write the observation file
//
// Needs network access to download.geonames.org and the `unzip` program. The tests do not run the capture; they
// run match() and verdict() on fixed rows, and the generator reads the committed observation file.
//
// @exit 0 the observation file was written
// @exit 2 could not look: itw_gazetteer_unavailable, a GeoNames file could not be downloaded or unzipped, or the dispute list or an entity file could not be read. remedy: the message names the file; run where download.geonames.org is reachable and unzip is installed, or run node admin/lexicon/port-statements.mjs first
// Soli Deo Gloria.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import readline from "node:readline";
import { spawn, execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
export const OBSERVATION_FILE = "assets/data/lexicon/gazetteer/geonames-ports.json";
const DISPUTES_FILE = "assets/data/lexicon/port-disputes.json";
const PACK_FILE = "assets/data/lexicon/cruise.port.pack.json";
const ENTITY_DIR = "assets/data/entities/port";
const DUMP = "https://download.geonames.org/export/dump/";
export const COUNTRY_SEARCH_M = 300000;
const fail = (code, message) => Object.assign(new Error(message), { code });

export const norm = (s) => String(s).normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

/** Great-circle distance in metres (the same haversine the statement contract uses for its tolerance). */
export function distanceM(a, b) {
  const R = 6371008.8, rad = (x) => (x * Math.PI) / 180;
  const h = Math.sin(rad(b.lat - a.lat) / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lon - a.lon) / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** The names to search for: the slug's words, each recorded name, and each part of a qualified name. */
export function searchNames(slug, recordedNames) {
  const out = new Set([norm(slug.replace(/-/g, " "))]);
  for (const n of recordedNames) {
    out.add(norm(n));
    for (const part of String(n).split(/\s*[/,()]\s*|\s+-\s+/)) out.add(norm(part));
  }
  out.delete("");
  return [...out].sort();
}

/** A feature kind a guide can be about (see the header). */
export function placeKind(featureClass, featureCode) {
  if ("PTHL".includes(featureClass) && featureClass.length === 1) return true;
  return featureClass === "A" && /^PCL/.test(featureCode);
}

/** One GeoNames row (the tab-separated `geoname` table) as a feature, or null when it is not a place kind. */
export function feature(cols) {
  if (cols.length < 15 || !placeKind(cols[6], cols[7])) return null;
  return {
    geonameid: Number(cols[0]), name: cols[1], feature: `${cols[6]}.${cols[7]}`, country: cols[8],
    lat: Number(cols[4]), lon: Number(cols[5]), population: Number(cols[14]) || 0,
    names: [cols[1], cols[2], ...(cols[3] ? cols[3].split(",") : [])],
  };
}

/** The features among `rows` that carry one of `names` and lie within `windowM` of a side. */
export function match(rows, names, sides, windowM) {
  const want = new Set(names);
  const hits = [];
  for (const cols of rows) {
    const f = feature(cols);
    if (!f) continue;
    const matched = f.names.map(norm).find((n) => want.has(n));
    if (!matched) continue;
    if (!sides.some((s) => distanceM(s, f) <= windowM)) continue;
    const { names: _ignored, ...rest } = f;
    hits.push({ ...rest, matched_name: matched });
  }
  return hits.sort((a, b) => a.geonameid - b.geonameid);
}

/**
 * What the gazetteer says about one dispute: which sides lie within `toleranceM` of a name-matched feature.
 * Returns { verdict, sides: [{ features: [{ geonameid, name, feature, distance_m }] }], file }, where `file` is
 * the feature to file as a statement (supports_one_side only: the nearest one to the supported side).
 */
export function verdict(dispute, features, toleranceM) {
  const sides = dispute.sides.map((s) => ({
    features: features.map((f) => ({ geonameid: f.geonameid, name: f.name, feature: f.feature, distance_m: Math.round(distanceM(s.value, f)) }))
      .filter((f) => f.distance_m <= toleranceM).sort((a, b) => a.distance_m - b.distance_m || a.geonameid - b.geonameid),
  }));
  const named = sides.map((s, i) => (s.features.length ? i : -1)).filter((i) => i >= 0);
  if (!features.length) return { verdict: "no_match", sides, file: null };
  if (named.length === 0) {
    const nearest = features.map((f) => ({ geonameid: f.geonameid, name: f.name, feature: f.feature, distance_m: Math.round(Math.min(...dispute.sides.map((s) => distanceM(s.value, f)))) }))
      .sort((a, b) => a.distance_m - b.distance_m || a.geonameid - b.geonameid)[0];
    return { verdict: "names_neither", sides, nearest, file: null };
  }
  if (named.length > 1) return { verdict: "names_both_sides", sides, file: null };
  const id = sides[named[0]].features[0].geonameid;
  return { verdict: "supports_one_side", side: named[0], sides, file: features.find((f) => f.geonameid === id) };
}

const sha256 = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");

/** Download a dump file into `cache` (kept if already there with its headers) and say what was read. */
function fetchDump(cache, name) {
  const file = path.join(cache, name), headers = `${file}.headers`;
  if (!fs.existsSync(file) || !fs.existsSync(headers)) {
    try { execFileSync("curl", ["-sS", "-f", "-m", "900", "-D", headers, "-o", file, `${DUMP}${name}`], { stdio: ["ignore", "ignore", "pipe"] }); }
    catch (e) { throw fail("itw_gazetteer_unavailable", `${DUMP}${name} could not be downloaded (${String(e.stderr || e.message).trim()})`); }
  }
  const lm = /^last-modified:\s*(.+)$/im.exec(fs.readFileSync(headers, "utf8"));
  return { url: `${DUMP}${name}`, last_modified: lm ? lm[1].trim() : null, bytes: fs.statSync(file).size, sha256: sha256(file) };
}

/** Stream the rows of one file inside a dump zip, calling `each(cols)` per line. */
function eachRow(zip, member, each) {
  return new Promise((resolve, reject) => {
    const p = spawn("unzip", ["-p", zip, member], { stdio: ["ignore", "pipe", "pipe"] });
    let err = "";
    p.on("error", (e) => reject(fail("itw_gazetteer_unavailable", `unzip could not run (${e.message})`)));
    p.stderr.on("data", (d) => { err += d; });
    readline.createInterface({ input: p.stdout }).on("line", (l) => { if (l) each(l.split("\t")); });
    p.on("close", (code) => (code === 0 ? resolve() : reject(fail("itw_gazetteer_unavailable", `unzip ${path.basename(zip)} ${member} exited ${code}: ${err.trim()}`))));
  });
}

const readJson = (root, rel) => {
  try { return JSON.parse(fs.readFileSync(path.join(root, rel), "utf8")); }
  catch (e) { throw fail("itw_gazetteer_unavailable", `${rel} could not be read (${e.message})`); }
};

/** Read GeoNames for every place_position dispute and return the observation document. Needs the network. */
export async function capture(root = ROOT, cache = path.join(os.tmpdir(), "itw-geonames")) {
  fs.mkdirSync(cache, { recursive: true });
  const pack = readJson(root, PACK_FILE);
  const toleranceM = pack.properties.place_position.tolerance_m;
  const disputes = readJson(root, DISPUTES_FILE).disputes.filter((d) => d.property === "place_position");
  const ports = disputes.map((d) => {
    const slug = d.entity.replace(/^port:/, "");
    const ent = readJson(root, `${ENTITY_DIR}/${slug}.json`);
    const recorded = ent.statements.filter((s) => s.ext.property === "name" || s.ext.property === "page_place_name").map((s) => s.ext.value);
    return { slug, sides: d.sides.map((s) => s.value), names: searchNames(slug, recorded), window_m: COUNTRY_SEARCH_M, countries: new Set() };
  });
  const files = { "cities500.zip": fetchDump(cache, "cities500.zip") };
  const nearest = ports.flatMap((p) => p.sides.map(() => null));
  await eachRow(path.join(cache, "cities500.zip"), "cities500.txt", (c) => {
    const at = { lat: Number(c[4]), lon: Number(c[5]) };
    let k = 0;
    for (const p of ports) for (const s of p.sides) {
      const m = distanceM(s, at);
      if (m <= COUNTRY_SEARCH_M && (!nearest[k] || m < nearest[k].m)) nearest[k] = { m, cc: c[8] };
      k++;
    }
  });
  let k = 0;
  for (const p of ports) for (const _ of p.sides) { p.countries.add(nearest[k] ? nearest[k].cc : "AQ"); k++; }
  const byCountry = {};
  for (const p of ports) for (const cc of p.countries) (byCountry[cc] ||= []).push(p);
  const found = Object.fromEntries(ports.map((p) => [p.slug, []]));
  for (const cc of Object.keys(byCountry).sort()) {
    files[`${cc}.zip`] = fetchDump(cache, `${cc}.zip`);
    const rows = [];
    const keys = new Set(byCountry[cc].flatMap((p) => p.names));
    await eachRow(path.join(cache, `${cc}.zip`), `${cc}.txt`, (c) => {
      if (c.length < 4) return;
      if ([c[1], c[2], ...(c[3] ? c[3].split(",") : [])].some((n) => keys.has(norm(n)))) rows.push(c);
    });
    for (const p of byCountry[cc]) found[p.slug].push(...match(rows, p.names, p.sides, p.window_m));
  }
  return {
    format: "itw-gazetteer-observation/1",
    _about: "Written by admin/lexicon/port-gazetteer.mjs capture; do not edit by hand. What GeoNames (a public gazetteer, CC BY 4.0, https://www.geonames.org) records under the names this site gives each disputed port, near either side of the dispute, read from the dump files named under `files`. Every matching feature is listed; which one a guide is about is not decided here. assets/data/entities/README.md#gazetteer-reads-track-c6b",
    gazetteer: "GeoNames", license: "CC BY 4.0", attribution: "GeoNames, https://www.geonames.org",
    read_at: new Date().toISOString(),
    rule: { kinds: "feature class P, T, H or L, or A with a PCL* code", country_search_m: COUNTRY_SEARCH_M, window_m: COUNTRY_SEARCH_M, tolerance_m: toleranceM },
    files,
    ports: Object.fromEntries(ports.map((p) => [p.slug, { names: p.names, countries: [...p.countries].sort(), window_m: p.window_m, features: found[p.slug].sort((a, b) => a.geonameid - b.geonameid) }])),
  };
}

async function main(argv) {
  if (argv[0] !== "capture") {
    process.stderr.write("usage: node admin/lexicon/port-gazetteer.mjs capture [--cache DIR]\n");
    return 2;
  }
  const i = argv.indexOf("--cache");
  try {
    const doc = await capture(ROOT, i >= 0 ? path.resolve(argv[i + 1]) : undefined);
    const out = path.join(ROOT, OBSERVATION_FILE);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, `${JSON.stringify(doc, null, 2)}\n`);
    const n = Object.values(doc.ports);
    process.stdout.write(`port-gazetteer: ${n.length} disputed port(s) read, ${n.filter((p) => p.features.length).length} with a name-matched feature, from ${Object.keys(doc.files).length} GeoNames file(s); wrote ${OBSERVATION_FILE}\n  next: commit it, then run node admin/lexicon/port-statements.mjs\n`);
    return 0;
  } catch (err) {
    if (err.code !== "itw_gazetteer_unavailable") throw err;
    process.stderr.write(`port-gazetteer: itw_gazetteer_unavailable: ${err.message}\n  remedy: run where download.geonames.org is reachable and unzip is installed, or run node admin/lexicon/port-statements.mjs first\n`);
    return 2;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = await main(process.argv.slice(2));
