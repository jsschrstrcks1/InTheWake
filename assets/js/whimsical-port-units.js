/* whimsical-port-units.js v1.0.0
 * Displays 3 random whimsical measurement units on port pages
 * - No duplicates on same page
 * - Refreshes on each page load
 * - Pulls from fun-distance-units.json database
 */

(function() {
  'use strict';

  async function loadWhimsicalUnits() {
    var container = document.getElementById('whimsical-units-container');
    if (!container) return;

    try {
      var response = await fetch('/assets/data/fun-distance-units.json');
      var data = await response.json();
      var units = data.units || [];

      if (units.length < 3) {
        container.style.display = 'none';
        return;
      }

      // Shuffle and pick 3 unique units from different categories if possible
      var categories = {};
      units.forEach(function(u) {
        if (!categories[u.category]) categories[u.category] = [];
        categories[u.category].push(u);
      });

      var categoryNames = Object.keys(categories);
      var selected = [];
      var usedIds = new Set();

      // Try to pick from different categories first
      var shuffledCategories = categoryNames.sort(function() { return Math.random() - 0.5; });

      for (var i = 0; i < shuffledCategories.length && selected.length < 3; i++) {
        var catUnits = categories[shuffledCategories[i]];
        var shuffled = catUnits.sort(function() { return Math.random() - 0.5; });
        for (var j = 0; j < shuffled.length && selected.length < 3; j++) {
          if (!usedIds.has(shuffled[j].id)) {
            selected.push(shuffled[j]);
            usedIds.add(shuffled[j].id);
            break; // One per category first pass
          }
        }
      }

      // If still need more, pick any remaining unique units
      var allShuffled = units.sort(function() { return Math.random() - 0.5; });
      for (var k = 0; k < allShuffled.length && selected.length < 3; k++) {
        if (!usedIds.has(allShuffled[k].id)) {
          selected.push(allShuffled[k]);
          usedIds.add(allShuffled[k].id);
        }
      }

      if (selected.length < 3) {
        container.style.display = 'none';
        return;
      }

      // Generate whimsical distance fact for each unit
      var facts = selected.map(function(unit) {
        // Create a fun comparison based on the unit
        var exampleFeet = getExampleDistance(unit.category);
        var inches = exampleFeet * 12;
        var count = Math.round(inches / unit.approx_length_in_inches);
        var label = count === 1 ? unit.label_singular : unit.label_plural;

        return {
          comparison: formatComparison(count, label, exampleFeet),
          note: unit.notes,
          category: unit.category
        };
      });

      // Render the section
      container.innerHTML =
        '<div class="whimsical-header" style="display:flex;align-items:center;gap:0.5rem;margin-bottom:1rem;">' +
          '<span style="font-size:1.4rem;">&#x1F4CF;</span>' +
          '<h4 style="margin:0;color:var(--accent,#0e6e8e);font-size:1rem;">Measuring in Whimsy</h4>' +
        '</div>' +
        '<p class="tiny" style="margin-bottom:1rem;color:#567;font-style:italic;">Because sometimes the best distances are measured in smiles.</p>' +
        '<ul style="list-style:none;padding:0;margin:0;">' +
        facts.map(function(f) {
          return '<li style="padding:0.6rem 0;border-bottom:1px solid #e8f0f4;font-size:0.9rem;line-height:1.5;">' +
            '<span style="color:var(--sea,#0a3d62);font-weight:500;">' + f.comparison + '</span>' +
            '<br><span class="tiny" style="color:#789;font-style:italic;">' + f.note + '</span>' +
          '</li>';
        }).join('') +
        '</ul>' +
        '<p class="tiny" style="margin-top:0.75rem;color:#9ab;text-align:center;">Refresh the page for new measurements!</p>';

    } catch (e) {
      console.log('Whimsical units error:', e);
      container.style.display = 'none';
    }
  }

  function getExampleDistance(category) {
    // Return appropriate example distances in feet for different categories
    var distances = {
      'tiny': [10, 15, 20, 25, 30],
      'small': [50, 75, 100, 150, 200],
      'medium': [200, 300, 400, 500, 600],
      'large': [500, 750, 1000, 1500, 2000],
      'massive': [1000, 2000, 3000, 5000, 10000],
      'magical': [100, 250, 500, 750, 1000]
    };
    var options = distances[category] || distances['medium'];
    return options[Math.floor(Math.random() * options.length)];
  }

  function formatComparison(count, label, feet) {
    var templates = [
      'A ' + feet + '-foot walk is about ' + count + ' ' + label + ' lined up',
      feet + ' feet? That\'s roughly ' + count + ' ' + label + ' end to end',
      'Picture ' + count + ' ' + label + ' in a row — that\'s ' + feet + ' feet',
      'About ' + count + ' ' + label + ' would stretch ' + feet + ' feet',
      feet + ' feet equals approximately ' + count + ' ' + label
    ];
    return templates[Math.floor(Math.random() * templates.length)];
  }

  // Load on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadWhimsicalUnits);
  } else {
    loadWhimsicalUnits();
  }

})();
