#!/usr/bin/env node
/**
 * Deploy Tender Port Indicators
 *
 * Reads port-registry.json and adds the tender-port-indicator element
 * to all port pages where tenderPort: true.
 *
 * Usage: node scripts/deploy-tender-indicators.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');

// ANSI colors
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

const TENDER_INDICATOR_HTML = `
      <!-- Tender Port Indicator -->
      <div class="tender-port-indicator" role="status" aria-label="This is a tender port">
        <img class="tender-icon" src="/assets/images/icons/tender-boat.svg" alt="" aria-hidden="true" width="48" height="36">
        <div class="tender-text">
          <p class="tender-title">Tender Port</p>
          <p class="tender-desc">Ships anchor offshore and passengers take small boats (tenders) to reach the pier.</p>
        </div>
      </div>
`;

function deployTenderIndicators(dryRun = false) {
  console.log(`\n${BOLD}${CYAN}═══════════════════════════════════════════════════════════════════════${RESET}`);
  console.log(`${BOLD}${CYAN}  TENDER PORT INDICATOR DEPLOYMENT${dryRun ? ' (DRY RUN)' : ''}${RESET}`);
  console.log(`${BOLD}${CYAN}═══════════════════════════════════════════════════════════════════════${RESET}\n`);

  // Load port registry
  const registryPath = path.join(__dirname, '..', 'assets', 'data', 'ports', 'port-registry.json');
  const portsDir = path.join(__dirname, '..', 'ports');

  if (!fs.existsSync(registryPath)) {
    console.log(`${RED}ERROR: Port registry not found at ${registryPath}${RESET}`);
    process.exit(1);
  }

  const registryData = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
  const registry = registryData.ports || registryData; // Handle both wrapped and unwrapped formats

  // Find all tender ports
  const tenderPorts = Object.entries(registry)
    .filter(([slug, data]) => data && data.tenderPort === true)
    .map(([slug, data]) => ({ slug, name: data.name }));

  console.log(`${BOLD}Found ${tenderPorts.length} tender ports in registry:${RESET}`);
  tenderPorts.forEach(p => console.log(`  • ${p.name} (${p.slug})`));
  console.log('');

  let added = 0;
  let alreadyHas = 0;
  let notFound = 0;
  let errors = 0;

  for (const port of tenderPorts) {
    const portFile = path.join(portsDir, `${port.slug}.html`);

    if (!fs.existsSync(portFile)) {
      console.log(`${YELLOW}⚠ SKIP: ${port.name} - port page not found (${port.slug}.html)${RESET}`);
      notFound++;
      continue;
    }

    let content = fs.readFileSync(portFile, 'utf8');

    // Check if already has indicator
    if (content.includes('class="tender-port-indicator"')) {
      console.log(`${CYAN}○ EXISTS: ${port.name} - already has tender indicator${RESET}`);
      alreadyHas++;
      continue;
    }

    // Find the insertion point: various page structures
    const insertPatterns = [
      // Pattern 1: After port-name-overlay div (original belize-style)
      {
        regex: /(port-name-overlay[^>]*>[^<]*<\/div>\s*<\/div>)\s*\n\s*(<h1>)/,
        replacement: `$1\n${TENDER_INDICATOR_HTML}\n      $2`
      },
      // Pattern 2: After port-hero section (grand-cayman style)
      {
        regex: /(<\/section>\s*\n\s*\n\s*\n\s*)(<\!-- LOGBOOK SECTION)/,
        replacement: `$1${TENDER_INDICATOR_HTML}\n\n        $2`
      },
      // Pattern 3: After port-hero-credit, before next section
      {
        regex: /(port-hero-credit[^>]*>[^<]*<\/p>\s*<\/section>)\s*\n/,
        replacement: `$1\n${TENDER_INDICATOR_HTML}\n`
      },
      // Pattern 4: After port-hero-container closing
      {
        regex: /(port-hero-container[^>]*>[\s\S]*?<\/div>\s*<\/div>)\s*\n\s*(<h1>)/,
        replacement: `$1\n${TENDER_INDICATOR_HTML}\n      $2`
      },
      // Pattern 5: After any hero section, before h1 or h2
      {
        regex: /(<section[^>]*id="hero"[^>]*>[\s\S]*?<\/section>)\s*\n\s*(<(?:h1|h2|section))/,
        replacement: `$1\n${TENDER_INDICATOR_HTML}\n        $2`
      },
      // Pattern 6: After article.card opening, before first section/h1/h2
      {
        regex: /(<article class="card">\s*\n)(\s*)(<(?:section|h1|h2))/,
        replacement: `$1$2${TENDER_INDICATOR_HTML.trim()}\n$2$3`
      },
      // Pattern 7: Generic fallback - after opening article.card, before any content
      {
        regex: /(<article class="card">)\s*\n(\s*)(<\!--)/,
        replacement: `$1\n$2${TENDER_INDICATOR_HTML.trim()}\n$2$3`
      },
      // Pattern 8: article.card and h1 on same line (no newline between)
      {
        regex: /(<article class="card">)(<h1>)/,
        replacement: `$1\n${TENDER_INDICATOR_HTML}\n      $2`
      }
    ];

    let modified = false;
    for (const pattern of insertPatterns) {
      if (pattern.regex.test(content)) {
        content = content.replace(pattern.regex, pattern.replacement);
        modified = true;
        break;
      }
    }

    if (!modified) {
      console.log(`${RED}✗ ERROR: ${port.name} - could not find insertion point${RESET}`);
      errors++;
      continue;
    }

    if (dryRun) {
      console.log(`${GREEN}✓ WOULD ADD: ${port.name}${RESET}`);
    } else {
      fs.writeFileSync(portFile, content, 'utf8');
      console.log(`${GREEN}✓ ADDED: ${port.name}${RESET}`);
    }
    added++;
  }

  // Summary
  console.log(`\n${BOLD}════════════════════════════════════════════════════════════════════════${RESET}`);
  console.log(`${BOLD}DEPLOYMENT SUMMARY${dryRun ? ' (DRY RUN - no changes made)' : ''}${RESET}`);
  console.log(`════════════════════════════════════════════════════════════════════════`);
  console.log(`  ${GREEN}Added:${RESET}      ${added}`);
  console.log(`  ${CYAN}Already OK:${RESET} ${alreadyHas}`);
  console.log(`  ${YELLOW}Not found:${RESET}  ${notFound}`);
  console.log(`  ${RED}Errors:${RESET}     ${errors}`);
  console.log(`  ${BOLD}Total tender ports: ${tenderPorts.length}${RESET}`);

  if (dryRun && added > 0) {
    console.log(`\n${YELLOW}Run without --dry-run to apply changes${RESET}`);
  }

  return errors === 0;
}

// CLI
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

const success = deployTenderIndicators(dryRun);
process.exit(success ? 0 : 1);
