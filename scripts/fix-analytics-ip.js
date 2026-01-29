#!/usr/bin/env node
/**
 * Fix Google Analytics IP anonymization across all ship pages
 */

const fs = require('fs');
const path = require('path');

const shipsDir = 'ships';
let fixedCount = 0;
let alreadyFixedCount = 0;

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Check if already has anonymize_ip
  if (content.includes('anonymize_ip')) {
    alreadyFixedCount++;
    return;
  }

  // Pattern 1: gtag('config', 'G-XXX');
  // Pattern 2: gtag('config','G-XXX');
  // Pattern 3: gtag('config', 'G-XXX')  (no semicolon, end of line)

  let modified = false;

  // Replace various patterns
  const patterns = [
    // With space after config, with semicolon
    {
      find: /gtag\('config',\s*'(G-[^']+)'\);/g,
      replace: "gtag('config', '$1', {anonymize_ip:true});"
    },
    // No space, with semicolon
    {
      find: /gtag\('config','(G-[^']+)'\);/g,
      replace: "gtag('config','$1',{anonymize_ip:true});"
    },
    // With space, no semicolon at end of line
    {
      find: /gtag\('config',\s*'(G-[^']+)'\)(\s*$)/gm,
      replace: "gtag('config', '$1', {anonymize_ip:true})$2"
    }
  ];

  for (const pattern of patterns) {
    if (pattern.find.test(content)) {
      content = content.replace(pattern.find, pattern.replace);
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content);
    fixedCount++;
    console.log('Fixed:', filePath);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (file.endsWith('.html')) {
      processFile(filePath);
    }
  }
}

console.log('Fixing Google Analytics IP anonymization...');
walkDir(shipsDir);
console.log(`\nFixed: ${fixedCount} files`);
console.log(`Already fixed: ${alreadyFixedCount} files`);
