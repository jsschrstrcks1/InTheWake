#!/usr/bin/env node
/**
 * repair-datemodified-parity.js
 *
 * ICP-2 hard rule: every JSON-LD "dateModified" value on a page must
 * match the page's <meta name="last-reviewed" content="YYYY-MM-DD">.
 * Conflicting dates lie to AI consumers and humans about content
 * freshness. Mariner / Navigator / Splendour are 107 days off in their
 * shipped state.
 *
 * This script reads each ship page, finds last-reviewed (authoritative
 * editor-controlled value), then rewrites every JSON-LD dateModified
 * that disagrees.
 *
 * Per Phase 2.5 of admin/SHIP_STANDARDIZATION_PLAN.md.
 *
 * Usage:
 *   node admin/repair-datemodified-parity.js              # dry-run
 *   node admin/repair-datemodified-parity.js --apply
 *
 * Soli Deo Gloria
 */
import { readFile, writeFile, readdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SHIPS_DIR = join(REPO_ROOT, 'ships');
const HUB = new Set(['index.html', 'venues.html', 'quiz.html', 'allshipquiz.html', 'rooms.html', 'template.html', 'countdown.html']);

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

  const lr = html.match(/<meta\s+name\s*=\s*["']last-reviewed["']\s+content\s*=\s*["']([\d-]+)["']/);
  if (!lr) return null;
  const target = lr[1];

  // Find every JSON-LD dateModified value.
  const dmRe = /"dateModified"\s*:\s*"([\d-]+)"/g;
  const matches = [...html.matchAll(dmRe)];
  if (matches.length === 0) return null;

  const stale = matches.filter(m => m[1] !== target);
  if (stale.length === 0) return null;

  // Replace each stale occurrence (every dateModified, regardless of whether
  // it's already correct — replacing all is safe and simpler).
  const patched = html.replace(dmRe, `"dateModified": "${target}"`);

  if (apply) await writeFile(filepath, patched);
  return {
    filepath,
    last_reviewed: target,
    stale_dates: [...new Set(stale.map(m => m[1]))],
    fixed_count: stale.length,
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

  console.log(`Pages with stale dateModified: ${results.length}`);
  if (opts.apply) console.log(`Modified: ${applied}`);
  else console.log(`Would modify: ${wouldApply}  (dry-run)`);

  // Show the worst offenders (largest delta from last-reviewed)
  const offenders = results
    .map(r => ({ ...r, delta_days: Math.max(...r.stale_dates.map(d => Math.abs((new Date(r.last_reviewed) - new Date(d)) / 86400000))) }))
    .sort((a, b) => b.delta_days - a.delta_days);
  if (offenders.length > 0) {
    console.log('\nWorst offenders (delta from last-reviewed):');
    for (const o of offenders.slice(0, 8)) {
      console.log(`  ${Math.round(o.delta_days).toString().padStart(4)} days  ${o.filepath.replace(REPO_ROOT + '/', '')}  (last-reviewed=${o.last_reviewed}, stale=${o.stale_dates.join(',')})`);
    }
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
