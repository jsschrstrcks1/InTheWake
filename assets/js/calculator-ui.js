/**
 * Royal Caribbean Drink Calculator - UI Layer
 * Version: 1.001.001 
 * 
 * "Let all things be done decently and in order" - 1 Corinthians 14:40
 * 
 * Soli Deo Gloria ✝️
 * 
 * PHASE 1 FEATURES:
 * ✅ #5  Inline package price editing UI
 * ✅ #6  Presets moved to UI layer (out of core)
 * ✅ #9  Gentle nudges rendering
 * ✅ #10 Health guidelines display
 * ✅ #11 Solo traveler preset
 * ✅ #12 Soda drinker preset
 * 
 * v1.001.001 IMPROVEMENTS:
 * ✅ Safe DOM manipulation (textContent only)
 * ✅ Input sanitization
 * ✅ Version sync with worker
 */

'use strict';

/* ==================== PRESETS ==================== */
/**
 * ✅ PHASE 1 ITEM #6: Presets moved from core to UI layer
 * ✅ PHASE 1 ITEM #11: Solo traveler preset
 * ✅ PHASE 1 ITEM #12: Soda drinker preset
 * 
 * "Give instruction to a wise man, and he will be yet wiser" - Proverbs 9:9
 */
const PRESETS = {
  light: {
    label: 'Light Drinker',
    emoji: '🍃',
    drinks: {
      soda: 2, coffee: 1, teaprem: 0, freshjuice: 0,
      mocktail: 0, energy: 0, milkshake: 0, bottledwater: 1,
      beer: 1, wine: 1, cocktail: 0.5, spirits: 0
    }
  },
  moderate: {
    label: 'Moderate',
    emoji: '⚖️',
    drinks: {
      soda: 2, coffee: 2, teaprem: 0, freshjuice: 1,
      mocktail: 1, energy: 0, milkshake: 0.5, bottledwater: 2,
      beer: 2, wine: 2, cocktail: 2, spirits: 0.5
    }
  },
  party: {
    label: 'Party',
    emoji: '🎉',
    drinks: {
      soda: 2, coffee: 2, teaprem: 0, freshjuice: 1,
      mocktail: 1, energy: 1, milkshake: 0, bottledwater: 2,
      beer: 4, wine: 2, cocktail: 4, spirits: 2
    }
  },
  coffee: {
    label: 'Coffee Lover',
    emoji: '☕',
    drinks: {
      soda: 1, coffee: 4, teaprem: 1, freshjuice: 1,
      mocktail: 1, energy: 0, milkshake: 0.5, bottledwater: 2,
      beer: 0, wine: 0, cocktail: 0, spirits: 0
    }
  },
  nonalc: {
    label: 'Non-Alcoholic',
    emoji: '🚫🍺',
    drinks: {
      soda: 3, coffee: 2, teaprem: 1, freshjuice: 2,
      mocktail: 2, energy: 0.5, milkshake: 1, bottledwater: 2,
      beer: 0, wine: 0, cocktail: 0, spirits: 0
    }
  },
  // ✅ PHASE 1 ITEM #11: Solo traveler preset
  solo: {
    label: 'Solo Traveler',
    emoji: '🧳',
    drinks: {
      soda: 2, coffee: 2, teaprem: 0, freshjuice: 0.5,
      mocktail: 0.5, energy: 0, milkshake: 0, bottledwater: 1,
      beer: 2, wine: 1, cocktail: 1, spirits: 0
    }
  },
  // ✅ PHASE 1 ITEM #12: Soda drinker preset
  sodadrinker: {
    label: 'Soda Drinker',
    emoji: '🥤',
    drinks: {
      soda: 6, coffee: 1, teaprem: 0, freshjuice: 0,
      mocktail: 1, energy: 1, milkshake: 0.5, bottledwater: 2,
      beer: 0, wine: 0, cocktail: 0, spirits: 0
    }
  }
};

/* ==================== PRESET APPLICATION ==================== */

function applyPreset(presetKey) {
  const preset = PRESETS[presetKey];
  if (!preset) {
    console.warn(`[UI] Unknown preset: ${presetKey}`);
    return;
  }
  
  if (!window.ITW || !window.ITW.store) {
    console.error('[UI] ITW core not loaded');
    return;
  }
  
  const store = window.ITW.store;
  const inputs = store.get('inputs');
  const drinks = { ...inputs.drinks };
  
  // Apply preset values
  Object.keys(drinks).forEach(key => {
    drinks[key] = preset.drinks[key] !== undefined ? preset.drinks[key] : 0;
  });
  
  store.patch('inputs', { ...inputs, drinks });
  
  // Update UI inputs with validation
  Object.keys(drinks).forEach(key => {
    const input = document.querySelector(`[data-input="${key}"]`);
    if (input) {
      const value = drinks[key];
      // Validate: must be non-negative number
      if (typeof value === 'number' && value >= 0) {
        input.value = value;
      }
    }
  });
  
  // Trigger calculation
  if (window.ITW.scheduleCalc) {
    window.ITW.scheduleCalc();
  }
  
  // Save to storage
  if (window.ITW.store) {
    const state = window.ITW.store.get();
    const { inputs: savedInputs, economics } = state;
    try {
      localStorage.setItem('itw:rc:state:v10', JSON.stringify({
        value: JSON.stringify({ inputs: savedInputs, economics }),
        timestamp: Date.now(),
        version: '1.001.001'
      }));
    } catch (e) {
      console.warn('[UI] Could not save to localStorage:', e.message);
    }
  }
  
  if (window.ITW.announce) {
    window.ITW.announce(`Applied ${preset.label} preset`);
  }
  
  console.log(`[UI] Applied preset: ${presetKey}`);
}

/* ==================== PRESET UI RENDERING ==================== */

function renderPresetButtons() {
  const container = document.getElementById('preset-buttons');
  if (!container) return;
  
  // Clear existing buttons
  container.innerHTML = '';
  
  Object.keys(PRESETS).forEach(key => {
    const preset = PRESETS[key];
    const button = document.createElement('button');
    button.className = 'preset-btn';
    
    // ✅ Use textContent for safety
    button.textContent = `${preset.emoji} ${preset.label}`;
    button.setAttribute('data-preset', key);
    
    // Event listener (not inline)
    button.addEventListener('click', () => applyPreset(key));
    
    container.appendChild(button);
  });
}

/* ==================== INLINE PRICE EDITING ==================== */
/**
 * ✅ PHASE 1 ITEM #5: Inline package price editing UI
 * "The heart of the wise teacheth his mouth" - Proverbs 16:23
 */
function setupInlinePriceEditing() {
  const priceElements = document.querySelectorAll('[data-edit-price]');
  
  priceElements.forEach(element => {
    const packageKey = element.dataset.editPrice;
    
    // Make element look editable
    element.style.cursor = 'pointer';
    element.style.borderBottom = '1px dashed rgba(0,0,0,0.3)';
    element.title = 'Click to edit price';
    
    element.addEventListener('click', function() {
      const currentText = this.textContent;
      const currentValue = parseFloat(currentText.replace(/[^0-9.]/g, ''));
      
      const input = document.createElement('input');
      input.type = 'text';
      input.value = currentValue;
      input.style.width = '80px';
      input.style.fontSize = 'inherit';
      input.style.fontFamily = 'inherit';
      input.style.border = '2px solid #007bff';
      input.style.borderRadius = '4px';
      input.style.padding = '2px 6px';
      
      const save = () => {
        const newValue = input.value;
        if (window.ITW && window.ITW.updatePackagePrice) {
          const success = window.ITW.updatePackagePrice(packageKey, newValue);
          if (success) {
            // Update will trigger re-render via store subscription
            if (window.renderAll) {
              window.renderAll();
            }
          } else {
            // Restore original
            this.textContent = currentText;
          }
        }
      };
      
      input.addEventListener('blur', save);
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          save();
        } else if (e.key === 'Escape') {
          this.textContent = currentText;
        }
      });
      
      // ✅ Safe DOM: clear then append (no innerHTML)
      this.textContent = '';
      this.appendChild(input);
      input.focus();
      input.select();
    });
  });
}

/* ==================== GENTLE NUDGES RENDERING ==================== */
/**
 * ✅ PHASE 1 ITEM #9: Gentle nudges display
 * "A word spoken in due season, how good is it!" - Proverbs 15:23
 * 
 * ✅ v10.0.1: Uses textContent only (no innerHTML)
 */
function renderNudges(nudges) {
  const container = document.getElementById('nudges-container');
  if (!container) return;
  
  if (!nudges || nudges.length === 0) {
    container.innerHTML = '';
    container.style.display = 'none';
    return;
  }
  
  container.style.display = 'block';
  container.innerHTML = ''; // Clear
  
  nudges.forEach(nudge => {
    // Validate nudge has required properties
    if (!nudge || typeof nudge.message !== 'string') return;
    
    const div = document.createElement('div');
    div.className = 'nudge-item';
    div.style.cssText = `
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 12px 16px;
      margin: 8px 0;
      border-radius: 8px;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    `;
    
    const icon = document.createElement('span');
    icon.textContent = nudge.icon || '💡'; // ✅ textContent
    icon.style.fontSize = '24px';
    
    const message = document.createElement('span');
    message.textContent = nudge.message; // ✅ textContent (no HTML injection)
    
    div.appendChild(icon);
    div.appendChild(message);
    container.appendChild(div);
  });
}

/* ==================== HEALTH GUIDELINES RENDERING ==================== */
/**
 * ✅ PHASE 1 ITEM #10: Health guidelines display
 * "Know ye not that your body is the temple?" - 1 Corinthians 6:19
 * 
 * ✅ v10.0.1: Uses textContent only (no innerHTML)
 */
function renderHealthNote(healthNote) {
  const container = document.getElementById('health-note-container');
  if (!container) return;
  
  if (!healthNote || typeof healthNote.message !== 'string') {
    container.innerHTML = '';
    container.style.display = 'none';
    return;
  }
  
  container.style.display = 'block';
  container.innerHTML = ''; // Clear
  
  const colors = {
    moderate: { bg: '#fff3cd', border: '#ffc107', text: '#856404' },
    high: { bg: '#f8d7da', border: '#dc3545', text: '#721c24' }
  };
  
  const color = colors[healthNote.level] || colors.moderate;
  
  // Build with DOM methods (not innerHTML)
  const wrapper = document.createElement('div');
  wrapper.style.cssText = `
    background: ${color.bg};
    border-left: 4px solid ${color.border};
    color: ${color.text};
    padding: 16px;
    border-radius: 4px;
    margin: 16px 0;
    display: flex;
    align-items: start;
    gap: 12px;
    font-size: 14px;
    line-height: 1.6;
  `;
  
  const iconSpan = document.createElement('span');
  iconSpan.textContent = healthNote.icon || '⚕️'; // ✅ textContent
  iconSpan.style.cssText = 'font-size: 24px; flex-shrink: 0;';
  
  const contentDiv = document.createElement('div');
  
  const strongLabel = document.createElement('strong');
  strongLabel.textContent = 'Health Note: '; // ✅ textContent
  
  const messageText = document.createTextNode(healthNote.message); // ✅ text node
  
  contentDiv.appendChild(strongLabel);
  contentDiv.appendChild(messageText);
  
  wrapper.appendChild(iconSpan);
  wrapper.appendChild(contentDiv);
  
  container.appendChild(wrapper);
}

/* ==================== CHART RENDERING ==================== */

let chartInstance = null;

function renderChart(bars, winnerKey) {
  const canvas = document.getElementById('results-chart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  if (!window.Chart) {
    console.warn('[UI] Chart.js not loaded');
    return;
  }
  
  // Destroy previous chart
  if (chartInstance) {
    chartInstance.destroy();
  }
  
  const formatMoney = window.ITW?.formatMoney || ((v) => `$${v.toFixed(2)}`);
  
  // Validate bars data
  if (!bars || typeof bars !== 'object') return;
  
  const data = {
    labels: ['À la carte', 'Soda', 'Refreshment', 'Deluxe'],
    datasets: [{
      label: 'Total Cost',
      data: [
        bars.alc?.mean || 0,
        bars.soda?.mean || 0,
        bars.refresh?.mean || 0,
        bars.deluxe?.mean || 0
      ],
      backgroundColor: [
        winnerKey === 'alc' ? 'rgba(75, 192, 192, 0.8)' : 'rgba(75, 192, 192, 0.4)',
        winnerKey === 'soda' ? 'rgba(255, 159, 64, 0.8)' : 'rgba(255, 159, 64, 0.4)',
        winnerKey === 'refresh' ? 'rgba(153, 102, 255, 0.8)' : 'rgba(153, 102, 255, 0.4)',
        winnerKey === 'deluxe' ? 'rgba(255, 99, 132, 0.8)' : 'rgba(255, 99, 132, 0.4)'
      ],
      borderColor: [
        winnerKey === 'alc' ? 'rgba(75, 192, 192, 1)' : 'rgba(75, 192, 192, 0.6)',
        winnerKey === 'soda' ? 'rgba(255, 159, 64, 1)' : 'rgba(255, 159, 64, 0.6)',
        winnerKey === 'refresh' ? 'rgba(153, 102, 255, 1)' : 'rgba(153, 102, 255, 0.6)',
        winnerKey === 'deluxe' ? 'rgba(255, 99, 132, 1)' : 'rgba(255, 99, 132, 0.6)'
      ],
      borderWidth: 2
    }]
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => formatMoney(context.parsed.y)
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => formatMoney(value)
        }
      }
    }
  };
  
  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: data,
    options: options
  });
}

/* ==================== RESULTS SUMMARY ==================== */

function renderSummary(results) {
  const formatMoney = window.ITW?.formatMoney || ((v) => `$${v.toFixed(2)}`);
  
  // Per day
  const perDayEl = document.getElementById('summary-per-day');
  if (perDayEl && typeof results.perDay === 'number') {
    perDayEl.textContent = formatMoney(results.perDay); // ✅ textContent
  }
  
  // Trip total
  const tripEl = document.getElementById('summary-trip');
  if (tripEl && typeof results.trip === 'number') {
    tripEl.textContent = formatMoney(results.trip); // ✅ textContent
  }
  
  // Winner badge
  const winnerEl = document.getElementById('winner-badge');
  if (winnerEl && typeof results.winnerKey === 'string') {
    const labels = {
      alc: 'À la carte',
      soda: 'Soda Package',
      refresh: 'Refreshment Package',
      deluxe: 'Deluxe Package'
    };
    winnerEl.textContent = labels[results.winnerKey] || 'À la carte'; // ✅ textContent
  }
  
  // Policy note
  const policyEl = document.getElementById('policy-note');
  if (policyEl) {
    if (results.policyNote && typeof results.policyNote === 'string') {
      policyEl.textContent = results.policyNote; // ✅ textContent
      policyEl.style.display = 'block';
    } else {
      policyEl.style.display = 'none';
    }
  }
}

/* ==================== CATEGORY BREAKDOWN TABLE ==================== */

function renderCategoryTable(categoryRows) {
  const tbody = document.querySelector('#category-table tbody');
  if (!tbody) return;
  
  tbody.innerHTML = ''; // Clear
  
  const formatMoney = window.ITW?.formatMoney || ((v) => `$${v.toFixed(2)}`);
  const labels = window.ITW_CONFIG?.DRINK_LABELS || {};
  
  if (!Array.isArray(categoryRows)) return;
  
  categoryRows.forEach(row => {
    // Validate row
    if (!row || typeof row.qty !== 'number' || row.qty === 0) return;
    
    const tr = document.createElement('tr');
    
    const tdDrink = document.createElement('td');
    tdDrink.textContent = labels[row.id] || row.id; // ✅ textContent
    
    const tdQty = document.createElement('td');
    tdQty.textContent = row.qty.toFixed(1); // ✅ textContent
    
    const tdPrice = document.createElement('td');
    tdPrice.textContent = formatMoney(row.price); // ✅ textContent
    
    const tdCost = document.createElement('td');
    tdCost.textContent = formatMoney(row.cost); // ✅ textContent
    
    tr.appendChild(tdDrink);
    tr.appendChild(tdQty);
    tr.appendChild(tdPrice);
    tr.appendChild(tdCost);
    
    tbody.appendChild(tr);
  });
}

/* ==================== MAIN RENDER FUNCTION ==================== */

function renderAll() {
  if (!window.ITW || !window.ITW.store) {
    console.warn('[UI] ITW core not initialized');
    return;
  }
  
  const state = window.ITW.store.get();
  const { results } = state;
  
  if (!results) return;
  
  renderChart(results.bars, results.winnerKey);
  renderSummary(results);
  renderCategoryTable(results.categoryRows || []);
  renderNudges(results.nudges || []); // ✅ #9
  renderHealthNote(results.healthNote); // ✅ #10
}

/* ==================== INITIALIZATION ==================== */

function initializeUI() {
  console.log('[UI] Initializing v1.001.001 Royal Caribbean Drink Package Calculator');
  
  // Render preset buttons
  renderPresetButtons();
  
  // Setup inline price editing
  setupInlinePriceEditing();
  
  // Listen for calculation updates
  document.addEventListener('itw:calc-updated', () => {
    renderAll();
  });
  
  // Subscribe to store changes
  if (window.ITW && window.ITW.store) {
    window.ITW.store.subscribe('results', () => {
      renderAll();
    });
  }
  
  // Initial render
  renderAll();
  
  console.log('[UI] ✓ Initialized v1.001.001');
}

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeUI);
} else {
  initializeUI();
}

/* ==================== EXPORTS ==================== */

window.ITW_UI = Object.freeze({
  renderAll,
  applyPreset,
  renderChart,
  renderNudges,
  renderHealthNote,
  version: 'v1.001.001'
});

// Make applyPreset globally accessible for buttons
window.applyPreset = applyPreset;

// "Let your light so shine before men" - Matthew 5:16
// Soli Deo Gloria ✝️
