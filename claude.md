# Claude Code Context - In the Wake

**Project:** In the Wake (cruisinginthewake.com)
**Type:** Static cruise planning website
**Version:** ITW-Lite v3.010.305
**Hosting:** GitHub Pages

---

## Quick Start

This is a static HTML/CSS/JavaScript cruise planning website with an AI-first metadata philosophy. Before making changes, understand the key principles:

1. **Theological Foundation (IMMUTABLE):** Every HTML file MUST have Soli Deo Gloria invocation
2. **ITW-Lite Philosophy:** AI-first → Human-first → Google second
3. **Standards:** ICP-Lite v1.4 metadata protocol required on all pages
4. **Last-Reviewed Dates:** Update `last-reviewed` meta AND `dateModified` JSON-LD on EVERY edit
5. **Validation:** Run validators after edits

---

## Essential Documents

| Document | Purpose | Location |
|----------|---------|----------|
| **Onboarding** | Full system overview | [.claude/ONBOARDING.md](.claude/ONBOARDING.md) |
| **Maintenance Tasks** | Routine maintenance guide | [MAINTENANCE_TASKS.md](MAINTENANCE_TASKS.md) |
| **Standards** | Code standards reference | [.claude/skills/standards/STANDARDS.md](.claude/skills/standards/STANDARDS.md) |
| **Skill Rules** | Auto-activation configuration | [.claude/skill-rules.json](.claude/skill-rules.json) |
| **ICP-Lite Protocol** | AI metadata specification | [.claude/skills/standards/resources/icp-lite-protocol.md](.claude/skills/standards/resources/icp-lite-protocol.md) |
| **Theological Foundation** | Invocation requirements | [.claude/skills/standards/resources/theological-foundation.md](.claude/skills/standards/resources/theological-foundation.md) |
| **Ship Page Standards** | Ship page template | [new-standards/foundation/SHIP_PAGE_STANDARDS_v3.007.010.md](new-standards/foundation/SHIP_PAGE_STANDARDS_v3.007.010.md) |
| **Unfinished Tasks** | Current work backlog | [UNFINISHED_TASKS.md](UNFINISHED_TASKS.md) |

---

## Key Directories

```
InTheWake/
├── ships/              # 292 ship pages across 16 cruise lines
├── ports/              # 380 port guide pages
├── restaurants/        # Dining venue pages
├── assets/             # CSS, JS, images, data
├── admin/              # Maintenance scripts and tools
├── new-standards/      # Site standards documentation
├── .claude/            # Claude Code skill system
│   ├── skills/         # 4 skill directories
│   ├── plugins/        # 5 SEO/accessibility plugins
│   ├── commands/       # 4 commands (/commit, /create-pr, etc.)
│   └── hooks/          # Auto-activation hooks
└── .github/workflows/  # CI/CD quality checks
```

---

## Common Commands

### Validation
```bash
# Validate ICP-Lite compliance
node admin/validate-icp-lite-v14.js <file>
node admin/validate-icp-lite-v14.js --all

# Validate ship pages
node admin/validate-ship-page.js ships/rcl/adventure-of-the-seas.html
node admin/validate-ship-page.js --all-ships

# Post-write validation
./admin/post-write-validate.sh <file>
```

### Batch Fixes
```bash
# Fix stub pages
node admin/batch-fix-stub-pages.js

# Fix JSON-LD schemas
node admin/fix-jsonld-schemas.js

# WebP image audit
python3 admin/webp_audit.py
```

### Site Generation
```bash
# Generate sitemap
python3 admin/generate_sitemap.py

# Generate search index
python3 admin/generate_search_index.py
```

---

## Guardrails

### REJECT
- Keyword stuffing
- Removing AI-first meta tags
- Compromising readability for SEO
- Modifying theological invocation
- Generic template content

### ACCEPT
- Schema.org structured data
- Semantic HTML
- Natural, conversational language
- Faith-scented reflections
- ICP-Lite v1.4 compliance

---

## CRITICAL: Last-Reviewed Date Updates

**Every time you edit ANY page, you MUST update:**

```html
<!-- 1. Update the meta tag -->
<meta name="last-reviewed" content="YYYY-MM-DD"/>

<!-- 2. Update the JSON-LD (MUST match exactly) -->
"dateModified": "YYYY-MM-DD"
```

**Why this matters:**
- Google uses `dateModified` to assess content freshness for ranking
- AI systems use `last-reviewed` to determine information currency
- Stale dates signal outdated content to both humans and machines

**Rule:** If you touch a page, update the date. No exceptions.

**Monthly Task:** Find pages not updated in 6+ months and refresh them. See [MAINTENANCE_TASKS.md](MAINTENANCE_TASKS.md) Section 1.6 for commands.

---

## Required Page Elements

### Every HTML Page
```html
<!-- Soli Deo Gloria invocation (before line 20) -->
<!--
Soli Deo Gloria
All work on this project is offered as a gift to God.
"Trust in the LORD with all your heart..." — Proverbs 3:5
"Whatever you do, work heartily..." — Colossians 3:23
-->

<!-- ICP-Lite v1.4 meta tags -->
<meta name="ai-summary" content="Brief description (max 250 chars)"/>
<meta name="last-reviewed" content="2026-01-17"/>
<meta name="content-protocol" content="ICP-Lite v1.4"/>
```

### Entity Pages (ships, ports, restaurants)
```html
<!-- AI-breadcrumbs -->
<!-- ai-breadcrumbs
     entity: Adventure of the Seas
     type: Ship Information Page
     parent: /ships.html
     category: Royal Caribbean Fleet
     -->

<!-- JSON-LD with mainEntity -->
<script type="application/ld+json">
{
  "@type": "WebPage",
  "description": "MUST MATCH ai-summary exactly",
  "dateModified": "MUST MATCH last-reviewed exactly",
  "mainEntity": { "@type": "Product", "name": "Ship Name" }
}
</script>
```

---

## Site Navigation (Gold Standard)

**IMPORTANT:** Always reference this section before modifying any navigation. The structure below is the canonical standard.

### Source Files

| Component | Location | Purpose |
|-----------|----------|---------|
| **HTML Template** | `index.html` lines 287-376 | Gold standard navigation markup |
| **CSS Styles** | `assets/styles.css` lines 685-914 | Navigation styling (desktop + mobile) |
| **JavaScript** | `assets/js/dropdown.js` | Dropdown behavior + mobile hamburger menu |

### Navigation HTML Structure

```html
<header class="hero-header" role="banner">
  <div class="navbar">
    <div class="brand">
      <img src="/assets/logo_wake_256.png" srcset="..." width="256" height="259" alt="In the Wake wordmark" decoding="async"/>
      <span class="tiny version-badge" aria-label="Site version V1.Beta">V1.Beta</span>
    </div>
    <!-- Mobile hamburger button -->
    <button class="nav-toggle" type="button" aria-label="Toggle navigation menu" aria-expanded="false" aria-controls="site-nav">
      <span class="nav-toggle-icon"><span></span><span></span><span></span></span>
    </button>
    <nav class="site-nav" id="site-nav" aria-label="Main site navigation">
      <!-- Navigation items here -->
    </nav>
  </div>
</header>
```

### Required Navigation Items (in order)

```
1. Home                    → /
2. Planning (dropdown)
   ├─ Your First Cruise    → /first-cruise.html
   ├─ Ships                → /ships.html
   ├─ Cruise Lines         → /cruise-lines.html
   ├─ Ports                → /ports.html
   ├─ Packing Lists        → /packing-lists.html
   └─ Accessibility        → /accessibility.html
3. Tools (dropdown)
   ├─ Ship Quiz            → /ships/quiz.html
   ├─ Cruise Line Quiz     → /cruise-lines/quiz.html
   ├─ Drink Calculator     → /drink-calculator.html
   ├─ Stateroom Check      → /stateroom-check.html
   ├─ Port Logbook         → /tools/port-tracker.html
   └─ Ship Logbook         → /tools/ship-tracker.html
4. Onboard (dropdown)
   ├─ Restaurants & Menus  → /restaurants.html
   ├─ Drink Packages       → /drink-packages.html
   ├─ Internet at Sea      → /internet-at-sea.html
   └─ Articles             → /articles.html
5. Travel (dropdown)
   ├─ Travel (overview)    → /travel.html
   └─ Solo                 → /solo.html
6. Search                  → /search.html
7. About                   → /about-us.html
```

### Dropdown HTML Pattern

```html
<div class="nav-dropdown" id="nav-planning">
  <button class="nav-pill" type="button" aria-expanded="false" aria-haspopup="true">
    Planning <span class="caret">&#9662;</span>
  </button>
  <div class="dropdown-menu" role="menu">
    <a href="/first-cruise.html">Your First Cruise</a>
    <a href="/ships.html">Ships</a>
    <!-- Additional items... -->
  </div>
</div>
```

### Footer Structure (Gold Standard)

```html
<footer class="wrap" role="contentinfo">
  <p>© 2025 In the Wake · A Cruise Traveler's Logbook · All rights reserved.</p>
  <p class="tiny mt-05">
    <a href="/privacy.html">Privacy</a> ·
    <a href="/terms.html">Terms</a> ·
    <a href="/about-us.html">About</a> ·
    <a href="/accessibility.html">Accessibility &amp; WCAG 2.1 AA Commitment</a>
  </p>
  <p class="tiny center visually-hidden" aria-hidden="true">Soli Deo Gloria — Every pixel...</p>
  <p class="trust-badge">✓ No ads. Minimal analytics. Independent of cruise lines. <a href="/affiliate-disclosure.html">Affiliate Disclosure</a></p>
</footer>
```

### CSS Classes Reference

| Class | Purpose |
|-------|---------|
| `.site-nav` | Main navigation container |
| `.nav-pill` | Individual navigation button/link styling |
| `.nav-dropdown` | Container for dropdown menus |
| `.dropdown-menu` | Hidden dropdown panel (shown via `.open` class) |
| `.nav-toggle` | Mobile hamburger button (hidden on desktop) |
| `.mobile-open` | Applied to `.site-nav` when mobile menu is open |
| `.open` | Applied to `.nav-dropdown` when dropdown is visible |

### Key JavaScript Behaviors

- **Dropdown toggle:** Click button to open/close, click outside to close
- **Mobile menu:** Hamburger button toggles `.mobile-open` class
- **Keyboard navigation:** Arrow keys navigate dropdown items, Escape closes
- **Body scroll lock:** `document.body.style.overflow = 'hidden'` when mobile menu open

### Navigation Guardrails

**DO NOT:**
- Add navigation items without updating this documentation
- Change dropdown order without approval
- Remove accessibility attributes (`aria-expanded`, `aria-haspopup`, `role="menu"`)
- Modify dropdown.js without testing mobile AND desktop

**ALWAYS:**
- Use absolute paths (starting with `/`)
- Include `&amp;` for ampersands in HTML (e.g., "Restaurants &amp; Menus")
- Test mobile hamburger menu after any nav changes
- Verify dropdown.js is linked: `<script src="/assets/js/dropdown.js"></script>`

---

## Current Status

| Metric | Value |
|--------|-------|
| Ship Pages | 292 (in 16 cruise line directories) |
| Port Pages | 380 |
| Restaurant/Venue Pages | 472 |
| Ship pages with ship-page.css | 292/292 (100%) |
| Ship Deployments | 193 ships, 16 cruise lines, 380 ports |
| From the Pier component | 376/376 real ports (100%) |
| JPG/JPEG images | 0 (eliminated 2026-01-31) |

See [UNFINISHED_TASKS.md](UNFINISHED_TASKS.md) for detailed status.

---

## Maintenance

For routine maintenance tasks, commands, and schedules, see:

**[MAINTENANCE_TASKS.md](MAINTENANCE_TASKS.md)**

Includes:
- Content quality checks
- **Last-reviewed date updates** (on every edit)
- **Stale page audits** (6+ months old)
- Link verification
- Standards compliance
- Ship page validation
- Security checks
- Performance optimization

---

## Getting Help

- **Skill questions:** Check `.claude/skill-rules.json`
- **Standards questions:** Check `new-standards/README.md`
- **Theological questions:** Check `.claude/skills/standards/resources/theological-foundation.md`
- **ITW-Lite philosophy:** See skill-rules.json notes section

---

*Soli Deo Gloria*
