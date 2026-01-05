#!/usr/bin/env node
/**
 * Batch Fix: Add recent-rail-nav-top element
 * Soli Deo Gloria
 *
 * Adds #recent-rail-nav-top navigation element to the right rail.
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

const NAV_TOP = `
      <!-- Recent Articles Navigation (Top) -->
      <section class="card" id="recent-rail-nav-top" aria-labelledby="nav-top-title">
        <h3 id="nav-top-title">Quick Navigation</h3>
        <nav aria-label="Page sections">
          <ul class="rail-links">
            <li><a href="#first-look">First Look</a></li>
            <li><a href="#dining-card">Dining</a></li>
            <li><a href="#logbook">Logbook</a></li>
            <li><a href="#video-highlights">Videos</a></li>
            <li><a href="#deck-plans">Deck Plans</a></li>
            <li><a href="#faq">FAQ</a></li>
          </ul>
        </nav>
      </section>`;

function addNavTop(html) {
  // Skip if already has nav-top
  if (html.includes('id="recent-rail-nav-top"')) {
    return { html, added: false };
  }

  // Find the aside/rail section and add at the beginning
  if (html.includes('<aside') && html.includes('class="rail')) {
    // Add after the aside opening tag and any attributes
    const asidePattern = /(<aside[^>]*class="[^"]*rail[^"]*"[^>]*>)/i;
    if (asidePattern.test(html)) {
      const fixed = html.replace(asidePattern, `$1${NAV_TOP}`);
      return { html: fixed, added: true };
    }
  }

  // Try alternative pattern with role="complementary"
  if (html.includes('role="complementary"')) {
    const asidePattern = /(<aside[^>]*role="complementary"[^>]*>)/i;
    if (asidePattern.test(html)) {
      const fixed = html.replace(asidePattern, `$1${NAV_TOP}`);
      return { html: fixed, added: true };
    }
  }

  return { html, added: false };
}

async function processFile(filepath) {
  const html = await readFile(filepath, 'utf8');
  const result = addNavTop(html);

  if (result.added) {
    await writeFile(filepath, result.html, 'utf8');
    return { status: 'fixed' };
  }

  return { status: html.includes('recent-rail-nav-top') ? 'already-has' : 'no-rail' };
}

async function processCruiseLine(cruiseLine) {
  const lineDir = join(SHIPS_DIR, cruiseLine);
  let files;
  try {
    files = await readdir(lineDir);
  } catch (e) {
    return { cruiseLine, error: e.message, fixed: 0 };
  }

  const htmlFiles = files.filter(f =>
    f.endsWith('.html') &&
    f !== 'index.html' &&
    !f.includes('unnamed')
  );

  let fixed = 0, alreadyHas = 0;

  for (const file of htmlFiles) {
    const filepath = join(lineDir, file);
    const result = await processFile(filepath);

    if (result.status === 'fixed') {
      console.log(`  ✅ ${file}: Added recent-rail-nav-top`);
      fixed++;
    } else if (result.status === 'already-has') {
      alreadyHas++;
    }
  }

  return { cruiseLine, fixed, alreadyHas, total: htmlFiles.length };
}

async function main() {
  console.log('Batch Fix: Add recent-rail-nav-top');
  console.log('===================================\n');

  let totalFixed = 0;
  let totalAlreadyHas = 0;

  for (const cruiseLine of CRUISE_LINES) {
    console.log(`\n[${cruiseLine}]`);
    const result = await processCruiseLine(cruiseLine);

    if (result.error) {
      console.log(`  ⚠️ Error: ${result.error}`);
    } else {
      console.log(`  Summary: ${result.fixed} added, ${result.alreadyHas} already have it`);
      totalFixed += result.fixed;
      totalAlreadyHas += result.alreadyHas;
    }
  }

  console.log('\n===================================');
  console.log(`Total: ${totalFixed} fixed, ${totalAlreadyHas} already had it`);
}

main().catch(console.error);
