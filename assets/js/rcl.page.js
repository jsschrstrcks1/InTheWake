
(function(){'use strict';
const ORIGIN='https://www.cruisinginthewake.com';
const EL=s=>document.querySelector(s), ELS=s=>Array.from(document.querySelectorAll(s));
let SHOW_UNFINISHED=false, VENUE_FILTER='all', EXP_FILTER='all';
const norm = s => String(s||'').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu,'').trim();
async function loadJSON(path){ const r=await fetch(path,{cache:'no-store'}); if(!r.ok) throw 0; return r.json(); }

let SHIPS=[], VENUES=[], EXPS=[];
function classOrderWeight(c){const order=['Icon','Oasis','Quantum','Quantum Ultra','Freedom','Voyager','Radiance','Vision','Archive']; const i=order.indexOf(c); return i<0?999:i;}
const shipUrl = slug => ORIGIN + '/ships/rcl/' + slug + '.html';
const shipThumb = slug => ORIGIN + '/assets/ships/placeholder-ship.jpg';

function renderClassPills(){
  const pills=EL('#class-pills'); if(!pills) return;
  const classes=[...new Set(SHIPS.map(s=>s.class))].sort((a,b)=>classOrderWeight(a)-classOrderWeight(b));
  pills.innerHTML='';
  classes.forEach((cls,i)=>{
    const b=document.createElement('button'); b.type='button'; b.className='pillbtn'+(i===0?' active':''); b.textContent=cls+' Class';
    b.addEventListener('click',()=>{ ELS('#class-pills .pillbtn').forEach(x=>x.classList.remove('active')); b.classList.add('active'); renderClassGrid(cls); });
    pills.appendChild(b);
  });
  if(classes.length) renderClassGrid(classes[0]);
}

function renderClassGrid(cls){
  const wrap=EL('#class-grid'), note=EL('#class-note'); if(!wrap) return;
  const list=SHIPS.filter(s=>s.class===cls).filter(s=>SHOW_UNFINISHED?true:!!s.finished).sort((a,b)=>norm(a.name).localeCompare(norm(b.name)));
  wrap.innerHTML='';
  if(!list.length){ wrap.innerHTML='<p class="tiny">No finished ships in this class yet.</p>'; if(note) note.textContent='Toggle “Show unfinished ships” to view pages still in progress.'; return; }
  if(note) note.textContent='';
  list.forEach(s=>{
    const a=document.createElement('a'); a.href=shipUrl(s.slug); a.className='ship-card';
    a.innerHTML=`<span class="thumb"><img loading="lazy" decoding="async" alt="${s.name}" src="${shipThumb(s.slug)}"></span>
                 <span class="body"><strong>${s.name}</strong><span class="badge">${s.class}</span></span>`;
    wrap.appendChild(a);
  });
}

function renderVenues(){
  const panel=EL('#venues-panel'); if(!panel) return;
  const list=VENUES.filter(v=>VENUE_FILTER==='all'||(VENUE_FILTER==='premium'?v.premium:!v.premium)).sort((a,b)=>a.name.localeCompare(b.name));
  panel.innerHTML='';
  list.forEach(vn=>{
    const a=document.createElement('a'); a.href=ORIGIN+'/restaurants/'+vn.slug+'.html'; a.className='ship-card';
    a.innerHTML=`<span class="thumb"><img loading="lazy" decoding="async" alt="${vn.name}" src="https://www.cruisinginthewake.com/assets/ships/placeholder-ship.jpg"></span>
                 <span class="body"><strong>${vn.name}</strong><span class="badge">${vn.premium?'Premium':'Included'}</span></span>`;
    panel.appendChild(a);
  });
}

function renderSearch(q){
  const out=EL('#searchResults'); if(!out) return;
  const v=norm(q); out.innerHTML='';
  const shipHits=SHIPS.filter(s=>(SHOW_UNFINISHED?true:s.finished)&&(norm(s.name).includes(v)||norm(s.slug).includes(v)));
  const venueHits=VENUES.filter(x=>(VENUE_FILTER==='all'||(VENUE_FILTER==='premium'?x.premium:!x.premium))&&norm(x.name).includes(v));
  const expHits=EXPS.filter(x=>(EXP_FILTER==='all'||(EXP_FILTER==='premium'?x.premium:!x.premium))&&norm(x.name).includes(v));

  const shipCard=s=>`<a class="ship-card" href="${shipUrl(s.slug)}"><span class="thumb"><img loading="lazy" decoding="async" alt="${s.name}" src="${shipThumb(s.slug)}"></span><span class="body"><strong>${s.name}</strong><span class="badge">${s.class}</span></span></a>`;
  const venueCard=v=>`<a class="ship-card" href="${ORIGIN}/restaurants/${v.slug}.html"><span class="thumb"><img loading="lazy" decoding="async" alt="${v.name}" src="https://www.cruisinginthewake.com/assets/ships/placeholder-ship.jpg"></span><span class="body"><strong>${v.name}</strong><span class="badge">${v.premium?'Premium':'Included'}</span></span></a>`;
  const expCard=e=>`<div class="ship-card"><span class="thumb"><img loading="lazy" decoding="async" alt="${e.name}" src="https://www.cruisinginthewake.com/assets/ships/placeholder-ship.jpg"></span><span class="body"><strong>${e.name}</strong><span class="badge">${e.premium?'Premium':'Included'}</span></span></div>`;
  const block=(t,items)=> items.length ? `<div class="search-block"><h3>${t}</h3><div class="grid cols-3">${items.join('')}</div></div>` : '';
  out.innerHTML=[block('Ships', shipHits.slice(0,12).map(shipCard)), block('Venues', venueHits.slice(0,9).map(venueCard)), block('Experiences', expHits.slice(0,6).map(expCard))].join('');
}

function bindToggles(){
  const toggle=EL('#toggle-unfinished');
  toggle?.addEventListener('change', e=>{ SHOW_UNFINISHED=!!e.target.checked; const active=EL('#class-pills .pillbtn.active'); renderClassGrid(active?active.textContent.replace(' Class',''):'Icon'); renderSearch(EL('#shipSearch')?.value||''); });
  ELS('input[name="venueFilter"]').forEach(r=> r.addEventListener('change', ()=>{ VENUE_FILTER=(EL('input[name="venueFilter"]:checked')||{}).value||'all'; renderVenues(); renderSearch(EL('#shipSearch')?.value||''); }));
  ELS('input[name="expFilter"]').forEach(r=> r.addEventListener('change', ()=>{ EXP_FILTER=(EL('input[name="expFilter"]:checked')||{}).value||'all'; renderSearch(EL('#shipSearch')?.value||''); }));
}

function bindSearch(){
  const q=EL('#shipSearch');
  q?.addEventListener('input', ()=>{ clearTimeout(q._t); q._t=setTimeout(()=>renderSearch(q.value),80); });
}

(async function init(){
  try {
    const [A,B,C]=await Promise.all([
      loadJSON('https://www.cruisinginthewake.com/assets/data/ships.json'),
      loadJSON('https://www.cruisinginthewake.com/assets/data/venues-v2.json'),
      loadJSON('https://www.cruisinginthewake.com/assets/data/experiences.json')
    ]);
    SHIPS=A; VENUES=B; EXPS=C;
  } catch {
    // fallback to inline if CDN isn't present locally
    SHIPS=[{"name": "Icon of the Seas", "slug": "icon-of-the-seas", "class": "Icon", "finished": true}, {"name": "Star of the Seas", "slug": "star-of-the-seas", "class": "Icon", "finished": true}, {"name": "Oasis of the Seas", "slug": "oasis-of-the-seas", "class": "Oasis", "finished": true}, {"name": "Allure of the Seas", "slug": "allure-of-the-seas", "class": "Oasis", "finished": true}, {"name": "Harmony of the Seas", "slug": "harmony-of-the-seas", "class": "Oasis", "finished": true}, {"name": "Symphony of the Seas", "slug": "symphony-of-the-seas", "class": "Oasis", "finished": true}, {"name": "Wonder of the Seas", "slug": "wonder-of-the-seas", "class": "Oasis", "finished": true}, {"name": "Utopia of the Seas", "slug": "utopia-of-the-seas", "class": "Oasis", "finished": true}, {"name": "Freedom of the Seas", "slug": "freedom-of-the-seas", "class": "Freedom", "finished": true}, {"name": "Liberty of the Seas", "slug": "liberty-of-the-seas", "class": "Freedom", "finished": true}, {"name": "Independence of the Seas", "slug": "independence-of-the-seas", "class": "Freedom", "finished": true}, {"name": "Voyager of the Seas", "slug": "voyager-of-the-seas", "class": "Voyager", "finished": true}, {"name": "Explorer of the Seas", "slug": "explorer-of-the-seas", "class": "Voyager", "finished": true}, {"name": "Adventure of the Seas", "slug": "adventure-of-the-seas", "class": "Voyager", "finished": true}, {"name": "Navigator of the Seas", "slug": "navigator-of-the-seas", "class": "Voyager", "finished": true}, {"name": "Mariner of the Seas", "slug": "mariner-of-the-seas", "class": "Voyager", "finished": true}, {"name": "Radiance of the Seas", "slug": "radiance-of-the-seas", "class": "Radiance", "finished": true}, {"name": "Brilliance of the Seas", "slug": "brilliance-of-the-seas", "class": "Radiance", "finished": true}, {"name": "Serenade of the Seas", "slug": "serenade-of-the-seas", "class": "Radiance", "finished": true}, {"name": "Jewel of the Seas", "slug": "jewel-of-the-seas", "class": "Radiance", "finished": true}, {"name": "Vision of the Seas", "slug": "vision-of-the-seas", "class": "Vision", "finished": true}, {"name": "Rhapsody of the Seas", "slug": "rhapsody-of-the-seas", "class": "Vision", "finished": true}, {"name": "Enchantment of the Seas", "slug": "enchantment-of-the-seas", "class": "Vision", "finished": true}, {"name": "Grandeur of the Seas", "slug": "grandeur-of-the-seas", "class": "Vision", "finished": true}, {"name": "Majesty of the Seas (archive)", "slug": "majesty-of-the-seas", "class": "Archive", "finished": true}];
    VENUES=[{"name": "Chops Grille", "slug": "chops-grille", "premium": true}, {"name": "150 Central Park", "slug": "150-central-park", "premium": true}, {"name": "Giovanni’s", "slug": "giovannis", "premium": true}, {"name": "Izumi", "slug": "izumi", "premium": true}, {"name": "Teppanyaki", "slug": "teppanyaki", "premium": true}, {"name": "Hooked Seafood", "slug": "hooked-seafood", "premium": true}, {"name": "Chef’s Table", "slug": "chefs-table", "premium": true}, {"name": "Johnny Rockets", "slug": "johnny-rockets", "premium": true}, {"name": "Main Dining Room", "slug": "main-dining-room", "premium": false}, {"name": "Windjammer Café", "slug": "windjammer", "premium": false}, {"name": "Park Café", "slug": "park-cafe", "premium": false}, {"name": "El Loco Fresh", "slug": "el-loco-fresh", "premium": false}, {"name": "Playmakers", "slug": "playmakers", "premium": false}];
    EXPS=[{"name": "Chef's Table", "slug": "chefs-table-experience", "premium": true, "ships": ["icon-of-the-seas", "star-of-the-seas", "oasis-of-the-seas", "allure-of-the-seas", "harmony-of-the-seas", "symphony-of-the-seas", "wonder-of-the-seas", "utopia-of-the-seas", "freedom-of-the-seas", "liberty-of-the-seas", "independence-of-the-seas", "voyager-of-the-seas", "explorer-of-the-seas", "adventure-of-the-seas", "navigator-of-the-seas", "mariner-of-the-seas", "radiance-of-the-seas", "brilliance-of-the-seas", "serenade-of-the-seas", "jewel-of-the-seas", "vision-of-the-seas", "rhapsody-of-the-seas", "enchantment-of-the-seas", "grandeur-of-the-seas"]}, {"name": "Protect the Egg", "slug": "protect-the-egg", "premium": false, "ships": ["icon-of-the-seas", "star-of-the-seas", "oasis-of-the-seas", "allure-of-the-seas", "harmony-of-the-seas", "symphony-of-the-seas", "wonder-of-the-seas", "utopia-of-the-seas", "freedom-of-the-seas", "liberty-of-the-seas", "independence-of-the-seas", "voyager-of-the-seas", "explorer-of-the-seas", "adventure-of-the-seas", "navigator-of-the-seas", "mariner-of-the-seas", "radiance-of-the-seas", "brilliance-of-the-seas", "serenade-of-the-seas", "jewel-of-the-seas", "vision-of-the-seas", "rhapsody-of-the-seas", "enchantment-of-the-seas", "grandeur-of-the-seas"]}, {"name": "Belly Flop Competition", "slug": "belly-flop", "premium": false, "ships": ["icon-of-the-seas", "star-of-the-seas", "oasis-of-the-seas", "allure-of-the-seas", "harmony-of-the-seas", "symphony-of-the-seas", "wonder-of-the-seas", "utopia-of-the-seas", "freedom-of-the-seas", "liberty-of-the-seas", "independence-of-the-seas", "voyager-of-the-seas", "explorer-of-the-seas", "adventure-of-the-seas", "navigator-of-the-seas", "mariner-of-the-seas", "radiance-of-the-seas", "brilliance-of-the-seas", "serenade-of-the-seas", "jewel-of-the-seas", "vision-of-the-seas", "rhapsody-of-the-seas", "enchantment-of-the-seas", "grandeur-of-the-seas"]}, {"name": "All Access Tour", "slug": "all-access-tour", "premium": true, "ships": ["icon-of-the-seas", "star-of-the-seas", "oasis-of-the-seas", "allure-of-the-seas", "harmony-of-the-seas", "symphony-of-the-seas", "wonder-of-the-seas", "utopia-of-the-seas", "freedom-of-the-seas", "liberty-of-the-seas", "independence-of-the-seas", "voyager-of-the-seas", "explorer-of-the-seas", "adventure-of-the-seas", "navigator-of-the-seas", "mariner-of-the-seas", "radiance-of-the-seas", "brilliance-of-the-seas", "serenade-of-the-seas", "jewel-of-the-seas", "vision-of-the-seas", "rhapsody-of-the-seas", "enchantment-of-the-seas", "grandeur-of-the-seas"]}];
  }
  bindToggles(); bindSearch();
  renderClassPills(); renderVenues(); renderSearch('');
})();

})();
