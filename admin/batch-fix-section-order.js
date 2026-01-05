#!/usr/bin/env node
/**
 * Batch Fix: Reorder sections to match ITW-SHIP-002 standard
 * Soli Deo Gloria
 *
 * Expected order within main content column:
 * page_intro → first_look/dining (grid-2) → logbook → videos → map/tracker (grid-2) → faq → attribution
 */

import { readFile, writeFile, readdir } from 'fs/promises';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SHIPS_DIR = join(__dirname, '..', 'ships');

const CRUISE_LINES = [
  'carnival', 'celebrity-cruises', 'costa', 'cunard', 'explora-journeys',
  'holland-america-line', 'msc', 'norwegian', 'oceania', 'princess',
  'rcl', 'regent', 'seabourn', 'silversea', 'virgin-voyages'
];

// Patterns to identify sections
const SECTION_PATTERNS = {
  page_intro: /<section[^>]*class="[^"]*page-intro[^"]*"[^>]*>[\s\S]*?<\/section>/i,
  first_look: /<section[^>]*(?:aria-labelledby="first-look"|id="first-look")[^>]*>[\s\S]*?<\/section>/i,
  dining: /<section[^>]*(?:id="dining-card"|data-ship=)[^>]*>[\s\S]*?<h2[^>]*>Dining[\s\S]*?<\/section>/i,
  logbook: /<section[^>]*(?:aria-labelledby="logbook"|class="[^"]*logbook[^"]*")[^>]*>[\s\S]*?<\/section>/i,
  videos: /<section[^>]*aria-labelledby="video-highlights"[^>]*>[\s\S]*?<\/section>/i,
  deck_plans: /<section[^>]*aria-labelledby="deck-plans"[^>]*>[\s\S]*?<\/section>/i,
  tracker: /<section[^>]*(?:aria-labelledby="liveTrackHeading"|class="[^"]*itinerary[^"]*")[^>]*>[\s\S]*?<\/section>/i,
  faq: /<section[^>]*(?:id="faq"|class="[^"]*faq[^"]*")[^>]*>[\s\S]*?<\/section>/i,
  attribution: /<section[^>]*class="[^"]*attribution[^"]*"[^>]*>[\s\S]*?<\/section>/i
};

function extractSection(html, pattern) {
  const match = html.match(pattern);
  return match ? match[0] : null;
}

function removeSection(html, section) {
  if (!section) return html;
  const escaped = section.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return html.replace(new RegExp(escaped, 'g'), '');
}

function fixSectionOrder(html, filename) {
  // Check if this is a well-structured RCL page - skip those
  if (html.includes('STANDARDS: Every Page') && !html.includes('footer class="wrap"')) {
    return { html, fixed: false, reason: 'already-structured' };
  }

  // Check for misplaced footer inside main content (a common issue)
  const hasFooterInMain = /<\/section>\s*<footer[^>]*class="wrap"[^>]*>[\s\S]*?<\/footer>\s*<section/i.test(html);

  // Check for videos section outside main column
  const hasVideosOutsideMain = /<\/aside>[\s\S]*?<section[^>]*video-highlights/i.test(html);

  // Check for grid-2 deck plans outside main column
  const hasDeckPlansOutsideMain = /<\/aside>[\s\S]*?<div class="grid-2">/i.test(html);

  if (!hasFooterInMain && !hasVideosOutsideMain && !hasDeckPlansOutsideMain) {
    // Check if sections are in wrong order within main
    const mainContent = html.match(/<section class="col-1"[\s\S]*?<\/section><!-- End Main Content/i);
    if (!mainContent) {
      return { html, fixed: false, reason: 'no-main-column' };
    }
    return { html, fixed: false, reason: 'structure-ok' };
  }

  let fixed = html;
  let changes = [];

  // Remove misplaced footer from inside main content
  if (hasFooterInMain) {
    const footerMatch = fixed.match(/<footer[^>]*class="wrap"[^>]*role="contentinfo"[^>]*>[\s\S]*?<\/footer>/i);
    if (footerMatch) {
      // Store for later - it should be after </main>
      const footer = footerMatch[0];
      fixed = fixed.replace(footer, '');

      // Add footer after </main> if not already there
      if (!fixed.includes('</main>')) {
        // Try to find main closing
      } else if (!/<\/main>\s*<footer/i.test(fixed)) {
        fixed = fixed.replace('</main>', '</main>\n\n  ' + footer);
      }
      changes.push('moved-footer');
    }
  }

  // Move videos section inside main column if it's outside
  if (hasVideosOutsideMain) {
    const videosMatch = fixed.match(/<section[^>]*aria-labelledby="video-highlights"[^>]*>[\s\S]*?<\/section>(?:\s*<script>[\s\S]*?<\/script>)?/i);
    if (videosMatch) {
      const videos = videosMatch[0];
      fixed = fixed.replace(videos, '');

      // Insert after logbook section or after faq
      const logbookEnd = fixed.lastIndexOf('</section>', fixed.indexOf('id="logbook"') > -1 ? fixed.indexOf('</section>', fixed.indexOf('id="logbook"')) + 100 : -1);
      if (logbookEnd > -1) {
        // Find the proper insertion point
        const insertPoint = fixed.indexOf('</section>', fixed.indexOf('id="logbook"'));
        if (insertPoint > -1) {
          fixed = fixed.slice(0, insertPoint + 10) + '\n\n    ' + videos + fixed.slice(insertPoint + 10);
        }
      }
      changes.push('moved-videos');
    }
  }

  // Move deck plans grid inside main column if it's outside
  if (hasDeckPlansOutsideMain) {
    const gridMatch = fixed.match(/<div class="grid-2">[\s\S]*?<section[^>]*deck-plans[\s\S]*?<\/section>[\s\S]*?<section[^>]*itinerary[\s\S]*?<\/section>\s*<\/div>/i);
    if (gridMatch) {
      const grid = gridMatch[0];
      fixed = fixed.replace(grid, '');

      // Insert after videos section
      const videosEnd = fixed.indexOf('</section>', fixed.indexOf('video-highlights'));
      if (videosEnd > -1) {
        // Find script after videos
        const afterVideos = fixed.indexOf('</script>', videosEnd);
        if (afterVideos > videosEnd && afterVideos - videosEnd < 1000) {
          fixed = fixed.slice(0, afterVideos + 9) + '\n\n    ' + grid + fixed.slice(afterVideos + 9);
        } else {
          fixed = fixed.slice(0, videosEnd + 10) + '\n\n    ' + grid + fixed.slice(videosEnd + 10);
        }
      }
      changes.push('moved-deck-grid');
    }
  }

  // Move attribution to end of main content column if it's outside
  const attrMatch = fixed.match(/<section[^>]*class="[^"]*attributions?[^"]*"[^>]*>[\s\S]*?<\/section>/i);
  if (attrMatch) {
    const attrInside = fixed.indexOf(attrMatch[0]) < fixed.indexOf('</section><!-- End Main Content');
    if (!attrInside && fixed.includes('</section><!-- End Main Content')) {
      const attr = attrMatch[0];
      fixed = fixed.replace(attr, '');
      // Insert before End Main Content comment
      fixed = fixed.replace('</section><!-- End Main Content', attr + '\n  </section><!-- End Main Content');
      changes.push('moved-attribution');
    }
  }

  if (changes.length === 0) {
    return { html, fixed: false, reason: 'no-changes-needed' };
  }

  return { html: fixed, fixed: true, changes };
}

async function processFile(filepath) {
  const html = await readFile(filepath, 'utf8');
  const result = fixSectionOrder(html, filepath);

  if (result.fixed) {
    await writeFile(filepath, result.html, 'utf8');
    return { status: 'fixed', changes: result.changes };
  }

  return { status: result.reason || 'ok' };
}

async function processCruiseLine(cruiseLine) {
  const lineDir = join(SHIPS_DIR, cruiseLine);
  let files;
  try {
    files = await readdir(lineDir);
  } catch (e) {
    return { cruiseLine, error: e.message, fixed: 0 };
  }

  const htmlFiles = files.filter(f =>
    f.endsWith('.html') &&
    f !== 'index.html' &&
    !f.includes('unnamed')
  );

  let fixed = 0;

  for (const file of htmlFiles) {
    const filepath = join(lineDir, file);
    const result = await processFile(filepath);

    if (result.status === 'fixed') {
      console.log(`  ✅ ${file}: ${result.changes.join(', ')}`);
      fixed++;
    }
  }

  return { cruiseLine, fixed, total: htmlFiles.length };
}

async function main() {
  console.log('Batch Fix: Reorder sections to ITW-SHIP-002 standard');
  console.log('=====================================================\n');

  let totalFixed = 0;

  for (const cruiseLine of CRUISE_LINES) {
    console.log(`\n[${cruiseLine}]`);
    const result = await processCruiseLine(cruiseLine);

    if (result.error) {
      console.log(`  ⚠️ Error: ${result.error}`);
    } else {
      console.log(`  Summary: ${result.fixed} fixed`);
      totalFixed += result.fixed;
    }
  }

  console.log('\n=====================================================');
  console.log(`Total: ${totalFixed} files fixed`);
}

main().catch(console.error);
