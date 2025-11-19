

(()=> {
  'use strict';

  /* ============================================================
   * v10 EXTRAS — Personas, Range/Stepper, Explain, Package Cards,
   * Email capture, Simple/Advanced modes (sea-day slider + grid) assets/js/calculator.v10-extras.js
   * ============================================================ */

  // ---- Guard (requires v10 app) ----
  if (!window.ITW || !window.ITW.store || !window.ITW.money) {

    return;
  }

  const store = window.ITW.store;
  const money = window.ITW.money;
  const getCurrency = window.ITW.getCurrency || (()=>'USD');
  const fxApproxPrefix = window.ITW.fxApproxPrefix || (()=>'');
  const MAX_GUESTS = 6;
  const DRINK_KEYS = ['soda','coffee','teaprem','freshjuice','mocktail','energy','milkshake','bottledwater','beer','wine','cocktail','spirits'];
  const DRINK_LABELS = {
    soda:'Soda', coffee:'Premium Coffee', teaprem:'Specialty Tea', freshjuice:'Fresh Juice/Smoothie',
    mocktail:'Mocktail', energy:'Energy Drink', milkshake:'Milkshake', bottledwater:'Bottled Water',
    beer:'Beer', wine:'Wine (glass)', cocktail:'Cocktail', spirits:'Spirits/Shot'
  };

  // ---- Host ----
  const host = document.createElement('section');
  host.id = 'itw-extras-host';
  host.setAttribute('aria-label','Enhanced Calculator Extras');
  host.style.margin = '1.5rem 0';
  document.body.appendChild(host);

  // ---- Security helpers ----
  const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
  const asInt = (v, lo=0, hi=99999)=> clamp(Number.isFinite(+v) ? Math.floor(+v) : 0, lo, hi);

  // Range-aware quantity: "2-3" => 2.5, also supports decimals
  function parseQty(input) {
    if (input == null) return 0;
    let s = String(input).trim().replace(/[\u2012-\u2015\u2212]/g,'-').replace(/\s+/g,' ');
    const m = s.match(/^(\d*\.?\d+)\s*-\s*(\d*\.?\d+)$/);
    if (m) {
      const a = +m[1], b = +m[2]; 
      return (isFinite(a)&&isFinite(b)) ? Math.max(0,(a+b)/2) : 0;
    }
    const cleaned = s.replace(/[,\u00a0\u202f]/g,'');
    return /^\d*\.?\d+$/.test(cleaned) ? Math.max(0, +cleaned) : 0;
  }

  // ---- Lightweight styles (scoped via ids/classes) ----
  const style = document.createElement('style');
  style.textContent = `
  #itw-extras-host { font-family: inherit; }
  .itw-card { background:#fff; border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,.08); padding:1rem; margin-bottom:1rem; }
  .itw-row { display:grid; gap:.75rem; }
  .itw-grid-2 { grid-template-columns: repeat(2, minmax(0,1fr)); }
  @media (max-width:720px){ .itw-grid-2{ grid-template-columns: 1fr; } }
  .itw-pill { padding:.5rem .75rem; border:1px solid #d9b382; border-radius:8px; background:#fff; cursor:pointer; }
  .itw-pill.active { background:#0e6e8e; color:#fff; border-color:#0e6e8e; }
  .itw-stepper { display:flex; align-items:center; gap:.5rem; }
  .itw-stepper input { width:90px; text-align:center; padding:.5rem; border:1px solid #cbd5e1; border-radius:6px; }
  .itw-btn { min-height:44px; border-radius:8px; padding:.75rem 1rem; border:0; background:#0e6e8e; color:#fff; font-weight:600; cursor:pointer; }
  .itw-btn.secondary { background:#083041; }
  .itw-chip { display:inline-block; padding:.25rem .5rem; border-radius:999px; background:#fff3cd; border:1px solid #ffe08a; font-size:.85rem; }
  .itw-cards { display:grid; gap:1rem; grid-template-columns: repeat(auto-fit, minmax(260px,1fr)); }
  .itw-pkg { border:2px solid #d9b382; border-radius:12px; overflow:hidden; background:#1f2937; color:#e6edf3; }
  .itw-pkg .hd { background:#0b2940; padding:.75rem 1rem; border-bottom:2px solid #d9b382; }
  .itw-pkg .bd { padding:1rem; }
  .itw-pkg .price { font-size:1.4rem; color:#d9b382; font-weight:700; }
  .itw-pkg.winner { box-shadow:0 0 16px rgba(16,185,129,.3); border-color:#10b981; }
  .itw-pkg.winner:before { content:'🏆 Best Value'; position:absolute; right:0; top:0; background:#10b981; color:#fff; padding:.25rem .5rem; font-size:.8rem; font-weight:700; border-bottom-left-radius:8px; }
  .itw-note { font-size:.9rem; background:#dbeafe; border-left:4px solid #0e6e8e; padding:.75rem; border-radius:6px; }
  .itw-slider-wrap { display:grid; gap:.5rem; }
  .itw-table { width:100%; border-collapse:collapse; }
  .itw-table th,.itw-table td{ border:1px solid #e5e7eb; padding:.5rem; text-align:center; }
  `;
  document.head.appendChild(style);

  // ---- Personas (quick start) ----
  const PRESETS = {
    girls: { name:'Girls Trip 👯‍♀️', drinks:{ soda:0, coffee:2, teaprem:0, freshjuice:1, mocktail:.5, energy:0, milkshake:0, bottledwater:2, beer:0, wine:2, cocktail:3, spirits:0 } },
    boys: { name:'Boys Trip 🍺', drinks:{ soda:1, coffee:1, teaprem:0, freshjuice:0, mocktail:0, energy:.5, milkshake:0, bottledwater:2, beer:5, wine:1, cocktail:2, spirits:1 } },
    family:{ name:'Family Vacation 👨‍👩‍👧‍👦', drinks:{ soda:2, coffee:2, teaprem:0, freshjuice:2, mocktail:1, energy:0, milkshake:1, bottledwater:3, beer:1, wine:1, cocktail:1, spirits:0 } },
    coffee:{ name:'Coffee Lover ☕', drinks:{ soda:0, coffee:4, teaprem:1, freshjuice:1, mocktail:1, energy:0, milkshake:0, bottledwater:2, beer:0, wine:1, cocktail:1, spirits:0 } },
    moderate:{ name:'Moderate Drinker 🍷', drinks:{ soda:1, coffee:2, teaprem:0, freshjuice:1, mocktail:1, energy:0, milkshake:0, bottledwater:2, beer:2, wine:2, cocktail:2, spirits:0 } },
    party:{ name:'Party Mode 🎉', drinks:{ soda:1, coffee:1, teaprem:0, freshjuice:0, mocktail:0, energy:1, milkshake:0, bottledwater:2, beer:3, wine:1, cocktail:5, spirits:2 } },
    light:{ name:'Light Drinker 🥤', drinks:{ soda:2, coffee:2, teaprem:1, freshjuice:2, mocktail:2, energy:0, milkshake:.5, bottledwater:3, beer:0, wine:1, cocktail:.5, spirits:0 } },
    nonalc:{ name:'Non-Alcoholic 🚫🍺', drinks:{ soda:2, coffee:3, teaprem:1, freshjuice:2, mocktail:2, energy:0, milkshake:1, bottledwater:3, beer:0, wine:0, cocktail:0, spirits:0 } },
    minimal:{ name:'Minimalist 💧', drinks:{ soda:0, coffee:2, teaprem:0, freshjuice:0, mocktail:0, energy:0, milkshake:0, bottledwater:4, beer:0, wine:0, cocktail:0, spirits:0 } }
  };

  // ---- Build UI -------------------------------------------------
  host.innerHTML = '';
  host.appendChild(cardQuickStart());
  host.appendChild(cardModes());
  host.appendChild(cardExplain());
  host.appendChild(cardPackages());
  host.appendChild(cardEmail());

  // Quick Start Card
  function cardQuickStart(){
    const card = el('div',{class:'itw-card', id:'itw-card-presets'});
    card.appendChild(el('h2',{},'🚀 Quick Start'));
    card.appendChild(el('p',{style:'margin:.25rem 0 1rem;color:#64748b'},'Pick a profile to prefill your daily averages (you can tweak anytime).'));

    const pillRow = el('div',{class:'itw-row', style:'grid-template-columns:repeat(auto-fit,minmax(140px,1fr)); gap:.5rem;'});
    Object.entries(PRESETS).forEach(([k,p])=>{
      const btn = el('button',{class:'itw-pill', type:'button', 'data-key':k}, p.name);
      btn.addEventListener('click', ()=> applyPreset(k, btn, pillRow));
      pillRow.appendChild(btn);
    });
    card.appendChild(pillRow);

    const details = el('div',{id:'itw-preset-details', style:'margin-top:.75rem;'});
    card.appendChild(details);
    return card;
  }

  function applyPreset(key, btn, container){
    container.querySelectorAll('.itw-pill').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const preset = PRESETS[key];
    if (!preset) return;

    // Patch store.inputs.drinks with integers (v10 expects numbers)
    const inputs = store.get('inputs');
    const next = {...inputs, drinks: {...inputs.drinks}};
    for (const k of DRINK_KEYS) {
      const val = preset.drinks[k] ?? 0;
      next.drinks[k] = clamp(Math.round(val), 0, 99);
    }
    store.patch('inputs', next);

    // Details list
    const ul = el('ul',{style:'margin:.5rem 0 0 1rem;line-height:1.7;'});
    Object.entries(preset.drinks).forEach(([k,v])=>{
      if (v>0) ul.appendChild(el('li',{},`${DRINK_LABELS[k]||k}: ${v}/day`));
    });
    const hostD = byId('itw-preset-details'); hostD.innerHTML=''; 
    hostD.appendChild(el('div',{class:'itw-note'},'Preset loaded — feel free to tweak below.'));
    hostD.appendChild(ul);
  }

  // Modes Card (Simple / Advanced)
  function cardModes(){
    const card = el('div',{class:'itw-card', id:'itw-card-modes'});
    card.appendChild(el('h2',{},'🍹 Input Mode'));
    const toggleRow = el('div',{class:'itw-row itw-grid-2', style:'align-items:center;'});
    const left = el('div',{}, labelStrong('Simple Mode'), el('div',{style:'color:#64748b;font-size:.95rem;'},'Answer a few questions, then fine-tune with a sea-day slider (+/- up to 40%).'));
    const right = el('div',{}, labelStrong('Advanced Mode'), el('div',{style:'color:#64748b;font-size:.95rem;'},'Set your expected drinks per day, per beverage, across the full itinerary.'));
    toggleRow.appendChild(left); toggleRow.appendChild(right);

    const actionRow = el('div',{class:'itw-row', style:'grid-template-columns:repeat(2, minmax(0,1fr));gap:.5rem;margin-top:.5rem;'});
    const btnSimple = el('button',{class:'itw-btn', type:'button'},'Use Simple');
    const btnAdvanced = el('button',{class:'itw-btn secondary', type:'button'},'Use Advanced');
    actionRow.appendChild(btnSimple); actionRow.appendChild(btnAdvanced);

    // Simple Panel
    const simple = el('div',{id:'itw-simple', class:'itw-card'});
    simple.appendChild(el('h3',{},'Simple Inputs'));
    simple.appendChild(simpleForm());
    simple.appendChild(simpleSlider()); // sea-day weighting

    // Advanced Panel
    const adv = el('div',{id:'itw-advanced', class:'itw-card', style:'display:none;'});
    adv.appendChild(el('h3',{},'Advanced: Day-by-Day Editor'));
    adv.appendChild(advancedGrid());

    btnSimple.addEventListener('click', ()=>{ simple.style.display='block'; adv.style.display='none'; });
    btnAdvanced.addEventListener('click', ()=>{ adv.style.display='block'; simple.style.display='none'; });

    card.appendChild(toggleRow);
    card.appendChild(actionRow);
    card.appendChild(simple);
    card.appendChild(adv);
    return card;
  }

  function simpleForm(){
    const wrap = el('div',{class:'itw-row itw-grid-2', style:'margin:.5rem 0;'});
    // Cruise details
    const i = store.get('inputs');
    const days = elInputNumber('Cruise length (days)', i.days, 1, 365, v=>{
      patchInputs({ days: asInt(v,1,365), seaDays: clamp(asInt(byId('itw-simple-seadays').value,0,365), 0, asInt(v,1,365)) });
    });
    const sea = elInputNumber('Sea days', i.seaDays, 0, i.days, v=>{
      const d = store.get('inputs').days;
      patchInputs({ seaDays: clamp(asInt(v,0,365), 0, d) });
    }, 'itw-simple-seadays');
    const adults = elInputNumber('Adults (21+)', i.adults, 1, 20, v=> patchInputs({ adults: asInt(v,1,20) }));
    const minors = elInputNumber('Minors (<21)', i.minors, 0, 20, v=> patchInputs({ minors: asInt(v,0,20) }));
    wrap.appendChild(days); wrap.appendChild(sea); 
    wrap.appendChild(adults); wrap.appendChild(minors);

    // Averages block with steppers (range-aware)
    const avg = el('div',{class:'itw-row', style:'margin-top:.75rem;'});
    avg.appendChild(el('h4',{},'Your daily averages'));
    DRINK_KEYS.forEach(key=>{
      avg.appendChild(stepperRow(key));
    });

    // Calculate CTA
    const cta = el('div',{style:'text-align:center;margin-top:1rem;'});
    const btn = el('button',{class:'itw-btn', type:'button'},'Calculate');
    btn.addEventListener('click', ()=> { /* touching inputs triggers calc via app */ nudgeCalc(); });
    cta.appendChild(btn);

    const block = el('div',{});
    block.appendChild(wrap);
    block.appendChild(avg);
    block.appendChild(cta);
    return block;
  }

  function simpleSlider(){
    const inputs = store.get('inputs');
    const wrap = el('div',{class:'itw-card'});
    wrap.appendChild(el('h4',{},'Sea-Day Weighting'));
    wrap.appendChild(el('p',{style:'color:#64748b;'}, 
      'This slider shows how your drinking may vary on sea days. We project slightly higher consumption on sea days for many cruisers — but port days can be big fun too. (Easy does it; hangovers can make port days less magical.)'
    ));

    const line = el('div',{class:'itw-slider-wrap'});
    const lbl = el('div',{}, el('span',{class:'itw-chip', id:'itw-chip-weight'}, `Sea day adjustment: ${inputs.seaWeight ?? 20}%`));
    const slider = el('input',{type:'range', min:'0', max:'40', step:'1', value:String(inputs.seaWeight ?? 20), id:'itw-slider-sea'});
    slider.addEventListener('input', ()=>{
      const v = asInt(slider.value,0,40);
      byId('itw-chip-weight').textContent = `Sea day adjustment: ${v}%`;
    });
    slider.addEventListener('change', ()=>{
      const v = asInt(slider.value,0,40);
      patchInputs({ seaWeight: v, seaApply: true });
      nudgeCalc();
    });
    line.appendChild(lbl); line.appendChild(slider);
    wrap.appendChild(line);
    return wrap;
  }

  function advancedGrid(){
    // days x drink keys editor — writes back to inputs.drinks as per-day averages
    const shell = el('div',{});
    const explain = el('p',{style:'color:#64748b;margin:.25rem 0 1rem;'},
      'Enter your expected drinks by day. We’ll average them and feed the engine. Use whole numbers for now; you can paste numbers safely (HTML is stripped).');

    const inputs = store.get('inputs');
    const days = clamp(inputs.days||7,1,365);
    const tbl = el('table',{class:'itw-table', id:'itw-adv-table'});
    const thead = el('thead',{}); const htr = el('tr',{});
    htr.appendChild(el('th',{},'Day'));
    DRINK_KEYS.forEach(k=> htr.appendChild(el('th',{}, DRINK_LABELS[k]||k)));
    thead.appendChild(htr);
    tbl.appendChild(thead);

    const tbody = el('tbody',{});
    for (let d=1; d<=Math.min(days, 14); d++){ // show first 14 days (common cruise lengths)
      const tr = el('tr',{}); tr.appendChild(el('td',{}, String(d)));
      DRINK_KEYS.forEach(k=>{
        const td = el('td',{}); 
        const inp = el('input',{type:'text', inputmode:'numeric', pattern:'[0-9.\\- ]*', 'data-day':String(d), 'data-key':k, style:'width:70px;'});
        sanitizeWires(inp);
        td.appendChild(inp);
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    }
    tbl.appendChild(tbody);

    const controls = el('div',{style:'display:flex; gap:.5rem; margin-top:.75rem; justify-content:flex-end;'});
    const btnAvg = el('button',{class:'itw-btn secondary', type:'button'},'Apply to Calculator');
    btnAvg.addEventListener('click', ()=>{
      // Average columns → patch inputs.drinks
      const sums = Object.fromEntries(DRINK_KEYS.map(k=>[k,0]));
      const count = tbody.querySelectorAll('tr').length;
      tbody.querySelectorAll('input').forEach(inp=>{
        const k = inp.getAttribute('data-key');
        sums[k] += parseQty(inp.value);
      });
      const avg = Object.fromEntries(DRINK_KEYS.map(k=>[k, clamp(Math.round(sums[k] / Math.max(1,count)), 0, 99)]));
      const curr = store.get('inputs');
      store.patch('inputs', {...curr, drinks:{...curr.drinks, ...avg}});
      nudgeCalc();
    });

    controls.appendChild(btnAvg);

    shell.appendChild(explain);
    shell.appendChild(tbl);
    shell.appendChild(controls);
    return shell;
  }

  // ---- Explain-my-result card ----
  function cardExplain(){
    const card = el('div',{class:'itw-card', id:'itw-explain', style:'display:none;'});
    card.appendChild(el('h2',{},'🔍 Explain My Result'));
    card.appendChild(el('div',{id:'itw-explain-body', class:'itw-note'}));
    return card;
  }

  // ---- Package cards ----
  function cardPackages(){
    const card = el('div',{class:'itw-card', id:'itw-packages', style:'display:none;'});
    card.appendChild(el('h2',{},'Package Comparison'));
    const chips = el('div',{style:'margin:.25rem 0 1rem;'});
    chips.appendChild(el('span',{id:'itw-fx-chip', class:'itw-chip', style:'display:none;'},'⚠️ Offline rates'));
    card.appendChild(chips);
    card.appendChild(el('div',{class:'itw-cards', id:'itw-cards-host'}));
    return card;
  }

  // ---- Email capture ----
  function cardEmail(){
    const card = el('div',{class:'itw-card', id:'itw-email', style:'display:none;'});
    card.appendChild(el('h2',{},'📧 Save This Analysis'));
    const form = el('form',{id:'itw-email-form', method:'POST', action:''});
    const row = el('div',{class:'itw-row', style:'grid-template-columns:2fr 1fr;gap:.5rem;'});
    const email = el('input',{type:'email', name:'EMAIL', required:'', placeholder:'you@example.com', style:'min-height:44px;border:1px solid #cbd5e1;border-radius:6px;padding:.75rem;'});
    const btn = el('button',{type:'submit', class:'itw-btn'},'Email My Results');
    row.appendChild(email); row.appendChild(btn);
    form.appendChild(row);
    form.appendChild(el('input',{type:'hidden', name:'SAVINGS', id:'itw-email-savings'}));
    form.appendChild(el('input',{type:'hidden', name:'RECOMMENDATION', id:'itw-email-rec'}));
    form.appendChild(el('input',{type:'hidden', name:'CRUISE_DAYS', id:'itw-email-days'}));
    form.appendChild(el('input',{type:'hidden', name:'CALC_URL', id:'itw-email-url'}));
    form.addEventListener('submit',(e)=>{
      e.preventDefault();
      // You can wire your Brevo/Formspree endpoint here:

      alert('Email capture is not configured in this demo.');
    });
    card.appendChild(form);
    return card;
  }

  // ---- Wiring: steppers & sanitizers in Simple mode ----
  function stepperRow(key){
    const row = el('div',{class:'itw-row', style:'grid-template-columns:1fr auto auto; align-items:center; gap:.75rem; border-bottom:1px solid #e5e7eb; padding:.5rem 0;'});
    row.appendChild(el('div',{}, DRINK_LABELS[key] || key));
    row.appendChild(el('div',{class:'itw-stepper'}, 
      (()=>{
        const minus = el('button',{type:'button', class:'itw-pill', style:'width:44px; text-align:center;'},'−');
        const input = el('input',{type:'text', id:`itw-step-${key}`, value: String(store.get('inputs')?.drinks?.[key] ?? 0), 'aria-label':`${DRINK_LABELS[key]||key} per day`});
        const plus = el('button',{type:'button', class:'itw-pill', style:'width:44px; text-align:center;'},'+');

        sanitizeWires(input);
        const apply = ()=>{
          const qty = parseQty(input.value);
          const curr = store.get('inputs');
          const next = {...curr, drinks:{...curr.drinks, [key]: clamp(Math.round(qty),0,99)}};
          store.patch('inputs', next);
          // do not force calc immediately — let user press Calculate, or subscribe to changes if desired
        };
        input.addEventListener('change', apply);
        minus.addEventListener('click', ()=>{ input.value = String(Math.max(0, Math.round(parseQty(input.value))-1)); apply(); });
        plus.addEventListener('click', ()=>{ input.value = String(Math.min(99, Math.round(parseQty(input.value))+1)); apply(); });

        const wrap = el('div',{}); 
        wrap.appendChild(minus); wrap.appendChild(input); wrap.appendChild(plus);
        return wrap;
      })()
    ));
    return row;
  }

  // ---- Security on text inputs (strip tags/handlers) ----
  function sanitizeWires(input){
    input.addEventListener('paste', (e)=>{
      e.preventDefault();
      const text = (e.clipboardData||window.clipboardData).getData('text');
      input.value = String(text||'').replace(/<script[^>]*>.*?<\/script>/gi,'').replace(/<[^>]+>/g,'').slice(0,64);
      input.dispatchEvent(new Event('change'));
    });
    input.addEventListener('drop', (e)=> e.preventDefault());
    input.addEventListener('keydown', (e)=>{
      // Allow digits, ., -, space, nav keys
      const allowed = ['Backspace','Delete','ArrowLeft','ArrowRight','Tab','Enter','Escape',' ','-','.'];
      if (allowed.includes(e.key) || /^\d$/.test(e.key)) return;
      e.preventDefault();
    });
  }

  // ---- Packages render from engine results ----
  function renderPackages(results){
    const card = byId('itw-packages');
    const host = byId('itw-cards-host');
    if (!results || !results.bars) { card.style.display='none'; return; }
    card.style.display = 'block';
    host.innerHTML='';

    // Derive per-package daily cost from bars.mean if present
    const days = store.get('inputs')?.days ?? 7;
    const bars = results.bars;
    const pkgs = [
      { key:'alc',      name:'À-la-carte' },
      { key:'soda',     name:'Classic Soda' },
      { key:'refresh',  name:'Refreshment' },
      { key:'deluxe',   name:'Deluxe (Alcoholic)' },
    ].filter(x => bars[x.key]);

    // Build models
    const rows = pkgs.map(p=>{
      const perDay = normNumber(bars[p.key]?.mean ?? 0);
      return {
        key: p.key,
        name: p.name,
        perDay,
        trip: perDay * days
      };
    });

    // Find winner by lowest trip
    let winnerKey = (results.winnerKey && pkgs.find(p=>p.key===results.winnerKey)) ? results.winnerKey
                   : rows.reduce((min, r)=> r.trip < (rows.find(x=>x.key===min)?.trip ?? Infinity) ? r.key : min, 'alc');

    const alcTrip = rows.find(r=>r.key==='alc')?.trip ?? 0;

    rows.forEach(r=>{
      const cardEl = el('div',{class:'itw-pkg'+(r.key===winnerKey?' winner':''), style:'position:relative;'});
      cardEl.appendChild(el('div',{class:'hd'}, el('h3',{},r.name)));
      const bd = el('div',{class:'bd'});
      bd.appendChild(el('div',{class:'price'}, `${fxApproxPrefix()}${money(r.perDay,{currency:getCurrency()})} `, el('span',{style:'font-size:.9rem;opacity:.85;'},'/day')));
      bd.appendChild(el('div',{style:'color:#94a3b8;margin:.25rem 0;'}, `Total: ${fxApproxPrefix()}${money(r.trip,{currency:getCurrency()})}`));
      if (r.key!=='alc'){
        const savings = alcTrip - r.trip;
        const note = savings >= 0 ? `✓ You’d save ${fxApproxPrefix()}${money(savings,{currency:getCurrency()})} vs à-la-carte`
                                  : `You’d overspend ${fxApproxPrefix()}${money(Math.abs(savings),{currency:getCurrency()})} vs à-la-carte`;
        bd.appendChild(el('div',{class:'itw-note', style:`border-left-color:${savings>=0?'#10b981':'#ef4444'}; background:${savings>=0?'rgba(16,185,129,.08)':'rgba(239,68,68,.08)'};`}, note));
      } else {
        bd.appendChild(el('div',{class:'itw-note'}, 'Pay only for what you drink — most flexible.'));
      }
      cardEl.appendChild(bd);
      host.appendChild(cardEl);
    });

    // FX staleness chip (reads ui flag from store if present)
    const fxChip = byId('itw-fx-chip');
    const ui = store.get('ui')||{};
    fxChip.style.display = (ui.fxStale && getCurrency()!=='USD') ? 'inline-block' : 'none';
  }

  function normNumber(n){ return Number.isFinite(+n) ? +n : 0; }

  // ---- Explain-my-result ----
  function renderExplain(results){
    const card = byId('itw-explain');
    const body = byId('itw-explain-body');
    if (!results || !results.bars) { card.style.display = 'none'; return; }
    card.style.display = 'block';
    const days = store.get('inputs')?.days ?? 7;
    const perDay = results.perDay ?? (results.bars.alc?.mean ?? 0);
    const winner = results.winnerKey || 'alc';
    const label = {alc:'à-la-carte', soda:'Soda package', refresh:'Refreshment package', deluxe:'Deluxe package'}[winner] || 'option';
    body.textContent = `Based on your answers, the best value appears to be ${label}, at about ${fxApproxPrefix()}${money(perDay,{currency:getCurrency()})} per day for your ${days}-day cruise.`;
  }

  // ---- Email capture visibility heuristic ----
  function maybeShowEmail(results){
    const card = byId('itw-email');
    if (!results || !results.bars) { card.style.display='none'; return; }
    const days = store.get('inputs')?.days ?? 7;
    const alc = (results.bars.alc?.mean ?? 0) * days;
    const d = (results.bars.deluxe?.mean ?? Infinity) * days;
    const r = (results.bars.refresh?.mean ?? Infinity) * days;
    const best = Math.min(alc, d, r);
    const savings = Math.max(0, (alc - best));
    const totalDrinksPerDay = Object.values(store.get('inputs')?.drinks||{}).reduce((a,b)=>a+(Number(b)||0),0);

    const shouldShow = (savings > 30) || (totalDrinksPerDay > 4);
    card.style.display = shouldShow ? 'block' : 'none';

    if (shouldShow){
      byId('itw-email-savings').value = String(savings.toFixed(2));
      byId('itw-email-rec').value = (best===d?'Deluxe':best===r?'Refreshment':'À-la-carte');
      byId('itw-email-days').value = String(days);
      byId('itw-email-url').value = window.location.href;
    }
  }

  // ---- Subscribe to store for results ----
  store.subscribe('results', (now)=>{
    renderExplain(now);
    renderPackages(now);
    maybeShowEmail(now);
  });

  // ---- Utilities ----
  function el(tag, attrs={}, ...children){
    const node = document.createElement(tag);
    for (const [k,v] of Object.entries(attrs||{})) {
      if (v==null) continue;
      if (k==='class') node.className = v;
      else if (k==='style' && typeof v==='object') Object.assign(node.style, v);
      else node.setAttribute(k, String(v));
    }
    children.forEach(c=>{
      if (c==null) return;
      if (typeof c === 'string') node.appendChild(document.createTextNode(c));
      else node.appendChild(c);
    });
    return node;
  }
  function byId(id){ return document.getElementById(id); }
  function labelStrong(txt){ const s=el('strong',{},txt); return s; }

  // Write inputs patch safely (keeps other fields)
  function patchInputs(partial){
    const curr = store.get('inputs') || {};
    const next = {...curr, ...partial};
    if (partial.drinks) next.drinks = {...curr.drinks, ...partial.drinks};
    store.patch('inputs', next);
  }

  // Best-effort calc nudge: tweak a benign value to trigger app debounce if needed
  function nudgeCalc(){
    // Changing and restoring a dummy value ensures a recalculation without reaching into app internals
    const curr = store.get('inputs');
    const t = (curr.drinks?.soda ?? 0);
    const tmp = clamp((t+1),0,99);
    store.patch('inputs', {...curr, drinks:{...curr.drinks, soda: tmp}});
    // restore next microtask
    queueMicrotask(()=> store.patch('inputs', {...store.get('inputs'), drinks:{...store.get('inputs').drinks, soda: t}}));
  }

  // ---- Initial paint based on current state ----
  renderExplain(store.get('results'));
  renderPackages(store.get('results'));
  maybeShowEmail(store.get('results'));
})();
