#!/usr/bin/env node
/**
 * Batch Venue Validation Script
 * Soli Deo Gloria
 *
 * Runs validate-venue-page-v2.js on all venue pages (including subdirectories)
 * and outputs data/validated-venues.json with results.
 *
 * Usage: node scripts/batch-validate-venues.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..');

const VENUE_DIRS = {
  'rcl': 'restaurants',
  'carnival': 'restaurants/carnival',
  'ncl': 'restaurants/ncl',
  'msc': 'restaurants/msc',
  'virgin': 'restaurants/virgin'
};

const results = {
  _meta: {
    generated: new Date().toISOString(),
    validator: 'validate-venue-page-v2.js',
    description: 'Venue page validation results by cruise line'
  },
  byLine: {},
  summary: {}
};

let totalVenues = 0;
let passedClean = 0;
let passedWithWarnings = 0;
let failed = 0;

const styleStats = {};

console.log('Venue Batch Validation');
console.log('='.repeat(60));

for (const [lineKey, dir] of Object.entries(VENUE_DIRS)) {
  const fullPath = path.join(PROJECT_ROOT, dir);

  if (!fs.existsSync(fullPath)) {
    console.log(`  [SKIP] ${lineKey}: directory not found`);
    continue;
  }

  const files = fs.readdirSync(fullPath)
    .filter(f => f.endsWith('.html'))
    .sort();

  if (files.length === 0) {
    console.log(`  [SKIP] ${lineKey}: no venue files found`);
    continue;
  }

  results.byLine[lineKey] = { passed: [], warnings: [], failed: [] };

  console.log(`\n[${lineKey.toUpperCase()}] Validating ${files.length} venues...`);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const slug = file.replace('.html', '');
    totalVenues++;

    try {
      let output;
      try {
        output = execSync(`node admin/validate-venue-page-v2.js --json-output ${filePath}`, {
          encoding: 'utf8',
          cwd: PROJECT_ROOT,
          stdio: ['pipe', 'pipe', 'pipe']
        });
      } catch (execError) {
        // Validator exits with code 1 (errors) or 2 (warnings only)
        output = execError.stdout || execError.stderr || '';
      }

      let json;
      try {
        json = JSON.parse(output);
      } catch {
        failed++;
        results.byLine[lineKey].failed.push({ slug, file: filePath, error: 'JSON parse failed' });
        process.stdout.write(`  \u2717 ${slug}: PARSE ERROR\n`);
        continue;
      }

      const style = json.venueStyle || 'unknown';
      if (!styleStats[style]) styleStats[style] = { total: 0, passed: 0, failed: 0 };
      styleStats[style].total++;

      const entry = {
        slug,
        file: filePath,
        style,
        name: json.venueName || slug,
        errors: json.errorCount,
        warnings: json.warningCount,
        lineCount: json.lineCount
      };

      if (json.errorCount === 0 && json.warningCount === 0) {
        passedClean++;
        styleStats[style].passed++;
        results.byLine[lineKey].passed.push(entry);
        process.stdout.write(`  \u2713 ${slug} [${style}]\n`);
      } else if (json.errorCount === 0) {
        passedWithWarnings++;
        styleStats[style].passed++;
        entry.warningCodes = json.warnings.map(w => w.code);
        results.byLine[lineKey].warnings.push(entry);
        process.stdout.write(`  \u26A0 ${slug} [${style}] (${entry.warningCodes.join(',')})\n`);
      } else {
        failed++;
        styleStats[style].failed++;
        entry.errorCodes = json.errors.map(e => e.code);
        entry.errorMessages = json.errors.map(e => e.message);
        results.byLine[lineKey].failed.push(entry);
        process.stdout.write(`  \u2717 ${slug} [${style}] (${entry.errorCodes.join(',')})\n`);
      }
    } catch (e) {
      failed++;
      results.byLine[lineKey].failed.push({ slug, file: filePath, error: e.message });
      process.stdout.write(`  \u2717 ${slug}: ERROR\n`);
    }
  }
}

// Build summary
results.summary = {
  total: totalVenues,
  passedClean,
  passedWithWarnings,
  failed,
  passRate: totalVenues > 0 ? Math.round(((passedClean + passedWithWarnings) / totalVenues) * 100) : 0,
  byStyle: styleStats
};

// By cruise line summary
results.byLineSummary = {};
for (const [line, data] of Object.entries(results.byLine)) {
  results.byLineSummary[line] = {
    total: data.passed.length + data.warnings.length + data.failed.length,
    passed: data.passed.length,
    warnings: data.warnings.length,
    failed: data.failed.length
  };
}

// Write output
const outputPath = path.join(PROJECT_ROOT, 'data', 'validated-venues.json');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

console.log(`\n${'='.repeat(60)}`);
console.log('VENUE VALIDATION SUMMARY');
console.log('='.repeat(60));
console.log(`Total venues validated: ${totalVenues}`);
console.log(`Passed (clean):        ${passedClean}`);
console.log(`Passed (warnings):     ${passedWithWarnings}`);
console.log(`Failed:                ${failed}`);
console.log(`Pass rate:             ${results.summary.passRate}%`);
console.log(`\nBy Cruise Line:`);
for (const [line, s] of Object.entries(results.byLineSummary)) {
  console.log(`  ${line}: ${s.total} total, ${s.passed} clean, ${s.warnings} warnings, ${s.failed} failed`);
}
console.log(`\nBy Venue Style:`);
for (const [style, s] of Object.entries(styleStats).sort((a, b) => b[1].total - a[1].total)) {
  console.log(`  ${style}: ${s.total} total, ${s.passed} passed, ${s.failed} failed`);
}
console.log(`\nResults saved to: data/validated-venues.json`);
