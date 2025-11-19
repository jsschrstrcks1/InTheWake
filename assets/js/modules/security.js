/**
 * Security Module - Input Sanitization & XSS Protection
 * Version: .9.005.005 assets/js/modules/security.js
 * Soli Deo Gloria ✝️
 */

export class Security {
  static CSP_NONCE = document.querySelector('meta[name="csp-nonce"]')?.content || '';

  /**
   * Sanitize HTML string - strip all tags except safe ones
   */
  static sanitizeHTML(input) {
    if (typeof input !== 'string') return '';
    
    const temp = document.createElement('div');
    temp.textContent = input;
    return temp.innerHTML;
  }

  /**
   * Sanitize numeric input - ensure it's a valid number
   */
  static sanitizeNumber(input, min = 0, max = 999) {
    const num = parseFloat(String(input).replace(/[^\d.-]/g, ''));
    if (!Number.isFinite(num)) return min;
    return Math.max(min, Math.min(max, num));
  }

  /**
   * Sanitize string input - remove dangerous patterns
   */
  static sanitizeString(input, maxLength = 200) {
    if (typeof input !== 'string') return '';
    
    return input
      .slice(0, maxLength)
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  }

  /**
   * Validate email format
   */
  static isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  }

  /**
   * Sanitize URL - ensure it's safe to use
   */
  static sanitizeURL(url) {
    try {
      const parsed = new URL(url, window.location.origin);
      
      // Only allow http/https
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return null;
      }
      
      return parsed.href;
    } catch {
      return null;
    }
  }

  /**
   * Create safe element with sanitized attributes
   */
  static createElement(tag, attrs = {}, ...children) {
    const el = document.createElement(tag);
    
    for (const [key, value] of Object.entries(attrs)) {
      if (key === 'class') {
        el.className = this.sanitizeString(value);
      } else if (key === 'style' && typeof value === 'object') {
        Object.assign(el.style, value);
      } else if (key.startsWith('data-')) {
        el.setAttribute(key, this.sanitizeString(String(value)));
      } else if (key.startsWith('aria-') || key === 'role' || key === 'id') {
        el.setAttribute(key, this.sanitizeString(String(value)));
      } else {
        el[key] = value;
      }
    }
    
    children.forEach(child => {
      if (typeof child === 'string') {
        el.appendChild(document.createTextNode(child));
      } else if (child instanceof Node) {
        el.appendChild(child);
      }
    });
    
    return el;
  }

  /**
   * Rate limiter for functions
   */
  static rateLimit(fn, limit = 100, interval = 1000) {
    let calls = 0;
    let resetTime = Date.now() + interval;
    
    return function(...args) {
      const now = Date.now();
      
      if (now > resetTime) {
        calls = 0;
        resetTime = now + interval;
      }
      
      if (calls >= limit) {

        return;
      }
      
      calls++;
      return fn.apply(this, args);
    };
  }

  /**
   * Secure localStorage wrapper with encryption placeholder
   */
  static SecureStorage = {
    set(key, value, ttl = null) {
      try {
        const item = {
          value: JSON.stringify(value),
          timestamp: Date.now(),
          ttl: ttl
        };
        
        localStorage.setItem(
          Security.sanitizeString(key, 100),
          JSON.stringify(item)
        );
        
        return true;
      } catch (err) {

        return false;
      }
    },
    
    get(key) {
      try {
        const raw = localStorage.getItem(Security.sanitizeString(key, 100));
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
    },
    
    remove(key) {
      try {
        localStorage.removeItem(Security.sanitizeString(key, 100));
        return true;
      } catch {
        return false;
      }
    },
    
    clear() {
      try {
        localStorage.clear();
        return true;
      } catch {
        return false;
      }
    }
  };

  /**
   * Input event sanitizer
   */
  static wireSecureInput(input) {
    // Prevent paste of HTML/scripts
    input.addEventListener('paste', (e) => {
      e.preventDefault();
      
      const text = (e.clipboardData || window.clipboardData).getData('text');
      const sanitized = this.sanitizeString(text);
      
      document.execCommand('insertText', false, sanitized);
    });
    
    // Prevent drop
    input.addEventListener('drop', (e) => {
      e.preventDefault();
    });
    
    // Sanitize on blur
    input.addEventListener('blur', () => {
      input.value = this.sanitizeString(input.value);
    });
  }

  /**
   * CSRF token management
   */
  static CSRFToken = {
    generate() {
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    },
    
    set(token) {
      Security.SecureStorage.set('csrf_token', token, 24 * 60 * 60 * 1000); // 24h
    },
    
    get() {
      return Security.SecureStorage.get('csrf_token');
    },
    
    validate(token) {
      return token === this.get();
    }
  };

  /**
   * Content Security Policy helper
   */
  static reportCSPViolation(violation) {

    // Report to analytics if enabled
    if (window.itwTrack) {
      window.itwTrack('csp_violation', {
        directive: violation.violatedDirective,
        uri: violation.blockedURI
      });
    }
  }

  /**
   * Initialize security features
   */
  static init() {
    // Wire CSP violation reporting
    document.addEventListener('securitypolicyviolation', (e) => {
      this.reportCSPViolation(e);
    });
    
    // Generate CSRF token if missing
    if (!this.CSRFToken.get()) {
      this.CSRFToken.set(this.CSRFToken.generate());
    }
    
    // Secure all text inputs on page
    document.querySelectorAll('input[type="text"], input[type="email"]').forEach(input => {
      this.wireSecureInput(input);
    });

  }
}

// Auto-init on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => Security.init());
} else {
  Security.init();
}

export default Security;
