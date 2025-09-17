// assets/js/dining-card.js
(function () {
  function byLower(a) { return (a || '').toLowerCase(); }
  function el(tag, opts = {}) {
    const n = document.createElement(tag);
    if (opts.className) n.className = opts.className;
    if (opts.text) n.textContent = opts.text;
    if (opts.html) n.innerHTML = opts.html;
    if (opts.attrs) Object.entries(opts.attrs).forEach(([k,v]) => n.setAttribute(k,v));
    return n;
  }

  async function fetchFleet() {
    const paths = [
      '/assets/data/fleet_index.json',
      '/assets/fleet_index.json',
      '/fleet_index.json'
    ];
    for (const p of paths) {
      try {
        const r = await fetch(p, { credentials: 'same-origin' });
        if (r.ok) return await r.json();
      } catch (e) { /* try next */ }
    }
    throw new Error('fleet_index.json not found at expected paths');
  }

  function findShip(data, shipName) {
    const datasets = Array.isArray(data) ? data : (data.ships || data.data || []);
    const lname = byLower(shipName);
    return (datasets || []).find(s => byLower(s.name || s.ship || s.title) === lname) || null;
  }

  function getVenues(ship) {
    // Support multiple shapes of data gracefully
    const dining = ship.restaurants || ship.dining || {};
    const included = dining.included || dining.free || dining.complimentary || [];
    const premium  = dining.premium || dining.extraFee || dining.specialty || [];
    return { included, premium };
  }

  function renderList(list) {
    const ul = document.createElement('ul');
    list.forEach(item => {
      if (typeof item === 'string') {
        const li = document.createElement('li');
        li.textContent = item;
        ul.appendChild(li);
      } else if (item && typeof item === 'object') {
        const li = document.createElement('li');
        const name = item.name || item.title || 'Restaurant';
        if (item.url) {
          const a = document.createElement('a');
          a.textContent = name;
          a.href = item.url;
          a.rel = 'noopener';
          a.target = '_blank';
          li.appendChild(a);
        } else {
          li.textContent = name;
        }
        ul.appendChild(li);
      }
    });
    return ul;
  }

  async function initCard(card) {
    const shipName = card.getAttribute('data-ship');
    if (!shipName) return;
    try {
      const data = await fetchFleet();
      const ship = findShip(data, shipName);
      card.innerHTML = '';
      const h2 = document.createElement('h2');
      h2.id = 'diningHeading';
      h2.textContent = 'Dining on Board';
      card.appendChild(h2);

      if (!ship) {
        const p = document.createElement('p');
        p.textContent = 'Dining data not found for this ship.';
        card.appendChild(p);
        return;
      }
      const { included, premium } = getVenues(ship);

      const inc = document.createElement('section');
      const incH = document.createElement('h3');
      incH.textContent = 'Included';
      inc.appendChild(incH);
      inc.appendChild(renderList(included));

      const prem = document.createElement('section');
      const premH = document.createElement('h3');
      premH.textContent = 'Premium';
      prem.appendChild(premH);
      prem.appendChild(renderList(premium));

      card.appendChild(inc);
      card.appendChild(prem);
    } catch (err) {
      card.innerHTML = '<p class="tiny">Could not load dining venues. Check fleet_index.json path.</p>';
      console.error(err);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('#dining-card').forEach(initCard);
  });
})();
