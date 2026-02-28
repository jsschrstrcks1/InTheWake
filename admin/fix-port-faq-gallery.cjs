#!/usr/bin/env node
/**
 * Fix ports missing FAQ and/or gallery sections.
 * Also fixes null-island weather coordinates (0,0).
 *
 * Soli Deo Gloria
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const PROJECT_ROOT = path.join(__dirname, '..');

// Known port coordinates for null-island fixes
const PORT_COORDS = {
  'porto': { lat: '41.1496', lon: '-8.6110' },
  'portland': { lat: '43.6591', lon: '-70.2568' },
  'port-miami': { lat: '25.7743', lon: '-80.1658' },
  'port-everglades': { lat: '26.0912', lon: '-80.1162' },
};

function getPortImages(slug) {
  const imgDir = path.join(PROJECT_ROOT, 'ports', 'img', slug);
  if (!fs.existsSync(imgDir)) return [];
  return fs.readdirSync(imgDir).filter(f => f.endsWith('.webp') && !f.includes('-attr'));
}

function fixPort(filepath) {
  const html = fs.readFileSync(filepath, 'utf8');
  const slug = path.basename(filepath, '.html');
  const changes = [];

  const $ = cheerio.load(html, { decodeEntities: false });

  // Extract port name from title
  let portName = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const titleText = $('title').text();
  const titleClean = titleText.replace(/\s*[\|—–].*$/, '').replace(/\s*Port Guide.*$/i, '').replace(/\s*Guide.*$/i, '').trim();
  if (titleClean && titleClean.length < 50) portName = titleClean;

  let currency = '';
  const currEl = $('dt:contains("Currency"), strong:contains("Currency")');
  if (currEl.length) currency = currEl.next('dd, span').text().trim();
  // Also check at-a-glance
  const currGlance = $(".at-a-glance-item strong:contains('Currency')");
  if (currGlance.length) currency = currGlance.parent().find('span').text().trim();

  // ═══ FIX 1: Add FAQ if missing ═══
  if (!$('#faq').length) {
    const faqHtml = `<details class="port-section" id="faq" open>
      <summary><h2>Frequently Asked Questions</h2></summary>
      <p><strong>Q: What is the best time to visit ${portName}?</strong><br>A: Spring and early autumn tend to offer the most comfortable conditions for sightseeing — mild temperatures, manageable crowds, and pleasant light for photography. Summer brings the warmest weather but also peak cruise traffic and higher prices. Winter visits can be rewarding for those who prefer quiet streets and authentic atmosphere, though some attractions may have reduced hours.</p>
      <p><strong>Q: Is ${portName} suitable for passengers with mobility challenges?</strong><br>A: Accessibility varies by area. The port vicinity and main commercial streets are generally manageable, but older historic districts may feature cobblestones, stairs, and uneven surfaces. Consider booking an accessible ship excursion if you have concerns. The ship's shore excursion desk can advise on specific accessibility options for this port.</p>
      <p><strong>Q: Do I need to exchange currency before arriving?</strong><br>A: ${currency ? `The local currency is ${currency}. ` : ''}Most tourist-facing businesses accept major credit cards. ATMs near the port offer competitive exchange rates. Carry some local cash for small purchases, markets, and tips. Avoid exchanging money on the ship — the rates are typically unfavorable compared to local bank ATMs.</p>
      <p><strong>Q: Can I explore independently or should I book a ship excursion?</strong><br>A: Both options work well. Ship excursions guarantee return to the vessel and handle logistics, making them ideal for first-time visitors. Independent exploration costs less and allows more flexibility — just keep track of time and allow a 30-minute buffer before all-aboard. Many passengers combine approaches: an organized morning tour followed by free afternoon exploration.</p>
      <p><strong>Q: What should I bring on a port day?</strong><br>A: Comfortable walking shoes are essential — you will walk more than you expect. Sunscreen, a hat, and a refillable water bottle help in warm weather. Carry your ship card (or a photo of it), a small amount of local cash, and one credit card. Leave jewelry and unnecessary valuables on the ship. A lightweight daypack beats a purse or tote for all-day comfort.</p>
    </details>`;

    // Insert before back-nav or at end of article/card
    const backNav = $('nav.back-nav, .back-link, [class*="back"]').last();
    const article = $('article.card, .card').first();
    const mainEl = $('main');

    if (backNav.length) {
      backNav.before(faqHtml);
    } else if (article.length) {
      article.append(faqHtml);
    } else if (mainEl.length) {
      mainEl.append(faqHtml);
    }
    changes.push('Added FAQ section');
  }

  // ═══ FIX 2: Add gallery if missing ═══
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

    // Insert before FAQ
    const faqNow = $('#faq');
    if (faqNow.length) {
      faqNow.before(gallery);
    } else {
      // Insert before back-nav or at end of article
      const backNav = $('nav.back-nav, .back-link').last();
      const article = $('article.card, .card').first();
      if (backNav.length) {
        backNav.before(gallery);
      } else if (article.length) {
        article.append(gallery);
      }
    }
    changes.push('Added gallery section');
  }

  // ═══ FIX 3: Fix null-island coordinates ═══
  const weatherWidget = $('#port-weather-widget');
  if (weatherWidget.length) {
    const lat = weatherWidget.attr('data-lat');
    const lon = weatherWidget.attr('data-lon');
    if (lat === '0' && lon === '0') {
      if (PORT_COORDS[slug]) {
        weatherWidget.attr('data-lat', PORT_COORDS[slug].lat);
        weatherWidget.attr('data-lon', PORT_COORDS[slug].lon);
        changes.push(`Fixed weather coords`);
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
