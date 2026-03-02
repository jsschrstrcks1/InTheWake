#!/bin/bash
set -e

echo "=== Extracting Unique Files List ==="
echo ""

# From DUPLICATE_ANALYSIS.md, we have 113 duplicate groups
# For each group, we'll keep ONE representative file (usually the shortest path or most recent)
# Plus all files that appear only once

temp_md5="/tmp/standards_md5.txt"
temp_sorted="/tmp/standards_md5_sorted.txt"
unique_files="/tmp/unique_files.txt"
unique_list="UNIQUE_FILES_LIST.md"

# Clear output
> "$temp_md5"
> "$unique_files"

echo "Computing MD5 hashes for all .md and .txt files..."
find old-files old-files-extracted standards \( -name "*.md" -o -name "*.txt" \) -type f 2>/dev/null | while IFS= read -r file; do
    if [ -f "$file" ]; then
        md5=$(md5sum "$file" 2>/dev/null | cut -d' ' -f1)
        lines=$(wc -l < "$file" 2>/dev/null || echo "0")
        size=$(wc -c < "$file" 2>/dev/null || echo "0")
        # Preference order: standards/ > old-files/ > old-files-extracted/
        # Also prefer shorter paths
        path_priority=0
        if [[ "$file" == standards/* ]]; then
            path_priority=1000
        elif [[ "$file" == old-files/* ]] && [[ "$file" != old-files-extracted/* ]]; then
            path_priority=500
        fi
        # Subtract path length to prefer shorter paths
        path_len=$(echo "$file" | wc -c)
        priority=$((path_priority - path_len))

        echo "$md5|$priority|$lines|$size|$file" >> "$temp_md5"
    fi
done

echo "Sorting by MD5 and selecting one representative per group..."
sort -t'|' -k1,1 -k2,2rn "$temp_md5" > "$temp_sorted"

# Keep only the highest priority file per MD5
current_md5=""
while IFS='|' read -r md5 priority lines size file; do
    if [ "$md5" != "$current_md5" ]; then
        # New MD5 group - this is our representative
        echo "$file" >> "$unique_files"
        current_md5="$md5"
    fi
    # Skip duplicates (lower priority files with same MD5)
done < "$temp_sorted"

echo ""
echo "✓ Unique file selection complete"
total_unique=$(wc -l < "$unique_files")
echo "✓ Selected $total_unique unique files from 626 total files"
echo ""

# Create markdown report
cat > "$unique_list" << HEADER
# Unique Files List - Standards Rebuild

**Generated:** $(date '+%Y-%m-%d %H:%M:%S')
**Total Unique Files:** $total_unique (from 626 total files, 113 duplicate groups)

---

## Selection Methodology

For each duplicate group, selected ONE representative file based on:
1. **Priority:** standards/ > old-files/ > old-files-extracted/
2. **Path length:** Shorter paths preferred (closer to root)
3. **First occurrence:** When priorities equal, keep first sorted

---

## Unique Files by Category

HEADER

# Categorize unique files
echo "### Core Standards Files" >> "$unique_list"
echo "" >> "$unique_list"
grep -E "(main-standards|root-standards|ships-standards|ports-standards|cruise-lines-standards)" "$unique_files" | sort | while read f; do
    lines=$(wc -l < "$f" 2>/dev/null || echo "?")
    echo "- \`$f\` ($lines lines)" >> "$unique_list"
done

echo "" >> "$unique_list"
echo "### Superset & Unified Standards" >> "$unique_list"
echo "" >> "$unique_list"
grep -iE "(superset|unified)" "$unique_files" | sort | while read f; do
    lines=$(wc -l < "$f" 2>/dev/null || echo "?")
    echo "- \`$f\` ($lines lines)" >> "$unique_list"
done

echo "" >> "$unique_list"
echo "### Version-Specific Standards" >> "$unique_list"
echo "" >> "$unique_list"
grep -E "v[0-9]" "$unique_files" | sort | while read f; do
    lines=$(wc -l < "$f" 2>/dev/null || echo "?")
    echo "- \`$f\` ($lines lines)" >> "$unique_list"
done | head -30

echo "" >> "$unique_list"
echo "### Specialized Standards" >> "$unique_list"
echo "" >> "$unique_list"
grep -iE "(article|solo|restaurant|venue|logbook|persona|navigation|accessibility|seo|analytics|attribution|caching)" "$unique_files" | sort | head -20 | while read f; do
    lines=$(wc -l < "$f" 2>/dev/null || echo "?")
    echo "- \`$f\` ($lines lines)" >> "$unique_list"
done

echo "" >> "$unique_list"
echo "---" >> "$unique_list"
echo "" >> "$unique_list"
echo "## Complete Unique Files List" >> "$unique_list"
echo "" >> "$unique_list"
echo "All $total_unique files selected for analysis:" >> "$unique_list"
echo "" >> "$unique_list"

cat "$unique_files" | sort | while read f; do
    echo "- \`$f\`" >> "$unique_list"
done

echo ""
echo "✓ Report saved to: $unique_list"
echo ""

# Save the simple list for processing
cp "$unique_files" UNIQUE_FILES.txt
echo "✓ Simple list saved to: UNIQUE_FILES.txt"
echo ""
echo "Next: Systematic analysis of all $total_unique files"
