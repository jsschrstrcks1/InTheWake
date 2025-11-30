# Claude AI Assistant Guide - In the Wake

**Version:** 1.0.0
**Last Updated:** 2025-11-23
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
**Production:** `https://www.cruisinginthewake.com`

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
│   ├── index.html             # Ships hub (/ships/index.html NOT /ships/ships.html)
│   ├── rcl/                   # Royal Caribbean ships
│   ├── carnival-cruise-line/  # Carnival fleet
│   ├── celebrity-cruises/     # Celebrity fleet
│   └── holland-america-line/  # HAL fleet
├── ports/                     # 147 port pages
├── restaurants/               # Dining venue pages
├── solo/                      # Solo travel content
│   ├── articles/              # Solo travel articles
│   └── logbook/               # Personal stories
├── tools/                     # Interactive tools
│   ├── port-tracker.html      # Port checklist (147 ports)
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
- Hub: `/ships/index.html` (NOT `/ships/ships.html`)
- Detail: `/ships/<line>/<slug>.html` (e.g., `/ships/rcl/radiance-of-the-seas.html`)

**Data Files:**
- Fleet index: `/assets/data/fleet_index.json`
- Venues: `/assets/data/venues.json`
- Personas: `/assets/data/personas.json`
- Videos: `/assets/videos/rc_ship_videos.json`
- Ship logbooks: `/assets/data/logbook/rcl/<slug>.json`

**Tools:**
- Port Logbook: `/tools/port-tracker.html` (147 Royal Caribbean ports)
- Ship Logbook: `/tools/ship-tracker.html` (50+ ships)

---

## 🎨 Template & Versioning

### Current Template Version
**v3.010.300** (deployed to 478 files, 85%+ of site)

### CSS Versioning
**CRITICAL:** Stylesheet must use version query `?v=3.0`:
```html
<link rel="stylesheet" href="/assets/styles.css?v=3.0">
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

### 1. Performance Optimization

#### Service Worker (v13.0.0)
- Cache-first strategy for images
- Network-first for HTML/JSON
- Current limits:
  - `maxPages: 400` (site has 561 pages)
  - `maxAssets: 150`
  - `maxImages: 600` (currently 285 ship images)
  - `maxData: 100` (76 JSON files)

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
<meta name="content-protocol" content="ICP-Lite v1.0">
<meta name="ai:summary" content="[AI-friendly summary]">
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
<meta property="og:image" content="https://www.cruisinginthewake.com/assets/ships/[ship].webp">
<meta property="og:url" content="https://www.cruisinginthewake.com/[path]">
<meta name="twitter:card" content="summary_large_image">
```

---

## 📝 Content Standards

### ICP-Lite Protocol

**What is ICP-Lite?**
AI-first content protocol that helps AI assistants understand and cite content correctly while keeping humans as the primary audience.

**Implementation Levels:**

#### Level 1: Meta Tags (97% complete - 544/561 pages)
```html
<meta name="content-protocol" content="ICP-Lite v1.0">
<meta name="ai:summary" content="Comprehensive guide for [topic]">
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
- ✅ 82 main ship images converted to WebP
- ✅ 8 thumbnails in `/assets/ships/thumbs/`
- ✅ All HTML meta tags updated (og:image, twitter:image)
- ✅ All JSON-LD schemas use .webp
- ⏳ 19 ships still need images from Wiki Commons

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

### Absolute URLs
- ❌ NEVER use relative URLs in production HTML
- ❌ NEVER use HTTP (always HTTPS)
- ❌ NEVER reference GitHub URLs in production files

### Navigation
- ❌ NEVER use `/ships/ships.html` (correct path: `/ships/index.html`)
- ❌ NEVER break the pill navigation structure
- ❌ NEVER remove the "Cruise Lines" link from primary nav

### Images
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

## 🎯 Current Priorities (Updated 2025-11-23)

### P0 - Critical (Do These First)
1. ✅ ~~Port Logbook~~ COMPLETE
2. ✅ ~~Ship Logbook~~ COMPLETE
3. ✅ ~~Ship Cards Redesign~~ COMPLETE
4. ⏳ **Fix placeholder attributions** (Symphony, Adventure, Enchantment, Explorer)
5. ⏳ **Download Wiki Commons images** for 19 ships
6. ⏳ **Create protocol docs** (ITW-LITE_PROTOCOL, STANDARDS_INDEX, CLAUDE.md) - IN PROGRESS

### P1 - High Priority (Do These Soon)
7. ✅ ~~In the Wake of Grief article~~ COMPLETE (Grade A+)
8. ✅ ~~Hawaii port batch~~ COMPLETE
9. ⏳ **Expand Solo Cruising article** (20 logbook references)
10. ⏳ **Write Healing Relationships article** (15+ logbook references)
11. ⏳ **Write Rest & Recovery article** (25 logbook references)
12. ⏳ **Complete placeholder content pages** (drinks.html, ports.html, restaurants.html)

### P2 - Medium Priority
13. Middle East port batch (4 ports)
14. Caribbean completion (8-10 ports)
15. Historic logbooks (nordic-prince, sun-viking)
16. ICP-Lite rollout (content-level enhancements)

### P3-P4 - Future Expansion
17. Multi-cruise-line tracker
18. Asia/Australia port expansion
19. Carnival Cruise Line expansion (150-200 ports)
20. Virgin Voyages expansion

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
- [ ] Absolute URLs used (https://www.cruisinginthewake.com/...)
- [ ] Meta tags complete (version, content-protocol, ai:summary)
- [ ] No console statements left in inline JavaScript
- [ ] No lorem ipsum or placeholder text
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
- [ ] Version query string updated (?v=3.0)
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
- v1.0.0 (2025-11-23) - Initial comprehensive Claude guide created
