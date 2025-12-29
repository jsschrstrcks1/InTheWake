#!/usr/bin/env node
/**
 * Fix hero position in port pages
 * Moves hero from body top to inside article card
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as cheerio from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const portsToFix = [
  'abu-dhabi', 'acapulco', 'adelaide', 'agadir', 'akureyri', 'amber-cove',
  'anchorage', 'antigua', 'aqaba', 'ascension', 'cozumel', 'ft-lauderdale',
  'galveston', 'grand-cayman', 'honolulu', 'lanzarote', 'los-angeles', 'miami',
  'nassau', 'new-orleans', 'port-canaveral', 'san-juan', 'seattle', 'tampa'
];

function fixHeroPosition(portName) {
  const filePath = path.join(__dirname, '..', 'ports', `${portName}.html`);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠ File not found: ${filePath}`);
    return false;
  }

  let html = fs.readFileSync(filePath, 'utf8');
  const $ = cheerio.load(html, { decodeEntities: false });

  // Find hero section
  const heroSection = $('section.port-hero, section#hero, .port-hero').first();

  if (!heroSection.length) {
    console.log(`⚠ No hero found in ${portName}`);
    return false;
  }

  // Check if hero is already inside card
  const heroInCard = heroSection.closest('article.card, .card');
  if (heroInCard.length) {
    console.log(`✓ Hero already in card for ${portName}`);
    return true;
  }

  // Extract hero data
  const heroImg = heroSection.find('img').first();
  const imgSrc = heroImg.attr('src') || '';
  const imgAlt = heroImg.attr('alt') || '';

  const heroTitle = heroSection.find('.port-hero-title, h1').first().text().trim();
  const heroCredit = heroSection.find('.port-hero-credit').html() || '';

  // Check for Wikimedia credit
  let creditHtml = heroCredit;
  const hasWikimediaCredit = heroCredit.toLowerCase().includes('wikimedia') ||
                             heroCredit.toLowerCase().includes('commons');

  if (!hasWikimediaCredit) {
    // Add generic Wikimedia credit if missing
    creditHtml = `Photo: <a href="https://commons.wikimedia.org" target="_blank" rel="noopener">Wikimedia Commons</a>`;
  }

  // Remove hero from current position
  heroSection.remove();

  // Find article card
  const articleCard = $('article.card').first();
  if (!articleCard.length) {
    console.log(`⚠ No article.card found in ${portName}`);
    return false;
  }

  // Get the display name for title
  const displayName = heroTitle || portName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  // Create new hero HTML with inline styles
  const newHeroHtml = `
        <!-- Hero section inside card -->
        <section class="port-hero" id="hero" aria-label="${displayName} cruise port hero image" style="margin: -1.5rem -1.5rem 1.5rem -1.5rem; border-radius: 12px 12px 0 0; overflow: hidden;">
          <div class="port-hero-image" style="position: relative;">
            <img src="${imgSrc}" alt="${imgAlt}" loading="eager" fetchpriority="high" style="width: 100%; height: 300px; object-fit: cover;"/>
            <div class="port-hero-overlay" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
              <h1 class="port-hero-title" style="font-family: 'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif; font-size: clamp(2.5rem, 8vw, 5rem); font-weight: 700; color: #fff; text-shadow: 2px 2px 8px rgba(0,0,0,0.7), 0 0 40px rgba(0,0,0,0.5); letter-spacing: 0.12em; text-transform: uppercase; margin: 0;">${displayName}</h1>
            </div>
          </div>
          <p class="port-hero-credit" style="text-align: right; font-size: 0.75rem; margin: 0.5rem 1rem 0; color: #666;">${creditHtml}</p>
        </section>

`;

  // Insert at beginning of article card
  articleCard.prepend(newHeroHtml);

  // Write back
  fs.writeFileSync(filePath, $.html());
  console.log(`✓ Fixed hero in ${portName}`);
  return true;
}

// Main
console.log('Fixing hero positions in port pages...\n');

let fixed = 0;
let failed = 0;

for (const port of portsToFix) {
  try {
    if (fixHeroPosition(port)) {
      fixed++;
    } else {
      failed++;
    }
  } catch (err) {
    console.log(`✗ Error fixing ${port}: ${err.message}`);
    failed++;
  }
}

console.log(`\nDone! Fixed: ${fixed}, Failed: ${failed}`);
