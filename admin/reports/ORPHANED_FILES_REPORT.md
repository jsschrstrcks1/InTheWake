# Orphaned Files Report

**Generated:** 2025-11-23 (Updated after rebase)
**Purpose:** Identify files superseded by standards rebuild
**Context:** Post-catastrophe cleanup after /new-standards/ creation
**Repository State:** Current as of commit ef774468

---

## Executive Summary

**Total Orphaned:** ~31.4 MB across 928 files/directories
**Status:** Safe to archive or delete
**Recommendation:** Archive working docs, delete temporary files

### Orphaned Categories

| Category | Size | Files | Recommendation |
|----------|------|-------|----------------|
| old-files/ | 8.1 MB | 663 | Archive or delete |
| old-files-extracted/ | 23 MB | 250 | Delete (working directory) |
| standards/ (old) | 35 KB | 7 | Archive or delete |
| Working scripts | 11.8 KB | 4 | Delete |
| Working docs (rebuild) | 292 KB | 11 | Archive |
| **TOTAL** | **31.4 MB** | **935** | |

---

## Category 1: old-files/ Directory

**Path:** `/old-files/`
**Size:** 8.1 MB
**File Count:** 663 files
**Status:** ⚠️ ORPHANED (superseded by /new-standards/)

### What It Contains

Original 913 fragment files found during catastrophe, now organized:
- 34 .zip archives (extracted to old-files-extracted/)
- 629 extracted/loose files (.md, .html, .json, .css, .js, .txt)
- Placeholders directory
- Multiple duplicate standards files

### Deduplication Results

```
913 original files
- 776 MD5 duplicates (85%)
= 137 unique files (all analyzed and preserved)
```

**All unique content preserved in:**
- `/new-standards/foundation/` (7 master documents)
- `/new-standards/v3.010/` (4 innovation documents)
- Live implementation (266 HTML files verified)

### File Breakdown

**By Type:**
- Standards (.md): ~480 files
- Templates (.html): ~85 files
- Data (.json): ~45 files
- Stylesheets (.css): ~25 files
- Scripts (.js): ~20 files
- Archives (.zip): 34 files (extracted)
- Misc (.txt, .csv, etc.): ~8 files

**By Version:**
- v2.x standards: ~150 files
- v3.001-v3.009: ~320 files
- v3.100: ~15 files
- Unversioned/templates: ~178 files

### Recommendation

**Option A: DELETE** ✅ Recommended for production
- All unique content preserved in /new-standards/
- FRAGMENT_INVENTORY.md has complete MD5 map for recovery
- Saves 8.1 MB

**Option B: ARCHIVE** ✅ Recommended for development
- Move to admin/archive/rebuild-2025-11-23/
- Keep for historical reference
- Useful for disaster recovery

**Option C: KEEP**
- Leave in place as archival backup
- Cost: 8.1 MB disk space
- Ensure in .gitignore to prevent accidental commits

### Safety Check

Before deletion, verify:
- [x] /new-standards/ has 14 files (README + VERSION_TIMELINE + 7 foundation + 4 v3.010)
- [x] FRAGMENT_INVENTORY.md exists (MD5 deduplication map)
- [x] EXTRACTION_PROGRESS.md documents all 137 unique files analyzed
- [x] No unique files added since 2025-11-23

---

## Category 2: old-files-extracted/ Directory

**Path:** `/old-files-extracted/`
**Size:** 23 MB
**File Count:** 250 files
**Status:** ⚠️ ORPHANED (working directory only)

### What It Contains

Extraction working directory created during rebuild:
- Contents of 34 .zip archives from /old-files/
- Organized into 31 bundle subdirectories
- Temporary files from extraction process

### Example Structure

```
old-files-extracted/
├── InTheWake_Standards_v3.001_bundle/
├── InTheWake_Standards_v2.4/
├── InTheWake_Planning_v0.4_Galveston/
├── [28 more bundle directories...]
└── extraction temporary files
```

### All Contents Already Analyzed

**Status:** ✅ 100% complete
- All extracted files included in MD5 deduplication
- All unique files preserved in /new-standards/
- Working directory no longer needed

### Recommendation

**DELETE** ✅ Strongly recommended
- Pure working directory (temporary extraction location)
- All contents already processed and preserved
- Saves 23 MB
- Can be regenerated from /old-files/*.zip if needed

**Command to delete:**
```bash
rm -rf old-files-extracted/
```

### Safety Check

Before deletion, verify:
- [x] All .zip files still in /old-files/ (can re-extract if needed)
- [x] EXTRACTION_PROGRESS.md documents complete analysis
- [x] /new-standards/ contains all preserved content

---

## Category 3: standards/ (Old Directory)

**Path:** `/standards/`
**Size:** 35 KB
**File Count:** 7 files
**Status:** ⚠️ ORPHANED (superseded by /new-standards/)

### What It Contains

Old standards directory from pre-catastrophe:
- STANDARDS_ADDENDUM_RCL_v3.006.md (1.4 KB)
- cruise-lines-standards.md (386 bytes)
- main-standards.md (3.0 KB)
- ports-standards.md (1.9 KB)
- root-standards.md (1.3 KB)
- ships-standards.md (1.1 KB)
- starter.html (25 KB)

### Version Status

**Most recent:** v3.006 (Invocation Edition)
**Current version:** v3.010.300

**All content superseded by:**
- /new-standards/foundation/ (v3.007-v3.100)
- /new-standards/v3.010/ (current innovations)

### Analysis

**STANDARDS_ADDENDUM_RCL_v3.006.md:**
- Invocation comment requirements
- ✅ Preserved in /new-standards/foundation/ documents

**main-standards.md, ships-standards.md, etc.:**
- Partial/modular standards
- ✅ Superseded by Unified_Modular_Standards_v3.007.010.md (complete superset)

**starter.html:**
- Old template file
- ✅ Superseded by live implementation templates

### Recommendation

**Option A: DELETE** ✅ Recommended
- All content superseded by /new-standards/
- Saves 35 KB (minimal)
- Reduces confusion (single source of truth)

**Option B: ARCHIVE**
- Move to admin/archive/rebuild-2025-11-23/standards-old/
- Add README explaining superseded status
- Keep for historical reference

**Command to delete:**
```bash
rm -rf standards/
```

### Safety Check

Before deletion, verify:
- [x] /new-standards/ contains v3.006 invocation requirements
- [x] /new-standards/ contains complete unified standards
- [x] No references to /standards/ in active HTML files

---

## Category 4: Working Scripts

**Files:** 4 shell scripts
**Size:** 11.8 KB total
**Status:** ⚠️ ORPHANED (one-time rebuild tools)

### Files

1. **extract_zips.sh** (669 bytes)
   - Purpose: Extract all .zip files from /old-files/
   - Status: ✅ Completed (created /old-files-extracted/)
   - Usage: One-time (Task 2)

2. **detect_duplicates.sh** (3.4 KB)
   - Purpose: MD5 hash all files, identify duplicates
   - Status: ✅ Completed (created FRAGMENT_INVENTORY.md)
   - Usage: One-time (Task 5)

3. **extract_unique_files.sh** (4.5 KB)
   - Purpose: Extract unique files for analysis
   - Status: ✅ Completed (identified 137 unique files)
   - Usage: One-time (Task 6)

4. **analyze_remaining_files.sh** (3.2 KB)
   - Purpose: Helper for systematic file reading
   - Status: ✅ Completed (analyzed all 137 files)
   - Usage: One-time (Task 6)

### Recommendation

**DELETE** ✅ Strongly recommended
- One-time rebuild tools (no longer needed)
- All outputs preserved (FRAGMENT_INVENTORY.md, etc.)
- Can be recreated if needed for future rebuild
- Saves 11.8 KB

**Command to delete:**
```bash
rm extract_zips.sh detect_duplicates.sh extract_unique_files.sh analyze_remaining_files.sh
```

### Preservation

Scripts were simple bash tools. Key logic preserved in documentation:
- MD5 deduplication: `md5sum file | awk '{print $1}'`
- Zip extraction: `unzip -q file.zip -d destination/`
- File counting: `find . -type f | wc -l`

---

## Category 5: Standards Rebuild Working Documentation

**Files:** 11 markdown documents
**Size:** 292 KB total
**Status:** ⚠️ ORPHANED (working docs from rebuild)

### Files (Sorted by Size)

1. **UNFINISHED_TASKS.md** (88 KB)
   - Purpose: Original comprehensive task list from catastrophe
   - Status: ⚠️ ARCHIVE (historical value)
   - Contains: Complete task breakdown, all now complete
   - Note: Very detailed, historical reference

2. **DUPLICATE_ANALYSIS.md** (57 KB)
   - Purpose: Detailed duplicate file analysis
   - Status: ⚠️ ARCHIVE
   - Contains: MD5 analysis, duplicate patterns
   - Superseded by: FRAGMENT_INVENTORY.md (more concise)

3. **NEW_RULES_EXTRACTION.md** (47 KB)
   - Purpose: Working notes during extraction
   - Status: ⚠️ DELETE or ARCHIVE
   - Contains: Raw extraction notes, file-by-file progress
   - Superseded by: EXTRACTION_PROGRESS.md (cleaned up version)

4. **CONSOLIDATED_TASK_LIST_2025_11_23.md** (21 KB)
   - Purpose: 11-task rebuild plan
   - Status: ⚠️ ARCHIVE
   - Contains: Original task list (all complete)
   - Historical value: Shows rebuild scope

5. **STANDARDS_REBUILD_REBASE.md** (18 KB)
   - Purpose: Rebase documentation from rebuild
   - Status: ⚠️ ARCHIVE
   - Contains: Rebuild progress tracking
   - Historical value: Shows rebuild process

6. **UNIQUE_FILES_LIST.md** (16 KB)
   - Purpose: List of 137 unique files identified
   - Status: ⚠️ ARCHIVE
   - Contains: Complete list of unique files
   - Reference value: Quick lookup of what was found

7. **FRAGMENT_INVENTORY.md** (11 KB)
   - Purpose: Complete MD5 deduplication map
   - Status: ⚠️ KEEP/ARCHIVE
   - Contains: MD5 hashes, duplicate groups, file paths
   - **Critical:** Disaster recovery reference

8. **EXTRACTION_PROGRESS.md** (11 KB)
   - Purpose: Systematic analysis log (files 1-137)
   - Status: ⚠️ KEEP/ARCHIVE
   - Contains: Batch summaries, key discoveries, version timeline
   - **Important:** Documents what was found

9. **STANDARDS_VERIFICATION_REPORT.md** (11 KB)
   - Purpose: Verification against live implementation
   - Status: ⚠️ KEEP/ARCHIVE
   - Contains: 266 HTML files verified, innovation discoveries
   - **Important:** Proof of verification

10. **CONFLICT_RESOLUTIONS.md** (9.6 KB)
    - Purpose: Document zero conflicts found
    - Status: ⚠️ KEEP/ARCHIVE
    - Contains: Conflict resolution doctrine, prevention guide
    - **Important:** Future conflict resolution reference

11. **TASK_7_COMPLETE.md** (6.1 KB)
    - Purpose: Task 7 completion summary
    - Status: ⚠️ DELETE
    - Contains: Short summary (duplicates STANDARDS_VERIFICATION_REPORT.md)
    - Recommendation: Delete (info preserved elsewhere)

12. **REMAINING_FILES_ANALYSIS.md** (5.2 KB)
    - Purpose: Analysis of remaining files
    - Status: ⚠️ ARCHIVE or DELETE
    - Contains: Working notes
    - Recommendation: Delete (superseded by other docs)

### Recommendation

**ARCHIVE (move to admin/archive/rebuild-2025-11-23/):**

Critical documentation (disaster recovery):
- FRAGMENT_INVENTORY.md (11 KB) - MD5 map
- EXTRACTION_PROGRESS.md (11 KB) - What was found
- STANDARDS_VERIFICATION_REPORT.md (11 KB) - Proof of work
- CONFLICT_RESOLUTIONS.md (9.6 KB) - Resolution doctrine

Historical reference (rebuild process):
- CONSOLIDATED_TASK_LIST_2025_11_23.md (21 KB) - Original plan
- UNFINISHED_TASKS.md (88 KB) - Complete task breakdown
- UNIQUE_FILES_LIST.md (16 KB) - Quick lookup
- STANDARDS_REBUILD_REBASE.md (18 KB) - Rebase tracking

**DELETE:**
- TASK_7_COMPLETE.md (6.1 KB) - Duplicate info
- REMAINING_FILES_ANALYSIS.md (5.2 KB) - Working notes
- NEW_RULES_EXTRACTION.md (47 KB) - Raw notes (superseded by EXTRACTION_PROGRESS.md)
- DUPLICATE_ANALYSIS.md (57 KB) - Superseded by FRAGMENT_INVENTORY.md

**Commands:**
```bash
# Create archive
mkdir -p admin/archive/rebuild-2025-11-23/working-docs

# Move critical documentation
mv FRAGMENT_INVENTORY.md admin/archive/rebuild-2025-11-23/working-docs/
mv EXTRACTION_PROGRESS.md admin/archive/rebuild-2025-11-23/working-docs/
mv CONFLICT_RESOLUTIONS.md admin/archive/rebuild-2025-11-23/working-docs/
mv STANDARDS_VERIFICATION_REPORT.md admin/archive/rebuild-2025-11-23/working-docs/

# Move historical reference
mv CONSOLIDATED_TASK_LIST_2025_11_23.md admin/archive/rebuild-2025-11-23/working-docs/
mv UNFINISHED_TASKS.md admin/archive/rebuild-2025-11-23/working-docs/
mv UNIQUE_FILES_LIST.md admin/archive/rebuild-2025-11-23/working-docs/
mv STANDARDS_REBUILD_REBASE.md admin/archive/rebuild-2025-11-23/working-docs/

# Delete duplicates/raw working files
rm TASK_7_COMPLETE.md
rm REMAINING_FILES_ANALYSIS.md
rm NEW_RULES_EXTRACTION.md
rm DUPLICATE_ANALYSIS.md
```

**Space saved by deletion:** 115 KB
**Space archived:** 177 KB

---

## Category 6: Completed Status Files (NOT ORPHANED)

**Files:** 2 markdown documents
**Size:** 20.6 KB total
**Status:** ✅ KEEP (completion documentation)

### Files

1. **STANDARDS_REBUILD_COMPLETE.md** (12 KB)
   - Purpose: Final completion summary
   - Status: ✅ KEEP
   - Contains: Complete rebuild summary, all 12 tasks
   - Location: Root (high visibility)

2. **DISCARDED_ITEMS_EVALUATION.md** (8.6 KB)
   - Purpose: "Wheat in chaff" analysis
   - Status: ✅ KEEP
   - Contains: Proof that zero information was lost
   - Location: Root (reference document)

### Recommendation

**KEEP both files** - These are final deliverables documenting successful completion.

---

## Not Orphaned (Current Production Files)

### Active Documentation (NOT orphaned, keep all)

The following markdown files at root are **PRODUCTION DOCUMENTATION** and should be kept:

**Site Documentation:**
- ATTRIBUTIONS.md (2.1 KB)
- CACHE_HEADERS_README.md (2.7 KB)
- IMAGE_ATTRIBUTION_TRACKING.md (5.4 KB)
- INTELLIGENT_BREADCRUMBS_README.md (12 KB)
- QUICK_START_BREADCRUMBS.md (2.4 KB)
- STATEROOM-CHECK-EMBED-SNIPPET.md (12 KB)

**Navigation Documentation:**
- NAVIGATION_COMPOSITE.md (14 KB)
- NAVIGATION_PHASE2_PRIORITY_LIST.md (6.3 KB)
- NAVIGATION_PHASE2_TEMPLATE_UPGRADES.md (9.2 KB)

**Ship/Port Documentation:**
- SHIP_DATA_AND_IMAGES_GUIDE.md (9.8 KB)
- SHIP_IMAGES_WIKIMEDIA_COMMONS.md (8.3 KB)
- SHIP_STATUS_SUMMARY.md (5.5 KB)
- PORT_TRACKER_ROADMAP.md (19 KB)

**Site Audits & Improvements:**
- AUDIT_APPENDIX_2025_11_19.md (11 KB)
- AUDIT_REPORT_2025_11_19.md (12 KB)
- SESSION_AUDIT_2025_11_23.md (6.4 KB)
- PERFORMANCE_OPTIMIZATIONS_COMPLETED.md (7.7 KB)
- TEMPLATE_IMPROVEMENTS.md (11 KB)

**Total Production Docs:** 17 files, 165 KB

### Active Directories

**DO NOT DELETE:**

✅ **/new-standards/** (14 files, ~150 KB)
- Official consolidated standards
- Current source of truth
- Foundation (v3.007-v3.100) + v3.010 innovations

✅ **/admin/claude/** (4 files)
- STANDARDS_GUIDE.md (guide for future sessions)
- CODEBASE_GUIDE.md, ITW-LITE_PROTOCOL.md, STANDARDS_INDEX.md

✅ **/admin/** (all other files)
- Active documentation
- Article evaluations, audit reports, etc.

✅ **Production directories:**
- /ships/, /ports/, /restaurants/, /cruise-lines/
- /assets/, /data/, /images/
- /authors/, /solo/
- All HTML pages

---

## Cleanup Commands

### Recommended Approach: Archive + Delete

Archive working docs, delete temporary files:

```bash
# Create archive structure
mkdir -p admin/archive/rebuild-2025-11-23/working-docs

# Archive old directories
mv old-files/ admin/archive/rebuild-2025-11-23/
mv old-files-extracted/ admin/archive/rebuild-2025-11-23/
mv standards/ admin/archive/rebuild-2025-11-23/standards-old/

# Archive critical working docs (disaster recovery)
mv FRAGMENT_INVENTORY.md admin/archive/rebuild-2025-11-23/working-docs/
mv EXTRACTION_PROGRESS.md admin/archive/rebuild-2025-11-23/working-docs/
mv CONFLICT_RESOLUTIONS.md admin/archive/rebuild-2025-11-23/working-docs/
mv STANDARDS_VERIFICATION_REPORT.md admin/archive/rebuild-2025-11-23/working-docs/

# Archive historical reference docs
mv CONSOLIDATED_TASK_LIST_2025_11_23.md admin/archive/rebuild-2025-11-23/working-docs/
mv UNFINISHED_TASKS.md admin/archive/rebuild-2025-11-23/working-docs/
mv UNIQUE_FILES_LIST.md admin/archive/rebuild-2025-11-23/working-docs/
mv STANDARDS_REBUILD_REBASE.md admin/archive/rebuild-2025-11-23/working-docs/

# Delete working scripts
rm extract_zips.sh detect_duplicates.sh extract_unique_files.sh analyze_remaining_files.sh

# Delete duplicate/raw working docs
rm TASK_7_COMPLETE.md REMAINING_FILES_ANALYSIS.md NEW_RULES_EXTRACTION.md DUPLICATE_ANALYSIS.md

# Create archive README
cat > admin/archive/rebuild-2025-11-23/README.md << 'EOF'
# Standards Rebuild Archive (2025-11-23)

This directory contains archived files from the standards rebuild catastrophe recovery.

**Context:** Site lost most current standards, had 913 fragment files to rebuild from.
**Result:** Created /new-standards/ with zero information loss.
**Archived:** 2025-11-23

## Contents

- old-files/ (663 files, 8.1 MB) - Original fragment files
- old-files-extracted/ (250 files, 23 MB) - Extracted .zip contents
- standards-old/ (7 files, 35 KB) - Old standards directory (superseded)
- working-docs/ (8 files, 177 KB) - Working documentation from rebuild

## All Content Preserved In

- /new-standards/ (official consolidated standards)
- Live implementation (266 HTML files)
- This archive (historical reference)

## Critical Files

Disaster recovery reference:
- working-docs/FRAGMENT_INVENTORY.md - MD5 deduplication map
- working-docs/EXTRACTION_PROGRESS.md - What was found
- working-docs/STANDARDS_VERIFICATION_REPORT.md - Proof of work
- working-docs/CONFLICT_RESOLUTIONS.md - Resolution doctrine

Soli Deo Gloria ✝️
EOF

# Commit the cleanup
git add -A
git commit -m "CLEANUP: Archive rebuild working files, delete temporary files

Archived to admin/archive/rebuild-2025-11-23/:
- old-files/ (8.1 MB)
- old-files-extracted/ (23 MB)
- standards-old/ (35 KB)
- 8 working docs (177 KB)

Deleted:
- 4 shell scripts (11.8 KB)
- 4 duplicate/raw docs (115 KB)

Space freed: ~126 KB at root
Space archived: ~31.3 MB

All unique content preserved in /new-standards/

Soli Deo Gloria ✝️"
```

### Aggressive Approach: Maximum Cleanup

Delete all orphaned files (no archive):

```bash
# Delete old directories
rm -rf old-files/
rm -rf old-files-extracted/
rm -rf standards/

# Delete working scripts
rm extract_zips.sh detect_duplicates.sh extract_unique_files.sh analyze_remaining_files.sh

# Delete all working/duplicate docs
rm TASK_7_COMPLETE.md REMAINING_FILES_ANALYSIS.md NEW_RULES_EXTRACTION.md DUPLICATE_ANALYSIS.md

# Archive ONLY critical documentation
mkdir -p admin/archive/rebuild-2025-11-23/critical-docs
mv FRAGMENT_INVENTORY.md admin/archive/rebuild-2025-11-23/critical-docs/
mv EXTRACTION_PROGRESS.md admin/archive/rebuild-2025-11-23/critical-docs/
mv STANDARDS_VERIFICATION_REPORT.md admin/archive/rebuild-2025-11-23/critical-docs/
mv CONFLICT_RESOLUTIONS.md admin/archive/rebuild-2025-11-23/critical-docs/

# Delete historical (non-critical) docs
rm CONSOLIDATED_TASK_LIST_2025_11_23.md
rm UNFINISHED_TASKS.md
rm UNIQUE_FILES_LIST.md
rm STANDARDS_REBUILD_REBASE.md
```

**Space saved:** ~31.2 MB (keeps only 43 KB of critical docs in archive)

---

## Safety Checklist

Before any cleanup, verify:

- [x] /new-standards/ has 14 files (complete)
- [x] /new-standards/README.md is complete
- [x] /new-standards/foundation/ has 7 files
- [x] /new-standards/v3.010/ has 4 files
- [x] STANDARDS_REBUILD_COMPLETE.md documents completion
- [x] DISCARDED_ITEMS_EVALUATION.md proves zero loss
- [x] All production HTML files (266) still exist
- [x] Git commit history shows all rebuild commits
- [x] Production documentation (17 files, 165 KB) identified and excluded

---

## Summary by Action

### ARCHIVE (31.3 MB total)

**Directories:**
- old-files/ (8.1 MB, 663 files)
- old-files-extracted/ (23 MB, 250 files)
- standards/ (35 KB, 7 files)

**Critical Documentation (43 KB):**
- FRAGMENT_INVENTORY.md (11 KB) - Disaster recovery
- EXTRACTION_PROGRESS.md (11 KB) - What was found
- CONFLICT_RESOLUTIONS.md (9.6 KB) - Resolution doctrine
- STANDARDS_VERIFICATION_REPORT.md (11 KB) - Proof of work

**Historical Documentation (134 KB):**
- CONSOLIDATED_TASK_LIST_2025_11_23.md (21 KB)
- UNFINISHED_TASKS.md (88 KB)
- UNIQUE_FILES_LIST.md (16 KB)
- STANDARDS_REBUILD_REBASE.md (18 KB)

### DELETE (127 KB total)

**Working Scripts (11.8 KB):**
- extract_zips.sh, detect_duplicates.sh, extract_unique_files.sh, analyze_remaining_files.sh

**Duplicate/Raw Docs (115 KB):**
- TASK_7_COMPLETE.md (6.1 KB)
- REMAINING_FILES_ANALYSIS.md (5.2 KB)
- NEW_RULES_EXTRACTION.md (47 KB)
- DUPLICATE_ANALYSIS.md (57 KB)

### KEEP (Root)

**Completion Documentation (20.6 KB):**
- STANDARDS_REBUILD_COMPLETE.md (12 KB)
- DISCARDED_ITEMS_EVALUATION.md (8.6 KB)

**Production Documentation (165 KB):**
- 17 markdown files (site docs, audits, guides)

**Standards (Current):**
- /new-standards/ (14 files, ~150 KB)

---

## Orphaned Files by Status

### 🔴 Safe to Delete Immediately (127 KB)

✅ Working scripts: 11.8 KB
✅ Duplicate/raw docs: 115 KB

### 🟡 Safe to Archive or Delete (31.3 MB)

⚠️ old-files/ (8.1 MB) - Historical value
⚠️ old-files-extracted/ (23 MB) - Working directory
⚠️ standards/ (35 KB) - Old standards
⚠️ Working docs (177 KB) - Mixed historical/critical

### 🟢 Keep (Root) (186 KB)

✅ Completion docs (20.6 KB) - Final deliverables
✅ Production docs (165 KB) - Active documentation

### 🟢 Keep (Directories)

✅ /new-standards/ (~150 KB) - Current standards
✅ /admin/ - All active admin files
✅ All production directories

---

## Total Orphaned Summary

**Files/Directories:** 935 items
**Total Size:** 31.4 MB
**Recommended Action:** Archive 31.3 MB, Delete 127 KB
**Space Freed at Root:** ~304 KB (working docs + scripts)
**Space Archived:** ~31.3 MB (old-files, old-files-extracted, standards, working docs)

**All unique content preserved in:**
- /new-standards/ (official source of truth)
- Live implementation (266 HTML verified)
- Archive directory (historical reference + disaster recovery)

---

**Report Version:** 2.0 (Updated after rebase)
**Generated by:** Standards Rebuild Cleanup
**Report Date:** 2025-11-23
**Repository Commit:** ef774468
**Next Review:** After cleanup completion

**Soli Deo Gloria** ✝️
