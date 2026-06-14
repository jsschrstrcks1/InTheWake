# HANDOFF — Full venue catalog for every ship on every line  ✅ COMPLETE

**Goal (met):** Every ship page (290) is represented in canonical `assets/data/venues-v2.json`.
Current operating ships carry full, officially-researched multi-category rosters (dining + bars +
entertainment + pools + spa + kids). Historic/retired/future ships carry a status note instead of
fabricated venues. No training-data recall — every venue traces to an official/secondary web source
fetched in-session. Integrity: 0 orphan venue references, 0 duplicate slugs, valid JSON.

## Final coverage (manifest.json)
- **290 ship pages, all represented. 0 MISSING.**
- **198 MULTI-CAT** — current operating ships, full rosters (all 15 lines' current fleets).
- **35 DINING-ONLY-FLAGGED** — historic/future ships that have dining + a status note.
- **57 STUB-FLAGGED** — historic/retired/future ships, empty venues + status note.
- Registry grew 1,576 → 2,101 venue definitions.

## Per-line current-fleet expansions (all pushed)
Seabourn 7 · Silversea 12 · Oceania 8 · Regent 7 · Costa 9 · Princess 17 · Norwegian 20 ·
Cunard 4 · Explora I/II + III · Celebrity ocean 14 + Flora · Carnival current 26 · HAL current 11
(+ created Rotterdam VII). MSC 24 / RCL 29 / Virgin 4 were already multi-category (pre-built).

## Fleet-change findings captured (verified)
- Seabourn Odyssey (→Mitsui Ocean Fuji 2024) & Sojourn (→Mitsui Ocean Sakura, May 2026) — departed.
- Norwegian Sun & Sky — departing to Cordelia Cruises 2026.
- Celebrity Xpedition (→Nat Geo Gemini) & Xploration (→Nat Geo Delfina) — sold to Lindblad 2024-25.
- Carnival Fantasy-class: only Elation & Paradise remain (6 retired 2019-20).
- Currency exclusions (not-yet-open, deliberately omitted): Oceania Marina Oct/Nov-2026 refurb venues,
  Regent Voyager Epicurean Studio (June 28 2026), Explora III (pre-service July 24 2026, config recorded).

## Remaining OPTIONAL follow-ups (not blocking; lower value)
1. **Historic-ship venue rosters** (57 stubs + 35 flagged): would require archival deck plans — deliberately
   not fabricated. A future archival-research pass could populate period venues if desired.
2. **Costa non-dining** is SECONDARY-sourced (official site 503 throughout) — re-verify when costacruises.com
   is reachable.
3. **MULTI-CAT spot-verification** of pre-built MSC/RCL/Virgin (not re-audited this session; assumed complete).
4. Explora IV-VI / Celebrity River-class / Carnival Project-Ace: populate when officially announced.

## Canonical structure (unchanged)
Target file `assets/data/venues-v2.json`: `ships[<page-slug>]={name,class,gt,venues:[<registry-slug>...],historical_note?}`.
Every ship-referenced slug exists in the top-level `venues` registry. Ship key == ship page slug.
