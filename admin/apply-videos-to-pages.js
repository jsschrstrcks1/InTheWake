#!/usr/bin/env node
/**
 * Apply Videos to Ship Pages
 * Soli Deo Gloria
 *
 * 1. Reads all video JSON files
 * 2. Validates each video is relevant (mentions ship name)
 * 3. Adds video sections to ship HTML pages that don't have them
 * 4. Updates video loader script paths
 */

import { readFile, writeFile, readdir, access } from 'fs/promises';
import { join, basename, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

const CRUISE_LINES = [
  'carnival', 'celebrity-cruises', 'costa', 'cunard', 'explora-journeys',
  'holland-america-line', 'msc', 'norwegian', 'oceania', 'princess',
  'rcl', 'regent', 'seabourn', 'silversea', 'virgin-voyages'
];

function slugToName(slug) {
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .replace(/Msc /g, 'MSC ')
    .replace(/Ncl /g, 'NCL ')
    .replace(/Rcl /g, 'Royal Caribbean ');
}

function isVideoRelevant(video, shipName) {
  const title = (video.title || '').toLowerCase();
  const desc = (video.description || '').toLowerCase();
  const combined = title + ' ' + desc;
  const shipNameLower = shipName.toLowerCase();

  // Direct match
  if (combined.includes(shipNameLower)) return true;

  // Extract the ship-specific part (e.g., "Breakaway" from "Norwegian Breakaway")
  const parts = shipNameLower.split(' ');
  if (parts.length > 1) {
    const shipPart = parts.slice(1).join(' '); // e.g., "breakaway", "world america"
    if (shipPart.length > 4 && combined.includes(shipPart)) return true;
  }

  // Handle abbreviations
  const abbreviations = {
    'norwegian': ['ncl', 'norwegian'],
    'msc': ['msc'],
    'celebrity': ['celebrity'],
    'royal caribbean': ['royal caribbean', 'rci', 'rccl'],
    'carnival': ['carnival', 'ccl'],
    'princess': ['princess'],
    'holland america': ['holland america', 'hal'],
    'seabourn': ['seabourn'],
    'silversea': ['silversea', 'silver'],
    'virgin voyages': ['virgin voyages', 'virgin'],
    'oceania': ['oceania'],
    'regent': ['regent', 'rssc', 'seven seas'],
    'cunard': ['cunard', 'queen'],
  };

  // Check if cruise line + ship part matches
  for (const [cruiseLine, aliases] of Object.entries(abbreviations)) {
    if (shipNameLower.startsWith(cruiseLine)) {
      const shipPart = shipNameLower.replace(cruiseLine, '').trim();
      if (shipPart.length > 3) {
        for (const alias of aliases) {
          // Check for "NCL Breakaway" pattern
          if (combined.includes(alias + ' ' + shipPart)) return true;
          if (combined.includes(alias + shipPart)) return true;
        }
      }
    }
  }

  return false;
}

function countVideos(videoData) {
  if (!videoData || !videoData.videos) return 0;

  if (Array.isArray(videoData.videos)) {
    return videoData.videos.length;
  }

  // Count from categorized structure
  let count = 0;
  for (const category of Object.values(videoData.videos)) {
    if (Array.isArray(category)) {
      count += category.length;
    }
  }
  return count;
}

function flattenVideos(videoData) {
  if (!videoData || !videoData.videos) return [];

  if (Array.isArray(videoData.videos)) {
    return videoData.videos;
  }

  // Flatten from categorized structure
  const videos = [];
  for (const category of Object.values(videoData.videos)) {
    if (Array.isArray(category)) {
      videos.push(...category);
    }
  }
  return videos;
}

function createVideoSection(shipName, cruiseLine, shipSlug) {
  return `
    <!-- Videos -->
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
        const SOURCES=[abs('/assets/data/videos/${cruiseLine}/${shipSlug}.json')];
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
    </script>
`;
}

async function processShipPage(htmlPath, cruiseLine) {
  const shipSlug = basename(htmlPath, '.html');
  const shipName = slugToName(shipSlug);

  // Check if video data exists for this ship
  const videoPath = join(PROJECT_ROOT, 'assets', 'data', 'videos', cruiseLine, `${shipSlug}.json`);
  let videoData;
  try {
    const content = await readFile(videoPath, 'utf8');
    videoData = JSON.parse(content);
  } catch (e) {
    return { status: 'no-videos', ship: shipSlug };
  }

  const videoCount = countVideos(videoData);
  if (videoCount === 0) {
    return { status: 'empty-videos', ship: shipSlug };
  }

  // Validate videos are relevant
  const allVideos = flattenVideos(videoData);
  const relevantVideos = allVideos.filter(v => isVideoRelevant(v, shipName));

  if (relevantVideos.length === 0) {
    return { status: 'no-relevant-videos', ship: shipSlug, total: videoCount };
  }

  // Read HTML file
  let html;
  try {
    html = await readFile(htmlPath, 'utf8');
  } catch (e) {
    return { status: 'read-error', ship: shipSlug };
  }

  // Check if page already has video section
  if (html.includes('id="video-highlights"') || html.includes('id="featuredVideos"')) {
    // Check if video loader points to correct path
    if (!html.includes(`/assets/data/videos/${cruiseLine}/${shipSlug}.json`)) {
      // Update the video source path
      const oldPattern = /abs\('\/assets\/data\/videos\/[^']+'\)/g;
      if (oldPattern.test(html)) {
        html = html.replace(oldPattern, `abs('/assets/data/videos/${cruiseLine}/${shipSlug}.json')`);
        await writeFile(htmlPath, html, 'utf8');
        return { status: 'updated-path', ship: shipSlug, videos: relevantVideos.length };
      }
    }
    return { status: 'already-has-videos', ship: shipSlug, videos: relevantVideos.length };
  }

  // Find insertion point - before </main> or before footer
  const insertPatterns = [
    /(<\/main>)/,
    /(<!-- End Main -->)/,
    /(<footer)/
  ];

  let inserted = false;
  for (const pattern of insertPatterns) {
    if (pattern.test(html)) {
      const videoSection = createVideoSection(shipName, cruiseLine, shipSlug);
      html = html.replace(pattern, videoSection + '\n\n    $1');
      inserted = true;
      break;
    }
  }

  if (!inserted) {
    // Try to insert before closing body tag
    if (html.includes('</body>')) {
      const videoSection = createVideoSection(shipName, cruiseLine, shipSlug);
      html = html.replace('</body>', videoSection + '\n</body>');
      inserted = true;
    }
  }

  if (inserted) {
    await writeFile(htmlPath, html, 'utf8');
    return { status: 'added-videos', ship: shipSlug, videos: relevantVideos.length };
  }

  return { status: 'no-insertion-point', ship: shipSlug };
}

async function processCruiseLine(cruiseLine) {
  const shipsDir = join(PROJECT_ROOT, 'ships', cruiseLine);
  let files;
  try {
    files = await readdir(shipsDir);
  } catch (e) {
    return [];
  }

  const htmlFiles = files.filter(f =>
    f.endsWith('.html') &&
    f !== 'index.html' &&
    !f.includes('unnamed')
  );

  const results = [];
  for (const file of htmlFiles) {
    const result = await processShipPage(join(shipsDir, file), cruiseLine);
    results.push(result);
  }

  return results;
}

async function main() {
  console.log('Apply Videos to Ship Pages');
  console.log('==========================\n');

  let totalAdded = 0;
  let totalUpdated = 0;
  let totalAlreadyHas = 0;
  let totalNoVideos = 0;

  for (const cruiseLine of CRUISE_LINES) {
    console.log(`\n[${cruiseLine}]`);
    const results = await processCruiseLine(cruiseLine);

    for (const r of results) {
      if (r.status === 'added-videos') {
        console.log(`  ✅ ${r.ship}: Added video section (${r.videos} videos)`);
        totalAdded++;
      } else if (r.status === 'updated-path') {
        console.log(`  🔄 ${r.ship}: Updated video path (${r.videos} videos)`);
        totalUpdated++;
      } else if (r.status === 'already-has-videos') {
        totalAlreadyHas++;
      } else if (r.status === 'no-videos' || r.status === 'empty-videos') {
        totalNoVideos++;
      } else if (r.status === 'no-relevant-videos') {
        console.log(`  ⚠️  ${r.ship}: ${r.total} videos but none relevant`);
      }
    }

    const added = results.filter(r => r.status === 'added-videos').length;
    const existing = results.filter(r => r.status === 'already-has-videos').length;
    console.log(`  Summary: ${added} added, ${existing} already had videos`);
  }

  console.log('\n==========================');
  console.log(`Total: ${totalAdded} sections added, ${totalUpdated} paths updated, ${totalAlreadyHas} already had videos`);
}

main().catch(console.error);
