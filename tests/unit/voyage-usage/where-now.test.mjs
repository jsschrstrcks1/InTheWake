// "Where is the ship right now?" on every companion's Ship tab. The IMO names which ship the
// live map draws, so a wrong one would put our label on somebody else's dot. Each number was
// checked against the ship's Wikipedia infobox (Aqua: its Commons category; MSC World America:
// the class article's ship table) on 2026-09-26. Soli Deo Gloria.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';

const ROOT = new URL('../../../', import.meta.url);
const DIR = new URL('admin/voyage-pwa/', ROOT);

const CHECKED = {
  'Anthem of the Seas': '9656101',
  'Norwegian Aqua': '9824007',
  'Norwegian Breakaway': '9606912',
  'Norwegian Encore': '9751511',
  'Norwegian Escape': '9677076',
  'Norwegian Gem': '9355733',
  'Icon of the Seas': '9829930',
  'Margaritaville at Sea Islander': '9187796',
  'Norwegian Prima': '9823986',
  'Resilient Lady': '9805348',
  'ms Volendam': '9156515',
  'MSC World America': '9837432',
};

const pages = (await readdir(DIR)).filter((f) => f.endsWith('.html'));

test('every companion names its ship and carries the checked IMO for that ship', async () => {
  assert.ok(pages.length >= 15, `expected at least 15 companions, found ${pages.length}`);
  for (const f of pages) {
    const html = await readFile(new URL(f, DIR), 'utf8');
    const m = /ship:"([^"]+)",imo:"(\d{7})",/.exec(html);
    assert.ok(m, `${f}: ship and imo must sit together in window.__VOYAGE`);
    assert.equal(m[2], CHECKED[m[1]], `${f}: ${m[1]} IMO ${m[2]} is not the checked number`);
  }
});

test('the MarineTraffic link, where it names an IMO, names the same ship as the map', async () => {
  for (const f of pages) {
    const html = await readFile(new URL(f, DIR), 'utf8');
    const imo = /imo:"(\d{7})"/.exec(html)[1];
    const link = /trackUrl:"([^"]+)"/.exec(html)[1];
    const inLink = /imo:(\d{7})/.exec(link);
    assert.ok(inLink, `${f}: tracking link should point at the ship by IMO, not a name search`);
    assert.equal(inLink[1], imo, `${f}: tracking link and live map name different ships`);
  }
});

test('the CSP lets the VesselFinder map load in a frame and nothing else new', async () => {
  for (const f of pages) {
    const html = await readFile(new URL(f, DIR), 'utf8');
    const csp = /<meta http-equiv="Content-Security-Policy" content="([^"]+)"/.exec(html)[1];
    const frame = csp.split(';').map((d) => d.trim()).find((d) => d.startsWith('frame-src'));
    assert.equal(frame, 'frame-src https://www.youtube-nocookie.com https://www.vesselfinder.com', `${f}: frame-src`);
  }
});

test('the live map waits for a tap, checks for a signal, and keeps the schedule apart from the live fix', async () => {
  const js = await readFile(new URL('companion.js', DIR), 'utf8');
  const start = js.indexOf('function whereNow(');
  assert.ok(start > 0, 'whereNow() missing');
  const body = js.slice(start, js.indexOf('\n// One chosen photograph', start));
  const click = body.indexOf('addEventListener("click"');
  const frame = body.indexOf('document.createElement("iframe")');
  assert.ok(click > 0 && frame > click, 'the map iframe must only be built inside the tap handler');
  assert.ok(body.indexOf('navigator.onLine===false') > click && body.indexOf('navigator.onLine===false') < frame, 'offline check must come before the frame is built');
  assert.ok(body.includes('encodeURIComponent(V.imo)'), 'IMO must be encoded into the map URL');
  assert.ok(!body.includes('"loading","lazy"'), 'a tapped map must not be lazy-loaded');
  // The schedule (works offline) and the live fix are two separate cards. The "not a live fix"
  // caution lives with the schedule card, above the map, so neither passes for the other.
  const sched = js.slice(js.indexOf('function schedCard('), js.indexOf('function whereNow('));
  assert.ok(sched.includes('not a live fix'), 'the schedule card must say it is not a live position');
  assert.ok(js.includes('var sc=schedCard(),wn=whereNow()'), 'Ship tab must build both cards');
  assert.ok(js.includes('if(sc)el.appendChild(sc);if(wn)el.appendChild(wn);'), 'Ship tab must append both cards');
});

test('the live map asks VesselFinder exactly what the ship pages ask: IMO, zoom, track, names, nothing else', async () => {
  const { readFileSync } = await import('node:fs');
  const js = readFileSync(new URL('../../../admin/voyage-pwa/companion.js', import.meta.url), 'utf8');
  const m = /f\.src="https:\/\/www\.vesselfinder\.com\/aismap\?([^;]*);/.exec(js);
  assert.ok(m, 'map address not found');
  assert.equal(m[1], 'imo="+encodeURIComponent(V.imo)+"&zoom=5&track=true&names=true"');
  const ship = readFileSync(new URL('../../../ships/norwegian/norwegian-prima.html', import.meta.url), 'utf8');
  assert.match(ship, /vesselfinder\.com\/aismap\?imo=9823986&amp;zoom=5&amp;track=true&amp;names=true/);
});
