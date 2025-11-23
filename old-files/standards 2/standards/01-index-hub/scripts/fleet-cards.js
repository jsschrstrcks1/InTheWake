// fleet-cards.js — reference pattern (v3.006)
(async function(){
  const SOURCES = ['/ships/assets/data/rc-fleet-index.json', '/data/rcl_of_the_seas.json'];
  async function load() {
    for (const url of SOURCES) {
      try { const r = await fetch(url, {cache:'no-store'}); if (r.ok) return await r.json(); } catch {}
    }
    throw new Error('Fleet data unavailable');
  }

  const IMAGES = {
    'adventure-of-the-seas': [
      '/ships/rcl/images/Adventure_of_the_Seas1.jpeg',
      '/ships/rcl/images/Adventure_of_the_Seas2.jpg',
      '/ships/rcl/images/Adventure_of_the_Seas3.jpg'
    ],
    'allure-of-the-seas': [
      '/ships/assets/images/allure-of-the-seas-3.jpg',
      '/ships/assets/images/allure2.jpg',
      '/ships/assets/images/allure3.jpg'
    ],
    'enchantment-of-the-seas': [
      '/ships/assets/enchantment-of-the-seas1.jpg',
      '/ships/assets/images/Enchantment_of_the_Seas.jpeg',
      '/images/enchantment-of-the-seas2.jpeg'
    ],
    'grandeur-of-the-seas': [
      '/ships/assets/grandeur-of-the-seas1.jpg'
    ],
    'radiance-of-the-seas': [
      '/ships/assets/ships/radiance-of-the-seas1.jpeg',
      '/ships/assets/ships/radiance-of-the-seas2.jpg',
      '/ships/assets/ships/radiance-of-the-seas3.jpg'
    ],
    'rhapsody-of-the-seas': [
      '/ships/assets/rhapsody-of-the-seas1.jpg',
      '/ships/assets/images/Rhapsody_of_the_Seas_2 Medium.jpeg'
    ],
    'sovereign-of-the-seas': [
      '/ships/assets/sovereign-of-the-seas1.jpg',
      '/ships/assets/sovereign-of-the-seas2.jpg',
      '/ships/assets/sovereign-of-the-seas3.jpg'
    ],
    'vision-of-the-seas': [
      '/ships/assets/vision-of-the-seas1.jpg'
    ]
  };

  function pick(slug){
    const a = IMAGES[slug];
    if (!a || !a.length) return null;
    return a[Math.floor(Math.random()*a.length)];
  }

  const data = await load();
  const ships = (data.ships || []).filter(s => /of the seas/i.test(s.name));
  const grid = document.getElementById('fleet-grid');
  ships.forEach(s => {
    const slug = s.slug || String(s.name||'').toLowerCase().replace(/\s+/g,'-');
    const img = pick(slug);
    if (!img) return; // gate: only if image exists
    const a = document.createElement('a');
    a.href = `/ships/rcl/${slug}.html`;
    a.className = 'ship-card';
    a.innerHTML = `<div class="thumb"><img src="${img}" alt="${s.name}"></div>
                   <div class="body"><h3>${s.name}</h3><span class="badge">${s.class||''}</span></div>`;
    grid.appendChild(a);
  });
})();
