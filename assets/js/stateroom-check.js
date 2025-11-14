/**
 * ============================================================
 * In the Wake — Stateroom Sanity Check Engine
 * Version: 1.000.alpha | Soli Deo Gloria ✝️
 *
 * "Trust in the LORD with all your heart, and do not lean
 *  on your own understanding." — Proverbs 3:5
 * ============================================================
 *
 * This module provides gentle, pastoral guidance for cruise
 * travelers checking their stateroom assignments.
 *
 * Core Philosophy:
 * - Encouraging, never condemning
 * - Helpful, not alarming
 * - Worshipful in clarity and order
 */

(function(window) {
  'use strict';

  // ============================================================
  // CONSTANTS & CONFIGURATION
  // ============================================================

  const VERSION = '1.000.alpha';
  const DATA_PATH_TEMPLATE = '/assets/data/staterooms/stateroom-exceptions.{ship}.v2.json';

  const TRAVELER_TYPES = {
    'solo': 'Traveling Solo',
    'couple': 'Traveling as a Couple',
    'family': 'Family With Kids',
    'light-sleeper': 'Light Sleeper',
    'motion-sensitive': 'Prone to Motion Sickness'
  };

  const TONE_MODIFIERS = {
    'solo': { noise: 1.0, motion: 1.0, convenience: 0.8, restful: 1.2 },
    'couple': { noise: 1.0, motion: 1.0, convenience: 0.9, restful: 1.2 },
    'family': { noise: 0.8, motion: 0.9, convenience: 1.5, restful: 0.8 },
    'light-sleeper': { noise: 1.5, motion: 1.0, convenience: 1.0, restful: 1.5 },
    'motion-sensitive': { noise: 0.8, motion: 1.8, convenience: 1.0, restful: 1.2 }
  };

  // ============================================================
  // UTILITY FUNCTIONS
  // ============================================================

  /**
   * Parse room range string into array of room numbers
   * Supports: "7001-7050", "7001,7002,7003", or mixed
   */
  function parseRoomRange(rangeStr) {
    const rooms = new Set();

    if (!rangeStr) return [];

    const parts = String(rangeStr).split(',').map(s => s.trim());

    parts.forEach(part => {
      if (part.includes('-')) {
        // Range: "7001-7050"
        const [start, end] = part.split('-').map(s => parseInt(s.trim(), 10));
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = start; i <= end; i++) {
            rooms.add(i);
          }
        }
      } else {
        // Single room
        const room = parseInt(part, 10);
        if (!isNaN(room)) {
          rooms.add(room);
        }
      }
    });

    return Array.from(rooms);
  }

  /**
   * Check if cabin number matches a room specification
   */
  function cabinMatchesSpec(cabinNum, roomsSpec) {
    const cabin = parseInt(cabinNum, 10);
    if (isNaN(cabin)) return false;

    if (Array.isArray(roomsSpec)) {
      return roomsSpec.includes(cabin);
    }

    if (typeof roomsSpec === 'string') {
      const rooms = parseRoomRange(roomsSpec);
      return rooms.includes(cabin);
    }

    return false;
  }

  /**
   * Fetch JSON data with error handling
   */
  async function fetchJSON(url) {
    try {
      const response = await fetch(url, {
        cache: 'no-store',
        credentials: 'omit',
        referrerPolicy: 'no-referrer'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch stateroom data:', error);
      return null;
    }
  }

  /**
   * Normalize ship slug
   */
  function normalizeShipSlug(slug) {
    return String(slug || '').toLowerCase().trim();
  }

  // ============================================================
  // CORE LOGIC
  // ============================================================

  /**
   * Load stateroom exceptions data for a ship
   */
  async function loadShipData(shipSlug) {
    const slug = normalizeShipSlug(shipSlug);
    const url = DATA_PATH_TEMPLATE.replace('{ship}', slug);
    return await fetchJSON(url);
  }

  /**
   * Find matching exceptions for a cabin
   */
  function findExceptions(cabinNum, exceptionsData) {
    if (!exceptionsData || !exceptionsData.exceptions) {
      return [];
    }

    const matches = [];
    const cabin = parseInt(cabinNum, 10);

    if (isNaN(cabin)) return [];

    exceptionsData.exceptions.forEach(exception => {
      if (cabinMatchesSpec(cabin, exception.rooms)) {
        matches.push(exception);
      }
    });

    return matches;
  }

  /**
   * Determine category from cabin number (basic heuristic)
   */
  function inferCategory(cabinNum) {
    const cabin = parseInt(cabinNum, 10);
    const deck = Math.floor(cabin / 1000);

    // Very basic inference - this should ideally come from data
    if (cabin >= 1000 && cabin < 3000) {
      return 'Interior';
    } else if (cabin >= 7000 && cabin < 9000) {
      return 'Balcony';
    } else if (cabin >= 9000) {
      return 'Suite';
    }
    return 'Ocean View';
  }

  /**
   * Apply tone modifiers based on traveler type and issue severity
   */
  function modifyLanguage(baseText, issueType, travelerType, severity) {
    const modifiers = TONE_MODIFIERS[travelerType] || TONE_MODIFIERS['couple'];
    let text = baseText;

    // Amplify or soften based on traveler type
    if (issueType === 'noise' && modifiers.noise > 1.2) {
      text = text.replace('may hear', 'will likely hear');
      text = text.replace('some noise', 'noticeable noise');
    } else if (issueType === 'noise' && modifiers.noise < 0.9) {
      text = text.replace('will hear', 'might occasionally hear');
      text = text.replace('noise', 'sounds');
    }

    if (issueType === 'motion' && modifiers.motion > 1.5) {
      text = text.replace('may feel', 'will feel');
      text = text.replace('some motion', 'more noticeable motion');
    }

    if (issueType === 'convenience' && modifiers.convenience > 1.3) {
      text = 'For families: ' + text;
    }

    return text;
  }

  /**
   * Generate pastoral, encouraging verdict
   */
  function generateVerdict(cabinNum, shipSlug, exceptions, travelerType) {
    const cabin = String(cabinNum);
    const category = inferCategory(cabinNum);
    const travelerLabel = TRAVELER_TYPES[travelerType] || 'Traveler';

    if (exceptions.length === 0) {
      // No issues - great choice!
      return {
        verdict: 'great',
        title: `Stateroom ${cabin} — A Wonderful Choice`,
        summary: `Stateroom ${cabin} is a ${category} cabin on this ship. You've chosen well—this room has no notable quirks or concerns. Most travelers find it comfortable and well-located.`,
        issues: [],
        encouragement: getEncouragementText(travelerType, 'great'),
        category: category
      };
    }

    // Has exceptions - gentle guidance
    const primaryException = exceptions[0];
    const issuesList = exceptions.map(ex => ({
      type: ex.severity || 'info',
      category: ex.category || 'general',
      heading: ex.display_heading || 'A Small Thing to Know',
      description: modifyLanguage(
        ex.pastoral_description || ex.description || 'A minor note about this cabin.',
        ex.category,
        travelerType,
        ex.severity
      ),
      severity: ex.severity || 'info'
    }));

    return {
      verdict: primaryException.severity === 'major' ? 'caution' : 'note',
      title: `Stateroom ${cabin} — ${primaryException.display_heading || 'Good Choice, With a Note'}`,
      summary: `Stateroom ${cabin} is a ${category} cabin. ${primaryException.pastoral_description || primaryException.description || 'There\'s one small thing to know about this location.'}`,
      issues: issuesList,
      encouragement: getEncouragementText(travelerType, primaryException.severity || 'minor'),
      category: category
    };
  }

  /**
   * Get encouraging closing text based on traveler type
   */
  function getEncouragementText(travelerType, severity) {
    const encouragements = {
      'solo': {
        'great': 'Enjoy your peaceful time at sea. You\'ve chosen a cabin that should serve you well.',
        'minor': 'Every cabin has its character. This is still a good choice for solo travel.',
        'major': 'If you have concerns, consider reaching out to your booking agent—they may have alternatives.'
      },
      'couple': {
        'great': 'May your cruise be restful and memorable. This is a solid choice.',
        'minor': 'Most couples find this cabin comfortable despite the small note above.',
        'major': 'If this doesn\'t feel right, your booking agent can help explore other options.'
      },
      'family': {
        'great': 'This cabin should work wonderfully for your family adventure!',
        'minor': 'Families often adapt well—this is still a good choice for making memories.',
        'major': 'For families, convenience matters. Your booking agent can suggest alternatives if needed.'
      },
      'light-sleeper': {
        'great': 'Rest easy—this cabin is well-positioned for peaceful nights.',
        'minor': 'Light sleepers may want to bring earplugs, but many rest well here.',
        'major': 'If restful sleep is essential, consider asking your booking agent about quieter locations.'
      },
      'motion-sensitive': {
        'great': 'This cabin is well-positioned for a smooth, stable ride.',
        'minor': 'Motion is usually gentle, but midship cabins may feel even more stable.',
        'major': 'If motion is a real concern, midship cabins on lower decks are often best. Ask your booking agent.'
      }
    };

    return encouragements[travelerType]?.[severity] || encouragements['couple'][severity];
  }

  // ============================================================
  // SCHEMA GENERATORS
  // ============================================================

  /**
   * Generate JSON-LD Accommodation schema
   */
  function generateAccommodationSchema(cabinNum, shipSlug, shipName, verdict) {
    const cabin = String(cabinNum);

    return {
      "@context": "https://schema.org",
      "@type": "Accommodation",
      "name": `Stateroom ${cabin} on ${shipName}`,
      "description": verdict.summary,
      "identifier": {
        "@type": "PropertyValue",
        "name": "Cabin Number",
        "value": cabin
      },
      "isRelatedTo": {
        "@type": "Product",
        "name": shipName,
        "category": "Cruise Ship"
      },
      "review": {
        "@type": "Review",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": verdict.verdict === 'great' ? '5' : (verdict.verdict === 'note' ? '4' : '3'),
          "bestRating": "5",
          "worstRating": "1"
        },
        "author": {
          "@type": "Organization",
          "name": "In the Wake"
        },
        "reviewBody": verdict.summary + ' ' + verdict.encouragement
      }
    };
  }

  /**
   * Generate FAQ schema
   */
  function generateFAQSchema(cabinNum, shipName, verdict) {
    const cabin = String(cabinNum);
    const hasNoiseIssue = verdict.issues.some(i => i.category === 'noise');
    const hasMotionIssue = verdict.issues.some(i => i.category === 'motion' || i.category === 'location');

    const faqs = [
      {
        "@type": "Question",
        "name": `Is stateroom ${cabin} on ${shipName} a good choice?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": verdict.summary
        }
      },
      {
        "@type": "Question",
        "name": `Is this cabin noisy?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": hasNoiseIssue
            ? verdict.issues.find(i => i.category === 'noise').description
            : `Stateroom ${cabin} is not known for noise issues. Most travelers rest comfortably.`
        }
      },
      {
        "@type": "Question",
        "name": `Is this cabin good for light sleepers?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": hasNoiseIssue
            ? `Light sleepers may want to bring earplugs. ${verdict.issues.find(i => i.category === 'noise')?.description || ''}`
            : `This cabin should be fine for light sleepers.`
        }
      },
      {
        "@type": "Question",
        "name": `Will this cabin feel motion?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": hasMotionIssue
            ? `${verdict.issues.find(i => i.category === 'motion' || i.category === 'location')?.description || 'Some motion may be noticeable.'}`
            : `Motion should be typical for this location. Midship cabins on lower decks generally feel the most stable.`
        }
      },
      {
        "@type": "Question",
        "name": `Is this a good cabin for families?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Stateroom ${cabin} is a ${verdict.category} cabin. Families often appreciate proximity to activities and dining. ${verdict.encouragement}`
        }
      }
    ];

    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs
    };
  }

  // ============================================================
  // HTML RENDERING
  // ============================================================

  /**
   * Render result card HTML
   */
  function renderResultCard(verdict, cabinNum, shipName) {
    const cabin = String(cabinNum);
    const verdictClass = verdict.verdict === 'great' ? 'verdict-great' :
                         verdict.verdict === 'note' ? 'verdict-note' : 'verdict-caution';
    const verdictIcon = verdict.verdict === 'great' ? '✅' :
                        verdict.verdict === 'note' ? '📝' : '⚠️';

    let issuesHTML = '';
    if (verdict.issues.length > 0) {
      issuesHTML = '<div class="issues-section"><h3>What to Know</h3>';
      verdict.issues.forEach(issue => {
        const iconMap = {
          'noise': '🔔',
          'motion': '⚓',
          'view': '👁️',
          'location': '📍',
          'general': 'ℹ️'
        };
        const icon = iconMap[issue.category] || 'ℹ️';
        issuesHTML += `
          <div class="issue-card issue-${issue.severity}">
            <h4>${icon} ${issue.heading}</h4>
            <p>${issue.description}</p>
          </div>
        `;
      });
      issuesHTML += '</div>';
    }

    return `
      <article class="stateroom-result ${verdictClass}" role="region" aria-live="polite">
        <header class="result-header">
          <h2>${verdictIcon} ${verdict.title}</h2>
          <p class="cabin-meta">${verdict.category} · ${shipName}</p>
        </header>

        <div class="result-summary">
          <p class="summary-text">${verdict.summary}</p>
        </div>

        ${issuesHTML}

        <footer class="result-encouragement">
          <p>${verdict.encouragement}</p>
        </footer>
      </article>
    `;
  }

  /**
   * Render schemas as script tags
   */
  function renderSchemas(cabinNum, shipSlug, shipName, verdict) {
    const accommodationSchema = generateAccommodationSchema(cabinNum, shipSlug, shipName, verdict);
    const faqSchema = generateFAQSchema(cabinNum, shipName, verdict);

    return `
      <script type="application/ld+json">
      ${JSON.stringify(accommodationSchema, null, 2)}
      </script>
      <script type="application/ld+json">
      ${JSON.stringify(faqSchema, null, 2)}
      </script>
    `;
  }

  // ============================================================
  // PUBLIC API
  // ============================================================

  /**
   * Main check function
   */
  async function checkStateroom(shipSlug, cabinNum, travelerType = 'couple') {
    // Normalize inputs
    const ship = normalizeShipSlug(shipSlug);
    const cabin = String(cabinNum).trim();
    const type = travelerType || 'couple';

    // Validate cabin number
    if (!/^\d+$/.test(cabin)) {
      return {
        error: true,
        message: 'Please enter a valid cabin number (numbers only).'
      };
    }

    // Load data
    const data = await loadShipData(ship);

    if (!data) {
      return {
        error: true,
        message: 'Unable to load stateroom data. Please try again later.'
      };
    }

    // Find exceptions
    const exceptions = findExceptions(cabin, data);

    // Generate verdict
    const verdict = generateVerdict(cabin, ship, exceptions, type);

    return {
      success: true,
      verdict: verdict,
      cabin: cabin,
      ship: ship,
      shipName: data.ship_name || 'Radiance of the Seas',
      travelerType: type
    };
  }

  /**
   * Render complete result (HTML + schemas)
   */
  function renderResult(result, container) {
    if (!container) return;

    if (result.error) {
      container.innerHTML = `
        <div class="error-message" role="alert">
          <p>⚠️ ${result.message}</p>
        </div>
      `;
      return;
    }

    if (!result.success) {
      container.innerHTML = '';
      return;
    }

    // Render card
    const cardHTML = renderResultCard(result.verdict, result.cabin, result.shipName);

    // Render schemas
    const schemasHTML = renderSchemas(result.cabin, result.ship, result.shipName, result.verdict);

    // Combine
    container.innerHTML = cardHTML + schemasHTML;

    // Scroll to result (smooth, accessible)
    setTimeout(() => {
      container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  // ============================================================
  // EXPORT
  // ============================================================

  window.StateroomCheck = {
    version: VERSION,
    check: checkStateroom,
    render: renderResult,
    parseRoomRange: parseRoomRange,
    TRAVELER_TYPES: TRAVELER_TYPES
  };

})(window);
