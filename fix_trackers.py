#!/usr/bin/env python3
"""
Fix ship trackers site-wide to match Radiance of the Seas pattern.
Replaces old vf-map pattern with new vf-tracker-container pattern.
"""

import os
import re
from pathlib import Path

SHIPS_DIR = Path('/home/user/InTheWake/ships/rcl')

# New JavaScript to replace old initLiveTracker
NEW_TRACKER_JS = """  <!-- ===== Live tracker (VesselFinder iframe: auto-centers on ship by IMO) ===== -->
  <script>
  (function initLiveTracker(){
    const card=document.querySelector('.card.itinerary[data-imo]');
    if(!card) return;
    const imo=card.getAttribute('data-imo');
    const container=document.getElementById('vf-tracker-container');
    if(!imo||!container) return;

    // Create wrapper div
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'width:100%;height:300px;position:relative;background:#f0f4f8;border-radius:8px;overflow:hidden;';

    // VesselFinder iframe embed - tracks by IMO
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'width:100%;height:100%;border:0;';
    iframe.title = 'Live ship tracker for ' + card.getAttribute('data-name');
    iframe.setAttribute('loading', 'lazy');
    iframe.src = 'https://www.vesselfinder.com/aismap?width=100%25&height=300&names=true&imo=' + imo + '&track=true&fleet=&fleet_hide_old_positions=false&clicktoact=false&store_pos=false';

    wrapper.appendChild(iframe);
    container.appendChild(wrapper);
  })();
  </script>"""

def fix_tracker_html(content):
    """Fix the HTML tracker section."""
    # Pattern 1: Replace vf-map div and remove the iframe line
    # Look for the vf-map div and the following iframe line
    pattern = r'<div id="vf-map-[^"]*" class="vf-map"[^>]*></div>\s*<iframe class="live-map hidden"[^>]*></iframe>'
    replacement = '<div id="vf-tracker-container" style="width:100%;height:300px;position:relative;"></div>'

    content = re.sub(pattern, replacement, content)

    return content

def fix_tracker_js(content):
    """Fix the JavaScript initLiveTracker function."""
    # Find and replace old initLiveTracker pattern
    old_pattern = r'<!-- ===== Live tracker ===== -->\s*<script>\s*\(function initLiveTracker\(\)\{[^}]*const card=document\.querySelector[^}]*\}\)\(\);\s*</script>'

    content = re.sub(old_pattern, NEW_TRACKER_JS, content, flags=re.DOTALL)

    return content

def process_ship_file(filepath):
    """Process a single ship file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # Check if file has old pattern
    if 'vf-map' in content and 'vf-tracker-container' not in content:
        print(f"Fixing {filepath.name}...")
        content = fix_tracker_html(content)
        content = fix_tracker_js(content)

        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        else:
            print(f"  ⚠️  Pattern found but no changes made")
            return False
    elif 'vf-tracker-container' in content:
        print(f"✓ {filepath.name} already has correct pattern")
        return False
    else:
        print(f"⚠️  {filepath.name} has no tracker")
        return False

def main():
    """Main execution."""
    print("Fixing ship trackers to match Radiance pattern...\n")

    fixed_count = 0
    ship_files = sorted(SHIPS_DIR.glob('*.html'))

    for filepath in ship_files:
        if process_ship_file(filepath):
            fixed_count += 1

    print(f"\n✓ Fixed {fixed_count} ship files")

if __name__ == '__main__':
    main()
