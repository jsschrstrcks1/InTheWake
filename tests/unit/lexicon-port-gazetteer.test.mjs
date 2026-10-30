// Lexicon C6b: what a public gazetteer says about the disputed port positions (Tekton itw-c6b-port-gazetteer).
// Soli Deo Gloria. The matching and verdict rules run on fixed GeoNames rows everywhere; the checks on the filed
// statements need Project-Sophos's contract with geo positions and skip, saying so, when it is not there.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { searchNames, placeKind, match, verdict, OBSERVATION_FILE } from '../../admin/lexicon/port-gazetteer.mjs';
import { OUT_DIR, DISPUTES_FILE } from '../../admin/lexicon/port-statements.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const LEX = process.env.LEXICON_CONTRACT_DIR ? path.resolve(process.env.LEXICON_CONTRACT_DIR) : path.resolve(ROOT, '..', 'Project-Sophos', 'sophos', 'src', 'lexicon');
const st = existsSync(path.join(LEX, 'statement.mjs')) ? await import(pathToFileURL(path.join(LEX, 'statement.mjs')).href) : null;
const skip = !st ? 'Project-Sophos not beside this checkout' : typeof st.distanceM !== 'function' ? 'the contract here has no geo positions yet (Project-Sophos #1488)' : false;
const json = (rel) => JSON.parse(readFileSync(path.join(ROOT, rel), 'utf8'));

// A GeoNames `geoname` row: id, name, ascii, alternates, lat, lon, class, code, country, cc2, a1..a4, population.
const row = (id, name, lat, lon, cls, code, alt = '') => [String(id), name, name, alt, String(lat), String(lon), cls, code, 'XX', '', '', '', '', '', '1000'];

test('the names searched are the slug, each recorded name and each part of a qualified one', () => {
  assert.deepEqual(searchNames('bangkok', ['Bangkok', 'Bangkok (Laem Chabang)']), ['bangkok', 'bangkok laem chabang', 'laem chabang']);
  assert.deepEqual(searchNames('abu-dhabi', ['Abu Dhabi / Zayed Port']), ['abu dhabi', 'abu dhabi zayed port', 'zayed port']);
});

test('a building, road, airport or district is never the place; a town, island, fjord, park or country is', () => {
  for (const [c, k] of [['P', 'PPL'], ['T', 'ISL'], ['H', 'FJD'], ['L', 'PRK'], ['A', 'PCLI'], ['A', 'PCLD']]) assert.ok(placeKind(c, k), `${c}.${k}`);
  for (const [c, k] of [['S', 'AIRP'], ['S', 'RSTN'], ['R', 'RD'], ['A', 'ADM1'], ['A', 'ADM2'], ['U', 'SMU'], ['V', 'FRST']]) assert.ok(!placeKind(c, k), `${c}.${k}`);
});

test('a feature matches only on an exact normalised name (alternate names included) and inside the window', () => {
  const rows = [
    row(1, 'Puerto Plata', 19.7934, -70.6884, 'P', 'PPLA'),
    row(2, 'Puerto Plata Airport', 19.7579, -70.57, 'S', 'AIRP'),
    row(3, 'Plata', 19.79, -70.69, 'P', 'PPL'),
    row(4, 'San Felipe', 19.79, -70.69, 'P', 'PPL', 'Puerto Plata,San Felipe de Puerto Plata'),
    row(5, 'Puerto Plata', 0, 0, 'P', 'PPL'),
    row(6, 'Bahia de Puerto Plata', 19.81, -70.7, 'H', 'BAY'),
  ];
  const hits = match(rows, ['puerto plata'], [{ lat: 19.8, lon: -70.7 }], 50000);
  assert.deepEqual(hits.map((h) => h.geonameid), [1, 4]);
  assert.equal(hits[1].matched_name, 'puerto plata');
  assert.ok(!('names' in hits[0]), 'the alternate-name list is not copied into the record');
});

const dispute = (a, b) => ({ sides: [{ value: a, refs: ['itw:a'] }, { value: b, refs: ['itw:b'] }] });
const f = (id, name, lat, lon, feature = 'P.PPL') => ({ geonameid: id, name, feature, country: 'XX', lat, lon, population: 0, matched_name: name.toLowerCase() });

test('supports_one_side when only one side is within the tolerance of a named feature, and files the nearest', () => {
  const d = dispute({ lat: 10, lon: 10 }, { lat: 10.2, lon: 10 });
  const v = verdict(d, [f(7, 'Town', 10.001, 10), f(8, 'Island', 10.02, 10, 'T.ISL')], 5000);
  assert.equal(v.verdict, 'supports_one_side');
  assert.equal(v.side, 0);
  assert.equal(v.file.geonameid, 7);
  assert.deepEqual(v.sides[1].features, []);
});

test('names_both_sides when each side sits on a named place (a city and its port): nothing is filed', () => {
  const v = verdict(dispute({ lat: 13.75, lon: 100.5 }, { lat: 13.08, lon: 100.88 }), [f(1, 'Bangkok', 13.752, 100.5), f(2, 'Laem Chabang', 13.083, 100.883)], 5000);
  assert.equal(v.verdict, 'names_both_sides');
  assert.equal(v.file, null);
});

test('names_neither names the nearest feature; no_match says nothing was found; neither files anything', () => {
  const d = dispute({ lat: 25.27, lon: 55.27 }, { lat: 25.2, lon: 55.27 });
  const v = verdict(d, [f(292223, 'Dubai', 25.0772, 55.3093)], 5000);
  assert.equal(v.verdict, 'names_neither');
  assert.equal(v.nearest.geonameid, 292223);
  assert.ok(v.nearest.distance_m > 5000);
  assert.equal(v.file, null);
  assert.deepEqual(verdict(d, [], 5000), { verdict: 'no_match', sides: [{ features: [] }, { features: [] }], file: null });
});

test('the tolerance edge: a feature exactly at the tolerance names the side, one metre past it does not', () => {
  const side = { lat: 0, lon: 0 };
  const at = (m) => ({ lat: 0, lon: (m / 6371008.8) * (180 / Math.PI) });
  assert.equal(verdict(dispute(side, { lat: 1, lon: 1 }), [f(1, 'X', at(5000).lat, at(5000).lon - 1e-12)], 5000).verdict, 'supports_one_side');
  assert.equal(verdict(dispute(side, { lat: 1, lon: 1 }), [f(1, 'X', at(5001).lat, at(5001).lon)], 5000).verdict, 'names_neither');
});

test('every place_position dispute carries a gazetteer reading that matches the committed observation', () => {
  const obs = json(OBSERVATION_FILE), d = json(DISPUTES_FILE);
  assert.equal(obs.gazetteer, 'GeoNames');
  assert.equal(obs.license, 'CC BY 4.0');
  for (const x of d.disputes.filter((y) => y.property === 'place_position')) {
    const read = obs.ports[x.entity.replace(/^port:/, '')];
    assert.ok(read, `${x.entity} was not read`);
    assert.equal(x.gazetteer.verdict, verdict(x, read.features, x.tolerance_m).verdict, x.entity);
  }
  // A read is evidence attached to a dispute, never a side of one: every side is this site's own files.
  for (const x of d.disputes) for (const s of x.sides) assert.ok(s.refs.every((r) => r.startsWith('itw:')), `${x.entity} has a side from outside this site`);
});

test('a gazetteer statement is filed exactly where GeoNames supports one side, cites its feature, and settles nothing', { skip }, () => {
  const d = json(DISPUTES_FILE), obs = json(OBSERVATION_FILE);
  for (const x of d.disputes.filter((y) => y.property === 'place_position')) {
    const ent = json(`${OUT_DIR}/${x.entity.replace(/^port:/, '')}.json`);
    const g = ent.statements.filter((s) => s.provenance.publisher === 'GeoNames');
    if (x.gazetteer.verdict !== 'supports_one_side') { assert.equal(g.length, 0, x.entity); continue; }
    assert.equal(g.length, 1, x.entity);
    const id = Number(g[0].epistemic.evidence[0].ref.replace('geonames:', ''));
    const feat = obs.ports[x.entity.replace(/^port:/, '')].features.find((y) => y.geonameid === id);
    assert.deepEqual(g[0].ext.value, { lat: feat.lat, lon: feat.lon });
    assert.equal(g[0].epistemic.evidence[0].tier, 'primary');
    assert.equal(g[0].ext.rank, 'normal');
    assert.ok(st.distanceM(g[0].ext.value, x.sides[x.gazetteer.supports_side].value) <= x.tolerance_m);
    assert.equal(ent.states.place_position, 'conflicting', `${x.entity}: a gazetteer read must not settle the dispute`);
  }
});
