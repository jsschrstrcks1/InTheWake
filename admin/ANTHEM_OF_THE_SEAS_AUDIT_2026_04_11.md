# Anthem of the Seas — Issues Found & Repair Plan

**Date:** 2026-04-11
**Page:** `ships/rcl/anthem-of-the-seas.html`
**Status:** AUDIT DEEPER PASS COMPLETE — multiple fleet-wide and site-wide issues found beyond Anthem
**Validator baseline:** 156 passed / 0 errors / 5 warnings ("passed with flying colors" is misleading)

## Context

A prior session claimed all RCL ships "passed with flying colors." The user disputed this for
Anthem specifically, then told me "you didn't even find the few things i noticed" and asked me
to keep looking. The deeper pass surfaced multiple issues the validator does not catch — some
Anthem-specific, several fleet-wide RCL, and at least one **site-wide content integrity issue**.

## Verified Ground Truth (from agent)

### Identification — ALL CORRECT, no changes needed
- IMO: **9656101** (verified 4 independent sources — VesselFinder, MyShipTracking, Vesseltracker, MarineTraffic)
- MMSI: **311000274**
- Call sign: **C6BI7**
- Flag: **Bahamas (Nassau)**
- Sister IMOs cross-checked distinct: Quantum 9549463, Ovation 9697753, Spectrum 9778856, Odyssey 9795737

### Builder & dates — NONE ON CURRENT PAGE
- Builder: **Meyer Werft, Papenburg, Germany** — **yard S.698**
- Keel laid: **19-20 November 2013**
- Float out: **21 February 2015**
- Delivered: **10 April 2015** at Bremerhaven
- Christened: **20 April 2015** in Southampton
- **Godmother: Emma Wilby** — 27-year-old British travel agent from Sunderland (notable choice)
- Maiden voyage: **22 April 2015** from Southampton, England
- Build cost: **~EUR 750M / ~USD 940M** (estimated — RCL never published official)
- Steel cut date: not publicly documented (do not guess)

### Physical specs — CORRECTIONS NEEDED
| Spec | Current page | Correct | Source |
|------|--------------|---------|--------|
| Length | 1,141 ft / 348 m | **1,139 ft / 347.1 m** | Meyer Werft |
| Beam | 136 ft / 41 m (in noscript only) | **49.4 m / 162 ft max** OR 41.4 m / 136 ft moulded | VesselFinder / Meyer Werft |
| Draft | (not listed) | **8.8 m / 28.9 ft** | VesselFinder |
| Decks | (not listed) | **18 total / 16 guest-accessible** | Meyer Werft |
| Cabins | (not listed) | **2,090** (1,717 outside + 373 inside, ~69% balcony, 22 ADA) | Meyer Werft |
| GT | 168,666 | 168,666 ✓ | Meyer Werft / VesselFinder |
| Guests | 4,180 double / ~4,905 max | 4,180 / 4,905 ✓ | Meyer Werft |
| Crew | 1,500 | 1,500 ✓ | Meyer Werft |
| Max speed | (not listed) | **22 knots** (2× ABB Azipod XO, 20.5 MW each) | Gangwaze |
| Class | "Quantum Class" | **Quantum Class (2nd of 5; Spectrum & Odyssey are Quantum Ultra sub-class)** | Royal Caribbean Blog / Cruise Critic |

### Deployment — STALE / WRONG
**Current page says year-round Cape Liberty / Bermuda / Caribbean / Canada-NE.**

**Agent confirms she has NOT been at Cape Liberty for 2025-26:**
- **Currently (11 Apr 2026): in Sydney, Australia** — inaugural Australian summer season
- Arrived Sydney 31 Oct 2025; 24 voyages (3-18 nights) to NZ / Tasmania / New Caledonia / Vanuatu
- **14 April 2026: Departs Sydney** on 18-night repositioning to Honolulu
- **Continues to Seattle for summer 2026 Alaska season**
- **11 May 2026: First confirmed Alaska sailing** (7-night Seattle round-trip — Sitka / Skagway / Endicott Arm / Juneau / Victoria)

Primary sources:
- <https://www.royalcaribbeanpresscenter.com/press-release/1715/a-new-summer-anthem-makes-its-way-to-australia-in-2025-26/>
- <https://www.seatrade-cruise.com/ports-destinations/anthem-of-the-seas-arrives-for-sydney-inaugural-season>
- <https://www.royalcaribbean.com/itinerary/7-night-alaska-adventure-from-seattle-on-anthem-AN07SEA-2909514450>
- <https://cruisesheet.com/royal-caribbean-anthem-of-the-seas-7-night-seattle-roundtrip-may-11-2026>

## Venue Audit — Confirmed Against Agent

### Keep (I was wrong to flag these)
| Venue | My initial call | Actual | Note |
|-------|-----------------|--------|------|
| **Johnny Rockets** | "Hallucination" | **REAL — keep** | Deck 14 poolside. Verified Gangwaze + Cruise Deck Plans. |
| **Jamie's Italian by Jamie Oliver** | "Partnership ended" | **REAL — keep** | UK chain collapsed 2019 but RCL retained licensed brand. Menu refreshed Aug 2023. |

### Remove (confirmed hallucinations or stale)
| Venue | Slug | Why |
|-------|------|-----|
| **Giovanni's Table** | `giovannis` | Not on Anthem. RCL pattern is one Italian specialty per ship; Anthem has Jamie's Italian. Cruise Critic's listing was legacy data. Currently on Voyager/Freedom/older Radiance. |
| **Brass & Bock** | `brass-and-bock` | Cannot verify in any primary source. Likely hallucination. |
| **Café Latte-tudes** | `latte-tudes` | Radiance-class venue, not Anthem. Anthem's coffee is via Café Promenade. |
| **Champagne Bar** | `champagne-bar` | Not a named standalone venue on Anthem. Vintages handles champagne/wine. |

### Rename
| Current | Correct |
|---------|---------|
| "Diamond Club" | **Diamond Lounge** (that's RCL's actual loyalty lounge name) |

### Still uncertain — needs additional verification
- **Splashaway Bay** — listed in venues-v2.json as a kids-subcategory activity. Agent didn't explicitly verify. Quantum class doesn't typically have Splashaway Bay (that's Oasis/Freedom/Icon). Suspect hallucination but flag for verification against official RCL Anthem page.
- **Suite Lounge** — confirmed generically; exact name needs deck-plan check

### Confirmed on Anthem (keep as-is)
Main Dining Room (+ 4 themed MDRs: The Grande, Chic, Silk, American Icon Grill), Windjammer Marketplace, Café Promenade, Sorrento's, Solarium Bistro, Café @ Two70, Izumi Sushi & Hibachi, Chops Grille, Jamie's Italian, Wonderland, Chef's Table, Coastal Kitchen (suites-only), Johnny Rockets, Bionic Bar, Schooner Bar, Boleros, Vintages, Pool Bar, Solarium Bar, Sky Bar, RipCord by iFly, FlowRider, North Star, SeaPlex, Two70 (Vistarama + RoboScreens), Royal Esplanade, Royal Theater, Music Hall, Casino Royale.

### Confirmed NOT on Anthem (do not invent)
- Cirque du Soleil (RCL has never had this — that was MSC)
- Waterslides (Perfect Storm is Oasis class / Royal Amplified)
- Ultimate Abyss (Oasis only)
- AquaTheater (Oasis only — Anthem's aft venue is Two70)
- Boardwalk / Central Park neighborhoods (Oasis only — Anthem has Royal Esplanade)
- Ice-skating rink (Voyager/Freedom/Oasis only — Anthem has SeaPlex instead)

## Structural / Protocol Issues

1. **ICP-Lite v1.4 → ICP-2** upgrade (same as Virgin fleet fix)
2. **`ai-breadcrumbs` HTML comment** still present at top of file — ICP-2 v2.1 says remove (no crawler reads HTML comments)
3. **No "Who She's For" personality section** (`id="who-shes-for"`)
4. **FAQ HTML + JSON-LD is generic**:
   - "Dining options" answer lists **Jamie's Italian** + "Teppanyaki" + **Bionic Bar** (but Bionic Bar is a BAR, not a dining venue) + "Wonderland"
   - "Where does Anthem sail" answer: generic "European and Caribbean itineraries" — completely stale, she's in Australia right now
   - Missing questions about godmother (Emma Wilby), maiden voyage history, Alaska 2026
5. **Review JSON-LD has no hard facts** — no delivery date, no builder, no yard, no godmother
6. **page.json is minimal**: no sources, no discrepancies_flagged, no history, no godmother, no keel_laid, no delivery date, no maiden_voyage
7. **Length discrepancy between files**:
   - `page.json`: "1,141 ft (348 m)"
   - HTML noscript stats: "1,142 ft (348 m)" (different again!)
   - HTML whimsical-units: "1,142 ft long" / "136 ft wide"
   - **Correct**: 1,139 ft / 347.1 m per Meyer Werft
8. **Neighborhoods section** claims "Solarium" as a neighborhood — Solarium is an adults-only indoor pool area on RCL ships, not a "neighborhood" in the Oasis-class sense. Should be removed or re-framed.
9. **Right-rail has a placeholder intro block**: "Anthem of the Seas is a Royal Caribbean ship. This page covers deck plans, live ship tracking, dining venues, and videos to help you plan your cruise." — generic filler text that duplicates the main column intro

## Fleet-wide RCL JS bug (NOT Anthem-specific)

**42 of 51 RCL ship pages** have a JavaScript snippet (`fixDiningJSON`) that overrides the
`#dining-data-source` config at runtime, redirecting from `/assets/data/venues-v2.json` to
legacy `/assets/data/venues.json`. The two files are NOT in sync:

- `venues.json` ships: 75 | Anthem venues: **11**
- `venues-v2.json` ships: 57 | Anthem venues: **45**

At runtime, every affected page silently reads from the stale `venues.json`. This is likely a
pre-migration path that was never cleaned up. Fixing this requires either:
- (a) Removing the `fixDiningJSON` script from all 42 pages (quickest)
- (b) Bringing `venues.json` back in sync with `venues-v2.json` (a migration step)
- (c) Removing `venues.json` entirely after confirming nothing else reads it

## Deeper Pass — Additional Findings

### JavaScript-level bugs discovered

**Bug A — Stats loader fetches dead paths (45 RCL pages)**
The inline stats loader (lines 1105-1148) fetches:
```
SOURCES = [
  abs('/assets/data/ships/anthem-of-the-seas.json'),         ❌ does not exist
  abs('/ships/rcl/assets/anthem-of-the-seas.json')           ❌ does not exist
]
```
The **actual** file is `/assets/data/ships/rcl/anthem-of-the-seas.page.json` — neither SOURCE
path matches. Ship stats at runtime come **only** from the inline `ship-stats-fallback` JSON
block; the `.page.json` file is **dead data**, never fetched. Confirmed 45 of 51 RCL pages
have this same wrong SOURCES array.

**Bug B — Live tracker iframe hardcodes wrong lat/lon (line 1209)**
```
iframe.src = 'https://www.vesselfinder.com/aismap?imo=' + imo + '&lat=40.0&lon=-70.0&zoom=5&track=true&names=true';
```
`lat=40.0&lon=-70.0` is NW Atlantic / Cape Liberty NJ area. **Anthem is in Sydney, Australia
right now** — the map opens centered on the wrong hemisphere. The VesselFinder iframe will
still find the ship once loaded, but initial render is wrong.

Audit of the whole RCL fleet shows each ship has a per-ship hardcoded lat/lon (29 unique
values across 29+ ships). Most are correct for the ship's traditional deployment but become
stale when ships reposition. Anthem's `40.0/-70.0` is stale for her 2025-26 Australian season.

**Bug C — LCP preload targets wrong images (lines 306-307)**
```
<link rel="preload" as="image" href="/assets/logo_wake_560.png" fetchpriority="high"/>
<link rel="preload" as="image" href="/assets/compass_rose.svg?v=3.010.400" fetchpriority="high"/>
```
The page preloads the brand logo and compass rose, but the **actual LCP element** is the
first hero image (`anthem-of-the-seas-exterior.jpg` on line 500) which uses `loading="lazy"`.
Result: the wrong images are eagerly loaded, and the real hero is lazy-loaded. Core Web
Vitals performance hit.

**Bug D — Fleet-wide dining data-source JS override (42 RCL pages)**
A `fixDiningJSON` script overrides the `#dining-data-source` config at runtime, redirecting
from `/assets/data/venues-v2.json` to legacy `/assets/data/venues.json`. The two files are
NOT in sync:
- `venues.json`: 75 ships | Anthem has **11** venues
- `venues-v2.json`: 57 ships | Anthem has **45** venues

At runtime, 42 RCL pages silently read from the stale `venues.json`. Likely a pre-migration
path that was never cleaned up.

**Bug E — Origin normalizer selector duplication (line 267-276)**
Each selector is listed twice in the array passed to `querySelectorAll`:
```javascript
const sel=[
  'a[href^="https://cruisinginthewake.com/"]',
  'a[href^="https://cruisinginthewake.com/"]',  // duplicate
  'img[src^="..."]',
  'img[src^="..."]',                             // duplicate
  ...
]
```
Not a functional bug (deduped by the DOM) but sloppy.

---

### 🚨 CONTENT INTEGRITY — SITE-WIDE (most serious finding)

**The Logbook persona testimonials are allowed by the standard, but the standard's required
disclosure is missing from 99% of them.**

The logbook standard is at `new-standards/v3.010/LOGBOOK_ENTRY_STANDARD_v3.010.md`.

**Section 2 — Required Disclosure (Always First)** defines three opening disclosures that
every entry MUST include:
- **Disclosure A** — "Personal Wake Entry" (author personally sailed)
- **Disclosure B** — "Aggregate Soundings" (curated verified guest accounts)
- **Disclosure C** — "Under Watch" (neither firsthand nor vetted aggregate)

> "The disclosure establishes epistemic honesty. No entry proceeds without it. (This is not
> optional and is never rewritten casually.)"

**Section 3.A** requires the first markdown heading of every entry to be `## Full disclosure`,
followed by 6 more named sections in order:
1. `## Full disclosure`
2. `## The Crew and Staff`
3. `## Embarkation & Disembarkation`
4. `## The Real Talk`
5. `## Accessibility on the Seas`
6. `## A Female Crewmate's Perspective`
7. `## Closing Thoughts`

**Section 7** explicitly permits fictional composite personas — so the persona format is not
itself the problem. The problem is compliance.

#### Fleet-wide compliance audit — 1% pass rate

| Cruise line | Files | Stories | With disclosure | With ANY `##` heading |
|---|---|---|---|---|
| RCL | 49 | 425 | **1 (0%)** | **1 (0%)** |
| MSC | 24 | 347 | 0 (0%) | 0 (0%) |
| Virgin Voyages | 4 | 55 | 0 (0%) | 0 (0%) |
| Carnival | 48 | 496 | 0 (0%) | 0 (0%) |
| Celebrity | 29 | 268 | **20 (7%)** | 20 (7%) |
| Norwegian | 20 | 314 | 0 (0%) | 0 (0%) |
| Princess | 17 | 221 | 0 (0%) | 0 (0%) |
| **Total** | **191** | **2,126** | **21 (1%)** | **21 (1%)** |

Only 2 fleet-wide logbook files are fully standard-compliant:
- `assets/data/logbook/celebrity-cruises/celebrity-constellation.json` — 10 of 10 stories
- `assets/data/logbook/celebrity-cruises/celebrity-infinity.json` — 10 of 10 stories

These are the **gold-standard reference entries**.

In RCL, exactly one compliant story exists across 425 entries:
- `assets/data/logbook/rcl/legend-of-the-seas.json` story 6: "Three Generations on Deck: A Family Cruise that Ac..."

**Anthem's 10 stories have zero `##` headings each.** The full 2,239-char Two70 story opens:

> "I'm not easily impressed by cruise ship tech. Robot bartenders? Gimmick..."

— straight into first-person narrative, no disclosure at all, no structural spine.

#### What the Celebrity Constellation compliant entry looks like (for reference)

> `## Full disclosure`
> I have not yet sailed Celebrity Constellation. Until I do, this Logbook is an aggregate of
> vetted guest soundings, taken in their own wake, trimmed and edited to our standards.
>
> `## The Crew and Staff`
> Maren's waiter in San Marco — a veteran of 13 years with Celebrity — gave quiet
> recommendations...

That's Disclosure B, followed by the structured spine. This is what every logbook entry is
supposed to look like.

#### Repair scope implication

2,105 stories across 189 files need either:
- A disclosure added and retro-fitted to the 7-section spine, OR
- Acknowledgment that the standard is aspirational and the current state is pre-standard content.

The audit note ends here — this is not a "fix it right now" action without user direction on
scope. But the gap is documented.

---

### Content/deployment stale claims (confirmed by re-read)

**Line 227 (FAQ JSON-LD):** `"Anthem typically sails European and Caribbean itineraries."` — stale. She is in Australia right now.

**Line 477 (Quick Answer):** `"sailing year-round from the New York area"` — stale. She hasn't been at Cape Liberty for the 2025-26 season.

**Line 481 (Best For):** `"Northeast US cruisers... year-round Bermuda, Caribbean, and Canada/New England sailings from Cape Liberty"` — stale.

**Line 812 (HTML FAQ answer):** `"Anthem typically sails European and Caribbean itineraries."` — stale.

Three of four deployment-related strings on the page are wrong. The Quick Answer and Best For
are in the most prominent above-the-fold position.

### Cross-page consistency

**`ships.html`** describes Quantum/Quantum Ultra split correctly on one line but then in a
later content paragraph says `"Quantum-class ships (Odyssey, Anthem, Quantum of the Seas)"`
— which is wrong because Odyssey is Quantum Ultra, not plain Quantum, and also omits Ovation
and Spectrum. Fleet-level content has its own hallucinations.

**Anthem's own sister-ship pill block** lists all 4 sisters (Quantum, Ovation, Spectrum,
Odyssey) under the single label "Quantum Class — Sister Ships." Agent recommendation was to
label as "Quantum Class (2nd of 5; Spectrum & Odyssey are Quantum Ultra sub-class)".

### Other content/HTML issues

- **Right-rail has a placeholder filler block** (lines 853-871): "Anthem of the Seas is a
  Royal Caribbean ship. This page covers deck plans..." — this is generic CMS filler that
  duplicates the main intro and adds no information. Should be removed or replaced.
- **Review JSON-LD (lines 134-158)** has `"author": {"name": "In the Wake Editorial Team"}`
  but the Article JSON-LD (lines 310-338) and Person JSON-LD (lines 160-174) attribute
  authorship to Ken Baker. Inconsistent.
- **"Sky Bar", "Brass & Bock", "Diamond Club", "ripcord"** entries in `venues-v2.json` have
  missing or `?` subcategory fields — data quality issue.
- **Logbook JSON `content_protocol`** is also ICP-Lite v1.4 (not just the HTML).
- **Stats fallback slug `anthem-of-the-seas`** is correct, but the stats-fallback JSON has
  guest count as `"4,180 (double) ~4,905 (max)"` which is inconsistent format with other
  fields — fine for humans, awkward for machines that parse it.
- **First hero image** (line 500): `<img src="..." alt="Anthem of the Seas at sea" loading="lazy"/>`
  — missing width/height/decoding attributes, lazy-loaded (LCP hit), and alt text is generic
  despite this being the LCP image.

## Repair Scope Options

1. **Minimal** — fix just Anthem (HTML + `venues-v2.json` entry + `page.json`) ~40-60 edits
2. **Quantum class audit** — Anthem + 4 sisters (Quantum, Ovation, Spectrum, Odyssey) with per-ship verification agents
3. **Anthem + fleet-wide dining JS bug** — Anthem repair + one-line script removal on 42 RCL pages
4. **Full RCL fleet repair** — matches MSC (24/24) and Virgin (4/4) pattern; ~51 ships, expect contamination on some

## Sources (Primary — from agent)

- Meyer Werft: <https://www.meyerwerft.de/en/ships/anthem_of_the_seas.jsp>
- Meyer Werft delivery: <https://www.meyerwerft.de/en/press/press_detail/anthem_of_the_seas_delivered.jsp>
- Meyer Werft keel laying: <https://www.meyerwerft.de/en/press/press_detail/keel_laying_of_anthem_of_the_seas.jsp>
- Royal Caribbean Press Center (Emma Wilby godmother): <https://www.royalcaribbeanpresscenter.com/press-release/1141/anthem-of-the-seas-godmother-is-27-year-old-british-travel-agent-emma-wilby/>
- Royal Caribbean Blog (christening): <https://www.royalcaribbeanblog.com/2015/04/20/royal-caribbean-christens-anthem-of-the-seas>
- Royal Caribbean Blog (Jamie's Italian menu refresh Aug 2023): <https://www.royalcaribbeanblog.com/2023/08/04/jamie-oliver-announces-new-menu-his-restaurant-royal-caribbean-cruise-ships>
- Royal Caribbean Press Center (Australia 2025-26 season): <https://www.royalcaribbeanpresscenter.com/press-release/1715/a-new-summer-anthem-makes-its-way-to-australia-in-2025-26/>
- Seatrade Cruise (Sydney arrival): <https://www.seatrade-cruise.com/ports-destinations/anthem-of-the-seas-arrives-for-sydney-inaugural-season>
- VesselFinder: <https://www.vesselfinder.com/vessels/details/9656101>
- MarineTraffic: <https://www.marinetraffic.com/en/ais/details/ships/shipid:991737/mmsi:311000274/imo:9656101/vessel:ANTHEM_OF_THE_SEAS>
- Travelpulse (maiden voyage Southampton): <https://www.travelpulse.com/news/cruise/anthem-of-the-seas-christened-in-southampton>
- GCaptain (float out 21 Feb 2015): <https://gcaptain.com/anthem-seas-float-meyer-werft-videos/>
- Cruise Critic Quantum class overview: <https://www.cruisecritic.com/articles/royal-caribbeans-quantum-class-ships>
- Cruise Industry News / Gangwaze / Cruise Deck Plans — venue verifications above

---

## 🚨 GITHUB PAGES + IMAGE CAROUSEL — the deep issue

**Host:** GitHub Pages (CNAME `cruisinginthewake.com`, `.nojekyll` present, no `.gitattributes`
/ no Git LFS). GitHub Pages has documented limits that are directly relevant to how this
carousel is built:

- **Repo size soft warning at 1 GB**, hard failure at 10 GB
- **Individual file warning at 50 MB**, hard block at 100 MB (Git LFS required above that)
- **Pages bandwidth soft limit: 100 GB/month** — throttles / warnings begin near this cap

### Fleet totals

| Directory | Size |
|---|---|
| `assets/ships/` (full fleet) | **1,263 MB (~1.26 GB)** — past GitHub's 1 GB soft warning |
| `assets/ships/rcl/` | 243 MB |

70 individual image files exceed 5 MB. The top 10 worst (all RCL ship exterior heroes):

| Ship | File size | Dimensions |
|---|---|---|
| Serenade of the Seas | **29.8 MB** | 8064 × 5176 (42 MP, drone original) |
| Jewel of the Seas | 21.7 MB | — |
| Vision of the Seas | 21.7 MB | — |
| **Voyager of the Seas** | **20.6 MB** | 7215 × 4107 (and this is **the WRONG SHIP** — Regent Seven Seas Voyager) |
| Allure of the Seas | 17.3 MB | — |
| Oasis of the Seas | 17.0 MB | — |
| Navigator of the Seas | 16.5 MB | — |
| Quantum of the Seas | 11.5 MB | — |
| **Mariner of the Seas** | **11.4 MB** | — (and this is **the WRONG SHIP** — Regent Seven Seas Mariner) |
| Grandeur of the Seas | 8.6 MB | — |

### Anthem's carousel weight per page view

| Slide | Size | Format | Preload? |
|---|---|---|---|
| 1. `anthem-of-the-seas-exterior.jpg` (the LCP image, actually Nassau docked AFT) | **3.02 MB** | JPG | `loading="lazy"` — **wrong, this is the LCP image** |
| 2. Liverpool 2021-6.jpg | 1.84 MB | JPG (3840×2335) | lazy |
| 3. Liverpool 2021-3.jpg | 1.60 MB | JPG | lazy |
| 4. Liverpool 2021-4.jpg | 1.81 MB | JPG | lazy |
| 5. Liverpool 2021-5.jpg | 1.39 MB | JPG | lazy |
| 6. `(cropped).webp` | 0.36 MB | WebP | lazy |
| 7. Nassau 16-9.webp | 0.66 MB | WebP | lazy |
| 8. 0310.webp | 0.60 MB | WebP | lazy |
| **TOTAL** | **11.28 MB** | | |

11.28 MB per page view for hero imagery alone. On GitHub Pages' 100 GB/month bandwidth cap,
**a page like this can be served to ~8,850 visitors/month from the hero image alone** before
the site blows the bandwidth budget. Add the rest of the fleet pages and any blog/article
traffic, and the budget disappears quickly.

### The WebP conversion pipeline exists but wasn't run on these files

The repo has:
- `admin/convert_to_webp.py` — Python + Pillow WebP converter (quality=85)
- `admin/download-ship-images.py` — Docstring explicitly says *"Downloads images from
  Wikimedia Commons, converts to webp, and updates HTML files to use local paths"*

But the `.attr.json` sidecar files show the RCL ship exterior images were downloaded
**2026-01-21** and none of them got converted. All 26 ship-exterior hero images are raw
JPEGs. Every `.attr.json` alongside them records the source Wikimedia URL and CC license,
so the download step worked — the WebP conversion step was either skipped, failed silently,
or bypassed.

For Anthem specifically, the 3 images that ARE WebP (`(cropped)`, `Nassau 16-9`, `0310`)
were converted by an older run of the pipeline. The 4 Liverpool 2021 JPGs and the new
`-exterior.jpg` were added later without going through the converter.

### No responsive image sources

None of the hero images use `<picture>` + `<source type="image/webp">`, and none use
`srcset`/`sizes` for responsive loading. Mobile users on cellular pull the full desktop
resolution images. Every user pays the same 11.28 MB bill.

### No Git LFS

There is no `.gitattributes` file in the repo. All these large image files live in Git
history as normal blobs. Every time any of them is changed, a new full copy is stored in
Git history. Over time this inflates the repo dramatically and makes `git clone` slow.

### The "first slide is lazy-loaded" bug makes this worse

Even with the massive file, a proper LCP element would be `fetchpriority="high"` and
`loading="eager"`. Anthem's first slide is the opposite: lazy, no fetchpriority, no
explicit dimensions (so the browser can't reserve layout space). Core Web Vitals LCP on
this page is going to be terrible on mobile cellular.

Worse: the two `<link rel="preload" as="image">` lines on lines 306-307 preload the brand
logo and compass rose — **completely wrong LCP hints** — so browsers prioritize assets
that aren't the LCP element while the real hero is deferred.

### Why this matters for Anthem specifically

Ken (the site owner) is boarding Anthem in June 2026 from Seattle for Alaska. Someone
planning an Anthem Alaska trip will:
1. Open Anthem's page on mobile while traveling or on Wi-Fi sharing networks
2. Wait several seconds while 11.28 MB of hero imagery loads
3. See a Cape Liberty / Northeast US / Caribbean deployment framing that's wrong
4. Read fabricated first-person testimonials with no disclosure
5. Maybe never reach the actual useful content

Any of the above are individually bad, but the image-weight issue is the one that's:
- **Measurable** (Core Web Vitals, page weight, bandwidth)
- **Specific to GitHub Pages hosting** (the bandwidth cap)
- **Fixable with tools already in the repo** (`convert_to_webp.py`)

---

## Logbook disclosure gap (fleet-wide)

**Standard:** `new-standards/v3.010/LOGBOOK_ENTRY_STANDARD_v3.010.md`, Sections 2 and 3.A.

Every logbook entry is required to open with `## Full disclosure` followed by the 6 other
named sections (Crew and Staff / Embarkation & Disembarkation / The Real Talk / Accessibility
on the Seas / A Female Crewmate's Perspective / Closing Thoughts). Section 7 explicitly
permits fictional composite personas — so the persona format is compliant **as long as**
the disclosure is present.

Compliance audit:

| Line | Files | Stories | With `## Full disclosure` | With ANY `##` heading |
|---|---|---|---|---|
| RCL | 49 | 425 | **1 (0%)** | 1 (0%) |
| MSC | 24 | 347 | 0 (0%) | 0 (0%) |
| Virgin Voyages | 4 | 55 | 0 (0%) | 0 (0%) |
| Carnival | 48 | 496 | 0 (0%) | 0 (0%) |
| Celebrity | 29 | 268 | **20 (7%)** | 20 (7%) |
| Norwegian | 20 | 314 | 0 (0%) | 0 (0%) |
| Princess | 17 | 221 | 0 (0%) | 0 (0%) |
| **Total** | **191** | **2,126** | **21 (1%)** | **21 (1%)** |

Only 2 logbook JSON files in the repo are fully compliant with the standard:
- `assets/data/logbook/celebrity-cruises/celebrity-constellation.json` — 10/10 stories
- `assets/data/logbook/celebrity-cruises/celebrity-infinity.json` — 10/10 stories

Ground-truth reference (first lines of a compliant story from Constellation):

```markdown
## Full disclosure
I have not yet sailed Celebrity Constellation. Until I do, this Logbook is an aggregate
of vetted guest soundings, taken in their own wake, trimmed and edited to our standards.

## The Crew and Staff
Maren's waiter in San Marco — a veteran of 13 years with Celebrity — gave quiet
recommendations that never missed...
```

**Anthem's 10 stories open with raw prose**, no disclosure, no structural spine. The
persona content is allowed by the standard; the missing disclosure violates it. All 2,105
other non-compliant stories across the site need either the disclosure added and retro-fit
to the 7-section spine, or removal.

---

## Flickers of Majesty link — duplicate error across 49 RCL pages

The hero photo credit pill on the Anthem page:

```html
<a class="pill long" href="https://www.flickersofmajesty.com" target="_blank" rel="noopener">
  Photo by Flickers of Majesty — Instagram
</a>
```

The label says "Instagram" but the `href` points to the **website** (`flickersofmajesty.com`).
**49 RCL ship pages share this same wrong label.**

The correct pattern used on Carnival Mardi Gras and a few other ships has **two separate
links** — one to the website, one to Instagram — with both labeled clearly:

```html
<a href="https://www.flickersofmajesty.com">Flickers of Majesty</a>
(<a href="https://www.instagram.com/flickersofmajesty">@flickersofmajesty</a>)
```

Fleet-wide RCL gap: **43 of 51 RCL pages are missing the Instagram link entirely**, and
the 49 that have the (broken) pill label it "Instagram" while linking to the website.

Also: the author card on the Anthem page (lines 902-903) links only to `flickersofmajesty.com`
with no Instagram alternate, while Carnival ships have `"sameAs": ["https://instagram.com/flickersofmajesty"]`
in their Organization JSON-LD. The `Person` schema on Anthem (line 170) lists `flickersofmajesty.com`
as a sole `sameAs` entry — inconsistent cross-fleet structured data.


---

## CORRECTION — the 11.28 MB figure was wrong

Earlier this doc claimed "11.28 MB per page view" for the Anthem hero carousel. That is
wrong. **Every slide image uses `loading="lazy"`**, and subsequent slides are hidden from
the initial viewport. Only the first image (`anthem-of-the-seas-exterior.jpg`, **3.02 MB**)
loads on initial page view. Subsequent slides would only load if the browser decides
they've entered the viewport — and because Swiper navigates via CSS transforms inside an
`overflow: hidden` container, browsers may or may not fire the lazy-load at all. This is a
common Swiper + `loading="lazy"` interaction bug and is the likely reason "the anthem
carousel only loads the first image."

So the true per-page-view cost is about **3 MB of image bandwidth**, not 11 MB. That's
still huge for a hero image, and the downstream problems still hold:
- 3 MB for a single LCP image on GitHub Pages cellular mobile is terrible
- First slide still has `loading="lazy"` (which is an anti-pattern for the LCP element)
- Preload hints on lines 306-307 target the brand logo + compass rose, not the hero image
- 7 of 8 images may never load at all, which means the carousel *appears broken* to anyone
  who clicks next — they see blank slides because lazy-load didn't fire
- Total repo size is still 4.4 GB (2.1 GB `.git` + 2.3 GB working tree)

---

## Repo size + GitHub Pages exposure (NEW, bigger-picture)

Total repo size: **4.4 GB** (per `du -sh .`). Breakdown:
- `.git/` history: **2.1 GB** — bloated from committing large image files
- `assets/`: **1.4 GB**
- `ports/`: 718 MB (port guides)
- `admin/`: 93 MB (internal docs)
- `Reprocessed/`: 40 MB (legacy)
- `ships/`: 31 MB (ship HTML pages)
- `images/`: 23 MB

GitHub repo-size soft warning is at **1 GB**. The working tree alone (2.3 GB) is over that,
and `.git` adds another 2.1 GB.

### `.github/workflows/static.yml` deploys EVERYTHING publicly

```yaml
- name: Upload artifact
  uses: actions/upload-pages-artifact@v3
  with:
    # Upload entire repository
    path: '.'
```

`path: '.'` means the entire working tree gets uploaded and served by GitHub Pages. That
makes these directories publicly accessible on `cruisinginthewake.com`:

- `admin/` — 93 MB of internal docs, including:
  - `admin/ANTHEM_OF_THE_SEAS_AUDIT_2026_04_11.md` (this file!)
  - `admin/GRIEF_STORIES_LOGBOOK_INVENTORY.md`
  - `admin/PROJECT_STATE_2026_02_14.md`
  - `admin/CAREFUL_AUDIT_2026_03_27.md`
  - Standards rebuild docs, competitor audits, unfinished tasks lists, etc.
- `Reprocessed/` — 40 MB legacy content
- Any other top-level directory not explicitly filtered

`.md` files don't get rendered by GitHub Pages when `.nojekyll` is present — they're served
as `text/plain` or similar. But they're still readable by anyone who guesses the URL,
including search engines that crawl them.

**Information disclosure**: my audit doc, which names the logbook persona fabrications and
calls specific content "hallucinations" and "license violations," is publicly accessible at
`https://cruisinginthewake.com/admin/ANTHEM_OF_THE_SEAS_AUDIT_2026_04_11.md` as soon as the
next static.yml deploy runs. That's the opposite of what an internal audit doc should be.

### Mitigation options
1. Move `admin/` out of the published path (exclude in static.yml)
2. Or move internal docs to a separate private repo
3. Or add a robots.txt disallow (doesn't hide from direct access, just from indexing)
4. Preferred: update static.yml to use an artifact upload that explicitly lists what should
   be public, excluding admin/, Reprocessed/, and other non-public dirs

---

## Swiper vendor path 404 (fleet-wide)

Lines 295-300 of `anthem-of-the-seas.html` set up a Swiper loader with a primary path and a
jsdelivr fallback:

```javascript
const primaryCSS="https://cruisinginthewake.com/vendor/swiper/swiper-bundle.min.css";
const primaryJS ="https://cruisinginthewake.com/vendor/swiper/swiper-bundle.min.js";
const cdnCSS    ="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css";
const cdnJS     ="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js";
addCSS(primaryCSS);
addJS(primaryJS, ok, function(){ addCSS(cdnCSS); addJS(cdnJS, ok); });
```

**There is no `vendor/swiper/` directory anywhere in the repo** (`find . -iname "swiper*"`
returns nothing). So:
1. `primaryCSS` `<link>` 404s silently
2. `primaryJS` 404s → fallback runs → loads `cdnCSS` + `cdnJS` from jsdelivr
3. Every Anthem page load wastes 2 round-trip requests before the fallback kicks in
4. Load order race: `cdnCSS` and `cdnJS` are both added together, but `window.__swiperReady`
   fires on `cdnJS.onload` regardless of whether the CSS has finished loading
5. Swiper init can run before the Swiper CSS is applied → slides may not be positioned
   correctly on first paint

The Swiper library was clearly *supposed* to be self-hosted under `/vendor/swiper/` but
someone removed (or never added) the actual files. 45+ ship pages are using the jsdelivr
fallback on every load.

---

## Still-open questions

None of the above is definitively "the issue" the user noticed. Candidates so far:

1. **Dangling attribution + missing Kiran891 credit + missing Liverpool 2021 credits** —
   license-compliance issue visible to any careful reader.
2. **Flickers of Majesty pill label says "Instagram" but links to website**, and Instagram
   link is missing entirely (43 RCL pages without Instagram link).
3. **`loading="lazy"` on the LCP element** + carousel slides 2-8 may never load, so anyone
   trying to see photos 2-8 gets blank slides.
4. **Swiper vendor path 404** on every load.
5. **assets/ships/ is 1.26 GB + repo total is 4.4 GB** — over GitHub's 1 GB soft warning,
   eats bandwidth.
6. **admin/ internal docs publicly exposed** via static.yml `path: '.'`.
7. **3.02 MB LCP image** with wrong preload hints and lazy loading.
8. **Stale deployment narrative** ("year-round New York Cape Liberty") while she's in Sydney.
9. **Fabricated logbook personas without the standard's required disclosure** (1% fleet-wide
   compliance).
10. **Stats loader SOURCES paths don't exist** — page.json is dead data at runtime (45 RCL
    pages affected).
11. **Live tracker iframe hardcoded to NW Atlantic lat/lon** (stale for her Sydney and
    Alaska 2026 seasons).
12. **2 ships have wrong-ship hero images** (Seven Seas Mariner → Mariner of the Seas;
    Seven Seas Voyager → Voyager of the Seas — different brand, 3x size difference).
13. **ICP-Lite v1.4 protocol** instead of ICP-2.
14. **ai-breadcrumbs HTML comment** still present.
15. **"Dynamic Dining" in Review JSON-LD** — stale 2015 Quantum marketing, abandoned ~2017.
16. **Review JSON-LD author** says "In the Wake Editorial Team" while everything else says
    Ken Baker.
17. **4 venue hallucinations** (Giovanni's Table, Brass & Bock, Café Latte-tudes, Champagne
    Bar) and 1 rename needed (Diamond Club → Diamond Lounge).
18. **Length off by 2 ft** (1,141 or 1,142 ft on HTML vs 1,139 ft per Meyer Werft).
19. **Right-rail placeholder filler block** duplicating the main column with generic copy.


---

## DEEPER DIVE — Service worker & PWA integration gap (the root cause of "only first image loads")

**User's confirmed symptom**: "ONLY the first image in the carousel loads, not the rest of them."
**User's next hint**: "AND the service worker isn't warming those images up i'm sure either."

Full trace of why the carousel appears broken:

### The mechanism for warming images EXISTS in the repo but is never wired up

`assets/js/sw-bridge.js` has a `scanAndSeed()` function (lines 186-261) that:

1. Walks the DOM for `img[src]`, `source[srcset]`, and `[style*="background-image"]`
2. Collects all same-origin WebP/JPG/PNG URLs
3. Posts `{type: 'SEED_URLS', urls: imageUrls, priority: 'low'}` to the active service worker
4. The SW's message handler then fetches those URLs in the background and stores them in `CACHES.IMAGES`

Comment at lines 179-184:

> *"After each page load, scan for same-origin links and key images, then send them to the SW
> for background caching. This means every page the user visits progressively caches linked
> pages — ports link ships, ships link tools, tools link ports. By the time a cruiser boards,
> most of the site is available offline."*

The intent is clear: **every page is supposed to proactively warm its own images into the SW
cache**. But:

| Script | Loaded by | Purpose |
|---|---|---|
| `sw-bridge.js` | **0 HTML files** | scanAndSeed images on every page load |
| `site-cache.js` | 12 aggregator pages (ships.html, cruise-lines/*, tools/*) | network-aware hover prefetch for links |

**Zero ship pages** load either. The SW is registered on every ship page (`sw.js`), but nothing
coordinates with it. The carousel's 7 hidden slides (2 through 8) are never seeded, never
requested, never cached, and — because their `loading="lazy"` attribute plus Swiper's CSS-
transform navigation inside `overflow: hidden` — they may never fire browser lazy-load either.

Result: the user sees a carousel that visually only ever shows slide 1. Clicking next arrows
either reveals blank slides or broken image icons.

### `isShipImage()` regex bug — 837 ship images fall through to the wrong strategy

`sw.js` line 977:

```javascript
function isShipImage(url) {
  return /^\/ships\/.*\.(avif|webp|jpg|jpeg|png)(\?.*)?$/i.test(url.pathname);
}
```

The regex requires the path to start with `/ships/`. But **every single Anthem carousel image
— and every ship image site-wide — lives at `/assets/ships/...`**, not `/ships/...`. The
regex returns `False` for all of them:

```
False  /assets/ships/rcl/anthem-of-the-seas-exterior.jpg
False  /assets/ships/Anthem_of_the_Seas_(cropped).webp
False  /assets/ships/Anthem_of_the_Seas_(ship,_2015)_at_Liverpool_2021-6.jpg
```

Counts: 383 `.jpg` + 454 `.webp` = **837 ship images in `/assets/ships/`** that the SW
mis-identifies. The fetch handler lines 148-155:

```javascript
if (destination === 'image' || isImageURL(url)) {
  if (isShipImage(url)) {
    event.respondWith(cacheFirstStrategy(request, CACHES.IMAGES, CONFIG.maxImages));
  } else {
    event.respondWith(staleWhileRevalidate(request, CACHES.IMAGES, CONFIG.maxImages));
  }
}
```

So every ship carousel image that DOES get fetched goes to `staleWhileRevalidate` — which
**always hits the network first**, revalidating in background. That's the wrong strategy for
ship images which "rarely change" (per comment on line 149). Ship images should be `cache-
first` so repeat visits don't re-download.

### Precache manifest has 3 images — none of them ship images

`precache-manifest.json` is fetched by the SW on `install` and warms `CACHES.PRECACHE`:

```json
"images": [
  {"url": "/assets/index_hero.jpg", "priority": "high"},
  {"url": "/authors/img/ken1.jpg", "priority": "normal"},
  {"url": "/authors/img/tina3.webp", "priority": "normal"}
]
```

Three. Site-wide. None of them are ship carousel images. No ship-specific precache strategy
exists. The SW `maxImages: 600` — there's room for 597 more in the cache, completely unused.

### Swiper vendor path 404 (again, in this context)

Adding this to the SW chain: the Anthem page loads Swiper from
`https://cruisinginthewake.com/vendor/swiper/swiper-bundle.min.{css,js}` — which 404s because
`vendor/swiper/` does not exist in the repo. The fallback loads from jsdelivr. When the
fallback JS succeeds, `window.__swiperReady = true` fires immediately, but the fallback CSS
is loaded via a separate `<link>` injection and has no load-event coordination. Result: a
race where Swiper may initialize before its CSS is applied, causing slides to mis-position on
first paint.

### Full chain of failures that produce "only first image loads"

1. Page loads, HTML parses, 8 `<img>` elements are in DOM
2. Slide 1 is above-the-fold, `loading="lazy"` allows initial load → **slide 1 fetches**
3. Slides 2-8 are in `.swiper-slide` divs inside `.swiper-wrapper` — all off-screen
4. Swiper tries to init, but its CSS may be racing the fallback `<link>` insertion
5. Even if Swiper inits cleanly, slides 2-8 are translated via CSS `transform` — their
   bounding boxes are outside the container's `overflow: hidden` viewport
6. Native `loading="lazy"` IntersectionObserver: slides 2-8 are not "in viewport" → defer
7. User clicks next arrow — Swiper animates a transform → slide 2's bounding rect enters
   viewport → IntersectionObserver may or may not fire (depending on Chrome version and
   animation timing)
8. **No page-side script is sending SEED_URLS to the SW** (sw-bridge.js not loaded)
9. Service worker has zero ship images in precache
10. `isShipImage()` returns false for the image path, so even if it WAS fetched, it'd use the
    wrong cache strategy
11. The user sees an empty slide 2. They may conclude the carousel is broken.

**All 5 failure layers combine** to produce exactly the observed symptom.

### The fix is a handful of small edits

1. **Remove `loading="lazy"`** from the first slide image (LCP should be eager)
2. **Remove `loading="lazy"`** from slides 2-8 OR wire up Swiper's native `lazyLoading`
   option with `loadOnTransitionStart: true`
3. **Load `sw-bridge.js`** on ship pages — add `<script src="/assets/js/sw-bridge.js" defer>`
4. **Fix `isShipImage()` in sw.js** to match `/assets/ships/...` in addition to `/ships/...`
5. **Fix the `<link rel="preload">` hints** (lines 306-307) to preload the first hero image
   with `fetchpriority="high"`, not the brand logo and compass rose
6. **Populate precache-manifest.json** with a per-line ship image list, or have
   `download-ship-images.py` write the list as a build step
7. **Also consider**: sv-hosted Swiper at `/vendor/swiper/` OR remove the dead primary URL and
   use jsdelivr as the primary

---

## DEEPER DIVE — SEO / indexing issues on the image carousel

`robots.txt` line-by-line shows these disallows:
- `Disallow: /assets/`

**That blocks every image in the repo from Google Image search indexing.** For a travel
planning site, image search traffic ("Anthem of the Seas photo", "Quantum class cruise ship
North Star") is a major organic source. Blocking `/assets/` globally kills that traffic at
the source.

`sitemap.xml` has:
- 1,227 `<url>` entries (HTML pages only)
- **Zero `<image:image>` entries** (no image sitemap extension)

Anthem's entry:
```xml
<loc>https://cruisinginthewake.com/ships/rcl/anthem-of-the-seas.html</loc>
<lastmod>2026-01-31</lastmod>
```

Sitemap `<lastmod>` is **2026-01-31**, but the page's HTML `<meta name="last-reviewed">` is
**2026-02-14**. Sitemap is ~2 weeks stale vs page, and both are ~2 months stale vs today
(2026-04-11).

**Image SEO gap**: even if `/assets/` were allowed, there's no image sitemap extension
pointing at the carousel images. Google has no signal that `anthem-of-the-seas-exterior.jpg`
is worth indexing. Combined with `loading="lazy"` on the LCP image, Google's crawler may not
see any of the ship images.

---

## DEEPER DIVE — content issues I found skimming the carousel section one more time

- **The first slide bypasses the `<figure>` wrapper** that slides 2-5 use, so it has no
  `<figcaption>` — it's the only slide without a caption. Visual inconsistency.
- **Slides 6-8 also bypass `<figure>`** for the same inconsistency.
- **Slide 1 `<img>` is missing `decoding="async"`** (all others have it).
- **Slide 1 `<img>` is missing `width`/`height`** attributes — causes CLS because the
  browser can't reserve layout space.
- **Slide 3's alt text "Bow view at Liverpool"** and slide 4's alt text "View from the bow
  at Liverpool" describe the same angle twice. Either one is wrong or they're the same.
- **Slides 2-5 figcaptions** say *"Photo served locally (attribution in page footer)"* but
  the page footer attribution section does NOT list any of the Liverpool 2021 files.
  The figcaption text is a lie — readers following it to the attribution section find
  nothing, which is both a UX bug AND a CC BY-SA 4.0 license compliance gap.
- **Slide 1 and Slides 7's files are the same ship event** — both are March 14, 2024 Nassau
  docked photos from different Wikimedia contributors (Kiran891 AFT + Acabashi 16-9). Having
  two photos from the exact same moment in the same carousel is redundant.


---

## DEEPER DIVE — Batch 2 findings

### PWA icon chain: 3 of 4 icon references are broken

Line 243: `<link rel="icon" sizes="32x32" href="/assets/icons/in_the_wake_icon_32x32.png"/>` ✓ exists
Line 244: `<link rel="apple-touch-icon" sizes="180x180" href="/assets/icons/apple-touch-icon.png"/>` **✗ file doesn't exist** (correct file would be `in_the_wake_icon_180x180.png`)
Line 245: `<link rel="manifest" href="/manifest.webmanifest"/>` → manifest references:
- `/assets/icons/icon-192.png?v=14.2.0` **✗ file doesn't exist**
- `/assets/icons/icon-512-maskable.png?v=14.2.0` **✗ file doesn't exist**

What DOES exist in `assets/icons/`: `in_the_wake_icon_{16,24,32,48,64,72,96,128,152,180,192,256,512}x{…}.png` plus `.webp`. The filenames don't match any manifest reference.

**120 HTML files** reference the missing `/assets/icons/apple-touch-icon.png`. iOS home-screen
installs of any of those pages get iOS's default icon, not the In the Wake logo.

PWA installability:
- Android adaptive icons need a maskable variant — **no maskable icon exists anywhere in the repo**
- The `/manifest.webmanifest` lists "maskable" as a purpose on icon-512-maskable.png, but that file doesn't exist
- Chrome's Lighthouse PWA audit will flag this as "Does not have a maskable icon"

`manifest.json` and `manifest.webmanifest` are TWO different files for TWO different PWAs:
- `manifest.json` claims the app is "Stateroom Sanity Check" with `start_url: /stateroom-check.html`
- `manifest.webmanifest` claims it's "In the Wake — Cruise Planning & Port Guides" with `start_url: /`

Anthem's HTML loads `manifest.webmanifest`. The `manifest.json` is orphaned/shadow — only the stateroom-check page should reference it.

### Review JSON-LD `image` field references a non-existent file (fleet-wide pattern)

Line 155 on Anthem:
```json
"image": "https://cruisinginthewake.com/assets/ships/anthem-of-the-seas1.jpeg"
```

`anthem-of-the-seas1.jpeg` does not exist. Counterpart files `.jpeg` with numeric suffix
don't exist in `assets/ships/` at all. This is a templated pattern from older page generation
that was never replaced with real file paths.

Fleet-wide: **36 RCL ship pages have broken JSON-LD Review `image` references** with the
`<slug>1.jpeg` pattern. Radiance of the Seas has 2 additional broken refs (`<slug>2.jpg`,
`<slug>3.jpg`). Search engines crawling structured data see these as broken-image signals,
potentially disqualifying the pages from rich snippets.

Ships affected include:
- adventure, allure, anthem, explorer, freedom, harmony, icon, independence, icon-class-tbn,
  legend, liberty, mariner, monarch, navigator, nordic-empress, oasis, odyssey, ovation,
  quantum, quantum-ultra-tbn, radiance (×3), song-of-norway, sovereign, spectrum, splendour,
  star-class-tbn, star, symphony, utopia, voyager, wonder

### Generic deck-plan preview on 188 ship pages

Line 774 uses `/assets/ship-map.png` (a generic 830×363 PNG) with alt text
`"Anthem of the Seas simplified deck plan preview"`. The same generic image is reused on
**188 ship pages** fleet-wide, each time with alt text claiming it's the specific ship's
deck plan preview. It isn't. The alt text lies on every page.

Actual deck plan images exist for only 2 ships (`Caribbean_Princess_deck.jpg`,
`Star_Princess_deck.jpg`). Every other ship falls back to the generic placeholder.

### Heading hierarchy has an H1→H3 skip

Line 461: `<h1 class="page-title">Anthem of the Seas — ...` (H1)
Line 467: `<h3 ...>Key Facts</h3>` (inside intro fact-block) — **skips H2**

Screen readers announcing this hierarchy will say: "Heading level 1, Anthem of the Seas…
Heading level 3, Key Facts" — leaving listeners wondering what the implicit H2 was. WCAG
2.1 SC 1.3.1 (Info and Relationships) failure for heading-level skipping.

Separately, the page has **3 different "Key Facts" headings**:
- Line 467 in main intro fact-block
- Line 543 as `<h3 id="statsHeading">` before the stats grid
- Line 864 in the right-rail callout

All three have the label "Key Facts" (or "Key Facts About Anthem of the Seas"). Screen
reader navigation by heading will hit three near-identical "Key Facts" entries.

### Version string inconsistency across asset loads

- Line 255: `styles.css?v=3.010.400`
- Line 256: `ship-page.css?v=3.010.300`
- Line 307: `compass_rose.svg?v=3.010.400`
- Line 895: `ken1.webp?v=3.010.400`
- SW: `VERSION = '14.2.0'`
- Manifest: icons versioned `?v=14.2.0`

Two different cache-busting schemes side by side. `ship-page.css` is pinned to an older
`.300` version while `styles.css` is on `.400` — if those files have any conflicting rules,
browsers cache them independently and users can get a mismatched-rule render.

### Apple-touch-icon missing on 120 HTML files

`<link rel="apple-touch-icon" sizes="180x180" href="/assets/icons/apple-touch-icon.png"/>`
appears on 120 HTML files site-wide. On all 120, the referenced file doesn't exist.

### Everything assembled: "why does only the first image load" has a 9-step explanation

1. `loading="lazy"` on slide 1 is wrong for LCP but happens to render because it's above-fold
2. Slides 2-8 also `loading="lazy"` — they're off-screen so defer
3. Swiper uses CSS `transform` navigation inside `overflow: hidden`
4. Browser's IntersectionObserver may or may not fire when Swiper shifts slide bounds
5. `sw-bridge.js` (which would scan-and-seed images to the SW) is **not loaded** on any ship page
6. Precache manifest has **0 ship images**
7. `isShipImage()` regex doesn't match `/assets/ships/*` — wrong cache strategy even if fetched
8. Swiper primary vendor path 404s; race with jsdelivr CSS fallback can mis-position slides
9. Native `<link rel="preload">` hints target logo + compass rose, not the actual LCP hero

**This is, end-to-end, the root cause of the user-reported symptom.**

