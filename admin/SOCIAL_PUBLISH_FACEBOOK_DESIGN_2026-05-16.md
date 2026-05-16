# Social Auto-Publish — Facebook (v1) Design

**Date:** 2026-05-16
**Branch:** `claude/auto-publish-social-media-encL1`
**Author:** Drafted with operator (Ken) in brainstorming session
**Status:** Design — ready for implementation plan

> Soli Deo Gloria — built to serve readers, not to feed algorithms.

## Purpose

When a new article is added to `articles/` and pushed to `main`, automatically publish a single Facebook Page post linking to it. v1 is Facebook only; Bluesky and X land in v1.1 once accounts are provisioned. The system is designed so v1.1 is purely additive — no architectural rework.

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

**Known visual issue (not blocking v1):** two of the existing 5 articles (`cruise-duck-tradition`, `cruise-tipping-2026`) still use the generic `articles-hero.jpg` because no honest Wikimedia match exists. Three article-specific cards were sourced and committed on this branch (Caribbean trends, cabin organization, photography guide). The duck and tipping articles will look identical on social until a per-article image is sourced or a typographic-card generator is built (deferred v2).

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

## Workflow file

New `.github/workflows/social-publish.yml`:

- `on: push: branches: [main]` and `workflow_dispatch` with `article_path` + `dry_run` inputs
- `permissions: contents: write` (manifest commit-back)
- `concurrency: group: social-publish` — never two posts at once
- Steps: checkout (`fetch-depth: 2` for diff), Node 20 setup, `npm ci`, `node admin/social-publish/publish.js`, commit manifest if changed and `[skip ci]`
- Secrets pulled from repo-scoped Encrypted Secrets

## Testing strategy before going live

1. `node publish.js --dry-run` locally — print the composed post for every existing article.
2. `workflow_dispatch` with `dry_run: true` — same thing, but in the Action runner with secrets resolved (verifies environment, doesn't post).
3. `workflow_dispatch` with `article_path: articles/cruise-tipping-2026.html, dry_run: false` — single live post, with the operator watching. Verify in-feed render. Check the permalink.
4. Only after step 3 succeeds and visual is approved: enable push-driven posts. The workflow is wired with `on: push` from the start, but the publish job's first step is a guard — `if: github.event_name == 'workflow_dispatch'` — that skips the job for push events until the guard line is removed in a follow-up commit. This keeps the pipeline fully testable without risking a surprise live post during early iteration.

## Non-goals (v1)

1. No Bluesky, X, LinkedIn, Threads, Instagram, Pinterest, Reddit, Mastodon.
2. No auto-generated social card images. Existing `og:image` is used as-is.
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
- Token-rotation watcher (v1 has warnings; v1.1 could auto-open an issue).

**v2 (later):**
- Per-article social card image generator (Playwright/satori) — fixes the duck/tipping generic-image problem.
- LLM-composed post copy with voice-corpus constraints.
- Engagement-tracking dashboard.

## Open questions for implementation

None blocking. The implementation plan can proceed straight from this design. One detail for the implementer to confirm: the exact Graph API version string to lock against (pick the current stable from developers.facebook.com/docs/graph-api/changelog at implementation time; do not chase the latest after that).

---

*Pairs with cognitive memory `e12e549b` (article social-card sourcing workflow) for image-side work, and the existing canonical ship-image chain (`57c93ae2`) for the broader image-attribution discipline.*
