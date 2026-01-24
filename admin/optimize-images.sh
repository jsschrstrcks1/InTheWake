#!/bin/bash
# Optimize port images for web delivery
# Target: Max 1920px wide, under 500KB, quality 82

PORTS_IMG_DIR="ports/img"
MAX_WIDTH=1920
QUALITY=82
MAX_SIZE_KB=500

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

total_before=0
total_after=0
optimized=0
skipped=0

echo "========================================"
echo "Port Image Optimizer"
echo "Max width: ${MAX_WIDTH}px"
echo "Quality: ${QUALITY}"
echo "Target size: <${MAX_SIZE_KB}KB"
echo "========================================"
echo ""

# Process each webp file
find "$PORTS_IMG_DIR" -name "*.webp" -type f | while read -r img; do
    # Skip attribution files
    if [[ "$img" == *.attr.json ]]; then
        continue
    fi

    # Get current file size in KB
    size_kb=$(du -k "$img" | cut -f1)

    # Skip if already small enough
    if [ "$size_kb" -lt "$MAX_SIZE_KB" ]; then
        ((skipped++))
        continue
    fi

    # Get image dimensions
    dims=$(identify -format "%wx%h" "$img" 2>/dev/null)
    width=$(echo "$dims" | cut -d'x' -f1)

    # Create temp file
    tmp_file="${img}.tmp"

    echo -n "Processing: $(basename "$img") (${size_kb}KB, ${dims})... "

    # Resize and compress
    if [ "$width" -gt "$MAX_WIDTH" ]; then
        # Need to resize
        convert "$img" -resize "${MAX_WIDTH}x>" -quality "$QUALITY" "$tmp_file" 2>/dev/null
    else
        # Just recompress
        convert "$img" -quality "$QUALITY" "$tmp_file" 2>/dev/null
    fi

    # Check if optimization worked
    if [ -f "$tmp_file" ]; then
        new_size_kb=$(du -k "$tmp_file" | cut -f1)

        # Only keep if smaller
        if [ "$new_size_kb" -lt "$size_kb" ]; then
            mv "$tmp_file" "$img"
            savings=$((size_kb - new_size_kb))
            echo -e "${GREEN}✓ ${new_size_kb}KB (saved ${savings}KB)${NC}"
            ((optimized++))
        else
            rm "$tmp_file"
            echo -e "${YELLOW}○ kept original${NC}"
        fi
    else
        echo -e "${RED}✗ failed${NC}"
    fi
done

echo ""
echo "========================================"
echo "Optimization complete"
echo "========================================"
