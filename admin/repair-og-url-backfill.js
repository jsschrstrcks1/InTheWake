#!/usr/bin/env node
/**
 * repair-og-url-backfill.js
 *
 * Fills empty <meta property="og:url" content=""/> from the page's
 * <link rel="canonical" href="..."/>. If canonical is also empty,
 * derives from the file path: https://cruisinginthewake.com/<relpath>.
 *
 * Per Phase 2.4 of admin/SHIP_STANDARDIZATION_PLAN.md.
 *
 * Usage:
 *   node admin/repair-og-url-backfill.js              # dry-run
 *   node admin/repair-og-url-backfill.js --apply
 *
 * Soli Deo Gloria
 */
import { readFile, writeFile, readdir } from 'fs/promises';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SHIPS_DIR = join(REPO_ROOT, 'ships');
const HUB = new Set(['index.html', 'venues.html', 'quiz.html', 'allshipquiz.html', 'rooms.html', 'template.html', 'countdown.html']);
const SITE_BASE = 'https://cruisinginthewake.com';

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

  // Detect empty og:url. Acceptable empty form: content="" or content=" ".
  const ogRe = /(<meta\s+property\s*=\s*["']og:url["']\s+content\s*=\s*["'])\s*(["']\s*\/?>)/;
  const m = html.match(ogRe);
  if (!m) return null; // either no og:url or it's already populated

  // Determine canonical URL.
  const canonicalMatch = html.match(/<link\s+rel\s*=\s*["']canonical["']\s+href\s*=\s*["']([^"']+)["']/);
  let url = canonicalMatch ? canonicalMatch[1].trim() : '';
  if (!url) {
    const rel = relative(REPO_ROOT, filepath).replace(/\\/g, '/');
    url = `${SITE_BASE}/${rel}`;
  }

  const patched = html.replace(ogRe, `${m[1]}${url}${m[2]}`);
  if (patched === html) return { filepath, action: 'skip-no-change' };

  if (apply) await writeFile(filepath, patched);
  return {
    filepath,
    url_set_to: url,
    source: canonicalMatch ? 'canonical' : 'derived-from-path',
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

  console.log(`Pages with empty og:url: ${results.length}`);
  if (opts.apply) console.log(`Modified: ${applied}`);
  else console.log(`Would modify: ${wouldApply}  (dry-run)`);

  const fromCanonical = results.filter(r => r.source === 'canonical').length;
  const fromPath = results.filter(r => r.source === 'derived-from-path').length;
  if (fromCanonical || fromPath) {
    console.log(`  Source — from canonical: ${fromCanonical}, derived from path: ${fromPath}`);
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
