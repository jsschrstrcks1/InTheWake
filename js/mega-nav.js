
function pageUrl(file){
  try {
    const host = window.location.host || '';
    if (host.endsWith('github.io')) {
      // Hardcode repo base (safer than guessing path segments)
      return 'https://jsschrstrcks1.github.io/InTheWake/' + file.replace(/^\/+/,''); 
    }
  } catch(e){}
  return file;
}

/* assets/js/mega-nav.js — unified mega menu + brand/class/ship helpers


// --- Ship page linker (local HTML mapping) ---
let SHIP_PAGE_MAP = null;
async function loadShipPages(){
  if (SHIP_PAGE_MAP) return SHIP_PAGE_MAP;
  try{
    const res = await fetch('assets/data/ship_pages.json', {cache:'no-store'});
    if(res.ok){ SHIP_PAGE_MAP = await res.json(); }
    else { SHIP_PAGE_MAP = {by_name:{}, by_slug:{}}; }
  }catch(e){ SHIP_PAGE_MAP = {by_name:{}, by_slug:{}}; }
  return SHIP_PAGE_MAP;
}

function slugify(label){
  return label.normalize('NFKD')
    .replace(/[^\w\s-]/g,'')
    .trim().toLowerCase()
    .replace(/[\s_]+/g,'-');
}

function shipHref(label){
  if (!SHIP_PAGE_MAP) return null;
  const byName = SHIP_PAGE_MAP.by_name || {};
  const bySlug = SHIP_PAGE_MAP.by_slug || {};
  // Exact
  if (byName[label]) return byName[label];
  // Case-insensitive exact
  const ci = Object.keys(byName).find(k => k.toLowerCase() === label.toLowerCase());
  if (ci) return byName[ci];
  // Slug match
  const s = slugify(label);
  if (bySlug[s]) return bySlug[s];
  return null;
}

// Wrap label in anchor if we have a local page
function labelWithLink(label){
  const href = shipHref(label);
  if (href){
    const a = document.createElement('a');
    a.href = pageUrl(href);
    a.textContent = label;
    return a;
  }
  const span = document.createElement('span');
  span.textContent = label;
  return span;
}
  const span = document.createElement('span');
  span.textContent = label;
  return span;
}

