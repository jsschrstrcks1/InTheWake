#!/bin/bash
# Fetch Ship Images from Wikimedia Commons
# Downloads freely licensed (CC BY, CC BY-SA, Public Domain) ship images
# Converts to WebP format, generates attribution JSON
#
# Usage: bash admin/fetch-wiki-ship-images.sh "Ship Name" cruise-line-slug [max_images]
# Example: bash admin/fetch-wiki-ship-images.sh "Harmony of the Seas" rcl 6

set -euo pipefail

SHIP_NAME="${1:-}"
CRUISE_LINE="${2:-unknown}"
MAX_IMAGES="${3:-6}"
ASSETS_DIR="$(cd "$(dirname "$0")/.." && pwd)/assets/ships"
USER_AGENT="InTheWake/1.0 (https://cruisinginthewake.com; ship-reference-site) bash"
API_BASE="https://commons.wikimedia.org/w/api.php"

if [ -z "$SHIP_NAME" ]; then
  echo "Usage: $0 \"Ship Name\" cruise-line-slug [max_images]"
  exit 1
fi

SLUG=$(echo "$SHIP_NAME" | tr '[:upper:]' '[:lower:]' | sed 's/ /-/g')
ATTR_FILE="${ASSETS_DIR}/${SLUG}-wiki-attributions.json"

echo "=============================================="
echo "Fetching Wikimedia Commons images for: $SHIP_NAME"
echo "Cruise line: $CRUISE_LINE"
echo "Max images: $MAX_IMAGES"
echo "Output dir: $ASSETS_DIR"
echo "=============================================="

mkdir -p "$ASSETS_DIR"

# Search Wikimedia Commons
echo ""
echo "Searching Wikimedia Commons..."
SEARCH_TERM=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$SHIP_NAME ship'))")

SEARCH_RESULT=$(curl -s -L \
  -H "User-Agent: $USER_AGENT" \
  "${API_BASE}?action=query&list=search&srsearch=${SEARCH_TERM}&srnamespace=6&srlimit=30&format=json")

# Extract file titles
TITLES=$(echo "$SEARCH_RESULT" | python3 -c "
import json, sys
data = json.load(sys.stdin)
results = data.get('query', {}).get('search', [])
for r in results:
    title = r['title']
    if any(title.lower().endswith(ext) for ext in ['.jpg', '.jpeg', '.png', '.webp']):
        print(title)
")

if [ -z "$TITLES" ]; then
  echo "No image results found. Trying broader search..."
  SEARCH_TERM=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$SHIP_NAME cruise'))")
  SEARCH_RESULT=$(curl -s -L \
    -H "User-Agent: $USER_AGENT" \
    "${API_BASE}?action=query&list=search&srsearch=${SEARCH_TERM}&srnamespace=6&srlimit=30&format=json")
  TITLES=$(echo "$SEARCH_RESULT" | python3 -c "
import json, sys
data = json.load(sys.stdin)
results = data.get('query', {}).get('search', [])
for r in results:
    title = r['title']
    if any(title.lower().endswith(ext) for ext in ['.jpg', '.jpeg', '.png', '.webp']):
        print(title)
")
fi

TITLE_COUNT=$(echo "$TITLES" | grep -c . || true)
echo "Found $TITLE_COUNT candidate images"

# Process each image
DOWNLOADED=0
ATTR_ENTRIES="["

while IFS= read -r FILE_TITLE; do
  [ -z "$FILE_TITLE" ] && continue
  [ "$DOWNLOADED" -ge "$MAX_IMAGES" ] && break

  echo ""
  echo "Processing: $FILE_TITLE"

  # Get image info (URL, license, author)
  ENCODED_TITLE=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$FILE_TITLE'))")

  INFO_RESULT=$(curl -s -L \
    -H "User-Agent: $USER_AGENT" \
    "${API_BASE}?action=query&titles=${ENCODED_TITLE}&prop=imageinfo&iiprop=url|size|extmetadata&iiurlwidth=2560&format=json")

  # Parse image info
  IMAGE_DATA=$(echo "$INFO_RESULT" | python3 -c "
import json, sys, html
data = json.load(sys.stdin)
pages = data.get('query', {}).get('pages', {})
for pid, page in pages.items():
    ii = page.get('imageinfo', [{}])[0]
    meta = ii.get('extmetadata', {})

    license_short = meta.get('LicenseShortName', {}).get('value', '')
    license_url = meta.get('LicenseUrl', {}).get('value', '')
    artist_raw = meta.get('Artist', {}).get('value', 'Unknown')

    # Strip HTML from artist
    import re
    artist = re.sub(r'<[^>]+>', '', artist_raw).strip()

    # Check acceptable licenses
    acceptable = ['CC BY', 'CC BY-SA', 'CC0', 'Public domain', 'GFDL']
    is_free = any(l in license_short for l in acceptable)

    url = ii.get('thumburl', ii.get('url', ''))
    width = ii.get('thumbwidth', ii.get('width', 0))
    height = ii.get('thumbheight', ii.get('height', 0))
    orig_url = ii.get('url', '')

    print(f'{is_free}|||{url}|||{width}|||{height}|||{license_short}|||{license_url}|||{artist}|||{orig_url}')
" 2>/dev/null || echo "")

  [ -z "$IMAGE_DATA" ] && { echo "  Could not parse image info"; continue; }

  IFS='|||' read -r IS_FREE _ IMG_URL _ WIDTH _ HEIGHT _ LICENSE _ LICENSE_URL _ ARTIST _ ORIG_URL <<< "$IMAGE_DATA"

  if [ "$IS_FREE" != "True" ]; then
    echo "  Skipping: License '$LICENSE' not acceptable"
    continue
  fi

  # Check minimum size
  if [ "${WIDTH:-0}" -lt 800 ] 2>/dev/null; then
    echo "  Skipping: Too small (${WIDTH}x${HEIGHT})"
    continue
  fi

  # Generate filename
  SAFE_NAME=$(echo "$FILE_TITLE" | sed 's/^File://' | sed 's/[^a-zA-Z0-9._-]/_/g' | sed 's/__*/_/g' | head -c 120)
  WEBP_NAME="${SAFE_NAME%.*}.webp"
  DEST_PATH="${ASSETS_DIR}/${WEBP_NAME}"

  if [ -f "$DEST_PATH" ]; then
    echo "  Already exists: $WEBP_NAME"
    # Still count it for attribution
    DOWNLOADED=$((DOWNLOADED + 1))
    # Add to attributions
    [ "$DOWNLOADED" -gt 1 ] && ATTR_ENTRIES="${ATTR_ENTRIES},"
    COMMONS_URL="https://commons.wikimedia.org/wiki/$(python3 -c "import urllib.parse; print(urllib.parse.quote('$FILE_TITLE'))")"
    ATTR_ENTRIES="${ATTR_ENTRIES}
  {
    \"filename\": \"${WEBP_NAME}\",
    \"path\": \"/assets/ships/${WEBP_NAME}\",
    \"source\": \"Wikimedia Commons\",
    \"sourceUrl\": \"${COMMONS_URL}\",
    \"artist\": $(python3 -c "import json; print(json.dumps('${ARTIST}'))"),
    \"license\": \"${LICENSE}\",
    \"licenseUrl\": \"${LICENSE_URL}\",
    \"originalTitle\": $(python3 -c "import json; print(json.dumps('${FILE_TITLE}'))")
  }"
    continue
  fi

  # Download
  echo "  Downloading (${WIDTH}x${HEIGHT}, ${LICENSE})..."
  DOWNLOAD_URL="${IMG_URL:-$ORIG_URL}"

  TEMP_FILE="/tmp/ship_img_$$_${DOWNLOADED}"
  curl -s -L -o "$TEMP_FILE" -H "User-Agent: $USER_AGENT" "$DOWNLOAD_URL"

  if [ ! -f "$TEMP_FILE" ] || [ ! -s "$TEMP_FILE" ]; then
    echo "  Download failed"
    rm -f "$TEMP_FILE"
    continue
  fi

  # Convert to WebP if possible, otherwise just copy with .webp extension
  if command -v cwebp &>/dev/null; then
    cwebp -q 85 "$TEMP_FILE" -o "$DEST_PATH" 2>/dev/null
  elif command -v convert &>/dev/null; then
    convert "$TEMP_FILE" -quality 85 "$DEST_PATH" 2>/dev/null
  else
    # No conversion tools - keep original format, rename appropriately
    EXT=$(echo "$SAFE_NAME" | grep -oP '\.[^.]+$' | tr '[:upper:]' '[:lower:]')
    DEST_PATH="${ASSETS_DIR}/${SAFE_NAME}"
    WEBP_NAME="$SAFE_NAME"
    cp "$TEMP_FILE" "$DEST_PATH"
  fi

  rm -f "$TEMP_FILE"

  if [ -f "$DEST_PATH" ]; then
    FILE_SIZE=$(stat -f%z "$DEST_PATH" 2>/dev/null || stat -c%s "$DEST_PATH" 2>/dev/null || echo "unknown")
    echo "  Saved: $WEBP_NAME ($FILE_SIZE bytes)"
    DOWNLOADED=$((DOWNLOADED + 1))

    # Build attribution entry
    [ "$DOWNLOADED" -gt 1 ] && ATTR_ENTRIES="${ATTR_ENTRIES},"
    COMMONS_URL="https://commons.wikimedia.org/wiki/$(python3 -c "import urllib.parse; print(urllib.parse.quote('$FILE_TITLE'))")"
    ATTR_ENTRIES="${ATTR_ENTRIES}
  {
    \"filename\": \"${WEBP_NAME}\",
    \"path\": \"/assets/ships/${WEBP_NAME}\",
    \"source\": \"Wikimedia Commons\",
    \"sourceUrl\": \"${COMMONS_URL}\",
    \"artist\": $(python3 -c "import json; print(json.dumps('${ARTIST}'))"),
    \"license\": \"${LICENSE}\",
    \"licenseUrl\": \"${LICENSE_URL}\",
    \"originalTitle\": $(python3 -c "import json; print(json.dumps('${FILE_TITLE}'))")
  }"
  else
    echo "  Conversion/save failed"
  fi

  # Be polite - wait between downloads
  sleep 2

done <<< "$TITLES"

ATTR_ENTRIES="${ATTR_ENTRIES}
]"

# Save attribution JSON
echo "$ATTR_ENTRIES" > "$ATTR_FILE"
echo ""
echo "=============================================="
echo "Downloaded $DOWNLOADED images for $SHIP_NAME"
echo "Attribution file: $ATTR_FILE"
echo "=============================================="
