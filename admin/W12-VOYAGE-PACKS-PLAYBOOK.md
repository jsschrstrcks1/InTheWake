# W12 — Voyage Packs Playbook

## What this is

W12 from the v2.5 plan: **one-time-purchase ($19–29) integrated trip plans** generated from existing site data, sold to readers who want a complete pre-cruise document for one specific itinerary.

The v0.1 prototype is at `admin/voyage-packs/v0.1-symphony-western-caribbean-7n.md`. Read it before approving anything else.

## Why Voyage Packs solve the v2.5 tension

The brand promise is *"everything is free."* But every reader-supported indie precedent that's solvent gates *something* (per the You.com research). Voyage Packs resolve this by gating a **NEW product** rather than gating any existing tool, port page, ship guide, or article. Existing content stays free, forever. Voyage Packs are *additional* integration work that didn't exist before, sold as a one-time digital product.

That framing matters for the website pitch: *"We don't paywall what we already published. We sell new work, packaged for the moment of decision."*

## Prototype review checklist (decide before v0.2)

Read `admin/voyage-packs/v0.1-symphony-western-caribbean-7n.md` and answer:

1. **Is the depth right?** v0.1 is ~558 lines / ~30 reading minutes / ~10,000 words. Does this feel like $19–29 of value? Too thin → push deeper. Too long → trim, don't expand.
2. **Is the voice right?** The pack uses the same brand voice as `cruisinginthewake.com` — calm, specific, no urgency. Does that read well in document form, or does it feel too dry for a "premium" product?
3. **Does the itinerary structure work?** Day-by-day with three port choices per port (easy/half/full). Should the structure differ for short cruises (3–4 night) vs long (10+)?
4. **What's missing?** Likely candidates: (a) detailed deck plans, (b) restaurant menus excerpted for this ship, (c) a "what if you only get 3 hours in port" minimum-effort version, (d) packing-list ordering by sub-trip (carry-on, beach bag, formal-night bag), (e) printable checkboxes.
5. **What's overdone?** Possibly: (a) the budget breakdown (could be a single appendix table), (b) the closing section, (c) the audience-persona supplements (accessibility, solo, first-cruise) could be one merged section instead of three.
6. **Distribution format**: Markdown for review only. For sale, candidates are PDF (most professional, offline-friendly) or password-protected HTML (interactive, easier to update, but feels less like a "product").
7. **Pricing**: $19, $24, or $29? The plan says $19–29 range. The depth in v0.1 supports the higher end; honest valuation requires actual buyer feedback.

## Architecture for v0.2 (after prototype review)

### Path A — Hand-crafted authorship

Each Voyage Pack is hand-written by Ken (or a contributor), like a long-form article. Time investment: ~8–12 hours per pack to produce v0.1 quality.

**Pros:**
- Highest quality content, full editorial voice
- Real port-day strategy, not generic recommendations
- Opportunity to learn what readers actually want over time

**Cons:**
- Doesn't scale; ~10–15 packs/year achievable
- Each new ship/itinerary is another long write
- Refresh schedule is real (new sailing season → port-time changes, new ship features → ship section needs update)

**Best fit:** the first 5–10 packs, while learning the product.

### Path B — Generator-assisted

A Python script reads JSON data (ship deployments, port pages, restaurants, etc.) and generates an 80%-of-the-way-there draft, which Ken reviews and edits to final.

**Pros:**
- Scales to every Royal Caribbean, NCL, Carnival, MSC, Virgin, Princess itinerary the site covers
- Refresh is mostly automatic (re-run generator, diff, edit hot spots)
- Ship sections are identical across packs for the same ship — write once, reuse

**Cons:**
- ~40–80 hours of upfront generator development
- Generated drafts will have a "templated" feel without careful editing
- Brand voice maintenance becomes script-maintenance

**Best fit:** packs 11+ once volume justifies the investment.

### Path C — Hybrid (recommended)

1. Hand-craft the first 5 packs (Symphony Western Caribbean, Wonder Eastern Caribbean, NCL Bliss Alaska, Virgin Resilient Lady Mediterranean, Carnival Mardi Gras Eastern Caribbean) at v0.1 quality
2. Identify what's actually generatable vs what needs editorial
3. Build a *partial* generator that produces stubs for: ship overview (read from `assets/data/ships/{line}/{ship}.page.json`), packing list (template + climate adjustment), budget table (template + cruise-line-specific pricing), countdown (template-based)
4. Editorial wrap remains hand-written: itinerary commentary, port choices, voice opener, voice closer, FAQ if relevant, accessibility/solo/first-cruise notes

This is the realistic path for a single-author + LLM operation.

## Operational decisions to settle before v0.2

| Decision | Locked? | Recommendation |
|---|---|---|
| **Pricing** | Open | $24 introductory; raise to $29 after 50 sales if feedback supports |
| **Distribution platform** | Open | Gumroad or Buy Me A Coffee Shop (BMAC supports digital products — same platform as W6.1) |
| **Format** | Open | PDF (primary) + HTML preview snippet on the product page |
| **Refresh policy** | Open | Free updates within "current season" (about 6 months); buyers get email notification when their itinerary's pack is updated |
| **Customization tier?** | Open | NO for v0.2; stick to itinerary-level granularity |
| **Should the pack include affiliate links?** | Open | Default NO (consistent with brand); Amazon links only if bought through `/articles/` first |
| **Should buyers be added to a mailing list?** | Open | NO without explicit opt-in; respect the calm-voice discipline |
| **Should we offer refunds?** | Open | YES, 30-day no-questions refund — consistent with the trust posture |
| **Should we offer a "couple's pack" at slightly higher price?** | Open | NO for v0.2; one purchase per cruise |

## Pricing math

Best estimate at $24 per pack:

- Gumroad / BMAC platform fee: 10% + ~$0.30/transaction = ~$2.70/pack
- Net per pack: ~$21.30

| Annual sales | Gross revenue | Net revenue |
|---|---|---|
| 50 packs | $1,200 | $1,065 |
| 100 packs | $2,400 | $2,130 |
| 200 packs | $4,800 | $4,260 |
| 500 packs | $12,000 | $10,650 |

500 packs/year at $24 each is **plausible but ambitious**. At our current Bing organic volume (~1,100 clicks/quarter = ~4,400/year), even a 5% conversion-from-relevant-traffic rate gives ~220 packs/year *if every reader sees the offer at the right moment*. Realistic v0.2 expectation: 50–150 packs/year for the first cohort across 5–10 itineraries.

Compare to W6.1 Duck Club ($3–5/mo × ~50 members at 0.5–2.5% conversion of engaged audience = ~$150–500/mo). Voyage Packs and Duck Club are complementary, not competitive — different reader intents.

## Bright lines for Voyage Packs

These are non-negotiable per the v2.5 plan:

1. **No paywalls on existing content.** Voyage Packs are NEW work; nothing previously published gets gated.
2. **No urgency-language CTAs.** No "limited time," no "act now," no manufactured scarcity.
3. **No grief-surface promotion.** Don't link to Voyage Packs from `/solo/` or grief content.
4. **Refunds honored.** No-questions 30-day refund window.
5. **No cruise-line affiliations within packs.** The same posture as the rest of the site.
6. **Each pack is itinerary-specific, not a generic guide rebranded.** A Voyage Pack that's mostly the same as a free article is fraud. The pack must contain integration work that doesn't exist anywhere else on the site.

## What to do next

Once you've read the v0.1 prototype:

- If it feels right → green-light v0.2 (refine v0.1 and ship it for sale)
- If it feels close → list the changes needed; I can iterate
- If it feels wrong → tell me where the disconnect is and we rethink scope

If the prototype gets a green light, next session work:
1. Refine v0.1 to v0.2 (probably 1–2 hours of edits)
2. Convert to PDF (using WeasyPrint or pandoc; ~30 min setup)
3. Set up Gumroad or BMAC product listing
4. Build a `/voyage-packs.html` landing page (similar in voice to `/support.html`)
5. Soft launch — share with 5 readers first for direct feedback before public

## Status

- **v0.1 prototype**: complete, hand-crafted, ~10K words ✓
- **Decision required**: review prototype, approve / iterate / reject
- **Next step**: pending your call

Soli Deo Gloria.
