#!/usr/bin/env node
// admin/scripts/verify-ship-videos.mjs — Soli Deo Gloria.
//
// Found 2026-09-26: the ship video lists carried titles YouTube never gave them. Three Norwegian Pearl
// vlogs (a Florence day trip, a Porto day, a Pearl review) were listed 470 times across ships as
// "Suite Tour", "Accessible Cabin", "Dining Guide" and so on; Ruby Princess listed an Adele music
// video. A reader who tapped "Prima accessible cabin" got a Pearl vlog about Florence.
//
// This keeps a video only when YouTube's OWN title (oEmbed, recorded in
// admin/data/video-verification/) names the ship, replaces every title with YouTube's, names the
// channel, and drops the made-up descriptions and categories. A category comes back only when
// YouTube's own title names one (categoryOf, below), so the ship validator has real structure to read. Removed, private and non-embeddable
// videos go too. Nothing here is guessed: no match, no entry.
//
// Match rule, per video:
//   - the full brand-prefixed ship name is in the title ("Norwegian Prima", "MSC Opera",
//     "Symphony of the Seas"), or
//   - the ship name (or its core, "Prima" of "Norwegian Prima") is in the title AND a brand word is
//     too ("NCL Prima", "Holland America Eurodam"), or
//   - the name is a distinctive single "-dam" name (Zaandam, not Rotterdam) and is in the title.
// Plain names without a brand ("Vista", "Riviera", "Mardi Gras") need the brand: resorts and
// parades share those words.
//
// Run:  node admin/scripts/verify-ship-videos.mjs          rewrite every video file
//       node admin/scripts/verify-ship-videos.mjs --check  exit 3 if any entry is unverified or retitled
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

export const RECORD = 'admin/data/video-verification/oembed-2026-09-26.json';
const CHECKED = '2026-09-26';
const BRANDS = {
  norwegian: ['norwegian', 'ncl'], carnival: ['carnival'], msc: ['msc'], 'celebrity-cruises': ['celebrity'],
  rcl: ['royal caribbean', 'rccl', 'of the seas'], princess: ['princess'], 'holland-america-line': ['holland america', 'hal'],
  costa: ['costa'], cunard: ['cunard'], explora: ['explora'], 'explora-journeys': ['explora'],
  'margaritaville-at-sea': ['margaritaville'], oceania: ['oceania'], regent: ['regent', 'seven seas'],
  seabourn: ['seabourn'], silversea: ['silversea'], 'virgin-voyages': ['virgin'],
};
const PREFIX = /^(norwegian|ncl|carnival|msc|celebrity|royal caribbean|princess|holland america( line)?|costa|cunard|explora|margaritaville at sea|oceania|regent( seven seas)?|seabourn|silversea|virgin voyages|ms|m s)\s+/;
const CITY_DAM = new Set(['rotterdam', 'volendam', 'amsterdam']);

export const norm = (s) => ' ' + String(s).normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim() + ' ';

export function matches(line, ship, title) {
  const nt = norm(title), full = norm(ship), fs = full.trim();
  if (!fs) return false;
  const brand = (BRANDS[line] || []).some((b) => nt.includes(' ' + b + ' '));
  const prefixed = PREFIX.test(fs) || fs.includes(' of the seas');
  const core = fs.replace(PREFIX, '').replace(/\s+of the seas$/, '').trim();
  if (nt.includes(full) && prefixed) return true;
  if (nt.includes(full) && brand) return true;
  if (core && nt.includes(' ' + core + ' ') && brand) return true;
  if (nt.includes(full) && !fs.includes(' ') && fs.endsWith('dam') && !CITY_DAM.has(fs)) return true;
  return false;
}

const titleCase = (slug) => slug.split('-').map((w, i) => (i && ['of', 'the'].includes(w) ? w : w[0].toUpperCase() + w.slice(1))).join(' ');
export function shipOf(file, d) {
  if (typeof d.ship === 'string' && d.ship) return d.ship;
  if (d.ship && typeof d.ship === 'object' && d.ship.name) return d.ship.name;
  return titleCase(path.basename(file, '.json').replace(/-videos$/, ''));
}
export function lineOf(file) {
  const p = file.split(path.sep);
  const i = p.indexOf('videos');
  if (p[0] === 'assets' && i >= 0) return p[i + 1];
  if (p[0] === 'ships') return p[1];
  return '';
}
// A category is read from YouTube's OWN title, never guessed: a title that names none of these gets
// no category. The names are the ship validator's required categories (validate-ship-page.js).
// Order matters, first match wins: "Accessible Inside Cabin" is accessible before it is interior,
// "Balcony Stateroom Walkthrough" is balcony before it is a ship walk-through, and
// "Full Ship Tour" is a walk-through even when it mentions the restaurants.
export const CATEGORY_RULES = [
  ['accessible', /\b(accessible|accessibility|wheelchair|handicap(ped)?)\b/],
  ['top ten', /\btop\s*(10|ten)\b|^\s*(10|ten)\s+(things|amazing|best|must|reasons|tips|features)\b/],
  ['suite', /\b(haven|suites?)\b/],
  ['balcony', /\bbalcon(y|ies)\b/],
  ['oceanview', /\bocean\s*view\b/],
  ['interior', /\b(inside|interior)\s+(cabin|stateroom|room)s?\b|\b(inside|interior)\b.*\bcategory\s+i/],
  ['ship walk through', /\b(ship tour|walk\s*-?\s*through|full tour|full ship)\b/],
  ['food', /\b(food|dining|restaurants?|buffet|menu|everything we ate)\b/],
];
export function categoryOf(title) {
  const t = String(title || '').toLowerCase();
  for (const [cat, re] of CATEGORY_RULES) if (re.test(t)) return cat;
  return null;
}
const itemsOf = (v) => (Array.isArray(v) ? v : Object.values(v || {}).flat()).filter((i) => i && typeof i === 'object' && i.videoId);

export function clean(file, d, lookups) {
  const line = lineOf(file), ship = shipOf(file, d);
  const seen = new Set(), kept = [], dropped = { dup: 0, dead: 0, nomatch: 0 };
  for (const i of itemsOf(d.videos)) {
    if (seen.has(i.videoId)) { dropped.dup++; continue; }
    seen.add(i.videoId);
    const r = lookups[i.videoId];
    if (!r || r.status !== 'ok') { dropped.dead++; continue; }
    if (!matches(line, ship, r.title)) { dropped.nomatch++; continue; }
    const entry = { videoId: i.videoId, provider: 'youtube', title: r.title, channel: r.author, verified: CHECKED };
    const cat = categoryOf(r.title);
    if (cat) entry.category = cat;
    kept.push(entry);
  }
  const out = { ...d };
  // Side indexes built from the unverified list (only adventure-of-the-seas has them; no page reads them).
  delete out.videos_interleaved; delete out.index_by_category;
  out.videos = Array.isArray(d.videos) ? kept : { verified: kept };
  out.last_updated = CHECKED;
  out.verification = `Titles and channels are YouTube's own (oEmbed, ${CHECKED}). Entries whose real title does not name ${ship} were removed, as were removed, private and non-embeddable videos. admin/scripts/verify-ship-videos.mjs`;
  return { out, kept: kept.length, dropped, ship };
}

export function videoFiles(root = '.') {
  const out = [];
  const walk = (d) => { for (const e of readdirSync(path.join(root, d), { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (p.endsWith('.json')) out.push(p); } };
  walk('assets/data/videos');
  walk('ships');
  return out.filter((f) => {
    if (f.startsWith('ships') && !f.includes(`${path.sep}assets${path.sep}`)) return false;
    try { const d = JSON.parse(readFileSync(path.join(root, f), 'utf8')); return d && typeof d === 'object' && !Array.isArray(d) && itemsOf(d.videos).length + (d.verification ? 1 : 0) > 0; } catch { return false; }
  });
}

const invokedDirectly = process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop());
if (invokedDirectly) {
  const check = process.argv.includes('--check');
  let lookups;
  try { lookups = JSON.parse(readFileSync(RECORD, 'utf8')).lookups; } catch (e) { console.log(`[videos] UNAVAILABLE: ${e.message}`); process.exit(2); }
  let files = 0, kept = 0, emptied = 0, stale = 0; const drops = { dup: 0, dead: 0, nomatch: 0 };
  for (const f of videoFiles()) {
    const d = JSON.parse(readFileSync(f, 'utf8'));
    const r = clean(f, d, lookups);
    const next = JSON.stringify(r.out, null, 2) + '\n';
    files++; kept += r.kept; if (!r.kept) emptied++;
    for (const k in drops) drops[k] += r.dropped[k];
    if (check) {
      // Checking a cleaned file: it must already be exactly what clean() would write, modulo its date.
      const now = readFileSync(f, 'utf8');
      if (now !== next) { stale++; console.log(`UNVERIFIED ${f}`); }
      continue;
    }
    writeFileSync(f, next);
  }
  console.log(`[videos] ${files} files · ${kept} verified videos kept · removed: ${drops.dup} duplicates, ${drops.dead} gone/private/no-embed, ${drops.nomatch} not this ship · ${emptied} files now empty`);
  if (check) { console.log(stale ? `[videos] REPORT: ${stale} files differ from verified` : '[videos] CLEAN'); process.exit(stale ? 3 : 0); }
}
