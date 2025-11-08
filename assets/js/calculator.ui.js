/* calculator.ui.js v.9.002.003 — Consolidated UI glue layer
   Mission: Surgical, store-driven UI enhancements
   No polling loops, no monkey-patching, no synthetic events
   Soli Deo Gloria
*/
(function itwUIBundle(){
  'use strict';
  
  /* ===== BOOT GUARD ===== */
  if (!window.ITW?.store) {
    console.warn('[ITW UI] Core not loaded yet, deferring');
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(itwUIBundle, 50);
      });
    }
  return;
  }

  // 🔧 NEW: use ITW exports everywhere in this file
  const { store, money, getCurrency } = window.ITW;

 /* ===== QUICK START (PRESET PERSONAS) ===== */
(function quickStartPresets(){
  const root = document.getElementById('qs-preset-buttons');
  if (!root) return;

  // Map your HTML buttons → existing persona/preset functions
  const APPLY = {
    light:    () => window.applyPersona?.('light'),
    moderate: () => window.applyPersona?.('moderate'),
    party:    () => window.applyPersona?.('boys'),   // closest “lively” profile you already ship
    coffee:   () => window.loadPreset?.('coffee'),   // you already export this preset
    solo:     () => window.applyPersona?.('solo'),
  };
root.addEventListener('click', (e)=>{
  const btn = e.target.closest('[data-persona]');
  if (!btn) return;
  const key = btn.getAttribute('data-persona');
 APPLY[key]?.();

// 🔧 ensure a results update right now
try { window.scheduleCalc?.(); } catch (_) {}

document.dispatchEvent(new CustomEvent('preset:loaded', { detail:{ name:key } }));
try {
  const live = document.getElementById('a11y-status');
  if (live) live.textContent = `Preset “${key}” applied.`;
} catch (_) {}
});
})();
  
  /* ===== VOUCHER FACE-VALUE AUTO-SYNC ===== */
  (function voucherSync(){
    function syncFaceValue(){
      const cap = store.get().economics.deluxeCap;
      const input = document.getElementById('voucher-value');
      if (!input) return;
      
      const next = Number(cap).toFixed(2);
      if (input.value === next) return;
      
      input.value = next;
      input.readOnly = true;
      input.setAttribute('aria-readonly', 'true');
      input.title = `Auto-synced to Deluxe cap ($${next})`;
      input.style.cursor = 'not-allowed';
    }
    
    // Subscribe to economics changes
    store.subscribe('economics', syncFaceValue);
    
    // Initial sync
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', syncFaceValue);
    } else {
      syncFaceValue();
    }
  })();
  
  /* ===== EXPLAIN RESULT CARD ===== */
  (function explainCard(){
    if (!window.ITW_CFG?.explainCard) return;
    
    const el = document.getElementById('explain-result');
    const txt = document.getElementById('explain-text');
    if (!el || !txt) return;
    
    function update(){
      const results = store.get().results;
      if (!results?.winnerKey) {
        el.style.display = 'none';
        return;
      }
      
      const name = results.winnerKey === 'alc' ? 'à-la-carte' :
        results.winnerKey === 'deluxe' ? 'Deluxe' :
        results.winnerKey.charAt(0).toUpperCase() + results.winnerKey.slice(1);
      
      const delta = results.perDay - (results.bars?.alc?.mean || 0);
      
      if (delta < 0) {
        txt.innerHTML = `<strong>Quick summary:</strong> À-la-carte looks cheaper by <strong>${money(Math.abs(delta))}/day</strong>.`;
      } else {
        txt.innerHTML = `<strong>Quick summary:</strong> ${name} saves about <strong>${money(delta)}/day</strong> vs à-la-carte.`;
      }
      
      el.style.display = '';
    }
    
    store.subscribe('results', update);
    setTimeout(update, 100);
  })();
  
  /* ===== EMAIL CTA INLINE ===== */
  (function emailCTA(){
    const cfg = window.ITW_CFG?.emailCTA;
    if (!cfg?.enabled) return;
    
    const box = document.getElementById('email-cta-inline');
    const btn = document.getElementById('email-cta-btn');
    if (!box) return;
    
    function maybeShow(){
      const results = store.get().results;
      if (!results?.winnerKey) {
        box.style.display = 'none';
        return;
      }
      
      const savings = results.perDay - (results.bars?.alc?.mean || 0);
      const totalDrinks = store.get().inputs?.drinks 
        ? Object.values(store.get().inputs.drinks).reduce((a,b) => a + (typeof b === 'number' ? b : 0), 0)
        : 0;
      
      const show = cfg.alwaysShow ||
        (savings > (cfg.showWhenSavingsAbove || 30)) ||
        (totalDrinks > (cfg.showWhenDrinksAbove || 4));
      
      box.style.display = show ? '' : 'none';
    }
    
    store.subscribe('results', maybeShow);
    
    if (btn) {
      btn.addEventListener('click', () => {
        const form = document.getElementById('email-form') ||
                     document.getElementById('newsletter-form');
        if (form) {
          form.scrollIntoView({ behavior:'smooth', block:'nearest' });
        }
      });
    }
  })();
  
  /* ===== WINNER RING CHART PLUGIN ===== */
  (function winnerRing(){
    const badge = document.getElementById('best-stamp');
    if (!badge) return;
    
    let pluginMounted = false;
    let WINNER_IDX = null;
    
    const ringPlugin = {
      id: 'itwWinnerRing',
      afterDatasetsDraw(chart){
        if (WINNER_IDX === null) return;
        
        let el = null;
        chart.data.datasets.some((ds, i) => {
          const meta = chart.getDatasetMeta(i);
          const e = meta?.data?.[WINNER_IDX];
          if (e) {
            el = e;
            return true;
          }
        });
        
        if (!el) return;
        
        const { x, y, width, height } = el.getProps(['x','y','width','height'], true);
        const ctx = chart.ctx;
        
        ctx.save();
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 4;
        ctx.setLineDash([6,4]);
        
        const pad = 6;
        ctx.strokeRect(x - width/2 - pad, y - height - pad, width + pad*2, height + pad*2);
        ctx.restore();
      }
    };
    
    function pickWinner(chart){
      const ds = chart.data.datasets || [];
      const N = ds[0]?.data?.length || 0;
      let best = { idx: null, val: Infinity };
      
      for (let i=0; i<N; i++) {
        let min = Infinity;
        ds.forEach(d => {
          const v = (Array.isArray(d.data) && typeof d.data[i] === 'number') ? d.data[i] : Infinity;
          if (v > 0 && v < min) min = v;
        });
        if (min < best.val) {
          best = { idx: i, val: min };
        }
      }
      
      WINNER_IDX = best.idx;
      badge.style.display = (WINNER_IDX === null) ? 'none' : '';
    }
    
    function mountPlugin(){
      if (pluginMounted) return;
      
      const chart = window.ITW?.chart;
      if (!chart || !window.Chart) return;
      
     // chart.config.plugins = chart.config.plugins || [];
     // if (!chart.config.plugins.includes(ringPlugin)) {
    //    chart.config.plugins.push(ringPlugin);
      
  // 🔧 FIX: register globally instead of mutating a (frozen) config path
  try { window.Chart.register(ringPlugin); } catch (_) {}
       
      pluginMounted = true;
      pickWinner(chart);
      chart.update('none');
      
      // Subscribe to results for winner updates
      store.subscribe('results', () => {
        pickWinner(chart);
        chart.update('none');
      });
    }
    
    // Subscribe to chartReady
    store.subscribe('ui', (ui) => {
      if (ui.chartReady) mountPlugin();
    });
    
    // Also try immediate mount if already ready
    setTimeout(mountPlugin, 200);
  })();
  
  /* ===== CATEGORY BREAKDOWN (VIEW-ONLY) ===== */
  (function categoryBreakdown(){
    const section = document.getElementById('category-breakdown');
    const grid = document.getElementById('category-grid');
    if (!section || !grid) return;
    
    function render(){
      const results = store.get().results;
      const rows = Array.isArray(results?.categoryRows) ? results.categoryRows : [];
      const clean = rows.filter(x => !/voucher/i.test(String(x?.id || x?.name || '')));
      
      if (!clean.length) {
        section.hidden = true;
        grid.innerHTML = '';
        return;
      }
      
      grid.innerHTML = clean.map(row => `
        <div class="category-item">
          <span class="cat-name">${row.label || row.name || ''}</span>
          <span class="cat-cost">${money(row.perDay ?? row.value ?? 0)}/day</span>
        </div>
      `).join('');
      
      section.hidden = false;
    }
    
    store.subscribe('results', render);
  })();
  
  /* ===== SCREEN-READER TABLE SYNC ===== */
  (function srTableSync(){
    function update(){
      const results = store.get().results;
      if (!results?.bars) return;
      
      const srAlc = document.getElementById('sr-alc');
      const srSoda = document.getElementById('sr-soda');
      const srRefresh = document.getElementById('sr-refresh');
      const srDeluxe = document.getElementById('sr-deluxe');
      
      if (srAlc) srAlc.textContent = money(results.bars.alc.mean);
      if (srSoda) srSoda.textContent = money(results.bars.soda.mean);
      if (srRefresh) srRefresh.textContent = money(results.bars.refresh.mean);
      if (srDeluxe) srDeluxe.textContent = money(results.bars.deluxe.mean);
    }
    
    store.subscribe('results', update);
  })();
  
  /* ===== QUIZ SYSTEM (LAZY-LOADED) ===== */
  let quizLoaded = false;
  let quizState = { idx: 0, ans: {}, start: Date.now() };
  
  const QUIZ_CONFIG = { storageKey: 'itw_quiz_v2', expiryDays: window.ITW_CONFIG?.QUIZ_EXPIRY_DAYS || 90 };
  
  const QUIZ_QUESTIONS = [
    {
      id:'vibe', type:'radio',
      q:'What best describes your cruise style?',
      icon:'🎭',
      opts:[
        {v:'chill', l:'Chill & Relaxed', d:'Mostly non-alc, 1-2 drinks/day', e:'🧘'},
        {v:'balanced', l:'Balanced & Social', d:'Mix of everything, 3-5/day', e:'🥂'},
        {v:'lively', l:'Lively Celebration', d:'Living it up, 6+/day', e:'🎉'}
      ],
      impact: a => ({
        drinks: {},
        profile: a,
        mult: a==='lively' ? 1.4 : a==='chill' ? 0.65 : 1
      })
    },
    {
      id:'coffee', type:'radio', q:'Morning caffeine?', icon:'☕',
      opts:[
        {v:'none', l:'Skip it', e:'🚫'},
        {v:'basic', l:'Basic coffee', e:'☕'},
        {v:'fancy', l:'Specialty lattes/teas', e:'🍵'},
        {v:'multi', l:'Multiple per day', e:'⚡'}
      ],
      impact: a => ({
        drinks: {
          coffee: a==='multi' ? 3 : a==='fancy' ? 2 : a==='basic' ? 1 : 0,
          teaprem: (a==='fancy' || a==='multi') ? 1 : 0
        }
      })
    },
    {
      id:'nonalc', type:'radio', q:'Soft drinks (soda, juice)?', icon:'🥤',
      opts:[
        {v:'none', l:'Rarely', e:'💧'},
        {v:'some', l:'1-2/day', e:'🥤'},
        {v:'reg', l:'3-4/day', e:'🧃'},
        {v:'lots', l:'All day', e:'🥤'}
      ],
      impact: a => ({
        drinks: {
          soda: a==='lots' ? 4 : a==='reg' ? 3 : a==='some' ? 1.5 : 0.5,
          freshjuice: (a==='reg' || a==='lots') ? 1 : 0
        }
      })
    },
    {
      id:'alc', type:'multi', q:'Alcoholic drinks you enjoy?', icon:'🍷',
      opts:[
        {v:'none', l:'None/Rarely', e:'🚫'},
        {v:'beer', l:'Beer', e:'🍺'},
        {v:'wine', l:'Wine', e:'🍷'},
        {v:'cocktail', l:'Cocktails', e:'🍹'},
        {v:'spirits', l:'Spirits', e:'🥃'}
      ],
      impact: ans => {
        const has = v => ans.includes(v);
        return {
          drinks: {
            beer: has('beer') ? 1.5 : 0,
            wine: has('wine') ? 1.5 : 0,
            cocktail: has('cocktail') ? 1.5 : 0,
            spirits: has('spirits') ? 1 : 0
          },
          alcScore: has('none') ? 'none' : ans.length > 2 ? 'high' : 'mod'
        };
      }
    },
    {
      id:'group', type:'radio', q:'Who\'s cruising?', icon:'👥',
      opts:[
        {v:'solo', l:'Solo', e:'🧳'},
        {v:'couple', l:'Couple', e:'💑'},
        {v:'family', l:'Family (kids)', e:'👨‍👩‍👧'},
        {v:'friends', l:'Friends', e:'👯'}
      ],
      cascade: true,
      impact: a => ({
        adults: a==='solo' ? 1 : a==='couple' ? 2 : a==='family' ? 2 : 3,
        minors: a==='family' ? 2 : 0,
        groupType: a
      })
    },
    {
      id:'crown', type:'radio', q:'Crown & Anchor status?', icon:'👑',
      opts:[
        {v:'none', l:'Not Diamond+', e:'⚓'},
        {v:'diamond', l:'Diamond (4 vouchers)', e:'💎'},
        {v:'diamondplus', l:'Diamond+ (5)', e:'💎'},
        {v:'pinnacle', l:'Pinnacle (5)', e:'👑'}
      ],
      impact: a => {
        if (a === 'none') return {};
        const cnt = a === 'diamond' ? 4 : 5;
        return {
          vouchers: {
            level: a,
            count: cnt,
            adultD: a === 'diamond' ? 1 : 0,
            adultDP: a === 'diamondplus' ? 1 : 0,
            adultP: a === 'pinnacle' ? 1 : 0
          }
        };
      }
    }
  ];
  
  function loadQuizModule(){
    let lastFocus = null;
    
    function getFocusable(){
      const m = document.getElementById('quiz-modal');
      return [...m.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')]
        .filter(el => !el.hasAttribute('disabled') && el.offsetParent !== null);
    }
    
    function trapKeydown(e){
      const modal = document.getElementById('quiz-modal');
      if (!modal.classList.contains('show')) return;
      
      const f = getFocusable();
      if (!f.length) return;
      
      const first = f[0], last = f[f.length - 1];
      
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      } else if (e.key === 'Escape') {
        modal.classList.remove('show');
        document.removeEventListener('keydown', trapKeydown, true);
        if (lastFocus) lastFocus.focus();
      }
    }
    
    function init(){
      const saved = load();
      if (saved && !expired(saved)) {
        applyProfile(saved);
        return;
      }
      
      const visited = localStorage.getItem('calc_visited');
      if (!visited) {
        localStorage.setItem('calc_visited', '1');
        show();
      }
    }
    
    function show(){
      quizState = { idx: 0, ans: {}, start: Date.now() };
      const modal = document.getElementById('quiz-modal');
      lastFocus = document.activeElement;
      modal.classList.add('show');
      document.addEventListener('keydown', trapKeydown, true);
      render();
      setTimeout(() => {
        (document.getElementById('quiz-next') || document.getElementById('quiz-title')).focus();
      }, 100);
    }
    
    function render(){
      const q = QUIZ_QUESTIONS[quizState.idx];
      if (!q) {
        finish();
        return;
      }
      
      if (q.showIf && !q.showIf(quizState.ans)) {
        quizState.idx++;
        render();
        return;
      }
      
      const prog = (quizState.idx + 1) / QUIZ_QUESTIONS.length * 100;
      document.getElementById('quiz-progress-bar').style.width = prog + '%';
      
      let html = `<div class="quiz-question" role="radiogroup" aria-labelledby="quiz-q-label">
        <h3 id="quiz-q-label">${q.icon} ${q.q}</h3>
        <div class="quiz-options">`;
      
      if (q.type === 'radio') {
        q.opts.forEach((o, i) => {
          const sel = quizState.ans[q.id] === o.v;
          html += `<div class="quiz-option${sel?' selected':''}" role="radio" aria-checked="${sel}" tabindex="${i===0?0:-1}" data-q="${q.id}" data-v="${o.v}">
            <div class="quiz-option-label">
              <div class="quiz-option-icon">${o.e||''}</div>
              <div>
                <div>${o.l}</div>
                ${o.d ? `<div class="quiz-option-desc">${o.d}</div>` : ''}
              </div>
            </div>
          </div>`;
        });
      } else {
        q.opts.forEach(o => {
          const sel = (quizState.ans[q.id] || []).includes(o.v);
          html += `<div class="quiz-option${sel?' selected':''}" data-q="${q.id}" data-v="${o.v}" data-multi="1">
            <div class="quiz-option-label">
              <div class="quiz-option-icon">${o.e||''}</div>
              <div>${o.l}</div>
            </div>
          </div>`;
        });
      }
      
      html += '</div></div>';
      document.getElementById('quiz-content').innerHTML = html;
      
      // Add keyboard navigation for radio options
      const options = document.querySelectorAll('.quiz-option[role="radio"]');
      options.forEach((opt, i) => {
        opt.addEventListener('keydown', (e) => {
          if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            e.preventDefault();
            const next = options[(i + 1) % options.length];
            next.focus();
            next.click();
          } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            e.preventDefault();
            const prev = options[(i - 1 + options.length) % options.length];
            prev.focus();
            prev.click();
          } else if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            opt.click();
          }
        });
      });
      
      // Click handlers with debounce for multi-select
      let multiSelectDebounce = null;
      document.querySelectorAll('.quiz-option').forEach(el => {
        el.onclick = () => {
          clearTimeout(multiSelectDebounce);
          multiSelectDebounce = setTimeout(() => {
            select(el);
          }, el.dataset.multi ? 150 : 0);
        };
      });
      
      document.getElementById('quiz-back').style.display = quizState.idx > 0 ? '' : 'none';
      document.getElementById('quiz-next').disabled = !quizState.ans[q.id];
      document.getElementById('quiz-next').textContent = quizState.idx === QUIZ_QUESTIONS.length - 1 ? 'Finish ✨' : 'Next →';
    }
    
    function select(el){
      const q = el.dataset.q, v = el.dataset.v, multi = el.dataset.multi;
      
      if (multi) {
        if (!quizState.ans[q]) quizState.ans[q] = [];
        
        if (v === 'none') {
          quizState.ans[q] = ['none'];
          el.parentElement.querySelectorAll('.quiz-option').forEach(o => o.classList.remove('selected'));
          el.classList.add('selected');
        } else {
          quizState.ans[q] = quizState.ans[q].filter(x => x !== 'none');
          if (quizState.ans[q].includes(v)) {
            quizState.ans[q] = quizState.ans[q].filter(x => x !== v);
            el.classList.remove('selected');
          } else {
            quizState.ans[q].push(v);
            el.classList.add('selected');
          }
        }
      } else {
        quizState.ans[q] = v;
        el.parentElement.querySelectorAll('.quiz-option').forEach(o => {
          o.classList.remove('selected');
          o.setAttribute('aria-checked', 'false');
        });
        el.classList.add('selected');
        el.setAttribute('aria-checked', 'true');
        
        setTimeout(() => {
          if (quizState.idx < QUIZ_QUESTIONS.length - 1) next();
        }, 300);
      }
      
      document.getElementById('quiz-next').disabled = !quizState.ans[q] || quizState.ans[q].length === 0;
    }
    
    function next(){
      quizState.idx++;
      render();
    }
    
    function back(){
      quizState.idx--;
      render();
    }
    
    function finish(){
      const profile = calc(quizState.ans);
      save(profile);
      applyProfile(profile);
      
      const modal = document.getElementById('quiz-modal');
      modal.classList.remove('show');
      document.removeEventListener('keydown', trapKeydown, true);
      if (lastFocus) lastFocus.focus();
      
      // Show retake CTA
      const retakeCTA = document.getElementById('quiz-retake-cta');
      if (retakeCTA) retakeCTA.style.display = '';
      
      // Emit analytics event
      document.dispatchEvent(new CustomEvent('quiz:complete', {
        detail: {
          profile: profile.profile,
          duration: Date.now() - quizState.start
        }
      }));
    }
    
    function calc(ans){
      let drinks = {}, meta = {};
      
      QUIZ_QUESTIONS.forEach(q => {
        const a = ans[q.id];
        if (!a) return;
        
        const imp = q.impact(a);
        if (imp.drinks) {
          Object.keys(imp.drinks).forEach(k => {
            drinks[k] = (drinks[k] || 0) + imp.drinks[k];
          });
        }
        Object.assign(meta, imp);
      });
      
      const mult = meta.mult || 1;
      Object.keys(drinks).forEach(k => {
        drinks[k] = Math.round(drinks[k] * mult * 10) / 10;
      });
      
      return {
        v: '2.0',
        ts: Date.now(),
        dur: Date.now() - quizState.start,
        profile: meta.profile || 'balanced',
        drinks,
        adults: meta.adults || 1,
        minors: meta.minors || 0,
        vouchers: meta.vouchers || null,
        answers: ans
      };
    }
    
    function applyProfile(p){
      const get = id => document.getElementById(id);
      if (!get('input-days')) {
        console.error('Calculator inputs not found');
        return;
      }
      
      get('input-adults').value = p.adults || 1;
      get('input-minors').value = p.minors || 0;
      
      Object.entries(p.drinks || {}).forEach(([k,v]) => {
        const inp = document.querySelector(`[data-input="${k}"]`);
        if (inp) inp.value = v;
      });
      
      if (p.vouchers) {
        const cna = get('cna-vouchers') || get('vouchers');
        if (cna) {
          cna.open = true;
          if (p.vouchers.adultD) get('v-adult-d').value = p.vouchers.adultD;
          if (p.vouchers.adultDP) get('v-adult-dp').value = p.vouchers.adultDP;
          if (p.vouchers.adultP) get('v-adult-p').value = p.vouchers.adultP;
        }
      }
      
      if (window.scheduleCalc) window.scheduleCalc();
    }
    
    function save(p){
      try {
        localStorage.setItem(QUIZ_CONFIG.storageKey, JSON.stringify(p));
      } catch(e) {}
    }
    
    function load(){
      try {
        return JSON.parse(localStorage.getItem(QUIZ_CONFIG.storageKey));
      } catch(e) {
        return null;
      }
    }
    
    function expired(p){
      if (!p || !p.ts) return true;
      return Date.now() - p.ts > QUIZ_CONFIG.expiryDays * 86400000;
    }
    
   function skip(){
  localStorage.setItem(QUIZ_CONFIG.storageKey, JSON.stringify({ skipped:true, ts:Date.now() }));
  const modal = document.getElementById('quiz-modal');
  modal.classList.remove('show');
  document.removeEventListener('keydown', trapKeydown, true);
  if (lastFocus) lastFocus.focus();
}

// expose the show() so quizStart can call it
window._itwShowQuiz = show;
    
    document.getElementById('quiz-next').onclick = next;
    document.getElementById('quiz-back').onclick = back;
    
    window.quizSkip = skip;
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }
  
window.quizStart = function(){
  if (!quizLoaded) {
    quizLoaded = true;
    loadQuizModule();
  }
  if (typeof window._itwShowQuiz === 'function') {
    window._itwShowQuiz();
  } else {
    // very defensive fallback
    const modal = document.getElementById('quiz-modal');
    modal?.classList.add('show');
  }
};
  
  window.quizRetake = function(){
    localStorage.removeItem(QUIZ_CONFIG.storageKey);
    window.quizStart();
  };
  
  /* ===== ANALYTICS (GUARDED) ===== */
  (function analytics(){
    const cfg = window.ITW_CFG?.analytics;
    if (!cfg?.enabled) return;
    
    // Calc updated
    store.subscribe('results', (results) => {
      if (!results?.winnerKey) return;
      window.itwTrack?.('calc_updated', {
        winner: results.winnerKey,
        perDay: Math.round(results.perDay),
        currency: getCurrency()
      });
    });
    
    // Quiz complete
    document.addEventListener('quiz:complete', (e) => {
      window.itwTrack?.('quiz_complete', {
        profile: e.detail?.profile,
        duration: e.detail?.duration
      });
    });
    
    // Preset loaded
    document.addEventListener('preset:loaded', (e) => {
      window.itwTrack?.('preset_load', {
        preset: e.detail?.name
      });
    });
    
    // Share clicked
    const originalShare = window.shareScenario;
    if (typeof originalShare === 'function') {
      window.shareScenario = function(){
        window.itwTrack?.('share_scenario', {
          currency: getCurrency()
        });
        return originalShare.apply(this, arguments);
      };
    }
  })();
  
  /* ===== PACKAGE PRICE BADGES (ECONOMICS UPDATES) ===== */
  (function packageBadges(){
    function update(){
      const economics = store.get().economics;
      
      const badges = [
        { sel: '[data-pkg-price="soda"]', val: economics.pkg.soda },
        { sel: '[data-pkg-price="refresh"]', val: economics.pkg.refresh },
        { sel: '[data-pkg-price="deluxe"]', val: economics.pkg.deluxe }
      ];
      
      badges.forEach(({ sel, val }) => {
        const el = document.querySelector(sel);
        if (el) el.textContent = money(val);
      });
      
      const cap = document.getElementById('cap-badge');
      if (cap) cap.textContent = `$${economics.deluxeCap.toFixed(2)}`;
    }
    
    store.subscribe('economics', update);
  })();
  
  console.log('[ITW UI v.9.002.003] Consolidated UI glue loaded — Soli Deo Gloria');
})();
