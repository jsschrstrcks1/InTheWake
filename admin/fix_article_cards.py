#!/usr/bin/env python3
"""
CSS Consolidation Phase 2: Update Article Card Inline Styles to CSS Classes

Replaces the inline-styled article card template with CSS class version.
Part of the site-wide CSS consolidation effort (2025-12-11).
"""

import os
import re
from pathlib import Path

# Old pattern (inline styles)
OLD_PATTERN = r'''<article class="card" style="display:flex;flex-direction:column;gap:\.75rem;padding:\.85rem">\s*
\s*<div style="display:grid;grid-template-columns:80px 1fr;gap:\.75rem;align-items:start">\s*
\s*<div style="width:80px;height:60px;overflow:hidden;border-radius:8px;background:#eef4f6;border:1px solid #dfe7ea;flex-shrink:0">\s*
\s*<img class="article-thumb" alt="" decoding="async" loading="lazy" style="width:100%;height:100%;object-fit:cover">\s*
\s*</div>\s*
\s*<div>\s*
\s*<h4 style="margin:0 0 \.35rem 0;font-size:\.9rem;line-height:1\.3;font-weight:600">\s*
\s*<a href="\$\{href\}" style="color:var\(--accent,#0e6e8e\);text-decoration:none">\$\{title\}</a>\s*
\s*</h4>\s*
\s*\$\{excerpt \? `<p class="tiny" style="margin:0;line-height:1\.4;color:var\(--ink-mid,#3d5a6a\)">\$\{excerpt\}</p>` : ''\}\s*
\s*</div>\s*
\s*</div>\s*
\s*<a href="\$\{href\}" class="pill" style="align-self:flex-start;font-size:\.85rem;padding:\.45rem \.95rem;text-decoration:none">Read Article →</a>\s*
\s*</article>'''

# New pattern (CSS classes)
NEW_PATTERN = '''<article class="card article-card">
            <div class="article-card-grid">
              <div class="article-thumb-wrap">
                <img class="article-thumb" alt="" decoding="async" loading="lazy">
              </div>
              <div class="article-card-body">
                <h4><a href="${href}">${title}</a></h4>
                ${excerpt ? `<p class="tiny excerpt">${excerpt}</p>` : ''}
              </div>
            </div>
            <a href="${href}" class="pill read-more">Read Article →</a>
          </article>'''

# Simpler search pattern for detection
DETECT_PATTERN = r'style="display:flex;flex-direction:column;gap:\.75rem;padding:\.85rem"'

def process_file(filepath):
    """Process a single HTML file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Check if file has the pattern
    if 'display:flex;flex-direction:column;gap:.75rem;padding:.85rem' not in content:
        return False

    # Simple string replacement approach - with escaped $ in template literals
    old_template = r'''<article class="card" style="display:flex;flex-direction:column;gap:.75rem;padding:.85rem">
            <div style="display:grid;grid-template-columns:80px 1fr;gap:.75rem;align-items:start">
              <div style="width:80px;height:60px;overflow:hidden;border-radius:8px;background:#eef4f6;border:1px solid #dfe7ea;flex-shrink:0">
                <img class="article-thumb" alt="" decoding="async" loading="lazy" style="width:100%;height:100%;object-fit:cover">
              </div>
              <div>
                <h4 style="margin:0 0 .35rem 0;font-size:.9rem;line-height:1.3;font-weight:600">
                  <a href="\${href}" style="color:var(--accent,#0e6e8e);text-decoration:none">\${title}</a>
                </h4>
                \${excerpt ? `<p class="tiny" style="margin:0;line-height:1.4;color:var(--ink-mid,#3d5a6a)">\${excerpt}</p>` : ''}
              </div>
            </div>
            <a href="\${href}" class="pill" style="align-self:flex-start;font-size:.85rem;padding:.45rem .95rem;text-decoration:none">Read Article →</a>
          </article>'''

    new_template = r'''<article class="card article-card">
            <div class="article-card-grid">
              <div class="article-thumb-wrap">
                <img class="article-thumb" alt="" decoding="async" loading="lazy">
              </div>
              <div class="article-card-body">
                <h4><a href="\${href}">\${title}</a></h4>
                \${excerpt ? `<p class="tiny excerpt">\${excerpt}</p>` : ''}
              </div>
            </div>
            <a href="\${href}" class="pill read-more">Read Article →</a>
          </article>'''

    if old_template in content:
        new_content = content.replace(old_template, new_template)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True

    # Try alternate pattern (different indentation, no backslash escapes)
    old_template_alt = '''<article class="card" style="display:flex;flex-direction:column;gap:.75rem;padding:.85rem">
          <div style="display:grid;grid-template-columns:80px 1fr;gap:.75rem;align-items:start">
            <div style="width:80px;height:60px;overflow:hidden;border-radius:8px;background:#eef4f6;border:1px solid #dfe7ea;flex-shrink:0">
              <img class="article-thumb" alt="" decoding="async" loading="lazy" style="width:100%;height:100%;object-fit:cover">
            </div>
            <div>
              <h4 style="margin:0 0 .35rem 0;font-size:.9rem;line-height:1.3;font-weight:600">
                <a href="${href}" style="color:var(--accent,#0e6e8e);text-decoration:none">${title}</a>
              </h4>
              ${excerpt ? `<p class="tiny" style="margin:0;line-height:1.4;color:var(--ink-mid,#3d5a6a)">${excerpt}</p>` : ''}
            </div>
          </div>
          <a href="${href}" class="pill" style="align-self:flex-start;font-size:.85rem;padding:.45rem .95rem;text-decoration:none">Read Article →</a>
        </article>'''

    new_template_alt = '''<article class="card article-card">
          <div class="article-card-grid">
            <div class="article-thumb-wrap">
              <img class="article-thumb" alt="" decoding="async" loading="lazy">
            </div>
            <div class="article-card-body">
              <h4><a href="${href}">${title}</a></h4>
              ${excerpt ? `<p class="tiny excerpt">${excerpt}</p>` : ''}
            </div>
          </div>
          <a href="${href}" class="pill read-more">Read Article →</a>
        </article>'''

    if old_template_alt in content:
        new_content = content.replace(old_template_alt, new_template_alt)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True

    # Try variant with </article> on same line (no newline before closing tag)
    old_template_v3 = r'''<article class="card" style="display:flex;flex-direction:column;gap:.75rem;padding:.85rem">
            <div style="display:grid;grid-template-columns:80px 1fr;gap:.75rem;align-items:start">
              <div style="width:80px;height:60px;overflow:hidden;border-radius:8px;background:#eef4f6;border:1px solid #dfe7ea;flex-shrink:0">
                <img class="article-thumb" alt="" decoding="async" loading="lazy" style="width:100%;height:100%;object-fit:cover">
              </div>
              <div>
                <h4 style="margin:0 0 .35rem 0;font-size:.9rem;line-height:1.3;font-weight:600">
                  <a href="\${href}" style="color:var(--accent,#0e6e8e);text-decoration:none">\${title}</a>
                </h4>
                \${excerpt ? `<p class="tiny" style="margin:0;line-height:1.4;color:var(--ink-mid,#3d5a6a)">\${excerpt}</p>` : ''}
              </div>
            </div>
            <a href="\${href}" class="pill" style="align-self:flex-start;font-size:.85rem;padding:.45rem .95rem;text-decoration:none">Read Article →</a></article>'''

    new_template_v3 = r'''<article class="card article-card">
            <div class="article-card-grid">
              <div class="article-thumb-wrap">
                <img class="article-thumb" alt="" decoding="async" loading="lazy">
              </div>
              <div class="article-card-body">
                <h4><a href="\${href}">\${title}</a></h4>
                \${excerpt ? `<p class="tiny excerpt">\${excerpt}</p>` : ''}
              </div>
            </div>
            <a href="\${href}" class="pill read-more">Read Article →</a></article>'''

    if old_template_v3 in content:
        new_content = content.replace(old_template_v3, new_template_v3)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True

    return False

def main():
    root = Path('/home/user/InTheWake')
    updated = 0
    skipped = 0

    for filepath in root.rglob('*.html'):
        # Skip admin and backup directories
        if 'admin' in str(filepath) or 'backup' in str(filepath):
            continue

        if process_file(filepath):
            print(f"✓ Updated: {filepath.relative_to(root)}")
            updated += 1
        elif 'display:flex;flex-direction:column;gap:.75rem;padding:.85rem' in open(filepath, 'r').read():
            print(f"⚠ Has pattern but not exact match: {filepath.relative_to(root)}")
            skipped += 1

    print(f"\n{'='*50}")
    print(f"Updated: {updated} files")
    print(f"Skipped (needs manual review): {skipped} files")

if __name__ == '__main__':
    main()
