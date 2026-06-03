# [Generator] Gold-standard port page generator hardcodes forbidden navigation and lacks write-time validation enforcement

**Labels:** critical,generator,validator,standards-enforcement,navigation

## Summary

The project's own "Gold Standard" port page generator (`admin/generate-port-page.cjs`) hard-codes the forbidden `/ships.html` link in its navigation template and writes output files with no call to any validator or standards checker before `fs.writeFileSync`.

This means the recommended tool for creating new port pages (the one that claims to enforce ICP-2, LOGBOOK standards, and "all 21 audit detections") is itself a source of known standards violations.

## Evidence

### 1. Hardcoded forbidden link (confirmed in current source)
File: `admin/generate-port-page.cjs:120`

```html
<a class="nav-pill" href="/ships.html">Ships</a>
```

This is inside the `generatePage()` template function and is emitted verbatim into every new port page.

### 2. No validator or standards enforcement before write
The only write logic (around line 445):

```js
fs.writeFileSync(outPath, html, 'utf8');
```

There is no call to:
- `validate-port-page` or any validator
- Link integrity checks
- Navigation standards checker
- Any of the project's own audit scripts

The script has `--dry-run` mode, but even in normal mode it performs no automated standards validation before writing.

### 3. Self-description vs reality
The file header claims:

> "Enforces ICP-2 v2.1, LOGBOOK_ENTRY_STANDARDS v2.300, and all 21 audit detections."

In practice it only does template substitution + some basic JSON-LD scaffolding. It does not enforce the documented navigation contract (`/ships/index.html`), section requirements, or other standards at generation time.

## Impact

- Every newly generated port page starts life with at least one high-severity standards violation (the `/ships.html` link).
- The "gold standard" generator actively contributes to the problems it is supposed to prevent.
- This is a root cause of the large number of post-hoc `fix-port-*` and batch-fix scripts.
- New contributors following the documented recommended workflow will introduce known defects.

## Reproduction

```bash
node admin/generate-port-page.cjs --port "TestPort" --country "Test" --region "Test" --lat 0 --lon 0 --currency "USD" --dry-run
```

Inspect the output for:
- `href="/ships.html"`
- Absence of any validator call in the code path

## Related

- #1703 and #1708 (the `/ships.html` violation across generators)
- #1711 (systemic batch-fix evidence)
- Main audit report Issue 1 and the generator sections

**Soli Deo Gloria.**