<script>
/* Restaurants — data-driven render + smart filter  (v2.256.019)
   - Renders all venue cards from /assets/data/venues.json
   - Indexes: name, aliases, blurb, access, audience, slug, HOST CLASSES & SHIPS
   - Hides empty sections when filtering
   - Friendly message if JSON missing/invalid
*/
(function(){
  const Q  = sel => document.querySelector(sel);
  const QA = sel => Array.from(document.querySelectorAll(sel));

  const $meta  = Q('#search-meta');
  const $input = Q('#q');

  const sections = {
    complimentary: { wrap: Q('#complimentary .grid'), sec: Q('#complimentary') },
    premium:       { wrap: Q('#specialty .grid'),     sec: Q('#specialty') },
    activity:      { wrap: Q('#activities .grid'),    sec: Q('#activities') }
  };

  // Fallback teaser text if venues.json lacks "blurb"
  const BLURB = {
    "mdr": "Rotating menus, themed nights; classic cruise dining.",
    "windjammer": "Casual buffet for breakfast, lunch, and dinner.",
    "park-cafe": "Quick salads, paninis, and the Kummelweck roll.",
    "latte-tudes": "Espresso drinks and morning pastries.",
    "sorrentos": "Grab-and-go slices and late-night pizza.",
    "room-service": "Order-in comfort; delivery fee may apply.",
    "chops": "Signature steakhouse; premium cuts and sides.",
    "giovannis": "Rustic Italian favorites; family-style warmth.",
    "izumi": "Sushi, hibachi, and hot rocks (ship dependent).",
    "chefs-table": "Hosted tasting dinner with wine pairings.",
    "samba-grill": "Brazilian churrascaria served rodizio-style.",
    "johnny-rockets": "American diner classics and milkshakes.",
    "cafe-promenade": "24-hour light bites and coffee on many ships.",
    "vintages": "Wine bar flights, small plates on select ships.",
    "playmakers": "Wings, sliders, and big-screen sports.",
    "dog-house": "Gourmet hot dogs with regional toppings.",
    "solarium-bistro": "Lighter Mediterranean-style buffet.",
    "coastal-kitchen": "Suite-guest dining; Mediterranean meets California.",
    "vitality-cafe": "Smoothies and light, health-forward bites.",
    "el-loco-fresh": "Casual tacos, nachos, and burritos.",
    "aquadome-market": "Icon-class food hall with global stalls.",
    "pearl-cafe": "Anytime snacks and views off the Royal Promenade.",
    "surfside-eatery": "Family-friendly buffet in the Surfside neighborhood.",
    "the-grove": "Suite-only alfresco venue on Icon class.",
    "basecamp": "Quick bites steps from the action.",
    "celebration-table": "Private dining experience for your crew.",
    "pier-7": "All-day breakfast and fresh, West-coast plates.",
    "izumi-in-the-park": "Walk-up sushi & snacks in the open air.",
    "starbucks": "The Starbucks favorites you know, at sea.",
    "wonderland": "A whimsical, multi-sensory dining adventure.",
    "hooked": "New-England-style seafood and raw bar.",
    "jamies-italian": "Jamie Oliver’s rustic pastas and plates.",
    "150-central-park": "Oasis-class fine dining staple.",
    "sugar-beach": "Candy store with hand-scooped ice cream.",
    "lincoln-park-supper-club": "Icon’s live-music supper club experience.",
    "dining-activities": "Hands-on classes and tastings fleetwide."
  };

  const hrefFor = slug => `/restaurants/${slug}.html`;

  // Normalize for search (case/diacritics/apostrophes/hyphens)
  function norm(s){
    return String(s||'')
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .replace(/[’‘']/g,"'")
      .replace(/-/g,' ')
      .replace(/\s+/g,' ')
      .trim();
  }

  // Hide empty sections (title + divider + grid)
  function hideEmptySections(){
    Object.values(sections).forEach(s=>{
      const visible = s.wrap.querySelectorAll('.card:not(.is-hidden)').length;
      s.sec.classList.toggle('is-hidden', visible===0);
    });
  }

  // Live filter
  function initFilter(){
    const chips = QA('#filters .chip');
    let state = { query:'', cats:new Set() };

    function collectCards(){
      return QA('.grid .card a').map(a=>{
        const cat   = a.getAttribute('data-cat')||'';
        const text  = norm(a.textContent + ' ' + (a.getAttribute('data-tags')||''));
        return { el:a.closest('.card'), cat, text };
      });
    }
    let cards = collectCards();

    function apply(){
      const q = norm(state.query);
      let shown = 0;
      cards.forEach(c=>{
        const textHit = !q || q.split(' ').every(tok => c.text.includes(tok));
        const catHit  = !state.cats.size || state.cats.has(c.cat);
        const hit = textHit && catHit;
        c.el.classList.toggle('is-hidden', !hit);
        if (hit) shown++;
      });
      hideEmptySections();
      $meta.textContent = (q || state.cats.size)
        ? `Showing ${shown} of ${cards.length}`
        : `Showing all venues & activities`;
    }

    function onChipClick(e){
      const btn = e.currentTarget;
      const val = btn.getAttribute('data-val');
      const active = btn.getAttribute('aria-pressed') === 'true';
      if (active) state.cats.delete(val); else state.cats.add(val);
      btn.setAttribute('aria-pressed', active?'false':'true');
      apply();
    }

    chips.forEach(b=> b.addEventListener('click', onChipClick));
    $input && $input.addEventListener('input', ()=>{ state.query = $input.value; apply(); });
    window.addEventListener('keydown', e=>{ if(e.key==='/' && document.activeElement!==$input){ e.preventDefault(); $input.focus(); }});

    window.addEventListener('venues-rendered', ()=>{
      cards = collectCards();
      apply();
    }, {once:true});
  }

  // Load JSON
  async function loadDB(){
    try{
      const res = await fetch('/assets/data/venues.json', {cache:'no-store'});
      if (!res.ok) throw new Error('HTTP '+res.status);
      return await res.json();
    }catch(e){
      const box = document.createElement('p');
      box.className = 'tiny pill';
      box.style.margin = '.5rem 16px';
      box.textContent = 'We couldn’t load the latest venue list. Showing the static cards for now.';
      const search = document.getElementById('search-wrap');
      search && search.insertAdjacentElement('afterend', box);
      return null;
    }
  }

  // Build reverse indexes so venues pick up host classes & ship names
  function buildVenueHostMaps(db){
    const shipsByVenue = new Map();   // slug -> Set(shipSlug)
    const classByShip  = {};          // shipSlug -> 'oasis' / 'icon' / etc
    const nameByShip   = {};          // shipSlug -> Display Name

    Object.entries(db.ships||{}).forEach(([shipSlug, payload])=>{
      classByShip[shipSlug] = String(payload.class||'').toLowerCase();
      nameByShip[shipSlug]  = payload.name || shipSlug;
      (payload.venues||[]).forEach(slug=>{
        if (!shipsByVenue.has(slug)) shipsByVenue.set(slug, new Set());
        shipsByVenue.get(slug).add(shipSlug);
      });
    });

    const classesByVenue = new Map(); // slug -> Set(class)
    shipsByVenue.forEach((shipSet, slug)=>{
      const klasses = new Set();
      shipSet.forEach(shipSlug=>{
        const k = classByShip[shipSlug];
        if (k) klasses.add(k);
      });
      classesByVenue.set(slug, klasses);
    });

    return { shipsByVenue, classesByVenue, classByShip, nameByShip };
  }

  // Render one venue card (now includes host classes/ships in data-tags)
  function cardHTML(venue, extras){
    const href  = hrefFor(venue.slug);
    const cat   = venue.category;
    const name  = venue.name;
    const blurb = venue.blurb || BLURB[venue.slug] || 'Details and menus inside.';

    const shipSlugs = Array.from(extras.shipsByVenue.get(venue.slug)||[]);
    const classSlugs = Array.from(extras.classesByVenue.get(venue.slug)||[]);

    // Human-friendly class tokens for search, e.g. "oasis", "oasis class"
    const classTokens = classSlugs.flatMap(k=>[k, `${k} class`]);

    // Ship name tokens for search
    const shipNameTokens = shipSlugs.map(s=> extras.nameByShip[s] || s);

    // data-* carries everything searchable
    const idxParts = [
      name,
      (venue.aliases||[]).join(' '),
      blurb,
      (venue.access||[]).join(' '),
      (venue.audience||[]).join(' '),
      venue.slug,
      classTokens.join(' '),
      shipSlugs.join(' '),
      shipNameTokens.join(' ')
    ].join(' ');

    return `
      <div class="card">
        <a href="${href}"
           data-cat="${cat}"
           data-slug="${venue.slug}"
           ${classSlugs.length ? `data-classes="${classSlugs.join(' ')}"` : ''}
           ${shipSlugs.length  ? `data-ships="${shipSlugs.join(' ')}"`   : ''}
           data-tags="${idxParts.replace(/"/g,'&quot;')}">
          <strong>${name}</strong><br/>
          <small>${blurb}</small>
        </a>
      </div>`;
  }

  // Insert cards into their section containers
  function renderAll(db, extras){
    Object.values(sections).forEach(s => s.wrap.innerHTML = '');
    (db.venues||[])
      .slice()
      .sort((a,b)=> (a.name||a.slug).localeCompare(b.name||b.slug))
      .forEach(v => {
        const s = sections[v.category];
        if (s) s.wrap.insertAdjacentHTML('beforeend', cardHTML(v, extras));
      });
  }

  // Main boot
  (async function(){
    initFilter();
    const db = await loadDB();
    if (!db || !Array.isArray(db.venues)) {
      // JSON failed, still collapse sections for whatever static HTML exists
      const observer = new MutationObserver(hideEmptySections);
      observer.observe(document.body, {subtree:true, childList:true, attributes:true});
      hideEmptySections();
      return;
    }

    // Normalize/augment a few access/audience tokens (for "diamond", "suite" queries)
    (db.venues||[]).forEach(v=>{
      v.access   = Array.isArray(v.access)   ? v.access   : [];
      v.audience = Array.isArray(v.audience) ? v.audience : [];
      if (v.slug === 'diamond-lounge'){
        v.access.push('diamond', 'diamond and above', 'diamond lounge');
        v.audience.push('crown & anchor', 'diamond and above');
      }
      if (v.slug === 'suite-lounge' || v.slug === 'coastal-kitchen' || v.slug === 'the-grove'){
        v.access.push('suite', 'suites', 'pinnacle');
        v.audience.push('suite guests', 'pinnacle');
      }
    });

    const extras = buildVenueHostMaps(db);
    renderAll(db, extras);
    window.dispatchEvent(new Event('venues-rendered'));
    $meta.textContent = 'Showing all venues & activities';
  })();
})();
</script>
