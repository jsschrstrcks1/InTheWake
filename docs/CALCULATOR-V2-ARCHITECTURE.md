# Drink Calculator v2 — Architecture Document

**Date:** 2026-04-13
**Version:** 2.000.000
**Status:** Working prototype (Royal Caribbean only)
**Author:** Claude Code (session_018zZKNJYWG3TdWWqibJUmFb)

*Soli Deo Gloria*

---

## Purpose

The drink calculator v1 is a 5,955-line PWA-style application where every pricing assumption, policy rule, package name, loyalty tier, and UI label is hardcoded to Royal Caribbean. The v2 architecture duplicates the calculator and refactors it so a single JSON config file (`calculator-config.json`) drives all cruise-line-specific behavior. Swap the config entry, get a different cruise line's calculator.

**v1 is completely untouched.** Every v1 file remains at its original path and is not modified.

---

## File Inventory

### v2 Files Created

| File | Lines | Role | v1 Counterpart |
|------|-------|------|----------------|
| `drink-calculatorv2.html` | 1,677 | Page + cruise line selector | `drink-calculator.html` (1,618) |
| `assets/js/calculator-v2.js` | 1,654 | Core engine + config loading | `assets/js/calculator.js` (1,504) |
| `assets/js/calculator-math-v2.js` | 856 | Math engine (config-driven) | `assets/js/calculator-math.js` (806) |
| `assets/js/calculator-ui-v2.js` | 1,554 | UI layer (dynamic labels) | `assets/js/calculator-ui.js` (1,506) |
| `assets/js/package-selection-feature-v2.js` | 555 | Package cards (config break-even) | `assets/js/package-selection-feature.js` (521) |
| `assets/data/calculator-config.json` | 210 | Single source of truth | *New — no v1 equivalent* |
| `assets/data/CALCULATOR-CONFIG-GUIDE.md` | 224 | Config field reference | *New — no v1 equivalent* |
| `docs/CALCULATOR-V2-ARCHITECTURE.md` | *this file* | Architecture documentation | *New — no v1 equivalent* |

**Total v2:** 6,730 lines (vs. v1: 5,955 lines)
**Net new code:** ~775 lines (config file + config loader + docs + headers)

### v1 Files (UNTOUCHED)

| File | Lines | Status |
|------|-------|--------|
| `drink-calculator.html` | 1,618 | Not modified |
| `assets/js/calculator.js` | 1,504 | Not modified |
| `assets/js/calculator-math.js` | 806 | Not modified |
| `assets/js/calculator-ui.js` | 1,506 | Not modified |
| `assets/js/package-selection-feature.js` | 521 | Not modified |
| `assets/data/lines/royal-caribbean.json` | 80 | Not modified |
| `assets/data/brands.json` | — | Not modified |

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    drink-calculatorv2.html                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Cruise Line Selector (dropdown)                      │   │
│  │  Populated from ITW_CALC_CONFIG.lines                 │   │
│  │  on change → ITW_switchCruiseLine(lineId)             │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Calculator App (existing UI)                         │   │
│  │  Quick Answer, Inputs, Chart, Comparison Table, FAQ   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
      │                │                │              │
      ▼                ▼                ▼              ▼
┌──────────┐  ┌──────────────┐  ┌───────────┐  ┌──────────────┐
│ calc-v2  │  │ calc-math-v2 │  │ calc-ui-v2│  │ pkg-select-v2│
│   .js    │  │    .js       │  │   .js     │  │    .js       │
│          │  │              │  │           │  │              │
│ CONFIG   │  │ compute()    │  │ Chart     │  │ Break-even   │
│ LOADING  │──│ + lineConfig │  │ Labels    │  │ Messaging    │
│ STORE    │  │ param        │  │           │  │              │
│ WIRING   │  │              │  │ Table     │  │ Package      │
│          │  │ Coffee card  │  │ Titles    │  │ Cards        │
│          │  │ punches      │  │           │  │              │
│          │  │              │  │           │  │              │
│          │  │ Voucher max  │  │           │  │              │
└────┬─────┘  └──────────────┘  └─────┬─────┘  └──────┬───────┘
     │                                │                │
     │  window.ITW_LINE_CONFIG        │                │
     ├────────────────────────────────┤                │
     │  window.ITW_CALC_CONFIG        │                │
     ├────────────────────────────────┘                │
     │  window.ITW_switchCruiseLine                    │
     ├─────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────┐
│        calculator-config.json                 │
│  ┌─────────────────────────────────────────┐ │
│  │  "royal-caribbean": {                   │ │
│  │    packages, drinks, rules, loyalty,    │ │
│  │    coffeeCard, policies, faq, meta      │ │
│  │  }                                      │ │
│  │                                         │ │
│  │  "carnival": { ... }  ← future          │ │
│  │  "norwegian": { ... } ← future          │ │
│  └─────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
```

---

## Data Flow: Initialization Sequence

```
1. DOMContentLoaded
2. calculator-v2.js initialize():
   ├─ loadLineConfig()                          ← NEW in v2
   │   ├─ fetch('/assets/data/calculator-config.json')
   │   ├─ window.ITW_CALC_CONFIG = full config
   │   └─ window.ITW_LINE_CONFIG = lines['royal-caribbean']
   ├─ loadFXRates()
   ├─ setupCurrencySelector()
   ├─ loadBrandConfig()
   ├─ loadDataset()                             ← existing v1 flow
   │   ├─ fetch('/assets/data/lines/royal-caribbean.json')
   │   └─ Store.patch('economics', ...)
   ├─ initializeWorker()
   ├─ wireInputs()
   ├─ wireButtons()
   └─ scheduleCalculation()
       └─ ITW_MATH.compute(..., window.ITW_LINE_CONFIG)  ← NEW param
```

## Data Flow: Cruise Line Switch

```
1. User selects "Carnival" from dropdown
2. <select> onChange → window.ITW_switchCruiseLine('carnival')
3. switchCruiseLine():
   ├─ loadLineConfig('carnival')
   │   └─ window.ITW_LINE_CONFIG = lines['carnival']
   ├─ Update Store economics from config packages
   ├─ Rebuild dataset prices from config drinks
   ├─ Dispatch 'itw:line-changed' event
   │   └─ HTML listener updates page title
   ├─ scheduleCalculation()
   │   └─ ITW_MATH.compute(..., window.ITW_LINE_CONFIG)
   └─ announce('Switched to Carnival Cruise Line')
```

---

## Exact Changes: Line-by-Line Diff

> **Note:** Line numbers reference the **v1 original** file locations (before v2 headers
> were added). To find these in the v2 files, search for the code patterns shown.

### calculator-math-v2.js (3 changes, +50 lines from v1)

| v1 Line | v1 Code | v2 Code | Why |
|---------|---------|---------|-----|
| 383 | `compute(inputs, economics, dataset, vouchers, forcedPackage)` | `compute(..., lineConfig = null)` | Accept cruise line config |
| 406-412 | `// Pinnacle: 6/day` + `clamp(vouchers, 0, 6)` | `voucherMaxPerDay` from config tiers | Config-driven voucher max |
| 478 | `COFFEE_CARD_PUNCHES = 15` | `lineConfig?.coffeeCard?.punches \|\| 15` | Config-driven punches |

### calculator-v2.js (5 changes, +150 lines from v1)

| Section | Change | Why |
|---------|--------|-----|
| CONFIG.API | Added `calculatorConfig` URL | Config fetch endpoint |
| New section: "LINE CONFIG (v2)" | `loadLineConfig()` — 33 lines | Loads calculator-config.json, stores on window globals |
| New section: "LINE CONFIG (v2)" | `switchCruiseLine()` — 40 lines | Runtime line switching with economics/dataset update |
| scheduleCalculation() | Added `window.ITW_LINE_CONFIG` as 6th arg to compute() | Pass config to math engine |
| initialize() | Added `await loadLineConfig()` as first async call | Ensure config loads before calculations |

### calculator-ui-v2.js (2 changes, +48 lines from v1)

| Section | v1 Code | v2 Code | Why |
|---------|---------|---------|-----|
| renderChart() | `labels: ['À la carte', 'Soda', 'Refreshment', 'Deluxe']` | `config?.shortName \|\| 'Soda'` per package | Dynamic chart labels |
| updateComparisonTable() | Hardcoded icon, title, subtitle per package | `config?.emoji`, `config?.name`, `config?.includes` | Dynamic comparison table |

### package-selection-feature-v2.js (1 change, +34 lines from v1)

| Section | v1 Code | v2 Code | Why |
|---------|---------|---------|-----|
| calculateBreakEvenHTML() | `{ soda: 3.50, refresh: 4.50, deluxe: 13.00 }` | `lc?.packages?.{key}?.breakEvenDrink \|\| defaults` | Config-driven break-even |

### drink-calculatorv2.html (3 changes)

| Location | Change | Why |
|----------|--------|-----|
| After `<h1>` | NEW: Cruise line `<select>` dropdown with inline `<script>` | Line selector UI |
| `<h1>` tag | Added `id="calc-page-title"` | JS can update title on line switch |
| `<link canonical>` | Changed to `drink-calculatorv2.html` | Prevent duplicate content with v1 |

---

## Hardcoded Values Externalized to Config

| Value | Was (v1 location) | Now (config path) | Fallback |
|-------|-------------------|-------------------|----------|
| Coffee card punches = 15 | `calculator-math.js:478` | `lineConfig.coffeeCard.punches` | 15 |
| Voucher max per day = 6 | `calculator-math.js:411-412` | `max(lineConfig.loyalty.tiers[].vouchersPerDay)` | 6 |
| Soda break-even = $3.50 | `package-selection-feature.js:375` | `lineConfig.packages.soda.breakEvenDrink.price` | 3.50 |
| Refresh break-even = $4.50 | `package-selection-feature.js:376` | `lineConfig.packages.refreshment.breakEvenDrink.price` | 4.50 |
| Deluxe break-even = $13.00 | `package-selection-feature.js:377` | `lineConfig.packages.deluxe.breakEvenDrink.price` | 13.00 |
| Chart label "Soda" | `calculator-ui.js:282` | `lineConfig.packages.soda.shortName` | 'Soda' |
| Chart label "Refreshment" | `calculator-ui.js:282` | `lineConfig.packages.refreshment.shortName` | 'Refreshment' |
| Chart label "Deluxe" | `calculator-ui.js:282` | `lineConfig.packages.deluxe.shortName` | 'Deluxe' |
| Comparison title "Soda Package" | `calculator-ui.js:986` | `lineConfig.packages.soda.name` | 'Soda Package' |
| Comparison title "Refreshment Package" | `calculator-ui.js:994` | `lineConfig.packages.refreshment.name` | 'Refreshment Package' |
| Comparison title "Deluxe Package" | `calculator-ui.js:1002` | `lineConfig.packages.deluxe.name` | 'Deluxe Package' |
| Page title | `drink-calculator.html:419` | `lineConfig.meta.title` | 'Royal Caribbean...' |

---

## Hardcoded Values NOT YET Externalized

These values remain hardcoded in v2 and represent future work:

| Value | Location | Config Path (exists, not yet wired) |
|-------|----------|-------------------------------------|
| FAQ section (8 Q&A pairs) | `drink-calculatorv2.html` inline | `lineConfig.faq[]` |
| Policy warning box | `drink-calculatorv2.html` inline | `lineConfig.policies[]` |
| Quick Answer text | `drink-calculatorv2.html` inline | `lineConfig.quickAnswer` |
| Crown & Anchor tier descriptions | `drink-calculatorv2.html` inline | `lineConfig.loyalty.tiers[]` |
| JSON-LD structured data | `drink-calculatorv2.html` inline | `lineConfig.meta` |
| OpenGraph meta tags | `drink-calculatorv2.html <head>` | `lineConfig.meta` |
| "Royal Caribbean" in 50+ text references | `drink-calculatorv2.html` throughout | `lineConfig.name` |
| CONFIG.RULES.GRATUITY = 0.18 | `calculator-v2.js:55` | `lineConfig.rules.gratuity` (flows via loadDataset) |
| CONFIG.FALLBACK_DATASET | `calculator-v2.js:88-107` | `lineConfig.*` (partially flows via loadDataset) |
| DRINK_LABELS map | `calculator-v2.js:76-81` | `lineConfig.drinks[].label` |
| Quiz modal package mapping | `drink-calculatorv2.html` inline | Not yet in config |

**The config file already contains all this data.** The wiring work is on the HTML/JS side — reading config values and injecting them into the DOM dynamically. This is tracked as Phase 2 of the v2 rollout.

---

## Fallback Strategy

Every config lookup follows the pattern:

```javascript
window.ITW_LINE_CONFIG?.packages?.soda?.shortName || 'Soda'
```

If any of these are null/undefined:
- `window.ITW_LINE_CONFIG` — config fetch failed entirely
- `.packages` — malformed config
- `.soda` — cruise line doesn't have this package
- `.shortName` — field missing from entry

...the `||` fallback kicks in with the v1 hardcoded value. This means:

- **Config loads successfully:** All labels, prices, rules come from config
- **Config fails to load:** Calculator falls back to v1 behavior exactly
- **Config loads but is malformed:** Individual missing fields fall back independently

---

## Testing Checklist

### Functional Parity (v2 = v1 for Royal Caribbean)

- [ ] With Royal Caribbean selected, enter 2 adults, 7-day cruise
- [ ] Set 3 cocktails, 2 beers, 2 coffees per day
- [ ] Compare v1 and v2 results — should be identical:
  - Same à-la-carte total
  - Same Soda package cost
  - Same Refreshment package cost
  - Same Deluxe package cost
  - Same winner recommendation
  - Same break-even chart
- [ ] Test with vouchers: Diamond (4/day), verify savings match
- [ ] Test with coffee cards: 2 cards, verify punch calculation
- [ ] Test with sea day weighting: 4 sea / 3 port, 20% weight

### Config Integration

- [ ] Open browser console: `window.ITW_LINE_CONFIG` should be populated
- [ ] `window.ITW_LINE_CONFIG.name` should be "Royal Caribbean"
- [ ] `window.ITW_LINE_CONFIG.coffeeCard.punches` should be 15
- [ ] Chart labels should show "Soda", "Refreshment", "Deluxe" (from config)
- [ ] Comparison table titles should show full package names (from config)

### Failure Modes

- [ ] Rename `calculator-config.json` temporarily, reload page
- [ ] Calculator should still work (v1 fallback behavior)
- [ ] Console should show: `[Core v2] Failed to load calculator-config.json`
- [ ] Restore the config file, reload — should work normally

### Cruise Line Selector

- [ ] Dropdown should show "Royal Caribbean" selected
- [ ] Status text should show "More cruise lines coming soon"
- [ ] Dropdown should be focusable via keyboard (Tab)

---

## Future Work: Adding a New Cruise Line

1. Add entry to `calculator-config.json` (see CALCULATOR-CONFIG-GUIDE.md)
2. Wire remaining HTML sections to read from config:
   - FAQ section → `lineConfig.faq[]`
   - Policy warning → `lineConfig.policies[]`
   - Quick Answer → `lineConfig.quickAnswer`
   - Loyalty tiers → `lineConfig.loyalty.tiers[]`
   - Meta tags → `lineConfig.meta`
3. Replace inline "Royal Caribbean" text with dynamic `lineConfig.name`
4. Update JSON-LD structured data to be config-driven
5. Test: select new line, verify all sections update
6. Add to sitemap when ready for production

---

## Risk Assessment

| Risk | Mitigation |
|------|-----------|
| Config fetch fails | All fallbacks return v1 hardcoded values |
| Config is malformed JSON | fetch().json() throws, caught by try/catch, uses fallbacks |
| Cruise line has fewer packages | Unused package keys simply don't appear in comparison |
| Cruise line has no loyalty program | `loyalty.enabled: false` — voucher section hidden |
| Cruise line has no coffee card | `coffeeCard.enabled: false` — coffee card section hidden |
| v2 breaks while v1 works | v1 is completely untouched — users can always use drink-calculator.html |

---

*"Be careful, not clever. Careful means: verified, documented, reversible, honest."*

*Soli Deo Gloria*
