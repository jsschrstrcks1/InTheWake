#!/usr/bin/env python3
"""
Fix missing analytics scripts on HTML pages.
Soli Deo Gloria

Adds Google Analytics and Umami Analytics scripts to pages that are missing them.
"""

import os
import re
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent

# Analytics IDs
GA_ID = "G-WZP891PZXJ"
UMAMI_ID = "9661a449-3ba9-49ea-88e8-4493363578d2"

# Analytics script templates
GA_SCRIPT = """  <!-- Google Analytics -->
  <script async src="https://www.googletagmanager.com/gtag/js?id={ga_id}"></script>
  <script>
    window.dataLayer=window.dataLayer||[];
    function gtag(){{dataLayer.push(arguments);}}
    gtag('js',new Date());
    gtag('config','{ga_id}',{{anonymize_ip:true}});
  </script>
""".format(ga_id=GA_ID)

UMAMI_SCRIPT = """  <!-- Umami (secondary analytics) -->
  <script defer src="https://cloud.umami.is/script.js" data-website-id="{umami_id}"></script>
""".format(umami_id=UMAMI_ID)


def has_google_analytics(html):
    """Check if page has Google Analytics."""
    return "googletagmanager.com/gtag/js" in html and GA_ID in html


def has_umami(html):
    """Check if page has Umami Analytics."""
    return "cloud.umami.is/script.js" in html


def find_insertion_point(html):
    """Find the best insertion point for analytics scripts.

    Prefer inserting after last meta tag or link tag, before </head>.
    """
    # Look for closing </head> tag
    head_match = re.search(r'</head>', html, re.IGNORECASE)
    if not head_match:
        return None

    head_pos = head_match.start()

    # Find the last meta or link tag before </head>
    last_meta_link = None
    for match in re.finditer(r'<(meta|link)[^>]*/?>', html[:head_pos], re.IGNORECASE):
        last_meta_link = match

    if last_meta_link:
        # Insert after the last meta/link tag
        return last_meta_link.end()

    # Otherwise insert just before </head>
    return head_pos


def fix_analytics(filepath, dry_run=False):
    """Fix missing analytics on a page."""
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()

    has_ga = has_google_analytics(html)
    has_um = has_umami(html)

    if has_ga and has_um:
        return None  # Nothing to fix

    changes = []

    # Find insertion point
    insert_pos = find_insertion_point(html)
    if insert_pos is None:
        return {"error": "No </head> tag found"}

    scripts_to_add = ""

    if not has_ga:
        scripts_to_add += "\n" + GA_SCRIPT
        changes.append("Added Google Analytics")

    if not has_um:
        scripts_to_add += "\n" + UMAMI_SCRIPT
        changes.append("Added Umami Analytics")

    if scripts_to_add:
        # Insert scripts
        new_html = html[:insert_pos] + scripts_to_add + html[insert_pos:]

        if not dry_run:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_html)

        return {"changes": changes}

    return None


def main():
    """Main entry point."""
    args = sys.argv[1:]

    dry_run = "--dry-run" in args
    verbose = "-v" in args or "--verbose" in args
    specific_files = [a for a in args if not a.startswith("-")]

    if dry_run:
        print("DRY RUN MODE - No files will be modified\n")

    # Find all HTML files
    if specific_files:
        html_files = [Path(f) for f in specific_files if f.endswith('.html')]
    else:
        patterns = [
            "ships/**/*.html",
            "ports/*.html",
            "venues/**/*.html",
            "articles/**/*.html",
            "*.html"
        ]
        html_files = []
        for pattern in patterns:
            html_files.extend(PROJECT_ROOT.glob(pattern))

    print(f"Checking {len(html_files)} HTML files...\n")

    stats = {
        "checked": 0,
        "fixed": 0,
        "already_ok": 0,
        "errors": 0,
        "missing_ga": 0,
        "missing_umami": 0
    }

    for filepath in sorted(html_files):
        rel_path = filepath.relative_to(PROJECT_ROOT)
        stats["checked"] += 1

        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                html = f.read()

            has_ga = has_google_analytics(html)
            has_um = has_umami(html)

            if not has_ga:
                stats["missing_ga"] += 1
            if not has_um:
                stats["missing_umami"] += 1

            result = fix_analytics(filepath, dry_run=dry_run)

            if result is None:
                stats["already_ok"] += 1
                if verbose:
                    print(f"  OK: {rel_path}")
            elif "error" in result:
                stats["errors"] += 1
                print(f"  ERROR: {rel_path} - {result['error']}")
            else:
                stats["fixed"] += 1
                print(f"  FIXED: {rel_path} - {', '.join(result['changes'])}")

        except Exception as e:
            stats["errors"] += 1
            print(f"  ERROR: {rel_path} - {e}")

    print(f"\n{'=' * 60}")
    print("Summary:")
    print(f"  Checked: {stats['checked']}")
    print(f"  Already OK: {stats['already_ok']}")
    print(f"  Fixed: {stats['fixed']}")
    print(f"  Errors: {stats['errors']}")
    print(f"\nBefore fix:")
    print(f"  Missing Google Analytics: {stats['missing_ga']}")
    print(f"  Missing Umami: {stats['missing_umami']}")

    if dry_run and stats['fixed'] > 0:
        print(f"\nRun without --dry-run to apply fixes to {stats['fixed']} files")


if __name__ == "__main__":
    main()
