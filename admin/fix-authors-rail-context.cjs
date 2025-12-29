#!/usr/bin/env node
/**
 * Fix Authors rail to be context-aware:
 * - Home page & authors page: Show all authors
 * - Tina's article: Show Tina
 * - Everything else: Show only Ken
 */

const fs = require('fs');
const path = require('path');

// Old loadAuthors pattern to find and replace
const OLD_LOAD_AUTHORS = `    function loadAuthors(){
      fetch('/data/authors.json')
        .then(r => r.ok ? r.json() : Promise.reject('Failed'))
        .then(data => {
          const authors = data.authors || [];
          const container = document.getElementById('authors-rail');
          if(!authors.length) return;
          container.innerHTML = authors.map(a => {
            const img = a.avatar || '/assets/img/default-avatar.jpg';
            return '<a href="' + a.url + '" class="rail-item" style="display:flex;gap:0.75rem;align-items:center;padding:0.5rem 0;border-bottom:1px solid #e0e8f0;text-decoration:none;color:inherit;">' +
              '<img src="' + img + '" alt="" width="48" height="48" style="border-radius:50%;object-fit:cover;flex-shrink:0;" loading="lazy"/>' +
              '<span style="display:flex;flex-direction:column;gap:0.1rem;">' +
                '<strong style="font-size:0.92rem;">' + a.name + '</strong>' +
                '<span class="tiny" style="color:#5a7a8a;">' + (a.role || 'Contributor') + '</span>' +
              '</span></a>';
          }).join('');
        })
        .catch(() => {});
    }`;

// New context-aware loadAuthors
const NEW_LOAD_AUTHORS = `    function loadAuthors(){
      fetch('/data/authors.json')
        .then(r => r.ok ? r.json() : Promise.reject('Failed'))
        .then(data => {
          const authors = data.authors || [];
          const container = document.getElementById('authors-rail');
          if(!authors.length || !container) return;

          // Context-aware author filtering
          const path = location.pathname.toLowerCase();
          const isHome = path === '/' || path === '/index.html';
          const isAuthorsPage = path.includes('/authors');
          const isTinaArticle = path.includes('why-i-started-solo-cruising') || path.includes('why-i-choose-to-cruise-solo');

          let filtered = authors;
          if(isHome || isAuthorsPage){
            // Show all authors on home and authors pages
            filtered = authors;
          } else if(isTinaArticle){
            // Show Tina on her article
            filtered = authors.filter(a => a.slug === 'tina-maulsby');
          } else {
            // Show only Ken everywhere else
            filtered = authors.filter(a => a.slug === 'ken-baker');
          }

          if(!filtered.length) return;
          container.innerHTML = filtered.map(a => {
            const img = a.webp || a.image || '/assets/img/default-avatar.jpg';
            return '<a href="' + a.url + '" class="rail-item" style="display:flex;gap:0.75rem;align-items:center;padding:0.5rem 0;border-bottom:1px solid #e0e8f0;text-decoration:none;color:inherit;">' +
              '<img src="' + img + '" alt="" width="48" height="48" style="border-radius:50%;object-fit:cover;flex-shrink:0;" loading="lazy"/>' +
              '<span style="display:flex;flex-direction:column;gap:0.1rem;">' +
                '<strong style="font-size:0.92rem;">' + a.name + '</strong>' +
                '<span class="tiny" style="color:#5a7a8a;">' + (a.roles ? a.roles[0] : 'Contributor') + '</span>' +
              '</span></a>';
          }).join('');
        })
        .catch(() => {});
    }`;

// Files to fix (already updated with old Authors rail)
const filesToFix = [
  // Root pages
  'index.html',
  'about-us.html',
  'accessibility.html',
  'cruise-lines.html',
  'drink-calculator.html',
  'drink-packages.html',
  'packing-lists.html',
  'planning.html',
  'ports.html',
  'privacy.html',
  'restaurants.html',
  'search.html',
  'ships.html',
  'stateroom-check.html',
  'terms.html',
  'travel.html',
  // Ship pages already fixed
  'ships/rcl/grandeur-of-the-seas.html',
  'ships/rcl/adventure-of-the-seas.html',
  'ships/rcl/allure-of-the-seas.html',
  'ships/rcl/anthem-of-the-seas.html',
  'ships/rcl/brilliance-of-the-seas.html',
];

let fixed = 0;
let skipped = 0;

for (const file of filesToFix) {
  const filePath = path.join(process.cwd(), file);

  if (!fs.existsSync(filePath)) {
    console.log(`○ ${file} (not found)`);
    skipped++;
    continue;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  if (content.includes(OLD_LOAD_AUTHORS)) {
    content = content.replace(OLD_LOAD_AUTHORS, NEW_LOAD_AUTHORS);
    fs.writeFileSync(filePath, content);
    console.log(`✓ ${file}`);
    fixed++;
  } else if (content.includes('Context-aware author filtering')) {
    console.log(`○ ${file} (already fixed)`);
    skipped++;
  } else {
    console.log(`○ ${file} (pattern not found)`);
    skipped++;
  }
}

console.log(`\n════════════════════════════════════════`);
console.log(`Fixed: ${fixed} | Skipped: ${skipped} | Total: ${filesToFix.length}`);
