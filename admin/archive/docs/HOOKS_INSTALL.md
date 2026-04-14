# Git Hooks Installation Guide

**Purpose**: Automatically validate ICP-Lite v1.4 compliance at commit time

---

## Installed Hooks

### 1. Pre-commit Hook (Blocking)

**Location**: `.git/hooks/pre-commit`
**Runs**: Before commit is created
**Action**: Validates all staged HTML files for ICP-Lite v1.4 compliance
**Behavior**: **BLOCKS** commit if validation fails

**What it checks:**
- Protocol version = "ICP-Lite v1.4"
- Dual-cap summary rule (max 250 chars, first 155 standalone)
- JSON-LD mirroring (description = ai-summary, dateModified = last-reviewed)
- mainEntity on entity pages
- No duplicate meta tags or JSON-LD blocks

**Bypass** (not recommended):
```bash
git commit --no-verify
```

### 2. Post-commit Hook (Non-blocking)

**Location**: `.git/hooks/post-commit`
**Runs**: After commit is created
**Action**: Generates compliance report for committed files
**Behavior**: Reports issues but never blocks

**Output:**
- Compliance summary (X/Y files compliant)
- Logs to `.git/icp-lite-audit.log`
- Suggests running full validator if issues found

---

## Installation

The hooks are already installed in this repository at:
- `.git/hooks/pre-commit`
- `.git/hooks/post-commit`

Both hooks are executable and ready to use.

---

## Testing

### Test pre-commit hook:

```bash
# Make a change to an HTML file
echo " " >> index.html

# Stage the file
git add index.html

# Try to commit (hook will run)
git commit -m "Test commit"

# If validation fails, you'll see errors
# If validation passes, commit proceeds
```

### Test post-commit hook:

After a successful commit with HTML files, you'll see:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Post-commit ICP-Lite v1.4 Compliance Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Commit: abc1234
Date: 2025-12-25 15:39:00
...
```

---

## Requirements

**Required:**
- Node.js (v18+)
- `admin/validate-icp-lite-v14.js` exists
- `admin/node_modules/` installed (`cd admin && npm install`)

**Without Node.js:**
Hooks will display warnings and skip validation (graceful degradation)

---

## Hook Behavior

### Pre-commit Flow:

1. Git detects staged files
2. Hook filters for `.html` files
3. If none → skip validation
4. If found → run `node admin/validate-icp-lite-v14.js <file>`
5. If errors → **BLOCK commit** with error message
6. If pass → allow commit

### Post-commit Flow:

1. Git detects committed files
2. Hook filters for `.html` files
3. If none → skip report
4. If found → generate compliance summary
5. Log results to `.git/icp-lite-audit.log`
6. **Never blocks** (informational only)

---

## Troubleshooting

### Hook doesn't run:

```bash
# Check if hook is executable
ls -l .git/hooks/pre-commit

# Should show: -rwxr-xr-x (executable)

# Make executable if needed
chmod +x .git/hooks/pre-commit
chmod +x .git/hooks/post-commit
```

### Validation fails unexpectedly:

```bash
# Run validator manually to see detailed errors
node admin/validate-icp-lite-v14.js <file>

# Or validate all files
node admin/validate-icp-lite-v14.js --all
```

### Need to bypass once:

```bash
# Use --no-verify flag (use sparingly!)
git commit --no-verify -m "Emergency fix"
```

---

## Audit Log

Compliance history is logged to:
```
.git/icp-lite-audit.log
```

Example entry:
```
[2025-12-25 15:39:00] abc1234: 5/5 files compliant
[2025-12-25 16:22:15] def5678: 3/4 files compliant
```

View recent audits:
```bash
tail -10 .git/icp-lite-audit.log
```

---

## Uninstallation

To disable hooks:
```bash
# Remove or rename hooks
rm .git/hooks/pre-commit
rm .git/hooks/post-commit

# Or make non-executable
chmod -x .git/hooks/pre-commit
chmod -x .git/hooks/post-commit
```

---

## Integration with CI/CD

These local hooks complement (not replace) CI validation:
- **Local hooks**: Fast feedback before push
- **GitHub Actions**: Authoritative validation on PR/merge

Both use the same validator → consistent results

---

**Soli Deo Gloria** ✝️
