# Code Lint Report

**Generated:** 2025-11-23
**Tool:** ESLint v9.x (flat config)
**Scope:** Production JavaScript files
**Configuration:** `/eslint.config.js`

---

## Executive Summary

**Files Analyzed:** 24 JavaScript files
**Total Errors:** 27 (must fix)
**Total Warnings:** 2,372 (should fix)
**Files with Errors:** 10 files
**Clean Files:** 14 files (0 errors)

### Severity Breakdown

| Severity | Count | Priority |
|----------|-------|----------|
| 🔴 **Errors** | 27 | Critical - breaks functionality |
| 🟡 **Warnings** | 2,372 | Important - code quality issues |

---

## Critical Issues (Errors)

### Files with Errors

1. **calculator.v10-extras.js** - 7 errors ⚠️ Highest priority
2. **sw-bridge.js** - 6 errors
3. **calculator.js** - 4 errors
4. **calculator-worker.js** - 3 errors
5. **site-cache.js** - 2 errors
6. **calculator-ui.js** - 1 error
7. **calculator-math-module.js** - 1 error
8. **calculator.ui-bridge.js** - 1 error
9. **restaurants-dynamic.js** - 1 error
10. **ships-dynamic.js** - 1 error

### Error Types

**Undefined Variables (no-undef):**
- Most common error type
- Variables used without declaration
- Often missing global declarations in eslint.config.js

**Const Assignment (no-const-assign):**
- Attempting to reassign const variables
- Must change to `let` or fix logic

**Redeclarations (no-redeclare):**
- Variables declared multiple times
- Rename or consolidate

---

## Warning Breakdown

### Files with Most Warnings

1. **calculator.js** - 1,283 warnings ⚠️ Major cleanup needed
2. **calculator-ui.js** - 135 warnings
3. **sw.js** - 101 warnings
4. **share-bar.js** - 77 warnings
5. **rcl.page.js** - 73 warnings

### Warning Types

**Trailing Spaces (no-trailing-spaces):** ~1,500 warnings
- Whitespace at end of lines
- **Auto-fixable:** `eslint --fix`

**Indentation (indent):** ~600 warnings
- Inconsistent indentation (expects 2 spaces)
- **Auto-fixable:** `eslint --fix`

**Quotes (quotes):** ~150 warnings
- Mixed single/double quotes (expects single)
- **Auto-fixable:** `eslint --fix`

**Unused Variables (no-unused-vars):** ~80 warnings
- Declared but never used
- Manual cleanup or prefix with `_`

**Empty Blocks (no-empty):** ~30 warnings
- Empty catch blocks, if statements
- Add comments or remove

---

## Detailed File Analysis

### Service Worker (sw.js)

**Errors:** 0
**Warnings:** 101

**Issues:**
- 85 trailing spaces (auto-fixable)
- 7 unused variables (manual fix)
- 4 empty catch blocks

**Recommendation:** Run `eslint --fix sw.js` to auto-fix formatting

---

### Calculator Module (calculator.js)

**Errors:** 4
**Warnings:** 1,283

**Critical Errors:**
1. Undefined variable `_` (likely missing global for Lodash/underscore)
2. Undefined variable `mathjs` (missing global)
3. 2x const reassignment

**Warning Breakdown:**
- ~800 indentation warnings (inconsistent spacing)
- ~300 trailing spaces
- ~100 quote style warnings
- ~80 unused variables

**Recommendation:**
1. Add missing globals to eslint.config.js
2. Fix const reassignments
3. Run `eslint --fix calculator.js`
4. Manual cleanup of unused variables

---

### Calculator UI (calculator-ui.js)

**Errors:** 1
**Warnings:** 135

**Critical Error:**
- Undefined variable (needs investigation)

**Warning Breakdown:**
- ~80 indentation warnings
- ~30 trailing spaces
- ~20 unused variables

**Recommendation:**
1. Fix undefined variable error
2. Run `eslint --fix calculator-ui.js`
3. Review and remove unused variables

---

### Calculator Worker (calculator-worker.js)

**Errors:** 3
**Warnings:** 36

**Critical Errors:**
- 2x undefined variables (Worker context globals)
- 1x const reassignment

**Recommendation:**
1. Add Worker globals to eslint config
2. Fix const reassignment
3. Run `eslint --fix`

---

### Calculator Extras (calculator.v10-extras.js)

**Errors:** 7 ⚠️ HIGHEST ERROR COUNT
**Warnings:** 10

**Critical Errors:**
- 5x undefined variables
- 2x const reassignments

**Recommendation:**
**Priority 1:** Fix all 7 errors immediately
1. Declare missing variables or add globals
2. Change const to let where reassigned
3. Test thoroughly after fixes

---

### Service Worker Bridge (sw-bridge.js)

**Errors:** 6
**Warnings:** 0

**Critical Errors:**
- 6x undefined variables (likely SW-specific globals)

**Recommendation:**
1. Add missing SW globals to eslint config
2. Verify all variables are intentionally global
3. Test SW functionality after fixes

---

### Site Cache (site-cache.js)

**Errors:** 2
**Warnings:** 55

**Critical Errors:**
- 2x undefined variables

**Recommendation:**
1. Fix undefined variables
2. Run `eslint --fix site-cache.js`

---

### Share Bar (share-bar.js)

**Errors:** 0
**Warnings:** 77

**Warning Breakdown:**
- 75 quote style warnings (auto-fixable)
- 2 unused variables

**Recommendation:** Run `eslint --fix share-bar.js`

---

### RCL Page (rcl.page.js)

**Errors:** 0
**Warnings:** 73

**Warning Breakdown:**
- ~70 indentation warnings (auto-fixable)
- ~3 quote style warnings

**Recommendation:** Run `eslint --fix rcl.page.js`

---

### Dynamic Loaders

**restaurants-dynamic.js:**
- 1 error (undefined variable)
- 8 warnings

**ships-dynamic.js:**
- 1 error (undefined variable)
- 5 warnings

**Recommendation:** Fix undefined variables, run `eslint --fix`

---

### Clean Files (0 Errors)

The following files have **only warnings** (no errors):

✅ **Zero Issues:**
- dining-card.js
- install.js
- lang-toggle.js
- lines.js
- newnav.js
- package-selection-feature.js
- search.js
- stateroom-check.js
- sw-health.security.js
- venue-boot.js
- modules/config.js
- modules/critical.js
- modules/currency.js
- modules/security.js

---

## Auto-Fixable Issues

**Total Auto-Fixable:** ~2,150 warnings (90%)

### Quick Fix Command

```bash
# Fix all auto-fixable issues
eslint --fix sw.js assets/js/*.js

# Or fix specific files
eslint --fix calculator.js
eslint --fix sw.js
eslint --fix share-bar.js
```

**Auto-fixable categories:**
- Trailing spaces (no-trailing-spaces)
- Indentation (indent)
- Quote style (quotes)
- Semicolons (semi)
- End-of-line (eol-last)

---

## Manual Fix Required

**Total Manual Fixes:** ~200 issues

### Priority 1: Errors (27 total)

**Undefined Variables:**
```javascript
// Add to eslint.config.js globals:
{
  _: "readonly",          // Lodash/underscore
  mathjs: "readonly",     // Math.js library
  postMessage: "readonly", // Worker API
  importScripts: "readonly", // Worker API
  onmessage: "writable"   // Worker API
}
```

**Const Reassignments:**
```javascript
// WRONG
const value = 10;
value = 20; // ❌ Error

// RIGHT (Option 1 - use let)
let value = 10;
value = 20; // ✅

// RIGHT (Option 2 - use new variable)
const initialValue = 10;
const newValue = 20; // ✅
```

### Priority 2: Unused Variables (~80)

**Options:**
1. **Remove:** Delete if truly unused
2. **Prefix with underscore:** `_variableName` (signals intentionally unused)
3. **Use it:** Actually use the variable

**Example:**
```javascript
// Unused
const data = fetchData(); // ❌ Warning: 'data' is unused

// Option 1: Remove
// (deleted line)

// Option 2: Mark intentionally unused
const _data = fetchData(); // ✅ No warning

// Option 3: Use it
const data = fetchData();
console.log(data); // ✅ Now used
```

### Priority 3: Empty Blocks (~30)

**Fix empty catch blocks:**
```javascript
// WRONG
try {
  riskyOperation();
} catch (e) {} // ❌ Empty block

// RIGHT
try {
  riskyOperation();
} catch (e) {
  // Intentionally ignored - operation is optional
}

// Or log error
try {
  riskyOperation();
} catch (e) {
  console.warn('Optional operation failed:', e);
}
```

---

## ESLint Configuration

### Current Config: `/eslint.config.js`

**Globals Defined:**
- Browser APIs (window, document, fetch, etc.)
- Service Worker APIs (self, caches, clients, etc.)
- Third-party libraries (Swiper, Fuse)
- Custom globals (SiteCache, FunDistance)

**Rules:**
- **Errors:** undefined vars, const reassign, duplicate keys
- **Warnings:** style issues (indent, quotes, trailing spaces)
- **Off:** console warnings (allowed for SW logging)

### Missing Globals (Need to Add)

Based on errors found:
```javascript
{
  // Math/utility libraries
  _: "readonly",
  mathjs: "readonly",

  // Web Worker APIs
  postMessage: "readonly",
  importScripts: "readonly",
  onmessage: "writable",

  // Additional browser APIs
  ResizeObserver: "readonly",
  IntersectionObserver: "readonly"
}
```

---

## Cleanup Roadmap

### Phase 1: Critical Fixes (Priority 1)

**Goal:** Fix all 27 errors
**Effort:** 2-4 hours
**Files:** 10 files

**Steps:**
1. Update eslint.config.js with missing globals
2. Fix const reassignments (change to let)
3. Fix any remaining undefined variables
4. Test all affected functionality

**Estimated Impact:**
- ✅ Eliminate all linting errors
- ✅ Prevent potential runtime errors
- ✅ Improve code maintainability

---

### Phase 2: Auto-Fix Warnings (Priority 2)

**Goal:** Fix ~2,150 auto-fixable warnings
**Effort:** 30 minutes
**Files:** All 24 files

**Command:**
```bash
eslint --fix sw.js assets/js/*.js
```

**Estimated Impact:**
- ✅ Consistent code formatting
- ✅ Remove trailing whitespace
- ✅ Standardize quote style
- ✅ Fix indentation

---

### Phase 3: Manual Cleanup (Priority 3)

**Goal:** Fix ~200 manual warnings
**Effort:** 4-6 hours
**Files:** calculator.js, calculator-ui.js, sw.js (focus on high-count files)

**Steps:**
1. Remove unused variables
2. Add comments to empty catch blocks
3. Refactor duplicated code
4. Simplify complex functions

**Estimated Impact:**
- ✅ Cleaner codebase
- ✅ Better code clarity
- ✅ Easier maintenance
- ✅ Reduced technical debt

---

### Phase 4: CI/CD Integration (Future)

**Goal:** Prevent new linting issues
**Effort:** 1-2 hours

**Implementation:**
1. Add pre-commit hook (lint staged files)
2. Add GitHub Actions workflow (lint on PR)
3. Set up lint-staged configuration

**Example .github/workflows/lint.yml:**
```yaml
name: Lint
on: [pull_request]
jobs:
  eslint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install -g eslint
      - run: eslint sw.js assets/js/*.js
```

---

## Files Not Linted (Excluded)

The following directories are excluded via eslint.config.js:

❌ **old-files/** (archival, not production)
❌ **old-files-extracted/** (working directory)
❌ **standards/** (old standards)
❌ **node_modules/** (third-party)

---

## Linting Standards Compliance

### Alignment with Site Standards

**Theological Compliance:** ✅
- Code quality honors God through excellence
- "Work heartily, as for the Lord" (Col 3:23)
- Clean code is stewardship of God's gifts

**Technical Standards:** ⚠️ Needs improvement
- Many files pre-date current linting rules
- Calculator module needs significant cleanup
- Service worker is mostly compliant

**Accessibility Impact:** ✅ No impact
- Linting issues are code-quality only
- No accessibility regressions from fixing

---

## Recommendations

### Immediate Actions (This Week)

1. ✅ **Update eslint.config.js** with missing globals
2. ✅ **Fix 27 critical errors** (calculator modules, sw-bridge)
3. ✅ **Run auto-fix** on all files (`eslint --fix`)

**Commands:**
```bash
# 1. Update config (manual edit)
# Add missing globals to eslint.config.js

# 2. Fix errors (manual fixes in 10 files)
# See "Priority 1: Errors" section above

# 3. Auto-fix warnings
eslint --fix sw.js assets/js/*.js

# 4. Commit
git add -A
git commit -m "LINT: Fix critical errors and auto-fix warnings

- Added missing globals to eslint.config.js
- Fixed 27 undefined variable and const reassignment errors
- Auto-fixed 2,150 style warnings (trailing spaces, indentation, quotes)

Files updated: 24
Errors fixed: 27
Warnings fixed: 2,150

Soli Deo Gloria ✝️"
```

### Short-term (Next Month)

1. **Manual cleanup** of unused variables (~80 warnings)
2. **Refactor calculator.js** (1,283 warnings is tech debt)
3. **Add lint pre-commit hook** (prevent new issues)

### Long-term (Quarterly)

1. **Enable stricter rules** (complexity, max-lines, etc.)
2. **Add TypeScript** for better type safety
3. **Code coverage** reporting
4. **Performance linting** (bundle size, etc.)

---

## Impact on Standards Rebuild

**Relationship to /new-standards/:**
- Linting standards should be documented in /new-standards/v3.010/
- Current cleanup aligns with v3.010.300 excellence goals
- Clean code supports long-term maintainability

**Recommended Standard:** Create `CODE_QUALITY_STANDARDS_v1.0.md`
- ESLint configuration requirements
- Pre-commit hook requirements
- Definition of done (must pass linting)

---

## Summary

**Current State:**
- 24 files analyzed
- 27 errors (critical)
- 2,372 warnings (code quality)

**90% Auto-Fixable:**
- Run `eslint --fix` to resolve most issues instantly

**Priority Focus:**
- Fix 7 errors in calculator.v10-extras.js
- Fix 6 errors in sw-bridge.js
- Add missing globals to config

**Long-term Goal:**
- Zero errors
- Zero warnings
- CI/CD linting enforcement

**Effort Estimate:**
- Phase 1 (Critical): 2-4 hours
- Phase 2 (Auto-fix): 30 minutes
- Phase 3 (Manual): 4-6 hours
- **Total:** 6-10 hours for complete cleanup

---

**Report Generated by:** ESLint + Manual Analysis
**Full JSON Report:** Available in `/tmp/eslint-full-report.json`
**Configuration:** `/eslint.config.js`
**Next Steps:** Fix critical errors, run auto-fix, commit

**Soli Deo Gloria** ✝️
