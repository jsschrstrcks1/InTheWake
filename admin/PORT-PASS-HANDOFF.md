# Port pass — handoff

**Soli Deo Gloria.** Last updated 2026-07-30.

## What this is

The v0.1.17 Volendam 2028 Grand World Voyage pack names **45 ports**. Nine of
them had no page on this site, and the pack's descriptions of those nine were
written from recall rather than from sources. Five contained defects. This pass
builds a proper page for each, thinnest-researched first, and fixes the pack
where the research contradicts it.

**Branch:** `claude/voyage-packs-pwa-versions-se8oqg`

## Status

| # | Port | Slug | Research | Images | Spec | Page | State |
|---|---|---|---|---|---|---|---|
| 1 | New Plymouth, NZ | `new-plymouth` | ✅ | ✅ 19 | ✅ | ✅ | **SHIPPED — PASS 98/100** |
| 2 | Townsville, AU | `townsville` | ⏳ running | ✅ 16 verified | — | — | images committed |
| 3 | Abidjan, CI | `abidjan` | ⏳ running | ✅ 11 verified | — | — | images committed; skyline gap |
| 4 | San Antonio, CL | `san-antonio` | ✅ | ⏳ 18 fetched | ✅ draft | — | prose done, wire images |
| 5 | La Réunion | `reunion` | ✅ | ⏳ | — | — | research in repo |
| 6 | Devil's Island, GF | `devils-island` | ✅ | ⏳ | — | — | research in repo |
| 7 | Belém, BR | `belem` | ✅ | ⏳ | — | — | research in repo |
| 8 | Lüderitz, NA | `luderitz` | ⏳ running | ⏳ | — | — | |
| 9 | Takoradi, GH | `takoradi` | ⏳ running | ⏳ | — | — | |
| 10 | Scenic candidates (Null Island et al.) | — | — | — | — | — | plus final pack re-link + PDF rebuild |

## The pipeline

```bash
# 1. Research — see admin/port-research/README.md for the standing rules.
#    Primary sources; every figure carries its URL; CORRECTIONS and UNVERIFIED
#    lists close each report. Reports are checked in, not left in /tmp.

# 2. Images — build the manifest, fetch, then LOOK at every single one.
node admin/scripts/fetch-port-images.mjs admin/port-specs/<slug>.images.json

# 3. Spec — write admin/port-specs/<slug>.json. The generator validates it.
# 4. Build + validate.
node admin/scripts/build-port-page.mjs admin/port-specs/<slug>.json
node admin/validate-port-page-v2.js ports/<slug>.html
node scripts/validate-port-weather.js ports/<slug>.html   # must be 0 errors

# 5. Wire the page into ports.html (3 places) and assets/data/search-index.json.
```

## Things that will bite you

**Open every image before it ships.** This is not ceremony. Across three batches,
roughly a quarter of the images either showed something other than their caption
claimed or illustrated it badly:

- an aerial captioned "the ring of forest around the volcano" was an airliner
  window shot with the wingtip filling the frame
- a "Coastal Walkway in front of Puke Ariki" shot was the opposite end of town
- a breakwater "taking a winter swell" was a flat calm sunny day — and was
  actually the best port photograph in the set, buried under a wrong caption
- a "Port of Townsville" shot was a photograph *of a ferry*, its frame carrying
  one operator's branding six times, on a page that recommends that ferry
- an Abidjan "port" shot was a container stack behind a wall, shot from a moving
  car, dominated by a shipping line's livery

**Filenames lie. The filename is the claim, not the fact.** Rejections go in a
`rejected` array in the manifest with a `why`, so nobody re-fetches the same file
for the same caption. Kept images get `verified_subject: true` plus a note saying
what is actually in the frame.

**The word ceiling is real.** ITC v1.1 recommends 2,000–6,000 words. The corpus
median is 3,941 and only four pages exceed 6,000 — New Plymouth is now the
longest at 7,598 and that is documented as a deliberate exception with reasoning,
not an oversight. Budget: logbook ~950, excursions ~600, history ~380, FAQ ~660,
and remember that figure captions plus the credits list run ~60 words per image.
Nineteen images cost 950 words before you write a sentence.

**The map fits to POI bounds, not to `bbox_hint`.** A POI 29 km out of town
forces a zoom at which every town marker collapses into one unreadable clump.
Scope the map to the walkable day; put the far excursion in the prose. Verified
in a browser, not assumed.

**POI coordinates must come from a gazetteer.** Nominatim search plus an Overpass
named-feature sweep of the port area. Never estimate off a street map. The
generator refuses a POI whose `type` the map cannot render and one whose `id` is
already claimed by another port. New Plymouth's original port pin sat on the city
centre while labelled "Port Taranaki cruise berth", 6 km from the actual wharf.

**Test the map with Leaflet vendored locally.** The CDN is unreachable from this
sandbox, so a `markers: 0` result means the network blocked Leaflet, not that the
POIs are broken. Route `**/leaflet.js` from disk and stub the tiles — and note
Playwright gives precedence to the *last* matching route, so register the blanket
offline abort *first*.

**Nav hrefs.** The generator links `/ports.html`, `/cruise-lines.html` and
`/restaurants.html`, not the trailing-slash directory forms. Those 404 on the
live site; `_redirects` now catches them, but do not reintroduce the dead form
into new markup. See UL-088.

**Pre-commit gates.** The factcheck gate requires documented keys in the sidecar;
the no-getbets guard fires on pre-existing task titles in
`admin/UNFINISHED_TASKS.md`, so commit that file separately. The PDF freshness
hook blocks a pack `.md` change without a rebuilt PDF
(`admin/scripts/voyage-pack-pdf-build.sh volendam`).

## Corrections already folded back into the pack

Recorded in `v0.1.17-...factcheck.json` under `port_research_corrections`:

- Ver-o-Peso dates from **1625**, not 1688 (1688 assigned the revenue, 63 years
  later); **1,193 licensed traders**, not "2,000 stalls"; rebuilt for COP30
  through 2025–26, so any older description is obsolete
- Belém is a **tender call off Icoaraci**, 18–20 km out — the downtown quay
  carries ~7 m against Volendam's ~8.1 m
- **Theatro da Paz inscribed by UNESCO on 27 July 2026**, as one of two
  components of the serial property *Amazonia Theatres*, not alone
- **Brazil reinstated visas for US/CA/AU on 10 April 2025**; e-Visa, ~US$80.90,
  explicitly covers arrival by vessel
- **French Guiana is EU but not Schengen**
- CNES has owned the Îles du Salut since **1971**; the islands are evacuated for
  every eastward Kourou launch and **the ban survives a postponement**
- No 2028 segments published as of 30 July 2026, though 2027 has them

## Open questions for the operator

1. **Is San Antonio actually on the 2028 itinerary?** HAL publishes "45 ports in
   26 countries" but never the full list. San Antonio is highly likely and is not
   primary-sourced. Same for Belém and Îles du Salut — the pairing is real and
   current (Volendam called Belém on 15 Jan 2026 directly from the Îles du Salut)
   but it is an inference.
2. **Segments.** Ask HAL's World Cruise Reservations Desk directly.

**Soli Deo Gloria.**
