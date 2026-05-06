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
7. **No medication-product affiliate links** anywhere in a Voyage Pack. The FTC vulnerable-consumer guidance applies. Educational coverage of medication options (drug names as text, mechanism of action, when to talk to a pharmacist) is fine and required; affiliate purchase links are not.

## Required baseline sections (every Voyage Pack)

The structure each pack should hit, regardless of audience tailoring:

1. **Welcome** — calm framing, who the pack is for
2. **At a Glance** — ship, dates, cabin pricing, ports of call
3. **Your Ship** — specific ship guide, cabin advice for THIS ship, dining, drinks, connectivity
4. **Day by Day** — embarkation through disembarkation, with port choices (easy / half / full)
5. **Pre-Cruise Countdown** — calibrated to actual sailing date
6. **Packing List** — calibrated to climate, ports, formal nights
7. **Budget Breakdown** — itemized realistic mid-range figure + how to spend less / more
8. **Seasickness** — added as baseline after v0.1.2 review identified the gap. Required because (a) every Caribbean / open-ocean cruise has seas, (b) some readers have vestibular issues that compound with motion, (c) FTC vulnerable-consumer rule rules out affiliate-link pages but readers still need the content. The section is editorial only — drug names as text, prevention timing, what works, when to talk to a pharmacist
9. **Audience-specific sections** — these vary by pack: accessibility, solo traveler, first cruiser, veterans, group cruise, family, etc. Pick what fits the audience.
10. **Closing** — brief, calm, brand voice

The seasickness gap (v0.1 + v0.1.2 both shipped without it) is documented in case future writing assistants make the same mistake — the FTC guidance correctly steers away from product affiliate links but should not steer the topic out of the document entirely.

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

## v0.1.2 — A second prototype: hosted group cruise, real partner

After v0.1 (Symphony Western Caribbean, generic itinerary), a second prototype was built for a *specific real sailing*: the **All Aboard, Veterans! Hosted Solo Cruisers Group Cruise** (Norwegian Aqua, Port Canaveral, Dec 12–19, 2027), hosted by Tina Maulsby of Maulsby Travel Co. (a Featured Contributor on the site).

**Two artifacts shipped:**
- `admin/voyage-packs/v0.1.2-ncl-aqua-veterans-solo-group-dec-2027.md` — content source (720 lines, ~10K words)
- `admin/voyage-packs/v0.1.2-ncl-aqua-veterans-solo-group-dec-2027.html` — rendered version using the site's CSS, with sticky TOC sidebar, Swiper video carousel pulling from `/assets/data/videos/norwegian/norwegian-aqua.json` (8 NCL Aqua YouTube videos), Tina bio block with avatar, port snapshot cards, hero image from Wikimedia Commons (CC BY-SA 4.0), print-friendly CSS, and 64 internal links across 37 unique destinations.

**Key differences from v0.1:**
- Audience-tailored (veterans + solo cruisers + group cruise rhythm) rather than generic
- Ship section uses the site's existing video data feed with no extra infrastructure
- Hosted-group considerations woven through (group dinners, meet-and-greets, what "hosted" means)
- Tina is positioned as both a Featured Contributor (site authority) and group host (booking entity); booking remains with her travel agency, the pack remains a planning companion sold separately

**Why this pattern matters:** Audience-tailored packs (specific group, specific persona) command higher pricing than generic packs and have natural promotion paths (Tina's email list, veterans-focused communities). The *cost* is that they're harder to scale — each one is its own writing project — and they tie pack revenue partially to the group's own marketing momentum.

## Partnership posture (Maulsby Travel Co.)

The bright lines for partnerships with travel agencies / contributors who also operate adjacent businesses:

1. **Booking goes through the travel agency.** The Voyage Pack does not include cruise booking, group registration, or commission-shared travel-agency referral. Tina's customers buy the pack from In the Wake; In the Wake takes pack revenue. Tina takes booking revenue from her own group separately. The two transactions don't cross.

2. **The pack doesn't promote the group's commercial offering beyond stating the host context.** It says "Tina hosts this group; reach her at maulsbytravel.com" because that is factual orientation. It doesn't pitch readers to upgrade cabin, buy ship excursions, or accept booking-related upsells.

3. **Editorial independence preserved.** Even though Tina is the group host AND a Featured Contributor on the site, the pack is editorially independent — the honest-read sections about Jamaica's tourism aggression, NCL's Free At Sea marketing language, etc., remain intact regardless of partnership. If Tina objects to specific content, that's a conversation; it isn't a veto.

4. **No cruise-line affiliate commissions.** The same v1.0 bright line that covers the rest of the site applies to packs. The pack does not earn commissions on the cruise booking itself.

5. **Pastoral surfaces remain untouched.** The pack doesn't promote support, drink packages, or any commercial elements on the grief-related sections (the closing note about grieving solo cruisers cross-links to Tina's grief article — that's editorial, not commercial).

6. **The pack is honest about the partnership.** The "About this document" section names Tina as group host and her booking entity; readers know the relationship from the start.

## What's still missing for v0.2 (image-sourcing focus)

The HTML prototype works visually but is leaning on placeholder images. Production v0.2 needs:

### P0 — image sourcing (the user's explicit ask)

| Need | Source candidate | Action | Effort |
|---|---|---|---|
| **NCL Aqua exterior photo** | [Norwegian Aqua at Southampton](https://commons.wikimedia.org/wiki/File:Norwegian_Aqua_southampton.JPG) — CC BY-SA 4.0 | Download, host at `assets/ships/ncl/norwegian-aqua-exterior.jpg`, write `.attr.json` companion file matching the existing pattern at `assets/ships/symphony-of-the-seas-wiki-attributions.json` | XS — single download |
| **Norwegian Aqua additional shots** | Wikimedia Commons category for Norwegian Aqua (sometimes empty for new ships); also consider NCL press kit or Wikimedia Commons "Cruise ships built in 2025" category | Source 2–4 additional CC-BY/CC-BY-SA images for variety; populate the existing ship page's swiper carousel | S |
| **Cozumel hero image** | [Cozumel Wikimedia category](https://commons.wikimedia.org/wiki/Category:Cozumel) — abundant CC images available | Download → `assets/ports/cozumel-hero.jpg` (new directory pattern) | S |
| **Grand Cayman hero image** | [Grand Cayman Wikimedia category](https://commons.wikimedia.org/wiki/Category:Grand_Cayman) | Download → `assets/ports/grand-cayman-hero.jpg` | S |
| **Ocho Rios / Falmouth / Montego Bay hero** | Wikimedia (Ocho Rios has Dunn's River Falls images abundant under CC) | Download → `assets/ports/ocho-rios-hero.jpg` | S |
| **Great Stirrup Cay hero** | Limited CC options (NCL private island; mostly NCL-controlled imagery). Wikimedia has a few; Flickr has CC-licensed visitor shots | Download → `assets/ports/great-stirrup-cay-hero.jpg` | M (license diligence) |
| **Tina's flyer ship-art image** | The flyer the user uploaded showing the NCL Aqua + military theme — ask Tina for a clean source file or the raw image she used | Download → `assets/social/all-aboard-veterans-2027.jpg`; use as the pack's social card | XS once received |

### P0 — also missing
- **Great Stirrup Cay port page** does not exist on the site. Should be commissioned as part of the broader site, not just for this pack. Effort: M.
- **Voyage Pack landing page** at `/voyage-packs.html` (the public listing where readers learn about and buy packs) — not yet built.
- **Buy flow / payment integration** — Gumroad or Buy Me A Coffee Shop digital-product listing; pricing finalized; refund policy documented.

### P1 — nice-to-have for v0.2
- **PDF export** of the HTML version (WeasyPrint or wkhtmltopdf; ~30 min setup)
- **Visual itinerary timeline** (8-day strip with port icons) — currently the day-by-day section reads as flat text
- **Port quick-reference cards** moved to a sticky-on-mobile drawer
- **Light / dark theme support** (the site has `color-scheme: light dark` declared but the pack's custom CSS should respect it)
- **Audio version** (accessibility for low-vision veterans) — XL effort, defer to v0.3
- **Buyer-name personalization** ("Welcome aboard, [name]" cover page) — defer to v0.3

### P2 — process / governance
- **Pack-update policy** when sailing-specific facts change (NCL itinerary changes, ship refurbishments, port closures). Currently there is no defined update workflow.
- **Pack versioning convention** (currently using v0.1, v0.1.2; need to settle on semver-style or sail-date-tagged convention).
- **Pack discoverability** — should packs be listed on `/articles.html` (probably no), `/voyage-packs.html` (yes once built), in the main nav (no for v0.2), in port-page sidebars (yes — soft promotion)?

## Image sourcing — recommended workflow

When sourcing Wikimedia Commons images:

1. **Find the file** at `commons.wikimedia.org` (use `Special:MediaSearch` for a port name)
2. **Verify license** — accept CC0, PD, CC-BY, CC-BY-SA. Reject any image with `non-commercial` or `no-derivatives` clauses
3. **Download** the file (use the original-resolution link from the file page; for the pack a 1280px-wide thumbnail is sufficient)
4. **Place** in the appropriate `assets/` subfolder
5. **Write attribution file** following the existing pattern at `assets/ships/symphony-of-the-seas-wiki-attributions.json`:
   - filename, path, source, sourceUrl, artist, license, licenseUrl, originalTitle, description, dimensions
6. **Commit** with message format: `assets: add port/ship hero image (Wikimedia, CC-BY-SA 4.0)`

For NCL Aqua specifically, this is a single-file change. For broader port-image rollout (28+ ports referenced across both prototype packs so far), this is a more substantial workstream — consider a Phase B sub-project.

## Status

- **v0.1 prototype** (Symphony Western Caribbean, generic): complete, hand-crafted, ~10K words ✓
- **v0.1.2 prototype** (NCL Aqua Veterans Solo Group, hosted): complete, Markdown + HTML, with floating TOC, Swiper carousel, port snapshot cards, Tina bio block ✓
- **Hero image sourced**: Norwegian Aqua via Wikimedia Commons (CC BY-SA 4.0), referenced via direct URL in HTML; production should self-host
- **Decision required**: review prototype, approve / iterate / reject the audience-tailored pack pattern
- **Next step**: pending your call

Soli Deo Gloria.
