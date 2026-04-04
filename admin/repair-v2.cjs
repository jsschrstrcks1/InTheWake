#!/usr/bin/env node
/**
 * repair-v2.cjs — Comprehensive Port Page Repair Script
 * Soli Deo Gloria
 *
 * Modular, idempotent, 3-phase repair with simulation mode.
 * Per orchestra consensus (GPT+Gemini+Grok):
 *   Phase 1: Structural fixes (low risk, auto-fix)
 *   Phase 2: Disclaimer fixes (medium risk, registry-based)
 *   Phase 3: Content gap report (high risk, flag only)
 *
 * Usage:
 *   node admin/repair-v2.cjs --dry-run                  # JSON preview of all changes
 *   node admin/repair-v2.cjs --phase 1                  # Apply Phase 1 only
 *   node admin/repair-v2.cjs --phase 1 --phase 2        # Apply Phase 1+2
 *   node admin/repair-v2.cjs --file ports/venice.html    # Single file
 *   node admin/repair-v2.cjs --report                   # Phase 3 report only
 */

const fs = require('fs');
const path = require('path');

const PORTS_DIR = path.join(__dirname, '..', 'ports');
const REGISTRY_PATH = path.join(__dirname, 'port-disclaimer-registry.json');

// ══════════════════════════════════════════════════════════════════════
// PHASE 1: STRUCTURAL FIXES (low risk)
// ══════════════════════════════════════════════════════════════════════

function phase1_fixDuplicateAuthorHeading(html, log) {
  // The most common duplicate ID: "author-heading" appears twice in sidebar
  // Fix: rename the SECOND occurrence to "author-heading-2"
  let count = 0;
  const fixed = html.replace(/id="author-heading"/g, (match) => {
    count++;
    return count > 1 ? 'id="author-heading-2"' : match;
  });
  if (count > 1) log.push({ phase: 1, action: 'rename_duplicate_id', detail: `Renamed ${count-1} duplicate author-heading ID(s)` });
  return fixed;
}

function phase1_fixDuplicateWhimsicalUnits(html, log) {
  let count = 0;
  const fixed = html.replace(/id="whimsical-units-container"/g, (match) => {
    count++;
    return count > 1 ? 'id="whimsical-units-container-2"' : match;
  });
  if (count > 1) log.push({ phase: 1, action: 'rename_duplicate_id', detail: `Renamed ${count-1} duplicate whimsical-units-container ID(s)` });
  return fixed;
}

function phase1_fixDuplicateRecentRail(html, log) {
  let count = 0;
  const fixed = html.replace(/id="recent-rail-title"/g, (match) => {
    count++;
    return count > 1 ? 'id="recent-rail-title-2"' : match;
  });
  if (count > 1) log.push({ phase: 1, action: 'rename_duplicate_id', detail: `Renamed ${count-1} duplicate recent-rail-title ID(s)` });
  return fixed;
}

function phase1_fixNestedNav(html, log) {
  // Change outer <nav class="navbar"> to <div class="navbar"> when it wraps another <nav>
  const navbarMatch = html.match(/<nav\s+class="navbar"[^>]*>/i);
  if (!navbarMatch) return html;

  const navStart = html.indexOf(navbarMatch[0]);
  const snippet = html.substring(navStart + navbarMatch[0].length, navStart + navbarMatch[0].length + 2000);
  if (!/<nav\b/i.test(snippet.split('</nav>')[0])) return html; // No nested nav

  let fixed = html.replace(navbarMatch[0], navbarMatch[0].replace(/^<nav\b/i, '<div'));

  // Find matching closing </nav>
  let depth = 1;
  let pos = navStart + navbarMatch[0].length;
  const tagRe = /<\/?nav\b[^>]*>/gi;
  tagRe.lastIndex = pos;
  let m;
  while ((m = tagRe.exec(fixed)) !== null) {
    if (m[0].startsWith('</')) {
      depth--;
      if (depth === 0) {
        fixed = fixed.substring(0, m.index) + '</div>' + fixed.substring(m.index + m[0].length);
        log.push({ phase: 1, action: 'fix_nested_nav', detail: 'Outer <nav class="navbar"> → <div>' });
        break;
      }
    } else {
      depth++;
    }
  }
  return fixed;
}

// ══════════════════════════════════════════════════════════════════════
// PHASE 2: DISCLAIMER FIXES (medium risk, registry-based)
// ══════════════════════════════════════════════════════════════════════

let _registry = null;
function loadRegistry() {
  if (_registry) return _registry;
  try {
    _registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
  } catch (e) {
    _registry = { level_3_visited: {}, level_2_planned: {} };
  }
  return _registry;
}

function phase2_fixDisclaimerContradiction(html, slug, log) {
  const registry = loadRegistry();
  const isLevel3 = !!(registry.level_3_visited && registry.level_3_visited[slug]);
  const isLevel2 = !!(registry.level_2_planned && registry.level_2_planned[slug]);

  const hasUnvisited = /soundings in another['']s wake|have not yet visited|haven't visited/i.test(html);
  const hasVisited = /I['']ve sailed this port|sailed this port myself|firsthand experience from/i.test(html);

  if (!hasUnvisited || !hasVisited) return html; // No contradiction

  if (isLevel3) {
    // Registry says visited — remove the unvisited disclaimer from sidebar
    // The sidebar Author's Note typically contains the "soundings in another's wake" text
    const before = html;
    // Remove the sidebar unvisited note (keep the visited one)
    const fixed = html.replace(
      /<aside[^>]*>[\s\S]*?soundings in another['']s wake[\s\S]*?<\/aside>/i,
      (match) => {
        // Replace the "soundings in another's wake" paragraph with a visited note
        return match.replace(
          /Until I have sailed this port myself[\s\S]*?what I found\.<\/p>/i,
          `I've sailed this port myself — these notes come from firsthand experience, supplemented by research and fellow travelers' accounts.</p>`
        );
      }
    );
    if (fixed !== before) {
      log.push({ phase: 2, action: 'fix_disclaimer', detail: `Registry says Level 3 (visited) — updated sidebar disclaimer` });
    }
    return fixed;
  } else {
    // Registry says NOT visited — the visited claim in the body is wrong
    // Flag this — don't auto-remove body content, too risky
    log.push({ phase: 2, action: 'FLAG_disclaimer_mismatch', detail: `Page claims visited but NOT in registry — needs human review`, severity: 'HIGH' });
    return html;
  }
}

// ══════════════════════════════════════════════════════════════════════
// PHASE 3: CONTENT GAP REPORT (flag only, never auto-generate)
// ══════════════════════════════════════════════════════════════════════

function phase3_reportGaps(html, slug, log) {
  // Missing quality sections (gold standard: food, notices, practical, credits)
  const qualitySections = { food: /\bfood\b|\bdining\b/i, notices: /\bnotices?\b/i, practical: /\bpractical\b/i, credits: /\bcredits?\b|\battribution/i };
  const missing = [];
  for (const [name, pattern] of Object.entries(qualitySections)) {
    if (!pattern.test(html) && !html.includes(`id="${name}"`)) missing.push(name);
  }
  if (missing.length > 0) {
    log.push({ phase: 3, action: 'FLAG_missing_sections', detail: `Missing gold standard sections: ${missing.join(', ')}`, severity: 'MEDIUM' });
  }

  // Template booking guidance
  if (/Ship excursion options provide guaranteed return to port and are worth considering/i.test(html)) {
    log.push({ phase: 3, action: 'FLAG_template_booking', detail: 'Has identical template booking guidance — rewrite with port-specific advice', severity: 'MEDIUM' });
  }

  // Generic depth soundings
  if (/Tap water safety varies by destination/i.test(html)) {
    log.push({ phase: 3, action: 'FLAG_generic_depth_soundings', detail: 'Generic "tap water varies" in depth soundings — rewrite with port-specific info', severity: 'MEDIUM' });
  }

  // Missing photo credits
  const galleryImgs = (html.match(/<figure[^>]*>[\s\S]*?<\/figure>/gi) || []);
  let noCredit = 0;
  for (const fig of galleryImgs) {
    if (!fig.includes('photo-credit')) noCredit++;
  }
  if (noCredit > 0) {
    log.push({ phase: 3, action: 'FLAG_missing_photo_credits', detail: `${noCredit} gallery image(s) without photo-credit attribution`, severity: 'LOW' });
  }

  // Missing breadcrumb
  if (!/aria-label="Breadcrumb"/i.test(html)) {
    log.push({ phase: 3, action: 'FLAG_missing_breadcrumb', detail: 'Missing breadcrumb navigation', severity: 'MEDIUM' });
  }

  // Missing Twitter Cards
  if (!html.includes('twitter:card')) {
    log.push({ phase: 3, action: 'FLAG_missing_twitter', detail: 'Missing Twitter Card meta tags', severity: 'LOW' });
  }
}

// ══════════════════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════════════════

function repairFile(filePath, phases, dryRun) {
  let html = fs.readFileSync(filePath, 'utf8');
  const original = html;
  const slug = path.basename(filePath, '.html');
  const log = [];

  // Skip non-port pages
  if (html.includes('name="page-type"') && !html.includes('content="port"')) {
    return { changed: false, log: [{ phase: 0, action: 'skip', detail: 'Non-port page' }] };
  }

  // Phase 1: Structural
  if (phases.has(1)) {
    html = phase1_fixDuplicateAuthorHeading(html, log);
    html = phase1_fixDuplicateWhimsicalUnits(html, log);
    html = phase1_fixDuplicateRecentRail(html, log);
    html = phase1_fixNestedNav(html, log);
  }

  // Phase 2: Disclaimers
  if (phases.has(2)) {
    html = phase2_fixDisclaimerContradiction(html, slug, log);
  }

  // Phase 3: Report (always runs, never modifies)
  if (phases.has(3)) {
    phase3_reportGaps(html, slug, log);
  }

  const changed = html !== original;
  if (changed && !dryRun) {
    fs.writeFileSync(filePath, html, 'utf8');
  }

  return { changed, log };
}

function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const reportOnly = args.includes('--report');
  const fileIdx = args.indexOf('--file');
  const singleFile = fileIdx !== -1 ? args[fileIdx + 1] : null;

  // Parse phases
  const phases = new Set();
  let i = 0;
  while (i < args.length) {
    if (args[i] === '--phase' && i + 1 < args.length) {
      phases.add(parseInt(args[i + 1]));
      i += 2;
    } else { i++; }
  }
  if (phases.size === 0) {
    if (reportOnly) phases.add(3);
    else { phases.add(1); phases.add(2); phases.add(3); }
  }

  let files;
  if (singleFile) {
    files = [path.resolve(singleFile)];
  } else {
    files = fs.readdirSync(PORTS_DIR)
      .filter(f => f.endsWith('.html'))
      .map(f => path.join(PORTS_DIR, f));
  }

  console.log(JSON.stringify({
    mode: dryRun ? 'dry-run' : reportOnly ? 'report' : 'live',
    phases: [...phases].sort(),
    files: files.length,
    timestamp: new Date().toISOString(),
  }));

  const results = [];
  let totalChanged = 0;
  let totalActions = 0;
  let totalFlags = 0;

  for (const filePath of files) {
    const { changed, log } = repairFile(filePath, phases, dryRun);
    if (log.length === 0) continue;

    const actions = log.filter(l => !l.action.startsWith('FLAG_') && l.action !== 'skip');
    const flags = log.filter(l => l.action.startsWith('FLAG_'));

    if (changed) totalChanged++;
    totalActions += actions.length;
    totalFlags += flags.length;

    results.push({
      file: path.basename(filePath),
      changed,
      actions: actions.map(a => ({ phase: a.phase, action: a.action, detail: a.detail })),
      flags: flags.map(f => ({ phase: f.phase, action: f.action, detail: f.detail, severity: f.severity })),
    });
  }

  // Output results as JSON (machine-readable per Gemini's recommendation)
  console.log(JSON.stringify({
    summary: {
      files_scanned: files.length,
      files_changed: totalChanged,
      actions_applied: totalActions,
      flags_raised: totalFlags,
    },
    pages: results.filter(r => r.actions.length > 0 || r.flags.length > 0),
  }, null, 2));
}

main();
