# Design Spec v2 — Homepage Redesign (indexbeta1/2/3)

**Branch:** `claude/optimistic-mccarthy-eEEnz`
**Date:** 2026-06-06
**Status:** Approved direction. **Planning only — no beta HTML/CSS until the per-beta build is greenlit.**
**Supersedes:** v1 (the fixed shared-bones spec). v1 framed three skins of one edit; v2 makes three autonomous design theses.

> Soli Deo Gloria. Redesigns the homepage *experience* only. `index.html` and `assets/css/styles.css` are never touched. Three competing betas are built side by side; one (or a splice) is later promoted by explicit user decision.

---

## 1. Why this exists

A four-voice design critique (Rams, Ive, Freiberg, Comeau), ground-truthed against `index.html` (921 lines), found the live homepage is "a sitemap with paragraphs": **six** planning entry surfaces plus a seventh wayfinder, **eleven** equal-weight cards (no focal point), **three** parallel navigation systems, and the site's strongest asset — the wake-at-sunrise photograph — buried as a social thumbnail while the hero opens with a logo + compass SVG. Subsequent external review (multi-LLM panel, orchestra, and the `ken` boardroom) is recorded in `indexbeta-redesign-review-log.md`.

---

## 2. The model: three autonomous design theses

This is a bake-off, not a template. **Each beta is governed by one designer's philosophy, and that philosophy has full editorial authority** over the page. Within the hard floor (§3), each designer freely decides:

- what to **cut, keep, or transform** from the existing page inventory (§6);
- the **primary action** (experience binary / intent bar / search / none);
- the **positioning and audience framing** (e.g., "everyone" vs. a specific underserved tribe — the Positioning Sage's open challenge is answered *per beta*, not globally);
- **hero treatment, motion, rhythm, layout, voice** — the whole feel.

The shared goal — the only design intent all three serve — is to **fix the no-focal-point problem: give the page one idea and one feeling.** How each interprets that is theirs.

**Comparability** comes from three constants, not from sameness: same problem, same raw material (§6), same hard floor (§3). Maximally different designs are compared on *outcomes* (§7), not adherence to a spec.

---

## 3. Hard constraints (the ONLY non-negotiables)

Everything not on this list is a designer's free choice.

**Integrity / care floor**
- WCAG 2.1 AA; `prefers-reduced-motion` honored; no autoplay; color never the only signal.
- No core-performance regression vs. the current page (a felt budget, not a number to game: the hero photo carries `srcset` + dimensions; LCP must not get worse).
- SDG comment before line 20 (invisible; immutable).
- Pastoral guardrails bind any use of grief/loss content: never a hook, never flattened. A designer may omit it entirely; a designer may not exploit it.
- WebP-only images; absolute HTTPS; no placeholder images.

**Resources** — use existing assets only (§4); no new photography or content sourced.

**File rules**
- Lands in `indexbeta1/2/3.html`, each with its own `stylesbeta1/2/3.css`. No inline `style=`.
- `index.html` / `styles.css` are read-only reference, never edited.
- `noindex` + unlinked from nav and `sitemap.xml` until promotion.
- Existing JS reused read-only; beta-twinned only if changed.
- **Felt-nav permitted:** a beta's nav need not link anywhere — it may exist purely as a felt design element. (The "Cruise Lines stays reachable" production contract re-binds only at promotion, when the felt nav is swapped for the real one.)

---

## 4. Resources (existing only)

- **Hero (confirmed by eye):** `assets/social/home-hero.jpg` — a ship's wake trailing to dawn on the horizon. The site metaphor, literally. Convert to WebP as a beta asset.
- **Photo pool:** `sisters-at-sea.jpg`, `bliss-alaska-solo-group-2026.webp`, Flickers originals in `/images/`, port/article WebPs.
- **Reusable content:** the wake motto, the "From the Logbook" grief excerpt, the author card, recent-stories rail, the tool list.
- **DO NOT USE:** the `*-hero.jpg` family (all exactly 127,521 bytes — one placeholder under many names). Eyeball every below-fold image before use. (Pre-existing issue; logged, not fixed here.)

---

## 5. The three theses

Each line below is the *expected* editorial instinct of the philosophy — **not a mandate.** The designer decides.

- **beta1 · Quiet Harbor (Rams / Ive)** — ruthless reduction. Likely keeps only the wake hero, one sentence, one action, a spare plain-text directory, and (Ive's "meaning over minimalism") one quiet line of the logbook. Likely cuts almost everything else. May keep "everyone" as the frame.
- **beta2 · Aft Deck (Freiberg / Comeau)** — feel and motion. Likely keeps and amplifies the full-bleed wake hero, the motto as *the* moment, the grief logbook, a delightful detail (the duck, reimagined), recent stories as scroll-revealed moments. Likely cuts every flat utilitarian card. May lean into the underserved-but-cared-for tribe.
- **beta3 · Charthouse (synthesis)** — structured editor. Likely keeps a path-finder inside the hero, quiet search, a consolidated task-zone directory, the logbook as one note, a trimmed rail.

---

## 6. The raw material (page inventory each designer edits)

From `index.html`: hero (logo/compass `:350`) · "Welcome aboard" + motto + narrative (`:366`) · intent selector (`:391`) · "New to Cruising?" callout (`:434`) · grief logbook excerpt (`:441`) · "Planning Tools" (`:454`) · "Planning for…" audience doorways (`:517`) · explore grid: Ships/Ports/Restaurants/Travel/Planning/About (`:543`) · duck easter-egg (`:604`) · FAQ (`:636`) · "Works Offline" (`:666`) · rail: Site Highlights / Find What You Need / Author / Recent Stories / Authors (`:677`+). Each designer keeps, cuts, or transforms any of these.

---

## 7. How we judge (the one shared yardstick)

Because the three diverge by design, they are judged on **outcomes, not template adherence** (behavioral, per the orchestra + boardroom):
1. **Task clarity on first paint** — ≥80% of testers can say what the site is for + what to click first within ~5–10s.
2. **Time-to-primary-path** — median time to the first meaningful action; few backtracks.
3. **Calm / honesty** — testers rate "I feel calm, not sold to."
4. **Would they tell a friend** — the Positioning Sage's remarkability test.
5. **Accessibility + performance** — reduced-motion + screen-reader reach the primary action; no LCP regression.

Then: pick a winner or splice the best moments. Promotion to `index.html` is a separate, explicit user decision — out of scope here.

---

## 8. Out of scope

Editing `index.html` or any live file · promotion/cutover of any beta · fixing the 127,521-byte placeholder duplication · any page but the homepage.

---

## 9. Decisions Log (operator decisions + how they resolved review findings)

| # | Decision | Resolves |
|---|---|---|
| D1 | Audience = everyone; care is the floor, grief one note. **(Later reopened per-beta — see D7.)** | initial brief |
| D2 | Don't touch originals; new work is `…beta` named. | file safety |
| D3 | Dedicated `stylesbetaN.css` per beta (no inline styles). | clean redesign |
| D4 | Build **three** competing betas, judge by outcomes. | overrides board's "delete to one" (EF, Perf Coach) |
| D5 | Use existing resources only; wake-at-sunrise photo is the hero. | resource constraint |
| D6 | **Felt-nav** — beta nav need not link, may exist to be felt. | **fully resolves Systems Maintainer's nav-as-contract / blast-radius finding** |
| D7 | **Per-designer authority over everything** — cuts, primary action, positioning/audience. Maximum freedom. | resolves the Positioning Sage "everyone is anti-position" challenge by making it a per-beta experiment; converts the "five deletions" question into each designer's call |

**Board findings still in force (apply within each beta):** Engineer-Founder "delete first" (each thesis must genuinely reduce) and Frontend Performance Engineer "perf budget" (folded into the §3 floor). Systems Maintainer resolved by D6. Performance Coach's scope warning acknowledged and overridden by D4.

---

## 10. Sources

Rauno Freiberg — [ui.land](https://ui.land/interviews/rauno-freiberg) · Jony Ive — [minimalism to meaning](https://www.designative.info/2025/05/21/jony-ives-design-reckoning-from-minimalism-to-meaning/) · Dieter Rams — [10 principles (IxDF)](https://ixdf.org/literature/article/dieter-rams-10-timeless-commandments-for-good-design) · Josh Comeau — [joshwcomeau.com](https://www.joshwcomeau.com/).
