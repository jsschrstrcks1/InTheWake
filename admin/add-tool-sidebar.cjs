#!/usr/bin/env node
/**
 * add-tool-sidebar.cjs
 * Adds a "Quick Tools" card to the right-rail sidebar on ship pages,
 * right after the Ship Quiz CTA card.
 *
 * Links: Ship Size Atlas, Budget Calculator, Drink Calculator, Port Day Planner
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

const TOOL_CARD = `
      <!-- Quick Tools -->
      <section class="card quick-tools" style="padding: 1rem;">
        <h3 style="margin: 0 0 0.75rem; font-size: 1rem; color: #083041;">Planning Tools</h3>
        <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.5rem;">
          <li><a href="/tools/ship-size-atlas.html" style="color: #0e6e8e; text-decoration: none; font-size: 0.9rem;">Ship Size Atlas</a></li>
          <li><a href="/tools/cruise-budget-calculator.html" style="color: #0e6e8e; text-decoration: none; font-size: 0.9rem;">Budget Calculator</a></li>
          <li><a href="/drink-calculator.html" style="color: #0e6e8e; text-decoration: none; font-size: 0.9rem;">Drink Package Calculator</a></li>
          <li><a href="/tools/port-day-planner.html" style="color: #0e6e8e; text-decoration: none; font-size: 0.9rem;">Port Day Planner</a></li>
        </ul>
      </section>
`;

let added = 0;
let skippedNoQuizCta = 0;
let skippedAlready = 0;

const files = findHtmlFiles(SHIPS_DIR);

for (const filePath of files) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Skip if already has quick-tools
  if (content.includes('class="card quick-tools"')) {
    skippedAlready++;
    continue;
  }

  // Find the quiz-cta closing tag
  const quizCtaIndex = content.indexOf('class="card quiz-cta"');
  if (quizCtaIndex === -1) {
    skippedNoQuizCta++;
    continue;
  }

  // Find the closing </section> after the quiz-cta
  const closingSectionIndex = content.indexOf('</section>', quizCtaIndex);
  if (closingSectionIndex === -1) {
    skippedNoQuizCta++;
    continue;
  }

  // Insert after the closing </section> + newline
  const insertPoint = closingSectionIndex + '</section>'.length;
  const newContent = content.slice(0, insertPoint) + TOOL_CARD + content.slice(insertPoint);
  fs.writeFileSync(filePath, newContent, 'utf8');
  added++;
}

console.log(`\n=== Quick Tools Sidebar Summary ===`);
console.log(`Files scanned: ${files.length}`);
console.log(`Tool cards added: ${added}`);
console.log(`Skipped (no quiz-cta): ${skippedNoQuizCta}`);
console.log(`Skipped (already has tools): ${skippedAlready}`);
