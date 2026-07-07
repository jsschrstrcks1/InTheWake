#!/usr/bin/env node
// Auto-publisher entry point.
//
// Usage (typical CI):
//   node publish.js                                 # diff vs HEAD~1, publish new articles
//   node publish.js --article articles/foo.html    # force a specific article
//   node publish.js --dry-run                      # compose, never call FB; print intended posts
//
// Env vars (required unless --dry-run):
//   FACEBOOK_PAGE_ID           - numeric Page ID
//   FACEBOOK_PAGE_ACCESS_TOKEN - long-lived Page access token
//
// Exit codes:
//   0 — all targeted (article, platform) pairs either posted or skipped-already
//   1 — at least one platform call failed
//   2 — bad arguments or missing env

import { execSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { extractArticleMeta } from './lib/extract.js';
import { newArticlesFromDiff, articleOptOut } from './lib/detect.js';
import { gatePublishDecision } from './lib/gate.js';
import { loadManifest, saveManifest, alreadyPosted, recordPost } from './lib/manifest.js';
import { composeFacebookPost } from './templates/facebook.js';
import { postToPage, scrapeBust } from './lib/facebook.js';

const REPO_ROOT     = resolve(import.meta.dirname, '../..');
const MANIFEST_PATH = join(REPO_ROOT, 'admin/social-publish-manifest.json');

function parseArgs(argv) {
  const o = { article: null, dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--article') o.article = argv[++i];
    else if (argv[i] === '--dry-run') o.dryRun = true;
    else if (argv[i] === '--help' || argv[i] === '-h') {
      console.log('See header comment in publish.js for usage.');
      process.exit(0);
    } else {
      console.error(`Unknown argument: ${argv[i]}`);
      process.exit(2);
    }
  }
  return o;
}

function listNewArticles() {
  try {
    const diff = execSync('git diff --name-status HEAD~1 HEAD', { cwd: REPO_ROOT, encoding: 'utf8' });
    return newArticlesFromDiff(diff);
  } catch (e) {
    console.error(`Could not diff HEAD~1..HEAD: ${e.message}`);
    return [];
  }
}

async function publishOne({ articlePath, manifest, dryRun, env }) {
  const fullPath = join(REPO_ROOT, articlePath);
  if (!existsSync(fullPath)) {
    console.error(`  ${articlePath}: file not found`);
    return { articlePath, status: 'error', reason: 'not-found' };
  }

  const html = readFileSync(fullPath, 'utf8');

  if (articleOptOut(html)) {
    console.log(`  ${articlePath}: opt-out (meta name='social-publish' content='skip')`);
    return { articlePath, status: 'opt-out' };
  }

  if (alreadyPosted(manifest, articlePath, 'facebook')) {
    console.log(`  ${articlePath}: already posted to facebook (${manifest[articlePath].platforms.facebook.post_id})`);
    return { articlePath, status: 'already-posted' };
  }

  // Governance gate (Sophos concept-lift): pastoral content never auto-posts;
  // no publish without sources; no publish without authorship disclosure.
  const gate = gatePublishDecision(html, articlePath);
  if (!gate.publish) {
    console.error(`  ${articlePath}: GATE BLOCKED (${gate.blockedBy})`);
    for (const f of gate.findings) console.error(`    [${f.severity}] ${f.policy}: ${f.detail}`);
    return { articlePath, status: 'gate-blocked', blockedBy: gate.blockedBy };
  }

  const meta = extractArticleMeta(html);
  const { message, link } = composeFacebookPost({
    title: meta.title,
    description: meta.description,
    aiSummary: meta.aiSummary,
    canonicalUrl: meta.canonicalUrl,
  });

  if (dryRun) {
    console.log(`  ${articlePath}: DRY-RUN — would post:`);
    console.log('  ----------');
    console.log('  ' + message.split('\n').join('\n  '));
    console.log(`  link: ${link}`);
    console.log('  ----------');
    return { articlePath, status: 'dry-run' };
  }

  const result = await postToPage({
    pageId: env.FACEBOOK_PAGE_ID,
    accessToken: env.FACEBOOK_PAGE_ACCESS_TOKEN,
    message, link,
  });
  recordPost(manifest, articlePath, meta.canonicalUrl, 'facebook', result);
  console.log(`  ${articlePath}: posted ${result.post_id}  ${result.permalink}`);

  // Best-effort OG re-scrape
  await scrapeBust({ url: meta.canonicalUrl, accessToken: env.FACEBOOK_PAGE_ACCESS_TOKEN });

  return { articlePath, status: 'posted', ...result };
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const env = process.env;
  if (!opts.dryRun && (!env.FACEBOOK_PAGE_ID || !env.FACEBOOK_PAGE_ACCESS_TOKEN)) {
    console.error('Missing FACEBOOK_PAGE_ID or FACEBOOK_PAGE_ACCESS_TOKEN env var.');
    process.exit(2);
  }

  const manifest = loadManifest(MANIFEST_PATH);

  const targets = opts.article ? [opts.article] : listNewArticles();
  if (!targets.length) {
    console.log('No new articles detected. Nothing to do.');
    return;
  }

  console.log(`Processing ${targets.length} article(s):`);
  let failed = 0;
  for (const a of targets) {
    try {
      await publishOne({ articlePath: a, manifest, dryRun: opts.dryRun, env });
    } catch (e) {
      console.error(`  ${a}: ${e.message}`);
      failed++;
    }
  }

  if (!opts.dryRun) {
    saveManifest(MANIFEST_PATH, manifest);
    console.log(`Manifest saved: ${MANIFEST_PATH}`);
  }

  if (failed > 0) process.exit(1);
}

main().catch(e => {
  console.error(`Fatal: ${e.stack || e.message}`);
  process.exit(1);
});
