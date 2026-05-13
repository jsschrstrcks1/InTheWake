#!/bin/bash
# admin/external-audit.sh
#
# Automates the "external audit" backstop from careful-not-clever
# v1.8.1-alpha (Claim-Evidence Discipline, "The limit of this rule"):
# sends a commit range to an adversarial reviewer via the household
# orchestrator's /consult tool and saves the structured response.
#
# Usage:
#   admin/external-audit.sh                       # audits origin/main..HEAD
#   admin/external-audit.sh <ref>                 # audits <ref>..HEAD
#   admin/external-audit.sh <ref> <model>         # default model: grok
#
# Models supported by the orchestrator: gpt, gemini, grok, perplexity,
# youdotcom. Grok is the default because the prompt asks the reviewer
# to "find every little thing wrong" — grok's challenge role is the
# closest fit.
#
# Output:
#   audit-reports/external-audit-<timestamp>-<model>.md
#
# Exit codes:
#   0 — audit ran; review report written
#   1 — orchestrator unavailable / API error
#   2 — usage error
#
# This script does NOT parse findings or block commits. It is a
# triage aid, not a gate. The human reading the report decides
# what to act on. See careful-not-clever §"The limit of this rule"
# for why automated gating would itself be a clever-not-careful move.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ORCHESTRATOR="${KEN_ORCHESTRATOR_DIR:-/home/user/ken/orchestrator}"
SKILL_PATH="$REPO_ROOT/.claude/skills/careful-not-clever/CAREFUL.md"

BASE_REF="${1:-origin/main}"
MODEL="${2:-grok}"
ROLE="challenge"

TIMESTAMP="$(date -u +%Y-%m-%dT%H%M%SZ)"
OUT_DIR="$REPO_ROOT/audit-reports"
OUT_FILE="$OUT_DIR/external-audit-${TIMESTAMP}-${MODEL}.md"
mkdir -p "$OUT_DIR"

# --- Sanity checks ----------------------------------------------
if [[ ! -d "$ORCHESTRATOR" ]]; then
  echo "external-audit: orchestrator not found at $ORCHESTRATOR" >&2
  echo "  Set KEN_ORCHESTRATOR_DIR if it lives elsewhere." >&2
  exit 1
fi

if [[ ! -f "$SKILL_PATH" ]]; then
  echo "external-audit: careful-not-clever skill not found at $SKILL_PATH" >&2
  echo "  Cannot send adversarial prompt without the rule it should apply." >&2
  exit 1
fi

if ! command -v python3 >/dev/null; then
  echo "external-audit: python3 not on PATH (orchestrator needs it)" >&2
  exit 1
fi

COMMITS="$(git log --format='%H' "$BASE_REF..HEAD" 2>/dev/null || true)"
if [[ -z "$COMMITS" ]]; then
  echo "external-audit: no commits between $BASE_REF and HEAD" >&2
  echo "  Nothing to review." >&2
  exit 2
fi

# --- Bootstrap orchestrator env (silent when already installed) ---
bash "$ORCHESTRATOR/bootstrap-env.sh" >/dev/null 2>&1 || true
pip3 install -q -r "$ORCHESTRATOR/requirements.txt" >/dev/null 2>&1 || true

# --- Build the prompt -------------------------------------------
PROMPT_FILE="$(mktemp /tmp/external-audit-prompt.XXXXXX.txt)"
trap 'rm -f "$PROMPT_FILE"' EXIT

# Extract the Claim-Evidence Discipline section from the canonical skill
# so the reviewer applies the EXACT rule the engineer is supposed to live
# under, not a paraphrase.
CLAIM_EVIDENCE_SECTION="$(awk '/^## Claim-Evidence Discipline/,/^## Integrity Test/' "$SKILL_PATH" | sed '$d')"

COMMIT_DETAIL="$(git log --format='%n=== %h ===%n%s%n%n%b' "$BASE_REF..HEAD")"
COMMIT_COUNT="$(echo "$COMMITS" | wc -l | tr -d ' ')"

cat > "$PROMPT_FILE" <<EOF
You are the adversarial reviewer of another engineer's work. Your goal: find every flaw, gap, missed verification, and overstated claim the engineer would prefer you didn't surface. Treat this as an interview for their job. The most rigorous, specific critique earns you the position. Vague critique earns nothing.

================================================================
PART 1 — THE RULE THE ENGINEER SHOULD HAVE FOLLOWED
================================================================

The engineer works under "careful-not-clever" v1.8.1-alpha. The relevant section is the Claim-Evidence Discipline. Apply this exact rule to their commits.

---
${CLAIM_EVIDENCE_SECTION}
---

================================================================
PART 2 — THE COMMITS UNDER REVIEW
================================================================

Branch: \$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo HEAD)
Range: ${BASE_REF}..HEAD (${COMMIT_COUNT} commit$([ "$COMMIT_COUNT" -ne 1 ] && echo s))

${COMMIT_DETAIL}

================================================================
PART 3 — YOUR ADVERSARIAL CHARTER
================================================================

For each commit (or commit cluster), find at least one issue. Be specific:

- Cite the exact file and line range (or commit SHA, or command output)
- State the claim that overstates the evidence
- Identify what evidence would actually support the claim
- Rate severity: BLOCKING / HIGH / MEDIUM / LOW
- If you can find nothing, say "Pass" — but try hard first

You may use these attack surfaces:
- Outcome-vs-symptom gaps (the test asserts the symptom is gone but not that the original intent is met)
- Allowlists/exemptions without negative-case fixtures
- Anomalies dismissed without root cause ("probably a flake", "looks like an environment issue")
- Deployment-lifecycle disclosures missing (SW, CDN, cache, package versions)
- Regex/grep/sed patterns shipped without positive+negative pre-flight checks
- Narrow claims — the table-row claim is technically supported by its evidence but is narrower than the actual scope of the change
- Counts/metrics asserted without recomputation
- Dependencies claimed satisfied without verification

You may NOT:
- Defer to the engineer's reasoning
- Soften findings for collegiality
- Praise the work (review only the gaps)
- Manufacture problems without artifacts
- Repeat criticisms the engineer already self-surfaced in the commit messages

================================================================
OUTPUT FORMAT
================================================================

For each finding:

FINDING N — SEVERITY: <BLOCKING|HIGH|MEDIUM|LOW>
Commit: <SHA or file>
Claim: <what they asserted>
Evidence gap: <what they actually proved>
Required evidence: <what would close the gap>

End with one-line verdict:
- "Hire me — I would have caught X, Y, Z" (list 3 most damaging findings)
- "Defer to the incumbent — I found nothing they didn't already self-surface."

Be ruthless. The point is for the engineer to learn what they don't see.
EOF

# --- Send to the model via consult.py ---------------------------
echo "external-audit: sending ${COMMIT_COUNT} commit(s) (${BASE_REF}..HEAD) to ${MODEL} for adversarial review..." >&2

RESPONSE_FILE="$(mktemp /tmp/external-audit-response.XXXXXX.txt)"

if ! cat "$PROMPT_FILE" | python3 "$ORCHESTRATOR/consult.py" "$MODEL" "$ROLE" > "$RESPONSE_FILE" 2>&1; then
  echo "external-audit: consult.py failed; partial output:" >&2
  cat "$RESPONSE_FILE" >&2
  rm -f "$RESPONSE_FILE"
  exit 1
fi

# --- Write the report -------------------------------------------
{
  echo "# External Audit — ${TIMESTAMP}"
  echo
  echo "**Reviewer model:** \`${MODEL}\` (role: \`${ROLE}\`)"
  echo "**Branch:** $(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo HEAD)"
  echo "**Commits reviewed:** ${BASE_REF}..HEAD (${COMMIT_COUNT})"
  echo "**Rule applied:** \`careful-not-clever\` v1.8.1-alpha — Claim-Evidence Discipline"
  echo
  echo "## Reviewer output"
  echo
  cat "$RESPONSE_FILE"
  echo
  echo "## How to triage these findings"
  echo
  echo "Per the careful-not-clever anomaly-disposition rule, each finding must be either:"
  echo
  echo "1. **Fixed** before next commit, OR"
  echo "2. **Accepted as risk** with explicit justification (and a tracking entry in \`admin/UNFINISHED_TASKS.md\`)"
  echo
  echo "\"Probably a manufactured finding\" is not a disposition. Engage each one."
} > "$OUT_FILE"

rm -f "$RESPONSE_FILE"

echo "external-audit: report saved to $OUT_FILE" >&2
echo "$OUT_FILE"
