# Ship Page Repair Plan — Careful, Not Clever
**Date:** 2026-03-25
**Validator:** ITW-SHIP-002 v2.5  |  **Threshold:** 80/100
**Scope:** 108 failing ship pages
**Framework:** Careful Not Clever v1.7alpha

---

## The Rule

> **Be careful, not clever.**
> Careful means: verified, documented, reversible, honest.
> Clever means: fast, batched, assumed.
> When in doubt, be careful.

---

## Scope Boundaries (Read Before Touching Anything)

This plan covers only ships in `data/validated-ships.json → failing`.

**Out of scope — do not touch:**
- Any ship scoring ≥ 80 (181 ships currently passing)
- Shared templates, components, or CSS files
- `assets/` files not directly linked to a failing ship
- `admin/` validation scripts
- Any file not read in-session before editing

**One logical change at a time.** Do not combine a video fix with a logbook fix in the same edit pass. Fix one thing, run the validator, confirm, then move on.

---

## Material Assumptions (State Before Starting)

Each of these must be verified before acting on it. An unverified assumption at ≤6 confidence blocks execution until confirmed.

| # | Assumption | Risk if False | Confidence | Verify By |
|---|-----------|--------------|-----------|-----------|
| 1 | Passing ships share no files with failing ships | Fixing a failing ship's JSON could break a passing ship that references the same file | 7 | Grep for file references before editing any shared JSON |
| 2 | `assets/data/videos/<line>/<slug>.json` is the correct path for all lines | Wrong path = video fix silently fails, validator still flags missing | 8 | Open one known-good video JSON from a passing ship to confirm path pattern |
| 3 | The validator reads logbook stories from `assets/data/logbook/<line>/<slug>.json` | Wrong assumption = logbook additions have no effect | 8 | Confirm by opening a passing ship's logbook JSON and validator source |
| 4 | Historic ships (type = Historic) are legitimately exempt from video blocking errors | Could be a validator bug, not intentional exemption | 7 | Read validator source for `historic` type handling before spending time on historic ships |
| 5 | TBN ships should not be in the atlas until named and passing | Adding TBN ships to atlas is intentional (placeholder strategy) | 5 | Ask before removing any TBN ship from atlas |
| 6 | Stub ships (scoring 4–32%) are incomplete builds, not corrupt files | Could be intentional placeholder pages | 6 | Open each stub ship's HTML and read it before any action |

---

## Verification Protocol

Before every edit:
1. Read the target file in this session — no exceptions
2. State what you expect to find
3. State what you're changing and why
4. Identify whether any other file references the thing you're changing

After every edit:
1. Run `node admin/validate-ship-page.js <file>` and read the output
2. Confirm the targeted error cleared
3. Confirm no new errors appeared
4. Only then mark the ship as repaired

**Never say "done" without running the validator and reading its output.**

---

## Priority Order — Impact vs. Risk

Repairs are ordered by: (points gained × ships affected) ÷ risk of regression.

| Priority | Issue | Ships Affected | Points Gained | Risk | Do First? |
|----------|-------|---------------|--------------|------|-----------|
| 1 | `data_attr/invalid_imo` | 12 | +6–8 | Low — data attribute only | Yes |
| 2 | `sections/missing_required` | 8 | +10–16 | Medium — structural HTML | After IMO |
| 3 | `sections/wrong_section_order` | 8 | +10–12 | Medium — reorder only, no edit | After #2 |
| 4 | `videos/few_videos` + `videos/missing_categories` | 62–66 | +20–30 | Medium — new JSON files | Yes, after structure |
| 5 | `images/few_images` | 42 | +10 | Low — additive only | Parallel with videos |
| 6 | `logbook/few_stories` + `logbook/missing_file` | 17+6 | +10–15 | High — content creation | After videos |
| 7 | `word_counts/page_too_short` | 7 | +8 | Medium — content edit | With logbook |
| 8 | FAQ expansion (`word_counts/faq_too_short`) | 96 | +2–4 | Low — additive | Last structural |
| 9 | Logbook spine + emotional markers (warnings) | 102 | +2–6 | Low — additive | After blockers cleared |
| 10 | Grid-2 pairings (`sections/missing_grid2_*`) | 87+23 | +2–4 | Medium — layout change | Only for ships still below 80 after above |

---

## Repair 1 — Fix Invalid IMO Numbers

**Target:** 12 ships with `[data_attr/invalid_imo]` — `data-imo="0"` is not valid

**Scope:** Change `data-imo` attribute on the ship's `<html>` or `<body>` tag. Nothing else.

**Before editing each file:**
- Read the file
- Confirm current `data-imo` value is `"0"`
- Look up the correct 7-digit IMO from `https://www.marinetraffic.com/` by ship name
- Verify the IMO is for this specific vessel, not a sister ship

**After editing:**
- Run validator
- Confirm `[data_attr/invalid_imo]` is gone
- Confirm score increased

**Do not fix:** TBN ships — their IMO should be `"TBD"`, not a real number. Check the validator output to confirm which fix applies.

**To find the 12 ships:**
```bash
node -e "
const d = JSON.parse(require('fs').readFileSync('data/validation-failures-detail.json','utf8'));
for (const [line, ships] of Object.entries(d)) {
  for (const s of ships) {
    if (s.blocking.some(b => b.includes('invalid_imo'))) {
      console.log(line + '/' + s.slug + '  score:' + s.score);
    }
  }
}
"
```

---

## Repair 2 — Missing Required Sections

**Target:** 8 ships missing `page_intro` and/or `recent_rail`

**Before editing:**
- Read the target file completely
- Open a passing ship in the same line (or Norwegian if no passing ships in that line)
- Identify the exact HTML structure of `page_intro` and `recent_rail` in the template
- Do not write these sections from memory — copy structure, then adapt content

**Scope:** Add only the missing section(s). Do not touch existing sections.

**After editing:**
- Run validator
- Confirm `[sections/missing_required]` clears
- Confirm `[sections/wrong_section_order]` is not newly triggered
- Read the rendered section visually if possible

**To find the 8 ships:**
```bash
node -e "
const d = JSON.parse(require('fs').readFileSync('data/validation-failures-detail.json','utf8'));
for (const [line, ships] of Object.entries(d)) {
  for (const s of ships) {
    if (s.blocking.some(b => b.includes('missing_required'))) {
      console.log(line + '/' + s.slug + '  score:' + s.score);
    }
  }
}
"
```

---

## Repair 3 — Wrong Section Order

**Target:** 8 ships with `[sections/wrong_section_order]`

**Expected order:**
```
page_intro → first_look → dining → logbook → faq → right_rail
```

**Before editing:**
- Read the file
- Map the current section order as-is
- Identify which section is out of place (validator output names it)
- Confirm the section IDs match the expected pattern

**Scope:** Move the misplaced section block. Do not edit its content. Do not touch any other section.

**Verification interrupt:** After moving a section, ask: *Could this break the page layout or JavaScript that depends on DOM order?* If yes, grep for JS that queries the section by ID before proceeding.

**After editing:**
- Run validator
- Confirm `[sections/wrong_section_order]` clears
- Confirm score did not drop anywhere else

---

## Repair 4 — Videos

**Target:** 62 ships with zero videos + 66 ships missing required categories

**This is the highest-impact repair. Most ships will jump from 60–78% to passing after this fix alone.**

**Before creating any video JSON:**
- Open `assets/data/videos/norwegian/norwegian-prima.json` (passing ship)
- Read and memorize the exact schema
- Confirm the file path pattern: `assets/data/videos/<line>/<slug>.json`

**Required video categories (all 8 must be present):**
```
ship walk through / top ten / suite / balcony / oceanview / interior / food / accessible
```

**For each ship:**
1. Check if JSON file exists at the expected path
2. If it does not exist → create it
3. If it exists but is empty or missing categories → add the missing entries
4. Minimum 10 total video entries
5. Run validator immediately after

**Verification interrupt:** Before creating any file, confirm the line slug in the path matches the directory name. A mismatch silently fails without error.

```bash
# Confirm path for a line before creating files
ls assets/data/videos/
```

**Do NOT add real YouTube URLs you haven't verified.** Use placeholder URLs formatted as `""` or `"#"` if actual URLs are not available. The validator checks for category presence, not URL validity.

**To find ships needing video files:**
```bash
node -e "
const d = JSON.parse(require('fs').readFileSync('data/validation-failures-detail.json','utf8'));
for (const [line, ships] of Object.entries(d)) {
  for (const s of ships) {
    const hasVideoError = s.blocking.some(b => b.includes('videos/'));
    if (hasVideoError) console.log(line + '/' + s.slug + '  score:' + s.score);
  }
}
"
```

**Work line by line, not ship by ship.** Finish all MSC ships before moving to Costa. This reduces context switching and makes spot-checking easier.

---

## Repair 5 — Image Counts

**Target:** 42 ships with `[images/few_images]` — only 5 images, need 8

**Additive repair — lowest regression risk.**

**Before editing:**
- Read the file
- Count current images and note their `src` paths
- Identify which of the 8 standard image types are missing:
  - Hero / exterior
  - Atrium / lobby
  - Balcony cabin
  - Suite interior
  - Main dining room
  - Pool deck / lido
  - Spa or gym
  - Port or destination

**Scope:** Add `<img>` tags to the page. Every added image must have descriptive alt text (minimum 6 words describing the scene, not just the ship name).

**After editing:**
- Run validator
- Confirm `[images/few_images]` clears
- Confirm no `[images/short_alt]` warnings were introduced

---

## Repair 6 — Logbook Stories

**Target:** 17 ships with `[logbook/few_stories]` (only 2 stories, need 10) + 6 ships with `[logbook/missing_file]`

**Highest content risk — this repair requires creating new narrative content.**

**Before creating any logbook:**
- Open `assets/data/logbook/norwegian/norwegian-prima.json` (passing ship)
- Read the complete structure: story format, field names, disclosure type, persona tags
- Do not write logbook stories from memory — model from the template

**Required spine sections in every logbook:**
1. Full Disclosure
2. The Crew and Staff
3. Embarkation
4. The Real Talk
5. Accessibility on the Seas
6. A Female Crewmate's Perspective *(required — missing in 102 ships)*
7. Closing Thoughts

**Each story must include:**
- Minimum 300 words
- At least 1 emotional pivot marker (surprise, awe, laughter, wonder, tears)
- Sensory detail across 3+ senses
- A reflection marker ("I learned", "looking back", "what I didn't expect")
- A disclosure type at the top: A (firsthand), B (research-based), or C (mixed)

**Forbidden content in logbook stories:**
- "Perfect for" (brochure)
- "luxury" used as marketing filler
- "world-class"
- "gamble" or gambling references

After adding stories, run the validator and check:
- `[logbook/few_stories]` cleared
- `[logbook/spine_sections_missing]` cleared
- `[logbook/missing_female_crewmate]` cleared
- No new `[content_purity/forbidden_*]` errors

---

## Repair 7 — FAQ Expansion

**Target:** 96 ships with `[word_counts/faq_too_short]` — under 200 words

**Low risk — additive only.**

**Before editing:**
- Read the current FAQ section
- Count existing words
- Determine how many more words are needed (target: ≥200 total across all FAQ answers)

**Scope:** Expand existing FAQ answers only. Do not add new FAQs beyond 8 (validator flags `faq/many_faqs` at 10+).

Each answer should be expanded to ~40 words of specific, useful information. No filler. No forbidden phrases.

**After editing:**
- Run validator
- Confirm `[word_counts/faq_too_short]` clears
- Confirm `[faq/many_faqs]` was not introduced

---

## Repair 8 — Logbook Spine Quality (Warnings)

**Target:** Ships still below 80 after Repairs 1–7, needing warning resolution

**Only work on ships still failing after the blocking error repairs.** Do not add spine sections to passing ships — unnecessary churn.

For ships sitting at 76–78%:
- Add missing spine sections to logbook
- Expand emotional content in existing stories
- Add persona coverage where missing (solo, family, honeymoon, elderly, widow, accessible)

---

## Stub Ships — Do Not Attempt to Patch

These ships score 4–32% and are effectively empty templates. They need full builds, not patches.

| Ship | Score | Action |
|------|-------|--------|
| `carnival/unnamed-project-ace-1` | 32% | Full build needed |
| `carnival/unnamed-project-ace-2` | 32% | Full build needed |
| `carnival/unnamed-project-ace-3` | 32% | Full build needed |
| `carnival/carnival-adventure` | 12% | Full build needed |
| `carnival/carnival-tropicale` | 4% | Full build needed |
| `celebrity/unnamed-edge-class` | 4% | Full build needed |
| `celebrity/unnamed-project-nirvana` | 4% | Full build needed |
| `celebrity/unnamed-river-class-x6` | 4% | Full build needed |

**Do not patch these during the repair run.** Schedule them separately as new-build tasks.

**If any of these are in the atlas now**, flag for removal until they reach 90%+. Check:
```bash
node -e "
const d = JSON.parse(require('fs').readFileSync('data/validation-failures-detail.json','utf8'));
const stubs = (d.carnival||[]).filter(s => s.score <= 32);
stubs.push(...(d.celebrity||[]).filter(s => s.score <= 4));
stubs.forEach(s => console.log(s.slug + ' ' + s.score + '%', s.warnings.find(w=>w.includes('atlas')) ? '← IN ATLAS' : ''));
"
```

---

## Commit Protocol

Commit after each ship, not after each wave.

**Commit message format:**
```
Fix [line]/[slug]: [what was fixed] — [score before] → [score after]

[List exactly what files were changed and what was left alone]
```

**Example:**
```
Fix msc/msc-armonia: add videos JSON — 68% → 92%

Added assets/data/videos/msc/msc-armonia.json with 10 entries
covering all 8 required categories. IMO left as-is (valid).
Logbook intentionally not touched — no blocking errors there.
```

---

## Integrity Test (Before Every Commit)

1. Are all claims in my commit message verifiable? Can I prove the score changed?
2. Did scope expand beyond what was planned?
3. Would this survive line-by-line audit?
4. Are any material assumptions from the table above still unresolved?
5. Did any passing ship change? Run a spot-check on one passing ship from the same line.

---

## Progress Tracking

After finishing each cruise line, run the full batch validator and update this table:

| Line | Before | After | Status |
|------|--------|-------|--------|
| rcl | 71% | 100% | ✓ Complete |
| carnival | 56% | 100% | ✓ Complete |
| celebrity | 55% | 100% | ✓ Complete |
| msc | 33% | 100% | ✓ Complete |
| costa | 0% | 100% | ✓ Complete |
| oceania | 38% | 100% | ✓ Complete |
| regent | 0% | 100% | ✓ Complete |
| seabourn | 43% | 100% | ✓ Complete |
| silversea | 8% | 100% | ✓ Complete |
| explora | 0% | 100% | ✓ Complete |
| virgin | 50% | 100% | ✓ Complete |
| cunard | — | 100% | ✓ Complete |
| hal | — | 100% | ✓ Complete |
| norwegian | — | 100% | ✓ Complete |
| princess | — | 100% | ✓ Complete |

**Result as of 2026-03-25:** 290/290 ship pages PASS (100%). 21 non-ship pages (index, template, quiz) are out of scope.

**Target:** ≥ 93% overall pass rate when all non-stub repairs complete.

---

*Careful, not clever.*
*Soli Deo Gloria.*
