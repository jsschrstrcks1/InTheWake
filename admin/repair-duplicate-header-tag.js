#!/usr/bin/env node
/**
 * repair-duplicate-header-tag.js
 *
 * Fixes accessibility / structure violation: pages with two <header
 * role="banner"> elements. The first is the site nav (canonical); the
 * second is a page-specific hero block (h1 + tagline). Renames the
 * second to <section> so there's exactly one banner header per page.
 *
 * Three known second-header class variants across the affected fleet:
 *   class="ship-hero"          (13 ships)
 *   class="hero-ship"          (3 ships)
 *   class="hero-carnival"      (3 ships)
 *
 * Per Phase 2.11 of admin/SHIP_STANDARDIZATION_PLAN.md.
 *
 * Usage:
 *   node admin/repair-duplicate-header-tag.js              # dry-run
 *   node admin/repair-duplicate-header-tag.js --apply
 *
 * Soli Deo Gloria
 */
import { readFile, writeFile, readdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SHIPS_DIR = join(REPO_ROOT, 'ships');
const HUB = new Set(['index.html', 'venues.html', 'quiz.html', 'allshipquiz.html', 'rooms.html', 'template.html', 'countdown.html']);

// Class names that mark the SECOND header (page-hero variant). The first
// header always uses class="hero-header ship-page", which we leave alone.
const PAGE_HERO_CLASSES = ['ship-hero', 'hero-ship', 'hero-carnival'];

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

  // Quick guard: page must have multiple <header> tags before the canonical first.
  const headerOpens = html.match(/<header\b/g) || [];
  if (headerOpens.length < 2) return null;

  let patched = html;
  let renamed_class = null;
  for (const cls of PAGE_HERO_CLASSES) {
    // Match: <header class="<cls>" [role="banner"]> ... </header>
    const openRe = new RegExp(
      `<header\\b([^>]*\\bclass\\s*=\\s*["'][^"']*\\b${cls}\\b[^"']*["'][^>]*)>`
    );
    const openMatch = patched.match(openRe);
    if (!openMatch) continue;

    const openStart = openMatch.index;
    const openLen = openMatch[0].length;
    // Find the matching </header> with depth tracking.
    let depth = 1;
    let scan = openStart + openLen;
    while (scan < patched.length && depth > 0) {
      const nextOpen = patched.indexOf('<header', scan);
      const nextClose = patched.indexOf('</header', scan);
      if (nextClose === -1) break;
      if (nextOpen !== -1 && nextOpen < nextClose && /^<header[\s>]/.test(patched.slice(nextOpen))) {
        depth++;
        scan = nextOpen + 7;
      } else {
        depth--;
        scan = patched.indexOf('>', nextClose) + 1;
      }
    }
    if (depth !== 0) continue;
    const closeEnd = scan;
    const closeStart = patched.lastIndexOf('</header', closeEnd);

    // Replace open tag: <header attrs> → <section attrs (minus role="banner")>
    let openAttrs = openMatch[1];
    openAttrs = openAttrs.replace(/\s+role\s*=\s*["']banner["']/, '');
    const newOpen = `<section${openAttrs}>`;
    const newClose = '</section>';

    patched =
      patched.slice(0, openStart) +
      newOpen +
      patched.slice(openStart + openLen, closeStart) +
      newClose +
      patched.slice(closeEnd);
    renamed_class = cls;
    break;
  }

  if (!renamed_class) return null;

  // Sanity: count remaining <header> opens — must be exactly 1.
  const remaining = (patched.match(/<header\b/g) || []).length;
  if (remaining !== 1) {
    return { filepath, action: 'skip-postcheck-failed', remaining };
  }

  if (apply) await writeFile(filepath, patched);
  return {
    filepath,
    renamed: `header.${renamed_class}` + ' → section.' + renamed_class,
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
  const skipped = results.filter(r => r.action && r.action.startsWith('skip'));

  console.log(`Pages with duplicate <header>: ${results.length}`);
  if (opts.apply) console.log(`Modified: ${applied}`);
  else console.log(`Would modify: ${wouldApply}  (dry-run)`);
  if (skipped.length) console.log(`Skipped: ${skipped.length}`);

  const renames = {};
  for (const r of results) {
    if (r.renamed) renames[r.renamed] = (renames[r.renamed] || 0) + 1;
  }
  if (Object.keys(renames).length) {
    console.log('\nRenames:');
    for (const [k, n] of Object.entries(renames).sort()) console.log(`  ${k.padEnd(45)} ${n}`);
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
