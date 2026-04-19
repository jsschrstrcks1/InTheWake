# Validator Spec — Strategic Gaps Report

**Date:** 2026-04-16
**Author:** Claude (validator-spec session)
**Status:** Open findings — not yet addressed

---

## 1. RCL Bias in Ship Validator

**Severity:** High — affects 241 of 291 ship pages (83% of fleet)

`SHIP_CLASSES` at `admin/validate-ship-page.js` lines 83-91 contains ONLY Royal Caribbean class data (7 classes, 31 ships). All class-aware validator features are dead for 14 other cruise lines:

| Feature | Rule ID | Impact on non-RCL |
|---|---|---|
| Dining hero tier-2 (sister-class) | SHIP-005 | Falls to tier 3 (warn) instead of tier 2 (pass) — penalizes compliant pages |
| Review class-reference check | SCHEMA-010 | Never catches wrong-class references |
| `extractCruiseLine` default | line 327 | Falls back to 'rcl' if path doesn't match convention |
| `validateVideos` default | line 2121 | Looks in rcl/ directory for non-RCL ships |

**Fix:** Populate SHIP_CLASSES with class data for all 15 cruise lines. The code is line-agnostic — only the data is missing. Estimated classes to add:

- Carnival: Excel (2), Conquest (5), Dream (2), Fantasy (1), Spirit (4), Vista (2)
- Celebrity: Edge (4), Millennium (4), Solstice (5)
- Norwegian: Prima (3), Breakaway (2), Breakaway Plus (4), Jewel (2), Dawn (2)
- MSC: World (2), Seaside (3), Meraviglia (3), Fantasia (4), Musica (4)
- Princess: Sphere (2), Royal (5), Grand (5), Coral (2), Crown (1)
- Holland America: Pinnacle (3), Vista (2), Rotterdam (2), S-class (4)
- Cunard: Queen (3)
- Virgin Voyages: Scarlet (4, all identical class)
- Silversea: Nova (2), Muse (2), Spirit (3), Cloud (2)
- Costa: (shares Carnival class structure for newer ships)
- Oceania: Allura (2), Regatta (4)
- Regent: Explorer (3)
- Seabourn: Venture (2), Odyssey (3)
- Explora: Explora (4)

---

## 2. Venue Coverage Gap — Unknown Real Size

**Severity:** High — estimated thousands of missing pages, but never actually counted

LINK-001 describes the rule (ship-venue references must resolve to venue pages). The estimate was "~2,950 venue slots vs 472 pages" based on user's "~10 per ship" heuristic. But nobody has actually:

1. Parsed every ship page's dining section
2. Extracted venue names mentioned
3. Deduplicated across the fleet
4. Compared against `restaurants/*.html` filesystem
5. Produced a definitive count of missing venue pages

**Fix:** Write and run the cross-reference script. Could be done in one session. The result would be a concrete list: "these N unique venues are referenced on ship pages but have no venue page." That list becomes the venue-page creation queue.

---

## 3. No Real-Device or Real-Browser Testing

**Severity:** Medium — validators check HTML source, not rendered behavior

All validation is static analysis (parse HTML, check attributes, count words). Nobody loads pages in:
- Safari iOS (the dominant cruise-ship browser — passengers use iPhones)
- Chrome Android at 375px viewport
- A real 2G/3G connection (satellite Wi-Fi on ships)
- Screen readers (VoiceOver, NVDA)

A page can pass every validator rule and still be unusable because:
- A CSS rule breaks at a specific viewport width
- Collapsible `<details>` sections don't open on older Safari
- Lazy-loaded images never load on slow connections (no placeholder, no skeleton)
- Touch targets that measure 44px in CSS render smaller due to viewport scaling

**Fix:** Add Playwright-based browser testing (the repo has playwright as a dependency). Even a simple "load the page at 375px, screenshot, check no horizontal scroll" would catch the class of bugs static analysis misses. The `webapp-testing` skill exists for this but hasn't been wired to real test runs.

---

## 4. Content Freshness is Date-Based, Not Fact-Based

**Severity:** Medium — creates false confidence

ICP-007 flags pages not reviewed in 180 days. But "reviewed" means "someone bumped last-reviewed" — not "someone verified that the jitney still costs $1.25." A page reviewed yesterday with 2-year-old prices passes every validator.

**Fix options:**
- Add volatile-data markers in HTML (e.g., `<span data-volatile="price" data-as-of="2026-01-15">$1.25</span>`) and validate that `data-as-of` is within threshold
- Maintain a separate `volatile-data-registry.json` per port listing every price/schedule cited and its verification date
- Neither is simple. The honest assessment is that no automated check can verify whether a jitney price is current — only a human who calls the taxi company or visits the port can confirm.

---

## 5. Flickr-889 P0 Blocker Still Open

**Severity:** P0 — blocking per `admin/UNFINISHED_TASKS.md`

889 `-attr.json` files cite "Flickr public feed" with unverified licenses. Spot-checks (WebFetch) confirmed some are All Rights Reserved, not CC. ATTR-003 (attribution diversity) and IMG-014 (placeholder hash detection) now exist as rules, but:

- The 889 files have NOT been deleted
- No replacement images have been sourced
- No batch validator run has been executed to produce the exact failure list
- The P0 status in UNFINISHED_TASKS.md has not changed since it was flagged

**Fix:** Run `scripts/batch-validate.js` with the new rules to produce the hit list. Then either bulk-delete the attr.json files + remove corresponding images, or source real replacements per the Image Verification Protocol.

---

## 6. Pastoral Testing Gap

**Severity:** Foundational — the site's stated mission is untested

The site serves widows, grieving travelers, disabled adventurers, caregivers. Voice rules (VOI-001 through VOI-006) check for machine tells. Emotional-hook-test checks for feeling-level quality. But:

- No widow has read a port page and given feedback
- No disabled traveler has tested the accessibility beyond WCAG checkbox compliance
- No caregiver has tried to plan a respite cruise using the tools
- The logbook emotional-pivot rule (LOG-004) is LLM-reviewed, not human-reviewed

The validators can catch machine-generated prose. They cannot catch whether the prose helps someone who is grieving.

**Fix:** This is not a code fix. It's a user-research project: find 3-5 people from the site's stated audience, show them real pages, listen. The feedback would inform which rules matter and which are theater.

---

## 7. Task Tracking Debt from This Session

**Severity:** Process — guardrail violation

This session produced:
- 138-rule canonical spec with anti-zombie CI enforcement
- 6 V-S-conflict resolutions implemented in validator code
- 9 orphan rules closed with new validator checks
- 3 bugs caught and fixed by edge-case testing
- CAREFUL.md updated with Code-Logic Verification mandate
- Standards docs archived with git history preserved
- CLAUDE.md + ONBOARDING.md references redirected

NONE of this is reflected in `admin/UNFINISHED_TASKS.md`, `admin/IN_PROGRESS_TASKS.md`, or `admin/COMPLETED_TASKS.md`. A future Claude session reading those files won't know any of it happened.

**Fix:** Update all three tracking files. This is the next action item before closing the session.

---

## 8. Analytics Feedback Loop Missing

**Severity:** Strategic — building without evidence

GA4 + Umami are configured. Nobody in this project has looked at:
- Which pages get the most traffic (are we optimizing the right ports?)
- Where readers bounce (which sections fail to hold attention?)
- What search queries land on the site (what are people actually looking for?)
- Which tools get used vs abandoned (is the drink calculator worth maintaining?)
- Mobile vs desktop split (how much does mobile readiness actually matter for THIS audience?)

The validators optimize for what we THINK matters. Analytics would tell us what readers SHOW matters by their behavior.

**Fix:** Dedicate a session to pulling GA4/Umami data and mapping it against the validator's priority ordering. If 90% of traffic is to 20 port pages, those 20 should be gold-standard first; the other 367 can wait.

---

## 9. Runtime Data Layer — 137 Broken JSON References + 75 Empty Video Stubs

**Severity:** High — readers see empty sections on ship pages; validators can't detect this

Ship pages load content at runtime via JavaScript `SOURCES` arrays that cascade through multiple JSON file paths. The validator checks HTML source only — it cannot see what the JS fetches or whether the fetches succeed.

**Concrete findings (2026-04-16 deep audit):**

| Finding | Count | Impact |
|---|---|---|
| Broken JSON references (SOURCES paths to files that don't exist) | **137** | JS silently falls through cascade; reader may see empty stats/video/dining sections |
| Broken refs on RCL ships | 114 | Concentrated in /assets/data/ships/ and /ships/rcl/assets/ paths |
| Broken refs on Carnival ships | 23 | Same pattern |
| Video JSON files that are empty stubs (0 videos inside) | **75** | Video grid renders empty on 75 ship pages |
| Empty stubs by line: Holland America | 34 | Worst-affected line |
| Empty stubs by line: RCL | 17 | Even the "primary" line has gaps |
| Empty stubs by line: Carnival | 14 | Third-worst |
| Logbook JSON quality | 291/291 have content | Logbooks are solid — the only fully-populated data layer |
| Logbook JSONs with <5 stories | 18 | Thin but not empty |

**The fundamental problem:** 843 pages across the site use dynamic content insertion (`innerHTML`, `textContent`, `insertAdjacentHTML`). 292 ship pages fetch JSON at runtime. The validators check the HTML shell — the container element's existence, its `id`, its attributes — but NOT whether the fetched content is real, correct, or even fetchable.

A ship page can pass every validator rule at 96/100 and still show readers:
- An empty stats section (JSON file doesn't exist)
- An empty video grid (video JSON is a stub with 0 entries)
- An empty dining section (venue data path is wrong)
- An empty recent-stories rail (articles index not found)

**The gap in the spec:** No rule in the 138-rule spec checks whether runtime JSON sources exist and contain data. The validator operates on HTML; the site operates on HTML + JSON + JS. The spec covers one-third of the delivery surface.

**Fix options:**
1. **Add JSON-existence checks to ship validator.** For each SOURCES array detected, verify at least one source exists on disk. This catches the 137 broken refs.
2. **Add JSON-content checks.** For each existing JSON, verify it has non-trivial content (e.g., video JSON has >0 videos). This catches the 75 empty stubs.
3. **Add Playwright runtime validation.** Load the page in a headless browser, wait for JS to execute, then validate the populated DOM. This catches everything but is slower and more complex.

Option 1 is the lowest-hanging fruit and would immediately surface the 137 broken refs. Option 2 adds the 75 empty stubs. Option 3 is the correct long-term answer but requires engineering effort.

---

## 10. Static Validator vs Dynamic Site — The Structural Mismatch

**Severity:** Architectural — the most fundamental gap

The site is a **static HTML + runtime JavaScript** hybrid. Port pages are mostly static (HTML contains the content). Ship pages are heavily dynamic (HTML contains containers; JS populates them from JSON). Venue pages are mixed.

The entire validator ecosystem — `validate-port-page-v2.js`, `validate-ship-page.js`, `validate-venue-page-v2.js` — operates on static HTML analysis via Cheerio. This means:

**What validators CAN verify (HTML source):**
- Page structure, meta tags, JSON-LD, ARIA, a11y
- Image elements (src, alt, loading attributes)
- Section presence (by id/class/heading text)
- Word counts (of static text only)
- Navigation links

**What validators CANNOT verify (runtime behavior):**
- Whether fetched JSON data is correct, current, or even fetchable
- Whether the rendered DOM after JS execution matches expectations
- Whether CSS produces the intended visual layout at real viewport sizes
- Whether interactive elements (carousels, calculators, trackers) function
- Whether the page works offline via service worker
- Whether the page loads in under 3 seconds on satellite Wi-Fi

The 138-rule spec we built catalogs what static validators CAN check. It does not address what they CANNOT check. The gap between "validator passes" and "page works for a reader" is the JS + CSS + network runtime layer — and it's completely unvalidated.

This is not a rule to add to the spec. It's a different category of quality assurance that the current tooling can't perform. The site has Playwright as a dependency but no test suite. The `webapp-testing` skill exists as a Claude Code skill but has never produced runnable tests. That's the architectural gap.

---

**Soli Deo Gloria.** Seeing the full picture — including the parts we built nothing to check — is how integrity works.
