# Plan: Update Validators for Emotional Hook Test & 30-Second Promise

**Date:** 2026-03-07
**Status:** Draft — awaiting approval
**Scope:** 4 files changed, 1 file added

---

## Context

The emotional-hook-test skill is now registered in `skill-rules.json` but no validator
enforces or checks for its principles. The Allure ship page has been restructured with
a "Who She's For" callout and promoted logbook — but the ship page validator's
`EXPECTED_MAIN_SECTION_ORDER` still expects the old order and will flag Allure as
`wrong_section_order` (BLOCKING error).

Three things need to happen:

1. **Ship validator** must recognize the new section and updated order
2. **Voice audit hook** should co-activate the emotional-hook-test during pre-commit
3. **Port/venue validators** should gain lightweight emotional-hook awareness

---

## Changes

### 1. `admin/validate-ship-page.js` — Recognize "Who She's For" + updated order

**What changes:**

- Add `who_shes_for` to `SECTION_PATTERNS`:
  ```js
  who_shes_for: /who.she.?s.for|personality|best.for.*cruisers/i,
  ```

- Update `EXPECTED_MAIN_SECTION_ORDER` to accept the new order where logbook
  can appear before first_look (personality before specs):
  ```js
  const EXPECTED_MAIN_SECTION_ORDER = [
    'page_intro',     // ICP-Lite intro with answer-line
    'who_shes_for',   // NEW: Personality callout (optional — not all ships have it yet)
    'logbook',        // Promoted: emotional hook before specs
    'first_look',     // A First Look carousel + stats
    'dining',         // Dining venues
    'videos',         // Watch: Ship Highlights
    'map',            // Deck Plans
    'tracker',        // Live Tracker
    'faq',            // FAQ
    'attribution'     // Image Attributions
  ];
  ```

- `who_shes_for` is NOT added to `REQUIRED_SECTIONS` — it's optional. Only pages
  that have been through the emotional-hook review get it. The validator recognizes
  it when present and validates its position, but doesn't block pages that lack it.

- Add a new WARNING (not BLOCKING) check: if a ship page has NO personality-first
  content (no `who_shes_for`, no logbook before first_look), emit:
  ```
  WARNING: Page has no personality-first content. Consider adding a "Who She's For"
  section or promoting the logbook above the photo carousel. See emotional-hook-test.md.
  ```

**Why not BLOCKING:** Most ship pages haven't been migrated yet. Blocking would fail
~290 ships. The warning creates awareness; the migration happens page by page.

**Risk:** Low. The order change is backwards-compatible — pages with the old order
(logbook after dining) are still valid because `who_shes_for` is optional and the
order check only validates sections that are present.

Wait — actually, this ISN'T backwards-compatible. If we put `logbook` before `first_look`
in the expected order, then every existing page with logbook AFTER dining will fail
the strict order check.

**Revised approach:** Make the section order check FLEXIBLE for `logbook` position.
The logbook can appear either:
- After `dining` (legacy position — still valid)
- After `page_intro` or `who_shes_for` (promoted position — new standard)

Implementation: Instead of a single linear expected order, use a position-range check.
Each section has a min/max allowed position index. Logbook is allowed at positions 1-3
(after intro, after who_shes_for, or after dining).

Actually, simpler: use TWO valid orderings and check which one the page matches:

```js
const VALID_SECTION_ORDERS = [
  // Legacy order (most existing pages)
  ['page_intro', 'first_look', 'dining', 'logbook', 'videos', 'map', 'tracker', 'faq', 'attribution'],
  // Emotional-hook order (personality before specs)
  ['page_intro', 'who_shes_for', 'logbook', 'first_look', 'dining', 'videos', 'map', 'tracker', 'faq', 'attribution'],
];
```

The validator checks if the detected order matches ANY of the valid orderings.
If it matches neither, it's a BLOCKING error.

### 2. `admin/validate-ship-page.sh` — Parallel bash update

**What changes:**

- Add `check_section "Who She's For section"` (as optional/warn, not fail)
- No strict order enforcement in bash validator (it doesn't have one currently)
- Add a comment noting the emotional-hook-test skill reference

### 3. `.claude/hooks/voice-audit-hook.sh` — Co-activate emotional-hook-test

**What changes:**

- After injecting the voice-audit diagnostic, also inject a brief emotional-hook
  reminder banner (not the full 216-line file — just the 5 questions as a checklist):

  ```
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  EMOTIONAL HOOK TEST — 30-Second Check
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Before committing, also consider:
  1. CLARITY (5s)  — Can the reader tell what this page is FOR?
  2. CALM (10s)    — Does scanning feel calming or overwhelming?
  3. SEEN (15s)    — Does it feel like someone thought about THEM?
  4. CONFIDENCE (20s) — Do they feel "I can do this"?
  5. GUIDED (30s)  — Would a first-time cruiser feel guided?

  See: .claude/skills/Humanization/emotional-hook-test.md
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ```

- This is lightweight — ~10 lines of output, not the full skill file dump.
  The voice-audit already dumps its full file; adding both would be too noisy.

### 4. `admin/validate-port-page-v2.js` — Lightweight emotional-hook awareness

**What changes:**

- Add a WARNING check for port pages: if the page has no "From the Pier" or
  equivalent anxiety-reducing section in the first 30% of the page content,
  emit a warning referencing the emotional-hook-test feeling target for ports
  ("Preparation + anxiety reduction").

- This is a WARNING only. Not blocking. Port pages vary widely in structure.

### 5. NOT changing (and why)

| Validator | Why not |
|-----------|---------|
| `validate-venue-page-v2.js` | Venue pages are data-heavy by design. The emotional-hook test is less applicable — readers come for prices and menus, not personality. |
| `validate-historic-ship-page.js` | Historic ships have a different emotional target (remembrance, not planning). Defer until historic ship pages are reviewed. |
| `validate-mobile-readiness.js` | Technical validator. No content/feeling dimension. |
| `validate-icp-lite-v14.js` | Protocol compliance. No feeling dimension. |
| `validate-recent-articles.js` | Rail component. No feeling dimension. |
| Batch validators | They delegate to per-page validators. Changes propagate automatically. |
| Python audit scripts | Structural audits. No content/feeling dimension. |
| `post-write-validate.sh` | Generic post-write. Too broad to add feeling checks. |

---

## Implementation Order

1. `admin/validate-ship-page.js` (the critical change — unblocks Allure and future pages)
2. `admin/validate-ship-page.sh` (bash parity)
3. `.claude/hooks/voice-audit-hook.sh` (co-activation)
4. `admin/validate-port-page-v2.js` (lightweight awareness)

---

## Verification

After implementation:
- Run `node admin/validate-ship-page.js ships/rcl/allure-of-the-seas.html` — should pass
- Run `node admin/validate-ship-page.js ships/rcl/radiance-of-the-seas.html` — should still pass (legacy order)
- Run `./admin/validate-ship-page.sh ships/rcl/allure-of-the-seas.html` — should pass
- Check that voice-audit hook output includes the emotional-hook banner

---

*Soli Deo Gloria*
