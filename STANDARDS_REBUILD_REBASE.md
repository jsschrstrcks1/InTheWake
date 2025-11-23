# Standards Rebuild - Consolidated Rebase Summary

**Date:** 2025-11-23
**Branch:** `claude/repair-and-update-013wGA1z6bayMEXdJTzqU3kc`
**Status:** ⏳ WAITING FOR USER TO COMPLETE FRAGMENT UPLOADS

---

## Executive Summary

We are rebuilding the site standards from 220+ fragments after losing the most current versions. This document consolidates all planning discussions and establishes the doctrine for the rebuild process.

---

## Preservation Doctrine: "Verified Superset, Reality-Grounded"

### TIER 1: ALWAYS KEEP (Sacred)

1. **Current Working Implementation**
   - If it's in the 561 HTML files → KEEP
   - If enforced by automation scripts → KEEP
   - If working in production → KEEP
   - **Rationale:** Reality trumps documentation

2. **ITW-Lite Protocol Requirements**
   - ALL ITW-Lite specifications → KEEP
   - Supersedes older contradictory rules
   - **Rationale:** Explicit priority from user

3. **Unique Rules** (Superset Approach)
   - If appears in any fragment and doesn't conflict → KEEP
   - If adds information not found elsewhere → KEEP
   - **Rationale:** Building a superset, unique = valuable

4. **Working Code Examples**
   - If demonstrates working pattern → KEEP
   - If referenced by standards docs → KEEP
   - If shows all standards working together → KEEP
   - **Rationale:** Code is truth, prevents ambiguity

### TIER 2: KEEP WITH CONTEXT (Historical Value)

5. **Deprecated But Documented**
   - Mark [DEPRECATED] with migration path explanation
   - Mark [LEGACY - for pages pre-v3.xxx] if still in use
   - **Rationale:** Context prevents repeating mistakes

6. **Pilot/Experimental Features**
   - Mark [PILOT] if partially implemented
   - Mark [ROADMAP] if planned but not yet implemented
   - **Rationale:** Shows evolution, tracks experiments

7. **Version-Specific Rules**
   - Keep all with version markers showing evolution
   - **Rationale:** Explains why old pages differ

8. **Conflict Resolutions**
   - Document: "Fragment A said X, Fragment B said Y, chose Y because [reason]"
   - **Rationale:** Shows thinking for future readers

### TIER 3: DISCARD (Noise Reduction)

9. **Exact Duplicates**
   - Byte-for-byte identical → DISCARD (keep one in archive)
   - Functionally identical → CONSOLIDATE to clearest version

10. **Contradicts Current Reality**
    - If standard says "use X" but NO current files use X → DISCARD or [DEPRECATED - Never adopted]

11. **Vague/Incomplete Without Context**
    - "TBD" or "Coming soon" with no implementation → DISCARD or [INCOMPLETE]

12. **Dilutes ITW-Lite**
    - Old approach contradicts ITW-Lite AND has no migration value → DISCARD or [DEPRECATED - See ITW-Lite]

13. **Metadata/Packaging Files**
    - README about zip file movement, not standards → DISCARD (archive only)

---

## Conflict Resolution Priority

When fragments contradict, apply this hierarchy:

1. **ITW-Lite Protocol** (supersedes all)
2. **Current working implementation** (561 HTML files)
3. **Newest version number** (if clear which is newer)
4. **Most recently committed** (git history)
5. **Most specific rule** (ship-specific beats generic)
6. **Most complete documentation** (detailed beats vague)
7. **Your decision** (flag for user to resolve)

---

## File Types & What They Tell Us

### Documentation Files
- **.md, .txt:** Written rules and specifications
- **.doc, .docx:** May need conversion (flag for user if can't read)

### Code Files (Living Documentation)
- **.html:** Template examples showing canonical implementations
  - Meta tag patterns (ICP-Lite, ITW-Lite actual usage)
  - Navigation structure examples
  - Complete cache warming snippets
  - ALL standards working together

- **.js:** Implementation patterns
  - Version numbers in headers/comments
  - API usage examples (SiteCache, SW registration)
  - Configuration patterns
  - Comments explaining WHY certain approaches chosen

- **.css:** Styling standards
  - Version numbers (?v=3.0 vs ?v=3.006)
  - Class naming conventions
  - Component patterns
  - Responsive breakpoints

- **.json:** Schema examples
  - Data structure standards
  - Version field patterns

- **.py:** Automation expectations
  - Comments explaining which standards they enforce
  - Validation logic revealing actual requirements
  - What automation expects vs what standards document

### Archives
- **.zip:** Extract recursively and examine contents

---

## Key Principles

1. **Every file matters** - Even .py scripts reveal automation expectations
2. **Code is truth** - Working implementation trumps written documentation
3. **Version archaeology** - Extract version numbers to establish chronology
4. **ITW-Lite supremacy** - Supersedes anything contradictory or dilutive
5. **Current implementation wins** - What works in 561 files is canonical
6. **Superset approach** - If unique and doesn't conflict, keep it
7. **Context preservation** - Deprecated rules explain migration path
8. **Archive everything** - Even discarded fragments stay in archive/
9. **Cross-validation** - Standards must match what scripts enforce
10. **Template canonicalization** - Complete working examples become primary docs

---

## Rebuild Process (10 Tasks)

### Phase 1: Discovery & Inventory
- [ ] **Task 1:** Inventory all fragments
  - Find and count all files in old-files/
  - Categorize by type (.md, .txt, .doc, .html, .js, .css, .json, .py, .zip)
  - Count by subdirectory depth
  - Note file sizes and modification dates

- [ ] **Task 2:** Extract .zip files
  - Recursively extract all .zip archives
  - Check for nested .zip files
  - Preserve original structure

- [ ] **Task 3:** Handle .doc/.docx files
  - Attempt conversion or flag for user review
  - Document which files need manual handling

### Phase 2: Analysis
- [ ] **Task 4:** Create FRAGMENT_INVENTORY.md
  - Complete manifest with metadata for every fragment
  - Include: path, type, size, date, version number (if found), git commit

- [ ] **Task 5:** Identify exact duplicates
  - Line-by-line comparison
  - MD5 hash matching
  - Flag byte-for-byte duplicates

- [ ] **Task 6:** Extract unique rules
  - Parse each fragment for distinct rules
  - Map rule → source fragment(s)
  - Note which fragments contribute to each rule

### Phase 3: Verification & Conflict Resolution
- [ ] **Task 7:** Verify against current implementation
  - Grep 561 HTML files for actual patterns
  - Check CSS version strings in use
  - Verify Service Worker implementation
  - Test JSON schemas against actual data files
  - Confirm meta tag patterns
  - Validate what Python scripts enforce

- [ ] **Task 8:** Create CONFLICT_RESOLUTIONS.md
  - Document every contradiction found
  - Apply conflict resolution priority hierarchy
  - Flag unresolvable conflicts for user review
  - Document decision rationale for each conflict

### Phase 4: Consolidation
- [ ] **Task 9:** Build /new-standards/
  - Create directory structure (core/, content/, technical/, protocols/, examples/, archive/)
  - Write consolidated standards files
  - For each rule: add SOURCE, STATUS, VERSION, VERIFIED, EXAMPLES
  - Create all documentation artifacts (README, CHANGELOG, REBUILD_AUDIT, etc.)
  - Preserve ALL original fragments in archive/
  - Create fragment-sources.json machine-readable map

### Phase 5: Integration
- [ ] **Task 10:** Update references
  - Update admin/claude/STANDARDS_INDEX.md
  - Point to new /new-standards/ locations
  - Create deprecation notices for old /standards/ directory
  - Update cross-references in documentation

---

## New Standards Structure

```
/new-standards/
├── README.md                    # Master overview
├── CHANGELOG.md                 # What changed from fragments
├── REBUILD_AUDIT.md            # All decisions documented
├── FRAGMENT_INVENTORY.md       # Complete source manifest
├── CONFLICT_RESOLUTIONS.md     # Contradictions resolved
├── MIGRATION_GUIDE.md          # Breaking changes guide
├── DEPRECATIONS.md             # Old rules no longer valid
├── VALIDATION_REPORT.md        # Examples tested, cross-refs verified
├── CURRENT_STATE_AUDIT.md      # What's actually implemented
├── VERSION_HISTORY.md          # Version timeline
│
├── core/                        # Core global standards
│   ├── main-standards.md       # Consolidated global
│   ├── versioning-standards.md
│   └── url-standards.md
│
├── content/                     # Content-specific
│   ├── ships-standards.md
│   ├── ports-standards.md
│   ├── articles-standards.md
│   ├── solo-standards.md
│   ├── cruise-lines-standards.md
│   ├── restaurants-standards.md
│   └── venues-standards.md
│
├── technical/                   # Technical implementation
│   ├── performance-standards.md
│   ├── accessibility-standards.md
│   ├── seo-standards.md
│   ├── image-standards.md
│   ├── analytics-standards.md
│   └── caching-standards.md
│
├── protocols/                   # Content protocols
│   ├── ITW-LITE_PROTOCOL.md   # (link to admin/claude/)
│   ├── ICP-LITE_PROTOCOL.md
│   └── attribution-protocol.md
│
├── examples/                    # Canonical code examples
│   ├── ship-page-canonical.html
│   ├── port-page-canonical.html
│   ├── cache-warming-snippet.js
│   └── sw-registration.js
│
└── archive/                     # ALL original fragments preserved
    ├── README.md               # "How to find original fragments"
    ├── fragment-sources.json   # Machine-readable map
    └── [all 220+ original fragments unchanged]
```

---

## Documentation Requirements

### For EVERY Rule Kept

Document:
- **SOURCE:** Which fragment(s) contributed this
- **STATUS:** [PRODUCTION] / [PILOT] / [DEPRECATED] / [ROADMAP]
- **VERSION:** When introduced/changed
- **VERIFIED:** Yes/No - confirmed in current implementation
- **EXAMPLES:** Link to working code if applicable

Example:
```markdown
## Image Format Standards

**[CRITICAL]** All new ship images MUST be WebP format (except logo_wake.png)
- **SOURCE:** Fragment: old-files/standards/image-standards-v3.007.md (lines 23-45)
- **STATUS:** [PRODUCTION]
- **VERSION:** Introduced v3.001, updated v3.007
- **VERIFIED:** Yes - 82 WebP images in /assets/ships/, all 50 ship pages use .webp in meta tags
- **EXAMPLES:** See ships/rcl/radiance-of-the-seas.html:15-20 (og:image meta tag)

**[DEPRECATED]** JPEG format for ship images
- **SOURCE:** Fragment: old-files/standards/image-standards-v2.4.md (lines 15-18)
- **STATUS:** [DEPRECATED - Superseded by WebP conversion commit cff215b]
- **VERSION:** v2.4 - v3.000 (deprecated in v3.001)
- **VERIFIED:** No - Only 3 legacy JPEG files remain
```

### For EVERY Rule Discarded

Document in REBUILD_AUDIT.md:
- **WHAT:** What was discarded
- **WHY:** Reason (duplicate, contradicts reality, etc.)
- **WHERE:** Which fragment it came from
- **WHEN:** Version/date

Example:
```markdown
## Discard #47: Legacy Navigation Structure

**WHAT:** Standard requiring top navigation to use dropdown menus with max 5 items per section
**WHY:** Contradicts current implementation - site uses horizontal pill navigation with 9 items
**WHERE:** old-files/standards/navigation-standards-v2.228.md (lines 89-120)
**WHEN:** v2.228 (2024-03-15)
**CONFLICT:** Current implementation (281 pages) uses pill-nav.pills class with 9 items
**RESOLUTION:** Discarded old rule, documented current implementation in new navigation-standards.md
```

---

## Validation Checklist

Before finalizing new standards:

- [ ] No contradictions within new standards files
- [ ] All cross-references resolve
- [ ] All code examples validate:
  - [ ] URLs resolve
  - [ ] JSON validates
  - [ ] HTML parses
  - [ ] File paths exist
- [ ] Version numbers consistent
- [ ] Current implementation matches documented standards
- [ ] All fragments accounted for (nothing lost)
- [ ] Conflicts documented with resolutions
- [ ] Migration guide created for breaking changes
- [ ] Standards match automation script expectations

---

## Timeline

1. **Phase 1:** User finishes uploading fragments (PENDING)
2. **Phase 2:** Claude performs comprehensive inventory and analysis (2-3 hours)
3. **Phase 3:** User reviews conflict resolutions and makes architectural decisions (1-2 hours)
4. **Phase 4:** Claude builds consolidated standards (2-3 hours)
5. **Phase 5:** Validation and documentation (1 hour)
6. **Phase 6:** Commit and push to branch

**Total Estimated Time:** 8-12 hours of work

---

## Related Documentation

- [UNFINISHED_TASKS.md](UNFINISHED_TASKS.md) - Lines 100-283 (Standards Catastrophe & Rebuild section)
- [admin/claude/CLAUDE.md](admin/claude/CLAUDE.md) - Claude onboarding guide
- [admin/claude/ITW-LITE_PROTOCOL.md](admin/claude/ITW-LITE_PROTOCOL.md) - Content protocol spec
- [admin/claude/STANDARDS_INDEX.md](admin/claude/STANDARDS_INDEX.md) - Current standards index
- [admin/claude/CODEBASE_GUIDE.md](admin/claude/CODEBASE_GUIDE.md) - Repository structure

---

## Decision Flowchart

```
For each piece of information found:

┌─────────────────────────────┐
│ Is it in current working    │
│ implementation? (561 files) │
└──────────┬──────────────────┘
           │
    YES ───┴─── NO
     │           │
     ▼           ▼
   KEEP     ┌─────────────────────┐
            │ Does ITW-Lite        │
            │ require it?          │
            └──────┬───────────────┘
                   │
            YES ───┴─── NO
             │           │
             ▼           ▼
           KEEP     ┌──────────────────┐
                    │ Is it unique info│
                    │ not found in any │
                    │ other fragment?  │
                    └──────┬───────────┘
                           │
                    YES ───┴─── NO
                     │           │
                     ▼           ▼
                   KEEP     ┌─────────────────┐
                            │ Does it explain  │
                            │ historical       │
                            │ context/         │
                            │ migration?       │
                            └──────┬──────────┘
                                   │
                            YES ───┴─── NO
                             │           │
                             ▼           ▼
                          KEEP       DISCARD
                       [DEPRECATED]  (archive only)
```

---

## Status

✅ **PLANNING COMPLETE** - Doctrine established, process defined, added to UNFINISHED_TASKS.md

⏳ **WAITING** - User to complete uploading all fragments to old-files/

🚀 **READY** - To begin comprehensive inventory and analysis when user signals ready

---

**Last Updated:** 2025-11-23
**Next Step:** User completes uploads and signals "ready to proceed"
