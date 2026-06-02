#!/usr/bin/env python3
"""
Fix #1316: Replace hardcoded © 2025 with dynamic year script.
Scope: all HTML files containing the literal string "© 2025".
Method: str.replace only — no HTML parsing, no reformatting.
"""

import subprocess
import sys

OLD = "© 2025"
NEW = "© <script>document.write(new Date().getFullYear())</script>"

# Get all affected files via grep
result = subprocess.run(
    ["grep", "-rl", OLD, "--include=*.html", "."],
    capture_output=True, text=True, cwd="/Volumes/1TB External/Projects/InTheWake"
)

files = [f.strip() for f in result.stdout.strip().split("\n") if f.strip()]
print(f"Found {len(files)} files with '{OLD}'")

changed = []
for filepath in files:
    abs_path = f"/Volumes/1TB External/Projects/InTheWake/{filepath.lstrip('./')}"
    with open(abs_path, "r", encoding="utf-8") as f:
        original = f.read()

    if OLD not in original:
        print(f"  SKIP (no match): {filepath}")
        continue

    updated = original.replace(OLD, NEW)
    count = original.count(OLD)

    with open(abs_path, "w", encoding="utf-8") as f:
        f.write(updated)

    changed.append((filepath, count))
    print(f"  FIXED ({count}x): {filepath}")

print(f"\nDone. {len(changed)} files updated.")
