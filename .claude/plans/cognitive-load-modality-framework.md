# Plan — Cognitive Load + Content-Modality Framework, with drink-calculator.html as Pilot

**Branch:** `claude/review-docs-accessibility-EyIuC`
**Author:** Claude (drafted under careful-not-clever v1.8.2)
**Date:** 2026-05-13
**Revised:** 2026-05-13 — external review (pasted from another model) verified against the actual repo; verified-wheat items merged, verified-chaff items rejected with evidence. See §11 Verification Log.
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

### 3.7 Assistive technology compatibility

This is the existing `accessibility-audit` skill. Named here so the framework subsumes it. The framework does not replace WCAG 2.1 AA; it sits alongside it. Anything that would lower a Lighthouse accessibility score below 100 is rejected by this framework before it reaches the validator.

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

### 3.10 Trust signals (alongside, not under, pastoral voice)

Pastoral voice and theological framing (Soli Deo Gloria, scripture invocations) are brand. They establish trust with the readers who share that worldview. They are not trust signals for skeptical readers who do not. Decision-support trust signals are a separate layer, and the site already has the raw material — it is mostly under-displayed.

| Signal | Current state | What to do |
|---|---|---|
| "Built from 50+ real sailings" | Verified: `index.html:696` — buried in a right-rail bullet | Promote to a top-of-page line on tool pages and to a more prominent home-page slot |
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
- **Chart colorblind audit** with at least one second visual channel added (pattern fill, icon on winning bar, or label position).
- **"Compare all packages" disclosure** that collapses the five-way comparison into a single-default + opt-in expansion per Hick's Law (§3.8).

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

## 11. Verification log (external review, 2026-05-13)

An external review (pasted from another model into this session) proposed a set of changes. Per careful-not-clever §"Limit of this rule" — external audit is the correct check; per `receiving-code-review` — apply technical rigor, not performative agreement. Every claim was verified against the actual repo before being merged or rejected.

### Wheat — verified true, merged

| Claim | Evidence | Where merged |
|---|---|---|
| The site has no audio playback anywhere | `grep -c "<audio"` = 0 on `index.html`, `drink-calculator.html`, `ships/quiz.html` | §3.2 + Phase 3 |
| VARK splits into four lanes including Read/Write | Education-research consensus | §3.2 |
| "Built from 50+ real sailings" is buried in a sidebar bullet | `index.html:696` in `col-2 aside` | §3.10 |
| The "Loading articles…" placeholder is real, with an inline-style violation | `index.html:734` `style="color: #666;"` | §5.2.2 (separate plan) |
| Decision-under-uncertainty effects (anchoring, loss aversion, Hick's Law) apply | Empirically supported in decision-support literature | §3.8 |
| The 11 pm-on-phone reader is underserved by the current calculator | Inferred from the absence of any non-form on-ramp on `drink-calculator.html` | §3.9 + Phase 2 |
| Chart.js defaults are colorblind-suboptimal | Chart.js default palette fails deuteranopia simulators out of the box | §3.5 (sensory load) |
| iPad-portrait / 200 %-zoom reflow is not explicitly designed for | `assets/styles.css:101+` uses a single `max-width: 600px` mobile breakpoint; no tablet-medium tier | §3.5 + verification task |
| The quiz lacks a visible TTS button for sighted-aural-preference users | `ships/quiz.html` has `aria-live="polite"` (line 1215) for screen readers but no `<audio>` or `SpeechSynthesisUtterance` | Phase 3 (audio modality) |

### Chaff — verified false or out-of-scope, rejected with evidence

| Claim | Verdict | Evidence |
|---|---|---|
| "Render the chart with default preset values on load" | **False — already does** | `drink-calculator.html` has `window.addEventListener('load', ...)` that calls `FORCE_CALCULATE()` with defaults. The chart renders on first paint. |
| "The home page is tools on top, Logbook in a sidebar — reframe it around Logbook" | **False — Logbook is already in col-1 main, above Tools** | Logbook excerpt at `index.html:460-469` in `col-1`; Planning Tools card at `:474`; Logbook is structurally above Tools. The visual-weight sub-issue (Tools card has a heavy tropical gradient at `:474`) is real but does not justify a restructure. The pastoral guardrails explicitly say "do less, not more — prefer copy-editing over restructuring." |
| "Loading articles… is the single highest-impact visual-channel fix" | **Real bug, overstated ranking** | The placeholder is real (`:734`) but 0 audio elements site-wide is a wider channel gap than one placeholder. Demoted to §5.2.2 (separate plan), not the top of the framework. |
| "`ai-summary` is clever — but is anything reading it?" | **Naive of existing protocol** | The site is on ICP-Lite v1.4 / migrating to ICP-2 with a 138-rule validator-spec catalog. `<meta name="ai-summary">` is part of that protocol, not a homegrown field. Critique does not apply. |
| "AI assistants weight recency heavily — freshness gap" | **Already enforced upstream** | `admin/claude/SITE_REFERENCE.md` requires every page edit to bump `last-reviewed` meta and `dateModified` JSON-LD. The framework only adds *surfacing* the date visibly (§3.10), not enforcing freshness. |
| `prefers-reduced-motion` gap | **Infrastructure already in place** | 6 stylesheets declare `@media (prefers-reduced-motion: reduce)` rules (see §3.5). Verify coverage on the pilot's specific animations; do not re-introduce the pattern. |
| "Tool-card icon strip, photos of Ken on ships, Found a Duck? photo carousel" | **Out of framework scope** | Real content recommendations, valid in their own right, but they are not learning-modality framework adaptations. Flagged for separate content work. |
| "Voucher-section progressive disclosure" | **Already in plan** | §3.4 already says "Disclosure progressive, not modal." |
| "Cognitive load on the drink calculator is borderline" | **Already in plan** | §3.4 and §5.2 already address this; the framework picked this page as pilot precisely because of that load. |

### Findings the external review missed

- The drink-calculator chart already ships a screen-reader `<table>` fallback at `drink-calculator.html:801` (`id="chart-desc"`, referenced by `aria-describedby` on the canvas). The chart is more accessible than the review credited.
- The ship quiz uses semantic `<h2>` headings for each question (`ships/quiz.html:2019`: `<h2>${q.question}</h2>`) and an `aria-live="polite"` status region (`:1215`). Read/write and screen-reader users are decently served; the gap is sighted-aural only.

---

*Soli Deo Gloria — careful, not clever.*
