#!/usr/bin/env node
/**
 * add-keyword-subheaders.cjs
 * Adds ship-name keywords to generic H2 subheaders for SEO.
 *
 * Changes:
 * 1. "A First Look" → "A First Look at [Ship Name]"
 * 2. "Ship Map (Deck Plans)" → "[Ship Name] Deck Plans"
 * 3. "Deck Plans" → "[Ship Name] Deck Plans"
 * 4. "Frequently Asked Questions" → "Frequently Asked Questions About [Ship Name]"
 */

const fs = require('fs');
const path = require('path');

const SHIPS_DIR = path.join(__dirname, '..', 'ships');

const SKIP_FILES = new Set([
  'index.html', 'venues.html', 'template.html',
  'quiz.html', 'rooms.html', 'allshipquiz.html'
]);

function findHtmlFiles(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'assets') {
      results.push(...findHtmlFiles(fullPath));
    } else if (entry.name.endsWith('.html') && !SKIP_FILES.has(entry.name)) {
      results.push(fullPath);
    }
  }
  return results;
}

function extractShipName(content) {
  // Try ship-stats-fallback JSON first
  const statsMatch = content.match(/<script[^>]*id="ship-stats-fallback"[^>]*>\s*([\s\S]*?)\s*<\/script>/);
  if (statsMatch) {
    try {
      const stats = JSON.parse(statsMatch[1]);
      if (stats.name) return stats.name;
    } catch (e) {}
  }
  // Fallback: ai-breadcrumbs name field
  const nameMatch = content.match(/name:\s*(.+)/);
  if (nameMatch) return nameMatch[1].trim();
  return null;
}

let firstLookFixes = 0;
let deckPlanFixes = 0;
let faqFixes = 0;
let filesModified = 0;
let skipped = 0;

const files = findHtmlFiles(SHIPS_DIR);

for (const filePath of files) {
  let content = fs.readFileSync(filePath, 'utf8');
  const shipName = extractShipName(content);
  if (!shipName) {
    skipped++;
    continue;
  }

  let changed = false;

  // 1. "A First Look" → "A First Look at [Ship Name]"
  // Match: >A First Look</h2> but NOT >A First Look at ...</h2>
  const firstLookRegex = /(<h2[^>]*>)A First Look(<\/h2>)/g;
  if (firstLookRegex.test(content)) {
    content = content.replace(/(<h2[^>]*>)A First Look(<\/h2>)/g, `$1A First Look at ${shipName}$2`);
    firstLookFixes++;
    changed = true;
  }

  // 2. "Ship Map (Deck Plans)" → "[Ship Name] Deck Plans"
  const shipMapRegex = /(<h2[^>]*>)Ship Map \(Deck Plans\)(<\/h2>)/g;
  if (shipMapRegex.test(content)) {
    content = content.replace(/(<h2[^>]*>)Ship Map \(Deck Plans\)(<\/h2>)/g, `$1${shipName} Deck Plans$2`);
    deckPlanFixes++;
    changed = true;
  }

  // 3. Generic "Deck Plans" → "[Ship Name] Deck Plans"
  // Match: >Deck Plans</h2> but NOT >[Ship Name] Deck Plans</h2>
  if (!changed || !content.includes(`${shipName} Deck Plans`)) {
    const deckPlanRegex = /(<h2[^>]*>)Deck Plans(<\/h2>)/g;
    if (deckPlanRegex.test(content)) {
      content = content.replace(/(<h2[^>]*>)Deck Plans(<\/h2>)/g, `$1${shipName} Deck Plans$2`);
      if (!changed) deckPlanFixes++;
      else deckPlanFixes++; // count both patterns
      changed = true;
    }
  }

  // 4. "Frequently Asked Questions" → "Frequently Asked Questions About [Ship Name]"
  // Match: >Frequently Asked Questions</h2> but NOT >Frequently Asked Questions About ...</h2>
  const faqRegex = /(<h2[^>]*>)Frequently Asked Questions(<\/h2>)/g;
  if (faqRegex.test(content)) {
    content = content.replace(/(<h2[^>]*>)Frequently Asked Questions(<\/h2>)/g, `$1Frequently Asked Questions About ${shipName}$2`);
    faqFixes++;
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    filesModified++;
  }
}

console.log(`\n=== Keyword-Rich Subheader Summary ===`);
console.log(`Files scanned: ${files.length}`);
console.log(`Files modified: ${filesModified}`);
console.log(`"A First Look" fixes: ${firstLookFixes}`);
console.log(`"Deck Plans" fixes: ${deckPlanFixes}`);
console.log(`"FAQ" fixes: ${faqFixes}`);
console.log(`Skipped (no ship name found): ${skipped}`);
