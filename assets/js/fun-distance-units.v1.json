/**
 * In the Wake — Fun Distance Engine
 * Version: 1.000
 * Converts distances into whimsical "fun units" based on a dataset.
 * Ex: “about 97 cats and 2 decks away”
 */

(function(window) {
  'use strict';

  const DATA_URL = '/assets/data/fun-distance-units.v1.json?v=1.000';
  let FUN_UNITS = null;

  /**
   * Load the fun-unit dataset (cached after first load)
   */
  async function loadFunUnits() {
    if (FUN_UNITS) return FUN_UNITS;

    try {
      const response = await fetch(DATA_URL, { cache: 'no-store' });
      if (!response.ok) throw new Error(`FunUnits load error: ${response.status}`);

      const data = await response.json();
      FUN_UNITS = data.units;
      return FUN_UNITS;

    } catch (err) {
      console.error("Could not load fun distance data:", err);
      FUN_UNITS = [];
      return FUN_UNITS;
    }
  }

  /**
   * Choose a random unit (optionally weighted)
   */
  function pickFunUnit(units, options = {}) {
    const { category } = options;

    let candidates = units;

    if (category) {
      candidates = units.filter(u => u.category === category);
      if (candidates.length === 0) candidates = units;
    }

    const index = Math.floor(Math.random() * candidates.length);
    return candidates[index];
  }

  /**
   * Convert feet into whimsical comparison
   */
  function formatFunDistance(feet, decks = 0, options = {}) {
    if (!FUN_UNITS || FUN_UNITS.length === 0) {
      return `${feet} ft${decks > 0 ? ` and ${decks} deck(s)` : ''}`;
    }

    const unit = pickFunUnit(FUN_UNITS, options);

    // Convert feet → inches → number of items
    const inches = feet * 12;

    // Slight randomization (±5%):
    const jitter = inches * (0.05 * (Math.random() - 0.5));
    const effective_inches = inches + jitter;

    const count = Math.max(1, Math.round(effective_inches / unit.approx_length_in_inches));

    // Plural or singular
    const label = count === 1 ? unit.label_singular : unit.label_plural;

    // Deck descriptor
    let deckText = '';
    if (decks > 0) {
      deckText = decks === 1 ? ' and 1 deck' : ` and ${decks} decks`;
    }

    // Mild humor rotation
    const jokes = [
      "give or take a fruit bowl",
      "in case you forgot your tape measure",
      "if you're counting carefully",
      "roughly speaking (don’t bring a ruler)",
      "plus or minus a snack break",
      "for those keeping score at home"
    ];
    const joke = jokes[Math.floor(Math.random() * jokes.length)];

    return `about ${count} ${label}${deckText} — ${joke}`;
  }

  /**
   * MAIN ENTRY: funDistance(feet, decks)
   */
  async function funDistance(feet, decks = 0, options = {}) {
    await loadFunUnits();
    return formatFunDistance(feet, decks, options);
  }

  // Expose globally
  window.FunDistance = {
    version: "1.000",
    funDistance,
    loadFunUnits
  };

})(window);
