/**
 * Critical CSS - Above the fold styles
 * Version: 1.0.0
 * Load inline in <head> for optimal performance
 */

/* CSS Variables */
:root {
  --sea: #0a3d62;
  --foam: #e6f4f8;
  --rope: #d9b382;
  --ink: #083041;
  --sky: #f7fdff;
  --accent: #0e6e8e;
  --shadow: 0 2px 6px rgba(8, 48, 65, 0.08);
  --shadow-lg: 0 10px 28px rgba(8, 48, 65, 0.14);
  --rail-width: 320px;
  --bg: #f8fbfc;
  --card: #fff;
  --bd: #e5e7eb;
  --muted: #525a66;
  --good: #10b981;
  --warn: #f59e0b;
  --bad: #ef4444;
}

/* Base Reset */
*,
*::before,
*::after {
  box-sizing: border-box;
}

/* Root */
html {
  scrollbar-gutter: stable both-edges;
  -webkit-text-size-adjust: 100%;
}

body {
  margin: 0;
  background: var(--sky);
  color: var(--ink);
  font: 16px/1.45 system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Typography */
h1,
h2,
h3,
h4,
h5,
h6 {
  color: var(--sea);
  line-height: 1.2;
  margin-top: 0;
}

a {
  color: var(--accent);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

/* Utility Classes */
.sr-only {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
}

.tiny {
  font-size: 0.88rem;
  color: #456;
}

.small {
  font-size: 0.9rem;
  color: #475569;
}

.muted {
  color: var(--muted);
}

/* Container */
.wrap {
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px 14px 36px;
}

/* Card Component */
.card {
  background: var(--card);
  border: 2px solid var(--rope);
  border-radius: 12px;
  padding: 1rem;
  margin: 0.8rem 0;
  box-shadow: var(--shadow);
}

/* Hero Header */
.hero-header {
  position: relative;
  border-bottom: 6px double var(--rope);
  background: #eaf6f6;
}

.navbar {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  gap: 0.6rem;
  padding: 0.35rem 0.9rem 0.75rem;
  align-items: center;
  min-height: 56px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.brand img {
  height: 40px;
  width: auto;
  max-width: min(42vw, 240px);
}

/* Hero */
.hero {
  position: relative;
  width: 100%;
  height: 200px;
  min-height: 200px;
  max-height: 200px;
  background: url('/assets/index_hero.jpg?v=3.010.071') center 50% / cover no-repeat;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
}

.hero-title {
  position: absolute;
  left: clamp(0.75rem, 3vw, 1rem);
  bottom: clamp(1rem, 4vh, 2rem);
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.45);
}

.hero-title .logo {
  width: clamp(160px, 20vw, 340px);
  max-width: min(90vw, 720px);
  filter: drop-shadow(0 3px 8px rgba(0, 0, 0, 0.45));
}

/* Page Grid */
.page-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(260px, var(--rail-width));
  gap: 2rem;
  align-items: start;
}

@media (max-width: 979.98px) {
  .page-grid {
    grid-template-columns: 1fr;
  }
}

/* Forms */
input[type='text'],
input[type='number'],
input[type='email'],
select,
textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid var(--bd);
  border-radius: 8px;
  font: inherit;
  background: var(--card);
  color: var(--ink);
  min-height: 44px;
  font-size: 16px; /* Prevent zoom on iOS */
}

input:focus,
select:focus,
textarea:focus {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 8px 12px;
  border: 1px solid var(--bd);
  border-radius: 8px;
  background: #0f172a;
  color: #fff;
  font-weight: 700;
  min-height: 44px;
  font-size: 1rem;
  transition: all 0.2s;
  text-decoration: none;
}

.btn:hover {
  background: #1e293b;
  transform: scale(1.02);
}

.btn.ghost {
  background: #fff;
  color: #0f172a;
}

/* Loading State */
.loading {
  opacity: 0.6;
  pointer-events: none;
}

.loading::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Dark mode override - force light */
@media (prefers-color-scheme: dark) {
  :root {
    color-scheme: light;
  }
  
  body,
  .card {
    background: var(--sky) !important;
    color: var(--ink) !important;
  }
}

/* Print */
@media print {
  body {
    font-size: 12pt;
    background: var(--card);
  }
  
  .hero-header,
  .navbar,
  .rail,
  .btn,
  footer {
    display: none;
  }
  
  .card {
    border: none;
    box-shadow: none;
    page-break-inside: avoid;
  }
}
