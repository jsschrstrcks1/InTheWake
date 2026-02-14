# Ship Page Review — Action Plan

**Date:** 2026-02-14
**Source:** External review of ship page template (Radiance of the Seas as reference)
**Branch:** `claude/review-docs-codebase-IJvuW`

---

## Phase 1: HTML Validity & Code Cleanup (No Decisions Needed)

### 1A. Fix Duplicate `class` Attributes
- **Scope:** 50 files, ~146 occurrences (48 RCL ships, 1 Carnival, template)
- **Fix:** Merge duplicate `class` attributes into single attribute per element
- **Examples:**
  - `class="tiny content-text" class="mb-075"` → `class="tiny content-text mb-075"`
  - `class="card" id="whimsical-units-container" class="whimsical-units-container"` → `class="card whimsical-units-container" id="whimsical-units-container"`
  - `class="rail-nav" aria-label="..." class="rail-nav mb-05"` → `class="rail-nav mb-05" aria-label="..."`
  - `class="tiny" class="loading-text"` → `class="tiny loading-text"`
- **Spot-check:** Verify 3 random files after bulk fix

### 1B. Remove `(V1.Beta)` from Title Tags
- **Scope:** 71 pages with `(V1.Beta)` in `<title>`
- **Fix:** Strip `(V1.Beta)` from title tags and `og:title` tags
- **Rationale:** Signals "early-stage site" to users and AI, weakening authority

### 1C. Remove `V1.Beta` Version Badge from Navbar
- **Scope:** ~1,159 instances of `<span class="tiny version-badge">V1.Beta</span>`
- **Decision needed:** Remove entirely, or replace with production version?
- **Recommendation:** Remove the badge entirely — version numbers in navbar are unusual for production sites and add no user value

---

## Phase 2: Structured Data / SEO (Some Decisions Needed)

### 2A. Add Article Schema
- **What:** Add `@type: Article` JSON-LD to ship pages alongside existing schemas
- **Fields:** `headline`, `author`, `publisher`, `datePublished`, `dateModified`, `image`, `mainEntityOfPage`
- **Rationale:** Ship pages have editorial voice, author attribution, and publication dates — this signals editorial content to Google, strengthening E-E-A-T
- **Implementation:** Add to template + all ship pages

### 2B. Review Schema Rating Audit — RESOLVED
- **Decision (2026-02-14):** Remove `ratingValue` entirely from all ship pages
- **Action taken:** Removed `reviewRating` block from all 293 ship page JSON-LD; updated both validators
- **Rationale:** Hard-coded ratings with no documented methodology risk Google suppressing rich results
- **Future:** Ratings may be re-added with documented editorial methodology

### 2C. Keyword Reinforcement in Subheaders
- **What:** Add subtle keyword-rich subheaders throughout ship pages
- **Examples:**
  - "Dining" → "Dining Options on [Ship Name]"
  - "Videos" → "[Ship Name] Tour Videos & Walkthroughs"
  - "Deck Plans" → "[Ship Name] Deck Plans"
- **Scope:** Template change + propagate to live pages
- **Risk level:** Low — purely additive

---

## Phase 3: AI-First & Content Improvements

### 3A. Add Declarative Fact Block
- **What:** Add a tight fact-dense paragraph near the top of each ship page
- **Example:**
  > Radiance of the Seas is a Radiance Class cruise ship operated by Royal Caribbean International. She entered service in 2001, measures 90,090 gross tons, and carries approximately 2,466 guests at double occupancy.
- **Source data:** Already in `ai-breadcrumbs` comment and ship stats JSON
- **Implementation:** Add as visible `<p>` element after the answer-first paragraph
- **Benefit:** LLMs prefer tight declarative paragraphs for answer extraction

### 3B. Tool Visibility — Contextual Sidebar Links
- **What:** Add "Quick Tools" or "Related Tools" card to `col-1` sidebar on ship pages
- **Which tools to cross-sell contextually:**
  - Ship Size Atlas (directly relevant to ship comparison)
  - Drink Calculator (relevant to cruise planning)
  - Ship Quiz (already in sidebar as CTA)
  - Budget Calculator (planning context)
- **Implementation:** Add a `<section class="card">` in the sidebar with contextual tool links
- **Benefit:** Tools become discoverable without requiring nav menu exploration

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

| Priority | Task | Files | Effort | Needs Decision? |
|----------|------|-------|--------|-----------------|
| P0 | Fix duplicate class attributes | 50 | Medium | No |
| P0 | Remove (V1.Beta) from titles | 71 | Medium | No |
| P1 | Add Article schema | Template + ships | Medium | No |
| P1 | Add declarative fact block | Template + ships | Medium | No |
| P1 | Tool visibility sidebar | Template + ships | Low | No |
| P2 | Keyword-rich subheaders | Template + ships | Low | No |
| ~~P2~~ | ~~Review schema rating audit~~ | ~~Template + ships~~ | ~~Done~~ | ~~Resolved 2026-02-14~~ |
| P2 | Remove navbar version badge | ~1,159 pages | Medium | Recommend yes |
| P3 | aria-hidden decision | All pages | Low | Yes (Ken) |
| P3 | Version governance unification | Entire codebase | High | Yes (Ken) |
| P3 | Performance audit | N/A | Low (measurement) | No |

---

## What I Will NOT Do (Out of Scope)

- Strip JS loaders — need performance data first
- Redesign version governance — too large for this session
- Modify the URL normalizer — duplicate selector issue was NOT confirmed in JS
- Rating methodology — ratings removed 2026-02-14; may be re-added later with editorial basis

---

*Soli Deo Gloria — Measure twice, cut once.*
