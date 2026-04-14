#!/usr/bin/env node
/**
 * Adds proper logbook wrapper structure to ports that have logbook content
 * but are missing the id="logbook" wrapper
 */
const fs = require('fs');
const path = require('path');

const port = process.argv[2];
if (!port) {
  console.log('Usage: node scripts/add-logbook-wrapper.js <port-name>');
  process.exit(1);
}

const filePath = `ports/${port}.html`;
if (!fs.existsSync(filePath)) {
  console.error(`File not found: ${filePath}`);
  process.exit(1);
}

let content = fs.readFileSync(filePath, 'utf8');

// Check if already has logbook wrapper
if (content.includes('id="logbook"')) {
  console.log(`${port}: Already has logbook wrapper`);
  process.exit(0);
}

// Check if has logbook-entry content
if (!content.includes('logbook-entry')) {
  console.error(`${port}: No logbook-entry content found`);
  process.exit(1);
}

// Extract port name for the title
const portName = port.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

// Pattern 1: <article class="card"><h1>Title</h1>\n      <div class="logbook-entry">
const pattern1 = /<article class="card">(?:<h1>[^<]+<\/h1>)?\s*<div class="logbook-entry">/;

// Pattern 2: After weather section, standalone h1 and logbook-entry
const pattern2 = /<\/details>\s*\n\s*<h1>([^<]+)<\/h1>\s*\n\s*<div class="logbook-entry">/;

let modified = false;

// Try pattern 1
if (pattern1.test(content)) {
  const match = content.match(/<article class="card">(?:<h1>([^<]+)<\/h1>)?\s*<div class="logbook-entry">/);
  const title = match[1] || `My ${portName} Adventure`;
  const titleClean = title.replace(/^My\s+/, '').replace(/:.*$/, '').trim();

  content = content.replace(
    pattern1,
    `<article class="card">
        <details class="port-section" id="logbook" open>
          <details class="section-collapse" open>
            <summary><h2>My Logbook: ${titleClean}</h2></summary>
            <div class="collapse-body">
              <div class="logbook-entry clearfix">`
  );
  modified = true;
}

// Try pattern 2
if (!modified && pattern2.test(content)) {
  const match = content.match(pattern2);
  const title = match[1].replace(/^My\s+/, '').replace(/:.*$/, '').trim();

  content = content.replace(
    pattern2,
    `</details>

        <details class="port-section" id="logbook" open>
          <details class="section-collapse" open>
            <summary><h2>My Logbook: ${title}</h2></summary>
            <div class="collapse-body">
              <div class="logbook-entry clearfix">`
  );
  modified = true;
}

if (!modified) {
  console.error(`${port}: Could not find matching pattern`);
  process.exit(1);
}

// Find and close the logbook section - look for </div> followed by section or </article>
// Pattern: </div>\n\n      <section class="port-section">
const closePattern = /(<\/div>)\s*\n\s*(<section class="port-section">)/;
if (closePattern.test(content)) {
  content = content.replace(
    closePattern,
    `$1
            </div>
          </details>
        </details>

      $2`
  );
}

fs.writeFileSync(filePath, content);
console.log(`${port}: Added logbook wrapper`);
