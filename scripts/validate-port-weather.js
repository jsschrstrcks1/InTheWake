#!/usr/bin/env node
/**
 * Port Weather Guide Validator - STRICT MODE
 *
 * Strictly validates that port pages have the weather component implemented
 * EXACTLY as defined in the Cozumel reference implementation.
 *
 * ZERO TOLERANCE for:
 * - Missing elements
 * - Duplicate elements
 * - Wrong terminology (e.g., "Shoulder" instead of "Transitional")
 * - Invalid data
 *
 * Usage: node scripts/validate-port-weather.js <port-file.html>
 * Example: node scripts/validate-port-weather.js ports/cozumel.html
 */

const fs = require('fs');
const path = require('path');

// ANSI colors for output
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const MAGENTA = '\x1b[35m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

class PortWeatherValidator {
  constructor(filePath) {
    this.filePath = filePath;
    this.content = '';
    this.errors = [];
    this.warnings = [];
    this.passed = [];
  }

  log(type, message) {
    if (type === 'error') {
      this.errors.push(message);
      console.log(`${RED}✗ FAIL:${RESET} ${message}`);
    } else if (type === 'warn') {
      this.warnings.push(message);
      console.log(`${YELLOW}⚠ WARN:${RESET} ${message}`);
    } else if (type === 'pass') {
      this.passed.push(message);
      console.log(`${GREEN}✓ PASS:${RESET} ${message}`);
    } else if (type === 'info') {
      console.log(`${CYAN}ℹ INFO:${RESET} ${message}`);
    } else if (type === 'section') {
      console.log(`\n${MAGENTA}${BOLD}[${message}]${RESET}`);
    }
  }

  loadFile() {
    if (!fs.existsSync(this.filePath)) {
      this.log('error', `File not found: ${this.filePath}`);
      return false;
    }
    this.content = fs.readFileSync(this.filePath, 'utf8');
    return true;
  }

  /**
   * Count occurrences - used to detect duplicates
   */
  countOccurrences(pattern) {
    const regex = typeof pattern === 'string'
      ? new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
      : pattern;
    return (this.content.match(regex) || []).length;
  }

  /**
   * Assert EXACTLY one occurrence - fails on 0 or 2+
   */
  assertExactlyOne(pattern, description) {
    const count = this.countOccurrences(pattern);
    if (count === 0) {
      this.log('error', `MISSING: ${description}`);
      return false;
    } else if (count > 1) {
      this.log('error', `DUPLICATE: ${description} (found ${count} times, expected exactly 1)`);
      return false;
    }
    this.log('pass', `${description} (exactly 1)`);
    return true;
  }

  /**
   * Assert at least one occurrence
   */
  assertAtLeastOne(pattern, description) {
    const count = this.countOccurrences(pattern);
    if (count === 0) {
      this.log('error', `MISSING: ${description}`);
      return false;
    }
    this.log('pass', `${description} (${count} found)`);
    return true;
  }

  /**
   * Assert ZERO occurrences - used to check for forbidden patterns
   */
  assertZero(pattern, description) {
    const count = this.countOccurrences(pattern);
    if (count > 0) {
      this.log('error', `FORBIDDEN: ${description} (found ${count} times)`);
      return false;
    }
    this.log('pass', `No forbidden "${description}"`);
    return true;
  }

  // ========== WEATHER WIDGET CONTAINER CHECKS ==========

  validateWeatherSection() {
    this.log('section', 'WEATHER SECTION STRUCTURE');

    // Must have EXACTLY ONE weather-guide section
    this.assertExactlyOne('id="weather-guide"', 'Section id="weather-guide"');

    // Must have EXACTLY ONE widget container
    this.assertExactlyOne('id="port-weather-widget"', 'Container id="port-weather-widget"');

    // Required data attributes - EXACTLY ONE each
    const requiredAttrs = ['data-port-id', 'data-port-name', 'data-lat', 'data-lon', 'data-region'];
    for (const attr of requiredAttrs) {
      this.assertExactlyOne(new RegExp(`${attr}="[^"]+"`), `Attribute ${attr}`);
    }

    // Validate lat/lon are numeric and valid
    const latMatch = this.content.match(/data-lat="([^"]+)"/);
    const lonMatch = this.content.match(/data-lon="([^"]+)"/);

    if (latMatch) {
      const lat = parseFloat(latMatch[1]);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        this.log('error', `INVALID data-lat: "${latMatch[1]}" (must be -90 to 90)`);
      } else {
        this.log('pass', `Valid latitude: ${lat}`);
      }
    }

    if (lonMatch) {
      const lon = parseFloat(lonMatch[1]);
      if (isNaN(lon) || lon < -180 || lon > 180) {
        this.log('error', `INVALID data-lon: "${lonMatch[1]}" (must be -180 to 180)`);
      } else {
        this.log('pass', `Valid longitude: ${lon}`);
      }
    }

    // CRITICAL: Must include port-weather.js script for weather to be visible
    // Without this script, weather data is ONLY in noscript and won't display to JS users
    const hasWeatherScript = /src=["'][^"']*port-weather\.js["']/.test(this.content);
    if (!hasWeatherScript) {
      this.log('error', 'MISSING: port-weather.js script (weather widget will not populate for JS users)');
    } else {
      this.log('pass', 'port-weather.js script included');
    }

    // Must have EXACTLY ONE noscript in weather section
    // Extract weather widget container and count noscripts within it
    // The widget is closed by </div> after </noscript>
    const weatherSectionMatch = this.content.match(/id="port-weather-widget"[\s\S]*?<\/noscript>\s*<\/div>/);
    if (weatherSectionMatch) {
      const noscriptCount = (weatherSectionMatch[0].match(/<noscript>/g) || []).length;
      if (noscriptCount === 0) {
        this.log('error', 'MISSING: <noscript> fallback in weather widget');
      } else if (noscriptCount > 1) {
        this.log('error', `DUPLICATE: <noscript> in weather widget (found ${noscriptCount})`);
      } else {
        this.log('pass', '<noscript> fallback (exactly 1)');
      }
    } else {
      // Fallback: check if noscript exists after port-weather-widget
      const hasNoscript = /id="port-weather-widget"[\s\S]*?<noscript>/.test(this.content);
      if (!hasNoscript) {
        this.log('error', 'MISSING: <noscript> fallback in weather widget');
      } else {
        this.log('pass', '<noscript> fallback found');
      }
    }
  }

  // ========== SEASONAL GUIDE STRUCTURE CHECKS ==========

  validateSeasonalGuide() {
    this.log('section', 'SEASONAL GUIDE STRUCTURE');

    // Must have EXACTLY ONE seasonal-guide container
    this.assertExactlyOne(/class="seasonal-guide[^"]*"/, 'Container class="seasonal-guide"');

    // FORBIDDEN: Old terminology
    this.assertZero(/Shoulder Season/i, '"Shoulder Season" (must use "Transitional Season")');
    this.assertZero(/cruise-season-shoulder/, 'CSS class "cruise-season-shoulder" (must use "cruise-season-transitional")');

    // Check collapsible sections exist
    this.assertAtLeastOne(/<details class="seasonal-section"/, 'Collapsible <details> sections');
  }

  validateAtAGlance() {
    this.log('section', 'AT A GLANCE SECTION');

    // Must have EXACTLY ONE "At a Glance" title
    this.assertExactlyOne(/>At a Glance</, '"At a Glance" section title');

    // Required items - EXACTLY ONE of each
    const requiredItems = ['Temperature', 'Humidity', 'Rain', 'Wind', 'Daylight'];
    for (const item of requiredItems) {
      this.assertExactlyOne(
        new RegExp(`<span class="glance-label">${item}</span>`),
        `At a Glance: "${item}"`
      );
    }
  }

  validateBestTimeToVisit() {
    this.log('section', 'BEST TIME TO VISIT SECTION');

    // Must have EXACTLY ONE "Best Time to Visit" title
    this.assertExactlyOne(/>Best Time to Visit</, '"Best Time to Visit" section title');

    // Must have EXACTLY ONE cruise-seasons-grid
    this.assertExactlyOne(/cruise-seasons-grid/, 'cruise-seasons-grid');

    // Required seasons - EXACTLY ONE of each
    const requiredSeasons = [
      { label: 'Peak Season', cssClass: 'cruise-season-high' },
      { label: 'Transitional Season', cssClass: 'cruise-season-transitional' },
      { label: 'Low Season', cssClass: 'cruise-season-low' }
    ];

    for (const season of requiredSeasons) {
      this.assertExactlyOne(new RegExp(`>${season.label}<`), `Season label: "${season.label}"`);
      this.assertExactlyOne(new RegExp(season.cssClass), `CSS class: "${season.cssClass}"`);
    }

    // Required activities - EXACTLY ONE of each
    const requiredActivities = ['Beach', 'Snorkeling', 'Hiking', 'City Walking', 'Low Crowds'];
    for (const activity of requiredActivities) {
      this.assertExactlyOne(
        new RegExp(`<span class="activity-label">${activity}</span>`),
        `Activity: "${activity}"`
      );
    }

    // Must have EXACTLY ONE months-to-avoid
    this.assertExactlyOne(/months-to-avoid/, 'months-to-avoid section');
  }

  validateCatchesOffGuard() {
    this.log('section', 'WHAT CATCHES VISITORS OFF GUARD');

    // Must have EXACTLY ONE section title
    this.assertExactlyOne(/>What Catches Visitors Off Guard</, '"What Catches Visitors Off Guard" section title');

    // Must have EXACTLY ONE catches-list
    const catchesCount = this.countOccurrences(/class="catches-list"/);
    if (catchesCount === 0) {
      this.log('error', 'MISSING: catches-list');
    } else if (catchesCount > 1) {
      this.log('error', `DUPLICATE: catches-list (found ${catchesCount})`);
    } else {
      this.log('pass', 'catches-list (exactly 1)');

      // Count items - must have at least 3, max 7
      const catchesMatch = this.content.match(/class="catches-list"[\s\S]*?<\/ul>/);
      if (catchesMatch) {
        const itemCount = (catchesMatch[0].match(/<li>/g) || []).length;
        if (itemCount < 3) {
          this.log('error', `catches-list has ${itemCount} items (minimum 3 required)`);
        } else if (itemCount > 7) {
          this.log('warn', `catches-list has ${itemCount} items (max 7 recommended)`);
        } else {
          this.log('pass', `catches-list has ${itemCount} items`);
        }
      }
    }
  }

  validatePackingTips() {
    this.log('section', 'PACKING TIPS');

    // Must have EXACTLY ONE section title
    this.assertExactlyOne(/>Packing Tips</, '"Packing Tips" section title');

    // Must have EXACTLY ONE packing-list
    const packingCount = this.countOccurrences(/class="packing-list"/);
    if (packingCount === 0) {
      this.log('error', 'MISSING: packing-list');
    } else if (packingCount > 1) {
      this.log('error', `DUPLICATE: packing-list (found ${packingCount})`);
    } else {
      this.log('pass', 'packing-list (exactly 1)');

      // Count items - must have at least 3, max 7
      const packingMatch = this.content.match(/class="packing-list"[\s\S]*?<\/ul>/);
      if (packingMatch) {
        const itemCount = (packingMatch[0].match(/<li>/g) || []).length;
        if (itemCount < 3) {
          this.log('error', `packing-list has ${itemCount} items (minimum 3 required)`);
        } else if (itemCount > 7) {
          this.log('warn', `packing-list has ${itemCount} items (max 7 recommended)`);
        } else {
          this.log('pass', `packing-list has ${itemCount} items`);
        }
      }
    }
  }

  validateWeatherHazards() {
    this.log('section', 'WEATHER HAZARDS');

    // Must have EXACTLY ONE section title
    this.assertExactlyOne(/>Weather Hazards</, '"Weather Hazards" section title');

    // Must have EXACTLY ONE hazard-warning
    this.assertExactlyOne(/class="hazard-warning"/, 'hazard-warning block');

    // Check for hurricane zone info based on region
    const regionMatch = this.content.match(/data-region="([^"]+)"/);
    const region = regionMatch ? regionMatch[1] : '';

    const hurricaneRegions = ['Caribbean', 'Mexico (Pacific)', 'Hawaii', 'Asia', 'Australia', 'South Pacific'];
    if (hurricaneRegions.includes(region)) {
      if (!this.content.includes('Hurricane Zone') && !this.content.includes('Cyclone')) {
        this.log('error', `Port in ${region} MUST mention hurricane/cyclone zone`);
      } else {
        this.log('pass', 'Has hurricane/cyclone zone warning');
      }
    }
  }

  // ========== FAQ VALIDATION ==========

  validateWeatherFAQ() {
    this.log('section', 'WEATHER FAQ QUESTIONS');

    // Required weather FAQ patterns
    const requiredFAQs = [
      { pattern: /Q:.*best time.*year.*visit|Q:.*when.*visit/i, name: 'Best time to visit' },
      { pattern: /Q:.*hurricane|Q:.*cyclone|Q:.*storm season/i, name: 'Hurricane/storm season' },
      { pattern: /Q:.*pack.*weather|Q:.*what.*pack/i, name: 'Packing for weather' },
      { pattern: /Q:.*rain.*ruin|Q:.*afternoon.*rain/i, name: 'Rain concerns' }
    ];

    for (const faq of requiredFAQs) {
      const count = this.countOccurrences(faq.pattern);
      if (count === 0) {
        this.log('error', `MISSING FAQ: ${faq.name}`);
      } else if (count > 1) {
        this.log('error', `DUPLICATE FAQ: ${faq.name} (found ${count} times)`);
      } else {
        this.log('pass', `FAQ: ${faq.name} (exactly 1)`);
      }
    }

    // Check FAQPage schema
    const schemaCount = this.countOccurrences(/"@type": "FAQPage"/);
    if (schemaCount === 0) {
      this.log('error', 'MISSING: FAQPage schema (required for SEO)');
    } else if (schemaCount > 1) {
      this.log('error', `DUPLICATE: FAQPage schema (found ${schemaCount})`);
    } else {
      this.log('pass', 'FAQPage schema (exactly 1)');

      // Count questions in schema - should match visible FAQ count
      // Support multiple FAQ formats:
      // - <p><strong>Q: (inline format)
      // - <summary...>Q: (collapsible details format)
      const schemaQuestions = this.countOccurrences(/"@type": "Question"/);
      const inlineQuestions = this.countOccurrences(/<p><strong>Q:/);
      const collapsibleQuestions = this.countOccurrences(/<summary[^>]*>Q:/);
      const visibleQuestions = inlineQuestions + collapsibleQuestions;

      if (schemaQuestions !== visibleQuestions) {
        this.log('error', `FAQ count mismatch: schema has ${schemaQuestions}, page has ${visibleQuestions}`);
      } else {
        this.log('pass', `FAQ count matches: ${schemaQuestions} in schema, ${visibleQuestions} on page`);
      }
    }
  }

  // ========== DUPLICATE CONTENT DETECTION ==========

  validateNoDuplicateContent() {
    this.log('section', 'DUPLICATE CONTENT DETECTION');

    // Check for duplicate seasonal data values
    // Temperature ranges should appear only twice (once in noscript, once rendered by JS - but in static HTML, just once)
    const tempRanges = this.content.match(/\d+-\d+°F year-round/g) || [];
    if (tempRanges.length > 1) {
      // Check if they're identical (allowed if one is in noscript)
      const unique = [...new Set(tempRanges)];
      if (unique.length === 1) {
        this.log('pass', 'Temperature range appears in noscript only (will be replaced by JS)');
      } else {
        this.log('error', `CONFLICTING temperature ranges found: ${unique.join(', ')}`);
      }
    } else if (tempRanges.length === 1) {
      this.log('pass', 'Temperature range appears exactly once');
    }

    // Check for duplicate hurricane season dates
    const hurricaneDates = this.content.match(/Jun 1\s*[–-]\s*Nov 30/g) || [];
    // In noscript + FAQ is acceptable (2 occurrences)
    if (hurricaneDates.length > 2) {
      this.log('error', `Hurricane season dates appear ${hurricaneDates.length} times (max 2: noscript + FAQ)`);
    } else if (hurricaneDates.length === 2) {
      this.log('pass', 'Hurricane season dates: once in guide, once in FAQ');
    } else if (hurricaneDates.length === 1) {
      this.log('pass', 'Hurricane season dates appear once');
    }

    // Check cruise seasons aren't duplicated
    const peakSeasonLabels = this.countOccurrences(/>Peak Season</);
    if (peakSeasonLabels > 1) {
      this.log('error', `"Peak Season" label appears ${peakSeasonLabels} times (expected 1)`);
    }

    const transitionalLabels = this.countOccurrences(/>Transitional Season</);
    if (transitionalLabels > 1) {
      this.log('error', `"Transitional Season" label appears ${transitionalLabels} times (expected 1)`);
    }

    const lowSeasonLabels = this.countOccurrences(/>Low Season</);
    if (lowSeasonLabels > 1) {
      this.log('error', `"Low Season" label appears ${lowSeasonLabels} times (expected 1)`);
    }
  }

  // ========== DATA ACCURACY VALIDATION ==========

  validateDataAccuracy() {
    this.log('section', 'DATA ACCURACY');

    // Extract port name
    const portNameMatch = this.content.match(/data-port-name="([^"]+)"/);
    const portName = portNameMatch ? portNameMatch[1] : 'Unknown';
    this.log('info', `Validating data for: ${portName}`);

    // Check that months in best-months-activities are valid
    const validMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const validSpecialValues = ['N/A', 'None', '-']; // Allow these for non-applicable activities

    // Find all month sequences in activity-months spans
    const monthSpans = this.content.match(/class="activity-months">([^<]+)</g) || [];
    let hasInvalidMonth = false;
    for (const span of monthSpans) {
      const monthsStr = span.replace(/class="activity-months">|</g, '').trim();
      // Allow special values for activities that don't apply
      if (validSpecialValues.includes(monthsStr)) continue;
      const months = monthsStr.split(/,\s*/);
      for (const month of months) {
        if (!validMonths.includes(month.trim())) {
          this.log('error', `INVALID month abbreviation: "${month.trim()}"`);
          hasInvalidMonth = true;
        }
      }
    }
    if (!hasInvalidMonth) {
      this.log('pass', 'All month abbreviations are valid');
    }

    // Check season-months for valid months
    const seasonSpans = this.content.match(/class="season-months">([^<]+)</g) || [];
    for (const span of seasonSpans) {
      const monthsStr = span.replace(/class="season-months">|</g, '');
      const months = monthsStr.split(/,\s*/);
      for (const month of months) {
        if (!validMonths.includes(month.trim())) {
          this.log('error', `INVALID month in season: "${month.trim()}"`);
        }
      }
    }

    // Validate avoid_months are present in Low Season
    const avoidMonthsMatch = this.content.match(/class="avoid-months">([^<]+)</);
    const lowSeasonMatch = this.content.match(/cruise-season-low[\s\S]*?class="season-months">([^<]+)</);

    if (avoidMonthsMatch && lowSeasonMatch) {
      const avoidMonths = avoidMonthsMatch[1].split(/,\s*/);
      const lowSeasonMonths = lowSeasonMatch[1].split(/,\s*/);

      for (const month of avoidMonths) {
        if (!lowSeasonMonths.includes(month.trim())) {
          this.log('warn', `Avoid month "${month.trim()}" should be in Low Season`);
        }
      }
    }
  }

  // ========== MAIN VALIDATION ==========

  validate() {
    console.log(`\n${BOLD}${CYAN}╔════════════════════════════════════════════════════════════════════╗${RESET}`);
    console.log(`${BOLD}${CYAN}║  PORT WEATHER GUIDE VALIDATOR - STRICT MODE                        ║${RESET}`);
    console.log(`${BOLD}${CYAN}║  Zero tolerance for duplicates, missing elements, or wrong data    ║${RESET}`);
    console.log(`${BOLD}${CYAN}╚════════════════════════════════════════════════════════════════════╝${RESET}`);
    console.log(`\n${BOLD}File:${RESET} ${this.filePath}`);

    if (!this.loadFile()) {
      return false;
    }

    // Extract port info for display
    const portIdMatch = this.content.match(/data-port-id="([^"]+)"/);
    const portNameMatch = this.content.match(/data-port-name="([^"]+)"/);
    if (portIdMatch && portNameMatch) {
      console.log(`${BOLD}Port ID:${RESET} ${portIdMatch[1]}`);
      console.log(`${BOLD}Port Name:${RESET} ${portNameMatch[1]}`);
    }

    // Run all validations
    this.validateWeatherSection();
    this.validateSeasonalGuide();
    this.validateAtAGlance();
    this.validateBestTimeToVisit();
    this.validateCatchesOffGuard();
    this.validatePackingTips();
    this.validateWeatherHazards();
    this.validateWeatherFAQ();
    this.validateNoDuplicateContent();
    this.validateDataAccuracy();

    // Summary
    console.log(`\n${BOLD}════════════════════════════════════════════════════════════════════════${RESET}`);
    console.log(`${BOLD}VALIDATION SUMMARY${RESET}`);
    console.log(`════════════════════════════════════════════════════════════════════════`);
    console.log(`${GREEN}✓ Passed:   ${this.passed.length}${RESET}`);
    console.log(`${YELLOW}⚠ Warnings: ${this.warnings.length}${RESET}`);
    console.log(`${RED}✗ Errors:   ${this.errors.length}${RESET}`);

    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log(`\n${GREEN}${BOLD}════════════════════════════════════════════════════════════════════════${RESET}`);
      console.log(`${GREEN}${BOLD}  ✓ PERFECT - ALL CHECKS PASSED${RESET}`);
      console.log(`${GREEN}${BOLD}════════════════════════════════════════════════════════════════════════${RESET}`);
      return true;
    } else if (this.errors.length === 0) {
      console.log(`\n${YELLOW}${BOLD}════════════════════════════════════════════════════════════════════════${RESET}`);
      console.log(`${YELLOW}${BOLD}  ⚠ PASSED WITH WARNINGS${RESET}`);
      console.log(`${YELLOW}${BOLD}════════════════════════════════════════════════════════════════════════${RESET}`);
      return true;
    } else {
      console.log(`\n${RED}${BOLD}════════════════════════════════════════════════════════════════════════${RESET}`);
      console.log(`${RED}${BOLD}  ✗ VALIDATION FAILED - ${this.errors.length} ERROR(S)${RESET}`);
      console.log(`${RED}${BOLD}════════════════════════════════════════════════════════════════════════${RESET}`);
      console.log(`\n${RED}Errors to fix:${RESET}`);
      this.errors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`));
      return false;
    }
  }
}

// CLI execution
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log(`
${BOLD}Port Weather Guide Validator - STRICT MODE${RESET}

Usage: node scripts/validate-port-weather.js <port-file.html>

Examples:
  node scripts/validate-port-weather.js ports/cozumel.html
  node scripts/validate-port-weather.js ports/costa-maya.html

${BOLD}Strict Checks:${RESET}
  ✓ EXACTLY ONE of each required element (no duplicates)
  ✓ ZERO forbidden patterns (e.g., "Shoulder Season")
  ✓ Valid coordinates (lat -90 to 90, lon -180 to 180)
  ✓ Valid month abbreviations only
  ✓ Matching FAQ count in schema vs page
  ✓ No conflicting data values
  ✓ Required weather FAQs present

${BOLD}Required Sections:${RESET}
  • At a Glance (Temperature, Humidity, Rain, Wind, Daylight)
  • Best Time to Visit (Peak, Transitional, Low seasons + activities)
  • What Catches Visitors Off Guard (3-7 items)
  • Packing Tips (3-7 items)
  • Weather Hazards (hurricane zone for Caribbean/Pacific)

${BOLD}Required FAQs:${RESET}
  • Best time of year to visit
  • Hurricane/storm season
  • Packing for weather
  • Rain concerns
`);
  process.exit(0);
}

const validator = new PortWeatherValidator(args[0]);
const success = validator.validate();
process.exit(success ? 0 : 1);
