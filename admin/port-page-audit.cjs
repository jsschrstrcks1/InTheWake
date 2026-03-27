#!/usr/bin/env node
/**
 * port-page-audit.cjs — Comprehensive port page quality detector
 * Soli Deo Gloria
 *
 * Detects issues found during careful-not-clever iterative sampling.
 * DETECTION ONLY — does not modify any files.
 *
 * Usage:
 *   node admin/port-page-audit.cjs                    # Audit all ports
 *   node admin/port-page-audit.cjs --json             # JSON output
 *   node admin/port-page-audit.cjs ports/venice.html  # Single file
 */

const fs = require('fs');
const path = require('path');

const PORTS_DIR = path.join(__dirname, '..', 'ports');

/**
 * Strip <script>, <style>, and HTML comments from content.
 * Used by detectors that should only match HTML element attributes,
 * not JSON-LD schema fields or CSS selectors.
 */
function stripNonHTML(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');
}

// ══════════════════════════════════════════════════════════════════════
// CATEGORY A: AUTO-FIX-NOW (structural, low-risk, scriptable)
// ══════════════════════════════════════════════════════════════════════

function detectDuplicateIDs(html, file) {
  const issues = [];
  const htmlOnly = stripNonHTML(html);
  const ids = {};
  const re = /\bid="([^"]+)"/g;
  let m;
  while ((m = re.exec(htmlOnly)) !== null) {
    const id = m[1];
    if (!ids[id]) ids[id] = [];
    ids[id].push(m.index);
  }
  for (const [id, positions] of Object.entries(ids)) {
    if (positions.length > 1) {
      issues.push({ code: 'A4', file, message: `Duplicate ID "${id}" (${positions.length} occurrences)`, severity: 'HIGH' });
    }
  }
  return issues;
}

function detectForbiddenMeta(html, file) {
  const issues = [];
  if (/<meta\s+name="keywords"/i.test(html)) {
    issues.push({ code: 'A6', file, message: 'Forbidden <meta name="keywords"> tag present', severity: 'MEDIUM' });
  }
  if (/<meta\s+name="geo\.(region|placename)"/i.test(html)) {
    issues.push({ code: 'A6', file, message: 'Forbidden geo.region/geo.placename meta tag present', severity: 'LOW' });
  }
  if (/<!-- ai-breadcrumb/i.test(html)) {
    issues.push({ code: 'A6', file, message: 'Forbidden ai-breadcrumbs HTML comment present', severity: 'LOW' });
  }
  return issues;
}

function detectNestedNav(html, file) {
  const issues = [];
  // Walk HTML tracking <nav> open/close depth. Only flag if depth > 1.
  const tagRe = /<\/?nav\b[^>]*>/gi;
  let depth = 0;
  let m;
  while ((m = tagRe.exec(html)) !== null) {
    if (m[0].startsWith('</')) {
      depth = Math.max(0, depth - 1);
    } else {
      depth++;
      if (depth > 1) {
        issues.push({ code: 'A3', file, message: 'Nested <nav> inside <nav> — outer should be <div>', severity: 'MEDIUM' });
        break;
      }
    }
  }
  return issues;
}

function detectDuplicateSections(html, file) {
  const issues = [];
  const sectionIds = ['logbook', 'cruise-port', 'cruise_port', 'getting-around', 'getting_around',
    'excursions', 'gallery', 'faq', 'depth-soundings', 'depth_soundings', 'credits'];

  for (const id of sectionIds) {
    const re = new RegExp(`id="${id}"`, 'gi');
    const matches = html.match(re);
    if (matches && matches.length > 1) {
      issues.push({ code: 'A1', file, message: `Section "${id}" appears ${matches.length} times on page`, severity: 'HIGH' });
    }
  }

  // Check for hyphen/underscore variant duplicates
  const pairs = [['cruise-port', 'cruise_port'], ['getting-around', 'getting_around'], ['depth-soundings', 'depth_soundings']];
  for (const [a, b] of pairs) {
    if (html.includes(`id="${a}"`) && html.includes(`id="${b}"`)) {
      issues.push({ code: 'A4', file, message: `Both "${a}" and "${b}" IDs exist (hyphen/underscore variant collision)`, severity: 'HIGH' });
    }
  }
  return issues;
}

function detectOrphanedContent(html, file) {
  const issues = [];
  const articleClose = html.lastIndexOf('</article>');
  const mainClose = html.lastIndexOf('</main>');
  if (articleClose > 0 && mainClose > articleClose) {
    let between = html.substring(articleClose + 10, mainClose);
    // Exclude sidebar <aside> elements — they belong between </article> and </main>
    between = between.replace(/<aside[\s\S]*?<\/aside>/gi, '');
    // Exclude closing </div> wrappers
    between = between.replace(/<\/div>/gi, '');
    // Strip comments and tags, check for remaining substantial text
    const stripped = between.replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]+>/g, '').trim();
    if (stripped.length > 200) {
      issues.push({ code: 'A3', file, message: `Substantial content (${stripped.length} chars) found outside </article> and <aside> before </main>`, severity: 'HIGH' });
    }
  }
  return issues;
}

function detectBrokenPaths(html, file) {
  const issues = [];
  if (/\/assets\/assets\//i.test(html)) {
    issues.push({ code: 'A5', file, message: 'Double "assets" in path: /assets/assets/', severity: 'HIGH' });
  }
  if (/src="\/images\//i.test(html)) {
    issues.push({ code: 'A5', file, message: 'Old image path pattern /images/ (should be /assets/ or /ports/img/)', severity: 'MEDIUM' });
  }
  // Check for nearby port links missing .html (exclude img, css, js directories)
  const portLinkRe = /href="\/ports\/([a-z][\w-]+)"/gi;
  const nonPortPaths = new Set(['img', 'css', 'js', 'assets', 'fonts', 'data']);
  let pm;
  while ((pm = portLinkRe.exec(html)) !== null) {
    const linkTarget = pm[1];
    if (!pm[0].endsWith('.html"') && !nonPortPaths.has(linkTarget)) {
      issues.push({ code: 'A5', file, message: `Port link missing .html extension: ${pm[0]}`, severity: 'MEDIUM' });
    }
  }
  return issues;
}

// ══════════════════════════════════════════════════════════════════════
// CATEGORY B: AUTO-FIX-LATER (needs validation after fix)
// ══════════════════════════════════════════════════════════════════════

function detectGenericWeather(html, file) {
  const issues = [];
  const slug = path.basename(file, '.html');

  // Non-tropical ports that shouldn't have Beach/Snorkeling
  const nonTropicalPorts = new Set([
    'venice', 'st-petersburg', 'bergen', 'oslo', 'stockholm', 'helsinki',
    'copenhagen', 'amsterdam', 'hamburg', 'dublin', 'edinburgh', 'glasgow',
    'scotland', 'london', 'dover', 'southampton', 'liverpool', 'reykjavik',
    'tauranga', 'auckland', 'wellington', 'dunedin', 'saguenay', 'quebec-city',
    'montreal', 'saint-john', 'halifax', 'sydney-ns', 'charlottetown',
    'ushuaia', 'punta-arenas', 'torshavn', 'isafjordur', 'akureyri'
  ]);

  if (nonTropicalPorts.has(slug)) {
    if (/Snorkeling/i.test(html) && /noscript|seasonal-section/i.test(html)) {
      issues.push({ code: 'B2', file, message: 'Snorkeling listed as activity for non-tropical port', severity: 'HIGH' });
    }
  }

  if (/Varies by season\s*(?:--|—)\s*check forecast/i.test(html)) {
    issues.push({ code: 'B2', file, message: 'Generic "Varies by season" placeholder in weather At a Glance', severity: 'HIGH' });
  }

  if (/monsoon|typhoon/i.test(html) && nonTropicalPorts.has(slug)) {
    issues.push({ code: 'B2', file, message: 'Monsoon/typhoon warning on non-tropical port', severity: 'CRITICAL' });
  }

  if (/hurricane.*season/i.test(html)) {
    // Ports where hurricanes are a real concern (Caribbean, Gulf, Mexican Pacific, Hawaii, W Africa)
    const hurricanePorts = new Set([
      'nassau', 'cozumel', 'st-thomas', 'barbados', 'jamaica', 'aruba', 'curacao',
      'antigua', 'st-lucia', 'st-maarten', 'bermuda', 'grand-cayman', 'grand-turk',
      'dominica', 'grenada', 'guadeloupe', 'martinique', 'roatan', 'belize',
      'costa-maya', 'harvest-caye', 'labadee', 'cococay', 'amber-cove', 'samana',
      'san-juan', 'st-kitts', 'st-barts', 'bonaire', 'tortola', 'virgin-gorda',
      'freeport', 'key-west', 'tampa', 'miami', 'galveston', 'mobile', 'jacksonville',
      'port-canaveral', 'ft-lauderdale', 'new-orleans', 'baltimore', 'norfolk',
      'charleston', 'cabo-san-lucas', 'manzanillo', 'mazatlan', 'puerto-vallarta',
      'zihuatanejo', 'huatulco', 'acapulco', 'ensenada', 'progreso',
      'honolulu', 'hilo', 'nawiliwili', 'maui',
      'cartagena', 'colon', 'falmouth', 'ocho-rios', 'montego-bay',
      'st-croix', 'st-john-usvi', 'tobago', 'trinidad',
      'dakar', 'mindelo', 'praia',
      'papeete', 'bora-bora', 'moorea', 'fiji', 'suva',
    ]);
    if (!hurricanePorts.has(slug)) {
      issues.push({ code: 'B2', file, message: 'Hurricane season FAQ on non-hurricane-zone port', severity: 'HIGH' });
    }
  }

  return issues;
}

function detectGenericDepthSoundings(html, file) {
  const issues = [];
  if (/Tap water safety varies by destination/i.test(html)) {
    issues.push({ code: 'B3', file, message: 'Generic "Tap water safety varies" in Depth Soundings', severity: 'MEDIUM' });
  }
  if (/The local currency is used in\./i.test(html)) {
    issues.push({ code: 'B3', file, message: 'Broken currency placeholder "The local currency is used in."', severity: 'CRITICAL' });
  }
  if (/Budget \$30.*\$80 per person/i.test(html)) {
    issues.push({ code: 'B3', file, message: 'Generic "$30-$80 per person" budget line (may be wrong currency)', severity: 'MEDIUM' });
  }
  return issues;
}

function detectTemplateBookingGuidance(html, file) {
  const issues = [];
  if (/Ship excursion options provide guaranteed return to port and are worth considering/i.test(html)) {
    issues.push({ code: 'B1', file, message: 'Template booking guidance paragraph (identical across 31 pages)', severity: 'MEDIUM' });
  }
  return issues;
}

function detectGenericCatchesAndPacking(html, file) {
  const issues = [];
  // The generic 5-bullet "Catches Visitors Off Guard" list
  if (/Weather can change quickly.*Peak season means more crowds.*Sun can be intense even on cloudy days/is.test(html)) {
    issues.push({ code: 'B2', file, message: 'Generic "Catches Visitors Off Guard" list (identical across many pages)', severity: 'MEDIUM' });
  }
  return issues;
}

// ══════════════════════════════════════════════════════════════════════
// CATEGORY C: FLAG-FOR-HUMAN (content quality, factual, tone)
// ══════════════════════════════════════════════════════════════════════

function detectAuthorNoteContradiction(html, file) {
  const issues = [];
  const hasUnvisitedNote = /have not yet visited|haven't visited|not yet sailed|soundings in another's wake/i.test(html);
  const hasVisitedNote = /I've sailed this port|sailed this port myself|firsthand experience from/i.test(html);

  if (hasUnvisitedNote && hasVisitedNote) {
    issues.push({ code: 'C4', file, message: 'CONTRADICTION: Page has both "unvisited" and "visited" Author\'s Notes', severity: 'CRITICAL' });
  }
  return issues;
}

function detectEmotionalRepetition(html, file) {
  const issues = [];
  const markers = {
    'eyes filled with tears': /eyes\s+(filled|welled)\s+with\s+tears/gi,
    'whispered a quiet prayer': /whispered\s+a\s+(quiet\s+)?prayer/gi,
    'breath caught': /breath\s+caught/gi,
    'something shifted': /something\s+shifted/gi,
    'heart swelled': /heart\s+(swelled|ached|broke)/gi,
  };

  for (const [name, pattern] of Object.entries(markers)) {
    const matches = html.match(pattern);
    if (matches && matches.length >= 2) {
      issues.push({ code: 'C2', file, message: `Emotional marker "${name}" appears ${matches.length} times on this page`, severity: 'LOW' });
    }
  }
  return issues;
}

function detectPortGuideString(html, file) {
  const issues = [];
  const slug = path.basename(file, '.html');
  const portName = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const portGuideRe = new RegExp(`${portName}\\s+Port\\s+Guide`, 'gi');
  const matches = html.match(portGuideRe);
  if (matches && matches.length > 0) {
    issues.push({ code: 'C1', file, message: `"${portName} Port Guide" used as proper noun (${matches.length} times) — template artifact`, severity: 'MEDIUM' });
  }
  return issues;
}

function detectForbiddenContent(html, file) {
  const issues = [];
  const patterns = {
    'UNMISSABLE': /\bUNMISSABLE\b/i,
    'once-in-a-lifetime': /\bonce-in-a-lifetime\b/i,
    'must-do': /\bmust-do\b/i,
    'life-changing': /\blife-changing\b/i,
  };
  for (const [word, pattern] of Object.entries(patterns)) {
    if (pattern.test(html)) {
      issues.push({ code: 'C5', file, message: `Forbidden content word: "${word}"`, severity: 'MEDIUM' });
    }
  }
  return issues;
}

function detectImageReuse(html, file) {
  const issues = [];
  const imgSrcs = {};
  const imgRe = /<img[^>]*src="([^"]+)"[^>]*alt="([^"]*)"/gi;
  let m;
  while ((m = imgRe.exec(html)) !== null) {
    const src = m[1];
    const alt = m[2];
    if (!imgSrcs[src]) imgSrcs[src] = [];
    imgSrcs[src].push(alt);
  }
  for (const [src, alts] of Object.entries(imgSrcs)) {
    if (alts.length > 2 && !src.includes('logo') && !src.includes('compass') && !src.includes('brand')) {
      const uniqueAlts = new Set(alts);
      if (uniqueAlts.size > 1) {
        issues.push({ code: 'C3', file, message: `Image "${path.basename(src)}" used ${alts.length} times with ${uniqueAlts.size} different alt texts`, severity: 'HIGH' });
      }
    }
  }
  return issues;
}

// ══════════════════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════════════════

function auditFile(filePath) {
  const html = fs.readFileSync(filePath, 'utf8');
  const file = path.relative(path.join(__dirname, '..'), filePath);
  const issues = [
    ...detectDuplicateIDs(html, file),
    ...detectForbiddenMeta(html, file),
    ...detectNestedNav(html, file),
    ...detectDuplicateSections(html, file),
    ...detectOrphanedContent(html, file),
    ...detectBrokenPaths(html, file),
    ...detectGenericWeather(html, file),
    ...detectGenericDepthSoundings(html, file),
    ...detectTemplateBookingGuidance(html, file),
    ...detectGenericCatchesAndPacking(html, file),
    ...detectAuthorNoteContradiction(html, file),
    ...detectEmotionalRepetition(html, file),
    ...detectPortGuideString(html, file),
    ...detectForbiddenContent(html, file),
    ...detectImageReuse(html, file),
  ];
  return issues;
}

function main() {
  const args = process.argv.slice(2);
  const jsonOutput = args.includes('--json');
  const files = args.filter(a => a.endsWith('.html'));

  let portFiles;
  if (files.length > 0) {
    portFiles = files.map(f => path.resolve(f));
  } else {
    portFiles = fs.readdirSync(PORTS_DIR)
      .filter(f => f.endsWith('.html'))
      .map(f => path.join(PORTS_DIR, f));
  }

  const allIssues = [];
  const pageSummaries = [];

  for (const filePath of portFiles) {
    const issues = auditFile(filePath);
    allIssues.push(...issues);
    if (issues.length > 0) {
      pageSummaries.push({
        file: path.relative(path.join(__dirname, '..'), filePath),
        issues: issues.length,
        critical: issues.filter(i => i.severity === 'CRITICAL').length,
        high: issues.filter(i => i.severity === 'HIGH').length,
      });
    }
  }

  if (jsonOutput) {
    console.log(JSON.stringify({ total_pages: portFiles.length, total_issues: allIssues.length, issues: allIssues }, null, 2));
    return;
  }

  // Console output
  console.log(`\n${'═'.repeat(70)}`);
  console.log(`  Port Page Quality Audit — ${portFiles.length} pages scanned`);
  console.log(`${'═'.repeat(70)}\n`);

  // Category counts
  const byCode = {};
  for (const i of allIssues) {
    const cat = i.code[0];
    if (!byCode[cat]) byCode[cat] = 0;
    byCode[cat]++;
  }
  console.log(`  A (auto-fix-now):   ${byCode['A'] || 0}`);
  console.log(`  B (auto-fix-later): ${byCode['B'] || 0}`);
  console.log(`  C (flag-for-human): ${byCode['C'] || 0}`);
  console.log(`  Total issues:       ${allIssues.length}`);
  console.log(`  Pages with issues:  ${pageSummaries.length}/${portFiles.length}`);
  console.log();

  // Critical/high issues
  const critical = allIssues.filter(i => i.severity === 'CRITICAL');
  const high = allIssues.filter(i => i.severity === 'HIGH');
  if (critical.length > 0) {
    console.log(`  🔴 CRITICAL (${critical.length}):`);
    for (const i of critical) console.log(`     ${i.file}: ${i.message}`);
    console.log();
  }
  if (high.length > 0) {
    console.log(`  🟠 HIGH (${high.length}):`);
    for (const i of high) console.log(`     ${i.file}: ${i.message}`);
    console.log();
  }

  // Issue frequency
  const freq = {};
  for (const i of allIssues) {
    const key = `${i.code}: ${i.message.replace(/".+?"/, '"..."').replace(/\d+/, 'N')}`;
    if (!freq[key]) freq[key] = 0;
    freq[key]++;
  }
  console.log(`  Issue frequency (top 20):`);
  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 20);
  for (const [msg, count] of sorted) {
    console.log(`    ${count}x  ${msg}`);
  }

  // Worst pages
  console.log(`\n  Worst pages (by issue count):`);
  pageSummaries.sort((a, b) => b.issues - a.issues);
  for (const p of pageSummaries.slice(0, 15)) {
    const flags = [];
    if (p.critical > 0) flags.push(`${p.critical} CRITICAL`);
    if (p.high > 0) flags.push(`${p.high} HIGH`);
    console.log(`    ${p.file}: ${p.issues} issues ${flags.length ? `(${flags.join(', ')})` : ''}`);
  }

  console.log(`\n${'═'.repeat(70)}\n`);
}

main();
