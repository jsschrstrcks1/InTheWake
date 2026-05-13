#!/usr/bin/env node
/**
 * v3 — Pre-commit / pre-push image-reuse blocker.
 *
 * For each path passed in (typically the staged-files list from the
 * pre-commit hook), determines whether committing it would introduce
 * cross-section / cross-line / cross-entity image reuse.
 *
 * Two modes of input:
 *   - image file path  (assets/ships/..., images/ports/..., etc.)
 *       → hash the file on disk; check the registry; reject if its hash
 *         already exists for a DIFFERENT entity.
 *   - HTML file path   (ships/..., ports/..., articles/..., authors/...)
 *       → parse <img src=...> + srcset references; for each referenced
 *         image, hash it and check the registry as above.
 *
 * Registry source: audit-reports/image-reuse-registry.json. If absent,
 * regenerated automatically by running admin/scan-image-reuse.cjs first.
 *
 * Exit codes:
 *   0  — no reuse problem (or all paths are allowlisted)
 *   1  — reuse detected; commit blocked
 *   2  — usage / runtime error
 *
 * See:
 *   .claude/skills/image-reuse-guardrail/SKILL.md
 *   audit-reports/image-reuse-report.md   (full backlog)
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');

const REPO_ROOT = path.resolve(__dirname, '..');
const REGISTRY = path.join(REPO_ROOT, 'audit-reports', 'image-reuse-registry.json');

const IMG_RE = /\.(webp|jpe?g|png|gif|avif)$/i;
const ALLOWLIST_PREFIXES = ['assets/brand/', 'assets/icons/', 'assets/social/'];

// Phase 3.5 (issue #1465): mirrors the same-entity rules added to
// admin/scan-image-reuse.cjs. Audit and pre-commit must agree about which
// reuses are "Cordelia pattern" (block) vs "documented convention" (allow).
const FOM_NAMED_RE = /[-_]FOM[-_ ]/i;
const SAME_ENTITY_CROSS_SECTION_PAIRS = [new Set(['authors', 'articles'])];

function isFomNamed(filename) {
  return FOM_NAMED_RE.test(filename);
}

function filenameRoot(filename) {
  return filename.replace(/\.[^.]+$/, '').replace(/[-_ ]?\d+(?:\s*\([\d ]+\))?$/, '').toLowerCase();
}

function ensureRegistry() {
  if (fs.existsSync(REGISTRY)) return;
  console.error('[image-reuse] registry missing; rebuilding via admin/scan-image-reuse.cjs');
  const r = spawnSync('node', ['admin/scan-image-reuse.cjs'], { cwd: REPO_ROOT, stdio: 'inherit' });
  // exit 1 from scanner means existing reuse; we still want the registry written.
  if (!fs.existsSync(REGISTRY)) {
    console.error('[image-reuse] scanner did not produce a registry — aborting');
    process.exit(2);
  }
}

function md5(file) {
  return crypto.createHash('md5').update(fs.readFileSync(file)).digest('hex');
}

function isAllowlisted(rel) {
  return ALLOWLIST_PREFIXES.some(p => rel.startsWith(p));
}

function entityKeyFromMeta(meta) {
  // What counts as "the same entity"? Section + slug if available, else section + line + filename.
  if (meta.slug) return `${meta.section}:${meta.slug}`;
  return `${meta.section}:${meta.line}:${meta.filename}`;
}

function classifyOnDemand(rel) {
  // Lightweight reproduction of scan-image-reuse.cjs:classify() for paths
  // that may not be in the registry yet (e.g., a brand-new image being added).
  // Phase 3.5 (issue #1465): also derive slug so entityKeyFromMeta can
  // collapse _root + line for ships (Carnival_Conquest_3.jpg ≡
  // carnival/carnival-conquest-exterior.jpg, both → ships:carnival-conquest).
  let m = rel.match(/^assets\/ships\/([^/]+)\/(.+)$/);
  if (m) {
    const meta = { section: 'ships', line: m[1], filename: m[2] };
    meta.slug = deriveSlug(meta.filename, 'ships');
    return meta;
  }
  m = rel.match(/^assets\/ships\/(.+)$/);
  if (m) {
    const meta = { section: 'ships', line: '_root', filename: m[1] };
    meta.slug = deriveSlug(meta.filename, 'ships');
    return meta;
  }
  m = rel.match(/^images\/ports\/([^/]+)\/(.+)$/);
  if (m) {
    const meta = { section: 'ports', line: m[1], filename: m[2] };
    meta.slug = deriveSlug(meta.filename, 'ports') || (m[1].match(/^[a-z0-9-]+$/) ? m[1] : null);
    return meta;
  }
  m = rel.match(/^images\/ports\/(.+)$/);
  if (m) {
    const meta = { section: 'ports', line: '_root', filename: m[1] };
    meta.slug = deriveSlug(meta.filename, 'ports');
    return meta;
  }
  if (rel.startsWith('assets/venues/'))   return { section: 'venues',  line: '_generic', filename: path.basename(rel) };
  if (rel.startsWith('assets/articles/')) return { section: 'articles', line: '_generic', filename: path.basename(rel) };
  if (rel.startsWith('authors/'))         return { section: 'authors',  line: '_generic', filename: path.basename(rel) };
  if (rel.startsWith('assets/img/')) {
    const meta = { section: 'ships', line: '_legacy', filename: path.basename(rel) };
    meta.slug = deriveSlug(meta.filename, 'ships');
    return meta;
  }
  return null;
}

// Cached slug sources, lazy-built from filesystem.
let _slugSources = null;
function slugSources() {
  if (_slugSources) return _slugSources;
  _slugSources = { ships: new Set(), ports: new Set() };
  // ships/<line>/<slug>.html — nested
  const shipsRoot = path.join(REPO_ROOT, 'ships');
  if (fs.existsSync(shipsRoot)) {
    for (const lineEntry of fs.readdirSync(shipsRoot, { withFileTypes: true })) {
      if (!lineEntry.isDirectory()) continue;
      for (const f of fs.readdirSync(path.join(shipsRoot, lineEntry.name))) {
        if (f.endsWith('.html') && f !== 'index.html') _slugSources.ships.add(f.replace(/\.html$/, '').toLowerCase());
      }
    }
  }
  // ports/<slug>.html — flat
  const portsRoot = path.join(REPO_ROOT, 'ports');
  if (fs.existsSync(portsRoot)) {
    for (const f of fs.readdirSync(portsRoot)) {
      if (f.endsWith('.html') && f !== 'index.html') _slugSources.ports.add(f.replace(/\.html$/, '').toLowerCase());
    }
  }
  return _slugSources;
}

function normalize(s) {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function deriveSlug(filename, section) {
  const src = slugSources()[section];
  if (!src) return null;
  const norm = normalize(filename);
  let best = null;
  for (const slug of src) {
    const ns = normalize(slug);
    if (ns.length >= 6 && norm.includes(ns)) {
      if (!best || ns.length > normalize(best).length) best = slug;
    }
  }
  return best;
}

function extractImageRefs(htmlPath) {
  // Best-effort extraction of <img src=...> and srcset entries from HTML.
  // Returns an array of file paths relative to REPO_ROOT, deduplicated.
  const html = fs.readFileSync(path.join(REPO_ROOT, htmlPath), 'utf8');
  const refs = new Set();

  // <img ... src="...">
  for (const m of html.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["']/gi)) {
    refs.add(m[1]);
  }
  // srcset="url 1x, url2 2x, ..."
  for (const m of html.matchAll(/\bsrcset=["']([^"']+)["']/gi)) {
    for (const part of m[1].split(',')) {
      const url = part.trim().split(/\s+/)[0];
      if (url) refs.add(url);
    }
  }

  // Resolve each ref to a repo-relative file path. Skip absolute URLs.
  const out = [];
  for (const r of refs) {
    if (/^https?:/.test(r) || r.startsWith('//') || r.startsWith('data:')) continue;
    const stripped = r.split(/[#?]/)[0];
    if (!IMG_RE.test(stripped)) continue;
    let p;
    if (stripped.startsWith('/')) p = stripped.slice(1);
    else p = path.posix.join(path.posix.dirname(htmlPath), stripped);
    out.push(p);
  }
  return out;
}

function checkOneImage(rel, registry) {
  if (isAllowlisted(rel)) return null;
  const abs = path.join(REPO_ROOT, rel);
  if (!fs.existsSync(abs)) return null;

  // Symlinks are never accepted in image trees. lstat (not stat) — we want
  // to know if THIS path is a symlink, not whether the target is a file.
  let lst;
  try { lst = fs.lstatSync(abs); } catch (_) { return null; }
  if (lst.isSymbolicLink()) {
    let target = null;
    try { target = fs.readlinkSync(abs); } catch (_) {}
    return { rel, hash: null, conflicts: [], symlink: true, symlinkTarget: target };
  }

  const hash = md5(abs);
  const entries = registry.by_hash[hash] || [];

  const myMeta = classifyOnDemand(rel);
  if (!myMeta) return null;
  const myKey = entityKeyFromMeta(myMeta);

  // Find any registry entry that resolves to a DIFFERENT entity-key, after
  // applying the Phase 3.5 (issue #1465) documented-pattern allowlists.
  const conflicts = entries.filter(e => {
    if (e.rel === rel) return false;
    const otherKey = entityKeyFromMeta(e);
    if (otherKey === myKey) return false;

    // Cross-section authors↔articles same-entity: same filename root means
    // it's the author's portrait legitimately reused on their article.
    const sectionPair = new Set([myMeta.section, e.section]);
    const isCrossSectionSameEntity = SAME_ENTITY_CROSS_SECTION_PAIRS.some(allowed =>
      sectionPair.size === 2 && [...sectionPair].every(s => allowed.has(s))
    );
    if (isCrossSectionSameEntity) {
      const myRoot = filenameRoot(myMeta.filename);
      const otherRoot = filenameRoot(e.filename || path.basename(e.rel));
      if (myRoot && otherRoot && myRoot === otherRoot) return false;
    }

    // FOM convention: same-section ships, both filenames FOM-named → allow.
    if (myMeta.section === 'ships' && e.section === 'ships' &&
        isFomNamed(myMeta.filename) && isFomNamed(e.filename || path.basename(e.rel))) {
      return false;
    }

    return true;
  });
  if (conflicts.length === 0) return null;
  return { rel, hash, conflicts };
}

function reportConflict(c) {
  console.error('');
  if (c.symlink) {
    console.error(`  ⛔  ${c.rel}`);
    console.error(`      this is a SYMLINK → ${c.symlinkTarget ?? '<unreadable>'}`);
    console.error(`      symlinks are not allowed in image trees. replace with a real file + attribution, or delete.`);
    return;
  }
  console.error(`  ✗  ${c.rel}`);
  console.error(`     md5 ${c.hash} already used elsewhere for a DIFFERENT entity:`);
  for (const x of c.conflicts) {
    const slug = x.slug ? `, slug=${x.slug}` : '';
    console.error(`       ${x.rel}  (section=${x.section}, line=${x.line}${slug})`);
  }
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('usage: check-image-reuse.cjs <file1> [file2 ...]');
    process.exit(2);
  }
  ensureRegistry();
  const registry = JSON.parse(fs.readFileSync(REGISTRY, 'utf8'));

  const imageTargets = new Set();
  for (const arg of args) {
    if (IMG_RE.test(arg)) {
      imageTargets.add(arg);
    } else if (arg.endsWith('.html')) {
      for (const ref of extractImageRefs(arg)) imageTargets.add(ref);
    }
  }

  if (imageTargets.size === 0) process.exit(0);

  const conflicts = [];
  for (const rel of imageTargets) {
    const c = checkOneImage(rel, registry);
    if (!c) continue;
    if (c.symlink || c.conflicts.length > 0) conflicts.push(c);
  }

  if (conflicts.length === 0) {
    console.log(`[image-reuse] checked ${imageTargets.size} image reference(s) — no reuse detected.`);
    process.exit(0);
  }

  console.error('');
  console.error(`╭─ image-reuse-guardrail ─────────────────────────────────────────────╮`);
  console.error(`│  COMMIT BLOCKED — ${conflicts.length} cross-entity image reuse(s) detected.            │`);
  console.error(`╰─────────────────────────────────────────────────────────────────────╯`);
  for (const c of conflicts) reportConflict(c);
  console.error('');
  console.error('  This is the pattern .claude/skills/image-reuse-guardrail/SKILL.md');
  console.error('  exists to prevent. Same image bytes != two entities. Either:');
  console.error('    1. Source a unique image for the new entity (Wikimedia / press kit / FOM).');
  console.error('    2. Leave the slot empty and file the gap in audit-reports/image-coverage-audit.json.');
  console.error('  DO NOT bypass with --no-verify; the next site-wide audit will surface it anyway.');
  console.error('');
  process.exit(1);
}

main();
