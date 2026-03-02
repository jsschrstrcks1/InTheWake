#!/bin/bash
set -e

mkdir -p old-files-extracted

echo "Extracting .zip files from old-files/..."
total=0
extracted=0

find old-files -name "*.zip" -type f | while IFS= read -r zip; do
    total=$((total + 1))
    name=$(basename "$zip" .zip)
    outdir="old-files-extracted/$name"

    echo "[$total] Extracting: $zip -> $outdir"

    if unzip -q -o "$zip" -d "$outdir" 2>/dev/null; then
        extracted=$((extracted + 1))
        echo "  ✓ Success"
    else
        echo "  ✗ Failed (may be encrypted or corrupted)"
    fi
done

echo ""
echo "Extraction complete!"
echo "Total files in old-files-extracted:"
find old-files-extracted -type f 2>/dev/null | wc -l
