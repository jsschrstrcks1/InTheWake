// The PWA precache manifest: it reaches installed apps, it lists only files that exist, and the cruise tipping
// calculator opens offline. Soli Deo Gloria.
//
// WHY. sw.js reads /precache-manifest.json only when a new service worker activates, and a browser installs a new
// service worker only when sw.js itself changes. So an edit to the manifest alone never reaches anyone who already
// installed the app. Measured on main 631e2a8c (2026-11-07): three pages were added to the manifest in May 2026 with no
// sw.js change, the manifest said version 14.3.3 while sw.js said 14.3.0, and /sitemap.json was listed but did not
// exist. Issues #1728 and #1682.
//
// THE RULE THESE TESTS HOLD. The manifest's "version" equals sw.js VERSION. To change what is precached, change both,
// which is what makes installed apps pick the change up.
//
// URLS MUST MATCH EXACTLY. sw.js normalizeRequest keeps the query string, so "/x.css" in the precache never answers a
// page's request for "/x.css?v=3.010.300". The tipping calculator's entries are read from its own page and modules,
// query included, so they cannot drift from what the page asks for.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const read = (rel) => readFileSync(path.join(ROOT, rel), 'utf8');
const MANIFEST = JSON.parse(read('precache-manifest.json'));
const SW = read('sw.js');
const LISTS = ['pages', 'assets', 'images', 'data'];
const urlOf = (e) => (typeof e === 'string' ? e : e && e.url);
const listed = new Set(LISTS.flatMap((k) => (MANIFEST[k] || []).map(urlOf)));

/** A site URL to the file that serves it: the query is dropped, "/" and a trailing "/" mean index.html. */
function fileFor(url) {
  const p = url.split(/[?#]/)[0];
  const rel = p === '/' ? 'index.html' : p.endsWith('/') ? `${p.slice(1)}index.html` : p.slice(1);
  return path.join(ROOT, rel);
}

const exists = (url) => {
  const f = fileFor(url);
  return existsSync(f) && statSync(f).isFile();
};

test('the manifest names the same version as sw.js, so a manifest change reaches installed apps', () => {
  const version = /^const VERSION = '([^']+)';$/m.exec(SW)?.[1];
  assert.ok(version, 'sw.js declares VERSION');
  assert.equal(MANIFEST.version, version, 'precache-manifest.json "version" must equal sw.js VERSION; bump both together');
  assert.match(SW.split('\n')[0], new RegExp(`Service Worker v${version.replace(/\./g, '\\.')} `), 'the sw.js header names the same version');
});

test('every file the manifest lists exists', () => {
  const missing = [];
  for (const k of [...LISTS, 'sitemaps']) {
    for (const e of MANIFEST[k] || []) {
      const u = urlOf(e);
      assert.ok(typeof u === 'string' && u.startsWith('/') && !u.startsWith('//'), `${k}: a same-site path, got ${JSON.stringify(e)}`);
      if (!exists(u)) missing.push(`${k}: ${u}`);
    }
  }
  assert.deepEqual(missing, [], 'listed but absent');
});

/** What the tipping calculator asks for: same-site scripts and stylesheets on its page, every module its entry imports,
 *  and every data file those modules fetch. Read from the code, never from a hand-kept list. */
function tippingCalculatorFiles() {
  const page = '/tools/cruise-tipping-calculator.html';
  const html = read(page.slice(1));
  const urls = new Set([page]);
  const sameSite = (u) => u.startsWith('/') && !u.startsWith('//');
  for (const m of html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)) if (sameSite(m[1])) urls.add(m[1]);
  for (const m of html.matchAll(/<link\b[^>]*\brel="stylesheet"[^>]*\bhref="([^"]+)"/g)) if (sameSite(m[1])) urls.add(m[1]);

  const entry = [...urls].find((u) => u.endsWith('/cruise-tipping-calculator/main.js'));
  assert.ok(entry, 'the page loads the calculator module');
  const dir = entry.slice(0, entry.lastIndexOf('/') + 1);
  const seen = new Set();
  const walk = (url) => {
    if (seen.has(url)) return;
    seen.add(url);
    urls.add(url);
    const src = read(url.slice(1));
    for (const m of src.matchAll(/\bfrom\s+"\.\/([\w.-]+\.js)"/g)) walk(dir + m[1]);
    for (const m of src.matchAll(/"(\/assets\/data\/[\w./-]+\.json)"/g)) urls.add(m[1]);
    if (/`\/assets\/data\/tipping\/\$\{slug\}\.json`/.test(src)) {
      // data.js fetches /assets/data/tipping/<id>.json for every line in brands.json; only the files that exist load.
      const ids = JSON.parse(read('assets/data/brands.json')).brands.map((b) => b.id);
      for (const id of ids) if (existsSync(path.join(ROOT, 'assets/data/tipping', `${id}.json`))) urls.add(`/assets/data/tipping/${id}.json`);
    }
  };
  walk(entry);
  return [...urls].sort();
}

test('the tipping calculator opens offline: its page, scripts, styles, modules and data are precached as requested', () => {
  const files = tippingCalculatorFiles();
  assert.ok(files.length >= 10, `found the calculator's files (${files.length})`);
  assert.ok(files.includes('/assets/data/lexicon/tipping-checked.json'), 'the last-checked record is one of them');
  assert.ok(files.some((u) => u.startsWith('/assets/data/tipping/')), 'the per-line tipping files are among them');
  for (const u of files) assert.ok(exists(u), `${u} exists`);
  assert.deepEqual(files.filter((u) => !listed.has(u)), [], 'requested by the tipping calculator but not precached');
});

/** The same-site scripts and stylesheets a page names in its own HTML, exactly as written (query included). */
function pageTags(page) {
  const html = read(page.slice(1));
  const sameSite = (u) => u.startsWith('/') && !u.startsWith('//');
  const urls = new Set([page]);
  for (const m of html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)) if (sameSite(m[1])) urls.add(m[1]);
  for (const m of html.matchAll(/<link\b[^>]*\brel="stylesheet"[^>]*\bhref="([^"]+)"/g)) if (sameSite(m[1])) urls.add(m[1]);
  return [...urls].sort();
}

test('the drink calculator opens offline: its page and every script and stylesheet it names are precached as written', () => {
  // What the page loads at run time (its config and brands with ?v=, the worker, the chart library, the data) cannot be
  // read from the HTML; tests/playwright/pwa-offline.spec.js proves those end to end, offline, in CI.
  const files = pageTags('/drink-calculator.html');
  assert.ok(files.length >= 8, `found the page's own tags (${files.length})`);
  for (const u of files) assert.ok(exists(u), `${u} exists`);
  assert.deepEqual(files.filter((u) => !listed.has(u)), [], 'named by drink-calculator.html but not precached as written');
});

test('the manifest lists each url once', () => {
  const all = LISTS.flatMap((k) => (MANIFEST[k] || []).map(urlOf));
  assert.deepEqual(all.filter((u, i) => all.indexOf(u) !== i), []);
});
