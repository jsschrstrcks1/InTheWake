#!/usr/bin/env node
// build-voyage-alerts.mjs — the data behind each voyage companion's Alerts tab. Soli Deo Gloria.
//
// Reads four public sources and writes admin/voyage-pwa/alerts.json, which the companion reads
// (and keeps for offline use):
//   - CDC Vessel Sanitation Program: stomach-illness outbreaks posted for a ship
//   - US State Department travel advisories (levels 1 to 4)
//   - UK Foreign, Commonwealth & Development Office travel advice
//   - Government of Canada travel advice (advisory state 0 to 3, plus regional advisories)
// for every country a companion's itinerary calls at. A port this script cannot place is
// reported and fails the run; it is never skipped quietly.
//
// Colour rules (operator-approved 2026-09-26; words always accompany the colour):
//   red    US level 3 or 4 · UK advises against all or all-but-essential travel to the WHOLE
//          country · Canada state 2 or 3 · a CDC outbreak on this ship posted this month or last
//   yellow US level 2 · UK advice against travel to PARTS of the country · Canada state 1 or a
//          regional advisory · an older CDC outbreak on this ship
// A source that could not be read is recorded as unavailable. The companion shows that as
// "couldn't check", never as all clear.
//
// Usage:  node admin/scripts/build-voyage-alerts.mjs            write alerts.json
//         node admin/scripts/build-voyage-alerts.mjs --dry-run  print, write nothing
// Exit: 0 all sources read · 2 one or more sources unavailable (file still written) · 3 unmapped port
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const PWA = path.join(ROOT, 'admin/voyage-pwa');
export const OUT = path.join(PWA, 'alerts.json');

// Every port in the companions, to ISO 3166 country code. 'US' ports carry no foreign advisory.
export const PORT_COUNTRY = {
  'Port Canaveral, FL': 'US', 'PortMiami, FL': 'US', 'Miami, FL': 'US', 'Tampa, FL': 'US', 'Fort Lauderdale, FL': 'US',
  'Boston, MA': 'US', 'Seattle, WA': 'US', 'New Orleans, LA': 'US', 'San Juan, Puerto Rico': 'US', 'St. Thomas, USVI': 'US',
  'Charlotte Amalie, St. Thomas': 'US', 'Skagway, AK': 'US', 'Sitka, AK': 'US', 'Juneau + Endicott Arm': 'US',
  'San Francisco': 'US', 'Los Angeles': 'US', 'Portland, ME': 'US', 'Eastport, ME': 'US',
  'Cozumel, Mexico': 'MX', 'Costa Maya, Mexico': 'MX', 'Progreso, Mexico': 'MX',
  'Great Stirrup Cay': 'BS', 'Ocean Cay': 'BS', 'The Beach Club at Bimini': 'BS', 'Freeport, Grand Bahama': 'BS', 'CocoCay, Bahamas': 'BS',
  'Grand Cayman': 'KY', 'Ocho Rios, Jamaica': 'JM', 'Falmouth, Jamaica': 'JM',
  'Victoria, BC': 'CA', 'Vancouver, BC': 'CA', 'Halifax, NS': 'CA', 'Saint John, NB': 'CA',
  'Roatán, Honduras': 'HN', 'Bermuda (Kings Wharf)': 'BM', 'Tortola, BVI': 'VG', 'Philipsburg, St. Maarten': 'SX',
  'Bridgetown, Barbados': 'BB', 'Amber Cove, DR': 'DO',
  'Wellington, New Zealand': 'NZ', 'Tauranga, New Zealand': 'NZ', 'Picton, New Zealand': 'NZ', 'New Plymouth, New Zealand': 'NZ',
  'Auckland, New Zealand': 'NZ', 'Lyttelton (Christchurch), NZ': 'NZ',
  'Townsville, Australia': 'AU', 'Sydney, Australia': 'AU', 'Darwin, Australia': 'AU', 'Cairns, Australia': 'AU', 'Brisbane, Australia': 'AU',
  'Walvis Bay, Namibia': 'NA', 'Lüderitz, Namibia': 'NA', 'Ushuaia, Argentina': 'AR', 'Buenos Aires, Argentina': 'AR',
  'Takoradi, Ghana': 'GH', 'Singapore': 'SG', 'San Antonio (Santiago), Chile': 'CL', 'Punta Arenas, Chile': 'CL',
  'Puerto Montt, Chile': 'CL', 'Easter Island (Rapa Nui), Chile': 'CL', 'Rio de Janeiro, Brazil': 'BR', 'Recife, Brazil': 'BR',
  'Belém, Brazil': 'BR', 'Praia, Cape Verde': 'CV', 'Mindelo, Cape Verde': 'CV', 'Port Stanley, Falkland Islands': 'FK',
  'Port Louis, Mauritius': 'MU', 'Phuket, Thailand': 'TH', 'Papeete, Tahiti': 'PF', 'Moorea, French Polynesia': 'PF',
  'Bora Bora, French Polynesia': 'PF', 'Montevideo, Uruguay': 'UY', 'Malé, Maldives': 'MV', 'La Possession (Réunion), France': 'RE',
  'Komodo Island, Indonesia': 'ID', 'Bali (Benoa), Indonesia': 'ID', 'Durban, South Africa': 'ZA', 'Cape Town, South Africa': 'ZA',
  "Devil's Island, French Guiana": 'GF', 'Colombo, Sri Lanka': 'LK', "Abidjan, Côte d'Ivoire": 'CI',
};

// UK FCDO travel-advice page slugs (gov.uk/foreign-travel-advice/<slug>).
export const UK_SLUG = {
  MX: 'mexico', BS: 'bahamas', KY: 'cayman-islands', JM: 'jamaica', CA: 'canada', HN: 'honduras', BM: 'bermuda',
  VG: 'british-virgin-islands', SX: 'st-maarten', BB: 'barbados', DO: 'dominican-republic', NZ: 'new-zealand',
  AU: 'australia', NA: 'namibia', AR: 'argentina', GH: 'ghana', SG: 'singapore', CL: 'chile', BR: 'brazil',
  CV: 'cape-verde', FK: 'falkland-islands', MU: 'mauritius', TH: 'thailand', PF: 'french-polynesia', UY: 'uruguay',
  MV: 'maldives', RE: 'reunion', ID: 'indonesia', ZA: 'south-africa', GF: 'french-guiana', LK: 'sri-lanka', CI: 'cote-d-ivoire',
};

// The State Department feed files advisories under FIPS 10-4 codes (Bahamas BF, Cayman CJ), and the
// feed has errors: on 2026-09-26 the United Arab Emirates was filed under AR (Argentina's code) and
// Brazil was missing. So an advisory is used only when its code AND the country named at the start
// of its own title both agree. No agreeing entry: shown as "not found in the feed", never as clear.
export const US_NAME = {
  MX: 'Mexico', BS: 'The Bahamas', KY: 'Cayman Islands', JM: 'Jamaica', CA: 'Canada', HN: 'Honduras', BM: 'Bermuda',
  VG: 'British Virgin Islands', SX: 'Sint Maarten', BB: 'Barbados', DO: 'Dominican Republic', NZ: 'New Zealand',
  AU: 'Australia', NA: 'Namibia', AR: 'Argentina', GH: 'Ghana', SG: 'Singapore', CL: 'Chile', BR: 'Brazil',
  CV: 'Cabo Verde', MU: 'Mauritius', TH: 'Thailand', PF: 'French Polynesia', UY: 'Uruguay', MV: 'Maldives',
  ID: 'Indonesia', ZA: 'South Africa', GF: 'French Guiana', LK: 'Sri Lanka', CI: 'Cote d Ivoire',
};
const nameKey = (s) => slug(s).replace(/^the-/, '');
export function usFind(feed, iso) {
  const code = US_CODE[iso], name = US_NAME[iso];
  if (!code || !name) return null;
  const hits = (feed || []).filter((x) => (Array.isArray(x.Category) ? x.Category : [x.Category]).map(String).includes(code)
    && nameKey(x.Title).startsWith(nameKey(name)));
  return hits.length === 1 ? hits[0] : null;
}
export const US_CODE = {
  MX: 'MX', BS: 'BF', KY: 'CJ', JM: 'JM', CA: 'CA', HN: 'HO', BM: 'BD', VG: 'VI', SX: 'NN', BB: 'BB', DO: 'DR',
  NZ: 'NZ', AU: 'AS', NA: 'WA', AR: 'AR', GH: 'GH', SG: 'SN', CL: 'CI', BR: 'BR', CV: 'CV', MU: 'MP', TH: 'TH',
  PF: 'FP', UY: 'UY', MV: 'MV', ID: 'ID', ZA: 'SF', GF: 'A2', LK: 'CE', CI: 'IV',
};

export const RANK = { none: 0, yellow: 1, red: 2 };
const worse = (a, b) => (RANK[a] >= RANK[b] ? a : b);

export function usLevel(title) {
  const m = /Level\s*([1-4])/i.exec(String(title || ''));
  return m ? Number(m[1]) : null;
}
export function usColour(level) { return level >= 3 ? 'red' : level === 2 ? 'yellow' : 'none'; }

export function ukColour(statuses) {
  const s = (statuses || []).map(String);
  if (s.some((x) => /whole_country$/.test(x))) return 'red';
  if (s.some((x) => /_to_parts$/.test(x))) return 'yellow';
  return 'none';
}
export const UK_WORDS = {
  avoid_all_travel_to_whole_country: 'advises against all travel to the whole country',
  avoid_all_but_essential_travel_to_whole_country: 'advises against all but essential travel to the whole country',
  avoid_all_travel_to_parts: 'advises against all travel to parts of the country',
  avoid_all_but_essential_travel_to_parts: 'advises against all but essential travel to parts of the country',
};

export function caColour(state, regional) {
  if (state >= 2) return 'red';
  if (state === 1 || regional) return 'yellow';
  return 'none';
}
export const CA_WORDS = ['Take normal security precautions', 'Exercise a high degree of caution', 'Avoid non-essential travel', 'Avoid all travel'];

const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
// CDC links look like /vessel-sanitation/cruise-ship-outbreaks/caribbean-princess-may-2026.html
export function parseCdc(html) {
  const out = [];
  for (const m of String(html).matchAll(/href="([^"]*\/cruise-ship-outbreaks\/([a-z0-9-]+)-(january|february|march|april|may|june|july|august|september|october|november|december)-(\d{4})(?:-\d+)?\.html)"/g)) {
    const url = m[1].startsWith('http') ? m[1] : 'https://www.cdc.gov' + m[1];
    if (!out.some((o) => o.url === url)) out.push({ ship: m[2], month: MONTHS.indexOf(m[3]) + 1, year: Number(m[4]), url });
  }
  return out;
}
export const slug = (s) => String(s || '').normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
// CDC sometimes drops the brand ("insignia" for Oceania Insignia), so a bare core name also matches.
export function cdcFor(shipName, posts) {
  const full = slug(shipName);
  const core = full.replace(/^(norwegian|ncl|carnival|msc|celebrity|royal-caribbean|princess|holland-america|virgin|margaritaville-at-sea|oceania|regent|seabourn|silversea|cunard)-/, '');
  return posts.filter((p) => p.ship === full || p.ship === core || p.ship.endsWith('-' + full));
}
export function cdcColour(posts, now = new Date()) {
  let c = 'none';
  const ym = now.getUTCFullYear() * 12 + now.getUTCMonth();
  for (const p of posts) c = worse(c, ym - (p.year * 12 + p.month - 1) <= 1 ? 'red' : 'yellow');
  return c;
}

export function voyagesFromCompanions(dir = PWA) {
  const out = [], unmapped = [];
  for (const f of readdirSync(dir).filter((n) => n.endsWith('.html'))) {
    const s = readFileSync(path.join(dir, f), 'utf8');
    const slugM = /window\.__VOYAGE=\{slug:"([^"]+)"/.exec(s);
    if (!slugM) continue;
    const shipM = /\bship:"([^"]+)"/.exec(s);
    const countries = [];
    for (const m of s.matchAll(/\{d:\d+,date:"[^"]*",loc:"([^"]*)",type:"port"/g)) {
      const iso = PORT_COUNTRY[m[1]];
      if (!iso) { unmapped.push(`${f}: ${m[1]}`); continue; }
      if (iso !== 'US' && !countries.includes(iso)) countries.push(iso);
    }
    out.push({ file: f, slug: slugM[1], ship: shipM ? shipM[1] : '', countries });
  }
  return { voyages: out, unmapped };
}

async function get(url, as = 'json') {
  const r = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 (compatible; InTheWake-alerts/1.0; +https://cruisinginthewake.com)' }, signal: AbortSignal.timeout(30000) });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return as === 'json' ? r.json() : r.text();
}

async function main(argv) {
  const { voyages, unmapped } = voyagesFromCompanions();
  if (unmapped.length) { console.log('UNMAPPED ports (add them to PORT_COUNTRY):\n  ' + unmapped.join('\n  ')); return 3; }
  const isos = [...new Set(voyages.flatMap((v) => v.countries))].sort();
  const sources = {};
  const note = (k, ok, detail) => { sources[k] = ok ? { status: 'ok', checked: new Date().toISOString() } : { status: 'unavailable', reason: String(detail) }; };

  let us = null, ca = null, cdc = null;
  try { us = await get('https://cadataapi.state.gov/api/TravelAdvisories'); note('us', true); } catch (e) { note('us', false, e.message); }
  try { ca = await get('https://data.international.gc.ca/travel-voyage/index-alpha-eng.json'); note('ca', true); } catch (e) { note('ca', false, e.message); }
  try { cdc = parseCdc(await get('https://www.cdc.gov/vessel-sanitation/cruise-ship-outbreaks/index.html', 'text')); note('cdc', true); } catch (e) { note('cdc', false, e.message); }

  const countries = {};
  let ukFail = 0;
  for (const iso of isos) {
    const c = { iso };
    if (us) {
      const hit = usFind(us, iso);
      c.us = hit ? { level: usLevel(hit.Title), title: String(hit.Title), url: hit.Link, updated: hit.Updated, colour: usColour(usLevel(hit.Title)) }
        : { missing: true, colour: 'none' };
    }
    if (ca) {
      const d = (ca.data || {})[iso];
      c.ca = d ? { state: d['advisory-state'], regional: !!d['has-regional-advisory'], words: CA_WORDS[d['advisory-state']] || '',
        url: `https://travel.gc.ca/destinations/${d.eng && d.eng['url-slug']}`, updated: d['date-published'] && d['date-published'].date,
        colour: caColour(d['advisory-state'], !!d['has-regional-advisory']) } : { none: true, colour: 'none' };
      if (d && d.eng) c.name = d.eng.name;
    }
    const ukSlug = UK_SLUG[iso];
    if (ukSlug) {
      try {
        const u = await get(`https://www.gov.uk/api/content/foreign-travel-advice/${ukSlug}`);
        const st = (u.details && u.details.alert_status) || [];
        c.uk = { statuses: st, words: st.map((x) => UK_WORDS[x] || x), url: `https://www.gov.uk/foreign-travel-advice/${ukSlug}`,
          updated: u.public_updated_at, colour: ukColour(st) };
        if (!c.name && u.details && u.details.country) c.name = u.details.country.name;
      } catch (e) { ukFail++; c.uk = { unavailable: String(e.message), colour: 'none' }; }
    }
    c.colour = ['us', 'uk', 'ca'].reduce((a, k) => (c[k] ? worse(a, c[k].colour) : a), 'none');
    countries[iso] = c;
  }
  sources.uk = ukFail ? { status: 'unavailable', reason: `${ukFail} country page(s) could not be read` } : { status: 'ok', checked: new Date().toISOString() };

  const ships = {};
  for (const v of voyages) {
    if (!v.ship || ships[v.ship]) continue;
    const posts = cdc ? cdcFor(v.ship, cdc) : [];
    ships[v.ship] = cdc ? { posts, colour: cdcColour(posts) } : { unavailable: true, colour: 'none' };
  }

  const doc = {
    _about: 'Generated by admin/scripts/build-voyage-alerts.mjs. Read by the voyage companion Alerts tab. Government and CDC wording is quoted; the colour rules are in the script header.',
    generated: new Date().toISOString(),
    sources,
    voyages: Object.fromEntries(voyages.map((v) => [v.slug, { ship: v.ship, countries: v.countries }])),
    countries,
    ships,
  };
  const unavailable = Object.entries(sources).filter(([, s]) => s.status !== 'ok').map(([k]) => k);
  console.log(`[alerts] ${voyages.length} voyages · ${isos.length} countries · sources: ${Object.entries(sources).map(([k, s]) => `${k} ${s.status}`).join(', ')}`);
  for (const [iso, c] of Object.entries(countries)) if (c.colour !== 'none') console.log(`  ${c.colour.padEnd(6)} ${iso} ${c.name || ''}`);
  for (const [s, v] of Object.entries(ships)) if (v.colour !== 'none') console.log(`  ${v.colour.padEnd(6)} CDC ${s}`);
  if (!argv.includes('--dry-run')) writeFileSync(OUT, JSON.stringify(doc, null, 1) + '\n');
  return unavailable.length ? 2 : 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).then((code) => process.exit(code), (e) => { console.error(e); process.exit(2); });
}
