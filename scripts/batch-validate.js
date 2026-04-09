#!/usr/bin/env node
/**
 * Batch Port Validator
 *
 * Validates all port HTML files using validate-port-page-v2.js (the single
 * authoritative port validator). Reports pass/warning/fail statistics.
 *
 * v2 subsumes all checks from the former validate-port.js (v1), including:
 * - Basic HTML structure (charset, viewport, title, main-content)
 * - Tender port indicator (registry cross-check)
 * - Image src file existence (BLOCKING)
 * - Weather sub-validator (BLOCKING subprocess)
 * - Collapsible sections
 * Plus ICP-2 compliance, content quality, voice, rubric, and 50+ more checks.
 *
 * Usage:
 *   node scripts/batch-validate.js              # text summary
 *   node scripts/batch-validate.js --json       # write JSON to data/
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const portsDir = path.join(__dirname, '..', 'ports');
const validatorPath = path.join(__dirname, '..', 'admin', 'validate-port-page-v2.js');
const files = fs.readdirSync(portsDir).filter(f => f.endsWith('.html')).sort();

const jsonMode = process.argv.includes('--json');

let passed = 0, warnings = 0, failed = 0;
const failedPorts = [];
const warningPorts = [];

console.log(`Validating ${files.length} port files using v2 validator...\n`);

for (const file of files) {
  try {
    const result = execSync(`node ${validatorPath} ports/${file}`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 60000
    });
    // v2 outputs score and error/warning counts — check exit code (0 = pass)
    // Distinguish perfect (0 warnings) from warnings by checking output
    if (result.includes('warnings: 0') || result.includes('"warnings":[]')) {
      passed++;
    } else {
      warnings++;
      warningPorts.push(file);
    }
  } catch (e) {
    // Non-zero exit code = validation failed
    failed++;
    failedPorts.push(file);
  }

  // Progress indicator
  const total = passed + warnings + failed;
  if (total % 50 === 0) {
    console.log(`Progress: ${total}/${files.length}`);
  }
}

console.log(`\n${'='.repeat(50)}`);
console.log(`VALIDATION SUMMARY`);
console.log(`${'='.repeat(50)}`);
console.log(`✓ Perfect:    ${passed}`);
console.log(`⚠ Warnings:   ${warnings}`);
console.log(`✗ Failed:     ${failed}`);
console.log(`─────────────────────────────────────────────────`);
console.log(`Total:        ${files.length}`);

if (failedPorts.length > 0) {
  console.log(`\nFailed ports (${failedPorts.length} total):`);
  failedPorts.forEach(p => console.log(`  - ${p}`));
}

if (warningPorts.length > 0) {
  console.log(`\nPorts with warnings (${warningPorts.length} total):`);
  warningPorts.forEach(p => console.log(`  - ${p}`));
}

// JSON output
if (jsonMode) {
  const outputPath = path.join(__dirname, '..', 'data', 'batch-validate-results.json');
  const jsonData = {
    timestamp: new Date().toISOString(),
    validator: 'validate-port-page-v2.js',
    total: files.length,
    perfect: passed,
    warnings: warnings,
    failed: failed,
    failed_ports: failedPorts,
    warning_ports: warningPorts
  };
  fs.writeFileSync(outputPath, JSON.stringify(jsonData, null, 2));
  console.log(`\nJSON results written to ${path.relative(process.cwd(), outputPath)}`);
}
