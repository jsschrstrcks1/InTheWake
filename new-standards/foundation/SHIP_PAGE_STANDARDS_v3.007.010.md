---
title: "STANDARDS.md"
source_file: "STANDARDS.md"
generated: "2025-10-17T13:14:34.197665Z"
note: "Verbatim import (lightly normalized). Newer addenda may supersede specific clauses; see supersets."
---

# In the Wake — Frontend Standards
**Version:** v3.007.010 (Grandeur template baseline)  
**Audience:** Editors, devs, QA, SEO, accessibility

> These standards apply to ship pages, lines/classes pages, ports, and reusable cards. Examples below are taken from the current Grandeur of the Seas page.

---

## 0) Versioning & Contracts

- **Semver-ish site version** is embedded in:
  - `<meta name="version" content="3.007.010">`
  - Versioned assets `?v=3.007.010`
  - Visible badge in the navbar (optional)
- **Contracted classes** (do not rename without migration):  
  `.card`, `.pills`, `.pill-nav`, `.grid-2`, `.visually-hidden-focusable`, `.hidden`, `.swiper.*`, `.voyage-tips`, `.prose`, `#vx-grid .vx`.

---

## 1) Document Skeleton & Landmarks

- `<!doctype html>` and `<html lang="en">`
- **Exactly one H1** per page; hidden is fine but must be reachable and readable.
- **Skip link** to `#content`.
- Landmarks: `<header>`, `<main id="content" tabindex="-1">`, `<footer>`.

```html
<!doctype html>
<html lang="en">
<head>…</head>
<body class="page no-hero-filter">
  <a class="visually-hidden-focusable" href="#content">Skip to content</a>
  <header>…</header>
  <main id="content" tabindex="-1">…</main>
  <footer>© 2025 In the Wake</footer>
</body>
</html>
```

---

## 2) Critical Meta & Theming

Required:

```html
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="referrer" content="no-referrer">
<meta name="robots" content="index, follow">
<meta name="version" content="3.007.010">
<title>Grandeur of the Seas — Deck Plans, Live Tracker, Dining & Videos | In the Wake</title>
<meta name="description" content="...">
<meta name="theme-color" content="#0e6e8e"> <!-- optional but recommended -->
```

---

## 3) Canonical, Open Graph, and Twitter

- **Canonical** must be absolute and point to the production hostname.
- **OG/Twitter** must exist and match visible content.
- Recommended OG image size: 1200×630.

```html
<link rel="canonical" href="https://cruisinginthewake.com/ships/rcl/grandeur-of-the-seas.html">
<meta property="og:type" content="article">
<meta property="og:site_name" content="In the Wake">
<meta property="og:url" content="https://cruisinginthewake.com/ships/rcl/grandeur-of-the-seas.html">
<meta property="og:title" content="Grandeur of the Seas — Deck Plans, Live Tracker, Dining & Videos">
<meta property="og:description" content="All the essentials for Grandeur of the Seas: live map (auto-refresh), dining, stats, and videos.">
<meta property="og:image" content="https://cruisinginthewake.com/assets/ships/grandeur/hero.jpg?v=3.007.010">
<meta name="twitter:card" content="summary_large_image">
```

---

## 4) Preconnects, Preloads, and Performance

Use only what the page actually needs.

```html
<link rel="preconnect" href="https://www.googletagmanager.com" crossorigin>
<link rel="preconnect" href="https://cloud.umami.is" crossorigin>
<link rel="preconnect" href="https://www.youtube-nocookie.com" crossorigin>
<link rel="preconnect" href="https://i.ytimg.com" crossorigin>
<link rel="preconnect" href="https://www.vesselfinder.com" crossorigin> <!-- if tracker used -->
<link rel="preconnect" href="https://cdn.consentmanager.net" crossorigin>

<!-- LCP image -->
<link rel="preload" as="image" href="https://cruisinginthewake.com/assets/ships/grandeur/hero.jpg?v=3.007.010" fetchpriority="high">
```

**Images**: Provide `width`/`height` and default to `loading="lazy"` and `decoding="async"`, except LCP.

---

## 5) Analytics & Consent

- **Google tag** async, minimal init.
- **Umami** `defer` with website id.
- Consent tooling may load after initial paint; site must function without it.

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX"></script>
<script>
  window.dataLayer=window.dataLayer||[]; function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date()); gtag('config','G-XXXXXXX');
</script>
<script defer src="https://cloud.umami.is/script.js" data-website-id="..."></script>
<script src="https://cdn.consentmanager.net/delivery/js/accessibility.min.js" async></script>
```

---

## 6) Absolute URL Normalizer (staging/CDN safety)

Convert hard-coded production URLs to current origin on DOMContentLoaded; expose `_abs()`.

```html
<script>
(function(){
  const ORIGIN=(location.origin||(location.protocol+'//'+location.host)).replace(/\/$/,'');
  window._abs=function(path){ path=String(path||''); if(!path.startsWith('/')) path='/'+path; return ORIGIN+path; };
  document.addEventListener('DOMContentLoaded', function(){
    const sel=[
      'a[href^="https://cruisinginthewake.com/"]',
      'img[src^="https://cruisinginthewake.com/"]',
      'link[href^="https://cruisinginthewake.com/"]',
      'script[src^="https://cruisinginthewake.com/"]'
    ].join(',');
    document.querySelectorAll(sel).forEach(el=>{
      const attr=el.hasAttribute('href')?'href':'src';
      try{
        const u=new URL(el.getAttribute(attr));
        el.setAttribute(attr, ORIGIN+u.pathname+u.search+u.hash);
      }catch(_){}
    });
  }, {once:true});
})();
</script>
```

---

## 7) Structured Data (JSON-LD)

**Do not duplicate blocks of the same type unless values differ materially and are intended.**  
For Reviews: **exactly one** block; `ratingValue` **number**, not string.

### Required blocks

#### 7.1 Organization
```html
<script type="application/ld+json">{
  "@context":"https://schema.org","@type":"Organization",
  "name":"In the Wake","url":"https://cruisinginthewake.com/",
  "logo":"https://cruisinginthewake.com/assets/logo_wake.png?v=3.007.010",
  "sameAs":["https://www.instagram.com/flickersofmajesty/","https://www.youtube.com/@cruisinginthewake"]
}</script>
```

#### 7.2 WebSite + SearchAction
```html
<script type="application/ld+json">{
  "@context":"https://schema.org","@type":"WebSite",
  "name":"In the Wake","url":"https://cruisinginthewake.com/",
  "potentialAction":{"@type":"SearchAction",
    "target":"https://cruisinginthewake.com/search.html?q={query}",
    "query-input":"required name=query"}
}</script>
```

#### 7.3 WebPage
```html
<script type="application/ld+json">{
  "@context":"https://schema.org","@type":"WebPage",
  "name":"Grandeur of the Seas — Deck Plans, Live Tracker, Dining & Videos",
  "url":"https://cruisinginthewake.com/ships/rcl/grandeur-of-the-seas.html",
  "primaryImageOfPage":"https://cruisinginthewake.com/assets/ships/grandeur/hero.jpg?v=3.007.010",
  "isPartOf":{"@type":"WebSite","name":"In the Wake","url":"https://cruisinginthewake.com/"}
}</script>
```

#### 7.4 BreadcrumbList
```html
<script type="application/ld+json">{
  "@context":"https://schema.org","@type":"BreadcrumbList","name":"Site Breadcrumbs",
  "itemListElement":[
    {"@type":"ListItem","position":1,"name":"Home","item":"https://cruisinginthewake.com/"},
    {"@type":"ListItem","position":2,"name":"Ships","item":"https://cruisinginthewake.com/ships.html"},
    {"@type":"ListItem","position":3,"name":"Grandeur of the Seas","item":"https://cruisinginthewake.com/ships/rcl/grandeur-of-the-seas.html"}
  ]
}</script>
```

#### 7.5 Review (static overview)
```html
<script type="application/ld+json">{
  "@context":"https://schema.org","@type":"Review",
  "name":"Grandeur of the Seas Overview",
  "author":{"@type":"Person","name":"In the Wake Editorial Team"},
  "reviewBody":"Short, neutral elevator pitch about the ship.",
  "reviewRating":{"@type":"Rating","ratingValue":4.4,"bestRating":5,"worstRating":1},
  "itemReviewed":{"@type":"Cruise","name":"Grandeur of the Seas",
    "provider":{"@type":"Organization","name":"Royal Caribbean International","url":"https://www.royalcaribbean.com"},
    "url":"https://cruisinginthewake.com/ships/rcl/grandeur-of-the-seas.html",
    "image":"https://cruisinginthewake.com/assets/ships/grandeur/hero.jpg?v=3.007.010",
    "description":"Vision-class cruise operated by Royal Caribbean International."}}
</script>
```

---

## 8) CSS: Micro + Global

- Small, page-scoped rules in a `<style>` tag (micro CSS).
- Main bundle: `/assets/styles.css?v=3.007.010`.
- Respect **grid breakpoints** used by cards (1→2→3 columns).

```css
.visually-hidden-focusable{position:absolute;left:-9999px;top:auto;width:1px;height:1px;overflow:hidden}
.visually-hidden-focusable:focus{position:static;left:auto;width:auto;height:auto;padding:.5rem .75rem;background:#fff;border:2px solid #0e6e8e;border-radius:8px;z-index:1000}

.grid-2{display:grid;gap:1rem}
@media (min-width:980px){.grid-2{grid-template-columns:1fr 1fr}}

#vx-grid{display:grid;gap:1rem}
@media (min-width:720px) and (max-width:979.98px){#vx-grid{grid-template-columns:repeat(2, minmax(0,1fr))}}
@media (min-width:980px){#vx-grid{grid-template-columns:repeat(3, minmax(0,1fr))}}
```

---

## 9) Accessibility Details

- **Carousels**: `aria-roledescription="carousel"` and associated labelled headings.
- Swiper a11y enabled; custom prev/next buttons have `aria-label`.
- **Live regions**: dynamic logbook body uses `aria-live="polite"`.
- **Chips**/filters: maintain `aria-pressed` toggles and `.is-on`.
- **Hero**: either an `<img alt="...">` or `role="img" aria-label="..."`
- **External links**: see §13.

---

## 10) JavaScript Modules & Fallbacks

### 10.1 Swiper (self-hosted + CDN fallback)
```html
<script>
(function ensureSwiper(){
  function addCSS(h){ const l=document.createElement('link'); l.rel='stylesheet'; l.href=h; document.head.appendChild(l); }
  function addJS(src, ok, fail){ const s=document.createElement('script'); s.src=src; s.async=true; s.onload=ok; s.onerror=fail||function(){}; document.head.appendChild(s); }
  const primaryCSS=_abs? _abs('/vendor/swiper/swiper-bundle.min.css?v=3.007.010') : '...';
  const primaryJS =_abs? _abs('/vendor/swiper/swiper-bundle.min.js?v=3.007.010') : '...';
  const cdnCSS    ="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css";
  const cdnJS     ="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js";
  addCSS(primaryCSS);
  addJS(primaryJS, null, function(){ addCSS(cdnCSS); addJS(cdnJS); });
})();
</script>

<script>
(function initSwipers(){
  function when(cb){ if (window.Swiper) cb(); else setTimeout(()=>when(cb), 100); }
  when(function(){
    try{
      new Swiper('.swiper.firstlook', { loop:false, watchOverflow:true,
        pagination:{ el:'.swiper.firstlook .swiper-pagination', clickable:true },
        navigation:{ nextEl:'.swiper.firstlook .swiper-button-next', prevEl:'.swiper.firstlook .swiper-button-prev' },
        a11y:{ enabled:true }
      });
      new Swiper('.swiper.videos', { loop:false, watchOverflow:true,
        pagination:{ el:'.swiper.videos .swiper-pagination', clickable:true },
        navigation:{ nextEl:'.swiper.videos .swiper-button-next', prevEl:'.swiper.videos .swiper-button-prev' },
        a11y:{ enabled:true }
      });
    }catch(_){ document.documentElement.classList.add('swiper-fallback'); }
  });
})();
</script>
```

### 10.2 External links hardening
```html
<script>
(function externalLinksNewTab(){
  const here=location.hostname.replace(/^www\./,'');
  function upgrade(){
    document.querySelectorAll('a[href]').forEach(a=>{
      const href=a.getAttribute('href')||'';
      if (/^(#|mailto:|tel:)/i.test(href)) return;
      try{
        const u=new URL(href, location.href);
        const host=u.hostname.replace(/^www\./,'');
        if (host !== here || a.rel==='external'){
          a.target='_blank';
          a.rel=['noopener','noreferrer'].concat((a.rel||'').split(/\s+/)).filter(Boolean).join(' ');
        }
      }catch(_){}
    });
  }
  if (document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', upgrade, {once:true}); } else { upgrade(); }
})();
</script>
```

---

## 11) Data Blocks & JSON Shapes

### 11.1 Ship Stats Fallback

**Purpose:** Paint something immediately while network fetch is pending.

```html
<div id="ship-stats" class="stats-grid" data-slug="grandeur-of-the-seas"></div>
<script type="application/json" id="ship-stats-fallback">{
  "slug":"grandeur-of-the-seas",
  "name":"Grandeur of the Seas",
  "class":"Vision Class",
  "entered_service":1996,
  "gt":"73,817 GT",
  "guests":"1,996",
  "crew":"760",
  "length":"279 m (915 ft)",
  "beam":"32 m (105 ft)",
  "registry":"Bahamas"
}</script>

<script>
(function loadShipStats(){
  const el=document.getElementById('ship-stats'); if(!el) return;
  function render(a){
    const rows=[
      ['Class', a.class],['Entered Service', a.entered_service],['Gross Tonnage', a.gt],
      ['Guests', a.guests],['Crew', a.crew],['Length', a.length],['Beam', a.beam],['Registry', a.registry]
    ].filter(p=>p[1] && String(p[1]).trim()!=='')
     .map(p=>'<div class="stat-line"><span class="stat-key">'+p[0]+':</span><span class="stat-val">'+p[1]+'</span></div>').join('');
    el.innerHTML = rows || '<p class="tiny">Stats coming soon.</p>';
  }
  try{
    const fb=JSON.parse((document.getElementById('ship-stats-fallback')||{}).textContent||'{}');
    if (fb && (fb.name||fb.slug)) render(fb);
  }catch(_){ el.innerHTML='<p class="tiny">Stats coming soon.</p>'; }
})();
</script>
```

**Type (TS-ish)**
```ts
type ShipStats = {
  slug: string; name: string; class?: string; entered_service?: number|string;
  gt?: string; guests?: string|number; crew?: string|number;
  length?: string; beam?: string; registry?: string;
};
```

---

### 11.2 Videos Data

**Purpose:** Build YouTube-nocookie carousel from static JSON.

```html
<script type="application/json" id="videos-data">{
  "videos":[
    {"youtube_id":"-NS3BhWqzD4","title":"Grandeur of the Seas — Full Ship Walkthrough (4K)"},
    {"youtube_id":"iIo4HNqNzbs","title":"Top Things To Do on Grandeur of the Seas"}
  ]
}</script>

<script>
(function initVideos(){
  const WRAP=document.getElementById('featuredVideos'); if(!WRAP) return;
  const CON=document.querySelector('.swiper.videos');
  const FALL=document.getElementById('videoFallback');
  function ytId(v){
    if(!v) return '';
    if(v.youtube_id) return String(v.youtube_id);
    const u=String(v.url||v.embed_url||'');
    const m=u.match(/[?&]v=([\w-]{6,})/)||u.match(/youtu\.be\/([\w-]{6,})/)||u.match(/\/embed\/([\w-]{6,})/);
    return m?m[1]:'';
  }
  function getList(){
    try{
      const j=JSON.parse((document.getElementById('videos-data')||{}).textContent||'{}');
      if(Array.isArray(j)) return j; if(Array.isArray(j.videos)) return j.videos;
    }catch(_){}
    return [];
  }
  const items=getList(), seen=Object.create(null), slides=[];
  items.forEach(v=>{
    const id=ytId(v); if(!id||seen[id]) return; seen[id]=1;
    const title=(v.title||'Ship video').replace(/"/g,'&quot;');
    slides.push('<div class="swiper-slide"><iframe title="'+title+'" src="https://www.youtube-nocookie.com/embed/'+id+'" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="lazy"></iframe></div>');
  });
  if(!slides.length){ FALL?.classList.remove('hidden'); CON?.classList.add('carousel-fallback'); return; }
  WRAP.innerHTML = slides.join('');
})();
</script>
```

**Type**
```ts
type VideoItem = { youtube_id?: string; url?: string; embed_url?: string; title?: string; };
type VideosData = { videos: VideoItem[] } | VideoItem[];
```

---

### 11.3 Logbook Personas (JSON fetch)

**Purpose:** Narrative system with editor note, keyboard nav, and fuel card injection.

**Remote JSON path**: `/_abs('/ships/rcl/assets/<slug>.json')`

**Expected shape:**
```ts
type PersonaNav = { label?: string; target_persona_id: string; };

type Persona = {
  id: string;
  title?: string;
  persona_label?: string; // fallback title
  markdown?: string;     // body content (Markdown)
  nav_port?: PersonaNav; // previous
  nav_starboard?: PersonaNav; // next
};

type PersonaRoot = {
  ship_slug?: string;
  ship_name?: string;
  nights_stood_watch?: number;
  editor_note?: string;  // optional HTML (sanitized on server); if absent, default copy is used
  personas: Persona[];
};
```

**Client renderer (excerpt)**:
```js
const slug='grandeur-of-the-seas';
const SRC=_abs? _abs('/ships/rcl/assets/'+slug+'.json') : '/ships/rcl/assets/'+slug+'.json';

fetch(SRC,{cache:'no-store'}).then(r=>r.json()).then(json=>{
  renderEditorNote(json);
  const arr=Array.isArray(json.personas)? json.personas.slice() : [];
  state.personas=arr;
  state.idIndex=Object.fromEntries(arr.map((p,i)=>[p.id,i]));
  const start=state.idIndex['p0-ken']!=null ? state.idIndex['p0-ken'] : 0;
  go(start);
}).catch(()=>{
  NOTE.innerHTML=''; MOUNT.innerHTML='<p class="tiny">Stories coming soon.</p>';
});
```

> **Markdown support**: headings (`#..######`), `*em*`, `**strong**`, `[links](url)`, paragraph/line break conversion. Any richer Markdown must be pre-rendered to HTML server-side.

---

### 11.4 Entertainment / Venues / Bars (NEW)

**Static HTML seed** plus **JSON augmentation**. Cards carry `data-tags` for filtering.

**Card example**
```html
<article class="card vx" data-tags="venue included main-dining">
  <h3><a href="/restaurants/rcl/main-dining-room.html" target="_blank" rel="noopener">Main Dining Room</a></h3>
  <p>Rotating themed menus. <em>Status:</em> Included.</p>
</article>
```

**Filter UI contract**
```html
<div class="chips pill-nav pills" role="group" aria-label="Category filters">
  <button class="chip is-on" data-filter="all" aria-pressed="true">All</button>
  <button class="chip" data-filter="included">Included</button>
  <button class="chip" data-filter="specialty">Specialty</button>
  <button class="chip" data-filter="coffee">Coffee</button>
  <button class="chip" data-filter="bar">Bar</button>
  <button class="chip" data-filter="shows">Shows</button>
  <button class="chip" data-filter="music">Live Music</button>
  <button class="chip" data-filter="spa">Spa &amp; Fitness</button>
  <button class="chip" data-filter="kids">Kids &amp; Teens</button>
  <button class="chip" data-filter="adults">Adults-Only</button>
</div>
```

**Embedded JSON to augment the grid**
```html
<script type="application/json" id="entertainment-data">{
  "theater":{"name":"Palladium Theater","decks":"Decks 4–5","notes":"Reservations via app when available."},
  "production_shows":[
    {"title":"Broadway Rhythm & Rhyme","description":"..."},
    {"title":"All Access","description":"..."}
  ],
  "guest_entertainers":[ "Comedians", "Magicians", "Jugglers" ],
  "interactive_events":[
    {"name":"Protect the Egg","description":"Team-build..."},
    {"name":"The Quest","description":"Adults-only..."}
  ],
  "themed_parties":[
    {"name":"The Greatest '80s Party Ever","venue":"Star Lounge"}
  ],
  "other_entertainment":[
    "Live Music & DJ Dance Parties: Schooner Bar, Centrum",
    "Movies Under the Stars: Pool deck"
  ],
  "advice":"Lineups rotate weekly. Check the app."
}</script>
```

**Type**
```ts
type EntertainmentData = {
  theater?: {name?: string; decks?: string; notes?: string;};
  production_shows?: {title: string; description?: string;}[];
  guest_entertainers?: string[];
  interactive_events?: {name: string; description?: string;}[];
  themed_parties?: {name: string; venue?: string;}[];
  other_entertainment?: string[]; // free-form
  advice?: string;
};
```

**Filter logic (contract)**
```js
const search=document.getElementById('vx-search');
const chips=Array.from(document.querySelectorAll('#venues-experiences .chip'));
function apply(){
  const q=(search?.value||'').toLowerCase().trim();
  const active=chips.find(c=>c.classList.contains('is-on') && c.dataset.filter!=='all');
  const tag=active? active.dataset.filter : null;
  document.querySelectorAll('#vx-grid .vx').forEach(card=>{
    const name=(card.querySelector('h3')?.textContent||'').toLowerCase();
    const tags=(card.dataset.tags||'').toLowerCase();
    const show=(!q||name.includes(q)) && (!tag||tags.includes(tag));
    card.style.display=show? '' : 'none';
  });
}
```

**Bars (content notes)**
- Global “fleet” bars (Schooner Bar, English Pub, etc.) may appear on older ships **only if present**; otherwise present them as “typical fleet venue” in a separate card with clear availability notes.
- Always include a **tiny** disclaimer: “Lineups can change by sailing…”

---

### 11.5 Live Tracker (Hybrid VesselFinder)

- Try AISMap first; fallback to `vesselfinder.com/vessels/details/<IMO>` iframe if lib stalls or returns no canvas/svg.
- Refresh iframe every 60s in fallback mode, add `t=Date.now()` to bust cache.

**HTML**
```html
<section class="card itinerary" data-imo="9102978" data-name="GRANDEUR-OF-THE-SEAS">
  <h2>Where Is Grandeur Right Now?</h2>
  <div id="vf-map-grandeur" class="vf-map" role="region" aria-label="Live ship map"></div>
  <iframe class="live-map hidden" title="Live ship tracker" loading="lazy" width="100%" height="300" allowfullscreen></iframe>
  <p class="tiny">If the live widget stalls, it falls back to an iframe...</p>
</section>
```

**Initializer**
```js
(function initHybridVesselFinder(){
  const wrap=document.querySelector('.card.itinerary[data-imo]'); if(!wrap) return;
  const imo=(wrap.getAttribute('data-imo')||'').trim();
  const mapEl=document.getElementById('vf-map-grandeur');
  const iFr=wrap.querySelector('iframe.live-map');
  const makeURL=()=>`https://www.vesselfinder.com/vessels/details/${imo}`;
  function useIframe(){
    if(!iFr) return;
    const url=new URL(makeURL()); url.searchParams.set('t', Date.now());
    iFr.src=url.toString(); iFr.classList.remove('hidden'); if(mapEl) mapEl.style.display='none';
  }
  const s=document.createElement('script'); s.src="https://www.vesselfinder.com/aismap.js"; s.async=true;
  const stall=setTimeout(useIframe, 4000);
  s.onload=function(){
    try{
      clearTimeout(stall);
      if(window.AISMap && mapEl){
        new AISMap(mapEl,{width:"100%",height:300,zoom:8,names:true,show_track:1,track_days:1,vessel:"IMO:"+imo});
        setTimeout(()=>{ if(!mapEl.querySelector('canvas,svg')) useIframe(); }, 2000);
      }else{ useIframe(); }
    }catch(_){ useIframe(); }
  };
  s.onerror=function(){ clearTimeout(stall); useIframe(); };
  document.head.appendChild(s);
  setInterval(function(){
    if(iFr && !iFr.classList.contains('hidden')){
      try{ const u=new URL(iFr.src); u.searchParams.set('t', Date.now()); iFr.src=u.toString(); }catch(_){}
    }
  }, 60000);
})();
```

---

## 12) Service Worker / PWA

- Register `sw.js?v=3.007.010` on `window.load`.
- Fail silently (console warning only).
- Core content must remain usable without SW.

```js
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function(){
    navigator.serviceWorker.register('/sw.js?v=3.007.010')
      .catch(function(err){ console.warn('SW registration failed', err); });
  });
}
```

---

## 13) Security & Privacy

- `referrer=no-referrer`.
- All external anchors (hard-coded or upgraded) must have `rel="noopener noreferrer"`.
- Third-party scripts `async`/`defer`.
- No PII in URLs or structured data.

---

## 14) Content Rules & Attribution

- **Attribution** list with license notes and links.  
- “Lineups can change by sailing…” disclaimers where applicable.  
- Avoid specific prices unless you maintain automated updates; otherwise give ranges and label “last verified”.

---

## 15) Performance Requirements

- LCP image with `fetchpriority="high"`, proper dimensions to prevent CLS.
- Lazy-load non-critical images & all iframes.
- Version all local assets `?v=3.007.010`.
- Avoid layout thrash in carousels (fixed aspect ratios).

---

## 16) QA Checklists

### 16.1 SEO/A11y
- [ ] One H1 (visible or hidden, but accessible).
- [ ] Canonical points to production.
- [ ] OG/Twitter present; image resolves (200) and is big enough.
- [ ] BreadcrumbList JSON-LD present.
- [ ] Review JSON-LD present **once**; `ratingValue` is a number.
- [ ] Skip link moves focus to `#content`.
- [ ] Buttons and chips have `aria-pressed` where toggled.

### 16.2 JS/CSS
- [ ] Swiper loads or `html.swiper-fallback` engages (no console red).
- [ ] Videos carousel renders or shows fallback text.
- [ ] Live tracker: AISMap or iframe fallback with auto-refresh.
- [ ] Entertainment JSON augments grid without duplicates.
- [ ] External link upgrader runs once; mailto/tel unaffected.
- [ ] No mixed content when served from staging or CDN (URL normalizer working).

### 16.3 Perf
- [ ] Lighthouse: no CLS > 0.1, LCP < threshold on cable 3G settings (internal bar).
- [ ] Third-party scripts async/defer; no render-blocking CSS beyond critical.

---

## 17) Reusable Snippets

### 17.1 Hero (accessible variant)
```html
<div class="hero" role="img" aria-label="Grandeur of the Seas hero image">
  <div class="latlon-grid" aria-hidden="true">…</div>
  <img class="hero-compass" src="/assets/compass_rose.svg?v=3.007.010" alt="" width="256" height="256" aria-hidden="true">
  <div class="hero-title">
    <img class="logo" src="/assets/logo_wake.png?v=3.007.010" alt="In the Wake" width="220" height="44">
    <h1 class="visually-hidden-focusable">Grandeur of the Seas — Deck Plans, Live Tracker, Dining &amp; Videos</h1>
    <p class="tagline">A Cruise Traveler’s Logbook</p>
  </div>
  <div class="hero-credit">…</div>
</div>
```

### 17.2 Voyage Tips (injected around 60% of logbook body)
```html
<div class="card voyage-tips" aria-label="Voyage planning tips">
  <h2 class="card-title">Fuel Your Voyage</h2>
  <div class="card-content">
    <h3>Drink Packages</h3>
    <ul>
      <li>Deluxe Beverage Package: ~$60/day</li>
      <li>Refreshment Package</li>
      <li>Soda Package</li>
    </ul>
    <h3>Pack Like a Pro</h3>
    <ul><li>Shawl</li><li>Swimwear</li><li>Comfortable shoes</li></ul>
    <div class="button-group">
      <a href="/drink-packages.html" class="btn">View Drink Options</a>
      <a href="/packing-lists.html" class="btn">Packing Guide</a>
    </div>
  </div>
</div>
```

---

## 18) JSON Validation Aids (optional)

Use the following **JSON Schema** fragments during CI to validate embedded blocks.

**Ship Stats**
```json
{
  "$schema":"https://json-schema.org/draft/2020-12/schema",
  "type":"object",
  "required":["slug","name"],
  "properties":{
    "slug":{"type":"string"},
    "name":{"type":"string"},
    "class":{"type":"string"},
    "entered_service":{"type":["number","string"]},
    "gt":{"type":"string"},
    "guests":{"type":["number","string"]},
    "crew":{"type":["number","string"]},
    "length":{"type":"string"},
    "beam":{"type":"string"},
    "registry":{"type":"string"}
  },
  "additionalProperties":true
}
```

**Videos**
```json
{
  "$schema":"https://json-schema.org/draft/2020-12/schema",
  "oneOf":[
    { "type":"array", "items":{"$ref":"#/defs/item"} },
    { "type":"object", "required":["videos"], "properties":{
        "videos":{ "type":"array", "items":{"$ref":"#/defs/item"} }
    } }
  ],
  "defs":{
    "item":{
      "type":"object",
      "properties":{
        "youtube_id":{"type":"string"},
        "url":{"type":"string"},
        "embed_url":{"type":"string"},
        "title":{"type":"string"}
      },
      "anyOf":[
        {"required":["youtube_id"]},
        {"required":["url"]},
        {"required":["embed_url"]}
      ]
    }
  }
}
```

**Logbook Personas**
```json
{
  "$schema":"https://json-schema.org/draft/2020-12/schema",
  "type":"object",
  "required":["personas"],
  "properties":{
    "ship_slug":{"type":"string"},
    "ship_name":{"type":"string"},
    "nights_stood_watch":{"type":"number"},
    "editor_note":{"type":"string"},
    "personas":{"type":"array","items":{"$ref":"#/defs/persona"}}
  },
  "defs":{
    "persona":{
      "type":"object",
      "required":["id"],
      "properties":{
        "id":{"type":"string"},
        "title":{"type":"string"},
        "persona_label":{"type":"string"},
        "markdown":{"type":"string"},
        "nav_port":{"$ref":"#/defs/nav"},
        "nav_starboard":{"$ref":"#/defs/nav"}
      }
    },
    "nav":{
      "type":"object",
      "required":["target_persona_id"],
      "properties":{
        "label":{"type":"string"},
        "target_persona_id":{"type":"string"}
      }
    }
  }
}
```

**Entertainment**
```json
{
  "$schema":"https://json-schema.org/draft/2020-12/schema",
  "type":"object",
  "properties":{
    "theater":{"type":"object","properties":{
      "name":{"type":"string"},"decks":{"type":"string"},"notes":{"type":"string"}
    }},
    "production_shows":{"type":"array","items":{"type":"object","required":["title"],"properties":{
      "title":{"type":"string"},"description":{"type":"string"}
    } }},
    "guest_entertainers":{"type":"array","items":{"type":"string"}},
    "interactive_events":{"type":"array","items":{"type":"object","required":["name"],"properties":{
      "name":{"type":"string"},"description":{"type":"string"}
    }}},
    "themed_parties":{"type":"array","items":{"type":"object","required":["name"],"properties":{
      "name":{"type":"string"},"venue":{"type":"string"}
    }}},
    "other_entertainment":{"type":"array","items":{"type":"string"}},
    "advice":{"type":"string"}
  },
  "additionalProperties":true
}
```

---

## 19) Common Pitfalls (and how to avoid them)

- **Duplicate JSON-LD Review** → Keep exactly one. Ensure `ratingValue` is numeric.
- **Unversioned local assets** → Always append `?v=3.007.010`.
- **CLS from carousels** → Use fixed aspect ratios and avoid auto-height where not needed.
- **External links opening without rel** → Ensure hardening script runs and/or manually add `rel`.
- **Hard-coded prod URLs on staging** → Rely on URL normalizer.
- **Dead Swiper import** → CDN fallback + `html.swiper-fallback` CSS path.

---

## 20) Editor & Dev Workflow Notes

- **Content editors**: Provide gallery and hero images at source resolution ≥ 1920px (landscape), compress to < 350KB if possible.
- **Dev**: When cloning a page for a new ship, change:
  - Canonical URL, `title`, `description`, hero URLs, `data-imo`, `data-name`, `#ship-stats-fallback`, `#videos-data`.
  - Update OG fields and all versioned asset URLs (keep site version constant unless bumping).
- **QA**: Use the checklists in §16 and run a local Lighthouse pass. Spot-check JSON-LD via Rich Results Test.

---

### TL;DR upgrade from the last draft
- Restored **all** legacy sections (skeleton, meta, canonical/OG, preconnects, analytics, URL normalizer, JSON-LD lineup, CSS/JS contracts, security, performance, PWA).
- Added **complete** venues/bars/entertainment spec, with filter UI contract and JSON augmentation.
- Included **logbook personas** shape & injector, **videos** data, **live tracker** fallback logic.
- Provided **JSON Schemas**, robust code samples, and **QA checklists**.
