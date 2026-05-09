# Venue Census — D-2 Stylesheet Ref Hygiene + D-3 Generator Audit

**Date:** 2026-05-09
**Scope:** All 472 HTML files under `restaurants/`, plus the four venue generators in `admin/`.
**Method:** Static `find` + `grep`. Read-only. No edits.

---

## Stylesheet ref distribution (472 venues)

| Ref | Count | % |
|---|---:|---:|
| `https://cruisinginthewake.com/assets/styles.css?v=2.257` | **458** | 97.0% |
| `/assets/styles.css?v=3.010.300` | 11 | 2.3% |
| `https://cruisinginthewake.com/assets/styles.css?v=3.002` | 1 | 0.2% |
| `https://cruisinginthewake.com/assets/styles.css?v=2.235` | 1 | 0.2% |
| `/assets/styles.css` (no version) | 1 | 0.2% |
| **Total** | **472** | 100% |

Two axes of drift:
1. **Absolute URL.** 460 / 472 venues (97.5%) point to `https://cruisinginthewake.com/...` — works in production, breaks local dev / preview / Playwright capture.
2. **Version pinning.** 458 venues are pinned to `?v=2.257`; the rest of the site uses `?v=3.010.300` or `?v=3.010.400`. The query string is just a cache-buster, so production users still get the current stylesheet — but venue pages cache under their own URL, so updating styles.css doesn't propagate to a returning venue visitor until cache expires.

## The 12 already-correct venues

(Use the relative path; canonical form.)

```
restaurants/adventure-ocean.html
restaurants/arcade.html
restaurants/carousel.html
restaurants/casino.html
restaurants/fitness-center.html
restaurants/izumi.html
restaurants/north-star.html
restaurants/ripcord-by-ifly.html
restaurants/rock-climbing.html
restaurants/solarium.html
restaurants/vitality-spa.html
restaurants/zip-line.html
```

11 of these are activity / amenity pages (despite living under `restaurants/`); only **izumi** is a true dining venue. They were likely produced by a different generation pipeline.

## Two single-version outliers

- `restaurants/dining-activities.html` — absolute URL pinned to `?v=2.235` (older still)
- `restaurants/giovannis.html` — absolute URL pinned to `?v=3.002`

## Generator audit (D-3, venue side)

Four generators in `admin/` literally emit the absolute-URL pattern:

| Script | Line | Emits |
|---|---:|---|
| `admin/generate-venue-pages.js` | 431 | `<link rel="stylesheet" href="https://cruisinginthewake.com/assets/styles.css?v=2.257">` |
| `admin/generate-virgin-venue-pages.js` | 530 | same |
| `admin/generate-ncl-venue-pages.js` | 497 | same |
| `admin/generate_restaurant_pages.py` | 95 | same |

These are still active — `apply-venue-reviews.js`, `add-venue-menus.js`, `fix-venue-faqs.js` all coexist as the venue toolchain. **Any new venue created via these generators will be born with the antipattern.** That makes D-3 (venue) higher-risk than D-3 (rail/grid), because the rail one was migration-era code and these are still in operational use.

## Real-world impact

| Where | Breaks? | Why |
|---|---|---|
| Production (cruisinginthewake.com) | No — stylesheet still loads | Server resolves `https://cruisinginthewake.com/assets/styles.css?v=2.257` to the same file as everywhere else |
| Returning users | Caching inefficiency | Venue pages cache under `?v=2.257`; ship/port/home pages cache under `?v=3.010.x`; updates to styles.css won't bust the venue cache until query changes |
| GitHub Pages preview deploys | Probably broken | Preview domain fetches absolute production URL → either CORS / SSL issue or just stale |
| Local dev / Playwright tests | **Confirmed broken** (Phase E captured the artifact) | Localhost can't hit production, page renders unstyled |
| Archival / mirror / print | Broken | Page is permanently coupled to `cruisinginthewake.com` |

## v1.7 confidence ratings on the census claims

| Claim | Method | Confidence |
|---|---|---:|
| 458 / 472 venues use absolute URL with `?v=2.257` | `find restaurants -name "*.html" -exec grep -l ...` | 10 |
| 12 venues use the canonical relative path | Counter-grep of the same set | 10 |
| 4 generators emit the absolute URL pattern | `grep -n 'styles\.css'` on each | 10 |
| Venue toolchain is operational | Inferred from coexisting scripts (`apply-venue-reviews.js`, etc.) | 7 (not directly verified that they were run recently) |
| Mobile rendering in production is unaffected | Logical from cache-buster semantics; not eyeballed in production | 7 |
| Pinning to `?v=2.257` causes caching inefficiency on returning visitors | Standard browser cache behavior | 8 |

## Recommended Phase J fix shape

Two parallel tracks:

**Track J-1: bulk rewrite the 460 venue HTML files.**

Replace every venue stylesheet ref with the canonical form. A small Python script with three regexes would handle all five variants. Pilot on the same 4 sample venues, then bulk. Verification = grep returns zero absolute-URL hits across `restaurants/`.

**Track J-2: harden the 4 generators.**

Replace the literal stylesheet line in each emit template with the canonical relative form. Add a small self-test (run the generator's emit-template against a fixture, grep for `https://cruisinginthewake.com/assets/styles.css`, fail if found). Same pattern recommended for the rail / grid generators in Phase G/H.

J-1 and J-2 should ship in **two separate commits** (per careful-not-clever §"one logical change at a time") so a future bisect can isolate each.

## Open follow-ups not in this census's scope

- **D-6 mobile rendering audit** — needs a Playwright run with a localhost rewrite proxy (or move to URL-relative refs first via J-1, then run Playwright). Recommended order: J-1 then D-6.
- **F-2 sister problem on non-venue pages.** A few pages outside `restaurants/` may have the same absolute-URL issue (the `solo/articles/` directory I excluded earlier from `move_quick_answer_to_rail.py` is one likely place). A separate site-wide audit would close the loop.

---

**Soli Deo Gloria.**
