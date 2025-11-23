# Orphaned Files Report

**Generated:** 2025-11-23
**Purpose:** Identify files superseded by standards rebuild
**Context:** Post-catastrophe cleanup after /new-standards/ creation

---

## Executive Summary

**Total Orphaned:** ~31.1 MB across 924 files + 11 working scripts/docs
**Status:** Safe to archive or delete
**Recommendation:** Move to archive, delete working files

### Orphaned Categories

| Category | Size | Files | Recommendation |
|----------|------|-------|----------------|
| old-files/ | 8.1 MB | 663 | Archive or delete |
| old-files-extracted/ | 23 MB | 250 | Delete (working directory) |
| standards/ (old) | 35 KB | 7 | Archive or delete |
| Working scripts | ~5 KB | 4 | Delete |
| Working docs | ~25 KB | 7 | Archive or delete |
| **TOTAL** | **31.1 MB** | **931** | |

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
- Archives (.zip): 34 files
- Misc (.txt, .csv, etc.): ~8 files

**By Version:**
- v2.x standards: ~150 files
- v3.001-v3.009: ~320 files
- v3.100: ~15 files
- Unversioned/templates: ~178 files

### Recommendation

**Option A: DELETE** ✅ Recommended
- All unique content preserved in /new-standards/
- FRAGMENT_INVENTORY.md has complete MD5 map for recovery
- Saves 8.1 MB

**Option B: ARCHIVE**
- Move to archive directory (outside repo)
- Keep for historical reference
- Useful for disaster recovery

**Option C: KEEP**
- Leave in place as archival backup
- Cost: 8.1 MB disk space
- Update .gitignore to prevent accidental commits

### Safety Check

Before deletion, verify:
- [ ] /new-standards/ has 14 files (README + VERSION_TIMELINE + 7 foundation + 4 v3.010)
- [ ] FRAGMENT_INVENTORY.md exists (MD5 deduplication map)
- [ ] EXTRACTION_PROGRESS.md documents all 137 unique files analyzed
- [ ] No unique files added since 2025-11-23

---

## Category 2: old-files-extracted/ Directory

**Path:** `/old-files-extracted/`
**Size:** 23 MB
**File Count:** 250 files
**Status:** ⚠️ ORPHANED (working directory only)

### What It Contains

Extraction working directory created during rebuild:
- Contents of 34 .zip archives from /old-files/
- Organized into bundle subdirectories
- Temporary files from extraction process

### Example Structure

```
old-files-extracted/
├── InTheWake_Standards_v3.001_bundle/
├── InTheWake_Standards_v2.4/
├── InTheWake_Planning_v0.4_Galveston/
├── [29 more bundle directories...]
└── extraction logs
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
rm -rf /old-files-extracted/
```

### Safety Check

Before deletion, verify:
- [ ] All .zip files still in /old-files/ (can re-extract if needed)
- [ ] EXTRACTION_PROGRESS.md documents complete analysis
- [ ] /new-standards/ contains all preserved content

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
- Rename to /standards-archived/
- Add README explaining superseded status
- Keep for historical reference

**Command to delete:**
```bash
rm -rf /standards/
```

### Safety Check

Before deletion, verify:
- [ ] /new-standards/ contains v3.006 invocation requirements
- [ ] /new-standards/ contains complete unified standards
- [ ] No references to /standards/ in active HTML files

---

## Category 4: Working Scripts

**Files:** 4 shell scripts
**Size:** ~5 KB total
**Status:** ⚠️ ORPHANED (one-time rebuild tools)

### Files

1. **extract_zips.sh** (~1 KB)
   - Purpose: Extract all .zip files from /old-files/
   - Status: Completed (created /old-files-extracted/)
   - Usage: One-time (Task 2)

2. **detect_duplicates.sh** (~1.5 KB)
   - Purpose: MD5 hash all files, identify duplicates
   - Status: Completed (created FRAGMENT_INVENTORY.md)
   - Usage: One-time (Task 5)

3. **extract_unique_files.sh** (~1 KB)
   - Purpose: Extract unique files for analysis
   - Status: Completed (identified 137 unique files)
   - Usage: One-time (Task 6)

4. **analyze_remaining_files.sh** (~1.5 KB)
   - Purpose: Helper for systematic file reading
   - Status: Completed (analyzed all 137 files)
   - Usage: One-time (Task 6)

### Recommendation

**DELETE** ✅ Strongly recommended
- One-time rebuild tools (no longer needed)
- All outputs preserved (FRAGMENT_INVENTORY.md, etc.)
- Can be recreated if needed for future rebuild

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

## Category 5: Working Documentation

**Files:** 7 markdown documents
**Size:** ~25 KB total
**Status:** ⚠️ MIXED (some archive-worthy, some delete)

### Files

1. **FRAGMENT_INVENTORY.md** (~8 KB)
   - Purpose: Complete MD5 deduplication map
   - Status: ⚠️ KEEP (archival value)
   - Contains: MD5 hashes, duplicate groups, file paths
   - Useful for: Disaster recovery, verification

2. **EXTRACTION_PROGRESS.md** (~6 KB)
   - Purpose: Systematic analysis log (files 1-137)
   - Status: ⚠️ KEEP (archival value)
   - Contains: Batch summaries, key discoveries, version timeline
   - Useful for: Understanding what was found

3. **CONFLICT_RESOLUTIONS.md** (~4 KB)
   - Purpose: Document zero conflicts found
   - Status: ⚠️ KEEP (archival value)
   - Contains: Conflict resolution doctrine, prevention guide
   - Useful for: Future conflict resolution

4. **STANDARDS_VERIFICATION_REPORT.md** (~5 KB)
   - Purpose: Verification against live implementation
   - Status: ⚠️ KEEP (archival value)
   - Contains: 266 HTML files verified, innovation discoveries
   - Useful for: Proof of verification

5. **TASK_7_COMPLETE.md** (~2 KB)
   - Purpose: Task 7 completion summary
   - Status: ⚠️ ARCHIVE or DELETE
   - Contains: Short summary (duplicates other docs)
   - Recommendation: Delete (info preserved in STANDARDS_VERIFICATION_REPORT.md)

6. **NEW_RULES_EXTRACTION.md** (~1 KB)
   - Purpose: Working notes during extraction
   - Status: ⚠️ DELETE
   - Contains: Temporary extraction notes
   - Recommendation: Delete (superseded by EXTRACTION_PROGRESS.md)

7. **CONSOLIDATED_TASK_LIST_2025_11_23.md** (~2 KB)
   - Purpose: Original 11-task rebuild plan
   - Status: ⚠️ ARCHIVE
   - Contains: Task list (all complete)
   - Recommendation: Archive (historical reference)

### Recommendation

**KEEP (move to /admin/archive/):**
- FRAGMENT_INVENTORY.md (disaster recovery)
- EXTRACTION_PROGRESS.md (analysis log)
- CONFLICT_RESOLUTIONS.md (doctrine)
- STANDARDS_VERIFICATION_REPORT.md (proof of work)
- CONSOLIDATED_TASK_LIST_2025_11_23.md (historical)

**DELETE:**
- TASK_7_COMPLETE.md (duplicate info)
- NEW_RULES_EXTRACTION.md (working notes)

**Commands:**
```bash
# Move to archive
mkdir -p admin/archive/rebuild-2025-11-23
mv FRAGMENT_INVENTORY.md admin/archive/rebuild-2025-11-23/
mv EXTRACTION_PROGRESS.md admin/archive/rebuild-2025-11-23/
mv CONFLICT_RESOLUTIONS.md admin/archive/rebuild-2025-11-23/
mv STANDARDS_VERIFICATION_REPORT.md admin/archive/rebuild-2025-11-23/
mv CONSOLIDATED_TASK_LIST_2025_11_23.md admin/archive/rebuild-2025-11-23/

# Delete duplicates/working files
rm TASK_7_COMPLETE.md NEW_RULES_EXTRACTION.md
```

---

## Category 6: Completed Status Files

**Files:** 2 markdown documents
**Size:** ~8 KB total
**Status:** ✅ KEEP (completion documentation)

### Files

1. **STANDARDS_REBUILD_COMPLETE.md** (~6 KB)
   - Purpose: Final completion summary
   - Status: ✅ KEEP
   - Contains: Complete rebuild summary, all 12 tasks
   - Location: Root (high visibility)

2. **DISCARDED_ITEMS_EVALUATION.md** (~2 KB)
   - Purpose: "Wheat in chaff" analysis
   - Status: ✅ KEEP
   - Contains: Proof that zero information was lost
   - Location: Root (reference document)

### Recommendation

**KEEP both files** - These are final deliverables documenting successful completion.

---

## Not Orphaned (Current Files)

### Active Directories

**DO NOT DELETE:**

✅ **/new-standards/** (14 files, ~150 KB)
- Official consolidated standards
- Current source of truth
- Foundation (v3.007-v3.100) + v3.010 innovations

✅ **/admin/claude/** (4 files)
- STANDARDS_GUIDE.md (guide for future sessions)
- CODEBASE_GUIDE.md, ITW-LITE_PROTOCOL.md, etc.

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

### Conservative Approach (Recommended)

Archive old files, delete working files:

```bash
# Create archive
mkdir -p admin/archive/rebuild-2025-11-23

# Move old directories to archive
mv old-files/ admin/archive/rebuild-2025-11-23/
mv old-files-extracted/ admin/archive/rebuild-2025-11-23/
mv standards/ admin/archive/rebuild-2025-11-23/

# Move working docs to archive
mv FRAGMENT_INVENTORY.md admin/archive/rebuild-2025-11-23/
mv EXTRACTION_PROGRESS.md admin/archive/rebuild-2025-11-23/
mv CONFLICT_RESOLUTIONS.md admin/archive/rebuild-2025-11-23/
mv STANDARDS_VERIFICATION_REPORT.md admin/archive/rebuild-2025-11-23/
mv CONSOLIDATED_TASK_LIST_2025_11_23.md admin/archive/rebuild-2025-11-23/

# Delete working scripts
rm extract_zips.sh detect_duplicates.sh extract_unique_files.sh analyze_remaining_files.sh

# Delete duplicate/working docs
rm TASK_7_COMPLETE.md NEW_RULES_EXTRACTION.md

# Add archive README
cat > admin/archive/rebuild-2025-11-23/README.md << 'EOF'
# Standards Rebuild Archive (2025-11-23)

This directory contains archived files from the standards rebuild catastrophe recovery.

**Context:** Site lost most current standards, had 913 fragment files to rebuild from.
**Result:** Created /new-standards/ with zero information loss.
**Archived:** 2025-11-23

## Contents

- old-files/ (663 files, 8.1 MB) - Original fragment files
- old-files-extracted/ (250 files, 23 MB) - Extracted .zip contents
- standards/ (7 files, 35 KB) - Old standards directory (superseded)
- *.md - Working documentation from rebuild

## All Content Preserved In

- /new-standards/ (official consolidated standards)
- Live implementation (266 HTML files)
- This archive (historical reference)

Soli Deo Gloria ✝️
EOF
```

### Aggressive Approach (Maximum Cleanup)

Delete all orphaned files:

```bash
# Delete old directories
rm -rf old-files/
rm -rf old-files-extracted/
rm -rf standards/

# Delete working scripts
rm extract_zips.sh detect_duplicates.sh extract_unique_files.sh analyze_remaining_files.sh

# Delete working/duplicate docs
rm TASK_7_COMPLETE.md NEW_RULES_EXTRACTION.md

# Archive key documentation
mkdir -p admin/archive/rebuild-2025-11-23
mv FRAGMENT_INVENTORY.md admin/archive/rebuild-2025-11-23/
mv EXTRACTION_PROGRESS.md admin/archive/rebuild-2025-11-23/
mv CONFLICT_RESOLUTIONS.md admin/archive/rebuild-2025-11-23/
mv STANDARDS_VERIFICATION_REPORT.md admin/archive/rebuild-2025-11-23/
mv CONSOLIDATED_TASK_LIST_2025_11_23.md admin/archive/rebuild-2025-11-23/
```

**Space saved:** ~31.1 MB

---

## Safety Checklist

Before any deletion, verify:

- [ ] /new-standards/ has 14 files
- [ ] /new-standards/README.md is complete
- [ ] /new-standards/foundation/ has 7 files
- [ ] /new-standards/v3.010/ has 4 files
- [ ] STANDARDS_REBUILD_COMPLETE.md documents completion
- [ ] DISCARDED_ITEMS_EVALUATION.md proves zero loss
- [ ] All production HTML files (266) still exist
- [ ] Git commit history shows all rebuild commits

---

## Orphaned Files by Status

### Safe to Delete Immediately

✅ old-files-extracted/ (23 MB, 250 files) - Working directory
✅ extract_zips.sh, detect_duplicates.sh, extract_unique_files.sh, analyze_remaining_files.sh - One-time scripts
✅ TASK_7_COMPLETE.md, NEW_RULES_EXTRACTION.md - Duplicate/working docs

**Total space saved:** ~23 MB

### Safe to Archive or Delete

⚠️ old-files/ (8.1 MB, 663 files) - Historical value, but superseded
⚠️ standards/ (35 KB, 7 files) - Old standards, superseded

**Total additional space:** ~8.1 MB

### Keep (Archive)

📁 FRAGMENT_INVENTORY.md - Disaster recovery reference
📁 EXTRACTION_PROGRESS.md - Analysis log
📁 CONFLICT_RESOLUTIONS.md - Resolution doctrine
📁 STANDARDS_VERIFICATION_REPORT.md - Proof of verification
📁 CONSOLIDATED_TASK_LIST_2025_11_23.md - Original plan

### Keep (Root)

✅ STANDARDS_REBUILD_COMPLETE.md - Final completion report
✅ DISCARDED_ITEMS_EVALUATION.md - Proof of zero loss

---

## Summary

**Total Orphaned:** 931 files, 31.1 MB
**Safe to Delete:** 254 files, 23 MB (working directory + scripts)
**Archive or Delete:** 670 files, 8.1 MB (old-files/, standards/)
**Archive (keep):** 5 markdown docs, ~25 KB
**Keep (root):** 2 completion docs, ~8 KB

**Recommendation:**
1. Run conservative cleanup (archive old files, delete working files)
2. Saves ~23 MB immediately
3. Preserves historical reference in admin/archive/
4. Can delete archive later if space needed

**All unique content preserved in:**
- /new-standards/ (official source of truth)
- Live implementation (266 HTML verified)
- Archive directory (historical reference)

---

**Generated by:** Standards Rebuild Cleanup
**Report Date:** 2025-11-23
**Next Review:** Quarterly (or when space needed)

**Soli Deo Gloria** ✝️
