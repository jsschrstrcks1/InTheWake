# Phase J-1 — Venue Stylesheet Ref Bulk Rewrite

**Date:** 2026-05-09
**Branch:** `claude/improve-mobile-friendliness-W90DR`
**Scope:** 461 venue HTML files. Zero non-venue files touched.

## What changed

Rewrote every broken stylesheet ref under `restaurants/` (recursing into the brand subdirs) to the canonical form. Final state:

| Stylesheet ref | Count before | Count after |
|---|---:|---:|
| `https://cruisinginthewake.com/assets/styles.css?v=2.257` | 458 | 0 |
| `https://cruisinginthewake.com/assets/styles.css?v=3.002` | 1 | 0 |
| `https://cruisinginthewake.com/assets/styles.css?v=2.235` | 1 | 0 |
| `/assets/styles.css` (no version) | 1 | 0 |
| `/assets/styles.css?v=3.010.400` | 0 | **461** |
| `/assets/styles.css?v=3.010.300` | 11 | 11 (intentionally untouched) |

Net: 461 venues now share the canonical relative ref + current version. The 11 already-relative venues with `?v=3.010.300` were deliberately not touched per careful-not-clever §"don't silently fix unrelated issues" — `.300` and `.400` both resolve to the same file in production; bumping them all would invalidate caches without addressing a real defect.

## Census-vs-execution reconciliation

The Phase J-1 census's `--all` glob initially used `restaurants/*.html` (top-level only, 280 files) instead of `restaurants/**/*.html`. The 192 brand-subdir venues under `restaurants/{carnival,msc,ncl,virgin}/` were missing from the first pass and surfaced when the totals didn't match the census's expected 461. Script updated to `rglob`, second pass cleaned the rest.

This is the second time on this branch a bulk operation needed Cross-Surface Verification reconciliation (the first was Phase J-2 finding 3 more generators than the census named). Lesson noted: in this codebase, "venue" lives in two places, and any future venue-touching work needs `rglob` not `glob`.

## Pilot → bulk shape

1. **Pilot (4 files, all 5 ref variants represented):** `150-central-park.html` (v=2.257 absolute), `giovannis.html` (v=3.002 absolute), `dining-activities.html` (v=2.235 absolute), `izumi.html` (no-version relative).
2. **Mobile validator:** 4 / 4 PASS, zero warnings.
3. **Playwright at 360 / 430:** all four render correctly with hero, photo-credit pill at top-right (Phase C), main content. The previously-unstyled rendering observed in Phase E was confirmed to be the absolute-URL artifact and is now fixed.
4. **Bulk pass 1 (top-level):** 265 files rewritten.
5. **Bulk pass 2 (subdirs):** 192 files rewritten.
6. **Spot-check sample (1 per subdir + 1 top-level):** `wonderland.html`, `carnival/bonsai-sushi.html`, `msc/butchers-cut.html`, `ncl/cagneys-steakhouse.html`, `virgin/the-wake.html`. All pass validator, all render correctly at 360 px.

## v1.7 confidence audit

| Material assumption | Verified? | Confidence |
|---|---|---:|
| Regex matches every actually-broken variant and rejects already-canonical | Tabletop-tested against all 7 expected cases | 10 |
| Idempotent (running twice changes nothing) | The second `--all` run after the first reported 0 changes on already-fixed files | 10 |
| 461 venues now use canonical form | `find restaurants -name "*.html" -exec grep -hoE 'href="[^"]*styles\.css[^"]*"' {} \;` returns 461 of canonical + 11 of v=3.010.300 + 0 absolute | 10 |
| No non-venue file touched | `git diff --name-only` returned 461 files all under `restaurants/` | 10 |
| Mobile rendering improved | Playwright at 360 px now shows styled output across pilot + bulk samples; baseline screenshots from Phase D/E showed unstyled output for the same pages | 9 |
| The 11 v=3.010.300 venues remaining is acceptable | Documented decision; reviewable in this report | 8 (depends on user agreement) |

Lowest confidence (8) is on the deliberate scope choice. If you want all 472 to share `?v=3.010.400`, one extra grep+replace lands it. Awaiting input.

## Out of scope, deliberately

- **D-3 rail / grid-column generators in `admin/`** — Phase G/H per the rollout plan.
- **MOB-007 typography pass** — independent track.
- **The 11 venues at `?v=3.010.300`** — see confidence audit; tractable in 1 line if requested.

## Run instructions

```bash
python3 admin/fix-stylesheet-ref.py --all          # idempotent
find restaurants -name "*.html" -exec grep -l 'cruisinginthewake.com/assets/styles' {} \;   # should return nothing
```

---

**Soli Deo Gloria.**
