---
title: "Solo_Cruising_Module_Standards_v3.006.solo.001.md"
source_file: "Solo_Cruising_Module_Standards_v3.006.solo.001.md"
generated: "2025-10-17T13:14:33.914138Z"
note: "Verbatim import (lightly normalized). Newer addenda may supersede specific clauses; see supersets."
---

# ⚓ Solo Cruising Module — Standards v3.006.solo.001
*In the Wake Project*  
Version Date: 2025-10-15

---

## 1. Purpose & Tone
- **Aim:** Warm, first-person travel blogger voice with nautical color, light humor, and occasional tender beats. Every piece should “smell” like Reformed Baptist theopraxy—gratitude, providence, rest, humility. Overt Scripture is welcomed when it strengthens the piece (e.g., Ps 23, Ps 107, Lk 19:40).
- **Tagline:** *“The sea asks nothing of you—sometimes that’s grace.”*

---

## 2. File & URL Structure
- **Index page:** `/solo/index.html` (alias `/solo.html`)
- **Per-article permalink:** `/solo/<slug>.html`
- **Deep link pattern:** `/solo.html?a=<slug>` or `#<slug>`
- **Canonical tags:**  
  - `/solo/<slug>.html`: canonical = itself  
  - `/solo.html`: canonical = `/solo.html`, OG tags switch dynamically if query present

---

## 3. Page Layout
### Hero
- *Flickers of Majesty* “Solo Tranquility” photo as banner.  
- Caption credit links to FoM.

### Columns
- **Main (2/3):** Active article.  
- **Sidebar (1/3):**  
  - Author card (links to external bios).  
  - Related reading (packing, Royal Caribbean, dining, ports).  
  - “Join Solo Cruisers Community” CTA.

---

## 4. Article Component Schema
Each article supplies structured data:

```html
<article id="<slug>" data-slug="<slug>" data-title="..." data-dek="..." data-author="Ken Baker" data-date="YYYY-MM-DD" data-cruiseline="Royal Caribbean" data-hero="/assets/solo/<slug>-hero.jpg">
  <h1>Article Title</h1>
  <p class="dek">One‑sentence promise of value.</p>
  <p>Body … <a href="/ships/rcl/grandeur-of-the-seas.html">Grandeur of the Seas</a> …</p>
  <figure class="pull">
    <blockquote>“Find your tribe early—cliques form quickly.”</blockquote>
    <figcaption>— community wisdom</figcaption>
  </figure>
  <p class="pill disclosure">…</p>
  <footer class="byline">
    <img src="/assets/authors/ken.jpg" alt="Ken Baker">
    <div>
      <strong><a href="https://ken-baker.com" target="_blank" rel="noopener">Ken Baker</a></strong>
      <p class="bio">Short one‑liner (phase 2).</p>
      <a class="share" href="#">Share this article</a>
    </div>
  </footer>
</article>
```

### Cross‑linking Rules
Prefer **Royal Caribbean** assets where available:
- Ship → `/ships/rcl/<ship>.html`
- Cruise line → `/ships/rcl/index.html`
- Packing → `/guides/packing.html`
- Venue → `/restaurants/<venue>.html`
- Port → `/ports/<region>/<port>.html`
- Always include price disclaimer.

---

## 5. Sidebar
### Authors Card
- “Our Authors” title.  
- Headshot + name + tags + external bio link.  
- Rotating list of 3 articles per author.

### Related Reading Card
- Pulls 3–5 internal links sharing tags (`solo`, `royal‑caribbean`, etc.).

---

## 6. Randomization & Deep Link Behavior
- `/solo.html` with no slug → random article.  
- `?a=<slug>` or `#<slug>` → specific article.  
- “Share” copies `/solo/<slug>.html` URL.  
- Last‑read slug stored in localStorage.

---

## 7. SEO / Social / Schema
- Title = `Article Title | Solo Cruising | In the Wake`  
- Description from `data‑dek`  
- OG/Twitter image = hero  
- JSON‑LD Article schema with author, date, image  
- `<meta name="referrer" content="no‑referrer">`  
- `rel="noopener"` on externals

---

## 8. Disclosure (Standard)
> **Full disclosure:** I’ve stood the watch aboard many ships—mostly Royal Caribbean—with more than 150 nights at sea across three oceans and over 30 nations. These are no borrowed winds, but soundings taken in my own wake, trimmed and charted for those who follow.

---

## 9. Spiritual Scent Guidelines
- **Covert defaults:** gratitude, contentment, providence, humility, rest.  
- **When overt:** one brief Scripture or explicit Christward line when it lifts the piece (e.g., Lk 19:40).  
- **Tone:** doxological not didactic.

---

## 10. Accessibility & Performance
- Descriptive alt text and lazy loading.  
- Color contrast ≥ WCAG AA.  
- Proper heading order.  
- Keyboard navigation for share buttons.

---

## 11. QA Checklist
- Canonicals verified.  
- Deep link loads correct article.  
- Sidebar randomizes appropriately.  
- All links resolve.  
- Disclosure present.  
- Lighthouse ≥ 90 performance / 95 a11y.

---

## 12. Guest‑Author Editorial Policy
**Purpose:** Maintain voice authenticity for guest writers while meeting project standards.

1. **Respect Voice:** Preserve tone and phrasing; no added theology or moralizing.  
2. **Scope:** grammar, flow, SEO, structure, accuracy.  
3. **May Adjust:** clarity, minor imagery, disclosures, price notes.  
4. **May Not Adjust:** worldview content or emotional register.  
5. **Credit:** > *Edited for clarity and style by the In the Wake Editorial Crew (per Standards v3.006.solo.001).*  
6. **Harmony Rule:** Site’s worldview appears through layout and context, not text insertion.

---

© 2025 In the Wake — Maintained under Standards v3.006 Invocation Edition.  
*Soli Deo Gloria.*
