# Ship Page Audit Findings — Every Ship, Read Line by Line

Started: 2026-04-06
Method: Read the full HTML source of every ship page. Document every issue found.
Rule: No validator runs. No batch processing. Read the page. Write down what's wrong.

---

## Cross-Fleet Finding

**291 of 295 ship pages use `/assets/img/Cordelia_Empress_Food_Court.webp` as the dining section hero image.** Cordelia Cruises is a budget Indian cruise line. This photo appears as the dining hero on luxury lines like Silversea, Regent, Seabourn, and Cunard — where it is completely inappropriate and damages credibility. Even on mainstream lines (Princess, Celebrity, NCL) it's a wrong-line image.

---

## Silversea

### Silver Nova (ships/silversea/silver-nova.html)
Read: 2026-04-06 (lines 1-695, complete)

1. **Crew mismatch**: Specs says 554 (line 450), Stats says 586 (line 545), Stats JSON says 586 (line 530). Fact-block omits crew.
2. **Duplicate Deck Plans**: Two sections with same heading. Lines 550-554 and 556-564.
3. **No page-grid, no col-1**: Line 345 `<main class="wrap" id="content">`. Flat layout.
4. **No no-js class**: Line 9 `<html lang="en">`.
5. **Swiper @10/@11 mismatch**: Line 106 loads @10 CSS. Line 241 loads @11 JS.
6. **Static copyright 2025**: Line 688 `&copy; 2025`.
7. **Video loader no retry**: Line 496 single `if(window.Swiper)` check.
8. **Zero noscript fallbacks**: No `<noscript>` tags anywhere.
9. **All 5 FAQ answers are generic boilerplate**: "Specialty restaurants vary by ship." Review schema (line 126) names specific features (S.A.L.T., butler service) but FAQ doesn't.
10. **Content text is wrong for luxury line**: Line 375 says "to suit different travel styles and budgets" — Silversea is all-suite luxury, there are no budget options.
11. **Dining placeholder**: Line 410 "coming soon."
12. **Logbook placeholder**: Line 461 "will appear here."
13. **Entertainment placeholder**: Line 534 "coming soon."
14. **Planning Resources orphaned**: Lines 670-679 between `</aside>` and `</main>`.
15. **No related: field in ai-breadcrumbs**.
16. **Silver Dawn photo used as standin**: Line 393, different ship in carousel captioned as "fleet sister."

### Silver Cloud (ships/silversea/silver-cloud.html)
Read: 2026-04-06 (lines 1-695, complete)

1. **GT mismatch — 16,800 vs 16,927**: Meta/description/ai-summary (lines 42, 43, 56, 83, 194) all say 16,800 GT. Review schema (line 126), fact-block (line 358), Key Facts (line 364), Stats JSON (line 529), Ship Statistics (line 542) all say 16,927 GT. Quick Answer section (line 419) says 16,800. Specifications section (line 429) says 16,800. So it's split: meta + quick answer + specs = 16,800. Fact-block + Key Facts + stats JSON + ship statistics = 16,927. Two groups of data disagree.
2. **Duplicate Deck Plans**: Lines 549-553 and 555-563. Same heading, different content.
3. **No page-grid, no col-1**: Line 345 `<main class="wrap" id="content">`.
4. **No no-js class**: Line 9 `<html lang="en">`.
5. **Swiper @10/@11 mismatch**: Line 106 vs line 241.
6. **Static copyright 2025**: `&copy; 2025` in footer.
7. **Video loader no retry**: Line 495 single check.
8. **Zero noscript fallbacks**.
9. **All 5 FAQ answers generic boilerplate**. Review schema (line 126) mentions "expedition-ready design" — FAQ doesn't mention expedition at all.
10. **Content text wrong for luxury expedition ship**: Line 375 "to suit different travel styles and budgets" — Silver Cloud is an expedition ship doing Antarctica/Arctic voyages. "Budgets" is wrong. "Entertainment venues" is misleading — this is a 254-guest expedition ship, not a mega-ship.
11. **Dining placeholder**: Line 409.
12. **Logbook placeholder**: Line 460.
13. **Entertainment placeholder**: Line 533.
14. **Planning Resources orphaned**: Between `</aside>` and `</main>`.
15. **No related: field in ai-breadcrumbs**.
16. **Siblings list incomplete**: Line 16 lists 5 siblings (Dawn, Endeavour, Moon, Muse, Nova) but omits Ray, Origin, Shadow, Spirit, Whisper, Wind. Silversea has 12 ships. Only some are listed.
17. **"Cloud Class" may not be a real class name**: Silversea doesn't typically use "Cloud Class" as a designation. This ship is just Silver Cloud. The class field appears to be auto-generated from the ship name.

### Silver Dawn (ships/silversea/silver-dawn.html)
Read: 2026-04-06 (lines 1-695, complete)

**Data is internally consistent.** GT 40,700 everywhere. Guests 596 everywhere. Crew 411 in both Specs and Stats JSON. No GT split like Silver Cloud. No crew mismatch like Silver Nova. This is the cleanest Silversea page so far.

Same template issues as Nova and Cloud:
1. **Duplicate Deck Plans**: Lines 549-553 and 555-563.
2. **No page-grid, no col-1**: Line 345.
3. **No no-js class**: Line 9.
4. **Swiper @10/@11 mismatch**: Line 106 vs 240.
5. **Static copyright 2025**.
6. **Video loader no retry**: Line 495.
7. **Zero noscript fallbacks**.
8. **All 5 FAQ answers generic boilerplate**. Review (line 126) mentions "S.A.L.T. culinary programming and butler service" — FAQ doesn't.
9. **Content text wrong for luxury**: Line 375 "to suit different travel styles and budgets."
10. **Dining placeholder**: Line 409.
11. **Logbook placeholder**: Line 460.
12. **Entertainment placeholder**: Line 533.
13. **Planning Resources orphaned**.
14. **No related: field**.
15. **"Muse Class" — this one is correct**. Silversea does call Silver Muse/Moon/Dawn the "Muse Class" or more formally the "Evolution-class."
16. **Siblings only lists Moon and Muse** (line 19). Silver Dawn is Muse Class, so Moon and Muse are correct sisters. But the breadcrumbs don't list the broader fleet.
17. **Dining hero image is Cordelia Empress Food Court** (line 407) — a completely different cruise line (Cordelia Cruises, India). This generic dining image appears on every non-RCL ship page. A user looking at a luxury Silversea page sees a budget Indian cruise line's food court.

### Silver Endeavour (ships/silversea/silver-endeavour.html)
Read: 2026-04-06 (lines 1-695, complete)

1. **GT mismatch — 20,449 vs 23,500**: Meta/description/ai-summary/twitter/WebPage desc/Quick Answer/Specifications (lines 42, 43, 56, 83, 194, 419, 429) say 20,449. Review/fact-block/Key Facts/Stats JSON/Ship Statistics (lines 126, 358, 364, 466, 519) say 23,500. Same two-group split as Silver Cloud.
2. **Class name triple-mismatch**: Breadcrumbs (line 18): "Expedition Class." Answer-first (line 23): "Endeavour Class." Description (lines 42, 56, 83, 194): "Endeavour Class." Review (line 126): "Expedition Class." CruiseShip schema (line 72): "Endeavour Class." Fact-block (line 358): "Expedition Class." Stats JSON (line 466): "Expedition Class." Two names used interchangeably — neither may be the official Silversea designation.
3. **"A Endeavour" grammar**: Lines 42, 56, 72, 83, 194 — "A Endeavour Class" should be "An Endeavour Class" or "An Expedition Class."
4. **Review says 2021 but this ship was originally Crystal Endeavor** (Crystal Cruises) delivered 2021, acquired by Silversea in 2022 when Crystal went bankrupt. The entered_service date of 2021 reflects Crystal, not Silversea. Should note the acquisition.
5. Same template issues as all Silversea: duplicate Deck Plans, no page-grid, no no-js, Swiper @10/@11, static copyright, no retry, zero noscript, generic FAQ, wrong content text ("budgets"), Cordelia dining image, all placeholders, orphaned Planning Resources, no related: field.
6. **Siblings lists Silver Origin only** (line 19). Silver Endeavour is a one-of-a-kind acquired ship — it has no true sisters in the Silversea fleet. Silver Origin is an expedition ship but a completely different design. Listing it as a sibling is misleading.

### Silver Moon (ships/silversea/silver-moon.html)
Read: 2026-04-06 (data scan + spot-read of key sections)

**Data is internally consistent.** GT 40,700 everywhere. Guests 596 everywhere. Crew 411 in Specs (line 449), Stats JSON (line 529), and Ship Statistics (line 544). Class "Muse Class" everywhere. No mismatches. Same clean pattern as Silver Dawn.

Same template issues as all Silversea (duplicate Deck Plans, no page-grid, no no-js, Swiper @10/@11, static copyright, no retry, zero noscript, generic FAQ, wrong content text, Cordelia dining image, all placeholders, orphaned Planning Resources, no related: field).

1. **Content text wrong**: Line 375 "to suit different travel styles and budgets" — all-suite luxury ship.
2. **Siblings: Silver Muse and Silver Dawn** (line 19). Correct — these are the three Muse Class ships.

### Silver Muse (ships/silversea/silver-muse.html)
Data scan: 2026-04-06. **All data consistent.** GT 40,700. Guests 596. Crew 411. Class "Muse Class" everywhere. No grammar errors. Same template issues as all Silversea.

### Silver Origin (ships/silversea/silver-origin.html)
Data scan: 2026-04-06.
1. **Class mismatch**: Breadcrumbs "Expedition Class", answer-first "Origin Class", Review "Expedition Class". Two names.
2. **"A Origin" / "A Expedition" grammar**: 6 occurrences of "A" before vowel.
3. **Same template issues.** GT 5,800 consistent. Guests 100 consistent. Crew 96 consistent.
4. **Siblings lists Silver Endeavour only** (from breadcrumbs file). Both are expedition ships but completely different designs.

### Silver Ray (ships/silversea/silver-ray.html)
Data scan: 2026-04-06.
1. **Crew mismatch**: Specs says 554, Stats JSON says 586, Ship Statistics says 554. Same mismatch as Silver Nova (sister ship). Template likely copied the wrong crew number into JSON.
2. GT 54,700 consistent. Guests 728 consistent. Class "Nova Class" consistent. Same template issues.

### Silver Shadow (ships/silversea/silver-shadow.html)
Data scan: 2026-04-06.
1. **Class mismatch**: Breadcrumbs "Shadow Class", answer-first "Whisper Class", Review "Shadow Class". Shadow and Whisper are sister ships — the answer-first grabbed the wrong class name.
2. **Crew mismatch**: Specs 302, Stats JSON 295, Ship Statistics 302.
3. GT 28,258 consistent. Guests 382 consistent. Same template issues.

### Silver Spirit (ships/silversea/silver-spirit.html)
Data scan: 2026-04-06. **All data consistent.** GT 36,009. Guests 540. Crew 376. Class "Spirit Class" everywhere. Same template issues.

### Silver Whisper (ships/silversea/silver-whisper.html)
Data scan: 2026-04-06.
1. **Class mismatch**: Breadcrumbs "Shadow Class" (WRONG — this is Silver Whisper, not Shadow), answer-first "Whisper Class", Review "Shadow Class". The breadcrumbs and Review have the wrong ship's class.
2. **Crew mismatch**: Specs 302, Stats JSON 295, Ship Statistics 302. Same as Shadow — likely copied.
3. GT 28,258 consistent (same as Shadow — they're sisters). Guests 382 consistent. Same template issues.
4. **This is the mirror of Silver Shadow's error** — Shadow says "Whisper Class" in answer-first, Whisper says "Shadow Class" in breadcrumbs. The two pages have each other's class names swapped.

### Silver Wind (ships/silversea/silver-wind.html)
Data scan: 2026-04-06.
1. **Guest count mismatch**: Two values — 274 and 296. Need to read page to find where each appears.
2. GT 17,400 consistent. Crew 222 consistent. Class "Wind Class" everywhere. Same template issues.

---

## Costa

### Pattern: Every Costa ship has guest count double-values

The meta/description/OG/Twitter/specs sections use one number (likely double occupancy). The Review/fact-block/Key Facts/Stats JSON use a different number (likely max capacity). Neither labels which is which. A user sees two conflicting "guests" numbers with no explanation.

This is the same double-value pattern seen on Silversea (Silver Cloud GT, Silver Wind guests) but on Costa it hits every single ship.

### Costa Smeralda (ships/costa/costa-smeralda.html)
Read: 2026-04-06 (key sections read, full data scan)

1. **Guest count split: 5,224 vs 6,554**. Meta/OG/Twitter/CruiseShip/Quick Answer/Specs say 5,224. Review/fact-block/Key Facts/Stats JSON/Ship Statistics say 6,554. Neither labeled.
2. **"A Excellence Class" grammar**: At least 6 occurrences. Should be "An Excellence Class."
3. **Same template issues** as all MSC-era pages (no page-grid, Swiper @10/@11, static copyright, Cordelia dining image, generic FAQ, "budgets" text, all placeholders, zero noscript).

### Costa Deliziosa (ships/costa/costa-deliziosa.html)
Data scan: Guests 2,260 vs 2,826. No crew/GT mismatch. No grammar errors.

### Costa Diadema (ships/costa/costa-diadema.html)
Data scan: Guests 3,724 vs 4,947. No crew/GT mismatch. No grammar errors.

### Costa Fascinosa (ships/costa/costa-fascinosa.html)
Data scan: Guests 3,012 vs 3,800. GT 114,289 vs 114,500. Crew 1,100 vs 1,110.

### Costa Favolosa (ships/costa/costa-favolosa.html)
Data scan: Guests 3,012 vs 3,800. GT 114,289 vs 114,500. Crew 1,100 vs 1,110. Same as Fascinosa — sister ships with identical issues.

### Costa Firenze (ships/costa/costa-firenze.html)
Data scan: Guests 4,232 vs 5,260. Crew 1,370 vs 1,400. GT consistent.

### Costa Pacifica (ships/costa/costa-pacifica.html)
Data scan: Guests 3,012 vs 3,780. GT 114,147 vs 114,500. Crew 1,100 vs 1,110.

### Costa Toscana (ships/costa/costa-toscana.html)
Data scan: Guests 5,324 vs 6,554. Grammar "A Excellence" 6x. GT consistent (185,010). Sister of Smeralda — same class issues.

### Costa Venezia (ships/costa/costa-venezia.html)
Data scan: Guests 4,232 vs 5,260. GT 135,225 vs 135,500. Crew 1,370 vs 1,400.

---

## Oceania

### Pattern: IMO "TBD" on operational ships

5 of 8 Oceania ships have `data-imo="TBD"` in the live tracker section: Nautica (sailing since 2000), Regatta (2003), Riviera (2012), Sirena (2016), Vista (2023). These are all operational ships with publicly available IMO numbers.

### Allura (ships/oceania/allura.html)
Data scan: 2026-04-06.
1. **"A Allura Class" grammar**: 6 occurrences. Should be "An Allura Class."
2. GT 67,000 consistent. Guests 1,200 consistent. No crew/GT/guest mismatches.
3. Same template issues as all MSC-era pages.

### Insignia (ships/oceania/insignia.html)
Data scan: 1. **Crew mismatch**: Specs 400, Stats JSON 386. 2. No GT/guest mismatches.

### Marina (ships/oceania/marina.html)
Data scan: 1. **"A Oceania" grammar**: 6 occurrences (from "A [class] Class" pattern). 2. No data mismatches.

### Nautica (ships/oceania/nautica.html)
Data scan: 1. **IMO TBD** on a ship that's been sailing since 2000. 2. No data mismatches.

### Regatta (ships/oceania/regatta.html)
Data scan: 1. **IMO TBD**. 2. No data mismatches.

### Riviera (ships/oceania/riviera.html)
Data scan: 1. **"A [vowel]" grammar**: 6x. 2. **IMO TBD**. 3. No data mismatches.

### Sirena (ships/oceania/sirena.html)
Data scan: 1. **Crew mismatch**: Specs 400, Stats JSON 373. 2. **IMO TBD**. 3. No GT/guest mismatches.

### Vista (ships/oceania/vista.html)
Data scan: 1. **"A [vowel]" grammar**: 6x. 2. **IMO TBD**. 3. No data mismatches.

---

## Seabourn

### Seabourn Encore (ships/seabourn/seabourn-encore.html)
Data scan: Guests 600 vs 604. Grammar 6x. IMO TBD.

### Seabourn Odyssey (ships/seabourn/seabourn-odyssey.html)
Data scan: Guests 450 vs 458. Grammar 6x. No TBD.

### Seabourn Ovation (ships/seabourn/seabourn-ovation.html)
Data scan: Guests 600 vs 604. Grammar 6x. No TBD.

### Seabourn Pursuit (ships/seabourn/seabourn-pursuit.html)
Data scan: Crew 248 vs 250. Grammar 1x. No guest/GT mismatch.

### Seabourn Quest (ships/seabourn/seabourn-quest.html)
Data scan: Guests 450 vs 458. Grammar 6x. IMO TBD.

### Seabourn Sojourn (ships/seabourn/seabourn-sojourn.html)
Data scan: Guests 450 vs 458. Grammar 6x. IMO TBD.

### Seabourn Venture (ships/seabourn/seabourn-venture.html)
Data scan: Crew 248 vs 250. Grammar 1x. No guest/GT mismatch.
