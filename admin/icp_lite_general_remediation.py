#!/usr/bin/env python3
"""
ICP-Lite General Page Remediation Script
Soli Deo Gloria

Adds ICP-Lite content structure to remaining pages (not ships or restaurants):
- Content structure if missing
- FAQ section if missing
- FAQPage JSON-LD if missing

Usage:
  python3 icp_lite_general_remediation.py --analyze
  python3 icp_lite_general_remediation.py --fix
"""

import os
import re
import json
import argparse
from pathlib import Path
from datetime import date

ROOT = Path('/home/user/InTheWake')
TODAY = date.today().isoformat()

# Directories to skip (already handled or excluded)
SKIP_DIRS = {'ships', 'restaurants', 'vendors', 'vendor', 'solo', 'admin', 'assets', 'audit-reports'}

def should_process(filepath):
    """Check if file should be processed"""
    path_str = str(filepath.relative_to(ROOT))
    parts = path_str.split('/')

    # Skip if first directory is in skip list
    if parts and parts[0] in SKIP_DIRS:
        return False

    return True

def extract_page_info(content, filepath):
    """Extract page information from content"""
    info = {}

    # Page name from title
    title_match = re.search(r'<title>([^<|•—]+)', content)
    if title_match:
        info['name'] = title_match.group(1).strip().split('|')[0].strip()
    else:
        info['name'] = filepath.stem.replace('-', ' ').title()

    # Description
    desc_match = re.search(r'<meta\s+(?:name=["\']description["\']\s+)?content=["\']([^"\']+)["\'](?:\s+name=["\']description["\'])?', content, re.IGNORECASE)
    if desc_match:
        info['description'] = desc_match.group(1)
    else:
        info['description'] = f"Information about {info['name']}."

    # URL
    rel_path = str(filepath.relative_to(ROOT))
    info['url'] = f"https://www.cruisinginthewake.com/{rel_path}"

    # Page type detection
    if 'port' in str(filepath).lower() or 'port' in info['name'].lower():
        info['type'] = 'port'
    elif 'drink' in str(filepath).lower():
        info['type'] = 'planning'
    elif 'packing' in str(filepath).lower():
        info['type'] = 'planning'
    elif 'accessibility' in str(filepath).lower():
        info['type'] = 'accessibility'
    elif 'author' in str(filepath).lower():
        info['type'] = 'author'
    else:
        info['type'] = 'general'

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
    """Generate generic content structure"""
    name = info['name']

    html = f'''
    <!-- ICP-Lite Content Structure -->
    <section class="page-intro" style="max-width: 1100px; margin: 1rem auto 1.5rem;">
      <p class="answer-line" style="margin: 0.75rem 0; padding: 0.5rem 0.75rem; border-left: 3px solid var(--rope, #d9b382); background: #f7fdff; border-radius: 8px;">
        <strong>Quick Answer:</strong> This page provides cruise planning resources for {name}. Use the information below to help plan your cruise vacation.
      </p>

      <p class="fit-guidance" style="margin: 0.75rem 0; font-size: 0.95rem; color: #134; line-height: 1.6;">
        <strong>Best For:</strong> Cruisers researching {name.lower()}, comparing options, and gathering information for trip planning.
      </p>

      <div class="key-facts" style="margin: 1rem 0; padding: 1rem; background: #f7fdff; border-radius: 8px; border: 1px solid #e0f0f5;">
        <h3 style="margin: 0 0 0.5rem; font-size: 1rem; color: #134;">Key Facts</h3>
        <ul style="margin: 0; padding-left: 1.25rem;">
          <li><strong>Topic:</strong> {name}</li>
          <li><strong>Purpose:</strong> Cruise planning resource</li>
        </ul>
      </div>
    </section>
'''
    return html

def generate_faq_section(info):
    """Generate generic FAQ section"""
    name = info['name']

    faq_html = f'''
    <!-- ICP-Lite FAQ Section -->
    <section class="card faq" id="faq" style="margin: 1.5rem 0; padding: 1rem;">
      <h2 style="margin: 0 0 1rem; font-size: 1.25rem;">Frequently Asked Questions</h2>

      <details style="margin: 0.5rem 0; padding: 0.5rem 0; border-bottom: 1px solid #e0e8f0;">
        <summary style="cursor: pointer; font-weight: 600; padding: 0.5rem 0;">What information does this page provide?</summary>
        <p style="margin: 0.5rem 0; padding-left: 1rem;">This page provides planning resources and information about {name.lower()}. Use it alongside official cruise line resources when planning your trip.</p>
      </details>

      <details style="margin: 0.5rem 0; padding: 0.5rem 0; border-bottom: 1px solid #e0e8f0;">
        <summary style="cursor: pointer; font-weight: 600; padding: 0.5rem 0;">Is this information official?</summary>
        <p style="margin: 0.5rem 0; padding-left: 1rem;">This page provides community insights and planning resources. Always confirm details with your cruise line or travel advisor before making final decisions.</p>
      </details>

      <details style="margin: 0.5rem 0; padding: 0.5rem 0;">
        <summary style="cursor: pointer; font-weight: 600; padding: 0.5rem 0;">How can I get more help?</summary>
        <p style="margin: 0.5rem 0; padding-left: 1rem;">For additional assistance, contact your cruise line directly or work with a travel advisor who specializes in cruises.</p>
      </details>
    </section>
'''
    return faq_html

def generate_faqpage_jsonld(info):
    """Generate FAQPage JSON-LD schema"""
    name = info['name']

    schema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "What information does this page provide?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": f"This page provides planning resources and information about {name.lower()}."
                }
            },
            {
                "@type": "Question",
                "name": "Is this information official?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "This page provides community insights. Always confirm with your cruise line before making decisions."
                }
            }
        ]
    }

    return f'''
  <!-- JSON-LD: FAQPage (ICP-Lite) -->
  <script type="application/ld+json">
  {json.dumps(schema, indent=2)}
  </script>'''

def fix_page(filepath, verbose=False):
    """Add missing ICP-Lite elements to a page"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        return {'error': str(e), 'changes': []}

    changes = []
    info = extract_page_info(content, filepath)

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
        if '</main>' in content:
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
    parser = argparse.ArgumentParser(description='ICP-Lite General Page Remediation')
    parser.add_argument('--analyze', action='store_true', help='Analyze only')
    parser.add_argument('--fix', action='store_true', help='Fix missing elements')
    parser.add_argument('--verbose', action='store_true', help='Verbose output')
    args = parser.parse_args()

    if not args.analyze and not args.fix:
        args.analyze = True

    # Find all HTML files except ships and restaurants
    html_files = list(ROOT.rglob('*.html'))
    general_files = [f for f in html_files if should_process(f)]

    print(f"Found {len(general_files)} general pages (excluding ships, restaurants, excluded dirs)")
    print()

    if args.analyze:
        missing_structure = 0
        missing_faq = 0
        missing_jsonld = 0

        for filepath in sorted(general_files):
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
            except:
                continue

            if not has_content_structure(content):
                missing_structure += 1
                if args.verbose:
                    print(f"Missing structure: {filepath.relative_to(ROOT)}")

            if not has_faq_section(content):
                missing_faq += 1

            if not has_faqpage_jsonld(content):
                missing_jsonld += 1

        print("General Page Analysis:")
        print(f"  Missing content structure: {missing_structure}")
        print(f"  Missing FAQ section: {missing_faq}")
        print(f"  Missing FAQPage JSON-LD: {missing_jsonld}")

    elif args.fix:
        fixed = 0
        errors = 0

        for filepath in sorted(general_files):
            result = fix_page(filepath, verbose=args.verbose)

            if 'error' in result:
                errors += 1
                if args.verbose:
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
        print("GENERAL PAGE REMEDIATION COMPLETE")
        print("=" * 60)
        print(f"Files Updated: {fixed}")
        print(f"Errors: {errors}")

if __name__ == '__main__':
    main()
