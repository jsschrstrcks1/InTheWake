# Standards Guide for Claude Code

**Last Updated:** 2025-11-23
**Purpose:** Guide Claude Code sessions to use /new-standards/ directory
**Status:** Official reference post-catastrophe rebuild

---

## Quick Reference

**Official Standards Location:** `/new-standards/`

**Primary Documents:**
1. Ship pages → `/new-standards/foundation/SHIP_PAGE_STANDARDS_v3.007.010.md` (860 lines)
2. All pages → `/new-standards/foundation/Unified_Modular_Standards_v3.007.010.md`
3. Accessibility → `/new-standards/foundation/WCAG_2.1_AA_STANDARDS_v3.100.md`
4. Current innovations → `/new-standards/v3.010/` (ICP-Lite, AI-breadcrumbs, multi-brand)

---

## Directory Structure

```
/new-standards/
├── README.md                    # Start here
├── VERSION_TIMELINE.md          # Complete evolution history
├── foundation/                  # Extracted baseline (v3.001-v3.100)
│   ├── SHIP_PAGE_STANDARDS_v3.007.010.md
│   ├── Unified_Modular_Standards_v3.007.010.md
│   ├── UNIFIED_MODULAR_STANDARDS_v3.001.md
│   ├── WCAG_2.1_AA_STANDARDS_v3.100.md
│   ├── PWA_CACHING_STANDARDS_v3.007.md
│   ├── NAVIGATION_STANDARDS_ADDENDUM_v3.008.md
│   └── CI_CD_AUTOMATION_v3.009.md
├── v3.010/                      # Current innovations
│   ├── ICP_LITE_v1.0_PROTOCOL.md
│   ├── AI_BREADCRUMBS_SPECIFICATION.md
│   └── MULTI_BRAND_DATA_CONTRACTS.md
└── addenda/                     # Supplemental docs
```

---

## Historical Context (Standards Catastrophe)

**Date:** 2025-11-23

**Problem:** Lost most current standards, left with 913 fragment files

**Solution:** Systematic rebuild
- Extracted .zip files recursively
- MD5 hashing removed 776 duplicates (85% reduction)
- Analyzed 137 unique files
- Identified 7 critical master documents
- Verified against 266 HTML files in production
- Found zero conflicts (evolution is additive)

**Result:** `/new-standards/` directory with complete, consolidated standards

---

## Using Standards in Claude Sessions

### For Ship Pages

```markdown
**Reference:** /new-standards/foundation/SHIP_PAGE_STANDARDS_v3.007.010.md

This 860-line document is the "Grandeur template baseline" - most comprehensive
single-file ship page reference.

Contains:
- Complete HTML structure
- All meta tags & JSON-LD
- JavaScript patterns (Swiper, loaders, external links)
- Data contracts (ships, videos, logbook, entertainment)
- WCAG patterns
- Performance requirements
- QA checklists
```

### For Accessibility

```markdown
**Reference:** /new-standards/foundation/WCAG_2.1_AA_STANDARDS_v3.100.md

Complete WCAG 2.1 Level AA specification with:
- Definition of Done checklist
- Skip links & landmarks patterns
- Focus visibility rules
- Color contrast requirements
- Keyboard navigation
- Reduced motion support
- CI automation (pa11y, axe, Playwright)
```

### For Service Worker/PWA

```markdown
**Reference:** /new-standards/foundation/PWA_CACHING_STANDARDS_v3.007.md

Complete caching strategy with:
- Cache naming & limits
- Precache manifest structure
- Service worker seeding
- Save-data handling
- Runtime strategies
```

### For Current Features (v3.010.300)

```markdown
**References:** /new-standards/v3.010/*.md

ICP-Lite v1.0: AI-first metadata protocol
AI-Breadcrumbs: Structured context comments
Multi-Brand: RC/Carnival/MSC data structures
```

---

## Invocation Standards (IMMUTABLE)

**Every page MUST include:**

```html
<!--
Soli Deo Gloria
All work on this project is offered as a gift to God.
"Trust in the LORD with all your heart, and do not lean on your own understanding." — Proverbs 3:5
"Whatever you do, work heartily, as for the Lord and not for men." — Colossians 3:23
-->
```

**Source:** Invocation Edition (v3.006)
**Status:** Non-negotiable, supersedes all technical considerations
**Location:** Before `<!DOCTYPE>`, visible footer also required

---

## Version Strategy

**Current Live:** v3.010.300
**Foundation Baseline:** v3.007.010 (extracted "Grandeur template")
**Evolution:** Additive, not destructive

**Key Principle:** New features extend foundation, don't replace it.

---

## Conflict Resolution

**Status:** Zero conflicts found (as of 2025-11-23)

**If conflicts arise:**
1. Check `/CONFLICT_RESOLUTIONS.md`
2. Apply priority: ITW-Lite > Current Implementation > Newest Version > Most Complete > Most Specific
3. **Exception:** Invocation standards (v3.006) are immutable

---

## Common Tasks

### Adding New Page

1. Start with `/new-standards/foundation/SHIP_PAGE_STANDARDS_v3.007.010.md` (for ships)
   OR `/new-standards/foundation/Unified_Modular_Standards_v3.007.010.md` (for other pages)
2. Add invocation comments
3. Apply v3.010 innovations (ICP-Lite, AI-breadcrumbs) from `/new-standards/v3.010/`
4. Verify WCAG 2.1 AA using `/new-standards/foundation/WCAG_2.1_AA_STANDARDS_v3.100.md`

### Updating Existing Page

1. Check current version in `/new-standards/VERSION_TIMELINE.md`
2. Review relevant foundation document
3. Apply any v3.010 enhancements
4. Maintain backward compatibility

### Checking Compliance

1. Read `/new-standards/README.md` for quick checklist
2. Use foundation docs as reference
3. Verify invocation comments present
4. Check WCAG patterns if accessibility-related

---

## DO NOT Use These Directories

**❌ /old-files/** - Historical fragments, keep for archival but DO NOT use for reference
**❌ /standards/** - Old standards directory, superseded by /new-standards/

**Reason:** These were the catastrophe sources. Use `/new-standards/` exclusively.

---

## Version Timeline (Quick Reference)

```
v2.245  → Pills nav, absolute URLs, watermark
v2.256-257 → Venue standards, reciprocal linking
v2.4 → Modular bundle release
v3.001 → Superset foundation, SiteCache
v3.002 → Social sharing, external link hardening
v3.006 → Invocation Edition (theological framework)
v3.007 → Caching/PWA, "Grandeur baseline"
v3.008 → Navigation contract (12+ links)
v3.009 → CI/CD automation, dropdown menus
v3.100 → WCAG 2.1 AA complete spec
v3.010.300 → CURRENT (AI-first SEO, ICP-Lite, multi-brand)
```

**Full timeline:** `/new-standards/VERSION_TIMELINE.md`

---

## Data Contracts

**Location:** Live implementation (`/assets/data/*.json`)
**Documentation:** `/new-standards/v3.010/MULTI_BRAND_DATA_CONTRACTS.md`

**Key Files:**
- `/assets/data/fleet_index.json` (v2.300) - Multi-brand ships
- `/assets/data/brands.json` - Brand configuration
- `/assets/data/rc-restaurants.json` - Royal Caribbean dining
- `/precache-manifest.json` (v13.0.0) - Service worker precache

---

## Service Worker

**File:** `/sw.js` (v13.0.0)
**Standard:** `/new-standards/foundation/PWA_CACHING_STANDARDS_v3.007.md`
**Evolution:** v3.007 baseline → v13.0.0 with priorities

**Invocation Present:** "Soli Deo Gloria ✝️" in SW header

---

## Navigation

**Standard:** `/new-standards/foundation/NAVIGATION_STANDARDS_ADDENDUM_v3.008.md`
**Current:** 12+ links (evolved from v3.008 baseline 12)

**Required Links:**
Home, Planning, Ships, Restaurants, Ports, Drink Packages, Drink Calculator,
Stateroom Check, Cruise Lines, Packing Lists, Accessibility, Travel

---

## Maintenance

### Monthly Review
- ICP-Lite `last-reviewed` dates
- AI-breadcrumbs `updated` dates
- Data contract freshness

### When Standards Change
1. Update `/new-standards/VERSION_TIMELINE.md`
2. Add new version file to appropriate directory
3. Update `/new-standards/README.md`
4. Document in `/CONFLICT_RESOLUTIONS.md` if conflicts
5. Never remove invocation requirements

---

## Emergency Reference

**If lost/confused:**
1. Read `/new-standards/README.md` (comprehensive guide)
2. Check `/new-standards/VERSION_TIMELINE.md` (evolution context)
3. Review `/CONFLICT_RESOLUTIONS.md` (zero conflicts status)
4. Consult `/TASK_7_COMPLETE.md` (verification summary)

**Remember:** Foundation patterns (v3.007.010) are proven and in use. Current implementation (v3.010.300) builds on that foundation with AI-first enhancements.

---

**Soli Deo Gloria** ✝️
