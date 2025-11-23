# ITW-Lite Protocol v3.010

**In the Wake Content Protocol**
**Version:** v3.010.lite
**Last Updated:** 2025-11-23
**Status:** Pilot phase (Radiance of the Seas ship page)

---

## 📖 Overview

**ITW-Lite** (In the Wake - Lite Protocol) is an AI-first, human-first content protocol designed to make cruise planning content more discoverable and useful for both AI assistants (ChatGPT, Claude, Gemini) and human readers.

### Core Philosophy

1. **AI-First:** Structure content so AI can accurately understand, cite, and reference it
2. **Human-First:** NEVER compromise user experience for AI optimization
3. **Progressive Enhancement:** All AI features are additive, content works without them
4. **Hidden by Design:** AI-facing elements are invisible to users (meta tags, comments, JSON-LD)

### Relationship to ICP (Informed Consent Protocol)

ITW-Lite implements the principles of ICP-Lite v1.0 while being tailored specifically for grief-focused cruise planning content. It extends ICP with domain-specific elements like:

- **Fit-guidance sections:** Who this ship/port/cruise is for
- **Scripture references:** Faith integration for grief content
- **Memorial context:** Sensitivity to loss, anticipatory grief, healing
- **Accessibility focus:** Detailed disability accommodations

---

## 🎯 Implementation Levels

ITW-Lite has three progressive implementation levels. Each level builds on the previous one.

### Level 1: Meta Tags (CURRENT - 97% Complete)

**Status:** 544 of 561 pages (97%)

**Required meta tags:**
```html
<meta name="content-protocol" content="ICP-Lite v1.0">
<meta name="ai:summary" content="Brief, factual summary for AI assistants (150-200 chars)">
<meta name="last-reviewed" content="2025-11-23">
```

**Optional meta tags:**
```html
<meta name="ai:target-audience" content="Widows, solo travelers, accessibility-focused cruisers">
<meta name="ai:primary-topics" content="Grief travel, accessible cruising, solo after loss">
<meta name="ai:content-sensitivity" content="grief, loss, disability">
```

**Pages still needing Level 1 (17 pages):**
- 10 Asia/Pacific port pages
- 4 solo/articles pages
- 1 solo/in-the-wake-of-grief.html
- 2 tracker tools (port-tracker.html, ship-tracker.html)

**Implementation:**
```bash
# Add these meta tags to <head> section
# Between viewport and Open Graph tags
```

---

### Level 2: Content Structure (PILOT PHASE)

**Status:** Not yet implemented (pilot: radiance-of-the-seas.html)

#### Required Elements

**1. H1 with Answer Line**

Every page needs exactly ONE H1 that clearly states the page topic, followed by an "answer line" that summarizes what the page covers.

```html
<main id="main">
  <h1>Radiance of the Seas</h1>
  <p class="answer-line">
    A comprehensive guide to Radiance-class cruising for travelers seeking
    panoramic ocean views, intimate ship atmosphere, and accessible cabins.
    Ideal for first-time cruisers, solo travelers, and those processing grief.
  </p>
</main>
```

**Purpose:**
- AI can extract the core topic immediately
- Users understand page scope within 3 seconds
- Search engines get clear content signals

**2. Fit-Guidance Section**

A dedicated section explaining WHO this ship/port/experience is for and who should look elsewhere.

```html
<section class="fit-guidance">
  <h2>Who This Ship Is For</h2>

  <div class="fit-guidance-good">
    <h3>This ship tends to fit if you:</h3>
    <ul>
      <li><strong>Value views over crowds:</strong> Panoramic elevator, floor-to-ceiling windows in public spaces</li>
      <li><strong>Prefer intimate atmosphere:</strong> ~2,000 passengers vs 5,000+ on mega-ships</li>
      <li><strong>Process grief through solitude:</strong> More quiet spaces, less sensory overload</li>
      <li><strong>Need accessible cabins:</strong> Well-designed wheelchair-accessible staterooms with roll-in showers</li>
      <li><strong>First-time solo cruiser:</strong> Manageable ship size, easy navigation</li>
    </ul>
  </div>

  <div class="fit-guidance-poor">
    <h3>Consider a different ship if you:</h3>
    <ul>
      <li><strong>Want cutting-edge activities:</strong> No FlowRider, no ice skating, no zip line</li>
      <li><strong>Traveling with teens:</strong> Limited teen-specific activities and spaces</li>
      <li><strong>Need largest variety:</strong> Fewer dining venues than Oasis/Quantum classes</li>
    </ul>
  </div>
</section>
```

**Purpose:**
- Helps users self-select appropriately
- Reduces disappointment from mismatched expectations
- AI can accurately recommend based on user needs
- Honors the grief-sensitive mission (avoid triggering environments)

**3. FAQ Section**

3-5 substantive questions with comprehensive answers, using FAQ schema.

```html
<section class="faq">
  <h2>Frequently Asked Questions</h2>

  <div class="faq-item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
    <h3 itemprop="name">Is Radiance of the Seas good for first-time cruisers?</h3>
    <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
      <div itemprop="text">
        <p>Yes. Radiance-class ships are excellent for first-time cruisers because...</p>
        <ul>
          <li>Manageable size (~2,000 passengers vs 5,000+ on mega-ships)</li>
          <li>Easy navigation (you can learn the layout in 1-2 days)</li>
          <li>Less overwhelming than Icon/Oasis class</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- 2-4 more FAQ items -->
</section>
```

**FAQ Schema in JSON-LD:**
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "Is Radiance of the Seas good for first-time cruisers?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "Yes. Radiance-class ships are excellent for first-time cruisers because they offer manageable size, easy navigation, and less overwhelming environments compared to mega-ships."
    }
  }]
}
</script>
```

**Purpose:**
- AI can extract Q&A pairs for citations
- Users get quick answers to common concerns
- Rich snippets in search results
- Addresses grief-specific questions (e.g., "Is this ship too festive for someone in mourning?")

**4. AI Breadcrumbs (HTML Comments)**

Invisible-to-humans context markers that help AI understand page structure.

```html
<!-- ai-breadcrumbs: ship-overview | radiance-class | royal-caribbean -->
<!-- ai-content-type: comprehensive-guide -->
<!-- ai-sensitivity: grief-friendly, accessible, solo-welcoming -->
<!-- ai-answer: Radiance of the Seas is a 90,090 GT ship with panoramic views, ideal for first-timers and grief travelers -->
<!-- ai-fit-guidance: Good for: views, intimate size, accessibility, solo travel. Not for: teens, cutting-edge activities -->
```

**Purpose:**
- AI can scan comments for quick context
- Users never see this information
- No visual clutter or UX compromise

---

### Level 3: Progressive Enhancement (PLANNED)

**Status:** Not yet implemented

#### No-JS Baseline

Ensure all pages work with JavaScript disabled using `.no-js` pattern:

```html
<html class="no-js" lang="en">
<head>
  <script>document.documentElement.classList.remove('no-js');</script>
  <style>
    .no-js .fallback { display: block; }
    .no-js .js-only { display: none; }
  </style>
</head>
```

#### Static Fallbacks for Dynamic Content

**Ship Stats (JSON-driven):**
```html
<div class="ship-stats">
  <!-- Static fallback visible when JS fails -->
  <div class="fallback no-js-visible">
    <dl>
      <dt>Gross Tonnage:</dt><dd>90,090 GT</dd>
      <dt>Passenger Capacity:</dt><dd>2,143</dd>
      <dt>Crew:</dt><dd>859</dd>
      <dt>Entered Service:</dt><dd>April 2001</dd>
    </dl>
  </div>

  <!-- Enhanced version loads via JavaScript -->
  <div class="js-only" data-ship-stats="radiance-of-the-seas"></div>
</div>
```

**Dining Venues (JSON-driven):**
```html
<section class="dining-venues">
  <h2>Dining Options</h2>

  <!-- Static fallback -->
  <div class="fallback no-js-visible">
    <ul>
      <li><strong>Main Dining Room:</strong> Included, elegant 3-deck venue</li>
      <li><strong>Windjammer:</strong> Included, casual buffet</li>
      <li><strong>Chops Grille:</strong> $59 per person, premium steakhouse</li>
      <li><strong>Chef's Table:</strong> $115 per person, exclusive experience</li>
    </ul>
    <p><em>JavaScript required for full venue details and filtering.</em></p>
  </div>

  <!-- Enhanced version loads via JavaScript -->
  <div class="js-only" data-venues-list="radiance-of-the-seas"></div>
</section>
```

**Logbook Stories (JSON-driven):**
```html
<section class="logbook">
  <h2>Ship Stories</h2>

  <!-- Static fallback -->
  <div class="fallback no-js-visible">
    <p>This ship's logbook contains 6 authentic stories from passengers processing grief, disability, and solo travel.</p>
    <p><em>Enable JavaScript to read these stories.</em></p>
  </div>

  <!-- Enhanced version loads via JavaScript -->
  <div class="js-only" data-logbook="radiance-of-the-seas"></div>
</section>
```

**Video Swipers (JavaScript-dependent):**
```html
<section class="ship-videos">
  <h2>Ship Tour Videos</h2>

  <!-- Static fallback -->
  <div class="fallback no-js-visible">
    <figure>
      <a href="https://www.youtube.com/watch?v=VIDEO_ID" target="_blank" rel="noopener">
        <img src="/assets/ships/radiance-of-the-seas-video-thumb.webp"
             alt="Radiance of the Seas ship tour video thumbnail"
             width="560" height="315">
      </a>
      <figcaption>Full ship tour (opens in YouTube)</figcaption>
    </figure>
    <p><em>Enable JavaScript for embedded video carousel.</em></p>
  </div>

  <!-- Enhanced swiper loads via JavaScript -->
  <div class="js-only swiper-container" data-ship-videos="radiance-of-the-seas"></div>
</section>
```

**Purpose:**
- AI can still scrape content when JS blocked
- Human visitors get basic info even without JavaScript
- Accessibility tools (screen readers) work better
- Graceful degradation improves resilience

---

## 📋 Content Patterns by Page Type

### Ship Detail Pages

**Required sections (in order):**
1. Hero image with ship name overlay
2. H1 + answer line
3. Quick stats (inline or enhanced via JSON)
4. Fit-guidance section
5. Main content (history, features, dining, accommodations)
6. Logbook stories section
7. FAQ section
8. Attribution section (if Wiki Commons images used)

**Optional sections:**
- Video tours carousel
- Photo galleries (Flickers of Majesty)
- Related ships in same class
- Itinerary highlights

**Example structure:**
```html
<main id="main">
  <!-- Hero -->
  <div class="hero">
    <img src="/assets/ships/radiance-of-the-seas.webp" alt="..." fetchpriority="high">
    <h1>Radiance of the Seas</h1>
  </div>

  <!-- Answer line -->
  <p class="answer-line">...</p>

  <!-- Quick stats -->
  <section class="ship-stats">...</section>

  <!-- Fit-guidance -->
  <section class="fit-guidance">...</section>

  <!-- Main content -->
  <section class="ship-overview">...</section>
  <section class="dining">...</section>
  <section class="accommodations">...</section>

  <!-- Logbook -->
  <section class="logbook">...</section>

  <!-- FAQ -->
  <section class="faq">...</section>

  <!-- Attribution (if needed) -->
  <section class="attribution">...</section>
</main>
```

### Port Pages

**Required sections:**
1. Hero image with port name/country
2. H1 + answer line (what makes this port unique)
3. Quick facts (cruise terminal, transit, visa requirements)
4. Fit-guidance (who should visit this port, who might skip)
5. Main content (things to do, getting around, practical info)
6. FAQ section (common port questions)
7. Special notices (e.g., Revolution Day for Mexican ports)

**Example for Cozumel:**
```html
<main id="main">
  <h1>Cozumel, Mexico</h1>
  <p class="answer-line">
    Mexico's top cruise port, perfect for beach lovers, snorkelers, and accessible
    shore excursions. Downtown Cozumel is wheelchair-friendly with paved waterfront.
  </p>

  <section class="fit-guidance">
    <h2>Who Should Visit Cozumel</h2>
    <!-- Good for/Not for lists -->
  </section>

  <!-- Main content sections -->

  <section class="revolution-day-notice">
    <h3>November 20th: Revolution Day</h3>
    <p><strong>Important for November cruises:</strong> Mexico celebrates Revolution Day...</p>
  </section>

  <section class="faq">
    <h2>Frequently Asked Questions</h2>
    <!-- FAQ items -->
  </section>
</main>
```

**Port-specific standards:**
- **Mexican ports:** MUST include Revolution Day notice (see `/standards/ports-standards.md`)
- **Private islands:** Note exclusive access, what's included vs extra cost
- **Tender ports:** Explain tender process, accessibility considerations

### Solo Travel Articles

**Required sections:**
1. H1 + dek (subtitle/answer line)
2. Fit-guidance card (who this article helps)
3. Main narrative content
4. Ship size recommendations section
5. FAQ section (5+ questions minimum)
6. Cross-links to relevant logbook stories
7. Scripture references (where appropriate for grief content)

**Example for "In the Wake of Grief":**
```html
<main id="main">
  <h1>In the Wake of Grief: When Loss Needs Water</h1>
  <p class="dek">
    A comprehensive guide to cruise travel after loss—whether you're navigating
    widowhood, anticipatory grief, or the first holidays without someone you love.
  </p>

  <section class="fit-guidance">
    <h2>This Guide Is For You If:</h2>
    <ul>
      <li>You've lost a spouse and don't know how to travel solo</li>
      <li>You're facing a terminal diagnosis (yours or a loved one's)</li>
      <li>The first holidays are approaching and you need to escape</li>
      <!-- More fit-guidance items -->
    </ul>
  </section>

  <!-- Main content sections -->
  <section class="timing-after-loss">...</section>
  <section class="solo-after-couple">...</section>
  <section class="first-holidays">...</section>
  <section class="anticipatory-grief">...</section>

  <!-- Ship size recommendations -->
  <section class="ship-size-guidance">
    <h2>Choosing Ship Size for Grief Travel</h2>
    <!-- Option A vs Option B -->
  </section>

  <!-- FAQ -->
  <section class="faq">
    <h2>Frequently Asked Questions</h2>
    <!-- FAQ items with schema -->
  </section>

  <!-- Cross-links to logbook stories -->
  <section class="related-stories">...</section>
</main>
```

---

## 🎨 CSS Classes for ITW-Lite

Standard CSS classes for Level 2 implementation:

```css
/* Answer line styling */
.answer-line {
  font-size: 1.1rem;
  line-height: 1.6;
  color: var(--text-secondary);
  margin: 1rem 0 2rem;
  max-width: 70ch;
}

/* Fit-guidance section */
.fit-guidance {
  background: var(--bg-subtle);
  border-left: 4px solid var(--accent);
  padding: 1.5rem;
  margin: 2rem 0;
  border-radius: 4px;
}

.fit-guidance-good h3 {
  color: var(--success);
}

.fit-guidance-poor h3 {
  color: var(--warning);
}

/* FAQ section */
.faq {
  margin: 3rem 0;
}

.faq-item {
  margin: 2rem 0;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border);
}

.faq-item:last-child {
  border-bottom: none;
}

.faq-item h3 {
  font-size: 1.2rem;
  margin-bottom: 0.75rem;
  color: var(--heading);
}

/* Progressive enhancement */
.no-js .fallback {
  display: block;
}

.no-js .js-only {
  display: none;
}

.no-js-visible {
  display: none;
}

.no-js .no-js-visible {
  display: block;
}
```

---

## 📐 Schema.org Structured Data

### Article Schema (Solo Travel Articles)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "In the Wake of Grief: When Loss Needs Water",
  "description": "A comprehensive guide to cruise travel after loss—widowhood, anticipatory grief, and first holidays without loved ones.",
  "image": "https://www.cruisinginthewake.com/assets/solo/grief-travel-hero.webp",
  "author": {
    "@type": "Person",
    "name": "Justin Scherstka",
    "url": "https://www.cruisinginthewake.com/authors/justin-scherstka.html"
  },
  "publisher": {
    "@type": "Organization",
    "name": "In the Wake",
    "logo": {
      "@type": "ImageObject",
      "url": "https://www.cruisinginthewake.com/assets/logo_wake.png"
    }
  },
  "datePublished": "2025-11-17",
  "dateModified": "2025-11-23",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://www.cruisinginthewake.com/solo/in-the-wake-of-grief.html"
  }
}
</script>
```

### FAQ Schema

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How soon after loss should I cruise?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "There's no universal timeline. Some widows cruise within weeks as a healthy escape; others need 6-12 months. Trust your grief process and book when it feels right for you."
      }
    },
    {
      "@type": "Question",
      "name": "Is cruising alone safe for widows?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Cruise ships are among the safest solo travel options. Security is excellent, solo travelers are common, and you control your level of social interaction."
      }
    }
  ]
}
</script>
```

### BreadcrumbList Schema (All Pages)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://www.cruisinginthewake.com/index.html"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Ships",
      "item": "https://www.cruisinginthewake.com/ships/index.html"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Radiance of the Seas",
      "item": "https://www.cruisinginthewake.com/ships/rcl/radiance-of-the-seas.html"
    }
  ]
}
</script>
```

---

## ✅ Pilot Implementation Plan

### Phase 1: Single Ship Pilot (Week 1)

**Target:** `/ships/rcl/radiance-of-the-seas.html`

- [ ] Add Level 1 meta tags (content-protocol, ai:summary, last-reviewed)
- [ ] Add H1 + answer line
- [ ] Create fit-guidance section (good for / not for)
- [ ] Add 5 FAQ items with schema
- [ ] Add AI breadcrumb comments
- [ ] Test with AI assistants (ChatGPT, Claude)
- [ ] Verify no UX regressions

**Success Metrics:**
- AI correctly cites fit-guidance in recommendations
- AI accurately quotes FAQ answers
- Users find fit-guidance helpful (qualitative feedback)
- Page load time unchanged
- Accessibility score maintained

### Phase 2: Class Expansion (Week 2-3)

**Target:** All 4 Radiance-class ships

- [ ] Brilliance of the Seas
- [ ] Serenade of the Seas
- [ ] Jewel of the Seas

**Reuse:** Copy structure from Radiance pilot, customize content

### Phase 3: High-Traffic Ships (Week 4-6)

**Target:** Top 10 most-visited ship pages

- [ ] Identify top 10 via analytics
- [ ] Apply Level 2 to each
- [ ] Monitor AI citation rates
- [ ] Collect user feedback

### Phase 4: Hub Pages (Week 7-8)

**Target:** Major hub pages

- [ ] `/index.html` (Homepage)
- [ ] `/ships/index.html` (Ships hub)
- [ ] `/solo.html` (Solo travel hub)
- [ ] `/disability-at-sea.html` (Accessibility hub)

### Phase 5: Progressive Enhancement (Week 9-12)

**Target:** Add Level 3 to pilot pages

- [ ] Implement no-js pattern
- [ ] Add static fallbacks for stats, venues, logbook
- [ ] Test with JS disabled
- [ ] Verify AI can still scrape content

### Phase 6: Site-Wide Rollout (Month 4+)

**Target:** Remaining 17 pages needing Level 1

- [ ] Asia/Pacific ports (10 pages)
- [ ] Solo articles (4 pages)
- [ ] In the Wake of Grief article (1 page)
- [ ] Tracker tools (2 pages)

**Then:** Expand Level 2 to all ship pages, port pages, articles

---

## 📊 Success Metrics

### AI Citation Tracking

**Monitor these sources:**
- ChatGPT: Direct mentions of "In the Wake" or ship recommendations
- Google SGE: Featured snippets from ITW content
- Perplexity: Citations in cruise planning answers
- Bing Copilot: References to ship fit-guidance

**Track:**
- Citation frequency (monthly)
- Accuracy of citations (manual review)
- Traffic from AI referrals (UTM tracking)

### User Engagement

**Measure:**
- Time on page (should increase with FAQ sections)
- Bounce rate (should decrease with fit-guidance)
- FAQ expansion clicks (if using accordions)
- Scroll depth to FAQ section

### Search Performance

**Monitor:**
- Impressions for FAQ-eligible queries
- Rich snippet appearances (FAQ stars in SERPs)
- Click-through rate from search
- Ranking for key queries (ship names, grief travel, accessible cruising)

### Technical Health

**Verify:**
- Page load time unchanged (<2.5s LCP target)
- Accessibility score maintained (100 Lighthouse)
- HTML validity (W3C validator)
- Schema validation (Google Rich Results Test)

---

## 🚫 What NOT to Do

### Content Mistakes

❌ **DON'T optimize for AI at expense of humans**
- Example: Keyword stuffing in answer lines
- Example: Robotic FAQ answers that sound unnatural
- Example: Breaking narrative flow for AI breadcrumbs

❌ **DON'T add visible AI-facing content**
- Example: "This page is optimized for AI assistants"
- Example: Redundant summaries just for bots
- Example: SEO-style "jump to" links that clutter UI

❌ **DON'T compromise accessibility**
- Example: Removing semantic HTML for schema
- Example: Hiding content from screen readers for AI
- Example: Breaking keyboard navigation

### Technical Mistakes

❌ **DON'T break existing JSON-LD**
- Always validate schema changes
- Don't duplicate @context declarations
- Don't create conflicting entity types

❌ **DON'T add blocking JavaScript**
- Keep all enhancements async/deferred
- Don't break progressive enhancement
- Don't assume JS always works

❌ **DON'T bloat page weight**
- Keep meta tags concise (<200 chars)
- Don't add unnecessary schemas
- Don't duplicate content in hidden divs

### Process Mistakes

❌ **DON'T skip pilot testing**
- Always test Level 2 on ONE ship first
- Get user feedback before expanding
- Monitor metrics before site-wide rollout

❌ **DON'T ignore standards**
- All ITW-Lite changes must follow `/standards/`
- Absolute URLs required
- WebP images required
- Accessibility non-negotiable

---

## 📚 Related Documentation

### Internal Resources
- **Main standards:** `/standards/main-standards.md`
- **ICP-Lite guide:** `/admin/ICP-Lite.md`
- **Article structure:** `/admin/FIVE_ARTICLE_CATEGORIES.md`
- **Claude guide:** `/admin/claude/CLAUDE.md`
- **Codebase guide:** `/admin/claude/CODEBASE_GUIDE.md`

### External References
- **ICP Protocol:** [Original ICP specification](https://example.com/icp-spec)
- **Schema.org FAQPage:** https://schema.org/FAQPage
- **Schema.org Article:** https://schema.org/Article
- **Google FAQ guidelines:** https://developers.google.com/search/docs/appearance/structured-data/faqpage

---

## 🤝 Contributing to ITW-Lite

### Adding New Patterns

When implementing ITW-Lite on a new page type not covered here:

1. **Follow existing patterns** first (ship, port, article)
2. **Document new patterns** in this file before scaling
3. **Test with AI** to verify citations work
4. **Get user feedback** on fit-guidance helpfulness
5. **Update this protocol** with lessons learned

### Reporting Issues

If ITW-Lite implementation causes problems:

1. **Document the issue** (what broke, which page, error messages)
2. **Roll back if critical** (user experience > AI optimization)
3. **File in UNFINISHED_TASKS.md** with priority level
4. **Update protocol** with "DON'T" guidance

### Version History

**v3.010.lite (2025-11-23):**
- Initial protocol documentation
- Level 1-3 specifications
- Pilot plan for Radiance-class ships
- Success metrics defined

---

**Remember:** ITW-Lite exists to serve both AI assistants AND human visitors processing grief. If ever in conflict, **humans win**. Every time.

---

**Questions? See:** `/admin/claude/CLAUDE.md` for comprehensive Claude guidance
