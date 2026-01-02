#!/usr/bin/env node
/**
 * Extracts port summaries and metadata from all port HTML files
 * Used to generate comprehensive ports.html content
 */
const fs = require('fs');
const path = require('path');

const portsDir = path.join(__dirname, '..', 'ports');
const registryPath = path.join(__dirname, '..', 'assets', 'data', 'ports', 'port-registry.json');

// Load registry for region info
const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));

// Get all port files
const portFiles = fs.readdirSync(portsDir)
  .filter(f => f.endsWith('.html'))
  .sort();

const ports = [];

for (const file of portFiles) {
  const slug = file.replace('.html', '');
  const filePath = path.join(portsDir, file);
  const content = fs.readFileSync(filePath, 'utf8');

  // Extract port name from title
  const titleMatch = content.match(/<title>([^|<]+)/);
  let name = titleMatch ? titleMatch[1].replace(/\s+Cruise Port.*$|Port Guide.*$/i, '').trim() : slug;

  // Extract short description from meta description or Quick Answer
  let description = '';

  // Try Quick Answer first
  const quickAnswerMatch = content.match(/<strong>Quick Answer:<\/strong>\s*([^<]+)/);
  if (quickAnswerMatch) {
    description = quickAnswerMatch[1].trim();
    // Truncate to first sentence but handle "St." and similar abbreviations
    if (description.length > 100) {
      // Don't truncate at "St." or "Dr." or numbers with periods
      const safeSentence = description.match(/^(?:(?!(?:St\.|Dr\.|Mt\.|Ft\.|Mr\.|Mrs\.|Ms\.|Jr\.|Sr\.|vs\.|etc\.|i\.e\.|e\.g\.))[^.!?]|St\.|Dr\.|Mt\.|Ft\.|Mr\.|Mrs\.|Ms\.|Jr\.|Sr\.|vs\.|etc\.|i\.e\.|e\.g\.)+[.!?]/);
      description = safeSentence ? safeSentence[0] : description.substring(0, 100) + '...';
    }
  }

  // Fallback to meta description
  if (!description) {
    const metaMatch = content.match(/<meta name="description" content="([^"]+)"/);
    if (metaMatch) {
      description = metaMatch[1].trim();
      if (description.length > 100) {
        const firstSentence = description.match(/^[^.!?]+[.!?]/);
        description = firstSentence ? firstSentence[0] : description.substring(0, 100) + '...';
      }
    }
  }

  // Get region from registry
  const regData = registry.ports[slug];
  const region = regData ? regData.region : 'other';
  const tier = regData ? regData.tier : 3;

  ports.push({
    slug,
    name,
    description: description || 'Cruise port destination',
    region,
    tier,
    url: `/ports/${slug}.html`
  });
}

// Group by region
const regionGroups = {};
for (const port of ports) {
  if (!regionGroups[port.region]) {
    regionGroups[port.region] = [];
  }
  regionGroups[port.region].push(port);
}

// Sort ports within each region by tier then name
for (const region of Object.keys(regionGroups)) {
  regionGroups[region].sort((a, b) => {
    if (a.tier !== b.tier) return a.tier - b.tier;
    return a.name.localeCompare(b.name);
  });
}

// Output summary
console.log('=== PORT SUMMARY ===');
console.log(`Total ports: ${ports.length}`);
console.log('');
console.log('By region:');
for (const [region, portList] of Object.entries(regionGroups)) {
  console.log(`  ${region}: ${portList.length} ports`);
}
console.log('');

// Output as JSON for further processing
const outputPath = path.join(__dirname, '..', 'assets', 'data', 'ports', 'port-summaries.json');
fs.writeFileSync(outputPath, JSON.stringify({
  generated: new Date().toISOString(),
  totalPorts: ports.length,
  ports: ports,
  byRegion: regionGroups
}, null, 2));

console.log(`Summaries written to: ${outputPath}`);

// Also output ports without good descriptions for review
const needsDescription = ports.filter(p =>
  !p.description ||
  p.description === 'Cruise port destination' ||
  p.description.length < 20
);

if (needsDescription.length > 0) {
  console.log('');
  console.log(`=== PORTS NEEDING BETTER DESCRIPTIONS (${needsDescription.length}) ===`);
  needsDescription.forEach(p => console.log(`  ${p.slug}: "${p.description}"`));
}
