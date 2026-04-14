#!/usr/bin/env node
/**
 * Fix Missing Ship Images Script
 * Identifies missing images referenced in ship pages and creates symlinks from existing images
 */

const fs = require('fs');
const path = require('path');

const SHIPS_DIR = path.join(__dirname, '..', 'ships');
const ASSETS_SHIPS_DIR = path.join(__dirname, '..', 'assets', 'ships');

// Map of expected image names to existing source images
const IMAGE_MAPPINGS = {
  // Carnival sister ship mappings
  'carnival-magic_01.webp': 'Carnival_Magic_001.jpg',
  'carnival-breeze_01.webp': 'Carnival_Breeze_001.jpg',
  'carnival-dream_02.webp': 'carnival-dream_01.webp',
  'carnival-vista_01.webp': 'carnival-vista-FOM- - 1.webp',

  // RCL mappings for common missing images
  'adventure-of-the-seas_01.webp': 'Adventure_of_the_Seas_5.webp',
  'explorer-of-the-seas_01.webp': 'Explorer_of_the_seas_-_Cirkewwa.webp',
  'voyager-of-the-seas_01.webp': '"Voyager_of_the_Seas"_(8194516843).webp',
  'navigator-of-the-seas_01.webp': 'Navigator_of_the_Seas_001.webp',
  'independence-of-the-seas_01.webp': '1993-Independence_of_the_seas_na_Coruña.webp',
  'symphony-of-the-seas_01.webp': 'Symphony_of_the_Seas_(ship,_2018)_001.webp',
  'wonder-of-the-seas_01.webp': 'Wonder_of_the_Seas_in_Cape_Liberty_Bayonne.webp',
  'icon-of-the-seas_01.webp': 'Icon_of_the_Seas_(kahunapulej).webp',
  'star-of-the-seas_01.webp': 'Star_of_the_Seas_Pansio_2024-1.webp',
};

// Build list of available images (including subdirectories)
function getAvailableImages() {
  const images = new Map(); // name -> path relative to ASSETS_SHIPS_DIR

  // Root ships directory
  if (fs.existsSync(ASSETS_SHIPS_DIR)) {
    fs.readdirSync(ASSETS_SHIPS_DIR).forEach(file => {
      const fullPath = path.join(ASSETS_SHIPS_DIR, file);
      if (fs.statSync(fullPath).isDirectory()) {
        // Check subdirectory
        fs.readdirSync(fullPath).forEach(subFile => {
          if (subFile.match(/\.(webp|jpg|jpeg|png)$/i)) {
            images.set(subFile, `${file}/${subFile}`);
          }
        });
      } else if (file.match(/\.(webp|jpg|jpeg|png)$/i)) {
        images.set(file, file);
      }
    });
  }

  return images;
}

// Find missing images referenced in HTML files
function findMissingImages() {
  const missing = new Map();
  const availableImages = getAvailableImages();

  const cruiseLineDirs = fs.readdirSync(SHIPS_DIR)
    .filter(d => fs.statSync(path.join(SHIPS_DIR, d)).isDirectory());

  for (const lineDir of cruiseLineDirs) {
    const linePath = path.join(SHIPS_DIR, lineDir);
    const htmlFiles = fs.readdirSync(linePath).filter(f => f.endsWith('.html'));

    for (const htmlFile of htmlFiles) {
      const filePath = path.join(linePath, htmlFile);
      const content = fs.readFileSync(filePath, 'utf8');

      // Find image references
      const imgMatches = content.matchAll(/src="\/assets\/ships\/([^"]+\.(webp|jpg|jpeg|png))"/gi);

      for (const match of imgMatches) {
        const imgName = match[1];
        // Skip subdirectory paths
        if (imgName.includes('/')) continue;

        if (!availableImages.has(imgName)) {
          if (!missing.has(imgName)) {
            missing.set(imgName, []);
          }
          missing.get(imgName).push(`${lineDir}/${htmlFile}`);
        }
      }
    }
  }

  return missing;
}

// Find best matching existing image for a missing one
function findBestMatch(missingImage, availableImages) {
  // Check direct mapping first
  if (IMAGE_MAPPINGS[missingImage]) {
    if (availableImages.has(IMAGE_MAPPINGS[missingImage])) {
      return availableImages.get(IMAGE_MAPPINGS[missingImage]);
    }
  }

  // Try to find similar image by ship name
  const shipName = missingImage.replace(/[_-]?\d+\.(webp|jpg|jpeg|png)$/i, '').replace(/-/g, '_');
  const shipNameLower = shipName.toLowerCase();

  // First try exact ship name match (e.g., celebrity-apex_01.webp -> celebrity-apex-exterior.jpg)
  for (const [imgName, imgPath] of availableImages) {
    const imgLower = imgName.toLowerCase().replace(/-/g, '_').replace('_exterior', '');
    const targetLower = shipNameLower.replace('_', '-');
    if (imgLower.startsWith(targetLower) || imgLower.includes(shipNameLower)) {
      return imgPath;
    }
  }

  // Then try partial match
  for (const [imgName, imgPath] of availableImages) {
    const imgLower = imgName.toLowerCase().replace(/-/g, '_');
    if (imgLower.includes(shipNameLower) || shipNameLower.includes(imgLower.split('_')[0])) {
      return imgPath;
    }
  }

  return null;
}

// Main
const missing = findMissingImages();
const availableImages = getAvailableImages();

console.log(`Found ${missing.size} missing images referenced across ship pages\n`);

let fixed = 0;
let unfixed = [];

for (const [imgName, files] of missing) {
  const matchPath = findBestMatch(imgName, availableImages);

  if (matchPath) {
    const targetPath = path.join(ASSETS_SHIPS_DIR, imgName);
    const sourcePath = path.join(ASSETS_SHIPS_DIR, matchPath);

    if (!fs.existsSync(targetPath)) {
      try {
        // Create symlink (use relative path from target location)
        fs.symlinkSync(matchPath, targetPath);
        console.log(`✓ Created symlink: ${imgName} -> ${matchPath}`);
        fixed++;
      } catch (e) {
        // If symlink fails, try copy
        try {
          fs.copyFileSync(sourcePath, targetPath);
          console.log(`✓ Copied: ${matchPath} -> ${imgName}`);
          fixed++;
        } catch (e2) {
          console.log(`✗ Failed to create ${imgName}: ${e2.message}`);
          unfixed.push({ img: imgName, files, error: e2.message });
        }
      }
    } else {
      console.log(`- Skipped (exists): ${imgName}`);
    }
  } else {
    unfixed.push({ img: imgName, files: files.slice(0, 3), match: null });
  }
}

console.log(`\n${'='.repeat(60)}`);
console.log(`Fixed: ${fixed} images`);
console.log(`Unfixed: ${unfixed.length} images`);

if (unfixed.length > 0) {
  console.log(`\nUnfixed images (need manual resolution):`);
  unfixed.slice(0, 30).forEach(u => {
    console.log(`  - ${u.img} (used by ${u.files.join(', ')})`);
  });
}
