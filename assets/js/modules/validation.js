/**
 * Validation Module - Input Validation & Sanitization
 * Version: 1.0.0
 */

import { Security } from './security.js';
import CONFIG from './config.js';

export class Validation {
  /**
   * Validate and sanitize cruise days
   */
  static days(value) {
    const num = Security.sanitizeNumber(
      value,
      CONFIG.LIMITS.MIN_DAYS,
      CONFIG.LIMITS.MAX_DAYS
    );
    
    return {
      value: Math.round(num),
      valid: num >= CONFIG.LIMITS.MIN_DAYS && num <= CONFIG.LIMITS.MAX_DAYS,
      error: num < CONFIG.LIMITS.MIN_DAYS || num > CONFIG.LIMITS.MAX_DAYS
        ? `Must be between ${CONFIG.LIMITS.MIN_DAYS} and ${CONFIG.LIMITS.MAX_DAYS} days`
        : null
    };
  }

  /**
   * Validate sea days (cannot exceed total days)
   */
  static seaDays(value, totalDays) {
    const num = Security.sanitizeNumber(value, 0, totalDays);
    
    return {
      value: Math.round(num),
      valid: num >= 0 && num <= totalDays,
      error: num > totalDays
        ? `Cannot exceed total cruise days (${totalDays})`
        : null
    };
  }

  /**
   * Validate sea weighting percentage
   */
  static seaWeight(value) {
    const num = Security.sanitizeNumber(value, 0, CONFIG.LIMITS.SEA_WEIGHT_MAX);
    
    return {
      value: Math.round(num),
      valid: num >= 0 && num <= CONFIG.LIMITS.SEA_WEIGHT_MAX,
      error: num < 0 || num > CONFIG.LIMITS.SEA_WEIGHT_MAX
        ? `Must be between 0 and ${CONFIG.LIMITS.SEA_WEIGHT_MAX}%`
        : null
    };
  }

  /**
   * Validate number of adults
   */
  static adults(value) {
    const num = Security.sanitizeNumber(
      value,
      CONFIG.LIMITS.MIN_ADULTS,
      CONFIG.LIMITS.MAX_ADULTS
    );
    
    return {
      value: Math.round(num),
      valid: num >= CONFIG.LIMITS.MIN_ADULTS && num <= CONFIG.LIMITS.MAX_ADULTS,
      error: num < CONFIG.LIMITS.MIN_ADULTS || num > CONFIG.LIMITS.MAX_ADULTS
        ? `Must be between ${CONFIG.LIMITS.MIN_ADULTS} and ${CONFIG.LIMITS.MAX_ADULTS}`
        : null
    };
  }

  /**
   * Validate number of minors
   */
  static minors(value) {
    const num = Security.sanitizeNumber(
      value,
      CONFIG.LIMITS.MIN_MINORS,
      CONFIG.LIMITS.MAX_MINORS
    );
    
    return {
      value: Math.round(num),
      valid: num >= CONFIG.LIMITS.MIN_MINORS && num <= CONFIG.LIMITS.MAX_MINORS,
      error: num < CONFIG.LIMITS.MIN_MINORS || num > CONFIG.LIMITS.MAX_MINORS
        ? `Must be between ${CONFIG.LIMITS.MIN_MINORS} and ${CONFIG.LIMITS.MAX_MINORS}`
        : null
    };
  }

  /**
   * Validate drink quantity (supports ranges like "2-3")
   */
  static drinkQty(value) {
    if (value == null) {
      return { value: 0, valid: true, error: null };
    }
    
    const str = String(value).trim();
    
    // Check for range format "2-3" or "2–3"
    const rangeMatch = str.match(/^(\d*\.?\d+)\s*[-–]\s*(\d*\.?\d+)$/);
    
    if (rangeMatch) {
      const min = Security.sanitizeNumber(rangeMatch[1], 0, CONFIG.LIMITS.MAX_DRINK_QTY);
      const max = Security.sanitizeNumber(rangeMatch[2], 0, CONFIG.LIMITS.MAX_DRINK_QTY);
      
      if (min > max) {
        return {
          value: { min: max, max: min },
          valid: false,
          error: 'Min cannot be greater than max'
        };
      }
      
      return {
        value: { min, max },
        valid: true,
        error: null,
        isRange: true
      };
    }
    
    // Single value
    const num = Security.sanitizeNumber(value, 0, CONFIG.LIMITS.MAX_DRINK_QTY);
    
    return {
      value: Math.max(0, num),
      valid: num >= 0 && num <= CONFIG.LIMITS.MAX_DRINK_QTY,
      error: num < 0 || num > CONFIG.LIMITS.MAX_DRINK_QTY
        ? `Must be between 0 and ${CONFIG.LIMITS.MAX_DRINK_QTY}`
        : null,
      isRange: false
    };
  }

  /**
   * Validate voucher count
   */
  static voucherCount(value) {
    const num = Security.sanitizeNumber(value, 0, CONFIG.LIMITS.VOUCHER_MAX_PER_PERSON);
    
    return {
      value: Math.round(num),
      valid: num >= 0 && num <= CONFIG.LIMITS.VOUCHER_MAX_PER_PERSON,
      error: num < 0 || num > CONFIG.LIMITS.VOUCHER_MAX_PER_PERSON
        ? `Must be between 0 and ${CONFIG.LIMITS.VOUCHER_MAX_PER_PERSON}`
        : null
    };
  }

  /**
   * Validate currency code
   */
  static currency(value) {
    const upper = String(value).toUpperCase().trim();
    const valid = CONFIG.CURRENCIES.includes(upper);
    
    return {
      value: valid ? upper : 'USD',
      valid: valid,
      error: !valid ? `Unsupported currency: ${value}` : null
    };
  }

  /**
   * Validate email
   */
  static email(value) {
    const str = Security.sanitizeString(value, 200);
    const valid = Security.isValidEmail(str);
    
    return {
      value: str.toLowerCase(),
      valid: valid,
      error: !valid ? 'Invalid email format' : null
    };
  }

  /**
   * Validate entire inputs object
   */
  static validateInputs(inputs) {
    const errors = [];
    const sanitized = {};
    
    // Validate days
    const daysResult = this.days(inputs.days);
    sanitized.days = daysResult.value;
    if (daysResult.error) errors.push({ field: 'days', error: daysResult.error });
    
    // Validate sea days
    const seaDaysResult = this.seaDays(inputs.seaDays, sanitized.days);
    sanitized.seaDays = seaDaysResult.value;
    if (seaDaysResult.error) errors.push({ field: 'seaDays', error: seaDaysResult.error });
    
    // Validate sea weighting
    const seaWeightResult = this.seaWeight(inputs.seaWeight);
    sanitized.seaWeight = seaWeightResult.value;
    if (seaWeightResult.error) errors.push({ field: 'seaWeight', error: seaWeightResult.error });
    
    // Validate adults
    const adultsResult = this.adults(inputs.adults);
    sanitized.adults = adultsResult.value;
    if (adultsResult.error) errors.push({ field: 'adults', error: adultsResult.error });
    
    // Validate minors
    const minorsResult = this.minors(inputs.minors);
    sanitized.minors = minorsResult.value;
    if (minorsResult.error) errors.push({ field: 'minors', error: minorsResult.error });
    
    // Validate drinks
    sanitized.drinks = {};
    for (const key of CONFIG.DRINK_KEYS) {
      const result = this.drinkQty(inputs.drinks?.[key]);
      sanitized.drinks[key] = result.value;
      if (result.error) {
        errors.push({ field: `drinks.${key}`, error: result.error });
      }
    }
    
    // Copy boolean flags
    sanitized.seaApply = Boolean(inputs.seaApply ?? true);
    sanitized.calcMode = inputs.calcMode === 'itinerary' ? 'itinerary' : 'simple';
    sanitized.itinerary = Array.isArray(inputs.itinerary) ? inputs.itinerary : [];
    
    return {
      valid: errors.length === 0,
      errors: errors,
      sanitized: sanitized
    };
  }

  /**
   * Real-time input validator (returns immediate feedback)
   */
  static liveValidate(field, value, context = {}) {
    switch (field) {
      case 'days':
        return this.days(value);
      
      case 'seaDays':
        return this.seaDays(value, context.totalDays || 365);
      
      case 'seaWeight':
        return this.seaWeight(value);
      
      case 'adults':
        return this.adults(value);
      
      case 'minors':
        return this.minors(value);
      
      case 'voucherCount':
        return this.voucherCount(value);
      
      case 'currency':
        return this.currency(value);
      
      case 'email':
        return this.email(value);
      
      default:
        // Assume drink quantity
        return this.drinkQty(value);
    }
  }

  /**
   * Wire live validation to input element
   */
  static wireLiveValidation(input, field, context = {}) {
    const feedbackId = `${input.id}-feedback`;
    let feedback = document.getElementById(feedbackId);
    
    if (!feedback) {
      feedback = document.createElement('div');
      feedback.id = feedbackId;
      feedback.className = 'validation-feedback';
      feedback.style.cssText = 'font-size: 0.85rem; margin-top: 4px;';
      feedback.setAttribute('role', 'alert');
      input.parentNode.insertBefore(feedback, input.nextSibling);
    }
    
    const validate = () => {
      const result = this.liveValidate(field, input.value, context);
      
      if (result.error) {
        input.setAttribute('aria-invalid', 'true');
        input.setAttribute('aria-describedby', feedbackId);
        feedback.textContent = result.error;
        feedback.style.color = '#ef4444';
      } else {
        input.removeAttribute('aria-invalid');
        input.removeAttribute('aria-describedby');
        feedback.textContent = '';
      }
      
      return result;
    };
    
    input.addEventListener('blur', validate);
    input.addEventListener('change', validate);
    
    return validate;
  }
}

export default Validation;
