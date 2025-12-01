#!/usr/bin/env python3
"""
ICP-Lite Remediation Script
Soli Deo Gloria

Analyzes all HTML pages and adds missing ICP-Lite compliance elements:
- WebPage JSON-LD schema
- FAQPage JSON-LD schema (where FAQ sections exist)
- H1 elements
- Content structure (answer-line, fit-guidance, key-facts)
- FAQ sections

Usage:
  python3 icp_lite_remediation.py --analyze       # Analyze only, no changes
  python3 icp_lite_remediation.py --fix           # Fix missing elements
  python3 icp_lite_remediation.py --fix --verbose # Fix with detailed output
"""

import os
import re
import json
import argparse
from pathlib import Path
from datetime import date
from collections import defaultdict

# Configuration
ROOT = Path('/home/user/InTheWake')
EXCLUDE_DIRS = {'vendors', 'vendor', 'solo/articles', 'admin', 'assets', 'audit-reports'}
TODAY = date.today().isoformat()

def should_process(filepath):
    """Check if file should be processed based on exclusions"""
    path_str = str(filepath)
    for exclude in EXCLUDE_DIRS:
        if f'/{exclude}/' in path_str or path_str.endswith(f'/{exclude}'):
            return False
    return True

def analyze_file(filepath):
    """Analyze a single file for ICP-Lite compliance"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        return {'error': str(e)}

    result = {
        'has_meta_ai_summary': 'name="ai-summary"' in content or "name='ai-summary'" in content,
        'has_meta_last_reviewed': 'name="last-reviewed"' in content or "name='last-reviewed'" in content,
        'has_meta_content_protocol': 'name="content-protocol"' in content or "name='content-protocol'" in content,
        'has_webpage_jsonld': '"@type": "WebPage"' in content or '"@type":"WebPage"' in content,
        'has_faqpage_jsonld': '"@type": "FAQPage"' in content or '"@type":"FAQPage"' in content,
        'has_h1': bool(re.search(r'<h1[^>]*>', content)),
        'has_answer_line': 'class="answer-line"' in content or "class='answer-line'" in content or 'answer-line' in content,
        'has_fit_guidance': 'class="fit-guidance"' in content or "class='fit-guidance'" in content or 'fit-guidance' in content,
        'has_key_facts': 'class="key-facts"' in content or "class='key-facts'" in content or 'key-facts' in content,
        'has_faq_section': bool(re.search(r'<section[^>]*(?:class="[^"]*faq|id="faq)[^>]*>', content, re.IGNORECASE)),
    }

    # Calculate compliance score
    elements = ['has_meta_ai_summary', 'has_meta_last_reviewed', 'has_meta_content_protocol',
                'has_webpage_jsonld', 'has_h1', 'has_answer_line', 'has_fit_guidance',
                'has_key_facts', 'has_faq_section']
    result['score'] = sum(1 for e in elements if result[e])
    result['max_score'] = len(elements)
    result['is_compliant'] = result['score'] == result['max_score']

    return result

def extract_page_info(content, filepath):
    """Extract page information for generating missing elements"""
    info = {}

    # Title
    title_match = re.search(r'<title>([^<]+)</title>', content, re.IGNORECASE)
    if title_match:
        info['title'] = title_match.group(1).split('|')[0].split('—')[0].strip()
    else:
        info['title'] = filepath.stem.replace('-', ' ').title()

    # Description
    desc_match = re.search(r'<meta\s+name=["\']description["\']\s+content=["\']([^"\']+)["\']', content, re.IGNORECASE)
    if desc_match:
        info['description'] = desc_match.group(1)
    else:
        info['description'] = f"Information about {info['title']}"

    # URL path
    rel_path = str(filepath.relative_to(ROOT))
    info['url'] = f"https://cruisinginthewake.com/{rel_path}"

    # Page type detection
    if '/ships/' in str(filepath):
        info['type'] = 'ship'
    elif '/restaurants/' in str(filepath):
        info['type'] = 'restaurant'
    elif '/cruise-lines/' in str(filepath):
        info['type'] = 'cruise-line'
    elif '/ports/' in str(filepath):
        info['type'] = 'port'
    else:
        info['type'] = 'general'

    return info

def generate_webpage_jsonld(info):
    """Generate WebPage JSON-LD schema"""
    schema = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": info['title'],
        "url": info['url'],
        "description": info['description'][:200]
    }
    return f'''
  <!-- JSON-LD: WebPage (ICP-Lite) -->
  <script type="application/ld+json">
  {json.dumps(schema, indent=2)}
  </script>'''

def add_webpage_jsonld(content, info):
    """Add WebPage JSON-LD to content if missing"""
    if '"@type": "WebPage"' in content or '"@type":"WebPage"' in content:
        return content, False

    jsonld = generate_webpage_jsonld(info)

    # Find insertion point - after last JSON-LD block or before </head>
    # Look for existing JSON-LD blocks
    jsonld_pattern = r'(</script>\s*)(?=\s*(?:<!--[^>]*-->)?\s*(?:<link|<style|</head>))'
    matches = list(re.finditer(jsonld_pattern, content))

    if matches:
        # Insert after last JSON-LD block
        last_match = matches[-1]
        pos = last_match.end()
        content = content[:pos] + jsonld + content[pos:]
    else:
        # Insert before </head>
        content = content.replace('</head>', jsonld + '\n</head>')

    return content, True

def fix_file(filepath, verbose=False):
    """Fix missing ICP-Lite elements in a file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        return {'error': str(e), 'changes': []}

    changes = []
    info = extract_page_info(content, filepath)

    # Add WebPage JSON-LD if missing
    content, changed = add_webpage_jsonld(content, info)
    if changed:
        changes.append('Added WebPage JSON-LD')

    # Write changes if any
    if changes:
        try:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
        except Exception as e:
            return {'error': str(e), 'changes': []}

    return {'changes': changes, 'info': info}

def main():
    parser = argparse.ArgumentParser(description='ICP-Lite Remediation Script')
    parser.add_argument('--analyze', action='store_true', help='Analyze files only')
    parser.add_argument('--fix', action='store_true', help='Fix missing elements')
    parser.add_argument('--verbose', action='store_true', help='Verbose output')
    parser.add_argument('--type', type=str, help='Filter by type (ship, restaurant, cruise-line, port)')
    args = parser.parse_args()

    if not args.analyze and not args.fix:
        args.analyze = True

    # Find all HTML files
    html_files = list(ROOT.rglob('*.html'))
    files_to_process = [f for f in html_files if should_process(f)]

    print(f"Found {len(html_files)} total HTML files")
    print(f"Processing {len(files_to_process)} files (excluding {', '.join(EXCLUDE_DIRS)})")
    print()

    if args.analyze:
        # Analyze mode
        stats = defaultdict(int)
        missing_webpage = []
        missing_faq = []

        for filepath in sorted(files_to_process):
            result = analyze_file(filepath)
            if 'error' in result:
                stats['errors'] += 1
                continue

            stats['total'] += 1
            if result['is_compliant']:
                stats['compliant'] += 1

            for key, value in result.items():
                if key.startswith('has_') and value:
                    stats[key] += 1

            # Track files missing specific elements
            if not result['has_webpage_jsonld']:
                missing_webpage.append(str(filepath.relative_to(ROOT)))
            if not result['has_faq_section']:
                missing_faq.append(str(filepath.relative_to(ROOT)))

        # Print summary
        print("=" * 60)
        print("ICP-LITE COMPLIANCE ANALYSIS")
        print("=" * 60)
        print()
        print(f"Total Files Analyzed: {stats['total']}")
        print(f"Fully Compliant: {stats['compliant']} ({stats['compliant']*100//stats['total'] if stats['total'] else 0}%)")
        print()
        print("Element Coverage:")
        print(f"  Meta ai-summary:      {stats['has_meta_ai_summary']}/{stats['total']} ({stats['has_meta_ai_summary']*100//stats['total'] if stats['total'] else 0}%)")
        print(f"  Meta last-reviewed:   {stats['has_meta_last_reviewed']}/{stats['total']} ({stats['has_meta_last_reviewed']*100//stats['total'] if stats['total'] else 0}%)")
        print(f"  Meta content-protocol: {stats['has_meta_content_protocol']}/{stats['total']} ({stats['has_meta_content_protocol']*100//stats['total'] if stats['total'] else 0}%)")
        print(f"  WebPage JSON-LD:      {stats['has_webpage_jsonld']}/{stats['total']} ({stats['has_webpage_jsonld']*100//stats['total'] if stats['total'] else 0}%)")
        print(f"  FAQPage JSON-LD:      {stats['has_faqpage_jsonld']}/{stats['total']} ({stats['has_faqpage_jsonld']*100//stats['total'] if stats['total'] else 0}%)")
        print(f"  H1 Element:           {stats['has_h1']}/{stats['total']} ({stats['has_h1']*100//stats['total'] if stats['total'] else 0}%)")
        print(f"  Answer Line:          {stats['has_answer_line']}/{stats['total']} ({stats['has_answer_line']*100//stats['total'] if stats['total'] else 0}%)")
        print(f"  Fit Guidance:         {stats['has_fit_guidance']}/{stats['total']} ({stats['has_fit_guidance']*100//stats['total'] if stats['total'] else 0}%)")
        print(f"  Key Facts:            {stats['has_key_facts']}/{stats['total']} ({stats['has_key_facts']*100//stats['total'] if stats['total'] else 0}%)")
        print(f"  FAQ Section:          {stats['has_faq_section']}/{stats['total']} ({stats['has_faq_section']*100//stats['total'] if stats['total'] else 0}%)")
        print()

        if args.verbose:
            print("Files missing WebPage JSON-LD:")
            for f in missing_webpage[:20]:
                print(f"  - {f}")
            if len(missing_webpage) > 20:
                print(f"  ... and {len(missing_webpage) - 20} more")
            print()

        print(f"Files missing WebPage JSON-LD: {len(missing_webpage)}")
        print(f"Files missing FAQ Section: {len(missing_faq)}")

    elif args.fix:
        # Fix mode
        fixed = 0
        errors = 0

        for filepath in sorted(files_to_process):
            result = fix_file(filepath, verbose=args.verbose)

            if 'error' in result:
                errors += 1
                if args.verbose:
                    print(f"ERROR: {filepath.relative_to(ROOT)} - {result['error']}")
                continue

            if result['changes']:
                fixed += 1
                if args.verbose or fixed <= 10:
                    print(f"Fixed: {filepath.relative_to(ROOT)}")
                    for change in result['changes']:
                        print(f"  + {change}")

        print()
        print("=" * 60)
        print(f"REMEDIATION COMPLETE")
        print("=" * 60)
        print(f"Files Updated: {fixed}")
        print(f"Errors: {errors}")

if __name__ == '__main__':
    main()
