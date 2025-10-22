
(function(){
  'use strict';

 
  const on = (el, evt, fn, opts) => el && el.addEventListener(evt, fn, opts || false);
  const qs = (sel, root=document) => root.querySelector(sel);
  const qsa = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  const ready = (fn)=> (document.readyState === 'loading')
    ? document.addEventListener('DOMContentLoaded', fn, {once:true})
    : fn();

  function closeGroup(group){
    if(!group) return;
    group.dataset.open = 'false';
    const btn = qs('.nav-disclosure', group);
    btn && btn.setAttribute('aria-expanded', 'false');
  }
  function openGroup(group){
    if(!group) return;
    group.dataset.open = 'true';
    const btn = qs('.nav-disclosure', group);
    btn && btn.setAttribute('aria-expanded', 'true');
  }
  function toggleGroup(group){
    if(!group) return;
    const isOpen = group.dataset.open === 'true';
    (isOpen ? closeGroup : openGroup)(group);
  }

 
  function wireNav(){

    qsa('.navbar').forEach(n=>{ n.style.overflow = 'visible'; });

    const groups = qsa('.nav-group');
    if(!groups.length){
      console.warn('[In the Wake] newnav.js: no .nav-group elements found.');
      return;
    }

    groups.forEach((group, ix)=>{
      const btn  = qs('.nav-disclosure', group);
      const menu = qs('.submenu', group);
      if(!btn || !menu) return;


      let menuId = menu.id || `menu-${ix+1}`;
      menu.id = menuId;
      btn.setAttribute('type','button');         
      btn.setAttribute('aria-controls', menuId);
      btn.setAttribute('aria-expanded','false');
      group.dataset.open = 'false';

    
      on(btn, 'click', (e)=>{ e.preventDefault(); e.stopPropagation(); toggleGroup(group); });


      on(btn, 'keydown', (e)=>{
        if(e.key === 'ArrowDown'){ e.preventDefault(); openGroup(group); qs('a,button,[tabindex]:not([tabindex="-1"])', menu)?.focus(); }
        if(e.key === 'Escape'){ e.preventDefault(); closeGroup(group); btn.focus(); }
      });
      on(menu, 'keydown', (e)=>{
        if(e.key === 'Escape'){ e.preventDefault(); closeGroup(group); btn.focus(); }
      });


      on(document, 'click', (e)=>{ if(!group.contains(e.target)) closeGroup(group); });


      on(menu, 'focusout', ()=> setTimeout(()=>{
        const within = group.contains(document.activeElement);
        if(!within) closeGroup(group);
      }, 0));
    });


    window._InTheWakeNavTest = { wired: groups.length, ts: Date.now() };
    console.log(`[In the Wake] newnav.js wired ${groups.length} dropdown group(s).`);
  }

  ready(wireNav);
})();
