# Plan: Bring All 380 Port Pages to 100% Validator Pass Rate

**Date:** 2026-02-14
**Validator:** `admin/validate-port-page-v2.js` (ITC v1.1 + LOGBOOK_ENTRY_STANDARDS v2.300)
**Branch:** `claude/review-docs-and-repo-GnDW5`
**Guardrail:** Careful, not clever. Every change must be verifiable, reversible, and tested before and after.

---

## Current State (After Phase 1)

| Metric | Count |
|--------|-------|
| Total port pages | 380 |
| Currently passing | 267 (70.3%) |
| Currently failing | 113 (29.7%) |
| Baseline (before Phase 1) | 207 (54.5%) |
| Phase 1 gain | +60 pages |

---

## Failure Categorization

The 173 failing pages break into three groups:

### Group A: Only HTML Integrity Errors (60 pages)

These pages have full content, images, and sections. They fail **only** because of template-level HTML bugs inherited from a shared build process. Fixing the HTML bugs makes them pass immediately.

**Error types found:**
- Heading h2/h3 mismatch (e.g. `<h3>...</h2>` in map summary): 88 total across all groups
- Stray `</section>` closing tag with no matching opener: 63 total
- Stray `</details>` closing tag: 8 total
- Stray `</article>` closing tag: 1 total

**After fixing Group A: 207 → 267 passing (70.3%)**

### Group B: HTML Integrity + Content Errors (65 pages)

These pages have the same template HTML bugs as Group A **plus** significant content gaps. All 65 have 16+ blocking errors including missing sections, thin word counts, and missing narrative elements.

### Group C: Only Content Errors (48 pages)

These pages have no HTML template bugs but have significant content gaps. All 48 have 16+ blocking errors — they are skeleton or stub pages.

**Groups B + C combined: 113 skeleton pages needing real content work.**

---

## The 113 Skeleton Pages — Content Error Breakdown

Every skeleton page fails many of the same checks. This is the frequency of each blocking error across the 113 pages:

| Error | Count | Category |
|-------|-------|----------|
| `word_counts/logbook_minimum` (<800 words) | 113 | Content |
| `logbook_narrative/first_person_minimum` (<15 pronouns) | 113 | Narrative |
| `word_counts/excursions_minimum` (<400 words) | 112 | Content |
| `word_counts/depth_soundings_minimum` (<150 words) | 112 | Content |
| `rubric/first_person_voice` (<10 pronouns) | 112 | Rubric |
| `rubric/booking_guidance` (<2 keywords) | 112 | Rubric |
| `logbook_narrative/emotional_pivot_missing` | 112 | Narrative |
| `word_counts/getting_around_minimum` (<200 words) | 111 | Content |
| `section_order/out_of_order` | 110 | Structure |
| `section_order/missing_required_sections` | 107 | Structure |
| `word_counts/cruise_port_minimum` (<100 words) | 106 | Content |
| `logbook_narrative/reflection_missing` | 106 | Narrative |
| `rubric/accessibility_notes` (<2 keywords) | 103 | Rubric |
| `rubric/diy_price_mentions` (<5 mentions) | 91 | Rubric |
| `images/minimum_images` (<11 images) | 84 | Assets |
| `word_counts/total_minimum` (<2000 words) | 73 | Content |
| `hero/hero_missing` | 59 | Structure |
| `hero/hero_missing_image_credit` | 53 | Assets |
| `word_counts/faq_minimum` | 39 | Content |
| `images/missing_credits` | 39 | Assets |
| `port_images/no_port_images` | 31 | Assets |
| `icp_lite/*` (various) | 20-25 | Metadata |
| `content_purity/forbidden_*` | 6 | Content |

**Key insight:** These pages are not "almost done." They are fundamentally incomplete — missing logbooks, missing sections, missing images. No script can generate a first-person logbook entry with emotional pivots and sensory detail.

---

## Implementation Plan

### Phase 1: Template HTML Fixes (Batch — Scriptable)

**Scope:** All 125 pages with HTML integrity errors (60 Group A + 65 Group B).
**Result:** 60 pages move from FAIL to PASS. 65 pages reduce their error count.
**After Phase 1: 267 / 380 passing (70.3%)**

#### 1a. Fix heading h2/h3 mismatch (88 pages)

**The bug:** In the map section, `<summary><h3>...Area Map</h2></summary>` — the `<h3>` opens but `</h2>` closes it.

**The fix:** For each affected file, find the pattern `<h3>` followed by `</h2>` inside a `<summary>` tag within the map section, and change the `</h2>` to `</h3>`.

**Verification:**
- Before: Run `node admin/validate-port-page-v2.js ports/FILE.html` and confirm `heading_h2_mismatch` + `heading_h3_mismatch` errors
- After: Run same command and confirm those errors are gone
- Spot-check 5 pages manually in browser to confirm map accordion still works

**Script approach:**
```
For each of the 88 files:
  1. Read the file
  2. Find the map <summary> containing <h3>...</h2>
  3. Replace </h2> with </h3> in that specific location
  4. Write the file
  5. Validate
```

**Risk:** Low. Single-character change (`2` → `3`) in a known location. Easily reversible.

#### 1b. Fix stray `</section>` tags (63 pages)

**The bug:** An extra `</section>` closing tag appears without a matching opening `<section>`. This is the same bug found in Nassau (line 597).

**The fix:** For each affected file, identify where `<section>` open count != close count. Find and remove the stray `</section>`.

**Verification:**
- Before/after validator runs
- Diff each file to confirm only the stray tag was removed
- Spot-check 5 pages in browser to confirm layout unchanged

**Approach:**
```
For each of the 63 files:
  1. Count <section> opens vs </section> closes
  2. Identify the stray </section> (likely near the FAQ area, same location as Nassau)
  3. Remove it
  4. Re-count to confirm balance
  5. Validate
```

**Risk:** Low-medium. Need to identify the correct stray tag. The Nassau fix showed it was at a consistent location (after FAQ section). Verify each file individually — do NOT blindly delete the last `</section>`.

#### 1c. Fix stray `</details>` tags (8 pages)

Same approach as 1b. Find and remove stray `</details>` closing tags.

**Pages:** curacao, roatan, st-maarten + 5 in Group B.

#### 1d. Fix stray `</article>` tag (1 page)

**Page:** jamaica.html. Find and remove the stray `</article>`.

#### Phase 1 Execution Rules

1. **One batch at a time.** Do all 88 heading fixes, validate, commit. Then all 63 section fixes, validate, commit. Do not mix fix types in the same commit.
2. **Validate every file after fixing.** Run the validator on each fixed file individually before committing.
3. **Commit with counts.** E.g. `FIX(ports): Fix h3/h2 heading mismatch in map summary (88 pages)`
4. **Run full batch validation after each commit.** Confirm the passing count increases by exactly the expected amount.
5. **Do not touch anything else.** No content changes, no "while we're here" improvements. Template HTML fix only.

---

### Phase 2: Warnings Cleanup (Batch — Scriptable)

**Scope:** All 380 pages. These are warnings, not blocking errors, so they don't affect pass/fail. But fixing them moves pages toward 100/100 scores and prevents future regressions.

**After Phase 2: Still 267 passing, but with higher scores.**

#### 2a. Remove inline console.log statements (233 pages)

**The bug:** `console.log('Could not load articles:', err);` in an inline `<script>` block.

**The fix:** Comment out or remove the console.log line. Replace with a comment: `// Silent fail — articles rail is non-critical`

**Risk:** None. The console.log is in a catch block — removing it doesn't change behavior.

#### 2b. Add `<meta name="author" content="Ken Baker">` (364 pages)

**The fix:** Add the meta tag in the `<head>` after the existing meta tags.

**Risk:** None. Additive-only change.

#### Phase 2 Execution Rules

Same as Phase 1: one fix type per commit, validate after each file, full batch validation after each commit.

---

### Phase 3: Skeleton Page Content (Manual — Not Scriptable)

**Scope:** 113 pages (65 Group B + 48 Group C).
**After Phase 3: 380 / 380 passing (100%)**

This is the hard part. These 113 pages need:

1. **A logbook entry** (min 800 words, first-person, emotional pivot, sensory detail, reflection)
2. **Cruise port section** (min 100 words)
3. **Getting around section** (min 200 words)
4. **Excursions section** (min 400 words, with booking guidance)
5. **Depth soundings section** (min 150 words, with price mentions and accessibility notes)
6. **FAQ section** (with FAQPage JSON-LD)
7. **At least 11 images** with alt text and credits
8. **Hero section** with credited image
9. **Correct section order** (hero → logbook → cruise_port → getting_around → map → excursions → depth_soundings → faq → gallery)
10. **ICP-Lite metadata** (ai-summary, last-reviewed, content-protocol, JSON-LD mirroring)

**This is content creation, not code fixing.** Each page requires research into the specific port, writing a genuine logbook-style narrative, sourcing images with proper credits, and building out all required sections.

#### Phase 3 Execution Approach

**Do NOT attempt to write all 113 pages in one session.** The logbook entries require care, emotional honesty, and port-specific knowledge. Rushing this will produce exactly the kind of "unnatural, robotic copy" that ITW-Lite explicitly rejects.

**Recommended batching:**

| Priority | Pages | Rationale |
|----------|-------|-----------|
| P1 — High traffic ports | ~15 | Ports that users are most likely to visit (e.g. Barcelona, Miami, San Juan, Cape Town, Istanbul, Melbourne). Fix these first for user impact. |
| P2 — Caribbean / Alaska | ~30 | Cruise-heavy regions. Many skeleton pages are in these clusters. |
| P3 — Mediterranean | ~25 | Second most popular cruise region. |
| P4 — Rest of world | ~43 | Remaining ports. |

**Per-page workflow:**
1. Open the page in browser — see what exists
2. Run the validator — see exactly what's missing
3. Write the logbook entry (the hardest part — must be first-person, with an emotional pivot)
4. Write supporting sections (cruise port, getting around, excursions, depth soundings)
5. Source images (Wikimedia, Unsplash, Pexels — with credits)
6. Add FAQ + JSON-LD
7. Add ICP-Lite metadata
8. Validate → all errors clear
9. Commit

**Per-session target:** 3-5 pages per session, depending on complexity.

At 3-5 pages per session, Phase 3 takes approximately 23-38 sessions.

---

## Warnings-Only Issues (Do Not Block Passing)

These appear on passing pages as warnings. They should be addressed but are lower priority than the 173 failing pages:

| Warning | Affected Pages | Notes |
|---------|---------------|-------|
| `inline_console_log` | 233 | Addressed in Phase 2a |
| `missing_meta_author` | 364 | Addressed in Phase 2b |
| `potential_duplicate_images` | Various | May indicate placeholder images — investigate per page |
| `sensory_detail` | Various | Logbook uses <3 of 5 senses — improve when revisiting content |
| `contrast_missing` | Various | Low contrast word count — improve when revisiting content |
| `stamina_levels` | Various | No stamina/accessibility levels — improve when revisiting |

---

## What This Plan Does NOT Do

| Excluded Item | Reason |
|---------------|--------|
| Change version badge (V1.Beta) | Site-wide concern, not port-specific |
| Add Article schema | WebPage + Place mainEntity is correct per port standards |
| Add port-stats JSON block | Requires schema design decision (flagged for future) |
| Convert "From the Pier" to data-driven | 376-page architectural change |
| Add static map fallbacks | Infrastructure project |
| Merge map + pier data sources | Architectural decision for all ports |
| Keyword-stuff H2s | Violates content-strategy guardrail |

---

## Tracking

After each work session, update this table:

| Date | Phase | Pages Fixed | Passing | Notes |
|------|-------|-------------|---------|-------|
| 2026-02-14 | Baseline | 0 | 207/380 | Initial measurement |
| 2026-02-14 | Phase 1a | 87 | 247/380 | Fix h3/h2 heading mismatch in map summary |
| 2026-02-14 | Phase 1b | 36 | 247/380 | Remove 39 stray </section> closing tags |
| 2026-02-14 | Phase 1c | 8 | 247/380 | Fix unbalanced <details> tags (5 stray closers, 3 missing closers) |
| 2026-02-14 | Phase 1d | 1 | 247/380 | Add missing </article> to jamaica.html |
| 2026-02-14 | Phase 1e | 20 | 267/380 | Add 93 missing </section> closers for content sections |
| | Phase 2a | | /380 | Console.log cleanup |
| | Phase 2b | | /380 | Meta author addition |
| | Phase 3 | | /380 | Content creation (ongoing) |

---

## Files Referenced

- Validator: `admin/validate-port-page-v2.js`
- Validator (v1): `admin/validate-port-page.js`
- Post-write hook: `admin/post-write-validate.sh`
- Port standards: `standards/ports-standards.md`
- Nassau review (reference fix): `admin/claude/NASSAU_REVIEW_PLAN.md`
- ICP-Lite protocol: `admin/claude/ITW-LITE_PROTOCOL.md`

---

## Group A: 60 Pages That Pass After Template Fix

These pages have zero content errors — only HTML integrity bugs:

```
acapulco.html         adelaide.html         agadir.html
akureyri.html         amber-cove.html       antigua.html
apia.html             aqaba.html            aruba.html
ascension.html        athens.html           auckland.html
bali.html             barcelona.html        bermuda.html
cabo-san-lucas.html   civitavecchia.html    costa-maya.html
curacao.html          dubrovnik.html        endicott-arm.html
ensenada.html         falkland-islands.html ft-lauderdale.html
galveston.html        glacier-bay.html      grand-cayman.html
haines.html           hamburg.html          honolulu.html
huatulco.html         hubbard-glacier.html  icy-strait-point.html
jamaica.html          juneau.html           ketchikan.html
kusadasi.html         lanzarote.html        lautoka.html
los-angeles.html      manzanillo.html       mazatlan.html
miami.html            mykonos.html          naples.html
new-orleans.html      port-canaveral.html   progreso.html
puerto-vallarta.html  roatan.html           san-juan.html
santorini.html        seattle.html          seward.html
sitka.html            skagway.html          st-maarten.html
tampa.html            venice.html           zihuatanejo.html
```

---

**Soli Deo Gloria**
