#!/usr/bin/env node
/**
 * Carnival Ships Batch Fix V6 - Fix Section Order (Logbook before Videos)
 * Soli Deo Gloria
 *
 * Expected order: page_intro → first_look → dining → logbook → videos → map → tracker → faq → attribution
 * This script moves logbook sections before videos sections where they're in wrong order.
 */

import { readFile, writeFile, readdir } from 'fs/promises';
import { join, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SHIPS_DIR = join(__dirname, '..', 'ships', 'carnival');

async function processFile(filepath) {
  const filename = basename(filepath, '.html');

  // Skip non-ship files
  if (filename === 'index' || filename.includes('unnamed') || filename.match(/-\d{4}$/)) {
    return { file: filepath, status: 'skipped', reason: 'Not an active ship page' };
  }

  let html = await readFile(filepath, 'utf8');
  let changes = [];

  // Find videos section
  const videosPatterns = [
    /<section[^>]*aria-labelledby="videos-title"[^>]*>[\s\S]*?<\/section>/,
    /<section[^>]*>\s*<h2[^>]*id="videos-title"[^>]*>[\s\S]*?<\/section>/,
    /<section[^>]*>\s*<h2[^>]*>Ship Videos<\/h2>[\s\S]*?<\/section>/,
    /<section[^>]*>\s*<h2[^>]*>Video Tours<\/h2>[\s\S]*?<\/section>/,
  ];

  // Find logbook section
  const logbookPatterns = [
    /<section[^>]*aria-labelledby="logbook-title"[^>]*>[\s\S]*?<\/section>/,
    /<section[^>]*>\s*<h2[^>]*id="logbook-title"[^>]*>[\s\S]*?<\/section>/,
    /<section[^>]*>\s*<h2[^>]*>Guest Logbook<\/h2>[\s\S]*?<\/section>/,
    /<section[^>]*>\s*<h2[^>]*>The Logbook[^<]*<\/h2>[\s\S]*?<\/section>/,
    /<section[^>]*id="logbook"[^>]*>[\s\S]*?<\/section>/,
  ];

  let videosMatch = null;
  let videosIndex = -1;
  for (const pattern of videosPatterns) {
    const match = html.match(pattern);
    if (match) {
      videosMatch = match[0];
      videosIndex = html.indexOf(match[0]);
      break;
    }
  }

  let logbookMatch = null;
  let logbookIndex = -1;
  for (const pattern of logbookPatterns) {
    const match = html.match(pattern);
    if (match) {
      logbookMatch = match[0];
      logbookIndex = html.indexOf(match[0]);
      break;
    }
  }

  // Check if both sections exist and if logbook comes after videos (wrong order)
  if (videosMatch && logbookMatch && logbookIndex > videosIndex) {
    // Remove logbook from its current position
    html = html.replace(logbookMatch, '');

    // Find the videos section again (position may have changed)
    const newVideosIndex = html.indexOf(videosMatch);

    // Insert logbook before videos
    html = html.slice(0, newVideosIndex) + logbookMatch + '\n\n    ' + html.slice(newVideosIndex);

    changes.push('Moved logbook section before videos section');
  }

  if (changes.length > 0) {
    await writeFile(filepath, html, 'utf8');
    return { file: filepath, status: 'fixed', changes };
  }

  return { file: filepath, status: 'unchanged' };
}

async function main() {
  console.log('Carnival Ships Batch Fix V6 - Fix Section Order');
  console.log('================================================\n');

  const files = await readdir(SHIPS_DIR);
  const htmlFiles = files.filter(f => f.endsWith('.html'));

  let fixed = 0, skipped = 0, unchanged = 0;

  for (const file of htmlFiles) {
    const filepath = join(SHIPS_DIR, file);
    const result = await processFile(filepath);

    if (result.status === 'fixed') {
      console.log(`✅ ${file}: ${result.changes.join(', ')}`);
      fixed++;
    } else if (result.status === 'skipped') {
      console.log(`⏭️  ${file}: ${result.reason}`);
      skipped++;
    } else {
      console.log(`⚪ ${file}: No changes needed`);
      unchanged++;
    }
  }

  console.log(`\n================================================`);
  console.log(`Fixed: ${fixed} | Skipped: ${skipped} | Unchanged: ${unchanged}`);
}

main().catch(console.error);
