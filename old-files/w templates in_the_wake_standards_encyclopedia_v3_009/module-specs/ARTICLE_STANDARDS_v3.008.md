# Article Production Standards (v3.008)

> Canonical file. Mirrors/variants: ARTICLE-STANDARDS_v3.008.md, ARTICLE-PRODUCTION-STANDARDS_v3.008.md

In the Wake — Article Production Standards (v3.008)
Canonical front‑end & editorial standards for creating, hosting, and displaying articles on cruisinginthewake.com. Treat every article like a publication: reverent, precise, versioned, and verified.

0) Goals & Non‑negotiables
Respect & polish: Publication-grade layout, grammar, alt text, and attribution.

No regressions: Never break global rails, paths, or shared assets.

Cross‑linking: Articles ↔ authors ↔ ships ↔ restaurants ↔ ports.

Versioning everywhere: Append ?v=3.008 (or current) to all assets.

Disclosures: Use canonical Logbook disclosures verbatim when applicable.

Accessibility: Clear heading structure, meaningful links, high‑contrast UI.

1) Folder & Filename Conventions
/solo/                              # section (example)
  why-i-started-solo-cruising.html  # final article file

/assets/articles/
  why-i-started-solo-cruising.webp?v=3.008
  why-i-started-solo-cruising.jpg?v=3.008
  ...

/authors/
  ken-baker.html
  tina-maulsby.html

/authors/img/
  ken-baker.jpg?v=3.008
  ken1.webp?v=3.008
  ken1.jpg?v=3.008          # required fallback
  tina-maulsby.jpg?v=3.008

/authors/img/ico/
  ken1ico.webp?v=3.008
  tinaico.webp?v=3.008

/data/
  articles.json              # article index (see schema)
  authors.json               # author bios + headshots

2) Content Manifests (JSON)

/data/articles.json (schema)
```json
{
  "version": "v3.008",
  "articles": [
    {
      "id": "why-i-started-solo-cruising",
      "title": "Why I Started Solo Cruising (and Built a Community)",
      "url": "/solo/why-i-started-solo-cruising.html",
      "date": "2025-10-18",
      "excerpt": "From that first solo gangway to a thriving community — lessons, courage, and the unexpected joy of sailing on your own terms.",
      "image": "/assets/articles/why-i-started-solo-cruising.jpg?v=3.008",
      "author": {
        "name": "Tina Maulsby",
        "url": "/authors/tina-maulsby.html",
        "image": "/authors/img/tina-maulsby.jpg?v=3.008"
      },
      "keywords": ["solo", "community", "safety", "first-time"]
    }
  ]
}
```
Rules

- id matches HTML <article id> and filename slug.
- image points to the JPG fallback (WebP is handled in-page via <picture>).
- Update version on every content change.

/data/authors.json (schema)
```json
{
  "version": "v3.008",
  "authors": [
    {
      "slug": "tina-maulsby",
      "name": "Tina Maulsby",
      "title": "Solo Cruiser & Community Builder",
      "url": "/authors/tina-maulsby.html",
      "image": "/authors/img/tina-maulsby.jpg?v=3.008",
      "icon":  "/authors/img/ico/tinaico.webp?v=3.008",
      "bio": "Tina sails solo, builds community, and helps first-timers find their sea legs.",
      "social": {
        "instagram": "https://…",
        "tiktok": "https://…",
        "etsy": "https://…"
      }
    }
  ]
}
```

3) Article Page HTML Requirements

Save as /SECTION/{slug}.html (e.g., /solo/why-i-started-solo-cruising.html).

**Right‑side rails script (hardened; derives author from current article):**
```html
<script>
(function(){
  var ORIGIN=(location.origin||(location.protocol+'//'+location.host)).replace(/\/$,'');
  window._abs=function(p){p=String(p||'');if(!p.startsWith('/'))p='/'+p;return ORIGIN+p;};
  document.addEventListener('DOMContentLoaded', async function(){
    try {
      var ver = (document.querySelector('meta[name="page:version"]')||{}).content || '3.008';
      var articleEl = document.querySelector('article[data-slug]');
      var currentSlug = articleEl ? articleEl.getAttribute('data-slug') : null;
      var [authorsRes, articlesRes] = await Promise.all([
        fetch('/data/authors.json?v='+encodeURIComponent(ver), {cache:'no-store'}),
        fetch('/data/articles.json?v='+encodeURIComponent(ver), {cache:'no-store'})
      ]);
      var authors = await authorsRes.json();
      var articles = await articlesRes.json();

      var authorRail = document.getElementById('author-rail');
      if (authorRail && authors.authors && articles.articles) {
        var entry = currentSlug && articles.articles.find(function(a){return (a.id||'')===currentSlug;});
        var authorName = entry && entry.author && entry.author.name;
        var a = (authorName && authors.authors.find(function(x){return x.name===authorName;})) || authors.authors[0];
        if (a) authorRail.innerHTML = [
          '<div class="rail-card">',
          '<img src="', a.image ,'" alt="', a.name ,'" width="200" height="200" loading="lazy">',
          '<h3><a href="', a.url ,'">', a.name ,'</a></h3>',
          '<p>', (a.title||'') ,'</p>',
          '</div>'
        ].join('');
      }

      var recentRail = document.getElementById('recent-articles-rail');
      if (recentRail && articles.articles) {
        var items = articles.articles.slice(0,5).map(function(a){
          return [
            '<li>',
            '  <a href="', a.url ,'">',
            '    <img src="', a.image ,'" alt="', a.title ,'" width="120" height="68" loading="lazy">',
            '    <span>', a.title ,'</span>',
            '  </a>',
            '</li>'
          ].join('');
        }).join('');
        recentRail.innerHTML = '<h3>Recent Articles</h3><ul class="rail-list">'+items+'</ul>';
      }
    } catch(e){ console.warn('Rail load error', e); }
  });
})();
</script>
```

4) Visual & CSS Hooks
```css
.card{ border:4px solid var(--rope); border-radius:1rem; padding:0; overflow:hidden; box-shadow:0 4px 24px rgba(8,48,65,.12) }
.article-hero img{ display:block; width:100%; height:auto }
.attribution{ font-size:.85rem; padding:.5rem .75rem; color:#083041a8; text-align:left }
.pull blockquote{ font-size:1.25rem; margin:0; padding:1rem 1.25rem }
.cta.card{ padding:1.25rem }
.button{ display:inline-block; padding:.6rem 1rem; border-radius:.75rem }
.button.ghost{ background:transparent; border:2px solid currentColor }
.rail .rail-card{ border-left:4px solid var(--rope); padding-left:.75rem; margin-bottom:1rem }
```
(…remaining sections unchanged; see canonical spec above.)
