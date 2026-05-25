#!/bin/bash
# ============================================================================
# Canonical Validator Active-Ship Report — 2026-05-23
#
# Runs admin/validate-ship-page.sh on every Active ship page (excluding TBN
# and Historic ships per the .sh validator's own heuristic at lines 831-851
# and 1261-1280). Aggregates pass/warn/error counts and rule-frequency.
#
# Purpose: produce ground-truth diagnostic data for the ship-page
# normalization plan, using the CANONICAL validator (not the deprecated
# admin/validate-ship-page (DO NOT USE).js).
#
# Output: audit-reports/canonical-validator-active-ships-2026-05-23.json
#
# Soli Deo Gloria.
# ============================================================================

set -u  # don't use -e because find/grep can return non-zero on no-match

cd "$(dirname "$0")/.."
ROOT="$(pwd)"
REPORT="audit-reports/canonical-validator-active-ships-2026-05-23.json"
mkdir -p audit-reports

# TBN/Historic detection — mirrors admin/validate-ship-page.sh lines 831-851
is_tbn_or_historic() {
    local file="$1"
    local slug
    slug="$(basename "$file" .html)"

    # Slug-based TBN
    echo "$slug" | grep -qi "tbn" && return 0
    echo "$slug" | grep -qi "entering-service" && return 0

    # Read once
    local content
    content="$(cat "$file")"

    # Page title patterns (YYYY-YYYY) or "Historic"/"Legacy"/"Historical" in <h1> or <title>
    echo "$content" | grep -qP '<title>[^<]*\([0-9]{4}-[0-9]{4}\)' && return 0
    echo "$content" | grep -qP '<title>[^<]*\([0-9]{4}\)' && return 0
    echo "$content" | grep -qiP '<h1[^>]*>[^<]*\b(Historic|Legacy|Historical)\b' && return 0
    echo "$content" | grep -qiP '<title>[^<]*\b(Historic|Legacy|Historical)\b' && return 0
    echo "$content" | grep -qiP '<h1[^>]*>[^<]*\b(Historical|Legacy)\b' && return 0

    # Stats JSON declares retired
    echo "$content" | grep -qP '"retired"\s*:' && return 0

    # Page text markers
    echo "$content" | grep -qiP '(?<![-/])to be named|(?<![a-z-])TBN(?![a-z.])|under construction|not yet delivered' && return 0
    echo "$content" | grep -qiP "preserves the ship.s history|ship.s history and legacy" && return 0

    # Status sentinel strings
    echo "$content" | grep -qi 'status: retired' && return 0
    echo "$content" | grep -qi 'sold to tui\|sold to marella\|sold to pullmantur' && return 0
    echo "$content" | grep -qi 'retired from service\|no longer in service' && return 0
    echo "$content" | grep -qi '\bscrapped\b\|\bdecommissioned\b' && return 0
    echo "$content" | grep -qi '(historical)' && return 0

    return 1
}

# Hub pages to skip (not individual ship pages)
HUB_FILES="index.html venues.html quiz.html allshipquiz.html rooms.html template.html countdown.html"

# Find all ship pages
echo "Scanning ships/ ..."
TOTAL=0
ACTIVE=0
EXCLUDED_TBN_HISTORIC=0
declare -a active_files=()
declare -a excluded_files=()

while IFS= read -r f; do
    base="$(basename "$f")"
    case " $HUB_FILES " in
        *" $base "*) continue ;;
    esac
    TOTAL=$((TOTAL + 1))
    if is_tbn_or_historic "$f"; then
        EXCLUDED_TBN_HISTORIC=$((EXCLUDED_TBN_HISTORIC + 1))
        excluded_files+=("$f")
    else
        ACTIVE=$((ACTIVE + 1))
        active_files+=("$f")
    fi
done < <(find ships -type f -name '*.html' | sort)

echo "  Total ship pages: $TOTAL"
echo "  TBN/Historic (excluded): $EXCLUDED_TBN_HISTORIC"
echo "  Active (will validate): $ACTIVE"
echo ""

# Run canonical validator on active ships
echo "Running canonical validator on $ACTIVE active ships..."
PASSING=0
WARNINGS_TOTAL=0
ERRORS_TOTAL=0
PASS_WITH_WARN=0
FAILING=0

# JSON accumulator (per-ship rows)
TMP_JSON="$(mktemp)"
trap 'rm -f "$TMP_JSON"' EXIT
echo "[" > "$TMP_JSON"
first=1

# Rule-frequency accumulator
declare -A WARN_RULES
declare -A ERROR_RULES

i=0
for f in "${active_files[@]}"; do
    i=$((i + 1))
    if [ $((i % 25)) -eq 0 ]; then
        echo "  [$i/$ACTIVE] $(basename "$f")..."
    fi

    out="$(bash admin/validate-ship-page.sh "$f" --json-output 2>/dev/null || true)"
    if [ -z "$out" ]; then
        FAILING=$((FAILING + 1))
        continue
    fi

    # Extract counts and check messages via python (jq may not be present)
    summary="$(echo "$out" | python3 -c "
import json, sys
try:
    d = json.load(sys.stdin)
    checks = d.get('checks', [])
    errors = [c for c in checks if c.get('status') == 'error']
    warns = [c for c in checks if c.get('status') == 'warn']
    passes = [c for c in checks if c.get('status') == 'pass']
    print('errors:%d' % len(errors))
    print('warnings:%d' % len(warns))
    print('passes:%d' % len(passes))
    for c in errors:
        msg = c.get('message','')[:80]
        print('ERR\t' + msg)
    for c in warns:
        msg = c.get('message','')[:80]
        print('WRN\t' + msg)
except Exception as e:
    print('errors:-1')
    print('parse_error:' + str(e))
")"

    e_count="$(echo "$summary" | grep '^errors:' | head -1 | cut -d: -f2)"
    w_count="$(echo "$summary" | grep '^warnings:' | head -1 | cut -d: -f2)"

    if [ "$e_count" = "-1" ]; then
        FAILING=$((FAILING + 1))
        continue
    fi

    ERRORS_TOTAL=$((ERRORS_TOTAL + e_count))
    WARNINGS_TOTAL=$((WARNINGS_TOTAL + w_count))

    if [ "$e_count" -eq 0 ]; then
        if [ "$w_count" -eq 0 ]; then
            PASSING=$((PASSING + 1))
        else
            PASS_WITH_WARN=$((PASS_WITH_WARN + 1))
        fi
    else
        FAILING=$((FAILING + 1))
    fi

    # Accumulate rule frequency
    while IFS=$'\t' read -r tag msg; do
        case "$tag" in
            ERR) ERROR_RULES["$msg"]=$((${ERROR_RULES["$msg"]:-0} + 1)) ;;
            WRN) WARN_RULES["$msg"]=$((${WARN_RULES["$msg"]:-0} + 1)) ;;
        esac
    done < <(echo "$summary" | grep -E '^(ERR|WRN)\b')

    # Append per-ship summary line to JSON
    if [ $first -eq 0 ]; then echo "," >> "$TMP_JSON"; fi
    first=0
    printf '  {"file":"%s","errors":%d,"warnings":%d}' "$f" "$e_count" "$w_count" >> "$TMP_JSON"
done

echo "]" >> "$TMP_JSON"

# Print summary
echo ""
echo "============================================================================"
echo "  Canonical Validator Report — Active Ships Only"
echo "============================================================================"
echo "  Active ships validated:    $ACTIVE"
echo "  Clean (0 errors, 0 warns): $PASSING"
echo "  Pass with warnings:        $PASS_WITH_WARN"
echo "  Failing (1+ errors):       $FAILING"
echo "  Total warnings across all: $WARNINGS_TOTAL"
echo "  Total errors across all:   $ERRORS_TOTAL"
echo ""
echo "  TBN/Historic excluded:     $EXCLUDED_TBN_HISTORIC"
echo ""

# Top error rules
echo "  Top error rules (frequency):"
for msg in "${!ERROR_RULES[@]}"; do
    printf "    %d  %s\n" "${ERROR_RULES[$msg]}" "$msg"
done | sort -rn | head -20

echo ""
echo "  Top warning rules (frequency):"
for msg in "${!WARN_RULES[@]}"; do
    printf "    %d  %s\n" "${WARN_RULES[$msg]}" "$msg"
done | sort -rn | head -30

# Write the structured report
{
    echo "{"
    echo "  \"_meta\": {"
    echo "    \"generated\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\","
    echo "    \"validator\": \"admin/validate-ship-page.sh (canonical)\","
    echo "    \"scope\": \"Active ships only — TBN and Historic ships excluded\","
    echo "    \"total_ship_pages\": $TOTAL,"
    echo "    \"active_validated\": $ACTIVE,"
    echo "    \"tbn_historic_excluded\": $EXCLUDED_TBN_HISTORIC,"
    echo "    \"clean_no_warn\": $PASSING,"
    echo "    \"pass_with_warn\": $PASS_WITH_WARN,"
    echo "    \"failing\": $FAILING,"
    echo "    \"total_warnings\": $WARNINGS_TOTAL,"
    echo "    \"total_errors\": $ERRORS_TOTAL"
    echo "  },"
    echo "  \"error_rules\": {"
    first=1
    for msg in "${!ERROR_RULES[@]}"; do
        [ $first -eq 0 ] && echo ","
        first=0
        printf '    %s: %d' "$(printf '%s' "$msg" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))')" "${ERROR_RULES[$msg]}"
    done
    echo ""
    echo "  },"
    echo "  \"warning_rules\": {"
    first=1
    for msg in "${!WARN_RULES[@]}"; do
        [ $first -eq 0 ] && echo ","
        first=0
        printf '    %s: %d' "$(printf '%s' "$msg" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))')" "${WARN_RULES[$msg]}"
    done
    echo ""
    echo "  },"
    echo "  \"per_ship\":"
    cat "$TMP_JSON"
    echo ","
    echo "  \"excluded_tbn_historic\": ["
    first=1
    for f in "${excluded_files[@]}"; do
        [ $first -eq 0 ] && echo ","
        first=0
        printf '    "%s"' "$f"
    done
    echo ""
    echo "  ]"
    echo "}"
} > "$REPORT"

echo ""
echo "  Full report: $REPORT"
echo "============================================================================"
