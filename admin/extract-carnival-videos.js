#!/usr/bin/env node
/**
 * Extract Carnival Videos from Master Manifest
 * Soli Deo Gloria
 *
 * Parses the large video manifest and extracts Carnival ship videos,
 * categorizing them appropriately for ship page validation.
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MANIFEST_PATH = join(__dirname, '..', 'ships', 'rcl', 'assets', 'videos', 'adventure-of-the-seas.json');
const OUTPUT_DIR = join(__dirname, '..', 'assets', 'data', 'videos', 'carnival');

// Carnival ship slugs to match
const CARNIVAL_SHIPS = [
  'carnival-breeze', 'carnival-celebration', 'carnival-conquest', 'carnival-dream',
  'carnival-elation', 'carnival-firenze', 'carnival-freedom', 'carnival-glory',
  'carnival-horizon', 'carnival-jubilee', 'carnival-legend', 'carnival-liberty',
  'carnival-luminosa', 'carnival-magic', 'carnival-mardi-gras', 'carnival-miracle',
  'carnival-panorama', 'carnival-paradise', 'carnival-pride', 'carnival-radiance',
  'carnival-sensation', 'carnival-spirit', 'carnival-splendor', 'carnival-sunrise',
  'carnival-sunshine', 'carnival-valor', 'carnival-venezia', 'carnival-vista'
];

// Category mapping for validator
const CATEGORY_MAP = {
  'ship walk through': ['walkthrough', 'ship tour', 'full tour', 'public deck', 'full walk'],
  'top ten': ['top 10', 'top ten', 'best', 'review'],
  'suite': ['suite', 'grand suite', 'excel suite', 'corner suite', 'presidential'],
  'balcony': ['balcony', 'verandah', 'cove balcony'],
  'oceanview': ['ocean view', 'oceanview', 'porthole'],
  'interior': ['interior', 'inside cabin'],
  'food': ['dining', 'food', 'restaurant', 'buffet', 'specialty dining', 'guy\'s burger'],
  'accessible': ['accessible', 'wheelchair', 'ada']
};

function getShipSlug(title) {
  const titleLower = title.toLowerCase();
  for (const slug of CARNIVAL_SHIPS) {
    const shipName = slug.replace('carnival-', 'carnival ');
    if (titleLower.includes(shipName)) {
      return slug;
    }
  }
  return null;
}

function categorizeVideo(title, description = '') {
  const text = (title + ' ' + description).toLowerCase();
  const categories = [];

  for (const [category, keywords] of Object.entries(CATEGORY_MAP)) {
    for (const keyword of keywords) {
      if (text.includes(keyword.toLowerCase())) {
        if (!categories.includes(category)) {
          categories.push(category);
        }
        break;
      }
    }
  }

  // Default to ship walk through for deck tours
  if (categories.length === 0) {
    if (text.includes('deck') || text.includes('cabin deck') || text.includes('cabin location')) {
      categories.push('ship walk through');
    }
  }

  return categories.length > 0 ? categories : ['ship walk through'];
}

async function main() {
  console.log('Extracting Carnival Videos from Master Manifest');
  console.log('================================================\n');

  // Read manifest
  const manifest = JSON.parse(await readFile(MANIFEST_PATH, 'utf8'));

  // Collect all videos by ship
  const shipVideos = {};
  CARNIVAL_SHIPS.forEach(slug => {
    shipVideos[slug] = {
      ship: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      ship_class: '',
      cruise_line: 'Carnival Cruise Line',
      last_updated: new Date().toISOString().split('T')[0],
      videos: {}
    };
  });

  let totalVideos = 0;
  let matchedVideos = 0;

  // Process all video categories in the manifest
  for (const [category, videos] of Object.entries(manifest.videos || {})) {
    if (!Array.isArray(videos)) continue;

    for (const video of videos) {
      totalVideos++;
      if (!video.title) continue;

      const shipSlug = getShipSlug(video.title);
      if (!shipSlug) continue;

      matchedVideos++;
      const categories = categorizeVideo(video.title, video.description || '');

      for (const cat of categories) {
        if (!shipVideos[shipSlug].videos[cat]) {
          shipVideos[shipSlug].videos[cat] = [];
        }

        // Check for duplicates
        const exists = shipVideos[shipSlug].videos[cat].some(v => v.videoId === video.videoId);
        if (!exists) {
          shipVideos[shipSlug].videos[cat].push({
            videoId: video.videoId,
            provider: 'youtube',
            title: video.title,
            description: (video.description || '').substring(0, 200)
          });
        }
      }
    }
  }

  // Write output files
  await mkdir(OUTPUT_DIR, { recursive: true });

  let shipsWithVideos = 0;
  for (const [slug, data] of Object.entries(shipVideos)) {
    const videoCount = Object.values(data.videos).reduce((sum, arr) => sum + arr.length, 0);
    if (videoCount > 0) {
      shipsWithVideos++;
      const filepath = join(OUTPUT_DIR, `${slug}.json`);
      await writeFile(filepath, JSON.stringify(data, null, 2), 'utf8');
      console.log(`✅ ${slug}: ${videoCount} videos across ${Object.keys(data.videos).length} categories`);
    }
  }

  console.log(`\n================================================`);
  console.log(`Total videos in manifest: ${totalVideos}`);
  console.log(`Matched Carnival videos: ${matchedVideos}`);
  console.log(`Ships with videos: ${shipsWithVideos}/${CARNIVAL_SHIPS.length}`);
}

main().catch(console.error);
