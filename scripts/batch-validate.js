#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const portsDir = path.join(__dirname, '..', 'ports');
const files = fs.readdirSync(portsDir).filter(f => f.endsWith('.html')).sort();

let passed = 0, warnings = 0, failed = 0;
const failedPorts = [];

console.log(`Validating ${files.length} port files...\n`);

for (const file of files) {
  try {
    const result = execSync(`node scripts/validate-port.js ports/${file}`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    if (result.includes('PERFECT')) {
      passed++;
    } else if (result.includes('PASSED WITH WARNINGS')) {
      warnings++;
    } else {
      failed++;
      failedPorts.push(file);
    }
  } catch (e) {
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
  console.log(`\nFailed ports (first 30):`);
  failedPorts.slice(0, 30).forEach(p => console.log(`  - ${p}`));
}
