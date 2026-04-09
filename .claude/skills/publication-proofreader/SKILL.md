---
name: publication-proofreader
description: "Final typographic polish before publishing. Checks curly quotes, bullet consistency, em-dash usage, broken links, missing alt text, and visual consistency across pages."
version: 1.0.0
---

# Publication Proofreader

> The last pass before the world sees it.

## When to Fire

- On `/proofread` command
- Before deploying any content changes
- After batch page generation or updates

## Checks

### Typography
- [ ] Straight quotes → curly quotes (" " not " ")
- [ ] Apostrophes are curly (' not ')
- [ ] Em-dashes (—) not double hyphens (--)
- [ ] En-dashes (–) for ranges (2024–2025, not 2024-2025)
- [ ] Ellipsis character (…) not three periods (...)
- [ ] No double spaces after periods
- [ ] Consistent quote style throughout page

### Bullet & List Consistency
- [ ] All bullet lists use the same marker style within a page
- [ ] Numbered lists start at 1 and are sequential
- [ ] List items have consistent punctuation (all periods or no periods)
- [ ] Nested lists are indented consistently

### Heading Consistency
- [ ] Title case or sentence case — consistent per page type
- [ ] No trailing colons on headings (unless style guide requires)
- [ ] Heading hierarchy matches content structure

### Link & Image Polish
- [ ] All links have descriptive text (no "click here")
- [ ] All images have alt text (not just filenames)
- [ ] External links open in new tab (`target="_blank"`)
- [ ] No broken anchor links within the page

### Content Polish
- [ ] No placeholder text ("Lorem ipsum", "TBD", "TODO")
- [ ] No developer comments visible in rendered output
- [ ] Dates are formatted consistently (Month DD, YYYY)
- [ ] Currency formatted consistently ($X,XXX.XX)
- [ ] Ship names italicized where appropriate

### InTheWake-Specific
- [ ] Port names match canonical spelling in poi-index.json
- [ ] Cruise line names match official branding
- [ ] Deck numbers are consistent with ship data
- [ ] "cruisinginthewake.com" not "inthewake.com" in any content

## Report Format

```
## Proofread Report — [page] — [date]

| # | Issue | Location | Fix |
|---|-------|----------|-----|
| 1 | Straight quote | paragraph 3 | " → " |
| 2 | Double hyphen | heading 2 | -- → — |

**Total issues:** [N]
**Severity:** [Clean / Minor polish / Needs attention]
```

---

*Soli Deo Gloria* — Details matter because travelers trust what looks professional.
