# In the Wake Standards v3.002 — JavaScript Reliability Addendum

### Graceful Failure Compliance
All client-side data dependencies (e.g., `venues.json`, `fleet_index.json`, `personas/index.json`) must:
1. Load through a guarded `loadGracefully()` pattern or equivalent.
2. Provide human-readable fallback messaging (`setStatus("Could not load …")`).
3. Expose a visible **Retry** control when critical data fails to load.
4. Attempt recovery via:
   - `SiteCache.getJSON()` (fresh)
   - direct `fetch()` with timeout ≤ 8 seconds
   - last-known valid localStorage record (even expired)
5. Never block UI or break filters if data fetch fails.
6. Update warm-up prefetch calls to use correct versionPath arrays (e.g., `['meta','version']`).

**Compliance Note:** Pages not implementing graceful-load handling must not claim full In the Wake v3 compliance.
