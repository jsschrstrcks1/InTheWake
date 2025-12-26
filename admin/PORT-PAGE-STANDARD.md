# Port Page Standard - ITC v1.0 (In the Wake Content Standard)
**Soli Deo Gloria**

This document defines the enforceable standard for all port pages on In the Wake. Every port page MUST comply with these requirements.

---

## I. MANDATORY SECTION ORDER (BLOCKING)

Port pages must follow this exact section order:

### Main Column (20 sections)
1. **Hero Section** - Full-width hero image with port name overlay
2. **Page Title & Metadata Line** (optional) - `<h1>` and review date
3. **First-Person Logbook Entry** (800-2500 words, BLOCKING) - Personal narrative
4. **Photo Gallery (Featured Images)** - 2+ inline images with captions
5. **The Cruise Port / Terminal** (100-400 words, BLOCKING) - Terminal details
6. **Getting Around** (200-600 words, BLOCKING) - Transportation options
7. **Interactive Port Map** - Leaflet.js map with markers
8. **Beaches** (if beach destination) - Beach descriptions and accessibility
9. **Top Excursions & Attractions** (400-1200 words, BLOCKING) - Detailed excursion info
10. **History & Heritage** (optional/recommended) - Historical context
11. **Cultural Features** (optional) - Local culture, festivals, traditions
12. **Shopping** (if shopping destination) - Shopping areas and tips
13. **Food & Dining** (optional) - Local food recommendations
14. **Special Notices** (conditional) - Warnings, holidays, alerts
15. **Depth Soundings Ashore** (150-500 words, BLOCKING) - Honest personal reflection
16. **Practical Information Summary** (optional) - Quick reference data
17. **Frequently Asked Questions** (REQUIRED, 200+ words) - 4-8 Q&As
18. **Photo Gallery Swiper** (REQUIRED, 8+ images) - Full Swiper.js gallery
19. **Image Credits** (optional/recommended) - Photo attribution section
20. **Back Navigation** - Links back to ports index

### Sidebar Rail (6 sections)
1. **Quick Answer Box** (REQUIRED) - 50-150 word concise answer to "Is [Port] worth it?"
2. **At a Glance** (REQUIRED) - 6-10 key data points (distance, duration, tender, etc.)
3. **About the Author** (REQUIRED) - Author bio with photo
4. **Nearby Ports** (REQUIRED) - 3-5 nearby ports with links
5. **Recent Stories** (REQUIRED) - Latest 3-5 articles
6. **Whimsical Units Container** (REQUIRED) - Fun measurement conversions

### Section Ordering Rules
- **BLOCKING**: Main column sections 1-20 must appear in order (optional sections can be skipped)
- **BLOCKING**: Sidebar sections 1-6 must appear in order
- **Fuzzy Matching**: Section headings allow variations (e.g., "Getting Around", "Getting There", "Transportation")
- **Heading Hierarchy**:
  - Single `<h1>` for page title only
  - `<h2>` for main column major sections
  - `<h3>` for subsections and all sidebar sections

---

## II. ICP-LITE v1.4 PROTOCOL REQUIREMENTS (BLOCKING)

All port pages must include ICP-Lite v1.4 metadata:

```html
<!-- Required Meta Tags -->
<meta name="ai-summary" content="[150-250 characters, first 155 standalone]"/>
<meta name="last-reviewed" content="YYYY-MM-DD"/>
<meta name="content-protocol" content="ICP-Lite v1.4"/>
<meta name="description" content="[matches ai-summary]"/>

<!-- Required JSON-LD: BreadcrumbList -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://inthewake.com/"},
    {"@type": "ListItem", "position": 2, "name": "Ports", "item": "https://inthewake.com/ports.html"},
    {"@type": "ListItem", "position": 3, "name": "[Port Name]"}
  ]
}
</script>

<!-- Required JSON-LD: FAQPage with mainEntity -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "[Question text]",
      "acceptedAnswer": {"@type": "Answer", "text": "[Answer text]"}
    }
  ]
}
</script>

<!-- Required JSON-LD: WebPage with mainEntity -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "[Port Name]",
  "url": "https://inthewake.com/ports/[slug].html",
  "description": "[matches ai-summary]",
  "dateModified": "YYYY-MM-DD",  // MUST match last-reviewed
  "mainEntity": {
    "@type": "Place",
    "name": "[Port Name]",
    "description": "[Port description]"
  }
}
</script>
```

### Validation Rules
- **BLOCKING**: `content-protocol` must equal "ICP-Lite v1.4"
- **BLOCKING**: `ai-summary` max 250 chars, first 155 chars standalone sentence
- **BLOCKING**: `last-reviewed` must match WebPage `dateModified`
- **BLOCKING**: WebPage `description` must match `ai-summary`
- **BLOCKING**: WebPage MUST have `mainEntity` of type "Place"
- **BLOCKING**: FAQPage MUST have `mainEntity` array with minimum 4 questions

---

## III. PORT GUIDE CONTENT REQUIREMENTS - THE RUBRIC (BLOCKING)

Every port page must demonstrate these four pillars:

### 1. Honest Assessments (BLOCKING)
- **First-person voice**: Minimum 10 instances of "I/my/me/we" in logbook entry
- **Critical perspective**: Acknowledge crowds, tourist traps, disappointments
- **Personal opinion**: Clear editorial voice, not generic travel copy
- **Contrast language**: Minimum 3 instances of "but/however/though/despite"
- **Validation**: Count pronouns and contrast words in logbook section

### 2. Accessibility Notes (BLOCKING)
- **Multiple locations**: Accessibility info must appear in 2+ sections
- **At a Glance sidebar**: Walking difficulty rating (Easy/Moderate/Challenging)
- **Body content mentions**: Wheelchair access, mobility challenges, tender details
- **Tender duration**: If tender port, specify duration in minutes
- **Validation**: Search for keywords: "wheelchair", "mobility", "accessible", "tender", "walking"

### 3. DIY Options (BLOCKING)
- **Getting Around section**: 200-600 words dedicated to independent transportation
- **Public transport details**: Bus routes, train schedules, walking routes
- **Walking routes with times**: "15-minute walk", "3 blocks from terminal"
- **Taxi rates**: Specific pricing mentioned
- **Price mentions**: Minimum 5 price references across entire page ($, €, price, cost, fee)
- **Validation**: Count price symbols and keywords

### 4. Booking Guidance (BLOCKING)
- **Dedicated content**: Minimum 50 words about ship vs independent booking
- **Location**: Must appear in "Top Excursions & Attractions" section
- **Required keywords**: "ship excursion", "independent", "guaranteed return", "book ahead"
- **Honest comparison**: Pros/cons of each booking method
- **Validation**: Search excursions section for booking keywords

---

## IV. WORD COUNT REQUIREMENTS

### Per-Section Minimums (BLOCKING)

| Section | Minimum | Maximum | Severity |
|---------|---------|---------|----------|
| Logbook Entry | 800 words | 2500 words | BLOCKING |
| The Cruise Port | 100 words | 400 words | BLOCKING |
| Getting Around | 200 words | 600 words | BLOCKING |
| Top Excursions | 400 words | 1200 words | BLOCKING |
| Depth Soundings | 150 words | 500 words | BLOCKING |
| FAQ Total | 200 words | N/A | BLOCKING |
| FAQ Per Q&A | 50 words | 300 words | WARNING |
| **TOTAL PAGE** | **2000 words** | **6000 words** | **BLOCKING** |

**Target Range**: 2500-4000 words (optimal for SEO and user engagement)

### Counting Rules
- Count words in visible text content only (exclude HTML tags, JSON-LD, navigation)
- Use plain text extraction: `$(section).text().split(/\s+/).filter(w => w.length > 0).length`
- Exclude image captions and photo credits from main count
- FAQ word count = sum of all question + answer pairs

---

## V. IMAGE REQUIREMENTS (BLOCKING)

### Required Image Counts
- **Hero image**: Exactly 1 (BLOCKING)
- **Inline logbook images**: Minimum 2 (BLOCKING)
- **Photo gallery**: Minimum 8 images if Swiper, minimum 6 if grid (BLOCKING)
- **Total unique images**: Minimum 11 (BLOCKING)
- **Maximum recommended**: 25 images (WARNING if exceeded)

### Hero Image Technical Requirements (BLOCKING)
```html
<img src="/images/ports/[slug]-hero.webp"
     alt="[Descriptive alt text 20-150 chars]"
     loading="eager"           <!-- BLOCKING -->
     fetchpriority="high"      <!-- BLOCKING -->
     width="1200"              <!-- Minimum 1200px, WARNING -->
     height="600">
```

### All Other Images (BLOCKING)
```html
<img src="[path]"
     alt="[20-150 chars]"      <!-- BLOCKING -->
     loading="lazy"            <!-- BLOCKING -->
     width="[width]"
     height="[height]">
```

### Photo Credits (BLOCKING)
**EVERY image must have attribution:**
```html
<figure>
  <img src="[path]" alt="[alt]" loading="lazy">
  <figcaption>
    [Caption text].
    Photo © <a href="[photographer-url]" target="_blank" rel="noopener">[Photographer Name]</a>
  </figcaption>
</figure>
```

**Validation Rules:**
- **BLOCKING**: Every `<img>` must be wrapped in `<figure>` or have associated `<figcaption>`
- **BLOCKING**: Every figcaption must contain photo credit link
- **WARNING**: Photo credit links should use `target="_blank" rel="noopener"`
- **Acceptable sources**: Wikimedia Commons, Unsplash, original author photos, licensed stock

---

## VI. MANDATORY CROSS-LINKING RULES (BLOCKING)

### Core Principle
**IF** In the Wake has content about [TOPIC]
**AND** [TOPIC] is mentioned in port page body text
**THEN** first mention MUST link to that content (BLOCKING)

### Content Index Generation
The validator MUST build a complete site content index:

```javascript
// Scan all *.html files
const contentIndex = {
  ships: [
    { keywords: ["Wonder of the Seas", "Wonder"], url: "/ships.html#wonder-of-the-seas" },
    { keywords: ["Symphony of the Seas", "Symphony"], url: "/ships.html#symphony-of-the-seas" }
  ],
  ports: [
    { keywords: ["Cozumel"], url: "/ports/cozumel.html" },
    { keywords: ["Nassau"], url: "/ports/nassau.html" }
  ],
  topics: [
    { keywords: ["accessibility", "wheelchair access"], url: "/accessibility.html" },
    { keywords: ["drink package", "beverage package"], url: "/drink-packages.html" }
  ],
  articles: [
    { keywords: ["first cruise tips"], url: "/articles/first-cruise-tips.html" }
  ],
  authors: [
    { keywords: ["Captain Quinn"], url: "/authors/captain-quinn.html" }
  ]
};
```

### Category-Specific Rules

#### Ships (BLOCKING)
- **Pattern**: Any mention of Royal Caribbean, Celebrity, Norwegian ships
- **First mention**: Must link to `/ships.html` or specific ship page
- **Format**: `<a href="/ships.html#wonder-of-the-seas">Wonder of the Seas</a>`

#### Ports (BLOCKING)
- **Pattern**: Any mention of other port names
- **First mention**: Must link to `/ports/[slug].html`
- **Format**: `<a href="/ports/cozumel.html">Cozumel</a>`

#### Accessibility (BLOCKING)
- **Pattern**: "accessibility", "wheelchair", "mobility challenges", "accessible"
- **First mention**: Must link to `/accessibility.html`
- **Format**: `<a href="/accessibility.html">accessibility</a>`

#### Restaurants (BLOCKING)
- **Pattern**: Specific restaurant names (Windjammer, Main Dining Room, specialty venues)
- **First mention**: Must link to `/restaurants.html` or specific page
- **Format**: `<a href="/restaurants.html#windjammer">Windjammer</a>`

#### Drink Packages (WARNING)
- **Pattern**: "drink package", "beverage package", "unlimited drinks"
- **First mention**: Should link to `/drink-packages.html`

#### Planning Topics (WARNING)
- **Pattern**: "first cruise", "packing tips", "shore excursions"
- **First mention**: Should link to relevant planning page

#### Articles (BLOCKING)
- **Pattern**: Any article title or topic covered in `/articles/`
- **First mention**: Must link to article

#### Tools (BLOCKING)
- **Pattern**: "cruise calculator", "packing checklist", interactive tools
- **First mention**: Must link to tool page

#### Authors (BLOCKING)
- **Pattern**: Author names in bylines or mentions
- **First mention**: Must link to author page

### Cross-Link Formatting Standards
- **Root-relative paths**: All links use `/path/to/page.html` format (not `../path`)
- **No external links for internal content**: Never link to external site when internal page exists
- **Fragment identifiers**: Use `#section-id` for linking to specific sections
- **Link text**: Should be natural, not "click here" or "read more"

### Auto-Fix Capability
```bash
$ node admin/validate-port-page.js ports/cozumel.html --fix-cross-links
```

The validator can automatically insert missing cross-links by:
1. Building complete content index
2. Detecting entity/keyword mentions in body text
3. Identifying first mention of each entity
4. Inserting `<a href="...">` tags around first mention
5. Outputting modified HTML with `--fix` flag

---

## VII. VALIDATION OUTPUT FORMAT

The validator outputs structured JSON with detailed results:

```json
{
  "valid": true|false,
  "score": 92,
  "file": "ports/cozumel.html",

  "blocking_errors": [
    {
      "section": "word_counts",
      "rule": "logbook_minimum",
      "message": "Logbook entry has 652 words, minimum is 800",
      "line": 142,
      "severity": "BLOCKING"
    }
  ],

  "warnings": [
    {
      "section": "images",
      "rule": "max_images",
      "message": "Page has 28 images, recommended maximum is 25",
      "severity": "WARNING"
    }
  ],

  "info": [
    {
      "section": "style",
      "message": "Consider adding more contrast language (currently 2, target 3+)",
      "severity": "INFO"
    }
  ],

  "section_order": {
    "valid": true,
    "detected_order": ["hero", "logbook", "featured-images", "cruise-port", ...],
    "expected_order": ["hero", "logbook", "featured-images", "cruise-port", ...],
    "missing_sections": ["depth-soundings"],
    "out_of_order_sections": []
  },

  "cross_links": {
    "valid": false,
    "total_internal_links": 5,
    "content_index_built": true,
    "content_index_size": 247,
    "link_quality_score": 68,

    "entities_detected": {
      "ships": ["Wonder of the Seas", "Symphony of the Seas"],
      "ports": ["Nassau", "Grand Cayman"],
      "topics": ["accessibility", "drink packages"],
      "articles": []
    },

    "violations": [
      {
        "severity": "BLOCKING",
        "type": "missing_ship_link",
        "entity": "Symphony of the Seas",
        "line": 342,
        "context": "...sailed on Symphony of the Seas last year...",
        "expected_url": "/ships.html#symphony-of-the-seas",
        "auto_fixable": true
      }
    ]
  },

  "icp_lite": {
    "valid": true,
    "protocol_version": "ICP-Lite v1.4",
    "ai_summary_length": 187,
    "last_reviewed": "2025-12-26",
    "has_mainEntity": true
  },

  "rubric": {
    "honest_assessments": {
      "valid": true,
      "first_person_count": 15,
      "contrast_words": 4
    },
    "accessibility_notes": {
      "valid": true,
      "locations": ["at-a-glance", "getting-around", "excursions"],
      "tender_duration_specified": true
    },
    "diy_options": {
      "valid": true,
      "getting_around_words": 487,
      "price_mentions": 8
    },
    "booking_guidance": {
      "valid": true,
      "booking_section_words": 127,
      "has_keywords": ["ship excursion", "independent", "guaranteed return"]
    }
  }
}
```

### Exit Codes
- **0**: All validations passed (or only INFO/WARNING)
- **1**: BLOCKING errors present, page cannot be published

---

## VIII. VALIDATION COMMAND USAGE

```bash
# Validate single port page
$ node admin/validate-port-page.js ports/cozumel.html

# Validate all port pages
$ node admin/validate-port-page.js --all-ports

# Validate specific batch
$ node admin/validate-port-page.js ports/cozumel.html ports/nassau.html ports/aruba.html

# JSON output for CI/CD
$ node admin/validate-port-page.js ports/cozumel.html --json-output

# Auto-fix cross-links
$ node admin/validate-port-page.js ports/cozumel.html --fix-cross-links

# Quiet mode (errors only)
$ node admin/validate-port-page.js --all-ports --quiet

# Show what would be fixed without making changes
$ node admin/validate-port-page.js ports/cozumel.html --dry-run --fix-cross-links
```

---

## IX. IMPLEMENTATION NOTES

### Build Integration
- **Pre-commit hook**: Run validator on modified port pages
- **CI/CD pipeline**: Validate all port pages on PR
- **Blocking build**: BLOCKING errors prevent merge/deploy
- **Warning tolerance**: WARNINGs log but don't block

### Auto-Fix Strategy
The validator should offer auto-fix for:
- ✅ Missing cross-links (high confidence)
- ✅ Image loading attributes (100% safe)
- ✅ ICP-Lite metadata formatting (safe)
- ❌ Word count issues (requires editorial work)
- ❌ Section ordering (requires manual restructuring)

### Manual Review Required
Some violations require human judgment:
- Content quality and depth
- Section ordering when major restructuring needed
- Image selection and quality
- Tone and voice consistency

---

## X. VERSIONING

**Current Version**: ITC v1.0 (In the Wake Content Standard)
**Based On**: ICP-Lite v1.4, Port Guide Rubric v1.0
**Last Updated**: 2025-12-26
**Soli Deo Gloria**

### Change Log
- **v1.0** (2025-12-26): Initial standard codification
  - Comprehensive port page requirements
  - Section ordering enforcement
  - Word count requirements
  - Image requirements
  - Universal cross-linking rules
  - Four-pillar rubric integration
  - ICP-Lite v1.4 compliance

---

## APPENDIX A: SECTION HEADING PATTERNS (FUZZY MATCHING)

The validator uses fuzzy matching to detect section headings:

```javascript
const sectionPatterns = {
  logbook: /^(logbook|first.?person|personal|my (visit|experience|thoughts?)|the moment)/i,
  cruise_port: /^(the )?cruise (port|terminal)|port (of call|terminal|facilities)/i,
  getting_around: /^getting (around|there|to|from)|transportation|how to get/i,
  beaches: /^beaches?|beach guide|coastal/i,
  excursions: /^(top )?excursions?|attractions?|things to (do|see)|activities/i,
  history: /^history|historical|heritage/i,
  cultural: /^cultural? (features?|highlights?|experiences?)|traditions?/i,
  shopping: /^shopping|retail|markets?/i,
  food: /^food|dining|restaurants?|eating|cuisine/i,
  notices: /^(special )?notices?|warnings?|alerts?|important|know before/i,
  depth_soundings: /^depth soundings|final thoughts?|in conclusion|the (real|honest) story/i,
  faq: /^(frequently asked questions?|faq|common questions?)/i,
  gallery: /^(photo )?gallery|photos?|images?/i,
  credits: /^(image |photo )?credits?|attributions?|photo sources?/i
};
```

---

**END OF STANDARD**
