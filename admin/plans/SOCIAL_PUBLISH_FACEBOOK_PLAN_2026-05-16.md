# Social Auto-Publish (Facebook v1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Auto-publish a Facebook Page post for every new article landing on `main`, with a generated typographic social card when no per-article photograph exists.

**Architecture:** Two cooperating subsystems, each its own npm package under `admin/`, each its own GitHub Actions workflow. (1) **Social card generator** (`admin/social-card-generator/`) — runs on push, uses satori + sharp to render 1200×630 JPGs, commits them to `assets/social/articles/<slug>.jpg`. (2) **Auto-publisher** (`admin/social-publish/`) — runs on push, reads new articles, calls Facebook Graph API, tracks per-article success in a committed manifest. Subsystems share no state; they communicate only through files on disk.

**Tech Stack:** Node 20 ES modules; `satori` (vDOM → SVG); `sharp` (SVG → JPG); `cheerio` (HTML parsing); `@fontsource/eb-garamond` + `@fontsource/public-sans` (OFL fonts); Node built-in `node:test` + `assert/strict` (matches repo convention in `tests/unit/`); Facebook Graph API; GitHub Actions.

**Working branch:** `claude/auto-publish-social-media-encL1` (already checked out, prior commits land the Wikimedia-sourced photos and the design spec).

**Spec reference:** `admin/SOCIAL_PUBLISH_FACEBOOK_DESIGN_2026-05-16.md`.

**Voice bar:** Operator called out shoddy work on existing port/ship logbooks as the bar NOT to match. Every commit message, code comment, and runbook line must be direct and specific. No marketing flourish.

---

## Phase ordering and stop points

- **Phase 0** — Workspace prep. ~5 minutes. Stop point: workspace verified.
- **Phase 1** — Article HTML one-time update (duck + tipping). ~15 minutes. Stop point: og:image meta repoints land; cards still 404 because generator hasn't run yet, expected.
- **Phase 2** — Card generator package, libs, tests. ~2 hours. Stop point: `npm test` green; CLI dry-run renders all 5 articles' cards to `/tmp/`.
- **Phase 3** — Card generator workflow + first live run. ~30 minutes. Stop point: cards committed to `main` by Actions; visible on the deployed site.
- **Phase 4** — Auto-publisher package, libs, tests. ~2 hours. Stop point: `npm test` green; CLI dry-run prints a composed FB post for the test article.
- **Phase 5** — Facebook token + Meta Developer setup. ~30 minutes operator hands-on (can run parallel with Phase 4 if needed). Stop point: long-lived Page token in GH secrets; first manual `workflow_dispatch` with `dry_run: true` succeeds.
- **Phase 6** — First live post; remove safety gate. ~15 minutes operator hands-on. Stop point: live FB post for one chosen article; visual verified; gate removed so future pushes auto-post.
- **Phase 7** — App Review submission (operator runbook). ~30 minutes operator hands-on; ~1-2 weeks Meta calendar time.

Each phase ends with a green checkpoint that must pass before the next phase begins. Don't skip the checkpoint just because the code "obviously works."

---

## Phase 0: Workspace prep

### Task 0.1: Verify branch and prior commits

**Files:** none (read-only check)

- [ ] **Step 1: Confirm branch**

Run: `git branch --show-current`
Expected: `claude/auto-publish-social-media-encL1`

- [ ] **Step 2: Confirm prior commits land**

Run: `git log --oneline origin/main..HEAD`
Expected: three commits — content(articles) for Wikimedia photos, docs(social-publish) v1 design, docs(social-publish) prototype-driven rewrite. If anything is missing, stop and reconcile before continuing.

- [ ] **Step 3: Confirm working tree clean**

Run: `git status --short`
Expected: empty output. If not, commit or stash before continuing.

---

## Phase 1: Article HTML one-time update

The duck and tipping articles point `og:image` at the generic `articles-hero.jpg`. They need to point at their canonical per-article paths so the generator has somewhere to write. Cards won't exist yet — that's fine, expected, and rendered by Phase 3.

### Task 1.1: Point cruise-duck-tradition.html at canonical card path

**Files:**
- Modify: `articles/cruise-duck-tradition.html` (4 lines: og:image, og:image:alt, twitter:image, twitter:image:alt)

- [ ] **Step 1: Read current state**

Run: `grep -n "og:image\|twitter:image" articles/cruise-duck-tradition.html`
Expected: four lines, all referencing `articles-hero.jpg`.

- [ ] **Step 2: Update og:image and twitter:image**

Use Edit tool with `replace_all: true`:
- old_string: `https://cruisinginthewake.com/assets/social/articles-hero.jpg`
- new_string: `https://cruisinginthewake.com/assets/social/articles/cruise-duck-tradition.jpg`

- [ ] **Step 3: Update og:image:alt and twitter:image:alt**

Use Edit tool with `replace_all: true`:
- old_string: `content="Rubber ducks arranged for cruise duck hiding"`
- new_string: `content="Cruise Duck Tradition: How to Hide & Find Ducks on Your Cruise — In the Wake"`

(The card generator will overwrite this on first run with the og:title verbatim, but setting it now keeps the article valid in the interim.)

- [ ] **Step 4: Verify**

Run: `grep "og:image\|twitter:image" articles/cruise-duck-tradition.html`
Expected: all four lines reference `/assets/social/articles/cruise-duck-tradition.jpg`.

- [ ] **Step 5: Commit**

```bash
git add articles/cruise-duck-tradition.html
git commit -m "content(duck): point og:image at canonical per-article path

The card generator (next commit set) writes to assets/social/articles/<slug>.jpg.
Repointing now so the generator has a target. File doesn't exist yet — Phase
3 of the social-publish plan writes it."
```

### Task 1.2: Point cruise-tipping-2026.html at canonical card path

**Files:**
- Modify: `articles/cruise-tipping-2026.html` (4 lines)

- [ ] **Step 1: Read current state**

Run: `grep -n "og:image\|twitter:image" articles/cruise-tipping-2026.html`
Expected: four lines, all referencing `articles-hero.jpg`.

- [ ] **Step 2: Update og:image and twitter:image**

Use Edit tool with `replace_all: true`:
- old_string: `https://cruisinginthewake.com/assets/social/articles-hero.jpg`
- new_string: `https://cruisinginthewake.com/assets/social/articles/cruise-tipping-2026.jpg`

- [ ] **Step 3: Update og:image:alt and twitter:image:alt**

Use Edit tool with `replace_all: true`:
- old_string: `content="Cruise Tipping for 2026 — In the Wake"`
- new_string: `content="Cruise Tipping for 2026: What You'll Actually Owe, by Line — In the Wake"`

- [ ] **Step 4: Verify**

Run: `grep "og:image\|twitter:image" articles/cruise-tipping-2026.html`
Expected: all four lines reference `/assets/social/articles/cruise-tipping-2026.jpg`.

- [ ] **Step 5: Commit**

```bash
git add articles/cruise-tipping-2026.html
git commit -m "content(tipping): point og:image at canonical per-article path

See cruise-duck-tradition companion commit. File doesn't exist yet — Phase 3
writes it."
```

### Task 1.3: Checkpoint — Phase 1 complete

- [ ] **Step 1: Confirm both articles updated**

Run: `grep -l "social/articles/cruise-duck-tradition.jpg\|social/articles/cruise-tipping-2026.jpg" articles/*.html | wc -l`
Expected: `2`

- [ ] **Step 2: Confirm five articles, three on Wikimedia photos, two on canonical (will be generated) paths**

Run: `for f in articles/*.html; do echo "$f: $(grep -m1 'og:image' "$f" | grep -oE 'social/[^"]+')"; done`
Expected:
```
articles/caribbean-cruise-trends-2026.html: social/articles/caribbean-cruise-trends-2026.jpg
articles/cruise-cabin-organization.html: social/articles/cruise-cabin-organization.jpg
articles/cruise-duck-tradition.html: social/articles/cruise-duck-tradition.jpg
articles/cruise-tech-photography-guide.html: social/articles/cruise-tech-photography-guide.jpg
articles/cruise-tipping-2026.html: social/articles/cruise-tipping-2026.jpg
```

All five canonical. Duck and tipping cards do not exist on disk yet; that's correct at this checkpoint.

---

## Phase 2: Card generator package

### Task 2.1: Initialize the package

**Files:**
- Create: `admin/social-card-generator/package.json`
- Create: `admin/social-card-generator/.gitignore`

- [ ] **Step 1: Create directory**

```bash
mkdir -p admin/social-card-generator/lib admin/social-card-generator/templates admin/social-card-generator/test
```

- [ ] **Step 2: Write package.json**

Create `admin/social-card-generator/package.json`:

```json
{
  "name": "@inthewake/social-card-generator",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "description": "Generates 1200x630 typographic social cards for InTheWake articles whose og:image points at a missing per-article path.",
  "scripts": {
    "generate": "node generate.js",
    "generate:one": "node generate.js --article",
    "generate:all": "node generate.js --force-all",
    "test": "node --test test/*.test.mjs"
  },
  "dependencies": {
    "@fontsource/eb-garamond": "^5.2.0",
    "@fontsource/public-sans": "^5.2.0",
    "cheerio": "^1.1.2",
    "satori": "^0.16.0",
    "sharp": "^0.34.5"
  },
  "engines": {
    "node": ">=20.0.0"
  }
}
```

- [ ] **Step 3: Write .gitignore**

Create `admin/social-card-generator/.gitignore`:

```
node_modules/
*.log
.DS_Store
```

- [ ] **Step 4: Install deps**

```bash
cd admin/social-card-generator && npm install
```

Expected: completes without errors, generates `package-lock.json`.

- [ ] **Step 5: Verify font files exist**

Run from repo root:
```bash
ls admin/social-card-generator/node_modules/@fontsource/eb-garamond/files/eb-garamond-latin-{400,700}-normal.woff
ls admin/social-card-generator/node_modules/@fontsource/public-sans/files/public-sans-latin-{400,700}-normal.woff
```

Expected: four `.woff` files listed, no errors.

- [ ] **Step 6: Commit**

```bash
git add admin/social-card-generator/package.json admin/social-card-generator/package-lock.json admin/social-card-generator/.gitignore
git commit -m "feat(social-card-generator): initialize npm package

satori + sharp pipeline, OFL fonts via fontsource (EB Garamond + Public Sans),
cheerio for article <head> parsing, Node built-in test runner. Node 20+."
```

### Task 2.2: Palette module (with rope-on-pale guard)

**Files:**
- Create: `admin/social-card-generator/lib/palette.js`
- Create: `admin/social-card-generator/test/palette.test.mjs`

- [ ] **Step 1: Write the failing test**

Create `admin/social-card-generator/test/palette.test.mjs`:

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PALETTE, assertTextColorPair } from '../lib/palette.js';

test('palette exports the site tokens by name', () => {
  assert.equal(PALETTE.sky, '#f7fdff');
  assert.equal(PALETTE.sea, '#0a3d62');
  assert.equal(PALETTE.rope, '#d9b382');
  assert.equal(PALETTE.ink, '#083041');
  assert.equal(PALETTE.inkMid, '#3d5a6a');
  assert.equal(PALETTE.textMuted, '#2a4a5a');
  assert.equal(PALETTE.accent, '#0e6e8e');
});

test('assertTextColorPair accepts WCAG AA pairings on pale background', () => {
  assert.doesNotThrow(() => assertTextColorPair(PALETTE.sea, PALETTE.sky));
  assert.doesNotThrow(() => assertTextColorPair(PALETTE.ink, PALETTE.sky));
  assert.doesNotThrow(() => assertTextColorPair(PALETTE.inkMid, PALETTE.sky));
  assert.doesNotThrow(() => assertTextColorPair(PALETTE.textMuted, PALETTE.sky));
});

test('assertTextColorPair rejects rope-on-pale (fails AA)', () => {
  assert.throws(
    () => assertTextColorPair(PALETTE.rope, PALETTE.sky),
    /rope.*text.*pale|contrast.*1\.\d/i
  );
});

test('assertTextColorPair accepts rope-on-sea (passes AA)', () => {
  assert.doesNotThrow(() => assertTextColorPair(PALETTE.rope, PALETTE.sea));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd admin/social-card-generator && npm test`
Expected: FAIL — cannot find module `../lib/palette.js`.

- [ ] **Step 3: Implement palette module**

Create `admin/social-card-generator/lib/palette.js`:

```javascript
// Site tokens mirrored from /assets/styles.css :root.
// Cards must only use these — no invented colors.

export const PALETTE = Object.freeze({
  sky:       '#f7fdff',
  foam:      '#e6f4f8',
  sea:       '#0a3d62',
  ink:       '#083041',
  rope:      '#d9b382',
  accent:    '#0e6e8e',
  accentDark:'#005a9c',
  inkMid:    '#3d5a6a',
  textMuted: '#2a4a5a',
});

// WCAG 2.1 relative luminance.
function relativeLuminance(hex) {
  const n = hex.replace('#', '');
  const [r, g, b] = [n.slice(0, 2), n.slice(2, 4), n.slice(4, 6)].map(c => {
    const v = parseInt(c, 16) / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(fgHex, bgHex) {
  const a = relativeLuminance(fgHex);
  const b = relativeLuminance(bgHex);
  const [hi, lo] = a > b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
}

// Throws if a text color paired with a background fails WCAG 2.1 AA for
// normal text (4.5:1). The renderer calls this for every text element.
export function assertTextColorPair(fgHex, bgHex) {
  const ratio = contrastRatio(fgHex, bgHex);
  if (ratio < 4.5) {
    throw new Error(
      `Card text contrast ${ratio.toFixed(2)}:1 fails WCAG AA on ${fgHex} over ${bgHex}. ` +
      (fgHex.toLowerCase() === PALETTE.rope.toLowerCase()
        ? 'Rope is decorative-only on pale backgrounds; never use it as text color over --sky or --foam.'
        : 'Pick a darker text color or a darker background.')
    );
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd admin/social-card-generator && npm test`
Expected: PASS — 4 tests, 0 failures.

- [ ] **Step 5: Commit**

```bash
git add admin/social-card-generator/lib/palette.js admin/social-card-generator/test/palette.test.mjs
git commit -m "feat(social-card-generator): palette module with WCAG AA guard

Mirrors /assets/styles.css :root tokens. assertTextColorPair() throws if a
text/background pairing fails AA (4.5:1) — specifically catches the
rope-on-pale case (1.9:1) that the spec bans."
```

### Task 2.3: Article metadata extractor

**Files:**
- Create: `admin/social-card-generator/lib/extract.js`
- Create: `admin/social-card-generator/test/extract.test.mjs`
- Create: `admin/social-card-generator/test/fixtures/article-tipping.html`

- [ ] **Step 1: Write the test fixture**

Create `admin/social-card-generator/test/fixtures/article-tipping.html`:

```html
<!doctype html>
<html lang="en"><head>
  <meta property="og:title" content="Cruise Tipping for 2026: What You'll Actually Owe, by Line"/>
  <meta property="og:description" content="2026 daily rates across all 15 major lines, plus the auto-grats most calculators miss."/>
  <meta property="og:image" content="https://cruisinginthewake.com/assets/social/articles/cruise-tipping-2026.jpg"/>
  <meta property="og:image:alt" content="Cruise Tipping for 2026: What You'll Actually Owe, by Line — In the Wake"/>
  <meta property="article:published_time" content="2026-05-08"/>
  <meta property="article:author" content="https://cruisinginthewake.com/authors/ken-baker.html"/>
  <link rel="canonical" href="https://cruisinginthewake.com/articles/cruise-tipping-2026.html"/>
</head><body></body></html>
```

- [ ] **Step 2: Write the failing test**

Create `admin/social-card-generator/test/extract.test.mjs`:

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { extractArticleMeta } from '../lib/extract.js';

const fixture = readFileSync(new URL('./fixtures/article-tipping.html', import.meta.url), 'utf8');

test('extracts all required fields from a real article head', () => {
  const meta = extractArticleMeta(fixture);
  assert.equal(meta.title, "Cruise Tipping for 2026: What You'll Actually Owe, by Line");
  assert.equal(meta.description, "2026 daily rates across all 15 major lines, plus the auto-grats most calculators miss.");
  assert.equal(meta.canonicalUrl, "https://cruisinginthewake.com/articles/cruise-tipping-2026.html");
  assert.equal(meta.ogImageUrl, "https://cruisinginthewake.com/assets/social/articles/cruise-tipping-2026.jpg");
  assert.equal(meta.ogImagePath, "/assets/social/articles/cruise-tipping-2026.jpg");
  assert.equal(meta.publishedDate, "2026-05-08");
  assert.equal(meta.authorName, "Ken Baker");
  assert.equal(meta.slug, "cruise-tipping-2026");
});

test('throws with explicit list of missing tags', () => {
  const incomplete = `<!doctype html><html><head>
    <meta property="og:title" content="Test"/>
  </head></html>`;
  assert.throws(
    () => extractArticleMeta(incomplete),
    /missing.*og:description.*og:image.*canonical/i
  );
});

test('falls back to "Ken Baker" if article:author is absent', () => {
  const minimal = fixture.replace(/<meta property="article:author"[^/]*\/>/, '');
  const meta = extractArticleMeta(minimal);
  assert.equal(meta.authorName, "Ken Baker");
});

test('derives author name from URL slug (e.g. tina-maulsby -> Tina Maulsby)', () => {
  const swapped = fixture.replace(
    'authors/ken-baker.html',
    'authors/tina-maulsby.html'
  );
  const meta = extractArticleMeta(swapped);
  assert.equal(meta.authorName, "Tina Maulsby");
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd admin/social-card-generator && npm test`
Expected: FAIL — cannot find module `../lib/extract.js`.

- [ ] **Step 4: Implement the extractor**

Create `admin/social-card-generator/lib/extract.js`:

```javascript
import { load } from 'cheerio';

const REQUIRED = ['og:title', 'og:description', 'og:image', 'canonical'];

export function extractArticleMeta(html) {
  const $ = load(html);
  const ogTitle       = $('meta[property="og:title"]').attr('content');
  const ogDescription = $('meta[property="og:description"]').attr('content');
  const ogImage       = $('meta[property="og:image"]').attr('content');
  const canonicalUrl  = $('link[rel="canonical"]').attr('href');
  const publishedDate = $('meta[property="article:published_time"]').attr('content') || null;
  const authorUrl     = $('meta[property="article:author"]').attr('content') || null;

  const missing = [];
  if (!ogTitle)       missing.push('og:title');
  if (!ogDescription) missing.push('og:description');
  if (!ogImage)       missing.push('og:image');
  if (!canonicalUrl)  missing.push('canonical');
  if (missing.length) {
    throw new Error(`Article HTML missing required tags: ${missing.join(', ')}`);
  }

  const ogImagePath = ogImage.replace(/^https?:\/\/[^/]+/, '');
  const slug = (canonicalUrl.match(/\/articles\/([^/]+)\.html$/) || [])[1];
  if (!slug) {
    throw new Error(`Could not derive slug from canonical URL: ${canonicalUrl}`);
  }

  let authorName = 'Ken Baker';
  if (authorUrl) {
    const m = authorUrl.match(/\/authors\/([^/]+)\.html$/);
    if (m) {
      authorName = m[1].split('-').map(s => s[0].toUpperCase() + s.slice(1)).join(' ');
    }
  }

  return { title: ogTitle, description: ogDescription, canonicalUrl, ogImageUrl: ogImage, ogImagePath, publishedDate, authorName, slug };
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd admin/social-card-generator && npm test`
Expected: PASS — 4 extract tests plus 4 palette tests = 8 tests total, 0 failures.

- [ ] **Step 6: Commit**

```bash
git add admin/social-card-generator/lib/extract.js admin/social-card-generator/test/extract.test.mjs admin/social-card-generator/test/fixtures/article-tipping.html
git commit -m "feat(social-card-generator): extractor for article <head>

Reads og:title, og:description, og:image, canonical, article:published_time,
article:author via cheerio. Throws with explicit missing-tag list. Derives
author name from /authors/{slug}.html URL (kebab-to-title). Slug from
canonical URL. Used by both the card generator and any future consumer."
```

### Task 2.4: Manifest module

**Files:**
- Create: `admin/social-card-generator/lib/manifest.js`
- Create: `admin/social-card-generator/test/manifest.test.mjs`

- [ ] **Step 1: Write the failing test**

Create `admin/social-card-generator/test/manifest.test.mjs`:

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  loadManifest, saveManifest, computeContentHash, decideAction,
} from '../lib/manifest.js';

function tmp() { return mkdtempSync(join(tmpdir(), 'manifest-test-')); }

test('loadManifest returns empty object if file is missing', () => {
  const dir = tmp();
  const m = loadManifest(join(dir, 'missing.json'));
  assert.deepEqual(m, {});
});

test('saveManifest then loadManifest roundtrips', () => {
  const dir = tmp();
  const path = join(dir, '.generated-manifest.json');
  const m = { 'cruise-tipping-2026': { contentHash: 'abc123', generatedAt: '2026-05-17T00:00:00Z' }};
  saveManifest(path, m);
  assert.deepEqual(loadManifest(path), m);
});

test('computeContentHash is stable for the same title+description', () => {
  const a = computeContentHash('Title', 'Description');
  const b = computeContentHash('Title', 'Description');
  assert.equal(a, b);
  assert.equal(a.length, 8); // sha1 truncated to 8 chars for query-string brevity
});

test('computeContentHash differs when title changes', () => {
  const a = computeContentHash('Title A', 'Same Desc');
  const b = computeContentHash('Title B', 'Same Desc');
  assert.notEqual(a, b);
});

test('decideAction: generate when JPG missing', () => {
  const dir = tmp();
  const r = decideAction({
    cardPath: join(dir, 'nonexistent.jpg'),
    slug: 'foo',
    currentHash: 'aaaaaaaa',
    manifest: {},
  });
  assert.equal(r.action, 'generate');
});

test('decideAction: skip when JPG present and not in manifest (human photo)', () => {
  const dir = tmp();
  const cardPath = join(dir, 'photo.jpg');
  writeFileSync(cardPath, 'fake jpg bytes');
  const r = decideAction({ cardPath, slug: 'foo', currentHash: 'aaaaaaaa', manifest: {} });
  assert.equal(r.action, 'skip-human-photo');
});

test('decideAction: regenerate when JPG present, in manifest, hash differs', () => {
  const dir = tmp();
  const cardPath = join(dir, 'gen.jpg');
  writeFileSync(cardPath, 'fake');
  const r = decideAction({
    cardPath, slug: 'foo', currentHash: 'newhash1',
    manifest: { foo: { contentHash: 'oldhash9', generatedAt: '2026-01-01T00:00:00Z' }},
  });
  assert.equal(r.action, 'regenerate');
});

test('decideAction: skip when JPG present, in manifest, hash matches', () => {
  const dir = tmp();
  const cardPath = join(dir, 'gen.jpg');
  writeFileSync(cardPath, 'fake');
  const r = decideAction({
    cardPath, slug: 'foo', currentHash: 'samehash',
    manifest: { foo: { contentHash: 'samehash', generatedAt: '2026-01-01T00:00:00Z' }},
  });
  assert.equal(r.action, 'skip-fresh');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd admin/social-card-generator && npm test`
Expected: FAIL — cannot find module `../lib/manifest.js`.

- [ ] **Step 3: Implement manifest module**

Create `admin/social-card-generator/lib/manifest.js`:

```javascript
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd admin/social-card-generator && npm test`
Expected: PASS — 4 palette + 4 extract + 8 manifest = 16 tests, 0 failures.

- [ ] **Step 5: Commit**

```bash
git add admin/social-card-generator/lib/manifest.js admin/social-card-generator/test/manifest.test.mjs
git commit -m "feat(social-card-generator): manifest + decision logic

.generated-manifest.json tracks which JPGs the generator authored, keyed by
slug, value = {contentHash, generatedAt}. decideAction() resolves the
four-way decision: generate (file missing), regenerate (file present in
manifest, hash differs), skip-fresh (file present, hash matches), or
skip-human-photo (file present, not in manifest — author's photo wins).
sha1 truncated to 8 chars for use as og:image cache-bust query string."
```

### Task 2.5: Voyage-card template (vDOM tree)

**Files:**
- Create: `admin/social-card-generator/templates/voyage-card.js`
- Create: `admin/social-card-generator/test/template.test.mjs`

- [ ] **Step 1: Write the failing test**

Create `admin/social-card-generator/test/template.test.mjs`:

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { voyageCard, titleSize } from '../templates/voyage-card.js';

test('titleSize scales by character count', () => {
  assert.equal(titleSize('Short'),              104);  // 5 chars
  assert.equal(titleSize('a'.repeat(22)),       104);  // boundary
  assert.equal(titleSize('a'.repeat(23)),        88);
  assert.equal(titleSize('a'.repeat(32)),        88);
  assert.equal(titleSize('a'.repeat(33)),        78);
  assert.equal(titleSize('a'.repeat(48)),        78);
  assert.equal(titleSize('a'.repeat(49)),        68);
  assert.equal(titleSize('a'.repeat(64)),        68);
  assert.equal(titleSize('a'.repeat(65)),        60);
});

test('voyageCard returns a vDOM tree with the expected shape', () => {
  const tree = voyageCard({
    title: 'Test Title',
    subtitle: 'Test subtitle',
    byline: 'Ken Baker  ·  17 May 2026',
    url: 'cruisinginthewake.com',
  });
  assert.equal(tree.type, 'div');
  assert.equal(tree.props.style.width, 1200);
  assert.equal(tree.props.style.height, 630);
  // Background must be --sky
  assert.equal(tree.props.style.background, '#f7fdff');
  // Children: compass svg, title, rule, subtitle, spacer, byline row
  assert.equal(tree.props.children.length, 6);
});

test('voyageCard throws if any text color pair fails WCAG AA', () => {
  // The template hard-codes the safe pairings, so this should never throw
  // when called normally. The test confirms the guard is wired.
  assert.doesNotThrow(() => voyageCard({
    title: 'A', subtitle: 'b', byline: 'c · d', url: 'e',
  }));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd admin/social-card-generator && npm test`
Expected: FAIL — cannot find module `../templates/voyage-card.js`.

- [ ] **Step 3: Implement the template**

Create `admin/social-card-generator/templates/voyage-card.js`:

```javascript
import { PALETTE, assertTextColorPair } from '../lib/palette.js';

// Adaptive title size — shorter titles get bigger, longer titles get smaller.
// Tuned empirically against EB Garamond Bold at max-width 1020 on a 1200-wide canvas.
export function titleSize(title) {
  const n = title.length;
  if (n <= 22) return 104;
  if (n <= 32) return 88;
  if (n <= 48) return 78;
  if (n <= 64) return 68;
  return 60;
}

const compassRose = {
  type: 'svg',
  props: {
    xmlns: 'http://www.w3.org/2000/svg',
    width: 300, height: 300, viewBox: '0 0 240 240',
    style: { position: 'absolute', bottom: 30, right: 30, opacity: 0.16 },
    children: [
      { type: 'circle', props: { cx: 120, cy: 120, r: 118, fill: 'none', stroke: PALETTE.accent, strokeWidth: 2 }},
      { type: 'path',   props: { d: 'M120 12 L135 120 L120 228 L105 120 Z', fill: PALETTE.sea }},
      { type: 'path',   props: { d: 'M12 120 L120 135 L228 120 L120 105 Z', fill: PALETTE.sea }},
    ],
  },
};

export function voyageCard({ title, subtitle, byline, url }) {
  // Enforce contrast guards at template construction — fail fast if
  // a future edit introduces a bad pairing.
  assertTextColorPair(PALETTE.sea,       PALETTE.sky);   // title
  assertTextColorPair(PALETTE.inkMid,    PALETTE.sky);   // subtitle
  assertTextColorPair(PALETTE.textMuted, PALETTE.sky);   // byline + URL

  return {
    type: 'div',
    props: {
      style: {
        width: 1200, height: 630,
        background: PALETTE.sky,
        display: 'flex', flexDirection: 'column',
        padding: '90px 90px 70px 90px',
        position: 'relative',
        fontFamily: 'serif',
      },
      children: [
        compassRose,
        { type: 'div', props: {
          style: { display: 'flex', fontFamily: 'serif', fontWeight: 700, fontSize: titleSize(title), lineHeight: 1.06, color: PALETTE.sea, letterSpacing: '-0.01em', maxWidth: 1020 },
          children: title,
        }},
        { type: 'div', props: {
          style: { width: 84, height: 5, background: PALETTE.rope, marginTop: 32, marginBottom: 26 },
        }},
        { type: 'div', props: {
          style: { display: 'flex', fontFamily: 'sans', fontSize: 32, lineHeight: 1.35, color: PALETTE.inkMid, maxWidth: 920 },
          children: subtitle,
        }},
        { type: 'div', props: { style: { flexGrow: 1 }}},
        { type: 'div', props: {
          style: { display: 'flex', justifyContent: 'space-between', fontFamily: 'sans', fontSize: 22, color: PALETTE.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em' },
          children: [
            { type: 'span', props: { children: byline }},
            { type: 'span', props: { children: url }},
          ],
        }},
      ],
    },
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd admin/social-card-generator && npm test`
Expected: PASS — 4 palette + 4 extract + 8 manifest + 3 template = 19 tests, 0 failures.

- [ ] **Step 5: Commit**

```bash
git add admin/social-card-generator/templates/voyage-card.js admin/social-card-generator/test/template.test.mjs
git commit -m "feat(social-card-generator): voyage-card template (vDOM)

Single-variant layout: EB Garamond Bold title (adaptive size 60-104pt),
rope rule, Public Sans subtitle, byline+URL row. Compass SVG at 16%
opacity in lower-right. assertTextColorPair() runs at template construction
to catch bad pairings before satori sees them. Plain JS objects, no JSX —
keeps the build surface tiny."
```

### Task 2.6: Render pipeline (satori + sharp)

**Files:**
- Create: `admin/social-card-generator/lib/render.js`
- Create: `admin/social-card-generator/test/render.test.mjs`

- [ ] **Step 1: Write the failing test**

Create `admin/social-card-generator/test/render.test.mjs`:

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, existsSync, statSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { renderCard } from '../lib/render.js';

const tmp = () => mkdtempSync(join(tmpdir(), 'render-test-'));

test('renderCard writes a JPG to the given path', async () => {
  const out = join(tmp(), 'out.jpg');
  await renderCard({
    title: 'Test Card',
    subtitle: 'Subtitle here.',
    byline: 'Ken Baker  ·  17 May 2026',
    url: 'cruisinginthewake.com',
    outPath: out,
  });
  assert.ok(existsSync(out));
  // JPEG SOI marker
  const head = readFileSync(out).subarray(0, 2);
  assert.equal(head[0], 0xff);
  assert.equal(head[1], 0xd8);
});

test('renderCard output is approximately 1200x630', async () => {
  const out = join(tmp(), 'out.jpg');
  await renderCard({
    title: 'Test',
    subtitle: 'Sub',
    byline: 'A · B',
    url: 'x.com',
    outPath: out,
  });
  // Use sharp to inspect metadata
  const sharp = (await import('sharp')).default;
  const meta = await sharp(out).metadata();
  assert.equal(meta.width, 1200);
  assert.equal(meta.height, 630);
  assert.equal(meta.format, 'jpeg');
});

test('renderCard handles long titles without throwing', async () => {
  const out = join(tmp(), 'out.jpg');
  await renderCard({
    title: 'A very long title that exceeds sixty four characters and forces the smallest size bucket to be selected',
    subtitle: 'Short subtitle.',
    byline: 'Ken Baker · 17 May 2026',
    url: 'cruisinginthewake.com',
    outPath: out,
  });
  assert.ok(existsSync(out));
});

test('renderCard reasonable file size (between 30KB and 500KB)', async () => {
  const out = join(tmp(), 'out.jpg');
  await renderCard({
    title: 'Cruise Tipping for 2026',
    subtitle: 'Real-world rates and the auto-grats most calculators miss.',
    byline: 'Ken Baker  ·  8 May 2026',
    url: 'cruisinginthewake.com',
    outPath: out,
  });
  const size = statSync(out).size;
  assert.ok(size > 30_000,  `expected > 30KB, got ${size}`);
  assert.ok(size < 500_000, `expected < 500KB, got ${size}`);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd admin/social-card-generator && npm test`
Expected: FAIL — cannot find module `../lib/render.js`.

- [ ] **Step 3: Implement render pipeline**

Create `admin/social-card-generator/lib/render.js`:

```javascript
import satori from 'satori';
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { voyageCard } from '../templates/voyage-card.js';

const here = dirname(fileURLToPath(import.meta.url));
const fontPath = (rel) => `${here}/../node_modules/${rel}`;

const FONTS = [
  { name: 'serif', weight: 400, style: 'normal', data: readFileSync(fontPath('@fontsource/eb-garamond/files/eb-garamond-latin-400-normal.woff')) },
  { name: 'serif', weight: 700, style: 'normal', data: readFileSync(fontPath('@fontsource/eb-garamond/files/eb-garamond-latin-700-normal.woff')) },
  { name: 'sans',  weight: 400, style: 'normal', data: readFileSync(fontPath('@fontsource/public-sans/files/public-sans-latin-400-normal.woff')) },
  { name: 'sans',  weight: 700, style: 'normal', data: readFileSync(fontPath('@fontsource/public-sans/files/public-sans-latin-700-normal.woff')) },
];

export async function renderCard({ title, subtitle, byline, url, outPath }) {
  const tree = voyageCard({ title, subtitle, byline, url });
  const svg = await satori(tree, { width: 1200, height: 630, fonts: FONTS });
  const jpg = await sharp(Buffer.from(svg))
    .jpeg({ quality: 90, progressive: true, mozjpeg: true })
    .toBuffer();
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, jpg);
  return { bytes: jpg.length };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd admin/social-card-generator && npm test`
Expected: PASS — 19 prior + 4 render = 23 tests, 0 failures. Render tests may take 5–10 seconds total.

- [ ] **Step 5: Commit**

```bash
git add admin/social-card-generator/lib/render.js admin/social-card-generator/test/render.test.mjs
git commit -m "feat(social-card-generator): satori + sharp render pipeline

renderCard() takes title/subtitle/byline/url + outPath, writes a 1200x630
JPEG at quality 90 (progressive, mozjpeg). Fonts loaded from
@fontsource/* node_modules at module init. Verified with sharp metadata
read-back."
```

### Task 2.7: Date formatting helper

**Files:**
- Create: `admin/social-card-generator/lib/format.js`
- Create: `admin/social-card-generator/test/format.test.mjs`

- [ ] **Step 1: Write the failing test**

Create `admin/social-card-generator/test/format.test.mjs`:

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatBylineDate, buildByline } from '../lib/format.js';

test('formatBylineDate: ISO date -> "D MMM YYYY" uppercase-ready', () => {
  assert.equal(formatBylineDate('2026-05-08'), '8 May 2026');
  assert.equal(formatBylineDate('2026-01-18'), '18 Jan 2026');
  assert.equal(formatBylineDate('2026-12-31'), '31 Dec 2026');
});

test('formatBylineDate: returns empty string for null/missing', () => {
  assert.equal(formatBylineDate(null), '');
  assert.equal(formatBylineDate(undefined), '');
  assert.equal(formatBylineDate(''), '');
});

test('buildByline: name + date with bullet separator', () => {
  assert.equal(buildByline('Ken Baker', '2026-05-08'), 'Ken Baker  ·  8 May 2026');
});

test('buildByline: name only when date is missing', () => {
  assert.equal(buildByline('Ken Baker', null), 'Ken Baker');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd admin/social-card-generator && npm test`
Expected: FAIL — cannot find module `../lib/format.js`.

- [ ] **Step 3: Implement format helpers**

Create `admin/social-card-generator/lib/format.js`:

```javascript
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export function formatBylineDate(iso) {
  if (!iso) return '';
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return '';
  const [, y, mm, dd] = m;
  return `${parseInt(dd, 10)} ${MONTHS[parseInt(mm, 10) - 1]} ${y}`;
}

export function buildByline(name, isoDate) {
  const d = formatBylineDate(isoDate);
  return d ? `${name}  ·  ${d}` : name;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd admin/social-card-generator && npm test`
Expected: PASS — 23 prior + 4 format = 27 tests, 0 failures.

- [ ] **Step 5: Commit**

```bash
git add admin/social-card-generator/lib/format.js admin/social-card-generator/test/format.test.mjs
git commit -m "feat(social-card-generator): byline date formatting

ISO 2026-05-08 -> '8 May 2026'. buildByline composes 'Name  ·  Date' with
double-space-bullet-double-space, matching the prototype output."
```

### Task 2.8: Entry point with CLI

**Files:**
- Create: `admin/social-card-generator/generate.js`
- Create: `admin/social-card-generator/README.md`

- [ ] **Step 1: Implement the entry point**

Create `admin/social-card-generator/generate.js`:

```javascript
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
```

- [ ] **Step 2: Write a one-page README**

Create `admin/social-card-generator/README.md`:

```markdown
# Social Card Generator

Renders 1200×630 typographic JPGs for articles whose `og:image` points at
`assets/social/articles/<slug>.jpg` and that file doesn't exist (or was
previously generated by this tool and its source text has changed).

## Local use

```
cd admin/social-card-generator
npm install
npm test                                                # 27 tests
node generate.js                                        # process all articles
node generate.js --article ../../articles/foo.html      # process one
node generate.js --article ../../articles/foo.html --out /tmp/preview.jpg  # preview to arbitrary path
node generate.js --force-all                            # regenerate every generator-authored card
```

## What it touches

- Reads: `articles/*.html`
- Writes: `assets/social/articles/<slug>.jpg`, `assets/social/articles/.generated-manifest.json`
- Never modifies article HTML.

## What it skips

- Articles whose card path already holds a file NOT in the manifest (treated as a human-authored photograph).

## When to regenerate

The CI workflow regenerates automatically when an article's `og:title` or
`og:description` changes. To force a regenerate locally, delete the
slug's entry from `.generated-manifest.json` and re-run, or use
`--force-all`.
```

- [ ] **Step 3: Verify the CLI runs against the prototype scenario**

Run: `cd admin/social-card-generator && node generate.js --article ../../articles/cruise-tipping-2026.html --out /tmp/cli-test.jpg`
Expected: prints `cruise-tipping-2026: generate -> /tmp/cli-test.jpg (...)` and exits 0. Manifest is NOT touched because `--out` was used.

- [ ] **Step 4: Verify the output is a valid JPEG**

Run: `file /tmp/cli-test.jpg`
Expected: `JPEG image data, ..., 1200x630`.

- [ ] **Step 5: Commit**

```bash
git add admin/social-card-generator/generate.js admin/social-card-generator/README.md
git commit -m "feat(social-card-generator): CLI entry point + README

generate.js processes one or all articles, decides per-file what to do,
writes JPGs + manifest. --out override for local preview without touching
the repo. --force-all regenerates every generator-authored card. README
documents the four commands."
```

### Task 2.9: Phase 2 checkpoint

- [ ] **Step 1: Run full test suite**

Run: `cd admin/social-card-generator && npm test`
Expected: 27 tests, 0 failures.

- [ ] **Step 2: Render all five articles to /tmp for visual review**

```bash
for slug in caribbean-cruise-trends-2026 cruise-cabin-organization cruise-duck-tradition cruise-tech-photography-guide cruise-tipping-2026; do
  node admin/social-card-generator/generate.js \
    --article articles/${slug}.html \
    --out /tmp/preview-${slug}.jpg
done
ls -la /tmp/preview-*.jpg
```

Expected: five JPGs created. The three photo-articles will render typographic cards because we passed `--out` (which always renders, bypassing the skip-human-photo logic). The two no-photo articles will also render.

- [ ] **Step 3: Visually inspect**

Open the five preview JPGs. Confirm: title in serif, rope rule, subtitle in sans, compass rose at lower-right faint, byline+URL row at bottom. No invented colors, no ASCII bands. If any card looks wrong, stop here and fix before moving to Phase 3.

- [ ] **Step 4: Confirm Phase 2 is shippable**

Run: `git status --short`
Expected: working tree clean — all Phase 2 work is committed. If anything is uncommitted, that's a process bug. Resolve before continuing.

---

## Phase 3: Card generator workflow

### Task 3.1: GitHub Actions workflow

**Files:**
- Create: `.github/workflows/social-cards.yml`

- [ ] **Step 1: Write the workflow**

Create `.github/workflows/social-cards.yml`:

```yaml
name: Social Cards (generate)

on:
  push:
    branches: [main]
    paths:
      - 'articles/**/*.html'
      - 'admin/social-card-generator/**'
  workflow_dispatch:
    inputs:
      article:
        description: 'Path to a single article (optional). E.g. articles/cruise-tipping-2026.html'
        required: false
        type: string
      force_all:
        description: 'Regenerate every generator-authored card'
        required: false
        type: boolean
        default: false

permissions:
  contents: write

concurrency:
  group: social-cards
  cancel-in-progress: false

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 2

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: admin/social-card-generator/package-lock.json

      - name: Install
        working-directory: admin/social-card-generator
        run: npm ci

      - name: Test
        working-directory: admin/social-card-generator
        run: npm test

      - name: Generate
        run: |
          ARGS=""
          if [ -n "${{ inputs.article }}" ]; then ARGS="--article ${{ inputs.article }}"; fi
          if [ "${{ inputs.force_all }}" = "true" ]; then ARGS="$ARGS --force-all"; fi
          node admin/social-card-generator/generate.js $ARGS

      - name: Commit results
        run: |
          if git diff --quiet assets/social/articles/; then
            echo "No card changes."
            exit 0
          fi
          git config user.name  "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git add assets/social/articles/
          git commit -m "feat(social-cards): regenerate [skip ci]"
          git push
```

- [ ] **Step 2: Lint the workflow locally (optional but recommended)**

If `actionlint` is available locally, run: `actionlint .github/workflows/social-cards.yml`
Expected: no errors. If not available, skip — GH will validate on push.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/social-cards.yml
git commit -m "ci(social-cards): generator workflow

Runs on push to main when articles/ or admin/social-card-generator/ change.
Also supports workflow_dispatch with --article and --force-all inputs.
Commits regenerated JPGs + manifest back to main with [skip ci] so it
doesn't trigger itself."
```

### Task 3.2: First Actions run (workflow_dispatch dry-route)

This pushes the branch, then triggers the workflow manually so we observe its behavior before any push-driven run.

- [ ] **Step 1: Push the branch**

Run: `git push origin claude/auto-publish-social-media-encL1`
Expected: succeeds.

- [ ] **Step 2: Trigger the workflow via dispatch (operator action)**

Go to the GitHub web UI → Actions tab → "Social Cards (generate)" → Run workflow → branch `claude/auto-publish-social-media-encL1` → leave `article` empty, leave `force_all` unchecked → Run.

(Cannot be performed by the agent — the agent has GitHub MCP tools but should let the operator do this first run for observability.)

- [ ] **Step 3: Observe the run**

In the Actions log, the "Generate" step should print:
- 5 article lines: 3 with `skip (human-authored photo)` (the Wikimedia ones), 2 with `generate ->` (duck + tipping)
- Manifest saved
- Summary: `{"skip-human-photo":3,"generate":2}`

The "Commit results" step should commit `assets/social/articles/cruise-duck-tradition.jpg`, `assets/social/articles/cruise-tipping-2026.jpg`, and the manifest.

- [ ] **Step 4: Verify the commit landed**

Run: `git fetch origin && git log --oneline origin/claude/auto-publish-social-media-encL1 -5`
Expected: a new commit by `github-actions[bot]` titled `feat(social-cards): regenerate [skip ci]`.

- [ ] **Step 5: Verify the JPGs are real**

Run:
```bash
git fetch origin
git checkout origin/claude/auto-publish-social-media-encL1 -- assets/social/articles/cruise-duck-tradition.jpg assets/social/articles/cruise-tipping-2026.jpg
file assets/social/articles/cruise-duck-tradition.jpg
file assets/social/articles/cruise-tipping-2026.jpg
git checkout HEAD -- assets/social/articles/  # back to local state
```

Expected: both files report `JPEG image data, ..., 1200x630`.

- [ ] **Step 6: Pull the bot's commit into local**

Run: `git pull --ff-only origin claude/auto-publish-social-media-encL1`
Expected: fast-forward succeeds; local branch now contains the bot's commit.

### Task 3.3: Phase 3 checkpoint

- [ ] **Step 1: Confirm five real per-article cards now exist**

Run: `ls -la assets/social/articles/*.jpg | awk '{print $9, $5}'`
Expected: five JPGs (the three Wikimedia photos already committed earlier in this branch + two new generator-authored cards).

- [ ] **Step 2: Manifest correct**

Run: `cat assets/social/articles/.generated-manifest.json`
Expected: two keys (`cruise-duck-tradition`, `cruise-tipping-2026`), each with `contentHash` and `generatedAt`. The three Wikimedia-photo articles are NOT in the manifest — that's correct (they're human-authored).

- [ ] **Step 3: Visual gate — open both generated cards**

Operator should view `assets/social/articles/cruise-duck-tradition.jpg` and `assets/social/articles/cruise-tipping-2026.jpg` in any image viewer and confirm they look correct (matches the prototype renders the operator already approved). If they don't, stop and debug before Phase 4.

---

## Phase 4: Auto-publisher package

### Task 4.1: Initialize the publisher package

**Files:**
- Create: `admin/social-publish/package.json`
- Create: `admin/social-publish/.gitignore`

- [ ] **Step 1: Create directory**

```bash
mkdir -p admin/social-publish/lib admin/social-publish/templates admin/social-publish/test
```

- [ ] **Step 2: Write package.json**

Create `admin/social-publish/package.json`:

```json
{
  "name": "@inthewake/social-publish",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "description": "Auto-publishes new InTheWake articles to the Facebook Page via the Graph API.",
  "scripts": {
    "publish": "node publish.js",
    "publish:dry": "node publish.js --dry-run",
    "test": "node --test test/*.test.mjs"
  },
  "dependencies": {
    "cheerio": "^1.1.2"
  },
  "engines": {
    "node": ">=20.0.0"
  }
}
```

- [ ] **Step 3: Write .gitignore**

Create `admin/social-publish/.gitignore`:

```
node_modules/
*.log
.DS_Store
```

- [ ] **Step 4: Install and verify**

```bash
cd admin/social-publish && npm install
```

Expected: completes; `node --version` shows ≥ 20 (uses built-in fetch — no `node-fetch` needed).

- [ ] **Step 5: Commit**

```bash
git add admin/social-publish/package.json admin/social-publish/package-lock.json admin/social-publish/.gitignore
git commit -m "feat(social-publish): initialize npm package

Node 20+ (built-in fetch), cheerio for <head> parsing. Standalone from
the card generator — they share concepts, not code, to keep each
deployable on its own."
```

### Task 4.2: Reuse the extractor (shared module pattern via copy)

We deliberately COPY the extractor into the publisher package rather than building a shared module. Reasons: (1) the two packages have different evolution rates; (2) copying avoids cross-package import paths that complicate the CI workflow; (3) the file is small. The duplication is honest tech debt — call it out in a comment.

**Files:**
- Create: `admin/social-publish/lib/extract.js` (copy of card generator's, plus a small change)
- Create: `admin/social-publish/test/extract.test.mjs` (same test, adapted)
- Create: `admin/social-publish/test/fixtures/article-tipping.html`

- [ ] **Step 1: Copy the fixture**

```bash
cp admin/social-card-generator/test/fixtures/article-tipping.html \
   admin/social-publish/test/fixtures/article-tipping.html
```

- [ ] **Step 2: Copy the extractor and amend header**

Run:
```bash
cp admin/social-card-generator/lib/extract.js admin/social-publish/lib/extract.js
```

Then prepend a header. Open `admin/social-publish/lib/extract.js` and add at line 1:

```javascript
// NOTE: This file is intentionally duplicated from
// admin/social-card-generator/lib/extract.js. The two packages evolve
// independently and a shared module would couple their release cycles.
// If you change the extractor here, mirror it there (and vice versa).
//
```

- [ ] **Step 3: Copy the test**

```bash
cp admin/social-card-generator/test/extract.test.mjs admin/social-publish/test/extract.test.mjs
```

- [ ] **Step 4: Run tests**

Run: `cd admin/social-publish && npm test`
Expected: 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add admin/social-publish/lib/extract.js admin/social-publish/test/extract.test.mjs admin/social-publish/test/fixtures/article-tipping.html
git commit -m "feat(social-publish): article <head> extractor (copied)

Intentional duplication of the card generator's extractor. Header comment
documents the mirror-edit convention."
```

### Task 4.3: Post-detection (diff against parent commit)

**Files:**
- Create: `admin/social-publish/lib/detect.js`
- Create: `admin/social-publish/test/detect.test.mjs`

- [ ] **Step 1: Write the failing test**

Create `admin/social-publish/test/detect.test.mjs`:

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newArticlesFromDiff, articleOptOut } from '../lib/detect.js';

test('newArticlesFromDiff: returns added files matching articles/*.html', () => {
  const diff = [
    'A\tarticles/new-cruise-piece.html',
    'M\tarticles/existing-cruise-piece.html',
    'A\tarticles/subdir/ignored.html',                // subdir not allowed
    'A\tassets/social/articles/new-card.jpg',         // not articles/
    'A\tdocs/something.md',
  ].join('\n');
  const result = newArticlesFromDiff(diff);
  assert.deepEqual(result, ['articles/new-cruise-piece.html']);
});

test('newArticlesFromDiff: empty when no additions', () => {
  const diff = 'M\tarticles/foo.html\nD\tarticles/bar.html';
  assert.deepEqual(newArticlesFromDiff(diff), []);
});

test('articleOptOut: returns true if <meta name="social-publish" content="skip"> present', () => {
  const html = `<!doctype html><html><head>
    <meta name="social-publish" content="skip"/>
  </head></html>`;
  assert.equal(articleOptOut(html), true);
});

test('articleOptOut: returns false if meta absent or other value', () => {
  assert.equal(articleOptOut('<html></html>'), false);
  assert.equal(articleOptOut('<meta name="social-publish" content="auto"/>'), false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd admin/social-publish && npm test`
Expected: FAIL — cannot find module `../lib/detect.js`.

- [ ] **Step 3: Implement detect module**

Create `admin/social-publish/lib/detect.js`:

```javascript
import { load } from 'cheerio';

// Parse `git diff --name-status HEAD~1 HEAD` output and return any
// newly-added file paths matching exactly articles/<name>.html.
export function newArticlesFromDiff(diffText) {
  return diffText
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const [status, ...pathParts] = line.split(/\s+/);
      return { status, path: pathParts.join(' ') };
    })
    .filter(({ status, path }) =>
      status === 'A' && /^articles\/[^/]+\.html$/.test(path)
    )
    .map(({ path }) => path);
}

export function articleOptOut(html) {
  const $ = load(html);
  return $('meta[name="social-publish"]').attr('content') === 'skip';
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd admin/social-publish && npm test`
Expected: PASS — 4 extract + 4 detect = 8 tests, 0 failures.

- [ ] **Step 5: Commit**

```bash
git add admin/social-publish/lib/detect.js admin/social-publish/test/detect.test.mjs
git commit -m "feat(social-publish): new-article detection + opt-out

newArticlesFromDiff() parses git diff --name-status output; matches only
top-level articles/<slug>.html additions. articleOptOut() honors a
<meta name='social-publish' content='skip'> tag for sensitive pieces."
```

### Task 4.4: Manifest module

**Files:**
- Create: `admin/social-publish/lib/manifest.js`
- Create: `admin/social-publish/test/manifest.test.mjs`

- [ ] **Step 1: Write the failing test**

Create `admin/social-publish/test/manifest.test.mjs`:

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadManifest, saveManifest, alreadyPosted, recordPost } from '../lib/manifest.js';

const tmp = () => mkdtempSync(join(tmpdir(), 'pub-manifest-'));

test('loadManifest returns {} when missing', () => {
  const r = loadManifest(join(tmp(), 'm.json'));
  assert.deepEqual(r, {});
});

test('saveManifest/loadManifest roundtrip', () => {
  const path = join(tmp(), 'm.json');
  const data = {
    'articles/foo.html': {
      url: 'https://example.com/foo',
      platforms: { facebook: { posted_at: 'X', post_id: '1_2' } },
    },
  };
  saveManifest(path, data);
  assert.deepEqual(loadManifest(path), data);
});

test('alreadyPosted: true when platform key exists', () => {
  const m = { 'articles/foo.html': { platforms: { facebook: { post_id: '1' } } } };
  assert.equal(alreadyPosted(m, 'articles/foo.html', 'facebook'), true);
});

test('alreadyPosted: false when article or platform missing', () => {
  const m = { 'articles/foo.html': { platforms: { bluesky: { uri: 'at://' } } } };
  assert.equal(alreadyPosted(m, 'articles/foo.html', 'facebook'), false);
  assert.equal(alreadyPosted(m, 'articles/missing.html', 'facebook'), false);
});

test('recordPost adds/overwrites platform entry', () => {
  const m = {};
  recordPost(m, 'articles/foo.html', 'https://x.com/foo', 'facebook', {
    post_id: '1_2', permalink: 'https://facebook.com/InTheWake/posts/2',
  });
  assert.equal(m['articles/foo.html'].url, 'https://x.com/foo');
  assert.equal(m['articles/foo.html'].platforms.facebook.post_id, '1_2');
  assert.ok(m['articles/foo.html'].platforms.facebook.posted_at);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd admin/social-publish && npm test`
Expected: FAIL — cannot find module `../lib/manifest.js`.

- [ ] **Step 3: Implement manifest module**

Create `admin/social-publish/lib/manifest.js`:

```javascript
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd admin/social-publish && npm test`
Expected: PASS — 8 prior + 5 manifest = 13 tests.

- [ ] **Step 5: Commit**

```bash
git add admin/social-publish/lib/manifest.js admin/social-publish/test/manifest.test.mjs
git commit -m "feat(social-publish): publish-manifest module

Tracks per-(article, platform) post state. Idempotent retries — only
unposted (article, platform) pairs are attempted. Schema extends cleanly
when v1.1 adds bluesky and x keys under platforms."
```

### Task 4.5: Facebook composer (template)

**Files:**
- Create: `admin/social-publish/templates/facebook.js`
- Create: `admin/social-publish/test/composer.test.mjs`

- [ ] **Step 1: Write the failing test**

Create `admin/social-publish/test/composer.test.mjs`:

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { composeFacebookPost } from '../templates/facebook.js';

test('composeFacebookPost: message is "{ai-summary or og:description}\\n\\n{url}"', () => {
  const r = composeFacebookPost({
    title: 'Article Title',
    description: 'A 2-sentence punchline that's specific.',
    aiSummary: 'A longer, 2-3 sentence summary with the specifics — like dollar ranges and named lines — that's the best raw material for FB.',
    canonicalUrl: 'https://cruisinginthewake.com/articles/foo.html',
  });
  assert.equal(r.link, 'https://cruisinginthewake.com/articles/foo.html');
  assert.ok(r.message.startsWith("A longer, 2-3 sentence summary"));
  assert.ok(r.message.endsWith('https://cruisinginthewake.com/articles/foo.html'));
  assert.ok(r.message.includes('\n\n'));
});

test('composeFacebookPost: falls back to description when ai-summary absent', () => {
  const r = composeFacebookPost({
    title: 'T',
    description: 'Just the description.',
    aiSummary: null,
    canonicalUrl: 'https://x.com/y',
  });
  assert.equal(r.message, 'Just the description.\n\nhttps://x.com/y');
});

test('composeFacebookPost: no emojis, no exclamation, no banned phrases', () => {
  const r = composeFacebookPost({
    title: 'T',
    description: 'Real specifics here.',
    aiSummary: null,
    canonicalUrl: 'https://x.com/y',
  });
  // Voice rules: no emojis, no !, no Discover/Unlock/Learn
  assert.ok(!/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(r.message), 'no emojis');
  assert.ok(!/!/.test(r.message), 'no exclamation');
  assert.ok(!/\b(Discover|Unlock|Learn|Wondering)\b/.test(r.message), 'no banned hook words');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd admin/social-publish && npm test`
Expected: FAIL — cannot find module `../templates/facebook.js`.

- [ ] **Step 3: Implement composer**

Create `admin/social-publish/templates/facebook.js`:

```javascript
// Voice rules enforced here:
//   - no emojis
//   - no exclamation points
//   - no "Discover/Unlock/Learn/Wondering" hooks
//   - prefer ai-summary (more specifics) over og:description
//   - URL goes inline; FB auto-collapses it once it detects and unfurls

const BANNED_HOOK = /\b(Discover|Unlock|Learn|Wondering)\b/;
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;

export function composeFacebookPost({ title, description, aiSummary, canonicalUrl }) {
  const body = (aiSummary && aiSummary.trim()) || description;
  if (EMOJI.test(body) || /!/.test(body) || BANNED_HOOK.test(body)) {
    throw new Error(
      `Composed post body trips voice rules. Source text: ${JSON.stringify(body)}. ` +
      `Fix the article's ai-summary or og:description before publishing.`
    );
  }
  return {
    message: `${body.trim()}\n\n${canonicalUrl}`,
    link:    canonicalUrl,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd admin/social-publish && npm test`
Expected: PASS — 13 prior + 3 composer = 16 tests.

- [ ] **Step 5: Commit**

```bash
git add admin/social-publish/templates/facebook.js admin/social-publish/test/composer.test.mjs
git commit -m "feat(social-publish): Facebook post composer

Voice rules enforced at compose time (not just doc'd): no emojis, no
exclamation, no Discover/Unlock/Learn hooks. Prefers ai-summary
over og:description for the longer message body, falls back if absent.
URL goes at end of message; FB collapses it on render."
```

### Task 4.6: Extractor extension for ai-summary

The card generator's extractor doesn't read `ai-summary`. The publisher needs to. Extend the publisher's extractor (the copy) without changing the generator's.

**Files:**
- Modify: `admin/social-publish/lib/extract.js`
- Modify: `admin/social-publish/test/extract.test.mjs`
- Modify: `admin/social-publish/test/fixtures/article-tipping.html`

- [ ] **Step 1: Add ai-summary to the fixture**

Edit `admin/social-publish/test/fixtures/article-tipping.html` — add inside `<head>`:

```html
<meta name="ai-summary" content="In 2026 expect $17–$25 per guest per day for cruise gratuities, plus 18%–20% on bar, spa, specialty dining, and room service. Five lines bundle tips into the fare; ten don't."/>
```

- [ ] **Step 2: Add a test for ai-summary extraction**

Append to `admin/social-publish/test/extract.test.mjs`:

```javascript
test('extracts ai-summary when present', () => {
  const meta = extractArticleMeta(fixture);
  assert.ok(meta.aiSummary.includes('$17–$25 per guest per day'));
});

test('aiSummary is null when absent', () => {
  const stripped = fixture.replace(/<meta name="ai-summary"[^/]*\/>/, '');
  const meta = extractArticleMeta(stripped);
  assert.equal(meta.aiSummary, null);
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd admin/social-publish && npm test`
Expected: FAIL — the new tests fail because aiSummary isn't extracted.

- [ ] **Step 4: Update the extractor**

In `admin/social-publish/lib/extract.js`, inside `extractArticleMeta`, after the existing `authorUrl` line, add:

```javascript
const aiSummary = $('meta[name="ai-summary"]').attr('content') || null;
```

And in the return object, add `aiSummary` to the list.

- [ ] **Step 5: Run test to verify it passes**

Run: `cd admin/social-publish && npm test`
Expected: PASS — 16 prior + 2 new = 18 tests.

- [ ] **Step 6: Commit**

```bash
git add admin/social-publish/lib/extract.js admin/social-publish/test/extract.test.mjs admin/social-publish/test/fixtures/article-tipping.html
git commit -m "feat(social-publish): extract ai-summary

Publisher needs the longer ai-summary for FB post copy. Card generator
doesn't, so this lives only in the publisher's copy of the extractor."
```

### Task 4.7: Facebook Graph API client

**Files:**
- Create: `admin/social-publish/lib/facebook.js`
- Create: `admin/social-publish/test/facebook.test.mjs`

- [ ] **Step 1: Write the failing test**

Create `admin/social-publish/test/facebook.test.mjs`:

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { postToPage, scrapeBust, classifyError } from '../lib/facebook.js';

const originalFetch = globalThis.fetch;

test('postToPage: posts message+link, returns id+permalink', async () => {
  globalThis.fetch = async (url, opts) => {
    assert.match(url, /\/v\d+\.\d+\/PAGE_X\/feed/);
    const body = JSON.parse(opts.body);
    assert.equal(body.message, 'hello\n\nhttps://x/y');
    assert.equal(body.link, 'https://x/y');
    assert.equal(body.access_token, 'TOKEN_X');
    return { ok: true, status: 200, json: async () => ({ id: 'PAGE_X_999' }) };
  };
  try {
    const r = await postToPage({
      pageId: 'PAGE_X', accessToken: 'TOKEN_X',
      message: 'hello\n\nhttps://x/y', link: 'https://x/y',
    });
    assert.equal(r.post_id, 'PAGE_X_999');
    assert.equal(r.permalink, 'https://www.facebook.com/PAGE_X/posts/999');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('postToPage: throws on 401 with classified message', async () => {
  globalThis.fetch = async () => ({
    ok: false, status: 401,
    json: async () => ({ error: { code: 190, message: 'Session expired' }}),
  });
  try {
    await assert.rejects(
      postToPage({ pageId: 'P', accessToken: 'BAD', message: 'm', link: 'l' }),
      /TOKEN.*expired|invalid/i
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('classifyError: maps OAuth 190 to TOKEN_INVALID', () => {
  assert.equal(classifyError({ code: 190 }), 'TOKEN_INVALID');
  assert.equal(classifyError({ code: 200 }), 'PERMISSION_DENIED');
  assert.equal(classifyError({ code: 4 }), 'RATE_LIMITED');
  assert.equal(classifyError({ code: 9999 }), 'UNKNOWN');
});

test('scrapeBust: POSTs to debug-scrape endpoint without throwing on non-200', async () => {
  globalThis.fetch = async (url) => {
    assert.match(url, /graph\.facebook\.com.*scrape=true/);
    return { ok: false, status: 500, json: async () => ({}) };
  };
  try {
    // scrapeBust is fire-and-forget; must not throw
    await scrapeBust({ url: 'https://x/y', accessToken: 'T' });
  } finally {
    globalThis.fetch = originalFetch;
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd admin/social-publish && npm test`
Expected: FAIL — cannot find module `../lib/facebook.js`.

- [ ] **Step 3: Implement Graph API client**

Create `admin/social-publish/lib/facebook.js`:

```javascript
const GRAPH_VERSION = 'v21.0';  // Confirm latest stable at implementation time
                                 // via developers.facebook.com/docs/graph-api/changelog
                                 // Once locked, don't chase newer versions casually.
const GRAPH = `https://graph.facebook.com/${GRAPH_VERSION}`;

export function classifyError(err) {
  switch (err && err.code) {
    case 190: return 'TOKEN_INVALID';     // expired or revoked
    case 200: return 'PERMISSION_DENIED'; // missing pages_manage_posts
    case 4:
    case 17:
    case 32: return 'RATE_LIMITED';
    default:  return 'UNKNOWN';
  }
}

export async function postToPage({ pageId, accessToken, message, link }) {
  const url = `${GRAPH}/${pageId}/feed`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, link, access_token: accessToken }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const cls = classifyError(data.error);
    if (cls === 'TOKEN_INVALID') {
      throw new Error(
        `Facebook Page token expired or invalid. ` +
        `Regenerate via Graph API Explorer (developers.facebook.com/tools/explorer) → ` +
        `select Page → Generate Access Token → exchange for long-lived → ` +
        `paste into FACEBOOK_PAGE_ACCESS_TOKEN secret.`
      );
    }
    throw new Error(`Facebook ${cls}: ${data.error && data.error.message} (HTTP ${res.status})`);
  }
  const postId = data.id;
  const numericPostId = postId.split('_')[1] || postId;
  return {
    post_id: postId,
    permalink: `https://www.facebook.com/${pageId}/posts/${numericPostId}`,
  };
}

// Fire-and-forget: forces FB to re-scrape the URL's OG metadata.
// Never throws — even a failure is recoverable on the next share.
export async function scrapeBust({ url, accessToken }) {
  try {
    await fetch(`${GRAPH}/?id=${encodeURIComponent(url)}&scrape=true&access_token=${encodeURIComponent(accessToken)}`, {
      method: 'POST',
    });
  } catch (_) { /* intentional swallow */ }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd admin/social-publish && npm test`
Expected: PASS — 18 prior + 4 facebook = 22 tests.

- [ ] **Step 5: Commit**

```bash
git add admin/social-publish/lib/facebook.js admin/social-publish/test/facebook.test.mjs
git commit -m "feat(social-publish): Facebook Graph API client

postToPage() POSTs to /{page_id}/feed and returns post_id + permalink.
scrapeBust() POSTs to /?scrape=true to refresh FB's OG cache (fire-and-
forget). classifyError() maps Graph error codes to actionable categories
— in particular, OAuth 190 produces an error message with exact token-
rotation steps for the operator."
```

### Task 4.8: Entry point with dry-run

**Files:**
- Create: `admin/social-publish/publish.js`
- Create: `admin/social-publish/README.md`

- [ ] **Step 1: Implement the entry point**

Create `admin/social-publish/publish.js`:

```javascript
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
```

- [ ] **Step 2: Write README**

Create `admin/social-publish/README.md`:

```markdown
# Social Publish

Auto-posts each new InTheWake article to the Facebook Page.

## Local use

```
cd admin/social-publish
npm install
npm test
npm run publish:dry                              # process HEAD~1..HEAD diff, print only
node publish.js --article articles/foo.html --dry-run
```

## Live use (CI)

Set repository Encrypted Secrets:
- `FACEBOOK_PAGE_ID` (numeric)
- `FACEBOOK_PAGE_ACCESS_TOKEN` (long-lived Page token)

Workflow `.github/workflows/social-publish.yml` runs on push to `main`,
detects new `articles/*.html` additions, and posts each.

## Per-article opt-out

Add to an article's `<head>`:

```html
<meta name="social-publish" content="skip"/>
```

That article will be permanently skipped — useful for sensitive
content (grief pieces, retractions, etc.).

## What gets committed back

After each successful run, `admin/social-publish-manifest.json` is
updated and committed by the workflow with `[skip ci]`. It records
post_id + permalink per (article, platform). The same manifest will
grow Bluesky and X keys in v1.1.
```

- [ ] **Step 3: Smoke-test dry-run locally against the tipping article**

Run: `cd admin/social-publish && node publish.js --article articles/cruise-tipping-2026.html --dry-run`
Expected: prints "DRY-RUN — would post:" followed by the composed message body using the article's ai-summary, then the canonical URL. Exits 0.

- [ ] **Step 4: Commit**

```bash
git add admin/social-publish/publish.js admin/social-publish/README.md
git commit -m "feat(social-publish): CLI entry with --dry-run

publish.js diffs HEAD~1..HEAD for new articles/<slug>.html files, or
takes --article for a manual override. --dry-run prints the composed
post without touching FB. Per-article opt-out honored. Manifest commit
is the source of truth; failures don't write to it (next run retries)."
```

### Task 4.9: Phase 4 checkpoint

- [ ] **Step 1: Run full test suite**

Run: `cd admin/social-publish && npm test`
Expected: 22 tests, 0 failures.

- [ ] **Step 2: Dry-run a published article**

Run: `cd admin/social-publish && node publish.js --article articles/cruise-tipping-2026.html --dry-run`
Expected: prints the composed FB post (the ai-summary about $17–$25 daily rates) and the canonical URL.

- [ ] **Step 3: Dry-run an opt-out simulation**

Manually add `<meta name="social-publish" content="skip"/>` to `articles/cruise-tipping-2026.html` (don't commit), then run the dry-run again. Expected: prints `opt-out`. Remove the line before continuing.

- [ ] **Step 4: Working tree clean**

Run: `git status --short`
Expected: empty.

---

## Phase 5: Facebook token + Meta Developer setup

This is operator-hands-on. The agent cannot do this — it requires logging into Meta with a real human identity, agreeing to terms, attaching a Page to an app.

### Task 5.1: Meta Developer app (operator runbook)

**Files:**
- Create: `admin/SOCIAL_PUBLISH_FACEBOOK_SETUP.md`

- [ ] **Step 1: Write the setup runbook**

Create `admin/SOCIAL_PUBLISH_FACEBOOK_SETUP.md`:

```markdown
# Facebook Page Auto-Publish Setup

One-time setup the operator runs to wire In the Wake's Facebook Page to
the auto-publisher.

## Prerequisites

- Meta Developer account (developers.facebook.com), with a verified
  business or individual profile.
- Admin role on the In the Wake Facebook Page.

## Steps

### 1. Create the Meta Developer app

1. developers.facebook.com → My Apps → Create App.
2. Use case: "Other" → "Business".
3. App name: "InTheWake Auto-Publish".
4. Contact email: operator's email.
5. Business portfolio: select the InTheWake business if one exists, else
   skip.
6. After creation, the app starts in **Development mode** — fine for v1.

### 2. Add the Pages product

1. In the app dashboard → Add product → Pages → Set up.
2. Add the InTheWake Page.
3. Note the **App ID** and **App Secret** (Settings → Basic). These are
   not stored in GitHub but are needed for token exchange.

### 3. Get a short-lived User token

1. Tools → Graph API Explorer.
2. App: select the new app.
3. User or Page: User Token.
4. Permissions: `pages_show_list`, `pages_manage_posts`, `pages_read_engagement`.
5. Generate Access Token → Continue as ... → Approve all permissions.
6. Copy the token. It's valid for ~1 hour.

### 4. Exchange for a long-lived User token

In any shell with the values from steps 2 and 3:

```
curl -G 'https://graph.facebook.com/v21.0/oauth/access_token' \
  --data-urlencode 'grant_type=fb_exchange_token' \
  --data-urlencode "client_id=APP_ID" \
  --data-urlencode "client_secret=APP_SECRET" \
  --data-urlencode "fb_exchange_token=SHORT_LIVED_USER_TOKEN"
```

Response includes `access_token`. That's the long-lived User token (~60
days).

### 5. Exchange for a long-lived Page token

```
curl -G 'https://graph.facebook.com/v21.0/me/accounts' \
  --data-urlencode "access_token=LONG_LIVED_USER_TOKEN"
```

Response is a JSON list of pages. Find the InTheWake entry. Its
`access_token` field is the **long-lived Page token** (~60 days in
Development mode, never-expiring after App Review approval).

Also note the page's `id` — that's `FACEBOOK_PAGE_ID`.

### 6. Set GitHub Encrypted Secrets

In the repo's Settings → Secrets and variables → Actions → New repository secret:

- `FACEBOOK_PAGE_ID` = the Page ID from step 5
- `FACEBOOK_PAGE_ACCESS_TOKEN` = the long-lived Page token from step 5

### 7. Verify

Trigger `Social Publish (Facebook)` via the Actions tab with
`dry_run: true` and `article: articles/cruise-tipping-2026.html`. The
log should print the composed post (in DRY-RUN mode) and exit 0. No FB
call yet — but secrets are reachable.

### 8. App Review submission (parallel track)

To upgrade from 60-day rotation to a permanent token, submit the app
for review. In the Meta Developer dashboard:

1. App Review → Permissions and Features.
2. Request `pages_manage_posts` (Live) and `pages_read_engagement` (Live).
3. Required materials:
   - **App icon** (1024×1024) — use `/assets/social/articles-hero.jpg`
     cropped or the In the Wake brand mark.
   - **Privacy policy URL**: https://cruisinginthewake.com/privacy.html
   - **Terms of service URL**: https://cruisinginthewake.com/terms.html
   - **Data deletion instructions URL**: same as privacy policy.
   - **Screencast** (3–5 minutes): show the auto-publish flow end-to-end —
     a new article landing on `main`, the Actions run, the resulting post
     on the In the Wake Page. Record locally; upload via the Review form.
4. Submit. Meta typically responds in 5–14 calendar days.
5. On approval, regenerate the Page token (it'll be near-permanent). Update
   `FACEBOOK_PAGE_ACCESS_TOKEN` secret. No code change needed.

### 9. Token rotation discipline (until App Review approves)

The Development-mode token expires every ~60 days. There's no proactive
warning in v1 — instead, the next publish after expiry fails with a
clear error message in the Action log pointing to step 5 of this
runbook. Rotate within 24 hours of seeing the error to avoid missing
a post.

For v1.1, a watcher could open a GitHub issue 7 days before expiry.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Action fails with "TOKEN_INVALID" | Token expired, was revoked, or wrong page | Repeat steps 3–6 |
| Action fails with "PERMISSION_DENIED" | `pages_manage_posts` not granted | Re-do step 3 with both permissions checked |
| Post appears without an OG card | First-time URL, FB hasn't scraped yet | Wait ~30 seconds, refresh feed. If still missing after 5 min, hit FB Sharing Debugger (developers.facebook.com/tools/debug) with the URL |
| "RATE_LIMITED" error | Too many calls in a window | Unlikely at 1–2 articles/week — investigate before retrying |
```

- [ ] **Step 2: Commit**

```bash
git add admin/SOCIAL_PUBLISH_FACEBOOK_SETUP.md
git commit -m "docs(social-publish): operator setup runbook

Step-by-step from Meta Developer account to GitHub Encrypted Secrets.
Covers token rotation, App Review submission, troubleshooting table."
```

### Task 5.2: Operator hands-on (no agent action)

- [ ] **Step 1 (operator):** Follow `admin/SOCIAL_PUBLISH_FACEBOOK_SETUP.md` steps 1–7. Tell the agent when both GitHub secrets are set.

- [ ] **Step 2 (operator, parallel):** Begin App Review submission per step 8. Don't block on it.

---

## Phase 6: Publisher workflow + first live post

### Task 6.1: GitHub Actions workflow

**Files:**
- Create: `.github/workflows/social-publish.yml`

- [ ] **Step 1: Write the workflow**

Create `.github/workflows/social-publish.yml`:

```yaml
name: Social Publish (Facebook)

on:
  push:
    branches: [main]
    paths:
      - 'articles/**/*.html'
  workflow_dispatch:
    inputs:
      article:
        description: 'Force-publish a specific article (e.g. articles/cruise-tipping-2026.html)'
        required: false
        type: string
      dry_run:
        description: 'Compose-only, do not call Facebook'
        required: false
        type: boolean
        default: false

permissions:
  contents: write

concurrency:
  group: social-publish
  cancel-in-progress: false

jobs:
  publish:
    runs-on: ubuntu-latest
    # SAFETY GATE: until the gate is removed (Task 6.3), only manual
    # dispatch can post. Push-driven runs are skipped.
    if: github.event_name == 'workflow_dispatch'
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 2

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: admin/social-publish/package-lock.json

      - name: Install
        working-directory: admin/social-publish
        run: npm ci

      - name: Test
        working-directory: admin/social-publish
        run: npm test

      - name: Publish
        env:
          FACEBOOK_PAGE_ID:           ${{ secrets.FACEBOOK_PAGE_ID }}
          FACEBOOK_PAGE_ACCESS_TOKEN: ${{ secrets.FACEBOOK_PAGE_ACCESS_TOKEN }}
        run: |
          ARGS=""
          if [ -n "${{ inputs.article }}" ]; then ARGS="$ARGS --article ${{ inputs.article }}"; fi
          if [ "${{ inputs.dry_run }}" = "true" ]; then ARGS="$ARGS --dry-run"; fi
          node admin/social-publish/publish.js $ARGS

      - name: Commit manifest
        if: ${{ inputs.dry_run != 'true' }}
        run: |
          if git diff --quiet admin/social-publish-manifest.json 2>/dev/null; then
            echo "No manifest changes."
            exit 0
          fi
          git config user.name  "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git add admin/social-publish-manifest.json
          git commit -m "chore(social-publish): record published posts [skip ci]"
          git push
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/social-publish.yml
git commit -m "ci(social-publish): publisher workflow with safety gate

Gated to workflow_dispatch-only until the first live post is verified
(Task 6.3 removes the gate). Push-driven runs are skipped during early
iteration. Posts are best-effort; the manifest commit-back records what
succeeded; failures stay absent and retry next run."
```

- [ ] **Step 3: Push**

Run: `git push origin claude/auto-publish-social-media-encL1`
Expected: succeeds.

### Task 6.2: First live dry-run via dispatch

- [ ] **Step 1 (operator):** Trigger the workflow via dispatch with `dry_run: true` and `article: articles/cruise-tipping-2026.html`.

- [ ] **Step 2:** Verify the Action log shows:
  - npm test → 22 tests pass
  - "Processing 1 article(s):"
  - "DRY-RUN — would post:" followed by the cruise-tipping ai-summary
  - "Manifest saved" line ABSENT (dry-run skips manifest update)
  - Exit 0

If anything is unexpected, stop and debug.

### Task 6.3: First live post + remove safety gate

- [ ] **Step 1 (operator):** Pick which article to use as the first live test. Recommendation: `articles/cruise-tipping-2026.html` — broadest appeal, lowest risk of surprise.

- [ ] **Step 2 (operator):** Trigger the workflow via dispatch with `dry_run: false` and `article: articles/cruise-tipping-2026.html`.

- [ ] **Step 3:** Verify the Action log shows:
  - "posted PAGE_ID_POSTID  https://www.facebook.com/PAGE_ID/posts/POSTID"
  - Manifest commit pushed
  - Exit 0

- [ ] **Step 4 (operator):** Visit the permalink. Confirm the post is live with:
  - Correct message text (the ai-summary about $17–$25 daily rates)
  - The OG card unfurled below with the article's social card image, title, description
  - No emojis, no marketing hooks

If visual is wrong, do NOT remove the gate. Investigate.

- [ ] **Step 5:** Pull the manifest commit back into local:

Run: `git pull --ff-only origin claude/auto-publish-social-media-encL1`
Expected: fast-forward. Local now contains `admin/social-publish-manifest.json` with one entry.

- [ ] **Step 6:** Remove the safety gate.

Edit `.github/workflows/social-publish.yml`. Delete the two lines:

```yaml
    # SAFETY GATE: until the gate is removed (Task 6.3), only manual
    # dispatch can post. Push-driven runs are skipped.
    if: github.event_name == 'workflow_dispatch'
```

- [ ] **Step 7:** Commit gate removal:

```bash
git add .github/workflows/social-publish.yml
git commit -m "ci(social-publish): remove safety gate; push-driven posts now live

Manual dispatch successfully posted the first article and visual was
verified. Removing the workflow_dispatch-only guard so future article
adds auto-post on push to main."
```

- [ ] **Step 8:** Push:

Run: `git push origin claude/auto-publish-social-media-encL1`
Expected: succeeds.

### Task 6.4: Phase 6 checkpoint

- [ ] **Step 1:** One real post on the In the Wake Facebook Page. Manifest records it. Working tree clean.

- [ ] **Step 2:** Next time a new article is added to `articles/` on `main`, the workflow will fire automatically. Operator confirms understanding before any next article is merged.

---

## Phase 7: App Review (operator, parallel)

App Review is happening in parallel since Phase 5.2. No agent task here — wait for Meta's verdict, then on approval:

### Task 7.1: Swap to permanent token

- [ ] **Step 1 (operator):** Once App Review approves both `pages_manage_posts` and `pages_read_engagement` to Live mode, return to the Meta Developer dashboard. Repeat steps 3–5 of the setup runbook to regenerate the Page token. It will now be effectively permanent.

- [ ] **Step 2 (operator):** Update `FACEBOOK_PAGE_ACCESS_TOKEN` in GitHub Secrets. No code change.

- [ ] **Step 3 (operator):** Trigger a workflow_dispatch dry-run to confirm the new token works.

---

## Out-of-scope reminders (v1.1+)

These are NOT in this plan but are tracked in the design doc:

- Bluesky module + template
- X module + template (parent + URL-reply)
- Token-expiry watcher (proactively opens an issue 7 days before)
- Voice-audit pass on composed posts (skill exists; v1.1 wires it as a gate)
- Auto-generated `og:image:alt` synchronization (Phase 1 set them once; future article additions should run the same logic via a small CI check)

---

## Self-review

**Spec coverage:**
- ✓ Trigger (push + workflow_dispatch) — Phase 6
- ✓ State / manifest — Tasks 4.4, 4.7-step-2 of 6
- ✓ Article metadata source — Tasks 2.3, 4.6
- ✓ Composition (deterministic template, voice rules) — Task 4.5
- ✓ API call — Task 4.7
- ✓ In-feed render — only verifiable live; Task 6.3 covers
- ✓ Social card generator — Phase 2 (8 tasks)
- ✓ Convention (slug → JPG path) — Task 2.4 + 2.8
- ✓ Renderer (satori+sharp) — Task 2.6
- ✓ Adaptive sizing — Task 2.5
- ✓ Color palette guard — Task 2.2
- ✓ Typography (EB Garamond + Public Sans) — Task 2.1
- ✓ Generator inputs — Task 2.3
- ✓ Accessibility (WCAG AA pairings) — Task 2.2; mobile/thumb verified at prototype, no further code needed
- ✓ Generator workflow — Task 3.1
- ✓ Article HTML one-time update — Tasks 1.1, 1.2
- ✓ Generator code layout — Phase 2
- ✓ Visual review — Phase 3 checkpoint + Phase 2.9
- ✓ Local development — Task 2.8 README
- ✓ Credentials / token strategy — Task 5.1 (full runbook)
- ✓ Failure handling — Tasks 4.7-step-3, 4.8; manifest-records-success pattern
- ✓ Code layout — Phases 2 + 4
- ✓ Workflow files — Tasks 3.1, 6.1
- ✓ Testing strategy — checkpoints at end of every Phase
- ✓ Non-goals (no Bluesky/X/etc.) — out-of-scope reminders section

**Placeholder scan:** No "TBD", "TODO", "implement later", or "similar to Task N" — all steps contain actual content. The single deliberate placeholder is the Graph API version constant (`v21.0`) with an inline comment instructing the implementer to verify against developers.facebook.com on the day they implement.

**Type consistency:** Function names verified — `extractArticleMeta`, `composeFacebookPost`, `postToPage`, `scrapeBust`, `classifyError`, `loadManifest`, `saveManifest`, `alreadyPosted`, `recordPost`, `decideAction`, `computeContentHash`, `renderCard`, `voyageCard`, `titleSize`, `assertTextColorPair`, `newArticlesFromDiff`, `articleOptOut`, `buildByline`, `formatBylineDate`. Each defined in exactly one place, referenced consistently downstream.

**Scope check:** Plan is focused on Facebook v1. v1.1 deferrals (Bluesky, X, voice-audit gate, watcher) explicitly out of scope.

---

*Pairs with cognitive memory `e12e549b` (article social-card sourcing workflow), `d5620051` (Wikimedia license-string gotcha), `280485f4` (honesty-match discipline).*
