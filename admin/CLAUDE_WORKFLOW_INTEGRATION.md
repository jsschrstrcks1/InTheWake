# Claude Workflow Integration

**Purpose**: Helper scripts for Claude to follow standards proactively during development.

## Overview

These scripts integrate standards enforcement directly into Claude's coding workflow:

1. **BEFORE writing code** → Review relevant standards
2. **AFTER writing code** → Validate compliance automatically

## Scripts

### Pre-Write Standards (`admin/pre-write-standards.sh`)

**When to use**: BEFORE modifying any files

**Purpose**:
- Re-familiarize Claude with project standards
- Show only relevant standards based on file types
- Remind about theological foundation and security requirements

**Usage**:
```bash
./admin/pre-write-standards.sh <file1> <file2> ...
```

**Example**:
```bash
./admin/pre-write-standards.sh index.html script.js styles.css
```

**Output**:
- Standards for detected file types (HTML, JS, CSS, JSON, MD)
- Universal standards (theology, security, philosophy)
- List of files to be modified with existence check

---

### Post-Write Validation (`admin/post-write-validate.sh`)

**When to use**: AFTER writing or modifying files

**Purpose**:
- Validate syntax, structure, and standards compliance
- Run ESLint on JavaScript files
- Check for debugging code (console.log, debugger)
- Verify HTML invocations and structure
- Validate JSON syntax with jq
- Check CSS accessibility features

**Usage**:
```bash
./admin/post-write-validate.sh <file1> <file2> ...
```

**Example**:
```bash
./admin/post-write-validate.sh index.html script.js
```

**Exit codes**:
- `0` = All checks passed (or only warnings)
- `1` = Errors found that must be fixed

**Validation checks**:

#### HTML
- ✅ Soli Deo Gloria invocation
- ✅ Scripture references (Proverbs 3:5, Colossians 3:23)
- ✅ DOCTYPE declaration
- ✅ Language attribute (lang="en")
- ✅ Viewport meta tag
- ✅ ICP-Lite meta tags (ai-summary, last-reviewed, content-protocol)
- ✅ Balanced div tags
- ❌ No console.log in HTML
- ❌ No debugger statements

#### JavaScript
- ✅ ESLint compliance (if available)
- ✅ Valid syntax (Node.js --check)
- ⚠️ Strict mode present
- ⚠️ No console.log (warning)
- ❌ No debugger statements (error)

#### CSS
- ⚠️ Focus styles present (:focus, :focus-visible)
- ⚠️ Reduced motion support (prefers-reduced-motion)
- ✅ Balanced braces

#### JSON
- ✅ Valid JSON syntax (with jq)

---

## Integration with Claude's Workflow

### Recommended Process

1. **User requests code changes**

2. **Claude runs pre-write script**:
   ```bash
   ./admin/pre-write-standards.sh <files-to-modify>
   ```
   - Reviews standards for file types
   - Reminds about requirements
   - Confirms files exist

3. **Claude writes/modifies code**
   - Follows displayed standards
   - Implements requested features
   - Applies security checklist

4. **Claude runs post-write validation**:
   ```bash
   ./admin/post-write-validate.sh <modified-files>
   ```
   - Validates all changes
   - Checks ESLint compliance
   - Verifies standards adherence

5. **Claude fixes any errors**
   - If validation fails, fix issues
   - Re-run validation until clean
   - Only then proceed to commit

6. **Git commit (if requested)**
   - Pre-commit hook shows standards again
   - Post-commit hook audits compliance
   - Reports generated automatically

---

## Example Workflow

```bash
# 1. User: "Fix the dropdown menu on index.html"

# 2. Claude reviews standards first:
./admin/pre-write-standards.sh index.html

# 3. Claude makes changes to index.html

# 4. Claude validates changes:
./admin/post-write-validate.sh index.html

# 5. If validation passes, changes are ready
# 6. If validation fails, fix issues and repeat step 4
```

---

## Benefits

### For Claude
- **Proactive compliance**: Standards checked before writing, not after
- **Immediate feedback**: Validation catches issues instantly
- **Reduced rework**: Fix issues before committing
- **Consistent quality**: Same checks every time

### For Project
- **Standards enforcement**: Automated, not manual
- **Code quality**: ESLint + syntax + standards
- **Theological integrity**: Invocations always checked
- **Accessibility**: WCAG compliance verified

### For User
- **Confidence**: Know standards are followed
- **Visibility**: See Claude following process
- **Quality**: Better code, fewer mistakes
- **Auditability**: All changes validated

---

## Technical Details

### ESLint Integration

The post-write script searches for ESLint in these locations:
1. System PATH (`which eslint`)
2. `/opt/node22/bin/eslint`
3. `node_modules/.bin/eslint`

If ESLint is not found, basic checks still run (console.log, debugger, syntax).

### Node.js Syntax Checking

If Node.js is available, JavaScript files are checked with:
```bash
node --check <file>
```

This catches syntax errors before runtime.

### JSON Validation

If `jq` is installed, JSON files are validated with:
```bash
jq empty <file>
```

If `jq` is not available, JSON validation is skipped with a warning.

---

## Relationship to Git Hooks

These helper scripts complement (not replace) the git hooks:

| Tool | When | Purpose | Blocking |
|------|------|---------|----------|
| **pre-write-standards.sh** | Before Claude writes code | Show standards | No |
| **post-write-validate.sh** | After Claude writes code | Validate changes | No (but should fix) |
| **pre-commit hook** | Before git commit | Remind + ESLint | Yes (user can cancel) |
| **post-commit hook** | After git commit | Audit + grade | No (informational) |

**Key difference**: Helper scripts are for Claude's development workflow, git hooks are for version control.

---

## Files Created

```
admin/
├── pre-write-standards.sh          # Show standards before writing
├── post-write-validate.sh          # Validate after writing
├── CLAUDE_WORKFLOW_INTEGRATION.md  # This documentation
├── HOOKS_INSTALLED.md              # Git hooks status
├── GIT_HOOKS_SYSTEM.md             # Git hooks documentation
└── reports/
    └── last-commit-audit.txt       # Latest audit report

.git/hooks/
├── pre-commit                      # Git pre-commit hook
└── post-commit                     # Git post-commit hook

.git/
└── commit-audits.log               # Append-only audit history
```

---

## Troubleshooting

### "Permission denied" error
```bash
chmod +x admin/pre-write-standards.sh admin/post-write-validate.sh
```

### ESLint not found
Install ESLint:
```bash
npm install -g eslint
```

Or use local ESLint:
```bash
npm install --save-dev eslint
```

### jq not found
Install jq for JSON validation:
```bash
# Ubuntu/Debian
sudo apt-get install jq

# macOS
brew install jq
```

### "File not found" during validation
Make sure you're validating files that exist and have been written/modified.

---

## Theological Foundation

> "Whatever you do, work heartily, as for the Lord and not for men."
> — Colossians 3:23

These scripts exist to honor God through excellence in software development. They enforce standards that reflect:

- **Excellence**: High-quality code worthy of offering to God
- **Integrity**: Consistent adherence to stated principles
- **Wisdom**: Accessibility, security, and best practices
- **Faithfulness**: Every file reflects our theological commitment

All work is offered *Soli Deo Gloria* — To God alone be the glory.

---

**Version**: 1.0.0
**Last Updated**: 2025-11-24
**Maintainer**: Claude Code Workflow System
