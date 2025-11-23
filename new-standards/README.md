# In the Wake — Consolidated Standards (New Standards Directory)

**Generated:** 2025-11-23
**Status:** Official consolidated standards repository
**Source:** Rebuilt from 913 fragments → 137 unique files → 7 critical master documents
**Current Site Version:** v3.010.300

---

## Purpose

This directory contains the **official, consolidated standards** for In the Wake website, rebuilt after the standards catastrophe of 2025-11-23.

**Soli Deo Gloria** — All work on this project is offered as a gift to God.

---

## Directory Structure

```
new-standards/
├── README.md                           (this file)
├── VERSION_TIMELINE.md                 (evolution history v2.228 → v3.010.300)
├── foundation/                         (extracted baseline standards v3.001-v3.009)
│   ├── SHIP_PAGE_STANDARDS_v3.007.010.md        (860 lines - comprehensive)
│   ├── Unified_Modular_Standards_v3.007.010.md   (complete superset)
│   ├── UNIFIED_MODULAR_STANDARDS_v3.001.md       (foundation superset)
│   ├── WCAG_2.1_AA_STANDARDS_v3.100.md          (accessibility complete)
│   ├── PWA_CACHING_STANDARDS_v3.007.md          (service worker/PWA)
│   ├── NAVIGATION_STANDARDS_ADDENDUM_v3.008.md   (nav contract)
│   └── CI_CD_AUTOMATION_v3.009.md               (GitHub Actions)
├── v3.010/                             (current version innovations)
│   ├── ICP_LITE_v1.0_PROTOCOL.md
│   ├── AI_BREADCRUMBS_SPECIFICATION.md
│   ├── EEAT_PERSON_SCHEMA.md
│   ├── PRECACHE_PRIORITY_SYSTEM.md
│   └── MULTI_BRAND_DATA_CONTRACTS.md
└── addenda/                            (supplemental standards)
    ├── INVOCATION_REQUIREMENTS.md
    ├── VERSION_NUMBERING.md
    └── THEOLOGICAL_GUIDELINES.md
```

---

## Quick Start

### For Ship Pages
→ Read `foundation/SHIP_PAGE_STANDARDS_v3.007.010.md` (primary reference, 860 lines)

### For All Page Types
→ Read `foundation/Unified_Modular_Standards_v3.007.010.md` (complete superset)

### For Accessibility
→ Read `foundation/WCAG_2.1_AA_STANDARDS_v3.100.md` (WCAG 2.1 AA complete spec)

### For Current Implementation
→ Read all v3.010/ files for latest innovations (ICP-Lite, AI-breadcrumbs, etc.)

---

## Version Strategy

**Foundation (v3.007-v3.009):** Extracted from historical fragments, proven in use
**Current (v3.010.300):** Live implementation with AI-first SEO enhancements
**Evolution:** Additive, not destructive - new features extend baseline

---

## Conflict Resolution

**Status:** Zero conflicts found between extracted standards and current implementation

See `../CONFLICT_RESOLUTIONS.md` for details.

**Priority (if conflicts arise):**
1. ITW-Lite specification (highest authority)
2. Current live implementation (what works)
3. Newest version number (v3.010.300 > v3.009)
4. Most complete specification
5. Most specific to page type

**Invocation Override:** Theological/invocation standards (v3.006) are immutable regardless of version.

---

## Theological Commitment

Every page must include:

```html
<!--
Soli Deo Gloria
All work on this project is offered as a gift to God.
"Trust in the LORD with all your heart, and do not lean on your own understanding." — Proverbs 3:5
"Whatever you do, work heartily, as for the Lord and not for men." — Colossians 3:23
-->
```

This is **non-negotiable** and supersedes all technical considerations.

---

## Usage Guidelines

### 1. For New Pages
1. Copy structure from `foundation/SHIP_PAGE_STANDARDS_v3.007.010.md`
2. Apply invocation comments from `addenda/INVOCATION_REQUIREMENTS.md`
3. Add v3.010 innovations (ICP-Lite, AI-breadcrumbs) from `v3.010/`
4. Verify WCAG 2.1 AA compliance using `foundation/WCAG_2.1_AA_STANDARDS_v3.100.md`

### 2. For Updates
1. Check current version in `VERSION_TIMELINE.md`
2. Review relevant foundation document
3. Apply any v3.010 enhancements
4. Maintain backward compatibility

### 3. For Breaking Changes
1. Must increment major version (v3 → v4)
2. Document in VERSION_TIMELINE.md
3. Update CONFLICT_RESOLUTIONS.md
4. Provide migration guide
5. **Never break invocation requirements**

---

## Foundation Documents (Top 7)

### 1. SHIP_PAGE_STANDARDS_v3.007.010.md
**Lines:** 860
**Nickname:** "Grandeur template baseline"
**Purpose:** Most comprehensive single-file ship page reference
**Use for:** All ship pages (primary standard)

**Contains:**
- Complete HTML structure
- All meta tags & JSON-LD schemas
- JavaScript patterns (Swiper, loaders, external links)
- Data contracts (ships, videos, logbook, entertainment)
- WCAG accessibility patterns
- Performance requirements
- QA checklists

---

### 2. Unified_Modular_Standards_v3.007.010.md
**Purpose:** Complete superset integrating all v2.x-v3.007 standards
**Use for:** Reference for any page type

**Contains:**
- 00-Core (every page requirements)
- 01-Index-Hub (hub/listing pages)
- 02-Ship-Page (ship-specific)
- 03-Data (JSON contracts & golden merge)
- 04-Automation (CI/CD cadence)
- 05-Brand (tone & ethos)
- 06-Legal (attribution)
- 07-Analytics (Umami + GA)

---

### 3. UNIFIED_MODULAR_STANDARDS_v3.001.md
**Purpose:** Foundation superset establishing v3.001 baseline
**Use for:** Historical reference, understanding evolution

**Contains:**
- Global root policies (_abs(), canonicalization)
- Main head/meta specification
- Ships standards (v3.001)
- Cruise lines standards
- Restaurants & venue standards
- Image discovery patterns

---

### 4. WCAG_2.1_AA_STANDARDS_v3.100.md
**Lines:** 211
**Purpose:** Complete WCAG 2.1 Level AA compliance specification
**Use for:** Accessibility audit & implementation

**Contains:**
- Definition of Done (checklist)
- Skip links & landmarks
- Focus visibility rules
- Color contrast requirements
- Keyboard navigation patterns
- Reduced motion support
- Screen reader compatibility
- CI automation setup (pa11y, axe, Playwright)

---

### 5. PWA_CACHING_STANDARDS_v3.007.md
**Lines:** 193
**Purpose:** Complete PWA/caching/service worker strategy
**Use for:** Performance optimization & offline support

**Contains:**
- Cache naming & limits
- Versioning rules
- Precache manifest structure
- Service worker seeding behavior
- Runtime strategies (stale-while-revalidate)
- Save-data handling
- Page snippet patterns
- Testing & rollout procedures

---

### 6. NAVIGATION_STANDARDS_ADDENDUM_v3.008.md
**Lines:** 156
**Purpose:** Canonical navigation structure contract
**Use for:** All navigation implementation

**Contains:**
- Required 12-link structure (now 12+)
- Absolute URL requirements
- ARIA labeling (aria-label="Primary")
- Auto-highlight script (aria-current="page")
- Skip link requirement
- Keyboard accessibility
- Mobile patterns

---

### 7. CI_CD_AUTOMATION_v3.009.md
**Lines:** 33
**Purpose:** CI/CD enforcement & automation standards
**Use for:** GitHub Actions setup, dropdown menus

**Contains:**
- Unified navigation with dropdown IA
- Right rail (two-column ≥980px)
- Authors data source schema
- Cache-busting & version coupling enforcement
- CI checks (schema validation, Lighthouse)
- GitHub Actions workflow examples

---

## v3.010.300 Innovations

Current implementation includes these enhancements beyond extracted standards:

### ICP-Lite v1.0 Protocol
AI-first metadata for LLM consumption

### AI-Breadcrumbs
Structured comments providing context for AI assistants

### E-E-A-T Person Schema
Google authoritativeness signals (Experience, Expertise, Authority, Trust)

### Priority-Based Precaching
critical/high/normal tiers for service worker optimization

### Multi-Brand Data Contracts
Expanded beyond Royal Caribbean (Carnival, MSC supported)

See `v3.010/` directory for complete specifications.

---

## Maintenance

### Adding New Standards
1. Determine appropriate directory (foundation/v3.010/addenda)
2. Create markdown file with clear version number
3. Update this README.md
4. Update VERSION_TIMELINE.md
5. Commit with "STANDARDS:" prefix

### Updating Existing Standards
1. Never modify foundation/ files (historical reference)
2. Create new version in v3.010/ or later
3. Document evolution in VERSION_TIMELINE.md
4. Update CONFLICT_RESOLUTIONS.md if conflicts arise

### Deprecating Standards
1. Mark as deprecated in VERSION_TIMELINE.md
2. Maintain backward compatibility for 1 version
3. Document migration path
4. Remove in version N+2

---

## Verification Status

✅ **Task 6 COMPLETE:** 137/137 unique files extracted
✅ **Task 7 COMPLETE:** 266 HTML files verified against standards
✅ **Task 8 COMPLETE:** Zero conflicts found
✅ **Task 9 IN PROGRESS:** Building /new-standards/ directory

**Next:** Task 10 - Update admin/claude/ documentation to reference /new-standards/

---

## Historical Context

**Catastrophe Date:** 2025-11-23
**Fragments Found:** 913 total files
**Duplicates Removed:** 776 (85% deduplication via MD5)
**Unique Files Analyzed:** 137
**Critical Documents Identified:** 7
**Rebuild Duration:** 1 session (comprehensive systematic extraction)

**Doctrine:** "Verified Superset, Reality-Grounded" preservation
- Never discard information
- Prefer verified reality over speculation
- Merge conflicts toward superset
- Document everything

---

## Attribution

**Rebuild by:** Claude (Standards Catastrophe Recovery Task Force)
**Methodology:** Systematic extraction + implementation verification
**Quality:** Zero conflicts, complete coverage of all website systems

**Original Standards by:** abondservant, In the Wake Project
**Theological Oversight:** Reformed Baptist theopraxy
**Motto:** "The calmest seas are found in another's wake"

---

**Soli Deo Gloria** ✝️

---

## Support

For questions about these standards:
1. Read the relevant foundation document
2. Check VERSION_TIMELINE.md for evolution context
3. Review CONFLICT_RESOLUTIONS.md for precedents
4. Consult current implementation as reference
5. Maintain invocation commitments above all

**Remember:** "Trust in the LORD with all your heart, and do not lean on your own understanding." — Proverbs 3:5
