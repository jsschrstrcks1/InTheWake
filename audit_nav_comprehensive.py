#!/usr/bin/env python3
"""Comprehensive navigation audit - find duplicates and CSS issues"""

import re
from pathlib import Path
from typing import List, Tuple

def count_nav_elements(html_content: str) -> int:
    """Count <nav> elements in HTML"""
    return len(re.findall(r'<nav\s', html_content, re.IGNORECASE))

def has_dropdown_css(html_content: str) -> bool:
    """Check if page has the dropdown navigation CSS"""
    # Key CSS selectors that must be present for horizontal dropdown nav
    required_css = [
        r'\.nav\s*\{[^}]*display:\s*flex',
        r'\.submenu\s*\{[^}]*position:\s*absolute',
        r'\.nav-item\s*\{[^}]*position:\s*relative'
    ]
    
    for pattern in required_css:
        if not re.search(pattern, html_content, re.IGNORECASE | re.DOTALL):
            return False
    return True

def has_old_pill_nav(html_content: str) -> bool:
    """Check if page has old pill-style nav without dropdowns"""
    # Old nav pattern: <nav class="nav"> with direct <a> children, no dropdowns
    old_nav_pattern = r'<nav[^>]*class="nav"[^>]*>\s*<a\s+href="/"'
    return bool(re.search(old_nav_pattern, html_content))

def has_new_dropdown_nav(html_content: str) -> bool:
    """Check if page has new dropdown nav structure"""
    # New nav pattern: <nav class="nav"> with <div class="nav-item"> children
    new_nav_pattern = r'<nav[^>]*class="nav"[^>]*>.*?<div\s+class="nav-item"'
    return bool(re.search(new_nav_pattern, html_content, re.DOTALL))

def analyze_page(filepath: Path) -> dict:
    """Analyze a single page for navigation issues"""
    try:
        content = filepath.read_text(encoding='utf-8')
        
        nav_count = count_nav_elements(content)
        has_css = has_dropdown_css(content)
        has_old = has_old_pill_nav(content)
        has_new = has_new_dropdown_nav(content)
        
        issues = []
        if nav_count > 1:
            issues.append(f"DUPLICATE_NAV({nav_count})")
        if has_new and not has_css:
            issues.append("MISSING_CSS")
        if has_old and has_new:
            issues.append("OLD_AND_NEW")
        if has_old and not has_new:
            issues.append("OLD_ONLY")
        if not has_new and not has_old:
            issues.append("NO_NAV")
            
        return {
            'path': str(filepath),
            'nav_count': nav_count,
            'has_css': has_css,
            'has_old': has_old,
            'has_new': has_new,
            'issues': issues
        }
    except Exception as e:
        return {
            'path': str(filepath),
            'error': str(e)
        }

def main():
    """Run comprehensive audit"""
    base = Path('/home/user/InTheWake')
    
    # Find all HTML files except solo/articles
    html_files = []
    for pattern in ['*.html', '*/*.html', '*/*/*.html', '*/*/*/*.html']:
        html_files.extend(base.glob(pattern))
    
    html_files = [f for f in html_files if '/solo/articles/' not in str(f)]
    html_files.sort()
    
    print(f"Auditing {len(html_files)} HTML files...\n")
    
    problems = []
    perfect = []
    
    for filepath in html_files:
        rel_path = filepath.relative_to(base)
        result = analyze_page(filepath)
        
        if result.get('issues'):
            problems.append((rel_path, result))
        else:
            perfect.append(rel_path)
    
    # Report problems
    print(f"{'='*70}")
    print(f"PROBLEMS FOUND: {len(problems)}")
    print(f"{'='*70}\n")
    
    for rel_path, result in problems:
        print(f"❌ {rel_path}")
        print(f"   Issues: {', '.join(result['issues'])}")
        print(f"   Nav count: {result['nav_count']}, Has CSS: {result['has_css']}, Has old: {result['has_old']}, Has new: {result['has_new']}")
        print()
    
    print(f"\n{'='*70}")
    print(f"SUMMARY")
    print(f"{'='*70}")
    print(f"Total files: {len(html_files)}")
    print(f"Problems: {len(problems)}")
    print(f"Perfect: {len(perfect)}")
    
    # Categorize problems
    duplicate_nav = [p for p, r in problems if 'DUPLICATE_NAV' in ' '.join(r['issues'])]
    missing_css = [p for p, r in problems if 'MISSING_CSS' in ' '.join(r['issues'])]
    old_and_new = [p for p, r in problems if 'OLD_AND_NEW' in ' '.join(r['issues'])]
    old_only = [p for p, r in problems if 'OLD_ONLY' in ' '.join(r['issues'])]
    
    print(f"\nDuplicate nav elements: {len(duplicate_nav)}")
    print(f"Missing CSS (vertical nav): {len(missing_css)}")
    print(f"Has both old and new nav: {len(old_and_new)}")
    print(f"Has old nav only: {len(old_only)}")

if __name__ == '__main__':
    main()
