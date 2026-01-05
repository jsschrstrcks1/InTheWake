# Quiz UX Bug Fix Plan

Based on user feedback (Chris Foster) and analytics (80% mobile, 57% iOS).

---

## Bug 1: NCL Link in "Also Like" Section Does Nothing

**Root Cause:** Ship page URLs in JSON (e.g., `/ships/ncl/aqua.html`) don't exist - those pages were never created.

**Options:**

A) **Remove clickability** - Make cards non-clickable for now
```javascript
// Change from:
<a href="${r.ship.page}" class="also-like-card">

// To:
<div class="also-like-card" ${r.ship.page ? `onclick="window.location='${r.ship.page}'"` : ''}>
```

B) **Check if page exists** - Only link if page exists (requires knowing which pages exist)

C) **Create placeholder pages** - Auto-generate basic ship pages (big effort)

**Recommended:** Option A for now - make cards show info but not be clickable links.

---

## Bug 2: Can't Scroll Cruise Line List on iPhone

**Root Cause:** Mobile dropdown has no max-height or overflow styling. On phones with 15+ cruise lines, the dropdown extends past the screen.

**Fix:**
```css
.line-selector-dropdown {
  max-height: 60vh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch; /* Smooth scroll on iOS */
}
```

---

## Bug 3: Browser Back Button Restarts Quiz

**Root Cause:** No history state management. Each question doesn't push state, so back navigates away from page entirely.

**Fix:** Implement history.pushState for each question:

```javascript
// When moving to next question:
function renderQuestion(index) {
  // ... existing code ...

  // Push state for browser history
  history.pushState({ question: index }, '', `#q${index + 1}`);
}

// Listen for back button:
window.addEventListener('popstate', (e) => {
  if (e.state && typeof e.state.question === 'number') {
    currentQuestion = e.state.question;
    renderQuestion(currentQuestion);
    updateProgress();
  } else if (quizResults.classList.contains('active')) {
    // On results page, back goes to last question
    quizResults.classList.remove('active');
    questionsContainer.classList.remove('hidden');
    currentQuestion = questions.length - 1;
    renderQuestion(currentQuestion);
    updateProgress();
  }
});
```

---

## Feature Request: Multi-Select Cruise Lines

**User Request:** "You should allow it to choose several different lines in the opening question."

**Current Behavior:** Single line OR all lines.

**Proposed Change:** Allow toggling multiple lines (like checkboxes):

```javascript
// Change from single selection:
selectedLine = 'rcl'; // or 'all'

// To multi-selection:
selectedLines = ['rcl', 'celebrity', 'virgin']; // or ['all']
```

**UI Change:**
- Desktop: Pills become toggleable (can select multiple)
- Mobile: Checkboxes in dropdown
- "All Lines" deselects individuals, individual selections deselect "All"

**Impact:** Medium effort - need to update:
- Line selector UI
- `calculateAllScores()` filtering logic
- Share URL encoding
- Results display

**Recommendation:** Defer to future update - current single/all works for most users.

---

## Implementation Priority

1. **Bug 2: Mobile scroll** - Quick CSS fix, high impact (80% mobile)
2. **Bug 3: Back button** - Medium effort, high frustration factor
3. **Bug 1: NCL links** - Quick fix, prevents confusion
4. **Feature: Multi-select** - Defer to future

---

## Analytics Insights

- 77% bounce rate from Facebook → Users opening in FB browser, might have JS issues
- Chrome users stay 2m 17s vs Safari 0s → Safari might have compatibility issues
- iOS 57%, Android 28% → Ensure iOS Safari testing
