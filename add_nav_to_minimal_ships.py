#!/usr/bin/env python3
"""
Add complete navigation to minimal ship pages (Carnival/Celebrity/Holland America)
These pages have no navbar structure, so we need to add everything.
"""

import re
from pathlib import Path
from typing import Tuple

# Complete nav HTML
NAV_HTML = '''<div class="navbar">
  <div class="brand">
    <img src="/assets/logo_wake.png" alt="In the Wake logo" width="116" height="28" decoding="async"/>
    <span class="tiny version-badge">v3.010.300</span>
  </div>
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
  </nav>
</div>

'''

# Complete nav CSS
NAV_CSS = '''
  <style>
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
    }

    .navbar {
      max-width: 1100px;
      margin: 0 auto;
      display: flex;
      gap: .6rem;
      padding: .5rem .9rem .35rem;
      align-items: flex-end;
      position: relative;
      z-index: 5;
    }

    .brand {
      display: flex;
      align-items: flex-end;
      gap: .6rem;
    }

    .brand img {
      height: 28px;
      width: auto;
      display: block;
    }

    .version-badge {
      font-size: .72rem;
      opacity: .8;
      margin-left: .35rem;
    }
  </style>
'''

# Complete nav JavaScript
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
  </script>
'''


def fix_minimal_ship_page(filepath: Path) -> Tuple[bool, str]:
    """Add complete navigation to minimal ship pages"""
    try:
        content = filepath.read_text(encoding='utf-8')
        
        # Skip if already has navbar
        if '<div class="navbar">' in content:
            return False, "Already has navbar"
        
        # 1. Add CSS before </head>
        if '</head>' in content:
            content = content.replace('</head>', NAV_CSS + '\n</head>', 1)
        else:
            return False, "No </head> tag found"
        
        # 2. Add nav HTML after <body>
        # Pattern: <body> possibly followed by <div class="badge...">
        body_pattern = r'(<body>)'
        content = re.sub(body_pattern, r'\1\n' + NAV_HTML, content, count=1)
        
        # 3. Add JavaScript before </body>
        if '</body>' in content:
            content = content.replace('</body>', NAV_JS + '\n</body>', 1)
        else:
            return False, "No </body> tag found"
        
        # Write back
        filepath.write_text(content, encoding='utf-8')
        
        return True, "Fixed"
        
    except Exception as e:
        return False, f"Error: {str(e)}"


def main():
    """Fix all minimal ship pages"""
    base = Path('/home/user/InTheWake')
    
    # Target directories
    dirs = [
        'ships/carnival',
        'ships/carnival-cruise-line',
        'ships/celebrity-cruises',
        'ships/holland-america-line'
    ]
    
    all_files = []
    for dir_path in dirs:
        dir_full = base / dir_path
        if dir_full.exists():
            all_files.extend(dir_full.glob('*.html'))
    
    all_files.sort()
    
    print(f"Processing {len(all_files)} ship pages...\n")
    
    fixed = 0
    skipped = 0
    errors = 0
    
    for filepath in all_files:
        rel_path = filepath.relative_to(base)
        success, message = fix_minimal_ship_page(filepath)
        
        if success:
            print(f"✓ {rel_path}")
            fixed += 1
        elif "Already has navbar" in message:
            skipped += 1
        else:
            print(f"✗ {rel_path}: {message}")
            errors += 1
    
    print(f"\n{'='*70}")
    print(f"COMPLETE")
    print(f"{'='*70}")
    print(f"Fixed: {fixed}")
    print(f"Skipped (already has navbar): {skipped}")
    print(f"Errors: {errors}")


if __name__ == '__main__':
    main()
