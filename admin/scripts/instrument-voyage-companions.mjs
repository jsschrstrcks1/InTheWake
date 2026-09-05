#!/usr/bin/env node
// admin/scripts/instrument-voyage-companions.mjs — Soli Deo Gloria.
// Idempotent, reviewable patch for every PWA companion in the registry (plan Task 5, Setting 1.5):
//   1. CSP connect-src gains the relay origin (the phone posts its counts there, never to Umami directly)
//   2. window.__VOYAGE gains slug:"<registry slug>" (the value every event carries as `pack`)
//   3. window.ITW_USAGE_ENDPOINT + /assets/js/voyage-usage.js load before companion.js
// The footer wording is NOT touched: "No tracking, no ads" stays byte for byte (see the test that pins it).
// Run: node admin/scripts/instrument-voyage-companions.mjs [--check]   (exit 3 if any file needs patching)
import { readFile, writeFile } from 'node:fs/promises';

export const RELAY_ORIGIN = 'https://usage.cruisinginthewake.com';
export const RELAY_ENDPOINT = RELAY_ORIGIN + '/send';
const CSP_OLD = 'connect-src https://api.open-meteo.com https://api.rainviewer.com https://api.weather.gov';
const CSP_NEW = CSP_OLD + ' ' + RELAY_ORIGIN;
const COMPANION_TAG = '<script src="/admin/voyage-pwa/companion.js" defer></script>';
const USAGE_TAGS = '<script>window.ITW_USAGE_ENDPOINT="' + RELAY_ENDPOINT + '";</script>\n<script src="/assets/js/voyage-usage.js" defer></script>\n';

export function patchCompanion(html, slug) {
  let out = html;
  const notes = [];
  if (!out.includes(RELAY_ORIGIN)) {
    if (!out.includes(CSP_OLD)) throw new Error('CSP connect-src not in the expected shape');
    out = out.replace(CSP_OLD, CSP_NEW); notes.push('csp');
  }
  if (!/window\.__VOYAGE=\{slug:"/.test(out)) {
    if (!out.includes('window.__VOYAGE={')) throw new Error('window.__VOYAGE literal not found');
    out = out.replace('window.__VOYAGE={', 'window.__VOYAGE={slug:"' + slug + '",'); notes.push('slug');
  } else if (!out.includes('window.__VOYAGE={slug:"' + slug + '"')) {
    throw new Error('page already carries a different slug');
  }
  if (!out.includes('/assets/js/voyage-usage.js')) {
    if (!out.includes(COMPANION_TAG)) throw new Error('companion.js script tag not found');
    out = out.replace(COMPANION_TAG, USAGE_TAGS + COMPANION_TAG); notes.push('module');
  }
  return { html: out, changed: notes };
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop())) {
  const check = process.argv.includes('--check');
  const packs = JSON.parse(await readFile('admin/voyage-packs/packs.json', 'utf8'));
  let needs = 0;
  for (const p of packs) {
    if (!p.pwa) continue;
    const before = await readFile(p.pwa, 'utf8');
    const { html, changed } = patchCompanion(before, p.slug);
    if (changed.length) {
      needs++;
      if (check) console.log(`NEEDS ${p.pwa}: ${changed.join(',')}`);
      else { await writeFile(p.pwa, html); console.log(`patched ${p.pwa}: ${changed.join(',')}`); }
    }
  }
  console.log(check ? `[companions] ${needs} file(s) need patching` : `[companions] ${needs} file(s) patched`);
  process.exit(check && needs ? 3 : 0);
}
