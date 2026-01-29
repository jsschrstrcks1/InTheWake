# Maintenance Tasks Identified

**Project:** In the Wake (cruisinginthewake.com)
**Date:** 2026-01-29
**Branch:** `claude/identify-maintenance-tasks-FN2lh`
**Audited By:** Claude AI

---

## Executive Summary

This document consolidates all maintenance tasks identified across the In the Wake codebase. Tasks are categorized by priority, type, and estimated effort. The site currently has significant validation debt with 66% of ship pages and 77% of port pages failing validation.

---

## Current Site Health

| Metric | Value | Status |
|--------|-------|--------|
| Total HTML Pages | 1,036 | - |
| Ship Pages | 311 | 106 passing (34%) |
| Port Pages | 380 | 89 passing (23%) |
| ICP-Lite Compliance | 100% | Achieved |
| Ship Blocking Errors | 981 | Critical |
| Ship Warnings | 2,429 | High |

---

## Priority 1: Critical (Fix First)

### 1.1 Ship Validation Crisis
**Status:** 205/311 ships failing (66%)
**Blocking Errors:** 981

| Error Type | Files Affected | Fix |
|------------|----------------|-----|
| Images with short alt text | 261 | Add descriptive alt text (20+ chars) |
| Missing logbook personas | 256 | Write stories for 6 required personas |
| FAQ sections too short | 255 | Expand to 200+ words |
| Logbook stories too short | 253 | Expand stories to 300+ words |
| Navigation items missing | 250 | Add /ships/quiz.html, /internet-at-sea.html |
| Few images (<8) | 236 | Add locally-hosted images |
| Missing whimsical units container | 214 | Add #whimsical-units-container div |
| Low static content | 207 | Expand to 500+ words |
| Few logbook stories (<10) | 198 | Write 10+ stories per ship |
| Missing video categories | 151 | Find YouTube videos for 8 categories |

### 1.2 Port Validation Crisis
**Status:** 291/380 ports failing (77%)

| Error Type | Ports Affected | Fix |
|------------|----------------|-----|
| Section order issues | 277 | Reorder sections per standard |
| Missing booking guidance | 275 | Add booking keywords |
| Missing required sections | 272 | Add all required sections |
| Logbook under 800 words | 272 | Expand logbook content |
| Cruise port section <100 words | 272 | Expand section |
| Excursions <400 words | 271 | Add excursion content |
| Missing lazy loading | 271 | Add loading="lazy" |
| Low first-person voice | 262 | Add 10+ first-person pronouns |
| Images missing alt text | 258 | Add descriptive alt text |

### 1.3 Stateroom Checker Data
**Status:** RCL complete (29/29 ships audited), other cruise lines need work
**Impact:** Users get wrong cabin category classifications

**Completed:**
- Royal Caribbean: All 29 ships fully audited with category_overrides

**Remaining:**
- 241 baseline files created for other cruise lines
- Room-by-room audits needed for Carnival, Celebrity, Norwegian, Princess, MSC, Holland America, Costa, Cunard, Explora, Oceania, Regent, Seabourn, Silversea, Virgin

---

## Priority 2: High (Content Completeness)

### 2.1 Vanilla Stories Replacement
**Status:** ~1,570 stories needed across 157 ships (12 cruise lines)
**Impact:** Generic template content hurts authenticity

| Cruise Line | Ships | Stories Needed | Priority |
|-------------|-------|----------------|----------|
| Holland America | 46 | 460 | HIGH |
| MSC | 24 | 240 | HIGH |
| Norwegian | 20 | 200 | HIGH |
| Princess | 17 | 170 | HIGH |
| Silversea | 10 | 100 | MEDIUM |
| Costa | 9 | 90 | MEDIUM |
| Oceania | 8 | 80 | MEDIUM |
| Regent | 7 | 70 | MEDIUM |
| Seabourn | 6 | 60 | MEDIUM |
| Virgin Voyages | 4 | 40 | MEDIUM |
| Cunard | 4 | 40 | MEDIUM |
| Explora | 2 | 20 | LOW |

**Quality Requirements:**
- Ship-specific venues mentioned
- Real author name with location
- Service recovery narrative (crisis -> response -> resolution)
- Emotional pivot / tearjerker moment
- Faith-scented references (natural)
- 300-600 word count
- Unique persona perspective

### 2.2 Missing Articles (Pastoral Content)
**Lane:** Red (requires human review)

| Article | Status | Word Target |
|---------|--------|-------------|
| Healing Relationships at Sea | Not created | ~3,000 |
| Rest for Wounded Healers | Not created | ~2,500 |
| Solo Travel Safety Tips | TODO | ~2,000 |

### 2.3 Port Weather Guides
**Status:** 300/380 ports have weather (79%)
**Remaining:** 80 ports need weather section

---

## Priority 3: Medium (Enhancement)

### 3.1 Port Map Integration
**Status:** 186/291 ports (64%) have Leaflet maps
**Remaining:** 105 ports without maps

**Regions Needing Maps:**
- Europe Western: 14 ports
- Europe Northern: 17 ports
- Europe Mediterranean: 13 ports
- British Isles: 10 ports
- Caribbean & Central America: 8 ports
- South America & Africa: 6 ports
- North America East Coast: 8 ports
- North America West Coast: 4 ports
- Asia & Pacific: 11 ports
- Miscellaneous: 12 ports

### 3.2 Competitor Gap Analysis P2 Items
| Task | Status |
|------|--------|
| Print CSS + PDF generation for port pages | Not started |
| Transport cost callout component | Not started |
| Accessibility sections on port pages | Not started |
| DIY vs. Ship Excursion cost comparisons | Not started |
| Honest assessment "Real Talk" sections | Not started |

### 3.3 Quiz Improvements
| Task | Status |
|------|--------|
| iPhone scroll issue on cruise line dropdown | Unverified |
| Back button restarts quiz (no history state) | Unverified |
| Add null safety for lineData access | Not started |
| Implement 10-ship limit per user request | Not started |
| Regional availability filter | Not started |

### 3.4 Service Worker v14 Upgrade
**Current Version:** v13.2.0

**Bug Fixes Needed:**
- Add CORS type check to 8 cache functions (lines 223, 242, 266, 295, 304, 330, 444, 598)

**New Features:**
- `staleIfErrorTimestamped` strategy
- `warmCalculatorShell` predictive prefetch
- `FORCE_DATA_REFRESH` message handler
- `GET_CACHE_STATS` handler

---

## Priority 4: Low (Future Enhancement)

### 4.1 Affiliate Link Deployment
**Status:** Phase 1 complete, Phases 2-3 not started

**Phase 2 - New Content:**
- `/articles/cruise-duck-tradition.html`
- `/articles/cruise-cabin-organization.html`
- `/articles/cruise-photography-tech.html`

**Phase 3 - Enhance Existing:**
- Add affiliate links to `/packing-lists.html`
- Add tech recommendations to `/internet-at-sea.html`

### 4.2 Developer Tooling
| Tool | Purpose | Status |
|------|---------|--------|
| JSON Schema Validation | Data integrity for 204 JSON files | Planned |
| Playwright + axe-core | E2E accessibility testing | Planned |
| Linkinator | Link health checking | Planned |

### 4.3 Royal Caribbean Experiences Data
**Status:** experiences.json only has 4 items; audit found 60+ missing

**Missing Categories:**
- Tastings & Pairing Classes (6+ items)
- Behind-the-Scenes Tours (4 items)
- Games & Competitions (15+ items)
- Sports & Fitness Events (6+ items)
- Enrichment & Classes (8+ items)
- Nightlife & Social Events (4+ items)
- Production Shows by Ship (major gap)

---

## Routine Maintenance Schedule

### Daily
- Review CI/CD status, fix any failures

### Weekly
- ICP-Lite validation: `node admin/validate-icp-lite-v14.js --all`
- Placeholder content check: `grep -r --include="*.html" "Unknown" .`
- Update unfinished tasks: `./admin/update-unfinished-tasks.sh`
- Review admin reports in `admin/reports/`

### Monthly
- Content length validation
- Persona coverage check: `node admin/validate-ship-page.js --all-ships 2>&1 | grep "persona"`
- WebP image audit: `python3 admin/webp_audit.py`
- Core Web Vitals monitoring
- Stale page audit (6+ months): See MAINTENANCE_TASKS.md Section 1.6

### Quarterly
- Vanilla stories audit
- Port disclaimer registry review

### Bi-Annually (April/October)
- Ship deployments update (seasonal changes + announcements)

### After Every Edit
- Update `last-reviewed` meta tag and `dateModified` JSON-LD (CRITICAL)
- Run page validator

### After Adding Pages
- Regenerate sitemap: `python3 admin/generate_sitemap.py`
- Regenerate search index: `python3 admin/generate_search_index.py`
- Discoverability check

---

## Validation Commands Reference

```bash
# Validate all ICP-Lite compliance
node admin/validate-icp-lite-v14.js --all

# Validate all ship pages
node admin/validate-ship-page.js --all-ships

# Validate all port pages
node admin/validate-port-page-v2.js

# Post-write validation
./admin/post-write-validate.sh <file>

# Find stale pages (6+ months old)
grep -r --include="*.html" 'name="last-reviewed"' . | \
  grep -E 'content="202[0-4]|content="2025-0[1-6]"' | \
  cut -d: -f1 | sort -u

# Check placeholder content
grep -r --include="*.html" "Unknown" . | grep -v node_modules

# WebP audit
python3 admin/webp_audit.py

# Generate sitemap
python3 admin/generate_sitemap.py

# Generate search index
python3 admin/generate_search_index.py
```

---

## Task Classification System

Tasks in UNFINISHED_TASKS.md use a lane system:

| Lane | Meaning | AI Role |
|------|---------|---------|
| **[G]** | AI-safe | Claude executes autonomously |
| **[Y]** | AI proposes | Claude drafts, human approves |
| **[R]** | Notes only | Claude documents, human decides |

**Protected Zones:**
- Files with `<!-- ai:guard -->` require human review
- Pastoral articles (grief, healing) are always Red

---

## Key Documentation References

| Document | Location | Purpose |
|----------|----------|---------|
| Maintenance Tasks | `MAINTENANCE_TASKS.md` | Routine maintenance guide |
| Unfinished Tasks | `admin/UNFINISHED-TASKS.md` | Current work backlog |
| Onboarding | `.claude/ONBOARDING.md` | System overview |
| ICP-Lite Protocol | `.claude/skills/standards/resources/icp-lite-protocol.md` | AI metadata spec |
| Ship Page Standards | `new-standards/foundation/SHIP_PAGE_STANDARDS_v3.007.010.md` | Template |
| Port Page Standards | `admin/PORT-PAGE-STANDARD.md` | Port template |
| Vanilla Stories | `admin/VANILLA-STORIES.md` | Story inventory |

---

## Recommended Next Actions

1. **Immediate:** Run `node admin/validate-ship-page.js --all-ships` to get current error counts
2. **This Week:** Focus on alt text fixes (261 files) - highest impact for accessibility
3. **This Month:** Begin persona coverage for top 10 most-visited ships
4. **Ongoing:** Update `last-reviewed` dates on every page edit

---

## Claude Code System Maintenance

The project includes a sophisticated Claude Code enhancement system that requires periodic maintenance.

### System Components

| Component | Count | Location |
|-----------|-------|----------|
| Skill Rules | 8 | `.claude/skill-rules.json` |
| Skills with Directories | 3 | `.claude/skills/` |
| Plugins | 5 | `.claude/plugins/` |
| Commands | 4 | `.claude/commands/` |
| Hooks | 3 | `.claude/hooks/` |

### Skills Overview

**Skills with Dedicated Directories:**
1. **standards** - Standards enforcement with theological foundation
2. **skill-developer** - Meta-skill for managing Claude Code skills
3. **frontend-dev-guidelines** - HTML/CSS/JS best practices

**Rule-Based Skill Triggers:**
4. **seo-optimizer** - Technical SEO with ITW-Lite guardrails
5. **accessibility-auditor** - WCAG AA compliance
6. **content-strategy** - Travel storytelling aligned with ITW-Lite
7. **performance-analyzer** - Core Web Vitals optimization
8. **ship-page-validator** - Auto-validates ship pages

### Hooks Configuration

Located in `.claude/settings.json`:

| Hook | Trigger | Purpose |
|------|---------|---------|
| skill-activation-prompt.sh | UserPromptSubmit | Loads skills based on context |
| post-tool-use-tracker.sh | PostToolUse (Edit/Write) | Tracks tool usage |
| ship-page-validator.sh | PostToolUse (Edit/Write) | Validates ship pages |

### ITW-Lite v3.010 Philosophy

Priority order for all decisions:
1. **AI-First** - Structure content for AI comprehension
2. **Human-First** - Never compromise user experience
3. **Google Second** - SEO is tertiary (bonus!)

### Skill System Maintenance Tasks

| Task | Frequency | Command |
|------|-----------|---------|
| Verify skill count | Monthly | `cat .claude/skill-rules.json \| jq '.skills \| keys'` |
| Check hooks | After issues | `ls -la .claude/hooks/` |
| Test validators | After standards changes | `./admin/post-write-validate.sh <file>` |
| Update skill rules | As needed | Edit `.claude/skill-rules.json` |

### Available Plugins (Agents)

**SEO Analysis & Monitoring:**
- seo-authority-builder
- seo-cannibalization-detector
- seo-content-refresher

**SEO Content Creation:**
- seo-content-auditor
- seo-content-planner
- seo-content-writer

**SEO Technical Optimization:**
- seo-keyword-strategist
- seo-meta-optimizer
- seo-snippet-hunter
- seo-structure-architect

**Accessibility Compliance:**
- ui-visual-validator

**Performance Testing:**
- performance-engineer
- test-automator

### Available Commands

| Command | Purpose |
|---------|---------|
| `/commit` | Commit helper with message formatting |
| `/create-pr` | Pull request creation |
| `/update-docs` | Documentation updater |
| `/add-to-changelog` | Changelog entry helper |

---

## Plan Files Reference

Active plan files in `.claude/`:

| Feature | Plan File | Status |
|---------|-----------|--------|
| Port Weather Guide | `plan-port-weather-guide.md` | 79% complete |
| Quiz V2 Expansion | `plan-quiz-v2-expansion.md` | Mostly complete |
| Quiz Edge Cases | `plan-quiz-edge-cases-and-improvements.md` | Critical bugs fixed |
| Affiliate Deployment | `plan-affiliate-deployment.md` | Phase 1 complete |
| Venue Audit | `plan-venue-audit.md` | Available |

---

## Summary Statistics

| Category | Total | Passing | Failing | Error Count |
|----------|-------|---------|---------|-------------|
| Ship Pages | 311 | 106 (34%) | 205 (66%) | 981 blocking |
| Port Pages | 380 | 89 (23%) | 291 (77%) | Unknown |
| ICP-Lite | 1,036 | 1,036 (100%) | 0 | 0 |
| Vanilla Stories | 157 ships | 0 | 157 | ~1,570 stories needed |

### Top 5 Immediate Actions

1. **Run full ship validation** to get current error counts
2. **Fix alt text issues** (261 files) - highest accessibility impact
3. **Expand FAQ sections** (255 files) - lowest effort, high impact
4. **Add missing navigation links** (250 files) - batch scriptable
5. **Update stale pages** - refresh pages with 6+ month old dates

---

*Soli Deo Gloria*
