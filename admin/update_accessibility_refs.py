#!/usr/bin/env python3
"""
Update all logbook references from /accessibility.html to /solo/articles/accessible-cruising.html

/accessibility.html = WEBSITE accessibility (WCAG compliance)
/solo/articles/accessible-cruising.html = CRUISE accessibility guide for disabled travelers

All logbook references should point to the article, not the website policy page.
"""
import json
import glob

logbook_files = glob.glob('assets/data/logbook/rcl/*.json')

print(f"Updating {len(logbook_files)} logbook files...\n")

updated_files = 0
total_replacements = 0

for filepath in logbook_files:
    ship_name = filepath.split('/')[-1].replace('.json', '')

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except:
        print(f"ERROR: Could not read {filepath}")
        continue

    original = content

    # Simple replacement: /accessibility.html → /solo/articles/accessible-cruising.html
    # All logbook references should point to the accessible cruising guide article
    content = content.replace('/accessibility.html', '/solo/articles/accessible-cruising.html')

    # Count replacements
    replacements_in_file = original.count('/accessibility.html')

    if content != original:
        try:
            # Parse JSON to make sure it's still valid
            json.loads(content)

            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✓ {ship_name}: {replacements_in_file} references updated")
            updated_files += 1
            total_replacements += replacements_in_file
        except Exception as e:
            print(f"ERROR: Failed to write {filepath}: {e}")
            continue

print(f"\nSUMMARY:")
print(f"  Files updated: {updated_files}")
print(f"  Total references updated: {total_replacements}")

