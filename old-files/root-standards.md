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
