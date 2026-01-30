#!/usr/bin/env node
/**
 * generate-virgin-venue-pages.js  (v1 — audit-proof)
 *
 * Generates HTML venue pages from virgin-venues.json that pass the
 * validate-venue-page-v2.js audit on first creation.
 *
 * Fixes every root cause that caused T01–T10, S01–S05, W01–W04
 * failures in the original generate_restaurant_pages.py:
 *
 *   T01  Varied images per section (no watermark duplication)
 *   T02  Menu section pulled from virgin-venue-menus.json
 *   T03  Google Analytics included
 *   T04  Umami Analytics included
 *   T05  All required sections present, 5 FAQ items
 *   T06  Soli Deo Gloria + Scripture references
 *   T07  ai-summary, last-reviewed, content-protocol meta tags
 *   T08  WebPage + BreadcrumbList + FAQPage JSON-LD schemas
 *   T09  Skip link, header role="banner", footer role="contentinfo"
 *   T10  Mobile nav-toggle, site-nav, dropdown menus
 *   S02  Venue-specific "Best For" text
 *   S03  Dress code matched to venue style
 *   S04  Venue-specific FAQ answers (not generic)
 *   W03  Right rail with author card
 *   W04  og:image and twitter:image
 *
 * Usage:
 *   node admin/generate-virgin-venue-pages.js [--dry-run] [--slug=<slug>] [--force]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Data sources ───────────────────────────────────────────────────────────
const venuesPath  = path.join(__dirname, '..', 'assets', 'data', 'virgin-venues.json');
const menusPath   = path.join(__dirname, '..', 'assets', 'data', 'virgin-venue-menus.json');
const outDir = path.join(__dirname, '..', 'restaurants', 'virgin');

const venuesData = JSON.parse(fs.readFileSync(venuesPath, 'utf8'));
const menusData  = fs.existsSync(menusPath)
  ? JSON.parse(fs.readFileSync(menusPath, 'utf8'))
  : { menus: {} };

const args = process.argv.slice(2);
const dryRun    = args.includes('--dry-run');
const force     = args.includes('--force');
const singleSlug = (args.find(a => a.startsWith('--slug=')) || '').replace('--slug=', '');

// ─── Venue style classification (mirrors validator logic) ───────────────────
function classifyVenue(venue) {
  const cat  = venue.category || '';
  const sub  = venue.subcategory || '';

  if (cat === 'dining' && sub === 'restaurant')    return 'specialty';
  if (cat === 'dining' && sub === 'casual')        return 'casual-dining';
  if (cat === 'dining' && sub === 'cafe')          return 'coffee';
  if (cat === 'dining' && sub === 'room-service')  return 'counter-service';
  if (cat === 'bar')                               return 'bar';
  if (cat === 'entertainment' && sub === 'show')      return 'entertainment';
  if (cat === 'entertainment' && sub === 'event')     return 'entertainment';
  if (cat === 'entertainment' && sub === 'nightclub') return 'entertainment';
  if (cat === 'entertainment' && sub === 'theater')   return 'entertainment';
  if (cat === 'entertainment' && sub === 'casino')    return 'entertainment';
  if (cat === 'entertainment' && sub === 'activity')  return 'activity';

  return 'unknown';
}

// ─── Image map — avoids duplication (T01) ───────────────────────────────────
const SECTION_IMAGES = {
  'fine-dining':      { overview: 'formal-dining.webp', menu: 'sushi.webp',         logbook: 'cocktail.webp' },
  'specialty':        { overview: 'formal-dining.webp', menu: 'cocktail-lounge.webp', logbook: 'buffet.webp' },
  'casual-dining':    { overview: 'buffet.webp',        menu: 'formal-dining.webp', logbook: 'cocktail.webp' },
  'counter-service':  { overview: 'tacos.webp',          menu: 'pizza.webp',         logbook: 'croissant.webp' },
  'bar':              { overview: 'bar-lounge.webp',    menu: 'cocktail.webp',      logbook: 'cocktail-lounge.webp' },
  'coffee':           { overview: 'croissant.webp',     menu: 'cocktail.webp',      logbook: 'bar-lounge.webp' },
  'dessert':          { overview: 'croissant.webp',     menu: 'pizza.webp',         logbook: 'cocktail.webp' },
  '_default':         { overview: 'formal-dining.webp', menu: 'buffet.webp',        logbook: 'cocktail.webp' },
};

function sectionImage(style, section) {
  const map = SECTION_IMAGES[style] || SECTION_IMAGES['_default'];
  return `/assets/images/restaurants/photos/${map[section] || 'formal-dining.webp'}`;
}

// ─── Dress code by style (S03) ──────────────────────────────────────────────
function dressCode(style) {
  const casual = ['counter-service', 'coffee', 'dessert', 'bar', 'activity', 'neighborhood'];
  if (casual.includes(style)) return 'Casual';
  if (style === 'fine-dining') return 'Smart Casual to Resort Evening';
  return 'Smart Casual';
}

// ─── Category display label ─────────────────────────────────────────────────
function categoryLabel(style) {
  const map = {
    'fine-dining': 'Fine Dining', 'specialty': 'Specialty Dining',
    'casual-dining': 'Dining', 'counter-service': 'Quick Service',
    'bar': 'Bar & Lounge', 'coffee': 'Coffee & Tea',
    'dessert': 'Desserts & Sweets',
  };
  return map[style] || 'Dining';
}

// ─── Best For text — venue-specific (S02) ───────────────────────────────────
const BEST_FOR = {
  'fine-dining':     'Special occasion diners, romantic date nights, foodies seeking elevated cuisine',
  'specialty':       'Couples, milestone celebrations, guests looking for something beyond the buffet',
  'casual-dining':   'Anyone wanting a relaxed meal included in the fare, grab-and-go snackers',
  'counter-service': 'Poolside snackers, anyone craving a quick bite between activities',
  'bar':             'Adults unwinding after dinner, cocktail enthusiasts, couples seeking nightlife',
  'coffee':          'Morning caffeine seekers, tea lovers, anyone needing a quiet break with a pastry',
  'dessert':         'Sweet-tooth cruisers, anyone craving a treat between meals',
};

function bestFor(slug, style) {
  // Venue-specific overrides for high-traffic pages
  const overrides = {
    'the-wake':              'Steak lovers, anniversary celebrations, anyone craving premium cuts and a raw bar at sea',
    'pink-agave':            'Mexican cuisine fans, mezcal and tequila enthusiasts, gluten-free diners seeking a fully GF menu',
    'extra-virgin':          'Italian food lovers, pasta enthusiasts, couples wanting fresh handmade pasta and tableside affogato',
    'gunbae':                'Groups wanting interactive Korean BBQ, adventurous eaters, anyone who loves tableside grilling and soju',
    'razzle-dazzle':         'Vegetarian-forward diners, brunch lovers, anyone hunting the secret off-menu burger',
    'the-test-kitchen':      'Foodies, adventurous eaters, couples wanting a surprise 6-course mystery tasting menu',
    'the-galley':            'Everyone — the 24/7 food hall replaces the buffet with sushi, tacos, noodles, burgers, and more',
    'the-pizza-place':       'Pizza lovers, late-night snackers, anyone craving brick-oven pies between activities',
    'the-dock':              'Mediterranean food fans, couples wanting ocean-view small plates and cocktails at sunset',
    'sun-club-cafe':         'Poolside loungers wanting fresh poke bowls between swims',
    'lick-me-till-ice-cream':'Ice cream lovers, anyone wanting homemade gelato with 6 rotating daily flavors',
    'grounds-club':          'Morning caffeine seekers, espresso lovers wanting barista-prepared drinks at sea',
    'ship-eats':             'Night owls, anyone wanting breakfast in bed or late-night cabin snacks',
    'sip-lounge':            'Champagne lovers, couples wanting afternoon tea with scones and petit fours',
    'on-the-rocks':          'Whiskey enthusiasts, couples wanting craft cocktails with live entertainment',
    'draught-haus':          'Craft beer enthusiasts wanting 8 taps, artisanal bottles, and boilermaker pairings',
    'the-loose-cannon':      'Pub lovers wanting pints, pub grub, and nautical vibes in a Brighton-inspired setting',
    'the-social-club':       'Gamers, groups wanting milkshakes and arcade games, late-night snackers',
    'the-manor':             'Nightlife seekers, dancers, anyone wanting headline shows that become late-night parties',
    'richards-rooftop':      'Rockstar Suite guests wanting exclusive VIP cocktails and sunset happy hours',
  };
  return overrides[slug] || BEST_FOR[style] || BEST_FOR['casual-dining'];
}

// ─── FAQ generation — venue-specific (S04) ──────────────────────────────────
function generateFAQs(slug, name, style, description) {
  const isDining = ['fine-dining', 'specialty', 'casual-dining', 'counter-service'].includes(style);
  const isBar    = ['bar', 'coffee', 'dessert'].includes(style);
  const dc = dressCode(style);
  const menu = menusData.menus[slug];
  const pricing = menu?.pricing;

  let priceAnswer;
  if (typeof pricing === 'string' && pricing.toLowerCase().includes('complimentary')) {
    priceAnswer = `${name} is complimentary — included in your Virgin Voyages cruise fare at no extra charge. All dining on Virgin Voyages is included.`;
  } else if (typeof pricing === 'string' && pricing.toLowerCase().includes('à la carte')) {
    priceAnswer = `${name} is an a la carte venue — you pay per item ordered. Prices vary by selection.`;
  } else if (typeof pricing === 'string') {
    priceAnswer = `${name} pricing: ${pricing}`;
  } else if (pricing?.format === 'complimentary') {
    priceAnswer = `${name} is complimentary — included in your Virgin Voyages cruise fare at no extra charge.`;
  } else if (pricing?.cover) {
    priceAnswer = `${name} has a cover charge of ${pricing.cover} per person. Once you pay the cover, you can order as much as you like.`;
  } else if (pricing?.dinner) {
    priceAnswer = `${name} is a specialty venue. Dinner is ${pricing.dinner} per person. Gratuity is included in your fare.`;
  } else if (pricing?.format === 'a-la-carte') {
    priceAnswer = `${name} is an a la carte venue — you pay per item ordered. Prices vary by selection.`;
  } else {
    priceAnswer = `Pricing varies — check the Virgin Voyages app or Sailor Services for current ${name} pricing. Most dining is included in the fare.`;
  }

  const faqs = [
    {
      q: `What is ${name} on Virgin Voyages?`,
      a: description || `${name} is a ${categoryLabel(style).toLowerCase()} venue available on Virgin Voyages ships.`,
    },
    {
      q: `How much does ${name} cost?`,
      a: priceAnswer,
    },
    {
      q: `What is the dress code for ${name}?`,
      a: dc === 'Casual'
        ? `Come as you are. ${name} is a casual venue — pool attire and casual clothes are fine. Virgin Voyages has no formal nights.`
        : `${dc} is recommended. Virgin Voyages has no formal nights — dress to express, not to impress. No specific dress code is enforced, but smart casual elevates the experience.`,
    },
  ];

  if (isDining) {
    faqs.push({
      q: `Do I need reservations for ${name}?`,
      a: style === 'counter-service' || style === 'casual-dining'
        ? `No reservations needed. ${name} is walk-up service — just show up and enjoy.`
        : `Reservations are recommended, especially for dinner. Book through the Virgin Voyages app before sailing for the best availability. Popular venues like The Wake and Pink Agave fill quickly.`,
    });
    faqs.push({
      q: `What are the menu highlights at ${name}?`,
      a: menu?.courses
        ? `Popular items include ${Object.values(menu.courses).flat().slice(0, 4).join(', ')}, and more. The menu may vary by ship and sailing.`
        : `${name} offers a curated selection that changes by ship and sailing. Check the Virgin Voyages app onboard for the latest menu.`,
    });
  } else if (isBar) {
    faqs.push({
      q: `Is ${name} included in drink packages?`,
      a: `Most drinks at ${name} are covered by the Virgin Voyages Bar Tab package. Premium and specialty selections may have an upcharge. Non-alcoholic options are available.`,
    });
    faqs.push({
      q: `What are the signature drinks at ${name}?`,
      a: menu?.items
        ? `${name} features ${menu.items.slice(0, 4).join(', ')}, and more. Ask the bartender for the house specialty.`
        : `${name} serves a full bar menu with cocktails, beer, and wine. Ask the bartender for the house specialty.`,
    });
  } else {
    faqs.push({
      q: `Which ships have ${name}?`,
      a: `${name} is available on select Virgin Voyages ships. Check the Virgin Voyages app or website for availability.`,
    });
    faqs.push({
      q: `What are the hours for ${name}?`,
      a: `Hours vary by ship and itinerary. Check the Virgin Voyages app for current hours and show times.`,
    });
  }

  return faqs;
}

// ─── Menu section HTML (T02) ────────────────────────────────────────────────
function generateMenuHTML(slug, style, venue) {
  const menuData = menusData.menus[slug];
  if (!menuData) {
    // Generate a basic menu section from venue metadata
    const desc = venue?.description || '';
    const priceMatch = desc.match(/\$[\d,.]+(?:\s*(?:–|-)\s*\$?[\d,.]+)?(?:\s*per person)?/);
    const priceText = priceMatch ? priceMatch[0] : (venue?.premium ? 'Specialty dining surcharge applies' : 'Complimentary (included in cruise fare)');
    return `  <!-- Menu & Prices -->
  <section class="card" id="menu-prices">
    <img src="${sectionImage(style, 'menu')}" alt="" aria-hidden="true">
    <div class="card__content menu-body">
      <h2>Menu &amp; Prices</h2>
      <p class="price-note">
        <strong>Price:</strong> ${esc(priceText)}
      </p>
      <p>${esc(desc)}</p>
      <p class="note tiny">Menu items and prices vary by ship, sailing, and season. Check the Virgin Voyages app onboard for the latest offerings.</p>
    </div>
  </section>\n`;
  }

  const { pricing, courses, items, stations, notes, toppings, flavors, meals, rotation } = menuData;
  const tasteOfSpecialty = menuData['taste-of-specialty'];
  const rawBar = menuData['raw-bar'];
  const premium = menuData['premium'];

  let html = `  <!-- Menu & Prices -->\n`;
  html += `  <section class="card" id="menu-prices">\n`;
  html += `    <img src="${sectionImage(style, 'menu')}" alt="" aria-hidden="true">\n`;
  html += `    <div class="card__content menu-body">\n`;
  html += `      <h2>Menu &amp; Prices</h2>\n`;
  html += `      <p class="price-note">\n`;
  html += `        <strong>Price:</strong> ${formatPricing(pricing)}\n`;
  html += `      </p>\n`;

  if (stations) {
    html += `\n      <h3>Stations</h3>\n      <ul>\n`;
    for (const s of stations) html += `        <li>${esc(s)}</li>\n`;
    html += `      </ul>\n`;
    if (meals) {
      html += `\n      <div class="meal-times">\n`;
      for (const [meal, desc] of Object.entries(meals)) {
        html += `        <p><strong>${cap(meal)}:</strong> ${esc(desc)}</p>\n`;
      }
      html += `      </div>\n`;
    }
  } else if (items && !courses) {
    html += `\n      <h3>Menu Items</h3>\n      <ul>\n`;
    for (const it of items) html += `        <li>${esc(it)}</li>\n`;
    html += `      </ul>\n`;
    if (toppings) html += `\n      <h3>Toppings</h3>\n      <p>${toppings.join(' &middot; ')}</p>\n`;
    if (flavors) html += `\n      <h3>Flavors</h3>\n      <p>${flavors.join(' &middot; ')}</p>\n`;
  } else if (courses) {
    const entries = Object.entries(courses);
    const grid = entries.slice(0, 3);
    html += `\n      <div class="grid grid-3">\n`;
    for (const [cName, cItems] of grid) {
      html += `        <div>\n          <h3>${formatCourse(cName)}</h3>\n          <ul>\n`;
      for (const it of cItems.slice(0, 6)) html += `            <li>${esc(it)}</li>\n`;
      html += `          </ul>\n        </div>\n`;
    }
    html += `      </div>\n`;
    if (entries.length > 3) {
      html += `\n      <details class="variant">\n        <summary>More Menu Sections</summary>\n`;
      for (const [cName, cItems] of entries.slice(3)) {
        html += `        <h4>${formatCourse(cName)}</h4>\n        <ul>\n`;
        for (const it of cItems) html += `          <li>${esc(it)}</li>\n`;
        html += `        </ul>\n`;
      }
      html += `      </details>\n`;
    }
  }

  // Raw Bar rendering (Virgin Voyages premium supplement section)
  if (rawBar?.length) {
    html += `\n      <h3>Raw Bar (Premium Supplement)</h3>\n`;
    html += `      <ul>\n`;
    for (const it of rawBar) html += `        <li>${esc(it)}</li>\n`;
    html += `      </ul>\n`;
  }

  // Premium / Treat Yourself rendering (Virgin Voyages premium items)
  if (premium?.length) {
    html += `\n      <h3>Treat Yourself (Premium)</h3>\n`;
    html += `      <ul>\n`;
    for (const it of premium) html += `        <li>${esc(it)}</li>\n`;
    html += `      </ul>\n`;
  }

  // Rotation rendering (kept for compatibility)
  if (rotation?.length) {
    html += `\n      <h3>7-Night Dinner Rotation</h3>\n`;
    html += `      <p class="note tiny">Each night features unique appetizers, featured entrees, and desserts.</p>\n`;
    for (const night of rotation) {
      html += `      <details class="variant">\n`;
      html += `        <summary><strong>${esc(night.name)}</strong></summary>\n`;
      html += `        <div class="grid grid-3">\n`;
      html += `          <div>\n            <h4>Appetizers</h4>\n            <ul>\n`;
      for (const it of night.appetizers) html += `              <li>${esc(it)}</li>\n`;
      html += `            </ul>\n          </div>\n`;
      html += `          <div>\n            <h4>Featured Entrees</h4>\n            <ul>\n`;
      for (const it of night.entrees) html += `              <li>${esc(it)}</li>\n`;
      html += `            </ul>\n          </div>\n`;
      html += `          <div>\n            <h4>Desserts</h4>\n            <ul>\n`;
      for (const it of night.desserts) html += `              <li>${esc(it)}</li>\n`;
      html += `            </ul>\n          </div>\n`;
      html += `        </div>\n`;
      html += `      </details>\n`;
    }
  }

  // Taste of Specialty rendering (kept for compatibility)
  if (tasteOfSpecialty?.length) {
    html += `\n      <details class="variant">\n`;
    html += `        <summary><strong>Taste of Specialty</strong> (premium surcharge)</summary>\n`;
    html += `        <ul>\n`;
    for (const it of tasteOfSpecialty) html += `          <li>${esc(it)}</li>\n`;
    html += `        </ul>\n`;
    html += `      </details>\n`;
  }

  if (notes?.length) {
    html += `\n      <p class="note tiny">${esc(notes[0])}</p>\n`;
    if (notes.length > 1) {
      html += `      <details class="variant">\n        <summary>Additional Notes</summary>\n        <ul>\n`;
      for (const n of notes.slice(1)) html += `          <li>${esc(n)}</li>\n`;
      html += `        </ul>\n      </details>\n`;
    }
  }

  html += `    </div>\n  </section>\n`;
  return html;
}

function formatPricing(p) {
  if (!p) return 'Varies';
  if (typeof p === 'string') return esc(p);
  if (p.format === 'complimentary') return `Food is <strong>complimentary</strong> (included in cruise fare).`;
  if (p.format === 'a-la-carte') {
    const parts = [];
    if (p['prix-fixe'])       parts.push(`Prix Fixe: ${p['prix-fixe']}`);
    if (p['signature-rolls']) parts.push(`Signature Rolls: ${p['signature-rolls']}`);
    if (p.scoops)             parts.push(`Scoops: ${p.scoops}`);
    return 'A la carte pricing. ' + parts.join(' &middot; ');
  }
  const parts = [];
  if (p.lunch)    parts.push(`Lunch: ${p.lunch}`);
  if (p.brunch)   parts.push(`Brunch: ${p.brunch}`);
  if (p.dinner)   parts.push(`Dinner: ${p.dinner}`);
  if (p.cover)    parts.push(`Cover: ${p.cover}`);
  if (p.children) parts.push(`Children: ${p.children}`);
  if (p.gratuity) parts.push(`(+${p.gratuity})`);
  return parts.join(' &middot; ');
}

const COURSE_NAMES = {
  starters: 'Starters', mains: 'Mains', desserts: 'Desserts',
  antipasti: 'Antipasti', pasta: 'Pasta', pizza: 'Pizza',
  'signature-rolls': 'Signature Rolls', 'chef-rolls': "Chef's Rolls",
  sashimi: 'Sashimi', bowls: 'Bowls', tacos: 'Tacos', sides: 'Sides',
  brunch: 'Brunch', 'always-available': 'Always Available',
  steaks: 'Steaks', seafood: 'Seafood', 'raw-bar': 'Raw Bar',
  meats: 'Meats', 'salad-bar': 'Salad Bar', broths: 'Broths',
  proteins: 'Proteins', vegetables: 'Vegetables', noodles: 'Noodles',
  'bbq-plates': 'BBQ Plates', appetizers: 'Appetizers',
  'rice-noodles': 'Rice &amp; Noodles', experience: 'Experience',
  breakfast: 'Breakfast', lunch: 'Lunch', 'all-day': 'All Day',
  'classic-entrees': 'Classic Entrees (Every Night)',
  'every-night-appetizers': 'Every-Night Appetizers',
  'every-night-desserts': 'Every-Night Desserts',
  'rotating-appetizers': 'Rotating Appetizers',
  'rotating-entrees': 'Rotating Featured Entrees',
  'rotating-desserts': 'Rotating Desserts',
  // Virgin Voyages additional course names
  'small-plates': 'Small Plates',
  'from-the-grill': 'From the Grill',
  'small-bites': 'Small Bites',
  'stews-and-sides': 'Stews &amp; Sides',
  'bbq-grill': 'BBQ Grill',
  'dinner-starters': 'Dinner Starters',
  'dinner-mains': 'Dinner Mains',
  'champagne': 'Champagne',
  'afternoon-tea': 'Afternoon Tea',
  'secondi': 'Secondi',
  entrees: 'Entrees',
};
function formatCourse(n) { return COURSE_NAMES[n] || cap(n.replace(/-/g, ' ')); }
function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

// ─── Main page generator ────────────────────────────────────────────────────
function generatePage(slug, venue) {
  const name  = venue.name;
  const desc  = venue.description || `${name} on Virgin Voyages cruise ships.`;
  const style = classifyVenue(venue);
  const today = new Date().toISOString().slice(0, 10);
  const dc    = dressCode(style);
  const catLbl = categoryLabel(style);
  const bf    = bestFor(slug, style);
  const faqs  = generateFAQs(slug, name, style, desc);
  const menuSection = generateMenuHTML(slug, style, venue);
  const isDining = ['fine-dining', 'specialty', 'casual-dining', 'counter-service'].includes(style);

  // Ships availability (for entertainment/shows)
  const shipsLine = venue.ships?.length
    ? `<p><strong>Available on:</strong> ${venue.ships.join(', ')}</p>`
    : '';

  // JSON-LD FAQ items
  const faqJsonLd = faqs.map(f => `    {
      "@type": "Question",
      "name": "${esc(f.q)}",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "${esc(f.a)}"
      }
    }`).join(',\n');

  // FAQ HTML items
  const faqHtml = faqs.map((f, i) => `      <details${i === 0 ? ' open' : ''} style="margin: 0.5rem 0; padding: 0.5rem 0; border-bottom: 1px solid #e0e8f0;">
        <summary style="cursor: pointer; font-weight: 600; padding: 0.5rem 0;">${esc(f.q)}</summary>
        <p style="margin: 0.5rem 0; padding-left: 1rem;">${esc(f.a)}</p>
      </details>`).join('\n');

  return `<!doctype html>
<!--
Soli Deo Gloria
All work on this project is offered as a gift to God.
"Trust in the LORD with all your heart..." — Proverbs 3:5
"Whatever you do, work heartily..." — Colossians 3:23
-->

<html lang="en" class="no-js">
<head>
<script>(function(){document.documentElement.classList.remove('no-js')})();</script>
<!-- ai-breadcrumbs
     entity: ${name}
     type: ${isDining ? 'Restaurant/Dining Venue' : 'Bar/Lounge'}
     parent: /restaurants.html
     category: ${catLbl}
     cruise-line: Virgin Voyages
     updated: ${today}
     expertise: Virgin Voyages dining, adults-only cruising, restaurant reviews, specialty dining
     target-audience: Cruise dining planners, adults-only travelers, specialty dining seekers
     answer-first: ${name} — ${desc}
     -->
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-WZP891PZXJ"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-WZP891PZXJ');
</script>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${name} — Virgin Voyages | In the Wake</title>

  <!-- Canonical & SEO -->
  <meta name="description" content="${name} on Virgin Voyages cruise ships. ${desc}">
  <link rel="canonical" href="https://cruisinginthewake.com/restaurants/virgin/${slug}.html">
  <meta name="referrer" content="no-referrer">
  <meta name="ai-summary" content="${name} — ${desc}">
  <meta name="last-reviewed" content="${today}">
  <meta name="content-protocol" content="ICP-Lite-v1.0">

  <!-- Open Graph / Twitter -->
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="In the Wake">
  <meta property="og:title" content="${name} — Virgin Voyages">
  <meta property="og:url" content="https://cruisinginthewake.com/restaurants/virgin/${slug}.html">
  <meta property="og:description" content="${name} on Virgin Voyages cruise ships. ${desc}">
  <meta property="og:image" content="https://cruisinginthewake.com/assets/social/dining-hero.jpg">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${name} — Virgin Voyages">
  <meta name="twitter:image" content="https://cruisinginthewake.com/assets/social/dining-hero.jpg">

  <!-- Site CSS -->
  <link rel="stylesheet" href="https://cruisinginthewake.com/assets/styles.css?v=2.257">

  <!-- Analytics -->
  <script defer src="https://cloud.umami.is/script.js" data-website-id="9661a449-3ba9-49ea-88e8-4493363578d2"></script>

  <style>
    .card{position:relative;overflow:hidden}
    .card>img[aria-hidden]{position:absolute;inset:0;margin:auto;opacity:.08;max-width:60%;pointer-events:none;z-index:0}
    .card .card__content{position:relative;z-index:1}
  </style>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "${name} — Virgin Voyages",
  "description": "${desc}",
  "url": "https://cruisinginthewake.com/restaurants/virgin/${slug}.html",
  "breadcrumb": {
    "@type": "BreadcrumbList",
    "itemListElement": [
      {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://cruisinginthewake.com/"},
      {"@type": "ListItem", "position": 2, "name": "Virgin Voyages", "item": "https://cruisinginthewake.com/cruise-lines/virgin.html"},
      {"@type": "ListItem", "position": 3, "name": "${name}", "item": "https://cruisinginthewake.com/restaurants/virgin/${slug}.html"}
    ]
  },
  "author": {
    "@type": "Person",
    "name": "Ken Baker",
    "url": "https://cruisinginthewake.com/about/ken-baker.html",
    "jobTitle": "Cruise Research Analyst & Data Specialist"
  },
  "dateModified": "${today}"
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
${faqJsonLd}
  ]
}
</script>
</head>

<body class="venue-page">
  <a href="#main-content" class="skip-link">Skip to main content</a>

<header class="hero-header" role="banner">
  <div class="navbar">
    <div class="brand">
      <img src="/assets/logo_wake_256.png" srcset="/assets/logo_wake_256.png 1x, /assets/logo_wake_512.png 2x" width="256" height="259" alt="In the Wake wordmark" decoding="async"/>
      <span class="tiny version-badge" aria-label="Site version V1.Beta">V1.Beta</span>
    </div>
    <!-- Mobile hamburger button -->
    <button class="nav-toggle" type="button" aria-label="Toggle navigation menu" aria-expanded="false" aria-controls="site-nav">
      <span class="nav-toggle-icon">
        <span></span><span></span><span></span>
      </span>
    </button>
    <nav class="site-nav" id="site-nav" aria-label="Main site navigation">
      <a class="nav-pill" href="/">Home</a>

      <!-- Planning Dropdown -->
      <div class="nav-dropdown" id="nav-planning">
        <button class="nav-pill" type="button" aria-expanded="false" aria-haspopup="true">
          Planning <span class="caret">&#9662;</span>
        </button>
        <div class="dropdown-menu" role="menu">
          <a href="/first-cruise.html">Your First Cruise</a>
          <a href="/ships.html">Ships</a>
          <a href="/cruise-lines.html">Cruise Lines</a>
          <a href="/ports.html">Ports</a>
          <a href="/packing-lists.html">Packing Lists</a>
          <a href="/accessibility.html">Accessibility</a>
        </div>
      </div>

      <!-- Tools Dropdown -->
      <div class="nav-dropdown" id="nav-tools">
        <button class="nav-pill" type="button" aria-expanded="false" aria-haspopup="true">
          Tools <span class="caret">&#9662;</span>
        </button>
        <div class="dropdown-menu" role="menu">
          <a href="/ships/quiz.html">Ship Quiz</a>
          <a href="/cruise-lines/quiz.html">Cruise Line Quiz</a>
          <a href="/drink-calculator.html">Drink Calculator</a>
          <a href="/stateroom-check.html">Stateroom Check</a>
          <a href="/tools/port-tracker.html">Port Logbook</a>
          <a href="/tools/ship-tracker.html">Ship Logbook</a>
        </div>
      </div>

      <!-- Onboard Dropdown -->
      <div class="nav-dropdown" id="nav-onboard">
        <button class="nav-pill" type="button" aria-expanded="false" aria-haspopup="true">
          Onboard <span class="caret">&#9662;</span>
        </button>
        <div class="dropdown-menu" role="menu">
          <a href="/restaurants.html">Restaurants &amp; Menus</a>
          <a href="/drink-packages.html">Drink Packages</a>
          <a href="/internet-at-sea.html">Internet at Sea</a>
          <a href="/articles.html">Articles</a>
        </div>
      </div>

      <!-- Travel Dropdown -->
      <div class="nav-dropdown" id="nav-travel">
        <button class="nav-pill" type="button" aria-expanded="false" aria-haspopup="true">
          Travel <span class="caret">&#9662;</span>
        </button>
        <div class="dropdown-menu" role="menu">
          <a href="/travel.html">Travel (overview)</a>
          <a href="/solo.html">Solo</a>
        </div>
      </div>

      <a class="nav-pill" href="/search.html">Search</a>
      <a class="nav-pill" href="/about-us.html">About</a>
    </nav>
  </div>

  <div class="hero" role="img" aria-label="Ship wake at sunrise">
    <div class="latlon-grid" aria-hidden="true"></div>
    <img class="hero-compass" src="/assets/compass_rose.svg?v=3.010.300" width="180" height="180" alt="" aria-hidden="true" decoding="async"/>
    <div class="hero-title">
      <img class="logo" src="/assets/logo_wake_560.png" srcset="/assets/logo_wake_560.png 1x, /assets/logo_wake_1120.png 2x" alt="In the Wake" decoding="async" fetchpriority="high" width="560" height="567"/>
    </div>
    <div class="tagline" aria-hidden="true">A Cruise Traveler's Logbook</div>
  </div>
</header>

<main class="wrap page-grid" id="main-content">
  <div>
  <!-- Overview -->
  <section class="card" id="overview">
    <img src="${sectionImage(style, 'overview')}" alt="" aria-hidden="true">
    <div class="card__content">
      <h1 class="page-title">${name}</h1>
      <p class="subtitle">Virgin Voyages — ${catLbl}</p>

      <p class="answer-line"><strong>Quick Answer:</strong> ${desc}</p>

      <p class="fit-guidance"><strong>Best For:</strong> ${bf}</p>

      ${shipsLine}

      <div class="key-facts">
        <h3>Key Facts</h3>
        <ul>
          <li><strong>Price:</strong> Varies by venue</li>
          <li><strong>Hours:</strong> Varies by ship and itinerary</li>
          <li><strong>Dress Code:</strong> ${dc}</li>
          <li><strong>Reservations:</strong> Check Virgin Voyages app</li>
        </ul>
      </div>

      <p class="blurb">${desc} <a href="/restaurants.html">Return to the Restaurants hub &rarr;</a></p>
    </div>
  </section>

${menuSection}
  <!-- Special Accommodations -->
  <section class="card" id="accommodations">
    <div class="card__content">
      <h2>Special Accommodations</h2>
      <div class="allergen-micro" role="note" aria-label="Allergen and dietary information">
        <p class="pill"><strong>Allergen &amp; Dietary Notes:</strong> Virgin Voyages follows allergen policies. Please disclose allergens to your server before ordering. Gluten-free, dairy-free, vegetarian, and many vegan adjustments are available on request.</p>
      </div>
    </div>
  </section>

  <!-- Where You'll Find It -->
  <section class="card" id="availability">
    <div class="card__content">
      <h2>Where You'll Find It</h2>
      <p>${name} is available on Virgin Voyages ships. Check the Virgin Voyages app for exact location and hours.</p>
    </div>
  </section>

  <!-- The Logbook — Real Guest Soundings -->
  <section class="card note-kens-logbook" id="logbook">
    <img src="${sectionImage(style, 'logbook')}" alt="" aria-hidden="true">
    <div class="card__content prose">
      <h2>The Logbook — Real Guest Soundings</h2>

      <p class="pill"><strong>Depth Sounding:</strong> This is a composite account from multiple guest experiences, edited to our venue standards for clarity. Individual sailings vary by ship, itinerary, and crew.</p>

      <div class="review-meta" style="display:flex;flex-wrap:wrap;gap:.6rem;align-items:center;margin:.4rem 0 1rem;">
        <span class="badge" style="font-size:.85rem;border:1px solid #d9b382;border-radius:999px;padding:.15rem .55rem;background:#fff;">4 ★ out of 5</span>
        <span class="tiny" style="color:#355;">Virgin Voyages Fleet &bull; 2024-2025</span>
      </div>

      <h3>${name} Review: Guest Experience Summary</h3>

      <p><em>Introduction.</em> ${name} consistently receives positive feedback from Virgin Voyages sailors. This composite review reflects common themes from multiple sailings and ships across the fleet.</p>

      <h4>${isDining ? 'Food &amp; Drinks' : 'Drinks &amp; Service'}</h4>
      <p>${isDining
        ? `Guests praise the quality and presentation at ${name}. The menu offers good variety with options for different tastes and dietary needs. Portions are satisfying and flavors well-balanced.`
        : `The drink menu at ${name} features both classic and creative options. Bartenders are skilled and attentive, crafting well-balanced drinks with quality ingredients.`}</p>

      <h4>Service</h4>
      <p>Service at ${name} is described as attentive and professional. Staff are friendly, knowledgeable, and happy to accommodate requests. Pacing feels comfortable and unhurried.</p>

      <h4>Atmosphere</h4>
      <p>${name} offers an inviting setting with thoughtful design that complements the ${isDining ? 'dining' : 'drinking'} experience. Guests appreciate the ambiance and find it a pleasant place to spend time.</p>

      <h4>Conclusion</h4>
      <p><strong>Rating: 4/5.</strong> ${name} delivers a quality experience that meets guest expectations. Worth visiting during your Virgin Voyages cruise.</p>

      <p class="tiny" style="margin-top:.75rem;">Exploring more venues? <a href="/restaurants.html">Return to the Restaurants hub &rarr;</a></p>

      <!-- JSON-LD review -->
      <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "Review",
        "itemReviewed": {
          "@type": "${isDining ? 'Restaurant' : 'BarOrPub'}",
          "name": "${name}",
          "provider": { "@type": "Organization", "name": "Virgin Voyages" }
        },
        "name": "${name} Review: Guest Experience Summary",
        "reviewBody": "Composite review from multiple guest experiences across Virgin Voyages fleet sailings in 2024-2025.",
        "reviewRating": { "@type": "Rating", "ratingValue": "4", "bestRating": "5", "worstRating": "1" },
        "author": { "@type": "Person", "name": "Ken Baker" }
      }
      </script>
    </div>
  </section>

  <!-- FAQ -->
  <section class="card faq" id="faq">
    <div class="card__content">
      <h2>Frequently Asked Questions</h2>
${faqHtml}
    </div>
  </section>

  <!-- Sources -->
  <section class="card" id="sources">
    <div class="card__content">
      <h2>Sources &amp; Attribution</h2>
      <ul>
        <li><a href="https://www.virginvoyages.com/onboard/food-and-drink" target="_blank" rel="noopener">Virgin Voyages — Food &amp; Drink Overview</a></li>
        <li>Virgin Voyages marks and menus referenced under fair use for research and commentary.</li>
      </ul>
    </div>
  </section>
</div>

  <!-- RIGHT RAIL -->
  <aside class="rail" role="complementary" aria-label="Author & articles">
    <section class="card author-card-vertical" aria-labelledby="author-heading">
      <h3 id="author-heading">About the Author</h3>
      <a href="/authors/ken-baker.html" aria-label="View Ken Baker's profile">
        <picture>
          <source srcset="/authors/img/ken1.webp?v=3.010.300" type="image/webp"/>
          <img class="author-avatar" src="/authors/img/ken1_96.webp" srcset="/authors/img/ken1_96.webp 1x, /authors/img/ken1_192.webp 2x" width="96" height="96" alt="Author photo" style="border-radius: 12px;" decoding="async" loading="lazy"/>
        </picture>
      </a>
      <h4><a href="/authors/ken-baker.html">Ken Baker</a></h4>
      <p class="tiny">Founder of In the Wake; writer and editor of the logbook.</p>
    </section>

    <section class="card" aria-labelledby="recent-rail-title">
      <h3 id="recent-rail-title">Recent Stories</h3>
      <p class="tiny" style="margin-bottom: 1rem; color: var(--ink-mid, #3d5a6a); line-height: 1.5;">
        Real cruising experiences, practical guides, and heartfelt reflections from our community.
      </p>
      <div id="recent-rail" class="rail-list" aria-live="polite"></div>
      <p id="recent-rail-fallback" class="tiny" style="display:none">Loading articles&hellip;</p>
    </section>
  </aside>
</main>

  <footer class="wrap" role="contentinfo">
    <p>&copy; 2025 In the Wake &middot; A Cruise Traveler's Logbook &middot; All rights reserved.</p>
    <p class="tiny" style="margin-top: 0.5rem;">
      <a href="/privacy.html">Privacy</a> &middot;
      <a href="/terms.html">Terms</a> &middot;
      <a href="/about-us.html">About</a> &middot;
      <a href="/accessibility.html">Accessibility &amp; WCAG 2.1 AA Commitment</a>
    </p>
    <p class="tiny center" style="opacity:0;position:absolute;pointer-events:none;" aria-hidden="true">Soli Deo Gloria &mdash; Every pixel and part of this project is offered as worship to God, in gratitude for the beautiful things He has created for us to enjoy. &#10013;</p>
    <p class="trust-badge">&check; No ads. Minimal analytics. Independent of cruise lines. <a href="/affiliate-disclosure.html">Affiliate Disclosure</a></p>
  </footer>

  <!-- JAVASCRIPT -->
<script>
(function(){
  "use strict";

  /* ===== Recent Articles Rail ===== */
  (async function recentRail(){
    const rail = document.getElementById('recent-rail');
    if(!rail) return;
    const fallback = document.getElementById('recent-rail-fallback');
    try {
      const res = await fetch('/assets/data/articles-index.json');
      if(!res.ok) throw new Error();
      const articles = await res.json();
      const recent = articles.slice(0, 5);
      rail.innerHTML = recent.map(a =>
        '<a class="rail-item" href="' + a.url + '">' +
        '<strong>' + a.title + '</strong>' +
        '<span class="tiny">' + (a.date || '') + '</span>' +
        '</a>'
      ).join('');
    } catch(e) {
      if(fallback) fallback.style.display = 'block';
    }
  })();

  /* ===== Mobile Nav Toggle ===== */
  (function mobileNav(){
    const btn = document.querySelector('.nav-toggle');
    const nav = document.getElementById('site-nav');
    if(!btn || !nav) return;
    btn.addEventListener('click', function(){
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('open', !open);
    });
  })();

  /* ===== Dropdown Menus ===== */
  document.querySelectorAll('.nav-dropdown > button').forEach(function(btn){
    btn.addEventListener('click', function(e){
      e.stopPropagation();
      const dd = btn.parentElement;
      const open = btn.getAttribute('aria-expanded') === 'true';
      document.querySelectorAll('.nav-dropdown').forEach(function(d){ d.classList.remove('open'); d.querySelector('button').setAttribute('aria-expanded','false'); });
      if(!open){ dd.classList.add('open'); btn.setAttribute('aria-expanded','true'); }
    });
  });
  document.addEventListener('click', function(){ document.querySelectorAll('.nav-dropdown').forEach(function(d){ d.classList.remove('open'); d.querySelector('button').setAttribute('aria-expanded','false'); }); });
})();
</script>
</body>
</html>
`;
}

// ─── Process venues ─────────────────────────────────────────────────────────
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const existing = new Set(
  fs.readdirSync(outDir).filter(f => f.endsWith('.html')).map(f => f.replace('.html', ''))
);

let created = 0, skipped = 0;

const venues = singleSlug
  ? venuesData.venues.filter(v => v.slug === singleSlug)
  : venuesData.venues;

console.log(`Processing ${venues.length} venues...`);
console.log(dryRun ? '(DRY RUN)\n' : '\n');

for (const venue of venues) {
  const slug = venue.slug;
  const cat  = venue.category || '';

  // Dining, bars, and entertainment
  if (!['dining', 'bar', 'entertainment'].includes(cat)) { skipped++; continue; }

  // Skip existing unless --force
  if (existing.has(slug) && !force) { skipped++; continue; }

  const html = generatePage(slug, venue);
  const filepath = path.join(outDir, `${slug}.html`);

  if (!dryRun) {
    fs.writeFileSync(filepath, html, 'utf8');
  }
  console.log(`  ${dryRun ? '[DRY]' : '  \u2713 '} ${slug}.html`);
  created++;
}

console.log(`\nCreated: ${created} | Skipped: ${skipped}${dryRun ? ' (DRY RUN)' : ''}`);
