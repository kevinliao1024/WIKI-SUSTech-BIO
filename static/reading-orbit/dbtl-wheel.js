(() => {
  const wheel = document.querySelector('[data-dbtl-wheel]');
  if (!wheel) return;
  const dock = wheel.closest('.dbtl-directory');
  const layout = wheel.closest('.markdown-page--dbtl') || document.documentElement;
  const siteNav = document.querySelector('.site-nav');
  const links = [...wheel.querySelectorAll('[data-dbtl-stage]')];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const compact = matchMedia('(max-width: 991px)');
  const stages = links.map(link => link.dataset.dbtlStage);
  const sectionPattern = /^(cycle-\d+)-(design|build|test|learn)$/;
  const sections = [...document.querySelectorAll('.markdown-content :is(h2, h3, h4, h5, h6)[id]')]
    .filter(heading => sectionPattern.test(heading.id));
  if (!sections.length) return;

  let cycle = sections[0].id.match(sectionPattern)[1];
  let current = null;
  let angle = 0;
  let queued = false;
  let pending = null;
  let targetOffset = 140;
  let onScreen = true;

  function measure() {
    const navHeight = siteNav?.getBoundingClientRect().height ||
      parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 100;
    const dockHeight = dock?.getBoundingClientRect().height || 0;
    targetOffset = Math.ceil(navHeight + (compact.matches ? dockHeight : 0) + 20);
    // Both the article and the wheel inherit these values; native heading links
    // and stage navigation therefore share the measured sticky clearance.
    layout.style.setProperty('--dbtl-dock-height', `${Math.ceil(dockHeight)}px`);
    layout.style.setProperty('--dbtl-target-offset', `${targetOffset}px`);
  }

  function select(cycleId, stage) {
    const index = stages.indexOf(stage);
    if (index < 0 || !document.getElementById(`${cycleId}-${stage}`)) return;
    cycle = cycleId;
    wheel.dataset.cycle = cycle;
    wheel.dataset.stage = stage;
    links.forEach(link => {
      link.href = `#${cycle}-${link.dataset.dbtlStage}`;
      link.setAttribute('aria-label', `${link.querySelector('span').textContent}, ${cycle.replace('-', ' ')}`);
      if (link.dataset.dbtlStage === stage) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    if (current !== stage) {
      // The gold arc points to the selected corner while the inner currents
      // continue their independent rotation. Labels always remain upright.
      const delta = ((index * 90 - angle) % 360 + 540) % 360 - 180;
      angle += delta === -180 ? 180 : delta;
      wheel.style.setProperty('--dbtl-angle', `${angle}deg`);
    }
    current = stage;
  }

  function destination(target) {
    return Math.max(0, Math.min(document.documentElement.scrollHeight - innerHeight,
      scrollY + target.getBoundingClientRect().top - targetOffset));
  }

  function go(target, focus = true) {
    const parts = target?.id.match(sectionPattern);
    if (!parts) return;
    measure();
    select(parts[1], parts[2]);
    pending = { target, expires: performance.now() + 2500 };
    if (location.hash !== `#${target.id}`) history.pushState(history.state, '', `#${target.id}`);
    if (focus) {
      const temporary = !target.hasAttribute('tabindex');
      if (temporary) target.tabIndex = -1;
      target.focus({ preventScroll: true });
      if (temporary) target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
    }
    // Explicit scrolling avoids adding document scroll-padding a second time.
    scrollTo({ top: destination(target), behavior: motion.matches ? 'instant' : 'smooth' });
    schedule();
  }

  links.forEach(link => link.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = document.getElementById(link.hash.slice(1));
    if (!target) return;
    event.preventDefault();
    go(target);
  }));

  function update() {
    queued = false;
    if (pending) {
      if (Math.abs(scrollY - destination(pending.target)) < 3 || performance.now() > pending.expires) pending = null;
      else return;
    }
    let active = sections[0];
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= targetOffset + 40) active = section;
      else break;
    }
    const parts = active.id.match(sectionPattern);
    select(parts[1], parts[2]);
  }

  function schedule() { if (!queued) { queued = true; requestAnimationFrame(update); } }
  function syncHash() {
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); }
    catch { return; }
    const target = document.getElementById(id);
    if (sections.includes(target)) go(target);
    else {
      pending = null;
      schedule();
    }
  }
  function resize() {
    measure();
    schedule();
  }
  function setAnimationState() {
    wheel.toggleAttribute('data-paused', document.hidden || !onScreen);
  }
  function cancelPending() { pending = null; }

  addEventListener('scroll', schedule, { passive: true });
  addEventListener('wheel', cancelPending, { passive: true });
  addEventListener('touchstart', cancelPending, { passive: true });
  addEventListener('keydown', event => {
    if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', 'Escape'].includes(event.key)) cancelPending();
  });
  addEventListener('resize', resize);
  addEventListener('hashchange', syncHash);
  addEventListener('popstate', syncHash);
  addEventListener('load', () => { measure(); syncHash(); });
  document.addEventListener('visibilitychange', setAnimationState);
  motion.addEventListener('change', () => {
    if (motion.matches && pending) scrollTo({ top: destination(pending.target), behavior: 'instant' });
    schedule();
  });
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(resize);
    if (dock) observer.observe(dock);
    if (siteNav) observer.observe(siteNav);
  }
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => {
    onScreen = entries[0].isIntersecting;
    setAnimationState();
  }).observe(wheel);

  measure();
  select(cycle, 'design');
  setAnimationState();
  syncHash();
})();
