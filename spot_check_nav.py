#!/usr/bin/env python3
"""
Spot check 20% of files from diverse categories
Verify navigation is working correctly
"""

import re
import random
from pathlib import Path
from typing import Dict, List

def check_page(filepath: Path) -> Dict:
    """Comprehensive check of a page's navigation"""
    try:
        content = filepath.read_text(encoding='utf-8')
        
        # Count nav elements
        nav_count = len(re.findall(r'<nav[^>]*>', content))
        
        # Check for required elements
        has_navbar_div = bool(re.search(r'<div class="navbar">', content))
        has_nav_class = bool(re.search(r'<nav[^>]*class="nav"', content))
        has_nav_item = bool(re.search(r'<div class="nav-item">', content))
        has_dropdown_css = bool(re.search(r'\.nav-item\s*\{', content))
        has_submenu_css = bool(re.search(r'\.submenu\s*\{', content))
        has_nav_js = bool(re.search(r'Dropdown nav behavior', content))
        has_planning_dropdown = bool(re.search(r'id="nav-planning"', content))
        has_travel_dropdown = bool(re.search(r'id="nav-travel"', content))
        
        # Special case: footer nav is OK
        is_special = 'privacy.html' in str(filepath) or 'terms.html' in str(filepath)
        
        # Determine status
        issues = []
        
        if nav_count == 0:
            issues.append("NO_NAV")
        elif nav_count > 1 and not is_special:
            issues.append(f"DUPLICATE_NAV({nav_count})")
        
        if has_nav_class and not has_dropdown_css:
            issues.append("MISSING_CSS")
        
        if has_nav_class and not has_nav_js:
            issues.append("MISSING_JS")
            
        if has_nav_class and not has_nav_item:
            issues.append("NO_NAV_ITEMS")
            
        if has_nav_class and not (has_planning_dropdown and has_travel_dropdown):
            issues.append("MISSING_DROPDOWNS")
        
        return {
            'path': filepath,
            'nav_count': nav_count,
            'has_navbar_div': has_navbar_div,
            'has_css': has_dropdown_css,
            'has_js': has_nav_js,
            'has_dropdowns': has_planning_dropdown and has_travel_dropdown,
            'issues': issues,
            'ok': len(issues) == 0
        }
        
    except Exception as e:
        return {'path': filepath, 'error': str(e), 'ok': False}


def main():
    """Spot check 20% of files from diverse categories"""
    base = Path('/home/user/InTheWake')
    
    # Sample files from different categories
    categories = {
        'Royal Caribbean Ships': list((base / 'ships/rcl').glob('*.html'))[:12],
        'Carnival Ships': list((base / 'ships/carnival').glob('*.html'))[:12],
        'Celebrity Ships': list((base / 'ships/celebrity-cruises').glob('*.html'))[:6],
        'Holland America Ships': list((base / 'ships/holland-america-line').glob('*.html'))[:6],
        'Restaurants': list((base / 'restaurants').glob('*.html'))[:6],
        'Core Pages': [
            base / 'index.html',
            base / 'about-us.html',
            base / 'drink-calculator.html',
            base / 'ships.html',
            base / 'solo.html',
            base / 'planning.html'
        ],
        'Cruise Lines': list((base / 'cruise-lines').glob('*.html'))[:4],
        'Special Pages': [
            base / 'offline.html',
            base / 'terms.html',
            base / 'privacy.html',
            base / 'ships/index.html'
        ]
    }
    
    all_files = []
    for category, files in categories.items():
        all_files.extend([(category, f) for f in files if f.exists()])
    
    print(f"Spot checking {len(all_files)} files across {len(categories)} categories...\n")
    
    passed = 0
    failed = 0
    failures_by_category = {}
    
    for category, filepath in all_files:
        rel_path = filepath.relative_to(base)
        result = check_page(filepath)
        
        if result['ok']:
            print(f"✓ [{category}] {rel_path}")
            passed += 1
        else:
            print(f"✗ [{category}] {rel_path}")
            print(f"   Issues: {', '.join(result.get('issues', ['ERROR']))}")
            if 'error' in result:
                print(f"   Error: {result['error']}")
            failed += 1
            
            if category not in failures_by_category:
                failures_by_category[category] = []
            failures_by_category[category].append(rel_path)
    
    print(f"\n{'='*70}")
    print(f"SPOT CHECK SUMMARY")
    print(f"{'='*70}")
    print(f"Total checked: {len(all_files)}")
    print(f"Passed: {passed}")
    print(f"Failed: {failed}")
    print(f"Success rate: {100 * passed / len(all_files):.1f}%")
    
    if failed > 0:
        print(f"\n{'='*70}")
        print(f"FAILURES BY CATEGORY")
        print(f"{'='*70}")
        for category, files in failures_by_category.items():
            print(f"\n{category}:")
            for f in files:
                print(f"  - {f}")
    
    return failed


if __name__ == '__main__':
    import sys
    sys.exit(main())
