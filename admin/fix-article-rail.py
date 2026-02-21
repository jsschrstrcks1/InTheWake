#!/usr/bin/env python3
"""
Fix article rail across all port pages:
1. Add <script src="/assets/js/article-rail.js"></script> to pages that don't have it
2. Remove inline article fetch scripts (the shared module handles it now)
3. Add #recent-rail section to sidebars that are missing it
4. Add #nearby-ports section to sidebars that are missing it

Usage:
  python3 admin/fix-article-rail.py --dry-run          # Show what would change
  python3 admin/fix-article-rail.py                     # Apply changes
  python3 admin/fix-article-rail.py --file ports/cabo-san-lucas.html  # Single file
"""

import os
import re
import argparse


ARTICLE_RAIL_SCRIPT = '<script src="/assets/js/article-rail.js"></script>'

RECENT_RAIL_SECTION = '''
    <section style="grid-column: 1;" class="card" aria-labelledby="recent-rail-title">
      <h3 id="recent-rail-title">Recent Stories</h3>
      <p class="tiny content-text">
        Real cruising experiences, practical guides, and heartfelt reflections from our community.
      </p>
      <div id="recent-rail" class="rail-list" aria-live="polite"></div>
      <p id="recent-rail-fallback" class="tiny hidden">Loading articles\u2026</p>
    </section>'''

NEARBY_PORTS_SECTION = '''    <section class="card" aria-labelledby="nearby-ports-title">
      <h3 id="nearby-ports-title">Nearby Ports</h3>
      <p class="tiny" style="margin-bottom: 0.75rem; color: var(--ink-mid, #3d5a6a); line-height: 1.5;">
        Other ports in this region:
      </p>
      <div id="nearby-ports" class="rail-list" aria-live="polite"></div>
    </section>'''

def find_article_script_blocks(content):
    """Find all <script>...</script> blocks that contain articles/index.json.
    Returns list of (start, end) positions to remove, including leading whitespace."""
    blocks = []
    search_start = 0
    while True:
        pos = content.find('articles/index.json', search_start)
        if pos < 0:
            break
        # Walk backward to find the enclosing <script> tag
        script_start = content.rfind('<script>', 0, pos)
        # Walk forward to find </script>
        script_end = content.find('</script>', pos)
        if script_start < 0 or script_end < 0:
            search_start = pos + 1
            continue
        script_end += len('</script>')

        # Verify this is an inline script (no src attribute)
        tag_content = content[script_start:script_start + 50]
        if 'src=' in tag_content:
            search_start = script_end
            continue

        # Include leading whitespace/newlines
        ws_start = script_start
        while ws_start > 0 and content[ws_start - 1] in ' \t\n':
            ws_start -= 1

        blocks.append((ws_start, script_end))
        search_start = script_end
    return blocks


def process_file(filepath, dry_run=False):
    """Process a single port page. Returns (changed, description)."""
    with open(filepath, 'r', encoding='utf-8') as f:
        original = f.read()

    content = original
    changes = []

    # ================================================
    # 1. Remove inline article fetch scripts
    # ================================================
    if 'articles/index.json' in content:
        blocks = find_article_script_blocks(content)
        if blocks:
            # Remove blocks from end to start to preserve positions
            for start, end in reversed(blocks):
                content = content[:start] + '\n' + content[end:]
            changes.append(f'Removed {len(blocks)} inline article script(s)')

    # ================================================
    # 2. Add #recent-rail section to sidebar if missing
    # ================================================
    if 'id="recent-rail"' not in content and 'aside class="rail"' in content:
        # Find the closing </aside> for the sidebar
        aside_match = re.search(r'<aside class="rail"', content)
        if aside_match:
            # Find the </aside> that closes this sidebar
            aside_start = aside_match.start()
            # Look for the whimsical-units container or </aside>
            whimsical_pos = content.find('id="whimsical-units-container"', aside_start)
            if whimsical_pos > 0:
                # Insert before the whimsical section
                whimsical_tag = content.rfind('<section', aside_start, whimsical_pos)
                if whimsical_tag > 0:
                    content = content[:whimsical_tag] + RECENT_RAIL_SECTION + '\n\n' + content[whimsical_tag:]
                    changes.append('Added Recent Stories section to sidebar')
            else:
                # Insert before </aside>
                aside_close = content.find('</aside>', aside_start)
                if aside_close > 0:
                    content = content[:aside_close] + RECENT_RAIL_SECTION + '\n  ' + content[aside_close:]
                    changes.append('Added Recent Stories section to sidebar')

    # ================================================
    # 3. Add #nearby-ports section to sidebar if missing
    # ================================================
    if 'id="nearby-ports"' not in content and 'aside class="rail"' in content:
        aside_match = re.search(r'<aside class="rail"', content)
        if aside_match:
            aside_start = aside_match.start()
            # Insert at the beginning of the sidebar content (after the opening tag line)
            # Find the end of the <aside ...> opening tag
            aside_tag_end = content.find('>', aside_start) + 1
            if aside_tag_end > 0:
                # Find the first child element
                next_tag = re.search(r'\s*<', content[aside_tag_end:])
                if next_tag:
                    insert_pos = aside_tag_end + next_tag.start()
                    content = content[:insert_pos] + '\n' + NEARBY_PORTS_SECTION + '\n' + content[insert_pos:]
                    changes.append('Added Nearby Ports section to sidebar')

    # ================================================
    # 4. Add article-rail.js script if not present
    # ================================================
    if 'article-rail.js' not in content:
        # Insert after nearby-ports.js if present, or after whimsical-port-units.js,
        # or before </body>
        insert_after_re_patterns = [
            r'<script src="/assets/js/nearby-ports\.js"[^>]*></script>',
            r'<script src="/assets/js/whimsical-port-units\.js"[^>]*></script>',
        ]

        inserted = False
        for pat in insert_after_re_patterns:
            m = re.search(pat, content)
            if m:
                end_pos = m.end()
                content = content[:end_pos] + '\n  ' + ARTICLE_RAIL_SCRIPT + content[end_pos:]
                changes.append('Added article-rail.js script')
                inserted = True
                break

        if not inserted:
            # Insert before </body>
            body_close = content.find('</body>')
            if body_close > 0:
                content = content[:body_close] + '  ' + ARTICLE_RAIL_SCRIPT + '\n' + content[body_close:]
                changes.append('Added article-rail.js script (before </body>)')

    # ================================================
    # 5. Add nearby-ports.js + currentPortId if missing
    # ================================================
    basename = os.path.basename(filepath).replace('.html', '')

    if 'nearby-ports.js' not in content and 'aside class="rail"' in content:
        # Add nearby-ports.js and currentPortId before article-rail.js
        ar_match = re.search(r'<script src="/assets/js/article-rail\.js"', content)
        if ar_match:
            insert_pos = ar_match.start()
            np_scripts = (
                f"<script>window.currentPortId = '{basename}';</script>\n  "
                '<script src="/assets/js/nearby-ports.js"></script>\n  '
            )
            content = content[:insert_pos] + np_scripts + content[insert_pos:]
            changes.append(f'Added nearby-ports.js + currentPortId = {basename}')
        else:
            # Fallback: insert before </body>
            body_close = content.find('</body>')
            if body_close > 0:
                np_scripts = (
                    f"  <script>window.currentPortId = '{basename}';</script>\n"
                    '  <script src="/assets/js/nearby-ports.js"></script>\n'
                )
                content = content[:body_close] + np_scripts + content[body_close:]
                changes.append(f'Added nearby-ports.js + currentPortId = {basename}')

    elif 'currentPortId' not in content and 'nearby-ports.js' in content:
        # nearby-ports.js exists but currentPortId is missing
        np_match = re.search(r'<script src="/assets/js/nearby-ports\.js"', content)
        np_pos = np_match.start() if np_match else -1
        if np_pos >= 0:
            id_script = f"<script>window.currentPortId = '{basename}';</script>\n  "
            content = content[:np_pos] + id_script + content[np_pos:]
            changes.append(f'Added currentPortId = {basename}')

    if not changes:
        return False, 'No changes needed'

    if content == original:
        return False, 'No effective changes'

    if not dry_run:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

    return True, '; '.join(changes)


def main():
    parser = argparse.ArgumentParser(description='Fix article rail on port pages')
    parser.add_argument('--dry-run', action='store_true', help='Show changes without applying')
    parser.add_argument('--file', type=str, help='Process single file')
    args = parser.parse_args()

    if args.file:
        files = [args.file]
    else:
        port_dir = 'ports'
        files = [os.path.join(port_dir, f) for f in sorted(os.listdir(port_dir)) if f.endswith('.html')]

    changed_count = 0
    for filepath in files:
        if not os.path.exists(filepath):
            print(f'  SKIP: {filepath} not found')
            continue
        try:
            changed, desc = process_file(filepath, dry_run=args.dry_run)
            if changed:
                changed_count += 1
                prefix = '[DRY RUN] ' if args.dry_run else ''
                print(f'  {prefix}{os.path.basename(filepath)}: {desc}')
        except Exception as e:
            print(f'  ERROR: {os.path.basename(filepath)}: {e}')

    mode = 'DRY RUN' if args.dry_run else 'APPLIED'
    print(f'\n{mode}: {changed_count} files {"would be " if args.dry_run else ""}changed out of {len(files)}')


if __name__ == '__main__':
    main()
