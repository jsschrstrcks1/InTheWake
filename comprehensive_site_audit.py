#!/usr/bin/env python3
"""
Comprehensive Site Audit Script
Checks for: broken links, orphan files, lint issues, edge cases
Excludes: /vendors/, /solo/articles/
"""

import os
import re
import json
import time
from pathlib import Path
from collections import defaultdict
from html.parser import HTMLParser
from urllib.parse import urlparse, unquote
import urllib.request
import urllib.error

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
video_issues = []

# Video validation configuration
VALID_VIDEO_CATEGORIES = {
    'walkthrough': ['walkthrough', 'full tour', 'ship tour', 'full ship', 'complete tour'],
    'review': ['review', 'honest review', 'cruise review'],
    'stateroom_interior': ['interior', 'inside cabin', 'inside stateroom', 'interior cabin', 'interior stateroom'],
    'stateroom_oceanview': ['ocean view', 'oceanview', 'porthole', 'window cabin'],
    'stateroom_balcony': ['balcony', 'verandah', 'veranda'],
    'stateroom_suite': ['suite', 'royal suite', 'owner suite', 'grand suite', 'loft suite', 'sky suite', 'junior suite'],
    'accessibility': ['accessible', 'accessibility', 'wheelchair', 'mobility', 'disability', 'disabilities'],
    'dining': ['dining', 'food', 'restaurant', 'buffet', 'windjammer', 'specialty', 'main dining'],
    'activities': ['activities', 'entertainment', 'pool', 'deck', 'shows', 'casino'],
    'cabin_tour': ['cabin', 'room tour', 'stateroom tour', 'cabin tour'],
    'general': ['cruise', 'royal caribbean', 'carnival', 'norwegian', 'princess', 'celebrity', 'msc']
}

# Cache for YouTube metadata to avoid repeated API calls
youtube_metadata_cache = {}

def get_youtube_metadata(video_id, max_retries=2):
    """
    Fetch YouTube video metadata using oEmbed API (no API key required).
    Returns dict with 'title', 'author_name' or None if failed.
    """
    if video_id in youtube_metadata_cache:
        return youtube_metadata_cache[video_id]

    oembed_url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={video_id}&format=json"

    for attempt in range(max_retries):
        try:
            req = urllib.request.Request(
                oembed_url,
                headers={'User-Agent': 'Mozilla/5.0 (compatible; SiteAudit/1.0)'}
            )
            with urllib.request.urlopen(req, timeout=10) as response:
                data = json.loads(response.read().decode('utf-8'))
                result = {
                    'title': data.get('title', ''),
                    'author_name': data.get('author_name', ''),
                    'video_id': video_id
                }
                youtube_metadata_cache[video_id] = result
                return result
        except urllib.error.HTTPError as e:
            if e.code == 404:
                # Video doesn't exist or is private
                result = {'error': 'not_found', 'video_id': video_id}
                youtube_metadata_cache[video_id] = result
                return result
            elif e.code == 429:
                # Rate limited, wait and retry
                time.sleep(2 ** attempt)
                continue
        except Exception as e:
            if attempt < max_retries - 1:
                time.sleep(1)
                continue
            result = {'error': str(e), 'video_id': video_id}
            youtube_metadata_cache[video_id] = result
            return result

    result = {'error': 'max_retries', 'video_id': video_id}
    youtube_metadata_cache[video_id] = result
    return result

def extract_ship_name_from_path(file_path):
    """
    Extract ship name from file path.
    e.g., /ships/rcl/quantum-of-the-seas.html -> 'quantum of the seas'
    """
    path = str(file_path)

    # Match ship page pattern: ships/{cruise_line}/{ship-name}.html
    match = re.search(r'/ships/[^/]+/([^/]+)\.html$', path)
    if match:
        ship_slug = match.group(1)
        # Convert slug to name: quantum-of-the-seas -> quantum of the seas
        return ship_slug.replace('-', ' ')

    return None

def validate_video_for_ship(video_id, ship_name, check_metadata=True):
    """
    Validate that a YouTube video is related to the given ship.
    Returns dict with 'valid', 'reason', 'title', 'category'
    """
    result = {
        'valid': False,
        'reason': '',
        'title': None,
        'category': None,
        'video_id': video_id
    }

    if not check_metadata:
        result['valid'] = True
        result['reason'] = 'metadata_check_disabled'
        return result

    metadata = get_youtube_metadata(video_id)

    if not metadata:
        result['reason'] = 'could_not_fetch_metadata'
        return result

    if 'error' in metadata:
        if metadata['error'] == 'not_found':
            result['reason'] = 'video_not_found_or_private'
            result['type'] = 'not_found'
        elif metadata['error'] == 'max_retries':
            result['reason'] = 'video_not_found_or_invalid'
            result['type'] = 'not_found'
        else:
            result['reason'] = f"metadata_error: {metadata['error']}"
            result['type'] = 'metadata_error'
        return result

    title = metadata.get('title', '').lower()
    result['title'] = metadata.get('title', '')

    # Check if ship name is in the title
    ship_name_lower = ship_name.lower() if ship_name else ''
    ship_name_variations = [ship_name_lower]

    # Add common variations (e.g., "quantum" for "quantum of the seas")
    if ' of the ' in ship_name_lower:
        ship_name_variations.append(ship_name_lower.split(' of the ')[0])

    ship_mentioned = any(var in title for var in ship_name_variations if var)

    # Check what category the video falls into
    matched_category = None
    for category, keywords in VALID_VIDEO_CATEGORIES.items():
        if any(kw.lower() in title for kw in keywords):
            matched_category = category
            break

    result['category'] = matched_category

    # Validation logic
    if ship_mentioned:
        if matched_category:
            result['valid'] = True
            result['reason'] = f'ship_mentioned_and_category_{matched_category}'
        else:
            # Ship is mentioned but no recognizable category - still okay
            result['valid'] = True
            result['reason'] = 'ship_mentioned_general_content'
    else:
        # Ship not mentioned - could be generic cruise content
        if matched_category == 'general':
            result['valid'] = True
            result['reason'] = 'general_cruise_content'
        elif matched_category:
            result['reason'] = f'ship_not_mentioned_but_category_{matched_category}'
            result['valid'] = False
        else:
            result['reason'] = 'ship_not_mentioned_no_category'
            result['valid'] = False

    return result

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

def check_video_metadata(validate_online=True, max_videos=None):
    """
    Check YouTube videos in ship pages to ensure they're related to the ship
    and match expected categories.

    Checks both:
    1. External video JSON files in assets/data/videos/ and ships/*/assets/
    2. Inline videos-data JSON blocks in HTML

    Args:
        validate_online: If True, fetches metadata from YouTube API
        max_videos: Maximum videos to check (for testing), None = all
    """
    print("Checking YouTube video metadata...")

    videos_checked = 0
    video_json_files = []

    # Find all video JSON files in assets/data/videos/
    videos_dir = BASE_DIR / 'assets' / 'data' / 'videos'
    if videos_dir.exists():
        for json_path in videos_dir.rglob('*.json'):
            if json_path.stem not in ['index', 'manifest']:
                video_json_files.append(json_path)

    # Find all *-videos.json files in ships/*/assets/
    ships_dir = BASE_DIR / 'ships'
    if ships_dir.exists():
        for json_path in ships_dir.rglob('*-videos.json'):
            video_json_files.append(json_path)

    print(f"  Found {len(video_json_files)} video JSON files to check")

    for json_file in video_json_files:
        if max_videos and videos_checked >= max_videos:
            break

        rel_file = str(json_file.relative_to(BASE_DIR))

        # Extract ship name from filename
        # e.g., carnival-breeze.json -> carnival breeze
        # e.g., quantum-of-the-seas-videos.json -> quantum of the seas
        ship_slug = json_file.stem.replace('-videos', '')
        ship_name = ship_slug.replace('-', ' ')

        try:
            with open(json_file, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                videos_json = json.loads(content)
        except json.JSONDecodeError as e:
            video_issues.append({
                'file': rel_file,
                'ship': ship_name,
                'issue': f'Invalid JSON: {str(e)[:50]}',
                'type': 'json_parse_error'
            })
            continue
        except Exception:
            continue

        videos = videos_json.get('videos', [])

        for video in videos:
            if max_videos and videos_checked >= max_videos:
                break

            video_id = video.get('youtube_id') or video.get('videoId')
            if not video_id:
                continue

            # Skip blocked video IDs (already checked elsewhere)
            if video_id in {'dQw4w9WgXcQ', 'oHg5SJYRHA0', 'xvFZjo5PgG0'}:
                continue

            videos_checked += 1

            if validate_online:
                result = validate_video_for_ship(video_id, ship_name)

                if not result['valid']:
                    issue_detail = f"Video {video_id}"
                    if result['title']:
                        issue_detail += f" ('{result['title'][:50]}...')" if len(result.get('title', '')) > 50 else f" ('{result['title']}')"
                    issue_detail += f" - {result['reason']}"

                    # Use type from result if available, otherwise default to unrelated_video
                    issue_type = result.get('type', 'unrelated_video')

                    video_issues.append({
                        'file': rel_file,
                        'ship': ship_name,
                        'video_id': video_id,
                        'title': result.get('title'),
                        'category': result.get('category'),
                        'reason': result['reason'],
                        'issue': issue_detail,
                        'type': issue_type
                    })

    # Also check inline videos-data blocks in ship HTML pages
    ship_pages = [f for f in html_files if '/ships/' in str(f) and str(f).endswith('.html')]

    for html_file in ship_pages:
        if max_videos and videos_checked >= max_videos:
            break

        rel_file = str(html_file.relative_to(BASE_DIR))
        ship_name = extract_ship_name_from_path(html_file)

        if not ship_name:
            continue

        try:
            with open(html_file, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
        except:
            continue

        # Find inline videos-data JSON block
        videos_match = re.search(
            r'<script[^>]*id=["\']videos-data["\'][^>]*>(.*?)</script>',
            content,
            re.DOTALL
        )

        if not videos_match:
            continue

        try:
            videos_json = json.loads(videos_match.group(1))
            videos = videos_json.get('videos', [])
        except json.JSONDecodeError:
            video_issues.append({
                'file': rel_file,
                'ship': ship_name,
                'issue': 'Invalid JSON in videos-data block',
                'type': 'json_parse_error'
            })
            continue

        for video in videos:
            if max_videos and videos_checked >= max_videos:
                break

            video_id = video.get('youtube_id') or video.get('videoId')
            if not video_id:
                continue

            # Skip blocked video IDs
            if video_id in {'dQw4w9WgXcQ', 'oHg5SJYRHA0', 'xvFZjo5PgG0'}:
                continue

            videos_checked += 1

            if validate_online:
                result = validate_video_for_ship(video_id, ship_name)

                if not result['valid']:
                    issue_detail = f"Video {video_id}"
                    if result['title']:
                        issue_detail += f" ('{result['title'][:50]}...')" if len(result.get('title', '')) > 50 else f" ('{result['title']}')"
                    issue_detail += f" - {result['reason']}"

                    # Use type from result if available, otherwise default to unrelated_video
                    issue_type = result.get('type', 'unrelated_video')

                    video_issues.append({
                        'file': rel_file,
                        'ship': ship_name,
                        'video_id': video_id,
                        'title': result.get('title'),
                        'category': result.get('category'),
                        'reason': result['reason'],
                        'issue': issue_detail,
                        'type': issue_type
                    })

    print(f"  Checked {videos_checked} videos total")

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

    print("\n" + "-"*80)
    print("6. VIDEO METADATA ISSUES")
    print("-"*80)
    if video_issues:
        # Group by type
        by_type = defaultdict(list)
        for item in video_issues:
            by_type[item['type']].append(item)

        print(f"\nFound {len(video_issues)} video issues:\n")
        for issue_type, items in sorted(by_type.items()):
            print(f"\n  [{issue_type.upper()}] ({len(items)} issues)")
            for item in items[:15]:
                print(f"    - {item['file']}: {item['issue']}")
            if len(items) > 15:
                print(f"    ... and {len(items) - 15} more")
    else:
        print("\nNo video metadata issues found!")

    print("\n" + "="*80)
    print("SUMMARY")
    print("="*80)
    total_issues = len(broken_links) + len(json_broken_refs) + len(lint_issues) + len(orphan_files) + len(edge_cases) + len(video_issues)
    print(f"\nTotal Issues Found: {total_issues}")
    print(f"  - Broken Links: {len(broken_links)}")
    print(f"  - Broken JSON Refs: {len(json_broken_refs)}")
    print(f"  - Lint Issues: {len(lint_issues)}")
    print(f"  - Orphan Files: {len(orphan_files)}")
    print(f"  - Edge Cases: {len(edge_cases)}")
    print(f"  - Video Issues: {len(video_issues)}")

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
        'edge_cases': edge_cases,
        'video_issues': video_issues
    }

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description='Comprehensive Site Audit')
    parser.add_argument('--skip-video-check', action='store_true',
                        help='Skip YouTube video metadata validation (faster)')
    parser.add_argument('--max-videos', type=int, default=None,
                        help='Limit number of videos to check (for testing)')
    args = parser.parse_args()

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

    # Video metadata check (can be slow due to API calls)
    if not args.skip_video_check:
        check_video_metadata(validate_online=True, max_videos=args.max_videos)
    else:
        print("Skipping YouTube video metadata check (--skip-video-check)")

    # Generate report
    report_data = generate_report()

    # Save JSON report
    from datetime import datetime
    report_filename = f'COMPREHENSIVE_AUDIT_{datetime.now().strftime("%Y_%m_%d")}.json'
    with open(BASE_DIR / 'admin' / report_filename, 'w') as f:
        json.dump(report_data, f, indent=2)

    print(f"\nJSON report saved to: admin/{report_filename}")
