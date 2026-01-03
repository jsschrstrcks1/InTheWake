#!/usr/bin/env node
/**
 * Extract Carnival Videos from Multiple Master Manifests
 * Soli Deo Gloria
 *
 * Parses multiple video manifests and extracts Carnival ship videos,
 * categorizing them appropriately for ship page validation.
 */

import { readFile, writeFile, mkdir, readdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const OUTPUT_DIR = join(__dirname, '..', 'assets', 'data', 'videos', 'carnival');

async function getManifestPaths() {
  const paths = [
    join(__dirname, '..', 'ships', 'rcl', 'assets', 'videos', 'adventure-of-the-seas.json'),
    join(__dirname, '..', 'ships', 'rcl', 'assets', 'videos', 'allure-of-the-seas.json'),
    join(__dirname, '..', 'ships', 'rcl', 'assets', 'videos', 'radiance.json'),
    join(__dirname, '..', 'ships', 'rc_ship_videos.json'),
    join(__dirname, '..', 'data', 'rc_ship_videos.json'),
  ];

  // Add all individual RCL video files
  const rclAssetsDir = join(__dirname, '..', 'ships', 'rcl', 'assets');
  try {
    const files = await readdir(rclAssetsDir);
    for (const f of files) {
      if (f.endsWith('-videos.json')) {
        paths.push(join(rclAssetsDir, f));
      }
    }
  } catch (e) {
    // Directory may not exist
  }

  return paths;
}

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
  'ship walk through': ['walkthrough', 'ship tour', 'full tour', 'public deck', 'full walk', 'deck tour'],
  'top ten': ['top 10', 'top ten', 'best', 'review', 'things to do'],
  'suite': ['suite', 'grand suite', 'excel suite', 'corner suite', 'presidential', 'havana suite'],
  'balcony': ['balcony', 'verandah', 'cove balcony', 'aft balcony'],
  'oceanview': ['ocean view', 'oceanview', 'porthole', 'window'],
  'interior': ['interior', 'inside cabin', 'inside stateroom'],
  'food': ['dining', 'food', 'restaurant', 'buffet', 'specialty dining', 'guy\'s burger', 'menu', 'lido'],
  'accessible': ['accessible', 'wheelchair', 'ada', 'mobility']
};

function getShipSlug(title) {
  const titleLower = title.toLowerCase();
  for (const slug of CARNIVAL_SHIPS) {
    // Convert slug to ship name (e.g., "carnival-mardi-gras" -> "carnival mardi gras")
    const shipName = slug.replace(/-/g, ' ');
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

function addVideoToShip(shipVideos, shipSlug, video, stats) {
  const categories = categorizeVideo(video.title, video.description || '');
  const videoId = video.videoId || video.youtube_id || '';

  if (!videoId) return;

  for (const cat of categories) {
    if (!shipVideos[shipSlug].videos[cat]) {
      shipVideos[shipSlug].videos[cat] = [];
    }

    const exists = shipVideos[shipSlug].videos[cat].some(v => v.videoId === videoId);
    if (!exists) {
      shipVideos[shipSlug].videos[cat].push({
        videoId: videoId,
        provider: 'youtube',
        title: video.title,
        description: (video.description || '').substring(0, 200)
      });
      stats.matched++;
    }
  }
}

async function processManifest(manifestPath, shipVideos, stats) {
  let manifest;
  try {
    manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
    console.log(`Processing: ${manifestPath.split('/').pop()}`);
  } catch (e) {
    console.log(`Skipping (not found): ${manifestPath.split('/').pop()}`);
    return;
  }

  // Handle different manifest structures
  // Structure 1: { videos: { category: [videos] } }
  if (manifest.videos && typeof manifest.videos === 'object' && !Array.isArray(manifest.videos)) {
    for (const [category, videos] of Object.entries(manifest.videos)) {
      if (!Array.isArray(videos)) continue;
      for (const video of videos) {
        stats.total++;
        if (!video.title) continue;
        const shipSlug = getShipSlug(video.title);
        if (shipSlug) {
          addVideoToShip(shipVideos, shipSlug, video, stats);
        }
      }
    }
  }

  // Structure 2: { videos: [videos] } - array of videos
  if (manifest.videos && Array.isArray(manifest.videos)) {
    for (const video of manifest.videos) {
      stats.total++;
      if (!video.title) continue;
      const shipSlug = getShipSlug(video.title);
      if (shipSlug) {
        addVideoToShip(shipVideos, shipSlug, video, stats);
      }
    }
  }

  // Structure 3: videos_interleaved array
  if (manifest.videos_interleaved && Array.isArray(manifest.videos_interleaved)) {
    for (const video of manifest.videos_interleaved) {
      stats.total++;
      if (!video.title) continue;
      const shipSlug = getShipSlug(video.title);
      if (shipSlug) {
        addVideoToShip(shipVideos, shipSlug, video, stats);
      }
    }
  }

  // Structure 4: ships object with nested videos
  if (manifest.ships && typeof manifest.ships === 'object') {
    for (const [shipKey, shipData] of Object.entries(manifest.ships)) {
      if (shipData.videos && Array.isArray(shipData.videos)) {
        for (const video of shipData.videos) {
          stats.total++;
          if (!video.title) continue;
          const shipSlug = getShipSlug(video.title);
          if (shipSlug) {
            addVideoToShip(shipVideos, shipSlug, video, stats);
          }
        }
      }
    }
  }
}

async function main() {
  console.log('Extracting Carnival Videos from Multiple Manifests');
  console.log('===================================================\n');

  // Initialize ship videos structure
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

  const stats = { total: 0, matched: 0 };

  // Get all manifest paths dynamically
  const manifestPaths = await getManifestPaths();
  console.log(`Found ${manifestPaths.length} manifest files to scan\n`);

  // Process each manifest
  for (const manifestPath of manifestPaths) {
    await processManifest(manifestPath, shipVideos, stats);
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

  console.log(`\n===================================================`);
  console.log(`Total videos scanned: ${stats.total}`);
  console.log(`Carnival videos extracted: ${stats.matched}`);
  console.log(`Ships with videos: ${shipsWithVideos}/${CARNIVAL_SHIPS.length}`);
}

main().catch(console.error);
