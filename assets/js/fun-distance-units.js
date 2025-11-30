/* fun-distance-units.js v1.1.0
 * Converts measurements to delightful whimsical units
 * Because sometimes you need to know if your ship is 26 blue whales long
 */

(function() {
  'use strict';

  // Average walking speed: 3 mph = 264 feet per minute
  const FEET_PER_MINUTE = 264;

  // Quick reference units (extracted from fun-distance-units.json)
  const UNITS = {
    // Practical nautical-themed units
    blue_whale: { inches: 984, label_singular: 'blue whale', label_plural: 'blue whales' },
    football_field: { inches: 3600, label_singular: 'football field', label_plural: 'football fields' },
    school_bus: { inches: 480, label_singular: 'school bus', label_plural: 'school buses' },
    city_bus: { inches: 540, label_singular: 'city bus', label_plural: 'city buses' },
    bowling_alley: { inches: 2400, label_singular: 'bowling alley building width', label_plural: 'bowling alley building widths' },
    tennis_court: { inches: 936, label_singular: 'tennis court', label_plural: 'tennis courts' },
    basketball_court: { inches: 1128, label_singular: 'basketball court', label_plural: 'basketball courts' },

    // Walking-friendly units
    banana: { inches: 7.5, label_singular: 'banana', label_plural: 'bananas' },
    baguette: { inches: 26, label_singular: 'baguette', label_plural: 'baguettes' },
    yoga_mat: { inches: 72, label_singular: 'yoga mat', label_plural: 'yoga mats' },
    minivan: { inches: 200, label_singular: 'minivan', label_plural: 'minivans' },

    // Absurd units for maximum whimsy
    emperor_penguin: { inches: 45, label_singular: 'emperor penguin', label_plural: 'emperor penguins' },
    coffee_mug: { inches: 4, label_singular: 'coffee mug in a tower', label_plural: 'coffee mugs in a tower' },
    teddy_bear: { inches: 18, label_singular: 'teddy bear', label_plural: 'teddy bears' },
    dinner_plate: { inches: 10.5, label_singular: 'dinner plate', label_plural: 'dinner plates' },
    giraffe: { inches: 216, label_singular: 'giraffe', label_plural: 'giraffes' },
    hot_dog: { inches: 6, label_singular: 'hot dog', label_plural: 'hot dogs' }
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
    },

    // Convert walking time (minutes) to feet
    minutesToFeet: function(minutes) {
      return Math.round(minutes * FEET_PER_MINUTE);
    },

    // Get a single whimsical string from walking minutes
    walkFromMinutes: function(minutes) {
      const feet = Math.round(minutes * FEET_PER_MINUTE);
      // Choose unit based on distance
      if (feet < 500) {
        return convertFeet(feet, 'baguette', 'practical');
      } else if (feet < 1500) {
        return convertFeet(feet, 'minivan', 'practical');
      } else if (feet < 4000) {
        return convertFeet(feet, 'school_bus', 'practical');
      } else {
        return convertFeet(feet, 'football_field', 'practical');
      }
    },

    // Parse walking time string and return fun conversion
    parseWalkTime: function(str) {
      // Match patterns like "10-15 minute walk", "10 minutes", "5–10 min"
      const match = str.match(/(\d+)(?:\s*[-–]\s*(\d+))?\s*(?:minute|min)/i);
      if (!match) return null;
      // Use midpoint if range given, otherwise use the number
      const min1 = parseInt(match[1]);
      const min2 = match[2] ? parseInt(match[2]) : min1;
      const avgMinutes = (min1 + min2) / 2;
      return this.walkFromMinutes(avgMinutes);
    }
  };

})();
