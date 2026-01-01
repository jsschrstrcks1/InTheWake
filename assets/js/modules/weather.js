/**
 * Weather Module - Open-Meteo API Integration
 * Version: 1.0.0 assets/js/modules/weather.js
 *
 * Provides current conditions and 48-hour forecast for cruise ports.
 * Uses Open-Meteo free API (CC BY 4.0 - attribution required).
 */

import SafeStorage from './storage.js';

// Weather code descriptions (WMO codes)
const WEATHER_CODES = {
  0: { desc: 'Clear sky', icon: '☀️' },
  1: { desc: 'Mainly clear', icon: '🌤️' },
  2: { desc: 'Partly cloudy', icon: '⛅' },
  3: { desc: 'Overcast', icon: '☁️' },
  45: { desc: 'Foggy', icon: '🌫️' },
  48: { desc: 'Depositing rime fog', icon: '🌫️' },
  51: { desc: 'Light drizzle', icon: '🌦️' },
  53: { desc: 'Moderate drizzle', icon: '🌦️' },
  55: { desc: 'Dense drizzle', icon: '🌧️' },
  61: { desc: 'Slight rain', icon: '🌦️' },
  63: { desc: 'Moderate rain', icon: '🌧️' },
  65: { desc: 'Heavy rain', icon: '🌧️' },
  71: { desc: 'Slight snow', icon: '🌨️' },
  73: { desc: 'Moderate snow', icon: '🌨️' },
  75: { desc: 'Heavy snow', icon: '❄️' },
  80: { desc: 'Slight showers', icon: '🌦️' },
  81: { desc: 'Moderate showers', icon: '🌧️' },
  82: { desc: 'Violent showers', icon: '⛈️' },
  95: { desc: 'Thunderstorm', icon: '⛈️' },
  96: { desc: 'Thunderstorm with hail', icon: '⛈️' },
  99: { desc: 'Thunderstorm with heavy hail', icon: '⛈️' }
};

// Cache settings
const CACHE_KEY_PREFIX = 'itw:weather:';
const CURRENT_TTL_MS = 30 * 60 * 1000; // 30 minutes for current conditions
const FORECAST_TTL_MS = 3 * 60 * 60 * 1000; // 3 hours for forecast

// Open-Meteo API endpoint
const API_BASE = 'https://api.open-meteo.com/v1/forecast';

export class Weather {
  constructor() {
    this.unitSystem = this.detectUnitSystem();
    this.cache = {};
  }

  /**
   * Detect user's preferred unit system
   * @returns {'imperial' | 'metric'}
   */
  detectUnitSystem() {
    // Check for saved preference
    const saved = SafeStorage.get('itw:weather:units');
    if (saved === 'imperial' || saved === 'metric') {
      return saved;
    }

    // Try to detect from locale
    try {
      // Check if Intl.Locale is available
      if (typeof Intl !== 'undefined' && Intl.Locale) {
        const locale = new Intl.Locale(navigator.language);
        // Only US, Liberia, Myanmar use Fahrenheit
        const region = locale.region || locale.language.split('-')[1];
        if (['US', 'LR', 'MM'].includes(region?.toUpperCase())) {
          return 'imperial';
        }
      }
    } catch {
      // Fallback: check navigator.language
      const lang = navigator.language || navigator.userLanguage || 'en-US';
      if (lang.includes('US') || lang === 'en-US') {
        return 'imperial';
      }
    }

    return 'metric';
  }

  /**
   * Set unit system preference
   * @param {'imperial' | 'metric'} system
   */
  setUnitSystem(system) {
    if (system === 'imperial' || system === 'metric') {
      this.unitSystem = system;
      SafeStorage.set('itw:weather:units', system, null); // No expiry
      return true;
    }
    return false;
  }

  /**
   * Get current unit system
   */
  getUnitSystem() {
    return this.unitSystem;
  }

  /**
   * Fetch current weather and 48-hour forecast
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @param {string} portId - Port identifier for caching
   * @returns {Promise<Object>} Weather data
   */
  async getWeather(lat, lon, portId) {
    const cacheKey = `${CACHE_KEY_PREFIX}${portId}`;

    // Check cache first
    const cached = SafeStorage.get(cacheKey);
    if (cached && !this.isStale(cached.timestamp, CURRENT_TTL_MS)) {
      return this.formatResponse(cached.data);
    }

    // Check if offline
    if (navigator.onLine === false) {
      if (cached) {
        return {
          ...this.formatResponse(cached.data),
          isStale: true,
          warning: 'Offline — showing last known conditions'
        };
      }
      return { error: 'Offline and no cached data available' };
    }

    try {
      const data = await this.fetchFromOpenMeteo(lat, lon);

      // Cache the response
      SafeStorage.set(cacheKey, {
        data: data,
        timestamp: Date.now()
      }, FORECAST_TTL_MS);

      return this.formatResponse(data);
    } catch (err) {
      console.warn('Weather fetch failed:', err);

      // Return cached data if available
      if (cached) {
        return {
          ...this.formatResponse(cached.data),
          isStale: true,
          warning: 'Could not refresh — showing last known conditions'
        };
      }

      return { error: 'Weather data temporarily unavailable' };
    }
  }

  /**
   * Fetch from Open-Meteo API
   * @param {number} lat
   * @param {number} lon
   * @returns {Promise<Object>}
   */
  async fetchFromOpenMeteo(lat, lon) {
    // Request both current and hourly forecast data
    const params = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lon.toString(),
      current: [
        'temperature_2m',
        'apparent_temperature',
        'relative_humidity_2m',
        'weather_code',
        'wind_speed_10m',
        'wind_direction_10m',
        'precipitation'
      ].join(','),
      hourly: [
        'temperature_2m',
        'weather_code',
        'precipitation_probability',
        'wind_speed_10m'
      ].join(','),
      temperature_unit: 'fahrenheit', // Always fetch in F, convert if needed
      wind_speed_unit: 'mph',
      precipitation_unit: 'inch',
      timezone: 'auto',
      forecast_days: 2
    });

    const url = `${API_BASE}?${params}`;

    const response = await fetch(url, {
      cache: 'no-store',
      credentials: 'omit'
    });

    if (!response.ok) {
      throw new Error(`Open-Meteo API error: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Format API response into our structure
   * @param {Object} data - Raw API response
   * @returns {Object} Formatted weather data
   */
  formatResponse(data) {
    const current = this.formatCurrent(data);
    const forecast = this.formatForecast(data);
    const bestWindow = this.findBestWindow(data);

    return {
      current,
      forecast,
      bestWindow,
      timezone: data.timezone,
      lastUpdated: new Date().toISOString(),
      attribution: 'Weather data by Open-Meteo (CC BY 4.0)',
      attributionUrl: 'https://open-meteo.com/'
    };
  }

  /**
   * Format current conditions
   * @param {Object} data
   * @returns {Object}
   */
  formatCurrent(data) {
    const c = data.current;
    const code = c.weather_code;
    const weatherInfo = WEATHER_CODES[code] || { desc: 'Unknown', icon: '❓' };

    return {
      temp: this.formatTemp(c.temperature_2m),
      feelsLike: this.formatTemp(c.apparent_temperature),
      humidity: c.relative_humidity_2m,
      windSpeed: this.formatWind(c.wind_speed_10m),
      windDirection: this.getWindDirection(c.wind_direction_10m),
      condition: weatherInfo.desc,
      icon: weatherInfo.icon,
      precipitation: c.precipitation,
      time: c.time
    };
  }

  /**
   * Format 48-hour forecast into buckets
   * @param {Object} data
   * @returns {Array} Forecast buckets
   */
  formatForecast(data) {
    const hourly = data.hourly;
    if (!hourly || !hourly.time) return [];

    const now = new Date();
    const buckets = [];

    // Get timezone from response
    const tz = data.timezone || 'UTC';

    // Create time buckets: Today PM, Tonight, Tomorrow AM, Tomorrow PM, Next Day AM
    const bucketDefs = this.getBucketDefinitions(now, tz);

    for (const bucket of bucketDefs) {
      const indices = this.getHourlyIndices(hourly.time, bucket.start, bucket.end);

      if (indices.length > 0) {
        const temps = indices.map(i => hourly.temperature_2m[i]);
        const precips = indices.map(i => hourly.precipitation_probability[i] || 0);
        const winds = indices.map(i => hourly.wind_speed_10m[i]);
        const codes = indices.map(i => hourly.weather_code[i]);

        // Most common weather code
        const dominantCode = this.getMostCommon(codes);
        const weatherInfo = WEATHER_CODES[dominantCode] || { desc: 'Mixed', icon: '🌤️' };

        buckets.push({
          label: bucket.label,
          tempHigh: this.formatTemp(Math.max(...temps)),
          tempLow: this.formatTemp(Math.min(...temps)),
          precipChance: Math.max(...precips),
          windAvg: this.formatWind(winds.reduce((a, b) => a + b, 0) / winds.length),
          condition: weatherInfo.desc,
          icon: weatherInfo.icon
        });
      }
    }

    return buckets.slice(0, 5); // Max 5 buckets
  }

  /**
   * Get bucket time definitions
   * @param {Date} now
   * @param {string} tz
   * @returns {Array}
   */
  getBucketDefinitions(now, tz) {
    const hour = now.getHours();
    const buckets = [];

    // Calculate dates
    const today = new Date(now);
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextDay = new Date(now);
    nextDay.setDate(nextDay.getDate() + 2);

    // Today PM (if before 6pm)
    if (hour < 18) {
      buckets.push({
        label: 'Today PM',
        start: new Date(today.setHours(12, 0, 0, 0)),
        end: new Date(today.setHours(18, 0, 0, 0))
      });
    }

    // Tonight
    const tonightStart = new Date(today);
    tonightStart.setHours(18, 0, 0, 0);
    const tonightEnd = new Date(today);
    tonightEnd.setHours(23, 59, 59, 999);
    buckets.push({
      label: 'Tonight',
      start: tonightStart,
      end: tonightEnd
    });

    // Tomorrow AM
    const tomAMStart = new Date(tomorrow);
    tomAMStart.setHours(6, 0, 0, 0);
    const tomAMEnd = new Date(tomorrow);
    tomAMEnd.setHours(12, 0, 0, 0);
    buckets.push({
      label: 'Tomorrow AM',
      start: tomAMStart,
      end: tomAMEnd
    });

    // Tomorrow PM
    const tomPMStart = new Date(tomorrow);
    tomPMStart.setHours(12, 0, 0, 0);
    const tomPMEnd = new Date(tomorrow);
    tomPMEnd.setHours(18, 0, 0, 0);
    buckets.push({
      label: 'Tomorrow PM',
      start: tomPMStart,
      end: tomPMEnd
    });

    // Next Day AM
    const nextAMStart = new Date(nextDay);
    nextAMStart.setHours(6, 0, 0, 0);
    const nextAMEnd = new Date(nextDay);
    nextAMEnd.setHours(12, 0, 0, 0);
    buckets.push({
      label: 'Next Day AM',
      start: nextAMStart,
      end: nextAMEnd
    });

    return buckets;
  }

  /**
   * Get indices of hourly data within time range
   * @param {Array<string>} times
   * @param {Date} start
   * @param {Date} end
   * @returns {Array<number>}
   */
  getHourlyIndices(times, start, end) {
    const indices = [];
    for (let i = 0; i < times.length; i++) {
      const t = new Date(times[i]);
      if (t >= start && t < end) {
        indices.push(i);
      }
    }
    return indices;
  }

  /**
   * Find the best window to go ashore (lowest rain + wind in next 12 hours)
   * @param {Object} data
   * @returns {Object|null}
   */
  findBestWindow(data) {
    const hourly = data.hourly;
    if (!hourly || !hourly.time) return null;

    const now = new Date();
    const next12h = new Date(now.getTime() + 12 * 60 * 60 * 1000);

    let bestScore = Infinity;
    let bestWindow = null;

    for (let i = 0; i < hourly.time.length; i++) {
      const t = new Date(hourly.time[i]);
      if (t < now || t > next12h) continue;

      const precip = hourly.precipitation_probability[i] || 0;
      const wind = hourly.wind_speed_10m[i] || 0;

      // Score: lower is better (weighted precip + wind)
      const score = precip * 2 + wind;

      if (score < bestScore) {
        bestScore = score;
        bestWindow = {
          time: t,
          label: this.getTimeLabel(t),
          precipChance: precip,
          wind: this.formatWind(wind)
        };
      }
    }

    return bestWindow;
  }

  /**
   * Get human-readable time label
   * @param {Date} date
   * @returns {string}
   */
  getTimeLabel(date) {
    const hour = date.getHours();
    if (hour >= 5 && hour < 9) return 'early morning';
    if (hour >= 9 && hour < 12) return 'late morning';
    if (hour >= 12 && hour < 14) return 'midday';
    if (hour >= 14 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 20) return 'evening';
    return 'night';
  }

  /**
   * Format temperature based on unit system
   * @param {number} tempF - Temperature in Fahrenheit
   * @returns {string}
   */
  formatTemp(tempF) {
    if (this.unitSystem === 'metric') {
      const tempC = (tempF - 32) * 5 / 9;
      return `${Math.round(tempC)}°C`;
    }
    return `${Math.round(tempF)}°F`;
  }

  /**
   * Format wind speed based on unit system
   * @param {number} speedMph - Speed in mph
   * @returns {string}
   */
  formatWind(speedMph) {
    if (this.unitSystem === 'metric') {
      const speedKmh = speedMph * 1.60934;
      return `${Math.round(speedKmh)} km/h`;
    }
    return `${Math.round(speedMph)} mph`;
  }

  /**
   * Get wind direction from degrees
   * @param {number} degrees
   * @returns {string}
   */
  getWindDirection(degrees) {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  }

  /**
   * Get most common value in array
   * @param {Array} arr
   * @returns {*}
   */
  getMostCommon(arr) {
    const counts = {};
    let maxCount = 0;
    let maxVal = arr[0];

    for (const val of arr) {
      counts[val] = (counts[val] || 0) + 1;
      if (counts[val] > maxCount) {
        maxCount = counts[val];
        maxVal = val;
      }
    }

    return maxVal;
  }

  /**
   * Check if cached data is stale
   * @param {number} timestamp
   * @param {number} ttl
   * @returns {boolean}
   */
  isStale(timestamp, ttl) {
    return Date.now() - timestamp > ttl;
  }

  /**
   * Compare current conditions to seasonal averages
   * @param {Object} current - Current conditions
   * @param {Object} seasonalData - Seasonal averages for the port
   * @returns {string|null} Comparison sentence
   */
  getSeasonalComparison(current, seasonalData) {
    if (!seasonalData || !seasonalData.monthly_averages) return null;

    // Get current month abbreviation
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const monthKey = months[new Date().getMonth()];
    const monthName = new Date().toLocaleString('en-US', { month: 'long' });

    const avg = seasonalData.monthly_averages[monthKey];
    if (!avg) return null;

    // Parse current temp (remove °F or °C)
    const currentTemp = parseInt(current.temp);
    const typicalHigh = avg.high_f;

    // Convert if using metric
    const typicalHighDisplay = this.unitSystem === 'metric'
      ? Math.round((typicalHigh - 32) * 5 / 9) + '°C'
      : typicalHigh + '°F';

    const diff = currentTemp - (this.unitSystem === 'metric'
      ? Math.round((typicalHigh - 32) * 5 / 9)
      : typicalHigh);

    if (Math.abs(diff) < 3) {
      return `Typical for ${monthName}: around ${typicalHighDisplay}. Today is about average.`;
    } else if (diff > 0) {
      return `Typical for ${monthName}: around ${typicalHighDisplay}. Today is warmer than usual.`;
    } else {
      return `Typical for ${monthName}: around ${typicalHighDisplay}. Today is cooler than usual.`;
    }
  }
}

// Export singleton instance
export const weather = new Weather();

export default weather;
