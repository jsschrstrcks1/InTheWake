---
title: "Navigation Standards Addendum v3.008"
source: "Unified Primary Navigation Contract"
generated: "2025-10-17T16:45:00Z"
note: "Defines canonical navigation structure, URLs, and accessibility contract for all pages."
---

# 🧭 In the Wake — Navigation Standards Addendum (v3.008)

## Purpose
To establish a **single, immutable primary navigation structure** across all pages — ensuring user familiarity, accessibility, and SEO coherence.  
This addendum supersedes any page-specific or legacy nav variations from earlier standards.

---

## 1️⃣ Canonical Navigation Contract

### Required Structure
Every public page **MUST** include a `<header>` with the following pattern (Only once - this pattern replaces existing nav patterns, and NEVER duplicates):

```html
<header class="site-header">
  <div class="navbar">
    <div class="brand">
      <a href="https://cruisinginthewake.com/index.html">
        <img src="https://cruisinginthewake.com/assets/logo_wake.png?v=3.008"
             alt="In the Wake" width="256" height="64">
      </a>
      <span class="version-badge" aria-label="Site version">v3.008</span>
    </div>

    <nav class="pill-nav pills" aria-label="Primary">
      <a href="https://cruisinginthewake.com/index.html">Home</a>
      <a href="https://cruisinginthewake.com/ships/index.html">Ships</a>
      <a href="https://cruisinginthewake.com/restaurants.html">Restaurants &amp; Menus</a>
      <a href="https://cruisinginthewake.com/ports.html">Ports</a>
      <a href="https://cruisinginthewake.com/disability-at-sea.html">Disability at Sea</a>
      <a href="https://cruisinginthewake.com/drink-packages.html">Drink Packages</a>
      <a href="https://cruisinginthewake.com/packing-lists.html">Packing Lists</a>
      <a href="https://cruisinginthewake.com/planning.html">Planning</a>
      <a href="https://cruisinginthewake.com/solo.html">Solo</a>
      <a href="https://cruisinginthewake.com/travel.html">Travel</a>
      <a href="https://cruisinginthewake.com/cruise-lines.html">Cruise Lines</a>
      <a href="https://cruisinginthewake.com/about-us.html">About Us</a>
    </nav>
  </div>
</header>
```

**Order is canonical and non-negotiable.**

---

## 2️⃣ Functional Rules

| Rule | Description |
|------|--------------|
| **Absolute URLs** | All links must use `https://cruisinginthewake.com/...` (normalized by `_abs()` in staging/CDN). |
| **Class Contract** | `.navbar > .brand + .pill-nav.pills` (no exceptions). |
| **Brand Section** | Always includes the logo + `.version-badge`. |
| **ARIA Label** | `aria-label="Primary"` required on `<nav>`. |
| **Active State** | Exactly one `<a>` element carries `aria-current="page"`. |
| **Keyboardability** | Links must be focusable; `:focus-visible` outline must remain visible. |
| **Responsiveness** | Pills wrap naturally; mobile layouts must not hide links without a visible toggle button (`aria-expanded`). |

---

## 3️⃣ Auto-Highlight Script (Standard Snippet)

To set `aria-current="page"` automatically — required on **every page**:

```html
<script>
(function setNavCurrent(){
  try{
    const here = new URL(location.href);
    const normalize = u => {
      const url = new URL(u, here.origin);
      let p = url.pathname.replace(/\/index\.html$/,'/').replace(/\/$/,'/index.html');
      return url.origin + p;
    };
    const current = normalize(here.href);
    document.querySelectorAll('.pill-nav a[href]').forEach(a=>{
      const href = a.getAttribute('href');
      if (!href) return;
      const target = normalize(href);
      if (target === current) a.setAttribute('aria-current','page');
    });
  }catch(_){}
})();
</script>
```

✅ Supports:
- Default documents (`index.html`)  
- Trailing slashes  
- Staging/CDN environments via `_abs()`  

---

## 4️⃣ Accessibility and Semantics

- `nav[aria-label="Primary"]` for screen readers.  
- Maintain skip link (`<a class="skip-link" href="#content">Skip to main content</a>`) **before** the header.  
- Maintain focus-visible outlines (`outline: 2px solid var(--sea);`)  
- Each top-level `<a>` is keyboard-focusable with a minimum height of 40px.  

---

## 5️⃣ Optional Search Integration (Future Extension)
If global search is added:
- Append a right-aligned `<form role="search">` inside `.navbar`.
- Input must have `aria-label="Search site"`.
- May use the shared endpoint `/search.html?q={query}`.

---

## 6️⃣ Compliance Checklist (CI Verifiable)

| ✅ Requirement | Status |
|----------------|--------|
| `.pill-nav.pills` present and correctly ordered | Required |
| `.brand` + logo + version badge exist | Required |
| Canonical absolute URLs used | Required |
| One `aria-current="page"` | Required |
| `aria-label="Primary"` applied | Required |
| Skip-link before header | Required |
| No page deviates in link count/order | Required |
| Version badge matches `<meta name="version">` | Required |

---

## 7️⃣ Integration with URL Normalizer
- Pages may safely call `_abs()` to rewrite URLs to current origin in staging/CDN.
- Production pages **must** render full `https://cruisinginthewake.com/...` URLs on initial load.

---

## 8️⃣ Revision Policy
- This Addendum is part of the **Frontend Standards v3.008 Superset**.  
- Future updates to navigation structure (e.g., adding “News” or “Shop”) must increment the minor version and update all templates.  
- No individual page may diverge from this layout.  

---

### Invocation
```
<!-- Soli Deo Gloria | Navigation Standards v3.008 -->
```

**Steward:** abondservant  
**Approved:** v3.008 Golden Merge — 2025-10-17  
**Scope:** Entire site (root, ships, lines, venues, solo, restaurants, ports, travel)

---
