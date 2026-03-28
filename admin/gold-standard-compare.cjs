#!/usr/bin/env node
/**
 * gold-standard-compare.cjs — Compare port pages against the gold standard (dubai.html)
 * Soli Deo Gloria
 *
 * Reads dubai.html as the reference, then compares each target page
 * documenting every structural difference.
 *
 * Usage:
 *   node admin/gold-standard-compare.cjs ports/bermuda.html          # Single page
 *   node admin/gold-standard-compare.cjs --sample 10                  # Random 10%
 *   node admin/gold-standard-compare.cjs --json                       # JSON output
 */

const fs = require('fs');
const path = require('path');

const GOLD_STANDARD = path.join(__dirname, '..', 'ports', 'dubai.html');
const PORTS_DIR = path.join(__dirname, '..', 'ports');

function fingerprint(html) {
  const fp = {};

  // Meta tags present
  const metaNames = [];
  html.replace(/<meta\s+name="([^"]+)"/gi, (m, name) => { metaNames.push(name); });
  html.replace(/<meta\s+property="([^"]+)"/gi, (m, prop) => { metaNames.push(prop); });
  fp.meta_tags = [...new Set(metaNames)].sort();

  // Section IDs in order
  const allIds = [];
  html.replace(/\bid="([^"]+)"/g, (m, id) => { allIds.push(id); });
  const portSections = ['hero', 'logbook', 'weather-guide', 'cruise-port', 'getting-around',
    'port-map-section', 'map', 'beaches', 'excursions', 'history', 'cultural', 'shopping',
    'food', 'notices', 'depth-soundings', 'practical', 'gallery', 'credits', 'faq',
    'from-the-pier', 'back-nav'];
  fp.section_ids = allIds.filter(id => portSections.includes(id));

  // Structural elements
  fp.has_article = /<article/i.test(html);
  fp.article_class = (html.match(/<article\s+class="([^"]+)"/i) || [, ''])[1];
  fp.has_breadcrumb = /aria-label="Breadcrumb"/i.test(html);
  fp.has_hero = /class="port-hero"/i.test(html) || /id="hero"/i.test(html);
  fp.has_sidebar = /<aside/i.test(html);
  fp.has_h1 = /<h1[\s>]/i.test(html);
  fp.has_canonical = /rel="canonical"/i.test(html);
  fp.has_og = /property="og:title"/i.test(html);
  fp.has_twitter = /twitter:card/i.test(html);
  fp.has_service_worker = /serviceWorker/i.test(html);

  // Content features
  fp.has_from_the_pier = /from-the-pier/i.test(html);
  fp.has_weather_widget = /data-port-id/i.test(html) || /weather-widget/i.test(html);
  fp.has_photo_credits = /photo-credit/i.test(html);
  fp.has_gallery = /gallery-grid|swiper/i.test(html);
  fp.has_disclaimer = /soundings in another|sailed this port|firsthand experience/i.test(html);
  fp.has_author_card = /author-card/i.test(html);
  fp.has_details_sections = (html.match(/<details[^>]*class="port-section"/gi) || []).length;
  fp.has_collapsible = /<details[^>]*open/gi.test(html);

  // JSON-LD types
  const schemaTypes = [];
  html.replace(/"@type"\s*:\s*"([^"]+)"/g, (m, t) => { schemaTypes.push(t); });
  fp.jsonld_types = [...new Set(schemaTypes)].sort();

  // Counts
  fp.webp_count = (html.match(/\.webp/gi) || []).length;
  fp.h2_count = (html.match(/<h2/gi) || []).length;
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  fp.word_count = text.split(' ').filter(w => w.length > 0).length;

  // Body/main class
  fp.body_class = (html.match(/<body\s+class="([^"]+)"/i) || [, ''])[1];
  fp.main_class = (html.match(/<main\s+class="([^"]+)"/i) || [, ''])[1];

  // Navbar pattern
  fp.has_nested_nav = false;
  let navDepth = 0;
  html.replace(/<\/?nav\b[^>]*>/gi, (tag) => {
    if (tag.startsWith('</')) { navDepth = Math.max(0, navDepth - 1); }
    else { navDepth++; if (navDepth > 1) fp.has_nested_nav = true; }
  });

  return fp;
}

function compare(goldFp, targetFp, targetFile) {
  const diffs = [];
  const slug = path.basename(targetFile, '.html');

  // Meta tag differences
  const goldMetas = new Set(goldFp.meta_tags);
  const targetMetas = new Set(targetFp.meta_tags);
  const missingMetas = [...goldMetas].filter(m => !targetMetas.has(m));
  const extraMetas = [...targetMetas].filter(m => !goldMetas.has(m));
  if (missingMetas.length > 0) diffs.push({ category: 'META', severity: 'HIGH', detail: `Missing meta tags: ${missingMetas.join(', ')}` });
  if (extraMetas.length > 0) diffs.push({ category: 'META', severity: 'LOW', detail: `Extra meta tags: ${extraMetas.join(', ')}` });

  // Section differences
  const goldSections = new Set(goldFp.section_ids);
  const targetSections = new Set(targetFp.section_ids);
  const missingSections = [...goldSections].filter(s => !targetSections.has(s));
  const extraSections = [...targetSections].filter(s => !goldSections.has(s));
  if (missingSections.length > 0) diffs.push({ category: 'SECTIONS', severity: 'HIGH', detail: `Missing sections: ${missingSections.join(', ')}` });
  if (extraSections.length > 0) diffs.push({ category: 'SECTIONS', severity: 'LOW', detail: `Extra sections: ${extraSections.join(', ')}` });

  // Structural booleans
  const boolChecks = [
    ['has_breadcrumb', 'Breadcrumb navigation', 'HIGH'],
    ['has_hero', 'Hero section', 'HIGH'],
    ['has_sidebar', 'Sidebar (<aside>)', 'HIGH'],
    ['has_h1', '<h1> tag', 'HIGH'],
    ['has_canonical', 'Canonical URL', 'HIGH'],
    ['has_og', 'OpenGraph tags', 'MEDIUM'],
    ['has_twitter', 'Twitter Card tags', 'MEDIUM'],
    ['has_service_worker', 'Service worker', 'LOW'],
    ['has_from_the_pier', 'From the Pier nav', 'MEDIUM'],
    ['has_weather_widget', 'Weather widget', 'MEDIUM'],
    ['has_photo_credits', 'Photo credits', 'MEDIUM'],
    ['has_gallery', 'Gallery (grid/swiper)', 'MEDIUM'],
    ['has_disclaimer', 'Author disclaimer', 'MEDIUM'],
    ['has_author_card', 'Author card in sidebar', 'LOW'],
  ];
  for (const [key, label, severity] of boolChecks) {
    if (goldFp[key] && !targetFp[key]) {
      diffs.push({ category: 'STRUCTURE', severity, detail: `Missing: ${label}` });
    }
  }

  // Class differences
  if (goldFp.article_class !== targetFp.article_class && targetFp.article_class) {
    diffs.push({ category: 'TEMPLATE', severity: 'LOW', detail: `Article class: "${targetFp.article_class}" (gold: "${goldFp.article_class}")` });
  }
  if (goldFp.body_class !== targetFp.body_class && targetFp.body_class) {
    diffs.push({ category: 'TEMPLATE', severity: 'LOW', detail: `Body class: "${targetFp.body_class}" (gold: "${goldFp.body_class}")` });
  }
  if (goldFp.main_class !== targetFp.main_class && targetFp.main_class) {
    diffs.push({ category: 'TEMPLATE', severity: 'LOW', detail: `Main class: "${targetFp.main_class}" (gold: "${goldFp.main_class}")` });
  }

  // Nested nav
  if (targetFp.has_nested_nav && !goldFp.has_nested_nav) {
    diffs.push({ category: 'STRUCTURE', severity: 'MEDIUM', detail: 'Has nested <nav> (gold standard does not)' });
  }

  // JSON-LD differences
  const goldSchemas = new Set(goldFp.jsonld_types);
  const targetSchemas = new Set(targetFp.jsonld_types);
  const missingSchemas = [...goldSchemas].filter(s => !targetSchemas.has(s));
  if (missingSchemas.length > 0) diffs.push({ category: 'SCHEMA', severity: 'MEDIUM', detail: `Missing JSON-LD types: ${missingSchemas.join(', ')}` });

  // Content gaps
  if (targetFp.webp_count < goldFp.webp_count * 0.5) {
    diffs.push({ category: 'CONTENT', severity: 'HIGH', detail: `Low image count: ${targetFp.webp_count} (gold: ${goldFp.webp_count})` });
  }
  if (targetFp.word_count < goldFp.word_count * 0.5) {
    diffs.push({ category: 'CONTENT', severity: 'HIGH', detail: `Low word count: ${targetFp.word_count} (gold: ${goldFp.word_count})` });
  }
  if (targetFp.h2_count < goldFp.h2_count * 0.5) {
    diffs.push({ category: 'CONTENT', severity: 'MEDIUM', detail: `Few sections: ${targetFp.h2_count} h2 tags (gold: ${goldFp.h2_count})` });
  }

  return diffs;
}

function main() {
  const args = process.argv.slice(2);
  const jsonOutput = args.includes('--json');
  const sampleIdx = args.indexOf('--sample');
  const samplePct = sampleIdx !== -1 ? parseInt(args[sampleIdx + 1]) || 10 : null;
  const singleFiles = args.filter(a => a.endsWith('.html'));

  // Load gold standard
  const goldHtml = fs.readFileSync(GOLD_STANDARD, 'utf8');
  const goldFp = fingerprint(goldHtml);

  // Select files
  let files;
  if (singleFiles.length > 0) {
    files = singleFiles.map(f => path.resolve(f));
  } else {
    const allFiles = fs.readdirSync(PORTS_DIR)
      .filter(f => f.endsWith('.html') && f !== 'dubai.html')
      .map(f => path.join(PORTS_DIR, f));
    if (samplePct) {
      const count = Math.ceil(allFiles.length * samplePct / 100);
      // Deterministic sample using simple hash
      allFiles.sort((a, b) => {
        const ha = a.split('').reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0);
        const hb = b.split('').reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0);
        return ha - hb;
      });
      files = allFiles.slice(0, count);
    } else {
      files = allFiles;
    }
  }

  const results = [];

  for (const filePath of files) {
    const html = fs.readFileSync(filePath, 'utf8');

    // Skip non-port pages
    if (html.includes('name="page-type"') && !html.includes('content="port"')) continue;

    const targetFp = fingerprint(html);
    const diffs = compare(goldFp, targetFp, filePath);
    const relPath = path.relative(path.join(__dirname, '..'), filePath);

    results.push({ file: relPath, diffs_count: diffs.length, diffs });
  }

  if (jsonOutput) {
    console.log(JSON.stringify(results, null, 2));
    return;
  }

  // Console output
  console.log(`\n${'═'.repeat(70)}`);
  console.log(`  Gold Standard Comparison — ${files.length} pages vs dubai.html`);
  console.log(`${'═'.repeat(70)}\n`);

  for (const r of results) {
    if (r.diffs.length === 0) {
      console.log(`  ✓ ${r.file} — matches gold standard`);
      continue;
    }
    console.log(`  ${r.file} (${r.diffs_count} differences):`);
    for (const d of r.diffs) {
      const icon = d.severity === 'HIGH' ? '🔴' : d.severity === 'MEDIUM' ? '🟡' : '⚪';
      console.log(`    ${icon} [${d.category}] ${d.detail}`);
    }
    console.log();
  }

  // Summary
  const totalDiffs = results.reduce((s, r) => s + r.diffs_count, 0);
  const perfect = results.filter(r => r.diffs_count === 0).length;
  console.log(`${'─'.repeat(70)}`);
  console.log(`  Pages compared:    ${results.length}`);
  console.log(`  Match gold std:    ${perfect}`);
  console.log(`  Total differences: ${totalDiffs}`);
  console.log(`  Avg diffs/page:    ${(totalDiffs / results.length).toFixed(1)}`);
  console.log(`${'─'.repeat(70)}\n`);
}

main();
