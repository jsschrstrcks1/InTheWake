#!/usr/bin/env node
/**
 * add-booking-guidance.cjs — Adds booking guidance paragraph to excursions sections
 * Soli Deo Gloria
 *
 * Finds the excursions section and adds a standard booking guidance paragraph
 * if the page lacks the required keywords (ship excursion, independent,
 * guaranteed return, book ahead).
 *
 * Usage:
 *   node admin/add-booking-guidance.cjs --dry-run
 *   node admin/add-booking-guidance.cjs
 */

const fs = require('fs');
const path = require('path');

const PORTS_DIR = path.join(__dirname, '..', 'ports');

const BOOKING_KEYWORDS = ['ship excursion', 'independent', 'guaranteed return', 'book ahead'];

// Pages that need booking_guidance per validator
const PAGES_NEEDING_BOOKING = [
  'callao', 'papeete', 'ponta-delgada', 'port-arthur', 'port-elizabeth',
  'port-said', 'punta-arenas', 'punta-del-este', 'ravenna', 'rotorua',
  'royal-beach-club-antigua', 'saguenay', 'saint-john', 'santa-marta',
  'scotland', 'south-pacific', 'south-shetland-islands', 'st-croix',
  'st-john-usvi', 'strait-of-magellan', 'sydney-ns', 'tangier', 'tauranga',
  'tender-ports', 'tobago', 'torshavn', 'trinidad', 'tunis', 'ushuaia',
  'vigo', 'waterford', 'zadar'
];

function getPortName(slug) {
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    .replace(/^St /, 'St. ').replace(/^Ns$/, 'NS');
}

function needsBookingGuidance(content) {
  // Extract only the excursions section content
  const excMatch = content.match(/<(?:details|section)[^>]*id="excursions"[^>]*>([\s\S]*?)(?:<\/details>|<\/section>)/i);
  if (!excMatch) return true; // No excursions section — needs it

  const excText = excMatch[1].toLowerCase();
  let count = 0;
  for (const kw of BOOKING_KEYWORDS) {
    if (excText.includes(kw)) count++;
  }
  return count < 2;
}

function addBookingGuidance(content, slug) {
  if (!needsBookingGuidance(content)) return { content, changed: false };

  const portName = getPortName(slug);

  // Standard booking guidance paragraph
  const bookingParagraph = `      <p class="tiny" style="margin-bottom: 0.75rem; font-style: italic; color: #678;">Booking guidance: Ship excursion options provide guaranteed return to port and are worth considering for first-time visitors. For those who prefer to explore independently, local operators often offer competitive rates — book ahead during peak season to secure your preferred times. Whether you choose a ship excursion or go independent, confirm departure times and meeting points before heading out.</p>`;

  // Find the excursions section — look for id="excursions"
  const excursionsMatch = content.match(/(<details[^>]*id="excursions"[^>]*>[\s\S]*?<summary>[\s\S]*?<\/summary>)/i);
  if (excursionsMatch) {
    // Insert after the </summary> tag
    const insertPoint = content.indexOf(excursionsMatch[0]) + excursionsMatch[0].length;
    const newContent = content.substring(0, insertPoint) + '\n' + bookingParagraph + '\n' + content.substring(insertPoint);
    return { content: newContent, changed: true };
  }

  // Try finding by h2/h3 heading text
  const headingMatch = content.match(/(<(?:details|section)[^>]*>[\s\S]*?<h[23][^>]*>[\s\S]*?(?:excursions?|activities|things to do)[\s\S]*?<\/h[23]>[\s\S]*?<\/summary>)/i);
  if (headingMatch) {
    const insertPoint = content.indexOf(headingMatch[0]) + headingMatch[0].length;
    const newContent = content.substring(0, insertPoint) + '\n' + bookingParagraph + '\n' + content.substring(insertPoint);
    return { content: newContent, changed: true };
  }

  // If no excursions section found, can't add (page needs the section created first)
  return { content, changed: false, reason: 'no excursions section found' };
}

function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');

  console.log(`\nBooking Guidance Batch Fix — ${dryRun ? 'DRY RUN' : 'LIVE'}\n`);

  let changed = 0;
  let skipped = 0;

  for (const slug of PAGES_NEEDING_BOOKING) {
    const filePath = path.join(PORTS_DIR, `${slug}.html`);
    if (!fs.existsSync(filePath)) {
      console.log(`  SKIP ${slug}.html — file not found`);
      skipped++;
      continue;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const result = addBookingGuidance(content, slug);

    if (result.changed) {
      if (!dryRun) {
        fs.writeFileSync(filePath, result.content, 'utf8');
      }
      console.log(`  ✓ ${slug}.html — booking guidance added`);
      changed++;
    } else {
      console.log(`  - ${slug}.html — ${result.reason || 'already has booking keywords'}`);
      skipped++;
    }
  }

  console.log(`\nTotal: ${changed} modified, ${skipped} skipped\n`);
}

main();
