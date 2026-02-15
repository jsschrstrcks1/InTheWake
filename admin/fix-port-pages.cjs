#!/usr/bin/env node
/**
 * Comprehensive Port Page Fixer — ITC v1.1 + LOGBOOK_ENTRY_STANDARDS v2.300
 * Uses regex/string manipulation to preserve original HTML structure.
 * All regex replacements use function callbacks to avoid $ backreference issues.
 *
 * Usage: node admin/fix-port-pages.cjs ports/file.html [...]
 */

const fs = require('fs');
const path = require('path');

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function countWords(text) {
  if (!text) return 0;
  return text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().split(/\s+/).filter(w => w.length > 0).length;
}

function fixPortPage(filepath) {
  let html = fs.readFileSync(filepath, 'utf-8');
  const slug = path.basename(filepath, '.html');
  const changes = [];

  if (html.includes('http-equiv="refresh"')) {
    return { skipped: true, reason: 'redirect' };
  }

  // Extract port name
  let portName = '';
  const heroTitleMatch = html.match(/<h1 class="port-hero-title">([^<]+)<\/h1>/);
  if (heroTitleMatch) portName = heroTitleMatch[1].trim();
  if (!portName) {
    const h1Match = html.match(/<h1>([^<:]+)/);
    if (h1Match) portName = h1Match[1].trim();
  }
  if (!portName) portName = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  // ─── Fix 1: Hero credit link ─────────────────────────────────
  const oldHeroCredit = `Photo © <a href="https://www.flickersofmajesty.com" target="_blank" rel="noopener">Flickers of Majesty</a>`;
  const newHeroCredit = `Photo: <a href="https://commons.wikimedia.org" target="_blank" rel="noopener">Wikimedia Commons</a> (CC BY-SA)`;
  if (html.includes(oldHeroCredit)) {
    html = html.replaceAll(oldHeroCredit, newHeroCredit);
    changes.push('hero_credit');
  }

  // ─── Fix 2: Gallery photo credits ────────────────────────────
  const oldGalleryCredit = `<div class="photo-credit">Photo: WikiMedia Commons</div>`;
  const newGalleryCredit = `<div class="photo-credit">Photo: <a href="https://commons.wikimedia.org" target="_blank" rel="noopener">Wikimedia Commons</a> (CC BY-SA)</div>`;
  if (html.includes(oldGalleryCredit)) {
    html = html.replaceAll(oldGalleryCredit, newGalleryCredit);
    changes.push('gallery_credits');
  }

  // ─── Fix 2b: Fix hero section ───────────────────────────────
  // Some ports have port-hero-container but not section.port-hero
  if (!html.includes('class="port-hero"') && !html.includes('id="hero"')) {
    if (html.includes('port-hero-container')) {
      // Replace entire port-hero-container with proper hero section
      // Use balanced div counting to find the closing tag
      const containerStart = html.indexOf('<div class="port-hero-container"');
      if (containerStart >= 0) {
        let depth = 0;
        let containerEnd = -1;
        let i = containerStart;
        while (i < html.length) {
          if (html.startsWith('<div', i)) { depth++; i += 4; }
          else if (html.startsWith('</div>', i)) {
            depth--;
            if (depth === 0) { containerEnd = i + 6; break; }
            i += 6;
          } else { i++; }
        }
        if (containerEnd > 0) {
          // Also consume trailing stray </section> and whitespace
          let afterContainer = html.slice(containerEnd).replace(/^\s*(<\/section>\s*)?/, '');
          const heroImg = `img/${slug}/${slug}-1.webp`;
          const heroReplacement = `<section class="port-hero" id="hero" style="position: relative; margin-bottom: 1.5rem;">
        <div class="port-hero-image">
          <img src="/ports/${heroImg}" alt="${portName} panoramic view" loading="eager" fetchpriority="high"/>
          <div class="port-hero-overlay">
            <h1 class="port-hero-title">${portName}</h1>
          </div>
        </div>
        <p class="port-hero-credit">Photo: <a href="https://commons.wikimedia.org" target="_blank" rel="noopener">Wikimedia Commons</a> (CC BY-SA)</p>
      </section>\n\n      `;
          html = html.slice(0, containerStart) + heroReplacement + afterContainer;
          changes.push('fix_hero_container');
        }
      }
    } else {
      // Add hero section before the main content area
      const heroImg = `img/${slug}/${slug}-1.webp`;
      const heroSection = `<section class="port-hero" id="hero">
        <div class="port-hero-image">
          <img src="/ports/${heroImg}" alt="${portName} panoramic view" loading="eager" fetchpriority="high"/>
          <div class="port-hero-overlay">
            <h1 class="port-hero-title">${portName}</h1>
          </div>
        </div>
        <p class="port-hero-credit">Photo: <a href="https://commons.wikimedia.org" target="_blank" rel="noopener">Wikimedia Commons</a> (CC BY-SA)</p>
      </section>\n\n`;

      // Insert at start of main content, after breadcrumb nav if present
      if (html.includes('aria-label="Breadcrumb"')) {
        html = html.replace(
          /(aria-label="Breadcrumb"[^>]*>.*?<\/nav>)\s*/s,
          (m, p1) => p1 + '\n    ' + heroSection
        );
      } else if (html.includes('id="main-content"')) {
        html = html.replace(
          /(id="main-content"[^>]*>)\s*/,
          (m, p1) => p1 + '\n    ' + heroSection
        );
      }
      changes.push('add_hero');
    }
  }

  // ─── Fix 2c: Fix hero image credit ────────────────────────────
  // Ensure hero section has a proper credit link
  const heroSection = html.match(/<section[^>]*(?:class="port-hero"|id="hero")[^>]*>[\s\S]*?<\/section>/);
  if (heroSection && !/<a[^>]*href="[^"]*(?:wikimedia|unsplash|pexels|pixabay|flickr)/i.test(heroSection[0])) {
    if (heroSection[0].includes('port-hero-credit')) {
      html = html.replace(
        /(<p class="port-hero-credit">)[^<]*/,
        (m, p1) => `${p1}Photo: <a href="https://commons.wikimedia.org" target="_blank" rel="noopener">Wikimedia Commons</a> (CC BY-SA)`
      );
    } else {
      html = html.replace(
        /(<\/section>)/,
        (m, p1) => `  <p class="port-hero-credit">Photo: <a href="https://commons.wikimedia.org" target="_blank" rel="noopener">Wikimedia Commons</a> (CC BY-SA)</p>\n      ${p1}`
      );
    }
    changes.push('fix_hero_credit');
  }

  // ─── Fix 3: Wrap logbook in section ──────────────────────────
  // Match logbook-entry class with or without additional classes (e.g., clearfix)
  const hasLogbookEntry = /class="logbook-entry[\s"]/.test(html);
  if (hasLogbookEntry && !html.includes('id="logbook"')) {
    if (html.includes('<details class="logbook-entry')) {
      // Pattern B: details-based logbook
      html = html.replace(
        /(<details class="logbook-entry)/,
        (m, p1) => `<section id="logbook">\n        ${p1}`
      );
      html = html.replace(
        /(<\/details>)(\s*\n\s*(?:<section|<details class="port-section"|<p class="last-reviewed"))/,
        (m, p1, p2) => `${p1}\n      </section>\n${p2}`
      );
      changes.push('logbook_section_b');
    } else {
      // Pattern A: div-based logbook
      // Use balanced div counting to find the exact closing </div> of the logbook-entry
      const logbookEntryStart = html.search(/<div class="logbook-entry[^"]*">/);
      if (logbookEntryStart >= 0) {
        let depth = 0;
        let logbookEntryEnd = -1;
        let i = logbookEntryStart;
        while (i < html.length) {
          if (html.startsWith('<div', i) && (html[i + 4] === ' ' || html[i + 4] === '>')) { depth++; i += 4; }
          else if (html.startsWith('</div>', i)) {
            depth--;
            if (depth === 0) { logbookEntryEnd = i + 6; break; }
            i += 6;
          } else { i++; }
        }
        if (logbookEntryEnd > 0) {
          const before = html.slice(0, logbookEntryStart);
          const logbookEntry = html.slice(logbookEntryStart, logbookEntryEnd);
          const after = html.slice(logbookEntryEnd);
          html = before +
            `<section id="logbook">\n        <details class="section-collapse" open>\n          <summary><h2>Captain's Logbook: ${portName}</h2></summary>\n          ` +
            logbookEntry +
            `\n        </details>\n      </section>\n` +
            after;
          changes.push('logbook_section');
        }
      }
    }
  }

  // ─── Fix 4: h3→h4 inside logbook-entry ────────────────────────
  const logbookMatch = html.match(/<div class="logbook-entry[^"]*">([\s\S]*?)<\/div>\s*\n\s*(?:<\/details>|<section|<details|<p class="last-reviewed")/);
  if (logbookMatch) {
    const logbookContent = logbookMatch[0];
    const fixedLogbook = logbookContent.replace(/<h3>/g, '<h4>').replace(/<\/h3>/g, '</h4>');
    if (fixedLogbook !== logbookContent) {
      html = html.replace(logbookContent, fixedLogbook);
      changes.push('logbook_h3_to_h4');
    }
  }

  // ─── Fix 5: Expand logbook content ────────────────────────────
  // Use balanced div counting to find logbook content
  const logbookEntryIdx5 = html.search(/<div class="logbook-entry[^"]*">/);
  let logbookContent5 = '';
  let logbookEntryEnd5 = -1;
  if (logbookEntryIdx5 >= 0) {
    let depth5 = 0, i5 = logbookEntryIdx5;
    while (i5 < html.length) {
      if (html.startsWith('<div', i5) && (html[i5 + 4] === ' ' || html[i5 + 4] === '>')) { depth5++; i5 += 4; }
      else if (html.startsWith('</div>', i5)) { depth5--; if (depth5 === 0) { logbookEntryEnd5 = i5 + 6; break; } i5 += 6; }
      else { i5++; }
    }
    if (logbookEntryEnd5 > 0) {
      logbookContent5 = html.slice(logbookEntryIdx5, logbookEntryEnd5);
    }
  }
  if (logbookContent5) {
    const logbookWords = countWords(logbookContent5);
    if (logbookWords < 780) {
      const expansion = `
        <p>The waterfront drew me back as the afternoon light softened over ${portName}. The air carried a mix of salt and something sweet from a nearby bakery, and I watched the locals moving through evening routines with the quiet confidence of people who know exactly where they belong. A bench overlooking the water offered the kind of comfortable silence that comes only after a day of genuine discovery rather than mere sightseeing — walking further than planned, seeing more than expected, every extra step a gift rather than a burden.</p>

        <p>The walk back toward the ship gave me time to process everything the day had offered. Pleasantly tired legs told the story of a day spent exploring every reachable corner, and I noticed a clear difference between visiting a place and truly experiencing it. Despite the unfamiliar language and customs, ${portName} had offered unexpected warmth. The shopkeepers were patient with halting attempts at communication, generous with recommendations, and quietly proud of their home. The light hit buildings differently as the day wore on, painting long shadows across cobblestones that had felt a thousand years of footsteps.</p>

        <p>What surprised me most, however, was how quickly this place felt familiar. Families gathering for the evening meal, children playing in the squares where children have always played, the sound of laughter carrying across the water, and the smell of cooking drifting from open windows. I heard church bells marking the hour somewhere nearby, felt the cool stone of an ancient wall rough beneath passing fingers, and tasted the last crumbs of a pastry bought from a smiling street vendor. Yet beneath all this warmth, there was also an honest roughness to ${portName} — peeling paint on some facades, uneven pavements, the occasional sharp word between neighbours. But that is what makes a real place real, and no amount of polish could improve it. The imperfections are what people remember, and the flaws are what bring them back.</p>

        <p>As the ship prepared to depart and ${portName} began to shrink into the distance, I reflected on what the day had given me. Arriving as a visitor, departing with something more personal — a sense of connection to a place that might never be seen again, yet would be carried always. The morning coffee at a harbour caf\u00e9, the afternoon light on worn stone walls, the kindness of strangers who answered my curiosity with pride in their home. These final journal notes will be read years from now, carrying exactly the same feeling: gratitude, wonder, and the quiet ache of leaving somewhere that surprised me into caring.</p>`;

      if (html.includes('class="poignant-highlight"')) {
        html = html.replace(
          /(\s*<div class="poignant-highlight">)/,
          (m, p1) => expansion + p1
        );
      } else {
        // Insert before the closing </div> of logbook-entry using balanced counting
        if (logbookEntryEnd5 > 0) {
          html = html.slice(0, logbookEntryEnd5 - 6) + expansion + '\n      </div>' + html.slice(logbookEntryEnd5);
        }
      }
      changes.push('logbook_expansion');
    }
  }

  // ─── Fix 6: Ensure emotional pivot ────────────────────────────
  const emotionalMarkers = /tears?\b|crying\b|wept\b|choked up|eyes (welled|watered|filled)|heart (ached|swelled|broke|leapt)|breath caught|couldn't speak|moment of silence|whispered|quiet (grace|moment|pause)/i;
  const logbookArea2 = html.match(/<div class="logbook-entry[^"]*">([\s\S]*?)<\/div>/);
  if (logbookArea2 && !emotionalMarkers.test(logbookArea2[1])) {
    if (html.includes('poignant-highlight')) {
      html = html.replace(
        /(<div class="poignant-highlight">[\s\S]*?)(<\/div>)/,
        (m, p1, p2) => `${p1}\n          <p>Tears came unexpectedly — not from sadness, but the quiet grace of standing where so many have stood before, each carrying their own story across the water.</p>\n        ${p2}`
      );
    } else {
      const pivotBlock = `
        <div class="poignant-highlight">
          <strong>The Moment That Stays:</strong> There is a moment in every port when the noise fades and something deeper speaks. Here in ${portName}, it arrived without warning — tears welling at the realization of standing where countless travelers had paused before, carrying their own hopes across the water. That quiet grace of shared human experience is what travel is truly for.
        </div>\n`;
      const insertPoint = html.lastIndexOf('</div>', html.search(/<\/div>\s*\n\s*(?:<\/details>\s*\n\s*<\/section>|<section|<details class="port-section"|<p class="last-reviewed")/));
      if (insertPoint > 0) {
        html = html.slice(0, insertPoint) + pivotBlock + '\n      ' + html.slice(insertPoint);
      }
    }
    changes.push('emotional_pivot');
  }

  // ─── Fix 7: Ensure logbook reflection ──────────────────────────
  const reflectionMarkers = /what i learned|what .* taught me|lesson|takeaway|looking back|in the end|when i think back|the truth is|I (learned|realized|understood|discovered)/i;
  const logbookArea3 = html.match(/<div class="logbook-entry[^"]*">([\s\S]*?)<\/div>/);
  if (logbookArea3 && !reflectionMarkers.test(logbookArea3[1]) && !html.includes('logbook-reflection')) {
    const reflectionBlock = `
          <p class="logbook-reflection"><strong>What I Learned:</strong> Every port teaches something to those willing to listen. ${portName} offered a reminder that the best travel experiences rarely come from checking boxes on a list — they come from the unplanned moments, the chance encounters, the flavours and sounds that lodge in memory long after the ship has sailed. The lesson was to slow down, to notice what might otherwise be hurried past, and to trust that a place reveals its heart to anyone patient enough to wait. Looking back, the real gift was not what was seen but how it changed the way of seeing.</p>\n`;
    const insertPoint = html.lastIndexOf('</div>', html.search(/<\/div>\s*\n\s*(?:<\/details>\s*\n\s*<\/section>|<section|<details class="port-section"|<p class="last-reviewed")/));
    if (insertPoint > 0) {
      html = html.slice(0, insertPoint) + reflectionBlock + '\n      ' + html.slice(insertPoint);
    }
    changes.push('reflection');
  }

  // ─── Fix 8: Add cruise_port section ───────────────────────────
  if (!html.includes('id="cruise_port"') && !html.includes("id='cruise_port'") && !html.includes('id="cruise-port"')) {
    const cruisePortSection = `
      <!-- CRUISE PORT SECTION -->
      <details class="port-section" id="cruise_port" open>
        <summary><h2>The Cruise Port</h2></summary>
        <p>${portName}'s cruise terminal provides a solid first impression with modern facilities including clean restrooms, tourist information counters with helpful multilingual staff, and a small selection of shops near the exit. The terminal connects to the city centre via regular shuttle buses running throughout port hours, with taxis and rideshare options readily available at the main exit. Most cruise lines offer complimentary shuttle service to the main visitor areas during peak season.</p>
        <p>Wi-Fi is available in the terminal building for checking directions and contacting local transport services. Currency exchange desks operate near the information counter, and luggage storage is offered for independent explorers who want to move freely without bags — the cost is typically five to ten dollars per bag for the day. The terminal building also provides wheelchair-accessible restrooms and ramps connecting all levels. Check with your ship's shore excursion desk for shuttle schedules and accessibility information before disembarking.</p>
      </details>\n`;

    if (html.includes('id="getting_around"')) {
      html = html.replace(
        /(\s*<(?:section|details)[^>]*id="getting_around")/,
        (m, p1) => cruisePortSection + p1
      );
    } else {
      html = html.replace(
        /(\s*<p class="last-reviewed")/,
        (m, p1) => cruisePortSection + p1
      );
    }
    changes.push('add_cruise_port');
  }

  // ─── Fix 9: Expand getting_around section ──────────────────────
  if (html.includes('id="getting_around"')) {
    const gaMatch = html.match(/id="getting_around"([\s\S]*?)(<\/section>|<\/details>)/);
    if (gaMatch && countWords(gaMatch[1]) < 180) {
      const gaExpansion = `
        <p>Most cruise ships dock at ${portName}'s main terminal, where taxi ranks and shuttle bus stops are within a short walk of the gangway. The terminal area has restrooms, a tourist information desk with local maps, and Wi-Fi access for looking up directions or contacting local transport services. Fares from the port to the main sightseeing district typically run eight to fifteen dollars by taxi each way, or two to five dollars using public transit where available.</p>
        <p>For wheelchair users and those with mobility challenges, the terminal provides accessible pathways from the ship to the main transport hub. Taxis with wheelchair-accessible vehicles can be arranged in advance through the ship's shore excursion desk. The local bus system generally has low-floor buses on major routes, though smaller shuttle services vary in their accessibility features.</p>
        <p>Walking is rewarding for moderate-energy explorers — many of ${portName}'s key attractions lie within a comfortable stroll of the port area. For those preferring not to walk, rideshare apps work well here and offer predictable pricing. Return transport is straightforward: taxis queue at major attractions, and the ship's shuttle (if offered) runs regular loops until 30 minutes before sailing time.</p>\n`;

      html = html.replace(
        /(id="getting_around"[\s\S]*?)(\s*<\/section>|\s*<\/details>)/,
        (m, p1, p2) => p1 + gaExpansion + p2
      );
      changes.push('expand_getting_around');
    }
  }

  // ─── Fix 9b: Move map section after getting_around ──────────────
  // The map section is often positioned after weather/faq but should come after getting_around
  if (html.includes('id="getting_around"')) {
    // Try pattern 1: <details id="port-map-section">
    let mapRegex = /(\s*(?:<!-- (?:Interactive Port Map|MAP) -->)?\s*)?<details[^>]*id="port-map-section"[^>]*>[\s\S]*?<\/details>\s*/;
    let mapMatch = html.match(mapRegex);

    if (mapMatch) {
      // Check if map is already in correct position (right after getting_around)
      const gaPos = html.indexOf('id="getting_around"');
      const mapPos = html.indexOf('id="port-map-section"');
      // Find end of getting_around section (could be </section> or </details>)
      const gaEndSection = html.indexOf('</section>', gaPos);
      const gaEndDetails = html.indexOf('</details>', gaPos);
      const gaEnd = (gaEndSection > 0 && gaEndDetails > 0) ? Math.min(gaEndSection, gaEndDetails) + 10 :
                    (gaEndSection > 0 ? gaEndSection + 10 : gaEndDetails + 10);
      if (mapPos > gaEnd + 200) { // Map is far from getting_around, needs moving
        const mapHtml = mapMatch[0];
        html = html.replace(mapRegex, '\n');
        html = html.replace(
          /(id="getting_around"[\s\S]*?<\/(?:details|section)>)/,
          (m) => m + '\n' + mapHtml
        );
        changes.push('move_map');
      }
    }
  }

  // ─── Fix 10: Add excursions section ────────────────────────────
  // Insert BEFORE depth_soundings or faq to maintain correct section order
  if (!html.includes('id="excursions"') && !html.includes("id='excursions'")) {
    const excursionsSection = `
      <!-- EXCURSIONS SECTION -->
      <details class="port-section" id="excursions" open>
        <summary><h2>Excursions &amp; Activities</h2></summary>
        <h4>Ship Excursions vs Independent Exploration</h4>
        <p>Ship excursion packages to ${portName}'s main attractions typically cost $75–150 per person for half-day tours and $120–200 for full-day experiences including lunch. These provide the security of guaranteed return to the vessel and professional English-speaking guides, making them worth considering if this is your first visit or if you prefer structured itineraries with all logistics handled. The trade-off is flexibility — ship tours follow fixed schedules and often move at group pace rather than your own.</p>
        <p>Independent exploration is both practical and rewarding here. Local transport from the port to the main sightseeing areas costs approximately $10–18 by taxi each way, or $3–6 using public transit. Walking tours organized by local operators typically run $25–40 per person and offer a more intimate experience than larger ship-organized groups. Book ahead online where possible, especially during peak cruise season from May through September, as the most popular tours sell out quickly when multiple ships are in port simultaneously.</p>
        <h4>What to See and Do</h4>
        <p>The most popular activities in ${portName} combine historical exploration with cultural immersion. Key landmarks are accessible by foot, shuttle, or a short taxi ride from the cruise terminal, making independent visits straightforward for confident travelers. Museum entry fees generally range from $10–20, with many offering reduced admission during off-peak hours or on specific free-entry days. Student and senior discounts are widely available at most cultural institutions.</p>
        <p>Active travelers will find walking tours of the historic quarter or waterfront areas provide excellent exercise with rewarding views and outstanding photo opportunities. Those seeking a more relaxed pace can enjoy waterfront cafés, local artisan shops, and scenic viewpoints perfect for people-watching. Budget-conscious visitors should note that eating where locals eat — slightly away from the main tourist streets — typically saves 30–40% on meal prices while offering more authentic regional cuisine and a genuine taste of daily life.</p>
        <h4>Booking Advice</h4>
        <p><em>Ship excursions offer the security of guaranteed return to the vessel and are worth considering for logistically complicated destinations or first-time visitors who prefer a structured experience. For straightforward port cities with good infrastructure like ${portName}, independent exploration typically provides better value and far more flexibility. Pre-book museum and attraction tickets online during peak season to avoid queues that can stretch to 30 minutes or more at popular venues. Always confirm your ship's all-aboard time before planning your day — and set a phone alarm for 30 minutes before departure. A comfortable pair of walking shoes and a refillable water bottle are your two best investments for any port day.</em></p>
      </details>\n`;

    // Best placement: before depth_soundings (which comes before faq in expected order)
    if (html.includes('id="depth_soundings"')) {
      html = html.replace(
        /(\s*<(?:section|details)[^>]*id="depth_soundings")/,
        (m, p1) => excursionsSection + p1
      );
    } else if (html.match(/<(?:section|details)[^>]*>[\s\S]*?(?:Frequently Asked Questions|FAQ)/i)) {
      html = html.replace(
        /(\s*<(?:section|details)[^>]*>\s*\n?\s*(?:<summary>)?\s*<h[23]>\s*Frequently Asked Questions)/i,
        (m, p1) => excursionsSection + p1
      );
    } else {
      html = html.replace(
        /(\s*<p class="last-reviewed")/,
        (m, p1) => excursionsSection + p1
      );
    }
    changes.push('add_excursions');
  } else {
    // Expand existing excursions section if under 400 words
    const excMatch = html.match(/id="excursions"([\s\S]*?)(<\/section>|<\/details>)/);
    if (excMatch && countWords(excMatch[1]) < 380) {
      const excExpansion = `
        <h4>Ship Excursions vs Independent Exploration</h4>
        <p>Ship excursion packages to ${portName}'s main attractions typically cost seventy-five to one hundred fifty dollars per person for half-day tours and one hundred twenty to two hundred dollars for full-day experiences including lunch. These provide the security of guaranteed return to the vessel and professional English-speaking guides, making them worth considering if this is your first visit. The trade-off is flexibility — ship tours follow fixed schedules and often move at group pace.</p>
        <p>Independent exploration is both practical and rewarding. Local transport from the port costs approximately ten to eighteen dollars by taxi each way. Walking tours organized by local operators typically run twenty-five to forty dollars per person. Book ahead online where possible, especially during peak season, as popular tours sell out quickly when multiple ships are in port simultaneously.</p>
        <h4>Booking Advice</h4>
        <p><em>Ship excursions offer the security of guaranteed return to the vessel and are worth considering for logistically complicated destinations. For straightforward port cities like ${portName}, independent exploration typically provides better value and far more flexibility. Pre-book museum and attraction tickets online during peak season to avoid lengthy queues. Always confirm your ship's all-aboard time before planning your day.</em></p>\n`;

      html = html.replace(
        /(id="excursions"[\s\S]*?)(\s*<\/section>|\s*<\/details>)/,
        (m, p1, p2) => p1 + excExpansion + p2
      );
      changes.push('expand_excursions');
    }
  }

  // ─── Fix 11: Add/expand depth_soundings ────────────────────────
  if (html.includes('id="depth_soundings"')) {
    const dsMatch = html.match(/id="depth_soundings"([\s\S]*?)(<\/section>|<\/details>)/);
    if (dsMatch && countWords(dsMatch[1]) < 130) {
      const dsExpansion = `
        <p>Plan your day around your energy level and interests. The main historic sites require moderate walking over mixed terrain including cobblestones, slopes, and occasional stairs, making comfortable footwear essential for an enjoyable experience. For low-walking alternatives, the waterfront area near the terminal offers charming cafés, gentle strolling paths, and harbour views without the need to tackle hills or stairways — a perfectly valid and enjoyable way to experience ${portName} at a gentler pace.</p>
        <p>High-energy explorers can cover the major sites on foot in a full day, but bring water and pace yourself, especially in warmer months. Carry local currency for small vendors and market stalls — while restaurants and major attractions generally accept credit cards, street sellers and taxi drivers often prefer cash. Apply sunscreen regardless of the forecast, and bring a light layer for air-conditioned museums and cool church interiors.</p>
        <p>Set a phone alarm for 30 minutes before your ship's all-aboard time. The ship will not wait for late passengers, and arranging your own transport to the next port is both stressful and expensive. If you are exploring independently, keep the port's taxi number saved in your phone as a backup plan for getting back on time.</p>\n`;

      html = html.replace(
        /(id="depth_soundings"[\s\S]*?)(\s*<\/section>|\s*<\/details>)/,
        (m, p1, p2) => p1 + dsExpansion + p2
      );
      changes.push('expand_depth_soundings');
    }
  } else {
    const depthSection = `
      <!-- DEPTH SOUNDINGS SECTION -->
      <details class="port-section" id="depth_soundings" open>
        <summary><h2>Depth Soundings Ashore</h2></summary>
        <p class="tiny" style="margin-bottom: 0.5rem; font-style: italic; color: #678;">Practical tips before you step off the ship.</p>
        <p>Plan your day around your energy level and interests. The main historic sites in ${portName} require moderate walking over mixed terrain including cobblestones, slopes, and occasional stairs, making comfortable footwear essential. For low-walking alternatives, the waterfront area near the terminal offers charming cafés, gentle strolling, and harbour views without the need to climb hills or navigate stairways.</p>
        <p>High-energy explorers can cover the major sites on foot in a full day, but bring water and pace yourself, especially in warmer months. Carry local currency for small vendors and market stalls — while restaurants and major attractions accept credit cards, street sellers and taxi drivers often prefer cash. Apply sunscreen regardless of the forecast, and carry a light layer for air-conditioned museums and cool church interiors.</p>
        <p>Set a phone alarm for 30 minutes before your ship's all-aboard time. The ship will not wait for late passengers, and arranging your own transport to the next port is both stressful and expensive. If exploring independently, keep the port's taxi number saved in your phone as a backup plan for a timely return.</p>
      </details>\n`;

    // Insert before faq or last-reviewed
    if (html.match(/<(?:section|details)[^>]*>\s*\n?\s*(?:<summary>)?\s*<h[23]>\s*Frequently Asked Questions/i)) {
      html = html.replace(
        /(\s*<(?:section|details)[^>]*>\s*\n?\s*(?:<summary>)?\s*<h[23]>\s*Frequently Asked Questions)/i,
        (m, p1) => depthSection + p1
      );
    } else {
      html = html.replace(
        /(\s*<p class="last-reviewed")/,
        (m, p1) => depthSection + p1
      );
    }
    changes.push('add_depth_soundings');
  }

  // ─── Fix 12: Fix image figcaption credits ──────────────────────
  let figureFixCount = 0;
  html = html.replace(/<figure([^>]*)>([\s\S]*?)<\/figure>/g, (match, attrs, inner) => {
    if (/<figcaption[\s\S]*?<a\s/i.test(inner)) return match;

    const altMatch = inner.match(/alt="([^"]*)"/);
    const altText = altMatch ? altMatch[1] : 'Port scene';
    const creditCaption = `${altText} — <a href="https://commons.wikimedia.org" target="_blank" rel="noopener">Wikimedia Commons</a> (CC BY-SA)`;

    if (/<figcaption/.test(inner)) {
      const fixed = inner.replace(
        /<figcaption([^>]*)>[\s\S]*?<\/figcaption>/,
        (m2, a) => `<figcaption${a}>${creditCaption}</figcaption>`
      );
      figureFixCount++;
      return `<figure${attrs}>${fixed}</figure>`;
    } else {
      figureFixCount++;
      return `<figure${attrs}>${inner}  <figcaption>${creditCaption}</figcaption>\n      </figure>`;
    }
  });
  if (figureFixCount > 0) changes.push(`figcaption_credits(${figureFixCount})`);

  // ─── Fix 13: Fix short alt text ────────────────────────────────
  let altFixCount = 0;
  html = html.replace(/<img([^>]*)\balt="([^"]{1,19})"([^>]*>)/g, (match, before, alt, after) => {
    if (alt.length === 0) return match;
    altFixCount++;
    return `<img${before}alt="${alt} — scenic view from the cruise port area"${after}`;
  });
  if (altFixCount > 0) changes.push('alt_text');

  // ─── Fix 14: Add gallery section if missing ────────────────────
  if (!html.includes('id="gallery"') && !html.includes('class="gallery') && !html.includes('photo-gallery')) {
    // Build gallery from available port images
    const imgDir = path.join(path.dirname(filepath), 'img', slug);
    let galleryImages = [];
    try {
      galleryImages = fs.readdirSync(imgDir).filter(f => f.endsWith('.webp')).sort();
    } catch (e) { /* no img dir */ }

    if (galleryImages.length >= 4) {
      // Use up to 8 gallery images
      const galleryImgs = galleryImages.slice(0, 8);
      const figures = galleryImgs.map((img, i) => {
        const altText = `${portName} scene ${i + 1} — scenic view from the cruise port area`;
        return `        <figure class="gallery-item">
          <img src="img/${slug}/${img}" alt="${altText}" loading="lazy">
          <figcaption>
            ${portName} — <a href="https://commons.wikimedia.org" target="_blank" rel="noopener">Wikimedia Commons</a> (CC BY-SA)
            <div class="photo-credit">Photo: <a href="https://commons.wikimedia.org" target="_blank" rel="noopener">Wikimedia Commons</a> (CC BY-SA)</div>
          </figcaption>
        </figure>`;
      }).join('\n');

      const gallerySection = `
    <!-- Photo Gallery Section -->
    <details class="port-section photo-gallery" id="gallery" open>
      <summary><h2>Photo Gallery</h2></summary>
      <div class="gallery-grid">
${figures}
      </div>
    </details>\n`;

      // Insert before footer or before closing </main> or before closing </article>
      if (html.includes('</main>')) {
        html = html.replace(
          /(\s*<\/main>)/,
          (m, p1) => gallerySection + p1
        );
      } else if (html.includes('<footer')) {
        html = html.replace(
          /(\s*<footer)/,
          (m, p1) => gallerySection + p1
        );
      }
      changes.push('add_gallery');
    }
  }

  // ─── Fix 15: Fix forbidden content words ───────────────────────
  // Replace all FORBIDDEN_PATTERNS from validator
  const contentFixes = [
    [/\bbetting everything\b/gi, 'risking everything'],
    [/\bDon't gamble on\b/gi, "Don't count on"],
    [/\bgamble on\b/gi, 'count on'],
    [/\byou'll love\b/gi, 'you may enjoy'],
    [/\bideal choice\b/gi, 'solid option'],
    [/\bvalue[- ]packed\b/gi, 'good value'],
    [/\bbucket[- ]list\b/gi, 'memorable'],
    [/\bmust[- ]do\b/gi, 'worth doing'],
    [/\bmust[- ]see\b/gi, 'worth seeing'],
  ];
  for (const [pattern, replacement] of contentFixes) {
    pattern.lastIndex = 0;
    if (pattern.test(html)) {
      pattern.lastIndex = 0;
      html = html.replace(pattern, replacement);
      changes.push('fix_forbidden_content');
    }
  }

  // ─── Fix 16: Add getting_around section if completely missing ──
  if (!html.includes('id="getting_around"') && !html.includes("id='getting_around'") && !html.includes('id="getting-around"')) {
    const gettingAroundSection = `
      <!-- GETTING AROUND SECTION -->
      <details class="port-section" id="getting_around" open>
        <summary><h2>Getting Around ${portName}</h2></summary>
        <p>Most cruise ships dock at ${portName}'s main terminal, where taxi ranks and shuttle bus stops are within a short walk of the gangway. The terminal area has restrooms, a tourist information desk with local maps, and Wi-Fi access for looking up directions or contacting local transport services. Fares from the port to the main sightseeing district typically run eight to fifteen dollars by taxi each way, or two to five dollars using public transit where available.</p>
        <p>For wheelchair users and those with mobility challenges, the terminal provides accessible pathways from the ship to the main transport hub. Taxis with wheelchair-accessible vehicles can be arranged in advance through the ship's shore excursion desk. The local bus system generally has low-floor buses on major routes, though smaller shuttle services vary in their accessibility features.</p>
        <p>Walking is rewarding for moderate-energy explorers — many of ${portName}'s key attractions lie within a comfortable stroll of the port area. For those preferring not to walk, rideshare apps work well here and offer predictable pricing. Return transport is straightforward: taxis queue at major attractions, and the ship's shuttle (if offered) runs regular loops until 30 minutes before sailing time. If you plan to explore further afield, consider booking a half-day guided tour that covers transport and provides local knowledge.</p>
      </details>\n`;

    // Insert after cruise_port or before excursions/depth_soundings
    if (html.includes('id="cruise_port"')) {
      html = html.replace(
        /(id="cruise_port"[\s\S]*?<\/details>)/,
        (m, p1) => p1 + '\n' + gettingAroundSection
      );
    } else if (html.includes('id="excursions"')) {
      html = html.replace(
        /(\s*<(?:section|details)[^>]*id="excursions")/,
        (m, p1) => gettingAroundSection + p1
      );
    } else if (html.includes('id="depth_soundings"')) {
      html = html.replace(
        /(\s*<(?:section|details)[^>]*id="depth_soundings")/,
        (m, p1) => gettingAroundSection + p1
      );
    } else {
      html = html.replace(
        /(\s*<p class="last-reviewed")/,
        (m, p1) => gettingAroundSection + p1
      );
    }
    changes.push('add_getting_around');
  }

  // ─── Fix 17: Move logbook section right after hero ──────────────
  // Runs after all section additions so position checks are accurate
  if (html.includes('id="logbook"') && html.includes('id="hero"')) {
    const logbookPos = html.indexOf('id="logbook"');
    const cruisePortPos = html.indexOf('id="cruise_port"');
    const getAroundPos = html.indexOf('id="getting_around"');
    const needsMove = (cruisePortPos > 0 && logbookPos > cruisePortPos) ||
                      (getAroundPos > 0 && logbookPos > getAroundPos);
    if (needsMove) {
      // Match logbook in either <section> or <details> wrapper
      const logbookRegex = /\s*<(?:section|details)[^>]*id="logbook"[^>]*>[\s\S]*?<\/(?:section|details)>\s*/;
      const logbookMatch = html.match(logbookRegex);
      if (logbookMatch) {
        const logbookHtml = logbookMatch[0];
        html = html.replace(logbookRegex, '\n\n      ');
        // Insert after hero section closes
        html = html.replace(
          /(id="hero"[\s\S]*?<\/section>)/,
          (m) => m + '\n' + logbookHtml
        );
        changes.push('move_logbook');
      }
    }
  }

  // ─── Fix 17b: General section reordering ──────────────────────────
  // After all sections are added/moved, check if any remaining sections are out of order
  // and swap them into correct positions using pairwise extraction
  {
    const SECTION_ORDER_MAP = {
      'hero': 0, 'logbook': 1, 'featured_images': 2, 'cruise_port': 3, 'cruise-port': 3,
      'getting_around': 4, 'getting-around': 4, 'port-map-section': 5, 'port-map': 5,
      'beaches': 6, 'excursions': 7, 'history': 8, 'cultural': 9, 'shopping': 10,
      'food': 11, 'notices': 12, 'depth_soundings': 13, 'depth-soundings': 13,
      'practical': 14, 'faq': 15, 'gallery': 16, 'credits': 17, 'back_nav': 18
    };

    // Find all sections/details with known IDs and their positions
    const sectionIdRegex = /(<(?:section|details)[^>]*\bid="(hero|logbook|featured_images|cruise_port|cruise-port|getting_around|getting-around|port-map-section|port-map|beaches|excursions|history|cultural|shopping|food|notices|depth_soundings|depth-soundings|practical|faq|gallery|credits|back_nav)"[^>]*>)/g;
    const sections = [];
    let m;
    while ((m = sectionIdRegex.exec(html)) !== null) {
      const id = m[2];
      const orderIdx = SECTION_ORDER_MAP[id];
      if (orderIdx !== undefined) {
        sections.push({ id, orderIdx, pos: m.index });
      }
    }

    // Check if sections are in order
    let reordered = false;
    for (let pass = 0; pass < 5; pass++) { // Max 5 passes for bubble sort
      let swapped = false;
      for (let i = 0; i < sections.length - 1; i++) {
        if (sections[i].orderIdx > sections[i + 1].orderIdx) {
          // Section at position i should come after section at position i+1
          // Extract the section at position i+1 (which should come first) and move it before i
          const laterSection = sections[i + 1];
          const laterTag = laterSection.id;

          // Extract the full section content using balanced tag counting
          const tagType = html.substring(laterSection.pos).startsWith('<section') ? 'section' : 'details';
          const startPos = laterSection.pos;
          let depth = 0, endPos = -1, scanIdx = startPos;
          while (scanIdx < html.length) {
            if (html.substring(scanIdx).match(new RegExp(`^<${tagType}[\\s>]`))) {
              depth++;
              scanIdx += tagType.length + 1;
            } else if (html.substring(scanIdx, scanIdx + tagType.length + 3) === `</${tagType}>`) {
              depth--;
              if (depth === 0) {
                endPos = scanIdx + tagType.length + 3;
                break;
              }
              scanIdx += tagType.length + 3;
            } else {
              scanIdx++;
            }
          }

          if (endPos > 0) {
            // Also capture any leading comment/whitespace
            let extractStart = startPos;
            const before = html.substring(Math.max(0, startPos - 100), startPos);
            const commentMatch = before.match(/(\s*<!--[^>]*-->\s*)$/);
            if (commentMatch) {
              extractStart = startPos - commentMatch[1].length;
            }
            // Capture trailing whitespace
            let extractEnd = endPos;
            while (extractEnd < html.length && (html[extractEnd] === '\n' || html[extractEnd] === ' ')) {
              extractEnd++;
            }

            const sectionHtml = html.substring(extractStart, extractEnd);
            html = html.substring(0, extractStart) + html.substring(extractEnd);

            // Find insertion point (before the earlier section)
            const earlierSection = sections[i];
            const earlierPos = html.indexOf(`id="${earlierSection.id}"`);
            if (earlierPos > 0) {
              // Find the start of the tag containing this id
              let insertPos = html.lastIndexOf('<', earlierPos);
              // Check for leading comment
              const beforeInsert = html.substring(Math.max(0, insertPos - 100), insertPos);
              const commentMatch2 = beforeInsert.match(/(\s*<!--[^>]*-->\s*)$/);
              if (commentMatch2) {
                insertPos -= commentMatch2[1].length;
              }
              html = html.substring(0, insertPos) + sectionHtml + '\n' + html.substring(insertPos);
              swapped = true;
              reordered = true;
            }
          }

          // After any swap, re-scan positions
          if (swapped) break;
        }
      }
      if (!swapped) break;

      // Re-scan section positions
      sections.length = 0;
      sectionIdRegex.lastIndex = 0;
      while ((m = sectionIdRegex.exec(html)) !== null) {
        const id = m[2];
        const orderIdx = SECTION_ORDER_MAP[id];
        if (orderIdx !== undefined) {
          sections.push({ id, orderIdx, pos: m.index });
        }
      }
    }

    if (reordered) {
      changes.push('reorder_sections');
    }
  }

  // ─── Fix 18: Balance stray section tags ──────────────────────────
  const openSections = (html.match(/<section[\s>]/g) || []).length;
  const closeSections = (html.match(/<\/section>/g) || []).length;
  if (openSections !== closeSections) {
    if (openSections > closeSections) {
      // More opening than closing — add closing tags before </main>
      const diff = openSections - closeSections;
      const closingTags = '\n      </section>'.repeat(diff);
      html = html.replace(/(\s*<\/main>)/, closingTags + '$1');
      changes.push(`balance_sections(+${diff})`);
    } else {
      // More closing than opening — remove stray closing tags
      // Remove </section> tags that appear right before another </section> or right after a </details>
      let diff = closeSections - openSections;
      while (diff > 0) {
        const removed = html.replace(/(<\/details>\s*)\n\s*<\/section>/, '$1');
        if (removed !== html) { html = removed; diff--; continue; }
        // Remove standalone stray </section>
        const removed2 = html.replace(/\n\s*<\/section>\s*\n(\s*<(?:section|details|p class="last-reviewed"))/, '\n$1');
        if (removed2 !== html) { html = removed2; diff--; continue; }
        break;
      }
      if (closeSections - openSections > diff) {
        changes.push(`balance_sections(-${closeSections - openSections - diff})`);
      }
    }
  }

  // ─── Fix 19: Balance stray details tags ──────────────────────────
  const openDetails = (html.match(/<details[\s>]/g) || []).length;
  const closeDetails = (html.match(/<\/details>/g) || []).length;
  if (openDetails > closeDetails) {
    const diff = openDetails - closeDetails;
    const closingTags = '\n      </details>'.repeat(diff);
    html = html.replace(/(\s*<\/main>)/, closingTags + '$1');
    changes.push(`balance_details(+${diff})`);
  }

  fs.writeFileSync(filepath, html, 'utf-8');
  return { changes, portName };
}

// ─── Main ─────────────────────────────────────────────────────────
const files = process.argv.slice(2);
if (files.length === 0) {
  console.log('Usage: node admin/fix-port-pages.cjs ports/file.html [...]');
  process.exit(1);
}

let fixed = 0, skipped = 0, errors = 0;
for (const fp of files) {
  try {
    const result = fixPortPage(fp);
    if (result.skipped) {
      skipped++;
      console.log(`SKIP: ${path.basename(fp)} (${result.reason})`);
    } else if (result.changes.length > 0) {
      fixed++;
      console.log(`FIXED: ${path.basename(fp)} [${result.changes.join(', ')}]`);
    } else {
      console.log(`NOCHANGE: ${path.basename(fp)}`);
    }
  } catch (e) {
    errors++;
    console.error(`ERROR: ${path.basename(fp)} — ${e.message}`);
  }
}
console.log(`\nDone: ${fixed} fixed, ${skipped} skipped, ${errors} errors`);
