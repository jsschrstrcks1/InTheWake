---
name: seo-schema-audit
description: "Validates JSON-LD structured data, Open Graph, Twitter Cards, and AI meta tags for cruise and travel content"
version: 1.0.0
---

# SEO Schema Audit — Cruise & Travel Content

## Purpose

Audit and validate structured data markup across InTheWake cruise content pages. This skill ensures JSON-LD schemas, Open Graph tags, Twitter Cards, and AI-oriented meta tags are complete, accurate, and compliant with schema.org specifications and ICP-2 requirements.

## When to Fire

- When creating or editing any HTML page or template
- When adding or modifying JSON-LD structured data
- When updating Open Graph or Twitter Card meta tags
- When reviewing pages for SEO compliance
- When prompted with `/seo-schema-audit` or asked to audit structured data
- Before any page goes live or is merged to production

## Instructions

### 1. JSON-LD Structured Data Validation

Validate all JSON-LD `<script type="application/ld+json">` blocks against schema.org specs. Focus on these schema types relevant to cruise and travel content:

#### Article Schema
**Required properties:**
- `@type`: "Article" (or "NewsArticle", "BlogPosting")
- `headline`: Must match the visible `<h1>` or `<title>` content
- `author`: Must include `@type` ("Person" or "Organization") and `name`
- `datePublished`: ISO 8601 format (e.g., `2026-03-15`)
- `dateModified`: ISO 8601 format, must be >= `datePublished`
- `publisher`: Must include `@type: "Organization"`, `name`, and `logo` with valid `url`
- `image`: At least one image URL

**Recommended properties:**
- `description`: 50-160 characters, should match meta description
- `mainEntityOfPage`: Should reference the canonical URL
- `wordCount`: Should reflect actual content length
- `articleSection`: Should categorize the content (e.g., "Cruise Reviews", "Port Guides")

#### FAQPage Schema
**Required properties:**
- `@type`: "FAQPage"
- `mainEntity`: Array of Question objects

**Each Question object requires:**
- `@type`: "Question"
- `name`: The question text (must match visible question on page)
- `acceptedAnswer` with `@type: "Answer"` and `text`

**Validation rules:**
- Every visible FAQ question on the page must have a corresponding schema entry
- Answer text in schema must match displayed answer content
- Minimum 2 questions recommended for FAQPage schema

#### LocalBusiness Schema (for port/destination pages)
**Required properties:**
- `@type`: "LocalBusiness" (or more specific: "TouristAttraction", "CivicStructure")
- `name`: Business or port name
- `address`: Must include `@type: "PostalAddress"` with `streetAddress`, `addressLocality`, `addressRegion`, `postalCode`, `addressCountry`
- `geo`: Must include `@type: "GeoCoordinates"` with valid `latitude` and `longitude`

**Recommended properties:**
- `telephone`, `url`, `openingHours`
- `image`: At least one photo
- `description`: Should match visible page description
- `aggregateRating`: If reviews are displayed, must include `ratingValue` and `reviewCount`

### 2. Nested Schema Handling

- When multiple schemas exist on a single page (e.g., Article + FAQPage on a cruise guide), verify they are properly linked via `@id` references or contained within a `@graph` array
- LocalBusiness schemas referenced within Article content should use `mentions` or `about` properties to link
- Validate that nested schemas do not duplicate or contradict parent schema data

### 3. Open Graph Validation

Check for all required `<meta property="og:...">` tags:

- `og:title` — Must be present, 60-90 characters recommended
- `og:description` — Must be present, 100-200 characters recommended
- `og:image` — Must be a valid, absolute URL; minimum 1200x630px recommended
- `og:url` — Must match the canonical URL exactly
- `og:type` — Must be present (typically "article" or "website")
- `og:site_name` — Should be "InTheWake" or the site's proper name

### 4. Twitter Card Validation

Check for all required `<meta name="twitter:...">` tags:

- `twitter:card` — Must be "summary_large_image" or "summary"
- `twitter:title` — Must be present
- `twitter:description` — Must be present
- `twitter:image` — Must be a valid, absolute URL

### 5. AI Meta Tags — ICP-2 Compliance

Validate presence and quality of AI-oriented meta tags:

- `<meta name="ai:summary">` — Must be present; concise summary of page content (1-2 sentences)
- `<meta name="ai:target-audience">` — Must be present; should describe the intended reader (e.g., "cruise enthusiasts researching Caribbean itineraries")
- Content of these tags must accurately reflect the page's actual content

### 6. Stale Content Detection

Check for `<meta name="last-reviewed">` or `dateModified` in JSON-LD:

- Flag any page where `last-reviewed` or `dateModified` is older than 90 days from the current date
- Report the exact date found and how many days stale it is
- Cruise content with seasonal information (e.g., hurricane season, holiday sailings) should be reviewed more frequently

### 7. Canonical URL Verification

- `<link rel="canonical">` must be present on every page
- The canonical URL must match the actual file path / route of the page
- `og:url` must match the canonical URL
- `mainEntityOfPage` in JSON-LD should reference the canonical URL
- No trailing slashes unless the site convention uses them consistently

### 8. Data Type Validation

- **Dates**: All dates must be valid ISO 8601 (YYYY-MM-DD or full datetime)
- **URLs**: All URLs in schema must be absolute and reachable
- **Currency** (if applicable): Must use ISO 4217 codes (e.g., "USD")
- **Ratings**: `ratingValue` must be within `bestRating`/`worstRating` bounds

### 9. Semantic Accuracy Checks

- Schema `headline` / `name` must match the visible page heading
- Schema `description` should align with the meta description and visible content
- Schema `image` URLs should reference images actually displayed on the page
- Author information in schema must match any visible byline
- Watch for conflicting information between schema markup and displayed page content

### 10. Reporting Format

For each page audited, produce a report structured as:

```
## Schema Audit: [Page Title]

### Schemas Found
- [List each schema type detected]

### Errors (must fix)
- [ ] [Error description with line reference]

### Warnings (should fix)
- [ ] [Warning description with recommendation]

### Passed Checks
- [x] [Check description]
```

Prioritize errors over warnings. Group findings by schema type.

---

*Soli Deo Gloria*
