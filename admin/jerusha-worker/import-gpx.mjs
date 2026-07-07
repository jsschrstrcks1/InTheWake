// Backfill an OwnTracks GPX export into the worker's /loc feed.
//
// Use case: OwnTracks recorded fine on the phone but never published (endpoint
// misconfigured), so the trail lives only in the app. Export the GPX from
// OwnTracks, then replay it here — each point is POSTed with its ORIGINAL fix
// time (tst), which the worker honors as of the tst fix in worker.js. The
// Jerusha breadcrumb and the Atlas Adventures poller both pick the points up
// from GET /loc?since= as usual.
//
// Usage:
//   node import-gpx.mjs <track.gpx> <https://worker-url/loc> <NOTES_TOKEN> [--dry-run]
//
// Duplicate-safe twice over: before posting, it fetches the tracker's existing
// points (GET /loc) and SKIPS any fix whose timestamp is already there; and the
// worker keys each fix loc:<isots> anyway, so even a re-post just overwrites the
// same key. Overlapping exports are fine. The GPX file itself is personal
// location data: it stays on your machine, never in git.

import { readFileSync } from "node:fs";

const [, , gpxPath, locUrl, token, flag] = process.argv;
if (!gpxPath || !locUrl || !token) {
  console.error("usage: node import-gpx.mjs <track.gpx> <https://worker/loc> <token> [--dry-run]");
  process.exit(1);
}
const dryRun = flag === "--dry-run";

const gpx = readFileSync(gpxPath, "utf8");
const points = [];
const re = /<trkpt\s+lat="([-\d.]+)"\s+lon="([-\d.]+)">[\s\S]*?<time>([^<]+)<\/time>[\s\S]*?<\/trkpt>/g;
for (let m; (m = re.exec(gpx)); ) {
  const lat = Number(m[1]), lon = Number(m[2]), t = Date.parse(m[3]);
  if (isFinite(lat) && isFinite(lon) && isFinite(t)) points.push({ lat, lon, tst: Math.floor(t / 1000) });
}
if (!points.length) { console.error("no <trkpt> points found in " + gpxPath); process.exit(1); }
console.log(`${points.length} points parsed (${new Date(points[0].tst * 1000).toISOString()} → ${new Date(points[points.length - 1].tst * 1000).toISOString()})`);
if (dryRun) process.exit(0);

const sep = locUrl.includes("?") ? "&" : "?";
const url = `${locUrl}${sep}k=${encodeURIComponent(token)}`;

// Skip points already on the tracker (compare at second precision — GPX times
// and tst-honored records are both whole seconds).
const existing = new Set();
const r0 = await fetch(url).catch(() => null);
if (r0 && r0.ok) {
  const d0 = await r0.json().catch(() => null);
  for (const p of (d0 && d0.points) || []) {
    const t = Date.parse(p.ts);
    if (isFinite(t)) existing.add(Math.floor(t / 1000));
  }
} else {
  console.error(`warning: could not read existing points (${r0 ? r0.status : "network"}) — posting all (worker dedupes by key anyway)`);
}
const fresh = points.filter((p) => !existing.has(p.tst));
const skipped = points.length - fresh.length;
if (skipped) console.log(`${skipped} already on the tracker — skipping`);

let ok = 0, failed = 0;
for (const p of fresh) {
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ _type: "location", lat: p.lat, lon: p.lon, tst: p.tst }),
  }).catch(() => null);
  if (r && r.ok) ok++;
  else { failed++; console.error(`  FAIL ${r ? r.status : "network"} @ ${new Date(p.tst * 1000).toISOString()}`); }
}
console.log(`done: ${ok} stored, ${skipped} skipped (already on tracker), ${failed} failed`);
process.exit(failed ? 1 : 0);
