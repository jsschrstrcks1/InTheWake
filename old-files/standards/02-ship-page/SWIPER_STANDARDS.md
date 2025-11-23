# Swiper Standards — v3.006
- Load primary `/vendor/swiper/...` then fallback to CDN if primary fails.
- Initialize only after `window.__swiperReady` & `window.Swiper`.
- Ensure a11y: `aria-label`s on containers, keyboard support.
