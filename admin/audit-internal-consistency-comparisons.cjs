#!/usr/bin/env node
/**
 * v3 — Audit the Phase 3.1 internal-consistency edits for the
 * cross-ship-comparison failure mode.
 *
 * The internal-consistency-repair skill rewrites every "non-max" guest-count
 * integer near the words guest/passenger/capacity to the canonical chosen
 * for the page. That is correct iff every flagged integer refers to the
 * page's own ship. It is INCORRECT when the integer is a comparison to a
 * different ship (e.g., "Queen Elizabeth or Queen Victoria may be a better
 * fit at roughly 90,000 GT and 2,081 guests" — 2,081 there refers to
 * Elizabeth/Victoria, not to Queen Anne).
 *
 * This audit reads each per-ship audit-report under
 * audit-reports/internal-consistency/<slug>.md, extracts the swap context
 * snippet, and flags any swap whose context matches comparison-sentence
 * patterns: mentions of OTHER ship/class names, the words "compared",
 * "smaller", "larger", "by contrast", "vs", "than", or sister-ship phrasing.
 *
 * Output: audit-reports/internal-consistency/_comparison-check.md
 *         and stdout summary.
 *
 * Asserts no canonical and proposes no edit. Observation only.
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');

const REPO_ROOT = path.resolve(__dirname, '..');
const AUDIT_DIR = path.join(REPO_ROOT, 'audit-reports', 'internal-consistency');
const REPORT_OUT = path.join(AUDIT_DIR, '_comparison-check.md');

const COMPARISON_TRIGGERS = [
  /\bbetter fit\b/i,
  /\b(smaller|larger|bigger|smaller|smaller-than|larger-than)\b/i,
  /\bcompared\b/i,
  /\bversus\b/i,
  /\bvs\.?\b/i,
  /\bsister ships?\b/i,
  /\b(those|other)\s+(vista|fantasy|conquest|quantum|oasis|excel|spirit|edge|solstice|millennium)/i,
  /\bby contrast\b/i,
  /\bunlike\b/i,
  /\bin contrast\b/i,
  // Mentions a specific OTHER ship name within the snippet
  /\b(QM2|Queen (Mary|Elizabeth|Victoria)|(Royal|Independence|Liberty|Freedom|Adventure|Voyager|Explorer|Mariner|Navigator|Brilliance|Radiance|Serenade|Jewel|Vision|Rhapsody|Splendour|Empress|Majesty|Sovereign|Monarch|Legend|Grandeur|Enchantment) of the Seas|Oasis|Allure|Harmony|Symphony|Wonder|Utopia|Icon|Star|Spectrum|Quantum|Anthem|Ovation|Odyssey|Mardi Gras|Celebration|Jubilee|Vista|Horizon|Panorama|Sunshine|Sunrise|Magic|Breeze|Dream|Glory|Conquest|Valor|Liberty|Freedom|Pride|Spirit|Legend|Miracle|Triumph|Victory|Inspiration|Imagination|Sensation|Fantasy|Ecstasy|Fascination|Elation|Paradise|Enchanted|Discovery|Royal|Regal|Caribbean|Crown|Diamond|Emerald|Ruby|Sapphire|Sky|Sun|Coral|Island|Majestic|Star|Grand|Norwegian (Dawn|Gem|Jade|Pearl|Spirit|Star|Sun|Sky|Joy|Bliss|Encore|Escape|Getaway|Breakaway|Epic|Prima|Viva|Aqua|Luna))\b/i,
];

function audit() {
  const findings = [];
  if (!fs.existsSync(AUDIT_DIR)) {
    console.error(`no ${AUDIT_DIR}`); process.exit(2);
  }

  for (const entry of fs.readdirSync(AUDIT_DIR)) {
    if (!entry.endsWith('.md')) continue;
    if (entry.startsWith('_')) continue;
    if (entry.includes('DEFERRED')) continue;
    const full = path.join(AUDIT_DIR, entry);
    const text = fs.readFileSync(full, 'utf8');

    // Match "1. `OLD` → `NEW` — <context snippet>"
    const swaps = [...text.matchAll(/^\d+\.\s+`([^`]+)`\s*→\s*`([^`]+)`\s*—\s*(.+)$/gm)];
    if (swaps.length === 0) continue;

    for (const m of swaps) {
      const [, oldVal, newVal, ctx] = m;
      const trigger = COMPARISON_TRIGGERS.find(rx => rx.test(ctx));
      if (trigger) {
        findings.push({
          slug: entry.replace(/\.md$/, ''),
          oldVal, newVal,
          ctx: ctx.slice(0, 200),
          trigger: trigger.toString().slice(0, 60),
        });
      }
    }
  }

  // Render
  const lines = [];
  lines.push('# Comparison-sentence audit of Phase 3.1 swaps');
  lines.push('');
  lines.push(`**Generated:** ${new Date().toISOString()}`);
  lines.push(`**Source:** \`audit-reports/internal-consistency/<slug>.md\` swap blocks.`);
  lines.push(`**Method:** detect swap snippets that contain comparison-sentence triggers (other ship names, "better fit", "smaller", "vs", sister-ship phrasing, …).`);
  lines.push('');
  lines.push(`**Suspected wrong rewrites:** ${findings.length}`);
  lines.push('');
  if (findings.length === 0) {
    lines.push('No comparison-sentence patterns detected. Either the swaps are clean, or my regex is too narrow.');
  } else {
    lines.push('Each entry below is a swap whose context resembles a cross-ship comparison. The replacement may be factually wrong — the integer being rewritten may have referred to a different ship, not the page\'s own ship.');
    lines.push('');
    for (const f of findings) {
      lines.push(`## ${f.slug}`);
      lines.push('');
      lines.push(`- **swap:** \`${f.oldVal}\` → \`${f.newVal}\``);
      lines.push(`- **trigger pattern:** \`${f.trigger}\``);
      lines.push(`- **context:** \`${f.ctx.replace(/\|/g, '\\|')}\``);
      lines.push('');
    }
  }
  fs.writeFileSync(REPORT_OUT, lines.join('\n') + '\n');

  console.log(`comparison-check: ${findings.length} suspected wrong rewrite(s)`);
  for (const f of findings) {
    console.log(`  ${f.slug}: ${f.oldVal} → ${f.newVal}`);
    console.log(`    ctx: ${f.ctx.slice(0, 120)}`);
  }
}

audit();
