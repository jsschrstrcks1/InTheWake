#!/usr/bin/env python3
"""
Comprehensive Site Audit Script
Checks for: broken links, orphan files, lint issues, edge cases
Excludes: /vendors/, /solo/articles/
"""

import os
import re
import json
from pathlib import Path
from collections import defaultdict
from html.parser import HTMLParser
from urllib.parse import urlparse, unquote

BASE_DIR = Path("/home/user/InTheWake")
EXCLUDE_DIRS = {"vendors", "node_modules"}
EXCLUDE_PATHS = {"/solo/articles/"}

# Results storage
broken_links = []
json_broken_refs = []
orphan_files = []
lint_issues = []
edge_cases = []

# Track all files and references
all_files = set()
referenced_files = set()
html_files = []
json_files = []
js_files = []
css_files = []

class LinkExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
        self.images = []
        self.scripts = []
        self.stylesheets = []
        self.current_file = ""
        self.line_num = 0

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        if tag == 'a' and 'href' in attrs_dict:
            self.links.append(attrs_dict['href'])
        elif tag == 'img' and 'src' in attrs_dict:
            self.images.append(attrs_dict['src'])
        elif tag == 'script' and 'src' in attrs_dict:
            self.scripts.append(attrs_dict['src'])
        elif tag == 'link' and attrs_dict.get('rel') == 'stylesheet' and 'href' in attrs_dict:
            self.stylesheets.append(attrs_dict['href'])
        elif tag == 'source' and 'srcset' in attrs_dict:
            self.images.append(attrs_dict['srcset'].split()[0])

def should_exclude(path):
    """Check if path should be excluded"""
    path_str = str(path)
    for exclude in EXCLUDE_DIRS:
        if f"/{exclude}/" in path_str or path_str.endswith(f"/{exclude}"):
            return True
    for exclude in EXCLUDE_PATHS:
        if exclude in path_str:
            return True
    return False

def collect_files():
    """Collect all files in the project"""
    for root, dirs, files in os.walk(BASE_DIR):
        # Skip excluded directories
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]

        for file in files:
            filepath = Path(root) / file
            if should_exclude(filepath):
                continue

            rel_path = filepath.relative_to(BASE_DIR)
            all_files.add(str(rel_path))

            if file.endswith('.html'):
                html_files.append(filepath)
            elif file.endswith('.json'):
                json_files.append(filepath)
            elif file.endswith('.js'):
                js_files.append(filepath)
            elif file.endswith('.css'):
                css_files.append(filepath)

def resolve_link(link, current_file):
    """Resolve a relative link to absolute path"""
    if not link:
        return None

    # Skip external links, anchors, javascript, mailto, tel
    if link.startswith(('http://', 'https://', '#', 'javascript:', 'mailto:', 'tel:', 'data:')):
        return None

    # Handle absolute paths
    if link.startswith('/'):
        resolved = BASE_DIR / link.lstrip('/')
    else:
        # Relative path
        current_dir = current_file.parent
        resolved = current_dir / link

    # Normalize and remove query strings/anchors
    resolved = Path(str(resolved).split('?')[0].split('#')[0])

    try:
        resolved = resolved.resolve()
        return resolved
    except:
        return resolved

def check_html_links():
    """Check all internal links in HTML files"""
    print(f"Checking {len(html_files)} HTML files for broken links...")

    for html_file in html_files:
        try:
            with open(html_file, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
        except Exception as e:
            lint_issues.append({
                'file': str(html_file.relative_to(BASE_DIR)),
                'issue': f"Cannot read file: {e}",
                'type': 'read_error'
            })
            continue

        parser = LinkExtractor()
        try:
            parser.feed(content)
        except Exception as e:
            lint_issues.append({
                'file': str(html_file.relative_to(BASE_DIR)),
                'issue': f"HTML parse error: {e}",
                'type': 'parse_error'
            })
            continue

        rel_file = str(html_file.relative_to(BASE_DIR))

        # Check all links
        all_refs = parser.links + parser.images + parser.scripts + parser.stylesheets

        for ref in all_refs:
            if not ref:
                continue

            resolved = resolve_link(ref, html_file)
            if resolved is None:
                continue

            # Track referenced files
            try:
                rel_resolved = resolved.relative_to(BASE_DIR)
                referenced_files.add(str(rel_resolved))
            except ValueError:
                pass

            # Check if file exists
            if not resolved.exists():
                # Check for common variations
                variations = [
                    resolved,
                    resolved.with_suffix('.html'),
                    resolved / 'index.html'
                ]

                found = False
                for var in variations:
                    if var.exists():
                        found = True
                        break

                if not found:
                    broken_links.append({
                        'file': rel_file,
                        'broken_link': ref,
                        'resolved_to': str(resolved),
                        'type': 'link' if ref in parser.links else 'resource'
                    })

def check_json_files():
    """Check JSON files for broken references"""
    print(f"Checking {len(json_files)} JSON files...")

    url_pattern = re.compile(r'["\']([^"\']*\.(html|jpg|jpeg|png|webp|gif|svg|js|css|json))["\']', re.IGNORECASE)
    path_pattern = re.compile(r'["\'](/[^"\']+)["\']')

    for json_file in json_files:
        try:
            with open(json_file, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
        except Exception as e:
            lint_issues.append({
                'file': str(json_file.relative_to(BASE_DIR)),
                'issue': f"Cannot read file: {e}",
                'type': 'read_error'
            })
            continue

        # Validate JSON syntax
        try:
            json.loads(content)
        except json.JSONDecodeError as e:
            lint_issues.append({
                'file': str(json_file.relative_to(BASE_DIR)),
                'issue': f"Invalid JSON: {e}",
                'type': 'json_error'
            })

        rel_file = str(json_file.relative_to(BASE_DIR))

        # Find all path-like references
        for match in path_pattern.finditer(content):
            ref = match.group(1)
            if ref.startswith('/'):
                resolved = BASE_DIR / ref.lstrip('/')
                resolved = Path(str(resolved).split('?')[0].split('#')[0])

                if not resolved.exists() and not ref.startswith('http'):
                    # Skip obvious non-file paths
                    if not any(x in ref for x in ['{{', '{%', '${', 'search?']):
                        json_broken_refs.append({
                            'file': rel_file,
                            'broken_ref': ref,
                            'resolved_to': str(resolved)
                        })
                else:
                    try:
                        rel_resolved = resolved.relative_to(BASE_DIR)
                        referenced_files.add(str(rel_resolved))
                    except ValueError:
                        pass

def find_orphan_files():
    """Find files that are never referenced"""
    print("Finding orphan files...")

    # Additional patterns to search for references in JS files
    for js_file in js_files:
        try:
            with open(js_file, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()

            # Find string references to files
            file_refs = re.findall(r'["\']([^"\']*\.(html|json|jpg|jpeg|png|webp|gif|svg|css))["\']', content, re.IGNORECASE)
            for ref, _ in file_refs:
                if '/' in ref:
                    clean_ref = ref.lstrip('/').split('?')[0].split('#')[0]
                    referenced_files.add(clean_ref)
        except:
            pass

    # Check CSS for url() references
    for css_file in css_files:
        try:
            with open(css_file, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()

            url_refs = re.findall(r'url\(["\']?([^)"\']+)["\']?\)', content)
            for ref in url_refs:
                if not ref.startswith(('http', 'data:')):
                    clean_ref = ref.lstrip('/').split('?')[0].split('#')[0]
                    referenced_files.add(clean_ref)
        except:
            pass

    # Find orphans - files never referenced
    for file in all_files:
        # Skip certain file types that are entry points
        if file.endswith(('index.html', 'sitemap.xml', 'robots.txt', '.md', '.py', '.txt')):
            continue
        if file.startswith(('admin/', 'standards/', '.', 'CLAUDE', 'README', 'UNFINISHED')):
            continue

        # Check if file is referenced
        filename = Path(file).name
        if file not in referenced_files and filename not in [Path(r).name for r in referenced_files]:
            # Double check - look for filename in all HTML
            found = False
            for html_file in html_files[:50]:  # Sample check
                try:
                    with open(html_file, 'r', encoding='utf-8', errors='ignore') as f:
                        if filename in f.read():
                            found = True
                            break
                except:
                    pass

            if not found:
                orphan_files.append(file)

def check_lint_issues():
    """Check for common lint issues"""
    print("Checking for lint issues...")

    # Blocked video IDs (Rick Rolls and other problematic videos)
    BLOCKED_VIDEO_IDS = {
        'dQw4w9WgXcQ',  # Never Gonna Give You Up (Rick Roll)
        'oHg5SJYRHA0',  # Never Gonna Give You Up (alternate)
        'xvFZjo5PgG0',  # Never Gonna Give You Up (another variant)
    }

    # Valid dining hero image patterns (must contain these keywords)
    VALID_DINING_PATTERNS = [
        'dining', 'food', 'restaurant', 'buffet', 'cafe', 'kitchen',
        'cordelia', 'windjammer', 'mdr', 'venue', 'meal'
    ]

    for html_file in html_files:
        try:
            with open(html_file, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                lines = content.split('\n')
        except:
            continue

        rel_file = str(html_file.relative_to(BASE_DIR))

        # Check for common issues

        # 1. Missing DOCTYPE
        if not content.strip().lower().startswith('<!doctype'):
            lint_issues.append({
                'file': rel_file,
                'issue': 'Missing DOCTYPE declaration',
                'type': 'missing_doctype'
            })

        # 2. Missing lang attribute
        if '<html' in content and 'lang=' not in content[:500]:
            lint_issues.append({
                'file': rel_file,
                'issue': 'Missing lang attribute on <html>',
                'type': 'accessibility'
            })

        # 3. Missing title
        if '<title>' not in content and '<title ' not in content:
            lint_issues.append({
                'file': rel_file,
                'issue': 'Missing <title> tag',
                'type': 'seo'
            })

        # 4. Empty alt attributes (accessibility)
        empty_alts = re.findall(r'<img[^>]*alt\s*=\s*["\']["\'][^>]*>', content)
        if empty_alts:
            lint_issues.append({
                'file': rel_file,
                'issue': f'Found {len(empty_alts)} images with empty alt attributes',
                'type': 'accessibility'
            })

        # 5. Missing alt attributes
        imgs_without_alt = re.findall(r'<img(?![^>]*alt=)[^>]*>', content)
        if imgs_without_alt:
            lint_issues.append({
                'file': rel_file,
                'issue': f'Found {len(imgs_without_alt)} images missing alt attribute',
                'type': 'accessibility'
            })

        # 6. Multiple H1 tags
        h1_count = len(re.findall(r'<h1[^>]*>', content))
        if h1_count > 1:
            lint_issues.append({
                'file': rel_file,
                'issue': f'Multiple H1 tags found ({h1_count})',
                'type': 'seo'
            })

        # 7. Inline styles (code smell)
        inline_styles = len(re.findall(r'style\s*=\s*["\']', content))
        if inline_styles > 10:
            lint_issues.append({
                'file': rel_file,
                'issue': f'Excessive inline styles ({inline_styles})',
                'type': 'code_quality'
            })

        # 8. Console.log statements
        console_logs = len(re.findall(r'console\.(log|warn|error)', content))
        if console_logs > 0:
            lint_issues.append({
                'file': rel_file,
                'issue': f'Found {console_logs} console statements',
                'type': 'debug_code'
            })

        # 9. TODO/FIXME comments
        todos = len(re.findall(r'(TODO|FIXME|XXX|HACK)', content, re.IGNORECASE))
        if todos > 0:
            lint_issues.append({
                'file': rel_file,
                'issue': f'Found {todos} TODO/FIXME comments',
                'type': 'incomplete'
            })

        # 10. Deprecated HTML tags
        deprecated = re.findall(r'<(font|center|marquee|blink)[^>]*>', content, re.IGNORECASE)
        if deprecated:
            lint_issues.append({
                'file': rel_file,
                'issue': f'Deprecated HTML tags: {", ".join(set(d.lower() for d in deprecated))}',
                'type': 'deprecated'
            })

        # 11. CRITICAL: Blocked YouTube video IDs (Rick Rolls, etc.)
        for blocked_id in BLOCKED_VIDEO_IDS:
            if blocked_id in content:
                lint_issues.append({
                    'file': rel_file,
                    'issue': f'BLOCKED VIDEO ID DETECTED: {blocked_id} (Rick Roll or similar)',
                    'type': 'blocked_video'
                })

        # 12. CRITICAL: Ship pages must use dining images for dining hero (not ship images)
        if '/ships/' in rel_file and rel_file.endswith('.html'):
            dining_hero_match = re.search(r'id=["\']dining-hero["\'][^>]*src=["\']([^"\']+)["\']', content)
            if dining_hero_match:
                dining_src = dining_hero_match.group(1).lower()
                # Check if it looks like a ship image instead of a dining image
                is_ship_image = any(x in dining_src for x in ['/ships/', '-of-the-seas', 'ship_', '_ship'])
                is_valid_dining = any(pattern in dining_src for pattern in VALID_DINING_PATTERNS)
                if is_ship_image and not is_valid_dining:
                    lint_issues.append({
                        'file': rel_file,
                        'issue': f'INVALID DINING HERO: Ship image used instead of dining image ({dining_src})',
                        'type': 'invalid_dining_hero'
                    })

def check_edge_cases():
    """Check for edge cases and potential issues"""
    print("Checking for edge cases...")

    for html_file in html_files:
        try:
            with open(html_file, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
        except:
            continue

        rel_file = str(html_file.relative_to(BASE_DIR))

        # 1. Very long lines (potential minification issues)
        lines = content.split('\n')
        for i, line in enumerate(lines, 1):
            if len(line) > 5000:
                edge_cases.append({
                    'file': rel_file,
                    'issue': f'Line {i} is {len(line)} chars (may cause issues)',
                    'type': 'long_line'
                })
                break

        # 2. Mixed content (http in https context)
        if 'http://' in content and 'https://' in content:
            http_refs = re.findall(r'(src|href)\s*=\s*["\']http://[^"\']+["\']', content)
            if http_refs:
                edge_cases.append({
                    'file': rel_file,
                    'issue': f'Mixed content: {len(http_refs)} HTTP resources in page',
                    'type': 'mixed_content'
                })

        # 3. Unclosed tags (basic check)
        opens = len(re.findall(r'<div[^>]*>', content))
        closes = len(re.findall(r'</div>', content))
        if abs(opens - closes) > 2:
            edge_cases.append({
                'file': rel_file,
                'issue': f'Possible unclosed div tags (opens: {opens}, closes: {closes})',
                'type': 'unclosed_tag'
            })

        # 4. Empty href/src
        empty_hrefs = re.findall(r'href\s*=\s*["\']["\']', content)
        if empty_hrefs:
            edge_cases.append({
                'file': rel_file,
                'issue': f'Found {len(empty_hrefs)} empty href attributes',
                'type': 'empty_attribute'
            })

        # 5. Duplicate IDs
        ids = re.findall(r'id\s*=\s*["\']([^"\']+)["\']', content)
        seen = set()
        duplicates = set()
        for id_val in ids:
            if id_val in seen:
                duplicates.add(id_val)
            seen.add(id_val)
        if duplicates:
            edge_cases.append({
                'file': rel_file,
                'issue': f'Duplicate IDs: {", ".join(list(duplicates)[:5])}',
                'type': 'duplicate_id'
            })

        # 6. Missing viewport meta
        if '<meta' in content and 'viewport' not in content:
            edge_cases.append({
                'file': rel_file,
                'issue': 'Missing viewport meta tag (mobile issues)',
                'type': 'mobile'
            })

        # 7. Form without action
        forms_no_action = re.findall(r'<form(?![^>]*action=)[^>]*>', content)
        if forms_no_action:
            edge_cases.append({
                'file': rel_file,
                'issue': f'Found {len(forms_no_action)} forms without action attribute',
                'type': 'form'
            })

        # 8. Script in head without defer/async
        head_match = re.search(r'<head[^>]*>(.*?)</head>', content, re.DOTALL | re.IGNORECASE)
        if head_match:
            head_content = head_match.group(1)
            blocking_scripts = re.findall(r'<script[^>]*src=[^>]*>(?!</script>)*</script>', head_content)
            blocking = [s for s in blocking_scripts if 'defer' not in s and 'async' not in s]
            if len(blocking) > 2:
                edge_cases.append({
                    'file': rel_file,
                    'issue': f'{len(blocking)} render-blocking scripts in head',
                    'type': 'performance'
                })

        # 9. Placeholder text left in
        placeholders = re.findall(r'(Lorem ipsum|placeholder|coming soon|under construction)', content, re.IGNORECASE)
        if placeholders:
            edge_cases.append({
                'file': rel_file,
                'issue': f'Placeholder text found: {placeholders[0]}',
                'type': 'placeholder'
            })

        # 10. Broken JSON-LD
        jsonld_matches = re.findall(r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>', content, re.DOTALL)
        for jsonld in jsonld_matches:
            try:
                json.loads(jsonld)
            except json.JSONDecodeError as e:
                edge_cases.append({
                    'file': rel_file,
                    'issue': f'Invalid JSON-LD: {str(e)[:50]}',
                    'type': 'structured_data'
                })

def generate_report():
    """Generate the audit report"""
    print("\n" + "="*80)
    print("COMPREHENSIVE SITE AUDIT REPORT")
    print("="*80)

    print(f"\nFiles Audited: {len(all_files)}")
    print(f"  - HTML: {len(html_files)}")
    print(f"  - JSON: {len(json_files)}")
    print(f"  - JS: {len(js_files)}")
    print(f"  - CSS: {len(css_files)}")

    print("\n" + "-"*80)
    print("1. BROKEN INTERNAL LINKS")
    print("-"*80)
    if broken_links:
        print(f"\nFound {len(broken_links)} broken links:\n")
        for item in sorted(broken_links, key=lambda x: x['file']):
            print(f"  File: {item['file']}")
            print(f"    Broken: {item['broken_link']}")
            print(f"    Resolved to: {item['resolved_to']}")
            print()
    else:
        print("\nNo broken links found!")

    print("\n" + "-"*80)
    print("2. BROKEN JSON REFERENCES")
    print("-"*80)
    if json_broken_refs:
        print(f"\nFound {len(json_broken_refs)} broken JSON references:\n")
        for item in sorted(json_broken_refs, key=lambda x: x['file']):
            print(f"  File: {item['file']}")
            print(f"    Broken: {item['broken_ref']}")
            print()
    else:
        print("\nNo broken JSON references found!")

    print("\n" + "-"*80)
    print("3. LINT ISSUES")
    print("-"*80)
    if lint_issues:
        # Group by type
        by_type = defaultdict(list)
        for item in lint_issues:
            by_type[item['type']].append(item)

        print(f"\nFound {len(lint_issues)} lint issues:\n")
        for issue_type, items in sorted(by_type.items()):
            print(f"\n  [{issue_type.upper()}] ({len(items)} issues)")
            for item in items[:10]:  # Show first 10 of each type
                print(f"    - {item['file']}: {item['issue']}")
            if len(items) > 10:
                print(f"    ... and {len(items) - 10} more")
    else:
        print("\nNo lint issues found!")

    print("\n" + "-"*80)
    print("4. ORPHAN FILES")
    print("-"*80)
    if orphan_files:
        print(f"\nFound {len(orphan_files)} potentially orphaned files:\n")
        for f in sorted(orphan_files)[:50]:
            print(f"  - {f}")
        if len(orphan_files) > 50:
            print(f"  ... and {len(orphan_files) - 50} more")
    else:
        print("\nNo orphan files found!")

    print("\n" + "-"*80)
    print("5. EDGE CASES")
    print("-"*80)
    if edge_cases:
        # Group by type
        by_type = defaultdict(list)
        for item in edge_cases:
            by_type[item['type']].append(item)

        print(f"\nFound {len(edge_cases)} edge case issues:\n")
        for issue_type, items in sorted(by_type.items()):
            print(f"\n  [{issue_type.upper()}] ({len(items)} issues)")
            for item in items[:10]:
                print(f"    - {item['file']}: {item['issue']}")
            if len(items) > 10:
                print(f"    ... and {len(items) - 10} more")
    else:
        print("\nNo edge cases found!")

    print("\n" + "="*80)
    print("SUMMARY")
    print("="*80)
    print(f"\nTotal Issues Found: {len(broken_links) + len(json_broken_refs) + len(lint_issues) + len(orphan_files) + len(edge_cases)}")
    print(f"  - Broken Links: {len(broken_links)}")
    print(f"  - Broken JSON Refs: {len(json_broken_refs)}")
    print(f"  - Lint Issues: {len(lint_issues)}")
    print(f"  - Orphan Files: {len(orphan_files)}")
    print(f"  - Edge Cases: {len(edge_cases)}")

    # Return data for JSON output
    return {
        'files_audited': {
            'total': len(all_files),
            'html': len(html_files),
            'json': len(json_files),
            'js': len(js_files),
            'css': len(css_files)
        },
        'broken_links': broken_links,
        'json_broken_refs': json_broken_refs,
        'lint_issues': lint_issues,
        'orphan_files': orphan_files,
        'edge_cases': edge_cases
    }

if __name__ == "__main__":
    print("Starting comprehensive site audit...")
    print(f"Base directory: {BASE_DIR}")
    print(f"Excluding: {EXCLUDE_DIRS}, {EXCLUDE_PATHS}\n")

    # Run all checks
    collect_files()
    check_html_links()
    check_json_files()
    find_orphan_files()
    check_lint_issues()
    check_edge_cases()

    # Generate report
    report_data = generate_report()

    # Save JSON report
    with open(BASE_DIR / 'admin' / 'COMPREHENSIVE_AUDIT_2025_11_19.json', 'w') as f:
        json.dump(report_data, f, indent=2)

    print(f"\nJSON report saved to: admin/COMPREHENSIVE_AUDIT_2025_11_19.json")
