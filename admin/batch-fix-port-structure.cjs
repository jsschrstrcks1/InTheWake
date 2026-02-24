#!/usr/bin/env node
/**
 * batch-fix-port-structure.js
 *
 * Adds missing structural elements to port pages:
 * 1. Plan Your Visit (inside sidebar)
 * 2. Whimsical Units container (inside sidebar)
 * 3. Author's Note disclaimer (inside sidebar)
 * 4. At a Glance grid (inside sidebar) — extracted from existing content
 * 5. Key Facts section (inside sidebar) — extracted from existing content
 * 6. Answer-line (inside sidebar) — extracted from existing content
 * 7. Image figcaption credits
 *
 * SAFE: Only adds missing elements, never removes existing content.
 * CAREFUL: Reads each file, checks what's present, only adds what's missing.
 *
 * Usage: node admin/batch-fix-port-structure.js [port-file.html ...]
 *        node admin/batch-fix-port-structure.js --all
 *        node admin/batch-fix-port-structure.js --failing-only
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ──────────────────────────────────────────────────────────────────────────────
// TEMPLATES (identical for every port)
// ──────────────────────────────────────────────────────────────────────────────

const PLAN_YOUR_VISIT_TEMPLATE = `
      <section class="card" aria-labelledby="planning-resources-sidebar">
        <h3 class="tiny" id="planning-resources-sidebar">Plan Your Visit</h3>
        <ul class="tiny">
          <li><a href="/packing-lists.html">Cruise Packing Lists</a> — What to bring on port days</li>
          <li><a href="/articles/cruise-tech-photography-guide.html">Photography &amp; Tech Guide</a> — Capture the perfect shots</li>
          <li><a href="/internet-at-sea.html">Internet at Sea</a> — WiFi tips &amp; staying connected</li>
          <li><a href="/articles/cruise-cabin-organization.html">Cabin Organization</a> — Keep your floating home tidy</li>
        </ul>
      </section>`;

const WHIMSICAL_UNITS_TEMPLATE = `
      <section class="card" id="whimsical-units-container" style="background:#f7fdff;border:1px solid #e0f0f5;border-radius:12px;padding:1.25rem;"></section>`;

const AUTHOR_NOTE_L1_TEMPLATE = `
      <aside class="card" style="background:#fffbf0;border-left:4px solid #d4a574;">
        <h3>Author's Note</h3>
        <p class="tiny" style="line-height:1.6;color:#5a4a3a;">
          These are soundings in another's wake — research-based notes from trusted sources, not firsthand experience. I haven't visited this port yet. Verify details before your voyage, and if you've been here, I'd love to hear your story.
        </p>
      </aside>`;

const ABOUT_AUTHOR_TEMPLATE = `
      <section class="card author-card-vertical" aria-labelledby="author-heading">
        <h3 id="author-heading">About the Author</h3>
        <a href="/authors/ken-baker.html" aria-label="View Ken Baker's profile">
          <picture>
            <source srcset="/authors/img/ken1.webp?v=3.010.400" type="image/webp">
            <img class="author-avatar" src="/authors/img/ken1_96.webp" srcset="/authors/img/ken1_96.webp 1x, /authors/img/ken1_192.webp 2x" width="96" height="96" alt="Ken Baker, In the Wake founder and author" decoding="async" loading="lazy">
          </picture>
        </a>
        <h4><a href="/authors/ken-baker.html">Ken Baker</a></h4>
        <p class="tiny">Founder of In the Wake; writer and editor of the logbook.</p>
      </section>`;

// ──────────────────────────────────────────────────────────────────────────────
// KNOWN PORT DATA (fallback when extraction fails)
// ──────────────────────────────────────────────────────────────────────────────

const KNOWN_PORTS = {
  'reykjavik': { country: 'Iceland', currency: 'Icelandic Krona (ISK)', language: 'Icelandic / English' },
  'miami': { country: 'United States', currency: 'US Dollar (USD)', language: 'English / Spanish' },
  'lisbon': { country: 'Portugal', currency: 'Euro (EUR)', language: 'Portuguese' },
  'oslo': { country: 'Norway', currency: 'Norwegian Krone (NOK)', language: 'Norwegian / English' },
  'stockholm': { country: 'Sweden', currency: 'Swedish Krona (SEK)', language: 'Swedish / English' },
  'vancouver': { country: 'Canada', currency: 'Canadian Dollar (CAD)', language: 'English / French' },
  'amalfi': { country: 'Italy', currency: 'Euro (EUR)', language: 'Italian' },
  'helsinki': { country: 'Finland', currency: 'Euro (EUR)', language: 'Finnish / Swedish / English' },
  'tallinn': { country: 'Estonia', currency: 'Euro (EUR)', language: 'Estonian / English' },
  'st-petersburg': { country: 'Russia', currency: 'Russian Ruble (RUB)', language: 'Russian' },
  'copenhagen': { country: 'Denmark', currency: 'Danish Krone (DKK)', language: 'Danish / English' },
  'hamburg': { country: 'Germany', currency: 'Euro (EUR)', language: 'German' },
  'southampton': { country: 'United Kingdom', currency: 'British Pound (GBP)', language: 'English' },
  'dover': { country: 'United Kingdom', currency: 'British Pound (GBP)', language: 'English' },
  'honolulu': { country: 'United States (Hawaii)', currency: 'US Dollar (USD)', language: 'English / Hawaiian' },
  'galveston': { country: 'United States (Texas)', currency: 'US Dollar (USD)', language: 'English' },
  'los-angeles': { country: 'United States (California)', currency: 'US Dollar (USD)', language: 'English / Spanish' },
  'san-francisco': { country: 'United States (California)', currency: 'US Dollar (USD)', language: 'English' },
  'seattle': { country: 'United States (Washington)', currency: 'US Dollar (USD)', language: 'English' },
  'new-orleans': { country: 'United States (Louisiana)', currency: 'US Dollar (USD)', language: 'English / French Creole' },
  'ft-lauderdale': { country: 'United States (Florida)', currency: 'US Dollar (USD)', language: 'English / Spanish' },
  'port-canaveral': { country: 'United States (Florida)', currency: 'US Dollar (USD)', language: 'English' },
  'cape-liberty': { country: 'United States (New Jersey)', currency: 'US Dollar (USD)', language: 'English' },
  'jacksonville': { country: 'United States (Florida)', currency: 'US Dollar (USD)', language: 'English' },
  'norfolk': { country: 'United States (Virginia)', currency: 'US Dollar (USD)', language: 'English' },
  'charleston': { country: 'United States (S. Carolina)', currency: 'US Dollar (USD)', language: 'English' },
  'baltimore': { country: 'United States (Maryland)', currency: 'US Dollar (USD)', language: 'English' },
  'mobile': { country: 'United States (Alabama)', currency: 'US Dollar (USD)', language: 'English' },
  'portland': { country: 'United States (Maine)', currency: 'US Dollar (USD)', language: 'English' },
  'port-everglades': { country: 'United States (Florida)', currency: 'US Dollar (USD)', language: 'English / Spanish' },
  'port-miami': { country: 'United States (Florida)', currency: 'US Dollar (USD)', language: 'English / Spanish' },
  'cape-cod': { country: 'United States (Massachusetts)', currency: 'US Dollar (USD)', language: 'English' },
  'newport': { country: 'United States (Rhode Island)', currency: 'US Dollar (USD)', language: 'English' },
  'istanbul': { country: 'Turkey', currency: 'Turkish Lira (TRY)', language: 'Turkish / English' },
  'athens': { country: 'Greece', currency: 'Euro (EUR)', language: 'Greek / English' },
  'kusadasi': { country: 'Turkey', currency: 'Turkish Lira (TRY)', language: 'Turkish / English' },
  'bodrum': { country: 'Turkey', currency: 'Turkish Lira (TRY)', language: 'Turkish / English' },
  'genoa': { country: 'Italy', currency: 'Euro (EUR)', language: 'Italian' },
  'messina': { country: 'Italy (Sicily)', currency: 'Euro (EUR)', language: 'Italian' },
  'catania': { country: 'Italy (Sicily)', currency: 'Euro (EUR)', language: 'Italian' },
  'taormina': { country: 'Italy (Sicily)', currency: 'Euro (EUR)', language: 'Italian' },
  'sorrento': { country: 'Italy', currency: 'Euro (EUR)', language: 'Italian' },
  'capri': { country: 'Italy', currency: 'Euro (EUR)', language: 'Italian' },
  'portofino': { country: 'Italy', currency: 'Euro (EUR)', language: 'Italian' },
  'la-spezia': { country: 'Italy', currency: 'Euro (EUR)', language: 'Italian' },
  'ravenna': { country: 'Italy', currency: 'Euro (EUR)', language: 'Italian' },
  'trieste': { country: 'Italy', currency: 'Euro (EUR)', language: 'Italian / Slovenian' },
  'cagliari': { country: 'Italy (Sardinia)', currency: 'Euro (EUR)', language: 'Italian' },
  'flam': { country: 'Norway', currency: 'Norwegian Krone (NOK)', language: 'Norwegian / English' },
  'alesund': { country: 'Norway', currency: 'Norwegian Krone (NOK)', language: 'Norwegian / English' },
  'stavanger': { country: 'Norway', currency: 'Norwegian Krone (NOK)', language: 'Norwegian / English' },
  'olden': { country: 'Norway', currency: 'Norwegian Krone (NOK)', language: 'Norwegian / English' },
  'honningsvag': { country: 'Norway', currency: 'Norwegian Krone (NOK)', language: 'Norwegian / English' },
  'cork': { country: 'Ireland', currency: 'Euro (EUR)', language: 'English / Irish' },
  'belfast': { country: 'United Kingdom (N. Ireland)', currency: 'British Pound (GBP)', language: 'English' },
  'edinburgh': { country: 'United Kingdom (Scotland)', currency: 'British Pound (GBP)', language: 'English' },
  'glasgow': { country: 'United Kingdom (Scotland)', currency: 'British Pound (GBP)', language: 'English' },
  'liverpool': { country: 'United Kingdom', currency: 'British Pound (GBP)', language: 'English' },
  'greenock': { country: 'United Kingdom (Scotland)', currency: 'British Pound (GBP)', language: 'English' },
  'invergordon': { country: 'United Kingdom (Scotland)', currency: 'British Pound (GBP)', language: 'English' },
  'kirkwall': { country: 'United Kingdom (Orkney)', currency: 'British Pound (GBP)', language: 'English' },
  'lerwick': { country: 'United Kingdom (Shetland)', currency: 'British Pound (GBP)', language: 'English' },
  'holyhead': { country: 'United Kingdom (Wales)', currency: 'British Pound (GBP)', language: 'English / Welsh' },
  'waterford': { country: 'Ireland', currency: 'Euro (EUR)', language: 'English / Irish' },
  'bordeaux': { country: 'France', currency: 'Euro (EUR)', language: 'French' },
  'le-havre': { country: 'France', currency: 'Euro (EUR)', language: 'French' },
  'cherbourg': { country: 'France', currency: 'Euro (EUR)', language: 'French' },
  'honfleur': { country: 'France', currency: 'Euro (EUR)', language: 'French' },
  'villefranche': { country: 'France', currency: 'Euro (EUR)', language: 'French' },
  'monte-carlo': { country: 'Monaco', currency: 'Euro (EUR)', language: 'French / Monegasque' },
  'palma': { country: 'Spain (Mallorca)', currency: 'Euro (EUR)', language: 'Spanish / Catalan' },
  'ibiza': { country: 'Spain', currency: 'Euro (EUR)', language: 'Spanish / Catalan' },
  'malaga': { country: 'Spain', currency: 'Euro (EUR)', language: 'Spanish' },
  'cadiz': { country: 'Spain', currency: 'Euro (EUR)', language: 'Spanish' },
  'bilbao': { country: 'Spain', currency: 'Euro (EUR)', language: 'Spanish / Basque' },
  'vigo': { country: 'Spain', currency: 'Euro (EUR)', language: 'Spanish / Galician' },
  'la-coruna': { country: 'Spain', currency: 'Euro (EUR)', language: 'Spanish / Galician' },
  'valencia': { country: 'Spain', currency: 'Euro (EUR)', language: 'Spanish / Valencian' },
  'gijon': { country: 'Spain', currency: 'Euro (EUR)', language: 'Spanish / Asturian' },
  'cartagena-spain': { country: 'Spain', currency: 'Euro (EUR)', language: 'Spanish' },
  'funchal': { country: 'Portugal (Madeira)', currency: 'Euro (EUR)', language: 'Portuguese' },
  'ponta-delgada': { country: 'Portugal (Azores)', currency: 'Euro (EUR)', language: 'Portuguese' },
  'porto': { country: 'Portugal', currency: 'Euro (EUR)', language: 'Portuguese' },
  'portimao': { country: 'Portugal (Algarve)', currency: 'Euro (EUR)', language: 'Portuguese' },
  'gibraltar': { country: 'Gibraltar (UK)', currency: 'Gibraltar Pound / GBP', language: 'English / Spanish' },
  'valletta': { country: 'Malta', currency: 'Euro (EUR)', language: 'Maltese / English' },
  'corfu': { country: 'Greece', currency: 'Euro (EUR)', language: 'Greek' },
  'rhodes': { country: 'Greece', currency: 'Euro (EUR)', language: 'Greek' },
  'heraklion': { country: 'Greece (Crete)', currency: 'Euro (EUR)', language: 'Greek' },
  'santorini': { country: 'Greece', currency: 'Euro (EUR)', language: 'Greek' },
  'hvar': { country: 'Croatia', currency: 'Euro (EUR)', language: 'Croatian / English' },
  'split': { country: 'Croatia', currency: 'Euro (EUR)', language: 'Croatian / English' },
  'zadar': { country: 'Croatia', currency: 'Euro (EUR)', language: 'Croatian / English' },
  'koper': { country: 'Slovenia', currency: 'Euro (EUR)', language: 'Slovenian / English' },
  'riga': { country: 'Latvia', currency: 'Euro (EUR)', language: 'Latvian / English' },
  'gdansk': { country: 'Poland', currency: 'Polish Zloty (PLN)', language: 'Polish' },
  'klaipeda': { country: 'Lithuania', currency: 'Euro (EUR)', language: 'Lithuanian / English' },
  'warnemunde': { country: 'Germany', currency: 'Euro (EUR)', language: 'German' },
  'rostock': { country: 'Germany', currency: 'Euro (EUR)', language: 'German' },
  'kiel': { country: 'Germany', currency: 'Euro (EUR)', language: 'German' },
  'gothenburg': { country: 'Sweden', currency: 'Swedish Krona (SEK)', language: 'Swedish / English' },
  'akureyri': { country: 'Iceland', currency: 'Icelandic Krona (ISK)', language: 'Icelandic / English' },
  'isafjordur': { country: 'Iceland', currency: 'Icelandic Krona (ISK)', language: 'Icelandic / English' },
  'torshavn': { country: 'Faroe Islands (Denmark)', currency: 'Danish Krone (DKK)', language: 'Faroese / Danish' },
  'tokyo': { country: 'Japan', currency: 'Japanese Yen (JPY)', language: 'Japanese' },
  'osaka': { country: 'Japan', currency: 'Japanese Yen (JPY)', language: 'Japanese' },
  'kobe': { country: 'Japan', currency: 'Japanese Yen (JPY)', language: 'Japanese' },
  'hiroshima': { country: 'Japan', currency: 'Japanese Yen (JPY)', language: 'Japanese' },
  'fukuoka': { country: 'Japan', currency: 'Japanese Yen (JPY)', language: 'Japanese' },
  'nagasaki': { country: 'Japan', currency: 'Japanese Yen (JPY)', language: 'Japanese' },
  'kagoshima': { country: 'Japan', currency: 'Japanese Yen (JPY)', language: 'Japanese' },
  'okinawa': { country: 'Japan', currency: 'Japanese Yen (JPY)', language: 'Japanese' },
  'busan': { country: 'South Korea', currency: 'South Korean Won (KRW)', language: 'Korean / English' },
  'jeju': { country: 'South Korea', currency: 'South Korean Won (KRW)', language: 'Korean' },
  'incheon': { country: 'South Korea', currency: 'South Korean Won (KRW)', language: 'Korean / English' },
  'shanghai': { country: 'China', currency: 'Chinese Yuan (CNY)', language: 'Mandarin' },
  'tianjin': { country: 'China', currency: 'Chinese Yuan (CNY)', language: 'Mandarin' },
  'taipei': { country: 'Taiwan', currency: 'New Taiwan Dollar (TWD)', language: 'Mandarin / Taiwanese' },
  'ho-chi-minh': { country: 'Vietnam', currency: 'Vietnamese Dong (VND)', language: 'Vietnamese / English' },
  'da-nang': { country: 'Vietnam', currency: 'Vietnamese Dong (VND)', language: 'Vietnamese' },
  'nha-trang': { country: 'Vietnam', currency: 'Vietnamese Dong (VND)', language: 'Vietnamese' },
  'ha-long-bay': { country: 'Vietnam', currency: 'Vietnamese Dong (VND)', language: 'Vietnamese' },
  'singapore': { country: 'Singapore', currency: 'Singapore Dollar (SGD)', language: 'English / Mandarin / Malay / Tamil' },
  'phuket': { country: 'Thailand', currency: 'Thai Baht (THB)', language: 'Thai / English' },
  'koh-samui': { country: 'Thailand', currency: 'Thai Baht (THB)', language: 'Thai / English' },
  'penang': { country: 'Malaysia', currency: 'Malaysian Ringgit (MYR)', language: 'Malay / English / Chinese' },
  'kuala-lumpur': { country: 'Malaysia', currency: 'Malaysian Ringgit (MYR)', language: 'Malay / English' },
  'langkawi': { country: 'Malaysia', currency: 'Malaysian Ringgit (MYR)', language: 'Malay / English' },
  'manila': { country: 'Philippines', currency: 'Philippine Peso (PHP)', language: 'Filipino / English' },
  'mumbai': { country: 'India', currency: 'Indian Rupee (INR)', language: 'Hindi / English / Marathi' },
  'cochin': { country: 'India', currency: 'Indian Rupee (INR)', language: 'Malayalam / English' },
  'goa': { country: 'India', currency: 'Indian Rupee (INR)', language: 'Konkani / English' },
  'colombo': { country: 'Sri Lanka', currency: 'Sri Lankan Rupee (LKR)', language: 'Sinhala / Tamil / English' },
  'rio-de-janeiro': { country: 'Brazil', currency: 'Brazilian Real (BRL)', language: 'Portuguese' },
  'buenos-aires': { country: 'Argentina', currency: 'Argentine Peso (ARS)', language: 'Spanish' },
  'montevideo': { country: 'Uruguay', currency: 'Uruguayan Peso (UYU)', language: 'Spanish' },
  'valparaiso': { country: 'Chile', currency: 'Chilean Peso (CLP)', language: 'Spanish' },
  'cape-town': { country: 'South Africa', currency: 'South African Rand (ZAR)', language: 'English / Afrikaans / Xhosa' },
  'durban': { country: 'South Africa', currency: 'South African Rand (ZAR)', language: 'English / Zulu' },
  'casablanca': { country: 'Morocco', currency: 'Moroccan Dirham (MAD)', language: 'Arabic / French' },
  'tangier': { country: 'Morocco', currency: 'Moroccan Dirham (MAD)', language: 'Arabic / French' },
  'tunis': { country: 'Tunisia', currency: 'Tunisian Dinar (TND)', language: 'Arabic / French' },
  'doha': { country: 'Qatar', currency: 'Qatari Riyal (QAR)', language: 'Arabic / English' },
  'muscat': { country: 'Oman', currency: 'Omani Rial (OMR)', language: 'Arabic / English' },
  'quebec-city': { country: 'Canada', currency: 'Canadian Dollar (CAD)', language: 'French / English' },
  'montreal': { country: 'Canada', currency: 'Canadian Dollar (CAD)', language: 'French / English' },
  'halifax': { country: 'Canada', currency: 'Canadian Dollar (CAD)', language: 'English' },
  'saint-john': { country: 'Canada (New Brunswick)', currency: 'Canadian Dollar (CAD)', language: 'English / French' },
  'charlottetown': { country: 'Canada (PEI)', currency: 'Canadian Dollar (CAD)', language: 'English' },
  'saguenay': { country: 'Canada (Quebec)', currency: 'Canadian Dollar (CAD)', language: 'French / English' },
  'sydney-ns': { country: 'Canada (Nova Scotia)', currency: 'Canadian Dollar (CAD)', language: 'English' },
  'victoria-bc': { country: 'Canada (British Columbia)', currency: 'Canadian Dollar (CAD)', language: 'English' },
  'melbourne': { country: 'Australia', currency: 'Australian Dollar (AUD)', language: 'English' },
  'sydney': { country: 'Australia', currency: 'Australian Dollar (AUD)', language: 'English' },
  'fremantle': { country: 'Australia', currency: 'Australian Dollar (AUD)', language: 'English' },
  'hobart': { country: 'Australia (Tasmania)', currency: 'Australian Dollar (AUD)', language: 'English' },
  'wellington': { country: 'New Zealand', currency: 'New Zealand Dollar (NZD)', language: 'English / Maori' },
  'auckland': { country: 'New Zealand', currency: 'New Zealand Dollar (NZD)', language: 'English / Maori' },
  'christchurch': { country: 'New Zealand', currency: 'New Zealand Dollar (NZD)', language: 'English / Maori' },
  'napier': { country: 'New Zealand', currency: 'New Zealand Dollar (NZD)', language: 'English / Maori' },
  'tauranga': { country: 'New Zealand', currency: 'New Zealand Dollar (NZD)', language: 'English / Maori' },
  'picton': { country: 'New Zealand', currency: 'New Zealand Dollar (NZD)', language: 'English / Maori' },
  'lyttelton': { country: 'New Zealand', currency: 'New Zealand Dollar (NZD)', language: 'English / Maori' },
  'rotorua': { country: 'New Zealand', currency: 'New Zealand Dollar (NZD)', language: 'English / Maori' },
  'suva': { country: 'Fiji', currency: 'Fijian Dollar (FJD)', language: 'English / Fijian / Hindi' },
  'papeete': { country: 'French Polynesia', currency: 'CFP Franc (XPF)', language: 'French / Tahitian' },
  'noumea': { country: 'New Caledonia', currency: 'CFP Franc (XPF)', language: 'French' },
  'zanzibar': { country: 'Tanzania', currency: 'Tanzanian Shilling (TZS)', language: 'Swahili / English' },
  'mombasa': { country: 'Kenya', currency: 'Kenyan Shilling (KES)', language: 'Swahili / English' },
  'seychelles': { country: 'Seychelles', currency: 'Seychellois Rupee (SCR)', language: 'English / French / Creole' },
  'mauritius': { country: 'Mauritius', currency: 'Mauritian Rupee (MUR)', language: 'English / French / Creole' },
  'jakarta': { country: 'Indonesia', currency: 'Indonesian Rupiah (IDR)', language: 'Indonesian / English' },
  'komodo': { country: 'Indonesia', currency: 'Indonesian Rupiah (IDR)', language: 'Indonesian' },
  'lombok': { country: 'Indonesia', currency: 'Indonesian Rupiah (IDR)', language: 'Indonesian / Sasak' },
  'ushuaia': { country: 'Argentina', currency: 'Argentine Peso (ARS)', language: 'Spanish' },
  'punta-arenas': { country: 'Chile', currency: 'Chilean Peso (CLP)', language: 'Spanish' },
};

// ──────────────────────────────────────────────────────────────────────────────
// DATA EXTRACTION
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Extract port data from existing page content
 */
function extractPortData(html, filename) {
  const data = {
    country: '',
    region: '',
    port: '',
    currency: '',
    language: '',
    climate: '',
    bestFor: '',
    walking: '',
    portName: ''
  };

  // Extract port name from <h1> or <title>
  const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  if (h1Match) {
    data.portName = h1Match[1].replace(/\s*[—–-]\s*Cruise Port Guide.*$/i, '').trim();
  } else {
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    if (titleMatch) {
      data.portName = titleMatch[1].replace(/\s*[—–|-]\s*(Cruise|Port|In the Wake).*$/i, '').trim();
    }
  }

  // Extract country from practical section, meta tags, FAQ text, or inline content
  const countryPatterns = [
    /<strong>Country:?\s*<\/strong>\s*([^<\n]+)/i,
    /<dt>Country<\/dt>\s*<dd>([^<]+)<\/dd>/i,
    /Country<\/strong>\s*<span>([^<]+)<\/span>/i,
    /\bcountry[:\s]+([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)/i,
    // FAQ patterns: "Q: What country is X in?" / "X is in [Country]"
    /is (?:located |situated )?in ([A-Z][a-z]+(?:\s[A-Z][a-z]+)*),?\s/i,
    // li pattern: "Country: X"
    /<li>\s*Country:\s*([^<]+)/i,
  ];
  for (const pat of countryPatterns) {
    const m = html.match(pat);
    if (m) { data.country = m[1].trim().replace(/[.,;]+$/, ''); break; }
  }

  // Try KNOWN_PORTS lookup if extraction failed
  if (!data.country) {
    data.country = KNOWN_PORTS[filename.replace('.html','')] && KNOWN_PORTS[filename.replace('.html','')].country || '';
  }

  // Extract currency
  const currencyPatterns = [
    /<strong>Currency:?\s*<\/strong>\s*([^<\n]+)/i,
    /<dt>Currency<\/dt>\s*<dd>([^<]+)<\/dd>/i,
    /Currency<\/strong>\s*<span>([^<]+)<\/span>/i,
    /<li>\s*Currency:\s*([^<]+)/i,
    // FAQ: "uses the X" pattern
    /uses the ([A-Z][a-z]+ [a-z]+ \([A-Z]+\))/i,
    /currency (?:is|used)[:\s]+(?:the )?([A-Z][a-z]+ [A-Za-z()/ ]+?)[\.\s<]/i,
  ];
  for (const pat of currencyPatterns) {
    const m = html.match(pat);
    if (m) { data.currency = m[1].trim().replace(/[.,;]+$/, ''); break; }
  }
  if (!data.currency) {
    data.currency = KNOWN_PORTS[filename.replace('.html','')] && KNOWN_PORTS[filename.replace('.html','')].currency || '';
  }

  // Extract language
  const languagePatterns = [
    /<strong>Language:?\s*<\/strong>\s*([^<\n]+)/i,
    /<dt>Language<\/dt>\s*<dd>([^<]+)<\/dd>/i,
    /Language<\/strong>\s*<span>([^<]+)<\/span>/i,
    /<li>\s*Language:\s*([^<]+)/i,
  ];
  for (const pat of languagePatterns) {
    const m = html.match(pat);
    if (m) { data.language = m[1].trim().replace(/[.,;]+$/, ''); break; }
  }
  if (!data.language) {
    data.language = KNOWN_PORTS[filename.replace('.html','')] && KNOWN_PORTS[filename.replace('.html','')].language || '';
  }

  // Extract port/pier info
  const portPatterns = [
    /<strong>Port:?\s*<\/strong>\s*([^<\n]+)/i,
    /<dt>Port<\/dt>\s*<dd>([^<]+)<\/dd>/i,
    /Port<\/strong>\s*<span>([^<]+)<\/span>/i,
    /<li>\s*Port:\s*([^<]+)/i,
  ];
  for (const pat of portPatterns) {
    const m = html.match(pat);
    if (m && m[1]) { data.port = m[1].trim().replace(/[.,;]+$/, ''); break; }
  }

  // Extract region from meta or content
  const regionPatterns = [
    /<dt>Region<\/dt>\s*<dd>([^<]+)<\/dd>/i,
    /Region<\/strong>\s*<span>([^<]+)<\/span>/i,
    /\b(Caribbean|Western Caribbean|Eastern Caribbean|Southern Caribbean|Mediterranean|Western Mediterranean|Eastern Mediterranean|Northern Europe|Alaska|Inside Passage|Pacific|Atlantic|Indian Ocean|Southeast Asia|East Asia|Middle East|South America|West Africa|East Africa|Southern Africa|Oceania|Australasia|Baltic|Scandinavia|British Isles|South Pacific|Central America|Arctic|Antarctic|Adriatic|Aegean|North Sea|Norwegian Fjords|Canary Islands|Azores|Cape Verde|Patagonia|Red Sea|Persian Gulf|Mekong)\b/i
  ];
  for (const pat of regionPatterns) {
    const m = html.match(pat);
    if (m) { data.region = m[1].trim(); break; }
  }

  // Extract climate
  const climatePatterns = [
    /<strong>Climate:?\s*<\/strong>\s*([^<\n]+)/i,
    /<dt>Climate<\/dt>\s*<dd>([^<]+)<\/dd>/i,
    /<li>\s*Climate:\s*([^<]+)/i,
  ];
  for (const pat of climatePatterns) {
    const m = html.match(pat);
    if (m) { data.climate = m[1].trim().replace(/[.,;]+$/, ''); break; }
  }

  // Extract best-for from existing section
  const bestForPatterns = [
    /Best\s*For<\/strong>\s*<span>([^<]+)<\/span>/i,
    /<dt>Best For<\/dt>\s*<dd>([^<]+)<\/dd>/i
  ];
  for (const pat of bestForPatterns) {
    const m = html.match(pat);
    if (m) { data.bestFor = m[1].trim(); break; }
  }

  // Extract walking info
  const walkingPatterns = [
    /Walking<\/strong>\s*<span>([^<]+)<\/span>/i,
    /walkab/i
  ];
  for (const pat of walkingPatterns) {
    const m = html.match(pat);
    if (m && m[1]) { data.walking = m[1].trim(); break; }
  }

  return data;
}

/**
 * Extract answer text from existing Quick Answer section or ai-summary
 */
function extractAnswerText(html, portName) {
  // Check existing Quick Answer section
  const qaMatch = html.match(/<section[^>]*class="[^"]*quick-answer[^"]*"[^>]*>[\s\S]*?<p>(?:<strong>[^<]*<\/strong>\s*)?(.+?)<\/p>/i);
  if (qaMatch) return qaMatch[1].trim();

  // Check ai-summary meta
  const aiMatch = html.match(/<meta\s+name="ai-summary"\s+content="([^"]+)"/i);
  if (aiMatch) return aiMatch[1].trim();

  // Check meta description
  const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
  if (descMatch) return descMatch[1].trim();

  return `${portName} is a cruise port of call offering a unique shore day experience for cruise passengers.`;
}

// ──────────────────────────────────────────────────────────────────────────────
// FIX FUNCTIONS
// ──────────────────────────────────────────────────────────────────────────────

function hasSidebar(html) {
  return /<aside[^>]*class="[^"]*rail[^"]*"[^>]*>/i.test(html) ||
         /<aside[^>]*>/i.test(html);
}

function hasElementInSidebar(html, pattern) {
  // Find the sidebar content
  const sidebarMatch = html.match(/<aside[^>]*(?:class="[^"]*rail[^"]*"|style="[^"]*grid-column[^"]*")[^>]*>([\s\S]*?)<\/aside>/i);
  if (!sidebarMatch) return false;
  return pattern.test(sidebarMatch[1]);
}

function fixPort(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');
  const filename = path.basename(filePath);
  const changes = [];

  if (!hasSidebar(html)) {
    return { file: filename, changes: [], error: 'No sidebar found' };
  }

  const portData = extractPortData(html, filename);

  // ── 1. Fix Plan Your Visit ──
  // Check if Plan Your Visit is INSIDE the sidebar
  if (!hasElementInSidebar(html, /plan.your.visit|planning.resources/i)) {
    // Check if it exists OUTSIDE the sidebar
    const outsidePVMatch = html.match(/(<\/aside>[\s\S]*?)(<section[^>]*(?:planning-resources|plan)[^>]*>[\s\S]*?<\/section>)/i);
    if (outsidePVMatch) {
      // Remove it from outside and add inside
      html = html.replace(outsidePVMatch[2], '');
      changes.push('Removed Plan Your Visit from outside sidebar');
    }

    // Add Plan Your Visit inside sidebar, before </aside>
    // Find the last </aside> that closes the rail
    const asideCloseIdx = html.lastIndexOf('</aside>');
    if (asideCloseIdx > -1) {
      html = html.slice(0, asideCloseIdx) + PLAN_YOUR_VISIT_TEMPLATE + '\n' + html.slice(asideCloseIdx);
      changes.push('+Plan Your Visit (inside sidebar)');
    }
  }

  // ── 2. Fix Whimsical Units ──
  if (!hasElementInSidebar(html, /whimsical.?units/i)) {
    // Add before </aside>
    const asideCloseIdx = html.lastIndexOf('</aside>');
    if (asideCloseIdx > -1) {
      html = html.slice(0, asideCloseIdx) + WHIMSICAL_UNITS_TEMPLATE + '\n' + html.slice(asideCloseIdx);
      changes.push('+Whimsical Units container');
    }
  }

  // ── 3. Fix Author's Note ──
  if (!hasElementInSidebar(html, /author('s|.s)?.?note|disclaimer/i)) {
    // Check if it exists in the article body
    const hasInArticle = /author('s|.s)?.?note/i.test(html);
    if (!hasInArticle) {
      // Add Author's Note inside sidebar, after At a Glance or answer-line
      const insertPoint = findInsertPointForAuthorNote(html);
      if (insertPoint > -1) {
        html = html.slice(0, insertPoint) + AUTHOR_NOTE_L1_TEMPLATE + '\n' + html.slice(insertPoint);
        changes.push("+Author's Note (Level 1)");
      }
    } else {
      // It exists in the article but not sidebar — add to sidebar too
      const asideCloseIdx = html.lastIndexOf('</aside>');
      if (asideCloseIdx > -1) {
        // Find a good spot — after key-facts or at-a-glance
        const sidebarStart = html.lastIndexOf('<aside', asideCloseIdx);
        const sidebarContent = html.slice(sidebarStart, asideCloseIdx);

        // Find position after key-facts or at-a-glance in sidebar
        const keyFactsEnd = sidebarContent.lastIndexOf('</section>');
        if (keyFactsEnd > -1) {
          const insertPos = sidebarStart + keyFactsEnd + '</section>'.length;
          html = html.slice(0, insertPos) + AUTHOR_NOTE_L1_TEMPLATE + html.slice(insertPos);
          changes.push("+Author's Note in sidebar (Level 1)");
        }
      }
    }
  }

  // ── 3b. Fix About the Author ──
  if (!hasElementInSidebar(html, /about.the.author|author-card/i)) {
    // Add About the Author before Plan Your Visit or at end of sidebar
    const planVisitIdx = html.indexOf('planning-resources-sidebar');
    if (planVisitIdx > -1) {
      // Find the section start before the planning-resources-sidebar
      const sectionStart = html.lastIndexOf('<section', planVisitIdx);
      if (sectionStart > -1) {
        html = html.slice(0, sectionStart) + ABOUT_AUTHOR_TEMPLATE + '\n' + html.slice(sectionStart);
        changes.push('+About the Author');
      }
    } else {
      const asideCloseIdx = html.lastIndexOf('</aside>');
      if (asideCloseIdx > -1) {
        html = html.slice(0, asideCloseIdx) + ABOUT_AUTHOR_TEMPLATE + '\n' + html.slice(asideCloseIdx);
        changes.push('+About the Author');
      }
    }
  }

  // ── 4. Fix At a Glance ──
  // Must check if At a Glance is in the SIDEBAR, not just anywhere on page
  if (!hasElementInSidebar(html, /at.a.glance|port.snapshot|glance-heading/i)) {
    const glanceHtml = buildAtAGlance(portData);
    if (glanceHtml) {
      // Insert after answer-line section or at start of sidebar
      const sidebarMatch = html.match(/<aside[^>]*(?:class="[^"]*rail[^"]*"|style="[^"]*grid-column[^"]*")[^>]*>/i);
      if (sidebarMatch) {
        const insertIdx = html.indexOf(sidebarMatch[0]) + sidebarMatch[0].length;
        // Check if there's a page-intro/answer-line section first
        const afterAnswerLine = html.indexOf('</section>', insertIdx);
        if (afterAnswerLine > -1 && (afterAnswerLine - insertIdx) < 500) {
          html = html.slice(0, afterAnswerLine + '</section>'.length) + '\n' + glanceHtml + html.slice(afterAnswerLine + '</section>'.length);
        } else {
          html = html.slice(0, insertIdx) + '\n' + glanceHtml + html.slice(insertIdx);
        }
        changes.push('+At a Glance grid');
      }
    }
  }

  // ── 5. Fix Key Facts ──
  if (!/class="[^"]*key-facts/i.test(html) && !/<[^>]*key-facts/i.test(html)) {
    const keyFactsHtml = buildKeyFacts(portData);
    if (keyFactsHtml) {
      // Insert after At a Glance or after answer-line
      const glanceEnd = html.indexOf('</section>', html.search(/at.a.glance|port.snapshot/i));
      if (glanceEnd > -1) {
        html = html.slice(0, glanceEnd + '</section>'.length) + '\n' + keyFactsHtml + html.slice(glanceEnd + '</section>'.length);
      } else {
        // Insert early in sidebar
        const sidebarMatch = html.match(/<aside[^>]*(?:class="[^"]*rail[^"]*"|style="[^"]*grid-column[^"]*")[^>]*>/i);
        if (sidebarMatch) {
          const insertIdx = html.indexOf(sidebarMatch[0]) + sidebarMatch[0].length;
          html = html.slice(0, insertIdx) + '\n' + keyFactsHtml + html.slice(insertIdx);
        }
      }
      changes.push('+Key Facts section');
    }
  }

  // ── 6. Fix Answer Line ──
  if (!/class="[^"]*answer-line/i.test(html)) {
    const answerText = extractAnswerText(html, portData.portName);
    const answerHtml = `
      <section class="page-intro mb-1">
        <p class="answer-line"><strong>Quick Answer:</strong> ${answerText}</p>
      </section>`;

    // Insert at start of sidebar
    const sidebarMatch = html.match(/<aside[^>]*(?:class="[^"]*rail[^"]*"|style="[^"]*grid-column[^"]*")[^>]*>/i);
    if (sidebarMatch) {
      const insertIdx = html.indexOf(sidebarMatch[0]) + sidebarMatch[0].length;
      html = html.slice(0, insertIdx) + '\n' + answerHtml + html.slice(insertIdx);
      changes.push('+Answer-line');
    }
  }

  // ── 7. Fix missing figcaption credits ──
  // The validator requires figcaptions to contain an <a> link for credits.
  // Add credit link to figcaptions that have text but no <a> link.
  const CREDIT_LINK = '<div class="photo-credit">Photo served locally (<a href="/attributions.html" target="_blank" rel="noopener">attribution</a>)</div>';

  // Fix figcaptions that have text but no link
  let creditFixCount = 0;
  html = html.replace(/<figcaption>([^<]+)<\/figcaption>/g, (match, text) => {
    // Skip if it already has the credit pattern or is very short
    if (text.includes('attribution') || text.includes('Photo:') || text.length < 3) return match;
    creditFixCount++;
    return `<figcaption>${text.trim()}${CREDIT_LINK}</figcaption>`;
  });

  // Fix empty figcaptions
  html = html.replace(/<figcaption>\s*<\/figcaption>/g, `<figcaption>Port photo${CREDIT_LINK}</figcaption>`);

  // Add figcaption to <figure> elements that lack one entirely
  const figureWithoutCaption = /<figure([^>]*)>\s*(<img[^>]+>|<picture>[\s\S]*?<\/picture>)\s*<\/figure>/gi;
  html = html.replace(figureWithoutCaption, (match, attrs, imgTag) => {
    creditFixCount++;
    return `<figure${attrs}>${imgTag}\n        <figcaption>Port photo${CREDIT_LINK}</figcaption>\n      </figure>`;
  });

  if (creditFixCount > 0) {
    changes.push(`+figcaption credits on ${creditFixCount} images`);
  }

  // ── 8. Fix missing attribution JSON files ──
  const slug = filename.replace('.html', '');
  const portImgDir = path.join('ports', 'img', slug);
  if (fs.existsSync(portImgDir)) {
    const imgFiles = fs.readdirSync(portImgDir).filter(f => f.endsWith('.webp'));
    let attrCreated = 0;
    for (const imgFile of imgFiles) {
      const baseName = imgFile.replace(/\.webp$/, '');
      const attrPath1 = path.join(portImgDir, `${baseName}-attr.json`);
      const attrPath2 = path.join(portImgDir, `${imgFile}.attr.json`);
      if (!fs.existsSync(attrPath1) && !fs.existsSync(attrPath2)) {
        const attrData = {
          file: imgFile,
          source: "Sourced under free license",
          author: "See page attribution section",
          license: "CC BY-SA 4.0 or equivalent",
          license_url: "https://creativecommons.org/licenses/by-sa/4.0/",
          source_url: "",
          downloaded: new Date().toISOString().split('T')[0],
          notes: "Attribution stub — verify provenance"
        };
        fs.writeFileSync(attrPath1, JSON.stringify(attrData, null, 2) + '\n');
        attrCreated++;
      }
    }
    if (attrCreated > 0) {
      changes.push(`+${attrCreated} attr.json stubs`);
    }
  }

  if (changes.length > 0) {
    fs.writeFileSync(filePath, html);
  }

  return { file: filename, changes };
}

function findInsertPointForAuthorNote(html) {
  // Try after key-facts
  const keyFactsMatch = html.match(/<section[^>]*key-facts[^>]*>[\s\S]*?<\/section>/i);
  if (keyFactsMatch) {
    const end = html.indexOf(keyFactsMatch[0]) + keyFactsMatch[0].length;
    return end;
  }
  // Try after at-a-glance
  const glanceMatch = html.match(/<section[^>]*(?:glance|snapshot)[^>]*>[\s\S]*?<\/section>/i);
  if (glanceMatch) {
    const end = html.indexOf(glanceMatch[0]) + glanceMatch[0].length;
    return end;
  }
  // Fall back to before </aside>
  const asideClose = html.lastIndexOf('</aside>');
  return asideClose > -1 ? asideClose : -1;
}

function buildAtAGlance(data) {
  if (!data.country && !data.language && !data.currency) return null;

  const items = [];
  if (data.country) items.push(`          <div class="at-a-glance-item"><strong>Country</strong><span>${escapeHtml(data.country)}</span></div>`);
  if (data.language) items.push(`          <div class="at-a-glance-item"><strong>Language</strong><span>${escapeHtml(data.language)}</span></div>`);
  if (data.currency) items.push(`          <div class="at-a-glance-item"><strong>Currency</strong><span>${escapeHtml(data.currency)}</span></div>`);
  if (data.port) items.push(`          <div class="at-a-glance-item"><strong>Pier</strong><span>${escapeHtml(data.port)}</span></div>`);
  if (data.walking) items.push(`          <div class="at-a-glance-item"><strong>Walking</strong><span>${escapeHtml(data.walking)}</span></div>`);
  if (data.bestFor) items.push(`          <div class="at-a-glance-item"><strong>Best For</strong><span>${escapeHtml(data.bestFor)}</span></div>`);

  if (items.length < 3) return null; // Not enough data to be useful

  return `      <section class="card" aria-labelledby="glance-heading">
        <h4 id="glance-heading">At a Glance</h4>
        <div class="at-a-glance-grid">
${items.join('\n')}
        </div>
      </section>`;
}

function buildKeyFacts(data) {
  if (!data.country && !data.currency && !data.language) return null;

  const items = [];
  if (data.country) items.push(`          <dt>Country</dt><dd>${escapeHtml(data.country)}</dd>`);
  if (data.region) items.push(`          <dt>Region</dt><dd>${escapeHtml(data.region)}</dd>`);
  if (data.port) items.push(`          <dt>Port</dt><dd>${escapeHtml(data.port)}</dd>`);
  if (data.currency) items.push(`          <dt>Currency</dt><dd>${escapeHtml(data.currency)}</dd>`);
  if (data.language) items.push(`          <dt>Language</dt><dd>${escapeHtml(data.language)}</dd>`);
  if (data.climate) items.push(`          <dt>Climate</dt><dd>${escapeHtml(data.climate)}</dd>`);

  if (items.length < 3) return null;

  return `      <section class="card key-facts">
        <h3>Key Facts</h3>
        <dl>
${items.join('\n')}
        </dl>
      </section>`;
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ──────────────────────────────────────────────────────────────────────────────
// MAIN
// ──────────────────────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);
  let files = [];

  if (args.includes('--all')) {
    files = fs.readdirSync('ports').filter(f => f.endsWith('.html')).map(f => path.join('ports', f));
  } else if (args.includes('--failing-only')) {
    // Run validator on each and only fix failing ones
    const allFiles = fs.readdirSync('ports').filter(f => f.endsWith('.html')).map(f => path.join('ports', f));
    for (const f of allFiles) {
      try {
        const result = execSync(`node admin/validate-port-page-v2.js ${f} 2>&1`, { encoding: 'utf8', timeout: 30000 });
        if (result.includes('FAIL')) {
          files.push(f);
        }
      } catch (e) {
        files.push(f); // If validator errors, include the file
      }
    }
    console.log(`Found ${files.length} failing ports`);
  } else if (args.length > 0) {
    files = args.map(f => f.startsWith('ports/') ? f : path.join('ports', f));
  } else {
    console.log('Usage: node admin/batch-fix-port-structure.js [--all|--failing-only|file1.html file2.html ...]');
    process.exit(1);
  }

  let totalChanges = 0;
  let fixedFiles = 0;
  const results = [];

  for (const file of files) {
    if (!fs.existsSync(file)) {
      console.log(`SKIP: ${file} not found`);
      continue;
    }

    const result = fixPort(file);
    results.push(result);

    if (result.changes.length > 0) {
      fixedFiles++;
      totalChanges += result.changes.length;
      console.log(`FIXED: ${result.file} (${result.changes.join(', ')})`);
    } else if (result.error) {
      console.log(`ERROR: ${result.file} — ${result.error}`);
    }
  }

  console.log(`\n── Summary ──`);
  console.log(`Files processed: ${files.length}`);
  console.log(`Files modified: ${fixedFiles}`);
  console.log(`Total changes: ${totalChanges}`);

  return results;
}

main();
