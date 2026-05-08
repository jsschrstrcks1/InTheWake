#!/usr/bin/env node
/**
 * fix-port-link-extensions.cjs — Append .html to /ports/<slug> links
 * Soli Deo Gloria
 *
 * Rewrites href="/ports/<slug>" → href="/ports/<slug>.html" everywhere
 * the auditor's A5 detector fires (admin/port-page-audit.cjs:150). The
 * exemption list mirrors the auditor's nonPortPaths set: img/css/js/
 * assets/fonts/data are subdirectories under /ports/ that legitimately
 * have no .html extension.
 *
 * Pre-flight verified:
 *   - 49 occurrences across 15 port pages
 *   - 44 unique link targets, ALL with a matching ports/<slug>.html file
 *
 * Idempotent: matches only links missing .html; running twice is a no-op.
 *
 * Usage:
 *   node admin/fix-port-link-extensions.cjs              # dry run
 *   node admin/fix-port-link-extensions.cjs --apply      # write changes
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');

const REPO_ROOT = path.resolve(__dirname, '..');
const PORTS_DIR = path.join(REPO_ROOT, 'ports');

// Auditor's exempt subdir set (port-page-audit.cjs:151)
const NON_PORT = new Set(['img', 'css', 'js', 'assets', 'fonts', 'data']);

// href="/ports/<slug>" not ending with .html. The negative-lookahead
// for "/" ensures we don't match nested paths like /ports/img/foo.
const LINK_RE = /href="\/ports\/([a-z][\w-]*)"/g;

function rewrite(html) {
  let count = 0;
  const out = html.replace(LINK_RE, (full, slug) => {
    if (NON_PORT.has(slug)) return full;
    count++;
    return `href="/ports/${slug}.html"`;
  });
  return { html: out, count };
}

function main() {
  const apply = process.argv.includes('--apply');
  const files = fs.readdirSync(PORTS_DIR).filter(f => f.endsWith('.html'));

  let pagesChanged = 0;
  let totalLinks = 0;
  const perPage = [];
  for (const f of files) {
    const fp = path.join(PORTS_DIR, f);
    const html = fs.readFileSync(fp, 'utf8');
    const { html: out, count } = rewrite(html);
    if (count > 0) {
      pagesChanged++;
      totalLinks += count;
      perPage.push({ f, count });
      if (apply) fs.writeFileSync(fp, out);
    }
  }

  const mode = apply ? 'APPLIED' : 'DRY RUN';
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  /ports/<slug> → /ports/<slug>.html — ${mode}`);
  console.log('='.repeat(60));
  console.log(`  Pages changed: ${pagesChanged}`);
  console.log(`  Links rewritten: ${totalLinks}`);
  console.log();
  for (const { f, count } of perPage.sort((a, b) => b.count - a.count)) {
    console.log(`  ${count}x  ports/${f}`);
  }
  console.log('='.repeat(60));
}

if (require.main === module) main();
