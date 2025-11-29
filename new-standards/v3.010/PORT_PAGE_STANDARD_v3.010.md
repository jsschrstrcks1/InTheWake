# Port Page Standard — ITW-Lite v3.010

**Version:** 3.010.500
**Last Updated:** 2025-11-29
**Status:** Active
**Reference Implementation:** `/ports/nassau.html`

---

## Overview

This document defines the complete specification for cruise port pages on In the Wake. Follow this standard exactly to create consistent, accessible, AI-friendly port guides.

---

## 1. Document Structure (Top to Bottom)

### 1.1 Theological Invocation (REQUIRED, IMMUTABLE)
```html
<!--
Soli Deo Gloria
-->
```
- **Position:** Lines 1-3, before `<!doctype html>`
- **Purpose:** Foundation for all work on this project
- **Rule:** NEVER modify or remove

### 1.2 DOCTYPE and HTML Element
```html
<!doctype html>
<html lang="en">
```

### 1.3 Head Section

#### 1.3.1 Required Meta Tags (in order)
```html
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>

  <!-- ICP-Lite v1.0 Protocol (REQUIRED) -->
  <meta name="ai-summary" content="[1-2 sentence description, 250 char max, first-person logbook style]"/>
  <meta name="last-reviewed" content="YYYY-MM-DD"/>
  <meta name="content-protocol" content="ICP-Lite v1.0"/>

  <title>[Port Name] Port Guide — [Key Attraction] | In the Wake</title>
  <meta name="description" content="[First-person logbook description, 150-160 chars]"/>
  <link rel="canonical" href="https://cruisinginthewake.com/ports/[port-slug].html"/>
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/icons/in_the_wake_icon_32x32.png"/>
```

#### 1.3.2 Service Worker Registration
```html
<script>
if('serviceWorker' in navigator){
  window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}));
}
</script>
```

#### 1.3.3 Stylesheet Link
```html
<link rel="stylesheet" href="/assets/styles.css"/>
```

#### 1.3.4 Schema.org BreadcrumbList (JSON-LD)
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://cruisinginthewake.com/"},
    {"@type": "ListItem", "position": 2, "name": "Ports", "item": "https://cruisinginthewake.com/ports.html"},
    {"@type": "ListItem", "position": 3, "name": "[Port Name]", "item": "https://cruisinginthewake.com/ports/[port-slug].html"}
  ]
}
</script>
```

#### 1.3.5 Page-Specific Styles (Inline)
Include these CSS rules in a `<style>` block:

```css
/* Page Grid Layout (2-column with right rail) */
.page-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  align-items: start;
}

@media (min-width: 980px) {
  .page-grid {
    grid-template-columns: 1fr 360px;
  }
}

.rail {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.rail-list {
  display: grid;
  gap: 1rem;
}

/* Logbook entry styling */
.logbook-entry { font-size: 1.05rem; line-height: 1.8; color: #134; }
.logbook-entry p { margin-bottom: 1.25rem; }

/* Poignant highlight box */
.poignant-highlight {
  background: linear-gradient(135deg, #f0f9ff 0%, #e6f4f8 100%);
  border-left: 4px solid var(--accent, #0e6e8e);
  padding: 1.25rem 1.5rem;
  margin: 1.5rem 0;
  border-radius: 0 12px 12px 0;
  font-style: italic;
}

/* Port info sections */
.port-section {
  margin: 2rem 0;
  padding: 1.25rem;
  background: #f7fdff;
  border-radius: 12px;
  border: 1px solid #e0f0f5;
}
.port-section h3 { margin-top: 0; color: var(--sea, #0a3d62); }

/* Author card */
.author-card-vertical { text-align: center; }
.author-card-vertical .author-avatar {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  object-fit: cover;
  margin: 0 auto 1rem;
}
.author-card-vertical h4 { margin: 0.5rem 0 0.25rem; }
.author-card-vertical p { margin: 0.25rem 0; }

/* Hero image */
.port-hero {
  width: 100%;
  height: 300px;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
}

/* Inline images (float right) */
.inline-image {
  float: right;
  width: 45%;
  max-width: 320px;
  margin: 0 0 1rem 1.5rem;
  border-radius: 10px;
  box-shadow: 0 3px 12px rgba(0,0,0,0.12);
}

/* Inline images (float left) */
.inline-image-left {
  float: left;
  width: 45%;
  max-width: 320px;
  margin: 0 1.5rem 1rem 0;
  border-radius: 10px;
  box-shadow: 0 3px 12px rgba(0,0,0,0.12);
}

/* Mobile: stack inline images */
@media (max-width: 680px) {
  .inline-image, .inline-image-left {
    float: none;
    width: 100%;
    max-width: 100%;
    margin: 1rem 0;
  }
}

/* Gallery grid */
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin: 1.5rem 0;
}

.gallery-item {
  margin: 0;
  border-radius: 12px;
  overflow: hidden;
  background: #f7fdff;
  box-shadow: 0 3px 12px rgba(0,0,0,0.08);
  transition: transform 0.2s, box-shadow 0.2s;
}

.gallery-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}

.gallery-item img {
  width: 100%;
  height: 220px;
  object-fit: cover;
  display: block;
}

.gallery-item figcaption {
  padding: 1rem;
  font-size: 0.9rem;
  color: #345;
  line-height: 1.5;
}

.gallery-item .photo-credit {
  font-size: 0.75rem;
  color: #678;
  margin-top: 0.5rem;
}

/* Featured/sunset images */
.sunset-feature {
  width: 100%;
  border-radius: 12px;
  margin: 2rem 0;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
}

.sunset-caption {
  text-align: center;
  font-style: italic;
  color: #567;
  margin-top: 0.75rem;
  font-size: 0.95rem;
}

/* Clearfix for floated images */
.clearfix::after {
  content: "";
  display: table;
  clear: both;
}
```

#### 1.3.6 LCP Preload Hints
```html
<link rel="preload" as="image" href="/ports/img/[port-slug]/[hero-image].jpeg" fetchpriority="high"/>
<link rel="preload" as="image" href="/assets/logo_wake_560.png" fetchpriority="high"/>
```

---

## 2. Body Structure

### 2.1 Body Element and Skip Link
```html
<body class="page">
  <a href="#main-content" class="skip-link">Skip to main content</a>

  <!-- ARIA Live Regions (accessibility) -->
  <div id="a11y-status" role="status" aria-live="polite" aria-atomic="true" class="sr-only"></div>
  <div id="a11y-alerts" role="alert" aria-live="assertive" aria-atomic="true" class="sr-only"></div>
```

### 2.2 Header (Standard Site Header)
Include the standard site header with:
- Brand logo with version badge
- Navigation with dropdown menus (Planning, Travel)
- Hero section with compass rose, logo, tagline, and photo credit

### 2.3 Main Content Area

#### 2.3.1 Main Element with Grid Layout
```html
<main class="wrap page-grid" id="main-content" role="main">
```

#### 2.3.2 Breadcrumb Navigation (Row 1, Full Width)
```html
<nav aria-label="Breadcrumb" style="grid-column: 1 / -1; margin-bottom: 1rem;">
  <ol style="list-style: none; padding: 0; margin: 0; font-size: 0.9rem; color: #666;">
    <li style="display: inline;"><a href="/">Home</a> &rsaquo; </li>
    <li style="display: inline;"><a href="/ports.html">Ports</a> &rsaquo; </li>
    <li style="display: inline;" aria-current="page">[Port Name]</li>
  </ol>
</nav>
```

#### 2.3.3 At a Glance Section (Column 2, Row 2)
**ITW-Lite Collapsible Section Pattern:**
```html
<section class="page-intro" style="grid-column: 2; grid-row: 2; margin-bottom: 1rem; align-self: start;">
  <details open style="background: #f7fdff; border: 1px solid #e0f0f5; border-radius: 8px; padding: 0;">
    <summary style="cursor: pointer; padding: 0.75rem; font-weight: 600; border-left: 3px solid var(--rope, #d9b382); border-radius: 8px 8px 0 0; background: #f7fdff;">At a Glance</summary>
    <div style="padding: 0.5rem 0.75rem 0.75rem;">
      <p style="margin: 0;"><strong>Quick Answer:</strong> [One-sentence summary of port highlights, local specialties, and must-do experiences]</p>
    </div>
  </details>
</section>
```
- **MUST be open by default** (`<details open>`)
- **MUST be collapsible** by user
- **Content:** Quick answer format with port highlights

#### 2.3.4 Main Article Card (Column 1, Row 2, Spanning Multiple Rows)
```html
<div style="grid-column: 1; grid-row: 2 / span 10;">
  <article class="card">
    <!-- Content here -->
  </article>
</div>
```

---

## 3. Article Content Components

### 3.1 Hero Image with Port Name Overlay
```html
<div class="port-hero-container" style="position: relative; margin-bottom: 1.5rem;">
  <img class="port-hero"
       src="/ports/img/[port-slug]/[hero-image].jpeg"
       alt="[Descriptive alt text of the scene]"
       fetchpriority="high"
       style="margin-bottom: 0;"/>
  <div class="port-name-overlay" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-family: 'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif; font-size: clamp(3rem, 10vw, 6rem); font-weight: 700; color: #fff; text-shadow: 2px 2px 8px rgba(0,0,0,0.7), 0 0 40px rgba(0,0,0,0.5); letter-spacing: 0.12em; text-transform: uppercase;">[PORT NAME]</div>
</div>
```
- **Font:** Nautical serif (Palatino, Book Antiqua, Georgia)
- **Size:** Responsive using `clamp(3rem, 10vw, 6rem)`
- **Position:** Centered on image
- **Styling:** White, bold, uppercase, letter-spacing 0.12em
- **Text shadow:** For readability over any image

### 3.2 Page Title (H1)
```html
<h1>[Port Name]: [Evocative Subtitle That Captures the Port's Personality]</h1>
```
- Use an en-dash (–) not a hyphen (-) in titles
- Subtitle should be personal, emotional, memorable
- Example: "Nassau: My Love–Hate Harbor That Keeps Winning Me Back"

### 3.3 Logbook Entry Sections
```html
<div class="logbook-entry clearfix">
  <img class="inline-image" src="/ports/img/[port-slug]/[image].jpeg" alt="[Descriptive alt]" loading="lazy"/>

  <p>[First-person narrative paragraph about the port experience...]</p>
  <p>[Another paragraph continuing the story...]</p>

  <div class="poignant-highlight">
    <strong>The Moment That Stays With Me:</strong> [Deeply personal, emotional memory that captures the magic of this place]
  </div>
</div>
```

**Logbook Entry Rules:**
- **Voice:** First-person, conversational, personal
- **Tone:** Warm, enthusiastic, honest (include both positives and quirks)
- **Images:** Alternate between `.inline-image` (right) and `.inline-image-left`
- **Paragraphs:** 2-4 sentences each, readable flow
- **Poignant Highlight:** One per page, the emotional heart of the story

### 3.4 Featured Images (Full-Width)
```html
<figure style="margin: 2rem 0;">
  <img class="sunset-feature" src="/ports/img/[port-slug]/[image].jpeg" alt="[Descriptive alt]"/>
  <figcaption class="sunset-caption">
    [Evocative caption that adds to the story]
    <br/><span style="font-size: 0.8rem;">Photo © <a href="[photographer-url]" target="_blank" rel="noopener">[Photographer Name]</a></span>
  </figcaption>
</figure>
```

### 3.5 Photo Gallery
```html
<div style="margin: 2rem 0;">
  <h3>More [Port Name] Moments</h3>
  <div class="gallery-grid">

    <figure class="gallery-item">
      <img src="/ports/img/[port-slug]/[image].jpeg" alt="[Descriptive alt]" loading="lazy"/>
      <figcaption>
        [Short, evocative caption]
        <div class="photo-credit">Photo © <a href="[url]" target="_blank" rel="noopener">[Photographer]</a></div>
      </figcaption>
    </figure>

    <!-- Repeat for 4-6 gallery items -->

  </div>
</div>
```

### 3.6 Port Information Sections

#### 3.6.1 Getting Around Section
```html
<section class="port-section">
  <h3>Getting Around [Port Name]</h3>
  <p>[Overview of transportation from the cruise pier]</p>
  <ul>
    <li><strong>[Attraction 1]:</strong> [How to get there, time estimate]</li>
    <li><strong>[Attraction 2]:</strong> [How to get there, time estimate]</li>
    <!-- Continue for key attractions -->
  </ul>
</section>
```

#### 3.6.2 Depth Soundings Ashore (Practical Tips)
```html
<section class="port-section">
  <h3>Depth Soundings Ashore</h3>
  <p class="tiny" style="margin-bottom: 0.5rem; font-style: italic; color: #678;">Practical tips before you step off the ship.</p>
  <p>[Honest, helpful advice about local customs, potential hassles, and how to handle them gracefully]</p>
</section>
```

#### 3.6.3 Frequently Asked Questions
```html
<section class="port-section">
  <h3>Frequently Asked Questions</h3>
  <p><strong>Q: [Common question]?</strong><br/>A: [Helpful, direct answer with specific recommendations]</p>
  <p><strong>Q: [Another question]?</strong><br/>A: [Answer]</p>
  <!-- 3-5 FAQs typical -->
</section>
```

---

## 4. Right Rail (Sidebar)

### 4.1 Rail Container
```html
<aside class="rail" style="grid-column: 2; grid-row: 3 / span 8; align-self: start;">
```
- Starts at row 3 (below At a Glance)
- Spans 8 rows to accommodate content

### 4.2 Author Card (Collapsible)
**All rail cards MUST be collapsible using `<details open>`**

```html
<details open class="card" style="background: #fff; border: 1px solid #e0f0f5; border-radius: 8px;">
  <summary style="cursor: pointer; padding: 0.75rem; font-weight: 600; border-left: 3px solid var(--rope, #d9b382); border-radius: 8px 8px 0 0; background: #f7fdff;">About the Author</summary>
  <div class="author-card-vertical" style="padding: 1rem; text-align: center;">
    <a href="/authors/[author-slug].html" aria-label="View [Author Name]'s profile">
      <picture>
        <source srcset="/authors/img/[author].webp?v=3.010.300" type="image/webp"/>
        <img class="author-avatar"
             src="/authors/img/[author]_96.webp"
             srcset="/authors/img/[author]_96.webp 1x, /authors/img/[author]_192.webp 2x"
             width="96" height="96"
             alt="Author photo"
             style="border-radius: 12px;"
             decoding="async" loading="lazy"/>
      </picture>
    </a>
    <h4 style="margin: 0.5rem 0 0.25rem;"><a href="/authors/[author-slug].html">[Author Name]</a></h4>
    <p class="tiny" style="margin: 0.25rem 0;">[Short author bio, one line]</p>
    <p class="tiny" style="margin: 0.25rem 0;">
      <a href="[author-website]" target="_blank" rel="noopener">[Website Name]</a>
    </p>
  </div>
</details>
```

### 4.3 Recent Articles Rail (Collapsible)
```html
<details open class="card" style="background: #fff; border: 1px solid #e0f0f5; border-radius: 8px;">
  <summary style="cursor: pointer; padding: 0.75rem; font-weight: 600; border-left: 3px solid var(--rope, #d9b382); border-radius: 8px 8px 0 0; background: #f7fdff;">Recent Stories</summary>
  <div style="padding: 1rem;">
    <p class="tiny" style="margin-bottom: 1rem; color: var(--ink-mid, #3d5a6a); line-height: 1.5;">
      Real cruising experiences, practical guides, and heartfelt reflections from our community.
    </p>
    <div id="recent-rail" class="rail-list" aria-live="polite"></div>
    <p id="recent-rail-fallback" class="tiny" style="display:none">Loading articles…</p>
  </div>
</details>
```

### 4.4 Rail Card Collapsibility Rule
**IMPORTANT:** Every card in the right rail MUST:
- Use `<details open>` wrapper (open by default)
- Have consistent `<summary>` styling with left border accent
- Be collapsible by user interaction
- This includes: At a Glance, Author Card, Recent Stories, and any future rail cards

---

## 5. Footer Elements

### 5.1 Back Link
```html
<p style="margin-top: 2rem;"><a href="/ports.html">&larr; Back to Ports Guide</a></p>
```

### 5.2 Site Footer
```html
<footer class="wrap" role="contentinfo">
  <p>© 2025 In the Wake · A Cruise Traveler's Logbook · All rights reserved.</p>
  <p class="tiny" style="margin-top: 0.5rem;">
    <a href="/privacy.html">Privacy</a> ·
    <a href="/terms.html">Terms</a> ·
    <a href="/about-us.html">About</a> ·
    <a href="/accessibility.html">Accessibility &amp; WCAG 2.1 AA Commitment</a>
  </p>
  <p class="tiny center" style="opacity:0;position:absolute;pointer-events:none;" aria-hidden="true">Soli Deo Gloria — Every pixel and part of this project is offered as worship to God, in gratitude for the beautiful things He has created for us to enjoy. ✝️</p>
</footer>
```

---

## 6. Required JavaScript

### 6.1 Dropdown Navigation Script
```javascript
(function(){
  var dropdowns = document.querySelectorAll('.nav-dropdown');
  function toggleDropdown(dropdown) {
    var wasOpen = dropdown.classList.contains('open');
    closeAllDropdowns();
    if (!wasOpen) {
      dropdown.classList.add('open');
      var btn = dropdown.querySelector('button');
      if (btn) btn.setAttribute('aria-expanded', 'true');
    }
  }
  function closeAllDropdowns() {
    dropdowns.forEach(function(dd) {
      dd.classList.remove('open');
      var btn = dd.querySelector('button');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    });
  }
  dropdowns.forEach(function(dropdown) {
    var btn = dropdown.querySelector('button');
    if (btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        toggleDropdown(dropdown);
      });
      btn.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') { closeAllDropdowns(); btn.focus(); }
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          dropdown.classList.add('open');
          btn.setAttribute('aria-expanded', 'true');
          var firstLink = dropdown.querySelector('.dropdown-menu a');
          if (firstLink) firstLink.focus();
        }
      });
    }
    var menu = dropdown.querySelector('.dropdown-menu');
    if (menu) {
      menu.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') { closeAllDropdowns(); if (btn) btn.focus(); }
      });
    }
  });
  document.addEventListener('click', function(e) {
    var isInsideDropdown = false;
    dropdowns.forEach(function(dd) { if (dd.contains(e.target)) isInsideDropdown = true; });
    if (!isInsideDropdown) closeAllDropdowns();
  });
})();
```

### 6.2 Recent Articles Rail Script
```javascript
(async function recentRail(){
  const rail = document.getElementById('recent-rail');
  if(!rail) return;

  const fallback = document.getElementById('recent-rail-fallback');
  if(fallback) fallback.style.display = '';

  try {
    const response = await fetch('/assets/data/articles/index.json');
    const data = await response.json();
    const items = Array.isArray(data) ? data : (data.articles || []);

    if (items.length > 0) {
      rail.innerHTML = items.slice(0, 5).map(article => `
        <div style="margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid #e0e8f0;">
          <h4 style="margin: 0 0 0.25rem; font-size: 0.95rem;">
            <a href="${article.url || article.path}">${article.title || article.name}</a>
          </h4>
          <p style="margin: 0; font-size: 0.8rem; color: #666;">${article.excerpt || article.description || ''}</p>
        </div>
      `).join('');
      if(fallback) fallback.style.display = 'none';
    }
  } catch (err) {
    console.log('Could not load articles:', err);
    if(fallback) fallback.textContent = 'Unable to load articles';
  }
})();
```

---

## 7. Image Requirements

### 7.1 Directory Structure
```
/ports/img/[port-slug]/
├── [port-slug]-fom-1.jpeg    # Primary images (optimized)
├── [port-slug]-fom-2.jpeg
├── [port-slug]-fom-3.jpeg
├── ...
└── [additional-images].jpg
```

### 7.2 Image Specifications
| Type | Width | Height | Format | Max Size |
|------|-------|--------|--------|----------|
| Hero | 800px | auto | JPEG | 150KB |
| Inline | 800px | auto | JPEG | 100KB |
| Gallery | 800px | auto | JPEG | 100KB |

### 7.3 Naming Convention
- Lowercase, hyphenated: `port-slug-fom-1.jpeg`
- No spaces (use hyphens)
- Sequential numbering for series
- Descriptive names for unique images: `cruise-ships-harbor.jpg`

---

## 8. Content Writing Guidelines

### 8.1 Voice and Tone
- **First-person singular:** "I", "my", "me"
- **Conversational:** Write like you're telling a friend
- **Enthusiastic but honest:** Share both magic and quirks
- **Specific:** Names of places, prices, times
- **Sensory:** Include sights, sounds, tastes, feelings

### 8.2 AI Summary Format
```
First-person logbook guide to [Port] with tips for [Top Attraction 1], [Top Attraction 2], [Local Food/Experience], and [Unique Feature].
```
- Maximum 250 characters
- Lead with "First-person logbook guide"
- Include 3-4 specific highlights

### 8.3 Quick Answer Format
```
[Port Name] is a [one-word vibe] port with [Attraction 1], [Attraction 2], [Food Specialty], [Shopping/Activity], and [Unique Experience].
```

### 8.4 Poignant Highlight Format
```
Standing [specific location] at [specific time] while [specific sensory detail] – I [emotional reaction] realizing [universal truth or insight].
```

---

## 9. Accessibility Requirements (WCAG 2.1 AA)

### 9.1 Required Elements
- [ ] Skip link to main content
- [ ] ARIA live regions for dynamic content
- [ ] Breadcrumb with `aria-current="page"`
- [ ] All images have descriptive `alt` text
- [ ] Form inputs have labels (if any)
- [ ] Focus visible on interactive elements
- [ ] Color contrast minimum 4.5:1

### 9.2 Semantic Structure
- [ ] Single `<h1>` (page title)
- [ ] Proper heading hierarchy (h1 → h2 → h3)
- [ ] `<main>` element with `role="main"`
- [ ] `<nav>` elements with `aria-label`
- [ ] `<footer>` with `role="contentinfo"`

---

## 10. Grid Layout Reference

```
┌─────────────────────────────────────────────────────┐
│ Row 1: Breadcrumb (grid-column: 1 / -1)             │
├───────────────────────────┬─────────────────────────┤
│ Row 2: Main Article       │ Row 2: At a Glance      │
│ (grid-column: 1)          │ (grid-column: 2)        │
│ (grid-row: 2 / span 10)   │ (grid-row: 2)           │
│                           ├─────────────────────────┤
│                           │ Row 3+: Author Card     │
│                           │ + Recent Articles       │
│                           │ (grid-row: 3 / span 8)  │
│                           │                         │
│                           │                         │
└───────────────────────────┴─────────────────────────┘
```

---

## 11. File Checklist

When creating a new port page:

- [ ] Create `/ports/[port-slug].html`
- [ ] Create `/ports/img/[port-slug]/` directory
- [ ] Add 6-8 optimized images to directory
- [ ] Verify Soli Deo Gloria invocation (line 1-3)
- [ ] Add ICP-Lite meta tags
- [ ] Add Schema.org BreadcrumbList
- [ ] Complete all content sections
- [ ] Add author card with correct author
- [ ] Test dropdown navigation
- [ ] Test recent articles rail loads
- [ ] Verify all images load
- [ ] Check mobile responsiveness
- [ ] Validate accessibility

---

## 12. Version History

| Version | Date | Changes |
|---------|------|---------|
| 3.010.500 | 2025-11-29 | Initial comprehensive port page standard |

---

**Soli Deo Gloria** ✝️
