# ICP-Lite v1.0 Protocol — AI-First Metadata

**Version:** 1.0
**Introduced:** v3.010.300
**Status:** Active in production
**Purpose:** Provide AI-optimized metadata for LLM consumption

---

## Overview

ICP-Lite (Intelligent Content Protocol - Lite) is a lightweight metadata protocol designed to help AI assistants (ChatGPT, Claude, Perplexity, etc.) understand page content quickly and accurately.

---

## Required Meta Tags

### 1. AI Summary
```html
<meta name="ai-summary" content="..."/>
```

**Purpose:** Concise, LLM-optimized page summary
**Format:** 1-2 sentences, factual, answer-first structure
**Character Limit:** 250 characters recommended
**Tone:** Direct, informative, no marketing fluff

**Examples:**
```html
<!-- Home page -->
<meta name="ai-summary" content="Planning tools, travel tips, and faith-scented reflections for smoother sailings. Compare ships, scan menus, scout cabins, and find accessibility notes."/>

<!-- Ship page -->
<meta name="ai-summary" content="Adventure of the Seas is a Voyager Class ship (137,276 GT, 3,114 guests, launched 2001) featuring the iconic Royal Promenade, ice skating rink, rock climbing wall, and worldwide itineraries."/>
```

---

### 2. Last Reviewed
```html
<meta name="last-reviewed" content="YYYY-MM-DD"/>
```

**Purpose:** Content freshness signal
**Format:** ISO 8601 date (YYYY-MM-DD)
**Update Frequency:** On content changes, minimum monthly review

**Examples:**
```html
<meta name="last-reviewed" content="2025-11-18"/>
<meta name="last-reviewed" content="2025-11-15"/>
```

---

### 3. Content Protocol
```html
<meta name="content-protocol" content="ICP-Lite v1.0"/>
```

**Purpose:** Protocol identifier for AI systems
**Format:** Fixed string `ICP-Lite v1.0`
**Required:** Yes (signals protocol compliance)

---

## Implementation

### Full Pattern (Head Section)
```html
<head>
  <!-- Standard meta tags -->
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>

  <!-- ... other meta tags ... -->

  <!-- ICP-Lite v1.0 Meta Tags -->
  <meta name="ai-summary" content="[concise page summary]"/>
  <meta name="last-reviewed" content="2025-11-18"/>
  <meta name="content-protocol" content="ICP-Lite v1.0"/>

  <!-- ... rest of head ... -->
</head>
```

### Placement
- After standard meta tags (charset, viewport)
- Before or after SEO meta (flexible)
- Group together with comment marker

---

## Writing Guidelines

### AI Summary Content

**Do:**
- Lead with the most important fact
- Use exact numbers when available
- State ship class, tonnage, capacity for ship pages
- Answer "what is this page?" in first clause
- Use natural language (AI-friendly)

**Don't:**
- Use marketing language ("amazing", "best")
- Include calls to action
- Repeat site name unnecessarily
- Use vague qualifiers ("many", "several")
- Exceed 250 characters

**Template for Ship Pages:**
```
[Ship Name] is a [Class] ship ([GT] GT, [capacity] guests, launched [year]) featuring [2-3 signature features] and [itinerary type] itineraries.
```

**Template for Tool Pages:**
```
[Tool name] helps cruisers [primary benefit]. [One sentence explaining what it does or shows].
```

---

## Last Reviewed Guidelines

### When to Update
- Content additions or changes
- Data refreshed (ship stats, menus, etc.)
- Images updated
- Minimum: Monthly review cycle

### Review Process
1. Scan page for accuracy
2. Verify links work
3. Check data freshness
4. Update `last-reviewed` date
5. Commit with "CONTENT: Reviewed [page]"

---

## Benefits

### For AI Assistants
- Quick page understanding without full parse
- Freshness signal for outdated content
- Structured summary for citation

### For Users
- AI tools give better answers
- Reduced hallucination risk
- Accurate information retrieval

### For SEO
- Signals content quality to search engines
- May influence AI-generated search snippets
- Demonstrates active maintenance

---

## Compatibility

### Works With
- ChatGPT (OpenAI)
- Claude (Anthropic)
- Perplexity
- Google Bard/Gemini
- Bing Chat
- Standard meta tag parsers

### Fallback
If AI doesn't recognize ICP-Lite, meta tags are ignored (graceful degradation)

---

## Version History

### v1.0 (Current)
- Three required meta tags
- 250 character summary limit
- ISO 8601 date format

### Future (v1.1 potential)
- Schema validation
- Structured categories
- Multi-language support

---

## Validation

### Manual Check
```bash
grep "ai-summary" *.html | wc -l  # Should match page count
grep "last-reviewed" *.html | wc -l
grep "content-protocol" *.html | wc -l
```

### Automated Check (CI)
```javascript
// Check for required ICP-Lite tags
const html = fs.readFileSync('index.html', 'utf8');
const hasAiSummary = html.includes('name="ai-summary"');
const hasLastReviewed = html.includes('name="last-reviewed"');
const hasProtocol = html.includes('content-protocol" content="ICP-Lite v1.0"');

if (!hasAiSummary || !hasLastReviewed || !hasProtocol) {
  throw new Error('Missing ICP-Lite v1.0 meta tags');
}
```

---

## Examples by Page Type

### Ship Page
```html
<meta name="ai-summary" content="Icon of the Seas is an Icon Class ship (250,800 GT, 5,610 guests, launched 2024) featuring the largest waterpark at sea, six waterslides, eight neighborhoods, and Caribbean itineraries."/>
<meta name="last-reviewed" content="2025-11-20"/>
<meta name="content-protocol" content="ICP-Lite v1.0"/>
```

### Restaurant/Venue Page
```html
<meta name="ai-summary" content="Chops Grille is Royal Caribbean's signature steakhouse (surcharge $59.99/person) featuring USDA Prime beef, fresh seafood, premium sides, and upscale dining ambiance across the fleet."/>
<meta name="last-reviewed" content="2025-11-18"/>
<meta name="content-protocol" content="ICP-Lite v1.0"/>
```

### Tool Page
```html
<meta name="ai-summary" content="Drink Package Calculator helps cruisers determine if unlimited drink packages save money. Input sailing length, drinking habits, and get cost comparison with pay-per-drink pricing."/>
<meta name="last-reviewed" content="2025-11-15"/>
<meta name="content-protocol" content="ICP-Lite v1.0"/>
```

### Hub/Index Page
```html
<meta name="ai-summary" content="Compare all Royal Caribbean ships by class, size, features, and itineraries. View deck plans, dining options, and live tracking for 27 active vessels."/>
<meta name="last-reviewed" content="2025-11-22"/>
<meta name="content-protocol" content="ICP-Lite v1.0"/>
```

---

## Maintenance

### Monthly Review Cycle
1. First of month: Review all hub pages
2. Quarterly: Review all ship pages
3. As needed: Tool pages when data changes
4. Continuous: New pages get ICP-Lite on creation

### Quality Audit
- Character count check (<= 250)
- Factual accuracy verification
- Date format validation (YYYY-MM-DD)
- Protocol string exact match

---

## Integration with Other Standards

### Complements (Not Replaces)
- Traditional `<meta name="description">` still required
- OpenGraph tags still required
- JSON-LD still required
- ICP-Lite is **additive enhancement**

### Priority Order
1. Invocation comments (theological)
2. Traditional SEO meta (foundation)
3. ICP-Lite meta (enhancement)
4. AI-breadcrumbs (enhancement)

---

**Soli Deo Gloria** ✝️
