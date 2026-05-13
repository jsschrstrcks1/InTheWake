# Plan — Cognitive Load + Content-Modality Framework, with drink-calculator.html as Pilot

**Branch:** `claude/review-docs-accessibility-EyIuC`
**Author:** Claude (drafted under careful-not-clever v1.8.2)
**Date:** 2026-05-13
**Revised:** 2026-05-13 — external review (pasted from another model) verified against the actual repo; verified-wheat items merged, verified-chaff items rejected with evidence. See §11 Verification Log.
**Revised again:** 2026-05-13 — adversarial-review (grok, audit-reports/external-audit-2026-05-13T182913Z) + orchestra debate (GPT-4o + Perplexity/Gemini-3-flash + Grok-3, ~$0.06). Findings that survived cross-examination merged. See §12 Debate Log.
**Status:** Draft for user review. **No file edits beyond this plan doc until approved.**

> Soli Deo Gloria. This plan extends the existing accessibility surface (WCAG 2.1 AA, accessibility-audit skill, audience-profiles, pastoral guardrails) with two layers it does not yet have: a cognitive-load budget and a content-modality menu. The pastoral guardrails sit above this plan and override it where they conflict.

---

## 1. Why this exists

The site already enforces WCAG 2.1 AA, names disability and neurodivergence in the pastoral guardrails, and ships the audience-profiles skill (First-Timer, Experienced, Grieving, Disabled, Solo, Caregiver). What the site does **not** yet have:

- A documented **cognitive-load budget** per page (intrinsic / extraneous / germane, per Sweller).
- A documented **content-modality menu** (text / image / chart / short video / audio summary / plain-language tier / numeric-tool) so a reader can choose how to receive the same information.
- A **plain-language tier** (Flesch-Kincaid Grade ≤ 8) explicitly distinct from the editorial voice.
- **Decision-fatigue rules** for the 9 interactive tools (sane defaults, primary input first, results above the fold, undo always available).
- **Neurodivergence accommodations** named at the markup and copy level (ADHD, autism, dyslexia, anxiety) — currently only named at the principle level in `PASTORAL_GUARDRAILS.md`.

### A note on "learning styles"

The popular VARK / "visual learner / auditory learner / kinesthetic learner" model has failed empirical replication in education research for over a decade. We are **not** building on it. We are building on:

- **Cognitive load theory** (Sweller, 1988+) — intrinsic / extraneous / germane load. Empirically supported.
- **Content modalities as choice, not classification.** Reader picks the medium; we don't claim they have a fixed type.
- **Reading literacy and decision fatigue** — well-supported and directly measurable.
- **Sensory load** — `prefers-reduced-motion`, autoplay, parallax, theme strobing.
- **Neurodivergence accommodations at the markup level** — ADHD, autism, dyslexia, anxiety.
- **Assistive technology compatibility** — already covered by `accessibility-audit`; named here so this framework subsumes it rather than competing.

---

## 2. What this plan must not break

These are upstream constraints. The framework lives under them.

| Constraint | Source |
|---|---|
| Pastoral guardrails (people before platform; do less, not more) | `admin/claude/PASTORAL_GUARDRAILS.md` |
| careful-not-clever, claim-evidence table on Layer 2/3 commits | `.claude/skills/careful-not-clever/CAREFUL.md` v1.8.2 |
| WCAG 2.1 AA, Lighthouse a11y = 100 before deploy | `.claude/skills/accessibility-audit/SKILL.md` |
| Voice (`like-a-human` v3.1.0): banned vocabulary, plain copulas, no decorative adverbs | `.claude/skills/like-a-human/SKILL.md` |
| ICP-Lite v1.4 / ICP-2 metas, SDG comment before line 20, last-reviewed bump | `admin/claude/SITE_REFERENCE.md` |
| No new inline `style=` attributes (P0 CSS consolidation against ~19,513) | `claude.md` priorities |
| No `console.log`, no `innerHTML` with user input, absolute HTTPS only | `admin/claude/TECHNICAL_STANDARDS.md` |
| Validator chain: `admin/validate-ship-page.sh`, `admin/validate.js`, `.githooks/pre-commit` | `claude.md` |
| Never game the validator; no SEO-driven prose changes | `claude.md` |

---

## 3. The framework

### 3.1 Cognitive load budget (per page)

Each page-type carries one budget against three load categories:

- **Intrinsic load** — the inherent complexity of the cruise decision the page is for. Cannot be reduced without lying. *Hold this honest.*
- **Extraneous load** — everything the layout, navigation, and prose adds that isn't the decision. *Minimize this.*
- **Germane load** — the structure and scaffolding that helps the reader build a mental model. *Spend the budget here.*

**Operational rule for any page edit:** if a change increases extraneous load (e.g., a third CTA, a new modal, an animation), one piece of extraneous load somewhere else on the page must be removed. The page does not get heavier in extraneous load over time.

### 3.2 Content-modality menu

Modalities are **content access points, not learner types.** A reader picks the medium for the moment they are in (anxious, in transit, screen-reader, low-bandwidth, eyes-off, in a hurry).

A note on VARK: the dominant model in education research splits sensory channels into four lanes — **Visual**, **Aural**, **Read/Write**, and **Kinesthetic** (Fleming, 1992). The empirical evidence for *matching* a person to a "style" is weak, but the evidence that *people benefit from the same information offered in multiple lanes simultaneously* is solid. The table below names the four lanes explicitly so we don't collapse Read/Write into Visual the way pre-1992 frameworks did.

| Modality | VARK lane | Use when | Format |
|---|---|---|---|
| Text (editorial voice) | Read/Write | Always present. The record. | HTML body copy at editorial voice level |
| Plain-language tier | Read/Write | Anxiety, low literacy, ND, first reading | TL;DR card at top, FK Grade ≤ 8 |
| Image / chart / map | Visual | The fact is spatial or comparative | WebP image with full alt, or accessible SVG with `<title>` and `<desc>` |
| Short video (≤ 90 s) | Visual + Aural | Motion or scale matters; demo of a UI | MP4 + WebM, captions, transcript link |
| Audio summary | Aural | Eyes-off, driving, low-literacy, or sighted-aural-preference user | MP3 of the plain-language tier, transcript = the plain-language tier itself |
| Interactive tool / quiz | Kinesthetic | Question is "how much" / "which fits" — the user wants to *do*, not read | The 9 existing interactive tools |

**Rule:** every modality must have a text equivalent reachable without the modality. No video without transcript. No chart without alt + table fallback. No audio without source text. This is not a UX nicety; it's the AT contract.

**Verified aural gap (2026-05-13).** `grep -c "<audio"` on `index.html`, `drink-calculator.html`, and `ships/quiz.html` returns 0. The site has no audio playback anywhere a sighted reader can press play. Screen-reader users are served by `aria-live` regions (e.g., `ships/quiz.html:1215`), but sighted-aural-preference users are not. The Aural lane is the framework's largest gap.

### 3.3 Plain-language tier

Distinct from editorial voice. Editorial voice (cruise voice from `like-a-human`) prioritizes specifics, rhythm, and lived-experience signals — that's its job. The plain-language tier prioritizes comprehension at FK Grade ≤ 8.

- One TL;DR card at the top of the page, before any navigation depth.
- Three to five sentences. One question per sentence. No semicolons. No em-dashes.
- The same banned cruise-marketing vocabulary applies (`world-class`, `must-see`, etc.).
- The plain-language tier and the body copy must agree. If they don't, fix the body copy.
- Measure with a Flesch-Kincaid script in `admin/`. Acceptance: Grade ≤ 8 on the TL;DR; full page does not need to meet this bar.

### 3.4 Decision-fatigue rules (interactive tools)

Applies to the 9 tools. Not all 9 currently meet these; the pilot (drink-calculator) tests the pattern.

1. **Sane defaults pre-loaded.** A first-time visitor sees a working answer within 2 seconds, no input required. The defaults represent a plausible reader, not zeros.
2. **Primary input first.** The single input that most changes the answer is at the top.
3. **Result above the fold on first paint.** The reader sees a number before they scroll.
4. **One CTA per result state.** Not three. The CTA names the next concrete action.
5. **Undo / reset always visible.** Including a "back to defaults" button.
6. **No required field that isn't load-bearing.** Date-of-birth is not asked before a price.
7. **Disclosure progressive, not modal.** Detail expands inline; modals only for confirmation, never for content.

### 3.5 Sensory load

- `prefers-reduced-motion: reduce` honored on every animation, transition, and parallax.
  - **Site-level status (verified 2026-05-13):** 6 stylesheets already declare `@media (prefers-reduced-motion: reduce)` rules — `item-cards.css:471`, `ships-dynamic.css:454`, `calculator.css:1331` + `:1992`, `tools/cruise-tipping-calculator.css:204`, `styles.css:292`. Infrastructure is in place. The pilot's job is to **verify coverage on the pilot page's specific animations**, not to introduce the pattern.
- No autoplay video. No autoplay audio. Ever.
- No parallax on `accessibility.html`, `disability-at-sea.html`, `solo/accessible-cruising.html`, or any logbook entry tagged grief.
- Theme switching (light/dark) does not strobe; if a transition exists, it is ≤ 200 ms and respects reduced-motion.
- Background images do not move. Hero gradients are static.
- **Color is never the only signal.** Price comparison shows color + icon + label.
  - **Chart specifically:** the drink-calculator chart at `drink-calculator.html:798` uses Chart.js, which ships colorblind-suboptimal defaults out of the box. Audit chart colors against deuteranopia and protanopia simulators before approving the pilot. The chart already has an `sr-only` `<table>` fallback at `:801`, which is good for screen-reader users but does nothing for sighted color-blind users — a second visual channel (pattern fill, label position, or icon on the winning bar) is required.
- **Zoom and reflow at 200 % and tablet portrait.** Site CSS currently uses a single mobile breakpoint at `@media (max-width: 600px)` (`assets/styles.css:101+`). There is no tablet-medium breakpoint. The "older user on iPad in portrait" case is not explicitly designed for. The pilot must verify reflow at 200 % zoom and iPad-portrait (~768 × 1024) without horizontal scrolling, per WCAG 2.1 AA criterion 1.4.10.

### 3.6 Neurodivergence accommodations (markup + copy)

**ADHD**
- Paragraphs ≤ 4 sentences in the top half of the page.
- Headings every ~150 words; no wall-of-text sections.
- Action labels say what the action does ("Calculate" not "Submit").
- The page survives skim-reading: every section's first sentence carries the section's point.

**Autism**
- Literal language. No idiom-heavy descriptions on instructional pages.
- Predictable structure within a page-type. A port page's section order is the same on every port page.
- No "we'll dive into" or other indirect openings. State the topic; address the reader.

**Dyslexia**
- Line length ≤ 80 characters in body copy.
- An optional **dyslexia-friendly font toggle** (`OpenDyslexic` or `Atkinson Hyperlegible`) saved to `localStorage`.
- Bold for emphasis; italics only for titles and quoted speech.
- Adequate paragraph spacing (already in `styles.css`).

**Anxiety**
- The first paragraph names what the page **will** and **will not** do.
- Cost ranges given honestly with the date attached (consistent with `like-a-human`).
- Calculator results never stack a hidden "but actually" caveat below a green number; caveats are visible at the same scroll position.

### 3.7 Assistive technology and motor compatibility

This subsumes the existing `accessibility-audit` skill. The framework does not replace WCAG; it sits alongside it. Anything that would lower a Lighthouse accessibility score below 100 is rejected by this framework before it reaches the validator.

**WCAG version — 2.2 AA, not 2.1.** Web-grounded debate (Perplexity, 2026-05-13) surfaced that WCAG 2.2 AA is the current standard as of late 2025/early 2026; the site's `accessibility-audit` skill and `WCAG_2.1_AA_STANDARDS_v3.100.md` still reference 2.1. The two criteria that matter most for this framework are new in 2.2:

- **SC 2.4.11 Focus Not Obscured (Minimum).** When a UI element gets keyboard focus, no other element (sticky header, cookie banner, scroll-snap overlay) should obscure it. The "11 pm-in-bed" reader using a sticky mobile header is the worst case.
- **SC 2.5.8 Target Size (Minimum).** Interactive targets are at least 24 × 24 CSS pixels, with documented exceptions (inline-in-text links, browser-defined controls). This affects the drink-calculator sliders, the cruise-line picker chips, and every tool's reset button.

This framework references **WCAG 2.2 AA** explicitly. The `accessibility-audit` skill update from 2.1 to 2.2 is flagged as a separate sibling task; the framework does not block on that update but must not regress against the new criteria.

**Motor disabilities beyond AT.** Motor accommodations are not automatically covered by the AT contract:

- **Target size: 24 × 24 CSS pixels minimum** (per SC 2.5.8) for every interactive target on the pilot. Verify with a measurement pass.
- **Keyboard navigation paths complete** — every interaction reachable without a pointing device, in a sensible tab order, with visible focus indicators (per SC 2.4.7).
- **Hover-not-required.** Information that only appears on `:hover` must also appear on `:focus` and on tap. The drink-calculator package cards must not hide voucher details behind hover.
- **Drag alternatives.** Any drag-and-drop interaction needs a keyboard or click-based alternative (per SC 2.5.7). The pilot has no drag interactions today; this rule applies if any are added.
- **Timing not relied on.** No interaction times out without user-initiated extension (per SC 2.2.1, already in 2.1).

### 3.8 Decision under uncertainty (not just learning)

Most visitors to a cruise-planning site are not acquiring durable knowledge. They are **deciding under uncertainty with money on the line.** The literature that applies here is decision-support and risk-communication, not pedagogy. Three effects matter for the 9 interactive tools and any page that ends in a price:

- **Anchoring.** The first number a reader sees becomes their reference point. On the drink calculator, if "$14/drink Deluxe cap" is shown before total trip cost, drinks look cheap; if the package total appears first, the per-drink price looks attractive. The order of numerical disclosure is a design choice with a measurable effect.
- **Loss aversion.** "You save $X with the package" and "you lose $X without it" describe the same fact, but they land differently. The pastoral voice currently avoids both framings; that is a principled choice. The framework does not mandate either, but the choice should be conscious and consistent across tools, not accidental.
- **Choice overload (Hick's Law).** Decision time scales with the number of options. The drink calculator currently offers five comparison paths (Soda, Refreshment, Deluxe, Coffee Card, à-la-carte). RCL's "everyone in cabin must buy the same package" policy collapses several of these in practice. The tool should reflect that collapse in its default state, with full five-way comparison available behind a single "compare all packages" disclosure for the user who actually wants it.

**Operational rule:** when a page asks a money question, name the assumption set used to produce the answer, in plain language, at the same scroll position as the answer. Never let the assumption disclosure live below the answer.

### 3.9 Contexts of use

A reader's context dictates which modality serves them, more than any abstract preference. Five contexts shape this site's audience:

| Context | What the reader can do | What the reader cannot do | Modality fit |
|---|---|---|---|
| Pre-cruise at a desk, ≥ 2 weeks out | Read, compare, take notes | — | Full text + visual + interactive |
| Pre-cruise on phone, late evening | Read short, tap, swipe | Read long, fill forms | Plain-language TL;DR; one-tap answer; deferred-input "just answer me" path |
| At the cruise terminal, spotty signal | Read cached content, tap | Wait for slow fetches | PWA-cached subset; large tap targets; no fetch-blocking renders |
| On the ship at $0.65/MB | Read text, view tiny images | Stream video, load heavy JS | Text-only fallback; aggressive image lazy-load; tools must work offline |
| Post-cruise, sharing or planning next | Recall, copy URLs, screenshot | — | Shareable result states; deep links to filled-in calculator URLs |

The **late-evening-on-phone context (the "11 pm in bed" reader)** is the one most underserved by the current site. That reader does not want a 12-input calculator; they want one sentence that says "for someone like you, the package usually wins by ~$X." See §5 Pilot Phase 2.

**Low-bandwidth concrete metrics (the on-ship-at-$0.65/MB context).** Naming the context without numbers is not enough. Operational rules:

- **Page weight at first paint ≤ 200 KB** including HTML + critical CSS + above-the-fold images. Verify with Lighthouse + a network-throttled DevTools run.
- **No above-the-fold image larger than 50 KB.** WebP, properly sized via `width` + `height`, served at `fetchpriority="high"` only on the LCP image.
- **Lazy-load every below-fold image.** `loading="lazy"` on `<img>`; `loading="lazy"` on `<iframe>` if any.
- **Defer non-critical JS.** Analytics, dropdown chrome, and tool logic with `defer` or `async`; never block the parser on a non-critical script.
- **No autoplay anything.** Already in §3.5; restated here because autoplay video on a $0.65/MB connection is a measurable harm.
- **The PWA Service Worker (v14.3.0) already caches text and JSON.** This framework does not propose changes to the Service Worker; it does require that tool pages remain fully usable from the cached state, which is the existing PWA contract.

### 3.10 Trust signals (alongside, not under, pastoral voice)

Pastoral voice and theological framing (Soli Deo Gloria, scripture invocations) are brand. They establish trust with the readers who share that worldview. They are not trust signals for skeptical readers who do not. Decision-support trust signals are a separate layer, and the site already has the raw material — it is mostly under-displayed.

| Signal | Current state | What to do |
|---|---|---|
| "Built from 150+ days at sea" | The string at `index.html:696` previously read "50+ real sailings" — verified to exist on the page but **not verified against ground truth.** The author (Ken) named 150+ days at sea as the accurate figure on 2026-05-13. Trust-bytes-not-strings failure; see §11.1.1. Now corrected at `index.html:696`, `index.html:267`, and `first-cruise.html:306` | Promote the corrected figure to a top-of-page line on tool pages and to a more prominent home-page slot. Days at sea is a more honest unit than sailings — it tracks exposure time, which is what trust-from-experience actually depends on |
| Per-tool last-reviewed date | Site-wide: `last-reviewed` meta tag is required and enforced (`SITE_REFERENCE.md`); not always surfaced visibly to the reader | Surface the date visibly near the tool's title ("Updated after March 2026 Symphony sailing"), not only in meta |
| Data-source disclosure | Implicit | Add a one-line "data sources" note on each tool ("menus photographed on recent sailings; cruise-planner screenshots cross-referenced") |
| Author identification | Verified: Person JSON-LD + Ken's author card present (`index.html:710-719`) | Keep. Photos of Ken on actual ships, if available, are content-not-framework — flagged as a separate edit. |

**Rule:** the framework does not require pastoral signals to be removed or weakened. It requires decision-support signals to **exist as their own layer**, so readers who don't read the pastoral signals still have something solid to weigh.

---

## 4. Per-page-type rules (cognitive-load priority)

| Page type | Top of page | Mid | Bottom |
|---|---|---|---|
| Homepage | One question per panel; no "everything" | Persona doors; not feature dump | Quiet pastoral signoff |
| Port page | TL;DR + "From the Pier" answer | Attractions / dining / accessibility / map | Logbook story; FAQ |
| Ship page | 30-second promise | Deck plans, tracker, dining, FAQ | Logbook; cross-fleet |
| Restaurant / venue | Cost + bookable + walk-in policy | Menu, dress, seating, story | Logbook; related |
| Article / logbook | Emotional arrival | Practical content | Dated signoff |
| Tool / calculator | Default values pre-set; primary input first; **result above the fold** | Inputs, secondary controls | Methodology, sources |
| Accessibility / disability | Plain-language TL;DR; what page covers and does not | Specific, dignity-first practical | Pastoral signoff |

---

## 5. Pilot — `drink-calculator.html`

### 5.1 Why this page

Highest cognitive-load surface among the tools. Real money decision. Already has prior accommodations (recovery-sensitive view, pre-cruise vs onboard pricing toggle, clickable package cards). Strong baseline to build on. **Note:** `drink-calculatorv2.html` is in active P2 development with a pending math fix; this pilot deliberately works on **v1** to avoid colliding with that workstream. If the v1 pattern is approved, it can re-base into v2 once v2's math fix lands.

### 5.2 Concrete changes (proposed; not yet applied)

**Above the fold**
- Add a TL;DR card at the top of `<main>`, before any tabs or controls.
  - One number: "Will the package save you money? At today's defaults: **yes / no, by ~$X over your trip**."
  - Three sentences in plain-language tier (FK Grade ≤ 8).
  - Link to a short "how packages work in 60 seconds" section anchored further down.
- Pre-load defaults: 7-day, RCL, "average drinker" persona (e.g., 4 alcoholic + 2 non-alcoholic / day).
- Result region renders **before** any input is changed. Live region (`aria-live="polite"`) already required by `accessibility-audit`; verify it.

**Modality menu (visible as a row of buttons or a small picker)**
- Numeric (the calculator itself — current default).
- Plain-language explanation (anchor to the 60-second section).
- Visual chart (cost curve by drinks/day; existing chart in v1 — verify it has accessible table fallback).
- Audio summary (MP3 of the plain-language section). The transcript **is** the plain-language section.

**Decision-fatigue cuts**
- Replace numeric "drinks per day" inputs with a slider that has both label and visible numeric value (`aria-valuetext="eight drinks per day"`).
- Cruise-line picker collapsed by default to RCL (the page is RCL-titled). Other lines accessible via a single "compare another line" disclosure.
- One CTA per result state ("See break-even chart" or "Compare to Coffee Card") — not stacked.
- Reset-to-defaults button always visible near the inputs, not buried.

**Sensory load**
- Audit every animation/transition for `prefers-reduced-motion: reduce` respect; add the media query where missing.
- Verify no autoplay on any video/audio (none currently expected, but verify).
- Price comparison shows color + icon + text label, never color alone.
- **Chart colorblind audit (promoted to Phase 1).** Cross-examination during the orchestra debate confirmed this is load-bearing: ~8 % of male readers have red-green color vision deficiency, and Chart.js defaults are not deuteranopia-safe. Pilot ships with at least one second visual channel on the `breakeven-chart` canvas — pattern fill on bars, an icon on the winning bar, or label position that does not depend on color. Verify with a deuteranopia/protanopia simulator before the pilot commit.
- **WCAG 2.2 SC 2.4.11 Focus Not Obscured.** Verify on the pilot page that any sticky header or floating element does not obscure a focused input or button.
- **WCAG 2.2 SC 2.5.8 Target Size.** Verify every interactive target on the pilot is ≥ 24 × 24 CSS pixels.

**Neurodivergence**
- Paragraph length cap in the explainer copy (≤ 4 sentences).
- Linear flow with a single "skip to result" anchor at the top.
- Calculator labels say what the input does ("How many drinks per day, average?"), not what the field is called.
- The first paragraph of the TL;DR names what the page does **and what it does not do** ("This estimates value at today's prices; it does not book a package or guarantee future pricing.").

**AT (verify, do not regress)**
- Live region on result update — present? verify.
- Slider `aria-valuetext` — present? verify.
- Skip link to result region — add if missing.
- Recovery-sensitive view toggle — verify keyboard reachable and labeled.
- Color contrast on result colors against page background — re-test (some greens at 3.x:1 historically).

**Voice + content discipline**
- Plain-language tier in addition to existing copy. **Do not rewrite existing editorial copy** unless it violates `like-a-human` — the body voice belongs to the cruise voice; the TL;DR is its own register.
- No new banned vocabulary (`world-class`, `must-do`, etc.).
- Update `last-reviewed` meta + JSON-LD `dateModified` per `SITE_REFERENCE.md` rule.
- SDG comment unchanged. Already present.

### 5.2.1 Phase 2 (defer; do not bundle into Phase 1)

The following are good and verified-needed, but **explicitly out of Phase 1** so the pilot ships with a tight blast radius. Each gets its own commit after Phase 1 lands.

- **"Just answer me" 3-question path** for the 11 pm-in-bed reader. Three controls only — adults, days, drinker tier (light / moderate / heavy). Output: one sentence ("For a moderate drinker on a 7-day RCL sailing, the Deluxe usually wins by ~$X.") with a "Show me the math" disclosure that reveals the full calculator. The full calculator is still the canonical surface; the 3-question path is the on-ramp.
- **Audio summary** of the plain-language TL;DR. Generated TTS for v0 (`SpeechSynthesisUtterance` browser-side, or a static MP3 produced from the TL;DR text). Defer human-narrated audio until the pattern is proven.
- **Trust-signal promotion** ("Built from 50+ real sailings" and per-tool last-reviewed date) surfaced visibly on the drink-calculator page.
- **"Compare all packages" disclosure** that collapses the five-way comparison into a single-default + opt-in expansion per Hick's Law (§3.8).

*(Note: "chart colorblind audit" was originally in this Phase-2 list. Promoted to Phase 1 after the orchestra debate flagged colorblindness as load-bearing for a measurable population segment. See §5.2 Sensory load.)*

### 5.2.2 Phase 3 (separate plan)

These belong in their own plan docs once Phase 2 lands:

- **Audio modality on Logbook stories** (the largest aural-channel addition; pastoral voice + audio is the site's strongest unrealized asset).
- **Site-wide "compare another line" UX** for the calculator family.
- **Sibling bug fix:** the `index.html:734` "Loading articles…" placeholder needs a skeleton state, a server-rendered fallback list, and the inline `style="color: #666;"` lifted into `assets/styles.css` per the P0 inline-style consolidation. **Not part of this plan; flagged for separate work.**

### 5.3 What stays untouched in the pilot

- Math engine. Untouched.
- Recovery-sensitive view feature. Untouched (already a cognitive-load accommodation).
- Pre-cruise vs onboard pricing toggle. Untouched.
- All existing JSON-LD blocks. Untouched (verify they still validate after edits).
- v2 file. Not opened. Not edited.

---

## 6. Validator alignment

Acceptance is demonstrated against the existing chain, not invented checks.

- `admin/validate.js` (page-type dispatcher) — must pass.
- `admin/validate-ship-page.sh` — not applicable to a tool page, but the `validate.js` dispatcher routes correctly.
- `.claude/hooks/ship-page-validator.sh` post-write — non-blocking on tool pages.
- `.githooks/pre-commit` — must pass (placeholder image, invalid JSON, missing SDG).
- Lighthouse accessibility — must hold at 100.
- Flesch-Kincaid Grade on TL;DR — ≤ 8. (Add a small node script under `admin/` if one does not exist; defer to the user before adding.)

---

## 7. Acceptance criteria (claim-evidence table for the eventual pilot commit)

Per careful-not-clever v1.8.2 §"Claim-Evidence Discipline." Drafted now so the implementation does not get to skip it later.

| Claim | Specific evidence (filled at commit time) |
|---|---|
| TL;DR card renders above the fold at 360 px viewport | Manual screenshot at 360 × 800; `drink-calculator.html` line range cited |
| TL;DR text scores Flesch-Kincaid Grade ≤ 8 | Output of FK script run on TL;DR text; raw score in commit message |
| Live region announces result updates | Screen-reader test (VoiceOver or NVDA) + `aria-live` attribute cited at `file:line` |
| Slider has `aria-valuetext` | Attribute cited at `file:line`; manual screen-reader read-back |
| `prefers-reduced-motion` respected on every animation | `@media (prefers-reduced-motion: reduce)` rules cited; manual toggle test |
| Lighthouse accessibility score = 100 | Lighthouse report attached; date and run env named |
| No new inline `style=` attributes | `grep -c 'style="' drink-calculator.html` before/after |
| Math engine unchanged | `git diff` on `<script>` blocks holding math = 0 lines |
| v2 file unchanged | `git diff drink-calculatorv2.html` = 0 lines |
| `last-reviewed` and `dateModified` updated and equal | Both lines cited with the same ISO date |
| All existing JSON-LD blocks still parse | `node -e "JSON.parse(...)"` per block; output cited |

**Anti-Mode-B reminder:** if the table after edits ends up describing only TL;DR-card existence and ignores the slider, modality menu, color-contrast, and reduced-motion changes, the table is too narrow. Widen to the actual scope of the change before committing.

### 7.1 Defining "is the framework working"

The orchestra debate flagged that the framework needs a definition of "working" before it can claim success. Two layers:

**Pre-launch (must hold before the pilot commit is approved):**
- Lighthouse accessibility = 100 on the pilot page.
- Flesch-Kincaid Grade ≤ 8 on the TL;DR text.
- All claim-evidence rows in §7's table verified with cited artifacts (file:line or command output).
- Manual deuteranopia + protanopia screenshots show the chart's winner is identifiable without color.
- No new inline `style=` attributes; no `console.log`; v2 file and math engine unchanged.

**Post-launch (30-day measurement window after the pilot ships):**

| Dimension | Signal | Source |
|---|---|---|
| Bounce-rate direction on pilot page | Trend, not a fixed percentage target (specific numbers like "10 % drop" surfaced in debate are illustrative, not researched) | GA4 (already required per `TECHNICAL_STANDARDS.md`) |
| Tool-engagement direction | Event-tracking on slider interaction, "compare another line" disclosure, reset button | GA4 events to be added (sibling task) |
| Time-to-first-result | Measured from page paint to first chart render | Custom timing event |
| Accessibility-audit regression check | Lighthouse re-run, axe-core on the pilot page | Manual + the existing accessibility-audit skill |
| Pastoral-voice regression | `voice-audit` skill run on the TL;DR + body copy | The existing voice-audit skill |

**The honest part.** This site's traffic profile probably does not produce statistically robust pre/post numbers within 30 days. The measurement window is for *direction*, not *significance.* If the framework is doing measurable harm (bounce up, engagement down), that is detectable even with thin data. If it is doing measurable good, the bar is lower than "p < 0.05"; the bar is "did not make things worse, and we can name specific signals that improved." If we cannot name those signals, we revert the pilot and re-plan.

---

## 8. Risks named

1. **v1 vs v2 collision.** Mitigated by working only on v1 and not opening v2. If the user later asks for the pattern on v2, that is a separate plan after v2's math fix lands.
2. **Inline-style P0.** Mitigated by routing any new styling into the consolidated CSS, not inline. If a CSS rule must be added, add it in `assets/styles.css` (or the page's stylesheet entry) and bump the `?v=` query.
3. **Lighthouse regression.** Mitigated by running Lighthouse before the first commit and after, and including both scores in the claim-evidence table.
4. **Voice drift in the TL;DR.** The TL;DR is plain-language tier, not cruise voice. Risk of producing flat or generic prose. Mitigated by holding the cruise voice in the body copy and applying `voice-audit` to both registers separately.
5. **Pastoral guardrails.** A drink calculator is decision-help, not pastoral content; the high-stakes pastoral rules apply less. The recovery-sensitive view feature **is** pastoral, and the pilot must not regress it.
6. **Claim-evidence narrow-claim drift (Mode B).** Named in §7. The author writing the commit must widen the table to the actual scope of the change.
7. **Audio summary as scope creep.** Generating an MP3 is real production work. **Defer the audio modality to a Phase 2** once the visual + plain-language tiers are accepted. Phase 1 of the pilot ships text + chart + plain-language; audio comes later.

---

## 9. Out of scope (this plan)

- Rewriting the 295 ship pages or 387 port pages. The framework is documented for them; the rebuild is a separate workstream.
- Editing `drink-calculatorv2.html`. Belongs to the active P2 workstream.
- Adding new audience-profiles personas (low-literacy, ND, anxiety as standalone personas). The current six personas already absorb these traits via traits, not categories. If the user wants standalone personas, that is a separate edit to `audience-profiles/SKILL.md`.
- Building a site-wide modality switcher chrome. The pilot ships a per-page modality menu; a global switcher is a Phase 3 question.
- Touching the math engine on either calculator.

---

## 10. What I'm asking the user before I touch any HTML

1. **Approve the framework as written**, or redirect specific sections.
2. **Approve the Phase 1 pilot scope** (text + chart + plain-language + reduced-motion + slider + TL;DR + reset + skip-link) and confirm Phase 2 (audio summary, modality switcher chrome) is deferred.
3. **Confirm I should add a small Flesch-Kincaid script under `admin/`** for the TL;DR check, or point me at an existing one.
4. **Confirm the commit cadence**: one commit for the framework doc (this file), then one commit for the pilot. Or bundle.

Until those answers land, this plan is the only artifact written. No HTML touched.

---

## 11. Verification log — external review (2026-05-13)

An external review (pasted from another model into this session) proposed a set of changes. Per careful-not-clever §"Limit of this rule" — external audit is the correct check; per `receiving-code-review` — apply technical rigor, not performative agreement. Every claim was verified against the actual repo before being merged or rejected.

### 11.1 Wheat — verified true, merged

Formatted per careful-not-clever v1.8.2 §"Claim-Evidence Discipline" — every row cites a specific artifact (file:line, command + output, or attribute reference). Grok finding 5 (LOW) against the prior commit `c9df21f9` named this format gap; this section addresses it.

| Claim | Specific evidence | Merge target |
|---|---|---|
| The site has no audio playback anywhere | `grep -c "<audio" index.html drink-calculator.html ships/quiz.html` → `0` for all three (run 2026-05-13) | §3.2 modality table + §5.2.2 Phase 3 |
| VARK splits into four lanes including Read/Write | Fleming (1992); current education-research consensus on the four-lane model | §3.2 (clarification) |
| "Built from 50+ real sailings" string is buried in a sidebar bullet | `index.html:696` in `col-2 aside`: `<li><strong>Built from 50+ real sailings</strong></li>` (this is the STRING placement — the underlying CLAIM was inaccurate; see §11.1.1) | §3.10 trust signals (placement is right; figure needed correction) |
| The "Loading articles…" placeholder is real, with an inline-style violation | `index.html:734`: `<p id="recent-rail-fallback" class="tiny" style="color: #666;">Loading articles…</p>` | §5.2.2 (separate plan) |
| Decision-under-uncertainty effects (anchoring, loss aversion, Hick's Law) apply | Tversky & Kahneman (1981) on framing; Hick (1952) on choice reaction time; standard decision-support literature | §3.8 |
| The 11 pm-on-phone reader is underserved | No non-form on-ramp exists on `drink-calculator.html`; `grep -n "quick\|just\|simple" drink-calculator.html` returns only marketing copy at `:429` ("💡 Use the calculator below to find your exact break-even point"), not a deferred-input path | §3.9 + Phase 2 |
| Chart.js defaults are colorblind-suboptimal | Chart.js v4 default palette uses `#36a2eb` / `#ff6384` etc., which fail deuteranopia simulators without a second visual channel; verified against the canvas at `drink-calculator.html:798` | §3.5 (Phase 1 audit) |
| iPad-portrait / 200 % zoom reflow is not explicitly designed for | `grep -n "@media" assets/styles.css` shows `@media (max-width: 600px)` at `:101, :116, :133, :144, :159, :199` — a single mobile breakpoint, no tablet-medium tier | §3.5 + verification task |
| The quiz lacks a visible TTS button for sighted-aural-preference users | `grep -c "<audio" ships/quiz.html` → `0`; `grep -n "aria-live" ships/quiz.html` shows `:1215` and `:1301` (screen-reader served, sighted-aural not) | §5.2.2 Phase 3 (audio modality) |

### 11.1.1 Trust-bytes-not-strings failure (2026-05-13, user-caught)

When merging the external review's wheat into §3.10, I verified that the string `Built from 50+ real sailings` existed at `index.html:696` and treated that as evidence the trust signal was real. The author then pointed out that he has spent 150+ days at sea, which is "a far cry from 50 sailings." The string was on the page; the underlying *claim* was inaccurate. I propagated the inaccurate claim onward into `first-cruise.html:306` in the Phase 1 pilot edit.

This is exactly the failure named in `admin/claude/CLAUDE.md` §"Verification Discipline": "Trust bytes, not strings. When asked whether something is correct, unique, working, or consistent — run the ground-truth check, not the proxy check. The proxy can be clean while the ground truth is broken." I ran the proxy check (string exists in repo). I did not run the ground-truth check (does the count match the author's actual sailing history). The user ran the ground-truth check and the proxy lost.

**Anti-Mode-B widening (2026-05-13).** Initial fix targeted only the two instances I had explicit context for (`first-cruise.html:306` and `index.html:696`). Plus `index.html:267` because the same factual claim appeared inside the same file in a different surface (ai-breadcrumbs). After running a `grep -rn "50+ cruises\|50+ sailings\|50 sailings\|50 real sailings"` across `*.html`, three additional instances surfaced that the same correction must cover, or the table understates scope (the v1.8.2 anti-Mode-B failure mode):

- `drink-calculator.html:306` — `expertise: 50+ cruises, drink package analysis since 2020` (ai-breadcrumbs)
- `about-us.html:248` — `expertise: Ken Baker (founder, 50+ cruises, ...)` (ai-breadcrumbs)
- `about-us.html:250` — `answer-first: ...Ken Baker (50+ cruises) and team` (ai-breadcrumbs)
- `drink-calculatorv2.html:315` — same as v1 — **deliberately excluded** because v2 is in active P2 development with a pending math fix per plan §5.1 ("v2 file. Not opened. Not edited."). Flagged here for separate user-led correction once the math fix lands.

**Corrections applied** (commit at integrity-correction commit SHA; cite at commit time):

| File:line | Before | After |
|---|---|---|
| `first-cruise.html:306` | `Built from 50+ real sailings, not a brochure` | `Built from 150+ days at sea, not a brochure` |
| `index.html:267` | `expertise: Royal Caribbean specialist, 50+ cruises, accessibility advocate, pastor, photographer` | `expertise: Royal Caribbean specialist, 150+ days at sea, accessibility advocate, pastor, photographer` |
| `index.html:696` | `<li><strong>Built from 50+ real sailings</strong></li>` | `<li><strong>Built from 150+ days at sea</strong></li>` |
| `index.html:41` | `last-reviewed content="2026-05-03"` | `last-reviewed content="2026-05-13"` |
| `index.html:231` | `dateModified: "2026-05-03"` | `dateModified: "2026-05-13"` |
| `drink-calculator.html:306` | `expertise: 50+ cruises, drink package analysis since 2020` | `expertise: 150+ days at sea, drink package analysis since 2020` |
| `drink-calculator.html:39` | `last-reviewed content="2026-04-13"` | `last-reviewed content="2026-05-13"` |
| `drink-calculator.html:278` | `dateModified: "2025-11-19"` (WebPage schema; SoftwareApplication's separate dateModified at :217 left unchanged because it tracks software version, not page review) | `dateModified: "2026-05-13"` |
| `about-us.html:248` | `expertise: Ken Baker (founder, 50+ cruises, pastor, photographer), ...` | `expertise: Ken Baker (founder, 150+ days at sea, pastor, photographer), ...` |
| `about-us.html:250` | `answer-first: ...Ken Baker (50+ cruises) and team` | `answer-first: ...Ken Baker (150+ days at sea) and team` |
| `about-us.html:29` | `last-reviewed content="2026-02-12"` | `last-reviewed content="2026-05-13"` |
| `about-us.html:187` | `dateModified: "2026-02-12"` | `dateModified: "2026-05-13"` |
| `drink-calculatorv2.html:315` | `expertise: 50+ cruises, drink package analysis since 2020` | **NOT MODIFIED** — P2 collision risk; user-led fix pending |

**Lesson preserved (do not rewrite history).** Wheat row in §11.1 was updated to acknowledge that what was verified was the *placement* of the string, not the *truth* of the claim. The failure is named here, not erased. Future authors lifting trust signals from existing pages must run the ground-truth check on the underlying claim, not just confirm the string exists.

**Why "days at sea" instead of a corrected sailing count.** The author offered "150+ days at sea" directly; that is the ground truth. Days at sea is also a more honest unit than sailings — a count of trips can include short repeat sailings on a familiar route; days at sea measures total exposure to the operating reality of a ship, which is what trust-from-experience actually rests on. Adopt the unit the author named.



| Claim | Verdict | Specific evidence |
|---|---|---|
| "Render the chart with default preset values on load" | **False — already does** | `drink-calculator.html` ll. 1420–1450 wires reset; `window.addEventListener('load', ...)` near line 1450 contains the comment `// Auto-trigger calculation after page loads` and a `FORCE_CALCULATE()` invocation that runs with default inputs |
| "The home page is tools-on-top, Logbook in a sidebar — reframe it around Logbook" | **False — Logbook is already in col-1 main, above Tools** | `index.html:460-469` (Logbook excerpt "From the Logbook" / "In the Wake of Grief: When Loss Needs Water") is inside `<section class="col-1">`; `index.html:474` opens the Planning Tools card *after* it. Visual-weight sub-issue (Tools card has heavy tropical gradient at `:474`) is real but does not justify a restructure; pastoral guardrails explicitly say "do less, not more — prefer copy-editing over restructuring" |
| "Loading articles… is the single highest-impact visual-channel fix" | **Real bug, overstated ranking** | Placeholder real (`index.html:734`); 0 audio elements is a wider channel gap than one placeholder. Demoted to §5.2.2 (separate plan) |
| "`ai-summary` is clever — but is anything reading it?" | **Naive of existing protocol** | `admin/claude/ITW-LITE_PROTOCOL.md` defines `<meta name="ai-summary">` as part of ICP-Lite v1.4; `admin/validator-spec/` catalogs 138 rules built on it. Field is protocol, not homegrown |
| "AI assistants weight recency heavily — freshness gap" | **Already enforced upstream** | `admin/claude/SITE_REFERENCE.md` "Last-Reviewed Date Updates" section requires every page edit to bump `<meta name="last-reviewed">` and JSON-LD `dateModified`; rule is enforced by validator |
| `prefers-reduced-motion` gap | **Infrastructure already in place** | `grep -rn "prefers-reduced-motion" assets/css/ assets/styles.css`: 6 declarations at `item-cards.css:471`, `ships-dynamic.css:454`, `calculator.css:1331`, `calculator.css:1992`, `tools/cruise-tipping-calculator.css:204`, `styles.css:292`. Verify per-page coverage, do not re-introduce |
| "Tool-card icon strip, photos of Ken on ships, Found-a-Duck? photo carousel" | **Out of framework scope** | "Found a Duck?" card exists at `index.html:624-637`; Ken's author card at `:710-719`. Real content recommendations, not learning-modality framework adaptations |
| "Voucher-section progressive disclosure" | **Already in plan** | §3.4: "Disclosure progressive, not modal. Detail expands inline; modals only for confirmation, never for content." |
| "Cognitive load on the drink calculator is borderline" | **Already in plan** | §3.4 and §5.2 already address this; pilot picked precisely because of that load |

### 11.3 Findings the external review missed

| Observation | Evidence |
|---|---|
| The drink-calculator chart already ships a screen-reader `<table>` fallback | `drink-calculator.html:798` `<canvas ... aria-describedby="chart-desc">`; `:801` `<table id="chart-desc" class="sr-only" aria-label="Package cost comparison data">` |
| The ship quiz uses semantic `<h2>` headings + `aria-live="polite"` status region | `ships/quiz.html:2019` `<h2>${q.question}</h2>`; `:1215` `<div id="a11y-status" role="status" aria-live="polite">`; `:1301` `<div class="quiz-progress" aria-live="polite">` |

---

## 12. Debate log — adversarial review + orchestra (2026-05-13)

The plan after §11 was sent to two independent checks:

1. **Adversarial review** (`admin/external-audit.sh` → grok, role challenge). Report: `audit-reports/external-audit-2026-05-13T182913Z-grok.md`. Cost: `$0.0783`.
2. **Orchestra debate** (cruising mode → GPT-4o + Perplexity-via-Gemini-3-flash + Grok-3). Cost: approx. `$0.06` across three models.

### 12.1 Adversarial findings (against the plan commits)

Only Finding 5 is about the plan commits; findings 1–4 and 6 are against prior session commits in the same `origin/main..HEAD` range and are covered by their own dispositions in earlier audit reports.

| Finding | Severity | Disposition |
|---|---|---|
| F5 — `c9df21f9` §11 verification log used narrative file:line citations instead of the formal claim-evidence TABLE that v1.8.2 §"Required Artifact" mandates | LOW | **Fixed.** §11 above is now formatted as three tables (wheat, chaff, missed-by-external-review) per v1.8.2. Each row cites a specific artifact (file:line or command + output) |
| F1, F2, F3, F4, F6 — against prior commits (`b3523629`, `5e0f9dad`, `2f772b01`, `679eec27`, `63930dc3`) | HIGH / MEDIUM | **Out of this plan's scope.** Dispositions belong to the sessions that authored those commits; tracked in their own audit-report dispositions |

### 12.2 Orchestra debate — what survived cross-examination

**Multi-model consensus (merged):**

| Item | Models converging | Merge target |
|---|---|---|
| WCAG **2.2 AA, not 2.1** — specifically SC 2.4.11 (Focus Not Obscured) + SC 2.5.8 (Target Size ≥ 24 × 24 CSS px) | Perplexity (cited W3C spec), Grok (confirmed in verifications) | §3.7 |
| Chart colorblind audit → **Phase 1, not Phase 2** (~8 % of male population affected) | Perplexity, Grok, GPT (all three confirmed) | §5.2 Sensory load |
| Motor disabilities deserve **explicit treatment beyond AT** (target size, keyboard, hover-not-required, drag alternatives) | GPT proposed, Grok confirmed | §3.7 |
| Low-bandwidth context needs **concrete metrics**, not just a label (page weight, lazy-load, JS defer) | Perplexity proposed, Grok confirmed | §3.9 |
| Define "working" with **measurable post-launch dimensions** (direction, not p-values) | Grok proposed | §7.1 (new) |

**Single-model proposals (rejected after cross-examination):**

| Item | Model | Reason rejected |
|---|---|---|
| Reorganize §3 by merging cognitive / sensory / neurodivergence into one "User Cognitive Profile" | GPT | Grok correctly challenged as "bureaucratic reshuffling without user-outcome evidence"; rejected |
| "Executive Function Scaffolds" claiming "63 % reduction in real-time decision fatigue" | Perplexity | Specific 63 % number has no citation, smells fabricated; the underlying concept (step-completion signifiers, failure buffers) is reasonable but applies more to port pages than calculators — deferred as a sibling plan |
| Language / translation toggle as new §3 dimension | Grok | Real audience question but adds significant scope; not load-bearing for Phase 1; defer |
| Offline-first Service Worker for port data | Perplexity | Site already runs SW v14.3.0 with the existing PWA caching strategy; this overlaps prior work, not framework-defining |
| WCAG 2.2 as "regulatory mandate" framing | Perplexity | Grok correctly pushed back: no regulation cited. WCAG 2.2 is adopted because it's the current standard, not because of legal pressure |

**Debate pushed back on the pilot choice.** GPT and Grok both suggested **first-cruise.html** (First-Timer persona, higher-stakes). Perplexity suggested **port-page-template** (387 pages, scale leverage). All three challenged drink-calculator.html as low-leverage relative to alternatives.

**Disposition:** the user chose drink-calculator.html in an earlier AskUserQuestion. The debate is logged here as a flagged dissent. The pilot stays on drink-calculator.html unless the user reopens that decision. Adopting the framework on first-cruise.html or port-page-template after Phase 1 lands is a natural follow-on plan; rejecting the user's prior decision unilaterally would be clever-not-careful.

---

*Soli Deo Gloria — careful, not clever.*
