# Site-wide flickr audit results — 2026-05-10

## Batch 1 (36 files audited)

### NOT_A_SHIP — DELETE (14 files)
| filename | actual subject |
|---|---|
| Amsterdam_flickr_Blende18.webp | Interior building atrium |
| Carnival_Fantasy_flickr_Mahon2000.webp | Venice masquerade couple |
| Celebrity_Century_flickr_JerryLukens.webp | Volcanic crater with steam plume |
| Celebrity_Xpedition_flickr_AndrewSmithOwen.webp | Hikers on Galapagos rocky trail |
| Celebrity_Xperience_flickr_GerryWynkoop.webp | B&W fish market women |
| Costa_Venezia_flickr_ThierryLARERE.webp | Stage dancers under purple light |
| Edam_flickr_DepictingPhotos.webp | Dutch town square with church |
| Horizon_flickr_cnmoumen.webp | Railway tracks at sunset |
| Insignia_flickr_mikecogh.webp | Owen Bowling Club mural with sheep |
| Leerdam_flickr_PhotompNL.webp | Snow-covered Dutch town |
| Maartensdijk_flickr_Stollie1.webp | Vintage Mercury car on street |
| Mardi_Gras_flickr_jpcrr.webp | Fiberglass shark sculpture |
| Marina_flickr_Siuloon.webp | Concrete pier on overcast day |

### UNCLEAR — INVESTIGATE (9 files)
- Carnival_Ecstasy, Carnival_Fascination, Carnival_Imagination
- Celebrity_Galaxy (interior cabin), Celebrity_Xploration (distant beach boats)
- Costa_Deliziosa, Costa_Fascinosa, Costa_Favolosa, Costa_Firenze

### CORRECT — KEEP (13 files)
- Allura, Brilliant_Lady, Carnival_Adventure, Carnival_Inspiration, Carnival_Sensation, Carnival_Tropicale, Celebrity_Mercury, Costa_Diadema, Costa_Pacifica, Costa_Toscana, Explora_I, Explora_Ii, Maasdam, Msc_Armonia

## Batches 2-5: pending

---

## Pattern observed
Filenames suggest ship name + Flickr photographer username. The Flickr public-feed API was apparently used to grab images by photographer-keyword rather than ship-keyword, resulting in a high contamination rate (~39% in batch 1). Same root cause as the prior 2026-04-12 audit noted in UNFINISHED_TASKS.md P0 section.

## Batch 2 (36 files audited) — running totals: 72 audited

### NOT_A_SHIP — DELETE (16 files)
| filename | actual subject |
|---|---|
| Msc_Divina_flickr_juricell.webp | Harry S. Truman plaque/monument |
| Msc_Euribia_flickr_DennisSHurd.webp | Cabin interior (chocolates + champagne) |
| Msc_World_Asia_flickr_gabry92g.webp | Corporate event stage with executives |
| Nautica_flickr_albofla1.webp | Modern luxury motor yacht (not Oceania Nautica) |
| Nieuw_Amsterdam_III_flickr_WimKok.webp | Vintage news clipping (German general + boys) |
| Noordam_III_flickr_ActiveSteve.webp | Theater interior with park ranger lecture |
| Noordam_II_flickr_PieterMusterd.webp | B&W portrait of young man in tuxedo |
| P_Caland_flickr_RobNS.webp | Statue/monument with skyscraper |
| Potsdam_flickr_jmeagher56.webp | Ice hockey game |
| Prinsendam_I_flickr_axiepics.webp | Mural of burning Royal Hotel |
| Queen_Anne_flickr_jimmywayne.webp | Victorian Queen Anne style house |
| Queen_Elizabeth_flickr_beareye2010.webp | Red British post box |
| Queen_Victoria_flickr_AwakenedArchives.webp | Portrait of bearded period gentleman |
| Regatta_flickr_hohokus.webp | Whitby harbor with red-sailed boat |
| Resilient_Lady_flickr_lorablong.webp | Two cocktails on a bar table |
| Msc_Seashore_flickr_Traveloscopy.webp | Empty theater interior |
| Msc_Virtuosa_flickr_janetg48.webp | Atrium glass view of cabin balconies |

### UNCLEAR (7 files)
- Msc_Fantasia, Msc_Lirica, Msc_Magnifica, Msc_Opera, Msc_Seaside, Nordic_Prince, Prinsendam (visible "AMERA" — ex-Prinsendam now Phoenix Reisen Amera)

### CORRECT — KEEP (12 files)
- Msc_Bellissima, Msc_Musica, Msc_Orchestra, Msc_Poesia, Msc_Preziosa, Msc_Seascape, Msc_Seaview, Msc_Sinfonia, Msc_Splendida, Nieuw_Amsterdam_II (ss-Nieuw-Amsterdam postcard), Nieuw_Amsterdam_IV, Noordam_IV

## Running totals (batches 1-2)
- 30 NOT_A_SHIP (42%)
- 16 UNCLEAR (22%)
- 26 CORRECT (36%)

## Batch 3 (36 files audited) — running totals: 108 audited

### NOT_A_SHIP — DELETE (11 files)
| filename | actual subject |
|---|---|
| Riviera_flickr_hormaud.webp | Paragliding scene over coastal cove |
| Ruby_Princess_flickr_rejwa1.webp | Cormorants on rocks |
| Ryndam_flickr_JosephHollick.webp | Sun rays over water from balcony |
| Seabourn_Quest_flickr_ThomasHawk.webp | Abstract spiral glass/light installation |
| Silver_Cloud_flickr_EmmeBiPhotos.webp | Rolls-Royce Silver Cloud automobile |
| Silver_Moon_flickr_failingangel.webp | 4-panel collage of singers performing |
| Silver_Muse_flickr_ianwyliephoto.webp | Moonlit seascape, no ship |
| Silver_Nova_flickr_mkarthigasu.webp | Renaissance portrait of a woman |
| Silver_Shadow_flickr_EmmeBiPhotos.webp | Rolls-Royce Silver Shadow automobile |
| Silver_Whisper_flickr_UltraPanavision.webp | Rio de Janeiro coastal seascape |
| Sirena_flickr_DivesGallaecia.webp | Museum bronze figurines and pottery |

### WRONG_SHIP — DELETE (2 files)
| filename | actual subject |
|---|---|
| Silver_Dawn_flickr_D70.webp | TUI Mein Schiff vessel (NOT Silversea) |
| Statendam_II_flickr_KevinGthe.webp | Modern HAL Vista-class ship (Statendam II was a 1929 liner — wrong era entirely) |

### UNCLEAR (12 files)
- Rotterdam_Iv (vintage portrait + lifeboat with "...RDAM"), Scarlet_Lady, Seabourn_Odyssey, Seabourn_Pursuit, Seabourn_Sojourn, Seven_Seas_Explorer, Seven_Seas_Mariner, Seven_Seas_Navigator, Seven_Seas_Splendor, Silver_Endeavour, Song_Of_America, Ss_Meridian

### CORRECT — KEEP (11 files)
- Rotterdam_V, Rotterdam_Vi, Seabourn_Encore, Seabourn_Ovation, Seabourn_Venture, Seven_Seas_Grandeur, Seven_Seas_Voyager, Silver_Origin, Silver_Ray, Silver_Spirit, Silver_Wind

## Running totals (batches 1-3) — 108 audited
- 41 NOT_A_SHIP (38%)
- 2 WRONG_SHIP (2%)
- 28 UNCLEAR (26%)
- 37 CORRECT (34%)

## Batch 4 (36 files audited) — running totals: 144 audited

### KEY INSIGHT
This batch revealed two distinct file generations:
- `Capital_Case_flickr_<PhotographerName>.webp` — legacy batch from Flickr photographer feeds, very high contamination rate
- `lowercase-with-dashes_flickr_new.jpg` — newer curated replacement set, mostly correct

The "_flickr_new.jpg" naming suggests these were intentionally re-sourced to fix contamination. Cleanup pattern: delete the broken `.webp`, keep the curated `.jpg`.

### NOT_A_SHIP — DELETE (10 files, all from legacy webp set)
| filename | actual subject |
|---|---|
| Statendam_flickr_wimhoppenbrouwers.webp | Anaglyph 3D photo of brick apartment building |
| Valiant_Lady_flickr_JONO202.webp | Bread basket with olive oil (restaurant interior) |
| Veendam_II_flickr_FotoMartien.webp | Steam locomotive 52 8060-7 |
| Vista_flickr_blauepics.webp | Aerial beach scene with umbrellas |
| Volendam_II_flickr_TruusBobJantoo.webp | B&W Cinema Pathé still of musicians in kitchen |
| Volendam_flickr_DecalDigitaleCommuni.webp | B&W man with soccer ball and children |
| W_A_Scholten_flickr_HenkBinnendijk.webp | Historic mansion with geese on lawn |
| Westerdam_I_flickr_TrackWalker.webp | Sunset cloudscape from ship railing (no ship) |
| Zenith_flickr_joemastrullo.webp | Harris's hawk on falconer's glove |

### UNCLEAR (6 files)
- Statendam_Iii (vintage HAL Cruises postcard — likely valid historical reference)
- Veendam_III, Volendam (cabin interior), costa-diadema, msc-armonia (two MSC ships), msc-meraviglia2, msc-musica (no name visible)

### CORRECT — KEEP (16 files; mostly from the curated `_flickr_new.jpg` set)
- Zuiderdam (legacy webp; correct)
- costa-deliziosa, costa-fascinosa, costa-favolosa, costa-pacifica, costa-smeralda
- emerald-princess2, emerald-princess, grand-princess
- insignia (curated jpg correct, original Insignia.webp was wrong)
- msc-divina, msc-euribia, msc-fantasia, msc-grandiosa (correct! cf. deleted legacy bobindrums.webp), msc-lirica, msc-magnifica, msc-opera, msc-orchestra, msc-poesia, msc-preziosa

## Running totals (batches 1-4) — 144 audited
- 51 NOT_A_SHIP (35%)
- 2 WRONG_SHIP (1%)
- 34 UNCLEAR (24%)
- 57 CORRECT (40%)

## Batch 5 (33 files audited) — running totals: 177 audited (FINAL)

### NOT_A_SHIP — DELETE (1 file)
- resilient-lady_flickr_new.jpg → Victorian house with stop sign

### UNCLEAR (5 files)
- msc-sinfonia (children's splash pad), regatta (pool deck), seven-seas-mariner (name unreadable), seven-seas-splendor (distant), silver-dawn (sunset, name not visible)

### CORRECT — KEEP (27 files)
Curated _flickr_new.jpg set: msc-seascape, msc-seashore, msc-splendida, msc-virtuosa, nautica, queen-anne, queen-elizabeth, queen-victoria, riviera, scarlet-lady, seabourn-encore/odyssey/ovation/quest/sojourn/venture, seven-seas-explorer/navigator, silver-cloud, silver-endeavour, silver-moon, silver-ray, silver-shadow, silver-spirit, silver-whisper, silver-wind, valiant-lady

## FINAL TOTALS (177 files audited)
- **53 NOT_A_SHIP** (30%) — confirmed wrong, candidates for deletion
- **2 WRONG_SHIP** (1%) — wrong cruise line/era
- **39 UNCLEAR** (22%) — image quality / angle / distance prevented identification
- **83 CORRECT** (47%) — verified

The lowercase-with-dashes `_flickr_new.jpg` curated set is ~85% correct (only 1 wrong, 5 unclear out of 33).
The legacy `Capital_Case_flickr_<Photographer>.webp` set is ~36% wrong, ~24% unclear.
