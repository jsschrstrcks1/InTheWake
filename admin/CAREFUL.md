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

## Image Verification Protocol — MANDATORY, Every Time

**Rule:** Before trusting, citing, or keeping ANY port/ship/venue image, visually
open it with the Read tool and confirm it actually depicts what the caption,
alt text, or filename claims. File names lie. Attribution files lie. Prior
sessions have hallucinated locations — `praia-attraction-1.webp` was actually
Cascais, Portugal; `praia-attraction-2.webp` was a shipwreck on Boa Vista.
`college-fjord-*.webp` were blue-gradient text rectangles pretending to be
Harvard and Yale Glaciers. **Trust nothing on faith.**

**Workflow — every image, every time:**
1. **Open the file** with Read — it renders .webp/.jpg/.png inline.
2. **Compare** the rendered image against:
   - The caption / figcaption
   - The `alt` attribute
   - The filename
   - The attribution's `title` field
3. **Reject** any image that doesn't match. A placeholder rectangle, a photo
   of a different city, or a stock image of a similar-looking fjord is worse
   than no image — it lies to readers who came for honest information.
4. **When sourcing new images**, you may use consult/orchestra/investigate to
   ask GPT, You.com, or Grok for real CC-licensed candidates — they have web
   access we don't. But treat their output as suggestions only: every URL
   must be existence-verified (WebSearch on `site:commons.wikimedia.org`)
   **and** the resulting file must be visually confirmed before it lands
   in the repo.
5. **Record** the verified subject in the `-attr.json` file's `alt` and
   `description` fields so the next session has the ground truth.

**Never do:**
- Accept a filename as proof of content
- Fabricate a File:/Flickr URL to satisfy the gallery credit diversity check
- Copy-paste the same attribution onto every image in a gallery
- Leave `"originalFile": "placeholder.jpg"` in production

**This rule exists because:** the site serves widows, disabled adventurers,
and caregivers making real travel decisions. Showing them a photo of the
wrong fjord is a lie in a medium where lies cost money and hope.

## Session Learnings Log

| Date | Issue | Resolution |
|------|-------|------------|
| 2026-02-06 | Phase 5 replaced `opacity:0;position:absolute;pointer-events:none;` with `.visually-hidden` class, which is semantically different (SR-accessible vs truly hidden) | Created `.dedication-hidden` class with exact original properties; fixed 873 files |
| 2026-04-10 | `college-fjord/*.webp` were blue-gradient placeholder rectangles pretending to be glacier photos — same fake Flickr URL on every one — caught only by opening the files with Read | Added Image Verification Protocol above. Flagged college-fjord as needing real image sourcing (human task until sandbox egress opens). Applies to every port repair going forward. |

---

*Last updated: 2026-04-10*
