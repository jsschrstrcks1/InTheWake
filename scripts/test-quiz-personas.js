#!/usr/bin/env node
/**
 * test-quiz-personas.js
 *
 * Validates the 10 new personas (61-70) from admin/test-personas.md
 * against the live scoring matrix inside cruise-lines/quiz.html.
 *
 * Flow:
 *   1. Read cruise-lines/quiz.html as text.
 *   2. Extract the `const cruiseLines = { ... };` object literal by
 *      brace-counting (no dependency on jsdom / playwright).
 *   3. Evaluate it in a throwaway Function sandbox to get the scoring matrix.
 *   4. Replicate calculateResults() in pure JS.
 *   5. Score each persona, assert:
 *        - no NaN, no Infinity, no undefined score
 *        - at least one `ideal` line appears in the top 3
 *        - no `forbidden` line is the #1 winner
 *        - top 5 has 5 distinct lines
 *        - max score is strictly > min score (scorer is discriminating)
 *   6. Exit 0 on full pass, 1 on any failure. Print a summary table.
 *
 * Usage:
 *   node scripts/test-quiz-personas.js          # run + summary
 *   node scripts/test-quiz-personas.js --verbose # also print top-5 per persona
 */

'use strict';

const fs = require('fs');
const path = require('path');

const QUIZ_PATH = path.join(__dirname, '..', 'cruise-lines', 'quiz.html');
const VERBOSE = process.argv.includes('--verbose');

// ---------------------------------------------------------------------------
// 1. Extract cruiseLines object from quiz.html
// ---------------------------------------------------------------------------

function extractCruiseLines(html) {
  const marker = 'const cruiseLines = {';
  const startIdx = html.indexOf(marker);
  if (startIdx === -1) throw new Error('cruiseLines literal not found in quiz.html');

  // Start at the opening `{` of the object.
  let i = startIdx + marker.length - 1;
  let depth = 0;
  let inString = null; // holds quote char when inside a string
  let escape = false;
  let endIdx = -1;

  for (; i < html.length; i++) {
    const c = html[i];
    if (inString) {
      if (escape) { escape = false; continue; }
      if (c === '\\') { escape = true; continue; }
      if (c === inString) { inString = null; }
      continue;
    }
    if (c === '"' || c === "'") { inString = c; continue; }
    if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth === 0) { endIdx = i; break; }
    }
  }
  if (endIdx === -1) throw new Error('Could not find end of cruiseLines object');

  const literal = html.slice(startIdx + marker.length - 1, endIdx + 1);
  // eslint-disable-next-line no-new-func
  return new Function(`return ${literal};`)();
}

// ---------------------------------------------------------------------------
// 2. Scoring (mirror of quiz.html calculateResults)
// ---------------------------------------------------------------------------

function scorePersona(cruiseLines, answers) {
  const scores = {};
  for (const lineId of Object.keys(cruiseLines)) {
    const line = cruiseLines[lineId];
    let score = 0;
    for (const category of Object.keys(answers)) {
      const answer = answers[category];
      if (line.scores[category] && line.scores[category][answer] !== undefined) {
        score += line.scores[category][answer];
      }
    }
    scores[lineId] = score;
  }
  const sorted = Object.keys(scores)
    .map(id => ({ id, score: scores[id], name: cruiseLines[id].name }))
    .sort((a, b) => b.score - a.score);
  return sorted;
}

// ---------------------------------------------------------------------------
// 3. The 10 new personas (mirrors admin/test-personas.md Section F)
// ---------------------------------------------------------------------------

const personas = [
  {
    id: 61, name: 'The Neurodivergent Navigator (Jordan)',
    answers: { travelers: 'solo', budget: 'mid-range', priority: 'relaxation', shipSize: 'mid', atmosphere: 'smart-casual', special: 'none' },
    ideal: ['holland', 'princess', 'celebrity'],
    forbidden: ['carnival', 'virgin'],
  },
  {
    id: 62, name: 'The Homeschooling Pod (Kellerman Family)',
    answers: { travelers: 'family-kids', budget: 'mid-range', priority: 'destinations', shipSize: 'large', atmosphere: 'smart-casual', special: 'enrichment' },
    ideal: ['princess', 'msc', 'holland'],
    forbidden: ['virgin', 'seabourn'],
  },
  {
    id: 63, name: 'The Plus-Size Proud (Tara & Mike)',
    answers: { travelers: 'couple', budget: 'mid-range', priority: 'relaxation', shipSize: 'large', atmosphere: 'casual', special: 'none' },
    ideal: ['carnival', 'rcl', 'ncl'],
    forbidden: ['cunard', 'seabourn'],
  },
  {
    id: 64, name: 'The Corporate Incentive Trip (SalesForce North)',
    answers: { travelers: 'friends', budget: 'premium', priority: 'dining', shipSize: 'mid', atmosphere: 'trendy', special: 'adults-only' },
    ideal: ['virgin', 'celebrity', 'oceania'],
    forbidden: ['carnival', 'msc'],
  },
  {
    id: 65, name: 'The Sober Cruisers (Recovery Group)',
    answers: { travelers: 'friends', budget: 'mid-range', priority: 'relaxation', shipSize: 'mid', atmosphere: 'smart-casual', special: 'enrichment' },
    ideal: ['holland', 'princess', 'celebrity'],
    forbidden: ['carnival', 'virgin'],
  },
  {
    id: 66, name: 'The Military Veterans Reunion (Band of Brothers)',
    answers: { travelers: 'friends', budget: 'premium', priority: 'destinations', shipSize: 'mid', atmosphere: 'elegant', special: 'british' },
    ideal: ['cunard', 'holland', 'princess'],
    forbidden: ['carnival', 'virgin'],
  },
  {
    id: 67, name: 'The Ash-Scattering Pilgrims (Hendrix Siblings)',
    answers: { travelers: 'multigenerational', budget: 'premium', priority: 'destinations', shipSize: 'mid', atmosphere: 'elegant', special: 'enrichment' },
    ideal: ['oceania', 'holland', 'princess'],
    forbidden: ['carnival', 'virgin'],
  },
  {
    id: 68, name: 'The Competitive Eaters (Brad & Chad)',
    answers: { travelers: 'friends', budget: 'mid-range', priority: 'dining', shipSize: 'mega', atmosphere: 'casual', special: 'adventure' },
    ideal: ['rcl', 'ncl', 'carnival'],
    forbidden: ['cunard', 'seabourn'],
  },
  {
    id: 69, name: 'The Francophile Book Club (Paris-bound Retirees)',
    answers: { travelers: 'friends', budget: 'premium', priority: 'destinations', shipSize: 'mid', atmosphere: 'elegant', special: 'enrichment' },
    ideal: ['oceania', 'holland', 'cunard'],
    forbidden: ['carnival', 'ncl', 'rcl'],
  },
  {
    id: 70, name: 'The Crypto Bros (DeFi Millionaires)',
    answers: { travelers: 'friends', budget: 'luxury', priority: 'activities', shipSize: 'mega', atmosphere: 'trendy', special: 'adventure' },
    ideal: ['rcl', 'ncl', 'msc'],
    forbidden: ['cunard', 'holland', 'oceania'],
  },
];

// ---------------------------------------------------------------------------
// 4. Run
// ---------------------------------------------------------------------------

function main() {
  const html = fs.readFileSync(QUIZ_PATH, 'utf8');
  const cruiseLines = extractCruiseLines(html);
  const lineIds = Object.keys(cruiseLines);

  if (lineIds.length < 10) {
    console.error(`FAIL: Only ${lineIds.length} cruise lines extracted — expected 15.`);
    process.exit(1);
  }

  let failed = 0;
  const rows = [];

  for (const p of personas) {
    const ranked = scorePersona(cruiseLines, p.answers);
    const top5 = ranked.slice(0, 5);
    const issues = [];

    // Structural checks
    for (const r of ranked) {
      if (!Number.isFinite(r.score)) issues.push(`non-finite score for ${r.id}`);
    }
    const distinctTop5 = new Set(top5.map(r => r.id));
    if (distinctTop5.size !== 5) issues.push(`top5 not distinct (${distinctTop5.size}/5)`);

    // Discriminating scorer
    if (ranked[0].score <= ranked[ranked.length - 1].score) {
      issues.push(`scorer not discriminating (top=${ranked[0].score}, bottom=${ranked[ranked.length - 1].score})`);
    }

    // Ideal present in top 3
    const top3Ids = top5.slice(0, 3).map(r => r.id);
    const idealHit = p.ideal.some(id => top3Ids.includes(id));
    if (!idealHit) {
      issues.push(`no ideal line in top3 (ideal=${p.ideal.join('|')}, top3=${top3Ids.join('|')})`);
    }

    // Forbidden not #1
    if (p.forbidden.includes(ranked[0].id)) {
      issues.push(`forbidden line won: ${ranked[0].id}`);
    }

    const status = issues.length === 0 ? 'PASS' : 'FAIL';
    if (status === 'FAIL') failed++;
    rows.push({
      id: p.id,
      name: p.name,
      status,
      winner: `${ranked[0].id} (${ranked[0].score})`,
      top3: top3Ids.join(', '),
      issues: issues.join('; '),
    });

    if (VERBOSE) {
      console.log(`\n--- Persona ${p.id}: ${p.name} [${status}] ---`);
      console.log('  Answers:', JSON.stringify(p.answers));
      console.log('  Top 5:');
      for (const r of top5) console.log(`    ${r.id.padEnd(12)} ${String(r.score).padStart(3)}  ${r.name}`);
      if (issues.length) console.log('  Issues:', issues.join(' | '));
    }
  }

  // Summary
  console.log('');
  console.log('=== Persona Regression Summary (v2.1, personas 61-70) ===');
  console.log('ID  | Status | Winner              | Top 3 (ids)                 | Persona');
  console.log('----+--------+---------------------+-----------------------------+---------------------------------');
  for (const r of rows) {
    console.log(
      `${String(r.id).padEnd(3)} | ${r.status.padEnd(6)} | ${r.winner.padEnd(19)} | ${r.top3.padEnd(27)} | ${r.name}`
    );
    if (r.issues) console.log(`    └─ ${r.issues}`);
  }
  console.log('');
  console.log(`Total: ${rows.length}  Pass: ${rows.length - failed}  Fail: ${failed}`);

  if (failed > 0) {
    console.error(`\n${failed} persona(s) regressed. Inspect scores in cruise-lines/quiz.html.`);
    process.exit(1);
  }
  console.log('\nAll personas pass. Scoring matrix is intact for personas 61-70.');
  process.exit(0);
}

main();
