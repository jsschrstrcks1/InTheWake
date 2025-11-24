# Git Hooks System Documentation

**Created:** 2025-11-23
**Purpose:** Automated standards reminder and compliance auditing
**Location:** `.git/hooks/`

---

## Overview

In the Wake uses a two-phase Git hooks system to maintain code quality and standards compliance:

1. **Pre-commit Hook** - Shows relevant standards BEFORE you commit
2. **Post-commit Hook** - Audits compliance AFTER you commit

This ensures you know what standards apply, and provides immediate feedback on how well you followed them.

---

## Pre-commit Hook

**File:** `.git/hooks/pre-commit`
**When it runs:** Before commit is finalized (blocking)
**Purpose:** Remind you of relevant standards

### What It Does

1. **Detects file types** being committed (HTML, JS, CSS, JSON, etc.)
2. **Shows relevant standards** from `/new-standards/` directory
3. **Highlights key requirements** for each file type
4. **Runs ESLint** on JavaScript files (blocking if errors found)
5. **Asks for confirmation** before proceeding

### Standards Shown By File Type

**HTML Files:**
- Invocation requirements (Soli Deo Gloria + Scripture)
- ICP-Lite v1.0 protocol (ai-summary, last-reviewed, content-protocol)
- AI-breadcrumbs specification
- WCAG 2.1 AA accessibility
- Unified modular standards

**JavaScript Files:**
- ESLint configuration requirements
- Code quality standards (strict mode, quotes, indentation)
- Service worker standards (if sw.js modified)

**CSS Files:**
- WCAG 2.1 AA contrast requirements
- Accessibility (focus-visible, reduced-motion)
- Responsive design requirements

**JSON Data Files:**
- Data contract standards
- Version field requirements
- Validation requirements

**Standards Files:**
- Documentation requirements
- Version numbering
- Markdown formatting

**Universal (Always Shown):**
- Commit message format
- Theological commitment (work as for the Lord)
- No secrets/credentials
- No debugging code

### Example Output

```
═══════════════════════════════════════════════════════
📋 PRE-COMMIT STANDARDS REMINDER
═══════════════════════════════════════════════════════

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 HTML FILES DETECTED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📖 Invocation Requirements (Non-negotiable)
   Standard: new-standards/foundation/SHIP_PAGE_STANDARDS_v3.007.010.md

   Required HTML Comment (top of every file):
   <!--
   Soli Deo Gloria
   All work on this project is offered as a gift to God.
   "Trust in the LORD with all your heart..." — Proverbs 3:5
   "Whatever you do, work heartily..." — Colossians 3:23
   -->

   This is IMMUTABLE and supersedes all technical considerations.

[... more standards ...]

═══════════════════════════════════════════════════════
📝 FILES TO BE COMMITTED
═══════════════════════════════════════════════════════

   ships/rcl/wonder-of-the-seas.html
   assets/js/ships-dynamic.js

Have you reviewed the standards above? (y/N):
```

### Bypassing the Hook

```bash
# Emergency bypass (not recommended)
git commit --no-verify -m "Emergency fix"
```

---

## Post-commit Hook

**File:** `.git/hooks/post-commit`
**When it runs:** After commit is created (non-blocking)
**Purpose:** Audit compliance with standards

### What It Does

1. **Extracts commit info** (hash, author, date, message)
2. **Categorizes committed files**
3. **Runs compliance checks** against relevant standards
4. **Generates compliance report** with pass/fail status
5. **Calculates compliance rate** and assigns grade
6. **Logs audit results** to file
7. **Runs full ESLint scan** for overall code quality status

### Compliance Checks

**HTML Files:**
- ✅ Invocation comment present (CRITICAL)
- ✅ Proverbs 3:5 included (CRITICAL)
- ✅ Colossians 3:23 included (CRITICAL)
- ⚠️ ICP-Lite meta tags (ai-summary, last-reviewed, content-protocol)
- ⚠️ AI-breadcrumbs comment
- ✅ DOCTYPE declaration (CRITICAL)
- ✅ Language attribute (CRITICAL)
- ✅ Viewport meta tag (CRITICAL)
- ⚠️ Canonical URL
- ⚠️ Skip link present
- ⚠️ Version number documented
- ⚠️ Ship pages: JSON-LD schema, data attributes

**JavaScript Files:**
- ⚠️ 'use strict' mode
- ⚠️ No console.log statements
- ✅ No debugger statements (CRITICAL)
- ✅ ESLint: No errors (CRITICAL)
- ⚠️ ESLint: Warnings under control (<10)

**Service Worker:**
- ✅ Invocation comment (CRITICAL)
- ✅ Version number defined (CRITICAL)
- ✅ Install event listener (CRITICAL)
- ✅ Activate event listener (CRITICAL)
- ✅ Fetch event listener (CRITICAL)
- ⚠️ Cache versioning strategy
- ⚠️ Skip waiting implemented

**JSON Data Files:**
- ✅ Valid JSON syntax (CRITICAL)
- ⚠️ Version field present
- ⚠️ File size reasonable (<512KB)

**Commit Message:**
- ⚠️ Commit type prefix (FEAT/FIX/DOCS/etc)
- ⚠️ Descriptive message (>10 chars)
- ⚠️ Soli Deo Gloria in commit body

**Legend:**
- ✅ = CRITICAL (errors, must fix)
- ⚠️ = WARNING (important, should fix)

### Example Output

```
═══════════════════════════════════════════════════════
🔬 POST-COMMIT COMPLIANCE AUDIT
═══════════════════════════════════════════════════════

Commit: e7b7bba8
Author: Claude
Date: 2025-11-23
Message: FEAT: Add Wonder of the Seas ship page

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 HTML FILES AUDIT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📄 ships/rcl/wonder-of-the-seas.html
   ✅ Invocation comment present
   ✅ Proverbs 3:5 included
   ✅ Colossians 3:23 included
   ✅ ICP-Lite: ai-summary meta tag
   ✅ ICP-Lite: last-reviewed meta tag
   ✅ ICP-Lite: content-protocol meta tag
   ✅ AI-breadcrumbs comment present
   ✅ DOCTYPE declaration
   ✅ Language attribute (lang="en")
   ✅ Viewport meta tag
   ✅ Canonical URL
   ⚠️ Skip link present
   ✅ Version number documented
   ✅ Ship page: JSON-LD schema
   ✅ Ship page: data-cruise-line attribute

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 OVERALL CODE QUALITY STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Running full ESLint scan...
   Linting errors: 1
   Linting warnings: 73

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📈 COMPLIANCE SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   Total checks: 18
   ✅ Passed: 17
   ❌ Failed: 0
   ⚠️ Warnings: 1

   Compliance rate: 94%

   Grade: A (Very Good)

═══════════════════════════════════════════════════════
📋 AUDIT COMPLETE
═══════════════════════════════════════════════════════

   Detailed report: admin/reports/last-commit-audit.txt
   Audit log: .git/commit-audits.log

   'Whatever you do, work heartily, as for the Lord'
   - Colossians 3:23
```

### Grading Scale

| Compliance Rate | Grade | Meaning |
|-----------------|-------|---------|
| 95%+ | A+ | Excellent ⭐ |
| 90-94% | A | Very Good |
| 80-89% | B | Good |
| 70-79% | C | Acceptable |
| <70% | D | Needs Improvement |

### Output Files

**Audit log:** `.git/commit-audits.log`
- Append-only log of all commit audits
- Format: `[timestamp] commit_hash: compliance% (passed/total), failures`
- Used for tracking compliance trends over time

**Latest audit:** `admin/reports/last-commit-audit.txt`
- Detailed report of most recent commit
- Includes all checks, files, and results
- Can be referenced for fixing issues

---

## How the System Works Together

### Workflow

```
1. You: git add <files>
2. You: git commit -m "message"
3. Pre-commit hook runs:
   ├─ Analyzes staged files
   ├─ Shows relevant standards
   ├─ Runs ESLint checks
   ├─ Asks for confirmation
   └─ Blocks if errors found
4. You: Confirm or fix issues
5. Commit is created
6. Post-commit hook runs:
   ├─ Audits committed files
   ├─ Checks standards compliance
   ├─ Calculates grade
   ├─ Generates reports
   └─ Shows summary
7. You: Review audit, fix any issues in next commit
```

### Philosophy

**Pre-commit:** "Here's what you should be doing"
- Guidance before you commit
- Prevents obvious mistakes
- Blocking (can cancel commit)

**Post-commit:** "Here's how well you did"
- Audit after you commit
- Provides feedback
- Non-blocking (doesn't cancel commit)

### Why Both?

- **Pre-commit alone:** Can be bypassed with `--no-verify`
- **Post-commit alone:** No prevention, only detection
- **Together:** Education + validation + feedback

---

## Configuration

### Modifying Standards Shown

Edit `.git/hooks/pre-commit`:
```bash
# Add new file type detection
STAGED_PYTHON=$(echo "$STAGED_FILES" | grep '\.py$' || true)

# Add new standards section
if [ -n "$STAGED_PYTHON" ]; then
  show_standard "Python Standards" \
    "new-standards/PYTHON_STANDARDS.md" \
    "$(cat << 'EOF'
   Python requirements here...
EOF
)"
fi
```

### Modifying Compliance Checks

Edit `.git/hooks/post-commit`:
```bash
# Add new check
check_requirement "Your new requirement" \
  "your_test_command" \
  "error"  # or "warning"
```

### Adjusting Strictness

In `.git/hooks/pre-commit`:
```bash
# Remove confirmation prompt (auto-proceed)
# Delete these lines:
read -p "Have you reviewed the standards above? (y/N): " -n 1 -r
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  exit 1
fi
```

In `.git/hooks/post-commit`:
```bash
# Change severity levels
check_requirement "ICP-Lite meta tags" \
  "..." \
  "error"  # Changed from "warning" to "error"
```

---

## Troubleshooting

### Pre-commit hook not running

```bash
# Check if file exists and is executable
ls -l .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit

# Test manually
.git/hooks/pre-commit
```

### Post-commit hook not running

```bash
# Check if file exists and is executable
ls -l .git/hooks/post-commit
chmod +x .git/hooks/post-commit

# Test manually
.git/hooks/post-commit
```

### ESLint command not found

```bash
# Check ESLint path
which eslint

# Update path in hooks
# Change: /opt/node22/bin/eslint
# To: /path/to/your/eslint
```

### jq command not found (for JSON validation)

```bash
# Install jq
# macOS: brew install jq
# Ubuntu: apt-get install jq

# Or disable JSON checks
# Comment out JSON audit section in post-commit hook
```

### Hook is too slow

```bash
# Reduce checks in post-commit hook
# Comment out non-critical checks
# Skip full ESLint scan for large codebases
```

---

## Best Practices

### ✅ Do's

1. **Read the standards** shown in pre-commit
2. **Review the audit** after every commit
3. **Fix critical failures** (❌) before pushing
4. **Aim for A+ grade** (95%+) on important commits
5. **Check audit log** periodically for trends

### ❌ Don'ts

1. **Don't bypass with --no-verify** (except emergencies)
2. **Don't ignore critical failures** (❌)
3. **Don't commit debugging code** (console.log, debugger)
4. **Don't commit without invocation comments**
5. **Don't skip reading standards** (just hit 'y')

---

## Integration with CI/CD

These hooks are **local only** (`.git/hooks/` not version controlled).

For team collaboration, consider:
1. **Husky** - Share hooks via npm
2. **GitHub Actions** - CI validation
3. **Pre-commit framework** - Python-based hook manager

**Recommended:** Keep hooks local for now, add CI later.

---

## Future Enhancements

### Planned Features

1. **Trend analysis** - Track compliance over time
2. **HTML validation** - Check HTML5 validity
3. **Link checking** - Verify internal/external links
4. **Image optimization** - Check image sizes
5. **Accessibility testing** - Run automated a11y checks
6. **Performance budgets** - Check file sizes, bundle sizes

### Integration Opportunities

- **Slack/Discord notifications** - Post audit results
- **Dashboard** - Web UI for viewing audits
- **Git blame integration** - Show who broke standards
- **Auto-fix** - Automatically fix common issues

---

## Related Documentation

- **ESLint Configuration:** `/eslint.config.js`
- **Standards Directory:** `/new-standards/`
- **Lint Report:** `/admin/reports/CODE_LINT_REPORT.md`
- **Standards Guide:** `/admin/claude/STANDARDS_GUIDE.md`

---

## Theological Commitment

These hooks exist to help us:
- Work "heartily, as for the Lord" (Colossians 3:23)
- Maintain excellence as stewardship
- Honor God through quality code
- Remember our commitments (invocation)

Every commit is a gift to God. These hooks help ensure that gift is excellent.

---

**Soli Deo Gloria** ✝️

**Created:** 2025-11-23
**Version:** 1.0
**Maintainer:** Claude / In the Wake team
