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
// V07: AUTHENTICITY RISK (Sentence predictability, transition density)
// From Like-a-human.md → "Authenticity Risk (Internal Only)"
// Detects template-heavy content that passes pattern checks but reads as AI slop.
// =============================================================================

/**
 * Score authenticity risk based on quantitative signals.
 * Returns { risk: 'low'|'medium'|'high', signals: string[], score: number }
 */
function assessAuthenticityRisk(text) {
  const signals = [];
  let score = 0; // Higher = more AI-sounding

  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  if (sentences.length < 5) return { risk: 'low', signals: ['too few sentences to assess'], score: 0 };

  // 1. Sentence starter repetition — templated content starts sentences the same way
  const starters = sentences.map(s => s.trim().split(/\s+/).slice(0, 2).join(' ').toLowerCase());
  const starterCounts = {};
  for (const s of starters) { starterCounts[s] = (starterCounts[s] || 0) + 1; }
  const maxRepeat = Math.max(...Object.values(starterCounts));
  const repeatRatio = maxRepeat / sentences.length;
  if (repeatRatio > 0.25) {
    const topStarter = Object.entries(starterCounts).sort((a, b) => b[1] - a[1])[0];
    signals.push(`${Math.round(repeatRatio * 100)}% of sentences start with "${topStarter[0]}"`);
    score += repeatRatio > 0.4 ? 3 : 2;
  }

  // 2. Transition word density — too many transitions = over-structured
  const transitionWords = text.match(/\b(however|moreover|furthermore|additionally|consequently|nevertheless|therefore|thus|hence|meanwhile|subsequently|accordingly|likewise|similarly|in addition|as a result|on the other hand|in contrast|for instance|for example)\b/gi) || [];
  const transitionDensity = transitionWords.length / (sentences.length || 1);
  if (transitionDensity > 0.3) {
    signals.push(`High transition density: ${transitionWords.length} transitions in ${sentences.length} sentences`);
    score += transitionDensity > 0.5 ? 3 : 2;
  }

  // 3. Section length uniformity — suspiciously similar paragraph lengths
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 50);
  if (paragraphs.length >= 4) {
    const lengths = paragraphs.map(p => p.split(/\s+/).length);
    const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const variance = lengths.reduce((sum, l) => sum + Math.pow(l - mean, 2), 0) / lengths.length;
    const cv = Math.sqrt(variance) / (mean || 1); // coefficient of variation
    if (cv < 0.15 && mean > 30) {
      signals.push(`Suspiciously uniform paragraph lengths (CV: ${cv.toFixed(2)}, avg: ${Math.round(mean)} words)`);
      score += 2;
    }
  }

  // 4. Specificity density — authentic content has concrete details
  const specifics = (text.match(/\$\d|USD|\d+\s*(min|hour|mile|km|block|meter|feet|ft)\b|\d{1,2}:\d{2}\s*(am|pm|a\.m\.|p\.m\.)/gi) || []).length;
  const specificityRatio = specifics / (sentences.length || 1);
  if (specificityRatio < 0.05 && sentences.length > 20) {
    signals.push(`Low specificity: only ${specifics} concrete details in ${sentences.length} sentences`);
    score += 2;
  }

  const risk = score >= 5 ? 'high' : score >= 3 ? 'medium' : 'low';
  return { risk, signals, score };
}

// =============================================================================
// V08: AUTHORITY FIRST — POSITIVE CHECK
// From Like-a-human.md → "Authority First Rule"
// "At least one specific, concrete detail is present"
// =============================================================================

const CONCRETE_DETAIL_PATTERNS = [
  /\$\d+/,                                          // Dollar amounts
  /\d+\s*(min(ute)?s?|hours?|hr)\b/i,              // Time references
  /\d+\s*(miles?|km|kilometers?|blocks?|feet|ft|meters?|m)\b/i, // Distance
  /\d{1,2}:\d{2}\s*(am|pm|a\.m\.|p\.m\.)/i,        // Specific times
  /\d+\s*%/,                                         // Percentages
  /\b(opened?|built|founded|established)\s+in\s+\d{4}\b/i, // Historical dates
];

// =============================================================================
// V09: FAIRNESS RULE — CONTEXT vs ABSOLUTES
// From Like-a-human.md → "Fairness Rule"
// "Replace absolutes with context, hype with comparison"
// =============================================================================

const ABSOLUTE_PATTERNS = [
  /\balways\b/gi,
  /\bnever\b/gi,
  /\beveryone\b/gi,
  /\bno one\b/gi,
  /\beverything\b/gi,
  /\bnothing\b/gi,
];

const CONTEXT_PATTERNS = [
  /\bcompared to\b/gi,
  /\brather than\b/gi,
  /\bwhereas\b/gi,
  /\bunlike\b/gi,
  /\bfor this (price|budget|size|type)\b/gi,
  /\bgiven (the|its|that)\b/gi,
  /\bin (my|our) experience\b/gi,
  /\btypically\b/gi,
  /\busually\b/gi,
  /\btends to\b/gi,
  /\bdepending on\b/gi,
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

  // --- V07: Authenticity Risk ---
  let authenticityResult = null;
  if (!skipChecks.has('V07')) {
    authenticityResult = assessAuthenticityRisk(text);
    if (authenticityResult.risk === 'high') {
      allFindings.push({
        check: 'V07',
        label: `High authenticity risk: ${authenticityResult.signals.join('; ')}`,
        severity: 'warning',
        count: authenticityResult.score,
        sample: authenticityResult.signals[0] || 'multiple signals'
      });
    } else if (authenticityResult.risk === 'medium') {
      allFindings.push({
        check: 'V07',
        label: `Medium authenticity risk: ${authenticityResult.signals.join('; ')}`,
        severity: 'info',
        count: authenticityResult.score,
        sample: authenticityResult.signals[0] || 'moderate signals'
      });
    }
  }

  // --- V08: Authority First (positive) — concrete details present ---
  if (!skipChecks.has('V08') && wordCount >= 500) {
    let concreteDetailCount = 0;
    for (const pattern of CONCRETE_DETAIL_PATTERNS) {
      const matches = text.match(new RegExp(pattern.source, pattern.flags + (pattern.flags.includes('g') ? '' : 'g')));
      if (matches) concreteDetailCount += matches.length;
    }
    if (concreteDetailCount < 3) {
      allFindings.push({
        check: 'V08',
        label: `Only ${concreteDetailCount} concrete detail(s) found (prices, times, distances). Authority requires specific, verifiable details.`,
        severity: 'warning',
        count: 1,
        sample: `${concreteDetailCount} concrete details in ${wordCount} words`
      });
    }
  }

  // --- V09: Fairness Rule — absolutes vs context ---
  if (!skipChecks.has('V09') && wordCount >= 500) {
    let absoluteCount = 0;
    let contextCount = 0;
    for (const pattern of ABSOLUTE_PATTERNS) {
      const matches = text.match(pattern);
      if (matches) absoluteCount += matches.length;
    }
    for (const pattern of CONTEXT_PATTERNS) {
      const matches = text.match(pattern);
      if (matches) contextCount += matches.length;
    }
    // Flag when absolutes far outweigh context-providing language
    if (absoluteCount > 10 && contextCount < 2) {
      allFindings.push({
        check: 'V09',
        label: `${absoluteCount} absolute claims with only ${contextCount} contextual qualifiers. Fairness Rule: replace absolutes with context.`,
        severity: 'warning',
        count: 1,
        sample: `${absoluteCount} absolutes, ${contextCount} qualifiers`
      });
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
      corporate_filler: byCategoryCount['V06'] || 0,
      authenticity_risk: authenticityResult?.risk || 'not assessed',
      authenticity_signals: authenticityResult?.signals || [],
      authority_positive: byCategoryCount['V08'] || 0,
      fairness_balance: byCategoryCount['V09'] || 0
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
  CORPORATE_FILLER_PATTERNS,
  CONCRETE_DETAIL_PATTERNS,
  ABSOLUTE_PATTERNS,
  CONTEXT_PATTERNS,
  assessAuthenticityRisk
};
