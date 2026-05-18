import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { createHash } from 'node:crypto';

export function loadManifest(path) {
  if (!existsSync(path)) return {};
  const raw = readFileSync(path, 'utf8');
  try { return JSON.parse(raw); } catch (e) {
    throw new Error(`Manifest at ${path} is not valid JSON: ${e.message}`);
  }
}

export function saveManifest(path, data) {
  mkdirSync(dirname(path), { recursive: true });
  const sorted = Object.keys(data).sort().reduce((acc, k) => (acc[k] = data[k], acc), {});
  writeFileSync(path, JSON.stringify(sorted, null, 2) + '\n', 'utf8');
}

export function computeContentHash(title, description) {
  return createHash('sha1').update(`${title}\n${description}`, 'utf8').digest('hex').slice(0, 8);
}

// Decides what to do with one (article, card-path) pair.
// Returns { action: 'generate' | 'regenerate' | 'skip-fresh' | 'skip-human-photo' }
export function decideAction({ cardPath, slug, currentHash, manifest }) {
  const fileExists = existsSync(cardPath);
  const inManifest = !!manifest[slug];

  if (!fileExists)                                   return { action: 'generate' };
  if (fileExists && !inManifest)                     return { action: 'skip-human-photo' };
  if (manifest[slug].contentHash === currentHash)    return { action: 'skip-fresh' };
  return { action: 'regenerate' };
}
