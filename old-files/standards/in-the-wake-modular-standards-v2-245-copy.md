---
title: "in_the_wake_modular_standards_v2.245 copy.txt"
source_file: "in_the_wake_modular_standards_v2.245 copy.txt"
generated: "2025-10-17T13:14:33.917205Z"
note: "Verbatim import (lightly normalized). Newer addenda may supersede specific clauses; see supersets."
---

# In the Wake — Modular Website Standards (v2.245)
This document defines the required structure, styling, and script behavior for all pages within the “In the Wake” website, including shared and ship-specific standards.

===================================================================
1. GLOBAL / UNIVERSAL PAGE REQUIREMENTS
===================================================================
All HTML files must follow these conventions:

DOCTYPE & HEAD
---------------
- Begin every page with `<!doctype html>` and `<html lang="en">`.
- Include `_abs()` absolute URL builder at the top of the `<head>`.
- No relative paths allowed anywhere.
- All links and media must reference `https://www.cruisinginthewake.com/...`
- Canonical tag must point to the `www.` version of the URL.
- `og:` and `twitter:` metadata must reflect page content.
- Version meta must follow: `<meta name="version" content="2.xxx"/>`

FORCE-WWW POLICY
----------------
Include this non-looping redirect script before closing `</head>`:
```
<script>
(function enforceWWW(){
  try{
    var h = location.hostname;
    if (h === 'cruisinginthewake.com'){
      location.replace('https://www.'+h+location.pathname+location.search+location.hash);
    }
  }catch(e){}
})();
</script>
```

CSS & STYLE RULES
-----------------
- Load main CSS: `https://www.cruisinginthewake.com/assets/styles.css?v=VERSION`
- Swiper assets from `/vendor/swiper/`, CDN fallback allowed.
- Variables required: `--sea, --foam, --rope, --ink, --sky, --accent`
- Watermark (required):
  ```
  body::before{
    content:"";
    position:fixed; inset:0;
    background:url("https://www.cruisinginthewake.com/assets/watermark.png") center right / 420px auto no-repeat;
    opacity:.06; pointer-events:none; z-index:0;
  }
  ```

NAVIGATION BAR
---------------
- Use `.pills` horizontal nav with these links:
  Home, Ships, Restaurants & Menus, Ports, Disability at Sea, Drink Packages,
  Packing Lists, Cruise Lines, Solo, Travel.
- Must remain one line on desktop.
- CSS:
  ```
  .pills{display:flex;flex-wrap:nowrap;gap:.6rem;white-space:nowrap;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none}
  .pills::-webkit-scrollbar{display:none}
  .pills a{flex:0 0 auto}
  @media (min-width:980px){.pills{justify-content:center;overflow:visible}}
  ```

===================================================================
2. SHIP PAGE STANDARDS
===================================================================

1. HERO HEADER
   - Includes compass overlay, grid SVG, logo, and attribution pill.
   - Hero image: `/assets/ships/{ship-slug}-hero.jpg?v=VERSION`

2. FIRST LOOK SWIPER
   - `.swiper.firstlook`
   - Each `<figure>`: Wikimedia image with local fallback.
   - Captions must cite author + license.
   - JS:
     ```
     new Swiper('.swiper.firstlook',{loop:false,lazy:true,watchOverflow:true,...})
     ```

3. SHIP STATS
   - `<section class="ship-stats card mini">`
   - Data: `/assets/data/fleet_index.json`
   - Fallback JSON inline in `<script id="ship-stats-fallback">`
   - Fields: class, entered_service, gt, guests, crew, length, beam, registry.

4. DINING CARD
   - `<section id="dining-card" class="card" data-ship="{Ship Name}">`
   - Hero: `/assets/ships/rcl/{ship-slug}/dining-hero.jpg`
   - Data source block:
     ```json
     {"provider":"rcl","json":"https://www.cruisinginthewake.com/assets/data/rc-restaurants.json","ship_slug":"{ship-slug}"}
     ```
   - JS: `/assets/js/dining-card.js?v=VERSION`

5. LOGBOOK CARD
   - `<section class="card note-kens-logbook">`
   - Fallback fetch order:
     `/ships/rcl/assets/{slug}.json`
     `/assets/data/logbook/rcl/{slug}.json`
     `/assets/data/ships/rcl/{slug}.json`
   - Markdown must be converted to semantic HTML.

6. VIDEOS SWIPER
   - Section `<section aria-labelledby="video-highlights">`
   - JSON at:
     `/ships/rcl/assets/videos/{ship-slug}.json` or `/videos/{ship-slug}.json`
   - Must include:
     ```
     {"videos": { "walkthrough": [...], "balcony": [...], ... }}
     ```
   - Extract video_id or youtube_id for embed.
   - Embed template:
     `<iframe src="https://www.youtube-nocookie.com/embed/{id}" allowfullscreen></iframe>`
   - Fallback text: “Videos will appear once our sources sync for this ship.”

7. LIVE TRACKER CARD
   - `<section class="card itinerary" data-imo="#######" data-name="SHIPNAME">`
   - Hybrid VesselFinder:
     - Try `AISMap` JS first.
     - Fallback: iframe
       `https://www.vesselfinder.com/vessels/{name}-IMO-{imo}#map`

8. RELATED SHIPS + CLASSES
   - `.related-row` with two `.card` subsections.
   - Related ships: sibling vessels.
   - Related classes: class links ranked by popularity.

9. ATTRIBUTION
   - Bottom section required.
   - Must say “In order of appearance.”
   - Cite each Wikimedia image + CC license.

===================================================================
3. COMPLIANCE SUMMARY
===================================================================
✅ No relative paths anywhere  
✅ `_abs()` declared in `<head>` before use  
✅ Swiper loads from `/vendor/swiper/`  
✅ JSON fetches use `_abs()`  
✅ Fallback chain implemented for dining, logbook, videos, and stats  
✅ Non-looping force-www redirect  
✅ Section order preserved as defined  

Version: v2.245  
Maintainer: In the Wake Project  
Host: GitHub Pages (canonical https://www.cruisinginthewake.com/)
