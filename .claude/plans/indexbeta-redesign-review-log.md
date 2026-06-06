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
