// assets/js/mega-nav.js
const DATA_URL = 'assets/data/fleets.json';

const el = {
  root: document.getElementById('megaNav'),
  lvl1: () => document.querySelector('#megaNav .lvl-1')
};

function liWithLink(text, href = '#', extra = {}) {
  const li = document.createElement('li');
  const a = document.createElement('a');
  a.href = href; a.textContent = text;
  if (extra.role) a.setAttribute('role', extra.role);
  if (extra.aria) Object.entries(extra.aria).forEach(([k,v])=>a.setAttribute(k,v));
  li.appendChild(a);
  return li;
}

function flyout() {
  const d = document.createElement('div');
  d.className = 'flyout';
  return d;
}

function build() {
  fetch(DATA_URL).then(r=>r.json()).then(json=>{
    const l1 = el.lvl1();
    json.groups.forEach(group=>{
      const li = liWithLink(group.name, `cruise-lines.html#${group.slug}`, {role:'menuitem'});
      const f1 = flyout();

      // Level 2: brands
      const lvl2 = document.createElement('ul');
      lvl2.className = 'lvl-2 cols';
      group.brands.forEach(brand=>{
        const li2 = document.createElement('li');
        const a2 = document.createElement('a');
        a2.className = 'pill';
        a2.href = `brand.html?brand=${encodeURIComponent(brand.slug)}`;
        a2.textContent = brand.name;
        li2.appendChild(a2);

        // Level 3: classes OR ships (if <10 or no classes)
        const hasClasses = Array.isArray(brand.classes) && brand.classes.length;
        const directShips = (!hasClasses) || (brand.classes.length === 0 && Array.isArray(brand.ships) && brand.ships.length) ||
          (hasClasses && brand.classes.reduce((n,c)=>n+(c.ships?.length||0),0) < 10);

        const fly3 = flyout();
        const lvl3 = document.createElement('ul');
        lvl3.className = 'lvl-3';

        if (hasClasses && !directShips) {
          // show classes
          brand.classes.forEach(cls=>{
            const li3 = document.createElement('li');
            const a3 = document.createElement('a');
            a3.className = 'pill';
            a3.href = `brand.html?brand=${encodeURIComponent(brand.slug)}#class-${encodeURIComponent(cls.name.toLowerCase().replace(/\s+/g,'-'))}`;
            a3.textContent = cls.name;
            li3.appendChild(a3);

            // Level 4: ships for that class
            if (cls.ships?.length) {
              const fly4 = flyout();
              const lvl4 = document.createElement('ul');
              lvl4.className = 'lvl-4';
              cls.ships.forEach(ship=>{
                const li4 = liWithLink(ship, `ship.html?ship=${encodeURIComponent(ship)}`, {role:'menuitem'});
                lvl4.appendChild(li4);
              });
              fly4.appendChild(lvl4);
              li3.appendChild(fly4);
            }
            lvl3.appendChild(li3);
          });
        } else {
          // show ships directly (brand with <10 total or no classes)
          const ships = hasClasses ? brand.classes.flatMap(c=>c.ships||[]) : (brand.ships||[]);
          ships.forEach(ship=>{
            lvl3.appendChild(liWithLink(ship, `ship.html?ship=${encodeURIComponent(ship)}`, {role:'menuitem'}));
          });
        }

        fly3.appendChild(lvl3);
        li2.appendChild(fly3);
        lvl2.appendChild(li2);
      });

      const hd = document.createElement('div');
      hd.className = 'hd';
      hd.textContent = 'Brands';
      f1.appendChild(hd);
      f1.appendChild(lvl2);
      li.appendChild(f1);
      l1.appendChild(li);
    });

    // Touch toggle for small screens
    if (matchMedia('(max-width:900px)').matches) {
      el.root.querySelectorAll('.lvl-1 > li > a').forEach(a=>{
        a.addEventListener('click', (e)=>{
          const li = a.parentElement;
          const open = li.classList.contains('open');
          el.root.querySelectorAll('.lvl-1 > li').forEach(n=>n.classList.remove('open'));
          if (!open) li.classList.add('open');
          e.preventDefault();
        });
      });
    }
  }).catch(console.error);
}

document.readyState!=='loading' ? build() : document.addEventListener('DOMContentLoaded', build);
