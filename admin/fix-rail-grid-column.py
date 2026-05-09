#!/usr/bin/env python3
"""Fix the inline `grid-column: 2` antipattern on `<aside class="rail">`.

Canonical form (used by 16 already-correct pages):
    <aside class="rail col-2" ...>

Antipattern (used by 350+ pages):
    <aside class="rail" ... style="grid-column: 2; ...">

This script rewrites antipattern → canonical form. It:
  - Adds `col-2` to the class list (idempotent: skipped if already present)
  - Removes ONLY the grid-column / grid-row / align-self declarations
    from the style attribute; preserves any other declarations (e.g.,
    margin) and removes the style attribute entirely if it ends up empty
  - Touches only `<aside>` elements that have `class="rail"` and an
    inline `grid-column: 2` declaration
  - Reports per-file changes; never edits files with no match

Usage:
    python3 admin/fix-rail-grid-column.py <file...>
    python3 admin/fix-rail-grid-column.py --all      # process every match
    python3 admin/fix-rail-grid-column.py --dry-run <file...>
"""

import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent

# <aside class="rail" ... style="grid-column: 2 ...">  (rail antipattern)
ASIDE_RE = re.compile(
    r'<aside\b[^>]*class="rail"[^>]*style="[^"]*grid-column:\s*2[^"]*"[^>]*>',
    re.IGNORECASE,
)
# <div style="grid-column: 1; grid-row: 1;">  (col-1 wrapper antipattern,
# class-less div used only for grid placement)
DIV_COL1_RE = re.compile(
    r'<div\s+style="grid-column:\s*1;\s*grid-row:\s*1;\s*"\s*>',
    re.IGNORECASE,
)
CLASS_ATTR_RE = re.compile(r'(class=")([^"]*)(")', re.IGNORECASE)
STYLE_ATTR_RE = re.compile(r'\s*style="([^"]*)"', re.IGNORECASE)
# Strip every grid-* / align-self declaration. With both col-1 and col-2
# using their CSS classes, auto-flow handles row placement correctly:
#   - Pages without a column-spanning sibling: col-1 → row 1 col 1, col-2 →
#     row 1 col 2 at desktop; both stack at mobile.
#   - Pages with a breadcrumb at `grid-column: 1 / -1`: that breadcrumb takes
#     row 1, then col-1 / col-2 auto-flow to row 2 (cleaner than the previous
#     pattern of forcing them to overlap row 1 with the breadcrumb).
GRID_DECLS_RE = re.compile(
    r'\s*(?:grid-column|grid-row|align-self)\s*:\s*[^;"]*\s*;?',
    re.IGNORECASE,
)


def transform_aside_tag(tag: str) -> str:
    """Return the canonical-form opening tag."""
    # 1. Add col-2 to the class list if not already there
    def add_col2(m):
        prefix, classes, suffix = m.group(1), m.group(2), m.group(3)
        tokens = classes.split()
        if "col-2" not in tokens:
            tokens.append("col-2")
        return f"{prefix}{' '.join(tokens)}{suffix}"

    tag = CLASS_ATTR_RE.sub(add_col2, tag, count=1)

    # 2. Strip grid-* / align-self declarations from the style attribute,
    #    preserving any other properties; drop attr if empty.
    def clean_style(m):
        decls = GRID_DECLS_RE.sub("", m.group(1))
        decls = decls.strip().strip(";").strip()
        return f' style="{decls}"' if decls else ""

    tag = STYLE_ATTR_RE.sub(clean_style, tag, count=1)
    return tag


def process(path: Path, dry_run: bool) -> int:
    text = path.read_text(encoding="utf-8")
    aside_matches = list(ASIDE_RE.finditer(text))
    div_matches = list(DIV_COL1_RE.finditer(text))
    if not aside_matches and not div_matches:
        return 0
    new_text = text
    # Apply edits from the end so offsets stay valid
    edits = (
        [(m, transform_aside_tag(m.group(0))) for m in aside_matches]
        + [(m, '<div class="col-1">') for m in div_matches]
    )
    for m, replacement in sorted(edits, key=lambda x: x[0].start(), reverse=True):
        new_text = new_text[: m.start()] + replacement + new_text[m.end():]
    if new_text == text:
        return 0
    n_aside = len(aside_matches)
    n_div = len(div_matches)
    if dry_run:
        print(f"  [dry-run] would change {n_aside} aside / {n_div} col-1-div in {path.relative_to(REPO)}")
        return n_aside + n_div
    path.write_text(new_text, encoding="utf-8")
    print(f"  fixed {n_aside} aside / {n_div} col-1-div in {path.relative_to(REPO)}")
    return n_aside + n_div


def main():
    args = sys.argv[1:]
    dry_run = "--dry-run" in args
    args = [a for a in args if a != "--dry-run"]

    if "--all" in args:
        # Find every HTML file with either antipattern
        files = []
        for p in REPO.rglob("*.html"):
            if ".git" in p.parts:
                continue
            try:
                contents = p.read_text(encoding="utf-8")
                if (
                    "grid-column: 2" in contents
                    or '<div style="grid-column: 1; grid-row: 1;">' in contents
                ):
                    files.append(p)
            except Exception:
                continue
    else:
        files = [Path(a) if Path(a).is_absolute() else REPO / a for a in args]
        if not files:
            print(__doc__)
            sys.exit(1)

    total = 0
    changed_files = 0
    for f in files:
        if not f.exists():
            print(f"  missing: {f}")
            continue
        n = process(f, dry_run)
        if n:
            total += n
            changed_files += 1

    print(
        f"\n{'(dry-run) ' if dry_run else ''}"
        f"changed {changed_files} file(s), {total} aside(s) total"
    )


if __name__ == "__main__":
    main()
