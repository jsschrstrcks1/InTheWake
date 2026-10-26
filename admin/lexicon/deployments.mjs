#!/usr/bin/env node
// Ship deployments stored in ONE direction (Tekton itw-c5-deployments-one-direction; Project-Sophos
// docs/lexicon/LEXICON-PLAN-3.1.md, cruise.deployment: "ship x port x season, one direction stored").
//
// WHY. assets/data/ship-deployments.json held the same relation twice and the two copies disagreed:
// ships[*] (forward, 1,589 ship-port pairs counting homeports) fed the ship pages, port_to_ships (reverse,
// 6,145 pairs) fed the port pages, and only 1,130 pairs were in both. On top of that, every port page carried
// a "Ships That Visit Here" block baked in once by scripts/inject-ships-visiting.js and never refreshed, so a
// third copy drifted too (a renamed slug, a ship the data dropped).
//
// NOW. ships[*] is the only stored direction. Each ship's calls are its homeports, its typical_ports (the
// headline subset its own page shows) and also_calls_at (every other port it is recorded as calling at).
// port_to_ships is GENERATED from that, and the port pages' generated blocks are re-rendered from it between
// markers. Hand-written blocks are never touched: they are listed, with how they differ from the data.
//
// THE MIGRATION LOST NOTHING. It filed the union of every claim the repo made: the forward pairs, the reverse
// pairs, and the ship links baked into port pages that neither list held. A pair leaves the store only by a
// deliberate edit to ships[*], never by a tool picking a side.
//
//   node admin/lexicon/deployments.mjs            regenerate port_to_ships and the port pages' generated blocks
//   node admin/lexicon/deployments.mjs --check    exit non-zero if either is not what ships[*] says
//   node admin/lexicon/deployments.mjs --migrate  one-time move to one direction (refused once done)
//
// Exit codes (every refusal names its code and remedy):
//   0  written, or --check found everything current
//   1  itw_link_one_direction: port_to_ships differs from what ships[*] says (someone edited the derived
//      direction). Remedy: put the change in ships[*] (homeports, typical_ports or also_calls_at), then run
//      this tool without --check and commit the result.
//   2  itw_deployments_unreadable: the data file or a port page could not be read or parsed. Remedy: fix the
//      named file.
//   3  itw_ships_visiting_stale: a port page's generated block differs from what the data renders. Remedy: run
//      this tool without --check and commit the pages it rewrites; to keep a hand edit, move the block out of
//      the markers (it is then listed as hand-written and left alone).
//   4  itw_ship_page_unresolved: a ship in ships[*] has no page to link to. Remedy: fix its cruise_line or
//      slug, or add the page; a link to a missing page is never rendered.
//   5  itw_migration_refused: --migrate on data already in one direction. Remedy: none needed; edit ships[*].
// Soli Deo Gloria.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
export const DATA = "assets/data/ship-deployments.json";
export const PORTS_DIR = "ports";
const SKIP_PAGES = new Set(["index.html", "tender-ports.html"]);
export const MARK_START = "<!-- itw:ships-visiting generated from assets/data/ship-deployments.json by admin/lexicon/deployments.mjs; edit the data, not this list -->";
export const MARK_END = "<!-- /itw:ships-visiting -->";

// Each line's folder under ships/ and its display name. The folders are the ones the pages actually live in
// (the old injector's map pointed Norwegian, Holland America and Virgin at folders that do not exist).
export const LINES = Object.freeze({
  rcl: { name: "Royal Caribbean", dir: "rcl" },
  carnival: { name: "Carnival Cruise Line", dir: "carnival" },
  celebrity: { name: "Celebrity Cruises", dir: "celebrity-cruises" },
  ncl: { name: "Norwegian Cruise Line", dir: "norwegian" },
  princess: { name: "Princess Cruises", dir: "princess" },
  hal: { name: "Holland America Line", dir: "holland-america-line" },
  msc: { name: "MSC Cruises", dir: "msc" },
  virgin: { name: "Virgin Voyages", dir: "virgin-voyages" },
  costa: { name: "Costa Cruises", dir: "costa" },
  cunard: { name: "Cunard", dir: "cunard" },
  oceania: { name: "Oceania Cruises", dir: "oceania" },
  regent: { name: "Regent Seven Seas", dir: "regent" },
  seabourn: { name: "Seabourn", dir: "seabourn" },
  silversea: { name: "Silversea Cruises", dir: "silversea" },
  explora: { name: "Explora Journeys", dir: "explora-journeys" },
});

// Display order and class order, unchanged from the injector the baked blocks came from.
const LINE_ORDER = ["rcl", "celebrity", "princess", "hal", "cunard", "oceania", "regent",
  "seabourn", "silversea", "explora", "ncl", "msc", "costa", "virgin", "carnival"];
const CLASS_ORDERS = {
  rcl: ["Icon", "Oasis", "Quantum", "Freedom", "Voyager", "Radiance", "Vision", "Other"],
  carnival: ["Excel", "Vista", "Dream", "Concordia", "Venice", "Destiny", "Conquest", "Spirit", "Fantasy", "Other"],
  celebrity: ["Edge", "Solstice", "Millennium", "Expedition", "Other"],
  ncl: ["Prima", "Breakaway Plus", "Breakaway", "Epic", "Jewel", "Dawn", "Sun", "Spirit", "Sky", "America", "Other"],
  princess: ["Sphere", "Royal", "Grand", "Coral", "Other"],
  hal: ["Pinnacle", "Signature", "Vista", "R", "Other"],
  msc: ["World", "Meraviglia Plus", "Seaside EVO", "Meraviglia", "Seaside", "Fantasia", "Musica", "Lirica", "Other"],
  virgin: ["Lady", "Other"],
  costa: ["Excellence", "Venice", "Diadema", "Concordia", "Spirit", "Other"],
  cunard: ["Ocean Liner", "Queen", "Other"],
  oceania: ["Allura", "Vista", "Oceania", "R-Class", "Other"],
  regent: ["Grandeur", "Splendor", "Explorer", "Voyager", "Mariner", "Navigator", "Other"],
  seabourn: ["Encore", "Odyssey", "Expedition", "Other"],
  silversea: ["Nova", "Muse", "Spirit", "Shadow", "Wind", "Expedition", "Other"],
  explora: ["Explora", "Other"],
};

const fail = (code, message) => Object.assign(new Error(message), { code });
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** The file's own form: 2-space JSON, non-ASCII escaped as \uXXXX (lowercase hex), trailing newline. */
export const renderData = (data) => `${JSON.stringify(data, null, 2)
  .replace(/[\u0080-\uffff]/g, (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, "0")}`)}\n`;

/** Every port a ship is recorded as calling at, in the order its fields list them. */
export function callsOf(ship) {
  return [...new Set([...(ship.homeports ?? []), ...(ship.typical_ports ?? []), ...(ship.also_calls_at ?? [])])];
}

/** The derived direction: port -> ships, ports sorted, ships in ships[*] order. */
export function derivePortToShips(ships) {
  const out = new Map();
  for (const [slug, ship] of Object.entries(ships)) {
    for (const port of callsOf(ship)) { if (!out.has(port)) out.set(port, []); out.get(port).push(slug); }
  }
  return Object.fromEntries([...out.keys()].sort().map((k) => [k, out.get(k)]));
}

/** The page a ship links to, or null. The slug's own page first; otherwise the page named by the slug
 *  without its line prefix ("oceania-insignia" -> oceania/insignia.html), and only when that short name is
 *  the ship's own recorded name, so a prefix is never stripped onto a different ship. */
export function resolveShipPage(root, slug, ship) {
  const line = LINES[ship.cruise_line];
  if (!line) return null;
  if (fs.existsSync(path.join(root, "ships", line.dir, `${slug}.html`))) return `/ships/${line.dir}/${slug}.html`;
  const prefix = `${ship.cruise_line}-`;
  const short = slug.startsWith(prefix) ? slug.slice(prefix.length) : null;
  const named = String(ship.name ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  if (short && short === named && fs.existsSync(path.join(root, "ships", line.dir, `${short}.html`))) return `/ships/${line.dir}/${short}.html`;
  return null;
}

export function shipPages(root, ships) {
  const pages = {};
  for (const [slug, ship] of Object.entries(ships)) {
    pages[slug] = resolveShipPage(root, slug, ship);
    if (!pages[slug]) throw fail("itw_ship_page_unresolved", `${slug} (${ship.cruise_line}) has no page under ships/`);
  }
  return pages;
}

/** The generated part of a port's block: one label per line when more than one line calls, then pills. */
export function renderRegion(shipSlugs, ships, pages, I = "        ") {
  const byLine = {};
  for (const slug of shipSlugs) {
    const ship = ships[slug];
    const line = ship.cruise_line || "rcl";
    const cls = ship.class || "Other";
    ((byLine[line] ??= {})[cls] ??= []).push({ slug, name: ship.name, cls });
  }
  const active = LINE_ORDER.filter((l) => byLine[l]);
  const lines = [];
  for (const line of active) {
    if (active.length > 1) lines.push(`${I}<p class="cruise-line-label">${esc(LINES[line].name)}</p>`);
    lines.push(`${I}<div class="ship-links">`);
    const order = CLASS_ORDERS[line] ?? CLASS_ORDERS.rcl;
    const rank = (c) => (order.indexOf(c) === -1 ? 999 : order.indexOf(c));
    for (const cls of Object.keys(byLine[line]).sort((a, b) => rank(a) - rank(b))) {
      for (const s of byLine[line][cls].sort((a, b) => a.name.localeCompare(b.name))) {
        lines.push(`${I}  <a href="${pages[s.slug]}" class="ship-link-pill" data-line="${line}" title="${esc(s.name)} (${esc(s.cls)} Class)">${esc(s.name)}</a>`);
      }
    }
    lines.push(`${I}</div>`);
  }
  return lines.join("\n");
}

const OPEN = '<section class="card ships-visiting" aria-labelledby="ships-visiting-title">';
// The generated block's grammar, at whatever indent the page uses (`I`): heading (h3, or h4 where a page's
// heading order was fixed), intro, one or more pill groups, the browse link. Heading and intro are kept
// verbatim; only the pill groups are the tool's.
const HEAD = /^\n( +)<h([34]) id="ships-visiting-title">Ships That Visit Here<\/h\2>\n\1<p class="tiny" style="[^"\n]*">[^<\n]*<\/p>\n/;
const group = (I) => new RegExp(`${I}(<p class="cruise-line-label">[^<\\n]*</p>\\n${I})?<div class="ship-links">\\n(${I}  <a href="[^"\\n]*" class="ship-link-pill" data-line="[^"\\n]*" title="[^"\\n]*">[^<\\n]*</a>\\n)+${I}</div>\\n`, "y");
const tail = (I) => new RegExp(`^${I}<p class="tiny" style="[^"\\n]*"><a href="/ships/">Browse all cruise ships (?:→|&rarr;)</a></p>\\n${I.slice(2)}</section>$`);

/** Find a port page's ships block and say what it is:
 *   marked   generated before: the region between the markers is the tool's
 *   adoptable  the old injector's exact output, never hand-edited: its pill groups become the region
 *   hand     anything else (a note, a noscript list, a different layout): left alone
 *   none     no block (the page relies on the browser script)
 *  `start`/`end` bound the region to replace (for adoptable, the pill groups; for marked, the markers too). */
export function classifyBlock(html) {
  const at = html.indexOf('id="ships-visiting-title"');
  if (at === -1) return { kind: "none" };
  if (html.indexOf('id="ships-visiting-title"', at + 1) !== -1) return { kind: "hand", why: "more than one block" };
  const s = html.indexOf(MARK_START);
  if (s !== -1) {
    const e = html.indexOf(MARK_END, s);
    if (e === -1) return { kind: "hand", why: "start marker without end marker" };
    return { kind: "marked", indent: html.slice(html.lastIndexOf("\n", s) + 1, s), start: s, end: e + MARK_END.length };
  }
  const open = html.lastIndexOf(OPEN, at);
  if (open === -1) return { kind: "hand", why: "block is not the generated <section> form" };
  const close = html.indexOf("</section>", at);
  const block = html.slice(open + OPEN.length, close + "</section>".length);
  const head = HEAD.exec(block);
  if (!head) return { kind: "hand", why: "heading or intro differs from the generated form" };
  const indent = head[1];
  const GROUP = group(indent);
  let pos = head[0].length;
  GROUP.lastIndex = pos;
  while (GROUP.exec(block)) pos = GROUP.lastIndex;
  if (pos === head[0].length || indent.length < 2 || !tail(indent).test(block.slice(pos))) return { kind: "hand", why: "body differs from the generated form" };
  const base = open + OPEN.length;
  return { kind: "adoptable", indent, start: base + head[0].length, end: base + pos };
}

/** The whole ships block (generated <section> or a hand-written <div>), or "" when the page has none. The
 *  block's own closing tag is the first one at its opening tag's indent. */
export function blockHtml(html) {
  const at = html.indexOf('id="ships-visiting-title"');
  if (at === -1) return "";
  const open = Math.max(html.lastIndexOf("<section", at), html.lastIndexOf("<div", at));
  const tag = html.startsWith("<section", open) ? "section" : "div";
  const indent = html.slice(html.lastIndexOf("\n", open) + 1, open);
  const close = html.indexOf(`\n${indent}</${tag}>`, at);
  return close === -1 ? "" : html.slice(open, close);
}

/** The ships a block links to, as page paths. */
export const linkedPages = (blockHtml) => [...blockHtml.matchAll(/href="(\/ships\/[^"]+\.html)" class="ship-link-pill"/g)].map((m) => m[1]);

function readData(root) {
  try { return JSON.parse(fs.readFileSync(path.join(root, DATA), "utf8")); }
  catch (err) { throw fail("itw_deployments_unreadable", `${DATA}: ${err.message}`); }
}

function portFiles(root) {
  return fs.readdirSync(path.join(root, PORTS_DIR)).filter((f) => f.endsWith(".html") && !SKIP_PAGES.has(f)).sort();
}

/** What the data says every derived artifact should be. Pure apart from reading files. */
export function plan(root, data = readData(root)) {
  const pages = shipPages(root, data.ships);
  const portToShips = derivePortToShips(data.ships);
  const files = {};
  const hand = [];
  const noBlock = [];
  for (const f of portFiles(root)) {
    const rel = `${PORTS_DIR}/${f}`;
    const port = f.slice(0, -5);
    const html = fs.readFileSync(path.join(root, rel), "utf8");
    const block = classifyBlock(html);
    const ships = portToShips[port] ?? [];
    if (block.kind === "none") { if (ships.length) noBlock.push(port); continue; }
    if (block.kind === "hand") {
      const shown = new Set(linkedPages(blockHtml(html)));
      const want = new Set(ships.map((s) => pages[s]));
      hand.push({ port, why: block.why, not_in_data: [...shown].filter((p) => !want.has(p)).sort(), not_on_page: [...want].filter((p) => !shown.has(p)).sort() });
      continue;
    }
    if (!ships.length) { hand.push({ port, why: "generated block but no ship in the data calls here", not_in_data: [], not_on_page: [] }); continue; }
    const I = block.indent;
    const region = `${MARK_START}\n${renderRegion(ships, data.ships, pages, I)}\n${I}${MARK_END}`;
    const next = `${html.slice(0, block.start)}${block.kind === "adoptable" ? I : ""}${region}${block.kind === "adoptable" ? "\n" : ""}${html.slice(block.end)}`;
    files[rel] = next;
  }
  return { data: { ...data, port_to_ships: portToShips }, files, hand, noBlock, pages };
}

/** One-time: file every claim the repo makes into ships[*]. Refused when already done. */
export function migrate(root, data = readData(root), { at = new Date().toISOString() } = {}) {
  if (data.metadata?.one_direction) throw fail("itw_migration_refused", "already stored in one direction (metadata.one_direction is set)");
  const pages = shipPages(root, data.ships);
  const bySlugPage = Object.fromEntries(Object.entries(pages).map(([s, p]) => [p, s]));
  const extra = new Map(Object.keys(data.ships).map((s) => [s, new Set()]));
  const counts = { reverse: 0, page_links: 0 };
  for (const [port, ships] of Object.entries(data.port_to_ships ?? {})) {
    for (const s of ships) {
      if (!data.ships[s]) throw fail("itw_deployments_unreadable", `port_to_ships.${port} names ${s}, which is not in ships`);
      if (!callsOf(data.ships[s]).includes(port) && !extra.get(s).has(port)) { extra.get(s).add(port); counts.reverse += 1; }
    }
  }
  for (const f of portFiles(root)) {
    const port = f.slice(0, -5);
    const html = fs.readFileSync(path.join(root, PORTS_DIR, f), "utf8");
    for (const href of linkedPages(blockHtml(html))) {
      const s = bySlugPage[href];
      if (!s) continue; // a link to no known ship cannot be filed; it stays on its page untouched
      if (!callsOf(data.ships[s]).includes(port) && !extra.get(s).has(port)) { extra.get(s).add(port); counts.page_links += 1; }
    }
  }
  const ships = {};
  for (const [s, ship] of Object.entries(data.ships)) {
    const more = [...extra.get(s)].sort();
    ships[s] = more.length ? { ...ship, also_calls_at: [...new Set([...(ship.also_calls_at ?? []), ...more])].sort() } : ship;
  }
  const metadata = {
    ...data.metadata,
    version: "1.15.0",
    one_direction: "ships[*] is the only stored direction: homeports, typical_ports (the headline subset a ship page shows) and also_calls_at (every other recorded call). port_to_ships is generated by admin/lexicon/deployments.mjs; edit ships[*], never port_to_ships.",
    migrated_to_one_direction: { at, tool: "admin/lexicon/deployments.mjs --migrate", filed_from_reverse: counts.reverse, filed_from_port_page_links: counts.page_links },
  };
  return { ...data, metadata, ships };
}

function write(root, p) {
  fs.writeFileSync(path.join(root, DATA), renderData(p.data));
  for (const [rel, text] of Object.entries(p.files)) fs.writeFileSync(path.join(root, rel), text);
}

function report(p) {
  const lines = [`deployments: ${Object.keys(p.data.ships).length} ships, ${Object.keys(p.data.port_to_ships).length} ports, ${Object.keys(p.files).length} port pages generated`];
  lines.push(`  hand-written blocks left alone: ${p.hand.length}`);
  for (const h of p.hand) {
    const d = [h.not_in_data.length && `${h.not_in_data.length} linked but not in the data`, h.not_on_page.length && `${h.not_on_page.length} in the data but not linked`].filter(Boolean).join(", ");
    lines.push(`    ${h.port}: ${h.why}${d ? ` (${d})` : ""}`);
  }
  lines.push(`  ports with ships but no block (the browser script renders them): ${p.noBlock.length}`);
  return `${lines.join("\n")}\n`;
}

async function main(argv) {
  const check = argv.includes("--check");
  try {
    if (argv.includes("--migrate")) {
      const p = plan(ROOT, migrate(ROOT));
      write(ROOT, p);
      process.stdout.write(`deployments: migrated to one direction (${JSON.stringify(p.data.metadata.migrated_to_one_direction)})\n${report(p)}`);
      return 0;
    }
    const data = readData(ROOT);
    const p = plan(ROOT, data);
    if (!check) { write(ROOT, p); process.stdout.write(report(p)); return 0; }
    if (renderData(p.data) !== renderData(data)) {
      process.stderr.write(`deployments: itw_link_one_direction: port_to_ships is not what ships[*] says\n  remedy: make the change in ships[*], then run node admin/lexicon/deployments.mjs and commit the result\n`);
      return 1;
    }
    const stale = Object.entries(p.files).filter(([rel, text]) => fs.readFileSync(path.join(ROOT, rel), "utf8") !== text).map(([rel]) => rel);
    if (stale.length) {
      process.stderr.write(`deployments: itw_ships_visiting_stale: ${stale.length} port page(s) differ from what the data renders: ${stale.slice(0, 10).join(", ")}${stale.length > 10 ? ", ..." : ""}\n  remedy: run node admin/lexicon/deployments.mjs and commit the pages it rewrites\n`);
      return 3;
    }
    process.stdout.write(`deployments: current (${Object.keys(p.files).length} generated port blocks, ${p.hand.length} hand-written left alone)\n`);
    return 0;
  } catch (err) {
    const codes = { itw_deployments_unreadable: 2, itw_ship_page_unresolved: 4, itw_migration_refused: 5 };
    if (!codes[err.code]) throw err;
    process.stderr.write(`deployments: ${err.code}: ${err.message}\n  remedy: see the exit codes at the top of admin/lexicon/deployments.mjs\n`);
    return codes[err.code];
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = await main(process.argv.slice(2));
