#!/bin/bash
# classify-interior-cabins.sh
# Room by room. Ship by ship. No patterns. No assumptions.
#
# Fetches each Interior cabin number from iCruise and records its
# actual sub-category code. Outputs CSV: cabin_number,category_code
#
# Usage: ./classify-interior-cabins.sh <ship-slug> <json-file>
# Example: ./classify-interior-cabins.sh quantum-of-the-seas stateroom-exceptions.quantum-of-the-seas.v2.json

set -euo pipefail

SHIP_SLUG="$1"
JSON_FILE="$2"
OUTPUT_DIR="/home/user/InTheWake/admin/cabin-classifications"
OUTPUT_FILE="${OUTPUT_DIR}/${SHIP_SLUG}-interior-codes.csv"
ERROR_FILE="${OUTPUT_DIR}/${SHIP_SLUG}-errors.log"

mkdir -p "$OUTPUT_DIR"

# Extract Interior cabin numbers from the JSON file
# Finds the "Interior" array and pulls all quoted numbers
INTERIOR_CABINS=$(python3 -c "
import json, sys
with open('$JSON_FILE') as f:
    data = json.load(f)
# Check top level first, then nested under ship key
if 'category_overrides' in data:
    cabins = data['category_overrides'].get('Interior', [])
else:
    ship_key = [k for k in data.keys() if k not in ('data_version','last_updated','audit_notes','audit_status','total_exceptions','cabin_decks','methodology','trust_note','category_overrides','removed_exceptions','positive_oddballs','ship_class')][0]
    cabins = data[ship_key].get('category_overrides', {}).get('Interior', [])
for c in cabins:
    print(c)
")

TOTAL=$(echo "$INTERIOR_CABINS" | wc -l)
echo "Ship: $SHIP_SLUG"
echo "Total Interior cabins to classify: $TOTAL"
echo "Output: $OUTPUT_FILE"
echo "---"

# Write CSV header
echo "cabin_number,category_code,is_virtual_balcony,is_promenade_view,is_misclassified" > "$OUTPUT_FILE"
> "$ERROR_FILE"

COUNT=0
VIRTUAL_BALCONY=0
PROMENADE_VIEW=0
STUDIO=0
CONNECTED=0
STANDARD=0
MISCLASSIFIED=0

for CABIN in $INTERIOR_CABINS; do
    COUNT=$((COUNT + 1))

    # Fetch the iCruise cabin page
    URL="https://www.icruise.com/cabins/royal-caribbean-cruises-${SHIP_SLUG}-cabin-${CABIN}.html"
    RESPONSE=$(curl -s --max-time 10 "$URL" 2>/dev/null || echo "FETCH_ERROR")

    if [ "$RESPONSE" = "FETCH_ERROR" ]; then
        echo "${CABIN},FETCH_ERROR,false,false,unknown" >> "$OUTPUT_FILE"
        echo "ERROR: Failed to fetch cabin $CABIN" >> "$ERROR_FILE"
        echo "  [$COUNT/$TOTAL] $CABIN -> FETCH_ERROR"
        sleep 0.5
        continue
    fi

    # Extract category code
    CODE=$(echo "$RESPONSE" | grep -oP 'Category \K[A-Z0-9]+' | head -1 || echo "PARSE_ERROR")

    if [ -z "$CODE" ] || [ "$CODE" = "PARSE_ERROR" ]; then
        echo "${CABIN},PARSE_ERROR,false,false,unknown" >> "$OUTPUT_FILE"
        echo "ERROR: Failed to parse category for cabin $CABIN" >> "$ERROR_FILE"
        echo "  [$COUNT/$TOTAL] $CABIN -> PARSE_ERROR"
        sleep 0.5
        continue
    fi

    # Classify
    IS_VB="false"
    IS_PV="false"
    IS_MIS="false"

    case "$CODE" in
        1U|2U|3U|4U|5U)
            IS_VB="true"
            VIRTUAL_BALCONY=$((VIRTUAL_BALCONY + 1))
            ;;
        2T|CP)
            IS_PV="true"
            PROMENADE_VIEW=$((PROMENADE_VIEW + 1))
            ;;
        2W)
            STUDIO=$((STUDIO + 1))
            ;;
        CI)
            CONNECTED=$((CONNECTED + 1))
            ;;
        1I|1R|1V|2I|2S|2V|3V|4V)
            STANDARD=$((STANDARD + 1))
            ;;
        *)
            # Code doesn't match any known Interior sub-type
            # This cabin may be misclassified in our data
            IS_MIS="true"
            MISCLASSIFIED=$((MISCLASSIFIED + 1))
            echo "WARNING: Cabin $CABIN has code $CODE (not an Interior sub-type)" >> "$ERROR_FILE"
            ;;
    esac

    echo "${CABIN},${CODE},${IS_VB},${IS_PV},${IS_MIS}" >> "$OUTPUT_FILE"

    # Progress every 25 cabins
    if [ $((COUNT % 25)) -eq 0 ]; then
        echo "  [$COUNT/$TOTAL] Progress: VB=$VIRTUAL_BALCONY PV=$PROMENADE_VIEW Studio=$STUDIO CI=$CONNECTED Std=$STANDARD Mis=$MISCLASSIFIED"
    fi

    # Small delay to be respectful to the server
    sleep 0.3
done

echo "---"
echo "COMPLETE: $SHIP_SLUG"
echo "  Total checked: $COUNT"
echo "  Virtual Balcony (1U-5U): $VIRTUAL_BALCONY"
echo "  Promenade View (2T/CP): $PROMENADE_VIEW"
echo "  Studio (2W): $STUDIO"
echo "  Connected Interior (CI): $CONNECTED"
echo "  Standard Interior: $STANDARD"
echo "  MISCLASSIFIED (not Interior): $MISCLASSIFIED"
echo "  Results: $OUTPUT_FILE"
echo "  Errors: $ERROR_FILE"
