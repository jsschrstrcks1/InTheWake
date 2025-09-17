
/* lang-toggle.js — simple i18n switcher */
document.addEventListener('DOMContentLoaded', () => {
  const select = document.getElementById('langSelect');
  if (!select) return;
  const containers = Array.from(document.querySelectorAll('.i18n'));
  const langs = containers.map(c => c.dataset.lang).filter((v,i,a)=>a.indexOf(v)===i);
  const defaultLang = select.dataset.default || 'en';
  // Populate options
  langs.forEach(l => {
    const opt = document.createElement('option');
    opt.value = l; opt.textContent = l.toUpperCase();
    if (l === defaultLang) opt.selected = true;
    select.appendChild(opt);
  });
  function update(){
    const lang = select.value || defaultLang;
    containers.forEach(c => c.style.display = (c.dataset.lang===lang?'block':'none'));
  }
  select.addEventListener('change', update);
  update();
});
