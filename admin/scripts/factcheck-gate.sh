#!/bin/bash
# ============================================================================
# factcheck-gate.sh — Pre-commit gate for voyage-pack factual claim discipline
#
# Blocks any voyage-pack .md commit unless a fresh, complete .factcheck.json
# sidecar exists alongside it. Enforces the `original-research` skill.
#
# Invoked by .githooks/pre-commit. Can also be run standalone:
#   admin/scripts/factcheck-gate.sh                  # check staged files only
#   admin/scripts/factcheck-gate.sh --all            # check every voyage pack
#   admin/scripts/factcheck-gate.sh path/to/pack.md  # check one specific file
#
# Exit codes:
#   0 = all checks passed
#   1 = at least one pack failed the gate (commit blocked)
#   2 = usage error
#
# Bypass (use only with explicit operator approval, log as anomaly disposition):
#   git commit --no-verify
#
# The gate checks each voyage-pack .md against these rules:
#   R1. Sidecar file <pack>.factcheck.json exists
#   R2. Sidecar mtime is >= .md mtime (sidecar updated after the pack edit)
#   R3. Sidecar parses as valid JSON
#   R4. Sidecar contains all required top-level categories:
#       pack_filename, last_factcheck_date, ship_specs, christening, policies, superlatives
#   R5. ship_specs has crew + gross_tonnage + decks entries with source URLs
#   R6. christening has godparent + date entries with source URLs
#   R7. policies has auto_gratuity_rate + laundry_availability entries with source URLs
#   R8. No source URL is null, empty, or points at another file in admin/voyage-packs/
#       (the latter would be Copy-Propagation)
#
# Soli Deo Gloria — the closing requires the contents be true.
# ============================================================================

set -u

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
PACKS_DIR="admin/voyage-packs"
TEMPLATE_FILE="$PACKS_DIR/FACTCHECK_TEMPLATE.json"
RED='\033[0;31m'
YEL='\033[0;33m'
GRN='\033[0;32m'
RST='\033[0m'

# ----- mode parsing -----------------------------------------------------------
MODE="staged"
EXPLICIT_FILES=()

for arg in "$@"; do
  case "$arg" in
    --all)
      MODE="all"
      ;;
    --help|-h)
      sed -n '2,30p' "$0"
      exit 0
      ;;
    *.md)
      MODE="explicit"
      EXPLICIT_FILES+=("$arg")
      ;;
    *)
      echo "Unknown argument: $arg" >&2
      exit 2
      ;;
  esac
done

cd "$REPO_ROOT"

# ----- collect files to check -------------------------------------------------
case "$MODE" in
  staged)
    # Long-form packs only. Condensed (-condensed.md) and handoff (-handoff-card.md)
    # are derivatives of the long-form — they inherit verification through their
    # sister long-form sidecar. FACT-CHECK log docs (-FACT-CHECK.md) are documentation
    # ABOUT packs, not sellable packs, so they carry no sidecar either. Facts shared
    # across the trio should be consistent (a separate cross-doc consistency check
    # belongs in the build pipeline).
    mapfile -t FILES_TO_CHECK < <(git diff --cached --name-only --diff-filter=ACMR 2>/dev/null \
      | grep -E "^${PACKS_DIR}/v[0-9].*\.md$" \
      | grep -v -E "(-condensed|-handoff-card|-FACT-CHECK)\.md$" || true)
    ;;
  all)
    mapfile -t FILES_TO_CHECK < <(find "$PACKS_DIR" -maxdepth 1 -name "v[0-9]*.md" -type f \
      ! -name "*-condensed.md" ! -name "*-handoff-card.md" ! -name "*-FACT-CHECK.md" | sort)
    ;;
  explicit)
    FILES_TO_CHECK=("${EXPLICIT_FILES[@]}")
    ;;
esac

if [ "${#FILES_TO_CHECK[@]}" -eq 0 ]; then
  exit 0  # nothing to check, silent pass
fi

# ----- per-pack gate check ----------------------------------------------------
FAILURES=0
TOTAL=${#FILES_TO_CHECK[@]}

echo "factcheck-gate: checking $TOTAL voyage pack(s) against the original-research skill"

for md_path in "${FILES_TO_CHECK[@]}"; do
  pack_name=$(basename "$md_path")
  sidecar="${md_path%.md}.factcheck.json"

  # R1: sidecar exists
  if [ ! -f "$sidecar" ]; then
    echo -e "  ${RED}✗${RST} $pack_name: SIDECAR MISSING ($sidecar)"
    echo "     → Copy $TEMPLATE_FILE to $sidecar and fill it in via primary-source research."
    FAILURES=$((FAILURES + 1))
    continue
  fi

  # R2: sidecar mtime >= .md mtime
  if [ "$md_path" -nt "$sidecar" ]; then
    echo -e "  ${RED}✗${RST} $pack_name: SIDECAR STALE (.md newer than .factcheck.json)"
    echo "     → Re-verify the claims that changed and update $sidecar's last_factcheck_date."
    FAILURES=$((FAILURES + 1))
    continue
  fi

  # R3: sidecar parses as valid JSON
  if ! python3 -c "import json; json.load(open('$sidecar'))" 2>/dev/null; then
    echo -e "  ${RED}✗${RST} $pack_name: SIDECAR MALFORMED (not valid JSON)"
    FAILURES=$((FAILURES + 1))
    continue
  fi

  # R4-R8: structural and content checks (run in Python for parsing)
  py_result=$(python3 - "$sidecar" "$pack_name" <<'PYEOF'
import json, sys, re, os

sidecar_path = sys.argv[1]
pack_name = sys.argv[2]
errors = []

with open(sidecar_path) as f:
    data = json.load(f)

# R4: required top-level categories
required = ['pack_filename', 'last_factcheck_date', 'ship_specs', 'christening', 'policies', 'superlatives', 'voice_audit']
for key in required:
    if key not in data:
        errors.append(f"missing required top-level key: '{key}'")

# R5: ship_specs minimum entries
if 'ship_specs' in data:
    for k in ['crew', 'gross_tonnage', 'decks']:
        v = data['ship_specs'].get(k)
        if not isinstance(v, dict) or not v.get('source'):
            errors.append(f"ship_specs.{k} missing or has no 'source' URL")

# R6: christening minimum entries
if 'christening' in data:
    for k in ['godparent', 'date']:
        v = data['christening'].get(k)
        if not isinstance(v, dict) or not v.get('source'):
            errors.append(f"christening.{k} missing or has no 'source' URL")

# R7: policies minimum entries
if 'policies' in data:
    for k in ['auto_gratuity_rate', 'laundry_availability']:
        v = data['policies'].get(k)
        if not isinstance(v, dict) or not v.get('source'):
            errors.append(f"policies.{k} missing or has no 'source' URL")

# R7b: voice_audit block (enforces voice-audit v2.2.0 attestation)
# Required by voice-audit doctrine at .claude/skills/voice-audit/SKILL.md.
# Added 2026-06-04 after the Anthem reader-feedback failure.
if 'voice_audit' in data:
    va = data['voice_audit']
    required_va_keys = ['audited_against', 'audit_date', 'audit_scope', 'risk_rating', 'cluster_detection']
    for k in required_va_keys:
        if k not in va:
            errors.append(f"voice_audit.{k} missing — required by voice-audit v2.2.0 sidecar schema")
    if isinstance(va.get('cluster_detection'), dict):
        verdict = va['cluster_detection'].get('verdict', '').lower()
        if verdict not in ('likely_human', 'unclear', 'likely_ai'):
            errors.append(f"voice_audit.cluster_detection.verdict must be one of: likely_human / unclear / likely_ai (got: '{verdict}')")
        if verdict == 'likely_ai':
            errors.append(f"voice_audit.cluster_detection.verdict is 'likely_ai' — pack must be restored before shipping (independent escalation trigger per voice-audit v2.2.0)")
    if isinstance(va.get('risk_rating'), str):
        if va['risk_rating'].lower() == 'high':
            errors.append(f"voice_audit.risk_rating is 'High' — pack must be revised before shipping per voice-audit v2.2.0")
    if isinstance(va.get('audit_scope'), str):
        scope_lower = va['audit_scope'].lower()
        if 'description' in scope_lower or 'summary' in scope_lower or 'cover' in scope_lower:
            errors.append(f"voice_audit.audit_scope appears to cover only a summary/description ('{va['audit_scope']}'); the audit must cover the FULL pack body per the Anthem June 2026 lesson")

# R8: scan all sources for forbidden patterns
def walk(node, path=''):
    if isinstance(node, dict):
        if 'source' in node and isinstance(node['source'], str):
            src = node['source']
            if 'admin/voyage-packs' in src or 'admin\\voyage-packs' in src:
                errors.append(f"COPY-PROPAGATION: {path or 'source'} cites another voyage pack ({src}); cite a primary source instead")
            if src.strip() == '' or src.strip().lower() in ('null', 'tbd', '<url>', '<primary url>'):
                # null/empty is OK for sidecar entries representing "removed superlative"
                # but only if disposition == 'removed'
                if node.get('disposition') != 'removed':
                    errors.append(f"placeholder source at {path or 'source'} (value: '{src}')")
        for k, v in node.items():
            walk(v, f"{path}.{k}" if path else k)
    elif isinstance(node, list):
        for i, v in enumerate(node):
            walk(v, f"{path}[{i}]")

walk(data)

if errors:
    print("FAIL")
    for e in errors:
        print(f"     → {e}")
else:
    print("PASS")
PYEOF
)

  if echo "$py_result" | head -1 | grep -q "FAIL"; then
    echo -e "  ${RED}✗${RST} $pack_name: SIDECAR CONTENT INCOMPLETE"
    echo "$py_result" | tail -n +2
    FAILURES=$((FAILURES + 1))
  else
    echo -e "  ${GRN}✓${RST} $pack_name"
  fi
done

# ----- final result -----------------------------------------------------------
echo ""
if [ "$FAILURES" -gt 0 ]; then
  echo -e "${RED}factcheck-gate: BLOCKED — $FAILURES of $TOTAL pack(s) failed the gate${RST}"
  echo ""
  echo "The original-research skill requires that every voyage pack ship with a fresh,"
  echo "complete .factcheck.json sidecar citing primary sources for every factual claim."
  echo ""
  echo "Next steps:"
  echo "  1. For each failed pack, copy $TEMPLATE_FILE to <pack>.factcheck.json"
  echo "  2. Open each primary source (Wikipedia ship article, cruise-line press release,"
  echo "     cruisedeckplans.com, etc.) via WebFetch in your session — do NOT cite from memory"
  echo "  3. Fill in every claim category with the verified value, source URL, and today's date"
  echo "  4. Re-stage the .md AND the .factcheck.json and re-commit"
  echo ""
  echo "Bypass (use only with explicit operator approval, log as an anomaly disposition):"
  echo "  git commit --no-verify"
  echo ""
  echo "Skill doctrine: .claude/skills/original-research/ORIGINAL-RESEARCH.md"
  echo "Soli Deo Gloria — the closing requires the contents be true."
  exit 1
fi

echo -e "${GRN}factcheck-gate: passed${RST}"
exit 0
