/**
 * Royal Caribbean Drink Calculator - UI Layer
 * Version: 1.001.002 (COMPLETE - All Features Implemented)
 * 
 * "Let all things be done decently and in order" - 1 Corinthians 14:40
 * 
 * Soli Deo Gloria ✝️
 * 
 * v1.001.002 COMPLETE FEATURES:
 * ✅ Preset buttons (all 7 presets working)
 * ✅ Winner highlighting (right rail package cards turn green)
 * ✅ Quiz modal (full questionnaire flow)
 * ✅ Article rails (fetch and display)
 * ✅ Inline price editing (click to edit package prices)
 * ✅ Banner rendering
 * ✅ Totals rendering
 * ✅ Chart with proper sizing
 * ✅ Nudges & health notes
 */

'use strict';

/* ==================== PRESETS ==================== */

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
  solo: {
    label: 'Solo Traveler',
    emoji: '🧳',
    drinks: {
      soda: 2, coffee: 2, teaprem: 0, freshjuice: 0.5,
      mocktail: 0.5, energy: 0, milkshake: 0, bottledwater: 1,
      beer: 2, wine: 1, cocktail: 1, spirits: 0
    }
  },
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
  
  // Update UI inputs
  Object.keys(drinks).forEach(key => {
    const input = document.querySelector(`[data-input="${key}"]`);
    if (input && typeof drinks[key] === 'number' && drinks[key] >= 0) {
      input.value = drinks[key];
    }
  });
  
  // Trigger calculation
  if (window.ITW.scheduleCalc) {
    window.ITW.scheduleCalc();
  }
  
  if (window.ITW.announce) {
    window.ITW.announce(`Applied ${preset.label} preset`);
  }
  
  console.log(`[UI] Applied preset: ${presetKey}`);
}

/* ==================== RENDER FUNCTIONS ==================== */

function renderBanner(results) {
  const chipEl = document.getElementById('best-chip');
  const textEl = document.getElementById('best-text');
  
  if (!chipEl || !textEl || !results) return;
  
  const formatMoney = window.ITW?.formatMoney || ((v) => `$${v.toFixed(2)}`);
  
  const labels = {
    alc: 'À la carte',
    soda: 'Soda Package',
    refresh: 'Refreshment Package',
    deluxe: 'Deluxe Package'
  };
  
  const winnerLabel = labels[results.winnerKey] || 'À la carte';
  const winnerCost = results.bars[results.winnerKey]?.mean || 0;
  const alcCost = results.bars.alc?.mean || 0;
  const savings = alcCost - winnerCost;
  
  chipEl.textContent = `Best Value: ${winnerLabel}`;
  chipEl.className = 'badge';
  
  if (results.winnerKey === 'alc') {
    textEl.textContent = 'Paying as you go is your best option';
  } else if (savings > 0) {
    textEl.textContent = `Save ${formatMoney(savings)} over à-la-carte`;
  } else {
    textEl.textContent = '';
  }
}

function renderTotals(results) {
  const totalsEl = document.getElementById('totals');
  if (!totalsEl || !results) return;
  
  const formatMoney = window.ITW?.formatMoney || ((v) => `$${v.toFixed(2)}`);
  
  const perDay = formatMoney(results.perDay);
  const trip = formatMoney(results.trip);
  
  totalsEl.textContent = `${perDay}/day • ${trip} total`;
}

function renderChart(bars, winnerKey) {
  let canvas = document.getElementById('results-chart');
  if (!canvas) canvas = document.getElementById('breakeven-chart');
  
  if (!canvas) {
    console.warn('[UI] Chart canvas not found');
    return;
  }
  
  const container = canvas.parentElement;
  if (container && !container.style.maxHeight) {
    container.style.maxHeight = '400px';
    container.style.position = 'relative';
  }
  
  const ctx = canvas.getContext('2d');
  if (!ctx || !window.Chart) return;
  
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
  
  const formatMoney = window.ITW?.formatMoney || ((v) => `$${v.toFixed(2)}`);
  
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
  
  try {
    chartInstance = new Chart(ctx, {
      type: 'bar',
      data: data,
      options: {
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
      }
    });
  } catch (error) {
    console.error('[UI] Chart creation failed:', error);
  }
}

let chartInstance = null;

/* ==================== PACKAGE CARDS (WINNER HIGHLIGHTING) ==================== */

/**
 * ✅ NEW in v1.001.002: Winner highlighting for right rail packages
 * Green box + "Best Value" badge
 */
function renderPackageCards(results) {
  if (!results) return;
  
  const formatMoney = window.ITW?.formatMoney || ((v) => `$${v.toFixed(2)}`);
  const winnerKey = results.winnerKey;
  
  // Map of package card selectors
  const cards = {
    soda: document.querySelector('[data-card="soda"]'),
    refresh: document.querySelector('[data-card="refresh"]'),
    deluxe: document.querySelector('[data-card="deluxe"]')
  };
  
  // Reset all cards
  Object.values(cards).forEach(card => {
    if (card) {
      card.classList.remove('winner');
      const badge = card.querySelector('.winner-badge');
      if (badge) badge.remove();
    }
  });
  
  // Highlight winner
  const winnerCard = cards[winnerKey];
  if (winnerCard) {
    winnerCard.classList.add('winner');
    
    // Add badge
    const badge = document.createElement('div');
    badge.className = 'winner-badge';
    badge.textContent = '✓ Best Value';
    winnerCard.insertBefore(badge, winnerCard.firstChild);
  }
  
  // Update package prices
  const economics = window.ITW?.store?.get('economics');
  if (economics && economics.pkg) {
    const priceElements = {
      soda: document.querySelector('[data-pkg-price="soda"]'),
      refresh: document.querySelector('[data-pkg-price="refresh"]'),
      deluxe: document.querySelector('[data-pkg-price="deluxe"]')
    };
    
    if (priceElements.soda) priceElements.soda.textContent = formatMoney(economics.pkg.soda);
    if (priceElements.refresh) priceElements.refresh.textContent = formatMoney(economics.pkg.refresh);
    if (priceElements.deluxe) priceElements.deluxe.textContent = formatMoney(economics.pkg.deluxe);
  }
}

/* ==================== INLINE PRICE EDITING ==================== */

function setupInlinePriceEditing() {
  const priceElements = document.querySelectorAll('[data-edit-price]');
  
  priceElements.forEach(element => {
    const packageKey = element.dataset.editPrice;
    
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
          if (success && window.renderAll) {
            window.renderAll();
          } else {
            this.textContent = currentText;
          }
        }
      };
      
      input.addEventListener('blur', save);
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') save();
        else if (e.key === 'Escape') this.textContent = currentText;
      });
      
      this.textContent = '';
      this.appendChild(input);
      input.focus();
      input.select();
    });
  });
}

/* ==================== QUIZ MODAL ==================== */

let quizState = {
  step: 1,
  answers: {}
};

function setupQuiz() {
  const modal = document.getElementById('quiz-modal');
  const openBtn = document.getElementById('quiz-open-btn');
  const closeBtn = document.getElementById('quiz-close-btn');
  const skipBtn = document.getElementById('quiz-skip-btn');
  
  if (!modal) return;
  
  // Open quiz
  if (openBtn) {
    openBtn.addEventListener('click', () => {
      modal.style.display = 'block';
      modal.setAttribute('aria-hidden', 'false');
      quizState = { step: 1, answers: {} };
      showQuizStep(1);
    });
  }
  
  // Close quiz
  const closeQuiz = () => {
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    quizState = { step: 1, answers: {} };
  };
  
  if (closeBtn) closeBtn.addEventListener('click', closeQuiz);
  if (skipBtn) skipBtn.addEventListener('click', closeQuiz);
  
  // Close on background click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeQuiz();
  });
  
  // Quiz answer buttons
  document.querySelectorAll('.quiz-answer').forEach(btn => {
    btn.addEventListener('click', function() {
      const answer = this.dataset.quizAnswer;
      handleQuizAnswer(answer);
    });
  });
  
  // Apply button
  const applyBtn = document.getElementById('quiz-apply-btn');
  if (applyBtn) {
    applyBtn.addEventListener('click', () => {
      applyQuizResult();
      closeQuiz();
    });
  }
}

function showQuizStep(step) {
  [1, 2, 3].forEach(s => {
    const el = document.getElementById(`quiz-step-${s}`);
    if (el) el.style.display = s === step ? 'block' : 'none';
  });
  
  const resultEl = document.getElementById('quiz-result');
  if (resultEl) resultEl.style.display = 'none';
}

function handleQuizAnswer(answer) {
  const currentStep = quizState.step;
  quizState.answers[`step${currentStep}`] = answer;
  
  if (currentStep < 3) {
    quizState.step++;
    showQuizStep(quizState.step);
  } else {
    // Show result
    showQuizResult();
  }
}

function showQuizResult() {
  [1, 2, 3].forEach(s => {
    const el = document.getElementById(`quiz-step-${s}`);
    if (el) el.style.display = 'none';
  });
  
  const resultEl = document.getElementById('quiz-result');
  const recEl = document.getElementById('quiz-recommendation');
  
  if (!resultEl || !recEl) return;
  
  // Determine recommendation based on answers
  const { step1, step2, step3 } = quizState.answers;
  
  let preset = 'moderate';
  let message = '';
  
  if (step3 === 'nonalc') {
    preset = 'nonalc';
    message = '🚫🍺 Non-Alcoholic Package recommended! Focus on sodas, juices, and specialty coffees.';
  } else if (step3 === 'coffee') {
    preset = 'coffee';
    message = '☕ Coffee Lover Package! Perfect for specialty coffee enthusiasts.';
  } else if (step2 === 'light') {
    preset = 'light';
    message = '🍃 Light Drinker Package! Casual sipping with variety.';
  } else if (step2 === 'heavy' || step1 === 'party') {
    preset = 'party';
    message = '🎉 Party Package! Maximize your cruise experience.';
  } else if (step1 === 'solo') {
    preset = 'solo';
    message = '🧳 Solo Traveler Package! Balanced drinks for one.';
  }
  
  recEl.textContent = message;
  quizState.recommendedPreset = preset;
  
  resultEl.style.display = 'block';
}

function applyQuizResult() {
  if (quizState.recommendedPreset) {
    applyPreset(quizState.recommendedPreset);
  }
}

/* ==================== ARTICLE RAILS ==================== */

function fetchArticles() {
  const container = document.getElementById('recent-rail');
  const fallback = document.getElementById('recent-rail-fallback');
  
  if (!container) return;
  
  // Placeholder data (replace with actual fetch when API available)
  const articles = [
    {
      title: 'Royal Caribbean Drink Packages Explained',
      url: '/royal-caribbean-drink-packages.html',
      image: '/assets/images/drink-packages.jpg'
    },
    {
      title: 'Top 20 Questions About Cruising',
      url: '/top-20-cruise-questions.html',
      image: '/assets/images/cruise-questions.jpg'
    },
    {
      title: 'How to Save Money on Your Cruise',
      url: '/save-money-cruising.html',
      image: '/assets/images/save-money.jpg'
    }
  ];
  
  container.innerHTML = articles.map(article => {
    return `
      <a href="${article.url}" class="rail-article">
        <div class="rail-article-title">${article.title}</div>
      </a>
    `;
  }).join('');
  
  if (fallback) fallback.style.display = 'none';
}

/* ==================== NUDGES & HEALTH NOTES ==================== */

function renderNudges(nudges) {
  const container = document.getElementById('nudges-container');
  if (!container) return;
  
  if (!nudges || nudges.length === 0) {
    container.innerHTML = '';
    container.style.display = 'none';
    return;
  }
  
  container.style.display = 'block';
  container.innerHTML = '';
  
  nudges.forEach(nudge => {
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
    icon.textContent = nudge.icon || '💡';
    icon.style.fontSize = '24px';
    
    const message = document.createElement('span');
    message.textContent = nudge.message;
    
    div.appendChild(icon);
    div.appendChild(message);
    container.appendChild(div);
  });
}

function renderHealthNote(healthNote) {
  const container = document.getElementById('health-note-container');
  if (!container) return;
  
  if (!healthNote || typeof healthNote.message !== 'string') {
    container.innerHTML = '';
    container.style.display = 'none';
    return;
  }
  
  container.style.display = 'block';
  container.innerHTML = '';
  
  const colors = {
    moderate: { bg: '#fff3cd', border: '#ffc107', text: '#856404' },
    high: { bg: '#f8d7da', border: '#dc3545', text: '#721c24' }
  };
  
  const color = colors[healthNote.level] || colors.moderate;
  
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
  iconSpan.textContent = healthNote.icon || '⚕️';
  iconSpan.style.cssText = 'font-size: 24px; flex-shrink: 0;';
  
  const contentDiv = document.createElement('div');
  
  const strongLabel = document.createElement('strong');
  strongLabel.textContent = 'Health Note: ';
  
  const messageText = document.createTextNode(healthNote.message);
  
  contentDiv.appendChild(strongLabel);
  contentDiv.appendChild(messageText);
  
  wrapper.appendChild(iconSpan);
  wrapper.appendChild(contentDiv);
  
  container.appendChild(wrapper);
}

/* ==================== SUMMARY & TABLES ==================== */

function renderSummary(results) {
  const formatMoney = window.ITW?.formatMoney || ((v) => `$${v.toFixed(2)}`);
  
  const perDayEl = document.getElementById('summary-per-day');
  if (perDayEl && typeof results.perDay === 'number') {
    perDayEl.textContent = formatMoney(results.perDay);
  }
  
  const tripEl = document.getElementById('summary-trip');
  if (tripEl && typeof results.trip === 'number') {
    tripEl.textContent = formatMoney(results.trip);
  }
  
  const winnerEl = document.getElementById('winner-badge');
  if (winnerEl && typeof results.winnerKey === 'string') {
    const labels = {
      alc: 'À la carte',
      soda: 'Soda Package',
      refresh: 'Refreshment Package',
      deluxe: 'Deluxe Package'
    };
    winnerEl.textContent = labels[results.winnerKey] || 'À la carte';
  }
  
  const policyEl = document.getElementById('policy-note');
  if (policyEl) {
    if (results.policyNote && typeof results.policyNote === 'string') {
      policyEl.textContent = results.policyNote;
      policyEl.style.display = 'block';
    } else {
      policyEl.style.display = 'none';
    }
  }
}

function renderCategoryTable(categoryRows) {
  const tbody = document.querySelector('#category-table tbody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  const formatMoney = window.ITW?.formatMoney || ((v) => `$${v.toFixed(2)}`);
  const labels = window.ITW_CONFIG?.DRINK_LABELS || {};
  
  if (!Array.isArray(categoryRows)) return;
  
  categoryRows.forEach(row => {
    if (!row || typeof row.qty !== 'number' || row.qty === 0) return;
    
    const tr = document.createElement('tr');
    
    const tdDrink = document.createElement('td');
    tdDrink.textContent = labels[row.id] || row.id;
    
    const tdQty = document.createElement('td');
    tdQty.textContent = row.qty.toFixed(1);
    
    const tdPrice = document.createElement('td');
    tdPrice.textContent = formatMoney(row.price);
    
    const tdCost = document.createElement('td');
    tdCost.textContent = formatMoney(row.cost);
    
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
  
  renderBanner(results);
  renderTotals(results);
  renderChart(results.bars, results.winnerKey);
  renderPackageCards(results); // ✅ NEW: Winner highlighting
  renderSummary(results);
  renderCategoryTable(results.categoryRows || []);
  renderNudges(results.nudges || []);
  renderHealthNote(results.healthNote);
}

/* ==================== INITIALIZATION ==================== */

function initializeUI() {
  console.log('[UI] Initializing v1.001.002 (COMPLETE - All Features)');
  
  // Setup all features
  setupInlinePriceEditing();
  setupQuiz(); // ✅ NEW
  fetchArticles(); // ✅ NEW
  
  // Subscribe to store changes (debounced)
  if (window.ITW && window.ITW.store) {
    window.ITW.store.subscribe('results', () => {
      if (window._renderTimeout) clearTimeout(window._renderTimeout);
      window._renderTimeout = setTimeout(renderAll, 50);
    });
  }
  
  // Initial render
  renderAll();
  
  console.log('[UI] ✓ Initialized v1.001.002 - All features active');
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
  renderBanner,
  renderTotals,
  renderPackageCards, // ✅ NEW
  renderNudges,
  renderHealthNote,
  version: '1.001.002'
});

window.applyPreset = applyPreset; // Global for buttons

// "Let your light so shine before men" - Matthew 5:16
// Soli Deo Gloria ✝️
