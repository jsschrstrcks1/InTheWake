# Phase J-2 — Venue Generator Hardening

**Date:** 2026-05-09
**Branch:** `claude/improve-mobile-friendliness-W90DR`
**Scope:** 7 generators in `admin/`. Zero HTML modified.

## What was hardened

| Generator | Stylesheet line | Self-test |
|---|---:|---|
| `admin/generate-venue-pages.js` | 431 | added |
| `admin/generate-virgin-venue-pages.js` | 530 | added |
| `admin/generate-ncl-venue-pages.js` | 497 | added |
| `admin/generate-carnival-venue-pages.js` | 428 | added |
| `admin/generate-msc-venue-pages.js` | 408 | added |
| `admin/generate-show-pages.js` | 194 | added |
| `admin/generate_restaurant_pages.py` | 95 | added |

Each generator now emits `<link rel="stylesheet" href="/assets/styles.css?v=3.010.400">` (canonical relative form, current version per CLAUDE.md) instead of the absolute / stale `https://cruisinginthewake.com/assets/styles.css?v=2.257`.

## Census-vs-reality reconciliation

The Phase J-1 census named **4** generators. A second sweep (`grep -rln 'cruisinginthewake.com/assets/styles\.css' admin/`) found **7** — three more I missed:

- `admin/generate-carnival-venue-pages.js`
- `admin/generate-msc-venue-pages.js`
- `admin/generate-show-pages.js` (entertainment shows; emits to `restaurants/` so falls under the same toolchain)

This is exactly the kind of incomplete enumeration v1.7's Cross-Surface Verification is designed to catch. Census doc remains accurate as a snapshot but understated the count by 3; this report supersedes it on that single number.

## Self-test contract

Each generator now accepts `--self-test` and:

1. Builds a minimal in-memory fixture (slug, name, description, category — plus `highlights` / `duration` etc. for the show generator).
2. Calls its own `generatePage()` / `generate_page()` against the fixture.
3. Greps the emitted HTML for four named antipatterns:
   - `href="https://cruisinginthewake.com/assets/styles.css` — absolute production URL (D-2)
   - `styles.css?v=2.\d+` — stale stylesheet version pin (D-2)
   - `style="grid-column: [12]; grid-row:` — inline grid-* on rail/col-1 (D-3)
   - `<div style="grid-column: 1; grid-row: 1;">` — col-1 wrapper antipattern (D-3)
4. Exits 0 on clean, 1 on any match. Failure messages name the matched pattern and label.

## Adversarial verification (Anti-Theater Rule)

To prove the self-tests are not theater, I temporarily reintroduced the absolute-URL antipattern in `admin/generate-venue-pages.js`, ran `--self-test`, and observed:

```
SELF-TEST FAILED. Antipatterns matched in emitted HTML:
  - absolute production URL on stylesheet (D-2): /href="https:\/\/cruisinginthewake\.com\/assets\/styles\.css/
  - stale stylesheet version pin (D-2): /styles\.css\?v=2\.\d+/
exit code: 1
```

Restoring the canonical line returned the test to exit 0. Both observations are reproducible.

## v1.7 confidence audit

| Material assumption | Verified? | Confidence |
|---|---|---:|
| All 7 generators that emit the antipattern were located | `grep -rln 'cruisinginthewake.com/assets/styles\.css' admin/` returned exactly these 7 | 9 |
| Each replacement is line-local (no other behavior changed) | `git diff --stat` shows only stylesheet line + self-test block per file; no HTML changes | 10 |
| Self-tests catch regressions | Adversarial inject test proved it for one generator; the other 6 use the same regex set | 8 (verified-by-pattern, not each individually) |
| `?v=3.010.400` is the right canonical version | CLAUDE.md line 90 explicitly says this is the new-page version | 9 |
| No HTML emission behavior changed for non-stylesheet aspects | Only edits were to the stylesheet line + a new code block guarded by `args.includes('--self-test')` | 9 |
| The 460 already-rendered venue pages are unaffected | This commit touches only generators; no `restaurants/*.html` modified | 10 |

Lowest confidence (8) is on "self-tests catch regressions for all 7." I verified one and reasoned-by-pattern for the other 6. To raise to 10 I would need to inject + revert each. Worth doing if requested; deferred here as proportional given the regex + structure are byte-identical across the JS generators (the Python one uses the same patterns translated to the Python `re` module).

## Out of scope, deliberately

- **D-2 HTML rewrite (Phase J-1).** The 460 stale-URL pages remain untouched by this commit. J-2 hardens the generators; J-1 would rewrite the existing pages. They are independent commits per careful-not-clever §"one logical change at a time."
- **D-3 rail / grid-column generators** (`admin/normalize_port_pages.py`, `admin/move_quick_answer_to_rail.py`, `admin/fix_port_pages.py`, `admin/normalize_ship_rails.py`). Those are Phase G/H per the rollout plan and will get the same self-test treatment.
- **MOB-007 typography** — independent track.

## Run instructions

```bash
node admin/generate-venue-pages.js --self-test
node admin/generate-virgin-venue-pages.js --self-test
node admin/generate-ncl-venue-pages.js --self-test
node admin/generate-carnival-venue-pages.js --self-test
node admin/generate-msc-venue-pages.js --self-test
node admin/generate-show-pages.js --self-test
python3 admin/generate_restaurant_pages.py --self-test
```

All seven exit 0 with `Self-test passed: no known antipatterns in emitted HTML.`

---

**Soli Deo Gloria.**
