#!/usr/bin/env node
// no-getbets guard — PreToolUse hook on Write / Edit / MultiEdit.
//
// HARD BAN: the string "getbets" (case-insensitive) must never appear in
// content written to any production-facing file on this site.
//
// Rationale: getbets.us is an external US online-casino review site flagged
// by Scam Detector as suspect. AI grounding queries pairing our authoritative
// cruise-casino content with the getbets.us domain are either black-hat SEO
// probing or adversarial co-mention attempts. Adding any reference,
// disclaimer, or association — even defensive — would strengthen the
// adversarial pairing they are trying to create.
//
// This hook BLOCKS the Write/Edit/MultiEdit if the new content contains the
// substring "getbets" (case-insensitive) and the target file is not in the
// documented-exemption list below.
//
// Companion enforcement: .githooks/pre-commit also blocks on commit.
// Skill: .claude/skills/no-getbets/SKILL.md

const path = require('path');

// Paths legitimately allowed to mention "getbets" — they document the ban
// itself. Every other path is blocked.
const EXEMPT_PATH_PATTERNS = [
  /\.claude\/skills\/no-getbets\//,
  /\.claude\/hooks\/no-getbets-/,
  /\.claude\/standards\/no-getbets/,
  /\.githooks\/pre-commit$/,
  /(^|\/)CLAUDE\.md$/i,
  /(^|\/)SKILLS\.md$/,
  /(^|\/)AGENT\.md$/,
  /\/audit-reports\//,
  /admin\/check-no-getbets/,
  /admin\/seo\//,
];

let input = '';
const stdinTimeout = setTimeout(() => process.exit(0), 3000);
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
  clearTimeout(stdinTimeout);
  try {
    const data = JSON.parse(input);
    const toolName = data.tool_name;
    if (!['Write', 'Edit', 'MultiEdit'].includes(toolName)) {
      process.exit(0);
    }

    const filePath = data.tool_input?.file_path || '';
    if (EXEMPT_PATH_PATTERNS.some(re => re.test(filePath))) {
      process.exit(0);
    }

    let content = '';
    if (toolName === 'Write') content = data.tool_input?.content || '';
    else if (toolName === 'Edit') content = data.tool_input?.new_string || '';
    else if (toolName === 'MultiEdit') {
      const edits = data.tool_input?.edits || [];
      content = edits.map(e => e.new_string || '').join('\n');
    }
    if (!content || !/getbets/i.test(content)) {
      process.exit(0);
    }

    const denial = {
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason:
          `HARD BAN: write to ${path.basename(filePath)} contains the string "getbets".\n` +
          `cruisinginthewake.com does not reference getbets.us — see ` +
          `.claude/skills/no-getbets/SKILL.md for the rationale.\n` +
          `getbets.us is an external scam-flagged casino site. AI grounding probes have been ` +
          `pairing the domain with our authoritative cruise-casino content; any reference, ` +
          `disclaimer, or association would strengthen the adversarial pairing.\n` +
          `If you genuinely need to document the ban (skill/standard/audit-report files only), ` +
          `add the path to EXEMPT_PATH_PATTERNS in .claude/hooks/no-getbets-guard.js.`,
      },
    };
    process.stdout.write(JSON.stringify(denial));
  } catch {
    process.exit(0);
  }
});
