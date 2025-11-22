#!/usr/bin/env python3
"""Add right rail with page-grid layout to all port pages"""

import re
from pathlib import Path

def fix_port_page(file_path):
    """Convert port page to page-grid layout with right rail"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content
    changes = []

    # Check if already has page-grid
    if 'class="wrap page-grid"' in content:
        return None, []

    # 1. Change <main class="wrap"> to <main class="wrap page-grid">
    if '<main class="wrap"' in content:
        content = content.replace('<main class="wrap"', '<main class="wrap page-grid"', 1)
        changes.append("Added page-grid layout to main")

    # 2. Update page-intro positioning: grid-column: 1 / -1 → grid-column: 2; grid-row: 1
    pattern = r'(<section class="page-intro" style=")([^"]*?)(">)'
    def update_page_intro(match):
        start = match.group(1)
        style = match.group(2)
        end = match.group(3)

        # Replace grid-column: 1 / -1 with grid-column: 2; grid-row: 1
        new_style = re.sub(r'grid-column:\s*1\s*/\s*-1\s*;?', 'grid-column: 2; grid-row: 1;', style)

        # If no grid-column was found, add it
        if 'grid-column' not in new_style:
            new_style = 'grid-column: 2; grid-row: 1; ' + new_style

        # Clean up
        new_style = new_style.strip()
        if new_style and not new_style.endswith(';'):
            new_style += ';'

        return start + new_style + end

    content = re.sub(pattern, update_page_intro, content)
    if 'grid-column: 2; grid-row: 1' in content and 'grid-column: 2; grid-row: 1' not in original_content:
        changes.append("Moved page-intro to right rail")

    # 3. Wrap main article content in grid-positioned div
    # Find the article tag after page-intro and before any closing tags
    article_pattern = r'(</section>\s*\n\s*)(<article class="card">)'
    article_replacement = r'\1<div style="grid-column: 1; grid-row: 1 / span 999;">\n    \2'

    if re.search(article_pattern, content):
        content = re.sub(article_pattern, article_replacement, content, count=1)
        changes.append("Wrapped article in grid-positioned div")

        # Find the closing </article> and add closing </div> after related sections
        # Look for the pattern: </article> followed by optional FAQ section, then the "Back to Ports" link
        close_pattern = r'(</article>)(\s*(?:<section class="card" id="faq"[^>]*>.*?</section>\s*)?<p[^>]*><a href="/ports\.html"[^>]*>.*?</a></p>)'
        close_replacement = r'\1\n  </div>\2'

        content = re.sub(close_pattern, close_replacement, content, count=1, flags=re.DOTALL)

    # 4. Add aside before the "Back to Ports" link if it doesn't exist
    if '<aside' not in content:
        # Find position before the "Back to Ports" paragraph
        back_link_pattern = r'(\s*<p[^>]*><a href="/ports\.html")'

        aside_html = '''
  <aside class="rail" style="grid-column: 2; grid-row: 2;">
    <section class="card">
      <h3>About the Author</h3>
      <div class="author-info" style="display: flex; gap: 1rem; align-items: flex-start;">
        <a href="/authors/ken-baker.html" style="flex-shrink: 0;">
          <picture>
            <source srcset="/authors/img/ken1.webp" type="image/webp"/>
            <img src="/authors/img/ken1.webp" width="80" height="80" alt="Ken Baker" style="border-radius: 50%;" decoding="async"/>
          </picture>
        </a>
        <div>
          <h4 style="margin: 0 0 0.25rem;"><a href="/authors/ken-baker.html">Ken Baker</a></h4>
          <p style="margin: 0; font-size: 0.85rem; color: #666;">Founder of In the Wake. 50+ sailings and counting.</p>
        </div>
      </div>
    </section>

    <section class="card">
      <h3>Recent Articles</h3>
      <div id="recent-rail"></div>
    </section>
  </aside>

'''

        content = re.sub(back_link_pattern, aside_html + r'\1', content, count=1)
        changes.append("Added aside with author and articles")

    # 5. Add JavaScript to load recent articles before </body>
    if '<script' not in content or 'articles/index.json' not in content:
        js_code = '''
  <script>
    // Load recent articles
    (async function() {
      try {
        const response = await fetch('/assets/data/articles/index.json');
        const articles = await response.json();
        const rail = document.getElementById('recent-rail');

        if (rail && articles && articles.length > 0) {
          rail.innerHTML = articles.slice(0, 5).map(article => `
            <div style="margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid #e0e8f0;">
              <h4 style="margin: 0 0 0.25rem; font-size: 0.95rem;">
                <a href="${article.url}">${article.title}</a>
              </h4>
              <p style="margin: 0; font-size: 0.8rem; color: #666;">${article.date}</p>
            </div>
          `).join('');
        }
      } catch (err) {
        console.log('Could not load articles:', err);
      }
    })();
  </script>
'''

        content = content.replace('</body>', js_code + '</body>')
        changes.append("Added article loading JavaScript")

    if content != original_content:
        return content, changes
    else:
        return None, []

def main():
    """Process all port pages"""
    port_files = list(Path('ports').glob('*.html'))

    print(f"\nFound {len(port_files)} port pages\n")

    updated = 0
    for file_path in sorted(port_files):
        new_content, changes = fix_port_page(file_path)
        if new_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"✓ Updated: {file_path}")
            for change in changes:
                print(f"  - {change}")
            updated += 1
        else:
            print(f"- Skipped: {file_path} (already has page-grid)")

    print(f"\n{'='*60}")
    print(f"Total updated: {updated}/{len(port_files)}")
    print(f"{'='*60}")

if __name__ == '__main__':
    main()
