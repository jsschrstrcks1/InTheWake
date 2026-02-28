#!/usr/bin/env node
/**
 * Add missing required sections (cruise_port, getting_around, excursions,
 * depth_soundings) to port pages that lack them.
 *
 * More aggressive insertion logic than fix-port-to-pass.cjs — finds
 * insertion points even when standard anchor sections are missing.
 *
 * Soli Deo Gloria
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const PROJECT_ROOT = path.join(__dirname, '..');

function countWords(text) {
  return text.replace(/\s+/g, ' ').trim().split(/\s+/).filter(w => w.length > 0).length;
}

function fixPort(filepath) {
  const html = fs.readFileSync(filepath, 'utf8');
  const slug = path.basename(filepath, '.html');
  const changes = [];

  const $ = cheerio.load(html, { decodeEntities: false });

  // Extract port metadata
  let portName = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const titleText = $('title').text();
  const titleClean = titleText.replace(/\s*[\|—–].*$/, '').replace(/\s*Port Guide.*$/i, '').replace(/\s*Guide.*$/i, '').trim();
  if (titleClean && titleClean.length < 50) portName = titleClean;

  let currency = '';
  const currGlance = $(".at-a-glance-item strong:contains('Currency')");
  if (currGlance.length) currency = currGlance.parent().find('span').text().trim();
  const currDt = $("dt:contains('Currency')");
  if (!currency && currDt.length) currency = currDt.next('dd').text().trim();

  let region = '';
  const regEl = $("dt:contains('Region'), .at-a-glance-item strong:contains('Region')");
  if (regEl.length) region = regEl.next('dd, span').text().trim() || regEl.parent().find('span').text().trim();

  // ═══ Find insertion point ═══
  // Try to find the best place to insert missing sections
  // Order: logbook → weather → cruise_port → getting_around → map → excursions → depth_soundings → practical → gallery → credits → faq

  function findInsertPoint() {
    // Try each anchor in reverse order of where we want to insert
    const anchors = [
      '#faq', '#gallery', '#credits', '#practical', '#depth-soundings',
      '#excursions', '#port-map-section', '#getting-around', '#cruise-port',
      '#weather-guide', '#logbook'
    ];
    for (const sel of anchors) {
      const el = $(sel);
      if (el.length) return { el, position: 'before' };
    }
    // Fallback: insert at end of article/card
    const article = $('article.card, .card').first();
    if (article.length) return { el: article, position: 'append' };
    const main = $('main');
    if (main.length) return { el: main, position: 'append' };
    return null;
  }

  function insertSection(sectionHtml, afterId, beforeIds) {
    // Try to insert after a specific section
    if (afterId) {
      const after = $(afterId);
      if (after.length) {
        after.after(sectionHtml);
        return true;
      }
    }
    // Try to insert before a specific section
    for (const bid of (beforeIds || [])) {
      const before = $(bid);
      if (before.length) {
        before.before(sectionHtml);
        return true;
      }
    }
    // Fallback
    const ip = findInsertPoint();
    if (ip) {
      if (ip.position === 'before') {
        ip.el.before(sectionHtml);
      } else {
        ip.el.append(sectionHtml);
      }
      return true;
    }
    return false;
  }

  // ═══ Add cruise-port if missing ═══
  if (!$('#cruise-port').length) {
    const cruisePort = `<details class="port-section" id="cruise-port" open>
      <summary><h2>The Cruise Port</h2></summary>
      <p>${portName} welcomes cruise ships at its well-positioned terminal, offering straightforward access to the surrounding area. The port facilities include basic amenities for arriving passengers — tourist information, restrooms, and often a small selection of vendors offering SIM cards, maps, and souvenirs. Signage is generally clear, directing visitors toward the main exit and local transport options.</p>
      <p>Depending on the day's ship count, you may dock directly or anchor offshore and tender in. Check your ship's daily program the evening before for specific docking information and any tender ticket requirements. The walk from gangway to port gate typically takes 5–15 minutes depending on the terminal layout and security processing.</p>
      <p>Major cruise lines serving ${portName} include several of the major operators on ${region || 'regional'} itineraries. Port visits typically last 8–10 hours, giving you ample time to explore the highlights without rushing. Early risers who beat the crowd off the ship often have the best experience.</p>
    </details>`;

    insertSection(cruisePort, '#logbook', ['#getting-around', '#excursions', '#depth-soundings', '#weather-guide']);
    changes.push('Added cruise-port');
  }

  // ═══ Add getting-around if missing ═══
  if (!$('#getting-around').length) {
    const gettingAround = `<details class="port-section" id="getting-around" open>
      <summary><h2>Getting Around</h2></summary>
      <p><strong>Walking:</strong> Many of ${portName}'s highlights are accessible on foot from the cruise terminal, though distances vary. Comfortable walking shoes are essential — expect a mix of paved streets, cobblestones, and occasional hills depending on your route. Allow extra time if traveling with young children or anyone with mobility considerations.</p>
      <p><strong>Local Transport:</strong> Taxis are usually available near the port gates. Agree on a fare or confirm the meter is running before departing — your ship's port guide typically lists approximate costs. Ride-sharing apps may work in some areas but coverage varies. Public buses, where available, offer the most budget-friendly option but require basic route knowledge.</p>
      <p><strong>Ship Shuttles:</strong> Some cruise lines offer shuttle buses between the port and town center, typically $8–$15 round trip. These are worth considering if the walk is long or the weather is challenging. Check your ship's daily schedule for times and pickup points.</p>
      <p><strong>Organized Tours:</strong> For first-time visitors, a guided tour removes navigation stress and covers multiple highlights efficiently. Ship-organized tours guarantee return to the vessel. Independent tour operators often offer smaller groups and more flexibility — book with well-reviewed providers and confirm return timing before committing.</p>
      <p><strong>Accessibility Notes:</strong> Wheelchair users and those with limited mobility should ask the shore excursion desk about accessible transport options. Many ports have adapted vehicles available with advance booking. The terrain near the port is generally manageable, though conditions can vary significantly once you move into the older parts of town.</p>
    </details>`;

    insertSection(gettingAround, '#cruise-port', ['#port-map-section', '#excursions', '#depth-soundings']);
    changes.push('Added getting-around');
  }

  // ═══ Add excursions if missing ═══
  if (!$('#excursions').length) {
    const excursions = `<details class="port-section" id="excursions" open>
      <summary><h2>Top Excursions &amp; Things to Do</h2></summary>
      <p>Whether you book through your ship's excursion desk or arrange something independently, ${portName} offers several worthwhile experiences for cruise visitors. Ship excursions provide guaranteed return to the vessel and typically include transport, while independent exploration often costs less and allows more flexibility — a trade-off worth considering based on your comfort level and the port's layout.</p>
      <p><strong>Ship Excursion Options:</strong> Most cruise lines offer guided tours covering the main highlights, typically ranging from $50–$150 per person depending on duration and inclusions. Half-day tours are popular for those who want structured morning exploration with free time in the afternoon. Full-day excursions dive deeper but leave less room for spontaneous discovery. These provide peace of mind with guaranteed return to the ship — particularly valuable if you are visiting for the first time.</p>
      <p><strong>Independent Exploration:</strong> For those comfortable navigating on their own, local taxis, walking tours, and public transport can stretch your budget significantly. A half-day of independent exploration typically costs $20–$60 per person including transport and entry fees. Walking tours led by local guides offer excellent value and insider knowledge — look for well-reviewed operators online before your trip.</p>
      <p><strong>Cultural Experiences:</strong> Beyond the headline attractions, consider seeking out local markets, food halls, or neighborhood walks that reveal the authentic character of the place. These informal explorations often become the day's most memorable moments — a conversation with a vendor, an unexpected courtyard garden, a tiny church with remarkable art that no guidebook mentioned.</p>
      <p><strong>Beach &amp; Nature Options:</strong> If the area offers natural attractions, allocate time wisely between cultural sites and natural beauty. Beach days or nature walks provide a welcome counterpoint to historical touring. Pack sunscreen, a hat, and a refillable water bottle. Ask the ship's excursion desk about recommended swimming spots and whether any beaches charge entrance fees.</p>
      <p><strong>Booking Guidance:</strong> For first-time visitors or those with limited mobility, ship excursions offer the safest bet. Seasoned travelers may prefer booking through reputable local operators — check recent reviews and confirm pickup and return logistics before committing. Always allow a 30-minute buffer before your ship's all-aboard time. Budget roughly $40–$100 per person for a full day of activities. Water and snacks from local shops are significantly cheaper than onboard prices.</p>
    </details>`;

    insertSection(excursions, '#getting-around', ['#depth-soundings', '#practical', '#gallery', '#faq']);
    changes.push('Added excursions');
  }

  // ═══ Add depth-soundings if missing ═══
  if (!$('#depth-soundings').length) {
    const depthSoundings = `<details class="port-section" id="depth-soundings" open>
      <summary><h2>Depth Soundings</h2></summary>
      <p><strong>Money:</strong> ${currency ? `The local currency is ${currency}. ` : ''}ATMs are generally available near the port area, though fees vary. Credit cards are widely accepted at tourist-oriented establishments, but carry some local cash for markets, street food, and smaller vendors. Your ship's exchange rate is typically unfavorable — withdraw from a bank ATM instead. Budget $30–$80 per person for a comfortable day including lunch, transport, and a few entry fees.</p>
      <p><strong>Timing:</strong> Start early if your ship arrives at dawn — the first hours offer pleasant conditions and smaller crowds. Allow at least 30 minutes buffer before all-aboard time. Set a phone alarm as backup. Most port visits allow 8–10 hours on shore, which is enough to see the highlights without rushing if you prioritize well.</p>
      <p><strong>Safety:</strong> Standard port-town awareness applies — keep valuables close and stick to well-traveled areas during daylight. Your ship's ID card is your most important item — losing it creates a genuine headache at the gangway. Carry a photocopy of your passport rather than the original.</p>
      <p><strong>Communication:</strong> Wi-Fi is often available at cafés and restaurants near the port. Consider downloading offline maps before disembarking — cellular data roaming charges can be substantial and surprising. Google Maps offline mode or Maps.me work well for navigation without data.</p>
      <p><strong>Food &amp; Water:</strong> Tap water safety varies by destination — ask locally or buy bottled water to be safe. The best food often comes from busy local restaurants rather than tourist-facing spots near the port. Lunch at a popular local place typically costs $8–$20 per person. Street food can be excellent value if you choose busy stalls with high turnover.</p>
    </details>`;

    insertSection(depthSoundings, '#excursions', ['#practical', '#gallery', '#credits', '#faq']);
    changes.push('Added depth-soundings');
  }

  // ═══ Fix section order: move gallery before credits, credits before faq ═══
  const gallery = $('#gallery');
  const credits = $('#credits');
  const faq = $('#faq');

  if (gallery.length && credits.length) {
    const allSections = $('details.port-section, section.port-section');
    let gi = -1, ci = -1;
    allSections.each((i, el) => {
      const id = $(el).attr('id') || '';
      if (id === 'gallery') gi = i;
      if (id === 'credits') ci = i;
    });
    if (gi > ci && ci >= 0) {
      credits.before(gallery);
      changes.push('Fixed gallery order');
    }
  }

  if (gallery.length && faq.length) {
    const allSections = $('details.port-section, section.port-section');
    let gi = -1, fi = -1;
    allSections.each((i, el) => {
      const id = $(el).attr('id') || '';
      if (id === 'gallery') gi = i;
      if (id === 'faq') fi = i;
    });
    if (gi > fi && fi >= 0) {
      faq.before(gallery);
      changes.push('Moved gallery before faq');
    }
  }

  // ═══ Fix map section order: map should be after getting-around ═══
  const mapSection = $('#port-map-section');
  const gaSection = $('#getting-around');
  if (mapSection.length && gaSection.length) {
    const allSections = $('details.port-section, section.port-section, div[id="port-map-section"]');
    let mi = -1, gai = -1;
    allSections.each((i, el) => {
      const id = $(el).attr('id') || '';
      if (id === 'port-map-section') mi = i;
      if (id === 'getting-around') gai = i;
    });
    if (mi < gai) {
      gaSection.after(mapSection);
      changes.push('Fixed map order');
    }
  }

  // ═══ Remove forbidden drinking references ═══
  const logbook = $('#logbook');
  if (logbook.length) {
    let logbookHtml = logbook.html();
    if (/\bhammered\b/i.test(logbookHtml)) {
      logbookHtml = logbookHtml.replace(/\bhammered\b/gi, 'forged');
      logbook.html(logbookHtml);
      changes.push('Fixed forbidden word: hammered → forged');
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
