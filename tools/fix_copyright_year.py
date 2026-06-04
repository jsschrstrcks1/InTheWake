#!/usr/bin/env python3
"""
Fix #1316: Replace hardcoded © 2025 with dynamic year script.
Scope: all HTML files containing the literal string "© 2025".
Method: str.replace only — no HTML parsing, no reformatting.
"""

import subprocess
from pathlib import Path

OLD = "© 2025"
NEW = "© <script>document.write(new Date().getFullYear())</script>"

# Repo root = parent of this script's tools/ directory.
# Portable: no hardcoded absolute path, runs from any checkout location.
REPO_ROOT = Path(__file__).resolve().parent.parent

# Get all affected files via grep, relative to the repo root
result = subprocess.run(
    ["grep", "-rl", OLD, "--include=*.html", "."],
    capture_output=True, text=True, cwd=REPO_ROOT
)

files = [f.strip() for f in result.stdout.strip().split("\n") if f.strip()]
print(f"Found {len(files)} files with '{OLD}'")

changed = []
for filepath in files:
    abs_path = REPO_ROOT / filepath
    original = abs_path.read_text(encoding="utf-8")

    if OLD not in original:
        print(f"  SKIP (no match): {filepath}")
        continue

    count = original.count(OLD)
    abs_path.write_text(original.replace(OLD, NEW), encoding="utf-8")

    changed.append((filepath, count))
    print(f"  FIXED ({count}x): {filepath}")

print(f"\nDone. {len(changed)} files updated.")
