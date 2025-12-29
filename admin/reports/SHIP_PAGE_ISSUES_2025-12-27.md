# Ship Page Validation Report

**Date:** 2025-12-27
**Standard:** ITW-SHIP-001 v1.0
**Validator:** validate-ship-page.js
**Scope:** All Royal Caribbean ship pages (49 files)

---

## Executive Summary

| Metric | Value |
|--------|-------|
| Total Pages | 49 |
| Passed | 0 |
| Failed | 49 |
| Total Errors | 222 |
| Total Warnings | 127 |

**All pages require remediation.** The issues range from minor image attribute problems to critical template aliasing bugs.

---

## Issue Categories

### Critical Issues (BLOCKING)

#### 1. Template Aliasing Bugs (TBN Ships)
**Severity:** Critical - Content references wrong ship

Found in TBN (To-Be-Named) ship pages where template placeholders were not properly replaced:

| Page | Issue |
|------|-------|
| `icon-class-ship-tbn-2027.html` | References "Radiance" instead of Icon Class |
| `icon-class-ship-tbn-2028.html` | References wrong ship in headings |
| `star-class-ship-tbn-2028.html` | Template not customized |
| `quantum-ultra-class-ship-tbn-2028.html` | Wrong class reference |
| `quantum-ultra-class-ship-tbn-2029.html` | Wrong class reference |
| `oasis-class-ship-tbn-2028.html` | Template issues |
| `discovery-class-ship-tbn.html` | Template issues |

**Specific Problems:**
- Video section heading says "Watch: Radiance Highlights" on Icon Class page
- Tracker heading says "Where Is Radiance Right Now?" on Icon Class page
- Review JSON-LD references "Radiance-class" instead of "Icon-class"
- Dining section alt text references wrong ship

#### 2. AI-Breadcrumbs Format Issues
**Count:** 30+ pages affected

| Issue | Count | Description |
|-------|-------|-------------|
| `wrong_entity` | 30 | Entity field contains ship name instead of "Ship" |
| `missing_name` | 30 | Missing `name:` field in breadcrumbs |
| `missing_operator` | 30 | Missing `operator:` field |
| `missing_siblings` | 23 | Missing sister ship references |

**Example Wrong Format:**
```html
<!-- ai-breadcrumbs
     entity: Icon Class Ship (TBN 2027)  <!-- WRONG: Should be "Ship" -->
     ...
-->
```

**Correct Format:**
```html
<!-- ai-breadcrumbs
entity: Ship
name: Icon Class Ship (TBN 2027)
class: Icon Class
operator: Royal Caribbean
...
-->
```

#### 3. Missing Data Attributes
**Count:** 11 pages

| Issue | Description |
|-------|-------------|
| `missing_data_imo` | Ships missing `data-imo` attribute for MarineTraffic tracking |

---

### Medium Issues (BLOCKING)

#### 4. Image Alt Text Issues
**Count:** 47 pages affected

| Issue | Count | Description |
|-------|-------|-------------|
| `missing_alt` | 47 | Images missing alt text entirely |
| `short_alt` | 47 | Alt text under 20 characters |

#### 5. Missing Required Sections
**Count:** 13 pages

Pages missing required sections like:
- `first_look`
- `logbook`
- `videos`
- `tracker`

---

### Minor Issues (WARNINGS)

#### 6. Image Loading Optimization
**Count:** 47 pages

| Issue | Count | Description |
|-------|-------|-------------|
| `missing_lazy` | 47 | Non-hero images missing `loading="lazy"` |

#### 7. AI Summary Length
**Count:** 11 pages

| Issue | Description |
|-------|-------------|
| `ai_summary_short` | AI summary under 100 characters (recommended: 100-250) |

---

## Pages by Score

### Score 86+ (Near Passing)
These pages only need minor fixes:

- `harmony-of-the-seas.html` (86) - 1 missing alt
- `serenade-of-the-seas.html` (86) - 1 missing alt
- `ovation-of-the-seas.html` (86) - 1 missing alt
- `odyssey-of-the-seas.html` (86) - 1 missing alt
- `oasis-of-the-seas.html` (86) - 1 missing alt
- `navigator-of-the-seas.html` (86) - 1 missing alt
- `mariner-of-the-seas.html` (86) - 1 missing alt
- `liberty-of-the-seas.html` (86) - 1 missing alt
- `jewel-of-the-seas.html` (86) - 1 missing alt
- `independence-of-the-seas.html` (86) - 1 missing alt
- `icon-of-the-seas.html` (86) - 1 missing alt
- `freedom-of-the-seas.html` (86) - 1 missing alt
- `explorer-of-the-seas.html` (86) - 1 missing alt
- `brilliance-of-the-seas.html` (86) - 1 missing alt
- `anthem-of-the-seas.html` (86) - 1 missing alt
- `allure-of-the-seas.html` (86) - 1 missing alt

### Score 50-85 (Moderate Issues)
- Various active ships with AI-breadcrumbs or section issues

### Score <50 (Major Issues)
TBN ships and legacy pages with template aliasing problems:

- `icon-class-ship-tbn-2027.html` (16)
- `icon-class-ship-tbn-2028.html` (14)
- `star-class-ship-tbn-2028.html` (14)
- `quantum-ultra-class-ship-tbn-2028.html` (14)
- `quantum-ultra-class-ship-tbn-2029.html` (14)
- `oasis-class-ship-tbn-2028.html` (12)
- `discovery-class-ship-tbn.html` (12)
- `nordic-prince.html` (0)
- `quantum-of-the-seas.html` (0)

---

## Remediation Priority

### Phase 1: Critical Template Aliasing (7 pages)
Fix all TBN ship pages with wrong ship references:
1. Update Review JSON-LD `itemReviewed.description` to correct class
2. Fix video section heading
3. Fix tracker section heading
4. Fix dining section alt text
5. Update AI-breadcrumbs format

### Phase 2: AI-Breadcrumbs Normalization (30 pages)
Update all pages to use correct breadcrumb format:
```html
<!-- ai-breadcrumbs
entity: Ship
name: [Ship Name]
class: [Class Name]
operator: Royal Caribbean
parent: /ships.html
siblings: [Comma-separated sister ships]
updated: YYYY-MM-DD
-->
```

### Phase 3: Image Accessibility (47 pages)
1. Add missing alt text to all images
2. Expand short alt text to 20+ characters
3. Add `loading="lazy"` to non-hero images

### Phase 4: Data Attributes (11 pages)
Add `data-imo` attributes to all active ships for MarineTraffic tracking.

---

## Automation Opportunity

The following fixes can be automated with Python scripts:

1. **AI-Breadcrumbs Normalization** - Parse and restructure existing breadcrumbs
2. **Image Loading Attribute** - Add `loading="lazy"` to all `<img>` tags
3. **Template Aliasing Detection** - Find and flag mismatched ship references

---

## Recommended Scripts

### 1. normalize_ship_breadcrumbs.py
Normalizes AI-breadcrumbs format across all ship pages.

### 2. fix_image_attributes.py
Adds missing `loading="lazy"` and flags missing alt text.

### 3. fix_tbn_template.py
Detects and fixes template aliasing issues in TBN ship pages.

---

## Next Steps

1. Review this report with stakeholder
2. Prioritize which issues to fix first
3. Run automated fixes for low-risk changes
4. Manual review for template aliasing issues
5. Re-run validator to confirm all fixes

---

*Report generated by validate-ship-page.js*
*Soli Deo Gloria*
