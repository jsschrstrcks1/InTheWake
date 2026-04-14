/**
 * port-weather.js
 * Port Weather Fetcher Module
 * 
 * Version: 1.0.0
 * Last Updated: 2025-12-31
 * 
 * "The heavens declare the glory of God; the skies proclaim the work of his hands."
 * — Psalm 19:1
 * 
 * This module handles weather data fetching for port pages:
 *   - Open-Meteo API integration (coordinate-based, no API key required)
 *   - Client-side caching with configurable TTL
 *   - Graceful fallback to seasonal data
 *   - Unit conversion (°F/°C, mph/kph)
 *   - Accessibility-ready output
 * 
 * Usage:
 *   <div id="port-weather-widget" 
 *        data-port-id="cozumel" 
 *        data-lat="20.4230" 
 *        data-lon="-86.9223">
 *     <noscript>Seasonal weather info here...</noscript>
 *   </div>
 *   <script src="/assets/js/port-weather.js"></script>
 */

(function(window) {
  'use strict';

  // ============================================================================
  // CONFIGURATION
  // ============================================================================
  
  const CONFIG = {
    // Open-Meteo API endpoint
    apiBase: 'https://api.open-meteo.com/v1/forecast',
    
    // Cache settings
    cacheTTL: 30 * 60 * 1000,  // 30 minutes in milliseconds
    cachePrefix: 'itw_weather_',
    
    // Default units (can be overridden)
    defaultUnits: 'imperial',  // 'imperial' or 'metric'
    
    // Time buckets for 48-hour forecast
    bucketLabels: {
      todayPM: 'Today PM',
      tonight: 'Tonight',
      tomorrowAM: 'Tomorrow AM',
      tomorrowPM: 'Tomorrow PM',
      dayAfterAM: 'Day After AM',
      dayAfterPM: 'Day After PM'
    },
    
    // Weather code to icon mapping (WMO codes)
    weatherIcons: {
      0: { icon: '☀️', label: 'Clear' },
      1: { icon: '🌤️', label: 'Mainly clear' },
      2: { icon: '⛅', label: 'Partly cloudy' },
      3: { icon: '☁️', label: 'Overcast' },
      45: { icon: '🌫️', label: 'Fog' },
      48: { icon: '🌫️', label: 'Depositing rime fog' },
      51: { icon: '🌧️', label: 'Light drizzle' },
      53: { icon: '🌧️', label: 'Moderate drizzle' },
      55: { icon: '🌧️', label: 'Dense drizzle' },
      61: { icon: '🌧️', label: 'Slight rain' },
      63: { icon: '🌧️', label: 'Moderate rain' },
      65: { icon: '🌧️', label: 'Heavy rain' },
      66: { icon: '🌨️', label: 'Light freezing rain' },
      67: { icon: '🌨️', label: 'Heavy freezing rain' },
      71: { icon: '🌨️', label: 'Slight snow' },
      73: { icon: '🌨️', label: 'Moderate snow' },
      75: { icon: '❄️', label: 'Heavy snow' },
      77: { icon: '🌨️', label: 'Snow grains' },
      80: { icon: '🌦️', label: 'Slight showers' },
      81: { icon: '🌦️', label: 'Moderate showers' },
      82: { icon: '⛈️', label: 'Violent showers' },
      85: { icon: '🌨️', label: 'Slight snow showers' },
      86: { icon: '🌨️', label: 'Heavy snow showers' },
      95: { icon: '⛈️', label: 'Thunderstorm' },
      96: { icon: '⛈️', label: 'Thunderstorm with hail' },
      99: { icon: '⛈️', label: 'Thunderstorm with heavy hail' }
    },
    
    // Wind direction labels
    windDirections: ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 
                     'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  };

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================
  
  /**
   * Convert Celsius to Fahrenheit
   */
  function celsiusToFahrenheit(c) {
    return Math.round((c * 9/5) + 32);
  }
  
  /**
   * Convert km/h to mph
   */
  function kmhToMph(kmh) {
    return Math.round(kmh * 0.621371);
  }
  
  /**
   * Convert wind degrees to cardinal direction
   */
  function degreesToDirection(degrees) {
    const index = Math.round(degrees / 22.5) % 16;
    return CONFIG.windDirections[index];
  }
  
  /**
   * Get weather icon and label from WMO code
   */
  function getWeatherDisplay(code) {
    return CONFIG.weatherIcons[code] || { icon: '🌡️', label: 'Weather' };
  }
  
  /**
   * Format timestamp for display
   */
  function formatTimestamp(date) {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }
  
  /**
   * Get user's preferred units from localStorage or browser locale
   */
  function getPreferredUnits() {
    // Check localStorage first
    const stored = localStorage.getItem('itw_weather_units');
    if (stored === 'imperial' || stored === 'metric') {
      return stored;
    }
    
    // Auto-detect from locale
    const locale = navigator.language || 'en-US';
    const usesImperial = ['en-US', 'en-LR', 'en-MM'].some(l => locale.startsWith(l.split('-')[0]) && locale.includes(l.split('-')[1]));
    
    // US, Liberia, Myanmar use imperial; everyone else metric
    // But for cruise travelers, default to imperial (US-heavy audience)
    return CONFIG.defaultUnits;
  }
  
  /**
   * Save unit preference
   */
  function setPreferredUnits(units) {
    if (units === 'imperial' || units === 'metric') {
      localStorage.setItem('itw_weather_units', units);
    }
  }

  // ============================================================================
  // CACHE MANAGEMENT
  // ============================================================================
  
  /**
   * Get cached data if still valid
   */
  function getCache(portId) {
    try {
      const key = CONFIG.cachePrefix + portId;
      const cached = localStorage.getItem(key);
      if (!cached) return null;
      
      const data = JSON.parse(cached);
      const age = Date.now() - data.timestamp;
      
      if (age > CONFIG.cacheTTL) {
        localStorage.removeItem(key);
        return null;
      }
      
      return data;
    } catch (e) {
      return null;
    }
  }
  
  /**
   * Save data to cache
   */
  function setCache(portId, data) {
    try {
      const key = CONFIG.cachePrefix + portId;
      const cached = {
        timestamp: Date.now(),
        data: data
      };
      localStorage.setItem(key, JSON.stringify(cached));
    } catch (e) {
      // Storage full or disabled - continue without caching
      console.warn('[PortWeather] Cache write failed:', e);
    }
  }

  // ============================================================================
  // API FETCHING
  // ============================================================================
  
  /**
   * Fetch weather data from Open-Meteo
   */
  async function fetchWeather(lat, lon) {
    const params = new URLSearchParams({
      latitude: lat,
      longitude: lon,
      current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m',
      hourly: 'temperature_2m,weather_code,wind_speed_10m,precipitation_probability',
      forecast_days: 3,
      timezone: 'auto'
    });
    
    const url = `${CONFIG.apiBase}?${params}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }
    
    return response.json();
  }
  
  /**
   * Process raw API data into display-ready format
   */
  function processWeatherData(raw, units) {
    const isImperial = units === 'imperial';
    const now = new Date();
    
    // Current conditions
    const current = {
      temp: isImperial 
        ? celsiusToFahrenheit(raw.current.temperature_2m)
        : Math.round(raw.current.temperature_2m),
      feelsLike: isImperial
        ? celsiusToFahrenheit(raw.current.apparent_temperature)
        : Math.round(raw.current.apparent_temperature),
      humidity: raw.current.relative_humidity_2m,
      wind: {
        speed: isImperial
          ? kmhToMph(raw.current.wind_speed_10m)
          : Math.round(raw.current.wind_speed_10m),
        direction: degreesToDirection(raw.current.wind_direction_10m),
        unit: isImperial ? 'mph' : 'km/h'
      },
      weather: getWeatherDisplay(raw.current.weather_code),
      tempUnit: isImperial ? '°F' : '°C',
      timestamp: now
    };
    
    // Build 48-hour buckets
    const buckets = buildForecastBuckets(raw.hourly, now, isImperial);
    
    return {
      current,
      buckets,
      timezone: raw.timezone,
      fetchedAt: now
    };
  }
  
  /**
   * Build forecast buckets from hourly data
   */
  function buildForecastBuckets(hourly, now, isImperial) {
    const buckets = [];
    const currentHour = now.getHours();
    
    // Define bucket time ranges
    const bucketDefs = [
      { label: CONFIG.bucketLabels.todayPM, dayOffset: 0, startHour: 12, endHour: 18 },
      { label: CONFIG.bucketLabels.tonight, dayOffset: 0, startHour: 18, endHour: 24 },
      { label: CONFIG.bucketLabels.tomorrowAM, dayOffset: 1, startHour: 6, endHour: 12 },
      { label: CONFIG.bucketLabels.tomorrowPM, dayOffset: 1, startHour: 12, endHour: 18 },
      { label: CONFIG.bucketLabels.dayAfterAM, dayOffset: 2, startHour: 6, endHour: 12 },
      { label: CONFIG.bucketLabels.dayAfterPM, dayOffset: 2, startHour: 12, endHour: 18 }
    ];
    
    // Parse hourly times
    const hourlyTimes = hourly.time.map(t => new Date(t));
    
    for (const def of bucketDefs) {
      // Skip buckets that are in the past
      const bucketStart = new Date(now);
      bucketStart.setDate(bucketStart.getDate() + def.dayOffset);
      bucketStart.setHours(def.startHour, 0, 0, 0);
      
      if (bucketStart < now && def.dayOffset === 0) {
        // Skip past buckets for today
        continue;
      }
      
      // Find hourly data for this bucket
      const bucketHours = [];
      for (let i = 0; i < hourlyTimes.length; i++) {
        const hour = hourlyTimes[i];
        if (hour >= bucketStart) {
          const hourDate = hour.getDate() - now.getDate();
          const hourOfDay = hour.getHours();
          
          if (hourDate === def.dayOffset && 
              hourOfDay >= def.startHour && 
              hourOfDay < def.endHour) {
            bucketHours.push({
              temp: hourly.temperature_2m[i],
              weatherCode: hourly.weather_code[i],
              wind: hourly.wind_speed_10m[i],
              precipProb: hourly.precipitation_probability[i]
            });
          }
        }
      }
      
      if (bucketHours.length === 0) continue;
      
      // Aggregate bucket data
      const temps = bucketHours.map(h => h.temp);
      const winds = bucketHours.map(h => h.wind);
      const precipProbs = bucketHours.map(h => h.precipProb);
      
      // Use most common weather code
      const weatherCodes = bucketHours.map(h => h.weatherCode);
      const modeCode = weatherCodes.sort((a, b) =>
        weatherCodes.filter(v => v === a).length - weatherCodes.filter(v => v === b).length
      ).pop();
      
      buckets.push({
        label: def.label,
        temp: isImperial 
          ? celsiusToFahrenheit(Math.round((Math.min(...temps) + Math.max(...temps)) / 2))
          : Math.round((Math.min(...temps) + Math.max(...temps)) / 2),
        tempUnit: isImperial ? '°F' : '°C',
        weather: getWeatherDisplay(modeCode),
        wind: {
          speed: isImperial ? kmhToMph(Math.round(Math.max(...winds))) : Math.round(Math.max(...winds)),
          unit: isImperial ? 'mph' : 'km/h'
        },
        precipProb: Math.max(...precipProbs)
      });
      
      // Only show 4-5 buckets
      if (buckets.length >= 5) break;
    }
    
    return buckets;
  }

  // ============================================================================
  // UI RENDERING
  // ============================================================================
  
  /**
   * Render current conditions card
   */
  function renderCurrentConditions(data, container) {
    const html = `
      <div class="weather-current" role="region" aria-label="Current weather conditions">
        <div class="weather-current-header">
          <span class="weather-icon" aria-hidden="true">${data.weather.icon}</span>
          <span class="weather-temp">${data.temp}${data.tempUnit}</span>
          <span class="weather-feels">(feels like ${data.feelsLike}${data.tempUnit})</span>
        </div>
        <div class="weather-current-details">
          <span class="weather-condition">${data.weather.label}</span>
          <span class="weather-wind" aria-label="Wind">
            <span aria-hidden="true">💨</span> ${data.wind.speed} ${data.wind.unit} ${data.wind.direction}
          </span>
          <span class="weather-humidity" aria-label="Humidity">
            <span aria-hidden="true">💧</span> ${data.humidity}%
          </span>
        </div>
      </div>
    `;
    
    container.innerHTML = html;
  }
  
  /**
   * Render 48-hour forecast buckets
   */
  function renderForecastBuckets(buckets, container) {
    if (buckets.length === 0) {
      container.innerHTML = '<p class="weather-no-forecast">Forecast data unavailable</p>';
      return;
    }
    
    const bucketsHtml = buckets.map(bucket => `
      <div class="weather-bucket">
        <div class="bucket-label">${bucket.label}</div>
        <div class="bucket-icon" aria-hidden="true">${bucket.weather.icon}</div>
        <div class="bucket-temp">${bucket.temp}${bucket.tempUnit}</div>
        <div class="bucket-wind">
          <span aria-hidden="true">💨</span> ${bucket.wind.speed}
        </div>
        ${bucket.precipProb > 20 ? `<div class="bucket-precip"><span aria-hidden="true">🌧️</span> ${bucket.precipProb}%</div>` : ''}
      </div>
    `).join('');
    
    container.innerHTML = `
      <div class="weather-forecast-buckets" role="region" aria-label="48-hour forecast">
        <h4 class="weather-forecast-title">Next 48 Hours</h4>
        <div class="weather-buckets-grid">
          ${bucketsHtml}
        </div>
      </div>
    `;
  }
  
  /**
   * Render timestamp and attribution
   */
  function renderAttribution(fetchedAt, container) {
    const timeStr = formatTimestamp(fetchedAt);
    container.innerHTML = `
      <div class="weather-attribution">
        <span class="weather-updated">Updated ${timeStr}</span>
        <span class="weather-source">
          Weather data from <a href="https://open-meteo.com/" target="_blank" rel="noopener">Open-Meteo</a> (CC BY 4.0)
        </span>
      </div>
    `;
  }
  
  /**
   * Render unit toggle
   */
  function renderUnitToggle(currentUnits, container, onChange) {
    const html = `
      <div class="weather-unit-toggle" role="radiogroup" aria-label="Temperature units">
        <button type="button" 
                class="unit-btn ${currentUnits === 'imperial' ? 'active' : ''}"
                data-unit="imperial"
                aria-pressed="${currentUnits === 'imperial'}"
                aria-label="Fahrenheit">°F</button>
        <button type="button"
                class="unit-btn ${currentUnits === 'metric' ? 'active' : ''}"
                data-unit="metric"
                aria-pressed="${currentUnits === 'metric'}"
                aria-label="Celsius">°C</button>
      </div>
    `;
    
    container.innerHTML = html;
    
    // Add click handlers
    container.querySelectorAll('.unit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const newUnit = btn.dataset.unit;
        setPreferredUnits(newUnit);
        onChange(newUnit);
      });
    });
  }
  
  /**
   * Render error state
   */
  function renderError(message, container) {
    container.innerHTML = `
      <div class="weather-error" role="alert">
        <p>Unable to load current weather. ${message}</p>
        <p>See seasonal guide below for typical conditions.</p>
      </div>
    `;
  }
  
  /**
   * Render loading state
   */
  function renderLoading(container) {
    container.innerHTML = `
      <div class="weather-loading" aria-live="polite" aria-busy="true">
        <span class="loading-spinner" aria-hidden="true">⏳</span>
        <span>Loading weather data...</span>
      </div>
    `;
  }

  // ============================================================================
  // MAIN WIDGET CONTROLLER
  // ============================================================================
  
  class PortWeatherWidget {
    constructor(container) {
      this.container = container;
      this.portId = container.dataset.portId;
      this.lat = parseFloat(container.dataset.lat);
      this.lon = parseFloat(container.dataset.lon);
      this.portName = container.dataset.portName || this.portId;
      
      this.units = getPreferredUnits();
      this.rawData = null;
      
      // Create sub-containers
      this.setupDOM();
    }
    
    setupDOM() {
      // Preserve noscript content
      const noscript = this.container.querySelector('noscript');
      
      // Create structure
      this.container.innerHTML = `
        <div class="weather-widget-inner">
          <div class="weather-header">
            <h3 class="weather-title">🌡️ Right Now in ${this.portName}</h3>
            <div class="weather-controls"></div>
          </div>
          <div class="weather-current-container"></div>
          <div class="weather-forecast-container"></div>
          <div class="weather-attribution-container"></div>
        </div>
      `;
      
      // Re-add noscript for graceful degradation
      if (noscript) {
        this.container.appendChild(noscript);
      }
      
      // Cache DOM references
      this.currentContainer = this.container.querySelector('.weather-current-container');
      this.forecastContainer = this.container.querySelector('.weather-forecast-container');
      this.attributionContainer = this.container.querySelector('.weather-attribution-container');
      this.controlsContainer = this.container.querySelector('.weather-controls');
    }
    
    async init() {
      // Render unit toggle
      renderUnitToggle(this.units, this.controlsContainer, (newUnit) => {
        this.units = newUnit;
        if (this.rawData) {
          this.render(processWeatherData(this.rawData, this.units));
        }
      });
      
      // Check cache first
      const cached = getCache(this.portId);
      if (cached) {
        this.rawData = cached.data;
        const processed = processWeatherData(cached.data, this.units);
        processed.fetchedAt = new Date(cached.timestamp);
        this.render(processed);
        return;
      }
      
      // Fetch fresh data
      renderLoading(this.currentContainer);
      
      try {
        this.rawData = await fetchWeather(this.lat, this.lon);
        setCache(this.portId, this.rawData);
        const processed = processWeatherData(this.rawData, this.units);
        this.render(processed);
      } catch (error) {
        console.error('[PortWeather] Fetch failed:', error);
        renderError('Please check your connection.', this.currentContainer);
        this.forecastContainer.innerHTML = '';
      }
    }
    
    render(data) {
      renderCurrentConditions(data.current, this.currentContainer);
      renderForecastBuckets(data.buckets, this.forecastContainer);
      renderAttribution(data.fetchedAt, this.attributionContainer);
    }
  }

  // ============================================================================
  // AUTO-INITIALIZATION
  // ============================================================================
  
  function initAllWidgets() {
    const widgets = document.querySelectorAll('#port-weather-widget, [data-port-weather]');
    
    widgets.forEach(container => {
      if (!container.dataset.lat || !container.dataset.lon) {
        console.warn('[PortWeather] Widget missing lat/lon:', container);
        return;
      }
      
      const widget = new PortWeatherWidget(container);
      widget.init();
    });
  }
  
  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllWidgets);
  } else {
    initAllWidgets();
  }
  
  // Export for programmatic use
  window.PortWeather = {
    Widget: PortWeatherWidget,
    init: initAllWidgets,
    getPreferredUnits,
    setPreferredUnits,
    CONFIG
  };

})(window);
