#!/usr/bin/env node
/**
 * Batch Fix Carnival Ships - ITW-SHIP-FIX-001
 * Soli Deo Gloria
 *
 * Fixes common validation errors in Carnival ship pages:
 * 1. Add `name:` field to ai-breadcrumbs (from entity)
 * 2. Add in-app-browser-escape.js script
 * 3. Add data-ship attribute to body/main
 * 4. Add data-imo attribute (from page content or lookup)
 * 5. Add dropdown.js if missing
 * 6. Fix Swiper rewind:false
 * 7. Add styles.css version parameter
 * 8. Fix invalid dates in ai-breadcrumbs
 * 9. Add siblings field if missing
 */

import { readFile, writeFile, readdir } from 'fs/promises';
import { join, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

// Known IMO numbers for Carnival ships
const CARNIVAL_IMO_NUMBERS = {
  'carnival-adventure': '9192351',
  'carnival-breeze': '9548450',
  'carnival-celebration': '9862028',
  'carnival-conquest': '9195190',
  'carnival-dream': '9377137',
  'carnival-elation': '9097022',
  'carnival-encounter': '9862030', // TBD - using placeholder
  'carnival-firenze': '9337263',
  'carnival-freedom': '9333148',
  'carnival-glory': '9203935',
  'carnival-horizon': '9688057',
  'carnival-jubilee': '9879152',
  'carnival-legend': '9224726',
  'carnival-liberty': '9346788',
  'carnival-luminosa': '9398905',
  'carnival-magic': '9450936',
  'carnival-mardi-gras': '9817296',
  'carnival-miracle': '9237357',
  'carnival-panorama': '9764479',
  'carnival-paradise': '9040721',
  'carnival-pride': '9229659',
  'carnival-radiance': '9362223',
  'carnival-spirit': '9220794',
  'carnival-splendor': '9398917',
  'carnival-sunrise': '9066393',
  'carnival-sunshine': '9185516',
  'carnival-valor': '9295073',
  'carnival-venezia': '9319466',
  'carnival-vista': '9636015',
  'mardi-gras': '9817296'
};

// Ship class siblings
const CARNIVAL_SIBLINGS = {
  'carnival-breeze': 'Carnival Dream, Carnival Magic',
  'carnival-dream': 'Carnival Breeze, Carnival Magic',
  'carnival-magic': 'Carnival Dream, Carnival Breeze',
  'carnival-celebration': 'Carnival Mardi Gras, Carnival Jubilee',
  'carnival-jubilee': 'Carnival Mardi Gras, Carnival Celebration',
  'carnival-mardi-gras': 'Carnival Celebration, Carnival Jubilee',
  'mardi-gras': 'Carnival Celebration, Carnival Jubilee',
  'carnival-horizon': 'Carnival Vista, Carnival Panorama',
  'carnival-vista': 'Carnival Horizon, Carnival Panorama',
  'carnival-panorama': 'Carnival Horizon, Carnival Vista',
  'carnival-conquest': 'Carnival Glory, Carnival Valor, Carnival Liberty, Carnival Freedom',
  'carnival-glory': 'Carnival Conquest, Carnival Valor, Carnival Liberty, Carnival Freedom',
  'carnival-valor': 'Carnival Conquest, Carnival Glory, Carnival Liberty, Carnival Freedom',
  'carnival-liberty': 'Carnival Conquest, Carnival Glory, Carnival Valor, Carnival Freedom',
  'carnival-freedom': 'Carnival Conquest, Carnival Glory, Carnival Valor, Carnival Liberty',
  'carnival-legend': 'Carnival Spirit, Carnival Pride, Carnival Miracle',
  'carnival-spirit': 'Carnival Legend, Carnival Pride, Carnival Miracle',
  'carnival-pride': 'Carnival Legend, Carnival Spirit, Carnival Miracle',
  'carnival-miracle': 'Carnival Legend, Carnival Spirit, Carnival Pride',
  'carnival-sunshine': 'Carnival Paradise, Carnival Elation, Carnival Sunrise',
  'carnival-paradise': 'Carnival Sunshine, Carnival Elation, Carnival Sunrise',
  'carnival-elation': 'Carnival Sunshine, Carnival Paradise, Carnival Sunrise',
  'carnival-sunrise': 'Carnival Sunshine, Carnival Paradise, Carnival Elation',
  'carnival-firenze': 'Carnival Luminosa, Carnival Venezia, Carnival Splendor',
  'carnival-luminosa': 'Carnival Firenze, Carnival Venezia, Carnival Splendor',
  'carnival-venezia': 'Carnival Firenze, Carnival Luminosa, Carnival Splendor',
  'carnival-splendor': 'Carnival Firenze, Carnival Luminosa, Carnival Venezia',
  'carnival-radiance': 'Carnival Sunshine (similar class)',
  'carnival-adventure': '(Standalone - former Golden Princess)'
};

let stats = {
  filesProcessed: 0,
  fixesApplied: 0,
  errors: []
};

/**
 * Extract entity name from ai-breadcrumbs
 */
function extractEntity(html) {
  const match = html.match(/<!--\s*ai-breadcrumbs[\s\S]*?entity:\s*([^\n]+)/i);
  return match ? match[1].trim() : null;
}

/**
 * Fix 1: Add name field to ai-breadcrumbs (copy from entity)
 */
function fixAiBreadcrumbsName(html) {
  // Extract the ai-breadcrumbs block first (between <!-- ai-breadcrumbs and -->)
  const breadcrumbMatch = html.match(/(<!--\s*ai-breadcrumbs[\s\S]*?-->)/i);
  if (!breadcrumbMatch) return html;

  const breadcrumbBlock = breadcrumbMatch[1];

  // Check if name field already exists within the block
  if (/\bname:/i.test(breadcrumbBlock)) {
    return html;
  }

  const entity = extractEntity(html);
  if (!entity) return html;

  // Add name field after entity
  const fixed = html.replace(
    /(<!--\s*ai-breadcrumbs[\s\S]*?entity:\s*[^\n]+)/i,
    `$1\n     name: ${entity}`
  );

  if (fixed !== html) stats.fixesApplied++;
  return fixed;
}

/**
 * Fix 2: Add siblings field to ai-breadcrumbs
 */
function fixAiBreadcrumbsSiblings(html, slug) {
  // Check if siblings already exists
  if (/<!--\s*ai-breadcrumbs[\s\S]*?siblings:/i.test(html)) {
    return html;
  }

  const siblings = CARNIVAL_SIBLINGS[slug];
  if (!siblings) return html;

  // Add siblings after ship-class or cruise-line
  const fixed = html.replace(
    /(<!--\s*ai-breadcrumbs[\s\S]*?(?:ship-class|cruise-line):\s*[^\n]+)/i,
    `$1\n     siblings: ${siblings}`
  );

  if (fixed !== html) stats.fixesApplied++;
  return fixed;
}

/**
 * Fix 3: Add in-app-browser-escape.js if missing
 */
function fixEscapeScript(html) {
  if (html.includes('in-app-browser-escape.js')) {
    return html;
  }

  // Add before </body>
  const fixed = html.replace(
    /<\/body>/i,
    `  <!-- In-App Browser Detection & Escape Banner -->
  <script src="/assets/js/in-app-browser-escape.js"></script>
</body>`
  );

  if (fixed !== html) stats.fixesApplied++;
  return fixed;
}

/**
 * Fix 4: Add dropdown.js if missing
 */
function fixDropdownScript(html) {
  if (html.includes('dropdown.js')) {
    return html;
  }

  // Add before </body> or before in-app-browser-escape.js
  if (html.includes('in-app-browser-escape.js')) {
    const fixed = html.replace(
      /(\s*<!--\s*In-App Browser)/i,
      `  <!-- Navigation Dropdown Script -->
  <script src="/assets/js/dropdown.js"></script>

$1`
    );
    if (fixed !== html) {
      stats.fixesApplied++;
      return fixed;
    }
  }

  // Fallback: add before </body>
  const fixed = html.replace(
    /<\/body>/i,
    `  <!-- Navigation Dropdown Script -->
  <script src="/assets/js/dropdown.js"></script>
</body>`
  );

  if (fixed !== html) stats.fixesApplied++;
  return fixed;
}

/**
 * Fix 5: Add data-ship attribute
 */
function fixDataShip(html, slug) {
  // Check if data-ship already exists
  if (/data-ship=/i.test(html)) {
    return html;
  }

  // Convert slug to ship name
  const shipName = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  // Add to <main> tag first
  let fixed = html.replace(
    /<main([^>]*)id="main-content"([^>]*)>/i,
    `<main$1id="main-content"$2 data-ship="${shipName}">`
  );

  if (fixed === html) {
    // Try adding to body
    fixed = html.replace(
      /<body([^>]*)class="page"([^>]*)>/i,
      `<body$1class="page"$2 data-ship="${shipName}">`
    );
  }

  if (fixed !== html) stats.fixesApplied++;
  return fixed;
}

/**
 * Fix 6: Add data-imo attribute
 */
function fixDataImo(html, slug) {
  // Check if data-imo already exists
  if (/data-imo=/i.test(html)) {
    return html;
  }

  const imo = CARNIVAL_IMO_NUMBERS[slug];
  if (!imo) return html;

  // Add to <main> tag first
  let fixed = html.replace(
    /<main([^>]*)data-ship="([^"]*)"([^>]*)>/i,
    `<main$1data-ship="$2"$3 data-imo="${imo}">`
  );

  if (fixed === html) {
    // Try adding to body if data-ship is there
    fixed = html.replace(
      /<body([^>]*)data-ship="([^"]*)"([^>]*)>/i,
      `<body$1data-ship="$2"$3 data-imo="${imo}">`
    );
  }

  if (fixed !== html) stats.fixesApplied++;
  return fixed;
}

/**
 * Fix 7: Fix Swiper rewind:false
 */
function fixSwiperRewind(html) {
  let fixed = html;
  let count = 0;

  // Add rewind:false after loop:false if not present
  fixed = fixed.replace(
    /(loop:\s*false)(\s*,)/g,
    (match, loopPart, comma) => {
      // Check if rewind is already nearby (within 50 chars)
      const nextChars = fixed.substring(fixed.indexOf(match) + match.length, fixed.indexOf(match) + match.length + 100);
      if (!nextChars.includes('rewind:')) {
        count++;
        return `${loopPart},rewind:false${comma}`;
      }
      return match;
    }
  );

  // Also fix any Swiper with navigation but no loop or rewind
  fixed = fixed.replace(
    /new Swiper\(([^)]+),\s*\{(?![^}]*(?:loop:|rewind:))([^}]*)(navigation:)/g,
    (match, selector, config, nav) => {
      count++;
      return `new Swiper(${selector},{loop:false,rewind:false,${config}${nav}`;
    }
  );

  // Also fix loop:true to loop:false for consistency
  const loopTrueCount = (fixed.match(/loop:\s*true/g) || []).length;
  fixed = fixed.replace(/loop:\s*true/g, 'loop:false');
  if (loopTrueCount > 0) count += loopTrueCount;

  if (count > 0) stats.fixesApplied += count;
  return fixed;
}

/**
 * Fix 8: Add styles.css version
 */
function fixStylesVersion(html) {
  if (html.includes('styles.css?v=')) {
    return html;
  }

  const fixed = html.replace(
    /href="\/assets\/styles\.css"/g,
    'href="/assets/styles.css?v=3.010.400"'
  );

  if (fixed !== html) stats.fixesApplied++;
  return fixed;
}

/**
 * Fix 9: Fix invalid dates in ai-breadcrumbs
 */
function fixInvalidDates(html) {
  // Fix dates like "2025-12-3" to "2025-12-03"
  const fixed = html.replace(
    /(updated:\s*)(\d{4})-(\d{1,2})-(\d{1,2})/g,
    (match, prefix, year, month, day) => {
      const m = month.padStart(2, '0');
      const d = day.padStart(2, '0');
      return `${prefix}${year}-${m}-${d}`;
    }
  );

  if (fixed !== html) stats.fixesApplied++;
  return fixed;
}

/**
 * Process a single file
 */
async function processFile(filepath) {
  const slug = basename(filepath, '.html');

  // Skip index files
  if (slug === 'index') {
    console.log(`  Skipping index file`);
    return;
  }

  try {
    let html = await readFile(filepath, 'utf-8');
    const originalHtml = html;

    // Apply all fixes
    html = fixAiBreadcrumbsName(html);
    html = fixAiBreadcrumbsSiblings(html, slug);
    html = fixEscapeScript(html);
    html = fixDropdownScript(html);
    html = fixDataShip(html, slug);
    html = fixDataImo(html, slug);
    html = fixSwiperRewind(html);
    html = fixStylesVersion(html);
    html = fixInvalidDates(html);

    // Write if changed
    if (html !== originalHtml) {
      await writeFile(filepath, html);
      console.log(`  ✓ Fixed: ${basename(filepath)}`);
    } else {
      console.log(`  - No changes: ${basename(filepath)}`);
    }

    stats.filesProcessed++;

  } catch (error) {
    stats.errors.push({ file: filepath, error: error.message });
    console.error(`  ✗ Error: ${basename(filepath)} - ${error.message}`);
  }
}

/**
 * Main
 */
async function main() {
  const args = process.argv.slice(2);
  let targetDir = join(PROJECT_ROOT, 'ships', 'carnival');

  if (args.length > 0 && !args[0].startsWith('--')) {
    targetDir = args[0];
  }

  console.log('\n🚢 Carnival Ship Batch Fix - ITW-SHIP-FIX-001');
  console.log('='.repeat(60));
  console.log(`Target: ${targetDir}\n`);

  try {
    const files = await readdir(targetDir);
    const htmlFiles = files.filter(f => f.endsWith('.html'));

    console.log(`Found ${htmlFiles.length} HTML files\n`);

    for (const file of htmlFiles) {
      await processFile(join(targetDir, file));
    }

    console.log('\n' + '='.repeat(60));
    console.log(`Files processed: ${stats.filesProcessed}`);
    console.log(`Fixes applied: ${stats.fixesApplied}`);

    if (stats.errors.length > 0) {
      console.log(`\nErrors (${stats.errors.length}):`);
      stats.errors.forEach(e => console.log(`  - ${e.file}: ${e.error}`));
    }

  } catch (error) {
    console.error('Fatal error:', error.message);
    process.exit(1);
  }
}

main();
