#!/usr/bin/env node
/**
 * Targeted fix for two common port page blocking errors:
 * 1. Gallery section out of order (must come before credits)
 * 2. Missing Author's Note Disclaimer in sidebar
 *
 * Soli Deo Gloria
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const PROJECT_ROOT = path.join(__dirname, '..');

function fixPort(filepath) {
  const html = fs.readFileSync(filepath, 'utf8');
  const slug = path.basename(filepath, '.html');
  const changes = [];

  const $ = cheerio.load(html, { decodeEntities: false });

  // ═══ FIX 1: Gallery before credits ═══
  const gallery = $('#gallery');
  const credits = $('#credits');
  const faq = $('#faq');

  if (gallery.length && credits.length) {
    // Check if gallery is after credits (wrong order)
    const allSections = $('main details.port-section, main section.port-section');
    let galleryIndex = -1;
    let creditsIndex = -1;
    allSections.each((i, el) => {
      const id = $(el).attr('id') || '';
      if (id === 'gallery') galleryIndex = i;
      if (id === 'credits') creditsIndex = i;
    });

    if (galleryIndex > creditsIndex && creditsIndex >= 0) {
      credits.before(gallery);
      changes.push('Moved gallery before credits');
    }
  }

  // ═══ FIX 2: Add Author's Note Disclaimer if missing ═══
  const sidebar = $('aside.rail, aside.sidebar, .rail, .right-rail');
  if (sidebar.length) {
    const sidebarHtml = sidebar.html() || '';
    const hasAuthorNote = /author('s)?.?note|disclaimer/i.test(sidebarHtml);

    if (!hasAuthorNote) {
      // Add after Plan Your Visit or At a Glance, before About the Author
      const authorCard = sidebar.find('.author-card-vertical, [id="about-author"]');
      const planVisit = sidebar.find('.plan-your-visit');
      const keyFacts = sidebar.find('#key-facts');

      const authorNote = `
      <aside class="card" style="background:#fffbf0;border-left:4px solid #d4a574;margin-top:1.5rem;">
        <h3>Author's Note</h3>
        <p class="tiny" style="line-height:1.6;color:#5a4a3a;">
          These are soundings in another's wake — notes compiled from traveler reports, local sources, and maritime records. I have not yet visited this port myself. Where I can, I cross-reference with published cruise excursion data and port authority information. Use this as a starting compass, not a final chart.
        </p>
      </aside>`;

      if (authorCard.length) {
        authorCard.before(authorNote);
      } else if (planVisit.length) {
        planVisit.after(authorNote);
      } else if (keyFacts.length) {
        keyFacts.after(authorNote);
      } else {
        sidebar.append(authorNote);
      }
      changes.push('Added Author\'s Note Disclaimer');
    }
  }

  // ═══ FIX 3: Sydney weather widget null island coordinates ═══
  const weatherWidget = $('#port-weather-widget');
  if (weatherWidget.length) {
    const lat = weatherWidget.attr('data-lat');
    const lon = weatherWidget.attr('data-lon');
    if (lat === '0' && lon === '0') {
      // Look at the slug to determine correct coordinates
      const COORDS = {
        'sydney': { lat: '-33.8523', lon: '151.2108' },
        'sydney-ns': { lat: '46.1381', lon: '-60.1947' }
      };
      if (COORDS[slug]) {
        weatherWidget.attr('data-lat', COORDS[slug].lat);
        weatherWidget.attr('data-lon', COORDS[slug].lon);
        changes.push(`Fixed weather coords: ${COORDS[slug].lat}, ${COORDS[slug].lon}`);
      }
    }
  }

  // ═══ OUTPUT ═══
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
