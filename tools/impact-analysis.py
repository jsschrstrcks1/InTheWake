#!/usr/bin/env python3
"""
Impact Analysis Tool — InTheWake
Generates a comprehensive impact analysis document for any file change.
Usage: python3 impact-analysis.py <file> [--compare <gold_standard>]
"""

import sys
import os
import re
import hashlib
import subprocess
from datetime import datetime
from pathlib import Path

def get_file_stats(filepath):
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    lines = content.split('\n')
    return {
        'lines': len(lines),
        'size': os.path.getsize(filepath),
        'md5': hashlib.md5(content.encode()).hexdigest(),
        'content': content
    }

def find_references(content, pattern, label):
    refs = []
    for i, line in enumerate(content.split('\n'), 1):
        if re.search(pattern, line):
            refs.append(f"  Line {i}: {line.strip()}")
    return refs

def analyze_html(content):
    issues = []
    
    # Check for duplicate IDs
    ids = re.findall(r'id=["\']([^"\']+)["\']', content)
    from collections import Counter
    dup_ids = [id for id, count in Counter(ids).items() if count > 1]
    if dup_ids:
        issues.append(f"DUPLICATE IDs: {', '.join(dup_ids)}")
    
    # Check for duplicate class selectors in JS
    swiper_inits = re.findall(r'new Swiper\(["\']([^"\']+)["\']', content)
    dup_swipers = [s for s, c in Counter(swiper_inits).items() if c > 1]
    if dup_swipers:
        issues.append(f"DUPLICATE SWIPER INITS: {', '.join(dup_swipers)}")
    
    # Check for duplicate fetch patterns
    fetches = re.findall(r"fetch\(['\"]([^'\"]+)['\"]", content)
    dup_fetches = [f for f, c in Counter(fetches).items() if c > 1]
    if dup_fetches:
        issues.append(f"DUPLICATE FETCH CALLS: {', '.join(dup_fetches)}")
    
    # Check ICP version consistency
    icp_refs = re.findall(r'ICP-(?:Lite\s+v[\d.]+|2)', content)
    unique_icp = list(set(icp_refs))
    if len(unique_icp) > 1:
        issues.append(f"INCONSISTENT ICP VERSIONS: {', '.join(unique_icp)}")
    
    # Count stats grids
    stats_grids = len(re.findall(r'class=["\'][^"\']*stats-grid[^"\']*["\']', content))
    if stats_grids > 2:
        issues.append(f"POSSIBLE DUPLICATE STATS GRIDS: {stats_grids} found")
    
    # Check for orphaned elements (referenced in JS but not in HTML)
    js_targets = re.findall(r'querySelector\(["\']#([^"\']+)["\']', content)
    js_targets += re.findall(r'getElementById\(["\']([^"\']+)["\']', content)
    html_ids = re.findall(r'\bid=["\']([^"\']+)["\']', content)
    orphaned = [t for t in set(js_targets) if t not in html_ids]
    if orphaned:
        issues.append(f"ORPHANED JS TARGETS (in JS but no matching ID in HTML): {', '.join(orphaned)}")
    
    return issues

def generate_impact_analysis(filepath, gold_standard=None):
    stats = get_file_stats(filepath)
    issues = analyze_html(stats['content'])
    
    filename = os.path.basename(filepath)
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    report = f"""# Impact Analysis — {filename}
Generated: {timestamp}

## File Statistics
- **Lines:** {stats['lines']}
- **Size:** {stats['size']:,} bytes
- **MD5:** {stats['md5']}

## Automated Issue Detection
"""
    
    if issues:
        report += "\n### ⚠️ Issues Found\n"
        for issue in issues:
            report += f"- {issue}\n"
    else:
        report += "\n### ✅ No automated issues detected\n"
    
    # Key element inventory
    report += "\n## Key Element Inventory\n"
    
    elements = {
        'Swiper inits': r'new Swiper\(',
        'fetch() calls': r'fetch\(',
        'script tags': r'<script',
        'id attributes': r'\bid=["\']',
        'ICP references': r'ICP-',
        'stats-grid divs': r'stats-grid',
        'photo-carousel': r'photo-carousel',
        'video-carousel': r'video-carousel',
        'ship-tracker': r'ship-tracker',
        'deck-plans': r'deck-plans',
    }
    
    for label, pattern in elements.items():
        count = len(re.findall(pattern, stats['content']))
        status = "✅" if count > 0 else "⚠️"
        report += f"- {status} **{label}:** {count}\n"
    
    # Gold standard comparison
    if gold_standard and os.path.exists(gold_standard):
        gold_stats = get_file_stats(gold_standard)
        gold_issues = analyze_html(gold_stats['content'])
        
        report += f"\n## Gold Standard Comparison\n"
        report += f"Gold standard: `{os.path.basename(gold_standard)}`\n\n"
        
        for label, pattern in elements.items():
            subject_count = len(re.findall(pattern, stats['content']))
            gold_count = len(re.findall(pattern, gold_stats['content']))
            match = "✅" if subject_count == gold_count else "⚠️"
            report += f"- {match} **{label}:** {subject_count} (gold: {gold_count})\n"
        
        if gold_issues:
            report += f"\n### Gold Standard Issues (for reference)\n"
            for issue in gold_issues:
                report += f"- {issue}\n"
    
    # Change impact assessment
    report += "\n## Change Impact Assessment\n"
    report += "This section must be filled in manually for each PR:\n\n"
    report += "| Change | Impact | Risk | Verified |\n"
    report += "|--------|--------|------|----------|\n"
    report += "| [describe change] | [high/medium/low] | [risk] | [yes/no] |\n"
    
    report += "\n## Integration Test Results\n"
    report += "See: INTEGRATION_TEST_RESULTS.md (generated separately)\n"
    
    report += "\n## Orchestra Review\n"
    report += "See: ORCHESTRA_REVIEW.md (generated separately)\n"
    
    return report

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python3 impact-analysis.py <file> [--compare <gold_standard>]")
        sys.exit(1)
    
    filepath = sys.argv[1]
    gold = None
    
    if '--compare' in sys.argv:
        idx = sys.argv.index('--compare')
        if idx + 1 < len(sys.argv):
            gold = sys.argv[idx + 1]
    
    report = generate_impact_analysis(filepath, gold)
    
    # Write to file
    outfile = os.path.join(os.path.dirname(filepath), 
                           f"IMPACT_ANALYSIS_{os.path.basename(filepath).replace('.html', '')}.md")
    with open(outfile, 'w') as f:
        f.write(report)
    
    print(report)
    print(f"\n✅ Impact analysis written to: {outfile}")
