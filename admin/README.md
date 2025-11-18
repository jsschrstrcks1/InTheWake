# Admin Tools & Scripts

This directory contains administrative tools, scripts, and reports for managing the In the Wake website.

**Last Updated:** 2025-11-18
**Session:** claude/track-thread-status-01VdXW51MuvV3Vpa9UBrH2n9

---

## 📁 Directory Structure

```
admin/
├── README.md                    # This file
├── reports/                     # Generated reports and audits
│   ├── articles.html           # Articles audit report
│   └── sw-health.html          # Service worker health check
├── webp_audit.py               # Comprehensive WebP status audit
├── rename_webp_files.py        # Rename WebP files to match code expectations
├── update_to_webp.py           # Update HTML/JS to use WebP (general)
├── update_fom_to_webp.py       # Update FOM gallery images to WebP
├── update_hero_to_webp.py      # Update hero images to WebP
├── verify_webp_files.py        # Verify WebP files exist for all references
└── verify_webp_updates.py      # Verify WebP updates are valid
```

---

## 🖼️ WebP Image Management Tools

### `webp_audit.py`
**Purpose:** Comprehensive audit of WebP conversion status across entire site
**Usage:** `python3 admin/webp_audit.py`

**What it does:**
- Counts all WebP files in assets/ships/
- Counts all JPG/JPEG files in assets/ships/
- Identifies which JPGs have WebP equivalents
- Scans all HTML and JS files for image references
- Reports which files still use JPG/JPEG vs WebP
- Checks logo status (should stay as PNG)

**Output:**
- Total WebP files available
- Total references to update
- Top 10 files with most JPG/JPEG references
- Summary of conversion status

---

### `rename_webp_files.py`
**Purpose:** Rename WebP files to match code expectations
**Usage:** `python3 admin/rename_webp_files.py`

**What it does:**
- Finds all WebP files with spaces in names (e.g., "FOM- - 1.webp")
- Removes spaces and lowercases filenames (e.g., "fom-1.webp")
- Preserves file integrity during rename
- Reports success/failures

**Example transforms:**
```
Ovation-of-the-seas-FOM- - 1.webp  →  ovation-of-the-seas-fom-1.webp
Grandeur-of-the-seas-FOM- - 7.webp →  grandeur-of-the-seas-fom-7.webp
```

**Output:**
- Number of files renamed
- Number of files skipped (already correct)
- List of all transformations

---

### `update_to_webp.py`
**Purpose:** Update a single HTML file to use WebP images
**Usage:** `python3 admin/update_to_webp.py <filepath>`

**What it does:**
- Reads specified HTML file
- Replaces all `.jpg` and `.jpeg` references with `.webp`
- Only updates references in `assets/ships/` directory
- Preserves logo_wake.png (safety check)
- Handles quotes, attributes, JS strings, onerror handlers

**Safety features:**
- Never modifies logo references
- Only replaces if WebP file exists
- Reports number of changes made

**Example:**
```bash
python3 admin/update_to_webp.py ships/rcl/ovation-of-the-seas.html
# Output: ships/rcl/ovation-of-the-seas.html: Updated 27 refs → 27 WebP refs
```

---

### `update_fom_to_webp.py`
**Purpose:** Update FOM (Flickers of Majesty) gallery images to WebP
**Usage:** `python3 admin/update_fom_to_webp.py`

**What it does:**
- Scans all HTML files for FOM gallery image references
- Updates `-FOM-{num}.jpeg` to `-fom-{num}.webp`
- Handles both spaced (`FOM- - 1`) and non-spaced (`FOM-1`) patterns
- Only updates if corresponding WebP file exists

**Pattern matching:**
- `FOM- - 1.jpeg` → `fom-1.webp`
- `FOM-1.jpeg` → `fom-1.webp`
- Case insensitive matching

**Output:**
- Number of WebP files available
- Number of HTML files with FOM references
- Number of files updated vs skipped
- Changes per file

---

### `update_hero_to_webp.py`
**Purpose:** Update hero/thumbnail images to WebP
**Usage:** `python3 admin/update_hero_to_webp.py`

**What it does:**
- Finds all non-FOM WebP files (hero images, thumbnails)
- Scans HTML files for matching JPG/JPEG references
- Updates references to use WebP equivalents
- Only updates if WebP file exists

**Excludes:**
- FOM gallery images (handled by update_fom_to_webp.py)
- Logo files (must stay as PNG)

**Output:**
- List of available WebP hero files
- Files updated with reference counts
- Summary of changes

---

### `verify_webp_files.py`
**Purpose:** Verify all WebP references have corresponding files
**Usage:** `python3 admin/verify_webp_files.py`

**What it does:**
- Lists all WebP files in assets/ships/
- Scans code for all WebP references
- Checks if referenced files actually exist
- Identifies missing files
- Identifies unused WebP files

**Output:**
- Total WebP files available
- Total unique references in code
- List of missing files (if any)
- List of unused files (if any)
- Final status: COMPLETE or INCOMPLETE

---

### `verify_webp_updates.py`
**Purpose:** Verify WebP updates are valid after conversion
**Usage:** `python3 admin/verify_webp_updates.py`

**What it does:**
- Counts WebP files in assets/ships/
- Scans all HTML files for WebP references
- Verifies all referenced WebP files exist
- Checks for remaining FOM JPEG references
- Provides comprehensive verification report

**Verification checks:**
- ✅ All WebP references valid (files exist)
- ✅ No FOM JPEG references remaining
- ✅ No missing files

**Output:**
- Number of WebP files
- Number of unique references
- Number of total references
- Missing files count
- Remaining JPEG references count
- Final status: PASSED or INCOMPLETE

---

## 📊 Reports

### `reports/articles.html`
Generated HTML report of all articles on the site.

### `reports/sw-health.html`
Service worker health check report.

---

## 🔄 Typical WebP Conversion Workflow

When converting images to WebP format, follow this sequence:

1. **Audit current status:**
   ```bash
   python3 admin/webp_audit.py
   ```

2. **Rename WebP files to match code expectations:**
   ```bash
   python3 admin/rename_webp_files.py
   ```

3. **Update FOM gallery images:**
   ```bash
   python3 admin/update_fom_to_webp.py
   ```

4. **Update hero images:**
   ```bash
   python3 admin/update_hero_to_webp.py
   ```

5. **Verify all updates are valid:**
   ```bash
   python3 admin/verify_webp_updates.py
   ```

6. **Final verification:**
   ```bash
   python3 admin/verify_webp_files.py
   ```

7. **Commit and push changes**

---

## 📝 Notes

- **WebP Status:** As of 2025-11-18, main branch has comprehensive WebP conversion complete (commit ecdb983)
- **Logo Exception:** logo_wake.png must always stay as PNG (not WebP) for transparency support
- **Exclusions:** /vendors/ folder should never be modified
- **Safety:** All scripts verify files exist before updating references

---

## 🚀 Future Tools

Potential future additions to this directory:
- Image optimization scripts
- Navigation audit tools
- Ship data validation
- Logbook generation helpers
- Attribution workflow automation

---

**For questions or issues with these tools, refer to the session logs or UNFINISHED_TASKS.md**
