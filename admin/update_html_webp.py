#!/usr/bin/env python3
"""
Update all HTML files to use WebP images with fallbacks
Soli Deo Gloria

Updates img src attributes to use .webp versions while keeping originals as fallbacks
Excludes /vendors/ directory
"""

import os
import re
from pathlib import Path

def get_webp_path(image_path):
    """Convert image path to WebP equivalent"""
    # Handle versioned paths
    path_without_version = re.sub(r'\?v=[^"\']*', '', image_path)

    # Convert extension to .webp
    for ext in ['.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG']:
        if path_without_version.endswith(ext):
            webp_path = path_without_version[:-len(ext)] + '.webp'
            # Add back version if it existed
            if '?v=' in image_path:
                version = re.search(r'\?v=[^"\']*', image_path).group()
                webp_path += version
            return webp_path
    return None

def check_webp_exists(html_file_path, image_path):
    """Check if WebP version of image exists"""
    # Clean the path
    clean_path = image_path.split('?')[0]  # Remove version query

    # Handle absolute paths from root
    if clean_path.startswith('/'):
        clean_path = clean_path[1:]  # Remove leading slash
        webp_file = Path('/home/user/InTheWake') / clean_path.replace('.jpg', '.webp').replace('.jpeg', '.webp').replace('.png', '.webp').replace('.JPG', '.webp').replace('.JPEG', '.webp').replace('.PNG', '.webp')
    else:
        # Relative path
        html_dir = Path(html_file_path).parent
        webp_file = html_dir / clean_path.replace('.jpg', '.webp').replace('.jpeg', '.webp').replace('.png', '.webp').replace('.JPG', '.webp').replace('.JPEG', '.webp').replace('.PNG', '.webp')

    return webp_file.exists()

def update_img_src(html_content, html_file_path):
    """Update img src attributes to use WebP with fallbacks"""

    def replace_src(match):
        """Replace individual img src"""
        full_match = match.group(0)
        quote = match.group(1)
        src_path = match.group(2)

        # Skip external URLs, SVGs, and data URIs
        if (src_path.startswith('http://') or src_path.startswith('https://') or
            src_path.startswith('data:') or src_path.endswith('.svg') or
            '/vendors/' in src_path):
            return full_match

        # Skip if already WebP
        if '.webp' in src_path.lower():
            return full_match

        # Check if WebP version exists
        if not check_webp_exists(html_file_path, src_path):
            return full_match

        # Get WebP path
        webp_path = get_webp_path(src_path)
        if not webp_path:
            return full_match

        # Update src to WebP
        updated = full_match.replace(f'{quote}{src_path}{quote}', f'{quote}{webp_path}{quote}')

        # Check if there's an onerror handler to update fallback
        return updated

    # Pattern to match src="..." or src='...'
    pattern = r'src=(["\'])([^"\']+)\1'
    updated_content = re.sub(pattern, replace_src, html_content)

    return updated_content

def update_onerror_fallbacks(html_content):
    """Update onerror fallback paths to use WebP first"""

    def replace_fallback(match):
        """Update fallback path in onerror"""
        full_match = match.group(0)
        fallback_path = match.group(1)

        # Skip if already WebP or external
        if '.webp' in fallback_path or 'http' in fallback_path:
            return full_match

        # Convert to WebP
        webp_fallback = fallback_path
        for ext in ['.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG']:
            if ext in webp_fallback:
                webp_fallback = webp_fallback.replace(ext, '.webp')
                break

        # Insert WebP as first fallback, keep original as second
        if webp_fallback != fallback_path:
            # Find all fallbacks in this onerror
            return full_match.replace(f"'{fallback_path}'", f"'{webp_fallback}','{fallback_path}'")

        return full_match

    # Pattern to match paths in onerror handlers
    pattern = r"(?:_abs\(|src=)'([^']+\.(?:jpg|jpeg|png|JPG|JPEG|PNG)[^']*)'"
    updated_content = re.sub(pattern, replace_fallback, html_content)

    return updated_content

def update_html_file(file_path):
    """Update a single HTML file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content

        # Update img src attributes
        content = update_img_src(content, file_path)

        # Update onerror fallbacks
        content = update_onerror_fallbacks(content)

        # Only write if changed
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False

    except Exception as e:
        print(f"❌ Error updating {file_path}: {e}")
        return False

def find_html_files(directory):
    """Find all HTML files except in vendors"""
    html_files = []
    for root, dirs, files in os.walk(directory):
        # Skip vendors directory
        if 'vendors' in root or 'node_modules' in root or '.git' in root:
            continue

        for file in files:
            if file.endswith('.html'):
                html_files.append(Path(root) / file)

    return html_files

def main():
    print("🔍 Finding all HTML files...")
    html_files = find_html_files('.')
    print(f"📊 Found {len(html_files)} HTML files to process\n")

    updated = 0
    for html_file in html_files:
        if update_html_file(html_file):
            print(f"✅ Updated {html_file}")
            updated += 1
        else:
            print(f"⏭️  No changes needed for {html_file}")

    print(f"\n✨ Complete! Updated {updated}/{len(html_files)} HTML files")

if __name__ == '__main__':
    main()
