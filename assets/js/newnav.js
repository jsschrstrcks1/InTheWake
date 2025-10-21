/* /assets/js/newnav.js — Unified Nav v3.009.006
   Soli Deo Gloria. */
(function(){
  // Ready helper (handles defer or inline)
  function ready(fn){
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once:true });
    } else { fn(); }
  }

  function firstFocusable(root){
    return root.querySelector('a,button,[role="menuitem"],[tabindex]:not([tabindex="-1"])');
  }

  function closeAll(except){
    document.querySelectorAll('.nav-group[data-open="true"]').forEach(g=>{
      if(g!==except){
        g.dataset.open = 'false';
        const b = g.querySelector('.nav-disclosure');
        if (b) b.setAttribute('aria-expanded','false');
      }
    });
  }

  function asDisclosure(el){
    // Support <button> or <a> used as a button
    if (el.tagName === 'A') {
      el.setAttribute('role','button');
      el.setAttribute('tabindex','0');
      // prevent accidental navigation if someone left href
      if (!el.hasAttribute('href')) el.setAttribute('href','#');
    }
    return el;
  }

  function wire(group){
    const btn  = asDisclosure(group.querySelector('.nav-disclosure'));
    const menu = group.querySelector('.submenu');
    if(!btn || !menu) return;

    btn.setAttribute('aria-haspopup','true');
    btn.setAttribute('aria-expanded','false');
    menu.setAttribute('role','menu');

    function open(state){
      const on = !!state;
      group.dataset.open = on ? 'true' : 'false';
      btn.setAttribute('aria-expanded', String(on));
      if (on) closeAll(group);
    }

    // Toggle on click / press
    btn.addEventListener('click', e=>{
      // If it's an <a>, never navigate
      if (btn.tagName === 'A') e.preventDefault();
      open(group.dataset.open !== 'true');
    });

    // Outside click closes
    document.addEventListener('click', e=>{
      if (!group.contains(e.target)) open(false);
    });

    // Keyboard on button/anchor
    btn.addEventListener('keydown', e=>{
      const k = e.key;
      if (k === 'Enter' || k === ' ' || k === 'ArrowDown'){
        e.preventDefault();
        open(true);
        (firstFocusable(menu) || btn).focus();
      } else if (k === 'Escape'){
        open(false); btn.focus();
      } else if (k === 'ArrowUp' && group.dataset.open === 'true'){
        e.preventDefault();
        (firstFocusable(menu) || btn).focus();
      }
    });

    // Menu key handling
    menu.addEventListener('keydown', e=>{
      if (e.key === 'Escape'){ e.preventDefault(); open(false); btn.focus(); }
      if (e.key === 'ArrowUp' && e.target === firstFocusable(menu)){
        e.preventDefault(); btn.focus();
      }
    });

    // Pointer hover enhancement (doesn't affect touch)
    if (matchMedia('(hover:hover)').matches){
      group.addEventListener('mouseenter', ()=>open(true));
      group.addEventListener('mouseleave', ()=>open(false));
    }
  }

  ready(function(){
    document.querySelectorAll('.nav-group').forEach(wire);
  });
})();
