#!/usr/bin/env python3
"""Phase J-1 — venue stylesheet ref hygiene.

The Phase J-1 census found 5 stylesheet ref variants across 472 venue pages:

  458  https://cruisinginthewake.com/assets/styles.css?v=2.257   (stale + absolute)
   12  /assets/styles.css?v=3.010.300                            (canonical)
    1  https://cruisinginthewake.com/assets/styles.css?v=3.002   (absolute)
    1  https://cruisinginthewake.com/assets/styles.css?v=2.235   (absolute, oldest)
    1  /assets/styles.css                                        (no version)

This script rewrites every stylesheet ref of the form
    href="<absolute or relative URL to assets/styles.css>?<v=...optional>"
to the canonical form
    href="/assets/styles.css?v=3.010.400"
matching CLAUDE.md §90 ("CSS query: ?v=3.010.400 on new pages").

Idempotent: a page already in the canonical form is skipped silently.

Usage:
    python3 admin/fix-stylesheet-ref.py <file...>
    python3 admin/fix-stylesheet-ref.py --all       # process every venue
    python3 admin/fix-stylesheet-ref.py --dry-run <file...>

Scope: by default `--all` processes only restaurants/*.html. Pass file
paths explicitly to process anything else.
"""

import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
CANONICAL = '/assets/styles.css?v=3.010.400'

# Scope (carefully narrowed): match only the actually-broken stylesheet refs.
#  - Absolute production URL with any version  (460 venues per J-1 census)
#  - Relative path with NO version             (1 venue per J-1 census)
#  - Relative path with v=2.x                  (currently 0 venues, listed for
#    completeness so a future regression at v=2.x is also caught)
#
# Pages already at /assets/styles.css?v=3.010.x are intentionally left
# untouched even though .300 is one minor behind .400. That's a separate
# "version-pin sync" concern; rolling it in here would silently fix unrelated
# state per careful-not-clever Layer 1 step 10.
STYLESHEET_RE = re.compile(
    r'href="('
    r'https://cruisinginthewake\.com/assets/styles\.css(?:\?v=[0-9.]+)?'
    r'|/assets/styles\.css'
    r'|/assets/styles\.css\?v=2\.[0-9.]+'
    r')"',
    re.IGNORECASE,
)


def process(path: Path, dry_run: bool) -> int:
    text = path.read_text(encoding='utf-8')
    new_text, n = STYLESHEET_RE.subn(f'href="{CANONICAL}"', text)
    if n == 0 or new_text == text:
        return 0
    if dry_run:
        print(f'  [dry-run] would rewrite {n} stylesheet ref(s) in {path.relative_to(REPO)}')
        return n
    path.write_text(new_text, encoding='utf-8')
    print(f'  rewrote {n} stylesheet ref(s) in {path.relative_to(REPO)}')
    return n


def main():
    args = sys.argv[1:]
    dry_run = '--dry-run' in args
    args = [a for a in args if a != '--dry-run']

    if '--all' in args:
        # Recurse — venue brand subdirs (carnival/, msc/, ncl/, virgin/) hold
        # ~192 of the 472 venues per the J-1 census.
        files = sorted((REPO / 'restaurants').rglob('*.html'))
    else:
        files = [Path(a) if Path(a).is_absolute() else REPO / a for a in args]
        if not files:
            print(__doc__)
            sys.exit(1)

    total = 0
    changed_files = 0
    for f in files:
        if not f.exists():
            print(f'  missing: {f}')
            continue
        n = process(f, dry_run)
        if n:
            total += n
            changed_files += 1

    print(
        f"\n{'(dry-run) ' if dry_run else ''}"
        f'changed {changed_files} file(s), {total} ref(s) total'
    )


if __name__ == '__main__':
    main()
