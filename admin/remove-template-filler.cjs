#!/usr/bin/env node
/**
 * remove-template-filler.cjs
 * Soli Deo Gloria
 *
 * Session 12: Removes copy-pasted template filler from port pages.
 *
 * Strategy: For each affected port, identify and remove template paragraphs
 * by matching their unique signature text. If removing template content leaves
 * a section empty (only whitespace/tags remain), remove the entire section.
 *
 * This script does NOT add replacement content — it only removes filler.
 * Ports will need real port-specific content written to pass validation again.
 */

const fs = require('fs');
const path = require('path');

// Template filler signatures — regex patterns matching the start of each template paragraph
const TEMPLATE_PARAGRAPHS = [
  // Generic emotional pivot (34 ports)
  /There was a quiet moment\s*[—–-]\s*standing still while the world moved around me\s*[—–-]\s*when my eyes filled with something between gratitude and grief[\s\S]*?(?:keep coming back\.)/,

  // Generic reflection (20 ports)
  /Looking back,?\s*I realized that what matters most about this place is not what you can photograph or post online[\s\S]*?(?:what home means\.)/,

  // Generic accessibility padding (33 ports)
  /I noticed the accessibility situation varied\s*[—–-]\s*some paths were smooth[\s\S]*?(?:keep coming back\.)?/,

  // Generic passport advice (47 ports)
  /Carry a photocopy of your passport rather than the original[\s\S]*?(?:local etiquette\.?|your belongings\.?)/,

  // === FULL SECTION TEMPLATES (remove entire <details> sections) ===

  // Generic cruise port section (62 ports) - identified by "well-positioned terminal"
  // Generic getting around section (70 ports) - identified by "highlights are accessible on foot"
  // Generic excursion section (66 ports) - identified by "Whether you book through your ship's excursion desk"
];

// Paragraph-level signatures to remove (matched against individual <p> text content)
const PARAGRAPH_SIGNATURES = [
  // Emotional pivot template
  'There was a quiet moment',
  'standing still while the world moved around me',

  // Reflection template
  'what matters most about this place is not what you can photograph or post online',
  'what quietly rearranges something inside you',
  'the best port days are not the ones where you cover the most ground',
  'Sometimes you have to travel far from home to understand what home means',

  // Accessibility padding template
  'I noticed the accessibility situation varied',
  'some paths were smooth and well-maintained, friendly to wheelchairs',

  // Budget template (in excursions)
  'Budget roughly $40–$100 per person for a full day',
  'Budget roughly $40-$100 per person for a full day',

  // Passport template (in depth soundings)
  'Carry a photocopy of your passport rather than the original',

  // Generic sensory padding
  'The air carried something I had not expected',
  'I could hear the distant sound of bells mixing with seabirds',
];

// Section-level content that marks an entire section as template filler
const SECTION_TEMPLATE_MARKERS = {
  'cruise-port': [
    'welcomes cruise ships at its well-positioned terminal, offering straightforward access',
    'The walk from gangway to port gate typically takes 5–15 minutes',
    'The walk from gangway to port gate typically takes 5-15 minutes',
    'Depending on the day\'s ship count, you may dock directly or anchor offshore',
  ],
  'getting-around': [
    'highlights are accessible on foot from the cruise terminal, though distances vary',
    'Some cruise lines offer shuttle buses between the port and town center, typically $8–$15',
    'Some cruise lines offer shuttle buses between the port and town center, typically $8-$15',
    'Wheelchair users and those with limited mobility should ask the shore excursion desk',
  ],
  'excursions': [
    'Whether you book through your ship\'s excursion desk or arrange something independently',
    'Ship excursions provide guaranteed return to the vessel and typically include transport',
    'Ship Excursion Options: Most cruise lines offer guided tours covering the main highlights, typically ranging from $50–$150',
    'consider seeking out local markets, food halls, or neighborhood walks that reveal the authentic character',
    'These informal explorations often become the day\'s most memorable moments',
  ],
};

function processPort(filepath) {
  let html = fs.readFileSync(filepath, 'utf-8');
  let modified = false;
  const removals = [];

  // 1. Remove template sections entirely (cruise-port, getting-around, excursions)
  for (const [sectionId, markers] of Object.entries(SECTION_TEMPLATE_MARKERS)) {
    // Check if section exists and contains template markers
    const sectionRegex = new RegExp(
      `<details[^>]*id="${sectionId}"[^>]*>[\\s\\S]*?</details>`,
      'i'
    );
    const match = html.match(sectionRegex);
    if (!match) continue;

    const sectionContent = match[0];
    const markerHits = markers.filter(m => sectionContent.includes(m));

    // If 2+ markers match, the section is template filler — remove it
    if (markerHits.length >= 2) {
      html = html.replace(match[0], '');
      modified = true;
      removals.push(`Removed template ${sectionId} section (${markerHits.length} markers matched)`);
    }
  }

  // 2. Remove individual template paragraphs from remaining content
  // Handle <p> tags containing template text
  for (const sig of PARAGRAPH_SIGNATURES) {
    const escapedSig = sig.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Match <p> containing the signature (greedy to end of paragraph)
    const pRegex = new RegExp(`<p[^>]*>[^<]*${escapedSig}[\\s\\S]*?</p>`, 'gi');
    const pMatches = html.match(pRegex);
    if (pMatches) {
      for (const pMatch of pMatches) {
        html = html.replace(pMatch, '');
        modified = true;
      }
      removals.push(`Removed ${pMatches.length} paragraph(s) matching "${sig.slice(0, 50)}..."`);
    }
  }

  // 3. Remove template <div class="poignant-highlight"> blocks
  const poignantRegex = /<div class="poignant-highlight">[^<]*<strong>The Moment That Stays[^<]*<\/strong>[^]*?standing still while the world moved around me[^]*?<\/div>/gi;
  const poignantMatches = html.match(poignantRegex);
  if (poignantMatches) {
    for (const m of poignantMatches) {
      html = html.replace(m, '');
      modified = true;
    }
    removals.push(`Removed ${poignantMatches.length} template poignant-highlight block(s)`);
  }

  // 4. Clean up: remove excessive blank lines left by removals
  html = html.replace(/\n{4,}/g, '\n\n');

  if (modified) {
    fs.writeFileSync(filepath, html, 'utf-8');
  }

  return { modified, removals };
}

// Main
const portsDir = path.join(__dirname, '..', 'ports');
const affectedPorts = fs.readFileSync('/tmp/template-filler-ports.txt', 'utf-8')
  .trim().split('\n')
  .map(p => path.join(__dirname, '..', p.trim()));

let totalModified = 0;
let totalRemovals = 0;

console.log(`\nTemplate Filler Removal — Session 12`);
console.log(`Soli Deo Gloria\n`);
console.log(`Processing ${affectedPorts.length} ports...\n`);

for (const filepath of affectedPorts) {
  if (!fs.existsSync(filepath)) {
    console.log(`  SKIP: ${path.basename(filepath)} (not found)`);
    continue;
  }

  const result = processPort(filepath);
  if (result.modified) {
    totalModified++;
    totalRemovals += result.removals.length;
    console.log(`  ✓ ${path.basename(filepath)}: ${result.removals.length} removal(s)`);
    for (const r of result.removals) {
      console.log(`      ${r}`);
    }
  } else {
    console.log(`  - ${path.basename(filepath)}: no template filler found (false positive?)`);
  }
}

console.log(`\n${'═'.repeat(60)}`);
console.log(`Modified: ${totalModified}/${affectedPorts.length} ports`);
console.log(`Total removals: ${totalRemovals}`);
console.log(`\nNext step: Run validator to confirm these pages now FAIL`);
console.log(`(They should fail for missing content, NOT for template filler)\n`);
