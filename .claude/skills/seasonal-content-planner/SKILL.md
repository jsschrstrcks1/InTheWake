---
name: seasonal-content-planner
description: "Plans content updates before each cruise season. Knows Alaska/Caribbean/Mediterranean schedules, identifies stale content per season, and generates task lists tied to the calendar."
version: 1.0.0
---

# Seasonal Content Planner

> The right content at the right time for the right season.

## Purpose

Cruise content is seasonal. Alaska ports go stale in winter. Caribbean ports need updating before fall. This skill knows the calendar, identifies what needs updating before each season, and generates prioritized task lists.

## When to Fire

- On `/season` command
- When planning seasonal updates
- At the start of each quarter
- When content-freshness flags seasonal pages

## Cruise Seasons

### Alaska (May–September)
**Update by April 15:**
- All Alaska port pages (Juneau, Ketchikan, Skagway, etc.)
- Glacier excursion content
- Cold-weather packing lists
- Alaska-specific ship deployments
- Wildlife and whale watching timing

### Caribbean (October–April)
**Update by September 15:**
- All Caribbean port pages
- Hurricane season awareness (June–November overlap)
- Warm-weather packing content
- Caribbean-specific ship deployments
- Beach and water excursion content

### Mediterranean (April–October)
**Update by March 15:**
- European port pages
- Documentation requirements (passports, visas, ETIAS)
- Shore excursion logistics (tender ports, walking distances)
- Mediterranean-specific ship repositioning
- Cultural etiquette and tipping guides

### Repositioning (April/May, October/November)
**Update by March and September:**
- Transatlantic crossing content
- Repositioning cruise deals and routes
- Sea day planning content (no port = long at-sea days)

## Seasonal Task Generator

```
## Seasonal Update Plan — [Season] [Year]

### Critical (Update Before Season Opens)
| Page | Last Updated | Content Type | Priority |
|------|-------------|-------------|----------|
| ports/juneau.html | 2025-11-03 | Port guide | P0 — 5 months stale |

### Important (Update Within First Month)
| Page | Last Updated | Content Type | Priority |
|------|-------------|-------------|----------|

### Nice to Have (Update When Possible)
| Page | Last Updated | Content Type | Priority |
|------|-------------|-------------|----------|

### Ship Deployment Changes
- [Ship] moved from [route] to [route] for [season]

### New Content Needed
- [New port added to itineraries]
- [New ship launching this season]
```

## Integration

- **content-freshness** — identifies stale pages. seasonal-content-planner adds calendar context to prioritize them.
- **port-content-builder** — generates/updates the port pages identified as stale
- **cognitive-memory** — remembers what was updated last season
- **link-integrity** — seasonal route changes may break cross-references

---

*Soli Deo Gloria* — Serve travelers well by keeping content current.
