#!/usr/bin/env node
/**
 * Batch Add Analytics - ITW-SHIP-002
 * Soli Deo Gloria
 *
 * Adds missing Umami analytics script to ship pages.
 * Per CLAUDE.md Section 0, all pages require both Google Analytics and Umami.
 */

import { readFile, writeFile } from 'fs/promises';
import { glob } from 'glob';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

const UMAMI_SCRIPT = `
  <!-- Umami (secondary analytics) -->
  <script defer src="https://cloud.umami.is/script.js" data-website-id="9661a449-3ba9-49ea-88e8-4493363578d2"></script>`;

const GOOGLE_ANALYTICS_SCRIPT = `
  <!-- Google Analytics -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-WZP891PZXJ"></script>
  <script>
    window.dataLayer=window.dataLayer||[];
    function gtag(){dataLayer.push(arguments);}
    gtag('js',new Date());
    gtag('config','G-WZP891PZXJ',{anonymize_ip:true});
  </script>`;

async function processFile(filepath) {
  let html = await readFile(filepath, 'utf-8');
  let modified = false;
  const changes = [];

  // Check for Umami
  const hasUmami = html.includes('cloud.umami.is/script.js') &&
                   html.includes('9661a449-3ba9-49ea-88e8-4493363578d2');

  // Check for Google Analytics
  const hasGA = html.includes('googletagmanager.com/gtag/js') &&
                html.includes('G-WZP891PZXJ');

  if (!hasUmami) {
    // Find a good insertion point - after Google Analytics if present, or before </head>
    if (hasGA) {
      // Insert after Google Analytics script block
      const gaPattern = /<script>[\s\S]*?gtag\('config','G-WZP891PZXJ'[\s\S]*?<\/script>/;
      const match = html.match(gaPattern);
      if (match) {
        const insertPoint = match.index + match[0].length;
        html = html.slice(0, insertPoint) + UMAMI_SCRIPT + html.slice(insertPoint);
        modified = true;
        changes.push('Added Umami analytics after Google Analytics');
      }
    } else {
      // Insert before </head>
      const headEnd = html.indexOf('</head>');
      if (headEnd !== -1) {
        html = html.slice(0, headEnd) + UMAMI_SCRIPT + '\n' + html.slice(headEnd);
        modified = true;
        changes.push('Added Umami analytics before </head>');
      }
    }
  }

  if (!hasGA) {
    // Insert before Umami if present, or before </head>
    if (html.includes('cloud.umami.is')) {
      const umamiPattern = /<!-- Umami[^>]*-->[\s\S]*?<script[^>]*cloud\.umami\.is[^>]*><\/script>/;
      const match = html.match(umamiPattern);
      if (match) {
        html = html.slice(0, match.index) + GOOGLE_ANALYTICS_SCRIPT + '\n\n' + html.slice(match.index);
        modified = true;
        changes.push('Added Google Analytics before Umami');
      }
    } else {
      // Insert before </head>
      const headEnd = html.indexOf('</head>');
      if (headEnd !== -1) {
        html = html.slice(0, headEnd) + GOOGLE_ANALYTICS_SCRIPT + '\n' + html.slice(headEnd);
        modified = true;
        changes.push('Added Google Analytics before </head>');
      }
    }
  }

  if (modified) {
    await writeFile(filepath, html, 'utf-8');
  }

  return { filepath, modified, changes };
}

async function main() {
  console.log('Batch Add Analytics - ITW-SHIP-002');
  console.log('===================================\n');

  const files = await glob(join(PROJECT_ROOT, 'ships', '**', '*.html'));
  console.log(`Found ${files.length} ship pages to check\n`);

  let modifiedCount = 0;
  const results = [];

  for (const file of files) {
    const result = await processFile(file);
    if (result.modified) {
      modifiedCount++;
      results.push(result);
      console.log(`✓ ${file.replace(PROJECT_ROOT + '/', '')}`);
      result.changes.forEach(c => console.log(`  - ${c}`));
    }
  }

  console.log('\n===================================');
  console.log(`Modified ${modifiedCount} files`);
  console.log(`Skipped ${files.length - modifiedCount} files (already had analytics)`);
}

main().catch(console.error);
