/**
 * Drink Package Calculator — Application Controller (v9.005.1)
 * "In the Wake" — cruisinginthewake.com
 * 
 * P0 FIXES APPLIED:
 * - Exposed store, chart, currency for UI layer
 * - Resilient dual selectors (totals, group rows, prices, helpers)
 * - Input bridge with auto-sync
 * - Voucher application hook
 * - Chart ready flag
 * 
 * "Whatever you do, work heartily, as for the Lord and not for men."
 * — Colossians 3:23
 * 
 * Soli Deo Gloria
 */

(function() {
  'use strict';

  /* ========================= CONSTANTS & CONFIGURATION ========================= */

  const VERSION = '9.005.1';
  const CONFIG = {
    DELUXE_CAP_FALLBACK: 14.00,
    GRAT_PCT_FALLBACK: 0.18,
    FX_STALE_MS: 24 * 60 * 60 * 1000,
    WORKER_TIMEOUT_MS: 3000,
    CALC_DEBOUNCE_MS: 150
  };

  let DS_URL = `/assets/data/lines/royal-caribbean.json?v=${VERSION}`;
  const BRANDS_MANIFEST_URL = `/assets/data/brands.json?v=${VERSION}`;
  const FX_URL = `/assets/data/fx-rates.json?v=${VERSION}`;

  let DATASET = null;
  let FX = null;
  let worker = null;
  let chart = null;
  let calcTimer = null;
  let calcId = 0;

  /* ========================= BRAND MANIFEST & SELECTOR ========================= */

  let BRANDS = [
    { id: 'royal-caribbean', label: 'Royal Caribbean', data: '/assets/data/lines/royal-caribbean.json' }
  ];
  const LS_BRAND_KEY = 'itw:brand';

  async function loadBrandsManifest() {
    try {
      const response = await fetch(BRANDS_MANIFEST_URL, { cache: 'no-store' });
      if (!response.ok) throw new Error(`Manifest fetch failed: ${response.status}`);
      
      const manifest = await response.json();
      if (Array.isArray(manifest?.brands) && manifest.brands.length) {
        BRANDS = manifest.brands;
      }
      return manifest?.default || 'royal-caribbean';
    } catch (err) {
      console.warn('[Brand] Manifest unavailable, using Royal Caribbean:', err.message);
      return 'royal-caribbean';
    }
  }

  function setBrand(brandId) {
    const chosen = BRANDS.find(b => b.id === brandId) || BRANDS[0];
    if (!chosen) return;
    
    const dataPath = chosen.data || '/assets/data/lines/royal-caribbean.json';
    DS_URL = dataPath.includes('?') ? dataPath : `${dataPath}?v=${VERSION}`;
    
    localStorage.setItem(LS_BRAND_KEY, chosen.id);
    
    const params = new URLSearchParams(location.search);
    if (chosen.id !== 'royal-caribbean') {
      params.set('brand', chosen.id);
    } else {
      params.delete('brand');
    }
    const queryString = params.toString();
    history.replaceState(null, '', queryString ? `?${queryString}` : location.pathname);
  }

  function getBrandFromURLorLS(defaultId = 'royal-caribbean') {
    const params = new URLSearchParams(location.search);
    const fromURL = params.get('brand');
    const fromLS = localStorage.getItem(LS_BRAND_KEY);
    return fromURL || fromLS || defaultId;
  }

  function wireBrandUI() {
    const selector = document.getElementById('brand-select');
    if (!selector) return;
    
    selector.innerHTML = BRANDS.map(b => 
      `<option value="${b.id}">${b.label}</option>`
    ).join('');
    
    const current = localStorage.getItem(LS_BRAND_KEY) || BRANDS[0]?.id || 'royal-caribbean';
    selector.value = current;
    
    selector.addEventListener('change', async () => {
      setBrand(selector.value);
      await loadDataset();
      scheduleCalc();
      window.renderAll();
    });
  }

  /* ========================= FX & CURRENCY HELPERS ========================= */

  let currentCurrency = 'USD';

  function fxIsStaleNow() {
    const timestamp = FX?._ts ? new Date(FX._ts).getTime() : 0;
    return !timestamp || (Date.now() - timestamp) > CONFIG.FX_STALE_MS;
  }

  function fxApproxPrefix() {
    const driftPct = Number(store?.get?.().ui?.fxDriftPct ?? 0);
    return (driftPct !== 0 || fxIsStaleNow()) ? '≈ ' : '';
  }

  function convertUSD(usdAmount, targetCurrency = 'USD') {
    if (targetCurrency === 'USD' || !FX) return Number(usdAmount || 0);
    const rate = Number(FX[targetCurrency] || 1);
    const drift = Number(store?.get?.().ui?.fxDriftPct ?? 0);
    const adjustedRate = rate * (1 + drift / 100);
    return Number(usdAmount || 0) * adjustedRate;
  }

  function money(usdAmount) {
    const converted = convertUSD(usdAmount, currentCurrency);
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currentCurrency
    }).format(converted || 0);
  }

  function moneyInline(usdAmount) {
    try {
      const converted = convertUSD(usdAmount, currentCurrency);
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: currentCurrency,
        currencyDisplay: 'narrowSymbol'
      }).format(converted || 0);
    } catch (err) {
      return money(usdAmount);
    }
  }

  function currencyCodeTag() {
    return ` (${currentCurrency})`;
  }

  function safeMoney(n) {
    const value = Number.isFinite(n) ? n : 0;
    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: currentCurrency
      }).format(convertUSD(value, currentCurrency));
    } catch {
      return money(value);
    }
  }

  /* ========================= BREAK-EVEN HELPERS ========================= */

  function ceilDrinks(gapAmount, unitPrice) {
    const gap = Number(gapAmount || 0);
    const unit = Number(unitPrice || 0);
    if (!(unit > 0)) return 0;
    return Math.max(0, Math.ceil(gap / unit));
  }

  /* ========================= STATE MANAGEMENT ========================= */

  const store = (function() {
    let state = {
      inputs: {},
      economics: {},
      results: null,
      ui: { fxDriftPct: 0, chartReady: false }
    };
    const subscribers = {};

    return {
      get: () => state,
      
      patch: (key, value) => {
        state[key] = value;
        if (subscribers[key]) {
          subscribers[key].forEach(fn => fn(value));
        }
      },
      
      subscribe: (key, callback) => {
        if (!subscribers[key]) subscribers[key] = [];
        subscribers[key].push(callback);
      }
    };
  })();

  // ============================================================================
  // EXPOSE STORE FOR UI LAYER
  // ============================================================================
  window.__itwStore = store;

  /* ========================= DATASET & FX LOADING ========================= */

  async function loadDataset() {
    try {
      const response = await fetch(DS_URL, { cache: 'no-store' });
      if (!response.ok) throw new Error(`Dataset fetch failed: ${response.status}`);
      DATASET = await response.json();
      console.log('[Dataset] Loaded:', DATASET?.meta?.line || 'Unknown');
    } catch (err) {
      console.error('[Dataset] Load failed:', err);
      DATASET = null;
    }
  }

  async function loadFX() {
    try {
      const response = await fetch(FX_URL, { cache: 'no-store' });
      if (!response.ok) throw new Error(`FX fetch failed: ${response.status}`);
      FX = await response.json();
      console.log('[FX] Loaded:', FX?._ts || 'No timestamp');
    } catch (err) {
      console.error('[FX] Load failed:', err);
      FX = { USD: 1, _ts: new Date().toISOString() };
    }
  }

  /* ========================= WEB WORKER MANAGEMENT ========================= */

  function initWorker() {
    try {
      worker = new Worker(`/assets/js/drink-worker.js?v=${encodeURIComponent(VERSION)}`);
      worker.addEventListener('message', (e) => {
        if (e.data?.type === 'result') {
          if (e.data.id === calcId) {
            const rawResults = e.data.payload;
            const finalResults = applyVouchers(rawResults);
            store.patch('results', finalResults);
          }
        } else if (e.data?.type === 'error') {
          console.error('[Worker] Computation error:', e.data.message);
          computeFallback();
        }
      });
      console.log('[Worker] Initialized');
    } catch (err) {
      console.warn('[Worker] Unavailable, using fallback:', err.message);
      worker = null;
    }
  }

  function computeFallback() {
    if (!window.ITW_MATH?.compute) {
      console.error('[Fallback] ITW_MATH not available');
      return;
    }
    
    const inputs = store.get().inputs;
    const economics = store.get().economics;
    
    try {
      const rawResults = window.ITW_MATH.compute(inputs, economics);
      const finalResults = applyVouchers(rawResults);
      store.patch('results', finalResults);
    } catch (err) {
      console.error('[Fallback] Computation failed:', err);
    }
  }

  /* ========================= VOUCHER APPLICATION HOOK ========================= */

  function applyVouchers(workerResults) {
    const voucherValueEl = document.getElementById('voucher-value');
    const voucherValue = voucherValueEl ? parseFloat(voucherValueEl.value) || 0 : 0;
    
    if (voucherValue === 0) {
      return workerResults;
    }
    
    const inputs = store.get().inputs;
    const adults = inputs.adults || 1;
    const minors = inputs.minors || 0;
    const nights = inputs.nights || 7;
    
    const perDayCounts = Array.from({ length: nights }, () => ({
      adults: adults,
      minors: minors
    }));
    
    const voucherConfig = {
      faceValue: voucherValue,
      adultValue: voucherValue,
      minorValue: voucherValue * 0.7
    };
    
    if (window.ITW_MATH?.computeWithVouchers) {
      return window.ITW_MATH.computeWithVouchers(
        inputs,
        store.get().economics,
        DATASET,
        voucherConfig
      );
    }
    
    return computeWithVouchers(workerResults, voucherConfig, perDayCounts);
  }

  function computeWithVouchers(results, voucherConfig, perDayCounts) {
    const adjusted = JSON.parse(JSON.stringify(results));
    
    ['soda', 'refresh', 'deluxe'].forEach(pkg => {
      if (!adjusted.packages?.[pkg]) return;
      
      let totalDiscount = 0;
      
      perDayCounts.forEach(day => {
        totalDiscount += day.adults * voucherConfig.adultValue;
        
        if (pkg === 'soda' || pkg === 'refresh') {
          totalDiscount += day.minors * voucherConfig.minorValue;
        }
      });
      
      adjusted.packages[pkg].total = Math.max(0, 
        adjusted.packages[pkg].total - totalDiscount
      );
    });
    
    return adjusted;
  }

  /* ========================= COMPUTATION SCHEDULING ========================= */

  function scheduleCalc() {
    clearTimeout(calcTimer);
    calcTimer = setTimeout(() => {
      const inputs = store.get().inputs;
      const economics = store.get().economics;
      
      if (!economics?.pkg || !inputs) {
        console.warn('[Calc] Missing economics or inputs');
        return;
      }
      
      const thisCalcId = ++calcId;
      
      if (worker) {
        worker.postMessage({
          type: 'compute',
          id: thisCalcId,
          payload: { inputs, economics }
        });
        
        setTimeout(() => {
          if (calcId === thisCalcId && !store.get().results) {
            console.warn('[Worker] Timeout, using fallback');
            computeFallback();
          }
        }, CONFIG.WORKER_TIMEOUT_MS);
      } else {
        computeFallback();
      }
    }, CONFIG.CALC_DEBOUNCE_MS);
  }

  /* ========================= CHART MANAGEMENT ========================= */

  function ensureChart() {
    if (chart) return chart;
    
    const canvas = document.getElementById('breakeven-chart');
    if (!canvas) {
      console.error('[Chart] Canvas element #breakeven-chart not found');
      return null;
    }
    
    const ctx = canvas.getContext && canvas.getContext('2d');
    if (!ctx) {
      console.error('[Chart] 2D context unavailable on canvas');
      return null;
    }
    
    const colors = {
      alc: 'rgba(59, 130, 246, 0.8)',
      soda: 'rgba(139, 92, 246, 0.8)',
      refresh: 'rgba(16, 185, 129, 0.8)',
      deluxe: 'rgba(249, 115, 22, 0.8)'
    };
    
    chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['À-la-carte', 'Soda', 'Refreshment', 'Deluxe'],
        datasets: [{
          label: 'Total Cost',
          data: [0, 0, 0, 0],
          backgroundColor: [colors.alc, colors.soda, colors.refresh, colors.deluxe],
          borderWidth: [0, 0, 0, 0],
          borderColor: ['rgba(0,0,0,0)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0)']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.parsed.y || 0;
                const approx = fxApproxPrefix();
                return `${context.dataset.label}: ${approx}${moneyInline(value)}${currencyCodeTag()}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => moneyInline(value)
            }
          }
        }
      }
    });
    
    // ============================================================================
    // EXPOSE CHART FOR UI PLUGINS
    // ============================================================================
    window.ITW = window.ITW || {};
    window.ITW.chart = chart;
    
    // Set ready flag in store
    const currentUI = store.get().ui || {};
    store.patch('ui', {
      ...currentUI,
      chartReady: true
    });
    console.log('[Chart] ✓ Ready flag set');
    
    return chart;
  }

  function highlightWinnerBar(chartInstance, winnerKey) {
    if (!chartInstance || !chartInstance.data || !Array.isArray(chartInstance.data.labels)) return;
    
    const labels = chartInstance.data.labels;
    const indexMap = { 'alc': 0, 'soda': 1, 'refresh': 2, 'deluxe': 3 };
    const winnerIndex = indexMap[winnerKey] ?? -1;
    
    const dataset = chartInstance.data.datasets?.[0];
    if (!dataset) return;
    
    dataset.borderWidth = new Array(labels.length).fill(0);
    dataset.borderColor = new Array(labels.length).fill('rgba(0,0,0,0)');
    
    if (winnerIndex >= 0 && winnerIndex < labels.length) {
      dataset.borderWidth[winnerIndex] = 3;
      dataset.borderColor[winnerIndex] = 'rgba(24,24,27,0.55)';
    }
    
    chartInstance.update('none');
  }

  function updateChart(results) {
    const chartInstance = ensureChart();
    if (!chartInstance) return;
    
    const data = [
      results?.bars?.alc?.mean || 0,
      results?.bars?.soda?.mean || 0,
      results?.bars?.refresh?.mean || 0,
      results?.bars?.deluxe?.mean || 0
    ];
    
    chartInstance.data.datasets[0].data = data;
    highlightWinnerBar(chartInstance, results?.winnerKey);
  }

  /* ========================= INPUT VALIDATION ========================= */

  function sanitizeNumericInput(value) {
    const str = String(value).replace(/[^\d.,-]/g, '');
    
    let output = str.replace(/-/g, '');
    if (str.startsWith('-')) output = '-' + output;
    
    const firstDot = output.indexOf('.');
    const firstComma = output.indexOf(',');
    const firstDecimal = (firstDot === -1) ? firstComma : (firstComma === -1 ? firstDot : Math.min(firstDot, firstComma));
    
    if (firstDecimal !== -1) {
      const head = output.slice(0, firstDecimal + 1);
      const tail = output.slice(firstDecimal + 1).replace(/[.,]/g, '');
      return head + tail;
    }
    
    return output;
  }

  function parseNumericInput(value) {
    if (!value) return 0;
    
    const cleaned = String(value).trim();
    
    const dotCount = (cleaned.match(/\./g) || []).length;
    const commaCount = (cleaned.match(/,/g) || []).length;
    
    let normalized = cleaned;
    
    if (commaCount === 1 && dotCount > 0) {
      normalized = cleaned.replace(/\./g, '').replace(',', '.');
    }
    else if (dotCount === 1 && commaCount > 0) {
      normalized = cleaned.replace(/,/g, '');
    }
    else if (commaCount === 1 && dotCount === 0) {
      normalized = cleaned.replace(',', '.');
    }
    else if (commaCount > 1) {
      normalized = cleaned.replace(/,/g, '');
    }
    
    const parsed = parseFloat(normalized);
    return isNaN(parsed) ? 0 : parsed;
  }

  function wireNumericValidation(input) {
    if (!input) return;
    
    input.addEventListener('input', (e) => {
      const el = e.target;
      const start = el.selectionStart ?? el.value.length;
      const before = el.value;
      const after = sanitizeNumericInput(before);
      
      if (before !== after) {
        const delta = before.length - after.length;
        el.value = after;
        const pos = Math.max(0, start - delta);
        el.setSelectionRange(pos, pos);
      }
    });
    
    input.addEventListener('blur', (e) => {
      const parsed = parseNumericInput(e.target.value);
      e.target.value = parsed === 0 ? '' : String(parsed);
    });
  }

  /* ========================= UI RENDERING ========================= */

  function renderEconomics(economics) {
    if (!economics) return;
    
    ['soda', 'refresh', 'deluxe'].forEach(key => {
      const priceEl = document.querySelector(`#price-${key}`) ||
                      document.querySelector(`[data-pkg-price="${key}"]`);
      if (priceEl && economics.pkg?.[key] != null) {
        priceEl.textContent = money(economics.pkg[key]);
      }
    });
    
    const capBadge = document.getElementById('deluxe-cap-badge') || document.getElementById('cap-badge');
    if (capBadge && economics.deluxeCap != null) {
      const cap = Number(economics.deluxeCap);
      capBadge.textContent = `$${cap.toFixed(2)}`;
      
      const faceInline = document.getElementById('voucher-face-inline');
      if (faceInline) {
        faceInline.textContent = `$${cap.toFixed(2)}`;
      }
    }
    
    const gratBadge = document.getElementById('grat-badge');
    if (gratBadge && economics.gratPct != null) {
      const pct = Number(economics.gratPct * 100);
      gratBadge.textContent = `${pct.toFixed(0)}%`;
    }
  }

  function renderResults(results) {
    if (!results) return;
    
    if (Array.isArray(results?.groupRows) && results.groupRows.length) {
      results.groupRows = results.groupRows.map(row => {
        if (row?.isMinor && /deluxe/i.test(String(row.pkg || ''))) {
          return { ...row, pkg: 'Refreshment', pkgKey: 'refresh' };
        }
        return row;
      });
    }
    
    ['soda', 'refresh', 'deluxe'].forEach(key => {
      const card = document.querySelector(`[data-card="${key}"]`);
      if (card) {
        card.classList.toggle('winner', results.winnerKey === key);
      }
    });
    
    const totalsEl = document.querySelector('#results-totals') || 
                     document.querySelector('#totals');
    if (totalsEl && results.bars) {
      const winner = results.winnerKey || 'alc';
      const winnerLabels = {
        alc: 'À-la-carte',
        soda: 'Soda Package',
        refresh: 'Refreshment Package',
        deluxe: 'Deluxe Package'
      };
      const totalSpend = results.bars[winner]?.mean || 0;
      const approx = fxApproxPrefix();
      totalsEl.textContent = `Total: ${approx}${moneyInline(totalSpend)}${currencyCodeTag()} · Winner: ${winnerLabels[winner]}`;
    }
    
    const tableBody = document.querySelector('#group-rows-body') || 
                      document.querySelector('#group-table-body');
    if (tableBody && Array.isArray(results.groupRows)) {
      tableBody.innerHTML = results.groupRows.map(row => `
        <tr>
          <td>${row.who || row.label || 'Guest'}</td>
          <td>${row.pkg || '—'}</td>
          <td>${moneyInline(row.perDay || 0)}/day</td>
          <td>${moneyInline(row.trip || row.total || 0)}</td>
        </tr>
      `).join('');
    }
    
    renderBreakevenHelpers(results);
    updateChart(results);
    enforceDeluxeSanityHint(results);
  }

  function renderBreakevenHelpers(results) {
    const sodaHelper = document.querySelector('#soda-breakeven');
    const refreshHelper = document.querySelector('#refresh-breakeven');
    const deluxeHelper = document.querySelector('#deluxe-breakeven');
    
    const economics = store.get().economics;
    const cap = Number(economics?.deluxeCap || CONFIG.DELUXE_CAP_FALLBACK);
    const grat = Number(economics?.gratPct || CONFIG.GRAT_PCT_FALLBACK);
    const capWithGrat = cap * (1 + grat);
    
    const gaps = results.gaps || { soda: 0, refresh: 0, deluxe: 0 };
    const approx = fxApproxPrefix();
    
    if (sodaHelper && refreshHelper && deluxeHelper) {
      let sodaHTML = '';
      if (gaps.soda > 0.5 && results.winnerKey !== 'soda') {
        const userSodas = Array.isArray(results.drinks?.soda?.userPresent) ? results.drinks.soda.userPresent : [];
        if (userSodas.length > 0) {
          const cheapest = userSodas[0];
          const need = ceilDrinks(gaps.soda, cheapest.unit);
          sodaHTML = `
            <div class="helper-block soda">
              <strong>Soda Package:</strong> 
              You're ${approx}${moneyInline(gaps.soda)} from break-even${currencyCodeTag()}.
              ${need} more ${cheapest.name} (${approx}${moneyInline(cheapest.unit)} each) would close the gap.
            </div>
          `;
        }
      }
      
      let refreshHTML = '';
      if (gaps.refresh > 0.5 && results.winnerKey !== 'refresh') {
        const suggestions = Array.isArray(results.drinks?.refresh?.suggestions) ? results.drinks.refresh.suggestions : [];
        if (suggestions.length > 0) {
          const best = suggestions[0];
          const need = ceilDrinks(gaps.refresh, best.unit);
          refreshHTML = `
            <div class="helper-block refresh">
              <strong>Refreshment Package:</strong> 
              You're ${approx}${moneyInline(gaps.refresh)} from break-even${currencyCodeTag()}.
              ${need} more ${best.name} (${approx}${moneyInline(best.unit)} each) would close the gap.
            </div>
          `;
        }
      }
      
      let deluxeHTML = '';
      if (gaps.deluxe > 0.5 && results.winnerKey !== 'deluxe') {
        const need = ceilDrinks(gaps.deluxe, capWithGrat);
        deluxeHTML = `
          <div class="helper-block deluxe">
            <strong>Deluxe Package:</strong> 
            You're ${approx}${moneyInline(gaps.deluxe)} from break-even${currencyCodeTag()}.
            ${need} more premium drinks (cap $${cap.toFixed(2)} + grat → ${approx}${moneyInline(capWithGrat)} each) would close the gap.
          </div>
        `;
      }
      
      sodaHelper.innerHTML = sodaHTML;
      refreshHelper.innerHTML = refreshHTML;
      deluxeHelper.innerHTML = deluxeHTML;
      console.log('[Helpers] ✓ Rendered to split containers');
    } else {
      const fallbackHelper = document.querySelector('#breakeven-helpers');
      if (fallbackHelper) {
        let html = '';
        
        if (gaps.soda > 0.5 && results.winnerKey !== 'soda') {
          const userSodas = Array.isArray(results.drinks?.soda?.userPresent) ? results.drinks.soda.userPresent : [];
          if (userSodas.length > 0) {
            const cheapest = userSodas[0];
            const need = ceilDrinks(gaps.soda, cheapest.unit);
            html += `
              <div class="helper-block soda">
                <strong>Soda Package:</strong> 
                You're ${approx}${moneyInline(gaps.soda)} from break-even${currencyCodeTag()}.
                ${need} more ${cheapest.name} (${approx}${moneyInline(cheapest.unit)} each) would close the gap.
              </div>
            `;
          }
        }
        
        if (gaps.refresh > 0.5 && results.winnerKey !== 'refresh') {
          const suggestions = Array.isArray(results.drinks?.refresh?.suggestions) ? results.drinks.refresh.suggestions : [];
          if (suggestions.length > 0) {
            const best = suggestions[0];
            const need = ceilDrinks(gaps.refresh, best.unit);
            html += `
              <div class="helper-block refresh">
                <strong>Refreshment Package:</strong> 
                You're ${approx}${moneyInline(gaps.refresh)} from break-even${currencyCodeTag()}.
                ${need} more ${best.name} (${approx}${moneyInline(best.unit)} each) would close the gap.
              </div>
            `;
          }
        }
        
        if (gaps.deluxe > 0.5 && results.winnerKey !== 'deluxe') {
          const need = ceilDrinks(gaps.deluxe, capWithGrat);
          html += `
            <div class="helper-block deluxe">
              <strong>Deluxe Package:</strong> 
              You're ${approx}${moneyInline(gaps.deluxe)} from break-even${currencyCodeTag()}.
              ${need} more premium drinks (cap $${cap.toFixed(2)} + grat → ${approx}${moneyInline(capWithGrat)} each) would close the gap.
            </div>
          `;
        }
        
        fallbackHelper.innerHTML = html;
        console.log('[Helpers] ✓ Rendered to fallback container');
      } else {
        console.warn('[Helpers] No helper containers found');
      }
    }
  }

  function enforceDeluxeSanityHint(results) {
    const hintContainer = document.getElementById('sanity-hint');
    if (!hintContainer) return;
    
    const vouchersActive = Number(results?.vouchersAppliedPerDay || 0) > 0;
    if (vouchersActive) {
      hintContainer.innerHTML = '';
      return;
    }
    
    const economics = store.get().economics;
    const alcPerDay = Number(results?.bars?.alc?.mean || 0);
    const deluxePerDay = Number(economics?.pkg?.deluxe || 0);
    
    if (deluxePerDay > 0 && alcPerDay >= deluxePerDay && results.winnerKey !== 'deluxe') {
      hintContainer.innerHTML = `
        <div class="alert alert-info xsmall">
          💡 Your à-la-carte spend appears to exceed Deluxe pricing. Consider reviewing your drink quantities.
        </div>
      `;
    } else {
      hintContainer.innerHTML = '';
    }
  }

  /* ========================= INPUT BRIDGE ========================= */

  function syncInputsToStore() {
    const inputs = {};
    
    document.querySelectorAll('[data-input]').forEach(el => {
      const key = el.dataset.input;
      let value = el.value;
      
      if (el.type === 'number' || el.classList.contains('numeric')) {
        value = parseFloat(value) || 0;
      }
      
      inputs[key] = value;
    });
    
    const daysInput = document.getElementById('input-days');
    const seaDaysInput = document.getElementById('input-seadays');
    
    if (daysInput && !inputs.nights) {
      inputs.nights = parseFloat(daysInput.value) || 7;
    }
    if (seaDaysInput && !inputs.seaDays) {
      inputs.seaDays = parseFloat(seaDaysInput.value) || 0;
    }
    
    ['soda', 'juice', 'water', 'specialty', 'alcohol', 'premium'].forEach(cat => {
      const seaEl = document.querySelector(`#sea-${cat}`);
      if (seaEl) {
        inputs[`sea_${cat}`] = parseFloat(seaEl.value) || 0;
      }
    });
    
    const adultsInput = document.querySelector('#input-adults') || 
                        document.querySelector('[data-input="adults"]');
    const minorsInput = document.querySelector('#input-minors') || 
                        document.querySelector('[data-input="minors"]');
    
    if (adultsInput) inputs.adults = parseInt(adultsInput.value) || 1;
    if (minorsInput) inputs.minors = parseInt(minorsInput.value) || 0;
    
    store.patch('inputs', inputs);
    scheduleCalc();
    
    console.log('[Input Bridge] ✓ Synced to store:', inputs);
  }

  function initInputBridge() {
    const inputSelectors = [
      '[data-input]',
      '#input-days',
      '#input-seadays',
      '[id^="sea-"]',
      '#input-adults',
      '#input-minors'
    ].join(',');
    
    document.querySelectorAll(inputSelectors).forEach(el => {
      el.addEventListener('input', syncInputsToStore);
      el.addEventListener('change', syncInputsToStore);
    });
    
    console.log('[Input Bridge] ✓ Listeners attached');
  }

  /* ========================= INPUT WIRING ========================= */

  function wireInputs() {
    const inputs = store.get().inputs;
    
    const inputMap = {
      'nights': 'nights',
      'input-days': 'nights',
      'adults': 'adults',
      'input-adults': 'adults',
      'kids': 'kids',
      'minors': 'minors',
      'input-minors': 'minors',
      'beer': 'beer',
      'wine': 'wine',
      'cocktails': 'cocktails',
      'cocktail': 'cocktail',
      'shots': 'shots',
      'spirits': 'spirits',
      'soda': 'soda',
      'juice': 'juice',
      'freshjuice': 'freshjuice',
      'smoothies': 'smoothies',
      'specialty-coffee': 'specialtyCoffee',
      'coffee': 'coffee',
      'teaprem': 'teaprem',
      'water': 'water',
      'bottledwater': 'bottledwater',
      'energy': 'energy',
      'mocktails': 'mocktails',
      'mocktail': 'mocktail',
      'milkshake': 'milkshake'
    };
    
    Object.entries(inputMap).forEach(([elementId, stateKey]) => {
      const input = document.getElementById(elementId);
      if (!input) return;
      
      wireNumericValidation(input);
      
      input.addEventListener('input', (e) => {
        inputs[stateKey] = parseNumericInput(e.target.value);
        scheduleCalc();
      });
      
      if (inputs[stateKey] != null && inputs[stateKey] !== 0) {
        input.value = inputs[stateKey];
      }
    });
    
    const vouchersCheckbox = document.getElementById('vouchers-enabled');
    const vouchersPerDay = document.getElementById('vouchers-per-day');
    
    if (vouchersCheckbox) {
      vouchersCheckbox.addEventListener('change', (e) => {
        inputs.vouchersEnabled = e.target.checked;
        if (vouchersPerDay) vouchersPerDay.disabled = !e.target.checked;
        scheduleCalc();
      });
    }
    
    if (vouchersPerDay) {
      wireNumericValidation(vouchersPerDay);
      vouchersPerDay.addEventListener('input', (e) => {
        inputs.vouchersPerDay = parseNumericInput(e.target.value);
        scheduleCalc();
      });
    }
    
    const currencySelect = document.getElementById('currency-select');
    if (currencySelect) {
      currencySelect.addEventListener('change', (e) => {
        currentCurrency = e.target.value;
        // ============================================================================
        // EXPOSE CURRENCY FOR UI BADGES
        // ============================================================================
        window.__itwCurrency = currentCurrency;
        scheduleCalc();
      });
    }
  }

  function wirePersonaCards() {
    document.querySelectorAll('[data-persona]').forEach(card => {
      card.addEventListener('click', () => {
        const personaKey = card.getAttribute('data-persona');
        if (typeof window.applyPersona === 'function' && personaKey) {
          window.applyPersona(personaKey);
          setTimeout(() => scheduleCalc(), 50);
        } else {
          console.warn('[Persona] applyPersona not available or invalid key:', personaKey);
        }
      });
    });
  }

  function wirePresetButtons() {
    document.querySelectorAll('[data-preset]').forEach(button => {
      button.addEventListener('click', () => {
        const presetKey = button.getAttribute('data-preset');
        if (typeof window.loadPreset === 'function' && presetKey) {
          window.loadPreset(presetKey);
          setTimeout(() => scheduleCalc(), 50);
        } else {
          console.warn('[Preset] loadPreset not available or invalid key:', presetKey);
        }
      });
    });
  }

  /* ========================= STATE SUBSCRIPTIONS ========================= */

  store.subscribe('economics', (economics) => {
    renderEconomics(economics);
    scheduleCalc();
  });

  store.subscribe('results', (results) => {
    renderResults(results);
  });

  /* ========================= BOOT SEQUENCE ========================= */

  async function boot() {
    console.log(`[Boot] Drink Package Calculator v${VERSION}`);
    
    const defaultBrand = (await loadBrandsManifest()) || 'royal-caribbean';
    setBrand(getBrandFromURLorLS(defaultBrand));
    
    await Promise.all([
      loadDataset(),
      loadFX()
    ]);
    
    initWorker();
    wireBrandUI();
    
    if (DATASET?.pricing) {
      const pricing = DATASET.pricing;
      store.patch('economics', {
        pkg: {
          soda: Number(pricing.soda || 0),
          refresh: Number(pricing.refreshment || 0),
          deluxe: Number(pricing.deluxe || 0)
        },
        deluxeCap: Number(pricing.deluxe_cap || CONFIG.DELUXE_CAP_FALLBACK),
        gratPct: Number(pricing.gratuity || CONFIG.GRAT_PCT_FALLBACK)
      });
    }
    
    store.patch('inputs', {
      nights: 7,
      adults: 2,
      kids: 0,
      minors: 0,
      beer: 0,
      wine: 0,
      cocktails: 0,
      cocktail: 0,
      shots: 0,
      spirits: 0,
      soda: 0,
      juice: 0,
      freshjuice: 0,
      smoothies: 0,
      specialtyCoffee: 0,
      coffee: 0,
      teaprem: 0,
      water: 0,
      bottledwater: 0,
      energy: 0,
      mocktails: 0,
      mocktail: 0,
      milkshake: 0,
      vouchersEnabled: false,
      vouchersPerDay: 0
    });
    
    wireInputs();
    wirePersonaCards();
    wirePresetButtons();
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initInputBridge);
    } else {
      initInputBridge();
    }
    
    scheduleCalc();
    
    window.renderAll = () => {
      const results = store.get().results;
      const economics = store.get().economics;
      if (economics) renderEconomics(economics);
      if (results) renderResults(results);
    };
    
    window.updateInputs = (newInputs) => {
      const inputs = store.get().inputs;
      Object.assign(inputs, newInputs);
      Object.entries(newInputs).forEach(([key, value]) => {
        const inputMap = {
          'nights': 'nights',
          'adults': 'adults',
          'kids': 'kids',
          'minors': 'minors',
          'beer': 'beer',
          'wine': 'wine',
          'cocktails': 'cocktails',
          'cocktail': 'cocktail',
          'shots': 'shots',
          'spirits': 'spirits',
          'soda': 'soda',
          'juice': 'juice',
          'freshjuice': 'freshjuice',
          'smoothies': 'smoothies',
          'specialtyCoffee': 'specialty-coffee',
          'coffee': 'coffee',
          'teaprem': 'teaprem',
          'water': 'water',
          'bottledwater': 'bottledwater',
          'energy': 'energy',
          'mocktails': 'mocktails',
          'mocktail': 'mocktail',
          'milkshake': 'milkshake'
        };
        const elementId = inputMap[key] || key;
        const element = document.getElementById(elementId);
        if (element) {
          element.value = value || '';
        }
      });
      scheduleCalc();
    };
    
    window.scheduleCalc = scheduleCalc;
    
    console.log('[Boot] Ready');
  }

  /* ========================= INITIALIZATION ========================= */

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();

/**
 * Soli Deo Gloria
 */
