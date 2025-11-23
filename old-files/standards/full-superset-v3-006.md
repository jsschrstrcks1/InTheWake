---
title: "FULL_SUPERSET_v3.006.md"
source_file: "FULL_SUPERSET_v3.006.md"
generated: "2025-10-17T13:14:34.197042Z"
note: "Verbatim import (lightly normalized). Newer addenda may supersede specific clauses; see supersets."
---

# In The Wake — Modular Standards — SUPerset v3.006

> This file concatenates every discovered source verbatim.
> Source provenance is preserved in BEGIN/END comment blocks.


<!-- BEGIN SOURCE: in_the_wake_logbook_personas_standards_v2.257.zip:ships-logbook-personas-standards-v2.257.md -->

# In the Wake — Logbook Personas Standards
Version: v2.257

## Overview
Each ship’s Logbook JSON contains 10 personas that embody real, heartwarming cruise stories. These entries are designed to inspire potential cruisers by reflecting real human emotion and accurate itineraries while maintaining the tone, nautical imagery, and faith-friendly warmth consistent with In the Wake standards.

## Required Metadata
Each persona must include:
- **id** — A unique lowercase identifier, e.g. `p1-elmer`
- **persona_label** — Short editorial note about the perspective or context (1–2 sentences max).
- **title** — A compelling, headline-quality title designed for human emotion and SEO readability.
- **markdown** — The full logbook entry written in rich Markdown using the following format:
  - Disclosure (always first; excluded from word count)
  - Subsections: Intro, Crew & Staff, Dining, Entertainment, Accessibility (if relevant), Tear-jerker moment, Closing
  - A consistent tone: authentic, emotional, faith-friendly, family-readable
  - Real itineraries and accurate ports for 2024–2025 only
- **nav_port / nav_starboard** — Proper links to next/previous persona entries.

## Disclosure
> Full disclosure: I have not yet sailed [Ship Name]. Until I do, this Logbook is an aggregate of vetted guest soundings, taken in their own wake, trimmed and edited to our standards.

## Tone Guidance
- Prioritize *heartwarming*, with occasional bittersweet moments that encourage rather than discourage travel.
- Avoid cynicism or overt salesmanship — sincerity first.
- Integrate nautical language naturally (“wake,” “helm,” “port,” “starboard,” “deck,” etc.).
- Optionally include subtle faith references (e.g., answered prayers, gratitude, sunsets, fellowship moments).

## Persona Range
| Persona | Core Concept | Suggested Emotional Arc |
|----------|---------------|--------------------------|
| P1-Elmer | Grandfather rediscovering joy with family | Nostalgic, thankful, tearful at reconnection |
| P2-Marissa | Solo woman rediscovering confidence | Independence, peace, renewal |
| P3-Lydia | Single mom finding rest and family unity | Healing, bonding, laughter |
| P4-Tom & Jean | Empty nesters | Romance reborn at sea |
| P5-Nathan | Workaholic learning to disconnect | Conviction → calm |
| P6-Maya & Jordan | Young newlyweds | Wonder, humor, shared faith |
| P7-Carlos | Disabled veteran | Reflection, healing, belonging |
| P8-Grace | Mission trip return | Purpose, gratitude, closure |
| P9-Danielle & Friends | Girl’s getaway | Joy, laughter, community |
| P10-Ezekiel | Pastor on sabbatical | Quiet renewal, faith restored |

## Validation Checklist
- [x] All JSON must validate against schema v2.257
- [x] All dates and itineraries match real 2024–2025 Royal Caribbean deployments
- [x] Disclosure text exact and unmodified
- [x] Markdown under 1200 words (excluding disclosure)
- [x] Each persona includes a “tear-jerker” moment
- [x] No duplicate names or story templates reused
- [x] Language: warm, nautical, faith-compatible

<!-- END SOURCE: in_the_wake_logbook_personas_standards_v2.257.zip:ships-logbook-personas-standards-v2.257.md -->


<!-- BEGIN SOURCE: in_the_wake_modular_standards_v2.245.zip:standards/in_the_wake_modular_standards_v2.245.txt -->

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

<!-- END SOURCE: in_the_wake_modular_standards_v2.245.zip:standards/in_the_wake_modular_standards_v2.245.txt -->


<!-- BEGIN SOURCE: InTheWake_Standards_v2.4.zip:README.md -->

# In the Wake — Site Standards v2.4
Generated: 2025-10-04T21:45:59.798791Z

This bundle contains modular, copy‑pasteable standards for **In the Wake**.  
They are written so that *any* page generator (even very literal ones) can produce a functioning, consistent page.

## What’s inside
- **root-standards.md** — Global rules (paths, analytics, canonicalization, CORS‑safe fetch)
- **main-standards.md** — Head/meta/SEO, assets, Swiper loading, accessibility
- **ships-standards.md** — Ship page schema + required sections + JSON contracts
- **cruise-lines-standards.md** — Cruise line landing/index pages
- **changelog.md** — v2.3 → v2.4 changes
- **examples/** — Minimal HTML scaffolds ready to duplicate
  - `examples/ships/rcl/template.html` — Ship page
  - `examples/cruise-lines/template.html` — Cruise line index page

## Quick start
1) Copy a template from **examples/** to your target path.
2) Replace placeholders: `__SHIP_NAME__`, `__SHIP_SLUG__`, `__CLASS_NAME__`, `__VERSION__`, etc.
3) Ensure JSON data files exist at the paths referenced in the template (see comments inside the file).
4) Commit and push. GitHub Pages will serve with correct canonical, absolute URLs, analytics, and fallbacks.

<!-- END SOURCE: InTheWake_Standards_v2.4.zip:README.md -->


<!-- BEGIN SOURCE: InTheWake_Standards_v2.4.zip:root-standards.md -->

# Root Standards (Global) — v2.4

These rules apply to **every page** on the site.

## 1) Absolute Path Policy
- Never use relative paths like `../assets/...`.  
- Generate absolute URLs from the current origin via a tiny helper loaded at the top of `<head>`:
```html
<script>
(function(){
  var ORIGIN = (location.origin || (location.protocol + '//' + location.host)).replace(/\/$/, '');
  window._abs = function(path){
    path = String(path||''); if (!path.startsWith('/')) path = '/' + path;
    return ORIGIN + path;
  };
})();
</script>
```

## 2) Canonicalization (GitHub Pages–safe, no reload loops)
- Allow both `https://cruisinginthewake.com` and `https://www.cruisinginthewake.com` to serve without redirect loops.
- Set `<link rel="canonical" ...>` to the **www** form.
- Optional *soft* redirect only when host is the apex (no subdomains) **and** we are on HTTPS:
```html
<script>
(function normalizeCanonicalHost(){
  try{
    var h = location.hostname, isApex = (h === 'cruisinginthewake.com');
    var isHttps = (location.protocol === 'https:');
    // Only redirect apex→www on HTTPS and only once per session
    if (isApex && isHttps && !sessionStorage.getItem('ctw_www')){
      sessionStorage.setItem('ctw_www','1');
      location.replace('https://www.'+h+location.pathname+location.search+location.hash);
    }
  }catch(e){/* no-op */}
})();
</script>
```

## 3) Analytics (Umami)
Insert immediately **after** `<meta name="viewport">` on every page:
```html
<!-- analytics: umami -->
<script defer src="https://cloud.umami.is/script.js"
        data-website-id="9661a449-3ba9-49ea-88e8-4493363578d2"></script>
<!-- /analytics -->
```

## 4) Swiper Loader (primary + CDN fallback)
Load once per page in `<head>`:
```html
<script>
(function ensureSwiper(){
  function addCSS(h){ var l=document.createElement('link'); l.rel='stylesheet'; l.href=h; document.head.appendChild(l); }
  function addJS(src, ok, fail){
    var s=document.createElement('script'); s.src=src; s.async=true;
    s.onload=ok; s.onerror=fail||function(){}; document.head.appendChild(s);
  }
  var primaryCSS=_abs('/vendor/swiper/swiper-bundle.min.css');
  var primaryJS =_abs('/vendor/swiper/swiper-bundle.min.js');
  var cdnCSS='https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css';
  var cdnJS ='https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js';
  addCSS(primaryCSS);
  addJS(primaryJS, function(){ window.__swiperReady=true; },
    function(){ addCSS(cdnCSS); addJS(cdnJS, function(){ window.__swiperReady=true; }); });
})();
</script>
```

## 5) Accessibility & Performance Baselines
- Use meaningful `aria-label`, `aria-labelledby`, and `role` on interactive blocks.
- All images require `alt`. Use `loading="lazy"` where appropriate.
- YouTube embeds must use `youtube-nocookie.com` and have `title` set.
- Hide decorative images from AT with `aria-hidden="true"`.

## 6) Same-Origin Fetch (CORS-safe)
- Use `_abs('/path/to.json')` for all fetches. Avoid hardcoded hostnames in JS data URLs.
- Always implement **failover**: try multiple same-origin URLs, then fall back to inline `<script type="application/json">` where possible.

## 7) Versioning
- Append `?v=__VERSION__` to assets. Bump version per release (see `changelog.md`).

## 8) Persona Disclosure Line
- Where a persona is clearly first-person and you have sailed the ship yourself, include:
  > *Full disclosure: I have stood the watch on __SHIP_NAME__, for __N__ days logged in her logbook and mine. This is no tide of borrowed winds, but depth soundings taken in my own wake.*
- Where firsthand experience is pending, include:
  > *My own notes are coming soon; for now, I’m curating verified accounts and ship facts to keep you oriented.*

<!-- END SOURCE: InTheWake_Standards_v2.4.zip:root-standards.md -->


<!-- BEGIN SOURCE: InTheWake_Standards_v2.4.zip:main-standards.md -->

# Main Page Standards — v2.4

## Required `<head>` Items (exact order)
1. `<!doctype html>` and `<html lang="en">`
2. `<meta charset="utf-8">`
3. `<meta name="viewport" content="width=device-width, initial-scale=1">`
4. **Umami analytics snippet** (see root standards)
5. `_abs()` helper (absolute paths)
6. Canonicalization script (GitHub Pages–safe)
7. `<title>` — `__PAGE_TITLE__ — In the Wake (v__VERSION__)`
8. Canonical & SEO:
```html
<link rel="canonical" href="https://www.cruisinginthewake.com/__CANONICAL_PATH__"/>
<meta name="description" content="__PAGE_DESCRIPTION__"/>
<meta name="version" content="__VERSION__"/>
```
9. Social Open Graph + Twitter card (site-level image allowed)
10. Site CSS: `<link rel="stylesheet" href="_abs('/assets/styles.css?v=__VERSION__')">`
11. Swiper loader block (root standards §4)

## Navbar Pills (single line w/ scroll on mobile)
Use this CSS (or include it once site-wide):
```html
<style>
.pills{ display:flex; flex-wrap:nowrap; gap:.6rem; white-space:nowrap; overflow-x:auto; -webkit-overflow-scrolling:touch; scrollbar-width:none; }
.pills::-webkit-scrollbar{ display:none; }
.pills a{ flex:0 0 auto; }
@media (min-width:980px){ .pills{ justify-content:center; overflow:visible; } }
</style>
```

## Image Fallback Pattern
Use an `onerror` inline handler with a list of same-origin fallbacks:
```html
<img src="_abs('/assets/ships/__SHIP_SLUG__1.jpg?v=__VERSION__')" alt="__ALT__" loading="lazy"
     onerror="(function(i){var fb=[_abs('/assets/ships/rcl/__SHIP_SLUG__/__SHIP_SLUG__1.jpg?v=__VERSION__')];i._fbi=(i._fbi||0);if(i._fbi<fb.length){i.src=fb[i._fbi++];}})(this)">
```

## YouTube ID Normalizer (shared)
```html
<script>
window._ytId = function(v){
  if (v && typeof v==='object'){
    if (v.video_id) return String(v.video_id);
    if (v.youtube_id) return String(v.youtube_id);
    if (v.id && /^[A-Za-z0-9_-]{6,}$/.test(v.id)) return String(v.id);
  }
  var u = String((v && (v.video_url||v.url||v.embed_url))||'');
  var m = u.match(/(?:\?|&)v=([A-Za-z0-9_-]{6,})/)||u.match(/youtu\.be\/([A-Za-z0-9_-]{6,})/)||u.match(/\/embed\/([A-Za-z0-9_-]{6,})/);
  return m?m[1]:'';
};
</script>
```

## Markdown-to-HTML Mini (for logbook)
```html
<script>
window._mdToHtml = function(src){
  var html = String(src||'').trim(); if(!html) return '';
  html = html.replace(/^###?\s+(.+)$/gm,'<h3>$1</h3>')
             .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
             .replace(/\*(.+?)\*/g,'<em>$1</em>');
  html = '<p>'+html.replace(/\n{2,}/g,'</p><p>').replace(/\n/g,'<br/>')+'</p>';
  return html.replace(/^<p>\s*<\/p>/,'');
};
</script>
```


<!-- END SOURCE: InTheWake_Standards_v2.4.zip:main-standards.md -->


<!-- BEGIN SOURCE: InTheWake_Standards_v2.4.zip:ships-standards.md -->

# Ship Page Standards — v2.4

Each ship page **must** follow this structure:

## Required Sections (in order)
1. **Header (Hero + Navbar)** — Includes watermark, brand, hero image, and credit pill.
2. **First Look** — Swiper image carousel (3+ images) with captions and CC attribution.
3. **Ship Stats** — Auto-filled from `assets/data/fleet_index.json` with inline fallback.
4. **Dining Card** — JS-driven from same-origin JSON.
5. **Logbook — Tales From the Wake** — Persona stories loader.
6. **Video Highlights** — Swiper carousel of embedded YouTube slides (nocookie).
7. **Deck Plans** — Button linking to official deck plans.
8. **Live Tracker** — Hybrid VesselFinder embed (JS widget with iframe fallback).
9. **Related** — Sister ships + Class pills.
10. **Attribution & Credits** — Ordered list.
11. **Footer** — Site copyright.

## Data Contracts

### 1) Fleet Index (`assets/data/fleet_index.json`)
- Must contain either a flat `ships` array or nested objects; the loader will walk all nodes.
- Required fields (any naming alias accepted):  
  `slug | id`, `name | title`, `class | ship_class`, `entered_service | year_built_or_entered | inaugural | launched`, `gt | gross_tonnage`, `capacity | passengers | guests`, `crew`, `length | length_overall`, `beam | width`, `flag | registry`.

### 2) Dining JSON (same origin)
- For Royal Caribbean ships: `_abs('/assets/data/rc-restaurants.json')`  
- Object shape must allow lookup by `ship_slug` or by alias list.

### 3) Videos JSON (per ship)
- Preferred location 1: `/ships/rcl/assets/videos/__SHIP_SLUG__.json?v=__VERSION__`
- Fallback 2: `/videos/__SHIP_NAME__.json?v=__VERSION__`
- Accept either:
  - `{ "videos": [ ... ] }` or categories `{ "videos": { walkthrough:[...], ... } }`
  - Or a site map `{ "ships": { "__SHIP_SLUG__": { "videos": { ... } } } }`
- Each item should include at least one of: `video_id`, `video_url`, `title`.

### 4) Logbook JSON (per ship)
- Primary: `/ships/rcl/assets/__SHIP_SLUG__.json?v=__VERSION__`
- Fallbacks: `/assets/data/logbook/rcl/__SHIP_SLUG__.json?v=__VERSION__` or `/assets/data/ships/rcl/__SHIP_SLUG__.json?v=__VERSION__`
- Shape options:
```json
{ "stories":[ { "title":"...", "markdown":"..." }, ... ] }
{ "personas":[ { "persona_label":"...", "markdown":"..." }, ... ] }
{ "logbook": { "stories":[ ... ] } }
{ "__SHIP_SLUG__": { "stories":[ ... ] } }
```
- **Persona disclosure lines** must be included where relevant (see root standards §8).

## Standard Loaders (Drop-in)

### A) Ship Stats Loader
```html
<script>
(async function loadShipStats(){
  var el = document.getElementById('ship-stats'); if(!el) return;
  var SOURCE = _abs('/assets/data/fleet_index.json');
  async function tryFetch(u){ try{ var r=await fetch(u,{cache:'no-store'}); if(r.ok) return await r.json(); }catch(e){} return null; }
  var data = await tryFetch(SOURCE);
  if(!data){
    try{ var fb = JSON.parse(document.getElementById('ship-stats-fallback').textContent||'{}'); data={ships:[fb]}; }
    catch(e){}
  }
  if(!data){ el.innerHTML='<p class="tiny">Stats coming soon.</p>'; return; }

  function norm(s){ return String(s||'').toLowerCase().replace(/’/g,"'").trim(); }
  function* walk(n){ if(!n) return; if(Array.isArray(n)){ for(const it of n) yield* walk(it); return; }
    if(typeof n==='object'){ yield n; for(const v of Object.values(n)) yield* walk(v); } }
  var targetSlug = norm(el.getAttribute('data-slug')||'');
  var ship=null;
  for (const obj of walk(data)){
    var rawSlug = obj && (obj.slug || obj.id || (obj.attributes && obj.attributes.slug));
    var nslug = norm(rawSlug);
    var nname = norm((obj && (obj.name || obj.title || obj.ship)) || (obj && obj.attributes && obj.attributes.name));
    if ((targetSlug && nslug===targetSlug) || nname==='__SHIP_NAME_NORMALIZED__'){ ship=obj; break; }
  }
  if(!ship){ el.innerHTML='<p class="tiny">Stats coming soon.</p>'; return; }
  var a = ship.attributes || ship;
  var rows = [
    ['Class', a.class || a.ship_class || (a.notes && /__CLASS_KEY__/i.test(a.notes) ? '__CLASS_NAME__' : '')],
    ['Entered Service', a.year_built_or_entered || a.entered_service || a.inaugural || a.launched],
    ['Gross Tonnage', a.gt || a.gross_tonnage || a.tonnage],
    ['Guests', a.capacity || a.passengers || a.guests],
    ['Crew', a.crew],
    ['Length', a.length || a.length_overall],
    ['Beam', a.beam || a.width],
    ['Registry', a.flag || a.registry]
  ].filter(function(p){ return p[1]!=null && String(p[1]).trim()!==''; })
   .map(function(p){ return '<div class="stat-line"><span class="stat-key">'+p[0]+':</span><span class="stat-val">'+p[1]+'</span></div>'; })
   .join('');
  el.innerHTML = rows || '<p class="tiny">Stats coming soon.</p>';
})();
</script>
```

### B) Dining Loader Fix (force same-origin JSON)
```html
<script>
(function fixDiningJSON(){
  function run(){
    var el = document.getElementById('dining-data-source'); if(!el) return;
    try{
      var obj = JSON.parse(el.textContent||'{}');
      if (obj && obj.json) {
        obj.json = _abs('/assets/data/rc-restaurants.json');
        el.textContent = JSON.stringify(obj);
      }
    }catch(e){}
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run, {once:true});
  } else { run(); }
})();
</script>
```

### C) Logbook Loader (revised, standards compliant)
```html
<script>
(function initLogbook(){
  var mount = document.getElementById('logbook-stories'); if(!mount) return;
  var slug = mount.getAttribute('data-ship-slug') || '__SHIP_SLUG__';
  var SOURCES = [
    _abs('/ships/rcl/assets/'+slug+'.json?v=__VERSION__'),
    _abs('/assets/data/logbook/rcl/'+slug+'.json?v=__VERSION__'),
    _abs('/assets/data/ships/rcl/'+slug+'.json?v=__VERSION__')
  ];
  function fetchFirst(i){
    i=i||0; if(i>=SOURCES.length) return Promise.resolve(null);
    return fetch(SOURCES[i], { cache:'no-store' })
      .then(function(r){ return r.ok ? r.json() : fetchFirst(i+1); })
      .catch(function(){ return fetchFirst(i+1); });
  }
  function renderOne(p){
    var title = String(p.title || p.persona_label || p.heading || 'Guest Perspective').replace(/</g,'&lt;');
    var body  = String(p.markdown || p.body || p.content || p.html || p.text || p.story || p.notes || '');
    if (!body.trim()) return '';
    return '<article class="story"><h3 tabindex="0">'+title+'</h3><div class="story-body">'+_mdToHtml(body)+'</div></article>';
  }
  fetchFirst().then(function(data){
    var stories=[];
    if (Array.isArray(data)) stories=data;
    else if (data){
      stories = data.stories || data.personas || (data.logbook && data.logbook.stories) || [];
      if (!stories.length && data[slug]){
        var s = data[slug];
        stories = s.stories || s.personas || (s.logbook && s.logbook.stories) || [];
      }
    }
    mount.innerHTML = (stories && stories.length)
      ? stories.map(renderOne).filter(Boolean).join('')
      : '<article class="story"><p class="small">Stories coming soon.</p></article>';
  }).catch(function(){
    mount.innerHTML = '<article class="story"><p class="small">We hit a snag loading entries. Try a hard refresh.</p></article>';
  });
})();
</script>
```

### D) Videos Loader (de-duped, nocookie)
```html
<script>
(function initVideos(){
  var sec  = document.querySelector('[aria-labelledby="video-highlights"]');
  if(!sec) return;
  var slug = '__SHIP_SLUG__';
  var WRAP = document.getElementById('featuredVideos'); if(!WRAP) return;
  var CONTAINER = sec.querySelector('.swiper.videos');
  var fallback = document.getElementById('videoFallback');
  var SOURCES = [
    _abs('/ships/rcl/assets/videos/'+slug+'.json?v=__VERSION__'),
    _abs('/videos/'+slug.replace(/-/g,' ')+'.json?v=__VERSION__')
  ];
  function fetchFirst(i){
    i=i||0; if(i>=SOURCES.length) return Promise.resolve(null);
    return fetch(SOURCES[i], { cache:'no-store' })
      .then(function(r){ return r.ok ? r.json() : fetchFirst(i+1); })
      .catch(function(){ return fetchFirst(i+1); });
  }
  function normalize(data){
    if(!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.videos)) return data.videos;
    if (data.videos && typeof data.videos==='object') return Object.values(data.videos).flat();
    if (data.ships && data.ships[slug] && data.ships[slug].videos){
      var b = data.ships[slug].videos;
      return ['overview','signature_features','staterooms','accessible','dining','other']
        .reduce(function(acc,k){ return acc.concat(Array.isArray(b[k])?b[k]:[]); },[]);
    }
    return [];
  }
  function whenSwiperReady(cb){
    (function poll(){ if (window.__swiperReady && window.Swiper) cb(); else setTimeout(poll, 80); })();
  }
  fetchFirst().then(function(json){
    var items = normalize(json).filter(Boolean);
    var seen = Object.create(null), slides=[];
    items.forEach(function(v){
      var id = (window._ytId ? _ytId(v) : ''); if(!id || seen[id]) return; seen[id]=1;
      var title = String(v.title||'Ship video').replace(/"/g,'&quot;');
      slides.push('<div class="swiper-slide"><iframe title="'+title+'" src="https://www.youtube-nocookie.com/embed/'+id+'" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="lazy"></iframe></div>');
    });
    if (!slides.length){ if(fallback) fallback.classList.remove('hidden'); CONTAINER.classList.add('carousel-fallback'); return; }
    WRAP.innerHTML = slides.join('');
    CONTAINER.classList.remove('carousel-fallback');
    whenSwiperReady(function(){
      try{
        new Swiper('.swiper.videos', {
          loop:false, lazy:true, watchOverflow:true,
          pagination:{ el:'.swiper.videos .swiper-pagination', clickable:true },
          navigation:{ nextEl:'.swiper.videos .swiper-button-next', prevEl:'.swiper.videos .swiper-button-prev' },
          a11y:{ enabled:true }
        });
      }catch(e){ CONTAINER.classList.add('carousel-fallback'); }
    });
  });
})();
</script>
```


<!-- END SOURCE: InTheWake_Standards_v2.4.zip:ships-standards.md -->


<!-- BEGIN SOURCE: InTheWake_Standards_v2.4.zip:cruise-lines-standards.md -->

# Cruise Line Page Standards — v2.4

Use for pages like `/cruise-lines/royal-caribbean.html`.

## Must-have blocks
1. Header + Navbar (per main standards)
2. Hero (brand image + tagline)
3. Intro copy (value proposition for the line)
4. Class navigator pills, sorted by booking/buzz rank (helper script provided below)
5. Featured ships grid (cards linking to ship pages)
6. Cross-links to Restaurants, Ports, Drink Packages
7. Attribution & footer

## Class Pill Reorder Script
```html
<script>
(function reorderClassPills(){
  function ready(fn){
    if(document.readyState === 'loading'){document.addEventListener('DOMContentLoaded', fn, {once:true});}
    else { fn(); }
  }
  const CLASS_RANK = { icon:1, oasis:2, quantum:3, freedom:4, voyager:5, radiance:6, vision:7 };
  function keyFromHref(href){
    try{ const frag = (href.split('#')[1] || '').trim().toLowerCase(); return frag.replace(/[^a-z0-9_-]/g,''); }
    catch{ return ''; }
  }
  ready(function(){
    const wrap = document.querySelector('.class-pills'); if(!wrap) return;
    const links = Array.from(wrap.querySelectorAll('a.pill')); if(!links.length) return;
    const withIndex = links.map((a, i) => {
      const k = keyFromHref(a.getAttribute('href') || '');
      const rank = (k && Number.isFinite(CLASS_RANK[k])) ? CLASS_RANK[k] : 999;
      return {el:a, rank, i};
    });
    withIndex.sort((a,b)=> (a.rank - b.rank) || (a.i - b.i));
    withIndex.forEach(item => wrap.appendChild(item.el));
  });
})();
</script>
```


<!-- END SOURCE: InTheWake_Standards_v2.4.zip:cruise-lines-standards.md -->


<!-- BEGIN SOURCE: InTheWake_Standards_v2.4.zip:changelog.md -->

# Changelog

## v2.4
- Added Umami analytics snippet (global requirement).
- Implemented GitHub Pages–safe canonicalization (no reload loops).
- Standardized `_abs()` helper usage site-wide.
- Updated **Logbook loader** to rely on same-origin sources with failover and markdown mini-renderer.
- Updated **Videos loader** with de-dupe and nocookie embeds.
- Clarified data contracts for fleet index, dining JSON, videos JSON, and logbook JSON.
- Persona disclosure lines policy added (firsthand / coming soon).

## v2.3
- Introduced Swiper primary+CDN fallback loader.
- Accessibility pass for carousels and images.

<!-- END SOURCE: InTheWake_Standards_v2.4.zip:changelog.md -->


<!-- BEGIN SOURCE: InTheWake_Standards_v2.229.markdown -->

# In The Wake Standards (Full Expanded v2.229)

This document defines **all rules** for building, editing, and maintaining the **In the Wake** website, incorporating the Royal Caribbean International (RCI) and Carnival Cruise Line ship lists (current, former, and coming soon) as of September 14, 2025, and merging the "In The Wake – AI Project Ruleset (v1.0)" with prior versions (v2.201–v2.228). It is the single source of truth for structure, styling, content, linking, and QA, consolidating rules with no deletions, only additions, to ensure continuity. Version v2.229 integrates the generated `site_tree.json` from provided text, reinforces site tree maintenance (§2), enhances video/image sourcing with regex and Beautiful Soup for ChatGPT compatibility, and addresses compliance report pathing issues (e.g., RCI ships in `/ships/` vs. `/ships/rcl/`).

> **Golden Reference:** `/ships/rcl/grandeur-of-the-seas.html` is the visual/structural gold standard. **Do not edit that file.** Everything else must match its structure and conventions. The site owner updates it manually.

---

## 0) Principles (applies to all HTML files)
- **Single source of truth.** The Standards define what the site must look like and how it must be wired. Code must conform to this doc — not the other way around.
- **Deterministic output.** Rebuilders must rebuild the entire `<main>` block and footer to guarantee correct order and content.
- **Absolute paths only.** All `src` and `href` use absolute paths from web root (e.g., `/ships/assets/images/...`, `/assets/css/...`, `/assets/data/...`).
- **Double-Check Mandate.** Every ship page changeset must pass the CI checks in §7 before shipping.
- **Continuity is king.** Every update must preserve prior fixes, conventions, and style. No regressions.
- **Additive changes only.** Updates to the standards must only add new rules, never delete existing ones, to maintain continuity and prevent regressions.
- **Site tree maintenance.** A site tree (`/data/site_tree.json`) must be updated with every new page addition to map all files and their locations, ensuring AI systems (e.g., ChatGPT) have an authoritative reference.

---

## 1) Global Rules (apply to all HTML files unless specified)

1. **Absolute URLs only**
   - **Scope**: All HTML files (root, `/cruise-lines/`, `/ships/`, `/ships/ships.html`).
   - All href/src must be absolute, pointing at the GitHub Pages host.
   - ✅ `https://www.cruisinginthewake.com/ships/rcl/icon-of-the-seas.html`
   - ❌ `../ships/rcl/icon-of-the-seas.html`, `/ships/rcl/icon-of-the-seas.html`

2. **Single global stylesheet**
   - **Scope**: All HTML files.
   - Use exactly one CSS file for all layout/design:  
     `https://www.cruisinginthewake.com/InTheWake/assets/styles.css?v=2.229`
   - **Never** inline or page-level CSS into HTML documents. All styling flows from `styles.css`.
   - When updating site styling, only change `styles.css` and bump the version query.

3. **Header/Hero (Grandeur pattern)**
   - **Scope**: All HTML files.
   - Components present in header: brand wordmark (left), version badge (v2.229), pill nav, hero area with lat/long grid, logo lockup + tagline (center-bottom), compass rose (top-right).
   - The compass appears **once** (right side). No duplicates.
   - No legacy “In the Wake” text banners.
   - The hero grid labels show ticks without numeric degrees, matching `https://www.cruisinginthewake.com/ships/rcl/grandeur-of-the-seas.html`.

4. **Primary pill navigation**
   - **Scope**: All HTML files.
   - Present on all pages with absolute links in this order:
     - Home • Ships • Restaurants & Menus • Ports • Disability at Sea • Drink Packages • Packing Lists • Cruise Lines • Solo • Travel
   - Class names and structure must match `styles.css` (e.g., `.nav a` pills).
   - Nav links point to canonical absolute URLs (e.g., `https://www.cruisinginthewake.com/ships/ships.html`, `https://www.cruisinginthewake.com/cruise-lines/royal-caribbean.html`).

5. **Sticky secondary nav (when used)**
   - **Scope**: All HTML files with multiple sections (e.g., `https://www.cruisinginthewake.com/packing-lists.html`, `https://www.cruisinginthewake.com/ships/ships.html`).
   - Pages with many sections include a sticky, pill-based section nav placed directly below the header.
   - Each section must have a stable `id` anchor. Use `scroll-margin-top` in CSS to avoid overlap.

6. **Versioning**
   - **Scope**: All HTML files except `https://www.cruisinginthewake.com/ships/rcl/grandeur-of-the-seas.html`.
   - Every updated page (except Grandeur) shows version v2.229 in `<title>` and a badge in the brand block.
   - Current version: v2.229. Increment in steps of **+0.001** for any shipped change affecting multiple pages or templates.
   - `https://www.cruisinginthewake.com/ships/rcl/grandeur-of-the-seas.html` retains its current version unless deliberately updated.
   - When a file is updated, increment the version site-wide as directed by the owner.

7. **Accessibility (a11y)**
   - **Scope**: All HTML files.
   - Use meaningful headings in order (h1→h2→h3).
   - Add `role="img"` + `aria-label` on hero containers.
   - Use `aria-labelledby` to connect cards with their headings.
   - Add `alt=""` for decorative images (e.g., compass) and descriptive `alt` for content images.
   - Ensure nav and accordion elements are keyboard-accessible and visible focus states exist.

8. **Performance & SEO basics**
   - **Scope**: All HTML files.
   - Optimize images (JPG preferred; PNG only for transparency/line art).
   - `loading="lazy"` for non-hero images.
   - Canonical link and OpenGraph/Twitter meta set on content pages.
   - Prefer 16:9 hero and OG images for rich sharing.
   - Every ship page includes:
     - `<title>` with ship name + brand (e.g., “Icon of the Seas — Royal Caribbean”).
     - `<meta name="description">` with 1–2 polished sentences.
     - Open Graph (`og:title`, `og:description`, `og:image`, `og:url`).
     - Twitter card equivalent (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`).
     - JSON-LD schema for Cruise Ship pages.
   - Root, restaurants, ports, etc., follow similar meta hygiene for SEO continuity.
   - Grandeur’s meta tags provided as snippets for user insertion only.

9. **Attribution (images + videos) — required**
   - **Scope**: All HTML files using images/videos.
   - All images must include attribution at the bottom of the page.
   - Your own photos must link to your photography site (e.g., `http://www.flickersofmajesty.com/`) for traffic.
   - Third-party/Wikimedia photos must include creator, license, and source link.
   - Video credits show title + channel (linked).
   - Attribution must include “All rights reserved” in the copyright notice.

10. **No duplicate CSS/headers**
    - **Scope**: All HTML files.
    - Do not paste header styling or HTML variants into body content. Use the standardized header markup + shared CSS only.

---

## 2) Repository Layout & Conventions (applies to all HTML files)

```
/assets
  /brand/                 # Logos/wordmarks
  /videos/                # Ship video manifests + master lists
  /images/                # Watermark and other assets
  styles.css              # Unified, single stylesheet
  /vendor/swiper/         # Swiper assets (swiper-bundle.min.css, swiper-bundle.min.js)

/cruise-lines/            # One page per cruise line (absolute linked)
  royal-caribbean.html
  carnival.html
  msc-cruises.html
  ...

/data
  /registry/              # Crosslink/anchor registries
    restaurants.json      # Restaurant anchors (per line/ship)
    ports.json            # Port anchors
    video_synonyms.json   # Fuzzy-match terms by category
    trusted_channels.json # Whitelist for preferred creators/channels
    video_blocklist.json  # Known-bad IDs/channels
    fleet_index.json      # Authoritative roster of cruise lines and ships
    site_tree.json        # Site tree mapping all pages and locations

/ships/                   # One page per ship
  rcl/icon-of-the-seas.html
  rcl/wonder-of-the-seas.html
  rcl/legend-of-the-seas-1995.html  # Historical ship
  carnival/carnival-celebration.html
  ...

index.html                # Home
restaurants.html          # Restaurants & Menus hub
ports.html                # Ports hub
disability-at-sea.html    # Disability at Sea
drink-packages.html       # Drink Packages
packing-lists.html        # Packing Lists
solo.html                 # Solo
travel.html               # Travel
```

- **Required pages**: For every cruise line and ship in `/data/registry/fleet_index.json`, create corresponding pages in `/cruise-lines/` and `/ships/<line>/`. For Royal Caribbean International (RCI) and Carnival Cruise Line, this includes all current, former (labeled “Historical Ship”), and coming soon ships (placeholders until operational). If content is missing, use “Coming soon” placeholders.
- **Root pages**: Homepage, packing, drinks, ports, restaurants, solo, travel, disability, cruise-lines follow similar meta hygiene and Grandeur’s structural model (e.g., Welcome card on root).
- **Deprecated**: `/lines/` folder is replaced by `/cruise-lines/`.
- **Folder & File Presence Rule** (v2.224):
  - Every ship in `fleet_index.json` must live under `/ships/<normalized-cruise-line>/`.
    - Example: “Grandeur of the Seas” → `/ships/rcl/grandeur-of-the-seas.html”
    - Normalization examples: Royal Caribbean International → `rcl`, Carnival Cruise Line → `ccl`.
  - If a file is missing, create it (standards-compliant placeholder).
  - If a folder is missing, create it before adding ships.
  - Auto-create cap: If >10 ship files are missing in a compliance run, create at most 10 (highest-priority lines first per owner list).
- **Site Tree Maintenance** (v2.226):
  - A site tree (`/data/site_tree.json`) must be maintained, updated with every new page addition.
  - Format example: See §14.7 for the generated site tree based on provided text.
  - Update process: Add new pages to `site_tree.json` during page creation, ensuring all paths are absolute and reflect `/data/registry/fleet_index.json`. Verify against `fleet_index.json` to ensure all ships are included.

### Royal Caribbean International Ship Coverage
- **Current Ships (26)**: Icon of the Seas, Utopia of the Seas, Star of the Seas, Wonder of the Seas, Odyssey of the Seas, Spectrum of the Seas, Symphony of the Seas, Harmony of the Seas, Ovation of the Seas, Anthem of the Seas, Quantum of the Seas, Freedom of the Seas, Independence of the Seas, Liberty of the Seas, Mariner of the Seas, Explorer of the Seas, Adventure of the Seas, Voyager of the Seas, Vision of the Seas, Rhapsody of the Seas, Radiance of the Seas, Brilliance of the Seas, Serenade of the Seas, Jewel of the Seas, Grandeur of the Seas, Enchantment of the Seas.
- **Former Ships (7, Historical)**: Song of Norway, Nordic Empress, Majesty of the Seas, Sovereign of the Seas, Monarch of the Seas, Legend of the Seas (1995-built), Splendour of the Seas.
- **Coming Soon Ships (5)**: Legend of the Seas (Icon-class, 2026), Icon-class Ship (TBN, 2027), Icon-class Ship (TBN, 2028), Star-class Ship (TBN, 2028), Quantum Ultra-class Ship (TBN, 2028), Quantum Ultra-class Ship (TBN, 2029).
- **Implementation**: Each ship requires a page at `/ships/rcl/[ship-slug].html` (e.g., `/ships/rcl/icon-of-the-seas.html`, `/ships/rcl/legend-of-the-seas-1995.html` for historical). Update `/data/registry/fleet_index.json` and `/data/site_tree.json` to include all RCI ships under `cruise_lines[royal-caribbean].ships`.

### Carnival Cruise Line Ship Coverage
- **Current Ships (29)**: Carnival Adventure, Carnival Breeze, Carnival Celebration, Carnival Conquest, Carnival Dream, Carnival Elation, Carnival Encounter, Carnival Firenze, Carnival Freedom, Carnival Glory, Carnival Horizon, Carnival Jubilee, Carnival Legend, Carnival Liberty, Carnival Luminosa, Carnival Magic, Carnival Mardi Gras, Carnival Miracle, Carnival Panorama, Carnival Paradise, Carnival Pride, Carnival Radiance, Carnival Spirit, Carnival Splendor, Carnival Sunrise, Carnival Sunshine, Carnival Valor, Carnival Venezia, Carnival Vista.
- **Former Ships (5, Historical)**: Carnival Ecstasy, Carnival Fantasy, Carnival Fascination, Carnival Inspiration, Carnival Sensation.
- **Coming Soon Ships (2)**: Carnival Festivale (Excel-class, 2027), Carnival Tropicale (Excel-class, 2028).
- **Implementation**: Each ship requires a page at `/ships/carnival/[ship-slug].html` (e.g., `/ships/carnival/carnival-celebration.html`). Update `/data/registry/fleet_index.json` and `/data/site_tree.json` to include all Carnival ships under `cruise_lines[carnival].ships`.

---

## 3) Required Card Order (Ship Pages Only)
- **Scope**: Only ship pages in `/ships/<line>/` (e.g., `/ships/rcl/icon-of-the-seas.html`, `/ships/carnival/carnival-breeze.html`). Excludes root pages (`/index.html`, etc.), `/cruise-lines/`, and `/ships/ships.html`.
- Render these cards in this exact order for every ship page:
  1. **A First Look**  
     ```html
     <section class="card" aria-labelledby="first-look">
       <h2 id="first-look">A First Look</h2>
       <!-- 3 images in .grid-2 -->
     </section>
     ```
  2. **Why Book {Ship}?** (Marketing blurb; placeholder if unsourced)  
     ```html
     <section class="card" aria-labelledby="why-book">
       <h2 id="why-book">Why Book {Ship}?</h2>
       <!-- Blurb text -->
     </section>
     ```
     - Placeholder: _“Overview coming soon. Summarize top reasons to book — dining standouts, entertainment, itineraries, and who this ship fits best.”_
  3. **Ken’s Logbook — A Personal Review** (placeholder permitted)  
     ```html
     <section class="card" aria-labelledby="personal-review">
       <h2 id="personal-review">Ken’s Logbook — A Personal Review</h2>
       <!-- Review text -->
     </section>
     ```
  4. **Watch: {Ship} Highlights** — single swiper for all embeds  
     ```html
     <section class="card" aria-labelledby="video-highlights">
       <h2 id="video-highlights">Watch: {Ship} Highlights</h2>
       <!-- Single swiper with 1 best per category -->
     </section>
     ```
  5. **Two-up row: Deck Plans (left) + Live Tracker (right)**  
     ```html
     <div class="grid-2">
       <section class="card" aria-labelledby="deck-plans">
         <h2 id="deck-plans">Ship Layout (Deck Plans)</h2>
         <!-- Official link/PDF -->
       </section>
       <section class="card" aria-labelledby="live-tracker">
         <h2 id="live-tracker">Where Is {Ship} Right Now?</h2>
         <!-- Tracker embed -->
       </section>
     </div>
     ```
  6. **Attribution & Credits**  
     ```html
     <section class="card" aria-labelledby="attribution">
       <h2 id="attribution">Attribution & Credits</h2>
       <!-- <ul> list of credits -->
     </section>
     ```
- **Pass criteria**: Each required `id` exists and appears in strictly increasing index order within `<main>`.

---

## 4) Watermark (Fouled Anchor)
- **Scope**: All HTML files.
- Inject the CSS **in `<head>`** with id `watermark-style` and an **absolute** path:
  ```html
  <style id="watermark-style">
    html, body { position: relative; }
    body::before {
      content: "";
      position: fixed;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: min(60vw, 900px);
      height: min(60vh, 900px);
      background: url('/assets/watermark.png') no-repeat center / contain;
      opacity: 0.08;
      pointer-events: none;
      z-index: 0;
    }
    main, header, footer, section, nav { position: relative; z-index: 1; }
  </style>
  ```
- **No relative paths.** `url('/assets/watermark.png')` is required.

---

## 5) Deck Plans + Live Tracker Grid (Ship Pages Only)
- **Scope**: Only ship pages in `/ships/<line>/`.
- Must be wrapped in a `.grid-2` container that enforces a 2-up layout on desktop:
  ```html
  <style id="grid-2-style">
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
    @media (max-width: 900px) { .grid-2 { grid-template-columns: 1fr; } }
  </style>
  ```
- Left column: Deck Plans card with official deck plan link (e.g., CruiseMapper: `/deckplans/[Ship-Name]-[ID]`).
- Right column: Live tracker link (e.g., CruiseMapper or substitute).

---

## 6) Video Rules (Ship Pages Only)
- **Scope**: Only ship pages in `/ships/<line>/`.
- **Single swiper** per page under **Watch: {Ship} Highlights**, sourced from `/assets/videos/rc_ship_videos.json` (for RCI) or `/assets/videos/carnival_ship_videos.json` (for Carnival).
- Category coverage **on page**: Walkthrough; Cabins (Interior, Ocean View, Balcony, Suite); Dining; Accessibility; Top 10/Things to Do.
- **Minimum videos**: At least 3 (Overview/Walkthrough, Cabins, Dining) and 1 Accessibility video per ship before a page is considered “complete.”
- **Green list preference**: Pick a green-listed creator (e.g., Royal Caribbean Blog, Cruises It); otherwise, select a high-quality non-green video.
- **JSON capacity**: Up to 10 items per category; **page embed** shows only 1 best per category.
- **Compliance**: Page fails if Highlights exists but 0 slides render; Swiper controls + init must be present; watermark path must be absolute (`/assets/watermark.png`).
- Swiper assets are absolute: `/assets/vendor/swiper/swiper-bundle.min.css` and `/assets/vendor/swiper/swiper-bundle.min.js`.
- Swiper init script at end of `<body>`; controls present in the highlights block.

### Video Category Fuzzy Matching
- **Walkthrough**: "walkthrough", "ship tour", "full tour", "complete ship tour", "top to bottom", "Full Walkthrough", "Ship Tour", "Ship Tour & Review", "Tour & Review", "Complete Walkthrough", "Complete Tour", "Ship Review", "Onboard Tour", "deck by deck", "guided tour", "vlog tour", "virtual tour", "360 tour".
- **Dining**: "dining", "restaurants", "menus", "food", "buffet", "specialty", "Main Dining Room", "MDR", "Nights of Dinners", "5 Nights of Dinners", "Dinner Menu", "Lunch Menu", "Breakfast Menu", "Specialty Dining Review", "Windjammer", "Chops", "Giovanni", "Izumi", "Johnny Rockets", "Cuisine", "Chef", "Guy’s Burger", "Bonsai Sushi", "Fahrenheit 555", "Cucina del Capitano", "food review", "dining experience".
- **Accessibility (♿)**: "accessible", "wheelchair", "ADA", "mobility", "scooter", "disability", "accessible cabin", "disabled cruise"; prefer creators like Wheelchair Travel, World on Wheels.
- **Cabin buckets**:
  - **Interior**: "interior", "inside", "promenade interior", "virtual balcony", "Cloud 9 Spa Interior", "Family Harbor Interior", "Havana Interior".
  - **Ocean View**: "ocean view", "oceanview", "panoramic", "Cloud 9 Spa Ocean View", "Family Harbor Ocean View".
  - **Balcony**: "balcony", "Cove Balcony", "Aft-View Extended Balcony", "Cloud 9 Spa Balcony", "Family Harbor Balcony", "Havana Balcony", "Boardwalk Balcony", "Central Park Balcony", "Surfside Family View Balcony".
  - **Suite**: "suite", "owner", "grand", "royal", "loft", "villa", "aqua theater", "aqua theatre", "star loft", "Junior Suite", "Family Suite", "Cloud 9 Spa Suite", "Family Harbor Suite", "Havana Suite", "Ultimate Family Suite".
- **Top 10/Things to Do**: "top 10", "things to do", "activities", "entertainment", "what to do", "best onboard", "attractions", "FlowRider", "Aqua Theater", "SkyRide", "WaterWorks", "Carnival Kitchen", "comedy club", "playlist productions", "punchliner".
- **Accessibility captions**: Prefix with **♿**.

### Video Sourcing & Runtime Additions
- **Sources** (searched in order):
  1. `/data/video_sources.json`
  2. `/video_sources.json` (repo root if present)
  3. `/ships/video_sources.json`
  4. Fuzzy-match lookups using `/data/registry/video_synonyms.json` with historical/alternate names.
  5. If still missing, perform a targeted YouTube search:
     - Query pattern: `"<Ship Name>" "<Cruise Line>" [category] 2025` (e.g., "Icon of the Seas Royal Caribbean walkthrough 2025").
     - Prefer channels in `trusted_channels.json`.
     - Exclude results in `video_blocklist.json`.
     - Choose at least 1 per category: Overview/Walkthrough, Cabins, Dining, Accessibility.
     - If none found, mark as TODO in compliance report.
- **Tools for Video Sourcing**:
  - **Grok Tools**:
    - `web_search`: Query YouTube/Google for "[ship name] [cruise line] [category] 2025" (e.g., “Carnival Breeze Carnival walkthrough 2025”).
    - `browse_page`: Scrape YouTube channel pages or search results for video URLs.
    - `view_x_video`: Validate video quality (resolution ≥720p, duration 2–15 min, subtitles preferred).
    - `x_keyword_search`, `x_semantic_search`: Search X for user recommendations (e.g., “best Carnival Jubilee dining video”).
  - **ChatGPT Tools**:
    - Web search plugins (e.g., WebPilot, BrowserOp): Query YouTube/Google for videos.
    - **Beautiful Soup**: Parse HTML from search results or channel pages to extract `<a>` tags with YouTube URLs (e.g., `soup.find_all('a', href=re.compile(r'https://www\.youtube\.com/watch\?v='))`).
    - **Regex**: Extract specific patterns from HTML/text (e.g., `re.findall(r'https://www\.youtube\.com/watch\?v=[a-zA-Z0-9_-]+', html)` for video URLs).
    - Content analysis: Validate relevance via title/description parsing.
    - Manual validation: Prompt user for confirmation if automated checks fail.
  - **Process**: Add retrieved videos to `/assets/videos/rc_ship_videos.json` (RCI) or `/assets/videos/carnival_ship_videos.json` (Carnival) at runtime, capping at 10 per category. Use absolute URLs (`https://www.youtube.com/watch?v=...` or `https://youtu.be/...`). Stage links for review with credits if quality uncertain.

### Image Sourcing Additions
- Minimum 3 content images per ship page (hero excluded).
- Use local assets if present under `/assets/`, `/assets/ships/`, `/ships/assets/` (fuzzy match by ship name, e.g., "icon-of-the-seas1.jpg").
- If <3 local images, use `web_search` for "[ship name] cruise ship photos Wikimedia" and hotlink CC-licensed images.
- **Tools for Image Sourcing**:
  - **Grok Tools**:
    - `web_search`: Query Wikimedia Commons/Google Images for “[ship name] cruise ship [category]” (e.g., “Icon of the Seas exterior”).
    - `view_image`: Verify resolution (≥800px wide), license (CC BY-SA/PD), and relevance.
  - **ChatGPT Tools**:
    - Web search plugins: Query Wikimedia Commons/Google Images for CC-licensed images.
    - **Beautiful Soup**: Parse HTML to extract `<img>` tags (e.g., `soup.find_all('img', src=re.compile(r'https://upload\.wikimedia\.org/.*\.jpg'))`).
    - **Regex**: Extract image URLs from HTML (e.g., `re.findall(r'src="(https://upload\.wikimedia\.org/[^"]+\.jpg)"', html)`).
    - Image preview plugins: Validate resolution/relevance via metadata or visual inspection.
    - Manual validation: Prompt user if automated checks fail.
  - **Process**: Auto-add up to 3 content images per ship if missing, prioritizing Wikimedia Commons. Include creator, license, and source link in Attribution section. Use absolute URLs and descriptive `alt` text (e.g., “Carnival Breeze exterior at sea”).

---

## 7) CI / Compliance Checks (Ship Pages Only)
- **Scope**: Only ship pages in `/ships/<line>/`.
- Each ship page is evaluated on:
  1. **Pathing** (folder & filename) — ✅/❌
  2. **Absolute URLs only** — ✅/❌
  3. **Header/Hero pattern matches Grandeur** — ✅/❌
  4. **Primary nav links present & absolute** — ✅/❌
  5. **Version badge/title ≥ v2.229** — ✅/❌
  6. **Card order & presence** (`first-look`, `why-book`, `personal-review`, `video-highlights`, `deck-plans`, `live-tracker`, `attribution`) — ✅/❌
  7. **No duplicate cards** — ✅/❌
  8. **SEO meta present** — ✅/❌
  9. **Accessibility basics** (heading order, aria labels, alts) — ✅/❌
  10. **Images ≥ 3 (content)** — ✅/❌
  11. **Videos ≥ 3 (Overview, Cabins, Dining)** — ✅/❌
  12. **Attribution present & “All rights reserved”** — ✅/❌
  13. **Fleet index coverage** (page exists for each ship) — ✅/❌
  14. **Auto-create up to 10 missing files this run** — action log included.
- **Output**: Cruise line → ship → per-item ✅/❌, with summary and action log (files created/moved, videos wired, images added).

---

## 8) Packing Page (Special Rules)
- **Scope**: Only `/packing-lists.html`.
- Divided into sections: Carry-On, Men, Women, Everyone, Families, Tips.
- Includes secondary sticky pill nav anchored to each section with stable `id` anchors.
- Cards are collapsible using `<details><summary>` elements.
- Tips section remains detailed, not overly reduced.
- Affiliate disclosure appears in the footer as a polished banner.

---

## 9) Process & Escalation Rules (applies to all HTML files)
- **Double-check work before shipping**: Confirm headers match `/ships/rcl/grandeur-of-the-seas.html`, no duplicate elements, videos wired in (ship pages only), meta tags present, absolute URLs, correct version bump (v2.229), and `/data/site_tree.json` updated.
- **Deliver updates as drop-in zips**: Ensure Safari-safe compatibility.
- **Escalation**: If anything is unclear, incomplete, or at risk of regression, stop and ask. Never guess or apply shortcuts to prevent continuity breaks. The user has emphasized avoiding regressions, potentially onboarding Grok as a “master AI” if continuity fails.

---

## 10) Recovery & Guardrails (applies to all HTML files)
- When a page deviates from standards, **rebuild `<main>` and footer** deterministically to restore compliance (ship pages use §3 card order; others use Grandeur’s general structure).
- Preserve existing Deck Plans and Live Tracker URLs if present; otherwise insert defaults (e.g., CruiseMapper links for RCI/Carnival ships).
- If anything is unclear, incomplete, or at risk of regression, stop and ask. Never guess or apply shortcuts to prevent continuity breaks.
- **Never overwrite without backup**: Any automated write must create a time-stamped backup under `/data/registry/_backups/` or `/ships/_backups/`.

---

## 11) Historical Ship & Coming Soon (Ship Pages Only)
- **Scope**: Only ship pages in `/ships/<line>/`.
- Past ships show a distinct **Historical Ship** badge near the title.
- Coming soon pages clearly state status and intended class/capacity with placeholders.

---

## 12) Change Log (consolidated excerpts)
- **v2.229** — Integrated generated `site_tree.json` from provided text, addressing compliance report pathing issues (e.g., RCI ships in `/ships/` vs. `/ships/rcl/`). Reinforced site tree maintenance (§2). Enhanced video/image sourcing with regex and Beautiful Soup for ChatGPT compatibility, adding ship-specific fuzzy terms (e.g., “FlowRider”, “SkyRide”). Version bumped to v2.229 for multi-page changes.
- **v2.228** — Integrated regex as a ChatGPT-compatible tool for video/image sourcing (§6) alongside Beautiful Soup, complementing Grok’s tools. Enhanced fuzzy matching with ship-specific terms. Retained site tree maintenance and clarified rule scopes.
- **v2.227** — Integrated Beautiful Soup as a ChatGPT-compatible tool for video/image sourcing (§6), retained site tree maintenance, enhanced video/image robustness, clarified rule scope (ship-specific vs. all HTML files).
- **v2.226** — Added site tree maintenance rule (`/data/site_tree.json`) to track page locations for AI reference. Enhanced video/image sourcing with Grok/ChatGPT tool specifications and expanded fuzzy matching. Clarified rule scope: card order (§3), Deck Plans (§5), Video Rules (§6), CI Checks (§7), Historical/Coming Soon (§11) apply only to ship pages in `/ships/<line>/`.
- **v2.225** — Added enhancements for video/image robustness, tool listings for YouTube checks, and page structure scope clarifications.
- **v2.224** — Added enhanced Video Compliance, Auto-Create up to 10 missing ship files, Folder presence checks, Video sourcing escalation, Image sourcing additions, and expanded CI checklist to 14 items.
- **v2.223** — Adopted §1.1’s Absolute URLs wording as gold standard, retained §0 instance. Updated Grandeur path to `/ships/rcl/grandeur-of-the-seas.html`. Consolidated Versioning into §1.6. Retained Watermark and Crosslinking instances.
- **v2.222** — Integrated v1.0 ruleset, added additive-only rule, incorporated RCI ship list, ensured historical/coming soon labeling, added crosslinking/video categories.
- **v2.220** — Enforced absolute asset paths, watermark, grid layout, video policy (max 10), CI rebuild checks.
- **v2.217** — Expanded Dining fuzzy terms.
- **v2.214** — Enforced absolute paths, grid layout, video policy, CI checks.
- **v2.210** — Added Dining fuzzy terms.
- **v2.209** — Added Walkthrough terms, **Cruises It** to Green List.
- **v2.208** — Enforced card order, single swiper, footer-last.
- **v2.204** — Added **Harr Travel** to Green List, tuned cabin fuzzy search.
- **v2.203** — Required Accessibility video, defined cabin buckets.
- **v1.0** — Established core rules: absolute links, centralized CSS, Grandeur standard, versioning, nav, SEO, crosslinking, video categories, historical labeling, file organization, packing structure, double-check, escalation.

---

## 13) Templates & Snippets

### 13.1 Meta (example)
```html
<title>Icon of the Seas — Royal Caribbean — In the Wake (v2.229)</title>
<link rel="canonical" href="https://jsschrstrcks1.github.io/InTheWake/ships/rcl/icon-of-the-seas.html"/>
<meta name="description" content="Icon of the Seas at a glance — photos, dining, cabins, videos, and tips curated for clarity."/>

<meta property="og:type" content="website"/>
<meta property="og:title" content="Icon of the Seas — Royal Caribbean — In the Wake"/>
<meta property="og:description" content="Photos, dining, cabins, videos, and tips."/>
<meta property="og:url" content="https://jsschrstrcks1.github.io/InTheWake/ships/rcl/icon-of-the-seas.html"/>
<meta property="og:image" content="https://jsschrstrcks1.github.io/InTheWake/ships/assets/icon-of-the-seas1.jpg"/>

<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="Icon of the Seas — Royal Caribbean — In the Wake"/>
<meta name="twitter:description" content="Photos, dining, cabins, and tips."/>
<meta property="twitter:image" content="https://jsschrstrcks1.github.io/InTheWake/ships/assets/icon-of-the-seas1.jpg"/>

<script type="application/ld+json">
{
  "@context": "http://schema.org",
  "@type": "Cruise",
  "name": "Icon of the Seas",
  "brand": {
    "@type": "Brand",
    "name": "Royal Caribbean International"
  },
  "description": "Icon of the Seas offers thrilling adventures with innovative features like the Ultimate Abyss slide and Perfect Day at CocoCay."
}
</script>
```

### 13.2 Ship image block (example)
```html
<section class="card" aria-labelledby="photos">
  <h2 id="photos">Photos</h2>
  <div class="grid-2">
    <img src="https://jsschrstrcks1.github.io/InTheWake/ships/assets/icon-of-the-seas1.jpg" alt="Icon of the Seas exterior at sea" loading="lazy">
    <img src="https://jsschrstrcks1.github.io/InTheWake/ships/assets/icon-of-the-seas2.jpg" alt="Icon of the Seas pool deck" loading="lazy">
    <img src="https://jsschrstrcks1.github.io/InTheWake/ships/assets/icon-of-the-seas3.jpg" alt="Icon of the Seas promenade" loading="lazy">
  </div>
</section>
```

### 13.3 Attribution block (example)
```html
<section class="card" aria-labelledby="credits">
  <h2 id="credits">Attribution & Credits</h2>
  <ul>
    <li>Photo © Ken Baker — <a href="http://www.flickersofmajesty.com/">Portfolio</a></li>
    <li>Photo via Wikimedia Commons — <a href="WIKI_FILE_URL">Author Name</a>, <a href="LICENSE_URL">License</a></li>
    <li>Video: <a href="YOUTUBE_URL">“Title”</a> — <a href="CHANNEL_URL">Channel Name</a></li>
  </ul>
</section>
```

---

## 14) Registries (JSON) — Shapes

### 14.1 `restaurants.json` (anchors)
```json
{
  "royal-caribbean": {
    "icon-of-the-seas": {
      "chops-grille": "rc-chops-grille",
      "izumi": "rc-izumi"
    }
  },
  "carnival": {
    "carnival-celebration": {
      "guys-burger-joint": "ccl-guys-burger",
      "fahrenheit-555": "ccl-fahrenheit-555"
    }
  },
  "msc-cruises": {
    "msc-world-america": {
      "butchers-cut": "msc-butchers-cut"
    }
  }
}
```

### 14.2 `ports.json` (anchors)
```json
{
  "caribbean": {
    "cozumel": "port-cozumel",
    "nassau": "port-nassau"
  },
  "mediterranean": {
    "barcelona": "port-barcelona"
  }
}
```

### 14.3 `video_synonyms.json`
```json
{
  "walkthrough": ["walkthrough", "ship tour", "full tour", "complete ship tour", "top to bottom", "Full Walkthrough", "Ship Tour", "Ship Tour & Review", "Tour & Review", "Complete Walkthrough", "Complete Tour", "Ship Review", "Onboard Tour", "deck by deck", "guided tour", "vlog tour", "virtual tour", "360 tour"],
  "top-10-things-to-do": ["top 10", "things to do", "activities", "entertainment", "what to do", "best onboard", "attractions", "FlowRider", "Aqua Theater", "SkyRide", "WaterWorks", "Carnival Kitchen"],
  "cabins": ["cabin", "stateroom", "suite", "balcony", "inside", "oceanview", "promenade interior", "virtual balcony", "Cloud 9 Spa Interior", "Family Harbor Interior", "Havana Interior", "Cloud 9 Spa Ocean View", "Family Harbor Ocean View", "Cove Balcony", "Aft-View Extended Balcony", "Cloud 9 Spa Balcony", "Family Harbor Balcony", "Havana Balcony", "Boardwalk Balcony", "Central Park Balcony", "Surfside Family View Balcony", "room tour", "stateroom review"],
  "dining": ["dining", "restaurants", "menus", "food", "buffet", "specialty", "Main Dining Room", "MDR", "Nights of Dinners", "5 Nights of Dinners", "Dinner Menu", "Lunch Menu", "Breakfast Menu", "Specialty Dining Review", "Windjammer", "Chops", "Giovanni", "Izumi", "Johnny Rockets", "Cuisine", "Chef", "Guy’s Burger", "Bonsai Sushi", "Fahrenheit 555", "Cucina del Capitano", "food review", "dining experience"],
  "entertainment": ["shows", "ice show", "aqua theater", "music", "activities", "nightlife", "comedy club", "playlist productions", "punchliner"],
  "kids": ["kids", "family", "teen", "adventure ocean", "nursery", "Camp Ocean", "Circle C", "Club O2"],
  "tips": ["tips", "hacks", "advice", "planning", "mistakes", "first-timer", "cruise tips"],
  "accessibility": ["accessible", "wheelchair", "ADA", "mobility", "scooter", "disability", "accessible cabin", "disabled cruise"]
}
```

### 14.4 `trusted_channels.json`
```json
["Royal Caribbean Blog", "Gary Bembridge", "Emma Cruises", "Ben & David", "Cruises It", "Harr Travel", "Wheelchair Travel", "World on Wheels"]
```

### 14.5 `video_blocklist.json`
```json
["YOUTUBE_ID_TO_EXCLUDE", "ANOTHER_BAD_ID"]
```

### 14.6 `fleet_index.json` (example with RCI and Carnival integration)
```json
{
  "cruise_lines": [
    {
      "name": "Royal Caribbean International",
      "slug": "royal-caribbean",
      "ships": [
        {"name": "Icon of the Seas", "slug": "icon-of-the-seas", "status": "active"},
        {"name": "Utopia of the Seas", "slug": "utopia-of-the-seas", "status": "active"},
        {"name": "Star of the Seas", "slug": "star-of-the-seas", "status": "active"},
        {"name": "Wonder of the Seas",

<!-- END SOURCE: InTheWake_Standards_v2.229.markdown -->


<!-- BEGIN SOURCE: InTheWake_Standards_v3.001_bundle.zip:standards/main-standards.md -->


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

<!-- END SOURCE: InTheWake_Standards_v3.001_bundle.zip:standards/main-standards.md -->


<!-- BEGIN SOURCE: InTheWake_Standards_v3.001_bundle.zip:standards/root-standards.md -->


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

<!-- END SOURCE: InTheWake_Standards_v3.001_bundle.zip:standards/root-standards.md -->


<!-- BEGIN SOURCE: InTheWake_Standards_v3.001_bundle.zip:standards/ships-standards.md -->


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

<!-- END SOURCE: InTheWake_Standards_v3.001_bundle.zip:standards/ships-standards.md -->


<!-- BEGIN SOURCE: InTheWake_Standards_v3.001_bundle.zip:standards/cruise-lines-standards.md -->


# In the Wake — Cruise Lines Standards (v3.001)

## Pages
- Use absolute URLs rooted at https://www.cruisinginthewake.com.
- Cross-link to ship pages under `/ships/<line>/<slug>.html` and hub `/ships/index.html`.

## Caching
- Include `site-cache.js` and the pre-warm snippet (same as Root).
- Benefit: users entering via line hubs get data cached before visiting ships/restaurants.

<!-- END SOURCE: InTheWake_Standards_v3.001_bundle.zip:standards/cruise-lines-standards.md -->


<!-- BEGIN SOURCE: InTheWake_Standards_v3.002.md -->

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

<!-- END SOURCE: InTheWake_Standards_v3.002.md -->


<!-- BEGIN SOURCE: restaurants-standards_v2.256_maritime-dining.md -->

# Restaurants Standards — Maritime Dining Revision (v2.256.003)

## R-1 Canonical Venue Pages
- One canonical page per venue at `/restaurants/<slug>.html` (e.g., `/restaurants/chops-grille.html`).
- Ship pages must link to the canonical venue page; venue page must link back to ship pages where available.

## R-2 Variants & One‑Off Menus
- Ship‑ or class‑specific items live within the canonical page under **Ship‑Specific Variants** and receive a stable anchor (e.g., `#icon-class-variant`).
- Ship dining cards may deep‑link directly to the variant anchor.

## R-3 Menus & Prices
- Include **Core Menu (Fleetwide Standard)** with prices when verified. Unverified entries must be labeled and placed behind a **To Verify** note.
- Global price disclaimer: “Prices are subject to change at any time without notice. These represent what they were the last time I sailed.”

## R-4 Special Accommodations
- Dedicated card for gluten‑free, vegetarian, and allergy protocols. Include pre‑sailing notification guidance and onboard confirmation.

## R-5 Logbook — Dining Disclosures
- Use adapted Logbook disclosures (A/B/C) for dining. Example B: “Aggregate of vetted guest soundings… trimmed and edited to our dining standards.”
- Place immediately under the Logbook header, inside a `.pill` element.

## R-6 Styling & Compliance
- Absolute URLs everywhere; include `<meta name="referrer" content="no-referrer">`.
- Watermark `https://www.cruisinginthewake.com/assets/watermark.png` at ~0.08 opacity on cards.
- Version badge present on every restaurant page.

<!-- END SOURCE: restaurants-standards_v2.256_maritime-dining.md -->


<!-- BEGIN SOURCE: STANDARDS_v3.002a.md -->

# In the Wake — HTML & Service Worker Standards (v3.002a)

This document defines the required structure, scripts, and behavior for all In the Wake pages as of version 3.002a.  
It supersedes v3.001–v3.002 where noted.

---

## 1. Core Meta & Head Standards

- All pages **must declare** the following:
  - `<meta charset="utf-8">`
  - `<meta name="viewport" content="width=device-width, initial-scale=1">`
  - `<meta name="referrer" content="no-referrer">`
  - `<meta name="robots" content="index, follow">`
  - `<link rel="canonical" href="https://www.cruisinginthewake.com/[page].html">`
  - `<meta property="og:type" content="website">`
  - `<meta property="og:site_name" content="In the Wake">`
  - `<meta name="twitter:card" content="summary_large_image">`

---

## 2. Absolute URL Normalizer (Required on Every Page)

Ensures all links and images point to the current origin, even on forks or local builds.

```html
<script>
(function(){
  var ORIGIN=(location.origin||(location.protocol+'//'+location.host)).replace(/\/$/,'');
  window._abs=function(path){ path=String(path||''); if(!path.startsWith('/')) path='/'+path; return ORIGIN+path; };
  document.addEventListener('DOMContentLoaded',function(){
    var sel=[
      'a[href^="https://www.cruisinginthewake.com/"]',
      'img[src^="https://www.cruisinginthewake.com/"]',
      'link[href^="https://www.cruisinginthewake.com/"]',
      'script[src^="https://www.cruisinginthewake.com/"]'
    ].join(',');
    document.querySelectorAll(sel).forEach(function(el){
      var attr=el.hasAttribute('href')?'href':'src';
      try{
        var u=new URL(el.getAttribute(attr));
        el.setAttribute(attr, ORIGIN+u.pathname+u.search+u.hash);
      }catch(e){}
    });
  },{once:true});
})();
</script>
```

---

## 3. External Link Policy (New in v3.002a)

All **external links** (non-`cruisinginthewake.com`) must:
- Open in a **new tab** (`target="_blank"`)
- Use `rel="noopener noreferrer"`
- Not send referrer data

**Automatic Enforcement:**

```html
<script>
document.addEventListener('DOMContentLoaded', function(){
  document.querySelectorAll('a[href^="http"]').forEach(a=>{
    try {
      const u = new URL(a.href);
      if (u.hostname !== location.hostname) {
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener noreferrer');
      }
    } catch(_) {}
  });
}, {once:true});
</script>
```

---

## 4. SiteCache Integration & Race-Guard (v3.002+)

All pages that use `SiteCache` must include a race-guard loader to handle `defer` timing safely.

```js
function ensureSiteCache(){
  return new Promise((resolve)=>{
    if (window.SiteCache && typeof SiteCache.getJSON==='function') return resolve();
    const s=document.createElement('script');
    s.src=_abs('/assets/js/site-cache.js'); s.defer=true;
    s.onload=resolve; s.onerror=resolve; // fail-open
    document.head.appendChild(s);
  });
}
```

---

## 5. JSON Data Version Paths

| File | Version Path |
|------|---------------|
| `/assets/data/fleet_index.json` | `version` |
| `/assets/data/venues.json` | `meta.version` |
| `/assets/data/personas/index.json` | `version` |

Use:
```js
SiteCache.getJSON(_abs('/assets/data/venues.json'), { ttlDays:7, versionPath:['meta','version'] })
```

---

## 6. Service Worker Policy (v3.002+)

### Registration
```html
<script>
if('serviceWorker' in navigator){
  window.addEventListener('load', function(){
    navigator.serviceWorker.register('/sw.js').catch(()=>{});
  });
}
</script>
```

### Pre-cache Manifest Trigger
Each page should **nudge** the SW to hydrate cache:
```js
try { fetch('/assets/cache-manifest.json', {cache:'no-store'}).catch(()=>{}); } catch(_){}
```

---

## 7. Image Cache Behavior

**Service Worker rules:**
- Caches only same-origin images
- Ignores querystrings when matching
- Uses **SWR** strategy: serve cache → refresh silently
- Soft cap: 200 entries (oldest evicted first)

---

## 8. Smart Warmup Standard (v1.6, v3.002-compliant)

Every page includes the warmup bootstrap for background prefetch of data and images.

**Key functions:**
- `warmGlobalJSON()` → prefetch fleet, venues, personas
- `warmShipSpecific(ctx)` → prefetch ship assets
- `warmRestaurants()` → preload hero & thumb images
- `warmChrome()` → preload logo, watermark, compass

All are triggered via `requestIdleCallback` (fallbacks to `setTimeout`).

---

## 9. Accessibility & WCAG Commitments

- Include skip link (`<a class="skip-link" href="#content">`)
- Use proper `aria-labelledby` and `aria-live` regions
- Ensure all focusable elements have visible focus styles
- Images require meaningful `alt` attributes or `aria-hidden="true"`
- Site conforms to **WCAG 2.1 AA** baseline

---

## 10. Performance & Security

- Use `Cache-Control: public, max-age=31536000, immutable` for versioned assets
- Prefer `.webp` or `.avif` for new image additions
- Use `rel="noopener"` on all external links (enforced by script)
- Optional: implement CSP (script-src 'self' https://cloud.umami.is)

---

### Version Footnote

- **Current Spec:** v3.002a  
- **Previous Spec:** v3.002  
- **Next Planned Revision:** v3.003 (Service Worker unification + offline shell)

<!-- END SOURCE: STANDARDS_v3.002a.md -->


<!-- BEGIN SOURCE: venue-standards_v2.257.zip:venue-standards.md -->


# Venue Page Standards (Restaurants, Bars, Cafés) — v2.257

> **Scope:** This spec governs every *venue* detail page under `/restaurants/…` and similar sections (bars, lounges, cafés) on **In the Wake**. It includes content, UX, data contracts, code patterns, accessibility, performance, governance, and QA checklists.  
> **Audience:** Writers, editors, developers, and future you. Treat this like we’re explaining it to “Grok the Bonehead” — ultra explicit with examples.

---

## 0. Quick Start (Author Flow)

1) **Create/Update JSON** in `/assets/data/venues.json` with the venue’s `slug`, `name`, `category`, `aliases`, `access`, `audience`, `blurb`, and tags. Ensure ship placement under `/ships` dataset maps this venue slug to ships.  
2) **Generate page** at `/restaurants/<slug>.html` using this spec’s HTML scaffold.  
3) **Add menu items** to `search_dict` (see §3.4) so searching “lobster” returns Chops + MDR, etc.  
4) **Verify price governance** ranges by ship class (Icon/Oasis → high; Vision/older → low).  
5) **Wire ship pills** (auto from JSON) under the header.  
6) **Add Persona Review** (one) with **Depth Soundings disclaimer**.  
7) **Drop in Allergen Micro-Component** (inline snippet).  
8) **Crosslink heavily** (ships, classes, dining hub, ports when relevant).  
9) **Run the QA checklist** (§10). Publish.

---

## 1. File Locations & Naming

- Venue pages live at: `/restaurants/<slug>.html` (e.g., `chops-grille.html`).
- Shared data: `/assets/data/venues.json` and `/assets/data/ships.json` (or combined dataset if you prefer).  
- Images: `/assets/venues/<slug>/…` (PNG/JPG/WebP). Prefer 1600px wide hero, 1200px inline.  
- Version param: always append `?v=<site-version>` to shared CSS/JS URLs.

---

## 2. Page Structure (HTML)

> Minimal, readable, standards-first. The **global hero** is used (no per-page hero overrides unless truly necessary).

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{{Venue Name}} — Royal Caribbean | In the Wake</title>

  <!-- Canonical + Open Graph -->
  <link rel="canonical" href="https://www.cruisinginthewake.com/restaurants/{{slug}}.html">
  <meta property="og:site_name" content="In the Wake">
  <meta property="og:type" content="article">
  <meta property="og:title" content="{{Venue Name}} — Royal Caribbean">
  <meta property="og:url" content="https://www.cruisinginthewake.com/restaurants/{{slug}}.html">
  <meta name="twitter:card" content="summary_large_image">

  <!-- Site CSS (pinned version) -->
  <link rel="stylesheet" href="https://www.cruisinginthewake.com/assets/styles.css?v={{site_version}}">

  <!-- Absolute URL normalizer (keeps current origin) -->
  <script>
    (function(){
      var ORIGIN=(location.origin||(location.protocol+'//'+location.host)).replace(/\/$/,'');
      window._abs=function(p){p=String(p||''); if(!p.startsWith('/')) p='/'+p; return ORIGIN+p;};
      function normalize(){
        var sel=[
          'a[href^="https://www.cruisinginthewake.com/"]',
          'img[src^="https://www.cruisinginthewake.com/"]',
          'link[href^="https://www.cruisinginthewake.com/"]',
          'script[src^="https://www.cruisinginthewake.com/"]'
        ].join(',');
        document.querySelectorAll(sel).forEach(function(el){
          var attr=el.hasAttribute('href')?'href':'src';
          try{var u=new URL(el.getAttribute(attr)); el.setAttribute(attr, ORIGIN+u.pathname+u.search+u.hash);}catch(e){};
        });
      }
      if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',normalize,{once:true});}else{normalize();}
    })();
  </script>
</head>
<body class="venue-page">
  <header class="site-header">
    <nav class="pill-nav" aria-label="Primary">
      <!-- NOTE: leave anchors as absolute site URLs; script normalizes -->
      <a href="https://www.cruisinginthewake.com/">Home</a>
      <a href="https://www.cruisinginthewake.com/ships/">Ships</a>
      <a class="active" href="https://www.cruisinginthewake.com/restaurants.html">Restaurants &amp; Menus</a>
      <a href="https://www.cruisinginthewake.com/ports.html">Ports</a>
      <a href="https://www.cruisinginthewake.com/disability-at-sea.html">Disability at Sea</a>
      <a href="https://www.cruisinginthewake.com/drink-packages.html">Drink Packages</a>
      <a href="https://www.cruisinginthewake.com/packing-lists.html">Packing Lists</a>
      <a href="https://www.cruisinginthewake.com/cruise-lines/">Cruise Lines</a>
      <a href="https://www.cruisinginthewake.com/solo.html">Solo</a>
      <a href="https://www.cruisinginthewake.com/travel.html">Travel</a>
    </nav>

    <!-- Global hero -->
    <div class="hero" role="img" aria-label="Wake at sunset hero">
      <img class="hero-compass" src="https://www.cruisinginthewake.com/assets/compass-rose.svg" alt="" aria-hidden="true">
      <div class="hero-title">
        <img class="logo" src="https://www.cruisinginthewake.com/assets/logo_wake.png" alt="In the Wake">
      </div>
      <p class="tagline">A Cruise Traveler’s Logbook</p>
      <div class="hero-credit">
        <a class="pill long" href="https://www.instagram.com/flickersofmajesty/" target="_blank" rel="noopener">
          Photo by Flickers of Majesty — Instagram
        </a>
      </div>
    </div>
  </header>

  <!-- Dynamic ship pills (auto-generated from JSON; see §4) -->
  <nav class="ship-pills-bar" aria-label="Ships with this venue">
    <div id="ship-pills" class="pills"></div>
  </nav>

  <main class="wrap">
    <!-- 1) Overview -->
    <section class="card" id="overview">
      <h1 class="page-title">{{Venue Name}}</h1>
      <p class="subtitle">{{Line}} — {{Category/Type}}</p>
      <p class="pill version">v{{page_version}}</p>
      <p class="lede">{{60–90 char aspirational hook}}</p>
      <p class="blurb">{{Short value proposition; crosslinks to dining hub + class pages}}</p>
    </section>

    <!-- 2) Menu & Prices (Feature block; show both lunch + dinner ranges) -->
    <section class="card" id="menu-prices">
      <h2>Menu &amp; Prices</h2>
      <p class="price-note"><strong>Lunch:</strong> {{low}}–{{high}} · <strong>Dinner:</strong> {{low}}–{{high}} (varies by ship/class; see guidance)</p>
      <div class="grid grid-3">
        <div><h3>Starters</h3><ul><!-- items --></ul></div>
        <div><h3>Mains</h3><ul><!-- items --></ul></div>
        <div><h3>Sides & Desserts</h3><ul><!-- items --></ul></div>
      </div>
      <p class="to-verify"><strong>To Verify:</strong> Replace TBD prices after sailing confirmation.</p>
      <details class="variant">
        <summary>Ship‑Specific Variants</summary>
        <ul><!-- e.g., Icon-only Wagyu tomahawk --></ul>
      </details>
    </section>

    <!-- 3) Special Accommodations (Allergen Micro-Component) -->
    <section class="card" id="accommodations">
      <h2>Special Accommodations</h2>
      <!-- include micro-component here (see §6) -->
      <div class="allergen-micro"></div>
    </section>

    <!-- 4) Availability & Crosslinks -->
    <section class="card" id="availability">
      <h2>Where You’ll Find It</h2>
      <p>This venue appears on the following ships:</p>
      <ul class="link-list" id="ship-list"><!-- populated by JSON --></ul>
      <details><summary>Former placements</summary><p class="muted">If a ship removes or rebrands, mark it Historical.</p></details>
    </section>

    <!-- 5) Persona Review (Depth Soundings) -->
    <section class="card" id="review">
      <h2>The Logbook — Real Guest Soundings</h2>
      <p class="pill"><strong>Full disclosure:</strong> I haven’t dined at this venue on every ship. Until I do, this is a composite of vetted guest soundings taken in their own wake, trimmed and edited to our standards.</p>
      <blockquote id="persona-review"><!-- one review --></blockquote>
    </section>

    <!-- 6) Sources -->
    <section class="card" id="sources">
      <h2>Sources &amp; Attribution</h2>
      <ul><!-- external links --></ul>
    </section>
  </main>

  <footer class="site-footer">
    <p>© 2025 In the Wake — A Cruise Traveler’s Logbook</p>
  </footer>

  <!-- Venue boot JS (ship pills, search dictionary, etc.) -->
  <script src="/assets/js/venue-boot.js?v={{site_version}}" defer></script>
</body>
</html>
```

---

## 3. Data Contracts (JSON)

### 3.1 `venues.json` — Venue Records

```jsonc
{
  "venues": [
    {
      "slug": "chops-grille",
      "name": "Chops Grille",
      "category": "premium",        // "premium" | "complimentary" | "activity"
      "aliases": ["Chops", "Chops Grill"],
      "blurb": "Flagship steakhouse: hand-cut USDA Prime steaks, classic sides, polished service.",
      "access": ["fee", "reservations recommended"],
      "audience": ["adults", "families"],
      "search_dict": {
        // words to boost search; include canonical dish terms (see §3.4)
        "keywords": ["steak", "filet", "ribeye", "wagyu", "lobster", "shrimp cocktail", "tater tots", "béarnaise", "lamb"]
      }
    }
  ],
  "ships": {
    // optional local override; usually we source ships from ships.json (see §3.2)
  }
}
```

### 3.2 `ships.json` — Ship Records (relevant fields)

```jsonc
{
  "ships": {
    "icon-of-the-seas": {
      "name": "Icon of the Seas",
      "class": "Icon",
      "venues": ["chops-grille", "izumi", "coastal-kitchen"]
    },
    "radiance-of-the-seas": {
      "name": "Radiance of the Seas",
      "class": "Radiance",
      "venues": ["chops-grille"]
    }
  }
}
```

### 3.3 Cross-File Requirements

- Every `venue.slug` must be referenced by zero or more `ship.venues` arrays.  
- A page for `/restaurants/<slug>.html` must exist for *any* venue listed.  
- **Slug rules:** lowercase, hyphenated; no spaces; ASCII only.

### 3.4 Search Dictionary (Menu-Aware)

- `venues[].search_dict.keywords` must include **menu nouns** (e.g., “lobster”, “filet”, “béarnaise”, “gruyère”).  
- Add **synonyms** and **regional spellings** where sensible (e.g., “truffle fries”, “truffled fries”).  
- Keep it **short-tail focused**; the fuzzy search already catches near-misses.  
- When a venue menu updates, **update the keywords** in the JSON the same day.

---

## 4. Dynamic Ship Pills (Under Header)

**Goal:** Under the hero, render a **row of ship pills** for all ships that host the venue. Clicking a pill opens the *ship page* (new tab).

**Source:** Merge via `ships.json` (preferred) or reverse index if the site provides a combined dataset.

**Rules**  
- Sort pills **A→Z by ship name** by default. Optional filter: user’s selected class first.  
- Use `.pills` container and `.chip` or `.pillbtn` class for visual consistency.  
- Truncate long names gracefully; ensure touch targets ≥ 40px height.  
- Add `title="Go to {{Ship Name}}"` for clarity.

**Example render (JS pseudo):**
```js
function renderShipPills(venueSlug, shipsDb){
  const host = document.getElementById('ship-pills');
  const items = Object.entries(shipsDb.ships||{})
    .filter(([slug, s]) => (s.venues||[]).includes(venueSlug))
    .sort((a,b)=> (a[1].name||a[0]).localeCompare(b[1].name||b[0]));
  host.innerHTML = items.map(([slug, s]) =>
    `<a class="chip" href="https://www.cruisinginthewake.com/ships/rcl/${slug}.html" title="Go to ${s.name}">${s.name}</a>`
  ).join('');
}
```

---

## 5. Price Governance (Bands by Class)

> We establish **bands** rather than literals. Code displays a **range** and tooltips by class.

- **Lunch:** $21–$25 typical. Older/smaller (Vision, Radiance, Empress) skew **lower**; newer/larger (Oasis, Icon) **higher**.  
- **Dinner:** $39–$65 typical (+18% grat.). Vision/Radiance/Freedom/Voyager lower side; Oasis/Icon/Quantum higher side.  
- **Add-ons:** e.g., Lobster tail ~$21. **Children 6–12:** ~50% for fixed-price venues.  
- **Display format:** “Lunch $21–25 · Dinner $39–65 (varies by ship/class).”  
- **Data hinting:** Optional `pricing: { lunch_band: "low|mid|high", dinner_band: "low|mid|high" }` per venue+class to tune copy.

---

## 6. Allergen Micro-Component (Inline Reusable)

**Purpose:** Consistent, prominent allergen messaging across venues.

```html
<div class="allergen-micro" role="note" aria-label="Allergen and dietary information">
  <p class="pill"><strong>Allergen & Dietary Notes:</strong> Royal Caribbean follows SAFE Food Policy. Please disclose allergens to your server before ordering. Gluten‑free, dairy‑free, and vegetarian accommodations are available on request. For severe allergies, contact the line at least 30 days pre‑sailing and confirm with the venue on embarkation day.</p>
</div>
```

> Styling uses the existing `.pill` class. Keep it in the **Accommodations** section for every venue.

---

## 7. Persona Review (Depth Soundings Policy)

- Exactly **one** persona review block per venue page.  
- Must include the **Depth Soundings** disclaimer pill: “I haven’t dined at this venue on every ship… composite of vetted guest soundings…”  
- Tone: candid, descriptive, avoids absolutes, 90–130 words.  
- **Never** quote private groups; prefer public forums we can cite (Reddit, CC, RCBlog, X).

---

## 8. UGC Wall (Optional)

- Source candidates: **Reddit**, **X**, **TripAdvisor**, **Cruise Critic**.  
- Moderation: PG‑rated, no profanity, no doxxing.  
- Implementation: client-side fetchers require CORS + rate limits; for production, prefer server‑side aggregator or static snapshots rehydrated periodically.  
- UX: collapse by default on mobile; cap at 6–8 tiles; show logos; link out.  
- SEO: render minimal text (no-scrape risk); consider JSON‑LD `Review` if we curate and own text.

---

## 9. Accessibility

- All interactive pills are keyboard focusable (anchors or buttons).  
- `aria-label`s on hero image, ship-pills bar, and UGC tiles.  
- Color contrast ≥ 4.5:1 for text; ≥ 3:1 for large text.  
- `kbd` styling used for keystroke hints.  
- `details/summary` used for variants-history; ensure focus states are visible.

---

## 10. Performance & Delivery

- Inline only page‑specific CSS; reuse global `styles.css` for everything else.  
- Defer non-critical JS; avoid blocking fonts.  
- Compress images (WebP preferred), width hints, `loading="lazy"` for below-the-fold.  
- Cache-bust with `?v=` query.  
- Avoid duplicate heroes or conflicting CSS on venue pages.

---

## 11. SEO & Crosslinking

- Title: “{{Venue}} — Royal Caribbean | In the Wake”.  
- Meta description: 150–165 chars, mention **menu** and **price bands**.  
- Internal links:  
  - ships that host the venue,  
  - class overview pages,  
  - Restaurants hub,  
  - relevant Port pages if food context exists.  
- Add `rel="noopener"` on external links.  
- Consider schema.org `Menu` (when stable) and `Review` (if authored by us).

---

## 12. Governance & Versioning

- **Owner of “To Verify” queue:** You (for Year 1).  
- **Sweep cadence:** monthly; ad-hoc per-sailing updates allowed.  
- **Version rhythm:** bump site version in `styles.css?v=` and `venue-boot.js?v=` when style or logic changes.  
- **Change log:** maintain in repo commits; high-level note in Restaurants hub if user-facing.

---

## 13. CSS Notes (Primitives Reuse)

- Use `.wrap`, `.card`, `.pill`, `.pills`, `.grid`, `.grid-3` from global CSS.  
- Venue cards under Restaurants hub use **forced 3-up** at ≥1024px; venue detail pages may use `grid-3` for menu columns.  
- Ship pills bar should reuse `.pills .chip` styling for seamless brand.

---

## 14. JS Boot (Venue Detail Essentials)

> **`/assets/js/venue-boot.js` responsibilities** (high level; see codebase):
- Compute `origin` and normalize absolute links.  
- Load `ships.json` (and `venues.json` if needed).  
- Render **ship pills** under hero (see §4).  
- Populate **Availability** list and link targets.  
- Optionally inject **search_dict** keywords into a global index for the Restaurants hub search (if page was deep-linked).

---

## 15. QA Checklist (Pre-Publish)

- [ ] Ship pills render, link to ship pages, keyboard focus works.  
- [ ] Menu shows **lunch** and **dinner** **ranges**; variants are scoped to specific ships.  
- [ ] Allergen micro-component present.  
- [ ] Persona review present with disclaimer.  
- [ ] Crosslinks: Restaurants hub + each ship mentioned.  
- [ ] Images correctly sized; no CLS from hero.  
- [ ] JSON entries updated (keywords include dish nouns).  
- [ ] Lighthouse ≥ 90 (Perf/SEO/Access).  
- [ ] No console errors.  
- [ ] “To Verify” items tagged `.to-verify` and logged.

---

## 16. Example: Chops Grille Data Snippets

**`venues.json` (excerpt):**
```jsonc
{
  "slug": "chops-grille",
  "name": "Chops Grille",
  "category": "premium",
  "aliases": ["Chops", "Chops Grill"],
  "blurb": "Flagship steakhouse — hand‑cut USDA Prime steaks, classic sides, polished service.",
  "access": ["fee", "reservations recommended"],
  "audience": ["adults", "families"],
  "search_dict": {
    "keywords": [
      "steak", "filet", "petite filet", "ribeye", "new york strip",
      "lobster", "shrimp cocktail", "tuna tartare", "crab cake",
      "truffle fries", "gruyere tots", "bernaise", "béarnaise",
      "lamb", "branzino", "mac and cheese", "mashed potatoes",
      "cheesecake", "lava cake"
    ]
  }
}
```

**Ship pills render (runtime)**
```html
<nav class="ship-pills-bar" aria-label="Ships with this venue">
  <div id="ship-pills" class="pills">
    <!-- <a class="chip" href="/ships/rcl/radiance-of-the-seas.html">Radiance of the Seas</a> … -->
  </div>
</nav>
```

---

**End of v2.257**

<!-- END SOURCE: venue-standards_v2.257.zip:venue-standards.md -->
