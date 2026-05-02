#!/usr/bin/env node
/**
 * repair-duplicate-recent-rail-id.js
 *
 * Renames duplicate id="recent-rail-title" occurrences. HTML invariant:
 * IDs must be unique within a document. Pages currently have two
 * <h3 id="recent-rail-title"> elements, each inside a <section
 * aria-labelledby="recent-rail-title">. The first occurrence stays as the
 * canonical anchor; the second is renamed to recent-rail-title-2 (and its
 * parent section's aria-labelledby is updated to match).
 *
 * Per Phase 2.3 of admin/SHIP_STANDARDIZATION_PLAN.md.
 *
 * Usage:
 *   node admin/repair-duplicate-recent-rail-id.js              # dry-run
 *   node admin/repair-duplicate-recent-rail-id.js --apply
 *   node admin/repair-duplicate-recent-rail-id.js --line=celebrity-cruises --apply
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

  // Find all <h2|h3 id="recent-rail-title"> occurrences with their positions.
  const headingRe = /<(h[123])\b[^>]*\bid\s*=\s*["']recent-rail-title["'][^>]*>/g;
  const matches = [...html.matchAll(headingRe)];
  if (matches.length < 2) return null;

  // Keep first; rename subsequent occurrences (and their parent <section
  // aria-labelledby="recent-rail-title">) to recent-rail-title-2, -3, ...
  let patched = html;
  let renumbered = 0;
  // Walk in reverse so positions don't shift.
  for (let i = matches.length - 1; i >= 1; i--) {
    const newId = `recent-rail-title-${i + 1}`;
    const m = matches[i];
    const start = m.index;
    // Replace just this occurrence (the heading id).
    const headingTag = m[0];
    const newHeadingTag = headingTag.replace(/id\s*=\s*["']recent-rail-title["']/, `id="${newId}"`);
    patched = patched.slice(0, start) + newHeadingTag + patched.slice(start + headingTag.length);
    renumbered++;

    // Now find the immediately-preceding <section ... aria-labelledby="recent-rail-title">
    // open tag and update its aria-labelledby. Walk backwards from the heading
    // start to find the closest <section ...> open tag.
    const before = patched.slice(0, start);
    const sectionOpenRe = /<section\b[^>]*aria-labelledby\s*=\s*["']recent-rail-title["'][^>]*>/g;
    const sectionMatches = [...before.matchAll(sectionOpenRe)];
    if (sectionMatches.length > 0) {
      const sm = sectionMatches[sectionMatches.length - 1];
      const updated = sm[0].replace(/aria-labelledby\s*=\s*["']recent-rail-title["']/, `aria-labelledby="${newId}"`);
      patched = patched.slice(0, sm.index) + updated + patched.slice(sm.index + sm[0].length);
    }
  }

  // Verify: count of id="recent-rail-title" should now be 1.
  const remaining = (patched.match(/\bid\s*=\s*["']recent-rail-title["']/g) || []).length;
  if (remaining !== 1) {
    return {
      filepath,
      action: 'skip-postcheck-failed',
      message: `expected 1 remaining id="recent-rail-title", got ${remaining}`,
    };
  }

  if (apply) await writeFile(filepath, patched);
  return {
    filepath,
    matches: matches.length,
    renumbered,
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

  console.log(`Pages with duplicate id="recent-rail-title": ${results.length}`);
  if (opts.apply) console.log(`Modified: ${applied}`);
  else console.log(`Would modify: ${wouldApply}  (dry-run)`);
  if (skipped.length) {
    console.log(`Skipped: ${skipped.length}`);
    for (const s of skipped.slice(0, 5)) console.log(`  ${s.filepath.replace(REPO_ROOT + '/', '')} — ${s.message}`);
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
