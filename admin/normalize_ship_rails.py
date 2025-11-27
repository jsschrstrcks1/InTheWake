#!/usr/bin/env python3
"""
╔═══════════════════════════════════════════════════════════════════════════════╗
║                    SHIP PAGE NORMALIZER - Quantum Pattern                      ║
║                              Soli Deo Gloria                                   ║
╚═══════════════════════════════════════════════════════════════════════════════╝

Normalizes all ship pages to match the Quantum of the Seas reference pattern:
  - Adds page-grid CSS layout (2-column responsive)
  - Adds right rail with Quick Answer / Best For / Key Facts
  - Adds vertical author card
  - Adds Recent Articles rail
  - Adds Stateroom Checker link
  - Removes old hamburger author/articles sections
"""

import os
import re
import sys
from pathlib import Path
from datetime import datetime

# ANSI colors for beautiful output
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BOLD = '\033[1m'
    DIM = '\033[2m'
    END = '\033[0m'

def print_banner():
    print(f"""
{Colors.CYAN}{Colors.BOLD}╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║   ⛵  SHIP PAGE NORMALIZER                                                    ║
║       Quantum Right Rail Pattern                                              ║
║                                                                               ║
║   Standardizing Royal Caribbean ship pages                                    ║
║   for consistent user experience                                              ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝{Colors.END}
""")

def print_section(title):
    print(f"\n{Colors.BLUE}{Colors.BOLD}{'─'*60}{Colors.END}")
    print(f"{Colors.BLUE}{Colors.BOLD}  {title}{Colors.END}")
    print(f"{Colors.BLUE}{Colors.BOLD}{'─'*60}{Colors.END}\n")

# Ships already normalized (skip these)
ALREADY_DONE = {
    'quantum-of-the-seas.html',
    'icon-of-the-seas.html',
    'star-of-the-seas.html',
    'allure-of-the-seas.html'
}

# The right rail template (with placeholder for ship name)
RIGHT_RAIL_TEMPLATE = '''  <!-- MAIN CONTENT -->
  <main class="wrap page-grid" id="main-content" role="main" tabindex="-1" style="display: grid; grid-template-columns: 1fr; gap: 2rem; align-items: start;">
  <style>
    @media (min-width: 980px) {{
      .page-grid {{
        grid-template-columns: 1fr 360px !important;
      }}
    }}

    .author-card-vertical {{
      text-align: center;
    }}

    .author-card-vertical .author-avatar {{
      width: 96px;
      height: 96px;
      border-radius: 50%;
      object-fit: cover;
      margin: 0 auto 1rem;
    }}

    .author-card-vertical h4 {{
      margin: 0.5rem 0 0.25rem;
    }}

    .author-card-vertical p {{
      margin: 0.25rem 0;
    }}

    /* Rail list */
    .rail-list {{
      display: grid;
      gap: 1rem;
    }}
  </style>

    <!-- Right Rail -->
    <aside class="rail" role="complementary" aria-label="Key facts, author & articles" style="grid-column: 2; grid-row: 1;">
      <!-- Quick Answer / Best For / Key Facts -->
      <section class="page-intro" style="margin: 0 0 1rem 0;">
        <p class="answer-line" style="margin: 0.75rem 0; padding: 0.5rem 0.75rem; border-left: 3px solid var(--rope, #d9b382); background: #f7fdff; border-radius: 8px;">
          <strong>Quick Answer:</strong> {ship_name} is a Royal Caribbean ship. This page covers deck plans, live ship tracking, dining venues, and videos to help you plan your cruise.
        </p>

        <p class="fit-guidance" style="margin: 0.75rem 0; font-size: 0.95rem; color: #134; line-height: 1.6;">
          <strong>Best For:</strong> Cruisers researching {ship_name} or comparing Royal Caribbean ships. Use this page to explore deck layouts, dining options, and onboard features before booking.
        </p>

        <div class="key-facts" style="margin: 1rem 0; padding: 1rem; background: #f7fdff; border-radius: 8px; border: 1px solid #e0f0f5;">
          <h3 style="margin: 0 0 0.5rem; font-size: 1rem; color: #134;">Key Facts</h3>
          <ul style="margin: 0; padding-left: 1.25rem;">
            <li><strong>Cruise Line:</strong> Royal Caribbean</li>
            <li><strong>Resources:</strong> Deck plans, dining venues, live tracker</li>
            <li><strong>Reservations:</strong> Book via cruise line or travel advisor</li>
          </ul>
        </div>

        <p style="margin: 1rem 0; text-align: center;">
          <a href="/stateroom-check.html" class="pill" style="display: inline-block; padding: 0.6rem 1.2rem; text-decoration: none;">
            🛏️ Check Your Stateroom →
          </a>
        </p>
      </section>

      <!-- Author card (Vertical Layout) -->
      <section class="card author-card-vertical" aria-labelledby="author-heading">
        <h3 id="author-heading">About the Author</h3>
        <a href="/authors/ken-baker.html" aria-label="View Ken Baker's profile">
          <picture>
            <source srcset="/authors/img/ken1.webp?v=3.010.300" type="image/webp"/>
            <img class="author-avatar" src="/authors/img/ken1_96.webp" srcset="/authors/img/ken1_96.webp 1x, /authors/img/ken1_192.webp 2x" width="96" height="96" alt="Author photo" style="border-radius: 12px;" decoding="async" loading="lazy"/>
          </picture>
        </a>
        <h4><a href="/authors/ken-baker.html">Ken Baker</a></h4>
        <p class="tiny">Founder of In the Wake; writer and editor of the logbook.</p>
        <p class="tiny">
          <a href="https://www.flickersofmajesty.com" target="_blank" rel="noopener">Flickers of Majesty</a>
        </p>
      </section>

      <!-- Recent Articles rail -->
      <section class="card" aria-labelledby="recent-rail-title">
        <h3 id="recent-rail-title">Recent Stories</h3>
        <p class="tiny" style="margin-bottom: 1rem; color: var(--ink-mid, #3d5a6a); line-height: 1.5;">
          Real cruising experiences, practical guides, and heartfelt reflections from our community. Explore stories that inform, inspire, and connect.
        </p>
        <div id="recent-rail" class="rail-list" aria-live="polite"></div>
        <p id="recent-rail-fallback" class="tiny" style="display:none">Loading articles...</p>
      </section>
    </aside>

    <!-- Main Content Column -->
    <div style="grid-column: 1; grid-row: 1;">'''

def get_ship_name(filename):
    """Convert filename to ship name."""
    name = filename.replace('.html', '').replace('-', ' ')
    # Title case with "of the" lowercase
    words = name.split()
    result = []
    for i, word in enumerate(words):
        if word.lower() in ('of', 'the') and i > 0:
            result.append(word.lower())
        else:
            result.append(word.capitalize())
    return ' '.join(result)

def normalize_ship_page(filepath):
    """Normalize a single ship page to Quantum pattern."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    filename = os.path.basename(filepath)
    ship_name = get_ship_name(filename)

    # Check if already has page-grid
    if 'class="wrap page-grid"' in content:
        return 'skip_done', ship_name

    # Pattern 1: Replace the old main content opening
    old_main_pattern = re.compile(
        r'<!-- MAIN CONTENT -->\s*'
        r'<main class="wrap" id="main-content" role="main" tabindex="-1">\s*'
        r'<!-- ICP-Lite Content Structure -->\s*'
        r'<section class="page-intro" style="grid-column: 2; grid-row: 1; margin: 1rem auto 1\.5rem;">\s*'
        r'<p class="answer-line"[^>]*>\s*'
        r'<strong>Quick Answer:</strong>[^<]*</p>\s*'
        r'<p class="fit-guidance"[^>]*>\s*'
        r'<strong>Best For:</strong>[^<]*</p>\s*'
        r'<div class="key-facts"[^>]*>\s*'
        r'<h3[^>]*>Key Facts</h3>\s*'
        r'<ul[^>]*>\s*'
        r'<li><strong>Cruise Line:</strong>[^<]*</li>\s*'
        r'<li><strong>Resources:</strong>[^<]*</li>\s*'
        r'<li><strong>Reservations:</strong>[^<]*</li>\s*'
        r'</ul>\s*'
        r'</div>\s*'
        r'</section>\s*'
        r'<!-- ICP-Lite: Page Intro -->\s*'
        r'<section class="page-intro" style="grid-column: 2; grid-row: 1; margin: 1rem auto 1\.5rem;" aria-label="[^"]*overview">',
        re.DOTALL
    )

    # Generate the replacement
    replacement = RIGHT_RAIL_TEMPLATE.format(ship_name=ship_name)

    new_content = old_main_pattern.sub(replacement, content)

    if new_content == content:
        # Try simpler pattern - just update the main tag
        simple_pattern = re.compile(
            r'(<!-- MAIN CONTENT -->\s*)'
            r'<main class="wrap" id="main-content" role="main" tabindex="-1">',
            re.DOTALL
        )
        if simple_pattern.search(content):
            new_content = simple_pattern.sub(
                r'\1<main class="wrap page-grid" id="main-content" role="main" tabindex="-1" style="display: grid; grid-template-columns: 1fr; gap: 2rem; align-items: start;">',
                content
            )
        else:
            return 'error_pattern', ship_name

    # Pattern 2: Remove the hamburger author/articles section
    hamburger_pattern = re.compile(
        r'\s*<!-- Author & Articles -->\s*'
        r'<section class="grid-2">\s*'
        r'<aside class="card" aria-labelledby="author-info">.*?</aside>\s*'
        r'<aside class="card" aria-labelledby="related-articles">.*?</aside>\s*'
        r'</section>\s*'
        r'(?=<!-- Attribution -->)',
        re.DOTALL
    )

    new_content = hamburger_pattern.sub('\n    </div><!-- End Main Content Column -->\n\n    ', new_content)

    # Write back
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)

    return 'success', ship_name

def main():
    print_banner()

    ships_dir = Path('/home/user/InTheWake/ships/rcl')

    if not ships_dir.exists():
        print(f"{Colors.RED}ERROR: Directory not found: {ships_dir}{Colors.END}")
        return

    html_files = sorted(ships_dir.glob('*.html'))

    print_section("SCANNING SHIP PAGES")
    print(f"  📁 Directory: {Colors.CYAN}{ships_dir}{Colors.END}")
    print(f"  📄 Total files: {Colors.BOLD}{len(html_files)}{Colors.END}")
    print(f"  ✅ Already done: {Colors.DIM}{len(ALREADY_DONE)}{Colors.END}")
    print(f"  🔧 To process: {Colors.BOLD}{len(html_files) - len(ALREADY_DONE)}{Colors.END}")

    print_section("PROCESSING SHIPS")

    results = {'success': [], 'skip_done': [], 'skip_already': [], 'error': []}

    for filepath in html_files:
        filename = filepath.name

        if filename in ALREADY_DONE:
            print(f"  {Colors.DIM}⏭️  {filename:<45} (pre-normalized){Colors.END}")
            results['skip_already'].append(filename)
            continue

        try:
            status, ship_name = normalize_ship_page(filepath)

            if status == 'success':
                print(f"  {Colors.GREEN}✓  {filename:<45} → {ship_name}{Colors.END}")
                results['success'].append(filename)
            elif status == 'skip_done':
                print(f"  {Colors.YELLOW}⏭️  {filename:<45} (already has page-grid){Colors.END}")
                results['skip_done'].append(filename)
            else:
                print(f"  {Colors.RED}✗  {filename:<45} (pattern not matched){Colors.END}")
                results['error'].append(filename)

        except Exception as e:
            print(f"  {Colors.RED}✗  {filename:<45} ERROR: {e}{Colors.END}")
            results['error'].append(filename)

    # Summary
    print_section("SUMMARY")

    total = len(html_files)
    success = len(results['success'])
    skipped = len(results['skip_done']) + len(results['skip_already'])
    errors = len(results['error'])

    print(f"""
  {Colors.GREEN}{'━'*50}{Colors.END}

  {Colors.BOLD}📊 Results{Colors.END}

     ✅ Successfully normalized:  {Colors.GREEN}{Colors.BOLD}{success:3d}{Colors.END} ships
     ⏭️  Skipped (already done):   {Colors.YELLOW}{skipped:3d}{Colors.END} ships
     ❌ Errors:                    {Colors.RED}{errors:3d}{Colors.END} ships
     {'─'*35}
     📁 Total processed:          {Colors.BOLD}{total:3d}{Colors.END} ships

  {Colors.GREEN}{'━'*50}{Colors.END}
""")

    if results['success']:
        print(f"  {Colors.GREEN}{Colors.BOLD}🎉 Normalized ships:{Colors.END}")
        for ship in results['success']:
            name = get_ship_name(ship)
            print(f"     • {name}")

    if results['error']:
        print(f"\n  {Colors.RED}{Colors.BOLD}⚠️  Ships with errors:{Colors.END}")
        for ship in results['error']:
            print(f"     • {ship}")

    print(f"\n  {Colors.CYAN}Soli Deo Gloria ✝️{Colors.END}\n")

if __name__ == '__main__':
    main()
