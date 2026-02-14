# Nassau Port Page Review Plan

**Date:** 2026-02-14
**Source:** Gemini + ChatGPT external review of `/ports/nassau.html`
**Branch:** `claude/review-docs-and-repo-GnDW5`

---

## Summary

Two AI reviewers (Gemini and ChatGPT) assessed the Nassau port page. The page is ~85% to gold standard. The remaining issues break into three tiers: critical HTML bugs, standards compliance gaps, and strategic enhancements.

---

## Tier 1: Critical HTML Bugs (Must Fix)

### 1A. Mismatched heading tags in map summary
**Line 446:** `<summary><h3>Nassau Area Map</h2></summary>`
- `<h3>` opened, `</h2>` closed — invalid HTML
- Affects DOM parsing, accessibility tree, and structured data extraction
- **Fix:** Change to `<summary><h3>Nassau Area Map</h3></summary>`

### 1B. Broken FAQ section structure
**Lines 574-597:** The FAQ `<details>` block closes at line 586, but additional FAQ questions (lines 588-596) continue OUTSIDE the wrapper. Line 597 has a stray `</section>` with no matching opening tag.
- Also, line 585 has a stray `</div>` without a matching `<div>` inside the FAQ `<details>`.
- **Fix:** Remove the stray `</div>` at line 585, move the orphaned FAQ questions (lines 588-596) inside the `<details>` before its closing tag, and remove the stray `</section>` at line 597.

### 1C. Templated FAQ language
**Lines 588-596:** Questions say "Nassau Port Guide" as if it's a place name:
- "What's the best time of year to visit Nassau Port Guide?"
- "Does Nassau Port Guide have extreme weather to worry about?"
- "What should I pack for Nassau Port Guide's weather?"
- These are clearly auto-generated and read unnaturally.
- **Fix:** Replace "Nassau Port Guide" with "Nassau" in these FAQ entries. Also add these questions to the FAQPage JSON-LD schema for consistency.

### 1D. console.log in production code
**Line 828:** `console.log('Could not load articles:', err);`
- Violates "NEVER leave console.log/console.warn in production code" rule.
- **Fix:** Remove or comment out.

---

## Tier 2: Standards Compliance Gaps (Should Fix)

### 2A. Missing visible footer invocation
The Soli Deo Gloria invocation exists only as an HTML comment (line 1-2). Per project standards, a visible footer line is required: "Soli Deo Gloria — Every pixel and part of this project..."
- **Fix:** Add visible invocation text to the footer.

### 2B. Version badge inconsistency
**Line 128:** `V1.Beta` displayed in the navbar.
- Project standards track versions like v3.010.305.
- **Assessment:** This is a site-wide issue, not Nassau-specific. The navbar version badge appears on every page via the template. Changing it on Nassau alone would create inconsistency across the site.
- **Recommendation:** Flag for site-wide decision. Do NOT change on Nassau alone.

### 2C. Missing `<meta name="author">` tag
No author meta tag present. ChatGPT recommends adding it for E-E-A-T signals.
- **Fix:** Add `<meta name="author" content="Ken Baker">` to `<head>`.

### 2D. No Article schema
Currently uses `@type: "WebPage"`. ChatGPT suggests `@type: "Article"` with author, datePublished, dateModified fields.
- **Assessment:** The port standards specify `@type: "WebPage"` with `mainEntity: Place`, which is correct for a port entity page. Changing to Article could conflict with the existing mainEntity pattern.
- **Recommendation:** Leave as WebPage per port standards. The WebPage + Place mainEntity pattern is architecturally correct for entity pages. An Article schema could be *added* alongside (not replacing) if the user wants, but it's not a bug.

### 2E. og:image uses .jpg format
**Line 18:** `og:image` points to `/assets/social/port-hero.jpg`
- Standards say use WebP for images, but social sharing images are an exception — many platforms don't support WebP for og:image. This is acceptable as-is.
- **Recommendation:** Leave alone. Social meta images in JPG/PNG are industry standard.

### 2F. Overconfidence language in safety FAQ
**Line 576:** "you'll be perfectly fine"
- LLMs and search models may down-weight certainty around safety claims.
- **Fix:** Soften to "generally considered safe" or "you should have no issues."

---

## Tier 3: Strategic Enhancements (Nice to Have — Requires User Decision)

### 3A. Port stats JSON data block
Gemini recommends a `<script type="application/json" id="port-stats-fallback">` block (like ship pages have for ship-stats-fallback) containing coordinates, walking times, currency, pier type, etc.
- **Assessment:** This is a good architectural idea for data-driven tools (Port Day Planner, Logbook). However, port pages currently use `data-*` attributes on the weather widget for coordinates and region. Adding a JSON block would be a new pattern requiring:
  1. Defining a standard JSON schema for port stats
  2. Updating any JS that would consume it
  3. Eventually rolling it out to all 380 port pages
- **Recommendation:** Design the schema, implement on Nassau as a pilot, but don't rush site-wide rollout. Requires user decision on schema shape.

### 3B. Data-driven "From the Pier" component
Gemini recommends generating the "From the Pier" bars from data (JSON) rather than hard-coded HTML with manual `style="width:8%"`.
- **Assessment:** The "From the Pier" component is already deployed to 376 port pages. Converting to a data-driven approach is a significant architectural change. The manual approach works, and the risk of a bulk refactor across 376 pages outweighs the benefit at this time.
- **Recommendation:** Leave alone for now. If a `port-stats-fallback` JSON is adopted (3A), the "From the Pier" data could be included in it for future JS hydration, but this is a Phase 2 effort.

### 3C. `data-pier-type` attribute (dock vs tender)
Gemini suggests adding `data-pier-type="dock"` to differentiate dock ports from tender ports.
- **Assessment:** Good metadata idea. Low-risk, low-effort. Could be added to the "From the Pier" `<nav>` element.
- **Fix:** Add `data-pier-type="dock"` to the `<nav class="from-the-pier">` element.

### 3D. Static map image fallback for offline/print
Gemini notes the Leaflet map fails without JavaScript.
- **Assessment:** There is already a `<noscript>` message ("Enable JavaScript to view the interactive map"). A static map image would be better but requires sourcing/generating static map images for 376 ports — significant infrastructure work.
- **Recommendation:** The current noscript fallback is adequate. Flag for future enhancement.

### 3E. Map markers from shared data source
Gemini recommends map markers should come from the same JSON as "From the Pier" data.
- **Assessment:** The port map already reads from `/assets/data/maps/nassau.map.json` POI manifest. The "From the Pier" component is separate HTML. Merging these data sources is an architectural decision that would affect all 376 port pages.
- **Recommendation:** Flag for future data unification effort. Not a Nassau-only fix.

### 3F. SEO lexical variance in FAQ
ChatGPT notes keyword cannibalization with "Nassau Port Guide" repeated.
- **Assessment:** Already addressed in 1C (the templated questions). The handwritten FAQ questions (lines 574-584) use natural language and are fine.
- **Fix:** Already covered by 1C.

### 3G. Internal anchor clusters for "Nassau Cruise Port"
ChatGPT suggests H2s like "Nassau Cruise Port Terminal Guide", "Nassau Cruise Port Map", etc.
- **Assessment:** The current H2s are natural and content-appropriate ("The Cruise Port", "Getting Around", etc.). Stuffing "Nassau Cruise Port" into multiple H2s would violate the content-strategy guardrail that rejects "keyword-stuffed descriptions" and "unnatural, robotic copy optimized only for search."
- **Recommendation:** Leave alone. Natural H2s are correct per ITW-Lite philosophy.

---

## Implementation Order

**Phase 1 — Critical fixes (this session):**
1. Fix mismatched h3/h2 in map summary (1A)
2. Fix broken FAQ structure (1B)
3. Fix templated FAQ language (1C)
4. Remove console.log (1D)
5. Add `<meta name="author">` (2C)
6. Soften safety language (2F)
7. Add `data-pier-type="dock"` (3C)
8. Add visible footer invocation (2A)

**Phase 2 — Requires user decision (future session):**
- Port stats JSON schema design (3A)
- Data-driven "From the Pier" architecture (3B)
- Static map fallback infrastructure (3D)
- Data source unification (3E)
- Site-wide version badge update (2B)
- Article schema addition (2D)

---

## Items Intentionally Left Alone

| Item | Reason |
|------|--------|
| Version badge (V1.Beta) | Site-wide concern, not Nassau-specific |
| Article schema | WebPage + Place mainEntity is correct per port standards |
| og:image .jpg format | Social sharing images commonly use JPG/PNG |
| H2 keyword clustering | Would violate content-strategy guardrail against keyword stuffing |
| Data-driven "From the Pier" | 376-page architectural change, risk > benefit now |
| Static map fallback | Infrastructure project, current noscript message is adequate |

---

**Soli Deo Gloria**
