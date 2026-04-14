# Ship Page Validation Failure Report

**Generated:** 2026-03-25
**Validator:** ITW-SHIP-002 v2.5  |  **Threshold:** 80/100

## Summary

| Metric | Value |
|--------|-------|
| Total ships | 289 |
| Passing (≥80) | 181 |
| Failing (<80) | 108 |
| Pass rate | 63% |

## Pass/Fail by Cruise Line

| Line | Pass | Fail | Total | Rate |
|------|------|------|-------|------|
| rcl | 34 | 14 | 48 | 71% |
| carnival | 27 | 21 | 48 | 56% |
| celebrity | 16 | 13 | 29 | 55% |
| norwegian | 20 | 0 | 20 | 100% |
| princess | 17 | 0 | 17 | 100% |
| holland | 46 | 0 | 46 | 100% |
| msc | 8 | 16 | 24 | 33% |
| cunard | 4 | 0 | 4 | 100% |
| oceania | 3 | 5 | 8 | 38% |
| seabourn | 3 | 4 | 7 | 43% |
| silversea | 1 | 11 | 12 | 8% |
| virgin | 2 | 2 | 4 | 50% |
| costa | 0 | 9 | 9 | 0% |
| regent | 0 | 7 | 7 | 0% |
| explora | 0 | 6 | 6 | 0% |

## Blocking Errors (by frequency across all failing ships)

These are hard blockers — each one deducts points and prevents passing until resolved.

| Count | Code | Description |
|-------|------|-------------|
| 66 | `videos/missing_categories` | Missing video categories: ship walk through, top ten, suite, balcony, oceanview, interior, food, acc |
| 62 | `videos/few_videos` | Only 0 videos, minimum 10 |
| 42 | `images/few_images` | Only 5 images, minimum 8 |
| 17 | `logbook/few_stories` | Only 2 stories, minimum 10 |
| 12 | `data_attr/invalid_imo` | IMO "0" is not valid 7-digit format |
| 8 | `sections/missing_required` | Missing required sections: page_intro, recent_rail |
| 8 | `sections/wrong_section_order` | Sections out of expected order: logbook. Expected order: page_intro → first_look → dining → logbook  |
| 7 | `word_counts/page_too_short` | Static page content (338 words) below minimum 500 (excluding dynamic content) |
| 7 | `videos/missing_file` | Videos JSON not found |
| 6 | `logbook/missing_file` | Logbook JSON not found: /home/user/InTheWake/assets/data/logbook/carnival/unnamed-project-ace-1.json |
| 3 | `sections/missing_nav_top` | Missing #recent-rail-nav-top |
| 3 | `sections/missing_nav_bottom` | Missing #recent-rail-nav-bottom |
| 2 | `javascript/swiper_missing_rewind` | 1 Swiper carousels missing rewind:false (causes infinite scroll bug) |
| 1 | `inline_json/stats_missing_fields` | Ship stats JSON missing fields: entered_service |
| 1 | `consistency/wrong_ship_tracker` | Tracker heading references "Icon Class Ship (TBN 2027)" but page is for "Icon Class Ship Tbn 2027" |
| 1 | `content_structure/missing_answer_line` | Missing answer-line element. Every ship page needs a quick one-line answer. |
| 1 | `content_structure/missing_key_facts` | Missing key-facts element. Every ship page needs a key facts summary. |
| 1 | `content_purity/forbidden_nightlife` | Forbidden content found: "Nightclub" (nightlife) |
| 1 | `clean_console/js_runtime_errors` | 1 potential console error(s): Potential null reference: querySelector('p').textContent... (use ?. or |

## Warnings (by frequency across all failing ships)

| Count | Code | Description |
|-------|------|-------------|
| 102 | `logbook/spine_sections_missing` | Logbook missing 7 spine section(s): Full Disclosure, The Crew and Staff, Embarkation & Disembarkatio |
| 102 | `logbook/missing_female_crewmate` | No 'A Female Crewmate's Perspective' section found in logbook stories |
| 96 | `word_counts/faq_too_short` | FAQ section (177 words) below minimum 200 |
| 88 | `logbook/weak_emotional_content` | 2/2 stories lack emotional pivot markers (tears, heart reactions, whispers, etc.) |
| 87 | `sections/missing_grid2_firstlook_dining` | First Look and Dining should be paired in a grid-2 section |
| 61 | `discoverability/in_atlas_not_ready` | Ship in atlas but page only 58% ready - do not link from atlas page until 90%+ |
| 47 | `logbook/missing_personas` | Missing personas: solo, family, honeymoon, elderly, widow, accessible |
| 23 | `sections/missing_grid2_map_tracker` | Deck Plans and Tracker should be paired in a grid-2 section |
| 20 | `images/historic_few_images` | Historic ship has 7 images (acceptable for retired ships) |
| 19 | `videos/historic_no_videos` | Historic ship has no videos (acceptable for retired ships) |
| 16 | `discoverability/historic_not_in_atlas` | Historic ship not in ship atlas (acceptable for retired ships) |
| 13 | `discoverability/not_atlas_ready` | Ship scores 62% - needs 90%+ to be added to ship atlas |
| 13 | `service_worker/missing_sw_registration` | No Service Worker registration found. Add navigator.serviceWorker.register('/sw.js') for offline sup |
| 10 | `clean_console/debug_statements` | 2 console statement(s) found (debug code in production) |
| 9 | `data_attr/historic_no_imo` | Historic ship has no data-imo (acceptable for retired ships) |
| 8 | `logbook/limited_sensory_detail` | Logbook stories only engage 2/5 senses (visual, tactile). Aim for 3+ senses across stories. |
| 8 | `videos/tbn_missing_categories` | TBN ship missing video categories: ship walk through, top ten, suite, balcony, oceanview, interior,  |
| 8 | `logbook/historic_few_stories` | Historic ship has 4 stories (acceptable for retired ships) |
| 8 | `inline_json/missing_dining_source` | Missing #dining-data-source JSON element |
| 7 | `json_ld/generic_review_text` | Review contains generic templated text — reviewBody should reflect real editorial assessment |
| 7 | `videos/missing_file` | Videos JSON not found (TBN ship exempt until entering service — D2/D1) |
| 6 | `videos/tbn_no_videos` | TBN ship has no videos (exempt until ship enters service — D2/D1) |
| 6 | `content_purity/forbidden_brochure` | Forbidden content found: "Perfect for" (brochure) |
| 6 | `faq/many_faqs` | 10 FAQs, recommended max 8 |
| 5 | `icp_lite/ai_summary_short` | ai-summary is short (86 chars) |
| 5 | `logbook/missing_disclosure_type` | No disclosure type (A/B/C) detected. Logbook should declare if stories are firsthand (A), research-b |
| 4 | `content_purity/forbidden_marketing` | Forbidden content found: "luxury" (marketing) |
| 4 | `logbook/short_stories` | 1 stories under 300 words |
| 2 | `logbook/missing_reflection` | 2/2 stories lack lesson/reflection markers ("I learned", "looking back", etc.) |
| 2 | `javascript/swiper_missing_loop` | 1 Swiper carousels missing loop:false (gold standard requires explicit loop:false) |
| 2 | `soli_deo_gloria/sdg_position` | Soli Deo Gloria found but not in first 3 lines. Should appear before <!doctype html>. |
| 2 | `sections/missing_whimsical_units` | Missing #whimsical-units-container in right rail |
| 2 | `discoverability/tbn_in_atlas` | TBN ship is in atlas (unusual - may need removal until ship is named) |
| 1 | `images/short_alt` | 1 images have short alt text |
| 1 | `data_attr/tbn_imo_not_tbd` | TBN ship should have data-imo="TBD" |
| 1 | `sections/missing_author_card` | Missing author card in right rail |
| 1 | `print_button/position` | Print button should be the last element before </main> |
| 1 | `content_promises/unfulfilled_promise` | Meta description mentions "video" but no video content found |
| 1 | `accessibility/sdg_aria_hidden` | Soli Deo Gloria footer dedication has aria-hidden="true" — should be accessible to all users |
| 1 | `content_purity/forbidden_gambling` | Forbidden content found: "gamble" (gambling) |
| 1 | `videos/tbn_few_videos` | TBN ship has only 8 videos (exempt until ship enters service — D2/D1) |

## Per-Line Failure Details

### RCL

| Ship | Score | Blocking | Top Issues |
|------|-------|----------|------------|
| icon-class-ship-tbn-2027 | 54 | 3 | Tracker heading references "Icon Class Ship (TBN 2027)" but ; Only 6 images, minimum 8; Missing personas: solo, family, honeymoon, elderly, widow, a |
| discovery-class-ship-tbn | 56 | 3 | Only 5 images, minimum 8; Only 2 stories, minimum 10; Review contains generic templated text — reviewBody should r |
| legend-of-the-seas | 60 | 3 | Only 5 stories, minimum 10; Only 0 videos, minimum 10; Missing personas: family, honeymoon, elderly, widow, accessi |
| quantum-ultra-class-ship-tbn-2029 | 62 | 2 | Only 6 images, minimum 8; Only 2 stories, minimum 10; Missing personas: solo, family, honeymoon, elderly, widow, a |
| icon-class-ship-tbn-2028 | 64 | 2 | Only 6 images, minimum 8; Only 2 stories, minimum 10; Missing personas: solo, family, honeymoon, elderly, widow, a |
| oasis-class-ship-tbn-2028 | 64 | 2 | Only 6 images, minimum 8; Only 2 stories, minimum 10; Review contains generic templated text — reviewBody should r |
| quantum-ultra-class-ship-tbn-2028 | 64 | 2 | Only 6 images, minimum 8; Only 2 stories, minimum 10; Missing personas: solo, family, honeymoon, elderly, widow, a |
| legend-of-the-seas-icon-class-entering-service-in-2026 | 66 | 2 | Only 6 images, minimum 8; Only 3 stories, minimum 10; Missing personas: solo, family, honeymoon, elderly, widow, a |
| star-class-ship-tbn-2028 | 66 | 2 | Only 6 images, minimum 8; Only 2 stories, minimum 10; Missing personas: solo, family, honeymoon, elderly, widow, a |
| song-of-america | 74 | 0 | Review contains generic templated text — reviewBody should r |
| nordic-empress | 76 | 0 | ai-summary is short (86 chars) |
| nordic-prince | 76 | 0 | ai-summary is short (85 chars) |
| sovereign-of-the-seas | 78 | 0 | Deck Plans and Tracker should be paired in a grid-2 section |
| sun-viking | 78 | 0 | ai-summary is short (82 chars) |

### CARNIVAL

| Ship | Score | Blocking | Top Issues |
|------|-------|----------|------------|
| carnival-tropicale | 4 | 7 | Missing required sections: page_intro, first_look; IMO "0" is not valid 7-digit format; Soli Deo Gloria found but not in first 3 lines. Should appea |
| carnival-adventure | 12 | 6 | Missing required sections: page_intro, recent_rail; Only 3 images, minimum 8; First Look and Dining should be paired in a grid-2 section |
| unnamed-project-ace-1 | 32 | 6 | Missing required sections: attribution; IMO "0" is not valid 7-digit format; First Look and Dining should be paired in a grid-2 section |
| unnamed-project-ace-2 | 32 | 6 | Missing required sections: attribution; IMO "0" is not valid 7-digit format; First Look and Dining should be paired in a grid-2 section |
| unnamed-project-ace-3 | 32 | 6 | Missing required sections: attribution; IMO "0" is not valid 7-digit format; First Look and Dining should be paired in a grid-2 section |
| carnival-encounter | 56 | 3 | Only 0 videos, minimum 10; Missing video categories: ship walk through, top ten, suite,; First Look and Dining should be paired in a grid-2 section |
| mardi-gras | 56 | 3 | Only 3 stories, minimum 10; Only 0 videos, minimum 10; First Look and Dining should be paired in a grid-2 section |
| carnivale-1956 | 72 | 0 | First Look and Dining should be paired in a grid-2 section |
| festivale-1961 | 72 | 0 | First Look and Dining should be paired in a grid-2 section |
| carnival-inspiration | 74 | 0 | First Look and Dining should be paired in a grid-2 section |
| carnival-sensation | 74 | 0 | First Look and Dining should be paired in a grid-2 section |
| celebration-1987 | 74 | 0 | First Look and Dining should be paired in a grid-2 section |
| holiday-1985 | 74 | 0 | First Look and Dining should be paired in a grid-2 section |
| jubilee-1986 | 74 | 0 | First Look and Dining should be paired in a grid-2 section |
| mardi-gras-1972 | 74 | 0 | First Look and Dining should be paired in a grid-2 section |
| tropicale-1981 | 74 | 0 | First Look and Dining should be paired in a grid-2 section |
| carnival-ecstasy | 76 | 0 | First Look and Dining should be paired in a grid-2 section |
| carnival-fantasy | 76 | 0 | First Look and Dining should be paired in a grid-2 section |
| carnival-fascination | 76 | 0 | First Look and Dining should be paired in a grid-2 section |
| carnival-imagination | 76 | 0 | First Look and Dining should be paired in a grid-2 section |
| carnival-festivale | 78 | 0 | Soli Deo Gloria found but not in first 3 lines. Should appea |

### CELEBRITY

| Ship | Score | Blocking | Top Issues |
|------|-------|----------|------------|
| unnamed-edge-class | 4 | 9 | Missing required sections: first_look, attribution; Sections out of expected order: logbook. Expected order: pag; First Look and Dining should be paired in a grid-2 section |
| unnamed-project-nirvana | 4 | 9 | Missing required sections: first_look, attribution; Sections out of expected order: logbook. Expected order: pag; First Look and Dining should be paired in a grid-2 section |
| unnamed-river-class-x6 | 4 | 9 | Missing required sections: first_look, attribution; Sections out of expected order: logbook. Expected order: pag; First Look and Dining should be paired in a grid-2 section |
| celebrity-xcel | 48 | 4 | Only 6 images, minimum 8; Only 3 stories, minimum 10; First Look and Dining should be paired in a grid-2 section |
| celebrity-constellation | 54 | 3 | Only 0 stories, minimum 10; Only 0 videos, minimum 10; First Look and Dining should be paired in a grid-2 section |
| celebrity-infinity | 54 | 3 | Only 0 stories, minimum 10; Only 0 videos, minimum 10; First Look and Dining should be paired in a grid-2 section |
| celebrity-compass | 58 | 3 | Sections out of expected order: logbook. Expected order: pag; Only 6 images, minimum 8; Missing personas: solo, family, honeymoon, elderly, widow, a |
| celebrity-seeker | 58 | 3 | Sections out of expected order: logbook. Expected order: pag; Only 6 images, minimum 8; Missing personas: solo, family, honeymoon, elderly, widow, a |
| celebrity-xperience | 58 | 3 | Sections out of expected order: logbook. Expected order: pag; Only 6 images, minimum 8; Missing personas: solo, family, honeymoon, elderly, widow, a |
| celebrity-flora | 68 | 2 | Only 0 videos, minimum 10; Missing video categories: ship walk through, top ten, suite,; First Look and Dining should be paired in a grid-2 section |
| celebrity-millennium | 68 | 2 | Only 1 videos, minimum 10; Missing video categories: top ten, suite, balcony, oceanview; First Look and Dining should be paired in a grid-2 section |
| celebrity-century | 78 | 0 | ai-summary is short (51 chars) |
| ss-meridian | 78 | 0 | ai-summary is short (45 chars) |

### MSC

| Ship | Score | Blocking | Top Issues |
|------|-------|----------|------------|
| msc-bellissima | 58 | 3 | Only 7 images, minimum 8; Only 0 videos, minimum 10; First Look and Dining should be paired in a grid-2 section |
| msc-seaview | 58 | 3 | Only 7 images, minimum 8; Only 0 videos, minimum 10; First Look and Dining should be paired in a grid-2 section |
| msc-world-asia | 58 | 3 | Only 7 images, minimum 8; Only 0 videos, minimum 10; First Look and Dining should be paired in a grid-2 section |
| msc-armonia | 68 | 2 | Only 0 videos, minimum 10; Missing video categories: ship walk through, top ten, suite,; First Look and Dining should be paired in a grid-2 section |
| msc-euribia | 68 | 2 | Only 0 videos, minimum 10; Missing video categories: ship walk through, top ten, suite,; First Look and Dining should be paired in a grid-2 section |
| msc-lirica | 68 | 2 | Only 0 videos, minimum 10; Missing video categories: ship walk through, top ten, suite,; First Look and Dining should be paired in a grid-2 section |
| msc-opera | 68 | 2 | Only 0 videos, minimum 10; Missing video categories: ship walk through, top ten, suite,; First Look and Dining should be paired in a grid-2 section |
| msc-poesia | 68 | 2 | Only 0 videos, minimum 10; Missing video categories: ship walk through, top ten, suite,; First Look and Dining should be paired in a grid-2 section |
| msc-preziosa | 68 | 2 | Only 0 videos, minimum 10; Missing video categories: ship walk through, top ten, suite,; First Look and Dining should be paired in a grid-2 section |
| msc-sinfonia | 68 | 2 | Only 0 videos, minimum 10; Missing video categories: ship walk through, top ten, suite,; First Look and Dining should be paired in a grid-2 section |
| msc-splendida | 68 | 2 | Only 0 videos, minimum 10; Missing video categories: ship walk through, top ten, suite,; First Look and Dining should be paired in a grid-2 section |
| msc-virtuosa | 68 | 2 | Only 0 videos, minimum 10; Missing video categories: ship walk through, top ten, suite,; First Look and Dining should be paired in a grid-2 section |
| msc-fantasia | 78 | 1 | Missing video categories: ship walk through, top ten, oceanv; First Look and Dining should be paired in a grid-2 section |
| msc-grandiosa | 78 | 1 | Missing video categories: top ten, food, accessible; First Look and Dining should be paired in a grid-2 section |
| msc-musica | 78 | 1 | Missing video categories: ship walk through, top ten, food, ; First Look and Dining should be paired in a grid-2 section |
| msc-orchestra | 78 | 1 | Missing video categories: ship walk through, top ten, food, ; First Look and Dining should be paired in a grid-2 section |

### COSTA

| Ship | Score | Blocking | Top Issues |
|------|-------|----------|------------|
| costa-firenze | 56 | 3 | Only 7 images, minimum 8; Only 0 videos, minimum 10; First Look and Dining should be paired in a grid-2 section |
| costa-toscana | 56 | 3 | Only 7 images, minimum 8; Only 0 videos, minimum 10; First Look and Dining should be paired in a grid-2 section |
| costa-venezia | 58 | 3 | Only 7 images, minimum 8; Only 0 videos, minimum 10; First Look and Dining should be paired in a grid-2 section |
| costa-favolosa | 66 | 2 | Only 0 videos, minimum 10; Missing video categories: ship walk through, top ten, suite,; First Look and Dining should be paired in a grid-2 section |
| costa-smeralda | 66 | 2 | Only 0 videos, minimum 10; Missing video categories: ship walk through, top ten, suite,; First Look and Dining should be paired in a grid-2 section |
| costa-deliziosa | 68 | 2 | Only 0 videos, minimum 10; Missing video categories: ship walk through, top ten, suite,; First Look and Dining should be paired in a grid-2 section |
| costa-diadema | 68 | 2 | Only 0 videos, minimum 10; Missing video categories: ship walk through, top ten, suite,; First Look and Dining should be paired in a grid-2 section |
| costa-fascinosa | 70 | 2 | Only 0 videos, minimum 10; Missing video categories: ship walk through, top ten, suite,; First Look and Dining should be paired in a grid-2 section |
| costa-pacifica | 70 | 2 | Only 0 videos, minimum 10; Missing video categories: ship walk through, top ten, suite,; First Look and Dining should be paired in a grid-2 section |

### OCEANIA

| Ship | Score | Blocking | Top Issues |
|------|-------|----------|------------|
| allura | 58 | 3 | Only 7 images, minimum 8; Only 0 videos, minimum 10; First Look and Dining should be paired in a grid-2 section |
| marina | 58 | 3 | Only 7 images, minimum 8; Only 0 videos, minimum 10; First Look and Dining should be paired in a grid-2 section |
| insignia | 70 | 2 | Only 0 videos, minimum 10; Missing video categories: ship walk through, top ten, suite,; First Look and Dining should be paired in a grid-2 section |
| sirena | 74 | 1 | Only 7 images, minimum 8; 5 stories under 300 words |
| vista | 76 | 1 | Only 7 images, minimum 8; 7 stories under 300 words |

### REGENT

| Ship | Score | Blocking | Top Issues |
|------|-------|----------|------------|
| prestige | 48 | 4 | IMO "0" is not valid 7-digit format; Only 6 images, minimum 8; First Look and Dining should be paired in a grid-2 section |
| seven-seas-grandeur | 60 | 3 | Only 7 images, minimum 8; Only 0 videos, minimum 10; First Look and Dining should be paired in a grid-2 section |
| seven-seas-voyager | 68 | 2 | Only 0 videos, minimum 10; Missing video categories: ship walk through, top ten, suite,; First Look and Dining should be paired in a grid-2 section |
| seven-seas-explorer | 70 | 2 | Only 0 videos, minimum 10; Missing video categories: ship walk through, top ten, suite,; First Look and Dining should be paired in a grid-2 section |
| seven-seas-mariner | 70 | 2 | Only 0 videos, minimum 10; Missing video categories: ship walk through, top ten, suite,; First Look and Dining should be paired in a grid-2 section |
| seven-seas-navigator | 70 | 2 | Only 0 videos, minimum 10; Missing video categories: ship walk through, top ten, suite,; First Look and Dining should be paired in a grid-2 section |
| seven-seas-splendor | 70 | 2 | Only 0 videos, minimum 10; Missing video categories: ship walk through, top ten, suite,; First Look and Dining should be paired in a grid-2 section |

### SEABOURN

| Ship | Score | Blocking | Top Issues |
|------|-------|----------|------------|
| seabourn-pursuit | 56 | 3 | Only 7 images, minimum 8; Only 0 videos, minimum 10; First Look and Dining should be paired in a grid-2 section |
| seabourn-odyssey | 68 | 2 | Only 0 videos, minimum 10; Missing video categories: ship walk through, top ten, suite,; First Look and Dining should be paired in a grid-2 section |
| seabourn-ovation | 68 | 2 | Only 0 videos, minimum 10; Missing video categories: ship walk through, top ten, suite,; First Look and Dining should be paired in a grid-2 section |
| seabourn-venture | 68 | 2 | Only 0 videos, minimum 10; Missing video categories: ship walk through, top ten, suite,; First Look and Dining should be paired in a grid-2 section |

### SILVERSEA

| Ship | Score | Blocking | Top Issues |
|------|-------|----------|------------|
| silver-nova | 58 | 3 | Only 7 images, minimum 8; Only 0 videos, minimum 10; First Look and Dining should be paired in a grid-2 section |
| silver-origin | 58 | 3 | Only 7 images, minimum 8; Only 0 videos, minimum 10; First Look and Dining should be paired in a grid-2 section |
| silver-moon | 66 | 2 | Only 0 videos, minimum 10; Missing video categories: ship walk through, top ten, suite,; First Look and Dining should be paired in a grid-2 section |
| silver-shadow | 66 | 2 | Only 0 videos, minimum 10; Missing video categories: ship walk through, top ten, suite,; First Look and Dining should be paired in a grid-2 section |
| silver-spirit | 66 | 2 | Only 0 videos, minimum 10; Missing video categories: ship walk through, top ten, suite,; First Look and Dining should be paired in a grid-2 section |
| silver-wind | 66 | 2 | Only 0 videos, minimum 10; Missing video categories: ship walk through, top ten, suite,; First Look and Dining should be paired in a grid-2 section |
| silver-cloud | 68 | 2 | Only 0 videos, minimum 10; Missing video categories: ship walk through, top ten, suite,; First Look and Dining should be paired in a grid-2 section |
| silver-dawn | 68 | 2 | Only 0 videos, minimum 10; Missing video categories: ship walk through, top ten, suite,; First Look and Dining should be paired in a grid-2 section |
| silver-muse | 68 | 2 | Only 0 videos, minimum 10; Missing video categories: ship walk through, top ten, suite,; First Look and Dining should be paired in a grid-2 section |
| silver-ray | 68 | 2 | Only 0 videos, minimum 10; Missing video categories: ship walk through, top ten, suite,; First Look and Dining should be paired in a grid-2 section |
| silver-whisper | 68 | 2 | Only 0 videos, minimum 10; Missing video categories: ship walk through, top ten, suite,; First Look and Dining should be paired in a grid-2 section |

### EXPLORA

| Ship | Score | Blocking | Top Issues |
|------|-------|----------|------------|
| explora-iii | 48 | 4 | IMO "0" is not valid 7-digit format; Only 7 images, minimum 8; First Look and Dining should be paired in a grid-2 section |
| explora-iv | 48 | 4 | IMO "0" is not valid 7-digit format; Only 7 images, minimum 8; First Look and Dining should be paired in a grid-2 section |
| explora-v | 48 | 4 | IMO "0" is not valid 7-digit format; Only 7 images, minimum 8; First Look and Dining should be paired in a grid-2 section |
| explora-vi | 48 | 4 | IMO "0" is not valid 7-digit format; Only 7 images, minimum 8; First Look and Dining should be paired in a grid-2 section |
| explora-i | 58 | 3 | Only 7 images, minimum 8; Only 0 videos, minimum 10; First Look and Dining should be paired in a grid-2 section |
| explora-ii | 58 | 3 | Only 7 images, minimum 8; Only 0 videos, minimum 10; First Look and Dining should be paired in a grid-2 section |

### VIRGIN

| Ship | Score | Blocking | Top Issues |
|------|-------|----------|------------|
| brilliant-lady | 46 | 4 | Sections out of expected order: videos. Expected order: page; Only 7 images, minimum 8; First Look and Dining should be paired in a grid-2 section |
| valiant-lady | 56 | 3 | Sections out of expected order: logbook, videos. Expected or; Only 0 videos, minimum 10; First Look and Dining should be paired in a grid-2 section |

