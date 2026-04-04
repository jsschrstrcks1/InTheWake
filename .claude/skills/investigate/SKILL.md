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

### Step 4: Generate the Page

**Ship pages** — follow `new-standards/v3.010/SHIP_PAGE_CHECKLIST_v3.010.md`:
- Reference: `ships/rcl/radiance-of-the-seas.html`
- Create `assets/data/ships/[line]/[slug].page.json`
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

- **Ship pages:** `ship-page-validator` hook fires automatically on Write/Edit — checks SDG invocation, AI-breadcrumbs, ICP-Lite, SEO, JSON-LD, WCAG, images, performance, required sections
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

Never say "search for information about X." Give each model specific queries:

**Ship investigation example:**
```
Perplexity: "Search for [SHIP] gross tonnage, guest capacity, crew count,
             year built, IMO number, registry, last refurbishment.
             Check CruiseMapper and official cruise line fleet page."
You.com:    "Search for [SHIP] dining venues — specialty restaurants,
             complimentary dining, buffet. Check Cruise Critic reviews
             and official cruise line dining page."
Gemini:     "What sister ships does [SHIP] have? What class? When were
             they built? Any notable differences between sisters?"
```

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
