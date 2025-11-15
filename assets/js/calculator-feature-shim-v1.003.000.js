/**
 * Royal Caribbean Drink Calculator - v1.003.000 Feature Shim
 * Version: 1.003.000
 * 
 * QUICK FIX: Adds event handlers for new v1.003.000 HTML features
 * without rewriting existing calculator-ui.js
 * 
 * This file bridges the gap between v1.003.000 HTML and v1.002.000 JavaScript
 * 
 * Load this AFTER calculator-ui.js
 */

(function() {
  'use strict';
  
  console.log('[Feature Shim] v1.003.000 initializing...');
  
  // Wait for DOM and existing calculator to be ready
  document.addEventListener('DOMContentLoaded', function() {
    
    // Give existing calculator time to initialize
    setTimeout(function() {
      initializeV1003Features();
    }, 500);
    
  });
  
  function initializeV1003Features() {
    console.log('[Feature Shim] Wiring up new features...');
    
    // Feature 1: Non-alcoholic view toggle
    setupNonAlcoholicToggle();
    
    // Feature 2: Preset button recalculation trigger
    setupPresetRecalculation();
    
    // Feature 3: Pre-cruise pricing toggle (if implemented)
    setupPricingToggle();
    
    console.log('[Feature Shim] v1.003.000 features ready ✓');
  }
  
  /**
   * FEATURE 1: Non-Alcoholic View Toggle
   * Hide/show alcoholic drink inputs and trigger recalc
   */
  function setupNonAlcoholicToggle() {
    const toggle = document.getElementById('non-alcohol-view');
    const affirmation = document.getElementById('recovery-affirmation');
    
    if (!toggle) {
      console.warn('[Feature Shim] Non-alcohol toggle not found');
      return;
    }
    
    console.log('[Feature Shim] ✓ Non-alcoholic toggle found');
    
    toggle.addEventListener('change', function() {
      const isNonAlcOnly = toggle.checked;
      
      console.log('[Feature Shim] Non-alcoholic mode:', isNonAlcOnly ? 'ON' : 'OFF');
      
      // Show/hide affirmation message
      if (affirmation) {
        affirmation.style.display = isNonAlcOnly ? 'block' : 'none';
      }
      
      // Hide/show alcoholic drink inputs
      const alcoholicRows = document.querySelectorAll('[data-category="alcohol"]');
      alcoholicRows.forEach(function(row) {
        if (isNonAlcOnly) {
          row.style.display = 'none';
          // Zero out the input
          const input = row.querySelector('input[data-input]');
          if (input) {
            input.value = '0';
          }
        } else {
          row.style.display = '';
        }
      });
      
      // Hide/show Deluxe package card
      const deluxeCard = document.querySelector('[data-card="deluxe"]');
      if (deluxeCard) {
        deluxeCard.style.display = isNonAlcOnly ? 'none' : '';
      }
      
      // Trigger recalculation
      triggerRecalculation('Non-alcoholic toggle changed');
    });
  }
  
  /**
   * FEATURE 2: Preset Button Recalculation
   * When preset buttons update inputs, trigger recalc
   */
  function setupPresetRecalculation() {
    const presetContainer = document.getElementById('preset-buttons');
    
    if (!presetContainer) {
      console.warn('[Feature Shim] Preset container not found');
      return;
    }
    
    console.log('[Feature Shim] ✓ Preset container found');
    
    // Listen for clicks on preset buttons
    presetContainer.addEventListener('click', function(e) {
      const btn = e.target.closest('.preset-btn');
      if (!btn) return;
      
      console.log('[Feature Shim] Preset clicked:', btn.textContent);
      
      // Wait for preset to update inputs, then recalculate
      setTimeout(function() {
        triggerRecalculation('Preset applied');
      }, 100);
    });
  }
  
  /**
   * FEATURE 3: Pre-cruise Pricing Toggle
   * Adjust package prices and recalculate
   */
  function setupPricingToggle() {
    const pricingSelect = document.getElementById('pricing-type');
    
    if (!pricingSelect) {
      console.warn('[Feature Shim] Pricing toggle not found (optional feature)');
      return;
    }
    
    console.log('[Feature Shim] ✓ Pricing toggle found');
    
    pricingSelect.addEventListener('change', function() {
      const pricingType = pricingSelect.value; // 'pre' or 'onboard'
      
      console.log('[Feature Shim] Pricing type:', pricingType);
      
      // This is a placeholder - actual pricing adjustment would need
      // to be implemented in the main calculator economics
      // For now, just trigger recalc
      triggerRecalculation('Pricing type changed');
    });
  }
  
  /**
   * TRIGGER RECALCULATION
   * Fire an event on any input to trigger existing calculator logic
   */
  function triggerRecalculation(reason) {
    console.log('[Feature Shim] Triggering recalculation:', reason);
    
    // Strategy 1: Dispatch input event on first input field
    const firstInput = document.querySelector('input[data-input]');
    if (firstInput) {
      const event = new Event('input', { bubbles: true });
      firstInput.dispatchEvent(event);
      console.log('[Feature Shim] ✓ Input event dispatched');
      return;
    }
    
    // Strategy 2: If no input found, try calling calculate directly
    if (typeof window.calculate === 'function') {
      window.calculate();
      console.log('[Feature Shim] ✓ calculate() called directly');
      return;
    }
    
    // Strategy 3: Try ITW.calculate if that exists
    if (typeof window.ITW !== 'undefined' && typeof window.ITW.calculate === 'function') {
      window.ITW.calculate();
      console.log('[Feature Shim] ✓ ITW.calculate() called');
      return;
    }
    
    console.warn('[Feature Shim] Could not trigger recalculation - no method found');
  }
  
})();
