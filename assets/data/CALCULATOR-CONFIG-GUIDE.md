# Calculator Config Guide — Multi-Cruise-Line Architecture

**File:** `assets/data/calculator-config.json`
**Version:** 1.0
**Last Updated:** 2026-04-13

This file is the single source of truth for all cruise-line-specific data in the drink calculator v2. Adding a new cruise line means adding a new entry to this JSON — no code changes required.

---

## How to Add a New Cruise Line

1. Copy the `royal-caribbean` block in `calculator-config.json`
2. Change the key and `id` to your new line's slug (e.g., `"carnival"`)
3. Update all values: packages, prices, rules, loyalty, drinks, policies, FAQ
4. Save the file — the cruise line selector auto-populates from it
5. Test: select the new line in the dropdown and verify calculations

---

## Field Reference

### Top-Level Fields

| Field | Type | Description |
|-------|------|-------------|
| `schemaVersion` | string | Config format version |
| `lastUpdated` | string | ISO date of last update |
| `defaultLine` | string | Which line loads by default |
| `lines` | object | Map of cruise line ID to config |

### Per-Line Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique slug (e.g., `royal-caribbean`) |
| `name` | string | Yes | Display name (e.g., `Royal Caribbean`) |
| `shortName` | string | Yes | Short name for tight UI spaces |
| `slug` | string | Yes | URL-safe identifier |
| `pageUrl` | string | No | Link to the cruise line's page on the site |
| `color` | string | No | Brand color hex code |

### `packages` — Beverage Package Definitions

Each cruise line defines its available packages. Keys should use these standard IDs when possible: `soda`, `refreshment`, `deluxe`. For lines with different package structures (e.g., Carnival's "CHEERS!"), use descriptive keys.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Full package name (e.g., "Deluxe Beverage Package") |
| `shortName` | string | Yes | Short label for charts/buttons |
| `emoji` | string | No | Icon for UI display |
| `priceMid` | number | Yes | Typical pre-cruise price per person per day (USD) |
| `priceMin` | number | No | Lowest observed price |
| `priceMax` | number | No | Highest observed price |
| `priceNote` | string | No | Human-readable price range with gratuity note |
| `includes` | string | Yes | One-line summary of what's included |
| `includesList` | array | No | Bullet-point list of inclusions |
| `breakEvenDrink` | object | Yes | `{ "name": "cocktails", "price": 13.00 }` — the typical drink used for break-even messaging |

### `coffeeCard` — Coffee Card / Prepaid Drinks

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `enabled` | boolean | Yes | Whether this line offers a coffee card |
| `name` | string | Yes | Display name |
| `price` | number | Yes | One-time purchase price |
| `punches` | number | Yes | Number of drinks per card (RCL = 15) |
| `punchesPerSmall` | number | No | Punches for a small drink (default: 1) |
| `punchesPerLarge` | number | No | Punches for a large/iced drink (default: 2) |
| `shareable` | boolean | No | Whether the card can be shared among cabin guests |
| `note` | string | No | Important restrictions |

### `rules` — Calculation Rules

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `gratuity` | number | Yes | Gratuity rate as decimal (0.20 = 20%) |
| `deluxeCap` | number | Yes | Max drink price covered by the top package (RCL = $14) |
| `allAdultsSamePackage` | boolean | Yes | Whether all adults must buy the same package |
| `allAdultsPolicyDate` | string | No | When the policy took effect |
| `minorsForceRefreshment` | boolean | Yes | Whether minors are forced to buy a specific package |
| `adultAge` | number | Yes | Age threshold for "adult" (RCL = 21) |
| `alcoholAge` | number | Yes | Legal drinking age onboard |
| `usPortAlcoholRestriction` | boolean | No | Whether US port departures restrict minors from alcohol |
| `deluxeDailyLimit` | number | No | Max drinks per day under the top package (if enforced) |

### `loyalty` — Loyalty Program / Free Drink Vouchers

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `enabled` | boolean | Yes | Whether this line has loyalty drink vouchers |
| `programName` | string | Yes | Program name (e.g., "Crown & Anchor Society") |
| `voucherValue` | number | Yes | Dollar value per voucher |
| `voucherNote` | string | No | Explanation text for the UI |
| `tiers` | array | Yes | Array of tier objects |

**Tier object:**

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Tier name (e.g., "Diamond") |
| `nightsMin` | number | Minimum cruise nights for this tier |
| `nightsMax` | number | Maximum cruise nights for this tier |
| `vouchersPerDay` | number | Free drink vouchers per day at this tier |

### `drinks` — Individual Drink Prices

Array of drink objects. Each drink that appears in the calculator must be listed here.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique drink ID (must match the JS DRINK_KEYS) |
| `name` | string | Yes | Display name |
| `label` | string | Yes | Detailed label (e.g., "Wine (glass)") |
| `price` | number | Yes | Typical à-la-carte price |
| `rangeMin` | number | No | Lowest observed price |
| `rangeMax` | number | No | Highest observed price |
| `category` | string | Yes | `"alcoholic"` or `"non-alcoholic"` |
| `icon` | string | No | Emoji icon |

### `sets` — Which Drinks Each Package Covers

Maps package keys to arrays of drink IDs that package covers.

**IMPORTANT:** The `sets` keys must use `refresh` (not `refreshment`) and `alcoholic` (not `alcohol`) to match the math engine's internal naming convention.

```json
"sets": {
  "soda": ["soda"],
  "refresh": ["soda", "coffee", "teaprem", ...],
  "deluxe": ["soda", "coffee", ..., "beer", "wine", "cocktail", "spirits"],
  "alcoholic": ["beer", "wine", "cocktail", "spirits"]
}
```

### `policies` — Policy Warnings

Array of policy objects displayed as warnings in the calculator UI.

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique policy ID |
| `severity` | string | `"critical"`, `"warning"`, or `"info"` |
| `icon` | string | Emoji for the warning box |
| `title` | string | Bold heading |
| `text` | string | Full policy text |

### `faq` — FAQ Questions and Answers

Array of FAQ objects for the page's FAQ section and FAQPage JSON-LD.

| Field | Type | Description |
|-------|------|-------------|
| `question` | string | The question text |
| `answer` | string | The answer text |

### `meta` — Page Metadata

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Full page title for the browser tab |
| `description` | string | Meta description for SEO |
| `ogTitle` | string | OpenGraph title |

---

## How the Config Flows Through the Calculator

```
1. calculator-v2.js loads calculator-config.json on init
2. Active line stored on window.ITW_LINE_CONFIG
3. calculator-v2.js updates Store economics from config
4. calculator-math-v2.js uses lineConfig for:
   - Coffee card punches
   - Voucher max per day
   - (All other values flow through economics/dataset)
5. calculator-ui-v2.js reads window.ITW_LINE_CONFIG for:
   - Chart labels (package names)
   - Comparison table titles and subtitles
6. package-selection-feature-v2.js reads config for:
   - Break-even drink prices and names
7. drink-calculatorv2.html line selector dispatches
   itw:line-changed event when user picks a different line
```

---

## Adding a Second Cruise Line (Example: Carnival)

```json
"carnival": {
  "id": "carnival",
  "name": "Carnival Cruise Line",
  "shortName": "Carnival",
  "slug": "carnival",
  "color": "#004B8D",
  "packages": {
    "cheers": {
      "name": "CHEERS! Beverage Package",
      "shortName": "CHEERS!",
      "priceMid": 59.95,
      "includes": "Beer, wine, cocktails, spirits up to $20, plus soda, juice, specialty coffee",
      "breakEvenDrink": { "name": "cocktails", "price": 12.00 }
    }
  },
  "coffeeCard": { "enabled": false },
  "rules": {
    "gratuity": 0.18,
    "deluxeCap": 20.00,
    "allAdultsSamePackage": true,
    "adultAge": 21,
    "alcoholAge": 21
  },
  "loyalty": { "enabled": false, "programName": "VIFP Club", "tiers": [] },
  "drinks": [ ... ],
  "sets": { ... },
  "policies": [ ... ],
  "faq": [ ... ]
}
```

**Note:** When a cruise line has a single all-inclusive package (like Carnival's CHEERS!), the calculator comparison simplifies to: à-la-carte vs. CHEERS!. The math engine handles this — unused package keys simply don't appear.

---

*Soli Deo Gloria*
