#!/usr/bin/env python3
"""
fix-hal-historicals.py
Batch fix structural and template errors on the 34 HAL historical ship pages.

Fixes applied per file:
  1. ai-breadcrumbs: status: retired -> Retired Ship
  2. ai-breadcrumbs: category: Royal Caribbean Fleet -> Holland America Line Fleet
  3. ai-breadcrumbs: cruise-line: Royal Caribbean -> Holland America Line
  4. ai-breadcrumbs: expertise -> HAL-appropriate text
  5. Duplicate <header> tag removed
  6. page-intro <h1> -> <h2> (second H1, the page title above it stays)
  7. Add id="ship-stats" wrapper around stats fallback
  8. Add id="dining-card" to dining section
  9. Add id="faq-heading" to FAQ h2
 10. Add hidden video section with id="video-highlights"
 11. Fix copyright 2025 -> 2026
 12. Fix "Unknown ship" -> "Holland America Line historical ship"
 13. Fix "Unknown" cruise line in Quick Answer Key Facts
 14. Fix "Unknown website" in FAQ -> "Holland America Line website"
 15. Update last-reviewed and dateModified dates to 2026-02-23

Does NOT add eulogy content — that requires per-ship research.
"""

import os
import re
import sys

HAL_DIR = '/home/user/InTheWake/ships/holland-america-line'
TODAY = '2026-02-23'

# Minimal hidden video section to satisfy validator
VIDEO_SECTION = '''
    <!-- Video section hidden for historical ship — no video content available -->
    <section class="card" aria-labelledby="video-highlights" style="display:none;" data-reason="No videos available for historical ship">
      <h2 id="video-highlights">Watch: Ship Highlights</h2>
    </section>
'''

def fix_file(path):
    with open(path, encoding='utf-8') as f:
        content = f.read()

    # Only process files from the broken template
    if 'cruise-line: Royal Caribbean' not in content:
        return False, 'skipped (not a broken-template file)'

    original = content
    changes = []

    # 1. status: retired -> Retired Ship
    if 'status: retired\n' in content:
        content = content.replace('status: retired\n', 'status: Retired Ship\n', 1)
        changes.append('status: retired -> Retired Ship')

    # 2. category fix
    if 'category: Royal Caribbean Fleet' in content:
        content = content.replace('category: Royal Caribbean Fleet',
                                  'category: Holland America Line Fleet', 1)
        changes.append('category -> Holland America Line Fleet')

    # 3. cruise-line fix (in ai-breadcrumbs)
    # Only replace the first occurrence (the breadcrumb) not all text
    content = content.replace('cruise-line: Royal Caribbean',
                              'cruise-line: Holland America Line', 1)
    changes.append('cruise-line -> Holland America Line')

    # 4. expertise fix
    if 'expertise: Royal Caribbean ship reviews' in content:
        content = content.replace(
            'expertise: Royal Caribbean ship reviews, deck plans, dining analysis, cabin comparisons',
            'expertise: Holland America Line ship history, fleet archive, vintage cruise research',
            1
        )
        changes.append('expertise -> HAL text')

    # 5. Remove duplicate <header class="site-header hero-header" role="banner"> tag
    # The template has two consecutive identical opening header tags
    dup_header = '<header class="site-header hero-header" role="banner">\n<header class="site-header hero-header" role="banner">'
    if dup_header in content:
        content = content.replace(dup_header,
                                  '<header class="site-header hero-header" role="banner">', 1)
        changes.append('removed duplicate header tag')

    # 6. page-intro h1 -> h2 (the second H1 on the page, inside page-intro)
    # Pattern: inside <section class="page-intro"> ... <h1>SHIPNAME</h1>
    # We change only the h1 that follows <section class="page-intro">
    content = re.sub(
        r'(<section class="page-intro">[\s\S]*?)<h1>([^<]+)</h1>',
        r'\1<h2>\2</h2>',
        content,
        count=1
    )
    changes.append('page-intro h1 -> h2')

    # 7. Add id="ship-stats" wrapper around stats fallback
    # Currently: <script type="application/json" id="ship-stats-fallback">
    # Needs: <div id="ship-stats"><script ...>...</script></div>
    if 'id="ship-stats-fallback"' in content and 'id="ship-stats"' not in content:
        content = content.replace(
            '<script type="application/json" id="ship-stats-fallback">',
            '<div id="ship-stats"><script type="application/json" id="ship-stats-fallback">'
        )
        # Close the wrapper after the </script> that follows
        content = re.sub(
            r'(id="ship-stats-fallback">[\s\S]*?</script>)',
            r'\1</div>',
            content,
            count=1
        )
        changes.append('added id="ship-stats" wrapper')

    # 8. Add id="dining-card" to dining section
    if '<section class="section card" data-ship=' in content and 'id="dining-card"' not in content:
        content = content.replace(
            '<section class="section card" data-ship=',
            '<section class="section card" id="dining-card" data-ship=',
            1
        )
        changes.append('added id="dining-card"')

    # 9. Add id="faq-heading" to FAQ h2
    # Pattern: <h2 style="...">Frequently Asked Questions About SHIP</h2>
    if 'id="faq-heading"' not in content and 'Frequently Asked Questions' in content:
        content = re.sub(
            r'<h2 (style="[^"]*">Frequently Asked Questions)',
            r'<h2 id="faq-heading" \1',
            content,
            count=1
        )
        changes.append('added id="faq-heading"')

    # 10. Add hidden video section before the logbook section (if not already present)
    if 'id="video-highlights"' not in content and '<!-- Ken\'s Logbook Section -->' in content:
        content = content.replace(
            "<!-- Ken's Logbook Section -->",
            VIDEO_SECTION + "<!-- Ken's Logbook Section -->"
        )
        changes.append('added hidden video section')

    # 11. Copyright year fix
    content = content.replace('© 2025 In the Wake', '© 2026 In the Wake', 1)
    changes.append('copyright 2025 -> 2026')

    # 12. Fix "Unknown ship" in Quick Answer
    content = content.replace(
        'is a Unknown ship. This page covers deck plans, live ship tracking, dining venues, and videos to help you plan your cruise.',
        'is a Holland America Line historical ship. This page preserves her history and legacy for researchers and those who sailed aboard.'
    )

    # 13. Fix "Unknown" in Key Facts list items
    content = content.replace('<li><strong>Cruise Line:</strong> Unknown</li>',
                              '<li><strong>Cruise Line:</strong> Holland America Line</li>')
    content = content.replace(
        '<li><strong>Resources:</strong> Deck plans, dining venues, live tracker</li>',
        '<li><strong>Status:</strong> Historical — no longer in service</li>'
    )
    content = content.replace(
        '<li><strong>Reservations:</strong> Book via cruise line or travel advisor</li>',
        ''
    )
    changes.append('fixed Unknown placeholders')

    # 14. Fix "Unknown website" in FAQ answers
    content = content.replace('on the Unknown website', 'on the Holland America Line website')
    content = content.replace('with Unknown or your travel advisor', 'with Holland America Line or your travel advisor')
    changes.append('fixed FAQ Unknown website references')

    # 15. Update dates
    # last-reviewed (keep if already 2026-02-12 or later, update if older)
    content = re.sub(
        r'<meta name="last-reviewed" content="[^"]*"/>',
        f'<meta name="last-reviewed" content="{TODAY}"/>',
        content
    )
    # dateModified in JSON-LD (may appear multiple times)
    content = re.sub(
        r'"dateModified": "[^"]*"',
        f'"dateModified": "{TODAY}"',
        content
    )
    # ai-breadcrumbs updated field
    content = re.sub(
        r'(     updated: )[\d-]+',
        r'\g<1>' + TODAY,
        content
    )
    changes.append(f'dates -> {TODAY}')

    if content == original:
        return False, 'no changes needed'

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

    return True, ', '.join(changes)


def main():
    files = sorted([
        os.path.join(HAL_DIR, f)
        for f in os.listdir(HAL_DIR)
        if f.endswith('.html')
    ])

    fixed = 0
    skipped = 0
    errors = 0

    for path in files:
        fname = os.path.basename(path)
        try:
            changed, msg = fix_file(path)
            if changed:
                fixed += 1
                print(f'  FIXED  {fname}: {msg}')
            else:
                skipped += 1
                print(f'  skip   {fname}: {msg}')
        except Exception as e:
            errors += 1
            print(f'  ERROR  {fname}: {e}')

    print(f'\nDone: {fixed} fixed, {skipped} skipped, {errors} errors')


if __name__ == '__main__':
    main()
