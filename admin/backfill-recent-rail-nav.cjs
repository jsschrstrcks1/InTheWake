#!/usr/bin/env node
/**
 * backfill-recent-rail-nav.cjs — Insert recent-rail pagination nav elements
 * Soli Deo Gloria
 *
 * Background: admin/validate-recent-articles.js requires four sidebar elements:
 *   <nav id="recent-rail-nav-top">    (BLOCKING when missing)
 *   <div id="recent-rail">
 *   <nav id="recent-rail-nav-bottom"> (BLOCKING when missing)
 *   <p id="recent-rail-fallback">
 *
 * 53 / 384 ports already have all four. 331 are missing the two <nav>
 * elements. This script idempotently inserts them around <div id="recent-rail">,
 * preserving the surrounding indentation. Page content is otherwise untouched.
 *
 * Reference template: ports/akureyri.html (passes both sub-validators).
 *
 * Usage:
 *   node admin/backfill-recent-rail-nav.cjs                    # dry-run all ports
 *   node admin/backfill-recent-rail-nav.cjs --apply            # write changes
 *   node admin/backfill-recent-rail-nav.cjs ports/dubai.html   # single file (dry-run)
 *   node admin/backfill-recent-rail-nav.cjs --apply ports/dubai.html  # single file write
 */

const fs = require('fs');
const path = require('path');

const PORTS_DIR = path.join(__dirname, '..', 'ports');

const NAV_TOP_ATTRS = 'class="rail-nav" aria-label="Article pagination" style="display:none; margin-bottom: 0.5rem;"';
const NAV_BOTTOM_ATTRS = 'class="rail-nav" aria-label="Article pagination" style="display:none; margin-top: 0.75rem;"';

/**
 * Backfill nav-top and nav-bottom around <div id="recent-rail">.
 * Returns { changed: bool, html: string, reason?: string }.
 */
function backfill(html) {
  const hasNavTop = /id="recent-rail-nav-top"/.test(html);
  const hasNavBottom = /id="recent-rail-nav-bottom"/.test(html);

  if (hasNavTop && hasNavBottom) {
    return { changed: false, html, reason: 'already has both nav elements' };
  }

  // Locate the <div id="recent-rail" ...> opening tag and its matching </div>.
  // The div is always written on a single line (no nested elements that share
  // the regex pattern), but content varies — empty or noscript-wrapped story list.
  const divMatch = html.match(/^([ \t]*)(<div id="recent-rail"[^>]*>)([\s\S]*?)(<\/div>)/m);
  if (!divMatch) {
    return { changed: false, html, reason: 'no <div id="recent-rail"> found' };
  }

  const [fullMatch, indent, openTag, inner, closeTag] = divMatch;
  const matchStart = divMatch.index;
  const matchEnd = matchStart + fullMatch.length;

  // Build replacement
  let replacement = '';
  if (!hasNavTop) {
    replacement += `${indent}<nav id="recent-rail-nav-top" ${NAV_TOP_ATTRS}></nav>\n`;
  }
  replacement += `${indent}${openTag}${inner}${closeTag}`;
  if (!hasNavBottom) {
    replacement += `\n${indent}<nav id="recent-rail-nav-bottom" ${NAV_BOTTOM_ATTRS}></nav>`;
  }

  const newHtml = html.substring(0, matchStart) + replacement + html.substring(matchEnd);
  return { changed: true, html: newHtml };
}

function main() {
  const args = process.argv.slice(2);
  const apply = args.includes('--apply');
  const explicitFiles = args.filter(a => a.endsWith('.html'));

  let portFiles;
  if (explicitFiles.length > 0) {
    portFiles = explicitFiles.map(f => path.resolve(f));
  } else {
    portFiles = fs.readdirSync(PORTS_DIR)
      .filter(f => f.endsWith('.html'))
      .map(f => path.join(PORTS_DIR, f));
  }

  let touched = 0, skipped = 0, missing = 0, alreadyOk = 0;
  const skippedFiles = [];

  for (const filePath of portFiles) {
    const html = fs.readFileSync(filePath, 'utf8');

    // Skip redirect pages
    if (/<meta\s+http-equiv="refresh"/i.test(html)) {
      skipped++;
      continue;
    }
    // Skip non-port pages
    const bodyType = (html.match(/<body[^>]*data-page-type="([^"]+)"/i) || [, ''])[1];
    const metaType = (html.match(/<meta\s+name="page-type"\s+content="([^"]+)"/i) || [, ''])[1];
    const pageType = bodyType || metaType || 'port';
    if (pageType !== 'port') {
      skipped++;
      continue;
    }

    const result = backfill(html);
    const rel = path.relative(path.join(__dirname, '..'), filePath);

    if (!result.changed) {
      if (result.reason === 'already has both nav elements') {
        alreadyOk++;
      } else {
        missing++;
        skippedFiles.push({ rel, reason: result.reason });
      }
      continue;
    }

    if (apply) {
      fs.writeFileSync(filePath, result.html);
    }
    touched++;
  }

  const mode = apply ? 'APPLIED' : 'DRY RUN';
  console.log(`\n${'═'.repeat(70)}`);
  console.log(`  Recent Rail Pagination Backfill — ${mode}`);
  console.log(`${'═'.repeat(70)}`);
  console.log(`  Files scanned:        ${portFiles.length}`);
  console.log(`  Already correct:      ${alreadyOk}`);
  console.log(`  ${apply ? 'Backfilled' : 'Would backfill'}: ${touched}`);
  console.log(`  Skipped (non-port):   ${skipped}`);
  console.log(`  No #recent-rail:      ${missing}`);
  if (skippedFiles.length > 0) {
    console.log(`\n  Files without #recent-rail (no change possible):`);
    for (const s of skippedFiles.slice(0, 20)) console.log(`    ${s.rel}  — ${s.reason}`);
    if (skippedFiles.length > 20) console.log(`    ... and ${skippedFiles.length - 20} more`);
  }
  console.log(`${'═'.repeat(70)}\n`);
}

if (require.main === module) main();

module.exports = { backfill };
