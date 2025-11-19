/**
 * Storage Module - Safe localStorage Wrapper
 * Version: 1.0.0 assets/js/modules/storage.js
 */

import { Security } from './security.js';

export class SafeStorage {
  /**
   * Set item with optional TTL
   * @param {string} key - Storage key
   * @param {*} value - Value to store
   * @param {number} ttl - Time to live in milliseconds
   * @returns {boolean} Success status
   */
  static set(key, value, ttl = null) {
    try {
      const item = {
        value: JSON.stringify(value),
        timestamp: Date.now(),
        ttl: ttl,
        version: '1.0'
      };
      
      const sanitizedKey = Security.sanitizeString(key, 100);
      localStorage.setItem(sanitizedKey, JSON.stringify(item));
      
      return true;
    } catch (err) {
      // QuotaExceededError or other

      // Try to clear old items
      this.clearExpired();
      
      // Retry once
      try {
        const item = {
          value: JSON.stringify(value),
          timestamp: Date.now(),
          ttl: ttl,
          version: '1.0'
        };
        
        localStorage.setItem(Security.sanitizeString(key, 100), JSON.stringify(item));
        return true;
      } catch {
        return false;
      }
    }
  }

  /**
   * Get item with TTL check
   * @param {string} key - Storage key
   * @returns {*} Stored value or null
   */
  static get(key) {
    try {
      const sanitizedKey = Security.sanitizeString(key, 100);
      const raw = localStorage.getItem(sanitizedKey);
      
      if (!raw) return null;
      
      const item = JSON.parse(raw);
      
      // Check TTL
      if (item.ttl && Date.now() - item.timestamp > item.ttl) {
        this.remove(key);
        return null;
      }
      
      return JSON.parse(item.value);
    } catch (err) {

      return null;
    }
  }

  /**
   * Remove item
   */
  static remove(key) {
    try {
      const sanitizedKey = Security.sanitizeString(key, 100);
      localStorage.removeItem(sanitizedKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Clear all items
   */
  static clear() {
    try {
      localStorage.clear();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Clear expired items
   */
  static clearExpired() {
    try {
      const keys = Object.keys(localStorage);
      let cleared = 0;
      
      for (const key of keys) {
        try {
          const raw = localStorage.getItem(key);
          const item = JSON.parse(raw);
          
          if (item.ttl && Date.now() - item.timestamp > item.ttl) {
            localStorage.removeItem(key);
            cleared++;
          }
        } catch {
          // Invalid format, remove it
          localStorage.removeItem(key);
          cleared++;
        }
      }
      
      if (cleared > 0) {

      }
      
      return cleared;
    } catch {
      return 0;
    }
  }

  /**
   * Get storage usage info
   */
  static getUsage() {
    try {
      let size = 0;
      let count = 0;
      
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          size += localStorage[key].length + key.length;
          count++;
        }
      }
      
      return {
        size: size,
        sizeKB: (size / 1024).toFixed(2),
        count: count,
        available: 5 * 1024 * 1024, // ~5MB typical
        percentUsed: ((size / (5 * 1024 * 1024)) * 100).toFixed(2)
      };
    } catch {
      return null;
    }
  }

  /**
   * Test if localStorage is available
   */
  static isAvailable() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Backup to sessionStorage
   */
  static backup(key) {
    try {
      const value = localStorage.getItem(key);
      if (value) {
        sessionStorage.setItem(`backup_${key}`, value);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Restore from sessionStorage
   */
  static restore(key) {
    try {
      const value = sessionStorage.getItem(`backup_${key}`);
      if (value) {
        localStorage.setItem(key, value);
        sessionStorage.removeItem(`backup_${key}`);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}

// Auto-clear expired items on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => SafeStorage.clearExpired());
} else {
  SafeStorage.clearExpired();
}

export default SafeStorage;
