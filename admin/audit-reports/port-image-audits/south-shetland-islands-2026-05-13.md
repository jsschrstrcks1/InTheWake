# Port image audit — south-shetland-islands

**Date:** 2026-05-13
**Files:** 12
**Auditor:** Claude (session: claude/baseline-port-validation-Nbcst)
**Method:** Read every file with the Read tool. Per-file verdict recorded below.

**Background:** The hero image was found to be a relief map of the Shetland Islands of *Scotland* (wrong archipelago) and replaced in commit `9685b5e7`. The careful follow-up — per the new Rule A in `admin/SOURCING_HARDENING_PLAN_2026-05-12.md` — is to Read-verify every remaining file in the directory, because the same upstream sourcing process that produced one Wikipedia-conflation file likely produced others.

## Verdicts

| # | File | Verdict | Subject / visible identifier | Action |
|---:|---|---|---|---|
| 1 | `attraction-1.webp` | **correct** | Tourists in geothermal pool at Deception Island, black volcanic beach, expedition ship offshore | keep |
| 2 | `attraction-2.webp` | **wrong-subject** | Green grass hill + sandy beach + small pier — temperate Atlantic, no Antarctic markers. Same Scottish-Shetland conflation pattern as the original hero. | delete + replace or drop HTML ref |
| 3 | `attraction-3.webp` | **correct (map)** | Historic British Admiralty chart "THE SOUTH SHETLAND AND SOUTH ORKNEY ISLANDS — WITH THE TRACKS OF THE SEVERAL DISCOVERERS" with RGS stamp | keep with caption noting it's a chart |
| 4 | `food.webp` | **correct subject / wrong slot** | NASA-style satellite image of Antarctic archipelago with tabular iceberg | rename or rewrite caption (no actual "food" subject possible — no restaurants in South Shetland Islands) |
| 5 | `gallery-1.webp` | **wrong-subject** (high confidence) | Sunset behind sea-stacks with gulls; no penguins, no snow, no ice. Temperate Atlantic latitude. | delete + replace or drop HTML ref |
| 6 | `gallery-2.webp` | **correct** | Three Adelie penguins on snow with iceberg field and jagged peaks behind | keep |
| 7 | `gallery-3.webp` | **correct** | Chinstrap penguin (diagnostic black chin-strap) on moss-covered ground — chinstrap is the dominant breeding species on South Shetlands | keep |
| 8 | `harbor.webp` | **correct** | Satellite image of Deception Island showing the C-shaped flooded caldera (Port Foster) with Neptune's Bellows opening | keep |
| 9 | `hero.webp` | **correct** (replaced 2026-05-12) | David Stanley's Deception Island wide view with Whalers Bay structures | keep (already replaced) |
| 10 | `landmark.webp` | **correct** | Whalers Bay abandoned whaling-station: rust-red oil storage tanks with graffiti, dormitory shed, snow on volcanic slope | keep |
| 11 | `panorama.webp` | **wrong-subject** | Same Scottish Shetland relief map as the original wrong hero — wrong archipelago. Bytes likely identical to the pre-replacement hero. | delete + replace or drop HTML ref |
| 12 | `street.webp` | **correct** | Sculpted iceberg with two penguins climbing the icy ridge | keep |

## Summary

- **Correct subject:** 9 / 12
- **Wrong subject (Scottish Shetland conflation):** 3 / 12 — `attraction-2`, `gallery-1`, `panorama`
- **Wrong slot, correct subject:** 1 / 12 — `food` (Antarctic satellite filed as cuisine)

The 3 wrong-subject files share a pattern: Wikipedia / Flickr photos of the *Shetland Islands of Scotland* harvested by name-keyword without geographic verification. The Adelies, chinstraps, Deception Island satellites, and Admiralty chart are all real Antarctic content — those were sourced separately. So the original sourcing produced two distinct streams: ~75% correct Antarctica, ~25% wrong Scotland.

## Next actions

1. Delete `attraction-2.webp` + `gallery-1.webp` + `panorama.webp` plus their attr.json siblings.
2. Check what HTML references these files; either source replacements or remove the refs and let the gallery shrink.
3. Rename `food.webp` to a slot consistent with its content (e.g., `archipelago-satellite.webp`) and update HTML caption.

*Soli Deo Gloria.*
