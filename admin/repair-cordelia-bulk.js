#!/usr/bin/env node
/**
 * repair-cordelia-bulk.cjs (in ESM .js form)
 *
 * Removes <img id="dining-hero" src=".../Cordelia_Empress_Food_Court..."> from
 * every ship page that has one, matching the gold-standard pattern (e.g.
 * ships/rcl/radiance-of-the-seas.html) where the dining section is venue-
 * listing content, not a decorative stock photo.
 *
 * Per Phase 2.1 of admin/SHIP_STANDARDIZATION_PLAN.md.
 *
 * Usage:
 *   node admin/repair-cordelia-bulk.js              # dry-run (default)
 *   node admin/repair-cordelia-bulk.js --apply      # write changes
 *   node admin/repair-cordelia-bulk.js --line=carnival --apply
 *
 * Soli Deo Gloria
 */
import { readFile, writeFile, readdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import * as cheerio from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = join(__dirname, '..');
const SHIPS_DIR = join(REPO_ROOT, 'ships');

function parseArgs() {
  const args = process.argv.slice(2);
  return {
    apply: args.includes('--apply'),
    line: (args.find(a => a.startsWith('--line=')) || '').slice('--line='.length) || null,
  };
}

async function findCandidatePages(filter) {
  const out = [];
  const lines = await readdir(SHIPS_DIR, { withFileTypes: true });
  for (const ent of lines) {
    if (!ent.isDirectory()) continue;
    if (filter && ent.name !== filter) continue;
    const lineDir = join(SHIPS_DIR, ent.name);
    for (const f of await readdir(lineDir)) {
      if (!f.endsWith('.html')) continue;
      out.push({ line: ent.name, path: join(lineDir, f) });
    }
  }
  return out;
}

async function repair(filepath, { apply }) {
  const html = await readFile(filepath, 'utf-8');
  if (!html.includes('Cordelia_Empress')) return null;
  const $ = cheerio.load(html, { decodeEntities: false });

  // Find every <img id="dining-hero"> AND every <img> whose src contains Cordelia_Empress.
  // Either form is removed.
  const targets = $('img').filter((_, el) => {
    const $el = $(el);
    const id = $el.attr('id') || '';
    const src = $el.attr('src') || '';
    return id === 'dining-hero' || src.includes('Cordelia_Empress');
  });

  if (targets.length === 0) return { filepath, removed: 0, note: 'string match but no <img> element matched (legacy preload?)' };

  const removed_srcs = [];
  targets.each((_, el) => {
    removed_srcs.push($(el).attr('src') || '');
    $(el).remove();
  });

  // Cheerio's .html() rebuilds the document. To preserve as much of the
  // original formatting as possible (no whitespace churn far from the
  // removal site), we patch the original string instead — remove each
  // matched <img ...> tag textually and clean ONLY the immediate trailing
  // whitespace.
  let patched = html;
  // Match: optional leading whitespace + <img...id="dining-hero"...> +
  // optional trailing whitespace up to and including a single newline.
  // Same for any <img> with Cordelia_Empress in src.
  const imgPatterns = [
    /[ \t]*<img[^>]*\bid\s*=\s*["']dining-hero["'][^>]*\/?>[ \t]*\n?/gi,
    /[ \t]*<img[^>]*src\s*=\s*["'][^"']*Cordelia_Empress[^"']*["'][^>]*\/?>[ \t]*\n?/gi,
  ];
  for (const pat of imgPatterns) patched = patched.replace(pat, '');

  if (patched === html) return { filepath, removed: 0, note: 'cheerio matched but textual regex did not — leaving file untouched' };

  if (apply) await writeFile(filepath, patched);
  return { filepath, removed: targets.length, removed_srcs, applied: apply };
}

async function main() {
  const opts = parseArgs();
  const candidates = await findCandidatePages(opts.line);
  const results = [];
  for (const c of candidates) {
    const r = await repair(c.path, opts);
    if (r) results.push({ line: c.line, ...r });
  }

  const applied = results.filter(r => r.applied && r.removed > 0).length;
  const wouldApply = results.filter(r => !r.applied && r.removed > 0).length;
  const skipped = results.filter(r => r.removed === 0);

  console.log(`Files with Cordelia: ${results.length}`);
  if (opts.apply) {
    console.log(`Modified: ${applied}`);
    if (skipped.length) console.log(`Skipped (no <img> match): ${skipped.length}`);
  } else {
    console.log(`Would modify: ${wouldApply}`);
    console.log(`(dry-run — pass --apply to write changes)`);
  }

  // By line
  const byLine = {};
  for (const r of results) {
    byLine[r.line] = (byLine[r.line] || 0) + (r.removed > 0 ? 1 : 0);
  }
  console.log('\nBy cruise line:');
  for (const [l, n] of Object.entries(byLine).sort()) {
    console.log(`  ${l.padEnd(25)} ${n}`);
  }

  if (skipped.length > 0) {
    console.log('\nSkipped (need manual review):');
    for (const s of skipped.slice(0, 10)) {
      console.log(`  ${s.filepath.replace(REPO_ROOT + '/', '')}  — ${s.note}`);
    }
  }
}

main().catch(e => {
  console.error(`Fatal: ${e.message}`);
  process.exit(1);
});
