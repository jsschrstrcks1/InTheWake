// Lexicon C7b: drink-package prices include the gratuity, and the gratuity is marked as able to go stale (Tekton
// itw-c7b-package-prices; operator ruling 2026-10-31, memory 446c35a2). Soli Deo Gloria.
// The reading rules run everywhere; the statement checks need a Project-Sophos contract with freshness.mjs and
// derivedFrom (#1509) and skip, saying so, when it is not beside this checkout.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gratuityTreatment, priceFigure, verifiedDate, calculatorLine, readFigures, loadPriceContract, buildPackageStatements, cents, PACKAGE_DIR, LINE_DIR, REVIEW_FILE } from '../../admin/lexicon/package-statements.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const LEX = process.env.LEXICON_CONTRACT_DIR ? path.resolve(process.env.LEXICON_CONTRACT_DIR) : path.resolve(ROOT, '..', 'Project-Sophos', 'sophos', 'src', 'lexicon');
const skip = existsSync(path.join(LEX, 'freshness.mjs')) ? false : 'no contract with freshness.mjs beside this checkout (Project-Sophos #1509)';
const json = (rel) => JSON.parse(readFileSync(path.join(ROOT, rel), 'utf8'));
const contract = skip ? null : await loadPriceContract({ LEXICON_CONTRACT_DIR: LEX });

test('a note says how the gratuity is treated, or nothing is assumed', () => {
  assert.deepEqual(gratuityTreatment('$9.99–$18/day (+18% gratuity). Fleet pricing is dynamic.'), { add: 0.18 });
  assert.deepEqual(gratuityTreatment('$11.99/day adults (+20% service charge)'), { add: 0.2 });
  assert.deepEqual(gratuityTreatment('$22/day (4+ nights). Gratuity included. For guests under 18.'), { included: true });
  assert.deepEqual(gratuityTreatment('$18/day (15% gratuity included).'), { included: true });
  assert.equal(gratuityTreatment('$50/day'), null);
  assert.equal(gratuityTreatment(undefined), null);
  assert.equal(verifiedDate('RCL beverage gratuity is 18% (verified 2026-04-14 via royalcaribbean.com/faq).'), '2026-04-14T00:00:00.000Z');
  assert.equal(verifiedDate('20% since December 2025.'), null);
});

test("a price is filed only when its note states the treatment, and the stated percentage must be the file's rate", () => {
  assert.deepEqual(priceFigure(9.5, '$9.50/day (+20% gratuity)', 0.2), { kind: 'added', base: 9.5, price: 11.4 });
  assert.deepEqual(priceFigure(22, '$22/day. Gratuity included.', null), { kind: 'included', price: 22 });
  assert.match(priceFigure(9.5, '$9.50/day (+18% gratuity)', 0.2).reason, /adds 18% but the file's rate is 20%/);
  assert.match(priceFigure(9.5, '$9.50/day (+20% gratuity)', null).reason, /rate could not be filed/);
  assert.match(priceFigure(9.5, '$9.50/day', 0.2).reason, /does not say/);
  assert.match(priceFigure(0, 'Included in fare', 0.2).reason, /no price/);
});

test('a calculator line key maps through the alias table, its slug, or its exact name, never a guess', () => {
  const brands = new Set(['norwegian', 'holland-america', 'virgin-voyages']);
  const table = { norwegian: { name: 'Norwegian Cruise Line', aliases: [{ alias: 'ncl' }] }, 'virgin-voyages': { name: 'Virgin Voyages', aliases: [] }, 'holland-america': { name: 'Holland America Line', aliases: [] } };
  assert.equal(calculatorLine('ncl', {}, brands, table).line, 'norwegian');
  assert.equal(calculatorLine('holland', { slug: 'holland-america' }, brands, table).line, 'holland-america');
  assert.equal(calculatorLine('virgin', { slug: 'virgin', name: 'Virgin Voyages' }, brands, table).line, 'virgin-voyages');
  assert.equal(calculatorLine('mystery', { slug: 'mystery', name: 'Mystery Line' }, brands, table), null);
});

test('a stored 0 is "nothing added on top", never a 0 percent rate', () => {
  const f = readFigures(ROOT);
  assert.ok(f.zeroRates.some((z) => z.line === 'line:msc'), 'MSC prices already include the gratuity');
  assert.ok(!f.rates.some((r) => r.value === 0));
});

test("the Bottomless Bubbles convention: each store's base is grossed up by its own stated rate, and they disagree", () => {
  const f = readFigures(ROOT);
  const bubbles = f.prices.filter((p) => p.pkg === 'package:carnival.bottomless-bubbles' && p.kind === 'added');
  assert.deepEqual(bubbles.map((p) => [p.file.split('/').pop(), p.base, p.price]).sort(), [['calculator-config.json', 11.99, 14.39], ['carnival.json', 9.5, 11.4]]);
  for (const p of bubbles) assert.equal(p.price, cents(p.base * (1 + p.rate.value)));
});

test('every inclusive price derived from a base names its base and its rate; the rate is a statement of the line', { skip }, async () => {
  const { statements } = await buildPackageStatements(ROOT, contract);
  const byId = new Map(statements.map((s) => [s.id, s]));
  const derived = statements.filter((s) => s.ext.property === 'price_per_day' && s.lineage.parents.length);
  assert.ok(derived.length > 0);
  for (const s of derived) {
    const props = s.lineage.parents.map((id) => byId.get(id)?.ext.property).sort();
    assert.deepEqual(props, ['base_price_per_day', 'beverage_gratuity_rate'], s.subject);
    const base = s.lineage.parents.map((id) => byId.get(id)).find((x) => x.ext.property === 'base_price_per_day');
    const rate = s.lineage.parents.map((id) => byId.get(id)).find((x) => x.ext.property === 'beverage_gratuity_rate');
    assert.equal(s.ext.value, cents(base.ext.value * (1 + rate.ext.value)), s.subject);
    assert.match(rate.ext.entity, /^line:/);
  }
});

test('a rate past its window reads stale, and every price built on it reads stale too, without any record changing', { skip }, async () => {
  const { statements, packs } = await buildPackageStatements(ROOT, contract);
  const ttl = (s) => (s.ext.pack === 'cruise.line' ? packs.line : packs.pkg).properties[s.ext.property]?.ttl_days ?? null;
  const parents = new Map(statements.map((s) => [s.id, { statement: s, ttlDays: ttl(s) }]));
  const rcRate = statements.find((s) => s.subject === 'line:royal-caribbean#beverage_gratuity_rate' && s.timestamps.observed_at.startsWith('2026-04-14'));
  assert.ok(rcRate, 'the calculator rate is dated by its own "verified 2026-04-14"');
  const at = (iso) => contract.freshness(rcRate, { ttlDays: ttl(rcRate), at: iso, parents }).state;
  assert.equal(at('2026-05-01T00:00:00.000Z'), 'fresh');
  assert.equal(at('2026-11-01T00:00:00.000Z'), 'stale');
  const built = statements.filter((s) => s.lineage.parents.includes(rcRate.id));
  assert.ok(built.length > 0);
  for (const s of built) {
    const f = contract.freshness(s, { ttlDays: ttl(s), at: '2026-11-01T00:00:00.000Z', parents });
    assert.ok(['stale', 'rests_on_stale'].includes(f.state), `${s.subject}: ${f.state}`);
  }
});

test('the entity files and the review list are exactly what the files say (regenerate if this fails)', { skip }, async () => {
  const { files } = await buildPackageStatements(ROOT, contract);
  for (const [rel, text] of Object.entries(files)) assert.equal(readFileSync(path.join(ROOT, rel), 'utf8'), text, rel);
  for (const d of [PACKAGE_DIR, LINE_DIR]) assert.deepEqual(readdirSync(path.join(ROOT, d)).map((f) => `${d}/${f}`).sort(), Object.keys(files).filter((r) => r.startsWith(d)).sort());
  assert.ok(json(REVIEW_FILE).counts.disputes > 0);
});
