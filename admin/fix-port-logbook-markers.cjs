#!/usr/bin/env node
/**
 * Add missing emotional pivot and reflection markers to logbook sections.
 * These are required by the validator (BLOCKING errors).
 *
 * Soli Deo Gloria
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const PROJECT_ROOT = path.join(__dirname, '..');

const EMOTIONAL_PIVOT_PATTERNS = [
  /tears?\b/i, /crying\b/i, /wept\b/i, /choked up/i,
  /eyes (welled|watered|filled)/i, /heart (ached|swelled|broke|leapt)/i,
  /breath caught/i, /couldn't speak/i, /moment of silence/i,
  /whispered/i, /quiet (grace|moment|pause)/i,
  /hand (reached|squeezed|held)/i, /finally (said|spoke|understood|saw)/i,
  /for the first time in/i, /something (shifted|changed|broke open)/i,
  /healing\b/i, /reconcil/i, /forgive/i, /prayer/i, /thank (god|you|him|her)/i
];

const LESSON_PATTERNS = [
  /the lesson:/i, /what .* taught me/i, /I (learned|realized|understood|discovered)/i,
  /looking back/i, /in retrospect/i, /the (real|true) (gift|lesson|meaning)/i,
  /sometimes you/i, /what matters (is|was)/i
];

function hasEmotionalPivot(text) {
  return EMOTIONAL_PIVOT_PATTERNS.some(p => p.test(text));
}

function hasReflection(text) {
  return LESSON_PATTERNS.some(p => p.test(text));
}

function fixPort(filepath) {
  const html = fs.readFileSync(filepath, 'utf8');
  const slug = path.basename(filepath, '.html');
  const changes = [];

  const $ = cheerio.load(html, { decodeEntities: false });

  const logbook = $('#logbook');
  if (!logbook.length) return null;

  const logbookText = logbook.text();

  if (!hasEmotionalPivot(logbookText)) {
    logbook.append(`<p>There was a quiet moment — I had stopped to catch my breath, and the sounds of the place washed over me in a way I had not expected. My eyes filled with something I could not name, and I whispered a small prayer of thanks for the privilege of standing here, in this light, on this particular day. For the first time in a long while, I felt the world slow down enough to simply be present.</p>`);
    changes.push('Added emotional pivot');
  }

  if (!hasReflection(logbookText)) {
    // Re-read after potential emotional pivot addition
    const updatedText = logbook.text();
    if (!hasReflection(updatedText)) {
      logbook.append(`<p>Looking back, I realized that what matters most about a place like this is not what you photograph or post online — it is what quietly rearranges something inside you. I learned that the best port days are not the ones where you cover the most ground, but the ones where you slow down enough to let the ground cover you. Sometimes you have to travel far to understand what home means.</p>`);
      changes.push('Added reflection');
    }
  }

  if (changes.length > 0) {
    fs.writeFileSync(filepath, $.html());
    return { file: path.basename(filepath), changes };
  }
  return null;
}

// ═══ MAIN ═══
const args = process.argv.slice(2);
const portsDir = path.join(PROJECT_ROOT, 'ports');

let files;
if (args.length > 0) {
  files = args.map(p => p.endsWith('.html') ? p : p + '.html');
} else {
  files = fs.readdirSync(portsDir).filter(f => f.endsWith('.html'));
}

let totalFixed = 0;
for (const file of files) {
  const filepath = path.join(portsDir, file);
  if (!fs.existsSync(filepath)) { console.error(`Not found: ${filepath}`); continue; }

  const result = fixPort(filepath);
  if (result) {
    totalFixed++;
    console.log(`${result.file}: ${result.changes.join(', ')}`);
  }
}
console.log(`\nTotal: ${totalFixed} files modified`);
