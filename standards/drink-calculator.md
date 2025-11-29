# Royal Caribbean Drink Calculator - Technical Standards

> "Whatever you do, work at it with all your heart, as working for the Lord"
> — Colossians 3:23

## Overview

The Drink Calculator helps cruisers determine the best beverage package value based on their drinking habits. It compares four options:

1. **À La Carte** - Pay per drink as you go
2. **Soda Package** - Fountain sodas only
3. **Refreshment Package** - All non-alcoholic specialty drinks
4. **Deluxe Beverage Package** - Everything including alcohol

---

## Architecture

### File Structure

```
assets/js/
├── calculator.js           # Core engine, state management, initialization
├── calculator-math.js      # Pure math functions, cost calculations
├── calculator-ui.js        # UI rendering, presets, accessibility
├── calculator-worker.js    # Web Worker for background calculations
├── package-selection-feature.js  # Clickable package cards, delta comparison
└── modules/config.js       # Configuration constants
```

### Version Numbers

- **calculator.js**: 1.003.000
- **calculator-math.js**: 1.008.000 (added packageBreakdown)
- **calculator-ui.js**: 1.007.000 (transparent breakdown display)
- **package-selection-feature.js**: 1.005.000 (breakdown in delta comparison)

---

## Core Concepts

### Package Coverage

Each package covers specific drink categories:

| Package | Covers | Does NOT Cover |
|---------|--------|----------------|
| **Soda** | Fountain sodas (Coca-Cola Freestyle) | Coffee, juice, mocktails, alcohol, bottled water, energy drinks |
| **Refreshment** | Sodas + specialty coffee + juice + mocktails + bottled water + energy drinks | Beer, wine, cocktails, spirits |
| **Deluxe** | Everything up to $14 per drink | Drinks over $14 (premium spirits, rare wines) |

### Cost Calculation Formula

For any package, the **TRUE TOTAL COST** is:

```
TOTAL = Fixed Package Cost + Uncovered Drinks À La Carte

Where:
  Fixed Package Cost = (daily price) × (1 + gratuity) × (days) × (people)
  Uncovered Drinks = cost of drinks NOT included in the package
```

#### Example: Soda Package

```
Soda Package Daily Rate: $10.99
Gratuity: 18%
Days: 7
Adults: 2

Fixed Package Cost = $10.99 × 1.18 × 7 × 2 = $181.55

If user drinks:
  - 5 sodas/day (covered by package)
  - 2 beers/day ($8.50 each, NOT covered)

Uncovered Drinks = $8.50 × 2 × 7 = $119.00

TOTAL = $181.55 + $119.00 = $300.55
```

This is **correct behavior** - the soda package doesn't cover beer, so beer is paid à la carte.

### Why Totals Increase When Adding Drinks

When you add drinks to the calculator:

1. **If the drink IS covered** by the package → Total stays the same
2. **If the drink is NOT covered** by the package → Total increases

This is intentional! The calculator shows the TRUE cost of each option, including drinks you'd have to pay for separately.

### Package Breakdown (v1.008.000)

The calculator now exposes a transparent breakdown for each package:

```javascript
results.packageBreakdown = {
  soda: {
    fixedCost: 181.55,      // Package price (fixed, doesn't change with drinks)
    uncoveredCost: 119.00,  // Drinks NOT covered by package (paid à la carte)
    total: 300.55,          // fixedCost + uncoveredCost
    dailyRate: 10.99,       // Per-person-per-day package price
    days: 7,
    people: 2
  },
  refresh: { ... },
  deluxe: { ... }
}
```

This allows the UI to display:
```
Soda Package: $181.55 (fixed)
+ Uncovered drinks: +$119.00
= Total: $300.55
```

---

## Package Prices (Fixed, Not Variable)

The package prices themselves are FIXED:

| Package | Default Daily Rate | Editable Range |
|---------|-------------------|----------------|
| Coffee Card | $31.00 (one-time) | $5 - $150 |
| Soda | $10.99/day | $5 - $150 |
| Refreshment | $34.00/day | $5 - $150 |
| Deluxe | $85.00/day | $5 - $150 |

Users can edit these prices inline to match current Royal Caribbean pricing.

### Where Package Prices Are Stored

```javascript
// In store.economics.pkg
{
  pkg: {
    coffee: 31.00,   // Coffee card price
    soda: 10.99,     // Soda daily rate
    refresh: 34.00,  // Refreshment daily rate
    deluxe: 85.00    // Deluxe daily rate
  }
}
```

---

## State Management

### Store Structure

```javascript
{
  version: '1.003.000',
  dataset: { ... },      // Drink prices from JSON
  brand: { ... },        // Brand configuration
  inputs: {
    days: 7,
    seaDays: 3,
    seaApply: true,
    seaWeight: 20,
    adults: 2,
    minors: 0,
    coffeeCards: 0,
    coffeePunches: 0,
    voucherAdult: 0,
    voucherMinor: 0,
    drinks: {
      soda: 0, coffeeSmall: 0, coffeeLarge: 0,
      teaprem: 0, freshjuice: 0, mocktail: 0,
      energy: 0, milkshake: 0, bottledwater: 0,
      beer: 0, wine: 0, cocktail: 0, spirits: 0
    }
  },
  economics: {
    pkg: { coffee: 31, soda: 10.99, refresh: 34, deluxe: 85 },
    grat: 0.18,
    deluxeCap: 14.0
  },
  results: { ... },      // Calculation output
  ui: {
    fallbackBanner: false,
    fxStale: false,
    chartReady: false,
    forcedPackage: null  // User-selected package override
  }
}
```

### Store API

```javascript
// Get state
const state = window.ITW.store.get();
const days = window.ITW.store.get('inputs.days');

// Update state
window.ITW.store.patch('inputs.days', 10);
window.ITW.store.set({ inputs: { ... } });

// Subscribe to changes
window.ITW.store.subscribe('results', (newResults, fullState) => {
  // React to calculation updates
});
```

---

## Math Engine (calculator-math.js)

### Main Compute Function

```javascript
function compute(inputs, economics, dataset, vouchers = null, forcedPackage = null) {
  // Returns:
  return {
    bars: {
      alc: { min, mean, max },     // À la carte total
      soda: { min, mean, max },    // Soda package total (incl. uncovered)
      refresh: { min, mean, max }, // Refreshment total (incl. uncovered)
      deluxe: { min, mean, max }   // Deluxe total (incl. overcap)
    },
    winnerKey: 'refresh',          // Best value option
    winnerLabel: 'Refreshment Package',
    perDay: 45.50,                 // À la carte daily cost
    trip: 318.50,                  // À la carte trip total
    groupRows: [ ... ],            // Adults/minors breakdown
    categoryRows: [ ... ],         // Drink-by-drink costs
    nudges: [ ... ],               // Breakeven hints
    healthNote: { ... },           // CDC guidelines warning
    ariaAnnouncement: '...'        // Screen reader text
  };
}
```

### Package Forcing

Users can click package cards to see "what if I chose this package instead?":

```javascript
// In store.ui.forcedPackage
window.ITW.store.patch('ui.forcedPackage', 'refresh');

// When forcedPackage is set:
// - That package becomes the "winner" regardless of cost
// - Delta comparison shows difference from recommended
```

---

## Two-Winner System

When minors are present, the calculator shows two recommendations:

1. **Adult Winner** - Can be any option (soda, refresh, deluxe, or à la carte)
2. **Minor Winner** - Only soda or refreshment (minors can't buy deluxe)

### Royal Caribbean Policy

**When adults choose Deluxe, ALL minors MUST purchase Refreshment.**

This is enforced by the calculator:

```javascript
if (adultWinner.key === 'deluxe' && minors > 0) {
  minorWinner = 'refresh';
  minorForced = true;
  minorForcedReason = 'Required when adults purchase Deluxe';
}
```

---

## Vouchers

Crown & Anchor loyalty members receive free drink vouchers:

| Tier | Vouchers/Day |
|------|-------------|
| Diamond | 4 |
| Diamond+ | 5 |
| Pinnacle | 6 |

### Voucher Application Logic

Vouchers are applied to the **most expensive drinks first** (up to the $14 deluxe cap):

```javascript
// Sort drinks by price descending
const sortedVoucherable = drinks.filter(d => d.price <= 14)
                                .sort((a, b) => b.price - a.price);

// Apply vouchers to most expensive first
// This maximizes savings!
```

---

## Coffee Card System

### Punch System

- **Small coffee**: 1 punch
- **Large/iced coffee**: 2 punches
- **Card capacity**: 15 punches

### Optimization

The calculator prioritizes using punches for **large coffees first** (saves more money per punch).

---

## Gentle Nudges

When close to a package breakeven point, the calculator suggests:

```javascript
{
  package: 'refresh',
  message: 'Add 2 specialty coffees per day to break even with Refreshment package',
  icon: '☕',
  priority: 2
}
```

---

## Health Notes

CDC guidelines trigger warnings at certain alcohol consumption levels:

- **Moderate** (2-4 drinks/day): Gentle reminder
- **High** (4+ drinks/day): Health advisory

---

## UI Layer (calculator-ui.js)

### Rendering Flow

```
User Input → store.patch() → scheduleCalculation() → compute()
    → store.patch('results', ...) → renderAll()
```

### Render Functions

| Function | Purpose |
|----------|---------|
| `renderBanner()` | Best value badge and savings |
| `renderTotals()` | Per-day and trip totals |
| `renderChart()` | Chart.js bar chart |
| `renderChartTable()` | Accessible table for screen readers |
| `renderPackageCards()` | Winner badges on package cards |
| `renderNudges()` | Breakeven suggestions |
| `renderHealthNote()` | CDC guidelines warning |
| `renderCostSummary()` | Full cost comparison card |

### Presets

Quick-apply drink patterns:

```javascript
PRESETS = {
  light: { drinks: { soda: 2, beer: 1, wine: 1, cocktail: 0.5, ... } },
  moderate: { ... },
  party: { ... },
  coffee: { ... },
  nonalc: { ... },
  solo: { ... },
  sodadrinker: { ... }
};
```

---

## Package Selection Feature (package-selection-feature.js)

### Clickable Package Cards

Users can click any package card to see costs calculated as if they chose that package.

### Delta Comparison

When viewing an alternative package:

```javascript
const recCost = bars[recommendedKey]?.mean;
const selectedCost = bars[selectedPackage]?.mean;
const delta = selectedCost - recCost;

// Shows: "+$26.00 more than Soda Package (+$3.71/day)"
```

### Break-Even Drinks

Calculates how many more drinks needed to justify an upgrade:

```javascript
const drinksNeeded = Math.ceil(delta / drinkPrice);
// Shows: "You'd need about 4 more cocktails to make this worth it"
```

---

## Accessibility Commitment

The calculator is fully accessible:

- **ARIA live regions** for dynamic announcements
- **Keyboard navigation** for all interactive elements
- **Focus management** in modals
- **Screen reader table** as chart alternative
- **44x44px touch targets** for mobile steppers

---

## Security Features

### Input Sanitization

All user input is sanitized:

```javascript
Security.sanitizeNumber(input, min, max);
Security.sanitizeString(input, maxLength);
```

### Storage TTL Protection

- Maximum age: 90 days
- Future timestamps rejected
- Version migration on update

### Prototype Pollution Prevention

`hydrateAllowlist()` only accepts known keys when loading from storage.

---

## Event System

### Custom Events

```javascript
// Emitted after calculation completes
document.dispatchEvent(new CustomEvent('itw:calc-updated'));

// Listen for updates
document.addEventListener('itw:calc-updated', () => {
  // Calculation finished
});
```

---

## Global API

```javascript
window.ITW = {
  version: '1.003.000',
  config: { ... },
  store: { get, set, patch, subscribe },
  formatMoney: (amount) => '$123.45',
  getCurrency: () => 'USD',
  setCurrency: (code) => { ... },
  scheduleCalc: () => { ... },
  resetInputs: () => { ... },
  shareScenario: () => { ... },
  updatePackagePrice: (key, price) => { ... },
  parseQty: (value) => { ... },
  announce: (message) => { ... }
};
```

---

## Common Issues & Solutions

### "Package costs go up when I add drinks"

**Expected behavior.** The displayed total includes both:
1. Fixed package cost
2. Uncovered drinks paid à la carte

Only drinks covered by the package are "free." Other drinks are added on top.

### "Deluxe shows higher cost than expected"

The Deluxe package covers drinks up to $14. Premium drinks (rare wines, top-shelf spirits) exceeding this cap are charged the difference.

### "Minors forced to Refreshment"

Royal Caribbean policy: When adults purchase Deluxe, all minors in the stateroom must purchase Refreshment (not Soda).

---

## Data Sources

### Drink Prices

Loaded from `/assets/data/lines/royal-caribbean.json`:

```javascript
{
  prices: {
    soda: 2.00,
    coffeeSmall: 4.50,
    coffeeLarge: 4.50,
    beer: 8.50,
    wine: 11.00,
    cocktail: 13.00,
    spirits: 10.00
    // ...
  },
  sets: {
    soda: ['soda'],
    refresh: ['soda', 'coffeeSmall', 'coffeeLarge', 'teaprem', ...],
    alcoholic: ['beer', 'wine', 'cocktail', 'spirits']
  }
}
```

### Fallback Pricing

If the JSON fails to load, embedded fallback prices are used.

---

## Testing Checklist

- [ ] Package prices remain fixed when changing drink quantities
- [ ] Uncovered drinks correctly add to package totals
- [ ] Two-winner system shows when minors > 0
- [ ] Minors forced to Refreshment when adults choose Deluxe
- [ ] Vouchers apply to most expensive drinks first
- [ ] Coffee card punches prioritize large coffees
- [ ] Delta comparison shows correct difference
- [ ] Break-even drinks calculation is accurate
- [ ] Presets apply correct drink values
- [ ] Share URL encodes all non-default values
- [ ] Screen reader announcements work

---

*Soli Deo Gloria*
