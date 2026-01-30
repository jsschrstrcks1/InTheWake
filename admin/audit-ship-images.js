#!/usr/bin/env node
/**
 * Audit Ship Images - Identifies ships needing images
 * Scans all ship HTML pages and checks image availability in /assets/ships/
 * Outputs a JSON report of ships needing images.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.join(__dirname, '..');
const SHIPS_DIR = path.join(PROJECT_ROOT, 'ships');
const ASSETS_DIR = path.join(PROJECT_ROOT, 'assets', 'ships');

// Get all image files in assets/ships
function getExistingImages() {
  const images = new Set();
  if (!fs.existsSync(ASSETS_DIR)) return images;
  for (const file of fs.readdirSync(ASSETS_DIR)) {
    if (file.match(/\.(webp|jpg|jpeg|png|gif)$/i)) {
      images.add(file);
    }
  }
  return images;
}

// Scan ship HTML pages for image references and swiper status
function auditShipPages() {
  const existingImages = getExistingImages();
  const results = [];

  const cruiseLines = fs.readdirSync(SHIPS_DIR).filter(d => {
    const p = path.join(SHIPS_DIR, d);
    return fs.statSync(p).isDirectory() && d !== 'assets';
  });

  for (const line of cruiseLines) {
    const lineDir = path.join(SHIPS_DIR, line);
    const htmlFiles = fs.readdirSync(lineDir).filter(f => f.endsWith('.html'));

    for (const htmlFile of htmlFiles) {
      const filePath = path.join(lineDir, htmlFile);
      const content = fs.readFileSync(filePath, 'utf8');
      const slug = htmlFile.replace('.html', '');

      // Check if page has swiper
      const hasSwiper = content.includes('class="swiper firstlook"') || content.includes('swiper-slide');

      // Find all image references in swiper
      const imgRefs = [];
      const imgPattern = /src="\/assets\/ships\/([^"?]+)/g;
      let match;
      while ((match = imgPattern.exec(content)) !== null) {
        imgRefs.push(match[1]);
      }

      // Check which images exist
      const existingRefs = imgRefs.filter(ref => existingImages.has(ref));
      const missingRefs = imgRefs.filter(ref => !existingImages.has(ref));

      // Check if page is a stub
      const isStub = content.includes('coming soon') || content.length < 5000;

      // Check for attribution section
      const hasAttribution = content.includes('class="card attributions"');

      // Extract ship name from <h1> or <title>
      const h1Match = content.match(/<h1[^>]*>([^<]+)<\/h1>/);
      const titleMatch = content.match(/<title>([^<|]+)/);
      const shipName = h1Match ? h1Match[1].trim() : (titleMatch ? titleMatch[1].trim() : slug);

      results.push({
        cruiseLine: line,
        slug,
        shipName,
        filePath,
        hasSwiper,
        isStub,
        hasAttribution,
        totalImageRefs: imgRefs.length,
        existingImages: existingRefs.length,
        missingImages: missingRefs.length,
        missingImageFiles: missingRefs,
        imageRefs: imgRefs,
        needsImages: imgRefs.length < 3 || missingRefs.length > 0
      });
    }
  }

  return results;
}

const results = auditShipPages();

// Sort by need: fewest images first
results.sort((a, b) => a.existingImages - b.existingImages);

// Summary
const needingImages = results.filter(r => r.needsImages && !r.isStub);
const stubs = results.filter(r => r.isStub);
const complete = results.filter(r => !r.needsImages && !r.isStub);

console.log('=== Ship Image Audit Report ===\n');
console.log(`Total ship pages: ${results.length}`);
console.log(`Complete (3+ images): ${complete.length}`);
console.log(`Needing images (non-stub): ${needingImages.length}`);
console.log(`Stub pages: ${stubs.length}`);

console.log('\n=== Ships Needing Images (Non-Stub) ===\n');
for (const ship of needingImages.slice(0, 50)) {
  console.log(`  ${ship.shipName} (${ship.cruiseLine})`);
  console.log(`    Images: ${ship.existingImages}/${ship.totalImageRefs} | Missing: ${ship.missingImages} | Swiper: ${ship.hasSwiper ? 'YES' : 'NO'} | Attribution: ${ship.hasAttribution ? 'YES' : 'NO'}`);
  if (ship.missingImageFiles.length > 0) {
    console.log(`    Missing files: ${ship.missingImageFiles.join(', ')}`);
  }
}

// Save full report
const reportPath = path.join(PROJECT_ROOT, 'admin', 'ship-image-audit.json');
fs.writeFileSync(reportPath, JSON.stringify({
  generated: new Date().toISOString(),
  summary: {
    total: results.length,
    complete: complete.length,
    needingImages: needingImages.length,
    stubs: stubs.length
  },
  needingImages,
  stubs: stubs.map(s => ({ cruiseLine: s.cruiseLine, slug: s.slug, shipName: s.shipName })),
  complete: complete.map(s => ({ cruiseLine: s.cruiseLine, slug: s.slug, shipName: s.shipName, imageCount: s.existingImages }))
}, null, 2));

console.log(`\nFull report saved to: ${reportPath}`);
