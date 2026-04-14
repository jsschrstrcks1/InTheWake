#!/usr/bin/env node
/**
 * validate-port-weather.js
 * Port Weather Guide Validator v2.0 - CLI Runner
 * 
 * Version: 2.0.0
 * Last Updated: 2025-12-31
 * 
 * Usage:
 *   node validate-port-weather.js ports/cozumel.html
 *   node validate-port-weather.js --all ./ports/
 *   node validate-port-weather.js --strict --json --all ./ports/
 */

const fs = require('fs');
const path = require('path');
const { PortWeatherValidator, crossPageCheck } = require('./port-weather-validator-core');

// ANSI colors
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const MAGENTA = '\x1b[35m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';

function printReport(report, options) {
  if (options.json) return;
  
  console.log(`\n${BOLD}${CYAN}========================================${RESET}`);
  console.log(`${BOLD}File:${RESET} ${report.file}`);
  console.log(`${BOLD}Port:${RESET} ${report.portName} (Tier ${report.tier || '?'})`);
  console.log(`${BOLD}Region:${RESET} ${report.region || 'Unknown'}`);
  console.log(`${CYAN}========================================${RESET}`);

  // Print errors
  if (report.errors.length > 0) {
    console.log(`\n${RED}${BOLD}ERRORS (${report.errors.length}):${RESET}`);
    report.errors.forEach(e => {
      console.log(`  ${RED}x${RESET} [${e.code}] ${e.message}`);
      if (e.detail) console.log(`    ${DIM}${e.detail}${RESET}`);
      if (e.suggestion) console.log(`    ${CYAN}-> ${e.suggestion}${RESET}`);
    });
  }

  // Print warnings
  if (report.warnings.length > 0) {
    console.log(`\n${YELLOW}${BOLD}WARNINGS (${report.warnings.length}):${RESET}`);
    report.warnings.forEach(w => {
      console.log(`  ${YELLOW}!${RESET} [${w.code}] ${w.message}`);
      if (w.detail) console.log(`    ${DIM}${w.detail}${RESET}`);
      if (w.suggestion) console.log(`    ${CYAN}-> ${w.suggestion}${RESET}`);
    });
  }

  // Print passed (verbose only)
  if (options.verbose && report.passed.length > 0) {
    console.log(`\n${GREEN}${BOLD}PASSED (${report.passed.length}):${RESET}`);
    report.passed.forEach(p => {
      console.log(`  ${GREEN}v${RESET} [${p.code}] ${p.message}`);
    });
  }

  // Summary
  console.log(`\n${BOLD}SUMMARY:${RESET}`);
  console.log(`  ${GREEN}v Passed:${RESET}   ${report.summary.passed}`);
  console.log(`  ${YELLOW}! Warnings:${RESET} ${report.summary.warnings}`);
  console.log(`  ${RED}x Errors:${RESET}   ${report.summary.errors}`);

  if (report.summary.status === 'PASS') {
    console.log(`\n${GREEN}${BOLD}v ALL CHECKS PASSED${RESET}`);
  } else if (report.summary.status === 'WARN') {
    console.log(`\n${YELLOW}${BOLD}! PASSED WITH WARNINGS${RESET}`);
  } else {
    console.log(`\n${RED}${BOLD}x VALIDATION FAILED${RESET}`);
  }
}

function printCrossPage(results, options) {
  if (options.json) return;
  if (results.errors.length === 0 && results.warnings.length === 0) {
    console.log(`\n${GREEN}v No cross-page similarity issues${RESET}`);
    return;
  }

  console.log(`\n${MAGENTA}${BOLD}--- CROSS-PAGE SIMILARITY ---${RESET}`);
  results.errors.forEach(e => console.log(`  ${RED}x${RESET} [${e.code}] ${e.message}`));
  results.warnings.forEach(w => console.log(`  ${YELLOW}!${RESET} [${w.code}] ${w.message}`));
}

function printHelp() {
  console.log(`
${BOLD}Port Weather Guide Validator v2.0${RESET}

${BOLD}Usage:${RESET}
  node validate-port-weather.js file.html
  node validate-port-weather.js --all directory
  node validate-port-weather.js [options] files...

${BOLD}Options:${RESET}
  --all dir    Validate all .html files in directory
  --strict     Exit with error on warnings
  --json       Output as JSON
  --verbose    Show passed checks
  --help       Show this help

${BOLD}Validation Layers:${RESET}
  ${CYAN}1. STRUCTURE${RESET}    - HTML elements, IDs, classes, data attributes
  ${CYAN}2. DATA${RESET}         - Month abbreviations, FAQ schema, avoid months
  ${CYAN}3. DE-DUPLICATION${RESET} - Forbidden terms, similar headers, season labels
  ${CYAN}4. SPECIFICITY${RESET}  - Coordinates, local anchors, climate patterns
  ${CYAN}5. CROSS-PAGE${RESET}   - Jaccard similarity between ports (--all mode)

${BOLD}Required Elements:${RESET}
  - Section id="weather-guide"
  - Container id="port-weather-widget" with data-lat, data-lon, etc.
  - At a Glance: Temperature, Humidity, Rain, Wind, Daylight
  - Best Time: Peak/Transitional/Low seasons + 5 activities
  - catches-list (3-7 items)
  - packing-list (3-7 items)
  - Weather Hazards with hazard-warning
  - 4 required FAQ topics + FAQPage schema

${BOLD}Forbidden Terms:${RESET}
  - "Shoulder Season" -> "Transitional Season"
  - "Best Months for" -> "Best Time to Visit"
  - "Weather Guide" -> "Weather & Best Time to Visit"
`);
}

// Main CLI
const args = process.argv.slice(2);

if (args.length === 0 || args.includes('--help')) {
  printHelp();
  process.exit(0);
}

const options = {
  strict: args.includes('--strict'),
  json: args.includes('--json'),
  verbose: args.includes('--verbose')
};

// Collect files
let files = [];
const allIdx = args.indexOf('--all');

if (allIdx !== -1 && args[allIdx + 1]) {
  const dir = args[allIdx + 1];
  if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
    files = fs.readdirSync(dir).filter(f => f.endsWith('.html')).map(f => path.join(dir, f));
  } else {
    console.error(`${RED}Directory not found: ${dir}${RESET}`);
    process.exit(1);
  }
} else {
  files = args.filter(a => !a.startsWith('--') && a !== args[allIdx + 1]);
}

if (files.length === 0) {
  console.error(`${RED}No files to validate${RESET}`);
  process.exit(1);
}

// Run validation
const reports = {};

if (!options.json) {
  console.log(`${BOLD}${CYAN}+------------------------------------------------------------+${RESET}`);
  console.log(`${BOLD}${CYAN}|  PORT WEATHER VALIDATOR v2.0 - STRICT + SEMANTIC           |${RESET}`);
  console.log(`${BOLD}${CYAN}+------------------------------------------------------------+${RESET}`);
}

files.forEach(file => {
  const validator = new PortWeatherValidator(file, options);
  const report = validator.validate();
  reports[report.port] = report;
  printReport(report, options);
});

// Cross-page check
let crossResults = { warnings: [], errors: [] };
if (files.length > 1) {
  crossResults = crossPageCheck(reports);
  printCrossPage(crossResults, options);
}

// JSON output
if (options.json) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    files: files.length,
    reports: Object.values(reports),
    crossPage: crossResults,
    summary: {
      passed: Object.values(reports).filter(r => r.summary.status === 'PASS').length,
      warned: Object.values(reports).filter(r => r.summary.status === 'WARN').length,
      failed: Object.values(reports).filter(r => r.summary.status === 'FAIL').length
    }
  }, null, 2));
}

// Final summary for multiple files
if (files.length > 1 && !options.json) {
  const passed = Object.values(reports).filter(r => r.summary.status === 'PASS').length;
  const warned = Object.values(reports).filter(r => r.summary.status === 'WARN').length;
  const failed = Object.values(reports).filter(r => r.summary.status === 'FAIL').length;

  console.log(`\n${BOLD}${CYAN}========================================${RESET}`);
  console.log(`${BOLD}FINAL: ${files.length} files validated${RESET}`);
  console.log(`${CYAN}========================================${RESET}`);
  console.log(`  ${GREEN}v Passed:${RESET} ${passed}`);
  console.log(`  ${YELLOW}! Warned:${RESET} ${warned}`);
  console.log(`  ${RED}x Failed:${RESET} ${failed}`);

  if (failed > 0) {
    console.log(`\n${RED}Failed files:${RESET}`);
    Object.values(reports)
      .filter(r => r.summary.status === 'FAIL')
      .forEach(r => console.log(`  - ${r.file}`));
  }
}

// Exit code
const hasErrors = Object.values(reports).some(r => r.summary.status === 'FAIL') || crossResults.errors.length > 0;
const hasWarnings = Object.values(reports).some(r => r.summary.status === 'WARN') || crossResults.warnings.length > 0;

process.exit(hasErrors ? 1 : (options.strict && hasWarnings ? 1 : 0));
