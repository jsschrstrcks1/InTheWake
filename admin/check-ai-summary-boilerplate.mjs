#!/usr/bin/env node
// check-ai-summary-boilerplate.mjs — CI gate for ICP-018 (#2428).
//
// validate-ship-page.js enforces "ai-summary must not be boilerplate" per page,
// but that validator never runs in CI, so a generic/templated ai-summary (text
// that could describe any ship) could regress unseen. The Validate HTML job only
// checks ai-summary PRESENCE, not its content. This closes that gap with a fast,
// dependency-free fleet scan that reuses the SAME phrase list the validator uses
// (admin/validator-config.json — SSOT, not a copy), and fails the build if any
// ship page's ai-summary contains a boilerplate phrase.
//
// Scope: ships/<line>/*.html (individual ship pages — where ICP-018 applies).
// Exit 0 = clean, exit 1 = violations found. Soli Deo Gloria.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cfgPath = path.join(repoRoot, "admin", "validator-config.json");
const shipsDir = path.join(repoRoot, "ships");

const cfg = JSON.parse(fs.readFileSync(cfgPath, "utf8"));
const phrases = (cfg.ai_summary_boilerplate_phrases || []).map((p) => String(p).toLowerCase());
if (phrases.length === 0) {
  console.log("check-ai-summary-boilerplate: no phrases configured — nothing to enforce.");
  process.exit(0);
}

// Ship pages live one level under ships/<line>/. Skip ships/assets and non-html.
function shipPages(dir) {
  const out = [];
  for (const line of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!line.isDirectory() || line.name === "assets") continue;
    const lineDir = path.join(dir, line.name);
    for (const f of fs.readdirSync(lineDir)) {
      if (f.endsWith(".html")) out.push(path.join(lineDir, f));
    }
  }
  return out;
}

// Extract the ai-summary meta tag's content regardless of attribute order,
// mirroring validate-ship-page.js's cheerio $('meta[name="ai-summary"]').attr('content').
function aiSummaryOf(html) {
  const tag = html.match(/<meta\b[^>]*\bname\s*=\s*["']ai-summary["'][^>]*>/i);
  if (!tag) return "";
  const c = tag[0].match(/\bcontent\s*=\s*["']([^"']*)["']/i);
  return c ? c[1] : "";
}

const pages = shipPages(shipsDir);
const violators = [];
for (const file of pages) {
  const summary = aiSummaryOf(fs.readFileSync(file, "utf8")).toLowerCase();
  if (!summary) continue;
  const hit = phrases.find((p) => summary.includes(p));
  if (hit) violators.push({ file: path.relative(repoRoot, file), phrase: hit });
}

console.log(`Scanned ${pages.length} ship pages against ${phrases.length} boilerplate phrases.`);
if (violators.length > 0) {
  console.error(`\n❌ ${violators.length} ship page(s) have a boilerplate ai-summary (ICP-018):`);
  for (const v of violators) console.error(`  ${v.file}\n      matched: "${v.phrase}"`);
  console.error(`\nFix: rewrite each with 2 ship-specific facts + 1 voice-aligned editorial line (ai-summary-rewriter skill).`);
  process.exit(1);
}
console.log("✓ No boilerplate ai-summaries. Soli Deo Gloria.");
