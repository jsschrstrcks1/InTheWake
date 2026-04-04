# Venue Page Normalization Plan

**Created:** 2026-03-27
**Standard:** `new-standards/foundation/VENUE_PAGE_STANDARDS_v3.010.md`
**Validator:** `admin/validate-venue-page-v2.js`
**Branch:** `claude/explore-repos-docs-YYFnR`

---

## Anti-Model Analysis (2026-03-27)

**Method:** Deep-read `the-palladium.html` (15.7KB, Gen1 entertainment stub) vs `two70.html`
(48.5KB, Gen2 gold standard). Then sampled 38 Gen1 stubs (10%) across all 5 cruise lines.

### The 8 Failure Patterns (Validated Fleet-Wide)

| # | Failure | Gen1 (stub) | Gen2 (gold) | Fleet prevalence |
|---|---------|-------------|-------------|-----------------|
| 1 | **No venue-tags meta** | Missing | 15–25 keywords | 0/37 sampled have tags |
| 2 | **Generic review title** | "Guest Experience Summary" | "{Venue} Review: {Specific}" | 100% NCL/Virgin/Carnival, ~50% RCL |
| 3 | **No ship + date** | "composite account from multiple guest experiences" | "Quantum of the Seas, Sep 2024" | 0/37 have ship+date |
| 4 | **No first-person voice** | "Grand theater design that creates an impressive atmosphere" | "you feel the vibrations in your chest" | 0/37 |
| 5 | **"Varies by venue" pricing** | Present | Specific price or "Complimentary" | 100% NCL/Virgin/Carnival, ~50% RCL |
| 6 | **1-sentence FAQ answers** | "Yes, complimentary." | 3–4 sentences with technical detail | 100% |
| 7 | **No internal cross-links** | 0 ship/venue links in content | Links to ships, related venues | 0/37 |
| 8 | **Wrong JSON-LD @type** | `"Restaurant"` for entertainment/activity venues | Should be `PerformingArtsTheater`, `SportsActivityLocation` | Widespread (fixed for 14, more remain) |

### Key Insight

The Palladium is not an outlier — it IS the template. Every Gen1 page is the same
skeleton with different venue names plugged in. The failures are structural, not
per-page. This means fixes can be systematic.

### Orchestra Feedback (GPT + Grok, 2026-03-27, $0.05)

**Adopted:**
- Add feedback loop after each phase (check GSC indexing rate before scaling)
- Prioritize internal linking alongside content upgrades (Grok, 0.8 confidence)
- Add QA step after Phase 0 batch scripting

**Considered but deferred:**
- "Phase -1" diagnostic batch (Grok, 0.9 confidence): The 10% sample already
  confirms the root cause is thin content + no voice + no specificity. We don't
  need 2–4 weeks of testing to confirm what we can see. But we WILL check GSC
  after Phase 0 before scaling Phase 1.
- De-indexing low-value stubs (Grok, 0.7 confidence): Not yet. The pastoral
  mission includes niche venues that serve specific travelers. We'll evaluate
  after Phase 2 if any pages still refuse to index despite real content.

**Blind spot acknowledged:**
- Grok raised site-wide technical SEO (crawl budget, architecture) as a potential
  root cause beyond page-level quality. We already addressed the technical layer
  in the GSC audit (sitemap gaps fixed, no redirect chains, robots.txt clean).
  But we should monitor crawl stats after Phase 0 to confirm.

---

## Current State

| Metric | Count | % of 472 |
|--------|-------|----------|
| Total venue pages | 472 | 100% |
| Structural validation pass | 472 | 100% |
| "Guest Experience Summary" (generic review) | 297 | 63% |
| "Varies by venue" (no real price) | 187 | 40% |
| Missing `venue-tags` meta | 453 | 96% |
| "Coming soon" placeholder | 18 | 4% |
| Venue-specific photos | 15 | 3% |
| Gen2 (rich, indexable) | ~93 | 20% |
| Gen1 (stub, not indexed) | ~379 | 80% |

### By Cruise Line

| Line | Pages | "Varies" | "Guest Exp Summary" | Price Data in JSON |
|------|-------|----------|--------------------|--------------------|
| RCL (root) | 280 | 40 | 105 | 40 venues |
| NCL | 78 | 78 | 78 | 1 venue |
| Virgin | 46 | 46 | 46 | 2 venues |
| MSC | 45 | 0 | 45 | 0 venues |
| Carnival | 23 | 23 | 23 | 4 venues |

**Key insight:** RCL has 175 pages already free of "Varies by venue" — these are
closest to Gen2. NCL and Virgin are 100% "Varies" — they need pricing research.
MSC has no "Varies" but still has generic reviews on all 45 pages.

---

## Normalization Phases

### Phase 0: Scriptable Quick Wins (GREEN lane — AI executes)

**Scope:** Fixes that can be automated with data from existing JSON files.
**Estimated effort:** 1–2 sessions
**Impact:** Removes most obvious signals of thin content

#### 0a. Add `venue-tags` meta to all 453 pages
- Source: venue JSON files (category, subcategory, name, cuisine type)
- Pattern: `<meta name="venue-tags" content="{tags}"/>`
- Generate tags from: venue name, category, subcategory, cruise line, key features
- Can be 100% scripted from venue data JSONs

#### 0b. Remove "Ship availability coming soon" from 18 pages
- Replace with actual ship data from venue JSONs (which have ship mappings)
- Or remove the placeholder sentence if no data available
- BLOCKING for content quality

#### 0c. Fix "Varies by venue" where JSON has price data (40 RCL + 4 Carnival + 2 Virgin + 1 NCL = 47 pages)
- Pull price from venue JSON → replace "Varies by venue" with actual price
- 47 pages can be fixed automatically from existing data
- Remaining 140 "Varies" pages need research (Phase 2)

#### 0d. Update `last-reviewed` dates on all modified pages

### Phase 1: RCL Review Title + Logbook Upgrade (YELLOW lane — AI proposes)

**Scope:** The 105 RCL pages with "Guest Experience Summary" that already have some content.
**Estimated effort:** 3–5 sessions (batch scriptable for title, manual for logbook)
**Impact:** Highest — RCL is the primary cruise line, most likely to be indexed

#### 1a. Replace "Guest Experience Summary" with venue-specific review titles
- Pattern: "{Venue Name} Review: {Specific descriptor based on venue type}"
- E.g., "Wonderland Review: Molecular Gastronomy That Plays With Your Senses"
- Can be semi-automated: generate title from venue category + key feature

#### 1b. Expand logbook content with venue-specific observations
- Add named ship + date context
- Add specific dish/experience mentions from menu data
- Add 3–5 venue-specific Pro Tips
- Target: 200+ words per logbook section
- This requires research or creative writing — not fully scriptable

#### 1c. Expand FAQ answers from 1-sentence to 2–4 sentences
- Cross-reference with actual venue data for specifics
- Add venue-specific questions (not just generic dining FAQs)

#### 1d. Expand Quick Answer from tagline to complete sentence
- Pull from ai-breadcrumbs answer-first or generate from venue data

### Phase 2: Pricing Research for Remaining "Varies" Pages (YELLOW lane)

**Scope:** 140 pages where JSON has no price data (78 NCL + 46 Virgin + 16 RCL remaining)
**Estimated effort:** 2–3 sessions with web research
**Impact:** Removes the biggest single "thin content" signal

#### 2a. Research NCL venue prices (78 pages)
- NCL specialty dining: typically $29–$59 cover charges
- NCL complimentary venues: "Included in cruise fare"
- Source: NCL official site, cruise blogs, menu PDFs

#### 2b. Research Virgin Voyages venue prices (46 pages)
- Virgin model: most dining included, some specialty surcharges
- Source: Virgin Voyages official site

#### 2c. Update remaining RCL "Varies" pages (16 pages)
- These likely have prices available from RCL site

### Phase 3: Subdirectory Full Normalization (YELLOW lane)

**Scope:** All 192 non-RCL pages (NCL 78 + Virgin 46 + MSC 45 + Carnival 23)
**Estimated effort:** 5–8 sessions
**Impact:** Medium — these lines get less traffic but 100% are Gen1

#### 3a. NCL pages (78) — all have "Guest Experience Summary" + "Varies by venue"
- Largest pages (33KB) suggest some template richness exists
- Need: review titles, logbook specifics, pricing, venue-tags

#### 3b. Virgin pages (46) — same issues as NCL
- Virgin's unique "no-tips-included" model needs specific framing

#### 3c. MSC pages (45) — no "Varies" but all generic reviews
- Need: review titles, logbook specifics, venue-tags
- Zero price data in JSON — all needs research

#### 3d. Carnival pages (23) — all issues
- Smallest set, manageable
- Need: review titles, logbook specifics, pricing, venue-tags

### Phase 4: Photo Enhancement (RED lane — needs real images)

**Scope:** 457 pages without venue-specific photos
**Estimated effort:** Ongoing (depends on photo availability)
**Impact:** High for visual quality, medium for Google indexing

- Only 15 pages have venue-specific photos today
- FOM (Flickers of Majesty) photos are the primary source
- Cannot be scripted — requires actual photography
- Prioritize: fine-dining and entertainment venues first

---

## Execution Priority

The order above is designed for maximum indexing impact with minimum effort:

1. **Phase 0** (scriptable) removes the most obvious thin-content signals
2. **Phase 1** (RCL reviews) fixes the largest, most-trafficked set
3. **Phase 2** (pricing research) removes the second-biggest quality signal
4. **Phase 3** (subdirectories) completes the full fleet
5. **Phase 4** (photos) is ongoing and opportunistic

**Expected GSC impact timeline:**
- Phase 0 → GSC re-crawl in 2–4 weeks → some pages start indexing
- Phase 1+2 → bulk of "crawled not indexed" should resolve within 6–8 weeks
- Phase 3 → long tail improvement over 2–3 months

---

## Validation Approach

For each phase:
1. Run `node admin/validate-venue-page-v2.js` before and after
2. Verify zero regressions on structural checks
3. Spot-check 3–5 pages manually against Emotional Hook Test
4. Verify JSON-LD mirrors meta tags (ai-summary ↔ description)
5. Submit updated pages to GSC for re-crawl after push

---

## Files Modified Per Phase

| Phase | Files Changed | New Files | Data Sources |
|-------|-------------|-----------|-------------|
| 0a | 453 venue pages | — | venue JSONs |
| 0b | 18 venue pages | — | venue JSONs |
| 0c | 47 venue pages | — | venue JSONs |
| 1a-d | 105 RCL pages | — | venue JSONs + research |
| 2a-c | 140 venue pages | — | web research |
| 3a-d | 192 venue pages | — | web research + JSONs |
| 4 | Variable | WebP images | Photography |

---

## Success Metrics

| Metric | Current | After Phase 0 | After Phase 2 | Target |
|--------|---------|--------------|--------------|--------|
| "Varies by venue" | 187 | 140 | 0 | 0 |
| "Guest Experience Summary" | 297 | 297 | 192 | 0 |
| Missing venue-tags | 453 | 0 | 0 | 0 |
| "Coming soon" | 18 | 0 | 0 | 0 |
| Emotional Hook: SEEN pass | ~93 | ~93 | ~235 | 472 |
| Emotional Hook: CONFIDENCE pass | ~285 | ~332 | 472 | 472 |
| GSC crawled-not-indexed (venue est.) | ~200+ | ~150 | ~50 | 0 |

---

*Soli Deo Gloria*
