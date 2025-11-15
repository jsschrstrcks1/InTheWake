#!/usr/bin/env python3
"""
Comprehensive navigation fix - remove ALL old navs, insert ONE correct nav
"""

import re
from pathlib import Path
from typing import Tuple

# Reference nav HTML from drink-calculator.html (lines 856-893)
NAV_HTML = '''      <nav class="nav" aria-label="Main site navigation">
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
            <a role="menuitem" href="/stateroom-check.html">Stateroom Check</a>
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
      </nav>'''

# Complete nav CSS from drink-calculator.html (lines 625-757)
NAV_CSS = '''
    /* Navigation */
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

    /* Dropdown Navigation Styles */
    .nav-disclosure .caret {
      display: inline-block;
      margin-left: .25rem;
      transition: transform 0.2s ease;
    }

    .nav-item[data-open="true"] .nav-disclosure .caret {
      transform: rotate(180deg);
    }

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

    .submenu::before {
      content: '';
      position: absolute;
      top: -8px;
      left: 0;
      right: 0;
      height: 8px;
      background: transparent;
    }

    .nav-item[data-open="true"] .submenu,
    .nav-group.open .submenu {
      display: block;
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
    }

    .submenu a {
      display: block;
      padding: .5rem .75rem;
      color: var(--text);
      text-decoration: none;
      border-radius: 8px;
      transition: background 0.15s ease;
    }

    .submenu a:hover,
    .submenu a:focus {
      background: #eef4f6;
      outline: none;
    }

    .submenu a[aria-current="page"] {
      background: #e6f4f8;
      font-weight: 600;
    }

    @media (max-width: 768px) {
      .submenu {
        position: static !important;
        min-width: 0;
        margin-top: .5rem;
        box-shadow: none;
        border: 1px solid var(--rope);
      }

      .submenu::before {
        display: none;
      }
    }'''

# Complete nav JavaScript from drink-calculator.html (lines 1824-1925)
NAV_JS = '''
  <!-- Dropdown nav behavior (300ms Hover Delay) -->
  <script>
  (function(){
    "use strict";

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
  })();
  </script>'''


def remove_all_navs(html: str) -> str:
    """Remove ALL <nav> elements from HTML"""
    # Remove all <nav>...</nav> elements
    html = re.sub(r'<nav[^>]*>.*?</nav>', '', html, flags=re.DOTALL | re.IGNORECASE)
    return html


def has_navbar_div(html: str) -> bool:
    """Check if page has .navbar div"""
    return bool(re.search(r'<div\s+class="navbar"', html, re.IGNORECASE))


def insert_nav_after_brand(html: str) -> str:
    """Insert nav after the brand div in navbar"""
    # Find the closing </div> after <div class="brand">
    pattern = r'(<div\s+class="brand">.*?</div>)\s*'
    replacement = r'\1\n' + NAV_HTML + '\n    '
    
    html = re.sub(pattern, replacement, html, count=1, flags=re.DOTALL | re.IGNORECASE)
    return html


def has_nav_css(html: str) -> bool:
    """Check if page has complete nav CSS"""
    return bool(re.search(r'/\*\s*Navigation\s*\*/', html, re.IGNORECASE))


def remove_nav_css(html: str) -> str:
    """Remove old nav CSS section"""
    # Remove from /* Navigation */ to end of dropdown CSS
    html = re.sub(
        r'/\*\s*Navigation\s*\*/.*?(@media \(max-width: 768px\) \{[^}]+\.submenu::before[^}]+\}\s+\})',
        '',
        html,
        flags=re.DOTALL | re.IGNORECASE
    )
    return html


def insert_nav_css(html: str) -> str:
    """Insert nav CSS before the closing </style> tag"""
    # Find the last </style> tag before </head>
    pattern = r'(</style>)'
    replacement = NAV_CSS + '\n  \\1'
    
    html = re.sub(pattern, replacement, html, count=1, flags=re.DOTALL)
    return html


def has_nav_js(html: str) -> bool:
    """Check if page has nav JavaScript"""
    return bool(re.search(r'Dropdown nav behavior', html, re.IGNORECASE))


def remove_nav_js(html: str) -> str:
    """Remove old nav JavaScript"""
    html = re.sub(
        r'<!--\s*Dropdown nav behavior.*?</script>',
        '',
        html,
        flags=re.DOTALL | re.IGNORECASE
    )
    return html


def insert_nav_js(html: str) -> str:
    """Insert nav JavaScript before </body>"""
    pattern = r'(</body>)'
    replacement = NAV_JS + '\n\\1'
    
    html = re.sub(pattern, replacement, html, count=1, flags=re.DOTALL)
    return html


def fix_page(filepath: Path) -> Tuple[bool, str]:
    """Fix a single page"""
    try:
        content = filepath.read_text(encoding='utf-8')
        
        # Skip if no navbar div (special pages like offline.html)
        if not has_navbar_div(content):
            return False, "No navbar div"
        
        # Step 1: Remove ALL existing <nav> elements
        content = remove_all_navs(content)
        
        # Step 2: Insert correct nav after brand div
        content = insert_nav_after_brand(content)
        
        # Step 3: Remove old CSS and insert new
        content = remove_nav_css(content)
        content = insert_nav_css(content)
        
        # Step 4: Remove old JS and insert new
        content = remove_nav_js(content)
        content = insert_nav_js(content)
        
        # Write back
        filepath.write_text(content, encoding='utf-8')
        
        return True, "Fixed"
        
    except Exception as e:
        return False, f"Error: {str(e)}"


def main():
    """Fix all HTML pages"""
    base = Path('/home/user/InTheWake')
    
    # Find all HTML files except solo/articles
    html_files = []
    for pattern in ['*.html', '*/*.html', '*/*/*.html', '*/*/*/*.html']:
        html_files.extend(base.glob(pattern))
    
    html_files = [f for f in html_files if '/solo/articles/' not in str(f)]
    html_files.sort()
    
    print(f"Fixing {len(html_files)} HTML files...\n")
    
    fixed = 0
    skipped = 0
    errors = 0
    
    for filepath in html_files:
        rel_path = filepath.relative_to(base)
        success, message = fix_page(filepath)
        
        if success:
            print(f"✓ {rel_path}")
            fixed += 1
        elif "No navbar" in message:
            skipped += 1
        else:
            print(f"✗ {rel_path}: {message}")
            errors += 1
    
    print(f"\n{'='*70}")
    print(f"COMPLETE")
    print(f"{'='*70}")
    print(f"Fixed: {fixed}")
    print(f"Skipped (no navbar): {skipped}")
    print(f"Errors: {errors}")


if __name__ == '__main__':
    main()
