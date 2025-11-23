# Index / Hub Standards — v3.006

## Checklist
- Uses Core head/footer snippets + hidden invocation comments.
- JSON sources: prefer `/ships/assets/data/rc-fleet-index.json` with **fallback** to `/data/rcl_of_the_seas.json` (no merge).
- Render only ships with at least one image on disk or in cache.
- Cards: pick a random ship‑appropriate image on each load; no broken images.
- Attribution is on the hub page’s attribution card; **external** attribution links must remain absolute (no origin rewrite).

## Caching
- Service Worker caches images only (SWR strategy). JSON is cached via SiteCache (TTL).

## Structured Data
- Include `ItemList` JSON‑LD with proper `position` for each card.
