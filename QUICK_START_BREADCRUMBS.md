# Quick Start: Intelligent AI Breadcrumbs

## Installation

```bash
pip install beautifulsoup4
chmod +x add_phase1_intelligent.py
```

## Most Common Commands

```bash
# 1. Preview what will be added (RECOMMENDED FIRST)
python3 add_phase1_intelligent.py --dry-run --verbose | less

# 2. Test on a single file
python3 add_phase1_intelligent.py --file restaurants/basecamp.html --dry-run --verbose

# 3. Process all files with backups (PRODUCTION)
python3 add_phase1_intelligent.py --backup

# 4. Process just one directory
python3 add_phase1_intelligent.py --dir ships/ --backup --verbose
```

## What It Does

For each HTML page, the script:

1. **Extracts Real Data**: Reads actual page content (title, h1, meta description, etc.)
2. **Detects Page Type**: Ship, restaurant, cruise line, hub, guide, etc.
3. **Identifies Entities**: Ship names, restaurant names, ship classes, cruise lines
4. **Generates Custom Breadcrumbs**: Unique AI breadcrumb for each page
5. **Adds Person Schema**: Ken Baker (default) or Tina Maulsby (her articles)

## Example Output

**For Restaurant (Basecamp):**
```html
<!-- ai-breadcrumbs
     entity: Basecamp
     type: Restaurant/Dining Venue
     cruise-line: Royal Caribbean
     ship-class: Icon Class
     category: Quick Service Dining
     expertise: Royal Caribbean dining, menu analysis
     target-audience: Icon Class cruisers, dining planners
     answer-first: Complimentary quick-service hub on Icon class ships...
     -->
```

**For Ship (Grandeur of the Seas):**
```html
<!-- ai-breadcrumbs
     entity: Grandeur of the Seas
     type: Ship Information Page
     cruise-line: Royal Caribbean
     ship-class: Vision Class
     category: Royal Caribbean Fleet
     expertise: Ship reviews, deck plans, dining analysis
     target-audience: Grandeur cruisers, Vision Class researchers
     answer-first: Deck plans, live tracker, dining venues, stateroom videos...
     -->
```

## Full Site Stats

```
Total HTML files: 289
Will add breadcrumbs: ~285
Will add Person schema: ~229
Already have both: ~3
```

## Safety Features

- **Dry-run mode**: Preview without changes
- **Backup mode**: Creates .bak files
- **Duplicate detection**: Won't add if already exists
- **Error handling**: Reports issues without crashing

## Need Help?

```bash
python3 add_phase1_intelligent.py --help
```

See `INTELLIGENT_BREADCRUMBS_README.md` for full documentation.
