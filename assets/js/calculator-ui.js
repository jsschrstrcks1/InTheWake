/**
 * Royal Caribbean Drink Calculator - UI Layer
 * Version: 10.0.0
 * 
 * "Let your light so shine before men, that they may see your good works,
 * and glorify your Father which is in heaven"
 * - Matthew 5:16
 * 
 * Soli Deo Gloria ✝️
 * 
 * This module handles ALL UI rendering:
 * - Chart.js integration (with infinite scroll fix)
 * - Preset system
 * - Interactive quiz
 * - Package cards
 * - Group breakdown
 * - Category breakdown
 * - Email capture
 * - Navigation dropdowns
 * 
 * DOES NOT:
 * - Manage state (reads from store only)
 * - Perform calculations
 * - Handle persistence
 */

(function() {
'use strict';

const VERSION = '10.0.0';

// Wait for core to be ready
if (!window.ITW || !window.ITW.version) {
  console.error('[UI] Core not loaded, waiting...');
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      if (window.ITW && window.ITW.version) {
        initialize();
      } else {
        console.error('[UI] Core failed to load');
      }
    }, 100);
  });
  return;
}

console.log(`[UI] v${VERSION} Initializing...`);

/* ==================== SHORTCUTS ==================== */
const { store, formatMoney, getCurrency, announce, config } = window.ITW;
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

/* ==================== CHART.JS INTEGRATION ==================== */
/**
 * Chart with infinite scroll protection
 * "Let your light so shine" - Matthew 5:16
 */
let chart = null;
let chartResizeTimer = null;
let lastChartWidth = 0;
let lastChartHeight = 0;

function initializeChart() {
  if (!window.Chart) {
    showChartFallback();
    return;
  }

  const canvas = $('#breakeven-chart');
  const wrapper = $('#breakeven-wrap');
  
  if (!canvas || !wrapper) return;

  const ctx = canvas.getContext('2d');
  
  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['À-la-carte', 'Coffee Card', 'Soda', 'Refreshment', 'Deluxe'],
      datasets: [{
        label: 'Daily Cost',
        data: [0, 0, 0, 0, 0],
        backgroundColor: [
          'rgba(14, 110, 142, 0.8)',  // alc
          'rgba(139, 69, 19, 0.8)',   // coffee
          'rgba(255, 159, 64, 0.8)',  // soda
          'rgba(75, 192, 192, 0.8)',  // refresh
          'rgba(153, 102, 255, 0.8)'  // deluxe
        ],
        borderColor: [
          'rgb(14, 110, 142)',
          'rgb(139, 69, 19)',
          'rgb(255, 159, 64)',
          'rgb(75, 192, 192)',
          'rgb(153, 102, 255)'
        ],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 2,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(context) {
              return formatMoney(context.parsed.y) + '/day';
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return formatMoney(value);
            }
          }
        }
      }
    }
  });

  // CRITICAL: Infinite scroll fix with dimension guard + throttle
  const resizeObserver = new ResizeObserver(() => {
    const w = wrapper.clientWidth;
    const h = wrapper.clientHeight;
    
    // Guard: Only resize if dimensions actually changed
    if (w === lastChartWidth && h === lastChartHeight) {
      return;
    }
    
    lastChartWidth = w;
    lastChartHeight = h;
    
    // Throttle: Prevent rapid-fire updates
    clearTimeout(chartResizeTimer);
    chartResizeTimer = setTimeout(() => {
      if (chart && typeof chart.resize === 'function') {
        try {
          chart.resize();
        } catch (err) {
          console.error('[UI] Chart resize error:', err);
        }
      }
    }, 150); // 150ms throttle
  });
  
  resizeObserver.observe(wrapper);
  
  store.patch('ui.chartReady', true);
  console.log('[UI] Chart initialized with infinite scroll protection');
}

function updateChart(results) {
  if (!chart || !results) return;

  try {
    const { bars, winnerKey } = results;
    
    // Update data
    chart.data.datasets[0].data = [
      bars.alc.mean,
      bars.coffee?.mean || 0,
      bars.soda.mean,
      bars.refresh.mean,
      bars.deluxe.mean
    ];
    
    // Update winner badge position
    const stamp = $('#best-stamp');
    if (stamp) {
      const winnerIndex = {
        'alc': 0,
        'coffee': 1,
        'soda': 2,
        'refresh': 3,
        'deluxe': 4
      }[winnerKey] || 0;
      
      stamp.style.left = `${winnerIndex * 20 + 10}%`;
      stamp.style.display = 'block';
    }
    
    // Update chart (single call, throttled by ResizeObserver)
    chart.update('none'); // 'none' mode = no animation for performance
    
    // Update screen reader table
    updateScreenReaderTable(bars);
  } catch (err) {
    console.error('[UI] Chart update error:', err);
  }
}

function updateScreenReaderTable(bars) {
  $('#sr-alc').textContent = formatMoney(bars.alc.mean);
  $('#sr-coffee').textContent = formatMoney(bars.coffee?.mean || 0);
  $('#sr-soda').textContent = formatMoney(bars.soda.mean);
  $('#sr-refresh').textContent = formatMoney(bars.refresh.mean);
  $('#sr-deluxe').textContent = formatMoney(bars.deluxe.mean);
}

function showChartFallback() {
  const wrapper = $('#breakeven-wrap');
  if (!wrapper) return;
  
  wrapper.innerHTML = `
    <div class="chart-fallback" role="alert">
      <p><strong>Chart unavailable</strong></p>
      <p class="tiny">Chart.js failed to load. Results are shown in the table below.</p>
    </div>
  `;
}

/* ==================== PRESET SYSTEM ==================== */
/**
 * Consolidated preset logic from extras.js and inline scripts
 */
const PRESETS = {
  light: {
    name: 'Light Drinker 🧘',
    desc: 'Casual cruiser who enjoys a few drinks but isn\'t drinking all day.',
    drinks: {
      soda: 2, coffee: 1, teaprem: 0, freshjuice: 0,
      mocktail: 0, energy: 0, milkshake: 0, bottledwater: 1,
      beer: 1, wine: 1, cocktail: 0.5, spirits: 0
    },
    tip: 'You\'ll likely save money ordering à-la-carte or with a basic package.'
  },
  
  moderate: {
    name: 'Moderate Drinker 🥂',
    desc: 'Social drinker who enjoys multiple drinks per day, especially at dinner and by the pool.',
    drinks: {
      soda: 2, coffee: 2, teaprem: 0, freshjuice: 1,
      mocktail: 1, energy: 0, milkshake: 0.5, bottledwater: 2,
      beer: 2, wine: 2, cocktail: 2, spirits: 0.5
    },
    tip: 'Refreshment or Deluxe package likely makes sense for you.'
  },
  
  party: {
    name: 'Party Mode 🎉',
    desc: 'Living it up! Drinks flow freely from breakfast through late-night at the bars.',
    drinks: {
      soda: 2, coffee: 2, teaprem: 0, freshjuice: 1,
      mocktail: 1, energy: 1, milkshake: 0, bottledwater: 2,
      beer: 4, wine: 2, cocktail: 4, spirits: 2
    },
    tip: 'Deluxe package is almost certainly worth it for your drinking style.'
  },
  
  coffee: {
    name: 'Coffee Lover ☕',
    desc: 'Can\'t start the day without specialty coffee, maybe a latte or cappuccino mid-afternoon too.',
    drinks: {
      soda: 1, coffee: 4, teaprem: 1, freshjuice: 1,
      mocktail: 1, energy: 0, milkshake: 0.5, bottledwater: 2,
      beer: 0, wine: 0, cocktail: 0, spirits: 0
    },
    tip: 'Coffee card or Refreshment package recommended.'
  },
  
  nonalc: {
    name: 'Non-Alcoholic 🚫🍺',
    desc: 'Abstaining from alcohol but love specialty drinks, sodas, and fresh juices.',
    drinks: {
      soda: 3, coffee: 2, teaprem: 1, freshjuice: 2,
      mocktail: 2, energy: 0.5, milkshake: 1, bottledwater: 2,
      beer: 0, wine: 0, cocktail: 0, spirits: 0
    },
    tip: 'Refreshment package likely your best bet.'
  }
};

/* ==================== QUIZ SYSTEM ==================== */
/**
 * Interactive quiz to help users find their drinking pattern
 */
let quizState = {
  step: 1,
  answers: {}
};

function openQuiz() {
  const modal = $('#quiz-modal');
  if (!modal) return;
  
  modal.setAttribute('aria-hidden', 'false');
  modal.style.display = 'flex';
  
  // Reset quiz
  quizState = { step: 1, answers: {} };
  showQuizStep(1);
  
  // Focus first button
  setTimeout(() => {
    const firstBtn = modal.querySelector('.quiz-answer');
    if (firstBtn) firstBtn.focus();
  }, 100);
}

function closeQuiz() {
  const modal = $('#quiz-modal');
  if (!modal) return;
  
  modal.setAttribute('aria-hidden', 'true');
  modal.style.display = 'none';
  
  // Focus the quiz open button
  const openBtn = $('#quiz-open-btn');
  if (openBtn) openBtn.focus();
}

function showQuizStep(step) {
  // Hide all steps
  for (let i = 1; i <= 3; i++) {
    const stepDiv = $(`#quiz-step-${i}`);
    if (stepDiv) stepDiv.style.display = 'none';
  }
  
  const resultDiv = $('#quiz-result');
  if (resultDiv) resultDiv.style.display = 'none';
  
  // Show current step
  const currentStep = $(`#quiz-step-${step}`);
  if (currentStep) currentStep.style.display = 'block';
}

function handleQuizAnswer(question, answer) {
  quizState.answers[question] = answer;
  
  if (quizState.step < 3) {
    quizState.step++;
    showQuizStep(quizState.step);
  } else {
    // All questions answered, show result
    showQuizResult();
  }
}

function showQuizResult() {
  const { answers } = quizState;
  
  // Determine recommendation based on answers
  let recommendation = '';
  let presetKey = 'moderate';
  
  // Question 2: drinking amount
  const amount = answers.q2 || 'moderate';
  
  // Question 3: preference
  const preference = answers.q3 || 'cocktails';
  
  if (preference === 'nonalc') {
    presetKey = 'nonalc';
    recommendation = `
      <h4>Refreshment Package</h4>
      <p class="small">Perfect for non-drinkers! You'll get unlimited specialty coffees, fresh juices, mocktails, 
      bottled water, and premium sodas. With your drinking pattern, you'll easily break even.</p>
    `;
  } else if (preference === 'coffee') {
    presetKey = 'coffee';
    recommendation = `
      <h4>Coffee Card or Refreshment Package</h4>
      <p class="small">Coffee lovers should consider the Coffee Card (15 punches for ~$31) if you drink 2-3 
      specialty coffees per day. For more variety (smoothies, mocktails, fresh juice), go with Refreshment.</p>
    `;
  } else if (amount === 'heavy' || (amount === 'moderate' && answers.q1 === 'party')) {
    presetKey = 'party';
    recommendation = `
      <h4>Deluxe Beverage Package</h4>
      <p class="small">With your drinking style, the Deluxe package is likely your best value. Unlimited cocktails, 
      beer, wine, plus all non-alcoholic drinks. You'll break even after just 6-7 alcoholic drinks per day.</p>
    `;
  } else if (amount === 'light') {
    presetKey = 'light';
    recommendation = `
      <h4>À-la-carte or Soda Package</h4>
      <p class="small">Light drinkers often save money ordering drinks individually. Track what you buy the first 
      day — if you're spending $40+, consider upgrading to a package.</p>
    `;
  } else {
    // Moderate amount, cocktails/beer-wine preference
    presetKey = 'moderate';
    recommendation = `
      <h4>Refreshment or Deluxe Package</h4>
      <p class="small">You're right in the sweet spot! If you drink 4+ alcoholic drinks per day, go Deluxe. 
      If you mix in lots of coffees, sodas, and mocktails with fewer alcoholic drinks, Refreshment might be better.</p>
    `;
  }
  
  // Store the recommendation for apply
  quizState.recommendedPreset = presetKey;
  
  const resultDiv = $('#quiz-result');
  const recDiv = $('#quiz-recommendation');
  
  if (resultDiv && recDiv) {
    recDiv.innerHTML = recommendation;
    resultDiv.style.display = 'block';
  }
}

function applyQuizResult() {
  if (quizState.recommendedPreset) {
    applyPreset(quizState.recommendedPreset);
    closeQuiz();
    
    // Scroll to inputs
    const inputsCard = $('.card.inputs');
    if (inputsCard) {
      inputsCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}

function wireQuiz() {
  // Open button
  const openBtn = $('#quiz-open-btn');
  if (openBtn) {
    openBtn.addEventListener('click', openQuiz);
  }
  
  // Close button
  const closeBtn = $('#quiz-close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeQuiz);
  }
  
  // Skip button
  const skipBtn = $('#quiz-skip-btn');
  if (skipBtn) {
    skipBtn.addEventListener('click', closeQuiz);
  }
  
  // Answer buttons
  $$('.quiz-answer').forEach(btn => {
    btn.addEventListener('click', () => {
      const answer = btn.dataset.quizAnswer;
      const question = `q${quizState.step}`;
      handleQuizAnswer(question, answer);
    });
  });
  
  // Apply button
  const applyBtn = $('#quiz-apply-btn');
  if (applyBtn) {
    applyBtn.addEventListener('click', applyQuizResult);
  }
  
  // Escape key closes modal
  document.addEventListener('keydown', (e) => {
    const modal = $('#quiz-modal');
    if (modal && modal.style.display !== 'none' && e.key === 'Escape') {
      closeQuiz();
    }
  });
  
  // Click outside closes modal
  const modal = $('#quiz-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeQuiz();
      }
    });
  }
}

/* ==================== RESULTS RENDERING ==================== */
function renderResults(results) {
  if (!results) return;

  const { bars, winnerKey, perDay, trip, included, overcap, policyNote } = results;
  
  // Update best value banner
  const bestChip = $('#best-chip');
  const bestText = $('#best-text');
  
  if (bestChip && bestText) {
    const winnerNames = {
      'alc': 'À-la-carte',
      'coffee': 'Coffee Card',
      'soda': 'Soda Package',
      'refresh': 'Refreshment Package',
      'deluxe': 'Deluxe Package'
    };
    
    const winnerName = winnerNames[winnerKey] || 'Unknown';
    const savings = bars.alc.mean - bars[winnerKey].mean;
    
    bestChip.textContent = `Best Value: ${winnerName}`;
    bestChip.className = `badge badge-${winnerKey}`;
    
    if (savings > 0) {
      bestText.textContent = `Saves ${formatMoney(savings)}/day vs à-la-carte`;
    } else if (winnerKey === 'alc') {
      bestText.textContent = 'Just order drinks as you go!';
    } else {
      bestText.textContent = '';
    }
  }
  
  // Update totals
  const totalsSpan = $('#totals');
  if (totalsSpan) {
    totalsSpan.textContent = `${formatMoney(perDay)}/day · ${formatMoney(trip)} total`;
  }
  
  // Update package cards
  updatePackageCards(bars, included, overcap);
  
  // Update policy note
  if (policyNote) {
    const policyDiv = $('#policy-note');
    const policyText = $('#policy-text');
    if (policyDiv && policyText) {
      policyText.textContent = policyNote;
      policyDiv.hidden = false;
    }
  } else {
    const policyDiv = $('#policy-note');
    if (policyDiv) policyDiv.hidden = true;
  }
  
  // Update chart
  updateChart(results);
  
  // Update category breakdown
  if (results.categoryRows && results.categoryRows.length > 0) {
    renderCategoryBreakdown(results.categoryRows);
  }
  
  // Update group breakdown
  if (results.groupRows && results.groupRows.length > 0) {
    renderGroupBreakdown(results.groupRows);
  }
}

function updatePackageCards(bars, included, overcap) {
  // Package prices
  const economics = store.get('economics');
  
  $$('[data-pkg-price]').forEach(el => {
    const pkg = el.dataset.pkgPrice;
    if (pkg === 'coffee') {
      el.textContent = formatMoney(31.0); // Coffee card is fixed
    } else if (economics.pkg[pkg]) {
      el.textContent = formatMoney(economics.pkg[pkg]);
    }
  });
  
  // Included value
  $$('[data-inc]').forEach(el => {
    const pkg = el.dataset.inc;
    if (included[pkg] !== undefined) {
      el.textContent = `Includes: ${formatMoney(included[pkg])}/day in drinks`;
    }
  });
  
  // Over-cap estimate
  const overcapNote = $('#overcap-est');
  if (overcapNote) {
    if (overcap > 0) {
      overcapNote.textContent = `Over-cap: ${formatMoney(overcap)}/day extra`;
      overcapNote.style.display = 'block';
    } else {
      overcapNote.style.display = 'none';
    }
  }
  
  // Highlight winner card
  $$('.package-card').forEach(card => {
    card.classList.remove('winner');
  });
  
  const winnerKey = store.get('results').winnerKey;
  const winnerCard = $(`.package-card[data-card="${winnerKey}"]`);
  if (winnerCard) {
    winnerCard.classList.add('winner');
  }
}

function renderCategoryBreakdown(categoryRows) {
  const grid = $('#category-grid');
  const section = $('#category-breakdown');
  
  if (!grid || !section) return;
  
  if (categoryRows.length === 0) {
    section.hidden = true;
    return;
  }
  
  const html = categoryRows.map(row => {
    return `
      <div class="category-item">
        <div class="category-label">${row.label}</div>
        <div class="category-value">${formatMoney(row.value)}</div>
      </div>
    `;
  }).join('');
  
  grid.innerHTML = html;
  section.hidden = false;
}

function renderGroupBreakdown(groupRows) {
  const tbody = $('#group-table-body');
  const section = $('#group-breakdown');
  
  if (!tbody || !section) return;
  
  if (groupRows.length === 0) {
    section.hidden = true;
    return;
  }
  
  const html = groupRows.map(row => {
    return `
      <tr>
        <td>${row.traveler}</td>
        <td>${row.package}</td>
        <td>${formatMoney(row.daily)}</td>
        <td>${formatMoney(row.trip)}</td>
      </tr>
    `;
  }).join('');
  
  tbody.innerHTML = html;
  section.hidden = false;
}

/* ==================== NAVIGATION DROPDOWNS ==================== */
/**
 * Accessible dropdown navigation
 */
function wireNavigation() {
  const groups = $$('.nav-group');
  
  const setOpen = (group, open) => {
    group.dataset.open = open ? 'true' : 'false';
    group.classList.toggle('open', open);
    
    const btn = group.querySelector('.nav-disclosure');
    if (btn) {
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
  };
  
  const closeAll = (except = null) => {
    groups.forEach(g => {
      if (g !== except) setOpen(g, false);
    });
  };
  
  groups.forEach(group => {
    const btn = group.querySelector('.nav-disclosure');
    const menu = group.querySelector('.submenu');
    
    if (!btn || !menu) return;
    
    // Click to toggle
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const open = group.dataset.open === 'true';
      closeAll(group);
      setOpen(group, !open);
    });
    
    // Keyboard navigation
    group.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        setOpen(group, false);
        if (btn) btn.focus();
      }
      
      if (e.key === 'ArrowDown' && document.activeElement === btn) {
        e.preventDefault();
        setOpen(group, true);
        const firstLink = menu.querySelector('a, button');
        if (firstLink) firstLink.focus();
      }
    });
    
    // Close on focus out
    menu.addEventListener('focusout', () => {
      setTimeout(() => {
        if (!group.contains(document.activeElement)) {
          setOpen(group, false);
        }
      }, 0);
    });
  });
  
  // Close all on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-group')) {
      closeAll();
    }
  }, true);
  
  // Close all on window blur
  window.addEventListener('blur', () => closeAll());
}

/* ==================== EMAIL CAPTURE ==================== */
function wireEmailCapture() {
  const form = $('#email-form');
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = form.querySelector('input[name="email"]').value;
    
    // Basic validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      announce('Please enter a valid email address', 'assertive');
      return;
    }
    
    // Get current results
    const results = store.get('results');
    const inputs = store.get('inputs');
    
    // Populate hidden fields
    $('#email-savings').value = formatMoney(results.perDay);
    $('#email-rec').value = results.winnerKey;
    $('#email-days').value = inputs.days;
    
    // Submit (you'll need to implement the backend)
    try {
      announce('Sending email...');
      
      // TODO: Implement email submission to your backend
      // const response = await fetch('/api/email-results', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, results, inputs })
      // });
      
      // For now, just show success
      announce('Results sent! Check your email.', 'polite');
      form.reset();
    } catch (err) {
      console.error('[UI] Email submission error:', err);
      announce('Failed to send email. Please try again.', 'assertive');
    }
  });
}

/* ==================== RECENT ARTICLES RAIL ==================== */
async function loadRecentArticles() {
  const mount = $('#recent-rail');
  const fallback = $('#recent-rail-fallback');
  
  if (!mount) return;
  
  if (fallback) fallback.style.display = 'block';
  
  try {
    const response = await fetch(`/assets/data/articles/index.json?v=${VERSION}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) throw new Error('Articles fetch failed');
    
    const data = await response.json();
    const articles = Array.isArray(data.articles) ? data.articles : [];
    
    if (articles.length === 0) {
      mount.innerHTML = '<p class="tiny muted">No articles available</p>';
      return;
    }
    
    const html = articles.slice(0, 3).map(article => {
      const title = article.title || 'Untitled';
      const url = article.url || '#';
      const date = article.date ? new Date(article.date).toLocaleDateString() : '';
      
      return `
        <article class="rail-item">
          <div>
            <h4 style="margin:.1rem 0 .2rem">
              <a href="${url}">${title}</a>
            </h4>
            ${date ? `<p class="tiny muted">${date}</p>` : ''}
          </div>
        </article>
      `;
    }).join('');
    
    mount.innerHTML = html;
    
    if (fallback) fallback.style.display = 'none';
  } catch (err) {
    console.warn('[UI] Failed to load articles:', err);
    mount.innerHTML = '<p class="tiny muted">Unable to load articles</p>';
    if (fallback) fallback.style.display = 'none';
  }
}

/* ==================== ACTION BUTTONS ==================== */
function wireActionButtons() {
  // Share button
  const shareBtn = $('#share-btn');
  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      window.ITW.shareScenario();
    });
  }
  
  // Reset button
  const resetBtn = $('#reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Reset all inputs to defaults?')) {
        window.ITW.resetInputs();
        
        // Hide preset explanation
        const explanation = $('#preset-explanation');
        if (explanation) explanation.style.display = 'none';
      }
    });
  }
}

/* ==================== UI STATE MANAGEMENT ==================== */
function showCalculator() {
  const loading = $('#loading-state');
  const app = $('#calculator-app');
  
  if (loading) loading.style.display = 'none';
  if (app) app.style.display = 'block';
}

function updateUIState(uiState) {
  // Fallback banner
  const fallbackBanner = $('#fallback-banner');
  if (fallbackBanner) {
    fallbackBanner.hidden = !uiState.fallbackBanner;
  }
  
  // Offline rates chip
  const offlineChip = $('#offline-rates-chip');
  if (offlineChip) {
    offlineChip.hidden = !uiState.fxStale;
  }
  
  // FX note
  const fxNote = $('#fx-note');
  if (fxNote) {
    const rates = window.ITW._debug.getFXRates();
    if (rates.asOf) {
      fxNote.textContent = `(rates as of ${rates.asOf})`;
    }
  }
}

/* ==================== STORE SUBSCRIPTIONS ==================== */
/**
 * Subscribe to store changes and update UI accordingly
 * This is the ONLY place chart.update() is called
 */
function subscribeToStore() {
  // Results changes → update chart and results display
  store.subscribe('results', (results) => {
    renderResults(results);
  });
  
  // UI state changes → update banners
  store.subscribe('ui', (uiState) => {
    updateUIState(uiState);
  });
  
  // Economics changes → update package cards
  store.subscribe('economics', (economics) => {
    const results = store.get('results');
    if (results && results.bars) {
      updatePackageCards(results.bars, results.included, results.overcap);
    }
  });
  
  // Calculation updates → show calculator
  document.addEventListener('itw:calc-updated', () => {
    showCalculator();
  });
}

/* ==================== INITIALIZATION ==================== */
/**
 * Initialize UI layer
 */
function initialize() {
  console.log(`[UI] v${VERSION} Initializing...`);
  
  // Wire up all interactive elements
  wireNavigation();
  wirePresetButtons();
  wireQuiz();
  wireEmailCapture();
  wireActionButtons();
  
  // Load dynamic content
  loadRecentArticles();
  
  // Initialize chart
  if (window.Chart) {
    initializeChart();
  } else {
    console.warn('[UI] Chart.js not loaded');
  }
  
  // Subscribe to store changes
  subscribeToStore();
  
  // Initial render
  const results = store.get('results');
  const uiState = store.get('ui');
  
  if (results) renderResults(results);
  if (uiState) updateUIState(uiState);
  
  // Show calculator after first render
  setTimeout(showCalculator, 100);
  
  console.log(`[UI] ✓ Initialized v${VERSION}`);
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

})();

// Soli Deo Gloria ✝️
