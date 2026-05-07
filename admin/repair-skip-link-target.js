#!/usr/bin/env node
/**
 * repair-skip-link-target.js
 *
 * Fix accessibility-blocker: skip-link href="#content" points to nothing
 * because <main> has id="main-content" on every affected page. Bulk-rewrite
 * the skip-link href to "#main-content".
 *
 * Per Phase 2.7 of admin/SHIP_STANDARDIZATION_PLAN.md.
 *
 * Usage:
 *   node admin/repair-skip-link-target.js              # dry-run
 *   node admin/repair-skip-link-target.js --apply
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

  // Find the page's main id (authoritative).
  const mainIdMatch = html.match(/<main\b[^>]*\bid\s*=\s*["']([^"']+)["']/);
  if (!mainIdMatch) return null;
  const mainId = mainIdMatch[1];

  // Find the skip-link.
  const skipRe = /(<a\b[^>]*\bclass\s*=\s*["'][^"']*\bskip-link\b[^"']*["'][^>]*\bhref\s*=\s*["'])#([^"']+)(["'])/;
  const altSkipRe = /(<a\b[^>]*\bhref\s*=\s*["'])#([^"']+)(["'][^>]*\bclass\s*=\s*["'][^"']*\bskip-link\b)/;

  let m = html.match(skipRe);
  let kind = 'class-then-href';
  if (!m) {
    m = html.match(altSkipRe);
    kind = 'href-then-class';
  }
  if (!m) return null;
  const currentTarget = m[2];

  if (currentTarget === mainId) return null; // already correct

  let patched;
  if (kind === 'class-then-href') {
    patched = html.replace(skipRe, `$1#${mainId}$3`);
  } else {
    patched = html.replace(altSkipRe, `$1#${mainId}$3`);
  }

  if (apply) await writeFile(filepath, patched);
  return {
    filepath,
    from: `#${currentTarget}`,
    to: `#${mainId}`,
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

  console.log(`Pages with skip-link target mismatch: ${results.length}`);
  if (opts.apply) console.log(`Modified: ${applied}`);
  else console.log(`Would modify: ${wouldApply}  (dry-run)`);

  // Show what's being swapped (sanity check)
  const swaps = {};
  for (const r of results) {
    const k = `${r.from} → ${r.to}`;
    swaps[k] = (swaps[k] || 0) + 1;
  }
  if (Object.keys(swaps).length) {
    console.log('\nSwaps:');
    for (const [k, n] of Object.entries(swaps).sort((a,b) => b[1] - a[1])) {
      console.log(`  ${k.padEnd(40)} ${n}`);
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
