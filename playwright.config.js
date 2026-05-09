// playwright.config.js
const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests/playwright",
  fullyParallel: true,
  use: {
    baseURL: "http://127.0.0.1:8765",
    trace: "retain-on-failure",
    headless: true
  },
  webServer: {
    command: "python3 -m http.server 8765 --bind 127.0.0.1",
    url: "http://127.0.0.1:8765/",
    reuseExistingServer: true,
    timeout: 30000
  }
});
