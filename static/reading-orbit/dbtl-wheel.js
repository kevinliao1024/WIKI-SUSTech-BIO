(() => {
  const wheel = document.querySelector('[data-dbtl-wheel]');
  if (!wheel) return;
  const cycleSelect = wheel.querySelector('[data-dbtl-cycle]');
  const links = [...wheel.querySelectorAll('[data-dbtl-stage]')];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const stages = links.map(link => link.dataset.dbtlStage);
  const sections = [...document.querySelectorAll('.markdown-content h3[id]')].filter(heading =>
    [...cycleSelect.options].some(option => stages.some(stage => heading.id === `${option.value}-${stage}`)));
  let cycle = cycleSelect.value;
  let current = null;
  let angle = 0;
  let queued = false;
  let pending = null;
  function select(cycleId, stage) {
    const index = stages.indexOf(stage);
    if (index < 0 || !document.getElementById(`${cycleId}-${stage}`)) return;
    cycle = cycleId;
    cycleSelect.value = cycle;
    links.forEach(link => {
      link.href = `#${cycle}-${link.dataset.dbtlStage}`;
      if (link.dataset.dbtlStage === stage) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    if (current !== stage) {
      // Rotate the shortest way. Labels stay fixed and readable.
      const delta = ((index * 90 - angle) % 360 + 540) % 360 - 180;
      angle += delta === -180 ? 180 : delta;
      wheel.style.setProperty('--dbtl-angle', `${angle}deg`);
    }
    current = stage;
    wheel.querySelector('[data-dbtl-number]').textContent = `0${index + 1} / 04`;
    wheel.querySelector('[data-dbtl-current]').textContent = links[index].querySelector('span').textContent;
  }
  function go(target) {
    if (!target) return;
    const parts = target.id.match(/^(cycle-\d+)-(design|build|test|learn)$/);
    if (!parts) return;
    select(parts[1], parts[2]);
    pending = { target, expires: performance.now() + 2500 };
    if (location.hash !== `#${target.id}`) history.pushState(history.state, '', `#${target.id}`);
    target.tabIndex = -1;
    target.focus({ preventScroll: true });
    const offset = parseFloat(getComputedStyle(target).scrollMarginTop) || 142;
    // Explicit positioning avoids adding the global scroll-padding a second time.
    scrollTo({ top: scrollY + target.getBoundingClientRect().top - offset,
      behavior: motion.matches ? 'instant' : 'smooth' });
    schedule();
  }
  links.forEach(link => link.addEventListener('click', event => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    go(document.getElementById(link.hash.slice(1)));
  }));
  cycleSelect.addEventListener('change', () => go(document.getElementById(`${cycleSelect.value}-${current || 'design'}`)));
  function update() {
    queued = false;
    const navHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 112;
    const dock = wheel.closest('.dbtl-directory');
    const threshold = navHeight + (innerWidth <= 991 ? dock.offsetHeight : 0) + 50;
    if (pending) {
      const targetTop = pending.target.getBoundingClientRect().top;
      const margin = parseFloat(getComputedStyle(pending.target).scrollMarginTop) || threshold;
      if (Math.abs(targetTop - margin) < 3 || performance.now() > pending.expires) pending = null;
      else return;
    }
    let active = sections[0];
    for (const section of sections) if (section.getBoundingClientRect().top <= threshold) active = section;
    const parts = active?.id.match(/^(cycle-\d+)-(design|build|test|learn)$/);
    if (parts) select(parts[1], parts[2]);
  }
  function schedule() { if (!queued) { queued = true; requestAnimationFrame(update); } }
  function syncHash() {
    const target = document.getElementById(location.hash.slice(1));
    if (sections.includes(target)) go(target);
    else schedule();
  }
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('wheel', () => { pending = null; }, { passive: true });
  addEventListener('touchstart', () => { pending = null; }, { passive: true });
  addEventListener('resize', schedule);
  addEventListener('hashchange', syncHash);
  addEventListener('load', syncHash);
  motion.addEventListener('change', schedule);
  select(cycle, 'design');
  syncHash();
})();
