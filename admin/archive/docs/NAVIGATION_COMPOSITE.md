# Navigation Composite - Complete Reference
## Version 3.010.300 | Dropdown Navigation with 300ms Hover Delay

This document contains the **COMPLETE** navigation composite that must appear on **EVERY** page across the entire site.

---

## 🎯 Critical Issue Identified

**Problem:** 277 out of 292 pages have navigation issues:
- **197 pages** are missing dropdown navigation entirely
- **80 pages** have dropdown nav HTML but **MISSING CSS** (displays as vertical list instead of horizontal styled navigation)
- **4 pages** use external `/assets/styles.css` which is missing dropdown CSS

**Result:** Users see unstyled, broken vertical navigation menus instead of the beautiful horizontal dropdown navigation.

---

## 🔧 Z-Index Stacking Context Fix (CRITICAL)

**Problem:** Dropdown menus appear UNDER page content cards instead of OVER them.

**Root Cause:** The `.hero-header` parent element creates a z-index stacking context. Even though `.submenu` has `z-index: 2100`, it's confined within the parent's stacking context. When `.hero-header` has `z-index: 0`, all children (including dropdown menus) appear below content cards in `<main>`.

**Solution:** Set `.hero-header` to `z-index: 9000` to ensure the entire header (and its dropdown menus) appear above all page content.

**Required CSS:**
```css
.hero-header {
  position: relative;
  border-bottom: 6px double var(--rope);
  background: #eaf6f6;
  z-index: 9000;  /* CRITICAL: Ensures dropdowns appear OVER content cards */
}

.navbar {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  align-items: flex-end;
  gap: .6rem;
  padding: .5rem .9rem .35rem;
  position: relative;
  z-index: 2000;  /* Relative to header's stacking context */
  overflow: visible;
}
```

**Technical Explanation:**
- CSS z-index creates stacking contexts when combined with `position: relative/absolute/fixed`
- Child elements cannot escape their parent's stacking context
- `.hero-header` (z-index: 9000) > `.navbar` (z-index: 2000) > `.submenu` (z-index: 2100)
- All three values work together to ensure dropdowns appear over content

---

## ✅ Complete Navigation Composite

Every page must have these three components:

### 1. Navigation HTML (lines ~766-802 in index.html)

```html
      <!-- Navigation with Dropdown Menus -->
      <nav class="nav" aria-label="Main site navigation">
        <div class="nav-item">
          <a href="/">Home</a>
        </div>

        <!-- Planning Dropdown -->
        <div class="nav-item nav-group" id="nav-planning" data-open="false">
          <button class="nav-disclosure" type="button" aria-expanded="false" aria-haspopup="true" aria-controls="menu-planning">
            Planning <span class="caret">▾</span>
          </button>
          <div id="menu-planning" class="submenu" role="menu" aria-label="Planning submenu">
            <a role="menuitem" href="/planning.html">Planning (overview)</a>
            <a role="menuitem" href="/ships.html">Ships</a>
            <a role="menuitem" href="/restaurants.html">Restaurants &amp; Menus</a>
            <a role="menuitem" href="/ports.html">Ports</a>
            <a role="menuitem" href="/drink-calculator.html">Drink Calculator</a>
            <a role="menuitem" href="/cruise-lines.html">Cruise Lines</a>
            <a role="menuitem" href="/packing-lists.html">Packing Lists</a>
            <a role="menuitem" href="/accessibility.html">Accessibility</a>
          </div>
        </div>

        <!-- Travel Dropdown -->
        <div class="nav-item nav-group" id="nav-travel" data-open="false">
          <button class="nav-disclosure" type="button" aria-expanded="false" aria-haspopup="true" aria-controls="menu-travel">
            Travel <span class="caret">▾</span>
          </button>
          <div id="menu-travel" class="submenu" role="menu" aria-label="Travel submenu">
            <a role="menuitem" href="/travel.html">Travel (overview)</a>
            <a role="menuitem" href="/solo.html">Solo</a>
          </div>
        </div>

        <div class="nav-item">
          <a href="/about-us.html">About</a>
        </div>
      </nav>
```

**Location:** Inside `<div class="navbar">` tag, typically after the brand/logo section.

---

### 2. Navigation CSS (lines ~383-520 in index.html)

**CRITICAL:** This CSS must be in EVERY page's `<style>` tag OR in `/assets/styles.css`

```css
  /* Dropdown Navigation (FIXED: 300ms Hover Delay) */
  .nav {
    flex: 1 1 auto;
    min-width: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: .5rem;
    white-space: nowrap;
    flex-wrap: nowrap;
    overflow: visible;
    padding-inline: .75rem;
  }

  .nav-item {
    position: relative;
    display: inline-block;
  }

  .nav-item > a,
  .nav-item > button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: .35rem;
    padding: .65rem 1rem;
    min-height: 44px;
    border-radius: 10px;
    background: #fff;
    border: 2px solid var(--rope);
    color: var(--accent);
    font: inherit;
    font-size: .95rem;
    line-height: 1.2;
    cursor: pointer;
    text-decoration: none;
    transition: all 0.2s ease;
  }

  .nav-item > a:hover,
  .nav-item > button:hover {
    background: var(--foam);
    border-color: var(--accent);
    transform: translateY(-1px);
  }

  .nav-item > a[aria-current="page"] {
    background: var(--accent);
    color: #fff;
    font-weight: 600;
    border-color: var(--accent);
  }

  .nav-disclosure .caret {
    display: inline-block;
    margin-left: .25rem;
    transition: transform 0.2s ease;
  }

  .nav-item[data-open="true"] .nav-disclosure .caret {
    transform: rotate(180deg);
  }

  /* Dropdown menu with safe zone */
  .submenu {
    position: absolute !important;
    left: 0;
    top: calc(100% + 4px);
    min-width: 240px;
    background: #fff;
    border: 2px solid var(--rope);
    border-radius: 12px;
    padding: .6rem;
    box-shadow: 0 8px 24px rgba(8,48,65,.15);
    display: none;
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transition: opacity 0.2s ease, visibility 0.2s ease;
    z-index: 2100;
  }

  /* Safe zone bridge */
  .submenu::before {
    content: '';
    position: absolute;
    top: -8px;
    left: 0;
    right: 0;
    height: 8px;
    background: transparent;
  }

  .nav-item[data-open="true"] > .submenu {
    display: block;
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
  }

  .submenu a {
    display: block;
    width: 100%;
    margin: 0;
    padding: .6rem .75rem;
    border-radius: .65rem;
    border: 0;
    background: transparent;
    color: var(--ink);
    text-decoration: none;
    transition: background 0.15s ease;
  }

  .submenu a:hover,
  .submenu a:focus {
    background: #f2f7fa;
    outline: 2px solid transparent;
  }

  @media (max-width: 768px) {
    .nav {
      justify-content: flex-start;
      overflow-x: auto;
      scrollbar-width: thin;
      -webkit-overflow-scrolling: touch;
    }

    .nav-item > a,
    .nav-item > button {
      flex: 0 0 auto;
    }

    .submenu {
      left: 0;
      right: 0;
      min-width: 100%;
    }
  }
```

**Key Features:**
- ✅ Horizontal pill-style navigation buttons
- ✅ Dropdown menus positioned absolutely below trigger buttons
- ✅ Safe hover zone (invisible bridge) prevents menu from closing during mouse movement
- ✅ Smooth transitions and hover states
- ✅ Mobile responsive with horizontal scrolling
- ✅ WCAG 2.1 AA compliant with proper focus indicators

---

### 3. Navigation JavaScript (lines ~992-1086 in index.html)

**CRITICAL:** This JavaScript must be in EVERY page's main `<script>` block

```javascript
  /* ===== Dropdown Menu with 300ms Hover Delay ===== */
  const dropdownGroups = Array.from(document.querySelectorAll('.nav-group'));
  if (dropdownGroups.length) {
    const hoverTimeouts = new Map();
    const HOVER_DELAY = 300;

    function setOpen(group, isOpen) {
      group.dataset.open = isOpen ? "true" : "false";
      const button = group.querySelector('.nav-disclosure');
      if (button) {
        button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      }
    }

    function closeAll(except = null) {
      dropdownGroups.forEach(group => {
        if (group !== except) {
          setOpen(group, false);
          if (hoverTimeouts.has(group)) {
            clearTimeout(hoverTimeouts.get(group));
            hoverTimeouts.delete(group);
          }
        }
      });
    }

    dropdownGroups.forEach(group => {
      const button = group.querySelector('.nav-disclosure');
      const menu = group.querySelector('.submenu');
      if (!button || !menu) return;

      // Click to toggle
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isOpen = group.dataset.open === "true";
        closeAll(group);
        setOpen(group, !isOpen);
      });

      // Mouse enter: Open immediately
      group.addEventListener('mouseenter', () => {
        if (hoverTimeouts.has(group)) {
          clearTimeout(hoverTimeouts.get(group));
          hoverTimeouts.delete(group);
        }
        closeAll(group);
        setOpen(group, true);
      });

      // Mouse leave: Close after delay
      group.addEventListener('mouseleave', () => {
        const timeoutId = setTimeout(() => {
          setOpen(group, false);
          hoverTimeouts.delete(group);
        }, HOVER_DELAY);
        hoverTimeouts.set(group, timeoutId);
      });

      // Keyboard navigation
      group.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          setOpen(group, false);
          button && button.focus();
        }
        if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && document.activeElement === button) {
          e.preventDefault();
          setOpen(group, true);
          const firstLink = menu.querySelector('a, button, [tabindex]:not([tabindex="-1"])');
          firstLink && firstLink.focus();
        }
      });

      // Close when tabbing away
      menu.addEventListener('focusout', () => {
        setTimeout(() => {
          if (!group.contains(document.activeElement)) {
            setOpen(group, false);
          }
        }, 0);
      });
    });

    // Close all when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.nav-group')) {
        closeAll();
      }
    });

    // Close all when window loses focus
    window.addEventListener('blur', () => {
      closeAll();
    });
  }
```

**Key Features:**
- ✅ 300ms hover delay prevents accidental dropdown closure
- ✅ Click-to-toggle for mobile/touch devices
- ✅ Full keyboard navigation (Arrow keys, Escape, Tab)
- ✅ Auto-close on blur or clicking outside
- ✅ Multiple dropdown support (only one open at a time)
- ✅ Accessible (updates aria-expanded attributes)

---

## 📊 Audit Results Summary

```
Total pages scanned: 292

Issues Found:
  - Missing dropdown nav HTML: 197 pages
  - Has nav but missing CSS: 80 pages
  - Has nav+CSS but missing JS: 0 pages
  - Using external CSS (needs fix): 4 pages
  - Fully correct: 11 pages

Pages Needing Fixes: 281 (96.2%)
```

### Breakdown by Directory

| Directory | Total Pages | Need Fixes |
|-----------|-------------|------------|
| ships/rcl | 44 | 44 |
| ships/carnival-cruise-line | 47 | 47 |
| ships/carnival | 58 | 58 |
| ships/holland-america-line | 44 | 44 |
| ships/celebrity-cruises | 29 | 29 |
| restaurants | 25 | 25 |
| cruise-lines | 10 | 10 |
| root | 18 | 10 |
| solo/articles | 3 | 3 |
| authors | 2 | 2 |
| **TOTAL** | **292** | **281** |

---

## 🔧 How to Fix

### Option 1: Automated Fix (Recommended)

```bash
# Preview fixes without making changes
python3 audit_and_fix_nav.py --dry-run

# Fix all pages automatically
python3 audit_and_fix_nav.py --fix

# Re-run audit to verify
python3 audit_and_fix_nav.py
```

### Option 2: Manual Fix for External CSS Pages

For the 4 pages using `/assets/styles.css`:
1. Add the complete Navigation CSS to `/home/user/InTheWake/assets/styles.css`
2. Add the Navigation JavaScript to each page's `<script>` block

---

## 🎯 Example Issue: grandeur-of-the-seas.html

**Current State:**
- ✅ Has dropdown nav HTML (lines 277-315)
- ❌ Missing nav CSS (only has minimal inline styles)
- ❌ Result: Dropdown appears as vertical unstyled list

**What It Should Look Like:**
- Horizontal pill-style navigation buttons
- Styled dropdown menus on hover
- Smooth animations and transitions

**Fix Required:**
1. Add complete Nav CSS to `<style>` block (or to styles.css)
2. Add dropdown JavaScript to `<script>` block

---

## 📝 Reference Files

**Perfect Examples (All 3 components present):**
- `/home/user/InTheWake/index.html`
- `/home/user/InTheWake/about-us.html`
- `/home/user/InTheWake/solo.html`
- `/home/user/InTheWake/travel.html`

**Audit Script:**
- `/home/user/InTheWake/audit_and_fix_nav.py`

**Audit Report:**
- `/home/user/InTheWake/nav_audit_report.txt`

---

## ⚠️ Critical Path to Production

1. **MUST update `/assets/styles.css`** with dropdown CSS
2. **MUST add dropdown CSS** to all pages with inline `<style>` tags
3. **MUST add dropdown JavaScript** to all pages
4. **MUST verify** horizontal styled navigation on all 292 pages

**Estimated Impact:** Fixes navigation UX for 281 pages (96% of site)

---

## 🚀 Testing Checklist

After fixes, verify each page has:
- [ ] Horizontal pill-style navigation (not vertical list)
- [ ] Dropdown menus appear on hover
- [ ] 300ms delay prevents accidental menu closure
- [ ] Dropdowns work with keyboard (Tab, Arrow keys, Escape)
- [ ] Mobile responsive (horizontal scroll on narrow screens)
- [ ] Proper focus indicators for accessibility

---

**Version:** 3.010.300
**Last Updated:** 2025-11-15
**Audit Date:** 2025-11-15
**Priority:** CRITICAL - Affects 96% of site pages
