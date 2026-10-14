/* Reuse Model's sweeper artwork/styles without loading its module navigation. */
(() => {
  const page = document.querySelector('.content-page');
  const button = page?.querySelector('[data-model-back-to-top]');
  const reading = page?.querySelector('.content-reading');
  if (!button || !reading) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let queued = false;

  function update() {
    queued = false;
    const navHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 112;
    const directory = page.querySelector('.content-mobile-directory > summary, .dbtl-directory');
    const directoryHeight = innerWidth <= 760 && directory ? directory.offsetHeight : 0;
    const bounds = reading.getBoundingClientRect();
    const visible = bounds.top <= navHeight + directoryHeight + 96 && bounds.bottom > navHeight;
    button.classList.toggle('is-visible', visible);
    button.inert = !visible;
    button.setAttribute('aria-hidden', String(!visible));
    button.classList.toggle('is-paused', document.hidden);
  }
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  }
  button.addEventListener('click', () => {
    const overview = page.querySelector('.content-overview');
    if (overview) {
      overview.tabIndex = -1;
      overview.focus({ preventScroll: true });
    }
    history.replaceState(history.state, '', location.pathname + location.search);
    scrollTo({ top: 0, behavior: motion.matches ? 'auto' : 'smooth' });
  });
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  addEventListener('load', schedule);
  addEventListener('pageshow', schedule);
  document.addEventListener('visibilitychange', update);
  update();
})();
