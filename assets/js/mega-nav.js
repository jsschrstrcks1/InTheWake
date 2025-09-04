/* assets/js/mega-nav.js — unified mega menu + brand/class/ship helpers
   Depends on: assets/data/fleets.json
*/

// === Hover Intent (drop near the top of nav-mega.merged.js) ===
function attachHoverIntent(root, { openDelay = 120, closeDelay = 220 } = {}) {
  // Any <li> that can open a flyout (has a .flyout child)
  const items = root.querySelectorAll('li:has(.flyout), li.has-flyout');

  items.forEach(li => {
    let openTimer = null;
    let closeTimer = null;

    const open = () => {
      li.classList.add('open');
      const fly = li.querySelector(':scope > .flyout');
      if (fly) fly.setAttribute('data-open', 'true');
    };
    const close = () => {
      li.classList.remove('open');
      const fly = li.querySelector(':scope > .flyout');
      if (fly) fly.removeAttribute('data-open');
    };

    const clearTimers = () => {
      if (openTimer) { clearTimeout(openTimer); openTimer = null; }
      if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
    };

    li.addEventListener('mouseenter', () => {
      clearTimeout(closeTimer);
      openTimer = setTimeout(open, openDelay);
    });

    li.addEventListener('mouseleave', () => {
      clearTimeout(openTimer);
      closeTimer = setTimeout(close, closeDelay);
    });

    // Don’t delay for keyboard users—open immediately on focus
    const trigger = li.querySelector(':scope > a, :scope > button');
    if (trigger) {
      trigger.addEventListener('focus', () => { clearTimers(); open(); });
      trigger.addEventListener('blur',  () => { clearTimers(); close(); });
      // Optional: expand/collapse with keyboard
      trigger.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
          e.preventDefault(); clearTimers(); open();
        }
        if (e.key === 'Escape') { clearTimers(); close(); trigger.blur(); }
      });
    }
  });
}

(() => {
  const DATA_URL = 'assets/data/fleets.json';

  // ---- small utils ---------------------------------------------------------
  const $  = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  const slug = s => String(s||'').toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9\-]/g,'');
  const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);
  const off = (el, ev, fn, opts) => el && el.removeEventListener(ev, fn, opts);
  const trapWithin = (container, e) => {
    if (!container) return;
    const focusables = $$('a, button, [tabindex]:not([tabindex="-1"])', container)
      .filter(n => !n.hasAttribute('disabled') && n.tabIndex !== -1);
    if (!focusables.length) return;
    const first = focusables[0], last = focusables[focusables.length-1];
    if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
    else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
  };
  const debounce = (fn, ms=180) => {
    let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a),ms); };
  };

  // ---- DOM builders ---------------------------------------------------------
  const liWithLink = (text, href = '#', extra = {}) => {
    const li = document.createElement('li');
    const a  = document.createElement('a');
    a.href = href; a.textContent = text;
    if (extra.role) a.setAttribute('role', extra.role);
    if (extra.aria) Object.entries(extra.aria).forEach(([k,v]) => a.setAttribute(k, v));
    li.appendChild(a);
    return li;
  };

  const flyout = (label=null) => {
    const d = document.createElement('div');
    d.className = 'flyout';
    d.setAttribute('role', 'dialog');
    d.setAttribute('aria-modal', 'false');
    if (label) {
      const hd = document.createElement('div');
      hd.className = 'hd';
      hd.textContent = label;
      d.appendChild(hd);
    }
    return d;
  };

  // ---- Mega menu builder (Groups → Brands → Classes/Ships → Ships) ----------
  function buildMega(json) {
    const root = $('#megaNav');
    const lvl1 = $('#megaNav .lvl-1');
    if (!root || !lvl1) return;

    // Accessibility: role wiring
    root.setAttribute('role','menubar');
    lvl1.setAttribute('role','menu');

    json.groups.forEach(group => {
      const groupLi = liWithLink(group.name, `cruise-lines.html#${group.slug}`, { role:'menuitem' });
      groupLi.classList.add('has-flyout');

      const f1 = flyout('Brands');
      const lvl2 = document.createElement('ul');
      lvl2.className = 'lvl-2 cols';
      lvl2.setAttribute('role','menu');

      (group.brands||[]).forEach(brand => {
        const li2 = document.createElement('li');
        const a2 = document.createElement('a');
        a2.className = 'pill';
        a2.href = `brand.html?brand=${encodeURIComponent(brand.slug)}`;
        a2.textContent = brand.name;
        a2.setAttribute('role','menuitem');
        li2.appendChild(a2);

        const hasClasses = Array.isArray(brand.classes) && brand.classes.length;
        const totalShips = hasClasses
          ? brand.classes.reduce((n,c)=> n + ((c.ships||[]).length), 0)
          : (brand.ships||[]).length;
        const showShipsDirect = (!hasClasses) || totalShips < 10;

        const f3 = flyout(showShipsDirect ? 'Ships' : 'Classes');
        const lvl3 = document.createElement('ul');
        lvl3.className = 'lvl-3';
        lvl3.setAttribute('role','menu');

        if (!showShipsDirect) {
          // show classes, then lvl-4 ships per class
          brand.classes.forEach(cls => {
            const li3 = document.createElement('li');
            li3.classList.add('has-flyout');
            const a3 = document.createElement('a');
            a3.className = 'pill';
            a3.href = `brand.html?brand=${encodeURIComponent(brand.slug)}#class-${encodeURIComponent(slug(cls.name))}`;
            a3.textContent = cls.name;
            a3.setAttribute('role','menuitem');
            li3.appendChild(a3);

            if (cls.ships?.length) {
              const f4 = flyout('Ships');
              const lvl4 = document.createElement('ul');
              lvl4.className = 'lvl-4';
              lvl4.setAttribute('role','menu');
              cls.ships.forEach(ship => {
                const li4 = liWithLink(ship, `ship.html?ship=${encodeURIComponent(ship)}`, { role:'menuitem' });
                lvl4.appendChild(li4);
              });
              f4.appendChild(lvl4);
              li3.appendChild(f4);
            }
            lvl3.appendChild(li3);
          });
        } else {
          // show all ships directly
          const ships = hasClasses ? brand.classes.flatMap(c => c.ships||[]) : (brand.ships||[]);
          ships.forEach(ship => {
            lvl3.appendChild(liWithLink(ship, `ship.html?ship=${encodeURIComponent(ship)}`, { role:'menuitem' }));
          });
        }

        f3.appendChild(lvl3);
        li2.appendChild(f3);
        lvl2.appendChild(li2);
      });

      f1.appendChild(lvl2);
      groupLi.appendChild(f1);
      lvl1.appendChild(groupLi);
    });

    // Hover / focus management
    const closeAllAtLevel = (levelSel) => {
      $$('#megaNav ' + levelSel + ' > li.open').forEach(li => li.classList.remove('open'));
    };

    // Leave to close (desktop)
    on(root, 'pointerleave', () => {
      closeAllAtLevel('.lvl-1');
      closeAllAtLevel('.lvl-2');
      closeAllAtLevel('.lvl-3');
    });

    // Touch: tap to toggle at lvl-1
    if (matchMedia('(max-width:900px)').matches) {
      $$('#megaNav .lvl-1 > li > a').forEach(a => {
        on(a, 'click', (e) => {
          const li = a.parentElement;
          const open = li.classList.contains('open');
          closeAllAtLevel('.lvl-1');
          if (!open) li.classList.add('open');
          e.preventDefault();
        });
      });
    }

    // Keyboard support
    on(root, 'keydown', (e) => {
      const active = document.activeElement;
      const atLi = active && active.closest('#megaNav li');
      if (!atLi) return;

      // Esc closes the current open branch
      if (e.key === 'Escape') {
        const openLi = atLi.classList.contains('open') ? atLi : atLi.closest('li.open');
        if (openLi) {
          openLi.classList.remove('open');
          const parentLink = $('> a', openLi) || $(':scope > a', openLi);
          parentLink && parentLink.focus();
        } else {
          closeAllAtLevel('.lvl-1');
        }
        e.preventDefault();
        return;
      }

      // Arrow Right: open flyout if exists
      if (e.key === 'ArrowRight') {
        const fly = $('.flyout', atLi);
        if (fly) {
          atLi.classList.add('open');
          const first = $('a, button, [tabindex]:not([tabindex="-1"])', fly);
          first && first.focus();
          e.preventDefault();
        }
      }

      // Arrow Left: close current and focus parent
      if (e.key === 'ArrowLeft') {
        const parentLi = atLi.parentElement.closest('li');
        if (parentLi) {
          atLi.classList.remove('open');
          const parentA = $('> a', parentLi);
          parentA && parentA.focus();
          e.preventDefault();
        }
      }

      // Tab trap within an open flyout column
      if (e.key === 'Tab') {
        const openFly = atLi.classList.contains('open') ? $('.flyout', atLi) : atLi.closest('.flyout');
        if (openFly) trapWithin(openFly, e);
      }
    });
  }

  // ---- Page helpers: optional renderers (Sections A/B/C) --------------------
  function renderBrandGrid(json) {
    const mount = $('#brandGrid');
    if (!mount) return;
    const frag = document.createDocumentFragment();

    json.groups.forEach(group => {
      const sec = document.createElement('section');
      sec.className = 'brand-grid-section';
      const h = document.createElement('h3');
      h.textContent = group.name;
      sec.appendChild(h);

      const ul = document.createElement('ul');
      ul.className = 'brand-grid';
      (group.brands||[]).forEach(b => {
        const li = document.createElement('li');
        li.innerHTML = `
          <a class="brand-card" href="brand.html?brand=${encodeURIComponent(b.slug)}">
            <span class="brand-name">${b.name}</span>
            <span class="brand-meta">${(b.classes?.length||0) ? `${b.classes.length} classes` : `${(b.ships||[]).length} ships`}</span>
          </a>`;
        ul.appendChild(li);
      });
      sec.appendChild(ul);
      frag.appendChild(sec);
    });

    mount.innerHTML = '';
    mount.appendChild(frag);
  }

  function renderClassAccordion(json, brandSlug) {
    const mount = $('#classAccordion');
    if (!mount || !brandSlug) return;

    const brand = json.groups.flatMap(g => g.brands).find(b => b.slug === brandSlug);
    if (!brand) { mount.innerHTML = '<p class="tiny">Brand not found.</p>'; return; }

    const hasClasses = Array.isArray(brand.classes) && brand.classes.length;
    const wrap = document.createElement('div');
    wrap.className = 'accordion';

    if (hasClasses) {
      brand.classes
        .slice() // copy
        .sort((a,b)=> (b.size||0)-(a.size||0)) // largest to smallest if provided
        .forEach(cls => {
          const id = `class-${slug(cls.name)}`;
          const item = document.createElement('details');
          item.id = id;
          const sum = document.createElement('summary');
          sum.textContent = `${cls.name} (${cls.ships?.length||0})`;
          const ul = document.createElement('ul');
          ul.className = 'ship-list';
          (cls.ships||[]).forEach(s => {
            const li = liWithLink(s, `ship.html?ship=${encodeURIComponent(s)}`);
            ul.appendChild(li);
          });
          item.appendChild(sum);
          item.appendChild(ul);
          wrap.appendChild(item);
        });
    } else {
      // direct ship list
      const ul = document.createElement('ul');
      ul.className = 'ship-list';
      (brand.ships||[]).forEach(s => ul.appendChild(liWithLink(s, `ship.html?ship=${encodeURIComponent(s)}`)));
      wrap.appendChild(ul);
    }

    mount.innerHTML = '';
    mount.appendChild(wrap);

    // Deep link open: #class-…
    if (location.hash) {
      const target = $(location.hash);
      if (target && target.tagName.toLowerCase() === 'details') {
        target.open = true;
        const sm = $('summary', target);
        sm && sm.focus();
      }
    }
  }

  function renderShipsList(json, brandSlug) {
    const mount = $('#shipsList');
    if (!mount) return;

    // Build a flat list with metadata for filters
    const rows = [];
    json.groups.forEach(g => {
      (g.brands||[]).forEach(b => {
        const add = (shipName, clsName=null, year=null) => {
          rows.push({
            group: g.name,
            brand: b.name,
            brandSlug: b.slug,
            class: clsName,
            ship: shipName,
            year
          });
        };
        if (b.classes?.length) {
          b.classes.forEach(c => (c.ships||[]).forEach(s => add(s, c.name, c.year||null)));
        } else {
          (b.ships||[]).forEach(s => add(s, null, s.year||null));
        }
      });
    });

    // Controls
    const controls = document.createElement('div');
    controls.className = 'filters';
    controls.innerHTML = `
      <input id="fSearch" type="search" placeholder="Search ships…" aria-label="Search ships">
      <select id="fBrand" aria-label="Brand filter"><option value="">All brands</option></select>
      <select id="fClass" aria-label="Class filter"><option value="">All classes</option></select>
      <select id="fYear" aria-label="Year filter"><option value="">Any year</option></select>
    `;

    const brands = [...new Set(rows.map(r => r.brand))].sort();
    const classes= [...new Set(rows.map(r => r.class).filter(Boolean))].sort();
    const years  = [...new Set(rows.map(r => r.year).filter(Boolean))].sort((a,b)=>b-a);

    const fBrand = $('#fBrand', controls);
    const fClass = $('#fClass', controls);
    const fYear  = $('#fYear', controls);
    brands.forEach(b => fBrand.appendChild(new Option(b, b)));
    classes.forEach(c => fClass.appendChild(new Option(c, c)));
    years.forEach(y => fYear.appendChild(new Option(y, y)));

    // Preferred brand preselect
    if (brandSlug) {
      const brandName = json.groups.flatMap(g=>g.brands).find(b=>b.slug===brandSlug)?.name;
      if (brandName) fBrand.value = brandName;
    }

    const list = document.createElement('ul');
    list.className = 'ships-all';

    const renderList = (items) => {
      list.innerHTML = '';
      items.slice(0, 300).forEach(r => {
        const li = document.createElement('li');
        li.innerHTML = `
          <a href="ship.html?ship=${encodeURIComponent(r.ship)}">${r.ship}</a>
          <span class="meta">— ${r.brand}${r.class ? ` • ${r.class}` : ''}${r.year ? ` • ${r.year}` : ''}</span>`;
        list.appendChild(li);
      });
      // lazy-load (simple chunking on scroll)
      let idx = 300;
      const more = () => {
        const chunk = items.slice(idx, idx+300);
        chunk.forEach(r => {
          const li = document.createElement('li');
          li.innerHTML = `
            <a href="ship.html?ship=${encodeURIComponent(r.ship)}">${r.ship}</a>
            <span class="meta">— ${r.brand}${r.class ? ` • ${r.class}` : ''}${r.year ? ` • ${r.year}` : ''}</span>`;
          list.appendChild(li);
        });
        idx += 300;
        if (idx >= items.length) off(window, 'scroll', onScroll);
      };
      const onScroll = debounce(() => {
        if (window.scrollY + window.innerHeight + 200 >= document.body.scrollHeight) more();
      }, 120);
      off(window, 'scroll', onScroll);
      if (items.length > 300) on(window, 'scroll', onScroll);
    };

    const doFilter = () => {
      const q = ($('#fSearch', controls).value || '').toLowerCase().trim();
      const b = fBrand.value;
      const c = fClass.value;
      const y = fYear.value;
      const out = rows.filter(r =>
        (!b || r.brand === b) &&
        (!c || r.class === c) &&
        (!y || String(r.year) === y) &&
        (!q || [r.ship, r.brand, r.class, r.group].filter(Boolean).some(v => v.toLowerCase().includes(q)))
      );
      renderList(out);
    };

    on(controls, 'input', debounce(doFilter, 100));
    on(controls, 'change', doFilter);

    mount.innerHTML = '';
    mount.appendChild(controls);
    mount.appendChild(list);
    renderList(rows);
    doFilter();
  }

  // ---- Boot ---------------------------------------------------------------
  function init() {
    fetch(DATA_URL)
      .then(r => r.json())
      .then(json => {
       buildMega(json);

// NEW: delayed hover open/close for desktop
attachHoverIntent(document.getElementById('megaNav'), {
  openDelay: 150,
  closeDelay: 250
});

// Optional: you can also keep the brand grid / class accordion / ships list
renderBrandGrid(json);

        // Optional page helpers (execute only if mount points exist)
        renderBrandGrid(json);

        const params = new URLSearchParams(location.search);
        const brandSlug = params.get('brand') || location.hash.replace(/^#/, '').replace(/^brand-/, '');
        renderClassAccordion(json, brandSlug);
        renderShipsList(json, brandSlug);
      })
      .catch(console.error);
  }

  document.readyState !== 'loading'
    ? init()
    : document.addEventListener('DOMContentLoaded', init);
})();

function attachHoverIntent(root, delay = 200) {
  root.querySelectorAll('li').forEach(li => {
    const flyout = li.querySelector('.flyout');
    if (!flyout) return;

    let timer;
    li.addEventListener('mouseenter', () => {
      timer = setTimeout(() => li.classList.add('open'), delay);
    });
    li.addEventListener('mouseleave', () => {
      clearTimeout(timer);
      li.classList.remove('open');
    });
  });
}


