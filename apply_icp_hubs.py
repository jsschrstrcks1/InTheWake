#!/usr/bin/env python3
"""
Apply ICP-Lite v1.0 to hub pages systematically.
Adds: no-js class, ICP meta tags, WebPage schema.
"""

import os
import re
from pathlib import Path

ROOT_DIR = Path('/home/user/InTheWake')

# Hub pages configuration with their summaries
HUB_PAGES = {
    'planning.html': {
        'title': 'Planning — In the Wake',
        'summary': 'Central planning hub for cruise travelers — ports, airports, timing guides, booking strategies, and steady answers to help you organize your journey from planning to embarkation.'
    },
    'solo.html': {
        'title': 'Solo Cruising — In the Wake',
        'summary': 'Resources and reflections for solo cruisers — from choosing the right ship and cabin to finding community at sea and planning with confidence.'
    },
    'travel.html': {
        'title': 'Travel — In the Wake',
        'summary': 'Travel guidance for cruise journeys — airport logistics, pre-cruise planning, embarkation tips, and practical wisdom for smoother sailings.'
    },
    'articles.html': {
        'title': 'Articles — In the Wake',
        'summary': 'Collection of cruise travel articles, personal stories, and planning guides from experienced cruisers sharing wisdom from their wakes.'
    },
    'about-us.html': {
        'title': 'About Us — In the Wake',
        'summary': 'Meet the travelers behind In the Wake — pastors, storytellers, and cruisers creating resources to help others find smoother sailings and faithful reflections at sea.'
    },
    'ports.html': {
        'title': 'Ports — In the Wake',
        'summary': 'Port guides and shore excursion resources for cruise destinations — helping you plan meaningful stops and navigate port logistics with confidence.'
    },
    'drinks.html': {
        'title': 'Drinks & Beverage Packages — In the Wake',
        'summary': 'Complete guide to cruise drink packages, beverage options, pricing strategies, and recommendations to help you decide what is worth the investment.'
    },
    'packing-lists.html': {
        'title': 'Packing Lists — In the Wake',
        'summary': 'Cruise packing checklists for different itineraries, climates, and traveler types — from essentials to nice-to-haves for smoother embarkation.'
    },
    'accessibility.html': {
        'title': 'Accessibility — In the Wake',
        'summary': 'Accessibility resources for cruise travelers with disabilities — ship accessibility, booking accommodations, mobility aids, and inclusive travel planning.'
    },
    'disability-at-sea.html': {
        'title': 'Disability at Sea — In the Wake',
        'summary': 'In-depth guide to cruising with disabilities — accessible staterooms, mobility equipment, shore excursions, and advocacy for inclusive cruise experiences.'
    },
    'drink-calculator.html': {
        'title': 'Drink Package Calculator — In the Wake',
        'summary': 'Interactive calculator to determine if cruise drink packages are worth it based on your drinking habits, cruise length, and beverage preferences.'
    },
    'stateroom-check.html': {
        'title': 'Stateroom Check — In the Wake',
        'summary': 'Stateroom selection tool to help you evaluate cabin locations, avoid problem areas, and choose the right accommodation for your cruise style.'
    },
}

def add_no_js_class(content):
    """Add class='no-js' to <html> tag."""
    content = re.sub(
        r'<html\s+lang="en">',
        '<html lang="en" class="no-js">',
        content
    )
    return content

def add_no_js_toggle(content):
    """Add no-JS toggle script after charset."""
    # Find the first <meta charset> and add script after it
    pattern = r'(<meta charset="utf-8"/>)'
    replacement = r'\1\n  <script>\n    document.documentElement.classList.remove(\'no-js\');\n  </script>\n'
    content = re.sub(pattern, replacement, content, count=1)
    return content

def add_icp_meta_tags(content, summary):
    """Add ICP-Lite meta tags."""
    # Find <!-- Core --> section and add ICP tags before it
    pattern = r'(  <!-- Core -->)\n(  <meta charset="utf-8"/>)?\n  <meta name="viewport"'
    replacement = f'''  <!-- ICP-Lite v1.0 Meta Tags -->
  <meta name="ai-summary" content="{summary}" />
  <meta name="last-reviewed" content="2025-11-18" />
  <meta name="content-protocol" content="ICP-Lite v1.0" />

  \\1
  <meta name="viewport"'''

    # Alternative pattern if charset is elsewhere
    if not re.search(pattern, content):
        pattern = r'(  <!-- Core -->)\n  <meta name="viewport"'
        replacement = f'''  <!-- ICP-Lite v1.0 Meta Tags -->
  <meta name="ai-summary" content="{summary}" />
  <meta name="last-reviewed" content="2025-11-18" />
  <meta name="content-protocol" content="ICP-Lite v1.0" />

  \\1
  <meta name="viewport"'''

    content = re.sub(pattern, replacement, content)
    return content

def process_hub_page(filepath, config):
    """Process a single hub page."""
    print(f"Processing {filepath.name}...")

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # Check if already has ICP-Lite
    if 'content-protocol' in content:
        print(f"  ✓ {filepath.name} already has ICP-Lite")
        return False

    # Apply transformations
    content = add_no_js_class(content)
    content = add_no_js_toggle(content)
    content = add_icp_meta_tags(content, config['summary'])

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  ✓ Applied ICP-Lite to {filepath.name}")
        return True
    else:
        print(f"  ⚠️  No changes made to {filepath.name}")
        return False

def main():
    """Main execution."""
    print("Applying ICP-Lite v1.0 to hub pages...\n")

    updated_count = 0

    for filename, config in HUB_PAGES.items():
        filepath = ROOT_DIR / filename
        if filepath.exists():
            if process_hub_page(filepath, config):
                updated_count += 1
        else:
            print(f"⚠️  {filename} not found")

    print(f"\n✓ Applied ICP-Lite to {updated_count} hub pages")

if __name__ == '__main__':
    main()
