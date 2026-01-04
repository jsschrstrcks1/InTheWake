/**
 * Port Weather Widget Loader
 * Version: 1.0.0 assets/js/port-weather.js
 *
 * Loads and renders weather data for port pages.
 * Requires: weather.js module, port data attributes on container.
 */

// Escape HTML to prevent XSS (module-level for use by all functions)
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = String(text);
  return div.innerHTML;
}

(async function() {
  'use strict';

  // Find the weather container
  const container = document.getElementById('port-weather-widget');
  if (!container) return;

  // Get port data from container attributes
  const portId = container.dataset.portId;
  const lat = parseFloat(container.dataset.lat);
  const lon = parseFloat(container.dataset.lon);
  const portName = container.dataset.portName || 'this port';

  if (!portId || isNaN(lat) || isNaN(lon)) {
    console.warn('Port weather: Missing required data attributes');
    return;
  }

  // Show loading state
  container.innerHTML = `
    <div class="weather-loading">
      <span class="weather-loading-spinner"></span>
      Loading weather for ${escapeHtml(portName)}...
    </div>
  `;

  try {
    // Dynamically import the weather module
    const { weather } = await import('./modules/weather.js');

    // Fetch weather and seasonal data in parallel
    const [weatherData, seasonalRes, defaultsRes] = await Promise.all([
      weather.getWeather(lat, lon, portId),
      fetch('/assets/data/ports/seasonal-guides.json').then(r => r.json()).catch(() => null),
      fetch('/assets/data/ports/regional-climate-defaults.json').then(r => r.json()).catch(() => null)
    ]);

    // Get port-specific or regional seasonal data
    const region = container.dataset.region || 'Caribbean';
    const seasonalData = seasonalRes?.[portId] || null;
    const regionalDefaults = defaultsRes?.[region] || null;

    // Render the widget
    renderWeatherWidget(container, weatherData, seasonalData, regionalDefaults, weather, portName);

  } catch (err) {
    console.error('Port weather error:', err);
    container.innerHTML = `
      <div class="weather-error">
        <p>Weather data temporarily unavailable.</p>
      </div>
    `;
  }
})();

/**
 * Render the complete weather widget
 */
function renderWeatherWidget(container, weatherData, seasonalData, regionalDefaults, weather, portName) {
  if (weatherData.error) {
    container.innerHTML = `
      <div class="weather-error">
        <p>${escapeHtml(weatherData.error)}</p>
      </div>
    `;
    return;
  }

  const { current, forecast, bestWindow, attribution, attributionUrl } = weatherData;

  // Get seasonal comparison
  const effectiveSeasonalData = seasonalData || regionalDefaults;
  const seasonalComparison = effectiveSeasonalData
    ? weather.getSeasonalComparison(current, effectiveSeasonalData)
    : null;

  // Determine tier label for display
  const tierLabel = seasonalData
    ? null
    : (regionalDefaults?.label || null);

  // Build the seasonal guide HTML
  const seasonalGuideHtml = renderSeasonalGuide(effectiveSeasonalData, portName);

  // Build HTML
  let html = `
    <div class="weather-widget">
      <!-- Current Conditions -->
      <div class="weather-current">
        <div class="weather-current-main">
          <span class="weather-icon-large">${escapeHtml(current.icon)}</span>
          <div class="weather-temp-block">
            <span class="weather-temp-primary">${escapeHtml(current.temp)}</span>
            <span class="weather-feels-like">Feels like ${escapeHtml(current.feelsLike)}</span>
          </div>
        </div>
        <div class="weather-current-details">
          <div class="weather-detail">
            <span class="weather-detail-label">Condition</span>
            <span class="weather-detail-value">${escapeHtml(current.condition)}</span>
          </div>
          <div class="weather-detail">
            <span class="weather-detail-label">Wind</span>
            <span class="weather-detail-value">${escapeHtml(current.windSpeed)} ${escapeHtml(current.windDirection)}</span>
          </div>
          <div class="weather-detail">
            <span class="weather-detail-label">Humidity</span>
            <span class="weather-detail-value">${escapeHtml(current.humidity)}%</span>
          </div>
        </div>
      </div>

      ${seasonalComparison ? `
      <div class="weather-seasonal-comparison">
        ${seasonalComparison}
      </div>
      ` : ''}

      ${bestWindow ? `
      <div class="weather-best-window">
        <strong>Calmest window:</strong> ${escapeHtml(bestWindow.label)}
        (${escapeHtml(bestWindow.precipChance)}% rain, ${escapeHtml(bestWindow.wind)} wind)
        <span class="weather-hint">— forecast-based</span>
      </div>
      ` : ''}

      <!-- 48-Hour Forecast -->
      ${forecast.length > 0 ? `
      <div class="weather-forecast">
        <h4 class="weather-forecast-title">Next 48 Hours</h4>
        <div class="weather-forecast-grid">
          ${forecast.map(bucket => `
            <div class="weather-forecast-bucket">
              <div class="weather-bucket-label">${escapeHtml(bucket.label)}</div>
              <div class="weather-bucket-icon">${escapeHtml(bucket.icon)}</div>
              <div class="weather-bucket-temp">${escapeHtml(bucket.tempHigh)}</div>
              <div class="weather-bucket-details">
                <span class="weather-bucket-precip">${escapeHtml(bucket.precipChance)}% rain</span>
                <span class="weather-bucket-wind">${escapeHtml(bucket.windAvg)}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}

      <!-- Unit Toggle -->
      <div class="weather-controls">
        <button type="button" class="weather-unit-toggle" data-unit="imperial"
                ${weather.getUnitSystem() === 'imperial' ? 'aria-pressed="true"' : ''}>°F</button>
        <button type="button" class="weather-unit-toggle" data-unit="metric"
                ${weather.getUnitSystem() === 'metric' ? 'aria-pressed="true"' : ''}>°C</button>
      </div>

      <!-- Attribution (required) -->
      <div class="weather-attribution">
        <span class="weather-updated">Updated ${escapeHtml(formatTimeAgo(current.time))}</span>
        · <a href="${escapeHtml(attributionUrl)}" target="_blank" rel="noopener">${escapeHtml(attribution)}</a>
        ${tierLabel ? `· <span class="weather-tier-label">${escapeHtml(tierLabel)}</span>` : ''}
      </div>

      ${weatherData.warning ? `
      <div class="weather-warning">
        ${escapeHtml(weatherData.warning)}
      </div>
      ` : ''}
    </div>

    <!-- Seasonal Guide Section -->
    ${seasonalGuideHtml}
  `;

  container.innerHTML = html;

  // Add event listeners for unit toggle
  container.querySelectorAll('.weather-unit-toggle').forEach(btn => {
    btn.addEventListener('click', async () => {
      const newUnit = btn.dataset.unit;
      weather.setUnitSystem(newUnit);

      // Re-render with new units
      const newData = await weather.getWeather(
        parseFloat(container.dataset.lat),
        parseFloat(container.dataset.lon),
        container.dataset.portId
      );
      renderWeatherWidget(container, newData, seasonalData, regionalDefaults, weather, portName);
    });
  });
}

/**
 * Format time as "X minutes ago"
 */
function formatTimeAgo(timeString) {
  if (!timeString) return 'just now';

  const time = new Date(timeString);
  const now = new Date();
  const diffMs = now - time;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'just now';
  if (diffMins === 1) return '1 minute ago';
  if (diffMins < 60) return `${diffMins} minutes ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours === 1) return '1 hour ago';
  return `${diffHours} hours ago`;
}

/**
 * Render the seasonal guide section with collapsible details
 */
function renderSeasonalGuide(seasonalData, portName) {
  if (!seasonalData) return '';

  let html = '<div class="seasonal-guide">';

  // At a Glance section (for Tier 1 ports with detailed data) - expanded by default
  if (seasonalData.at_a_glance) {
    const glance = seasonalData.at_a_glance;
    html += `
      <details class="seasonal-section" open>
        <summary class="seasonal-section-title">At a Glance</summary>
        <div class="seasonal-at-glance">
          <div class="seasonal-glance-grid">
            ${glance.temp_range ? `<div class="seasonal-glance-item"><span class="glance-label">Temperature</span><span class="glance-value">${escapeHtml(glance.temp_range)}</span></div>` : ''}
            ${glance.humidity ? `<div class="seasonal-glance-item"><span class="glance-label">Humidity</span><span class="glance-value">${escapeHtml(glance.humidity)}</span></div>` : ''}
            ${glance.rain ? `<div class="seasonal-glance-item"><span class="glance-label">Rain</span><span class="glance-value">${escapeHtml(glance.rain)}</span></div>` : ''}
            ${glance.wind ? `<div class="seasonal-glance-item"><span class="glance-label">Wind</span><span class="glance-value">${escapeHtml(glance.wind)}</span></div>` : ''}
            ${glance.daylight ? `<div class="seasonal-glance-item"><span class="glance-label">Daylight</span><span class="glance-value">${escapeHtml(glance.daylight)}</span></div>` : ''}
          </div>
        </div>
      </details>
    `;
  }

  // Fallback for regional defaults (typical_temp_f, humidity, rain_pattern)
  if (!seasonalData.at_a_glance && (seasonalData.typical_temp_f || seasonalData.humidity || seasonalData.rain_pattern)) {
    html += `
      <details class="seasonal-section" open>
        <summary class="seasonal-section-title">At a Glance</summary>
        <div class="seasonal-at-glance">
          <div class="seasonal-glance-grid">
            ${seasonalData.typical_temp_f ? `<div class="seasonal-glance-item"><span class="glance-label">Typical Temp</span><span class="glance-value">${escapeHtml(seasonalData.typical_temp_f)}°F</span></div>` : ''}
            ${seasonalData.humidity ? `<div class="seasonal-glance-item"><span class="glance-label">Humidity</span><span class="glance-value">${escapeHtml(seasonalData.humidity)}</span></div>` : ''}
            ${seasonalData.rain_pattern ? `<div class="seasonal-glance-item"><span class="glance-label">Rain</span><span class="glance-value">${escapeHtml(seasonalData.rain_pattern)}</span></div>` : ''}
          </div>
        </div>
      </details>
    `;
  }

  // Best Time to Visit section - expanded by default
  if (seasonalData.cruise_seasons || seasonalData.best_months_for) {
    html += `<details class="seasonal-section" open>`;
    html += `<summary class="seasonal-section-title">Best Time to Visit</summary>`;
    html += `<div class="seasonal-best-time">`;

    // Cruise seasons (high/transitional/low)
    if (seasonalData.cruise_seasons) {
      const seasons = seasonalData.cruise_seasons;
      html += `
        <div class="cruise-seasons-grid">
          ${seasons.high?.length ? `<div class="cruise-season cruise-season-high"><span class="season-label">Peak Season</span><span class="season-months">${escapeHtml(seasons.high.join(', '))}</span></div>` : ''}
          ${seasons.transitional?.length ? `<div class="cruise-season cruise-season-transitional"><span class="season-label">Transitional Season</span><span class="season-months">${escapeHtml(seasons.transitional.join(', '))}</span></div>` : ''}
          ${seasons.low?.length ? `<div class="cruise-season cruise-season-low"><span class="season-label">Low Season</span><span class="season-months">${escapeHtml(seasons.low.join(', '))}</span></div>` : ''}
        </div>
      `;
    }

    // Best months for specific activities (Tier 1 only)
    if (seasonalData.best_months_for) {
      const activities = seasonalData.best_months_for;
      html += `<div class="best-months-activities">`;
      for (const [activity, months] of Object.entries(activities)) {
        if (months?.length) {
          const activityLabel = activity.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
          html += `
            <div class="activity-row">
              <span class="activity-label">${escapeHtml(activityLabel)}</span>
              <span class="activity-months">${escapeHtml(months.join(', '))}</span>
            </div>
          `;
        }
      }
      html += `</div>`;
    }

    // Months to avoid
    if (seasonalData.avoid_months?.length) {
      html += `
        <div class="months-to-avoid">
          <span class="avoid-label">Consider avoiding:</span>
          <span class="avoid-months">${escapeHtml(seasonalData.avoid_months.join(', '))}</span>
          ${seasonalData.hazards?.peak_risk_months ? `<span class="avoid-reason">(hurricane risk)</span>` : ''}
        </div>
      `;
    }

    html += `</div></details>`;
  }

  // What Catches People Off Guard - collapsible
  if (seasonalData.catches_off_guard?.length) {
    html += `
      <details class="seasonal-section">
        <summary class="seasonal-section-title">What Catches Visitors Off Guard</summary>
        <div class="seasonal-catches">
          <ul class="catches-list">
            ${seasonalData.catches_off_guard.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
          </ul>
        </div>
      </details>
    `;
  }

  // Packing Nudges - collapsible
  if (seasonalData.packing_nudges?.length) {
    html += `
      <details class="seasonal-section">
        <summary class="seasonal-section-title">Packing Tips</summary>
        <div class="seasonal-packing">
          <ul class="packing-list">
            ${seasonalData.packing_nudges.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
          </ul>
        </div>
      </details>
    `;
  }

  // Hazard Warnings - expanded by default (important info)
  if (seasonalData.hazards?.hurricane_zone) {
    const hazards = seasonalData.hazards;
    html += `
      <details class="seasonal-section" open>
        <summary class="seasonal-section-title">Weather Hazards</summary>
        <div class="seasonal-hazards">
          <div class="hazard-warning">
            <span class="hazard-icon">⚠️</span>
            <div class="hazard-content">
              <strong>Hurricane Zone</strong>
              ${hazards.hurricane_season ? `<p>Season: ${escapeHtml(hazards.hurricane_season)}</p>` : ''}
              ${hazards.peak_risk_months?.length ? `<p>Peak risk: ${escapeHtml(hazards.peak_risk_months.join(', '))}</p>` : ''}
              ${hazards.note ? `<p class="hazard-note">${escapeHtml(hazards.note)}</p>` : ''}
            </div>
          </div>
        </div>
      </details>
    `;
  }

  html += '</div>';

  return html;
}
