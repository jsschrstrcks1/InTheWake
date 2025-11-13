/**
 * Royal Caribbean Drink Package Calculator — Math Engine
 * Version: 1.003.000
 * 
 * Critical Fix: Minors must purchase Refreshment when adults purchase Deluxe
 * 
 * In the name of the Father, and of the Son, and of the Holy Spirit. Amen.
 * "Whatever you do, work at it with all your heart, as working for the Lord,
 *  not for human masters." — Colossians 3:23
 */

(function(window) {
  'use strict';

  const ITW_MATH = {
    version: '1.003.000',

    /**
     * Main compute function
     * @param {Object} inputs - User inputs (days, adults, minors, drinks, etc.)
     * @param {Object} economics - Package prices and economics
     * @param {Object} dataset - Drink prices and mappings
     * @param {Object} vouchers - Crown & Anchor voucher data
     * @returns {Object} Complete calculation results
     */
    compute: function(inputs, economics, dataset, vouchers) {
      // Validate inputs
      const validatedInputs = this.validateAndCleanInputs(inputs);
      
      // Calculate à la carte costs
      const alacarte = this.calculateAlaCarte(validatedInputs, economics, dataset, vouchers);
      
      // Calculate package costs (with policy enforcement)
      const packages = this.calculatePackages(validatedInputs, economics, vouchers);
      
      // Determine winner
      const winner = this.determineWinner(alacarte, packages, validatedInputs);
      
      // Calculate breakdowns
      const categoryBreakdown = this.calculateCategoryBreakdown(validatedInputs, economics, dataset);
      const groupBreakdown = this.calculateGroupBreakdown(validatedInputs, economics, winner, vouchers);
      
      // Generate nudges
      const nudges = this.generateNudges(validatedInputs, winner, alacarte, packages);
      
      // Health notes
      const healthNotes = this.generateHealthNotes(validatedInputs);
      
      return {
        alacarte,
        packages,
        winner,
        categoryBreakdown,
        groupBreakdown,
        nudges,
        healthNotes,
        inputs: validatedInputs
      };
    },

    /**
     * Validate and clean user inputs
     */
    validateAndCleanInputs: function(inputs) {
      const cleaned = {};
      
      // Days (min 1, max 365)
      cleaned.days = Math.max(1, Math.min(365, this.parseQty(inputs.days || 7)));
      cleaned.seaDays = Math.max(0, Math.min(cleaned.days, this.parseQty(inputs.seaDays || 3)));
      cleaned.portDays = cleaned.days - cleaned.seaDays;
      
      // Group composition (min 1 adult, max 20 people total)
      cleaned.adults = Math.max(1, Math.min(20, this.parseQty(inputs.adults || 1)));
      cleaned.minors = Math.max(0, Math.min(20, this.parseQty(inputs.minors || 0)));
      cleaned.totalPeople = cleaned.adults + cleaned.minors;
      
      // Sea/port weighting (0-40%)
      cleaned.seaWeight = Math.max(0, Math.min(40, this.parseQty(inputs.seaWeight || 0))) / 100;
      
      // Vouchers (Diamond: 4, Diamond+: 5, Pinnacle: 6)
      cleaned.voucherAdult = Math.max(0, Math.min(6, this.parseQty(inputs.voucherAdult || 0)));
      cleaned.voucherMinor = Math.max(0, Math.min(6, this.parseQty(inputs.voucherMinor || 0)));
      
      // Coffee cards
      cleaned.coffeeCards = Math.max(0, Math.min(10, this.parseQty(inputs.coffeeCards || 0)));
      cleaned.coffeePunches = Math.max(0, Math.min(15, this.parseQty(inputs.coffeePunches || 0)));
      
      // Daily drinks - IMPORTANT: These are PER ADULT, not total
      cleaned.drinks = {};
      const drinkTypes = [
        'soda', 'specialtyCoffee', 'premiumTea', 'freshJuice', 
        'mocktail', 'energyDrink', 'milkshake', 'bottledWater',
        'beer', 'wine', 'cocktail', 'spirits'
      ];
      
      drinkTypes.forEach(type => {
        const qty = this.parseQty(inputs.drinks?.[type] || 0);
        // Clamp to reasonable range (0-99 per day)
        cleaned.drinks[type] = Math.max(0, Math.min(99, qty));
      });
      
      // Validation: Minors cannot consume alcohol
      if (cleaned.adults === 0 && cleaned.minors > 0) {
        // Zero out all alcoholic drinks if no adults present
        ['beer', 'wine', 'cocktail', 'spirits'].forEach(type => {
          cleaned.drinks[type] = 0;
        });
      }
      
      return cleaned;
    },

    /**
     * Calculate à la carte costs
     */
    calculateAlaCarte: function(inputs, economics, dataset, vouchers) {
      const days = inputs.days;
      const adults = inputs.adults;
      const minors = inputs.minors;
      const totalPeople = inputs.totalPeople;
      
      // Calculate daily consumption with sea/port weighting
      const dailyDrinks = this.applySeaPortWeighting(inputs);
      
      let totalAlcoholic = 0;
      let totalNonAlcoholic = 0;
      
      // Calculate cost by category
      Object.keys(dailyDrinks).forEach(drinkType => {
        const qty = dailyDrinks[drinkType];
        const price = dataset.prices[drinkType] || 0;
        const isAlcoholic = ['beer', 'wine', 'cocktail', 'spirits'].includes(drinkType);
        
        const cost = qty * price * adults * days; // drinks are per adult
        
        if (isAlcoholic) {
          totalAlcoholic += cost;
        } else {
          totalNonAlcoholic += cost;
        }
      });
      
      // Add gratuity (18%)
      const gratuity = economics.gratuity || 0.18;
      const subtotal = totalAlcoholic + totalNonAlcoholic;
      const withGratuity = subtotal * (1 + gratuity);
      
      // Apply vouchers (reduce à la carte cost)
      const voucherValue = this.calculateVoucherValue(inputs, vouchers);
      const afterVouchers = Math.max(0, withGratuity - voucherValue);
      
      return {
        subtotal: subtotal,
        gratuity: subtotal * gratuity,
        total: withGratuity,
        afterVouchers: afterVouchers,
        voucherSavings: voucherValue,
        perDay: withGratuity / days,
        perPerson: withGratuity / totalPeople,
        alcoholic: totalAlcoholic * (1 + gratuity),
        nonAlcoholic: totalNonAlcoholic * (1 + gratuity)
      };
    },

    /**
     * Calculate package costs with CRITICAL POLICY ENFORCEMENT
     * 
     * Royal Caribbean Policy (August 2025):
     * - If adults purchase Deluxe, ALL minors must purchase Refreshment
     * - This is MANDATORY, no exceptions
     */
    calculatePackages: function(inputs, economics, vouchers) {
      const days = inputs.days;
      const adults = inputs.adults;
      const minors = inputs.minors;
      const totalPeople = inputs.totalPeople;
      
      const packages = {};
      
      // Soda Package
      packages.soda = this.calculatePackageCost('soda', inputs, economics, vouchers);
      
      // Refreshment Package
      packages.refresh = this.calculatePackageCost('refresh', inputs, economics, vouchers);
      
      // Deluxe Package (with minor policy enforcement)
      packages.deluxe = this.calculateDeluxePackage(inputs, economics, vouchers);
      
      return packages;
    },

    /**
     * Calculate individual package cost
     */
    calculatePackageCost: function(packageType, inputs, economics, vouchers) {
      const days = inputs.days;
      const adults = inputs.adults;
      const minors = inputs.minors;
      const totalPeople = inputs.totalPeople;
      
      const dailyPrice = economics.pkg[packageType];
      const cost = dailyPrice * totalPeople * days;
      
      // Vouchers reduce effective cost (but don't apply to package itself)
      const voucherValue = this.calculateVoucherValue(inputs, vouchers);
      
      return {
        daily: dailyPrice,
        total: cost,
        perPerson: cost / totalPeople,
        perDay: cost / days,
        voucherConflict: voucherValue > 0 // Flag if user has vouchers
      };
    },

    /**
     * Calculate Deluxe Package with MANDATORY minor Refreshment policy
     * 
     * CRITICAL FIX: When adults buy Deluxe, Royal Caribbean REQUIRES
     * all minors to purchase Refreshment Package (not à la carte).
     */
    calculateDeluxePackage: function(inputs, economics, vouchers) {
      const days = inputs.days;
      const adults = inputs.adults;
      const minors = inputs.minors;
      
      // Adults: Deluxe package
      const deluxeDaily = economics.pkg.deluxe;
      const adultCost = deluxeDaily * adults * days;
      
      // Minors: FORCED to Refreshment when adults buy Deluxe
      const refreshDaily = economics.pkg.refresh;
      const minorCost = minors > 0 ? (refreshDaily * minors * days) : 0;
      
      const totalCost = adultCost + minorCost;
      const totalPeople = adults + minors;
      
      // Calculate over-cap estimate (premium drinks above $14)
      const overCapEstimate = this.calculateOverCap(inputs, economics);
      
      // Vouchers create conflict (can't use with packages)
      const voucherValue = this.calculateVoucherValue(inputs, vouchers);
      
      return {
        daily: deluxeDaily, // Adult rate
        total: totalCost,
        perPerson: totalCost / totalPeople,
        perDay: totalCost / days,
        adultCost: adultCost,
        minorCost: minorCost,
        minorForced: minors > 0, // Flag that minors are forced to Refreshment
        overCap: overCapEstimate,
        voucherConflict: voucherValue > 0
      };
    },

    /**
     * Calculate voucher value
     * 
     * Crown & Anchor Vouchers:
     * - Diamond: 4/day @ $14 each
     * - Diamond Plus: 5/day @ $14 each
     * - Pinnacle: 6/day @ $14 each (FIXED from 5)
     */
    calculateVoucherValue: function(inputs, vouchers) {
      const days = inputs.days;
      const adults = inputs.adults;
      const minors = inputs.minors;
      
      const voucherValue = vouchers.value || 14; // $14 per voucher
      
      const adultVoucherTotal = inputs.voucherAdult * adults * days * voucherValue;
      const minorVoucherTotal = inputs.voucherMinor * minors * days * voucherValue;
      
      return adultVoucherTotal + minorVoucherTotal;
    },

    /**
     * Estimate over-cap costs for Deluxe package
     * (Drinks over $14 require additional payment)
     */
    calculateOverCap: function(inputs, economics) {
      const deluxeCap = economics.deluxeCap || 14;
      
      // This is a simplified estimate
      // In reality, would need price per drink type and compare to cap
      // For now, return 0 unless we add premium drink tracking
      
      return 0; // TODO: Enhance with premium drink logic
    },

    /**
     * Apply sea/port day weighting to drink quantities
     */
    applySeaPortWeighting: function(inputs) {
      const seaWeight = inputs.seaWeight;
      const seaDays = inputs.seaDays;
      const portDays = inputs.portDays;
      const totalDays = inputs.days;
      
      if (seaWeight === 0 || seaDays === 0 || portDays === 0) {
        // No weighting or only one day type - return as-is
        return inputs.drinks;
      }
      
      const weighted = {};
      
      Object.keys(inputs.drinks).forEach(type => {
        const baseQty = inputs.drinks[type];
        
        // Sea days: increase by weight
        const seaQty = baseQty * (1 + seaWeight);
        
        // Port days: decrease by weight
        const portQty = baseQty * (1 - seaWeight);
        
        // Average across total days
        const avgQty = (seaQty * seaDays + portQty * portDays) / totalDays;
        
        weighted[type] = avgQty;
      });
      
      return weighted;
    },

    /**
     * Determine winning package
     */
    determineWinner: function(alacarte, packages, inputs) {
      const costs = {
        alacarte: alacarte.afterVouchers,
        soda: packages.soda.total,
        refresh: packages.refresh.total,
        deluxe: packages.deluxe.total
      };
      
      // Find minimum cost
      let winner = 'alacarte';
      let minCost = costs.alacarte;
      
      Object.keys(costs).forEach(pkg => {
        if (costs[pkg] < minCost) {
          minCost = costs[pkg];
          winner = pkg;
        }
      });
      
      // Calculate savings vs à la carte
      const savings = alacarte.afterVouchers - minCost;
      
      return {
        package: winner,
        cost: minCost,
        savings: savings,
        costs: costs
      };
    },

    /**
     * Calculate category breakdown
     */
    calculateCategoryBreakdown: function(inputs, economics, dataset) {
      // Group drinks by category (soda, coffee, alcohol, etc.)
      const categories = {
        soda: 0,
        coffee: 0,
        water: 0,
        juice: 0,
        alcohol: 0,
        other: 0
      };
      
      const mapping = {
        soda: 'soda',
        specialtyCoffee: 'coffee',
        premiumTea: 'coffee',
        freshJuice: 'juice',
        bottledWater: 'water',
        beer: 'alcohol',
        wine: 'alcohol',
        cocktail: 'alcohol',
        spirits: 'alcohol',
        mocktail: 'other',
        energyDrink: 'other',
        milkshake: 'other'
      };
      
      Object.keys(inputs.drinks).forEach(type => {
        const qty = inputs.drinks[type];
        const price = dataset.prices[type] || 0;
        const cost = qty * price * inputs.adults * inputs.days;
        
        const category = mapping[type] || 'other';
        categories[category] += cost;
      });
      
      return categories;
    },

    /**
     * Calculate per-person breakdown
     */
    calculateGroupBreakdown: function(inputs, economics, winner, vouchers) {
      const breakdown = [];
      
      // Adults
      for (let i = 1; i <= inputs.adults; i++) {
        const person = {
          name: `Adult ${i}`,
          type: 'adult',
          package: winner.package,
          dailyCost: 0,
          totalCost: 0
        };
        
        if (winner.package === 'deluxe') {
          person.dailyCost = economics.pkg.deluxe;
          person.totalCost = economics.pkg.deluxe * inputs.days;
          person.forced = inputs.adults > 1; // Policy: all adults must buy
        } else if (winner.package === 'refresh') {
          person.dailyCost = economics.pkg.refresh;
          person.totalCost = economics.pkg.refresh * inputs.days;
        } else if (winner.package === 'soda') {
          person.dailyCost = economics.pkg.soda;
          person.totalCost = economics.pkg.soda * inputs.days;
        }
        
        breakdown.push(person);
      }
      
      // Minors
      for (let i = 1; i <= inputs.minors; i++) {
        const person = {
          name: `Minor ${i}`,
          type: 'minor',
          package: winner.package === 'deluxe' ? 'refresh' : winner.package,
          dailyCost: 0,
          totalCost: 0
        };
        
        if (winner.package === 'deluxe') {
          // CRITICAL: Minor FORCED to Refreshment
          person.package = 'refresh';
          person.dailyCost = economics.pkg.refresh;
          person.totalCost = economics.pkg.refresh * inputs.days;
          person.forced = true;
          person.reason = 'Required when adults purchase Deluxe';
        } else if (winner.package === 'refresh') {
          person.dailyCost = economics.pkg.refresh;
          person.totalCost = economics.pkg.refresh * inputs.days;
        } else if (winner.package === 'soda') {
          person.dailyCost = economics.pkg.soda;
          person.totalCost = economics.pkg.soda * inputs.days;
        }
        
        breakdown.push(person);
      }
      
      return breakdown;
    },

    /**
     * Generate helpful nudges
     */
    generateNudges: function(inputs, winner, alacarte, packages) {
      const nudges = [];
      
      // Close to break-even
      if (winner.savings < 50 && winner.savings > -50) {
        nudges.push({
          type: 'info',
          message: 'You\'re close to break-even. Consider convenience vs. slight cost difference.'
        });
      }
      
      // Vouchers + package conflict
      const hasVouchers = inputs.voucherAdult > 0 || inputs.voucherMinor > 0;
      if (hasVouchers && winner.package !== 'alacarte') {
        nudges.push({
          type: 'warning',
          message: 'Note: You cannot use Crown & Anchor vouchers if you purchase a package. Consider using vouchers only.'
        });
      }
      
      // Port-heavy itinerary
      if (inputs.portDays > inputs.seaDays * 2) {
        nudges.push({
          type: 'info',
          message: 'Port-heavy itinerary: You may drink less onboard. Packages may be less valuable.'
        });
      }
      
      return nudges;
    },

    /**
     * Generate health notes
     */
    generateHealthNotes: function(inputs) {
      const notes = [];
      
      // Calculate total alcoholic drinks per day
      const alcoholPerDay = ['beer', 'wine', 'cocktail', 'spirits'].reduce((sum, type) => {
        return sum + inputs.drinks[type];
      }, 0);
      
      // CDC guidelines: Moderate drinking = up to 2/day men, 1/day women
      // We don't know gender, so use conservative threshold
      if (alcoholPerDay > 3) {
        notes.push({
          level: 'caution',
          message: 'Consider pacing: 3+ alcoholic drinks per day exceeds CDC moderate drinking guidelines. Stay hydrated!'
        });
      }
      
      if (alcoholPerDay > 6) {
        notes.push({
          level: 'strong',
          message: 'Heavy consumption planned. Please prioritize health, hydration, and moderation. Your body is a temple.'
        });
      }
      
      return notes;
    },

    /**
     * Parse quantity - handles various input formats
     */
    parseQty: function(input) {
      if (typeof input === 'number') return input;
      if (typeof input !== 'string') return 0;
      
      // Remove everything except digits, decimal, and negative sign
      const cleaned = input.replace(/[^0-9.-]/g, '');
      const parsed = parseFloat(cleaned);
      
      return isNaN(parsed) ? 0 : parsed;
    },

    /**
     * Safe clone (no structuredClone for compatibility)
     */
    safeClone: function(obj) {
      if (obj === null || typeof obj !== 'object') return obj;
      if (obj instanceof Date) return new Date(obj.getTime());
      if (obj instanceof Array) return obj.map(item => this.safeClone(item));
      
      const cloned = {};
      for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
          cloned[key] = this.safeClone(obj[key]);
        }
      }
      return cloned;
    }
  };

  // Export to window
  window.ITW_MATH = ITW_MATH;

  // Log ready state
  console.log('[ITW Math Engine] v' + ITW_MATH.version + ' loaded ✓');
  console.log('[ITW Math Engine] CRITICAL FIX: Minors + Deluxe policy enforced');

})(window);
