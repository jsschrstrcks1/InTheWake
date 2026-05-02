#!/usr/bin/env node
/**
 * repair-duplicate-deckplan.js
 *
 * Removes the duplicate "clever-script-injected" deck-plan section on ship
 * pages that have two. Keeps the canonical section (heading carries
 * id="deck-plans" or section carries aria-labelledby="deck-plans" — also
 * accepts the variants id="deck-title", id="decks-title").
 *
 * Per Phase 2.2 of admin/SHIP_STANDARDIZATION_PLAN.md.
 *
 * Strategy: each ship page is parsed with cheerio. We find every <section>
 * whose closest deck-plan heading is its IMMEDIATE child (not a deeply-
 * nested grandchild). That filter avoids matching outer wrappers like
 * <section class="col-1"> that transitively contain the deck-plan section.
 *
 * Removal: cheerio renders the duplicate section's outerHTML; we splice
 * that string out of the source. If cheerio's serialisation differs from
 * the source (whitespace, attribute order), we fall back to a tightly-
 * scoped regex that pins the section's opening tag to its first heading.
 *
 * Usage:
 *   node admin/repair-duplicate-deckplan.js              # dry-run
 *   node admin/repair-duplicate-deckplan.js --apply
 *   node admin/repair-duplicate-deckplan.js --line=carnival --apply
 *
 * Soli Deo Gloria
 */
import { readFile, writeFile, readdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import * as cheerio from 'cheerio';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SHIPS_DIR = join(REPO_ROOT, 'ships');
const HUB = new Set(['index.html', 'venues.html', 'quiz.html', 'allshipquiz.html', 'rooms.html', 'template.html', 'countdown.html']);

// Headings/IDs that mark a section as the canonical deck-plan one.
const CANONICAL_IDS = new Set(['deck-plans', 'deck-title', 'decks-title']);

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

/**
 * Find every <section> whose IMMEDIATE child includes a heading mentioning
 * "Deck Plan". Excludes outer wrappers that transitively contain the section.
 *
 * Returns array of { $sec, $h, isCanonical }.
 */
function findDeckPlanSections($) {
  const out = [];
  $('section').each((_, sec) => {
    const $sec = $(sec);
    // Direct h2/h3 children only (depth-1 inspection).
    const $direct = $sec.children('h2, h3').filter((_, h) => /\b[Dd]eck\s+[Pp]lan/.test($(h).text()));
    if ($direct.length === 0) return;
    const $h = $direct.first();
    const headingId = $h.attr('id') || '';
    const sectionAria = $sec.attr('aria-labelledby') || '';
    const isCanonical =
      CANONICAL_IDS.has(headingId) ||
      CANONICAL_IDS.has(sectionAria);
    out.push({ $sec, $h, isCanonical });
  });
  return out;
}

/**
 * Splice a cheerio <section> element out of the source HTML by:
 * 1. Finding the section's first child heading text + id (stable markers).
 * 2. Searching the source for that exact heading marker.
 * 3. Walking backwards to the enclosing `<section ...>` open tag.
 * 4. Walking forward, counting nested `<section>` opens vs `</section>`
 *    closes, until the matching close.
 * 5. Returning a patched string with that block removed.
 *
 * Returns { ok, patched, used }.
 */
function spliceSection(html, $sec, $h) {
  const headingText = $h.text().trim();
  const headingTag = $h.get(0).tagName.toLowerCase(); // 'h2' or 'h3'
  const headingId = $h.attr('id') || '';

  // Build a stable locator for the heading. Prefer id-based, fall back to
  // exact heading text inside immediate-child h2/h3 of a <section>.
  let headingRegex;
  if (headingId) {
    // <h2 id="X">TEXT</h2>
    headingRegex = new RegExp(
      `<${headingTag}\\b[^>]*\\bid\\s*=\\s*["']${headingId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*>` +
      `[\\s\\S]*?</${headingTag}>`
    );
  } else {
    // <h2>TEXT</h2> with our exact text (no id)
    headingRegex = new RegExp(
      `<${headingTag}\\b(?!\\s*[^>]*\\bid\\s*=)[^>]*>` +
      headingText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +
      `\\s*</${headingTag}>`
    );
  }

  const headingMatch = html.match(headingRegex);
  if (!headingMatch) return { ok: false, used: 'heading-not-found' };
  const headingStart = headingMatch.index;

  // Walk backwards to find the enclosing <section ...> open tag.
  // We scan from headingStart backwards, looking for the most recent
  // <section ...> that is NOT closed before our heading position.
  // Simpler: find the LAST <section ...> opening tag that appears before
  // headingStart and whose matching </section> is AFTER headingStart.
  const slice = html.slice(0, headingStart);
  // Find every <section ...> open in the prefix and its matching close.
  // We walk forward, tracking depth, and pick the open whose close is
  // strictly after headingStart.
  let candidateOpen = -1;
  let candidateOpenLen = 0;
  const openRe = /<section\b[^>]*>/g;
  const closeRe = /<\/section\s*>/g;
  // Build a list of all section opens and closes in the WHOLE document
  // with their positions.
  const events = [];
  let m;
  openRe.lastIndex = 0;
  while ((m = openRe.exec(html)) !== null) events.push({ pos: m.index, len: m[0].length, type: 'open' });
  while ((m = closeRe.exec(html)) !== null) events.push({ pos: m.index, len: m[0].length, type: 'close' });
  events.sort((a, b) => a.pos - b.pos);

  // Find the section open whose matching close is the FIRST close occurring
  // at or after headingStart, with depth tracking.
  // Iterate events; for each open, find its matching close by depth tracking.
  // Then pick the open whose close-position > headingStart and open-position
  // is the closest to headingStart but ≤ headingStart.
  const stack = [];
  const pairs = [];
  for (const e of events) {
    if (e.type === 'open') stack.push(e);
    else if (e.type === 'close' && stack.length > 0) {
      const open = stack.pop();
      pairs.push({ open, close: e });
    }
  }
  // Find pair where open.pos < headingStart < close.pos and open.pos is
  // the largest such (innermost enclosing section).
  let best = null;
  for (const p of pairs) {
    if (p.open.pos < headingStart && p.close.pos > headingStart) {
      if (!best || p.open.pos > best.open.pos) best = p;
    }
  }
  if (!best) return { ok: false, used: 'no-enclosing-section' };

  const sectionStart = best.open.pos;
  const sectionEnd = best.close.pos + best.close.len;

  // Sanity check: this section must actually contain our heading and must
  // not be canonical (heading id ∈ CANONICAL_IDS or section aria...).
  // (The caller already guarantees the cheerio match was non-canonical, but
  // we re-verify on the source to be paranoid.)
  const sectionBlock = html.slice(sectionStart, sectionEnd);
  if (!sectionBlock.includes(headingText)) return { ok: false, used: 'section-text-mismatch' };
  // Refuse to remove if the section open tag carries a canonical aria.
  const openTag = html.slice(sectionStart, sectionStart + best.open.len);
  for (const cid of CANONICAL_IDS) {
    if (openTag.includes(`aria-labelledby="${cid}"`)) {
      return { ok: false, used: 'safety-rejected-canonical' };
    }
  }
  // Refuse if heading-id is canonical.
  if (CANONICAL_IDS.has(headingId)) return { ok: false, used: 'safety-rejected-canonical-heading' };
  // Refuse if this section contains MULTIPLE deck-plan headings (would be a
  // weirdly-nested structure; not the simple duplicate case).
  const innerH2Count = (sectionBlock.match(/<h[23]\b[^>]*>[^<]*[Dd]eck\s+[Pp]lan/g) || []).length;
  if (innerH2Count > 1) return { ok: false, used: 'safety-rejected-nested' };

  // Cleanly remove the block, plus a single leading run of whitespace if
  // it was indented on its own line.
  let removeStart = sectionStart;
  // Walk back over indentation up to and including a preceding newline.
  while (removeStart > 0 && /[ \t]/.test(html[removeStart - 1])) removeStart--;
  if (removeStart > 0 && html[removeStart - 1] === '\n') removeStart--;
  // Walk forward over a single trailing newline.
  let removeEnd = sectionEnd;
  if (removeEnd < html.length && html[removeEnd] === '\n') removeEnd++;

  return {
    ok: true,
    patched: html.slice(0, removeStart) + html.slice(removeEnd),
    used: headingId ? 'splice-by-id' : 'splice-by-text',
  };
}

async function repair(filepath, { apply }) {
  const html = await readFile(filepath, 'utf-8');
  const $ = cheerio.load(html, { decodeEntities: false });

  const sections = findDeckPlanSections($);
  if (sections.length < 2) return null;

  const canonicals = sections.filter(s => s.isCanonical);
  const duplicates = sections.filter(s => !s.isCanonical);

  if (canonicals.length === 0) {
    return {
      filepath,
      total: sections.length,
      action: 'skip-no-canonical',
      message: `${sections.length} deck-plan sections found but none have id in {${[...CANONICAL_IDS].join(',')}}; manual review needed`,
    };
  }
  if (duplicates.length === 0) return null;

  let patched = html;
  let removed = 0;
  const splice_strategies = [];
  for (const dup of duplicates) {
    const result = spliceSection(patched, dup.$sec, dup.$h);
    if (result.ok) {
      patched = result.patched;
      removed++;
      splice_strategies.push(result.used);
    } else {
      splice_strategies.push(`fail:${result.used}`);
    }
  }

  if (removed === 0) {
    return {
      filepath,
      total: sections.length,
      duplicates: duplicates.length,
      action: 'skip-no-splice',
      message: `cheerio identified ${duplicates.length} duplicate(s) but splicing failed: ${splice_strategies.join(',')}`,
    };
  }

  if (apply) await writeFile(filepath, patched);
  return {
    filepath,
    total: sections.length,
    removed,
    splice_strategies,
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

  console.log(`Pages with multiple deck-plan sections: ${results.length}`);
  if (opts.apply) console.log(`Modified: ${applied}`);
  else console.log(`Would modify: ${wouldApply}  (dry-run — pass --apply to write)`);

  if (skipped.length) {
    console.log(`\nSkipped (manual review needed): ${skipped.length}`);
    for (const s of skipped.slice(0, 8)) {
      console.log(`  ${s.filepath.replace(REPO_ROOT + '/', '')}  — ${s.message || s.action}`);
    }
  }

  const byLine = {};
  for (const r of results) {
    if (r.action === 'applied' || r.action === 'would-apply') {
      byLine[r.line] = (byLine[r.line] || 0) + 1;
    }
  }
  if (Object.keys(byLine).length) {
    console.log('\nBy cruise line:');
    for (const [l, n] of Object.entries(byLine).sort()) console.log(`  ${l.padEnd(25)} ${n}`);
  }
}

main().catch(e => { console.error(`Fatal: ${e.message}`); process.exit(1); });
