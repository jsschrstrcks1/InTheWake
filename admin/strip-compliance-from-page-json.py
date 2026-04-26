#!/usr/bin/env python3
"""Strip the orphaned `compliance` field from page.json files.

The field exists in 64 of 89 page.json files. No site code reads it.
No validator reads it. It was added in two waves of validator gaming:
- First wave: an invented `permanent_exemptions` array
- Second wave (commit c80df8d6): replaced with a "gold standard pattern"
  of {alt_text_required, loading_lazy, wcag} which is also unread.

Removing it does not affect any visible behaviour. It removes the
temptation to add similar fields in future.

This script edits the JSON textually rather than parsing+rewriting, so
diffs only show the deleted lines — no incidental reformatting.

Run:
    python3 admin/strip-compliance-from-page-json.py
"""
from __future__ import annotations
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TARGETS = list((ROOT / "assets" / "data" / "ships").rglob("*.page.json"))

# Match the full `"compliance": { ... }` object as the LAST field of the
# top-level object — including its leading comma (or trailing comma if it
# wasn't last). The field appears at top level only and never spans nested
# braces in the files we have, so a balanced-brace match isn't required;
# the inner object's keys are simple scalars.
PATTERN = re.compile(
    r",\s*\n\s*\"compliance\"\s*:\s*\{[^{}]*\}"  # comma + compliance:{...}
    r"|"
    r"\"compliance\"\s*:\s*\{[^{}]*\}\s*,\s*\n"  # compliance:{...} + trailing comma
)

removed = 0
for path in sorted(TARGETS):
    raw = path.read_text()
    if '"compliance"' not in raw:
        continue

    new = PATTERN.sub("", raw, count=1)
    if new == raw:
        print(f"WARN: '\"compliance\"' present in {path.relative_to(ROOT)} but pattern did not match — skipping", file=sys.stderr)
        continue

    # Sanity-check: the result must still be valid JSON.
    try:
        json.loads(new)
    except json.JSONDecodeError as e:
        print(f"ERROR: {path.relative_to(ROOT)} would become invalid JSON: {e}", file=sys.stderr)
        continue

    path.write_text(new)
    removed += 1
    print(f"stripped: {path.relative_to(ROOT)}")

print(f"\nDone. Removed compliance field from {removed} of {len(TARGETS)} page.json files.")
sys.exit(0)
