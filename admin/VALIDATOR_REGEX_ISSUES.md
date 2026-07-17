# Validator Regex Issues — Central Log

**Purpose:** when a validator regex misfires on a page, log it here instead of rewording the page silently. Fix the regex once, benefit every page.

**Process:**
- Encountering a misfire? Add an entry below with port + validator location + observed false positive + suggested fix.
- Fixing the regex? Remove the entry, link to the commit that fixed it, and re-run the validator on the listed ports to confirm the fix.

This document is named in `admin/CAREFUL_NOT_CLEVER_FAILURE_2026_05_21.md` as the place regex-collision fixes go instead of into per-page rewords. Skipping this log when rewording a page to satisfy a regex is the **regex collision dodging** pattern documented there.

---

## Open issues

### REGEX-04 — `admin/validate-ship-page.sh` #1320 TBD-field sed slice bleeds past JSON boundary *(opened 2026-07-12)*

**Validator location:** `admin/validate-ship-page.sh` ~line 565 — the check that fails a page for `"TBD"` values in the fact-block JSON.

**Observed false positive:** the check uses `sed -n '/"entered_service"/,/"registry"/p'` to slice the JSON metadata block, then greps for `"TBD"` in the slice. When a ship's page.json omits the `"registry"` field entirely (some retired pages do), the closing anchor never matches and the slice extends to end-of-file. The slice then catches unrelated HTML further down the page — e.g. `data-imo="TBD"` on the tracker element, which is a separate HTML attribute nowhere near the metadata block.

**Effect:** a page can trip #1320 with a valid `"entered_service"` and `"registry"` both filled if the tracker element still has `data-imo="TBD"`, because the sed slice is picking up the wrong region.

**Suggested fix:** switch the closing anchor to a guaranteed-terminal token inside the JSON block (e.g. the `</script>` tag or a trailing curly-brace pattern that must appear in every fact-block), or extract the JSON with `jq` instead of a line-range sed. Either eliminates the boundary leak.

**Pages that exposed the leak this session:** retired-ship pages built from the Costa Diadema template that omit the `"registry"` field for pre-IMO ships.

---

### REGEX-05 — `admin/validate-ship-page.sh` #1819 grammar check false-positives on yu-sound vowels *(opened 2026-07-12)*

**Validator location:** `admin/validate-ship-page.sh` ~line 1819 — the "a/an before vowel" grammar check.

**Observed false positive:** the regex `\b[Aa] [AEIOU][a-z]` flags every case of `a <vowel>`, but English "yu-sound" vowels take `a` not `an`. False positives observed this session: `a unique`, `a European`, `a one-time`, `a university`, `a used`. All are grammatically correct and were being rewritten to `an unique` etc. to satisfy the check, which is wrong.

**Suggested fix:** add a yu-sound exception alternation before the flag: skip when the following word starts with `uni-`, `eu-`, `once`, `one-`, `used-`, `useful`, `user`, `usual`, `European`. Alternatively, invert the check to trust `a`/`an` as authored and only flag when the current spelling doesn't match a known-good rule.

**Pages where the natural phrasing was preserved via replace_all:** Costa fleet — every `a Excellence Class` → `an Excellence Class` case was flipped by hand because those *were* real errors, but each fix had to individually verify the y-sound distinction to avoid over-correcting.

---

### REGEX-06 — `admin/validate-ship-page.sh` superlative check is 21st-century-biased *(opened 2026-07-12)*

**Validator location:** `admin/validate-ship-page.sh` ~line 1303–1316 — the check that requires a date qualifier near a superlative.

**Observed false positive:** the regex `(newest|largest|first|...).{0,80}(20[0-9]{2}|as of)` requires the qualifier to (a) come AFTER the superlative within 80 chars and (b) contain a 21st-century year OR the literal token "as of". A 20th-century ship like Sovereign of the Seas cannot say `at her 1988 debut, she was the world's largest` because 1988 doesn't match `20[0-9]{2}`; the qualifier order also has to be flipped to `As of her January 1988 launch, Sovereign was the world's largest` to satisfy the position rule.

**Suggested fix:** (a) accept `19[0-9]{2}` in the year alternation; (b) allow the qualifier to precede the superlative within a symmetric window; (c) surface a clearer error message ("superlative found but qualifier is on the wrong side") so authors don't guess. Also acceptable: emit a warning instead of a fail when the year is 19XX, since these are usually retired ships whose superlatives are historical facts.

**Pages that surfaced the issue:** Sovereign-of-the-Seas retired-ship rebuild, Silversea-fleet 1980s-launched ships.

---

### REGEX-07 — `admin/validate-ship-page.sh` gross-tonnage check requires exact tokens *(opened 2026-07-12)*

**Validator location:** `admin/validate-ship-page.sh` ~line 1092 — the check that a page contains a gross-tonnage mention.

**Observed false positive:** the check uses `grep -qi 'gross tons\|GT'` and fails a page whose only tonnage phrasing is "gross tonnage" (no trailing `s`, no `GT`). "Gross tonnage" is the industry-standard term, so failing it forces awkward rewrites.

**Suggested fix:** widen the alternation to `gross tons\|gross tonnage\|GT\b`. The `\b` on `GT` also prevents matching inside unrelated tokens.

---

### REGEX-08 — `admin/validate-ship-page.sh` carousel-slide check uses line-count where occurrence-count is needed *(opened 2026-07-12)*

**Validator location:** `admin/validate-ship-page.sh` ~line 567–586 — the check that counts carousel slide divs.

**Observed false positive:** the check uses `grep -c '</div>'` which counts LINES containing `</div>`, not occurrences. When two closing divs collapse onto one line as `</div></div>` (common after HTML minifiers or hand-formatting), the second one is not counted. Real slide counts read lower than actual, and pages with the correct number of slides can trip an "insufficient slides" fail.

**Suggested fix:** replace `grep -c` with `grep -o '</div>' | wc -l` for any check that counts DOM elements rather than lines. Several other counters in the validator share this shape and should be audited together.

---

### REGEX-09 — `admin/validate-ship-page.sh` retired-ship detection is prose-pattern-based and conflicts with the site-name leak check *(opened 2026-07-12)*

**Validator location:** `admin/validate-ship-page.sh` ~lines 762–775, 1322–1338 — TBN/retired detection; and the site-name leak check (searches for "In the Wake" anywhere in the page).

**Observed false positive:** retired-ship downgrades are triggered only when the page contains one of a fixed set of magic phrases (`preserves the ship's history`, `entered service in 19XX`, `to be named`, `TBN`, `under construction`, `not yet delivered`, or a `(YYYY)` in the title). Miss the phrase, retired-ship fails as active-ship. Meanwhile the retired-ship eulogy check (#1306) REQUIRES `class="byline">— In the Wake editorial</span>` in the page — but the site-name leak check then flags "In the Wake" as leaked. Two checks fight each other.

**Suggested fix:** move retired/TBN status out of prose into explicit page.json metadata (`"status": "active"|"retired"|"tbn"|"under-construction"`) and key all downgrades on that field. The site-name leak check should whitelist the retired-ship byline pattern specifically.

---

## Sibling issues (validator UX gaps, not regex bugs — filed for tracking)

### UX-01 — no `--json` output mode on `admin/validate-ship-page.sh`

Bulk-fix work has to parse human-formatted stdout. A `--json` mode emitting `{file, checks: [{id, severity, line?, message}]}` would let orchestrators aggregate cleanly. Currently the aggregator `admin/aggregate-ship-validation.js` re-parses the human output.

### UX-02 — no `--only <id>` filter on `admin/validate-ship-page.sh`

When fixing one specific error across a fleet, the validator still runs all 238+ checks per file. `--only #1381,#1374` would let batch work focus. Combined with `--json`, would meaningfully speed multi-fleet passes.

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
