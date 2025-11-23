
# In the Wake — Ships Standards (v3.001)

## Structure & Order
- Preserve existing card order and accessibility attributes.
- Watermark and hero styles unchanged.

## Paths
- Detail pages: `/ships/<line>/<slug>.html`.
- Hub: `/ships/index.html`.

## Data & Caching
- Load stats from `/assets/data/fleet_index.json` via `SiteCache.getJSON(...)` when available.
- Venues `/assets/data/venues.json` via SiteCache.
- Personas `/assets/data/personas.json` via SiteCache (for logbook/persona cards).
- Videos manifest `/assets/videos/rc_ship_videos.json` via SiteCache for carousels.
- Images benefit from SW cache; still mark non-hero images as `loading="lazy"`.

## Image Discovery (cards/grids)
- Preferred directory: `/assets/ships/thumbs/` (pre-sized), fallback to:
  `/assets/ships/`, `/assets/`, `/images/`, `/ships/`, `/ships/assets/`, `/ships/rcl/images/`.
- Accept file names: `<slug>.jpg|jpeg|png` and `<slug>1..3.jpg|jpeg|png` and select one at random per load.
- Hide ships with no discoverable images from grids until assets exist.
