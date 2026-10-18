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


/* Enhanced grouped directory and DBTL pages. */
(() => {
  const page = document.querySelector('.content-page');
  if (!page) return;
  const article = page.querySelector('.markdown-content');
  // A local wrapper keeps wide data tables scrollable without widening the page.
  article.querySelectorAll('table').forEach(table => {
    if (table.closest('.content-table, .table-shell')) return;
    const wrapper = document.createElement('div');
    wrapper.className = 'content-table';
    wrapper.tabIndex = 0;
    wrapper.setAttribute('role', 'region');
    wrapper.setAttribute('aria-label', 'Scrollable data table');
    table.before(wrapper);
    wrapper.append(table);
  });

  const directories = [...page.querySelectorAll('[data-content-directory]')];
  if (!directories.length) return;
  const headings = [...article.querySelectorAll('h2[id], h3[id]')];
  const mobile = page.querySelector('.content-mobile-directory');
  const groups = [...page.querySelectorAll('[data-content-group]')];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const panels = new Map();
  const indicators = new Map();
  const targetFor = hash => {
    try { return document.getElementById(decodeURIComponent(hash.slice(1))); }
    catch { return null; }
  };
  const links = [...page.querySelectorAll('[data-content-directory] a')];
  const targets = new Map(links.map(link => [link, targetFor(link.hash)]));
  let currentGroup;
  let currentHeading;
  let navigation = null;
  let scheduled = false;

  function expand(group, open, animate = true) {
    const panel = group.querySelector('.content-subnav');
    const toggle = group.querySelector('.content-group__toggle');
    if (!panel || !toggle) return;
    if (toggle.getAttribute('aria-expanded') === String(open) && panel.hidden === !open) return;
    const height = panel.hidden ? 0 : panel.getBoundingClientRect().height;
    const before = getComputedStyle(panel);
    const opacity = panel.hidden ? 0 : Number(before.opacity);
    const marginTop = panel.hidden ? 0 : parseFloat(before.marginTop) || 0;
    const marginBottom = panel.hidden ? 0 : parseFloat(before.marginBottom) || 0;
    panels.get(panel)?.cancel();
    panels.delete(panel);
    panel.classList.remove('is-animating');
    panel.inert = !open;
    panel.setAttribute('aria-hidden', String(!open));
    toggle.setAttribute('aria-expanded', String(open));
    if (!animate || motion.matches || !panel.animate || !group.getClientRects().length) {
      panel.hidden = !open;
      return;
    }
    panel.hidden = false;
    const after = getComputedStyle(panel);
    const animation = panel.animate([
      {height: `${height}px`, opacity, marginTop: `${marginTop}px`, marginBottom: `${marginBottom}px`, transform: 'translateY(-5px)'},
      {height: `${open ? panel.getBoundingClientRect().height : 0}px`, opacity: open ? 1 : 0,
        marginTop: open ? after.marginTop : '0px', marginBottom: open ? after.marginBottom : '0px',
        transform: `translateY(${open ? 0 : -5}px)`},
    ], {duration: open ? 340 : 260, easing: 'cubic-bezier(.22,1,.36,1)'});
    panel.classList.add('is-animating');
    panels.set(panel, animation);
    animation.finished.then(() => {
      if (panels.get(panel) !== animation) return;
      panels.delete(panel);
      panel.classList.remove('is-animating');
      panel.hidden = !open;
      schedule();
      if (open) keepCurrentVisible();
    }).catch(() => {});
  }

  function updateIndicators() {
    for (const [panel, indicator] of indicators) {
      const active = panel.querySelector('a[aria-current]');
      indicator.classList.toggle('is-visible', !!active && !panel.inert);
      if (!active || !panel.getClientRects().length) continue;
      indicator.style.width = `${active.offsetWidth}px`;
      indicator.style.height = `${active.offsetHeight}px`;
      indicator.style.transform = `translate(${active.offsetLeft}px, ${active.offsetTop}px)`;
    }
  }

  function keepCurrentVisible() {
    for (const directory of directories) {
      if (!directory.getClientRects().length) continue;
      const active = directory.querySelector('.content-subnav a[aria-current]') || directory.querySelector('a[aria-current]');
      if (!active || !active.getClientRects().length) continue;
      const bounds = directory.getBoundingClientRect();
      const item = active.getBoundingClientRect();
      let top = directory.scrollTop;
      if (item.top < bounds.top + 8) top += item.top - bounds.top - 8;
      else if (item.bottom > bounds.bottom - 8) top += item.bottom - bounds.bottom + 8;
      if (Math.abs(top - directory.scrollTop) > 1) directory.scrollTo({top, behavior: motion.matches ? 'instant' : 'smooth'});
    }
  }

  groups.forEach(group => {
    const toggle = group.querySelector('.content-group__toggle');
    const panel = group.querySelector('.content-subnav');
    if (!toggle || !panel) return;
    const indicator = document.createElement('li');
    indicator.className = 'content-subnav-indicator';
    indicator.setAttribute('aria-hidden', 'true');
    panel.prepend(indicator);
    indicators.set(panel, indicator);
    toggle.hidden = false;
    expand(group, false, false);
    toggle.addEventListener('click', () => {
      expand(group, toggle.getAttribute('aria-expanded') !== 'true');
      updateIndicators();
    });
  });

  function offset(target) {
    return (parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0)
      + (parseFloat(getComputedStyle(target).scrollMarginTop) || 0);
  }
  function destination(target) {
    return Math.max(0, Math.min(document.documentElement.scrollHeight - innerHeight,
      scrollY + target.getBoundingClientRect().top - offset(target)));
  }
  function cancel() {
    if (!navigation) return;
    cancelAnimationFrame(navigation.frame);
    navigation = null;
    page.classList.remove('is-content-navigating');
    schedule();
  }
  function navigate(target, {focus = false, animate = true} = {}) {
    cancel();
    const trip = {target, frame: 0};
    navigation = trip;
    update();
    const start = scrollY;
    const finish = () => {
      if (navigation !== trip) return;
      scrollTo({top: destination(target), behavior: 'instant'});
      navigation = null;
      page.classList.remove('is-content-navigating');
      if (focus) {
        const temporary = !target.hasAttribute('tabindex');
        if (temporary) target.tabIndex = -1;
        target.focus({preventScroll: true});
        if (temporary) target.addEventListener('blur', () => target.removeAttribute('tabindex'), {once: true});
      }
      schedule();
    };
    const distance = Math.abs(destination(target) - start);
    if (!animate || motion.matches || distance < 2) { finish(); return; }
    page.classList.add('is-content-navigating');
    const duration = Math.min(1400, Math.max(650, 500 + Math.sqrt(distance) * 7));
    let started;
    const step = time => {
      if (navigation !== trip) return;
      if (started === undefined) started = time;
      const progress = Math.min(1, (time - started) / duration);
      const eased = 1 - (1 - progress) ** 4;
      // Re-measure as lazy images or a closing mobile directory settle.
      scrollTo({top: start + (destination(target) - start) * eased, behavior: 'instant'});
      if (progress < 1) trip.frame = requestAnimationFrame(step);
      else finish();
    };
    trip.frame = requestAnimationFrame(step);
  }

  links.forEach(link => {
    const target = targets.get(link);
    if (target && !link.hasAttribute('data-content-custom-label')) link.textContent = target.textContent;
    link.addEventListener('click', event => {
      if (event.defaultPrevented || event.button > 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || !target) return;
      event.preventDefault();
      if (mobile?.contains(link)) mobile.open = false;
      if (location.hash !== link.hash) history.pushState(history.state, '', location.pathname + location.search + link.hash);
      navigate(target, {focus: event.detail === 0});
    });
  });

  function update() {
    scheduled = false;
    const nav = document.querySelector('.site-nav');
    const top = (nav?.getBoundingClientRect().bottom || 100) +
      (innerWidth <= 760 && mobile ? mobile.querySelector('summary').offsetHeight : 0) + 48;
    // Opening the mobile menu moves the article; that is not a chapter change.
    const browsingDirectory = innerWidth <= 760 && mobile?.open;
    let active = navigation?.target || (browsingDirectory && currentHeading) || headings[0];
    if (!navigation && !browsingDirectory) for (const heading of headings) {
      if (!heading.getClientRects().length) continue;
      if (heading.getBoundingClientRect().top <= top) active = heading;
      else break;
    }
    if (!active) return;
    const activeLink = links.find(link => targets.get(link) === active);
    const groupId = activeLink?.closest('[data-content-group]')?.dataset.contentGroup;
    if (groupId !== currentGroup) {
      groups.forEach(group => {
        // Preserve a reader's keyboard focus during passive scrolling.
        if (group.contains(document.activeElement) && group.dataset.contentGroup !== groupId) {
          if (!navigation) return;
          group.querySelector('.content-group__toggle')?.focus({preventScroll: true});
        }
        expand(group, group.dataset.contentGroup === groupId);
      });
      currentGroup = groupId;
    }
    links.forEach(link => {
      const target = targets.get(link);
      const isActive = target === active || (link.hasAttribute('data-content-major') && target?.id === groupId);
      if (isActive && !link.hasAttribute('aria-current')) link.setAttribute('aria-current', 'location');
      else if (!isActive && link.hasAttribute('aria-current')) link.removeAttribute('aria-current');
    });
    updateIndicators();
    if (currentHeading !== active && !panels.size) keepCurrentVisible();
    currentHeading = active;
  }
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(update);
  }
  for (const type of ['wheel', 'touchstart', 'pointerdown']) addEventListener(type, cancel, {passive: true});
  addEventListener('keydown', event => {
    if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ', 'Tab', 'Escape'].includes(event.key)) cancel();
  });
  const followHistory = () => {
    const target = targetFor(location.hash);
    if (navigation?.target === target) return;
    cancel();
    if (target && article.contains(target)) navigate(target);
    else schedule();
  };
  addEventListener('popstate', followHistory);
  addEventListener('hashchange', followHistory);
  addEventListener('scroll', schedule, {passive: true});
  addEventListener('resize', schedule);
  addEventListener('load', schedule);
  addEventListener('pageshow', schedule);
  mobile?.addEventListener('toggle', () => { schedule(); if (mobile.open) keepCurrentVisible(); });
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(schedule);
    observer.observe(article);
    directories.forEach(directory => observer.observe(directory));
  }
  motion.addEventListener('change', () => {
    if (motion.matches) {
      for (const [panel, animation] of panels) {
        animation.cancel();
        panel.classList.remove('is-animating');
        panel.hidden = panel.getAttribute('aria-hidden') === 'true';
      }
      panels.clear();
      if (navigation) navigate(navigation.target, {animate: false});
    }
    schedule();
  });
  update();
})();
