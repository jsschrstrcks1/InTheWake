/**
 * Navigation Dropdown Functionality
 * Shared module for site-wide dropdown menus
 * Uses the .open class to show/hide dropdown menus
 */
(function() {
  'use strict';

  function initDropdowns() {
    var dropdowns = document.querySelectorAll('.nav-dropdown');
    if (!dropdowns.length) return;

    function toggleDropdown(dropdown) {
      var isOpen = dropdown.classList.contains('open');
      closeAllDropdowns();
      if (!isOpen) {
        dropdown.classList.add('open');
        var btn = dropdown.querySelector('button');
        if (btn) btn.setAttribute('aria-expanded', 'true');
      }
    }

    function closeAllDropdowns() {
      dropdowns.forEach(function(dd) {
        dd.classList.remove('open');
        var btn = dd.querySelector('button');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      });
    }

    dropdowns.forEach(function(dropdown) {
      var btn = dropdown.querySelector('button');
      if (btn) {
        btn.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          toggleDropdown(dropdown);
        });
        btn.addEventListener('keydown', function(e) {
          if (e.key === 'Escape') { closeAllDropdowns(); btn.focus(); }
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            dropdown.classList.add('open');
            btn.setAttribute('aria-expanded', 'true');
            var firstLink = dropdown.querySelector('.dropdown-menu a');
            if (firstLink) firstLink.focus();
          }
        });
      }
      var menuLinks = dropdown.querySelectorAll('.dropdown-menu a');
      menuLinks.forEach(function(link, index) {
        link.addEventListener('keydown', function(e) {
          if (e.key === 'Escape') { closeAllDropdowns(); if (btn) btn.focus(); }
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            var next = menuLinks[index + 1];
            if (next) next.focus();
          }
          if (e.key === 'ArrowUp') {
            e.preventDefault();
            var prev = menuLinks[index - 1];
            if (prev) prev.focus(); else if (btn) btn.focus();
          }
        });
      });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
      var isInsideDropdown = e.target.closest('.nav-dropdown');
      if (!isInsideDropdown) closeAllDropdowns();
    });
  }

  // Initialize when DOM is ready, or immediately if already loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDropdowns);
  } else {
    initDropdowns();
  }
})();
