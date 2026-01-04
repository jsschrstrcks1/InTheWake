#!/usr/bin/env node
/**
 * Batch Fix: Add loading="lazy" to Images
 * Soli Deo Gloria
 *
 * Adds loading="lazy" attribute to all <img> tags that don't have it.
 * This improves page load performance by deferring off-screen images.
 */

import { readFile, writeFile, readdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SHIPS_DIR = join(__dirname, '..', 'ships');

const CRUISE_LINES = [
  'carnival', 'celebrity-cruises', 'costa', 'cunard', 'explora-journeys',
  'holland-america-line', 'msc', 'norwegian', 'oceania', 'princess',
  'rcl', 'regent', 'seabourn', 'silversea', 'virgin-voyages'
];

function addLazyLoading(html) {
  let fixCount = 0;

  // Match img tags that don't have loading attribute
  // Don't modify images that already have loading="lazy" or loading="eager"
  const result = html.replace(/<img\s+(?![^>]*\bloading\s*=)([^>]*)>/gi, (match, attrs) => {
    // Skip if it's a tiny inline image or data URI (likely critical)
    if (attrs.includes('data:image')) {
      return match;
    }
    fixCount++;
    return `<img loading="lazy" ${attrs}>`;
  });

  return { html: result, fixCount };
}

async function processFile(filepath) {
  let html = await readFile(filepath, 'utf8');
  const { html: fixedHtml, fixCount } = addLazyLoading(html);

  if (fixCount > 0) {
    await writeFile(filepath, fixedHtml, 'utf8');
    return { status: 'fixed', count: fixCount };
  }

  return { status: 'unchanged', count: 0 };
}

async function processCruiseLine(cruiseLine) {
  const lineDir = join(SHIPS_DIR, cruiseLine);
  let files;
  try {
    files = await readdir(lineDir);
  } catch (e) {
    return { cruiseLine, error: e.message, fixed: 0, images: 0 };
  }

  const htmlFiles = files.filter(f =>
    f.endsWith('.html') &&
    f !== 'index.html' &&
    !f.includes('unnamed')
  );

  let fixed = 0, totalImages = 0;

  for (const file of htmlFiles) {
    const filepath = join(lineDir, file);
    const result = await processFile(filepath);

    if (result.status === 'fixed') {
      console.log(`  ✅ ${file}: Added lazy loading to ${result.count} images`);
      fixed++;
      totalImages += result.count;
    }
  }

  return { cruiseLine, fixed, images: totalImages, total: htmlFiles.length };
}

async function main() {
  console.log('Batch Fix: Add loading="lazy" to Images');
  console.log('========================================\n');

  let totalFixed = 0;
  let totalImages = 0;
  let totalFiles = 0;

  for (const cruiseLine of CRUISE_LINES) {
    console.log(`\n[${cruiseLine}]`);
    const result = await processCruiseLine(cruiseLine);

    if (result.error) {
      console.log(`  ⚠️ Error: ${result.error}`);
    } else {
      console.log(`  Summary: ${result.fixed} files fixed, ${result.images} images updated`);
      totalFixed += result.fixed;
      totalImages += result.images;
      totalFiles += result.total;
    }
  }

  console.log('\n========================================');
  console.log(`Total: ${totalFixed} files fixed, ${totalImages} images updated across ${totalFiles} ship pages`);
}

main().catch(console.error);
