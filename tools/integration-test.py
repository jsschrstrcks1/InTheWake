#!/usr/bin/env python3
"""
Integration Test Tool — InTheWake
Uses BeautifulSoup + structural analysis to verify HTML correctness.
Usage: python3 integration-test.py <file> [--gold <gold_standard>]
"""

import sys
import os
import re
import json
from datetime import datetime
from pathlib import Path

try:
    from bs4 import BeautifulSoup
    BS4_AVAILABLE = True
except ImportError:
    BS4_AVAILABLE = False

def parse_html(filepath):
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    if BS4_AVAILABLE:
        return BeautifulSoup(content, 'html.parser'), content
    return None, content

def test_required_sections(soup, content):
    """Test that all required ICP-2 sections are present."""
    results = []
    
    required = [
        ('title', 'title tag', lambda s: s.find('title') is not None),
        ('meta description', 'meta[name=description]', lambda s: s.find('meta', {'name': 'description'}) is not None),
        ('h1', 'h1 tag', lambda s: len(s.find_all('h1')) == 1),
        ('ship-stats', '#ship-stats element', lambda s: s.find(id='ship-stats') is not None),
        ('photo-carousel', 'photo carousel', lambda s: s.find(class_=re.compile('photo-carousel')) is not None),
        ('nav', 'navigation', lambda s: s.find('nav') is not None),
        ('footer', 'footer', lambda s: s.find('footer') is not None),
    ]
    
    if soup:
        for key, label, test in required:
            try:
                passed = test(soup)
                results.append(('PASS' if passed else 'FAIL', label))
            except Exception as e:
                results.append(('ERROR', f"{label}: {e}"))
    else:
        # Fallback regex checks
        checks = [
            ('title tag', r'<title>'),
            ('meta description', r'name=["\']description["\']'),
            ('h1 tag', r'<h1'),
            ('ship-stats', r'id=["\']ship-stats["\']'),
            ('photo-carousel', r'photo-carousel'),
            ('nav', r'<nav'),
            ('footer', r'<footer'),
        ]
        for label, pattern in checks:
            passed = bool(re.search(pattern, content))
            results.append(('PASS' if passed else 'FAIL', label))
    
    return results

def test_no_duplicates(soup, content):
    """Test for duplicate elements."""
    results = []
    
    # Check duplicate IDs
    if soup:
        ids = [tag.get('id') for tag in soup.find_all(id=True)]
        from collections import Counter
        dup_ids = [id for id, count in Counter(ids).items() if count > 1]
        results.append(('FAIL' if dup_ids else 'PASS', f"Duplicate IDs: {dup_ids if dup_ids else 'none'}"))
    
    # Check duplicate Swiper inits
    swiper_inits = re.findall(r"new Swiper\(['\"]([^'\"]+)['\"]", content)
    from collections import Counter
    dup_swipers = [s for s, c in Counter(swiper_inits).items() if c > 1]
    results.append(('FAIL' if dup_swipers else 'PASS', f"Duplicate Swiper inits: {dup_swipers if dup_swipers else 'none'}"))
    
    # Check stats-grid duplicates
    stats_count = len(re.findall(r'class=["\'][^"\']*stats-grid[^"\']*["\']', content))
    results.append(('FAIL' if stats_count > 2 else 'PASS', f"Stats grid count: {stats_count} (max 2 expected)"))
    
    # Check photo attribution duplicates
    wikimedia_count = len(re.findall(r'Wikimedia Commons', content))
    results.append(('WARN' if wikimedia_count > 3 else 'PASS', f"Wikimedia attribution blocks: {wikimedia_count}"))
    
    return results

def test_icp_consistency(content):
    """Test ICP version consistency throughout document."""
    results = []
    
    icp_refs = re.findall(r'ICP-(?:Lite\s+v[\d.]+|2)', content)
    from collections import Counter
    icp_versions = Counter(icp_refs)
    
    if 'ICP-Lite' in str(icp_versions):
        results.append(('FAIL', f"Stale ICP-Lite references found: {dict(icp_versions)}"))
    elif icp_refs:
        results.append(('PASS', f"ICP version consistent: {dict(icp_versions)}"))
    else:
        results.append(('WARN', "No ICP version references found"))
    
    return results

def test_js_integrity(content):
    """Test JavaScript integrity — guards, orphans, fetch calls."""
    results = []
    
    # Check Swiper guard pattern
    if '__swiperReady' in content:
        # Correct guard: if(!window.__swiperReady||!window.Swiper)
        correct_guard = bool(re.search(r'if\s*\(\s*!\s*window\.__swiperReady', content))
        results.append(('PASS' if correct_guard else 'FAIL', 
                        f"Swiper guard uses ! operator: {correct_guard}"))
    
    # Check for orphaned JS targets
    js_targets = re.findall(r"querySelector\(['\"]#([^'\"]+)['\"]", content)
    js_targets += re.findall(r"getElementById\(['\"]([^'\"]+)['\"]", content)
    html_ids = re.findall(r'\bid=["\']([^"\']+)["\']', content)
    orphaned = [t for t in set(js_targets) if t not in html_ids]
    results.append(('FAIL' if orphaned else 'PASS', 
                    f"Orphaned JS targets: {orphaned if orphaned else 'none'}"))
    
    # Check fetch() calls for duplicates
    fetches = re.findall(r"fetch\(['\"]([^'\"]+)['\"]", content)
    from collections import Counter
    dup_fetches = [f for f, c in Counter(fetches).items() if c > 1]
    results.append(('FAIL' if dup_fetches else 'PASS',
                    f"Duplicate fetch() calls: {dup_fetches if dup_fetches else 'none'}"))
    
    return results

def test_accessibility(soup, content):
    """Basic accessibility checks."""
    results = []
    
    if soup:
        # Images without alt
        imgs = soup.find_all('img')
        missing_alt = [str(img)[:80] for img in imgs if not img.get('alt')]
        results.append(('WARN' if missing_alt else 'PASS',
                        f"Images missing alt text: {len(missing_alt)}"))
        
        # Check for skip link or main landmark
        has_main = bool(soup.find('main'))
        results.append(('PASS' if has_main else 'WARN', f"Has <main> landmark: {has_main}"))
    else:
        # Fallback
        img_count = len(re.findall(r'<img[^>]+>', content))
        alt_count = len(re.findall(r'<img[^>]+alt=', content))
        results.append(('PASS' if img_count == alt_count else 'WARN',
                        f"Images with alt: {alt_count}/{img_count}"))
    
    return results

def run_all_tests(filepath, gold_standard=None):
    soup, content = parse_html(filepath)
    
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    filename = os.path.basename(filepath)
    
    all_results = []
    
    sections = [
        ("Required Sections", test_required_sections(soup, content)),
        ("Duplicate Detection", test_no_duplicates(soup, content)),
        ("ICP Consistency", test_icp_consistency(content)),
        ("JavaScript Integrity", test_js_integrity(content)),
        ("Accessibility", test_accessibility(soup, content)),
    ]
    
    report = f"""# Integration Test Results — {filename}
Generated: {timestamp}
BeautifulSoup: {'available' if BS4_AVAILABLE else 'NOT AVAILABLE (regex fallback)'}

"""
    
    pass_count = 0
    fail_count = 0
    warn_count = 0
    
    for section_name, results in sections:
        report += f"## {section_name}\n"
        for status, message in results:
            icon = "✅" if status == 'PASS' else ("❌" if status == 'FAIL' else "⚠️")
            report += f"- {icon} **{status}:** {message}\n"
            if status == 'PASS': pass_count += 1
            elif status == 'FAIL': fail_count += 1
            else: warn_count += 1
        report += "\n"
    
    report += f"""## Summary
- ✅ PASS: {pass_count}
- ❌ FAIL: {fail_count}  
- ⚠️ WARN: {warn_count}
- **Overall:** {'❌ NEEDS FIXES' if fail_count > 0 else ('⚠️ REVIEW WARNINGS' if warn_count > 0 else '✅ ALL PASS')}
"""
    
    return report, fail_count

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python3 integration-test.py <file> [--gold <gold_standard>]")
        sys.exit(1)
    
    filepath = sys.argv[1]
    gold = None
    
    if '--gold' in sys.argv:
        idx = sys.argv.index('--gold')
        if idx + 1 < len(sys.argv):
            gold = sys.argv[idx + 1]
    
    # Install bs4 if not available
    if not BS4_AVAILABLE:
        print("BeautifulSoup not available — using regex fallback")
    
    report, fail_count = run_all_tests(filepath, gold)
    
    # Write to file
    outfile = os.path.join(os.path.dirname(filepath),
                           f"INTEGRATION_TEST_{os.path.basename(filepath).replace('.html', '')}.md")
    with open(outfile, 'w') as f:
        f.write(report)
    
    print(report)
    print(f"\n✅ Integration test results written to: {outfile}")
    sys.exit(0 if fail_count == 0 else 1)
