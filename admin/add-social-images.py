#!/usr/bin/env python3
"""
Add missing og:image and twitter:image meta tags to HTML pages.
Version: 1.0.0
Soli Deo Gloria
"""

import os
import re
import sys
from pathlib import Path

# Default images by directory
DEFAULT_IMAGES = {
    'ports': 'https://cruisinginthewake.com/assets/social/port-hero.jpg',
    'restaurants': 'https://cruisinginthewake.com/assets/social/dining-hero.jpg',
    'ships': 'https://cruisinginthewake.com/assets/social/ships-hero.jpg',
    'solo': 'https://cruisinginthewake.com/assets/social/travel-hero.jpg',
    'tools': 'https://cruisinginthewake.com/assets/social/tools-hero.jpg',
    'cruise-lines': 'https://cruisinginthewake.com/assets/social/cruise-lines-hero.jpg',
    'authors': 'https://cruisinginthewake.com/assets/social/about-hero.jpg',
    'default': 'https://cruisinginthewake.com/assets/social/home-hero.jpg'
}

def get_image_url(filepath):
    """Determine the appropriate social image URL based on file path."""
    path = Path(filepath)

    # Check for ship-specific images
    if 'ships/' in str(filepath):
        slug = path.stem
        social_img = f'/home/user/InTheWake/assets/social/{slug}.jpg'
        if os.path.exists(social_img):
            return f'https://cruisinginthewake.com/assets/social/{slug}.jpg'

    # Get directory
    parts = str(filepath).split('/')
    for part in parts:
        if part in DEFAULT_IMAGES:
            return DEFAULT_IMAGES[part]

    return DEFAULT_IMAGES['default']

def has_og_image(content):
    """Check if file already has og:image tag."""
    return 'og:image' in content

def has_twitter_image(content):
    """Check if file already has twitter:image tag."""
    return 'twitter:image' in content

def get_description(content):
    """Extract description from meta description tag."""
    match = re.search(r'<meta\s+name="description"\s+content="([^"]*)"', content)
    if match:
        return match.group(1)

    # Try og:description
    match = re.search(r'<meta\s+property="og:description"\s+content="([^"]*)"', content)
    if match:
        return match.group(1)

    # Try ai-summary
    match = re.search(r'<meta\s+name="ai-summary"\s+content="([^"]*)"', content)
    if match:
        return match.group(1)

    return ''

def get_title(content):
    """Extract title from og:title or title tag."""
    match = re.search(r'<meta\s+property="og:title"\s+content="([^"]*)"', content)
    if match:
        return match.group(1)

    match = re.search(r'<title>([^<]*)</title>', content)
    if match:
        return match.group(1).split(' | ')[0].strip()

    return ''

def add_social_tags(filepath, dry_run=False):
    """Add missing og:image and twitter:image tags to a file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"  ERROR reading {filepath}: {e}")
        return False

    if has_og_image(content) and has_twitter_image(content):
        return False  # Already has both

    image_url = get_image_url(filepath)
    description = get_description(content)
    title = get_title(content)
    modified = False

    # Get canonical URL for og:url
    canonical_match = re.search(r'<link\s+rel="canonical"\s+href="([^"]*)"', content)
    canonical_url = canonical_match.group(1) if canonical_match else ''

    # Add og:image after og:url if missing
    if not has_og_image(content):
        # Find og:url and add og:image after it
        og_url_pattern = r'(<meta\s+property="og:url"\s+content="[^"]*"\s*/?>)'
        if re.search(og_url_pattern, content):
            og_image_tag = f'\n  <meta property="og:image" content="{image_url}"/>'
            # Also add og:description if missing
            if 'og:description' not in content and description:
                og_image_tag = f'\n  <meta property="og:description" content="{description}"/>' + og_image_tag
            content = re.sub(og_url_pattern, r'\1' + og_image_tag, content)
            modified = True
        else:
            # Try to find og:title instead
            og_title_pattern = r'(<meta\s+property="og:title"\s+content="[^"]*"\s*/?>)'
            if re.search(og_title_pattern, content):
                og_image_tag = f'\n  <meta property="og:image" content="{image_url}"/>'
                content = re.sub(og_title_pattern, r'\1' + og_image_tag, content)
                modified = True
            elif 'og:type' not in content:
                # No OpenGraph tags at all - add full section after canonical link
                og_section = f'''
  <!-- OpenGraph -->
  <meta property="og:type" content="article"/>
  <meta property="og:site_name" content="In the Wake"/>
  <meta property="og:title" content="{title}"/>
  <meta property="og:description" content="{description}"/>
  <meta property="og:url" content="{canonical_url}"/>
  <meta property="og:image" content="{image_url}"/>
'''
                canonical_pattern = r'(<link\s+rel="canonical"\s+href="[^"]*"\s*/?>)'
                if re.search(canonical_pattern, content):
                    content = re.sub(canonical_pattern, r'\1' + og_section, content)
                    modified = True

    # Add twitter:image after twitter:card if missing
    if not has_twitter_image(content):
        twitter_card_pattern = r'(<meta\s+name="twitter:card"\s+content="[^"]*"\s*/?>)'
        if re.search(twitter_card_pattern, content):
            twitter_tags = f'\n  <meta name="twitter:image" content="{image_url}"/>'
            # Add twitter:title and twitter:description if missing
            if 'twitter:title' not in content and title:
                twitter_tags = f'\n  <meta name="twitter:title" content="{title}"/>' + twitter_tags
            if 'twitter:description' not in content and description:
                twitter_tags = f'\n  <meta name="twitter:description" content="{description}"/>' + twitter_tags
            content = re.sub(twitter_card_pattern, r'\1' + twitter_tags, content)
            modified = True
        elif 'twitter:card' not in content:
            # Add full twitter card section before </head>
            twitter_section = f'''
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image"/>
  <meta name="twitter:title" content="{title}"/>
  <meta name="twitter:description" content="{description}"/>
  <meta name="twitter:image" content="{image_url}"/>
'''
            content = content.replace('</head>', twitter_section + '</head>')
            modified = True

    if modified and not dry_run:
        try:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
        except Exception as e:
            print(f"  ERROR writing {filepath}: {e}")
            return False

    return modified

def main():
    dry_run = '--dry-run' in sys.argv
    verbose = '--verbose' in sys.argv or '-v' in sys.argv

    if dry_run:
        print("DRY RUN - No files will be modified\n")

    base_dir = '/home/user/InTheWake'
    directories = ['ports', 'restaurants', 'ships', 'solo', 'tools', 'cruise-lines', 'authors']

    # Also check root-level HTML files
    root_files = [
        'drinks.html', 'drink-packages.html', 'packing.html',
        'search.html', 'privacy.html', 'terms.html', 'offline.html'
    ]

    total_updated = 0
    total_checked = 0

    for directory in directories:
        dir_path = os.path.join(base_dir, directory)
        if not os.path.exists(dir_path):
            continue

        html_files = list(Path(dir_path).glob('**/*.html'))
        updated_in_dir = 0

        for filepath in html_files:
            total_checked += 1
            if add_social_tags(str(filepath), dry_run):
                updated_in_dir += 1
                total_updated += 1
                if verbose:
                    print(f"  Updated: {filepath}")

        print(f"{directory}/: {updated_in_dir} files updated")

    # Check root files
    for filename in root_files:
        filepath = os.path.join(base_dir, filename)
        if os.path.exists(filepath):
            total_checked += 1
            if add_social_tags(filepath, dry_run):
                total_updated += 1
                print(f"Updated: {filename}")

    print(f"\n{'Would update' if dry_run else 'Updated'}: {total_updated}/{total_checked} files")

if __name__ == '__main__':
    main()
