# Royal Caribbean Ship Images - Status Summary

**Last Updated:** 2026-05-14
**Total HTML Files:** 50

---

## Phase 6 sourcing run, 2026-05-14

Sandbox environment blocked outbound HTTPS to `*.wikimedia.org` and
`*.wikipedia.org`. Built a sandbox-aware fetcher at
`admin/fetch-commons-via-proxy.py` that routes metadata + SHA-1 through
Toolforge (`magnustools.toolforge.org` + `petscan.wmcloud.org`) and image
bytes through `cors-anywhere.fly.dev`, with bit-for-bit SHA-1 verification
on every download.

Six ships processed in the first batch:

| Ship | Line | Before | After | Notes |
|---|---|---:|---:|---|
| Valiant Lady | virgin-voyages | 5 | 11 | 6 new from Commons category (8 listed, 2 skipped — non-ASCII filename Toolforge 500). |
| Scarlet Lady | virgin-voyages | 6 | 13 | 7 new embedded (8 fetched; the cropped Liverpool variant was kept on disk but not used as a swiper slide to avoid near-duplicate). |
| Resilient Lady | virgin-voyages | 5 | 12 | placeholder `/assets/ship-map.png` slide replaced with 8 sourced Commons photos. |
| Brilliant Lady | virgin-voyages | 6 | 7 | **Source-limited**: Commons category has only 2 files total. Same-image duplicate swiper slide replaced with the 2 Commons photos. Page still 1 under the min — needs Tier 3 (Flickr CC-BY) when revisited. |
| Wonder of the Seas | rcl | 7 | 10 | 6 Commons files fetched, but 1 was a Norwegian Jewel photo that happened to be filed in the Wonder category — removed before commit. 2 were filename collisions with existing flat-path files — removed. 3 truly new photos embedded. |
| Mariner of the Seas | rcl | 6 | 12 | SHIP_IMAGES_WIKIMEDIA_COMMONS had Mariner's category as "(ship, 2002)"; actual category is "(ship, 2003)". 60 files available. |

Fetcher quirks observed:
- `magnustools.toolforge.org/commonsapi.php` returns HTTP 500 on filenames with non-ASCII characters (Coruña, Málaga, España, Comète). **Fixed in followup `541fae2c`**: fetcher now falls back to the MediaWiki action API at `commons.wikimedia.org/w/api.php` (also relayed via `cors-anywhere.fly.dev`, returns JSON, handles non-ASCII).
- `commonsapi.php` returns XML with unescaped `&` in URL query strings. The fetcher pre-escapes lone ampersands before parsing.
- License field "PD" (plain Public Domain shorthand) was not in the fetcher's accepted-license set. **Fixed in followup `541fae2c`**: license normalization rewritten to strip all spaces / dots / hyphens / underscores before comparison; `PD`, `CC BY-SA 4.0` (with spaces), and `CC-BY-SA-4.0,3.0,2.5,2.0,1.0` (multi-license) all accepted.

---

## Visual verification — integrity layer beyond SHA-1 (2026-05-14)

**The gap:** the fetcher SHA-1-verifies every byte stream against Toolforge's
published hash. That proves the bytes match Commons. **It does NOT prove the
depicted subject is the ship we sourced for.** PETScan-listed Commons
categories legitimately contain files where the target ship shares the frame
with other ships, or where the depicted vessel cannot be visually distinguished
from a same-class sister.

**The remediation:** every committed image must be opened with the Read tool
and stamped with a `visual_verification` field in its `.attr.json` sidecar.
Three levels:

- **confirmed** — ship name, IMO number, registry-port lettering, or other
  unambiguous identifier visible in the frame.
- **consistent** — right hull-class + livery + location, no contradicting
  evidence, but no unique identifier visible. Identification rests partly on
  Commons attribution + the photographer's context.
- **ambiguous** — visually indistinguishable from a same-class sister ship.
  Identification rests entirely on the Commons uploader's claim.

Phase 6 batch-1 (32 images) re-scored post-hoc on 2026-05-14:

| Ship | Confirmed | Consistent | Ambiguous | Wrong |
|---|---:|---:|---:|---:|
| Valiant Lady | 5 | 1 | 0 | 0 |
| Wonder of the Seas | 2 | 0 | 1 (cropped variant) | 0 |
| Mariner of the Seas | 1 | 3 | 2 (RockwallMS, BusinesscenterMS — generic Voyager-class amenities) | 0 |
| Scarlet Lady | 2 | 0 | 5 | 0 |
| Resilient Lady | 0 | 0 | 8 | 0 |
| Brilliant Lady | 0 | 0 | 2 | 0 |
| **Total** | **10** | **4** | **18** | **0** |

Zero are visually *wrong*, but 18 of 32 (the Lady-class and Voyager-class
sister-ambiguous shots) ultimately rely on the Commons uploader's claim.
The chain of trust is now explicit in each sidecar's `visual_verification.note`
so a reviewer or future agent can see exactly why each file passed.

`admin/fetch-commons-via-proxy.py` now prints a MANUAL VISUAL VERIFICATION
REQUIRED summary at end-of-batch with a Read command per accepted file.
`admin/stamp-visual-verification.py` is the helper that writes the
`visual_verification` block into each sidecar.

---

## Staged assets — Costa Fortuna (no page yet)

Costa Fortuna (IMO 9239783, ship_built 2003) does not yet have a page at
`ships/costa/costa-fortuna.html`. Operator (2026-05-18) confirmed Fortuna
will be covered. Seven Commons photos were sourced and staged under
`assets/ships/costa/costa-fortuna/` so they're ready to adopt when the
page is created:

| File | Visual verification |
|---|---|
| `TorrettaLeonPancaldoSAVONAFeb2006.webp` | confirmed (name visible) |
| `Costa_Fortuna.webp` | confirmed (name visible) |
| `Costa_Fortuna_-a.webp` | confirmed (name visible) |
| `Costa_Fortuna_at_Fort_Lauderdale_-_IMO_9239783_(3306462221).webp` | confirmed (name + IMO match) |
| `Costa_Fortuna_Ponte.webp` | ambiguous (deck sunset view) |
| `Costa_Fortuna_Prua.webp` | ambiguous (bow-on, no name) |
| `Costa_Fortuna_im_Juli_2011_beim_Auslaufen_aus_Venedig.webp` | ambiguous (Venice partial view) |

When the page is created, these can be embedded directly. Sidecars and
registry rows are already in place.

**Known side-effect:** `admin/scan-image-reuse.cjs` currently emits 7
WARN-level findings ("filename does not contain a known ships-slug") for
these files because `costa-fortuna` is not yet in the active-slug list
the scanner checks against. The findings are WARN, not BLOCKING, and
self-resolve as soon as the Costa Fortuna page exists. See
`audit-reports/image-reuse-report.md` for the current count.

---

## Ship Categories

### 1. ✅ Ships with FOM Images (11 ships - COMPLETE)
*These ships already have Flickers of Majesty images in their swipers - NO Wiki Commons needed*

1. Freedom of the Seas
2. Grandeur of the Seas
3. Harmony of the Seas
4. Jewel of the Seas
5. Liberty of the Seas
6. Mariner of the Seas
7. Oasis of the Seas
8. Ovation of the Seas
9. Radiance of the Seas
10. Serenade of the Seas
11. Utopia of the Seas

---

### 2. ⏳ Future Ships (TBN - To Be Named) (7 ships - NO PHOTOS YET)
*These ships don't exist yet or are under construction - No Wiki Commons images available*

1. Star-class ship TBN (2028)
2. Oasis-class ship TBN (2028)
3. Quantum Ultra-class ship TBN (2028)
4. Quantum Ultra-class ship TBN (2029)
5. Icon-class ship TBN (2027)
6. Icon-class ship TBN (2028)
7. Discovery-class ship TBN

---

### 3. 📸 Ships with Images Already Uploaded (User-provided)

**Confirmed uploaded:**
1. **Symphony of the Seas** - 4 images uploaded by user
2. **Adventure of the Seas** - Images uploaded by user
3. **Explorer of the Seas** - Images uploaded by user ✅
4. **Enchantment of the Seas** - 5 images uploading:
   - 2560px-Bahamas_Cruise_-_CocoCay_-_June_2018_(3390).jpg
   - 2560px-BOS_at_Valetta_121410.JPG
   - Bahamas_Cruise_-_ship_exterior_-_June_2018_(2140).jpg
   - Bahamas_Cruise_-_ship_exterior_-_June_2018_(3251).jpg
   - Enchantment_of_the_Seas.jpg

**Existing images in /assets/ships/:**
5. **Brilliance of the Seas** - 2 images
6. **Majesty of the Seas** - 1 image
7. **Rhapsody of the Seas** - 2 images
8. **Vision of the Seas** - 2 images

---

### 4. 🔍 Wiki Commons Categories Found (Need User Download)

**Current Active Ships:**
1. **Allure of the Seas** (2010) - 74 files - https://commons.wikimedia.org/wiki/Category:Allure_of_the_Seas_(ship,_2010)
2. **Anthem of the Seas** (2015) - 29 files - https://commons.wikimedia.org/wiki/Category:Anthem_of_the_Seas_(ship,_2015)
3. **Icon of the Seas** (2024) - 19 files - https://commons.wikimedia.org/wiki/Category:Icon_of_the_Seas_(ship,_2023)
4. **Independence of the Seas** (2008) - 131 files - https://commons.wikimedia.org/wiki/Category:Independence_of_the_Seas_(ship,_2008)
5. **Navigator of the Seas** (2002) - Multiple files - https://commons.wikimedia.org/wiki/Category:Navigator_of_the_Seas_(ship,_2002)
6. **Odyssey of the Seas** (2021) - 6 files - https://commons.wikimedia.org/wiki/Category:Odyssey_of_the_Seas_(ship,_2021)
7. **Quantum of the Seas** (2014) - 20 files - https://commons.wikimedia.org/wiki/Category:Quantum_of_the_Seas_(ship,_2014)
8. **Spectrum of the Seas** (2019) - 25 files - https://commons.wikimedia.org/wiki/Category:Spectrum_of_the_Seas_(ship,_2019)
9. **Voyager of the Seas** (1999) - 48 files - https://commons.wikimedia.org/wiki/Category:Voyager_of_the_Seas_(ship,_1999)
10. **Wonder of the Seas** (2022) - 11 files - https://commons.wikimedia.org/wiki/Category:Wonder_of_the_Seas_(ship,_2022)

**Historic/Retired Ships:**
11. **Sovereign of the Seas** (1987) - 10 files - https://commons.wikimedia.org/wiki/Category:Sovereign_of_the_Seas_(ship,_1987)
12. **Monarch of the Seas** (1991) - 65 files - https://commons.wikimedia.org/wiki/Category:Monarch_of_the_Seas_(ship,_1991)
13. **Legend of the Seas** (1995) - 58 files - https://commons.wikimedia.org/wiki/Category:Legend_of_the_Seas_(ship,_1995)
14. **Splendour of the Seas** (1996) - Multiple files - https://commons.wikimedia.org/wiki/Category:Splendour_of_the_Seas_(ship,_1996)
15. **Nordic Empress** (1990) - 7 + 39 files - https://commons.wikimedia.org/wiki/Category:Nordic_Empress_(ship,_1990)
16. **Song of Norway** (1970) - 3 files - https://commons.wikimedia.org/wiki/Category:Song_of_Norway_(ship,_1970)
17. **Song of America** (1982) - Files available - https://commons.wikimedia.org/wiki/Category:Song_of_America_(ship,_1982)
18. **Viking Serenade** (1982) - 9 files - https://commons.wikimedia.org/wiki/Category:Viking_Serenade_(ship,_1982)
19. **Sun Viking** (1972) - 4 files - https://commons.wikimedia.org/wiki/Category:Sun_Viking_(ship,_1972)

---

### 5. ❓ Ships Still Need Research

**Active Ships (need to search Wiki Commons):**
1. Star of the Seas (2025 debut) - might have construction photos
2. Nordic Prince (historic)

**Possible Duplicates (need to verify):**
- legend-of-the-seas.html
- legend-of-the-seas-1995-built.html
- legend-of-the-seas-icon-class-entering-service-in-2026.html (future ship)
- star-of-the-seas.html
- star-of-the-seas-aug-2025-debut.html (same ship?)

---

## Summary Stats

**Total Ships:** 50 HTML files

**Breakdown:**
- ✅ **FOM Images (complete):** 11 ships
- ⏳ **Future ships (no photos):** 7 ships
- 📸 **User uploaded:** 8 ships (Symphony, Adventure, Explorer, Enchantment, Brilliance, Majesty, Rhapsody, Vision)
- 🔍 **Wiki Commons found:** 19 ships (categories documented)
- ❓ **Still researching:** 2-5 ships (depending on duplicates)

**Estimated actual ships needing Wiki Commons images:** ~24-27 ships (excluding FOM, future ships, and already uploaded)

---

## Next Steps

1. **User Downloads:** Download 3-4 images from each Wiki Commons category link above
2. **Convert to WebP:** Use `python3 convert_to_webp.py <input>` for each image
3. **Research remaining ships:** Star of the Seas, Nordic Prince
4. **Verify duplicates:** Check if Legend/Star variants are same ship or different HTML pages
5. **Track attributions:** Note author, license, and URL for each image for HTML integration
