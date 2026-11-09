// playwright.config.js
const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests/playwright",
  fullyParallel: true,
  use: {
    baseURL: "http://127.0.0.1:8765",
    trace: "retain-on-failure",
    headless: true,
    // No service worker unless a spec asks for one. The site's worker installs by fetching its whole precache list,
    // and in CI chrome-headless-shell crashed with SIGSEGV three times when a test closed its page during that
    // install: in the tipping calculator spec twice (InTheWake #2689, #2690) and the voyage landing spec once
    // (#2691), the last with no request routing at all. The specs that test the worker opt back in:
    // tests/playwright/pwa-offline.spec.js and tests/playwright/tools-smoke.spec.js.
    serviceWorkers: "block"
  },
  webServer: {
    command: "python3 -m http.server 8765 --bind 127.0.0.1",
    url: "http://127.0.0.1:8765/",
    reuseExistingServer: true,
    timeout: 30000
  }
});
