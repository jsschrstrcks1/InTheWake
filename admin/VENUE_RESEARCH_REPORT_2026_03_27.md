# Venue Research Report

**Date:** 2026-03-27
**Method:** Multi-LLM consultation (GPT-4o, Gemini 2.0, Grok-3) + web verification
**Pilot batch:** 19 venues across 4 cruise lines
**Total API cost:** ~$0.30 (57 queries)
**Branch:** `claude/explore-repos-docs-YYFnR`

---

## Model Accuracy Scorecard

| Model | Answered | Correct | Accuracy | Coverage | Hallucinations |
|-------|----------|---------|----------|----------|----------------|
| **Gemini** | 19/19 | 16 | **84%** | **100%** | 2 (minor: outdated NCL price, Sugar Beach nuance) |
| **GPT** | 14/19 | 9 | 64% | 74% | **5 dangerous** (claimed paid venues were free) |
| **Grok** | 0/19 | 0 | 0% | 0% | N/A (refused to answer anything) |

### GPT Hallucination Pattern (DANGEROUS)

GPT-4o has a systematic bias: when unsure about specialty dining prices, it
defaults to "Included in cruise fare" or "Complimentary." This is the opposite
of the truth for specialty restaurants.

| Venue | GPT Said | Actual Price | Risk |
|-------|----------|-------------|------|
| Wonderland | "Included" | **$59.99-65 pp** | Would tell readers a $60 meal is free |
| 150 Central Park | "Included" | **$65-70 pp** | Would tell readers a $70 meal is free |
| Chops Grille | "$42" | **$55-65 pp** | Underpriced by $15-20 |
| Jamie's Italian | "$30" | **$54.99 pp** | Underpriced by $25 |
| Playmakers | "Included" | **À la carte (paid)** | Would tell readers paid food is free |

**Conclusion:** GPT must NOT be trusted for cruise venue pricing without web verification.

### Gemini Performance

Gemini provided specific, accurate pricing for 16/19 venues. Its 2 errors:
- Teppanyaki (NCL): Said $39, actual is $60 (outdated — NCL changed pricing model in Jan 2025)
- Sugar Beach: Said "Included" — partially correct (ice cream free, candy paid)

Both errors are minor/directional. Gemini also provided the most detailed responses
with specific menu items, hours, and ship availability.

### Grok Assessment

Grok-3 returned "UNSURE" for every single price across all 19 venues. While this
is honest (better than hallucinating), it provides zero research value. Grok is
useful for challenging plans and finding blind spots (as shown in the orchestra
debate) but useless for factual venue research.

---

## Scaling Recommendation

For the remaining ~160 venues needing price research:

1. **Primary:** Gemini (84% accuracy, 100% coverage)
2. **Verification:** Web search for any venue where Gemini's confidence is MEDIUM/LOW
3. **Drop Grok** entirely for venue research (0% useful)
4. **Use GPT only for non-price fields** (cuisine descriptions, unique features) — never trust its prices

---

## Web-Verified Prices (19 Venues)

### Royal Caribbean

| Venue | Price | Type | Source |
|-------|-------|------|--------|
| Chops Grille | $55-65 pp dinner, $24-25 lunch | Cover charge | royalcaribbeanblog.com, cruisecritic.com |
| Izumi Hibachi | $45-50 pp hibachi; sushi à la carte $10-18 | Mixed | royalcaribbeanblog.com, gangwaze.com |
| Wonderland | $59.99-65 pp dinner | Cover charge | shinecruise.com, cruisecritic.com |
| 150 Central Park | $65-70 pp dinner | Cover charge | shinecruise.com, benanddavid.cruises |
| Jamie's Italian | $54.99 pp dinner, $23-26 lunch | Cover charge | shinecruise.com, benanddavid.cruises |
| El Loco Fresh | Complimentary | Free | royalcaribbean.com |
| Playmakers | No cover; à la carte food + drinks | À la carte | royalcaribbean.com |
| FlowRider | Included in cruise fare | Free | royalcaribbean.com |
| Sugar Beach | Ice cream included; candy à la carte ~$5-8 | Mixed | royalcaribbean.com |
| Bamboo Room | Complimentary (cocktails extra) | Free | royalcaribbean.com |

### Norwegian Cruise Line

| Venue | Price | Type | Source |
|-------|-------|------|--------|
| Cagney's Steakhouse | $60 pp | Cover charge | shinecruise.com, freestyletravelers.com |
| Le Bistro | $60 pp | Cover charge | shinecruise.com, freestyletravelers.com |
| Teppanyaki | $60 pp | Cover charge | shinecruise.com, profcruise.com |
| Ocean Blue | $60 pp | Cover charge | shinecruise.com, freestyletravelers.com |
| Food Republic | $50 pp (4 items) | Cover charge | shinecruise.com, freestyletravelers.com |

**NCL pricing tiers (2025):**
- $60: Steakhouse, Teppanyaki/Hasuki, Le Bistro, Seafood (Ocean Blue)
- $50: Moderno, Food Republic, Sushi
- $40: Italian, Q Texas Smokehouse, Pincho, Los Lobos

### Carnival Cruise Line

| Venue | Price | Type | Source |
|-------|-------|------|--------|
| Fahrenheit 555 | $52 pp | Cover charge | shinecruise.com, thecarnivalcruiseblog.com |
| Guy's Burger Joint | Complimentary | Free | carnival.com |
| Emeril's Bistro 1396 | À la carte ($3-10 per item) | À la carte | carnival.com, thecarnivalcruiseblog.com |

### Virgin Voyages

| Venue | Price | Type | Source |
|-------|-------|------|--------|
| Razzle Dazzle | Included (most dining included on Virgin) | Free | virginvoyages.com |

---

## Key Pricing Notes for Content Writers

1. **Prices change frequently.** Always include "as of [date]" and "prices may vary by ship and sailing."
2. **NCL standardized to cover charges in Jan 2025.** Previous à la carte pricing is outdated.
3. **RCL uses dynamic pricing.** The same restaurant can cost $55 on one ship and $70 on Icon of the Seas.
4. **Children's pricing:** Most venues charge $12.99-15 for kids 6-12, free for 5 and under.
5. **Gratuity:** RCL adds 18%, NCL and Carnival add 20% automatically.
6. **Dining packages** are accepted at all specialty venues and offer significant savings.

---

## Data Files Generated

| File | Purpose |
|------|---------|
| `admin/venue-research/` | Raw model responses (57 JSON files, 3 per venue) |
| `admin/venue-research-verified.json` | Cross-referenced model data with consensus flags |
| `admin/venue-research-verified-prices.json` | Web-verified prices for 19 venues |

---

## Next Steps

1. Scale Gemini-primary research to remaining NCL (73 venues), Virgin (45), MSC (45), Carnival (20), RCL (140+ with "Varies")
2. Web-verify any Gemini response with confidence < HIGH
3. Build automated script to update venue pages with verified prices
4. Track which prices change between cruise seasons for the content-freshness skill

---

*Soli Deo Gloria*
