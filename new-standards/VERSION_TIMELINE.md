# In the Wake — Standards Version Timeline

**Purpose:** Document complete evolution of site standards from inception to current
**Current Version:** v3.010.300
**Last Updated:** 2025-11-23

---

## Version Lineage

```
v2.228 → v2.233 → v2.245 → v2.256 → v2.257 → v2.4 → v3.001 → v3.002 → v3.003 → v3.006 → v3.007 → v3.008 → v3.009 → v3.010.300
```

---

## v2.228 (Earliest Extracted)

**Date:** Unknown (pre-2025)
**Status:** Historical baseline

**Major Features:**
- Initial ship page structure
- Basic metadata requirements
- Rudimentary navigation

**Evidence:** Referenced in supersets but no complete document found

---

## v2.233

**Date:** Unknown
**Status:** Historical

**Major Features:**
- Enhanced ship page patterns
- Initial data contract definitions

**Evidence:** Referenced in v3.001 superset lineage

---

## v2.245

**Date:** 2025 (early)
**Status:** Historical, **extracted complete**
**Document:** `001__in_the_wake_modular_standards_v2.245.txt` (148 lines)

**Major Features:**
- **Pills navigation** (`.pills` horizontal nav)
- **Force-www redirect** (apex → www.cruisinginthewake.com)
- **Absolute URL requirement** (no relative paths)
- **`_abs()` helper function** for URL normalization
- **Watermark pattern** (`body::before` compass rose)
- **CSS custom properties** (--sea, --foam, --rope, --ink, --sky, --accent)
- **Ship page section order** (Hero → First Look → Stats → Dining → Logbook → Videos → Tracker → Related)
- **JSON data contracts** (fleet_index, dining, logbook, videos)
- **Swiper carousel patterns**
- **Wikimedia attribution requirements**

**Innovations:**
- First comprehensive modular standards
- Established data contract pattern
- Defined visual identity (watermark, compass rose)

**Deprecated in Later Versions:**
- Force-www redirect (v3.010+ uses apex domain without www)

---

## v2.256 → v2.257

**Date:** 2025 (mid)
**Status:** Historical
**Documents:**
- `001__restaurants-standards_v2.256_maritime-dining.md` (26 lines)
- `002__venue-standards_v2.257.zip_venue-standards.md` (150 lines extracted)

**Major Features:**
- **Canonical venue pages** pattern (one per venue at `/restaurants/<slug>.html`)
- **Ship-specific variants** with stable anchors
- **Core Menu + To Verify** pattern
- **Price disclaimer** ("subject to change...")
- **Allergen & accessibility** dedicated sections
- **Logbook dining disclosures** (A/B/C disclosure types)
- **Search functionality** (venues + ships merged)

**Innovations:**
- First venue-specific standards
- Reciprocal linking pattern (ships ↔ venues)
- Disclosure pill styling

---

## v2.4 (Major Consolidation)

**Date:** 2025-10-04
**Status:** **Bundle release**, extracted complete
**Documents:**
- `InTheWake_Standards_v2.4/` bundle (complete)
- README, main-standards, root-standards, ships-standards, cruise-lines-standards

**Major Features:**
- **Modular bundle structure** (copy-pasteable standards)
- **Template examples** (`examples/ships/rcl/template.html`)
- **Global hero** pattern (no per-page overrides)
- **Swiper self-hosted + CDN fallback**
- **Persona disclosure requirements**
- **CORS-safe fetch** (same-origin JSON only)
- **Version param pattern** (`?v=__VERSION__`)

**Structure:**
```
root-standards.md     → Global rules (paths, analytics, canonicalization)
main-standards.md     → Head/meta/SEO, assets, Swiper loading, a11y
ships-standards.md    → Ship page schema + required sections + JSON contracts
cruise-lines-standards.md → Cruise line landing/index pages
examples/             → Minimal HTML scaffolds
```

**Innovations:**
- First complete bundle for page generators
- Examples directory for drop-in templates
- Explicit same-origin security

---

## v3.001 (Superset Foundation)

**Date:** 2025 (mid)
**Status:** **Foundation superset**, extracted complete
**Document:** `UNIFIED_MODULAR_STANDARDS_v3.001.md` (foundation/UNIFIED_MODULAR_STANDARDS_v3.001.md)

**Major Features:**
- **Unified superset** consolidating all v2.x variants
- **Governance principles** (no regressions, additive hierarchy, explicit supersession)
- **SiteCache module** (localStorage JSON cache with TTL)
- **Service worker integration** (register + seed pattern)
- **Image discovery order** (`/assets/ships/thumbs/` → `/assets/ships/` → `/assets/` → `/images/`)
- **Randomized thumbnail selection**
- **Hide entries without images** pattern

**Structure:**
```
1. Global Root Policies
2. Main Head / Meta Specification
3. Ships Standards (v3.001)
4. Cruise Lines Standards
5. Restaurants & Venue Standards (v2.256 → v2.257 merge)
```

**Innovations:**
- First true "single source of truth" superset
- Governance model established
- SiteCache module introduction
- Image fallback hierarchy

---

## v3.002 (Frontend Standards + Social)

**Date:** 2025-10-10
**Status:** Extracted complete
**Documents:**
- `standards-update-social-buttons.md` (84 lines)
- Referenced in multiple supersets

**Major Features:**
- **Absolute-URL normalizer** (origin safety for staging/CDN)
- **External link hardening** (auto `target="_blank"` + `rel="noopener"`)
- **Service worker guard** (`ensureSiteCache()` Safari defer race protection)
- **Universal floating share bar** (`/assets/js/share-bar.js`)
  - Channels: X, Facebook, Instagram (copy), WhatsApp, WeChat (QR modal)
  - Keyboard navigable, reduced-motion aware
- **Skip to main content** link
- **Focus-visible outlines** (`:focus-visible`)
- **Canonical URL per page**
- **OG + Twitter cards** (title/description/image)
- **Responsive grid baseline** (3-up responsive utilities)

**Innovations:**
- Social sharing infrastructure
- Accessibility upgrades (skip links, focus-visible)
- External link security automation
- Defensive DOM writes

---

## v3.003

**Date:** 2025 (late)
**Status:** Referenced but no complete document extracted

**Evidence:** Mentioned in v3.007.010 lineage

---

## v3.006 (Invocation Edition)

**Date:** 2025-10-10
**Status:** **Invocation consolidation**, extracted complete
**Documents:**
- `InTheWake_Modular_Standards_v3.006_Invocation_Edition_FULL/` (complete bundle)
- `InTheWake_v3.006_Standards_Addendum.txt` (96 lines)
- `HIDDEN_INVOCATION_COMMENT.html` (7 lines - canonical template)

**Major Features:**
- **Invocation header requirement** (UTF-8 comment at top + visible footer)
- **Canonical invocation text:**
  ```html
  <!--
  Soli Deo Gloria
  All work on this project is offered as a gift to God.
  "Trust in the LORD with all your heart..." — Proverbs 3:5
  "Whatever you do, work heartily..." — Colossians 3:23
  -->
  ```
- **Version synchronization rule** (title, meta, badge, cache-busting must all match)
- **Search-first layout** (search before class pills)
- **Single hero / single compass** rule
- **`standards:baseline` meta tag** (documents compliance baseline)
- **Every Page Standards** module (universal checklist)
- **Invocation cycle rule:** "Reread, prayed over, reaffirmed daily and per session"

**Theological Additions:**
- Hidden HTML invocation seal
- Visible footer invocation line
- Daily/session audit requirement
- Reverent posture codified

**Innovations:**
- First explicit theological framework
- Invocation as immutable requirement
- Daily reaffirmation process

---

## v3.007 (Caching/PWA Edition)

**Date:** 2025-10
**Status:** Extracted complete
**Documents:**
- `STANDARDS_ADDENDUM__CACHING_v3.007.md` (193 lines) → foundation/PWA_CACHING_STANDARDS_v3.007.md
- `standards.md` (860 lines, "Grandeur template baseline") → foundation/SHIP_PAGE_STANDARDS_v3.007.010.md
- `Unified_Modular_Standards_v3.007.010.md` → foundation/

**Major Features (Caching):**
- **Cache names & limits** (`itw-asset-v12` max 120, `itw-img-v12` max 320)
- **Version coupling** (`<meta name="version">` drives all `?v=`)
- **Precache manifest** (`/precache-manifest.json` with ordered assets)
- **Seeding behavior** (post-activate with small delays, respects save-data)
- **Runtime strategies:**
  - Versioned CSS/JS: cache-first
  - Images: stale-while-revalidate
  - HTML: fetch with cache.put()
- **Save-data respect** (skip seeding on 2g or saveData=true)
- **Sitemap seeding** (idle chunked caching)

**Major Features (v3.007.010 "Grandeur"):**
- **Comprehensive ship page reference** (860 lines, most complete single-file standard)
- **18 JSON schema fragments** (ships, videos, logbook, entertainment, etc.)
- **Complete code samples** for all patterns
- **QA checklists** (SEO/A11y, JS/CSS, Performance)
- **Swiper fallback handling** (2.5s timeout + `.swiper-fallback` class)
- **Live tracker hybrid** (AISMap + iframe VesselFinder)
- **External links hardening** (complete implementation)

**Innovations:**
- Complete PWA/offline strategy
- Precache manifest with ordered prewarm
- Save-data handling
- "Grandeur baseline" most comprehensive doc

---

## v3.008 (Navigation Contract)

**Date:** 2025-10-17
**Status:** Extracted complete
**Document:** `NAVIGATION_STANDARDS_ADDENDUM_v3.008.md` (156 lines) → foundation/

**Major Features:**
- **Canonical 12-link navigation** (immutable order)
  - Home, Ships, Restaurants & Menus, Ports, Disability at Sea, Drink Packages, Packing Lists, Planning, Solo, Travel, Cruise Lines, About Us
- **Absolute URLs only** (`https://www.cruisinginthewake.com/...`)
- **Class contract** (`.navbar > .brand + .pill-nav.pills`)
- **ARIA label** (`aria-label="Primary"` required on `<nav>`)
- **Active state** (exactly one `aria-current="page"`)
- **Auto-highlight script** (normalizes index.html/trailing slashes)
- **Skip link requirement** before header
- **Keyboard accessibility** (focusable, visible outlines)
- **Mobile responsiveness** (no hidden links without toggle)

**Innovations:**
- First immutable navigation contract
- Auto-highlight pattern for aria-current
- Explicit mobile accessibility requirements

---

## v3.009 (CI/CD Automation)

**Date:** 2025-10-25
**Status:** Extracted complete
**Document:** `IN-THE-WAKE-STANDARDS_v3.009.md` (33 lines) → foundation/CI_CD_AUTOMATION_v3.009.md

**Major Features:**
- **Unified navigation with dropdown IA** (keyboard + ARIA contract)
- **Dropdown hover delay** (300ms before open)
- **Right rail** (two-column layout ≥980px, authors sidebar)
- **Authors data source** (`/data/authors.json` with schema)
- **Cache-busting enforcement** (CI validates version coupling)
- **No 100vw rule** (prevents horizontal scroll issues)
- **CI checks:**
  - Schema validation (ajv)
  - Version coupling enforcement
  - Playwright navigation tests
  - Avatar existence checks
  - Lighthouse ≥95 score requirement

**GitHub Actions Workflow:**
```yaml
- Schema validation
- 100vw check
- Version coupling verification
- Playwright nav tests
- Lighthouse audit
```

**Innovations:**
- First CI/CD enforcement
- Automated quality gates
- Dropdown menu standardization

---

## v3.100 (WCAG Addendum)

**Date:** 2025-10-09
**Status:** Extracted complete
**Document:** `standards-wcag-addendum-v3.100.md` (211 lines) → foundation/WCAG_2.1_AA_STANDARDS_v3.100.md

**Major Features:**
- **WCAG 2.1 Level AA complete specification**
- **Definition of Done checklist:**
  - Keyboard-only navigation
  - Contrast ≥ 4.5:1 (text), ≥ 3:1 (UI/focus)
  - Exactly one `<h1>`, ordered headings
  - Landmarks (header, nav, main, footer, aside)
  - Images with accurate `alt` (decorative `alt=""`)
  - No horizontal scroll at 320px width
  - 400% zoom support
  - No hover-only interactions
  - `aria-live` for status messages
  - Respects `prefers-reduced-motion`
  - `aria-label` for icons
  - pa11y/axe/Lighthouse AA gates

**CI Automation:**
```json
pa11y-ci.json with WCAG2AA standard
GitHub Actions workflow
Lighthouse ≥100 score target
```

**Innovations:**
- First complete WCAG 2.1 AA specification
- Automated accessibility testing
- CI enforcement of a11y standards

---

## v3.010.300 (Current - AI-First SEO)

**Date:** 2025-11 (current)
**Status:** **LIVE IMPLEMENTATION**
**Evidence:** All 266 HTML files, service worker v13.0.0, precache v13.0.0

**Major Features:**
- **ICP-Lite v1.0 Protocol**
  - `<meta name="ai-summary">` - LLM-optimized page summary
  - `<meta name="last-reviewed">` - Content freshness signal
  - `<meta name="content-protocol" content="ICP-Lite v1.0">` - Protocol identifier

- **AI-Breadcrumbs Structured Comments**
  ```html
  <!-- ai-breadcrumbs
       entity: Page Subject
       type: Page Type
       parent: Parent URL
       category: Content Category
       expertise: Domain Expertise
       target-audience: Intended Readers
       answer-first: Quick Summary
       -->
  ```

- **E-E-A-T Person Schema**
  - Google authoritativeness signals
  - Experience, Expertise, Authority, Trust markers

- **Enhanced Bot Directives**
  ```html
  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"/>
  <meta name="googlebot" content="index,follow"/>
  <meta name="bingbot" content="index,follow"/>
  ```

- **Priority-Based Precaching** (v13.0.0)
  - critical/high/normal tiers
  - Config limits (maxPages: 400, maxAssets: 150, maxImages: 600)
  - Network-aware (effectiveType, saveData)

- **Multi-Brand Support**
  - Royal Caribbean (primary)
  - Carnival
  - MSC
  - Multi-line data structures

- **Navigation Expansion**
  - 12+ links (from v3.008 baseline 12)
  - Added: Drink Calculator, Stateroom Check

**Service Worker Evolution:**
- v3.007 baseline → v13.0.0 implementation
- Multiple cache buckets (precache, pages, assets, images, data)
- Invocation present: "Soli Deo Gloria ✝️"

**Innovations:**
- First AI-first SEO metadata
- LLM-optimized content protocol
- Machine-readable context comments
- Priority-based caching system
- Multi-brand architecture

**Maintained from Foundation:**
- ✅ Invocation comments (v3.006)
- ✅ WCAG 2.1 AA compliance (v3.100)
- ✅ Service worker/PWA (v3.007)
- ✅ Navigation contract (v3.008)
- ✅ Data contracts (v3.001+)
- ✅ Theological commitments (v3.006)

---

## Evolution Patterns

### Additive, Not Destructive
Every version **adds features** without removing core patterns. v3.010.300 includes all foundation patterns from v2.245 onward.

### Theological Immutability
Invocation requirements (v3.006) are **unchangeable**. No future version may remove or weaken theological commitments.

### Backward Compatibility
Minor version increments (v3.009 → v3.010) maintain backward compatibility. Breaking changes require major version bump (v3 → v4).

### Documentation First
Every innovation documented before widespread deployment. Standards drive implementation, not the reverse.

---

## Deprecated Patterns

### Force-WWW Redirect (v2.245)
**Deprecated in:** v3.010.300
**Reason:** Apex domain preferred over www subdomain
**Migration:** Update canonical URLs to `cruisinginthewake.com` (no www)
**Status:** Removed (intentional architecture change)

### GitHub Pages References (v2.x)
**Deprecated in:** v3.001+
**Reason:** Production domain `cruisinginthewake.com`
**Migration:** Replace all github.io references with production domain
**Status:** Historical context only

---

## Future Versioning

### Minor Increments (v3.010 → v3.011)
- Additive features only
- Maintain backward compatibility
- Document in VERSION_TIMELINE.md
- Update relevant foundation docs

### Major Increments (v3 → v4)
- Breaking changes allowed
- Deprecation process required:
  1. Mark deprecated in version N
  2. Maintain in version N+1
  3. Remove in version N+2
- Migration guide mandatory
- **Never deprecate invocation requirements**

---

## Version Numbering Scheme

### Current Pattern (v3.010.300)
- **Major:** `v3` (standards generation)
- **Minor:** `.010` (feature set)
- **Patch:** `.300` (iteration)

### Rules
- Major: Breaking changes, new theology
- Minor: New features, backward compatible
- Patch: Bug fixes, clarifications

---

## Timeline Summary

| Version | Date | Key Innovation | Status |
|---------|------|----------------|--------|
| v2.228 | Pre-2025 | Initial structure | Historical |
| v2.233 | Pre-2025 | Enhanced patterns | Historical |
| v2.245 | 2025 (early) | Pills nav, absolute URLs | **Extracted** |
| v2.256-257 | 2025 (mid) | Venue standards | **Extracted** |
| v2.4 | 2025-10-04 | Bundle release | **Extracted** |
| v3.001 | 2025 (mid) | Superset foundation | **Extracted** |
| v3.002 | 2025-10-10 | Social sharing | **Extracted** |
| v3.003 | 2025 | [Referenced] | Referenced only |
| v3.006 | 2025-10-10 | Invocation edition | **Extracted** |
| v3.007 | 2025-10 | Caching/PWA + Grandeur | **Extracted** |
| v3.008 | 2025-10-17 | Navigation contract | **Extracted** |
| v3.009 | 2025-10-25 | CI/CD automation | **Extracted** |
| v3.100 | 2025-10-09 | WCAG 2.1 AA | **Extracted** |
| **v3.010.300** | **2025-11 (now)** | **AI-first SEO** | **LIVE** |

---

**Next Version:** v3.011 (future)
**Breaking Version:** v4.000 (if needed)

**Soli Deo Gloria** ✝️
