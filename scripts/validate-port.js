#!/usr/bin/env node
/**
 * Port Page Validator - MASTER VALIDATOR
 *
 * Comprehensive validation for port pages. Runs all sub-validators
 * and requires 100% pass rate from each.
 *
 * BLOCKING REQUIREMENTS:
 * - Weather validator MUST pass 100% (zero errors)
 * - All other validators MUST pass 100%
 *
 * Usage: node scripts/validate-port.js <port-file.html>
 * Example: node scripts/validate-port.js ports/cozumel.html
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');

// ANSI colors
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const MAGENTA = '\x1b[35m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

class PortValidator {
  constructor(filePath) {
    this.filePath = filePath;
    this.content = '';
    this.errors = [];
    this.warnings = [];
    this.passed = [];
    this.subValidatorResults = [];
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
      console.log(`\n${MAGENTA}${BOLD}════════════════════════════════════════════════════════════════════════${RESET}`);
      console.log(`${MAGENTA}${BOLD}  ${message}${RESET}`);
      console.log(`${MAGENTA}${BOLD}════════════════════════════════════════════════════════════════════════${RESET}`);
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
   * Run a sub-validator script
   * Returns true if validator passes (exit code 0), false otherwise
   */
  runSubValidator(scriptPath, description) {
    const fullPath = path.join(__dirname, scriptPath);

    if (!fs.existsSync(fullPath)) {
      this.log('error', `Sub-validator not found: ${scriptPath}`);
      return false;
    }

    console.log(`\n${CYAN}Running: ${description}${RESET}`);
    console.log(`${CYAN}${'─'.repeat(70)}${RESET}\n`);

    try {
      const result = spawnSync('node', [fullPath, this.filePath], {
        stdio: 'inherit',
        encoding: 'utf8'
      });

      const passed = result.status === 0;

      this.subValidatorResults.push({
        name: description,
        script: scriptPath,
        passed: passed,
        exitCode: result.status
      });

      return passed;
    } catch (err) {
      this.log('error', `Failed to run ${scriptPath}: ${err.message}`);
      return false;
    }
  }

  /**
   * Validate basic port page structure
   */
  validateBasicStructure() {
    this.log('section', 'BASIC PORT PAGE STRUCTURE');

    // Check for required meta tags
    if (!this.content.includes('<meta charset="')) {
      this.log('error', 'Missing charset meta tag');
    } else {
      this.log('pass', 'Has charset meta tag');
    }

    if (!this.content.includes('<meta name="viewport"')) {
      this.log('error', 'Missing viewport meta tag');
    } else {
      this.log('pass', 'Has viewport meta tag');
    }

    // Check for title
    if (!/<title>[^<]+<\/title>/.test(this.content)) {
      this.log('error', 'Missing or empty <title> tag');
    } else {
      this.log('pass', 'Has <title> tag');
    }

    // Check for meta description
    if (!this.content.includes('<meta name="description"')) {
      this.log('warn', 'Missing meta description (recommended for SEO)');
    } else {
      this.log('pass', 'Has meta description');
    }

    // Check for main content
    if (!this.content.includes('id="main-content"')) {
      this.log('error', 'Missing main content section');
    } else {
      this.log('pass', 'Has main content section');
    }

    // Check for skip link (accessibility)
    if (!this.content.includes('skip-link')) {
      this.log('warn', 'Missing skip link (recommended for accessibility)');
    } else {
      this.log('pass', 'Has skip link for accessibility');
    }
  }

  /**
   * Validate port-specific requirements
   */
  validatePortRequirements() {
    this.log('section', 'PORT-SPECIFIC REQUIREMENTS');

    // Check for hero section
    if (!this.content.includes('port-hero') && !this.content.includes('hero-header')) {
      this.log('warn', 'Missing hero section');
    } else {
      this.log('pass', 'Has hero section');
    }

    // Check for logbook section
    if (!this.content.includes('id="logbook"')) {
      this.log('warn', 'Missing logbook section (recommended for Tier 1 ports)');
    } else {
      this.log('pass', 'Has logbook section');
    }

    // Check for FAQ section
    if (!this.content.includes('id="faq"')) {
      this.log('error', 'Missing FAQ section');
    } else {
      this.log('pass', 'Has FAQ section');
    }

    // Check for breadcrumb navigation
    if (!this.content.includes('Breadcrumb')) {
      this.log('warn', 'Missing breadcrumb navigation');
    } else {
      this.log('pass', 'Has breadcrumb navigation');
    }
  }

  /**
   * Validate collapsible sections (BLOCKING requirement)
   * All major port page sections must be collapsible using <details class="section-collapse">
   */
  validateCollapsibleSections() {
    this.log('section', 'COLLAPSIBLE SECTIONS (BLOCKING)');
    console.log(`${RED}${BOLD}All major sections MUST be collapsible with <details class="section-collapse">${RESET}\n`);

    // Required collapsible sections - these MUST use details.section-collapse
    const requiredCollapsibleSections = [
      { id: 'weather-guide', name: 'Weather & Best Time to Visit' },
      { id: 'logbook', name: 'Logbook' },
      { id: 'cruise-port', name: 'Cruise Port' },
      { id: 'getting-around', name: 'Getting Around' },
      { id: 'port-map-section', name: 'Map' },
      { id: 'beaches', name: 'Beaches' },
      { id: 'excursions', name: 'Excursions' },
      { id: 'food', name: 'Food & Dining' },
      { id: 'notices', name: 'Notices' },
      { id: 'depth-soundings', name: 'Depth Soundings' },
      { id: 'practical', name: 'Practical Information' },
      { id: 'faq', name: 'FAQ' },
      { id: 'gallery', name: 'Gallery' },
      { id: 'credits', name: 'Image Credits' }
    ];

    let passCount = 0;
    let failCount = 0;

    for (const section of requiredCollapsibleSections) {
      // Check if section exists
      const sectionRegex = new RegExp(`id="${section.id}"`);
      if (!sectionRegex.test(this.content)) {
        // Section doesn't exist - skip (other validators may check for required sections)
        continue;
      }

      // Check if section uses collapsible pattern
      // Pattern: <section...id="xxx"...><details class="section-collapse"
      const collapsiblePattern = new RegExp(
        `id="${section.id}"[^>]*>[\\s\\S]*?<details class="section-collapse"`,
        'i'
      );

      // Also check that the section has the pattern within a reasonable distance
      const sectionMatch = this.content.match(new RegExp(`<section[^>]*id="${section.id}"[^>]*>[\\s\\S]*?<\\/section>`, 'i'));

      if (sectionMatch) {
        const sectionContent = sectionMatch[0];
        if (sectionContent.includes('class="section-collapse"')) {
          this.log('pass', `${section.name} section is collapsible`);
          passCount++;
        } else {
          this.log('error', `${section.name} section (id="${section.id}") is NOT collapsible - wrap content in <details class="section-collapse">`);
          failCount++;
        }
      }
    }

    if (failCount > 0) {
      console.log(`\n${RED}${BOLD}${failCount} section(s) need to be made collapsible${RESET}`);
    } else if (passCount > 0) {
      console.log(`\n${GREEN}All ${passCount} present sections are collapsible${RESET}`);
    }
  }

  /**
   * Main validation runner
   */
  validate() {
    console.log(`\n${BOLD}${CYAN}╔════════════════════════════════════════════════════════════════════════════╗${RESET}`);
    console.log(`${BOLD}${CYAN}║                      PORT PAGE MASTER VALIDATOR                             ║${RESET}`);
    console.log(`${BOLD}${CYAN}║              All sub-validators MUST pass 100% (zero errors)                ║${RESET}`);
    console.log(`${BOLD}${CYAN}╚════════════════════════════════════════════════════════════════════════════╝${RESET}`);
    console.log(`\n${BOLD}File:${RESET} ${this.filePath}`);

    if (!this.loadFile()) {
      return false;
    }

    // Run basic validations
    this.validateBasicStructure();
    this.validatePortRequirements();

    // ═══════════════════════════════════════════════════════════════════════════
    // COLLAPSIBLE SECTIONS - BLOCKING REQUIREMENT
    // ═══════════════════════════════════════════════════════════════════════════
    this.validateCollapsibleSections();

    // ═══════════════════════════════════════════════════════════════════════════
    // WEATHER VALIDATOR - BLOCKING REQUIREMENT
    // ═══════════════════════════════════════════════════════════════════════════
    this.log('section', 'WEATHER GUIDE VALIDATION (BLOCKING)');
    console.log(`${RED}${BOLD}Weather validator MUST pass 100% - any errors are BLOCKING${RESET}\n`);

    const weatherPassed = this.runSubValidator(
      'validate-port-weather.js',
      'Port Weather Guide Validator'
    );

    if (!weatherPassed) {
      this.log('error', 'BLOCKING: Weather validator failed - port page is INVALID');
    } else {
      this.log('pass', 'Weather validator passed 100%');
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // FINAL SUMMARY
    // ═══════════════════════════════════════════════════════════════════════════
    console.log(`\n${BOLD}════════════════════════════════════════════════════════════════════════════════${RESET}`);
    console.log(`${BOLD}MASTER VALIDATION SUMMARY${RESET}`);
    console.log(`════════════════════════════════════════════════════════════════════════════════`);

    // Sub-validator results
    console.log(`\n${BOLD}Sub-Validator Results:${RESET}`);
    for (const result of this.subValidatorResults) {
      const status = result.passed
        ? `${GREEN}✓ PASSED${RESET}`
        : `${RED}✗ FAILED (blocking)${RESET}`;
      console.log(`  ${result.name}: ${status}`);
    }

    // Overall results
    console.log(`\n${BOLD}Direct Checks:${RESET}`);
    console.log(`  ${GREEN}✓ Passed:   ${this.passed.length}${RESET}`);
    console.log(`  ${YELLOW}⚠ Warnings: ${this.warnings.length}${RESET}`);
    console.log(`  ${RED}✗ Errors:   ${this.errors.length}${RESET}`);

    // Check if any sub-validators failed (blocking)
    const allSubValidatorsPassed = this.subValidatorResults.every(r => r.passed);
    const hasErrors = this.errors.length > 0;

    if (!allSubValidatorsPassed || hasErrors) {
      console.log(`\n${RED}${BOLD}════════════════════════════════════════════════════════════════════════════════${RESET}`);
      console.log(`${RED}${BOLD}  ✗ VALIDATION FAILED - PORT PAGE IS INVALID${RESET}`);
      console.log(`${RED}${BOLD}════════════════════════════════════════════════════════════════════════════════${RESET}`);

      if (!allSubValidatorsPassed) {
        console.log(`\n${RED}Blocking sub-validator failures:${RESET}`);
        this.subValidatorResults
          .filter(r => !r.passed)
          .forEach(r => console.log(`  • ${r.name}`));
      }

      if (hasErrors) {
        console.log(`\n${RED}Direct errors:${RESET}`);
        this.errors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`));
      }

      return false;
    }

    if (this.warnings.length > 0) {
      console.log(`\n${YELLOW}${BOLD}════════════════════════════════════════════════════════════════════════════════${RESET}`);
      console.log(`${YELLOW}${BOLD}  ⚠ VALIDATION PASSED WITH WARNINGS${RESET}`);
      console.log(`${YELLOW}${BOLD}════════════════════════════════════════════════════════════════════════════════${RESET}`);
      console.log(`\n${YELLOW}Warnings to consider:${RESET}`);
      this.warnings.forEach((warn, i) => console.log(`  ${i + 1}. ${warn}`));
      return true;
    }

    console.log(`\n${GREEN}${BOLD}════════════════════════════════════════════════════════════════════════════════${RESET}`);
    console.log(`${GREEN}${BOLD}  ✓ PERFECT - ALL VALIDATIONS PASSED 100%${RESET}`);
    console.log(`${GREEN}${BOLD}════════════════════════════════════════════════════════════════════════════════${RESET}`);
    return true;
  }
}

// CLI execution
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log(`
${BOLD}Port Page Master Validator${RESET}

Usage: node scripts/validate-port.js <port-file.html>

Examples:
  node scripts/validate-port.js ports/cozumel.html
  node scripts/validate-port.js ports/costa-maya.html

${BOLD}This master validator runs:${RESET}
  1. Basic page structure checks
  2. Port-specific requirements
  3. ${RED}Weather Guide Validator (BLOCKING - must pass 100%)${RESET}

${BOLD}Blocking Requirements:${RESET}
  • Weather validator MUST pass with ZERO errors
  • Any blocking error fails the entire validation

${BOLD}The weather validator checks:${RESET}
  • Exactly ONE of each required element
  • No duplicates allowed
  • No "Shoulder Season" (must use "Transitional Season")
  • Valid coordinates, months, and data
  • Required weather FAQ questions
`);
  process.exit(0);
}

const validator = new PortValidator(args[0]);
const success = validator.validate();
process.exit(success ? 0 : 1);
