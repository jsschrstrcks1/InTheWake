# Plan — Cognitive Load + Content-Modality Framework, with drink-calculator.html as Pilot

**Branch:** `claude/review-docs-accessibility-EyIuC`
**Author:** Claude (drafted under careful-not-clever v1.8.2)
**Date:** 2026-05-13
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

| Modality | Use when | Format |
|---|---|---|
| Text (canonical) | Always present. The record. | HTML body copy at editorial voice level |
| Plain-language tier | Anxiety, low literacy, ND, first reading | TL;DR card at top, FK Grade ≤ 8 |
| Image / chart / map | The fact is spatial or comparative | WebP image with full alt, or accessible SVG with `<title>` and `<desc>` |
| Short video (≤ 90 s) | Motion or scale matters; demo of a UI | MP4 + WebM, captions, transcript link |
| Audio summary | Eyes-off, driving, low-literacy | MP3 of the plain-language tier, transcript = the plain-language tier itself |
| Numeric / calculator | Question is "how much" or "is it worth it" | The 9 existing interactive tools |

**Rule:** every modality must have a text equivalent reachable without the modality. No video without transcript. No chart without alt + table fallback. No audio without source text. This is not a UX nicety; it's the AT contract.

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
- No autoplay video. No autoplay audio. Ever.
- No parallax on `accessibility.html`, `disability-at-sea.html`, `solo/accessible-cruising.html`, or any logbook entry tagged grief.
- Theme switching (light/dark) does not strobe; if a transition exists, it is ≤ 200 ms and respects reduced-motion.
- Background images do not move. Hero gradients are static.
- Color is never the only signal. Price comparison shows color + icon + label.

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

*Soli Deo Gloria — careful, not clever.*
