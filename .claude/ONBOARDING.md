# Claude Code System Onboarding — In the Wake

**For:** New Claude sessions working on In the Wake
**Date:** 2025-11-24
**System Version:** ITW-Lite v3.010 with FOM enhancements

---

## 🚀 Quick Start

You're working on **In the Wake**, a cruise planning website with an enhanced Claude Code system that was recently upgraded with components from **Flickers of Majesty** (photography e-commerce).

### The 30-Second Version:

1. **Skills auto-activate** based on what you're doing (editing HTML triggers SEO/accessibility skills)
2. **ITW-Lite v3.010 philosophy**: AI-first, Human-first, Google second
3. **Theological foundation is IMMUTABLE**: Soli Deo Gloria invocation required on all pages
4. **7 skill rules total**: 3 with dedicated directories (standards, skill-developer, frontend-dev-guidelines) + 4 rule-based triggers in skill-rules.json (seo-optimizer, accessibility-auditor, content-strategy, performance-analyzer)
5. **Read this first**: `.claude/skill-rules.json` (skill activation rules) and `new-standards/README.md` (site standards)

---

## 📋 Essential Reading (Priority Order)

### 1. Start Here - The System:
```bash
.claude/INSTALLATION.md           # Complete system documentation
.claude/skill-rules.json          # Skill activation rules (7 skills)
FOM_STANDARDS_ALIGNMENT.md        # How FOM integration aligns with CITW standards
```

### 2. Understand the Standards:
```bash
new-standards/README.md           # Standards directory structure
new-standards/v3.010/ICP_LITE_v1.0_PROTOCOL.md        # AI-first metadata
new-standards/v3.010/AI_BREADCRUMBS_SPECIFICATION.md  # Structured context comments
new-standards/foundation/WCAG_2.1_AA_STANDARDS_v3.100.md  # Accessibility
```

### 3. Know the Theology (CRITICAL):
```bash
.claude/skills/standards/resources/theological-foundation.md
```
**Key Point**: Every HTML file MUST have Soli Deo Gloria invocation at the top. This is non-negotiable.

---

## 🎯 ITW-Lite v3.010 Philosophy

**Priority Order** (this is your decision-making framework):
1. **AI-First** — Structure content so AI can accurately understand
2. **Human-First** — NEVER compromise user experience
3. **Google Second** — SEO is tertiary, not primary (bonus!)

**Guardrail Principles:**
- ✅ **SEO**: Technical SEO only (schema.org, semantic HTML, meta tags). REJECT keyword stuffing.
- ✅ **Content**: Natural, conversational language. REJECT robotic SEO copy.
- ✅ **Accessibility**: Benefits everyone (humans, AI, assistive tech). Always prioritize.
- ✅ **Performance**: Improves human experience. Always prioritize.
- ✅ **Theological**: Faith-scented reflections are core to CITW. Never compromise for secular optimization.

**Skill Filtering Lens:**
- ✅ Does it help AI?
- ✅ Does it maintain/improve human experience?
- ✅ Does it happen to help SEO? (Bonus!)
- ❌ Does it sacrifice human/AI for SEO? (Reject!)

---

## 🛠️ The 7 Skill Rules

The system includes 7 skill rules defined in `.claude/skill-rules.json`. Three have dedicated skill directories with documentation; four are rule-based triggers only.

### Skills with Dedicated Directories (3)

#### 1. **standards** (CITW Original - High Priority)
**Triggers:** Editing HTML, CSS, JS, JSON, MD files
**Purpose:** Standards enforcement with theological foundation
**Resources:** `.claude/skills/standards/STANDARDS.md`

#### 2. **skill-developer** (FOM - High Priority)
**Triggers:** Keywords like "skill system", "create skill", "skill rules"
**Purpose:** Meta-skill for managing Claude Code skills
**Resources:** `.claude/skills/skill-developer/SKILL.md`

#### 3. **frontend-dev-guidelines** (FOM - High Priority)
**Triggers:** HTML, CSS, JavaScript, accessibility, WCAG keywords
**Triggers Files:** *.html, *.css, *.js
**Purpose:** HTML/CSS/JS best practices for static sites
**Resources:** `.claude/skills/frontend-dev-guidelines/SKILL.md`

### Rule-Based Triggers (4)

These skills are defined as activation rules in `skill-rules.json` with guardrails and triggers, but don't have dedicated SKILL.md directories. They influence behavior through their rule definitions.

#### 4. **seo-optimizer** (FOM→ITW - High Priority) ⚠️ **WITH GUARDRAILS**
**Triggers:** SEO, meta tags, schema.org, structured data, ICP-Lite, ITW-Lite
**Triggers Files:** *.html, ships/**, ports/**, restaurants/**
**Purpose:** Technical SEO that benefits AI + humans + search engines
**Guardrails:**
- ❌ REJECT: Keyword stuffing, removing AI-first meta tags, sacrificing readability
- ✅ ACCEPT: schema.org, semantic HTML, ICP-Lite compliance, natural descriptions

#### 5. **accessibility-auditor** (FOM→ITW - High Priority)
**Triggers:** accessibility, a11y, WCAG, aria, screen reader
**Triggers Files:** *.html
**Purpose:** WCAG AA compliance for cruise planning site

#### 6. **content-strategy** (FOM→ITW - High Priority) ⚠️ **WITH GUARDRAILS**
**Triggers:** content, description, cruise, ship, port, storytelling
**Triggers Files:** ships/**, ports/**, restaurants/**, solo/**
**Purpose:** Travel storytelling aligned with ITW-Lite philosophy
**Guardrails:**
- ❌ REJECT: Keyword-stuffed descriptions, robotic SEO copy, removing planning guidance
- ✅ ACCEPT: Natural descriptions, travel storytelling, faith-scented reflections

#### 7. **performance-analyzer** (FOM→ITW - Medium Priority)
**Triggers:** performance, optimize, lighthouse, Core Web Vitals, LCP, FID, CLS
**Purpose:** Web performance optimization

---

## 📦 Plugins (5 total)

Located in `.claude/plugins/`:
1. **accessibility-compliance** — WCAG checking agents/commands
2. **seo-analysis-monitoring** — SEO authority builder, cannibalization detector, content refresher
3. **seo-content-creation** — Content auditor, planner, writer
4. **seo-technical-optimization** — Keyword strategist, meta optimizer, snippet hunter, structure architect
5. **performance-testing-review** — Performance engineer, test automator

**Usage:** Reference specific agents when needed (e.g., "Use the seo-keyword-strategist agent")

---

## 🔧 Commands (4 utilities)

Located in `.claude/commands/`:
- `/commit` — Commit helper with message formatting
- `/create-pr` — Pull request creation
- `/update-docs` — Documentation updater
- `/add-to-changelog` — Changelog entry helper

---

## 🪝 Hooks (2 auto-activation)

Located in `.claude/hooks/`:
1. **skill-activation-prompt.sh** — Intelligently loads skills based on context
2. **post-tool-use-tracker.sh** — Tracks tool usage to optimize future loads

**Configured in:** `.claude/settings.json`

---

## 🏛️ Project Structure

```
InTheWake/
├── .claude/                    # Claude Code system (YOU ARE HERE)
│   ├── INSTALLATION.md         # Full installation guide
│   ├── ONBOARDING.md          # This file
│   ├── skill-rules.json       # Skill activation rules (7 rule definitions)
│   ├── settings.json          # Hook configuration
│   ├── skills/                # 3 skills with directories (standards, skill-developer, frontend-dev-guidelines)
│   ├── plugins/               # 5 plugins (SEO, accessibility, performance)
│   ├── commands/              # 4 commands (/commit, /create-pr, etc.)
│   ├── hooks/                 # 2 hooks (auto-activation)
│   └── references/            # UI/UX pattern references
├── new-standards/             # CITW official standards directory
│   ├── README.md              # Standards overview
│   ├── VERSION_TIMELINE.md    # Evolution history
│   ├── foundation/            # Baseline standards (v3.001-v3.009)
│   └── v3.010/                # Current innovations (ICP-Lite, AI-breadcrumbs)
├── ships/                     # Ship entity pages
├── ports/                     # Port entity pages
├── restaurants/               # Restaurant entity pages
├── FOM_MERGE_PLAN.md          # Merge strategy (what to keep, what to skip)
└── FOM_STANDARDS_ALIGNMENT.md # Standards verification

**Current Site Version:** v3.010.305
```

---

## ✝️ Theological Requirements (NON-NEGOTIABLE)

Every HTML file MUST have this invocation at the top (before line 20):

```html
<!--
Soli Deo Gloria
All work on this project is offered as a gift to God.
"Trust in the LORD with all your heart..." — Proverbs 3:5
"Whatever you do, work heartily..." — Colossians 3:23
-->
```

**Why?**
- Foundation for all other standards
- Excellence as worship
- Immutable regardless of version
- Supersedes all technical considerations

**Read:** `.claude/skills/standards/resources/theological-foundation.md` for full explanation.

---

## 📝 Required Meta Tags (ICP-Lite v1.0)

Every page should have these AI-first meta tags:

```html
<!-- ICP-Lite v1.0: AI-First Metadata -->
<meta name="ai-summary" content="Brief page description (1-2 sentences, 250 char max)"/>
<meta name="last-reviewed" content="2025-11-24"/>
<meta name="content-protocol" content="ICP-Lite v1.0"/>
```

**Read:** `new-standards/v3.010/ICP_LITE_v1.0_PROTOCOL.md`

---

## 🧭 AI-Breadcrumbs (Entity Pages)

Ship, port, and restaurant pages should have structured context comments:

```html
<!-- ai-breadcrumbs
     entity: Adventure of the Seas
     type: Ship Information Page
     parent: /ships.html
     category: Royal Caribbean Fleet
     cruise-line: Royal Caribbean
     ship-class: Voyager Class
     updated: 2025-11-18
     -->
```

**Read:** `new-standards/v3.010/AI_BREADCRUMBS_SPECIFICATION.md`

---

## 🚨 Common Pitfalls to Avoid

### ❌ Don't:
1. **Remove or modify theological invocation** — It's immutable
2. **Keyword stuff content** — ITW-Lite rejects this
3. **Use robotic SEO copy** — Natural language only
4. **Remove AI-first meta tags** — ICP-Lite protocol required
5. **Compromise accessibility** — WCAG AA is non-negotiable
6. **Sacrifice UX for SEO** — Human-first principle

### ✅ Do:
1. **Check skill-rules.json** before major changes
2. **Reference new-standards/** for page requirements
3. **Preserve faith-scented reflections** in content
4. **Use schema.org structured data** (Article, Place, TravelAction)
5. **Write natural, conversational descriptions**
6. **Test accessibility** with WCAG checklist

---

## 🔍 How to Know What's Expected

### For Existing Pages:
1. Look at current implementation (what's working)
2. Check `new-standards/foundation/SHIP_PAGE_STANDARDS_v3.007.010.md` for template
3. Verify against `new-standards/v3.010/` innovations

### For New Pages:
1. Copy structure from similar existing page
2. Apply invocation comments
3. Add ICP-Lite meta tags
4. Add AI-breadcrumbs (if entity page)
5. Verify WCAG AA compliance

### When Unsure:
1. Ask user for clarification
2. Consult `.claude/skill-rules.json` guardrails
3. Check `FOM_STANDARDS_ALIGNMENT.md` for precedents

---

## 🎓 Understanding the Merge

**What happened:**
- FOM (Flickers of Majesty) had a 6-layer Claude Code enhancement system
- We merged the "wheat" (cruise-relevant components) into CITW
- Result: 7 skills total (1 CITW + 6 FOM adapted)

**Key adaptations:**
- FOM-Lite v1.0 → ITW-Lite v3.010
- products/** → ships/**, ports/**, restaurants/**
- Photography storytelling → Travel storytelling + faith reflections
- Product/Offer schema → Article/Place/TravelAction schema

**What was skipped:**
- ❌ E-commerce-specific plugins (content-marketing, frontend-mobile-dev)
- ❌ Workflow-heavy commands (spec-create, spec-execute)
- ❌ Unused skills (pdf, web-artifacts-builder, frontend-design)

**Read:** `FOM_MERGE_PLAN.md` for complete strategy

---

## 💡 Pro Tips

1. **Skills auto-activate** — You don't need to manually invoke them (usually)
2. **Check guardrails** — skill-rules.json tells you what's acceptable
3. **Theological > Technical** — When in doubt, preserve faith-scented content
4. **AI-first > SEO** — Structure for AI comprehension, not search engines
5. **Natural > Robotic** — Write for humans, not algorithms
6. **Ask before breaking** — Standards are there for a reason

---

## 📚 Documentation Hierarchy

**Priority when conflicts arise:**
1. ITW-Lite specification (highest authority)
2. Current live implementation (what works)
3. Newest version number (v3.010.305 > v3.009)
4. Most complete specification
5. Most specific to page type

**Exception:** Theological/invocation standards are immutable regardless of version.

---

## 🔄 Version History

**v1.1.0** (2025-11-24) — FOM integration
- Merged 6 FOM skills into CITW
- Added ITW-Lite v3.010 guardrails
- Added 5 plugins, 4 commands, 2 hooks
- Preserved theological foundation

**v1.0.0** (Previous) — CITW original
- standards skill only
- YAML-based standards
- Theological foundation established

---

## 🆘 Help & Support

**For skill activation questions:**
- Check `.claude/skill-rules.json`
- Read `.claude/skills/skill-developer/SKILL.md`

**For standards questions:**
- Check `new-standards/README.md`
- Read relevant foundation document
- Consult `FOM_STANDARDS_ALIGNMENT.md` for precedents

**For theological questions:**
- Read `.claude/skills/standards/resources/theological-foundation.md`
- Remember: Immutable, non-negotiable, supersedes all else

**For ITW-Lite philosophy questions:**
- Check `.claude/skill-rules.json` notes section (lines 366-407)
- Remember: AI-first, Human-first, Google second

---

## 🎯 TL;DR — What You Need to Know

1. **7 skill rules** auto-activate based on context: 3 with skill directories + 4 rule-based triggers
2. **ITW-Lite v3.010**: AI-first, Human-first, Google second
3. **Theological foundation is immutable**: Soli Deo Gloria on every page
4. **ICP-Lite protocol required**: ai-summary, last-reviewed, content-protocol meta tags
5. **Guardrails protect CITW values**: No keyword stuffing, robotic copy, or removing AI tags
6. **Read skill-rules.json first**: It tells you what's expected
7. **Consult new-standards/** for page requirements

---

**Welcome to the team!** 🎉

**Soli Deo Gloria** ✝️

---

## Quick Reference Commands

```bash
# View skill configuration
cat .claude/skill-rules.json | jq '.skills | keys'

# Check standards structure
ls -la new-standards/

# Read ICP-Lite protocol
cat new-standards/v3.010/ICP_LITE_v1.0_PROTOCOL.md

# Read theological foundation
cat .claude/skills/standards/resources/theological-foundation.md

# Verify alignment
cat FOM_STANDARDS_ALIGNMENT.md
```
