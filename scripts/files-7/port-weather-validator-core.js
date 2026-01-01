/**
 * port-weather-validator-core.js
 * Port Weather Guide Validator v2.0 - Core Module
 * 
 * "Unless the LORD builds the house, those who build it labor in vain." — Psalm 127:1
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// PORT REGISTRY
// ============================================================================

const PORT_REGISTRY = {
  cozumel: {
    name: 'Cozumel', country: 'Mexico', region: 'Caribbean',
    lat: 20.4230, lon: -86.9223, tier: 1,
    localAnchors: ['Punta Langosta', 'International Pier', 'Puerta Maya', 'Palancar Reef', 'San Gervasio', 'El Cielo', 'Paradise Beach', 'Mr. Sanchos', 'San Miguel'],
    climatePattern: 'tropical-hurricane', requiresHurricaneWarning: true
  },
  nassau: {
    name: 'Nassau', country: 'Bahamas', region: 'Caribbean',
    lat: 25.0480, lon: -77.3554, tier: 2,
    localAnchors: ['Prince George Wharf', 'Paradise Island', 'Atlantis', 'Bay Street', 'Cable Beach'],
    climatePattern: 'tropical-hurricane', requiresHurricaneWarning: true
  },
  'st-maarten': {
    name: 'St. Maarten', country: 'Sint Maarten', region: 'Caribbean',
    lat: 18.0425, lon: -63.0548, tier: 2,
    localAnchors: ['Philipsburg', 'Great Bay', 'Maho Beach', 'Orient Bay', 'Marigot'],
    climatePattern: 'tropical-hurricane', requiresHurricaneWarning: true
  },
  'grand-cayman': {
    name: 'Grand Cayman', country: 'Cayman Islands', region: 'Caribbean',
    lat: 19.2869, lon: -81.3674, tier: 1,
    localAnchors: ['George Town', 'Seven Mile Beach', 'Stingray City', 'Hell', 'Rum Point'],
    climatePattern: 'tropical-hurricane', requiresHurricaneWarning: true
  },
  'costa-maya': {
    name: 'Costa Maya', country: 'Mexico', region: 'Caribbean',
    lat: 18.7167, lon: -87.7000, tier: 2,
    localAnchors: ['Mahahual', 'Chacchoben', 'Bacalar Lagoon'],
    climatePattern: 'tropical-hurricane', requiresHurricaneWarning: true
  },
  roatan: {
    name: 'Roatan', country: 'Honduras', region: 'Caribbean',
    lat: 16.3167, lon: -86.5333, tier: 2,
    localAnchors: ['Coxen Hole', 'West Bay Beach', 'Mahogany Bay', 'Tabyana Beach'],
    climatePattern: 'tropical-hurricane', requiresHurricaneWarning: true
  },
  juneau: {
    name: 'Juneau', country: 'United States', region: 'Alaska',
    lat: 58.3019, lon: -134.4197, tier: 1,
    localAnchors: ['Mendenhall Glacier', 'Tracy Arm Fjord', 'Mount Roberts Tramway'],
    climatePattern: 'alaska', requiresHurricaneWarning: false
  },
  ketchikan: {
    name: 'Ketchikan', country: 'United States', region: 'Alaska',
    lat: 55.3422, lon: -131.6461, tier: 1,
    localAnchors: ['Creek Street', 'Totem Bight State Park', 'Misty Fjords'],
    climatePattern: 'alaska', requiresHurricaneWarning: false
  },
  barcelona: {
    name: 'Barcelona', country: 'Spain', region: 'Mediterranean',
    lat: 41.3874, lon: 2.1686, tier: 1,
    localAnchors: ['La Rambla', 'Sagrada Familia', 'Park Guell', 'Gothic Quarter'],
    climatePattern: 'mediterranean', requiresHurricaneWarning: false
  },
  civitavecchia: {
    name: 'Civitavecchia', country: 'Italy', region: 'Mediterranean',
    lat: 42.0930, lon: 11.7969, tier: 1,
    localAnchors: ['Rome', 'Vatican', 'Colosseum', 'Trevi Fountain'],
    climatePattern: 'mediterranean', requiresHurricaneWarning: false
  }
};

// ============================================================================
// CLIMATE PATTERNS
// ============================================================================

const CLIMATE_PATTERNS = {
  'tropical-hurricane': {
    requiredTokens: ['hurricane'],
    forbiddenTokens: ['snow', 'freeze', 'polar', 'arctic', 'glacier', 'tundra']
  },
  'mediterranean': {
    requiredTokens: [],
    forbiddenTokens: ['hurricane', 'monsoon', 'typhoon', 'tropical storm', 'glacier']
  },
  'alaska': {
    requiredTokens: ['rain', 'layers'],
    forbiddenTokens: ['hurricane', 'tropical', 'reef', 'snorkel', 'beach club']
  }
};

// ============================================================================
// FORBIDDEN PATTERNS (Anti-Claude Shield)
// ============================================================================

const FORBIDDEN_PATTERNS = [
  { pattern: /Shoulder Season/i, replacement: 'Transitional Season' },
  { pattern: /Best Months? (for|to)/i, replacement: 'Best Time to Visit' },
  { pattern: /Weather Guide/i, replacement: 'Weather & Best Time to Visit' },
  { pattern: /Climate Overview/i, replacement: 'At a Glance' },
  { pattern: /When to (Go|Visit)/i, replacement: 'Best Time to Visit' },
  { pattern: /Typical Weather/i, replacement: 'At a Glance' }
];

// ============================================================================
// REQUIRED STRUCTURE
// ============================================================================

const REQUIRED = {
  glanceLabels: ['Temperature', 'Humidity', 'Rain', 'Wind', 'Daylight'],
  seasons: [
    { label: 'Peak Season', css: 'cruise-season-high' },
    { label: 'Transitional Season', css: 'cruise-season-transitional' },
    { label: 'Low Season', css: 'cruise-season-low' }
  ],
  activities: ['Beach', 'Snorkeling', 'Hiking', 'City Walking', 'Low Crowds'],
  faqTopics: [
    { pattern: /best time.*year.*visit|when.*visit/i, name: 'Best time to visit' },
    { pattern: /hurricane|cyclone|storm season/i, name: 'Hurricane/storm season' },
    { pattern: /pack.*weather|what.*pack/i, name: 'Packing for weather' },
    { pattern: /rain.*ruin|afternoon.*rain/i, name: 'Rain concerns' }
  ]
};

const VALID_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
    }
  }
  return dp[m][n];
}

function similarity(a, b) {
  const s1 = a.toLowerCase().trim(), s2 = b.toLowerCase().trim();
  const max = Math.max(s1.length, s2.length);
  return max === 0 ? 1 : 1 - (levenshtein(s1, s2) / max);
}

function jaccard(t1, t2) {
  const tok = t => t.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter(x => x.length > 2);
  const s1 = new Set(tok(t1)), s2 = new Set(tok(t2));
  const inter = new Set([...s1].filter(x => s2.has(x)));
  const union = new Set([...s1, ...s2]);
  return union.size === 0 ? 0 : inter.size / union.size;
}

// ============================================================================
// VALIDATOR CLASS
// ============================================================================

class PortWeatherValidator {
  constructor(filePath, options = {}) {
    this.filePath = filePath;
    this.options = options;
    this.content = '';
    this.portSlug = '';
    this.portData = null;
    this.errors = [];
    this.warnings = [];
    this.passed = [];
    this.weatherText = '';
  }

  log(type, code, msg, detail = null, fix = null) {
    const e = { code, message: msg, detail, suggestion: fix };
    if (type === 'error') this.errors.push(e);
    else if (type === 'warn') this.warnings.push(e);
    else if (type === 'pass') this.passed.push(e);
  }

  load() {
    if (!fs.existsSync(this.filePath)) {
      this.log('error', 'FILE_001', `File not found: ${this.filePath}`);
      return false;
    }
    this.content = fs.readFileSync(this.filePath, 'utf8');
    this.portSlug = path.basename(this.filePath, '.html');
    this.portData = PORT_REGISTRY[this.portSlug];
    return true;
  }

  count(p) {
    const r = typeof p === 'string' ? new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g') : p;
    return (this.content.match(r) || []).length;
  }

  exactlyOne(p, code, desc, fix = null) {
    const c = this.count(p);
    if (c === 0) { this.log('error', code, `MISSING: ${desc}`, null, fix); return false; }
    if (c > 1) { this.log('error', code, `DUPLICATE: ${desc}`, `Found ${c}`, 'Remove duplicates'); return false; }
    this.log('pass', code, `${desc}`);
    return true;
  }

  zero(p, code, desc, repl = null) {
    const c = this.count(p);
    if (c > 0) { this.log('error', code, `FORBIDDEN: ${desc}`, `Found ${c}`, repl ? `Use "${repl}"` : 'Remove'); return false; }
    this.log('pass', code, `No "${desc}"`);
    return true;
  }

  // Layer 1: Structure
  validateStructure() {
    this.exactlyOne('id="weather-guide"', 'S001', 'Section id="weather-guide"');
    this.exactlyOne('id="port-weather-widget"', 'S002', 'Container id="port-weather-widget"');
    ['data-port-id', 'data-port-name', 'data-lat', 'data-lon', 'data-region'].forEach(a => {
      this.exactlyOne(new RegExp(`${a}="[^"]+"`), `S_${a.toUpperCase().replace(/-/g, '_')}`, `Attr ${a}`);
    });
    this.validateCoords();
    this.validateNoscript();
  }

  validateCoords() {
    const lat = this.content.match(/data-lat="([^"]+)"/);
    const lon = this.content.match(/data-lon="([^"]+)"/);
    if (lat) {
      const v = parseFloat(lat[1]);
      if (isNaN(v) || v < -90 || v > 90) this.log('error', 'COORD_LAT', `Invalid lat: ${lat[1]}`);
      else if (this.portData && Math.abs(v - this.portData.lat) > 0.5)
        this.log('error', 'COORD_LAT_X', `Lat mismatch`, `Page: ${v}, Registry: ${this.portData.lat}`);
      else this.log('pass', 'COORD_LAT', `Valid lat: ${v}`);
    }
    if (lon) {
      const v = parseFloat(lon[1]);
      if (isNaN(v) || v < -180 || v > 180) this.log('error', 'COORD_LON', `Invalid lon: ${lon[1]}`);
      else if (this.portData && Math.abs(v - this.portData.lon) > 0.5)
        this.log('error', 'COORD_LON_X', `Lon mismatch`, `Page: ${v}, Registry: ${this.portData.lon}`);
      else this.log('pass', 'COORD_LON', `Valid lon: ${v}`);
    }
  }

  validateNoscript() {
    const m = this.content.match(/id="port-weather-widget"[\s\S]*?<\/section>/);
    if (m) {
      const c = (m[0].match(/<noscript>/g) || []).length;
      if (c === 0) this.log('error', 'S_NOSCRIPT', 'Missing noscript fallback');
      else if (c > 1) this.log('error', 'S_NOSCRIPT_DUP', `Duplicate noscript`, `Found ${c}`);
      else this.log('pass', 'S_NOSCRIPT', 'noscript present');
    }
  }

  validateSeasonal() {
    this.exactlyOne(/class="seasonal-guide[^"]*"/, 'SEA_001', 'class="seasonal-guide"');
    this.zero(/Shoulder Season/i, 'TERM_001', 'Shoulder Season', 'Transitional Season');
    this.zero(/cruise-season-shoulder/, 'TERM_002', 'cruise-season-shoulder', 'cruise-season-transitional');
  }

  validateGlance() {
    this.exactlyOne(/>At a Glance</, 'G001', '"At a Glance" title');
    REQUIRED.glanceLabels.forEach(l => {
      this.exactlyOne(new RegExp(`<span class="glance-label">${l}</span>`), `G_${l.toUpperCase()}`, `Glance: ${l}`);
    });
  }

  validateBestTime() {
    this.exactlyOne(/>Best Time to Visit</, 'B001', '"Best Time to Visit" title');
    this.exactlyOne(/cruise-seasons-grid/, 'B002', 'cruise-seasons-grid');
    REQUIRED.seasons.forEach(s => {
      this.exactlyOne(new RegExp(`>${s.label}<`), `B_${s.css.toUpperCase()}`, `Season: ${s.label}`);
      this.exactlyOne(new RegExp(s.css), `B_CSS_${s.css.toUpperCase()}`, `CSS: ${s.css}`);
    });
    REQUIRED.activities.forEach(a => {
      this.exactlyOne(new RegExp(`<span class="activity-label">${a}</span>`), `B_ACT_${a.toUpperCase().replace(/\s/g, '_')}`, `Activity: ${a}`);
    });
    this.exactlyOne(/months-to-avoid/, 'B_AVOID', 'months-to-avoid');
  }

  validateList(title, code, cls, min, max) {
    this.exactlyOne(new RegExp(`>${title}<`), `${code}_001`, `"${title}" title`);
    const c = this.count(new RegExp(`class="${cls}"`));
    if (c === 0) this.log('error', `${code}_002`, `MISSING: ${cls}`);
    else if (c > 1) this.log('error', `${code}_002`, `DUPLICATE: ${cls}`, `Found ${c}`);
    else {
      this.log('pass', `${code}_002`, `${cls} present`);
      const m = this.content.match(new RegExp(`class="${cls}"[\\s\\S]*?<\\/ul>`));
      if (m) {
        const items = (m[0].match(/<li>/g) || []).length;
        if (items < min) this.log('error', `${code}_003`, `${cls} has ${items} items`, `Min ${min}`);
        else if (items > max) this.log('warn', `${code}_003`, `${cls} has ${items} items`, `Max ${max} recommended`);
        else this.log('pass', `${code}_003`, `${cls} has ${items} items`);
      }
    }
  }

  validateHazards() {
    this.exactlyOne(/>Weather Hazards</, 'H001', '"Weather Hazards" title');
    this.exactlyOne(/class="hazard-warning"/, 'H002', 'hazard-warning');
    if (this.portData?.requiresHurricaneWarning) {
      if (!this.content.includes('Hurricane Zone') && !this.content.includes('Cyclone'))
        this.log('error', 'H003', `${this.portData.region} port MUST mention hurricane/cyclone`);
      else this.log('pass', 'H003', 'Hurricane warning present');
    }
  }

  // Layer 2: Data Accuracy
  validateMonths() {
    const spans = [...(this.content.match(/class="activity-months">([^<]+)</g) || []),
                   ...(this.content.match(/class="season-months">([^<]+)</g) || [])];
    let ok = true;
    spans.forEach(s => {
      const ms = s.replace(/class="(activity|season)-months">|</g, '');
      ms.split(/,\s*/).forEach(m => {
        if (m.trim() && !VALID_MONTHS.includes(m.trim())) {
          this.log('error', 'D_MONTH', `Invalid month: "${m.trim()}"`);
          ok = false;
        }
      });
    });
    if (ok) this.log('pass', 'D_MONTHS', 'All months valid');
  }

  validateFAQ() {
    REQUIRED.faqTopics.forEach(f => {
      const c = this.count(f.pattern);
      if (c === 0) this.log('error', `FAQ_${f.name.toUpperCase().replace(/\s/g, '_')}`, `Missing FAQ: ${f.name}`);
      else if (c > 1) this.log('error', `FAQ_DUP`, `Duplicate FAQ: ${f.name}`, `Found ${c}`);
      else this.log('pass', `FAQ_${f.name.toUpperCase().replace(/\s/g, '_')}`, `FAQ: ${f.name}`);
    });
    const schema = this.count(/"@type":\s*"FAQPage"/);
    if (schema === 0) this.log('error', 'FAQ_SCHEMA', 'Missing FAQPage schema');
    else if (schema > 1) this.log('error', 'FAQ_SCHEMA_DUP', `Duplicate FAQPage schema`);
    else {
      this.log('pass', 'FAQ_SCHEMA', 'FAQPage schema present');
      const sq = this.count(/"@type":\s*"Question"/);
      const vq = this.count(/<p><strong>Q:|<strong>Q:/);
      if (sq !== vq) this.log('error', 'FAQ_COUNT', `FAQ count mismatch`, `Schema: ${sq}, Page: ${vq}`);
      else this.log('pass', 'FAQ_COUNT', `FAQ count: ${sq}`);
    }
  }

  // Layer 3: De-duplication
  validateDedup() {
    FORBIDDEN_PATTERNS.forEach(f => this.zero(f.pattern, 'DEDUP', f.pattern.source, f.replacement));
    
    const headers = (this.content.match(/<h[1-6][^>]*>([^<]+)<\/h[1-6]>/g) || [])
      .map(h => h.replace(/<\/?h[1-6][^>]*>/g, '').trim());
    for (let i = 0; i < headers.length; i++) {
      for (let j = i + 1; j < headers.length; j++) {
        const s = similarity(headers[i], headers[j]);
        if (s > 0.8 && s < 1) {
          this.log('error', 'DEDUP_SIM', `Similar headers`, `"${headers[i]}" ~ "${headers[j]}" (${(s*100).toFixed(0)}%)`);
        }
      }
    }

    const peak = this.count(/>Peak Season</);
    if (peak > 1) this.log('error', 'DEDUP_PEAK', `"Peak Season" appears ${peak}x`);
    const trans = this.count(/>Transitional Season</);
    if (trans > 1) this.log('error', 'DEDUP_TRANS', `"Transitional Season" appears ${trans}x`);
    const low = this.count(/>Low Season</);
    if (low > 1) this.log('error', 'DEDUP_LOW', `"Low Season" appears ${low}x`);
  }

  // Layer 4: Port Specificity
  validateSpecificity() {
    if (!this.portData) {
      this.log('warn', 'SPEC_REG', `Port "${this.portSlug}" not in registry`);
      return;
    }
    
    if (!new RegExp(this.portData.name, 'i').test(this.content))
      this.log('error', 'SPEC_NAME', `Port name "${this.portData.name}" not in content`);
    else this.log('pass', 'SPEC_NAME', `Port name present`);

    const found = this.portData.localAnchors.filter(a => this.content.toLowerCase().includes(a.toLowerCase()));
    const min = this.portData.tier === 1 ? 3 : 2;
    if (found.length === 0) this.log('error', 'SPEC_ANCHOR', 'No local anchors found');
    else if (found.length < min) this.log('warn', 'SPEC_ANCHOR', `Only ${found.length} anchors for Tier ${this.portData.tier}`);
    else this.log('pass', 'SPEC_ANCHOR', `${found.length} local anchors found`);

    // Cross-port contamination
    Object.entries(PORT_REGISTRY).forEach(([slug, port]) => {
      if (slug === this.portSlug) return;
      port.localAnchors.forEach(a => {
        if (a.length >= 6 && this.content.includes(a))
          this.log('warn', 'SPEC_CONTAM', `Cross-port: "${a}" (from ${port.name})`);
      });
    });

    // Climate pattern
    const cp = CLIMATE_PATTERNS[this.portData.climatePattern];
    if (cp) {
      cp.requiredTokens.forEach(t => {
        if (!this.content.toLowerCase().includes(t))
          this.log('warn', 'SPEC_CLIMATE_REQ', `Missing climate term: "${t}"`);
      });
      cp.forbiddenTokens.forEach(t => {
        if (this.content.toLowerCase().includes(t))
          this.log('error', 'SPEC_CLIMATE_BAD', `Wrong climate term: "${t}"`);
      });
    }
  }

  extractWeatherText() {
    const m = this.content.match(/id="weather-guide"[\s\S]*?<\/section>/);
    this.weatherText = m ? m[0].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '';
    return this.weatherText;
  }

  validate() {
    if (!this.load()) return this.getReport();
    
    this.validateStructure();
    this.validateSeasonal();
    this.validateGlance();
    this.validateBestTime();
    this.validateList('What Catches Visitors Off Guard', 'CATCH', 'catches-list', 3, 7);
    this.validateList('Packing Tips', 'PACK', 'packing-list', 3, 7);
    this.validateHazards();
    this.validateMonths();
    this.validateFAQ();
    this.validateDedup();
    this.validateSpecificity();
    this.extractWeatherText();
    
    return this.getReport();
  }

  getReport() {
    return {
      file: this.filePath,
      port: this.portSlug,
      portName: this.portData?.name || this.portSlug,
      tier: this.portData?.tier || null,
      region: this.portData?.region || null,
      weatherText: this.weatherText,
      summary: {
        status: this.errors.length > 0 ? 'FAIL' : (this.warnings.length > 0 ? 'WARN' : 'PASS'),
        passed: this.passed.length,
        warnings: this.warnings.length,
        errors: this.errors.length
      },
      passed: this.passed,
      warnings: this.warnings,
      errors: this.errors
    };
  }
}

// Cross-page similarity
function crossPageCheck(reports) {
  const results = { warnings: [], errors: [] };
  const slugs = Object.keys(reports);
  for (let i = 0; i < slugs.length; i++) {
    for (let j = i + 1; j < slugs.length; j++) {
      const t1 = reports[slugs[i]].weatherText || '';
      const t2 = reports[slugs[j]].weatherText || '';
      if (t1.length < 100 || t2.length < 100) continue;
      const s = jaccard(t1, t2);
      if (s > 0.7) results.errors.push({ code: 'CROSS_HIGH', message: `${slugs[i]} ~ ${slugs[j]}: ${(s*100).toFixed(0)}% similar` });
      else if (s > 0.5) results.warnings.push({ code: 'CROSS_MOD', message: `${slugs[i]} ~ ${slugs[j]}: ${(s*100).toFixed(0)}% similar` });
    }
  }
  return results;
}

module.exports = { PortWeatherValidator, crossPageCheck, PORT_REGISTRY };
