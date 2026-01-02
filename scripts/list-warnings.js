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
    if (result.includes('VALIDATION PASSED WITH WARNINGS')) {
      // Extract warning messages
      const warnings = result.match(/^\s*\d+\.\s+(.+)$/gm) || [];
      warningPorts.push({
        port: file.replace('.html', ''),
        warnings: warnings.map(w => w.replace(/^\s*\d+\.\s+/, ''))
      });
    }
  } catch (e) {
    // Failed ports, skip
  }
}

console.log(`Found ${warningPorts.length} ports with warnings:\n`);
warningPorts.forEach(p => {
  console.log(`${p.port}:`);
  p.warnings.forEach(w => console.log(`  - ${w}`));
});
