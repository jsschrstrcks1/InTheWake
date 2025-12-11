#!/usr/bin/env python3
"""
Batch fix inline styles on ship pages - replace with CSS classes
"""
import os
import re
from pathlib import Path

SHIPS_DIR = Path('/home/user/InTheWake/ships/rcl')

# Replacements for inline styles
REPLACEMENTS = [
    # Grid column/row
    (r'<div style="grid-column: 1; grid-row: 1;">', '<div class="col-1">'),

    # Page title
    (r'<h1 style="font-size: clamp\(1\.6rem, 3vw, 2\.1rem\); color: var\(--sea\); margin: 0\.75rem 0 0\.5rem;">', '<h1 class="page-title">'),

    # Answer line with inline styles
    (r'<p class="answer-line" style="margin: 0\.75rem 0; padding: 0\.5rem 0\.75rem; border-left: 3px solid var\(--rope, #d9b382\); background: #f7fdff; border-radius: 8px;">', '<p class="answer-line">'),
    (r'<p style="margin: 0\.5rem 0; padding: 0\.5rem 0\.75rem; border-left: 3px solid var\(--rope\); background: #f7fdff; border-radius: 8px; font-size: 0\.95rem; color: #134;">', '<p class="answer-line">'),

    # Section label strong
    (r'<strong style="display: block; font-size: 0\.8rem; letter-spacing: 0\.04em; text-transform: uppercase; color: #567; margin-bottom: 0\.15rem;">', '<strong class="section-label">'),

    # Fit guidance / content text
    (r'<p class="fit-guidance" style="margin: 0\.75rem 0; font-size: 0\.95rem; color: #134; line-height: 1\.6;">', '<p class="content-text">'),
    (r'<p style="margin: 0\.75rem 0; font-size: 0\.95rem; color: #134; line-height: 1\.6;">', '<p class="content-text">'),

    # Key facts / callout box
    (r'<div class="key-facts" style="margin: 1rem 0; padding: 1rem; background: #f7fdff; border-radius: 8px; border: 1px solid #e0f0f5;">', '<div class="callout-box">'),
    (r'<h3 style="margin: 0 0 0\.5rem; font-size: 1rem; color: #134;">Key Facts</h3>', '<h3 class="mt-0 mb-05">Key Facts</h3>'),
    (r'<ul style="margin: 0; padding-left: 1\.25rem;">', '<ul class="list-indent">'),

    # Page intro section
    (r'<section class="page-intro" style="margin: 0 0 1rem 0;">', '<section class="page-intro">'),

    # Recent articles rail
    (r'<p class="tiny" style="margin-bottom: 1rem; color: var\(--ink-mid, #3d5a6a\); line-height: 1\.5;">', '<p class="tiny content-text mb-1">'),
    (r'<p id="recent-rail-fallback" class="tiny" style="display:none">', '<p id="recent-rail-fallback" class="tiny hidden">'),

    # FAQ items
    (r'<details style="margin: 0\.75rem 0; padding: 0\.5rem 0; border-bottom: 1px solid var\(--rope\);">', '<details class="faq-item">'),
    (r'<details style="margin: 0\.75rem 0; padding: 0\.5rem 0;">', '<details class="faq-item">'),
    (r'<summary style="cursor: pointer; font-weight: 600; padding: 0\.5rem 0;">', '<summary>'),
    (r'<p style="margin: 0\.5rem 0; padding-left: 1rem;">', '<p class="faq-answer">'),

    # Footer
    (r'<p class="tiny" style="margin-top: 0\.5rem;">', '<p class="tiny mt-05">'),
    (r'<p class="tiny center" style="opacity:0;position:absolute;pointer-events:none;"', '<p class="tiny center visually-hidden"'),
]

def fix_ship_page(filepath):
    """Fix inline styles in a ship page"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    for pattern, replacement in REPLACEMENTS:
        content = re.sub(pattern, replacement, content)

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    fixed_count = 0

    for filepath in SHIPS_DIR.glob('*.html'):
        if fix_ship_page(filepath):
            print(f"Fixed: {filepath.name}")
            fixed_count += 1

    print(f"\nTotal fixed: {fixed_count} files")

if __name__ == '__main__':
    main()
