#!/usr/bin/env python3
"""
Fix article rails and structural issues site-wide.
- Adds article loading script to pages with recent-rail but no script
- Removes duplicate recent-rail sections (keeps the one in aside.rail)
- Removes duplicate footers (keeps the proper one after </main>)
"""

import re
from pathlib import Path

BASE_DIR = Path("/home/user/InTheWake")
EXCLUDE = ['/vendors/', '/solo/articles/']

# Simple article loading script to add
ARTICLE_SCRIPT = '''
  <script>
  (async function(){
    const rail = document.getElementById('recent-rail');
    if(!rail) return;
    try {
      const res = await fetch('/assets/data/articles/index.json');
      const articles = await res.json();
      rail.innerHTML = articles.slice(0, 4).map(a => '<div style="margin-bottom:.75rem;"><a href="' + a.url + '">' + a.title + '</a></div>').join('');
    } catch(e) {}
  })();
  </script>
'''

def fix_duplicate_recent_rails(content):
    """Remove duplicate recent-rail sections, keeping the one in aside.rail"""
    # Pattern: Recent Stories section with recent-rail div that's NOT inside aside.rail
    # We want to remove the one that has grid-column: 1 or is outside the aside

    # Find the aside.rail section
    aside_match = re.search(r'<aside[^>]*class="[^"]*rail[^"]*"[^>]*>.*?</aside>', content, re.DOTALL)

    if aside_match:
        aside_content = aside_match.group(0)
        # Check if aside has recent-rail
        if 'id="recent-rail"' in aside_content:
            # Remove any recent-rail sections OUTSIDE the aside
            # Pattern for standalone Recent Stories section
            pattern = r'<!-- Recent Articles rail -->\s*<section[^>]*aria-labelledby="recent-rail-title"[^>]*>.*?</section>\s*'

            # Only replace if it's before the aside (in the main content div)
            before_aside = content[:aside_match.start()]
            after_aside = content[aside_match.end():]

            before_aside_fixed = re.sub(pattern, '', before_aside, flags=re.DOTALL)
            content = before_aside_fixed + aside_content + after_aside

    return content

def fix_duplicate_footers(content):
    """Remove duplicate footers, keeping the main one after </main>"""
    # Find all footer tags
    footer_pattern = r'<footer[^>]*>.*?</footer>'
    footers = list(re.finditer(footer_pattern, content, re.DOTALL))

    if len(footers) <= 1:
        return content

    # Find </main> position
    main_close = content.find('</main>')
    if main_close == -1:
        return content

    # Keep only the footer that comes after </main>
    # Remove all others
    to_remove = []
    kept_one = False

    for match in footers:
        if match.start() > main_close and not kept_one:
            # Keep this one (first footer after </main>)
            kept_one = True
        else:
            to_remove.append(match)

    # Remove footers in reverse order to maintain positions
    for match in reversed(to_remove):
        content = content[:match.start()] + content[match.end():]

    return content

def add_article_script(content):
    """Add article loading script if missing"""
    if 'articles/index.json' in content or 'articles.json' in content:
        return content  # Already has script

    if 'id="recent-rail"' not in content:
        return content  # No recent-rail to load

    # Add script before </body>
    body_close = content.rfind('</body>')
    if body_close == -1:
        return content

    content = content[:body_close] + ARTICLE_SCRIPT + content[body_close:]
    return content

def fix_file(file_path):
    """Fix a single file"""
    try:
        content = file_path.read_text(errors='ignore')
        original = content

        # Apply fixes
        content = fix_duplicate_recent_rails(content)
        content = fix_duplicate_footers(content)
        content = add_article_script(content)

        if content != original:
            file_path.write_text(content)
            return True
        return False
    except Exception as e:
        print(f"Error fixing {file_path}: {e}")
        return False

def main():
    fixed_count = 0
    checked_count = 0

    for html_file in BASE_DIR.rglob('*.html'):
        path_str = str(html_file)
        if any(ex in path_str for ex in EXCLUDE):
            continue

        checked_count += 1
        if fix_file(html_file):
            print(f"Fixed: {html_file.relative_to(BASE_DIR)}")
            fixed_count += 1

    print(f"\nChecked {checked_count} files, fixed {fixed_count}")

if __name__ == "__main__":
    main()
