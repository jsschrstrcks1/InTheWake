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
 * COMPLETE PRODUCTION VERSION - All fixes included:
 * - Quiz apply button fixed
 * - Breakeven nudges added
 * - Deluxe cap badge updates dynamically
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
          'rgba(14, 110, 142, 0.8)',
          'rgba(139, 69, 19, 0.8)',
          'rgba(255, 159, 64, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)'
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
    
    if (w === lastChartWidth && h === lastChartHeight) {
      return;
    }
    
    lastChartWidth = w;
    lastChartHeight = h;
    
    clearTimeout(chartResizeTimer);
    chartResizeTimer = setTimeout(() => {
      if (chart && typeof chart.resize === 'function') {
        try {
          chart.resize();
        } catch (err) {
          console.error('[UI] Chart resize error:', err);
        }
      }
    }, 150);
  });
  
  resizeObserver.observe(wrapper);
  
  store.patch('ui.chartReady', true);
  console.log('[UI] Chart initialized with infinite scroll protection');
}

function updateChart(results) {
  if (!chart || !results) return;

  try {
    const { bars, winnerKey } = results;
    
    chart.data.datasets[0].data = [
      bars.alc.mean,
      bars.coffee?.mean || 0,
      bars.soda.mean,
      bars.refresh.mean,
      bars.deluxe.mean
    ];
    
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
    
    chart.update('none');
    updateScreenReaderTable(bars);
  } catch (err) {
    console.error('[UI] Chart update error:', err);
  }
}

function updateScreenReaderTable(bars) {
  const srAlc = $('#sr-alc');
  const srCoffee = $('#sr-coffee');
  const srSoda = $('#sr-soda');
  const srRefresh = $('#sr-refresh');
  const srDeluxe = $('#sr-deluxe');
  
  if (srAlc) srAlc.textContent = formatMoney(bars.alc.mean);
  if (srCoffee) srCoffee.textContent = formatMoney(bars.coffee?.mean || 0);
  if (srSoda) srSoda.textContent = formatMoney(bars.soda.mean);
  if (srRefresh) srRefresh.textContent = formatMoney(bars.refresh.mean);
  if (srDeluxe) srDeluxe.textContent = formatMoney(bars.deluxe.mean);
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
let quizState = {
  step: 1,
  answers: {}
};

function openQuiz() {
  const modal = $('#quiz-modal');
  if (!modal) return;
  
  modal.setAttribute('aria-hidden', 'false');
  modal.style.display = 'flex';
  
  quizState = { step: 1, answers: {} };
  showQuizStep(1);
  
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
  
  const openBtn = $('#quiz-open-btn');
  if (openBtn) openBtn.focus();
}

function showQuizStep(step) {
  for (let i = 1; i <= 3; i++) {
    const stepDiv = $(`#quiz-step-${i}`);
    if (stepDiv) stepDiv.style.display = 'none';
  }
  
  const resultDiv = $('#quiz-result');
  if (resultDiv) resultDiv.style.display = 'none';
  
  const currentStep = $(`#quiz-step-${step}`);
  if (currentStep) currentStep.style.display = 'block';
}

function handleQuizAnswer(question, answer) {
  quizState.answers[question] = answer;
  
  if (quizState.step < 3) {
    quizState.step++;
    showQuizStep(quizState.step);
  } else {
    showQuizResult();
  }
}

function showQuizResult() {
  const { answers } = quizState;
  
  let recommendation = '';
  let presetKey = 'moderate';
  
  const amount = answers.q2 || 'moderate';
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
    presetKey = 'moderate';
    recommendation = `
      <h4>Refreshment or Deluxe Package</h4>
      <p class="small">You're right in the sweet spot! If you drink 4+ alcoholic drinks per day, go Deluxe. 
      If you mix in lots of coffees, sodas, and mocktails with fewer alcoholic drinks, Refreshment might be better.</p>
    `;
  }
  
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
    window.ITW.applyPreset(quizState.recommendedPreset);  // ✅ FIXED
    closeQuiz();
    
    const inputsCard = $('.card.inputs');
    if (inputsCard) {
      inputsCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}

function wireQuiz() {
  const openBtn = $('#quiz-open-btn');
  if (openBtn) {
    openBtn.addEventListener('click', openQuiz);
  }
  
  const closeBtn = $('#quiz-close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeQuiz);
  }
  
  const skipBtn = $('#quiz-skip-btn');
  if (skipBtn) {
    skipBtn.addEventListener('click', closeQuiz);
  }
  
  $$('.quiz-answer').forEach(btn => {
    btn.addEventListener('click', () => {
      const answer = btn.dataset.quizAnswer;
      const question = `q${quizState.step}`;
      handleQuizAnswer(question, answer);
    });
  });
  
  const applyBtn = $('#quiz-apply-btn');
  if (applyBtn) {
    applyBtn.addEventListener('click', applyQuizResult);
  }
  
  document.addEventListener('keydown', (e) => {
    const modal = $('#quiz-modal');
    if (modal && modal.style.display !== 'none' && e.key === 'Escape') {
      closeQuiz();
    }
  });
  
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
  
  const totalsSpan = $('#totals');
  if (totalsSpan) {
    totalsSpan.textContent = `${formatMoney(perDay)}/day · ${formatMoney(trip)} total`;
  }
  
  updatePackageCards(bars, included, overcap);
  
  // ✅ NEW: Render breakeven nudges
  renderBreakevenNudges(bars, included);
  
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
  
  updateChart(results);
  
  if (results.categoryRows && results.categoryRows.length > 0) {
    renderCategoryBreakdown(results.categoryRows);
  }
  
  if (results.groupRows && results.groupRows.length > 0) {
    renderGroupBreakdown(results.groupRows);
  }
}

function updatePackageCards(bars, included, overcap) {
  const economics = store.get('economics');
  
  $$('[data-pkg-price]').forEach(el => {
    const pkg = el.dataset.pkgPrice;
    if (pkg === 'coffee') {
      el.textContent = formatMoney(31.0);
    } else if (economics.pkg[pkg]) {
      el.textContent = formatMoney(economics.pkg[pkg]);
    }
  });
  
  $$('[data-inc]').forEach(el => {
    const pkg = el.dataset.inc;
    if (included[pkg] !== undefined) {
      el.textContent = `Includes: ${formatMoney(included[pkg])}/day in drinks`;
    }
  });
  
  const overcapNote = $('#overcap-est');
  if (overcapNote) {
    if (overcap > 0) {
      overcapNote.textContent = `Over-cap: ${formatMoney(overcap)}/day extra`;
      overcapNote.style.display = 'block';
    } else {
      overcapNote.style.display = 'none';
    }
  }
  
  $$('.package-card').forEach(card => {
    card.classList.remove('winner');
  });
  
  const winnerKey = store.get('results').winnerKey;
  const winnerCard = $(`.package-card[data-card="${winnerKey}"]`);
  if (winnerCard) {
    winnerCard.classList.add('winner');
  }
}

/**
 * ✅ NEW FEATURE: Breakeven nudges
 * "A word fitly spoken is like apples of gold in pictures of silver" - Proverbs 25:11
 */
function renderBreakevenNudges(bars, included) {
  const economics = store.get('economics');
  const dataset = store.get('dataset');
  const inputs = store.get('inputs');
  
  if (!economics || !dataset || !inputs) return;
  
  const packages = [
    { key: 'soda', name: 'Soda', set: 'soda' },
    { key: 'refresh', name: 'Refreshment', set: 'refresh' },
    { key: 'deluxe', name: 'Deluxe', set: 'alcoholic' }
  ];
  
  packages.forEach(pkg => {
    const card = $(`.package-card[data-card="${pkg.key}"]`);
    if (!card) return;
    
    const oldNudge = card.querySelector('.breakeven-nudge');
    if (oldNudge) oldNudge.remove();
    
    const pkgCost = economics.pkg[pkg.key];
    const alcCost = bars.alc.mean;
    const gap = pkgCost - alcCost;
    
    if (gap <= 0 || gap > 20) return;
    
    const setDrinks = dataset.sets[pkg.set] || [];
    if (setDrinks.length === 0) return;
    
    const gratuity = economics.grat || 0.18;
    const drinkCosts = setDrinks
      .map(id => ({
        id,
        label: config.DRINK_LABELS[id] || id,
        cost: (dataset.prices[id] || 0) * (1 + gratuity)
      }))
      .filter(d => d.cost > 0)
      .sort((a, b) => b.cost - a.cost);
    
    if (drinkCosts.length === 0) return;
    
    let remaining = gap;
    const suggestions = [];
    const maxSuggestions = 3;
    let drinkIndex = 0;
    
    while (remaining > 0.01 && suggestions.length < maxSuggestions && drinkIndex < drinkCosts.length) {
      const drink = drinkCosts[drinkIndex];
      const qty = Math.ceil(remaining / drink.cost);
      const cappedQty = Math.min(qty, 3);
      
      suggestions.push({
        qty: cappedQty,
        label: drink.label,
        plural: cappedQty > 1
      });
      
      remaining -= drink.cost * cappedQty;
      drinkIndex++;
    }
    
    if (suggestions.length === 0) return;
    
    const suggestionText = suggestions.map(s => 
      `${s.qty} ${s.plural ? s.label.toLowerCase() : s.label.toLowerCase().replace(/s$/, '')}`
    ).join(', ');
    
    const nudge = document.createElement('div');
    nudge.className = 'breakeven-nudge';
    nudge.innerHTML = `
      <p class="tiny" style="margin:0.5rem 0 0; padding:0.5rem; background:rgba(255,193,7,0.1); border-left:3px solid #ffc107; border-radius:4px;">
        <strong>💡 Close to breaking even!</strong><br/>
        Add ${suggestionText} → ${pkg.name} package saves money
      </p>
    `;
    
    const incDiv = card.querySelector(`[data-inc="${pkg.key}"]`);
    if (incDiv) {
      incDiv.parentNode.insertBefore(nudge, incDiv.nextSibling);
    }
  });
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
        <td>${row.who}</td>
        <td>${row.pkg}</td>
        <td>${formatMoney(row.perDay)}</td>
        <td>${formatMoney(row.trip)}</td>
      </tr>
    `;
  }).join('');
  
  tbody.innerHTML = html;
  section.hidden = false;
}

/* ==================== NAVIGATION DROPDOWNS ==================== */
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
    
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const open = group.dataset.open === 'true';
      closeAll(group);
      setOpen(group, !open);
    });
    
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
    
    menu.addEventListener('focusout', () => {
      setTimeout(() => {
        if (!group.contains(document.activeElement)) {
          setOpen(group, false);
        }
      }, 0);
    });
  });
  
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-group')) {
      closeAll();
    }
  }, true);
  
  window.addEventListener('blur', () => closeAll());
}

/* ==================== EMAIL CAPTURE ==================== */
function wireEmailCapture() {
  const form = $('#email-form');
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = form.querySelector('input[name="email"]').value;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      announce('Please enter a valid email address', 'assertive');
      return;
    }
    
    const results = store.get('results');
    const inputs = store.get('inputs');
    
    const savingsField = $('#email-savings');
    const recField = $('#email-rec');
    const daysField = $('#email-days');
    
    if (savingsField) savingsField.value = formatMoney(results.perDay);
    if (recField) recField.value = results.winnerKey;
    if (daysField) daysField.value = inputs.days;
    
    try {
      announce('Sending email...');
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
  const shareBtn = $('#share-btn');
  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      window.ITW.shareScenario();
    });
  }
  
  const resetBtn = $('#reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Reset all inputs to defaults?')) {
        window.ITW.resetInputs();
        
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
  const fallbackBanner = $('#fallback-banner');
  if (fallbackBanner) {
    fallbackBanner.hidden = !uiState.fallbackBanner;
  }
  
  const offlineChip = $('#offline-rates-chip');
  if (offlineChip) {
    offlineChip.hidden = !uiState.fxStale;
  }
  
  const fxNote = $('#fx-note');
  if (fxNote) {
    const rates = window.ITW._debug.getFXRates();
    if (rates.asOf) {
      fxNote.textContent = `(rates as of ${rates.asOf})`;
    }
  }
}

/**
 * ✅ NEW FEATURE: Update deluxe cap badge
 */
function updateDeluxeCapBadge() {
  const economics = store.get('economics');
  const capBadge = $('#cap-badge');
  if (capBadge && economics) {
    capBadge.textContent = formatMoney(economics.deluxeCap);
  }
}

/* ==================== STORE SUBSCRIPTIONS ==================== */
function subscribeToStore() {
  store.subscribe('results', (results) => {
    renderResults(results);
  });
  
  store.subscribe('ui', (uiState) => {
    updateUIState(uiState);
  });
  
  store.subscribe('economics', (economics) => {
    const results = store.get('results');
    if (results && results.bars) {
      updatePackageCards(results.bars, results.included, results.overcap);
    }
    updateDeluxeCapBadge(); // ✅ NEW
  });
  
  document.addEventListener('itw:calc-updated', () => {
    showCalculator();
  });
}

/* ==================== INITIALIZATION ==================== */
function initialize() {
  console.log(`[UI] v${VERSION} Initializing...`);
  
  wireNavigation();
  wireQuiz();
  wireEmailCapture();
  wireActionButtons();
  
  document.querySelectorAll('[data-preset]').forEach(btn => {
    btn.addEventListener('click', () => {
      const preset = btn.dataset.preset;
      if (window.ITW && typeof window.ITW.applyPreset === 'function') {
        window.ITW.applyPreset(preset);
      } else {
        console.error('[UI] applyPreset function not found');
      }
    });
  });
  
  loadRecentArticles();
  
  if (window.Chart) {
    initializeChart();
  } else {
    console.warn('[UI] Chart.js not loaded');
  }
  
  subscribeToStore();
  
  const results = store.get('results');
  const uiState = store.get('ui');
  
  if (results) renderResults(results);
  if (uiState) updateUIState(uiState);
  
  updateDeluxeCapBadge(); // ✅ NEW
  
  setTimeout(showCalculator, 100);
  
  console.log(`[UI] ✓ Initialized v${VERSION}`);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

})();

// Soli Deo Gloria ✝️
