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
  let m = rel.match(/^assets\/ships\/([^/]+)\/(.+)$/);
  if (m) return { section: 'ships', line: m[1], filename: m[2] };
  m = rel.match(/^assets\/ships\/(.+)$/);
  if (m) return { section: 'ships', line: '_root', filename: m[1] };
  m = rel.match(/^images\/ports\/([^/]+)\/(.+)$/);
  if (m) return { section: 'ports', line: m[1], filename: m[2] };
  m = rel.match(/^images\/ports\/(.+)$/);
  if (m) return { section: 'ports', line: '_root', filename: m[1] };
  if (rel.startsWith('assets/venues/'))   return { section: 'venues',  line: '_generic', filename: path.basename(rel) };
  if (rel.startsWith('assets/articles/')) return { section: 'articles', line: '_generic', filename: path.basename(rel) };
  if (rel.startsWith('authors/'))         return { section: 'authors',  line: '_generic', filename: path.basename(rel) };
  if (rel.startsWith('assets/img/'))      return { section: 'ships',   line: '_legacy', filename: path.basename(rel) };
  return null;
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
  const hash = md5(abs);
  const entries = registry.by_hash[hash] || [];

  const myMeta = classifyOnDemand(rel);
  if (!myMeta) return null;
  const myKey = entityKeyFromMeta(myMeta);

  // Find any registry entry that resolves to a DIFFERENT entity-key.
  const conflicts = entries.filter(e => {
    if (e.rel === rel) return false;
    const otherKey = entityKeyFromMeta(e);
    return otherKey !== myKey;
  });
  if (conflicts.length === 0) return null;
  return { rel, hash, conflicts };
}

function reportConflict(c) {
  console.error('');
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
    if (c) conflicts.push(c);
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
