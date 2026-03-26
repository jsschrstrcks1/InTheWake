#!/usr/bin/env node
/**
 * Port Section Reorderer — Phase 1 Normalization
 * Soli Deo Gloria
 *
 * Moves specific out-of-order sections to their correct position per ITC v1.1.
 * Uses targeted extraction: find the misplaced section, find the insertion
 * point, move it. Does NOT attempt to reorder all sections at once.
 *
 * Handles:
 *   - map/port-map/port-map-section → moves after getting-around
 *   - featured_images → moves after logbook
 *
 * Safe approach:
 *   - Dry-run by default (--write to actually modify)
 *   - Backs up originals to .bak before write, restores on failure
 *   - Self-verifies after write
 *
 * Usage:
 *   node scripts/reorder-port-sections.js ports/bermuda.html          # dry-run
 *   node scripts/reorder-port-sections.js ports/bermuda.html --write  # modify
 *   node scripts/reorder-port-sections.js --all                       # all Tier 1
 *   node scripts/reorder-port-sections.js --all --write               # all Tier 1, modify
 */

const fs = require('fs');
const path = require('path');

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

/**
 * Find a <details> section by ID pattern in the content.
 * Returns { start, end } character offsets of the complete <details>...</details> block,
 * or null if not found.
 *
 * Handles nested <details> elements correctly by counting nesting depth.
 */
function findDetailsById(content, idPattern) {
  // Match <details with the given ID
  const openRegex = new RegExp(`<details\\s[^>]*id="${idPattern}"[^>]*>`, 'g');
  const match = openRegex.exec(content);
  if (!match) return null;

  const start = match.index;
  let pos = match.index + match[0].length;
  let depth = 1;

  // Walk forward counting <details> opens and </details> closes
  while (pos < content.length && depth > 0) {
    const nextOpen = content.indexOf('<details', pos);
    const nextClose = content.indexOf('</details>', pos);

    if (nextClose === -1) break; // malformed HTML

    if (nextOpen !== -1 && nextOpen < nextClose) {
      // Found a nested <details> before the next close
      depth++;
      pos = nextOpen + 8; // skip past '<details'
    } else {
      // Found a close
      depth--;
      if (depth === 0) {
        const end = nextClose + '</details>'.length;
        return { start, end };
      }
      pos = nextClose + '</details>'.length;
    }
  }

  return null; // unclosed
}

/**
 * Find the end position of a <details> section by ID.
 * Returns the character offset just after </details>, or -1 if not found.
 */
function findSectionEnd(content, idPattern) {
  const block = findDetailsById(content, idPattern);
  return block ? block.end : -1;
}

/**
 * Determine where map section should be inserted.
 * Per ITC v1.1: map goes after getting-around (or after cruise-port if no getting-around).
 * Returns insertion character offset, or -1 if anchor not found.
 */
function findMapInsertionPoint(content) {
  // Prefer: after getting-around
  let pos = findSectionEnd(content, 'getting-around');
  if (pos !== -1) return pos;

  // Fallback: after cruise-port
  pos = findSectionEnd(content, 'cruise-port');
  if (pos !== -1) return pos;

  return -1;
}

/**
 * Determine where featured_images should be inserted.
 * Per ITC v1.1: after logbook.
 * Returns insertion character offset, or -1 if anchor not found.
 */
function findFeaturedImagesInsertionPoint(content) {
  // After logbook — logbook can be <details id="logbook"> or <section id="logbook">
  // Try <details> first
  let pos = findSectionEnd(content, 'logbook');
  if (pos !== -1) return pos;

  // Try <section id="logbook">...</section>
  const sectionMatch = content.match(/<section\s+id="logbook"[^>]*>/);
  if (sectionMatch) {
    const sectionStart = sectionMatch.index;
    let searchPos = sectionStart + sectionMatch[0].length;
    let depth = 1;
    while (searchPos < content.length && depth > 0) {
      const nextOpen = content.indexOf('<section', searchPos);
      const nextClose = content.indexOf('</section>', searchPos);
      if (nextClose === -1) break;
      if (nextOpen !== -1 && nextOpen < nextClose) {
        depth++;
        searchPos = nextOpen + 8;
      } else {
        depth--;
        if (depth === 0) return nextClose + '</section>'.length;
        searchPos = nextClose + '</section>'.length;
      }
    }
  }

  return -1;
}

/**
 * Check if map section exists and is out of order.
 * Returns { outOfOrder: boolean, mapId: string } or null if no map.
 */
function checkMapOrder(content) {
  const mapIds = ['map', 'port-map', 'port-map-section'];
  let mapBlock = null;
  let mapId = null;

  for (const id of mapIds) {
    const block = findDetailsById(content, id);
    if (block) {
      mapBlock = block;
      mapId = id;
      break;
    }
  }

  if (!mapBlock) return null;

  // Map should come after getting-around and before excursions/beaches
  const gettingAroundEnd = findSectionEnd(content, 'getting-around');
  if (gettingAroundEnd === -1) return null; // can't determine order without anchor

  // Map is out of order if it starts AFTER excursions, depth-soundings, gallery, or faq
  const excursionsBlock = findDetailsById(content, 'excursions');
  const depthBlock = findDetailsById(content, 'depth-soundings');
  const galleryBlock = findDetailsById(content, 'gallery');
  const faqBlock = findDetailsById(content, 'faq');

  // Map should be before all of these. If map.start > any of these .start, it's out of order.
  const shouldBeBefore = [excursionsBlock, depthBlock, galleryBlock, faqBlock].filter(Boolean);
  const isOutOfOrder = shouldBeBefore.some(b => mapBlock.start > b.start);

  return { outOfOrder: isOutOfOrder, mapId, mapBlock };
}

/**
 * Check if featured_images section is out of order.
 */
function checkFeaturedImagesOrder(content) {
  const block = findDetailsById(content, 'featured_images');
  if (!block) return null;

  // featured_images should come right after logbook, before weather-guide/cruise-port
  const cruisePortBlock = findDetailsById(content, 'cruise-port');
  const weatherBlock = findDetailsById(content, 'weather-guide');

  // If featured_images starts after cruise-port or weather-guide, it's out of order
  const shouldBeBefore = [cruisePortBlock, weatherBlock].filter(Boolean);
  const isOutOfOrder = shouldBeBefore.some(b => block.start > b.start);

  return { outOfOrder: isOutOfOrder, block };
}

/**
 * Move a section from its current position to a new insertion point.
 * Returns new content string.
 */
function moveSection(content, block, insertionPoint) {
  // Extract the block text
  const blockText = content.slice(block.start, block.end);

  // Remove from original position
  // Also remove leading/trailing whitespace around the removed block
  let removeStart = block.start;
  let removeEnd = block.end;

  // Expand removal to include preceding newline/whitespace
  while (removeStart > 0 && (content[removeStart - 1] === ' ' || content[removeStart - 1] === '\t')) {
    removeStart--;
  }
  if (removeStart > 0 && content[removeStart - 1] === '\n') {
    removeStart--;
  }

  // Expand removal to include trailing newline
  while (removeEnd < content.length && (content[removeEnd] === ' ' || content[removeEnd] === '\t')) {
    removeEnd++;
  }
  if (removeEnd < content.length && content[removeEnd] === '\n') {
    removeEnd++;
  }

  const withoutBlock = content.slice(0, removeStart) + content.slice(removeEnd);

  // Adjust insertion point if removal was before it
  let adjustedInsert = insertionPoint;
  if (removeStart < insertionPoint) {
    adjustedInsert -= (removeEnd - removeStart);
  }

  // Insert at the new position with a newline before
  const newContent = withoutBlock.slice(0, adjustedInsert) + '\n' + blockText + withoutBlock.slice(adjustedInsert);

  return newContent;
}

/**
 * Process a single file
 */
function processFile(filePath, writeMode) {
  const absPath = path.resolve(filePath);
  const basename = path.basename(filePath);

  console.log(`\n${BOLD}${CYAN}═══ ${basename} ═══${RESET}`);

  if (!fs.existsSync(absPath)) {
    console.log(`${RED}File not found: ${absPath}${RESET}`);
    return { file: basename, status: 'error', reason: 'not found' };
  }

  let content = fs.readFileSync(absPath, 'utf8');
  const moves = [];

  // Check and fix featured_images first (so map insertion points stay stable)
  const fiCheck = checkFeaturedImagesOrder(content);
  if (fiCheck && fiCheck.outOfOrder) {
    const insertPoint = findFeaturedImagesInsertionPoint(content);
    if (insertPoint !== -1) {
      console.log(`${YELLOW}featured_images is out of order — moving after logbook${RESET}`);
      content = moveSection(content, fiCheck.block, insertPoint);
      moves.push({ id: 'featured_images', target: 'after logbook' });
    } else {
      console.log(`${RED}Cannot find insertion point for featured_images (no logbook found)${RESET}`);
    }
  }

  // Check and fix map
  const mapCheck = checkMapOrder(content);
  if (mapCheck && mapCheck.outOfOrder) {
    // Re-find map block in potentially modified content
    const updatedMapBlock = findDetailsById(content, mapCheck.mapId);
    if (updatedMapBlock) {
      const insertPoint = findMapInsertionPoint(content);
      if (insertPoint !== -1) {
        console.log(`${YELLOW}${mapCheck.mapId} is out of order — moving after getting-around${RESET}`);
        content = moveSection(content, updatedMapBlock, insertPoint);
        moves.push({ id: mapCheck.mapId, target: 'after getting-around' });
      } else {
        console.log(`${RED}Cannot find insertion point for map (no getting-around/cruise-port found)${RESET}`);
      }
    }
  }

  if (moves.length === 0) {
    // Double-check: maybe sections were already in order
    if (!fiCheck?.outOfOrder && !mapCheck?.outOfOrder) {
      console.log(`${GREEN}✓ All sections in correct order${RESET}`);
      return { file: basename, status: 'already_ordered' };
    }
    console.log(`${YELLOW}Sections out of order but could not determine fix${RESET}`);
    return { file: basename, status: 'no_change' };
  }

  console.log(`${CYAN}Planned moves:${RESET}`);
  moves.forEach(m => console.log(`  ${m.id} → ${m.target}`));

  if (!writeMode) {
    console.log(`${YELLOW}DRY RUN — use --write to apply changes${RESET}`);
    return { file: basename, status: 'dry_run', moves };
  }

  // Backup original
  const originalContent = fs.readFileSync(absPath, 'utf8');
  const backupPath = absPath + '.bak';
  fs.writeFileSync(backupPath, originalContent, 'utf8');

  // Write modified content
  fs.writeFileSync(absPath, content, 'utf8');

  // Verify: re-read and check order
  const verifyContent = fs.readFileSync(absPath, 'utf8');
  const mapVerify = checkMapOrder(verifyContent);
  const fiVerify = checkFeaturedImagesOrder(verifyContent);
  const stillBroken = (mapVerify && mapVerify.outOfOrder) || (fiVerify && fiVerify.outOfOrder);

  if (!stillBroken) {
    console.log(`${GREEN}✓ Written and verified — sections now in correct order${RESET}`);
    fs.unlinkSync(backupPath);
    return { file: basename, status: 'fixed', moves };
  } else {
    console.log(`${RED}✗ VERIFICATION FAILED — restoring from backup${RESET}`);
    if (mapVerify?.outOfOrder) console.log(`${RED}  Map still out of order${RESET}`);
    if (fiVerify?.outOfOrder) console.log(`${RED}  Featured images still out of order${RESET}`);
    fs.writeFileSync(absPath, originalContent, 'utf8');
    fs.unlinkSync(backupPath);
    return { file: basename, status: 'verify_failed', moves };
  }
}

// Tier 1 pages (only out_of_order errors)
const TIER1_PAGES = [
  'whittier', 'wellington', 'virgin-gorda', 'tracy-arm', 'tortola',
  'tianjin', 'suva', 'st-thomas', 'st-maarten', 'st-kitts',
  'sharm-el-sheikh', 'santorini', 'samana', 'picton', 'norwegian-fjords',
  'mykonos', 'mumbai', 'mindelo', 'martinique', 'marthas-vineyard',
  'kotor', 'key-west', 'kagoshima', 'jamaica', 'hurghada',
  'honningsvag', 'hobart', 'guadeloupe', 'grenada', 'grand-turk',
  'glasgow', 'gijon', 'geiranger', 'freeport', 'fortaleza',
  'flam', 'falkland-islands', 'ensenada', 'endicott-arm', 'dubrovnik',
  'dominica', 'doha', 'cococay', 'cochin', 'cape-cod',
  'bonaire', 'bermuda', 'barbados', 'bar-harbor', 'bangkok',
  'baltimore', 'bali', 'auckland', 'athens', 'ascension',
  'aruba', 'aqaba', 'apia', 'antigua', 'antarctic-peninsula',
  'amsterdam', 'amalfi', 'alexandria', 'alesund', 'akaroa',
  'ajaccio', 'aitutaki', 'airlie-beach'
];

function main() {
  const args = process.argv.slice(2);
  const writeMode = args.includes('--write');
  const allMode = args.includes('--all');
  const files = args.filter(a => !a.startsWith('--'));

  let filesToProcess = [];

  if (allMode) {
    filesToProcess = TIER1_PAGES.map(slug => `ports/${slug}.html`);
  } else if (files.length > 0) {
    filesToProcess = files;
  } else {
    console.log('Usage:');
    console.log('  node scripts/reorder-port-sections.js <file>          # dry-run single file');
    console.log('  node scripts/reorder-port-sections.js <file> --write  # modify single file');
    console.log('  node scripts/reorder-port-sections.js --all           # dry-run all Tier 1');
    console.log('  node scripts/reorder-port-sections.js --all --write   # modify all Tier 1');
    process.exit(1);
  }

  console.log(`${BOLD}Port Section Reorderer — Phase 1${RESET}`);
  console.log(`Mode: ${writeMode ? GREEN + 'WRITE' : YELLOW + 'DRY RUN'}${RESET}`);
  console.log(`Files: ${filesToProcess.length}`);

  const results = [];
  for (const file of filesToProcess) {
    results.push(processFile(file, writeMode));
  }

  // Summary
  console.log(`\n${BOLD}${CYAN}═══════════════════════════════════════${RESET}`);
  console.log(`${BOLD}SUMMARY${RESET}`);
  console.log(`${CYAN}═══════════════════════════════════════${RESET}`);

  const fixed = results.filter(r => r.status === 'fixed').length;
  const dryRun = results.filter(r => r.status === 'dry_run').length;
  const alreadyOk = results.filter(r => r.status === 'already_ordered' || r.status === 'no_change').length;
  const errors = results.filter(r => r.status === 'error' || r.status === 'verify_failed').length;

  if (writeMode) {
    console.log(`${GREEN}Fixed: ${fixed}${RESET}`);
  } else {
    console.log(`${YELLOW}Would fix: ${dryRun}${RESET}`);
  }
  console.log(`Already correct: ${alreadyOk}`);
  if (errors > 0) {
    console.log(`${RED}Errors: ${errors}${RESET}`);
    results.filter(r => r.status === 'error' || r.status === 'verify_failed').forEach(r => {
      console.log(`  ${RED}${r.file}: ${r.reason || r.status}${RESET}`);
    });
  }
}

main();
