#!/usr/bin/env node
/**
 * v3 — Symlink triage in image trees.
 *
 * Walks every image tree, finds every symlink, and categorizes each so
 * deletion is a mechanical follow-up rather than guesswork.
 *
 * For each symlink:
 *   1. Resolve the target on disk; check it exists.
 *   2. Grep ships/, ports/, articles/, authors/, cruise-lines/ HTML for any
 *      reference to either the symlink path or the target path.
 *   3. Classify:
 *        - ORPHAN          — no HTML reference to either path. Safe to delete.
 *        - REDIRECTABLE    — HTML references the symlink only. Action: update
 *                            HTML to point at target, then delete symlink.
 *        - SHARED          — HTML references both paths separately. Action:
 *                            decide per-page whether to consolidate.
 *        - TARGET-ONLY     — HTML references the target only; symlink is
 *                            unreferenced. Safe to delete the symlink.
 *        - BROKEN-TARGET   — symlink target does not exist on disk. Action:
 *                            delete symlink AND remove HTML refs.
 *
 * Output:
 *   audit-reports/image-symlinks-triage.md
 *   audit-reports/image-symlinks-triage.json
 *
 * Asserts no canonical and proposes no automated rewrite. Observation only.
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');

const REPO_ROOT = path.resolve(__dirname, '..');
const REPORT_OUT = path.join(REPO_ROOT, 'audit-reports', 'image-symlinks-triage.md');
const JSON_OUT = path.join(REPO_ROOT, 'audit-reports', 'image-symlinks-triage.json');

const IMAGE_TREES = [
  'assets/ships', 'assets/img', 'images/ports',
  'assets/venues', 'assets/articles',
  'assets/images/restaurants', 'assets/images/entertainment',
  'authors',
];

const HTML_TREES = [
  'ships', 'ports', 'articles', 'authors', 'cruise-lines',
];

const IMG_RE = /\.(webp|jpe?g|png|gif|avif)$/i;

function* walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isSymbolicLink()) {
      yield { full, symlink: true };
    } else if (entry.isDirectory()) {
      yield* walk(full);
    } else if (entry.isFile()) {
      yield { full, symlink: false };
    }
  }
}

function relPath(p) {
  return path.relative(REPO_ROOT, p).replace(/\\/g, '/');
}

function* walkHtml() {
  for (const tree of HTML_TREES) {
    const root = path.join(REPO_ROOT, tree);
    if (!fs.existsSync(root)) continue;
    for (const item of walk(root)) {
      if (item.symlink) continue;
      if (item.full.endsWith('.html')) yield item.full;
    }
  }
  // Top-level *.html
  for (const f of fs.readdirSync(REPO_ROOT)) {
    if (f.endsWith('.html')) yield path.join(REPO_ROOT, f);
  }
}

function buildHtmlIndex() {
  // Build a map: image-basename → [{html_path, full_ref_seen}]
  // We index by basename (no path) so a relative ref like
  // "assets/ships/foo.webp" or "../assets/ships/foo.webp" both index.
  // After indexing, we re-confirm by substring match on the full path.
  const byBasename = new Map();
  let counted = 0;
  for (const htmlFull of walkHtml()) {
    const html = fs.readFileSync(htmlFull, 'utf8');
    const refs = new Set();
    for (const m of html.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["']/gi)) refs.add(m[1]);
    for (const m of html.matchAll(/\bsrcset=["']([^"']+)["']/gi)) {
      for (const part of m[1].split(',')) {
        const url = part.trim().split(/\s+/)[0];
        if (url) refs.add(url);
      }
    }
    // Also catch CSS background-image and direct hrefs in case of  images linked from text.
    for (const m of html.matchAll(/url\(["']?([^"')]+)["']?\)/gi)) refs.add(m[1]);

    for (const ref of refs) {
      if (/^(https?:|\/\/|data:)/.test(ref)) continue;
      const stripped = ref.split(/[#?]/)[0];
      if (!IMG_RE.test(stripped)) continue;
      const base = path.posix.basename(stripped);
      if (!byBasename.has(base)) byBasename.set(base, []);
      byBasename.get(base).push({ html: relPath(htmlFull), ref: stripped });
      counted++;
    }
  }
  return { byBasename, counted };
}

function refsForPath(rel, htmlIndex) {
  const base = path.posix.basename(rel);
  const candidates = htmlIndex.byBasename.get(base) || [];
  // Confirm each candidate's ref actually resolves to this file (defense vs.
  // basename collisions, e.g. multiple ships sharing "exterior.jpg").
  return candidates.filter(c => {
    // Resolve candidate ref to repo path, same logic as check-image-reuse.cjs
    const r = c.ref;
    let p;
    if (r.startsWith('/')) p = r.slice(1);
    else p = path.posix.join(path.posix.dirname(c.html), r);
    return p === rel;
  });
}

function classify(symlink, target, refsToSymlink, refsToTarget) {
  if (!target.exists) return 'BROKEN-TARGET';
  if (refsToSymlink.length === 0 && refsToTarget.length === 0) return 'ORPHAN';
  if (refsToSymlink.length === 0 && refsToTarget.length > 0) return 'TARGET-ONLY';
  if (refsToSymlink.length > 0 && refsToTarget.length === 0) return 'REDIRECTABLE';
  return 'SHARED';
}

function main() {
  console.log('[symlink-triage] indexing HTML image references…');
  const htmlIndex = buildHtmlIndex();
  console.log(`[symlink-triage] indexed ${htmlIndex.counted} ref(s) across ${htmlIndex.byBasename.size} unique basenames`);

  const symlinks = [];
  for (const tree of IMAGE_TREES) {
    const root = path.join(REPO_ROOT, tree);
    if (!fs.existsSync(root)) continue;
    for (const item of walk(root)) {
      if (!item.symlink) continue;
      const rel = relPath(item.full);
      let targetRaw = null;
      try { targetRaw = fs.readlinkSync(item.full); } catch (_) {}
      // Resolve target relative to symlink directory.
      let targetAbs = null, targetRel = null, targetExists = false;
      if (targetRaw) {
        targetAbs = path.isAbsolute(targetRaw)
          ? targetRaw
          : path.resolve(path.dirname(item.full), targetRaw);
        targetExists = fs.existsSync(targetAbs);
        if (targetAbs.startsWith(REPO_ROOT)) targetRel = relPath(targetAbs);
      }
      symlinks.push({ rel, targetRaw, targetRel, targetExists });
    }
  }
  console.log(`[symlink-triage] found ${symlinks.length} symlink(s)`);

  const out = [];
  const buckets = { ORPHAN: [], 'TARGET-ONLY': [], REDIRECTABLE: [], SHARED: [], 'BROKEN-TARGET': [] };
  for (const s of symlinks) {
    const refsToSymlink = refsForPath(s.rel, htmlIndex);
    const refsToTarget = s.targetRel ? refsForPath(s.targetRel, htmlIndex) : [];
    const klass = classify(s, { exists: s.targetExists }, refsToSymlink, refsToTarget);
    const entry = { ...s, refsToSymlink, refsToTarget, klass };
    out.push(entry);
    buckets[klass].push(entry);
  }

  fs.writeFileSync(JSON_OUT, JSON.stringify({
    generated_at: new Date().toISOString(),
    total: symlinks.length,
    counts: Object.fromEntries(Object.entries(buckets).map(([k, v]) => [k, v.length])),
    entries: out,
  }, null, 2));

  // Markdown report
  const lines = [];
  lines.push('# Image-symlink triage');
  lines.push('');
  lines.push(`**Generated:** ${new Date().toISOString()}`);
  lines.push(`**Total symlinks in image trees:** ${symlinks.length}`);
  lines.push('');
  lines.push('| Class | Count | Recommended action |');
  lines.push('|---|---|---|');
  lines.push(`| ORPHAN        | ${buckets.ORPHAN.length} | safe to \`rm\`; no HTML touches it |`);
  lines.push(`| TARGET-ONLY   | ${buckets['TARGET-ONLY'].length} | safe to \`rm\`; HTML already points at the real target |`);
  lines.push(`| REDIRECTABLE  | ${buckets.REDIRECTABLE.length} | rewrite HTML to point at target, then \`rm\` symlink |`);
  lines.push(`| SHARED        | ${buckets.SHARED.length} | per-page judgment: HTML refs both sides separately |`);
  lines.push(`| BROKEN-TARGET | ${buckets['BROKEN-TARGET'].length} | \`rm\` symlink AND remove HTML refs (target missing) |`);
  lines.push('');
  lines.push('Each section below lists at most 30 entries; the full list is in `image-symlinks-triage.json`.');
  lines.push('');
  lines.push('---');
  lines.push('');

  function renderBucket(name, list) {
    lines.push(`## ${name} (${list.length})`);
    lines.push('');
    if (list.length === 0) { lines.push('_(none)_'); lines.push(''); return; }
    for (const e of list.slice(0, 30)) {
      lines.push(`- \`${e.rel}\` → \`${e.targetRel ?? e.targetRaw ?? '<unreadable>'}\``);
      if (e.refsToSymlink.length) {
        lines.push(`  - HTML refs to symlink: ${e.refsToSymlink.length} (e.g., \`${e.refsToSymlink[0].html}\`)`);
      }
      if (e.refsToTarget.length) {
        lines.push(`  - HTML refs to target: ${e.refsToTarget.length} (e.g., \`${e.refsToTarget[0].html}\`)`);
      }
    }
    if (list.length > 30) lines.push(`  - … ${list.length - 30} more in JSON`);
    lines.push('');
  }

  renderBucket('🟢 ORPHAN — no HTML reference, delete on sight', buckets.ORPHAN);
  renderBucket('🟢 TARGET-ONLY — HTML already references the real target', buckets['TARGET-ONLY']);
  renderBucket('🟡 REDIRECTABLE — rewrite HTML, then delete', buckets.REDIRECTABLE);
  renderBucket('🟠 SHARED — HTML references both paths separately', buckets.SHARED);
  renderBucket('🔴 BROKEN-TARGET — target does not exist, remove everywhere', buckets['BROKEN-TARGET']);

  fs.writeFileSync(REPORT_OUT, lines.join('\n') + '\n');

  console.log(`[symlink-triage] ORPHAN ${buckets.ORPHAN.length}, TARGET-ONLY ${buckets['TARGET-ONLY'].length}, REDIRECTABLE ${buckets.REDIRECTABLE.length}, SHARED ${buckets.SHARED.length}, BROKEN-TARGET ${buckets['BROKEN-TARGET'].length}`);
  console.log(`[symlink-triage] wrote ${path.relative(REPO_ROOT, REPORT_OUT)}`);
}

main();
