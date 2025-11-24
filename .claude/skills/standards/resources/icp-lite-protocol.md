# ICP-Lite v1.0 Protocol Specification

**Version**: 1.0.0
**Protocol Version**: ICP-Lite v1.0
**Last Updated**: 2025-11-24
**Purpose**: AI-first content metadata standard
**Line Count**: ~250 lines

---

## Overview

**ICP-Lite** (Intelligent Content Protocol - Lite) is a lightweight metadata standard that helps AI systems understand, navigate, and summarize web content.

**Design Goals**:
- Minimal overhead (3 required meta tags)
- Human-readable and machine-parse-able
- Helps AI understand content freshness and purpose
- No complex schemas or dependencies

---

## Required Meta Tags

### 1. ai-summary

**Purpose**: Brief description for AI consumption

**Format**:
```html
<meta name="ai-summary" content="Brief description of page content"/>
```

**Requirements**:
- **Length**: 50-200 characters recommended
- **Tone**: Descriptive, not marketing
- **Content**: What the page actually contains
- **Audience**: Written for AI, not humans

**Good Examples**:
```html
<meta name="ai-summary" content="Home page for sailing blog In the Wake, featuring latest posts about cruising the Great Loop"/>

<meta name="ai-summary" content="Ship profile for Koinonia, a 2003 Mainship 390 Trawler currently cruising the Great Loop"/>

<meta name="ai-summary" content="Complete list of ports visited during Great Loop journey with dates and experiences"/>
```

**Bad Examples**:
```html
<!-- ❌ Too short -->
<meta name="ai-summary" content="Home page"/>

<!-- ❌ Marketing speak -->
<meta name="ai-summary" content="The ultimate guide to amazing sailing adventures!"/>

<!-- ❌ Too long -->
<meta name="ai-summary" content="Welcome to In the Wake, where..."/>
```

---

### 2. last-reviewed

**Purpose**: When content was last reviewed for accuracy

**Format**:
```html
<meta name="last-reviewed" content="YYYY-MM-DD"/>
```

**Requirements**:
- **Format**: ISO 8601 date (YYYY-MM-DD)
- **Meaning**: Last time a human verified content accuracy
- **Not**: Last edit date (use git for that)
- **Update**: When content is reviewed, even if not changed

**Examples**:
```html
<meta name="last-reviewed" content="2025-11-24"/>
<meta name="last-reviewed" content="2025-01-15"/>
```

**When to Update**:
- ✅ Content reviewed and verified accurate
- ✅ Facts checked against current reality
- ✅ Links verified as still working
- ❌ Not just for CSS/layout changes
- ❌ Not for typo fixes

---

### 3. content-protocol

**Purpose**: Declare protocol version

**Format**:
```html
<meta name="content-protocol" content="ICP-Lite v1.0"/>
```

**Requirements**:
- **Value**: Exactly "ICP-Lite v1.0"
- **Case**: Exact match required
- **Purpose**: Helps AI know how to parse other metadata

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
  <meta name="ai-summary" content="Ship profile for Koinonia, our 2003 Mainship 390 Trawler currently on the Great Loop"/>
  <meta name="last-reviewed" content="2025-11-24"/>
  <meta name="content-protocol" content="ICP-Lite v1.0"/>

  <title>Koinonia - Our Ship | In the Wake</title>
</head>
<body>
  <!-- page content -->
</body>
</html>
```

---

## AI Usage Guidelines

### For AI Systems Reading ICP-Lite Pages

**1. Check for Protocol**:
```javascript
const protocol = document.querySelector('meta[name="content-protocol"]');
if (protocol && protocol.content === 'ICP-Lite v1.0') {
  // Parse ICP-Lite metadata
}
```

**2. Extract Summary**:
```javascript
const summary = document.querySelector('meta[name="ai-summary"]')?.content;
// Use for page understanding, not display
```

**3. Check Freshness**:
```javascript
const reviewed = document.querySelector('meta[name="last-reviewed"]')?.content;
const reviewDate = new Date(reviewed);
const age = Date.now() - reviewDate.getTime();

if (age < 90 * 24 * 60 * 60 * 1000) {
  // Content reviewed within 90 days - likely fresh
}
```

---

## Validation

### Required Checks

```bash
# 1. Protocol declaration present
grep -q 'content-protocol.*ICP-Lite v1.0' index.html

# 2. AI summary present
grep -q 'ai-summary' index.html

# 3. Last reviewed present
grep -q 'last-reviewed' index.html

# 4. Date format valid (YYYY-MM-DD)
grep -E 'last-reviewed.*[0-9]{4}-[0-9]{2}-[0-9]{2}' index.html
```

---

## Benefits

### For Content Creators

1. **AI Understanding**: AI can quickly understand page purpose
2. **Freshness Signals**: last-reviewed tells AI if content is stale
3. **Better Summaries**: AI has context for generating summaries
4. **Minimal Effort**: Only 3 meta tags required

### For AI Systems

1. **Quick Context**: No need to parse entire page
2. **Freshness Check**: Know if content is current
3. **Protocol Version**: Know how to parse metadata
4. **Consistent Format**: Same tags across all pages

### For Users

1. **Better Search**: AI search engines use metadata
2. **Accurate Results**: Fresh content ranked higher
3. **Relevant Summaries**: AI summaries are more accurate
4. **Transparent**: Last-reviewed shows content maintenance

---

## Migration Guide

### Adding to Existing Site

**Step 1**: Add protocol declaration
```html
<meta name="content-protocol" content="ICP-Lite v1.0"/>
```

**Step 2**: Add ai-summary (per page)
```html
<meta name="ai-summary" content="[Describe this page in 50-200 chars]"/>
```

**Step 3**: Add last-reviewed (use today's date initially)
```html
<meta name="last-reviewed" content="2025-11-24"/>
```

**Step 4**: Update last-reviewed when you review content
- Set reminders to review quarterly
- Update date after verifying accuracy

---

## Future Versions

**ICP-Lite is designed to be stable**. Version 1.0 should remain compatible indefinitely.

**Possible v2.0 additions** (not currently required):
- `ai-audience`: Target audience (general/technical/specialized)
- `ai-intent`: User intent (learn/buy/navigate/contact)
- `ai-type`: Content type (article/product/profile/list)

**Backward Compatibility**:
- v1.0 pages will always be valid
- New fields will be optional
- Old parsers can ignore new fields

---

## Relationship to Other Standards

### ICP-Lite + AI-Breadcrumbs

**ICP-Lite**: Page-level metadata (what, when)
**AI-Breadcrumbs**: Entity-level context (who, where, why)

**Use both**: Entity pages (ships, ports, restaurants)
**Use ICP-Lite only**: General pages (home, about, contact)

### ICP-Lite + Schema.org

**Not competitors**: They serve different purposes

**ICP-Lite**: AI-first, minimal, content freshness
**Schema.org**: SEO-first, comprehensive, structured data

**Use both**: ICP-Lite for AI, Schema.org for search engines

---

## FAQs

**Q: Is this a standard from a standards body?**
A: No, ICP-Lite is a lightweight convention, not an official standard. It's designed to be simple enough that anyone can implement it.

**Q: Do search engines use this?**
A: Not officially (yet), but AI-powered search engines may use it for better understanding.

**Q: How often should I update last-reviewed?**
A: Quarterly for static content, after any major changes, or when you verify facts are still accurate.

**Q: Can I add extra meta tags?**
A: Yes! ICP-Lite only specifies 3 required tags. Add whatever else you need.

**Q: What if my CMS can't add meta tags easily?**
A: ICP-Lite is optional. If it's too hard to implement, skip it. But for static sites, it's very easy.

---

## Reference Implementation

```javascript
// validate-icp-lite.js
function validateICPLite(html) {
  const errors = [];

  // Check protocol
  if (!html.includes('content-protocol')) {
    errors.push('Missing content-protocol meta tag');
  } else if (!html.includes('ICP-Lite v1.0')) {
    errors.push('content-protocol must be "ICP-Lite v1.0"');
  }

  // Check ai-summary
  if (!html.includes('name="ai-summary"')) {
    errors.push('Missing ai-summary meta tag');
  }

  // Check last-reviewed
  if (!html.includes('name="last-reviewed"')) {
    errors.push('Missing last-reviewed meta tag');
  } else {
    const match = html.match(/name="last-reviewed"\s+content="([^"]+)"/);
    if (match) {
      const date = match[1];
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        errors.push('last-reviewed must be YYYY-MM-DD format');
      }
    }
  }

  return errors;
}
```

---

## Conclusion

**ICP-Lite v1.0** is a minimal, AI-first metadata standard:
- 3 required meta tags
- Easy to implement
- Helps AI understand content
- Signals content freshness

**Start today**: Add these 3 tags to your pages and help AI serve your content better.

---

**End of icp-lite-protocol.md** (~250 lines)
