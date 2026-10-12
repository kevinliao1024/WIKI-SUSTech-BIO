/* Return-to-top behavior only; these pages keep native section navigation. */
(() => {
  const page = document.querySelector('.content-reading-page');
  const button = page?.querySelector('[data-model-back-to-top]');
  const reading = page?.querySelector('.markdown-page');
  const heading = page?.querySelector('.page-hero h1');
  if (!button || !reading) return;

  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let queued = false;

  function update() {
    queued = false;
    const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 100;
    const visible = scrollY > 0 && reading.getBoundingClientRect().top <= header + 40;
    button.classList.toggle('is-visible', visible);
    button.classList.toggle('is-paused', document.hidden);
    button.inert = !visible;
    button.setAttribute('aria-hidden', String(!visible));
  }

  function schedule() {
    if (!queued) {
      queued = true;
      requestAnimationFrame(update);
    }
  }

  button.addEventListener('click', () => {
    if (heading) {
      heading.tabIndex = -1;
      heading.focus({preventScroll: true});
    }
    history.replaceState(history.state, '', location.pathname + location.search);
    window.scrollTo({top: 0, behavior: motion.matches ? 'instant' : 'smooth'});
  });
  addEventListener('scroll', schedule, {passive: true});
  addEventListener('resize', schedule);
  addEventListener('pageshow', schedule);
  document.addEventListener('visibilitychange', schedule);
  if ('ResizeObserver' in window) new ResizeObserver(schedule).observe(reading);
  update();
})();
