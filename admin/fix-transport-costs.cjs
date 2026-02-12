#!/usr/bin/env node
/**
 * Fix transport-costs div → aside conversion
 * Changes <div class="transport-costs"> to <aside class="transport-costs">
 * Prevents false section detection by the v2 validator
 */
const fs = require('fs');
const glob = require('glob');

const portFiles = glob.sync('ports/*.html');
let totalFixed = 0;

portFiles.forEach(file => {
  let html = fs.readFileSync(file, 'utf8');
  if (!html.includes('class="transport-costs"')) return;

  // Replace opening tag
  let newHtml = html.replace(/<div(\s+class="transport-costs"[^>]*)>/g, '<aside$1>');
  if (newHtml === html) return;

  // Find the closing </div> for each transport-costs aside
  // Same depth-tracking approach as the from-the-pier fix
  let result = newHtml;
  let searchStart = 0;
  const count = (html.match(/<div\s+class="transport-costs"/g) || []).length;

  for (let i = 0; i < count; i++) {
    const asideStart = result.indexOf('<aside class="transport-costs"', searchStart);
    if (asideStart === -1) break;

    const tagEnd = result.indexOf('>', asideStart);
    if (tagEnd === -1) break;

    let pos = tagEnd + 1;
    let depth = 0;

    while (pos < result.length) {
      const nextOpen = result.indexOf('<div', pos);
      const nextClose = result.indexOf('</div>', pos);

      const candidates = [];
      if (nextOpen !== -1) candidates.push({ type: 'open', pos: nextOpen });
      if (nextClose !== -1) candidates.push({ type: 'close', pos: nextClose });

      if (candidates.length === 0) break;
      candidates.sort((a, b) => a.pos - b.pos);

      const next = candidates[0];

      if (next.type === 'open') {
        const afterTag = result[next.pos + 4];
        if (afterTag === ' ' || afterTag === '>' || afterTag === '\n' || afterTag === '\t') {
          depth++;
        }
        pos = next.pos + 4;
      } else if (next.type === 'close') {
        if (depth === 0) {
          result = result.substring(0, next.pos) + '</aside>' + result.substring(next.pos + 6);
          searchStart = next.pos + 8;
          break;
        }
        depth--;
        pos = next.pos + 6;
      }
    }
  }

  fs.writeFileSync(file, result, 'utf8');
  totalFixed++;
  console.log(`  ${file}: transport-costs div → aside`);
});

console.log(`\nFixed ${totalFixed} files`);
