#!/usr/bin/env python3
"""
Comprehensive WebP audit - compare files vs code references
"""
import glob
import os
import re

print("=" * 80)
print("COMPREHENSIVE WEBP AUDIT")
print("=" * 80)
print()

# 1. Find all WebP files
webp_files = set()
for filepath in glob.glob('assets/ships/*.webp'):
    webp_files.add(os.path.basename(filepath))

print(f"✓ Found {len(webp_files)} WebP files in assets/ships/")
print()

# 2. Find corresponding JPG/JPEG files
jpg_files = set()
for filepath in glob.glob('assets/ships/*.jpg') + glob.glob('assets/ships/*.jpeg'):
    jpg_files.add(os.path.basename(filepath))

print(f"✓ Found {len(jpg_files)} JPG/JPEG files in assets/ships/")
print()

# 3. Check which WebP files have JPG equivalents
webp_with_jpg = set()
for webp in webp_files:
    base = webp.replace('.webp', '')
    jpg_equiv = base + '.jpg'
    jpeg_equiv = base + '.jpeg'
    if jpg_equiv in jpg_files or jpeg_equiv in jpg_files:
        webp_with_jpg.add(webp)

print(f"✓ {len(webp_with_jpg)} WebP files have JPG/JPEG equivalents")
print(f"  (These are ready to use - just need code updates)")
print()

# 4. Scan all HTML files for image references
html_jpg_refs = {}
html_webp_refs = {}

for pattern in ['*.html', '*/*.html', '*/*/*.html']:
    for filepath in glob.glob(pattern):
        if 'vendors/' in filepath or 'solo/articles/' in filepath:
            continue
        
        try:
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            
            # Count .jpg/.jpeg references in assets/ships
            jpg_matches = re.findall(r'assets/ships/[^"\s]+\.(?:jpg|jpeg)', content, re.IGNORECASE)
            if jpg_matches:
                html_jpg_refs[filepath] = len(jpg_matches)
            
            # Count .webp references in assets/ships
            webp_matches = re.findall(r'assets/ships/[^"\s]+\.webp', content, re.IGNORECASE)
            if webp_matches:
                html_webp_refs[filepath] = len(webp_matches)
        except:
            pass

print("=" * 80)
print("HTML FILES ANALYSIS")
print("=" * 80)
print(f"Files with JPG/JPEG refs: {len(html_jpg_refs)}")
print(f"Files with WebP refs: {len(html_webp_refs)}")
print()

if html_jpg_refs:
    print("Top 10 files with most JPG/JPEG references:")
    for filepath, count in sorted(html_jpg_refs.items(), key=lambda x: -x[1])[:10]:
        print(f"  {filepath}: {count} refs")
    print()

# 5. Scan JavaScript files
js_jpg_refs = {}
js_webp_refs = {}

for pattern in ['assets/js/*.js', '*.js']:
    for filepath in glob.glob(pattern):
        try:
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            
            jpg_matches = re.findall(r'\.jpg|\.jpeg', content, re.IGNORECASE)
            if jpg_matches:
                js_jpg_refs[filepath] = len(jpg_matches)
            
            webp_matches = re.findall(r'\.webp', content, re.IGNORECASE)
            if webp_matches:
                js_webp_refs[filepath] = len(webp_matches)
        except:
            pass

print("=" * 80)
print("JAVASCRIPT FILES ANALYSIS")
print("=" * 80)
print(f"JS files with JPG/JPEG refs: {len(js_jpg_refs)}")
print(f"JS files with WebP refs: {len(js_webp_refs)}")
print()

if js_jpg_refs:
    print("JavaScript files with JPG/JPEG references:")
    for filepath, count in sorted(js_jpg_refs.items(), key=lambda x: -x[1]):
        print(f"  {filepath}: {count} refs")
    print()

# 6. Check logo specifically
print("=" * 80)
print("LOGO CHECK")
print("=" * 80)

logo_files = glob.glob('assets/logo*')
for logo in logo_files:
    print(f"  ✓ {logo}")

# Check if any HTML references logo.webp
logo_webp_refs = 0
for pattern in ['*.html', '*/*.html', '*/*/*.html']:
    for filepath in glob.glob(pattern):
        if 'vendors/' in filepath:
            continue
        try:
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                if 'logo_wake.webp' in f.read():
                    logo_webp_refs += 1
        except:
            pass

if logo_webp_refs > 0:
    print(f"  ⚠️  WARNING: {logo_webp_refs} files reference logo_wake.webp (should be .png)")
else:
    print(f"  ✓ No files reference logo_wake.webp (correct - logo should stay .png)")

print()

# 7. Summary
print("=" * 80)
print("SUMMARY")
print("=" * 80)
print(f"WebP files available: {len(webp_files)}")
print(f"WebP files with JPG equivalents: {len(webp_with_jpg)} (ready to use)")
print(f"HTML files still using JPG/JPEG: {len(html_jpg_refs)}")
print(f"JS files still using JPG/JPEG: {len(js_jpg_refs)}")
print()
print("TOTAL REFERENCES TO UPDATE:")
total_html = sum(html_jpg_refs.values())
total_js = sum(js_jpg_refs.values())
print(f"  HTML: ~{total_html} references")
print(f"  JS: ~{total_js} references")
print(f"  TOTAL: ~{total_html + total_js} references")
print()

if total_html + total_js > 0:
    print("STATUS: ❌ WebP files exist but code not updated")
    print("ACTION: Need to update code references from .jpg/.jpeg to .webp")
else:
    print("STATUS: ✅ All code updated to use WebP")

