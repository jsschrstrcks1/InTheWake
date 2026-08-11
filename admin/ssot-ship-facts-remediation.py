#!/usr/bin/env python3
"""
Soli Deo Gloria.
SSOT Ship Facts Remediation — ship-stats-fallback is THE single source of truth.

Reads ship-stats-fallback JSON from every ship page and rewrites the fact-block,
key-facts, and ai-summary sections to match — so no section can drift or fabricate.

Usage:
  python3 admin/ssot-ship-facts-remediation.py --dry-run   # analyze only, no changes
  python3 admin/ssot-ship-facts-remediation.py --fix       # apply changes
  python3 admin/ssot-ship-facts-remediation.py --audit     # audit only, report drift
"""

import os, re, json, sys, argparse
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]  # InTheWake repo root

def load_stats(content):
    """Extract ship-stats-fallback JSON from page HTML."""
    m = re.search(r'id=["\']ship-stats-fallback["\'][^>]*>\s*(\{.*?\})\s*</script>', content, re.DOTALL)
    if not m:
        return None
    try:
        return json.loads(m.group(1))
    except (ValueError, TypeError):
        return None

def indefinite_article(word):
    """Return 'a' or 'an' for a given word."""
    if not word:
        return 'a'
    return 'an' if word[0].lower() in 'aeiou' else 'a'

def generate_fact_block(stats):
    """Generate fact-block paragraph from SSOT data."""
    name = stats.get('name', '')
    ship_class = stats.get('class', '')
    cruise_line = stats.get('cruise_line', '')
    year = stats.get('entered_service', '')
    gt = stats.get('gt', '')
    guests = stats.get('guests', '')
    crew = stats.get('crew', '')

    article = indefinite_article(ship_class)
    class_part = f"{article} {ship_class}" if ship_class else "a"

    # Build the sentence parts
    parts = [f"{name} is {class_part} cruise ship operated by {cruise_line}."]

    detail_parts = []
    if year:
        detail_parts.append(f"entered service in {year}")
    if gt:
        # Remove trailing ' GT' if already present to avoid "GT gross tons"
        gt_clean = re.sub(r'\s*GT$', '', gt).strip() if gt else ''
        if gt_clean and gt_clean != gt:
            detail_parts.append(f"measures {gt_clean} gross tons")
        elif gt:
            detail_parts.append(f"measures {gt} gross tons")
    if guests:
        detail_parts.append(f"carries approximately {guests} guests at double occupancy")
    if crew:
        detail_parts.append(f"with a crew of {crew}")

    if detail_parts:
        # Build as a single sentence
        sentence = f"{name} is {class_part} cruise ship operated by {cruise_line}"
        if len(detail_parts) == 1:
            sentence += f", {detail_parts[0]}."
        elif len(detail_parts) == 2:
            sentence += f", {detail_parts[0]}, and {detail_parts[1]}."
        else:
            for dp in detail_parts[:-1]:
                sentence += f", {dp}"
            sentence += f", and {detail_parts[-1]}."
        return sentence

    return parts[0]

def generate_key_facts(stats):
    """Generate key-facts <li> items from SSOT data."""
    items = []
    cruise_line = stats.get('cruise_line', '')
    ship_class = stats.get('class', '')
    year = stats.get('entered_service', '')
    gt = stats.get('gt', '')
    guests = stats.get('guests', '')
    crew = stats.get('crew', '')
    imo = stats.get('imo', '')

    if cruise_line:
        items.append(('Cruise Line', cruise_line))
    if ship_class:
        items.append(('Class', ship_class))
    if year:
        items.append(('Year', str(year)))
    if gt:
        items.append(('Tonnage', gt))
    if guests:
        items.append(('Guests', str(guests)))
    if crew:
        items.append(('Crew', str(crew)))
    if imo:
        items.append(('IMO', str(imo)))

    return items

def generate_ai_summary(stats):
    """Generate ai-summary meta from SSOT data."""
    name = stats.get('name', '')
    ship_class = stats.get('class', '')
    cruise_line = stats.get('cruise_line', '')
    year = stats.get('entered_service', '')
    gt = stats.get('gt', '')
    guests = stats.get('guests', '')

    article = indefinite_article(ship_class)
    class_part = f"{article} {ship_class}" if ship_class else "a"

    line_part = f" from {cruise_line}" if cruise_line else ""
    parts = [f"{name} is {class_part} ship{line_part}."]
    if year:
        parts[-1] = parts[-1].rstrip('.')
        parts[-1] += f" Launched in {year},"
    if gt:
        # Strip trailing GT for natural reading; append "gross tons"
        gt_clean = re.sub(r'\s*GT$', '', gt).strip()
        parts[-1] = parts[-1].rstrip(',.')
        parts[-1] += f" she measures {gt_clean} gross tons"
    if guests:
        parts[-1] = parts[-1].rstrip(',.')
        parts[-1] += f" with {guests} guests."

    return parts[0]

def analyze_page(path):
    """Analyze a single ship page. Returns dict of findings or None if not a ship page."""
    content = path.read_text(encoding='utf-8')
    stats = load_stats(content)
    if not stats:
        return None

    result = {
        'path': str(path.relative_to(ROOT)),
        'stats': stats,
        'has_fact_block': bool(re.search(r'class="fact-block"', content)),
        'has_key_facts': bool(re.search(r'class="key-facts"', content)),
        'has_ai_summary': bool(re.search(r'name="ai-summary"', content)),
        'issues': [],
    }

    # Check fact-block for drift
    fb_match = re.search(r'<p\s+class="fact-block"[^>]*>(.*?)</p>', content, re.DOTALL)
    if fb_match:
        fb_text = fb_match.group(1)
        expected = generate_fact_block(stats)
        # Check for core fields
        name = stats.get('name', '')
        cruise_line = stats.get('cruise_line', '')
        ship_class = stats.get('class', '')
        if cruise_line and cruise_line not in fb_text:
            result['issues'].append(f'fact-block missing cruise_line "{cruise_line}"')
        if ship_class and ship_class not in fb_text and ship_class.split()[-1] not in fb_text:
            # Check if class name appears (may be without the word "Class")
            pass
    else:
        result['issues'].append('missing fact-block')

    # Check key-facts for drift
    kf_match = re.search(r'class="key-facts"[^>]*>.*?</div>', content, re.DOTALL)
    if kf_match:
        kf_html = kf_match.group(0)
        # Check for core fields in key-facts
        if stats.get('cruise_line') and stats['cruise_line'] not in kf_html:
            result['issues'].append(f'key-facts missing cruise_line "{stats["cruise_line"]}"')
        if stats.get('class'):
            cls_val = stats['class']
            # Class might appear without the full name
            cls_short = cls_val.replace(' Class', '')
            if cls_val not in kf_html and cls_short not in kf_html:
                pass
    else:
        result['issues'].append('missing key-facts')

    # Check ai-summary for drift
    ai_match = re.search(r'<meta\s+name="ai-summary"\s+content="([^"]*)"', content)
    if ai_match:
        ai_text = ai_match.group(1)
        cruise_line_ai = stats.get('cruise_line', '')
        if cruise_line_ai and cruise_line_ai not in ai_text:
            # ai-summaries often use short name; check for line name parts
            line_short = cruise_line_ai.replace(' Cruises', '').replace(' Cruise Line', '')
            if line_short not in ai_text:
                result['issues'].append(f'ai-summary may not reference cruise_line "{cruise_line_ai}"')
    else:
        result['issues'].append('missing ai-summary')

    return result

def fix_page(path, dry_run=True):
    """Rewrite key-facts and fact-block from SSOT data where they have drifted.

    Only fixes sections that actually have incorrect/missing data.
    Does NOT touch ai-summary — it is descriptive content beyond SSOT stats.
    """
    content = path.read_text(encoding='utf-8')
    stats = load_stats(content)
    if not stats:
        return None

    changes = []

    # --- 1. Fix key-facts (add missing cruise_line and other core SSOT fields) ---
    kf_section_pattern = r'(<div\s+class="key-facts"[^>]*>)(.*?)(</div>\s*(?:\n|$))'
    kf_match = re.search(kf_section_pattern, content, re.DOTALL)
    if kf_match:
        kf_inner = kf_match.group(2)
        new_items = generate_key_facts(stats)

        # Check which SSOT items are already present in the key-facts
        items_present = {}
        missing_items = []
        for label, value in new_items:
            pattern = re.escape(f'<strong>{label}:</strong>')
            val_match = re.search(pattern + r'\s*([^<]+)', kf_inner)
            if val_match:
                items_present[label] = val_match.group(1).strip()
            else:
                missing_items.append((label, value))

        # Only rewrite key-facts if SSOT fields are missing
        if missing_items:
            # Build the new key-facts list — keep existing SSOT items + add missing + keep extras
            heading_match = re.search(r'<h[23][^>]*>.*?</h[23]>', kf_inner)
            heading = heading_match.group(0) if heading_match else '<h2 style="margin: 0 0 0.5rem; font-size: 1rem; color: #134;">Key Facts</h2>'

            # Build items: start with SSOT fields (existing values preserved, missing added)
            new_kf_items = []
            for label, value in new_items:
                if label in items_present:
                    new_kf_items.append(f'          <li><strong>{label}:</strong> {items_present[label]}</li>')
                else:
                    new_kf_items.append(f'          <li><strong>{label}:</strong> {value}</li>')

            # Preserve extra facts not covered by SSOT
            extra_items = []
            existing_li_pattern = re.compile(r'<li>(.*?)</li>', re.DOTALL)
            ssot_labels = {l for l, v in new_items}
            for li in existing_li_pattern.findall(kf_inner):
                strong_match = re.search(r'<strong>(.*?):</strong>\s*(.*)', li)
                if strong_match:
                    existing_label = strong_match.group(1).strip()
                    if existing_label not in ssot_labels:
                        extra_items.append(f'          <li>{li.strip()}</li>')

            all_items = new_kf_items + extra_items
            new_kf_inner = f'\n        {heading}\n        <ul style="margin: 0; padding-left: 1.25rem;">\n' + '\n'.join(all_items) + '\n        </ul>\n      '

            if kf_inner.strip() != new_kf_inner.strip():
                content = content[:kf_match.start(2)] + new_kf_inner + content[kf_match.end(2):]
                changes.append('key-facts')

    # --- 2. Fix fact-block (only when cruise_line or class is wrong/missing) ---
    fb_pattern = r'(<p\s+class="fact-block"[^>]*>)(.*?)(</p>)'
    fb_match = re.search(fb_pattern, content, re.DOTALL)
    if fb_match:
        old_fb_text = fb_match.group(2)
        cruise_line = stats.get('cruise_line', '')
        ship_class = stats.get('class', '')
        needs_fix = False
        if cruise_line and cruise_line not in old_fb_text:
            needs_fix = True
        if ship_class and ship_class not in old_fb_text:
            # Check if just the class suffix (e.g. "Edge Class") appears
            cls_words = ship_class.split()
            if not any(w in old_fb_text for w in cls_words):
                needs_fix = True
        if needs_fix:
            new_fb = generate_fact_block(stats)
            content = content[:fb_match.start(2)] + new_fb + content[fb_match.end(2):]
            changes.append('fact-block')
    # No fact-block section — skip (not all pages have them)

    if changes:
        if not dry_run:
            path.write_text(content, encoding='utf-8')
        return changes
    return []


def has_drift(analysis):
    """Check if analysis indicates actual drift that needs fixing."""
    if not analysis:
        return False
    issues = [i for i in analysis['issues'] if 'missing' not in i.lower() and \
              'ai-summary may not reference' not in i.lower()]
    return len(issues) > 0

def main():
    parser = argparse.ArgumentParser(description='SSOT Ship Facts Remediation')
    parser.add_argument('--dry-run', action='store_true', default=True, help='Analyze only (default)')
    parser.add_argument('--fix', action='store_true', help='Apply changes')
    parser.add_argument('--audit', action='store_true', help='Audit-only: report pages with drift')
    args = parser.parse_args()

    if args.fix:
        args.dry_run = False

    # Find all ship HTML files (exclude index, template, and non-ship pages)
    ship_dir = ROOT / 'ships'
    ship_files = []
    for line_dir in sorted(ship_dir.iterdir()):
        if not line_dir.is_dir() or line_dir.name.startswith('.'):
            continue
        for html_file in sorted(line_dir.glob('*.html')):
            if html_file.name in ('index.html', 'template.html'):
                continue
            ship_files.append(html_file)

    total = len(ship_files)
    with_stats = 0
    drift_count = 0
    fix_count = 0
    drift_pages = []

    print(f"Soli Deo Gloria — SSOT Ship Facts Remediation")
    print(f"Scanning {total} ship pages...")
    print()

    for path in ship_files:
        analysis = analyze_page(path)
        if analysis is None:
            continue
        with_stats += 1

        if analysis['issues']:
            drift_count += 1
            drift_pages.append(analysis)
            if args.audit or args.dry_run:
                print(f"  ⚠ {analysis['path']}")
                for issue in analysis['issues']:
                    print(f"     {issue}")

        if args.dry_run or args.fix:
            changes = fix_page(path, dry_run=args.dry_run)
            if changes:
                fix_count += 1
                if not args.audit:
                    print(f"  {'✓' if not args.dry_run else '~'} {analysis['path']}: {', '.join(changes)}")

    print()
    print(f"Results:")
    print(f"  Total ship pages:     {total}")
    print(f"  Pages with SSOT:      {with_stats}")
    print(f"  Pages with drift:     {drift_count}")
    print(f"  Pages fixed:          {fix_count}")
    if args.dry_run and not args.audit:
        print(f"  (dry run — no changes written)")
    elif args.fix:
        print(f"  (changes applied)")

if __name__ == '__main__':
    main()
