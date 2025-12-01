# Validate Ship Page

Validate a ship page against the SHIP_PAGE_CHECKLIST_v3.010 standards.

## Usage

```
/validate-ship [path-to-ship-page]
```

If no path provided, validates all ship pages in `/ships/`.

## Instructions for Claude

When this command is invoked:

1. **If a specific file is provided:**
   - Run `./admin/validate-ship-page.sh <file>`
   - Report the results
   - If errors found, offer to fix them

2. **If no file provided:**
   - Find all HTML files in `/ships/` directories
   - Run validation on each
   - Summarize results

3. **After validation:**
   - If ERRORS found: List all errors and ask user if they want them fixed
   - If WARNINGS found: List warnings and suggest improvements
   - If PASSED: Confirm compliance

## Validation Script Location

```
./admin/validate-ship-page.sh
```

## Standards Reference

```
new-standards/v3.010/SHIP_PAGE_CHECKLIST_v3.010.md
```

## Example Output Interpretation

- `✓` = Check passed
- `✗` = Critical error (must fix)
- `⚠` = Warning (should fix)

## Exit Codes

- `0` = All checks passed
- `1` = Critical errors found
- `2` = Warnings found

---

**Soli Deo Gloria** ✝️
