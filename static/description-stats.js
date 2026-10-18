(() => {
  const stats = document.querySelector('[data-description-stats]');
  if (!stats || !('IntersectionObserver' in window)) return;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (motion.matches) return;

  const observer = new IntersectionObserver((entries) => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    if (!motion.matches) stats.classList.add('is-revealed');
    observer.disconnect();
  }, { threshold: 0.25 });

  observer.observe(stats);
})();
