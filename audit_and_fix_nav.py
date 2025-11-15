#!/usr/bin/env python3
"""
Navigation Audit and Fix Script for In the Wake
Ensures all pages have consistent dropdown navigation with CSS and JavaScript
"""

import os
import re
import sys
import argparse
from pathlib import Path
from collections import defaultdict
from typing import Dict, List, Set, Tuple

# ============================================================================
# REFERENCE NAVIGATION COMPOSITE
# ============================================================================

REFERENCE_NAV_HTML = '''      <!-- Navigation with Dropdown Menus -->
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
      </nav>'''

REFERENCE_NAV_CSS = '''  /* Dropdown Navigation (FIXED: 300ms Hover Delay) */
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
  }'''

REFERENCE_NAV_JAVASCRIPT = '''  /* ===== Dropdown Menu with 300ms Hover Delay ===== */
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
  }'''

# ============================================================================
# DETECTION PATTERNS
# ============================================================================

# Patterns to detect navigation structure
DROPDOWN_NAV_PATTERN = r'<nav[^>]*class="nav"[^>]*>.*?nav-group.*?</nav>'
OLD_PILL_NAV_PATTERN = r'<nav[^>]*class="pill-nav"[^>]*>'
SUBMENU_PATTERN = r'class="submenu"'

# CSS detection patterns
NAV_CSS_PATTERNS = [
    r'\.nav-item\s*>?\s*a',
    r'\.nav-item\s*>?\s*button',
    r'\.submenu\s*{',
    r'\.nav-disclosure\s+\.caret',
    r'\.nav-item\[data-open="true"\]'
]

# JavaScript detection patterns
DROPDOWN_JS_PATTERNS = [
    r'dropdownGroups',
    r'nav-group',
    r'HOVER_DELAY',
    r'setOpen\(',
    r'closeAll\('
]

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

def read_file(filepath: Path) -> str:
    """Read file with error handling."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        print(f"ERROR reading {filepath}: {e}")
        return ""

def write_file(filepath: Path, content: str) -> bool:
    """Write file with error handling."""
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    except Exception as e:
        print(f"ERROR writing {filepath}: {e}")
        return False

def has_pattern(content: str, pattern: str) -> bool:
    """Check if content matches pattern (case-insensitive, DOTALL)."""
    return bool(re.search(pattern, content, re.IGNORECASE | re.DOTALL))

def has_any_pattern(content: str, patterns: List[str]) -> bool:
    """Check if content matches any of the patterns."""
    return any(has_pattern(content, p) for p in patterns)

# ============================================================================
# ANALYSIS FUNCTIONS
# ============================================================================

class PageAnalysis:
    """Container for page analysis results."""
    def __init__(self, filepath: Path):
        self.filepath = filepath
        self.rel_path = str(filepath.relative_to(Path.cwd()))
        self.has_dropdown_nav = False
        self.has_old_pill_nav = False
        self.has_nav_css = False
        self.has_nav_js = False
        self.uses_external_css = False
        self.issue_type = "unknown"

    def categorize(self):
        """Categorize the issue type."""
        if not self.has_dropdown_nav and self.has_old_pill_nav:
            self.issue_type = "missing_dropdown_nav"
        elif not self.has_dropdown_nav:
            self.issue_type = "missing_dropdown_nav"
        elif self.has_dropdown_nav and not self.has_nav_css:
            self.issue_type = "missing_css"
        elif self.has_dropdown_nav and self.has_nav_css and not self.has_nav_js:
            self.issue_type = "missing_js"
        elif self.uses_external_css and self.has_dropdown_nav:
            self.issue_type = "uses_external_css"
        elif self.has_dropdown_nav and self.has_nav_css and self.has_nav_js:
            self.issue_type = "fully_correct"
        else:
            self.issue_type = "unknown"

def analyze_page(filepath: Path) -> PageAnalysis:
    """Analyze a single HTML page for navigation issues."""
    content = read_file(filepath)
    analysis = PageAnalysis(filepath)

    # Check navigation structure
    analysis.has_dropdown_nav = has_pattern(content, DROPDOWN_NAV_PATTERN)
    analysis.has_old_pill_nav = has_pattern(content, OLD_PILL_NAV_PATTERN)

    # Check for CSS
    analysis.has_nav_css = has_any_pattern(content, NAV_CSS_PATTERNS)

    # Check for external CSS
    analysis.uses_external_css = has_pattern(content, r'<link[^>]*href=["\']/?assets/styles\.css')

    # Check for JavaScript
    analysis.has_nav_js = has_any_pattern(content, DROPDOWN_JS_PATTERNS)

    # Categorize the issue
    analysis.categorize()

    return analysis

def analyze_all_pages(root_dir: Path, exclude_dirs: Set[str]) -> List[PageAnalysis]:
    """Analyze all HTML pages in the directory tree."""
    results = []

    for filepath in root_dir.rglob("*.html"):
        # Skip excluded directories
        if any(excluded in filepath.parts for excluded in exclude_dirs):
            continue

        results.append(analyze_page(filepath))

    return results

# ============================================================================
# REPORTING
# ============================================================================

def generate_report(analyses: List[PageAnalysis]) -> str:
    """Generate comprehensive audit report."""

    # Count by issue type
    issue_counts = defaultdict(int)
    for analysis in analyses:
        issue_counts[analysis.issue_type] += 1

    # Group by directory
    by_directory = defaultdict(list)
    for analysis in analyses:
        dir_name = str(Path(analysis.rel_path).parent)
        if dir_name == '.':
            dir_name = 'root'
        by_directory[dir_name].append(analysis)

    # Build report
    lines = []
    lines.append("=" * 80)
    lines.append("NAVIGATION AUDIT REPORT")
    lines.append("=" * 80)
    lines.append("")
    lines.append(f"Total pages scanned: {len(analyses)}")
    lines.append("")

    lines.append("Issues Found:")
    lines.append(f"  - Missing dropdown nav: {issue_counts['missing_dropdown_nav']} pages")
    lines.append(f"  - Has nav but missing CSS: {issue_counts['missing_css']} pages")
    lines.append(f"  - Has nav+CSS but missing JS: {issue_counts['missing_js']} pages")
    lines.append(f"  - Using external CSS (needs verification): {issue_counts['uses_external_css']} pages")
    lines.append(f"  - Fully correct: {issue_counts['fully_correct']} pages")
    lines.append(f"  - Unknown/Other: {issue_counts['unknown']} pages")
    lines.append("")

    lines.append("Breakdown by Directory:")
    for dir_name in sorted(by_directory.keys()):
        pages = by_directory[dir_name]
        issues = sum(1 for p in pages if p.issue_type != 'fully_correct')
        lines.append(f"  {dir_name}: {len(pages)} pages - {issues} need fixes")
    lines.append("")

    # Sample specific issues (first 20 of each type)
    lines.append("Specific Issues (sample):")
    lines.append("")

    for issue_type in ['missing_dropdown_nav', 'missing_css', 'missing_js', 'uses_external_css']:
        pages = [a for a in analyses if a.issue_type == issue_type]
        if pages:
            issue_name = issue_type.replace('_', ' ').title()
            lines.append(f"{issue_name} ({len(pages)} pages):")
            for analysis in pages[:20]:
                lines.append(f"  - {analysis.rel_path}")
            if len(pages) > 20:
                lines.append(f"  ... and {len(pages) - 20} more")
            lines.append("")

    lines.append("=" * 80)
    lines.append("Fix Strategy:")
    lines.append("=" * 80)
    lines.append("")
    lines.append("1. Update /assets/styles.css with dropdown CSS (if missing)")
    lines.append(f"2. Replace nav HTML on {issue_counts['missing_dropdown_nav']} pages")
    lines.append(f"3. Add CSS to {issue_counts['missing_css']} pages with inline styles")
    lines.append(f"4. Add JavaScript to {len(analyses) - issue_counts['fully_correct']} pages")
    lines.append("")
    lines.append("To fix all issues, run:")
    lines.append("  python3 audit_and_fix_nav.py --fix")
    lines.append("")
    lines.append("To preview fixes without changing files:")
    lines.append("  python3 audit_and_fix_nav.py --dry-run")
    lines.append("")

    return "\n".join(lines)

# ============================================================================
# FIX FUNCTIONS
# ============================================================================

def fix_page(filepath: Path, dry_run: bool = False) -> Tuple[bool, str]:
    """Fix navigation on a single page."""
    content = read_file(filepath)
    original_content = content
    changes = []

    # 1. Fix Navigation HTML
    if not has_pattern(content, DROPDOWN_NAV_PATTERN):
        # Replace old pill-nav or add new nav
        if has_pattern(content, r'<nav[^>]*class="pill-nav"[^>]*>.*?</nav>'):
            # Replace old nav
            content = re.sub(
                r'<nav[^>]*class="pill-nav"[^>]*>.*?</nav>',
                REFERENCE_NAV_HTML,
                content,
                flags=re.DOTALL
            )
            changes.append("Replaced old pill-nav with dropdown nav")
        else:
            # Try to insert after navbar div
            if '<div class="navbar">' in content:
                content = content.replace(
                    '<div class="navbar">',
                    '<div class="navbar">\n' + REFERENCE_NAV_HTML + '\n',
                    1
                )
                changes.append("Inserted dropdown nav after navbar")

    # 2. Fix CSS (if inline styles exist and nav CSS missing)
    if not has_any_pattern(content, NAV_CSS_PATTERNS):
        # Find existing <style> tag
        style_match = re.search(r'(<style>.*?)(</style>)', content, re.DOTALL)
        if style_match:
            # Insert nav CSS before closing </style>
            before_close = style_match.group(1)
            close_tag = style_match.group(2)
            new_styles = before_close + "\n" + REFERENCE_NAV_CSS + "\n  " + close_tag
            content = content.replace(style_match.group(0), new_styles)
            changes.append("Added nav CSS to existing <style> tag")

    # 3. Fix JavaScript (if missing)
    if not has_any_pattern(content, DROPDOWN_JS_PATTERNS):
        # Find existing <script> tag in body
        script_match = re.search(r'(<script>.*?)(</script>)', content, re.DOTALL)
        if script_match:
            # Check if it's the main script (has IIFE)
            if '(function(){' in script_match.group(1):
                # Insert dropdown JS after "use strict"
                script_content = script_match.group(1)
                if '"use strict";' in script_content:
                    script_content = script_content.replace(
                        '"use strict";',
                        '"use strict";\n\n' + REFERENCE_NAV_JAVASCRIPT,
                        1
                    )
                    content = content.replace(
                        script_match.group(0),
                        script_content + script_match.group(2)
                    )
                    changes.append("Added dropdown JavaScript to existing script")

    # Write changes
    if content != original_content:
        if not dry_run:
            if write_file(filepath, content):
                return True, f"Fixed: {', '.join(changes)}"
            else:
                return False, "Failed to write file"
        else:
            return True, f"[DRY RUN] Would fix: {', '.join(changes)}"

    return False, "No changes needed"

def fix_all_pages(analyses: List[PageAnalysis], dry_run: bool = False):
    """Fix all pages with issues."""
    total = len([a for a in analyses if a.issue_type != 'fully_correct'])
    fixed = 0
    failed = 0

    print(f"\nFixing {total} pages (dry_run={dry_run})...\n")

    for analysis in analyses:
        if analysis.issue_type == 'fully_correct':
            continue

        success, message = fix_page(analysis.filepath, dry_run)

        if success:
            fixed += 1
            print(f"✓ {analysis.rel_path}: {message}")
        else:
            failed += 1
            print(f"✗ {analysis.rel_path}: {message}")

    print(f"\n{'[DRY RUN] ' if dry_run else ''}Fixed {fixed} pages, {failed} failed\n")

# ============================================================================
# MAIN
# ============================================================================

def main():
    parser = argparse.ArgumentParser(
        description='Audit and fix navigation across all HTML pages'
    )
    parser.add_argument(
        '--fix',
        action='store_true',
        help='Fix all issues (modifies files)'
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Preview fixes without modifying files'
    )
    parser.add_argument(
        '--exclude',
        nargs='+',
        default=['node_modules', '.git', 'vendor'],
        help='Directories to exclude'
    )
    parser.add_argument(
        '--output',
        type=str,
        help='Write report to file'
    )

    args = parser.parse_args()

    # Run analysis
    root_dir = Path.cwd()
    exclude_dirs = set(args.exclude)

    print(f"\nScanning {root_dir} for HTML files...")
    print(f"Excluding: {', '.join(exclude_dirs)}\n")

    analyses = analyze_all_pages(root_dir, exclude_dirs)

    # Generate report
    report = generate_report(analyses)

    # Output report
    print(report)

    if args.output:
        with open(args.output, 'w') as f:
            f.write(report)
        print(f"\nReport written to {args.output}")

    # Fix if requested
    if args.fix or args.dry_run:
        fix_all_pages(analyses, dry_run=args.dry_run)

if __name__ == '__main__':
    main()
