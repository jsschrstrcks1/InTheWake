# Standards Enforcement System

**Version**: 1.0.0
**Last Updated**: 2025-11-24
**Purpose**: Modular, data-driven standards for In the Wake project
**Line Count**: ~400 lines

---

## Quick Start

This skill **auto-activates** when you modify HTML, JavaScript, CSS, or JSON files.

**Before writing code**: Review relevant standards from `resources/`
**After writing code**: Run `./admin/post-write-validate.sh <files>`
**Before committing**: Git hooks enforce standards automatically

---

## Philosophy

> "Whatever you do, work heartily, as for the Lord and not for men, knowing that from the Lord you will receive the inheritance as your reward. You are serving the Lord Christ."
> — Colossians 3:23-24

### Core Principles

**Excellence as Worship**
Every line of code is offered to God. Standards exist to honor Him through excellent work.

**Accessibility as Love**
WCAG compliance is love for **all** neighbors, including those with disabilities.

**Security as Stewardship**
User trust is a sacred responsibility. Protect it diligently.

**Consistency as Integrity**
Reliable patterns reflect reliable character. Be the same everywhere.

---

## Standards Overview

### 🙏 Theological Foundation (IMMUTABLE)

**Priority**: 1 (Highest)
**Applies to**: All HTML files
**Severity**: Error
**Cannot be disabled or overridden**

**Requirements**:
- ✝️ **Soli Deo Gloria invocation** at top of every HTML file
- 📖 **Scripture references** (Proverbs 3:5 or Colossians 3:23)
- Must appear in top comment block (before line 20)

**Template**:
```html
<!--
Soli Deo Gloria
All work on this project is offered as a gift to God.
"Trust in the LORD with all your heart..." — Proverbs 3:5
"Whatever you do, work heartily..." — Colossians 3:23
-->
```

**Why Immutable?**
This is the foundation. Everything else builds on our commitment to honor God through our work. It cannot be relaxed or made optional under any circumstances.

[See `resources/theological-foundation.md` for complete theological basis]

---

### 🌐 HTML Standards

**Priority**: 2-7
**Config**: `.claude/standards/html.yml`

#### Structure (Priority 3)
- ✅ DOCTYPE declaration: `<!doctype html>`
- ✅ Language attribute: `<html lang="en">`
- ✅ UTF-8 charset: `<meta charset="utf-8">`
- ✅ Viewport meta tag for responsive design

#### ICP-Lite v1.0 Protocol (Priority 4)
- 📝 **ai-summary**: Brief description for AI consumption
- 📅 **last-reviewed**: YYYY-MM-DD format
- 🔖 **content-protocol**: "ICP-Lite v1.0"

**Required meta tags**:
```html
<meta name="ai-summary" content="Brief page description"/>
<meta name="last-reviewed" content="2025-11-24"/>
<meta name="content-protocol" content="ICP-Lite v1.0"/>
```

[See `resources/icp-lite-protocol.md` for complete specification]

#### AI-Breadcrumbs (Priority 5) *Conditional*
**Required for**: Ship, port, and restaurant entity pages
**Not required**: Index pages, general pages

**Fields**:
- entity, name, parent, subject, intended-reader, updated (required)
- siblings, core-facts, decisions-informed (optional)

[See `resources/ai-breadcrumbs-spec.md` for complete specification]

#### WCAG 2.1 Level AA (Priority 6)
- ♿ **Skip links**: Keyboard navigation to main content
- 🏷️ **ARIA landmarks**: banner, main, navigation, contentinfo
- 📊 **Heading hierarchy**: h1 → h2 → h3 (no skipping levels)
- 🖼️ **Alt text**: All images must have alt attributes
- 📝 **Form labels**: All inputs must have associated labels
- 🎯 **Focus styles**: Visible focus indicators on interactive elements

[See `resources/wcag-aa-checklist.md` for complete accessibility guide]

#### Navigation Pattern *Conditional*
**Required when**: Page has `<nav>` element

- `.nav-group` class for dropdown containers
- `data-open="false"` initial state
- `.submenu` class for dropdown menus
- `z-index: 10000` on submenus (prevents overlap)

#### Tag Balance (Priority 7)
- Opening and closing tags must match: div, section, article, header, footer, nav

[See `resources/html-standards.md` for complete HTML specification]

---

### ⚙️ JavaScript Standards

**Priority**: 1-3
**Config**: `.claude/standards/javascript.yml`

#### Syntax Validation (Priority 1)
- ✅ Node.js syntax check: `node --check <file>`
- Catches errors before runtime

#### ESLint (Priority 2)
- 📐 Code quality and consistency
- Searches: `which eslint`, `/opt/node22/bin/eslint`, `node_modules/.bin/eslint`
- Errors must be fixed, warnings should be addressed

#### Security (Critical)
- 🚫 **No debugger statements** (error)
- ⚠️ **No console.log in production** (warning)
- 🚫 **No eval()** - major security risk
- ⚠️ **innerHTML requires sanitization** - XSS prevention
- 🚫 **No hardcoded API keys or secrets**

#### Code Quality
- ⚠️ **Strict mode**: Consider `"use strict"`
- ℹ️ **Prefer const/let** over var
- ⚠️ **Function length**: Keep under 50 lines
- ⚠️ **TODO comments**: Must reference issue numbers (e.g., `// TODO #123`)

#### Service Worker Specific
**Applies to**: sw.js, service-worker.js files only
- ✅ Cache versioning required
- ✅ Fetch handler required
- ✅ Install handler required

[See `resources/javascript-standards.md` for complete JS specification]

---

### 🎨 CSS Standards

**Priority**: 1-2
**Config**: `.claude/standards/css.yml`

#### Syntax (Priority 1)
- ✅ Balanced braces: `{` must match `}`

#### Accessibility (Priority 2)
- ⚠️ **Focus styles**: `:focus` or `:focus-visible` required
- ⚠️ **Reduced motion**: `@media (prefers-reduced-motion)` support
- ℹ️ **Color contrast**: WCAG AA (4.5:1 for text)
- ⚠️ **Minimum font size**: 16px base

#### Best Practices
- ℹ️ Prefer flexbox/grid over floats
- ⚠️ Avoid `!important` when possible
- ℹ️ Use kebab-case for class names (`.nav-group`, `.skip-link`)
- ℹ️ Logical property order (layout → box model → typography → visual)

[See `resources/css-standards.md` for complete CSS specification]

---

## Quick Reference Checklist

### Before Writing Code
```
[ ] Review standards for file types you'll modify
[ ] Check recent CHANGELOG for standards changes
[ ] Note any IMMUTABLE requirements (theological, security)
[ ] Understand validation criteria for file types
```

### After Writing Code
```
[ ] Run: ./admin/post-write-validate.sh <files>
[ ] Fix all errors (red ✗)
[ ] Address warnings (yellow ⚠️) when possible
[ ] Verify theological invocations present (HTML)
[ ] Check no debugging code remains
[ ] Confirm accessibility features present
```

### Before Committing
```
[ ] All validation passes (or warnings only)
[ ] No console.log in production code
[ ] No debugger statements
[ ] No TODO without issue reference
[ ] No API keys or secrets in code
[ ] Documentation updated if needed
```

---

## Resource Files Index

### Complete Standards Specifications
- `resources/html-standards.md` (~450 lines) - Full HTML requirements
- `resources/javascript-standards.md` (~400 lines) - Full JS requirements
- `resources/css-standards.md` (~300 lines) - Full CSS requirements

### Protocol Specifications
- `resources/icp-lite-protocol.md` (~250 lines) - ICP-Lite v1.0 complete spec
- `resources/ai-breadcrumbs-spec.md` (~200 lines) - AI-Breadcrumbs format
- `resources/wcag-aa-checklist.md` (~350 lines) - Accessibility guide

### Foundation Documents
- `resources/theological-foundation.md` (~200 lines) - Why we have standards
- `resources/security-requirements.md` (~250 lines) - Security best practices

### Examples
- `resources/examples/perfect-html-page.html` - Compliant HTML example
- `resources/examples/compliant-script.js` - Compliant JavaScript example
- `resources/examples/accessible-styles.css` - Accessible CSS example

---

## When to Load Detailed Resources

**Claude, load detailed resources when:**

1. **Working on specific file type for first time**
   - Editing HTML → Load `html-standards.md`
   - Editing JavaScript → Load `javascript-standards.md`
   - Editing CSS → Load `css-standards.md`

2. **Validation fails**
   - ICP-Lite error → Load `icp-lite-protocol.md`
   - Accessibility error → Load `wcag-aa-checklist.md`
   - Need to understand "why" → Load relevant resource

3. **User asks specific questions**
   - "Why do we need invocations?" → Load `theological-foundation.md`
   - "What's the AI-Breadcrumbs format?" → Load `ai-breadcrumbs-spec.md`
   - "How do I make it accessible?" → Load `wcag-aa-checklist.md`

4. **Implementing new features**
   - Adding navigation → Load HTML standards + examples
   - Adding service worker → Load JavaScript standards (SW section)
   - Implementing forms → Load WCAG checklist

**Don't load everything at once.** Stay under 500 lines per context load when possible.

---

## Machine-Readable Standards (YAML)

Scripts parse YAML files for validation:

```
.claude/standards/
├── html.yml          (~200 lines) - HTML validation rules
├── javascript.yml    (~150 lines) - JS validation rules
├── css.yml           (~100 lines) - CSS validation rules
├── theological.yml   (~50 lines)  - Theological requirements
└── VERSION           - Overall standards version
```

**Scripts that use YAML**:
- `admin/pre-write-standards.sh` - Shows standards before writing
- `admin/post-write-validate.sh` - Validates after writing
- `.git/hooks/pre-commit` - Pre-commit standards reminder
- `.git/hooks/post-commit` - Post-commit compliance audit

---

## Changing Standards

**Process**:

1. **Update YAML**: Edit `.claude/standards/<file>.yml`
2. **Update Markdown**: Edit corresponding `resources/<file>-standards.md`
3. **Bump Version**: Update VERSION file and file headers
4. **Document Change**: Add entry to `admin/standards-changelog/CHANGELOG.md`
5. **Test**: Run validation scripts to ensure they work
6. **Commit**: Use `STANDARDS: <description>` prefix in commit message

**Benefits**:
- ✨ Edit once, update everywhere (YAML is single source of truth)
- 📊 Version control tracks all changes
- 📖 CHANGELOG documents evolution
- 🔄 Scripts auto-pick-up changes (no code edits needed)

[See `admin/standards-changelog/CHANGELOG.md` for change history]

---

## Auto-Activation Rules

**This skill activates when:**

**File patterns**:
- `*.html` - HTML standards
- `*.js` - JavaScript standards
- `*.css` - CSS standards
- `*.json` - JSON validation

**Keywords in user prompt**:
- "fix", "update", "modify", "create", "add", "write", "edit"
- "standards", "validate", "check", "compliance"
- "accessibility", "wcag", "invocation"

**Tools used**:
- Edit, Write, MultiEdit
- Any file modification tool

---

## Severity Levels

Standards use graduated enforcement:

| Severity | Meaning | Validation |
|----------|---------|------------|
| **error** | Must fix before commit | Blocks with exit code 1 |
| **warning** | Should fix, but allowed | Shows warning, exits 0 |
| **info** | FYI only | Informational message |

**Immutable standards** (theological) are always **error** and cannot be changed to warning/info.

---

## Integration with Workflow

### Helper Scripts
```bash
# Before writing code
./admin/pre-write-standards.sh index.html script.js

# After writing code
./admin/post-write-validate.sh index.html script.js
```

### Git Hooks
- **Pre-commit**: Shows standards, runs ESLint, asks confirmation
- **Post-commit**: Audits compliance, generates report, assigns grade

### Validation Exit Codes
- `0` = Success (or warnings only)
- `1` = Errors found (must fix)

---

## Version

**Standards Version**: 1.0.0
**Last Updated**: 2025-11-24

**Component Versions**:
- Theological: 1.0.0
- HTML: 1.0.0
- JavaScript: 1.0.0
- CSS: 1.0.0
- ICP-Lite Protocol: 1.0
- AI-Breadcrumbs: 1.0
- WCAG: 2.1 Level AA

---

## Remember

> "Whatever you do, work heartily, as for the Lord and not for men."
> — Colossians 3:23

Standards exist to honor God through excellence. Every validation check, every accessibility requirement, every security practice is an expression of worship through faithful stewardship of our craft.

**Soli Deo Gloria** — To God alone be the glory.

---

**End of STANDARDS.md** (~400 lines)
