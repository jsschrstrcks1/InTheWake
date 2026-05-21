#!/usr/bin/env node
/**
 * check-activity-row-qualifiers.js
 *
 * Guardrail against the "constraint stripping" pattern documented in
 * admin/CAREFUL_NOT_CLEVER_FAILURE_2026_05_21.md §2.
 *
 * What it does:
 *   For each port HTML file passed on the command line (or all of ports/ if
 *   no args), compare the working-tree content against HEAD. If an
 *   <div class="activity-row"> month-cell HAD a parenthetical qualifier
 *   in HEAD ("(Saturdays)", "(last Tuesday)", "(best Oct-Mar)", etc.) and
 *   does NOT have one in the working tree, flag the change.
 *
 *   Stripping a qualifier to satisfy the weather validator's D_MONTH check
 *   is data loss. The qualifier carries planning-relevant information that
 *   readers need (Salamanca Market is Saturdays only; Up Helly Aa is the
 *   last Tuesday in January; La Coruna seafood is freshest Oct-Mar). The
 *   careful move is to preserve the qualifier elsewhere on the page, log
 *   the regex narrowness in admin/VALIDATOR_REGEX_ISSUES.md (REGEX-03), or
 *   negotiate with the user before stripping.
 *
 *   This script does NOT prevent the commit. It emits a warning and exits
 *   non-zero so a pre-commit hook can choose to block, but the default is
 *   advisory. The author still has to decide.
 *
 * Usage:
 *   node scripts/check-activity-row-qualifiers.js                 # scan all ports/*.html with uncommitted changes
 *   node scripts/check-activity-row-qualifiers.js ports/foo.html  # scan one file
 *   node scripts/check-activity-row-qualifiers.js --staged        # scan files staged for commit
 *
 * Exit codes:
 *   0 — no qualifier-strip detected (or no files to check)
 *   1 — at least one qualifier-strip detected
 *   2 — script error (file missing, git not available, etc.)
 */

const { execSync } = require('child_process');
const { readFileSync, existsSync } = require('fs');

const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const GREEN = '\x1b[32m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

// Match <div class="activity-row"> blocks and capture the months cell.
// The months cell is the second <span> inside the activity-row.
const ROW_RE = /<div class="activity-row"><span class="activity-label">([^<]+)<\/span><span class="activity-months">([^<]+)<\/span><\/div>/g;

// A "qualifier" is anything in parens inside the months cell, OR any text
// that isn't a comma-separated month list and isn't the bare token "N/A".
// We catch both shapes to avoid false negatives.
function extractQualifier(monthsText) {
  // Parenthetical: "(Saturdays)", "(best Oct-Mar)", "(last Tuesday)", etc.
  const paren = monthsText.match(/\(([^)]+)\)/);
  if (paren) return { kind: 'paren', text: paren[1].trim() };

  // Year-round + suffix: "Year-round, best Oct-Mar"
  if (/^Year-round\b/.test(monthsText) && monthsText.length > 'Year-round'.length) {
    return { kind: 'year-round-suffix', text: monthsText.replace(/^Year-round[,]?\s*/, '').trim() };
  }

  return null;
}

function parseRows(html) {
  const rows = new Map();
  let m;
  ROW_RE.lastIndex = 0;
  while ((m = ROW_RE.exec(html)) !== null) {
    const label = m[1].trim();
    const months = m[2].trim();
    rows.set(label, months);
  }
  return rows;
}

function getHeadContent(filepath) {
  try {
    return execSync(`git show HEAD:${filepath}`, { encoding: 'utf8' });
  } catch (err) {
    return null; // file is new in working tree
  }
}

function changedFilesFromGit(staged) {
  const cmd = staged
    ? 'git diff --cached --name-only --diff-filter=AM -- "ports/*.html"'
    : 'git diff --name-only --diff-filter=AM -- "ports/*.html"';
  try {
    const out = execSync(cmd, { encoding: 'utf8' });
    return out.split('\n').filter(line => line.endsWith('.html'));
  } catch (err) {
    console.error(`${RED}error:${RESET} ${err.message}`);
    process.exit(2);
  }
}

function checkFile(filepath) {
  const flags = [];

  if (!existsSync(filepath)) {
    return { filepath, error: 'not found', flags };
  }

  const headContent = getHeadContent(filepath);
  if (headContent === null) {
    // New file — no prior version to compare against. Skip.
    return { filepath, skipped: 'new file', flags };
  }

  const workContent = readFileSync(filepath, 'utf8');
  const headRows = parseRows(headContent);
  const workRows = parseRows(workContent);

  for (const [label, headMonths] of headRows) {
    const headQual = extractQualifier(headMonths);
    if (!headQual) continue;

    // The label may have changed in the working tree. Try direct lookup first,
    // then fall back to a fuzzy lookup on the label's first word (handles
    // "Salamanca Market" -> "Salamanca Market" but also tolerates minor edits).
    let workMonths = workRows.get(label);
    if (!workMonths) {
      // Did this row get removed entirely? Try to find a sibling with the same label prefix.
      const firstWord = label.split(/\s+/)[0];
      for (const [wLabel, wMonths] of workRows) {
        if (wLabel.startsWith(firstWord)) {
          workMonths = wMonths;
          break;
        }
      }
    }

    if (!workMonths) {
      // Row was removed entirely. Not a qualifier-strip per se, but flag it
      // because the qualifier was lost.
      flags.push({
        label,
        head: headMonths,
        work: '(row removed)',
        qualifier: headQual.text,
      });
      continue;
    }

    const workQual = extractQualifier(workMonths);
    if (!workQual) {
      // HEAD had a qualifier, working tree does not. Constraint-strip.
      flags.push({
        label,
        head: headMonths,
        work: workMonths,
        qualifier: headQual.text,
      });
    }
  }

  return { filepath, flags };
}

function main() {
  const args = process.argv.slice(2);
  const staged = args.includes('--staged');
  const fileArgs = args.filter(a => !a.startsWith('--'));

  let files;
  if (fileArgs.length > 0) {
    files = fileArgs;
  } else {
    files = changedFilesFromGit(staged);
  }

  if (files.length === 0) {
    console.log(`${GREEN}check-activity-row-qualifiers:${RESET} no changed port files`);
    process.exit(0);
  }

  let totalFlags = 0;
  let filesWithFlags = 0;

  for (const filepath of files) {
    const result = checkFile(filepath);
    if (result.error) {
      console.log(`${YELLOW}skip:${RESET} ${filepath} (${result.error})`);
      continue;
    }
    if (result.skipped) {
      continue;
    }
    if (result.flags.length === 0) {
      continue;
    }

    filesWithFlags++;
    console.log(`\n${BOLD}${YELLOW}⚠ ${result.filepath}${RESET}`);
    for (const flag of result.flags) {
      totalFlags++;
      console.log(`  ${BOLD}row:${RESET} ${flag.label}`);
      console.log(`    HEAD:    ${flag.head}`);
      console.log(`    working: ${flag.work}`);
      console.log(`    ${RED}lost qualifier:${RESET} "${flag.qualifier}"`);
    }
  }

  if (totalFlags === 0) {
    console.log(`${GREEN}check-activity-row-qualifiers:${RESET} no qualifier-strips detected in ${files.length} file(s)`);
    process.exit(0);
  }

  console.log(`
${BOLD}${RED}========================================${RESET}
${BOLD}${RED}${totalFlags} qualifier-strip(s) across ${filesWithFlags} file(s).${RESET}

This is the ${BOLD}constraint stripping${RESET} pattern from
admin/CAREFUL_NOT_CLEVER_FAILURE_2026_05_21.md §2.

A qualifier in an activity-row months cell carries planning-relevant
information ("Saturdays", "last Tuesday", "best Oct-Mar"). Removing it
to satisfy the weather validator's D_MONTH check is data loss.

Your options before committing:

1. Restore the qualifier in the months cell. The validator's D_MONTH
   check is the bug, not the qualifier — log the bug as REGEX-03 in
   admin/VALIDATOR_REGEX_ISSUES.md if not already logged.

2. Preserve the qualifier elsewhere on the page (an inline note next
   to the activity-row block, an adjacent <p class="scheduling-note">,
   or an FAQ entry that names the constraint).

3. If the qualifier really is decorative and stripping is fine, name
   that in the commit message so the next reviewer knows the call was
   intentional.

Default to option 1 or 2. Option 3 is reserved for "(decorative)" or
similar fluff, not for planning facts like Saturdays-only.
${BOLD}${RED}========================================${RESET}
`);
  process.exit(1);
}

main();
