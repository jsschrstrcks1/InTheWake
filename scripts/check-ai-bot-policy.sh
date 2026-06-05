#!/usr/bin/env bash
# ============================================================================
# check-ai-bot-policy.sh — verify the live Cloudflare AI training-bot block.
#
# Why this exists:
#   robots.txt documents (see its "AI-bot policy" header) that Cloudflare
#   PREPENDS an AI-Bot Block at the live edge, disallowing the major AI
#   training crawlers. That enforcement lives in the Cloudflare dashboard
#   (Security -> Bots -> AI Audit), NOT in this repo — so nothing in a git
#   diff proves it is still configured. A dashboard change would silently
#   drop the protection with no commit to catch it.
#
#   This script fetches the live robots.txt and fails if any documented
#   training-bot "Disallow: /" rule has disappeared. Run on a schedule by
#   .github/workflows/ai-bot-policy.yml; also runnable by hand.
#
# Usage:  scripts/check-ai-bot-policy.sh [ROBOTS_URL]
# Exit:   0 = all training bots still blocked
#         1 = one or more blocks missing (policy regression)
#         2 = could not fetch robots.txt (transient/network — not a policy verdict)
# ============================================================================
set -uo pipefail

URL="${1:-https://cruisinginthewake.com/robots.txt}"

# Training crawlers that MUST remain "Disallow: /" at the edge.
# Source of truth: the AI-bot policy header in robots.txt. Keep in sync if that
# documented list changes.
EXPECTED_BLOCKED=(
  GPTBot
  ClaudeBot
  Google-Extended
  CCBot
  Bytespider
  Amazonbot
  Applebot-Extended
  meta-externalagent
  CloudflareBrowserRenderingCrawler
)

robots="$(curl -sS -L --fail --max-time 30 --retry 3 --retry-delay 5 "$URL")" || {
  echo "ERROR: could not fetch $URL (network/HTTP error). Not a policy verdict." >&2
  exit 2
}
if [ -z "$robots" ]; then
  echo "ERROR: empty response from $URL. Not a policy verdict." >&2
  exit 2
fi
# Sanity: a real robots.txt has User-agent stanzas. A soft-404 HTML page, a
# Cloudflare challenge, or a misrouted response can return HTTP 200 with a body
# that has none — that is a fetch/infra problem, NOT a policy regression. Guard
# against it so such cases exit 2 (transient) rather than falsely reporting that
# every block disappeared (exit 1).
if ! printf '%s\n' "$robots" | grep -qiE "^User-agent:"; then
  echo "ERROR: response from $URL is not a robots.txt (no 'User-agent:' lines). Not a policy verdict." >&2
  exit 2
fi

missing=()
for bot in "${EXPECTED_BLOCKED[@]}"; do
  # A "User-agent: <bot>" line must be immediately followed by "Disallow: /".
  if ! printf '%s\n' "$robots" \
      | grep -A1 -E "^User-agent:[[:space:]]*${bot}[[:space:]]*$" \
      | grep -qE "^Disallow:[[:space:]]*/[[:space:]]*$"; then
    missing+=("$bot")
  fi
done

if [ "${#missing[@]}" -gt 0 ]; then
  echo "FAIL: live AI training-bot block missing for ${#missing[@]} crawler(s): ${missing[*]}" >&2
  echo "The Cloudflare AI-Bot Block (Security -> Bots -> AI Audit) appears disabled" >&2
  echo "or changed. Live robots.txt at $URL no longer disallows the above." >&2
  exit 1
fi

echo "OK: all ${#EXPECTED_BLOCKED[@]} AI training crawlers still 'Disallow: /' at $URL"
