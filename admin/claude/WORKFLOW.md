# Development Workflow — In the Wake

**Version:** 1.0.0
**Last Updated:** 2026-03-02
**Purpose:** Before/during/after task guidelines, git commit conventions, and verification checklist. Extracted from CLAUDE.md.

**Also read:**
- `.claude/skills/careful-not-clever/CAREFUL.md` — Process discipline (read before editing, verify, document)
- `admin/CAREFUL.md` — Technical discipline (CSS semantics, pre-commit checks)

---

## Before Starting Any Task

1. **Read `admin/UNFINISHED_TASKS.md`** carefully for the specific task
2. **Check standards** relevant to the task:
   - Technical patterns → `admin/claude/TECHNICAL_STANDARDS.md`
   - Image work → `admin/claude/IMAGE_WORKFLOW.md`
   - Ship pages → `new-standards/v3.010/SHIP_PAGE_CHECKLIST_v3.010.md`
   - Voice/content → `.claude/skills/Humanization/Like-a-human.md`
3. **Review existing examples** of similar pages — look at 2-3 live examples before writing
4. **Verify current state** with file reads/searches (never assume)
5. **Plan the approach** — use TodoWrite tool for anything with 3+ steps

---

## During Development

1. **Follow standards strictly** — see `/standards/` directory
2. **Test as you go** — verify URLs, validate JSON, check accessibility
3. **Use absolute URLs** everywhere in production files
4. **Validate HTML/CSS/JSON** before committing
5. **Check cross-links** work correctly
6. **Verify images load** and have proper attribution
7. **One logical change at a time** — don't batch unrelated changes

---

## Before Committing

1. **Review changes** with `git status` and `git diff`
2. **Run validation scripts** if available: `./admin/post-write-validate.sh <file>`
3. **Check for console statements** and remove them
4. **Verify no regressions** on existing pages
5. **Write clear commit message** — the "why," not just the "what"
6. **Voice audit fires automatically** when content files are staged — review its output before proceeding

---

## Git Commit Messages

**Format:**
```
TYPE: Brief summary (50 chars or less)

Detailed explanation of changes and why they were necessary.
Reference any related tasks or issues.
```

**Types:**
- `FEAT:` New features
- `FIX:` Bug fixes
- `DOCS:` Documentation changes
- `STYLE:` CSS/visual changes
- `REFACTOR:` Code refactoring
- `TEST:` Test additions
- `AUDIT:` Audit reports
- `LOGBOOK:` Logbook story additions

**Examples:**
```
LOGBOOK: Add historic remembrances for Nordic Prince and Sun Viking

Created comprehensive logbooks for two historic ships (1971-1998 era) with
authentic memorial stories. Cross-referenced to grief article.

FIX: Update WebP references in ship meta tags

All 50 RCL ship pages now use .webp format in og:image, twitter:image, and
JSON-LD schema. Reduces page weight and improves LCP scores.
```

---

## Task Tracking Files

Three files track project work state:

| File | Purpose | When to Update |
|---|---|---|
| `admin/UNFINISHED_TASKS.md` | Master task list (P0-P4). Canonical source of truth. | When tasks are added, reprioritized, or cancelled |
| `admin/IN_PROGRESS_TASKS.md` | Active work in current session | At session start; update as tasks move through |
| `admin/COMPLETED_TASKS.md` | Completed work log | Immediately when a task is done — not "later" |

**Rule:** Update `admin/COMPLETED_TASKS.md` in the same session you complete the task. Not after. Not at the end. Now.

---

## Verification Checklist

Before marking any task complete, verify:

### HTML Files
- [ ] DOCTYPE present
- [ ] Absolute URLs used (https://cruisinginthewake.com/...)
- [ ] Meta tags complete (version, content-protocol, ai-summary, last-reviewed)
- [ ] No console statements left in inline JavaScript
- [ ] No lorem ipsum or placeholder text
- [ ] No placeholder images (BLOCKING ERROR — no exceptions)
- [ ] All images have alt attributes
- [ ] Skip-link present and functional
- [ ] Breadcrumb navigation correct
- [ ] Service Worker registration snippet included
- [ ] Analytics snippets present (Google Analytics + Umami)

### JSON Files
- [ ] Valid JSON (no trailing commas, no comments)
- [ ] Version field present and incremented
- [ ] Schema matches expected format
- [ ] No control characters or invalid Unicode

### Images
- [ ] WebP format used (not JPEG/JPG)
- [ ] Proper attribution section added (Wiki Commons images)
- [ ] Figcaptions include attribution note
- [ ] Logo stays PNG (never convert logo_wake.png to WebP)
- [ ] Responsive sizing attributes included

### CSS/JavaScript
- [ ] Version query string updated (?v=3.010.400)
- [ ] No console.log/warn/error statements
- [ ] Graceful fallbacks for JS-disabled users
- [ ] Accessibility features maintained

### Content (Logbooks/Articles)
- [ ] Voice audit completed (fires automatically before commit)
- [ ] No machine tells (run voice-audit checklist if flagged)
- [ ] Pastoral guardrails respected (grief content, disability content)
- [ ] Faith-scented language preserved where present

### Git
- [ ] Commit message follows TYPE: format
- [ ] Changes reviewed with git diff
- [ ] No unintended files included
- [ ] Branch name follows convention (claude/*)
- [ ] `admin/COMPLETED_TASKS.md` updated

---

## Validator Commands

```bash
# Validate ICP-Lite v1.4 compliance
node admin/validate-icp-lite-v14.js <file>

# Validate all files
node admin/validate-icp-lite-v14.js --all

# Post-write standards validation
./admin/post-write-validate.sh <file>

# Install validator dependencies (first time only)
cd admin && npm install
```

---

*Soli Deo Gloria*
