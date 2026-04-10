# Noscript Repair Guide

**Purpose:** Step-by-step procedures for adding noscript fallbacks to port pages during repairs.
**Created:** 2026-04-09
**Used by:** The v2 validator references this document in error messages.
**Why this matters:** The site serves exhausted caregivers on hospital WiFi, disabled users on stripped-down browsers, and privacy-conscious travelers running NoScript. They deserve content, not empty divs. ICP-2 v2.1 Section E requires key content in static HTML.

---

## 1. Ships Visiting — Noscript Fallback

**Where:** Inside the `<section class="card ships-visiting">` container, after the JS-populated content.

**What to add:** A `<noscript>` block listing ships that visit this port with links to their pages.

**How to find the data:** Check the existing JS-populated content on the page (view with JS enabled), or check `assets/data/ports/port-registry.json` for the port's ship list, or search ship pages that mention this port.

**Template:**
```html
<noscript>
  <p class="tiny">Ships that visit this port (enable JavaScript for the full interactive list):</p>
  <ul class="ships-list-static" style="list-style: none; padding: 0; display: flex; flex-wrap: wrap; gap: 0.5rem;">
    <li><a href="/ships/LINE/SLUG.html" class="ship-link-pill">SHIP NAME</a></li>
    <li><a href="/ships/LINE/SLUG.html" class="ship-link-pill">SHIP NAME</a></li>
    <!-- Add all ships that regularly call at this port -->
  </ul>
</noscript>
```

**Place it:** Just before `</section>` closing tag of the ships-visiting section.

**Minimum:** At least 3 ships. If port has fewer than 3, list all of them.

---

## 2. Recent Stories Rail — Noscript Fallback

**Where:** Inside the `<div id="recent-rail">` container.

**What to add:** A `<noscript>` block with 3-5 static article links.

**How to find the data:** Check `assets/data/articles/index.json` for recent articles. Pick 3-5 that are broadly relevant (not port-specific — these are site-wide stories).

**Template:**
```html
<div id="recent-rail" class="rail-list" aria-live="polite">
  <noscript>
    <ul style="list-style: none; padding: 0;">
      <li style="margin-bottom: 0.75rem;">
        <a href="/solo/articles/SLUG.html" style="text-decoration: none; color: var(--link);">
          <strong>ARTICLE TITLE</strong>
          <span class="tiny" style="display: block; color: #678;">Brief description</span>
        </a>
      </li>
      <!-- 3-5 articles -->
    </ul>
    <p class="tiny"><a href="/solo.html">View all stories →</a></p>
  </noscript>
</div>
```

**Note:** Use the same articles across all ports — this is a site-wide "recent stories" section, not port-specific content. Update the articles when publishing new content.

### 2b. Recent Rail — Navigation + Loader Pattern

The Recent Rail also needs pagination nav elements and an article loader script reference for the `validate-recent-articles.js` validator to pass.

**Required elements around `#recent-rail`:**
```html
<nav id="recent-rail-nav-top" class="rail-nav" aria-label="Article pagination" style="display:none; margin-bottom: 0.5rem;"></nav>
<div id="recent-rail" class="rail-list" aria-live="polite">
  <noscript><!-- static article links from §2 above --></noscript>
</div>
<nav id="recent-rail-nav-bottom" class="rail-nav" aria-label="Article pagination" style="display:none; margin-top: 0.75rem;"></nav>
<p id="recent-rail-fallback" class="tiny hidden">Loading articles…</p>
```

**Required script:** The page must include `article-rail.js`:
```html
<script src="/assets/js/article-rail.js"></script>
```
This is typically already present. If missing, add it before `</body>`.

**The validator checks for:**
1. `#recent-rail-nav-top` — pagination container (hidden by default, JS populates)
2. `#recent-rail-nav-bottom` — pagination container
3. Article loader — either `async function loadArticles` inline, `fetchJSONWithFallback`, or `article-rail.js` external script

---

## 3. Photo Gallery — Noscript Fallback

**Where:** Inside the `<div class="swiper gallery-swiper">` container, after the swiper-wrapper div.

**What to add:** A `<noscript>` block with 4-6 static images from the port's image directory.

**How to find the data:** Check `ports/img/{port-slug}/` for available images. Use the same images already in the swiper slides.

**Template:**
```html
<noscript>
  <div class="gallery-static" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; padding: 1rem 0;">
    <figure style="margin: 0;">
      <img src="/ports/img/PORT-SLUG/IMAGE.webp" alt="DESCRIPTIVE ALT TEXT" loading="lazy" style="width: 100%; border-radius: 8px;">
      <figcaption class="tiny">CAPTION — <a href="SOURCE_URL" target="_blank" rel="noopener">Credit</a></figcaption>
    </figure>
    <!-- Repeat for 4-6 images -->
  </div>
  <p class="tiny">Enable JavaScript for the full interactive gallery carousel.</p>
</noscript>
```

**Place it:** After `</div><!-- swiper-wrapper -->` and before the swiper navigation buttons, inside the swiper container.

**Rules:**
- Use the same images as the swiper slides (don't add new ones)
- Keep alt text from the existing slides
- Include photo credits if the slide has figcaptions
- 4-6 images is enough — don't duplicate the entire gallery

---

## 4. Weather Guide — Full Static Noscript

**Where:** Inside the `<div id="port-weather-widget">` container, replacing any "Enable JavaScript" placeholder.

**What to add:** A complete static seasonal guide with At a Glance, Best Time to Visit, Catches Off Guard, Packing Tips, and Weather Hazards.

**How to find the data:** Research the port's climate, or use the weather data already in the JS widget's data attributes + the port's existing notices section for hazard information.

**Template (copy from a working port like cozumel.html and adapt):**
```html
<noscript>
  <div class="seasonal-guide seasonal-guide-static">
    <!-- At a Glance -->
    <details class="seasonal-section" open>
      <summary class="seasonal-section-title">At a Glance</summary>
      <div class="seasonal-at-glance">
        <div class="seasonal-glance-grid">
          <div class="seasonal-glance-item"><span class="glance-label">Temperature</span><span class="glance-value">RANGE depending on season</span></div>
          <div class="seasonal-glance-item"><span class="glance-label">Humidity</span><span class="glance-value">DESCRIPTION</span></div>
          <div class="seasonal-glance-item"><span class="glance-label">Rain</span><span class="glance-value">DESCRIPTION</span></div>
          <div class="seasonal-glance-item"><span class="glance-label">Wind</span><span class="glance-value">DESCRIPTION</span></div>
          <div class="seasonal-glance-item"><span class="glance-label">Daylight</span><span class="glance-value">X-Y hours depending on season</span></div>
        </div>
      </div>
    </details>

    <!-- Best Time to Visit -->
    <details class="seasonal-section" open>
      <summary class="seasonal-section-title">Best Time to Visit</summary>
      <div class="seasonal-best-time">
        <div class="cruise-seasons-grid">
          <div class="cruise-season cruise-season-high"><span class="season-label">Peak Season</span><span class="season-months">MONTHS</span></div>
          <div class="cruise-season cruise-season-transitional"><span class="season-label">Transitional Season</span><span class="season-months">MONTHS</span></div>
          <div class="cruise-season cruise-season-low"><span class="season-label">Low Season</span><span class="season-months">MONTHS</span></div>
        </div>
        <div class="best-months-activities">
          <div class="activity-row"><span class="activity-label">Beach</span><span class="activity-months">MONTHS or N/A</span></div>
          <div class="activity-row"><span class="activity-label">Snorkeling</span><span class="activity-months">MONTHS or N/A</span></div>
          <div class="activity-row"><span class="activity-label">Hiking</span><span class="activity-months">MONTHS or N/A</span></div>
          <div class="activity-row"><span class="activity-label">City Walking</span><span class="activity-months">MONTHS or N/A</span></div>
          <div class="activity-row"><span class="activity-label">Low Crowds</span><span class="activity-months">MONTHS</span></div>
        </div>
        <div class="months-to-avoid">
          <span class="avoid-label">Consider avoiding:</span>
          <span class="avoid-months">MONTHS</span>
          <span class="avoid-reason">(REASON)</span>
        </div>
      </div>
    </details>

    <!-- What Catches Visitors Off Guard -->
    <details class="seasonal-section">
      <summary class="seasonal-section-title">What Catches Visitors Off Guard</summary>
      <div class="seasonal-catches">
        <ul class="catches-list">
          <li>ITEM 1</li>
          <li>ITEM 2</li>
          <li>ITEM 3</li>
        </ul>
      </div>
    </details>

    <!-- Packing Tips -->
    <details class="seasonal-section">
      <summary class="seasonal-section-title">Packing Tips</summary>
      <div class="seasonal-packing">
        <ul class="packing-list">
          <li>ITEM 1</li>
          <li>ITEM 2</li>
          <li>ITEM 3</li>
        </ul>
      </div>
    </details>

    <!-- Weather Hazards -->
    <details class="seasonal-section" open>
      <summary class="seasonal-section-title">Weather Hazards</summary>
      <div class="seasonal-hazards">
        <div class="hazard-warning">
          <span class="hazard-icon">⚠️</span>
          <div class="hazard-content">
            <strong>HAZARD NAME</strong>
            <p>Season: MONTHS</p>
            <p>Peak risk: MONTHS</p>
            <p class="hazard-note">PRACTICAL ADVICE</p>
          </div>
        </div>
      </div>
    </details>

    <p class="weather-noscript-note"><em>Enable JavaScript for live weather conditions and 48-hour forecast.</em></p>
  </div>
</noscript>
```

**Important:** Activities must match the port's climate. Don't put Beach/Snorkeling on Alaska ports. Use N/A for inapplicable activities. Verify hazards against the PORT_DISRUPTION_FACTORS_REFERENCE.md.

---

## 5. Map — Noscript Fallback

**Where:** Inside the map container div (e.g., `<div id="PORT-port-map">`), replacing any "Enable JavaScript" placeholder.

**What to add:** A text-based location list with distances from the cruise terminal.

**How to find the data:** Use the "From the Pier" section data already on the page, or check the POI manifest at `assets/data/maps/{port-slug}.map.json`.

**Template:**
```html
<noscript>
  <div class="map-static" style="padding: 1rem; background: #f7fdff; border-radius: 8px;">
    <p><strong>Key locations from the cruise terminal:</strong></p>
    <ul style="line-height: 1.8;">
      <li><strong>ATTRACTION 1</strong> — X minutes by TRANSPORT</li>
      <li><strong>ATTRACTION 2</strong> — X minutes by TRANSPORT</li>
      <li><strong>ATTRACTION 3</strong> — X minutes by TRANSPORT</li>
    </ul>
    <p class="tiny">Enable JavaScript for the interactive map with markers and directions.</p>
  </div>
</noscript>
```

**Note:** This duplicates "From the Pier" data. That's intentional — noscript users who can't see the map still get orientation. Keep it concise (5-8 locations max).

---

## During Port Repairs — Checklist

When repairing any port page, check these noscript items:

- [ ] **Weather noscript:** Does `<noscript>` inside `port-weather-widget` have a full `seasonal-guide-static` div? If it just says "Enable JavaScript" or is empty, build the full static weather guide.
- [ ] **Gallery noscript:** Does the swiper container have a `<noscript>` block with static images? If not, add 4-6 images.
- [ ] **Ships visiting noscript:** Does the ships-visiting section have a `<noscript>` fallback? If not, add a static ship list.
- [ ] **Recent stories noscript:** Does `#recent-rail` contain a `<noscript>` block? If not, add static article links.
- [ ] **Map noscript:** Does the map container have a text-based location list in `<noscript>`? If it only says "Enable JavaScript", add key locations with distances.

---

**Soli Deo Gloria** — People before platform. Every visitor deserves content, not empty divs.
