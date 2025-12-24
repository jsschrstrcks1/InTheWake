/**
 * Planning Page Runtime
 * Restored original implementation with all features
 * Soli Deo Gloria
 */

(function() {
  'use strict';

  const dataEl = document.getElementById('planning-dataset');
  if (!dataEl) return;

  // JSONC parser - handles comments in JSON
  function parseJSONC(txt) {
    const noBlock = txt.replace(/\/\*[\s\S]*?\*\//g, '');
    const noLine = noBlock.replace(/(^|[^:\\])\/\/.*$/gm, '$1');
    return JSON.parse(noLine);
  }

  let data = {};
  try {
    data = parseJSONC(dataEl.textContent || '{}');
  } catch(e) {
    console.error('Planning dataset parse error:', e);
    data = { ports: [], signals: {} };
  }

  const stateBtns = document.getElementById('state-buttons');
  const portBtns = document.getElementById('port-buttons');
  const blurb = document.getElementById('port-blurb');
  const airports = document.getElementById('airports');
  const warns = document.getElementById('warnings');
  const qaMount = document.getElementById('qa');
  const seasonal = document.getElementById('seasonal-banner');
  const breaksEl = document.getElementById('school-breaks');

  const STATE_NAMES = {
    AL: 'Alabama',
    CA: 'California',
    FL: 'Florida',
    LA: 'Louisiana',
    MD: 'Maryland',
    MA: 'Massachusetts',
    NJ: 'New Jersey',
    PR: 'Puerto Rico',
    TX: 'Texas',
    WA: 'Washington',
    BC: 'British Columbia',
    NSW: 'New South Wales',
    QLD: 'Queensland',
    VIC: 'Victoria'
  };

  // Group ports by state/country
  function group() {
    const by = new Map();
    (data.ports || []).forEach(p => {
      const label = p.country && p.country !== 'USA'
        ? p.country
        : (p.state_full || STATE_NAMES[p.state] || p.state || '—');
      if (!by.has(label)) by.set(label, []);
      by.get(label).push(p);
    });
    for (const [k, list] of by) {
      list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }
    return by;
  }
  const byRegion = group();

  // HTML escaping for security
  function E(s) {
    return String(s || '').replace(/[&<>"]/g, c => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;'
    }[c]));
  }

  // Create button with accessibility
  function button(label, current, onclick) {
    const a = document.createElement('a');
    a.href = '#';
    a.textContent = label;
    if (current) a.setAttribute('aria-current', 'true');
    a.addEventListener('click', e => {
      e.preventDefault();
      onclick && onclick();
    });
    return a;
  }

  function renderStateButtons(active) {
    stateBtns.innerHTML = '';
    Array.from(byRegion.keys())
      .sort((a, b) => (a === 'Florida' ? -1 : b === 'Florida' ? 1 : a.localeCompare(b)))
      .forEach(label => stateBtns.appendChild(button(label, label === active, () => selectState(label))));
  }

  function renderPortButtons(list, activeSlug) {
    portBtns.innerHTML = '';
    list.forEach(p => portBtns.appendChild(button(p.name, p.slug === activeSlug, () => selectPort(p.slug))));
  }

  function renderBreaks() {
    const s = data.signals || {};
    const parts = [
      `<strong>Spring Break:</strong> ${E(s.spring_break?.window || 'varies')} — ${E(s.spring_break?.notes || '')}`,
      `<strong>Fall Break:</strong> ${E(s.fall_break?.window || 'varies')} — ${E(s.fall_break?.notes || '')}`,
      s.busy_days?.length ? `<strong>Also Busy:</strong> ${s.busy_days.join(', ')}` : ''
    ].filter(Boolean);
    breaksEl.innerHTML = parts.map(x => `<div>${x}</div>`).join('') +
      (s.disclaimer ? `<div class="tiny muted" style="margin-top:.35rem">${E(s.disclaimer)}</div>` : '');
  }

  function renderPort(p) {
    blurb.innerHTML = (p.blurb || []).map(par => `<p>${E(par)}</p>`).join('') || `<p>${E(p.name)} — ${E(p.city)}</p>`;
    const sig = data.signals || {};
    seasonal.style.display = '';

    // Build seasonal message
    let seasonalMsg = `<strong>Heads-up:</strong> Spring Break (${E(sig.spring_break?.window || 'varies')}) and Fall Break (${E(sig.fall_break?.window || 'varies')}). ${E(sig.spring_break?.notes || '')}`;

    // World Cup 2026 message for Seattle (expires after July 19, 2026)
    const worldCupEnd = new Date('2026-07-20');
    if (p.slug === 'seattle' && new Date() < worldCupEnd) {
      seasonalMsg += `<br><strong>⚽ FIFA World Cup 2026:</strong> Seattle hosts matches June 11 – July 19, 2026. Expect surging hotel rates, downtown traffic, and packed flights. Book early or consider sailing before/after the tournament.`;
    }

    seasonal.innerHTML = seasonalMsg;

    // Show Space Coast section only for ports near spaceports (FL, TX, CA)
    const spaceSection = document.getElementById('space-coast-section');
    if (spaceSection) {
      const spaceportStates = ['FL', 'TX', 'CA'];
      spaceSection.style.display = spaceportStates.includes(p.state) ? '' : 'none';
    }

    airports.innerHTML = (p.airports || []).map(a => `
      <div class="airport">
        <div><span class="code">${E(a.code)}</span> — ${E(a.name)}</div>
        <div class="tiny">${E(a.distance_miles)} mi · ${E(a.typical_drive || a.typical_drive_minutes || '—')}</div>
        ${a.notes ? `<div class="tiny muted">${E(a.notes)}</div>` : ''}
      </div>`).join('') || `<div class="tiny muted">No airport data.</div>`;

    warns.innerHTML = (p.warnings || []).map(w => `<li>${E(w)}</li>`).join('') || `<li class="tiny muted">No special cautions.</li>`;

    // Lodging/hotels
    const hotels = Array.isArray(p.lodging) ? p.lodging : [];
    const old = document.getElementById('lodging-block');
    if (old) old.remove();
    if (hotels.length) {
      const lodgingHTML = `
        <div id="lodging-block">
          <h3 style="margin-top:1rem">Where to Stay</h3>
          <ul class="tiny">
            ${hotels.map(h => `<li><a href="${E(h.url)}" rel="noopener external" target="_blank">${E(h.name)}</a>${h.notes ? ` — ${E(h.notes)}` : ''}</li>`).join('')}
          </ul>
        </div>`;
      const qaEl = document.getElementById('qa');
      if (qaEl) qaEl.insertAdjacentHTML('beforebegin', lodgingHTML);
    }

    qaMount.innerHTML = (p.qa || []).map(q => `<details class="qa"><summary>${E(q.q)}</summary><div class="tiny">${E(q.a)}</div></details>`).join('') || `<p class="tiny muted">No questions yet.</p>`;
  }

  // Selection logic with auto-selection
  let currentLabel = byRegion.has('Florida') ? 'Florida' : Array.from(byRegion.keys())[0] || '';
  let currentSlug = (byRegion.get(currentLabel) || [])[0]?.slug || '';

  function selectState(label) {
    currentLabel = label;
    const list = byRegion.get(label) || [];
    currentSlug = list[0]?.slug || '';
    renderStateButtons(currentLabel);
    renderPortButtons(list, currentSlug);
    if (list[0]) renderPort(list[0]);
  }

  function selectPort(slug) {
    currentSlug = slug;
    const list = byRegion.get(currentLabel) || [];
    renderPortButtons(list, currentSlug);
    const p = list.find(x => x.slug === slug);
    if (p) renderPort(p);
  }

  // Initialize - auto-select Florida and first port
  renderBreaks();
  renderStateButtons(currentLabel);
  selectState(currentLabel);
  selectPort(currentSlug);
})();
