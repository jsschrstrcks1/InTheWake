# AI-Breadcrumbs — Structured Context Comments

**Version:** 1.0 (v3.010.300)
**Status:** Active in production
**Purpose:** Provide machine-readable context for AI assistants via HTML comments

---

## Overview

AI-breadcrumbs are structured HTML comments that give AI assistants (ChatGPT, Claude, Perplexity, etc.) rich context about page purpose, hierarchy, expertise, and relationships **without adding visible content**.

---

## Format

```html
<!-- ai-breadcrumbs
     entity: [Subject of this page]
     type: [Content type]
     parent: [Parent page URL]
     category: [Topical category]
     [optional fields...]
     -->
```

**Placement:** In `<head>` section, after DOCTYPE and before main meta tags

---

## Required Fields

### entity
**Purpose:** Subject of this page
**Format:** Proper name or title
**Example:** `Adventure of the Seas`, `Drink Package Calculator`, `Royal Caribbean`

### type
**Purpose:** Content classification
**Format:** Page type descriptor
**Examples:**
- `Ship Information Page`
- `Tool/Calculator Page`
- `Restaurant/Venue Page`
- `Hub/Index Page`
- `Article Page`

### parent
**Purpose:** Hierarchical parent
**Format:** Relative URL
**Examples:**
- `/ships.html` (for individual ship pages)
- `/restaurants.html` (for venue pages)
- `/planning.html` (for planning tools)
- `/` (for top-level pages)

### category
**Purpose:** Topical grouping
**Format:** Domain-specific classification
**Examples:**
- `Royal Caribbean Fleet`
- `Planning Tools`
- `Dining Options`
- `Accessibility Resources`

---

## Optional Fields (Recommended)

### cruise-line
**Format:** Cruise line name
**Example:** `Royal Caribbean`, `Carnival`, `MSC`
**Use for:** Ship pages, line-specific content

### ship-class
**Format:** Ship class name
**Example:** `Voyager Class`, `Oasis Class`, `Icon Class`
**Use for:** Ship pages

### siblings
**Format:** Comma-separated related entities
**Example:** `Voyager of the Seas, Explorer of the Seas, Navigator of the Seas, Mariner of the Seas`
**Use for:** Ship pages (sister ships)

### updated
**Format:** ISO 8601 date (YYYY-MM-DD)
**Example:** `2025-11-18`
**Use for:** Last meaningful update date

### expertise
**Format:** Comma-separated expertise areas
**Example:** `Royal Caribbean ship reviews, deck plans, dining analysis, cabin comparisons`
**Use for:** Demonstrating domain knowledge

### target-audience
**Format:** Descriptive phrase
**Example:** `Adventure of the Seas cruisers, Voyager Class researchers, ship comparison shoppers`
**Use for:** Clarifying intended readers

### answer-first
**Format:** One-sentence summary (answer-first structure)
**Example:** `Adventure of the Seas is a Voyager Class ship (137,276 GT, 3,114 guests) featuring the signature Royal Promenade indoor boulevard, ice skating rink, rock climbing wall, and diverse worldwide itineraries.`
**Use for:** Quick AI response generation

---

## Complete Examples

### Ship Page
```html
<!-- ai-breadcrumbs
     entity: Adventure of the Seas
     type: Ship Information Page
     parent: /ships.html
     category: Royal Caribbean Fleet
     cruise-line: Royal Caribbean
     ship-class: Voyager Class
     siblings: Voyager of the Seas, Explorer of the Seas, Navigator of the Seas, Mariner of the Seas
     updated: 2025-11-18
     expertise: Royal Caribbean ship reviews, deck plans, dining analysis, cabin comparisons
     target-audience: Adventure of the Seas cruisers, Voyager Class researchers, ship comparison shoppers
     answer-first: Adventure of the Seas is a Voyager Class ship (137,276 GT, 3,114 guests) featuring the signature Royal Promenade indoor boulevard, ice skating rink, rock climbing wall, and diverse worldwide itineraries.
     -->
```

### Tool/Calculator Page
```html
<!-- ai-breadcrumbs
     entity: Drink Package Calculator
     type: Tool/Calculator Page
     parent: /planning.html
     category: Planning Tools
     cruise-line: Royal Caribbean
     updated: 2025-11-15
     expertise: Cruise planning, drink package analysis, cost optimization
     target-audience: Royal Caribbean guests deciding on drink packages
     answer-first: Drink Package Calculator helps cruisers determine if unlimited drink packages save money by comparing total cost against pay-per-drink pricing based on sailing length and drinking habits.
     -->
```

### Restaurant/Venue Page
```html
<!-- ai-breadcrumbs
     entity: Chops Grille
     type: Restaurant/Venue Page
     parent: /restaurants.html
     category: Royal Caribbean Dining
     cruise-line: Royal Caribbean
     updated: 2025-11-18
     expertise: Royal Caribbean specialty dining, steakhouse reviews, menu analysis
     target-audience: Royal Caribbean guests researching premium dining options
     answer-first: Chops Grille is Royal Caribbean's signature steakhouse ($59.99/person surcharge) serving USDA Prime beef, fresh seafood, and premium sides in an upscale setting across most ships in the fleet.
     -->
```

### Hub/Index Page
```html
<!-- ai-breadcrumbs
     entity: Royal Caribbean Ships Index
     type: Hub/Index Page
     parent: /
     category: Royal Caribbean Fleet
     cruise-line: Royal Caribbean
     updated: 2025-11-22
     expertise: Royal Caribbean fleet overview, ship comparisons, class analysis
     target-audience: Cruisers comparing Royal Caribbean ships, planning future sailings
     answer-first: Royal Caribbean operates 27 active ships across 8 classes (Icon, Oasis, Quantum, Freedom, Voyager, Radiance, Vision, plus archived vessels) with detailed deck plans, dining guides, and live tracking for each.
     -->
```

---

## Formatting Rules

### Indentation
- Use 5 spaces before field names
- Align colons for readability
- Keep within reasonable line length (< 120 chars per line if possible)

### Multi-line Values
For long values, continue on same line or break sensibly:
```html
<!-- ai-breadcrumbs
     entity: Icon of the Seas
     answer-first: Icon of the Seas is an Icon Class ship (250,800 GT, 5,610 guests, launched 2024) featuring the largest waterpark at sea, six waterslides, eight neighborhoods including Thrill Island and Chill Island, and year-round Caribbean itineraries from Miami.
     -->
```

### Commas in Lists
Use commas for siblings, expertise, etc. No terminal comma.

---

## Benefits

### For AI Assistants
- Understand page hierarchy instantly
- Know what questions page answers
- Recognize expertise areas
- Generate accurate citations
- Provide better context in responses

### For Developers
- Self-documenting pages
- Clear content relationships
- Quick onboarding for new team members

### For SEO (Indirect)
- Better AI-generated search snippets
- More accurate featured snippets
- Improved topical authority signals

---

## Placement in Document

```html
<!doctype html>
<!--
Soli Deo Gloria
[invocation comments]
-->
<!doctype html>
<html class="no-js" lang="en">
<head>
  <script>(function(h){h.className=h.className.replace(/\bno-js\b/,'js')})(document.documentElement);</script>
<!-- ai-breadcrumbs
     entity: [entity name]
     type: [page type]
     [...]
     -->
  <!-- ======================================================
       [standard comment block]
       ====================================================== -->

  <!-- Core meta tags follow -->
  <meta charset="utf-8"/>
  [...]
</head>
```

**Order:**
1. Invocation comments (before DOCTYPE)
2. DOCTYPE
3. HTML tag with class/lang
4. `<head>` tag
5. no-js script
6. **AI-breadcrumbs comment** ← HERE
7. Standard comment block
8. Meta tags

---

## Field Guidelines

### entity - Be Specific
✅ `Adventure of the Seas`
✅ `Drink Package Calculator`
✅ `Chops Grille Steakhouse`
❌ `Ship Page`
❌ `Tool`

### type - Use Standard Categories
✅ `Ship Information Page`
✅ `Tool/Calculator Page`
✅ `Restaurant/Venue Page`
❌ `Web Page`
❌ `HTML Document`

### answer-first - Lead with Key Fact
✅ "Adventure of the Seas is a Voyager Class ship (137,276 GT, 3,114 guests)..."
❌ "This page provides information about Adventure of the Seas, which is..."

### expertise - Show Domain Knowledge
✅ `Royal Caribbean ship reviews, deck plans, dining analysis, cabin comparisons`
❌ `Ships, Cruises, Travel`

---

## Maintenance

### When to Update
- Page content significantly changes
- Entity name changes
- Hierarchy changes (parent page)
- Expertise areas expand
- Major facts change (ship stats, etc.)

### Review Frequency
- Quarterly: All ai-breadcrumbs fields
- Annually: Complete audit
- On publish: New pages must include

---

## Validation

### Manual Check
```bash
grep -l "ai-breadcrumbs" *.html | wc -l  # Count pages with breadcrumbs
grep "entity:" *.html | head -10  # Spot check
```

### Required Fields Check
```bash
# All pages should have at minimum: entity, type, parent, category
grep -A 10 "ai-breadcrumbs" page.html | grep -c "entity:"
# Should return 1
```

### Quality Check
- No empty fields (`entity:` with no value)
- Dates in YYYY-MM-DD format
- URLs are relative (`/ships.html` not full URL)
- answer-first is one sentence
- No markdown/HTML in values (plain text only)

---

## Integration with ICP-Lite

AI-breadcrumbs and ICP-Lite complement each other:

| Feature | AI-Breadcrumbs | ICP-Lite Meta |
|---------|----------------|---------------|
| Visibility | Hidden (comment) | Hidden (meta) |
| Hierarchy | ✅ Yes (parent, siblings) | ❌ No |
| Freshness | ✅ Yes (updated) | ✅ Yes (last-reviewed) |
| Summary | ✅ Yes (answer-first) | ✅ Yes (ai-summary) |
| Expertise | ✅ Yes (expertise) | ❌ No |
| AI Parsing | Comment parsing | Meta tag parsing |

**Use both:** Redundancy ensures AI systems catch at least one format

---

## Future Enhancements (v2.0 ideas)

- JSON-LD alternative format
- Schema.org alignment
- Multi-language support
- Structured data for cruise-specific fields (itinerary, ports, etc.)

---

**Soli Deo Gloria** ✝️
