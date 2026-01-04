#!/usr/bin/env node
/**
 * Port Image Fetcher - Multi-Source with Rate Limiting
 * Soli Deo Gloria
 *
 * Fetches free-to-use images from multiple sources:
 * - Wikimedia Commons (with human-like rate limiting)
 * - Unsplash
 * - Pexels
 * - Pixabay
 *
 * Usage:
 *   node fetch-port-images.js [port-name]     # Fetch for specific port
 *   node fetch-port-images.js --missing       # Fetch for all ports missing images
 *   node fetch-port-images.js --dry-run       # Show what would be fetched
 */

import { readFile, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';
import { load } from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

// =============================================================================
// CONFIGURATION
// =============================================================================

const SOURCES = ['wikimedia', 'unsplash', 'pexels', 'pixabay'];
let currentSourceIndex = 0;

// API Keys (set via environment variables)
const API_KEYS = {
  unsplash: process.env.UNSPLASH_ACCESS_KEY || '',
  pexels: process.env.PEXELS_API_KEY || '',
  pixabay: process.env.PIXABAY_API_KEY || ''
};

// Rate limiting for Wikimedia - random delays to appear human
function getWikimediaDelay() {
  // Random delay between 3 and 60 seconds, with varied distribution
  const delays = [3, 5, 7, 9, 12, 15, 19, 23, 28, 35, 42, 51, 60];
  const randomIndex = Math.floor(Math.random() * delays.length);
  const baseDelay = delays[randomIndex];
  // Add some additional randomness (±2 seconds)
  const jitter = Math.floor(Math.random() * 5) - 2;
  return Math.max(3, baseDelay + jitter) * 1000;
}

// Standard delay for other APIs (respect their limits)
function getApiDelay(source) {
  switch (source) {
    case 'unsplash': return 1000;  // 50 requests/hour for demo
    case 'pexels': return 500;     // 200 requests/hour
    case 'pixabay': return 500;    // 100 requests/min at low tier
    default: return 1000;
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// =============================================================================
// IMAGE SOURCE FETCHERS
// =============================================================================

/**
 * Fetch from Wikimedia Commons
 */
async function fetchWikimedia(searchTerm) {
  const encodedSearch = encodeURIComponent(`${searchTerm} cruise port`);
  const url = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodedSearch}&srnamespace=6&srlimit=5&format=json&origin=*`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'InTheWake/1.0 (https://cruisinginthewake.com; contact@cruisinginthewake.com) Node.js'
      }
    });

    if (!response.ok) return null;

    const data = await response.json();
    const results = data.query?.search || [];

    if (results.length === 0) return null;

    // Get the first image's details
    const firstResult = results[0];
    const title = firstResult.title;

    // Fetch actual image URL
    const imageUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url|extmetadata&format=json&origin=*`;
    const imageResponse = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'InTheWake/1.0 (https://cruisinginthewake.com; contact@cruisinginthewake.com) Node.js'
      }
    });

    if (!imageResponse.ok) return null;

    const imageData = await imageResponse.json();
    const pages = imageData.query?.pages || {};
    const page = Object.values(pages)[0];
    const imageinfo = page?.imageinfo?.[0];

    if (!imageinfo) return null;

    return {
      source: 'wikimedia',
      url: imageinfo.url,
      pageUrl: `https://commons.wikimedia.org/wiki/${encodeURIComponent(title)}`,
      title: title.replace('File:', ''),
      author: imageinfo.extmetadata?.Artist?.value || 'Unknown',
      license: imageinfo.extmetadata?.LicenseShortName?.value || 'CC',
      creditHtml: `<a href="https://commons.wikimedia.org/wiki/${encodeURIComponent(title)}" target="_blank" rel="noopener">Wikimedia Commons</a>`
    };
  } catch (error) {
    console.error(`Wikimedia error: ${error.message}`);
    return null;
  }
}

/**
 * Fetch from Unsplash
 */
async function fetchUnsplash(searchTerm) {
  if (!API_KEYS.unsplash) {
    console.log('  Skipping Unsplash (no API key set)');
    return null;
  }

  const encodedSearch = encodeURIComponent(`${searchTerm} travel`);
  const url = `https://api.unsplash.com/search/photos?query=${encodedSearch}&per_page=5&orientation=landscape`;

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Client-ID ${API_KEYS.unsplash}`
      }
    });

    if (!response.ok) return null;

    const data = await response.json();
    const results = data.results || [];

    if (results.length === 0) return null;

    const photo = results[0];

    return {
      source: 'unsplash',
      url: photo.urls.regular,
      pageUrl: photo.links.html,
      title: photo.description || photo.alt_description || searchTerm,
      author: photo.user.name,
      authorUrl: photo.user.links.html,
      license: 'Unsplash License',
      creditHtml: `Photo by <a href="${photo.user.links.html}?utm_source=inthewake&utm_medium=referral" target="_blank" rel="noopener">${photo.user.name}</a> on <a href="https://unsplash.com/?utm_source=inthewake&utm_medium=referral" target="_blank" rel="noopener">Unsplash</a>`
    };
  } catch (error) {
    console.error(`Unsplash error: ${error.message}`);
    return null;
  }
}

/**
 * Fetch from Pexels
 */
async function fetchPexels(searchTerm) {
  if (!API_KEYS.pexels) {
    console.log('  Skipping Pexels (no API key set)');
    return null;
  }

  const encodedSearch = encodeURIComponent(`${searchTerm} travel`);
  const url = `https://api.pexels.com/v1/search?query=${encodedSearch}&per_page=5&orientation=landscape`;

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': API_KEYS.pexels
      }
    });

    if (!response.ok) return null;

    const data = await response.json();
    const photos = data.photos || [];

    if (photos.length === 0) return null;

    const photo = photos[0];

    return {
      source: 'pexels',
      url: photo.src.large2x || photo.src.large,
      pageUrl: photo.url,
      title: photo.alt || searchTerm,
      author: photo.photographer,
      authorUrl: photo.photographer_url,
      license: 'Pexels License',
      creditHtml: `Photo by <a href="${photo.photographer_url}" target="_blank" rel="noopener">${photo.photographer}</a> on <a href="https://pexels.com" target="_blank" rel="noopener">Pexels</a>`
    };
  } catch (error) {
    console.error(`Pexels error: ${error.message}`);
    return null;
  }
}

/**
 * Fetch from Pixabay
 */
async function fetchPixabay(searchTerm) {
  if (!API_KEYS.pixabay) {
    console.log('  Skipping Pixabay (no API key set)');
    return null;
  }

  const encodedSearch = encodeURIComponent(`${searchTerm} travel`);
  const url = `https://pixabay.com/api/?key=${API_KEYS.pixabay}&q=${encodedSearch}&image_type=photo&orientation=horizontal&per_page=5`;

  try {
    const response = await fetch(url);

    if (!response.ok) return null;

    const data = await response.json();
    const hits = data.hits || [];

    if (hits.length === 0) return null;

    const photo = hits[0];

    return {
      source: 'pixabay',
      url: photo.largeImageURL,
      pageUrl: photo.pageURL,
      title: photo.tags || searchTerm,
      author: photo.user,
      authorUrl: `https://pixabay.com/users/${photo.user}-${photo.user_id}/`,
      license: 'Pixabay License',
      creditHtml: `Image by <a href="https://pixabay.com/users/${photo.user}-${photo.user_id}/" target="_blank" rel="noopener">${photo.user}</a> on <a href="https://pixabay.com" target="_blank" rel="noopener">Pixabay</a>`
    };
  } catch (error) {
    console.error(`Pixabay error: ${error.message}`);
    return null;
  }
}

// =============================================================================
// MAIN FETCH LOGIC WITH SOURCE ROTATION
// =============================================================================

/**
 * Fetch image with source rotation
 */
async function fetchImageWithRotation(portName, preferredSource = null) {
  const sources = preferredSource
    ? [preferredSource, ...SOURCES.filter(s => s !== preferredSource)]
    : [...SOURCES.slice(currentSourceIndex), ...SOURCES.slice(0, currentSourceIndex)];

  for (const source of sources) {
    console.log(`  Trying ${source}...`);

    let result = null;
    let delay = getApiDelay(source);

    switch (source) {
      case 'wikimedia':
        delay = getWikimediaDelay();
        console.log(`    (waiting ${Math.round(delay/1000)}s to respect rate limits)`);
        await sleep(delay);
        result = await fetchWikimedia(portName);
        break;
      case 'unsplash':
        result = await fetchUnsplash(portName);
        break;
      case 'pexels':
        result = await fetchPexels(portName);
        break;
      case 'pixabay':
        result = await fetchPixabay(portName);
        break;
    }

    if (result) {
      // Rotate to next source for fairness
      currentSourceIndex = (SOURCES.indexOf(source) + 1) % SOURCES.length;
      console.log(`    ✓ Found image from ${source}`);
      return result;
    }

    // Small delay between different API attempts
    if (source !== 'wikimedia') {
      await sleep(delay);
    }
  }

  console.log(`    ✗ No image found from any source`);
  return null;
}

// =============================================================================
// PORT PAGE ANALYSIS
// =============================================================================

/**
 * Check if port page needs a hero image
 */
async function portNeedsImage(filepath) {
  try {
    const html = await readFile(filepath, 'utf-8');
    const $ = load(html);

    // Check for hero section
    const heroSection = $('section.port-hero, div.port-hero, .hero-box');
    if (!heroSection.length) return { needs: true, reason: 'no_hero_section' };

    // Check for hero image
    const heroImg = heroSection.find('img');
    if (!heroImg.length) return { needs: true, reason: 'no_hero_image' };

    // Check for valid credit link
    const creditLink = heroSection.find(`
      a[href*="commons.wikimedia.org"],
      a[href*="unsplash.com"],
      a[href*="pexels.com"],
      a[href*="pixabay.com"],
      a[href*="flickr.com"]
    `.replace(/\s+/g, ''));

    if (!creditLink.length) return { needs: true, reason: 'no_credit_link' };

    return { needs: false };
  } catch (error) {
    return { needs: true, reason: 'read_error' };
  }
}

/**
 * Extract port name from filename
 */
function getPortName(filepath) {
  const filename = filepath.split('/').pop().replace('.html', '');
  return filename
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// =============================================================================
// MAIN
// =============================================================================

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const fetchMissing = args.includes('--missing');
  const specificPort = args.find(a => !a.startsWith('--'));

  console.log('═'.repeat(70));
  console.log('Port Image Fetcher - Multi-Source with Rate Limiting');
  console.log('═'.repeat(70));
  console.log();

  if (!API_KEYS.unsplash && !API_KEYS.pexels && !API_KEYS.pixabay) {
    console.log('⚠️  No API keys configured. Only Wikimedia Commons will be used.');
    console.log('   Set environment variables to enable other sources:');
    console.log('   - UNSPLASH_ACCESS_KEY');
    console.log('   - PEXELS_API_KEY');
    console.log('   - PIXABAY_API_KEY');
    console.log();
  }

  let portsToProcess = [];

  if (specificPort) {
    // Find the specific port file
    const portFiles = await glob(join(PROJECT_ROOT, 'ports', `*${specificPort}*.html`));
    if (portFiles.length === 0) {
      console.log(`No port file found matching: ${specificPort}`);
      process.exit(1);
    }
    portsToProcess = portFiles;
  } else if (fetchMissing) {
    // Find all ports missing images
    const allPorts = await glob(join(PROJECT_ROOT, 'ports', '*.html'));
    console.log(`Scanning ${allPorts.length} port pages for missing images...`);

    for (const port of allPorts) {
      const status = await portNeedsImage(port);
      if (status.needs) {
        portsToProcess.push(port);
      }
    }

    console.log(`Found ${portsToProcess.length} ports needing images\n`);
  } else {
    console.log('Usage:');
    console.log('  node fetch-port-images.js <port-name>   # Fetch for specific port');
    console.log('  node fetch-port-images.js --missing     # Fetch for all missing');
    console.log('  node fetch-port-images.js --dry-run     # Show what would be fetched');
    console.log();
    console.log('Environment variables for API keys:');
    console.log('  UNSPLASH_ACCESS_KEY, PEXELS_API_KEY, PIXABAY_API_KEY');
    process.exit(0);
  }

  if (dryRun) {
    console.log('DRY RUN - Would fetch images for:');
    portsToProcess.forEach(p => console.log(`  - ${getPortName(p)}`));
    process.exit(0);
  }

  // Process each port
  const results = [];

  for (let i = 0; i < portsToProcess.length; i++) {
    const port = portsToProcess[i];
    const portName = getPortName(port);

    console.log(`[${i + 1}/${portsToProcess.length}] ${portName}`);

    const image = await fetchImageWithRotation(portName);

    if (image) {
      results.push({
        port: portName,
        file: port,
        image
      });
    }

    // Progress indication
    if ((i + 1) % 10 === 0) {
      console.log(`\n--- Progress: ${i + 1}/${portsToProcess.length} (${results.length} images found) ---\n`);
    }
  }

  // Summary
  console.log('\n' + '═'.repeat(70));
  console.log('SUMMARY');
  console.log('═'.repeat(70));
  console.log(`Ports processed: ${portsToProcess.length}`);
  console.log(`Images found: ${results.length}`);

  // Source breakdown
  const bySource = {};
  results.forEach(r => {
    bySource[r.image.source] = (bySource[r.image.source] || 0) + 1;
  });
  console.log('\nBy source:');
  Object.entries(bySource).forEach(([source, count]) => {
    console.log(`  ${source}: ${count}`);
  });

  // Write results to JSON for manual review
  if (results.length > 0) {
    const outputPath = join(__dirname, 'fetched-images.json');
    await writeFile(outputPath, JSON.stringify(results, null, 2));
    console.log(`\nResults saved to: ${outputPath}`);
    console.log('Review the results before applying to port pages.');
  }
}

main().catch(console.error);
