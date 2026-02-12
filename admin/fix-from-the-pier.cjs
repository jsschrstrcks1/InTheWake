#!/usr/bin/env node
/**
 * Fix from-the-pier div → nav conversion
 * Changes <div class="from-the-pier"> to <nav class="from-the-pier">
 * This prevents false section detection by the v2 validator
 * (the validator scans 'main div[id]' but not 'main nav[id]')
 */
const fs = require('fs');
const path = require('path');
const glob = require('glob');

const portFiles = glob.sync('ports/*.html');
let totalFixed = 0;
let totalFiles = 0;

portFiles.forEach(file => {
  let html = fs.readFileSync(file, 'utf8');

  // Count from-the-pier divs in this file
  const openMatches = html.match(/<div\s+class="from-the-pier"/g);
  if (!openMatches) return;

  const count = openMatches.length;
  let modified = false;

  // Replace opening tags: <div class="from-the-pier" → <nav class="from-the-pier"
  const newHtml = html.replace(/<div(\s+class="from-the-pier"[^>]*)>/g, (match, attrs) => {
    return `<nav${attrs}>`;
  });

  if (newHtml === html) return;

  // Now find and replace the corresponding closing </div> for each from-the-pier
  // Strategy: find each <nav class="from-the-pier"...> and track depth to find its closing </div>
  let result = newHtml;
  let searchStart = 0;

  for (let i = 0; i < count; i++) {
    const navStart = result.indexOf('<nav class="from-the-pier"', searchStart);
    if (navStart === -1) break;

    // Find the > that closes this opening tag
    const tagEnd = result.indexOf('>', navStart);
    if (tagEnd === -1) break;

    // Now track div depth to find the matching closing tag
    // We need to find the </div> that matches this nav (treating nav like a div for nesting)
    let pos = tagEnd + 1;
    let depth = 0; // we're inside the nav, looking for depth 0 closing

    while (pos < result.length) {
      const nextOpen = result.indexOf('<div', pos);
      const nextClose = result.indexOf('</div>', pos);
      const nextNavClose = result.indexOf('</nav>', pos);

      // Find the earliest tag
      const candidates = [];
      if (nextOpen !== -1) candidates.push({ type: 'open', pos: nextOpen });
      if (nextClose !== -1) candidates.push({ type: 'close', pos: nextClose });

      if (candidates.length === 0) break;
      candidates.sort((a, b) => a.pos - b.pos);

      const next = candidates[0];

      if (next.type === 'open') {
        // Check it's actually a tag (not text like "dividing")
        const afterTag = result[next.pos + 4];
        if (afterTag === ' ' || afterTag === '>' || afterTag === '\n' || afterTag === '\t') {
          depth++;
        }
        pos = next.pos + 4;
      } else if (next.type === 'close') {
        if (depth === 0) {
          // This </div> corresponds to our <nav>
          result = result.substring(0, next.pos) + '</nav>' + result.substring(next.pos + 6);
          searchStart = next.pos + 6;
          modified = true;
          break;
        }
        depth--;
        pos = next.pos + 6;
      }
    }
  }

  if (modified) {
    fs.writeFileSync(file, result, 'utf8');
    totalFiles++;
    totalFixed += count;
    if (count > 1) {
      console.log(`  ${file}: ${count} from-the-pier divs → nav`);
    }
  }
});

console.log(`\nFixed ${totalFixed} from-the-pier elements across ${totalFiles} files`);
