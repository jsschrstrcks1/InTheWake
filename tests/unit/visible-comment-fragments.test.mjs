// No page prints a broken comment fragment as text (Tekton automate-itw-visible-comment-fragments-20261117-a748e2).
//
// On 2026-11-17 nine pages showed markup on screen: " Section -->" on five Carnival ship pages, ": Page Intro -->" on
// two RCL pages, a template note on the grief meta snippet whose comment a bulk insert closed early, and an orphan
// content= line on izumi (InTheWake #2701). Argus's Lexicon index found them as parse gaps; nothing in CI did. This
// test reads every committed page and fails on a "-->" left in the page text once script and style bodies and real
// comments are removed. It catches the first three kinds; an orphan attribute line (the izumi kind) has no closer to
// find, which is this check's limit. Soli Deo Gloria.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = new URL('../../', import.meta.url).pathname;

// Text a reader would see that still holds a comment closer. Script and style bodies go first (a script may hold
// "<!--" in a string), then each comment up to its FIRST closer, which is how a browser ends a comment.
export function strayClosers(html) {
  const text = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');
  const hits = [];
  let i = text.indexOf('-->');
  while (i !== -1) {
    const start = text.lastIndexOf('\n', i) + 1;
    hits.push(text.slice(start, text.indexOf('\n', i) === -1 ? undefined : text.indexOf('\n', i)).trim());
    i = text.indexOf('-->', i + 3);
  }
  return hits;
}

test('the four fragment kinds found on 2026-11-17 are each caught, and their fixes pass', () => {
  const broken = [
    '<div><section>x</section>\n    </div> Section -->\n<p>y</p>',
    '<section>\n: Page Intro -->\n<section class="page-intro">',
    '<!--\n  META TAGS\n  <!-- Service Worker Registration -->\n  <script>x()</script>\n when template is built\n-->',
  ];
  for (const b of broken) assert.ok(strayClosers(b).length > 0, `not caught: ${JSON.stringify(b.slice(0, 40))}`);
  const fixed = [
    '<div><section>x</section>\n    </div><!-- /Section -->\n<p>y</p>',
    '<section>\n    <!-- Page Intro -->\n<section class="page-intro">',
    '<!--\n  META TAGS\n  Add to page <head> when template is built\n-->\n<script>x()</script>',
    '<script>const s = "<!-- not a comment -->";</script><p>ok</p>',
  ];
  for (const f of fixed) assert.deepEqual(strayClosers(f), [], `false alarm: ${JSON.stringify(f.slice(0, 40))}`);
});

test('no committed page prints a comment closer as text', () => {
  const files = execFileSync('git', ['ls-files', '-z', '*.html'], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
    .split('\0').filter(Boolean);
  assert.ok(files.length > 1000, `expected the site's pages, git listed ${files.length}`);
  const found = [];
  for (const f of files) {
    const hits = strayClosers(fs.readFileSync(path.join(ROOT, f), 'utf8'));
    if (hits.length) found.push(`${f}: ${hits[0]}`);
  }
  assert.deepEqual(found, [], `pages that show a broken comment as text (fix the comment so it opens with <!--):\n${found.join('\n')}`);
});
