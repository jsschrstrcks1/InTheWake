# Standards Index - In the Wake

**Version:** 1.0.0
**Last Updated:** 2025-11-23
**Purpose:** Master index of all standards, protocols, and conventions for the In the Wake website

---

## 📚 Quick Reference

This document serves as the **single source of truth** for finding all standards documentation across the repository.

**For Claude AI:** Read this first, then drill into specific standards as needed for your task.

**For Humans:** Use this as a navigation guide to understand site architecture and requirements.

---

## 📋 CRITICAL: Task Tracking Protocol

**UNFINISHED_TASKS.md is the authoritative tracker of all plans and progress.**

### Task Management Rules

**ALWAYS UPDATE UNFINISHED_TASKS.md:**
- ✅ When you complete a task → Mark it complete with ✅ and date
- ✅ When you discover new work → Add it to the appropriate priority section
- ✅ When priorities change → Update the priority ranking
- ✅ When you create new files → Document them in the appropriate section

**APPEND, NEVER REPLACE:**
- ✅ UNFINISHED_TASKS.md is a **historical record**
- ✅ Completed tasks move to "HISTORICAL TASK ARCHIVE" section (line 1308+)
- ✅ New tasks are added to active sections
- ✅ Progress summaries are updated with new completion dates
- ❌ NEVER delete completed tasks from the archive
- ❌ NEVER remove historical context

**Example Workflow:**
```
1. Check UNFINISHED_TASKS.md for current priority (e.g., P0 #7: Fix placeholder attributions)
2. Complete the task (e.g., update Symphony of the Seas attribution)
3. Update UNFINISHED_TASKS.md:
   - Mark P0 #7 as ✅ complete with date
   - If you created new files, document them in "Files Created" section
   - Add entry to HISTORICAL TASK ARCHIVE if removing from active list
   - Update PROGRESS SUMMARY with new completion
4. Commit with clear message: "FIX: Add proper Wiki Commons attributions to Symphony of the Seas"
```

**Why This Matters:**
- Maintains continuity across Claude sessions
- Prevents duplicate work
- Preserves historical context
- Helps user track overall progress
- Enables accurate status reporting

**See:** Section 12 below for detailed UNFINISHED_TASKS.md documentation

---

## 🎯 Core Standards (MUST READ)

These standards apply to **every page** on the site.

### 1. Main Standards
**File:** `/standards/main-standards.md`
**Version:** v3.001
**Scope:** Global site requirements

**Key Topics:**
- ✅ Canonical domain (https://www.cruisinginthewake.com)
- ✅ Absolute URLs only (no relatives)
- ✅ Primary navigation structure
- ✅ Global data files (fleet_index.json, venues.json, personas.json)
- ✅ Caching strategy (SiteCache.js, Service Worker)
- ✅ Performance optimization (lazy loading, fetchpriority)
- ✅ CI checks and validation

**When to Reference:**
- Setting up navigation on any page
- Linking to other pages or assets
- Implementing caching/performance features
- Validating build configurations

### 2. Root Standards
**File:** `/standards/root-standards.md`
**Version:** v3.001
**Scope:** Root-level pages (index.html, solo.html, etc.)

**Key Topics:**
- ✅ Absolute URL requirements
- ✅ Header/hero/watermark patterns
- ✅ Ships hub path (`/ships/index.html`)
- ✅ Caching snippet (copy-paste safe)
- ✅ Service Worker registration

**When to Reference:**
- Creating or editing homepage
- Creating new hub pages
- Implementing hero sections

### 3. Ships Standards
**File:** `/standards/ships-standards.md`
**Version:** v3.001
**Scope:** Ship detail pages and ships hub

**Key Topics:**
- ✅ Structure & order preservation
- ✅ Ship paths (`/ships/<line>/<slug>.html`)
- ✅ Hub location (`/ships/index.html`)
- ✅ Data loading (fleet_index.json, venues.json, personas.json, rc_ship_videos.json)
- ✅ Image discovery patterns
- ✅ Caching via SiteCache

**When to Reference:**
- Creating new ship pages
- Editing ship detail pages
- Adding ship images
- Implementing ship data features

### 4. Cruise Lines Standards
**File:** `/standards/cruise-lines-standards.md`
**Version:** v3.001
**Scope:** Cruise line hub pages

**Key Topics:**
- ✅ Absolute URLs rooted at canonical domain
- ✅ Cross-linking to ship pages
- ✅ Caching implementation (same as Root)

**When to Reference:**
- Creating cruise line hub pages (Royal Caribbean, Carnival, etc.)
- Linking between line hubs and ship pages

### 5. Ports Standards
**File:** `/standards/ports-standards.md`
**Version:** Current
**Scope:** Port detail pages

**Key Topics:**
- ✅ **Mexican ports:** MUST include Revolution Day notice (November 20th)
- ✅ Standard sections (Getting Around, Revolution Day, General Warnings)
- ✅ Template HTML for Revolution Day section
- ✅ Applicable ports list

**When to Reference:**
- Creating new Mexican port pages
- Editing existing Mexican port pages
- Ensuring compliance with port-specific requirements

**CRITICAL:** All Mexican port pages (Cozumel, Costa Maya, Cabo San Lucas, Puerto Vallarta, etc.) MUST include Revolution Day notice.

### 6. Royal Caribbean Addendum
**File:** `/standards/STANDARDS_ADDENDUM_RCL_v3.006.md`
**Version:** v3.006.006
**Scope:** Royal Caribbean cruise line hub page (superset addendum)

**Key Topics:**
- ✅ Invocation comments (UTF-8, Soli Deo Gloria)
- ✅ Versioning (title, meta, version-badge, cache buster)
- ✅ Absolute URLs enforcement
- ✅ Hero rule (exactly one hero image, one compass)
- ✅ Search-first UI (live, no button, merges Ships + Venues + Experiences)
- ✅ Class → Ships Pills (editorial order)
- ✅ Toggle: "Show unfinished ships" (OFF by default)
- ✅ Dress code section
- ✅ Venues panel (right column, filter tabs)
- ✅ Accessibility requirements
- ✅ Performance: cache buster increments (.001 per batch)
- ✅ Attributions CSV maintenance

**When to Reference:**
- Editing `/cruise-lines/royal-caribbean.html`
- Implementing similar patterns on other cruise line hubs
- Understanding venue filtering logic

---

## 🤖 AI & Content Protocols

### 7. ITW-Lite Protocol
**File:** `/admin/claude/ITW-LITE_PROTOCOL.md`
**Version:** v3.010.lite
**Scope:** AI-first content implementation

**Key Topics:**
- ✅ Level 1: Meta tags (content-protocol, ai:summary, last-reviewed)
- ✅ Level 2: Content structure (H1+answer line, fit-guidance, FAQ)
- ✅ Level 3: Progressive enhancement (no-js fallbacks)
- ✅ Schema.org structured data (Article, FAQ, BreadcrumbList)
- ✅ Pilot implementation plan
- ✅ Success metrics and tracking

**Status:**
- Level 1: 97% complete (544/561 pages)
- Level 2: Pilot phase (Radiance of the Seas)
- Level 3: Planned

**When to Reference:**
- Adding meta tags to pages
- Creating fit-guidance sections
- Implementing FAQ sections with schema
- Ensuring AI-friendly content structure

### 8. ICP-Lite Guide
**File:** `/admin/ICP-Lite.md`
**Version:** Current
**Scope:** ICP-Lite meta tag implementation

**Key Topics:**
- ✅ What is ICP-Lite?
- ✅ Meta tag specifications
- ✅ Current coverage (97%)
- ✅ Pages still needing tags
- ✅ Implementation examples

**When to Reference:**
- Understanding ICP-Lite vs ITW-Lite
- Adding ICP-Lite meta tags to pages
- Checking implementation status

---

## 🧭 Claude AI Documentation

### 9. Claude Guide (Main Entry Point)
**File:** `/admin/claude/CLAUDE.md`
**Version:** 1.0.0
**Scope:** Comprehensive Claude onboarding

**Key Topics:**
- ✅ Site mission & philosophy
- ✅ Architecture overview
- ✅ Template & versioning
- ✅ Technical standards (performance, accessibility, SEO)
- ✅ Content standards (logbook stories, articles, cross-linking)
- ✅ Image management (WebP, attribution, discovery)
- ✅ Critical "NEVER DO" rules
- ✅ Development workflow
- ✅ Current priorities (P0-P4)

**When to Reference:**
- **START HERE** if you're a new Claude session
- Understanding site mission and values
- Learning development workflow
- Finding current task priorities

### 10. Codebase Guide
**File:** `/admin/claude/CODEBASE_GUIDE.md`
**Version:** 1.0.0 (to be created)
**Scope:** Repository structure and code patterns

**Key Topics:**
- ✅ Directory structure details
- ✅ JavaScript patterns and modules
- ✅ CSS architecture
- ✅ JSON data file formats
- ✅ Common code patterns (caching, dynamic loading, etc.)

**When to Reference:**
- Understanding file organization
- Learning JavaScript module system
- Adding new data files
- Following code conventions

### 11. Standards Index (This File)
**File:** `/admin/claude/STANDARDS_INDEX.md`
**Version:** 1.0.0
**Scope:** Master index of all standards

**When to Reference:**
- Finding the right standard for your task
- Quick overview of all documentation
- Navigation to specific standards

---

## 📋 Task & Planning Documentation

### 12. Unfinished Tasks (CRITICAL - PRIMARY TASK TRACKER)
**File:** `/UNFINISHED_TASKS.md`
**Version:** Updated 2025-11-23
**Scope:** Comprehensive task list with priorities
**Status:** **APPEND-ONLY** - Never delete, only add and update

**Key Sections:**
- ✅ Comprehensive Audit #4 (file-by-file verification)
- ✅ Port expansion tasks (147 ports, master lists)
- ✅ Image tasks (Wiki Commons downloads, attribution)
- ✅ Ship logbook tasks (40 complete, 2 historic pending)
- ✅ Template & SEO tasks
- ✅ Content tasks (5 article categories)
- ✅ UI/UX tasks (navigation, ship cards)
- ✅ Technical tasks (WebP, search, bulk updates)
- ✅ Priority ranking (P0-P4)
- ✅ Progress summary
- ✅ **Historical task archive (line 1308+)** - Completed tasks NEVER deleted

**CRITICAL RULES:**
- ✅ **ALWAYS update when completing tasks** - Mark with ✅ and date
- ✅ **ALWAYS append new tasks discovered** - Add to appropriate priority section
- ✅ **ALWAYS preserve historical context** - Move completed tasks to archive, never delete
- ✅ **ALWAYS update progress summaries** - Document new completions with dates
- ❌ **NEVER replace the entire file** - This is a historical record
- ❌ **NEVER delete completed tasks** - They move to HISTORICAL TASK ARCHIVE section
- ❌ **NEVER remove audit findings** - Maintain comprehensive audit trail

**Example Updates:**

*Completing a task:*
```markdown
### P0 - Critical
7. ~~**Fix placeholder attributions**~~ - ✅ COMPLETE (2025-11-23, Symphony/Adventure/Enchantment/Explorer)
```

*Adding new work discovered:*
```markdown
### P1 - High Priority
XX. **Fix broken image links in 5 port pages** - Discovered during audit (2025-11-23)
    - ports/dubai.html (3 broken refs)
    - ports/abu-dhabi.html (2 broken refs)
    - ...
```

*Moving to archive:*
```markdown
## 📜 HISTORICAL TASK ARCHIVE (Completed & Removed)

### ✅ Completed Attribution Tasks
**Originally tracked as P0 #7:**
- ✅ Symphony of the Seas - Proper Wiki Commons URLs added (2025-11-23)
- ✅ Adventure of the Seas - Attribution section created (2025-11-23)
- ✅ Enchantment of the Seas - 5 images properly attributed (2025-11-23)
- ✅ Explorer of the Seas - Attribution section created (2025-11-23)
```

**When to Reference:**
- **EVERY TIME** you start a new task
- **EVERY TIME** you complete a task
- **EVERY TIME** you discover new work
- Finding what to work on next
- Understanding priority levels
- Checking task completion status
- Reviewing historical progress
- Preventing duplicate work across sessions

### 13. Five Article Categories
**File:** `/admin/FIVE_ARTICLE_CATEGORIES.md`
**Version:** Current
**Scope:** Solo travel article structure

**Key Topics:**
- ✅ In the Wake of Grief (COMPLETE, Grade A+)
- ✅ Accessible Cruising (COMPLETE)
- ⚠️ Solo Cruising (partial, needs expansion)
- ❌ Healing Relationships (not created, 15+ logbook refs)
- ❌ Rest for Wounded Healers (not created, 10+ logbook refs)
- ✅ Logbook story references by category
- ✅ Cross-linking strategy

**When to Reference:**
- Writing solo travel articles
- Understanding article structure and requirements
- Finding relevant logbook stories to reference
- Planning cross-links between articles and logbooks

### 14. Thread Audit Report
**File:** `/admin/THREAD_AUDIT_2025_11_19.md`
**Version:** 2025-11-19
**Scope:** Comprehensive site audit findings

**Key Topics:**
- ✅ Thread summary (368 issues fixed)
- ✅ Files created (10 files)
- ✅ P0 critical fixes (195 issues: index files, search-index, venue-boot.js, JSON)
- ✅ P2 medium fixes (173 issues: orphans, DOCTYPE, console statements, lorem ipsum)
- ✅ Verified state (logbooks, ICP-Lite, SEO, protocol docs)
- ✅ Audit findings breakdown
- ✅ Remaining work

**When to Reference:**
- Understanding recent audit work
- Checking what was fixed in Thread #3
- Finding remaining issues to address

---

## 🛠️ Admin & Tool Documentation

### 15. Admin README
**File:** `/admin/README.md`
**Version:** Updated 2025-11-18
**Scope:** Admin tools and scripts overview

**Key Topics:**
- ✅ Directory structure
- ✅ WebP image management tools (6 scripts)
- ✅ Reports (articles.html, sw-health.html)
- ✅ Typical WebP conversion workflow
- ✅ Notes and future tools

**When to Reference:**
- Converting images to WebP format
- Running admin scripts (rename, update, verify)
- Understanding WebP workflow
- Finding audit/report tools

### 16. Performance Optimizations
**File:** `/PERFORMANCE_OPTIMIZATIONS_COMPLETED.md`
**Version:** 2025-11-23
**Scope:** Performance work completed in Thread #4

**Key Topics:**
- ✅ Cache headers configuration (1-year asset caching)
- ✅ LCP optimizations (fetchpriority="high" on 479 pages)
- ✅ Hero logo responsive sizing (451 pages)
- ✅ Author avatar filenames (108 pages)
- ✅ Restaurant filter bar z-index fix
- ✅ Solo article loader picture tag fixes
- ✅ Impact: 64% reduction in page load size

**When to Reference:**
- Understanding recent performance work
- Implementing similar optimizations
- Checking what was completed in Thread #4

### 17. Cache Headers README
**File:** `/CACHE_HEADERS_README.md`
**Version:** 2025-11-23
**Scope:** Cache configuration documentation

**Key Topics:**
- ✅ Netlify configuration (`_headers`)
- ✅ Apache configuration (`.htaccess`)
- ✅ nginx configuration (`nginx-cache-headers.conf`)
- ✅ 1-year caching for static assets
- ✅ No-cache for HTML/JSON

**When to Reference:**
- Configuring cache headers
- Deploying to different servers
- Understanding cache strategy

---

## 📊 Data & Port Master Lists

### 18. Port Master Lists
**Location:** `/assets/data/ports/`
**Scope:** Comprehensive port lists by cruise line

**Files:**
- ✅ **Royal Caribbean:** `royal-caribbean-ports-master-list.md` (350+ ports, 147 created, 42%)
- ✅ **Carnival:** `carnival-cruise-line-ports-master-list.md` (320+ ports, Phase 1-5 expansion)
- ✅ **Virgin Voyages:** `virgin-voyages-ports-master-list.md` (~120 ports, adults-only)
- ✅ **MSC Cruises:** `msc-cruises-ports-master-list.md` (380+ ports, European focus)
- ✅ **Norwegian:** `norwegian-cruise-line-ports-master-list.md` (420+ ports, port-intensive)

**When to Reference:**
- Planning port expansion batches
- Checking which ports exist for which lines
- Cross-referencing multi-line ports
- Future multi-cruise-line tracker enhancement

### 19. JSON Data Schemas
**Location:** `/assets/data/`
**Key Files:**
- ✅ `fleet_index.json` - Ship fleet data (version field required)
- ✅ `venues.json` - Dining venue data (version field required)
- ✅ `personas.json` - User persona data (version field required)
- ✅ `rc_ship_videos.json` - Video manifest (version field required)
- ✅ `logbook/rcl/*.json` - Ship logbook stories (schema defined in CLAUDE.md)

**Schema Requirements:**
- All JSON files MUST include `"version"` field for cache invalidation
- All JSON must be valid (no trailing commas, no comments)
- Use validators before committing

**When to Reference:**
- Creating new JSON data files
- Understanding data structure
- Implementing caching with version awareness

---

## 🎨 CSS & Template Standards

### 20. Item Cards CSS
**File:** `/assets/css/item-cards.css`
**Version:** v1.0.0
**Scope:** Ship card redesign (COMPLETE 2025-11-22)

**Key Features:**
- ✅ Enhanced CTA text (gradient background, 3px left border, subtle shadow)
- ✅ Improved CTA button (full-width, gradient, animated arrow on hover)
- ✅ Better visual hierarchy (larger titles, improved spacing)
- ✅ Enhanced badges (gradient backgrounds, box-shadows, backdrop blur)
- ✅ Improved grid layout (responsive breakpoints)
- ✅ Enhanced cards (softer borders, layered shadows, hover lift)
- ✅ Better images (16:9 aspect ratio, zoom effect on hover)
- ✅ Retired badge styling (grayscale filter on images)

**When to Reference:**
- Understanding ship card design system
- Implementing similar card patterns elsewhere
- Maintaining visual consistency

### 21. Template Version
**Current:** v3.010.300
**Coverage:** 478 files (85%+ of site)

**Key Requirements:**
- ✅ CSS version query: `?v=3.0`
- ✅ Meta version tag: `<meta name="version" content="v3.006.006">`
- ✅ Cache buster increments: `.001` per batch
- ✅ Consistent navigation structure
- ✅ Service Worker registration
- ✅ SiteCache pre-warm snippet

**When to Reference:**
- Creating new pages
- Updating template version
- Ensuring consistency across site

---

## 🔍 Finding the Right Standard

### By Task Type

**Creating a new ship page:**
1. Read `/standards/ships-standards.md`
2. Read `/admin/claude/CLAUDE.md` (Ship Logbook Stories section)
3. Reference existing ship page (e.g., `/ships/rcl/radiance-of-the-seas.html`)
4. Check `/UNFINISHED_TASKS.md` for ship-specific tasks

**Creating a new port page:**
1. Read `/standards/ports-standards.md`
2. Check if Mexican port → MUST include Revolution Day notice
3. Reference existing port page
4. Check port master lists for port details

**Writing a solo travel article:**
1. Read `/admin/FIVE_ARTICLE_CATEGORIES.md`
2. Read `/admin/claude/ITW-LITE_PROTOCOL.md` (Article Schema section)
3. Reference "In the Wake of Grief" article (Grade A+ example)
4. Check logbook stories for relevant references

**Implementing ICP-Lite/ITW-Lite:**
1. Read `/admin/claude/ITW-LITE_PROTOCOL.md` (complete specification)
2. Read `/admin/ICP-Lite.md` (meta tag guide)
3. Check pilot implementation status
4. Follow Level 1 → Level 2 → Level 3 progression

**Optimizing performance:**
1. Read `/standards/main-standards.md` (Caching & Performance section)
2. Read `/PERFORMANCE_OPTIMIZATIONS_COMPLETED.md`
3. Read `/CACHE_HEADERS_README.md`
4. Check Service Worker configuration (`/sw.js`)

**Managing images:**
1. Read `/admin/README.md` (WebP Image Management Tools)
2. Read `/admin/claude/CLAUDE.md` (Image Management section)
3. Follow WebP conversion workflow
4. Track attributions in `/attributions/attributions.csv`

**Understanding git workflow:**
1. Read `/admin/claude/CLAUDE.md` (Development Workflow section)
2. Check branch naming conventions
3. Follow commit message format
4. Never push to main directly

### By Priority Level

**P0 Critical (User-facing):**
- ✅ Navigation → `/standards/main-standards.md` + existing nav examples
- ✅ WebP images → `/admin/README.md` WebP tools section
- ✅ Trackers → COMPLETE (port-tracker.html, ship-tracker.html)
- ⏳ Attribution → `/admin/claude/CLAUDE.md` Image Attribution section

**P1 High (Content completeness):**
- ✅ Grief article → COMPLETE (`/solo/in-the-wake-of-grief.html`)
- ✅ Hawaii ports → COMPLETE (5 ports)
- ⏳ Solo article expansion → `/admin/FIVE_ARTICLE_CATEGORIES.md` Category #3
- ⏳ Protocol docs → `/admin/claude/*.md` (IN PROGRESS)

**P2 Medium (Enhancement):**
- ⏳ Port expansion → Port master lists in `/assets/data/ports/`
- ⏳ ICP-Lite rollout → `/admin/claude/ITW-LITE_PROTOCOL.md`
- ⏳ Historic logbooks → `/admin/claude/CLAUDE.md` Logbook section

**P3-P4 Future:**
- ⏳ Multi-cruise-line tracker → `/UNFINISHED_TASKS.md` line 227
- ⏳ Carnival expansion → `/assets/data/ports/carnival-cruise-line-ports-master-list.md`

---

## ✅ Compliance Checklist

Before marking any work complete, verify compliance with these standards:

### Every Page Must Have:
- [ ] Absolute URLs (https://www.cruisinginthewake.com/...)
- [ ] DOCTYPE declaration
- [ ] Meta tags (charset, viewport, description, version)
- [ ] ICP-Lite meta tags (content-protocol, ai:summary, last-reviewed)
- [ ] CSS with version query (?v=3.0)
- [ ] Service Worker registration snippet
- [ ] SiteCache pre-warm snippet
- [ ] Skip-link for accessibility
- [ ] Breadcrumb navigation (JSON-LD + HTML)
- [ ] No console statements in production code
- [ ] No lorem ipsum or placeholder text

### Ship Pages Must Have:
- [ ] Path: `/ships/<line>/<slug>.html`
- [ ] Hero image (WebP format, fetchpriority="high")
- [ ] Ship stats (inline or JSON-driven)
- [ ] Logbook section (if stories exist)
- [ ] Attribution section (if Wiki Commons images)
- [ ] Cross-links to related ships/articles
- [ ] Responsive logo with srcset

### Port Pages Must Have:
- [ ] Revolution Day notice (if Mexican port)
- [ ] Standard sections (Getting Around, Practical Info, Warnings)
- [ ] Quick facts (terminal, transit, visa)
- [ ] LCP preload hints (fetchpriority="high")
- [ ] No "under construction" notices

### Solo Articles Must Have:
- [ ] H1 + dek (answer line)
- [ ] Fit-guidance section
- [ ] FAQ section (5+ questions with schema)
- [ ] Ship size recommendations
- [ ] Cross-links to logbook stories
- [ ] Article schema (JSON-LD)
- [ ] Scripture references (where appropriate)

### JSON Files Must Have:
- [ ] Valid JSON (no trailing commas, no comments)
- [ ] Version field for cache invalidation
- [ ] Proper schema format
- [ ] No control characters

### Images Must Be:
- [ ] WebP format (except logo_wake.png)
- [ ] Properly attributed (if Wiki Commons)
- [ ] Responsive (width/height or aspect-ratio)
- [ ] Lazy loaded (except hero images)
- [ ] Alt text present and descriptive

---

## 🚀 Quick Start Guide

### For New Claude Sessions:

**Step 1:** Read this file (STANDARDS_INDEX.md) to understand available documentation

**Step 2:** Read `/admin/claude/CLAUDE.md` for comprehensive onboarding

**Step 3:** Check `/UNFINISHED_TASKS.md` for current priorities

**Step 4:** Find relevant standards for your specific task (use "By Task Type" section above)

**Step 5:** Reference existing examples of similar work

**Step 6:** Verify compliance with checklist before marking complete

### For Specific Tasks:

**"Add ICP-Lite meta tags to 17 remaining pages"**
→ Read `/admin/claude/ITW-LITE_PROTOCOL.md` Level 1
→ Check pages listed in UNFINISHED_TASKS.md line 1185
→ Add meta tags, verify with validator

**"Create Middle East port batch (4 ports)"**
→ Read `/standards/ports-standards.md`
→ Check `/assets/data/ports/royal-caribbean-ports-master-list.md`
→ Reference existing port page structure
→ Implement, verify no "under construction" notices

**"Write Healing Relationships article"**
→ Read `/admin/FIVE_ARTICLE_CATEGORIES.md` Category #4
→ Read `/admin/claude/ITW-LITE_PROTOCOL.md` Article section
→ Reference "In the Wake of Grief" article (Grade A+ example)
→ Include 15+ logbook story references

**"Download Wiki Commons images for 19 ships"**
→ Read `/admin/claude/CLAUDE.md` Image Management section
→ Check list in UNFINISHED_TASKS.md line 676-702
→ Follow WebP conversion workflow in `/admin/README.md`
→ Track attributions in `/attributions/attributions.csv`

---

## 📞 Still Have Questions?

**Can't find the right standard?**
- Check this index again (might have missed it)
- Look at existing examples of similar work
- Ask user for clarification

**Standard seems contradictory?**
- More specific standard wins (e.g., ports-standards.md overrides main-standards.md for port pages)
- User clarification trumps all documentation
- When in doubt, ask before proceeding

**Standard seems outdated?**
- Check "Last Updated" date at top of standard file
- Cross-reference with recent audit reports
- Verify current state with file reads
- Update documentation if found incorrect

**Need to add new pattern?**
- Document it in appropriate standard file first
- Get user approval before scaling
- Update this index with new documentation

---

## 🔄 Version History

**v1.0.0 (2025-11-23):**
- Initial comprehensive standards index
- Cross-referenced all existing standards
- Added quick start guide
- Included compliance checklist
- Organized by task type and priority

---

**Remember:** This is a **living document**. As new standards are created or existing ones updated, this index should be updated to reflect those changes.

**Soli Deo Gloria** 🙏
