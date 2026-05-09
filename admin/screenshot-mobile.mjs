#!/usr/bin/env node
/**
 * Mobile screenshot capture for Phase B verification.
 *
 * Usage:
 *   node admin/screenshot-mobile.mjs <label>
 *
 * Loads pages from the local static server (started separately), captures
 * screenshots at iPhone Pro Max (430), iPhone 15 (390), and 360px, and
 * writes to admin/audit-reports/screenshots/<label>/.
 *
 * Prerequisite: a static server is running on http://127.0.0.1:8765 from
 * the InTheWake repo root.
 */

import playwrightPkg from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = playwrightPkg;
import { mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const BASE = 'http://127.0.0.1:8765';
const OUT_ROOT = 'admin/audit-reports/screenshots';

const PAGES = [
  { slug: 'home',       path: '/index.html' },
  { slug: 'ship',       path: '/ships/carnival/carnival-celebration.html' },
  { slug: 'port',       path: '/ports/abu-dhabi.html' },
  { slug: 'article',    path: '/articles/cruise-tipping-2026.html' },
  { slug: 'venue',      path: '/restaurants/150-central-park.html' },
  { slug: 'calculator', path: '/drink-calculator.html' },
  { slug: 'tool',       path: '/tools/cruise-budget-calculator.html' },
];

const VIEWPORTS = [
  { name: '430', width: 430, height: 932, dpr: 3, label: 'iphone-pro-max' },
  { name: '390', width: 390, height: 844, dpr: 3, label: 'iphone-15' },
  { name: '360', width: 360, height: 780, dpr: 3, label: 'galaxy-s' },
];

async function main() {
  const label = process.argv[2];
  if (!label) {
    console.error('Usage: node admin/screenshot-mobile.mjs <before|after|...>');
    process.exit(1);
  }

  const outDir = join(OUT_ROOT, label);
  if (!existsSync(outDir)) await mkdir(outDir, { recursive: true });

  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  });

  let count = 0;
  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: vp.dpr,
      isMobile: true,
      hasTouch: true,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
    });
    const page = await ctx.newPage();

    for (const p of PAGES) {
      const url = BASE + p.path;
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
      } catch (err) {
        console.warn(`  load timeout for ${p.slug}@${vp.name}: ${err.message}`);
      }
      await page.waitForTimeout(400);
      const file = join(outDir, `${p.slug}-${vp.name}.png`);
      await page.screenshot({ path: file, fullPage: false });
      count++;
      console.log(`  ${file}`);
    }

    await ctx.close();
  }

  await browser.close();
  console.log(`Captured ${count} screenshot(s) in ${outDir}`);
}

main().catch(err => { console.error(err); process.exit(1); });
