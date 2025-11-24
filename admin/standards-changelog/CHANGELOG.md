# Standards Changelog

All notable changes to the standards system will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2025-11-24

### Added - Initial Release

**Modular Standards System**:
- Created YAML-based standards configuration (single source of truth)
- Created skill-based documentation (human-readable standards)
- Implemented auto-activation via skill-rules.json

**YAML Standards** (`.claude/standards/`):
- `theological.yml` - Immutable theological requirements
- `html.yml` - Complete HTML validation rules
- `javascript.yml` - JavaScript quality and security standards
- `css.yml` - CSS accessibility and best practices
- `VERSION` - Standards version tracking

**Skill Documentation** (`.claude/skills/standards/`):
- `STANDARDS.md` (~400 lines) - Main overview, always loaded first
- `resources/theological-foundation.md` (~200 lines) - Why we have standards
- `resources/security-requirements.md` (~250 lines) - Comprehensive security guide
- `resources/icp-lite-protocol.md` (~250 lines) - ICP-Lite v1.0 specification
- `resources/ai-breadcrumbs-spec.md` (~200 lines) - AI-Breadcrumbs format
- `resources/examples/perfect-html-page.html` - Reference implementation

**Auto-Activation**:
- Created `.claude/skill-rules.json` configuration
- File pattern triggers: `*.html`, `*.js`, `*.css`, `*.json`, `*.md`
- Keyword triggers: "fix", "update", "modify", "create", etc.
- Tool triggers: Edit, Write, MultiEdit

**Theological Foundation**:
- **Soli Deo Gloria** invocation required (IMMUTABLE)
- Scripture references required (Proverbs 3:5, Colossians 3:23)
- Cannot be disabled or relaxed under any circumstances

**HTML Standards**:
- DOCTYPE, language, charset, viewport (required)
- ICP-Lite v1.0 Protocol (ai-summary, last-reviewed, content-protocol)
- AI-Breadcrumbs for entity pages (conditional)
- WCAG 2.1 Level AA accessibility
- Navigation pattern (.nav-group, data-open, .submenu with z-index: 10000)
- Tag balance checking

**JavaScript Standards**:
- Node.js syntax validation
- ESLint integration
- Security checks (no eval, sanitize innerHTML, no hardcoded secrets)
- No debugging code (console.log warning, debugger error)
- Code quality guidelines

**CSS Standards**:
- Balanced braces
- Focus styles required (:focus, :focus-visible)
- Reduced motion support (@media prefers-reduced-motion)
- Accessibility best practices

**Benefits**:
- ✨ Single source of truth (YAML) for validation rules
- 📚 Modular documentation (<500 lines per file)
- 🤖 Auto-activation when editing relevant files
- 📖 Context-aware resource loading
- 🔄 Easy standards evolution (edit YAML, scripts auto-update)

### Philosophy

> "Whatever you do, work heartily, as for the Lord and not for men."
> — Colossians 3:23

Standards exist to honor God through excellence in software development.

---

## How to Use This Changelog

### When Standards Change

1. **Document the change here** under a new version header
2. **Explain what changed** and why
3. **Provide migration guidance** if needed
4. **Link to related files** that were updated

### Version Numbering

- **Major (X.0.0)**: Breaking changes (old code incompatible)
- **Minor (1.X.0)**: New features (backward compatible)
- **Patch (1.0.X)**: Bug fixes, clarifications

### Example Future Entry

```markdown
## [1.1.0] - 2025-12-15

### Added
- New `ai-audience` field to ICP-Lite protocol
- Specifies intended audience (general/technical/specialized)

### Changed
- Updated `icp-lite-protocol.md` with new field specification
- Updated `.claude/standards/html.yml` with new meta tag check

### Migration
Add to all HTML files:
<meta name="ai-audience" content="general"/>

### Rationale
Helps AI tailor content summarization to appropriate audience level.
```

---

## [1.1.0] - 2025-11-24

### Added - Phase 2: YAML-Driven Validation

**YAML-Driven Scripts**:
- Completely rewrote `pre-write-standards.sh` to parse YAML standards dynamically
- Completely rewrote `post-write-validate.sh` to execute checks from YAML config
- Backed up v1 scripts as `.bak` files for reference
- Scripts now use `yq` to read standards from `.claude/standards/*.yml`

**Dynamic Validation**:
- Checks are executed based on YAML configuration, not hardcoded logic
- Check types: `grep`, `grep_multi`, `count_balance`, `command`
- Severity levels: `error` (must fix), `warning` (should fix), `info` (FYI)
- Priority levels: Defines execution order
- Exit codes: 0 (success/warnings), 1 (errors found)

**Additional Example Files**:
- `compliant-script.js` (~350 lines) - Complete JavaScript example
  - Demonstrates: strict mode, no console.log, accessibility, error handling
  - Shows: dropdown navigation, form validation, debouncing, security
  - Includes: comprehensive comments explaining standards
- `accessible-styles.css` (~350 lines) - Complete CSS example
  - Demonstrates: focus-visible styles, reduced motion, WCAG contrast
  - Shows: responsive design, logical property order, utility classes
  - Includes: comprehensive variable system, print styles

**Benefits**:
- ✨ Edit YAML once → Scripts update everywhere (true single source of truth)
- 🔄 Add new checks without modifying script logic
- 📊 Change severity/priority levels in YAML config
- 🎯 Consistent validation across all tools
- 🧪 Easier to test (YAML is data, not code)

**Example: Adding a New Check**:
```yaml
# In .claude/standards/html.yml
new_check:
  required: true
  severity: warning
  check:
    type: "grep"
    pattern: '<meta name="new-tag"'
  description: "New meta tag should be present"
```

Scripts automatically enforce this check. No code changes needed!

### Changed

**Script Behavior**:
- Pre-write script now shows standards based on YAML config
- Post-write script dynamically executes checks from YAML
- Both scripts detect check types and execute appropriate logic
- Error counting and reporting improved

**Developer Experience**:
- Standards changes are now instantaneous (edit YAML, done)
- No need to hunt through bash code
- Clear separation: data (YAML) vs. logic (scripts)
- Version control shows exactly what standard changed

### Technical Details

**YAML Parser**:
- Using `yq` (jq-style syntax)
- Tested with `.version`, nested properties, keys iteration
- Handles complex nested structures

**Check Type Implementations**:
- `grep`: Simple pattern matching
- `grep_multi`: Multiple patterns with OR logic
- `count_balance`: Tag/brace balancing
- `command`: Execute shell commands for validation

**Error Handling**:
- Scripts use `set +e` to collect all errors
- Separate counters for errors vs. warnings
- Final summary with counts and recommendations

---

## [Unreleased]

### Planned
- Complete `html-standards.md` (~450 lines) - Detailed HTML specification
- Complete `javascript-standards.md` (~400 lines) - Detailed JS specification
- Complete `css-standards.md` (~300 lines) - Detailed CSS specification
- Complete `wcag-aa-checklist.md` (~350 lines) - Accessibility guide
- Additional example files (compliant-script.js, accessible-styles.css)
- Update validation scripts to parse YAML instead of hardcoded checks
- Integration testing with real codebase

---

**Soli Deo Gloria** — To God alone be the glory.
