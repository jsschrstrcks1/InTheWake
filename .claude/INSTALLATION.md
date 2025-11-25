# Claude Code Enhancement Installation - In the Wake

**Project:** In the Wake (Cruise Planning)
**Date:** 2025-11-24
**Protocol:** ITW-Lite v3.010 (adapted from FOM-Lite v1.0)
**Source:** Merged from Flickers of Majesty

---

## Installation Summary

This document details the enhanced Claude Code system installed on this repository, adapted from the 6-layer FOM system for cruise content.

### Installed Components

**Total Skills:** 7 (1 CITW original + 6 FOM adapted)
**Total Plugins:** 5 (cruise-relevant only)
**Total Commands:** 4 (workflow utilities)
**Total Hooks:** 2 (auto-activation system)
**Configuration Files:** 2 (skill-rules.json, settings.json)

---

## Architecture Overview

### Layer 1: Foundation (Auto-Activation System)

**Components:**
- `.claude/hooks/skill-activation-prompt.sh` - Intelligently loads skills based on context
- `.claude/hooks/post-tool-use-tracker.sh` - Tracks tool usage to optimize future loads
- `.claude/settings.json` - Hook configuration
- `.claude/skill-rules.json` - Skill activation rules (customized for cruise content)

**Skills Included:**
- `skill-developer` - Meta-skill for creating and managing Claude Code skills
- `frontend-dev-guidelines` - HTML/CSS/JavaScript best practices for static sites
- `standards` (CITW original) - Standards enforcement system

**Purpose:** Provides auto-activation system for intelligent skill loading

---

### Layer 2: Domain Skills

**Skills Installed:**

1. **standards** (CITW Original)
   - Standards enforcement system with theological foundation
   - YAML-based standards (css.yml, html.yml, javascript.yml, theological.yml)
   - ICP-Lite / ITW-Lite protocol compliance

2. **seo-optimizer** (FOM Adapted → ITW-Lite)
   - SEO optimization with ITW-Lite guardrails
   - Technical SEO focus (schema.org, semantic HTML, meta tags)
   - Cruise-specific schema: Article, Place, TravelAction
   - REJECTS: Keyword stuffing, readability compromises, AI-hostile practices

3. **accessibility-auditor** (FOM Adapted)
   - WCAG AA compliance checking
   - Cruise accessibility considerations
   - Screen reader, keyboard navigation, color contrast

4. **content-strategy** (FOM Adapted → Cruise Content)
   - Travel storytelling over marketing-speak
   - Planning guidance sections
   - Faith-scented reflections when appropriate
   - Natural, conversational descriptions

5. **performance-analyzer** (FOM Adapted)
   - Core Web Vitals optimization
   - Image optimization for ship/port photos
   - LCP, FID, CLS monitoring

**Purpose:** Domain-specific expertise for cruise planning site development

---

### Layer 3: Granular Plugins (Cruise-Relevant)

**Plugins Installed:**

1. **accessibility-compliance** - WCAG AA compliance agents/commands
2. **seo-analysis-monitoring** - SEO monitoring and analysis
3. **seo-content-creation** - SEO-optimized content creation
4. **seo-technical-optimization** - Technical SEO optimization
5. **performance-testing-review** - Performance testing and review

**Why These Plugins:**
- SEO is critical for cruise planning discoverability
- Accessibility ensures broad audience reach
- Performance affects user experience

**Plugins NOT Included:**
- ❌ content-marketing (too e-commerce focused)
- ❌ frontend-mobile-development (not needed)
- ❌ code-documentation (optional, skipped)

**Purpose:** Token-optimized, specialized plugins for cruise content

---

### Layer 4: Workflow Utilities

**Commands Installed:**
- `/commit` - Commit helper with message formatting
- `/create-pr` - Pull request creation
- `/update-docs` - Documentation updater
- `/add-to-changelog` - Changelog entry helper

**Commands NOT Included:**
- ❌ `/spec-create`, `/spec-execute` (too workflow-heavy)

**Purpose:** Community-curated utilities for common tasks

---

### Layer 5: UI/UX Pattern References

**References Installed:**
- `.claude/references/ui-patterns/accessibility/` - ARIA implementation
- `.claude/references/ui-patterns/responsive/` - Mobile-first layouts
- `.claude/references/ui-patterns/web-development/` - CSS architecture
- Plus: animation, components, ui-design, ux-research

**Purpose:** Reference library for common UI/UX tasks

**Usage:** Point Claude to specific patterns when needed

---

## Skill Activation Rules

The `.claude/skill-rules.json` has been customized for cruise planning with **ITW-Lite v3.010 guardrails**:

### Active Skills (7 Total):

1. **standards** (Critical Priority) - CITW Original
   - Triggers: Code file modifications, HTML/CSS/JS editing
   - Files: *.html, *.css, *.js, *.json, *.md
   - Purpose: Standards enforcement with theological foundation

2. **skill-developer** (High Priority) - FOM Adapted
   - Triggers: "skill system", "create skill", "skill rules"
   - Purpose: Meta-skill for managing Claude Code skills

3. **frontend-dev-guidelines** (High Priority) - FOM Adapted
   - Triggers: HTML, CSS, JavaScript, accessibility, WCAG
   - Files: *.html, *.css, *.js
   - Purpose: HTML/CSS/JS best practices

4. **seo-optimizer** (High Priority) ⚠️ **WITH ITW-LITE GUARDRAILS**
   - Triggers: SEO, meta tags, schema.org, structured data
   - Files: *.html, ships/**, ports/**, restaurants/**
   - Purpose: SEO optimization that supports ITW-Lite philosophy
   - **Guardrails:**
     - ✅ Technical SEO (schema.org, semantic HTML, meta tags)
     - ✅ AI-first meta tags (ai:summary, content-protocol)
     - ❌ Keyword stuffing
     - ❌ Compromising readability
     - ❌ Removing AI-helpful elements

5. **accessibility-auditor** (High Priority) - FOM Adapted
   - Triggers: accessibility, a11y, WCAG, aria, screen reader
   - Files: *.html
   - Purpose: WCAG AA compliance

6. **content-strategy** (High Priority) ⚠️ **WITH ITW-LITE GUARDRAILS**
   - Triggers: content, description, cruise, ship, port, storytelling
   - Files: ships/**, ports/**, restaurants/**, solo/**
   - Purpose: Travel storytelling aligned with ITW-Lite philosophy
   - **Guardrails:**
     - ✅ Natural, conversational descriptions
     - ✅ Travel storytelling
     - ✅ Faith-scented reflections
     - ❌ Keyword-stuffed descriptions
     - ❌ Robotic, SEO-optimized copy

7. **performance-analyzer** (Medium Priority) - FOM Adapted
   - Triggers: performance, optimize, lighthouse, Core Web Vitals
   - Purpose: Web performance optimization

---

## ITW-Lite v3.010 Philosophy

**Adapted from FOM-Lite v1.0 for cruise content**

### Priority Order:

1. **AI-First:** Structure content so AI can accurately understand
2. **Human-First:** NEVER compromise user experience
3. **Google Second:** SEO is tertiary, not primary

### Guardrail Principles:

**SEO:**
- Focus on technical SEO (schema.org, semantic HTML, meta tags)
- Benefits AI + humans + search engines simultaneously
- REJECT keyword stuffing, readability compromises, removal of AI-helpful elements

**Content:**
- Prioritize authentic, natural language for humans
- Maintain AI comprehension through structure
- REJECT robotic, keyword-optimized copy

**Accessibility:**
- Benefits all audiences (humans, AI, assistive tech, search engines)
- Always prioritize

**Performance:**
- Improves human experience and supports all other goals
- Always prioritize

**Theological:**
- Faith-scented reflections are core to CITW identity
- NEVER compromise theological foundation for secular optimization

### Skill Filtering:

All skill suggestions must pass through ITW-Lite lens:
- ✅ Does it help AI?
- ✅ Does it maintain/improve human experience?
- ✅ Does it happen to help SEO? (Bonus!)
- ❌ Does it sacrifice human/AI for SEO? (Reject!)

---

## Adaptations from FOM

### Path Changes:
- `products/**` → `ships/**`, `ports/**`, `restaurants/**`
- `categories/**` → `cruise-lines/**`, `tools/**`

### Schema Changes:
- `Product`, `Offer` → `Article`, `Place`, `TravelAction`
- E-commerce keywords → Cruise keywords

### Content Strategy Changes:
- Product descriptions → Ship/port/restaurant descriptions
- Photography storytelling → Travel storytelling
- Fit-guidance → Planning guidance

---

## Usage

### Skill Activation:

Skills auto-activate based on:
1. **File triggers** - Editing specific file types/paths
2. **Keyword triggers** - Using specific words in prompts
3. **Intent patterns** - Natural language intent recognition

### Manual Skill Invocation:

Use the Skill tool when needed:
```
Skill: "skill-developer"
Skill: "seo-optimizer"
Skill: "accessibility-auditor"
```

### Using Commands:

```bash
/commit "Your commit message"
/create-pr "PR title" "PR description"
/update-docs
/add-to-changelog "New feature description"
```

### Using Plugins:

Plugins are referenced by skills automatically. Access plugin agents:
```
Agent: "seo-keyword-strategist"
Agent: "seo-content-writer"
Agent: "accessibility-validator"
```

---

## Verification

To verify installation:

```bash
# Check skills
ls -la .claude/skills/

# Check plugins
ls -la .claude/plugins/

# Check commands
ls -la .claude/commands/

# Check hooks
ls -la .claude/hooks/

# Verify configuration
cat .claude/skill-rules.json | jq '.skills | keys'
```

Expected output: 7 skills (standards, skill-developer, frontend-dev-guidelines, seo-optimizer, accessibility-auditor, content-strategy, performance-analyzer)

---

## Maintenance

### Adding New Skills:
1. Use `/skill-developer` skill for guidance
2. Add skill definition to `.claude/skill-rules.json`
3. Create skill directory in `.claude/skills/`
4. Test activation triggers

### Modifying Guardrails:
1. Edit `.claude/skill-rules.json`
2. Update skill `guardrails` sections
3. Test with sample content

### Updating Hooks:
1. Edit `.claude/hooks/*.sh` scripts
2. Test hook execution
3. Check `.claude/settings.json` configuration

---

## Support

**Documentation:**
- FOM Merge Plan: `/FOM_MERGE_PLAN.md`
- Skill Rules: `/.claude/skill-rules.json`
- ITW-Lite Philosophy: Embedded in skill-rules.json notes section

**Issues:**
- File bug reports with skill activation issues
- Include trigger keywords and expected vs actual behavior
- Reference ITW-Lite philosophy when reporting guardrail violations

---

## Version History

**v1.1.0** (2025-11-24)
- Initial merge of FOM enhancements into CITW
- 7 skills total (1 CITW + 6 FOM adapted)
- ITW-Lite v3.010 philosophy implemented
- Cruise-specific path and schema adaptations

**v1.0.0** (Previous)
- CITW original standards skill
- YAML-based standards
- Theological foundation
