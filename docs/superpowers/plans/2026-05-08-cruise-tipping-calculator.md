# Cruise Tipping Calculator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `tools/cruise-tipping-calculator.html` — a single-page accordion tool that turns a first-time cruiser's booking details (line, cabin, length, party, onboard plans) into a dollar total, a category breakdown, a side-by-side line comparison, and a printable tip-envelope plan — backed by sourced 2026 rate data for all 15 lines we cover, with a voice-aligned companion article at `articles/cruise-tipping-2026.html`.

**Architecture:**
- **Static-first, progressively enhanced.** Pure HTML + CSS + ES modules. No build step. Noscript fallback shows the rate table and the four-step manual formula so the page is useful without JS.
- **Data is split from logic.** Existing `assets/data/brands.json` is the canonical line manifest (already keyed by slug for all 15 lines). New `assets/data/tipping/<slug>.json` files hold per-line tipping data with effective dates and source URLs. The tool fetches both at load.
- **State lives in three places, in priority order:** URL hash (shareable) → localStorage (returning visitor) → defaults (first visit). The hash and storage carry the same shape; the model is a single plain object.
- **Bundled-gratuity lines** (Regent, Silversea, Seabourn, Explora Journeys, Virgin Voyages) carry a `bundled_in_fare: true` flag that locks the daily-charge total to $0 and surfaces a banner; the cash-extras section stays editable so users can plan optional thank-yous.

**Tech Stack:**
- HTML5, CSS3 (Grid + custom properties already used across the site), vanilla ES modules
- JSON for data (already the site convention)
- Playwright via the `webapp-testing` skill (the existing test harness for the site's 9 tools)
- ICP-2 metadata standard (frontmatter, JSON-LD `SoftwareApplication` + `HowTo`)

---

## File Structure

### New files

| Path | Purpose |
|---|---|
| `tools/cruise-tipping-calculator.html` | Tool page. ICP-2 metadata, accordion form, sticky result panel, noscript fallback. ~600 lines including inline structure. |
| `assets/css/tools/cruise-tipping-calculator.css` | Page-scoped styles. Sticky panel, accordion, print stylesheet, compare layout. |
| `assets/js/tools/cruise-tipping-calculator/main.js` | Module entry. Wires data + state + UI on `DOMContentLoaded`. |
| `assets/js/tools/cruise-tipping-calculator/data.js` | Loads `brands.json` + `tipping/<slug>.json`; exposes `getLine(slug)` and `listLines()`. |
| `assets/js/tools/cruise-tipping-calculator/state.js` | Single source of truth. Plain object with `subscribe`/`update` API. Reads URL hash + localStorage at boot. |
| `assets/js/tools/cruise-tipping-calculator/calc.js` | Pure functions: `calcDailyTotal`, `calcOnboardAutoGrats`, `calcCashExtras`, `calcGrandTotal`. Zero DOM access. |
| `assets/js/tools/cruise-tipping-calculator/render.js` | DOM rendering: result panel, breakdown rows, compare column, print summary. |
| `assets/js/tools/cruise-tipping-calculator/persist.js` | localStorage save/restore + URL hash encode/decode + Reset action. |
| `assets/data/tipping/<slug>.json` × 15 | Per-line tipping data (one file per line slug already in `brands.json`). |
| `assets/data/tipping/_schema.json` | JSON Schema for the per-line tipping file. Documents shape and required fields. |
| `articles/cruise-tipping-2026.html` | Companion explainer article. ICP-2 metadata, `Article` schema, hero CTA to the tool. |
| `tests/playwright/cruise-tipping-calculator.spec.js` | Playwright spec covering golden path, compare, bundled-gratuity, share/restore, accessibility hooks. |
| `admin/CRUISE_TIPPING_RESEARCH_2026.md` | Audit-trail document. Each datum (rate, age, percent) gets a row with: line, value, source URL, date verified, verifier note. Lives forever in repo as the citation source for the tool and article. |

### Modified files

| Path | Lines | Change |
|---|---|---|
| `articles.html` | append a new card | Add the cruise-tipping-2026 article to the article index. |
| `first-cruise.html` | append a CTA block in the "Money & Budget" section | Audience match — first-timers land here. |
| `index.html` | the "Featured Tools" section (find by grep) | Add the tipping calculator card. |
| `sitemap.xml` | add 2 `<url>` entries | Tool + article. |
| `llms.txt` | add 2 entries | Tool + article. |
| `assets/data/prefetch_manifest.json` | add the new HTML pages and their data files | So the service worker pre-caches them. |

### Files explicitly NOT touched

- `assets/data/calculator-config.json` — drink-calculator config. Different concern. Tested by other Playwright specs.
- `assets/data/lines/<slug>.json` — drink-package shape (`items`, `sets`, `packages`). Mixing tipping data here would conflate concerns and break the existing drink calculator's expectations.
- `assets/data/brands.json` — already has every field we need. Read-only.

---

## Data Schema: `assets/data/tipping/<slug>.json`

Locked shape. Every per-line file conforms.

```json
{
  "schemaVersion": "1.0",
  "lineId": "carnival",
  "displayName": "Carnival Cruise Line",
  "effectiveDate": "2026-05-08",
  "verifiedAt": "2026-05-08",
  "policyUrls": [
    "https://www.carnival.com/about-carnival/legal-notice/cruise-ticket-contract.aspx"
  ],
  "bundledInFare": false,
  "dailyRates": {
    "standard": { "amount": 17.00, "appliesTo": "interior, oceanview, balcony" },
    "suite":    { "amount": 19.00, "appliesTo": "all suite categories" }
  },
  "childPolicy": {
    "exemptUnderAge": 2,
    "notes": "Carnival exempts guests under age 2 from the daily service charge."
  },
  "autoGratuities": {
    "bar":             { "percent": 18, "appliesTo": "drinks, bar tabs" },
    "spa":             { "percent": 18, "appliesTo": "spa and salon services" },
    "specialtyDining": { "percent": 18, "appliesTo": "specialty restaurant cover charges" },
    "roomService":     { "percent": 18, "appliesTo": "room service orders (where applicable)" }
  },
  "recommendedCashExtras": {
    "stewardThankYou":   { "default": 0,  "perDay": false, "note": "Daily charge already covers stateroom attendant; cash is optional." },
    "headWaiter":        { "default": 25, "perDay": false, "note": "End-of-cruise envelope, optional." },
    "asstWaiter":        { "default": 15, "perDay": false, "note": "End-of-cruise envelope, optional." },
    "butler":            { "default": 0,  "perDay": true,  "note": "Carnival has no butler role." },
    "concierge":         { "default": 0,  "perDay": false, "note": "Carnival has no dedicated concierge in standard cabins." },
    "porterPerBag":      { "default": 2,  "perBag": true,  "note": "Embarkation porter, US dollars." },
    "kidsClubCounselor": { "default": 10, "perDay": false, "note": "Optional, end of cruise." },
    "excursionGuide":    { "default": 5,  "perPerson": true, "note": "Per person, ship-sponsored excursion." },
    "excursionDriver":   { "default": 2,  "perPerson": true, "note": "Per person, on driver-led portions." },
    "casinoDealer":      { "default": 5,  "perVisit": true, "note": "Per session, optional, US dollars." }
  }
}
```

**Bundled-gratuity variant.** For Regent / Silversea / Seabourn / Explora / Virgin:

```json
{
  "schemaVersion": "1.0",
  "lineId": "regent",
  "displayName": "Regent Seven Seas Cruises",
  "effectiveDate": "2026-05-08",
  "verifiedAt": "2026-05-08",
  "policyUrls": ["https://www.rssc.com/..."],
  "bundledInFare": true,
  "bundledNote": "Gratuities are included in your fare on Regent. Crew tipping is at your discretion.",
  "dailyRates": null,
  "childPolicy": null,
  "autoGratuities": null,
  "recommendedCashExtras": {
    "butler":           { "default": 5, "perDay": true, "note": "Optional. Common practice on suite voyages." },
    "stewardThankYou":  { "default": 5, "perDay": true, "note": "Optional thank-you, end of cruise." },
    "porterPerBag":     { "default": 2, "perBag": true, "note": "Embarkation porter, US dollars." }
  }
}
```

---

## Task Decomposition

### Phase A — Data foundation (research-first; nothing ships without sources)

#### Task 1: Create research audit-trail document

**Files:**
- Create: `admin/CRUISE_TIPPING_RESEARCH_2026.md`

- [ ] **Step 1: Write the document skeleton with one row per line and one row per claim**

```markdown
# Cruise Tipping Research — 2026 Source Registry

**Purpose:** Every dollar figure, percent, and exemption age in `assets/data/tipping/*.json` and in `articles/cruise-tipping-2026.html` traces to a row here. No claim ships without a row. Verified by `careful-not-clever` skill conventions.

**Verifier:** [name]
**Verification window:** Each row must be re-verified within 60 days of `verifiedAt` or the tool surfaces a "rates may be stale" banner.

## Per-line daily rates (2026)

| Line | Standard | Suite | Effective | Source URL | Verified | Notes |
|---|---|---|---|---|---|---|
| Carnival | TBD | TBD | TBD | TBD | TBD | |
| Celebrity | TBD | TBD | TBD | TBD | TBD | |
| Costa | TBD | TBD | TBD | TBD | TBD | |
| Cunard | TBD | TBD | TBD | TBD | TBD | |
| Disney (note: not in v1) | — | — | — | — | — | Excluded; not in our 15 |
| Explora Journeys | bundled | bundled | TBD | TBD | TBD | |
| Holland America | TBD | TBD | TBD | TBD | TBD | |
| MSC | TBD | TBD | TBD | TBD | TBD | |
| Norwegian | TBD | TBD | TBD | TBD | TBD | |
| Oceania | TBD | TBD | TBD | TBD | TBD | |
| Princess | TBD | TBD | TBD | TBD | TBD | |
| Regent | bundled | bundled | TBD | TBD | TBD | |
| Royal Caribbean | TBD | TBD | TBD | TBD | TBD | |
| Seabourn | bundled | bundled | TBD | TBD | TBD | |
| Silversea | bundled | bundled | TBD | TBD | TBD | |
| Virgin Voyages | bundled | bundled | TBD | TBD | TBD | |

## Auto-gratuity percentages (bar / spa / specialty / room service)

| Line | Bar % | Spa % | Specialty % | Room service % | Source URL | Verified |
|---|---|---|---|---|---|---|
| (one row per line) | | | | | | |

## Child exemption policies

| Line | Exempt under age | Notes | Source URL | Verified |
|---|---|---|---|---|

## Crew compensation context (for article)

Forbes / Cruzely / EatSleepCruise claims about wages and the share of compensation that flows from gratuities — each requires a primary or trade source before any number appears in the article. The v0 draft's "95% / $600–$1,500" claim does not ship without a verified source.

## Disqualified claims (do not use)

- "currency conversions for international itineraries" — promised in v0 lede, never delivered. Killed.
- "two specialty meals ($80 each plus 18%, or $38)" — math error in v0 ($80 × 2 × 0.18 = $28.80). Walkthrough in the article uses fresh numbers.
```

- [ ] **Step 2: Run a verification pass per line**

Run, for each of the 15 lines:
- Fetch the line's official tipping/gratuity policy page (use `WebFetch`).
- Fetch a corroborating trade source (Cruzely, EatSleepCruise, Cruise Critic) when the official page is ambiguous.
- Fill in the table row with: amount, effective date, both source URLs, today's date as `Verified`, and any nuance in `Notes`.
- If a number cannot be sourced, mark the row `BLOCKED` and note the blocker. Do not invent a number.

- [ ] **Step 3: Commit**

```bash
git add admin/CRUISE_TIPPING_RESEARCH_2026.md
git commit -m "research: 2026 cruise tipping source registry — all 15 lines verified"
```

---

#### Task 2: Author the per-line tipping JSON files

**Files:**
- Create: `assets/data/tipping/_schema.json`
- Create: `assets/data/tipping/carnival.json`
- Create: `assets/data/tipping/celebrity.json`
- Create: `assets/data/tipping/costa.json`
- Create: `assets/data/tipping/cunard.json`
- Create: `assets/data/tipping/explora-journeys.json`
- Create: `assets/data/tipping/holland-america.json`
- Create: `assets/data/tipping/msc.json`
- Create: `assets/data/tipping/norwegian.json`
- Create: `assets/data/tipping/oceania.json`
- Create: `assets/data/tipping/princess.json`
- Create: `assets/data/tipping/regent.json`
- Create: `assets/data/tipping/royal-caribbean.json`
- Create: `assets/data/tipping/seabourn.json`
- Create: `assets/data/tipping/silversea.json`
- Create: `assets/data/tipping/virgin-voyages.json`

- [ ] **Step 1: Write the JSON Schema**

Create `assets/data/tipping/_schema.json` with:

```json
{
  "$schema": "https://json-schema.org/draft-07/schema#",
  "$id": "https://cruisinginthewake.com/assets/data/tipping/_schema.json",
  "title": "Cruise Line Tipping Configuration",
  "type": "object",
  "required": ["schemaVersion", "lineId", "displayName", "effectiveDate", "verifiedAt", "policyUrls", "bundledInFare", "recommendedCashExtras"],
  "properties": {
    "schemaVersion": { "type": "string", "const": "1.0" },
    "lineId":        { "type": "string", "description": "Slug matching brands.json id" },
    "displayName":   { "type": "string" },
    "effectiveDate": { "type": "string", "format": "date" },
    "verifiedAt":    { "type": "string", "format": "date" },
    "policyUrls":    { "type": "array", "items": { "type": "string", "format": "uri" }, "minItems": 1 },
    "bundledInFare": { "type": "boolean" },
    "bundledNote":   { "type": "string" },
    "dailyRates": {
      "oneOf": [
        { "type": "null" },
        {
          "type": "object",
          "required": ["standard", "suite"],
          "properties": {
            "standard": { "$ref": "#/$defs/rate" },
            "suite":    { "$ref": "#/$defs/rate" }
          }
        }
      ]
    },
    "childPolicy": {
      "oneOf": [
        { "type": "null" },
        {
          "type": "object",
          "properties": {
            "exemptUnderAge": { "type": ["number", "null"] },
            "notes":          { "type": "string" }
          }
        }
      ]
    },
    "autoGratuities": {
      "oneOf": [
        { "type": "null" },
        {
          "type": "object",
          "properties": {
            "bar":             { "$ref": "#/$defs/percent" },
            "spa":             { "$ref": "#/$defs/percent" },
            "specialtyDining": { "$ref": "#/$defs/percent" },
            "roomService":     { "$ref": "#/$defs/percent" }
          }
        }
      ]
    },
    "recommendedCashExtras": {
      "type": "object",
      "additionalProperties": {
        "type": "object",
        "required": ["default", "note"],
        "properties": {
          "default":     { "type": "number", "minimum": 0 },
          "perDay":      { "type": "boolean" },
          "perBag":      { "type": "boolean" },
          "perPerson":   { "type": "boolean" },
          "perVisit":    { "type": "boolean" },
          "note":        { "type": "string" }
        }
      }
    }
  },
  "$defs": {
    "rate":    { "type": "object", "required": ["amount", "appliesTo"], "properties": { "amount": { "type": "number" }, "appliesTo": { "type": "string" } } },
    "percent": { "type": "object", "required": ["percent", "appliesTo"], "properties": { "percent": { "type": "number" }, "appliesTo": { "type": "string" } } }
  }
}
```

- [ ] **Step 2: Write each per-line file**

For each of the 15 slugs, populate the file using the verified rows from `admin/CRUISE_TIPPING_RESEARCH_2026.md`. Bundled-gratuity lines (regent, silversea, seabourn, explora-journeys, virgin-voyages) get the bundled variant shape. Standard auto-charge lines use the full shape.

Pattern for a non-bundled line (use this exact shape, fill the values from the research doc):

```json
{
  "schemaVersion": "1.0",
  "lineId": "<slug>",
  "displayName": "<Display Name>",
  "effectiveDate": "<YYYY-MM-DD>",
  "verifiedAt": "2026-05-08",
  "policyUrls": ["<official policy url>"],
  "bundledInFare": false,
  "dailyRates": {
    "standard": { "amount": 0.00, "appliesTo": "<list of cabin types>" },
    "suite":    { "amount": 0.00, "appliesTo": "<list of suite tiers>" }
  },
  "childPolicy": {
    "exemptUnderAge": 0,
    "notes": "<from research doc>"
  },
  "autoGratuities": {
    "bar":             { "percent": 18, "appliesTo": "<from research>" },
    "spa":             { "percent": 18, "appliesTo": "<from research>" },
    "specialtyDining": { "percent": 18, "appliesTo": "<from research>" },
    "roomService":     { "percent": 18, "appliesTo": "<from research>" }
  },
  "recommendedCashExtras": {
    "stewardThankYou":   { "default": 0,  "perDay": false, "note": "<from research>" },
    "headWaiter":        { "default": 0,  "perDay": false, "note": "<from research>" },
    "asstWaiter":        { "default": 0,  "perDay": false, "note": "<from research>" },
    "butler":            { "default": 0,  "perDay": true,  "note": "<from research>" },
    "concierge":         { "default": 0,  "perDay": false, "note": "<from research>" },
    "porterPerBag":      { "default": 2,  "perBag": true,  "note": "Embarkation porter, US dollars." },
    "kidsClubCounselor": { "default": 0,  "perDay": false, "note": "<from research>" },
    "excursionGuide":    { "default": 5,  "perPerson": true, "note": "Per person, ship-sponsored excursion." },
    "excursionDriver":   { "default": 2,  "perPerson": true, "note": "Per person, on driver-led portions." },
    "casinoDealer":      { "default": 5,  "perVisit": true, "note": "Per session, optional, US dollars." }
  }
}
```

- [ ] **Step 3: Validate every file against the schema**

Run:
```bash
cd /home/user/InTheWake
python3 - <<'PY'
import json, glob, sys
try:
    import jsonschema
except ImportError:
    print("jsonschema not installed; install with: python3 -m pip install --user jsonschema", file=sys.stderr); sys.exit(1)
schema = json.load(open("assets/data/tipping/_schema.json"))
errors = 0
for path in sorted(glob.glob("assets/data/tipping/*.json")):
    if path.endswith("_schema.json"): continue
    data = json.load(open(path))
    try:
        jsonschema.validate(data, schema)
        print(f"OK  {path}")
    except jsonschema.ValidationError as e:
        errors += 1
        print(f"FAIL {path}: {e.message}")
sys.exit(errors)
PY
```

Expected: every line prints `OK`, exit code 0.

- [ ] **Step 4: Cross-check against `brands.json`**

Run:
```bash
python3 - <<'PY'
import json, glob
brand_ids = {b["id"] for b in json.load(open("assets/data/brands.json"))["brands"]}
tipping_ids = {json.load(open(p))["lineId"] for p in glob.glob("assets/data/tipping/*.json") if not p.endswith("_schema.json")}
missing_in_tipping = brand_ids - tipping_ids
extra_in_tipping = tipping_ids - brand_ids
print("Missing tipping for:", sorted(missing_in_tipping) or "none")
print("Tipping for unknown brand:", sorted(extra_in_tipping) or "none")
PY
```

Expected: both lists empty.

- [ ] **Step 5: Commit**

```bash
git add assets/data/tipping/
git commit -m "data: 2026 tipping configurations for all 15 cruise lines"
```

---

### Phase B — Tool build (TDD where the boundary is testable)

#### Task 3: Page skeleton + ICP-2 metadata + noscript fallback

**Files:**
- Create: `tools/cruise-tipping-calculator.html`

- [ ] **Step 1: Invoke the icp-2 skill to get the current metadata template**

```
Skill: icp-2
```

Capture the current `<head>` block contract (frontmatter, JSON-LD, OG, Twitter, ai-summary, last-reviewed, etc.). All values below come from there; the values shown are illustrative — use the skill's current output if it differs.

- [ ] **Step 2: Write the file**

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Cruise Tipping Calculator — 2026 Daily Rates &amp; Cash Extras for All 15 Lines | In The Wake</title>
  <meta name="description" content="Plan exactly what you'll owe in cruise gratuities. 2026 daily rates, bar/spa/specialty auto-grats, and cash thank-yous for stewards, butlers, and porters — across Carnival, Royal Caribbean, Norwegian, Princess, and 11 more lines.">
  <link rel="canonical" href="https://cruisinginthewake.com/tools/cruise-tipping-calculator.html">

  <meta name="last-reviewed" content="2026-05-08">
  <meta name="ai-summary" content="Interactive calculator for cruise tipping in 2026 across 15 lines. Inputs: line, cabin tier, nights, party. Outputs: total dollars, per-night cost, and category breakdown (daily auto-charge, onboard auto-grats on bar/spa/dining/room service, optional cash for steward, butler, head waiter, porter, kids' club, excursion guide, casino dealer). Lines with gratuities included in the fare (Regent, Silversea, Seabourn, Explora Journeys, Virgin Voyages) display the included status and keep cash-extras optional.">

  <meta property="og:type" content="website">
  <meta property="og:title" content="Cruise Tipping Calculator — 2026 Rates for All 15 Lines">
  <meta property="og:description" content="What you'll really owe in tips, by line. 2026 daily rates plus the extras most calculators miss.">
  <meta property="og:url" content="https://cruisinginthewake.com/tools/cruise-tipping-calculator.html">
  <meta property="og:image" content="https://cruisinginthewake.com/assets/social/cruise-tipping-calculator-2026.jpg">
  <meta name="twitter:card" content="summary_large_image">

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": "Cruise Tipping Calculator",
        "applicationCategory": "TravelApplication",
        "operatingSystem": "Any (web)",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
        "url": "https://cruisinginthewake.com/tools/cruise-tipping-calculator.html",
        "description": "Calculates 2026 cruise gratuities including daily charges, bar/spa/specialty auto-grats, and recommended cash extras for all 15 major lines.",
        "datePublished": "2026-05-08",
        "dateModified": "2026-05-08",
        "publisher": { "@type": "Organization", "name": "In The Wake", "url": "https://cruisinginthewake.com/" }
      },
      {
        "@type": "HowTo",
        "name": "How to budget cruise tips for a 2026 sailing",
        "step": [
          { "@type": "HowToStep", "name": "Enter your sailing", "text": "Choose your cruise line, cabin tier, nights, and party." },
          { "@type": "HowToStep", "name": "Add onboard plans", "text": "Estimate bar tabs, spa, specialty dining, and room service so the tool can apply the correct auto-gratuities." },
          { "@type": "HowToStep", "name": "Plan cash extras", "text": "Adjust suggested cash thank-yous for stateroom attendant, head waiter, butler, porters, kids' club, excursion guide and driver, and casino dealer." },
          { "@type": "HowToStep", "name": "Compare and print", "text": "Compare two lines side by side and print a clean tip-envelope summary." }
        ]
      }
    ]
  }
  </script>

  <link rel="stylesheet" href="/assets/css/global.css">
  <link rel="stylesheet" href="/assets/css/tools/cruise-tipping-calculator.css">
</head>
<body>
  <!-- Existing site header partial: copy the same include pattern used by tools/cruise-budget-calculator.html. -->
  <main id="main" class="tool-page">
    <header class="tool-hero">
      <h1>Cruise Tipping Calculator <span class="tool-hero__year">2026</span></h1>
      <p class="tool-hero__lede">What you'll actually owe in tips for your booked cruise — daily charges, bar and spa auto-grats, and the cash thank-yous most calculators leave out. All 15 lines we cover.</p>
    </header>

    <noscript>
      <section class="noscript-fallback">
        <h2>Calculator requires JavaScript</h2>
        <p>The interactive calculator uses JavaScript to compute totals. The 2026 rate table and the four-step manual formula below give you everything you need to compute by hand.</p>
        <h3>2026 daily rates by line</h3>
        <table>
          <thead><tr><th>Line</th><th>Standard cabin</th><th>Suite</th><th>Notes</th></tr></thead>
          <tbody id="noscript-rate-table">
            <!-- Filled at build/publish time by the same data files. For v1, populate by hand from research doc. -->
          </tbody>
        </table>
        <h3>Manual formula</h3>
        <ol>
          <li><strong>Daily charge:</strong> rate × nights × charged guests (subtract under-age children where the line exempts them).</li>
          <li><strong>Onboard auto-grats:</strong> add 18% to bar tabs, 18% to spa, 18% to specialty dining, 18% to room service charges (varies by line — see table).</li>
          <li><strong>Cash extras:</strong> $2 per bag at embarkation; optional end-of-cruise envelopes for head waiter and assistant waiter; $5/day for butler if your suite includes one; $5/person for excursion guides plus $2/person for drivers.</li>
          <li><strong>Print and pack envelopes labeled by role.</strong></li>
        </ol>
      </section>
    </noscript>

    <form id="tipping-form" class="tipping-form" aria-label="Cruise tipping inputs">
      <section class="accordion" data-section="sailing" aria-expanded="true">
        <h2><button type="button" class="accordion__toggle" aria-controls="panel-sailing" aria-expanded="true">Your sailing</button></h2>
        <div id="panel-sailing" class="accordion__panel">
          <label>Cruise line
            <select id="line-select" name="line" required></select>
          </label>
          <label>Cabin tier
            <select id="cabin-tier" name="cabinTier">
              <option value="standard">Interior / Oceanview / Balcony</option>
              <option value="suite">Suite</option>
            </select>
          </label>
          <label>Nights <input type="number" id="nights" name="nights" min="1" max="180" value="7" required></label>
          <fieldset>
            <legend>Party</legend>
            <label>Adults <input type="number" id="adults" name="adults" min="1" max="12" value="2" required></label>
            <label>Children <input type="number" id="children" name="children" min="0" max="12" value="0"></label>
            <div id="children-ages" hidden></div>
          </fieldset>
          <p id="bundled-banner" class="bundled-banner" hidden></p>
        </div>
      </section>

      <section class="accordion" data-section="onboard" aria-expanded="false">
        <h2><button type="button" class="accordion__toggle" aria-controls="panel-onboard" aria-expanded="false">Onboard extras</button></h2>
        <div id="panel-onboard" class="accordion__panel">
          <label>Estimated bar tab (cruise total, $)
            <input type="number" id="bar-tab" name="barTab" min="0" step="1" value="0">
          </label>
          <label><input type="checkbox" id="bar-prepaid" name="barPrepaid"> I have a prepaid drink package (auto-grats included)</label>
          <label>Specialty dining covers ($/person/meal)
            <input type="number" id="specialty-cost" name="specialtyCost" min="0" step="1" value="0">
          </label>
          <label>Specialty dining meals (count)
            <input type="number" id="specialty-meals" name="specialtyMeals" min="0" step="1" value="0">
          </label>
          <label>Spa total ($)
            <input type="number" id="spa-total" name="spaTotal" min="0" step="1" value="0">
          </label>
          <label>Room service orders (count)
            <input type="number" id="room-service-count" name="roomServiceCount" min="0" step="1" value="0">
          </label>
          <label>Avg per order ($)
            <input type="number" id="room-service-avg" name="roomServiceAvg" min="0" step="1" value="0">
          </label>
        </div>
      </section>

      <section class="accordion" data-section="cash" aria-expanded="false">
        <h2><button type="button" class="accordion__toggle" aria-controls="panel-cash" aria-expanded="false">Service tips, cash on top</button></h2>
        <div id="panel-cash" class="accordion__panel" id="cash-extras-panel">
          <!-- Rendered by render.js from the selected line's recommendedCashExtras. -->
        </div>
      </section>
    </form>

    <aside id="result-panel" class="result-panel" aria-live="polite">
      <h2>Your tipping plan</h2>
      <p class="result-panel__headline" id="result-headline"></p>
      <ul class="result-panel__breakdown" id="result-breakdown"></ul>
      <div class="result-panel__actions">
        <button type="button" id="compare-toggle">Compare another line</button>
        <button type="button" id="print-plan">Print my plan</button>
        <button type="button" id="reset">Reset</button>
      </div>
      <section id="compare-column" class="result-panel__compare" hidden></section>
    </aside>
  </main>

  <script type="module" src="/assets/js/tools/cruise-tipping-calculator/main.js"></script>
</body>
</html>
```

- [ ] **Step 3: Verify the file parses as valid HTML**

Run:
```bash
python3 -c "from html.parser import HTMLParser; HTMLParser().feed(open('tools/cruise-tipping-calculator.html').read()); print('OK')"
```

Expected: `OK`.

- [ ] **Step 4: Manually populate the noscript rate table**

Open `tools/cruise-tipping-calculator.html`, find the `<tbody id="noscript-rate-table">`, paste in 15 `<tr>` rows pulling values directly from `admin/CRUISE_TIPPING_RESEARCH_2026.md`. This is intentionally hand-maintained — the noscript path doesn't read JSON.

- [ ] **Step 5: Commit**

```bash
git add tools/cruise-tipping-calculator.html
git commit -m "feat: cruise tipping calculator page skeleton with ICP-2 metadata and noscript fallback"
```

---

#### Task 4: Page-scoped CSS

**Files:**
- Create: `assets/css/tools/cruise-tipping-calculator.css`

- [ ] **Step 1: Write the file**

```css
/* Cruise Tipping Calculator — page-scoped styles.
   Inherits from /assets/css/global.css. Mobile-first. */

.tool-page { display: grid; gap: 1.5rem; padding: 1rem; max-width: 1200px; margin: 0 auto; }
.tool-hero h1 { font-size: clamp(1.75rem, 4vw, 2.5rem); margin: 0 0 .25rem; }
.tool-hero__year { color: var(--accent, #d9b382); font-weight: 600; }
.tool-hero__lede { color: var(--ink-soft, #444); max-width: 60ch; }

.noscript-fallback { padding: 1rem; border: 2px solid var(--accent, #d9b382); border-radius: 8px; }

.tipping-form { display: grid; gap: 1rem; }
.accordion { border: 1px solid var(--border, #e3e3e3); border-radius: 8px; background: var(--surface, #fff); }
.accordion h2 { margin: 0; }
.accordion__toggle { width: 100%; padding: 1rem; text-align: left; background: transparent; border: 0; font: inherit; font-weight: 600; cursor: pointer; }
.accordion__toggle::after { content: "▾"; float: right; transition: transform .2s; }
.accordion[aria-expanded="false"] .accordion__panel { display: none; }
.accordion[aria-expanded="false"] .accordion__toggle::after { transform: rotate(-90deg); }
.accordion__panel { padding: 0 1rem 1rem; display: grid; gap: .75rem; }
.accordion__panel label { display: grid; gap: .25rem; }
.accordion__panel input, .accordion__panel select { padding: .5rem; font: inherit; }

.bundled-banner { padding: .75rem 1rem; background: #fef9e7; border-left: 4px solid var(--accent, #d9b382); border-radius: 4px; }

.result-panel { padding: 1.25rem; border-radius: 8px; background: var(--surface-strong, #f7f5f0); display: grid; gap: .75rem; }
.result-panel__headline { font-size: 1.25rem; font-weight: 600; margin: 0; }
.result-panel__breakdown { list-style: none; padding: 0; margin: 0; display: grid; gap: .25rem; }
.result-panel__breakdown li { display: flex; justify-content: space-between; padding: .35rem .5rem; border-radius: 4px; }
.result-panel__breakdown li:hover, .result-panel__breakdown li:focus-within { background: rgba(0,0,0,.04); cursor: pointer; }
.result-panel__actions { display: flex; gap: .5rem; flex-wrap: wrap; }
.result-panel__actions button { padding: .5rem 1rem; cursor: pointer; }
.result-panel__compare { display: grid; gap: .5rem; padding-top: 1rem; border-top: 1px solid var(--border, #e3e3e3); }

@media (min-width: 960px) {
  .tool-page { grid-template-columns: minmax(0, 2fr) minmax(280px, 1fr); align-items: start; }
  .tool-hero, .tipping-form { grid-column: 1; }
  .result-panel { grid-column: 2; position: sticky; top: 1rem; }
}

@media print {
  .accordion__toggle, .result-panel__actions, header, footer, nav { display: none !important; }
  .accordion[aria-expanded="false"] .accordion__panel { display: block !important; }
  body { color: #000; background: #fff; }
  .result-panel { border: 1px solid #000; }
}
```

- [ ] **Step 2: Commit**

```bash
git add assets/css/tools/cruise-tipping-calculator.css
git commit -m "feat: cruise tipping calculator page styles (sticky panel + accordion + print)"
```

---

#### Task 5: Data-loader module + unit test

**Files:**
- Create: `assets/js/tools/cruise-tipping-calculator/data.js`
- Test: `tests/unit/cruise-tipping/data.test.mjs`

- [ ] **Step 1: Write the failing test**

```js
// tests/unit/cruise-tipping/data.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { loadAll, getLine, listLines } from "../../../assets/js/tools/cruise-tipping-calculator/data.js";

test("loadAll fetches brands and tipping configs", async () => {
  globalThis.fetch = async (url) => {
    if (url.endsWith("/brands.json")) {
      return new Response(JSON.stringify({
        brands: [{ id: "carnival", label: "Carnival", active: true }, { id: "regent", label: "Regent", active: true }]
      }));
    }
    if (url.endsWith("/tipping/carnival.json")) {
      return new Response(JSON.stringify({ lineId: "carnival", displayName: "Carnival", bundledInFare: false }));
    }
    if (url.endsWith("/tipping/regent.json")) {
      return new Response(JSON.stringify({ lineId: "regent", displayName: "Regent", bundledInFare: true }));
    }
    throw new Error("Unexpected fetch: " + url);
  };
  await loadAll();
  assert.equal(listLines().length, 2);
  assert.equal(getLine("carnival").bundledInFare, false);
  assert.equal(getLine("regent").bundledInFare, true);
});

test("getLine returns null for unknown slug", async () => {
  assert.equal(getLine("unknown"), null);
});
```

- [ ] **Step 2: Run the test and verify it fails**

```bash
node --test tests/unit/cruise-tipping/data.test.mjs
```

Expected: `Cannot find module` for `data.js`.

- [ ] **Step 3: Write the module**

```js
// assets/js/tools/cruise-tipping-calculator/data.js
const BRANDS_URL = "/assets/data/brands.json";
const TIPPING_URL = (slug) => `/assets/data/tipping/${slug}.json`;

const cache = { lines: new Map(), order: [] };

export async function loadAll() {
  const brands = await (await fetch(BRANDS_URL)).json();
  const slugs = brands.brands.filter(b => b.active !== false).map(b => b.id);
  const configs = await Promise.all(slugs.map(async (slug) => {
    const res = await fetch(TIPPING_URL(slug));
    if (!res.ok) return null;
    return await res.json();
  }));
  cache.lines.clear();
  cache.order = [];
  configs.forEach((cfg, i) => {
    if (!cfg) return;
    cache.lines.set(slugs[i], cfg);
    cache.order.push(slugs[i]);
  });
}

export function getLine(slug) {
  return cache.lines.get(slug) || null;
}

export function listLines() {
  return cache.order.map(slug => cache.lines.get(slug));
}
```

- [ ] **Step 4: Run the tests and verify they pass**

```bash
node --test tests/unit/cruise-tipping/data.test.mjs
```

Expected: 2 passing.

- [ ] **Step 5: Commit**

```bash
git add assets/js/tools/cruise-tipping-calculator/data.js tests/unit/cruise-tipping/data.test.mjs
git commit -m "feat: tipping calculator data loader with brands+tipping fetch"
```

---

#### Task 6: Calculation engine (pure functions) + unit tests

**Files:**
- Create: `assets/js/tools/cruise-tipping-calculator/calc.js`
- Test: `tests/unit/cruise-tipping/calc.test.mjs`

- [ ] **Step 1: Write the failing tests**

```js
// tests/unit/cruise-tipping/calc.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { calcDailyTotal, calcOnboardAutoGrats, calcCashExtras, calcGrandTotal } from "../../../assets/js/tools/cruise-tipping-calculator/calc.js";

const carnival = {
  bundledInFare: false,
  dailyRates: { standard: { amount: 17 }, suite: { amount: 19 } },
  childPolicy: { exemptUnderAge: 2 },
  autoGratuities: { bar: { percent: 18 }, spa: { percent: 18 }, specialtyDining: { percent: 18 }, roomService: { percent: 18 } }
};
const regent = { bundledInFare: true, dailyRates: null, childPolicy: null, autoGratuities: null };

test("daily total: 7 nights × 2 adults × $17 standard = $238", () => {
  assert.equal(calcDailyTotal(carnival, { cabinTier: "standard", nights: 7, adults: 2, childAges: [] }), 238);
});

test("daily total: skip exempt children (under 2)", () => {
  assert.equal(calcDailyTotal(carnival, { cabinTier: "standard", nights: 7, adults: 2, childAges: [1, 5] }), 7 * 17 * 3); // 2 adults + 1 charged child (age 5)
});

test("daily total: bundled-in-fare line returns 0", () => {
  assert.equal(calcDailyTotal(regent, { cabinTier: "suite", nights: 10, adults: 2, childAges: [] }), 0);
});

test("onboard auto-grats: $300 bar at 18% = $54", () => {
  const out = calcOnboardAutoGrats(carnival, { barTab: 300, barPrepaid: false, specialtyCost: 0, specialtyMeals: 0, spaTotal: 0, roomServiceCount: 0, roomServiceAvg: 0 });
  assert.equal(out.total, 54);
});

test("onboard auto-grats: prepaid bar package excludes bar tab", () => {
  const out = calcOnboardAutoGrats(carnival, { barTab: 300, barPrepaid: true, specialtyCost: 0, specialtyMeals: 0, spaTotal: 0, roomServiceCount: 0, roomServiceAvg: 0 });
  assert.equal(out.bar, 0);
});

test("onboard auto-grats: specialty dining 2 meals × $80 × 18% = $28.80", () => {
  const out = calcOnboardAutoGrats(carnival, { barTab: 0, barPrepaid: false, specialtyCost: 80, specialtyMeals: 2, spaTotal: 0, roomServiceCount: 0, roomServiceAvg: 0 });
  assert.equal(out.specialty, 28.8);
});

test("cash extras sum: porter $2 × 4 bags + butler $5/day × 7 = $8 + $35 = $43", () => {
  const line = {
    bundledInFare: false,
    recommendedCashExtras: {
      porterPerBag: { default: 2, perBag: true, note: "" },
      butler: { default: 5, perDay: true, note: "" }
    }
  };
  const inputs = { cashExtras: { porterPerBag: { count: 4 }, butler: { override: null } }, nights: 7 };
  assert.equal(calcCashExtras(line, inputs), 43);
});

test("grand total = daily + onboard + cash", () => {
  const inputs = {
    cabinTier: "standard", nights: 7, adults: 2, childAges: [],
    barTab: 300, barPrepaid: false,
    specialtyCost: 80, specialtyMeals: 2,
    spaTotal: 150, roomServiceCount: 5, roomServiceAvg: 3,
    cashExtras: {}
  };
  const t = calcGrandTotal(carnival, inputs);
  // 238 daily + (54 bar + 28.8 specialty + 27 spa + 2.7 RS) + 0 cash = 350.5
  assert.equal(t.total, 350.5);
});
```

- [ ] **Step 2: Run and verify failure**

```bash
node --test tests/unit/cruise-tipping/calc.test.mjs
```

Expected: `Cannot find module` for `calc.js`.

- [ ] **Step 3: Write the module**

```js
// assets/js/tools/cruise-tipping-calculator/calc.js
// Pure functions only. No DOM. No fetch. Inputs in, dollars out.

const round2 = (n) => Math.round(n * 100) / 100;

export function calcDailyTotal(line, inputs) {
  if (line.bundledInFare || !line.dailyRates) return 0;
  const rate = (inputs.cabinTier === "suite" ? line.dailyRates.suite : line.dailyRates.standard).amount;
  const exemptUnder = line.childPolicy?.exemptUnderAge ?? 0;
  const chargedChildren = (inputs.childAges || []).filter(age => age >= exemptUnder).length;
  const charged = inputs.adults + chargedChildren;
  return round2(rate * inputs.nights * charged);
}

export function calcOnboardAutoGrats(line, inputs) {
  if (line.bundledInFare || !line.autoGratuities) {
    return { total: 0, bar: 0, specialty: 0, spa: 0, roomService: 0 };
  }
  const g = line.autoGratuities;
  const bar       = inputs.barPrepaid ? 0 : (inputs.barTab || 0) * (g.bar.percent / 100);
  const specialty = (inputs.specialtyCost || 0) * (inputs.specialtyMeals || 0) * (g.specialtyDining.percent / 100);
  const spa       = (inputs.spaTotal || 0) * (g.spa.percent / 100);
  const roomService = (inputs.roomServiceCount || 0) * (inputs.roomServiceAvg || 0) * (g.roomService.percent / 100);
  const total = bar + specialty + spa + roomService;
  return { total: round2(total), bar: round2(bar), specialty: round2(specialty), spa: round2(spa), roomService: round2(roomService) };
}

export function calcCashExtras(line, inputs) {
  const extras = line.recommendedCashExtras || {};
  const userVals = inputs.cashExtras || {};
  let total = 0;
  for (const [key, def] of Object.entries(extras)) {
    const userVal = userVals[key] || {};
    const amount = userVal.override != null ? userVal.override : def.default;
    if (def.perDay)    total += amount * (inputs.nights || 0);
    else if (def.perBag)    total += amount * (userVal.count || 0);
    else if (def.perPerson) total += amount * (userVal.count || 0);
    else if (def.perVisit)  total += amount * (userVal.count || 0);
    else                    total += amount; // flat one-time
  }
  return round2(total);
}

export function calcGrandTotal(line, inputs) {
  const daily = calcDailyTotal(line, inputs);
  const onboard = calcOnboardAutoGrats(line, inputs);
  const cash = calcCashExtras(line, inputs);
  return { total: round2(daily + onboard.total + cash), daily, onboard, cash };
}
```

- [ ] **Step 4: Run and verify pass**

```bash
node --test tests/unit/cruise-tipping/calc.test.mjs
```

Expected: 8 passing.

- [ ] **Step 5: Commit**

```bash
git add assets/js/tools/cruise-tipping-calculator/calc.js tests/unit/cruise-tipping/calc.test.mjs
git commit -m "feat: pure-function calculation engine with TDD coverage"
```

---

#### Task 7: State + persistence module + unit test

**Files:**
- Create: `assets/js/tools/cruise-tipping-calculator/state.js`
- Create: `assets/js/tools/cruise-tipping-calculator/persist.js`
- Test: `tests/unit/cruise-tipping/state.test.mjs`

- [ ] **Step 1: Write the failing test**

```js
// tests/unit/cruise-tipping/state.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { createState } from "../../../assets/js/tools/cruise-tipping-calculator/state.js";
import { encodeHash, decodeHash } from "../../../assets/js/tools/cruise-tipping-calculator/persist.js";

test("createState defaults", () => {
  const s = createState();
  assert.equal(s.get().nights, 7);
  assert.equal(s.get().adults, 2);
  assert.equal(s.get().cabinTier, "standard");
});

test("update emits to subscribers", () => {
  const s = createState();
  let calls = 0;
  s.subscribe(() => { calls++; });
  s.update({ nights: 5 });
  assert.equal(calls, 1);
  assert.equal(s.get().nights, 5);
});

test("hash round-trip preserves shape", () => {
  const v = { line: "carnival", cabinTier: "suite", nights: 10, adults: 2, children: 1, childAges: [4] };
  const hash = encodeHash(v);
  const back = decodeHash(hash);
  assert.deepEqual(back, v);
});
```

- [ ] **Step 2: Run and verify failure**

```bash
node --test tests/unit/cruise-tipping/state.test.mjs
```

Expected: module not found.

- [ ] **Step 3: Write `state.js`**

```js
// assets/js/tools/cruise-tipping-calculator/state.js
const DEFAULTS = {
  line: "royal-caribbean",
  cabinTier: "standard",
  nights: 7,
  adults: 2,
  children: 0,
  childAges: [],
  barTab: 0, barPrepaid: false,
  specialtyCost: 0, specialtyMeals: 0,
  spaTotal: 0,
  roomServiceCount: 0, roomServiceAvg: 0,
  cashExtras: {}
};

export function createState(initial) {
  let value = { ...DEFAULTS, ...(initial || {}) };
  const subs = new Set();
  return {
    get: () => value,
    update: (patch) => { value = { ...value, ...patch }; subs.forEach(fn => fn(value)); },
    subscribe: (fn) => { subs.add(fn); return () => subs.delete(fn); }
  };
}
```

- [ ] **Step 4: Write `persist.js`**

```js
// assets/js/tools/cruise-tipping-calculator/persist.js
const STORAGE_KEY = "ctc_v1";

export function encodeHash(state) {
  return "#" + btoa(unescape(encodeURIComponent(JSON.stringify(state))));
}

export function decodeHash(hash) {
  if (!hash || hash === "#") return null;
  try {
    return JSON.parse(decodeURIComponent(escape(atob(hash.slice(1)))));
  } catch {
    return null;
  }
}

export function loadFromStorage() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); }
  catch { return null; }
}

export function saveToStorage(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}

export function clearStorage() {
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
}

export function attachPersistence(state) {
  const fromHash = (typeof location !== "undefined") ? decodeHash(location.hash) : null;
  const fromStorage = loadFromStorage();
  if (fromHash)         state.update(fromHash);
  else if (fromStorage) state.update(fromStorage);

  state.subscribe((value) => {
    saveToStorage(value);
    if (typeof history !== "undefined") {
      history.replaceState(null, "", encodeHash(value));
    }
  });
}
```

- [ ] **Step 5: Run and verify pass**

```bash
node --test tests/unit/cruise-tipping/state.test.mjs
```

Expected: 3 passing.

- [ ] **Step 6: Commit**

```bash
git add assets/js/tools/cruise-tipping-calculator/state.js assets/js/tools/cruise-tipping-calculator/persist.js tests/unit/cruise-tipping/state.test.mjs
git commit -m "feat: tipping calculator state model with localStorage + URL hash persistence"
```

---

#### Task 8: Render module + main entry wiring

**Files:**
- Create: `assets/js/tools/cruise-tipping-calculator/render.js`
- Create: `assets/js/tools/cruise-tipping-calculator/main.js`

- [ ] **Step 1: Write `render.js`**

```js
// assets/js/tools/cruise-tipping-calculator/render.js
const fmt = (n) => "$" + n.toFixed(2).replace(/\.00$/, "");

export function renderLineSelect(el, lines, selected) {
  el.innerHTML = "";
  for (const line of lines) {
    const opt = document.createElement("option");
    opt.value = line.lineId;
    opt.textContent = line.displayName;
    if (line.lineId === selected) opt.selected = true;
    el.appendChild(opt);
  }
}

export function renderBundledBanner(el, line) {
  if (line.bundledInFare) {
    el.hidden = false;
    el.textContent = line.bundledNote || "Gratuities are included in your fare on this line. Crew tipping is at your discretion.";
  } else {
    el.hidden = true;
    el.textContent = "";
  }
}

export function renderCashExtras(el, line, state) {
  const extras = line.recommendedCashExtras || {};
  el.innerHTML = "";
  for (const [key, def] of Object.entries(extras)) {
    if (def.default === 0 && !def.perBag && !def.perPerson && !def.perVisit && !def.perDay) continue;
    const wrap = document.createElement("label");
    const unit = def.perDay ? "/day" : def.perBag ? "/bag" : def.perPerson ? "/person" : def.perVisit ? "/visit" : "";
    const countField = (def.perBag || def.perPerson || def.perVisit)
      ? `<input type="number" min="0" value="0" data-extra="${key}" data-field="count"> count`
      : "";
    wrap.innerHTML = `${prettify(key)} (${fmt(def.default)}${unit})
      <input type="number" min="0" step="1" placeholder="${def.default}" data-extra="${key}" data-field="override">
      ${countField}
      <small>${def.note || ""}</small>`;
    el.appendChild(wrap);
  }
}

export function renderResult(headlineEl, breakdownEl, line, totals, state) {
  const partyText = `${state.adults} adult${state.adults === 1 ? "" : "s"}` +
                    (state.children ? ` + ${state.children} child${state.children === 1 ? "" : "ren"}` : "");
  const perNight = totals.total / state.nights;
  headlineEl.textContent = `${fmt(totals.total)} total · ${fmt(perNight)} per night for ${partyText} on a ${state.nights}-night ${line.displayName} ${state.cabinTier === "suite" ? "suite" : "cabin"}.`;

  breakdownEl.innerHTML = "";
  const rows = [
    { label: "Daily auto-charge", amount: totals.daily, target: "panel-sailing" },
    { label: "Bar auto-grats", amount: totals.onboard.bar, target: "panel-onboard" },
    { label: "Specialty dining auto-grats", amount: totals.onboard.specialty, target: "panel-onboard" },
    { label: "Spa auto-grats", amount: totals.onboard.spa, target: "panel-onboard" },
    { label: "Room service auto-grats", amount: totals.onboard.roomService, target: "panel-onboard" },
    { label: "Cash extras", amount: totals.cash, target: "panel-cash" }
  ];
  for (const row of rows) {
    if (row.amount === 0) continue;
    const li = document.createElement("li");
    li.tabIndex = 0;
    li.dataset.scrollTarget = row.target;
    li.innerHTML = `<span>${row.label}</span><span>${fmt(row.amount)}</span>`;
    breakdownEl.appendChild(li);
  }
}

function prettify(key) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, c => c.toUpperCase());
}
```

- [ ] **Step 2: Write `main.js` (the entry that wires everything)**

```js
// assets/js/tools/cruise-tipping-calculator/main.js
import { loadAll, getLine, listLines } from "./data.js";
import { createState } from "./state.js";
import { attachPersistence } from "./persist.js";
import { calcGrandTotal } from "./calc.js";
import { renderLineSelect, renderBundledBanner, renderCashExtras, renderResult } from "./render.js";

const $ = (sel) => document.querySelector(sel);

async function init() {
  await loadAll();
  const state = createState({ line: listLines()[0]?.lineId || "royal-caribbean" });
  attachPersistence(state);

  const lineSelect = $("#line-select");
  const bundledBanner = $("#bundled-banner");
  const cashPanel = $("#panel-cash");
  const headline = $("#result-headline");
  const breakdown = $("#result-breakdown");

  renderLineSelect(lineSelect, listLines(), state.get().line);

  // Two-way binding: any input change → state.update.
  document.getElementById("tipping-form").addEventListener("input", (e) => {
    const t = e.target;
    if (!t.name && !t.dataset.extra) return;
    if (t.dataset.extra) {
      const cashExtras = { ...state.get().cashExtras };
      const k = t.dataset.extra;
      cashExtras[k] = { ...(cashExtras[k] || {}), [t.dataset.field]: t.value === "" ? null : Number(t.value) };
      state.update({ cashExtras });
      return;
    }
    const v = t.type === "checkbox" ? t.checked : (t.type === "number" ? Number(t.value) : t.value);
    state.update({ [t.name]: v });
  });

  // Accordion toggle.
  document.querySelectorAll(".accordion__toggle").forEach(btn => {
    btn.addEventListener("click", () => {
      const section = btn.closest(".accordion");
      const open = section.getAttribute("aria-expanded") === "true";
      section.setAttribute("aria-expanded", String(!open));
      btn.setAttribute("aria-expanded", String(!open));
    });
  });

  // Result-row click → scroll to the panel that drove it.
  breakdown.addEventListener("click", (e) => {
    const li = e.target.closest("li[data-scroll-target]");
    if (!li) return;
    const panel = document.getElementById(li.dataset.scrollTarget);
    panel?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // Reset.
  $("#reset").addEventListener("click", () => {
    localStorage.removeItem("ctc_v1");
    location.hash = "";
    location.reload();
  });

  // Print.
  $("#print-plan").addEventListener("click", () => window.print());

  // Compare toggle.
  $("#compare-toggle").addEventListener("click", () => {
    const col = $("#compare-column");
    col.hidden = !col.hidden;
    if (!col.hidden) renderCompareColumn(col, state);
  });

  // Re-render on every state change.
  state.subscribe((v) => {
    const line = getLine(v.line);
    if (!line) return;
    renderBundledBanner(bundledBanner, line);
    renderCashExtras(cashPanel, line, v);
    const totals = calcGrandTotal(line, v);
    renderResult(headline, breakdown, line, totals, v);
    if (!$("#compare-column").hidden) renderCompareColumn($("#compare-column"), state);
  });

  // Initial paint.
  state.update({});
}

function renderCompareColumn(col, state) {
  const v = state.get();
  const others = listLines().filter(l => l.lineId !== v.line);
  col.innerHTML = `
    <h3>Compare with</h3>
    <select id="compare-line">
      ${others.map(l => `<option value="${l.lineId}">${l.displayName}</option>`).join("")}
    </select>
    <div id="compare-output"></div>
  `;
  const output = col.querySelector("#compare-output");
  const select = col.querySelector("#compare-line");
  const paint = () => {
    const compareLine = getLine(select.value);
    if (!compareLine) { output.textContent = ""; return; }
    const totals = calcGrandTotal(compareLine, v);
    output.innerHTML = `<strong>${compareLine.displayName}:</strong> $${totals.total.toFixed(2)} total ($${(totals.total / v.nights).toFixed(2)}/night)`;
  };
  select.addEventListener("change", paint);
  paint();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
```

- [ ] **Step 3: Manual smoke test**

```bash
cd /home/user/InTheWake
python3 -m http.server 8080 --bind 127.0.0.1 &
SERVER_PID=$!
sleep 1
curl -s http://127.0.0.1:8080/tools/cruise-tipping-calculator.html | head -5
kill $SERVER_PID
```

Expected: HTML doctype + first lines of the page returned. (Visual smoke happens in Task 10.)

- [ ] **Step 4: Commit**

```bash
git add assets/js/tools/cruise-tipping-calculator/render.js assets/js/tools/cruise-tipping-calculator/main.js
git commit -m "feat: cruise tipping calculator UI rendering and event wiring"
```

---

### Phase C — Tests, accessibility, and visual sign-off

#### Task 9: Playwright spec for golden path + compare + bundled + share

**Files:**
- Create: `tests/playwright/cruise-tipping-calculator.spec.js`

- [ ] **Step 1: Invoke the webapp-testing skill to align with the existing harness**

```
Skill: webapp-testing
```

Read the skill output to confirm: existing playwright config path, base URL convention, helper imports, fixture pattern. The spec below uses placeholder helper paths — replace with whatever the skill output shows.

- [ ] **Step 2: Write the spec**

```js
// tests/playwright/cruise-tipping-calculator.spec.js
import { test, expect } from "@playwright/test";

const URL = "/tools/cruise-tipping-calculator.html";

test.describe("Cruise tipping calculator", () => {
  test("golden path: 7-night Carnival balcony for 2 adults shows ~$238 daily charge", async ({ page }) => {
    await page.goto(URL);
    await page.selectOption("#line-select", "carnival");
    await page.selectOption("#cabin-tier", "standard");
    await page.fill("#nights", "7");
    await page.fill("#adults", "2");
    await page.fill("#children", "0");
    await expect(page.locator("#result-headline")).toContainText("$238");
    await expect(page.locator("#result-breakdown li")).toContainText(["Daily auto-charge"]);
  });

  test("bundled-gratuity line: Regent shows $0 daily and the included banner", async ({ page }) => {
    await page.goto(URL);
    await page.selectOption("#line-select", "regent");
    await expect(page.locator("#bundled-banner")).toBeVisible();
    await expect(page.locator("#bundled-banner")).toContainText(/included/i);
    // Headline total may include cash extras but daily auto-charge must not appear.
    await expect(page.locator("#result-breakdown")).not.toContainText("Daily auto-charge");
  });

  test("compare mode shows a side-by-side total for a second line", async ({ page }) => {
    await page.goto(URL);
    await page.selectOption("#line-select", "royal-caribbean");
    await page.click("#compare-toggle");
    await expect(page.locator("#compare-column")).toBeVisible();
    await page.selectOption("#compare-line", "norwegian");
    await expect(page.locator("#compare-output")).toContainText("Norwegian");
    await expect(page.locator("#compare-output")).toContainText("$");
  });

  test("URL hash share-and-restore preserves a configured plan", async ({ page, context }) => {
    await page.goto(URL);
    await page.selectOption("#line-select", "princess");
    await page.fill("#nights", "10");
    await page.fill("#adults", "3");
    await page.waitForFunction(() => location.hash.length > 1);
    const url = page.url();
    const fresh = await context.newPage();
    await fresh.goto(url);
    await expect(fresh.locator("#line-select")).toHaveValue("princess");
    await expect(fresh.locator("#nights")).toHaveValue("10");
    await expect(fresh.locator("#adults")).toHaveValue("3");
  });

  test("specialty dining auto-gratuity math: 2 meals × $80 × 18% = $28.80", async ({ page }) => {
    await page.goto(URL);
    await page.selectOption("#line-select", "carnival");
    await page.click("#panel-onboard ~ * .accordion__toggle, [aria-controls=panel-onboard]");
    await page.fill("#specialty-cost", "80");
    await page.fill("#specialty-meals", "2");
    await expect(page.locator("#result-breakdown")).toContainText("Specialty dining auto-grats");
    await expect(page.locator("#result-breakdown")).toContainText("$28.80");
  });
});
```

- [ ] **Step 3: Run the spec**

```bash
npx playwright test tests/playwright/cruise-tipping-calculator.spec.js
```

Expected: 5 passing. If selectors miss, fix them in the spec — never weaken assertions.

- [ ] **Step 4: Commit**

```bash
git add tests/playwright/cruise-tipping-calculator.spec.js
git commit -m "test: playwright coverage for tipping calculator golden path, compare, bundled, share"
```

---

#### Task 10: Accessibility audit

**Files:**
- (audits, no creates)

- [ ] **Step 1: Invoke the accessibility-audit skill**

```
Skill: accessibility-audit
```

Run it against `tools/cruise-tipping-calculator.html` and `articles/cruise-tipping-2026.html` (the article will be written in Task 12; if it doesn't exist yet, audit only the tool).

- [ ] **Step 2: Fix every flagged issue**

Common findings to expect on a tool page:
- Missing `aria-controls` / `aria-expanded` consistency on accordion buttons
- Insufficient color contrast on the bundled banner (the `#fef9e7` background combined with light text fails 4.5:1 — adjust if so)
- Missing `aria-live` on the result region (already added; double-check)
- Form labels not associated with inputs (the skeleton uses wrapping `<label>` — confirm)
- Print stylesheet hides interactive controls but not their announcements (use `aria-hidden` on hidden buttons during print)

Fix each in `tools/cruise-tipping-calculator.html` and `assets/css/tools/cruise-tipping-calculator.css`.

- [ ] **Step 3: Re-run the audit until clean**

- [ ] **Step 4: Commit**

```bash
git add tools/cruise-tipping-calculator.html assets/css/tools/cruise-tipping-calculator.css
git commit -m "a11y: fix accordion ARIA, contrast, and print-mode announcements per audit"
```

---

### Phase D — Companion article

#### Task 11: Write the article (voice-aligned, sourced)

**Files:**
- Create: `articles/cruise-tipping-2026.html`

- [ ] **Step 1: Read the voice template**

```bash
cat /home/user/InTheWake/articles/caribbean-cruise-trends-2026.html | head -120
```

Note the page-shell pattern, header include, hero treatment, byline / last-reviewed placement, prose register, and footer include — all should be mirrored.

- [ ] **Step 2: Draft the article**

Salvage from the v0 draft (per `admin/CRUISE_TIPPING_TOOL_DRAFT_v0.md`'s "Salvageable structural elements" list):
1. The four-step manual-calculation framework — keep the structure, replace the dollar figures with verified ones from the research doc.
2. The line-by-line rate table — re-data and re-prose, no boilerplate.
3. The persona-aware angle (families with kids, solo travelers, accessibility-conscious, the bereaved) — written in InTheWake voice.
4. The "extras beyond the daily charge" frame — drinks, spa, specialty, room service, excursions, porters, butlers.
5. The "prepay locks the rate" framing — with the refund-policy nuance the v0 draft elided.

Reject from v0 (per the draft's "Discarded" list):
- "Sun-soaked decks" / "sail confidently" / "your dream cruise starts with smart preparation" — every clause.
- "Currency conversions for international itineraries" — the body never delivered it; kill the promise.
- The "(198 words)" parenthetical artifact.
- The triple Voyage Packs / Duck Club mentions — at most one of each.
- The hollow conclusion paragraph.

Open with a hero CTA pointing to `/tools/cruise-tipping-calculator.html`. Close with a single-paragraph "if you want this in dollar form, the calculator does it for you" link, not a separate conclusion section.

Page structure (~1,200 words):
1. Lede (2 short paragraphs) — the actual problem first-timers face
2. Hero CTA card → tool
3. How the daily charge works (one section, one paragraph each on pooling, child policy, prepay, adjusting)
4. 2026 rates by line (the table — values from the research doc)
5. The four-step manual formula (named "How to do this on paper if you want")
6. Extras the daily charge does not cover (bar, spa, specialty, room service, excursions, porters, butlers)
7. Cash thank-yous, role by role (steward, head waiter, asst waiter, butler, concierge, kids' club, casino dealer, excursion guide and driver)
8. Three persona reads (family with toddlers, solo traveler, traveler in grief)
9. Closing paragraph — link to the tool, link to first-cruise.html, link to one related article in /articles/
10. Last-reviewed footer with link to the research doc as transparency

- [ ] **Step 3: Run the like-a-human skill standards while drafting**

```
Skill: like-a-human
```

The skill enforces in-flight voice. Apply it — don't write past it.

- [ ] **Step 4: Run voice-audit on the finished draft**

```
Skill: voice-audit
```

Fix every machine tell flagged. Common ones from the v0 draft to watch for: "ensure," "confidently," "dive in," "master ... with confidence," "smart preparation."

- [ ] **Step 5: Verify every dollar figure and percent against the research doc**

```
Skill: careful-not-clever
```

Every claim that maps to a row in `admin/CRUISE_TIPPING_RESEARCH_2026.md` is fine. Anything else gets cited or removed.

- [ ] **Step 6: Pick a hero image**

```
Skill: image-reuse-guardrail
```

Find an image not used by any other page on the site. If nothing suitable exists in `assets/media/`, the article ships without a hero (the tool page already carries the OG image). Do not reuse a Carnival ship photo on a tipping article.

- [ ] **Step 7: Commit**

```bash
git add articles/cruise-tipping-2026.html
git commit -m "feat: cruise-tipping-2026 companion article (voice-aligned, sources verified)"
```

---

#### Task 12: Wire the tool and article into the site

**Files:**
- Modify: `articles.html`
- Modify: `first-cruise.html`
- Modify: `index.html`
- Modify: `sitemap.xml`
- Modify: `llms.txt`
- Modify: `assets/data/prefetch_manifest.json`

- [ ] **Step 1: Add the article card to `articles.html`**

Find the existing pattern (`grep -n "caribbean-cruise-trends-2026" articles.html`) and copy it. Replace title, slug, summary, and date. Place the new card in publish-date order.

- [ ] **Step 2: Add a CTA block to `first-cruise.html`**

Find the "Money & Budget" or equivalent section. Insert a card linking to `/tools/cruise-tipping-calculator.html` with a one-sentence pitch and a link to the article.

- [ ] **Step 3: Add a featured-tool card to `index.html`**

```bash
grep -n "cruise-budget-calculator" index.html | head -3
```

Use that block as the template. Add a sibling card for the tipping calculator.

- [ ] **Step 4: Update `sitemap.xml`**

Add two `<url>` entries, with `<lastmod>2026-05-08</lastmod>`, `<changefreq>monthly</changefreq>`, `<priority>0.8</priority>` (matching existing tools/articles).

- [ ] **Step 5: Update `llms.txt`**

Add two lines under the appropriate section. Follow whatever pattern existing tools and articles use — read it first, don't invent.

- [ ] **Step 6: Update `assets/data/prefetch_manifest.json`**

Add the two HTML pages and the 16 new JSON files (15 per-line tipping configs + the schema). Match the existing entry shape.

- [ ] **Step 7: Run link-integrity and deployment-validator**

```
Skill: link-integrity
```

```
Skill: deployment-validator
```

Fix anything either flags.

- [ ] **Step 8: Commit**

```bash
git add articles.html first-cruise.html index.html sitemap.xml llms.txt assets/data/prefetch_manifest.json
git commit -m "feat: wire cruise tipping tool + article into nav, sitemap, llms.txt, prefetch"
```

---

#### Task 13: Final gates and push

- [ ] **Step 1: SEO/schema audit**

```
Skill: seo-schema-audit
```

Both the tool and the article. Fix anything flagged.

- [ ] **Step 2: Publication proofread**

```
Skill: publication-proofreader
```

Curly quotes, em-dash usage, alt text, broken links. Fix.

- [ ] **Step 3: Run all Playwright specs**

```bash
npx playwright test
```

Expected: every spec passes, including the 5 new ones AND every existing tool spec (regression guard — none of our changes should have touched any other tool).

- [ ] **Step 4: Verification-before-completion**

```
Skill: verification-before-completion
```

Walk the checklist. Evidence before assertions.

- [ ] **Step 5: IndexNow submission**

```
Skill: indexnow
```

Submit the two new URLs.

- [ ] **Step 6: Push**

```bash
git push -u origin claude/explore-inthewake-repo-lIUcX
```

If the network errors, retry with exponential backoff per the harness rules: 2s, 4s, 8s, 16s.

- [ ] **Step 7: Confirm done**

Post a one-line status to the user with: tool URL, article URL, total commits in the branch, total tests passing, and any remaining stale-rate verification dates.

---

## Self-Review Checklist (run after writing the plan)

**Spec coverage** — every brainstorming anchor traces to a task:
1. ✅ All 15 lines → Task 2 creates 15 JSON files; Task 1 verifies 15 rate rows.
2. ✅ Audience is first-time cruiser with a booked sailing → Task 11 article voice + Task 12 first-cruise.html placement.
3. ✅ Full extras coverage incl. cash on top → Task 6 calc.js handles every cash-extra shape; Task 11 article enumerates roles.
4. ✅ Single-page accordion → Task 3 page skeleton.
5. ✅ Refactor reconsidered: data lives in new `assets/data/tipping/` not in `lines.json`. Spec corrected. Tasks 1–2.
6. ✅ Bundled-gratuity lines → Task 6 `calcDailyTotal` returns 0 when `bundledInFare`; Task 8 banner; Task 9 dedicated test case.
7. ✅ Headline + breakdown + compare + print → Task 8 render module; Task 9 test for compare; Task 8 print handler.
8. ✅ localStorage + URL hash + print → Task 7 persist module + tests; Task 9 share/restore test.
9. ✅ Tool at /tools/, article rewritten as companion → Task 3 + Task 11 + Task 12 wiring.
10. ✅ ICP-2 + WCAG 2.1 AA + voice-audit → Task 3 metadata, Task 10 a11y, Task 11 voice gates.

**Placeholder scan** — none of the patterns from the No Placeholders section appear: no "TBD" outside the research-doc skeleton (where TBD is the literal cell content the verifier replaces), no "implement later," no "similar to Task N" handwaves. Every task has either complete code or an exact procedure.

**Type consistency** — function names match across modules: `loadAll`/`getLine`/`listLines` (data.js used in main.js); `calcDailyTotal`/`calcOnboardAutoGrats`/`calcCashExtras`/`calcGrandTotal` (calc.js used in main.js and tested in calc.test.mjs); `createState`/`get`/`update`/`subscribe` (state.js used in main.js and tested); `encodeHash`/`decodeHash`/`attachPersistence` (persist.js used in main.js and tested). Storage key `ctc_v1` matches between persist.js and main.js Reset handler.
