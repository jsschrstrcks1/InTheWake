#!/usr/bin/env node
/**
 * port-page-repair.cjs — Auto-repair script for port page quality issues
 * Soli Deo Gloria
 *
 * Repairs Category A issues detected by port-page-audit.cjs.
 * Only fixes patterns verified as safe through 7 orchestra passes.
 *
 * Safety tiers:
 *   TIER 1 (zero risk): comment removal, meta tag removal
 *   TIER 2 (low risk): nav→div, URL fixes — require --tier2 flag
 *   TIER 3 (flag only): duplicate IDs, orphaned content, missing h1 — NEVER auto-fixed
 *
 * Usage:
 *   node admin/port-page-repair.cjs --dry-run                    # Preview all Tier 1 fixes
 *   node admin/port-page-repair.cjs --dry-run --tier2             # Preview Tier 1+2 fixes
 *   node admin/port-page-repair.cjs                               # Apply Tier 1 fixes only
 *   node admin/port-page-repair.cjs --tier2                       # Apply Tier 1+2 fixes
 *   node admin/port-page-repair.cjs --file ports/venice.html      # Single file
 *   node admin/port-page-repair.cjs --report                      # Show Tier 3 flags (no fixes)
 */

const fs = require('fs');
const path = require('path');

const PORTS_DIR = path.join(__dirname, '..', 'ports');

// Track all changes for reporting
const changeLog = [];

function log(file, tier, action) {
  changeLog.push({ file: path.basename(file), tier, action });
}

// ══════════════════════════════════════════════════════════════════════
// TIER 1 — Zero Risk (safe to run without review)
// ══════════════════════════════════════════════════════════════════════

function removeAiBreadcrumbs(html, file) {
  const cleaned = html.replace(/<!--\s*ai-breadcrumb[^>]*-->\s*/gi, '');
  if (cleaned !== html) {
    const count = (html.match(/<!--\s*ai-breadcrumb/gi) || []).length;
    log(file, 1, `Removed ${count} ai-breadcrumb comment(s)`);
  }
  return cleaned;
}

function removeMetaKeywords(html, file) {
  const cleaned = html.replace(/<meta\s+name="keywords"[^>]*>\s*/gi, '');
  if (cleaned !== html) {
    log(file, 1, 'Removed <meta name="keywords"> tag');
  }
  return cleaned;
}

function removeGeoMeta(html, file) {
  const cleaned = html.replace(/<meta\s+name="geo\.(region|placename)"[^>]*>\s*/gi, '');
  if (cleaned !== html) {
    log(file, 1, 'Removed geo.region/geo.placename meta tag(s)');
  }
  return cleaned;
}

// ══════════════════════════════════════════════════════════════════════
// TIER 2 — Low Risk (require --tier2 flag)
// ══════════════════════════════════════════════════════════════════════

function fixNestedNav(html, file) {
  // Find the outermost <nav> that contains another <nav> and change it to <div>
  // Strategy: walk the HTML tracking nav depth. If depth > 1, the OUTER nav
  // (the one wrapping another nav) should be a <div>.
  //
  // Common pattern: <nav class="navbar"> wraps <nav class="site-nav">
  // Fix: change <nav class="navbar"> to <div class="navbar"> and </nav> to </div>

  const navbarMatch = html.match(/<nav\s+class="navbar"[^>]*>/i);
  if (!navbarMatch) return html;

  // Verify it actually contains a nested nav
  const navStart = html.indexOf(navbarMatch[0]);
  const nextNavClose = html.indexOf('</nav>', navStart);
  const innerNav = html.substring(navStart + navbarMatch[0].length, nextNavClose);
  if (!/<nav\b/i.test(innerNav)) return html; // No nested nav — don't fix

  // Replace outer <nav class="navbar"> with <div class="navbar">
  let fixed = html.replace(navbarMatch[0], navbarMatch[0].replace(/^<nav\b/i, '<div'));

  // Find the matching closing </nav> for the outer navbar
  // It's the LAST </nav> before the next major section (header close, main, etc.)
  // Safer approach: find the first </nav> that reduces depth to 0
  let depth = 1;
  let pos = navStart + navbarMatch[0].length;
  const tagRe = /<\/?nav\b[^>]*>/gi;
  tagRe.lastIndex = pos;
  let closingNavPos = -1;
  let m;

  while ((m = tagRe.exec(fixed)) !== null) {
    if (m[0].startsWith('</')) {
      depth--;
      if (depth === 0) {
        closingNavPos = m.index;
        break;
      }
    } else {
      depth++;
    }
  }

  if (closingNavPos !== -1) {
    fixed = fixed.substring(0, closingNavPos) + '</div>' + fixed.substring(closingNavPos + '</nav>'.length);
    log(file, 2, 'Fixed nested nav: outer <nav class="navbar"> → <div class="navbar">');
  }

  return fixed;
}

function fixPortLinksHtml(html, file) {
  // Add .html to relative port links missing the extension
  const nonPortPaths = new Set(['img', 'css', 'js', 'assets', 'fonts', 'data']);
  let fixed = html;
  let count = 0;

  // Only match href="/ports/slug" that end with just the slug and closing quote
  // Exclude URLs with query strings (?), fragments (#), or existing extensions (.html, .xml)
  fixed = fixed.replace(/href="\/ports\/([a-z][\w-]+)"/gi, (match, slug) => {
    if (nonPortPaths.has(slug)) return match;
    // Already has an extension — don't touch
    if (/\.\w+$/.test(slug)) return match;
    count++;
    return `href="/ports/${slug}.html"`;
  });

  if (count > 0) {
    log(file, 2, `Added .html to ${count} port link(s)`);
  }
  return fixed;
}

function fixCanonicalHtml(html, file) {
  // Add .html to canonical URLs missing the extension for port pages
  // Only operate on <link rel="canonical"> tags in the <head>, not in scripts or JSON-LD
  let fixed = html;
  let changed = false;

  // Find the <head> section to limit our search scope
  const headEnd = html.indexOf('</head>');
  if (headEnd === -1) return html;

  const head = html.substring(0, headEnd);
  let fixedHead = head;

  fixedHead = fixedHead.replace(
    /(rel="canonical"\s+href="[^"]*\/ports\/[a-z][\w-]+)(")/gi,
    (match, prefix, suffix) => {
      if (prefix.endsWith('.html')) return match;
      changed = true;
      return prefix + '.html' + suffix;
    }
  );

  fixedHead = fixedHead.replace(
    /(href="[^"]*\/ports\/[a-z][\w-]+)("\s+rel="canonical")/gi,
    (match, prefix, suffix) => {
      if (prefix.endsWith('.html')) return match;
      changed = true;
      return prefix + '.html' + suffix;
    }
  );

  if (changed) {
    fixed = fixedHead + html.substring(headEnd);
    log(file, 2, 'Added .html to canonical URL');
  }
  return fixed;
}

function fixOgImagePath(html, file) {
  // Fix old /images/ paths in og:image to the existing generic social image
  // All passing pages use /assets/social/port-hero.jpg
  let fixed = html;
  let changed = false;

  fixed = fixed.replace(
    /(property="og:image"\s+content=")[^"]*\/images\/[^"]+"/gi,
    (match, prefix) => {
      changed = true;
      return `${prefix}https://cruisinginthewake.com/assets/social/port-hero.jpg"`;
    }
  );

  if (changed) {
    log(file, 2, 'Fixed OG image path from broken /images/ to /assets/social/port-hero.jpg');
  }
  return fixed;
}

// ══════════════════════════════════════════════════════════════════════
// TIER 3 — Flag Only (NEVER auto-fixed)
// ══════════════════════════════════════════════════════════════════════

function flagTier3Issues(html, file) {
  const flags = [];
  const htmlOnly = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');

  // Duplicate IDs
  const ids = {};
  const idRe = /\bid="([^"]+)"/g;
  let m;
  while ((m = idRe.exec(htmlOnly)) !== null) {
    if (!ids[m[1]]) ids[m[1]] = 0;
    ids[m[1]]++;
  }
  const dupes = Object.entries(ids).filter(([k, v]) => v > 1);
  if (dupes.length > 0) {
    flags.push(`DUPLICATE IDs: ${dupes.map(([k, v]) => `${k}(${v}x)`).join(', ')}`);
  }

  // Missing h1
  if (!/<h1[\s>]/i.test(htmlOnly)) {
    flags.push('MISSING <h1> tag');
  }

  // Duplicate sections
  const sectionIds = ['logbook', 'cruise-port', 'cruise_port', 'getting-around', 'getting_around',
    'excursions', 'gallery', 'faq', 'depth-soundings', 'depth_soundings'];
  for (const id of sectionIds) {
    const re = new RegExp(`id="${id}"`, 'gi');
    const matches = htmlOnly.match(re);
    if (matches && matches.length > 1) {
      flags.push(`DUPLICATE SECTION: ${id} appears ${matches.length}x`);
    }
  }

  return flags;
}

// ══════════════════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════════════════

function repairFile(filePath, options) {
  let html = fs.readFileSync(filePath, 'utf8');
  const original = html;

  // Tier 1 — always applied
  html = removeAiBreadcrumbs(html, filePath);
  html = removeMetaKeywords(html, filePath);
  html = removeGeoMeta(html, filePath);

  // Tier 2 — only with --tier2
  if (options.tier2) {
    html = fixNestedNav(html, filePath);
    html = fixPortLinksHtml(html, filePath);
    html = fixCanonicalHtml(html, filePath);
    html = fixOgImagePath(html, filePath);
  }

  const changed = html !== original;

  if (changed && !options.dryRun) {
    fs.writeFileSync(filePath, html, 'utf8');
  }

  // Tier 3 flags
  const flags = flagTier3Issues(html, filePath);

  return { changed, flags };
}

function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const tier2 = args.includes('--tier2');
  const reportOnly = args.includes('--report');
  const fileIdx = args.indexOf('--file');
  const singleFile = fileIdx !== -1 ? args[fileIdx + 1] : null;

  let files;
  if (singleFile) {
    files = [path.resolve(singleFile)];
  } else {
    files = fs.readdirSync(PORTS_DIR)
      .filter(f => f.endsWith('.html'))
      .map(f => path.join(PORTS_DIR, f));
  }

  console.log(`\n${'═'.repeat(70)}`);
  console.log(`  Port Page Repair Script`);
  console.log(`  Mode: ${dryRun ? 'DRY RUN' : reportOnly ? 'REPORT ONLY' : 'LIVE'}`);
  console.log(`  Tier 1 (zero risk): ${dryRun ? 'preview' : reportOnly ? 'skip' : 'APPLY'}`);
  console.log(`  Tier 2 (low risk):  ${tier2 ? (dryRun ? 'preview' : 'APPLY') : 'skip (use --tier2)'}`);
  console.log(`  Tier 3 (flag only): report`);
  console.log(`${'═'.repeat(70)}\n`);

  let totalChanged = 0;
  let totalFlags = 0;
  const allFlags = [];

  for (const filePath of files) {
    if (reportOnly) {
      const html = fs.readFileSync(filePath, 'utf8');
      const flags = flagTier3Issues(html, filePath);
      if (flags.length > 0) {
        totalFlags += flags.length;
        allFlags.push({ file: path.basename(filePath), flags });
      }
      continue;
    }

    const { changed, flags } = repairFile(filePath, { dryRun, tier2 });
    if (changed) totalChanged++;
    if (flags.length > 0) {
      totalFlags += flags.length;
      allFlags.push({ file: path.basename(filePath), flags });
    }
  }

  // Print change log
  if (!reportOnly && changeLog.length > 0) {
    console.log(`  Changes${dryRun ? ' (would be applied)' : ' applied'}:`);
    for (const entry of changeLog) {
      console.log(`    T${entry.tier} ${entry.file}: ${entry.action}`);
    }
    console.log();
  }

  // Print Tier 3 flags
  if (allFlags.length > 0) {
    console.log(`  Tier 3 flags (manual review needed):`);
    for (const { file, flags } of allFlags.slice(0, 30)) {
      for (const flag of flags) {
        console.log(`    ⚠ ${file}: ${flag}`);
      }
    }
    if (allFlags.length > 30) {
      console.log(`    ... and ${allFlags.length - 30} more pages with flags`);
    }
    console.log();
  }

  // Summary
  console.log(`${'─'.repeat(70)}`);
  console.log(`  Files scanned:    ${files.length}`);
  console.log(`  Files ${dryRun ? 'would be ' : ''}modified: ${totalChanged}`);
  console.log(`  Tier 1 changes:   ${changeLog.filter(c => c.tier === 1).length}`);
  console.log(`  Tier 2 changes:   ${changeLog.filter(c => c.tier === 2).length}`);
  console.log(`  Tier 3 flags:     ${totalFlags} across ${allFlags.length} pages`);
  console.log(`${'─'.repeat(70)}\n`);
}

main();
