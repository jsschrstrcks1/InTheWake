# Routine Maintenance Tasks

**For:** In the Wake (cruisinginthewake.com)
**Last Updated:** 2026-01-17
**Version:** ITW-Lite v3.010

---

## Overview

This document outlines routine maintenance tasks for the In the Wake website. These tasks help maintain content quality, standards compliance, and site health. Run these tasks regularly to ensure the site remains functional and up to standards.

---

## Quick Reference - Maintenance Commands

| Task | Command | Frequency |
|------|---------|-----------|
| Validate ICP-Lite compliance | `node admin/validate-icp-lite-v14.js --all` | Weekly |
| Validate ship pages | `node admin/validate-ship-page.js --all-ships` | After edits |
| Validate port pages | `node admin/validate-port-page-v2.js` | After edits |
| Check broken links | GitHub Actions (Lychee) | On push |
| WebP audit | `python3 admin/webp_audit.py` | Monthly |
| Update unfinished tasks | `./admin/update-unfinished-tasks.sh` | Weekly |
| Generate sitemap | `python3 admin/generate_sitemap.py` | After adding pages |
| Generate search index | `python3 admin/generate_search_index.py` | After content changes |
| Find stale pages (6+ months) | See Section 1.5 | Monthly |

---

## 1. Content Quality Maintenance

### 1.1 ICP-Lite Metadata Updates

**Frequency:** Weekly or after content edits

**What:** Ensure all pages have valid ICP-Lite v1.4 metadata.

**Commands:**
```bash
# Validate all pages
node admin/validate-icp-lite-v14.js --all

# Validate specific file
node admin/validate-icp-lite-v14.js ships/rcl/adventure-of-the-seas.html
```

**Checks:**
- `ai-summary` meta tag exists (max 250 chars, first 155 standalone)
- `last-reviewed` meta tag with valid date
- `content-protocol` set to "ICP-Lite v1.4"
- JSON-LD `description` mirrors `ai-summary` exactly
- JSON-LD `dateModified` mirrors `last-reviewed` exactly

**Reference:** `.claude/skills/standards/resources/icp-lite-protocol.md`

---

### 1.2 Placeholder Content Check

**Frequency:** Weekly

**What:** Find and fill in "Unknown" placeholders.

**Commands:**
```bash
# Check for Unknown placeholders (runs in CI)
grep -r --include="*.html" "Unknown" . | grep -v node_modules
```

**Common Patterns to Fix:**
- `Unknown ship`
- `Unknown photographer`
- `Photo by: Unknown`
- `Attribution: Unknown`

**Action:** Replace with actual information or remove if not applicable.

---

### 1.3 Content Length Validation

**Frequency:** Monthly

**What:** Ensure content sections meet minimum length requirements.

**Standards:**
| Content Type | Minimum |
|-------------|---------|
| FAQ sections | 200 words |
| Logbook stories | 300 words |
| Page static content | 500 words |
| Alt text | 20 characters |

**Command:**
```bash
node admin/validate-ship-page.js --all-ships 2>&1 | grep -E "(FAQ|story|content)"
```

---

### 1.4 Logbook Persona Coverage

**Frequency:** Monthly

**What:** Ensure ship pages have stories covering all required personas.

**Required Personas:**
- Solo traveler
- Multi-generational / family
- Honeymoon / couple
- Elderly / retiree
- Widow / grief
- Accessible / special needs

**Check:**
```bash
node admin/validate-ship-page.js --all-ships 2>&1 | grep "persona"
```

**Reference:** `admin/UNFINISHED-TASKS.md` for current status

---

### 1.5 Last-Reviewed Date Updates (CRITICAL)

**Frequency:** Every time a page is edited

**What:** Update the `last-reviewed` meta tag and matching JSON-LD `dateModified` whenever ANY change is made to a page.

**Why This Matters:**
- Google uses `dateModified` to assess content freshness
- AI systems use `last-reviewed` to determine information currency
- Stale dates signal outdated content to both humans and machines
- Fresh dates improve search ranking and AI trust

**Required Updates When Editing ANY Page:**
```html
<!-- Update the meta tag -->
<meta name="last-reviewed" content="2026-01-17"/>

<!-- Update the matching JSON-LD (MUST be identical) -->
"dateModified": "2026-01-17"
```

**Rule:** If you touch a page, update the date. No exceptions.

---

### 1.6 Stale Page Audit (6+ Months)

**Frequency:** Monthly

**What:** Identify pages that haven't been reviewed in 6+ months and prioritize them for updates.

**Why:** Pages with old `last-reviewed` dates:
- May contain outdated information
- Signal to Google/AI that content may be stale
- Risk losing search ranking over time
- May have broken links or missing images

**Command to Find Stale Pages:**
```bash
# Find pages with last-reviewed dates older than 6 months
# This searches for dates before the cutoff (adjust YYYY-MM as needed)
grep -r --include="*.html" 'name="last-reviewed"' . | \
  grep -E 'content="202[0-4]|content="2025-0[1-6]"' | \
  cut -d: -f1 | sort -u
```

**Alternative - Check by Directory:**
```bash
# Check ship pages
for f in ships/**/*.html; do
  DATE=$(grep -o 'last-reviewed" content="[^"]*' "$f" | cut -d'"' -f3)
  if [[ "$DATE" < "2025-07-01" ]]; then
    echo "STALE: $f ($DATE)"
  fi
done

# Check port pages
for f in ports/**/*.html; do
  DATE=$(grep -o 'last-reviewed" content="[^"]*' "$f" | cut -d'"' -f3)
  if [[ "$DATE" < "2025-07-01" ]]; then
    echo "STALE: $f ($DATE)"
  fi
done
```

**When Refreshing Stale Pages:**
1. Review content for accuracy
2. Update any outdated information
3. Fix broken links
4. Verify images still exist
5. Update `last-reviewed` and `dateModified` to today
6. Run page validator

**Priority Order for Stale Pages:**
1. High-traffic pages (popular ships, major ports)
2. Pages with oldest dates
3. Pages with known issues

---

## 2. Link and Reference Maintenance

### 2.1 Broken Link Check

**Frequency:** On every push (automated via GitHub Actions)

**What:** Identify and fix broken internal and external links.

**Automated:** `.github/workflows/quality.yml` runs Lychee link checker

**Manual Check:**
```bash
# View latest link check report
cat ./lychee-report.md
```

**Exclusions (known false positives):**
- facebook.com
- twitter.com / x.com
- instagram.com
- localhost / 127.0.0.1

---

### 2.2 WebP Image Reference Verification

**Frequency:** Monthly or after adding images

**What:** Ensure all WebP references in code point to existing files.

**Commands:**
```bash
# Comprehensive audit
python3 admin/webp_audit.py

# Verify all references
python3 admin/verify_webp_files.py

# Verify updates are valid
python3 admin/verify_webp_updates.py
```

**Note:** Logo files (`logo_wake.png`) must remain as PNG.

---

### 2.3 Navigation Consistency

**Frequency:** After adding new sections

**What:** Ensure navigation includes all required links.

**Required Navigation Items:**
- `/ships/quiz.html`
- `/internet-at-sea.html`
- All cruise line pages
- All tool pages

**Command:**
```bash
python3 admin/audit_navigation_pattern.py
```

---

## 3. Standards Compliance Maintenance

### 3.1 Theological Foundation Check

**Frequency:** On every push (automated)

**What:** Verify all HTML pages have Soli Deo Gloria invocation.

**Required (before line 20):**
```html
<!--
Soli Deo Gloria
All work on this project is offered as a gift to God.
"Trust in the LORD with all your heart..." — Proverbs 3:5
"Whatever you do, work heartily..." — Colossians 3:23
-->
```

**Automated:** GitHub Actions checks this on push

**Manual Check:**
```bash
# Count pages with invocation
grep -r --include="*.html" -l "Soli Deo Gloria" . | wc -l

# Count total HTML pages
find . -name "*.html" -type f | wc -l
```

**Reference:** `.claude/skills/standards/resources/theological-foundation.md`

---

### 3.2 HTML Structure Validation

**Frequency:** Weekly

**What:** Check for structural issues in HTML.

**Checks:**
- DOCTYPE declaration present
- Balanced div tags
- Valid ARIA attributes
- Proper heading hierarchy

**Automated:** GitHub Actions samples files on push

**Manual Check:**
```bash
# Check div balance on specific file
OPEN=$(grep -o "<div" file.html | wc -l)
CLOSE=$(grep -o "</div>" file.html | wc -l)
echo "Open: $OPEN, Close: $CLOSE"
```

---

### 3.3 JSON-LD Schema Validation

**Frequency:** After content edits

**What:** Verify JSON-LD blocks are valid and complete.

**Required Blocks (7 per page):**
1. Organization
2. WebSite
3. BreadcrumbList
4. Review
5. Person
6. WebPage
7. FAQPage (on relevant pages)

**Commands:**
```bash
# Fix JSON-LD schemas
node admin/fix-jsonld-schemas.js

# Batch fix organization JSON-LD
node admin/batch-fix-org-jsonld-v3.js
```

---

## 4. Ship Page Maintenance

### 4.1 Ship Page Validation

**Frequency:** After any ship page edit

**What:** Validate ship pages against v3.010 standards.

**Commands:**
```bash
# Validate all ships
node admin/validate-ship-page.js --all-ships

# Validate specific cruise line
node admin/validate-ship-page.js ships/celebrity-cruises/*.html

# Validate single page
./admin/validate-ship-page.sh ships/rcl/adventure-of-the-seas.html
```

**Required Sections:**
- First Look / Hero
- Ship Stats
- Dining & Restaurants
- Logbook (stories)
- Videos
- Deck Plans
- Live Tracker
- FAQ
- Attribution

---

### 4.2 Video Category Coverage

**Frequency:** Monthly

**What:** Ensure ships have videos in all required categories.

**Required Categories:**
- Ship walk through
- Top ten tips
- Suite cabin
- Balcony cabin
- Oceanview cabin
- Interior cabin
- Food/dining
- Accessible

**Check:**
```bash
node admin/validate-ship-page.js --all-ships 2>&1 | grep "video"
```

---

### 4.3 Image Requirements

**Frequency:** After adding ship pages

**What:** Verify minimum image count and alt text quality.

**Requirements:**
- Minimum 8 images per ship page
- Alt text minimum 20 characters
- Descriptive, context-rich alt text

**Check:**
```bash
node admin/validate-ship-page.js --all-ships 2>&1 | grep -E "(image|alt)"
```

---

## 5. Search and Discovery Maintenance

### 5.1 Search Index Regeneration

**Frequency:** After significant content changes

**What:** Regenerate the search index for site search.

**Command:**
```bash
python3 admin/generate_search_index.py
```

---

### 5.2 Sitemap Generation

**Frequency:** After adding new pages

**What:** Regenerate sitemap.xml for search engines.

**Command:**
```bash
python3 admin/generate_sitemap.py
```

---

## 6. Security Maintenance

### 6.1 Pre-Commit Security Checks

**Frequency:** Automatic on commit

**What:** Prevent committing secrets or vulnerable code.

**Automated Checks:**
- Blocks forbidden files (.env, .pem, .key, .sql, credentials)
- Detects secret patterns
- Smart DOM XSS detection (innerHTML, href, eval, document.write)
- Analytics requirement verification

**Setup:**
```bash
cp admin/hooks/pre-commit .git/hooks/
chmod +x .git/hooks/pre-commit
```

**Reference:** `admin/GIT_HOOKS_SYSTEM.md`

---

### 6.2 JavaScript Security Review

**Frequency:** After JavaScript changes

**What:** Check for XSS vulnerabilities.

**Dangerous Patterns:**
- `innerHTML` with user input
- `eval()` usage
- `document.write()`
- Unsafe `href` assignment

**Pre-commit hook catches most issues automatically.**

---

## 7. Performance Maintenance

### 7.1 Image Optimization

**Frequency:** After adding images

**What:** Ensure images are optimized for web.

**Checks:**
- Images in WebP format
- Lazy loading (`loading="lazy"`) on below-fold images
- `fetchpriority="high"` on hero images
- Proper srcset for responsive images

**Commands:**
```bash
# Audit WebP status
python3 admin/webp_audit.py

# Fix lazy loading
node admin/batch-fix-lazy-images.js
```

---

### 7.2 Core Web Vitals

**Frequency:** Monthly

**What:** Monitor and improve Core Web Vitals.

**Metrics:**
- LCP (Largest Contentful Paint) < 2.5s
- FID (First Input Delay) < 100ms
- CLS (Cumulative Layout Shift) < 0.1

**Tools:**
- Google PageSpeed Insights
- Lighthouse audit
- Chrome DevTools Performance panel

---

## 8. Documentation Maintenance

### 8.1 Unfinished Tasks Update

**Frequency:** Weekly

**What:** Update the unfinished tasks tracking file.

**Command:**
```bash
./admin/update-unfinished-tasks.sh
```

**Output:** Updates `admin/UNFINISHED-TASKS.md` with current validation status.

---

### 8.2 Changelog Updates

**Frequency:** After significant changes

**What:** Document changes in changelog.

**Command:**
```bash
# Use Claude command
/add-to-changelog
```

---

## Maintenance Calendar

| Day | Task |
|-----|------|
| **Daily** | Review CI/CD status, fix any failures |
| **Weekly** | ICP-Lite validation, placeholder check, update unfinished tasks |
| **Monthly** | Content length validation, persona coverage, WebP audit, Core Web Vitals, **stale page audit** |
| **After Edits** | Ship page validation, JSON-LD verification, **update last-reviewed date** |
| **After Adding Pages** | Regenerate sitemap, regenerate search index |

### Critical Reminder: Last-Reviewed Dates

**Every page edit MUST include updating:**
1. `<meta name="last-reviewed" content="YYYY-MM-DD"/>`
2. `"dateModified": "YYYY-MM-DD"` in JSON-LD WebPage block

These must match exactly. This is non-negotiable for Google/AI freshness signals.

---

## Troubleshooting

### Validation Failing

1. Check error messages for specific issues
2. Reference the relevant standards document
3. Use batch fix scripts when available

### Links Breaking

1. Check Lychee report for specific URLs
2. Update or remove broken links
3. Consider redirects for moved content

### Images Missing

1. Run `python3 admin/verify_webp_files.py`
2. Check file names match references
3. Ensure WebP conversion completed

---

## Related Documents

- **Standards:** `new-standards/README.md`
- **Ship Page Standards:** `new-standards/foundation/SHIP_PAGE_STANDARDS_v3.007.010.md`
- **ICP-Lite Protocol:** `.claude/skills/standards/resources/icp-lite-protocol.md`
- **WCAG Standards:** `new-standards/foundation/WCAG_2.1_AA_STANDARDS_v3.100.md`
- **Unfinished Tasks:** `admin/UNFINISHED-TASKS.md`
- **Admin README:** `admin/README.md`

---

*Soli Deo Gloria*
