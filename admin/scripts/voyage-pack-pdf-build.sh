#!/bin/bash
# voyage-pack-pdf-build.sh — generate PDF deliverables from Voyage Pack markdown sources
#
# Usage:
#   admin/scripts/voyage-pack-pdf-build.sh                  # build all packs (skip if up-to-date)
#   admin/scripts/voyage-pack-pdf-build.sh symphony         # build only Symphony
#   admin/scripts/voyage-pack-pdf-build.sh ncl-aqua         # build only NCL Aqua
#   admin/scripts/voyage-pack-pdf-build.sh sisters-sea      # build only Sisters at Sea (Resilient Lady)
#   admin/scripts/voyage-pack-pdf-build.sh anthem-alaska    # build only Anthem of the Seas Alaska 7N
#   admin/scripts/voyage-pack-pdf-build.sh seaside-bahamas  # build only MSC Seaside Bahamas 4N
#   admin/scripts/voyage-pack-pdf-build.sh luna-solo        # build only NCL Luna Tina solo group May 2026
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
#     by default. Packs may opt out by setting a non-empty *_PDF variable
#     at the top of the script — e.g. SEASIDE_BAHAMAS_PDF="ships/msc/..."
#     routes that pack's PDF to a custom path. The .md source stays
#     canonical in admin/voyage-packs/ regardless.
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
SISTERS_SEA_MD="$PACKS_DIR/v0.1.3-virgin-sisters-sea-feb-2027.md"
ANTHEM_ALASKA_MD="$PACKS_DIR/v0.1.4-rcl-anthem-alaska-7n.md"
SEASIDE_BAHAMAS_MD="$PACKS_DIR/v0.1.5-msc-seaside-bahamas-4n.md"
LUNA_SOLO_MD="$PACKS_DIR/v0.1.6-ncl-luna-solo-group-may-2026.md"
BLISS_SOLO_MD="$PACKS_DIR/v0.1.7-ncl-bliss-alaska-solo-group-jul-2026.md"

# PDF output path per pack. Empty = default (next to the .md source).
# Override when a pack wants its PDF co-located somewhere else (e.g. alongside
# its ship page). The .md source stays canonical in $PACKS_DIR regardless.
SYMPHONY_PDF=""
NCL_AQUA_PDF=""
SISTERS_SEA_PDF=""
ANTHEM_ALASKA_PDF=""
SEASIDE_BAHAMAS_PDF="ships/msc/v0.1.5-msc-seaside-bahamas-4n.pdf"
LUNA_SOLO_PDF="ships/norwegian/v0.1.6-ncl-luna-solo-group-may-2026.pdf"
BLISS_SOLO_PDF="ships/norwegian/v0.1.7-ncl-bliss-alaska-solo-group-jul-2026.pdf"

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

# ----- output-path resolver ---------------------------------------------------
# Resolve the PDF output path for a pack: override if non-empty, else default
# (next to the .md source).
pdf_path_for() {
  local md="$1"
  local override="${2:-}"
  if [ -n "$override" ]; then
    echo "$override"
  else
    echo "${md%.md}.pdf"
  fi
}

# ----- staleness check --------------------------------------------------------
# Bash convention: returns 0 (success/yes) if PDF IS stale, 1 if up-to-date.
# A PDF is stale if it is missing OR if the .md source is newer than the .pdf.
pdf_is_stale() {
  local md="$1"
  local pdf
  pdf="$(pdf_path_for "$md" "${2:-}")"

  if [ ! -f "$pdf" ]; then return 0; fi      # missing → stale
  if [ "$md" -nt "$pdf" ]; then return 0; fi # source newer → stale
  return 1                                   # not stale (PDF exists and is newer than source)
}

# ----- per-pack build ---------------------------------------------------------
# Args: md_path  label  engine  [output_pdf_override]
# If output_pdf_override is empty/omitted, PDF lands next to the .md source.
build_pack() {
  local md="$1"
  local label="$2"
  local engine="$3"
  local output_pdf="${4:-}"

  if [ ! -f "$md" ]; then
    echo "  ✗ $label: source not found at $md" >&2
    return 1
  fi

  if [ ! -f "$PDF_CSS" ]; then
    echo "  ✗ $label: stylesheet not found at $PDF_CSS" >&2
    return 1
  fi

  local pdf
  pdf="$(pdf_path_for "$md" "$output_pdf")"

  # Ensure the output directory exists (may differ from the .md's directory
  # when a pack uses an output_pdf override).
  mkdir -p "$(dirname "$pdf")"

  # Idempotency: skip if PDF is newer than .md (unless --force)
  if [ "$FORCE" -eq 0 ] && [ -f "$pdf" ] && [ "$pdf" -nt "$md" ]; then
    echo "  · $label: up-to-date, skipping ($pdf newer than source)"
    return 0
  fi

  echo "  → $label ($(basename "$md")) using $engine"

  case "$engine" in
    weasyprint|wkhtmltopdf)
      # Pipe-through sed converts /asset/path style paths in the markdown
      # (consistent with the HTML version's absolute-from-repo-root convention)
      # into file:// URLs that weasyprint can resolve as filesystem paths.
      # Without this, weasyprint reads /assets/... as filesystem-root-absolute
      # (standards-compliant) and fails to find the images.
      # Pipe-through sed converts /asset/path style paths to file:// URLs
      # weasyprint can resolve.
      # Note: we deliberately omit --metadata title and --toc here. The
      # markdown source's first H1 becomes the document title; the cover
      # page is built into the source so we control its layout. Pandoc's
      # auto-generated TOC was visually crude and used the broken-encoding
      # title — better to handle TOC inside the source if needed at all.
      sed "s|](/|](file://$REPO_ROOT/|g" "$md" | pandoc \
        --pdf-engine="$engine" \
        --css="$PDF_CSS" \
        --metadata author="In the Wake" \
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
# Parallel arrays: pack md path and its corresponding output_pdf override.
# Keep these two arrays in sync — index N is the same pack in both.
run_check_only() {
  local stale=0
  echo "Voyage Pack PDF staleness check"
  echo ""
  local mds=("$SYMPHONY_MD" "$NCL_AQUA_MD" "$SISTERS_SEA_MD" "$ANTHEM_ALASKA_MD" "$SEASIDE_BAHAMAS_MD" "$LUNA_SOLO_MD" "$BLISS_SOLO_MD")
  local pdfs=("$SYMPHONY_PDF" "$NCL_AQUA_PDF" "$SISTERS_SEA_PDF" "$ANTHEM_ALASKA_PDF" "$SEASIDE_BAHAMAS_PDF" "$LUNA_SOLO_PDF" "$BLISS_SOLO_PDF")
  local i
  for i in "${!mds[@]}"; do
    local md="${mds[$i]}"
    local override="${pdfs[$i]}"
    if [ ! -f "$md" ]; then
      continue  # source missing — not this script's concern
    fi
    local pdf
    pdf="$(pdf_path_for "$md" "$override")"
    local label
    label=$(basename "$md" .md)
    if pdf_is_stale "$md" "$override"; then
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
    symphony|ncl-aqua|aqua|ncl|sisters-sea|sisters|virgin|anthem-alaska|anthem|alaska|seaside-bahamas|seaside|msc|luna-solo|luna|bliss-solo|bliss|all) target="$arg" ;;
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
    build_pack "$SYMPHONY_MD" "Symphony Western Caribbean 7N" "$ENGINE" "$SYMPHONY_PDF" || failures=$((failures + 1))
    ;;
  ncl-aqua|aqua|ncl)
    build_pack "$NCL_AQUA_MD" "NCL Aqua Veterans/Solo Dec 2027" "$ENGINE" "$NCL_AQUA_PDF" || failures=$((failures + 1))
    ;;
  sisters-sea|sisters|virgin)
    build_pack "$SISTERS_SEA_MD" "Sisters at Sea — Resilient Lady Feb 2027" "$ENGINE" "$SISTERS_SEA_PDF" || failures=$((failures + 1))
    ;;
  anthem-alaska|anthem|alaska)
    build_pack "$ANTHEM_ALASKA_MD" "Anthem of the Seas — Alaska 7N" "$ENGINE" "$ANTHEM_ALASKA_PDF" || failures=$((failures + 1))
    ;;
  seaside-bahamas|seaside|msc)
    build_pack "$SEASIDE_BAHAMAS_MD" "MSC Seaside — Bahamas 4N" "$ENGINE" "$SEASIDE_BAHAMAS_PDF" || failures=$((failures + 1))
    ;;
  luna-solo|luna)
    build_pack "$LUNA_SOLO_MD" "NCL Luna — Tina Solo Group May 2026" "$ENGINE" "$LUNA_SOLO_PDF" || failures=$((failures + 1))
    ;;
  bliss-solo|bliss)
    build_pack "$BLISS_SOLO_MD" "NCL Bliss — Kristie Solo Group Jul 2026" "$ENGINE" "$BLISS_SOLO_PDF" || failures=$((failures + 1))
    ;;
  all|"")
    build_pack "$SYMPHONY_MD" "Symphony Western Caribbean 7N" "$ENGINE" "$SYMPHONY_PDF" || failures=$((failures + 1))
    build_pack "$NCL_AQUA_MD" "NCL Aqua Veterans/Solo Dec 2027" "$ENGINE" "$NCL_AQUA_PDF" || failures=$((failures + 1))
    build_pack "$SISTERS_SEA_MD" "Sisters at Sea — Resilient Lady Feb 2027" "$ENGINE" "$SISTERS_SEA_PDF" || failures=$((failures + 1))
    build_pack "$ANTHEM_ALASKA_MD" "Anthem of the Seas — Alaska 7N" "$ENGINE" "$ANTHEM_ALASKA_PDF" || failures=$((failures + 1))
    build_pack "$SEASIDE_BAHAMAS_MD" "MSC Seaside — Bahamas 4N" "$ENGINE" "$SEASIDE_BAHAMAS_PDF" || failures=$((failures + 1))
    build_pack "$LUNA_SOLO_MD" "NCL Luna — Tina Solo Group May 2026" "$ENGINE" "$LUNA_SOLO_PDF" || failures=$((failures + 1))
    build_pack "$BLISS_SOLO_MD" "NCL Bliss — Kristie Solo Group Jul 2026" "$ENGINE" "$BLISS_SOLO_PDF" || failures=$((failures + 1))
    ;;
  *)
    echo "✗ Unknown target: $target. Use 'symphony', 'ncl-aqua', 'sisters-sea', 'anthem-alaska', 'seaside-bahamas', 'luna-solo', 'bliss-solo', or 'all'."
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

