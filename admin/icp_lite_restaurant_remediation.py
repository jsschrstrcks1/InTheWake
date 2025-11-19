#!/usr/bin/env python3
"""
ICP-Lite Restaurant Page Remediation Script
Soli Deo Gloria

Adds ICP-Lite content structure to restaurant pages:
- Content structure (answer-line, fit-guidance, key-facts) if missing
- FAQ section if missing
- FAQPage JSON-LD if missing

Usage:
  python3 icp_lite_restaurant_remediation.py --analyze
  python3 icp_lite_restaurant_remediation.py --fix
"""

import os
import re
import json
import argparse
from pathlib import Path
from datetime import date

ROOT = Path('/home/user/InTheWake')
TODAY = date.today().isoformat()

def extract_restaurant_info(content, filepath):
    """Extract restaurant information from page content"""
    info = {}

    # Restaurant name from title
    title_match = re.search(r'<title>([^<|•—]+)', content)
    if title_match:
        info['name'] = title_match.group(1).strip().split('—')[0].strip()
    else:
        info['name'] = filepath.stem.replace('-', ' ').title()

    # Check for cruise line mentions
    if 'royal caribbean' in content.lower() or 'rcl' in content.lower():
        info['cruise_line'] = 'Royal Caribbean'
    elif 'carnival' in content.lower():
        info['cruise_line'] = 'Carnival Cruise Line'
    else:
        info['cruise_line'] = 'Royal Caribbean'  # Default

    # Description
    desc_match = re.search(r'<meta\s+(?:name=["\']description["\']\s+)?content=["\']([^"\']+)["\'](?:\s+name=["\']description["\'])?', content, re.IGNORECASE)
    if desc_match:
        info['description'] = desc_match.group(1)
    else:
        info['description'] = f"Information about {info['name']} dining venue."

    # URL
    rel_path = str(filepath.relative_to(ROOT))
    info['url'] = f"https://www.cruisinginthewake.com/{rel_path}"

    return info

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

def generate_content_structure(info):
    """Generate ICP-Lite content structure for a restaurant page"""
    name = info['name']
    cruise_line = info['cruise_line']

    html = f'''
    <!-- ICP-Lite Content Structure -->
    <section class="page-intro" style="max-width: 1100px; margin: 1rem auto 1.5rem;">
      <p class="answer-line" style="margin: 0.75rem 0; padding: 0.5rem 0.75rem; border-left: 3px solid var(--rope, #d9b382); background: #f7fdff; border-radius: 8px;">
        <strong>Quick Answer:</strong> {name} is a dining venue on {cruise_line} ships. This page covers menus, pricing, dress code, and reservations to help you plan your dining.
      </p>

      <p class="fit-guidance" style="margin: 0.75rem 0; font-size: 0.95rem; color: #134; line-height: 1.6;">
        <strong>Best For:</strong> Cruisers researching dining options, comparing specialty restaurants, and planning meal reservations before their cruise.
      </p>

      <div class="key-facts" style="margin: 1rem 0; padding: 1rem; background: #f7fdff; border-radius: 8px; border: 1px solid #e0f0f5;">
        <h3 style="margin: 0 0 0.5rem; font-size: 1rem; color: #134;">Key Facts</h3>
        <ul style="margin: 0; padding-left: 1.25rem;">
          <li><strong>Cruise Line:</strong> {cruise_line}</li>
          <li><strong>Type:</strong> Dining venue</li>
          <li><strong>Reservations:</strong> Via cruise planner or onboard</li>
        </ul>
      </div>
    </section>
'''
    return html

def generate_faq_section(info):
    """Generate FAQ section for a restaurant page"""
    name = info['name']
    cruise_line = info['cruise_line']

    faq_html = f'''
    <!-- ICP-Lite FAQ Section -->
    <section class="card faq" id="faq" style="margin: 1.5rem 0; padding: 1rem;">
      <h2 style="margin: 0 0 1rem; font-size: 1.25rem;">Frequently Asked Questions</h2>

      <details style="margin: 0.5rem 0; padding: 0.5rem 0; border-bottom: 1px solid #e0e8f0;">
        <summary style="cursor: pointer; font-weight: 600; padding: 0.5rem 0;">Do I need reservations for {name}?</summary>
        <p style="margin: 0.5rem 0; padding-left: 1rem;">Reservations are recommended for specialty dining. You can book through the cruise planner before sailing or onboard via the app or guest services.</p>
      </details>

      <details style="margin: 0.5rem 0; padding: 0.5rem 0; border-bottom: 1px solid #e0e8f0;">
        <summary style="cursor: pointer; font-weight: 600; padding: 0.5rem 0;">What is the dress code for {name}?</summary>
        <p style="margin: 0.5rem 0; padding-left: 1rem;">Dress codes vary by venue. Check the dress code section on this page for specific requirements. Most specialty restaurants request smart casual attire.</p>
      </details>

      <details style="margin: 0.5rem 0; padding: 0.5rem 0; border-bottom: 1px solid #e0e8f0;">
        <summary style="cursor: pointer; font-weight: 600; padding: 0.5rem 0;">Is {name} included in my cruise fare?</summary>
        <p style="margin: 0.5rem 0; padding-left: 1rem;">Complimentary vs. specialty pricing varies by venue. Check the pricing information on this page. Specialty restaurants typically have a cover charge or a la carte pricing.</p>
      </details>

      <details style="margin: 0.5rem 0; padding: 0.5rem 0;">
        <summary style="cursor: pointer; font-weight: 600; padding: 0.5rem 0;">Which ships have {name}?</summary>
        <p style="margin: 0.5rem 0; padding-left: 1rem;">Availability varies by ship and class. Check the ships section on this page or the {cruise_line} website for current fleet availability.</p>
      </details>
    </section>
'''
    return faq_html

def generate_faqpage_jsonld(info):
    """Generate FAQPage JSON-LD schema"""
    name = info['name']
    cruise_line = info['cruise_line']

    schema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": f"Do I need reservations for {name}?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Reservations are recommended for specialty dining. You can book through the cruise planner or onboard."
                }
            },
            {
                "@type": "Question",
                "name": f"What is the dress code for {name}?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Dress codes vary by venue. Most specialty restaurants request smart casual attire."
                }
            },
            {
                "@type": "Question",
                "name": f"Is {name} included in my cruise fare?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Complimentary vs. specialty pricing varies by venue. Specialty restaurants typically have a cover charge or a la carte pricing."
                }
            }
        ]
    }

    return f'''
  <!-- JSON-LD: FAQPage (ICP-Lite) -->
  <script type="application/ld+json">
  {json.dumps(schema, indent=2)}
  </script>'''

def fix_restaurant_page(filepath, verbose=False):
    """Add missing ICP-Lite elements to a restaurant page"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        return {'error': str(e), 'changes': []}

    changes = []
    info = extract_restaurant_info(content, filepath)

    # Add FAQPage JSON-LD if missing
    if not has_faqpage_jsonld(content):
        jsonld = generate_faqpage_jsonld(info)
        content = content.replace('</head>', jsonld + '\n</head>')
        changes.append('Added FAQPage JSON-LD')

    # Add content structure if missing
    if not has_content_structure(content):
        structure = generate_content_structure(info)
        main_match = re.search(r'(<main[^>]*>)', content)
        if main_match:
            pos = main_match.end()
            content = content[:pos] + structure + content[pos:]
            changes.append('Added content structure')

    # Add FAQ section if missing
    if not has_faq_section(content):
        faq = generate_faq_section(info)
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
    parser = argparse.ArgumentParser(description='ICP-Lite Restaurant Page Remediation')
    parser.add_argument('--analyze', action='store_true', help='Analyze only')
    parser.add_argument('--fix', action='store_true', help='Fix missing elements')
    parser.add_argument('--verbose', action='store_true', help='Verbose output')
    args = parser.parse_args()

    if not args.analyze and not args.fix:
        args.analyze = True

    # Find restaurant pages
    restaurant_files = list(ROOT.glob('restaurants/*.html'))
    restaurant_files = [f for f in restaurant_files if f.name != 'index.html']

    print(f"Found {len(restaurant_files)} restaurant pages")
    print()

    if args.analyze:
        missing_structure = 0
        missing_faq = 0
        missing_jsonld = 0

        for filepath in sorted(restaurant_files):
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            if not has_content_structure(content):
                missing_structure += 1
                if args.verbose:
                    print(f"Missing structure: {filepath.name}")

            if not has_faq_section(content):
                missing_faq += 1

            if not has_faqpage_jsonld(content):
                missing_jsonld += 1

        print("Restaurant Page Analysis:")
        print(f"  Missing content structure: {missing_structure}")
        print(f"  Missing FAQ section: {missing_faq}")
        print(f"  Missing FAQPage JSON-LD: {missing_jsonld}")

    elif args.fix:
        fixed = 0
        errors = 0

        for filepath in sorted(restaurant_files):
            result = fix_restaurant_page(filepath, verbose=args.verbose)

            if 'error' in result:
                errors += 1
                print(f"ERROR: {filepath.name} - {result['error']}")
                continue

            if result['changes']:
                fixed += 1
                if args.verbose or fixed <= 15:
                    print(f"Fixed: {filepath.name}")
                    for change in result['changes']:
                        print(f"  + {change}")

        print()
        print("=" * 60)
        print("RESTAURANT PAGE REMEDIATION COMPLETE")
        print("=" * 60)
        print(f"Files Updated: {fixed}")
        print(f"Errors: {errors}")

if __name__ == '__main__':
    main()
