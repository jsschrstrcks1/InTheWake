
# In the Wake — Root Standards (v3.001)

## Canonical domain & absolute assets
- All root-level pages must use https://www.cruisinginthewake.com absolute URLs for links, assets, and scripts.

## Header/Hero & Watermark
- Maintain watermark background and hero compass per existing CSS patterns.

## Ships hub path
- Reference **/ships/index.html** everywhere.

## Caching Addendum (NEW v3.001)
- Include once per page:
  ```html
  <script src="/assets/js/site-cache.js" defer></script>
  ```
- Footer pre-warm snippet (copy-paste safe):
  ```html
  <script>
  (function(){{async function warm(){{try{{await Promise.all([
    SiteCache.getJSON('/assets/data/fleet_index.json',{{ttlDays:7,versionPath:['version']}}),
    SiteCache.getJSON('/assets/data/venues.json',     {{ttlDays:7,versionPath:['version']}}),
    SiteCache.getJSON('/assets/data/personas.json',   {{ttlDays:7,versionPath:['version']}}),
    SiteCache.getJSON('/assets/videos/rc_ship_videos.json', {{ttlDays:7,versionPath:['version']}})
  ]);}}catch(e){{}}}} if(document.readyState==='loading'){{document.addEventListener('DOMContentLoaded',warm,{{once:true}});} else {{warm();}}}})();
  </script>
  <script>
    if('serviceWorker' in navigator){{navigator.serviceWorker.register('/sw.js').catch(()=>{{}});}}
  </script>
  ```
