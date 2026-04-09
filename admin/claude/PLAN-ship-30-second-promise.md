# Ship Pages — 30 Second Promise Plan

**Created:** 2026-03-09
**Purpose:** Bring all 311 ship pages up to the 30-second promise standard
**Status:** PLANNING

---

## The Problem

The 30-second promise says: *A visitor should know within 30 seconds what ship this is, who it's for, and whether to keep reading.*

Currently, most ship pages fail this promise. The structural validator passes them (elements exist), but the **content** is generic template filler that says nothing useful.

### Current State by Cruise Line

| Cruise Line | Pages | Template Answer-Line | Template Content-Text | Has fit-guidance | Has key-facts |
|-------------|-------|---------------------|----------------------|-----------------|---------------|
| **Celebrity** | 30 | **0** (all real) | **0** (all real) | **29** | **29** |
| **Holland America** | 47 | **2** | **2** | **44** | **44** |
| **RCL** | 51 | 30 | **0** (all real) | 7 | 7 |
| **Carnival** | 49 | 36 | 2 | 5 | 21 |
| **Norwegian** | 21 | 20 | 20 | 0 | 0 |
| **MSC** | 25 | 23 | 23 | 1 | 1 |
| **Princess** | 18 | 17 | 17 | 0 | 0 |
| **Costa** | 10 | 9 | 9 | 0 | 0 |
| **Silversea** | 13 | 12 | 12 | 0 | 0 |
| **Oceania** | 9 | 8 | 8 | 0 | 0 |
| **Regent** | 8 | 7 | 7 | 0 | 0 |
| **Seabourn** | 8 | 7 | 7 | 0 | 0 |
| **Explora** | 7 | 6 | 6 | 0 | 0 |
| **Cunard** | 5 | 4 | 4 | 0 | 0 |
| **Virgin** | 5 | 4 | 4 | 0 | 0 |

**Totals:** 185/306 template answer-lines, 121/306 template content-text, only 86 pages have fit-guidance, only 102 have key-facts.

### What "Template" Content Looks Like (fails 30-second promise)

**Answer-line (185 pages):**
> "Looking for Norwegian Bliss planning info? This page covers deck plans, live ship tracking, dining venues, and video tours to help you plan your Norwegian Cruise Line cruise aboard Norwegian Bliss."

This says nothing about the ship. It's identical across every page with only the name swapped.

**Content-text (121 pages):**
> "Norwegian Bliss is a Breakaway Plus vessel from Norwegian Cruise Line. The ship offers a range of dining options, entertainment venues, and stateroom categories to suit different travel styles and budgets. Whether you're a first-time cruiser or a seasoned veteran, exploring the deck plans and venue information on this page will help you make the most of your voyage."

This is marketing-speak that tells the visitor nothing about what makes this ship different.

**FAQ (215 pages):**
> "Is this information official? This page provides community insights and planning resources. Always confirm details with your cruise line or travel advisor before making final decisions."

Generic boilerplate that wastes FAQ schema on non-questions.

### What "Real" Content Looks Like (passes 30-second promise)

**Celebrity Ascent answer-line:**
> "Quick Answer: Celebrity Ascent is the fourth Edge Class ship from Celebrity Cruises, launched in December 2023. This page covers deck plans, live ship tracking, dining venues, and videos to help you plan your cruise."

**Radiance of the Seas content-text:**
> "Radiance of the Seas tends to suit travelers who prefer mid-sized ships with panoramic ocean views and glass-wall design. It's ideal if you want Royal Caribbean's signature service and entertainment without the massive scale of mega-ships. If you're looking for the absolute newest venues, cutting-edge technology, or neighborhood layouts, you may want to explore Quantum, Oasis, or Icon class instead."

---

## The Fix — Three ICP Elements Per Page

Each ship page needs these 3 elements to pass the 30-second promise:

### 1. Answer-Line (replace template)
**From:** "Looking for [Ship] planning info? This page covers deck plans..."
**To:** "Quick Answer: [Ship] is a [Class] ship ([tonnage] GT, [guests] guests) [1 distinctive feature]. [What this page covers]."

The answer-line must include at least ONE differentiating fact — tonnage, guest count, launch year, signature feature, or itinerary region.

### 2. Content-Text / Fit-Guidance (replace template or add new)
**From:** "The ship offers a range of dining options, entertainment venues..."
**To:** "[Ship] tends to suit [persona]. It's ideal for [who benefits]. If you're looking for [alternative], you may want to explore [other ships]."

This is the "who it's for" paragraph. It must help a visitor self-select: *is this ship for me?*

### 3. Key-Facts (add where missing)
Add a `<div class="key-facts">` with 3-4 bullet points:
- **Best For:** [persona description]
- **Ship Class:** [class + tonnage + guest count]
- **Signature Features:** [2-3 unique things about this ship]
- **Sails From:** [home port(s)] or **Itineraries:** [regions]

---

## Data Source Strategy

We can't hand-write 220+ unique ship descriptions, but we CAN build them from data we already have:

1. **ai-breadcrumbs comment block** — Every ship page has `entity`, `ship-class`, `cruise-line`, `answer-first` fields
2. **Ship stats JSON fallback** — Most pages have `id="ship-stats-fallback"` with tonnage, guests, crew, year
3. **fleet_index.json** — `/assets/data/fleet_index.json` has class, tonnage, capacity for every ship
4. **Existing content-text on RCL/Celebrity/HAL** — These are the gold standard; patterns can be adapted

### Approach: Template-to-Specific Pipeline

For each ship, generate the ICP elements using the data already on the page:
- Pull ship class, tonnage, guests, year from stats fallback or fleet_index.json
- Pull `answer-first` from ai-breadcrumbs (already a unique summary per ship)
- Use class-level patterns for "who it's for" (e.g., all Breakaway Plus ships share characteristics)

---

## Execution Plan — Alphabetical by Cruise Line, 5 Pages Per Batch

### Tier 0: Already Done (skip)
- **Celebrity Cruises** (30 pages) — All have real answer-line, fit-guidance, key-facts
- **Holland America** (47 pages) — 45/47 have real content; 2 template pages to fix

### Tier 1: Partially Done (upgrade existing)
- **RCL** (51 pages) — All have real content-text but 30 have template answer-lines; 44 need fit-guidance + key-facts
- **Carnival** (49 pages) — Mixed; 36 template answer-lines, some have key-facts already

### Tier 2: Template-Only (full ICP needed)
- **Norwegian** (21 pages) — 20 template answer-lines, 20 template content-text, 0 fit-guidance/key-facts
- **MSC** (25 pages) — 23 template answer-lines, 23 template content-text
- **Princess** (18 pages) — 17 template everything
- **Costa** (10) — 9 template
- **Silversea** (13) — 12 template
- **Oceania** (9) — 8 template
- **Regent** (8) — 7 template
- **Seabourn** (8) — 7 template
- **Explora** (7) — 6 template
- **Cunard** (5) — 4 template
- **Virgin** (5) — 4 template

### Batch Size

5 pages per batch. Each batch:
1. Read each page's ai-breadcrumbs + stats data
2. Write real answer-line, fit-guidance/content-text, key-facts
3. Spot-check 2 pages
4. Commit

### Estimated Scope
- ~220 pages need work (excluding Celebrity + most HAL)
- At 5 per batch = 44 batches
- Tier 2 smaller lines (Costa through Virgin) = 65 pages = 13 batches
- This is a multi-session project

---

## Priority Order

1. **Tier 2 small lines** (65 pages) — Fastest wins, worst offenders, no existing content to preserve
2. **Norwegian + MSC + Princess** (64 pages) — Medium-size lines, all template
3. **RCL** (44 pages needing upgrade) — Partial work, real content-text exists
4. **Carnival** (36 pages needing upgrade) — Mixed state, careful work needed
5. **HAL** (2 remaining) — Quick cleanup

---

## Quality Gate

A page passes the 30-second promise when:
- [ ] Answer-line contains at least 1 ship-specific fact (not just "covers deck plans")
- [ ] Content-text or fit-guidance tells the visitor who this ship suits (persona)
- [ ] Key-facts gives 3+ scannable facts (class, tonnage, guests, signature feature)
- [ ] FAQ has at least 1 ship-specific question (not just "Is this information official?")

---

## What NOT To Change

- Existing real content on Celebrity, HAL, and RCL content-text paragraphs
- Logbook entries, FAQ questions that are already ship-specific
- Page structure, section order, JavaScript modules
- ai-breadcrumbs, JSON-LD schemas, meta tags (already good)

---

**Soli Deo Gloria**
