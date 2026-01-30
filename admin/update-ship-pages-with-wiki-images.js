#!/usr/bin/env node
/**
 * Update Ship Pages with Wikimedia Commons Images
 * Reads attribution JSON files and updates ship HTML pages with:
 * - New swiper slides for downloaded images
 * - Proper attribution sections in page footer
 *
 * Usage: node admin/update-ship-pages-with-wiki-images.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.join(__dirname, '..');
const ASSETS_DIR = path.join(PROJECT_ROOT, 'assets', 'ships');
const SHIPS_DIR = path.join(PROJECT_ROOT, 'ships');

// Ship slug to cruise line directory mapping
const CRUISE_LINE_MAP = {
  'rcl': 'rcl',
  'carnival': 'carnival',
  'celebrity-cruises': 'celebrity-cruises',
  'celebrity': 'celebrity-cruises',
  'various': null, // needs lookup
  'explora': 'explora',
  'holland-america-line': 'holland-america-line',
  'holland-america': 'holland-america-line',
  'unknown': null,
};

// Ship name to expected HTML file mapping overrides
const SHIP_FILE_OVERRIDES = {
  'Explora I': 'explora/explora-i.html',
  'Explora II': 'explora/explora-ii.html',
  'Celebrity Millennium': 'celebrity-cruises/celebrity-millennium.html',
  'Nieuw Amsterdam': 'holland-america-line/nieuw-amsterdam.html',
  'Volendam': 'holland-america-line/volendam.html',
};

function findShipHtmlFile(shipName, cruiseLine) {
  // Check overrides first
  if (SHIP_FILE_OVERRIDES[shipName]) {
    const filePath = path.join(SHIPS_DIR, SHIP_FILE_OVERRIDES[shipName]);
    if (fs.existsSync(filePath)) return filePath;
  }

  // Generate slug from ship name
  const slug = shipName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  // Try the mapped cruise line directory
  const lineDir = CRUISE_LINE_MAP[cruiseLine] || cruiseLine;
  if (lineDir) {
    const filePath = path.join(SHIPS_DIR, lineDir, `${slug}.html`);
    if (fs.existsSync(filePath)) return filePath;
  }

  // Search all cruise line directories
  const cruiseLines = fs.readdirSync(SHIPS_DIR).filter(d => {
    const p = path.join(SHIPS_DIR, d);
    return fs.statSync(p).isDirectory() && d !== 'assets';
  });

  for (const line of cruiseLines) {
    const filePath = path.join(SHIPS_DIR, line, `${slug}.html`);
    if (fs.existsSync(filePath)) return filePath;
  }

  return null;
}

function generateSwiperSlide(image, shipName) {
  const alt = image.description
    ? `${shipName} — ${image.description.substring(0, 100)}`
    : `${shipName} from Wikimedia Commons`;

  return `            <div class="swiper-slide">
              <figure>
                <img
                  src="${image.path}"
                  alt="${alt.replace(/"/g, '&quot;')}"
                  loading="lazy"
                  decoding="async">
                <figcaption class="tiny">Photo served locally (attribution in page footer).</figcaption>
              </figure>
            </div>`;
}

function generateAttributionHtml(images) {
  const entries = images.map(img => {
    // Clean up artist name (remove long attribution templates)
    let artist = img.artist || 'Unknown';
    // Truncate long artist strings
    if (artist.length > 100) {
      const firstLine = artist.split('\n')[0];
      artist = firstLine.length > 100 ? firstLine.substring(0, 80) + '…' : firstLine;
    }

    const fileTitle = img.originalTitle || img.filename;
    const commonsUrl = img.sourceUrl || `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(img.filename)}`;
    const licenseUrl = img.licenseUrl || '';
    const license = img.license || 'CC BY-SA';

    return `        <li>
          "${fileTitle.replace('File:', '')}" by ${artist} via
          <a href="${commonsUrl}" target="_blank" rel="noopener">Wikimedia Commons</a> —
          licensed under <a href="${licenseUrl}" target="_blank" rel="noopener">${license}</a>.
        </li>`;
  });

  return entries.join('\n');
}

function updateShipPage(htmlPath, attrData) {
  const shipName = attrData.ship;
  const images = attrData.images.filter(img => {
    // Filter out images that aren't actually of this ship
    const fn = img.filename.toLowerCase();
    const slug = shipName.toLowerCase().replace(/\s+/g, '_');
    const slugDash = shipName.toLowerCase().replace(/\s+/g, '-');
    const slugWords = shipName.toLowerCase().split(' ');

    // Check if filename contains the ship name or most significant words
    const hasShipName = fn.includes(slug) || fn.includes(slugDash) ||
      slugWords.every(w => w.length < 3 || fn.includes(w));

    if (!hasShipName) {
      console.log(`    Filtering out non-matching image: ${img.filename}`);
      return false;
    }
    return true;
  });

  if (images.length === 0) {
    console.log(`  No matching images for ${shipName}`);
    return false;
  }

  let content = fs.readFileSync(htmlPath, 'utf8');
  let modified = false;

  // Check if page has a swiper already
  const hasSwiper = content.includes('class="swiper firstlook"') || content.includes('swiper-slide');

  if (hasSwiper) {
    // Add new slides to existing swiper
    // Find the end of the swiper-wrapper div
    const swiperWrapperEnd = content.indexOf('</div>', content.indexOf('swiper-wrapper'));
    if (swiperWrapperEnd === -1) {
      // Try to find before swiper-pagination
      const paginationIdx = content.indexOf('swiper-pagination');
      if (paginationIdx !== -1) {
        // Find the closing </div> before pagination
        const beforePagination = content.lastIndexOf('</div>', paginationIdx);
        if (beforePagination !== -1) {
          const existingSlides = (content.substring(0, beforePagination).match(/swiper-slide/g) || []).length;
          // Only add if we don't have enough slides
          if (existingSlides < 4) {
            const newSlides = images.slice(0, 6 - existingSlides).map(img => generateSwiperSlide(img, shipName)).join('\n\n');
            content = content.substring(0, beforePagination) + '\n\n' + newSlides + '\n          ' + content.substring(beforePagination);
            modified = true;
            console.log(`  Added ${Math.min(images.length, 6 - existingSlides)} slides to existing swiper`);
          }
        }
      }
    } else {
      // Count existing slides
      const swiperSection = content.substring(content.indexOf('swiper-wrapper'), swiperWrapperEnd);
      const existingSlides = (swiperSection.match(/swiper-slide/g) || []).length;

      if (existingSlides < 4) {
        const newSlides = images.slice(0, 6 - existingSlides).map(img => generateSwiperSlide(img, shipName)).join('\n\n');
        content = content.substring(0, swiperWrapperEnd) + '\n\n' + newSlides + '\n          ' + content.substring(swiperWrapperEnd);
        modified = true;
        console.log(`  Added ${Math.min(images.length, 6 - existingSlides)} slides to existing swiper (had ${existingSlides})`);
      } else {
        console.log(`  Swiper already has ${existingSlides} slides, skipping slide addition`);
      }
    }
  } else {
    // Create new swiper section
    // Find insertion point - after "A First Look" heading or after main opening
    let insertIdx = content.indexOf('id="first-look"');
    if (insertIdx === -1) {
      // Look for a good insertion point after the main tag opens
      insertIdx = content.indexOf('<main');
      if (insertIdx !== -1) {
        insertIdx = content.indexOf('>', insertIdx) + 1;
      }
    } else {
      // Find end of the h2 tag
      insertIdx = content.indexOf('</h2>', insertIdx);
      if (insertIdx !== -1) insertIdx += 5;
    }

    if (insertIdx !== -1 && insertIdx > 0) {
      const slides = images.slice(0, 6).map(img => generateSwiperSlide(img, shipName)).join('\n\n');
      const swiperHtml = `

        <div class="swiper firstlook" aria-label="${shipName} photo carousel">
          <div class="swiper-wrapper">

${slides}

          </div>
          <div class="swiper-pagination" aria-hidden="true"></div>
          <div class="swiper-button-prev" aria-label="Previous image"></div>
          <div class="swiper-button-next" aria-label="Next image"></div>
        </div>`;

      content = content.substring(0, insertIdx) + swiperHtml + content.substring(insertIdx);
      modified = true;
      console.log(`  Created new swiper with ${Math.min(images.length, 6)} slides`);
    }
  }

  // Update attribution section
  const newAttrEntries = generateAttributionHtml(images);

  if (content.includes('class="card attributions"')) {
    // Find existing attribution section and update/append
    const attrStart = content.indexOf('class="card attributions"');
    const ulStart = content.indexOf('<ul>', attrStart);
    const ulEnd = content.indexOf('</ul>', attrStart);

    if (ulStart !== -1 && ulEnd !== -1) {
      const existingAttrs = content.substring(ulStart + 4, ulEnd);
      // Check if wiki commons attributions already exist
      if (!existingAttrs.includes('Wikimedia Commons')) {
        content = content.substring(0, ulEnd) + '\n' + newAttrEntries + '\n      ' + content.substring(ulEnd);
        modified = true;
        console.log(`  Added Wikimedia Commons attributions to existing section`);
      } else {
        console.log(`  Wikimedia Commons attributions already present`);
      }
    }
  } else {
    // Create new attribution section before </main>
    const mainClose = content.lastIndexOf('</main>');
    if (mainClose !== -1) {
      const attrSection = `
    <!-- Attribution -->
    <section class="card attributions">
      <h2>Image Attributions</h2>
      <ul>
${newAttrEntries}
      </ul>
    </section>
  `;
      content = content.substring(0, mainClose) + attrSection + '\n' + content.substring(mainClose);
      modified = true;
      console.log(`  Created new attribution section`);
    }
  }

  if (modified) {
    fs.writeFileSync(htmlPath, content, 'utf8');
    console.log(`  ✓ Updated: ${htmlPath}`);
  }

  return modified;
}

// Main
console.log('=== Updating Ship Pages with Wikimedia Commons Images ===\n');

const attrFiles = fs.readdirSync(ASSETS_DIR)
  .filter(f => f.endsWith('-wiki-attributions.json'))
  .sort();

console.log(`Found ${attrFiles.length} attribution files\n`);

let updated = 0;
let skipped = 0;
let notFound = 0;

for (const attrFile of attrFiles) {
  const attrPath = path.join(ASSETS_DIR, attrFile);
  const attrData = JSON.parse(fs.readFileSync(attrPath, 'utf8'));

  console.log(`\nProcessing: ${attrData.ship} (${attrData.cruiseLine})`);
  console.log(`  Images available: ${attrData.images.length}`);

  const htmlPath = findShipHtmlFile(attrData.ship, attrData.cruiseLine);
  if (!htmlPath) {
    console.log(`  ✗ HTML file not found for ${attrData.ship}`);
    notFound++;
    continue;
  }

  console.log(`  HTML: ${path.relative(PROJECT_ROOT, htmlPath)}`);

  if (updateShipPage(htmlPath, attrData)) {
    updated++;
  } else {
    skipped++;
  }
}

console.log(`\n${'='.repeat(50)}`);
console.log(`Updated: ${updated} pages`);
console.log(`Skipped: ${skipped} pages (no changes needed)`);
console.log(`Not found: ${notFound} pages`);
