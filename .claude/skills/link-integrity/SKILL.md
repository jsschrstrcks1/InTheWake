---
name: link-integrity
description: "Validates internal links, anchor references, image paths, and cross-page connectivity across the cruise planning site. Catches broken links before visitors do."
version: 1.0.0
---

# Link Integrity Audit

> Every broken link is a visitor who can't find what they need.

## Purpose

InTheWake has 388 port pages, 298 ship profiles, 472 dining venues, and 9 interactive tools. Cross-linking is heavy — ports reference ships, ships reference restaurants, articles reference tools. This skill catches broken internal links, missing images, dead anchors, and orphaned pages.

## When to Fire

- After Edit/Write of any `.html` file
- On `/links` or `/link-check` command
- When renaming or moving HTML files
- Before deployment

## Site Structure

```
ports/          — 388 port guide pages (e.g., nassau.html, cozumel.html)
ships/          — Ship profiles organized by cruise line
restaurants/    — 472 dining venue pages
cruise-lines/   — 15 cruise line overview pages
articles/       — Editorial content
tools/          — 9 interactive calculators and planners
solo/           — Solo cruising content
images/         — Image assets
assets/         — CSS, JS, fonts
```

## Check Categories

### 1. Internal href Links
For every `<a href="...">` in modified files:
- Verify the target file exists in the repo
- Relative paths resolve from the file's location
- Root-relative paths (`/ports/nassau.html`) resolve from repo root
- Flag any external links to the site's own domain (should be internal)

### 2. Anchor References
For every `href="#section-id"` or `href="page.html#section-id"`:
- Verify the target page contains an element with matching `id` attribute
- Common pattern: `<section id="getting-there">`, `<div id="dining">`
- Flag anchors that point to non-existent IDs

### 3. Image Sources
For every `<img src="...">` and CSS `url(...)`:
- Verify the image file exists at the referenced path
- Check `srcset` entries if present
- Flag broken image paths (especially after renames)

### 4. Cross-Page Connectivity
High-value link patterns that MUST work:
- Port pages → ship pages (which ships visit this port)
- Ship pages → restaurant pages (dining on this ship)
- Cruise line pages → ship pages (fleet listing)
- Article pages → tool pages (calculator references)
- Navigation elements → section pages

### 5. Orphan Detection
Pages that exist but are unreachable:
- Not linked from any other page
- Not in navigation menus
- Not in sitemap.xml

## Audit Report Format

```
## Link Integrity Report — [date]
**Scope:** [files checked]
**Result:** [X broken / Y total links]

### Broken Links
| Source File | Link | Target | Issue |
|---|---|---|---|
| ports/nassau.html | /ships/royal/wonder.html | missing | File does not exist |

### Broken Anchors
| Source File | Anchor | Target | Issue |
|---|---|---|---|

### Missing Images
| Source File | Image Path | Issue |
|---|---|---|

### Orphaned Pages
| File | Notes |
|---|---|
```

## Quick Check (Single File)

When a single HTML file is edited, check only:
1. All links FROM that file
2. All links TO that file from its immediate neighbors

## Full Audit

On `/links` command, scan ALL HTML files. Report:
- Total internal links checked
- Broken links (with source and target)
- Broken anchors
- Missing images
- Orphaned pages
- Summary statistics

## Integration

- Works with **content-freshness** — stale pages often have stale links
- Works with **seo-schema-audit** — canonical URLs must be valid links
- Works with **port-content-builder** — new port pages must be linked from index

---

*Soli Deo Gloria* — Every link matters because every visitor matters.
