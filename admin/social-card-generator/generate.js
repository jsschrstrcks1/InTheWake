#!/usr/bin/env node
// Social card generator entry point.
//
// Usage:
//   node generate.js                              # process all articles, decide per file
//   node generate.js --article articles/foo.html  # process one article
//   node generate.js --article foo.html --out /tmp/preview.jpg  # write to arbitrary path (local preview)
//   node generate.js --force-all                  # regenerate every article-owned card
//
// Exit codes:
//   0 — success (zero or more cards rendered)
//   1 — fatal error
//   2 — bad CLI args

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, join, basename } from 'node:path';
import { extractArticleMeta } from './lib/extract.js';
import { renderCard } from './lib/render.js';
import { loadManifest, saveManifest, computeContentHash, decideAction } from './lib/manifest.js';
import { buildByline } from './lib/format.js';

const REPO_ROOT     = resolve(import.meta.dirname, '../..');
const ARTICLES_DIR  = join(REPO_ROOT, 'articles');
const CARDS_DIR     = join(REPO_ROOT, 'assets/social/articles');
const MANIFEST_PATH = join(CARDS_DIR, '.generated-manifest.json');
const URL_DISPLAY   = 'cruisinginthewake.com';

function parseArgs(argv) {
  const opts = { article: null, out: null, forceAll: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--article')     opts.article  = argv[++i];
    else if (a === '--out')    opts.out      = argv[++i];
    else if (a === '--force-all') opts.forceAll = true;
    else if (a === '--help' || a === '-h') {
      console.log('See header comment in generate.js for usage.');
      process.exit(0);
    } else {
      console.error(`Unknown argument: ${a}`);
      process.exit(2);
    }
  }
  return opts;
}

function listArticles() {
  return readdirSync(ARTICLES_DIR)
    .filter(f => f.endsWith('.html'))
    .map(f => join(ARTICLES_DIR, f));
}

async function processOne({ articlePath, manifest, forceAll, outPathOverride }) {
  const html = readFileSync(articlePath, 'utf8');
  const meta = extractArticleMeta(html);
  const cardPath = outPathOverride || join(CARDS_DIR, `${meta.slug}.jpg`);
  const currentHash = computeContentHash(meta.title, meta.description);

  const decision = outPathOverride
    ? { action: 'generate' }  // explicit out path always renders
    : (forceAll ? { action: 'regenerate' } : decideAction({ cardPath, slug: meta.slug, currentHash, manifest }));

  if (decision.action === 'skip-human-photo') {
    console.log(`  ${meta.slug}: skip (human-authored photo)`);
    return { slug: meta.slug, action: decision.action };
  }
  if (decision.action === 'skip-fresh') {
    console.log(`  ${meta.slug}: skip (fresh — hash ${currentHash} matches manifest)`);
    return { slug: meta.slug, action: decision.action };
  }

  const byline = buildByline(meta.authorName, meta.publishedDate);
  const { bytes } = await renderCard({
    title: meta.title,
    subtitle: meta.description,
    byline,
    url: URL_DISPLAY,
    outPath: cardPath,
  });
  console.log(`  ${meta.slug}: ${decision.action} -> ${cardPath} (${bytes} bytes, hash ${currentHash})`);
  return { slug: meta.slug, action: decision.action, cardPath, contentHash: currentHash };
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const manifest = loadManifest(MANIFEST_PATH);

  const articles = opts.article
    ? [resolve(opts.article)]
    : listArticles();

  console.log(`Processing ${articles.length} article(s)...`);
  const results = [];
  for (const a of articles) {
    try {
      const r = await processOne({
        articlePath: a, manifest, forceAll: opts.forceAll,
        outPathOverride: opts.out || null,
      });
      results.push(r);
    } catch (e) {
      console.error(`  ERROR processing ${basename(a)}: ${e.message}`);
      process.exitCode = 1;
    }
  }

  // Update manifest entries for any (re)generated cards, unless --out was used
  if (!opts.out) {
    const now = new Date().toISOString();
    for (const r of results) {
      if (r.action === 'generate' || r.action === 'regenerate') {
        manifest[r.slug] = { contentHash: r.contentHash, generatedAt: now };
      }
    }
    saveManifest(MANIFEST_PATH, manifest);
    console.log(`Manifest saved: ${MANIFEST_PATH}`);
  }

  const counts = results.reduce((acc, r) => (acc[r.action] = (acc[r.action] || 0) + 1, acc), {});
  console.log(`Summary: ${JSON.stringify(counts)}`);
}

main().catch(e => {
  console.error(`Fatal: ${e.stack || e.message}`);
  process.exit(1);
});
