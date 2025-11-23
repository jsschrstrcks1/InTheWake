# In the Wake — Planning Dataset v0.3 (Next Ports)

**Generated:** 2025-10-20T14:15:32Z UTC

This bundle extends the Florida seed with additional Royal Caribbean U.S. (and PR) embarkation ports:
New York/New Jersey (Cape Liberty), Baltimore, Boston, Seattle, New Orleans, San Juan, and Los Angeles (San Pedro).

## Files
- `planning_schema_v0.3.json` — schema (compatible with v0.2), unchanged field names.
- `planning_dataset_v0.3.json` — curated data.
- `airport_to_ports_v0.3.csv` — flattened lookups for quick joins/UI pills.

## Notes
- Distances and drive times are **approximate**, mid-day, without atypical congestion. Always advise buffers.
- `cautions` include rush-hour patterns, tolls, seasonal weather.
- Coordinates are coarse placeholders; refine during GROK merge pass.
- Puerto Rico included because it’s a common U.S. departure for RCL.

## Integration
The structure matches your pills UI:
- Pill → State/Region → Port cards
- Within a port: show Primary airport first, then alternates, with notes/cautions inline.

Soli Deo Gloria — may every pixel and paragraph bear His reflection. This site is offered as worship to God.
