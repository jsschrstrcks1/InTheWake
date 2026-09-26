// admin/voyage-usage-relay/worker.js — Soli Deo Gloria.
//
// Geo-blind relay for voyage-pack usage events (plan §2.1, Setting 1.5).
// Strips WHO and WHERE-exactly; forwards WHAT and WHEN-to-the-day.
//
//   phone ──POST /send {name,data}──▶ this Worker ──POST──▶ cloud.umami.is/api/send
//
// What Umami receives: the event name, the whitelisted properties re-validated here, and
// (Setting 1.5) the country and state/province Cloudflare already resolved for the request.
// What Umami never receives: the client IP (no X-Forwarded-For, no CF-Connecting-IP), the
// client User-Agent (a fixed relay UA is sent instead), the city, or anything the client put
// in the body that is not on the whitelist. Umami therefore sees one "visitor" — this relay.
//
// Optional daily sitting-link dial (default OFF): when RELAY_SECRET is set as a Worker secret,
// a `sitting_key` = sha256(ip + ua + yyyy-mm-dd + secret)[0..16] is added. It links sittings
// within one calendar day and is worthless after midnight by construction. The IP still never
// leaves this Worker. Leave the secret unset to keep the dial off.
//
// Nothing here logs a request body or a client address. wrangler.toml keeps logpush off.

const UMAMI = 'https://cloud.umami.is/api/send';
const WEBSITE = '9661a449-3ba9-49ea-88e8-4493363578d2';
const ORIGIN = 'https://cruisinginthewake.com';
const RELAY_UA = 'itw-voyage-usage-relay/1 (+https://cruisinginthewake.com/privacy.html)';

export const EVENTS = new Set([
  'vp_pdf_open', 'vp_print', 'vp_pdf_download', 'vp_handoff_filled',
  'vp_pwa_open', 'vp_pwa_session', 'vp_pwa_install',
]);
// Client-supplied keys that may pass. `country` / `region` are NOT here on purpose: the relay
// sets them from Cloudflare's request metadata, so a client cannot claim a place.
export const ALLOW = new Set(['pack', 'variant', 'scope', 'standalone', 'offline', 'phase', 'day', 'tabs']);
const SLUG_RE = /^v0\.[0-9.]+-[a-z0-9-]+$/;

export function scrub(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  if (typeof body.name !== 'string' || !EVENTS.has(body.name)) return null;
  const data = {};
  const src = body.data && typeof body.data === 'object' && !Array.isArray(body.data) ? body.data : {};
  for (const k of Object.keys(src)) {
    if (ALLOW.has(k) && src[k] != null) data[k] = String(src[k]).slice(0, 64);
  }
  if (!SLUG_RE.test(data.pack || '')) return null;   // a pack slug is required and shaped
  return { name: body.name, data };
}

// Setting 1.5: coarse place from Cloudflare's own request metadata. Never city.
export function coarsePlace(cf) {
  const out = {};
  if (cf && typeof cf.country === 'string' && /^[A-Z]{2}$/.test(cf.country)) out.country = cf.country;
  if (cf && typeof cf.region === 'string' && cf.region.length <= 64) out.region = cf.region;
  return out;
}

async function sittingKey(req, secret, now) {
  if (!secret) return null;
  const ip = req.headers.get('CF-Connecting-IP') || '';
  const ua = req.headers.get('User-Agent') || '';
  const day = new Date(now).toISOString().slice(0, 10);
  const bytes = new TextEncoder().encode(`${ip}|${ua}|${day}|${secret}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest)).slice(0, 8).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function umamiPayload(ev) {
  return { type: 'event', payload: {
    website: WEBSITE, hostname: 'cruisinginthewake.com',
    url: '/admin/voyage-pwa/' + ev.data.pack, title: ev.data.pack,
    referrer: '', language: '', screen: '',
    name: ev.name, data: ev.data,
  } };
}

export async function handle(req, env = {}, { fetchFn = fetch, now = Date.now() } = {}) {
  const cors = {
    'Access-Control-Allow-Origin': ORIGIN,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Cache-Control': 'no-store',
    'Referrer-Policy': 'no-referrer',
  };
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  const url = new URL(req.url);
  if (req.method !== 'POST' || url.pathname !== '/send') return new Response('not found', { status: 404, headers: cors });

  let ev = null;
  try { ev = scrub(await req.json()); } catch { /* malformed body: fall through to 400 */ }
  if (!ev) return new Response('bad event', { status: 400, headers: cors });

  Object.assign(ev.data, coarsePlace(req.cf));
  const key = await sittingKey(req, env.RELAY_SECRET, now);
  if (key) ev.data.sitting_key = key;

  let ok = false;
  try {
    const r = await fetchFn(UMAMI, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': RELAY_UA },
      body: JSON.stringify(umamiPayload(ev)),
    });
    ok = !!r && r.ok;
  } catch { ok = false; }
  return new Response(null, { status: ok ? 204 : 502, headers: cors });
}

export default { fetch: (req, env, ctx) => handle(req, env) };
