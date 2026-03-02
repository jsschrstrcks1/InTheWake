#!/bin/bash
set -e

echo "=== Duplicate Detection - Standards Rebuild ==="
echo ""
echo "Analyzing .md and .txt files in old-files/, old-files-extracted/, and standards/"
echo ""

# Create temp file for MD5 hashes
temp_md5="/tmp/standards_md5.txt"
temp_sorted="/tmp/standards_md5_sorted.txt"
duplicates_file="DUPLICATE_ANALYSIS.md"

# Clear temp files
> "$temp_md5"

echo "Computing MD5 hashes..."
find old-files old-files-extracted standards \( -name "*.md" -o -name "*.txt" \) -type f 2>/dev/null | while IFS= read -r file; do
    if [ -f "$file" ]; then
        md5=$(md5sum "$file" 2>/dev/null | cut -d' ' -f1)
        size=$(wc -c < "$file" 2>/dev/null || echo "0")
        lines=$(wc -l < "$file" 2>/dev/null || echo "0")
        echo "$md5|$size|$lines|$file" >> "$temp_md5"
    fi
done

echo "Sorting by MD5 hash..."
sort "$temp_md5" > "$temp_sorted"

echo "Generating duplicate report..."

cat > "$duplicates_file" << 'HEADER'
# Duplicate Analysis - Standards Rebuild

**Generated:** $(date '+%Y-%m-%d %H:%M:%S')
**Files Analyzed:** $(wc -l < "$temp_sorted")

---

## Exact Duplicates (Same MD5 Hash)

The following files are byte-for-byte identical:

HEADER

# Find duplicates (same MD5 appearing more than once)
current_md5=""
current_files=()
duplicate_groups=0

while IFS='|' read -r md5 size lines file; do
    if [ "$md5" = "$current_md5" ]; then
        current_files+=("$file|$size|$lines")
    else
        # Process previous group if it had duplicates
        if [ ${#current_files[@]} -gt 1 ]; then
            duplicate_groups=$((duplicate_groups + 1))
            echo "" >> "$duplicates_file"
            echo "### Duplicate Group #$duplicate_groups" >> "$duplicates_file"
            echo "" >> "$duplicates_file"
            echo "**MD5:** $current_md5  " >> "$duplicates_file"
            echo "**Size:** ${current_files[0]##*|*|} bytes  " >> "$duplicates_file"
            echo "**Files:** ${#current_files[@]}  " >> "$duplicates_file"
            echo "" >> "$duplicates_file"
            for entry in "${current_files[@]}"; do
                f="${entry%%|*|*}"
                echo "- \`$f\`" >> "$duplicates_file"
            done
        fi
        # Start new group
        current_md5="$md5"
        current_files=("$file|$size|$lines")
    fi
done < "$temp_sorted"

# Process final group
if [ ${#current_files[@]} -gt 1 ]; then
    duplicate_groups=$((duplicate_groups + 1))
    echo "" >> "$duplicates_file"
    echo "### Duplicate Group #$duplicate_groups" >> "$duplicates_file"
    echo "" >> "$duplicates_file"
    echo "**MD5:** $current_md5  " >> "$duplicates_file"
    echo "**Files:** ${#current_files[@]}  " >> "$duplicates_file"
    echo "" >> "$duplicates_file"
    for entry in "${current_files[@]}"; do
        f="${entry%%|*|*}"
        echo "- \`$f\`" >> "$duplicates_file"
    done
fi

echo "" >> "$duplicates_file"
echo "---" >> "$duplicates_file"
echo "" >> "$duplicates_file"
echo "## Summary" >> "$duplicates_file"
echo "" >> "$duplicates_file"
echo "- **Total files analyzed:** $(wc -l < "$temp_sorted")" >> "$duplicates_file"
echo "- **Duplicate groups found:** $duplicate_groups" >> "$duplicates_file"
echo "" >> "$duplicates_file"

echo ""
echo "✓ Duplicate analysis complete!"
echo "✓ Found $duplicate_groups duplicate groups"
echo "✓ Report saved to: $duplicates_file"
echo ""

# Cleanup
rm -f "$temp_md5" "$temp_sorted"
