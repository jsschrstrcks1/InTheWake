# Review Log — Homepage Redesign Spec (indexbeta1/2/3)

**Date:** 2026-06-06
**Reviews of:** `.claude/plans/indexbeta-redesign-design.md`
**Status:** Stored per request. Captures external multi-LLM review + keeper baseline-persona board so the conclusions survive outside the chat transcript.

> Note: the keeper-persona review below was run by embodying the baseline personas (the `keeper review` command is a spike and not wired to make model calls; no Anthropic key in the orchestrator). The protocol intends "each persona is a separate Claude call." This is NOT the advisory board the user ultimately wanted — that board is still being located — but the result is recorded here because it is useful.

---

## A. Multi-LLM advisory panel (consult)

Cost ≈ $0.02. Grok unavailable (invalid `XAI_API_KEY` in the committed seed — known issue); Perplexity took the challenger seat.

| Member | Strongest direction | Notable position |
|---|---|---|
| **GPT** (gpt-4o) | Charthouse | Returning cruiser → dedicated landing. Each prototype invents its own nav. Group directory by intent. |
| **Gemini** (gemini-2.5-flash) | **Aft Deck** | Lead with the buried wake metaphor. ONE shared nav (else the test is confounded). Flagged mobile-first + search as blind spots. |
| **Challenger** (Perplexity seat) | Modified Charthouse | **Challenged the "New vs. experienced" binary** — users self-identify by current problem, not history. Proposed an intent bar + "density gradient" below fold. |

**The panel split on the winner** (Charthouse / Aft Deck / Charthouse). Unanimous only on: returning cruiser → dedicated landing page.

---

## B. Orchestra debate (fan-out + deliberation)

Cost $0.1365. Grounded against Nielsen Norman Group homepage/IA guidance via the web-search leg.

**Converged:** Charthouse is the "winner to beat" — but as a *merge*: Charthouse structure + Aft Deck full-bleed wake photo & motto + Quiet Harbor discipline. Brief's core (one idea/feeling above the fold; grief as one note) confirmed.

**Three challenges to the brief:**
1. **Search is underweighted** — make it a visible secondary across all three contenders, not just Charthouse.
2. **The experience binary is suspect** — people self-identify by current problem, not history.
3. **"Move the directory down as-is" is too weak** — authorize ruthless de-duplication; below-fold must be **task-based, not audience-based** (NN/g flags audience doorways as an anti-pattern — indicting the current "Planning for…" section).

**Resolved open decisions (consensus):**
- **#1 Returning cruiser →** dedicated returning-cruiser landing ("what's next" hub). Unanimous.
- **#3 Below-fold →** ~3–4 task zones: (1) Plan your first cruise · (2) Compare ships & itineraries · (3) Money, logistics & fine print · (4) Tools & deep dives (optional). Audience labels become filters within sections, never top-level doorways.
- **#4 Winner criteria →** behavioral, not aesthetic: ≥80% of testers can state what the site is for + what to click first within ~5–10s; time-to-primary-path; findability of representative tasks; "I feel calm / not sold to" rating; reduced-motion + screen-reader access to the primary path.
- **#2 Nav →** split verdict (each-own-during-exploration-then-standardize vs. one-shared). Unresolved.

---

## C. Keeper baseline-persona board (5 members)

Verdict: **revise the spec before building.** Single highest-aggregate comment per persona:

- **Skeptic:** §4 fixes the wake photo as a constant across all three, making the most consequential visual choice the one variable never tested. A 5-second "what is this site for?" test of the bare photo would settle whether the anchor holds before three pages are built on it.
- **Architect:** §5 lets each contender invent its own nav, but nav is a sitewide artifact on the shared (off-limits) `styles.css`, and §7 puts other pages out of scope — so the winning nav is unshippable without the forbidden sitewide change. Freeze one nav across betas; spec the nav redesign separately.
- **Future-Self:** the spec lists "five open decisions" but doesn't record that a board + orchestra already answered them — that review lives only in chat. Add a Decisions Log. *(This file is that log.)*
- **Content-Quality:** "Care lives in the bones" (§2) is a metaphor where a checkable rule belongs. Rewrite as: every contender must pass WCAG 2.1 AA + the like-a-human voice check, and none may use the grief excerpt as an above-the-fold hook.
- **User-Experience:** the "New to cruising / I've sailed before" binary assumes self-classification by history; the "everyone" audience includes the cruised-before-but-new-to-this-line case that fits neither door. Test an intent-led entry against the binary.

---

## D. Net actions for the spec (not yet applied)

1. Add this Decisions Log reference to the spec §8; mark #1, #3, #4 resolved.
2. Freeze nav across all three betas; move nav redesign to its own spec.
3. Add search as a visible secondary across all three contenders.
4. Reframe below-fold zones as task-based (kill audience doorways).
5. Replace "care in the bones" with the testable rule.
6. Record the binary-vs-intent-led entry as an explicit A/B experiment.
7. Move winner-criteria up front, behavioral form.

**Two forks still need the user's call:** (a) search-as-secondary everywhere (lean: yes); (b) keep the binary, replace with intent-led, or test both (lean: test both).

---

## E. Boardroom (ken `boardroom` skill — the real advisory board)

Five built personas, grouped by department. Round 1 = Claude (embodied); Round 2 = cross-vendor (Gemini/GPT; Grok key invalid). All verdicts `consensus`, cross-vendor. Cost ≈ $0.02. Note: external vendors got a paraphrased lens, not the private profile — faithful approximation, not the exact skill pipeline.

- **Engineer-Founder** (requirement deletion): delete before optimizing — kill the redundant doorways and the binary before building; three prototypes / "directory survives" under-delete. *high.*
- **Systems Maintainer** (backward-compat as contract): nav is a contract across 1,241 pages on the off-limits `styles.css`; a per-beta nav is un-shippable, and beta files proliferate without a promote/delete contract. *high.*
- **Frontend Performance Engineer** (runtime/perf): no perf budget; full-bleed hero is an LCP risk without srcset/dimensions/preload; three stylesheets drift without a token layer. *high.*
- **Positioning Sage** (differentiation): "everyone is the audience" is the anti-position; the underserved-but-cared-for tribe is the only defensible differentiation. *high.* (Within-persona divergence: care as **the position** vs. care as a **risk to segment away**.)
- **Performance Coach** (execution): scope is a program, not a task; this repo's unfinished-work pattern predicts a stall; ship the 80/20. *high.*

**Chair tension surfaced:** board pushed "delete to one" vs. operator's "let them compete."

### Resolution (operator decisions, 2026-06-06)
- **Keep three** (D4) — overrides "delete to one"; board's delete-first + perf-budget findings now apply *within* each beta.
- **Felt-nav** (D6) — fully resolves the Systems Maintainer finding (beta nav is a design element, not a contract).
- **Per-designer authority + per-beta positioning** (D7) — resolves the Positioning Sage "everyone" challenge by making audience a per-beta experiment; the "five deletions" become each designer's call.

Superseded design spec: `indexbeta-redesign-design.md` **v2**.

**Roster update (2026-06-06):** boardroom re-fetched — now **7 built personas**. Two added since the review above: **the Restraint Designer** (Design panel — the design-critique lens the board lacked when this review ran) and **the Offline-Caching Architect** (PWA panel). Both are now available as per-beta lifelines (spec §13).

**Roster update 2 (2026-06-06, post-merge):** all **14 personas now built** — the merge landed a full **Design panel (8 lenses):** Restraint Designer, Minimalist, Simplicity Maximalist, Moments Designer, Interaction-Polish Engineer, Canvas Interactionist, CSS Artist, Immersive-Experience Artist. The design bench now maps onto the three theses (spec §13). The earlier boardroom review (section E) predates the Design panel; if re-run, the design lenses would add the critique that section E's technical/business panel could not.

---

## F. Design jury — judge phase (2026-06-07)

Five jurors, blind to standings, comparative vote over all three betas on the five behavioral criteria: Restraint Designer, Interaction-Polish Engineer, Simplicity Maximalist, Frontend Performance Engineer, Positioning Sage. (Cost ≈ $0.02.)

**Result: Quiet Harbor (beta1) ranked #1 — unanimous, 5/5.** Second place split: Aft Deck 2nd by Simplicity-Max + Positioning Sage; Charthouse 2nd by Restraint Designer.

- **Deciding factor (consensus):** calm + low cognitive load + first-paint clarity for the vulnerable-among-everyone audience. Quiet Harbor gets out of the way.
- **Disqualifiers raised:** Aft Deck — dark theme + scrim + engineered reveal + motion = cognitive load / "oppressive" for vulnerable readers (Restraint Designer). Charthouse — the in-hero search box is a *second competing primary action*, and the rail counts induce comparison/choice anxiety = "travel-agent, not guide" (Simplicity Maximalist **and** Positioning Sage, two DQs).
- **Quiet Harbor's one weakness (consensus):** remarkability / "would they tell a friend" — several jurors warned it risks reading "too plain." Convergent fixes: give the path-finder a touch more visual affordance (understated buttons), and commit to an audience.
- **Audience carryover confirmed:** Positioning Sage — *all three* fail to commit ("everyone is the anti-position"); Quiet Harbor is the best *foundation* because it has the least noise to strip when the audience is finally named.
- **Recommended splice:** Quiet Harbor's calm foundation + Aft Deck's single engineered wake+motto moment — fixes Q's only weakness (remarkability) with A's only strength.

**Operator divergence (surfaced, not resolved):** the operator's gut favored Aft Deck (wonder / the horizon); the blind jury favored Quiet Harbor (calm / restraint for the vulnerable). This is the original Comeau-vs-Rams tension resolving on the page. The jury informs; the operator decides.


## G. Full board vote (16 members, blind, 2026-06-07)

Tally: **Quiet Harbor 10 · Charthouse 4 · Aft Deck 2.**
- **Q (10):** every calm / clarity / restraint / performance / typography / maintainability lens (the 5 jury + Minimalist, Typographic UI, Native-CSS, Systems Maintainer, Performance Coach).
- **C (4):** the task-clarity / efficiency lenses — Moments Designer, Canvas Interactionist, Engineer-Founder, Offline-Caching Architect (they reward the integrated above-the-fold action; most of them also DQ A for motion).
- **A (2):** only the two most expressive lenses — CSS Artist, Immersive-Experience Artist (they prize A's emotional craft).

**Three wounds (the consensus critiques):**
- **A** — dark theme + motion = cognitive load for the vulnerable; *most-disqualified* candidate (Restraint, Canvas, Engineer-Founder, Offline-Caching, Minimalist, Moments).
- **C** — the in-hero search is a *second competing primary action*; rail counts induce comparison anxiety = "travel-agent, not guide" (Simplicity-Max, CSS Artist, Immersive, Systems Maintainer, Performance Coach, Positioning Sage).
- **Q** — remarkability / weak path-finder affordance (underlined type). Even Q's champions name this.

**Board's emergent recommendation (beyond the vote):** ship **Q**; give the path-finder real button affordance (Restraint, Systems Maintainer) + bump the type scale a step (Typographic); and **splice ONE subtle, fast (<1s), reduced-motion-safe wake+motto reveal from A** (Performance Coach, Native-CSS) to cure Q's only weakness with A's only strength. The audience commitment ("everyone is the anti-position") remains upstream and unresolved (Positioning Sage).

**Operator note:** Aft Deck — the operator's gut pick — drew only 2 votes and the most disqualifiers, but those 2 are precisely the *craft-of-feeling* lenses that value what the operator values. The instinct has real backing; it is simply outweighted, for *this* audience, by the calm/clarity majority.

## H. beta4 synthesis — board design (2026-06-07)

Six-persona panel (Simplicity Maximalist, Moments Designer, Restraint Designer, Interaction-Polish Engineer, Positioning Sage, Frontend Performance Engineer) asked: best feature to KEEP from each beta, what to CHANGE, how to COMBINE into a beta4.

**KEEP (consensus):**
- **From Q:** ruthless reduction + one serif + large type on a 64ch measure — the calm, legible foundation. (6/6)
- **From A:** the motto-as-large-H1 hero *moment* + ONE subtle CSS-only "breathe," gated behind prefers-reduced-motion. (5/6; **Restraint Designer dissents** — drop all motion even gated, "static calm is paramount.")
- **From C:** the directory ordered into three numbered task zones (Plan / Compare / Money-logistics). (6/6)

**CHANGE / DROP (consensus):** drop the duck; drop the in-hero search (4/6 — **Positioning Sage dissents**, keep a *quiet* search as a secondary affordance, not in the hero); move the rail counts off the homepage to the footer/about; replace Q's gold-rope path-finder border with a plain, clear **button** affordance (keep the affordance, drop the decoration).

**Two live splits:** (1) **motion** — one subtle gated breathe vs none at all (Restraint); (2) **vibrancy** — the board leans "rein in the accents," but the **operator's explicit directive is vibrant** → operator wins; beta4 keeps the vibrant hero + one decisive accent, used with discipline.

**beta4 concept:** Quiet Harbor's reduction and 64ch typographic calm as the floor; a near-full-bleed *vibrant* wake hero carrying the motto as the one engineered moment (light legibility scrim, one subtle gated breathe, no scroll-reveals); the two-door path-finder as clear restrained buttons; below, the three numbered task zones and a single logbook line; search and counts demoted. Audience ("everyone" vs the vulnerable-but-everyone tribe) remains the operator's open call.

