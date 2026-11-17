// The image licence work list (Tekton itw-c9-image-licence-debt): every committed port image is classified by its
// sidecar, and the committed list matches what the files say. Soli Deo Gloria.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { classifyLicence, buildWorkList, render, OUT_FILE } from '../../admin/lexicon/image-licence-debt.mjs';

const ROOT = new URL('../../', import.meta.url).pathname;

test('every licence spelling found in the 2026-11-16 census lands in the right state', () => {
  const cases = [
    ['Flickr (verify license)', 'unverified'],
    ['CC BY-SA 4.0', 'recorded', 'CC-BY-SA-4.0'],
    ['CC-BY-SA-4.0', 'recorded', 'CC-BY-SA-4.0'],
    ['CC BY 2.0', 'recorded', 'CC-BY-2.0'],
    ['CC BY-SA 3.0 igo', 'recorded', 'CC-BY-SA-3.0-IGO'],
    ['CC BY-SA', 'incomplete'],
    ['CC0', 'recorded', 'CC0-1.0'],
    ['Public domain (U.S. federal government work, 17 USC 105)', 'recorded', 'public-domain'],
    ['No known restrictions on publication (public domain — pre-1928)', 'recorded', 'public-domain'],
    ['no known copyright restrictions', 'recorded', 'public-domain'],
    ['PDM-owner', 'recorded', 'public-domain'],
    ['GFDL 1.2', 'recorded', 'GFDL-1.2'],
    ['© 2026 In the Wake. All rights reserved.', 'recorded', 'In-the-Wake-own-work'],
    ['Used with permission', 'restricted'],
    ['All Rights Reserved', 'restricted'],
    ['Wikimedia Commons', 'incomplete'],
    ['Attribution', 'incomplete'],
    ['', 'incomplete'],
    [undefined, 'incomplete'],
  ];
  for (const [raw, state, licence] of cases) {
    const r = classifyLicence(raw);
    assert.equal(r.state, state, `${JSON.stringify(raw)} -> ${r.state}`);
    if (licence) assert.equal(r.licence, licence, `${JSON.stringify(raw)} -> ${r.licence}`);
  }
});

test('the work list sorts a fixture into its states, keeps a path with a space whole, and lists only debt per port', () => {
  const files = [
    'ports/img/alpha/a.webp', 'ports/img/alpha/a.webp.attr.json',
    'ports/img/alpha/b.webp',
    'ports/img/alpha/with space.webp', 'ports/img/alpha/with space.webp.attr.json',
    'ports/img/beta/c.webp', 'ports/img/beta/c.webp.attr.json',
    'ports/img/beta/d.webp', 'ports/img/beta/d.webp.attr.json',
  ];
  const text = {
    'ports/img/alpha/a.webp.attr.json': '{"license":"CC BY-SA 4.0"}',
    'ports/img/alpha/with space.webp.attr.json': '{"license":"Used with permission"}',
    'ports/img/beta/c.webp.attr.json': '{"license":"Flickr (verify license)"}',
    'ports/img/beta/d.webp.attr.json': '{not json',
  };
  const list = buildWorkList(files, (f) => text[f]);
  assert.deepEqual(list.counts, { images: 5, recorded: 1, missing: 1, unreadable: 1, unverified: 1, incomplete: 0, restricted: 1 });
  assert.deepEqual(list.licences, { 'CC-BY-SA-4.0': 1 });
  assert.deepEqual(list.by_port.alpha, { images: 3, debt: { missing: ['b.webp'], restricted: ['with space.webp'] } });
  assert.deepEqual(list.by_port.beta, { images: 2, debt: { unverified: ['c.webp'], unreadable: ['d.webp'] } });
});

test('the committed work list is what the committed images and sidecars say', () => {
  const committed = fs.readFileSync(path.join(ROOT, OUT_FILE), 'utf8');
  assert.equal(committed, render(ROOT), 'stale: run node admin/lexicon/image-licence-debt.mjs and commit what it writes');
});
