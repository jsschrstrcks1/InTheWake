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

## P2 — Data-integrity: Anthem of the Seas deck count — ✅ RESOLVED 2026-06-18

**Severity:** Non-blocking, factual. **File:** `assets/data/ships/rcl/anthem-of-the-seas.page.json` + `ships/rcl/anthem-of-the-seas.html`
**Found by:** Original research during the deck-plans article build (`articles/anthem-of-the-seas-deck-plans.html`).

`page.json` recorded `decks_total: 18` / `decks_guest: 16`, and the ship page body repeated "18 total (16 guest-accessible)" in three places (visible stat line, `stats_fallback` JSON, and the page.json fallback). Every source — Wikipedia ("16 / 14 passenger-accessible"), CruiseMapper ("16 decks / 9 with cabins"), and Royal Caribbean's own deck selector (Decks 3–16 = 14 accessible, confirmed via operator screenshots 2026-06-17) — agrees on **16 total**.

**Fix (2026-06-18):** Corrected to `decks_total: 16`, `decks_guest: 14`, and "16 total (14 guest-accessible)" in all three spots. Review dates bumped (last-reviewed + dateModified → 2026-06-18). Ship validator: no new errors introduced (2 pre-existing errors remain — see below — both unrelated missing-thumbnail images).

**Still open (separate, pre-existing, NOT this task):**
- `ships/rcl/anthem-of-the-seas.html` line ~674 lists `"crew": "1,500"`; the Anthem voyage-pack factcheck settled on **~1,300** (two sources agree). Worth correcting in a follow-up.
- Ship validator reports 2 errors: missing article thumbnails `/assets/articles/freedom-of-your-own-wake.jpg` and `/assets/articles/why-i-started-solo-cruising.jpg` (pre-existing; needs the images sourced).

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

### Ports cleaned (2026-05-13)

| Port | Status | Cleanup commit |
|------|--------|----------------|
| port-everglades | 6 ARR files deleted; replacements deferred (HTML refs intentionally left broken so the validator tracks the gap until re-sourced — see *port-everglades open slots* below). 2 CC BY 2.0 files (harbor, landmark, both from `prayitnophotography`) kept after Read-verification + verify-flickr confirmation. | (pending) |

#### port-everglades — 6 open slots requiring re-sourcing

Deleted as All Rights Reserved per the 2026-05-13 audit (`admin/audit-reports/port-image-audits/port-everglades-2026-05-13.md`). The HTML in `ports/port-everglades.html` retains the broken `<img src>` references so the validator's `missing_image_file` blocker count surfaces them until a future session re-sources. Two slots are also slot-vs-subject mismatches (`food`, `street`) and should be renamed when re-sourced.

| Slot | Previous (deleted) subject | Notes for re-sourcing |
|---|---|---|
| `port-everglades-hero.webp` | HAL Nieuw Statendam at tropical-port sunset | Subject was UNCLEAR; needs a Port Everglades-positive identifier (terminal architecture, FLL approach plane, etc.). HTML path was also typo'd at `/ports/img/port-everglades-hero.webp` (missing subdir) — fix path when re-sourcing. |
| `port-everglades-attraction-1.webp` | Cruise ship + Southwest plane on FLL approach (subject POSITIVE) | Subject was correct (FLL approach over PE is diagnostic); only license blocked use. Look for CC-licensed FLL-approach-over-port shots. |
| `port-everglades-attraction-2.webp` | 3 cruise ships at sea (Celebrity + Princess) | Subject UNCLEAR; replace with positively-identified PE scene. |
| `port-everglades-food.webp` | Fort Lauderdale Hilton marina yacht harbor | **Slot mismatch** — file showed yachts, not food. Rename slot on re-source. Real food/cuisine slot if used should show actual food/dining; otherwise drop the slot. |
| `port-everglades-panorama.webp` | RCL Oasis-class silhouetted at golden hour | Subject UNCLEAR; replace with a positively-identified PE panorama. |
| `port-everglades-street.webp` | RCL Freedom of the Seas at night | **Slot mismatch** — file showed ship, not street. Rename slot on re-source or drop. |

**Estimated effort to re-source:** ~2-3 careful hours. **Validator impact:** `missing_image_file` blocker count for port-everglades is now 7 (path typo + 6 deleted refs).

#### port-miami — 8 open slots (all deleted; whole directory empty)

The 2026-05-13 license sweep on port-miami found 8 of 8 cited Flickr sources unacceptable for this site: 5 were CC BY-NC-ND 2.0 (Non-Commercial + No-Derivatives — both flags this site rejects per `admin/IMAGE_SOURCING_WORKFLOW.md`), and 3 were All Rights Reserved.

All 8 files + their attr.json siblings deleted; HTML refs in `ports/port-miami.html` left intentionally broken so the validator surfaces the gap. CSV rows removed from `attributions/attributions.csv`.

| Slot | Previous (deleted) | Cited Flickr |
|---|---|---|
| `port-miami-hero.webp` | (subject not Read-verified before deletion) | ARR |
| `port-miami-attraction-1.webp` | (subject not Read-verified) | CC BY-NC-ND 2.0 |
| `port-miami-attraction-2.webp` | (subject not Read-verified) | CC BY-NC-ND 2.0 |
| `port-miami-food.webp` | (subject not Read-verified) | CC BY-NC-ND 2.0 |
| `port-miami-harbor.webp` | (subject not Read-verified) | CC BY-NC-ND 2.0 |
| `port-miami-landmark.webp` | (subject not Read-verified) | CC BY-NC-ND 2.0 |
| `port-miami-panorama.webp` | (subject not Read-verified) | ARR |
| `port-miami-street.webp` | (subject not Read-verified) | ARR |

**Estimated effort:** ~3-4 careful hours (8 slots from scratch).

#### royal-beach-club-antigua — 8 open slots (all deleted; whole directory now empty except `IMAGE-MANIFEST.md`)

The 2026-05-13 license sweep on royal-beach-club-antigua found 8 of 8 cited Flickr sources are All Rights Reserved. (This port also previously referenced a cross-port image from `/ports/img/antigua/` — a separate cross-port-reuse issue that the deletion does not affect.)

All 8 files + their attr.json siblings deleted; HTML refs in `ports/royal-beach-club-antigua.html` left intentionally broken. CSV rows removed.

| Slot | Cited Flickr |
|---|---|
| `royal-beach-club-antigua-hero.webp` | ARR |
| `royal-beach-club-antigua-attraction-1.webp` | ARR |
| `royal-beach-club-antigua-attraction-2.webp` | ARR |
| `royal-beach-club-antigua-food.webp` | ARR |
| `royal-beach-club-antigua-harbor.webp` | ARR |
| `royal-beach-club-antigua-landmark.webp` | ARR |
| `royal-beach-club-antigua-panorama.webp` | ARR |
| `royal-beach-club-antigua-street.webp` | ARR |

**Estimated effort:** ~3-4 careful hours, but this port is a Royal Caribbean private destination (newly opened on Antigua) with limited Creative Commons photographic coverage — may need to start with the cruise line's own press imagery if any is published under a permissive license, or accept that the page ships with fewer images than the validator's 11-floor.

#### sydney-ns + santa-marta — flagged for separate decision

Two ports surfaced in the same broken-ref sweep but were *not* deleted:

- **`santa-marta`** — 12 images, all attributed to **Wikimedia Commons** with what appear to be real CC BY 2.0 / CC BY-SA 3.0 / CC BY-SA 4.0 URLs. The sandbox blocks Commons egress so the licenses cannot be programmatically re-verified, but the URL shape and CC license labels are consistent with proper Commons attribution. Recommend keeping pending production-environment re-verification. The original broken-ref was `/images/author-thumb.jpg` (chrome image, not a port image).

- **`sydney-ns`** — 8 images, all with the college-fjord-class stub attribution shape (`"source": "Sourced under free license"`, empty `source_url`, `"license": "CC BY-SA 4.0 or equivalent"`). **Provably unverifiable** — no source URL means there's no way to confirm the license claim. Per project rules, these are placeholder shape and should be deleted, but I have NOT done so without explicit user direction since:
  - The bytes could be real photos with real CC licenses whose attribution metadata was simply lost during sourcing
  - Bulk-deleting 8 files leaves the page with 1 broken ref (the originally-flagged `sydney-ns-9.webp`) plus 8 more = 9 total
  - This is more aggressive than the ARR-deletion principle, since "unverifiable" is not the same as "verified-bad"

**Open question for the user:** does the "get the ARR photos off the site" principle extend to the sydney-ns unverifiable-attribution class (stub `"CC BY-SA 4.0 or equivalent"` with empty source URL)?

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

### Companion pattern (Pattern A — best-time generic boilerplate) — IN PROGRESS

A different boilerplate template appeared on **53 ports** initially (verified 2026-05-13 via `grep -lE 'Spring and early autumn tend to offer' ports/*.html | wc -l`). The questions themselves are clean (no "Port Guide" template-bug token), but the answer reads:

> "Spring and early autumn tend to offer the most comfortable conditions for sightseeing — mild temperatures, manageable crowds, and pleasant light for photography. Summer brings the warmest weather but also peak cruise traffic and higher prices. Winter visits can be rewarding for those who prefer quiet streets and authentic atmosphere…"

This is factually wrong for tropical, equatorial, and sub-Antarctic ports (no meaningful spring/autumn/winter).

**Status as of 2026-05-13 (end of session `claude/continue-port-faq-4pvWk`):** 42 ports rewritten with JSON-traced content; 11 ports remain. All 11 remaining ports are blocked on structural issues from this task's perspective — see "Why these 11 ports aren't fixable as FAQ-only edits" below.

**Remaining 11 ports + their structural block:**

| Port | Block | Cross-ref |
|---|---|---|
| `panama-canal` | Repeated FAQ blocks (4×); 32 visible Q&As; needs editorial consolidation | Issue H |
| `penang` | 14 errors, B_ACT_*, CATCH, H001, H002 — weather section partially absent | Issue E |
| `port-elizabeth` | B_ACT_SNORKELING/HIKING/CITY_WALKING missing; D_MONTH parse error | Issue E |
| `punta-arenas` | B_ACT_BEACH/SNORKELING missing (validator requires these for all ports; sub-Antarctic port can't legitimately have them) | Issue E + validator over-strict |
| `royal-beach-club-antigua` | 5 B_ACT_* missing; private-island stub page | Issue E |
| `royal-beach-club-nassau` | B_ACT_CITY_WALKING/HIKING missing; private-island stub | Issue E |
| `santa-marta` | 38 errors; entire weather section absent | Issue E |
| `stavanger` | 36 errors; entire weather section absent | Issue E |
| `strait-of-magellan` | 31 errors; entire weather section absent | Issue E |
| `tobago` | S001 only; missing `<section id="weather-guide">` | Issue E |
| `ushuaia` | 12 errors including B_ACT_*, CATCH, B_AVOID | Issue E |

Two paths to unblock:

1. **Re-run the seasonal-guide backfill** on these 11 ports with the corrections from `b0c082b6` (no fabrication). This is the simplest path — most of the missing structural elements have data in `seasonal-guides.json` already.
2. **Loosen `REQUIRED.activities`** in `scripts/port-weather-validator-core.js` (line 121) for ports whose region doesn't support certain activities. Sub-Antarctic ports legitimately have no beach/snorkeling; the validator currently forces all 5 activity rows on every page.

**Regenerate the remaining list:**
```bash
grep -lE 'Spring and early autumn tend to offer' ports/*.html | sort -u
```

---

## P1 — Additional template-bug + data-integrity surfaces (2026-05-13, in-flight)

While shipping the Pattern A best-time rewrites (the companion task in the section above), encountered five distinct shoulder issues that the existing P1 entries don't already cover. Documenting separately so a future audit can address them in isolation if the in-flight session doesn't.

### Pattern C — "Cruise"/"Shore Excursion" suffix template bug

A third template-substitution failure where the literal token "Cruise" or "Shore Excursion" is appended to the port name in question text. Distinct from Pattern B ("Port Guide" suffix) — same shape, different filler. Examples encountered (rewritten in-flight):

```
Q: What is the best time to visit Manila Cruise?
Q: What is the best time to visit Trinidad Cruise?
Q: What is the best time to visit Port Arthur Cruise?
Q: What is the best time to visit Port Said Cruise?
Q: What is the best time to visit San Diego Cruise?
Q: What is the best time to visit Tórshavn Cruise?
Q: What is the best time to visit Rotorua Shore Excursion?
```

**Find remaining instances:**
```bash
grep -lE 'Q:[^<]*(Cruise|Shore Excursion)\?' ports/*.html
```

7 ports already fixed in the 2026-05-13 session: manila, trinidad, port-arthur, port-said, san-diego, torshavn, rotorua. Run the grep above to check whether others remain.

### Pattern D — Half-filled "currency is used in" answer

A different template failure where the currency-name slot was never substituted, leaving the literal "The local currency is used in." as the answer. Distinct from Pattern A/B/C — it's not a question-text issue; the answer text itself is incomplete.

```
A: The local currency is used in. Most tourist-facing businesses accept major credit cards…
```

**Ports affected (verified 2026-05-13):**
```bash
grep -l 'The local currency is used in' ports/*.html
```
Returns: porto, rhodes, riga, stavanger, tallinn, trieste, st-petersburg — 7 ports. Fixed in-flight on porto, rhodes, riga, tallinn (rewrote or removed the broken sentence). Remaining: stavanger (full structural rebuild needed; see below), trieste (verify), st-petersburg.

The fix per port is normally one of:
- Remove the broken Q entirely if the page already has a working currency Q elsewhere.
- Rewrite the answer using the actual local currency name (which IS in the page metadata or can be sourced from the country — verify against existing on-page meta or admin/PORT_CURRENCIES if exists; do NOT invent from training).

### Issue E — Ports with the entire weather/seasonal section missing

Some ports never received the seasonal-guide backfill — they're missing the `<section id="weather-guide">`, all glance labels, the cruise-seasons-grid, packing-list, hazards section, etc. Weather validator reports 30+ errors per port, all structural. FAQ-only work on these ports is wasted (the validator stays FAIL on the structural absence regardless of FAQ correctness).

**Ports affected (verified by running the validator on a fresh checkout):**
- `stavanger` — 36 errors (entire weather section absent)
- `santa-marta` — 38 errors (entire weather section absent)
- `strait-of-magellan` — 31 errors
- `ushuaia` — 12 errors (many structural)
- `penang` — 14 errors (B_ACT_*, CATCH, H001, H002 — most structural)
- `tobago` — only S001 (missing weather-guide section id) but otherwise scored well

These need a content/template pass that wires the seasonal-guide section in, not a FAQ-topic pass. Probable cause: the 2026-02 backfill (`a69f1471`) skipped these ports. A re-run of the backfill (with fabrication branches removed per the `b0c082b6` revert) should restore the section for ports where seasonal-guides.json has data.

### Issue F — Forbidden phrases inside `seasonal-guides.json`

The DEDUP layer of `scripts/validate-port-weather.js` forbids `Shoulder Season` (FORBIDDEN_PATTERNS line 102), but the JSON registry itself contains the phrase in `packing_nudges`:

```
seattle.packing_nudges:    [..., "Small umbrella or rain jacket for shoulder seasons", ...]
victoria-bc.packing_nudges: [..., "Light rain jacket for shoulder season", ...]
```

When a page's packing answer mirrors `packing_nudges` verbatim (the doctrine's "quote rich phrasing verbatim" rule), it inherits the forbidden phrase and trips TERM_001/DEDUP. Fixed in-flight by replacing the forbidden phrase with specific months from `cruise_seasons.transitional` (e.g., "shoulder season" → "April and October" for victoria-bc). The doctrine-clean fix would be a one-shot scan of the JSON registry for forbidden phrases:

```bash
grep -E '"shoulder season|Best Months? (for|to)|Weather Guide|Climate Overview|When to (Go|Visit)|Typical Weather"' assets/data/ports/seasonal-guides.json
```

…and update the registry entries to use replacement phrasing the validator accepts. Then any port that mirrors `packing_nudges` verbatim won't inherit forbidden phrases.

### Issue H — Repeated FAQ blocks (panama-canal observed)

`ports/panama-canal.html` has the same 4-question FAQ block inserted
verbatim 4 times across the page (lines ~487-489, ~567-572, ~620,
~675), each followed by the same Pattern-A best-time Q. The page
appears structured for multiple ports along the canal transit but the
FAQ backfill duplicated rather than customizing per section. Total
visible: 32 Q&As; FAQ_DUP fires 4× on the best-time match.

Fix is beyond per-port FAQ work — needs editorial decision on whether
to keep 4 sections (each with distinct Q&As) or consolidate to one.

Search:
```bash
for p in ports/*.html; do
  c=$(grep -c '<strong>Q:' "$p" 2>/dev/null)
  [ "$c" -gt 15 ] && echo "$p: $c visible Q&As"
done
```

### Issue G — Generic currency-schema entries (deferrable)

Many ports have schema `FAQPage` currency entries that read:

> "Check local currency requirements before your visit. Major credit cards are typically accepted at tourist areas, but having some local currency is useful for smaller vendors and markets."

This is generic boilerplate with no port-specific info. The visible currency answer on most ports IS port-specific (correct currency code, ATM tips, sometimes export rules). Mirroring the visible to schema would replace the generic schema with the port-specific text. Encountered on most Pattern A ports in the 2026-05-13 session — fixed where the port was edited for other reasons; not a separate dedicated pass.

---

## P1 — Drink Calculator copy contradicts its own chart re: "6-7 drinks break-even" (2026-05-17)

**Severity:** Affects published content — both `/drink-calculator.html` and `/drink-calculatorv2.html` carry copy/schema that the chart on the same page contradicts. The new article `articles/is-drink-package-worth-it.html` documents the chart-side result and explicitly calls the 5-to-7 rule wrong.

**Triggered by:** Writing the May 17 tool-demo article. Captured live chart output at three honest consumption levels and found à la carte beats Deluxe by $1,000+ in every typical scenario — chart break-even sits around 11+ cocktail-equivalents per couple per day, not 5-7. Then noticed the same tool's own FAQ schema and rate-table copy still say "6-7 drinks per day breaks even."

### What's actually inconsistent

The tool says two different things on the same page:

| Source | Number quoted |
|---|---|
| `drink-calculatorv2.html:129` (FAQ schema answer) | "break even at 6-7 drinks per day" |
| `drink-calculatorv2.html:318` (answer-first comment) | "Most cruisers break even at 6-7 drinks/day on Deluxe package" |
| `drink-calculatorv2.html:1709` (comparison table cell) | "5-6 drinks" |
| `drink-calculatorv2.html:1739` (rate-table prose) | "break even at 6-7 drinks per day" |
| Same page's chart output, run honestly | À la carte still winning at 10+ drinks/day; break-even ~11 cocktail-equivalents/couple/day |
| `drink-calculator.html:127, 309, 1110, 1140` | Same "6-7" / "5-6" copy as v2 |

Both `/drink-calculator.html` (v1) and `/drink-calculatorv2.html` (v2) carry the same wrong copy.

### Why this is happening

There is an existing internal investigation in `.claude/plans/math-issues-investigation.md` that catalogues 12+ math bugs in the engine. The single most relevant one for this entry:

> **Bug 2: Gratuity on Packages but Not on À La Carte.** Package costs include gratuity; individual drink costs do not. In reality, bars charge the same percentage on every drink. À la carte is understated by 18-20%. Carnival proof: break-even should be 5.4 cocktails/day at $15.60 each with grat. Engine shows break-even at 7 using $13 without grat.

So there are two compounding things going on:
1. **The "6-7 drinks" copy is using pre-gratuity arithmetic** to derive its break-even (same math that produced Bug 2). It's a stale rule-of-thumb that ignores both the gratuity and the realistic drink mix.
2. **The chart, despite Bug 2 making à la carte look cheaper than reality, still shows packages losing badly** because the per-person Deluxe price is ~$83/day post-gratuity and most cruisers don't actually drink $83 worth.

Fixing Bug 2 would push à la carte UP by ~18% across all scenarios, which would lower the chart's break-even somewhat — but probably to around 8 cocktail-equivalents/couple/day, still nowhere near the "6-7 per person" the copy quotes.

### Two paths

**Path A — Copy fix only (fast).** Update the four locations in each calculator (FAQ schema, answer-first comment, table cell, prose) to match the chart's actual output. Reword the FAQ answers along the lines of: "The widely repeated 5-to-7 drinks per day rule is based on pre-gratuity arithmetic and assumes only $14 cocktails. At realistic consumption mixes with the 18% gratuity included, most cruisers break even closer to 11 cocktail-equivalents per couple per day. Use the calculator above with your real drinks." This brings the tool internally consistent immediately. ~30 min of work.

**Path B — Fix the engine first, then copy (correct).** Work through the bug list in `.claude/plans/math-issues-investigation.md` (gratuity on à la carte, sea-day weighting, 15-drink limit, break-even drink price mismatches, etc.). After fixes, re-derive the break-even number from the corrected engine and update copy to match. Then recapture the article's screenshots, since they'd be stale.

Path A unblocks honesty fast. Path B is the proper fix. Recommended: do A now, schedule B against the broader calculator-v2 work already in P2.

### Article dependencies

`articles/is-drink-package-worth-it.html` and its four screenshots in `assets/articles/drink-calculator-worth-it/` reflect the **current** chart output. If Path B happens and the chart shifts:

- Headline finding ("5-to-7 rule is wrong") survives — bug fixes shift the break-even down but probably still above 5-7 for typical consumption mixes.
- Specific dollar numbers in the body and screenshots become stale.
- Recapture is mechanical: server, headless Playwright, the script lived at `_capture-calc-screenshots.mjs` in commit `73ac9905` history (deleted in same commit).

### Find the affected copy

```bash
grep -nE "(5|6).?(to|-|—).?(6|7) drinks|break even at [567]" \
  drink-calculator.html drink-calculatorv2.html
```

### What is NOT a problem

The chart-side math, even with the bugs in `math-issues-investigation.md`, is *more accurate than the 5-7 copy*. The bugs make à la carte look cheaper than reality, but the chart still beats the 5-7 narrative because the package is genuinely overpriced for most cruisers. Removing the 5-7 copy is correct in both the pre-fix and post-fix worlds.

---

## Items surfaced in session `claude/fix-carnival-validator-krEdD` (2026-05-11)

Surfaced during the multi-turn image-honesty audit + cleanup; not duplicates
of the P0 HAL section above. Most are downstream consequences of the audit.

### Source-real-photography backlog (39 pages, ordered by priority)

These pages have a TIER 2 ship-map.png placeholder applied — they validate
clean but the placeholder is a stand-in until real ship-specific photography
is sourced. Caption wording was tuned per-page:

**Pre-delivery — sourceable on delivery (1)**
- `ships/msc/msc-world-asia.html` — enters service November 2026; caption
  reads "Pre-delivery placeholder — MSC World Asia enters service
  November 2026."

**Current-fleet (10) — caption "verified [Ship] photography pending publication"**
HAL Active: `nieuw-amsterdam-v.html`, `volendam-iii.html`, `westerdam-ii.html`
Others: `ships/costa/costa-venezia.html`, `ships/oceania/marina.html`,
`ships/oceania/sirena.html`, `ships/oceania/vista.html`,
`ships/princess/sapphire-princess.html`, `ships/silversea/silver-nova.html`,
`ships/virgin-voyages/resilient-lady.html`

For these, photos exist in the world; what's pending is *our* curation +
publication after the 2026-05 image-honesty audit removed misattributed
photos. Best sourced from official press kits, Wikimedia Commons, or
verified Flickr photographers (NOT the public-feed pattern that caused
the original contamination).

**Historical (23) — caption "authentic [Ship] photography pending sourcing"**
Retired or scrapped ships where the original problem (finding photos at
all) is real. Should be sourced from period archives:
- HAL historical: 17 pages (`ships/holland-america-line/amsterdam.html`,
  `edam.html`, `leerdam.html`, `maartensdijk.html`, `nieuw-amsterdam-iii.html`,
  `noordam-ii.html`, `noordam-iii.html`, `p-caland.html`, `potsdam.html`,
  `prinsendam-i.html`, `ryndam.html`, `statendam-ii.html`, `statendam.html`,
  `veendam-ii.html`, `veendam-iv.html` (Historical badge), `veendam.html`,
  `volendam-ii.html`, `w-a-scholten.html`, `westerdam-i.html`,
  `prinsendam-ii.html`)
- Celebrity historical: 3 (`celebrity-century.html`, `horizon.html`, `zenith.html`)
- Carnival historical: `carnival-fantasy.html`
- RCL historical: `nordic-prince.html`

**Celebrity Galápagos status mismatch (2)** — these have Historical badges
on their pages but the ships are still actively operating Galapagos
itineraries. Worth re-reviewing whether the Historical badge is correct:
- `ships/celebrity-cruises/celebrity-xperience.html`
- `ships/celebrity-cruises/celebrity-xploration.html`

### Image audit needed on other directories

The 2026-05-10 audit only covered `assets/ships/*flickr*`. The same
Flickr-public-feed contamination pattern could exist in:
- `assets/ports/img/...` — partially cleaned in 2026-04-11/12 per the P0
  section above, but only specific ports were verified. Site-wide port
  image audit not yet done.
- `assets/authors/` — author headshots/photos may include marginal sourcing.
- Any "venue" or "restaurant" image directories under `assets/`.

Recommended approach: same parallel-subagent visual sweep used for ships
(see `audit-reports/flickr_audit_2026-05-10.md` for the method), but with
the lessons in `admin/CAREFUL.md` applied from the start (10% spot-check
+ dry-run + whole-repo orphan search before any bulk deletion).

### Phase B / Phase C — scope clarification needed

**Phase B (image-honesty cleanup on 0E pages):** Earlier todo described a
~128-page placeholder pass. After the 2026-05-10 audit consumed most of
the obvious contamination, Phase B's residual scope is unclear. Probably
overlaps with the source-real-photography backlog above. Needs fresh
definition or can be marked subsumed.

**Phase C (template version unification across 290 ship pages):** Surveyed
2026-05-11. The 290 ship pages split:
- 144 at `v3.010.400`
- 55 at `v3.010.300` (all in carnival + rcl directories)
- 91 with no `meta version` tag at all

Diff between a .300 and a .400 page is NOT just a version-string bump —
involves substantial template differences (different scripture quotes,
header comment block, meta tag ordering, OG/Twitter handling, service
worker vs Google Analytics, smart-quote inconsistencies in inline JS).
Calling this "mechanical, low-priority" in the prior todo was wrong.
True scope: a per-fleet template-regeneration project, ~50 RCL + 5
Carnival pages need full rewrites to match the .400 standard. Defer
until the .400 template itself is verified stable (some .400 pages have
smart-quote `‘no-js’` in inline JS which would error if executed — see
below).

### Smart-quotes JS bug on `.400` Celebrity ship pages — **RESOLVED 2026-05-12**

26 pages in `ships/celebrity-cruises/` had `<script>document.documentElement
.classList.remove(‘no-js’);</script>` with U+2018/U+2019 smart quotes
instead of straight quotes — confirmed as a JS `SyntaxError` ("Invalid
or unexpected token") via Node.js parser. The script tag failed to
execute, meaning the `no-js` class was never removed from `<html>` on
those pages, breaking progressive enhancement.

Fixed 2026-05-12: global replace `‘no-js’` → `'no-js'` across all 26
files. Verified residual count = 0; JS is now valid. Per-page sample
showed the line at line 20 of each file:
  `<script>document.documentElement.classList.remove('no-js');</script>`

The fix applied to the entire celebrity-cruises directory only — no
other fleet was affected. (Likely an upstream auto-formatter or
copy-paste from a smart-quote-converting editor introduced the bug
during a template regeneration.)

### Resilient_Lady cocktail image — alternative use case

The 2026-05-10 audit deleted `Resilient_Lady_flickr_lorablong.webp`
(cocktails on a Virgin Voyages bar table). In the 2026-05-11 merge with
main, the upstream branch had explicitly used this image with alt text
"Cocktails onboard Resilient Lady" — framing it as legitimate venue
content rather than a First Look ship-exterior shot. If the cocktails
ARE on Resilient Lady (the bar interior matches Virgin's red/blue
palette), this image could be restored under a "Venues" or "Bars &
Lounges" gallery section, NOT in First Look. Same logic potentially
applies to other deleted "cabin interior" / "onboard amenity" files:
- `Msc_Euribia_flickr_DennisSHurd.webp` (cabin chocolates + champagne)
- `Msc_Seashore_flickr_Traveloscopy.webp` (empty theater)
- `Msc_Virtuosa_flickr_janetg48.webp` (atrium glass view)
- `Celebrity_Galaxy_flickr_CaptainMartini.webp` (twin-bed cabin) — was UNCLEAR (kept)
- `Volendam_flickr_borichar.webp` (cabin interior) — was UNCLEAR (kept)

Recoverable via `git show 105dd168^:assets/ships/<file>` if a future
session wants to restore them for a different gallery.

### `seven-seas-mariner.html` retains an editorially marginal slide

After the 2026-05-11 cleanup of `seven-seas-mariner_flickr_new.jpg` (which
actually showed Seven Seas Navigator, not Mariner), the page retained a
single slide referencing `Seven_Seas_Mariner_flickr_NicholasCoates.webp`.
That image was classified UNCLEAR in the audit re-verification — a very
distant cruise ship across Liverpool's Mersey with a rusty stair railing
in the foreground, name not legible. Page validates clean but the single
remaining slide is borderline.

### `enchantment-of-the-seas` + `legend-of-the-seas-1995-built` — slug-suffix rename plan

When the slug-strictness work moves forward, these two pages can be
fixed via file rename (not the same as the TBN class-mate pages which
need a validator change). Filenames need to include the full page slug:
- `enchantment-halifax-2011.webp` → `enchantment-of-the-seas-halifax-2011.webp`
- `enchantment-labadee-2013.webp` → `enchantment-of-the-seas-labadee-2013.webp`
- `enchantment-tampa-2025.webp` → `enchantment-of-the-seas-tampa-2025.webp`
- `Legend_of_the_Seas_(1).jpg` → `Legend_of_the_Seas_1995_built_(1).jpg`
- `Legend_Of_The_Seas_tied_up_at_Danang,_Vietnam_port.jpg` → `Legend_of_the_Seas_1995_built_at_Danang.jpg`
- `Rhapsody_of_the_Seas_(3725748454).jpg` → sister-ship reference; class-mate
  case, not slug-suffix. Either drop the slide or handle as TBN class-mate.

Rename includes: update HTML refs, update `attributions/attributions.csv`,
git mv the files. Each file is referenced by exactly one page (verified
2026-05-11) so no cross-page reuse implications.

---

## Google Search Console Audit (2026-03-27)

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

## Codebase Status (refreshed 2026-05-12)

| Asset | 2026-03-02 | 2026-05-12 | Delta |
|-------|-----------:|-----------:|------:|
| Port pages | 387 | 387 | — |
| Ship pages | 295 | 294 | −1 (1 retired or renamed) |
| Restaurant pages | 472 | 472 | — |
| Total HTML pages | 1,241 | 1,249 | +8 |
| WebP images | 4,486 | 4,180 | −306 (Flickr ARR + audit deletions) |
| Logbook JSON files | 285 | not re-counted | — |
| Stateroom exception files | 270 | not re-counted | — |
| Cruise line directories | 16 | not re-counted | — |
| Inline `style=` attributes | ~15,626 | **22,181** | **+6,555 — CSS consolidation is moving backwards** |
| Files with `<style>` blocks | 9 | **32** | **+23 — more inline style blocks added since 2026-03-02** |

The inline-style and `<style>`-block counts are now WORSE than at the last consolidation date. The 2026-03-02 baseline reflected mid-consolidation progress; new ship/port work has been adding more inline styling than the consolidation has been removing. Flag for the CSS Consolidation entry in GREEN LANE.

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

**Source:** Continuation of PR #1466 (Phase 3.2a). Phase 3.2b (PR #1497) and Phase 3.2c (PR #1480) shipped 2026-05-09 and were moved to `admin/COMPLETED_TASKS.md` on 2026-05-12 (audit branch `claude/audit-unfinished-tasks-5evPi`). Two follow-ups remain.

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
**Status (refreshed 2026-05-13 from a live `node admin/validate.js --all-ships` run):**
- 312 files validated (297 ship pages + 15 hub/index pages)
- **96 passing / 216 failing** — 27% ship pass rate
- Note vs the 2026-05-11 dashboard: that snapshot had `sh_pass`: 2 + `sh_warn_only`: 275 + `sh_fail`: 13 + `js_fail`: 210. The current run aggregates sh+js into one pass/fail criterion — definition is stricter, not a fleet regression.

**Top error rules (top 8 by count, 2026-05-13 live run):**
- `template_remnants`: **301** (was not in top 6 of 2026-05-11 dashboard — likely a rule-definition tightening, not 301 new regressions; verify rule before remediation)
- `few_images`: **230** (was 158 on 2026-05-11; +72 — primary contributor is Flickr ARR / unclear-photo cleanup pushing ships below the minimum)
- `cascade_fully_failed`: **51** (matches Phase 3.6 entry)
- `main_entity_blacklisted`: **26** (was 23)
- `wrong_section_order`: **23** (was 22)
- `missing_required`: **11** (was 8)
- `few_videos`: **11**
- `placeholder_content`: **7**

**Remaining quality improvements:**
- [ ] **template_remnants: 301 ships** — verify rule definition first; the jump from ~0 to 301 between 2026-05-11 and 2026-05-13 is too large to be organic, almost certainly a validator rule expansion that surfaced latent template-placeholder strings
- [ ] **few_images: 230 ships** (refreshed 2026-05-13; up from 158; right fix is sourcing replacement images, not relaxing the threshold)
- [ ] **cascade_fully_failed: 51 ships** (Phase 3.6 — investigation-first)
- [ ] **main_entity_blacklisted: 26 ships** (JSON-LD `mainEntity` references blocked schema.org types; investigate)
- [ ] **wrong_section_order: 23 ships** (matches the 2026-03-25 port-page-normalization pattern but on ships)
- [ ] **missing_required + placeholder_content + few_videos: 29 ships combined** (smaller categories)
- [ ] Generic review text (208 ships per 2026-03-02; validator no longer surfaces a rule by that name — needs human content-review pass, not validator)
- [ ] FAQ too short (186 ships per 2026-03-02; validator no longer surfaces by name)
- [ ] Missing whimsical units (~181 ships per 2026-03-02; *count needs refresh*)
- [ ] Missing grid-2 layout (~30 ships per 2026-03-02; *count needs refresh*)

### [G] Port Validation — Remaining Work
**Status (refreshed 2026-05-13 from a live per-port `node admin/validate-port-page-v2.js --json-output` sweep — 385 of 387 ports completed; 2 missed due to runtime hiccups):**

- **47 passing / 338 failing (12% pass rate)** — sharp drop from the 2026-03-02 figure of 242/387 (62.5%). **Root cause identified 2026-05-13:** the weather sub-validator was MERGED into `admin/validate-port-page-v2.js` on 2026-04-13 (commit `2058711f` / PR #1411) — AFTER the 2026-03-02 baseline. Before that commit, weather wasn't checked at all. The pass-rate drop is the rule that wasn't there before now blocking ports that were never built to satisfy it.
- **The per-port weather errors ARE real content gaps**, not a misfiring rule. 30-port sample's dominant patterns: missing FAQ "Hurricane/storm season" (77%), missing FAQ "Rain concerns" (73%), missing FAQ "Packing for weather" (67%), missing FAQ "Best time to visit" (50%), FAQ_COUNT mismatch (87%). The recent merged commits (st-kitts/grenada/dominica/bonaire/split/kotor/marseille/bora-bora) ARE this work — each fixes one port (~30 min hand-edit).
- **Empirical opportunity for batch automation:** `assets/data/ports/seasonal-guides.json` contains structured data for **335 of the 338 failing ports** (only `petersburg`, `valdez`, `wrangell` lack entries). The 4 weather FAQs in successful fix commits are templated verbatim from JSON fields (`hazards.hurricane_season`, `monthly_averages.rain_days`, `packing_nudges`, `cruise_seasons.high`, etc.). A script that reads `seasonal-guides.json` and generates the 4 FAQs (visible HTML + JSON-LD schema) per port would unblock 335 ports in one batch. Estimated: ~0.5 day to write + a sample-review pass.
- Score distribution among the 385: 0 ports at score 0 (none completely broken); 310 in the 1-68 range; 50 at 70-85; 25 at 86+. Mean score 62.

**Top blocking-error rules (2026-05-13 live, 385 ports):**
- `weather_validation_failed`: **338** (one shared cause, see above)
- `missing_image_file`: 53 (broken image refs — real per-port work)
- `missing_stylesheet`: 37
- `collapsible_required`: 36
- `missing_main_content`: 13
- `missing_tender_indicator`: 4
- `forbidden_hype` / `out_of_order`: 3 each
- `forbidden_drinking` / `forbidden_nightlife` / `recent_articles_validation_failed`: 2 each

**Top warning rules (2026-05-13 live, 385 ports):**
- `image_reuse_alt_drift`: **738** (alt-text drift on shared images — touches every port using hero or author photos)
- `missing_canonical_nav_items`: 368 (nav missing canonical /planning.html link site-wide)
- `missing_stories_noscript`: 346 *(quantifies the Noscript Phase 1 — Recent Stories item: every port needs the fallback)*
- `missing_ships_noscript`: 342 *(quantifies the Noscript Phase 1 — Ships Visiting item)*
- `missing_css_version`: 328 (cache-bust version query missing on stylesheet link)
- `insufficient_pois`: **288** *(confirms — and lowers — the "365 ports <10 POIs" 2026-03-02 claim; real number is 288 of 385)*
- `poi_ids_without_pois`: 259 (POI IDs referenced but POIs not resolved — related to insufficient_pois)
- `placeholder_map_noscript`: 249 *(quantifies the Noscript Phase 2 — Map placeholder item)*
- `gallery_credit_low_diversity`: 181 (4+ gallery images cite ≤2 unique source URLs)
- `first_person_maximum`: 178 (voice — first-person occurrence above the like-a-human ceiling)

**Remaining quality improvements:**
- [ ] **Investigate `weather_validation_failed` root cause** (BEFORE any port-by-port remediation) — the 338-count is too clean to be 338 individual problems. Compare current `scripts/validate-port-weather.js` against its state when 242 ports were passing (2026-03-02). Either restore the prior bar or document the change and start a fleet backfill plan.
- [ ] `missing_image_file`: 53 ports (real per-port broken-image work)
- [ ] `missing_stylesheet` + `collapsible_required` + `missing_main_content`: 86 ports combined (smaller categories; likely fixable in batches by file pattern)
- [ ] Noscript Phase 1 (already in queue under [G] Noscript Remediation): now empirically scoped — 346 stories + 342 ships + 249 map = 280-350 ports per fallback type
- [ ] POI manifest work (already in queue): 288 ports below the 10-POI minimum (was claimed as 365 in 2026-03-02; actual scope is smaller and more bounded)
- [ ] `image_reuse_alt_drift` site-wide: 738 warnings — likely concentrated on a few shared images (author portraits, hero variants); fix the source images' canonical alt text and the warning drops across all referencing pages
- [ ] FAQ trim, promotional drift cleanup, first_person_maximum: voice-touch passes (use `voice-audit` skill); 178+ ports affected by first-person alone
- [ ] 2 ports missed by the validator sweep (runtime hiccups) — re-run on those after the weather rule is sorted

### [G] Port Weather — Remaining Coverage
**Refreshed 2026-05-12:** 365/387 ports now have weather widgets (was 351; gap dropped from 36 to 22).
- [ ] Add weather section to remaining 22 ports

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
- [ ] Expand "Real Talk" honest assessments to 75+ ports (50 ports as of 2026-05-12 spot-check; was 46 at 2026-03-02; gap to target: 25 more)

**Ship page improvements:**
- [ ] Add cabin size/amenity quick facts where missing
- [ ] Ensure refurbishment dates are current
- [ ] Add crew count and total deck count if missing
- [ ] Promote Stateroom Checker more prominently on ship pages

**Site-wide:**
*All three site-wide bullets retired 2026-05-12 (audit). See `admin/AUDIT_TRIAGE_2026-05-12.md`.*

### [G] Affiliate Link Infrastructure
**Phase 1 (Infrastructure) DONE. Phase 2 (Articles) DONE. Phase 3 (Site-wide) ~99% DONE.**
- [ ] Update about-us.html "Our Promise" section to acknowledge Amazon Associates participation
- [x] Add affiliate article links to 4 remaining ship pages (carnival-adventure, carnivale-1956, jubilee-1986, mardi-gras-1972) — completed 2026-05-13 (B2.4)
- [ ] Add affiliate article links to 3 remaining port pages (beijing, falmouth-jamaica, kyoto)

### [G] Quiz Remaining Fixes
*All 3 prior fixes verified shipped and moved to `admin/COMPLETED_TASKS.md` on 2026-05-12. The "Run edge case test personas" bullet retired 2026-05-12 (audit) as undefined scope. Section retained as a marker for future quiz work.*

### [G] Data Quality
*Both "Verify quality of auto-generated …" bullets retired 2026-05-12 (audit) as lacking acceptance criteria. See `admin/AUDIT_TRIAGE_2026-05-12.md`.*

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
- [ ] Set up Bing Webmaster Tools
- [ ] Set up Google Analytics dashboard

(GSC setup verified active and moved to `admin/COMPLETED_TASKS.md` on 2026-05-12; see the "Google Search Console Audit (2026-03-27)" section at the top of this file for the operational data.)

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

---

## Cruise Tipping Calculator — Known Defects (Discovered 2026-05-09 careful-not-clever audit)

**Source:** Post-merge careful-not-clever audit against the v1.7-alpha skill (canonical 2026-05-09). All eight items from the original audit are now shipped and moved to `admin/COMPLETED_TASKS.md`:

- Six dollar-correctness defects (P1 children handling, P1 region pricing for Costa/MSC, Costa half-rate, P2 Virgin Voyages prepaid vs onboard, P3 five legacy Carnival ship pages, P3 Playwright regression baseline) — shipped 2026-05-09 to 2026-05-10, moved 2026-05-12.
- One P2 (pre-existing JS errors on four tools) — shipped 2026-05-09, moved 2026-05-12.
- P3 `[object Object]` 404s — root-caused, fixed, and regression-tested 2026-05-13 (B1.2 of the audit batch plan). The smell was `sw.js:warmPrecache()` treating manifest `{url, priority}` entries as bare URL strings, producing 64 `/[object Object]` 404s per page load. Fix extracts `.url` explicitly + hardens `isSameOrigin`. See `admin/COMPLETED_TASKS.md`.

The section is retained as historical context for the v1.7-alpha careful-not-clever audit pattern; nothing remains open here.

---

## Retired during 2026-05-12 audit

Per the careful-not-clever rule ("do not delete silently"), these 13 items were removed from the active queue with explicit rationale during the 2026-05-12 audit pass. Full triage report: `admin/AUDIT_TRIAGE_2026-05-12.md`. User approved retirement.

| # | Item | Original section | Rationale |
|---|---|---|---|
| D1 | Evaluate PDF generation for top 20 ports | Competitor Analysis → Port page improvements | "Evaluate" not commit; overlap with Strategic Don't Chase ("Native mobile app — PWA sufficient") |
| D2 | Add "Best for / Not ideal for" profile guidance per port | Competitor Analysis → Port page improvements | Strategic Don't Chase explicitly rejects "Profile-based voyage paths — Impossible at scale" |
| D3 | Add author expertise callouts ("Ken has visited this port X times") | Competitor Analysis → Site-wide | Vague; no concrete spec |
| D4 | Run edge case test personas (Quiz) | Quiz Remaining Fixes | Personas were never written down. Unscoped |
| D5 | Header hero size inconsistent across hub pages | Uncategorized | One-liner with no detail; covered by CLAUDE.md's active "Site-wide hero/logo standardization" |
| D6 | Logo size standardization | Uncategorized | Duplicate of CLAUDE.md's active "Site-wide hero/logo standardization" |
| D7 | Verify quality of auto-generated seasonal data vs hand-curated | Data Quality | No acceptance criteria |
| D8 | Verify quality of auto-generated stateroom exception files | Data Quality | No acceptance criteria |
| D9 | `/travel.html` is also "Top 20 First-Cruise Questions" architectural quirk | Missing pages | Entry itself said "Don't act unless we're doing a broader articles-hub refactor"; future-cleanup note, not a task |
| D10 | Test service worker caching for complete offline access | Competitor Analysis → Site-wide | Vague continuous test; if real, scope as one Playwright spec |
| D11 | Market PWA install as "your offline cruise companion" | Competitor Analysis → Site-wide | Marketing copy = R-lane, not G-lane |
| D12 | Include "Skip this port if..." honest guidance where appropriate | Competitor Analysis → Port page improvements | Subjective; duplicates "Real Talk" expansion |
| D14 | Add "cabin location tips" section to ship pages | Competitor Analysis → Ship page improvements | Vague + fleet-wide (295 ships) = unscoped giant; if revived, needs design spec |

Item D13 ("Expand Real Talk honest assessments to 75+ ports") was NOT retired — it stays as a count-verify item in the Port page improvements section.

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
