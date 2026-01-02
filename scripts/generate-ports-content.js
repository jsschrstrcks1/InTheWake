#!/usr/bin/env node
/**
 * Generates updated port list content for ports.html
 * Organizes all 333 ports by region with descriptions
 */
const fs = require('fs');
const path = require('path');

// Load port summaries
const summaries = require('../assets/data/ports/port-summaries.json');

// Define region mappings for "other" ports
const regionOverrides = {
  // Middle East & Red Sea
  'abu-dhabi': 'middle-east', 'doha': 'middle-east', 'dubai': 'middle-east',
  'aqaba': 'middle-east', 'hurghada': 'middle-east', 'safaga': 'middle-east',
  'muscat': 'middle-east', 'salalah': 'middle-east', 'suez': 'middle-east',

  // Africa
  'agadir': 'africa', 'casablanca': 'africa', 'tangier': 'africa', 'tunis': 'africa',
  'dakar': 'africa', 'durban': 'africa', 'cape-town': 'africa', 'luanda': 'africa',
  'port-elizabeth': 'africa', 'maputo': 'africa', 'mombasa': 'africa',
  'walvis-bay': 'africa', 'mindelo': 'africa', 'praia': 'africa',
  'sao-tome': 'africa', 'st-helena': 'africa', 'ascension': 'africa',

  // Canary Islands
  'gran-canaria': 'canary-islands', 'lanzarote': 'canary-islands',
  'tenerife': 'canary-islands', 'santa-cruz-de-la-palma': 'canary-islands',

  // Mexican Pacific & Central America
  'acapulco': 'mexico-pacific', 'cabo-san-lucas': 'mexico-pacific',
  'ensenada': 'mexico-pacific', 'huatulco': 'mexico-pacific',
  'manzanillo': 'mexico-pacific', 'mazatlan': 'mexico-pacific',
  'puerto-vallarta': 'mexico-pacific', 'zihuatanejo': 'mexico-pacific',
  'colon': 'central-america', 'corinto': 'central-america',
  'puerto-limon': 'central-america', 'puntarenas': 'central-america',
  'gatun-lake': 'panama-canal',

  // South America
  'buenos-aires': 'south-america', 'callao': 'south-america',
  'fortaleza': 'south-america', 'guayaquil': 'south-america',
  'manta': 'south-america', 'manaus': 'south-america',
  'montevideo': 'south-america', 'rio-de-janeiro': 'south-america',
  'santos': 'south-america', 'valparaiso': 'south-america',
  'ushuaia': 'south-america', 'punta-arenas': 'south-america',
  'punta-del-este': 'south-america', 'recife': 'south-america',
  'salvador': 'south-america', 'falkland-islands': 'south-america',
  'puerto-madryn': 'south-america', 'easter-island': 'south-america',

  // US Homeports
  'baltimore': 'us-homeports', 'cape-liberty': 'us-homeports',
  'charleston': 'us-homeports', 'ft-lauderdale': 'us-homeports',
  'galveston': 'us-homeports', 'jacksonville': 'us-homeports',
  'los-angeles': 'us-homeports', 'miami': 'us-homeports',
  'mobile': 'us-homeports', 'new-orleans': 'us-homeports',
  'new-york': 'us-homeports', 'port-canaveral': 'us-homeports',
  'port-everglades': 'us-homeports', 'port-miami': 'us-homeports',
  'san-diego': 'us-homeports', 'san-francisco': 'us-homeports',
  'san-pedro': 'us-homeports', 'tampa': 'us-homeports',

  // South Pacific
  'bora-bora': 'south-pacific', 'fiji': 'south-pacific', 'lautoka': 'south-pacific',
  'guam': 'south-pacific', 'papeete': 'south-pacific', 'moorea': 'south-pacific',
  'noumea': 'south-pacific', 'lifou': 'south-pacific', 'dravuni': 'south-pacific',
  'rarotonga': 'south-pacific', 'apia': 'south-pacific', 'tonga': 'south-pacific',
  'vanuatu': 'south-pacific', 'pago-pago': 'south-pacific', 'port-vila': 'south-pacific',
  'suva': 'south-pacific',

  // Indian Ocean
  'maldives': 'indian-ocean', 'mauritius': 'indian-ocean',
  'seychelles': 'indian-ocean', 'reunion': 'indian-ocean',
  'cochin': 'indian-ocean', 'goa': 'indian-ocean', 'mumbai': 'indian-ocean',
  'colombo': 'indian-ocean', 'port-louis': 'indian-ocean',

  // Australia/New Zealand (already in pacific, move to separate)
  'bay-of-islands': 'australia-nz', 'christchurch': 'australia-nz',
  'doubtful-sound': 'australia-nz', 'milford-sound': 'australia-nz',

  // Mediterranean additions
  'bordeaux': 'mediterranean', 'funchal': 'mediterranean', 'gijon': 'mediterranean',
  'la-coruna': 'mediterranean', 'portimao': 'mediterranean', 'porto': 'mediterranean',
  'vigo': 'mediterranean',

  // Northern Europe
  'hamburg': 'northern-europe', 'southampton': 'northern-europe',
  'ijmuiden': 'northern-europe', 'rotterdam': 'northern-europe',
  'zeebrugge': 'northern-europe',

  // Expedition/Remote
  'tristan-da-cunha': 'expedition', 'svalbard': 'expedition',
  'greenland': 'expedition', 'longyearbyen': 'expedition'
};

// Region display names and order
const regionConfig = {
  'caribbean': { name: 'Caribbean & Bahamas', order: 1 },
  'alaska': { name: 'Alaska', order: 2 },
  'mexico-pacific': { name: 'Mexican Riviera', order: 3 },
  'mediterranean': { name: 'Mediterranean', order: 4 },
  'northern-europe': { name: 'Northern Europe & British Isles', order: 5 },
  'canary-islands': { name: 'Canary Islands & Atlantic', order: 6 },
  'new-england': { name: 'Canada & New England', order: 7 },
  'pacific': { name: 'Hawaii & Pacific', order: 8 },
  'australia-nz': { name: 'Australia & New Zealand', order: 9 },
  'south-pacific': { name: 'South Pacific Islands', order: 10 },
  'asia': { name: 'Asia', order: 11 },
  'middle-east': { name: 'Middle East & Red Sea', order: 12 },
  'indian-ocean': { name: 'Indian Ocean', order: 13 },
  'africa': { name: 'Africa', order: 14 },
  'south-america': { name: 'South America', order: 15 },
  'central-america': { name: 'Central America & Panama', order: 16 },
  'panama-canal': { name: 'Panama Canal', order: 17 },
  'us-homeports': { name: 'US Embarkation Ports', order: 18 },
  'expedition': { name: 'Expedition & Remote Ports', order: 19 },
  'other': { name: 'Other Destinations', order: 20 }
};

// Organize ports by region
const portsByRegion = {};

for (const port of summaries.ports) {
  // Determine region
  let region = port.region;
  if (region === 'other' && regionOverrides[port.slug]) {
    region = regionOverrides[port.slug];
  }

  if (!portsByRegion[region]) {
    portsByRegion[region] = [];
  }

  // Clean up description
  let desc = port.description;
  if (desc.startsWith('First-person')) {
    desc = desc.replace(/^First-person (?:logbook )?guide (?:to )?/i, '');
  }
  if (desc.length > 80) {
    desc = desc.substring(0, 77) + '...';
  }

  portsByRegion[region].push({
    ...port,
    cleanDesc: desc
  });
}

// Sort ports within each region alphabetically
for (const region of Object.keys(portsByRegion)) {
  portsByRegion[region].sort((a, b) => a.name.localeCompare(b.name));
}

// Generate HTML output
console.log('<!-- GENERATED PORT LISTS BY REGION -->');
console.log('');

const sortedRegions = Object.entries(portsByRegion)
  .map(([key, ports]) => ({
    key,
    ports,
    config: regionConfig[key] || { name: key, order: 99 }
  }))
  .sort((a, b) => a.config.order - b.config.order);

for (const { key, ports, config } of sortedRegions) {
  console.log(`<h3>${config.name} (${ports.length} ports)</h3>`);
  console.log('<ul class="cols-2">');
  for (const port of ports) {
    console.log(`  <li><strong><a href="${port.url}">${port.name}</a></strong> — ${port.cleanDesc}</li>`);
  }
  console.log('</ul>');
  console.log('');
}

console.log('<!-- Total: ' + summaries.ports.length + ' ports -->');
