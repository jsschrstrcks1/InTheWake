#!/usr/bin/env node
/**
 * POI Coordinate Validator
 * Soli Deo Gloria
 *
 * Validates POI coordinates to detect points placed in water/ocean.
 * Uses OpenStreetMap Nominatim for reverse geocoding.
 *
 * Usage: node admin/validate-poi-coordinates.js [--fix] [--port=portSlug]
 */

import { readFile, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
  bold: '\x1b[1m',
  dim: '\x1b[2m'
};

// Rate limit delay for Nominatim (1 request per second)
const RATE_LIMIT_MS = 1100;

// Geographic water terms that STRONGLY indicate being IN water (not just near it)
// These are only used when there's no land address components
const DEFINITE_WATER_TYPES = [
  'ocean', 'sea', 'strait', 'gulf', 'channel', 'reef',
  'caribbean sea', 'atlantic ocean', 'pacific ocean', 'indian ocean',
  'mediterranean sea', 'north sea', 'baltic sea', 'norwegian sea'
];

// Terms that could indicate water but often appear in land addresses
// (e.g., "Ward Cove" hamlet, "Buccaneer's Bay" neighborhood)
const WATER_ADJACENT_TERMS = ['bay', 'cove', 'lagoon', 'harbour', 'harbor', 'marina'];

// POI types that are expected to be in/near water
const WATER_ADJACENT_TYPES = ['port', 'beach', 'pier', 'marina'];

/**
 * Sleep for given milliseconds
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Reverse geocode coordinates using Nominatim via curl
 */
function reverseGeocode(lat, lon) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18`;

  try {
    const result = execSync(
      `curl -s "${url}" -H "User-Agent: InTheWake-POI-Validator/1.0"`,
      { encoding: 'utf-8', timeout: 10000 }
    );
    return JSON.parse(result);
  } catch (error) {
    return { error: error.message };
  }
}

/**
 * Check if a Nominatim response indicates water
 */
function isLikelyWater(result) {
  if (result.error) {
    // Nominatim returns an error object for locations it can't geocode (open water)
    if (typeof result.error === 'string' && result.error.includes('Unable to geocode')) {
      return { isWater: true, reason: 'Nominatim unable to geocode (likely open water)' };
    }
    return { isWater: null, reason: `API error: ${result.error}` };
  }

  // Check OSM type and category - most reliable indicators
  const addressType = (result.addresstype || '').toLowerCase();
  const type = (result.type || '').toLowerCase();
  const category = (result.category || '').toLowerCase();

  // Strong water indicators from OSM classification
  if (category === 'natural' && type === 'water') {
    return { isWater: true, reason: 'OSM type: natural/water' };
  }

  if (type === 'ocean' || type === 'sea' || type === 'bay' || type === 'strait') {
    return { isWater: true, reason: `OSM type: ${type}` };
  }

  if (category === 'place' && (type === 'ocean' || type === 'sea')) {
    return { isWater: true, reason: `OSM place type: ${type}` };
  }

  // Check display name for definite water types (only if no land address)
  const displayName = (result.display_name || '').toLowerCase();
  const address = result.address || {};
  const hasLandContext = address.country || address.road || address.building ||
                         address.hamlet || address.village || address.city ||
                         address.neighbourhood || address.suburb;

  for (const indicator of DEFINITE_WATER_TYPES) {
    const regex = new RegExp(`\\b${indicator}\\b`, 'i');
    if (regex.test(displayName) && !hasLandContext) {
      return { isWater: true, reason: `Location indicates open water: ${result.display_name}` };
    }
  }

  // Water-adjacent terms (bay, cove, etc.) are only flagged if there's NO land address
  // Many valid land locations have these terms in their names (e.g., "Ward Cove" hamlet)
  for (const term of WATER_ADJACENT_TERMS) {
    const regex = new RegExp(`\\b${term}\\b`, 'i');
    if (regex.test(displayName) && !hasLandContext) {
      return { isWater: true, reason: `Near water with no land address: ${result.display_name}` };
    }
  }

  // Check if address is missing ALL land components - very suspicious
  const hasFullLandAddress = address.road || address.building || address.house_number ||
                             address.city || address.town || address.village ||
                             address.suburb || address.neighbourhood || address.amenity ||
                             address.county || address.state;

  if (!hasFullLandAddress && !address.country) {
    return { isWater: true, reason: 'No land address components found' };
  }

  return { isWater: false, reason: result.display_name || 'Valid land location' };
}

/**
 * Main validation function
 */
async function validatePOIs(options = {}) {
  const { portFilter, verbose = true, limit = null } = options;

  console.log(`${colors.cyan}${colors.bold}POI Coordinate Validator${colors.reset}`);
  console.log(`${colors.dim}Checking for POIs potentially placed in water...${colors.reset}\n`);

  // Load POI index
  const poiIndexPath = join(PROJECT_ROOT, 'assets/data/maps/poi-index.json');
  const poiIndex = JSON.parse(await readFile(poiIndexPath, 'utf-8'));

  // Extract POIs (skip _meta)
  const pois = Object.entries(poiIndex)
    .filter(([key]) => key !== '_meta')
    .map(([id, data]) => ({ id, ...data }));

  console.log(`${colors.blue}Found ${pois.length} POIs to validate${colors.reset}`);

  // Filter by port if specified
  let toValidate = portFilter
    ? pois.filter(poi => poi.port === portFilter)
    : pois;

  if (portFilter) {
    console.log(`${colors.blue}Filtering to port: ${portFilter} (${toValidate.length} POIs)${colors.reset}`);
  }

  // Apply limit if specified
  if (limit) {
    toValidate = toValidate.slice(0, limit);
    console.log(`${colors.blue}Limited to first ${limit} POIs${colors.reset}`);
  }

  const results = {
    total: toValidate.length,
    checked: 0,
    inWater: [],
    onLand: [],
    errors: [],
    waterAdjacent: []  // POIs that are OK to be near water
  };

  console.log(`\n${colors.cyan}Starting validation (this may take a while due to rate limiting)...${colors.reset}\n`);

  for (let i = 0; i < toValidate.length; i++) {
    const poi = toValidate[i];
    results.checked++;

    // Skip if no coordinates
    if (typeof poi.lat !== 'number' || typeof poi.lon !== 'number') {
      results.errors.push({
        id: poi.id,
        reason: 'Missing coordinates',
        poi
      });
      continue;
    }

    // Progress indicator
    if (verbose) {
      process.stdout.write(`\r${colors.dim}[${i + 1}/${toValidate.length}] Checking ${poi.id}...${colors.reset}`.padEnd(80));
    }

    // Rate limit
    if (i > 0) {
      await sleep(RATE_LIMIT_MS);
    }

    // Reverse geocode
    const geocodeResult = reverseGeocode(poi.lat, poi.lon);
    const waterCheck = isLikelyWater(geocodeResult);

    if (waterCheck.isWater === null) {
      results.errors.push({
        id: poi.id,
        reason: waterCheck.reason,
        poi,
        geocodeResult
      });
    } else if (waterCheck.isWater) {
      // Check if this POI type is expected near water
      if (WATER_ADJACENT_TYPES.includes(poi.type)) {
        results.waterAdjacent.push({
          id: poi.id,
          type: poi.type,
          port: poi.port,
          lat: poi.lat,
          lon: poi.lon,
          reason: waterCheck.reason,
          note: 'Expected near water based on type'
        });
      } else {
        results.inWater.push({
          id: poi.id,
          type: poi.type,
          port: poi.port,
          lat: poi.lat,
          lon: poi.lon,
          reason: waterCheck.reason,
          geocodeResult
        });
      }
    } else {
      results.onLand.push({
        id: poi.id,
        type: poi.type,
        port: poi.port,
        address: waterCheck.reason
      });
    }
  }

  // Clear progress line
  if (verbose) {
    process.stdout.write('\r' + ' '.repeat(80) + '\r');
  }

  return results;
}

/**
 * Print results summary
 */
function printResults(results) {
  console.log(`\n${colors.cyan}${colors.bold}═══════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}                    VALIDATION RESULTS                    ${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}═══════════════════════════════════════════════════════${colors.reset}\n`);

  console.log(`${colors.blue}Total POIs checked: ${results.checked}${colors.reset}`);
  console.log(`${colors.green}✓ On land: ${results.onLand.length}${colors.reset}`);
  console.log(`${colors.yellow}⚠ Water-adjacent (expected): ${results.waterAdjacent.length}${colors.reset}`);
  console.log(`${colors.red}✗ Potentially in water: ${results.inWater.length}${colors.reset}`);
  console.log(`${colors.dim}? Errors: ${results.errors.length}${colors.reset}`);

  if (results.inWater.length > 0) {
    console.log(`\n${colors.red}${colors.bold}POIs POTENTIALLY IN WATER:${colors.reset}`);
    console.log(`${colors.dim}${'─'.repeat(60)}${colors.reset}`);

    // Group by port
    const byPort = {};
    for (const poi of results.inWater) {
      if (!byPort[poi.port]) byPort[poi.port] = [];
      byPort[poi.port].push(poi);
    }

    for (const [port, pois] of Object.entries(byPort).sort()) {
      console.log(`\n${colors.yellow}${port}:${colors.reset}`);
      for (const poi of pois) {
        console.log(`  ${colors.red}✗${colors.reset} ${poi.id}`);
        console.log(`    ${colors.dim}Type: ${poi.type}, Coords: ${poi.lat}, ${poi.lon}${colors.reset}`);
        console.log(`    ${colors.dim}Reason: ${poi.reason}${colors.reset}`);
      }
    }
  }

  if (results.waterAdjacent.length > 0) {
    console.log(`\n${colors.yellow}${colors.bold}WATER-ADJACENT POIs (expected, but verify):${colors.reset}`);
    console.log(`${colors.dim}${'─'.repeat(60)}${colors.reset}`);

    const byPort = {};
    for (const poi of results.waterAdjacent) {
      if (!byPort[poi.port]) byPort[poi.port] = [];
      byPort[poi.port].push(poi);
    }

    for (const [port, pois] of Object.entries(byPort).sort()) {
      console.log(`\n${colors.yellow}${port}:${colors.reset}`);
      for (const poi of pois) {
        console.log(`  ${colors.yellow}⚠${colors.reset} ${poi.id} (${poi.type})`);
        console.log(`    ${colors.dim}Coords: ${poi.lat}, ${poi.lon}${colors.reset}`);
      }
    }
  }

  if (results.errors.length > 0) {
    console.log(`\n${colors.dim}ERRORS:${colors.reset}`);
    for (const err of results.errors) {
      console.log(`  ? ${err.id}: ${err.reason}`);
    }
  }
}

/**
 * Generate JSON report
 */
async function generateReport(results) {
  const reportPath = join(PROJECT_ROOT, 'admin/poi-validation-report.json');

  const report = {
    generated: new Date().toISOString(),
    summary: {
      total: results.checked,
      onLand: results.onLand.length,
      waterAdjacent: results.waterAdjacent.length,
      inWater: results.inWater.length,
      errors: results.errors.length
    },
    inWater: results.inWater,
    waterAdjacent: results.waterAdjacent,
    errors: results.errors
  };

  await writeFile(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n${colors.green}Report saved to: ${reportPath}${colors.reset}`);
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    port: null,
    limit: null,
    verbose: true,
    report: true
  };

  for (const arg of args) {
    if (arg.startsWith('--port=')) {
      options.port = arg.split('=')[1];
    } else if (arg.startsWith('--limit=')) {
      options.limit = parseInt(arg.split('=')[1], 10);
    } else if (arg === '--quiet' || arg === '-q') {
      options.verbose = false;
    } else if (arg === '--no-report') {
      options.report = false;
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
POI Coordinate Validator

Usage: node admin/validate-poi-coordinates.js [options]

Options:
  --port=<slug>    Only validate POIs for a specific port
  --limit=<n>      Limit to first N POIs (for testing)
  --quiet, -q      Suppress progress output
  --no-report      Don't generate JSON report
  --help, -h       Show this help

Examples:
  node admin/validate-poi-coordinates.js --port=aruba
  node admin/validate-poi-coordinates.js --limit=50
  node admin/validate-poi-coordinates.js
`);
      process.exit(0);
    }
  }

  return options;
}

// Main execution
const options = parseArgs();

validatePOIs({
  portFilter: options.port,
  verbose: options.verbose,
  limit: options.limit
}).then(async (results) => {
  printResults(results);

  if (options.report) {
    await generateReport(results);
  }

  // Exit with error code if issues found
  if (results.inWater.length > 0) {
    process.exit(1);
  }
}).catch(error => {
  console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
  process.exit(1);
});
