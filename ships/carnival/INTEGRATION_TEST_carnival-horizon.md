# Integration Test Results — carnival-horizon.html
Generated: 2026-05-26 20:35:04
BeautifulSoup: available

## Required Sections
- ✅ **PASS:** title tag
- ✅ **PASS:** meta[name=description]
- ✅ **PASS:** h1 tag
- ✅ **PASS:** #ship-stats element
- ✅ **PASS:** photo carousel
- ✅ **PASS:** navigation
- ✅ **PASS:** footer

## Duplicate Detection
- ✅ **PASS:** Duplicate IDs: none
- ✅ **PASS:** Duplicate Swiper inits: none
- ✅ **PASS:** Stats grid count: 1 (max 2 expected)
- ⚠️ **WARN:** Wikimedia attribution blocks: 6

## ICP Consistency
- ✅ **PASS:** ICP version consistent: {'ICP-2': 3}

## JavaScript Integrity
- ✅ **PASS:** Swiper guard uses ! operator: True
- ❌ **FAIL:** Orphaned JS targets: ['featuredVideos', 'videoFallback', 'vf-tracker-container', 'dining-content', 'logbook-stories']
- ✅ **PASS:** Duplicate fetch() calls: none

## Accessibility
- ⚠️ **WARN:** Images missing alt text: 1
- ✅ **PASS:** Has <main> landmark: True

## Summary
- ✅ PASS: 14
- ❌ FAIL: 1  
- ⚠️ WARN: 2
- **Overall:** ❌ NEEDS FIXES
