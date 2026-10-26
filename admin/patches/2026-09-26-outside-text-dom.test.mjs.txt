// Outside text reaches the page through DOM calls, never through HTML strings.
// Pre-ship checklist class K. Soli Deo Gloria.
//
// Found 2026-09-26: ship-page video carousels pasted YouTube's own titles into HTML strings for
// innerHTML, escaping < and > but not ", so a quote in a title could break out of the attribute.
// Five variants on about 250 pages, plus a never-called initVideos() block on 162. All rebuilt with
// createElement / textContent / property assignment. This test fails if one comes back.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

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

// Video data (titles, ids) must never be concatenated into a string bound for innerHTML.
export const UNSAFE = [
  ['video data inside an innerHTML string', /innerHTML[^;\n]{0,200}\bv\.(title|videoId)\b/],
  ['a title concatenated into an attribute', /title="'\+\s*(v\.title|title)\s*\+'"/],
  ['the dead initVideos() block', /function initVideos\(\)\{const w=document\.getElementById\('video-wrapper'\)/],
];

export function findUnsafe(text) {
  return UNSAFE.filter(([, re]) => re.test(text)).map(([name]) => name);
}

test('the patterns catch every form found on 2026-09-26, and pass the DOM-built fix', () => {
  const found = [
    "mount.innerHTML=arr.slice(0,12).map(v=>{ const title=String(v.title||'X'); return '<iframe title=\"'+title+'\">'; }).join('');",
    "w.innerHTML=vids.slice(0,8).map(function(v){return '<lite-youtube videoid=\"'+v.videoId+'\" title=\"'+v.title+'\"></lite-youtube>';}).join('');",
    "sw.innerHTML=all.slice(0,8).map(v=>'<a aria-label=\"'+v.title+'\"></a>').join('');",
    "mount.innerHTML=d.videos.map(v=>`<img alt=\"${v.title}\">`).join('');",
    "function initVideos(){const w=document.getElementById('video-wrapper');if(!w)return;}",
  ];
  for (const s of found) assert.ok(findUnsafe(s).length > 0, s);
  const fixed = "mount.textContent='';arr.slice(0,24).forEach(v=>{const f=document.createElement('iframe');f.src=url;f.title=String(v.title||'X');mount.appendChild(f);});";
  assert.deepEqual(findUnsafe(fixed), []);
});

test('no ship page builds HTML strings from video data', () => {
  const bad = [];
  for (const f of htmlFiles('ships')) {
    const hits = findUnsafe(readFileSync(path.join(ROOT, f), 'utf8'));
    if (hits.length) bad.push(`${f}: ${hits.join(', ')}`);
  }
  assert.deepEqual(bad, []);
});

test('the companion puts every variable attribute value through attr(), which escapes quotes', () => {
  const js = readFileSync(path.join(ROOT, 'admin/voyage-pwa/companion.js'), 'utf8');
  assert.match(js, /function attr\(s\)\{return String\(s==null\?"":s\)\.replace\(\/\[&<>"\]\/g/, 'attr() must escape the double quote');
  // Allowed without attr(): a loop index and fixed internal tab names, never outside data.
  const ALLOWED = new Set(['i', 'x']);
  const unescaped = [];
  for (const m of js.matchAll(/([a-zA-Z-]+)=\\?"'\+([^+]{1,60})\+'/g)) {
    const expr = m[2].trim();
    if (!expr.startsWith('attr(') && !ALLOWED.has(expr)) unescaped.push(`${m[1]}=${expr}`);
  }
  assert.deepEqual(unescaped, []);
});
