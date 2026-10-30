// Lexicon C3: the pilot ships' stats cards rendered from statements (Tekton itw-c3-infobox-renderer).
// Soli Deo Gloria. The mount rules run everywhere; the rendering checks use Project-Sophos's contract and
// skip, saying so, when it is not beside this repo.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { renderCard, classifyMount, markOpenTag, readFallback, plan, MARK_END } from '../../admin/lexicon/render-infobox.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const LEX = path.resolve(ROOT, '..', 'Project-Sophos', 'sophos', 'src', 'lexicon');
const skip = !existsSync(path.join(LEX, 'statement.mjs')) && 'Project-Sophos not beside this checkout';
const contract = skip ? null : await import(pathToFileURL(path.join(LEX, 'statement.mjs')).href);
const AT = '2026-10-29T00:00:00Z';
const E = 'ship:test-ship';

// A statement as ship-statements.mjs files them: the site's own record, or the line's page (verified, preferred).
function own(property, value, unit = null, at = '2026-10-26T10:00:00.000Z') {
  return contract.makeStatement({
    pack: 'cruise.ship', entity: E, property, value, unit, partition: 'public', status: 'inference',
    evidence: [{ ref: `itw:ships/x/test-ship.html#${property}`, tier: 'secondary' }], sourceRef: `itw:ships/x/test-ship.html#${property}`,
    publisher: 'In the Wake', assertedAt: at, observedAt: at, clock: () => at,
  });
}
function line(property, value, unit = null, url = 'https://line.example/ship', at = '2026-10-25T03:00:00.000Z') {
  return contract.makeStatement({
    pack: 'cruise.ship', entity: E, property, value, unit, partition: 'public', status: 'verified', rank: 'preferred',
    evidence: [{ ref: url, tier: 'primary' }], sourceRef: url, uri: url, publisher: 'Test Line', trustTier: 'primary',
    observedAt: at, clock: () => at,
  });
}
const card = (statements, fallback = {}) => renderCard({
  entity: E, slug: 'test-ship', statements, fallback, openTag: '<div id="ship-stats" class="stats-grid" data-infobox="statements">',
  indent: '  ', at: AT, currentValue: contract.currentValue,
});
const val = (c, key) => c.rows.find((r) => r.key === key)?.text;

test('the line\'s own figure wins where it spoke, and the card names it first, linked', { skip }, () => {
  const c = card([own('length_m', 331, 'm'), line('length_m', 331.43, 'm'), own('gross_tonnage', 181541, 'GT')]);
  assert.equal(val(c, 'length'), '331.43 m');
  assert.equal(val(c, 'gt'), '181,541 GT');
  assert.match(c.html, /Sources: <a href="https:\/\/line\.example\/ship" rel="noopener">Test Line<\/a>, read 25 October 2026; In the Wake's ship records\./);
});

test('the card does not depend on when its own page was committed (re-dated records render the same)', { skip }, () => {
  // ship-statements.mjs dates a record by its source's last commit, and the ship page is a source, so committing
  // a rendered card re-dates its records. If that date reached the card, render -> commit -> regenerate -> render
  // would never settle.
  const a = card([own('crew', 894, null, '2026-10-26T10:00:00.000Z'), line('gross_tonnage', 90090, 'GT')]);
  const b = card([own('crew', 894, null, '2026-11-02T09:30:00.000Z'), line('gross_tonnage', 90090, 'GT')]);
  assert.equal(a.html, b.html);
});

test('a figure the sources disagree on is not shown, is named, and the page\'s own figure does not stand in', { skip }, () => {
  const c = card([own('crew', 720), own('crew', 765)], { crew: '720' });
  assert.equal(val(c, 'crew'), undefined, 'no side is picked');
  assert.deepEqual(c.withheld, ['crew']);
  assert.match(c.html, /Not shown while sources disagree: crew\./);
  assert.doesNotMatch(c.html, /720|765/, 'neither figure, nor the page\'s typed one, reaches the card');
});

test('guests: a resolved half shows, a disputed half is named, and the typed pair is not used', { skip }, () => {
  const c = card([own('guests_double', 1804, 'guests'), own('guests_max', 2076, 'guests'), own('guests_max', 2100, 'guests')],
    { guests: '1,804 (double) ~2,076 (max)' });
  assert.equal(val(c, 'guests'), '1,804 (double)');
  assert.deepEqual(c.withheld, ['guests_max']);
  assert.match(c.html, /Not shown while sources disagree: guests \(maximum\)\./);
});

test('a row no statement covers comes from the page\'s fallback, labelled; IMO never does', { skip }, () => {
  const c = card([own('crew', 1500)], { beam: '136 ft (41 m)', registry: 'Bahamas', imo: '9549463', class: 'N/A', entered_service: 'TBD' });
  assert.equal(val(c, 'beam'), '136 ft (41 m)');
  assert.equal(val(c, 'entered_service'), 'TBD', 'TBD is shown, as ship-stats.js shows it');
  assert.equal(val(c, 'class'), undefined, 'a value that states no fact is not shown');
  assert.equal(val(c, 'imo'), undefined, 'an identifier is shown only from a statement');
  assert.match(c.html, /data-prop="page:beam"/);
  assert.match(c.html, /this page's own records\./);
});

test('every value and link is escaped, so a statement cannot inject markup', { skip }, () => {
  const c = card([own('ship_class', '<img src=x onerror=alert(1)>'), line('crew', 9, null, 'https://x.example/"><script>')]);
  assert.doesNotMatch(c.html, /<img|<script|onerror=alert\(1\)>/);
  assert.match(c.html, /&lt;img src=x onerror=alert\(1\)&gt;/);
});

test('only an http(s) address becomes a link; a javascript: one is shown as plain text', { skip }, () => {
  const c = card([line('crew', 9, null, 'javascript:alert(1)')]);
  assert.doesNotMatch(c.html, /href=/);
  assert.match(c.html, /Sources: Test Line, read/);
});

test('a figure filed as unknown is said under the card, not silently dropped', { skip }, () => {
  const unknownCrew = contract.makeStatement({ pack: 'cruise.ship', entity: E, property: 'crew', value: null, partition: 'public',
    status: 'unknown', evidence: [], observedAt: AT, clock: () => AT });
  const c = card([unknownCrew], { crew: '900' });
  assert.equal(val(c, 'crew'), undefined, 'the page\'s typed figure does not stand in for a recorded unknown');
  assert.match(c.html, /No source found yet for: crew\./);
});

test('a hand edit inside the markers is drift, and re-rendering puts the statement back', { skip }, () => {
  const html = '<div id="ship-stats" class="stats-grid"></div>\n';
  const render = (h) => { const m = classifyMount(h); const c = renderCard({ entity: E, slug: 'test-ship', statements: [own('crew', 894)],
    fallback: {}, openTag: markOpenTag(m.openTag), indent: m.indent, at: AT, currentValue: contract.currentValue }); return h.slice(0, m.start) + c.html + h.slice(m.end); };
  const good = render(html);
  const tampered = good.replace('<span class="stat-val">894</span>', '<span class="stat-val">999</span>');
  assert.notEqual(tampered, good);
  assert.equal(classifyMount(tampered).kind, 'marked');
  assert.equal(render(tampered), good);
});

test('a link to a PDF says so', { skip }, () => {
  const c = card([line('crew', 1500, null, 'https://line.example/fact-sheet.pdf')]);
  assert.match(c.html, />Test Line \(PDF\)<\/a>/);
});

test('mounts: empty or <noscript>-only is adopted, other markup is left alone, the rendered block is found again', () => {
  const page = (inner) => `<section>\n    <div id="ship-stats" class="stats-grid" data-slug="s">${inner}</div>\n    <script type="application/json" id="ship-stats-fallback">{"beam":"1 ft"}</script>\n</section>`;
  assert.equal(classifyMount(page('')).kind, 'adoptable');
  assert.equal(classifyMount(page('\n<noscript><div class="stat-item"><div class="label">A</div></div></noscript>\n')).kind, 'adoptable');
  assert.equal(classifyMount(page('<div class="stat-item">hand</div>')).kind, 'hand');
  assert.equal(classifyMount('<p>no card</p>').kind, 'none');
  assert.equal(classifyMount(page('') + page('')).kind, 'hand', 'two mounts: which is which is not guessed');
  const html = page('<noscript><div><div>nested</div></div></noscript>');
  const m = classifyMount(html);
  assert.equal(html.slice(m.start, m.end), '<div id="ship-stats" class="stats-grid" data-slug="s"><noscript><div><div>nested</div></div></noscript></div>');
  assert.deepEqual(readFallback(html, 'x'), { beam: '1 ft' });
  assert.throws(() => readFallback('<script type="application/json" id="ship-stats-fallback">{bad</script>', 'x'), { code: 'itw_infobox_unavailable' });
  assert.equal(markOpenTag(markOpenTag('<div id="ship-stats" class="g">')), '<div id="ship-stats" class="g" data-infobox="statements">');
});

test('rendering is idempotent: a rendered page renders to itself', { skip }, () => {
  const html = '<main>\n    <div id="ship-stats" class="stats-grid"><noscript>x</noscript></div>\n    <script type="application/json" id="ship-stats-fallback">{"registry":"Bahamas"}</script>\n</main>\n';
  const once = (h) => {
    const m = classifyMount(h);
    const c = renderCard({ entity: E, slug: 'test-ship', statements: [own('crew', 894)], fallback: readFallback(h, 'x'),
      openTag: markOpenTag(m.openTag), indent: m.indent, at: AT, currentValue: contract.currentValue });
    return h.slice(0, m.start) + c.html + h.slice(m.end);
  };
  const first = once(html);
  assert.equal(classifyMount(first).kind, 'marked');
  assert.equal(once(first), first);
  assert.ok(first.includes(MARK_END) && first.includes('id="ship-stats-fallback"'), 'the fallback JSON outside the mount is kept');
});

test('ship-stats.js leaves a rendered card alone', { skip }, () => {
  // The rendered mount holds element children, so the shared renderer's "empty mount" test is false and it
  // draws nothing over the statements. Run the real script against the real rendered Grandiosa card.
  const html = readFileSync(path.join(ROOT, 'ships/msc/msc-grandiosa.html'), 'utf8');
  const kids = [...html.slice(classifyMount(html).start).matchAll(/<div class="stat-line"/g)].length;
  const mount = { nodeType: 1, tagName: 'DIV', attrs: {}, childNodes: Array.from({ length: kids }, () => ({ nodeType: 1, tagName: 'DIV', className: 'stat-line' })),
    setAttribute(k, v) { this.attrs[k] = v; }, getAttribute(k) { return this.attrs[k] ?? null; }, appendChild() { throw new Error('ship-stats.js wrote into a rendered card'); }, querySelectorAll() { return []; } };
  const fb = { textContent: JSON.stringify(readFallback(html, 'grandiosa')) };
  const document = { readyState: 'complete', getElementById: (id) => (id === 'ship-stats' ? mount : id === 'ship-stats-fallback' ? fb : null), createElement: () => ({}), addEventListener() {} };
  vm.runInNewContext(readFileSync(path.join(ROOT, 'assets/js/ship-stats.js'), 'utf8'), { document, window: {} });
  assert.ok(kids > 0);
  assert.equal(mount.getAttribute('data-stats-rendered'), null);
});

test('every pilot card on disk is what its statements render (run admin/lexicon/render-infobox.mjs if this fails)', { skip }, () => {
  const pages = plan(ROOT, contract.currentValue);
  assert.equal(pages.length, 7);
  for (const p of pages) {
    assert.equal(p.kind, 'marked', `${p.rel} is not converted`);
    assert.equal(p.next, p.html, `${p.rel} differs from what the statements render`);
  }
  const legend = pages.find((p) => p.rel === 'ships/rcl/legend-of-the-seas-1995-built.html');
  assert.deepEqual(legend.withheld, ['guests_double'], 'the census conflict on Legend of the Seas (1995) stays off the page');
});
