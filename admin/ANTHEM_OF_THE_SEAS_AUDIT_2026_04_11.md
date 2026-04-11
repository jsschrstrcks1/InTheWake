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

**The Logbook "first-person testimonials" are fabricated persona content.**

`authors.json` has exactly **2 real authors**: Ken Baker and Tina Maulsby.

The logbook JSON files contain 2,000+ first-person "testimonials" from hundreds of fake
cruiser names with fake home towns, attributed as if they were real guest contributions:

| Cruise line | Logbook files | Persona testimonials |
|-------------|---------------|-----|
| RCL | 49 | **425** |
| Carnival | 48 | **496** |
| MSC | 24 | **347** |
| Norwegian | 20 | **314** |
| Celebrity | 29 | **268** |
| Princess | 17 | **221** |
| Virgin Voyages | 4 | **55** |
| **Running total** | **191 files** | **2,126+** |

(Not yet audited: Costa, Holland America, Cunard, Oceania, Regent, Seabourn, Silversea, Explora Journeys)

Each entry has an `author` field like `{"name": "Harold M.", "location": "Cleveland, OH"}`
and a `persona_label` like "Solo Grief Journey". Anthem's logbook alone has 10 persona
testimonials:
1. Albert G. (Boston, MA) — Entertainment Review
2. Ethan E. (Philadelphia, PA) — Family Adventure
3. Ruth S. (London, UK) — Itinerary Deep Dive
4. Harold M. (Cleveland, OH) — **Solo Grief Journey** — opens with "Margaret died eight months before I booked Anthem." This is a fabricated widower story presented as a real testimonial.
5. Patricia K. (Portland, OR) — Solo Traveler's Paradise
6. Jennifer W. (Dallas, TX) — Multigenerational Joy
7. Michael & Sarah T. (Chicago, IL) — Newlywed Adventure
8. Dorothy P. (Sarasota, FL) — Senior's Tech Success
9. Captain James R. (Ret.) (Norfolk, VA) — Veteran's Perspective
10. Amanda L. (Charlotte, NC) — First-Timer's Success

The HTML page renders these as if they were authentic reader contributions. The Anthem
noscript fallback even bylines the Two70 story as "— Albert G., Boston, MA" — no disclosure
that the author is persona-generated.

**Searched for disclaimers** in `terms.html`, `privacy.html`, `about-us.html`, `authors/ken-baker.html`,
and the Anthem page itself. No mention of "persona," "fictional," "composite," "AI-generated,"
or "editorial voice." The site footer claims "No ads. Minimal analytics. Independent of cruise
lines." That independence framing + fabricated-but-unacknowledged first-person memoir is the
kind of thing readers notice and don't forgive.

**This is the single most important finding of this audit.** It dwarfs every other Anthem
issue. It probably was not what the user "noticed" (they would have said so explicitly if
so), but any careful audit has to surface it.

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
