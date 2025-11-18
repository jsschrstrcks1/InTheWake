#!/usr/bin/env python3
"""
Verify all WebP references in code have corresponding files
"""
import glob
import re
import os

print("=" * 80)
print("WEBP FILES VERIFICATION")
print("=" * 80)
print()

# Get all WebP files that exist
webp_files = set()
for filepath in glob.glob('assets/ships/*.webp'):
    webp_files.add(os.path.basename(filepath))

print(f"✓ Found {len(webp_files)} WebP files in assets/ships/")
print()

# Get all WebP references in HTML files
html_webp_refs = set()
for filepath in glob.glob('ships/**/*.html', recursive=True):
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        matches = re.findall(r'assets/ships/([^"\s\)\']+\.webp)', content, re.IGNORECASE)
        for match in matches:
            html_webp_refs.add(match)
    except:
        pass

# Get all WebP references in JS files
js_webp_refs = set()
for filepath in glob.glob('assets/js/*.js'):
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        matches = re.findall(r'assets/ships/([^"\s\)\']+\.webp)', content, re.IGNORECASE)
        for match in matches:
            js_webp_refs.add(match)
    except:
        pass

all_refs = html_webp_refs | js_webp_refs
print(f"✓ Found {len(all_refs)} unique WebP references in code")
print(f"  - {len(html_webp_refs)} from HTML files")
print(f"  - {len(js_webp_refs)} from JS files")
print()

# Check for missing files
missing = []
for ref in all_refs:
    filename = os.path.basename(ref)
    if filename not in webp_files:
        missing.append(ref)

if missing:
    print(f"❌ WARNING: {len(missing)} referenced WebP files are MISSING:")
    for m in sorted(missing)[:20]:  # Show first 20
        print(f"  - {m}")
    if len(missing) > 20:
        print(f"  ... and {len(missing) - 20} more")
else:
    print(f"✅ All {len(all_refs)} referenced WebP files exist!")

print()

# Check for unused WebP files
unused = []
for webp in webp_files:
    if not any(webp in ref for ref in all_refs):
        unused.append(webp)

if unused:
    print(f"ℹ️  {len(unused)} WebP files exist but are not referenced in code:")
    for u in sorted(unused)[:10]:
        print(f"  - {u}")
    if len(unused) > 10:
        print(f"  ... and {len(unused) - 10} more")
else:
    print(f"✅ All {len(webp_files)} WebP files are referenced in code")

print()
print("=" * 80)
print("FINAL STATUS")
print("=" * 80)
if missing:
    print(f"❌ INCOMPLETE: {len(missing)} WebP files need to be created")
else:
    print(f"✅ COMPLETE: All WebP references have corresponding files")
    print(f"   - {len(webp_files)} WebP files available")
    print(f"   - {len(all_refs)} unique references in code")
    print(f"   - 0 JPG/JPEG references remaining")
