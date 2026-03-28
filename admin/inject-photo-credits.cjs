#!/usr/bin/env node
/**
 * inject-photo-credits.cjs — Add photo-credit attribution to gallery figures
 * Soli Deo Gloria
 *
 * Finds <figure> elements without photo-credit spans and adds them.
 * Determines source from page context (FOM, Wikimedia, Pexels).
 *
 * Usage:
 *   node admin/inject-photo-credits.cjs --dry-run      # Preview changes
 *   node admin/inject-photo-credits.cjs                 # Apply changes
 *   node admin/inject-photo-credits.cjs --file ports/barbados.html  # Single file
 */

const fs = require('fs');
const path = require('path');

const PORTS_DIR = path.join(__dirname, '..', 'ports');

const CREDIT_TEMPLATES = {
  fom: '<span class="photo-credit">Photo © <a href="https://www.flickersofmajesty.com" target="_blank" rel="noopener">Flickers of Majesty</a></span>',
  wiki: '<span class="photo-credit">Photo: <a href="https://commons.wikimedia.org" target="_blank" rel="noopener">Wikimedia Commons</a></span>',
  pexels: '<span class="photo-credit">Photo: <a href="https://www.pexels.com" target="_blank" rel="noopener">Pexels</a> (CC0)</span>',
  unsplash: '<span class="photo-credit">Photo: <a href="https://unsplash.com" target="_blank" rel="noopener">Unsplash</a></span>',
};

function detectPageSource(html) {
  // Determine the dominant image source for this page
  // Check hero credit first (most reliable indicator)
  if (/flickersofmajesty\.com/i.test(html)) return 'fom';
  if (/Flickers of Majesty/i.test(html)) return 'fom';
  if (/pexels\.com/i.test(html) && !/wikimedia/i.test(html)) return 'pexels';
  if (/unsplash\.com/i.test(html) && !/wikimedia/i.test(html)) return 'unsplash';
  if (/wikimedia/i.test(html) || /commons\.wikimedia/i.test(html)) return 'wiki';
  // Default to wiki for unknown (safest — CC-BY-SA requires attribution)
  return 'wiki';
}

function injectCredits(html, file, dryRun) {
  const source = detectPageSource(html);
  const creditSpan = CREDIT_TEMPLATES[source];
  let count = 0;

  // Find <figure> elements that have <figcaption> but no photo-credit
  const fixed = html.replace(
    /(<figure[^>]*>[\s\S]*?<figcaption>)([\s\S]*?)(<\/figcaption>)/gi,
    (match, before, captionContent, after) => {
      if (/photo-credit/i.test(captionContent)) return match; // Already has credit
      count++;
      return before + captionContent.trimEnd() + ' ' + creditSpan + after;
    }
  );

  // Also handle figures with figcaption that have no content yet (bare figcaptions)
  // Pattern: <figcaption></figcaption> or <figcaption>\n</figcaption>
  const fixed2 = fixed.replace(
    /(<figcaption>)(\s*)(<\/figcaption>)/gi,
    (match, open, ws, close) => {
      if (count > 100) return match; // Safety limit
      count++;
      return open + creditSpan + close;
    }
  );

  if (count > 0 && !dryRun) {
    fs.writeFileSync(file, fixed2, 'utf8');
  }

  return { count, source };
}

function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const fileIdx = args.indexOf('--file');
  const singleFile = fileIdx !== -1 ? args[fileIdx + 1] : null;

  let files;
  if (singleFile) {
    files = [path.resolve(singleFile)];
  } else {
    files = fs.readdirSync(PORTS_DIR)
      .filter(f => f.endsWith('.html'))
      .map(f => path.join(PORTS_DIR, f));
  }

  console.log(`Photo Credit Injection — ${dryRun ? 'DRY RUN' : 'LIVE'}\n`);

  let totalFixed = 0;
  let totalPages = 0;
  const bySrc = { fom: 0, wiki: 0, pexels: 0, unsplash: 0 };

  for (const filePath of files) {
    const html = fs.readFileSync(filePath, 'utf8');
    const { count, source } = injectCredits(html, filePath, dryRun);
    if (count > 0) {
      totalFixed += count;
      totalPages++;
      bySrc[source] = (bySrc[source] || 0) + count;
      if (totalPages <= 20 || count > 5) {
        console.log(`  ${path.basename(filePath)}: +${count} credits (${source})`);
      }
    }
  }

  console.log(`\n${'─'.repeat(50)}`);
  console.log(`  Pages ${dryRun ? 'would be ' : ''}modified: ${totalPages}`);
  console.log(`  Credits ${dryRun ? 'would be ' : ''}added: ${totalFixed}`);
  console.log(`  By source:`);
  for (const [src, count] of Object.entries(bySrc)) {
    if (count > 0) console.log(`    ${src}: ${count}`);
  }
  console.log(`${'─'.repeat(50)}`);
}

main();
