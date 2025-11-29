/**
 * Royal Caribbean Drink Calculator - UI Layer
 * Version: 1.003.000 (Accessibility Promise Kept)
 *
 * "Let your light so shine before men" - Matthew 5:16
 * "I was eyes to the blind and feet to the lame" - Job 29:15
 *
 * Soli Deo Gloria ✝️
 *
 * ACCESSIBILITY COMMITMENT:
 * This UI serves ALL travelers - regardless of ability, age, or circumstance.
 * Every interaction is accessible via keyboard, screen reader, and mouse.
 * Dynamic updates are announced. Focus is managed. Context is preserved.
 *
 * v1.002.000 COMPLETE FEATURES:
 * ✅ Preset buttons (all 7 presets including Solo & Soda Drinker)
 * ✅ Two-winner highlighting (adults + kids when minors present)
 * ✅ Quiz modal (full keyboard navigation + focus trap)
 * ✅ Article rails (populated with content)
 * ✅ Inline price editing (keyboard accessible)
 * ✅ Screen reader chart table (accessible alternative to visual chart)
 * ✅ ARIA live regions (status announcements)
 * ✅ Gentle nudges (breakeven hints)
 * ✅ Health notes (CDC guidelines)
 */

'use strict';

/* ==================== PRESETS ==================== */

const PRESETS = {
  light: {
    label: 'Light Drinker',
    emoji: '🍃',
    description: 'Casual sipping with variety',
    drinks: {
      soda: 2, coffee: 1, teaprem: 0, freshjuice: 0,
      mocktail: 0, energy: 0, milkshake: 0, bottledwater: 1,
      beer: 1, wine: 1, cocktail: 0.5, spirits: 0
    }
  },
  moderate: {
    label: 'Moderate',
    emoji: '⚖️',
    description: 'Balanced drinks throughout the day',
    drinks: {
      soda: 2, coffee: 2, teaprem: 0, freshjuice: 1,
      mocktail: 1, energy: 0, milkshake: 0.5, bottledwater: 2,
      beer: 2, wine: 2, cocktail: 2, spirits: 0.5
    }
  },
  party: {
    label: 'Party',
    emoji: '🎉',
    description: 'Maximize your cruise experience',
    drinks: {
      soda: 2, coffee: 2, teaprem: 0, freshjuice: 1,
      mocktail: 1, energy: 1, milkshake: 0, bottledwater: 2,
      beer: 4, wine: 2, cocktail: 4, spirits: 2
    }
  },
  coffee: {
    label: 'Coffee Lover',
    emoji: '☕',
    description: 'Perfect for specialty coffee enthusiasts',
    drinks: {
      soda: 1, coffee: 4, teaprem: 1, freshjuice: 1,
      mocktail: 1, energy: 0, milkshake: 0.5, bottledwater: 2,
      beer: 0, wine: 0, cocktail: 0, spirits: 0
    }
  },
  nonalc: {
    label: 'Non-Alcoholic',
    emoji: '🚫🍺',
    description: 'Focus on sodas, juices, and specialty drinks',
    drinks: {
      soda: 3, coffee: 2, teaprem: 1, freshjuice: 2,
      mocktail: 2, energy: 0.5, milkshake: 1, bottledwater: 2,
      beer: 0, wine: 0, cocktail: 0, spirits: 0
    }
  },
  solo: {
    label: 'Solo Traveler',
    emoji: '🧳',
    description: 'Balanced drinks for one',
    drinks: {
      soda: 2, coffee: 2, teaprem: 0, freshjuice: 0.5,
      mocktail: 0.5, energy: 0, milkshake: 0, bottledwater: 1,
      beer: 2, wine: 1, cocktail: 1, spirits: 0
    }
  },
  sodadrinker: {
    label: 'Soda Drinker',
    emoji: '🥤',
    description: 'Soda-focused with some variety',
    drinks: {
      soda: 6, coffee: 1, teaprem: 0, freshjuice: 0,
      mocktail: 1, energy: 1, milkshake: 0.5, bottledwater: 2,
      beer: 0, wine: 0, cocktail: 0, spirits: 0
    }
  }
};

/* ==================== GLOBAL STATE ==================== */

let chartInstance = null;
let quizState = { step: 1, answers: {}, recommendedPreset: null };

/* ==================== PRESET APPLICATION ==================== */

function applyPreset(presetKey) {



  const preset = PRESETS[presetKey];
  if (!preset) {

    return;
  }

  if (!window.ITW || !window.ITW.store) {

    return;
  }

  const store = window.ITW.store;
  const inputs = store.get('inputs');
  const drinks = { ...inputs.drinks };

  // Update drinks with preset values
  Object.keys(drinks).forEach(key => {
    drinks[key] = preset.drinks[key] !== undefined ? preset.drinks[key] : 0;
  });

  // Update store
  store.patch('inputs', { ...inputs, drinks });

  // Update UI inputs
  Object.keys(drinks).forEach(key => {
    const input = document.querySelector(`[data-input="${key}"]`);
    if (input && typeof drinks[key] === 'number' && drinks[key] >= 0) {
      input.value = drinks[key];
    }
  });

  // Force calculation IMMEDIATELY
  if (window.ITW.scheduleCalc) {
    window.ITW.scheduleCalc();
  }

  // ALSO use force calculate if available
  if (window.FORCE_CALCULATE) {
    setTimeout(window.FORCE_CALCULATE, 100);
  }

  // Force UI render
  setTimeout(function() {

    renderAll();
  }, 150);

  announce(`${preset.label} preset applied. ${preset.description}`);

}

/* ==================== PRESET BUTTONS RENDERING ==================== */

function renderPresetButtons() {
  const container = document.getElementById('preset-buttons');
  if (!container) {

    return;
  }

  container.innerHTML = '';

  Object.keys(PRESETS).forEach(key => {
    const preset = PRESETS[key];
    const button = document.createElement('button');
    button.className = 'preset-btn pill';
    button.type = 'button';
    button.textContent = `${preset.emoji} ${preset.label}`;
    button.setAttribute('data-preset', key);

    // ✅ Accessibility: Full context for screen readers
    button.setAttribute('aria-label', `Apply ${preset.label} preset: ${preset.description}`);

    // ✅ Event listener (not inline)
    button.addEventListener('click', () => applyPreset(key));

    // ✅ Keyboard accessibility
    button.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        applyPreset(key);
      }
    });

    container.appendChild(button);
  });

}

/* ==================== BANNER & TOTALS ==================== */

function renderBanner(results) {
  const chipEl = document.getElementById('best-chip');
  const textEl = document.getElementById('best-text');

  if (!chipEl || !textEl || !results) return;

  const formatMoney = window.ITW?.formatMoney || ((v) => `$${v.toFixed(2)}`);

  const winnerLabel = results.winnerLabel || 'À la carte';
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

/* ==================== CHART RENDERING ==================== */

function renderChart(bars, winnerKey) {
  let canvas = document.getElementById('results-chart');
  if (!canvas) canvas = document.getElementById('breakeven-chart');

  if (!canvas) {

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

  const chartData = {
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
      data: chartData,
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

    // ✅ NEW: Update screen reader table
    renderChartTable(chartData, winnerKey);

  } catch (error) {

  }
}

/* ==================== SCREEN READER CHART TABLE ==================== */

/**
 * ✅ NEW v1.002.000: Accessible chart alternative for screen readers
 * Required per WCAG 2.1 AA and your checklist item #8
 */
function renderChartTable(chartData, winnerKey) {
  const table = document.getElementById('chart-sr-table');
  if (!table) {

    return;
  }

  const formatMoney = window.ITW?.formatMoney || ((v) => `$${v.toFixed(2)}`);

  // Clear existing
  table.innerHTML = '';

  // Create caption
  const caption = document.createElement('caption');
  caption.textContent = 'Package Cost Comparison';
  table.appendChild(caption);

  // Create header
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  const th1 = document.createElement('th');
  th1.textContent = 'Package Option';
  th1.setAttribute('scope', 'col');
  const th2 = document.createElement('th');
  th2.textContent = 'Total Cost';
  th2.setAttribute('scope', 'col');
  const th3 = document.createElement('th');
  th3.textContent = 'Status';
  th3.setAttribute('scope', 'col');
  headerRow.appendChild(th1);
  headerRow.appendChild(th2);
  headerRow.appendChild(th3);
  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Create body
  const tbody = document.createElement('tbody');

  chartData.labels.forEach((label, idx) => {
    const cost = chartData.datasets[0].data[idx];
    const packageKeys = ['alc', 'soda', 'refresh', 'deluxe'];
    const isWinner = packageKeys[idx] === winnerKey;

    const row = document.createElement('tr');
    if (isWinner) {
      row.setAttribute('aria-label', `${label}: ${formatMoney(cost)} - Best value`);
    }

    const td1 = document.createElement('td');
    td1.textContent = label;

    const td2 = document.createElement('td');
    td2.textContent = formatMoney(cost);

    const td3 = document.createElement('td');
    td3.textContent = isWinner ? '✓ Best Value' : '';
    if (isWinner) {
      td3.style.fontWeight = 'bold';
      td3.style.color = '#10b981';
    }

    row.appendChild(td1);
    row.appendChild(td2);
    row.appendChild(td3);
    tbody.appendChild(row);
  });

  table.appendChild(tbody);

}

/* ==================== PACKAGE CARDS (TWO-WINNER SYSTEM) ==================== */

/**
 * ✅ v1.002.000: Two-winner highlighting for families with kids
 * Adults can win any package, kids can only win soda or refresh
 */
function renderPackageCards(results) {
  if (!results) return;

  const formatMoney = window.ITW?.formatMoney || ((v) => `$${v.toFixed(2)}`);

  const cards = {
    soda: document.querySelector('[data-card="soda"]'),
    refresh: document.querySelector('[data-card="refresh"]'),
    deluxe: document.querySelector('[data-card="deluxe"]')
  };

  // Reset all cards
  Object.values(cards).forEach(card => {
    if (card) {
      card.classList.remove('winner', 'winner-adults', 'winner-minors');
      const badge = card.querySelector('.winner-badge');
      if (badge) badge.remove();
    }
  });

  // ✅ Adult winner
  const adultCard = cards[results.winnerKey];
  if (adultCard) {
    adultCard.classList.add('winner');
    if (results.showTwoWinners) {
      adultCard.classList.add('winner-adults');
    }

    const badge = document.createElement('div');
    badge.className = 'winner-badge';
    badge.textContent = results.showTwoWinners ? '✓ Best for Adults' : '✓ Best Value';
    badge.setAttribute('role', 'status');
    badge.setAttribute('aria-label', results.showTwoWinners
      ? `${results.winnerLabel} is best value for adults`
      : `${results.winnerLabel} is best value overall`);

    adultCard.insertBefore(badge, adultCard.firstChild);
  }

  // ✅ Minor winner (if applicable)
  if (results.showTwoWinners && results.minorWinnerKey) {
    const minorCard = cards[results.minorWinnerKey];
    if (minorCard && minorCard !== adultCard) {
      minorCard.classList.add('winner', 'winner-minors');

      const badge = document.createElement('div');
      badge.className = 'winner-badge winner-badge-minors';
      badge.textContent = '✓ Best for Kids';
      badge.setAttribute('role', 'status');
      badge.setAttribute('aria-label', `${results.minorWinnerLabel} is best value for children under 21`);

      minorCard.insertBefore(badge, minorCard.firstChild);
    }
  }

  // Update package prices
  const economics = window.ITW?.store?.get('economics');
  if (economics && economics.pkg) {
    const priceElements = {
      coffee: document.querySelector('[data-pkg-price="coffee"]'),
      soda: document.querySelector('[data-pkg-price="soda"]'),
      refresh: document.querySelector('[data-pkg-price="refresh"]'),
      deluxe: document.querySelector('[data-pkg-price="deluxe"]')
    };

    if (priceElements.coffee) priceElements.coffee.textContent = formatMoney(economics.pkg.coffee);
    if (priceElements.soda) priceElements.soda.textContent = formatMoney(economics.pkg.soda);
    if (priceElements.refresh) priceElements.refresh.textContent = formatMoney(economics.pkg.refresh);
    if (priceElements.deluxe) priceElements.deluxe.textContent = formatMoney(economics.pkg.deluxe);
  }

  // ✅ Announce winners to screen readers
  if (results.ariaAnnouncement) {
    announce(results.ariaAnnouncement);
  }
}

/* ==================== INLINE PRICE EDITING ==================== */

/**
 * ✅ v1.003.000: Mobile-friendly stepper buttons + keyboard accessible inline editing
 */
function setupInlinePriceEditing() {
  const priceElements = document.querySelectorAll('[data-edit-price]');

  // Step increments by package type
  const stepAmounts = {
    coffee: 1,    // $1 increments for coffee card (~$31)
    soda: 1,      // $1 increments for soda (~$14/day)
    refresh: 2,   // $2 increments for refreshment (~$34/day)
    deluxe: 5     // $5 increments for deluxe (~$85/day)
  };

  priceElements.forEach(element => {
    const packageKey = element.dataset.editPrice;
    const step = stepAmounts[packageKey] || 1;
    const parent = element.parentElement;

    // Skip if already wrapped
    if (parent.classList.contains('price-stepper')) return;

    // Create stepper wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'price-stepper';
    wrapper.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:8px;';

    // Create minus button
    const minusBtn = document.createElement('button');
    minusBtn.type = 'button';
    minusBtn.className = 'stepper-btn stepper-minus';
    minusBtn.innerHTML = '−';
    minusBtn.style.cssText = 'min-width:44px;min-height:44px;font-size:1.5rem;font-weight:bold;border:2px solid #ccc;border-radius:8px;background:#f5f5f5;color:#333;cursor:pointer;display:flex;align-items:center;justify-content:center;touch-action:manipulation;user-select:none;';
    minusBtn.setAttribute('aria-label', `Decrease ${packageKey} price by $${step}`);

    // Create plus button
    const plusBtn = document.createElement('button');
    plusBtn.type = 'button';
    plusBtn.className = 'stepper-btn stepper-plus';
    plusBtn.innerHTML = '+';
    plusBtn.style.cssText = 'min-width:44px;min-height:44px;font-size:1.5rem;font-weight:bold;border:2px solid #ccc;border-radius:8px;background:#f5f5f5;color:#333;cursor:pointer;display:flex;align-items:center;justify-content:center;touch-action:manipulation;user-select:none;';
    plusBtn.setAttribute('aria-label', `Increase ${packageKey} price by $${step}`);

    // Style the price element
    element.style.cursor = 'pointer';
    element.style.borderBottom = '1px dashed rgba(0,0,0,0.3)';
    element.style.padding = '4px 8px';
    element.style.minWidth = '70px';
    element.style.textAlign = 'center';
    element.title = 'Tap to edit exact price';
    element.tabIndex = 0;
    element.setAttribute('role', 'button');
    element.setAttribute('aria-label', `Edit ${packageKey} package price. Current value: ${element.textContent}. Tap to enter exact amount.`);

    // Stepper button handlers
    const adjustPrice = (delta) => {
      const currentValue = parseFloat(element.textContent.replace(/[^0-9.]/g, '')) || 0;
      const newValue = Math.max(5, Math.min(150, currentValue + delta)); // Clamp between $5 and $150

      if (window.ITW && window.ITW.updatePackagePrice) {
        const success = window.ITW.updatePackagePrice(packageKey, newValue);
        if (success && window.renderAll) {
          renderAll();
          element.setAttribute('aria-label', `Edit ${packageKey} package price. Current value: $${newValue.toFixed(2)}. Tap to enter exact amount.`);
          announce(`${packageKey} price: $${newValue.toFixed(2)}`);
        }
      }
    };

    minusBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      adjustPrice(-step);
    });

    plusBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      adjustPrice(step);
    });

    // Add touch feedback
    [minusBtn, plusBtn].forEach(btn => {
      btn.addEventListener('touchstart', () => { btn.style.background = '#e0e0e0'; }, { passive: true });
      btn.addEventListener('touchend', () => { btn.style.background = '#f5f5f5'; }, { passive: true });
      btn.addEventListener('mousedown', () => { btn.style.background = '#e0e0e0'; });
      btn.addEventListener('mouseup', () => { btn.style.background = '#f5f5f5'; });
      btn.addEventListener('mouseleave', () => { btn.style.background = '#f5f5f5'; });
    });

    // Click-to-edit for precise values (existing functionality)
    const activateEdit = () => {
      const currentText = element.textContent;
      const currentValue = parseFloat(currentText.replace(/[^0-9.]/g, ''));

      const input = document.createElement('input');
      input.type = 'number';
      input.inputMode = 'decimal';
      input.value = currentValue;
      input.min = '5';
      input.max = '150';
      input.step = '0.01';
      input.style.cssText = 'width:80px;font-size:inherit;font-family:inherit;border:2px solid #007bff;border-radius:4px;padding:4px 6px;text-align:center;';
      input.setAttribute('aria-label', `Edit ${packageKey} package price`);

      const save = () => {
        const newValue = parseFloat(input.value) || currentValue;
        if (window.ITW && window.ITW.updatePackagePrice) {
          const success = window.ITW.updatePackagePrice(packageKey, newValue);
          if (success && window.renderAll) {
            announce(`${packageKey} package price updated to $${newValue.toFixed(2)}`);
            renderAll();
            element.setAttribute('aria-label', `Edit ${packageKey} package price. Current value: $${newValue.toFixed(2)}. Tap to enter exact amount.`);
          } else {
            element.textContent = currentText;
          }
        }
      };

      input.addEventListener('blur', save);
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); save(); }
        else if (e.key === 'Escape') { element.textContent = currentText; }
      });

      element.textContent = '';
      element.appendChild(input);
      input.focus();
      input.select();
    };

    element.addEventListener('click', (e) => {
      e.stopPropagation();
      activateEdit();
    });

    element.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activateEdit();
      }
    });

    // Wrap element with stepper buttons
    parent.insertBefore(wrapper, element);
    wrapper.appendChild(minusBtn);
    wrapper.appendChild(element);
    wrapper.appendChild(plusBtn);
  });

  console.log('[UI] ✓ Inline price editing with mobile steppers enabled');
}

/* ==================== QUIZ MODAL ==================== */

/**
 * ✅ v1.002.000: Full keyboard navigation + focus trap
 */
function setupQuiz() {
  const modal = document.getElementById('quiz-modal');
  const openBtn = document.getElementById('quiz-open-btn') || document.querySelector('[onclick*="openQuiz"]');
  const closeBtn = document.getElementById('quiz-close-btn');
  const skipBtn = document.getElementById('quiz-skip-btn');

  if (!modal) {

    return;
  }

  // ✅ Open quiz
  const openQuiz = () => {
    modal.style.display = 'block';
    modal.setAttribute('aria-hidden', 'false');
    quizState = { step: 1, answers: {}, recommendedPreset: null };
    showQuizStep(1);

    // ✅ Focus first interactive element
    const firstButton = modal.querySelector('button, [tabindex="0"]');
    if (firstButton) {
      setTimeout(() => firstButton.focus(), 100);
    }

    // ✅ Trap focus in modal
    trapFocus(modal);
  };

  if (openBtn) {
    openBtn.addEventListener('click', openQuiz);
  }

  // ✅ Close quiz
  const closeQuiz = () => {
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    quizState = { step: 1, answers: {}, recommendedPreset: null };

    // ✅ Return focus to open button
    if (openBtn) openBtn.focus();
  };

  if (closeBtn) closeBtn.addEventListener('click', closeQuiz);
  if (skipBtn) skipBtn.addEventListener('click', closeQuiz);

  // ✅ ESC key to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'block') {
      closeQuiz();
    }
  });

  // Background click closes
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

/**
 * ✅ Focus trap for modal accessibility
 */
function trapFocus(element) {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  element.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      } else if (!e.shiftKey && document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    }
  });
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

  const { step1, step2, step3 } = quizState.answers;

  let preset = 'moderate';
  let message = '';

  // ✅ v1.002.000: Fixed quiz logic
  if (step3 === 'nonalc') {
    preset = 'nonalc';
    message = '🚫🍺 Non-Alcoholic Package recommended! Focus on sodas, juices, and specialty coffees.';
  } else if (step3 === 'coffee') {
    preset = 'coffee';
    message = '☕ Coffee Lover Package! Perfect for specialty coffee enthusiasts.';
  } else if (step3 === 'soda') {
    preset = 'sodadrinker';
    message = '🥤 Soda Drinker Package! Fountain sodas and some variety.';
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

  // ✅ Announce result to screen readers
  announce(`Quiz complete. ${message}`);
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

  const articles = [
    {
      title: 'Royal Caribbean Drink Packages Explained',
      url: '/royal-caribbean-drink-packages.html',
      ariaLabel: 'Read article: Royal Caribbean Drink Packages Explained'
    },
    {
      title: 'Top 20 Questions About Cruising',
      url: '/top-20-cruise-questions.html',
      ariaLabel: 'Read article: Top 20 Questions About Cruising'
    },
    {
      title: 'How to Save Money on Your Cruise',
      url: '/save-money-cruising.html',
      ariaLabel: 'Read article: How to Save Money on Your Cruise'
    }
  ];

  container.innerHTML = articles.map(article => {
    return `
      <a href="${article.url}" class="rail-article" aria-label="${article.ariaLabel}">
        <div class="rail-article-title">${article.title}</div>
      </a>
    `;
  }).join('');

  if (fallback) fallback.style.display = 'none';

}

/* ==================== NUDGES & HEALTH NOTES ==================== */

function renderNudges(nudges) {
  let container = document.getElementById('nudges-container');

  // ✅ Create container if missing
  if (!container) {
    container = document.createElement('div');
    container.id = 'nudges-container';
    container.setAttribute('role', 'region');
    container.setAttribute('aria-label', 'Breakeven tips');

    const resultsSection = document.querySelector('#results, main');
    if (resultsSection) {
      resultsSection.appendChild(container);
    }
  }

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
    div.setAttribute('role', 'status');
    div.setAttribute('aria-label', nudge.ariaLabel || nudge.message);
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
    icon.setAttribute('aria-hidden', 'true');

    const message = document.createElement('span');
    message.textContent = nudge.message;

    div.appendChild(icon);
    div.appendChild(message);
    container.appendChild(div);
  });

}

/**
 * ✅ v1.007.000: Cost Comparison Summary Card with Transparent Breakdown
 * Shows: Package Cost (fixed) + Uncovered Drinks = Total
 */
function renderCostSummary(results) {
  const card = document.getElementById('cost-summary-card');
  const table = document.getElementById('cost-comparison-table');

  if (!card || !table || !results || !results.bars) {
    return;
  }

  // Show the card
  card.style.display = 'block';

  const formatMoney = window.ITW?.formatMoney || ((v) => `$${v.toFixed(2)}`);

  // Get costs from results.bars
  const alcCost = results.bars.alc?.mean || 0;
  const sodaCost = results.bars.soda?.mean || 0;
  const refreshCost = results.bars.refresh?.mean || 0;
  const deluxeCost = results.bars.deluxe?.mean || 0;

  // Get package breakdown (NEW v1.008.000)
  const breakdown = results.packageBreakdown || {};

  // Find cheapest option
  const costs = [
    { key: 'alc', cost: alcCost },
    { key: 'soda', cost: sodaCost },
    { key: 'refresh', cost: refreshCost },
    { key: 'deluxe', cost: deluxeCost }
  ];
  const cheapest = costs.reduce((min, curr) => curr.cost < min.cost ? curr : min, costs[0]);

  // Build options array with breakdown info
  const options = [
    {
      key: 'alc',
      icon: '💵',
      title: 'À La Carte',
      subtitle: 'Pay per drink as you go',
      cost: alcCost,
      baseline: true
    },
    {
      key: 'soda',
      icon: '🥤',
      title: 'Soda Package',
      subtitle: 'Fountain sodas & Coca-Cola Freestyle',
      cost: sodaCost,
      breakdown: breakdown.soda
    },
    {
      key: 'refresh',
      icon: '☕',
      title: 'Refreshment Package',
      subtitle: 'All non-alcoholic specialty drinks',
      cost: refreshCost,
      breakdown: breakdown.refresh
    },
    {
      key: 'deluxe',
      icon: '🍹',
      title: 'Deluxe Package',
      subtitle: 'Everything including alcohol',
      cost: deluxeCost,
      breakdown: breakdown.deluxe
    }
  ];

  // Clear table
  table.innerHTML = '';

  options.forEach(option => {
    const row = document.createElement('div');
    row.className = 'cost-option-row';

    if (option.baseline) {
      row.classList.add('baseline');
    }

    if (option.key === cheapest.key) {
      row.classList.add('best-value');
    }

    // Calculate savings
    const savings = alcCost - option.cost;
    const savingsPercent = alcCost > 0 ? ((savings / alcCost) * 100) : 0;

    let savingsHTML = '';
    if (!option.baseline) {
      if (savings > 0) {
        savingsHTML = `<div class="cost-option-savings positive">Save ${formatMoney(savings)} (${savingsPercent.toFixed(0)}%)</div>`;
      } else if (savings < 0) {
        savingsHTML = `<div class="cost-option-savings negative">+${formatMoney(Math.abs(savings))} more</div>`;
      } else {
        savingsHTML = `<div class="cost-option-savings">Same as à la carte</div>`;
      }
    }

    // NEW v1.007.000: Transparent breakdown showing fixed vs uncovered costs
    let breakdownHTML = '';
    if (option.breakdown && !option.baseline) {
      const fixed = option.breakdown.fixedCost || 0;
      const uncovered = option.breakdown.uncoveredCost || 0;
      const dailyRate = option.breakdown.dailyRate || 0;
      const days = option.breakdown.days || 7;
      const people = option.breakdown.people || 1;

      if (uncovered > 0.01) {
        // Has uncovered drinks - show full breakdown
        breakdownHTML = `
          <div class="cost-breakdown" style="font-size:0.8rem;color:#666;margin-top:4px;line-height:1.4;">
            <div style="display:flex;justify-content:space-between;">
              <span>Package (${formatMoney(dailyRate)}/day × ${days}d × ${people}p):</span>
              <span style="font-weight:500;">${formatMoney(fixed)}</span>
            </div>
            <div style="display:flex;justify-content:space-between;color:#d32f2f;">
              <span>+ Uncovered drinks:</span>
              <span style="font-weight:500;">+${formatMoney(uncovered)}</span>
            </div>
          </div>
        `;
      } else {
        // No uncovered drinks - just show package calculation
        breakdownHTML = `
          <div class="cost-breakdown" style="font-size:0.8rem;color:#666;margin-top:4px;">
            <span>${formatMoney(dailyRate)}/day × ${days} days × ${people} ${people === 1 ? 'person' : 'people'}</span>
          </div>
        `;
      }
    }

    row.innerHTML = `
      <div class="cost-option-left">
        <div class="cost-option-icon" aria-hidden="true">${option.icon}</div>
        <div class="cost-option-info">
          <h4>${option.title}</h4>
          <p>${option.subtitle}</p>
        </div>
      </div>
      <div class="cost-option-right">
        <div class="cost-option-price">${formatMoney(option.cost)}</div>
        ${breakdownHTML}
        ${savingsHTML}
        ${option.key === cheapest.key ? '<div class="cost-option-badge">✓ Best Value</div>' : ''}
      </div>
    `;

    // Make cost comparison cards clickable for package selection
    row.setAttribute('role', 'button');
    row.setAttribute('tabindex', '0');
    row.setAttribute('data-package', option.key);
    row.style.cursor = 'pointer';
    row.setAttribute('aria-label',
      `${option.title}: ${formatMoney(option.cost)} total${option.key === cheapest.key ? '. Best value option' : ''}. Click to calculate with this option.`
    );

    // Click handler to select this package
    row.addEventListener('click', () => {
      if (window.PackageSelection && option.key !== 'alc') {
        window.PackageSelection.selectPackage(option.key);
      } else if (option.key === 'alc' && window.PackageSelection) {
        // Reset to recommendation for à la carte
        window.PackageSelection.resetToRecommendation();
      }
    });

    // Keyboard accessibility
    row.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (window.PackageSelection && option.key !== 'alc') {
          window.PackageSelection.selectPackage(option.key);
        } else if (option.key === 'alc' && window.PackageSelection) {
          window.PackageSelection.resetToRecommendation();
        }
      }
    });

    table.appendChild(row);
  });

}

function renderHealthNote(healthNote) {
  let container = document.getElementById('health-note-container');

  // ✅ Create container if missing
  if (!container) {
    container = document.createElement('div');
    container.id = 'health-note-container';
    container.setAttribute('role', 'region');
    container.setAttribute('aria-label', 'Health advisory');

    const resultsSection = document.querySelector('#results, main');
    if (resultsSection) {
      resultsSection.appendChild(container);
    }
  }

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
  wrapper.setAttribute('role', 'alert');
  wrapper.setAttribute('aria-label', healthNote.ariaLabel || healthNote.message);
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
  iconSpan.setAttribute('aria-hidden', 'true');

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
  if (winnerEl) {
    winnerEl.textContent = results.winnerLabel || 'À la carte';
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

/* ==================== ARIA LIVE ANNOUNCEMENTS ==================== */

/**
 * ✅ v1.002.000: Announce dynamic changes to screen readers
 */
function announce(message, priority = 'polite') {
  let liveRegion = document.getElementById('aria-live-region');

  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = 'aria-live-region';
    liveRegion.setAttribute('role', 'status');
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `;
    document.body.appendChild(liveRegion);
  }

  // Clear then announce (ensures screen reader picks up change)
  liveRegion.textContent = '';
  setTimeout(() => {
    liveRegion.textContent = message;
  }, 100);
}

/* ==================== MAIN RENDER FUNCTION ==================== */

function renderAll() {

  console.log('[UI Render] renderAll() called');

  if (!window.ITW || !window.ITW.store) {

    return;
  }

  const state = window.ITW.store.get();
  const { results } = state;


  if (!results) {

    return;
  }

  try {
    renderBanner(results);

    renderTotals(results);

    renderChart(results.bars, results.winnerKey);

    renderPackageCards(results);

    renderSummary(results);

    renderCategoryTable(results.categoryRows || []);

    renderNudges(results.nudges || []);

    renderHealthNote(results.healthNote);

    renderCostSummary(results);

  } catch (error) {

  }
}

/* ==================== v1.003.000 NEW FEATURES (INTEGRATED FROM SHIM) ==================== */

/**
 * ✅ NEW v1.003.000: Non-Alcoholic View Toggle
 * Formerly in calculator-feature-shim, now integrated properly
 * Hides alcoholic drink inputs and Deluxe package for recovery-sensitive users
 */
function setupNonAlcoholicToggle() {
  const toggle = document.getElementById('non-alcohol-view');
  const affirmation = document.getElementById('recovery-affirmation');

  if (!toggle) {
    console.log('[UI] Non-alcohol toggle not found (optional feature)');
    return;
  }

  toggle.addEventListener('change', function() {
    const isNonAlcOnly = toggle.checked;

    // Show/hide affirmation message
    if (affirmation) {
      affirmation.style.display = isNonAlcOnly ? 'block' : 'none';
    }

    // Hide/show alcoholic drink inputs
    const alcoholicRows = document.querySelectorAll('[data-category="alcohol"]');
    alcoholicRows.forEach(function(row) {
      if (isNonAlcOnly) {
        row.style.display = 'none';
        // Zero out the input
        const input = row.querySelector('input[data-input]');
        if (input && window.ITW && window.ITW.store) {
          const key = input.dataset.input;
          window.ITW.store.patch(`inputs.drinks.${key}`, 0);
          input.value = '0';
        }
      } else {
        row.style.display = '';
      }
    });

    // Hide/show Deluxe package card
    const deluxeCard = document.querySelector('[data-card="deluxe"]');
    if (deluxeCard) {
      deluxeCard.style.display = isNonAlcOnly ? 'none' : '';
    }

    // Trigger recalculation
    if (window.ITW && window.ITW.scheduleCalc) {
      window.ITW.scheduleCalc();
    }

    announce(isNonAlcOnly ?
      'Non-alcoholic view enabled. Alcoholic beverages hidden.' :
      'Standard view restored. All beverages visible.'
    );
  });
}

/**
 * ✅ NEW v1.003.000: Pre-Cruise Pricing Toggle
 * Formerly in calculator-feature-shim, now integrated properly
 * Adjusts package prices for pre-cruise vs onboard pricing (onboard is typically 20-30% higher)
 */
function setupPricingToggle() {
  const pricingSelect = document.getElementById('pricing-type');

  if (!pricingSelect) {
    console.log('[UI] Pricing toggle not found (optional feature)');
    return;
  }

  pricingSelect.addEventListener('change', function() {
    const pricingType = pricingSelect.value; // 'pre' or 'onboard'

    // Note: This is a UI feature for user awareness
    // Actual price adjustments would need to be implemented
    // in the economics layer if Royal Caribbean provides different pricing data

    // For now, just trigger recalculation and announce
    if (window.ITW && window.ITW.scheduleCalc) {
      window.ITW.scheduleCalc();
    }

    announce(pricingType === 'pre' ?
      'Pre-cruise pricing selected. Typically 20-30% cheaper than onboard.' :
      'Onboard pricing selected. Prices may be higher than pre-cruise purchase.'
    );
  });
}

/* ==================== INITIALIZATION ==================== */

function initializeUI() {
  console.log('[UI] Initializing v1.003.000 (Accessibility Promise Kept)');

  // ✅ CRITICAL: Wait for core to be ready
  if (!window.ITW_BOOTED || !window.ITW || !window.ITW.store) {

    setTimeout(initializeUI, 100);
    return;
  }

  // ✅ CRITICAL FIX: Actually render preset buttons!
  renderPresetButtons();

  // Setup all features
  setupInlinePriceEditing();
  setupQuiz();
  fetchArticles();

  // ✅ NEW v1.003.000: Integrated from feature shim
  setupNonAlcoholicToggle();
  setupPricingToggle();

  // Subscribe to store changes (debounced)
  window.ITW.store.subscribe('results', (newResults, fullState) => {





    if (window._renderTimeout) {

      clearTimeout(window._renderTimeout);
    }

    console.log('[UI] Scheduling renderAll() in 50ms...');
    window._renderTimeout = setTimeout(() => {
      console.log('[UI] Executing scheduled renderAll()');
      renderAll();
    }, 50);
  });

  // Initial render
  renderAll();

  // ✅ Announce ready status
  setTimeout(() => {
    announce('Calculator ready. All features loaded and accessible.');
  }, 1000);

}

// Auto-initialize (wait for core to be ready)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeUI);
} else {
  // DOM already loaded, start initialization (will wait for ITW_BOOTED)
  initializeUI();
}

/* ==================== EXPORTS ==================== */

window.ITW_UI = Object.freeze({
  renderAll,
  applyPreset,
  renderChart,
  renderChartTable,
  renderBanner,
  renderTotals,
  renderPackageCards,
  renderNudges,
  renderHealthNote,
  renderCostSummary,
  announce,
  version: '1.007.000' // ✅ UPDATED: Transparent package breakdown
});

window.applyPreset = applyPreset;
window.announce = announce;

// "I was eyes to the blind and feet to the lame" - Job 29:15
// "Every pixel and part of this project is offered as worship to God"
// Soli Deo Gloria ✝️
