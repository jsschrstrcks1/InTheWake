# POI Land-Validation Plan

**Date:** 2026-03-25
**Soli Deo Gloria**

---

## Problem Statement

The site has 1,477 POIs across 168 ports. Almost none of these should have coordinates in the water — beaches should point to the sand, terminals to the dock, landmarks to the building. Currently there is no validation that POI coordinates are on land.

## POI Data Overview

| Metric | Value |
|--------|-------|
| Total POIs | 1,477 |
| Ports with POI data | 168 (of 387) |
| Ports with 10+ POIs | 56 |
| Ports with zero POIs | 219 |
| All POIs have lat/lon | Yes |

### POI Type Distribution (top 10)

| Type | Count | Should Be On Land? |
|------|-------|-------------------|
| landmark | 316 | Yes |
| nature | 208 | Usually (some islands/fjords OK in water) |
| port | 183 | On dock/pier, not in harbor water |
| beach | 149 | On sand/shore, not in ocean |
| attraction | 145 | Yes |
| district | 85 | Yes |
| museum | 75 | Yes |
| scenic | 66 | Usually (viewpoints are on land) |
| neighborhood | 63 | Yes |
| cultural | 37 | Yes |

### Known Suspicious Coordinates

15 POIs have low-precision coordinates (1 decimal place or fewer), likely estimated rather than verified:
- `inside-passage-route`: 56, -132 (integer coordinates — placeholder)
- `kuala-lumpur-port-klang`: 3, 101.4 (0 decimal lat)
- Several Alaskan fjord/nature POIs with 1-decimal precision

---

## Validation Strategy: 3-Layer Approach

### Layer 1: Geometric Sanity Checks (Offline, Immediate)

Script-based checks that require no external API:

1. **Distance from port center** — Each port has known coordinates (from map config). If a POI is more than 100km from its port center, flag it. Most cruise port POIs should be within 30km.

2. **Coordinate precision** — Flag POIs with fewer than 2 decimal places (accuracy worse than ~1km). These are likely estimated.

3. **Lat/Lon swap detection** — Check if swapping lat and lon produces a position closer to the port center. Common data entry error.

4. **Duplicate coordinate detection** — Multiple POIs at exact same lat/lon suggests copy-paste errors.

5. **Out-of-range checks** — Lat must be -90 to 90, lon must be -180 to 180.

### Layer 2: Water/Land Classification (API-Based)

Use reverse geocoding to determine if each coordinate is on land or water:

**Option A: OpenStreetMap Nominatim (Free, Rate-Limited)**
- Rate limit: 1 request/second
- 1,477 POIs = ~25 minutes
- Returns address data — if no address found, likely in water
- Usage: `https://nominatim.openstreetmap.org/reverse?lat=X&lon=Y&format=json`

**Option B: Overpass API Land/Water Query (Free, Bulk)**
- Query OSM for `natural=water` or `natural=coastline` polygons
- Check if point falls within a water polygon
- More complex but faster for bulk validation

**Option C: Natural Earth Land Polygon (Offline)**
- Download 110m or 50m resolution land polygon shapefile
- Point-in-polygon test for each POI
- Requires geospatial library (turf.js or similar)
- Most reliable, no rate limits, fully offline

**Recommended: Option C** (Natural Earth) for initial validation, with Option A (Nominatim) for spot-checking flagged POIs.

### Layer 3: Port-Specific Semantic Validation

Beyond land/water, validate that POIs make sense for their port:

1. **Beach POIs** — Should be within 500m of a coastline
2. **Port/Terminal POIs** — Should be within 200m of a harbor/dock
3. **Museum/Landmark POIs** — Should be in a populated area
4. **Nature POIs** — Can be remote but should still be on land (unless explicitly marine)

**Allowlist for water-adjacent POIs:**
- `marina` type — may have coordinates at dock/water edge
- `harbor` type — similar
- `island` type — center of island is on land, but small islands may be OK
- `scenic` type for fjords — can be viewpoints looking at water

---

## Implementation Plan

### Phase A: Build Validation Script (1 session)

Create `scripts/validate-poi-coordinates.js`:

```
Input: assets/data/maps/poi-index.json
Output:
  - List of POIs flagged for review (with reason)
  - Categorized as: BLOCKING (definitely wrong), WARNING (probably wrong), INFO (low precision)
  - JSON report file for tracking

Checks:
  1. Precision check (< 2 decimal places)
  2. Port distance check (> 50km from port center)
  3. Lat/lon swap detection
  4. Duplicate coordinates
  5. Known placeholder patterns (0,0 or round numbers)
```

### Phase B: Land/Water Check with Natural Earth (1-2 sessions)

1. Download Natural Earth 50m land polygon: `ne_50m_land.geojson`
2. Use `@turf/boolean-point-in-polygon` to test each POI
3. Flag any POI NOT inside a land polygon as WATER
4. Manual review of WATER-flagged POIs:
   - Some are legitimately water-adjacent (marina, dock)
   - Others need coordinate corrections

### Phase C: Coordinate Correction (Ongoing)

For each flagged POI:
1. Look up the actual location on OpenStreetMap
2. Get correct coordinates from OSM
3. Update poi-index.json
4. Re-validate

### Phase D: Integration with Port Page Validator

Add POI coordinate validation to `admin/validate-port-page-v2.js`:
- BLOCKING: POI coordinate more than 100km from port
- BLOCKING: POI coordinate has 0 decimal places
- WARNING: POI coordinate is in water (if Natural Earth data available)
- WARNING: POI coordinate has fewer than 3 decimal places
- INFO: POI coordinate more than 50km from port

---

## Port Center Coordinates Source

Each port page has map initialization with center coordinates. These can be extracted from:
1. The port page HTML (Leaflet `.setView([lat, lon], zoom)` calls)
2. The map manifest files in `assets/data/maps/`
3. The poi-index.json `_meta.counts` entries (need to add center coords)

### Extraction approach:
```bash
# Extract port center coordinates from HTML map init
grep -oP "setView\(\[([0-9.-]+),\s*([0-9.-]+)\]" ports/*.html
```

Or from map manifests:
```bash
ls assets/data/maps/*.map.json
```

---

## Estimated Effort

| Phase | Effort | Dependency |
|-------|--------|-----------|
| Phase A: Geometric validation script | 1 session | None |
| Phase B: Land/water check | 1-2 sessions | Natural Earth download |
| Phase C: Coordinate corrections | 2-5 sessions | Phase A+B results |
| Phase D: Validator integration | 1 session | Phase A complete |

---

## Decision Points

1. **Natural Earth resolution:** 110m (smaller, faster) or 50m (more accurate for islands)?
2. **Water-adjacent allowlist:** Should marina/harbor/dock POIs be exempt from water checks?
3. **Correction source:** Use OpenStreetMap as ground truth, or allow community-reported corrections?
4. **Port center extraction:** From HTML map init, map manifests, or both?

---

## AEO/SEO Value

Accurate POI coordinates directly improve:
- **Schema.org `geo` data** — `TouristDestination` schema with accurate coordinates
- **Map widget utility** — Users trust maps with correctly placed markers
- **AI extractability** — AI assistants can cite "the cruise terminal is at coordinates X,Y"
- **Zero-click answers** — "Where is the cruise port in Bermuda?" answerable from structured data

---

**Soli Deo Gloria**
