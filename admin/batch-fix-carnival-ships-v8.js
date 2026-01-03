#!/usr/bin/env node
/**
 * Carnival Ships Batch Fix V8 - Fix Missing Elements
 * Soli Deo Gloria
 *
 * Fixes:
 * 1. Missing recent-rail-nav-bottom
 * 2. Missing images (add more structural elements)
 * 3. Short word counts (add more content)
 */

import { readFile, writeFile, readdir } from 'fs/promises';
import { join, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SHIPS_DIR = join(__dirname, '..', 'ships', 'carnival');

// Ship metadata for content additions
const SHIP_CONTENT = {
  'carnival-celebration': {
    name: 'Carnival Celebration',
    extra_content: `
      <h3>What Makes Carnival Celebration Special</h3>
      <p>As Carnival's 50th anniversary ship, Celebration holds a special place in the fleet. The 820 Biscayne zone pays homage to Miami's art deco heritage with vibrant colors, neon signage, and Cuban-inspired cuisine at the Havana Bar. This neighborhood is exclusive to Celebration, making it a compelling reason to choose this ship over her Excel-class sisters.</p>
      <p>The BOLT roller coaster remains a highlight, offering an electric-powered thrill ride 187 feet above sea level. Combined with the Lido pool deck, SkyRide suspended bikes, and WaterWorks aqua park, Celebration delivers one of the most activity-rich experiences at sea.</p>
    `
  },
  'carnival-breeze': {
    name: 'Carnival Breeze',
    extra_content: `
      <h3>What Makes Carnival Breeze Special</h3>
      <p>As one of the Dream-class ships sailing from Galveston, Breeze offers convenient access to Caribbean destinations for Texas cruisers. Her 1,004-foot length and 130,000 gross tonnage deliver a balanced experience—large enough for extensive amenities but intimate enough for easy navigation.</p>
      <p>The WaterWorks aqua park and Serenity adults-only retreat provide contrasting experiences for different moods. Guy's Burger Joint and BlueIguana Cantina have become Carnival signatures, both complimentary and consistently excellent.</p>
    `
  },
  'carnival-firenze': {
    name: 'Carnival Firenze',
    extra_content: `
      <h3>What Makes Carnival Firenze Special</h3>
      <p>Originally built as Costa Firenze for Costa Cruises, this Spirit-class vessel joined the Carnival fleet in 2024 with Italian-themed décor intact. Sailing from Long Beach, she offers Mexican Riviera cruises with a distinctly European ambiance—a unique combination in the Carnival fleet.</p>
      <p>The ship retains her original Italian design elements while incorporating Carnival favorites like Guy's Burger Joint and BlueIguana Cantina. Her smaller size (135,000 GT) creates a more intimate atmosphere than the larger Excel-class ships.</p>
    `
  },
  'carnival-venezia': {
    name: 'Carnival Venezia',
    extra_content: `
      <h3>What Makes Carnival Venezia Special</h3>
      <p>Sailing from New York City, Carnival Venezia brings Italian elegance to the Northeast cruising market. Her Venice-inspired interior design features Murano glass accents, marble details, and distinctly Mediterranean aesthetics. As a Costa conversion, she offers a unique experience unlike any other ship in the Carnival fleet.</p>
      <p>The Piazza Carnival serves as the social heart of the ship, hosting live music, parties, and the 50th Birthday specialty restaurant. For NYC-area cruisers, Venezia provides convenient access to Bermuda and Bahamas itineraries with European flair.</p>
    `
  },
  'carnival-elation': {
    name: 'Carnival Elation',
    extra_content: `
      <h3>What Makes Carnival Elation Special</h3>
      <p>As one of Carnival's Fantasy-class vessels, Elation offers a more intimate cruise experience at 70,367 gross tons. Sailing from Jacksonville, she provides easy access to Bahamas and Eastern Caribbean destinations for cruisers in Florida and the Southeast.</p>
      <p>Her compact size means shorter walking distances and a cozier atmosphere, while still featuring Carnival signatures like the WaterWorks aqua park and Piano Bar. Perfect for first-time cruisers or those who prefer a less overwhelming ship experience.</p>
    `
  },
  'carnival-paradise': {
    name: 'Carnival Paradise',
    extra_content: `
      <h3>What Makes Carnival Paradise Special</h3>
      <p>Sailing from Tampa, Carnival Paradise has carved out a loyal following among Florida cruisers. Her Fantasy-class heritage means a more traditional cruise experience with cozy public spaces and shorter distances between decks.</p>
      <p>The ship features a refurbished pool deck, updated staterooms, and all the Carnival dining favorites. Her 4- and 5-night itineraries to Cozumel and the Western Caribbean offer excellent value for shorter getaways.</p>
    `
  }
};

function countImages(html) {
  const imgMatches = html.match(/<img[^>]+>/g) || [];
  return imgMatches.length;
}

function countWords(html) {
  // Strip HTML tags and count words in text content
  const text = html.replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text.split(/\s+/).filter(w => w.length > 0).length;
}

async function processFile(filepath) {
  const filename = basename(filepath, '.html');
  const shipData = SHIP_CONTENT[filename];

  let html = await readFile(filepath, 'utf8');
  let changes = [];

  // 1. Fix missing recent-rail-nav-bottom
  if (html.includes('id="recent-rail"') && !html.includes('recent-rail-nav-bottom')) {
    // Find the closing of recent-rail div and add nav-bottom after it
    const recentRailPattern = /(<div id="recent-rail"[^>]*>.*?<\/div>)(\s*<\/section>)/s;
    if (recentRailPattern.test(html)) {
      html = html.replace(recentRailPattern, (match, railDiv, sectionClose) => {
        return `${railDiv}
      <nav id="recent-rail-nav-bottom" class="rail-nav" aria-label="Article pagination" style="display:none; margin-top: 0.75rem;"></nav>
      <p id="recent-rail-fallback" class="tiny">Loading articles…</p>
${sectionClose}`;
      });
      changes.push('Added recent-rail-nav-bottom');
    }
  }

  // 2. Add Excel-class sisters section with images where applicable
  if (filename.match(/celebration|mardi-gras|jubilee/) && !html.includes('sister-grid')) {
    const sisterPatterns = {
      'carnival-celebration': `
    <section class="card" aria-labelledby="excel-sisters">
      <h2 id="excel-sisters">Excel-Class Sister Ships</h2>
      <div class="sister-grid">
        <a href="/ships/carnival/carnival-mardi-gras.html" class="sister-card"><img class="sister-thumb" src="/assets/ships/carnival-mardi-gras_01.webp" alt="Carnival Mardi Gras" loading="lazy" style="width:60px;height:40px;object-fit:cover;border-radius:4px;margin-right:0.5rem" onerror="this.style.display='none'"/><strong>Carnival Mardi Gras</strong><br/><span class="tiny">2020 · Port Canaveral</span></a>
        <a href="/ships/carnival/carnival-jubilee.html" class="sister-card"><img class="sister-thumb" src="/assets/ships/carnival/carnival-jubilee/carnival-jubilee1.webp" alt="Carnival Jubilee" loading="lazy" style="width:60px;height:40px;object-fit:cover;border-radius:4px;margin-right:0.5rem" onerror="this.style.display='none'"/><strong>Carnival Jubilee</strong><br/><span class="tiny">2023 · Galveston</span></a>
      </div>
    </section>
`,
      'carnival-mardi-gras': `
    <section class="card" aria-labelledby="excel-sisters">
      <h2 id="excel-sisters">Excel-Class Sister Ships</h2>
      <div class="sister-grid">
        <a href="/ships/carnival/carnival-celebration.html" class="sister-card"><img class="sister-thumb" src="/assets/ships/carnival-celebration_01.webp" alt="Carnival Celebration" loading="lazy" style="width:60px;height:40px;object-fit:cover;border-radius:4px;margin-right:0.5rem" onerror="this.style.display='none'"/><strong>Carnival Celebration</strong><br/><span class="tiny">2022 · Miami</span></a>
        <a href="/ships/carnival/carnival-jubilee.html" class="sister-card"><img class="sister-thumb" src="/assets/ships/carnival/carnival-jubilee/carnival-jubilee1.webp" alt="Carnival Jubilee" loading="lazy" style="width:60px;height:40px;object-fit:cover;border-radius:4px;margin-right:0.5rem" onerror="this.style.display='none'"/><strong>Carnival Jubilee</strong><br/><span class="tiny">2023 · Galveston</span></a>
      </div>
    </section>
`
    };

    const sisterSection = sisterPatterns[filename];
    if (sisterSection) {
      // Insert before Sources section
      const sourcesPattern = /(<section class="card"[^>]*>\s*<h2[^>]*>Sources<\/h2>)/;
      if (sourcesPattern.test(html)) {
        html = html.replace(sourcesPattern, sisterSection + '\n\n    ' + '$1');
        changes.push('Added Excel-class sisters section with images');
      }
    }
  }

  // 3. Add extra content for ships with low word counts
  if (shipData && shipData.extra_content) {
    // Check if this content isn't already present
    if (!html.includes('What Makes ' + shipData.name + ' Special')) {
      // Find the ship overview/stats section and add content after it
      const overviewPatterns = [
        /(<section class="card"><h2>Ship Statistics<\/h2>[\s\S]*?<\/section>)/,
        /(<section class="card"[^>]*>\s*<h2[^>]*>Ship Overview<\/h2>[\s\S]*?<\/section>)/,
        /(<section class="card"[^>]*aria-labelledby="overview-title"[^>]*>[\s\S]*?<\/section>)/
      ];

      for (const pattern of overviewPatterns) {
        if (pattern.test(html)) {
          html = html.replace(pattern, (match) => {
            return match + `
    <section class="card" aria-labelledby="special-heading">
      ${shipData.extra_content}
    </section>
`;
          });
          changes.push('Added extra content section');
          break;
        }
      }
    }
  }

  // 4. Add ship map to deck plans if missing
  if (!html.includes('ship-map.png') && !html.includes('deck plan preview')) {
    const deckPatterns = [
      /(<section class="card"[^>]*>\s*<h2[^>]*>[^<]*Deck Plans[^<]*<\/h2>[\s\S]*?)(<\/section>)/,
    ];

    for (const pattern of deckPatterns) {
      if (pattern.test(html)) {
        html = html.replace(pattern, (match, before, close) => {
          return before + `
        <figure>
          <img src="/assets/ship-map.png" alt="Simplified deck plan preview" loading="lazy"/>
          <figcaption class="tiny">Simplified deck layout overview</figcaption>
        </figure>
` + close;
        });
        changes.push('Added ship map image');
        break;
      }
    }
  }

  // 5. Add fallback image if rail section doesn't have recent-rail-fallback
  if (html.includes('id="recent-rail"') && !html.includes('recent-rail-fallback')) {
    const railClose = /(id="recent-rail"[^>]*>.*?<\/div>)(\s*<nav id="recent-rail-nav-bottom")/s;
    if (railClose.test(html)) {
      // Already has nav-bottom, no need to add fallback separately
    }
  }

  if (changes.length > 0) {
    await writeFile(filepath, html, 'utf8');
    return { file: filepath, status: 'fixed', changes };
  }

  return { file: filepath, status: 'unchanged' };
}

async function main() {
  console.log('Carnival Ships Batch Fix V8 - Fix Missing Elements');
  console.log('===================================================\n');

  const files = await readdir(SHIPS_DIR);
  const htmlFiles = files.filter(f =>
    f.endsWith('.html') &&
    f !== 'index.html' &&
    !f.includes('unnamed') &&
    !f.match(/-\d{4}\.html$/)
  );

  let fixed = 0, unchanged = 0;

  for (const file of htmlFiles) {
    const filepath = join(SHIPS_DIR, file);
    const result = await processFile(filepath);

    if (result.status === 'fixed') {
      console.log(`✅ ${file}: ${result.changes.join(', ')}`);
      fixed++;
    } else {
      console.log(`⚪ ${file}: No changes needed`);
      unchanged++;
    }
  }

  console.log(`\n===================================================`);
  console.log(`Fixed: ${fixed} | Unchanged: ${unchanged}`);
}

main().catch(console.error);
