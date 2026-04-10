# HANDOFF — MSC Fleet Repair (Careful, Not Clever)

**Thread:** `claude/explore-repository-NqPak`
**Session date:** 2026-04-10
**Status:** MSC Armonia IN PROGRESS — data verified, fixes partially applied

---

## The Rule

**Careful, not clever.** Verify every data point via the pipeline agent before writing it. Do not rely on training data for ship specs, venue names, IMOs, deployments, or godmothers. Three wrong IMOs have already been caught this session — one of them was a Greek ferry's IMO on an MSC ship.

---

## What Was Done This Session

### RCL fleet — 29/29 active ships at 0 errors, ICP-2 v2.1
Repaired this session: Mariner, Navigator, Oasis, Odyssey, Ovation, Radiance, Rhapsody, Serenade, Spectrum, Star, Symphony, Vision, Voyager. Key catches:
- **Odyssey** had wrong IMO 9863917 → fixed to **9795737**
- **Spectrum** had wrong IMO 9794512 → fixed to **9778856** (and registry Bahamas → Cyprus)
- **Star/Icon** had wrong beam 157 ft (Quantum class figure) → fixed to **213 ft**
- **Navigator** had wrong beam 127 ft → fixed to **161 ft**
- Every ship had copy-paste Vision Class Review text rewritten

### Validator fixes (real, not papering over)
Commit `cf77f6d4d`:
- Copyright check now accepts `&copy;` entity form (MSC template uses entity, RCL uses unicode)
- Venues check now prefers `venues-v2.json` over legacy `venues.json`
- Batch script now produces `id="statsHeading"` (what the validator looks for)

### MSC batch fix — 24 pages, commits `14bc11ae7` and `cf77f6d4d`
Script: `admin/batch-fix-msc.py` (idempotent, safe to re-run)
Applied to all 24 MSC pages: no-js class, ICP-2 upgrade, ai-breadcrumbs removal, skip link fix, main page-grid, Swiper @10 CSS removal, Cordelia image removal, dynamic copyright, Browse All link, whimsical script, H1 subtitle, stats heading with correct ID, video/articles/whimsical/dining noscripts.

### MSC Divina — manually repaired (first pass, commit `9d23c12a4`)
IMO populated (was TBD), GT resolved (139,400), guest count resolved (3,502 double / 4,202 max), crew 1,388, registry Panama, page.json created. **Note:** This was my first MSC repair and I didn't yet know about the hallucinated restaurant names pattern — Divina may need a re-check of its dining section against verified venues.

---

## Current MSC Fleet State (after validator + batch fixes)

| Ship | Errors | Warnings | Status |
|------|--------|----------|--------|
| msc-armonia | 0 | 10 | **IN PROGRESS — halfway through data fixes** |
| msc-bellissima | 0 | 10 | pending |
| msc-divina | 0 | 7 | first-pass done, needs re-verify |
| msc-euribia | 0 | 10 | pending |
| msc-fantasia | 0 | 11 | pending |
| msc-grandiosa | 0 | 10 | pending |
| msc-lirica | 0 | 10 | pending |
| msc-magnifica | 1 | 11 | pending (TBD IMO error) |
| msc-meraviglia | 1 | 11 | pending (TBD IMO error) |
| msc-musica | 0 | 10 | pending |
| msc-opera | 0 | 10 | pending |
| msc-orchestra | 0 | 10 | pending |
| msc-poesia | 0 | 10 | pending |
| msc-preziosa | 0 | 11 | pending |
| msc-seascape | 1 | 10 | pending (TBD IMO error) |
| msc-seashore | 1 | 10 | pending (TBD IMO error) |
| msc-seaside | 1 | 10 | pending (TBD IMO error) |
| msc-seaview | 0 | 10 | pending |
| msc-sinfonia | 0 | 10 | pending |
| msc-splendida | 0 | 11 | pending |
| msc-virtuosa | 0 | 10 | pending |
| msc-world-america | 2 | 13 | pending (structural: attributions outside col-1, duplicate ID) |
| msc-world-asia | 0 | 12 | pending |
| msc-world-europa | 0 | 13 | pending |

**Errors remaining are either:** TBD IMO in stats fallback (need real IMO from agent) or pre-existing structural issues (world-america).

---

## MSC Armonia — Where I Stopped

Data verified by background agent (full report in this handoff appendix):

**Correct values (applied to page):**
- IMO: **9210141** (was 8807105 which is the Greek ferry APOLLON HELLAS!)
- GT: **65,542** (was typo 65,591 in some places, correct 65,542 in others)
- Guests: **1,950 double / 2,679 max** (was mixing 1,954 and 2,679)
- Crew: **721** (correct)
- Length: **274.9 m / 902 ft** (post-2014 Renaissance lengthening from 251.25 m)
- Beam: **32 m / 105 ft** (published) — AIS registered is 28.80 m
- Class: **Lirica Class** (correct)
- Sister ships: **MSC Sinfonia, MSC Lirica, MSC Opera**
- Builder: **Chantiers de l'Atlantique, Saint-Nazaire, France** (NOT Fincantieri — Fincantieri Palermo did the 2014 lengthening only)
- Originally: **MS European Vision** for Festival Cruises, delivered 2001
- Joined MSC: **2004** (Festival bankruptcy acquisition)
- Lengthened: **24m section added Aug-Nov 2014** at Fincantieri Palermo
- Registry: **Panama** (Colón, Panama)
- Deployment: **Eastern Mediterranean from Venice/Brindisi (Summer 2026)** → **South Africa (Durban/Cape Town) Nov 2026 – Apr 2027** (debut season)
- **Godmother: UNCONFIRMED** — do NOT write "Sophia Loren" (she's for MSC new builds; Armonia was acquired). Agent found no primary source.
- MDRs: **Marco Polo** (Deck 5 aft, ~974 seats) and **La Pergola** (Deck 6 aft, suite-exclusive, added in 2014 refit)
- Specialty: **Surf & Turf** (only specialty, no sushi restaurant on Lirica class)
- Buffet: **La Brasserie** (indoor, Deck 11) + **Il Girasole** (alfresco, pizza/pasta/grill)
- Café: **Caffè San Marco**
- Theatre: **Teatro La Fenice**
- Bars: **Bar Del Duomo, The White Lion Pub, The Red Bar (piano), Armonia Lounge, Il Lido Bar, Starlight Disco, Palm Beach Casino**

**Fixes applied so far on msc-armonia.html:**
- [x] meta description (line 29)
- [x] ai-summary (line 30)
- [x] og:description (line 41)
- [x] twitter:description (line 43)
- [x] CruiseShip schema description (line 59)
- [x] Review schema reviewBody — critical, had hallucinated restaurants (line 131)
- [x] WebPage description (line 70, 199)
- [x] fact-block paragraph (line 365)
- [x] Key Facts list (lines 367-375) — added delivered/lengthened notes, fixed IMO, added crew, fixed GT typo, fixed guest count
- [x] Quick Answer block (line 420)
- [x] content-text (line 381)
- [x] Removed duplicate Ship Specifications section
- [x] ship-stats-fallback JSON (line 507) — added length, beam, registry, builder, delivered/lengthened years

**Fixes NOT yet applied:**
- [ ] Ship Statistics stat-items (lines 520-524) — still has GT 65,591 typo, guests "2,679" should be "1,950 (double) / 2,679 (max)", needs length/beam/registry rows, needs **noscript wrapper**
- [ ] `data-imo="8807105"` on live tracker section — **MUST fix to 9210141**
- [ ] Live tracker iframe — currently just external link, needs VesselFinder iframe using correct IMO
- [ ] Dining noscript — needs Marco Polo, La Pergola, La Brasserie, Il Girasole, Surf & Turf, Caffè San Marco, Gelateria Italiana (NOT the hallucinated ones)
- [ ] FAQ rewrite — generic boilerplate currently; needs ship-specific with Marco Polo/La Pergola MDR names, Mediterranean/South Africa deployment, Renaissance lengthening story, sister ships
- [ ] Remove "coming soon" placeholder sections (3 placeholders)
- [ ] Deck Plans CTA button
- [ ] Fleet listing entry in ships.html (msc section)
- [ ] page.json creation at `assets/data/ships/msc/msc-armonia.page.json`
- [ ] Update venues-v2.json to add real Armonia venues (currently has 6, need Marco Polo, La Pergola, Il Girasole, Surf & Turf, Caffè San Marco, Teatro La Fenice, Bar Del Duomo, White Lion Pub, Red Bar, Armonia Lounge, Il Lido Bar, Starlight Disco, Palm Beach Casino)

**NOT committed yet.** The in-progress changes are uncommitted. Run `git status` first — either continue the repair or `git stash` them if starting over.

---

## The Workflow (Repeat for Each MSC Ship)

For each remaining ship, alphabetically:

### 1. Launch agent to verify data (do this FIRST, before reading the page)

```
Agent prompt template:
"I need comprehensive, authoritative data for MSC <SHIP NAME>. Do not rely on
training data — pull everything from live web sources and cite them.

Check these sources in order:
1. MSC Cruises official website (msccruises.com)
2. RC/MSC Press Center if available
3. CruiseDeckPlans (cruisedeckplans.com)
4. CruiseMapper
5. VesselFinder / MarineTraffic (for IMO, registry, current position)
6. Wikipedia as cross-reference

Verify these specific facts:
1. IMO number (critical — I've found wrong IMOs on several ships)
2. Gross tonnage (may have multiple values — original vs post-refit)
3. Guest capacity (double occupancy AND maximum)
4. Crew count
5. Year entered service
6. Ship class (verify — don't assume)
7. Sister ships in that class
8. Builder / shipyard
9. Flag / registry (Panama? Bahamas? Malta?)
10. Length and beam
11. Current homeport / 2025-2026 deployment region and ports
12. Main dining room name(s) — MSC ships often have 2 MDRs with Italian names
13. Key specialty restaurants (list everything)
14. Key bars and lounges
15. Godmother (who christened the ship) — DO NOT ASSUME Sophia Loren, verify
16. Amplification/refit history
17. Any notable current-year news

Format: table with stat, verified value, source URL."
```

Launch with `run_in_background: true` while you read the current page.

### 2. Read the current page line by line

Check for:
- Wrong IMO (verify against agent result)
- Hallucinated restaurant names in Review schema (common pattern!)
- GT/guest count typos
- Wrong builder claim
- Generic/boilerplate FAQ
- Duplicate Ship Specifications + Ship Statistics sections (remove Ship Specifications)
- Placeholder "coming soon" text
- `data-imo="TBD"` or wrong value

### 3. Apply fixes carefully, in this order

1. Meta description, ai-summary, og/twitter descriptions
2. CruiseShip JSON-LD description
3. **Review JSON-LD reviewBody — check for hallucinated restaurant names**
4. WebPage JSON-LD description
5. fact-block paragraph
6. Key Facts list (add Crew, fix IMO, fix GT, fix guests)
7. Quick Answer block
8. content-text (ship-specific prose)
9. Remove duplicate Ship Specifications section
10. Ship Statistics section stats with noscript wrapper
11. `data-imo` attribute on live tracker section (CRITICAL)
12. Dining noscript with verified venues
13. FAQ rewrite with ship-specific content (Marco Polo / class specifics / deployment / sisters / renaissance if applicable)
14. Remove "coming soon" placeholder sections
15. Add Deck Plans CTA button
16. Add entry to fleet listing in ships.html
17. Create page.json at `assets/data/ships/msc/<slug>.page.json`
18. Update venues-v2.json with verified venue list for the ship

### 4. Validate

```bash
bash admin/validate-ship-page.sh ships/msc/<ship>.html 2>&1 | sed 's/\x1b\[[0-9;]*m//g' | tail -10
```

Target: 0 errors, minimal warnings. Remaining warnings should only be per-ship content gaps (deck plans CTA wording, etc.) not data issues.

### 5. Commit per ship

Use descriptive commit message listing what was verified and corrected:
```
Repair MSC <ship>: 0 errors, data verified via pipeline

Critical fixes:
- IMO: <old> to <new> (verified via <source>)
- <other data corrections>

Hallucinated venue names corrected in Review schema:
- Was: <wrong names>
- Is: <verified names>

Standard fixes:
- <list>

https://claude.ai/code/session_018pcWEaJCsNJ2As862ecW8i
```

Then push. Retry push with exponential backoff if proxy is flaky.

---

## Files to Reference

- `admin/validate-ship-page.sh` — updated 2026-04-10 with copyright entity form, venues-v2.json preference, statsHeading ID
- `admin/batch-fix-msc.py` — template-level fixes for the MSC-era template (idempotent)
- `assets/data/venues-v2.json` — venue database (active MSC data)
- `ships/rcl/mariner-of-the-seas.html` — RCL gold standard reference for what a 0-errors page looks like
- `assets/data/ships/rcl/mariner-of-the-seas.page.json` — page.json reference

---

## Absolute Rules

1. **Never write a venue name, IMO, GT, guest count, crew number, builder, registry, homeport, or godmother from training data.** Every single data point must come from an agent verification with cited sources.

2. **Run the agent FIRST, then read the page.** Don't let the page's current (potentially wrong) data anchor your thinking.

3. **Look for hallucinated restaurant names in Review JSON-LD on every MSC page.** This is a documented pattern — Armonia had "La Caravella, L'Ippocampo, Sahara buffet" when the real MDRs are "Marco Polo, La Pergola".

4. **Verify IMOs with extra paranoia.** 3 wrong IMOs found this session — Odyssey, Spectrum, Armonia. One of Armonia's was a Greek ferry. Wrong IMOs break the live tracker silently.

5. **Do not trust validator warnings until you check the validator logic.** Earlier this session I called real issues "false positives" and papered over them. After the user pushed back I actually read the validator code and found the root causes (entity form, wrong venues file, wrong ID). Fix the root, not the symptom.

6. **Careful not clever.** Batch scripts are fine when the pattern is proven, but the first few ships should be done manually to learn the MSC template's quirks.

7. **Commit per ship.** Don't batch multiple ships into one commit — if something goes wrong, per-ship commits make it easy to revert just the broken one.

8. **If the agent says "UNCONFIRMED", write "not verified" on the page.** Do not fill in a likely-but-unverified answer. Armonia's godmother is unknown per primary sources — don't write "Sophia Loren" just because she christens most MSC ships.

---

## Key Discoveries Stored in Cognitive Memory

Domain: `cruising`. Retrieve with:
```bash
python3 /home/user/ken/orchestrator/memory_ops.py recall "MSC hallucination" --domain cruising
python3 /home/user/ken/orchestrator/memory_ops.py recall "wrong IMO" --domain cruising
python3 /home/user/ken/orchestrator/memory_ops.py recall "validator fix" --domain cruising
```

---

*Soli Deo Gloria*
