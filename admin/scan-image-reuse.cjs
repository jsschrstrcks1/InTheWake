#!/usr/bin/env node
/**
 * v3 — Site-wide image-reuse scanner.
 *
 * Walks every image under the site's image trees, hashes each, and surfaces
 * the four sins this site keeps committing:
 *
 *   1. CRITICAL — same bytes used on pages in DIFFERENT sections (a ship
 *      photo passed off as a port photo, a venue photo on a ship page).
 *      The Cordelia-on-Carnival pattern. Lying to the reader.
 *   2. ERROR    — same bytes used for two DIFFERENT entities in the same
 *      section (Liberty's hero photo also serving as Radiance's).
 *   3. WARN     — image filename does not contain the entity's slug
 *      (assets/<section>/<line>/<slug>* convention violated).
 *   4. INFO     — same image bytes appear under multiple filenames within
 *      the SAME entity's directory (storage waste; pick one).
 *
 * Sections covered:
 *   - ships         assets/ships/<line>/<slug>*  (slugs from ships/<line>/*.html)
 *   - ports         images/ports/<slug>/*       (slugs from ports/*.html)
 *   - venues        assets/venues/*             (no per-venue slug — generic bucket)
 *   - authors       authors/img/*  authors/*.{webp,jpg}
 *   - articles      assets/articles/*
 *   - brand         assets/brand/*  assets/icons/*  assets/social/*  (allowlisted)
 *   - generic       assets/images/* (per-category SVG; allowlisted)
 *
 * Outputs:
 *   audit-reports/image-reuse-registry.json   md5 → [{path, section, owner, slug?}]
 *   audit-reports/image-reuse-report.md       human-readable triage
 *
 * Exit codes: 0 if no CRITICAL/ERROR; 1 if any (CI-fail).
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const REPO_ROOT = path.resolve(__dirname, '..');
const REGISTRY_OUT = path.join(REPO_ROOT, 'audit-reports', 'image-reuse-registry.json');
const REPORT_OUT = path.join(REPO_ROOT, 'audit-reports', 'image-reuse-report.md');

const IMG_RE = /\.(webp|jpe?g|png|gif|avif)$/i;

// Image trees we walk. Order matters only for nicer report layout.
const IMAGE_TREES = [
  { dir: 'assets/ships',    section: 'ships' },
  { dir: 'assets/img',      section: 'ships' },         // legacy
  { dir: 'images/ports',    section: 'ports' },
  { dir: 'assets/venues',   section: 'venues' },
  { dir: 'assets/articles', section: 'articles' },
  { dir: 'assets/images/restaurants/photos', section: 'restaurants' },
  { dir: 'assets/images/entertainment',      section: 'entertainment' },
  { dir: 'authors/img',     section: 'authors' },
  { dir: 'authors',         section: 'authors', flat: true }, // top-level files only
  { dir: 'assets/brand',    section: 'brand',   allowlist: true },
  { dir: 'assets/icons',    section: 'icons',   allowlist: true },
  { dir: 'assets/social',   section: 'social',  allowlist: true },
];

// Sections where cross-entity reuse is FINE (icons, brand, fallback graphics).
const ALLOWLISTED_SECTIONS = new Set(['brand', 'icons', 'social']);

// Slug source per section: which directory holds the canonical .html files
// from which we derive the list of valid slugs.
const SLUG_SOURCES = {
  ships:    { root: 'ships',    nested: true  },  // ships/<line>/<slug>.html
  ports:    { root: 'ports',    nested: false },  // ports/<slug>.html
  authors:  { root: 'authors',  nested: false },
  articles: { root: 'articles', nested: false },
};

function* walk(dir, { flat = false } = {}) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!flat) yield* walk(full);
    } else if (entry.isFile() && IMG_RE.test(entry.name)) {
      yield full;
    }
  }
}

function md5(file) {
  return crypto.createHash('md5').update(fs.readFileSync(file)).digest('hex');
}

function relPath(p) {
  return path.relative(REPO_ROOT, p).replace(/\\/g, '/');
}

function loadKnownSlugs() {
  const out = {}; // section → { line?: Set<slug>, _all: Set<slug> }
  for (const [section, src] of Object.entries(SLUG_SOURCES)) {
    const root = path.join(REPO_ROOT, src.root);
    if (!fs.existsSync(root)) continue;
    out[section] = { _all: new Set() };
    if (src.nested) {
      for (const lineEntry of fs.readdirSync(root, { withFileTypes: true })) {
        if (!lineEntry.isDirectory()) continue;
        const line = lineEntry.name;
        const lineSet = new Set();
        for (const f of fs.readdirSync(path.join(root, line))) {
          if (f.endsWith('.html') && f !== 'index.html') {
            const slug = f.replace(/\.html$/, '').toLowerCase();
            lineSet.add(slug);
            out[section]._all.add(slug);
          }
        }
        if (lineSet.size > 0) out[section][line] = lineSet;
      }
    } else {
      for (const f of fs.readdirSync(root)) {
        if (f.endsWith('.html') && f !== 'index.html') {
          out[section]._all.add(f.replace(/\.html$/, '').toLowerCase());
        }
      }
    }
  }
  return out;
}

function normalize(s) {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Derive section + owner-line from path. Returns { section, line, filename, slug? }.
function classify(rel, knownSlugs) {
  // assets/ships/<line>/<file>
  let m = rel.match(/^assets\/ships\/([^/]+)\/(.+)$/);
  if (m) {
    const [, line, file] = m;
    const slug = matchSlug(file, knownSlugs.ships?.[line] || knownSlugs.ships?._all);
    return { section: 'ships', line, filename: file, slug };
  }
  m = rel.match(/^assets\/ships\/(.+)$/);
  if (m) {
    const file = m[1];
    const slug = matchSlug(file, knownSlugs.ships?._all);
    return { section: 'ships', line: '_root', filename: file, slug };
  }
  m = rel.match(/^images\/ports\/([^/]+)\/(.+)$/);
  if (m) {
    const [, slugOrFolder, file] = m;
    const slug = knownSlugs.ports?._all.has(slugOrFolder) ? slugOrFolder
                 : matchSlug(file, knownSlugs.ports?._all);
    return { section: 'ports', line: slugOrFolder, filename: file, slug };
  }
  m = rel.match(/^images\/ports\/(.+)$/);
  if (m) return { section: 'ports', line: '_root', filename: m[1], slug: matchSlug(m[1], knownSlugs.ports?._all) };
  if (rel.startsWith('assets/venues/'))   return { section: 'venues',  line: '_generic', filename: path.basename(rel), slug: null };
  if (rel.startsWith('assets/articles/')) return { section: 'articles', line: '_generic', filename: path.basename(rel), slug: matchSlug(path.basename(rel), knownSlugs.articles?._all) };
  if (rel.startsWith('authors/'))         return { section: 'authors',  line: '_generic', filename: path.basename(rel), slug: matchSlug(path.basename(rel), knownSlugs.authors?._all) };
  if (rel.startsWith('assets/img/'))      return { section: 'ships',   line: '_legacy', filename: path.basename(rel), slug: matchSlug(path.basename(rel), knownSlugs.ships?._all) };
  if (rel.startsWith('assets/images/restaurants')) return { section: 'restaurants', line: '_generic', filename: path.basename(rel), slug: null };
  if (rel.startsWith('assets/images/entertainment')) return { section: 'entertainment', line: '_generic', filename: path.basename(rel), slug: null };
  if (rel.startsWith('assets/brand/'))    return { section: 'brand',   line: '_allow', filename: path.basename(rel), slug: null };
  if (rel.startsWith('assets/icons/'))    return { section: 'icons',   line: '_allow', filename: path.basename(rel), slug: null };
  if (rel.startsWith('assets/social/'))   return { section: 'social',  line: '_allow', filename: path.basename(rel), slug: null };
  return { section: '_unknown', line: '_unknown', filename: path.basename(rel), slug: null };
}

function matchSlug(filename, slugSet) {
  if (!slugSet) return null;
  const norm = normalize(filename);
  let best = null;
  for (const slug of slugSet) {
    const ns = normalize(slug);
    if (ns.length >= 6 && norm.includes(ns)) {
      if (!best || ns.length > normalize(best).length) best = slug;
    }
  }
  return best;
}

function main() {
  console.log('[image-reuse] hashing site-wide image trees…');
  const knownSlugs = loadKnownSlugs();
  const byHash = new Map();
  let scanned = 0;

  for (const tree of IMAGE_TREES) {
    const dir = path.join(REPO_ROOT, tree.dir);
    if (!fs.existsSync(dir)) continue;
    for (const full of walk(dir, { flat: tree.flat })) {
      const hash = md5(full);
      const rel = relPath(full);
      const meta = classify(rel, knownSlugs);
      if (!byHash.has(hash)) byHash.set(hash, []);
      byHash.get(hash).push({ rel, ...meta, allowlisted: ALLOWLISTED_SECTIONS.has(meta.section) });
      scanned++;
    }
  }
  console.log(`[image-reuse] hashed ${scanned} images, ${byHash.size} unique`);

  const findings = { CRITICAL: [], ERROR: [], INFO: [], WARN_FILENAME: [] };

  for (const [hash, files] of byHash) {
    if (files.every(f => f.allowlisted)) continue; // brand / icon reuse is fine

    if (files.length < 2) {
      const f = files[0];
      // Filename smells: an entity-bound section (ships/ports/articles/authors)
      // file whose name doesn't match a known slug for that section.
      if (['ships', 'ports', 'articles', 'authors'].includes(f.section) &&
          !f.allowlisted && !f.slug && f.line !== '_root' && f.line !== '_generic' && f.line !== '_legacy') {
        findings.WARN_FILENAME.push({ hash, files: [f], reason: `filename does not contain a known ${f.section}-slug` });
      }
      continue;
    }

    const sections = new Set(files.map(f => f.section));
    const lines = new Set(files.map(f => f.line));
    const slugs = new Set(files.map(f => f.slug).filter(Boolean));
    const allShareSlug = slugs.size === 1 && files.every(f => f.slug === [...slugs][0]);

    if (sections.size > 1 && !sections.has('brand') && !sections.has('icons') && !sections.has('social')) {
      findings.CRITICAL.push({ hash, files, reason: `same bytes used across DIFFERENT sections: ${[...sections].join(', ')}` });
    } else if (sections.size === 1 && lines.size > 1 && !lines.has('_root') && !lines.has('_legacy')) {
      findings.CRITICAL.push({ hash, files, reason: `same bytes used across DIFFERENT cruise lines / port-groups within ${[...sections][0]}` });
    } else if (slugs.size > 1) {
      findings.ERROR.push({ hash, files, reason: `same bytes used for DIFFERENT entities (${[...slugs].join(', ')}) within the same line` });
    } else if (allShareSlug) {
      findings.INFO.push({ hash, files, reason: `same bytes under multiple filenames for slug "${[...slugs][0]}" — pick one and delete duplicates` });
    } else if (lines.has('_root') || lines.has('_legacy')) {
      findings.CRITICAL.push({ hash, files, reason: 'same bytes appear in legacy/root bucket without a resolvable slug — provenance unclear' });
    } else {
      findings.INFO.push({ hash, files, reason: 'same bytes under multiple filenames within one entity — pick one and delete duplicates' });
    }
  }

  // Registry.
  const registry = {
    _doc: 'MD5 registry of every image under the site image trees. Hooks and the image-reuse-guardrail skill read this to block new reuse.',
    generated_at: new Date().toISOString(),
    scanned_count: scanned,
    unique_hashes: byHash.size,
    by_hash: Object.fromEntries([...byHash].map(([h, files]) => [h, files])),
  };
  fs.writeFileSync(REGISTRY_OUT, JSON.stringify(registry, null, 2));

  // Report.
  const lines = [];
  lines.push('# Site-wide image-reuse audit');
  lines.push('');
  lines.push(`**Generated:** ${new Date().toISOString()}`);
  lines.push(`**Images scanned:** ${scanned}`);
  lines.push(`**Unique image bytes:** ${byHash.size}`);
  lines.push(`**Storage waste:** ${scanned - byHash.size} duplicate file(s) on disk`);
  lines.push('');
  lines.push(`**🔴 CRITICAL findings:** ${findings.CRITICAL.length}`);
  lines.push(`**🟠 ERROR findings:** ${findings.ERROR.length}`);
  lines.push(`**🟡 WARN (filename does not match a slug):** ${findings.WARN_FILENAME.length}`);
  lines.push(`**ℹ️  INFO (intra-entity duplicates):** ${findings.INFO.length}`);
  lines.push('');
  lines.push('Allowlisted sections (brand / icons / social) are not flagged for reuse.');
  lines.push('');
  lines.push('---');
  lines.push('');

  function renderGroup(level, label, list) {
    if (list.length === 0) return;
    lines.push(`## ${level} — ${label} (${list.length})`);
    lines.push('');
    for (const f of list) {
      lines.push(`- **md5 \`${f.hash}\`** — ${f.reason}`);
      for (const file of f.files) {
        lines.push(`  - \`${file.rel}\`  *(section: ${file.section}, line: ${file.line}${file.slug ? `, slug: ${file.slug}` : ''})*`);
      }
      lines.push('');
    }
  }

  renderGroup('🔴 CRITICAL', 'Cross-section / cross-line image reuse', findings.CRITICAL);
  renderGroup('🟠 ERROR', 'Same-section different-entity reuse', findings.ERROR);
  renderGroup('🟡 WARN', 'Filename does not match a known slug', findings.WARN_FILENAME.slice(0, 50));
  if (findings.WARN_FILENAME.length > 50) {
    lines.push(`*… ${findings.WARN_FILENAME.length - 50} more filename smells truncated. See registry JSON for the full list.*`);
    lines.push('');
  }
  renderGroup('ℹ️ INFO', 'Storage-only duplicates within one entity', findings.INFO);

  fs.writeFileSync(REPORT_OUT, lines.join('\n') + '\n');

  console.log(`[image-reuse] CRITICAL: ${findings.CRITICAL.length}, ERROR: ${findings.ERROR.length}, WARN(filename): ${findings.WARN_FILENAME.length}, INFO: ${findings.INFO.length}`);
  console.log(`[image-reuse] wrote ${path.relative(REPO_ROOT, REPORT_OUT)}`);

  if (findings.CRITICAL.length + findings.ERROR.length > 0) process.exit(1);
}

main();
