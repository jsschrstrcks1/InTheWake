#!/usr/bin/env python3
"""
footer-rollout.py — Sitewide footer migration for v2.5 W5 + W6.1.

Two changes per footer:
  1. W5 (locked): trust-badge unification.
       Old (3 known variants):
         - "✓ No ads. Minimal analytics. Independent of cruise lines."
         - "✓ Independent, minimal analytics, affiliate links disclosed."
         - "✓ Independent of cruise lines."  (already partial)
       New: "✓ No ads. Independent of cruise lines."

  2. W6.1: insert a Support link in the footer nav.
       Standard nav variant (most pages):
         <a href="/about-us.html">About</a> ·
         <a href="/accessibility.html">...</a>
       New:
         <a href="/about-us.html">About</a> ·
         <a href="/support.html">Support</a> ·
         <a href="/accessibility.html">...</a>

       <ul>/<li> nav variant (some articles):
         <li><a href="/terms.html">Terms</a></li>
         <li><a href="/affiliate-disclosure.html">Affiliate Disclosure</a></li>
       New:
         <li><a href="/terms.html">Terms</a></li>
         <li><a href="/support.html">Support</a></li>
         <li><a href="/affiliate-disclosure.html">Affiliate Disclosure</a></li>

PASTORAL EXCLUSION RULE (locked): Files under /solo/ or with names matching
grief/widow/loss/after-loss patterns are explicitly excluded from the Support
link insertion. Their trust-badge text DOES still get unified to the W5
locked string for site-wide consistency, but the Support link is never added
to a pastoral footer.

USAGE:
  Dry run (default — shows what would change, no writes):
    python3 admin/scripts/footer-rollout.py

  Apply changes:
    python3 admin/scripts/footer-rollout.py --apply

  Limit scope to a glob (handy for staged rollouts):
    python3 admin/scripts/footer-rollout.py --apply --glob "ports/*.html"

The script is idempotent: running twice produces the same result. It only
modifies files that contain a recognized footer pattern; files with custom
footers are skipped and reported.

Soli Deo Gloria.
"""

import argparse
import glob as _glob
import os
import re
import sys

# --- patterns ---

# Port pages have an additional accurate "Works offline" claim (PWA caches them).
# We preserve it: drop only the "Minimal analytics" portion if present.
OLD_BADGE_PATTERNS = [
    '<p class="trust-badge">✓ No ads. Minimal analytics. Independent of cruise lines. <a href="/affiliate-disclosure.html">Affiliate Disclosure</a></p>',
    '<p class="trust-badge">✓ Independent, minimal analytics, affiliate links disclosed. <a href="/affiliate-disclosure.html">Affiliate Disclosure</a></p>',
    '<p class="trust-badge">&check; No ads. Minimal analytics. Independent of cruise lines. <a href="/affiliate-disclosure.html">Affiliate Disclosure</a></p>',
    # Numeric entity variant for ✓ used on a few tools/ship pages
    '<p class="trust-badge">&#10003; No ads. Minimal analytics. Independent of cruise lines. <a href="/affiliate-disclosure.html">Affiliate Disclosure</a></p>',
    # Port pages missing checkmark prefix — add ✓ for visual consistency with rest of site
    '<p class="trust-badge">No ads. Works offline. Independent of cruise lines. <a href="/affiliate-disclosure.html">Affiliate Disclosure</a></p>',
]
NEW_BADGE_CHECKMARK_UNICODE = '<p class="trust-badge">✓ No ads. Independent of cruise lines. <a href="/affiliate-disclosure.html">Affiliate Disclosure</a></p>'
NEW_BADGE_CHECKMARK_ENTITY  = '<p class="trust-badge">&check; No ads. Independent of cruise lines. <a href="/affiliate-disclosure.html">Affiliate Disclosure</a></p>'

# Port-page variant: keeps "Works offline" (accurate PWA claim). Already W5-compliant.
PORT_BADGE_VARIANT = '<p class="trust-badge">✓ No ads. Works offline. Independent of cruise lines. <a href="/affiliate-disclosure.html">Affiliate Disclosure</a></p>'

# Standard <p> nav variant
STANDARD_NAV_OLD_DOT = '''      <a href="/privacy.html">Privacy</a> ·
      <a href="/terms.html">Terms</a> ·
      <a href="/about-us.html">About</a> ·
      <a href="/accessibility.html">Accessibility &amp; WCAG 2.1 AA Commitment</a>'''
STANDARD_NAV_NEW_DOT = '''      <a href="/privacy.html">Privacy</a> ·
      <a href="/terms.html">Terms</a> ·
      <a href="/about-us.html">About</a> ·
      <a href="/support.html">Support</a> ·
      <a href="/accessibility.html">Accessibility &amp; WCAG 2.1 AA Commitment</a>'''

# Port-page variant: shorter "Accessibility" label
PORT_NAV_OLD_DOT = '''      <a href="/privacy.html">Privacy</a> ·
      <a href="/terms.html">Terms</a> ·
      <a href="/about-us.html">About</a> ·
      <a href="/accessibility.html">Accessibility</a>'''
PORT_NAV_NEW_DOT = '''      <a href="/privacy.html">Privacy</a> ·
      <a href="/terms.html">Terms</a> ·
      <a href="/about-us.html">About</a> ·
      <a href="/support.html">Support</a> ·
      <a href="/accessibility.html">Accessibility</a>'''

STANDARD_NAV_OLD_MIDDOT = '''      <a href="/privacy.html">Privacy</a> &middot;
      <a href="/terms.html">Terms</a> &middot;
      <a href="/about-us.html">About</a> &middot;
      <a href="/accessibility.html">Accessibility &amp; WCAG 2.1 AA Commitment</a>'''
STANDARD_NAV_NEW_MIDDOT = '''      <a href="/privacy.html">Privacy</a> &middot;
      <a href="/terms.html">Terms</a> &middot;
      <a href="/about-us.html">About</a> &middot;
      <a href="/support.html">Support</a> &middot;
      <a href="/accessibility.html">Accessibility &amp; WCAG 2.1 AA Commitment</a>'''

# <ul>/<li> nav variant (cabin-organization, photography articles)
UL_NAV_OLD = '''        <li><a href="/about-us.html">About</a></li>
        <li><a href="/privacy.html">Privacy</a></li>
        <li><a href="/terms.html">Terms</a></li>
        <li><a href="/affiliate-disclosure.html">Affiliate Disclosure</a></li>'''
UL_NAV_NEW = '''        <li><a href="/about-us.html">About</a></li>
        <li><a href="/privacy.html">Privacy</a></li>
        <li><a href="/terms.html">Terms</a></li>
        <li><a href="/support.html">Support</a></li>
        <li><a href="/affiliate-disclosure.html">Affiliate Disclosure</a></li>'''

# Pastoral exclusion (Support link skipped; trust badge still updated)
PASTORAL_PATH_RE = re.compile(
    r'(?:^|/)(?:solo/|.*\bgrief\b|.*\bwidow\b|.*\bafter-loss\b|.*\bin-the-wake-of-grief\b)',
    re.IGNORECASE,
)

# Already-up-to-date sentinel — used to skip files that already have a Support link
ALREADY_HAS_SUPPORT = re.compile(r'href="/support\.html"\s*>\s*Support')

# --- helpers ---

def is_pastoral(path: str) -> bool:
    return bool(PASTORAL_PATH_RE.search(path))

def update_content(content: str, path: str) -> tuple[str, dict]:
    """Apply both W5 badge update and W6.1 Support nav insertion. Pastoral pages skip nav."""
    changes = {'badge': False, 'nav': False, 'pastoral_skip_nav': False}

    # Badge unification (always run)
    for old in OLD_BADGE_PATTERNS:
        if old in content:
            if '&check;' in old or '&#10003;' in old:
                # Preserve the entity form already in use
                new = NEW_BADGE_CHECKMARK_ENTITY if '&check;' in old else \
                      '<p class="trust-badge">&#10003; No ads. Independent of cruise lines. <a href="/affiliate-disclosure.html">Affiliate Disclosure</a></p>'
            elif 'Works offline' in old:
                # Port pages: preserve "Works offline" + add missing ✓ prefix
                new = PORT_BADGE_VARIANT
            else:
                new = NEW_BADGE_CHECKMARK_UNICODE
            content = content.replace(old, new)
            changes['badge'] = True

    # Nav insertion (skip on pastoral pages)
    if is_pastoral(path):
        if any(p in content for p in [STANDARD_NAV_OLD_DOT, STANDARD_NAV_OLD_MIDDOT, UL_NAV_OLD, PORT_NAV_OLD_DOT]):
            changes['pastoral_skip_nav'] = True
    else:
        if ALREADY_HAS_SUPPORT.search(content):
            pass  # already updated
        elif STANDARD_NAV_OLD_DOT in content:
            content = content.replace(STANDARD_NAV_OLD_DOT, STANDARD_NAV_NEW_DOT)
            changes['nav'] = True
        elif STANDARD_NAV_OLD_MIDDOT in content:
            content = content.replace(STANDARD_NAV_OLD_MIDDOT, STANDARD_NAV_NEW_MIDDOT)
            changes['nav'] = True
        elif PORT_NAV_OLD_DOT in content:
            content = content.replace(PORT_NAV_OLD_DOT, PORT_NAV_NEW_DOT)
            changes['nav'] = True
        elif UL_NAV_OLD in content:
            content = content.replace(UL_NAV_OLD, UL_NAV_NEW)
            changes['nav'] = True

    return content, changes

def main():
    ap = argparse.ArgumentParser(description='W5 + W6.1 footer rollout')
    ap.add_argument('--apply', action='store_true', help='Write changes (default: dry run)')
    ap.add_argument('--glob', default='**/*.html', help='Glob limit (default: all .html files recursively)')
    args = ap.parse_args()

    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
    os.chdir(repo_root)

    if '**' in args.glob:
        files = _glob.glob(args.glob, recursive=True)
    else:
        files = _glob.glob(args.glob)
    files = [f for f in files if not f.startswith('admin/') and not f.startswith('node_modules/')]
    files.sort()

    counts = {
        'total': 0,
        'badge_updated': 0,
        'nav_updated': 0,
        'pastoral_badge_only': 0,
        'unchanged': 0,
        'no_recognized_footer': 0,
    }

    skipped_unrecognized = []

    for f in files:
        try:
            with open(f, encoding='utf-8') as fh:
                orig = fh.read()
        except (UnicodeDecodeError, IsADirectoryError, PermissionError):
            continue

        # Heuristic: file must contain trust-badge or footer nav to be a candidate
        if 'trust-badge' not in orig and 'Footer navigation' not in orig:
            continue

        counts['total'] += 1

        new_content, changes = update_content(orig, f)

        if changes['badge'] and changes['nav']:
            counts['badge_updated'] += 1
            counts['nav_updated'] += 1
            verb = 'badge+nav'
        elif changes['badge'] and changes['pastoral_skip_nav']:
            counts['pastoral_badge_only'] += 1
            verb = 'badge (pastoral, nav skipped)'
        elif changes['badge']:
            counts['badge_updated'] += 1
            verb = 'badge only'
        elif changes['nav']:
            counts['nav_updated'] += 1
            verb = 'nav only'
        else:
            # Has trust-badge but didn't match any pattern; surface it
            already_compliant_badges = [
                NEW_BADGE_CHECKMARK_UNICODE,
                NEW_BADGE_CHECKMARK_ENTITY,
                PORT_BADGE_VARIANT,
                '<p class="trust-badge">&#10003; No ads. Independent of cruise lines. <a href="/affiliate-disclosure.html">Affiliate Disclosure</a></p>',
            ]
            if 'trust-badge' in orig and not any(p in orig for p in already_compliant_badges):
                counts['no_recognized_footer'] += 1
                skipped_unrecognized.append(f)
            else:
                counts['unchanged'] += 1
            continue

        if args.apply:
            with open(f, 'w', encoding='utf-8') as fh:
                fh.write(new_content)
            print(f'WRITE   {f:60s} {verb}')
        else:
            print(f'WOULD   {f:60s} {verb}')

    print()
    print('--- summary ---')
    print(f"Files scanned with trust-badge or footer-nav: {counts['total']}")
    print(f"Badge updates:                                 {counts['badge_updated']}")
    print(f"Nav (Support link) inserts:                    {counts['nav_updated']}")
    print(f"Pastoral (badge only, nav skipped):            {counts['pastoral_badge_only']}")
    print(f"Already up to date:                            {counts['unchanged']}")
    print(f"Has trust-badge but unrecognized variant:      {counts['no_recognized_footer']}")
    if skipped_unrecognized:
        print()
        print('Files with unrecognized footer variants (manual review needed):')
        for f in skipped_unrecognized[:20]:
            print(f'  {f}')
        if len(skipped_unrecognized) > 20:
            print(f'  ... and {len(skipped_unrecognized) - 20} more')

    if not args.apply:
        print()
        print('Dry run complete. Re-run with --apply to write changes.')

if __name__ == '__main__':
    sys.exit(main() or 0)
