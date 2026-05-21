# Validator Regex Issues — Central Log

**Purpose:** when a validator regex misfires on a page, log it here instead of rewording the page silently. Fix the regex once, benefit every page.

**Process:**
- Encountering a misfire? Add an entry below with port + validator location + observed false positive + suggested fix.
- Fixing the regex? Remove the entry, link to the commit that fixed it, and re-run the validator on the listed ports to confirm the fix.

This document is named in `admin/CAREFUL_NOT_CLEVER_FAILURE_2026_05_21.md` as the place regex-collision fixes go instead of into per-page rewords. Skipping this log when rewording a page to satisfy a regex is the **regex collision dodging** pattern documented there.

---

## Open issues

### REGEX-01 — `best time` regex matches `go` inside place names

**Validator:** `scripts/port-weather-validator-core.js` — `REQUIRED.faqTopics[0].pattern`
**Pattern:** `/best time[^<]*(?:visit|go|cruise)|when[^<]*(?:visit|go|cruise)/i`
**Bug:** The `(?:visit|go|cruise)` alternation matches the substring `go` inside any word. Combined with the `when[^<]*` prefix, any FAQ question containing `when` plus a place name that contains `go` will match the best-time regex regardless of the question's actual topic.

**Affected port names (non-exhaustive):**
- Glasgow (`Glas**go**w`)
- Bogota (`Bo**go**ta`)
- Goa (`**Go**a`)
- Otago (`Ota**go**`)
- Gothenburg (`**Go**thenburg`)
- Sargasso (`Sar**ga**sso` — false hit on `go`? No, that's `ga` — but `Sarga**sso**` has no `go`. Verify before assuming.)
- Cargo, Mango, Mongolia (unlikely as port names but worth flagging)

**Observed collision:**
- Port: `ports/glasgow.html` (2026-05-21)
- FAQ: "When is hurricane and storm season in Glasgow?"
- Effect: regex matched best-time topic via `when … Glasgow` because `Glasgow` contains `go`. Triggered `FAQ_DUP: Best time to visit` since a real best-time FAQ also existed.
- Worked around in commit `61c8cf9e` by rewording to "What is the hurricane and storm season here?" — see `admin/CAREFUL_NOT_CLEVER_FAILURE_2026_05_21.md` §3.

**Suggested fix (validator-side):**
```diff
- /best time[^<]*(?:visit|go|cruise)|when[^<]*(?:visit|go|cruise)/i
+ /best time[^<]*\b(?:visit|go|cruise)\b|when[^<]*\b(?:visit|go|cruise)\b/i
```
Add `\b` (word boundary) around each alternation to prevent substring matches.

**Cleanup after fix:**
- Restore Glasgow's natural phrasing "When is hurricane and storm season in Glasgow?" if the validator's fix passes.
- Re-run `node admin/validate-port-page-v2.js ports/glasgow.html` to confirm.
- Audit other ports added during the 2026-05 batch for similar rewords (search commit history for "regex collision" in `git log --grep`).

---

### REGEX-02 — `packing` regex matches `bring` in non-packing contexts

**Validator:** `scripts/port-weather-validator-core.js` — `REQUIRED.faqTopics[2].pattern` (packing topic)
**Pattern:** `/pack[^<]*(?:weather|clothes|clothing|jacket|layer)|what[^<]*(?:pack|bring|wear)|how[^<]*(?:dress|pack)/i`
**Bug:** The middle alternation `what[^<]*(?:pack|bring|wear)` matches `bring` anywhere after `what`. Any FAQ starting with "What" that contains "bring" later will match the packing topic, even when the question is about something else entirely (currency to bring, souvenirs to bring back, paperwork to bring along).

**Observed collision:**
- Port: `ports/mauritius.html` (2026-05-21)
- FAQ: "What currency should I bring?"
- Effect: regex matched packing topic via `what currency should I bring`. Triggered `FAQ_DUP: Packing for weather` since a real packing FAQ ("What should I pack for a port day in Mauritius?") also existed.
- Worked around in commit `46c1eee0` by rewording to "What currency is used in Mauritius?" — see `admin/CAREFUL_NOT_CLEVER_FAILURE_2026_05_21.md` §3.

**Suggested fix (validator-side):**
```diff
- /pack[^<]*(?:weather|clothes|clothing|jacket|layer)|what[^<]*(?:pack|bring|wear)|how[^<]*(?:dress|pack)/i
+ /pack[^<]*(?:weather|clothes|clothing|jacket|layer)|what[^<]*(?:to\s+pack|to\s+bring|to\s+wear)\b|how[^<]*(?:dress|pack)/i
```
Narrow `bring` and `wear` to packing-context phrases ("to bring", "to wear"). Plain `bring` and `wear` elsewhere in a Q are too ambiguous to count as packing intent.

**Cleanup after fix:**
- Audit ports for FAQs containing `What … bring` reworded during the 2026-05 batch.
- Restore natural phrasing where the original Q was clearer.

---

---

## Closed issues

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
