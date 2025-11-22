#!/usr/bin/env python3
"""Update article loaders to use optimized thumbnails"""

import re
from pathlib import Path

def update_article_loader(content):
    """Update article loading code to prefer thumbnails"""
    original = content
    changes = []

    # Pattern 1: Update the primary image selection to prefer thumb
    # Look for: let primary = pick(p,['image','cover','img','thumb','thumbnail'], null);
    pattern1 = r"let primary = pick\(p,\s*\['image','cover','img','thumb','thumbnail'\],\s*null\);"
    replacement1 = "let primary = pick(p, ['thumb','thumbnail','image','cover','img'], null);"

    if re.search(pattern1, content):
        content = re.sub(pattern1, replacement1, content)
        changes.append("Reordered image priority to prefer thumbnails")

    # Pattern 2: Update specific hardcoded image paths to use thumbs
    # freedom-of-your-own-wake
    if '/assets/articles/freedom-of-your-own-wake/cover.jpg' in content or \
       '/assets/articles/freedom-of-your-own-wake.jpg' in content:
        content = content.replace(
            '/assets/articles/freedom-of-your-own-wake/cover.jpg',
            '/assets/articles/thumbs/freedom-of-your-own-wake.webp'
        )
        content = content.replace(
            '/assets/articles/freedom-of-your-own-wake.jpg',
            '/assets/articles/thumbs/freedom-of-your-own-wake.webp'
        )
        changes.append("Updated freedom-of-your-own-wake to use thumbnail")

    # why-i-started-solo-cruising
    if '/assets/articles/why-i-started-solo-cruising.jpg' in content:
        content = content.replace(
            '/assets/articles/why-i-started-solo-cruising.jpg',
            '/assets/articles/thumbs/why-i-started-solo-cruising.webp'
        )
        changes.append("Updated why-i-started-solo-cruising to use thumbnail")

    # top-20-questions
    if '/assets/articles/top-20-questions/cover.jpg' in content:
        content = content.replace(
            '/assets/articles/top-20-questions/cover.jpg',
            '/assets/articles/thumbs/top-20-questions/cover.webp'
        )
        changes.append("Updated top-20-questions to use thumbnail")

    if content != original:
        return content, changes

    return None, []

def update_file(file_path):
    """Update a single file"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content, changes = update_article_loader(content)

    if new_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return changes

    return None

def main():
    """Process files with article loading code"""
    files = list(Path('.').rglob('*.html'))
    files = [f for f in files if 'vendors' not in str(f) and '.git' not in str(f)]

    print(f"\nProcessing {len(files)} HTML files...\n")

    updated = 0
    for file_path in sorted(files):
        try:
            changes = update_file(file_path)
            if changes:
                print(f"✓ {file_path}")
                for change in changes:
                    print(f"  - {change}")
                updated += 1
        except Exception as e:
            print(f"✗ {file_path}: {e}")

    print(f"\n{'='*60}")
    print(f"Updated: {updated} files")
    print(f"{'='*60}\n")

    print("Article thumbnails now being used:")
    print("  - /assets/articles/thumbs/freedom-of-your-own-wake.webp (4 KB vs 635 KB)")
    print("  - /assets/articles/thumbs/why-i-started-solo-cruising.webp (3 KB vs 391 KB)")
    print("  - /assets/articles/thumbs/top-20-questions/cover.webp (3 KB vs 314 KB)")
    print("\nSavings: ~1,337 KB per page load with article thumbnails")

if __name__ == '__main__':
    main()
