#!/usr/bin/env node

/**
 * Port Duplicate Checker
 * Prevents creating duplicate port pages by checking for existing files
 * with similar names (with/without hyphens, different casings, etc.)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORTS_DIR = path.join(__dirname, '../ports');

/**
 * Normalize port name for comparison
 * - Convert to lowercase
 * - Remove hyphens
 * - Remove special characters
 */
function normalizePortName(name) {
  return name
    .toLowerCase()
    .replace(/\.html$/, '')
    .replace(/[-_\s]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Check if a port file already exists (with variations)
 */
function checkPortExists(portName) {
  if (!fs.existsSync(PORTS_DIR)) {
    console.error(`Error: Ports directory not found at ${PORTS_DIR}`);
    process.exit(1);
  }

  const normalizedSearch = normalizePortName(portName);
  const allFiles = fs.readdirSync(PORTS_DIR)
    .filter(f => f.endsWith('.html'))
    .map(f => f.replace(/\.html$/, ''));

  const matches = allFiles.filter(file => {
    const normalizedFile = normalizePortName(file);
    return normalizedFile === normalizedSearch;
  });

  return {
    exists: matches.length > 0,
    matches: matches.map(m => `${m}.html`),
    allVariations: allFiles
      .filter(f => {
        const norm = normalizePortName(f);
        // Check for partial matches (e.g., "coco" matches "cococay")
        return norm.includes(normalizedSearch) || normalizedSearch.includes(norm);
      })
      .map(f => `${f}.html`)
  };
}

/**
 * CLI usage
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node check-port-duplicates.js <port-name>');
    console.log('');
    console.log('Examples:');
    console.log('  node check-port-duplicates.js cococay');
    console.log('  node check-port-duplicates.js "coco-cay"');
    console.log('  node check-port-duplicates.js "puerto limon"');
    process.exit(0);
  }

  const portName = args[0];
  const result = checkPortExists(portName);

  console.log(`\n🔍 Checking for existing port pages matching: "${portName}"\n`);
  console.log(`Normalized search term: "${normalizePortName(portName)}"\n`);

  if (result.exists) {
    console.log('⚠️  EXACT MATCH FOUND - Port already exists!\n');
    console.log('Existing files:');
    result.matches.forEach(m => console.log(`  - ${m}`));
    console.log('\n❌ DO NOT CREATE - Use existing file instead\n');
    process.exit(1);
  } else if (result.allVariations.length > 0) {
    console.log('⚠️  SIMILAR PORTS FOUND - Check before creating:\n');
    result.allVariations.forEach(v => console.log(`  - ${v}`));
    console.log('\n⚠️  Verify these are different ports before creating new file\n');
    process.exit(1);
  } else {
    console.log('✅ No duplicates found - Safe to create new port page\n');
    process.exit(0);
  }
}

export { checkPortExists, normalizePortName };
