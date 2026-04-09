---
name: investigate
description: "Deep multi-LLM research pipeline that produces validated ship and port pages. 4 phases: reconnaissance → triage → deep research → synthesis → page generation."
version: 1.0.0
triggers:
  - "/investigate"
  - "investigate"
  - "deep research"
---

# Investigate — Research-to-Page Pipeline

> Research thoroughly. Build with evidence. Every fact traceable. Soli Deo Gloria.

## Usage

```
/investigate "Allure of the Seas"
/investigate "St Lucia"
/investigate --parallel --budget 3.00 "Norwegian Prima"
```

**Mode:** `cruising` (auto-detected in this repository)
**Output:** A validated ship page or port page, built from multi-LLM research

---

## How It Works — The Full Chain

### Step 1: Detect Page Type

- Ship name → ship page (`ships/[line]/[slug].html`)
- Port/destination name → port page (`ports/[slug].html`)

### Step 2: Run 4-Phase Investigation

```bash
bash /home/user/ken/orchestrator/bootstrap-env.sh 2>/dev/null
pip3 install -q -r /home/user/ken/orchestrator/requirements.txt 2>/dev/null
cd /home/user/ken/orchestrator && python3 investigate.py cruising "<subject>"
```

| Phase | What Happens |
|-------|-------------|
| **1. RECON** | Fan-out to 5 models (GPT, Gemini, Perplexity, You.com, Grok). Each researches independently — specs, dining, entertainment, reviews, history, logistics. Claude + GPT deliberate. |
| **2. TRIAGE** | Score threads by composite: confidence (40%) + citation density (30%) + multi-model agreement (30%). Drop below threshold. |
| **3. DEEP RESEARCH** | Staged deep dives on top 3 threads. Research models verify → Claude synthesizes → analysts evaluate. |
| **4. SYNTHESIS** | Cross-thread integration. All citations collected. Conflicts flagged. |

**Flags:**
- `--threads N` — max threads for deep research (default: 3)
- `--parallel` — run deep dives concurrently
- `--budget N.NN` — cost ceiling in USD (default: $1.50)
- `--exhaustive` — 10 threads, $5 budget

### Step 3: Read Synthesis

Claude reads `state/investigate.json` — the structured output with all findings, citations, and cross-thread analysis.

### Step 3.5: Existing Page Check (CRITICAL)

**Before generating anything, check if the page already exists.**

```
Does ships/[line]/[slug].html exist?
  → YES: Path B — Merge Mode (enrich existing page)
  → NO:  Path A — New Page (build from reference template)
```

**Path B — Merge Mode (existing page):**

Read the existing page and extract everything that must be preserved:

1. **First Look carousel images** — NEVER drop user-curated photos. Copy every `<div class="swiper-slide">` block verbatim.
2. **Logbook noscript entries** — These are authentic voices from real people. Preserve as-is. New investigation-sourced entries may be ADDED alongside, never replace.
3. **Restaurant/venue links** — Existing internal links to `/restaurants/*.html` are already wired. Preserve them. Only add new ones if the investigation found venues that are both real AND have pages.
4. **Sister ships list** — The existing page may include sisters the investigation didn't surface. Preserve the full list from ai-breadcrumbs siblings, pill links, and FAQ answers.
5. **Class pill ordering** — Curated by the author. Preserve.
6. **Attribution section** — Photo credits are legal obligations. Preserve verbatim.
7. **Image onerror fallback chains** — These are hand-tuned. Preserve.

Then diff investigation findings against existing content:

- **Update** stats, FAQ answers, metadata where investigation found fresher/corrected data
- **Add** new content (e.g., amplification details) that the existing page lacks
- **Flag conflicts** — "Existing says X, investigation found Y" — don't silently overwrite
- **Run `validate-ship-page.sh`** after merge to catch any inconsistencies

**Cross-field consistency rules (the validator checks these, but the merge must set them correctly):**

1. **Guest count must be identical** in: stats fallback JSON, noscript stats, fact-block, key-facts, FAQ answer, JSON-LD FAQ answer, ai-breadcrumbs answer-first. Use the investigation-confirmed number. If the existing page has a different number in even ONE of these locations, it was copy-pasted from another ship — fix all of them.
2. **MDR name** — if the investigation found the ship's named MDR (e.g., "Minstrel Dining Room"), use it in the noscript dining, FAQ answer, JSON-LD FAQ, and anywhere else "main dining room" appears generically.
3. **ai-breadcrumbs `related:` field** — must be present. Standard set: `/ships.html, /cruise-lines/royal-caribbean.html, /ports.html, /drink-calculator.html`
4. **Dining heading** must have an inline "→ Browse All" link to `/restaurants.html` (per Radiance reference)
5. **Deck Plans CTA** — a `btn-deck-plans` link to the official ship page must appear between the Logbook and Video sections
6. **Itinerary/deployment** — FAQ "Where does X sail?" must reflect CURRENT year deployment, not generic "Alaska, Caribbean, Australia" unless all are current

**Path A — New Page (no existing page):**

Build from reference template + investigation output. But still run these pre-generation checks:

### Step 3.6: Pre-Generation Verification

Before writing ANY page (new or merge), verify:

1. **Image existence** — Every `src="/assets/..."` path must resolve to a real file on disk. Run: `ls -la [path]`. No phantom references.
2. **Venue database** — Check `assets/data/venues.json` for the ship slug. If FAQ mentions a venue (150 Central Park, Johnny Rockets, Bionic Bar, etc.) that isn't in the database, flag it as a warning — the dining loader won't render it.
3. **Sister ships completeness** — Cross-reference the investigation's class data against existing ship pages in `/ships/[line]/`. If a sister exists as a page but wasn't in the investigation output, include it anyway.
4. **Skip link consistency** — Skip link `href` must match `<main>` element's `id`.

### Step 4.5: Validate BEFORE Committing (MANDATORY)

**After every edit — before `git add` — run the validator:**
```bash
bash admin/validate-ship-page.sh ships/[line]/[slug].html
```

**Do NOT commit if the validator reports errors.** Fix first, then commit.

This catches:
- Broken carousel HTML (missing `</div>` on slides, orphaned slides outside swiper-wrapper)
- Swiper lazy:true conflicting with native loading="lazy"
- Missing noscript fallbacks (AI crawlers see empty content)
- Wrong skip link targets
- Attributions outside col-1
- Missing images, stale venue references, sister ship mismatches

**The validator is the last gate.** No matter how confident you are in a regex/Python fix, the validator catches what you miss. A broken carousel that looks fine in the Edit tool will render as a wall of overlapping images in a browser.

### Step 4: Generate the Page

**Ship pages** — follow `new-standards/v3.010/SHIP_PAGE_CHECKLIST_v3.010.md`:
- Reference: `ships/rcl/radiance-of-the-seas.html`
- Create/update `assets/data/ships/[line]/[slug].page.json`
- Required sections: Page Intro, First Look, Ship Stats, Sister Ships, Dining Venues, Logbook, Video Highlights, Deck Plans, Live Tracker (needs IMO), FAQ (5+), Attributions
- 7 JSON-LD schemas: Organization, WebSite, BreadcrumbList, Review, Person, WebPage, FAQPage
- AI-breadcrumbs with entity, type, parent, category, cruise-line, ship-class, answer-first

**Port pages** — follow `new-standards/v3.010/PORT_PAGE_STANDARD_v3.010.md`:
- Reference: `ports/nassau.html`
- Update `assets/data/ports/port-registry.json`
- Required sections: Hero, Logbook narrative, Seasonal guides, Excursions, Logistics/Transport, sidebar (Port Snapshot, Key Facts, Nearby Ports, Ships Visiting)
- 3 JSON-LD schemas: BreadcrumbList, WebPage (with Place mainEntity), FAQPage

**Write section-by-section** to prevent timeout (matching person-page anti-timeout pattern). Every fact must be traceable to a citation from the investigation.

### Step 5: Validation

Run `admin/validate-ship-page.sh` after generation. The validator now checks (v3.010.301+):
- **9b:** First Look carousel must have actual images (CRITICAL error if empty)
- **9c:** Sister ships consistency — breadcrumb siblings must match pill links AND FAQ answers
- **9d:** All image src/srcset paths must resolve to real files on disk
- **9e:** Dining venue database — warns if FAQ mentions venues not in venues.json
- **9f:** Skip link target must match main element's ID

Plus all existing checks: SDG invocation, AI-breadcrumbs, ICP-Lite, JSON-LD, WCAG, images, performance, required sections.

- **Port pages:** Manual standards check against PORT_PAGE_STANDARD
- **Voice:** `port-content-voice-hook` injects Like-a-human guide on every Edit/Write
- **Pre-commit:** `voice-audit-hook` reminds to audit voice before committing

---

## Source Hierarchy (Cruise Content)

```
Tier 1: Official cruise line data (fleet pages, press releases, deck plans)
Tier 2: Industry databases (IMO registry, classification societies, CruiseMapper)
Tier 3: Travel review sites (Cruise Critic, cruise blogs, travel magazines)
Tier 4: User-generated content (forums, social media, Reddit)

Rule: Lower-tier never overrides higher-tier without explicit flagging.
Conflicts documented, not silently resolved.
```

## Focused Agent Briefs

Never say "search for information about X." Give each model specific queries.

**The pipeline now injects required queries automatically** via `ship_required_queries` in `cruising.yaml`. Each research model (Perplexity, You.com, Gemini) receives mandatory research tasks covering:

- **Perplexity:** Specs (GT, capacity, IMO, dimensions, class, sisters), dining (every named MDR, specialty, casual, bar), entertainment (named shows, attractions), refurbishment history
- **You.com:** Dining verification (current venues, closed/renamed), staterooms (categories, unique features), itineraries (deployment, home ports), recent passenger reviews
- **Gemini:** Sister ships (every ship in class with differences), dining cross-reference, build history, accessibility features

These are not optional — they fire on every ship investigation to prevent gaps like missing venue names or stale dining data.

**Port investigation example:**
```
Perplexity: "Search for [PORT] cruise terminal: tender or dock? Distance
             to town center? Taxi costs? Recent infrastructure changes?"
You.com:    "Search for [PORT] top excursions, local restaurants near
             the pier, beach access, accessibility for wheelchair users."
```

## Gap Analysis

Before generating, scan for missing data:

**Ship pages:** IMO number, guest capacity, crew count, gross tonnage, year built, registry, class, sister ships, deck count, dining venue count, video sources
**Port pages:** Tender/dock status, distance to town, currency, language, timezone, seasonal info, transport costs, top 3-5 excursions, accessibility notes

Flag gaps explicitly — honest gaps are better than fabricated data.

## Integrations

- `ship-page-validator` — automatic validation on ship page writes
- `port-content-builder` — port page structure and POI schema knowledge
- `icp-2` — AI meta tags and answer engine optimization
- `accessibility-audit` — WCAG 2.1 AA compliance
- `voice-dna` — voice pattern enforcement
- `Like-a-human` — humanization guide (injected by hook)

## Cost

Typical: $1-3 per investigation. Exhaustive mode: $3-5.

---

*Soli Deo Gloria* — Research thoroughly because these pages help real travelers plan real voyages.
