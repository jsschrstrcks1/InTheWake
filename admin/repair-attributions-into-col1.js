#!/usr/bin/env node
/**
 * repair-attributions-into-col1.js
 *
 * Fixes the broken page-grid layout where Attributions and Planning
 * Resources sections float outside <section class="col-1"> and end up
 * rendering parallel to the right rail aside instead of stacked below
 * the main content.
 *
 * Strategy: cut every <section> that sits AFTER </aside> and BEFORE the
 * print-guide button / </main>, splice them BEFORE the col-1 closing
 * marker `</section><!-- End Main Content Column -->`. This puts the
 * orphaned sections at the end of col-1 where they belong.
 *
 * Per Phase 2.8 + 2.9 of admin/SHIP_STANDARDIZATION_PLAN.md (the two
 * symptoms — Attributions outside col-1, content section after </aside>
 * — are the same bug; this single repair addresses both).
 *
 * Usage:
 *   node admin/repair-attributions-into-col1.js              # dry-run
 *   node admin/repair-attributions-into-col1.js --apply
 *
 * Soli Deo Gloria
 */
import { readFile, writeFile, readdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SHIPS_DIR = join(REPO_ROOT, 'ships');
const HUB = new Set(['index.html', 'venues.html', 'quiz.html', 'allshipquiz.html', 'rooms.html', 'template.html', 'countdown.html']);

// The col-1 close marker comment is the safest anchor (uniform across the fleet).
const COL1_CLOSE_MARKER = '</section><!-- End Main Content Column -->';

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
 * Scan from `start` forward, finding `<section ...>...</section>` blocks
 * with balanced section-tag depth tracking. Returns an array of
 * {start, end} offsets for each top-level section found before `stop`.
 *
 * If a non-`<section>` non-whitespace non-comment element is encountered,
 * we stop (we don't want to swallow random structural content).
 */
function findOrphanedSections(html, start, stop) {
  const sections = [];
  let i = start;
  while (i < stop) {
    // Skip whitespace and HTML comments.
    while (i < stop && /\s/.test(html[i])) i++;
    if (i >= stop) break;
    if (html.startsWith('<!--', i)) {
      const end = html.indexOf('-->', i);
      if (end === -1 || end >= stop) break;
      i = end + 3;
      continue;
    }
    // Must be a <section ...> opening to count.
    if (!html.startsWith('<section', i)) break;
    // Parse open tag (find matching '>').
    const openEnd = html.indexOf('>', i);
    if (openEnd === -1 || openEnd >= stop) break;

    // Walk forward, counting <section> opens vs </section> closes.
    let depth = 1;
    let scan = openEnd + 1;
    while (scan < html.length && depth > 0) {
      const nextOpen = html.indexOf('<section', scan);
      const nextClose = html.indexOf('</section', scan);
      if (nextClose === -1) break;
      if (nextOpen !== -1 && nextOpen < nextClose) {
        // Make sure it's actually a real <section open and not e.g. <sectionx
        if (/^<section[\s>]/.test(html.slice(nextOpen))) {
          depth++;
          scan = nextOpen + 8;
        } else {
          scan = nextOpen + 8;
        }
      } else {
        depth--;
        scan = html.indexOf('>', nextClose) + 1;
      }
    }
    if (depth !== 0) break;
    const sectionEnd = scan; // just past the matching </section>
    sections.push({ start: i, end: sectionEnd });
    i = sectionEnd;
  }
  return sections;
}

async function repair(filepath, { apply }) {
  const html = await readFile(filepath, 'utf-8');

  // Anchor 1: col-1 close marker
  const col1ClosePos = html.indexOf(COL1_CLOSE_MARKER);
  if (col1ClosePos === -1) return null;

  // Anchor 2: the </aside> that closes the rail. Find the FIRST </aside>
  // that appears AFTER col-1 close (so we don't pick up any stray earlier aside).
  const asideClosePos = html.indexOf('</aside>', col1ClosePos);
  if (asideClosePos === -1) return null;
  const afterAside = asideClosePos + '</aside>'.length;

  // Anchor 3: where do orphans end? Stop at the print-guide-btn comment, or
  // </main>, whichever comes first.
  const printBtnPos = html.indexOf('<!-- Print Guide Button -->', afterAside);
  const printBtnElPos = html.indexOf('<button', afterAside);
  const mainClosePos = html.indexOf('</main>', afterAside);
  let stop = mainClosePos;
  if (printBtnPos !== -1 && printBtnPos < stop) stop = printBtnPos;
  if (printBtnElPos !== -1 && printBtnElPos < stop) stop = printBtnElPos;
  if (stop === -1 || stop <= afterAside) return null;

  // Find orphaned <section> blocks between </aside> and stop.
  const orphans = findOrphanedSections(html, afterAside, stop);
  if (orphans.length === 0) return null;

  // Verify at least one orphan has class="card attributions" or aria-labelledby
  // including "planning-resources" — protective check so we don't move random
  // sections that happen to live there for legitimate reasons.
  let recognised = 0;
  for (const o of orphans) {
    const block = html.slice(o.start, o.end);
    if (/class="[^"]*\battributions\b/.test(block) ||
        /\bplanning-resources\b/.test(block) ||
        /<h2[^>]*>\s*Image Attributions/i.test(block) ||
        /<h2[^>]*>\s*Plan Your Cruise/i.test(block)) {
      recognised++;
    }
  }
  if (recognised === 0) {
    return { filepath, action: 'skip-no-recognised-orphan', orphans: orphans.length };
  }

  // Cut orphans (in reverse so positions stay valid) and accumulate their
  // text. For each orphan, also include any IMMEDIATELY-PRECEDING line that
  // is an HTML comment header (e.g. <!-- Planning Resources -->), since
  // those comments belong to the section semantically.
  let working = html;
  const cut = [];
  for (let i = orphans.length - 1; i >= 0; i--) {
    const o = orphans[i];
    let cs = o.start;
    // Walk back to include leading whitespace + newline.
    while (cs > 0 && /[ \t]/.test(working[cs - 1])) cs--;
    if (cs > 0 && working[cs - 1] === '\n') cs--;
    // If the line immediately preceding (after another newline) is just a
    // comment, include it too. Match: \n[\s]*<!-- ... -->.
    const lineStart = working.lastIndexOf('\n', cs - 1) + 1;
    const precedingLine = working.slice(lineStart, cs).trim();
    if (/^<!--[\s\S]*-->$/.test(precedingLine)) {
      cs = lineStart - 1; // include the newline that separates the comment from prior content
      if (cs < 0) cs = 0;
    }
    // Walk forward over trailing newline.
    let ce = o.end;
    if (ce < working.length && working[ce] === '\n') ce++;
    cut.push(working.slice(cs, ce));
    working = working.slice(0, cs) + working.slice(ce);
  }
  cut.reverse(); // restore document order

  // Splice cut content BEFORE the col-1 close marker.
  const newCol1Pos = working.indexOf(COL1_CLOSE_MARKER);
  if (newCol1Pos === -1) return { filepath, action: 'skip-col1-marker-lost' };

  // Use a single newline + 4-space indent before each moved section, ending
  // with a newline before the close marker.
  const moved = '\n' + cut.map(s => s.trimStart()).join('\n').trimEnd() + '\n  ';
  // Walk back from newCol1Pos to capture leading whitespace; replace that
  // with our moved block + the original lead.
  let insertAt = newCol1Pos;
  // Trim whitespace immediately before the marker
  while (insertAt > 0 && /[ \t]/.test(working[insertAt - 1])) insertAt--;
  const leadWS = working.slice(insertAt, newCol1Pos);
  const patched =
    working.slice(0, insertAt) +
    moved +
    leadWS +
    working.slice(newCol1Pos);

  if (apply) await writeFile(filepath, patched);
  return {
    filepath,
    moved_count: cut.length,
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

  console.log(`Pages with orphaned post-aside sections: ${results.length}`);
  if (opts.apply) console.log(`Modified: ${applied}`);
  else console.log(`Would modify: ${wouldApply}  (dry-run)`);
  if (skipped.length) console.log(`Skipped: ${skipped.length}`);

  // Histogram of how many sections moved
  const movedCounts = {};
  for (const r of results) {
    if (r.moved_count) movedCounts[r.moved_count] = (movedCounts[r.moved_count] || 0) + 1;
  }
  if (Object.keys(movedCounts).length) {
    console.log('\nSections moved per page:');
    for (const [n, c] of Object.entries(movedCounts).sort((a,b) => Number(a[0]) - Number(b[0]))) {
      console.log(`  ${n} section(s): ${c} pages`);
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
