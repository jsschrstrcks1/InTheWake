#!/usr/bin/env node
/**
 * Batch Ship Validation Script
 * Runs validation on all ship pages and outputs a JSON file with scores
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const CRUISE_LINE_DIRS = {
  'rcl': 'ships/rcl',
  'carnival': 'ships/carnival',
  'celebrity': 'ships/celebrity-cruises',
  'norwegian': 'ships/norwegian',
  'princess': 'ships/princess',
  'holland': 'ships/holland-america-line',
  'msc': 'ships/msc',
  'costa': 'ships/costa',
  'cunard': 'ships/cunard',
  'oceania': 'ships/oceania',
  'regent': 'ships/regent',
  'seabourn': 'ships/seabourn',
  'silversea': 'ships/silversea',
  'explora': 'ships/explora-journeys',
  'virgin': 'ships/virgin'
};

const THRESHOLD = 80;
const results = {
  _meta: {
    generated: new Date().toISOString(),
    threshold: THRESHOLD,
    description: 'Ship pages that score 80% or higher on validation'
  },
  passing: {},
  failing: {}
};

let totalShips = 0;
let passingShips = 0;
let failingShips = 0;

console.log(`Validating ship pages with ${THRESHOLD}% threshold...\n`);

for (const [lineKey, dir] of Object.entries(CRUISE_LINE_DIRS)) {
  const fullPath = path.join(__dirname, '..', dir);

  if (!fs.existsSync(fullPath)) {
    console.log(`  [SKIP] ${lineKey}: directory not found`);
    continue;
  }

  const files = fs.readdirSync(fullPath)
    .filter(f => f.endsWith('.html') && f !== 'index.html');

  if (files.length === 0) {
    console.log(`  [SKIP] ${lineKey}: no ship files found`);
    continue;
  }

  results.passing[lineKey] = [];
  results.failing[lineKey] = [];

  console.log(`\n[${lineKey.toUpperCase()}] Validating ${files.length} ships...`);

  for (const file of files) {
    const filePath = `${dir}/${file}`;
    const slug = file.replace('.html', '');
    totalShips++;

    try {
      const output = execSync(`node admin/validate-ship-page.js ${filePath}`, {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      });

      // Strip ANSI color codes and extract score
      const cleanOutput = output.replace(/\x1b\[[0-9;]*m/g, '');
      const scoreMatch = cleanOutput.match(/Score:\s*(\d+)\/100/);
      const score = scoreMatch ? parseInt(scoreMatch[1], 10) : 0;

      if (score >= THRESHOLD) {
        passingShips++;
        results.passing[lineKey].push({ slug, score, file: filePath });
        process.stdout.write(`  ✓ ${slug}: ${score}%\n`);
      } else {
        failingShips++;
        results.failing[lineKey].push({ slug, score, file: filePath });
        process.stdout.write(`  ✗ ${slug}: ${score}%\n`);
      }
    } catch (e) {
      failingShips++;
      results.failing[lineKey].push({ slug, score: 0, file: filePath, error: 'Validation failed' });
      process.stdout.write(`  ✗ ${slug}: ERROR\n`);
    }
  }
}

// Calculate summary
results._meta.summary = {
  total: totalShips,
  passing: passingShips,
  failing: failingShips,
  passRate: totalShips > 0 ? Math.round((passingShips / totalShips) * 100) : 0
};

// Clean up empty arrays
for (const key of Object.keys(results.passing)) {
  if (results.passing[key].length === 0) delete results.passing[key];
}
for (const key of Object.keys(results.failing)) {
  if (results.failing[key].length === 0) delete results.failing[key];
}

// Write output
const outputPath = path.join(__dirname, '..', 'data', 'validated-ships.json');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

console.log(`\n${'='.repeat(60)}`);
console.log('VALIDATION SUMMARY');
console.log(`${'='.repeat(60)}`);
console.log(`Total ships validated: ${totalShips}`);
console.log(`Passing (≥${THRESHOLD}%): ${passingShips}`);
console.log(`Failing (<${THRESHOLD}%): ${failingShips}`);
console.log(`Pass rate: ${results._meta.summary.passRate}%`);
console.log(`\nResults saved to: data/validated-ships.json`);
