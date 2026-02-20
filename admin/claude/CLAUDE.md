# Claude AI Assistant Guide - In the Wake

**Version:** 1.2.7
**Last Updated:** 2026-02-14
**Purpose:** Comprehensive onboarding and reference guide for Claude AI assistants working on the In the Wake codebase

---

## 🎯 Quick Start

**Welcome, Claude!** This is a cruise planning website with a deep commitment to accessibility, progressive enhancement, and content standards. Before making any changes:

1. **Read this entire file first**
2. **Review the standards files** in `/standards/` directory
	3.	Understand the site’s mission: A Christ-shaped cruise logbook and planning guide that serves ordinary planners and people in hard seasons.
4. **Check UNFINISHED_TASKS.md** for current priorities

---

## 📚 Essential Reading (In Order)

### 1. Standards Documentation
Located in `/standards/` directory:

- **`main-standards.md`** - Global standards, caching, absolute URLs, canonical domain
- **`root-standards.md`** - Root-level page requirements
- **`ships-standards.md`** - Ship page structure, data loading, image discovery
- **`cruise-lines-standards.md`** - Cruise line hub pages
- **`ports-standards.md`** - Port page requirements (Revolution Day notices for Mexican ports)
- **`STANDARDS_ADDENDUM_RCL_v3.006.md`** - Royal Caribbean specific standards

### 2. Claude-Specific Documentation
Located in `/admin/claude/` directory (this folder):

- **`CLAUDE.md`** - This file (main entry point)
- **`ITW-LITE_PROTOCOL.md`** - Content protocol and ICP-Lite implementation
- **`STANDARDS_INDEX.md`** - Master index of all standards
- **`CODEBASE_GUIDE.md`** - Repository structure, patterns, and conventions

### 3. Task Management
- **`UNFINISHED_TASKS.md`** - Comprehensive task list with priorities (P0-P4)
- **`admin/THREAD_AUDIT_2025_11_19.md`** - Recent audit findings
- **`CONSOLIDATED_TASK_LIST_2025_11_23.md`** - Priority-sorted tasks

### 4. Admin Documentation
Located in `/admin/` directory:

- **`README.md`** - Admin tools overview
- **`FIVE_ARTICLE_CATEGORIES.md`** - Solo travel article structure
- **`ICP-Lite.md`** - ICP-Lite implementation guide

---

## 🌐 Site Mission & Philosophy

### Core Mission

**In the Wake** is a Christ-shaped cruise logbook and planning guide.

The project exists to:
- Do everything — code, content, and craft — **to the glory of God**.
- Offer **honest, human-first cruise guidance** that people can actually use.
- Treat every page, image, and story as an **act of stewardship and care**.

Cruise travel is the canvas, not the point. We use ships, ports, and itineraries as the backdrop for:
- Ordinary trip planning and “which ship/port fits me?”
- Moments of **unexpected kindness and beauty** at sea
- Seasons of **grief and loss** (widows, memorial cruises, anticipatory grief)
- **Accessibility journeys** (mobility, autism, invisible disabilities, PTSD)
- **Solo travel** (by choice and by circumstance)
- **Healing relationships** (marriages, families, friendships)
- **Rest for the worn-out** (pastors, teachers, medical staff, caregivers)

Grief and loss matter here — but they are one of several places where this mission shows up, not the only one.

### Content Principles

1. **Compassionate & Authentic:** Real stories and practical guidance, told with honesty and reverence, not hype.
2. **Accessible First:** WCAG 2.1 AA compliance, progressive enhancement, and real-world disability awareness.
3. **AI-First, Human-First:** ICP-Lite meta tags for AI, but humans (especially the vulnerable) always win if there’s a conflict.
4. **No Regressions:** Only additive improvements; never break existing functionality or undercut existing care.
5. **Evidence-Based:** Cross-reference logbook stories and review signals; verify facts instead of guessing.


### Pastoral & Care Guardrails (Non-Negotiable)

This site is read by people who are tired, grieving, anxious, disabled, or barely holding things together. Every assistant must treat it as **pastoral space first, technical space second**.

**People Before Platform**

- When there is any tension between technical neatness, SEO/AI optimization, or clever UX and **reader care**, the reader wins.
- If a change would make content feel less human, less gentle, or less safe for the hurting reader, **do not make that change.**

**Handling Grief, Loss, and Trauma**

- Never turn someone’s pain into a hook, gimmick, or marketing angle.
- Do not “tidy up” grief. It is okay for stories to carry sadness, lament, and unfinished edges.
- Do not add “everything happens for a reason” language or quick-fix spiritual clichés.
- If you are editing a grief or memorial story, preserve:
  - The narrator’s vulnerability
  - Their words for the person they lost
  - The emotional shape of the story (where the weight sits, where the hope appears)

**Disability, Neurodivergence, and Accessibility**

- Never minimize the realities of disability or neurodivergence.
- Avoid “inspiration porn” (framing disabled people primarily as objects of inspiration or pity).
- Emphasize **practical help and dignity**: what made this ship/port more navigable, what helped them be included.
- When in doubt, assume the reader is exhausted by being disbelieved or dismissed elsewhere. This is not another place that does that.

**Relationships, Marriage, and Family**

- Do not mock or belittle struggling marriages, estranged family, or complex family systems.
- When editing reconciliation stories, protect the honesty of the struggle as much as the joy of “after.”
- Never imply that one cruise, ship, or product can “fix” a marriage or family. Cruises create space; they are not sacraments.

**Solo Travelers and Anxiety**

- Respect that some people are solo by grief, some by choice, some by circumstance.
- Do not frame solo travelers as “less than” or assume they are only in search of romance.
- Speak to anxious travelers with **clarity, not hype**: specific, practical reassurance beats big promises.

**Voice & Tone in Sensitive Content**

- House voice: patient, practical, grief-aware, never salesy.
- No travel-agent hype in grief, disability, or healing articles/logbooks. Avoid words like “perfect,” “must-do,” “bucket list,” “life-changing” in these contexts.
- It is acceptable to name God’s kindness, beauty in creation, or quiet spiritual moments. It is not acceptable to use someone’s suffering to “sell” anything.

**Edits That Are Not Allowed**

- Removing or flattening the emotional pivot in a logbook story (the moment where grace lands).
- Cutting details that make a story feel specific and real, just to make it shorter or more “generic SEO.”
- Rewriting a hard story so it becomes chipper, glib, or “inspirational” at the expense of honesty.
- Adding jokes or sarcasm into grief, disability, or trauma narratives.

**When in Doubt**

- If you are not sure whether an edit is pastorally safe, **do less, not more**:
  - Prefer copy-editing over restructuring.
  - Prefer clarifying what’s already there over adding new emotional claims.
- Leave a note in the task/commit message if you backed off a change for pastoral reasons.
- It is always acceptable to stop and ask for human review rather than push through a change that feels wrong.

We are intentionally picky.

These standards aren’t here to make your life miserable; they exist because the people reading this site are often tired, grieving, disabled, or overwhelmed. Strict, predictable patterns mean:

- Fewer invisible failures for vulnerable readers
- Less thrash between different AIs and contributors
- More time spent on human, pastoral decisions instead of fixing broken plumbing

If you ever wonder “Why is this so strict?”, assume the answer is: “Because someone on the other side of the screen needs it to be.”

### Architectural Fit

Think harder and thoroughly examine similar areas of the codebase to ensure your proposed approach fits seamlessly with the established patterns and architecture.

Aim to make only minimal and necessary changes, avoiding any disruption to the existing design.

Whenever possible, take advantage of components, utilities, or logic that have already been implemented to maintain consistency, reduce duplication, and streamline integration with the current system.

These guardrails override all optimization concerns. A technically imperfect page that is safe for a grieving widow or exhausted caregiver is better than a perfectly tuned page that quietly harms them.
---

## 🏗️ Site Architecture

### Canonical Domain
**Production:** `https://cruisinginthewake.com`

**CRITICAL RULES:**
- ✅ ALWAYS use absolute URLs in production files
- ✅ ALWAYS use HTTPS
- ❌ NEVER use relative URLs in production
- ❌ NEVER use HTTP (auto-upgrade to HTTPS)

### Directory Structure
```
/
├── index.html                  # Homepage
├── ships/
│   ├── index.html             # Ships hub (/ships/index.html NOT /ships.html)
│   ├── rcl/                   # Royal Caribbean ships
│   ├── carnival-cruise-line/  # Carnival fleet
│   ├── celebrity-cruises/     # Celebrity fleet
│   └── holland-america-line/  # HAL fleet
├── ports/                     # 380 port pages
├── restaurants/               # Dining venue pages
├── solo/                      # Solo travel content
│   ├── articles/              # Solo travel articles
│   └── logbook/               # Personal stories
├── tools/                     # Interactive tools
│   ├── port-tracker.html      # Port checklist (380 ports)
│   └── ship-tracker.html      # Ship checklist
├── assets/
│   ├── css/                   # Stylesheets
│   ├── js/                    # JavaScript files
│   ├── data/                  # JSON data files
│   ├── ships/                 # Ship images (WebP format)
│   └── videos/                # Video manifests
├── standards/                 # Standards documentation
├── admin/                     # Admin tools and docs
│   └── claude/                # Claude AI documentation (you are here)
└── UNFINISHED_TASKS.md        # Task tracking
```

### Key Paths

**Ships:**
- Hub: `/ships/index.html` (NOT `/ships.html`)
- Detail: `/ships/<line>/<slug>.html` (e.g., `/ships/rcl/radiance-of-the-seas.html`)

**Data Files:**
- Fleet index: `/assets/data/fleet_index.json`
- Venues: `/assets/data/venues.json`
- Personas: `/assets/data/personas.json`
- Videos: `/assets/videos/rc_ship_videos.json`
- Ship logbooks: `/assets/data/logbook/rcl/<slug>.json`

**Tools:**
- Port Logbook: `/tools/port-tracker.html` (380+ ports across all cruise lines)
- Ship Logbook: `/tools/ship-tracker.html` (50+ ships)

---

## 🎨 Template & Versioning

### Current Template Version
**v3.010.305** (deployed to 1,238 HTML pages site-wide)

### CSS Versioning
**CRITICAL:** Stylesheet must use version query `?v=3.010.400`:
```html
<link rel="stylesheet" href="/assets/styles.css?v=3.010.400">
```

### Version Increments
- **Major changes (3.0 → 4.0):** Complete redesigns
- **Minor changes (3.006 → 3.007):** Per-batch updates (increment by 0.001.000)
- **Patch (template versions):** Template iterations (v3.010.300 increment by 0.000.001)

### Meta Version Tag
All pages should include:
```html
<meta name="version" content="v3.006.006">
```

---

## 🔧 Technical Standards

### 0. Analytics (REQUIRED on Every Page)

**CRITICAL:** Every HTML page MUST include both analytics scripts in the `<head>`:

```html
<!-- Google Analytics (with IP anonymization for GDPR) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-WZP891PZXJ"></script>
<script>
  window.dataLayer=window.dataLayer||[];
  function gtag(){dataLayer.push(arguments);}
  gtag('js',new Date());
  gtag('config','G-WZP891PZXJ',{anonymize_ip:true});
</script>

<!-- Umami (secondary analytics - privacy-focused) -->
<script defer src="https://cloud.umami.is/script.js" data-website-id="9661a449-3ba9-49ea-88e8-4493363578d2"></script>
```

**Why Both?**
- **Google Analytics:** Industry standard, detailed insights, conversion tracking
- **Umami:** Privacy-first backup, cookie-free, GDPR-compliant by design

**Note:** The footer trust badge says "Minimal analytics" - this accurately reflects our use of analytics while maintaining user trust.

### 1. Performance Optimization

#### Service Worker (v14.0.0)
- Cache-first strategy for images
- Network-first for HTML/JSON
- Current limits:
  - `maxPages: 400` (site has 1,238 HTML pages)
  - `maxAssets: 150`
  - `maxImages: 600` (currently 669 ship images, 3,131 WebP total)
  - `maxData: 100` (2,455 JSON files in assets/data/)

#### Caching Strategy
```html
<!-- Include once in <head> -->
<script src="/assets/js/site-cache.js" defer></script>

<!-- Pre-warm cache near </body> -->
<script>
(function(){async function warm(){try{await Promise.all([
  SiteCache.getJSON('/assets/data/fleet_index.json',{ttlDays:7,versionPath:['version']}),
  SiteCache.getJSON('/assets/data/venues.json',     {ttlDays:7,versionPath:['version']}),
  SiteCache.getJSON('/assets/data/personas.json',   {ttlDays:7,versionPath:['version']}),
  SiteCache.getJSON('/assets/videos/rc_ship_videos.json', {ttlDays:7,versionPath:['version']})
]);}catch(e){}} if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',warm,{once:true});} else {warm();}})();
</script>

<!-- Service Worker registration -->
<script>
  if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js').catch(()=>{});}
</script>
```

#### Image Optimization
- **Format:** WebP (77% file size reduction vs JPEG)
- **Lazy loading:** `loading="lazy"` on non-hero images
- **LCP optimization:** `fetchpriority="high"` on hero images
- **Responsive:** Explicit `width/height` or `aspect-ratio` in CSS
- **Hero logo:** Responsive srcset format (see Performance Optimizations doc)
- ## Do NOT optimize .png images - those require transparencies. 
**Example hero image:**
```html
<img src="/assets/ships/radiance-of-the-seas.webp"
     alt="Radiance of the Seas cruise ship"
     loading="eager"
     fetchpriority="high"
     width="1200"
     height="675">
```
### Image Sourcing Workflow (Free Licensed Images)

When a ship, port, or venue is missing an image, follow this order of operations:

1. **Check local assets first**
   - `/assets/ships/thumbs/`
   - `/assets/ships/`
   - `/ports/img/`
   - `*.jpg, or *.jpeg, or *.png, or *.webp` (if present)

2. **If no suitable local image exists, try these free sources in order:**

   **a. Wikimedia Commons (preferred for ships and landmarks)**
   - Use the Wikimedia API to search for a properly licensed image
   - Also check the Wikipedia article for the entity — embedded images link back to Commons
   - Prefer recent, high-resolution photos; license must allow reuse (CC BY, CC BY-SA, public domain)
   - Download locally (never hotlink)

   **b. Unsplash (preferred for port cities and destinations)**
   - Free for commercial use, no attribution legally required (but we attribute anyway)
   - API: `https://api.unsplash.com/` or browse `unsplash.com/s/photos/[destination]`
   - Excellent for scenic port/city photos

   **c. Pexels / Pixabay (backup for destinations and scenics)**
   - Free for commercial use with generous licenses
   - Good coverage of popular cruise destinations
   - Pexels API: `https://api.pexels.com/v1/search`
   - Pixabay API: `https://pixabay.com/api/`

   **d. Flickr Creative Commons (backup for ships and niche ports)**
   - Large archive of CC-licensed cruise ship and port photos
   - Filter by license: CC BY, CC BY-SA (not NC or ND for our use)
   - Flickr API supports license-filtered search
   - Many specialist ship photographers post here

   **Any legal source of free images is fair game** — the above are starting points, not an exhaustive list.

   **Sandbox Workaround (when commons.wikimedia.org returns 403):**
   The sandbox egress policy may block direct `curl`/`WebFetch` to `commons.wikimedia.org`
   and `upload.wikimedia.org`. Use this proven workaround:
   1. `WebSearch` for `"Wikimedia Commons [subject] [location] image"` — this works and
      returns file names and Flickr photo IDs (many Commons images were uploaded from Flickr)
   2. Get the Flickr photo ID from search results (e.g., `51325436663`)
   3. `curl -s -L "https://www.flickr.com/photo.gne?id=[PHOTO_ID]"` — fetches the photo page
   4. Extract the static URL with regex: `https://live.staticflickr.com/\d+/\d+_[a-f0-9]+_b\.jpg`
   5. `curl -s -L -o /tmp/image.jpg "[STATIC_URL]"` — download the actual image
   6. Convert to WebP with Python Pillow (available in sandbox):
      ```python
      from PIL import Image
      img = Image.open('/tmp/image.jpg')
      if img.width > 1200:
          ratio = 1200 / img.width
          img = img.resize((1200, int(img.height * ratio)), Image.LANCZOS)
      img.save('/path/to/port-N.webp', 'WebP', quality=80)
      ```
   7. Create the `-attr.json` file alongside the image (see existing examples)
   8. Be careful with Flickr rate limiting — pause between requests

3. **Convert and store**
   - Convert downloaded images to **WebP** (unless transparency is required → then PNG)
   - Save to the appropriate folder:
     - Ships → `/assets/ships/`
     - Ship thumbnails → `/assets/ships/thumbs/`
     - Ports → `/assets/ports/` or `/ports/img/[port-slug]/`
     - Venues → `/assets/restaurants/`

4. **Add attribution**
   - Add/update the attribution block on the relevant page
   - Append a row to `/attributions/attributions.csv` with:
     - Page/slug
     - File name
     - Author name and URL
     - License name and URL
     - Source (WikiMedia, Unsplash, Pexels, Pixabay, Flickr, etc.)

5. **If NO free source has a usable image**
   - Do NOT use a placeholder image. Placeholder images are a BLOCKING ERROR on any page.
   - Omit the image entirely or hide the image container for that entity.
   - Mark this in `UNFINISHED_TASKS.md` or the appropriate tracking file as
     "NEEDS REAL IMAGE – all free sources searched, nothing found."
### 2. Accessibility (WCAG 2.1 AA)

**Required Elements:**
- Skip-link: `<a href="#main" class="skip-link">Skip to main content</a>`
- Labeled inputs: `<label for="search">Search</label>`
- ARIA attributes: `aria-live="polite"` for dynamic content
- Alt text: All images must have descriptive `alt` attributes

**Progressive Enhancement:**
```html
<!-- Add to <html> tag -->
<html class="no-js" lang="en">

<!-- Remove no-js early -->
<script>document.documentElement.classList.remove('no-js');</script>

<!-- CSS fallbacks -->
<style>
.no-js .fallback { display: block; }
.no-js .js-only { display: none; }
</style>
```

### 3. SEO & Structured Data

**Required Meta Tags:**
```html
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="[Descriptive content]">
<meta name="version" content="v3.006.006">
<meta name="content-protocol" content="ICP-Lite v1.4">
<meta name="ai-summary" content="[AI-friendly summary]">
<meta name="last-reviewed" content="2025-11-23">
```

**Structured Data (JSON-LD):**
- BreadcrumbList schema on all pages
- Article schema on blog posts
- FAQPage schema when FAQ sections present
- Organization/Person schema for E-E-A-T

**Open Graph & Twitter:**
```html
<meta property="og:title" content="[Page Title]">
<meta property="og:description" content="[Description]">
<meta property="og:image" content="https://cruisinginthewake.com/assets/ships/[ship].webp">
<meta property="og:url" content="https://cruisinginthewake.com/[path]">
<meta name="twitter:card" content="summary_large_image">
```

---

## 📝 Content Standards

### ICP-Lite Protocol

**What is ICP-Lite?**
AI-first content protocol that helps AI assistants understand and cite content correctly while keeping humans as the primary audience.

**Implementation Levels:**

#### Level 1: Meta Tags (99.5% complete - 1,232/1,238 pages)
```html
<meta name="content-protocol" content="ICP-Lite v1.4">
<meta name="ai-summary" content="Comprehensive guide for [topic]">
<meta name="last-reviewed" content="2025-11-23">
```

#### Level 2: Content Structure (Pilot: Radiance of the Seas)
```html
<main id="main">
  <h1>Ship Name</h1>
  <p class="answer-line">Brief summary of what this page covers</p>

  <section class="fit-guidance">
    <h2>Who This Ship Is For</h2>
    <p>Target audience and use cases</p>
  </section>

  <!-- Main content -->

  <section class="faq">
    <h2>Frequently Asked Questions</h2>
    <!-- FAQ items with FAQ schema -->
  </section>
</main>
```

#### Level 3: Progressive Enhancement (Planned)
- HTML fallbacks for JS-driven content
- Static snapshots when JSON fails
- Graceful degradation for all features

**See:** `/admin/claude/ITW-LITE_PROTOCOL.md` for full documentation

### Ship Logbook Stories

**Purpose:** Real, authentic stories from cruise passengers processing grief, disability, solo travel, relationships

**CRITICAL:** All logbook entries must follow `/admin/claude/LOGBOOK_ENTRY_STANDARDS_v2.300.md`:
- Story-first approach (not brochures/feature lists)
- Positive emphasis with negatives redeemed into blessings
- One emotional pivot moment (tear-jerker, mostly happy)
- Grounded in real review signals
- No invented guides/calculators/resources
- No sales pitch language
- Subject to Appendix C (Pastoral Witness Guardrail) and Appendix D (Persona Uniqueness)

**Structure:**
```json
{
  "version": "1.1.0",
  "ship": "radiance-of-the-seas",
  "stories": [
    {
      "id": "story-001",
      "title": "The Widow Who Learned to Laugh Again",
      "category": "Grief & Loss",
      "summary": "Margaret's first cruise after losing her husband...",
      "story": "Full narrative with Scripture references...",
      "tags": ["widow", "first-holiday", "finding-joy"],
      "scriptureRef": "Psalm 30:11",
      "featured": true
    }
  ]
}
```

**Categories:**
1. Grief & Loss (widows, anticipatory grief, memorial cruises)
2. Accessibility (wheelchair, autism, invisible disabilities)
3. Solo Travel (forced solo, anxiety, introverts)
4. Healing Relationships (marriage restoration, family reconciliation)
5. Rest & Recovery (burnout, caregivers, pastors)

### Article Cross-Linking

**5 Core Articles** (see `/admin/FIVE_ARTICLE_CATEGORIES.md`):
1. ✅ **In the Wake of Grief** - `/solo/in-the-wake-of-grief.html` (COMPLETE, Grade A+)
2. ✅ **Accessible Cruising** - `/solo/articles/accessible-cruising.html` (COMPLETE)
3. ⚠️ **Solo Cruising** - Needs expansion beyond existing article
4. ❌ **Healing Relationships** - Not created (15+ logbook references)
5. ❌ **Rest for Wounded Healers** - Not created (10+ logbook references)

**Cross-linking Strategy:**
- Link from logbook stories → relevant articles
- Link from articles → specific logbook examples
- Link from ship pages → relevant articles when appropriate
- Link from articles → ship size recommendations

---

## 🖼️ Image Management

### Image Formats & Conversion

**Current Standard:** WebP format (77% smaller than JPEG)

**Status:**
- ✅ 669 ship images in WebP format (3,131 WebP site-wide)
- ✅ 0 JPG/JPEG files remain in repository (eliminated 2026-01-31)
- ✅ All HTML meta tags updated (og:image, twitter:image)
- ✅ All JSON-LD schemas use .webp

### Image Discovery Pattern

**For ship card/grid images:**
1. Check `/assets/ships/thumbs/` first (pre-sized)
2. Fallback to `/assets/ships/`
3. Accept filenames: `<slug>.webp`, `<slug>1.webp`, `<slug>2.webp`, `<slug>3.webp`
4. Select one at random per page load
5. Hide ships with no images from grids

### Image Attribution

**REQUIRED:** All Wiki Commons images must include attribution section:

```html
<!-- Attribution Section (before </main>) -->
<section class="attribution">
  <h3>Image Credits</h3>
  <p>The following images are used under Creative Commons licenses:</p>
  <ul>
    <li><strong>Ship Name 1:</strong> Photo by <a href="[author URL]" target="_blank" rel="noopener">[Author Name]</a>, used under <a href="[license URL]" target="_blank" rel="noopener">[License]</a></li>
  </ul>
</section>
```

**Figcaption for swiper images:**
```html
<figcaption>Photo served locally (attribution in page footer).</figcaption>
```

**Track in:** `/attributions/attributions.csv`

### Logo Exception

**CRITICAL:** `logo_wake.png` must ALWAYS stay PNG (not WebP) for transparency support

---

## 🚫 Critical "NEVER DO" Rules

### Validator Integrity (INVIOLABLE)

**NEVER GAME THE VALIDATOR.**

- ❌ NEVER reverse-engineer validator regex patterns and insert trigger words to pass automated checks
- ❌ NEVER write prose targeted at machine pattern-matching instead of human readers
- ❌ NEVER treat the validator as a target to optimize against — it is a safety net, not a goal
- If content passes the validator but was written *for* the validator rather than *for the reader*, it is wrong
- Write for humans first. If the prose is genuine and follows the voice standard (like-a-human.md), it will pass on its own merit
- Violation of this rule is a **BLOCKING integrity failure** — no exceptions

### Absolute URLs
- ❌ NEVER use relative URLs in production HTML
- ❌ NEVER use HTTP (always HTTPS)
- ❌ NEVER reference GitHub URLs in production files

### Navigation
- ❌ NEVER use `/ships.html` (correct path: `/ships/index.html`)
- ❌ NEVER break the pill navigation structure
- ❌ NEVER remove the "Cruise Lines" link from primary nav

### Images
- ❌ NEVER use placeholder images on any page (BLOCKING ERROR — no exceptions, no fallbacks)
- ❌ NEVER convert logo_wake.png to WebP
- ❌ NEVER use JPEG/JPG for new ship images (use WebP)
- ❌ NEVER skip image attribution for Wiki Commons images

### Content
- ❌ NEVER add placeholder/"lorem ipsum" text
- ❌ NEVER create "coming soon" pages without real content
- ❌ NEVER remove logbook stories or grief-focused content
- ❌ NEVER make insensitive edits to grief/disability content

### Code Quality
- ❌ NEVER leave console.log/console.warn in production code
- ❌ NEVER commit invalid JSON (run validators first)
- ❌ NEVER break existing functionality (no regressions)
- ❌ NEVER skip WCAG 2.1 AA accessibility requirements

### Security Standards

**Forbidden Files (Never Commit to Production Branch):**
- ❌ `.env`, `.env.*` - Environment variables
- ❌ `*.key`, `*.pem`, `*.pfx` - Private keys
- ❌ `*.sql`, `*.db` - Database files
- ❌ `*.bak`, `*.old`, `*.tmp` - Backup files
- ❌ `credentials.*`, `secrets.*` - Credential files

**JavaScript Security Rules:**
- ❌ NEVER use `innerHTML` with user input or URL parameters
- ❌ NEVER use `eval()` or `new Function()` with user data
- ❌ NEVER use `document.write()`
- ✅ ALWAYS use `textContent` for user-controlled strings
- ✅ ALWAYS validate/sanitize URL parameters before rendering
- ✅ ALWAYS escape HTML entities when displaying user input

**Safe Escaping Pattern:**
```javascript
// CORRECT: Escape user input before display
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// CORRECT: Use textContent for user input
element.textContent = userInput;

// WRONG: Never do this with user input
element.innerHTML = userInput;  // XSS vulnerability!
```

**Trust Claims:**
- Footer trust badge MUST match actual site behavior
- If analytics are used, Privacy Policy must disclose them
- Current accurate badge: "✓ No ads. Minimal analytics. Independent of cruise lines. Affiliate Disclosure"

**Protected by .htaccess:**
- Python files (`.py`, `.pyc`, `.pyo`) - blocked
- Markdown files (`.md`) - blocked
- Shell scripts (`.sh`) - blocked
- Backup files (`.bak`, `.tmp`, `.old`) - blocked
- `/admin/` directory - blocked (except `/admin/reports/*.html`)
- `/scripts/` directory - blocked entirely

### Git Workflow
- ❌ NEVER push to main/master directly
- ❌ NEVER force push to main/master
- ❌ NEVER skip commit messages
- ❌ NEVER commit without reading git status/diff first

---

## ✅ Development Workflow

### Before Starting Any Task

1. **Read the task** in `UNFINISHED_TASKS.md` carefully
2. **Check standards** relevant to the task
3. **Review existing examples** of similar pages
4. **Verify current state** with file reads/searches
5. **Plan the approach** (consider using TodoWrite tool)

### During Development

1. **Follow standards strictly** (see `/standards/`)
2. **Test as you go** (verify URLs, validate JSON, check accessibility)
3. **Use absolute URLs** everywhere in production files
4. **Validate HTML/CSS/JSON** before committing
5. **Check cross-links** work correctly
6. **Verify images load** and have proper attribution

### Before Committing

1. **Review changes** with `git status` and `git diff`
2. **Run validation scripts** if available
3. **Check for console statements** and remove them
4. **Verify no regressions** on existing pages
5. **Test in browser** if possible
6. **Write clear commit message** explaining the "why" not just the "what"

### Git Commit Messages

**Format:**
```
TYPE: Brief summary (50 chars or less)

Detailed explanation of changes and why they were necessary.
Reference any related tasks or issues.
```

**Types:**
- `FEAT:` New features
- `FIX:` Bug fixes
- `DOCS:` Documentation changes
- `STYLE:` CSS/visual changes
- `REFACTOR:` Code refactoring
- `TEST:` Test additions
- `AUDIT:` Audit reports
- `LOGBOOK:` Logbook story additions

**Examples:**
```
LOGBOOK: Add historic remembrances for Nordic Prince and Sun Viking

Created comprehensive logbooks for two historic ships (1971-1998 era) with
authentic memorial stories. Cross-referenced to grief article.

FIX: Update WebP references in ship meta tags

All 50 RCL ship pages now use .webp format in og:image, twitter:image, and
JSON-LD schema. Reduces page weight and improves LCP scores.
```

---

## 🎯 Current Priorities (Updated 2026-02-13)

### P0 - Critical (Do These First)
1. ✅ ~~Port Logbook~~ COMPLETE
2. ✅ ~~Ship Logbook~~ COMPLETE
3. ✅ ~~Ship Cards Redesign~~ COMPLETE
4. ✅ ~~Ships That Visit Here~~ COMPLETE (193 ships, 15 lines, 380 ports, bidirectional)
5. ✅ ~~Port expansion~~ COMPLETE (380 pages, up from 147)
6. ✅ ~~ICP-Lite rollout~~ COMPLETE (100% of pages)
7. ✅ ~~Venue audit Phase 2~~ COMPLETE (0 generic text, 0 hotdog.webp, all have menus; validator in validate.js)
8. ⏳ **CSS consolidation (remaining)** — 25 files with `<style>` blocks (tools/admin/templates only); ~16,022 inline `style=` attributes need Phase 5 cleanup

### P1 - High Priority (Do These Soon)
9. ✅ ~~Port map completion~~ ESSENTIALLY COMPLETE — 367/380 (96.6%) use standard PortMap module; 13 remaining are redirects/passages/special pages
10. ✅ ~~Ship page CSS rollout~~ COMPLETE — `ship-page.css` linked on 292/298 ship pages (6 pages in legacy/template directories not linked)
11. ✅ ~~Competitor gap: "From the Pier"~~ COMPLETE — 376/376 real port pages have distance/transport component (2026-02-05)
12. ⏳ **Site-wide hero/logo standardization** — Inconsistent across hub pages

### P2 - Medium Priority
13. ✅ ~~Service Worker v14 upgrade~~ COMPLETE — sw.js upgraded to v14.2.0
14. ✅ ~~Port weather seasonal data~~ COMPLETE — `seasonal-guides.json` has Tier 1 data for 380 ports; port-weather.js deployed to all 380 pages; 375/376 real ports have weather guide section
15. ✅ ~~Stateroom Checker~~ MASSIVELY EXPANDED — 270 exception JSON files across ALL cruise lines

### P3-P4 - Future / Requires User Decision
16. 🔴 Pastoral articles: Healing Relationships, Rest for Wounded Healers (Red lane — human decides). Note: 7 solo articles already exist.
17. 🔴 Affiliate link deployment (user decision: deploy or keep ad-free messaging?) — `affiliate-disclosure.html` already created
18. ✅ ~~Quiz V2~~ MOSTLY COMPLETE — `ship-quiz-data-v2.json` model v2.1 covers 15 cruise lines
19. Multi-cruise-line tracker expansion

**See:** `UNFINISHED_TASKS.md` for complete task list with details

---

## 📚 Additional Resources

### Admin Tools
- **WebP conversion workflow:** See `/admin/README.md` section "WebP Image Management Tools"
- **Bulk update scripts:** Various Python scripts in `/admin/` for mass updates
- **Audit scripts:** `comprehensive_site_audit.py`, `verify_actual_state.py`
- **Navigation audit:** `audit_and_fix_nav.py` (fixes dropdown navigation issues)

### Port Expansion Planning
- **Royal Caribbean:** `/assets/data/ports/royal-caribbean-ports-master-list.md` (350+ ports)
- **Carnival:** `/assets/data/ports/carnival-cruise-line-ports-master-list.md` (320+ ports)
- **Virgin Voyages:** `/assets/data/ports/virgin-voyages-ports-master-list.md` (~120 ports)
- **MSC Cruises:** `/assets/data/ports/msc-cruises-ports-master-list.md` (380+ ports)
- **Norwegian:** `/assets/data/ports/norwegian-cruise-line-ports-master-list.md` (420+ ports)

### Documentation
- **Performance work:** `PERFORMANCE_OPTIMIZATIONS_COMPLETED.md`
- **Audit reports:** `/admin/COMPREHENSIVE_SITE_AUDIT_2025_11_19.md`
- **Article structure:** `/admin/FIVE_ARTICLE_CATEGORIES.md`
- **ICP-Lite guide:** `/admin/ICP-Lite.md`

---

## 🤝 Working with the User

### Communication Style
- Be concise and direct
- Focus on facts, not superlatives
- Disagree respectfully when necessary
- Ask clarifying questions when uncertain
- Show your work (use TodoWrite tool for complex tasks)

### When Stuck
1. **Read more context** - Check related standards and examples
2. **Ask for clarification** - User prefers questions over assumptions
3. **Propose options** - Present 2-3 alternatives when multiple paths exist
4. **Verify assumptions** - Double-check file existence, current state

### Task Tracking
- **Use TodoWrite tool** for multi-step tasks
- **Mark todos complete** immediately after finishing
- **Keep only ONE task in_progress** at a time
- **Remove stale todos** that are no longer relevant

---

## 🔍 Verification Checklist

Before marking any task complete, verify:

**HTML Files:**
- [ ] DOCTYPE present
- [ ] Absolute URLs used (https://cruisinginthewake.com/...)
- [ ] Meta tags complete (version, content-protocol, ai-summary)
- [ ] No console statements left in inline JavaScript
- [ ] No lorem ipsum or placeholder text
- [ ] No placeholder images (BLOCKING ERROR)
- [ ] All images have alt attributes
- [ ] Skip-link present and functional
- [ ] Breadcrumb navigation correct
- [ ] Service Worker registration snippet included

**JSON Files:**
- [ ] Valid JSON (no trailing commas, no comments)
- [ ] Version field present and incremented
- [ ] Schema matches expected format
- [ ] No control characters or invalid Unicode

**Images:**
- [ ] WebP format used (not JPEG/JPG)
- [ ] Proper attribution section added (Wiki Commons)
- [ ] Figcaptions include attribution note
- [ ] Logo stays PNG (never convert to WebP)
- [ ] Responsive sizing attributes included

**CSS/JavaScript:**
- [ ] Version query string updated (?v=3.010.400)
- [ ] No console.log/warn/error statements
- [ ] Graceful fallbacks for JS-disabled users
- [ ] Accessibility features maintained

**Git:**
- [ ] Commit message follows format (TYPE: Summary)
- [ ] Changes reviewed with git diff
- [ ] No unintended files included
- [ ] Branch name follows convention (claude/*)

---

## 📞 Need Help?

**Documentation Hierarchy:**
1. This file (`admin/claude/CLAUDE.md`) - Start here
2. Standards files (`/standards/*.md`) - Core technical standards
3. Task list (`UNFINISHED_TASKS.md`) - Current work and priorities
4. Admin docs (`/admin/*.md`) - Tools and workflows
5. Code examples - Find similar existing pages and follow their pattern

**Key Decision Documents:**
- Architecture decisions → `/standards/main-standards.md`
- Content strategy → `/admin/FIVE_ARTICLE_CATEGORIES.md`
- ICP-Lite implementation → `/admin/claude/ITW-LITE_PROTOCOL.md`
- Port expansion → Port master lists in `/assets/data/ports/`

---

**Remember:** This site helps people process some of the hardest experiences in life. Every detail matters. Every accessibility improvement helps someone. Every logbook story might be exactly what someone needs to read today.

**Soli Deo Gloria** 🙏

---

**Version History:**
- v1.2.7 (2026-02-14) - Metrics verification: ship images 661→669, ICP-Lite 1,232/1,238 (99.5%; 6 remaining are article fragments without <head>), SDG 1,235→1,238/1,238 (100%), JSON files corrected (assets/data/: 1,301; repo-wide: 2,478), updated CODEBASE_GUIDE + STANDARDS_INDEX
- v1.2.6 (2026-02-13) - Ground-truth audit: total pages 1,241→1,238, ship images 536→661, WebP 2,998→3,131, JSON files 1,278→2,455, style blocks 18→25, inline styles 31,128→~16,022, ICP-Lite 1,231/1,238 (99.4%), SDG 1,234/1,238 (99.7%)
- v1.2.5 (2026-02-12) - Comprehensive docs/codebase review: ship pages 292→298, ship images 444→536, WebP 2,345→2,998, total pages 1,195→1,241, ICP-Lite 1,147/1,195→1,229/1,241, CSS ?v=3.0→?v=3.010.400, template v3.010.300→v3.010.305, JSON files 76→1,278
- v1.2.4 (2026-02-05) - Corrected priorities against codebase audit: Leaflet maps 375→334 (88%), ship-page.css 292/309→292/292 (100%), "From the Pier" marked COMPLETE (376/376), SW version 14.0.0→14.2.0, seasonal data 381→380 ports, CSS consolidation updated to verified counts (18 style blocks, 31,128 inline attributes)
- v1.2.3 (2026-02-01) - Updated seasonal-guides.json status (1→381 ports), corrected ship-page.css count (292/309), updated site-wide page count (1,167→1,195), WebP count (2,906→2,345), fixed image alt text accessibility (356 instances), updated all port last-reviewed dates to 2026-02-01
- v1.2.2 (2026-01-31) - Documentation consistency pass: fixed SW version 13.0.0→14.0.0, fixed ai:summary→ai-summary (ICP-Lite v1.4), updated trust badge text to match site, marked SW v14 upgrade complete in priorities
- v1.2.1 (2026-01-31) - Documentation consistency pass: fixed page/image counts to ground-truth (port-tracker 147→380, ICP-Lite 544→1115, ship images 82→444, site pages 561→1167), marked ship-page.css rollout complete (292/297), updated CSS consolidation status, removed stale JPG references
- v1.2.0 (2026-01-31) - Updated priorities to reflect 2026-01-31 thread review; fixed ICP-Lite version (v1.0→v1.4); updated port count (147→380); updated Ship Logbook count; marked completed work streams
- v1.1.0 (2026-01-03) - Added analytics requirement (Section 0), security standards section, trust claim accuracy rules
- v1.0.0 (2025-11-23) - Initial comprehensive Claude guide created
