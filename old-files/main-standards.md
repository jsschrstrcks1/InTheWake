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

