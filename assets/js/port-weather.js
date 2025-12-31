/**
 * Port Weather Widget Loader
 * Version: 1.0.0 assets/js/port-weather.js
 *
 * Loads and renders weather data for port pages.
 * Requires: weather.js module, port data attributes on container.
 */

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
      Loading weather for ${portName}...
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
        <p>${weatherData.error}</p>
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

  // Build HTML
  let html = `
    <div class="weather-widget">
      <!-- Current Conditions -->
      <div class="weather-current">
        <div class="weather-current-main">
          <span class="weather-icon-large">${current.icon}</span>
          <div class="weather-temp-block">
            <span class="weather-temp-primary">${current.temp}</span>
            <span class="weather-feels-like">Feels like ${current.feelsLike}</span>
          </div>
        </div>
        <div class="weather-current-details">
          <div class="weather-detail">
            <span class="weather-detail-label">Condition</span>
            <span class="weather-detail-value">${current.condition}</span>
          </div>
          <div class="weather-detail">
            <span class="weather-detail-label">Wind</span>
            <span class="weather-detail-value">${current.windSpeed} ${current.windDirection}</span>
          </div>
          <div class="weather-detail">
            <span class="weather-detail-label">Humidity</span>
            <span class="weather-detail-value">${current.humidity}%</span>
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
        <strong>Calmest window:</strong> ${bestWindow.label}
        (${bestWindow.precipChance}% rain, ${bestWindow.wind} wind)
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
              <div class="weather-bucket-label">${bucket.label}</div>
              <div class="weather-bucket-icon">${bucket.icon}</div>
              <div class="weather-bucket-temp">${bucket.tempHigh}</div>
              <div class="weather-bucket-details">
                <span class="weather-bucket-precip">${bucket.precipChance}% rain</span>
                <span class="weather-bucket-wind">${bucket.windAvg}</span>
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
        <span class="weather-updated">Updated ${formatTimeAgo(current.time)}</span>
        · <a href="${attributionUrl}" target="_blank" rel="noopener">${attribution}</a>
        ${tierLabel ? `· <span class="weather-tier-label">${tierLabel}</span>` : ''}
      </div>

      ${weatherData.warning ? `
      <div class="weather-warning">
        ${weatherData.warning}
      </div>
      ` : ''}
    </div>
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
