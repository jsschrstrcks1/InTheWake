<script>
(function(){
  function wire(group){
    if(!group) return;
    const btn = group.querySelector('.nav-disclosure');
    const menu = group.querySelector('.submenu');
    if(!btn || !menu) return;
    const open = b => { group.dataset.open = b ? 'true' : 'false'; btn.setAttribute('aria-expanded', !!b); };
    btn.addEventListener('click', e => { e.preventDefault(); open(group.dataset.open!=='true'); });
    document.addEventListener('click', e => { if(!group.contains(e.target)) open(false); });
    btn.addEventListener('keydown', e => {
      if(e.key==='ArrowDown'){ open(true); menu.querySelector('a')?.focus(); e.preventDefault(); }
      if(e.key==='Escape'){ open(false); btn.focus(); }
    });
    menu.addEventListener('keydown', e => { if(e.key==='Escape'){ open(false); btn.focus(); } });
  }
  wire(document.getElementById('nav-planning'));
  wire(document.getElementById('nav-travel'));
})();
</script>
