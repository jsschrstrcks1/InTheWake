#!/bin/bash
# ============================================================================
# Session Start Guardrail Hook — v1.0.0
#
# CRITICAL: This hook runs on EVERY UserPromptSubmit and injects the
# careful-not-clever guardrail into Claude's context.
#
# This hook exists because Claude kept "forgetting" the rules that had been
# established for weeks. The TypeScript skill-activation-prompt.ts was missing
# entirely, causing silent failures.
#
# This hook is SIMPLE by design:
# - Pure bash, no dependencies
# - Reads the CAREFUL.md file directly
# - Outputs to stdout (which Claude sees as context)
# - Cannot fail silently - if the file is missing, it errors loudly
#
# Soli Deo Gloria
# ============================================================================

set -e

# Get the project directory
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
CAREFUL_FILE="$PROJECT_DIR/.claude/skills/careful-not-clever/CAREFUL.md"
CLAUDE_FILE="$PROJECT_DIR/admin/claude/CLAUDE.md"

# Consume stdin (required by hook protocol)
cat > /dev/null

# ============================================================================
# ALWAYS OUTPUT THE GUARDRAIL - EVERY SINGLE TIME
# ============================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚠️  MANDATORY SESSION GUARDRAIL — READ BEFORE ANY ACTION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if CAREFUL.md exists - fail LOUDLY if not
if [ ! -f "$CAREFUL_FILE" ]; then
    echo "🚨 CRITICAL ERROR: CAREFUL.md not found at $CAREFUL_FILE"
    echo "🚨 This guardrail file is REQUIRED. Something is wrong with the repo."
    echo ""
    echo "The careful-not-clever guardrail MUST exist. Do not proceed."
    exit 0  # Exit 0 so Claude sees this message
fi

# Output the guardrail content
echo "📋 CAREFUL-NOT-CLEVER GUARDRAIL (CRITICAL PRIORITY):"
echo ""
cat "$CAREFUL_FILE"
echo ""

# Add a reminder about CLAUDE.md
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📚 ADDITIONAL REQUIRED READING:"
echo ""
echo "Before modifying ANY file, you MUST be familiar with:"
echo "  1. admin/claude/CLAUDE.md — Complete project guide"
echo "  2. .claude/ONBOARDING.md — System overview"
echo "  3. .claude/skill-rules.json — All 9 skill rules"
echo ""
echo "If you haven't read these in this session, READ THEM NOW."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Exit 0 to allow processing (stdout goes to Claude's context)
exit 0
