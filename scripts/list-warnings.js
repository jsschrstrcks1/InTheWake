#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const portsDir = path.join(__dirname, '..', 'ports');
const files = fs.readdirSync(portsDir).filter(f => f.endsWith('.html')).sort();

const warningPorts = [];

for (const file of files) {
  try {
    const result = execSync(`node scripts/validate-port.js ports/${file}`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    if (result.includes('PASSED WITH WARNINGS')) {
      // Extract warning message
      const match = result.match(/Missing logbook section/);
      warningPorts.push(file.replace('.html', ''));
    }
  } catch (e) {
    // Failed ports, skip
  }
}

console.log(`Found ${warningPorts.length} ports with warnings:\n`);
warningPorts.forEach(p => console.log(p));
