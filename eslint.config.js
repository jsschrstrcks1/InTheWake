// ESLint flat config for In the Wake
export default [
  {
    files: ["**/*.js"],
    ignores: [
      "old-files/**",
      "old-files-extracted/**",
      "standards/**",
      "**/node_modules/**"
    ],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: {
        // Browser globals
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        setInterval: "readonly",
        clearTimeout: "readonly",
        clearInterval: "readonly",
        fetch: "readonly",
        Response: "readonly",
        Request: "readonly",
        URL: "readonly",
        URLSearchParams: "readonly",
        localStorage: "readonly",
        sessionStorage: "readonly",
        location: "readonly",
        // Service Worker globals
        self: "readonly",
        caches: "readonly",
        clients: "readonly",
        skipWaiting: "readonly",
        Headers: "readonly",
        AbortController: "readonly",
        // Browser APIs
        screen: "readonly",
        // Third-party libraries
        Swiper: "readonly",
        Fuse: "readonly",
        // Custom globals
        SiteCache: "writable",
        FunDistance: "writable"
      }
    },
    rules: {
      // Error prevention
      "no-undef": "error",
      "no-unused-vars": ["warn", {
        "vars": "all",
        "args": "none",
        "varsIgnorePattern": "^_"
      }],
      "no-redeclare": "error",
      "no-const-assign": "error",
      "no-dupe-keys": "error",
      "no-duplicate-case": "error",
      "no-empty": "warn",
      "no-unreachable": "warn",

      // Best practices
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-with": "error",
      "no-debugger": "warn",
      "no-console": "off", // Allow console for service worker logging

      // Stylistic (warnings only)
      "semi": ["warn", "always"],
      "quotes": ["warn", "single", { "avoidEscape": true, "allowTemplateLiterals": true }],
      "indent": ["warn", 2, { "SwitchCase": 1 }],
      "no-trailing-spaces": "warn",
      "eol-last": "warn"
    }
  }
];
