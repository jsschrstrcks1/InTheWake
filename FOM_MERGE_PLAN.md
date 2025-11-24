# FOM → CITW Claude Code Merge Plan

**Date:** 2025-11-24
**Approach:** Superset merge - Keep all CITW, add relevant FOM, adapt for cruise content

---

## Current CITW Setup

**Skills:** 1 (standards)
**YAML Standards:** 4 (css.yml, html.yml, javascript.yml, theological.yml)
**Validation Scripts:** Referenced in skill-rules.json

---

## FOM Components (6-Layer System)

### Layer 1: Foundation
- `skill-developer` - Meta-skill for managing skills
- `frontend-dev-guidelines` - HTML/CSS/JS best practices
- Hooks: `skill-activation-prompt.sh`, `post-tool-use-tracker.sh`
- `settings.json`, `skill-rules.json`

### Layer 2: Anthropic Skills
- `skill-creator` - Skill creation patterns
- `web-artifacts-builder` - Web component generation
- `frontend-design` - Frontend design patterns
- `pdf` - PDF generation

### Layer 3: Granular Plugins (8 total)
1. `accessibility-compliance` - WCAG AA compliance
2. `content-marketing` - Content strategy
3. `seo-analysis-monitoring` - SEO monitoring
4. `seo-content-creation` - SEO content
5. `seo-technical-optimization` - Technical SEO
6. `frontend-mobile-development` - Mobile frontend
7. `code-documentation` - Docs generation
8. `performance-testing-review` - Performance testing

### Layer 4: Workflow Automation
- `/spec-create`, `/spec-execute` commands
- `spec-config.json`, task templates

### Layer 5: UI/UX References
- Accessibility, responsive, ui-design, components, animation, ux-research, web-development patterns

### Layer 6: Utilities
- `/add-to-changelog`, `/update-docs`, `/create-pr`, `/commit` commands

---

## Merge Strategy: The Wheat

### ✅ KEEP - Cruise-Relevant Components

#### Skills (6 new + 1 existing = 7 total)
1. **standards** (existing CITW) - Keep as-is
2. **skill-developer** (FOM) - Meta-skill for managing skills
3. **frontend-dev-guidelines** (FOM) - HTML/CSS/JS best practices
4. **seo-optimizer** (FOM) - Adapt FOM-Lite → ITW-Lite v3.010
5. **accessibility-auditor** (FOM) - WCAG AA compliance
6. **content-strategy** (FOM) - Adapt for cruise content
7. **performance-analyzer** (FOM) - Core Web Vitals

#### Plugins (5 relevant)
1. **accessibility-compliance** - WCAG checks
2. **seo-analysis-monitoring** - SEO monitoring
3. **seo-content-creation** - Content creation
4. **seo-technical-optimization** - Technical SEO
5. **performance-testing-review** - Performance testing

#### Commands (4 utilities)
1. **commit** - Commit helper
2. **create-pr** - PR creation
3. **update-docs** - Docs updater
4. **add-to-changelog** - Changelog helper

#### Hooks (2)
1. **skill-activation-prompt.sh** - Smart skill loading
2. **post-tool-use-tracker.sh** - Tool usage tracking

#### References (3 categories)
1. **accessibility** - ARIA implementation
2. **responsive** - Mobile-first layouts
3. **web-development** - CSS architecture

#### Configuration
- Merge `settings.json` with CITW hooks
- Merge `skill-rules.json` (7 skills total)

---

### ❌ SKIP - Not Cruise-Relevant

#### Skills
- ❌ `pdf` - Not needed for cruise site
- ❌ `web-artifacts-builder` - Not needed
- ❌ `frontend-design` - CITW has own design
- ❌ `skill-creator` - Use skill-developer instead

#### Plugins
- ❌ `content-marketing` - Too e-commerce focused
- ❌ `frontend-mobile-development` - Not needed
- ❌ `code-documentation` - Optional, skip for now

#### Workflow
- ❌ `spec-create`, `spec-execute` - Too workflow-heavy
- ❌ `spec-config.json` - Not needed

#### References
- ❌ `animation`, `components`, `ux-research` - Not needed now

---

## Adaptations Required

### FOM-Lite → ITW-Lite v3.010

**Philosophy stays the same:**
- AI-first: Structure for AI comprehension
- Human-first: Never compromise UX
- Google second: SEO is tertiary

**Path adaptations:**
- `products/**` → `ships/**`, `ports/**`, `restaurants/**`
- `categories/**` → `cruise-lines/**`, `tools/**`

**Schema adaptations:**
- `Product`, `Offer` → `Article`, `Place`, `TravelAction`
- E-commerce keywords → cruise keywords

**Content strategy adaptations:**
- Product descriptions → Ship/port/restaurant descriptions
- Photography storytelling → Travel storytelling
- Fit-guidance → Planning guidance

**Skill triggers adaptations:**
- Remove "product", "e-commerce", "photography"
- Add "cruise", "ship", "port", "travel", "planning"

---

## Implementation Order

1. ✅ Merge `skill-rules.json` (add 6 FOM skills to existing 1)
2. ✅ Copy FOM skills to `.claude/skills/`
3. ✅ Copy cruise-relevant plugins to `.claude/plugins/`
4. ✅ Copy workflow commands to `.claude/commands/`
5. ✅ Copy UI references to `.claude/references/`
6. ✅ Merge `settings.json` (add FOM hooks)
7. ✅ Copy hooks to `.claude/hooks/`
8. ✅ Test skill activation
9. ✅ Commit all changes

---

## Expected Result

**CITW will have:**
- 7 skills (1 existing + 6 adapted from FOM)
- 5 plugins (SEO, accessibility, performance)
- 4 commands (utilities)
- 2 hooks (auto-activation)
- 3 reference categories
- ITW-Lite v3.010 protocol (adapted from FOM-Lite)
- All existing CITW customizations preserved

**Benefits:**
- Enhanced SEO optimization with guardrails
- Accessibility compliance checking
- Performance monitoring
- Content strategy guidance
- Workflow utilities
- Smart skill auto-activation
