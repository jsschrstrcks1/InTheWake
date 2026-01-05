#!/usr/bin/env node
/**
 * Multi-Source Ship Image Fetcher - ITW-IMG-001 v1.1
 * Soli Deo Gloria
 *
 * Fetches properly licensed images from multiple sources for cruise ships:
 * - Wikimedia Commons (CC BY, CC BY-SA, Public Domain)
 * - Unsplash (Unsplash License - free for commercial use)
 * - Pexels (Pexels License - free for commercial use)
 * - Pixabay (Pixabay License - free for commercial use)
 *
 * Uses human-like timing patterns to respect rate limits.
 * Falls back to alternative sources if primary source fails.
 *
 * Usage:
 *   node admin/fetch-ship-images.js --ship "Wonder of the Seas" --cruise-line rcl
 *   node admin/fetch-ship-images.js --batch --limit 5
 *   node admin/fetch-ship-images.js --source unsplash --ship "Cruise Ship"
 *
 * Environment variables (optional, for API access):
 *   UNSPLASH_ACCESS_KEY - Unsplash API key
 *   PEXELS_API_KEY - Pexels API key
 *   PIXABAY_API_KEY - Pixabay API key
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.join(__dirname, '..');
const SHIPS_IMG_DIR = path.join(PROJECT_ROOT, 'assets', 'ships');

// API Keys (from environment variables)
const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY || '';
const PEXELS_KEY = process.env.PEXELS_API_KEY || '';
const PIXABAY_KEY = process.env.PIXABAY_API_KEY || '';

// Image sources configuration
const SOURCES = {
  wikimedia: {
    name: 'Wikimedia Commons',
    license: 'CC BY-SA / Public Domain',
    requiresKey: false,
    enabled: true
  },
  unsplash: {
    name: 'Unsplash',
    license: 'Unsplash License (free for commercial use)',
    requiresKey: true,
    enabled: !!UNSPLASH_KEY
  },
  pexels: {
    name: 'Pexels',
    license: 'Pexels License (free for commercial use)',
    requiresKey: true,
    enabled: !!PEXELS_KEY
  },
  pixabay: {
    name: 'Pixabay',
    license: 'Pixabay License (free for commercial use)',
    requiresKey: true,
    enabled: !!PIXABAY_KEY
  }
};

// Human-like delays (in ms) - varied to avoid detection
const DELAY_PATTERNS = [
  [3000, 7000, 4000, 12000, 5000, 9000, 6000, 15000],
  [5000, 11000, 4000, 8000, 13000, 6000, 9000, 7000],
  [4000, 9000, 6000, 14000, 5000, 10000, 7000, 8000],
  [6000, 8000, 5000, 11000, 7000, 13000, 4000, 10000],
  [7000, 5000, 9000, 6000, 12000, 8000, 14000, 5000]
];

// Get a random delay within a range (adds extra randomness)
function getHumanDelay(baseDelay) {
  const jitter = Math.floor(Math.random() * 2000) - 1000; // +/- 1 second
  return Math.max(2000, baseDelay + jitter);
}

// Select a delay pattern for this session
function getDelayPattern() {
  return DELAY_PATTERNS[Math.floor(Math.random() * DELAY_PATTERNS.length)];
}

// Sleep with human-like timing
async function humanSleep(delayMs) {
  const actualDelay = getHumanDelay(delayMs);
  console.log(`  Waiting ${(actualDelay / 1000).toFixed(1)}s...`);
  return new Promise(resolve => setTimeout(resolve, actualDelay));
}

// Make HTTPS request
function httpsGet(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'InTheWake/1.0 (https://cruisinginthewake.com; cruise-ship-reference) Node.js',
        ...headers
      }
    };

    const parsedUrl = new URL(url);
    options.hostname = parsedUrl.hostname;
    options.path = parsedUrl.pathname + parsedUrl.search;

    https.get(url, options, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return httpsGet(res.headers.location, headers).then(resolve).catch(reject);
      }

      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, data }));
    }).on('error', reject);
  });
}

// Download file
function downloadFile(url, destPath, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'InTheWake/1.0 (https://cruisinginthewake.com; cruise-ship-reference) Node.js',
        ...headers
      }
    };

    const file = fs.createWriteStream(destPath);
    https.get(url, options, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        try { fs.unlinkSync(destPath); } catch {}
        return downloadFile(res.headers.location, destPath, headers).then(resolve).catch(reject);
      }

      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      try { fs.unlinkSync(destPath); } catch {}
      reject(err);
    });
  });
}

// ====== SOURCE: WIKIMEDIA COMMONS ======
async function searchWikimediaCommons(shipName, cruiseLine) {
  const searchTerms = [
    shipName,
    `${shipName} cruise ship`,
    `${shipName} ${cruiseLine}`
  ];

  const allResults = [];

  for (const term of searchTerms) {
    const encodedTerm = encodeURIComponent(term);
    const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodedTerm}&srnamespace=6&srlimit=20&format=json`;

    try {
      const response = await httpsGet(apiUrl);
      const data = JSON.parse(response.data);

      if (data.query && data.query.search) {
        for (const result of data.query.search) {
          if (result.title.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
            allResults.push({
              title: result.title,
              source: 'wikimedia',
              searchTerm: term
            });
          }
        }
      }
    } catch (e) {
      console.error(`  Wikimedia search failed for "${term}":`, e.message);
    }

    await humanSleep(2000);
  }

  const seen = new Set();
  return allResults.filter(r => {
    if (seen.has(r.title)) return false;
    seen.add(r.title);
    return true;
  });
}

async function getWikimediaImageInfo(title) {
  const encodedTitle = encodeURIComponent(title);
  const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodedTitle}&prop=imageinfo&iiprop=url|size|extmetadata&format=json`;

  try {
    const response = await httpsGet(apiUrl);
    const data = JSON.parse(response.data);

    const pages = data.query?.pages;
    if (!pages) return null;

    const page = Object.values(pages)[0];
    if (!page.imageinfo || page.imageinfo.length === 0) return null;

    const info = page.imageinfo[0];
    const meta = info.extmetadata || {};

    const license = meta.LicenseShortName?.value || '';
    const acceptableLicenses = ['CC BY', 'CC BY-SA', 'CC0', 'Public domain', 'GFDL'];
    const isFreeLicense = acceptableLicenses.some(l => license.includes(l));

    if (!isFreeLicense) {
      console.log(`  Skipping ${title}: License "${license}" not acceptable`);
      return null;
    }

    return {
      url: info.url,
      width: info.width,
      height: info.height,
      license,
      licenseUrl: meta.LicenseUrl?.value || '',
      artist: meta.Artist?.value || 'Unknown',
      source: 'Wikimedia Commons'
    };
  } catch (e) {
    console.error(`  Error getting Wikimedia info:`, e.message);
    return null;
  }
}

// ====== SOURCE: UNSPLASH ======
async function searchUnsplash(query) {
  if (!UNSPLASH_KEY) return [];

  const encodedQuery = encodeURIComponent(query);
  const apiUrl = `https://api.unsplash.com/search/photos?query=${encodedQuery}&per_page=20`;

  try {
    const response = await httpsGet(apiUrl, { 'Authorization': `Client-ID ${UNSPLASH_KEY}` });
    const data = JSON.parse(response.data);

    return (data.results || []).map(photo => ({
      id: photo.id,
      url: photo.urls.regular,
      downloadUrl: photo.links.download_location,
      width: photo.width,
      height: photo.height,
      artist: photo.user.name,
      source: 'Unsplash',
      license: 'Unsplash License'
    }));
  } catch (e) {
    console.error(`  Unsplash search failed:`, e.message);
    return [];
  }
}

// ====== SOURCE: PEXELS ======
async function searchPexels(query) {
  if (!PEXELS_KEY) return [];

  const encodedQuery = encodeURIComponent(query);
  const apiUrl = `https://api.pexels.com/v1/search?query=${encodedQuery}&per_page=20`;

  try {
    const response = await httpsGet(apiUrl, { 'Authorization': PEXELS_KEY });
    const data = JSON.parse(response.data);

    return (data.photos || []).map(photo => ({
      id: photo.id,
      url: photo.src.large2x || photo.src.large,
      width: photo.width,
      height: photo.height,
      artist: photo.photographer,
      source: 'Pexels',
      license: 'Pexels License'
    }));
  } catch (e) {
    console.error(`  Pexels search failed:`, e.message);
    return [];
  }
}

// ====== SOURCE: PIXABAY ======
async function searchPixabay(query) {
  if (!PIXABAY_KEY) return [];

  const encodedQuery = encodeURIComponent(query);
  const apiUrl = `https://pixabay.com/api/?key=${PIXABAY_KEY}&q=${encodedQuery}&image_type=photo&per_page=20`;

  try {
    const response = await httpsGet(apiUrl);
    const data = JSON.parse(response.data);

    return (data.hits || []).map(photo => ({
      id: photo.id,
      url: photo.largeImageURL,
      width: photo.imageWidth,
      height: photo.imageHeight,
      artist: photo.user,
      source: 'Pixabay',
      license: 'Pixabay License'
    }));
  } catch (e) {
    console.error(`  Pixabay search failed:`, e.message);
    return [];
  }
}

// Convert image to webp format
async function convertToWebp(inputPath, outputPath) {
  try {
    try {
      await execAsync(`cwebp -q 85 "${inputPath}" -o "${outputPath}"`);
    } catch {
      await execAsync(`convert "${inputPath}" -quality 85 "${outputPath}"`);
    }
    return true;
  } catch (e) {
    console.error(`  Error converting to webp:`, e.message);
    return false;
  }
}

// Generate safe filename
function generateFilename(title, source) {
  let name = title.replace(/^File:/, '');
  const ext = path.extname(name);
  name = name.replace(ext, '');
  name = name.replace(/[^a-zA-Z0-9_-]/g, '_');
  name = name.replace(/_+/g, '_');
  name = name.substring(0, 100);
  return `${name}.webp`;
}

// Main function to fetch images for a ship
async function fetchImagesForShip(shipName, cruiseLine, imagesNeeded = 8, preferredSource = null) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Fetching images for: ${shipName} (${cruiseLine})`);
  console.log(`Images needed: ${imagesNeeded}`);
  console.log('='.repeat(60));

  // Show available sources
  console.log('\nAvailable sources:');
  for (const [key, src] of Object.entries(SOURCES)) {
    const status = src.enabled ? '✓' : (src.requiresKey ? '✗ (needs API key)' : '✗');
    console.log(`  ${status} ${src.name}`);
  }

  const delays = getDelayPattern();
  let delayIndex = 0;
  const downloadedImages = [];

  // Determine source order
  const sourceOrder = preferredSource
    ? [preferredSource, ...Object.keys(SOURCES).filter(s => s !== preferredSource)]
    : Object.keys(SOURCES);

  for (const source of sourceOrder) {
    if (downloadedImages.length >= imagesNeeded) break;
    if (!SOURCES[source]?.enabled) continue;

    console.log(`\nSearching ${SOURCES[source].name}...`);
    let results = [];

    switch (source) {
      case 'wikimedia':
        results = await searchWikimediaCommons(shipName, cruiseLine);
        break;
      case 'unsplash':
        results = await searchUnsplash(`${shipName} cruise ship`);
        break;
      case 'pexels':
        results = await searchPexels(`${shipName} cruise ship`);
        break;
      case 'pixabay':
        results = await searchPixabay(`${shipName} cruise ship`);
        break;
    }

    console.log(`  Found ${results.length} potential images`);

    for (const result of results) {
      if (downloadedImages.length >= imagesNeeded) break;

      await humanSleep(delays[delayIndex % delays.length]);
      delayIndex++;

      let imageInfo;
      if (source === 'wikimedia') {
        console.log(`\nProcessing: ${result.title}`);
        imageInfo = await getWikimediaImageInfo(result.title);
        if (!imageInfo) continue;
      } else {
        imageInfo = result;
      }

      // Check dimensions
      if (imageInfo.width < 800 || imageInfo.height < 600) {
        console.log(`  Skipping: Too small (${imageInfo.width}x${imageInfo.height})`);
        continue;
      }

      const filename = generateFilename(
        source === 'wikimedia' ? result.title : `${shipName}_${result.id}`,
        source
      );
      const tempPath = path.join('/tmp', filename.replace('.webp', '.jpg'));
      const finalPath = path.join(SHIPS_IMG_DIR, filename);

      if (fs.existsSync(finalPath)) {
        console.log(`  Already exists: ${filename}`);
        continue;
      }

      console.log(`  Downloading from ${imageInfo.source}...`);
      try {
        await downloadFile(imageInfo.url, tempPath);

        console.log(`  Converting to webp...`);
        const converted = await convertToWebp(tempPath, finalPath);

        if (converted && fs.existsSync(finalPath)) {
          console.log(`  Saved as: ${filename}`);
          downloadedImages.push({
            filename,
            path: `/assets/ships/${filename}`,
            license: imageInfo.license,
            artist: imageInfo.artist,
            source: imageInfo.source
          });
          try { fs.unlinkSync(tempPath); } catch {}
        }
      } catch (e) {
        console.error(`  Download failed:`, e.message);
      }
    }
  }

  console.log(`\nDownloaded ${downloadedImages.length} images for ${shipName}`);

  // Save attribution file
  if (downloadedImages.length > 0) {
    const attrPath = path.join(SHIPS_IMG_DIR, `${shipName.toLowerCase().replace(/\s+/g, '-')}-attributions.json`);
    fs.writeFileSync(attrPath, JSON.stringify(downloadedImages, null, 2));
    console.log(`Attribution saved to: ${attrPath}`);
  }

  return downloadedImages;
}

// Parse command line arguments
const args = process.argv.slice(2);
const shipIndex = args.indexOf('--ship');
const cruiseLineIndex = args.indexOf('--cruise-line');
const sourceIndex = args.indexOf('--source');
const batchMode = args.includes('--batch');
const limitIndex = args.indexOf('--limit');

if (batchMode) {
  const limit = limitIndex !== -1 ? parseInt(args[limitIndex + 1]) : 1;
  const preferredSource = sourceIndex !== -1 ? args[sourceIndex + 1] : null;

  console.log('BATCH MODE - Processing ships that need images');
  console.log(`Limit: ${limit} ships per run`);

  const shipsData = JSON.parse(fs.readFileSync('/tmp/ships-needing-images.json', 'utf8'));
  shipsData.sort((a, b) => a.currentCount - b.currentCount);

  let processed = 0;
  for (const ship of shipsData) {
    if (processed >= limit) break;

    const shipName = ship.slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    const imagesNeeded = 8 - ship.currentCount;
    await fetchImagesForShip(shipName, ship.cruiseLine, imagesNeeded, preferredSource);
    processed++;

    if (processed < limit && processed < shipsData.length) {
      console.log('\n--- Moving to next ship ---');
      await humanSleep(15000 + Math.random() * 10000);
    }
  }

} else if (shipIndex !== -1) {
  const shipName = args[shipIndex + 1];
  const cruiseLine = cruiseLineIndex !== -1 ? args[cruiseLineIndex + 1] : 'unknown';
  const preferredSource = sourceIndex !== -1 ? args[sourceIndex + 1] : null;

  await fetchImagesForShip(shipName, cruiseLine, 8, preferredSource);

} else {
  console.log(`
Multi-Source Ship Image Fetcher v1.1
====================================

Usage:
  node admin/fetch-ship-images.js --ship "Wonder of the Seas" --cruise-line rcl
  node admin/fetch-ship-images.js --batch --limit 5
  node admin/fetch-ship-images.js --source pexels --ship "Cruise Ship"

Options:
  --ship         Ship name (in quotes)
  --cruise-line  Cruise line code (rcl, carnival, etc.)
  --source       Preferred source (wikimedia, unsplash, pexels, pixabay)
  --batch        Process ships from /tmp/ships-needing-images.json
  --limit N      In batch mode, process N ships (default: 1)

Environment Variables (for API access):
  UNSPLASH_ACCESS_KEY - https://unsplash.com/developers
  PEXELS_API_KEY      - https://www.pexels.com/api/
  PIXABAY_API_KEY     - https://pixabay.com/api/docs/

Image Sources:
`);
  for (const [key, src] of Object.entries(SOURCES)) {
    const status = src.enabled ? '✓ Enabled' : (src.requiresKey ? '✗ Needs API key' : '✗ Disabled');
    console.log(`  ${key.padEnd(12)} ${src.name.padEnd(20)} ${status}`);
  }
}
