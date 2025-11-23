#!/bin/bash
set -e

echo "=== Analyzing Remaining Standards Files ==="
echo ""
echo "Strategy: SUPERSET files already contain 17 consolidated sources"
echo "Need to analyze remaining 135 files for NEW rules not in SUPERSET"
echo ""

# Files already in SUPERSET (from provenance comments)
cat > /tmp/superset_sources.txt << 'EOF'
in_the_wake_logbook_personas_standards_v2.257
in_the_wake_modular_standards_v2.245
InTheWake_Standards_v2.4
InTheWake_Standards_v2.229
InTheWake_Standards_v3.001_bundle
InTheWake_Standards_v3.002
restaurants-standards_v2.256_maritime-dining
STANDARDS_v3.002a
venue-standards_v2.257
EOF

# Categorize remaining files
output="REMAINING_FILES_ANALYSIS.md"

cat > "$output" << 'HEADER'
# Remaining Files Analysis - Standards Rebuild

**Date:** $(date '+%Y-%m-%d %H:%M:%S')
**Total Unique Files:** 137
**Already in SUPERSET:** 17 sources
**Remaining to Analyze:** 120 files

---

## Strategy

**SUPERSET files (2070 + 2076 lines) already contain:**
- Logbook personas standards v2.257
- Modular standards v2.245
- Standards v2.4, v2.229, v3.001, v3.002, v3.002a
- Restaurant standards v2.256
- Venue standards v2.257

**Need to find in remaining 120 files:**
- Standards v3.003 - v3.009 (newer versions)
- Specialized standards (article, solo, navigation, accessibility, SEO, analytics, caching)
- Template examples and working code
- Any unique rules not captured in SUPERSET

---

## High Priority Files to Analyze

### Version 3.006 - 3.009 (Newest)

HEADER

# Find newer version files
echo "### Files v3.006 and higher:" >> "$output"
echo "" >> "$output"
grep -E "v3\.(006|007|008|009)" UNIQUE_FILES.txt | while read f; do
    lines=$(wc -l < "$f" 2>/dev/null || echo "?")
    echo "- \`$f\` ($lines lines)" >> "$output"
done

echo "" >> "$output"
echo "### Article & Solo Standards:" >> "$output"
echo "" >> "$output"
grep -iE "(article|solo)" UNIQUE_FILES.txt | while read f; do
    lines=$(wc -l < "$f" 2>/dev/null || echo "?")
    echo "- \`$f\` ($lines lines)" >> "$output"
done

echo "" >> "$output"
echo "### Technical Standards (Navigation, SEO, Analytics, Caching):" >> "$output"
echo "" >> "$output"
grep -iE "(navigation|seo|analytics|caching|accessibility|swiper)" UNIQUE_FILES.txt | while read f; do
    lines=$(wc -l < "$f" 2>/dev/null || echo "?")
    echo "- \`$f\` ($lines lines)" >> "$output"
done

echo "" >> "$output"
echo "### Template & Example Files:" >> "$output"
echo "" >> "$output"
grep -E "\.(html|js|css|json)" UNIQUE_FILES.txt | while read f; do
    lines=$(wc -l < "$f" 2>/dev/null || echo "?")
    echo "- \`$f\` ($lines lines)" >> "$output"
done

echo "" >> "$output"
echo "---" >> "$output"
echo "" >> "$output"
echo "## Analysis Order" >> "$output"
echo "" >> "$output"
echo "1. **SUPERSET files** (base foundation) - DONE" >> "$output"
echo "2. **Version 3.006-3.009** (newest consolidated standards)" >> "$output"
echo "3. **Specialized standards** (articles, solo, navigation, SEO, etc.)" >> "$output"
echo "4. **Template examples** (.html, .js, .css, .json)" >> "$output"
echo "5. **Remaining files** (catch any unique rules)" >> "$output"

echo ""
echo "✓ Analysis saved to: $output"
echo ""
echo "Next: Extract rules from high-priority remaining files"
