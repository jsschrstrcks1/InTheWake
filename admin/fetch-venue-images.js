#!/usr/bin/env node
/**
 * fetch-venue-images.js
 * Fetches appropriate images from Wikimedia Commons for venue pages.
 * Uses the Commons API with rate limiting to be a good citizen.
 *
 * Usage: node admin/fetch-venue-images.js [--dry-run] [--category=<category>]
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputDir = path.join(__dirname, '..', 'assets', 'images', 'restaurants', 'photos');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const categoryArg = (args.find(a => a.startsWith('--category=')) || '').replace('--category=', '');

// Rate limiting - 1 request per second to be polite
const RATE_LIMIT_MS = 1500;
let lastRequestTime = 0;

async function rateLimitedFetch(url) {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < RATE_LIMIT_MS) {
    await new Promise(r => setTimeout(r, RATE_LIMIT_MS - timeSinceLastRequest));
  }
  lastRequestTime = Date.now();

  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      headers: {
        'User-Agent': 'InTheWakeCruiseBot/1.0 (https://cruisinginthewake.com; contact@cruisinginthewake.com) node-fetch',
      },
    };

    https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    }).on('error', reject);
  });
}

async function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      headers: {
        'User-Agent': 'InTheWakeCruiseBot/1.0 (https://cruisinginthewake.com; contact@cruisinginthewake.com)',
      },
    };

    https.get(options, (res) => {
      // Handle redirects
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadImage(res.headers.location, filename).then(resolve).catch(reject);
      }

      const filePath = path.join(outputDir, filename);
      const fileStream = fs.createWriteStream(filePath);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve(filePath);
      });
    }).on('error', reject);
  });
}

// Search Wikimedia Commons for images
async function searchCommons(query, limit = 10) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srnamespace=6&srlimit=${limit}&format=json`;
  const data = await rateLimitedFetch(url);
  return data.query?.search || [];
}

// Get image info (URL, license)
async function getImageInfo(title) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url|extmetadata&format=json`;
  const data = await rateLimitedFetch(url);
  const pages = data.query?.pages || {};
  const page = Object.values(pages)[0];
  return page?.imageinfo?.[0] || null;
}

// Image categories we need
const IMAGE_SEARCHES = {
  'formal-dining': [
    'cruise ship dining room',
    'elegant restaurant interior',
    'fine dining table setting',
    'restaurant chandeliers',
    'formal dinner table',
  ],
  'cocktail-bar': [
    'cocktail bar interior',
    'bartender mixing drinks',
    'craft cocktails',
    'bar counter drinks',
    'cocktail lounge',
  ],
  'pub': [
    'english pub interior',
    'draft beer taps',
    'pub atmosphere',
    'traditional pub bar',
    'ale house',
  ],
  'italian': [
    'italian restaurant',
    'pasta dish presentation',
    'italian cuisine',
    'trattoria interior',
    'pizza oven restaurant',
  ],
  'asian': [
    'asian restaurant interior',
    'sushi presentation',
    'japanese cuisine',
    'dim sum',
    'asian fusion restaurant',
  ],
  'mexican': [
    'mexican restaurant interior',
    'tacos presentation',
    'margarita cocktail',
    'cantina atmosphere',
    'guacamole tableside',
  ],
  'steakhouse': [
    'steakhouse interior',
    'steak presentation',
    'grilled meat',
    'upscale steakhouse',
    'meat aging room',
  ],
  'seafood': [
    'seafood restaurant',
    'lobster presentation',
    'oyster bar',
    'fresh seafood display',
    'coastal restaurant',
  ],
  'coffee-dessert': [
    'coffee shop interior',
    'latte art',
    'ice cream sundae',
    'dessert presentation',
    'bakery display',
  ],
  'pool-bar': [
    'pool bar resort',
    'tropical cocktail poolside',
    'swim up bar',
    'resort pool drinks',
    'beach bar',
  ],
  'sports-bar': [
    'sports bar tvs',
    'bar with screens',
    'pub food wings',
    'sports pub',
    'bar arcade',
  ],
  'lounge': [
    'hotel lounge interior',
    'cocktail lounge',
    'piano bar',
    'jazz club interior',
    'elegant lounge',
  ],
  'buffet': [
    'buffet restaurant',
    'cruise ship buffet',
    'food display buffet',
    'all you can eat',
    'buffet station',
  ],
  'bbq': [
    'bbq restaurant',
    'smoked brisket',
    'southern bbq',
    'barbecue ribs',
    'smokehouse interior',
  ],
};

async function fetchImagesForCategory(category) {
  const searches = IMAGE_SEARCHES[category];
  if (!searches) {
    console.log(`  No searches defined for category: ${category}`);
    return [];
  }

  const results = [];
  console.log(`\nFetching images for: ${category}`);

  for (const query of searches) {
    console.log(`  Searching: "${query}"`);

    const searchResults = await searchCommons(query + ' filetype:jpg OR filetype:webp', 5);

    for (const result of searchResults) {
      const info = await getImageInfo(result.title);
      if (info && info.url) {
        // Check license
        const license = info.extmetadata?.LicenseShortName?.value || '';
        const isFreeLicense = /^(CC0|CC-BY|CC BY|Public domain|PD)/i.test(license);

        if (isFreeLicense) {
          results.push({
            title: result.title,
            url: info.url,
            license,
            query,
          });
          console.log(`    Found: ${result.title.substring(0, 50)}... (${license})`);

          if (results.length >= 5) break; // 5 images per category is enough
        }
      }
    }

    if (results.length >= 5) break;
  }

  return results;
}

async function main() {
  console.log('Wikimedia Commons Image Fetcher');
  console.log('================================\n');

  if (dryRun) {
    console.log('DRY RUN - no files will be downloaded\n');
  }

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const categories = categoryArg ? [categoryArg] : Object.keys(IMAGE_SEARCHES);

  for (const category of categories) {
    const images = await fetchImagesForCategory(category);

    if (images.length === 0) {
      console.log(`  No suitable images found for ${category}`);
      continue;
    }

    console.log(`\n  Downloading ${images.length} images for ${category}...`);

    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const ext = img.url.split('.').pop().toLowerCase().split('?')[0];
      const filename = `${category}-${i + 1}.${ext === 'jpeg' ? 'jpg' : ext}`;

      if (dryRun) {
        console.log(`    Would download: ${filename}`);
      } else {
        try {
          await rateLimitedFetch(''); // Rate limit
          const filePath = await downloadImage(img.url, filename);
          console.log(`    Downloaded: ${filename}`);
        } catch (err) {
          console.log(`    Failed: ${filename} - ${err.message}`);
        }
      }
    }
  }

  console.log('\nDone!');
}

main().catch(console.error);
