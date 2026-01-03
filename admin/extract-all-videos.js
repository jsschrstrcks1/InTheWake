#!/usr/bin/env node
/**
 * Extract Videos for All Cruise Lines
 * Soli Deo Gloria
 *
 * Scans video manifest files and extracts relevant videos for each ship
 * across all cruise lines based on title/description matching.
 */

import { readFile, writeFile, readdir, mkdir } from 'fs/promises';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

// All ships by cruise line
const CRUISE_LINES = {
  norwegian: {
    name: 'Norwegian Cruise Line',
    ships: [
      'norwegian-aqua', 'norwegian-bliss', 'norwegian-breakaway', 'norwegian-dawn',
      'norwegian-encore', 'norwegian-epic', 'norwegian-escape', 'norwegian-gem',
      'norwegian-getaway', 'norwegian-jade', 'norwegian-jewel', 'norwegian-joy',
      'norwegian-pearl', 'norwegian-prima', 'norwegian-sky', 'norwegian-spirit',
      'norwegian-star', 'norwegian-sun', 'norwegian-viva', 'pride-of-america'
    ]
  },
  msc: {
    name: 'MSC Cruises',
    ships: [
      'msc-armonia', 'msc-bellissima', 'msc-divina', 'msc-euribia', 'msc-fantasia',
      'msc-grandiosa', 'msc-lirica', 'msc-magnifica', 'msc-meraviglia', 'msc-musica',
      'msc-opera', 'msc-orchestra', 'msc-poesia', 'msc-preziosa', 'msc-seascape',
      'msc-seashore', 'msc-seaside', 'msc-seaview', 'msc-sinfonia', 'msc-splendida',
      'msc-virtuosa', 'msc-world-america', 'msc-world-asia', 'msc-world-europa'
    ]
  },
  'celebrity-cruises': {
    name: 'Celebrity Cruises',
    ships: [
      'celebrity-apex', 'celebrity-ascent', 'celebrity-beyond', 'celebrity-constellation',
      'celebrity-eclipse', 'celebrity-edge', 'celebrity-equinox', 'celebrity-flora',
      'celebrity-infinity', 'celebrity-millennium', 'celebrity-reflection',
      'celebrity-silhouette', 'celebrity-solstice', 'celebrity-summit', 'celebrity-xcel',
      'celebrity-xpedition'
    ]
  },
  princess: {
    name: 'Princess Cruises',
    ships: [
      'caribbean-princess', 'coral-princess', 'crown-princess', 'diamond-princess',
      'discovery-princess', 'emerald-princess', 'enchanted-princess', 'grand-princess',
      'island-princess', 'majestic-princess', 'regal-princess', 'royal-princess',
      'ruby-princess', 'sapphire-princess', 'sky-princess', 'star-princess', 'sun-princess'
    ]
  },
  'holland-america-line': {
    name: 'Holland America Line',
    ships: [
      'eurodam', 'koningsdam', 'nieuw-amsterdam', 'nieuw-statendam', 'noordam',
      'oosterdam', 'rotterdam', 'volendam', 'westerdam', 'zaandam', 'zuiderdam'
    ]
  },
  cunard: {
    name: 'Cunard Line',
    ships: ['queen-anne', 'queen-elizabeth', 'queen-mary-2', 'queen-victoria']
  },
  costa: {
    name: 'Costa Cruises',
    ships: [
      'costa-deliziosa', 'costa-diadema', 'costa-fascinosa', 'costa-favolosa',
      'costa-firenze', 'costa-pacifica', 'costa-smeralda', 'costa-toscana', 'costa-venezia'
    ]
  },
  'virgin-voyages': {
    name: 'Virgin Voyages',
    ships: ['brilliant-lady', 'resilient-lady', 'scarlet-lady', 'valiant-lady']
  },
  oceania: {
    name: 'Oceania Cruises',
    ships: ['allura', 'insignia', 'marina', 'nautica', 'regatta', 'riviera', 'sirena', 'vista']
  },
  regent: {
    name: 'Regent Seven Seas',
    ships: [
      'seven-seas-explorer', 'seven-seas-grandeur', 'seven-seas-mariner',
      'seven-seas-navigator', 'seven-seas-splendor', 'seven-seas-voyager'
    ]
  },
  seabourn: {
    name: 'Seabourn',
    ships: [
      'seabourn-encore', 'seabourn-odyssey', 'seabourn-ovation',
      'seabourn-pursuit', 'seabourn-quest', 'seabourn-sojourn', 'seabourn-venture'
    ]
  },
  silversea: {
    name: 'Silversea Cruises',
    ships: [
      'silver-cloud', 'silver-dawn', 'silver-endeavour', 'silver-moon',
      'silver-muse', 'silver-nova', 'silver-origin', 'silver-ray',
      'silver-shadow', 'silver-spirit', 'silver-whisper', 'silver-wind'
    ]
  }
};

// Video category mappings
const CATEGORIES = {
  'ship walk through': ['ship tour', 'walkthrough', 'walk through', 'full tour', 'ship walkthrough', 'deck tour', 'public areas'],
  'top ten': ['top 10', 'top ten', 'top 5', 'top five', 'best things', 'must do', 'tips'],
  'suite': ['suite', 'owner suite', 'penthouse', 'haven', 'yacht club'],
  'balcony': ['balcony', 'verandah', 'veranda'],
  'oceanview': ['oceanview', 'ocean view', 'window cabin', 'porthole'],
  'interior': ['interior', 'inside cabin', 'inside stateroom'],
  'food': ['food', 'dining', 'restaurant', 'buffet', 'specialty dining', 'main dining room'],
  'accessible': ['accessible', 'wheelchair', 'ada', 'mobility', 'handicap']
};

function slugToName(slug) {
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .replace(/Msc /g, 'MSC ')
    .replace(/Ncl /g, 'NCL ');
}

function matchesShip(video, shipSlug, shipName) {
  const title = (video.title || '').toLowerCase();
  const desc = (video.description || '').toLowerCase();
  const shipNameLower = shipName.toLowerCase();
  const searchTerms = [shipNameLower];

  // Add alternate forms
  if (shipSlug.startsWith('msc-')) {
    searchTerms.push(shipSlug.replace('msc-', 'msc '));
  }
  if (shipSlug.startsWith('norwegian-')) {
    searchTerms.push(shipSlug.replace('norwegian-', 'norwegian '));
    searchTerms.push(shipSlug.replace('norwegian-', 'ncl '));
  }
  if (shipSlug.startsWith('celebrity-')) {
    searchTerms.push(shipSlug.replace('celebrity-', 'celebrity '));
  }

  // Search for exact ship name in title (more reliable than description)
  for (const term of searchTerms) {
    if (title.includes(term)) {
      return true;
    }
  }

  return false;
}

function categorizeVideo(video) {
  // Use pre-extracted category if available
  if (video._extracted_category) {
    const cat = video._extracted_category.toLowerCase().replace(/-/g, ' ');
    // Map to our standard categories
    if (cat.includes('top') && cat.includes('ten')) return 'top ten';
    if (cat.includes('suite')) return 'suite';
    if (cat.includes('balcony')) return 'balcony';
    if (cat.includes('ocean') || cat.includes('oceanview')) return 'oceanview';
    if (cat.includes('interior') || cat.includes('inside')) return 'interior';
    if (cat.includes('dining') || cat.includes('food')) return 'food';
    if (cat.includes('access')) return 'accessible';
    if (cat.includes('walk') || cat.includes('tour') || cat.includes('overview')) return 'ship walk through';
  }

  // Use existing category field if present
  if (video.category) {
    const cat = video.category.toLowerCase();
    if (cat.includes('suite')) return 'suite';
    if (cat.includes('balcony')) return 'balcony';
    if (cat.includes('ocean')) return 'oceanview';
    if (cat.includes('interior') || cat.includes('inside')) return 'interior';
    if (cat.includes('dining') || cat.includes('food')) return 'food';
    if (cat.includes('access')) return 'accessible';
  }

  // Fall back to keyword matching in title/description
  const title = (video.title || '').toLowerCase();
  const desc = (video.description || '').toLowerCase();
  const combined = title + ' ' + desc;

  for (const [category, keywords] of Object.entries(CATEGORIES)) {
    for (const keyword of keywords) {
      if (combined.includes(keyword)) {
        return category;
      }
    }
  }

  return 'ship walk through'; // Default category
}

async function loadManifests() {
  const manifestPaths = [];

  // Add main video manifest files
  manifestPaths.push(join(PROJECT_ROOT, 'ships', 'rcl', 'assets', 'videos', 'adventure-of-the-seas.json'));
  manifestPaths.push(join(PROJECT_ROOT, 'ships', 'rcl', 'assets', 'videos', 'allure-of-the-seas.json'));
  manifestPaths.push(join(PROJECT_ROOT, 'ships', 'rcl', 'assets', 'videos', 'radiance.json'));
  manifestPaths.push(join(PROJECT_ROOT, 'ships', 'rcl', 'assets', 'videos', 'enchantment-of-the-seas.json'));
  manifestPaths.push(join(PROJECT_ROOT, 'ships', 'rc_ship_videos.json'));
  manifestPaths.push(join(PROJECT_ROOT, 'ships', 'rcl', 'rc_ship_videos.json'));
  manifestPaths.push(join(PROJECT_ROOT, 'data', 'rc_ship_videos.json'));

  // Add all individual RCL video files (*-videos.json)
  const rclAssetsDir = join(PROJECT_ROOT, 'ships', 'rcl', 'assets');
  try {
    const files = await readdir(rclAssetsDir);
    for (const f of files) {
      if (f.endsWith('-videos.json')) {
        manifestPaths.push(join(rclAssetsDir, f));
      }
    }
  } catch (e) {}

  const allVideos = [];
  const seenVideoIds = new Set();

  for (const manifestPath of manifestPaths) {
    try {
      const content = await readFile(manifestPath, 'utf8');
      const json = JSON.parse(content);

      // Handle multiple JSON structures
      let videos = [];

      // Structure 1: Nested categories - json.videos is an object with category keys
      if (json.videos && typeof json.videos === 'object' && !Array.isArray(json.videos)) {
        for (const [categoryName, categoryVideos] of Object.entries(json.videos)) {
          if (Array.isArray(categoryVideos)) {
            for (const v of categoryVideos) {
              v._extracted_category = categoryName;
              videos.push(v);
            }
          }
        }
      }

      // Structure 2: Flat array - json.videos is an array
      if (json.videos && Array.isArray(json.videos)) {
        videos.push(...json.videos);
      }

      // Structure 3: Root-level array (no videos key)
      if (Array.isArray(json)) {
        videos.push(...json);
      }

      // Structure 4: videos_interleaved array
      if (json.videos_interleaved && Array.isArray(json.videos_interleaved)) {
        videos.push(...json.videos_interleaved);
      }

      // Structure 5: by_category object
      if (json.by_category && typeof json.by_category === 'object') {
        for (const [categoryName, categoryVideos] of Object.entries(json.by_category)) {
          if (Array.isArray(categoryVideos)) {
            for (const v of categoryVideos) {
              v._extracted_category = categoryName;
              videos.push(v);
            }
          }
        }
      }

      // Deduplicate by videoId or youtube_id
      for (const v of videos) {
        const vid = v.videoId || v.youtube_id;
        if (vid && !seenVideoIds.has(vid)) {
          seenVideoIds.add(vid);
          // Normalize to videoId
          v.videoId = vid;
          allVideos.push(v);
        }
      }
    } catch (e) {
      // Skip invalid files
    }
  }

  console.log(`Loaded ${allVideos.length} unique videos from ${manifestPaths.length} manifests`);
  return allVideos;
}

async function extractVideosForShip(videos, shipSlug, shipName) {
  const matchedVideos = {};

  for (const video of videos) {
    if (matchesShip(video, shipSlug, shipName)) {
      const category = categorizeVideo(video);
      if (!matchedVideos[category]) {
        matchedVideos[category] = [];
      }
      matchedVideos[category].push({
        videoId: video.videoId,
        provider: 'youtube',
        title: video.title,
        description: (video.description || '').substring(0, 200)
      });
    }
  }

  return matchedVideos;
}

async function processAllCruiseLines(allVideos) {
  const results = {};

  for (const [cruiseLineSlug, cruiseLine] of Object.entries(CRUISE_LINES)) {
    console.log(`\n[${cruiseLine.name}]`);
    const videoDir = join(PROJECT_ROOT, 'assets', 'data', 'videos', cruiseLineSlug);

    // Create directory if it doesn't exist
    try {
      await mkdir(videoDir, { recursive: true });
    } catch (e) {}

    let totalVideos = 0;
    let shipsWithVideos = 0;

    for (const shipSlug of cruiseLine.ships) {
      const shipName = slugToName(shipSlug);
      const matchedVideos = await extractVideosForShip(allVideos, shipSlug, shipName);

      const videoCount = Object.values(matchedVideos).reduce((sum, arr) => sum + arr.length, 0);

      if (videoCount > 0) {
        const outputPath = join(videoDir, `${shipSlug}.json`);
        const outputData = {
          ship: shipName,
          ship_class: '',
          cruise_line: cruiseLine.name,
          last_updated: new Date().toISOString().split('T')[0],
          videos: matchedVideos
        };

        await writeFile(outputPath, JSON.stringify(outputData, null, 2), 'utf8');
        console.log(`  ✅ ${shipSlug}: ${videoCount} videos`);
        totalVideos += videoCount;
        shipsWithVideos++;
      } else {
        // Create stub file
        const outputPath = join(videoDir, `${shipSlug}.json`);
        const stubData = {
          ship: shipName,
          updated: new Date().toISOString().split('T')[0],
          needs_real_videos: true,
          videos: [],
          ordered_round_robin: []
        };
        await writeFile(outputPath, JSON.stringify(stubData, null, 2), 'utf8');
      }
    }

    results[cruiseLineSlug] = { totalVideos, shipsWithVideos, totalShips: cruiseLine.ships.length };
    console.log(`  Summary: ${shipsWithVideos}/${cruiseLine.ships.length} ships with ${totalVideos} total videos`);
  }

  return results;
}

async function main() {
  console.log('Multi-Cruise-Line Video Extraction');
  console.log('===================================\n');

  const allVideos = await loadManifests();
  const results = await processAllCruiseLines(allVideos);

  console.log('\n===================================');
  console.log('Overall Summary:');
  let grandTotal = 0;
  for (const [line, stats] of Object.entries(results)) {
    grandTotal += stats.totalVideos;
    console.log(`  ${line}: ${stats.shipsWithVideos}/${stats.totalShips} ships, ${stats.totalVideos} videos`);
  }
  console.log(`\nTotal videos extracted: ${grandTotal}`);
}

main().catch(console.error);
