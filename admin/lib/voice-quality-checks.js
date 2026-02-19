/**
 * Like-a-Human Voice Quality Checks — Shared Module
 * Soli Deo Gloria
 *
 * Implements automated checks derived from:
 *   .claude/skills/Humanization/Like-a-human.md (v1.0.0)
 *
 * These checks detect violations of the In the Wake voice standard:
 *   V01  Promotional drift (hype, pressure language, benefit stacking)
 *   V02  AI chorus (predictable transitions, templated phrasing)
 *   V03  Authority violations (unqualified superlatives, no concrete details)
 *   V04  Window Pane violations (overwrought prose, rhythm tricks)
 *   V05  Warmth violations (forced anecdotes, emotional stacking, slang)
 *   V06  Corporate filler (inflated abstractions, buzzwords)
 *
 * Usage (ESM):
 *   import { validateVoiceQuality } from './lib/voice-quality-checks.js';
 *   const voiceResult = validateVoiceQuality(bodyText);
 *   // voiceResult = { valid, errors, warnings, data }
 *
 * Usage (venue validator class):
 *   import { VOICE_CHECKS } from './lib/voice-quality-checks.js';
 *   // Then call VOICE_CHECKS individually inside class methods
 */

// =============================================================================
// V01: PROMOTIONAL DRIFT
// From Like-a-human.md → "Promotional Drift Check"
// Scan for: "Best," "perfect," "must," "you'll love", emotional intensifiers,
// benefit stacking, subtle pressure language
// =============================================================================

const PROMOTIONAL_DRIFT_PATTERNS = [
  // Direct promotional language
  { pattern: /\byou'll love\b/gi, label: 'you\'ll love', severity: 'error' },
  { pattern: /\bperfect (for|destination|place|spot|choice)\b/gi, label: 'perfect for...', severity: 'error' },
  { pattern: /\bmust[- ](see|do|visit|try|experience)\b/gi, label: 'must-see/do', severity: 'error' },
  { pattern: /\bideal (for|choice|destination|spot)\b/gi, label: 'ideal for...', severity: 'error' },
  { pattern: /\bdon'?t miss\b/gi, label: 'don\'t miss', severity: 'warning' },

  // Emotional intensifiers (benefit stacking)
  { pattern: /\btruly (magical|unforgettable|breathtaking|spectacular)\b/gi, label: 'truly + intensifier', severity: 'warning' },
  { pattern: /\babsolutely (stunning|incredible|amazing|gorgeous)\b/gi, label: 'absolutely + intensifier', severity: 'warning' },
  { pattern: /\bsimply (breathtaking|stunning|incredible|magical)\b/gi, label: 'simply + intensifier', severity: 'warning' },

  // Subtle pressure language
  { pattern: /\byou won'?t (regret|be disappointed|want to miss)\b/gi, label: 'pressure: you won\'t regret', severity: 'warning' },
  { pattern: /\byou (need|have) to (see|visit|try|experience)\b/gi, label: 'pressure: you need to', severity: 'warning' },
  { pattern: /\bevery(one|body) (should|needs to|must)\b/gi, label: 'pressure: everyone should', severity: 'warning' },
];

// =============================================================================
// V02: AI CHORUS (Predictable AI transitions & templated phrasing)
// From Like-a-human.md → "Plain Language Discipline" + "Window Pane Principle"
// =============================================================================

const AI_CHORUS_PATTERNS = [
  // Predictable AI transitions
  { pattern: /\bwhether you'?re .+? or .+?, /gi, label: '"Whether you\'re X or Y" template', severity: 'warning' },
  { pattern: /\bfrom .+? to .+?, .+? has (something|it all)\b/gi, label: '"From X to Y, Z has it all" template', severity: 'warning' },
  { pattern: /\bno matter (what|where|who|how)\b.*\byou'll find\b/gi, label: '"No matter X, you\'ll find Y" template', severity: 'warning' },
  { pattern: /\bwith so much to (offer|see|do|explore)\b/gi, label: '"With so much to offer" filler', severity: 'warning' },
  { pattern: /\bthere'?s something for everyone\b/gi, label: '"something for everyone" cliché', severity: 'warning' },

  // Generic AI transitions
  { pattern: /\blet'?s (dive|delve) (in|into|deeper)\b/gi, label: '"let\'s dive in" AI opener', severity: 'warning' },
  { pattern: /\bin (this|our) (comprehensive|complete|ultimate|definitive) guide\b/gi, label: '"comprehensive guide" framing', severity: 'error' },
  { pattern: /\b(embark|journey) on (a|an|your) (unforgettable|incredible|amazing)\b/gi, label: '"embark on an unforgettable" cliché', severity: 'error' },
  { pattern: /\bdiscover the (magic|wonder|beauty|charm|allure) of\b/gi, label: '"discover the magic of" cliché', severity: 'warning' },
  { pattern: /\bimmerse yourself in\b/gi, label: '"immerse yourself in" cliché', severity: 'warning' },
];

// Longer template phrases (checked as substrings, case-insensitive)
const AI_TEMPLATE_PHRASES = [
  'offers memorable experiences with excellent',
  'a perfect blend of',
  'a unique blend of',
  'the perfect combination of',
  'a harmonious blend of',
  'rich tapestry of',
  'nestled between',
  'boasts a wide array of',
  'caters to all tastes',
  'leaves no stone unturned',
  'something to suit every taste',
  'a feast for the senses',
  'where old meets new',
  'where ancient meets modern',
  'steeped in history',
  'a testament to',
  'stands as a testament',
];

// =============================================================================
// V03: AUTHORITY VIOLATIONS (Unqualified superlatives)
// From Like-a-human.md → "Authority First Rule"
// =============================================================================

const UNQUALIFIED_SUPERLATIVE_PATTERNS = [
  { pattern: /\bthe best .{1,30} in the (world|region|area|country|caribbean|mediterranean)\b/gi, label: 'unqualified "best in the world"', severity: 'warning' },
  { pattern: /\bthe most .{1,30} in the (world|region|area|country)\b/gi, label: 'unqualified "most X in the world"', severity: 'warning' },
  { pattern: /\blike nowhere else\b/gi, label: '"like nowhere else" — unqualified', severity: 'warning' },
  { pattern: /\bunlike anywhere else\b/gi, label: '"unlike anywhere else" — unqualified', severity: 'warning' },
  { pattern: /\bone of the (best|finest|greatest|most beautiful)\b/gi, label: '"one of the best" — needs qualifier', severity: 'warning' },
];

// =============================================================================
// V04: WINDOW PANE VIOLATIONS (Overwrought prose, rhythm tricks)
// From Like-a-human.md → "Window Pane Principle" + "Window Pane Check"
// =============================================================================

const WINDOW_PANE_PATTERNS = [
  // Overwrought prose
  { pattern: /\bwhere dreams (come|are made|become)\b/gi, label: '"where dreams come true" — overwrought', severity: 'warning' },
  { pattern: /\bparadise (on earth|found|awaits)\b/gi, label: '"paradise on earth" — overwrought', severity: 'warning' },
  { pattern: /\bjewel of the\b/gi, label: '"jewel of the" — overwrought', severity: 'warning' },
  { pattern: /\bgem of the\b/gi, label: '"gem of the" — overwrought', severity: 'warning' },
  { pattern: /\bpostcard[- ]perfect\b/gi, label: '"postcard-perfect" — overwrought', severity: 'warning' },
  { pattern: /\bpicture[- ]perfect\b/gi, label: '"picture-perfect" — overwrought', severity: 'warning' },
  { pattern: /\btake your breath away\b/gi, label: '"take your breath away" — overwrought', severity: 'warning' },
];

// =============================================================================
// V05: WARMTH VIOLATIONS (Forced anecdotes, emotional stacking)
// From Like-a-human.md → "Warmth (Measured)"
// =============================================================================

const WARMTH_VIOLATION_PATTERNS = [
  // Emotional stacking (multiple intensifiers in close proximity detected separately)
  { pattern: /\b(amazing|incredible|stunning|breathtaking|spectacular|magnificent|extraordinary)\b.*\b(amazing|incredible|stunning|breathtaking|spectacular|magnificent|extraordinary)\b/gi, label: 'emotional stacking — multiple intensifiers', severity: 'warning' },

  // Forced familiarity / slang for authenticity
  { pattern: /\btrust me\b/gi, label: '"trust me" — forced familiarity', severity: 'warning' },
  { pattern: /\bI kid you not\b/gi, label: '"I kid you not" — forced familiarity', severity: 'warning' },
  { pattern: /\bhonestly\b/gi, label: '"honestly" — filler word (if overused)', severity: 'info' },
];

// =============================================================================
// V06: CORPORATE FILLER (Inflated abstractions, buzzwords)
// From Like-a-human.md → "Plain Language Discipline"
// =============================================================================

const CORPORATE_FILLER_PATTERNS = [
  { pattern: /\bworld[- ]class\b/gi, label: '"world-class" — corporate filler', severity: 'warning' },
  { pattern: /\bstate[- ]of[- ]the[- ]art\b/gi, label: '"state-of-the-art" — corporate filler', severity: 'warning' },
  { pattern: /\bcurated (experience|selection|collection)\b/gi, label: '"curated experience" — corporate filler', severity: 'warning' },
  { pattern: /\belevate(d|s)? (your|the) (experience|journey|adventure)\b/gi, label: '"elevated experience" — corporate filler', severity: 'warning' },
  { pattern: /\bseamless(ly)?\b/gi, label: '"seamlessly" — buzzword', severity: 'info' },
  { pattern: /\bleverag(e|ing)\b/gi, label: '"leverage" — corporate speak', severity: 'warning' },
  { pattern: /\bsynerg/gi, label: '"synergy" — corporate speak', severity: 'warning' },
  { pattern: /\bunparalleled\b/gi, label: '"unparalleled" — inflated', severity: 'warning' },
  { pattern: /\bsecond to none\b/gi, label: '"second to none" — inflated', severity: 'warning' },
];


// =============================================================================
// MAIN VALIDATION FUNCTION
// =============================================================================

/**
 * Run all Like-a-human voice quality checks against text content.
 *
 * @param {string} text - The text to validate (body text, section text, etc.)
 * @param {Object} [options] - Configuration options
 * @param {boolean} [options.errorsAsWarnings=false] - Downgrade all errors to warnings
 * @param {string[]} [options.skipChecks=[]] - Check IDs to skip (e.g. ['V01','V05'])
 * @param {number} [options.minWordCount=200] - Skip voice checks if text is below this word count
 * @returns {{ valid: boolean, errors: Array, warnings: Array, info: Array, data: Object }}
 */
export function validateVoiceQuality(text, options = {}) {
  const errors = [];
  const warnings = [];
  const info = [];
  const skipChecks = new Set(options.skipChecks || []);
  const minWordCount = options.minWordCount ?? 200;
  const errorsAsWarnings = options.errorsAsWarnings ?? false;

  // Don't run voice checks on very short content — not enough signal
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  if (wordCount < minWordCount) {
    info.push({
      section: 'voice_quality',
      rule: 'voice_check_skipped',
      message: `Voice checks skipped: ${wordCount} words (minimum ${minWordCount})`,
      severity: 'INFO'
    });
    return { valid: true, errors, warnings, info, data: { skipped: true, wordCount } };
  }

  const textLower = text.toLowerCase();
  const allFindings = [];

  // --- V01: Promotional Drift ---
  if (!skipChecks.has('V01')) {
    for (const rule of PROMOTIONAL_DRIFT_PATTERNS) {
      const matches = text.match(rule.pattern);
      if (matches) {
        allFindings.push({ check: 'V01', ...rule, count: matches.length, sample: matches[0] });
      }
    }
  }

  // --- V02: AI Chorus ---
  if (!skipChecks.has('V02')) {
    // Regex patterns
    for (const rule of AI_CHORUS_PATTERNS) {
      const matches = text.match(rule.pattern);
      if (matches) {
        allFindings.push({ check: 'V02', ...rule, count: matches.length, sample: matches[0] });
      }
    }
    // Substring template phrases
    for (const phrase of AI_TEMPLATE_PHRASES) {
      if (textLower.includes(phrase)) {
        allFindings.push({
          check: 'V02',
          label: `"${phrase}" — AI template phrase`,
          severity: 'warning',
          count: 1,
          sample: phrase
        });
      }
    }
  }

  // --- V03: Authority Violations ---
  if (!skipChecks.has('V03')) {
    for (const rule of UNQUALIFIED_SUPERLATIVE_PATTERNS) {
      const matches = text.match(rule.pattern);
      if (matches) {
        allFindings.push({ check: 'V03', ...rule, count: matches.length, sample: matches[0] });
      }
    }
  }

  // --- V04: Window Pane Violations ---
  if (!skipChecks.has('V04')) {
    for (const rule of WINDOW_PANE_PATTERNS) {
      const matches = text.match(rule.pattern);
      if (matches) {
        allFindings.push({ check: 'V04', ...rule, count: matches.length, sample: matches[0] });
      }
    }
  }

  // --- V05: Warmth Violations ---
  if (!skipChecks.has('V05')) {
    for (const rule of WARMTH_VIOLATION_PATTERNS) {
      const matches = text.match(rule.pattern);
      if (matches) {
        allFindings.push({ check: 'V05', ...rule, count: matches.length, sample: matches[0] });
      }
    }
  }

  // --- V06: Corporate Filler ---
  if (!skipChecks.has('V06')) {
    for (const rule of CORPORATE_FILLER_PATTERNS) {
      const matches = text.match(rule.pattern);
      if (matches) {
        allFindings.push({ check: 'V06', ...rule, count: matches.length, sample: matches[0] });
      }
    }
  }

  // --- Categorize findings into errors / warnings / info ---
  for (const f of allFindings) {
    const entry = {
      section: 'voice_quality',
      rule: `voice_${f.check.toLowerCase()}`,
      message: `[${f.check}] ${f.label} (found ${f.count}x, e.g. "${f.sample}")`,
      severity: f.severity === 'error' ? 'WARNING' : f.severity === 'warning' ? 'WARNING' : 'INFO'
    };

    if (f.severity === 'error' && !errorsAsWarnings) {
      // Voice errors are WARNING-level by default (not BLOCKING)
      // They flag quality issues, not hard content bans
      warnings.push(entry);
    } else if (f.severity === 'warning') {
      warnings.push(entry);
    } else {
      info.push(entry);
    }
  }

  // --- Aggregate data ---
  const byCategoryCount = {};
  for (const f of allFindings) {
    byCategoryCount[f.check] = (byCategoryCount[f.check] || 0) + f.count;
  }

  return {
    valid: true, // Voice checks don't block — they warn
    errors,
    warnings,
    info,
    data: {
      skipped: false,
      wordCount,
      totalFindings: allFindings.length,
      findingsByCheck: byCategoryCount,
      promotional_drift: byCategoryCount['V01'] || 0,
      ai_chorus: byCategoryCount['V02'] || 0,
      authority_violations: byCategoryCount['V03'] || 0,
      window_pane_violations: byCategoryCount['V04'] || 0,
      warmth_violations: byCategoryCount['V05'] || 0,
      corporate_filler: byCategoryCount['V06'] || 0
    }
  };
}

/**
 * Exported constants for validators that want to run individual checks
 * (e.g. venue validator class pattern)
 */
export const VOICE_CHECKS = {
  PROMOTIONAL_DRIFT_PATTERNS,
  AI_CHORUS_PATTERNS,
  AI_TEMPLATE_PHRASES,
  UNQUALIFIED_SUPERLATIVE_PATTERNS,
  WINDOW_PANE_PATTERNS,
  WARMTH_VIOLATION_PATTERNS,
  CORPORATE_FILLER_PATTERNS
};
