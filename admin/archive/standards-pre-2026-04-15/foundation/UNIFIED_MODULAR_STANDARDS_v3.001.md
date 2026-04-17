In the Wake — Unified Modular Standards (Superset v3.001)
Version lineage: v2.233 → v2.245 → v2.256(.003/.022) → v2.4 → v2.257 → v3.001
Merge policy: Newer wins. All prior modules are retained in appendices for reference.
Maintainer: In the Wake Project
Canonical Host: https://cruisinginthewake.com/

This superset consolidates and harmonizes all current standards and templates across the In the Wake project.
It is the single source of truth for structure, assets, JSON contracts, accessibility, caching, and CI compliance.

0. Overview & Governance
Purpose: Prevent drift between modules and enforce deterministic builds across all site directories.

Applies to: All HTML pages, JSON feeds, CSS/JS assets, and service‑worker behaviors under the project root.

Superset baseline: v3.001 — integrates caching, personas, and venue schema into unified governance.

Governance Principles

No regressions. Older modules remain valid until explicitly deprecated.

Additive hierarchy. Each new version extends prior scope without deletion.

Explicit supersession. Conflicting clauses resolved by newest version tag.

Atomic commits. Every shipped artifact must pass CI fingerprint & checksum tests.

Accessibility & SEO parity. All modules must reach ≥ AA contrast, semantic order, and OG/Twitter parity.

Versioning Convention

v3.major.minor — increment major for structure or JSON schema changes; minor for style/script changes.

1. Global Root Policies (from v3.001 root standards)
Enforce _abs() absolute path builder in <head> prior to any resource call.

Canonicalization: session‑guarded redirect from apex → www host.

Analytics: Umami snippet immediately after <meta name="viewport">.

Swiper Loader: resilient primary + CDN fallback auto‑loader.

Accessibility Baseline:

aria‑label on interactive blocks.

All non‑hero images loading="lazy".

aria‑hidden="true" on decorative assets.

Persona Disclosure: required where first‑person narrative present.

Fetch Policy: only same‑origin JSON via _abs().

Version Param: append ?v=__VERSION__ to every asset.

2. Main Head / Meta Specification (from v3.001 main standards)
Required <head> Order

<!doctype html> + <html lang="en">

<meta charset="utf‑8">

<meta name="viewport" content="width=device-width, initial-scale=1">

Umami analytics snippet

_abs() helper

Canonicalization script (GitHub Pages–safe)

<title> formatted as __PAGE_TITLE__ — In the Wake (v__VERSION__)

Canonical + description + version metas

OG/Twitter meta set

Site CSS: _abs('/assets/styles.css?v=__VERSION__')

Swiper loader block

Shared Utilities

YouTube ID Normalizer _ytId()

Markdown‑to‑HTML mini‑parser _mdToHtml()

Image fallback pattern with inline onerror chain to same‑origin alternatives.

3. Ships Standards (v3.001)
Structure

Maintain v2.4 section order (Hero → First Look → Stats → Dining → Logbook → Videos → Deck Plans → Live Tracker → Related → Attribution → Footer).

Preserve watermark, accessibility, and card IDs.

Data & Caching

All JSON fetched through SiteCache.getJSON() when available.

Sources:

/assets/data/fleet_index.json (stats)

/assets/data/venues.json (venues)

/assets/data/personas.json (logbook/personas)

/assets/videos/rc_ship_videos.json (videos manifest)

Non‑hero images loading="lazy".

Cached results validated against checksum manifest.

Image Discovery

Preferred: /assets/ships/thumbs/ (pre‑sized) → fallbacks /assets/ships/, /assets/, /images/.

Accept <slug>.jpg|jpeg|png and numbered variants 1..3.

Randomized selection per load to vary thumbnails.

Hide entries with no discoverable images.

Paths

Ship hub: /ships/index.html

Detail pages: /ships/<line>/<slug>.html

4. Cruise Lines Standards (v2.4 lineage)
Applies to /cruise‑lines/ pages.

Include marketing blurbs and cross‑links to all ships under that line.

Must inherit global SEO/a11y/absolute‑URL rules.

Class‑pill navigation and featured‑ships grid retained.

5. Restaurants & Venue Standards (v2.256 → v2.257 merge)
Canonical Venue Pages

One per venue at /restaurants/<slug>.html; reciprocal links between venue and ship pages.

Variants & one‑offs housed under Ship‑Specific Variants with stable anchors.

Menus: show verified Core Menu + labeled To Verify items.

Price disclaimer: "Prices are subject to change…"

Allergen & Accessibility

Dedicated Special Accommodations card using standardized .allergen‑micro component.

role="note" + explicit ARIA labeling.

Persona Review

One Depth Soundings review per venue with disclosure pill.

Tone: descriptive, 90–130 words, factual sourcing only.

Data Contracts

/assets/data/venues.json and /assets/data/ships.json.

Each venue slug cross‑referenced in ship → venues [].

search_dict.keywords include canonical dish nouns for fuzzy search.

Price Governance

Lunch $21–25; Dinner $39–65 (+18 %). Bands vary by class.

Optional JSON hint: {pricing:{lunch_band:'low|mid|high',…}}.

JS Boot Responsibilities (venue‑boot.js)

Normalize absolute URLs.

Load ships / venues JSON.

Render ship pills and populate availability lists.

Inject search keywords to Restaurants hub index.

QA Checklist

Ship pills render & link correctly.

Menu ranges & variants present.

Allergen + persona blocks exist.

Crosslinks verified; no console errors.

Lighthouse ≥ 90 Perf/SEO/Access.

6. Logbook Personas Standards (v2.257)
Defines 10 persona archetypes with tone, disclosure, and validation schema.

JSON: /assets/data/personas.json.

Each persona includes label, voice, summary, disclosure_required flag.

Disclosure text standardized per root §8.

Validation: every logbook JSON must include at least one persona label.

7. Modular Core Rules (v2.245 baseline)
_abs() and force‑www scripts required in <head>.

Global watermark /assets/watermark.png opacity .06 – .08.

Navigation pills: Home • Ships • Restaurants & Menus • Ports • Disability at Sea • Drink Packages • Packing Lists • Cruise Lines • Solo • Travel.

Fallback chains for dining, logbook, videos, and stats must remain intact.

Compliance summary retained for automated CI diffing.

8. Accessibility & Performance Standards
Contrast: ≥ 4.5 : 1 text, ≥ 3 : 1 large text.

Focus states: visible and keyboard‑navigable on all .pill and .chip elements.

Images: width hints + lazy‑load.

Performance: static assets ≤ 200 KB where possible; inline only page‑specific CSS.

Cache busting: ?v= query; SW update prompts users on new build.

9. CI / Compliance Tests
Validate DOM fingerprint (IDs, header order, Swiper assets, watermark).

Check _abs() presence and canonical meta.

Ensure all fetch URLs are same‑origin.

Verify at least 3 images & videos per ship page.

Confirm JSON contracts (fleet_index, venues, personas) parse without error.

Accessibility lint + SEO audit ≥ 90 %.

10. Appendices — Legacy Baseline v2.4 & Change Ledger
A. Legacy Retention

Older modules (v2.4 and below) remain valid for archival reference.
They mirror structure of Main, Root, Ships, Cruise Lines, Restaurants.

B. Change Ledger (Δ v2.4 → v3.001)

Area	Change
Global	Added session‑guarded canonical redirect; integrated Umami analytics.
Data	Introduced SiteCache JSON caching for ships/personas/venues.
Media	Added thumbnail discovery + randomization.
Venues	Merged restaurants v2.256 + venue v2.257 into unified schema.
Personas	Added persona JSON schema and tone rules.
Accessibility	Expanded ARIA coverage; enforced lazy‑loading.
CI	New compliance tests for _abs() and canonical meta.
Versioning	Moved to v3.001 baseline for all modules.

End of Superset v3.001
