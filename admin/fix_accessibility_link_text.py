#!/usr/bin/env python3
"""
Fix accessibility link text to be generic with helpful context added
"""
import json
import glob
import re

logbook_files = glob.glob('assets/data/logbook/rcl/*.json')

print(f"Fixing link text in {len(logbook_files)} logbook files...\n")

updated_files = 0
total_fixes = 0

# Map specific link text to contextual explanation
link_contexts = {
    'autistic adult travel guide': 'for neurodiversity-specific planning tips',
    'Deaf travel guide': 'for deaf and hard-of-hearing travelers',
    'deaf travel guide': 'for deaf and hard-of-hearing travelers',
    'deaf-friendly travel guide': 'for deaf and hard-of-hearing travelers',
    'amputee travel guide': 'for adaptive mobility strategies',
    'wheelchair dance guide': 'for wheelchair users seeking adaptive activities',
    'wheelchair mega-ship guide': 'for wheelchair accessibility on large ships',
    'wheelchair travel guide': 'for wheelchair users and mobility disabilities',
    'wheelchair user\'s cruise guide': 'for wheelchair users and mobility disabilities',
    'chronic pain travel guide': 'for travelers managing chronic pain conditions',
    'neurodiversity travel guide': 'for autistic adults and neurodivergent travelers',
    'service dog travel guide': 'including service animal accommodations',
    'special needs cruise planning guide': 'for special needs and sensory considerations',
    'adaptive arts guide': 'for travelers with visual or creative adaptations',
    'medical condition travel guide': 'for managing medical conditions at sea',
    'refugee family resources': 'for trauma-informed travel planning',
}

for filepath in logbook_files:
    ship_name = filepath.split('/')[-1].replace('.json', '')

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except:
        print(f"ERROR: Could not read {filepath}")
        continue

    original_data = json.dumps(data)
    changes_made = False

    for story in data.get('stories', []):
        markdown = story.get('markdown', '')
        original_markdown = markdown

        # Find and replace each specific link text
        for specific_text, context in link_contexts.items():
            # Pattern: [our SPECIFIC_TEXT](/solo/articles/accessible-cruising.html)
            pattern = rf'\[our {re.escape(specific_text)}\]\(/solo/articles/accessible-cruising\.html\)'
            replacement = f'[our accessible cruising guide](/solo/articles/accessible-cruising.html) {context}'

            markdown = re.sub(pattern, replacement, markdown, flags=re.IGNORECASE)

        # Also handle links without "our" prefix
        for specific_text, context in link_contexts.items():
            pattern = rf'\[{re.escape(specific_text)}\]\(/solo/articles/accessible-cruising\.html\)'
            replacement = f'[accessible cruising guide](/solo/articles/accessible-cruising.html) {context}'

            markdown = re.sub(pattern, replacement, markdown, flags=re.IGNORECASE)

        # Update if changed
        if markdown != original_markdown:
            story['markdown'] = markdown
            changes_made = True

    if changes_made:
        try:
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)

            # Count changes
            new_data = json.dumps(data)
            num_changes = len(re.findall(r'accessible cruising guide.*? for ', new_data))

            print(f"✓ {ship_name}: {num_changes} link texts updated with context")
            updated_files += 1
            total_fixes += num_changes
        except Exception as e:
            print(f"ERROR: Failed to write {filepath}: {e}")

print(f"\nSUMMARY:")
print(f"  Files updated: {updated_files}")
print(f"  Total link texts fixed: {total_fixes}")
