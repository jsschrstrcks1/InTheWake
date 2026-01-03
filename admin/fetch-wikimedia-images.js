#!/usr/bin/env node
/**
 * Fetch Ship Images from Wikimedia Commons API
 * Soli Deo Gloria
 *
 * Uses the Wikimedia Commons API to find Creative Commons licensed images
 * for Carnival cruise ships.
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const OUTPUT_DIR = join(__dirname, '..', 'assets', 'data', 'images', 'carnival');

// Ships that need images
const SHIPS_NEEDING_IMAGES = [
  { slug: 'carnival-breeze', name: 'Carnival Breeze', imo: '9516459' },
  { slug: 'carnival-dream', name: 'Carnival Dream', imo: '9378496' },
  { slug: 'carnival-glory', name: 'Carnival Glory', imo: '9196508' },
  { slug: 'carnival-celebration', name: 'Carnival Celebration', imo: '9840641' },
  { slug: 'carnival-conquest', name: 'Carnival Conquest', imo: '9196494' },
  { slug: 'carnival-elation', name: 'Carnival Elation', imo: '9106273' },
  { slug: 'carnival-freedom', name: 'Carnival Freedom', imo: '9333163' },
  { slug: 'carnival-horizon', name: 'Carnival Horizon', imo: '9724888' },
  { slug: 'carnival-legend', name: 'Carnival Legend', imo: '9224726' },
  { slug: 'carnival-liberty', name: 'Carnival Liberty', imo: '9278181' },
  { slug: 'carnival-magic', name: 'Carnival Magic', imo: '9378484' },
  { slug: 'carnival-miracle', name: 'Carnival Miracle', imo: '9237357' },
  { slug: 'carnival-panorama', name: 'Carnival Panorama', imo: '9810992' },
  { slug: 'carnival-paradise', name: 'Carnival Paradise', imo: '9104110' },
  { slug: 'carnival-pride', name: 'Carnival Pride', imo: '9206905' },
  { slug: 'carnival-spirit', name: 'Carnival Spirit', imo: '9190693' },
  { slug: 'carnival-sunrise', name: 'Carnival Sunrise', imo: '9251741' },
  { slug: 'carnival-sunshine', name: 'Carnival Sunshine', imo: '9061422' },
  { slug: 'carnival-valor', name: 'Carnival Valor', imo: '9305655' },
  { slug: 'carnival-vista', name: 'Carnival Vista', imo: '9692569' },
];

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'InTheWake/1.0 (https://inthewake.io; ken@inthewake.io) Node.js'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error('Failed to parse JSON: ' + e.message));
        }
      });
    }).on('error', reject);
  });
}

async function searchWikimediaImages(shipName) {
  // Search for images related to the ship
  const searchQuery = encodeURIComponent(shipName);
  const url = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${searchQuery}&srnamespace=6&srlimit=20&format=json`;

  console.log(`  Searching for: ${shipName}`);

  const data = await fetchUrl(url);

  if (!data.query || !data.query.search) {
    return [];
  }

  const images = [];
  for (const result of data.query.search) {
    // Get image info
    const title = result.title;
    if (title.match(/\.(jpg|jpeg|png|webp)$/i)) {
      images.push({
        title: title,
        pageid: result.pageid
      });
    }
  }

  return images;
}

async function getImageInfo(titles) {
  if (titles.length === 0) return [];

  const titlesParam = encodeURIComponent(titles.slice(0, 10).join('|'));
  const url = `https://commons.wikimedia.org/w/api.php?action=query&titles=${titlesParam}&prop=imageinfo&iiprop=url|extmetadata|size&format=json`;

  const data = await fetchUrl(url);

  if (!data.query || !data.query.pages) {
    return [];
  }

  const results = [];
  for (const [pageId, page] of Object.entries(data.query.pages)) {
    if (page.imageinfo && page.imageinfo[0]) {
      const info = page.imageinfo[0];
      const meta = info.extmetadata || {};

      // Check license - only include CC or public domain
      const license = meta.LicenseShortName?.value || '';
      if (license.match(/^(CC|Public domain|PD)/i)) {
        results.push({
          title: page.title,
          url: info.url,
          thumbUrl: info.url.replace(/\/commons\//, '/commons/thumb/') + '/800px-' + page.title.replace('File:', ''),
          width: info.width,
          height: info.height,
          license: license,
          author: meta.Artist?.value?.replace(/<[^>]*>/g, '') || 'Unknown',
          description: meta.ImageDescription?.value?.replace(/<[^>]*>/g, '') || ''
        });
      }
    }
  }

  return results;
}

async function processShip(ship) {
  console.log(`\nProcessing: ${ship.name}`);

  // Search for images
  const searchResults = await searchWikimediaImages(ship.name);
  console.log(`  Found ${searchResults.length} potential images`);

  if (searchResults.length === 0) {
    return { ship: ship.slug, images: [] };
  }

  // Get detailed info for images
  const titles = searchResults.map(r => r.title);
  const imageInfo = await getImageInfo(titles);
  console.log(`  ${imageInfo.length} images with compatible licenses`);

  return {
    ship: ship.slug,
    name: ship.name,
    imo: ship.imo,
    images: imageInfo
  };
}

async function main() {
  console.log('Fetching Ship Images from Wikimedia Commons');
  console.log('============================================\n');

  await mkdir(OUTPUT_DIR, { recursive: true });

  // Process ships one at a time with delays to avoid rate limiting
  const results = [];

  for (let i = 0; i < SHIPS_NEEDING_IMAGES.length; i++) {
    const ship = SHIPS_NEEDING_IMAGES[i];

    try {
      const result = await processShip(ship);
      results.push(result);

      // Save individual ship result
      const filepath = join(OUTPUT_DIR, `${ship.slug}-wikimedia.json`);
      await writeFile(filepath, JSON.stringify(result, null, 2));

      // Wait 2 seconds between requests to be respectful
      if (i < SHIPS_NEEDING_IMAGES.length - 1) {
        console.log('  Waiting 2s before next request...');
        await new Promise(r => setTimeout(r, 2000));
      }
    } catch (e) {
      console.error(`  Error: ${e.message}`);
      results.push({ ship: ship.slug, error: e.message, images: [] });
    }
  }

  // Summary
  console.log('\n============================================');
  console.log('Summary:');
  let totalImages = 0;
  for (const r of results) {
    const count = r.images?.length || 0;
    totalImages += count;
    console.log(`  ${r.ship}: ${count} images`);
  }
  console.log(`\nTotal: ${totalImages} images found`);
}

main().catch(console.error);
