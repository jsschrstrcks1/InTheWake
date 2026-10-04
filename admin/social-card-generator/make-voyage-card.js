#!/usr/bin/env node
// Build a photo-led 1200x630 share card for a voyage companion. Soli Deo Gloria.
//   node make-voyage-card.js <spec.json>
// spec: { photoPath, photoAlt, cropLeft, title, kicker, dates, ports, byline, url, outPath }
// Paths in the spec are relative to the repo root.
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderPhotoCard } from './lib/render.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const specPath = process.argv[2];
if (!specPath) { console.error('usage: node make-voyage-card.js <spec.json>'); process.exit(2); }
const spec = JSON.parse(readFileSync(resolve(specPath), 'utf8'));
const { bytes } = await renderPhotoCard({ ...spec, photoPath: resolve(root, spec.photoPath), outPath: resolve(root, spec.outPath) });
console.log(`wrote ${spec.outPath} (${Math.round(bytes / 1024)} KB)`);
