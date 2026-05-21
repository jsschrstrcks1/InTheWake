# Validator Regex Issues — Central Log

**Purpose:** when a validator regex misfires on a page, log it here instead of rewording the page silently. Fix the regex once, benefit every page.

**Process:**
- Encountering a misfire? Add an entry below with port + validator location + observed false positive + suggested fix.
- Fixing the regex? Remove the entry, link to the commit that fixed it, and re-run the validator on the listed ports to confirm the fix.

This document is named in `admin/CAREFUL_NOT_CLEVER_FAILURE_2026_05_21.md` as the place regex-collision fixes go instead of into per-page rewords. Skipping this log when rewording a page to satisfy a regex is the **regex collision dodging** pattern documented there.

---

## Open issues

*(All issues from the 2026-05 batch are now closed — see the Closed issues section.)*

---

---

## Closed issues

### REGEX-01 — `best time` regex matched `go` inside place names *(closed 2026-05-21)*

**Fix:** `scripts/port-weather-validator-core.js` — `REQUIRED.faqTopics[0].pattern` now wraps each alternative in `\b` word boundaries, so `go` only matches when it's a standalone word, not when it appears as a substring inside Glasgow, Bogota, Otago, Gothenburg, or similar.

**Page where the natural phrasing was restored:**
- `ports/glasgow.html` — restored "When is hurricane and storm season in Glasgow?" (both the JSON-LD `mainEntity` Q and the visible HTML Q). The reword "What is the hurricane and storm season here?" is gone.

**Audit still owed:** other place names containing `go` (Bogota, Otago, Goa, Gothenburg, Connemara-go-?, port-name-with-cruise-substring etc.) added during the 2026-05 batch may have been silently reworded to avoid the same trap. Worth grepping the batch's commits for "season here" / "season in" rewrites.

---

### REGEX-02 — `packing` regex matched `bring` in non-packing contexts *(closed 2026-05-21)*

**Fix:** `scripts/port-weather-validator-core.js` — `REQUIRED.faqTopics[2].pattern` now excludes bare `bring` from the alternation. `pack` and `wear` remain as packing-intent markers (both are unambiguous enough in English); `bring` was too generic. Clothing-context "bring" (e.g., "What should I pack — should I bring a jacket?") still matches via the first alternation's `pack ... jacket/layer/clothes`.

**Page where the natural phrasing was restored:**
- `ports/mauritius.html` — restored "What currency should I bring to Mauritius?" (both the JSON-LD `mainEntity` Q and the visible HTML Q). The reword "What currency is used in Mauritius?" is gone.

**Collateral: ports where the fix exposed missing packing FAQs**

The regex fix exposed that some ports had been "satisfying" the FAQ_PACKING_FOR_WEATHER requirement via the buggy `bring` match rather than via a real packing FAQ. Of the 21 ports newly failing after the fix:

- **8 ports were my responsibility** (touched in this branch): Amalfi, Cochin, Denali, Gdansk, Lifou, Moorea, Noumea, Punta Arenas. Each now has a real climate-keyed "What should I pack" FAQ added in the same commit as the regex fix. Validators clean.
- **13 ports are pre-existing corpus debt** (not touched in this branch): Alexandria, Apia, Aruba, Ascension, Buenos Aires, Da Nang, Dakar, Jamaica, Nosy Be, Recife, Seychelles, St. Maarten, Trieste. These had been silently relying on the buggy regex before this branch existed; they need real packing FAQs added in a separate session. Not in scope for this cleverness-cleanup.

**Audit still owed (outside this branch):** the 13 pre-existing ports above should each get a real packing FAQ. A wider audit of the ~113 ports currently failing the weather sub-validator (pre-fix baseline) is also owed but separate from this branch's work.

---

### REGEX-03 — `D_MONTH` rejects parenthetical qualifiers in activity-row months *(closed 2026-05-21)*

**Fix:** `scripts/port-weather-validator-core.js` — `validateMonths()` now strips parenthetical qualifiers (`\s*\([^)]*\)`) before parsing the month list, and `VALID_SPECIAL_VALUES` now includes `Year-round`. Both changes land in the same commit as the qualifier restorations.

**Pages where the stripped qualifier was restored:**
- `ports/hobart.html` — Salamanca Market `Year-round (Saturdays)` and MONA `Year-round` restored
- `ports/lerwick.html` — Up Helly Aa Festival `Jan (last Tuesday)` and Otter Spotting `Year-round (best Oct-Mar)` restored
- `ports/la-coruna.html` — Seafood `Year-round (freshest Oct-Mar)` restored

**Audit still owed:** other ports may have had similar qualifiers stripped or never written. Worth a sweep of the 66-port batch for activity-rows whose `<span class="activity-label">` describes a calendar-constrained venue (markets, festivals, seasonal-only sites) but whose `<span class="activity-months">` shows a bare 12-month list.

---

## Reviewer note

Per `admin/CAREFUL_NOT_CLEVER_FAILURE_2026_05_21.md` §3, opening a new entry here is the substitute for silently rewording a page. The reword may still proceed (the current page has to ship), but the log entry is the price of admission. A port-repair commit that contains a regex-driven reword without a corresponding entry in this file or a `// FIXME: regex-collision` comment in the page is a careful-not-clever violation.
