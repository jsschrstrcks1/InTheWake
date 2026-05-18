# Social Auto-Publish — Facebook (v1) Design

**Date:** 2026-05-16
**Branch:** `claude/auto-publish-social-media-encL1`
**Author:** Drafted with operator (Ken) in brainstorming session
**Status:** Design — ready for implementation plan

> Soli Deo Gloria — built to serve readers, not to feed algorithms.

## Purpose

When a new article is added to `articles/` and pushed to `main`, automatically publish a single Facebook Page post linking to it, with a typographically-generated social card whenever no per-article photograph exists. v1 is Facebook only; Bluesky and X land in v1.1 once accounts are provisioned. The system is designed so v1.1 is purely additive — no architectural rework.

v1 has two cooperating subsystems:

- **Social card generator** (runs in CI, pre-deploy): renders a per-article 1200×630 social card for any article that lacks a real photograph at its canonical `og:image` path. Commits the card back to the repo.
- **Auto-publisher** (runs in CI, post-deploy): detects new articles, composes the Facebook post, calls the Graph API, commits the manifest.

The two subsystems communicate only through the article's `og:image` URL on disk. They share no state.

## Why Facebook first

- ~80% of cruisers are 55+, the demographic most active on Facebook.
- 2026 Facebook algorithm change reversed the prior link-suppression — referral traffic to external sites is up ~4× early this year.
- The existing cruise communities (John Heald's group, Crown & Anchor, etc.) live on Facebook. A Page presence is the prerequisite for ever being shared into those groups.
- Highest expected ROI of the three v1 candidates per the research; also the highest bring-up friction, so doing it first paces the rollout honestly.

## Trigger

GitHub Action on `push` to `main`, plus `workflow_dispatch` for manual control. The Action diffs the just-pushed commit against its parent and identifies *added* files matching `articles/*.html`. Edits to existing articles do **not** re-trigger; a manual dispatch can force a re-post if needed.

`workflow_dispatch` accepts two optional inputs:

- `article_path` — force-publish a specific article (overrides diff detection).
- `dry_run` (boolean) — compose and print the post without calling Facebook.

## State (idempotence)

A committed manifest at `admin/social-publish-manifest.json`:

```json
{
  "articles/cruise-tipping-2026.html": {
    "url": "https://cruisinginthewake.com/articles/cruise-tipping-2026.html",
    "platforms": {
      "facebook": {
        "posted_at": "2026-05-16T14:02:14Z",
        "post_id":   "1234567890_987654321",
        "permalink": "https://www.facebook.com/InTheWake/posts/987654321"
      }
    }
  }
}
```

The Action reads the manifest, posts only `(article, platform)` pairs not yet present, then commits the updated manifest back to `main` with `[skip ci]`. Idempotence falls out of this: a retry only retries what actually failed. Bluesky and X get their own keys under `platforms` in v1.1 — no schema rework.

## Article metadata source

Articles already carry everything we need in `<head>`:

- `og:title` — full editorial title
- `og:description` — 1-sentence punchline
- `meta[name="ai-summary"]` — 2–3 sentence specifics (best raw material for FB)
- `og:image` + `og:image:width` + `og:image:height` + `og:image:alt`
- `link[rel="canonical"]` — the URL we link to

No new authoring requirements. The extractor reads the article HTML with `cheerio`, validates the required tags exist, and exits with non-zero status (logging the list of missing tags) if any are absent. The Action surfaces this in the run summary.

## Composition (deterministic template)

Facebook auto-pulls the OG card from the URL. The post body adds a human sentence above the auto-card. No hashtags (research: they don't help on FB).

```
{ai_summary}

{canonical_url}
```

**Voice rules baked into the template (no exceptions):**

- No emojis.
- No exclamation points.
- No "Discover / Unlock / Learn".
- No fake question hooks.
- Use the article's actual specifics. The `ai-summary` is already in voice; reuse it verbatim.

**Concrete render** for `cruise-tipping-2026.html`:

> In 2026 expect $17–$25 per guest per day for cruise gratuities, plus 18%–20% on bar, spa, specialty dining, and room service. Five lines bundle tips into the fare; ten don't. Rates and child policies broken down across all 15 major lines.
>
> https://cruisinginthewake.com/articles/cruise-tipping-2026.html

## API call

```
POST https://graph.facebook.com/v{CURRENT_GRAPH_API_VERSION}/{PAGE_ID}/feed
  ?access_token={LONG_LIVED_PAGE_TOKEN}
  message={ai_summary}
  link={canonical_url}
```

Response includes `id` of the form `{page_id}_{post_id}`. We construct the permalink as `https://www.facebook.com/{page_id}/posts/{post_id}` and store both in the manifest.

After successful post, fire a fire-and-forget OG-cache-bust call so Facebook re-scrapes our metadata:

```
POST https://graph.facebook.com/?id={canonical_url}&scrape=true&access_token={...}
```

Cheap insurance against stale OG cards from earlier crawls.

## What the post looks like in-feed

```
┌──────────────────────────────────────────────────────┐
│ In the Wake · 3m · 🌐                                │
│                                                      │
│ In 2026 expect $17–$25 per guest per day for cruise  │
│ gratuities, plus 18%–20% on bar, spa, specialty      │
│ dining, and room service. Five lines bundle tips     │
│ into the fare; ten don't. Rates and child policies   │
│ broken down across all 15 major lines.               │
│                                                      │
│ ┌──────────────────────────────────────────────────┐ │
│ │ [ OG image — 1200×630 hero, ~1.91:1 ]            │ │
│ │                                                  │ │
│ │ CRUISINGINTHEWAKE.COM                            │ │
│ │ Cruise Tipping for 2026: What You'll Actually    │ │
│ │ Owe, by Line                                     │ │
│ │ 2026 daily rates across all 15 major lines...    │ │
│ └──────────────────────────────────────────────────┘ │
│                                                      │
│ 👍 ❤️  Like · Comment · Share                        │
└──────────────────────────────────────────────────────┘
```

FB collapses the URL from the message body once it auto-detects it; readers see the `ai-summary` paragraph and the OG card.

**The duck and tipping articles** currently still reference the generic `articles-hero.jpg`. The card generator (next section) writes a typographic card for them at their canonical per-article path, and we'll update their `og:image` meta to point at that path.

## Social card generator

A separate subsystem that renders a 1200×630 typographic JPG for any article that doesn't already have a real photograph as its `og:image`. This section reflects the working prototype (see commit history for the renders).

### Convention

Every article's `og:image` points to `/assets/social/articles/<slug>.jpg`. The generator's behavior is determined by what exists at that path:

- File missing → generator writes a typographic card.
- File present and listed in `assets/social/articles/.generated-manifest.json` → regenerate if article title or description text changed (sha1 comparison).
- File present and NOT in the generated-manifest → author's photograph, leave alone.

This leaves the three Wikimedia-sourced photos (caribbean-cruise-trends-2026, cruise-cabin-organization, cruise-tech-photography-guide) untouched. The duck and tipping articles get generated cards. Future articles default to generated cards unless the author commits a photo to the canonical path before deploy.

### Renderer

`satori` (Vercel's vDOM → SVG) plus `sharp` (SVG → JPG). Pure JS, no headless browser. ~1.5 seconds per card on a GitHub Actions runner. Both libraries are tiny in CI footprint compared to Playwright. The template is a plain JS object tree, not JSX — avoids the React + JSX compiler dependency that JSX form would require.

### Design language

Restraint, not pageantry. The cards use the site's existing visual register (Palatino-family serif title, system-sans subtitle, sea-and-rope palette, compass-rose mark) rather than any specific competitor's signature moves. No ASCII stamp bands, no member badges, no map insets — those belong to other brands.

**Layout (single variant — no "stats" alternate in v1):**

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│  Cruise Tipping for 2026: What                       │  ← title in EB Garamond Bold,
│  You'll Actually Owe, by Line                        │     color --sea, auto-sized
│                                                      │
│  ───  ← 5×84px rope rule                             │
│                                                      │
│  2026 daily rates across all 15 major lines,         │  ← subtitle in Public Sans Regular,
│  plus the auto-grats most calculators miss.          │     color --ink-mid, 32 pt
│                                                      │
│                                  [compass rose]      │  ← inline SVG, 300×300, opacity 0.16
│                                                      │
│  KEN BAKER · 8 MAY 2026         CRUISINGINTHEWAKE.COM│  ← Public Sans 22pt smallcaps,
│                                                      │     color --text-muted
└──────────────────────────────────────────────────────┘
```

The "stats" variant proposed earlier was dropped during prototyping — it added template complexity and a new meta tag for no observable benefit at the 1200×630 size. Stats can live in the article body; the card's job is to make the title sing.

### Adaptive title sizing

Title font size scales by character count to keep the layout balanced across short and long titles:

| Title chars | Title font size |
|---|---|
| ≤ 22 | 104 pt |
| 23–32 | 88 pt |
| 33–48 | 78 pt |
| 49–64 | 68 pt |
| > 64 | 60 pt |

Tuned empirically against EB Garamond Bold at `max-width: 1020 px` on a 1200-px canvas. Verified against 4 real article titles plus a short synthetic test. Subtitle stays fixed at 32 pt.

### Color palette (site tokens only)

| Role | Token | Hex | Used as |
|---|---|---|---|
| Background | `--sky` | `#f7fdff` | Card field |
| Title | `--sea` | `#0a3d62` | Title text on `--sky` — 10.6:1 contrast |
| Subtitle | `--ink-mid` | `#3d5a6a` | Subtitle text on `--sky` — 6.8:1 contrast |
| Byline | `--text-muted` | `#2a4a5a` | Byline + URL on `--sky` — 8.6:1 contrast |
| Rope rule | `--rope` | `#d9b382` | Decorative horizontal rule only (rope-on-pale fails AA for text — must never carry text) |
| Compass | `--accent` + `--sea` | `#0e6e8e`, `#0a3d62` | Native SVG colors at 0.16 element opacity |

No invented colors. No CSS filters (satori doesn't render them).

### Typography

Self-hosted, license-clean, bundled in-repo at `admin/social-card-generator/fonts/`. No remote font fetches at CI time.

- **EB Garamond** (Bold) — display/title. SIL OFL 1.1. Stands in for the site's Palatino-family display stack — same old-style serif silhouette.
- **Public Sans** (Regular) — subtitle, byline, URL. SIL OFL 1.1. Designed as a system-ui-like alternative, matches the site's native sans body stack.

Both are shipped via `@fontsource/eb-garamond` and `@fontsource/public-sans` as WOFF1 (satori-compatible). Prototype confirmed both render correctly through the satori pipeline.

### Generator inputs (read from article `<head>`)

- `og:title` → card title
- `og:description` → subtitle (line-wraps automatically at `max-width: 920 px`)
- Author name — extracted from `article:author` URL slug, or fallback to "Ken Baker"
- `article:published_time` → date (formatted `D MMM YYYY`, uppercased for smallcaps display)

No new meta tags required for v1. The four existing tags every article carries are enough.

### Accessibility

- Auto-generated alt text: `og:image:alt` is set to the article's `og:title` (the most useful single string for a screen-reader user — they hear the article title; the visual card is presentation, not content).
- A CI check verifies every article whose `og:image` points at a generated card has a non-empty `og:image:alt` and `twitter:image:alt`. If missing, the generator writes them; if the article already specifies them, they're preserved.
- All text/background pairings hold WCAG 2.1 AA (4.5:1+ for normal text, 3:1+ for large text). The `--rope` color is barred from text use against pale backgrounds in the renderer (enforced in `lib/render.js` — passing rope as a `color` prop throws).
- Mobile feed legibility verified at 360 px source-rendered (~30% of native): title legible at all four prototype variants; subtitle legible; byline legible (small but clear).
- Push-notification thumbnail (96 px): title silhouette + color block + compass mark carry the recognition; finer text is not the design target at this size.

### Generator workflow

`.github/workflows/social-cards.yml`, triggered on `push: branches: [main]` for changes to `articles/**/*.html`. Steps:

1. Checkout (`fetch-depth: 2`).
2. Node 20 setup, `npm ci` in `admin/social-card-generator/`.
3. For each changed article: read `<head>` metadata; compute `sha1(title + description)`; check `assets/social/articles/.generated-manifest.json`.
4. Decide: skip (file is human photo, not in manifest) / skip (file in manifest and hashes match) / regenerate (file in manifest and hashes differ) / generate (file missing).
5. For each card to (re)generate: render via satori, JPG via sharp (quality 90, progressive, mozjpeg), write to `assets/social/articles/<slug>.jpg`. Force a new content-hashed query string in the article's `og:image` reference (`?v=<sha1[:8]>`) so Facebook re-scrapes — eliminates the cache-staleness problem from the prior spec pass.
6. Update generated-manifest entries.
7. Commit changed JPGs + manifest + any updated `og:image` URLs with `[skip ci]`.

`workflow_dispatch` allows manual run for one article or force-regenerate-all.

### Article HTML one-time update

The duck and tipping articles point `og:image` at the generic `articles-hero.jpg`. Before the generator's first run, update both articles to point at their canonical per-article paths:

- `cruise-duck-tradition.html`: og:image, twitter:image, JSON-LD `image` → `/assets/social/articles/cruise-duck-tradition.jpg`
- `cruise-tipping-2026.html`: same swap → `/assets/social/articles/cruise-tipping-2026.jpg`

First generator run then writes the cards at those paths. Five edits per article (og:image, og:image:alt, twitter:image, twitter:image:alt, JSON-LD image). Done as the first step of the implementation plan.

### Generator code layout

```
admin/social-card-generator/
  generate.js                 # entry; diff detection, manifest, dispatch
  package.json                # deps: satori, sharp, cheerio, @fontsource/eb-garamond, @fontsource/public-sans
  lib/extract.js              # parse article <head> via cheerio
  lib/manifest.js             # .generated-manifest.json read/write
  lib/render.js               # satori call + sharp JPG; titleSize() adaptive sizing
  lib/palette.js              # site tokens + rope-on-pale guard
  templates/voyage-card.js    # the vDOM tree (plain JS objects, no JSX)
  test/render.test.js         # snapshot test against 4 reference articles
```

### Visual review

The generator commits JPGs back to `main` with `[skip ci]`. GitHub renders image diffs side-by-side in the commit view; a maintainer eyeballs unexpected changes before they hit production. No automated visual-regression test in v1 — the human eye is the gate, and the cardset is small enough to scan in seconds.

### Local development

`node admin/social-card-generator/generate.js --article articles/cruise-tipping-2026.html --out /tmp/preview.jpg` renders a single card to an arbitrary path without touching the repo. Use during template iteration; CI-mode commits to `assets/social/articles/`.

## Credentials & token strategy

**Strategy: ship in Development mode, submit for App Review in parallel.**

GitHub Actions Encrypted Secrets:

- `FACEBOOK_PAGE_ID` — numeric Page ID
- `FACEBOOK_PAGE_ACCESS_TOKEN` — long-lived Page token (~60-day life in Development mode; permanent after App Review approval)

**Token lifecycle:**

1. Initial: generate short-lived user token via Graph API Explorer → exchange for long-lived user token → exchange for long-lived Page token → paste into GitHub secret. ~60-day validity.
2. App Review submission runs in parallel. Materials needed: privacy policy URL (exists), data use description, screencast of the integration posting a sample article. Reviewer Q&A typical 1–2 weeks.
3. On approval: regenerate a permanent Page token, update the secret. No code change.

**Token-failure handling:** the `/debug_token` endpoint can preview expiry but requires the FB app secret server-side, which we explicitly choose NOT to ship in this workflow. Instead, on the first Graph API call of each run, an auth-failure response (HTTP 401 / OAuth `code: 190`) triggers an `::error::` line with the exact rotation steps: *"FB Page token expired or invalid. Generate new long-lived Page token via Graph API Explorer, paste into FACEBOOK_PAGE_ACCESS_TOKEN secret. Steps: developers.facebook.com → Tools → Graph API Explorer → select Page → Generate Access Token → exchange via /oauth/access_token endpoint."* The Action then exits non-zero. The lost run is recovered by the next push or manual dispatch after the secret is rotated; manifest idempotence ensures no double-post.

**Secret hygiene:**

- No secrets in logs. The Action does not echo `process.env`.
- Error handlers truncate Facebook response bodies (some echo the access token in error contexts).
- A pre-commit grep guards against accidental token leakage in committed files (pattern: `EAA[A-Za-z0-9]{50,}`).

## Failure handling

- Per-article try/catch. One article's failure does not block other articles in the same run.
- The manifest only records successes. Failures stay absent and are retried on the next run or via manual dispatch.
- Errors are logged with platform name + error class. Response bodies truncated to avoid token leakage.
- Action summary lists every article processed in the run, with status (posted / skipped-already-posted / failed) and permalink for successes.

## Code layout

Node.js under a new `admin/social-publish/` directory matching existing JS tooling conventions (`apply-venue-reviews.js`, `validate-ship-page.js`).

```
admin/social-publish/
  publish.js              # entry; orchestrates detection, composition, posting
  package.json            # deps: cheerio, node-fetch (or built-in fetch on Node 20+)
  lib/extract.js          # parses article <head>: og:*, ai-summary, canonical
  lib/manifest.js         # read/write manifest, decide which articles need work
  lib/compose.js          # platform-specific post bodies from extracted metadata
  lib/facebook.js         # Graph API client: post, scrape-bust, token introspect
  templates/facebook.js   # the post template string (one file per platform)
```

v1.1 adds `lib/bluesky.js` + `lib/x.js` + `templates/bluesky.js` + `templates/x.js`. No changes to `publish.js`, `manifest.js`, `extract.js`. The platform list and composition router are the only edits.

## Workflow files

Two new workflows under `.github/workflows/`. They share a runner image but no state — each reads what the other has committed.

**`.github/workflows/social-cards.yml`** — runs first on every push that touches `articles/`:

- `on: push: branches: [main], paths: [articles/**]` and `workflow_dispatch` with `article_path` + `force_regenerate` inputs
- `permissions: contents: write` (card + manifest commit-back)
- `concurrency: group: social-cards`
- Steps: checkout (`fetch-depth: 2`), Node 20, `npm ci` in `admin/social-card-generator/`, `node generate.js`, commit changed JPGs + generated-manifest with `[skip ci]`
- No external secrets — generator runs entirely offline

**`.github/workflows/social-publish.yml`** — runs on the same trigger, after social-cards completes (workflow chaining via `needs:` is not possible across separate workflows; we use `concurrency` + the manifest's "already-posted" check so order doesn't matter for correctness, but in practice social-cards runs first because it lands its commit before the publish workflow's checkout):

- `on: push: branches: [main]` and `workflow_dispatch` with `article_path` + `dry_run` inputs
- `permissions: contents: write` (manifest commit-back)
- `concurrency: group: social-publish` — never two posts at once
- Steps: checkout (`fetch-depth: 2` for diff), Node 20, `npm ci` in `admin/social-publish/`, `node publish.js`, commit manifest if changed with `[skip ci]`
- Secrets pulled from repo-scoped Encrypted Secrets

**On the ordering question:** if the publish workflow runs before social-cards finishes (race), it just posts using whatever `og:image` is at the canonical path at that moment — either the prior card or, for a brand-new article, a 404 image URL (Facebook's scraper will still post the link, just without a card preview). The next deploy lands the card; the post stays as-is. This is acceptable for v1 — Facebook re-scrapes OG metadata on a cadence anyway. We can revisit in v1.1 if it bites.

## Testing strategy before going live

1. `node publish.js --dry-run` locally — print the composed post for every existing article.
2. `workflow_dispatch` with `dry_run: true` — same thing, but in the Action runner with secrets resolved (verifies environment, doesn't post).
3. `workflow_dispatch` with `article_path: articles/cruise-tipping-2026.html, dry_run: false` — single live post, with the operator watching. Verify in-feed render. Check the permalink.
4. Only after step 3 succeeds and visual is approved: enable push-driven posts. The workflow is wired with `on: push` from the start, but the publish job's first step is a guard — `if: github.event_name == 'workflow_dispatch'` — that skips the job for push events until the guard line is removed in a follow-up commit. This keeps the pipeline fully testable without risking a surprise live post during early iteration.

## Non-goals (v1)

1. No Bluesky, X, LinkedIn, Threads, Instagram, Pinterest, Reddit, Mastodon.
2. No mid-publish image generation. Cards are generated in their own pre-deploy workflow and committed to the repo; the publish workflow reads from disk only.
3. No re-post on article edits. Manual dispatch only.
4. No multi-paragraph threading or carousels.
5. No scheduling — publishes when the article lands.
6. No engagement tracking.
7. No posting to other people's Facebook groups (violates ToS, voice).
8. No LLM-generated post copy.

## Deferred

**v1.1 (next):**
- Bluesky module + template.
- X module + template (parent post without URL + URL reply).
- Token-rotation watcher — v1 handles expired tokens at call time with a clear error message; v1.1 could auto-open a GitHub issue ~7 days before expiry.

**v2 (later):**
- LLM-composed post copy with voice-corpus constraints.
- Engagement-tracking dashboard.

## Open questions for implementation

None blocking. The implementation plan can proceed straight from this design. One detail for the implementer to confirm: the exact Graph API version string to lock against (pick the current stable from developers.facebook.com/docs/graph-api/changelog at implementation time; do not chase the latest after that).

---

*Pairs with cognitive memory `e12e549b` (article social-card sourcing workflow) for image-side work, and the existing canonical ship-image chain (`57c93ae2`) for the broader image-attribution discipline.*
