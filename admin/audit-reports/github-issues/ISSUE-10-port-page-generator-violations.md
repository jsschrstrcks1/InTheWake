# [Generator] Port Page Generator emits forbidden `/ships.html` links and ships incomplete `<!-- FILL -->` templates

**Labels:** bug, standards-violation, generator, link-integrity, high-priority

## Summary
The official gold-standard port page generator (`admin/generate-port-page.cjs`) hard-codes the forbidden `/ships.html` link in its navigation template. It also produces pages containing many unfilled `<!-- FILL: ... -->` markers with no enforcement that content must be completed before the file is written.

This means every new port page generated using the project's recommended tool starts life violating core navigation standards and containing obvious placeholder content.

## Evidence

### 1. Forbidden `/ships.html` link in the emitted template
**File:** `admin/generate-port-page.cjs:120`
```html
<a class="nav-pill" href="/ships.html">Ships</a>
```

This line is inside the `generatePage()` template function and is written verbatim into every new port page.

Confirmed in multiple other generators (see Issue 1 for full list).

### 2. Generator explicitly produces pages with unfilled markers
From `main()` (lines 448–456):
```js
console.log(`  Template has <!-- FILL --> markers for content.`);
...
console.log(`  1. Fill in all <!-- FILL --> markers with port-specific content`);
```

The script writes the file containing dozens of `<!-- FILL: ... -->` comments (seen throughout lines 104–298 and beyond) without any check that they have been replaced.

Examples of markers left in the output:
- `<!-- FILL: Port-specific best season advice -->`
- `<!-- FILL: 800+ word first-person logbook narrative about ${port} -->`
- `<!-- FILL: Descriptive alt text for ${port} hero image -->`
- Many others for excursions, food, notices, depth soundings, gallery images, etc.

### 3. No enforcement or guardrails at write time
- `fs.writeFileSync(outPath, html, 'utf8');` (line 445) happens unconditionally once arguments are valid.
- The only protections are:
  - Refusal to overwrite existing files
  - `--dry-run` mode (optional)
- There is no scan for remaining `<!-- FILL -->` strings before writing.

## Impact
- Every newly generated port page starts with at least one standards violation (`/ships.html`).
- The generator encourages (or at minimum tolerates) the creation of pages that are structurally incomplete.
- This undermines the "gold standard" claim in the file header and the project's strict content standards.
- Contributes to the ongoing need for hundreds of `batch-fix-*` and `fix-*` scripts across the repo.

## Reproduction

```bash
node admin/generate-port-page.cjs --port "TestPort" --country "Test" --region "Test" --lat 0 --lon 0 --currency "USD" --dry-run
# Observe the output contains /ships.html and many <!-- FILL --> markers

# Or actually generate (will fail if file exists, which is good)
```

Then inspect the generated HTML for:
- Line containing `href="/ships.html"`
- Multiple `<!-- FILL: ` comments

## Suggested Fix Direction (for the issue, not to implement here)
- Remove or parameterize the `/ships.html` link in the nav (use `/ships/index.html`).
- Add a post-generation check that fails or warns loudly if any `<!-- FILL -->` markers remain (unless `--allow-incomplete` is passed for early scaffolding).
- Consider making the generator refuse to write a file that still contains unfilled markers by default.

## Related
- Issue 1 (broader `/ships.html` generator problem across multiple files)
- The existence of dozens of post-hoc `batch-fix-*` scripts in `admin/`

**Soli Deo Gloria.**