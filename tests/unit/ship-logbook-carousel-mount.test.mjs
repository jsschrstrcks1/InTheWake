// Ship-page logbook carousel: it must have somewhere to mount.
//
// On 2026-11-18, 20 ship pages (Carnival, Celebrity, Royal Caribbean) held between 1 and 13 written stories each,
// behind a carousel that only looked for #logbook-stories. Those pages have #logbook-container instead, so the
// carousel returned on its first line and the reader saw the placeholder forever. Ken's ruling that day was
// "Show stories" (Tekton inthewake-mount-the-20-ship-page-logbook-carousels-on-logboo). The fix is one line per
// page: fall back to #logbook-container. These tests pin that every page running the carousel has an element it
// can mount on, and that the carousel still writes story text as text.
//
// Soli Deo Gloria.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ROOT = new URL('../../', import.meta.url).pathname;
const SHIPS = path.join(ROOT, 'ships');

function shipPages() {
  const out = [];
  for (const line of readdirSync(SHIPS)) {
    const dir = path.join(SHIPS, line);
    if (!statSync(dir).isDirectory()) continue;
    for (const f of readdirSync(dir)) if (f.endsWith('.html')) out.push(path.join('ships', line, f));
  }
  return out.sort();
}

const CAROUSEL = /const mount=document\.getElementById\('logbook-stories'\)(\|\|document\.getElementById\('logbook-container'\))?; if\(!mount\) return;/;

test('every ship page that runs the carousel has an element the carousel can mount on', () => {
  const stranded = [];
  let running = 0;
  for (const rel of shipPages()) {
    const html = readFileSync(path.join(ROOT, rel), 'utf8');
    const m = html.match(CAROUSEL);
    if (!m) continue;
    running += 1;
    const hasStories = html.includes('id="logbook-stories"');
    const fallsBack = Boolean(m[1]) && html.includes('id="logbook-container"');
    // carnival-breeze: its stories render through its own loader on #logbook-entries; the carousel there is unused.
    const ownLoader = html.includes('id="logbook-entries"') && html.includes("getElementById('logbook-entries')");
    if (!hasStories && !fallsBack && !ownLoader) stranded.push(rel);
  }
  assert.ok(running >= 20, `expected the carousel on at least the 20 fixed pages, found ${running}`);
  assert.deepEqual(stranded, [], 'these pages run a carousel with nowhere to mount, so their stories never show');
});

// A small DOM, enough for the carousel: elements by id, children, text, attributes, before(), replaceChildren().
function makeDom(ids) {
  const byId = new Map();
  class Node {
    constructor(tag) { this.tagName = tag; this.children = []; this.attrs = {}; this._text = ''; this.parent = null; this.className = ''; this.disabled = false; }
    get textContent() { return this._text + this.children.map((c) => c.textContent).join(''); }
    set textContent(v) { this._text = String(v); this.children = []; }
    set innerHTML(_) { throw new Error('innerHTML was written: story text must go in as text'); }
    setAttribute(k, v) { this.attrs[k] = String(v); if (k === 'id') byId.set(String(v), this); }
    getAttribute(k) { return this.attrs[k] ?? null; }
    set id(v) { this.setAttribute('id', v); }
    get id() { return this.attrs.id; }
    append(...ns) { for (const n of ns) { if (n.isFragment) { this.append(...n.children); continue; } n.parent = this; this.children.push(n); if (n.attrs?.id) byId.set(n.attrs.id, n); } }
    replaceChildren(...ns) { this.children = []; this._text = ''; this.append(...ns); }
    before(n) { this.parent.children.splice(this.parent.children.indexOf(this), 0, n); n.parent = this.parent; if (n.attrs.id) byId.set(n.attrs.id, n); }
    querySelector(sel) { const cls = sel.replace(/^\./, ''); const walk = (n) => { for (const c of n.children) { if (c.className?.split(' ').includes(cls)) return c; const r = c.children && walk(c); if (r) return r; } return null; }; return walk(this); }
  }
  const section = new Node('section');
  for (const id of ids) { const n = new Node('div'); n.setAttribute('id', id); const p = new Node('p'); p.className = 'placeholder'; p.textContent = 'Stories will appear here.'; n.append(p); section.append(n); }
  const document = {
    getElementById: (id) => byId.get(id) ?? null,
    createElement: (t) => new Node(t),
    createTextNode: (s) => { const n = new Node('#text'); n._text = String(s); return n; },
    createDocumentFragment: () => { const f = new Node('#fragment'); f.isFragment = true; return f; },
  };
  return { document, section };
}

function carouselScript(rel) {
  const html = readFileSync(path.join(ROOT, rel), 'utf8');
  const start = html.indexOf('(function initShipLogbook(){');
  const end = html.indexOf('})();', start);
  assert.ok(start > 0 && end > start, `${rel}: carousel script not found`);
  return html.slice(start, end + 5);
}

async function runCarousel(rel, ids, data) {
  const { document, section } = makeDom(ids);
  const fetch = async () => ({ ok: true, json: async () => data });
  const location = { href: `https://example.test/${rel}`, pathname: `/${rel}` };
  const ctx = vm.createContext({ document, fetch, URL, location, Promise });
  ctx.window = ctx; // older pages' carousels read window.location
  vm.runInContext(carouselScript(rel), ctx);
  await new Promise((r) => setTimeout(r, 0));
  await new Promise((r) => setTimeout(r, 0));
  return { document, section };
}

const HOSTILE = '<img src=x onerror="alert(1)">';

test('on a page with only #logbook-container, the carousel replaces the placeholder with the first story, as text', async () => {
  const { document } = await runCarousel('ships/celebrity-cruises/celebrity-apex.html', ['logbook-container'], {
    stories: [{ title: HOSTILE, markdown: `First story with ${HOSTILE} inside.` }, { title: 'Second', markdown: 'Two.' }],
  });
  const mount = document.getElementById('logbook-container');
  assert.equal(mount.children.length, 1, 'the placeholder is gone and one story stands in its place');
  const story = mount.children[0];
  assert.equal(story.tagName, 'article');
  assert.equal(story.children[0].textContent, HOSTILE, 'a hostile title stays text');
  assert.match(story.textContent, /First story with <img src=x onerror="alert\(1\)"> inside\./, 'a hostile body stays text');
  assert.ok(document.getElementById('logbook-nav'), 'the previous and next buttons are added');
});

test('with no stories in the file, the honest placeholder stays', async () => {
  const { document } = await runCarousel('ships/rcl/sun-viking.html', ['logbook-container'], { stories: [] });
  const mount = document.getElementById('logbook-container');
  assert.equal(mount.textContent, 'Stories will appear here.');
  assert.equal(document.getElementById('logbook-nav'), null);
});
