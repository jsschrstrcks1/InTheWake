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
