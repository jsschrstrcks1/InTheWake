#!/usr/bin/env node
// admin/scripts/check-voyage-registry.mjs — Soli Deo Gloria.
// Voyage-pack registry ↔ disk cross-check. Three states, never two:
//   CLEAN (exit 0) · REPORT (exit 3, drift found) · UNAVAILABLE (exit 2, could not look).
// A check that could not look must never read as clean.
import { readFile, readdir, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const PACK_DIR = 'admin/voyage-packs';
export const PWA_DIR = 'admin/voyage-pwa';
const IGNORE_FILES = new Set([`${PACK_DIR}/emergency-handoff-card-agnostic.pdf`]);
const SLUG_RE = /^v0\.[0-9.]+-[a-z0-9-]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
// A real calendar date, not just the shape of one: 2027-13-01 has the shape and is not a date.
const isDate = (v) => DATE_RE.test(v) && !Number.isNaN(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v;

function shapeDrift(p, i) {
  const drift = [];
  const where = p && p.slug ? p.slug : `#${i}`;
  if (!p || typeof p !== 'object') return [{ kind: 'bad-record', slug: where }];
  if (!SLUG_RE.test(p.slug || '')) drift.push({ kind: 'bad-slug', slug: where });
  for (const k of ['sail_start', 'sail_end']) {
    if (p[k] != null && !isDate(p[k])) drift.push({ kind: 'bad-date', slug: where, field: k });
  }
  if (p.sail_start && p.sail_end && p.sail_end < p.sail_start) drift.push({ kind: 'end-before-start', slug: where });
  if (!p.instrumented || typeof p.instrumented !== 'object') drift.push({ kind: 'missing-instrumented', slug: where });
  if (!p.pdf || typeof p.pdf !== 'object') drift.push({ kind: 'missing-pdf-block', slug: where });
  return drift;
}

export async function checkRegistry({ root, registry } = {}) {
  let packs = registry;
  if (!packs) {
    try {
      packs = JSON.parse(await readFile(path.join(root, PACK_DIR, 'packs.json'), 'utf8'));
    } catch (e) {
      return { state: 'UNAVAILABLE', reason: `registry unreadable: ${e.message}`, drift: [] };
    }
  }
  if (!Array.isArray(packs)) return { state: 'UNAVAILABLE', reason: 'registry is not an array', drift: [] };

  const drift = [];
  const referenced = new Set();
  const slugs = new Map();
  packs.forEach((p, i) => {
    drift.push(...shapeDrift(p, i));
    if (p && p.slug) slugs.set(p.slug, (slugs.get(p.slug) || 0) + 1);
  });
  for (const [slug, n] of slugs) if (n > 1) drift.push({ kind: 'duplicate-slug', slug });

  for (const p of packs) {
    if (!p || typeof p !== 'object') continue;
    const refs = [p.pdf && p.pdf.full, p.pdf && p.pdf.condensed, p.pdf && p.pdf.handoff, p.html, p.pwa].filter(Boolean);
    for (const f of refs) {
      referenced.add(f);
      try { await access(path.join(root, f)); }
      catch { drift.push({ kind: 'missing-file', slug: p.slug, file: f }); }
    }
    if (p.slug) {
      const src = `${PACK_DIR}/${p.slug}.md`;
      try { await access(path.join(root, src)); }
      catch { drift.push({ kind: 'missing-source', slug: p.slug, file: src }); }
    }
  }

  let onDisk;
  try {
    const packFiles = (await readdir(path.join(root, PACK_DIR)))
      .filter((f) => f.endsWith('.pdf') || (f.endsWith('.html') && f.startsWith('v0.')));
    const pwas = (await readdir(path.join(root, PWA_DIR))).filter((f) => f.endsWith('.html'));
    onDisk = [...packFiles.map((f) => `${PACK_DIR}/${f}`), ...pwas.map((f) => `${PWA_DIR}/${f}`)];
  } catch (e) {
    return { state: 'UNAVAILABLE', reason: `could not list pack dirs: ${e.message}`, drift };
  }
  for (const f of onDisk) {
    if (!referenced.has(f) && !IGNORE_FILES.has(f)) drift.push({ kind: 'unregistered-file', file: f });
  }
  return { state: drift.length ? 'REPORT' : 'CLEAN', drift, packs: packs.length };
}

const invokedDirectly = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  const r = await checkRegistry({ root: process.cwd() });
  console.log(`[voyage-registry] ${r.state}${r.reason ? ` — ${r.reason}` : ''}${r.packs != null ? ` (${r.packs} packs)` : ''}`);
  for (const d of r.drift) console.log(`  ${d.kind}: ${[d.slug, d.field, d.file].filter(Boolean).join(' ')}`);
  process.exit(r.state === 'CLEAN' ? 0 : r.state === 'REPORT' ? 3 : 2);
}
