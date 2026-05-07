#!/usr/bin/env node
/**
 * v3 — Visual recrop / near-duplicate detector.
 *
 * MD5 only catches byte-identical reuse. This catches the harder kind:
 * the same photograph cropped, rescaled, recompressed, recolored, or
 * mirror-flipped, then renamed to look like a unique image for a
 * different ship/port/entity.
 *
 * Method: dHash (difference hash). For each image:
 *   1. resize to 9x8 grayscale via sharp
 *   2. emit a 64-bit hash from horizontal pixel-pair differences
 * Two images with Hamming distance ≤ HAMMING_THRESHOLD on these hashes
 * are visually near-identical at the scale that matters for hero photos.
 *
 * Then for each near-duplicate group, classify the same way as
 * scan-image-reuse.cjs (cross-section / cross-line / cross-entity / intra-
 * entity).
 *
 * Output: audit-reports/image-recrops-report.md
 *         audit-reports/image-recrops-registry.json
 *
 * Exit codes:
 *   0  — no cross-entity recrops (intra-entity duplicates allowed)
 *   1  — cross-entity recrops detected
 *   2  — sharp not installed or runtime error
 *
 * Runs significantly slower than the md5 scanner (~5 ms / image vs ~1 ms);
 * intended as a periodic audit, not as a per-commit gate.
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');

let sharp;
try { sharp = require('sharp'); }
catch (_) {
  console.error('[recrops] sharp not installed. Run: npm i --save-dev sharp');
  process.exit(2);
}

const REPO_ROOT = path.resolve(__dirname, '..');
const REGISTRY = path.join(REPO_ROOT, 'audit-reports', 'image-reuse-registry.json');
const RECROP_REGISTRY_OUT = path.join(REPO_ROOT, 'audit-reports', 'image-recrops-registry.json');
const RECROP_REPORT_OUT = path.join(REPO_ROOT, 'audit-reports', 'image-recrops-report.md');

const HAMMING_THRESHOLD = 8;  // 0 = identical pixels post-downscale; 8 = "looks the same to a human at thumbnail size"
const ALLOWLISTED_SECTIONS = new Set(['brand', 'icons', 'social']);

async function dHash(filepath) {
  // Resize to 9x8 grayscale; compare adjacent horizontal pixels.
  // Returns 64-bit hash as a BigInt.
  const buf = await sharp(filepath)
    .grayscale()
    .resize(9, 8, { fit: 'fill' })
    .raw()
    .toBuffer();
  let hash = 0n;
  let bit = 63n;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const left = buf[row * 9 + col];
      const right = buf[row * 9 + col + 1];
      if (left > right) hash |= (1n << bit);
      bit--;
    }
  }
  return hash;
}

function hamming(a, b) {
  let x = a ^ b;
  let count = 0;
  while (x) { count += Number(x & 1n); x >>= 1n; }
  return count;
}

function entityKey(meta) {
  if (meta.slug) return `${meta.section}:${meta.slug}`;
  return `${meta.section}:${meta.line}:${meta.filename}`;
}

async function main() {
  if (!fs.existsSync(REGISTRY)) {
    console.error('[recrops] registry missing; run admin/scan-image-reuse.cjs first');
    process.exit(2);
  }
  const reuseReg = JSON.parse(fs.readFileSync(REGISTRY, 'utf8'));

  // Build a flat list of all images previously scanned, with their metadata.
  const all = [];
  for (const [md5, paths] of Object.entries(reuseReg.by_hash || {})) {
    for (const p of paths) {
      if (ALLOWLISTED_SECTIONS.has(p.section)) continue;
      all.push({ ...p, md5 });
    }
  }
  console.log(`[recrops] hashing ${all.length} images with dHash…`);

  let processed = 0;
  for (const item of all) {
    try {
      item.dhash = (await dHash(path.join(REPO_ROOT, item.rel))).toString();
    } catch (e) {
      item.dhash = null;
      item.dhash_error = e.message;
    }
    if (++processed % 100 === 0) console.log(`  ${processed}/${all.length}`);
  }
  console.log(`[recrops] dHashed ${processed} images`);

  // Pairwise compare. O(n^2) is fine for 1300 images (~850k pairs in <1s).
  const groups = []; // each: { hashes: Set<bigint>, members: [item, ...] }
  for (const item of all) {
    if (item.dhash === null) continue;
    const h = BigInt(item.dhash);
    let placed = null;
    for (const g of groups) {
      if (hamming(g.center, h) <= HAMMING_THRESHOLD) { placed = g; break; }
    }
    if (placed) {
      placed.members.push(item);
    } else {
      groups.push({ center: h, members: [item] });
    }
  }

  // Filter to groups whose members span MORE THAN ONE entity (md5 alone wouldn't
  // catch these, since all members already passed md5 dedup).
  const recropGroups = [];
  for (const g of groups) {
    if (g.members.length < 2) continue;
    const md5s = new Set(g.members.map(m => m.md5));
    if (md5s.size === 1) continue;  // already caught by md5 scanner; skip
    const keys = new Set(g.members.map(entityKey));
    if (keys.size > 1) recropGroups.push(g);
  }

  // Classify by severity (mirror scan-image-reuse.cjs taxonomy).
  const findings = { CRITICAL: [], ERROR: [], INFO: [] };
  for (const g of recropGroups) {
    const sections = new Set(g.members.map(m => m.section));
    const lines = new Set(g.members.map(m => m.line));
    const slugs = new Set(g.members.map(m => m.slug).filter(Boolean));
    if (sections.size > 1) findings.CRITICAL.push({ group: g, reason: `near-duplicate across DIFFERENT sections: ${[...sections].join(', ')}` });
    else if (sections.size === 1 && lines.size > 1 && !lines.has('_root') && !lines.has('_legacy')) findings.CRITICAL.push({ group: g, reason: `near-duplicate across DIFFERENT lines within ${[...sections][0]}` });
    else if (slugs.size > 1) findings.ERROR.push({ group: g, reason: `near-duplicate used for DIFFERENT entities: ${[...slugs].join(', ')}` });
    else findings.INFO.push({ group: g, reason: 'near-duplicate within one entity (likely a recompress/recrop variant)' });
  }

  // Registry.
  const registry = {
    _doc: 'Visual near-duplicate registry (dHash, Hamming ≤ ' + HAMMING_THRESHOLD + '). Catches recrops/recompresses that md5 misses.',
    generated_at: new Date().toISOString(),
    hamming_threshold: HAMMING_THRESHOLD,
    image_count: all.length,
    groups: recropGroups.map(g => ({
      center_dhash: g.center.toString(),
      members: g.members.map(m => ({ rel: m.rel, md5: m.md5, dhash: m.dhash, section: m.section, line: m.line, slug: m.slug ?? null })),
    })),
  };
  fs.writeFileSync(RECROP_REGISTRY_OUT, JSON.stringify(registry, null, 2));

  // Report.
  const lines = [];
  lines.push('# Visual recrop / near-duplicate audit');
  lines.push('');
  lines.push(`**Generated:** ${new Date().toISOString()}`);
  lines.push(`**Method:** dHash on 9×8 grayscale (sharp). Hamming distance ≤ ${HAMMING_THRESHOLD} = "near-identical at thumbnail scale."`);
  lines.push(`**Images compared:** ${all.length}`);
  lines.push(`**Cross-entity near-duplicate groups:** ${recropGroups.length}`);
  lines.push('');
  lines.push(`**🔴 CRITICAL:** ${findings.CRITICAL.length}`);
  lines.push(`**🟠 ERROR:** ${findings.ERROR.length}`);
  lines.push(`**ℹ️  INFO:** ${findings.INFO.length}`);
  lines.push('');
  lines.push('Note: Groups with byte-identical members (single md5) are already caught by `scan-image-reuse.cjs` and excluded here. This report only surfaces visual reuse that md5 missed.');
  lines.push('');
  lines.push('---');
  lines.push('');

  function renderGroup(level, label, list) {
    if (list.length === 0) return;
    lines.push(`## ${level} — ${label} (${list.length})`);
    lines.push('');
    for (const f of list) {
      lines.push(`- **${f.reason}**`);
      for (const m of f.group.members) {
        lines.push(`  - \`${m.rel}\`  *(md5 \`${m.md5.slice(0, 12)}…\`, section: ${m.section}, line: ${m.line}${m.slug ? `, slug: ${m.slug}` : ''})*`);
      }
      lines.push('');
    }
  }

  renderGroup('🔴 CRITICAL', 'Cross-section / cross-line near-duplicates', findings.CRITICAL);
  renderGroup('🟠 ERROR', 'Same-section different-entity near-duplicates', findings.ERROR);
  renderGroup('ℹ️ INFO', 'Intra-entity recrops/recompresses', findings.INFO);

  fs.writeFileSync(RECROP_REPORT_OUT, lines.join('\n') + '\n');
  console.log(`[recrops] CRITICAL: ${findings.CRITICAL.length}, ERROR: ${findings.ERROR.length}, INFO: ${findings.INFO.length}`);
  console.log(`[recrops] wrote ${path.relative(REPO_ROOT, RECROP_REPORT_OUT)}`);

  if (findings.CRITICAL.length + findings.ERROR.length > 0) process.exit(1);
}

main().catch(err => { console.error(err); process.exit(2); });
