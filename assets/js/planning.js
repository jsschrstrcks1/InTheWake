/**
 * Planning Page Runtime
 * Renders interactive state/port selector from inline JSON dataset
 * Soli Deo Gloria
 */

(function() {
  'use strict';

  // Parse the dataset
  const dataEl = document.getElementById('planning-dataset');
  if (!dataEl) return;

  let data;
  try {
    data = JSON.parse(dataEl.textContent);
  } catch(e) {
    console.error('Failed to parse planning dataset:', e);
    return;
  }

  const ports = data.ports || [];
  if (!ports.length) return;

  // Group ports by state/country
  const byRegion = {};
  ports.forEach(port => {
    const key = port.country === 'USA' ? port.state_full : port.country;
    if (!byRegion[key]) byRegion[key] = [];
    byRegion[key].push(port);
  });

  // Get containers
  const stateButtonsEl = document.getElementById('state-buttons');
  const portButtonsEl = document.getElementById('port-buttons');
  const portPanelEl = document.getElementById('port-panel');
  const portBlurbEl = document.getElementById('port-blurb');
  const airportsEl = document.getElementById('airports');
  const warningsEl = document.getElementById('warnings');
  const qaEl = document.getElementById('qa');
  const schoolBreaksEl = document.getElementById('school-breaks');
  const spaceCoastEl = document.getElementById('space-coast-section');

  if (!stateButtonsEl || !portButtonsEl || !portPanelEl) return;

  // Render state buttons
  const regions = Object.keys(byRegion).sort();
  stateButtonsEl.innerHTML = regions.map(region =>
    `<button class="pill" data-region="${region}">${region}</button>`
  ).join('');

  // Render school breaks info (always visible)
  if (schoolBreaksEl) {
    const signals = data.signals || {};
    const spring = signals.spring_break || {};
    const fall = signals.fall_break || {};
    const busy = signals.busy_days || [];

    schoolBreaksEl.innerHTML = `
      <p><strong>School Break Peaks:</strong></p>
      <ul>
        ${spring.window ? `<li><strong>Spring Break:</strong> ${spring.window} ${spring.notes ? `<span class="muted">(${spring.notes})</span>` : ''}</li>` : ''}
        ${fall.window ? `<li><strong>Fall Break:</strong> ${fall.window} ${fall.notes ? `<span class="muted">(${fall.notes})</span>` : ''}</li>` : ''}
        ${busy.length ? `<li><strong>Peak Days:</strong> ${busy.slice(0, 6).join(', ')}${busy.length > 6 ? ', and more' : ''}</li>` : ''}
      </ul>
      ${signals.disclaimer ? `<p class="muted tiny">${signals.disclaimer}</p>` : ''}
    `;
  }

  // Handle state button clicks
  stateButtonsEl.addEventListener('click', e => {
    if (e.target.tagName !== 'BUTTON') return;

    const region = e.target.dataset.region;
    const regionPorts = byRegion[region] || [];

    // Highlight selected state
    [...stateButtonsEl.querySelectorAll('button')].forEach(btn =>
      btn.classList.toggle('active', btn.dataset.region === region)
    );

    // Render port buttons for this region
    portButtonsEl.innerHTML = regionPorts.map(port =>
      `<button class="pill" data-slug="${port.slug}">${port.city}</button>`
    ).join('');

    // Hide port panel until a port is selected
    portPanelEl.style.display = 'none';
  });

  // Handle port button clicks
  portButtonsEl.addEventListener('click', e => {
    if (e.target.tagName !== 'BUTTON') return;

    const slug = e.target.dataset.slug;
    const port = ports.find(p => p.slug === slug);
    if (!port) return;

    // Highlight selected port
    [...portButtonsEl.querySelectorAll('button')].forEach(btn =>
      btn.classList.toggle('active', btn.dataset.slug === slug)
    );

    // Render port details
    renderPortDetails(port);

    // Show port panel
    portPanelEl.style.display = 'block';

    // Show Space Coast section if Port Canaveral
    if (spaceCoastEl) {
      spaceCoastEl.style.display = (slug === 'port-canaveral') ? 'block' : 'none';
    }
  });

  function renderPortDetails(port) {
    // Port blurb
    if (portBlurbEl && port.blurb) {
      portBlurbEl.innerHTML = port.blurb.map(p => `<p>${p}</p>`).join('');
    }

    // Airports
    if (airportsEl && port.airports) {
      airportsEl.innerHTML = port.airports.map(apt => `
        <div class="airport-card">
          <div class="airport-header">
            <strong>${apt.code}</strong> — ${apt.name}
          </div>
          <div class="tiny muted">
            <div>${apt.distance_miles} miles • ${apt.typical_drive}</div>
            ${apt.notes ? `<div>${apt.notes}</div>` : ''}
          </div>
        </div>
      `).join('');
    }

    // Warnings/Cautions
    if (warningsEl && port.warnings) {
      warningsEl.innerHTML = port.warnings.map(w =>
        `<li>${w}</li>`
      ).join('');
    }

    // Q&A
    if (qaEl && port.qa) {
      qaEl.innerHTML = port.qa.map(item => `
        <div class="qa-item">
          <p><strong>Q: ${item.q}</strong></p>
          <p class="tiny">${item.a}</p>
        </div>
      `).join('');
    }
  }

  // Add CSS for active state
  const style = document.createElement('style');
  style.textContent = `
    .pill.active {
      background: #0e6e8e;
      color: white;
      border-color: #0e6e8e;
    }
    .airport-card {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 0.75rem;
      margin-bottom: 0.5rem;
    }
    .airport-header {
      margin-bottom: 0.25rem;
    }
    .qa-item {
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #f0f0f0;
    }
    .qa-item:last-child {
      border-bottom: none;
    }
    .grid-airports {
      display: grid;
      gap: 0.75rem;
      margin-top: 0.5rem;
    }
  `;
  document.head.appendChild(style);

  // Hide port panel initially
  portPanelEl.style.display = 'none';
})();
