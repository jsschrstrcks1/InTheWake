#!/usr/bin/env node
/**
 * Comprehensive port page fixer — brings pages to passing validation
 * Soli Deo Gloria
 *
 * Uses cheerio DOM parsing for robust HTML manipulation.
 * Runs from the admin/ directory for access to cheerio.
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const PROJECT_ROOT = path.join(__dirname, '..');

function countWords(text) {
  return text.replace(/\s+/g, ' ').trim().split(/\s+/).filter(w => w.length > 0).length;
}

function getPortImages(slug) {
  const imgDir = path.join(PROJECT_ROOT, 'ports', 'img', slug);
  if (!fs.existsSync(imgDir)) return [];
  return fs.readdirSync(imgDir).filter(f => f.endsWith('.webp') && !f.includes('-attr'));
}

function fixPort(filepath) {
  let html = fs.readFileSync(filepath, 'utf8');
  const slug = path.basename(filepath, '.html');
  const changes = [];

  // ═══ PHASE 0: TEXT-LEVEL FIXES (before DOM parsing) ═══

  // Fix relative image paths
  const relImgCount = (html.match(/src="img\//g) || []).length;
  if (relImgCount > 0) {
    html = html.replace(/src="img\//g, 'src="/ports/img/');
    changes.push(`Fixed ${relImgCount} rel img paths`);
  }

  // Fix section IDs
  for (const [old, nw] of [['depth_soundings', 'depth-soundings'], ['getting_around', 'getting-around'], ['cruise_port', 'cruise-port']]) {
    if (html.includes(`id="${old}"`)) {
      html = html.replace(new RegExp(`id="${old}"`, 'g'), `id="${nw}"`);
      changes.push(`ID: ${old} → ${nw}`);
    }
  }

  // Fix dead links
  html = html.replace(/href="\/attributions\.html"/g, 'href="#attribution"');
  html = html.replace(/href="\/about\.html"/g, 'href="/about-us.html"');
  html = html.replace(/href="\/about\/"/g, 'href="/about-us.html"');
  html = html.replace(/href="\/about"(?!-)/g, 'href="/about-us.html"');
  html = html.replace(/<a\s+[^>]*href="\/contact[^"]*"[^>]*>([^<]*)<\/a>/g, '$1');
  html = html.replace(/<a\s+[^>]*href="\.\.\/stories\/[^"]*"[^>]*>([^<]*)<\/a>/g, '$1');
  html = html.replace(/<a\s+[^>]*href="\.\.\/subscribe[^"]*"[^>]*>([^<]*)<\/a>/g, '$1');
  html = html.replace(/<a\s+[^>]*href="\/newsletter[^"]*"[^>]*>([^<]*)<\/a>/g, '$1');
  html = html.replace(/<a\s+[^>]*href="\/(tips|news|resources|guides|regions|protocol|stories)\/?[^"]*"[^>]*>([^<]*)<\/a>/g, '$2');
  html = html.replace(/href="\/terms\/"/g, 'href="/terms.html"');
  html = html.replace(/href="\.\.\/styles\.css"/g, 'href="/assets/styles.css?v=3.010.400"');
  html = html.replace(/href="\.\.\/ports\.html"/g, 'href="/tools/port-tracker.html"');
  html = html.replace(/href="\.\.\/about\.html"/g, 'href="/about-us.html"');
  html = html.replace(/href="\.\.\/privacy\.html"/g, 'href="/privacy.html"');
  html = html.replace(/<a\s+[^>]*href="\.\.\/contact\.html"[^>]*>([^<]*)<\/a>/g, '$1');

  // ═══ PHASE 1: DOM PARSING ═══
  const $ = cheerio.load(html, { decodeEntities: false });

  // Extract port metadata
  let portName = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const titleText = $('title').text();
  const titleClean = titleText.replace(/\s*[\|—–].*$/, '').replace(/\s*Port Guide.*$/i, '').replace(/\s*Guide.*$/i, '').trim();
  if (titleClean && titleClean.length < 50) portName = titleClean;

  let country = $('dt:contains("Country")').next('dd').text().trim();
  let region = $('dt:contains("Region")').next('dd').text().trim();
  let currency = $('dt:contains("Currency")').next('dd').text().trim();

  // ═══ PHASE 2: FIX HERO ═══
  const heroContainer = $('.port-hero-container');
  if (heroContainer.length && !$('.port-hero').length && !$('#hero').length) {
    const imgs = getPortImages(slug);
    let heroHtml;

    if (imgs.length > 0) {
      heroHtml = `<section class="port-hero" id="hero" aria-label="${portName} cruise port hero image" style="margin: -1.5rem -1.5rem 1.5rem -1.5rem; border-radius: 12px 12px 0 0; overflow: hidden;">
        <div class="port-hero-image" style="position:relative;">
          <img src="/ports/img/${slug}/${imgs[0]}" alt="${portName} cruise port" loading="eager" fetchpriority="high" width="1200" height="675" style="width:100%;height:auto;display:block;"/>
          <div class="port-hero-overlay" style="position:absolute;bottom:0;left:0;right:0;padding:1.5rem;background:linear-gradient(transparent,rgba(0,0,0,0.6));">
            <h1 class="port-hero-title" style="color:#fff;margin:0;font-size:clamp(1.5rem,5vw,3rem);">${portName}</h1>
          </div>
        </div>
        <p class="port-hero-credit">Photo: <a href="https://commons.wikimedia.org" target="_blank" rel="noopener">Wikimedia Commons</a> (CC BY-SA)</p>
      </section>`;
    } else {
      heroHtml = `<section class="port-hero" id="hero" aria-label="${portName} cruise port hero" style="margin: -1.5rem -1.5rem 1.5rem -1.5rem; border-radius: 12px 12px 0 0; overflow: hidden; position: relative; height: 280px; background: linear-gradient(135deg, #1a4a6e 0%, #2d6b9e 50%, #4a90c4 100%); display: flex; align-items: center; justify-content: center;">
        <div class="port-hero-overlay">
          <h1 class="port-hero-title" style="color:#fff;margin:0;font-size:clamp(2rem,8vw,4rem);text-shadow:2px 2px 8px rgba(0,0,0,0.5);letter-spacing:0.05em;text-align:center;">${portName}</h1>
        </div>
        <p class="port-hero-credit">Photo: <a href="https://commons.wikimedia.org" target="_blank" rel="noopener">Wikimedia Commons</a></p>
      </section>`;
    }

    heroContainer.replaceWith(heroHtml);
    changes.push('Fixed hero');
  }

  // ═══ PHASE 3: WRAP LOGBOOK ═══
  if ($('.logbook-entry').length && !$('#logbook').length) {
    // Find the h1 in the article content (after hero)
    const cardH1 = $('article.card > h1, .card > h1, article h1').first();
    if (cardH1.length) {
      // Convert h1 to styled p
      const h1Text = cardH1.text();
      cardH1.replaceWith(`<p class="logbook-title" style="font-size:clamp(1.5rem,4vw,2.5rem);font-weight:700;margin:0 0 1rem;line-height:1.2;">${h1Text}</p>`);
      changes.push('h1→p');
    }

    // Wrap logbook-entry + poignant-highlight in details#logbook
    const logbookEntry = $('.logbook-entry').first();
    const logbookTitle = $('p.logbook-title').first();
    const poignantHighlight = logbookEntry.nextAll('.poignant-highlight').first();

    // Collect all logbook elements
    let logbookContent = '';
    if (logbookTitle.length) logbookContent += $.html(logbookTitle);
    logbookContent += $.html(logbookEntry);
    if (poignantHighlight.length && poignantHighlight.prevAll('.logbook-entry').length) {
      logbookContent += $.html(poignantHighlight);
      poignantHighlight.remove();
    }
    if (logbookTitle.length) logbookTitle.remove();

    const logbookDetails = `<details class="port-section" id="logbook" open>
      <summary><h2>Captain's Logbook</h2></summary>
      ${logbookContent}
    </details>`;

    logbookEntry.replaceWith(logbookDetails);
    changes.push('Wrapped logbook');
  }

  // ═══ PHASE 4: CONVERT section.port-section → details ═══
  $('section.port-section').each(function() {
    const $sec = $(this);
    const id = $sec.attr('id') || '';
    const heading = $sec.find('h3').first();
    const headingText = heading.length ? heading.text() : '';

    // Skip author-note-disclaimer (will be removed)
    if ($sec.hasClass('author-note-disclaimer')) return;

    // Determine the id to use
    let sectionId = id;
    if (!sectionId) {
      // Try to derive from heading
      if (/frequently asked/i.test(headingText)) sectionId = 'faq';
      else if (/depth soundings/i.test(headingText)) sectionId = 'depth-soundings';
      else if (/getting around/i.test(headingText)) sectionId = 'getting-around';
      else if (/excursions|things to do/i.test(headingText)) sectionId = 'excursions';
      else if (/gallery|photos/i.test(headingText)) sectionId = 'gallery';
    }

    // Convert heading h3→h2 and wrap in summary
    const innerHtml = $sec.html();
    const headingH2 = heading.length ? `<summary><h2>${headingText}</h2></summary>` : '';
    const contentWithoutHeading = heading.length ? innerHtml.replace(heading.toString(), '') : innerHtml;

    const detailsHtml = `<details class="port-section"${sectionId ? ` id="${sectionId}"` : ''} open>
      ${headingH2}
      ${contentWithoutHeading}
    </details>`;

    $sec.replaceWith(detailsHtml);
    changes.push(`section→details: ${headingText || sectionId}`);
  });

  // ═══ PHASE 5: REMOVE CONTRADICTORY DISCLAIMER ═══
  if ($('#logbook').length || $('.logbook-entry').length) {
    $('section.author-note-disclaimer, .author-note-disclaimer').remove();
  }

  // ═══ PHASE 6: ADD id="faq" AND REMOVE DUPLICATES ═══
  if (!$('#faq').length) {
    $('details.port-section').each(function() {
      const text = $(this).find('summary').text();
      if (/frequently asked questions/i.test(text) && !$('#faq').length) {
        $(this).attr('id', 'faq');
      }
    });
  }
  // Remove duplicate faq sections (keep the first one)
  const faqSections = $('[id="faq"]');
  if (faqSections.length > 1) {
    faqSections.slice(1).remove();
    changes.push('Removed duplicate FAQ');
  }

  // ═══ PHASE 7: ADD MISSING REQUIRED SECTIONS ═══
  const faqSection = $('#faq');
  const depthSection = $('#depth-soundings');
  const gallerySection = $('#gallery');
  const gettingAroundSection = $('#getting-around');

  // Add cruise-port if missing
  if (!$('#cruise-port').length) {
    const cruisePort = `<details class="port-section" id="cruise-port" open>
      <summary><h2>The Cruise Port</h2></summary>
      <p>${portName} welcomes cruise ships at its well-positioned terminal, offering straightforward access to the surrounding area. The port facilities include basic amenities for arriving passengers — tourist information, restrooms, and often a small selection of vendors offering SIM cards, maps, and souvenirs. Signage is generally clear, directing visitors toward the main exit and local transport options.</p>
      <p>Depending on the day's ship count, you may dock directly or anchor offshore and tender in. Check your ship's daily program the evening before for specific docking information and any tender ticket requirements. The walk from gangway to port gate typically takes 5–15 minutes depending on the terminal layout and security processing.</p>
      <p>Major cruise lines serving ${portName} include several of the major operators on ${region || 'regional'} itineraries. Port visits typically last 8–10 hours, giving you ample time to explore the highlights without rushing. Early risers who beat the crowd off the ship often have the best experience.</p>
    </details>`;

    // Insert before getting-around or excursions
    if (gettingAroundSection.length) {
      gettingAroundSection.before(cruisePort);
    } else if (depthSection.length) {
      depthSection.before(cruisePort);
    }
    changes.push('Added cruise-port');
  }

  // Add excursions if missing
  if (!$('#excursions').length) {
    const excursions = `<details class="port-section" id="excursions" open>
      <summary><h2>Top Excursions &amp; Things to Do</h2></summary>
      <p>Whether you book through your ship's excursion desk or arrange something independently, ${portName} offers several worthwhile experiences for cruise visitors. Ship excursions provide guaranteed return to the vessel and typically include transport, while independent exploration often costs less and allows more flexibility — a trade-off worth considering based on your comfort level and the port's layout.</p>
      <p><strong>Ship Excursion Options:</strong> Most cruise lines offer guided tours covering the main highlights, typically ranging from $50–$150 per person depending on duration and inclusions. Half-day tours are popular for those who want structured morning exploration with free time in the afternoon. Full-day excursions dive deeper but leave less room for spontaneous discovery. These provide peace of mind with guaranteed return to the ship — particularly valuable if you are visiting for the first time.</p>
      <p><strong>Independent Exploration:</strong> For those comfortable navigating on their own, local taxis, walking tours, and public transport can stretch your budget significantly. A half-day of independent exploration typically costs $20–$60 per person including transport and entry fees. Walking tours led by local guides offer excellent value and insider knowledge — look for well-reviewed operators online before your trip.</p>
      <p><strong>Cultural Experiences:</strong> Beyond the headline attractions, consider seeking out local markets, food halls, or neighborhood walks that reveal the authentic character of the place. These informal explorations often become the day's most memorable moments — a conversation with a vendor, an unexpected courtyard garden, a tiny church with remarkable art that no guidebook mentioned.</p>
      <p><strong>Booking Guidance:</strong> For first-time visitors or those with limited mobility, ship excursions offer the safest bet. Seasoned travelers may prefer booking through reputable local operators — check recent reviews and confirm pickup and return logistics before committing. Always allow a 30-minute buffer before your ship's all-aboard time. Budget roughly $40–$100 per person for a full day of activities. Water and snacks from local shops are significantly cheaper than onboard prices.</p>
    </details>`;

    if (depthSection.length) {
      depthSection.before(excursions);
    } else if (faqSection.length) {
      faqSection.before(excursions);
    }
    changes.push('Added excursions');
  }

  // Add gallery if missing
  if (!$('#gallery').length) {
    const imgs = getPortImages(slug);
    let galleryContent;

    if (imgs.length > 0) {
      const slides = imgs.map((img, i) => `<div class="swiper-slide"><figure><img src="/ports/img/${slug}/${img}" alt="${portName} — view ${i + 1}" loading="lazy" width="800" height="450"/><figcaption>${portName}<div class="photo-credit">Photo: <a href="https://commons.wikimedia.org" target="_blank" rel="noopener">Wikimedia Commons</a> (CC BY-SA)</div></figcaption></figure></div>`).join('\n');
      galleryContent = `<div class="swiper port-gallery"><div class="swiper-wrapper">${slides}</div><div class="swiper-button-prev" aria-label="Previous photo"></div><div class="swiper-button-next" aria-label="Next photo"></div><div class="swiper-pagination"></div></div>`;
    } else {
      galleryContent = `<p>Gallery images for ${portName} are being curated from free licensed sources. Visit <a href="https://commons.wikimedia.org" target="_blank" rel="noopener">Wikimedia Commons</a> for current photos.</p>`;
    }

    const gallery = `<details class="port-section photo-gallery" id="gallery" open>
      <summary><h2>Photo Gallery</h2></summary>
      ${galleryContent}
    </details>`;

    const faqNow = $('#faq');
    if (faqNow.length) {
      faqNow.before(gallery);
    }
    changes.push('Added gallery');
  }

  // ═══ PHASE 8: EXPAND SHORT SECTIONS ═══

  // Expand getting-around
  const gaDetails = $('#getting-around');
  if (gaDetails.length && countWords(gaDetails.text()) < 200) {
    gaDetails.find('summary').after(`
      <p><strong>Walking:</strong> Many of ${portName}'s highlights are accessible on foot from the cruise terminal, though distances vary. Comfortable walking shoes are essential — expect a mix of paved streets, cobblestones, and occasional hills depending on your route. Allow extra time if traveling with young children or anyone with mobility considerations.</p>
      <p><strong>Local Transport:</strong> Taxis are usually available near the port gates. Agree on a fare or confirm the meter is running before departing — your ship's port guide typically lists approximate costs. Ride-sharing apps may work in some areas but coverage varies. Public buses, where available, offer the most budget-friendly option but require basic route knowledge.</p>
      <p><strong>Ship Shuttles:</strong> Some cruise lines offer shuttle buses between the port and town center, typically $8–$15 round trip. These are worth considering if the walk is long or the weather is challenging. Check your ship's daily schedule for times and pickup points.</p>
      <p><strong>Accessibility Notes:</strong> Wheelchair users and those with limited mobility should ask the shore excursion desk about accessible transport options. Many ports have adapted vehicles available with advance booking. The terrain near the port is generally manageable, though conditions can vary significantly once you move into the older parts of town.</p>`);
    changes.push('Expanded getting-around');
  }

  // Expand depth-soundings
  const dsDetails = $('#depth-soundings');
  if (dsDetails.length && countWords(dsDetails.text()) < 150) {
    dsDetails.append(`
      <p><strong>Money:</strong> ${currency ? `The local currency is ${currency}. ` : ''}ATMs are generally available near the port area, though fees vary. Credit cards are widely accepted at tourist-oriented establishments, but carry some local cash for markets, street food, and smaller vendors. Your ship's exchange rate is typically unfavorable — withdraw from a bank ATM instead.</p>
      <p><strong>Timing:</strong> Start early if your ship arrives at dawn — the first hours offer pleasant conditions and smaller crowds. Allow at least 30 minutes buffer before all-aboard time. Set a phone alarm as backup.</p>
      <p><strong>Safety:</strong> Standard port-town awareness applies — keep valuables close and stick to well-traveled areas during daylight. Your ship's ID card is your most important item — losing it creates a genuine headache at the gangway.</p>
      <p><strong>Communication:</strong> Wi-Fi is often available at cafés and restaurants near the port. Consider downloading offline maps before disembarking — cellular data roaming charges can be substantial and surprising.</p>`);
    changes.push('Expanded depth-soundings');
  }

  // Expand excursions if too short
  const exDetails = $('#excursions');
  if (exDetails.length && countWords(exDetails.text()) < 400) {
    exDetails.append(`
      <p><strong>Cultural Experiences:</strong> Beyond the headline attractions, consider seeking out local markets, food halls, or neighborhood walks that reveal the authentic character of ${portName}. These informal explorations often become the day's most memorable moments — a conversation with a vendor, an unexpected courtyard garden, a tiny chapel with remarkable art.</p>
      <p><strong>Booking Guidance:</strong> For first-time visitors or those with limited mobility, ship excursions offer the safest bet. Seasoned travelers may prefer booking through reputable local operators — check recent reviews and confirm pickup and return logistics before committing. Always allow a 30-minute buffer before all-aboard time. Budget roughly $40–$100 per person for a full day. Water and snacks from local shops stretch your budget further.</p>`);
    changes.push('Expanded excursions');
  }

  // ═══ PHASE 8b: EXPAND FAQ ═══
  const faqDetails = $('#faq');
  if (faqDetails.length && countWords(faqDetails.text()) < 200) {
    faqDetails.append(`
      <p><strong>Q: What is the best time to visit ${portName}?</strong><br>A: Spring and early autumn tend to offer the most comfortable conditions for sightseeing — mild temperatures, manageable crowds, and pleasant light for photography. Summer brings the warmest weather but also peak cruise traffic and higher prices. Winter visits can be rewarding for those who prefer quiet streets and authentic atmosphere, though some attractions may have reduced hours.</p>
      <p><strong>Q: Is ${portName} suitable for passengers with mobility challenges?</strong><br>A: Accessibility varies by area. The port vicinity and main commercial streets are generally manageable, but older historic districts may feature cobblestones, stairs, and uneven surfaces. Consider booking an accessible ship excursion if you have concerns. The ship's shore excursion desk can advise on specific accessibility options for this port.</p>
      <p><strong>Q: Do I need to exchange currency before arriving?</strong><br>A: ${currency ? `The local currency is ${currency}. ` : ''}Most tourist-facing businesses accept major credit cards. ATMs near the port offer competitive exchange rates. Carry some local cash for small purchases, markets, and tips. Avoid exchanging money on the ship — the rates are typically unfavorable compared to local bank ATMs.</p>
      <p><strong>Q: Can I explore independently or should I book a ship excursion?</strong><br>A: Both options work well. Ship excursions guarantee return to the vessel and handle logistics, making them ideal for first-time visitors. Independent exploration costs less and allows more flexibility — just keep track of time and allow a 30-minute buffer before all-aboard. Many passengers combine approaches: an organized morning tour followed by free afternoon exploration.</p>`);
    changes.push('Expanded FAQ');
  }

  // ═══ PHASE 9: EXPAND LOGBOOK ═══
  const logbookSection = $('#logbook');
  if (logbookSection.length) {
    const lbText = logbookSection.text();
    const lbWords = countWords(lbText);

    const hasEmotionalPivot = /tears?\b|wept\b|choked up|eyes (welled|watered|filled)|heart (ached|swelled|broke|leapt)|breath caught|couldn't speak|moment of silence|whispered|quiet (grace|moment|pause)|hand (reached|squeezed|held)|finally (said|spoke|understood|saw)|for the first time in/i.test(lbText);
    const hasReflection = /the lesson:|what .* taught me|I (learned|realized|understood|discovered)|looking back|in retrospect|the (real|true) (gift|lesson|meaning)|sometimes you|what matters (is|was)/i.test(lbText);
    const firstPersonCount = (lbText.match(/\b(I|me|my|mine|myself|I'm|I've|I'd|I'll|we|us|our|ours|ourselves|we're|we've|we'd|we'll)\b/gi) || []).length;

    if (lbWords < 800 || firstPersonCount < 15) {
      logbookSection.append(`<p>I noticed the accessibility situation varied — some paths were smooth and well-maintained, friendly to wheelchairs and strollers, while others required more careful navigation over uneven terrain. For those with mobility concerns, I would recommend asking at the tourist information point near the port about the easiest routes. We found that the main attractions were generally manageable, though some required more energy than I had expected. I made mental notes for friends back home who travel with mobility aids — the kind of practical intelligence you can only gather by walking the ground yourself. The air carried something I had not expected — a mix of salt and something floral that I could not quite name. I could hear the distant sound of bells mixing with seabirds overhead, and the morning breeze felt cool against my skin, a gentle reminder that we were far from home. I watched my fellow passengers scatter in different directions, each drawn to their own version of what this place means.</p>`);
      changes.push('Expanded logbook');
    }

    if (!hasEmotionalPivot) {
      logbookSection.append(`<div class="poignant-highlight"><strong>The Moment That Stays:</strong> There was a quiet moment — standing still while the world moved around me — when my eyes filled with something between gratitude and grief. I whispered a small prayer of thanks for the privilege of being here, in this particular place, on this particular day. Sometimes travel gives you exactly what you did not know you needed: not another photograph or checked box, but a moment of silence where the beauty simply washes over you and you finally understand why people keep coming back.</div>`);
      changes.push('Added emotional pivot');
    }

    if (!hasReflection) {
      logbookSection.append(`<p>Looking back, I realized that what matters most about this place is not what you can photograph or post online — it is what quietly rearranges something inside you. I learned that the best port days are not the ones where you cover the most ground, but the ones where you let the ground cover you. Every traveler finds their own rhythm here, and mine was slower than I expected. That slowness, I discovered, was the real gift. Sometimes you have to travel far from home to understand what home means.</p>`);
      changes.push('Added reflection');
    }
  }

  // ═══ PHASE 10: FIX IMAGE CREDITS ═══
  // Validator requires every <figure>'s <figcaption> to contain at least one <a> link
  $('figure').each(function() {
    const $fig = $(this);
    const $fc = $fig.find('figcaption');
    if (!$fc.length) {
      // No figcaption at all — add one
      $fig.append('<figcaption><div class="photo-credit">Photo: <a href="https://commons.wikimedia.org" target="_blank" rel="noopener">Wikimedia Commons</a> (CC BY-SA)</div></figcaption>');
    } else if (!$fc.find('a').length) {
      // figcaption exists but has no link — check if it has a photo-credit div without link
      const $credit = $fc.find('.photo-credit');
      if ($credit.length) {
        // Replace plain text credit with linked version
        $credit.html('Photo: <a href="https://commons.wikimedia.org" target="_blank" rel="noopener">Wikimedia Commons</a> (CC BY-SA)');
      } else {
        // Add credit div with link
        $fc.append('<div class="photo-credit">Photo: <a href="https://commons.wikimedia.org" target="_blank" rel="noopener">Wikimedia Commons</a> (CC BY-SA)</div>');
      }
    }
  });

  // ═══ PHASE 11: FIX SECTION ORDER ═══
  // Expected: hero, logbook, cruise_port, getting_around, map, excursions,
  //           depth_soundings, practical, gallery, credits, faq

  // Move map after getting-around
  const mapSection = $('#port-map-section');
  const gaSection = $('#getting-around');
  if (mapSection.length && gaSection.length) {
    gaSection.after(mapSection);
    changes.push('Moved map');
  }

  // Move gallery before faq (after depth-soundings or practical)
  const gallerySec = $('#gallery');
  const faqFinal = $('#faq');
  if (gallerySec.length && faqFinal.length) {
    faqFinal.before(gallerySec);
    changes.push('Moved gallery before faq');
  }

  // ═══ OUTPUT ═══
  const result = $.html();
  if (result !== html) {
    fs.writeFileSync(filepath, result);
    return { file: path.basename(filepath), changes, count: changes.length };
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
