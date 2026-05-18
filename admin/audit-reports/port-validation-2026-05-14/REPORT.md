# Port Validation Baseline — 2026-05-14

**Validator:** `admin/validate-port-page-v2.js --all-ports`
**Run timestamp:** 2026-05-14T12:02:00Z
**Branch:** `claude/port-validation-fixes-qajFr`
**Raw JSON:** `admin/audit-reports/port-validation-2026-05-14/all-ports-results.json` (3.3 MB, 387 port objects)
**Summary:** `admin/audit-reports/port-validation-2026-05-14/summary.json`

This is the canonical baseline for the "every port to 100/0/0" sweep.

## Top-line numbers

| Metric | Count |
|---|---:|
| Total port pages validated | 387 |
| **Score 100 with 0 warnings** (all 5 are validator-skipped redirects / non-port pages) | **5** |
| Score 100 with warnings (real port: `south-pacific`) | 1 |
| Score 90–99 (no blockers, light warnings) | 16 |
| Score 80–89 | 30 |
| Score 70–79 | 57 |
| Score 60–69 | 170 |
| Score 50–59 | 73 |
| Score 30–49 | 25 |
| Score 1–29 | 10 |
| **Truly perfect non-skipped port pages** | **0** |
| **Failing (≥1 blocking error)** | **283** |
| **Passing with warnings** | **99** |
| Total blocking-error instances | 417 |
| Total warning instances | 4,842 |
| **Total findings to clear for 100/0/0 fleet** | **5,259** |

## Blocking rules (16 distinct, in 283 ports)

| Rule | Ports affected | Total instances |
|---|---:|---:|
| `weather_sub/weather_validation_failed` | 260 | 260 |
| `image_refs/missing_image_file` | 49 | 49 |
| `rendering/missing_stylesheet` | 25 | 37 |
| `structure/collapsible_required` | 36 | 36 |
| `basic_html/missing_main_content` | 13 | 13 |
| `tender_port/missing_tender_indicator` | 4 | 4 |
| `section_order/out_of_order` | 3 | 3 |
| `content_purity/forbidden_hype` | 3 | 3 |
| `articles_sub/recent_articles_validation_failed` | 2 | 2 |
| `port_images/no_port_images` | 2 | 2 |
| `content_purity/forbidden_drinking` | 2 | 2 |
| `content_purity/forbidden_nightlife` | 2 | 2 |
| `html_integrity/stray_details_tag` | 1 | 1 |
| `poi_coords/poi_in_water` | 1 | 1 |
| `rubric/booking_guidance` | 1 | 1 |
| `tender_port/false_tender_indicator` | 1 | 1 |

> Note: `weather_sub/weather_validation_failed` is the only blocker on 184 ports and is mixed with other blockers on 76 more.

## Top 40 warning rules (57 distinct, in 382 ports)

| Rule | Total instances |
|---|---:|
| `images/image_reuse_alt_drift` | 742 |
| `basic_html/missing_canonical_nav_items` | 370 |
| `noscript/missing_stories_noscript` | 347 |
| `noscript/missing_ships_noscript` | 343 |
| `rendering/missing_css_version` | 330 |
| `poi_manifest/insufficient_pois` | 288 |
| `poi_manifest/poi_ids_without_pois` | 259 |
| `noscript/placeholder_map_noscript` | 250 |
| `gallery/gallery_credit_low_diversity` | 182 |
| `logbook_narrative/first_person_maximum` | 178 |
| `weather_widget/generic_noscript_weather` | 162 |
| `poi_manifest/unresolved_poi_ids` | 162 |
| `voice_quality/voice_v01` | 152 |
| `author_consistency/disclaimer_logbook_contradiction` | 129 |
| `noscript/missing_gallery_noscript` | 92 |
| `images/generic_alt_text` | 75 |
| `author_disclaimer/experience_level_missing` | 64 |
| `voice_quality/voice_v03` | 62 |
| `voice_quality/voice_v06` | 53 |
| `images/short_alt` | 51 |
| `images/filename_slug_mismatch` | 47 |
| `html_structure/duplicate_html_ids` | 45 |
| `logbook_narrative/emotional_pivot_weak` | 38 |
| `icp/ai_summary_standalone_sentence` | 36 |
| `html_structure/missing_h1` | 33 |
| `basic_html/missing_twitter_cards` | 33 |
| `voice_quality/voice_v04` | 32 |
| `voice_quality/voice_v05` | 27 |
| `rendering/missing_script` | 26 |
| `voice/anaphora_ladder` | 22 |
| `unique_names/names_detected` | 20 |
| `swiper/missing_swiper_ready` | 20 |
| `service_worker/missing_sw_registration` | 16 |
| `content/last_reviewed_stamp_missing` | 12 |
| `port_images/potential_duplicate_images` | 12 |
| `basic_html/missing_og_tags` | 11 |
| `logbook_narrative/opening_hook` | 10 |
| `logbook_narrative/sensory_detail` | 10 |
| `images/maximum_images` | 10 |
| `mexican_port_notices/missing_revolution_day` | 9 |

## All failing ports (283)

**Total: 283 failing ports**

| Score | Blockers | Warns | Port |
|---:|---:|---:|---|
| 16 | 3 | 27 | `ports/durban.html` |
| 16 | 5 | 17 | `ports/hong-kong.html` |
| 18 | 4 | 21 | `ports/colon.html` |
| 18 | 3 | 26 | `ports/port-moresby.html` |
| 20 | 5 | 15 | `ports/south-shetland-islands.html` |
| 22 | 4 | 19 | `ports/chilean-fjords.html` |
| 22 | 5 | 14 | `ports/singapore.html` |
| 24 | 2 | 28 | `ports/luanda.html` |
| 28 | 4 | 16 | `ports/copenhagen.html` |
| 28 | 4 | 16 | `ports/manila.html` |
| 30 | 4 | 15 | `ports/corfu.html` |
| 30 | 2 | 25 | `ports/mindelo.html` |
| 30 | 4 | 15 | `ports/torshavn.html` |
| 32 | 4 | 14 | `ports/shanghai.html` |
| 34 | 4 | 13 | `ports/puerto-montt.html` |
| 34 | 4 | 13 | `ports/tobago.html` |
| 34 | 4 | 13 | `ports/tokyo.html` |
| 36 | 4 | 12 | `ports/palau.html` |
| 36 | 5 | 7 | `ports/sydney.html` |
| 42 | 1 | 24 | `ports/hurghada.html` |
| 44 | 3 | 13 | `ports/ho-chi-minh.html` |
| 44 | 1 | 23 | `ports/panama-canal.html` |
| 44 | 3 | 13 | `ports/santa-marta.html` |
| 44 | 3 | 13 | `ports/tianjin.html` |
| 46 | 3 | 12 | `ports/amalfi.html` |
| 46 | 3 | 12 | `ports/royal-beach-club-antigua.html` |
| 46 | 4 | 7 | `ports/trinidad.html` |
| 48 | 2 | 16 | `ports/baltimore.html` |
| 48 | 3 | 11 | `ports/kagoshima.html` |
| 48 | 3 | 11 | `ports/mumbai.html` |
| 48 | 3 | 11 | `ports/philipsburg.html` |
| 48 | 2 | 16 | `ports/port-miami.html` |
| 48 | 1 | 21 | `ports/samana.html` |
| 48 | 2 | 16 | `ports/st-croix.html` |
| 48 | 1 | 21 | `ports/vigo.html` |
| 50 | 2 | 15 | `ports/belfast.html` |
| 50 | 2 | 15 | `ports/marthas-vineyard.html` |
| 50 | 2 | 15 | `ports/port-arthur.html` |
| 50 | 2 | 15 | `ports/royal-beach-club-nassau.html` |
| 50 | 2 | 15 | `ports/scotland.html` |
| 50 | 2 | 15 | `ports/sihanoukville.html` |
| 52 | 2 | 14 | `ports/cannes.html` |
| 52 | 1 | 19 | `ports/cephalonia.html` |
| 52 | 1 | 19 | `ports/cherbourg.html` |
| 52 | 2 | 14 | `ports/guadeloupe.html` |
| 52 | 1 | 19 | `ports/koper.html` |
| 52 | 2 | 14 | `ports/messina.html` |
| 52 | 3 | 9 | `ports/mombasa.html` |
| 52 | 1 | 19 | `ports/nawiliwili.html` |
| 52 | 1 | 19 | `ports/taormina.html` |
| 52 | 1 | 19 | `ports/virgin-gorda.html` |
| 54 | 1 | 18 | `ports/charleston.html` |
| 54 | 1 | 18 | `ports/charlottetown.html` |
| 54 | 3 | 8 | `ports/dubrovnik.html` |
| 54 | 2 | 13 | `ports/gothenburg.html` |
| 54 | 2 | 13 | `ports/holyhead.html` |
| 54 | 2 | 13 | `ports/jakarta.html` |
| 54 | 1 | 18 | `ports/komodo.html` |
| 54 | 1 | 18 | `ports/langkawi.html` |
| 54 | 1 | 18 | `ports/livorno.html` |
| 54 | 1 | 18 | `ports/moorea.html` |
| 54 | 2 | 13 | `ports/praia.html` |
| 54 | 2 | 13 | `ports/punta-del-este.html` |
| 54 | 2 | 13 | `ports/san-francisco.html` |
| 54 | 1 | 18 | `ports/sharm-el-sheikh.html` |
| 56 | 2 | 12 | `ports/bilbao.html` |
| 56 | 1 | 17 | `ports/buenos-aires.html` |
| 56 | 2 | 12 | `ports/buzios.html` |
| 56 | 2 | 12 | `ports/colombo.html` |
| 56 | 2 | 12 | `ports/gibraltar.html` |
| 56 | 1 | 17 | `ports/gijon.html` |
| 56 | 2 | 12 | `ports/glacier-alley.html` |
| 56 | 2 | 12 | `ports/guam.html` |
| 56 | 2 | 12 | `ports/isafjordur.html` |
| 56 | 2 | 12 | `ports/jacksonville.html` |
| 56 | 1 | 17 | `ports/lombok.html` |
| 56 | 1 | 17 | `ports/manta.html` |
| 56 | 2 | 12 | `ports/montreal.html` |
| 56 | 2 | 12 | `ports/muscat.html` |
| 56 | 2 | 12 | `ports/okinawa.html` |
| 56 | 1 | 17 | `ports/olden.html` |
| 56 | 1 | 17 | `ports/palma.html` |
| 56 | 2 | 12 | `ports/reykjavik.html` |
| 56 | 1 | 17 | `ports/saipan.html` |
| 56 | 1 | 17 | `ports/vanuatu.html` |
| 56 | 2 | 12 | `ports/yangon.html` |
| 58 | 2 | 11 | `ports/brunei.html` |
| 58 | 1 | 16 | `ports/cagliari.html` |
| 58 | 2 | 11 | `ports/doubtful-sound.html` |
| 58 | 1 | 16 | `ports/dravuni.html` |
| 58 | 1 | 16 | `ports/flam.html` |
| 58 | 2 | 11 | `ports/hakodate.html` |
| 58 | 2 | 11 | `ports/honningsvag.html` |
| 58 | 2 | 11 | `ports/incheon.html` |
| 58 | 1 | 16 | `ports/kusadasi.html` |
| 58 | 1 | 16 | `ports/lifou.html` |
| 58 | 1 | 16 | `ports/lyttelton.html` |
| 58 | 1 | 16 | `ports/mauritius.html` |
| 58 | 1 | 16 | `ports/newcastle.html` |
| 58 | 1 | 16 | `ports/port-said.html` |
| 58 | 1 | 16 | `ports/portimao.html` |
| 58 | 1 | 16 | `ports/portofino.html` |
| 58 | 1 | 16 | `ports/punta-arenas.html` |
| 58 | 1 | 16 | `ports/rotorua.html` |
| 58 | 1 | 16 | `ports/royal-beach-club-cozumel.html` |
| 58 | 3 | 6 | `ports/santorini.html` |
| 58 | 1 | 16 | `ports/st-barts.html` |
| 58 | 1 | 16 | `ports/sydney-ns.html` |
| 60 | 2 | 10 | `ports/belize.html` |
| 60 | 1 | 15 | `ports/bimini.html` |
| 60 | 1 | 15 | `ports/cadiz.html` |
| 60 | 1 | 15 | `ports/cartagena-spain.html` |
| 60 | 1 | 15 | `ports/civitavecchia.html` |
| 60 | 2 | 10 | `ports/cochin.html` |
| 60 | 1 | 15 | `ports/curacao.html` |
| 60 | 1 | 15 | `ports/dakar.html` |
| 60 | 1 | 15 | `ports/doha.html` |
| 60 | 1 | 15 | `ports/dunedin.html` |
| 60 | 1 | 15 | `ports/freeport.html` |
| 60 | 2 | 10 | `ports/genoa.html` |
| 60 | 1 | 15 | `ports/greenock.html` |
| 60 | 1 | 15 | `ports/guayaquil.html` |
| 60 | 1 | 15 | `ports/ha-long-bay.html` |
| 60 | 2 | 10 | `ports/harvest-caye.html` |
| 60 | 1 | 15 | `ports/heraklion.html` |
| 60 | 1 | 15 | `ports/ho-chi-minh-city.html` |
| 60 | 1 | 15 | `ports/hvar.html` |
| 60 | 1 | 15 | `ports/ibiza.html` |
| 60 | 1 | 15 | `ports/limassol.html` |
| 60 | 1 | 15 | `ports/maputo.html` |
| 60 | 1 | 15 | `ports/monte-carlo.html` |
| 60 | 2 | 10 | `ports/mykonos.html` |
| 60 | 1 | 15 | `ports/napier.html` |
| 60 | 1 | 15 | `ports/newport.html` |
| 60 | 1 | 15 | `ports/norfolk.html` |
| 60 | 2 | 10 | `ports/ocho-rios.html` |
| 60 | 1 | 15 | `ports/patmos.html` |
| 60 | 1 | 15 | `ports/pitcairn.html` |
| 60 | 1 | 15 | `ports/ponta-delgada.html` |
| 60 | 1 | 15 | `ports/port-everglades.html` |
| 60 | 1 | 15 | `ports/quebec-city.html` |
| 60 | 1 | 15 | `ports/safaga.html` |
| 60 | 2 | 10 | `ports/salvador.html` |
| 60 | 1 | 15 | `ports/seychelles.html` |
| 60 | 1 | 15 | `ports/sorrento.html` |
| 60 | 1 | 15 | `ports/suva.html` |
| 60 | 1 | 15 | `ports/taipei.html` |
| 60 | 1 | 15 | `ports/tonga.html` |
| 60 | 1 | 15 | `ports/valparaiso.html` |
| 60 | 1 | 15 | `ports/walvis-bay.html` |
| 60 | 1 | 15 | `ports/wellington.html` |
| 60 | 1 | 15 | `ports/zakynthos.html` |
| 62 | 1 | 14 | `ports/cairns.html` |
| 62 | 1 | 14 | `ports/cape-cod.html` |
| 62 | 1 | 14 | `ports/capri.html` |
| 62 | 1 | 14 | `ports/casablanca.html` |
| 62 | 1 | 14 | `ports/dover.html` |
| 62 | 1 | 14 | `ports/fremantle.html` |
| 62 | 1 | 14 | `ports/fukuoka.html` |
| 62 | 1 | 14 | `ports/glasgow.html` |
| 62 | 2 | 9 | `ports/kiel.html` |
| 62 | 1 | 14 | `ports/kirkwall.html` |
| 62 | 1 | 14 | `ports/kona.html` |
| 62 | 1 | 14 | `ports/la-spezia.html` |
| 62 | 1 | 14 | `ports/norwegian-fjords.html` |
| 62 | 1 | 14 | `ports/noumea.html` |
| 62 | 1 | 14 | `ports/papeete.html` |
| 62 | 1 | 14 | `ports/picton.html` |
| 62 | 1 | 14 | `ports/port-elizabeth.html` |
| 62 | 1 | 14 | `ports/portland-maine.html` |
| 62 | 1 | 14 | `ports/puerto-limon.html` |
| 62 | 1 | 14 | `ports/rostock.html` |
| 62 | 1 | 14 | `ports/salalah.html` |
| 62 | 1 | 14 | `ports/st-john-usvi.html` |
| 62 | 1 | 14 | `ports/tristan-da-cunha.html` |
| 62 | 1 | 14 | `ports/ushuaia.html` |
| 62 | 1 | 14 | `ports/waterford.html` |
| 64 | 2 | 8 | `ports/antarctic-peninsula.html` |
| 64 | 1 | 13 | `ports/bay-of-islands.html` |
| 64 | 1 | 13 | `ports/bodrum.html` |
| 64 | 1 | 13 | `ports/brisbane.html` |
| 64 | 1 | 13 | `ports/cabo-san-lucas.html` |
| 64 | 1 | 13 | `ports/cartagena.html` |
| 64 | 2 | 8 | `ports/catania.html` |
| 64 | 1 | 13 | `ports/da-nang.html` |
| 64 | 1 | 13 | `ports/fiji.html` |
| 64 | 2 | 8 | `ports/gatun-lake.html` |
| 64 | 1 | 13 | `ports/geiranger.html` |
| 64 | 2 | 8 | `ports/hilo.html` |
| 64 | 1 | 13 | `ports/hiroshima.html` |
| 64 | 2 | 8 | `ports/ilhabela.html` |
| 64 | 1 | 13 | `ports/invergordon.html` |
| 64 | 1 | 13 | `ports/istanbul.html` |
| 64 | 1 | 13 | `ports/jeju.html` |
| 64 | 1 | 13 | `ports/klaipeda.html` |
| 64 | 1 | 13 | `ports/koh-samui.html` |
| 64 | 1 | 13 | `ports/lisbon.html` |
| 64 | 1 | 13 | `ports/milford-sound.html` |
| 64 | 1 | 13 | `ports/mobile.html` |
| 64 | 1 | 13 | `ports/montevideo.html` |
| 64 | 1 | 13 | `ports/mystery-island.html` |
| 64 | 1 | 13 | `ports/nagasaki.html` |
| 64 | 1 | 13 | `ports/nha-trang.html` |
| 64 | 1 | 13 | `ports/phuket.html` |
| 64 | 1 | 13 | `ports/puerto-madryn.html` |
| 64 | 1 | 13 | `ports/rio-de-janeiro.html` |
| 64 | 1 | 13 | `ports/st-helena.html` |
| 64 | 1 | 13 | `ports/stockholm.html` |
| 64 | 1 | 13 | `ports/tenerife.html` |
| 64 | 1 | 13 | `ports/tromso.html` |
| 64 | 1 | 13 | `ports/vancouver.html` |
| 66 | 1 | 12 | `ports/bangkok.html` |
| 66 | 2 | 7 | `ports/bar-harbor.html` |
| 66 | 1 | 12 | `ports/bergen.html` |
| 66 | 1 | 12 | `ports/bordeaux.html` |
| 66 | 1 | 12 | `ports/boston.html` |
| 66 | 1 | 12 | `ports/cape-town.html` |
| 66 | 1 | 12 | `ports/corinto.html` |
| 66 | 2 | 7 | `ports/dublin.html` |
| 66 | 1 | 12 | `ports/falmouth.html` |
| 66 | 1 | 12 | `ports/gdansk.html` |
| 66 | 1 | 12 | `ports/gran-canaria.html` |
| 66 | 1 | 12 | `ports/hamburg.html` |
| 66 | 1 | 12 | `ports/honfleur.html` |
| 66 | 1 | 12 | `ports/kobe.html` |
| 66 | 1 | 12 | `ports/labadee.html` |
| 66 | 1 | 12 | `ports/le-havre.html` |
| 66 | 1 | 12 | `ports/maldives.html` |
| 66 | 1 | 12 | `ports/manaus.html` |
| 66 | 1 | 12 | `ports/melbourne.html` |
| 66 | 1 | 12 | `ports/nassau.html` |
| 66 | 1 | 12 | `ports/osaka.html` |
| 66 | 1 | 12 | `ports/oslo.html` |
| 66 | 1 | 12 | `ports/san-diego.html` |
| 66 | 1 | 12 | `ports/southampton.html` |
| 66 | 1 | 12 | `ports/tauranga.html` |
| 66 | 2 | 7 | `ports/trieste.html` |
| 66 | 1 | 12 | `ports/valletta.html` |
| 68 | 2 | 6 | `ports/denali.html` |
| 68 | 1 | 11 | `ports/drake-passage.html` |
| 68 | 1 | 11 | `ports/hobart.html` |
| 68 | 1 | 11 | `ports/la-coruna.html` |
| 68 | 1 | 11 | `ports/lautoka.html` |
| 68 | 1 | 11 | `ports/lerwick.html` |
| 68 | 1 | 11 | `ports/liverpool.html` |
| 68 | 1 | 11 | `ports/montego-bay.html` |
| 68 | 1 | 11 | `ports/nosy-be.html` |
| 68 | 1 | 11 | `ports/penang.html` |
| 68 | 1 | 11 | `ports/puerto-caldera.html` |
| 68 | 1 | 11 | `ports/puntarenas.html` |
| 68 | 1 | 11 | `ports/san-juan.html` |
| 68 | 1 | 11 | `ports/south-georgia.html` |
| 68 | 1 | 11 | `ports/st-thomas.html` |
| 68 | 1 | 11 | `ports/stavanger.html` |
| 68 | 1 | 11 | `ports/zanzibar.html` |
| 70 | 1 | 10 | `ports/abu-dhabi.html` |
| 70 | 1 | 10 | `ports/auckland.html` |
| 70 | 1 | 10 | `ports/bali.html` |
| 70 | 1 | 10 | `ports/callao.html` |
| 70 | 1 | 10 | `ports/cape-horn.html` |
| 70 | 1 | 10 | `ports/cork.html` |
| 70 | 1 | 10 | `ports/darwin.html` |
| 70 | 1 | 10 | `ports/easter-island.html` |
| 70 | 2 | 5 | `ports/fairbanks.html` |
| 70 | 1 | 10 | `ports/haifa.html` |
| 70 | 1 | 10 | `ports/kuala-lumpur.html` |
| 70 | 1 | 10 | `ports/maui.html` |
| 70 | 1 | 10 | `ports/santos.html` |
| 70 | 1 | 10 | `ports/st-lucia.html` |
| 72 | 1 | 9 | `ports/cococay.html` |
| 72 | 1 | 9 | `ports/huatulco.html` |
| 72 | 1 | 9 | `ports/key-west.html` |
| 72 | 1 | 9 | `ports/tracy-arm.html` |
| 74 | 1 | 8 | `ports/antarctica.html` |
| 74 | 1 | 8 | `ports/kota-kinabalu.html` |
| 76 | 1 | 7 | `ports/bermuda.html` |
| 76 | 1 | 7 | `ports/busan.html` |
| 76 | 1 | 7 | `ports/helsinki.html` |
| 76 | 1 | 7 | `ports/st-maarten.html` |
| 80 | 1 | 5 | `ports/endicott-arm.html` |
| 82 | 1 | 4 | `ports/petersburg.html` |
| 82 | 1 | 4 | `ports/valdez.html` |
| 82 | 1 | 4 | `ports/wrangell.html` |

## All passing-but-warned ports (99)

**Total: 99 passing-but-warned ports**

| Score | Warns | Port |
|---:|---:|---|
| 100 | 1 | `ports/south-pacific.html` |
| 98 | 1 | `ports/college-fjord.html` |
| 98 | 1 | `ports/misty-fjords.html` |
| 96 | 2 | `ports/acapulco.html` |
| 96 | 2 | `ports/haines.html` |
| 96 | 2 | `ports/icy-strait-point.html` |
| 96 | 2 | `ports/ketchikan.html` |
| 96 | 2 | `ports/kodiak.html` |
| 94 | 3 | `ports/homer.html` |
| 94 | 3 | `ports/hubbard-glacier.html` |
| 94 | 3 | `ports/juneau.html` |
| 94 | 3 | `ports/seward.html` |
| 94 | 3 | `ports/sitka.html` |
| 94 | 3 | `ports/skagway.html` |
| 92 | 4 | `ports/glacier-bay.html` |
| 92 | 4 | `ports/inside-passage.html` |
| 90 | 5 | `ports/cape-liberty.html` |
| 88 | 6 | `ports/aitutaki.html` |
| 88 | 6 | `ports/anchorage.html` |
| 88 | 6 | `ports/dubai.html` |
| 86 | 7 | `ports/akureyri.html` |
| 86 | 7 | `ports/alesund.html` |
| 86 | 7 | `ports/cozumel.html` |
| 86 | 7 | `ports/whittier.html` |
| 84 | 8 | `ports/adelaide.html` |
| 84 | 8 | `ports/agadir.html` |
| 84 | 8 | `ports/airlie-beach.html` |
| 84 | 8 | `ports/akaroa.html` |
| 84 | 8 | `ports/amsterdam.html` |
| 84 | 8 | `ports/jamaica.html` |
| 84 | 8 | `ports/martinique.html` |
| 84 | 8 | `ports/tortola.html` |
| 82 | 9 | `ports/barbados.html` |
| 82 | 9 | `ports/edinburgh.html` |
| 82 | 9 | `ports/marseille.html` |
| 82 | 9 | `ports/roatan.html` |
| 80 | 10 | `ports/alexandria.html` |
| 80 | 10 | `ports/bonaire.html` |
| 80 | 10 | `ports/bora-bora.html` |
| 80 | 10 | `ports/dominica.html` |
| 80 | 10 | `ports/grand-cayman.html` |
| 80 | 10 | `ports/grenada.html` |
| 80 | 10 | `ports/st-kitts.html` |
| 78 | 11 | `ports/grand-turk.html` |
| 78 | 11 | `ports/los-angeles.html` |
| 76 | 12 | `ports/antigua.html` |
| 76 | 12 | `ports/aqaba.html` |
| 76 | 12 | `ports/aruba.html` |
| 76 | 12 | `ports/athens.html` |
| 76 | 12 | `ports/christchurch.html` |
| 76 | 12 | `ports/ft-lauderdale.html` |
| 76 | 12 | `ports/miami.html` |
| 76 | 12 | `ports/new-orleans.html` |
| 76 | 12 | `ports/seattle.html` |
| 76 | 12 | `ports/zadar.html` |
| 74 | 13 | `ports/ajaccio.html` |
| 74 | 13 | `ports/amber-cove.html` |
| 74 | 13 | `ports/fortaleza.html` |
| 74 | 13 | `ports/galveston.html` |
| 74 | 13 | `ports/lanzarote.html` |
| 74 | 13 | `ports/mazatlan.html` |
| 74 | 13 | `ports/recife.html` |
| 74 | 13 | `ports/tampa.html` |
| 72 | 14 | `ports/apia.html` |
| 72 | 14 | `ports/falkland-islands.html` |
| 72 | 14 | `ports/goa.html` |
| 72 | 14 | `ports/halifax.html` |
| 72 | 14 | `ports/portland.html` |
| 72 | 14 | `ports/zeebrugge.html` |
| 72 | 14 | `ports/zihuatanejo.html` |
| 70 | 15 | `ports/ascension.html` |
| 70 | 15 | `ports/ensenada.html` |
| 70 | 15 | `ports/manzanillo.html` |
| 70 | 15 | `ports/puerto-vallarta.html` |
| 70 | 15 | `ports/valencia.html` |
| 70 | 15 | `ports/victoria-bc.html` |
| 68 | 16 | `ports/honolulu.html` |
| 68 | 16 | `ports/kotor.html` |
| 68 | 16 | `ports/malaga.html` |
| 68 | 16 | `ports/porto.html` |
| 68 | 16 | `ports/rhodes.html` |
| 68 | 16 | `ports/riga.html` |
| 68 | 16 | `ports/split.html` |
| 68 | 16 | `ports/venice.html` |
| 66 | 17 | `ports/barcelona.html` |
| 66 | 17 | `ports/naples.html` |
| 66 | 17 | `ports/port-canaveral.html` |
| 66 | 17 | `ports/progreso.html` |
| 66 | 17 | `ports/saguenay.html` |
| 66 | 17 | `ports/saint-john.html` |
| 66 | 17 | `ports/st-petersburg.html` |
| 66 | 17 | `ports/warnemunde.html` |
| 64 | 18 | `ports/funchal.html` |
| 64 | 18 | `ports/ravenna.html` |
| 62 | 19 | `ports/costa-maya.html` |
| 62 | 19 | `ports/tangier.html` |
| 62 | 19 | `ports/tunis.html` |
| 62 | 19 | `ports/villefranche.html` |
| 60 | 20 | `ports/tallinn.html` |

---

**Doctrinal anchors for the repair plan** (from cognitive-memory; full text in `/home/user/open-claw-stuff/.memory/cruising/`):

- `2ba9f25f` / `f65655fa` — quality over speed; 1–2 ports at a time with You.com/Perplexity verification; goal is 100/100, not "just passing"
- `65aa7830` — DO NOT relax validator rules to lower remediation burden; rules serve readers, not developer convenience
- `20dbac02` — per-port: update `admin/PORT_VALIDATION_STATUS.md` in the same commit; ORIGINAL → FINAL → PASS/FAIL → TRUTH-CHECK SOURCE → CONFIDENCE → corrections summary
- `5f85f1e7` — tiered deployment: TIER 1 zero-risk after dry-run; TIER 2 low-risk URL/nav changes need orchestra review with before/after/diff
- `5691c658` — noscript fallbacks are pastoral accessibility, not optional
- `f22bf2be` — SDG / load-bearing conventions (Scripture refs, accessibility statements, invocation comments, footers) NEVER stripped
- `c8d2046f` — multimodal Read of images before deciding (Image Verification Protocol)
