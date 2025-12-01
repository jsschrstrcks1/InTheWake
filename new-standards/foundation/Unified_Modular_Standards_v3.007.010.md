
# In the Wake — Unified Modular Standards (Superset v3.007.010)

> **Version Lineage:** v2.233 → v2.245 → v2.256(.003/.022) → v2.4 → v2.257 → v3.001 → v3.002 → v3.003 → **v3.007.010**  
> **Merge Policy (Golden Merge):** Newer wins · Additive only · No regressions · Explicit supersession notes  
> **Canonical Host:** https://cruisinginthewake.com/

This superset integrates the modular taxonomy, the historical v2.4 bundle, and the **Frontend Standards v3.007.010 (Grandeur template baseline)**. It is the single source of truth for structure, contracts, accessibility, performance, PWA, JSON-LD, content, and CI.

---

## 0) Overview & Governance

- **Purpose:** Prevent drift across modules and generators; guarantee deterministic, standards-compliant pages.  
- **Scope:** All HTML/JSON/CSS/JS under the In the Wake project.  
- **Semver-ish:** Use the site version consistently in `<meta name="version">`, visible badge (optional), and `?v=` query for assets.

**Contracts not to rename without migration:** `.card`, `.pills`, `.pill-nav`, `.grid-2`, `.visually-hidden-focusable`, `.hidden`, `.swiper.*`, `.voyage-tips`, `.prose`, `#vx-grid .vx`.

---

## 00-Core (Perplexity-aligned)

### 00.1 EVERY-PAGE_STANDARDS.md (Universal Checklist)
- Exactly one `<h1>` (may be visually hidden but programmatically reachable).  
- Landmarks: `<header>`, `<main id="content" tabindex="-1">`, `<footer>`.  
- **Skip link** to `#content` using `.visually-hidden-focusable`.  
- Absolute URLs only; `_abs()` available before any fetch/linking.  
- Versioned assets `?v=__VERSION__`.  
- Watermark background with low opacity (.06–.08).  
- Persona disclosure pill when first-person narrative is present.  
- Referrer policy: `<meta name="referrer" content="no-referrer">`.
- Appendix C & D - pastoral Guard Rails, and content guidelines.

### 00.2 HEAD_SNIPPET.html (Canonical Head Insert)
Order:
1) `<!doctype html>` + `<html lang="en">`  
2) `<meta charset="utf-8">`  
3) `<meta name="viewport"...>`  
4) **Analytics** (Google tag async; Umami defer)  
5) **_abs() helper** and **canonicalization (apex→www)**  
6) `<title>`, description, robots, theme-color, **version**  
7) Canonical + OG/Twitter meta  
8) CSS bundle + Swiper loader (self-hosted with CDN fallback)  
9) Optional preconnects/preloads that the page actually needs (LCP image, YouTube-nocookie, i.ytimg.com, VesselFinder, ConsentManager)

### 00.3 FOOTER_SNIPPET.html (Canonical Footer Insert)
- Cache pre-warm via `SiteCache.getJSON()` (fleet, venues, personas, videos).  
- Service worker registration (`/sw.js?v=__VERSION__`) with fail-safe.  
- Hidden doxology comment injection (see 00.4).

### 00.4 HIDDEN_INVOCATION_COMMENTS.html
Embed, near `</html>`:
" ```html "
<!-- Soli Deo Gloria — Every pixel and part of this project is offered as worship to God, in gratitude for the beautiful things He has created for us to enjoy. -->

(Use the visible banner per §05-Brand.)

00.5 SEO_STRUCTURED_DATA.md + JSONLD_TEMPLATES/
	•	Provide Organization, WebSite+SearchAction, WebPage, BreadcrumbList, and one Review block (ratingValue numeric).
	•	Supply copy-paste templates in /standards/00-core/JSONLD_TEMPLATES/.

⸻

01-Index-Hub

01.1 INDEX-HUB_STANDARDS.md
	•	Unifies hub/index rules for: /index.html, /ships/index.html, /restaurants.html, ports, etc.
	•	Search input normalizes against venues.json and fleet index.
	•	3-up grid with proper breakpoints; keyboard-navigable filters (chips).

01.2 SHIPS-INDEX_STANDARDS.md
	•	Fallback JSON sources, image gating and discovery order, hide entries without discoverable media.

01.3 scripts/fleet-cards.js
	•	Reference implementation for ship card rendering, caching, and fallback behavior.

⸻

02-Ship-Page

02.1 SHIP-PAGE_STANDARDS.md (v3.001+)
	•	Section order: Hero → First Look → Stats → Dining → Logbook → Videos → Deck Plans → Live Tracker → Related → Attribution.
	•	JSON via SiteCache.getJSON() with TTL + version invalidation.
	•	Image discovery: /assets/ships/thumbs/ → /assets/ships/ → /assets/ → /images/. Randomized thumbnail selection; hide empty entries.

02.2 SWIPER_STANDARDS.md
	•	Self-hosted assets under /vendor/swiper/ with jsDelivr fallback; a11y enabled; html.swiper-fallback CSS pathway if library fails.
	•	Carousels with aria-roledescription="carousel" and labelled headings.

02.3 VIDEO-SOURCES_STANDARDS.md
	•	Normalize YouTube IDs from youtube_id|url|embed_url; dedupe by ID; nocookie embeds; lazy iframes.

02.4 DINING-CARD_STANDARDS.md
	•	Truth-data fetch from venues.json, support aliases, and deep-link variants with stable anchors.

⸻

03-Data

03.1 GOLDEN-MERGE_SPEC.md
	•	Newer wins; additive; explicit supersession; never destructive.
	•	JSON contracts version-tagged and checksum-audited.

03.2 DATA-SCHEMAS.md
	•	Defines fleet_index.json, venues.json, personas.json, rc_ship_videos.json field maps.
	•	JSON Schema fragments provided in §18.

⸻

04-Automation

04.1 CADENCE_STANDARDS.md
	•	Daily CI check (DOM fingerprint, SEO/A11y audit, JSON contracts).
	•	Weekly manual re-audit.
	•	Monthly license/attribution verification.
	•	PWA manifest and SW cache key bump verification.

⸻

05-Brand

05.1 TONE-AND-ETHOS.md
	•	Reverent, truthful, unhurried; comfort, convict, recalibrate. Avoid sensationalism. Tie to Logbook Personas tone.

05.2 INVOCATION-BANNER.md
	•	Visible footer invocation text required on every page. Place above closing wrapper; keep tiny, centered.
	•	Must match the wording noted in 00.4 (visible vs hidden usage).

⸻

06-Legal Attribution

06.1 ATTRIBUTION_STANDARDS.md
	•	Proper credits, outbound links, license markers, and alt-text guidance.
	•	“Lineups can change by sailing …” disclaimers where applicable.
	•	Prefer ranges for prices with “last verified” date unless auto-updated.

⸻

07-Analytics

07.1 ANALYTICS_STANDARDS.md
	•	Google tag async minimal init; Umami defer; consent tooling optional and non-blocking.
	•	No cookies beyond analytics defaults; never collect PII in URLs.

⸻

08-Root / Main (consolidated from v3.002)
	•	_abs() absolute URL helper and Apex→www canonicalization (session-guarded).
	•	Umami placed immediately after viewport.
	•	Swiper loader with CDN fallback.
	•	Referrer no-referrer.
	•	Append ?v= to all assets.
	•	OG/Twitter parity with visible content.
	•	LCP image fetchpriority="high"; supply width/height to prevent CLS.

⸻

09-Restaurants Hub (v2.256.022)
	•	/restaurants.html search + filter trays; tips card persisted in localStorage.
	•	Uses venues.json → search_dict.keywords.
	•	Keyboard navigable, visible focus states; lazy-load thumbnails.

⸻

10-Venue Standards (v2.257)
	•	Canonical page /restaurants/<slug>.html; reciprocal links with ship pages.
	•	Sections: Overview · Menu & Prices · Accommodations · Availability · Persona Review · Sources.
	•	Allergen micro-component (role="note").
	•	Price bands: Lunch $21–25; Dinner $39–65 (+18%) with disclaimer.
	•	QA checklist and Lighthouse ≥ 90.

⸻

11-Logbook Personas (v2.257)
	•	Ten archetypes with disclosure rules; JSON contract /assets/data/personas.json.
	•	Each logbook entry must include ≥1 persona label.
	•	Each Logbook entry is subject to the pastoral guard rails in Appendix C.
	•	**All logbook entries must follow LOGBOOK_ENTRY_STANDARDS_v2.300** (`/admin/claude/LOGBOOK_ENTRY_STANDARDS_v2.300.md`):
		- Story-first approach (not brochure/feature lists)
		- Positive emphasis with negatives redeemed into blessings
		- One emotional pivot moment (tear-jerker, mostly happy)
		- Grounded in real review signals
		- No invented guides/calculators/resources
		- No sales pitch language
		- 600–1,200 words target length

⸻

12-PWA Layer (v3.001→v3.002)
	•	site-cache.js (TTL + version invalidation, same-origin).
	•	sw.js image cache itw-img-v4.
	•	starter.html demonstrates cache pre-warm (fleet, venues, personas, videos) and SW registration.

⸻

13-Security & Privacy
	•	Enforce rel="noopener noreferrer" on external anchors (auto-upgrade script).
	•	Third-party scripts async/defer.
	•	Never embed PII in URLs or JSON-LD.

⸻

14-Ship Enhancements (v3.007.010)

14.1 Absolute URL Normalizer (staging/CDN safety)
	•	Convert hard-coded production URLs to current origin on DOMContentLoaded; expose _abs(path) globally.

14.2 Structured Data (JSON-LD lineup)
	•	Required: Organization, WebSite+SearchAction, WebPage, BreadcrumbList, one Review (numeric ratingValue).
	•	Recommended OG image: 1200×630; must resolve 200.

14.3 Data Blocks & JSON Fallbacks
	•	Ship Stats Fallback inline <script type="application/json"> + renderer.
	•	Videos Data inline list or videos:{...} object; nocookie embeds; dedupe IDs.
	•	Logbook Personas remote JSON at _abs('/ships/<line>/assets/<slug>.json') with minimal markdown renderer.

14.4 Entertainment / Venues / Bars
	•	Static HTML seed + JSON augmentation; cards carry data-tags for filtering.
	•	Filter UI: .chips.pill-nav.pills with aria-pressed toggles; searchable via #vx-search.
	•	Always show tiny disclaimer: lineup changes by sailing.

14.5 Live Tracker (Hybrid VesselFinder)
	•	Prefer AISMap; fallback to iframe details page; refresh iframe every 60s with cache-busting t= param.

⸻

15-Accessibility Details
	•	Carousels: aria-roledescription="carousel", labelled headings; Swiper a11y ON.
	•	Live regions: logbook body aria-live="polite".
	•	Hero as <img alt=""> or container with role="img" aria-label="".
	•	Chips/filters maintain aria-pressed and .is-on.
	•	Skip link focusable and visible on focus.

⸻

16-Performance Requirements
	•	LCP image fetchpriority="high"; fixed aspect ratios for carousels; lazy-load non-critical images & iframes.
	•	Version all local assets ?v=3.007.010.
	•	Avoid layout thrash; prevent CLS > 0.1.

⸻

17-QA Checklists

17.1 SEO/A11y
	•	One H1 (visible or hidden, but accessible).
	•	Canonical points to production; OG/Twitter present; OG image 200+ and sized.
	•	BreadcrumbList JSON-LD and a single Review JSON-LD (numeric rating).
	•	Skip link moves focus to #content.
	•	Chips/buttons use aria-pressed when toggled.

17.2 JS/CSS
	•	Swiper loads or html.swiper-fallback engages (no console red).
	•	Videos carousel renders or shows fallback text.
	•	Live tracker hybrid fallback working.
	•	Entertainment JSON augments grid without duplicates.
	•	External link upgrader runs; mailto: / tel: unaffected.
	•	No mixed content on staging/CDN (URL normalizer works).

17.3 Perf
	•	Lighthouse CLS ≤ 0.10; LCP within target on cable-3G internal bar.
	•	Third-party scripts async/defer; no render-blocking CSS beyond critical.

17.4 Content/Witness
	•	Pastoral Witness Guardrail (Appendix C) respected:
	•	No first-person alcohol consumption by Ken (text or imagery).
	•	No glamorizing drunkenness or gluttony.
	•	Alcohol described neutrally; desserts with alcohol clearly labeled and not tied to first-person overindulgence.

⸻

18-JSON Schema Fragments (for CI)

Provide the schema snippets for: Ship Stats, Videos, Logbook Personas, Entertainment — as given in v3.007.010 (unchanged).

⸻

19-Reusable Snippets

19.1 Hero (accessible variant)
	•	Use role="img" and hide decorative assets with aria-hidden="true". Include compass, grid overlay, and versioned assets.

19.2 Voyage Tips Card
	•	.card.voyage-tips block injected around 60% into logbook body with links to drink packages and packing lists.

⸻

20-Editor, Dev, QA Workflow Notes
	•	Editors: hero/gallery source ≥ 1920px; target < 350 KB when possible.
	•	Devs: when cloning a page, update canonical URL, title/description, hero paths, data-imo, stats fallback JSON, videos JSON, OG fields, and asset versions.
	•	QA: use §17 checklist + Rich Results Test for JSON-LD.

⸻

Appendix A — Examples (v2.4 historical)
	•	/examples/ships/rcl/template.html
	•	/examples/cruise-lines/template.html

Appendix B — Change Ledger (Δ v3.003 → v3.007.010)

Appendix C - Pastoral Witness Guardrail

(Applies to all articles, logs, personas, captions, and marketing blurbs.)
	1.	No First-Person Alcohol Consumption by “Ken”

Rule:
The site must never depict you (by name, by clear persona, by first-person narration on any page attributed to you, or by obvious implication including pages where Ken is listed as author and no persona is named) as:
	•	Drinking alcohol (beer, wine, cocktails, shots, etc.).
	•	“Sampling” or “tasting” alcoholic drinks.
	•	Ordering alcoholic packages, buckets, or bar flights.
	•	Getting tipsy, buzzed, or drunk.
	•	Overindulging in obviously alcoholic desserts.

If authorship is ambiguous or mixed, assume first-person “I” is Ken by default unless explicitly labeled otherwise. In that case, Appendix C applies.

Practically, that means:
	•	No lines like:
	•	“I enjoyed a bucket of beer by myself on the balcony.”
	•	“I spent the afternoon consuming endless free samples of rum cake.”
	•	Replace with:
	•	“Many guests enjoy buckets of beer out on the pool deck; if you don’t drink, you’ll find plenty of mocktails and non-alcoholic options.”
	•	“On some ships, there are rum-cake stands and dessert stations that can be very tempting—if you avoid alcohol, ask about ingredients or choose one of the many alcohol-free desserts instead.”

No photos, illustrations, or graphics may depict Ken holding, drinking, or toasting with alcoholic beverages, or seated at a table where alcohol is the clear focal point.

Standard:
If a reasonable reader could point to a sentence and say, “That pastor had a beer, so I can have X,” that sentence fails the guardrail and must be rewritten.

⸻
	2.	Neutral, Descriptive Treatment of Alcohol

We still have to acknowledge reality: cruises serve alcohol; bars and drink packages exist. But we do it in a neutral, factual, and pastoral way.

Allowed (and encouraged) pattern:
	•	Describe what’s available, not what you consume.
	•	Example wording:
	•	“Royal Caribbean offers several drink options: soda, mocktail, refreshment, and alcoholic ‘Deluxe’ packages. If you choose to abstain from alcohol, the Refreshment and complimentary options still give you plenty of variety.”
	•	“Most pool bars serve both cocktails and zero-proof mocktails; it’s normal to ask for non-alcoholic versions.”

Avoid:
	•	Romanticizing alcohol:
	•	“Signature cocktails you have to try.”
	•	“Iconic bar crawls you don’t want to miss.”
	•	Jokes that make light of drunkenness or loss of self-control:
	•	“If you remember sailaway, you didn’t do it right.”

⸻

2b. Special Note — Calculators & Planning Tools

Any page that discusses drink packages, bar menus, alcohol pricing, or similar planning tools (including calculators) must:
	•	Maintain strictly neutral, descriptive tone.
	•	Emphasize stewardship of money and health over “getting one’s money’s worth” by increasing consumption.
	•	Avoid suggesting or implying that higher consumption is desirable, funny, or expected.

Example guidance:
	•	Prefer: “If you already tend to order around X paid drinks per day, this package may or may not make sense financially depending on your habits and convictions.”
	•	Avoid: “The package is worth it if you can knock back 8–10 drinks a day.”

⸻
	3.	Desserts that Contain Alcohol (like Rum Cake)

Rum cakes and similar desserts are a special case.

Standards:
	•	Treat them as desserts, not “safe loopholes” for alcohol.
	•	Always note clearly if they contain alcohol:
	•	“Many Caribbean rum cakes are made with real rum; if you avoid alcohol for personal, medical, or spiritual reasons, ask whether it is baked long enough to remove most of the alcohol or choose an alcohol-free dessert instead.”
	•	No language of “endless,” “non-stop,” “stuffing myself,” or “consuming” tied to you personally – neither directly nor implied.

Not okay:
	•	“I parked myself at the rum cake stand and ate endless free samples all afternoon.”

Okay:
	•	“You’ll see rum cake samples offered at some port shops. It’s easy to overdo it—for those who abstain, stick with the vanilla or chocolate cakes and skip the rum-infused ones.”

When in doubt, assume first-person indulgence is off-limits and reframe in third-person, descriptive terms.

⸻
	4.	Gluttony / Overindulgence Language

Even apart from alcohol, we don’t want to present overindulgence by you as cute or aspirational.

Guardrail:
	•	Avoid “I stuffed myself,” “I ate until I couldn’t move,” “endless plates,” etc. when written in your voice.
	•	You can still:
	•	Note that cruises offer more food than most people need.
	•	Warn readers that it’s easy to overeat.
	•	Encourage wise, thankful enjoyment: “sample widely, eat reasonably, and remember you don’t have to try everything in one night.”

Examples:
	•	Prefer:
	•	“There is enough food on a ship to make self-control a spiritual discipline.”
	•	Over:
	•	“I made it my mission to try three entrées every night and waddle out of the dining room.”

⸻
	5.	Persona Separation (If We Ever Use Drinking Personas)

If you ever decide to have guest personas or third-party stories where alcohol shows up:
	•	They must not be you, your pastoral persona, or a stand-in for you.
	•	Their stories should:
	•	Not glamorize drunkenness.
	•	Not portray overdrinking as the “goal” of the vacation.
	•	Ideally model wisdom, moderation, or lessons learned.

If there’s any doubt a persona could be read as “Ken but with a different name,” alcohol consumption doesn’t belong in their story either.

⸻
	6.	Default Copy Rules (Concrete “Find and Replace” Style)

When writing or editing, default to these rules:
	•	Ban these patterns in your voice:
	•	“I enjoyed a bucket of beer…”
	•	“I lost track of how many rum cakes I ate…”
	•	“We drank all afternoon…”
	•	“We were pretty tipsy by dinner…”
	•	Preferred phrasing:
	•	“Many guests spend the afternoon at the pool bars; if you prefer to avoid alcohol, there are usually free water, tea, and flavored drinks nearby.”
	•	“It’s easy to overdo both food and drink on a cruise; plan ahead for how you want to honor your conscience and your health.”

⸻
	7.	The Theological / Pastoral Footing (For Your Eyes, and Maybe a Sidebar)

Under the hood, this guardrail is really about:
	•	Protecting weaker brothers and sisters from stumbling.
	•	Guarding your public witness as a pastor.
	•	Keeping the project’s posture in line with:
	•	Gratitude for good things.
	•	Clear avoidance of what Scripture calls sin (drunkenness, lack of self-control).
	•	Refusing to be the excuse someone uses: “He did it, so I can.”

You don’t have to preach that in every article, but the standard is:

This site must never give someone plausible cover to justify drunkenness or gluttony by pointing at the pastor who built it.

⸻
	8.	Suicide, Self-Harm, and Crisis Language

Rule:
The site must never include content that:
	•	Romanticizes, jokes about, or makes light of suicide or self-harm.
	•	Uses casual suicide references ("I'm dying," "I could just die," "kill me now," "I wanted to jump overboard").
	•	Describes methods of self-harm, even in jest.
	•	Uses language that could be triggering to those struggling with mental health crises.

Guardrail:
	•	No phrases like:
	•	"The line was so long I wanted to die."
	•	"I could have thrown myself overboard waiting for that tender."
	•	"The prices will kill you."
	•	Replace with neutral alternatives:
	•	"The line was painfully long."
	•	"The wait for the tender felt endless."
	•	"The prices are steep."

Standard:
If a reasonable reader who is struggling with suicidal thoughts could be triggered or find their pain minimized by casual language, that language fails the guardrail and must be rewritten.

Theological Footing:
Every person is made in the image of God (Genesis 1:27). Life is sacred. Language that treats death casually—even in jest—dishonors the gift of life and may wound those who are silently struggling. As a pastoral site, we choose words that honor the dignity of every reader.

Crisis Resources:
If any content addresses mental health struggles directly, it should include appropriate resources:
	•	National Suicide Prevention Lifeline: 988 (US)
	•	Crisis Text Line: Text HOME to 741741

### Cross-Reference: LOGBOOK_ENTRY_STANDARDS_v2.300

When writing or auditing logbook entries, **always** consult `/admin/claude/LOGBOOK_ENTRY_STANDARDS_v2.300.md` in addition to this appendix. That document defines:
- Story-first narrative structure (not brochures/feature lists)
- Emotional arc requirements (tension → pivot → reflection)
- Voice and tone guidelines
- Handling positives and negatives
- Spiritual content guidelines
- Model checklist for pre-publish verification

⸻
## Appendix D — Persona Uniqueness & Story Separation

(This applies to all logbook entries, persona JSON, articles that use personas, captions, and marketing blurbs.)

1. Persona Names Must Be Unique

- Each persona name in `/assets/data/personas.json` must be globally unique.  
- Do not reuse a persona name for:
  - A different archetype, or
  - A different “voice” with a new backstory.
- Do not use a real person’s full name as a persona name (first name only is allowed if not uniquely identifying someone in your life or church).

If a persona needs to be significantly changed (tone, backstory, or theology), retire the old persona and create a new one with a different name and version note.

⸻

2. No Story Duplication Across Personas

- A single real-world sailing, day, or event must not be told as if it happened to multiple personas.  
- You may have multiple **angles** on one sailing (e.g., Ken plus Harper, or Ken plus “Solo Introvert”) **only if**:
  - It is clearly disclosed in the copy that this is the *same sailing* seen from different perspectives, and
  - Ken’s portions still obey Appendix C (Pastoral Witness Guardrail).

Not allowed:
- Copying one logbook entry, changing the persona name, and publishing as if it were a separate traveler.  
- Moving a story from “Ken” into a persona with minimal edits in order to bypass Appendix C.

Allowed:
- One persona describing a sailing they took, while Ken’s ship page summarizes that sailing more factually, as long as this is disclosed and consistent.

⸻

3. No Persona as a Stand-In for Ken

- Personas must not be used as a “mask” for Ken’s own actions, convictions, or behaviors.
- If the underlying story is **Ken’s real experience**, it must either:
  - Be told honestly as Ken (and therefore obey Appendix C), or
  - Be omitted from first-person narrative entirely.

You may not:
- Take a story that would violate Appendix C (e.g., “I had a bucket of beer on the balcony”) and assign it to a persona instead to soften the optics.
- Make a persona whose backstory or life situation obviously *is* Ken with the serial numbers filed off (same church role, same family configuration, same biographical details).

If a reasonable reader could say, “That’s obviously just Ken under a different name,” then the persona is too close and must be revised.

⸻

4. Persona JSON Integrity

In `/assets/data/personas.json`:

- Each persona entry must include:
  - `name` (unique),
  - `archetype` (e.g., “Solo Introvert,” “Mobility Scooter User,” “Budget Family”),
  - A short, stable backstory summary,
  - Disclosure flags (e.g., “fictional composite,” “guest soundings,” “Ken-adjacent but not Ken”).
- Once a persona is live, only additive changes are allowed without a version bump:
  - Clarifying language,
  - Extra examples,
  - Accessibility notes.

If you materially change:
- Their theology,
- Their family status (married vs widowed),
- Their disability/health profile,
- Or their relationship to cruising (first-timer vs veteran),

…you must treat that as a new persona with a **new name** and a note in the change ledger.

⸻

5. Linking Real Guests vs Personas

- Real guests or friends who contribute stories should be clearly identified as real (with their permission) and must not share a name with any persona.  
- Personas are always tagged or labeled as such (in JSON and, where appropriate, in copy), so readers are not misled.

You may:
- Blend multiple guest experiences into a **fictional composite persona**, but you must not:
  - Attribute specific quotes or precise stories from a real person to a persona name without disclosure,
  - Present a persona as a real, single historical individual.

⸻

6. Interaction With Appendix C (Pastoral Witness Guardrail)

The following are explicitly forbidden:

- Reassigning any story that would violate Appendix C for Ken (alcohol, gluttony, etc.) to a persona in order to publish it.  
- Duplicating Ken’s story under a persona name with “softened” or “spiced up” details that change how it lands on witness.

If the lived experience is Ken’s, Appendix C governs *even if* you try to tell it through a persona. You may still use personas to:
- Show how **others** might think or feel on a similar sailing,  
- Model wise or unwise choices, with clear pastoral commentary.

But you may not use personas to **sanitize**, disguise, or amplify Ken’s actions.

⸻

7. QA Checklist Hook

When reviewing any page or JSON that uses personas, verify:

- [ ] Persona names are unique and not reused for different archetypes.  
- [ ] No single sailing/event is being represented as if it happened to multiple distinct personas without disclosure.  
- [ ] No persona is functioning as a stand-in for Ken’s own story.  
- [ ] Real guest names and persona names do not collide.  
- [ ] Any persona story that clearly mirrors Ken’s life still respects Appendix C.

If any of these fail, the page or JSON must be corrected before publishing.

Area	Change
Versioning	Bumped baseline to v3.007.010 (Grandeur template).
Head/Foot	Added canonical HEAD and FOOTER includes; expanded preconnect/preload guidance.
JSON-LD	Added complete structured data lineup + templates and rules.
URL Safety	Introduced absolute URL normalizer for staging/CDN.
Security	External link hardening enforced globally.
Entertainment	New venues/bars/entertainment spec with filter UI contract and JSON augmentation.
Live Tracker	Hybrid VesselFinder logic (AISMap with resilient iframe fallback).
Schemas	Added JSON Schema fragments for Ship Stats, Videos, Personas, Entertainment.
QA	Expanded checklists for SEO/A11y/JS/Perf and added Content/Witness guardrail checks.


⸻

End of Superset v3.007.010

