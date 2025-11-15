# Bulk HTML Update Guide

## Script: add_phase1_bulk.py

This script adds AI breadcrumbs and Person schema (E-E-A-T) to all HTML files in the repository, excluding `/solo/articles/`.

## Quick Start

### 1. Preview Changes (Recommended First Step)
```bash
python3 add_phase1_bulk.py --dry-run
```

### 2. Preview with Detailed Output
```bash
python3 add_phase1_bulk.py --dry-run --verbose
```

### 3. Apply Changes with Backups
```bash
python3 add_phase1_bulk.py --backup
```

### 4. Apply Changes (No Backups)
```bash
python3 add_phase1_bulk.py
```

### 5. Process Specific Files
```bash
python3 add_phase1_bulk.py ships/grandeur-of-the-seas.html cruise-lines/royal-caribbean.html
```

## What It Does

### AI Breadcrumbs
Adds structured metadata comments at the start of `<body>` tag:
- Detects page type from path (ships, restaurants, cruise-lines, etc.)
- Extracts page title from `<title>` or `<h1>`
- Generates appropriate category and parent URL
- Creates answer-first content from meta description or first paragraph

### Person Schema (JSON-LD)
Adds Ken Baker author schema before closing `</head>` tag:
- E-E-A-T signal for Google
- Establishes expertise in cruise planning
- Links to author page and related sites

## Exclusions

The script automatically excludes:
- `/solo/articles/` directory (3 files)
- Files that already have breadcrumbs
- Files that already have Person schema

## Page Type Detection

The script intelligently detects page types:

| Path Pattern | Type | Category | Parent |
|--------------|------|----------|--------|
| `/ships/` | ship-information | ships | /ships.html |
| `/restaurants/` | dining-information | restaurants | /restaurants.html |
| `/cruise-lines/` | cruise-line-comparison | cruise-lines | /cruise-lines.html |
| `/solo/` | solo-travel-guide | solo-cruising | /solo.html |
| `/planning/` | planning-tool | planning | /planning.html |
| Root level hubs | hub-page | varies | / |

## Example Output

```
Finding HTML files in /home/user/InTheWake...
Found 289 HTML files

=== DRY RUN MODE (no changes will be made) ===

  ✓ accessibility.html
    Added: breadcrumb
  ✓ cruise-lines/carnival.html
    Added: breadcrumb, schema
  - index.html (already has both)

============================================================
SUMMARY
============================================================
Total files scanned:    289
Files modified:         285
Breadcrumbs added:      285
Schemas added:          204
Files skipped:          4
Errors:                 0
```

## Generated Example

### For: ships/grandeur-of-the-seas.html

**Breadcrumb:**
```html
<!-- ai-breadcrumbs
     entity: Grandeur of the Seas — Deck Plans, Live Tracker, Dining & Videos
     type: ship-information
     parent: /ships.html
     category: ships
     updated: 2025-11-15
     version: 3.010.300
     expertise: Ship Reviews & Insights
     target-audience: cruise-ship-researchers
     answer-first: Grandeur of the Seas: deck plans, live tracker, dining venues...
     -->
```

**Person Schema:**
```html
<!-- JSON-LD: Person (E-E-A-T) -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Ken Baker",
  "url": "https://cruisinginthewake.com/authors/ken-baker.html",
  "jobTitle": "Founder and Editor",
  ...
}
</script>
```

## Safety Features

1. **Dry-run mode** - Preview all changes before applying
2. **Backup mode** - Creates `.bak` files before modification
3. **Smart detection** - Won't add duplicates
4. **Error handling** - Continues on errors, reports at end
5. **Validation** - Checks for existing breadcrumbs/schema

## Dependencies

- Python 3.6+
- beautifulsoup4 (installed via pip)

```bash
pip3 install beautifulsoup4
```

## Recommended Workflow

1. **Preview first:**
   ```bash
   python3 add_phase1_bulk.py --dry-run --verbose > preview.txt
   ```

2. **Review the preview file**

3. **Apply with backups:**
   ```bash
   python3 add_phase1_bulk.py --backup
   ```

4. **Test a few pages in browser**

5. **Commit changes:**
   ```bash
   git add .
   git commit -m "Add AI breadcrumbs and Person schema to 285 pages"
   ```

## Troubleshooting

### Script doesn't find files
- Ensure you're running from `/home/user/InTheWake/` directory
- Check file permissions

### BeautifulSoup errors
```bash
pip3 install --upgrade beautifulsoup4
```

### Backup files (.bak) created
- These are safety copies
- Safe to delete after verifying changes
- Add to `.gitignore` if needed

## Notes

- The script is idempotent - safe to run multiple times
- Already-processed files are skipped automatically
- Page titles extracted from actual HTML content
- Answer-first content pulled from meta descriptions
