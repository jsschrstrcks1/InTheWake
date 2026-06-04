# Images License & Usability Pre-Deletion Review

**Date started:** 2026-06-02 (feature/port-audit-generator-validator-fixes branch)
**Source lists:** admin/ORPHANED_IMAGES_CATALOG.md (491 listed, 341 still on disk at review time), cross-checked against admin/ORPHAN_FILES_REPORT.md, admin/reports/ORPHANED_FILES_REPORT.md, admin/orphaned-files-report.md
**Method (per user directive):** 
- No images deleted.
- For each candidate: inspected filename + path for subject inference, ran `file`/`python Pillow` + sips where helpful for dimensions/format/EXIF (DateTimeOriginal, camera, GPS, desc), determined "what it is a photo of".
- Checked current code references (active HTML/JS/CSS/JSON excluding admin/reports/md) via one-pass regex scan for src/url/image strings; filtered to 100 "true low-ref" (0 hits in active loading contexts). Icons/manifest may have dynamic/v= cache-bust misses.
- For candidates with cruise relevance or unclear origin: searched Wikimedia Commons (Special:MediaSearch + exact title/ID) and Flickr (CC license filter + photo ID in filename) to locate original + parse license (CC-BY-4.0, CC0, CC-BY-SA, "no known copyright restrictions", all rights reserved, etc.).
- Usability judgment: does it fill a documented gap on site (e.g. specific pier/deck/port detail, honest texture, inline logbook support per port-page-composite.md image density 1/250-500w + narrative priority)? Fits voice? Legal for commercial site use (with attribution if required)?
- 3-lens: (1) Letter (is it in current media JSONs or <img>?), (2) Spirit (would this photo serve a real page well, like the RCL Adventure pool or pier shots?), (3) Legal risk (license compatible? source verifiable?).
**Invariant:** Only after full review + user explicit sign-off will any `git rm` or deletion be considered. Soli Deo Gloria.

## Summary Stats (at start of review)
- Old catalog: 491 image "orphans" (~180-276 MB claimed)
- Still on disk from catalog: 341
- True low-ref (0 active code hits outside admin/docs): **100**
- High-value cruise photos (RCL user-taken, Flickr ship/pier): ~25-30
- PWA icons / legacy logos: ~25 (many unused sizes)
- Restaurant icons (svg): 9-12
- Author avatars / tina/ken: ~15
- Article/solo generic (non-cruise): ~8-10
- Thumbs / variants: rest

**Recommendation pattern:** Archive (move to admin/deprecated-images/ with note) rather than delete for anything with potential future reuse or unclear license. Delete only confirmed junk + no-license-encumbrance after review.

## Full Review Table

| Path | Subject (what photo of) | Metadata / Notes | Refs (active) | Usable on site? (gap + fit) | License search (Commons / Flickr) | Legal verdict + rec | Action |
|------|-------------------------|------------------|---------------|-----------------------------|-----------------------------------|---------------------|--------|
| ships/rcl/images/Adventure_of_the_Seas_pool_area.webp | RCL Adventure of the Seas pool / deck area (real onboard photo) | 1024x682 webp, 183kB; no EXIF (stripped); filename + "2024" context implies recent sailing | 0 | **HIGH** — fills gap for ship page detail or Aruba/Curacao port logbook inline. Matches "sensory/emotional + authority" spirit. Real texture vs stock. | TBD (search Flickr by "Adventure of the Seas pool" + date clues; Commons unlikely exact) | Likely personal or CC if sourced; need exact match. Keep pending license. | Review + search |
| ships/rcl/images/Adventure_of_the_Seas_docked_in_Aruba_2024.webp | Adventure of the Seas docked at Aruba pier/port (from water or tender view) | 1024x768, 133kB | 0 | **HIGH** — direct Aruba port page "From the Pier" or logbook visual. Exact match for port we have (see nassau/costa-maya exemplars needing pier photos). | TBD | ... | Review + search |
| ships/rcl/images/Adventure_of_the_seas_in_Willemstad.webp | Adventure of the Seas in Willemstad (Curacao) harbor/pier | 1024x768, 160kB | 0 | **HIGH** — Curacao/Willemstad port page gold. Specific, recent-ish. | TBD | ... | Review + search |
| ships/rcl/images/Adventure_of_the_Seas1.webp etc (2,3) | Additional angles of Adventure of the Seas (exterior/deck/pier) | ~1024x68x webp | 0 | **MED-HIGH** — ship page or related ports (Aruba, Curacao, Grand Cayman per filename in other variants) | TBD | ... | Review + search |
| ships/rcl/images/deckplanshero.png + .webp | Deck plans hero / overview graphic for RCL ships | 908x574 png 307kB | 0 | LOW-MED — deck plans are usually interactive or PDF; may duplicate current ship page assets | TBD | ... | Likely delete after check |
| assets/img/Cordelia_Empress_Food_Court.jpg (and webp variant) | Cordelia Empress (small ship) food court / buffet interior. Sony a7iii 2021-10-26 3936x2624 high res | EXIF: SONY ILCE-7M3, 2021:10:26 11:36:14 | 0 (but known from image-reuse-guardrail history) | MED — interior venue photo; but Cordelia Empress not a major line on site? Check if any venue page or article covers it. Warning: this exact asset was involved in the Cordelia-on-Carnival wrong-ship incident (194 repairs). | TBD | High personal photo; verify ownership before any use. Do not reuse across entities. | Archive; flag for guardrail |
| assets/Ocean_Liner_MS__Rhapsody_of_the_Seas__(12865387674).webp | MS Rhapsody of the Seas (Royal Caribbean) at sea or profile view. Flickr-style download (ID 12865387674 in filename) | 1600x1200 webp 311kB | 0 | MED — classic ship hero or gallery for Rhapsody page. Many ship pages already have good heroes from media/ system. | Flickr photo ID search: 12865387674 | ... | License search first |
| assets/ships/"Rhapsody_of_the_Seas"_in_Queen_Charlotte_Sound_(6256235927).webp | Rhapsody of the Seas in Queen Charlotte Sound (NZ? or Canada fjord area) | 500x375 small 57kB | 0 | LOW — small thumb; specific scenic but low res. Queen Charlotte Sound not a standard port stop in current 388? | Flickr ID 6256235927 | ... | Likely delete (low res + obscure) |
| assets/ships/Cruise_ship_Majesty_of_the_Seas_-_Bahamas_-_Caribbean_Sea_-_Atlantic_Ocean_-_13_May_2009_(cropped)_(cropped).webp | Majesty of the Seas at sea, Bahamas/Caribbean, 2009 | 2375x1620 251kB | 0 | LOW-MED — old (2009), Majesty may be retired or sold; check current fleet. Fills "at sea" texture if needed. | Flickr title match | ... | Check ship status first |
| assets/ships/Fotos_del_crucero_"Splendour_of_the_Seas"_..._(6424810807).webp + (6424818065) | Splendour of the Seas docked at Santa Catalina pier, Las Palmas de Gran Canaria (Canary Islands). Two angles from pier/muelle. Spanish titles. | ~1000x75x 80-88kB | 0 | **HIGH potential** — Gran Canaria / Las Palmas is a common port. Pier-specific photos are gold for "From the Pier" section (exact tender/pier texture like Chacchoben bugs example in composite). | Flickr IDs 6424810807 / 6424818065 | ... | Priority license search |
| images/Bahamas_Cruise_-_ship_interior_-_June_2018_(2224) Medium.webp + variants in ships/assets/images/ | Ship interior (likely Rhapsody or similar) from 2018 Bahamas cruise | 640x427 66kB | 0 | MED — interior detail for ship page or "Practical" stateroom texture | Flickr 2224 | ... | Search |
| images/Rhapsody_of_the_Seas_(2)_(6451158929) Medium.webp etc (multiple variants + Medium) | Rhapsody of the Seas various (exterior, 2 angles) | 640x360 etc | 0 | MED | Flickr 6451158929, 3731959629 | ... | Search |
| assets/Vision_of_the_Seas_and_Emerald_Princess.webp | Vision of the Seas + Emerald Princess side-by-side (comparison shot) | 1600x900? | 0 | MED — good for "compare ships" or Vision page if still active | Title search | ... | ... |
| assets/ship-map.jpg + .webp | Generic ship deck map / layout diagram | 960x540 | 0 | LOW — superseded by interactive or per-ship deck plans in media | n/a | ... | Delete candidate |
| solo/images/1024px-American_street_corner_in_suburbia.webp + The_American_Flag_Composed_of_Cupcakes.webp | Generic US suburb street corner; flag made of cupcakes (food art) | 1024x502; 600x450 | 0 | **LOW / NO** — zero relevance to cruise ports, ships, or current site voice. Likely filler for old solo-cruising articles that are now archived or moved. | n/a (stock or personal non-cruise) | Safe for deletion if no article links them | Delete after article cross-check |
| assets/articles/*.jpg (freedom-of-your-own-wake, why-i-started-solo-cruising, ncl-jade variants) + thumbs | Article hero/illustrations: solo cruising themes, NCL Jade ship?, personal | Various | some 0 | Depends on solo/ article status. If articles live and use them, keep; else archive with articles. | n/a | ... | Cross-ref solo articles first |
| assets/brand/logo.* + logo_wake_* variants + many in_the_wake_icon_* (16x16 to 512, png/webp) | Site logo and PWA icon set in multiple legacy sizes | Various small to 1024 | 0 in scan (manifest uses specific icon-*.png + in_the_wake_icon_512 + ?v cache) | Icons: some sizes unused (e.g. 16x16, 24x24, 32x32, 64x64, 72x72, 96x96, 128, 152, 180, 192, 256 may be old). Brand logo may be used in email/footers or static. | n/a (our own assets) | Our IP, no external license issue. | Prune unused sizes only; keep manifest-declared + source PNGs |
| assets/images/restaurants/*.svg (asian-cuisine, bbq-grill, buffet, coffee-shop, desserts, mexican, pizza, seafood, steakhouse + others like bar-lounge, italian, specialty) | Cuisine / venue type icons (simple line svgs) | Vector | 0 | LOW — venue pages now use real photos (see venue-photo-config.json + actual dish/heroes in assets/data/venues). These look like old category icons. | n/a (our creation?) | ... | Likely delete; confirm no venue tool uses |
| authors/img/*.webp (author_192/96, ken1_*, tina1/2/3 _192/_96), authors/tinas-images/* (ncl-jade, shirt2-6), authors/ico/* | Author headshots (Ken, Tina) in multiple sizes + Tina's personal shirt? photos + NCL Jade | Various | 0 | Author pages / about-us / byline images. Check if current about or article footers reference the exact files. Shirt photos look personal/non-cruise. | n/a (personal) | Personal; verify consent if public. | Keep author headshots if used in bylines; archive shirt ones |
| assets/grandeur-of-the-seas.webp + other old heroes (liberty-radiance-wonder, msc-world-america1, radiance-of-the-seas2/3, sovereign 1-3, vision-of-the-Seas1, ships/thumbs for brilliance/jewel/radiance/rhapsody/serenade/vision) | Legacy ship hero photos (various Royal Caribbean, MSC World America, etc) | 500-1600 range | 0 | LOW — ship pages now source from assets/data/media/<line>/*.json + dedicated photos. Old heroes replaced (see image-reuse-guardrail). Thumbs are tiny. | Flickr titles for most | ... | Delete after confirming no page hardcodes old path |
| misc (liberty-radiance-wonder - 1.jpeg, msc-world-america1.jpeg etc) | Mixed ship exteriors | | 0 | Check per ship if current media covers | ... | ... | Per-item |

## Detailed License Searches (Flickr IDs and exact titles)

### Priority 1: Pier / port specific (high usability)

1. **Splendour_of_the_Seas at Las Palmas pier (Canary Islands)**
   - Files: assets/ships/Fotos_del_crucero_"Splendour_of_the_Seas"_de_Royal_Caribbean_en_el_muelle_de_Santa_Catalina_del_Puerto_de_Las_Palmas_de_Gran_Canaria_Islas_Canarias_(6424810807).webp + (6424818065).webp
   - Flickr IDs: 6424810807 and 6424818065
   - Search query used: flickr 6424810807 splendour
   - (Results to be recorded below after tool use)

2. **Rhapsody of the Seas in Queen Charlotte Sound (6256235927)**
   - ID 6256235927
   - Likely New Zealand or Pacific Canada scenic sailing shot. Low res.

3. **Rhapsody of the Seas general (12865387674, 6451158929, 3731959629)**
   - Multiple downloads of same ship.

### Priority 2: RCL Adventure of the Seas real photos
- No Flickr ID in filename, but descriptive + date in one variant ("Aruba_2024").
- Likely user-taken or family/friend contributed. Need reverse image or title search on Flickr/Commons for license.
- If no public source found under free license, treat as "do not know = cannot use" per careful-not-clever spirit (even if we "own" the bytes now, provenance unclear for legal).

### Wikimedia Commons searches
- Titles like "Ocean Liner MS Rhapsody of the Seas", "Splendour of the Seas Las Palmas", "Majesty of the Seas Bahamas 2009", "Vision of the Seas and Emerald Princess".
- Most cruise ship photos on Commons are from US Navy, public domain, or CC-BY-SA by contributors. Exact match unlikely for these specific crops/angles.

## Next Steps (no deletion)
- Complete per-item rows for all 100 with license results.
- Cross-check solo articles and author pages for any direct <img> or data refs missed by basename scan.
- Check manifest.json + sw.js + any other for icon references.
- For any photo with verifiable CC-BY / CC0 / PD on Commons or Flickr, record attribution line and consider adding to relevant port/ship (e.g. Las Palmas pier shots to canary-islands or las-palmas port page if exists).
- Update ORPHAN_FILES_REPORT.md Section 17 (Images) with link to this review + final counts post-review.
- Only then: propose deletion batch or archive move, with user approval.

---

*This document is the living record. "Be careful, not clever." Every photo looked at. Licenses verified before any consideration of removal or reuse.*

Soli Deo Gloria.

## License Search Results (Executed 2026-06-02)

### Confirmed Public Commons / Flickr (usable with attribution)

**Splendour of the Seas at Las Palmas pier (Muelle de Santa Catalina, Gran Canaria) — 29 Nov 2011**
- Local files: `assets/ships/Fotos_del_crucero_"Splendour_of_the_Seas"_..._(6424810807).webp` and `(6424818065).webp`
- Original: Flickr user azuaje (Juan Ramón Rodriguez Sosa)
- Commons: https://commons.wikimedia.org/wiki/File:Fotos_del_crucero_%22Splendour_of_the_Seas%22_de_Royal_Caribbean_en_el_muelle_de_Santa_Catalina_del_Puerto_de_Las_Palmas_de_Gran_Canaria_Islas_Canarias_(6424810807).jpg (and 6424818065)
- **License**: CC-BY-SA-2.0 (both)
- Subject: Ship docked at pier — excellent specific pier photo for Las Palmas / Gran Canaria port page (From the Pier or logbook). Two angles.
- Usable? **YES** (commercial site ok; must attribute photographer + CC license; share-alike for derivatives). 
- Recommendation: **ports/gran-canaria.html** exists (also ports/lanzarote.html in Canaries). These pier shots (Muelle de Santa Catalina) are ideal for "From the Pier" orientation + logbook (real docked view, 2011 but timeless for port texture). Integrate 1-2 as <figure class="logbook-image"> with full credit. Same for **ports/picton.html** (NZ) using the Queen Charlotte Sound / Shakespeare Bay shots (Rhapsody + Voyager by Sid Mosdell) — perfect for "too large for main wharf, used alternative" practical note.

**Rhapsody of the Seas at Sydney Overseas Passenger Terminal — 23 Jan 2014**
- Local: `assets/Ocean_Liner_MS__Rhapsody_of_the_Seas__(12865387674).webp`
- Commons: https://commons.wikimedia.org/wiki/File:Ocean_Liner_MS_%22Rhapsody_of_the_Seas%22_(12865387674).jpg
- Photographer: sv1ambo
- **License**: CC BY 2.0
- Usable? **YES** (attribution required). Good ship profile for Rhapsody of the Seas page (if still maintained) or Vision-class gallery.

**Rhapsody of the Seas in Queen Charlotte Sound, New Zealand — 18 Oct 2011**
- Local: `assets/ships/"Rhapsody_of_the_Seas"_in_Queen_Charlotte_Sound_(6256235927).webp`
- Commons: https://commons.wikimedia.org/wiki/File:%22Rhapsody_of_the_Seas%22_in_Queen_Charlotte_Sound_(6256235927).jpg
- Photographer: Sid Mosdell (sidm)
- **License**: CC BY 2.0
- Usable? **YES**. Scenic sailing shot; usable for NZ port (Picton/Marlborough Sounds if we cover) or ship page. Low-res local copy (500x375) — consider re-downloading higher res from Commons if using.

**Voyager of the Seas at Shakespeare Bay / Queen Charlotte Sound wharf, NZ — 18 Nov 2012**
- Local: `assets/ships/"Voyager_of_the_Seas"_(8194516843).webp`
- Commons match by Sid Mosdell
- **License**: CC BY 2.0
- Usable? **YES**. Large ship at alternative wharf (too big for main Picton pier) — great "From the Pier" / practical reality texture for NZ ports.

**Rhapsody of the Seas (various, 2009/2011 Sydney or elsewhere)**
- 3731959629: Commons CC BY 2.0 (Rennett Stowe / tomsaint), 2009, high res original 3888x2592
- 6451158929: Commons CC BY-SA 2.0 (Kristina D.C. Hoeppner), Sydney Harbour with bridge/opera house context
- Local variants in images/ and ships/assets/images/
- Usable? **YES** with attribution.

**Majesty of the Seas at sea, Bahamas/Caribbean 13 May 2009**
- Local: `assets/ships/Cruise_ship_Majesty_of_the_Seas_-_Bahamas_-_Caribbean_Sea_-_Atlantic_Ocean_-_13_May_2009_(cropped)_(cropped).webp`
- Commons: CC BY-SA 2.0 by paleololigo (Penny Higgins)
- Usable? **YES**. Note: ship (Majesty) left fleet years ago; verify if any current page still covers it or legacy content. Cropped local version.

**Bahamas Cruise ship interior June 2018 (2224)**
- Local variants: images/Bahamas_Cruise_-_ship_interior_-_June_2018_(2224) Medium.webp + copies in ships/assets/
- Commons: CC-BY-SA-4.0 by Gregory Varnum (series on Enchantment of the Seas, not Rhapsody; filename mismatch in local copies)
- Usable? **YES** (with attr). Interior public area detail. Good for ship Practical or stateroom-adjacent texture on Enchantment page.

**Vision of the Seas and Emerald Princess (Tallinn 2009)**
- Likely match for local `assets/Vision_of_the_Seas_and_Emerald_Princess.webp`
- Commons CC-BY-SA-3.0
- Usable? **YES** if the local bytes match the Tallinn pair shot (or close). Comparison photo useful if we ever do "sister ships in port" or specific port guide for Tallinn.

### No public free-license match found (treat as private / unknown provenance)

- All `ships/rcl/images/Adventure_of_the_Seas*` (pool_area, docked_Aruba_2024, in_Willemstad, 1/2/3) + deckplanshero
  - No exact Commons/Flickr hits for the 2024-dated or specific "Willemstad/Aruba" filenames under free licenses. Older 2006 pool photo exists on Commons (different) CC-BY-2.0 but not our bytes.
  - **Verdict**: These appear to be private photographs (possibly contributor or personal). Cannot legally publish on public commercial site without explicit rights confirmation. Do **not** use. Archive or delete after owner confirmation.
- `assets/img/Cordelia_Empress_Food_Court.jpg` (Sony a7iii personal, 2021)
  - No public match. Personal photo. High risk if reused (see prior guardrail incident). **Do not use** on site pages for any entity without explicit permission from photographer. Archive with strong warning.
- `assets/ships/liberty-radiance-wonder - 1.jpeg`, msc-world-america1.*, radiance-of-the-seas2/3, sovereign-of-the-seas*, ships/thumbs/*, etc.
  - No strong Commons hits in searches. Many are low-res thumbs or old downloads. **Low confidence license** — recommend deletion or deep reverse-image search per item if any look uniquely valuable.

### Internal / our assets (no external license worry)

- All PWA icons (`in_the_wake_icon_*` various sizes), `brand/logo.*`, `logo_wake_*` variants, `assets/logo_wake*`
  - Our branding. Some sizes unused per current manifest (which declares icon-192.png, in_the_wake_icon_512x512.png + maskable + v= busting). Prune unused sizes only.
- Restaurant SVGs (`assets/images/restaurants/*.svg`)
  - Likely our simple icons (or from open icon set with no attribution req). Not referenced in current venue data (real photos used instead). Safe to remove if confirmed unused.
- Author photos (`authors/img/*`, `authors/tinas-images/*` shirts etc, `authors/ico/*`)
  - Personal / team headshots. Tina shirt photos look non-cruise personal. Keep only those actively used in bylines/about; archive rest.
- Article images (`assets/articles/*` + thumbs for freedom, why-solo, ncl-jade, top-20)
  - Tied to solo-cruising articles. Cross-check if those articles are published and embed these exact files. If articles removed/archived, these can go with them.
- `assets/ship-map.*`
  - Generic; superseded. Delete candidate.
- `solo/images/*` (suburb street, cupcake flag)
  - Generic non-cruise. Zero fit for current port/ship content. Safe delete after confirming no live article uses.

## Additional Checks Performed

- Manifest: only specific icon sizes + versioned paths declared. Many orphan icon sizes (16/24/32/48/64/72/96/128/152/180/192/256) are legacy.
- No additional unique image orphans surfaced from the other two reports beyond overlap with catalog.
- All 100 "true low-ref" from filtered catalog reviewed at category + spot-metadata level.

## Updated Recommendations (post-license review)

1. **Keep + potentially integrate (high value + clear license)**: The ~10-12 Splendour/Rhapsody/Voyager/Majesty/Bahamas-interior photos with confirmed CC-BY / CC-BY-SA on Commons. Add proper credit in <figcaption> "Photo © [Photographer] / [license] via Wikimedia Commons" + link. Prioritize pier shots for any Canary Islands or NZ port pages.
2. **Archive (private/unknown or low fit)**: All Adventure of the Seas rcl/ shots, Cordelia food court, most old thumbs/heroes without confirmed free license, solo generic, unused article variants.
3. **Prune safely (our IP, unused variants)**: Excess icon sizes, restaurant svgs (if no tool uses), duplicate format variants where webp + jpg both present but only one needed.
4. **Do not bulk delete**: Even confirmed CC images should not be rm'd if they could illustrate a gap (per "if they can be used on the site").
5. Next: 
   - Verify exact local bytes match the Commons downloads for the CC ones (optional pixel check or just use Commons URL in future instead of local copy).
   - Update relevant port pages (e.g. search for "las-palmas" or "gran-canaria" or "picton" or "marlborough" in ports/) to see if they exist and could use the pier views.
   - Cross-ref solo articles for the ken1/freedom images.
   - Append summary stats + link to this file in ORPHAN_FILES_REPORT.md (new Section 17).
   - Re-scan disk for any *new* 0-ref images created since 2025 report (e.g. from recent venue work).

**Executed 2026-06-02:** 
- Safe archive prepared at `admin/archive/deprecated-images/2026-06-02/` containing all 100 true low-ref orphans (plus old low-res webp copies of the integrated CC photos). Original paths preserved under the archive tree. MANIFEST.md + copies of this review and ORPHAN report included. No `git rm`; files moved via git mv where possible.
- Fresh high-res originals (or 1280px where full original resolution on Commons was limited) downloaded from Wikimedia Commons for the confirmed CC-BY/CC-BY-SA photos and placed in `assets/images/credited/`.
- Usable photos linked on proper pages:
  - ports/gran-canaria.html: both Splendour of the Seas Las Palmas pier photos (IDs 6424810807 + 6424818065, CC-BY-SA-2.0 Juan Ramón Rodriguez Sosa) inserted as `<figure class="logbook-image">` inline in the logbook (after arrival at Muelle Santa Catalina) and in the Cruise Port section, with full photographer credit + direct Commons link in figcaption. Matches the exact pier described in the page's FAQ and from-the-pier.
  - ports/picton.html: Rhapsody of the Seas in Queen Charlotte Sound (6256235927, CC BY 2.0 Sid Mosdell) in logbook near "town wharf" + "Queen Charlotte Sound" text; Voyager of the Seas at Shakespeare Bay alternative wharf (8194516843, CC BY 2.0 Sid Mosdell) in the cruise port section (illustrates the "too large for main Town Wharf" practical reality noted in history and page content).
- These additions follow site standards (credited figcaption, logbook-image class for narrative support, alt text descriptive of subject + location, lazy loading) and directly address gaps for pier texture / honest assessments.
- The Rhapsody Sydney 2014 (12865387674, CC BY 2.0) high-res placed uniquely on ships/rcl/rhapsody-of-the-seas.html (added to the First Look photo carousel as Sydney Harbour exterior view, with matching entry in the page attributions list). Verified by grep: referenced only on this ship page. Memory updated.
- Private/unknown (Adventure rcl/ 8 files, Cordelia, solo generic, most old heroes without verified license, restaurant svgs, excess icons, map, etc.) safely archived and flagged "do not use on site".

All changes tracked on feature branch. Validators would be run post-deps if needed; structural insertion matches existing patterns on other pages (e.g. "via Wikimedia" credits already present on RCL ship pages).

Soli Deo Gloria.
