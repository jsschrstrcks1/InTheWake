# GitHub Issues × UNFINISHED_TASKS.md cross-reference — 2026-05-13

**Source:** 62 open issues in `jsschrstrcks1/InTheWake`. Cross-referenced against the post-merge `admin/UNFINISHED_TASKS.md` (PR #1501 landed).

**Method:** title-based categorization. Issues mapped by cruise-line scope or system topic.

---

## By bucket

| Bucket | Count | Maps to UNFINISHED section / batch |
|---|---:|---|

| Cross-line audit (Princess/Celebrity/MSC/HAL/etc. vs RCL) | 14 | Cruise Line Parity Gaps + Ship Validation Content Quality (cross-cutting work; subsumed by future batches) |
| Carnival-specific bugs (template variants) | 12 | Ship Validation Content Quality (Carnival has 14 issues — concentrated regression surface) |
| NCL-specific bugs | 8 | Ship Validation Content Quality (NCL — empty Logbook/Entertainment, 'coming soon' placeholders, factual errors, IMO TBD, copyright fix) |
| RCL-specific bugs (templates + data conflicts) | 3 | Ship Validation Content Quality (cascade_fully_failed entries likely overlap) |
| Dining / venue rendering | 8 | Ship Validation Content Quality (dining sections empty or missing names — touches many ships) |
| Image attribution rendering | 3 | Phase 3.5 image-reuse-guardrail follow-up (Issue #1465 covered by my B1.1) |
| Logbook / story content | 1 | Tier-3 port content + Ship logbook stories |
| Port audit / trust signals | 3 | Port Validation Remaining Work (B6 scope) |
| Data inconsistencies (tonnage, passenger count) | 8 | Ship Validation Content Quality + new entry for data-consistency sweep |
| Layout / template bugs | 1 | Ship Page Standardization (B8 long sprint) |
| Miscellaneous | 1 | Triage per-item |

## Detail per bucket

### Cross-line audit (Princess/Celebrity/MSC/HAL/etc. vs RCL)

- #1378 — Full Crawl Audit: Holland America Line Ship Pages vs. RCL — All Differences Lowering User Trust
- #1377 — Full Crawl Audit: Princess Cruises Ship Pages vs. RCL — All Differences Lowering User Trust
- #1376 — Full Crawl Audit: Celebrity Cruises Ship Pages vs. RCL — All Differences Lowering User Trust
- #1375 — Full Crawl Audit: MSC Cruises Ship Pages vs. RCL — All Differences Lowering User Trust
- #1374 — Full Crawl Audit: Silversea Cruises Ship Pages vs. RCL — All Differences Lowering User Trust
- #1373 — Full Crawl Audit: Costa Cruises Ship Pages
- #1372 — Full Crawl Audit: Oceania Cruises Ship Pages vs. RCL — All Differences Lowering User Trust
- #1371 — Full Crawl Audit: Seabourn Ship Pages vs. RCL — All Differences Lowering User Trust
- #1370 — Full Crawl Audit: Regent Seven Seas Ship Pages vs. RCL — All Differences Lowering User Trust
- #1369 — Full Crawl Audit: Explora Journeys Ship Pages vs. RCL — All Differences Lowering User Trust
- #1368 — Full Crawl Audit: Cunard Ship Pages vs. RCL — All Differences Lowering User Trust
- #1367 — Full Crawl Audit: Virgin Voyages Ship Pages vs. RCL — All Differences Lowering User Trust
- #1366 — Full Crawl Audit: Norwegian (NCL) Ship Pages vs. RCL — All Differences Lowering User Trust
- #1365 — Full Crawl Audit: Carnival Ship Pages vs. RCL — All Differences Lowering User Trust

### Carnival-specific bugs (template variants)

- #1364 — [Carnival] Duplicate sections on Carnival Horizon (Vista class): Deck Plans, Live Tracker, Sources each appear twice
- #1363 — [Carnival] Image attributions in wrong section on Template B and D pages
- #1362 — [Carnival] Grammar error: "a Excel Class" should be "an Excel Class"
- #1360 — [Carnival] FAQ template variables not resolved on Mardi Gras page
- #1359 — [Carnival] Sister ship year data error: Mardi Gras shown as 2020 on Celebration page (should be 2021)
- #1358 — [Carnival] Sister ship year data error: Mardi Gras shown as 2020 on Celebration page (should be 2021)
- #1356 — [Carnival] Footer missing Privacy Terms About links on older template pages
- #1355 — [Carnival] Copyright year 2025 and inconsistent footer formats across all Carnival page templates
- #1354 — [Carnival] "Browse All" text leaking into Dining section heading on Carnival Mardi Gras
- #1353 — [Carnival] Ports section homeport rendering bug — "typically sails from [blank] on [regions]" across all Carnival pages
- #1352 — [Carnival] Template variables not resolved on older ship pages — ship name, homeport, dining rooms blank
- #1351 — [Carnival] Multiple incompatible page templates across Carnival fleet — 4 structural variants

### NCL-specific bugs

- #1350 — [NCL] Empty Logbook and Entertainment sections across all Norwegian ship pages
- #1349 — [NCL] Norwegian Spirit shows conflicting guest counts: Key Facts says 1,966 but intro text says 2,018
- #1348 — [NCL] Factual error: Norwegian Aqua FAQ claims it is "NCL's largest ship" — it is not
- #1347 — [NCL] IMO number listed as "TBD" for operational ships (Norwegian Sky, Norwegian Aqua)
- #1346 — [NCL] Inconsistent photo gallery implementation — some ships have real captioned photos, others have generic placeholders
- #1345 — [NCL] Grammar error: "a Epic Class" should be "an Epic Class" on Norwegian Epic page
- #1344 — [NCL] Dining section shows "coming soon" placeholder on all 20 Norwegian ship pages
- #1343 — [NCL] Copyright year shows 2025 on all Norwegian ship pages — fix from #1316 not applied to NCL

### RCL-specific bugs (templates + data conflicts)

- #1333 — Broken sister-ship and class links: Sovereign of the Seas, Song of America, Legend of the Seas pages don't exist
- #1314 — Splendour of the Seas: Ship's current name is missing in "Where Is This Ship Now?" section
- #1311 — All RCL ship video sections: "Videos will appear once our sources sync" message shown despite video list being loaded

### Dining / venue rendering

- #1338 — Oasis/Star class ships: Generic template dining data doesn't match actual ship dining — wrong or missing venues
- #1332 — Retired ship pages (Monarch, Majesty): Dining section shows "Dining data is loading..." indefinitely instead of a no-data state
- #1330 — Dining venue names missing from ship pages — items render as "— description" with no restaurant name linked
- #1328 — Dining venue names missing from ship pages — items render as "— description" with no restaurant name
- #1325 — Voyager/Radiance/Vision Class ships: Dining sections still empty + Spectrum dining empty after cache flush
- #1322 — Multiple ship pages: "→ Browse All" text leaking into dining section heading
- #1312 — Multiple RCL ship pages: Dining venues section is completely empty
- #1308 — Icon of the Seas: Dining venue names missing — section headings render as "undefined"

### Image attribution rendering

- #1465 — image-reuse-guardrail: false positives on FOM-named cross-ship photos and same-entity-two-paths
- #1336 — Image attribution rendering bug: photographer name hidden inside parentheses — renders as "()" with no visible text
- #1317 — Image attribution credits missing photographer names on multiple ship pages

### Logbook / story content

- #1318 — Liberty of the Seas: Logbook story titled "The Bipolar Traveler's Stable Week" — insensitive mental health framing may alienate users

### Port audit / trust signals

- #1384 — Full Port Crawl Audit: Missing sections, broken elements, and structural gaps across all 387 port pages
- #1383 — Trust Signal Normalization: Inconsistent credibility elements across port pages
- #1382 — Port Page Audit: Missing links, missing pages, feature gaps, and validator patches

### Data inconsistencies (tonnage, passenger count)

- #1341 — NCL ship pages: intra-page data conflicts — guest count and class name inconsistencies
- #1337 — Inconsistent Key Facts sidebar structure across ship page templates — different fields, different field counts
- #1331 — Song of Norway and Splendour of the Seas: Key Facts panel shows all "TBD" — no ship data rendered
- #1329 — Tonnage discrepancies on individual ship pages vs fleet listing — Odyssey, Liberty, Independence, Vision, Rhapsody, Grandeur
- #1327 — Tonnage discrepancies between fleet listing and individual ship detail pages (post-fix audit)
- #1323 — FAQ template rendering bug: "is a [blank] ship" — missing class name in answers on multiple ship pages
- #1315 — Grandeur of the Seas: FAQ answer missing ship class name — renders as "Grandeur is a ship"
- #1309 — Multiple ship pages: Passenger count inconsistency between fleet listing and detail pages

### Layout / template bugs

- #1326 — Voyager of the Seas: Page layout broken — Ports and FAQ sections render outside main content region

### Miscellaneous

- #1206 — 50+ still present on some pages.

