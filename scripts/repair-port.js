#!/usr/bin/env node
/**
 * Port Page Repair Script
 * Automatically fixes common validation issues:
 * 1. Missing weather section
 * 2. Non-collapsible sections
 * 3. Missing images (creates placeholders)
 * 4. Missing weather FAQs
 */

const fs = require('fs');
const path = require('path');

const PLACEHOLDER_IMG = '/home/user/InTheWake/assets/ships/placeholder-ship.webp';

class PortRepairer {
  constructor(filePath) {
    this.filePath = filePath;
    this.portSlug = path.basename(filePath, '.html');
    this.content = '';
    this.repairs = [];
  }

  log(type, message) {
    const prefix = type === 'fix' ? '🔧' : type === 'skip' ? '⏭️' : 'ℹ️';
    console.log(`${prefix} ${message}`);
    if (type === 'fix') this.repairs.push(message);
  }

  loadFile() {
    if (!fs.existsSync(this.filePath)) {
      console.error(`File not found: ${this.filePath}`);
      return false;
    }
    this.content = fs.readFileSync(this.filePath, 'utf8');
    return true;
  }

  saveFile() {
    fs.writeFileSync(this.filePath, this.content, 'utf8');
  }

  getPortInfo() {
    // Extract port name from title - remove common suffixes
    const titleMatch = this.content.match(/<title>([^<—–-]+)/);
    let portName = titleMatch ? titleMatch[1].trim() : this.portSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    // Clean up common suffixes
    portName = portName.replace(/\s*(Cruise\s+)?Port\s+Guide.*$/i, '').replace(/\s*Guide.*$/i, '').trim();

    // Extract coordinates from schema
    const latMatch = this.content.match(/"latitude":\s*(-?[\d.]+)/);
    const lonMatch = this.content.match(/"longitude":\s*(-?[\d.]+)/);
    const lat = latMatch ? latMatch[1] : '0';
    const lon = lonMatch ? lonMatch[1] : '0';

    // Determine region based on coordinates
    let region = 'Other';
    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);

    if (lonNum >= -180 && lonNum <= -30 && latNum >= 0 && latNum <= 35) region = 'Caribbean';
    else if (lonNum >= -130 && lonNum <= -60 && latNum >= 35 && latNum <= 75) region = 'North America';
    else if (lonNum >= -20 && lonNum <= 45 && latNum >= 35 && latNum <= 72) region = 'Europe';
    else if (lonNum >= 30 && lonNum <= 60 && latNum >= 10 && latNum <= 45) region = 'Middle East';
    else if (lonNum >= 60 && lonNum <= 180 && latNum >= -50 && latNum <= 60) region = 'Asia Pacific';
    else if (lonNum >= -80 && lonNum <= -30 && latNum >= -60 && latNum <= 0) region = 'South America';
    else if (lonNum >= -20 && lonNum <= 55 && latNum >= -40 && latNum <= 35) region = 'Africa';
    else if (lonNum >= 100 && lonNum <= 180 && latNum >= -50 && latNum <= -10) region = 'Australia';
    else if (lonNum >= -180 && lonNum <= -130 && latNum >= 50 && latNum <= 75) region = 'Alaska';

    return { name: portName, lat, lon, region, slug: this.portSlug };
  }

  createPlaceholderImages() {
    // Find all missing images
    const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
    const matches = [...this.content.matchAll(imgRegex)];
    const rootDir = path.resolve(path.dirname(this.filePath), '..');

    for (const match of matches) {
      let srcPath = match[1];
      if (srcPath.startsWith('http') || srcPath.startsWith('data:')) continue;

      const queryIndex = srcPath.indexOf('?');
      if (queryIndex > -1) srcPath = srcPath.substring(0, queryIndex);

      let resolvedPath;
      if (srcPath.startsWith('/')) {
        resolvedPath = path.join(rootDir, srcPath);
      } else {
        resolvedPath = path.join(path.dirname(this.filePath), srcPath);
      }

      if (!fs.existsSync(resolvedPath)) {
        // Create directory if needed
        const dir = path.dirname(resolvedPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
          this.log('fix', `Created directory: ${dir}`);
        }

        // Copy placeholder
        if (fs.existsSync(PLACEHOLDER_IMG)) {
          fs.copyFileSync(PLACEHOLDER_IMG, resolvedPath);
          this.log('fix', `Created placeholder: ${srcPath}`);
        }
      }
    }
  }

  addWeatherSection() {
    if (this.content.includes('id="weather-guide"')) {
      this.log('skip', 'Weather section already exists');
      return;
    }

    const info = this.getPortInfo();

    // Determine season info based on region
    let peakMonths, transitionalMonths, lowMonths, avoidMonths, avoidReason, hazardType, hazardSeason, hazardPeak, hazardNote;

    if (info.region === 'Caribbean' || info.region === 'Caribbean' || (parseFloat(info.lon) >= -100 && parseFloat(info.lon) <= -60 && parseFloat(info.lat) >= 10 && parseFloat(info.lat) <= 30)) {
      peakMonths = 'Dec, Jan, Feb, Mar, Apr';
      transitionalMonths = 'May, Jun, Nov';
      lowMonths = 'Jul, Aug, Sep, Oct';
      avoidMonths = 'Sep, Oct';
      avoidReason = '(hurricane risk)';
      hazardType = 'Hurricane Zone';
      hazardSeason = 'Jun 1 – Nov 30 (Atlantic)';
      hazardPeak = 'Sep, Oct';
      hazardNote = 'Ships may reroute during active storms; travel insurance recommended';
    } else if (info.region === 'Middle East') {
      peakMonths = 'Nov, Dec, Jan, Feb, Mar';
      transitionalMonths = 'Apr, Oct';
      lowMonths = 'May, Jun, Jul, Aug, Sep';
      avoidMonths = 'Jul, Aug';
      avoidReason = '(extreme heat exceeding 45°C/113°F)';
      hazardType = 'Extreme Summer Heat';
      hazardSeason = 'May – Sep';
      hazardPeak = 'Jul, Aug (temperatures 45°C+)';
      hazardNote = 'Stay hydrated; limit outdoor exposure; choose air-conditioned attractions';
    } else if (info.region === 'Europe') {
      peakMonths = 'May, Jun, Jul, Aug, Sep';
      transitionalMonths = 'Apr, Oct';
      lowMonths = 'Nov, Dec, Jan, Feb, Mar';
      avoidMonths = 'Jan, Feb';
      avoidReason = '(cold weather, limited daylight)';
      hazardType = 'Winter Weather';
      hazardSeason = 'Nov – Mar';
      hazardPeak = 'Jan, Feb';
      hazardNote = 'Shorter days, possible storms; dress warmly in layers';
    } else if (info.region === 'Alaska') {
      peakMonths = 'Jun, Jul, Aug';
      transitionalMonths = 'May, Sep';
      lowMonths = 'Oct, Nov, Dec, Jan, Feb, Mar, Apr';
      avoidMonths = 'Nov, Dec, Jan, Feb';
      avoidReason = '(extreme cold, no cruise service)';
      hazardType = 'Cold Weather & Limited Season';
      hazardSeason = 'Oct – Apr (no cruises)';
      hazardPeak = 'Dec, Jan, Feb';
      hazardNote = 'Alaska cruise season runs May-September only; shoulder months can be cool and rainy';
    } else if (info.region === 'Asia Pacific') {
      peakMonths = 'Oct, Nov, Dec, Jan, Feb, Mar';
      transitionalMonths = 'Apr, Sep';
      lowMonths = 'May, Jun, Jul, Aug';
      avoidMonths = 'Jul, Aug, Sep';
      avoidReason = '(monsoon/typhoon season)';
      hazardType = 'Monsoon/Typhoon Season';
      hazardSeason = 'Jun – Nov';
      hazardPeak = 'Aug, Sep, Oct';
      hazardNote = 'Ships may reroute during typhoons; check weather forecasts';
    } else {
      peakMonths = 'May, Jun, Jul, Aug, Sep';
      transitionalMonths = 'Apr, Oct';
      lowMonths = 'Nov, Dec, Jan, Feb, Mar';
      avoidMonths = 'Jan, Feb';
      avoidReason = '(varies by destination)';
      hazardType = 'Seasonal Weather';
      hazardSeason = 'Varies';
      hazardPeak = 'Varies';
      hazardNote = 'Check local conditions before your cruise';
    }

    const weatherSection = `
        <!-- WEATHER & BEST TIME TO VISIT -->
        <section class="port-section" id="weather-guide" aria-label="Weather and Best Time to Visit">
          <details class="section-collapse" open>
            <summary><h2>Weather &amp; Best Time to Visit</h2></summary>
            <div class="section-body">
              <div id="port-weather-widget"
               data-port-id="${info.slug}"
               data-port-name="${info.name}"
               data-lat="${info.lat}"
               data-lon="${info.lon}"
               data-region="${info.region}">
            <noscript>
              <div class="seasonal-guide seasonal-guide-static">
                <details class="seasonal-section" open>
                  <summary class="seasonal-section-title">At a Glance</summary>
                  <div class="seasonal-at-glance">
                    <div class="seasonal-glance-grid">
                      <div class="seasonal-glance-item"><span class="glance-label">Temperature</span><span class="glance-value">Varies by season — check forecast</span></div>
                      <div class="seasonal-glance-item"><span class="glance-label">Humidity</span><span class="glance-value">Varies by season</span></div>
                      <div class="seasonal-glance-item"><span class="glance-label">Rain</span><span class="glance-value">Seasonal variation — check forecast</span></div>
                      <div class="seasonal-glance-item"><span class="glance-label">Wind</span><span class="glance-value">Variable conditions</span></div>
                      <div class="seasonal-glance-item"><span class="glance-label">Daylight</span><span class="glance-value">10-14 hours depending on season</span></div>
                    </div>
                  </div>
                </details>

                <details class="seasonal-section" open>
                  <summary class="seasonal-section-title">Best Time to Visit</summary>
                  <div class="seasonal-best-time">
                    <div class="cruise-seasons-grid">
                      <div class="cruise-season cruise-season-high"><span class="season-label">Peak Season</span><span class="season-months">${peakMonths}</span></div>
                      <div class="cruise-season cruise-season-transitional"><span class="season-label">Transitional Season</span><span class="season-months">${transitionalMonths}</span></div>
                      <div class="cruise-season cruise-season-low"><span class="season-label">Low Season</span><span class="season-months">${lowMonths}</span></div>
                    </div>
                    <div class="best-months-activities">
                      <div class="activity-row"><span class="activity-label">Beach</span><span class="activity-months">${peakMonths}</span></div>
                      <div class="activity-row"><span class="activity-label">Snorkeling</span><span class="activity-months">${peakMonths}</span></div>
                      <div class="activity-row"><span class="activity-label">Hiking</span><span class="activity-months">${peakMonths}</span></div>
                      <div class="activity-row"><span class="activity-label">City Walking</span><span class="activity-months">${peakMonths}</span></div>
                      <div class="activity-row"><span class="activity-label">Low Crowds</span><span class="activity-months">${lowMonths.split(',').slice(0,3).join(',')}</span></div>
                    </div>
                    <div class="months-to-avoid">
                      <span class="avoid-label">Consider avoiding:</span>
                      <span class="avoid-months">${avoidMonths}</span>
                      <span class="avoid-reason">${avoidReason}</span>
                    </div>
                  </div>
                </details>

                <details class="seasonal-section">
                  <summary class="seasonal-section-title">What Catches Visitors Off Guard</summary>
                  <div class="seasonal-catches">
                    <ul class="catches-list">
                      <li>Weather can change quickly — always have a backup plan</li>
                      <li>Peak season means more crowds at popular attractions</li>
                      <li>Sun can be intense even on cloudy days — sunscreen essential</li>
                      <li>Local holidays may affect attraction hours and availability</li>
                      <li>Check ship excursion timing against sunset and weather</li>
                    </ul>
                  </div>
                </details>

                <details class="seasonal-section">
                  <summary class="seasonal-section-title">Packing Tips</summary>
                  <div class="seasonal-packing">
                    <ul class="packing-list">
                      <li>Sunscreen and sunglasses — essential year-round</li>
                      <li>Light layers for variable temperatures</li>
                      <li>Comfortable walking shoes for exploring</li>
                      <li>Rain jacket or compact umbrella</li>
                      <li>Camera to capture the memories</li>
                    </ul>
                  </div>
                </details>

                <details class="seasonal-section" open>
                  <summary class="seasonal-section-title">Weather Hazards</summary>
                  <div class="seasonal-hazards">
                    <div class="hazard-warning">
                      <span class="hazard-icon">⚠️</span>
                      <div class="hazard-content">
                        <strong>${hazardType}</strong>
                        <p>Season: ${hazardSeason}</p>
                        <p>Peak risk: ${hazardPeak}</p>
                        <p class="hazard-note">${hazardNote}</p>
                      </div>
                    </div>
                  </div>
                </details>

                <p class="weather-noscript-note"><em>Enable JavaScript for live weather conditions and 48-hour forecast.</em></p>
              </div>
            </noscript>
              </div>
            </div>
          </details>
        </section>

`;

    // Insert after last-reviewed or after hero
    const insertPatterns = [
      { regex: /(<p class="last-reviewed">[^<]+<\/p>)\s*\n/, after: '$1\n' + weatherSection },
      { regex: /(<\/section>)\s*\n\s*(<!-- LOGBOOK)/, after: '$1\n' + weatherSection + '\n        $2' }
    ];

    for (const pattern of insertPatterns) {
      if (pattern.regex.test(this.content)) {
        this.content = this.content.replace(pattern.regex, pattern.after);
        this.log('fix', 'Added weather section');
        return;
      }
    }

    this.log('skip', 'Could not find insertion point for weather section');
  }

  makeSectionsCollapsible() {
    const sections = [
      'logbook', 'cruise-port', 'getting-around', 'port-map-section',
      'beaches', 'excursions', 'food', 'notices', 'depth-soundings',
      'practical', 'faq', 'gallery', 'credits'
    ];

    for (const sectionId of sections) {
      // Check if already collapsible
      const alreadyCollapsible = new RegExp(`id="${sectionId}"[^>]*>[\\s\\S]{0,200}<details class="section-collapse"`);
      if (alreadyCollapsible.test(this.content)) continue;

      // Find the section and make it collapsible
      // We need to find: <section...id="xxx"...><h2>Title</h2>...content...</section>
      // And transform to: <section...id="xxx"...><details class="section-collapse" open><summary><h2>Title</h2></summary><div class="section-body">...content...</div></details></section>

      const sectionPattern = new RegExp(
        `(<section[^>]*id="${sectionId}"[^>]*>)\\s*(<h[23])>([^<]+)<\\/h[23]>([\\s\\S]*?)(\\s*<\\/section>)`,
        'i'
      );

      const match = this.content.match(sectionPattern);
      if (!match) continue;

      const [fullMatch, sectionOpen, hTag, title, content, sectionClose] = match;

      const replacement = `${sectionOpen}
          <details class="section-collapse" open>
            <summary>${hTag}>${title}</h2></summary>
            <div class="section-body">${content}
            </div>
          </details>${sectionClose}`;

      this.content = this.content.replace(fullMatch, replacement);
      this.log('fix', `Made ${sectionId} section collapsible`);
    }
  }

  addWeatherFAQs() {
    const info = this.getPortInfo();

    // First, check if FAQ section exists. If not, create one.
    if (!this.content.includes('id="faq"')) {
      this.createFAQSection(info);
      return; // createFAQSection will add all the FAQs
    }

    // Check for missing weather FAQs
    const hasBestTime = /Q:.*best time.*visit|Q:.*when.*visit/i.test(this.content);
    const hasStorm = /Q:.*hurricane|Q:.*cyclone|Q:.*storm season/i.test(this.content);
    const hasPacking = /Q:.*pack.*weather|Q:.*what.*pack/i.test(this.content);
    const hasRain = /Q:.*rain.*ruin|Q:.*afternoon.*rain/i.test(this.content);

    if (hasBestTime && hasStorm && hasPacking && hasRain) {
      this.log('skip', 'All weather FAQs already present');
      return;
    }

    const faqs = [];

    if (!hasBestTime) {
      faqs.push(`<p><strong>Q: What's the best time of year to visit ${info.name}?</strong><br>A: Peak cruise season offers the most reliable weather and best conditions for sightseeing. Check the weather guide above for specific month recommendations based on your planned activities.</p>`);
    }

    if (!hasStorm) {
      faqs.push(`<p><strong>Q: Does ${info.name} have a hurricane or storm season?</strong><br>A: Weather patterns vary by region and season. Check the weather hazards section above for specific storm season concerns and timing. Cruise lines closely monitor weather conditions and will adjust itineraries if needed for passenger safety. Travel insurance is recommended for cruises during peak storm season months.</p>`);
    }

    if (!hasPacking) {
      faqs.push(`<p><strong>Q: What should I pack for ${info.name}'s weather?</strong><br>A: Essentials include sunscreen, comfortable walking shoes, and layers for variable conditions. Check the packing tips section in our weather guide for destination-specific recommendations.</p>`);
    }

    if (!hasRain) {
      faqs.push(`<p><strong>Q: Will rain ruin my port day?</strong><br>A: Brief showers are common in many destinations but rarely last long enough to significantly impact your day. Have a backup plan for indoor attractions, and remember that many activities continue in light rain. Check the weather forecast before your visit.</p>`);
    }

    if (faqs.length > 0) {
      // Find the FAQ section and append
      const faqInsert = faqs.join('\n\n          ');
      const faqPattern = /(id="faq"[\s\S]*?)(<\/section>)/;

      if (faqPattern.test(this.content)) {
        this.content = this.content.replace(faqPattern, `$1\n          ${faqInsert}\n        $2`);
        this.log('fix', `Added ${faqs.length} weather FAQ(s)`);
      }
    }
  }

  createFAQSection(info) {
    const faqSection = `
        <!-- FAQ SECTION -->
        <section class="port-section" id="faq">
          <details class="section-collapse" open>
            <summary><h2>Frequently Asked Questions</h2></summary>
            <div class="section-body">
          <p><strong>Q: What's the best time of year to visit ${info.name}?</strong><br>A: Peak cruise season offers the most reliable weather and best conditions for sightseeing. Check the weather guide above for specific month recommendations based on your planned activities.</p>

          <p><strong>Q: Does ${info.name} have a hurricane or storm season?</strong><br>A: Weather patterns vary by region and season. Check the weather hazards section above for specific storm season concerns and timing. Cruise lines closely monitor weather conditions and will adjust itineraries if needed for passenger safety. Travel insurance is recommended for cruises during peak storm season months.</p>

          <p><strong>Q: What should I pack for ${info.name}'s weather?</strong><br>A: Essentials include sunscreen, comfortable walking shoes, and layers for variable conditions. Check the packing tips section in our weather guide for destination-specific recommendations.</p>

          <p><strong>Q: Will rain ruin my port day?</strong><br>A: Brief showers are common in many destinations but rarely last long enough to significantly impact your day. Have a backup plan for indoor attractions, and remember that many activities continue in light rain. Check the weather forecast before your visit.</p>
            </div>
          </details>
        </section>

`;

    // Try to insert before </article> or before the rail/aside
    const insertPatterns = [
      { regex: /(\s*<\/article>)/, replace: faqSection + '$1' },
      { regex: /(\s*<aside class="rail")/, replace: faqSection + '$1' },
      { regex: /(\s*<p[^>]*><a[^>]*>← Back)/, replace: faqSection + '$1' }
    ];

    for (const pattern of insertPatterns) {
      if (pattern.regex.test(this.content)) {
        this.content = this.content.replace(pattern.regex, pattern.replace);
        this.log('fix', 'Created FAQ section with weather FAQs');
        return;
      }
    }

    this.log('skip', 'Could not find insertion point for FAQ section');
  }

  addWeatherScript() {
    if (this.content.includes('port-weather.js')) {
      this.log('skip', 'Weather script already present');
      return;
    }

    const scriptTag = '  <!-- Port Weather Widget -->\n  <script type="module" src="/assets/js/port-weather.js"></script>\n';

    // Try multiple patterns for inserting the script
    if (this.content.includes('</body></html>')) {
      this.content = this.content.replace('</body></html>', scriptTag + '</body></html>');
      this.log('fix', 'Added weather script');
    } else if (this.content.match(/<\/body>\s*<\/html>/)) {
      this.content = this.content.replace(/<\/body>(\s*)<\/html>/, scriptTag + '</body>$1</html>');
      this.log('fix', 'Added weather script');
    } else if (this.content.includes('</body>')) {
      this.content = this.content.replace('</body>', scriptTag + '</body>');
      this.log('fix', 'Added weather script');
    } else {
      this.log('skip', 'Could not find insertion point for weather script');
    }
  }

  fixShoulderSeason() {
    // Replace "Shoulder Season" with "Transitional Season" (case-insensitive)
    if (/shoulder\s+season/i.test(this.content)) {
      // Replace various forms
      this.content = this.content.replace(/Shoulder Season/gi, 'Transitional Season');
      this.content = this.content.replace(/shoulder season/gi, 'transitional season');
      this.content = this.content.replace(/shoulder seasons/gi, 'transitional periods');
      this.content = this.content.replace(/cruise-season-shoulder/g, 'cruise-season-transitional');
      this.log('fix', 'Replaced "Shoulder Season" with "Transitional Season"');
    }
  }

  fixCreditsSection() {
    // Some pages have a malformed credits section without h2 - fix it
    const badCreditsPattern = /<section\s+id="credits">\s*<footer/;
    if (badCreditsPattern.test(this.content)) {
      // This is a malformed structure - credits section should not contain footer
      // Remove the credits section wrapper and leave just the footer
      this.content = this.content.replace(/<section\s+id="credits">\s*(<footer)/g, '$1');
      this.content = this.content.replace(/<\/section>\s*(<\/main>)/g, '$1');
      this.log('fix', 'Removed malformed credits section wrapper');
    }
  }

  repair() {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`REPAIRING: ${this.filePath}`);
    console.log(`${'='.repeat(70)}\n`);

    if (!this.loadFile()) return false;

    // Run repairs
    this.createPlaceholderImages();
    this.addWeatherSection();
    this.makeSectionsCollapsible();
    this.addWeatherFAQs();
    this.addWeatherScript();
    this.fixShoulderSeason();
    this.fixCreditsSection();

    // Save
    this.saveFile();

    console.log(`\n✅ Repairs complete: ${this.repairs.length} fixes applied`);
    return true;
  }
}

// CLI
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('Usage: node scripts/repair-port.js <port-file.html>');
  console.log('       node scripts/repair-port.js --all');
  process.exit(0);
}

if (args[0] === '--all') {
  const portsDir = path.join(__dirname, '..', 'ports');
  const files = fs.readdirSync(portsDir).filter(f => f.endsWith('.html')).sort();

  console.log(`Found ${files.length} port files to repair\n`);

  for (const file of files) {
    const repairer = new PortRepairer(path.join(portsDir, file));
    repairer.repair();
  }
} else {
  const repairer = new PortRepairer(args[0]);
  repairer.repair();
}
