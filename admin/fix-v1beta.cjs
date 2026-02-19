#!/usr/bin/env node
/**
 * fix-v1beta.cjs
 * Removes V1.Beta references from ship page titles and navbar badges.
 *
 * Changes:
 * 1. Strips " (V1.Beta)" from <title> tags
 * 2. Removes <span class="tiny version-badge" ...>V1.Beta</span> lines
 * 3. Removes <span class="version-badge">V1.Beta</span> lines (older format)
 */

const fs = require('fs');
const path = require('path');

const SHIPS_DIR = path.join(__dirname, '..', 'ships');

function findHtmlFiles(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findHtmlFiles(fullPath));
    } else if (entry.name.endsWith('.html')) {
      results.push(fullPath);
    }
  }
  return results;
}

let titleFixes = 0;
let badgeFixes = 0;
let filesModified = 0;
const modifiedFiles = [];

const files = findHtmlFiles(SHIPS_DIR);

for (const filePath of files) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;
  let changed = false;

  // 1. Strip " (V1.Beta)" from <title> tags
  const titleRegex = /(<title>[^<]*?) \(V1\.Beta\)(<\/title>)/g;
  if (titleRegex.test(content)) {
    content = content.replace(/(<title>[^<]*?) \(V1\.Beta\)(<\/title>)/g, '$1$2');
    titleFixes++;
    changed = true;
  }

  // 2. Remove version-badge span — format with aria-label
  //    <span class="tiny version-badge" aria-label="Site version V1.Beta">V1.Beta</span>
  const badgeRegex1 = /\s*<span class="tiny version-badge" aria-label="Site version V1\.Beta">V1\.Beta<\/span>\s*\n?/g;
  if (badgeRegex1.test(content)) {
    content = content.replace(/\s*<span class="tiny version-badge" aria-label="Site version V1\.Beta">V1\.Beta<\/span>\s*\n?/g, '\n');
    badgeFixes++;
    changed = true;
  }

  // 3. Remove version-badge span — simpler format
  //    <span class="tiny version-badge">V1.Beta</span>
  const badgeRegex2 = /\s*<span class="tiny version-badge">V1\.Beta<\/span>\s*\n?/g;
  if (badgeRegex2.test(content)) {
    content = content.replace(/\s*<span class="tiny version-badge">V1\.Beta<\/span>\s*\n?/g, '\n');
    if (!changed) badgeFixes++; // don't double-count
    changed = true;
  }

  // 4. Remove version-badge span — format without "tiny" class
  //    <span class="version-badge">V1.Beta</span>
  const badgeRegex3 = /\s*<span class="version-badge">V1\.Beta<\/span>\s*\n?/g;
  if (badgeRegex3.test(content)) {
    content = content.replace(/\s*<span class="version-badge">V1\.Beta<\/span>\s*\n?/g, '\n');
    if (!changed) badgeFixes++;
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    filesModified++;
    modifiedFiles.push(path.relative(SHIPS_DIR, filePath));
  }
}

console.log(`\n=== V1.Beta Removal Summary ===`);
console.log(`Files scanned: ${files.length}`);
console.log(`Files modified: ${filesModified}`);
console.log(`Title tags fixed: ${titleFixes}`);
console.log(`Badge elements removed: ${badgeFixes}`);
console.log(`\nModified files:`);
modifiedFiles.forEach(f => console.log(`  ${f}`));
