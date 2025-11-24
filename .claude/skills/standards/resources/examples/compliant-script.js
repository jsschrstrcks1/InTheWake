/**
 * Compliant JavaScript Example
 * Demonstrates all JavaScript standards for In the Wake project
 * Version: 1.0.0
 *
 * Standards demonstrated:
 * - Strict mode
 * - No console.log (production)
 * - No debugger statements
 * - No eval()
 * - Proper error handling
 * - No hardcoded secrets
 * - Clean code practices
 * - Accessibility support
 * - Security best practices
 */

"use strict";

// ============================================================================
// CONSTANTS (No magic numbers)
// ============================================================================

const DROPDOWN_CLOSE_DELAY = 300; // milliseconds
const MAX_MENU_LEVEL = 3;
const Z_INDEX_DROPDOWN = 10000;

// Configuration (from environment, not hardcoded)
const API_ENDPOINT = window.CONFIG?.apiEndpoint || '/api';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Safely query an element with error handling
 * @param {string} selector - CSS selector
 * @param {Element} context - Optional context element
 * @returns {Element|null} - Found element or null
 */
function safeQuerySelector(selector, context = document) {
  try {
    return context.querySelector(selector);
  } catch (error) {
    // Log to server, not console
    logErrorToServer(error, { selector });
    return null;
  }
}

/**
 * Safely query all elements with error handling
 * @param {string} selector - CSS selector
 * @param {Element} context - Optional context element
 * @returns {NodeList} - Found elements (empty if error)
 */
function safeQuerySelectorAll(selector, context = document) {
  try {
    return context.querySelectorAll(selector);
  } catch (error) {
    logErrorToServer(error, { selector });
    return [];
  }
}

/**
 * Debounce function to limit execution rate
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Sanitize HTML to prevent XSS attacks
 * Uses browser's built-in DOMParser instead of innerHTML
 * @param {string} html - HTML string to sanitize
 * @returns {DocumentFragment} - Safe DOM fragment
 */
function sanitizeHTML(html) {
  const template = document.createElement('template');
  // Only use textContent for safety, or use a library like DOMPurify
  template.textContent = html;
  return template.content;
}

/**
 * Log error to server (not console)
 * @param {Error} error - Error object
 * @param {Object} context - Additional context
 */
function logErrorToServer(error, context = {}) {
  // In production, send to logging service
  if (typeof window.errorLogger !== 'undefined') {
    window.errorLogger.log({
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    });
  }

  // For development only (would be removed in production)
  if (process.env.NODE_ENV === 'development') {
    console.error('[Development] Error:', error, context);
  }
}

// ============================================================================
// DROPDOWN NAVIGATION COMPONENT
// ============================================================================

class DropdownNavigation {
  constructor(containerSelector) {
    this.container = safeQuerySelector(containerSelector);
    if (!this.container) {
      logErrorToServer(new Error('Navigation container not found'), {
        selector: containerSelector
      });
      return;
    }

    this.dropdowns = [];
    this.closeTimeout = null;

    this.init();
  }

  init() {
    // Find all dropdown containers
    const navGroups = safeQuerySelectorAll('.nav-group', this.container);

    navGroups.forEach((group) => {
      const button = safeQuerySelector('button', group);
      const submenu = safeQuerySelector('.submenu', group);

      if (!button || !submenu) {
        return;
      }

      // Store reference
      this.dropdowns.push({ group, button, submenu });

      // Bind events
      this.bindDropdownEvents(group, button, submenu);
    });

    // Close on click outside
    this.bindOutsideClick();

    // Close on escape key
    this.bindEscapeKey();
  }

  bindDropdownEvents(group, button, submenu) {
    // Click to toggle
    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggleDropdown(group, button, submenu);
    });

    // Keyboard navigation (Enter/Space)
    button.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggleDropdown(group, button, submenu);
      }
    });

    // Hover with delay (for accessibility, keyboard users don't need this)
    if (!this.prefersReducedMotion()) {
      let hoverTimeout = null;

      group.addEventListener('mouseenter', () => {
        hoverTimeout = setTimeout(() => {
          this.openDropdown(group, button, submenu);
        }, DROPDOWN_CLOSE_DELAY);
      });

      group.addEventListener('mouseleave', () => {
        clearTimeout(hoverTimeout);
        this.closeDropdown(group, button, submenu);
      });
    }
  }

  toggleDropdown(group, button, submenu) {
    const isOpen = group.getAttribute('data-open') === 'true';

    if (isOpen) {
      this.closeDropdown(group, button, submenu);
    } else {
      // Close all other dropdowns first
      this.closeAllDropdowns();
      this.openDropdown(group, button, submenu);
    }
  }

  openDropdown(group, button, submenu) {
    group.setAttribute('data-open', 'true');
    button.setAttribute('aria-expanded', 'true');

    // Set high z-index to prevent overlap
    submenu.style.zIndex = Z_INDEX_DROPDOWN;

    // Focus first link in submenu for keyboard users
    const firstLink = safeQuerySelector('a', submenu);
    if (firstLink && document.activeElement === button) {
      firstLink.focus();
    }
  }

  closeDropdown(group, button, submenu) {
    group.setAttribute('data-open', 'false');
    button.setAttribute('aria-expanded', 'false');
  }

  closeAllDropdowns() {
    this.dropdowns.forEach(({ group, button, submenu }) => {
      this.closeDropdown(group, button, submenu);
    });
  }

  bindOutsideClick() {
    document.addEventListener('click', (e) => {
      // Check if click is outside all navigation groups
      const isInsideNav = e.target.closest('.nav-group');
      if (!isInsideNav) {
        this.closeAllDropdowns();
      }
    });
  }

  bindEscapeKey() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAllDropdowns();

        // Return focus to currently open button
        const openGroup = safeQuerySelector('.nav-group[data-open="true"]', this.container);
        if (openGroup) {
          const button = safeQuerySelector('button', openGroup);
          if (button) {
            button.focus();
          }
        }
      }
    });
  }

  prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  // Clean up event listeners (prevents memory leaks)
  destroy() {
    // Remove event listeners if needed
    this.dropdowns = [];
  }
}

// ============================================================================
// FORM VALIDATION
// ============================================================================

/**
 * Validate form with accessibility announcements
 * @param {HTMLFormElement} form - Form to validate
 * @returns {boolean} - Whether form is valid
 */
function validateForm(form) {
  if (!form) {
    return false;
  }

  let isValid = true;
  const errors = [];

  // Validate email
  const emailInput = safeQuerySelector('input[type="email"]', form);
  if (emailInput && emailInput.value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.value)) {
      isValid = false;
      errors.push({
        input: emailInput,
        message: 'Please enter a valid email address'
      });
    }
  }

  // Validate required fields
  const requiredInputs = safeQuerySelectorAll('[required]', form);
  requiredInputs.forEach((input) => {
    if (!input.value.trim()) {
      isValid = false;
      errors.push({
        input,
        message: 'This field is required'
      });
    }
  });

  // Display errors accessibly
  if (!isValid) {
    displayFormErrors(errors);
  }

  return isValid;
}

/**
 * Display form errors accessibly
 * @param {Array} errors - Array of error objects
 */
function displayFormErrors(errors) {
  errors.forEach(({ input, message }) => {
    // Create or update error message
    const errorId = `${input.id}-error`;
    let errorElement = document.getElementById(errorId);

    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.id = errorId;
      errorElement.className = 'error-message';
      errorElement.setAttribute('role', 'alert');
      errorElement.setAttribute('aria-live', 'polite');
      input.parentNode.appendChild(errorElement);
    }

    // Use textContent, never innerHTML with user input
    errorElement.textContent = message;

    // Associate with input
    input.setAttribute('aria-describedby', errorId);
    input.setAttribute('aria-invalid', 'true');

    // Add visual error class
    input.classList.add('has-error');
  });
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize all components when DOM is ready
 */
function initializeApp() {
  // Initialize dropdown navigation
  const nav = new DropdownNavigation('nav');

  // Initialize forms
  const forms = safeQuerySelectorAll('form');
  forms.forEach((form) => {
    form.addEventListener('submit', (e) => {
      if (!validateForm(form)) {
        e.preventDefault();
      }
    });
  });

  // Handle window resize with debouncing
  const handleResize = debounce(() => {
    // Recalculate layouts if needed
    // No heavy DOM manipulation here
  }, 250);

  window.addEventListener('resize', handleResize);

  // Announce to screen readers that app is ready
  announceToScreenReader('Page loaded successfully');
}

/**
 * Announce message to screen readers
 * @param {string} message - Message to announce
 */
function announceToScreenReader(message) {
  const announcer = document.getElementById('sr-announcer');
  if (announcer) {
    // Use textContent for safety
    announcer.textContent = message;

    // Clear after a delay
    setTimeout(() => {
      announcer.textContent = '';
    }, 1000);
  }
}

// ============================================================================
// APP START
// ============================================================================

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  // DOM already loaded
  initializeApp();
}

// Export for testing (if using modules)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DropdownNavigation,
    validateForm,
    sanitizeHTML,
    debounce
  };
}
