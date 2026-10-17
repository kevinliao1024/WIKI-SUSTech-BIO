// Choose the animated opening before any story content is painted. Without
// JavaScript (or with reduced motion), the original readable fallback remains.
(() => {
  const root = document.currentScript.closest('[data-ot]');
  if (!root || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  root.classList.remove('ot--static');
  // Failed module imports must restore the readable page, not leave an empty TV.
  window.addEventListener('error', event => {
    if (event.target?.matches?.('script[data-ot-module]')) {
      root.classList.add('ot--static', 'is-ready');
    }
  }, true);
})();
