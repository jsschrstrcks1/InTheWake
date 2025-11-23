
# In the Wake — Main Standards (v3.001)

**Principles**
- Canonical production domain: **https://www.cruisinginthewake.com**.
- Absolute URLs only (no relatives) on production.
- Modular standards: this Main doc + Root + Ships + Cruise-Lines.
- No regressions; additive improvements only.

## Global
- Stylesheet must use version query **v3.0**: `/assets/styles.css?v=3.0`
- Primary nav (absolute URLs) — note **Ships hub is `/ships/index.html`**:
  - https://www.cruisinginthewake.com/index.html
  - https://www.cruisinginthewake.com/ships/index.html
  - https://www.cruisinginthewake.com/restaurants.html
  - https://www.cruisinginthewake.com/ports.html
  - https://www.cruisinginthewake.com/disability-at-sea.html
  - https://www.cruisinginthewake.com/drink-packages.html
  - https://www.cruisinginthewake.com/packing-lists.html
  - https://www.cruisinginthewake.com/cruise-lines/royal-caribbean.html
  - https://www.cruisinginthewake.com/solo.html
  - https://www.cruisinginthewake.com/travel.html

## Repository & Paths
- Ships hub: **/ships/index.html** (not `/ships/ships.html`).
- Ship detail pages: `/ships/<line>/<slug>.html`.
- Global data:
  - `/assets/data/fleet_index.json`
  - `/assets/data/venues.json`
  - `/assets/data/personas.json`
  - `/assets/videos/rc_ship_videos.json`

## Caching & Performance (NEW in v3.001)
### JSON cache (client-side, weekly TTL + version awareness)
- Include once (in `<head>`):
  ```html
  <script src="/assets/js/site-cache.js" defer></script>
  ```
- Warm cache on **every page** (near `</body>`):
  ```html
  <script>
  (function(){{async function warm(){{try{{await Promise.all([
    SiteCache.getJSON('/assets/data/fleet_index.json',{{ttlDays:7,versionPath:['version']}}),
    SiteCache.getJSON('/assets/data/venues.json',     {{ttlDays:7,versionPath:['version']}}),
    SiteCache.getJSON('/assets/data/personas.json',   {{ttlDays:7,versionPath:['version']}}),
    SiteCache.getJSON('/assets/videos/rc_ship_videos.json', {{ttlDays:7,versionPath:['version']}})
  ]);}}catch(e){{}}}} if(document.readyState==='loading'){{document.addEventListener('DOMContentLoaded',warm,{{once:true}});} else {{warm();}}}})();
  </script>
  ```

### Images (Service Worker cache-first)
- Put **`/sw.js`** at site root.
- Register on all pages (right before `</body>`):
  ```html
  <script>
    if('serviceWorker' in navigator){{navigator.serviceWorker.register('/sw.js').catch(()=>{{}});}}
  </script>
  ```

### Lazy Loading
- Keep `loading="lazy"` on non-hero images; use explicit `width/height` or `aspect-ratio` in CSS.

## CI Checks
- Ensure `/ships/index.html` exists and is used in nav.
- Ensure `site-cache.js` is present and pre-warm snippet exists.
- Ensure SW registration snippet present; `/sw.js` deployed.
- Absolute URL validation against https://www.cruisinginthewake.com.

## Future-proofing
- Maintain version fields (`"version"`) in JSON payloads to trigger cache invalidation.
- Keep per-ship video manifests and personas structure stable.
