# Ship Page Audit Findings — Every Ship, Read Line by Line

Started: 2026-04-06
Method: Read the full HTML source of every ship page. Document every issue found.
Rule: No validator runs. No batch processing. Read the page. Write down what's wrong.

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
