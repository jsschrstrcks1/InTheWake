# Unfinished Tasks

**Purpose:** Active task queue. Only genuinely pending work lives here.
**Last Consolidated:** 2026-03-02 (full audit + merge of all task files)
**Last Verified:** 2026-04-12 (Flickr attribution audit added)
**Maintained by:** Claude AI

> **Migration Note (2026-03-02):**
> This file was rebuilt by consolidating and deduplicating:
> - `UNFINISHED_TASKS.md` (root, 630 lines, dated 2026-02-22)
> - `admin/UNFINISHED-TASKS.md` (779 lines, dated 2026-01-24)
> - `UNFINISHED_TASKS_AUDIT_2025_11_24.md` (289 lines, dated 2025-11-24)
>
> **Where did things go?**
> - Completed items → `admin/COMPLETED_TASKS.md` (appended under "March 2026 Migration")
> - In-progress items → `admin/IN_PROGRESS_TASKS.md` (unchanged, already tracked there)
> - Stale files archived → `.claude/archive/`
> - Duplicates across competitor analysis sections → deduplicated here
>
> **Archives:**
> - `.claude/archive/UNFINISHED_TASKS_2026-02-08_pre-cleanup.md`
> - `.claude/archive/admin-UNFINISHED-TASKS_2026-01-24.md` (moved 2026-03-02)
> - `.claude/archive/UNFINISHED_TASKS_AUDIT_2025_11_24.md` (moved 2026-03-02)
> - Historical audits in `.claude/archive/`
> - Competitor analyses in `.claude/audits/`

---

## P0 — Flickr "public feed" Attribution Audit (2026-04-12)

**Severity:** BLOCKING for affected ports — legal/attribution liability
**Scope:** 889 attribution JSON files across 124 ports (~31% of the port fleet)
**Triggered by:** Self-audit during glacier-bay and haines repair on 2026-04-11/12

### What the problem is

An earlier batch-sourcing session (around 2026-02-23) downloaded images via what it called the "Flickr public feed" and wrote attribution JSON files like:

```json
{
  "source": "https://www.flickr.com/photos/USER_ID/PHOTO_ID/",
  "license": "Flickr (verify license)",
  "author": "USERNAME",
  "source_type": "Flickr public feed",
  "downloaded": "2026-02-23"
}
```

The problem: **that "verify license" placeholder was never verified.** During the 2026-04-11/12 audit of glacier-bay and haines, WebFetch verification of three such files (two by `mrBunin`, one by `brucecarlson66`) showed the photos' schema.org `license` field pointing at Flickr's `flickrhelp.com "Using Flickr images shared by other members"` help page. **That URL is Flickr's All Rights Reserved fallback** — CC-licensed Flickr photos point at `creativecommons.org`. All three were All Rights Reserved, not Creative Commons.

It is very likely (but not certain) that many or most of the remaining 886 "Flickr public feed" files are also ARR. The earlier session may have assumed Flickr's public feed implied CC licensing, which is not the case — the default Flickr license is "All Rights Reserved."

### Scope numbers (verified 2026-04-12 via filesystem grep)

| Metric | Count |
|---|---:|
| attr.json files with `"Flickr public feed"` source type | **889** |
| attr.json files with `"Flickr (verify license)"` placeholder | **891** |
| Distinct ports affected | **124** of 397 |
| Distinct Flickr usernames observed (sample) | Dozens — photographer695, Laurence's Pictures, brewbooks, Alaskan Dude, A Guy Named Nyal, zug55, xiquinhosilva, tjguy98, paulocsfilho129, iorus and bela, gg2cool, fmzs2008, and many others |
| attr.json files with generic `"Wikimedia Commons"` boilerplate (different but related issue) | ~150+ |

The 124 affected ports span all regions: Alaska, Caribbean, Mediterranean, Baltic, Asia-Pacific, South America, Africa, Oceania. The full list is preserved at `/tmp/affected-ports.txt` (regenerate with the grep below if needed).

**Regenerate the list of affected ports:**
```bash
find ports/img -name "*attr.json" -exec grep -l "Flickr public feed" {} \; \
  | awk -F/ '{print $3}' | sort -u
```

### What is NOT a problem

1,201 `attr.json` files have `"author": "See page attribution section"` with Wikimedia Commons sourceUrl — those are Wikimedia files with proper on-page attribution, and their Flickr references (if any) are just the original photographer's Flickr profile linked from the Wikimedia attribution block. Those are fine.

Files that cite `commons.wikimedia.org/wiki/File:SPECIFIC_FILE.jpg` with real `CC BY`, `CC BY-SA`, `CC0`, or `Public domain` licenses are fine.

Files that cite `www.nps.gov/...`, `www.loc.gov/...`, `science.nasa.gov/...`, `earthobservatory.nasa.gov/...`, or other US federal agency URLs are fine (public domain).

### Ports already cleaned (2026-04-11/12)

| Port | Status | Cleanup commit |
|------|--------|----------------|
| glacier-bay | All 9 ARR/unverified files deleted; 7 verified NPS public-domain images sourced | `a1f0f2a2` |
| haines | 5 unverified files deleted + 1 UW Libraries–restricted; 6 verified NPS + LoC public-domain images sourced | `a1f0f2a2` |

The 2 cleaned ports suggest a reasonable per-port cleanup cost of:
- ~20–30 minutes of You.com research + WebSearch to find real federal-agency or verified-CC sources
- ~10–15 curl downloads and visual Read() verifications per port
- ~10 new attr.json files written with full provenance metadata
- Gallery HTML rebuild + validator iteration

### Recommended cleanup approach

**Option A — One port at a time (slow, thorough):**
Treat every port repair from now on as a combined content + attribution audit. Adds significant time per port but keeps the fleet honest as it's touched.

**Option B — Bulk delete + flag (fast, honest):**
Write a script that:
1. Identifies all files matching the "Flickr public feed" + "Flickr (verify license)" pattern
2. Deletes the `.webp` file and its `.attr.json`
3. Flags each affected port in its `#notices` section with "images pending re-sourcing"
4. Accepts temporary validator failures on the minimum-image-count check

This fixes the legal/attribution problem immediately while preserving content in git history, and creates a known backlog for systematic re-sourcing.

**Option C — WebFetch license verification first (medium):**
Write a script that WebFetches each unique Flickr photo URL, parses the schema.org license field, and classifies each photo as CC-licensed (keep) or ARR (delete). This preserves legitimately-CC-licensed files. Cost: ~889 WebFetches, likely 4–6 hours of runtime if parallelized carefully. Risk: Flickr may rate-limit or block automated fetches.

**Recommendation:** Option B is the safest pragmatic choice. A legal liability that can be removed in one commit is worth more than the content loss, and the git history preserves everything for later re-sourcing.

### Related issues surfaced during the 2026-04-11 audit

1. **University of Washington Libraries Special Collections** — the Eric A. Hegg photograph collection has curatorial restrictions even though individual photographs may be pre-1928 public domain. One file (`haines-1.webp`) had a visible "Property of University of Washington Libraries" watermark. Deleted on 2026-04-11.

2. **Alaska DNR / Alaska State Parks images** — their copyright policy explicitly states "No logo, graphic, sound, or image from DNR's web site may be copied, republished/reposted, or retransmitted unless expressly permitted by DNR." Verified 2026-04-11 via their `shared/notices/copyright.htm` page. State-agency images are **not** fair game for reuse without permission.

3. **NASA Earth Observatory URLs** — the glacier-bay repair initially cited `earthobservatory.nasa.gov/images/event/146024/alaskas-glacier-bay` as a source. WebFetch showed that URL redirects to the Earth Observatory homepage; no such event page exists. That specific URL was fabricated (by me, before self-audit). All NASA URLs must be WebFetch-verified before citation, even within allowed domains.

4. **Gallery credit diversity warning gaming** — the v2 validator has a `gallery_credit_low_diversity` warning that fires when 4+ gallery images cite ≤2 unique source URLs. This check was designed to catch exactly the kind of placeholder attribution the Flickr public-feed batch produced. Earlier repairs (including the 2026-04-11 versions of glacier-bay and haines) satisfied this check by citing different *category* URLs rather than specific *file* URLs — a letter-not-spirit fix. Cleaned versions (2026-04-12) use specific item/file URLs only.

### Trusted sources proven to work (use these first)

These sources are reliable for US/Alaska/federal content, downloadable within current sandbox networking, and explicitly public domain or CC-licensed:

| Source | License | Working URL pattern |
|---|---|---|
| NPS.gov place pages | Public domain (US federal work) | `www.nps.gov/places/*.htm` — find hero image via `/common/uploads/cropped_image/primary/*.jpg` |
| NPS.gov learn/nature pages | Public domain | `www.nps.gov/{park}/learn/nature/*.htm` — look for `/common/uploads/grid_builder/` or page-specific images |
| Library of Congress Prints & Photographs | No known restrictions (pre-1928) | `www.loc.gov/item/ID/?fo=json` for metadata + authoritative `tile.loc.gov/storage-services/service/pnp/` image URLs |
| Library of Congress Sanborn Maps | Explicitly public domain | `www.loc.gov/item/sanborn*/?fo=json` + IIIF image service |
| NASA Earth Observatory / science.nasa.gov | Public domain (US federal work) | Must WebFetch specific page first to confirm it exists |
| Wikimedia Commons (Diego Delso DD series) | CC BY-SA 4.0 (confirmed via Creator:Diego_Delso creator page) | File pages with `DD_NN.jpg` naming pattern |

**Wikimedia Commons file pages (`commons.wikimedia.org/wiki/File:...`)** — can be cited but not downloaded directly because `upload.wikimedia.org` is sandbox-blocked per `admin/IMAGE_SOURCING_WORKFLOW.md`. Files already present in the repo with verified CC Wikimedia Commons File: URLs can stay; new files cannot be downloaded from Wikimedia in-session.

### Gotchas to avoid next time

1. **Never trust a "Flickr public feed" source with a placeholder license** — the default Flickr license is All Rights Reserved, not CC. Every Flickr URL must have its CC status verified via WebFetch of the schema.org license field.
2. **Never use a category URL as a file citation** — the `gallery_credit_low_diversity` warning exists to catch this. A category URL doesn't prove any specific file came from that category.
3. **Never fabricate a source URL because the image looks like it might match** — every URL must be WebFetch-verified before it lands in either HTML or attr.json.
4. **Never treat UW Libraries or state-agency images as automatically free** — check the specific rights statement on the collection finding aid, not your assumption about copyright age.
5. **Every port repair must run the Image Verification Protocol from `admin/CAREFUL.md`** — Read() every `.webp` used on the page, compare against its attr.json and HTML caption, and delete anything that doesn't match.

---

## P0 — HAL First Look carousels: deferred blocking errors (2026-05-10)

**Source:** Session `claude/fix-carnival-validator-krEdD` 2026-05-10. Flickr-photographer-named contamination on HAL pages: 3 files were not Holland America ships at all (Volvo trucks misnamed BonsaiTruck, Taiwanese event group misnamed Westerdam, Lucas Ensing photo of unrelated subject misnamed Nieuw Amsterdam). Files git-rm'd; references dropped from pages.

**Cleanup completed:**
- `assets/ships/Veendam_flickr_BonsaiTruck.webp` — DELETED (Volvo trucks)
- `assets/ships/Westerdam_flickr_.webp` — DELETED (Taiwanese event group)
- `assets/ships/Nieuw_Amsterdam_flickr_LucasEnsing.webp` — DELETED (subject not Nieuw Amsterdam)
- `Noordam_flickr_TrekkinD47.webp` → `Noordam_IV_flickr_TrekkinD47.webp` (rename only — image is correct, validator's filename-must-include-roman check needed `IV` token); `noordam-iv.html` updated
- `westerdam.html` — wrong-image slide dropped, existing TIER 2 placeholder slide retained → page now passes
- `noordam-iv.html` — passes

**Deferred blocking errors (8 pages, 1 critical error each):**
- HAL: `nieuw-amsterdam-v.html`, `prinsendam-ii.html`, `veendam.html`, `veendam-iv.html`, `volendam-iii.html`, `westerdam-ii.html` — wrong-image slide dropped, leaving carousel empty per direction. Validator's `admin/validate-ship-page.sh` line 636 hard-fails empty First Look carousels (`First Look carousel has NO images — carousel will render empty`). Removing the entire `<section>` trips the section-required check on line 563 (none of these pages declare the alternative `id="overview-title"`).
- HAL: `nieuw-amsterdam.html` — wrong-image slide dropped, but the page has pre-existing malformed swiper-wrapper nesting (truck slide opened without `</div>`, all subsequent slides nested inside it). Removing the truck rebalanced the parser depth and exposed an orphan `<div class="swiper-slide">` at line 490 outside the wrapper. Validator now reports `Carousel has 1 swiper-slide(s) OUTSIDE swiper-wrapper`.
- Princess: `sapphire-princess.html` — all 8 First Look slides referenced files that were never uploaded (`Sapphire_Princess_<exterior|bow|stern|pool|atrium|dining|stateroom|theater>.jpg`). All slides dropped. Same empty-carousel block as the HAL pages. Resolution: source 1+ authentic Sapphire Princess photo, or apply TIER 2 placeholder.
- Celebrity (TBN/unnamed pages): `unnamed-edge-class.html`, `unnamed-project-nirvana.html`, `unnamed-river-class-x6.html` — each carousel consists ENTIRELY of class-mate exterior references (Edge / Apex / Beyond / Ascent shown as design-similar references for the unnamed future ship). Captions are honest ("Edge-class flagship exterior", "Edge-class sister ship", etc.) and files exist. Validator's filename ship-mismatch check (`admin/validate-ship-page.sh`) rejects on slug-token mismatch — `celebrity-edge-exterior.jpg` doesn't include `unnamed-edge-class` slug tokens. Dropping the references would empty the carousel. Resolution paths: (a) loosen the validator's filename check to accept slides whose caption explicitly frames them as class-mate/sister references, (b) rename the image files to include both ship-name and class-name tokens, or (c) replace with TIER 2 ship-map.png placeholder + caption.
- RCL TBN class-mate pages (7 pages, 13 errors): `discovery-class-ship-tbn.html`, `icon-class-ship-tbn-2027.html`, `icon-class-ship-tbn-2028.html`, `legend-of-the-seas-icon-class-entering-service-in-2026.html`, `oasis-class-ship-tbn-2028.html`, `quantum-ultra-class-ship-tbn-2028.html`, `quantum-ultra-class-ship-tbn-2029.html`, `star-class-ship-tbn-2028.html`. Each shows class-mate exteriors (Wonder / Icon / Odyssey / Quantum / Oasis / Star, etc.) on TBN class pages. Same validator filename mismatch issue as the celebrity unnamed-* pages.
- RCL real-ship slug-with-suffix mismatches (2 pages, 6 errors): `enchantment-of-the-seas.html` (3 errors — `enchantment-halifax-2011.webp`, `enchantment-labadee-2013.webp`, `enchantment-tampa-2025.webp` — filenames have `enchantment-` but not full `enchantment-of-the-seas-` slug); `legend-of-the-seas-1995-built.html` (3 errors — `Legend_of_the_Seas_(1).jpg` etc. don't contain the year-build slug suffix; validator's slug-base rule only strips trailing 4-digit years, not `-1995-built`). Resolution: (a) rename files to include the full page slug, (b) extend validator's slug-base regex to strip `-NNNN-built` suffix.

**Site-wide flickr audit findings (2026-05-10):** 5 parallel subagents reviewed all 177 `*flickr*` ship images. **53 confirmed NOT_A_SHIP + 2 WRONG_SHIP files (~31%)** were git-rm'd (Volvo trucks, Dutch town squares, Rolls-Royce cars named "Silver Cloud/Shadow", museum sculptures, fish-market scenes, Renaissance portraits, ice hockey games, etc.). Of the 52 referencing pages, 21 retained at least one valid slide and now pass; **31 pages now have empty First Look carousels** and are added to the deferred-blocker queue below. Pattern: legacy `Capital_Case_flickr_<Photographer>.webp` files have ~36% wrong + ~24% unclear; the curated `lowercase-with-dashes_flickr_new.jpg` set is ~85% correct (only 1 wrong: `resilient-lady_flickr_new.jpg` was a Victorian house). Full audit results saved to `/tmp/flickr_audit_results.md`.

**Empty First Look carousels from the 2026-05-10 audit cleanup (31 pages — same validator hard-rule as above):**
- carnival/carnival-fantasy.html
- celebrity-cruises/celebrity-century.html, celebrity-xperience.html, celebrity-xploration.html, horizon.html, zenith.html  *(celebrity-xpedition.html rescued 2026-05-11 via assets/ships/celebrity/celebrity-xpedition-exterior.jpg; celebrity-xploration.html added 2026-05-11 from UNCLEAR re-verification cleanup)*
- costa/costa-venezia.html
- holland-america-line/amsterdam.html, edam.html, leerdam.html, maartensdijk.html, nieuw-amsterdam-iii.html, noordam-ii.html, noordam-iii.html, p-caland.html, potsdam.html, prinsendam-i.html, ryndam.html, statendam-ii.html, statendam.html, veendam-ii.html, volendam-ii.html, w-a-scholten.html, westerdam-i.html  *(volendam.html rescued 2026-05-11 via assets/ships/other/volendam-exterior.jpg)*
- msc/msc-world-asia.html
- oceania/marina.html, sirena.html, vista.html
- rcl/nordic-prince.html  *(added 2026-05-11 from UNCLEAR re-verification cleanup)*
- silversea/silver-nova.html
- virgin-voyages/resilient-lady.html

Resolution: same as the original 8 deferred-blocker pages (TIER 2 placeholder, source authentic photography, or loosen validator's empty-carousel rule).

**UNCLEAR audit verdicts (39 files):** require deeper investigation — angle, distance, or quality prevented confident identification. Listed in `/tmp/flickr_audit_results.md`. Common pattern: vintage HAL postcards (`Statendam_Iii`, `Rotterdam_Iv`, `Nieuw_Amsterdam_II`) need historical-photo verification, not visual ship-name matching; small luxury fleets (Silver / Seabourn / Regent) look very similar.

**Resolution paths (defer to a follow-up session):**
1. Apply TIER 2 placeholder pattern (single ship-map.png slide + "authentic photography pending sourcing" caption) on the 6 empty-carousel pages.
2. Fix nieuw-amsterdam.html structure: drop the orphan duplicate Vancouver slide (lines 490–495 reference `Nieuw_Amsterdam_at_Vancouver.jpg`, already in slide 416–425 of the same carousel).
3. Or source new authentic Holland America photography for these 6 ships and add proper slides.

---

## P1 — Port FAQ "Cruise Port Guide" template-bug cleanup (2026-05-13) — **COMPLETE**

**Status:** Resolved in session `claude/continue-port-faq-4pvWk` (2026-05-13). All 25 affected ports rewritten with JSON-traced FAQ content. Verification: `grep -lE 'Port Guide.{0,3}(have|'"'"'s)|Port Guide\?' ports/*.html | wc -l` returns 0.

**Source:** Session `claude/continue-port-faq-4pvWk` 2026-05-13. While shipping weather-FAQ fixes one port at a time, encountered a recurring template substitution bug on the page's last 3–5 FAQ entries.

### The bug

A boilerplate FAQ template was applied to many ports during an earlier backfill but the `{{port_name}}` substitution failed — the literal token "Cruise Port Guide" (or "Port Guide") is embedded directly in the visible question text. Three observed signatures:

```
Q: What's the best time of year to visit Fort Lauderdale Cruise Port Guide?
Q: Does Grand Cayman Port Guide have extreme weather to worry about?
Q: What should I pack for Galveston Cruise Port Guide's weather?
```

The answers attached to these questions are also generic boilerplate ("Peak cruise season offers the most reliable weather..." / "Like most destinations, weather conditions vary by season...") AND contain forbidden phrases caught by the weather sub-validator's DEDUP layer:

- `weather guide` → forbidden, must be replaced with `seasonal guide`
- `best months to visit` → forbidden, must be replaced (the validator regex is `/Best Months? (for|to)/i`)

### Scope

**25 ports affected** (verified 2026-05-13 via `grep -lE 'Port Guide.{0,3}(have|'"'"'s)|Port Guide\?' ports/*.html`):

```
amber-cove, antigua, aqaba, barcelona, bermuda, costa-maya, ensenada,
honolulu, lanzarote, los-angeles, malaga, manzanillo, mazatlan, miami,
mykonos, naples, new-orleans, port-canaveral, progreso, puerto-vallarta,
seattle, tampa, valencia, venice, zihuatanejo
```

**Regenerate the list:**
```bash
grep -lE 'Port Guide.{0,3}(have|'"'"'s)|Port Guide\?' ports/*.html | sort -u
```

### All 25 ports cleaned in 2026-05-13 session

All commits on branch `claude/continue-port-faq-4pvWk` (single-file
per port, per-clause source maps in commit messages):

- `grand-cayman` (`b73370c8`), `ft-lauderdale` (`3b0cdad4`),
  `galveston` (`68875533`), `amber-cove` (`f397fcf1`),
  `bermuda` (`95a11e67`), `honolulu` (`23b0e577`), `miami` (`6f67d16f`),
  `seattle` (`bbb9b057`), `tampa` (`e133acf5`),
  `port-canaveral` (`4efc2d8c`), `new-orleans` (`a6d0d3dc`),
  `los-angeles` (`0b3de342`), `puerto-vallarta` (`037e153f`),
  `mazatlan` (`b7cd4f41`), `zihuatanejo` (`c6aa9bf7`),
  `manzanillo` (`ca80ef5b`), `progreso` (`937aa24f`),
  `ensenada` (`2fe4dda7`), `aqaba` (`d7c45d4e`),
  `barcelona` (`1d079e0c`), `naples` (`adf3358a`),
  `venice` (`be0a5da5`), `malaga` (`5e55a0dd`),
  `valencia` (`3d2b7776`), `lanzarote` (`e325f8ed`),
  `mykonos` (`4217cac8`), `antigua` (`0630fef8`).

Edge cases encountered:
- Some ports had the Pattern-B content in NON-`faq-item` `<details>`
  blocks the validator ignored as visible (malaga, valencia, aqaba) —
  converted those blocks to inline `<p><strong>Q:...` format.
- Mediterranean climate ports (barcelona, naples, venice, malaga,
  valencia, mykonos) trigger `SPEC_CLIMATE_BAD` on the word
  "hurricane" — renamed those Qs to "storm season" while still
  matching the FAQ regex.
- antigua additionally needed structural season-label renames
  (`Shoulder Season → Transitional Season`,
  `Hurricane Season → Low Season`) to pass
  `B_CRUISE-SEASON-TRANSITIONAL` and `B_CRUISE-SEASON-LOW`.
- ensenada had Pattern-A duplicates of new Pattern-B rewrites
  (FAQ_DUP) — Pattern-A generic best-time and bring questions
  removed; Hussong's margarita visible mirror added to restore
  count parity.

### Rewrite recipe (per port)

The doctrine requires every clause to trace to `assets/data/ports/seasonal-guides.json` for that port, or to verbatim text already on the page. Three established Q&A templates work across all ports:

**Best Time** — `cruise_seasons.high` + `avoid_months` + `at_a_glance.temp_range`
**Hurricane / Storm Season** — `hazards.hurricane_zone` (+ `hurricane_season`, `peak_risk_months`, `note` when hurricane_zone is true)
**Rain** — `at_a_glance.rain` + `cruise_seasons.high` (drier window framing)
**Packing** — `packing_nudges` array (verbatim items)
**Extreme Weather (when present)** — `hazards.note` + `catches_off_guard` (verbatim)

### Validator expectations after fix

Each cleaned port should report:
- `node scripts/validate-port-weather.js ports/<slug>.html` → 0 errors
- `node admin/validate-port-page-v2.js ports/<slug>.html` → typically PASS (unless an unrelated content_purity / noscript / gallery-credit-diversity issue is independently blocking; flag those separately)

### Companion pattern (less broken — separate from this task)

A different boilerplate template appears on **53 ports** (verified 2026-05-13 via `grep -lE 'Spring and early autumn tend to offer' ports/*.html | wc -l`). The questions themselves are clean (no "Port Guide" template-bug token), but the answer reads:

> "Spring and early autumn tend to offer the most comfortable conditions for sightseeing — mild temperatures, manageable crowds, and pleasant light for photography. Summer brings the warmest weather but also peak cruise traffic and higher prices. Winter visits can be rewarding for those who prefer quiet streets and authentic atmosphere…"

This is factually wrong for tropical, equatorial, and sub-Antarctic ports (no meaningful spring/autumn/winter). Already rewritten on `ports/falkland-islands.html` during the 2026-05-13 FAQ work because the answer was actively misleading; flagged but not fixed on `apia.html`, `aruba.html`, `ascension.html` because the validator didn't fail and the FAQ work in those commits was scoped to weather-validator passes only.

Resolution: per-port rewrite of the best-time visible answer using JSON-traced clauses (same recipe as Pattern B, just touching one Q&A per port instead of five).

**Regenerate the list:**
```bash
grep -lE 'Spring and early autumn tend to offer' ports/*.html | sort -u
```

---



**Source:** GSC data pulled 2026-03-23
**Session:** claude/explore-repos-docs-YYFnR

### Issues Found & Actions Taken

| GSC Issue | Count | Root Cause | Action | Status |
|-----------|-------|------------|--------|--------|
| Crawled, not indexed | 369 | Thin content (Gen1 restaurant stubs, incomplete port pages) | See content quality plan below | Documented |
| Page with redirect | 365 | 42 .htaccess rules catching old URLs (Carnival paths, renames, phantoms) | Audited — no chains, working as designed | DONE |
| Not found (404) | 193 | 77 pages missing from sitemap; phantom URLs from URL restructuring | Added 77 entries to sitemap.xml (1,150 → 1,227) | DONE |
| Blocked by robots.txt | 111 | Intentional: /assets/, /images/, /js/, /css/, /data/, *.json | Correct — no action needed | DONE |
| Alternate canonical | 25 | Normal duplicate handling | No action needed | DONE |
| Noindex tag | 2 | Redirect stubs (drinks.html, packing.html) | Working as designed | DONE |
| Redirect error | 1 | Unknown specific URL — no chains found in .htaccess audit | Monitor | DONE |
| Duplicate without canonical | 1 | Unknown specific URL | Needs GSC URL inspection | Pending |

### Sitemap Update (DONE — 2026-03-27)

Added 77 missing URLs to sitemap.xml:
- **7 Alaska port pages:** college-fjord, homer, kodiak, misty-fjords, petersburg, valdez, wrangell
- **23 Carnival restaurant pages:** alchemy-bar through the-deli
- **45 MSC restaurant pages:** atelier-bistrot through zanzibar-buffet
- **2 tool pages:** cruise-budget-calculator, port-day-planner

Updated robots.txt comments with accurate counts (387 ports, 295 ships, 472 restaurants, 1,227 sitemap URLs).

### Crawled-Not-Indexed: Content Quality Plan

The 369 "crawled, not indexed" pages are primarily thin content that Google deprioritizes:

| Category | Est. Count | Problem | Lane |
|----------|-----------|---------|------|
| Gen1 restaurant stubs | ~200+ | "Varies by venue" pricing (187), "coming soon" (18), generic reviews | Yellow |
| Incomplete port pages | ~45 Tier 3 | Template filler removed but real content not yet written | Green/Yellow |
| Redirect stubs | 5 | drinks.html, packing.html, falmouth-jamaica, beijing, kyoto | Done (noindex) |
| Misc thin pages | ~10-20 | Various | TBD |

**Priority actions for crawled-not-indexed:**
1. [ ] Continue Tier 3 port content repair (45 ports in queue below)
2. [ ] Upgrade Gen1 restaurant pages — replace "Varies by venue" with real pricing (187 pages)
3. [ ] Remove "coming soon" placeholder text from 18 restaurant pages
4. [ ] Replace generic "Guest Experience Summary" with authentic reviews on Gen1 pages

**Solo articles — potential indexing opportunity (flagged for review):**
7 articles in `/solo/articles/` are blocked by robots.txt as "fragments" but 3 are full-length pages:
- `accessible-cruising.html` (44 KB)
- `in-the-wake-of-grief.html` (33 KB)
- `visiting-the-united-states-before-your-cruise.html` (32 KB)

**Decision needed:** Are these fragments loaded into solo.html, or standalone pages that should be indexed? If standalone, they should be unblocked in robots.txt and added to sitemap.

---

## Codebase Status (verified 2026-03-02)

| Asset | Count |
|-------|-------|
| Port pages | 387 |
| Ship pages | 295 |
| Restaurant pages | 472 |
| Total HTML pages | 1,241 |
| WebP images | 4,486 |
| Logbook JSON files | 285 |
| Stateroom exception files | 270 |
| Cruise line directories | 16 |
| Inline style instances | ~15,626 |
| Files with `<style>` blocks | 9 |

---

## Port Content Repair Queue (Session 12 — 2026-03-02)

**Context:** Session 12 identified 88 ports that contained identical template filler inserted by batch scripts. Template filler was removed and the validator was updated with a `template_filler_detected` BLOCKING check. These 77 ports now need real, port-specific content written.

**Current validation:** 242/387 PASS (62.5%). Of the 145 failing ports:
- ~22 ports at score 0 (template filler / missing multiple sections)
- ~50 ports at score 2-68 (content gaps + structural issues)
- ~73 ports at score 70-86 (often just 1 blocking error: `section_order/out_of_order` for map or featured_images)

**Session 13 progress (2026-03-03):** Copenhagen PASS (88), Split improved (42), Rhodes PASS (84)
**Session 14 progress (2026-03-03):** Riga (82 PASS), Tallinn (76 PASS), Phuket (56), San Diego (76), Valencia (32), Stavanger (76), Malaga (52), Victoria BC (72), St. Petersburg (72), Portland (72), Port Everglades (60), Port Miami (58)

**What each port typically needs:**
- **Cruise Port section** (100+ words): Where ships dock, terminal facilities, distance to town, specific cruise lines that call here
- **Getting Around section** (200+ words): Walking distances, specific taxi fares, bus routes, shuttle info for THIS port
- **Excursions section** (400+ words): Specific tours, activities, booking advice, prices — all port-specific

**Priority tiers:**

### Tier 1: High-traffic ports (fix first — readers will notice)
Ports that likely get significant traffic and need quality content:

| Port | Missing sections | Notes |
|------|-----------------|-------|
| ~~copenhagen.html~~ | ~~cruise-port, getting-around, excursions~~ | ~~DONE — Session 13, score 88~~ |
| ~~riga.html~~ | ~~cruise-port, getting-around, excursions~~ | ~~DONE — Session 14, score 82 PASS~~ |
| ~~tallinn.html~~ | ~~cruise-port, getting-around, excursions~~ | ~~DONE — Session 14, score 76 PASS~~ |
| ~~split.html~~ | ~~cruise-port, getting-around, excursions~~ | ~~DONE — Session 13, score 42 (logbook issues pre-existing)~~ |
| ~~rhodes.html~~ | ~~cruise-port, getting-around, excursions~~ | ~~DONE — Session 13, score 84 PASS~~ |
| ~~phuket.html~~ | ~~cruise-port, getting-around, excursions~~ | ~~DONE — Session 14, score 56 (logbook issues pre-existing)~~ |
| ~~san-diego.html~~ | ~~cruise-port, getting-around, excursions~~ | ~~DONE — Session 14, score 76 (logbook issues pre-existing)~~ |
| ~~valencia.html~~ | ~~cruise-port, getting-around, excursions~~ | ~~DONE — Session 14, score 32 (5 logbook errors pre-existing)~~ |
| ~~stavanger.html~~ | ~~cruise-port, getting-around, excursions~~ | ~~DONE — Session 14, score 76 (logbook 696/800 pre-existing)~~ |
| ~~malaga.html~~ | ~~cruise-port, getting-around, excursions~~ | ~~DONE — Session 14, score 52 (3 logbook errors pre-existing)~~ |
| ~~victoria-bc.html~~ | ~~cruise-port, getting-around, excursions~~ | ~~DONE — Session 14, score 72 (emotional pivot pre-existing)~~ |
| ~~st-petersburg.html~~ | ~~cruise-port, getting-around, excursions~~ | ~~DONE — Session 14, score 72 (emotional pivot pre-existing)~~ |
| ~~port-everglades.html~~ | ~~cruise-port, getting-around, excursions~~ | ~~DONE — Session 14, score 60 (logbook issues pre-existing)~~ |
| ~~port-miami.html~~ | ~~cruise-port, getting-around, excursions~~ | ~~DONE — Session 14, score 58 (logbook issues pre-existing)~~ |
| ~~portland.html~~ | ~~cruise-port, getting-around, excursions~~ | ~~DONE — Session 14, score 72 (logbook 723/800 pre-existing)~~ |

### Tier 2: Medium-traffic ports — 16/19 COMPLETE (Session 15)

| Port | Status | Score |
|------|--------|-------|
| ~~cairns.html~~ | DONE — template filler fix only | 82 |
| ~~cannes.html~~ | DONE — template filler fix only | 86 |
| ~~cartagena.html~~ | DONE — template filler fix only | 88 |
| ~~casablanca.html~~ | DONE — template filler fix only | 82 |
| ~~charleston.html~~ | DONE — template filler fix only | 80 |
| ~~corfu.html~~ | DONE — template filler fix only | 84 |
| goa.html | SKIPPED — needs logbook structural work | — |
| halifax.html | SKIPPED — no logbook present | — |
| ~~manila.html~~ | DONE — template filler fix only | 78 |
| ~~osaka.html~~ | DONE — 3-section + template filler | 86 |
| panama-canal.html | SKIPPED — logbook 331/800 words | — |
| ~~penang.html~~ | DONE — 3-section + reorder + template filler | 88 |
| ~~porto.html~~ | DONE — 3-section + forbidden_drinking fix | 82 |
| ~~recife.html~~ | DONE — 3-section + logbook + template filler | 84 |
| ~~taormina.html~~ | DONE — 3-section + logbook expansion | 76 |
| ~~trieste.html~~ | DONE — 3-section + reorder + template filler | 92 |
| ~~villefranche.html~~ | DONE — 3-section + template filler + logbook | 76 |
| ~~warnemunde.html~~ | DONE — 3-section + logbook reflection | 76 |
| ~~zeebrugge.html~~ | DONE — 3-section + logbook +248 words | 82 |

### Tier 3: Lower-traffic / specialized ports

| Port | Missing sections |
|------|-----------------|
| callao.html | cruise-port, excursions |
| catania.html | cruise-port, getting-around, excursions |
| cephalonia.html | cruise-port, getting-around, excursions |
| charlottetown.html | cruise-port, getting-around, excursions |
| cherbourg.html | cruise-port, getting-around, excursions |
| chilean-fjords.html | cruise-port, getting-around, excursions |
| colon.html | cruise-port, getting-around, excursions |
| durban.html | cruise-port, excursions |
| falmouth.html | logbook filler removed |
| kusadasi.html | logbook filler removed |
| la-spezia.html | cruise-port, getting-around |
| papeete.html | cruise-port, getting-around, excursions |
| ponta-delgada.html | getting-around, excursions |
| port-arthur.html | getting-around, excursions |
| port-elizabeth.html | cruise-port, getting-around, excursions |
| port-said.html | getting-around, excursions |
| puerto-montt.html | getting-around |
| punta-arenas.html | cruise-port, getting-around, excursions |
| punta-del-este.html | getting-around, excursions |
| ravenna.html | cruise-port, getting-around, excursions |
| roatan.html | cruise-port only |
| rotorua.html | cruise-port, logbook needs ~20 more words |
| royal-beach-club-antigua.html | cruise-port, getting-around, excursions |
| saguenay.html | cruise-port, getting-around, excursions |
| saint-john.html | cruise-port, getting-around, excursions |
| santa-marta.html | getting-around, excursions |
| scotland.html | cruise-port, getting-around, excursions |
| sihanoukville.html | logbook filler removed |
| south-pacific.html | cruise-port, getting-around, excursions |
| south-shetland-islands.html | cruise-port, getting-around, excursions |
| st-croix.html | getting-around, excursions |
| st-john-usvi.html | cruise-port, getting-around, excursions |
| strait-of-magellan.html | cruise-port, getting-around, excursions |
| sydney-ns.html | cruise-port, getting-around, excursions |
| tangier.html | cruise-port, getting-around, excursions |
| tauranga.html | getting-around |
| tender-ports.html | excursions (needs tender-specific content) |
| tobago.html | getting-around, excursions |
| torshavn.html | getting-around, excursions |
| trinidad.html | getting-around, excursions |
| tunis.html | cruise-port, getting-around, excursions |
| ushuaia.html | cruise-port, getting-around, excursions |
| vigo.html | cruise-port, getting-around, excursions |
| waterford.html | cruise-port, getting-around, excursions |
| zadar.html | cruise-port, getting-around, excursions |

### Approach for repairs

Each port's content must be **port-specific** — no generic templates. Research-backed content with:
- Real terminal names and facilities
- Real distances, taxi fares, bus routes
- Real excursion names, operators, approximate prices
- Real local tips that could only apply to THIS port

**Estimated effort:** ~5-10 ports per session if hand-written with web research. At that pace, completing all 77 ports would take 8-15 sessions.

**Alternative:** Prioritize Tier 1 (15 ports) and mark Tier 3 as "content stub" pages that are honest about being incomplete rather than pretending to have content they don't have.

---

## Cruise Line Parity Gaps

| Cruise Line | Ships | Restaurants | Gap |
|-------------|-------|-------------|-----|
| RCL | 50 | 280 | Baseline |
| NCL | 20 | 78 | Partial |
| Virgin | 4 | 46 | Good ratio |
| MSC | 24 | 45 | Partial |
| Carnival | 48 | 23 | Needs ~200+ |
| Celebrity | 29 | 0 | Missing |
| Holland America | 46 | 0 | Missing |
| Princess | 17 | 0 | Missing |
| + 7 more lines | 54 | 0 | Missing |

**Missing cruise lines entirely:** Viking Ocean (11 ships)
**Intentionally excluded:** Disney Cruise Line (owner decision — theological disagreement with Disney's "follow your heart" philosophy; Jeremiah 17:9)

---

## Task Lanes

| Lane | Meaning | Examples |
|------|---------|----------|
| Green | AI executes | CSS cleanup, schema fixes, pattern standardization |
| Yellow | AI proposes | Content changes, new pages, image updates |
| Red | Human writes | Pastoral articles, theological content |

---

## GREEN LANE — AI Executes Autonomously

### [G] Phase 3 ai-summary follow-ups — surfaced 2026-05-09

**Source:** Continuation of PR #1466 (Phase 3.2a). After merging the 7 ai-summary boilerplate rewrites + image-reuse-guardrail dependency, three follow-ups remain. Listed in continuation-of-work order.

#### Phase 3.2b — finish ai-summary boilerplate cleanup ✅ IN PR

**Status:** All 36 ships fixed on branch `claude/phase3-2b-ai-summary-cleanup`. Validator tightened with 5 atomic boilerplate fragments. Audit log: `audit-reports/ai-summary-rewrites/_phase3-2b-batch-2026-05-09.md`.

The actual scope was bigger than the original 7-ship guess: **17 propagations** (ai-summary already specific; description tag still boilerplate) + **19 rewrites** (ai-summary itself was boilerplate by tightened standards). Mechanism:

- `admin/phase3-2b-propagate.cjs` — copies existing ai-summary into description meta + JSON-LD descriptions
- `admin/phase3-2b-rewrite.cjs` — accepts a JSON map of `path → new_summary`, replaces ai-summary, then propagates

Tightening the validator (`admin/validator-config.json`) added: `"deck plans, live tracker"`, `"deck plans, live tracking"`, `"deck plans, dining venues, stateroom tours"`, `"deck plans, historical information"`, `"historical information, legacy, and ship details"`.

- [x] All 36 ships silent on `ai_summary_boilerplate` AND `ai_summary_length`
- [x] Validator tightening lives in same PR

#### Phase 3.2c — newly-surfaced boilerplate (26 ships) ✅ IN PR

**Source:** Tightening the validator in 3.2b surfaced 26 additional ships carrying boilerplate variants the original phrase list missed.

**Status:** All 26 ships rewritten on branch `claude/phase3-2c-boilerplate-batch-3` (stacked on 3.2b). Audit log: `audit-reports/ai-summary-rewrites/_phase3-2c-batch-2026-05-09.md`. After this batch, the **fleet-wide `ai_summary_boilerplate` count is 0**.

Distribution:

| Cruise line | Count | Pattern |
|---|---:|---|
| Celebrity Cruises | 12 | "Ship • Celebrity Cruises • In The Wake. Deck plans, dining venues, stateroom tours, and live ship tracker." |
| Holland America Line | 7 | Same template, HAL line |
| Royal Caribbean | 6 | Lazy "historical information" template + 1 trailing-boilerplate (Radiance) + 1 test fixture + 1 placeholder |
| MSC | 1 | Trailing boilerplate trimmed |

- [x] All 26 rewritten (54 replacements via `admin/phase3-2b-rewrite.cjs`)
- [x] All 26 silent on `ai_summary_boilerplate` AND `ai_summary_length`
- [x] Fleet-wide `ai_summary_boilerplate` count = **0**

**Mid-batch correction:** initially split into "ship 22, file 4 as 3.2d" on the false premise that 4 HAL ships were content-stubs. Re-verification using the meta description tag + body prose (not just the `<li><strong>` fact block) showed all 26 had on-page facts. Expanded back to 26. Captured in audit log under "Mid-batch correction."

#### Phase 3.5 — image-reuse-guardrail allowlist (issue #1465)

- [ ] **Issue:** https://github.com/jsschrstrcks1/InTheWake/issues/1465
- [ ] Two complementary fixes inside `.claude/skills/image-reuse-guardrail/` and possibly `admin/scan-image-reuse.cjs`:
  1. **Same-entity normalizer.** Treat `assets/ships/Carnival_Conquest_3.jpg` and `assets/ships/carnival/carnival-conquest-exterior.jpg` as same-entity (both normalize to `carnival/carnival-conquest`). Applies to authors, ports, articles too.
  2. **FOM filename allowlist.** Files matching `*-FOM- - *.webp` are intentionally one-image-per-named-ship by convention. Allow-list the pattern (Option A in #1465) unless the FOM convention itself is up for revisit.
- [ ] **Test cases that must still fail** (Cordelia pattern):
  - `assets/ships/cordelia/cordelia-1.jpg` ↔ `assets/ships/carnival/carnival-fascination-1.jpg` (different lines, no shared slug)
  - `assets/ports/dubai/hero.jpg` ↔ `assets/ports/cozumel/hero.jpg` (different ports)
- [ ] **Test cases that must now pass:** the 4 documented in #1465.
- [ ] **Effort:** 1–2 hours. Removes the recurring `--no-verify` papercut that blocked PR #1466 commits.

#### Phase 3.6 — `cascade_fully_failed` triage

- [ ] **50 ships** flagged by `js:runtime_data/cascade_fully_failed` per the same dashboard. Top single failure category by count (147 `js:images/few_images` is higher but is mostly warn-tier; cascade is a real user-visible bug — specs / data sections fail to render).
- [ ] **Investigation first:** root cause unknown. Likely candidates: missing `data-*` attributes the cascade script reads, broken JSON in `assets/data/ships/`, or a script load order issue introduced by an upstream merge.
- [ ] Use `systematic-debugging` skill before proposing fixes. Pick 1–2 affected ships, reproduce in a browser, instrument the cascade loader, identify the failure mode, then plan the fix scope.
- [ ] Identify the 50 ships:
  ```bash
  jq -r '.per_page[] | select(.js_errors[]?.rule == "runtime_data/cascade_fully_failed") | .file' \
    audit-reports/ship-validation-dashboard.json
  ```
- [ ] **Effort:** unknown until root-caused. Could be a one-line fix affecting all 50, or 50 individual data-shape repairs.
- [ ] **Why it's higher value than 3.2b for end users:** boilerplate ai-summary is invisible to readers; a fully-failed data cascade means the ship page renders without specs / amenities / itinerary data. Real bug, real impact.

---

### [G] Noscript Remediation — Port Pages (NEW — 2026-04-09)
**Status:** Not started — plan ready, scripts needed
**Priority:** P1 — accessibility and pastoral mandate (exhausted caregivers on hospital WiFi, privacy-conscious travelers using NoScript, disabled users on stripped-down browsers)
**Source:** Audit found 4 features completely invisible without JavaScript on port pages

**Current state:**
- Port logbook narratives: ✅ Static HTML (works without JS)
- Port content sections: ✅ Static HTML (works without JS)
- FAQs: ✅ Static HTML (works without JS)
- Weather guide: ⚠️ 273/387 have static fallback, 100 have "Enable JavaScript" placeholder, 14 have nothing
- Maps: ⚠️ 330/337 have text placeholder, 0 have static map image or location list
- Ships visiting: ❌ 370 ports, 0 noscript fallbacks (empty div)
- Recent stories: ❌ 377 ports, 0 noscript fallbacks (empty div)
- Photo gallery: ❌ 143 ports with swiper, 0 noscript image fallbacks

**Phase 1 — Green Lane (fully scriptable, no content decisions needed):**

**1a. Ships Visiting noscript fallback**
- [ ] Write `scripts/inject-ships-visiting-noscript.js`
- [ ] Read port-registry.json + ship schedule data to get ships per port
- [ ] Inject `<noscript>` block inside ships-visiting container with static list: ship name + cruise line + link to ship page
- [ ] Target: all 370 ports with ships-visiting section
- [ ] Template: `<noscript><ul class="ships-list-static">` with `<li><a href="/ships/...">Ship Name</a> (Line)</li>`
- [ ] Run once, verify 3 ports, commit

**1b. Recent Stories noscript fallback**
- [ ] Write `scripts/inject-recent-stories-noscript.js`
- [ ] Read articles/index.json to get 5 most recent articles
- [ ] Inject `<noscript>` block inside recent-rail container with static links
- [ ] These are site-wide (not port-specific), so same 5 articles on all ports
- [ ] Template: `<noscript><ul class="stories-static">` with `<li><a href="/solo/articles/...">Title</a></li>`
- [ ] Run once, verify, commit

**1c. Photo Gallery noscript fallback**
- [ ] Write `scripts/inject-gallery-noscript.js`
- [ ] Read ports/img/{slug}/ directory to get first 4-6 images
- [ ] Inject `<noscript>` block inside swiper container with static `<figure>` + `<img>` + `<figcaption>`
- [ ] Include alt text from existing image alt attributes
- [ ] Target: all 143 ports with swiper galleries
- [ ] Template: `<noscript><div class="gallery-static">` with `<figure><img src="..." alt="..." loading="lazy"></figure>`
- [ ] Run once, verify, commit

**Phase 2 — Yellow Lane (needs content/design decisions):**

**2a. Weather noscript (100 placeholder-only ports)**
- [ ] These 100 ports have weather widgets but only "Enable JavaScript" in noscript
- [ ] Need to build full static seasonal guide HTML (At a Glance, Best Time, Catches, Packing, Hazards)
- [ ] Data source: the weather widget JSON data files or research per port
- [ ] Can template from the 273 ports that already have full noscript
- [ ] Decision needed: generate from data programmatically or hand-write?

**2b. Weather noscript (14 ports with NO noscript at all)**
- [ ] These 14 ports have weather widgets with zero noscript content
- [ ] Same fix as 2a but includes adding the `<noscript>` tags themselves

**2c. Map noscript improvement**
- [ ] Current: 330 ports have "Enable JavaScript to view map" placeholder
- [ ] Options:
  - Option A: Generate static map images via Mapbox/OSM Static API (best UX, costs money/API calls)
  - Option B: Inject text-based location list from POI manifest data (free, useful, not visual)
  - Option C: Both — static image with text list below
- [ ] Decision needed: which option?

**Estimated effort:**
- Phase 1: ~2 hours (3 scripts, batch inject, verify)
- Phase 2a: ~4-8 hours (100 ports × weather research or data generation)
- Phase 2b: ~1 hour (14 ports, same approach as 2a)
- Phase 2c: Depends on design decision

**The ICP-2 v2.1 connection:** Section E requires "Key content must be in static HTML, not behind JavaScript rendering." Ships visiting, recent stories, and gallery images are content — they should be in the static HTML with JS enhancing (not replacing) the experience.

### [G] CSS Consolidation — Inline Style Reduction
- [ ] Decide canonical `.page-grid` definition (styles.css vs inline)
- [ ] Remove redundant `.page-grid` from remaining `<style>` blocks
- [ ] Run replace to swap inline styles for class names
- [ ] Target: Reduce ~15,626 inline styles to <1,000

### [G] Ship Page Standardization (295 pages)
- [ ] Standardize carousel markup to `<figure>` pattern across all lines
- [ ] Align section order: First Look → Dining → Videos → Deck Plans/Tracker → FAQ
- [ ] Fix author avatar to circle (remove inline border-radius overrides)
- [ ] Uniform version badge
- [ ] Normalize hero sizing/positioning
- [ ] Add missing whimsical units containers (~181 ships)
- [ ] Add missing grid-2 layout (~30 ships, mostly Carnival)

### [G] Ship Validation — Content Quality Enhancement
**Current:** 293/293 passing (100% — all structural validation errors resolved)
**Remaining quality improvements (beyond validator scope):**
- [ ] Generic review text (208 ships) — needs editorial content per ship
- [ ] Few images (137 ships) — needs actual image files (23 ships need just 1 more)
- [ ] FAQ too short (186 ships) — needs content expansion
- [ ] Missing whimsical units (~181 ships)
- [ ] Missing grid-2 layout (~30 ships)

### [G] Port Validation — Remaining Work
**Current:** 242/387 passing (62.5%) — drop from prior "338" count is due to `section_order/out_of_order` check now being BLOCKING
- [ ] ~145 ports still failing (22 at score 0, ~50 at score 2-68, ~73 at score 70-86)
- [ ] Trim FAQ answers to 80 words (~384 ports)
- [ ] Build POI manifests (365 ports have < 10 POIs)
- [ ] Clean promotional drift language (~200 ports)

### [G] Port Weather — Remaining Coverage
**Current:** 351/387 ports have weather widgets
- [ ] Add weather section to remaining ~36 ports

### [G] Technical Tasks
- [ ] Verify WCAG 2.1 AA compliance across new pages
- [ ] Test keyboard navigation on dropdown menus
- [ ] Test screen reader compatibility
- [ ] Verify all images have proper alt text
- [ ] Run Google PageSpeed Insights on key pages
- [ ] Mobile browser testing at 360px, 375px, 390px, 412px, 768px (requires manual browser)

### [G] Ship Size Atlas — Remaining Items
- [ ] Add "Size Map" scatter chart view (GT vs Passengers)
- [ ] Add "Top 30 Largest Ships" spotlight module
- [ ] Add ship detail drawer/modal
- [ ] Create automated coverage report
- [ ] Add "last verified" date display per ship

### [G] Competitor Analysis Recommendations — Deduplicated
**Source:** Comprehensive audit (120+ competitors, 15 categories) — `.claude/audits/`

These items appeared across 7+ individual competitor analysis sections. Deduplicated here:

**Port page improvements:**
- [ ] Ensure dock locations clearly marked on all port maps
- [ ] Add dock location summary to port page intro
- [ ] Expand DIY vs. excursion comparisons from 38 to top 50 ports
- [ ] Expand "Real Talk" honest assessments to 75+ ports (currently 46)
- [ ] Include "Skip this port if..." honest guidance where appropriate
- [ ] Add "Best for / Not ideal for" profile guidance per port
- [ ] Evaluate PDF generation for top 20 ports

**Ship page improvements:**
- [x] ~~Verify deck plan links load correctly~~ (verified 2026-03-02: external links to cruise line sites, not PDFs)
- [ ] Add cabin size/amenity quick facts where missing
- [ ] Ensure refurbishment dates are current
- [ ] Add crew count and total deck count if missing
- [ ] Promote Stateroom Checker more prominently on ship pages
- [ ] Add "cabin location tips" section to ship pages

**Site-wide:**
- [ ] Add author expertise callouts ("Ken has visited this port X times")
- [ ] Test service worker caching for complete offline access
- [ ] Market PWA install as "your offline cruise companion"

### [G] Affiliate Link Infrastructure
**Phase 1 (Infrastructure) DONE. Phase 2 (Articles) DONE. Phase 3 (Site-wide) ~99% DONE.**
- [ ] Update about-us.html "Our Promise" section to acknowledge Amazon Associates participation
- [ ] Add affiliate article links to 4 remaining ship pages (carnival-adventure, carnivale-1956, jubilee-1986, mardi-gras-1972)
- [ ] Add affiliate article links to 3 remaining port pages (beijing, falmouth-jamaica, kyoto)

### [G] Quiz Remaining Fixes
- [x] ~~Add null safety for lineData access~~ (verified 2026-03-02: null guards + optional chaining in quiz.html)
- [x] ~~Implement 10-ship limit~~ (verified 2026-03-02: 3-10 range with +/- UI, hard cap at 10)
- [x] ~~Add Comparison Drawer from Ship Atlas~~ (verified 2026-03-02: tray, modal, table, max-5 limit)
- [ ] Run edge case test personas

### [G] Data Quality
- [ ] Verify quality of auto-generated seasonal data vs hand-curated
- [ ] Verify quality of auto-generated stateroom exception files vs manually audited

---

## YELLOW LANE — AI Proposes, Human Approves

### [Y] Port Call Reliability Tracker (NEW — 2026-04-09)
**Status:** Not started — research + design needed
**Priority:** P2 — high user value, no API available
**Source:** User experience — "Costa Maybe" (Costa Maya), Bay of Islands NZ, and other ports that get cancelled frequently due to weather, tender conditions, or operational issues

**Problem:** Passengers book excursions and plan days around ports that may get cancelled. No cruise line publishes cancellation rates. Ports like Costa Maya, Bar Harbor (fog), Bermuda (wind), Bay of Islands (swell), and many tender ports have significantly higher skip rates than docked ports, but this information lives only in cruise forum folklore.

**Why it matters:** A disabled traveler who books a wheelchair-accessible excursion at a tender port that gets cancelled 30% of the time deserves to know that before booking. A grieving widow planning a meaningful shore visit doesn't need the added disappointment of discovering at 6am that the port was skipped.

**Data sources (no line API needed):**
- [ ] **Cruise forum scraping** — CruiseCritic, Reddit r/cruise, Facebook cruise groups have years of "our port was cancelled" posts. A structured scrape + NLP could extract port name + date + reason + ship name
- [ ] **Ship tracking history** — MarineTraffic, VesselFinder, and CruiseMapper show historical ship positions. Compare scheduled itinerary vs actual track to detect skipped ports (ship that was supposed to stop at Costa Maya but went straight to Cozumel)
- [ ] **Weather correlation** — Cross-reference NOAA/weather data with known cancellation patterns. If wind > 25kt at a tender port, it's probably cancelled. Build a model per port
- [ ] **Port authority data** — Some ports publish annual ship call statistics (actual vs scheduled). Caribbean ports especially may have tourism board data
- [ ] **Cruise line schedule changes** — Monitor cruise line websites for itinerary changes. When "Costa Maya" disappears from a sailing and gets replaced with "Cozumel" or "sea day," that's a data point
- [ ] **Community-sourced** — Add a simple "Did your ship actually stop here?" yes/no on each port page. Aggregate over time

**Implementation ideas:**
- [ ] Design a "Port Reliability" indicator for each port page (e.g., "Reliability: High / Moderate / Weather-Dependent")
- [ ] Add "This port is tender-only — cancellations are more common in rough weather" notice to all tender ports
- [ ] Create a seasonal reliability calendar per port (e.g., "Bay of Islands: Jan-Mar reliable, Apr-May weather-dependent, Jun-Aug often cancelled")
- [ ] Consider a `/tools/port-reliability.html` dashboard showing all ports ranked by estimated reliability
- [ ] Track tender vs dock — tender ports inherently less reliable

**Known unreliable ports (from user experience + cruise forums):**
- Costa Maya, Mexico ("Costa Maybe") — weather cancellations, especially fall
- Bay of Islands, New Zealand — swell-dependent tender, frequently cancelled
- Bar Harbor, Maine — fog cancellations, tender port
- Bermuda (some berths) — wind-dependent
- Many Greek island tender ports (Santorini, Mykonos) — meltemi wind season
- Glacier Bay, Alaska — weather/visibility
- Antarctica expedition ports — weather-dependent by nature

### [Y] Port Day Disruption Factors (NEW — 2026-04-09)
**Status:** Research in progress (2026-04-09 session)
**Priority:** P1 — directly affects port page notices sections

Comprehensive factors that can disrupt a passenger's port day, to be integrated into each port's notices section:

- [ ] **Religious dress codes** — mosque, temple, church requirements by port (specific rules, not vague "dress modestly")
- [ ] **Religious holidays** — Ramadan restaurant closures, Shabbat in Israel, Friday mosque closures, Hindu festivals
- [ ] **National holidays** — Revolution Day (Mexico), Carnival (Caribbean/Brazil), bank holidays closing attractions
- [ ] **Street closures** — parades, festivals, protests that block transit routes (user encountered this in a Mexican port)
- [ ] **Weather extremes** — not just cancellations but dangerous heat (Middle East summer), monsoon downpours, etc.
- [ ] **Accessibility barriers** — cobblestones, steep hills, tender-only limitations, heat + mobility dangers
- [ ] **Port-to-town distance** — docks far from attractions, misleading "walking distance" claims
- [ ] **Taxi/transport issues** — known scam ports, metered vs negotiated, surge pricing during events
- [ ] **Time zone changes** — ship time vs local time confusion
- [ ] **Multiple dock locations** — which berth will your ship use? (affects planning)

### [Y] "What Can I Eat?" Dining Search Tool (NEW — 2026-02-22)
**Status:** Not started — design needed
**Priority:** P1 — new tool, high user value

- [ ] Audit `venues.json` for dish-level data availability
- [ ] Create `/assets/data/menu-search-index.json` (inverted index)
- [ ] Create `/assets/js/dining-search.js`
- [ ] Create `/tools/dining-search.html` (standalone page)
- [ ] Design ship page widget (compact embedded version)
- [ ] Implement autocomplete/suggestions for dish search
- [ ] Add to site navigation (Tools dropdown)
- [ ] Service worker caching for offline use

### [Y] Stateroom Checker — Embed on Ship Pages (NEW — 2026-02-22)
**Status:** Not started — design needed
**Priority:** P1 — leverages existing 270 exception files

- [ ] Extract core checker logic into reusable `/assets/js/stateroom-widget.js`
- [ ] Create ship page widget HTML template
- [ ] Lazy-load exception JSON only when widget activated
- [ ] Add widget section to ship page template
- [ ] Roll out to all 295 ship pages
- [ ] Audit which 25 ships lack exception files, create stubs
- [ ] Ensure offline/PWA support

### [Y] Alaska Cruise Port Gaps
**Status:** 7 of 12 "missing" ports now exist (built since audit)

**Still missing (5):**
- [ ] `dutch-harbor.html` — Aleutian Islands; Deadliest Catch fame
- [ ] `nome.html` — Bering Sea; Iditarod finish line
- [ ] `kake.html` — Tiny Tlingit village on Kupreanof Island
- [ ] `victoria.html` — Common PVSA stop on Seattle round-trips
- [ ] `prince-rupert.html` — Inside Passage to open gulf

### [Y] Image Tasks — Ships Needing FOM Photos
- [ ] Allure of the Seas
- [ ] Anthem of the Seas
- [ ] Icon of the Seas
- [ ] Independence of the Seas
- [ ] Navigator of the Seas
- [ ] Odyssey of the Seas
- [ ] Quantum of the Seas (has 7 FOM already, may need more)
- [ ] Spectrum of the Seas
- [ ] + additional ships across non-RCL lines

### [Y] DIY vs. Excursion Comparison Expansion
**Current:** 38 ports have comparisons
- [ ] Expand to top 50 ports
- [ ] Format: "Ship excursion: $X | DIY: $Y | You save: $Z"
- [ ] Add timing/transport/admission context

### [Y] Affiliate Content — Phase 3 (Enhance Existing)
- [ ] Add affiliate links to `/packing-lists.html`
- [ ] Add tech recommendations to `/internet-at-sea.html`

### [Y] Carnival Fleet Index Enhancement
- [ ] (Future) CTA for booking

### [Y] ships.html Display Issues
- [ ] Class cards need images
- [ ] Cruise lines need images
- [ ] Individual ship images rendering issues

### [Y] SEO External Tools Setup
- [x] ~~Set up Google Search Console~~ (active — GSC audit 2026-03-27, see top of file)
- [ ] Set up Bing Webmaster Tools
- [ ] Set up Google Analytics dashboard

### [Y] Dining Hero Images
- [ ] 49 RCL ship dining hero images needed (all currently use generic Cordelia placeholder)

### [Y] "Coming Soon" Pages
- [ ] ~172 pages still have placeholder "coming soon" text (142 ships, 18 restaurants, 7 cruise-lines, 5 other)

---

## RED LANE — Human Decides

### [R] Articles to Write — Pastoral Content
- [ ] Healing Relationships at Sea (~3,000 words) — not created
- [ ] Rest for Wounded Healers (~2,500 words) — not created
- [ ] Expand or create comprehensive-solo-cruising.html

### [R] Additional Themed Articles
- [ ] Medical recovery articles (post-cancer, post-stroke, chronic illness)
- [ ] Mental health articles (anxiety, PTSD/veteran, bipolar/depression)
- [ ] Family situation articles (infertility grief, adoption, homeschool)
- [ ] Demographic articles (senior travel, neurodiversity, burn survivors)
- [ ] Life transition articles (retirement, second marriage, work-life balance)

---

## Uncategorized Pending Items

- [ ] `staleIfErrorTimestamped` strategy for FX API caching
- [ ] `warmCalculatorShell` predictive prefetch
- [ ] `FORCE_DATA_REFRESH` and `GET_CACHE_STATS` message handlers
- [ ] UI integration: "Refresh Rates" button, cache age display, toast notifications
- [ ] Header hero size inconsistent across hub pages
- [ ] Logo size standardization
- [ ] solo.html article loading (28 article references, uses fetch for fragments)
- [ ] index.html FAQ positioning

### Missing Port Pages (rare/exotic — low priority)
- [ ] astoria (Oregon)
- [ ] catalina-island (California) — verify if covered by los-angeles.html
- [ ] eden (Australia)
- [ ] port-vila (Vanuatu) — verify if covered by vanuatu.html
- [ ] rarotonga (Cook Islands)
- [ ] arica (Chile)
- [ ] coquimbo (Chile)
- [ ] abidjan (Ivory Coast)
- [ ] antsiranana (Madagascar)
- [ ] la-digue (Seychelles)
- [ ] luderitz (Namibia)
- [ ] mossel-bay (South Africa)
- [ ] aarhus (Denmark)
- [ ] haugesund (Norway)
- [ ] kristiansand (Norway)
- [ ] nuuk (Greenland)
- [ ] qaqortoq (Greenland)

### Missing Homeport Pages
- [ ] hp-norfolk
- [ ] hp-philadelphia
- [ ] hp-west-palm-beach
- [ ] hp-san-juan (have HTML, need tracker entry)
- [ ] hp-honolulu (have HTML, need tracker entry)
- [ ] hp-dover (London gateway)
- [ ] hp-hamburg
- [ ] hp-istanbul
- [ ] hp-le-havre (Paris gateway)
- [ ] hp-lisbon
- [ ] hp-livorno (Florence/Pisa gateway)
- [ ] hp-athens (Piraeus)
- [ ] hp-ravenna
- [ ] hp-trieste
- [ ] hp-dubai
- [ ] hp-mumbai

---

## Missing Port and Ship Pages (Discovered 2026-05-08)

**Source:** Link verification during drafting of `articles/caribbean-cruise-trends-2026.html`. Each item below is referenced by name in published or upcoming content but has no dedicated page yet.

### Missing port pages

- [ ] **Half Moon Cay** — Holland America / Carnival private destination in the Bahamas. Mentioned in the 2026 Caribbean trends article and across multiple cruise-line itineraries. Needs a port page in `/ports/half-moon-cay.html` per the standard port template.
- [ ] **Celebration Key** — Carnival's new private destination in Grand Bahama, opening 2025–2026. Mentioned in the 2026 Caribbean trends article. Needs a port page in `/ports/celebration-key.html`. Add as it opens; verify pier, capacity, and on-island amenities from primary Carnival sources before publishing.

### Missing ship pages

- [ ] **Norwegian Luna** — New NCL ship referenced in 2026 capacity discussions. Needs a ship page in `/ships/norwegian/norwegian-luna.html` once specs, deck plans, and naming-rights data are available.

### Missing article thumbnails / hero images

The article rail (`/assets/data/articles/index.json`) lists `thumbnail` and `image` paths for each article. Four articles currently fall back to `/assets/social/articles-hero.jpg` because their dedicated hero images don't exist on disk yet:

- [ ] **`/articles/caribbean-cruise-trends-2026.html`** — needs a hero/thumbnail (suggest: `/assets/articles/caribbean-cruise-trends-2026-hero.webp`). The page's `og:image` currently also points at the generic articles-hero.jpg fallback.
- [ ] **`/articles/cruise-cabin-organization.html`** — `og:image` references `/assets/articles/cabin-organization-hero.jpg?v=3.010.400` but the file does not exist on disk. Either generate the image or update the og:image to a real path.
- [ ] **`/articles/cruise-tech-photography-guide.html`** — `og:image` references `/assets/articles/cruise-tech-hero.jpg?v=3.010.401`; not on disk. Same fix needed.
- [ ] **`/articles/cruise-duck-tradition.html`** — `og:image` references `/assets/social/cruise-ducks-hero.jpg`; not on disk.

While the rail and article-hub-grid renderers fall back gracefully to `/assets/social/articles-hero.jpg`, the social meta tags still serve broken URLs to Facebook/Twitter/LinkedIn previews. Generate proper hero images per `admin/claude/IMAGE_WORKFLOW.md`, then update both the og:image meta tags and the `thumbnail`/`image` paths in `/assets/data/articles/index.json`.

### Why these are tracked here

`careful-not-clever` requires that gaps surfaced during one task get documented for the next task rather than silently skipped. These pages and images were excluded as link/image targets in the Caribbean trends article (deliberate skips) and need their own scoped work. Move each to `admin/COMPLETED_TASKS.md` when published — do not delete from this list silently.

### Broken article reference: `/solo/articles/alaska-cruise-first-timer.html` (Discovered 2026-05-08)

- [ ] **`alaska-cruise-first-timer.html` does not exist** but is hardcoded into the `<noscript>` rail fallback on 14 port pages (anchorage, ajaccio, akureyri, alesund, etc.). The file was never written — only the link was. For users without JS, those 14 pages serve a 404 link. Two acceptable fixes:
  1. Write the article (`/articles/alaska-cruise-first-timer.html` or `/solo/alaska-cruise-first-timer.html`) and add it to `assets/data/articles/index.json`. The link target then resolves.
  2. Remove the alaska `<li>` from each port-page noscript fallback. Cleaner if no plan to write the article.
- See remaining hits: `grep -rln "/solo/articles/alaska-cruise-first-timer" --include="*.html" .`

### `/travel.html` is also the "Top 20 First-Cruise Questions" article (Discovered 2026-05-08)

- [ ] **Architectural quirk, low priority.** `assets/data/articles/index.json` lists "Top 20 First-Cruise Questions (Answered)" with `url: /travel.html`. The travel hub *is* the article — its `<title>`, `<h1>`, and JSON-LD all confirm. Works today. Future cleanup option: split out to `/articles/top-20-first-cruise-questions.html` so the URL matches the article title, leave `/travel.html` as a hub that links to it. Touches sitemap, internal links, JSON-LD, and the JSON entry — non-trivial. Don't act unless we're doing a broader articles-hub refactor.

---

## Cruise Tipping Calculator — Known Defects (Discovered 2026-05-09 careful-not-clever audit)

**Source:** Post-merge careful-not-clever audit against the v1.7-alpha skill (canonical 2026-05-09). The tool shipped on `claude/explore-inthewake-repo-lIUcX` between 2026-05-08 and 2026-05-09 and lives at `/tools/cruise-tipping-calculator.html` with companion article `/articles/cruise-tipping-2026.html`. The audit caught one wiring miss (fixed in `17584da3`) and four UX defects that affect the dollar amounts the tool reports. Trust requires the tool's output match the user's actual onboard bill; the items below break that promise for specific user populations.

### P1 — Children handling overcharges families on child-exempt lines

- [ ] **Bug:** `assets/js/tools/cruise-tipping-calculator/main.js:36-40` synthesizes `childAges = Array(n).fill(99)` so every entered child is treated as full-fare regardless of the line's exemption policy. Documented as a "v1 simplification" in the implementation plan, but the user-facing impact is real money:
  - **Carnival** (under 2 exempt): a family of 2 adults + 1 toddler on a 7-night standard cabin sees **$357** instead of **$238** — a $119 over-estimate.
  - **Norwegian** (under 3 exempt): same shape; under-3 not subtracted.
  - **MSC** USD regions (under 2 exempt): same.
  - **Costa** (under 4 free, ages 4–14 half-rate at EUR 5.50 / USD $7): the tool ignores both the exemption AND the half-rate. Costa families get the worst over-estimate of any line.
- **Fix shape:** The HTML form already has a `<div id="children-ages" hidden>` placeholder. Wire `render.js` to render one numeric `<input type="number">` per child when `children > 0`, populate `state.childAges` from those inputs, and remove the `Array(n).fill(99)` synthesis. Update unit tests to cover toddler-on-Carnival and Costa half-rate. Add a Playwright case for the family-with-toddler golden path.
- **Why P1:** Direct dollar-correctness bug. A user planning a Disney-substitute Carnival sailing with a 1-year-old sees an inflated total. That's the kind of thing that makes someone stop trusting the rest of the calculator.

### P1 — Region pricing not exposed for Costa and MSC ✅ DONE 2026-05-09

- [x] **Bug:** Costa and MSC publish region- and currency-priced rates. Tool was shipping the USD/Caribbean default with other regions surfaced only in `notes`.
- **Fix shipped:** Schema v1.1 now has an optional `regions` array. Costa carries 2 regions (South America USD $14.50, Med/Northern Europe EUR 11). MSC carries 3 regions (Caribbean/Alaska USD $17/$23, Med/Northern Europe EUR 12/16, South America USD $19/$23). Form renders a "Sailing region" picker only on multi-region lines. Daily and onboard amounts display in the active region's currency (€ or $); cash extras stay USD with an honest split-currency headline when both are non-zero. Cabin tiers re-render when region changes; the cabin slug is preserved across region switches when valid, otherwise snaps to the new region's default. Caught a CSS bug along the way (`.accordion__panel label { display: grid }` overrode the `hidden` attribute) and added explicit `[hidden] { display: none }` rules.
- **Tests:** 25 unit, 10 Playwright (added 4: Costa Med EUR, MSC three-region switching, picker visibility on single-region lines, plus the toddler-exemption regression already shipped). All green.
- **Costa half-rate (ages 4–14)** ✅ shipped 2026-05-09 — schema v1.1 extended with optional `childPolicy.ageMultipliers` array. Costa now models under-4 free, 4–14 half-rate, 15+ full. Calc honors fractional charged-guest weights (a family of 2 adults + 1 child age 8 on Costa Med correctly bills (2 + 0.5) × 7 × €11 = €192.50 instead of €231). Backward-compatible: lines using the binary `exemptUnderAge` model still work via the same `chargedChildrenWeight()` helper. Render layer expresses the tier rules in the children-ages note. 8 new unit tests + 1 Playwright test cover the new path; 33/33 unit + 20/20 Playwright pass.

### P2 — Virgin Voyages prepaid vs. onboard not exposed ✅ DONE 2026-05-09

- [x] **Bug:** Tool defaulted to Virgin's $20/night prepaid rate. Onboard rate is $22/night.
- **Fix shipped:** Added a second tier to `virgin-voyages.json` — `slug: "onboard", amount: 22.00, label: "Posted onboard the ship"`. The existing tier was relabeled "Pre-paid before sailing — recommended" so users see both options in the cabin-tier dropdown with their dollar amounts. No new schema field required (the existing `tiers` array already supported this); no Virgin-specific code paths. The cabin-tier dropdown serves both the suite-vs-standard semantic for other lines and the prepaid-vs-onboard semantic for Virgin — labels make the choice clear.
- **Tests:** 1 new Playwright case verifying $20×7×2 = $280 by default and $22×7×2 = $308 after switching to "onboard." 11/11 Playwright pass total.

### P3 — Five legacy Carnival ship pages had no Tipping Calculator entry ✅ DONE 2026-05-09

- [x] **Files:** `ships/carnival/carnival-firenze.html`, `carnival-horizon.html`, `carnival-panorama.html`, `carnival-sunshine.html`, `carnival-venezia.html`. These five use a `Planning` dropdown (not the standard `Tools` dropdown) plus a sidebar `Planning Tools` widget — Task 12's bulk update keyed on the `Tools` dropdown pattern and missed them.
- **Fix shipped:** Added the Tipping Calculator to BOTH surfaces on each of the 5 pages: in the Planning dropdown right after `Drink Calculator`, and in the sidebar Quick Tools widget right after `Budget Calculator`. Each page now has 2 references to the tool. All 5 parse as valid HTML, all 5 serve HTTP 200, no regressions in the cruise-tipping test suite.

### P3 — Playwright regression baseline for the 8 other site tools ✅ DONE 2026-05-09

- [x] **Shipped:** `tests/playwright/tools-smoke.spec.js` — one smoke test per tool (8 total) asserting (a) HTTP 200 on load, (b) primary `<h1>` renders, (c) `<title>` is non-empty. Listens for JS pageerrors via `page.on('pageerror')` and annotates them on the test report (without failing). Suite now runs 19 Playwright tests total (11 cruise-tipping + 8 smoke). When the JS-error finding below is fixed, flip the annotation to a hard assertion.
- **What this catches going forward:** any future shared-CSS/shared-nav/shared-asset change that 500s, blanks, or swaps out an `<h1>` on those tools. Catches the kind of regression that allowed Task 12's budget-calculator nav miss to escape detection.

### P2 — Pre-existing JS errors on 4 tools ✅ DONE 2026-05-09

- [x] **Bug:** Four tools threw `Invalid or unexpected token` as a `pageerror` during initial load — invisibly broken inline JS on calculators that handle real money. Used Chrome DevTools Protocol via Playwright (`Runtime.exceptionThrown`) to get exact source line/column.
- **Root causes (two distinct bugs, same audit symptom):**
  - **port-tracker.html / ship-tracker.html** — both files' "Recent Articles" rail used template literals with `\${...}` (escaped dollar signs) so 11 interpolations per file were mis-parsed as literal text and the inner conditional template literal `\`<p class=...>\`` ended the outer template prematurely, leaving downstream HTML to be parsed as JavaScript. Hence `Unexpected token 'class'` (pointing at the first `class="..."` HTML attribute). 11 occurrences fixed per file via `\${` → `${`.
  - **drink-calculator.html / drink-calculatorv2.html** — line 30 of each had `document.documentElement.classList.remove(\'no-js\');` with backslash-escaped quotes outside any string context. JS engine sees `(\` as an unexpected token. Fixed by removing the two backslashes per file (the other backslash-escaped quotes elsewhere in v2 ARE inside single-quoted strings and are correctly valid; left those alone).
- **Verification:** All 8 tools now load with zero pageerrors. `tests/playwright/tools-smoke.spec.js` (d) assertion flipped from annotation to hard `expect(errors).toEqual([])`. 19/19 Playwright pass.

### P3 — `[object Object]` 404s in the webserver log during Playwright runs (Discovered 2026-05-09)

- [ ] **Smell:** During Playwright runs of any spec, the test webserver logs repeated `GET /[object%20Object] HTTP/1.1 404` requests. Means somewhere a JavaScript object is being concatenated into a URL string without `JSON.stringify` or a `.toString()` definition, then `fetch()`/`<img src>`-d. Doesn't break tests; doesn't break visible behavior. Likely a third-party script (analytics, consent manager) or a service worker quirk. Investigate by tailing the webserver log while running a single tool page and grepping the repo for `${...}` URL templates that could swallow an unstringified object. Low priority — diagnostic noise, not a user-facing issue.

### Why these are tracked here

The careful-not-clever skill (`.claude/skills/careful-not-clever/CAREFUL.md` v1.7-alpha) requires that material assumptions surfaced by Layer 2 / Layer 3 audits get documented for the next task rather than silently skipped. The tool shipped under the original v1.0 of the skill, which did not require the formal red-team pass; the v1.7-alpha promotion (commit `20797133`) raised the bar retroactively. These five items are exactly what a Layer 3 red-team would have surfaced at the time of the schema revision. Move each to `admin/COMPLETED_TASKS.md` when fixed — do not delete from this list silently.

---

## Strategic "Don't Chase" List (Explicit Decisions)

| Feature | Why Not | Competitor Reference |
|---------|---------|---------------------|
| Port count arms race (1,200+) | Depth > breadth | WhatsInPort |
| Ship count arms race (976+) | Quality > quantity | CruiseMapper |
| Forums/user reviews | Dilutes trusted voice | Cruise Critic |
| Real-time ship tracking | Different product | CruiseMapper, VesselFinder |
| Native mobile app | PWA sufficient | ShipMate |
| Cruise booking/deals | Conflicts with ad-free | CruisePlum, CruiseWatch |
| News/trend coverage | Conflicts with calm authority | Cruise Hive, Cruise Radio |
| YouTube/TikTok | Personality medium | Emma Cruises |
| Profile-based voyage paths | Impossible at scale | AI chorus suggestion |

---

## Reference Documents

- `.claude/audits/competitor-*.md` — Competitor analyses
- `.claude/archive/` — Historical audit summaries
- `admin/COMPLETED_TASKS.md` — Finished work archive
- `admin/IN_PROGRESS_TASKS.md` — Currently active threads
- `admin/CAREFUL.md` — Integrity guardrail
- `admin/claude/CLAUDE.md` — Complete project guide

---

*Soli Deo Gloria*
