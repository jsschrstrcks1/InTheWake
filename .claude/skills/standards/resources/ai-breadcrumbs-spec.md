# AI-Breadcrumbs Specification

**Version**: 1.0.0
**Last Updated**: 2025-11-24
**Purpose**: Structured navigation context for entity pages
**Line Count**: ~200 lines

---

## Overview

**AI-Breadcrumbs** provide structured context for entity pages (ships, ports, restaurants) to help AI systems understand:
- What type of entity this is
- Where it fits in site hierarchy
- What related entities exist
- What decisions this page informs

**Analogy**: Like breadcrumbs in Hansel and Gretel, they help AI find its way through your site.

---

## When to Use

### Required For:
- ✅ Ship profiles (individual ship pages)
- ✅ Port profiles (individual port pages)
- ✅ Restaurant profiles (individual restaurant pages)
- ✅ Any "entity" page with parent/siblings

### NOT Required For:
- ❌ Index/listing pages (ships/index.html)
- ❌ Home page
- ❌ About page
- ❌ General content pages

**Rule of Thumb**: If the page describes a specific "thing" with a name, use AI-Breadcrumbs.

---

## Format

AI-Breadcrumbs are HTML comments at the top of the `<body>` section:

```html
<!-- ai-breadcrumbs
entity: Ship
name: Koinonia
parent: /ships/
siblings: Other ships we've encountered
subject: 2003 Mainship 390 Trawler specifications and modifications
intended-reader: Boaters interested in Mainship trawlers or Great Loop preparation
core-facts: 39 feet, twin Yanmar diesels, 10.5 knot cruise, 250 gallon fuel capacity
decisions-informed: Whether a Mainship 390 is suitable for the Great Loop
updated: 2025-11-24
-->
```

---

## Required Fields

### entity

**Purpose**: Type of entity this page describes

**Valid Values**:
- `Ship`
- `Port`
- `Restaurant`
- (Extensible: add new types as needed)

**Example**:
```
entity: Ship
```

---

### name

**Purpose**: Specific name of this entity

**Format**: Proper name of the thing

**Examples**:
```
name: Koinonia
name: Clearwater Municipal Marina
name: Frenchy's Saltwater Cafe
```

---

### parent

**Purpose**: Parent page URL (where the "back" link goes)

**Format**: Relative or absolute URL

**Examples**:
```
parent: /ships/
parent: /ports/
parent: /restaurants/
parent: /ships/index.html
```

---

### subject

**Purpose**: One-line description of what this page is about

**Format**: Sentence or phrase (no period needed)

**Examples**:
```
subject: 2003 Mainship 390 Trawler specifications and modifications
subject: Clearwater marina facilities and Great Loop stop details
subject: Waterfront seafood restaurant in Clearwater Beach
```

---

### intended-reader

**Purpose**: Who should read this page

**Format**: Description of target audience

**Examples**:
```
intended-reader: Boaters interested in Mainship trawlers or Great Loop preparation
intended-reader: Great Loop cruisers planning Florida Gulf Coast stops
intended-reader: Cruisers looking for waterfront dining in Clearwater
```

---

### updated

**Purpose**: When breadcrumbs were last updated

**Format**: YYYY-MM-DD (ISO 8601)

**Example**:
```
updated: 2025-11-24
```

**Note**: This is different from ICP-Lite `last-reviewed`. This tracks when the breadcrumbs metadata was updated, not the content.

---

## Optional Fields

### siblings

**Purpose**: Related entities at the same level

**Format**: Description of related pages

**Examples**:
```
siblings: Other ships we've encountered on the Great Loop
siblings: Nearby marinas in the Clearwater area
siblings: Other waterfront restaurants in Clearwater Beach
```

**Note**: Not a list of URLs, just a description.

---

### core-facts

**Purpose**: Key facts about this entity (for quick AI reference)

**Format**: Comma-separated list of facts

**Examples**:
```
core-facts: 39 feet, twin Yanmar diesels, 10.5 knot cruise, 250 gallon fuel capacity
core-facts: 50 transient slips, 30/50 amp power, pump-out, fuel dock, walking distance to downtown
core-facts: Seafood specialties, waterfront seating, opens 11am, casual dress
```

---

### decisions-informed

**Purpose**: What decisions does this page help readers make

**Format**: Description of decisions

**Examples**:
```
decisions-informed: Whether a Mainship 390 is suitable for the Great Loop
decisions-informed: Whether to stay at this marina during Great Loop Gulf Coast leg
decisions-informed: Where to eat during Clearwater Beach visit
```

---

## Complete Example

```html
<!doctype html>
<html lang="en">
<head>
  <!--
  Soli Deo Gloria
  All work on this project is offered as a gift to God.
  "Trust in the LORD with all your heart..." — Proverbs 3:5
  "Whatever you do, work heartily..." — Colossians 3:23
  -->

  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>

  <!-- ICP-Lite v1.0 Protocol -->
  <meta name="ai-summary" content="Ship profile for Koinonia, our 2003 Mainship 390 Trawler"/>
  <meta name="last-reviewed" content="2025-11-24"/>
  <meta name="content-protocol" content="ICP-Lite v1.0"/>

  <title>Koinonia - Our Ship | In the Wake</title>
</head>
<body>
  <!-- ai-breadcrumbs
  entity: Ship
  name: Koinonia
  parent: /ships/
  siblings: Other trawlers we've met on the Great Loop
  subject: 2003 Mainship 390 Trawler specifications, modifications, and Great Loop preparation
  intended-reader: Boaters considering Mainship trawlers or preparing for the Great Loop
  core-facts: 39 feet LOA, twin Yanmar 6LY3 diesels (370 HP each), 10.5 knot cruise, 250 gallon fuel, 150 gallon water
  decisions-informed: Whether a Mainship 390 is suitable for the Great Loop, what modifications are helpful
  updated: 2025-11-24
  -->

  <header>
    <h1>Koinonia</h1>
    <p>Our 2003 Mainship 390 Trawler</p>
  </header>

  <main>
    <!-- content -->
  </main>
</body>
</html>
```

---

## AI Usage Guidelines

### Parsing AI-Breadcrumbs

```javascript
// Extract breadcrumbs from HTML
function parseAIBreadcrumbs(html) {
  const match = html.match(/<!-- ai-breadcrumbs\n([\s\S]*?)\n-->/);
  if (!match) return null;

  const breadcrumbs = {};
  const lines = match[1].trim().split('\n');

  for (const line of lines) {
    const [key, ...valueParts] = line.split(':');
    breadcrumbs[key.trim()] = valueParts.join(':').trim();
  }

  return breadcrumbs;
}
```

### Using Breadcrumbs

```javascript
const breadcrumbs = parseAIBreadcrumbs(htmlContent);

if (breadcrumbs) {
  console.log(`Entity type: ${breadcrumbs.entity}`);
  console.log(`Entity name: ${breadcrumbs.name}`);
  console.log(`Parent page: ${breadcrumbs.parent}`);
  console.log(`Core facts: ${breadcrumbs['core-facts']}`);
}
```

---

## Validation

```bash
# Check if breadcrumbs present
grep -q '<!-- ai-breadcrumbs' ship-profile.html

# Check required fields
grep -A 10 '<!-- ai-breadcrumbs' ship-profile.html | grep -q 'entity:'
grep -A 10 '<!-- ai-breadcrumbs' ship-profile.html | grep -q 'name:'
grep -A 10 '<!-- ai-breadcrumbs' ship-profile.html | grep -q 'parent:'
grep -A 10 '<!-- ai-breadcrumbs' ship-profile.html | grep -q 'subject:'
grep -A 10 '<!-- ai-breadcrumbs' ship-profile.html | grep -q 'intended-reader:'
grep -A 10 '<!-- ai-breadcrumbs' ship-profile.html | grep -q 'updated:'
```

---

## Benefits

### For AI Systems

1. **Quick Context**: Understand page without full parse
2. **Navigation**: Know parent/sibling relationships
3. **Relevance**: Match content to user intent
4. **Summarization**: Use core-facts for quick summaries

### For Users

1. **Better Search**: AI can route to right entity
2. **Related Content**: AI can suggest siblings
3. **Decision Support**: AI knows what decisions page helps with

### For Content Creators

1. **Structured Thinking**: Forces clear page purpose
2. **Maintenance**: Easy to see what page is about
3. **Consistency**: Same structure across all entities

---

## Best Practices

### Writing Good subject Lines

**Good**:
```
subject: 2003 Mainship 390 Trawler specifications and modifications
```

**Bad**:
```
subject: Our boat
subject: Ship
subject: This page describes our Mainship trawler, which is a 2003 model...
```

**Tips**:
- Be specific
- Include key identifying info (year, model, type)
- Mention main topics (specs, modifications, experiences)
- One line, no period

### Writing Good intended-reader

**Good**:
```
intended-reader: Boaters considering Mainship trawlers or preparing for the Great Loop
```

**Bad**:
```
intended-reader: Everyone
intended-reader: Boaters
intended-reader: People who like boats and want to read about them
```

**Tips**:
- Be specific about audience
- Mention their goal/interest
- Help AI match content to user intent

### Writing Good core-facts

**Good**:
```
core-facts: 39 feet LOA, twin Yanmar 6LY3 diesels, 10.5 knot cruise, 250 gallon fuel
```

**Bad**:
```
core-facts: It's a nice boat
core-facts: See the specifications section below
```

**Tips**:
- Concrete facts, not opinions
- Numbers and specifics
- Comma-separated
- Most important facts first

---

## Relationship to Other Standards

**AI-Breadcrumbs + ICP-Lite**:
Use both on entity pages for complete AI context.

**AI-Breadcrumbs + Schema.org**:
Not mutually exclusive. Breadcrumbs are lightweight; Schema.org is comprehensive.

---

## Conclusion

AI-Breadcrumbs provide lightweight, human-readable structure for entity pages:
- 6 required fields
- 3 optional fields
- HTML comment format (invisible to users)
- Helps AI navigate and understand

Use on all entity pages for better AI-powered search and navigation.

---

**End of ai-breadcrumbs-spec.md** (~200 lines)
