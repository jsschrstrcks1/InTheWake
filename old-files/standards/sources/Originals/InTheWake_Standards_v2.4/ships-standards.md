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

