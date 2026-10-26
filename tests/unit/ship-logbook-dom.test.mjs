// Ship-page logbook loaders parse, and render story text through DOM calls, never HTML strings.
// Pre-ship checklist class K. Soli Deo Gloria.
//
// Found 2026-10-26: 25 Carnival pages carried an inline initShipLogbook() that concatenated story
// fields into innerHTML. On 13 of them the line held split(\'\\n\\n\'), backslash-escaped quotes
// outside any string, so Chromium threw "Invalid or unexpected token" and the whole block was dead
// (CI job 121380284109). The 23 pages with #logbook-container now carry one loader built with
// createElement / textContent; the two pages without that container lost the dead block. This test
// fails if either defect comes back.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ROOT = new URL('../../', import.meta.url).pathname;

function htmlFiles(dir) {
  const out = [];
  for (const e of readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...htmlFiles(p));
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

// Inline classic scripts only: no src, and no type other than JavaScript (ld+json, module, etc.).
export function inlineScripts(html) {
  const out = [];
  for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (/\bsrc\s*=/i.test(m[1])) continue;
    const type = (m[1].match(/\btype\s*=\s*["']?([^"'\s>]+)/i) || [])[1];
    if (type && !/^(text|application)\/javascript$/i.test(type)) continue;
    out.push(m[2]);
  }
  return out;
}

// Compile only. vm.Script parses the source and never runs it, so this is a syntax check.
export function syntaxError(src) {
  try { new vm.Script(src); return null; } catch (e) { return e.message; }
}

// Logbook story data must never be concatenated into a string bound for innerHTML.
export const UNSAFE = [
  ['the concatenated logbook shape', /s\.persona_label\+' ·/],
  ['a backslash-escaped quote outside a string', /\.split\(\\'/],
  ['logbook story data inside an innerHTML string', /innerHTML[^;]{0,300}?\bs\.(title|persona_label|markdown|author)\b/],
];

export function findUnsafe(text) {
  return UNSAFE.filter(([, re]) => re.test(text)).map(([name]) => name);
}

// Debt, not exemption: Carnival pages whose other logbook loaders (#logbook-entries,
// #logbook-stories, or a second #logbook-container loader) still build innerHTML from story fields,
// recorded 2026-10-26. The list only shrinks: when a page is rebuilt with DOM calls, the debt test
// fails until its line is deleted here. Named limit: the pattern reads the `s.` story variable only;
// loaders that name it differently, and the initShipLogbook family that writes data.entries into
// #logbook-entries on about 230 pages, are not covered here.
const INNERHTML_DEBT = new Set([
  'carnival-adventure', 'carnival-breeze', 'carnival-conquest', 'carnival-dream', 'carnival-freedom',
  'carnival-glory', 'carnival-horizon', 'carnival-inspiration', 'carnival-magic', 'carnival-sensation',
  'carnival-tropicale', 'carnival-vista', 'carnivale-1956', 'celebration-1987', 'festivale-1961',
  'holiday-1985', 'jubilee-1986', 'mardi-gras-1972', 'tropicale-1981', 'unnamed-project-ace-1',
  'unnamed-project-ace-2', 'unnamed-project-ace-3',
].map((s) => `ships/carnival/${s}.html`));

test('the patterns catch every form found on 2026-10-26, and pass the DOM-built fix', () => {
  const found = [
    "if(d.stories) c.innerHTML=d.stories.slice(0,3).map(s=>'<article class=\"logbook-entry\"><h4>'+s.title+'</h4><p class=\"logbook-meta\">'+s.persona_label+' · '+s.author.name+'</p><p>'+s.markdown.split(\\'\\\\n\\\\n\\')[0]+'</p></article>').join('');",
    "if(c&&d.stories)c.innerHTML=d.stories.slice(0,3).map(s=>`<article class=\"logbook-entry\"><h4>${s.title}</h4></article>`).join('');",
    "container.innerHTML = stories.map(s => `\n  <article class=\"logbook-entry\">\n    <h4>${s.title}</h4>\n  </article>`).join('');",
  ];
  for (const s of found) assert.ok(findUnsafe(s).length > 0, s);
  // The escaped-quote form does not parse; that is what made the whole block dead.
  assert.ok(syntaxError("x.split(\\'a\\')"), 'the escaped-quote form must fail to compile');
  const fixed = "c.textContent='';d.stories.slice(0,3).forEach(s=>{const h=document.createElement('h3');h.textContent=String(s.title||'');const p=document.createElement('p');p.textContent=String(s.markdown||'').split('\\n\\n')[0];c.appendChild(h);c.appendChild(p);});";
  assert.deepEqual(findUnsafe(fixed), []);
  assert.equal(syntaxError(fixed), null);
});

test('every inline script on a ship page that mentions the logbook compiles', () => {
  const bad = [];
  for (const f of htmlFiles('ships')) {
    for (const src of inlineScripts(readFileSync(path.join(ROOT, f), 'utf8'))) {
      if (!/logbook/i.test(src)) continue;
      const err = syntaxError(src);
      if (err) bad.push(`${f}: ${err}`);
    }
  }
  assert.deepEqual(bad, []);
});

test('no ship page builds HTML strings from logbook data, outside the recorded debt', () => {
  const bad = [];
  for (const f of htmlFiles('ships')) {
    const hits = findUnsafe(readFileSync(path.join(ROOT, f), 'utf8'));
    const allowed = INNERHTML_DEBT.has(f) ? hits.filter((h) => h !== 'logbook story data inside an innerHTML string') : hits;
    if (allowed.length) bad.push(`${f}: ${allowed.join(', ')}`);
  }
  assert.deepEqual(bad, []);
});

test('the debt list only shrinks: every listed page still carries the pattern', () => {
  const stale = [...INNERHTML_DEBT].filter((f) => !findUnsafe(readFileSync(path.join(ROOT, f), 'utf8')).length);
  assert.deepEqual(stale, [], 'these pages are fixed; delete them from INNERHTML_DEBT');
});

// The 25 pages fixed on 2026-10-26: 23 keep one DOM-built loader, two had no container and lost it.
const REBUILT = [
  'carnival-ecstasy', 'carnival-elation', 'carnival-encounter', 'carnival-fantasy', 'carnival-fascination',
  'carnival-festivale', 'carnival-firenze', 'carnival-imagination', 'carnival-legend', 'carnival-liberty',
  'carnival-luminosa', 'carnival-miracle', 'carnival-panorama', 'carnival-paradise', 'carnival-pride',
  'carnival-radiance', 'carnival-spirit', 'carnival-splendor', 'carnival-sunrise', 'carnival-sunshine',
  'carnival-valor', 'carnival-venezia', 'mardi-gras',
].map((s) => `ships/carnival/${s}.html`);
const REMOVED = ['carnival-magic', 'carnival-vista'].map((s) => `ships/carnival/${s}.html`);

test('the rebuilt pages load #logbook-container once, through DOM calls only', () => {
  const bad = [];
  for (const f of REBUILT) {
    const t = readFileSync(path.join(ROOT, f), 'utf8');
    if (!t.includes('id="logbook-container"')) { bad.push(`${f}: #logbook-container is gone`); continue; }
    const loaders = t.split("getElementById('logbook-container')").length - 1;
    if (loaders !== 1) bad.push(`${f}: ${loaders} loaders write #logbook-container, expected 1`);
    const m = t.match(/function initShipLogbook\(\)\{[\s\S]*?<\/script>/);
    if (!m) { bad.push(`${f}: initShipLogbook is gone`); continue; }
    if (!/createElement\('article'\)/.test(m[0]) || !/\.textContent=/.test(m[0]) || /innerHTML/.test(m[0])) bad.push(`${f}: initShipLogbook not DOM-built`);
  }
  for (const f of REMOVED) {
    if (/function initShipLogbook\(\)/.test(readFileSync(path.join(ROOT, f), 'utf8'))) bad.push(`${f}: the dead initShipLogbook block is back`);
  }
  assert.deepEqual(bad, []);
});
