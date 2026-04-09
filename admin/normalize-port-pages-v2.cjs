#!/usr/bin/env node
/**
 * normalize-port-pages-v2.cjs — Phase 1 Unified Normalization Script
 * Soli Deo Gloria
 *
 * Performs three operations in a single pass:
 * 1. Template filler removal (generic_passport_advice sentence)
 * 2. Section reordering to canonical order
 * 3. Stray HTML tag cleanup (kusadasi, falmouth)
 *
 * Usage:
 *   node admin/normalize-port-pages-v2.cjs --dry-run     # Preview changes
 *   node admin/normalize-port-pages-v2.cjs               # Apply changes
 *   node admin/normalize-port-pages-v2.cjs --file ports/kagoshima.html  # Single file
 */

const fs = require('fs');
const path = require('path');

const PORTS_DIR = path.join(__dirname, '..', 'ports');

// ── Template filler pattern ──────────────────────────────────────────
const PASSPORT_FILLER = ' Carry a photocopy of your passport rather than the original.';

// ── Canonical section order (from validate-port-page-v2.js) ─────────
const EXPECTED_MAIN_ORDER = [
  'hero', 'logbook', 'featured_images', 'cruise_port', 'getting_around',
  'map', 'beaches', 'excursions', 'history', 'cultural', 'shopping',
  'food', 'notices', 'depth_soundings', 'practical', 'gallery',
  'credits', 'faq', 'back_nav'
];

// Section detection patterns — mirrors validate-port-page-v2.js exactly
const SECTION_PATTERNS = {
  hero: /hero|port-hero|header-image/i,
  logbook: /logbook|first.?person|personal|my (visit|experience|thoughts?)|the moment/i,
  featured_images: /featured.?images?|inline.?images?/i,
  cruise_port: /(the )?cruise (port|terminal)|port (of call|terminal|facilities)/i,
  getting_around: /getting (around|there|to|from)|transportation|how to get/i,
  map: /map|interactive.?map|port.?map/i,
  beaches: /beaches?|beach guide|coastal/i,
  excursions: /(top )?excursions?|attractions?|things to (do|see)|activities/i,
  history: /\bhistory\b|\bhistorical\b|\bheritage\b/i,
  cultural: /cultural? (features?|highlights?|experiences?)|\btraditions?\b(?!ally)/i,
  shopping: /\bshopping\b|\bretail\b/i,
  food: /\bfood\b(?! culture)|\bdining\b|\brestaurants?\b|\bcuisine\b/i,
  notices: /(special )?notices?|warnings?|alerts?|important|know before/i,
  depth_soundings: /depth soundings|final thoughts?|in conclusion|the (real|honest) story/i,
  practical: /practical (information|info)|quick reference|at a glance|summary/i,
  faq: /(frequently asked questions?|faq|common questions?)/i,
  gallery: /(photo )?gallery|photos?|images?|swiper/i,
  credits: /(image |photo )?credits?|attributions?|photo sources?/i,
  back_nav: /back (to|navigation)|return to ports/i
};

// Pages with out_of_order errors
const OUT_OF_ORDER_PAGES = new Set([
  'kagoshima.html', 'cococay.html', 'picton.html', 'sharm-el-sheikh.html',
  'doha.html', 'trinidad.html', 'tobago.html', 'st-john-usvi.html',
  'santa-marta.html', 'tauranga.html', 'rotorua.html', 'papeete.html',
  'torshavn.html', 'ponta-delgada.html', 'port-elizabeth.html',
  'punta-del-este.html', 'ravenna.html', 'saguenay.html', 'scotland.html',
  'st-croix.html', 'sydney-ns.html', 'tangier.html', 'tunis.html',
  'vigo.html', 'waterford.html',
  'san-diego.html', 'glacier-alley.html', 'south-shetland-islands.html',
  'la-spezia.html', 'tender-ports.html', 'royal-beach-club-antigua.html',
  'south-pacific.html', 'torshavn.html'
]);

// Pages with template filler
const FILLER_PAGES = new Set([
  'zadar.html', 'ushuaia.html', 'trinidad.html', 'torshavn.html',
  'tobago.html', 'tender-ports.html', 'tauranga.html',
  'strait-of-magellan.html', 'st-john-usvi.html', 'st-croix.html',
  'south-shetland-islands.html', 'south-pacific.html', 'scotland.html',
  'santa-marta.html', 'royal-beach-club-antigua.html', 'rotorua.html',
  'punta-del-este.html', 'punta-arenas.html', 'puerto-montt.html',
  'port-said.html', 'port-elizabeth.html', 'port-arthur.html',
  'papeete.html', 'la-spezia.html', 'colon.html', 'chilean-fjords.html',
  'cherbourg.html', 'charlottetown.html', 'cephalonia.html', 'catania.html'
]);

function classifyElement(id, className, headingText) {
  // Normalize underscore/hyphen variants for fuzzy matching
  const normalizedId = (id || '').replace(/_/g, '-');
  const combined = `${headingText || ''} ${normalizedId} ${id || ''} ${className || ''}`.toLowerCase();
  for (const [key, pattern] of Object.entries(SECTION_PATTERNS)) {
    if (pattern.test(combined)) return key;
  }
  return null;
}

function removeTemplateFiller(content) {
  if (!content.includes('Carry a photocopy of your passport rather than the original')) {
    return { content, changed: false };
  }
  const newContent = content.replace(
    / Carry a photocopy of your passport rather than the original\./g,
    ''
  );
  return { content: newContent, changed: newContent !== content };
}

function extractTopLevelElement(html, startPos) {
  // Given HTML and a position at the start of an opening tag, find the full element
  // including matching close tag, handling nesting
  const tagMatch = html.substring(startPos).match(/^<(\w+)/);
  if (!tagMatch) return null;
  const tagName = tagMatch[1];
  const openTagEnd = html.indexOf('>', startPos) + 1;
  if (openTagEnd === 0) return null;

  // Self-closing check
  if (html.substring(startPos, openTagEnd).endsWith('/>')) {
    return { end: openTagEnd };
  }

  let depth = 1;
  let pos = openTagEnd;
  const openRe = new RegExp(`<${tagName}[\\s>/]`, 'gi');
  const closeRe = new RegExp(`</${tagName}>`, 'gi');

  while (depth > 0 && pos < html.length) {
    openRe.lastIndex = pos;
    closeRe.lastIndex = pos;
    const nextOpen = openRe.exec(html);
    const nextClose = closeRe.exec(html);

    if (!nextClose) break;

    if (nextOpen && nextOpen.index < nextClose.index) {
      depth++;
      pos = nextOpen.index + nextOpen[0].length;
    } else {
      depth--;
      pos = nextClose.index + nextClose[0].length;
      if (depth === 0) return { end: pos };
    }
  }
  return null;
}

function reorderSections(content, filename) {
  // Find the article container inside main — multiple class patterns supported
  // Tries: article.card, article.port-content, bare article, then falls back to <main>
  let containerStart, containerEnd, containerOpenEnd;

  // Try multiple article patterns in order of specificity
  const articlePatterns = [
    /<article\s+class="card"[^>]*>/,
    /<article\s+class="port-content"[^>]*>/,
    /<article\s+class="card\s+port-content"[^>]*>/,
    /<article[^>]*>/,
  ];

  for (const pattern of articlePatterns) {
    const articleMatch = content.match(pattern);
    if (articleMatch) {
      containerStart = content.indexOf(articleMatch[0]);
      containerOpenEnd = containerStart + articleMatch[0].length;
      const result = extractTopLevelElement(content, containerStart);
      if (result) {
        containerEnd = result.end - '</article>'.length;
        break;
      }
    }
  }

  if (!containerStart || !containerEnd) {
    // Fallback to <main>
    containerStart = content.indexOf('<main');
    containerEnd = content.lastIndexOf('</main>');
    if (containerStart === -1 || containerEnd === -1) return { content, changed: false };
    containerOpenEnd = content.indexOf('>', containerStart) + 1;
  }

  const mainOpenEnd = containerOpenEnd;
  const mainEnd = containerEnd;
  const mainInner = content.substring(mainOpenEnd, mainEnd);

  // Find top-level children of <main> by walking the HTML
  // Only process elements at depth 0 relative to <main>
  const topChildren = [];
  let pos = 0;

  while (pos < mainInner.length) {
    // Skip whitespace and text nodes
    const nextTag = mainInner.indexOf('<', pos);
    if (nextTag === -1) break;

    // Skip comments
    if (mainInner.substring(nextTag, nextTag + 4) === '<!--') {
      const commentEnd = mainInner.indexOf('-->', nextTag);
      if (commentEnd === -1) break;
      pos = commentEnd + 3;
      continue;
    }

    // Skip closing tags (shouldn't be here at top level, but be safe)
    if (mainInner[nextTag + 1] === '/') {
      const closeEnd = mainInner.indexOf('>', nextTag);
      pos = closeEnd + 1;
      continue;
    }

    // Opening tag — extract the element
    const tagMatch = mainInner.substring(nextTag).match(/^<(\w+)/);
    if (!tagMatch) { pos = nextTag + 1; continue; }

    const result = extractTopLevelElement(mainInner, nextTag);
    if (!result) { pos = nextTag + 1; continue; }

    const elemHtml = mainInner.substring(nextTag, result.end);
    const openTag = mainInner.substring(nextTag, mainInner.indexOf('>', nextTag) + 1);
    const idMatch = openTag.match(/\bid="([^"]+)"/);
    const clsMatch = openTag.match(/\bclass="([^"]+)"/);
    const id = idMatch ? idMatch[1] : '';
    const cls = clsMatch ? clsMatch[1] : '';

    // Extract first h2/h3 text
    const headingMatch = elemHtml.match(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/i);
    const headingText = headingMatch ? headingMatch[1].replace(/<[^>]+>/g, '').trim() : '';

    const canonical = classifyElement(id, cls, headingText);

    topChildren.push({
      start: nextTag,
      end: result.end,
      html: elemHtml,
      canonical: canonical,
      id: id,
      tagName: tagMatch[1]
    });

    pos = result.end;
  }

  // Filter to only classified sections
  const sections = topChildren.filter(c => c.canonical);

  // Deduplicate — keep first occurrence of each canonical section
  const seen = new Set();
  const uniqueSections = [];
  for (const s of sections) {
    if (!seen.has(s.canonical)) {
      seen.add(s.canonical);
      uniqueSections.push(s);
    }
  }

  if (uniqueSections.length < 2) return { content, changed: false };

  // Check current order
  const currentOrder = uniqueSections.map(s => s.canonical);
  const currentIndices = currentOrder.map(s => EXPECTED_MAIN_ORDER.indexOf(s));

  let isInOrder = true;
  for (let i = 1; i < currentIndices.length; i++) {
    if (currentIndices[i] < currentIndices[i - 1]) {
      isInOrder = false;
      break;
    }
  }

  if (isInOrder) return { content, changed: false };

  // Sort by canonical order
  const sorted = [...uniqueSections].sort((a, b) => {
    return EXPECTED_MAIN_ORDER.indexOf(a.canonical) - EXPECTED_MAIN_ORDER.indexOf(b.canonical);
  });

  // Strategy: replace each section's current position with its correct HTML
  // We know the positions of all sections. We'll build a mapping of
  // original position -> new content
  const positionMap = new Map();
  for (let i = 0; i < uniqueSections.length; i++) {
    positionMap.set(i, sorted[i].html);
  }

  // Rebuild mainInner, replacing each section at its original position with the reordered content
  let newMainInner = '';
  let lastEnd = 0;
  for (let i = 0; i < uniqueSections.length; i++) {
    const orig = uniqueSections[i];
    // Add everything between last section and this one
    newMainInner += mainInner.substring(lastEnd, orig.start);
    // Add the reordered section
    newMainInner += positionMap.get(i);
    lastEnd = orig.end;
  }
  // Add remaining content after last section
  newMainInner += mainInner.substring(lastEnd);

  const newContent = content.substring(0, mainOpenEnd) + newMainInner + content.substring(mainEnd);

  return { content: newContent, changed: newContent !== content };
}

function processFile(filePath, dryRun) {
  const filename = path.basename(filePath);
  let content = fs.readFileSync(filePath, 'utf8');
  const changes = [];

  // 1. Template filler removal
  if (FILLER_PAGES.has(filename)) {
    const result = removeTemplateFiller(content);
    if (result.changed) {
      content = result.content;
      changes.push('removed generic_passport_advice');
    }
  }

  // 2. Section reordering
  if (OUT_OF_ORDER_PAGES.has(filename)) {
    const result = reorderSections(content, filename);
    if (result.changed) {
      content = result.content;
      changes.push('reordered sections to canonical order');
    }
  }

  if (changes.length === 0) return null;

  if (!dryRun) {
    fs.writeFileSync(filePath, content, 'utf8');
  }

  return changes;
}

function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const fileIdx = args.indexOf('--file');
  const singleFile = fileIdx !== -1 ? args[fileIdx + 1] : null;

  console.log(`\n${'═'.repeat(70)}`);
  console.log(`  Port Page Normalization v2 — Phase 1 Unified Pass`);
  console.log(`  Mode: ${dryRun ? 'DRY RUN (no files modified)' : 'LIVE (files will be modified)'}`);
  console.log(`${'═'.repeat(70)}\n`);

  let files;
  if (singleFile) {
    files = [path.resolve(singleFile)];
  } else {
    files = fs.readdirSync(PORTS_DIR)
      .filter(f => f.endsWith('.html'))
      .map(f => path.join(PORTS_DIR, f));
  }

  let totalChanged = 0;
  const allChanges = [];

  for (const filePath of files) {
    const changes = processFile(filePath, dryRun);
    if (changes) {
      totalChanged++;
      const filename = path.basename(filePath);
      console.log(`  ✓ ${filename}: ${changes.join(', ')}`);
      allChanges.push({ file: filename, changes });
    }
  }

  console.log(`\n${'─'.repeat(70)}`);
  console.log(`  Total files ${dryRun ? 'would be ' : ''}modified: ${totalChanged}`);
  console.log(`${'─'.repeat(70)}\n`);

  return totalChanged;
}

main();
