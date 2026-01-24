# Routine Maintenance Tasks

**For:** In the Wake (cruisinginthewake.com)
**Last Updated:** 2026-01-24
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
| Find stale pages (6+ months) | See Section 1.6 | Monthly |
| Vanilla stories audit | See Section 1.7 | Quarterly |
| Port page validation | `node admin/validate-port-page-v2.js` | After edits |
| Review admin reports | See Section 8.3 | Weekly |
| Discoverability check | See Section 5.3 | After adding pages |
| Ship deployments update | See Section 10.1 | Bi-annually (Fall/Spring) |
| Add new cruise line data | See Section 10.2 | As resources allow |

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

**ICP-Lite Review Cadence (from protocol):**
| Page Type | Review Frequency |
|-----------|------------------|
| Tool pages (prices, calculators) | Weekly |
| Hub pages (ships.html, ports.html) | Monthly |
| Ship pages | Quarterly |
| Port pages | As-needed |
| New pages | On creation |

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

### 1.7 Vanilla Stories Audit (MAJOR BACKLOG)

**Frequency:** Quarterly review, ongoing work

**What:** Replace generic template stories with authentic, ship-specific content.

**Current Status:**
- ~157 ships have "vanilla" template stories
- ~1,570 total stories need to be written
- Cruise lines affected: Holland America, Princess, MSC, Norwegian, Costa, Oceania, Regent, Seabourn, Silversea, Virgin, Cunard, Explora

**Vanilla Story Characteristics (BAD):**
- Generic titles like "First Impressions of [Ship Name]"
- Template text that fits any ship
- "Community Contributor" as author
- 100-150 word count (too short)
- No ship-specific venues mentioned
- No emotional narrative

**Quality Story Characteristics (GOOD):**
- Specific ship venues mentioned
- Real author name with location
- Service recovery narrative (crisis → response → resolution)
- Emotional pivot / tearjerker moment
- Faith-scented references (natural, not forced)
- 300-600 word count
- Unique persona perspective

**Reference:** `admin/VANILLA-STORIES.md` for full inventory

**Priority Order:**
1. Holland America (46 ships - HIGH)
2. MSC (24 ships - HIGH)
3. Norwegian (20 ships - HIGH)
4. Princess (17 ships - HIGH)
5. Other cruise lines (MEDIUM)

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

### 3.4 Trust Badge Verification

**Frequency:** After page edits

**What:** Verify all pages have the trust badge in footer.

**Required Badge:**
```html
<p class="trust-badge">✓ No ads. No tracking. No affiliate links.</p>
```

**Check:** The ICP-Lite validator checks for this automatically.

---

### 3.5 Analytics Requirements

**Frequency:** Pre-commit (automated)

**What:** Verify all HTML pages have BOTH analytics scripts.

**Required Scripts:**
1. **Google Analytics (gtag):**
   ```html
   <script async src="https://www.googletagmanager.com/gtag/js?id=..."></script>
   ```

2. **Umami Analytics:**
   ```html
   <script defer src="https://cloud.umami.is/script.js" data-website-id="..."></script>
   ```

**Checked By:** `admin/hooks/pre-commit` (automatic on commit)

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

### 4.4 Content Purity Checks

**Frequency:** During validation

**What:** Ensure content doesn't contain forbidden language patterns.

**Forbidden Patterns (blocking):**
- `eval()` in JavaScript
- `document.write()`
- Bar hopping / pub crawl references
- "Get drunk" or similar

**Warning Patterns (flagged but allowed):**
- Brochure language: "you'll love", "perfect for", "ideal choice"
- Self-promotion: "see our guide", "check our calculator"
- Casino references (allowed if "Casino Royale" context)

**Check:** Ship/port validators flag these automatically.

---

### 4.5 Faith-Scented Content Verification

**Frequency:** During validation

**What:** Verify logbook stories contain appropriate faith markers and emotional pivots.

**Faith Markers (at least one expected):**
- god, prayer, scripture, blessing, grace, faith
- soul, spirit, awe, wonder, healing, hope
- Scripture references (Proverbs, Colossians)

**Emotional Pivot Markers (in logbook stories):**
- tears, crying, wept, choked up
- "heart ached/swelled/broke"
- healing, reconciliation, forgiveness
- "for the first time in..."

**Note:** These are checked by the ship validator to ensure stories have emotional depth, not just informational content.

---

### 4.6 Section Order Enforcement

**Frequency:** During validation

**What:** Ship pages must follow STRICT section order.

**Required Order:**
1. page_intro (ICP-Lite answer-line)
2. first_look (carousel + stats)
3. dining (venues)
4. logbook (stories)
5. videos (highlights)
6. map (deck plans)
7. tracker (live position)
8. faq
9. attribution

**Gold Standards:** `ships/rcl/radiance-of-the-seas.html`, `ships/rcl/grandeur-of-the-seas.html`

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

### 5.3 Discoverability Checks

**Frequency:** After adding new ship/port pages

**What:** Ensure new pages are linked from hub pages and search index.

**For Ship Pages - Must be linked from:**
1. `ships.html` (fleet index)
2. `search.html` (search index)
3. Ship atlas (`data/atlas/`)

**For Port Pages - Must be linked from:**
1. `ports.html` (port index)
2. `search.html` (search index)

**90% Rule:** Ships must score 90%+ on validation before being added to atlas.

**Check:**
```bash
# The ship validator checks this automatically
node admin/validate-ship-page.js ships/rcl/new-ship.html 2>&1 | grep -i "discoverability"
```

**Active Ships:** Missing from search = BLOCKING error
**TBN/Historic Ships:** Missing from search = WARNING only

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

### 8.3 Admin Reports Review

**Frequency:** Weekly

**What:** Review generated reports in `admin/reports/` for issues.

**Available Reports:**
| Report | Purpose |
|--------|---------|
| `SHIP_VALIDATION_REPORT.json` | Ship page validation results |
| `SHIP_PAGE_ISSUES_*.md` | Specific ship page issues |
| `ORPHANED_FILES_REPORT.md` | Files not linked from anywhere |
| `CODE_LINT_REPORT.md` | Code quality issues |
| `ATTRIBUTIONS.md` | Image attribution status |
| `articles.html` | Articles audit |
| `sw-health.html` | Service worker health |

**Action:** Review reports, prioritize fixes based on severity.

---

## 9. Port Page Maintenance

### 9.1 Port Page Validation

**Frequency:** After any port page edit

**What:** Validate port pages against ITC v1.1 standards.

**Command:**
```bash
node admin/validate-port-page-v2.js ports/caribbean/cozumel.html
```

**Required Sections:**
- Hero image
- Logbook (first-person experience)
- Cruise port info
- Getting around
- Excursions
- Depth soundings (final thoughts)
- FAQ
- Gallery

---

### 9.2 Port Disclaimer Registry

**Frequency:** After visiting a port or planning a cruise

**What:** Maintain the three-level disclaimer system based on author experience.

**Disclaimer Levels:**
| Level | Status | Disclaimer Text Starts With |
|-------|--------|----------------------------|
| 1 | Not visited | "Until I have sailed this port myself..." |
| 2 | Visit planned | "I will be sailing to this port..." |
| 3 | Personally visited | "I've sailed this port myself..." |

**Registry File:** `admin/port-disclaimer-registry.json`

**When to Update:**
- After booking a cruise that visits a port → Update to Level 2
- After returning from a cruise → Update to Level 3
- Add visit_count for ports visited multiple times

**Example Entry:**
```json
{
  "level_3_visited": {
    "cozumel": { "visit_date": "2025-03-15", "visit_count": 3 }
  }
}
```

---

### 9.3 Port Site Integration

**Frequency:** After adding new ports

**What:** Ensure ports are properly linked from hub pages.

**Checklist:**
- [ ] Port linked from `ports.html`
- [ ] Port in search index (`assets/data/search-index.json`)
- [ ] Cross-links to related ships that visit the port
- [ ] Correct regional grouping

---

## Maintenance Calendar

| Day | Task |
|-----|------|
| **Daily** | Review CI/CD status, fix any failures |
| **Weekly** | ICP-Lite validation, placeholder check, update unfinished tasks, **review admin reports** |
| **Monthly** | Content length validation, persona coverage, WebP audit, Core Web Vitals, **stale page audit** |
| **Quarterly** | **Vanilla stories audit**, port disclaimer registry review |
| **Bi-annually** | **Ship deployments update** (April/October - seasonal changes + announcements) |
| **After Edits** | Ship/port validation, JSON-LD verification, **update last-reviewed date** |
| **After Adding Pages** | Regenerate sitemap, regenerate search index, **discoverability check** |
| **After Cruises** | Update port disclaimer registry (Level 2→3) |

### Critical Reminder: Last-Reviewed Dates

**Every page edit MUST include updating:**
1. `<meta name="last-reviewed" content="YYYY-MM-DD"/>`
2. `"dateModified": "YYYY-MM-DD"` in JSON-LD WebPage block

These must match exactly. This is non-negotiable for Google/AI freshness signals.

---

## 10. Ship Deployments Data Maintenance

### 10.1 Ship Deployments JSON Updates

**Frequency:** Bi-annually (Fall and Spring) or when cruise lines announce major deployment changes

**What:** Keep `assets/data/ship-deployments.json` current with ship homeport assignments and typical port calls.

**Data File:** `assets/data/ship-deployments.json`
**JS Module:** `assets/js/ship-port-links.js`

**Current Coverage (as of 2026-01-24):**
- 55 ships (29 Royal Caribbean + 26 Carnival)
- 70 ports with cross-links
- 2 of 15 cruise lines implemented

**When to Update:**
1. **Cruise line announces new ship deployments** (typically October for next year)
2. **New ships enter service** (add to ships object and port_to_ships)
3. **Ship changes homeport** (update homeports array, typical_ports, homeport_details)
4. **Seasonal repositioning** (spring/fall schedule changes)
5. **Ship leaves fleet** (retirements, transfers to other cruise lines)

**Data Sources:**
- Royal Caribbean: [royalcaribbean.com/cruise-ships](https://www.royalcaribbean.com/cruise-ships)
- Carnival: [carnival.com/cruise-ships](https://www.carnival.com/cruise-ships)
- CruiseMapper: [cruisemapper.com](https://www.cruisemapper.com) (deployment schedules)
- Cruise line press releases
- Ship page `ai-summary` metadata (contains homeport info)

**How to Update:**

1. **Add a new ship:**
   ```json
   "new-ship-slug": {
     "name": "Ship Name",
     "class": "Class Name",
     "cruise_line": "rcl|carnival|celebrity|etc",
     "homeports": ["port-slug"],
     "regions": ["region-name"],
     "season": "year-round|seasonal|summer|winter",
     "typical_ports": ["port1", "port2"],
     "itinerary_lengths": [4, 7]
   }
   ```

2. **Update port_to_ships:** Add ship slug to each port it visits
   ```json
   "cozumel": ["existing-ships", "new-ship-slug"]
   ```

3. **Update homeport_details:** If new homeport or adding ships to existing homeport
   ```json
   "new-homeport": {
     "name": "Display Name",
     "state": "State/Province",
     "country": "Country",
     "ships": ["ship-slug"],
     "port_page": "/ports/port-slug.html"
   }
   ```

**Validation:**
```bash
# Validate JSON syntax
python3 -c "import json; json.load(open('assets/data/ship-deployments.json')); print('Valid')"

# Count ships by cruise line
python3 -c "import json; d=json.load(open('assets/data/ship-deployments.json')); print({cl: len([s for s in d['ships'].values() if s.get('cruise_line')==cl]) for cl in ['rcl','carnival']})"
```

---

### 10.2 Adding New Cruise Lines

**Frequency:** As resources allow (see admin/UNFINISHED-TASKS.md for priority list)

**Remaining Cruise Lines (13):**
Celebrity, NCL, Princess, Holland America, MSC, Costa, Cunard, Disney, Virgin Voyages, Oceania, Regent, Seabourn, Silversea, Explora

**Steps to Add a New Cruise Line:**

1. **Update CRUISE_LINES in ship-port-links.js:**
   ```javascript
   'celebrity': {
     name: 'Celebrity Cruises',
     path: '/ships/celebrity/',
     bookingUrl: 'https://www.celebritycruises.com/cruise-ships/',
     allShipsUrl: '/ships.html'
   }
   ```

2. **Add class order for sorting (larger ships first):**
   ```javascript
   'celebrity': ['Edge', 'Millennium', 'Solstice', 'Other']
   ```

3. **Add brand colors:**
   ```javascript
   'celebrity': { bg: '#f5f0eb', border: '#d4c4b0', hover: '#ebe3d9', text: '#1a1a1a' }
   ```

4. **Gather deployment data** from cruise line website and add ships to JSON

5. **Update port_to_ships** for all ports the new cruise line visits

6. **Add homeport_details** for any new homeports

7. **Update UNFINISHED-TASKS.md** to track progress

**Reference:** See git commit `a2fafad4` for example of adding Carnival cruise line

---

### 10.3 Seasonal Deployment Monitoring

**Frequency:** Twice yearly (April and October)

**What:** Cruise lines typically announce seasonal changes:
- **October:** Next year's deployment announcements
- **April:** Summer repositioning takes effect

**Check List:**
- [ ] Ships moving between homeports
- [ ] New seasonal ports being added
- [ ] Ships leaving for drydock or refit
- [ ] New ships entering service

**Typical Seasonal Patterns:**
- **Winter:** Caribbean, Mexico, Australia
- **Summer:** Alaska, Europe, Canada/New England
- **Year-round:** Caribbean hubs (Miami, Port Canaveral, Galveston)

---

### 10.4 Port Name Formatting

**Frequency:** When adding new ports

**What:** Ensure special port names are properly formatted in `ship-port-links.js`.

**Location:** `formatPortName()` function in `assets/js/ship-port-links.js`

**Add entries for ports with special formatting:**
```javascript
const specialNames = {
  'half-moon-cay': 'Half Moon Cay',
  'grand-turk': 'Grand Turk',
  'st-thomas': 'St. Thomas',
  // Add new ports here
};
```

**Note:** Ports not in this list will be auto-formatted from slug (e.g., "cozumel" → "Cozumel")

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

### Core Standards
- **Standards Overview:** `new-standards/README.md`
- **Ship Page Standards:** `new-standards/foundation/SHIP_PAGE_STANDARDS_v3.007.010.md`
- **Port Page Standards:** `admin/PORT-PAGE-STANDARD.md`
- **ICP-Lite Protocol:** `.claude/skills/standards/resources/icp-lite-protocol.md`
- **WCAG Standards:** `new-standards/foundation/WCAG_2.1_AA_STANDARDS_v3.100.md`
- **Theological Foundation:** `.claude/skills/standards/resources/theological-foundation.md`

### Task Tracking
- **Unfinished Tasks:** `admin/UNFINISHED-TASKS.md`
- **Vanilla Stories:** `admin/VANILLA-STORIES.md`
- **Port Disclaimer Registry:** `admin/port-disclaimer-registry.json`

### Data Files
- **Ship Deployments:** `assets/data/ship-deployments.json` (ship-port cross-linking)
- **Ship Port Links JS:** `assets/js/ship-port-links.js` (renders "Ships That Visit Here")

### Admin Tools
- **Admin README:** `admin/README.md`
- **Git Hooks System:** `admin/GIT_HOOKS_SYSTEM.md`
- **Bulk Update Guide:** `admin/BULK_UPDATE_GUIDE.md`

### Claude System
- **Onboarding:** `.claude/ONBOARDING.md`
- **Skill Rules:** `.claude/skill-rules.json`
- **Claude Context:** `claude.md`

---

*Soli Deo Gloria*
