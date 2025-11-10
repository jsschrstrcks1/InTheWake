/**
 * Royal Caribbean Drink Calculator - UI Layer
 * Version: 10.0.0
 * Soli Deo Gloria ✝️
 * 
 * Handles all DOM interactions, rendering, and user events
 */

(() => {
  'use strict';
  
  console.log('[UI] v10.0.0 Loading...');
  
  // Wait for core to be ready
  if (!window.ITW?.store) {
    console.warn('[UI] Core not loaded, deferring...');
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => window.location.reload(), 100);
      });
    }
    return;
  }
  
  const { store, formatMoney, getCurrency } = window.ITW;
  
  /* ==================== CONFIGURATION ==================== */
  
  const CONFIG = window.ITW_CONFIG || {
    VOUCHER_MAX_PER_PERSON: 10,
    SEA_WEIGHT_MAX: 40
  };
  
  /* ==================== UTILITIES ==================== */
  
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => document.querySelectorAll(selector);
  
  function announce(message, level = 'polite') {
    const id = level === 'assertive' ? 'a11y-alerts' : 'a11y-status';
    const element = document.getElementById(id);
    if (element) {
      element.textContent = message;
      setTimeout(() => { element.textContent = ''; }, 3000);
    }
  }
  
  /* ==================== CHART MANAGEMENT ==================== */
  
  let chart = null;
  
  const CHART_COLORS = {
    alc: '#0e6e8e',
    soda: '#cbd5e1',
    refresh: '#a7e0f0',
    deluxe: '#f7b4a2',
    lineMax: 'rgba(0,0,0,.35)',
    lineMin: 'rgba(0,0,0,.20)'
  };
  
  function initializeChart() {
    if (chart) return chart;
    
    const canvas = $('#breakeven-chart');
    if (!canvas || typeof Chart === 'undefined') {
      console.error('[UI] Chart canvas or Chart.js not found');
      return null;
    }
    
    chart = new Chart(canvas.getContext('2d'), {
      type: 'bar',
      data: {
        labels: ['À-la-carte', 'Soda', 'Refreshment', 'Deluxe'],
        datasets: [{
          label: 'Daily cost',
          data: [0, 0, 0, 0],
          backgroundColor: [
            CHART_COLORS.alc,
            CHART_COLORS.soda,
            CHART_COLORS.refresh,
            CHART_COLORS.deluxe
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 0 },
        scales: {
          x: { stacked: false, grid: { display: false } },
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0,0,0,.08)' },
            ticks: {
              callback: (value) => formatMoney(value)
            }
          }
        },
        plugins: {
          legend: { 
            position: 'bottom',
            labels: { usePointStyle: true }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const name = context.chart.data.labels[context.dataIndex];
                return `${name}: ${formatMoney(context.parsed.y)}`;
              }
            }
          }
        }
      }
    });
    
    store.patch('ui.chartReady', true);
    return chart;
  }
  
  /* ==================== RESULTS RENDERING ==================== */
  
  function renderResults(results) {
    if (!results) return;
    
    // Update best value chip
    const chip = $('#best-chip');
    const text = $('#best-text');
    
    const labels = {
      alc: 'à-la-carte',
      soda: 'Soda',
      refresh: 'Refreshment',
      deluxe: 'Deluxe'
    };
    
    const label = labels[results.winnerKey] || 'à-la-carte';
    
    if (chip) {
      chip.textContent = `Best value: ${label}`;
    }
    
    if (text) {
      text.textContent = results.winnerKey === 'alc'
        ? 'Your daily picks are cheapest without a package.'
        : `Your daily picks are cheapest with the ${label} package.`;
    }
    
    announce(`Best value: ${label}`);
    
    // Update totals
    const totals = $('#totals');
    if (totals) {
      totals.textContent = `${formatMoney(results.perDay)}/day • ${formatMoney(results.trip)} trip`;
    }
    
    // Update chart
    updateChart(results);
    
    // Update group breakdown
    renderGroupBreakdown(results);
    
    // Update package cards
    updatePackageCards(results);
    
    // Update category breakdown
    renderCategoryBreakdown(results);
    
    // Update included values
    updateIncludedValues(results);
  }
  
  function updateChart(results) {
    const c = initializeChart();
    if (!c || !results.bars) return;
    
    const rangeNote = $('#range-note');
    
    // Base bars
    c.data.datasets = [{
      label: 'Daily cost',
      data: [
        results.bars.alc.mean,
        results.bars.soda.mean,
        results.bars.refresh.mean,
        results.bars.deluxe.mean
      ],
      backgroundColor: [
        CHART_COLORS.alc,
        CHART_COLORS.soda,
        CHART_COLORS.refresh,
        CHART_COLORS.deluxe
      ]
    }];
    
    // Add range lines if present
    if (results.hasRange) {
      c.data.datasets.push(
        {
          label: '(max)',
          data: [
            results.bars.alc.max,
            results.bars.soda.max,
            results.bars.refresh.max,
            results.bars.deluxe.max
          ],
          type: 'line',
          borderWidth: 2,
          pointRadius: 0,
          borderColor: CHART_COLORS.lineMax,
          fill: false
        },
        {
          label: '(min)',
          data: [
            results.bars.alc.min,
            results.bars.soda.min,
            results.bars.refresh.min,
            results.bars.deluxe.min
          ],
          type: 'line',
          borderDash: [6, 4],
          borderWidth: 2,
          pointRadius: 0,
          borderColor: CHART_COLORS.lineMin,
          fill: false
        }
      );
      
      if (rangeNote) {
        rangeNote.textContent = 'Range lines show min/max based on your ranges.';
      }
    } else {
      if (rangeNote) {
        rangeNote.textContent = '';
      }
    }
    
    c.update('none');
  }
  
  function renderGroupBreakdown(results) {
    const section = $('#group-breakdown');
    const tbody = $('#group-table-body');
    
    if (!section || !tbody) return;
    
    if (!results.groupRows || results.groupRows.length <= 1) {
      section.hidden = true;
      return;
    }
    
    tbody.innerHTML = '';
    results.groupRows.forEach(row => {
      tbody.insertAdjacentHTML('beforeend',
        `<tr>
          <td>${row.who}</td>
          <td>${row.pkg}</td>
          <td>${formatMoney(row.perDay)}</td>
          <td>${formatMoney(row.trip)}</td>
        </tr>`
      );
    });
    
    section.hidden = false;
  }
  
  function updatePackageCards(results) {
    ['soda', 'refresh', 'deluxe'].forEach(key => {
      const card = document.querySelector(`[data-card="${key}"]`);
      if (card) {
        card.classList.toggle('winner', results.winnerKey === key);
      }
    });
  }
  
  function renderCategoryBreakdown(results) {
    const section = $('#category-breakdown');
    const grid = $('#category-grid');
    
    if (!section || !grid) return;
    
    const rows = Array.isArray(results.categoryRows) ? results.categoryRows : [];
    const clean = rows.filter(x => !/voucher/i.test(String(x?.id || x?.name || '')));
    
    if (!clean.length) {
      section.hidden = true;
      grid.innerHTML = '';
      return;
    }
    
    grid.innerHTML = clean.map(row => `
      <div class="category-item">
        <span class="cat-name">${row.label || row.name || ''}</span>
        <span class="cat-cost">${formatMoney(row.perDay || 0)}/day</span>
      </div>
    `).join('');
    
    section.hidden = false;
  }
  
  function updateIncludedValues(results) {
    const nodes = {
      soda: document.querySelector('[data-inc="soda"]'),
      refresh: document.querySelector('[data-inc="refresh"]'),
      deluxe: document.querySelector('[data-inc="deluxe"]')
    };
    
    if (nodes.soda) nodes.soda.textContent = formatMoney(results.included.soda) + '/day';
    if (nodes.refresh) nodes.refresh.textContent = formatMoney(results.included.refresh) + '/day';
    if (nodes.deluxe) nodes.deluxe.textContent = formatMoney(results.included.deluxe) + '/day';
    
    const overcap = $('#overcap-est');
    if (overcap) {
      overcap.textContent = formatMoney(results.overcap) + '/day';
    }
  }
  
  /* ==================== PACKAGE PRICES UI ==================== */
  
  function renderEconomics() {
    const { economics } = store.get();
    
    const badges = {
      soda: document.querySelector('[data-pkg-price="soda"]'),
      refresh: document.querySelector('[data-pkg-price="refresh"]'),
      deluxe: document.querySelector('[data-pkg-price="deluxe"]')
    };
    
    if (badges.soda) badges.soda.textContent = formatMoney(economics.pkg.soda);
    if (badges.refresh) badges.refresh.textContent = formatMoney(economics.pkg.refresh);
    if (badges.deluxe) badges.deluxe.textContent = formatMoney(economics.pkg.deluxe);
    
    const cap = $('#cap-badge');
    if (cap) {
      cap.textContent = `$${economics.deluxeCap.toFixed(2)}`;
      cap.setAttribute('title', `Deluxe cap is $${economics.deluxeCap.toFixed(2)} before gratuity`);
    }
  }
  
  /* ==================== INPUT REFLECTION ==================== */
  
  function reflectInputsToDOM() {
    const { inputs } = store.get();
    
    const mappings = [
      ['input-days', inputs.days],
      ['input-seadays', inputs.seaDays],
      ['sea-toggle', inputs.seaApply, 'checkbox'],
      ['sea-weight', inputs.seaWeight],
      ['input-adults', inputs.adults],
      ['input-minors', inputs.minors]
    ];
    
    mappings.forEach(([id, value, type]) => {
      const el = document.getElementById(id);
      if (!el) return;
      
      if (type === 'checkbox') {
        el.checked = Boolean(value);
      } else {
        el.value = String(value);
      }
    });
    
    // Update drinks
    Object.entries(inputs.drinks).forEach(([key, value]) => {
      const el = document.querySelector(`[data-input="${key}"]`);
      if (el) {
        el.value = typeof value === 'object' 
          ? `${value.min || 0}-${value.max || 0}` 
          : String(value || 0);
      }
    });
    
    // Update sea weight display
    const seaWeightVal = $('#sea-weight-val');
    if (seaWeightVal) {
      seaWeightVal.textContent = `${inputs.seaWeight}%`;
    }
  }
  
  /* ==================== SUBSCRIPTIONS ==================== */
  
  // Subscribe to state changes
  store.subscribe('results', renderResults);
  store.subscribe('economics', renderEconomics);
  store.subscribe('inputs', reflectInputsToDOM);
  
  store.subscribe('ui', (ui) => {
    const banner = $('#fallback-banner');
    if (banner) {
      banner.hidden = !ui.fallbackBanner;
    }
  });
  
  /* ==================== GLOBAL UI HELPERS ==================== */
  
  window.renderAll = () => {
    const state = store.get();
    renderEconomics();
    renderResults(state.results);
    reflectInputsToDOM();
  };
  
  // Expose chart
  window.ITW.chart = chart;
  
  /* ==================== INITIAL RENDER ==================== */
  
  // Initialize chart
  initializeChart();
  
  // Initial render
  setTimeout(() => {
    renderEconomics();
    reflectInputsToDOM();
    const results = store.get().results;
    if (results) {
      renderResults(results);
    }
  }, 100);
  
  console.log('[UI] v10.0.0 ✓ Loaded');
})();
