# Phase 3.2c — ai-summary cleanup, batch 3

**Date:** 2026-05-09
**Branch:** claude/phase3-2c-boilerplate-batch-3 (stacked on 3.2b)
**Companion:** PR (TBD), follows 3.2b PR #1477.

## What this batch does

Clears the remaining 26 ships flagged by `icp_lite/ai_summary_boilerplate` after 3.2b's validator tightening. All 26 are full rewrites (no mechanical propagations available — every ai-summary itself was boilerplate).

After 3.2c, the **fleet-wide `ai_summary_boilerplate` count is 0**.

## Distribution

| Cruise line | Count | Pattern observed |
|---|---:|---|
| Celebrity Cruises | 12 | "Ship • Celebrity Cruises • In The Wake. Deck plans, dining venues, stateroom tours, and live ship tracker." |
| Holland America Line | 7 | Same template, HAL line; meta-description varies (some rich, some still template) |
| Royal Caribbean | 6 | "historical information, legacy, and ship details" lazy template + 1 trailing-boilerplate (Radiance) + 1 test fixture + 1 placeholder |
| MSC | 1 | Real specs followed by trailing boilerplate phrase (only the trailer needed trimming) |

## Mechanism

Same as 3.2b: `admin/phase3-2b-rewrite.cjs` (general-purpose, kept) accepts a JSON map and replaces ai-summary + propagates to description meta + JSON-LD descriptions. Total 54 replacements across 26 files.

## Where the facts came from

The `<li><strong>` fact block I checked first in 3.2b's discovery is a *display* element — many pages don't have it populated. The actual structured ship facts on each page live in:

- `<meta name="description">` (often line 31, varies)
- Body prose `<p>` paragraphs (often in logbook intro or "About this ship" sections)
- JSON-LD FAQ `text` fields (in `mainEntity` answer blocks)
- Hidden inline data blobs (`"Signature Class","entered_service":2010,"gt":"86,700 GT"` style)

For each ship I cross-referenced at least 2 of these sources before writing a fact-bearing summary.

## Rewrites (26)

| Ship | Chars | Class anchor | Voice line gist |
|------|-----:|--------------|-----------------|
| `holland-america-line/nieuw-amsterdam.html` | 219 | Signature (2010, 86,700 GT, 2,106 guests) | First-with-Tamarind/Loft-suites; Eurodam's sister |
| `holland-america-line/volendam.html` | 217 | Rotterdam (1999, 61,214 GT, 1,432 guests) | "Art ship era"; quieter cruising |
| `holland-america-line/eurodam.html` | 231 | Signature (2008, 86,273 GT, 2,104 guests) | Class lead before Nieuw Amsterdam |
| `holland-america-line/oosterdam.html` | 225 | Vista (2003) | Second Vista-class after Zuiderdam |
| `holland-america-line/noordam.html` | 232 | Vista (2006, 82,305 GT, 1,972 guests) | Standard HAL dining lineup, calmly executed |
| `holland-america-line/none-announced.html` | 189 | Placeholder | Parks the slot for whenever a new keel is laid |
| `holland-america-line/zaandam.html` | 214 | Rotterdam (2000, 61,396 GT, 1,432 guests) | Music-themed art collection at sea |
| `rcl/radiance-of-the-seas.html` | 228 | Radiance (2001, 90,090 GT, 2,143 guests) | "Ocean views over deck count" |
| `rcl/sun-viking.html` | 231 | Song of Norway (1972, 18,445 GT, 700 guests) | "The cruise line's origin scale, before megaships" |
| `rcl/viking-serenade.html` | 223 | Built 1982 as Scandinavian Star | "Captures a transitional-era RCL ship" |
| `rcl/oasis-class-ship-tbn-2028.html` | 231 | Oasis 7th (TBN 2028) | Steel cut October 2025; sister chain |
| `rcl/nordic-prince.html` | 216 | Song of Norway (1971, 23,149 GT, 1,000 guests) | RCL's second-ever ship, 1971–1995 |
| `rcl/test/allure-of-the-seas.html` | 212 | Test fixture | "Used for ICP/validator regression testing" |
| `celebrity-cruises/unnamed-project-nirvana.html` | 192 | Placeholder (codename) | Fills in once Celebrity confirms class |
| `celebrity-cruises/celebrity-infinity.html` | 216 | Millennium (2001, 90,940 GT, 2,170 guests) | "Closer Alaska glacier approaches than the megaships" |
| `celebrity-cruises/celebrity-flora.html` | 243 | Galápagos expedition (~5,739 GT, 100 guests) | "Antithesis of the megaships in the same brand" |
| `celebrity-cruises/celebrity-xperience.html` | 199 | Galápagos, formerly Eclipse | "Smaller and older" Galápagos vessel |
| `celebrity-cruises/unnamed-edge-class.html` | 230 | Edge-class placeholder | Magic Carpet / Rooftop Garden hallmarks |
| `celebrity-cruises/celebrity-millennium.html` | 225 | Millennium lead (2000, 90,940 GT, ~2,000 guests) | 2019 Revolution refit, all four sisters |
| `celebrity-cruises/celebrity-compass.html` | 204 | River Class (2027, ~180 guests) | "Ocean-brand entering river territory" |
| `celebrity-cruises/unnamed-river-class-x6.html` | 199 | Six River Class placeholders | "Parks the slots" |
| `celebrity-cruises/celebrity-seeker.html` | 194 | River Class (2027, ~180 guests) | Celebrity's brand-new river program |
| `celebrity-cruises/celebrity-summit.html` | 226 | Millennium (2001, 90,940 GT, 2,170 guests) | The Retreat suite-class with private sundeck |
| `celebrity-cruises/celebrity-constellation.html` | 220 | Millennium (2002, 90,940 GT, 2,170 guests) | Last of four Millennium sisters |
| `celebrity-cruises/celebrity-xcel.html` | 216 | Edge (~140,600 GT, ~3,260 guests) | Fifth Edge-class hull |
| `msc/msc-world-america.html` | 226 | World Class (2025, 216,638 GT, 5,079 guests) | Saint-Nazaire LNG; 11-deck Venom Drop dry slide |

## Verification

```bash
# All 26 ships pass ai_summary_boilerplate AND ai_summary_length:
$ for f in $(cat /tmp/phase3_2c_targets.txt); do
    node admin/validate-ship-page.js "$f" --json-output 2>/dev/null \
      | jq -r '[.blocking_errors[]? | select(.rule | test("ai_summary"))] | length'
  done | sort -u
0
```

Fleet-wide sweep across all 290 ship pages: `ai_summary_boilerplate` count = **0**. The 3.2a → 3.2b → 3.2c sequence has cleared all known boilerplate variants under the tightened phrase list.

## Mid-batch correction

I initially asked the user to defer 4 HAL ships (Eurodam, Oosterdam, Noordam, Zaandam) as Phase 3.2d on the premise that they were "content stubs" without on-page facts. That premise was wrong — I was checking the `<li><strong>` fact-block element, which is sparse on those pages, instead of the meta description tag and body prose, which carry full specs. After re-verification, the user approved expanding back to all 26. No 3.2d filing was needed.

This is the kind of mistake the careful-not-clever v1.7 *Layer 2 Cross-Surface Verification* exists to catch (verify *all* surfaces, not the first one you check). Logged here so future ai-summary work doesn't repeat it.

## Multi-LLM consultation

Skipped, same as 3.2b. The fact + voice template is well-rehearsed at this point (3.2a Grok challenge-pass set the precedent). If reviewer feedback flags any single rewrite as weak, individual rewrites can go through `consult` after the fact.

## Effect on dashboard

Dashboard `audit-reports/ship-validation-dashboard.{json,html}` regenerated post-batch. Ship validation status reflects the post-3.2c state.
