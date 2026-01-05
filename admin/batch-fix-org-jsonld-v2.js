#!/usr/bin/env node
/**
 * Batch Fix V2: Add standalone Organization JSON-LD schema
 * Soli Deo Gloria
 *
 * Adds a standalone Organization schema (not nested) for "In the Wake".
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
  // Check for standalone Organization JSON-LD (not nested in another type)
  // Look for pattern where Organization is the main @type
  const orgPattern = /"@type"\s*:\s*"Organization"[^}]*"name"\s*:\s*"In the Wake"/;
  const orgPattern2 = /"@type":"Organization"[^}]*"name":"In the Wake"/;

  // Also check if there's an Organization block that's standalone (not inside itemReviewed, brand, etc)
  const standalonePattern = /<script[^>]*type="application\/ld\+json"[^>]*>\s*\{[^}]*"@type"\s*:\s*"Organization"[^}]*"name"\s*:\s*"In the Wake"/;
  const standalonePattern2 = /<script[^>]*type="application\/ld\+json"[^>]*>\s*\{\s*"@context"[^}]*"@type"\s*:\s*"Organization"/;

  return standalonePattern.test(html) || standalonePattern2.test(html);
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
  console.log('Batch Fix V2: Add standalone Organization JSON-LD');
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
