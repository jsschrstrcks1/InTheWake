#!/usr/bin/env node
// migrate-ship-stats-card.mjs: puts every ship page's stats card on the one renderer, assets/js/ship-stats.js.
// Soli Deo Gloria.
//
// Tekton itw-stats-card-wiped-on-8-ship-pages. For each tracked ships/**/*.html that has a #ship-stats mount:
//   1. removes the inline <script> that defines renderStats (with its "Ship stats loader" comment), which
//      fetched logbook persona files and overwrote the card with them;
//   2. adds <script src="/assets/js/ship-stats.js" defer></script> before </body>, once.
// It changes nothing else, and running it twice changes nothing the second time.
//
//   node admin/migrate-ship-stats-card.mjs           rewrite the pages
//   node admin/migrate-ship-stats-card.mjs --check   change nothing; list pages not yet migrated
//
// @exit 0 every page is on the shared renderer (or, without --check, now is)
// @exit 1 refused: --check found pages still carrying the inline loader or missing the script tag. remedy: run node admin/migrate-ship-stats-card.mjs and commit the pages it rewrites
// @exit 2 could not look: a page's inline loader is not in the shape this tool knows, so it was not touched. remedy: read the named page and remove its loader by hand, or teach this tool the shape
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

export const SCRIPT_TAG = '<script src="/assets/js/ship-stats.js" defer></script>';
const MARKER = /[ \t]*<!-- ===== Ship stats loader ===== -->[ \t]*\r?\n/;

// Returns { html, removed, added } or throws { code: "unknown_shape" } when renderStats sits in a script it cannot isolate.
export function migratePage(html) {
  let out = html, removed = 0;
  for (;;) {
    const i = out.indexOf("function renderStats");
    if (i < 0) break;
    const a = out.lastIndexOf("<script", i), b = out.indexOf("</script>", i);
    const block = out.slice(a, b);
    // Only a block that is the stats loader and nothing more: its own functions and the two stats ids.
    const fns = [...block.matchAll(/function\s+([A-Za-z_$][\w$]*)/g)].map((m) => m[1]);
    const ids = [...block.matchAll(/getElementById\('([^']+)'\)/g)].map((m) => m[1]);
    const okFns = fns.every((f) => ["abs", "initStats", "renderStats", "tryFetch"].includes(f));
    const okIds = ids.every((d) => d === "ship-stats" || d === "ship-stats-fallback");
    if (a < 0 || b < 0 || !okFns || !okIds || !/^<script>\s*\(function initStats\(\)/.test(block)) {
      const e = new Error("inline stats loader in an unknown shape"); e.code = "unknown_shape"; throw e;
    }
    let start = a, end = b + "</script>".length;
    const lineStart = out.lastIndexOf("\n", start - 1) + 1;
    if (/^[ \t]*$/.test(out.slice(lineStart, start))) start = lineStart;
    const before = out.slice(0, start);
    const markerLineStart = before.lastIndexOf("\n", before.length - 2) + 1;
    if (MARKER.test(before.slice(markerLineStart))) start = markerLineStart;
    if (out[end] === "\r") end++;
    if (out[end] === "\n") end++;
    out = out.slice(0, start) + out.slice(end);
    removed++;
  }
  let added = false;
  if (!out.includes(SCRIPT_TAG)) {
    const j = out.lastIndexOf("</body>");
    if (j < 0) { const e = new Error("no </body>"); e.code = "unknown_shape"; throw e; }
    const lineStart = out.lastIndexOf("\n", j - 1) + 1;
    const indent = /^[ \t]*$/.test(out.slice(lineStart, j)) ? out.slice(lineStart, j) : "";
    const at = indent ? lineStart : j;
    out = out.slice(0, at) + `${indent || "  "}${SCRIPT_TAG}\n` + out.slice(at);
    added = true;
  }
  return { html: out, removed, added };
}

export function shipPagesWithMount(root) {
  return execFileSync("git", ["-C", root, "grep", "-l", 'id="ship-stats"', "--", "ships/**/*.html"], { encoding: "utf8" })
    .trim().split("\n").filter(Boolean);
}

function main() {
  const root = fileURLToPath(new URL("..", import.meta.url));
  const check = process.argv.includes("--check");
  const pending = [], unknown = [];
  let removed = 0, added = 0;
  for (const rel of shipPagesWithMount(root)) {
    const path = root + rel, html = readFileSync(path, "utf8");
    let r;
    try { r = migratePage(html); } catch (e) { if (e.code !== "unknown_shape") throw e; unknown.push(rel); continue; }
    if (r.html === html) continue;
    pending.push(rel); removed += r.removed; added += r.added ? 1 : 0;
    if (!check) writeFileSync(path, r.html);
  }
  if (unknown.length) {
    console.error(`could not look (ship_stats_unknown_shape): ${unknown.length} page(s) not touched:\n  ${unknown.join("\n  ")}`);
    console.error("remedy: read each page and remove its stats loader by hand, or teach admin/migrate-ship-stats-card.mjs the shape");
    process.exit(2);
  }
  if (check) {
    if (!pending.length) { console.log("ship stats: every page is on assets/js/ship-stats.js"); return; }
    console.error(`refused (ship_stats_not_migrated): ${pending.length} page(s) still carry the inline loader or lack the script tag:\n  ${pending.slice(0, 20).join("\n  ")}`);
    console.error("remedy: node admin/migrate-ship-stats-card.mjs, then commit the pages it rewrites");
    process.exit(1);
  }
  console.log(`ship stats: ${pending.length} page(s) rewritten; ${removed} inline loader(s) removed; ${added} script tag(s) added`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
