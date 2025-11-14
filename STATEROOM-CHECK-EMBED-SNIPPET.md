# Stateroom Check — Embeddable Snippet

## How to Embed on Ship Pages

This snippet can be dropped into any ship page (e.g., `radiance-of-the-seas.html`) to provide inline stateroom checking.

---

## Snippet Code

Place this section **after the ship's main content** (e.g., after the Related Ships section, before the footer):

```html
<!-- Stateroom Sanity Check Tool -->
<section class="card stateroom-check-embed" aria-labelledby="stateroom-check-heading">
  <h2 id="stateroom-check-heading">Check Your Stateroom on This Ship</h2>
  <p class="intro-text">Booked a cabin on this ship? Enter your cabin number below for gentle guidance about your choice.</p>

  <form id="stateroom-form-embed" class="stateroom-form-embed" novalidate>
    <input type="hidden" id="ship-slug-embed" value="radiance-of-the-seas" />

    <div class="form-row">
      <div class="form-group">
        <label for="cabin-input-embed">Your Cabin Number</label>
        <input
          type="text"
          id="cabin-input-embed"
          name="cabin"
          placeholder="e.g., 8234"
          pattern="[0-9]+"
          required
          aria-describedby="cabin-help-embed"
        />
        <p id="cabin-help-embed" class="help-text tiny">Enter cabin number (numbers only)</p>
      </div>

      <div class="form-group">
        <label for="traveler-select-embed">I'm Traveling As...</label>
        <select id="traveler-select-embed" name="traveler_type" required>
          <option value="couple" selected>Traveling as a Couple</option>
          <option value="solo">Traveling Solo</option>
          <option value="family">Family With Kids</option>
          <option value="light-sleeper">Light Sleeper</option>
          <option value="motion-sensitive">Prone to Motion Sickness</option>
        </select>
      </div>

      <div class="form-group">
        <button type="submit" class="btn stateroom-check-btn" id="submit-btn-embed">
          Check My Cabin
        </button>
      </div>
    </div>
  </form>

  <div id="results-container-embed" class="results-container-embed" role="region" aria-label="Stateroom check results">
    <!-- Results will be injected here -->
  </div>
</section>

<!-- Load Stateroom Check Engine (once per page) -->
<script src="/assets/js/stateroom-check.js?v=1.000.alpha" defer></script>

<!-- Embed Form Handler -->
<script>
(function() {
  'use strict';

  // Wait for DOM and StateroomCheck to be ready
  function init() {
    if (!window.StateroomCheck) {
      setTimeout(init, 100);
      return;
    }

    const form = document.getElementById('stateroom-form-embed');
    const submitBtn = document.getElementById('submit-btn-embed');
    const resultsContainer = document.getElementById('results-container-embed');
    const shipSlugInput = document.getElementById('ship-slug-embed');

    if (!form) return;

    form.addEventListener('submit', async function(e) {
      e.preventDefault();

      const shipSlug = shipSlugInput.value || 'radiance-of-the-seas';
      const cabinNum = document.getElementById('cabin-input-embed').value.trim();
      const travelerType = document.getElementById('traveler-select-embed').value;

      if (!cabinNum) {
        resultsContainer.innerHTML = `
          <div class="error-message" role="alert">
            <p>⚠️ Please enter a cabin number.</p>
          </div>
        `;
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Checking...';
      resultsContainer.innerHTML = '<p class="tiny" style="text-align:center;padding:1rem;">Checking your stateroom...</p>';

      try {
        const result = await window.StateroomCheck.check(shipSlug, cabinNum, travelerType);
        window.StateroomCheck.render(result, resultsContainer);
      } catch (error) {
        console.error('Stateroom check error:', error);
        resultsContainer.innerHTML = `
          <div class="error-message" role="alert">
            <p>⚠️ Something went wrong. Please try again.</p>
          </div>
        `;
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Check My Cabin';
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
</script>

<!-- Embed-specific styles -->
<style>
.stateroom-check-embed {
  margin: 2rem 0;
}

.stateroom-check-embed .intro-text {
  margin-bottom: 1.5rem;
  color: var(--text-secondary, #5a6c7d);
}

.stateroom-form-embed {
  margin-bottom: 1.5rem;
}

.stateroom-form-embed .form-row {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 1rem;
  align-items: end;
}

@media (max-width: 768px) {
  .stateroom-form-embed .form-row {
    grid-template-columns: 1fr;
  }
}

.stateroom-form-embed .form-group {
  margin-bottom: 0;
}

.stateroom-form-embed label {
  display: block;
  font-weight: 600;
  color: var(--navy, #0a3d62);
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.stateroom-form-embed input[type="text"],
.stateroom-form-embed select {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  border: 2px solid var(--rope, #d9b382);
  border-radius: 8px;
  background: #fff;
}

.stateroom-form-embed input[type="text"]:focus,
.stateroom-form-embed select:focus {
  outline: none;
  border-color: var(--accent, #0e6e8e);
  box-shadow: 0 0 0 3px rgba(14, 110, 142, 0.1);
}

.stateroom-check-btn {
  padding: 0.75rem 1.5rem !important;
  white-space: nowrap;
  margin-top: 0;
}

.results-container-embed {
  margin-top: 1.5rem;
  min-height: 50px;
}

/* Reuse result styles from standalone page */
.results-container-embed .stateroom-result {
  background: #fff;
  border: 2px solid var(--rope, #d9b382);
  border-radius: 14px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(8, 48, 65, 0.12);
  animation: slideIn 0.4s ease-out;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.results-container-embed .verdict-great { border-left: 6px solid var(--success, #27ae60); }
.results-container-embed .verdict-note { border-left: 6px solid var(--info, #3498db); }
.results-container-embed .verdict-caution { border-left: 6px solid var(--warning, #f39c12); }

.results-container-embed .result-header h2 {
  color: var(--navy, #0a3d62);
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
}

.results-container-embed .cabin-meta {
  color: var(--text-secondary, #5a6c7d);
  font-size: 0.95rem;
  margin-bottom: 1rem;
}

.results-container-embed .result-summary {
  margin: 1rem 0;
  padding: 1rem;
  background: rgba(14, 110, 142, 0.05);
  border-radius: 8px;
}

.results-container-embed .summary-text {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--text-primary, #2c3e50);
}

.results-container-embed .issues-section h3 {
  color: var(--navy, #0a3d62);
  margin: 1rem 0 0.75rem;
  font-size: 1.2rem;
}

.results-container-embed .issue-card {
  margin-bottom: 0.75rem;
  padding: 0.75rem;
  border-radius: 8px;
  border-left: 4px solid;
}

.results-container-embed .issue-info {
  background: rgba(52, 152, 219, 0.1);
  border-left-color: #3498db;
}

.results-container-embed .issue-minor {
  background: rgba(243, 156, 18, 0.1);
  border-left-color: #f39c12;
}

.results-container-embed .issue-major {
  background: rgba(231, 76, 60, 0.1);
  border-left-color: #e74c3c;
}

.results-container-embed .issue-card h4 {
  color: var(--navy, #0a3d62);
  margin-bottom: 0.5rem;
  font-size: 1rem;
}

.results-container-embed .issue-card p {
  line-height: 1.6;
  color: var(--text-primary, #2c3e50);
  font-size: 0.95rem;
}

.results-container-embed .result-encouragement {
  margin-top: 1rem;
  padding: 0.75rem;
  background: rgba(39, 174, 96, 0.05);
  border-radius: 8px;
  border-left: 4px solid var(--success, #27ae60);
}

.results-container-embed .result-encouragement p {
  font-style: italic;
  color: var(--text-primary, #2c3e50);
  line-height: 1.6;
  font-size: 0.95rem;
}

.results-container-embed .error-message {
  background: rgba(231, 76, 60, 0.1);
  border: 2px solid #e74c3c;
  border-radius: 8px;
  padding: 1rem;
  color: var(--text-primary, #2c3e50);
}
</style>
```

---

## Installation Instructions

1. **Edit the ship page** (e.g., `/ships/rcl/radiance-of-the-seas.html`)

2. **Find the insertion point**: Look for the "Related" section or just before the `</main>` closing tag

3. **Update the ship slug**: In the snippet, change this line to match the ship:
   ```html
   <input type="hidden" id="ship-slug-embed" value="radiance-of-the-seas" />
   ```

   For example, if embedding on Harmony of the Seas:
   ```html
   <input type="hidden" id="ship-slug-embed" value="harmony-of-the-seas" />
   ```

4. **Paste the entire snippet** at the insertion point

5. **Verify the ship has exception data** at:
   `/assets/data/staterooms/stateroom-exceptions.{ship-slug}.v2.json`

---

## Example: Radiance of the Seas

Here's where to insert in `/ships/rcl/radiance-of-the-seas.html`:

```html
    <!-- Attribution -->
    <section class="card attributions">
      ...
    </section>

    <!-- ⬇️ INSERT STATEROOM CHECK HERE ⬇️ -->

    <!-- Stateroom Sanity Check Tool -->
    <section class="card stateroom-check-embed" aria-labelledby="stateroom-check-heading">
      ...
    </section>

  </main>

  <!-- FOOTER -->
  <footer class="wrap" role="contentinfo">
    ...
```

---

## What Users See

When embedded on a ship page, users will see:

1. **Section Header**: "Check Your Stateroom on This Ship"
2. **Compact Form**: Cabin input + traveler type + button (side-by-side on desktop)
3. **Inline Results**: Results appear below the form without page navigation
4. **Auto-selected Ship**: Ship is pre-selected based on the page they're on

---

## Ship Slug Reference

Use these exact values for the hidden input:

- `radiance-of-the-seas`
- `adventure-of-the-seas`
- `allure-of-the-seas`
- `anthem-of-the-seas`
- `brilliance-of-the-seas`
- (etc. - match the filename from `/ships/rcl/`)

The slug must match both:
1. The ship page filename (e.g., `radiance-of-the-seas.html`)
2. The exception data filename (e.g., `stateroom-exceptions.radiance-of-the-seas.v2.json`)

---

## Accessibility Notes

- ✅ Form fields have proper labels
- ✅ Error messages use `role="alert"`
- ✅ Results container has `role="region"`
- ✅ Button states properly managed (disabled during loading)
- ✅ Results announced to screen readers via ARIA live regions

---

## Performance Notes

- The JavaScript module (`stateroom-check.js`) loads with `defer`
- Only one copy loads per page (safe to embed snippet on multiple pages)
- Form handler waits for module to be ready before attaching
- Results render client-side (no server required)

---

## Future Enhancements

When more ships are supported:
1. Update the standalone page's ship dropdown
2. Create exception data files for each ship
3. Add the embed snippet to each ship's page
4. Update the ship slug in each embed

---

## Troubleshooting

**Problem**: "Unable to load stateroom data"
- **Solution**: Ensure the exception JSON file exists at `/assets/data/staterooms/stateroom-exceptions.{ship-slug}.v2.json`

**Problem**: Button doesn't respond
- **Solution**: Check browser console for errors. Ensure `stateroom-check.js` loaded successfully.

**Problem**: Wrong ship selected
- **Solution**: Verify the `value` in the hidden input matches the ship's slug exactly.

---

Soli Deo Gloria ✝️
