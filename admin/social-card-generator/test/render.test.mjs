import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, existsSync, statSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { renderCard } from '../lib/render.js';

const tmp = () => mkdtempSync(join(tmpdir(), 'render-test-'));

test('renderCard writes a JPG to the given path', async () => {
  const out = join(tmp(), 'out.jpg');
  await renderCard({
    title: 'Test Card',
    subtitle: 'Subtitle here.',
    byline: 'Ken Baker  ·  17 May 2026',
    url: 'cruisinginthewake.com',
    outPath: out,
  });
  assert.ok(existsSync(out));
  // JPEG SOI marker
  const head = readFileSync(out).subarray(0, 2);
  assert.equal(head[0], 0xff);
  assert.equal(head[1], 0xd8);
});

test('renderCard output is 1200x630', async () => {
  const out = join(tmp(), 'out.jpg');
  await renderCard({
    title: 'Test',
    subtitle: 'Sub',
    byline: 'A · B',
    url: 'x.com',
    outPath: out,
  });
  const sharp = (await import('sharp')).default;
  const meta = await sharp(out).metadata();
  assert.equal(meta.width, 1200);
  assert.equal(meta.height, 630);
  assert.equal(meta.format, 'jpeg');
});

test('renderCard handles long titles without throwing', async () => {
  const out = join(tmp(), 'out.jpg');
  await renderCard({
    title: 'A very long title that exceeds sixty four characters and forces the smallest size bucket to be selected',
    subtitle: 'Short subtitle.',
    byline: 'Ken Baker · 17 May 2026',
    url: 'cruisinginthewake.com',
    outPath: out,
  });
  assert.ok(existsSync(out));
});

test('renderCard reasonable file size (between 30KB and 500KB)', async () => {
  const out = join(tmp(), 'out.jpg');
  await renderCard({
    title: 'Cruise Tipping for 2026',
    subtitle: 'Real-world rates and the auto-grats most calculators miss.',
    byline: 'Ken Baker  ·  8 May 2026',
    url: 'cruisinginthewake.com',
    outPath: out,
  });
  const size = statSync(out).size;
  assert.ok(size > 30_000,  `expected > 30KB, got ${size}`);
  assert.ok(size < 500_000, `expected < 500KB, got ${size}`);
});
