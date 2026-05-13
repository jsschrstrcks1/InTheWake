# UNCLEAR Audit Re-Verification — 2026-05-11

**Context:** The 2026-05-10 site-wide flickr audit classified 39 of 177 files
as UNCLEAR (kept in place). Per the updated `admin/CAREFUL.md` workflow,
sampled 10 of the 39 by hand to gauge accuracy of the UNCLEAR pool.

## Per-file findings (10 sampled)

| File | Subagent verdict | My re-read | Notes |
|------|-----------------|------------|-------|
| `Msc_Bellissima_flickr_masami.webp` | UNCLEAR | **CORRECT** | "BELLISSIMA" name visible on bow with MSC logo |
| `Msc_Seaside_flickr_kaitlinallen16.webp` | UNCLEAR | UNCLEAR | Aerial of Ocean Cay + a Seaside-class ship; could be Seaside or sister |
| `Rotterdam_Iv_flickr_TheLibraryofCongress.webp` | UNCLEAR | **CORRECT** | Vintage B&W; lifeboat marked "...ERDAM" matches Rotterdam IV era (1908–40) |
| `Statendam_Iii_flickr_ROSmaritiem.webp` | UNCLEAR | **CORRECT** | Holland America Cruises postcard; profile matches Statendam III (1929–57) |
| `Prinsendam_flickr_onlandatseaintheair.webp` | UNCLEAR | **WRONG_SHIP** | Ship name on bow is "AMERA" (Phoenix Reisen) — ex-Prinsendam. Same hull, different identity. Page is for HAL Prinsendam. |
| `Carnival_Ecstasy_flickr_rogerslaglesbcglobal.webp` | UNCLEAR | UNCLEAR | Two Fantasy-class Carnival ships side-by-side; name not visible |
| `Silver_Endeavour_flickr_DStanley.webp` | UNCLEAR | **CORRECT** | "SILVER ENDEAVOUR" partial text visible; matches Silversea polar expedition design |
| `Scarlet_Lady_flickr_PelicanPete.webp` | UNCLEAR | UNCLEAR | Sunset silhouette; Virgin Voyages profile but name not visible |
| `Celebrity_Galaxy_flickr_CaptainMartini.webp` | UNCLEAR (called NOT_A_SHIP in batch 1 audit) | UNCLEAR | Twin-bed cabin interior with porthole; consistent with pre-2000s era but not provably Galaxy |
| `Volendam_flickr_borichar.webp` | UNCLEAR | UNCLEAR | Cabin interior with Dutch-themed wall art; could be HAL Volendam but no name visible |

## Sample-stat summary
- 4/10 actually CORRECT (subagent over-cautious)
- 5/10 genuinely UNCLEAR (sister-similarity or no name visible)
- **1/10 image-honesty failure** that the subagent missed: Prinsendam-as-Amera

## Extrapolation (rough, sample size 10 of 39)
- ~16 of the 39 UNCLEAR files are probably actually CORRECT (no action needed)
- ~19 are probably genuinely UNCLEAR (kept; borderline)
- **~4 may be undetected image-honesty failures** like the Prinsendam case

## Highest-impact finding
**`assets/ships/Prinsendam_flickr_onlandatseaintheair.webp`** — referenced by
`ships/holland-america-line/prinsendam.html` (the HAL Prinsendam page).
The image clearly shows the ex-Prinsendam now sailing as Phoenix Reisen's
MS Amera (with Phoenix's teal hull stripe and "AMERA" name on the bow).
Same physical hull, different identity and operator. For the HAL Prinsendam
page, this is misleading: readers expecting a HAL ship see a Phoenix ship.

**Recommended action:** drop this slide from prinsendam.html OR add a
disclosure caption ("Ex-Prinsendam now sailing as Phoenix Reisen MS Amera").
Deferred pending user direction.

## Other UNCLEAR cases worth noting (from sample + known)
- **Vintage HAL postcards** (Rotterdam IV, Statendam III, Nieuw Amsterdam II
  — already CORRECT) are legitimate historical references. Pattern: B&W or
  postcard-era images with HAL livery/wordmark.
- **Cabin interior photos** on real-ship pages (Celebrity Galaxy, Volendam,
  Msc_Euribia (deleted), Msc_Virtuosa (deleted), Resilient Lady (deleted))
  — these aren't ship-exterior shots and don't identify the specific named
  ship. Marginal call: drop, or repurpose for a venue/amenities gallery.
- **Sister-ship ambiguity** for small luxury fleets (Seabourn, Silversea,
  Regent Seven Seas) and Carnival Fantasy class. Without name visible, can't
  distinguish.

## Not action-taken yet
This is a findings report only. No files dropped, no pages edited. User
direction needed on:
1. Prinsendam-as-Amera: drop or disclose?
2. Other UNCLEAR cases: re-verify each of the remaining 29 sampled-similar
   ones? or accept the 4 estimated additional image-honesty failures?
3. Cabin-interior photos: drop from carousels, or move to other sections?
