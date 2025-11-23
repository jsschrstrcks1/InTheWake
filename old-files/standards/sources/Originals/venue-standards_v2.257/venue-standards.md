
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
