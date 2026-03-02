#!/usr/bin/env python3
"""
Fix all ship pages to match proper Radiance/ships.html ICP-Lite structure.
Standardizes: H1, answer-line, fit-guidance, key-facts, FAQ with details tags.
"""

import re
from pathlib import Path

SHIPS_DIR = Path('/home/user/InTheWake/ships/rcl')

def fix_ship_page(filepath):
    """Apply proper ICP-Lite structure to a ship page."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    ship_name = extract_ship_name(content)

    print(f"Processing {ship_name}...")

    # 1. Fix answer-line structure (if exists with wrong format)
    # OLD: <p class="answer-line"><strong>Quick Answer:</strong> ...
    # NEW: <p class="answer-line"><span class="answer-q">What this page covers</span><span class="answer-a">...

    answer_pattern = r'<p class="answer-line"><strong>Quick Answer:</strong>\s*([^<]+)</p>'
    if re.search(answer_pattern, content):
        content = re.sub(
            answer_pattern,
            r'<p class="answer-line">\n      <span class="answer-q">What this page covers</span>\n      <span class="answer-a">\1</span>\n    </p>',
            content
        )

    # 2. Fix fit-guidance: <div> → <section>
    content = re.sub(
        r'<div class="fit-guidance">',
        '<section class="fit-guidance">',
        content
    )
    content = re.sub(
        r'</div>\s*\n\s*<div class="key-facts">',
        '</section>\n\n    <section class="key-facts card">',
        content
    )

    # 3. Fix key-facts: <div> → <section class="key-facts card">
    content = re.sub(
        r'<div class="key-facts">',
        '<section class="key-facts card">',
        content
    )
    content = re.sub(
        r'</ul>\s*\n\s*</div>\s*\n\s*</section>\s*\n\s*<!-- Row 1',
        '</ul>\n    </section>\n  </section>\n\n  <!-- Row 1',
        content
    )

    # 4. Add sr-only h2 to fit-guidance if missing
    if '<section class="fit-guidance">' in content and '<h2 class="sr-only">' not in content:
        content = re.sub(
            r'(<section class="fit-guidance">)\s*\n\s*(<h2>)',
            r'\1\n      <h2 class="sr-only">Who This Page Is For</h2>\n      <h2>',
            content
        )
        # Or if there's no h2 at all, add it
        content = re.sub(
            r'(<section class="fit-guidance">)\s*\n\s*(<p>)',
            r'\1\n      <h2 class="sr-only">Who This Page Is For</h2>\n      \2',
            content
        )

    # 5. Fix FAQ section: <div class="faq-item"> → <details>
    # Replace faq-item divs with details/summary
    faq_item_pattern = r'<div class="faq-item">\s*<h3>([^<]+)</h3>\s*<p>([^<]+)</p>\s*</div>'

    def replace_faq_item(match):
        question = match.group(1)
        answer = match.group(2)
        return f'''<details>
        <summary>{question}</summary>
        <p>{answer}</p>
      </details>'''

    content = re.sub(faq_item_pattern, replace_faq_item, content, flags=re.DOTALL)

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True

    return False

def extract_ship_name(content):
    """Extract ship name from content."""
    match = re.search(r'<h1[^>]*>([^<]+)</h1>', content)
    if match:
        return match.group(1).split('—')[0].strip()
    return "Unknown Ship"

def main():
    """Main execution."""
    print("Fixing ship page structure to match proper ICP-Lite...\n")

    fixed_count = 0
    ship_files = sorted(SHIPS_DIR.glob('*.html'))

    for filepath in ship_files:
        if fix_ship_page(filepath):
            fixed_count += 1

    print(f"\n✓ Fixed {fixed_count} ship files")

if __name__ == '__main__':
    main()
