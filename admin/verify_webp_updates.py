#!/usr/bin/env python3
"""
Verify WebP updates - check that WebP refs have corresponding files
"""
import os
import glob
import re

print("=" * 80)
print("WEBP UPDATE VERIFICATION")
print("=" * 80)
print()

# Get all WebP files
webp_files = set()
for filepath in glob.glob('assets/ships/*.webp'):
    webp_files.add(os.path.basename(filepath))

print(f"✓ Found {len(webp_files)} WebP files in assets/ships/\n")

# Check all HTML files for WebP references
webp_refs = {}
missing = set()

for filepath in glob.glob('ships/**/*.html', recursive=True):
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
    except:
        continue

    # Find all WebP references
    for match in re.finditer(r'assets/ships/([a-z0-9-]+(?:\s+-\s+\d+)?\.webp)', content, re.IGNORECASE):
        ref = match.group(1).lower()
        webp_refs[ref] = webp_refs.get(ref, 0) + 1

        # Check if file exists (case insensitive)
        found = False
        for webp in webp_files:
            if webp.lower() == ref:
                found = True
                break
        if not found:
            missing.add(ref)

print(f"✓ Found {len(webp_refs)} unique WebP references in HTML files")
print(f"  Total references: {sum(webp_refs.values())}")
print()

if missing:
    print(f"❌ WARNING: {len(missing)} referenced WebP files are MISSING:")
    for m in sorted(missing)[:20]:
        print(f"  - {m}")
    if len(missing) > 20:
        print(f"  ... and {len(missing) - 20} more")
else:
    print(f"✅ All {len(webp_refs)} referenced WebP files exist!")

print()

# Check for any remaining FOM JPEG references
jpeg_fom_refs = []
for filepath in glob.glob('ships/**/*.html', recursive=True):
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        if re.search(r'-fom-[\s-]*\d+\.jpe?g', content, re.IGNORECASE):
            jpeg_fom_refs.append(filepath)
    except:
        pass

if jpeg_fom_refs:
    print(f"⚠️  {len(jpeg_fom_refs)} files still have FOM JPEG references:")
    for f in jpeg_fom_refs[:10]:
        print(f"  - {f}")
else:
    print(f"✅ All FOM gallery images updated to WebP!")

print()
print("=" * 80)
print("SUMMARY")
print("=" * 80)
print(f"WebP files: {len(webp_files)}")
print(f"WebP references: {len(webp_refs)} unique ({sum(webp_refs.values())} total)")
print(f"Missing files: {len(missing)}")
print(f"FOM JPEG refs remaining: {len(jpeg_fom_refs)}")
if not missing and not jpeg_fom_refs:
    print("\n✅ VERIFICATION PASSED - All WebP references are valid!")
else:
    print("\n⚠️  VERIFICATION INCOMPLETE - Issues found above")
