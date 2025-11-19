/**
 * Royal Caribbean Drink Calculator — Package Selection Feature
 * Version: 1.003.000
 * 
 * NEW FEATURE: Interactive clickable package cards
 * User can click any package to see costs with that specific package
 * 
 * "Whatever you do, work at it with all your heart, as working for the Lord"
 * — Colossians 3:23
 */

(function(window) {
  'use strict';

  /**
   * Package Selection Module
   * Handles interactive package card clicks and forced package calculation
   */
  const PackageSelection = {
    
    // Current state
    userSelectedPackage: null, // null = show recommendation, 'soda'/'refresh'/'deluxe' = forced
    
    /**
     * Initialize package selection feature
     * Call this after DOM is ready and packages are rendered
     */
    init: function() {

      this.attachCardListeners();
      this.attachResetListener();

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
     * Show selection status banner
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
        
        // Insert before results or at top of calculator
        const results = document.getElementById('results');
        const calculator = document.getElementById('calculator-inputs');
        const insertBefore = results || calculator;
        if (insertBefore && insertBefore.parentNode) {
          insertBefore.parentNode.insertBefore(status, insertBefore);
        }
      }
      
      // Populate content
      status.innerHTML = `
        <div class="selector-content">
          <span class="selector-icon" aria-hidden="true">📊</span>
          <span class="selector-text">
            Viewing costs with: <strong id="selected-package-name">${this.formatPackageName(packageType)}</strong>
          </span>
          <button id="reset-to-recommendation" 
                  class="btn-reset"
                  type="button"
                  aria-label="Reset to recommended package">
            ↺ Show Recommendation
          </button>
        </div>
      `;
      
      status.style.display = 'block';
      
      // Re-attach reset listener (since we just recreated the button)
      this.attachResetListener();
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
        'soda': 'Soda Package',
        'refresh': 'Refreshment Package',
        'deluxe': 'Deluxe Beverage Package'
      };
      return names[type] || type;
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
