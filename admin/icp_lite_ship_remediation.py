#!/usr/bin/env python3
"""
ICP-Lite Ship Page Remediation Script
Soli Deo Gloria

Adds ICP-Lite content structure to ship pages:
- H1 element (if missing)
- Answer line
- Fit guidance
- Key facts
- FAQ section
- FAQPage JSON-LD

Usage:
  python3 icp_lite_ship_remediation.py --analyze
  python3 icp_lite_ship_remediation.py --fix
"""

import os
import re
import json
import argparse
from pathlib import Path
from datetime import date

ROOT = Path('/home/user/InTheWake')
TODAY = date.today().isoformat()

def extract_ship_info(content, filepath):
    """Extract ship information from page content"""
    info = {}

    # Ship name from title
    title_match = re.search(r'<title>([^<|•—]+)', content)
    if title_match:
        info['name'] = title_match.group(1).strip()
    else:
        info['name'] = filepath.stem.replace('-', ' ').title()

    # Cruise line from path
    if '/rcl/' in str(filepath):
        info['cruise_line'] = 'Royal Caribbean'
        info['cruise_line_short'] = 'Royal Caribbean'
    elif '/carnival/' in str(filepath):
        info['cruise_line'] = 'Carnival Cruise Line'
        info['cruise_line_short'] = 'Carnival'
    else:
        info['cruise_line'] = 'Unknown'
        info['cruise_line_short'] = 'Unknown'

    # Description
    desc_match = re.search(r'<meta\s+(?:name=["\']description["\']\s+)?content=["\']([^"\']+)["\'](?:\s+name=["\']description["\'])?', content, re.IGNORECASE)
    if desc_match:
        info['description'] = desc_match.group(1)
    else:
        info['description'] = f"Deck plans, photos, and videos for {info['name']}."

    # Check for existing H1
    h1_match = re.search(r'<h1[^>]*>([^<]+)</h1>', content)
    info['has_h1'] = bool(h1_match)

    # URL
    rel_path = str(filepath.relative_to(ROOT))
    info['url'] = f"https://www.cruisinginthewake.com/{rel_path}"

    return info

def generate_content_structure(info):
    """Generate ICP-Lite content structure for a ship page"""
    ship_name = info['name']
    cruise_line = info['cruise_line']
    cruise_line_short = info['cruise_line_short']

    h1 = f'<h1>{ship_name}</h1>' if not info.get('has_h1') else ''

    html = f'''
    <!-- ICP-Lite Content Structure -->
    <section class="page-intro" style="max-width: 1100px; margin: 1rem auto 1.5rem;">
      {h1}

      <p class="answer-line" style="margin: 0.75rem 0; padding: 0.5rem 0.75rem; border-left: 3px solid var(--rope, #d9b382); background: #f7fdff; border-radius: 8px;">
        <strong>Quick Answer:</strong> {ship_name} is a {cruise_line} ship. This page covers deck plans, live ship tracking, dining venues, and videos to help you plan your cruise.
      </p>

      <p class="fit-guidance" style="margin: 0.75rem 0; font-size: 0.95rem; color: #134; line-height: 1.6;">
        <strong>Best For:</strong> Cruisers researching {ship_name} or comparing {cruise_line_short} ships. Use this page to explore deck layouts, dining options, and onboard features before booking.
      </p>

      <div class="key-facts" style="margin: 1rem 0; padding: 1rem; background: #f7fdff; border-radius: 8px; border: 1px solid #e0f0f5;">
        <h3 style="margin: 0 0 0.5rem; font-size: 1rem; color: #134;">Key Facts</h3>
        <ul style="margin: 0; padding-left: 1.25rem;">
          <li><strong>Cruise Line:</strong> {cruise_line}</li>
          <li><strong>Resources:</strong> Deck plans, dining venues, live tracker</li>
          <li><strong>Reservations:</strong> Book via cruise line or travel advisor</li>
        </ul>
      </div>
    </section>
'''
    return html

def generate_faq_section(info):
    """Generate FAQ section for a ship page"""
    ship_name = info['name']
    cruise_line = info['cruise_line']
    cruise_line_short = info['cruise_line_short']

    faq_html = f'''
    <!-- ICP-Lite FAQ Section -->
    <section class="card faq" id="faq" style="margin: 1.5rem 0; padding: 1rem;">
      <h2 style="margin: 0 0 1rem; font-size: 1.25rem;">Frequently Asked Questions</h2>

      <details style="margin: 0.5rem 0; padding: 0.5rem 0; border-bottom: 1px solid #e0e8f0;">
        <summary style="cursor: pointer; font-weight: 600; padding: 0.5rem 0;">What dining options are available on {ship_name}?</summary>
        <p style="margin: 0.5rem 0; padding-left: 1rem;">{ship_name} offers complimentary dining including the main dining room and buffet. Specialty restaurants vary by ship class. Check the dining section above for specific venues.</p>
      </details>

      <details style="margin: 0.5rem 0; padding: 0.5rem 0; border-bottom: 1px solid #e0e8f0;">
        <summary style="cursor: pointer; font-weight: 600; padding: 0.5rem 0;">How do I find the deck plans for {ship_name}?</summary>
        <p style="margin: 0.5rem 0; padding-left: 1rem;">Deck plans are available through the links on this page. You can also find official deck plans on the {cruise_line_short} website or in the cruise planner app.</p>
      </details>

      <details style="margin: 0.5rem 0; padding: 0.5rem 0; border-bottom: 1px solid #e0e8f0;">
        <summary style="cursor: pointer; font-weight: 600; padding: 0.5rem 0;">Where does {ship_name} sail?</summary>
        <p style="margin: 0.5rem 0; padding-left: 1rem;">Ship deployments vary by season. Check the {cruise_line_short} website for current itineraries and departure ports for {ship_name}.</p>
      </details>

      <details style="margin: 0.5rem 0; padding: 0.5rem 0;">
        <summary style="cursor: pointer; font-weight: 600; padding: 0.5rem 0;">Is this information official?</summary>
        <p style="margin: 0.5rem 0; padding-left: 1rem;">This page provides planning resources and community insights. Always confirm details with {cruise_line} or your travel advisor before booking.</p>
      </details>
    </section>
'''
    return faq_html

def generate_faqpage_jsonld(info):
    """Generate FAQPage JSON-LD schema"""
    ship_name = info['name']
    cruise_line = info['cruise_line']
    cruise_line_short = info['cruise_line_short']

    schema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": f"What dining options are available on {ship_name}?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": f"{ship_name} offers complimentary dining including the main dining room and buffet. Specialty restaurants vary by ship class."
                }
            },
            {
                "@type": "Question",
                "name": f"How do I find the deck plans for {ship_name}?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": f"Deck plans are available through the links on this page or on the {cruise_line_short} website."
                }
            },
            {
                "@type": "Question",
                "name": f"Where does {ship_name} sail?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": f"Ship deployments vary by season. Check the {cruise_line_short} website for current itineraries."
                }
            }
        ]
    }

    return f'''
  <!-- JSON-LD: FAQPage (ICP-Lite) -->
  <script type="application/ld+json">
  {json.dumps(schema, indent=2)}
  </script>'''

def has_content_structure(content):
    """Check if page already has content structure"""
    has_answer = 'answer-line' in content
    has_fit = 'fit-guidance' in content
    has_facts = 'key-facts' in content
    return has_answer and has_fit and has_facts

def has_faq_section(content):
    """Check if page has FAQ section"""
    return bool(re.search(r'<section[^>]*(?:class="[^"]*faq|id="faq)[^>]*>', content, re.IGNORECASE))

def has_faqpage_jsonld(content):
    """Check if page has FAQPage JSON-LD"""
    return '"@type": "FAQPage"' in content or '"@type":"FAQPage"' in content

def fix_ship_page(filepath, verbose=False):
    """Add missing ICP-Lite elements to a ship page"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        return {'error': str(e), 'changes': []}

    changes = []
    info = extract_ship_info(content, filepath)

    # Add FAQPage JSON-LD if missing
    if not has_faqpage_jsonld(content):
        jsonld = generate_faqpage_jsonld(info)
        # Insert before </head>
        content = content.replace('</head>', jsonld + '\n</head>')
        changes.append('Added FAQPage JSON-LD')

    # Add content structure if missing
    if not has_content_structure(content):
        structure = generate_content_structure(info)
        # Find insertion point after <main> tag
        main_match = re.search(r'(<main[^>]*>)', content)
        if main_match:
            pos = main_match.end()
            content = content[:pos] + structure + content[pos:]
            changes.append('Added content structure (answer-line, fit-guidance, key-facts)')

    # Add FAQ section if missing
    if not has_faq_section(content):
        faq = generate_faq_section(info)
        # Find insertion point before </main>
        content = content.replace('</main>', faq + '\n</main>')
        changes.append('Added FAQ section')

    # Write changes
    if changes:
        try:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
        except Exception as e:
            return {'error': str(e), 'changes': []}

    return {'changes': changes, 'info': info}

def main():
    parser = argparse.ArgumentParser(description='ICP-Lite Ship Page Remediation')
    parser.add_argument('--analyze', action='store_true', help='Analyze only')
    parser.add_argument('--fix', action='store_true', help='Fix missing elements')
    parser.add_argument('--verbose', action='store_true', help='Verbose output')
    args = parser.parse_args()

    if not args.analyze and not args.fix:
        args.analyze = True

    # Find ship pages from all subdirectories
    ship_files = []
    for pattern in ['ships/rcl/*.html', 'ships/carnival/*.html',
                    'ships/carnival-cruise-line/*.html', 'ships/celebrity-cruises/*.html',
                    'ships/holland-america-line/*.html', 'ships/msc/*.html',
                    'ships/*.html']:
        ship_files.extend(ROOT.glob(pattern))

    # Exclude index, template, and rooms files
    ship_files = [f for f in ship_files if f.name not in ['index.html', 'template.html', 'rooms.html']]

    print(f"Found {len(ship_files)} ship pages")
    print()

    if args.analyze:
        missing_structure = 0
        missing_faq = 0
        missing_jsonld = 0

        for filepath in sorted(ship_files):
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            if not has_content_structure(content):
                missing_structure += 1
                if args.verbose:
                    print(f"Missing structure: {filepath.relative_to(ROOT)}")

            if not has_faq_section(content):
                missing_faq += 1

            if not has_faqpage_jsonld(content):
                missing_jsonld += 1

        print("Ship Page Analysis:")
        print(f"  Missing content structure: {missing_structure}")
        print(f"  Missing FAQ section: {missing_faq}")
        print(f"  Missing FAQPage JSON-LD: {missing_jsonld}")

    elif args.fix:
        fixed = 0
        errors = 0

        for filepath in sorted(ship_files):
            result = fix_ship_page(filepath, verbose=args.verbose)

            if 'error' in result:
                errors += 1
                print(f"ERROR: {filepath.relative_to(ROOT)} - {result['error']}")
                continue

            if result['changes']:
                fixed += 1
                if args.verbose or fixed <= 15:
                    print(f"Fixed: {filepath.relative_to(ROOT)}")
                    for change in result['changes']:
                        print(f"  + {change}")

        print()
        print("=" * 60)
        print("SHIP PAGE REMEDIATION COMPLETE")
        print("=" * 60)
        print(f"Files Updated: {fixed}")
        print(f"Errors: {errors}")

if __name__ == '__main__':
    main()
