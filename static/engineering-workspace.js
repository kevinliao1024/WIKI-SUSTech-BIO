(() => {
  const workspace = document.querySelector('[data-engineering-workspace]');
  if (!workspace) return;
  const reader = workspace.querySelector('[data-engineering-scroll]');
  const wheel = workspace.querySelector('[data-dbtl-wheel]');
  const stageLinks = [...wheel.querySelectorAll('[data-dbtl-stage]')];
  const cycleNav = workspace.querySelector('[data-engineering-cycles]');
  const cycleLinks = [...cycleNav.querySelectorAll('[data-engineering-cycle]')];
  const map = workspace.querySelector('[data-engineering-map]');
  const controls = workspace.querySelector('.engineering-controls');
  const paper = workspace.querySelector('.engineering-paper');
  const back = workspace.querySelector('[data-engineering-map-back]');
  const groups = JSON.parse(workspace.querySelector('[data-engineering-map-data]').textContent);
  const article = reader.querySelector('.markdown-content');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const stages = stageLinks.map(link => link.dataset.dbtlStage);
  const cyclePattern = /^(.+)-cycle-(\d{2})(?:-(design|build|test|learn))?$/;
  const parts = new Map(groups.flatMap(group => group.parts.map(part => [part.id, part.label])));
  const partOrder = [...parts.keys()];
  const portraits = new Map([...wheel.querySelectorAll('[data-dbtl-portrait]')]
    .map(image => [image.dataset.dbtlCycle, image]));
  let angle = 0;
  let selectedStage;
  let selectedPortrait;
  let activePanel;
  let pending;
  let anchoredTarget;
  let queued = false;
  let mapPart;

  function partAlias(id) {
    return ({ edit: 'pod', control: 'gfa', program: 'model-rna-seq', model: 'model-rna-seq' })[id] || id;
  }

  // Keep the authored Markdown intact, but give each part its own reading
  // panel. Both cycles stay together, as on the 2025 Engineering reference.
  const panels = new Map();
  function panelFor(id) {
    if (!panels.has(id)) {
      const panel = document.createElement('section');
      panel.className = 'engineering-part-panel';
      panel.dataset.engineeringPanel = id;
      panel.setAttribute('aria-labelledby', id);
      panels.set(id, panel);
    }
    return panels.get(id);
  }
  let contentPanel = panelFor('pod');
  for (const node of [...article.childNodes]) {
    if (node.nodeType === Node.ELEMENT_NODE && /^H[2-6]$/.test(node.tagName)) {
      const part = partAlias(node.id);
      if (parts.has(part)) contentPanel = panelFor(part);
      else if (node.tagName === 'H2') contentPanel = panelFor(node.id);
    }
    contentPanel.append(node);
  }
  article.append(...panels.values());

  function showReader() {
    workspace.dataset.engineeringView = 'reader';
    map.hidden = true;
    controls.hidden = false;
    paper.hidden = false;
    back.hidden = false;
  }

  function showMap({ historyEntry = false, focus = false } = {}) {
    workspace.dataset.engineeringView = 'map';
    map.hidden = false;
    controls.hidden = true;
    paper.hidden = true;
    back.hidden = true;
    pending = null;
    anchoredTarget = null;
    if (historyEntry && location.hash !== '#map') history.pushState(history.state, '', '#map');
    document.dispatchEvent(new CustomEvent('engineering:map-select', { detail: { part: mapPart, focus } }));
    if (focus && !mapPart) map.querySelector('[data-engineering-group="edit"]').focus();
    pauseAnimation();
  }

  function showPanel(panel) {
    if (!panel || panel === activePanel) return false;
    panels.forEach(item => { item.hidden = item !== panel; });
    activePanel = panel;
    workspace.dataset.engineeringActivePanel = panel.dataset.engineeringPanel;
    reader.setAttribute('aria-label', `${parts.get(panel.dataset.engineeringPanel) || 'Engineering'} article, scroll to read`);
    reader.scrollTo({ top: 0, behavior: 'instant' });
    return true;
  }

  function hashTarget(hash) {
    try {
      let id = decodeURIComponent(hash.slice(1));
      // Previous shared-cycle links continue to open the corresponding POD record.
      if (/^cycle-\d{2}(?:-(design|build|test|learn))?$/.test(id)) id = `pod-${id}`;
      if (/^(program|model)(?:-cycle-\d{2}(?:-(design|build|test|learn))?)?$/.test(id)) {
        id = id.replace(/^(program|model)/, 'model-rna-seq');
      }
      const target = document.getElementById(id);
      return target && reader.contains(target) ? target : null;
    } catch { return null; }
  }

  function destination(target) {
    return Math.max(0, Math.min(reader.scrollHeight - reader.clientHeight,
      reader.scrollTop + target.getBoundingClientRect().top - reader.getBoundingClientRect().top - 24));
  }

  function contextFor(id) {
    const cycle = id.match(cyclePattern);
    if (cycle && parts.has(cycle[1])) return { part: cycle[1], number: cycle[2], stage: cycle[3] || 'design' };
    const part = partAlias(id);
    return parts.has(part) ? { part, number: '01', stage: 'design' } : null;
  }

  function selectStage({ part, number, stage }) {
    const index = stages.indexOf(stage);
    if (index < 0) return;
    const cycle = `${part}-cycle-${number}`;
    wheel.dataset.part = part;
    wheel.dataset.cycle = cycle;
    wheel.dataset.stage = stage;
    const portrait = portraits.get(cycle);
    if (portrait && selectedPortrait !== portrait) {
      portraits.forEach(image => image.classList.toggle('is-hidden', image !== portrait));
      wheel.dataset.portrait = portrait.dataset.dbtlPortrait;
      selectedPortrait = portrait;
    }
    cycleNav.setAttribute('aria-label', `${parts.get(part)} cycles`);
    cycleLinks.forEach(link => {
      link.href = `#${part}-cycle-${link.dataset.engineeringCycle}`;
      link.setAttribute('aria-label', `${parts.get(part)}, Cycle ${link.dataset.engineeringCycle}`);
      if (link.dataset.engineeringCycle === number) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    stageLinks.forEach(link => {
      const id = `${cycle}-${link.dataset.dbtlStage}`;
      link.href = `#${id}`;
      link.setAttribute('aria-label', `${link.querySelector('span').textContent}, ${parts.get(part)}, Cycle ${number}`);
      if (link.dataset.dbtlStage === stage) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    if (selectedStage !== stage) {
      const delta = ((index * 90 - angle) % 360 + 540) % 360 - 180;
      angle += delta === -180 ? 180 : delta;
      wheel.style.setProperty('--dbtl-angle', `${angle}deg`);
      selectedStage = stage;
    }
  }

  function selectModule(target) {
    const context = target && contextFor(target.id);
    if (!context || mapPart === context.part) return;
    mapPart = context.part;
    workspace.dataset.engineeringActivePart = mapPart;
    document.dispatchEvent(new CustomEvent('engineering:map-select', { detail: { part: mapPart } }));
  }

  function focusTarget(target) {
    const temporary = !target.hasAttribute('tabindex');
    if (temporary) target.tabIndex = -1;
    target.focus({ preventScroll: true });
    if (temporary) target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
  }

  function go(target, { historyEntry = true, focus = true, instant = false } = {}) {
    const wasMap = workspace.dataset.engineeringView === 'map';
    showReader();
    const changedPanel = showPanel(target.closest('[data-engineering-panel]'));
    const context = contextFor(target.id);
    if (context) selectStage(context);
    selectModule(context && cyclePattern.test(target.id) ? document.getElementById(context.part) : target);
    pending = { target, expires: performance.now() + 2500 };
    anchoredTarget = target;
    if (historyEntry && location.hash !== `#${target.id}`) history.pushState(history.state, '', `#${target.id}`);
    if (focus) focusTarget(target);
    reader.scrollTo({ top: destination(target), behavior: instant || changedPanel || wasMap || motion.matches ? 'instant' : 'smooth' });
    pauseAnimation();
    schedule();
  }

  function update() {
    queued = false;
    if (workspace.dataset.engineeringView !== 'reader' || !activePanel) return;
    if (pending) {
      if (Math.abs(reader.scrollTop - destination(pending.target)) < 3 || performance.now() > pending.expires) pending = null;
      else return;
    }
    // The final title may be clamped by the end of a short panel. Keep the
    // explicitly selected cycle/phase until the reader actually moves away.
    if (anchoredTarget && Math.abs(reader.scrollTop - destination(anchoredTarget)) < 3) return;
    anchoredTarget = null;
    const threshold = reader.getBoundingClientRect().top + 64;
    let activeModule = document.getElementById(activePanel.dataset.engineeringPanel);
    let activeCycle = contextFor(activePanel.dataset.engineeringPanel);
    const headings = activePanel.querySelectorAll(':is(h2,h3,h4,h5,h6)[id]');
    for (const heading of headings) {
      if (heading.getBoundingClientRect().top > threshold) break;
      if (heading.tagName === 'H2') activeModule = parts.has(partAlias(heading.id)) ? heading : null;
      else if (parts.has(heading.id)) activeModule = heading;
      const context = contextFor(heading.id);
      if (context) activeCycle = context;
    }
    if (reader.scrollTop > 0 && atEdge(1)) {
      const lastCycle = [...headings].reverse().map(heading => contextFor(heading.id)).find(Boolean);
      if (lastCycle) activeCycle = lastCycle;
    }
    selectModule(activeModule);
    if (activeCycle) selectStage(activeCycle);
  }

  function schedule() {
    if (!queued) { queued = true; requestAnimationFrame(update); }
  }

  workspace.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = hashTarget(link.hash);
    if (!target) return;
    event.preventDefault();
    // A cycle or part change is a direct jump. Only the four nearby DBTL
    // stages use smooth scrolling within their current record.
    go(target, { instant: link.hasAttribute('data-engineering-cycle') || link.hasAttribute('data-map-cycle') });
  });

  function syncHash() {
    const target = hashTarget(location.hash);
    if (target) go(target, { historyEntry: false, focus: false, instant: true });
    else showMap();
  }

  function resize() {
    const siteNav = document.querySelector('.site-nav');
    if (siteNav) workspace.style.setProperty('--engineering-nav-height', `${Math.ceil(siteNav.getBoundingClientRect().bottom)}px`);
    schedule();
  }

  function pauseAnimation() { wheel.toggleAttribute('data-paused', document.hidden || workspace.dataset.engineeringView !== 'reader'); }
  function cancelPending() { pending = null; anchoredTarget = null; }
  function atEdge(direction) {
    return direction > 0
      ? reader.scrollTop >= reader.scrollHeight - reader.clientHeight - 2
      : reader.scrollTop <= 2;
  }

  function turnPart(direction) {
    const index = partOrder.indexOf(activePanel.dataset.engineeringPanel);
    const part = partOrder[index + direction];
    if (index < 0 || !part) return false;
    const target = document.getElementById(direction > 0 ? part : `${part}-cycle-02-learn`);
    go(target, { historyEntry: false, instant: true });
    if (direction < 0) {
      reader.scrollTo({ top: reader.scrollHeight - reader.clientHeight, behavior: 'instant' });
      pending = null;
      anchoredTarget = null;
      schedule();
    }
    // Natural reading updates the shareable location without adding a history
    // entry for every part crossed. Explicit navigation still uses pushState.
    history.replaceState(history.state, '', `#${target.id}`);
    return true;
  }

  let lastWheelAt = -Infinity;
  let wheelTurned = false;
  reader.addEventListener('wheel', event => {
    if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY) || !event.deltaY) return;
    const now = performance.now();
    const newGesture = now - lastWheelAt > 180;
    lastWheelAt = now;
    if (newGesture) wheelTurned = false;
    // Consume the tail of the gesture that changed part, so trackpad inertia
    // cannot skip the beginning of the new article or jump several parts.
    if (wheelTurned) { event.preventDefault(); return; }
    cancelPending();
    const direction = Math.sign(event.deltaY);
    if (newGesture && atEdge(direction) && turnPart(direction)) {
      wheelTurned = true;
      event.preventDefault();
    }
  }, { passive: false });

  let swipe;
  reader.addEventListener('touchstart', event => {
    cancelPending();
    if (event.touches.length !== 1) { swipe = null; return; }
    const touch = event.touches[0];
    swipe = { x: touch.clientX, y: touch.clientY, top: atEdge(-1), bottom: atEdge(1) };
  }, { passive: true });
  reader.addEventListener('touchend', event => {
    if (!swipe || !event.changedTouches.length) return;
    const touch = event.changedTouches[0];
    const dy = swipe.y - touch.clientY;
    const dx = swipe.x - touch.clientX;
    const direction = Math.sign(dy);
    if (Math.abs(dy) > 60 && Math.abs(dy) > Math.abs(dx) &&
        (direction > 0 ? swipe.bottom : swipe.top) && atEdge(direction)) turnPart(direction);
    swipe = null;
  }, { passive: true });
  reader.addEventListener('touchcancel', () => { swipe = null; }, { passive: true });
  reader.addEventListener('scroll', schedule, { passive: true });
  reader.addEventListener('keydown', event => {
    if (event.target.closest('input, textarea, select, button, [contenteditable="true"]') || event.altKey || event.ctrlKey || event.metaKey) return;
    if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', 'Escape', ' '].includes(event.key)) cancelPending();
    const direction = ['ArrowDown', 'PageDown'].includes(event.key) ? 1
      : ['ArrowUp', 'PageUp'].includes(event.key) ? -1
      : event.key === ' ' ? (event.shiftKey ? -1 : 1) : 0;
    if (direction && !event.repeat && atEdge(direction) && turnPart(direction)) event.preventDefault();
  });
  back.addEventListener('click', () => showMap({ historyEntry: true, focus: true }));
  addEventListener('hashchange', syncHash);
  addEventListener('popstate', syncHash);
  addEventListener('resize', resize);
  addEventListener('load', () => { resize(); syncHash(); });
  document.addEventListener('visibilitychange', pauseAnimation);
  motion.addEventListener('change', () => {
    if (motion.matches && pending) reader.scrollTo({ top: destination(pending.target), behavior: 'instant' });
    schedule();
  });
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(resize);
    const siteNav = document.querySelector('.site-nav');
    if (siteNav) observer.observe(siteNav);
    observer.observe(reader);
  }
  resize();
  pauseAnimation();
  syncHash();
  schedule();
})();
