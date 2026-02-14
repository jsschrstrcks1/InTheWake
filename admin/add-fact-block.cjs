#!/usr/bin/env node
/**
 * add-fact-block.cjs
 * Adds a visible declarative fact paragraph to ship pages.
 *
 * Data source: ship-stats-fallback inline JSON in each page.
 * Insertion point: right before the first "answer-line" paragraph.
 *
 * Format: "[Ship] is a [Class] cruise ship operated by [Line].
 *          She entered service in [Year], measures [GT] gross tons,
 *          and carries approximately [Guests] guests at double occupancy."
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

function extractStatsJSON(content) {
  const match = content.match(/<script[^>]*id="ship-stats-fallback"[^>]*>\s*([\s\S]*?)\s*<\/script>/);
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch (e) {
    return null;
  }
}

function extractCruiseLineFromBreadcrumbs(content) {
  const match = content.match(/cruise-line:\s*(.+)/);
  return match ? match[1].trim() : null;
}

function buildFactParagraph(stats, cruiseLine) {
  const name = stats.name;
  const shipClass = stats.class || 'Unknown Class';
  const line = stats.cruise_line || cruiseLine || 'Unknown Line';
  const year = stats.entered_service;
  const gt = stats.gt ? stats.gt.replace(/\s*GT\s*$/i, '') : null;
  const guests = stats.guests;

  // Parse guest count — handle formats like "2,466 (double) ~2,700 (max)" or just "2,466"
  let guestCount = guests;
  if (typeof guests === 'string') {
    const doubleMatch = guests.match(/([\d,]+)\s*\(?double/i);
    if (doubleMatch) {
      guestCount = doubleMatch[1];
    } else {
      // Take first number
      const numMatch = guests.match(/([\d,]+)/);
      if (numMatch) guestCount = numMatch[1];
    }
  }

  let sentence = `${name} is a ${shipClass} cruise ship operated by ${line}.`;
  if (year && gt && guestCount) {
    sentence += ` She entered service in ${year}, measures ${gt} gross tons, and carries approximately ${guestCount} guests at double occupancy.`;
  } else if (year && gt) {
    sentence += ` She entered service in ${year} and measures ${gt} gross tons.`;
  } else if (year) {
    sentence += ` She entered service in ${year}.`;
  }

  return sentence;
}

let added = 0;
let skippedNoStats = 0;
let skippedNoAnchor = 0;
let skippedAlready = 0;
let errors = [];

const files = findHtmlFiles(SHIPS_DIR);

for (const filePath of files) {
  let content = fs.readFileSync(filePath, 'utf8');
  const relPath = path.relative(path.join(__dirname, '..'), filePath);

  // Skip if already has a fact block
  if (content.includes('class="fact-block"')) {
    skippedAlready++;
    continue;
  }

  // Extract ship stats
  const stats = extractStatsJSON(content);
  if (!stats) {
    skippedNoStats++;
    continue;
  }

  // Get cruise line from breadcrumbs if not in stats
  const cruiseLine = extractCruiseLineFromBreadcrumbs(content);

  // Build the fact paragraph
  const factText = buildFactParagraph(stats, cruiseLine);

  const factBlock = `\n      <p class="fact-block" style="font-size: 0.95rem; color: #345; line-height: 1.6; margin: 0.5rem 0;">${factText}</p>\n`;

  // Find insertion point: right before the first answer-line paragraph
  const answerLineIndex = content.indexOf('class="answer-line"');
  if (answerLineIndex === -1) {
    skippedNoAnchor++;
    continue;
  }

  // Find the <p that contains this class
  const beforeAnswerLine = content.lastIndexOf('<p', answerLineIndex);
  if (beforeAnswerLine === -1) {
    skippedNoAnchor++;
    continue;
  }

  // Insert fact block before the answer-line paragraph
  const newContent = content.slice(0, beforeAnswerLine) + factBlock + '\n      ' + content.slice(beforeAnswerLine);
  fs.writeFileSync(filePath, newContent, 'utf8');
  added++;
}

console.log(`\n=== Declarative Fact Block Summary ===`);
console.log(`Files scanned: ${files.length}`);
console.log(`Fact blocks added: ${added}`);
console.log(`Skipped (no stats JSON): ${skippedNoStats}`);
console.log(`Skipped (no answer-line anchor): ${skippedNoAnchor}`);
console.log(`Skipped (already has fact block): ${skippedAlready}`);
if (errors.length > 0) {
  console.log(`\nErrors:`);
  errors.forEach(e => console.log(`  ${e}`));
}
