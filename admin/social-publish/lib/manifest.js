import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

export function loadManifest(path) {
  if (!existsSync(path)) return {};
  return JSON.parse(readFileSync(path, 'utf8'));
}

export function saveManifest(path, data) {
  mkdirSync(dirname(path), { recursive: true });
  const sorted = Object.keys(data).sort().reduce((acc, k) => (acc[k] = data[k], acc), {});
  writeFileSync(path, JSON.stringify(sorted, null, 2) + '\n', 'utf8');
}

export function alreadyPosted(manifest, articlePath, platform) {
  return !!(manifest[articlePath] && manifest[articlePath].platforms && manifest[articlePath].platforms[platform]);
}

export function recordPost(manifest, articlePath, canonicalUrl, platform, platformResult) {
  manifest[articlePath] = manifest[articlePath] || { url: canonicalUrl, platforms: {} };
  manifest[articlePath].url = canonicalUrl;  // refresh in case canonical changed
  manifest[articlePath].platforms[platform] = {
    posted_at: new Date().toISOString(),
    ...platformResult,
  };
}
