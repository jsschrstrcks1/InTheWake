/**
 * Nearby Ports Rail with Whimsical Distance Units
 * Displays the 10 closest ports with fun distance comparisons
 *
 * Usage: Set window.currentPortId before loading this script
 * Example: <script>window.currentPortId = 'cozumel';</script>
 *          <script src="/assets/js/nearby-ports.js"></script>
 */
(async function(){
  "use strict";

  var rail = document.getElementById('nearby-ports');
  if(!rail) return;

  var currentPortId = window.currentPortId;
  if(!currentPortId) {
    console.warn('Nearby Ports: window.currentPortId not set');
    return;
  }

  var NM_TO_INCHES = 72913.385827;

  function haversineDistance(lat1, lon1, lat2, lon2) {
    var R = 3440.065; // Earth radius in nautical miles
    var dLat = (lat2 - lat1) * Math.PI / 180;
    var dLon = (lon2 - lon1) * Math.PI / 180;
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  function formatNumber(n) {
    if (n >= 1e9) return (n / 1e9).toFixed(1).replace(/\.0$/, '') + ' billion';
    if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + ' million';
    if (n >= 1e3) return Math.round(n).toLocaleString();
    return Math.round(n).toLocaleString();
  }

  function pickRandom(arr) {
    return arr && arr.length ? arr[Math.floor(Math.random() * arr.length)] : null;
  }

  function getWhimsicalUnits(distNm, units) {
    var inches = distNm * NM_TO_INCHES;
    var byCategory = {};
    units.forEach(function(u) {
      if (!byCategory[u.category]) byCategory[u.category] = [];
      byCategory[u.category].push(u);
    });

    // Pick one from each tier: massive/large (reasonable), medium, tiny (ridiculous)
    var reasonable = pickRandom(byCategory.massive) || pickRandom(byCategory.large);
    var medium = pickRandom(byCategory.medium);
    var ridiculous = pickRandom(byCategory.tiny);

    var results = [];
    if (reasonable) {
      var count = inches / reasonable.approx_length_in_inches;
      results.push({
        count: count,
        label: count === 1 ? reasonable.label_singular : reasonable.label_plural
      });
    }
    if (medium) {
      var count2 = inches / medium.approx_length_in_inches;
      results.push({
        count: count2,
        label: count2 === 1 ? medium.label_singular : medium.label_plural
      });
    }
    if (ridiculous) {
      var count3 = inches / ridiculous.approx_length_in_inches;
      results.push({
        count: count3,
        label: count3 === 1 ? ridiculous.label_singular : ridiculous.label_plural
      });
    }
    return results;
  }

  try {
    var [portsRes, unitsRes] = await Promise.all([
      fetch('/assets/data/ports/ports-geo.json'),
      fetch('/assets/data/fun-distance-units.json')
    ]);
    var data = await portsRes.json();
    var unitsData = await unitsRes.json();
    var funUnits = unitsData.units || [];

    var currentPort = data.ports.find(function(p){ return p.id === currentPortId; });
    if(!currentPort) {
      console.warn('Nearby Ports: Port ID "' + currentPortId + '" not found in ports-geo.json');
      rail.innerHTML = '<p class="tiny" style="color:#999;">Port data unavailable</p>';
      return;
    }

    var nearby = data.ports
      .filter(function(p){ return p.id !== currentPortId; })
      .map(function(p){
        p.distance = haversineDistance(currentPort.lat, currentPort.lon, p.lat, p.lon);
        return p;
      })
      .sort(function(a,b){ return a.distance - b.distance; })
      .slice(0, 10);

    rail.innerHTML = nearby.map(function(p, idx){
      var distLabel = Math.round(p.distance) + ' nm';
      var whimsy = getWhimsicalUnits(p.distance, funUnits);
      var whimsyHtml = whimsy.length ?
        '<div class="whimsy-units" id="whimsy-'+idx+'" style="display:none;margin-top:0.5rem;padding:0.5rem;background:#f9fafb;border-radius:6px;font-size:0.75rem;color:#556;line-height:1.6;">' +
        '<span style="font-style:italic;color:#789;">That\'s roughly...</span><br>' +
        whimsy.map(function(w){ return '• <strong>' + formatNumber(w.count) + '</strong> ' + w.label; }).join('<br>') +
        '</div>' : '';

      return '<div style="border-bottom:1px solid #e0e8f0;">' +
        '<div class="port-row" data-whimsy="whimsy-'+idx+'" style="display:flex;justify-content:space-between;align-items:center;padding:0.5rem 0;cursor:pointer;">' +
        '<a href="'+p.url+'" style="font-size:0.9rem;text-decoration:none;color:inherit;" onclick="event.stopPropagation();">'+p.name+'</a>' +
        '<span style="font-size:0.75rem;color:#678;display:flex;align-items:center;gap:4px;">'+distLabel+' <span style="font-size:0.6rem;opacity:0.6;">▼</span></span>' +
        '</div>' + whimsyHtml + '</div>';
    }).join('');

    // Add click handlers for expanding whimsical units
    rail.querySelectorAll('.port-row').forEach(function(row){
      row.addEventListener('click', function(e){
        if(e.target.tagName === 'A') return;
        var whimsyId = row.getAttribute('data-whimsy');
        var whimsyEl = document.getElementById(whimsyId);
        if(whimsyEl) {
          whimsyEl.style.display = whimsyEl.style.display === 'none' ? 'block' : 'none';
        }
      });
    });
  } catch(e){
    console.log('Nearby ports error:', e);
    rail.innerHTML = '<p class="tiny" style="color:#999;">Could not load nearby ports</p>';
  }
})();
