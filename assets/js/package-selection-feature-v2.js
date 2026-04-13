/**
 * Drink Calculator v2 — Package Selection Feature (Config-Driven)
 * Version: 2.000.000 (Multi-Cruise-Line Architecture)
 * Based on: v1.005.000
 *
 * "Whatever you do, work at it with all your heart, as working for the Lord"
 * — Colossians 3:23
 *
 * ═══════════════════════════════════════════════════════════════
 * v2 ARCHITECTURE: CONFIG-DRIVEN MULTI-CRUISE-LINE SUPPORT
 * ═══════════════════════════════════════════════════════════════
 *
 * This file is a DUPLICATE of package-selection-feature.js with
 * one targeted modification for config-driven break-even messaging.
 * The original v1 file is UNTOUCHED.
 *
 * v2 CHANGE (1 modification):
 *
 * 1. BREAK-EVEN DRINK PRICES: From config instead of hardcoded
 *    - Lines 373-378: calculateBreakEvenHTML() now reads drink prices
 *      from window.ITW_LINE_CONFIG.packages.{soda,refreshment,deluxe}.breakEvenDrink
 *    - Was: hardcoded { soda: 3.50, refresh: 4.50, deluxe: 13.00 }
 *    - Now: config-driven with fallback to RCL defaults
 *    - This is the ONLY change in this file
 *
 * WHAT DID NOT CHANGE:
 * - Package card click handling
 * - Forced package selection logic
 * - Delta comparison calculations
 * - Cost breakdown display
 * - All DOM manipulation and event wiring
 *
 * DATA SOURCE:
 *   window.ITW_LINE_CONFIG?.packages?.{key}?.breakEvenDrink
 *   Returns { name: string, price: number } for break-even messaging
 *
 * ═══════════════════════════════════════════════════════════════
 * ORIGINAL v1 DOCUMENTATION (preserved for reference):
 * ═══════════════════════════════════════════════════════════════
 *
 * FEATURES:
 * - Interactive clickable package cards
 * - Delta comparison vs recommended package
 * - Break-even drink count messaging
 * - Transparent cost breakdown (fixed package + uncovered drinks)
 */

(function(window) {
  'use strict';

  // Escape HTML to prevent XSS
  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
  }

  /**
   * Package Selection Module
   * Handles interactive package card clicks and forced package calculation
   */
  const PackageSelection = {

    // Current state
    userSelectedPackage: null, // null = show recommendation, 'soda'/'refresh'/'deluxe' = forced

    // Cache recommended results for delta comparison
    recommendedResults: null,
    recommendedBars: null,

    /**
     * Initialize package selection feature
     * Call this after DOM is ready and packages are rendered
     */
    init: function() {

      this.attachCardListeners();
      this.attachResetListener();
      this.attachResultsListener();

    },

    /**
     * Listen for calculation results to cache recommended values
     */
    attachResultsListener: function() {
      // Listen for calc updates to cache recommended results
      document.addEventListener('itw:calc-updated', () => {
        // Only cache if we're in auto-recommend mode
        if (!this.userSelectedPackage && window.ITW?.store) {
          const results = window.ITW.store.get('results');
          if (results && results.bars) {
            this.recommendedResults = {
              winnerKey: results.winnerKey,
              bars: JSON.parse(JSON.stringify(results.bars)),
              packageBreakdown: results.packageBreakdown ? JSON.parse(JSON.stringify(results.packageBreakdown)) : null,
              perDay: results.perDay,
              trip: results.trip
            };
            console.log('[Package Selection] Cached recommended:', this.recommendedResults.winnerKey);
          }
        }
      });
    },

    /**
     * Attach click/keyboard listeners to package cards
     */
    attachCardListeners: function() {
      const cards = document.querySelectorAll('.package-card[data-package]');

      cards.forEach(card => {
        const packageType = card.dataset.package;

        // Make card focusable and interactive
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-pressed', 'false');

        // Update aria-label for clarity
        const packageName = this.formatPackageName(packageType);
        card.setAttribute('aria-label',
          `${packageName}. Click to calculate costs with this package.`);

        // Click handler
        card.addEventListener('click', (e) => {
          // Don't trigger if clicking editable price or other interactive elements
          if (e.target.closest('[data-edit-price]')) return;
          if (e.target.closest('button')) return;
          if (e.target.closest('a')) return;

          this.selectPackage(packageType);
        });

        // Keyboard handler
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.selectPackage(packageType);
          }
        });

        // Add visual cue on hover
        card.style.cursor = 'pointer';
      });
    },

    /**
     * Attach listener to reset button
     */
    attachResetListener: function() {
      const resetBtn = document.getElementById('reset-to-recommendation');
      if (!resetBtn) return;

      resetBtn.addEventListener('click', () => {
        this.resetToRecommendation();
      });
    },

    /**
     * User selects a specific package to view
     */
    selectPackage: function(packageType) {

      this.userSelectedPackage = packageType;

      // Update visual state
      this.updateCardSelection(packageType);

      // Show selection status banner
      this.showSelectionStatus(packageType);

      // Recalculate with forced package
      this.triggerCalculationWithForcedPackage(packageType);

      // Announce to screen readers
      this.announceToScreenReader(
        `Now viewing costs with ${this.formatPackageName(packageType)}`
      );
    },

    /**
     * Reset to recommendation
     */
    resetToRecommendation: function() {

      this.userSelectedPackage = null;

      // Clear visual state
      this.clearCardSelection();

      // Hide selection status banner
      this.hideSelectionStatus();

      // Recalculate normally (without forced package)
      this.triggerNormalCalculation();

      // Announce
      this.announceToScreenReader('Reset to recommended package');
    },

    /**
     * Update visual state of package cards
     */
    updateCardSelection: function(selectedType) {
      const cards = document.querySelectorAll('.package-card');

      cards.forEach(card => {
        const isSelected = card.dataset.package === selectedType;

        // Update classes
        card.classList.toggle('user-selected', isSelected);
        card.classList.remove('winner'); // Remove winner highlight (manual mode)

        // Update ARIA
        card.setAttribute('aria-pressed', isSelected ? 'true' : 'false');

        // Update aria-label
        const packageName = this.formatPackageName(card.dataset.package);
        let label = `${packageName}. `;
        if (isSelected) {
          label += 'Currently selected for calculation. ';
        }
        label += 'Click to calculate costs with this package.';
        card.setAttribute('aria-label', label);
      });
    },

    /**
     * Clear all selection states
     */
    clearCardSelection: function() {
      const cards = document.querySelectorAll('.package-card');

      cards.forEach(card => {
        card.classList.remove('user-selected');
        card.setAttribute('aria-pressed', 'false');

        const packageName = this.formatPackageName(card.dataset.package);
        card.setAttribute('aria-label',
          `${packageName}. Click to calculate costs with this package.`);
      });
    },

    /**
     * Show selection status banner with delta comparison
     */
    showSelectionStatus: function(packageType) {
      let status = document.getElementById('package-selector-status');

      if (!status) {
        // Create status element if it doesn't exist
        status = document.createElement('div');
        status.id = 'package-selector-status';
        status.className = 'selector-status';
        status.setAttribute('role', 'status');
        status.setAttribute('aria-live', 'polite');
        status.style.cssText = 'background:linear-gradient(135deg,#e3f2fd,#bbdefb);border:2px solid #2196f3;border-radius:12px;padding:1rem 1.25rem;margin:1rem 0;';

        // Insert before results or at top of calculator
        const results = document.getElementById('results');
        const calculator = document.getElementById('calculator-inputs');
        const insertBefore = results || calculator;
        if (insertBefore && insertBefore.parentNode) {
          insertBefore.parentNode.insertBefore(status, insertBefore);
        }
      }

      // Calculate delta if we have cached recommended results
      const deltaHTML = this.calculateDeltaHTML(packageType);

      // Populate content
      status.innerHTML = `
        <div class="selector-content" style="display:flex;flex-direction:column;gap:0.75rem;">
          <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:0.5rem;">
            <span style="font-size:1rem;">
              <span aria-hidden="true">📊</span>
              Viewing: <strong style="color:#1565c0;">${this.formatPackageName(packageType)}</strong>
            </span>
            <button id="reset-to-recommendation"
                    class="btn-reset"
                    type="button"
                    style="background:#fff;border:1px solid #1976d2;color:#1976d2;padding:0.4rem 0.75rem;border-radius:6px;cursor:pointer;font-size:0.9rem;"
                    aria-label="Reset to recommended package">
              ↺ Show Best Value
            </button>
          </div>
          ${deltaHTML}
        </div>
      `;

      status.style.display = 'block';

      // Re-attach reset listener (since we just recreated the button)
      this.attachResetListener();
    },

    /**
     * Calculate delta HTML for comparison messaging
     * NEW v1.005.000: Shows transparent breakdown (fixed cost + uncovered drinks)
     */
    calculateDeltaHTML: function(selectedPackage) {
      if (!this.recommendedResults || !this.recommendedResults.bars) {
        return '<p style="margin:0;font-size:0.9rem;color:#555;">Calculating comparison...</p>';
      }

      const recKey = this.recommendedResults.winnerKey;
      const bars = this.recommendedResults.bars;
      const breakdown = this.recommendedResults.packageBreakdown || {};

      // Get costs for comparison
      const recCost = bars[recKey]?.mean || 0;
      const selectedCost = bars[selectedPackage]?.mean || 0;
      const delta = selectedCost - recCost;

      // Get days from state for per-day calculation
      const days = window.ITW?.store?.get('inputs')?.days || 7;
      const deltaPerDay = delta / days;

      // Get breakdown for selected package
      const pkgBreakdown = breakdown[selectedPackage];

      // Format money helper
      const formatMoney = window.ITW?.formatMoney || ((v) => `$${v.toFixed(2)}`);

      // Build breakdown display if available
      let breakdownDisplay = '';
      if (pkgBreakdown) {
        const fixed = pkgBreakdown.fixedCost || 0;
        const uncovered = pkgBreakdown.uncoveredCost || 0;
        const dailyRate = pkgBreakdown.dailyRate || 0;
        const people = pkgBreakdown.people || 1;

        if (uncovered > 0.01) {
          breakdownDisplay = `
            <div style="background:#f5f5f5;border-radius:6px;padding:0.5rem 0.75rem;margin-top:0.5rem;font-size:0.85rem;">
              <div style="display:flex;justify-content:space-between;color:#333;">
                <span>Package (${formatMoney(dailyRate)}/day × ${days}d × ${people}p):</span>
                <strong>${formatMoney(fixed)}</strong>
              </div>
              <div style="display:flex;justify-content:space-between;color:#d32f2f;margin-top:2px;">
                <span>+ Uncovered drinks à la carte:</span>
                <strong>+${formatMoney(uncovered)}</strong>
              </div>
              <div style="display:flex;justify-content:space-between;border-top:1px solid #ddd;margin-top:4px;padding-top:4px;font-weight:600;">
                <span>Total:</span>
                <span>${formatMoney(fixed + uncovered)}</span>
              </div>
            </div>
          `;
        } else {
          breakdownDisplay = `
            <div style="background:#f5f5f5;border-radius:6px;padding:0.5rem 0.75rem;margin-top:0.5rem;font-size:0.85rem;color:#666;">
              ${formatMoney(dailyRate)}/day × ${days} days × ${people} ${people === 1 ? 'person' : 'people'} = <strong style="color:#333;">${formatMoney(fixed)}</strong>
            </div>
          `;
        }
      }

      // If selected IS the recommended, show that
      if (selectedPackage === recKey || Math.abs(delta) < 0.01) {
        return `
          <div style="background:#e8f5e9;border-radius:8px;padding:0.75rem;border-left:4px solid #4caf50;">
            <p style="margin:0;font-size:0.95rem;color:#2e7d32;">
              <strong>✓ This is the best value</strong> based on your drinking habits!
            </p>
            ${breakdownDisplay}
          </div>
        `;
      }

      // Calculate break-even drinks needed
      const breakEvenHTML = this.calculateBreakEvenHTML(selectedPackage, recKey, delta, days);

      if (delta > 0) {
        // Selected costs MORE than recommended
        return `
          <div style="background:#fff3e0;border-radius:8px;padding:0.75rem;border-left:4px solid #ff9800;">
            <p style="margin:0 0 0.5rem 0;font-size:0.95rem;color:#e65100;">
              <strong>+${formatMoney(delta)} more</strong> than ${this.formatPackageName(recKey)}
              <span style="color:#666;">(+${formatMoney(deltaPerDay)}/day)</span>
            </p>
            ${breakdownDisplay}
            ${breakEvenHTML}
          </div>
        `;
      } else {
        // Selected costs LESS (unusual case - maybe they picked a cheaper option)
        return `
          <div style="background:#e8f5e9;border-radius:8px;padding:0.75rem;border-left:4px solid #4caf50;">
            <p style="margin:0;font-size:0.95rem;color:#2e7d32;">
              <strong>${formatMoney(Math.abs(delta))} less</strong> than ${this.formatPackageName(recKey)}!
              But the recommended package better matches your drink selections.
            </p>
            ${breakdownDisplay}
          </div>
        `;
      }
    },

    /**
     * Calculate break-even drinks needed to justify the more expensive package
     */
    calculateBreakEvenHTML: function(selectedPackage, recPackage, delta, days) {
      // v2: Break-even drink prices from line config (falls back to RCL defaults)
      const lc = window.ITW_LINE_CONFIG;
      const drinkPrices = {
        'soda': lc?.packages?.soda?.breakEvenDrink || { name: 'sodas', price: 3.50 },
        'refresh': lc?.packages?.refreshment?.breakEvenDrink || { name: 'specialty coffees', price: 4.50 },
        'deluxe': lc?.packages?.deluxe?.breakEvenDrink || { name: 'cocktails', price: 13.00 }
      };

      // What drink type would justify upgrading?
      let upgradeItem = drinkPrices.refresh; // default

      if (selectedPackage === 'deluxe') {
        upgradeItem = drinkPrices.deluxe;
      } else if (selectedPackage === 'refresh') {
        upgradeItem = drinkPrices.refresh;
      } else if (selectedPackage === 'soda') {
        upgradeItem = drinkPrices.soda;
      }

      // v2 FIX (EC-16): Guard against division by zero if break-even drink price is 0
      if (!upgradeItem || !upgradeItem.price || upgradeItem.price <= 0) return '';
      const drinksNeeded = Math.ceil(delta / upgradeItem.price);
      const drinksPerDay = (drinksNeeded / days).toFixed(1);

      if (drinksNeeded <= 0) return '';

      return `
        <p style="margin:0;font-size:0.875rem;color:#666;">
          💡 <em>To make this worth it, you'd need about <strong>${drinksNeeded} more ${upgradeItem.name}</strong>
          over your trip (~${drinksPerDay}/day)</em>
        </p>
      `;
    },

    /**
     * Hide selection status banner
     */
    hideSelectionStatus: function() {
      const status = document.getElementById('package-selector-status');
      if (status) {
        status.style.display = 'none';
      }
    },

    /**
     * Trigger calculation with forced package
     * ✅ NEW v1.003.000: Properly integrated with ITW calculator
     */
    triggerCalculationWithForcedPackage: function(forcedPackage) {

      if (!window.ITW || !window.ITW.store) {

        return;
      }

      // Set forced package in state using nested path notation
      window.ITW.store.patch('ui.forcedPackage', forcedPackage);

      // Trigger calculation
      if (window.ITW.scheduleCalc) {
        window.ITW.scheduleCalc();

      } else {

      }
    },

    /**
     * Trigger normal calculation (no forced package)
     * ✅ NEW v1.003.000: Properly integrated with ITW calculator
     */
    triggerNormalCalculation: function() {

      if (!window.ITW || !window.ITW.store) {

        return;
      }

      // Clear forced package from state using nested path notation
      window.ITW.store.patch('ui.forcedPackage', null);

      console.log('[Package Selection] State cleared (auto-recommend)');

      // Trigger calculation
      if (window.ITW.scheduleCalc) {
        window.ITW.scheduleCalc();

      } else {

      }
    },

    /**
     * Get currently selected package (for external access)
     */
    getSelectedPackage: function() {
      return this.userSelectedPackage;
    },

    /**
     * Format package name for display
     */
    formatPackageName: function(type) {
      const names = {
        'alc': 'À la carte (no package)',
        'coffee': 'Coffee Card only',
        'soda': 'Soda Package',
        'refresh': 'Refreshment Package',
        'deluxe': 'Deluxe Beverage Package'
      };
      return names[type] || escapeHtml(type);
    },

    /**
     * Announce message to screen readers
     */
    announceToScreenReader: function(message) {
      const liveRegion = document.getElementById('a11y-status');
      if (liveRegion) {
        liveRegion.textContent = message;

        // Clear after a moment to allow re-announcement
        setTimeout(() => {
          liveRegion.textContent = '';
        }, 100);
      }
    }
  };

  /**
   * Export to window
   */
  window.PackageSelection = PackageSelection;

  /**
   * Auto-initialize when DOM is ready
   */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      // Give calculator time to render package cards first
      setTimeout(() => {
        PackageSelection.init();
      }, 100);
    });
  } else {
    // DOM already loaded
    setTimeout(() => {
      PackageSelection.init();
    }, 100);
  }

})(window);
