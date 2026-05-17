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
