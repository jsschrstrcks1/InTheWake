# UNCLEAR Audit Re-Verification — Final Report 2026-05-11

All 39 UNCLEAR audit files (from commit 105dd168) re-verified by hand
(multimodal Read). Workflow per `admin/CAREFUL.md` "Subagent Output is a
Hypothesis, Not Ground Truth."

## Summary

| Outcome | Count | Action |
|---|---|---|
| Actually CORRECT (subagent over-cautious) | 7 | No action; left in place |
| Genuinely UNCLEAR (sister-similarity / distance / no name) | ~26 | No action; left in place |
| Already handled (Prinsendam-as-Amera deleted) | 1 | Done in prior commit |
| **New image-honesty findings** | 5 | **User direction needed** |

## New image-honesty findings (the ones that need decisions)

### 1. `seven-seas-mariner_flickr_new.jpg` — **WRONG_SHIP**
Image shows ship clearly labeled "Seven Seas **NAVIGATOR**" on the bow,
with "Regent" wordmark visible. This is Navigator, not Mariner. Used on
`ships/regent/seven-seas-mariner.html`. **Recommend: delete file, drop
slide.** This is the same kind of error as the Prinsendam-as-Amera case.

### 2. `msc-armonia_flickr_new.jpg` — **WRONG_CONTEXT (marginal)**
Image shows TWO MSC ships side by side. Left ship is clearly labeled
"MSC FANTASIA" on the bow; right ship has only partial "MSC" wordmark
visible. Photographer's framing puts Fantasia as primary subject. Used on
`ships/msc/msc-armonia.html`. Image-honest framing for Armonia is weak.
**Recommend: delete or replace.** Marginal call.

### 3. `Celebrity_Xploration_flickr_terribateman.webp` — **NOT_A_SHIP**
Galápagos beach landscape with rocks + 3 birds flying + 2 very-distant
unidentifiable boats on the horizon. Primary subject is the beach, not a
ship. Used on `ships/celebrity-cruises/celebrity-xploration.html`.
**Recommend: delete.**

### 4. `Costa_Favolosa_flickr_FabioTomei.webp` — **NOT_A_SHIP**
Couple posing on a cruise ship's wooden teak deck at sunset. Primary
subject is the people, ship details not visible. Could be aboard any
cruise ship. Used on `ships/costa/costa-favolosa.html`.
**Recommend: delete.**

### 5. `Nordic_Prince_flickr_skydawgz13.webp` — **NOT_A_SHIP**
Vintage view of Curaçao's Queen Juliana Bridge from a ship's deck. The
distant dockside has small unidentifiable ships. Primary subject is the
bridge/landscape, not Nordic Prince. Used on
`ships/rcl/nordic-prince.html`. **Recommend: delete.**

### 6. `Msc_Fantasia_flickr_JackieGermana.webp` — **NOT_A_SHIP**
Aerial of a harbor with a tender boat, taken from MSC Fantasia's deck
looking down. The ship itself is not in frame; only a small white wake
suggests it. Used on `ships/msc/msc-fantasia.html`.
**Recommend: delete.**

## CORRECT cases (subagent over-cautious, no action needed)

These were flagged UNCLEAR but my re-read found enough identification:
1. `Msc_Bellissima_flickr_masami.webp` — "BELLISSIMA" partial text on bow + MSC funnel
2. `Rotterdam_Iv_flickr_TheLibraryofCongress.webp` — lifeboat marked "...RDAM"
3. `Statendam_Iii_flickr_ROSmaritiem.webp` — Holland America Cruises postcard
4. `Silver_Endeavour_flickr_DStanley.webp` — "SILVER ENDEAVOUR" text partial visible
5. `Seabourn_Pursuit_flickr_DaveWilsonPhotograph.webp` — Pursuit name partial visible + dark-hull expedition livery
6. `Ss_Meridian_flickr_Piktaker.webp` — Celebrity X funnel logo + era-appropriate
7. `seven-seas-splendor_flickr_new.jpg` — "Regent" wordmark + Splendor profile

## Genuinely UNCLEAR (kept; ~26 files)

Sister-ship similarity (especially MSC, Carnival Fantasy-class, small
luxury fleets), distance/angle preventing name read, or cabin-interior
shots not provably the named ship. Listed in detail in
`audit-reports/flickr_audit_unclear_recheck_2026-05-11.md` (prior commit).
