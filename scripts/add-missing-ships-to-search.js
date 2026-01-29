#!/usr/bin/env node
/**
 * Add missing ships to search-index.json
 */

const fs = require('fs');
const path = require('path');

// Read the missing ships list
const missingShipsFile = '/tmp/missing_ships.txt';
const missingShips = fs.readFileSync(missingShipsFile, 'utf8')
  .split('\n')
  .filter(line => line.trim() && line.endsWith('.html'));

// Read current search-index
const searchIndexPath = 'assets/data/search-index.json';
const searchIndex = JSON.parse(fs.readFileSync(searchIndexPath, 'utf8'));

// Map cruise line directories to names
const cruiseLineMap = {
  'rcl': 'Royal Caribbean',
  'carnival': 'Carnival Cruise Line',
  'celebrity-cruises': 'Celebrity Cruises',
  'norwegian': 'Norwegian Cruise Line',
  'princess': 'Princess Cruises',
  'holland-america-line': 'Holland America Line',
  'msc': 'MSC Cruises',
  'costa': 'Costa Cruises',
  'cunard': 'Cunard',
  'oceania': 'Oceania Cruises',
  'regent': 'Regent Seven Seas',
  'seabourn': 'Seabourn',
  'silversea': 'Silversea Cruises',
  'explora-journeys': 'Explora Journeys',
  'explora': 'Explora Journeys',
  'virgin-voyages': 'Virgin Voyages'
};

// Function to extract ship name from HTML
function extractShipInfo(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');

  // Extract title
  const titleMatch = content.match(/<title>([^—<]+)/);
  let shipName = titleMatch ? titleMatch[1].trim() : null;

  // Extract from ai-breadcrumbs name field if title parsing fails
  if (!shipName) {
    const nameMatch = content.match(/name:\s*([^\n]+)/);
    shipName = nameMatch ? nameMatch[1].trim() : path.basename(filePath, '.html').replace(/-/g, ' ');
  }

  // Get cruise line from path
  const parts = filePath.split('/');
  const cruiseLineDir = parts[1];
  const cruiseLine = cruiseLineMap[cruiseLineDir] || cruiseLineDir;

  // Extract AI summary for description
  const summaryMatch = content.match(/ai-summary"?\s*content="([^"]+)/);
  const description = summaryMatch
    ? summaryMatch[1]
    : `Complete guide to ${shipName} on ${cruiseLine} - deck plans, dining, staterooms, and what makes this ship special.`;

  // Generate keywords
  const keywords = shipName.toLowerCase().split(' ')
    .concat(cruiseLine.toLowerCase().split(' '))
    .filter(w => w.length > 2);

  return {
    title: `${shipName} (${cruiseLine})`,
    url: `/${filePath}`,
    description: description,
    cta: `Explore ${shipName} - deck plans, dining, and cruise information.`,
    category: 'ship',
    keywords: [...new Set(keywords)]
  };
}

// Add missing ships
let addedCount = 0;
for (const shipFile of missingShips) {
  if (!fs.existsSync(shipFile)) {
    console.log(`SKIP: ${shipFile} does not exist`);
    continue;
  }

  try {
    const shipEntry = extractShipInfo(shipFile);

    // Check if already in index
    const alreadyExists = searchIndex.some(entry => entry.url === shipEntry.url);
    if (!alreadyExists) {
      searchIndex.push(shipEntry);
      addedCount++;
      console.log(`ADDED: ${shipEntry.title}`);
    } else {
      console.log(`EXISTS: ${shipEntry.title}`);
    }
  } catch (e) {
    console.log(`ERROR: ${shipFile} - ${e.message}`);
  }
}

// Write updated search-index
fs.writeFileSync(searchIndexPath, JSON.stringify(searchIndex, null, 2));

console.log(`\n===================`);
console.log(`Added ${addedCount} ships to search-index.json`);
console.log(`Total entries now: ${searchIndex.length}`);
