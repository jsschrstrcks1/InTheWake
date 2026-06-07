# Ship Hub — Full Boardroom Review

**Subject:** the style-4 ship hub (`shiphubbeta4.html`) for cruisinginthewake.com
**Date:** 2026-06-07
**Method:** each persona reviewed in character via the `ken` boardroom skill, run as cross-vendor consults (Gemini/GPT; Grok's key invalid). Two rounds: Round 1 reviewed the *thin first attempt*; Round 2 reviewed the *rebuilt hub*. 16 of the board's built personas; the 9 unbuilt are business/sales lenses, out of lane for a content hub.
**Headline:** the rebuilt hub works — **16/16 affirm**. The thin first attempt was a fumble (a 15-card line grid that dropped the directory, key facts, deck plans, live tracker, FAQ, and "who this is for"). The rebuild restored them.

---

## Round 1 — diagnosing the fumble (5 lenses)

*These reviewed the original thin grid and produced the restore list.*

### Simplicity Maximalist
- **Must restore:** the actual ship directory with key facts at a glance; ship-specific detail (deck plans / amenities) via progressive disclosure or linked pages; the live tracker.
- **Structure:** multi-level progressive disclosure — Tier-1 hub (filterable line grid, "view ships") → Tier-2 line fleet page (ships + key facts + link) → Tier-3 ship page (deck plans, gallery, FAQ, tracker); plus filter/sort/search.
- **Biggest risk:** failure to manage complexity via progressive disclosure → overwhelming despite a "calm" skin.

### Interaction-Polish Engineer
- **Must restore:** the searchable/filterable ship directory; the live tracker; the FAQ + "who this page is for."
- **Structure:** tiered — 15 line cards that expand to ships; key facts collapsible; expand only what you want.
- **Biggest risk:** sacrificing navigational/informational elements for aesthetics → alienates people who need the detail.

### Systems Maintainer
- **Must restore:** the 290-ship directory; deck plans (especially accessibility); key facts at a glance.
- **Structure:** line cards with count + "View all ships" CTA → line fleet pages (filter by class / size / accessible cabins / quiet zones, sortable) → ship detail pages with deck plans + breadcrumbs; plus search.
- **Biggest risk:** information overload from dumping 290 ships on one page — breaks "calm/scannable," worst for vulnerable readers.

### Frontend Performance Engineer
- **Must restore:** the ship directory; the live tracker; key facts at a glance.
- **Structure:** collapsible/accordion or tabbed; expand only the relevant section.
- **Biggest risk:** performance — heavy payload + a live tracker = slow load; **link or defer the tracker, don't embed it**; lazy-load images.

### Positioning Sage
- **Must restore:** the directory of *actual ships* ("without ships it's just a Cruise-Line hub"); deck plans; key facts at a glance.
- **Structure:** hierarchical disclosure — hub (H1, intro prose, filter/search, line cards with counts) → fleet page (ship cards + key stats + image + CTA) → ship page (key-facts block, deck plans, tracker, FAQ, "who this ship is for").
- **Biggest risk:** becoming a generic, undifferentiated directory — stripping the deep tools is a positioning failure; the anxious reader needs detail, not a pretty surface.

---

## Round 2 — reviewing the rebuilt hub (11 lenses)

*Verdict / the one improvement / the biggest remaining risk, in each persona's lane.*

### Design panel

**Restraint Designer** — Works: clear hierarchy, content-first, progressive disclosure, accessibility prose. *Improvement:* make the key-facts numbers (291 / 15 / 388) clickable navigational entry points. *Risk:* the vibrant accents could compromise readability/contrast and clash with "calm" if not constrained to a high-contrast palette.

**Minimalist** — Works: minimalist, serves a wide range incl. vulnerable readers. *Improvement:* ensure high text/background contrast on the "Explore by cruise line" grid. *Risk:* the static "Where is the ship right now?" may confuse users who expect dynamic content on the page itself.

**Moments Designer** — Works: sound information hierarchy, progressive disclosure, static tracker CTA, native FAQ, typographic care. *Improvement:* add a small **"Featured / Popular Ships"** section (3–5 image cards) as a direct visual entry to individual ships. *Risk:* the most compelling content (individual ships) is buried; "designed reveals" aren't leveraged; ship-curious-but-not-line-committed users may exit.

**Typographic UI Engineer** — Works: 64ch measure, calm, readable. *Improvement:* increase the contrast between headings and body text. *Risk:* content levels aren't distinguished enough → harder for visually impaired users to locate information quickly.

### Web-stack / CSS panel

**Native-CSS Engineer** — Works: intrinsic-friendly, native, script-free, progressive disclosure. *Improvement:* use `min-content`/`max-content` sizing on the cards so they adapt to content without fixed widths or media queries. *Risk:* layout shift / overflow on extreme viewports if images aren't intrinsically sized; vibrant accents must pass contrast.

**CSS Artist** — Works: CSS-only, accessible static page. *Improvement:* make the line-card grid fully responsive and readable at every size. *Risk:* the vibrant brand accents may not meet WCAG contrast for visually impaired users.

**Canvas Interactionist** — Works: static, clear navigation, progressive disclosure, tracker CTA without breaking the static model. *Improvement:* a subtle CSS-only hover transition on the line cards to add a touch of interactive joy and guide the eye (no JS). *Risk:* the downstream fleet/ship pages must hold the same calm + delight, or the volume of content loses the user.

**Immersive-Experience Artist** — Works, and the absence of immersion is correct here. *(Out of lane — affirms restraint.)* *Risk:* even simple 3D/parallax would increase cognitive load for vulnerable readers; do not add it.

### Technical / PWA / execution panel

**Engineer-Founder** *(mostly out of his hardware lane)* — Works: well-structured static page, efficient progressive disclosure. *Improvement:* add a "ships by tonnage / size / capacity" exploration (the physical facts that decide the feel of a vessel). *Risk:* the filesystem-derived counts are a build-time dependency — they go stale/inaccurate if the data changes without a rebuild (data-integrity).

**Offline-Caching Architect** — Works: static, minimizes JS reliance. *Improvement:* add a service worker to precache static assets for offline-at-the-pier and faster loads. *Risk:* without a service worker there's no offline access and no cache-invalidation strategy. *(Note: the live site has `sw.js`; this reattaches at promotion — not a beta bug.)*

**Performance Coach** — Works: well-structured static, progressive disclosure, accessibility notes, static tracker link, key facts. *Improvement:* add a **"search by ship name"** field under the H1 (a static form submitting to a pre-filtered results page) for a direct path. *Risk:* content bloat + manual maintenance burden as 291 ships / 388 ports grow → information decay; the "will-it-stay-maintained" question.

---

## Round 3 — Business / Revenue panel (roster-lens; profiles not yet built)

*These 9 lenses are named on the board's 25-roster but not yet built as full profiles, so they were run from their one-line roster lenses, with the site's fixed non-commercial ethos (no ads / affiliate / commissions / sponsored) stated up front. Per the board's protocol, an out-of-lane refusal is a legitimate, recorded finding.*

**Out of lane / refused — 7 of 9:** Brand Founder, President and CEO, Sales General, Offer Architect, Funnel Builder, Persuader, Sales Method Veteran. Each declined — their lane (paid offers, funnels, closing, pricing, deal structure) directly conflicts with the no-commerce ethos. Several added that *attempting* to apply their craft would undermine the site's integrity and the trust it's built on.

**In bounds — 2 of 9:**
- **Attention Operator** — organic discoverability is in bounds and non-commercial. *Change:* keyword-optimize the cruise-line names + image alt text for organic search. *Risk:* over-optimization / keyword stuffing that hurts the reading experience.
- **Direct-Response Veteran** — refused the commercial application, but reframed "conversion" as *successful information access*. *Change:* rewrite "how to use" + "who this is for" to **explicitly empathize with vulnerable readers** ("Planning after a loss?" / "Navigating accessibility?") so they see at once that the hub serves them. *Risk:* forced or somber empathy that alienates the general audience — keep it honest and concise.

**The finding inside the refusals:** a revenue panel that near-unanimously declines is signal, not silence — the site's non-commercial stance is firm enough that the monetization lenses have nothing to add. This echoes the earlier Engineer-Founder + Positioning-Sage note: the site creates real value and deliberately captures none. **Keep it that way.**

---

## Cross-board consensus

| Theme | Lenses | Verdict |
|---|---|---|
| **Rebuilt hub works** | all 16 | unanimous |
| **Give a *direct* path to individual ships** (search / featured-ships row / sort-by-size / clickable key-facts) | Performance Coach, Moments Designer, Engineer-Founder, Restraint Designer, (Systems Maintainer) | **strong consensus — top improvement** |
| **Verify WCAG contrast on the vibrant accents + heading/body** | Restraint, Minimalist, CSS Artist, Native-CSS, Typographic | **strong consensus — accessibility** |
| **Compute the counts at build time** (don't hand-write; they rot) | Engineer-Founder, Performance Coach | consensus |
| **Offline / service worker** | Offline-Caching Architect | single specialist (reattaches at promotion) |
| **Downstream fleet/ship pages must hold the same calm** | Canvas Interactionist, Moments Designer | caveat for the next tier |
| **No 3D/immersion here** | Immersive-Experience Artist | affirm the restraint |

**The recurring theme:** three independent lenses, three ways, said the same thing — let a ship-curious visitor reach a ship *directly* (search, a featured row, or sort-by-size), not only via the line grid.

## Recommended action queue
1. Add a **search-by-ship** affordance + a small **featured-ships** row (direct entry).
2. Make **`beta4-build.py` compute the counts** at build time (kills the staleness risk).
3. Run a **contrast check** on the teal / deep-sea / gold accents + heading/body; adjust to WCAG AA.
4. Next tier: build a **line fleet page** and an **individual ship page** in style 4 (board-first), keeping the same calm.
5. **Empathy-forward intro** — rewrite "who this is for" to name the vulnerable reader directly (Direct-Response Veteran; on-ethos, pairs with the pastoral guardrails).
6. **Organic-discoverability pass** — true-to-content line names + image alt text (Attention Operator); no keyword stuffing.

## Roster coverage
- **Heard:** all 16 *built* personas (Rounds 1–2) + the 9 *named-but-unbuilt* business/revenue lenses (Round 3, roster-lens).
- **Not run:** the deeper *candidate/backlog* lenses (Infrastructure Architect, Full-Stack Integrator, Web Foundations Architect, Runtime Unifier, Component-Model Architect, Convention-Over-Configuration Architect, Constrained-Device Performance Engineer, Web-Capabilities Advocate, Web-Security Auditor, PWA-Packaging Engineer, Performance-UX Aligner, Platform Strategist, Product Visionary) — these are explicitly "candidate"/backlog, not part of the named 25, and several overlap existing household skills. Available if you want them convened.
