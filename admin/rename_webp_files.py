#!/usr/bin/env python3
"""
Rename WebP files to match code expectations:
From: "Ovation-of-the-seas-FOM- - 1.webp"
To:   "ovation-of-the-seas-FOM-1.webp"
"""
import os
import glob
import re

webp_files = glob.glob('assets/ships/*-FOM-*.webp')

print(f"Found {len(webp_files)} WebP files to rename\n")

renamed = 0
skipped = 0

for filepath in webp_files:
    dirname = os.path.dirname(filepath)
    filename = os.path.basename(filepath)

    # Expected pattern: "{Ship}-of-the-seas-FOM- - {num}.webp"
    # Target pattern:   "{ship}-of-the-seas-FOM-{num}.webp"

    # Remove the " - " spaces before the number
    new_filename = re.sub(r'-FOM-\s*-\s*(\d+)', r'-FOM-\1', filename)

    # Lowercase everything except the extension
    new_filename = new_filename.lower()

    new_filepath = os.path.join(dirname, new_filename)

    if filepath == new_filepath:
        print(f"SKIP: {filename} (already correct)")
        skipped += 1
        continue

    if os.path.exists(new_filepath):
        print(f"WARN: {new_filename} already exists, skipping {filename}")
        skipped += 1
        continue

    try:
        os.rename(filepath, new_filepath)
        print(f"✓ {filename}")
        print(f"  → {new_filename}")
        renamed += 1
    except Exception as e:
        print(f"ERROR renaming {filename}: {e}")
        skipped += 1

print(f"\nSUMMARY: {renamed} renamed, {skipped} skipped")
