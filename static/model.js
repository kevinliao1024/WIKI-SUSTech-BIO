(() => {
  const caret = document.querySelector('.typing-caret');
  if (caret) setTimeout(() => { caret.hidden = true; }, 2240);
  const modules = [...document.querySelectorAll('[data-model-module]')];
  const links = [...document.querySelectorAll('[data-module-link]')];
  // Unlisted sibling headings return selection to the nearest listed ancestor.
  const chapterPositions = modules.flatMap(module => {
    const ancestors = [];
    return [...module.querySelectorAll('h3, h4, h5, h6')].map(heading => {
      const level = Number(heading.tagName.slice(1));
      while (ancestors.length && ancestors.at(-1).level >= level) ancestors.pop();
      const chapter = heading.matches('[data-model-chapter], [data-model-subchapter]')
        ? heading.id : ancestors.at(-1)?.chapter || null;
      ancestors.push({level, chapter});
      return {heading, chapter, module: module.id};
    });
  });
  const chapterLinks = [...document.querySelectorAll('[data-chapter-link], [data-subchapter-link]')];
  const sidebar = document.querySelector('.model-sidebar');
  const reading = document.querySelector('.model-reading');
  const page = document.querySelector('.model-page');
  const backToTop = document.querySelector('[data-model-back-to-top]');
  if (!modules.length) return;
  const compactNavigation = matchMedia('(max-width: 760px)');
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  const panelAnimations = new Map();
  const indicators = new Map();
  let navigation = null;
  let expandedModule = null;
  let currentChapter = null;
  let directoryNeedsReveal = false;
  let queued = false;
  for (const link of links) {
    const panel = document.getElementById(link.getAttribute('aria-controls'));
    if (!panel) continue;
    const indicator = document.createElement('span');
    indicator.className = 'module-subnav-indicator';
    indicator.setAttribute('aria-hidden', 'true');
    panel.prepend(indicator);
    indicators.set(panel, indicator);
  }
  function animatePanel(panel, open) {
    const previous = panelAnimations.get(panel);
    if (!previous && panel.hidden === !open) return;
    // Measure before cancelling so a rapid second click continues from the
    // current visual position rather than replaying from an endpoint.
    const height = panel.hidden ? 0 : panel.getBoundingClientRect().height;
    const before = getComputedStyle(panel);
    const opacity = panel.hidden ? 0 : Number(before.opacity);
    const marginTop = panel.hidden ? 0 : parseFloat(before.marginTop) || 0;
    const marginBottom = panel.hidden ? 0 : parseFloat(before.marginBottom) || 0;
    previous?.cancel();
    panelAnimations.delete(panel);
    panel.classList.remove('is-animating');
    panel.inert = !open;
    panel.setAttribute('aria-hidden', String(!open));
    if (motionPreference.matches || !panel.animate) {
      panel.hidden = !open;
      return;
    }
    panel.hidden = false;
    const after = getComputedStyle(panel);
    const naturalHeight = panel.getBoundingClientRect().height;
    const naturalTop = parseFloat(after.marginTop) || 0;
    const naturalBottom = parseFloat(after.marginBottom) || 0;
    const frames = compactNavigation.matches ? [
      {opacity, transform: `translateX(${open ? -10 : 0}px)`},
      {opacity: open ? 1 : 0, transform: `translateX(${open ? 0 : 10}px)`},
    ] : [
      {height: `${height}px`, opacity, marginTop: `${marginTop}px`, marginBottom: `${marginBottom}px`, transform: 'translateY(-5px)'},
      {height: `${open ? naturalHeight : 0}px`, opacity: open ? 1 : 0, marginTop: `${open ? naturalTop : 0}px`, marginBottom: `${open ? naturalBottom : 0}px`, transform: `translateY(${open ? 0 : -5}px)`},
    ];
    panel.classList.add('is-animating');
    const animation = panel.animate(frames, {duration: open ? 340 : 260, easing: 'cubic-bezier(.22,1,.36,1)'});
    panelAnimations.set(panel, animation);
    animation.finished.then(() => {
      if (panelAnimations.get(panel) !== animation) return;
      panelAnimations.delete(panel);
      panel.classList.remove('is-animating');
      panel.hidden = !open;
      schedule();
      if (open) keepCurrentVisible(chapterLinks.find(item => item.getAttribute('aria-current')) || expandedModule);
    }).catch(() => {});
  }
  function expand(link) {
    if (expandedModule === link) return;
    for (const other of links) {
      const panel = document.getElementById(other.getAttribute('aria-controls'));
      if (!panel) continue;
      const expanded = other === link;
      // Keep keyboard focus available if scrolling closes its chapter list.
      if (!expanded && panel.contains(document.activeElement)) other.focus({preventScroll: true});
      other.setAttribute('aria-expanded', String(expanded));
      animatePanel(panel, expanded);
    }
    expandedModule = link;
  }
  function targetFromHash(hash) {
    try { return hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null; }
    catch { return null; }
  }
  function destination(target) {
    if (!target) return 0;
    const padding = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
    const maximum = Math.max(0, document.documentElement.scrollHeight - innerHeight);
    return Math.max(0, Math.min(maximum, scrollY + target.getBoundingClientRect().top - padding - margin));
  }
  function cancelNavigation() {
    if (!navigation) return;
    cancelAnimationFrame(navigation.frame);
    navigation = null;
    page?.classList.remove('is-model-navigating');
    schedule();
  }
  function focusTarget(target) {
    if (!target) return;
    const temporary = !target.hasAttribute('tabindex');
    if (temporary) target.tabIndex = -1;
    target.focus({preventScroll: true});
    if (temporary) target.addEventListener('blur', () => target.removeAttribute('tabindex'), {once: true});
  }
  function navigate(target, {record = false, animate = true, focus = false} = {}) {
    cancelNavigation();
    const module = target?.closest('[data-model-module]');
    const chapter = target?.matches('[data-model-chapter], [data-model-subchapter]') ? target : null;
    if (record) {
      const hash = target ? `#${target.id}` : '';
      if (location.hash !== hash) history.pushState(history.state, '', location.pathname + location.search + hash);
    }
    const trip = {target, module: module?.id || null, chapter: chapter?.id || null, frame: 0};
    navigation = trip;
    expand(links.find(link => link.dataset.module === trip.module) || null);
    // Synchronize selection immediately; scrollspy remains pinned to this
    // destination while the page travels past intervening chapters.
    update();
    const start = scrollY;
    const finish = () => {
      if (navigation !== trip) return;
      scrollTo({top: destination(target), behavior: 'instant'});
      navigation = null;
      page?.classList.remove('is-model-navigating');
      if (focus) focusTarget(target);
      schedule();
    };
    const distance = Math.abs(destination(target) - start);
    if (!animate || motionPreference.matches || distance < 2) {
      finish();
      return;
    }
    page?.classList.add('is-model-navigating');
    const duration = Math.min(1400, Math.max(650, 500 + Math.sqrt(distance) * 7));
    let started;
    const step = time => {
      if (navigation !== trip) return;
      if (started === undefined) started = time;
      const progress = Math.min(1, (time - started) / duration);
      const eased = 1 - (1 - progress) ** 4;
      // Recalculate the endpoint as lazy media or the mobile directory settles.
      scrollTo({top: start + (destination(target) - start) * eased, behavior: 'instant'});
      if (progress < 1) trip.frame = requestAnimationFrame(step);
      else finish();
    };
    trip.frame = requestAnimationFrame(step);
  }
  for (const link of [...links, ...chapterLinks, ...document.querySelectorAll('.module-card[href^="#module"]')]) {
    link.addEventListener('click', event => {
      if (event.defaultPrevented || event.button > 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (link.tagName === 'A' && (link.target && link.target !== '_self' || link.hasAttribute('download'))) return;
      const target = link.dataset.module ? document.getElementById(link.dataset.module) : targetFromHash(link.hash);
      if (!target) return;
      event.preventDefault();
      navigate(target, {record: true, focus: event.detail === 0});
    });
  }
  for (const type of ['wheel', 'touchstart', 'pointerdown']) addEventListener(type, cancelNavigation, {passive: true});
  addEventListener('keydown', event => {
    if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ', 'Tab', 'Escape'].includes(event.key)) cancelNavigation();
  });
  const previousRestoration = history.scrollRestoration;
  history.scrollRestoration = 'manual';
  addEventListener('pagehide', () => { history.scrollRestoration = previousRestoration; });
  addEventListener('pageshow', () => { history.scrollRestoration = 'manual'; schedule(); });
  function followHistory() {
    const target = targetFromHash(location.hash);
    if (location.hash && !target) return;
    if (navigation?.target === target) return;
    navigate(target);
  }
  addEventListener('popstate', followHistory);
  addEventListener('hashchange', followHistory);
  // Reveal the generated artwork once without moving the interactive contents.
  backToTop?.addEventListener('click', () => {
    const overview = document.getElementById('model-overview');
    if (overview) {
      overview.tabIndex = -1;
      overview.focus({preventScroll: true});
    }
    history.replaceState(history.state, '', location.pathname + location.search);
    navigate(null);
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
      for (const [panel, animation] of panelAnimations) {
        animation.cancel();
        panel.classList.remove('is-animating');
        panel.hidden = panel.getAttribute('aria-hidden') === 'true';
      }
      panelAnimations.clear();
      if (navigation) navigate(navigation.target, {animate: false});
      schedule();
    }
  });
  function updateIndicator(panel) {
    const indicator = indicators.get(panel);
    const active = panel.querySelector('[data-chapter-link][aria-current], [data-subchapter-link][aria-current]');
    if (!indicator) return;
    indicator.classList.toggle('is-visible', !!active && !panel.inert);
    if (!active || panel.hidden) return;
    indicator.style.width = `${active.offsetWidth}px`;
    indicator.style.height = `${active.offsetHeight}px`;
    indicator.style.transform = `translate(${active.offsetLeft}px, ${active.offsetTop}px)`;
  }
  function keepCurrentVisible(link) {
    if (!link || !compactNavigation.matches) return;
    const container = link.closest('.module-subnav');
    if (!container) return;
    const bounds = container.getBoundingClientRect();
    const item = link.getBoundingClientRect();
    // Only the mobile chapter row scrolls independently of the document.
    let left = container.scrollLeft;
    if (item.left < bounds.left + 8) left += item.left - bounds.left - 8;
    else if (item.right > bounds.right - 8) left += item.right - bounds.right + 8;
    container.scrollTo({left, behavior: motionPreference.matches ? 'auto' : 'smooth'});
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
    let current = navigation?.module || null;
    if (!navigation) for (const section of modules) if (section.getBoundingClientRect().top <= offset) current = section.id;
    const activeModule = links.find(link => link.dataset.module === current) || null;
    const moduleChanged = expandedModule !== activeModule;
    expand(activeModule);
    for (const link of links) {
      if (link.dataset.module === current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
    let chapter = navigation?.chapter || null;
    if (!navigation) for (const position of chapterPositions) {
      // Hidden viewer headings have top=0 and must not select a later chapter.
      if (!position.heading.getClientRects().length) continue;
      if (position.module === current && position.heading.getBoundingClientRect().top <= offset) chapter = position.chapter;
    }
    const activeChapterLink = chapterLinks.find(link => link.hash === `#${chapter}`) || null;
    const parentChapter = activeChapterLink?.dataset.parentChapter || null;
    for (const link of chapterLinks) {
      if (link === activeChapterLink) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
      link.toggleAttribute('data-active-parent', !!parentChapter && link.hasAttribute('data-chapter-link') && link.hash === `#${parentChapter}`);
    }
    for (const panel of indicators.keys()) updateIndicator(panel);
    if (moduleChanged || currentChapter !== chapter || directoryNeedsReveal) {
      keepCurrentVisible(activeChapterLink || activeModule);
      currentChapter = chapter;
    }
    directoryNeedsReveal = false;
    queued = false;
  }
  function schedule() { if (!queued) { queued = true; requestAnimationFrame(update); } }
  addEventListener('scroll', schedule, {passive: true});
  addEventListener('resize', () => { directoryNeedsReveal = true; schedule(); });
  addEventListener('load', schedule);
  const layoutObserver = new ResizeObserver(schedule);
  document.querySelectorAll('.model-overview, .model-reading, .model-sidebar').forEach(element => layoutObserver.observe(element));
  // Apply the same header/directory offset to direct links as to clicked links.
  const initialTarget = targetFromHash(location.hash);
  if (initialTarget) requestAnimationFrame(() => navigate(initialTarget, {animate: false}));
  schedule();
})();
