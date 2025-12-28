/**
 * Navigation Dropdown & Mobile Menu Functionality
 * Shared module for site-wide dropdown menus and hamburger menu
 * Uses the .open class to show/hide dropdown menus
 */
(function() {
  'use strict';

  function initNavigation() {
    var dropdowns = document.querySelectorAll('.nav-dropdown');
    var siteNav = document.querySelector('.site-nav');
    var navToggle = document.querySelector('.nav-toggle');

    // ===== Mobile Hamburger Menu =====
    function initMobileMenu() {
      if (!navToggle || !siteNav) return;

      navToggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        var isOpen = siteNav.classList.contains('mobile-open');
        if (isOpen) {
          closeMobileMenu();
        } else {
          openMobileMenu();
        }
      });

      // Close mobile menu when clicking a non-dropdown link
      siteNav.querySelectorAll('a:not(.nav-dropdown a)').forEach(function(link) {
        // Only direct nav links, not dropdown items
        if (!link.closest('.dropdown-menu')) {
          link.addEventListener('click', closeMobileMenu);
        }
      });

      // Close mobile menu on escape
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && siteNav.classList.contains('mobile-open')) {
          closeMobileMenu();
          navToggle.focus();
        }
      });
    }

    function openMobileMenu() {
      siteNav.classList.add('mobile-open');
      navToggle.classList.add('open');
      navToggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden'; // Prevent body scroll
    }

    function closeMobileMenu() {
      siteNav.classList.remove('mobile-open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      closeAllDropdowns();
    }

    // ===== Dropdown Menus =====
    function toggleDropdown(dropdown) {
      var isOpen = dropdown.classList.contains('open');
      closeAllDropdowns();
      if (!isOpen) {
        dropdown.classList.add('open');
        var btn = dropdown.querySelector('button');
        if (btn) btn.setAttribute('aria-expanded', 'true');
        // Add class to allow overflow on mobile (legacy support)
        if (siteNav) siteNav.classList.add('dropdown-open');
      }
    }

    function closeAllDropdowns() {
      dropdowns.forEach(function(dd) {
        dd.classList.remove('open');
        var btn = dd.querySelector('button');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      });
      if (siteNav) siteNav.classList.remove('dropdown-open');
    }

    // Initialize dropdowns
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
      var isNavToggle = e.target.closest('.nav-toggle');
      if (!isInsideDropdown && !isNavToggle) {
        closeAllDropdowns();
        // Also close mobile menu if clicking outside nav
        if (siteNav && siteNav.classList.contains('mobile-open') && !e.target.closest('.site-nav')) {
          closeMobileMenu();
        }
      }
    });

    // Initialize mobile menu
    initMobileMenu();
  }

  // Initialize when DOM is ready, or immediately if already loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavigation);
  } else {
    initNavigation();
  }
})();
