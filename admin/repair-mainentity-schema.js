#!/usr/bin/env node
/**
 * repair-mainentity-schema.js
 *
 * Migrates JSON-LD WebPage.mainEntity @type from "Cruise" or "Thing" to
 * "Vehicle" per Policy 0.1 in admin/POLICY_DECISIONS.md (orchestra-driven
 * decision: Schema.org Vehicle is a Product subtype specifically defined
 * for transport devices including ships, more precise than bare Product).
 *
 * Per Phase 2.6 of admin/SHIP_STANDARDIZATION_PLAN.md.
 *
 * Safety: only swaps WebPage's mainEntity (single-object form). FAQPage's
 * mainEntity (array form) is left alone.
 *
 * Usage:
 *   node admin/repair-mainentity-schema.js              # dry-run
 *   node admin/repair-mainentity-schema.js --apply
 *
 * Soli Deo Gloria
 */
import { readFile, writeFile, readdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SHIPS_DIR = join(REPO_ROOT, 'ships');
const HUB = new Set(['index.html', 'venues.html', 'quiz.html', 'allshipquiz.html', 'rooms.html', 'template.html', 'countdown.html']);
const BLACKLIST = ['Cruise', 'Thing', 'Service', 'WebPage'];

function parseArgs() {
  const args = process.argv.slice(2);
  return {
    apply: args.includes('--apply'),
    line: (args.find(a => a.startsWith('--line=')) || '').slice('--line='.length) || null,
  };
}

async function findShipPages(filter) {
  const out = [];
  for (const ent of await readdir(SHIPS_DIR, { withFileTypes: true })) {
    if (!ent.isDirectory()) continue;
    if (filter && ent.name !== filter) continue;
    const dir = join(SHIPS_DIR, ent.name);
    for (const f of await readdir(dir)) {
      if (!f.endsWith('.html') || HUB.has(f)) continue;
      out.push({ line: ent.name, path: join(dir, f) });
    }
  }
  return out;
}

async function repair(filepath, { apply }) {
  const html = await readFile(filepath, 'utf-8');

  // Match: "mainEntity": { ... "@type": "<blacklisted>" ... }
  // The mainEntity must be a single OBJECT (FAQPage's array form starts with [).
  // We use a regex that matches the object opening + @type within ~200 chars.
  const swaps = [];
  const re = new RegExp(
    `("mainEntity"\\s*:\\s*\\{[\\s\\S]{0,200}?"@type"\\s*:\\s*")(${BLACKLIST.join('|')})(")`,
    'g'
  );
  let patched = html.replace(re, (_, prefix, oldType, suffix) => {
    swaps.push(oldType);
    return `${prefix}Vehicle${suffix}`;
  });

  if (swaps.length === 0) return null;

  if (apply) await writeFile(filepath, patched);
  return {
    filepath,
    swaps,                                      // ["Cruise"], ["Thing"], or both
    swap_count: swaps.length,
    action: apply ? 'applied' : 'would-apply',
  };
}

async function main() {
  const opts = parseArgs();
  const ships = await findShipPages(opts.line);
  const results = [];
  for (const ship of ships) {
    const r = await repair(ship.path, opts);
    if (r) results.push({ line: ship.line, ...r });
  }

  const applied = results.filter(r => r.action === 'applied').length;
  const wouldApply = results.filter(r => r.action === 'would-apply').length;

  console.log(`Pages with blacklisted mainEntity @type: ${results.length}`);
  if (opts.apply) console.log(`Modified: ${applied}`);
  else console.log(`Would modify: ${wouldApply}  (dry-run)`);

  // Summary of swaps by old type
  const byType = {};
  for (const r of results) for (const s of r.swaps) byType[s] = (byType[s] || 0) + 1;
  if (Object.keys(byType).length) {
    console.log('\nSwaps by previous @type:');
    for (const [t, n] of Object.entries(byType).sort()) console.log(`  ${t.padEnd(10)} → Vehicle  (${n} occurrences)`);
  }

  const byLine = {};
  for (const r of results) {
    if (r.action === 'applied' || r.action === 'would-apply') byLine[r.line] = (byLine[r.line] || 0) + 1;
  }
  if (Object.keys(byLine).length) {
    console.log('\nBy cruise line:');
    for (const [l, n] of Object.entries(byLine).sort()) console.log(`  ${l.padEnd(25)} ${n}`);
  }
}

main().catch(e => { console.error(`Fatal: ${e.message}`); process.exit(1); });
