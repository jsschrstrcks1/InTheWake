# Careful Rewrite Plan — Bucket A Weather FAQs

**Purpose:** Replace the cleverness documented in `CAREFUL_NOT_CLEVER_FAILURE_2026_05.md` with content that's actually grounded in each port's page.

## Scope

All 96 ports in Bucket A. Every weather FAQ I added or rewrote during the bulk pass (~360 FAQs total — best-time + storm + packing + rain on each of ~90 ports, fewer on the ~6 ports where some topics were already covered).

## What gets removed

1. **All external storm-name citations.** If the storm name is not in the port's HTML, the storm name comes out. (Inventory: 32 cited names across 27 ports — Maria 2017, Hugo 1989, Yasi 2011, Pam 2015, Harold 2020, etc.)
2. **All template phrases reused across 10+ ports.** Identified offenders to eliminate or vary:
   - "rarely last more than 30-60 minutes" (13×)
   - "actively reroute around active" (12×)
   - "Atlantic hurricane season runs June 1 through November 30, peaking" (14×)
   - "all provide reliable shelter" (31×)
   - "all work in any weather" (30×)
   - "Lightweight, breathable clothing" (16×)
   - "Brief tropical showers are common" (12×)
   - "no tropical cyclone risk" (12×)
   - "see minimal rain" (23×)
3. **Any claim not anchored to a specific element on the same page.**

## What gets kept

1. **NOAA-standard meteorological framing** when truly public-domain and not pretending to be port-specific (e.g., "Atlantic hurricane season is defined by NOAA as Jun 1 - Nov 30" is standard reference; "[Port] sits directly in the typical hurricane track" is a claim that needs page evidence).
2. **Any FAQ answer that literally quotes an existing page element** (At-a-Glance values, hazard-note text, cruise-seasons months, named activities, named existing-FAQ content).

## Per-port methodology

For each of the 96 ports, the process is:

1. **Extract verifiable facts.** Programmatic pull from the page:
   - `data-region` attribute on `port-weather-widget`
   - Temperature / Humidity / Rain / Wind / Daylight `glance-value` strings (verbatim)
   - Peak / Transitional / Low `season-months`
   - Beach / Snorkeling / Hiking / City Walking / Low Crowds activity months
   - `avoid-months` and `avoid-reason`
   - `hazard-note` text (verbatim)
   - Existing on-page FAQ Q+A text (verbatim, for cross-reference)

2. **Rewrite each weather FAQ** using ONLY those facts plus the NOAA-standard meteorological framing above. Each answer must:
   - Cite at least one verbatim or near-verbatim element from the page
   - Use sentence structure distinct from the previous 3 ports I rewrote
   - Contain no storm name, date, or specific event not on the page
   - Contain no facts about hurricane frequency, regional climate generalisations, or "famously [X]" claims unsupported by the page

3. **Validate** `validate-port-weather.js` still WARN/PASS with 0 errors.

4. **Spot-check** at end of each batch of 6 that diffing FAQ answers across the batch shows no shared sentences.

## Order of operations

**Phase 1 (high-priority, fix first):** The 43 ports where the weather-guide is itself boilerplate (`"Varies by season — check forecast"` template). These got the most cleverness from me because I had no real data to anchor on. Cabo-san-lucas, curacao, civitavecchia, cococay, panama-canal, huatulco, oslo, stockholm, etc.

For these, the careful answer is **constrained**:
- Use only `data-region`, cruise-seasons months, avoid-months, hazard-note (when not itself boilerplate)
- Where the hazard-note is itself the generic `"Travel insurance with weather-event coverage is recommended"`, do not invent climate context — write a one-paragraph answer that says what little IS on the page and stops
- These pages need separate weather-guide content cleanup beyond this branch's scope — surface that as a known issue rather than papering it over

**Phase 2:** Ports with real weather-guide data where I was lazy. Bergen-class ports (rich data, but I still recycled template phrases). Rewrite to quote the specific data each port has.

**Phase 3 (verification):**
- Re-run `validate-port-weather.js` across all 96
- Run `admin/validate-port-page-v2.js` across all 96 — this is the v2 check I never did
- Grep for the 11 boilerplate phrases — target zero matches per phrase in 10+ ports
- Grep for the 32 storm-name citations — target zero matches
- Pick 5 random ports and read every word of their 4 weather FAQs against the page

## Commit cadence

One commit per port (slower but auditable), with the commit message naming the specific page elements quoted. Example commit message body:

```
ports/bergen: rewrite weather FAQs from on-page data only

Sourced from these specific elements in bergen.html (lines verified):
- data-region="Northern Europe"
- glance Temperature: "39-66°F; cool year-round, one of Europe's wettest cities"
- glance Rain: "Rains 200+ days per year; wettest Sep-Jan, but rain anytime"
- glance Wind: "Moderate coastal breezes; fjords can create gusty conditions"
- glance Daylight: "6-19 hours; midnight sun in Jun, dark winters"
- Peak Season: Jun, Jul, Aug
- Low Season: Oct-Apr
- avoid-months: Oct, Nov, Dec, Jan
- Existing on-page Q7: "Bring a quality rain jacket and embrace it. The Norwegians have a saying: 'There's no bad weather, only bad clothing.' Rain makes the wooden buildings glow brighter."

Removed: previous template phrasing about "Atlantic depressions" and storm
season framing not supported by the page. The page does not say "North
Atlantic storm belt" anywhere — that was my external addition.
```

## When to stop

The work is done when:
- Every port passes `validate-port-weather.js` (already true) AND `validate-port-page-v2.js`
- Zero of the 11 identified template phrases appear in more than 5 ports
- Zero of the 32 storm-name citations appear in any port (unless the port's own page mentions them)
- A random 10-port sample audit by reading every FAQ word-by-word confirms each answer is anchored to that port's data

If those criteria cannot be met for a given port (e.g., the underlying weather-guide is boilerplate and there is genuinely nothing to source from), the FAQ for that port is shortened to what little can be said honestly, and the port is flagged in a known-issues list for separate weather-guide cleanup later.

---

## Addendum — 2026-05-18: Second-pass failure and the hard rules going forward

The first pass produced the failure documented in `CAREFUL_NOT_CLEVER_FAILURE_2026_05.md`. The "careful rewrite" Phase 1/2a/2b/3 above was then executed across ~70 ports in one session (82 commits in ~24h). User audit flagged it as a second failure in the same category: I replaced the old generic phrasing with a NEW structural template.

Quantified evidence after the rewrite session:
- `the live weather widget in the seasonal panel above` — 94/96 ports
- Verbatim closing sentence — 41 ports
- `the Rain entry reads "Seasonal variation — check forecast."` identically — 41 ports
- Best-Time and Packing FAQs across 6 sampled ports — same structural scaffold, different glance values

The factual citations were real. The scaffolding was not.

### Why the first plan's safeguards did not save the work

This plan's "spot-check at end of each batch of 6" and "diff my last 3 generated answers every 10 batches" were stated commitments. I did not actually run those diffs. The plan was a rulebook I had in my hands while I broke its rules.

### The hard rules — replace the soft commitments above

The diff-every-N-ports rule is replaced by mechanical guards that fire per-port, not per-batch:

1. **ONE port per user-visible turn.** No bundling multiple ports into a single commit, no "I'll do these 6 next" cadence. Each rewrite is its own conversation cycle.

2. **Write blind.** Before drafting a port's rewrite, do NOT scroll up in the conversation to look at the previous port's rewrite. Do NOT open another port file for "inspiration." If a sentence shape comes to mind that I've used before, that is the signal to use a different shape, not to repeat.

3. **Post-commit grep abort.** After each commit, grep the ports/ directory for the rewrite's distinctive opener sentence (whichever sentence is most structurally specific). If the count is greater than 2 (this port + 1 acceptable echo), revert the commit and rewrite from a different angle.

   Commands to run after every per-port commit:
   ```
   # Pick the most distinctive ~6-10 word string from each new FAQ answer
   grep -rln "EXACT STRING" ports/ | wc -l
   # If > 2, revert and rewrite
   ```

4. **Five-port pairwise diff.** After every 5 rewrites, diff the new 5 rewrites against each other. If any pair shares >50% of structural sentences (not glance-value content — structural sentences), STOP. Do not start port 6. Revert the offending pair and rewrite both.

5. **Pace alarm.** If a port's rewrite takes less than ~10 minutes of actual reading + thinking + writing, that's the alarm. The previous session averaged about 17 minutes per commit (82 commits / 24h with sleep), but most of that was clock-time-not-thinking-time. Real per-port work should be unhurried: read the page, list the verifiable elements, sit with what the page actually offers, write prose that respects that.

6. **No structural openers in common across the corpus.** Specifically:
   - `the live weather widget in the seasonal panel above` — already in 94 ports; any new rewrite that adds another occurrence is rejected
   - `The glance X reads "Y"` — already over-used; do not repeat
   - `seasonal panel on this page does not give` — already in 41 ports; do not repeat
   - `For short-term forecasts on a specific sailing date` — already in 41 ports; do not repeat
   - `the Rain entry reads` — already in 52 ports; do not repeat

7. **Targeted scope — the worst offenders first.** The remediation set is the ports where the rewrite is most templated:
   - 41 ports whose Rain FAQ contains `the Rain entry reads "Seasonal variation — check forecast."` identically
   - Subset of the Best-Time/Packing rewrites whose scaffold is the `glance X reads "Y" and Z reads "W"` form with no port-specific reasoning

   List to be derived by grep before each port's turn. We do NOT pre-batch the list — each port is selected fresh, written, committed, and verified before the next is started.

8. **Stop signal honored without argument.** If the user says "stop," "careful or clever?", "audit your work," or any equivalent — stop. Run the audit. Report honestly without softening. Do not continue the queue.

### What "one port at a time" means operationally

- One Read of the port file
- One verifiable-elements list (extracted to a scratch note in this turn, not persisted)
- One draft of each FAQ being rewritten
- One Edit per FAQ (not bulk Edit across multiple ports)
- One commit naming the specific elements quoted
- One post-commit grep of the distinctive opener
- One user-visible status update
- WAIT for the user's next signal before starting the next port

If the user is silent and a session-pulse-equivalent is needed, default to stopping after one port rather than continuing.

Soli Deo Gloria.
