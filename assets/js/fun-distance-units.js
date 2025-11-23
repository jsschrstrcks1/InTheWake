/* fun-distance-units.js v1.0.0
 * Converts measurements to delightful whimsical units
 * Because sometimes you need to know if your ship is 26 blue whales long
 */

(function() {
  'use strict';

  // Quick reference units (extracted from fun-distance-units.json)
  const UNITS = {
    // Practical nautical-themed units
    blue_whale: { inches: 984, label_singular: 'blue whale', label_plural: 'blue whales' },
    football_field: { inches: 3600, label_singular: 'football field', label_plural: 'football fields' },
    school_bus: { inches: 480, label_singular: 'school bus', label_plural: 'school buses' },
    city_bus: { inches: 540, label_singular: 'city bus', label_plural: 'city buses' },
    bowling_alley: { inches: 2400, label_singular: 'bowling alley building width', label_plural: 'bowling alley building widths' },
    tennis_court: { inches: 936, label_singular: 'tennis court', label_plural: 'tennis courts' },

    // Absurd units for maximum whimsy
    emperor_penguin: { inches: 45, label_singular: 'emperor penguin', label_plural: 'emperor penguins' },
    coffee_mug: { inches: 4, label_singular: 'coffee mug in a tower', label_plural: 'coffee mugs in a tower' },
    teddy_bear: { inches: 18, label_singular: 'teddy bear', label_plural: 'teddy bears' },
    dinner_plate: { inches: 10.5, label_singular: 'dinner plate', label_plural: 'dinner plates' },
    giraffe: { inches: 216, label_singular: 'giraffe', label_plural: 'giraffes' }
  };

  // Templates for variety
  const TEMPLATES = {
    practical: [
      'About ~COUNT~ ~UNIT~ end-to-end',
      'Roughly ~COUNT~ ~UNIT~ in a row',
      'Approximately ~COUNT~ ~UNIT~ lined up',
      '~COUNT~ ~UNIT~ nose-to-tail',
      'The length of ~COUNT~ ~UNIT~'
    ],
    absurd: [
      '~COUNT~ ~UNIT~ stacked skyward (allegedly)',
      '~COUNT~ ~UNIT~ in a questionable tower',
      'About ~COUNT~ ~UNIT~ performing a daring circus act',
      '~COUNT~ ~UNIT~ forming an improbable stack',
      '~COUNT~ ~UNIT~ balancing like a Jenga game gone wrong'
    ],
    width: [
      'About ~COUNT~ ~UNIT~ wide',
      '~COUNT~ ~UNIT~ across',
      'Roughly ~COUNT~ ~UNIT~ from side to side',
      'Approximately ~COUNT~ ~UNIT~ in width',
      '~COUNT~ ~UNIT~ wingspans wide'
    ]
  };

  function pickTemplate(type) {
    const templates = TEMPLATES[type] || TEMPLATES.practical;
    return templates[Math.floor(Math.random() * templates.length)];
  }

  function formatUnit(count, unit, templateType = 'practical') {
    const label = count === 1 ? unit.label_singular : unit.label_plural;
    const template = pickTemplate(templateType);
    return template
      .replace(/~COUNT~/g, count)
      .replace(/~UNIT~/g, label);
  }

  function convertFeet(feet, unitKey, templateType = 'practical') {
    const unit = UNITS[unitKey];
    if (!unit) return null;

    const inches = feet * 12;
    const count = Math.round(inches / unit.inches);

    // Don't show if count is too small (less than 3) or too large (over 1000)
    if (count < 3 || count > 1000) return null;

    return formatUnit(count, unit, templateType);
  }

  // Public API
  window.funDistance = {
    convertFeet: convertFeet,

    // Convenience methods
    shipLength: function(feet) {
      const practical = convertFeet(feet, 'blue_whale', 'practical');
      const absurd = convertFeet(feet, 'emperor_penguin', 'absurd');
      return { practical, absurd };
    },

    shipBeam: function(feet) {
      const practical = convertFeet(feet, 'bowling_alley', 'width');
      const absurd = convertFeet(feet, 'giraffe', 'absurd');
      return { practical, absurd };
    },

    height: function(feet) {
      const practical = convertFeet(feet, 'giraffe', 'practical');
      const absurd = convertFeet(feet, 'teddy_bear', 'absurd');
      return { practical, absurd };
    },

    walkingDistance: function(feet) {
      if (feet < 100) {
        return {
          practical: convertFeet(feet, 'dinner_plate', 'practical'),
          absurd: convertFeet(feet, 'coffee_mug', 'absurd')
        };
      } else if (feet < 1000) {
        return {
          practical: convertFeet(feet, 'school_bus', 'practical'),
          absurd: convertFeet(feet, 'teddy_bear', 'absurd')
        };
      } else {
        return {
          practical: convertFeet(feet, 'football_field', 'practical'),
          absurd: convertFeet(feet, 'emperor_penguin', 'absurd')
        };
      }
    }
  };

  console.log('[Fun Distance] Converter loaded - measurements are about to get whimsical! 🐋');
})();
