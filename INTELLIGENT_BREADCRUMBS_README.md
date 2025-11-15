# Intelligent AI Breadcrumbs & Person Schema Generator

## Overview

`add_phase1_intelligent.py` is an advanced Python script that analyzes each HTML page's **actual content** to generate **truly customized** AI breadcrumbs and Person schema.org structured data.

Unlike generic templates, this script:
- **Extracts real metadata** from each page (titles, headings, descriptions, schema)
- **Intelligently detects page types** (ships, restaurants, cruise lines, hubs, guides)
- **Identifies specific entities** (ship names, restaurant names, cruise lines, ship classes)
- **Generates custom breadcrumbs** unique to each page's content
- **Adds appropriate Person schema** (Tina Maulsby for her articles, Ken Baker otherwise)

## Installation

Requires Python 3.7+ and BeautifulSoup4:

```bash
pip install beautifulsoup4
```

## Usage

### Quick Start

```bash
# Preview all changes (recommended first run)
python3 add_phase1_intelligent.py --dry-run --verbose

# Process all HTML files with backups
python3 add_phase1_intelligent.py --backup

# Process single file
python3 add_phase1_intelligent.py --file restaurants/basecamp.html --verbose

# Process directory
python3 add_phase1_intelligent.py --dir ships/ --backup
```

### Command-Line Options

| Option | Description |
|--------|-------------|
| `--dry-run` | Preview changes without modifying files |
| `--verbose` | Show detailed extraction and generation info |
| `--file FILE` | Process single file (absolute or relative path) |
| `--dir DIR` | Process directory (absolute or relative path) |
| `--backup` | Create .bak backups before modification |

### Examples

```bash
# See what would be added to all pages
python3 add_phase1_intelligent.py --dry-run

# Process all restaurants with detailed output
python3 add_phase1_intelligent.py --dir restaurants/ --verbose --backup

# Test on one ship page first
python3 add_phase1_intelligent.py --file ships/icon-of-the-seas.html --dry-run --verbose

# Apply changes to everything with backups
python3 add_phase1_intelligent.py --backup
```

## Intelligent Features

### 1. Real Content Extraction

The script extracts actual page data:

- **Page title** from `<title>` tag
- **Main heading** from `<h1>` tag
- **Meta description** from meta tags
- **Canonical URL** from link tags
- **Existing schema.org data** from JSON-LD scripts
- **First meaningful paragraph** for answer-first summaries
- **Ship classes** from content patterns (e.g., "Icon Class", "Oasis Class")
- **Cruise lines** from paths and content
- **Venue types** from content analysis (quick-service, specialty, MDR, etc.)

### 2. Smart Page Type Detection

Automatically detects page types from paths and content:

- **Ship Pages** (`/ships/*.html`) - Individual ship information
- **Restaurant Pages** (`/restaurants/*.html`) - Dining venues
- **Cruise Line Pages** (`/cruise-lines/*.html`) - Line comparisons
- **Hub Pages** (`ships.html`, `restaurants.html`, etc.) - Directory/index pages
- **Solo Travel** (`/solo/*.html`) - Solo cruising guides
- **Accessibility** (`/accessibility/*.html`) - Accessibility guides
- **Planning** (`/planning/*.html`) - Planning tools
- **Generic Pages** - Other content

### 3. Custom Breadcrumb Generation

Each page type gets uniquely structured breadcrumbs:

#### Ship Pages Example (Grandeur of the Seas)
```html
<!-- ai-breadcrumbs
     entity: Grandeur of the Seas
     type: Ship Information Page
     parent: /ships.html
     category: Royal Caribbean Fleet
     cruise-line: Royal Caribbean
     ship-class: Vision Class
     updated: 2025-11-15
     expertise: Royal Caribbean ship reviews, deck plans, dining analysis, cabin comparisons
     target-audience: Grandeur of the Seas cruisers, Vision Class researchers, ship comparison shoppers
     answer-first: Grandeur of the Seas: deck plans, live tracker (auto-refresh), dining venues...
     -->
```

#### Restaurant Pages Example (Basecamp)
```html
<!-- ai-breadcrumbs
     entity: Basecamp
     type: Restaurant/Dining Venue
     parent: /restaurants.html
     category: Quick Service Dining
     cruise-line: Royal Caribbean
     ship-class: Icon Class
     updated: 2025-11-15
     expertise: Royal Caribbean dining, menu analysis, restaurant reviews, specialty dining
     target-audience: Icon Class cruisers, dining planners, families, foodies
     answer-first: Basecamp on Royal Caribbean's Icon class — the Thrill Island refuel hub...
     -->
```

#### Hub Pages Example (Ships Overview)
```html
<!-- ai-breadcrumbs
     entity: Ships Overview
     type: Hub/Index Page
     parent: /
     category: Ship Database
     updated: 2025-11-15
     expertise: Cruise planning, resource directory, comprehensive guides
     target-audience: Cruise travelers, vacation planners, research-oriented cruisers
     answer-first: Explore Royal Caribbean ships at a glance: classes, debut years...
     -->
```

### 4. Intelligent Author Detection

- **Checks existing Article schema** for author information
- **Detects Tina Maulsby** articles and uses her Person schema
- **Defaults to Ken Baker** schema for other pages
- **Adds page-specific knowledge** to knowsAbout arrays

### 5. Content-Aware Fields

#### Ship Class Detection
Automatically finds ship classes from:
- Existing schema.org data
- Content patterns: "Oasis Class", "Quantum Class", "Icon Class", etc.
- Meta descriptions
- Page content analysis

#### Venue Type Detection
Identifies restaurant categories:
- **Quick Service Dining** - Counter service, grab-and-go
- **Specialty Dining** - Upcharge, premium, fine dining
- **Main Dining Room** - Complimentary dining rooms
- **Buffet/Marketplace** - Windjammer, buffet-style
- **Bar/Lounge** - Bars, pubs, lounges
- **Cafe/Coffee Shop** - Coffee shops, patisseries

#### Cruise Line Detection
Identifies cruise lines from:
- File paths
- Page titles
- Content mentions
- Defaults to Royal Caribbean for this site

### 6. Smart Answer-First Generation

Creates answer-first summaries from:
1. Meta descriptions (preferred)
2. First meaningful paragraph
3. Generated summary based on page type and entity

## Output Examples

### Verbose Mode Output

```
Processing: restaurants/basecamp.html
  Extracted metadata:
    Title: Basecamp — Royal Caribbean | In the Wake
    Entity: Basecamp
    Type: Restaurant/Dining Venue
    Cruise Line: Royal Caribbean
    Ship Class: Icon Class
    Category: Quick Service Dining
    Answer-first: Basecamp on Royal Caribbean's Icon class — the Thrill Island refuel hub...

  Generating AI breadcrumbs:
    ✓ Custom metadata for Basecamp restaurant
    ✓ Icon Class ship detection
    ✓ Quick Service Dining category

  Status: ✓ Added breadcrumb, ✓ Added Person schema (Ken Baker)
```

### Brief Mode Output

```
[1/25] restaurants/basecamp.html [+breadcrumb+person]
[2/25] restaurants/chops.html [+breadcrumb+person]
[3/25] restaurants/izumi.html [+breadcrumb]
[4/25] restaurants/mdr.html [skip]
```

Status indicators:
- `[+breadcrumb+person]` - Both added
- `[+breadcrumb]` - Only breadcrumb added
- `[+person]` - Only Person schema added
- `[skip]` - Both already exist

### Summary Output

```
======================================================================
SUMMARY
======================================================================
Total files: 289
Processed: 289
AI breadcrumbs added: 287
Person schemas added: 245
Skipped (already have both): 2
Errors: 0
```

## File Safety

### Backups
Use `--backup` to create `.bak` files before modification:
```bash
python3 add_phase1_intelligent.py --backup
# Creates: page.html.bak for each modified file
```

### Dry Run
Always test with `--dry-run` first:
```bash
python3 add_phase1_intelligent.py --dry-run --verbose
# Shows what would be added without modifying files
```

### Exclusions
Automatically excludes:
- `/solo/articles/` directory (as specified in requirements)

## Person Schema Examples

### Ken Baker (Default)
```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Ken Baker",
  "url": "https://inthewake.com/about/ken-baker.html",
  "jobTitle": "Cruise Research Analyst & Data Specialist",
  "description": "Cruise industry analyst specializing in ship comparisons, deck plan analysis, and dining venue research.",
  "knowsAbout": [
    "Cruise Ship Analysis",
    "Deck Plans",
    "Royal Caribbean",
    "Cruise Dining",
    "Ship Comparisons",
    "Deck Plan Analysis"  // Added for ship pages
  ]
}
```

### Tina Maulsby (For Her Articles)
```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Tina Maulsby",
  "url": "https://inthewake.com/about/tina-maulsby.html",
  "jobTitle": "Cruise Expert & Solo Travel Advocate",
  "description": "Disability travel advocate, solo cruiser, and Royal Caribbean specialist with expertise in accessible cruising and ship accessibility analysis.",
  "knowsAbout": [
    "Solo Cruising",
    "Disability Travel",
    "Accessible Cruising",
    "Royal Caribbean",
    "Cruise Ship Accessibility"
  ]
}
```

## Technical Details

### HTML Modification Strategy

1. **AI Breadcrumb Insertion**: Immediately after `<head>` tag
2. **Person Schema Insertion**: Just before `</head>` tag
3. **Duplicate Detection**: Checks for existing breadcrumbs and schemas
4. **Safe Parsing**: Uses BeautifulSoup4 for robust HTML parsing
5. **Encoding**: UTF-8 encoding for all files

### Detection Algorithms

#### Ship Class Pattern Matching
```python
# Patterns matched:
- "(Oasis|Quantum|Freedom|Voyager|Radiance|Vision|Icon|Sovereign) Class"
- "class: ClassName"
# Searched in: content, meta descriptions, existing schema
```

#### Venue Type Keywords
```python
quick_service = ['quick service', 'counter service', 'grab and go']
specialty = ['specialty', 'upcharge', 'premium', 'fine dining']
mdr = ['main dining', 'mdr', 'complimentary dining room']
buffet = ['windjammer', 'buffet', 'marketplace']
```

## Troubleshooting

### Common Issues

**Issue**: Script reports "No HTML files found"
**Solution**: Check that you're running from the correct directory or use absolute paths

**Issue**: Not detecting ship class
**Solution**: Ensure ship class is mentioned in meta description or page content

**Issue**: Wrong page type detected
**Solution**: Check file path structure matches expected patterns

### Debugging

Run with `--verbose` and `--dry-run` to see detailed extraction:
```bash
python3 add_phase1_intelligent.py --file path/to/page.html --dry-run --verbose
```

## Performance

- **Processing Speed**: ~0.1-0.2 seconds per file
- **Memory Usage**: Minimal (processes one file at a time)
- **Safety**: No destructive operations in dry-run mode

## Next Steps

After running this script:

1. **Review sample output**: Check a few pages in different categories
2. **Verify breadcrumbs**: Ensure generated breadcrumbs are accurate
3. **Check Person schemas**: Confirm correct author attribution
4. **Test AI understanding**: Submit pages to AI search engines
5. **Monitor SEO impact**: Track search visibility improvements

## Advanced Usage

### Process Specific Page Types Only

```bash
# Only ship pages
python3 add_phase1_intelligent.py --dir ships/ --backup

# Only restaurant pages
python3 add_phase1_intelligent.py --dir restaurants/ --backup

# Single page for testing
python3 add_phase1_intelligent.py --file solo/first-time.html --dry-run --verbose
```

### Integration with CI/CD

```bash
# In your deployment script:
python3 add_phase1_intelligent.py --backup
if [ $? -eq 0 ]; then
    echo "✓ AI breadcrumbs added successfully"
else
    echo "✗ Error adding breadcrumbs"
    exit 1
fi
```

## Customization

To modify detection logic or templates, edit these classes in `add_phase1_intelligent.py`:

- **`PageAnalyzer`** - Content extraction and page type detection
- **`BreadcrumbGenerator`** - Breadcrumb HTML comment generation
- **`PersonSchemaGenerator`** - Person schema JSON-LD generation

## Support

For issues or questions about the script, review the code comments or test with `--dry-run --verbose` to see detailed processing information.
