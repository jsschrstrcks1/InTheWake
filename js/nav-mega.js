/* ========================================================================
   In the Wake — nav-mega.js
   Restores original 4-level hover nav:
   L1 Groups (popularity order)
   L2 Brands (for that group)
   L3 Classes (unless brand has <10 total ships OR no classes)
   L4 Ships
   - Keyboard accessible
   - Hover intent + touch support
   - Works with a global MEGA_DATA (see shape below)
   ======================================================================== */

/*
Expected global MEGA_DATA shape (load this in a separate file BEFORE this one):

window.MEGA_DATA = {
  groups: [
    {
      id: "rcg",
      label: "Royal Caribbean Group",
      brands: [
        {
          id: "rci",
          label: "Royal Caribbean International",
          // Prefer classes when available & total ships >= 10:
          classes: [
            { id: "icon", label: "Icon Class", ships: [{ id:"icon-of-the-seas", label:"Icon of the Seas", href:"icon-of-the-seas.html" }, ...] },
            // ...
          ],
          // Optional: fallback or extra for brands without classes:
          ships: [{ id:"grandeur-of-the-seas", label:"Grandeur of the Seas", href:"grandeur-of-the-seas.html" }, ...]
        },
        // Celebrity, Silversea, etc…
      ]
    },
    // Carnival Corp (Carnival, Princess, P&O, AIDA, HAL, Costa, Cunard, Seabourn…),
    // NCLH (NCL, Oceania, Regent…),
    // MSC, Viking, Disney, TUI, etc. in the popularity order you provided.
  ]
};
*/

(() => {
  const DATA = (window.MEGA_DATA && Array.isArray(window.MEGA_DATA.groups))
    ? window.MEGA_DATA
    : { groups: [] };

  /** DOM helpers */
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));
  const el = (tag, opts = {}) => Object.assign(document.createElement(tag), opts);

  /** Containers */
  const host = $('#megaNav');
  if (!host) return;

  host.classList.add('iw-mega');
  host.setAttribute('role', 'menubar');

  // Structure: 4 adjacent panels
  const panelL1 = el('div', { className: 'iwm-panel iwm-l1', role: 'menu' });
  const panelL2 = el('div', { className: 'iwm-panel iwm-l2', role: 'menu' });
  const panelL3 = el('div', { className: 'iwm-panel iwm-l3', role: 'menu' });
  const panelL4 = el('div', { className: 'iwm-panel iwm-l4', role: 'menu' });

  host.append(panelL1, panelL2, panelL3, panelL4);

  /** Accessibility states */
  const state = {
    open: false,
    hoverTimer: null,
    focusTrapEls: [],
    active: { group: null, brand: null, klass: null },
    lastPointerType: 'mouse'
  };

  /** Utilities */
  const clearPanel = (panel) => { panel.innerHTML = ''; };
  const clearPanelsFrom = (level) => {
    if (level <= 2) clearPanel(panelL2);
    if (level <= 3) clearPanel(panelL3);
    if (level <= 4) clearPanel(panelL4);
  };
  const setOpen = (isOpen) => {
    state.open = isOpen;
    host.classList.toggle('is-open', isOpen);
    if (!isOpen) {
      clearPanelsFrom(2);
      state.active = { group: null, brand: null, klass: null };
    }
  };

  const hoverIntent = (fn) => {
    clearTimeout(state.hoverTimer);
    state.hoverTimer = setTimeout(fn, 120);
  };

  const totalShipsForBrand = (brand) => {
    const cCount = (brand.classes || []).reduce((sum, c) => sum + (c.ships?.length || 0), 0);
    const sCount = (brand.ships?.length || 0);
    return cCount + sCount;
  };

  const shouldShowClasses = (brand) => {
    const hasClasses = Array.isArray(brand.classes) && brand.classes.length > 0;
    const tShips = totalShipsForBrand(brand);
    return hasClasses && tShips >= 10;
  };

  /** Renderers */
  function renderL1() {
    clearPanel(panelL1);
    const ul = el('ul', { className: 'iwm-list iwm-list--groups' });

    DATA.groups.forEach((group, idx) => {
      const li = el('li', { className: 'iwm-item iwm-group', role: 'none' });
      const btn = el('button', {
        className: 'iwm-link',
        role: 'menuitem',
        'aria-haspopup': 'true',
        'aria-expanded': 'false',
        'data-id': group.id,
        textContent: group.label,
        tabIndex: 0
      });

      // Hover/click handling
      btn.addEventListener('pointerenter', () => {
        state.lastPointerType = 'pointer';
        setOpen(true);
        hoverIntent(() => {
          setActiveGroup(group);
        });
      });
      btn.addEventListener('focus', () => {
        // keyboard open
        setOpen(true);
        setActiveGroup(group);
      });
      btn.addEventListener('click', () => {
        setOpen(true);
        setActiveGroup(group);
      });

      li.appendChild(btn);
      ul.appendChild(li);

      // First group: open by default on first pointer/keyboard interaction
      if (idx === 0 && !state.open) {
        // passive; we open on first pointer move/focus
      }
    });

    panelL1.appendChild(ul);
  }

  function setActiveGroup(group) {
    state.active.group = group.id;
    // Update aria on L1
    $$('.iwm-list--groups .iwm-link', panelL1).forEach((b) => {
      b.classList.toggle('is-active', b.dataset.id === group.id);
      b.setAttribute('aria-expanded', b.dataset.id === group.id ? 'true' : 'false');
    });
    renderL2(group);
    clearPanelsFrom(3);
  }

  function renderL2(group) {
    clearPanel(panelL2);
    const title = el('div', { className: 'iwm-title', textContent: 'Brands' });
    const ul = el('ul', { className: 'iwm-list iwm-list--brands' });

    (group.brands || []).forEach((brand, idx) => {
      const li = el('li', { className: 'iwm-item iwm-brand', role: 'none' });
      const btn = el('button', {
        className: 'iwm-link',
        role: 'menuitem',
        'aria-haspopup': 'true',
        'aria-expanded': 'false',
        'data-id': brand.id,
        textContent: brand.label,
        tabIndex: 0
      });

      btn.addEventListener('pointerenter', () => {
        hoverIntent(() => setActiveBrand(brand));
      });
      btn.addEventListener('focus', () => setActiveBrand(brand));
      btn.addEventListener('click', () => setActiveBrand(brand));

      li.appendChild(btn);
      ul.appendChild(li);

      // auto-open the first brand when group changes (keyboard friendly)
      if (idx === 0) {
        setActiveBrand(brand);
      }
    });

    panelL2.append(title, ul);
  }

  function setActiveBrand(brand) {
    state.active.brand = brand.id;
    $$('.iwm-list--brands .iwm-link', panelL2).forEach((b) => {
      b.classList.toggle('is-active', b.dataset.id === brand.id);
      b.setAttribute('aria-expanded', b.dataset.id === brand.id ? 'true' : 'false');
    });

    if (shouldShowClasses(brand)) {
      renderL3Classes(brand);
      clearPanel(panelL4);
    } else {
      renderL3ShipsFlat(brand);
      clearPanel(panelL4);
    }
  }

  function renderL3Classes(brand) {
    clearPanel(panelL3);
    const title = el('div', { className: 'iwm-title', textContent: 'Classes' });
    const ul = el('ul', { className: 'iwm-list iwm-list--classes' });
    (brand.classes || []).forEach((klass, idx) => {
      const li = el('li', { className: 'iwm-item iwm-class', role: 'none' });
      const btn = el('button', {
        className: 'iwm-link',
        role: 'menuitem',
        'aria-haspopup': 'true',
        'aria-expanded': 'false',
        'data-id': klass.id,
        textContent: klass.label,
        tabIndex: 0
      });

      btn.addEventListener('pointerenter', () => hoverIntent(() => setActiveClass(klass)));
      btn.addEventListener('focus', () => setActiveClass(klass));
      btn.addEventListener('click', () => setActiveClass(klass));

      li.appendChild(btn);
      ul.appendChild(li);

      if (idx === 0) setActiveClass(klass);
    });

    panelL3.append(title, ul);
  }

  function setActiveClass(klass) {
    state.active.klass = klass.id;
    $$('.iwm-list--classes .iwm-link', panelL3).forEach((b) => {
      b.classList.toggle('is-active', b.dataset.id === klass.id);
      b.setAttribute('aria-expanded', b.dataset.id === klass.id ? 'true' : 'false');
    });
    renderL4Ships(klass.ships || []);
  }

  function renderL3ShipsFlat(brand) {
    clearPanel(panelL3);
    const title = el('div', { className: 'iwm-title', textContent: 'Ships' });
    const ul = el('ul', { className: 'iwm-list iwm-list--ships iwm-list--ships-flat' });

    const ships = (brand.ships && brand.ships.length)
      ? brand.ships
      : (brand.classes || []).flatMap(c => c.ships || []);

    ships.forEach((ship) => {
      const li = el('li', { className: 'iwm-item iwm-ship', role: 'none' });
      const a = el('a', {
        className: 'iwm-link',
        role: 'menuitem',
        href: ship.href || '#',
        textContent: ship.label,
        tabIndex: 0
      });
      li.appendChild(a);
      ul.appendChild(li);
    });

    panelL3.append(title, ul);
  }

  function renderL4Ships(ships) {
    clearPanel(panelL4);
    const title = el('div', { className: 'iwm-title', textContent: 'Ships' });
    const ul = el('ul', { className: 'iwm-list iwm-list--ships' });

    ships.forEach((ship) => {
      const li = el('li', { className: 'iwm-item iwm-ship', role: 'none' });
      const a = el('a', {
        className: 'iwm-link',
        role: 'menuitem',
        href: ship.href || '#',
        textContent: ship.label,
        tabIndex: 0
      });
      li.appendChild(a);
      ul.appendChild(li);
    });

    panelL4.append(title, ul);
  }

  /** Open/close and outside click */
  const header = host.closest('.hero-header') || document.body;
  header.addEventListener('mouseleave', () => setOpen(false));
  document.addEventListener('pointerdown', (e) => {
    if (!host.contains(e.target)) setOpen(false);
  });

  /** Keyboard navigation */
  host.addEventListener('keydown', (e) => {
    const key = e.key;
    if (key === 'Escape') {
      setOpen(false);
      panelL1.querySelector('.iwm-link.is-active')?.focus();
      return;
    }

    // Arrow navigation among siblings within a panel
    const target = e.target;
    if (!(target instanceof HTMLElement) || !target.classList.contains('iwm-link')) return;
    const li = target.closest('.iwm-item');
    const list = li?.parentElement;
    if (!list) return;
    const items = $$('.iwm-item .iwm-link', list);
    const idx = items.indexOf(target);

    if (key === 'ArrowDown' || key === 'ArrowRight') {
      e.preventDefault();
      items[(idx + 1) % items.length]?.focus();
    } else if (key === 'ArrowUp' || key === 'ArrowLeft') {
      e.preventDefault();
      items[(idx - 1 + items.length) % items.length]?.focus();
    }
  });

  /** Touch support: first tap = open/activate, second tap = follow (links) */
  host.addEventListener('click', (e) => {
    const t = e.target;
    if (!(t instanceof HTMLElement)) return;
    if (t.tagName === 'A') {
      // On touch, ensure menu is open first before navigating
      if (!state.open) {
        e.preventDefault();
        setOpen(true);
      }
      return; // allow navigation
    }
    if (t.tagName === 'BUTTON') {
      // already handled by click listeners above
      return;
    }
  }, true);

  /** Initial render */
  renderL1();

  /** Optional: open on first focus for keyboard users */
  host.addEventListener('focusin', () => setOpen(true));
})();
