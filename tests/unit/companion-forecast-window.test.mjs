// Dated forecasts are asked for only inside Open-Meteo's window. Soli Deo Gloria.
// Before 2026-10-05 the Voyage tab asked for every day of the cruise; for a sailing two months out
// that was eight 400 "out of allowed range" errors on every visit. Inside the window the forecast
// must still be asked for: the fix must not quietly turn the feature off.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const src = readFileSync(new URL('../../admin/voyage-pwa/companion.js', import.meta.url), 'utf8');
const fnSrc = (name) => {
  const m = src.match(new RegExp('function ' + name + '\\([^)]*\\)\\{.*\\}', 'm'));
  assert.ok(m, `companion.js defines ${name}()`);
  return m[0];
};

function inRangeOn(todayIso, dateIso) {
  // eslint-disable-next-line no-new-func
  return Function('todayISO', fnSrc('wxInRange') + '; return wxInRange(' + JSON.stringify(dateIso) + ');')(() => todayIso);
}

test('the next two weeks are asked for', () => {
  for (const d of ['2026-10-05', '2026-10-06', '2026-10-12', '2026-10-19']) assert.equal(inRangeOn('2026-10-05', d), true, d);
});

test('beyond 14 days ahead is not asked for', () => {
  for (const d of ['2026-10-20', '2026-10-25', '2026-12-05', '2027-04-24']) assert.equal(inRangeOn('2026-10-05', d), false, d);
});

test('recent past days are asked for; anything older than 90 days is not', () => {
  assert.equal(inRangeOn('2026-12-20', '2026-12-05'), true);
  assert.equal(inRangeOn('2027-04-01', '2026-12-05'), false);
});

test('the Voyage tab calls the forecast only through the window check', () => {
  assert.match(fnSrc('fetchVoyWx'), /^function fetchVoyWx\(s\)\{if\(!wxInRange\(s\.date\)\)return;/);
});
