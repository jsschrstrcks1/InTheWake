#!/bin/bash
# voyage-pack-pdf-build.sh — generate PDF deliverables from Voyage Pack markdown sources
#
# Usage:
#   admin/scripts/voyage-pack-pdf-build.sh                  # build all packs (skip if up-to-date)
#   admin/scripts/voyage-pack-pdf-build.sh symphony         # build only Symphony
#   admin/scripts/voyage-pack-pdf-build.sh ncl-aqua         # build only NCL Aqua
#   admin/scripts/voyage-pack-pdf-build.sh --force          # rebuild even if PDF is newer
#   admin/scripts/voyage-pack-pdf-build.sh --check          # exit 1 if any PDF is stale (no build)
#   admin/scripts/voyage-pack-pdf-build.sh --help
#
# What this script does:
#   - Detects an available pandoc PDF engine (weasyprint preferred)
#   - Idempotent by default: only rebuilds a pack if the .pdf is missing or older than the .md
#   - --force always rebuilds
#   - --check exits non-zero if any pack PDF is stale (used by pre-commit)
#   - Writes the PDF alongside the markdown source in admin/voyage-packs/
#
# Workflow:
#   - Generate the PDF once per pack version (one-time, not on every build)
#   - When the markdown source changes, regenerate (the pre-commit hook
#     enforces this — committing a modified pack .md without rebuilding
#     the .pdf is blocked)
#   - Upload the .pdf to the payment processor's product configuration once
#
# Prerequisites:
#   pandoc (always required):
#     macOS:    brew install pandoc
#     Debian:   apt install pandoc
#   plus ONE of these PDF engines:
#     weasyprint (recommended — best CSS support, pip3 install weasyprint)
#     wkhtmltopdf (legacy fallback, apt install wkhtmltopdf)
#     xelatex / pdflatex (texlive — apt install texlive-latex-recommended)
#
# Soli Deo Gloria.

set -uo pipefail

# Locate repo root regardless of where the script is invoked from
REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$REPO_ROOT"

PACKS_DIR="admin/voyage-packs"
SYMPHONY_MD="$PACKS_DIR/v0.1-symphony-western-caribbean-7n.md"
NCL_AQUA_MD="$PACKS_DIR/v0.1.2-ncl-aqua-veterans-solo-group-dec-2027.md"
PDF_CSS="$PACKS_DIR/voyage-pack-print.css"

# Mode flags
FORCE=0
CHECK_ONLY=0

# ----- engine detection -------------------------------------------------------
detect_pdf_engine() {
  for engine in weasyprint wkhtmltopdf xelatex pdflatex; do
    if command -v "$engine" >/dev/null 2>&1; then
      echo "$engine"
      return 0
    fi
  done
  return 1
}

# ----- staleness check --------------------------------------------------------
# Bash convention: returns 0 (success/yes) if PDF IS stale, 1 if up-to-date.
# A PDF is stale if it is missing OR if the .md source is newer than the .pdf.
pdf_is_stale() {
  local md="$1"
  local pdf="${md%.md}.pdf"

  if [ ! -f "$pdf" ]; then return 0; fi      # missing → stale
  if [ "$md" -nt "$pdf" ]; then return 0; fi # source newer → stale
  return 1                                   # not stale (PDF exists and is newer than source)
}

# ----- per-pack build ---------------------------------------------------------
build_pack() {
  local md="$1"
  local label="$2"
  local engine="$3"

  if [ ! -f "$md" ]; then
    echo "  ✗ $label: source not found at $md" >&2
    return 1
  fi

  if [ ! -f "$PDF_CSS" ]; then
    echo "  ✗ $label: stylesheet not found at $PDF_CSS" >&2
    return 1
  fi

  local pdf="${md%.md}.pdf"

  # Idempotency: skip if PDF is newer than .md (unless --force)
  if [ "$FORCE" -eq 0 ] && [ -f "$pdf" ] && [ "$pdf" -nt "$md" ]; then
    echo "  · $label: up-to-date, skipping ($pdf newer than source)"
    return 0
  fi

  echo "  → $label ($(basename "$md")) using $engine"

  case "$engine" in
    weasyprint|wkhtmltopdf)
      pandoc "$md" \
        --pdf-engine="$engine" \
        --css="$PDF_CSS" \
        --metadata title="In the Wake — Voyage Pack" \
        --metadata author="In the Wake" \
        --toc --toc-depth=2 \
        --standalone \
        -o "$pdf"
      ;;
    xelatex|pdflatex)
      pandoc "$md" \
        --pdf-engine="$engine" \
        --metadata title="In the Wake — Voyage Pack" \
        --metadata author="In the Wake" \
        --toc --toc-depth=2 \
        -V geometry:margin=0.85in \
        -V fontsize=11pt \
        -V mainfont="Georgia" \
        -V colorlinks=true \
        -V linkcolor="0a3d62" \
        -o "$pdf"
      ;;
    *)
      echo "  ✗ unsupported engine: $engine" >&2
      return 1
      ;;
  esac

  if [ -f "$pdf" ]; then
    local size
    size=$(wc -c < "$pdf")
    echo "  ✓ $label → $pdf ($((size / 1024))KB)"
    return 0
  else
    echo "  ✗ $label: build failed (no output)" >&2
    return 1
  fi
}

# ----- check-only mode --------------------------------------------------------
# Used by pre-commit. Lists every stale pack and exits 1 if any are stale.
run_check_only() {
  local stale=0
  echo "Voyage Pack PDF staleness check"
  echo ""
  for md in "$SYMPHONY_MD" "$NCL_AQUA_MD"; do
    if [ ! -f "$md" ]; then
      continue  # source missing — not this script's concern
    fi
    local pdf="${md%.md}.pdf"
    local label
    label=$(basename "$md" .md)
    if pdf_is_stale "$md"; then
      if [ ! -f "$pdf" ]; then
        echo "  ✗ $label: PDF MISSING ($pdf)"
      else
        echo "  ✗ $label: PDF STALE ($pdf older than $md)"
      fi
      stale=$((stale + 1))
    else
      echo "  ✓ $label: PDF up-to-date"
    fi
  done
  echo ""
  if [ "$stale" -gt 0 ]; then
    echo "$stale pack(s) need a rebuilt PDF. Run:"
    echo "    admin/scripts/voyage-pack-pdf-build.sh"
    return 1
  fi
  return 0
}

# ----- main -------------------------------------------------------------------
target=""
for arg in "$@"; do
  case "$arg" in
    -h|--help|help)
      sed -n '2,30p' "$0"
      exit 0
      ;;
    --force) FORCE=1 ;;
    --check) CHECK_ONLY=1 ;;
    symphony|ncl-aqua|aqua|ncl|all) target="$arg" ;;
    *)
      echo "Unknown argument: $arg. Use --help for usage."
      exit 2
      ;;
  esac
done

# --check mode short-circuits — no engine needed
if [ "$CHECK_ONLY" -eq 1 ]; then
  run_check_only
  exit $?
fi

if ! command -v pandoc >/dev/null 2>&1; then
  echo "✗ pandoc is required. Install:"
  echo "    brew install pandoc      (macOS)"
  echo "    apt install pandoc       (Debian/Ubuntu)"
  exit 1
fi

ENGINE=$(detect_pdf_engine || true)
if [ -z "$ENGINE" ]; then
  echo "✗ No PDF engine found. Install ONE of:"
  echo "    pip3 install weasyprint                (recommended — best CSS)"
  echo "    apt install wkhtmltopdf                (legacy fallback)"
  echo "    apt install texlive-latex-recommended  (xelatex/pdflatex)"
  exit 1
fi

echo "Voyage Pack PDF build"
echo "  pandoc  : $(command -v pandoc)"
echo "  engine  : $ENGINE"
echo "  packs   : $PACKS_DIR"
echo "  mode    : $([ "$FORCE" -eq 1 ] && echo "force-rebuild" || echo "idempotent (skip if up-to-date)")"
echo ""

target="${target:-all}"
failures=0

case "$target" in
  symphony)
    build_pack "$SYMPHONY_MD" "Symphony Western Caribbean 7N" "$ENGINE" || failures=$((failures + 1))
    ;;
  ncl-aqua|aqua|ncl)
    build_pack "$NCL_AQUA_MD" "NCL Aqua Veterans/Solo Dec 2027" "$ENGINE" || failures=$((failures + 1))
    ;;
  all|"")
    build_pack "$SYMPHONY_MD" "Symphony Western Caribbean 7N" "$ENGINE" || failures=$((failures + 1))
    build_pack "$NCL_AQUA_MD" "NCL Aqua Veterans/Solo Dec 2027" "$ENGINE" || failures=$((failures + 1))
    ;;
  *)
    echo "✗ Unknown target: $target. Use 'symphony', 'ncl-aqua', or 'all'."
    exit 2
    ;;
esac

echo ""
if [ "$failures" -eq 0 ]; then
  echo "Done. PDFs are alongside their .md sources."
  echo "Re-uploading the .pdf to your payment processor's product entry is only"
  echo "needed when the .md source changes (the pre-commit hook will block"
  echo "commits that change a pack .md without an updated .pdf)."
  exit 0
else
  echo "$failures pack(s) failed to build. See errors above."
  exit 1
fi

