#!/usr/bin/env node
/**
 * add-article-schema.cjs
 * Adds Article JSON-LD schema to ship pages that don't already have one.
 *
 * Extracts from each page:
 * - headline: from <title> tag (strips site name suffix)
 * - description: from <meta name="ai-summary">
 * - dateModified: from <meta name="last-reviewed">
 * - URL: constructed from file path
 */

const fs = require('fs');
const path = require('path');

const SHIPS_DIR = path.join(__dirname, '..', 'ships');
const BASE_URL = 'https://cruisinginthewake.com';

// Skip non-ship pages
const SKIP_FILES = new Set([
  'index.html', 'venues.html', 'template.html',
  'quiz.html', 'rooms.html', 'allshipquiz.html'
]);

function findHtmlFiles(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'assets') {
      results.push(...findHtmlFiles(fullPath));
    } else if (entry.name.endsWith('.html') && !SKIP_FILES.has(entry.name)) {
      results.push(fullPath);
    }
  }
  return results;
}

function extractMeta(content, name) {
  // Match <meta name="X" content="Y"/>  or  <meta name="X" content="Y">
  const regex = new RegExp(`<meta\\s+name="${name}"\\s+content="([^"]*)"`, 'i');
  const match = content.match(regex);
  return match ? match[1] : null;
}

function extractTitle(content) {
  const match = content.match(/<title>([^<]+)<\/title>/);
  if (!match) return null;
  let title = match[1].trim();
  // Strip site name suffixes:
  // " | In the Wake" or " | In The Wake"
  title = title.replace(/\s*\|\s*In [Tt]he Wake.*$/, '');
  // " • In The Wake" or " • In the Wake"
  title = title.replace(/\s*•\s*In [Tt]he Wake.*$/, '');
  return title.trim();
}

function buildArticleSchema(headline, description, dateModified, pageUrl) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": headline,
    "description": description,
    "dateModified": dateModified,
    "author": {
      "@type": "Person",
      "name": "Ken Baker",
      "url": `${BASE_URL}/authors/ken-baker.html`,
      "jobTitle": "Founder and Editor"
    },
    "publisher": {
      "@type": "Organization",
      "name": "In the Wake",
      "url": BASE_URL,
      "logo": {
        "@type": "ImageObject",
        "url": `${BASE_URL}/assets/logo_wake.png`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": pageUrl
    }
  };
}

let added = 0;
let skipped = 0;
let errors = [];
const modifiedFiles = [];

const files = findHtmlFiles(SHIPS_DIR);

for (const filePath of files) {
  const content = fs.readFileSync(filePath, 'utf8');
  const relPath = path.relative(path.join(__dirname, '..'), filePath);

  // Skip if already has Article schema
  if (content.includes('"@type": "Article"') || content.includes('"@type":"Article"')) {
    skipped++;
    continue;
  }

  // Extract required data
  const headline = extractTitle(content);
  const description = extractMeta(content, 'ai-summary');
  const dateModified = extractMeta(content, 'last-reviewed');

  if (!headline || !description || !dateModified) {
    errors.push(`${relPath}: missing headline=${!!headline}, description=${!!description}, dateModified=${!!dateModified}`);
    continue;
  }

  // Construct page URL
  const pageUrl = `${BASE_URL}/${relPath}`;

  // Build the schema
  const schema = buildArticleSchema(headline, description, dateModified, pageUrl);
  const schemaBlock = `
  <!-- JSON-LD: Article (editorial content signal) -->
  <script type="application/ld+json">
  ${JSON.stringify(schema, null, 4)}
  </script>
`;

  // Insert before </head>
  const headCloseIndex = content.indexOf('</head>');
  if (headCloseIndex === -1) {
    errors.push(`${relPath}: no </head> found`);
    continue;
  }

  const newContent = content.slice(0, headCloseIndex) + schemaBlock + content.slice(headCloseIndex);
  fs.writeFileSync(filePath, newContent, 'utf8');
  added++;
  modifiedFiles.push(relPath);
}

console.log(`\n=== Article JSON-LD Addition Summary ===`);
console.log(`Files scanned: ${files.length}`);
console.log(`Article schemas added: ${added}`);
console.log(`Already had Article schema: ${skipped}`);
console.log(`Errors: ${errors.length}`);
if (errors.length > 0) {
  console.log(`\nError details:`);
  errors.forEach(e => console.log(`  ${e}`));
}
console.log(`\nSample modified files:`);
modifiedFiles.slice(0, 10).forEach(f => console.log(`  ${f}`));
if (modifiedFiles.length > 10) {
  console.log(`  ... and ${modifiedFiles.length - 10} more`);
}
