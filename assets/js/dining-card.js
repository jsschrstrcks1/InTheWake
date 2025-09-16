
/**
 * Dining Venues Card
 * - Reads /assets/data/fleet_index.json (one source of truth)
 * - Expects a container: <section id="dining-card" class="card" data-ship="Grandeur of the Seas"></section>
 * - Renders two lists: Included (complimentary) and Premium (extra fee)
 * - No extra CSS; uses existing .card, .btn, and typography from styles.css
 */
(async function renderDiningCard(){
  const container = document.getElementById('dining-card');
  if(!container) return;
  const shipName = container.getAttribute('data-ship') || '';
  try{
    const res = await fetch('/assets/data/fleet_index.json', {cache: 'no-store'});
    if(!res.ok) throw new Error('Failed to load fleet_index.json');
    const data = await res.json();
    // Expect structure: data.royal_caribbean[shipName] = { included:[], premium:[] } OR similar
    // Support flexible shapes
    const rcl = data.royal_caribbean || data.RCL || data.rccl || {};
    const ship = rcl[shipName] || rcl[shipName.toLowerCase()] || null;
    if(!ship){
      container.innerHTML = `<h2>Dining on ${shipName}</h2><p class="muted">We’re updating this menu mapping. Check back soon.</p>`;
      return;
    }
    const included = ship.included || ship.free || ship.complimentary || [];
    const premium = ship.premium || ship.extra_fee || [];

    const makeList = (arr) => {
      if(!arr || !arr.length) return '<p class="muted">None listed.</p>';
      return `<ul>${arr.map(r => {
        const name = (typeof r === 'string') ? r : (r.name || '');
        const url = (typeof r === 'object' && r.url) ? r.url : null;
        return `<li>${url ? `<a href="${url}">${name}</a>` : name}</li>`;
      }).join('')}</ul>`;
    };

    container.innerHTML = `
      <h2 id="diningHeading">Dining on ${shipName}</h2>
      <div role="region" aria-labelledby="diningHeading">
        <h3 style="margin-bottom:.35rem">Included</h3>
        ${makeList(included)}
        <h3 style="margin-top:.75rem;margin-bottom:.35rem">Premium</h3>
        ${makeList(premium)}
      </div>
      <p class="tiny" style="margin-top:.5rem">Source of truth: fleet_index.json</p>
    `;
  }catch(err){
    container.innerHTML = `<h2>Dining on ${shipName}</h2><p class="muted">Couldn’t load dining data.</p>`;
  }
})();
