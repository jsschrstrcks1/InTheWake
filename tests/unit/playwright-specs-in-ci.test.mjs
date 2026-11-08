// Every Playwright spec is run by CI, or is named here as local-only with the reason. Soli Deo Gloria.
//
// WHY. A spec that no workflow runs can go red and stay red with nobody seeing it. Measured on main d2d06447
// (2026-11-08): of eight specs in tests/playwright, CI ran three. Of the five it did not run, two were red.
// cruise-tipping-calculator.spec.js had two tests timing out under a third-party cookie dialog.
// voyage-companion-usage.spec.js had been asserting the old wire format since 2026-10-05, when 3f6bf6bb
// changed what the companions send to the usage relay. Both were broken for weeks, and no check failed.
//
// THE RULE. A spec under tests/playwright is either named in a `playwright test` command in a workflow under
// .github/workflows, or listed in LOCAL_ONLY below with the reason it cannot run there. Not both, and not
// neither. A `playwright test` command that names no spec file runs them all, and covers every spec.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SPEC_DIR = path.join(ROOT, 'tests', 'playwright');
const WORKFLOW_DIR = path.join(ROOT, '.github', 'workflows');
const SPEC_RE = /\.spec\.(?:js|mjs|cjs|ts)$/;

// A spec belongs here only when CI cannot run it. Say why, so the next reader can tell whether it still holds.
export const LOCAL_ONLY = {
  'jerusha-gallery.spec.js':
    'needs the plaintext payload source, which is gitignored and exists only on the M4; elsewhere the test skips itself',
};

/** The spec files under tests/playwright, at any depth, as playwright.config.js testDir finds them. */
export function specFiles(dir = SPEC_DIR) {
  const names = readdirSync(dir, { recursive: true }).map(String).filter((f) => SPEC_RE.test(f)).map((f) => path.basename(f));
  const dupes = names.filter((n, i) => names.indexOf(n) !== i);
  assert.deepEqual(dupes, [], 'two specs share a file name; a workflow names a spec by file name, so keep them distinct');
  return names.sort();
}

/** What the workflows run: the spec names each `playwright test` command lists, and whether any names none. */
export function workflowRuns(texts) {
  const named = new Set();
  let runsAll = false;
  for (const text of texts) {
    for (const line of text.split('\n')) {
      if (line.trimStart().startsWith('#')) continue;
      const m = /\bplaywright\s+test\b(.*)$/.exec(line);
      if (!m) continue;
      const args = m[1].split(/\s+/).filter(Boolean);
      const specs = args.filter((a) => !a.startsWith('-') && SPEC_RE.test(a)).map((a) => path.basename(a));
      if (specs.length) specs.forEach((s) => named.add(s));
      else if (!args.some((a) => !a.startsWith('-'))) runsAll = true;
    }
  }
  return { named, runsAll };
}

function readWorkflows(dir = WORKFLOW_DIR) {
  return readdirSync(dir).filter((f) => /\.ya?ml$/.test(f)).map((f) => readFileSync(path.join(dir, f), 'utf8'));
}

/** The specs that are neither run by CI nor local-only, and the ones that claim to be both. */
export function audit(specs, runs, localOnly = LOCAL_ONLY) {
  const inCi = (s) => runs.runsAll || runs.named.has(s);
  return {
    unrun: specs.filter((s) => !inCi(s) && !(s in localOnly)),
    both: specs.filter((s) => inCi(s) && s in localOnly),
    staleLocal: Object.keys(localOnly).filter((s) => !specs.includes(s)),
    missingInCi: [...runs.named].filter((s) => !specs.includes(s)),
  };
}

test('every Playwright spec is run by CI or named local-only with a reason', () => {
  const specs = specFiles();
  assert.ok(specs.length > 0, 'found the specs in tests/playwright');
  const { unrun, both } = audit(specs, workflowRuns(readWorkflows()));
  assert.deepEqual(unrun, [], 'no workflow runs these and LOCAL_ONLY does not name them: add a step to quality.yml, or a reason here');
  assert.deepEqual(both, [], 'CI runs these, so they are not local-only: take them out of LOCAL_ONLY');
});

test('the lists name only specs that exist, and every local-only spec says why', () => {
  const { staleLocal, missingInCi } = audit(specFiles(), workflowRuns(readWorkflows()));
  assert.deepEqual(staleLocal, [], 'LOCAL_ONLY names a spec that is not in tests/playwright');
  assert.deepEqual(missingInCi, [], 'a workflow runs a spec that is not in tests/playwright');
  for (const [spec, why] of Object.entries(LOCAL_ONLY)) {
    assert.ok(typeof why === 'string' && why.trim().length >= 20, `${spec}: say why it cannot run in CI`);
  }
});

test('the reader: a named spec is covered, a bare run covers all, a comment or a flag is not a spec', () => {
  const r = workflowRuns([
    '      - run: npx playwright test a.spec.js --workers=1',
    '      # - run: npx playwright test commented.spec.js',
    '        run: npx playwright test tests/playwright/b.spec.js c.spec.js',
  ]);
  assert.deepEqual([...r.named].sort(), ['a.spec.js', 'b.spec.js', 'c.spec.js']);
  assert.equal(r.runsAll, false);
  assert.equal(workflowRuns(['run: npx playwright test --workers=1']).runsAll, true);
  assert.equal(workflowRuns(['run: npx playwright test -g "compare mode"']).runsAll, false, 'a grep filter is not a run of all');
  const a = audit(['a.spec.js', 'd.spec.js', 'e.spec.js'], r, { 'e.spec.js': 'x'.repeat(20) });
  assert.deepEqual(a.unrun, ['d.spec.js']);
  assert.deepEqual(a.missingInCi.sort(), ['b.spec.js', 'c.spec.js']);
});
