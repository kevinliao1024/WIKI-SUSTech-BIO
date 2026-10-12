(() => {
  const caret = document.querySelector('.typing-caret');
  if (caret) setTimeout(() => { caret.hidden = true; }, 2240);
  const modules = [...document.querySelectorAll('[data-model-module]')];
  const links = [...document.querySelectorAll('[data-module-link]')];
  const chapters = [...document.querySelectorAll('[data-model-chapter]')];
  const chapterLinks = [...document.querySelectorAll('[data-chapter-link]')];
  const sidebar = document.querySelector('.model-sidebar');
  const reading = document.querySelector('.model-reading');
  const page = document.querySelector('.model-page');
  const backToTop = document.querySelector('[data-model-back-to-top]');
  if (!modules.length) return;
  const compactNavigation = matchMedia('(max-width: 760px)');
  let expandedModule = null;
  function expand(link) {
    if (expandedModule === link) return;
    for (const other of links) {
      const panel = document.getElementById(other.getAttribute('aria-controls'));
      if (!panel) continue;
      const expanded = other === link;
      // Keep keyboard focus available if scrolling closes its chapter list.
      if (!expanded && panel.contains(document.activeElement)) other.focus({preventScroll: true});
      other.setAttribute('aria-expanded', String(expanded));
      panel.hidden = !expanded;
    }
    expandedModule = link;
  }
  for (const link of links) {
    link.addEventListener('click', event => {
      const target = document.getElementById(link.dataset.module);
      if (!target) return;
      // Native anchors retain their usual new-tab and history behavior.
      if (link.tagName === 'A') return;
      event.preventDefault();
      expand(link);
      if (location.hash === `#${target.id}`) target.scrollIntoView({block: 'start'});
      else location.hash = target.id;
      schedule();
    });
  }
  // Reveal the generated artwork once without moving the interactive contents.
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  backToTop?.addEventListener('click', () => {
    const overview = document.getElementById('model-overview');
    if (overview) {
      overview.tabIndex = -1;
      overview.focus({preventScroll: true});
    }
    history.replaceState(history.state, '', location.pathname + location.search);
    scrollTo({top: 0, behavior: motionPreference.matches ? 'auto' : 'smooth'});
  });
  document.addEventListener('visibilitychange', () => {
    backToTop?.classList.toggle('is-paused', document.hidden);
  });
  const revealAnimations = new Set();
  const reveal = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) {
      reveal.unobserve(entry.target);
      if (motionPreference.matches) continue;
      const art = entry.target.querySelector('.neuron-frame');
      if (!art) continue;
      const animation = art.animate([{opacity:.35, transform:'translateY(12px)'}, {opacity:1, transform:'translateY(0)'}], {duration:650, easing:'cubic-bezier(.22,1,.36,1)'});
      revealAnimations.add(animation);
      animation.finished.then(() => revealAnimations.delete(animation)).catch(() => {});
    }
  }, {threshold:.15});
  document.querySelectorAll('.module-card').forEach(card => reveal.observe(card));
  motionPreference.addEventListener('change', () => {
    if (motionPreference.matches) {
      revealAnimations.forEach(animation => animation.cancel());
      revealAnimations.clear();
    }
  });
  let queued = false;
  let currentChapter = null;
  function keepCurrentVisible(link) {
    if (!link || !sidebar) return;
    const container = compactNavigation.matches ? link.closest('.module-subnav') : sidebar;
    if (!container) return;
    const bounds = container.getBoundingClientRect();
    const item = link.getBoundingClientRect();
    // Scroll only the directory, never the page, when its active item changes.
    if (compactNavigation.matches) {
      if (item.left < bounds.left + 8) container.scrollLeft += item.left - bounds.left - 8;
      else if (item.right > bounds.right - 8) container.scrollLeft += item.right - bounds.right + 8;
    } else {
      if (item.top < bounds.top + 8) container.scrollTop += item.top - bounds.top - 8;
      else if (item.bottom > bounds.bottom - 8) container.scrollTop += item.bottom - bounds.bottom + 8;
    }
  }
  function update() {
    const navHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 112;
    const sidebarHeight = compactNavigation.matches && sidebar ? sidebar.offsetHeight : 0;
    const sidebarHeightValue = `${sidebarHeight}px`;
    if (page && page.style.getPropertyValue('--model-directory-height') !== sidebarHeightValue) {
      page.style.setProperty('--model-directory-height', sidebarHeightValue);
    }
    const offset = navHeight + sidebarHeight + 56;
    if (sidebar && reading) {
      const bounds = reading.getBoundingClientRect();
      const visible = bounds.top <= offset + 40 && bounds.bottom > navHeight;
      sidebar.classList.toggle('is-visible', visible);
      sidebar.inert = !visible;
      if (backToTop) {
        backToTop.classList.toggle('is-visible', visible);
        backToTop.inert = !visible;
        backToTop.setAttribute('aria-hidden', String(!visible));
      }
    }
    let current = null;
    for (const section of modules) if (section.getBoundingClientRect().top <= offset) current = section.id;
    const activeModule = links.find(link => link.dataset.module === current) || null;
    const moduleChanged = expandedModule !== activeModule;
    expand(activeModule);
    for (const link of links) {
      if (link.dataset.module === current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
    let chapter = null;
    for (const heading of chapters) {
      if (heading.closest('[data-model-module]')?.id === current && heading.getBoundingClientRect().top <= offset) chapter = heading.id;
    }
    for (const link of chapterLinks) {
      if (link.hash === `#${chapter}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
    if (moduleChanged || currentChapter !== chapter) {
      keepCurrentVisible(chapterLinks.find(link => link.hash === `#${chapter}`) || activeModule);
      currentChapter = chapter;
    }
    queued = false;
  }
  function schedule() { if (!queued) { queued = true; requestAnimationFrame(update); } }
  addEventListener('scroll', schedule, {passive: true});
  addEventListener('resize', schedule);
  addEventListener('load', schedule);
  addEventListener('hashchange', schedule);
  const layoutObserver = new ResizeObserver(schedule);
  document.querySelectorAll('.model-overview, .model-reading, .model-sidebar').forEach(element => layoutObserver.observe(element));
  schedule();
})();
