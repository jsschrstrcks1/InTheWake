---
name: webapp-testing
description: "Playwright-based test scenarios for InTheWake's 9 interactive JavaScript tools. These calculators handle real money decisions for real travelers."
version: 1.0.0
---

# Webapp Testing — Interactive Tools

> These tools advise real travelers on real money. Test them like it matters.

## When to Fire

- On `/test` command
- After modifying any tool's JavaScript
- Before deployment
- When tool behavior seems off

## The 9 Tools

### 1. Drink Package Calculator (`/drink-calculator.html`)
**Tests:**
- Break-even at $10/drink → correct threshold for Deluxe package
- Multi-currency: USD, GBP, EUR, CAD, AUD conversions accurate
- Crown & Anchor voucher discount applied correctly
- Recovery-sensitive mode hides alcohol options
- Group calculation: 4 travelers with different drink counts
- Edge: 0 drinks/day → "package not worth it"
- Edge: 20 drinks/day → reasonable result, no overflow

### 2. Ship Quiz (`/ships/quiz.html`)
**Tests:**
- Every answer combination produces a valid ship recommendation
- No dead-end paths (every path reaches a result)
- Results link to actual ship pages that exist
- Reset/retake works

### 3. Cruise Line Quiz (`/cruise-lines/quiz.html`)
**Tests:**
- All answer paths produce valid cruise line results
- Results link to actual cruise line pages
- No duplicate recommendations

### 4. Stateroom Sanity Check (`/stateroom-check.html`)
**Tests:**
- All cabin categories (inside, ocean view, balcony, suite) produce recommendations
- Budget input affects recommendation appropriately
- Party size affects recommendation

### 5. Cruise Budget Calculator (`/tools/cruise-budget-calculator.html`)
**Tests:**
- Fare + gratuities + packages + excursions + dining + Wi-Fi + incidentals = correct total
- Per-person and per-day breakdowns accurate
- Edge: 0 travelers → error or warning
- Edge: negative values → rejected
- Gratuity auto-calculation matches cruise line rates

### 6. Port Day Planner (`/tools/port-day-planner.html`)
**Tests:**
- Time blocks don't overlap
- Return-to-ship warning triggers at correct time
- Distance-from-pier estimates reasonable
- Total cost sums correctly

### 7. Ship Size Atlas (`/tools/ship-size-atlas.html`)
**Tests:**
- Sorting by tonnage, passengers, year works
- Filtering by cruise line works
- Data loads completely (no missing ships)

### 8. Ship Tracker (`/tools/ship-tracker.html`)
**Tests:**
- Map renders without errors
- Ship positions load (or graceful fallback)
- Search/filter functions

### 9. Port Tracker (`/tools/port-tracker.html`)
**Tests:**
- Tracking state persists across page reloads (localStorage)
- Data loads for all tracked ports
- Add/remove tracking works

## Cross-Tool Tests

### Accessibility
- All tools keyboard-navigable (Tab through all inputs)
- Focus indicators visible on all interactive elements
- ARIA labels on all form controls
- Results announced to screen readers

### Mobile
- All tools functional at 375px viewport (iPhone SE)
- Touch targets ≥44px
- No horizontal scroll
- Inputs don't trigger unwanted zoom

### PWA / Offline
- Tools that can work offline do (calculators with no API dependency)
- Offline fallback page loads when network unavailable
- Service worker doesn't cache stale tool versions

### Math Verification
For every calculator: manually compute expected results for 3 test cases and verify the tool produces matching output.

## Test Execution

```bash
# If Playwright is available:
npx playwright test tests/tools/

# Manual verification:
# Open each tool, run the test scenarios above, record pass/fail
```

## Report Format

```
## Tool Test Report — [date]

| Tool | Tests | Pass | Fail | Notes |
|------|-------|------|------|-------|
| Drink Calculator | 7 | 7 | 0 | |
| Ship Quiz | 3 | 2 | 1 | Dead end on path A→C→B |
| ...
```

---

*Soli Deo Gloria* — Test thoroughly because real travelers trust these tools.
