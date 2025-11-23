# Multi-Brand Data Contracts

**Version:** v3.010.300
**Status:** Active in production
**Purpose:** Define data structures supporting multiple cruise lines

---

## Overview

In v3.010.300, data contracts expanded beyond Royal Caribbean-only to support **multiple cruise brands** (Royal Caribbean, Carnival, MSC) within a unified data model.

---

## Fleet Index Schema (Multi-Brand)

**File:** `/assets/data/fleet_index.json`
**Version:** v2.300
**Size:** ~158KB

### Structure
```json
{
  "version": "2.300",
  "generated": "2025-09-13T18:11:48Z",
  "cruise_lines": [
    {
      "name": "Royal Caribbean",
      "parent_company": "Royal Caribbean Group",
      "slug": "royal-caribbean",
      "ships": [
        {
          "name": "Icon of the Seas",
          "slug": "icon-of-the-seas",
          "category": "Current",
          "status": "active",
          "year_built_or_entered": "2024",
          "gt": "250,800",
          "capacity": "5,610",
          "crew": "2,350",
          "notes": "Icon-class flagship."
        }
      ]
    },
    {
      "name": "Carnival Cruise Line",
      "slug": "carnival",
      "ships": [...]
    },
    {
      "name": "MSC Cruises",
      "slug": "msc",
      "ships": [...]
    }
  ]
}
```

### Fields

**Top Level:**
- `version` (string): Data version
- `generated` (ISO 8601): Generation timestamp
- `cruise_lines` (array): Array of cruise line objects

**Cruise Line Level:**
- `name` (string): Full cruise line name
- `parent_company` (string, optional): Parent corporation
- `slug` (string): URL-safe identifier
- `ships` (array): Ships for this line

**Ship Level:**
- `name` (string): Full ship name
- `slug` (string): URL-safe identifier
- `category` (string): "Current", "Past", "Future"
- `status` (string): "active", "historical", "under-construction"
- `year_built_or_entered` (string): Year or range
- `gt` (string): Gross tonnage (comma-formatted)
- `capacity` (string): Guest capacity (comma-formatted)
- `crew` (string, optional): Crew size
- `notes` (string, optional): Additional context

---

## Brand-Specific Restaurant Data

### Royal Caribbean
**File:** `/assets/data/rc-restaurants.json` (v3.001+ pattern)

### Carnival
**File:** `/assets/data/Carnival-restaurants.json`

### MSC
**File:** `/assets/data/MSC-restaurants.json`

**Pattern:** Each line maintains separate restaurant data files, merged at runtime for search/filter.

---

## Brands Configuration

**File:** `/assets/data/brands.json`

```json
{
  "brands": [
    {
      "name": "Royal Caribbean",
      "slug": "royal-caribbean",
      "parent": "Royal Caribbean Group",
      "logo": "/assets/brands/rcl-logo.png",
      "primary": true
    },
    {
      "name": "Carnival Cruise Line",
      "slug": "carnival",
      "parent": "Carnival Corporation",
      "logo": "/assets/brands/carnival-logo.png",
      "primary": false
    },
    {
      "name": "MSC Cruises",
      "slug": "msc",
      "parent": "MSC Group",
      "logo": "/assets/brands/msc-logo.png",
      "primary": false
    }
  ]
}
```

**Fields:**
- `primary` (boolean): Primary focus brand (Royal Caribbean = true)

---

## Page URL Patterns

### Ships
**Royal Caribbean:** `/ships/rcl/[ship-slug].html`
**Carnival:** `/ships/carnival/[ship-slug].html`
**MSC:** `/ships/msc/[ship-slug].html`

### Cruise Lines
`/cruise-lines/[line-slug].html`

Example: `/cruise-lines/royal-caribbean.html`

---

## Backward Compatibility

All v3.001+ single-brand patterns remain valid for Royal Caribbean:

```json
{
  "ships": [
    {"name": "...", "slug": "...", ...}
  ]
}
```

Multi-brand structure is **additive** - old loaders work with nested `cruise_lines[0].ships` if they walk the object tree.

---

## Loader Pattern

### JavaScript Example
```javascript
function loadFleetIndex() {
  fetch('/assets/data/fleet_index.json')
    .then(r => r.json())
    .then(data => {
      // Multi-brand aware
      data.cruise_lines.forEach(line => {
        console.log(`${line.name}: ${line.ships.length} ships`);
        line.ships.forEach(ship => {
          // Process ship
        });
      });
    });
}
```

### Filter by Brand
```javascript
const rcShips = data.cruise_lines
  .find(line => line.slug === 'royal-caribbean')
  .ships;
```

---

## Precache Manifest Integration

**File:** `/precache-manifest.json` (v13.0.0)

```json
{
  "data": [
    { "url": "/assets/data/lines/royal-caribbean.json", "priority": "critical" },
    { "url": "/assets/data/Carnival-restaurants.json", "priority": "normal" },
    { "url": "/assets/data/MSC-restaurants.json", "priority": "normal" },
    { "url": "/assets/data/fleet_index.json", "priority": "high" },
    { "url": "/assets/data/brands.json", "priority": "high" }
  ]
}
```

**Strategy:** Primary brand (RC) at critical priority, others at normal

---

## Search Integration

Multi-brand search requires merging datasets:

```javascript
async function loadAllRestaurants() {
  const [rc, carnival, msc] = await Promise.all([
    fetch('/assets/data/rc-restaurants.json').then(r => r.json()),
    fetch('/assets/data/Carnival-restaurants.json').then(r => r.json()),
    fetch('/assets/data/MSC-restaurants.json').then(r => r.json())
  ]);

  return [
    ...rc.venues.map(v => ({...v, brand: 'Royal Caribbean'})),
    ...carnival.venues.map(v => ({...v, brand: 'Carnival'})),
    ...msc.venues.map(v => ({...v, brand: 'MSC'}))
  ];
}
```

---

## Future Expansion

To add a new cruise line:

1. Add entry to `cruise_lines` array in `fleet_index.json`
2. Create brand-specific restaurant file if needed
3. Add brand to `brands.json`
4. Create `/cruise-lines/[slug].html` page
5. Update precache manifest
6. Update search loader

---

**Soli Deo Gloria** ✝️
