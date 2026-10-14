(() => {
  const orbit = document.querySelector('[data-reading-orbit]');
  const traveler = orbit?.querySelector('[data-orbit-traveler]');
  const value = orbit?.querySelector('[data-orbit-value]');
  const footer = document.querySelector('footer');
  if (!orbit || !traveler) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let queued = false;
  function update() {
    queued = false;
    const scrollable = Math.max(0, document.documentElement.scrollHeight - innerHeight);
    const ratio = scrollable ? Math.max(0, Math.min(1, scrollY / scrollable)) : 0;
    const travel = Math.max(0, orbit.clientHeight - traveler.offsetHeight);
    orbit.style.setProperty('--orbit-y', `${(ratio * travel).toFixed(2)}px`);
    orbit.style.setProperty('--orbit-turn', `${motion.matches ? 0 : (ratio * 720).toFixed(2)}deg`);
    orbit.classList.toggle('is-over-footer', !!footer && footer.getBoundingClientRect().top < traveler.getBoundingClientRect().bottom);
    const percent = String(Math.round(ratio * 100));
    orbit.setAttribute('aria-valuenow', percent);
    if (value) value.textContent = `${percent}%`;
  }
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  }
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  addEventListener('load', schedule);
  addEventListener('pageshow', schedule);
  motion.addEventListener('change', schedule);
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(schedule);
    observer.observe(document.body);
    observer.observe(orbit);
  }
  document.fonts?.ready.then(schedule);
  schedule();
})();
