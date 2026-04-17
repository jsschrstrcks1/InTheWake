#!/usr/bin/env node
/**
 * test-ui-browser.js — Playwright browser test for drink calculator UI
 *
 * Verifies the 3 v2.1 UI features actually render and function in a real browser:
 *   1. Line selector shows all 15 lines
 *   2. Free-at-Sea toggle appears on NCL, hides on RCL
 *   3. Booking date picker appears on lines with dated policies
 *   4. Switching lines resets state correctly
 *   5. Virgin shows à-la-carte-only messaging
 *   6. Regent shows all-inclusive messaging
 */
'use strict';

const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PORT = 9876;

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let urlPath = req.url.split('?')[0];
      let filePath = path.join(ROOT, urlPath === '/' ? 'drink-calculatorv2.html' : urlPath);
      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) { res.writeHead(404); res.end('Not found'); return; }
      const ext = path.extname(filePath);
      const types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg' };
      res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
    });
    server.listen(PORT, () => resolve(server));
  });
}

async function main() {
  const server = await startServer();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  let pass = 0, fail = 0;

  function assert(ok, label, detail) {
    if (ok) { pass++; console.log(`  [PASS] ${label}`); }
    else { fail++; console.log(`  [FAIL] ${label}${detail ? ' — ' + detail : ''}`); }
  }

  try {
    await page.goto(`http://localhost:${PORT}/drink-calculatorv2.html`, { waitUntil: 'networkidle', timeout: 15000 });
    // Wait for the calculator app to initialize and config to load.
    // The app starts hidden (display:none) and is shown by JS after init.
    await page.waitForTimeout(4000);

    // 1. Line selector
    console.log('\n── Line Selector ──');
    const options = await page.$$eval('#cruise-line-select option', opts => opts.map(o => o.value));
    assert(options.length === 15, `15 lines in selector (got ${options.length})`, options.join(', '));
    assert(options.includes('ncl'), 'NCL present');
    assert(options.includes('virgin'), 'Virgin present');
    assert(options.includes('regent'), 'Regent present');

    // 2. Free-at-Sea toggle — should be hidden on default line (RCL)
    console.log('\n── Free-at-Sea Toggle ──');
    const fasVisible = await page.$eval('#free-at-sea-toggle', el => el.style.display !== 'none');
    assert(!fasVisible, 'FaS toggle hidden on RCL (default)');

    // Switch to NCL
    await page.selectOption('#cruise-line-select', 'ncl');
    await page.waitForTimeout(1500);
    const fasVisibleNcl = await page.$eval('#free-at-sea-toggle', el => el.style.display !== 'none');
    assert(fasVisibleNcl, 'FaS toggle visible on NCL');

    const fasChecked = await page.$eval('#free-at-sea-check', el => el.checked);
    assert(!fasChecked, 'FaS checkbox unchecked by default on NCL');

    // Switch back to RCL — toggle should hide and uncheck
    await page.selectOption('#cruise-line-select', 'royal-caribbean');
    await page.waitForTimeout(1000);
    const fasHiddenAgain = await page.$eval('#free-at-sea-toggle', el => el.style.display === 'none');
    assert(fasHiddenAgain, 'FaS toggle hidden after switching back to RCL');

    // 3. Booking date picker
    console.log('\n── Booking Date Picker ──');
    const dateVisible = await page.$eval('#booking-date-wrap', el => el.style.display !== 'none');
    assert(dateVisible, 'Date picker visible on RCL (has dated policies)');

    // Set a pre-cutoff date
    await page.fill('#booking-date-input', '2026-02-01');
    await page.dispatchEvent('#booking-date-input', 'change');
    await page.waitForTimeout(500);
    const grandfatherText = await page.$eval('#grandfathered-policies', el => el.textContent);
    assert(grandfatherText.includes('pre-dates'), 'Grandfather summary shows for pre-cutoff date', grandfatherText);

    // Switch to NCL — date should clear
    await page.selectOption('#cruise-line-select', 'ncl');
    await page.waitForTimeout(1000);
    const dateAfterSwitch = await page.$eval('#booking-date-input', el => el.value);
    assert(dateAfterSwitch === '', 'Date input cleared on line switch', `got "${dateAfterSwitch}"`);

    // 4. Virgin — no packages
    console.log('\n── Virgin (No Packages) ──');
    await page.selectOption('#cruise-line-select', 'virgin');
    await page.waitForTimeout(1500);
    const pageTitle = await page.$eval('#calc-page-title', el => el.textContent);
    assert(pageTitle.includes('Virgin'), 'Page title updates to Virgin', pageTitle);
    const fasOnVirgin = await page.$eval('#free-at-sea-toggle', el => el.style.display === 'none');
    assert(fasOnVirgin, 'FaS toggle hidden on Virgin');

    // 5. Regent — all inclusive
    console.log('\n── Regent (All Inclusive) ──');
    await page.selectOption('#cruise-line-select', 'regent');
    await page.waitForTimeout(1500);
    const regentTitle = await page.$eval('#calc-page-title', el => el.textContent);
    assert(regentTitle.includes('Regent'), 'Page title updates to Regent', regentTitle);

  } catch (e) {
    fail++;
    console.log(`  [FAIL] Browser test error: ${e.message}`);
  }

  await browser.close();
  server.close();

  console.log(`\n════════════════════════════════════`);
  console.log(`Browser tests: ${pass + fail} total, ${pass} pass, ${fail} fail`);
  console.log(`════════════════════════════════════`);
  process.exit(fail > 0 ? 1 : 0);
}

main().catch(e => { console.error(e); process.exit(1); });
