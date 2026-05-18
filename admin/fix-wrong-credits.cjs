#!/usr/bin/env node
/**
 * fix-wrong-credits.cjs — Correct mis-attributed photo credits
 * Soli Deo Gloria
 *
 * Uses the Image Credits section (id="credits") as the per-image source
 * of truth, then fixes any photo-credit spans that don't match.
 *
 * Usage:
 *   node admin/fix-wrong-credits.cjs --dry-run
 *   node admin/fix-wrong-credits.cjs
 */

const fs = require('fs');
const path = require('path');

const PORTS_DIR = path.join(__dirname, '..', 'ports');

const CREDIT_HTML = {
  fom:     'Photo © <a href="https://www.flickersofmajesty.com" target="_blank" rel="noopener">Flickers of Majesty</a>',
  wiki:    'Photo: <a href="https://commons.wikimedia.org" target="_blank" rel="noopener">Wikimedia Commons</a>',
  pexels:  'Photo: <a href="https://www.pexels.com" target="_blank" rel="noopener">Pexels</a> (CC0)',
  unsplash:'Photo: <a href="https://unsplash.com" target="_blank" rel="noopener">Unsplash</a>',
  flickr:  'Photo: <a href="https://www.flickr.com" target="_blank" rel="noopener">Flickr</a>',
  pixabay: 'Photo: <a href="https://pixabay.com" target="_blank" rel="noopener">Pixabay</a>',
};

function detectSource(href) {
  href = href.toLowerCase();
  if (href.includes('flickersofmajesty')) return 'fom';
  if (href.includes('wikimedia') || href.includes('commons')) return 'wiki';
  if (href.includes('pexels')) return 'pexels';
  if (href.includes('unsplash')) return 'unsplash';
  if (href.includes('flickr')) return 'flickr';
  if (href.includes('pixabay')) return 'pixabay';
  return null;
}

function detectCreditSource(creditHtml) {
  creditHtml = creditHtml.toLowerCase();
  if (creditHtml.includes('flickersofmajesty')) return 'fom';
  if (creditHtml.includes('wikimedia') || creditHtml.includes('commons')) return 'wiki';
  if (creditHtml.includes('pexels')) return 'pexels';
  if (creditHtml.includes('unsplash')) return 'unsplash';
  if (creditHtml.includes('flickr')) return 'flickr';
  if (creditHtml.includes('pixabay')) return 'pixabay';
  return 'unknown';
}

function processFile(filePath, dryRun) {
  let html = fs.readFileSync(filePath, 'utf8');
  const fname = path.basename(filePath);

  // Parse credits section for per-image source of truth
  const creditsMatch = html.match(/id="credits"[\s\S]*?<\/details>/i);
  if (!creditsMatch) return { fixed: 0 };

  const imageSource = {};
  const creditRe = /<strong>([^<]+)<\/strong>[^<]*<a[^>]*href="([^"]+)"/g;
  let m;
  while ((m = creditRe.exec(creditsMatch[0])) !== null) {
    const imgName = m[1].trim();
    const source = detectSource(m[2]);
    if (source) {
      imageSource[imgName] = source;
      // Also store without extension
      imageSource[imgName.replace(/\.webp$/, '')] = source;
    }
  }

  if (Object.keys(imageSource).length === 0) return { fixed: 0 };

  let fixed = 0;

  // Walk each figure, check if its photo-credit matches the credits section
  html = html.replace(/<figure[^>]*>([\s\S]*?)<\/figure>/gi, (figMatch, figContent) => {
    const imgMatch = figContent.match(/src="[^"]*?([^/"]+\.webp)"/);
    const creditMatch = figContent.match(/<span class="photo-credit">([\s\S]*?)<\/span>/);

    if (!imgMatch || !creditMatch) return figMatch;

    const imgName = imgMatch[1];
    const currentSource = detectCreditSource(creditMatch[1]);
    const correctSource = imageSource[imgName] || imageSource[imgName.replace(/\.webp$/, '')];

    if (!correctSource || currentSource === correctSource) return figMatch;

    // Wrong attribution — fix it
    fixed++;
    const newCredit = CREDIT_HTML[correctSource];
    return figMatch.replace(creditMatch[0], `<span class="photo-credit">${newCredit}</span>`);
  });

  if (fixed > 0 && !dryRun) {
    fs.writeFileSync(filePath, html, 'utf8');
  }

  return { fixed };
}

function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');

  console.log(`Fix Wrong Credits — ${dryRun ? 'DRY RUN' : 'LIVE'}\n`);

  const files = fs.readdirSync(PORTS_DIR)
    .filter(f => f.endsWith('.html'))
    .map(f => path.join(PORTS_DIR, f));

  let totalFixed = 0;
  let pagesFixed = 0;

  for (const filePath of files) {
    const { fixed } = processFile(filePath, dryRun);
    if (fixed > 0) {
      pagesFixed++;
      totalFixed += fixed;
      console.log(`  ${path.basename(filePath)}: ${fixed} corrected`);
    }
  }

  console.log(`\n  Total corrected: ${totalFixed} across ${pagesFixed} pages`);
}

main();
