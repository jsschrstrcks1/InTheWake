# In The Wake — Unified HTML v2.040

This bundle consolidates all styling into **assets/styles.css**, applies a unified header+hero to every page,
keeps the entire ship visible (`background-size: contain`), removes the dark overlay for vibrancy,
and fixes CSS-relative paths for GitHub Pages.

**Important:** Place your images (e.g., `index_hero.jpg`, `compass_rose.svg`, `logo_wake_teal.png`, `logo_teal_white.svg`)
in the `assets/` folder of your repo. The CSS references the hero as `url('index_hero.jpg')` because the CSS file lives inside `assets/`.
