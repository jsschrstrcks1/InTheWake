# Design Spec — Homepage Redesign (indexbeta1/2/3)

**Branch:** `claude/optimistic-mccarthy-eEEnz`
**Date:** 2026-06-06
**Status:** Draft for user review. **Planning only — no beta HTML/CSS created until this spec is approved.**
**Author:** Claude, under careful-not-clever + brainstorming.

> Soli Deo Gloria. This redesigns the homepage *experience* only. It does not touch `index.html`, `assets/css/styles.css`, or any live file. Three competing betas are built side by side; one (or a splice of the best) is later promoted by explicit user decision.

---

## 1. Why this exists

A four-voice design critique (approximated from the published philosophies of Dieter Rams, Jony Ive, Rauno Freiberg, and Josh Comeau) was run against the live homepage. Ground-truthed against `index.html` (921 lines), the core findings hold:

- **The homepage explains "planning" six times.** Distinct, overlapping planning entry surfaces: top-nav Planning dropdown (`index.html:286`), "What are you planning?" intent selector (`:391`), "New to Cruising?" callout (`:434`), "Planning Tools" section (`:454`), "Planning for…" audience doorways (`:517`), and the explore-grid "Planning" card (`:585`) — plus a seventh wayfinder in the rail, "Find What You Need" (`:690`).
- **Eleven stacked cards of near-equal visual weight** in the left column → flat rhythm, no focal point, "a sitemap with paragraphs."
- **Three parallel navigation systems** on one screen (top nav, intent selector, explore grid).
- **The strongest emotional asset is buried.** The wake-at-sunrise photograph (`assets/social/home-hero.jpg`) — the literal site metaphor — is used only as a social-share thumbnail. The live hero opens with a wordmark logo + compass SVG.

What the critics converge on: demolish the redundancy, establish one focal point, reduce. Where they split: Rams → honest utility; Ive → focused meaning; Freiberg → soul/feel via the real-world metaphor; Comeau → a led eye + one delightful moment. (Sources in §9.)

### Audience reframing (decided with user)

The repo's `PASTORAL_GUARDRAILS.md:13` describes readers as "tired, grieving, anxious, disabled." That is a **standard of care, not an audience definition.** The audience is **everyone planning a cruise.** Care lives in the *bones* (honest copy, real accessibility, no hype) — not on the front cover. The grief content stays, as **one honest note**, never the thesis. Curb-cut logic: designing so the page never fails the person having the worst day is the same as designing so it works calmly for everyone on an ordinary day.

---

## 2. The brief (the one thing all three betas share)

> **One idea and one feeling above the fold; the directory survives but moves below it.**

- The page answers a single question on first paint: *"Can you help me plan my cruise?" → yes, start here.*
- One photograph carries the feeling. One action carries the intent. Everything else is demoted, not deleted.
- **The only things the three contenders share are this brief and the hero asset pool.** Structure — nav included — is each contender's to invent. This keeps the competition honest.

---

## 3. Constraints

### Integrity / care floor (constant across all betas — not redesignable)

| Floor item | Source |
|---|---|
| WCAG 2.1 AA; `prefers-reduced-motion` honored; no autoplay; color never the only signal | accessibility-audit skill; cognitive-load plan §3.5 |
| SDG comment before line 20 (invisible HTML comment; theological/immutable) | claude.md; PASTORAL_GUARDRAILS.md |
| WebP-only images; absolute HTTPS; no placeholder images | claude.md never-do rules |
| "Cruise Lines" remains *reachable* in primary nav (may be nested, not necessarily top-level) | claude.md never-do rules |
| Honest, calm, concrete voice; no marketing hype | like-a-human; PASTORAL_GUARDRAILS.md |
| ICP-2 / ICP-Lite metas present | ONBOARDING.md |

### Everything else is open

Per user directive "no element is above re-design": nav, logo/compass lockup, right-side rail, card grid, section order, hero composition — all redesign variables. Contenders may navigate differently from each other.

### Working rules (file safety)

- `index.html` and `assets/css/styles.css` are **read-only reference**. Never edited.
- New work lands in `indexbeta1.html`, `indexbeta2.html`, `indexbeta3.html`, each with its own `stylesbeta1.css` / `stylesbeta2.css` / `stylesbeta3.css`.
- **No inline `style=` attributes** (repo P0 is eliminating ~19,513 of them; betas don't add more).
- Any other file we'd modify gets a `…beta` twin instead. New assets (e.g. a converted hero WebP) carry a `beta` marker and stay grouped for easy promotion/deletion.
- Betas are `noindex` and **unlinked from nav and `sitemap.xml`** until promotion.
- Existing JS reused **read-only**; beta-twinned only if a script must change.

---

## 4. Resources (use existing only — no new photography)

- **Hero (confirmed by eye, not filename):** `assets/social/home-hero.jpg` — a ship's wake trailing from the bottom of the frame to dawn light on the horizon. The site metaphor, literally. Converted to WebP as a beta asset for page use; existing pixels.
- **Real photography pool:** `assets/social/sisters-at-sea.jpg`, `bliss-alaska-solo-group-2026.webp`, the Flickers originals in `/images/` (e.g. `IMG_7646–7648.jpeg`, `Nassau-royal-beach-club-FOM-1.jpeg`), port/article WebPs under `assets/articles/` and `images/ports/`.
- **Reused content blocks:** the wake motto, the "From the Logbook" grief excerpt (penguin/Tom), the author card (Ken Baker), the recent-stories rail, the existing tool list.
- **DO NOT USE — placeholder caution (verification discipline):** the `*-hero.jpg` family (`about-hero`, `dining-hero`, `planning-hero`, `ports-hero`, `tools-hero`, `in-the-wake-of-grief.jpg`, others) are all *exactly* 127,521 bytes — one placeholder duplicated under many names. Every below-fold image is eyeballed before use. (Pre-existing issue; logged, not fixed here.)

---

## 5. The three contenders

Each is one design philosophy pushed to its strongest form. Two poles and a synthesis.

### beta1 — "Quiet Harbor" · Rams + Ive (ruthless reduction)
- **Hero:** the wake photo, calm and restrained. Tiny wordmark, one honest sentence, one action. Almost nothing else above the fold.
- **Action:** the path-finder alone — *New to cruising* / *I've sailed before*.
- **Below fold:** a short, honest directory as plain text links, not cards. No FAQ pile, no segmented audience doorways, no duck.
- **Nav:** pared to the minimum that keeps Cruise Lines reachable.
- **Wins on:** useful, unobtrusive, "as little design as possible"; "what *is* it?"
- **Risk:** could feel *too* bare — under-sells how deep the content runs.

### beta2 — "Aft Deck" · Rauno + Comeau (feel & motion)
- **Hero:** full-bleed cinematic wake photo. The motto as *the* moment ("The calmest water lies in the wake of another boat"). Restrained, reduced-motion-safe movement. One delightful detail (the wake, or the duck reimagined).
- **Action:** same path-finder, presented tactile and invitingly revealed.
- **Below fold:** content arrives with visual moments as you scroll — not flat cards.
- **Nav:** can be minimal/overlay so it doesn't compete with the photograph.
- **Wins on:** soul, real-world metaphor, focal point + delight, "where is the horizon?"
- **Risk:** feel is the hardest to nail; watch style-over-substance, performance, a11y.

### beta3 — "Charthouse" · the synthesis (balanced)
- **Hero:** photo-led, but the path-finder sits *inside* the hero, visible without scrolling (the Rams correction: the image frames the action, it doesn't delay it). Search as a quiet secondary.
- **Below fold:** the directory survives, consolidated into ~3 tidy zones (Plan · Onboard · Explore) reusing existing content; the grief excerpt as one honest note.
- **Nav:** a single cleaned-up wayfinder, no in-page duplicates.
- **Wins on:** the convergence of all four — the safe strong contender.
- **Risk:** "balanced" can slide into "compromise" and dull both the reduction and the feeling.

---

## 6. How we judge (Freiberg's method)

Build all three. Capture screenshots / share the files. Judge by *feel* against the four design lenses **and** the integrity/care floor. Then either pick a winner or splice the best moments into a single promotion candidate. Promotion to `index.html` is a separate, explicit user decision — out of scope for this spec.

---

## 7. Out of scope

- Editing `index.html` or any live file.
- Promotion / cutover of any beta to production.
- Fixing the pre-existing 127,521-byte placeholder-image duplication.
- Redesign of any page other than the homepage.

---

## 8. Open decisions (need user input before or during the implementation plan)

1. **Path-finder destinations.** *New to cruising* → `/first-cruise.html` is obvious. *I've sailed before* → where? (Ships hub? Search? A returning-cruiser landing?) — proposal needed.
2. **Hero sentence / motto copy** per contender (will pass voice-audit before shipping).
3. **Below-fold zone contents** for the directory (which existing destinations, in what grouping).
4. **Nav treatment** — do all three share one redesigned nav, or does each invent its own? (Brief allows divergence.)
5. **Promotion criteria** — what "winning" means concretely, so the judging in §6 isn't purely subjective.

---

## 9. Sources (design-critique research)

- Rauno Freiberg — [ui.land interview](https://ui.land/interviews/rauno-freiberg), [rauno.me](https://rauno.me/)
- Jony Ive — [from minimalism to meaning (designative)](https://www.designative.info/2025/05/21/jony-ives-design-reckoning-from-minimalism-to-meaning/), [interview quotes (alvinalexander)](https://alvinalexander.com/design/jonathan-ive-ives-design-interview-quotes-apple/)
- Dieter Rams — [10 principles (IxDF)](https://ixdf.org/literature/article/dieter-rams-10-timeless-commandments-for-good-design)
- Josh Comeau — [joshwcomeau.com](https://www.joshwcomeau.com/)
