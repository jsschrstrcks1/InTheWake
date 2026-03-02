# CAREFUL.md — Integrity Guardrail

**Be careful, not clever. Read before editing.**

This document ensures quality and prevents regressions during automated and semi-automated changes.

---

## Core Principles

### 1. Read Before Edit
- **Always** read the file before modifying it
- Understand context and purpose, not just the line being changed
- Check for related code that may need updating together

### 2. Verify Semantic Equivalence
Before replacing inline styles with CSS classes (or any refactor):

| Check | Question |
|-------|----------|
| **Exact match** | Does the CSS class produce *identical* rendered output? |
| **Specificity** | Will the class apply correctly given other CSS rules? |
| **Purpose** | Is the semantic meaning preserved (accessibility class vs hidden class)? |
| **Context** | Does the surrounding HTML affect behavior (aria-hidden, parent selectors)? |

### 3. Test Categories
For bulk changes, spot-check at least one file from each category:
- Ports (380 files)
- Ships (292 files in 16 cruise line directories)
- Restaurants (472 files)
- Root pages (index, tools, articles)

### 4. Pattern Verification Checklist
Before applying any regex replacement across multiple files:

- [ ] Exact string match verified
- [ ] CSS class definition matches replaced inline style
- [ ] No unintended captures (test on 3+ sample files first)
- [ ] Edge cases considered (elements with existing classes, nested elements)
- [ ] Semantic purpose preserved (screen-reader vs truly-hidden)

---

## Known Gotchas

### CSS Class Mismatches

| Class | Purpose | NOT for |
|-------|---------|---------|
| `.visually-hidden` | Screen-reader accessible (hidden visually, readable by assistive tech) | Elements with `aria-hidden="true"` |
| `.hidden` | Completely hidden (`display: none`) | Temporary hide/show (use JS) |
| `.dedication-hidden` | Hidden dedication text with `aria-hidden="true"` | Screen-reader content |

### Inline Style Patterns

| Pattern | Correct Replacement |
|---------|---------------------|
| `opacity:0;position:absolute;pointer-events:none;` | `.dedication-hidden` (NOT `.visually-hidden`) |
| `display: inline;` | `.inline` |
| `margin-top: 1rem; color: var(--ink, #1a2a3a);` | `.mt-1` (color inherits, don't need both) |

---

## Pre-Commit Verification

Before committing bulk changes:

1. **Diff review**: `git diff --stat` — verify expected file count
2. **Sample verification**: Read 3 modified files, confirm changes are correct
3. **CSS check**: If adding/using CSS classes, verify definitions match intent
4. **Rollback plan**: Know how to revert if issues found post-merge

---

## Session Learnings Log

| Date | Issue | Resolution |
|------|-------|------------|
| 2026-02-06 | Phase 5 replaced `opacity:0;position:absolute;pointer-events:none;` with `.visually-hidden` class, which is semantically different (SR-accessible vs truly hidden) | Created `.dedication-hidden` class with exact original properties; fixed 873 files |

---

*Last updated: 2026-02-06*
