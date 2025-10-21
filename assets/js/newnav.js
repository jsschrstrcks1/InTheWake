/* Unified Nav v3.009 — disclosure menus
   Soli Deo Gloria.  */
(function(){
  // Run once the DOM is ready (defer-safe and non-defer-safe)
  function ready(fn){
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else { fn(); }
  }

  function closeAll(except){
    document.querySelectorAll('.nav-group[data-open="true"]').forEach(g=>{
      if (g !== except) {
        g.dataset.open = 'false';
        const btn = g.querySelector('.nav-disclosure');
        if (btn) btn.setAttribute('aria-expanded','false');
      }
    });
  }

  function wire(group){
    const btn  = group.querySelector('.nav-disclosure');
    const menu = group.querySelector('.submenu');
    if(!btn || !menu) return;

    // Initial ARIA
    btn.setAttribute('aria-expanded','false');
    btn.setAttribute('aria-haspopup','true');
    menu.setAttribute('role','menu');

    const open = (state) => {
      const on = !!state;
      group.dataset.open = on ? 'true' : 'false';
      btn.setAttribute('aria-expanded', String(on));
      if (on) { closeAll(group); }
    };

    // Click toggles
    btn.addEventListener('click', (e)=>{
      e.preventDefault();
      open(group.dataset.open !== 'true');
    });

    // Click outside closes
    document.addEventListener('click', (e)=>{
      if (!group.contains(e.target)) open(false);
    });

    // Keyboard on button
    btn.addEventListener('keydown', (e)=>{
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open(true);
        (menu.querySelector('a,button,[tabindex]:not([tabindex="-1"])')||btn).focus();
      } else if (e.key === 'Escape') {
        open(false); btn.focus();
      }
    });

    // Keyboard in menu
    menu.addEventListener('keydown', (e)=>{
      if (e.key === 'Escape') { e.preventDefault(); open(false); btn.focus(); }
      if (e.key === 'ArrowUp' && e.target === menu.querySelector('a,button,[tabindex]:not([tabindex="-1"])')) {
        e.preventDefault(); btn.focus();
      }
    });

    // Hover open for pointer devices (progressive enhancement)
    if (matchMedia('(hover:hover)').matches) {
      group.addEventListener('mouseenter', ()=>open(true));
      group.addEventListener('mouseleave', ()=>open(false));
    }
  }

  ready(()=>{
    document.querySelectorAll('.nav-group').forEach(wire);
  });
})();
