/**
 * In the Wake — Collapsible Sections Utility
 * Version: 1.0.0
 *
 * Provides site-wide collapsible section functionality.
 * Works with elements using .collapsible-section, .collapsible-header, and .collapsible-content classes.
 *
 * Usage:
 *   <div class="collapsible-section" id="my-section">
 *     <div class="collapsible-header" tabindex="0" role="button" aria-expanded="true">
 *       <h3>Section Title</h3>
 *       <span class="collapsible-toggle" aria-hidden="true">▼</span>
 *     </div>
 *     <div class="collapsible-content">
 *       <!-- Content here -->
 *     </div>
 *   </div>
 *
 * JavaScript: window.toggleCollapsible('my-section') or click/keyboard on header
 */

(function(window) {
  'use strict';

  /**
   * Toggle a collapsible section by ID
   * @param {string} sectionId - The ID of the collapsible-section element
   */
  function toggleCollapsible(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) {
      console.warn('[Collapsible] Section not found:', sectionId);
      return;
    }

    const isCollapsed = section.classList.toggle('collapsed');

    // Update ARIA state
    const header = section.querySelector('.collapsible-header');
    if (header) {
      header.setAttribute('aria-expanded', !isCollapsed);
    }

    // Announce to screen readers
    const title = section.querySelector('.collapsible-header h3, .collapsible-header h4');
    const titleText = title ? title.textContent.trim() : 'Section';
    announceToScreenReader(`${titleText} ${isCollapsed ? 'collapsed' : 'expanded'}`);
  }

  /**
   * Initialize all collapsible sections on the page
   * Attaches click and keyboard handlers
   */
  function initCollapsibles() {
    const sections = document.querySelectorAll('.collapsible-section');

    sections.forEach(section => {
      const header = section.querySelector('.collapsible-header');
      if (!header) return;

      // Set up accessibility attributes
      header.setAttribute('tabindex', '0');
      header.setAttribute('role', 'button');
      header.setAttribute('aria-expanded', !section.classList.contains('collapsed'));

      // Click handler
      header.addEventListener('click', (e) => {
        // Don't toggle if clicking on interactive elements inside header
        if (e.target.closest('button, a, input')) return;
        toggleCollapsible(section.id);
      });

      // Keyboard handler
      header.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleCollapsible(section.id);
        }
      });
    });
  }

  /**
   * Announce message to screen readers via live region
   * @param {string} message - The message to announce
   */
  function announceToScreenReader(message) {
    // Try to find existing live region
    let liveRegion = document.getElementById('a11y-status') ||
                     document.getElementById('aria-live-region');

    // Create one if it doesn't exist
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = 'a11y-status';
      liveRegion.setAttribute('role', 'status');
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only visually-hidden';
      liveRegion.style.cssText = 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;';
      document.body.appendChild(liveRegion);
    }

    liveRegion.textContent = message;

    // Clear after a moment to allow re-announcement
    setTimeout(() => {
      liveRegion.textContent = '';
    }, 100);
  }

  /**
   * Expand a collapsible section
   * @param {string} sectionId - The ID of the section to expand
   */
  function expandSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section && section.classList.contains('collapsed')) {
      toggleCollapsible(sectionId);
    }
  }

  /**
   * Collapse a collapsible section
   * @param {string} sectionId - The ID of the section to collapse
   */
  function collapseSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section && !section.classList.contains('collapsed')) {
      toggleCollapsible(sectionId);
    }
  }

  // Export to window
  window.toggleCollapsible = toggleCollapsible;
  window.initCollapsibles = initCollapsibles;
  window.expandSection = expandSection;
  window.collapseSection = collapseSection;

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCollapsibles);
  } else {
    // DOM already loaded
    initCollapsibles();
  }

})(window);
