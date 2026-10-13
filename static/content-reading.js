/* Shared reading controls; Team retains its existing native directory. */
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

(() => {
  const page = document.querySelector('.unified-reading-page');
  if (!page) return;
  const sidebar = page.querySelector('.markdown-toc');
  const reading = page.querySelector('.markdown-page');
  const mobile = page.querySelector('.mobile-toc');
  const links = [...page.querySelectorAll('.markdown-toc a[href^="#"], .mobile-toc a[href^="#"]')];
  const targetFor = hash => {
    try { return document.getElementById(decodeURIComponent(hash.slice(1))); }
    catch { return null; }
  };
  const targets = [...new Set(links.map(link => targetFor(link.hash)).filter(Boolean))];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let navigation = null;
  let queued = false;

  function offset(target) {
    return (parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0)
      + (target ? parseFloat(getComputedStyle(target).scrollMarginTop) || 0 : 0);
  }

  function destination(target) {
    return Math.max(0, Math.min(document.documentElement.scrollHeight - innerHeight,
      scrollY + target.getBoundingClientRect().top - offset(target)));
  }

  function update() {
    queued = false;
    const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 100;
    if (sidebar) sidebar.classList.toggle('is-long-directory', sidebar.offsetHeight > innerHeight - header - 56);
    let active = navigation?.target;
    if (!active) for (const target of targets) {
      if (target.getBoundingClientRect().top <= offset(target) + 36) active = target;
    }
    for (const link of links) {
      if (targetFor(link.hash) === active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  }

  function schedule() {
    if (!queued) { queued = true; requestAnimationFrame(update); }
  }

  function cancel() {
    if (!navigation) return;
    cancelAnimationFrame(navigation.frame);
    navigation = null;
    page.classList.remove('is-reading-navigating');
    schedule();
  }

  function navigate(target, focus) {
    cancel();
    const trip = {target, frame: 0};
    navigation = trip;
    const start = scrollY;
    const distance = Math.abs(destination(target) - start);
    const finish = () => {
      if (navigation !== trip) return;
      scrollTo({top: destination(target), behavior: 'instant'});
      navigation = null;
      page.classList.remove('is-reading-navigating');
      if (focus) {
        const temporary = !target.hasAttribute('tabindex');
        if (temporary) target.tabIndex = -1;
        target.focus({preventScroll: true});
        if (temporary) target.addEventListener('blur', () => target.removeAttribute('tabindex'), {once: true});
      }
      schedule();
    };
    if (motion.matches || distance < 2) { finish(); return; }
    page.classList.add('is-reading-navigating');
    const duration = Math.min(1400, Math.max(650, 500 + Math.sqrt(distance) * 7));
    let started;
    const step = time => {
      if (navigation !== trip) return;
      if (started === undefined) started = time;
      const progress = Math.min(1, (time - started) / duration);
      const eased = 1 - (1 - progress) ** 4;
      scrollTo({top: start + (destination(target) - start) * eased, behavior: 'instant'});
      if (progress < 1) trip.frame = requestAnimationFrame(step);
      else finish();
    };
    update();
    trip.frame = requestAnimationFrame(step);
  }

  for (const link of links) link.addEventListener('click', event => {
    if (event.defaultPrevented || event.button > 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = targetFor(link.hash);
    if (!target) return;
    event.preventDefault();
    if (mobile?.contains(link)) mobile.open = false;
    if (location.hash !== link.hash) history.pushState(history.state, '', location.pathname + location.search + link.hash);
    navigate(target, event.detail === 0);
  });
  for (const type of ['wheel', 'touchstart', 'pointerdown']) addEventListener(type, cancel, {passive: true});
  addEventListener('keydown', event => {
    if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ', 'Tab', 'Escape'].includes(event.key)) cancel();
  });
  addEventListener('popstate', cancel);
  addEventListener('hashchange', cancel);
  addEventListener('scroll', schedule, {passive: true});
  addEventListener('resize', schedule);
  addEventListener('pageshow', schedule);
  motion.addEventListener('change', () => {
    if (motion.matches && navigation) navigate(navigation.target, false);
  });
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(schedule);
    if (sidebar) observer.observe(sidebar);
    if (reading) observer.observe(reading);
  }
  update();
})();
