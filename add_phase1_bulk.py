#!/usr/bin/env python3
"""
Bulk add AI breadcrumbs and Person schema to HTML files.

This script adds:
1. AI breadcrumbs (HTML comment) at start of <body>
2. Person schema (JSON-LD) before closing </head>

Usage:
    python3 add_phase1_bulk.py --dry-run              # Preview changes
    python3 add_phase1_bulk.py --backup               # Modify with backups
    python3 add_phase1_bulk.py file1.html file2.html  # Process specific files
"""

import argparse
import os
import re
import sys
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional, Tuple
from bs4 import BeautifulSoup, Comment, NavigableString


# ============================================================================
# CONFIGURATION
# ============================================================================

EXCLUDE_DIRS = ['solo/articles']
VERSION = '3.010.300'
UPDATED_DATE = '2025-11-15'

# Person schema template
PERSON_SCHEMA = """{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Ken Baker",
  "url": "https://cruisinginthewake.com/authors/ken-baker.html",
  "jobTitle": "Founder and Editor",
  "description": "Traveler, pastor, and storyteller. Founder of In the Wake, a cruise traveler's logbook offering planning tools, travel tips, and faith-scented reflections for smoother sailings.",
  "image": "https://cruisinginthewake.com/authors/img/ken1.webp",
  "sameAs": [
    "https://www.flickersofmajesty.com"
  ],
  "worksFor": {
    "@type": "Organization",
    "name": "In the Wake"
  },
  "knowsAbout": [
    "Cruise Planning",
    "Royal Caribbean",
    "Solo Cruising",
    "Cruise Ship Accessibility",
    "Travel Writing",
    "Faith-Based Travel"
  ]
}"""


# ============================================================================
# PAGE TYPE DETECTION
# ============================================================================

def detect_page_type(filepath: Path) -> Dict[str, str]:
    """
    Detect page type and metadata from file path.

    Returns dict with: type, category, parent, expertise, audience, entity
    """
    path_str = str(filepath).replace('\\', '/')
    parts = path_str.split('/')
    filename = filepath.stem

    # Default metadata
    metadata = {
        'type': 'informational',
        'category': 'cruise-travel',
        'parent': '/',
        'expertise': 'Cruise Planning',
        'audience': 'cruise-travelers',
        'entity': filename.replace('-', ' ').title()
    }

    # Ships pages
    if '/ships/' in path_str:
        metadata.update({
            'type': 'ship-information',
            'category': 'ships',
            'parent': '/ships.html',
            'expertise': 'Ship Reviews & Insights',
            'audience': 'cruise-ship-researchers'
        })

        # Specific ship pages
        if filename not in ['ships', 'index']:
            ship_name = filename.replace('-', ' ').title()
            metadata['entity'] = ship_name
            metadata['parent'] = '/ships.html'

    # Restaurant/Dining pages
    elif '/restaurants/' in path_str or 'dining' in filename or 'restaurant' in filename:
        metadata.update({
            'type': 'dining-information',
            'category': 'restaurants',
            'parent': '/restaurants.html',
            'expertise': 'Cruise Dining & Restaurants',
            'audience': 'cruise-diners'
        })

    # Cruise lines
    elif '/cruise-lines/' in path_str or filename in ['royal-caribbean', 'celebrity', 'carnival']:
        metadata.update({
            'type': 'cruise-line-comparison',
            'category': 'cruise-lines',
            'parent': '/cruise-lines.html',
            'expertise': 'Cruise Line Analysis',
            'audience': 'cruise-line-researchers'
        })

    # Solo travel
    elif '/solo/' in path_str:
        metadata.update({
            'type': 'solo-travel-guide',
            'category': 'solo-cruising',
            'parent': '/solo.html',
            'expertise': 'Solo Cruising',
            'audience': 'solo-travelers'
        })

    # Planning tools
    elif filename in ['planning', 'packing', 'budgeting', 'booking'] or '/planning/' in path_str:
        metadata.update({
            'type': 'planning-tool',
            'category': 'planning',
            'parent': '/planning.html',
            'expertise': 'Cruise Planning & Preparation',
            'audience': 'cruise-planners'
        })

    # Accessibility
    elif 'accessibility' in filename or 'accessible' in filename:
        metadata.update({
            'type': 'accessibility-guide',
            'category': 'accessibility',
            'parent': '/',
            'expertise': 'Accessible Cruising',
            'audience': 'travelers-with-disabilities'
        })

    # Hub/index pages
    elif filename in ['ships', 'restaurants', 'cruise-lines', 'solo', 'planning', 'index']:
        metadata.update({
            'type': 'hub-page',
            'category': filename,
            'parent': '/',
            'expertise': 'Cruise Travel',
            'audience': 'cruise-travelers'
        })

    return metadata


# ============================================================================
# BREADCRUMB GENERATION
# ============================================================================

def extract_page_title(soup: BeautifulSoup) -> str:
    """Extract page title from <title> or <h1> tag."""
    # Try <title> first
    if soup.title and soup.title.string:
        title = soup.title.string.strip()
        # Remove site name if present
        title = re.sub(r'\s*[\|\-]\s*In the Wake.*$', '', title, flags=re.IGNORECASE)
        return title.strip()

    # Try <h1>
    h1 = soup.find('h1')
    if h1:
        return h1.get_text().strip()

    return "Untitled Page"


def extract_answer_first(soup: BeautifulSoup, page_type: str) -> str:
    """Extract or generate answer-first content."""
    # Look for meta description
    meta_desc = soup.find('meta', attrs={'name': 'description'})
    if meta_desc and meta_desc.get('content'):
        return meta_desc['content'].strip()[:150]

    # Look for first paragraph in main content
    main_content = soup.find('main') or soup.find('article') or soup.find(class_='content')
    if main_content:
        p = main_content.find('p')
        if p:
            text = p.get_text().strip()[:150]
            return text

    # Generic fallbacks based on page type
    fallbacks = {
        'ship-information': 'Comprehensive guide and insights for this cruise ship',
        'dining-information': 'Dining options, menus, and restaurant information',
        'cruise-line-comparison': 'Cruise line details and comparison information',
        'solo-travel-guide': 'Solo cruising tips and guidance',
        'planning-tool': 'Cruise planning tools and resources',
        'hub-page': 'Cruise travel information and resources'
    }

    return fallbacks.get(page_type, 'Cruise travel information')


def generate_breadcrumb(soup: BeautifulSoup, filepath: Path, metadata: Dict[str, str]) -> str:
    """Generate AI breadcrumb comment."""
    title = extract_page_title(soup)
    answer_first = extract_answer_first(soup, metadata['type'])

    breadcrumb = f"""<!-- ai-breadcrumbs
     entity: {title}
     type: {metadata['type']}
     parent: {metadata['parent']}
     category: {metadata['category']}
     updated: {UPDATED_DATE}
     version: {VERSION}
     expertise: {metadata['expertise']}
     target-audience: {metadata['audience']}
     answer-first: {answer_first}
     -->"""

    return breadcrumb


def has_ai_breadcrumb(soup: BeautifulSoup) -> bool:
    """Check if page already has AI breadcrumbs."""
    comments = soup.find_all(string=lambda text: isinstance(text, Comment))
    for comment in comments:
        if 'ai-breadcrumbs' in comment:
            return True
    return False


def insert_ai_breadcrumb(soup: BeautifulSoup, breadcrumb: str) -> bool:
    """
    Insert AI breadcrumb after <body> tag but before skip link.
    Returns True if inserted, False if already exists.
    """
    if has_ai_breadcrumb(soup):
        return False

    body = soup.find('body')
    if not body:
        return False

    # Create comment node
    comment_node = Comment(breadcrumb[4:-3])  # Remove <!-- and -->

    # Find skip link
    skip_link = body.find('a', class_='skip-link') or body.find('a', href='#main-content')

    if skip_link:
        # Insert before skip link
        skip_link.insert_before(comment_node)
        skip_link.insert_before(NavigableString('\n'))
    else:
        # Insert as first child of body
        if body.contents:
            body.contents[0].insert_before(comment_node)
            body.contents[0].insert_before(NavigableString('\n'))
        else:
            body.append(comment_node)
            body.append(NavigableString('\n'))

    return True


# ============================================================================
# PERSON SCHEMA
# ============================================================================

def has_person_schema(soup: BeautifulSoup) -> bool:
    """Check if page already has Person schema."""
    scripts = soup.find_all('script', type='application/ld+json')
    for script in scripts:
        if script.string and '@type' in script.string and 'Person' in script.string:
            return True
    return False


def insert_person_schema(soup: BeautifulSoup) -> bool:
    """
    Insert Person schema before closing </head> tag.
    Returns True if inserted, False if already exists.
    """
    if has_person_schema(soup):
        return False

    head = soup.find('head')
    if not head:
        return False

    # Create schema comment and script
    comment = Comment(' JSON-LD: Person (E-E-A-T) ')

    script = soup.new_tag('script', type='application/ld+json')
    script.string = '\n' + PERSON_SCHEMA + '\n'

    # Insert before closing </head>
    head.append(NavigableString('\n'))
    head.append(comment)
    head.append(NavigableString('\n'))
    head.append(script)
    head.append(NavigableString('\n'))

    return True


# ============================================================================
# FILE PROCESSING
# ============================================================================

def should_exclude(filepath: Path, base_dir: Path) -> bool:
    """Check if file should be excluded based on path."""
    try:
        rel_path = filepath.relative_to(base_dir)
        rel_path_str = str(rel_path).replace('\\', '/')

        for exclude_dir in EXCLUDE_DIRS:
            if rel_path_str.startswith(exclude_dir):
                return True

        return False
    except ValueError:
        return False


def find_html_files(base_dir: Path) -> List[Path]:
    """Find all HTML files excluding specified directories."""
    html_files = []

    for root, dirs, files in os.walk(base_dir):
        root_path = Path(root)

        # Skip excluded directories
        if should_exclude(root_path, base_dir):
            dirs.clear()  # Don't recurse into subdirectories
            continue

        for file in files:
            if file.endswith('.html'):
                filepath = root_path / file
                if not should_exclude(filepath, base_dir):
                    html_files.append(filepath)

    return sorted(html_files)


def process_file(filepath: Path, dry_run: bool = False, backup: bool = False) -> Dict[str, any]:
    """
    Process a single HTML file.

    Returns dict with:
        - success: bool
        - breadcrumb_added: bool
        - schema_added: bool
        - error: str (if any)
    """
    result = {
        'success': False,
        'breadcrumb_added': False,
        'schema_added': False,
        'error': None
    }

    try:
        # Read file
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Parse HTML
        soup = BeautifulSoup(content, 'html.parser')

        # Detect page type
        metadata = detect_page_type(filepath)

        # Add AI breadcrumb
        breadcrumb = generate_breadcrumb(soup, filepath, metadata)
        result['breadcrumb_added'] = insert_ai_breadcrumb(soup, breadcrumb)

        # Add Person schema
        result['schema_added'] = insert_person_schema(soup)

        # If nothing changed, return success
        if not result['breadcrumb_added'] and not result['schema_added']:
            result['success'] = True
            return result

        # Write changes (if not dry run)
        if not dry_run:
            # Backup if requested
            if backup:
                backup_path = filepath.with_suffix('.html.bak')
                with open(backup_path, 'w', encoding='utf-8') as f:
                    f.write(content)

            # Write modified HTML
            html_str = str(soup)
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(html_str)

        result['success'] = True

    except Exception as e:
        result['error'] = str(e)

    return result


# ============================================================================
# MAIN
# ============================================================================

def main():
    parser = argparse.ArgumentParser(
        description='Add AI breadcrumbs and Person schema to HTML files',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
Examples:
  %(prog)s --dry-run                    Preview all changes
  %(prog)s --backup                     Process all with backups
  %(prog)s file1.html file2.html        Process specific files
  %(prog)s --dry-run --verbose          Preview with detailed output
        '''
    )

    parser.add_argument(
        'files',
        nargs='*',
        help='Specific HTML files to process (default: all HTML files)'
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Preview changes without modifying files'
    )
    parser.add_argument(
        '--backup',
        action='store_true',
        help='Create .bak backup files before modification'
    )
    parser.add_argument(
        '--verbose', '-v',
        action='store_true',
        help='Verbose output'
    )

    args = parser.parse_args()

    # Determine base directory
    base_dir = Path(__file__).parent.resolve()

    # Find files to process
    if args.files:
        files_to_process = [Path(f).resolve() for f in args.files]
        # Validate files exist
        for f in files_to_process:
            if not f.exists():
                print(f"ERROR: File not found: {f}", file=sys.stderr)
                return 1
    else:
        print(f"Finding HTML files in {base_dir}...")
        files_to_process = find_html_files(base_dir)
        print(f"Found {len(files_to_process)} HTML files")

    if not files_to_process:
        print("No HTML files to process")
        return 0

    # Process files
    print()
    if args.dry_run:
        print("=== DRY RUN MODE (no changes will be made) ===")
    if args.backup:
        print("=== BACKUP MODE (creating .bak files) ===")
    print()

    stats = {
        'total': 0,
        'processed': 0,
        'breadcrumbs_added': 0,
        'schemas_added': 0,
        'errors': 0,
        'skipped': 0
    }

    for filepath in files_to_process:
        stats['total'] += 1

        # Get relative path for display
        try:
            rel_path = filepath.relative_to(base_dir)
        except ValueError:
            rel_path = filepath

        if args.verbose:
            print(f"Processing: {rel_path}")

        result = process_file(filepath, dry_run=args.dry_run, backup=args.backup)

        if result['success']:
            if result['breadcrumb_added'] or result['schema_added']:
                stats['processed'] += 1
                changes = []
                if result['breadcrumb_added']:
                    stats['breadcrumbs_added'] += 1
                    changes.append('breadcrumb')
                if result['schema_added']:
                    stats['schemas_added'] += 1
                    changes.append('schema')

                print(f"  ✓ {rel_path}")
                print(f"    Added: {', '.join(changes)}")
            else:
                stats['skipped'] += 1
                if args.verbose:
                    print(f"  - {rel_path} (already has both)")
        else:
            stats['errors'] += 1
            print(f"  ✗ {rel_path}")
            print(f"    Error: {result['error']}")

        if args.verbose:
            print()

    # Summary
    print()
    print("=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"Total files scanned:    {stats['total']}")
    print(f"Files modified:         {stats['processed']}")
    print(f"Breadcrumbs added:      {stats['breadcrumbs_added']}")
    print(f"Schemas added:          {stats['schemas_added']}")
    print(f"Files skipped:          {stats['skipped']}")
    print(f"Errors:                 {stats['errors']}")

    if args.dry_run:
        print()
        print("This was a DRY RUN. No files were modified.")
        print("Run without --dry-run to apply changes.")

    return 0 if stats['errors'] == 0 else 1


if __name__ == '__main__':
    sys.exit(main())
