#!/usr/bin/env node
/**
 * Batch Fix V3: Add standalone Organization JSON-LD schema
 * Soli Deo Gloria
 *
 * Adds a standalone Organization schema block for "In the Wake".
 * Properly detects if one already exists at the root level (not nested).
 */

import { readFile, writeFile, readdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SHIPS_DIR = join(__dirname, '..', 'ships');

const CRUISE_LINES = [
  'carnival', 'celebrity-cruises', 'costa', 'cunard', 'explora-journeys',
  'holland-america-line', 'msc', 'norwegian', 'oceania', 'princess',
  'rcl', 'regent', 'seabourn', 'silversea', 'virgin-voyages'
];

const ORG_JSONLD = `
  <!-- JSON-LD: Organization -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "In the Wake",
    "url": "https://cruisinginthewake.com",
    "logo": "https://cruisinginthewake.com/assets/logo_wake.png"
  }
  </script>`;

function hasStandaloneOrganization(html) {
  // Extract all JSON-LD blocks
  const jsonldPattern = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
  let match;

  while ((match = jsonldPattern.exec(html)) !== null) {
    try {
      const content = match[1].trim();
      const data = JSON.parse(content);

      // Check if this block has @type: Organization at root level
      if (data['@type'] === 'Organization' && data['name'] === 'In the Wake') {
        return true;
      }
    } catch (e) {
      // Skip invalid JSON
    }
  }

  return false;
}

function addOrganizationJsonLd(html) {
  // Skip if already has standalone Organization JSON-LD
  if (hasStandaloneOrganization(html)) {
    return { html, added: false };
  }

  // Insert before </head>
  if (html.includes('</head>')) {
    const fixed = html.replace('</head>', `${ORG_JSONLD}\n</head>`);
    return { html: fixed, added: true };
  }

  return { html, added: false };
}

async function processFile(filepath) {
  const html = await readFile(filepath, 'utf8');
  const result = addOrganizationJsonLd(html);

  if (result.added) {
    await writeFile(filepath, result.html, 'utf8');
    return { status: 'fixed' };
  }

  return { status: 'already-has' };
}

async function processCruiseLine(cruiseLine) {
  const lineDir = join(SHIPS_DIR, cruiseLine);
  let files;
  try {
    files = await readdir(lineDir);
  } catch (e) {
    return { cruiseLine, error: e.message, fixed: 0 };
  }

  const htmlFiles = files.filter(f =>
    f.endsWith('.html') &&
    f !== 'index.html' &&
    !f.includes('unnamed')
  );

  let fixed = 0, alreadyHas = 0;

  for (const file of htmlFiles) {
    const filepath = join(lineDir, file);
    const result = await processFile(filepath);

    if (result.status === 'fixed') {
      console.log(`  ✅ ${file}: Added Organization JSON-LD`);
      fixed++;
    } else {
      alreadyHas++;
    }
  }

  return { cruiseLine, fixed, alreadyHas, total: htmlFiles.length };
}

async function main() {
  console.log('Batch Fix V3: Add standalone Organization JSON-LD');
  console.log('==================================================\n');

  let totalFixed = 0;
  let totalAlreadyHas = 0;

  for (const cruiseLine of CRUISE_LINES) {
    console.log(`\n[${cruiseLine}]`);
    const result = await processCruiseLine(cruiseLine);

    if (result.error) {
      console.log(`  ⚠️ Error: ${result.error}`);
    } else {
      console.log(`  Summary: ${result.fixed} added, ${result.alreadyHas} already have it`);
      totalFixed += result.fixed;
      totalAlreadyHas += result.alreadyHas;
    }
  }

  console.log('\n==================================================');
  console.log(`Total: ${totalFixed} fixed, ${totalAlreadyHas} already had it`);
}

main().catch(console.error);
