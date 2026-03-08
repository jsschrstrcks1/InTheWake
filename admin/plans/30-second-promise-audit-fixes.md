# 30-Second Promise Audit — Fix Plan for 7 PARTIAL Pages

**Created:** 2026-03-08
**Audit Memory:** 795ebae2 (scope: /inthewake/audits)
**Model Page:** cruise-lines.html (PASS — clear H1, answer-line, fit-guidance with Best For, key-facts, quiz CTA)

---

## Design Pattern (from cruise-lines.html + planning.html)

Every page needs these ICP elements **above the fold in the main content column**:

```html
<!-- 1. H1 — what this page is -->
<h1 id="page-title">Page Title</h1>

<!-- 2. Answer-line — one-sentence summary for AI + humans -->
<p class="answer-line"><strong>Quick Answer:</strong> [Factual summary]</p>

<!-- 3. Fit-guidance — who this is for + how to use it -->
<div class="fit-guidance">
  <h2>How to Use This [Page Type]</h2>
  <p>[Usage guidance with contextual links]</p>
</div>

<!-- 4. Key-facts — Best For + scope at a glance -->
<div class="key-facts">
  <h2>Key Facts at a Glance</h2>
  <ul>
    <li><strong>Best For:</strong> [Persona-specific language]</li>
    <li><strong>Content Included:</strong> [What's on this page]</li>
    ...
  </ul>
</div>

<!-- 5. CTA callout — decision path / next action -->
<section class="callout-box" style="...">
  <h2>[Question that invites action]</h2>
  <p>[Brief pitch]</p>
  <a href="..." class="cta-btn" style="...">Action Label →</a>
</section>
```

---

## Page-by-Page Fixes

### 1. articles.html — PARTIAL → PASS

**Current state:** Has answer-line and fit-guidance in main column (good), but NO `<h1>`. FAQ is boilerplate.

**Fixes:**
- [ ] **Add `<h1>`** — Insert `<h1 id="page-title">Articles & Guides</h1>` above the existing answer-line (around line 291)
- [ ] **Improve fit-guidance** — Current text is generic ("Cruisers looking to learn from others' experiences"). Rewrite: "Whether you're researching your first voyage, looking for packing strategies, or reading real stories from the water — these guides are written from experience, not press releases."
- [ ] **Replace boilerplate FAQ** — Swap generic FAQ (line 332) with page-specific questions: "How often are new articles published?", "Are these from real cruise experiences?", "Can I suggest an article topic?"
- [ ] **Add CTA callout** — "New to Cruising?" callout pointing to `/first-cruise.html`

**Estimated lines changed:** ~30
**Risk:** Low — single-column page, no sidebar conflicts

---

### 2. ports.html — PARTIAL → PASS

**Current state:** ICP elements exist but buried in sidebar at line 1483. Main column H1 area (line 319) has description but no ICP structure. Strong pill-nav + search already present.

**Fixes:**
- [ ] **Add ICP block to main column** — Insert answer-line, fit-guidance, and key-facts between H1 (line 319) and the Quick Links pills (line 327). Keep sidebar ICP as-is (duplicate is fine for ICP — sidebar serves AI crawlers, main column serves humans).
- [ ] **Answer-line content:** "Quick Answer: Browse 387 cruise port guides with pier-side tips, transport options, weather data, and seasonal insights across all seven continents."
- [ ] **Fit-guidance content:** "Whether you're scouting your first port of call or comparing shore excursion options across an itinerary, each guide covers what to expect pier-side — transport, walkability, local highlights, and what's near the dock."
- [ ] **Key-facts with Best For:** "Best For: Cruisers researching ports on their itinerary, comparing destinations, or looking for pier-side logistics and local tips."
- [ ] **Fix H1 scope** — Consider changing "Royal Caribbean Destination Ports" to "Cruise Port Guides" since the site covers 15 cruise lines. (Flag to user: H1 may be intentionally RC-focused — confirm before changing.)

**Estimated lines changed:** ~25 inserted
**Risk:** Low — inserting above existing content, no deletions

---

### 3. ships.html — PARTIAL → PASS

**Current state:** ICP elements fully present in sidebar (line 1146-1170) but invisible in main column. Ship Quiz callout is well-placed. H1 scopes to RC only.

**Fixes:**
- [ ] **Add ICP block to main column** — Insert answer-line, fit-guidance, and key-facts below the H1 and intro paragraph (after line ~793), above the Ship Quiz callout (line 795).
- [ ] **Answer-line content:** "Quick Answer: Explore 295 ship profiles organized by class — from Icon-class mega-ships to intimate Vision-class vessels — with deck plans, dining venues, accessibility notes, and real-voyage insights."
- [ ] **Fit-guidance content:** "Whether you're comparing ships for your first booking, researching a specific vessel, or exploring what's new across the fleet — each profile covers what it's actually like onboard, not just the marketing brochure."
- [ ] **Key-facts with Best For:** "Best For: Cruisers comparing ships, researching a specific vessel, or deciding between ship classes."
- [ ] **Fix H1 scope** — Same consideration as ports.html: "Royal Caribbean Fleet — Organized by Class" may need broadening. (Flag to user.)

**Estimated lines changed:** ~25 inserted
**Risk:** Low — inserting above existing content

---

### 4. restaurants.html — PARTIAL → PASS

**Current state:** Complete absence of ALL ICP elements. No sidebar. Strong FAQ exists. Has venue search.

**Fixes:**
- [ ] **Add full ICP block** — Insert between H1 (line 351) and "How to Use This Guide" (line 355):
  - answer-line: "Quick Answer: Browse 472 cruise ship dining venues across five major cruise lines — with menus, pricing, dress codes, and honest assessments from real voyages."
  - fit-guidance: "Whether you're deciding if a specialty restaurant is worth the upcharge, figuring out what's included with your fare, or planning where to eat on embarkation night — each venue guide tells you what we actually experienced, not what the brochure promises."
  - key-facts: "Best For: Cruisers researching dining options, comparing restaurant menus, or deciding which specialty venues to book."
- [ ] **Add CTA callout** — "Not sure what to expect at dinner?" pointing to a dining overview or first-cruise guide dining section
- [ ] **Add `<noscript>` fallback** — For the JS-dependent venue grid, add a noscript message with direct links to the top 10 most-viewed venues

**Estimated lines changed:** ~35 inserted
**Risk:** Low — inserting above existing content, adding noscript

---

### 5. solo.html — PARTIAL → PASS

**Current state:** Answer-line in sidebar only. No fit-guidance/Best For anywhere. Key-facts are generic boilerplate ("Topic: Solo Travel"). Intro is 4 paragraphs of poetry before actionable content.

**Fixes:**
- [ ] **Add answer-line to main column** — Insert after H1 (line 477): "Quick Answer: Honest guidance for solo cruisers — from choosing the right ship and cabin to navigating onboard life without a travel partner. Written by people who've done it."
- [ ] **Add fit-guidance to main column** — "Whether you're cruising solo for the first time and feeling nervous, traveling after loss or a life change, or simply prefer your own company on the water — this page connects you to practical guides and real stories from solo sailors who understand."
- [ ] **Add key-facts with Best For** — "Best For: First-time solo cruisers, travelers navigating grief or life transitions, introverts who want community on their own terms."
- [ ] **Trim intro poetry** — Reduce the 4-paragraph intro to 2 paragraphs max. Keep the emotional opening sentence but get to actionable content faster. Move the extended metaphor below the ICP block.
- [ ] **Upgrade sidebar key-facts** — Replace "Topic: Solo Travel / Purpose: Cruise planning resource" with actual stats: number of solo articles, ship recommendations, practical guides available.
- [ ] **Add CTA callout** — "Ready to book your first solo cruise?" with link to the practical solo guide

**Estimated lines changed:** ~40 (insertions + trim)
**Risk:** Medium — touching emotional content. Must preserve the pastoral voice. Do NOT flatten the emotional pivot or remove grief-related language.

---

### 6. travel.html — PARTIAL → PASS

**Current state:** ICP elements in sidebar only (line 831). Title says "Travel Tips", H1 says "Top 20 Questions I'm Asked About Cruising for the First Time." No TOC or jump-nav.

**Fixes:**
- [ ] **Fix title/H1 alignment** — Change `<title>` from "Travel Tips" to match the H1: "Top 20 Cruise Questions Answered — In the Wake | First-Time Cruiser FAQ"
- [ ] **Add ICP block to main column** — Insert after H1 (line 436):
  - answer-line: "Quick Answer: The 20 most common questions first-time cruisers ask — answered honestly from real experience. From 'Is cruising worth it?' to 'What should I pack?'"
  - fit-guidance: "If you've never cruised before and your head is spinning with questions, start here. Each answer is practical, honest, and links to deeper guides when you want more detail."
  - key-facts with Best For: "Best For: First-time cruisers with lots of questions, or anyone sending a friend the 'everything you need to know' link."
- [ ] **Add TOC/jump-nav** — Insert a numbered anchor-link list of all 20 questions between the ICP block and the first Q&A. Use pill-style or ordered-list format. Each question in the article body needs a corresponding `id` anchor.
- [ ] **Add `id` anchors to each question** — Ensure each of the 20 `<h2>` questions has a slugified `id` attribute for jump-link targeting

**Estimated lines changed:** ~50 (ICP block + TOC + 20 id attributes)
**Risk:** Medium — adding anchors to 20 headings requires careful verification. TOC must match actual question text.

---

### 7. disability-at-sea.html — PARTIAL → PASS

**Current state:** Complete absence of ALL ICP elements, no sidebar, no FAQ, no CTA. Thin gateway page — real guide is at `/accessibility.html`.

**Fixes:**
- [ ] **Add full ICP block** — Insert after H1 (line 183):
  - answer-line: "Quick Answer: Practical accessibility information for cruisers with disabilities, chronic conditions, or mobility needs — from boarding logistics to cabin accommodations and shore excursion accessibility."
  - fit-guidance: "Whether you're cruising with a wheelchair, managing a chronic condition, traveling with a family member who needs accommodations, or simply want to know what support is available — this page connects you to the resources that matter."
  - key-facts with Best For: "Best For: Travelers with disabilities planning a cruise, caregivers researching accessibility options, or anyone who needs to know what accommodations are available."
- [ ] **Add prominent CTA** — Immediately after the ICP block, add a callout-box: "Looking for our full accessibility guide?" with a prominent button linking to `/accessibility.html`. This should be the #1 above-fold action.
- [ ] **Add FAQ section** — 3-4 genuine questions: "Is cruising accessible for wheelchair users?", "How do I request disability accommodations?", "What should I know about accessible cabins?"
- [ ] **Add related-reading links** — Link to solo.html (solo travel for disabled travelers), first-cruise.html (planning basics), and relevant ship pages with strong accessibility sections
- [ ] **Update copyright year** — Line 236, change 2025 → 2026

**Estimated lines changed:** ~60 inserted
**Risk:** Medium — pastoral content about disability. Must be warm, practical, and empowering — not clinical or patronizing. Follow PASTORAL_GUARDRAILS.md voice.

---

## Execution Order

**Phase 1 — Low risk, high impact (commit after each):**
1. articles.html — add H1 (quick structural fix)
2. restaurants.html — add full ICP block (worst offender, zero ICP)
3. disability-at-sea.html — add full ICP block + CTA (worst offender, thin gateway)

**Phase 2 — Medium risk, insert ICP into main column:**
4. ports.html — add main-column ICP (keep sidebar)
5. ships.html — add main-column ICP (keep sidebar)

**Phase 3 — Content-sensitive:**
6. solo.html — add ICP + trim intro (pastoral voice — careful)
7. travel.html — fix title + add ICP + build TOC (most lines changed)

**Per-page workflow:**
1. Read the full file (or relevant sections) before editing
2. Write the ICP block
3. Verify heading hierarchy (h1 → h2 → h3)
4. Verify no class name collisions with existing CSS
5. Spot-check rendering expectations
6. Commit with honest message describing what was added and what was left alone
7. Push after each phase

---

## What This Plan Does NOT Touch

- **No CSS changes** — all ICP elements use existing classes (answer-line, fit-guidance, key-facts, callout-box, cta-btn)
- **No JS changes** — noscript fallbacks are HTML only
- **No sidebar deletions** — existing sidebar ICP stays (it serves AI crawlers)
- **No structural layout changes** — no adding/removing grid columns
- **No content rewrites beyond what's specified** — existing prose stays unless explicitly trimmed (solo.html intro only)
- **H1 scope changes (ports/ships)** — flagged for user decision, not assumed

---

## Verification Checklist (per page)

- [ ] H1 exists and accurately describes the page
- [ ] answer-line is in main column, above the fold
- [ ] fit-guidance is in main column with persona language
- [ ] key-facts includes "Best For" with traveler-type language
- [ ] At least one CTA or clear decision path above the fold
- [ ] Heading hierarchy is clean (h1 → h2, no skips)
- [ ] No broken links in new content
- [ ] SDG invocation still present and before line 20
- [ ] ICP-Lite meta tags unchanged
- [ ] Commit message is honest and specific

---

**Soli Deo Gloria** — Every page is someone's first impression. Make the first 30 seconds count.
