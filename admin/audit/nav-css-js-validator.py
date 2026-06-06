#!/usr/bin/env python3
"""
InTheWake Site-Wide Nav / JS / CSS Consistency Validator
=========================================================
Checks every public HTML page for:
  1. Nav JS script presence and correct form
  2. Nav HTML structural integrity
  3. Nav item completeness
  4. CSS file consistency
  5. Script defer consistency
  6. Stylesheet version consistency
  7. Mobile toggle presence
  8. Wrong / stale / extra nav script variants

Usage:
  python3 nav-css-js-validator.py [--root /path/to/site] [--out report.json]
"""

import os
import re
import json
import sys
import argparse
from pathlib import Path
from collections import defaultdict

# ─── Config ────────────────────────────────────────────────────────────────────

# Pages in these dirs are non-public / tooling, skip them
SKIP_DIRS = {
    'admin', '.claude', 'docs', 'attributions', 'audit-reports',
    'node_modules', '.git', 'Reprocessed'
}

# The canonical nav script path (no version, no defer needed but allowed)
CANONICAL_NAV_SCRIPT = '/assets/js/dropdown.js'

# Known bad/stale/wrong nav script patterns
BAD_NAV_SCRIPTS = [
    '/assets/nav.js',           # Wrong path
    '/assets/js/newnav.js',     # Old system
    '/assets/js/nav-dropdown.js',  # Wrong filename
]

# Versioned nav script (stale)
VERSIONED_NAV_RE = re.compile(r'/assets/js/dropdown\.js\?v=\d')

# Required nav HTML signatures (what we check for presence)
NAV_CHECKS = {
    'navbar': ('class="navbar"', 'Missing .navbar wrapper'),
    'nav_toggle': ('class="nav-toggle"', 'Missing .nav-toggle (hamburger)'),
    'site_nav': ('class="site-nav"', 'Missing .site-nav element'),
    'nav_planning': ('id="nav-planning"', 'Missing #nav-planning dropdown'),
    'nav_tools':    ('id="nav-tools"',    'Missing #nav-tools dropdown'),
    'nav_onboard':  ('id="nav-onboard"',  'Missing #nav-onboard dropdown'),
    'nav_travel':   ('id="nav-travel"',   'Missing #nav-travel dropdown'),
    'nav_home':     ('href="/">Home',     'Missing Home nav link'),
    'nav_search':   ('href="/search.html">Search', 'Missing Search nav link'),
    'nav_about':    ('href="/about-us.html">About', 'Missing About nav link'),
    'dropdown_menu': ('class="dropdown-menu"', 'Missing .dropdown-menu (dropdown content)'),
}

# Required CSS
CANONICAL_CSS_RE = re.compile(r'/assets/styles\.css(\?v=[\d.]+)?')
CANONICAL_CSS_VERSIONED = '/assets/styles.css?v=3.010.400'

# Scripts that should have defer
SHOULD_DEFER = [
    'ship-port-links.js',
    'sw-bridge.js',
    'article-rail.js',
    'port-weather.js',
]

# ─── Helpers ───────────────────────────────────────────────────────────────────

def is_redirect_page(content: str) -> bool:
    """Detect redirect-only pages (no real nav needed)."""
    return 'window.location.replace(' in content or 'window.location.href' in content and len(content) < 3000

def is_public_page(path: Path, root: Path) -> bool:
    rel = path.relative_to(root)
    parts = rel.parts
    if parts[0] in SKIP_DIRS:
        return False
    return True

def get_page_type(path: Path, root: Path) -> str:
    rel = str(path.relative_to(root))
    if rel.startswith('ships/'):
        return 'ship'
    if rel.startswith('ports/'):
        return 'port'
    if rel.startswith('restaurants/'):
        return 'restaurant'
    if rel.startswith('articles/'):
        return 'article'
    if rel.startswith('cruise-lines/'):
        return 'cruise-line'
    if rel.startswith('tools/'):
        return 'tool'
    if rel.startswith('authors/'):
        return 'author'
    return 'other'

def extract_script_srcs(content: str) -> list:
    """Extract all <script src="..."> values."""
    return re.findall(r'<script[^>]+src=["\']([^"\']+)["\']', content)

def extract_link_hrefs(content: str) -> list:
    """Extract all <link href="..."> values."""
    return re.findall(r'<link[^>]+href=["\']([^"\']+)["\']', content)

def check_defer(content: str, script_filename: str) -> bool:
    """Check if a specific script has defer attribute."""
    pattern = rf'<script[^>]+{re.escape(script_filename)}[^>]*>'
    m = re.search(pattern, content)
    if not m:
        return None
    tag = m.group(0)
    return 'defer' in tag

# ─── Per-page audit ─────────────────────────────────────────────────────────────

def audit_page(path: Path, root: Path) -> dict:
    try:
        content = path.read_text(encoding='utf-8', errors='replace')
    except Exception as e:
        return {'path': str(path.relative_to(root)), 'error': str(e), 'issues': []}

    rel = str(path.relative_to(root))
    page_type = get_page_type(path, root)
    is_redirect = is_redirect_page(content)

    issues = []
    warnings = []
    info = {}

    # ── 1. Nav JS Script ─────────────────────────────────────────────────────
    script_srcs = extract_script_srcs(content)
    info['scripts'] = script_srcs

    has_canonical_nav = any(CANONICAL_NAV_SCRIPT in s and not re.search(r'\?v=', s) for s in script_srcs)
    has_versioned_nav = any(VERSIONED_NAV_RE.search(s) for s in script_srcs)
    has_bad_nav = [s for s in script_srcs if any(bad in s for bad in BAD_NAV_SCRIPTS)]
    has_any_nav_js = has_canonical_nav or has_versioned_nav or bool(has_bad_nav)

    info['nav_js_canonical'] = has_canonical_nav
    info['nav_js_versioned'] = has_versioned_nav
    info['nav_js_bad'] = has_bad_nav

    if not is_redirect and not has_any_nav_js:
        issues.append({
            'code': 'NAV_JS_MISSING',
            'severity': 'critical',
            'detail': 'No nav JS found (dropdown.js or equivalent). Nav dropdowns will not work.',
        })
    elif has_versioned_nav:
        versioned = [s for s in script_srcs if VERSIONED_NAV_RE.search(s)]
        issues.append({
            'code': 'NAV_JS_STALE_VERSION',
            'severity': 'medium',
            'detail': f'Nav script loaded with stale version query: {versioned}',
        })
    elif has_bad_nav:
        issues.append({
            'code': 'NAV_JS_WRONG_PATH',
            'severity': 'high',
            'detail': f'Nav script loaded from wrong path(s): {has_bad_nav}',
        })

    # Check defer consistency on nav script
    if has_canonical_nav:
        nav_tag = re.search(r'<script[^>]+dropdown\.js[^>]*>', content)
        if nav_tag:
            tag_str = nav_tag.group(0)
            has_defer = 'defer' in tag_str
            info['nav_js_defer'] = has_defer
            if has_defer:
                # defer on nav JS can cause nav to flash/fail on slow pages
                warnings.append({
                    'code': 'NAV_JS_DEFERRED',
                    'severity': 'low',
                    'detail': 'dropdown.js loaded with defer — nav dropdowns may not wire up before user interaction on slow connections.',
                })
    else:
        info['nav_js_defer'] = None

    # ── 2. Nav HTML Structure ─────────────────────────────────────────────────
    if not is_redirect:
        for check_key, (signature, message) in NAV_CHECKS.items():
            if signature not in content:
                issues.append({
                    'code': f'NAV_HTML_{check_key.upper()}',
                    'severity': 'high',
                    'detail': message,
                })

    # ── 3. CSS Consistency ────────────────────────────────────────────────────
    link_hrefs = extract_link_hrefs(content)
    info['stylesheets'] = [h for h in link_hrefs if '.css' in h]

    has_styles_css = any('/assets/styles.css' in h for h in link_hrefs)
    if not is_redirect and not has_styles_css:
        issues.append({
            'code': 'CSS_STYLES_MISSING',
            'severity': 'critical',
            'detail': 'No /assets/styles.css loaded.',
        })
    else:
        # Check version
        styles_css_tags = [h for h in link_hrefs if '/assets/styles.css' in h]
        for tag in styles_css_tags:
            if '?v=' in tag and CANONICAL_CSS_VERSIONED not in tag:
                issues.append({
                    'code': 'CSS_STALE_VERSION',
                    'severity': 'medium',
                    'detail': f'styles.css loaded with stale/wrong version: {tag}',
                })
            # Multiple stylesheets.css?
        if len(styles_css_tags) > 1:
            issues.append({
                'code': 'CSS_DUPLICATE_STYLES',
                'severity': 'medium',
                'detail': f'styles.css loaded {len(styles_css_tags)} times.',
            })

    # ── 4. defer consistency on should-defer scripts ──────────────────────────
    for script_name in SHOULD_DEFER:
        if script_name in content:
            # Find the script tag
            tag_m = re.search(rf'<script[^>]+{re.escape(script_name)}[^>]*>', content)
            if tag_m:
                tag_str = tag_m.group(0)
                if 'defer' not in tag_str and 'async' not in tag_str:
                    warnings.append({
                        'code': 'SCRIPT_MISSING_DEFER',
                        'severity': 'low',
                        'detail': f'{script_name} loaded without defer/async.',
                    })

    # ── 5. inline <script> inside <head> that blocks ──────────────────────────
    # Check if styles.css is loaded before analytics
    # (Just detect if inline render-blocking scripts appear before CSS)
    css_pos = content.find('/assets/styles.css')
    gtag_pos = content.find('googletagmanager')
    if css_pos > 0 and gtag_pos > 0 and gtag_pos > css_pos:
        # GA after CSS — that's fine
        pass

    # ── 6. Check for multiple nav.js variants on same page ───────────────────
    nav_variants = set()
    for s in script_srcs:
        if 'dropdown' in s or 'newnav' in s or s == '/assets/nav.js':
            nav_variants.add(s)
    if len(nav_variants) > 1:
        issues.append({
            'code': 'NAV_JS_MULTIPLE_VARIANTS',
            'severity': 'high',
            'detail': f'Multiple nav script variants on same page: {list(nav_variants)}',
        })

    # ── 7. Detect nav-group (old nav system) mixed with new ──────────────────
    if 'class="nav-group"' in content and 'class="nav-dropdown"' in content:
        issues.append({
            'code': 'NAV_MIXED_SYSTEMS',
            'severity': 'high',
            'detail': 'Page mixes old nav-group system and new nav-dropdown system.',
        })
    elif 'class="nav-group"' in content:
        issues.append({
            'code': 'NAV_OLD_SYSTEM',
            'severity': 'high',
            'detail': 'Page uses old nav-group/nav-disclosure/submenu system, not nav-dropdown.',
        })

    return {
        'path': rel,
        'type': page_type,
        'is_redirect': is_redirect,
        'issues': issues,
        'warnings': warnings,
        'info': info,
    }

# ─── Main ────────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description='InTheWake Nav/JS/CSS Validator')
    parser.add_argument('--root', default=str(Path(__file__).resolve().parents[2]),
                        help='Site root (default: repo root, derived from this script location)')
    parser.add_argument('--out', default='/tmp/itw-nav-audit.json', help='JSON output path')
    parser.add_argument('--summary', action='store_true', help='Print summary only')
    args = parser.parse_args()

    root = Path(args.root)
    html_files = sorted(root.rglob('*.html'))
    public_files = [f for f in html_files if is_public_page(f, root)]

    # Fail loud rather than silently reporting "all clean" when the root is wrong
    # (e.g. a stale path): 0 files found is an error, not a passing scan.
    if not public_files:
        print(f'ERROR: no public HTML files under root {root!s}. '
              f'Pass --root <site root> (no .html found).', file=sys.stderr)
        sys.exit(2)

    print(f'Scanning {len(public_files)} public HTML files...', flush=True)

    results = []
    counters = defaultdict(int)
    issue_map = defaultdict(list)   # code -> list of paths
    by_type = defaultdict(lambda: defaultdict(list))  # type -> code -> paths

    for i, fpath in enumerate(public_files):
        if i % 100 == 0:
            print(f'  {i}/{len(public_files)}...', flush=True)
        r = audit_page(fpath, root)
        results.append(r)

        for issue in r['issues']:
            code = issue['code']
            counters[code] += 1
            issue_map[code].append(r['path'])
            by_type[r['type']][code].append(r['path'])

        for w in r.get('warnings', []):
            code = 'WARN_' + w['code']
            counters[code] += 1

    # ── Summary ────────────────────────────────────────────────────────────────
    total_pages = len(public_files)
    redirect_pages = sum(1 for r in results if r.get('is_redirect'))
    pages_with_issues = sum(1 for r in results if r['issues'])
    pages_clean = total_pages - pages_with_issues

    print(f'\n{"="*60}')
    print(f'RESULTS: {total_pages} public pages scanned')
    print(f'  Redirect-only pages: {redirect_pages}')
    print(f'  Pages with issues:   {pages_with_issues}')
    print(f'  Clean pages:         {pages_clean}')
    print(f'{"="*60}')
    print(f'\nISSUE SUMMARY (by code):')

    SEVERITY_ORDER = {'critical': 0, 'high': 1, 'medium': 2, 'low': 3}

    # Build severity map from first occurrence
    code_severity = {}
    for r in results:
        for iss in r['issues']:
            if iss['code'] not in code_severity:
                code_severity[iss['code']] = iss['severity']

    sorted_codes = sorted(counters.keys(), key=lambda c: (
        SEVERITY_ORDER.get(code_severity.get(c.replace('WARN_', ''), 'low'), 99),
        -counters[c]
    ))

    for code in sorted_codes:
        sev = code_severity.get(code.replace('WARN_', ''), 'warn')
        print(f'  [{sev.upper():8}] {code:45} {counters[code]:4} pages')

    print(f'\nBY PAGE TYPE:')
    for ptype, codes in sorted(by_type.items()):
        total_t = sum(1 for r in results if r['type'] == ptype)
        affected = len(set(p for code_list in codes.values() for p in code_list))
        print(f'  {ptype:15} {affected}/{total_t} pages have issues')
        for code, paths in sorted(codes.items()):
            print(f'    {code}: {len(paths)} pages')

    # ── Key samples ────────────────────────────────────────────────────────────
    print(f'\nSAMPLE PAGES FOR KEY ISSUES:')
    for code in ['NAV_JS_MISSING', 'NAV_JS_WRONG_PATH', 'NAV_JS_STALE_VERSION',
                 'NAV_HTML_NAV_TOGGLE', 'NAV_HTML_NAVBAR', 'CSS_STYLES_MISSING',
                 'NAV_HTML_DROPDOWN_MENU', 'NAV_OLD_SYSTEM']:
        if code in issue_map:
            pages = issue_map[code]
            shown = pages[:5]
            print(f'\n  {code} ({len(pages)} pages):')
            for p in shown:
                print(f'    {p}')
            if len(pages) > 5:
                print(f'    ... and {len(pages)-5} more')

    # ── Write JSON ─────────────────────────────────────────────────────────────
    output = {
        'summary': {
            'total_public': total_pages,
            'redirect_pages': redirect_pages,
            'pages_with_issues': pages_with_issues,
            'pages_clean': pages_clean,
        },
        'issue_counts': dict(counters),
        'issue_map': {k: v for k, v in issue_map.items()},
        'by_type': {t: {c: paths for c, paths in codes.items()} for t, codes in by_type.items()},
        'results': results,
    }
    with open(args.out, 'w') as f:
        json.dump(output, f, indent=2)
    print(f'\nFull JSON saved to: {args.out}')


if __name__ == '__main__':
    main()
