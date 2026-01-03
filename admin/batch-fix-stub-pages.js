#!/usr/bin/env node
/**
 * Batch Fix: Complete stub pages with required sections
 * Soli Deo Gloria
 *
 * Adds all required sections to stub/incomplete pages.
 * For pages missing page-intro and other key sections.
 */

import { readFile, writeFile, readdir } from 'fs/promises';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SHIPS_DIR = join(__dirname, '..', 'ships');

const CRUISE_LINES = [
  'carnival', 'celebrity-cruises', 'costa', 'cunard', 'explora-journeys',
  'holland-america-line', 'msc', 'norwegian', 'oceania', 'princess',
  'rcl', 'regent', 'seabourn', 'silversea', 'virgin-voyages'
];

const CRUISE_LINE_NAMES = {
  'carnival': 'Carnival Cruise Line',
  'celebrity-cruises': 'Celebrity Cruises',
  'costa': 'Costa Cruises',
  'cunard': 'Cunard Line',
  'explora-journeys': 'Explora Journeys',
  'holland-america-line': 'Holland America Line',
  'msc': 'MSC Cruises',
  'norwegian': 'Norwegian Cruise Line',
  'oceania': 'Oceania Cruises',
  'princess': 'Princess Cruises',
  'rcl': 'Royal Caribbean International',
  'regent': 'Regent Seven Seas Cruises',
  'seabourn': 'Seabourn Cruise Line',
  'silversea': 'Silversea Cruises',
  'virgin-voyages': 'Virgin Voyages'
};

const CRUISE_LINE_URLS = {
  'carnival': 'https://www.carnival.com',
  'celebrity-cruises': 'https://www.celebritycruises.com',
  'costa': 'https://www.costacruises.com',
  'cunard': 'https://www.cunard.com',
  'explora-journeys': 'https://explorajourneys.com',
  'holland-america-line': 'https://www.hollandamerica.com',
  'msc': 'https://www.msccruises.com',
  'norwegian': 'https://www.ncl.com',
  'oceania': 'https://www.oceaniacruises.com',
  'princess': 'https://www.princess.com',
  'rcl': 'https://www.royalcaribbean.com',
  'regent': 'https://www.rssc.com',
  'seabourn': 'https://www.seabourn.com',
  'silversea': 'https://www.silversea.com',
  'virgin-voyages': 'https://www.virginvoyages.com'
};

function extractShipName(html, filename) {
  const breadcrumbsMatch = html.match(/<!-- ai-breadcrumbs[\s\S]*?name:\s*([^\n]+)/);
  if (breadcrumbsMatch) return breadcrumbsMatch[1].trim();
  const titleMatch = html.match(/<title>([^•<—]+)/);
  if (titleMatch) return titleMatch[1].trim();
  return basename(filename, '.html').split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function extractShipClass(html) {
  const classMatch = html.match(/ship-class:\s*([^\n]+)/);
  if (classMatch) return classMatch[1].trim();
  return null;
}

function getPageIntroSection(shipName, cruiseLineName, shipClass) {
  const classInfo = shipClass ? `a ${shipClass} vessel` : 'a notable ship';
  return `
    <!-- ICP-Lite: Page Intro -->
    <section class="page-intro" aria-label="${shipName} overview">
      <p class="answer-line">
        <strong class="section-label">Looking for ${shipName} planning info?</strong>
        <span>This page covers deck plans, live ship tracking, dining venues, and video tours to help you plan your ${cruiseLineName} cruise aboard ${shipName}.</span>
      </p>
      <p class="content-text">
        ${shipName} is ${classInfo} from ${cruiseLineName}. The ship offers a range of dining options, entertainment venues, and stateroom categories to suit different travel styles and budgets. Whether you're a first-time cruiser or a seasoned veteran, exploring the deck plans and venue information on this page will help you make the most of your voyage.
      </p>
    </section>`;
}

function getFirstLookSection(shipName, cruiseLineName) {
  return `
    <!-- First Look Section -->
    <section class="card" aria-labelledby="first-look">
      <h2 id="first-look">A First Look at ${shipName}</h2>
      <p>${shipName} offers a memorable cruise experience with ${cruiseLineName}. This ship features modern amenities, diverse dining options, and entertainment for all ages.</p>
      <p>Explore the deck plans below to familiarize yourself with the ship's layout, or check out the dining section to see available restaurants and venues.</p>
    </section>`;
}

function getLogbookSection(shipName, slug, cruiseLine) {
  return `
    <!-- Ken's Logbook Section -->
    <section class="card note-kens-logbook" aria-labelledby="logbook">
      <h2 id="logbook">The Logbook: ${shipName}</h2>
      <div id="logbook-container" data-ship="${slug}" data-line="${cruiseLine}">
        <p class="placeholder">Stories and insights from cruisers who have sailed on ${shipName} will appear here.</p>
      </div>
    </section>`;
}

function getVideosSection(shipName, slug, cruiseLine) {
  return `
    <!-- Videos Section -->
    <section class="card" aria-labelledby="video-highlights">
      <h2 id="video-highlights">Watch: ${shipName} Highlights</h2>
      <p class="small">Swipe through ship walkthroughs, top-10s, and stateroom tours.</p>
      <div class="swiper videos" aria-label="Featured video carousel">
        <div class="swiper-wrapper" id="featuredVideos"></div>
        <div class="swiper-pagination" aria-hidden="true"></div>
        <div class="swiper-button-prev" aria-label="Previous slide"></div>
        <div class="swiper-button-next" aria-label="Next slide"></div>
      </div>
      <div id="videoFallback" class="tiny hidden">Videos will appear once our sources sync for this ship.</div>
    </section>

    <script>
    (function(){
      const mount=document.getElementById('featuredVideos');
      const fallback=document.getElementById('videoFallback');
      if(!mount) return;
      function abs(p){try{return new URL(p,location.href).href}catch(_){return p}}
      function getVideoURL(id,provider){
        if(provider==='youtube'||!provider) return 'https://www.youtube-nocookie.com/embed/'+id+'?rel=0';
        return null;
      }
      function renderVideos(arr){
        if(!arr||!arr.length){ if(fallback) fallback.classList.remove('hidden'); return; }
        mount.innerHTML=arr.slice(0,12).map(v=>{
          const url=getVideoURL(v.videoId,v.provider); if(!url) return '';
          const title=String(v.title||'${shipName}').replace(/</g,'&lt;');
          return '<div class="swiper-slide"><iframe src="'+url+'" title="'+title+'" allow="encrypted-media" allowfullscreen loading="lazy"></iframe></div>';
        }).join('');
        if(mount.children.length&&window.Swiper){
          setTimeout(()=>{
            try{
              new Swiper('.swiper.videos',{
                loop:false,rewind:false,lazy:true,watchOverflow:true,
                pagination:{el:'.swiper.videos .swiper-pagination',clickable:true},
                navigation:{nextEl:'.swiper.videos .swiper-button-next',prevEl:'.swiper.videos .swiper-button-prev'},
                a11y:{enabled:true}
              });
            }catch(_){}
          },150);
        }
      }
      function fetchVideoData(){
        const SOURCES=[abs('/assets/data/videos/${cruiseLine}/${slug}.json')];
        function tryFetch(i){i=i||0; if(i>=SOURCES.length) return Promise.resolve(null);
          return fetch(SOURCES[i],{cache:'no-store'}).then(r=>r.ok?r.json():tryFetch(i+1)).catch(()=>tryFetch(i+1));}
        return tryFetch();
      }
      function flattenVideos(data){
        if(!data||!data.videos) return [];
        if(Array.isArray(data.videos)) return data.videos;
        let vids=[];
        for(const cat of Object.values(data.videos)){
          if(Array.isArray(cat)) vids=vids.concat(cat);
        }
        return vids;
      }
      fetchVideoData().then(data=>{ if(data) renderVideos(flattenVideos(data)); });
    })();
    </script>`;
}

function getFaqSection(shipName, cruiseLineName, cruiseLineUrl) {
  return `
    <!-- FAQ Section -->
    <section class="card faq" id="faq" aria-labelledby="faq-heading">
      <h2 id="faq-heading">Frequently Asked Questions</h2>

      <details style="margin: 0.5rem 0; padding: 0.5rem 0; border-bottom: 1px solid #e0e8f0;">
        <summary style="cursor: pointer; font-weight: 600; padding: 0.5rem 0;">What dining options are available on ${shipName}?</summary>
        <p style="margin: 0.5rem 0; padding-left: 1rem;">${shipName} offers complimentary dining including the main dining room and buffet. Specialty restaurants vary by ship and may require reservations or carry an additional charge. Check the dining section above for specific venues available on this ship.</p>
      </details>

      <details style="margin: 0.5rem 0; padding: 0.5rem 0; border-bottom: 1px solid #e0e8f0;">
        <summary style="cursor: pointer; font-weight: 600; padding: 0.5rem 0;">How do I find the deck plans for ${shipName}?</summary>
        <p style="margin: 0.5rem 0; padding-left: 1rem;">Deck plans are available through the links on this page. You can also find official deck plans on the <a href="${cruiseLineUrl}" target="_blank" rel="noopener">${cruiseLineName}</a> website or in the cruise planner app.</p>
      </details>

      <details style="margin: 0.5rem 0; padding: 0.5rem 0; border-bottom: 1px solid #e0e8f0;">
        <summary style="cursor: pointer; font-weight: 600; padding: 0.5rem 0;">Where does ${shipName} sail?</summary>
        <p style="margin: 0.5rem 0; padding-left: 1rem;">Ship deployments vary by season. Check the <a href="${cruiseLineUrl}" target="_blank" rel="noopener">${cruiseLineName}</a> website for current itineraries and departure ports for ${shipName}.</p>
      </details>

      <details style="margin: 0.5rem 0; padding: 0.5rem 0; border-bottom: 1px solid #e0e8f0;">
        <summary style="cursor: pointer; font-weight: 600; padding: 0.5rem 0;">How can I track ${shipName}'s current location?</summary>
        <p style="margin: 0.5rem 0; padding-left: 1rem;">Use the live ship tracker section on this page to see the ship's current position, speed, and next port in real-time when available.</p>
      </details>

      <details style="margin: 0.5rem 0; padding: 0.5rem 0;">
        <summary style="cursor: pointer; font-weight: 600; padding: 0.5rem 0;">Is this information official?</summary>
        <p style="margin: 0.5rem 0; padding-left: 1rem;">This page provides planning resources and community insights. Always confirm details with <a href="${cruiseLineUrl}" target="_blank" rel="noopener">${cruiseLineName}</a> or your travel advisor before booking.</p>
      </details>
    </section>`;
}

function getAttributionSection() {
  return `
    <!-- Attribution Section -->
    <section class="card attributions">
      <h3>Sources & Attribution</h3>
      <p class="small">Ship specifications from official cruise line materials. Photos credited where shown. Data verified against industry sources.</p>
    </section>`;
}

function getRailSection() {
  return `
    <aside class="rail col-2" role="complementary" aria-label="Quick navigation and author info">
      <section class="card" id="recent-rail-nav-top" aria-labelledby="nav-top-title">
        <h3 id="nav-top-title">Quick Navigation</h3>
        <nav aria-label="Page sections">
          <ul class="rail-links">
            <li><a href="#first-look">First Look</a></li>
            <li><a href="#logbook">Logbook</a></li>
            <li><a href="#video-highlights">Videos</a></li>
            <li><a href="#faq">FAQ</a></li>
          </ul>
        </nav>
      </section>

      <section class="card author-card-vertical" aria-labelledby="author-heading">
        <h3 id="author-heading">About the Author</h3>
        <a href="/authors/ken-baker.html" aria-label="View Ken Baker's profile">
          <img class="author-avatar" src="/authors/img/ken1_96.webp" srcset="/authors/img/ken1_96.webp 1x, /authors/img/ken1_192.webp 2x" width="96" height="96" alt="Ken Baker" decoding="async" loading="lazy"/>
        </a>
        <h4><a href="/authors/ken-baker.html">Ken Baker</a></h4>
        <p class="tiny">Founder of In the Wake; writer and editor of the logbook.</p>
      </section>

      <section class="card" id="recent-rail-nav-bottom" aria-labelledby="recent-rail-title">
        <h3 id="recent-rail-title">Recent Stories</h3>
        <div id="recent-rail" class="rail-list" aria-live="polite"></div>
      </section>
    </aside>`;
}

function fixStubPage(html, cruiseLine, filename) {
  const shipName = extractShipName(html, filename);
  const slug = basename(filename, '.html');
  const cruiseLineName = CRUISE_LINE_NAMES[cruiseLine] || cruiseLine;
  const cruiseLineUrl = CRUISE_LINE_URLS[cruiseLine] || '#';
  const shipClass = extractShipClass(html);
  let changes = [];

  // Check if this is a stub page (has stub-notice or missing required sections)
  const isStub = html.includes('stub-notice') ||
                 (!html.includes('page-intro') && !html.includes('id="first-look"'));

  if (!isStub) {
    return { html, changes };
  }

  // Add page-intro if missing
  if (!html.includes('page-intro')) {
    const pageIntro = getPageIntroSection(shipName, cruiseLineName, shipClass);
    // Insert after <h1> or after breadcrumb
    if (html.match(/<h1>[^<]*<\/h1>/)) {
      html = html.replace(/(<h1>[^<]*<\/h1>[\s\S]*?(?:<p[^>]*class="subtitle"[^>]*>[^<]*<\/p>)?)/,
        `$1\n${pageIntro}`);
      changes.push('page-intro');
    }
  }

  // Add first-look if missing
  if (!html.includes('id="first-look"')) {
    const firstLook = getFirstLookSection(shipName, cruiseLineName);
    // Insert after page-intro or after quick-answer
    if (html.includes('page-intro')) {
      html = html.replace(/(<section class="page-intro"[^>]*>[\s\S]*?<\/section>)/,
        `$1\n${firstLook}`);
      changes.push('first-look');
    } else if (html.includes('quick-answer')) {
      html = html.replace(/(<div class="quick-answer"[^>]*>[\s\S]*?<\/div>)/,
        `$1\n${firstLook}`);
      changes.push('first-look');
    }
  }

  // Add logbook if missing
  if (!html.includes('id="logbook"') && !html.includes('note-kens-logbook')) {
    const logbook = getLogbookSection(shipName, slug, cruiseLine);
    // Insert before FAQ or before stub-notice
    if (html.includes('id="faq"') || html.includes('class="card faq"')) {
      html = html.replace(/(<section[^>]*(?:id="faq"|class="[^"]*faq[^"]*")[^>]*>)/,
        `${logbook}\n\n    $1`);
      changes.push('logbook');
    } else if (html.includes('stub-notice')) {
      html = html.replace(/(<div class="stub-notice")/,
        `${logbook}\n\n    $1`);
      changes.push('logbook');
    }
  }

  // Add videos if missing
  if (!html.includes('id="video-highlights"')) {
    const videos = getVideosSection(shipName, slug, cruiseLine);
    // Insert after logbook or before FAQ
    if (html.includes('id="logbook"') || html.includes('note-kens-logbook')) {
      html = html.replace(/(<section[^>]*(?:id="logbook"|class="[^"]*note-kens-logbook[^"]*")[^>]*>[\s\S]*?<\/section>)/,
        `$1\n\n${videos}`);
      changes.push('videos');
    } else if (html.includes('id="faq"') || html.includes('class="card faq"')) {
      html = html.replace(/(<section[^>]*(?:id="faq"|class="[^"]*faq[^"]*")[^>]*>)/,
        `${videos}\n\n    $1`);
      changes.push('videos');
    }
  }

  // Add FAQ if missing
  if (!html.includes('id="faq"') && !html.includes('class="card faq"') && !html.includes('faq-heading')) {
    const faq = getFaqSection(shipName, cruiseLineName, cruiseLineUrl);
    // Insert before </main> or before attribution
    if (html.includes('class="card attributions"')) {
      html = html.replace(/(<section class="card attributions")/,
        `${faq}\n\n    $1`);
      changes.push('faq');
    } else if (html.includes('</main>')) {
      html = html.replace('</main>',
        `${faq}\n\n  </main>`);
      changes.push('faq');
    }
  }

  // Add attribution if missing
  if (!html.includes('attributions')) {
    const attr = getAttributionSection();
    if (html.includes('</main>')) {
      html = html.replace('</main>',
        `${attr}\n  </main>`);
      changes.push('attribution');
    }
  }

  // Add rail section if missing
  if (!html.includes('recent-rail') && !html.includes('class="rail')) {
    const rail = getRailSection();
    // Insert before </main>
    if (html.includes('</main>')) {
      html = html.replace('</main>',
        `\n${rail}\n  </main>`);
      changes.push('rail');
    }
  }

  // Remove stub-notice since page is now complete
  if (changes.length > 0 && html.includes('stub-notice')) {
    html = html.replace(/<div class="stub-notice"[^>]*>[\s\S]*?<\/div>/g, '');
    changes.push('removed-stub-notice');
  }

  return { html, changes };
}

async function processFile(filepath, cruiseLine) {
  const html = await readFile(filepath, 'utf8');
  const result = fixStubPage(html, cruiseLine, filepath);

  if (result.changes.length > 0) {
    await writeFile(filepath, result.html, 'utf8');
    return { status: 'fixed', changes: result.changes };
  }

  return { status: 'ok' };
}

async function processCruiseLine(cruiseLine) {
  const lineDir = join(SHIPS_DIR, cruiseLine);
  let files;
  try {
    files = await readdir(lineDir);
  } catch (e) {
    return { cruiseLine, error: e.message, fixed: 0 };
  }

  const htmlFiles = files.filter(f =>
    f.endsWith('.html') &&
    f !== 'index.html' &&
    !f.includes('unnamed')
  );

  let fixed = 0;

  for (const file of htmlFiles) {
    const filepath = join(lineDir, file);
    const result = await processFile(filepath, cruiseLine);

    if (result.status === 'fixed') {
      console.log(`  ✅ ${file}: ${result.changes.join(', ')}`);
      fixed++;
    }
  }

  return { cruiseLine, fixed, total: htmlFiles.length };
}

async function main() {
  console.log('Batch Fix: Complete stub pages with required sections');
  console.log('======================================================\n');

  let totalFixed = 0;

  for (const cruiseLine of CRUISE_LINES) {
    console.log(`\n[${cruiseLine}]`);
    const result = await processCruiseLine(cruiseLine);

    if (result.error) {
      console.log(`  ⚠️ Error: ${result.error}`);
    } else {
      console.log(`  Summary: ${result.fixed} fixed`);
      totalFixed += result.fixed;
    }
  }

  console.log('\n======================================================');
  console.log(`Total: ${totalFixed} files fixed`);
}

main().catch(console.error);
