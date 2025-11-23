---
title: "cruise-lines-standards.md"
source_file: "cruise-lines-standards.md"
generated: "2025-10-17T13:14:33.916512Z"
note: "Verbatim import (lightly normalized). Newer addenda may supersede specific clauses; see supersets."
---

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
