# Ship Page Review — Action Plan

**Date:** 2026-02-14
**Source:** External review of ship page template (Radiance of the Seas as reference)
**Branch:** `claude/review-docs-codebase-IJvuW`

---

## Phase 1: HTML Validity & Code Cleanup — COMPLETED

### 1A. Fix Duplicate `class` Attributes — COMPLETED
- **Result:** 1 remaining file fixed (carnival-magic.html, 4 occurrences). Prior sessions fixed 49 other files.
- **Verified:** 0 duplicate class attributes remain across all ship pages.

### 1B. Remove `(V1.Beta)` from Title Tags — COMPLETED
- **Result:** 249 files cleaned. ` (V1.Beta)` stripped from `<title>` tags across all ship pages.
- **Method:** Script (`admin/fix-v1beta.cjs`) + 2 manual inline-style fixes (carnival-vista, carnival-celebration).
- **Verified:** 0 visible V1.Beta references remain (1 HTML comment in grandeur-of-the-seas.html is invisible).

### 1C. Remove `V1.Beta` Version Badge from Navbar — COMPLETED
- **Result:** 247 version badge `<span>` elements removed across all ship pages.
- **Decision:** Removed entirely (no replacement). Version numbers in navbar are unusual for production sites.
- **Variant formats handled:** `class="tiny version-badge"` with/without `aria-label`, `class="version-badge"`, inline-styled spans.

---

## Phase 2: Structured Data / SEO — COMPLETED

### 2A. Add Article Schema — COMPLETED
- **Result:** 291/293 ship pages now have `@type: Article` JSON-LD with headline, description, dateModified, author (Ken Baker), and publisher (In the Wake).
- **Data sources:** headline from `<title>`, description from `ai-summary` meta, dateModified from `last-reviewed` meta.
- **Skipped (2):** `grandeur-of-the-seas.html` (redirect page with malformed title), `oasis-class-ship-tbn-2028.html` (TBN ship with HTML in title).
- **Script:** `admin/add-article-schema.cjs`

### 2B. Review Schema Rating Audit — RESOLVED
- **Decision (2026-02-14):** Remove `ratingValue` entirely from all ship pages
- **Action taken:** Removed `reviewRating` block from all 293 ship page JSON-LD; updated both validators
- **Rationale:** Hard-coded ratings with no documented methodology risk Google suppressing rich results
- **Future:** Ratings may be re-added with documented editorial methodology

### 2C. Keyword Reinforcement in Subheaders — COMPLETED
- **Result:** 631 heading improvements across 292 files:
  - "A First Look" → "A First Look at [Ship Name]" (64 fixes)
  - "Deck Plans" / "Ship Map (Deck Plans)" → "[Ship Name] Deck Plans" (275 fixes)
  - "Frequently Asked Questions" → "Frequently Asked Questions About [Ship Name]" (292 fixes)
- **Script:** `admin/add-keyword-subheaders.cjs`

---

## Phase 3: AI-First & Content Improvements — COMPLETED

### 3A. Add Declarative Fact Block — COMPLETED
- **Result:** 285/293 ship pages now have a visible `<p class="fact-block">` paragraph with ship class, cruise line, year, tonnage, and guest capacity.
- **Data source:** `ship-stats-fallback` inline JSON in each page.
- **Placement:** Before the `answer-line` CTA, after the H1 title.
- **Skipped (8):** 7 pages missing ship-stats-fallback, 1 page missing answer-line anchor.
- **Script:** `admin/add-fact-block.cjs`

### 3B. Tool Visibility — Contextual Sidebar Links — COMPLETED
- **Result:** 277/293 ship pages now have a "Planning Tools" card in the right sidebar with links to Ship Size Atlas, Budget Calculator, Drink Package Calculator, and Port Day Planner.
- **Placement:** After the Ship Quiz CTA, before the Author card.
- **Skipped (16):** Pages without the quiz-cta sidebar structure.
- **Script:** `admin/add-tool-sidebar.cjs`

---

## Phase 4: Governance Decisions (Need Ken's Input)

### 4A. Soli Deo Gloria Footer — `aria-hidden` Inconsistency
- **Current state:** Footer dedication is `aria-hidden="true"` — visually present but hidden from screen readers
- **Question:** Is the dedication decorative, or part of the public theological identity?
- **Options:**
  1. Remove `aria-hidden="true"` → fully visible to all users including assistive tech
  2. Keep `aria-hidden="true"` → treat as decorative flourish
  3. Move to a visible `role="note"` section → explicitly labeled as faith context
- **Recommendation:** Option 1 — if "offered as worship," it should be universally accessible

### 4B. Version Governance Strategy
- **Current chaos:** 15+ different version strings across 1,238 pages
  - Meta versions: `3.010.300`, `3.010.400`, `3.010.200`, etc.
  - CSS file header: `v3.012.000`
  - Navbar badge: `V1.Beta`
  - Title tags: `(V1.Beta)`
  - CLAUDE.md references: `v3.010.305`
- **Proposed unified approach:**
  1. Single source of truth for version (e.g., `config.js` or a `version.json`)
  2. Remove version from user-facing UI (title tags, navbar badge)
  3. Keep technical version in `<meta name="version">` for governance
  4. Align CSS cache-busting `?v=` with meta version
- **This is a larger architectural decision — recommend phased approach**

### 4C. Performance Audit
- **Observation:** 12+ dynamic loaders on each ship page
- **Action:** Run Lighthouse audit on a representative ship page to measure LCP, CLS, TBI
- **Deferred:** This is measurement first, action second — don't prematurely optimize

---

## Implementation Order

| Priority | Task | Files | Status | Notes |
|----------|------|-------|--------|-------|
| ~~P0~~ | ~~Fix duplicate class attributes~~ | ~~1~~ | **DONE** | carnival-magic.html (4 attrs merged) |
| ~~P0~~ | ~~Remove (V1.Beta) from titles~~ | ~~249~~ | **DONE** | Script + 2 manual inline fixes |
| ~~P0~~ | ~~Remove navbar version badge~~ | ~~247~~ | **DONE** | Removed entirely (no replacement) |
| ~~P1~~ | ~~Add Article schema~~ | ~~291~~ | **DONE** | 2 skipped (malformed titles) |
| ~~P1~~ | ~~Add declarative fact block~~ | ~~285~~ | **DONE** | 8 skipped (missing stats/anchor) |
| ~~P1~~ | ~~Tool visibility sidebar~~ | ~~277~~ | **DONE** | 16 skipped (no quiz-cta) |
| ~~P2~~ | ~~Keyword-rich subheaders~~ | ~~292~~ | **DONE** | 631 headings improved |
| ~~P2~~ | ~~Review schema rating audit~~ | ~~293~~ | **DONE** | Resolved 2026-02-14 |
| P3 | aria-hidden decision | All pages | **Pending** | Needs Ken's input |
| P3 | Version governance unification | Entire codebase | **Pending** | Needs Ken's input |
| P3 | Performance audit | N/A | **Pending** | Measurement first |

---

## What I Will NOT Do (Out of Scope)

- Strip JS loaders — need performance data first
- Redesign version governance — too large for this session
- Modify the URL normalizer — duplicate selector issue was NOT confirmed in JS
- Rating methodology — ratings removed 2026-02-14; may be re-added later with editorial basis

---

*Soli Deo Gloria — Measure twice, cut once.*
