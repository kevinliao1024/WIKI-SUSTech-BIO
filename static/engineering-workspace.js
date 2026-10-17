(() => {
  const workspace = document.querySelector('[data-engineering-workspace]');
  if (!workspace) return;
  const reader = workspace.querySelector('[data-engineering-scroll]');
  const wheel = workspace.querySelector('[data-dbtl-wheel]');
  const stageLinks = [...wheel.querySelectorAll('[data-dbtl-stage]')];
  const cycleNav = workspace.querySelector('[data-engineering-cycles]');
  let cycleLinks = [];
  const map = workspace.querySelector('[data-engineering-map]');
  const controls = workspace.querySelector('.engineering-controls');
  const headingGroup = workspace.querySelector('[data-engineering-heading-group]');
  const headingPart = workspace.querySelector('[data-engineering-heading-part]');
  const headingRows = [...workspace.querySelectorAll('[data-engineering-heading-row]')];
  const paper = workspace.querySelector('.engineering-paper');
  const back = workspace.querySelector('[data-engineering-map-back]');
  const { groups } = window.ORCAEngineering;
  const article = reader.querySelector('.markdown-content');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const stages = stageLinks.map(link => link.dataset.dbtlStage);
  const cyclePattern = /^(.+)-cycle-(\d{2})(?:-(design|build|test|learn))?$/;
  const parts = new Map(groups.flatMap(group => group.parts.map(part => [part.id, part.label])));
  const partRecords = new Map(groups.flatMap(group => group.parts.map(part => [part.id, part])));
  const partOrder = [...parts.keys()];
  const groupForPart = new Map(groups.flatMap(group => group.parts.map(part => [part.id, group])));
  const cyclesForPart = new Map(groups.flatMap(group => group.parts.map(part => [part.id, part.cycles])));
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
  let turning;
  let paperEntrance;
  const pickerIdle = 140;

  function partAlias(id) {
    return ({ edit: 'pod', control: 'gfa', program: 'model-rna-seq', model: 'model-rna-seq' })[id] || id;
  }

  // Keep the authored Markdown intact, but give each part its own reading
  // panel. Every authored cycle stays together in its module's article.
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
    cancelTurn();
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
      if (target && reader.contains(target)) return target;
      // Earlier placeholder cycles may no longer exist in the supplied record.
      // Their links still open the module, without inventing an extra cycle.
      const legacyCycle = id.match(cyclePattern);
      return legacyCycle && parts.has(legacyCycle[1]) ? document.getElementById(legacyCycle[1]) : null;
    } catch { return null; }
  }

  function readingTarget(target) {
    const firstModelCycle = target.id.match(/^(model-.+)-cycle-01$/);
    return firstModelCycle ? document.getElementById(`${firstModelCycle[1]}-overview`) || target : target;
  }

  function destination(target) {
    target = readingTarget(target);
    return Math.max(0, Math.min(reader.scrollHeight - reader.clientHeight,
      reader.scrollTop + target.getBoundingClientRect().top - reader.getBoundingClientRect().top - 24));
  }

  function contextFor(id) {
    const cycle = id.match(cyclePattern);
    if (cycle && parts.has(cycle[1])) {
      const available = partRecords.get(cycle[1]).stages[cycle[2]];
      if (available) return { part: cycle[1], number: cycle[2], stage: cycle[3] || available[0] };
    }
    const part = partAlias(id);
    if (!parts.has(part)) return null;
    const record = partRecords.get(part);
    const number = record.cycles[0] || null;
    return { part, number, stage: record.stages[number]?.[0] || null, overview: true };
  }

  function contextForTarget(target) {
    const explicit = contextFor(target.id);
    if (explicit) return explicit;
    const panel = target.closest('[data-engineering-panel]');
    if (!panel) return null;
    let context = contextFor(panel.dataset.engineeringPanel);
    for (const heading of panel.querySelectorAll(':is(h2,h3,h4,h5,h6)[id]')) {
      if (heading === target || !(heading.compareDocumentPosition(target) & Node.DOCUMENT_POSITION_FOLLOWING)) break;
      context = contextFor(heading.id) || context;
    }
    return context;
  }

  function selectStage({ part, number, stage, overview = false }) {
    const record = partRecords.get(part);
    const index = stages.indexOf(stage);
    const cycle = number ? `${part}-cycle-${number}` : '';
    wheel.dataset.part = part;
    wheel.dataset.cycle = cycle;
    wheel.dataset.stage = stage || '';
    wheel.closest('.dbtl-directory').hidden = !number;
    const portrait = portraits.get(cycle) || portraits.get(`${part}-cycle-01`) || portraits.values().next().value;
    if (portrait && selectedPortrait !== portrait) {
      portraits.forEach(image => image.classList.toggle('is-hidden', image !== portrait));
      wheel.dataset.portrait = portrait.dataset.dbtlPortrait;
      selectedPortrait = portrait;
    }
    cycleNav.setAttribute('aria-label', `${parts.get(part)} overview and engineering records`);
    if (cycleNav.dataset.part !== part) {
      const overviewLink = document.createElement('a');
      overviewLink.dataset.engineeringOverview = '';
      overviewLink.href = `#${part}`;
      overviewLink.textContent = record.cycles.length ? 'Overview' : 'Proposed design';
      cycleLinks = cyclesForPart.get(part).map(number => {
        const link = document.createElement('a');
        link.dataset.engineeringCycle = number;
        const label = document.createElement('span');
        label.textContent = record.cycleLabels[number];
        link.append(label);
        return link;
      });
      cycleNav.replaceChildren(overviewLink, ...cycleLinks);
      cycleNav.dataset.part = part;
      cycleNav.dataset.cycleCount = String(cycleLinks.length);
      cycleNav.dataset.manyCycles = String(cycleLinks.length > 6);
      cycleNav.style.setProperty('--cycle-count', cycleLinks.length > 6 ? 5 : Math.max(1, cycleLinks.length));
    }
    const overviewLink = cycleNav.querySelector('[data-engineering-overview]');
    if (overview) overviewLink.setAttribute('aria-current', 'location');
    else overviewLink.removeAttribute('aria-current');
    cycleLinks.forEach(link => {
      link.href = `#${part}-cycle-${link.dataset.engineeringCycle}`;
      link.setAttribute('aria-label', `${parts.get(part)}, ${record.cycleLabels[link.dataset.engineeringCycle]}`);
      if (!overview && link.dataset.engineeringCycle === number) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    stageLinks.forEach(link => {
      const id = `${cycle}-${link.dataset.dbtlStage}`;
      const available = Boolean(number && document.getElementById(id));
      if (available) {
        link.href = `#${id}`;
        link.removeAttribute('aria-disabled');
        link.removeAttribute('tabindex');
      } else {
        link.removeAttribute('href');
        link.setAttribute('aria-disabled', 'true');
        link.tabIndex = -1;
      }
      link.setAttribute('aria-label', `${link.querySelector('span').textContent}, ${parts.get(part)}${number ? `, ${record.cycleLabels[number]}` : ''}${available ? '' : ', not included in this record'}`);
      if (available && !overview && link.dataset.dbtlStage === stage) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    if (index >= 0 && selectedStage !== stage) {
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
    renderHeading(mapPart);
    document.dispatchEvent(new CustomEvent('engineering:map-select', { detail: { part: mapPart } }));
  }

  function headingLabels(part) {
    const group = groupForPart.get(part);
    return group ? { group: group.label, part: group.label === parts.get(part) ? '' : parts.get(part) } : { group: '', part: '' };
  }

  function renderHeading(part) {
    const index = partOrder.indexOf(part);
    const current = headingLabels(part);
    headingGroup.textContent = current.group;
    headingPart.textContent = current.part;
    // Keep both tracks mounted so one-part groups and long names never move
    // the reader or the DBTL controls as their neighbors change.
    headingPart.hidden = false;
    headingRows.forEach(row => {
      const level = row.dataset.engineeringHeadingRow;
      for (const [side, offset] of [['previous', -1], ['next', 1]]) {
        const neighbor = headingLabels(partOrder[index + offset]);
        row.querySelector(`[data-engineering-preview="${side}"]`).textContent =
          level === 'group' && neighbor.group === current.group ? '' : neighbor[level];
      }
    });
  }

  function cancelTurn() {
    if (turning) {
      const cancelled = turning;
      turning = null;
      clearTimeout(cancelled.timer);
      cancelAnimationFrame(cancelled.frame);
    }
    paperEntrance?.cancel();
    paperEntrance = null;
    workspace.removeAttribute('data-engineering-turning');
    workspace.removeAttribute('data-engineering-turn-progress');
    headingRows.forEach(row => [...row.children].forEach(slot => {
      for (const property of ['transform', 'opacity', 'filter', 'clip-path']) slot.style.removeProperty(property);
    }));
    reader.removeAttribute('aria-busy');
  }

  function renderPicker(turn, progress) {
    const neighbor = partOrder[turn.index + Math.sign(progress)];
    const acrossGroup = groupForPart.get(mapPart) !== groupForPart.get(neighbor);
    turn.progress = progress;
    workspace.dataset.engineeringTurning = turn.phase;
    workspace.dataset.engineeringTurnProgress = progress.toFixed(4);
    headingRows.forEach(row => {
      const offset = row.dataset.engineeringHeadingRow === 'group' && !acrossGroup ? 0 : progress;
      const distance = row.clientWidth * .42;
      const sideClip = matchMedia('(max-width: 760px)').matches ? 32 : 26;
      [...row.children].forEach((slot, index) => {
        const position = index - 1 - offset;
        const amount = Math.min(1, Math.abs(position));
        const clip = sideClip * amount;
        Object.assign(slot.style, {
          transform: `translateX(calc(-50% + ${position * distance}px)) scale(${1 - .26 * amount})`,
          opacity: String(Math.max(0, 1 - Math.abs(position) * .54)),
          filter: `blur(${amount * 1.1}px)`,
          clipPath: position < 0 ? `inset(0 ${clip}% 0 0)` : `inset(0 0 0 ${clip}%)`,
        });
      });
    });
  }

  function beginPicker(mode, direction) {
    if (workspace.dataset.engineeringView !== 'reader' || !activePanel || turning) return null;
    const index = partOrder.indexOf(activePanel.dataset.engineeringPanel);
    if (!partOrder[index + direction]) return null;
    paperEntrance?.cancel();
    cancelPending();
    const turn = { mode, phase: 'dragging', index, progress: 0, scrollTop: reader.scrollTop, timer: null, frame: null };
    turning = turn;
    reader.setAttribute('aria-busy', 'true');
    renderPicker(turn, 0);
    return turn;
  }

  function finishPicker(turn, slot) {
    if (turning !== turn) return;
    if (!slot) {
      // A partial push returns to the current item without a navigation lock.
      cancelTurn();
      schedule();
      return;
    }
    turn.direction = slot;
    const part = partOrder[turn.index + slot];
    turn.target = slot > 0 ? document.getElementById(part)
      : [...panels.get(part).querySelectorAll(':is(h2,h3,h4,h5,h6)[id]')].at(-1) || document.getElementById(part);
    commitTurn(turn);
  }

  function settlePicker(turn, forcedSlot = null, instant = false) {
    if (turning !== turn) return;
    clearTimeout(turn.timer);
    cancelAnimationFrame(turn.frame);
    const slot = forcedSlot ?? (Math.abs(turn.progress) >= .5 ? Math.sign(turn.progress) : 0);
    const from = turn.progress;
    turn.phase = 'settling';
    turn.slot = slot;
    if (motion.matches || instant || document.hidden) {
      finishPicker(turn, slot);
      return;
    }
    const duration = forcedSlot === null ? 180 : 260;
    const started = performance.now();
    const tick = now => {
      if (turning !== turn) return;
      const fraction = Math.min(1, (now - started) / duration);
      const eased = 1 - (1 - fraction) ** 3;
      renderPicker(turn, from + (slot - from) * eased);
      if (fraction < 1) turn.frame = requestAnimationFrame(tick);
      else finishPicker(turn, slot);
    };
    renderPicker(turn, from);
    turn.frame = requestAnimationFrame(tick);
  }

  function movePicker(turn, progress) {
    clearTimeout(turn.timer);
    cancelAnimationFrame(turn.frame);
    turn.phase = 'dragging';
    const low = turn.index > 0 ? -1 : 0;
    const high = turn.index < partOrder.length - 1 ? 1 : 0;
    renderPicker(turn, Math.max(low, Math.min(high, progress)));
    if (turn.mode === 'wheel') turn.timer = setTimeout(() => settlePicker(turn), pickerIdle);
  }

  function pickerTravel() { return Math.max(72, Math.min(130, headingRows[1].clientWidth * .42)); }

  function focusTarget(target) {
    const temporary = !target.hasAttribute('tabindex');
    if (temporary) target.tabIndex = -1;
    target.focus({ preventScroll: true });
    if (temporary) target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
  }

  function go(target, { historyEntry = true, focus = true, instant = false } = {}) {
    if (!target) return;
    cancelTurn();
    const wasMap = workspace.dataset.engineeringView === 'map';
    showReader();
    const changedPanel = showPanel(target.closest('[data-engineering-panel]'));
    const context = contextForTarget(target);
    if (context) selectStage(context);
    selectModule(context ? document.getElementById(context.part) : target);
    pending = { target, expires: performance.now() + 2500 };
    anchoredTarget = target;
    if (historyEntry && location.hash !== `#${target.id}`) history.pushState(history.state, '', `#${target.id}`);
    if (focus) focusTarget(readingTarget(target));
    reader.scrollTo({ top: destination(target), behavior: instant || changedPanel || wasMap || motion.matches ? 'instant' : 'smooth' });
    pauseAnimation();
    schedule();
  }

  function update() {
    queued = false;
    if (workspace.dataset.engineeringView !== 'reader' || !activePanel || turning) return;
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
    go(target, { instant: link.hasAttribute('data-engineering-cycle') || link.hasAttribute('data-map-cycle') || link.hasAttribute('data-engineering-group') || link.hasAttribute('data-engineering-part') });
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

  function commitTurn(turn) {
    if (turning !== turn) return;
    // The article, selection, portrait and shareable location commit together
    // only after the incoming title has reached the center slot.
    const { target, direction } = turn;
    const animatePaper = !motion.matches && !document.hidden;
    cancelTurn();
    go(target, { historyEntry: false, focus: false, instant: true });
    reader.scrollTo({ top: direction > 0 ? 0 : reader.scrollHeight - reader.clientHeight, behavior: 'instant' });
    reader.focus({ preventScroll: true });
    pending = null;
    anchoredTarget = null;
    schedule();
    history.replaceState(history.state, '', `#${target.id}`);
    wheelTurned = true;
    wheelLockedUntil = performance.now() + 220;
    if (animatePaper) paperEntrance = article.animate([
      { opacity: .15, transform: `translateY(${direction * 7}px)` },
      { opacity: 1, transform: 'translateY(0)' },
    ], { duration: 180, easing: 'ease-out' });
  }

  function turnPart(direction) {
    const turn = beginPicker('key', direction);
    if (!turn) return false;
    settlePicker(turn, direction);
    return true;
  }

  let lastWheelAt = -Infinity;
  let wheelTurned = false;
  let wheelLockedUntil = 0;
  reader.addEventListener('wheel', event => {
    if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY) || !event.deltaY) return;
    const now = performance.now();
    const newGesture = now - lastWheelAt > 220;
    lastWheelAt = now;
    if (newGesture && now >= wheelLockedUntil && !turning) wheelTurned = false;
    if (wheelTurned || (turning && turning.mode !== 'wheel')) {
      wheelTurned = true;
      event.preventDefault();
      return;
    }
    const direction = Math.sign(event.deltaY);
    const turn = turning || (atEdge(direction) ? beginPicker('wheel', direction) : null);
    if (!turn) { cancelPending(); return; }
    event.preventDefault();
    const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? reader.clientHeight : 1);
    // One large mouse notch still shows an intermediate choice. Continuous
    // input accumulates, and reversing during a snap resumes its visible state.
    const step = Math.sign(delta) * Math.min(.6, Math.abs(delta) / pickerTravel());
    movePicker(turn, turn.progress + step);
  }, { passive: false });

  let swipe;
  reader.addEventListener('touchstart', event => {
    cancelPending();
    if (event.touches.length !== 1) {
      if (turning?.mode === 'touch') cancelTurn();
      swipe = null;
      return;
    }
    const touch = event.touches[0];
    // Catching a moving picker freezes its visible position until release.
    if (turning?.mode === 'touch') movePicker(turning, turning.progress);
    swipe = { x: touch.clientX, y: touch.clientY, top: atEdge(-1), bottom: atEdge(1), origin: turning?.mode === 'touch' ? turning.progress : 0 };
  }, { passive: true });
  reader.addEventListener('touchmove', event => {
    if (!swipe || event.touches.length !== 1 || !event.cancelable) { swipe = null; return; }
    const touch = event.touches[0];
    const dy = swipe.y - touch.clientY;
    const dx = swipe.x - touch.clientX;
    const direction = Math.sign(dy);
    if (turning && turning.mode !== 'touch') { event.preventDefault(); return; }
    if (turning?.mode === 'touch') {
      event.preventDefault();
      movePicker(turning, swipe.origin + dy / pickerTravel());
      return;
    }
    if (Math.abs(dy) <= Math.abs(dx) || !(direction > 0 ? swipe.bottom : swipe.top)) return;
    if (!atEdge(direction)) {
      if (direction > 0) swipe.bottom = false;
      else swipe.top = false;
      return;
    }
    // Cancel the first outward movement before native momentum is committed.
    event.preventDefault();
    const turn = beginPicker('touch', direction);
    if (turn) movePicker(turn, dy / pickerTravel());
  }, { passive: false });
  reader.addEventListener('touchend', () => {
    if (turning?.mode === 'touch' && turning.phase === 'dragging') settlePicker(turning);
    swipe = null;
  }, { passive: true });
  reader.addEventListener('touchcancel', () => {
    if (turning?.mode === 'touch') cancelTurn();
    swipe = null;
  }, { passive: true });
  reader.addEventListener('scroll', () => {
    if (turning && reader.scrollTop !== turning.scrollTop) reader.scrollTop = turning.scrollTop;
    schedule();
  }, { passive: true });
  let keyTurned = false;
  reader.addEventListener('keyup', () => { keyTurned = false; });
  reader.addEventListener('blur', () => { keyTurned = false; });
  reader.addEventListener('keydown', event => {
    if (event.target.closest('input, textarea, select, button, [contenteditable="true"]') || event.altKey || event.ctrlKey || event.metaKey) return;
    if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', 'Escape', ' '].includes(event.key)) {
      if (turning || (event.repeat && keyTurned)) { keyTurned = true; event.preventDefault(); return; }
      cancelPending();
    }
    const direction = ['ArrowDown', 'PageDown'].includes(event.key) ? 1
      : ['ArrowUp', 'PageUp'].includes(event.key) ? -1
      : event.key === ' ' ? (event.shiftKey ? -1 : 1) : 0;
    if (!direction) return;
    if (!event.repeat) keyTurned = false;
    if (keyTurned) { event.preventDefault(); return; }
    if (!event.repeat && atEdge(direction) && turnPart(direction)) {
      keyTurned = true;
      event.preventDefault();
    }
  });
  back.addEventListener('click', () => showMap({ historyEntry: true, focus: true }));
  addEventListener('hashchange', syncHash);
  addEventListener('popstate', syncHash);
  addEventListener('resize', resize);
  addEventListener('load', () => { resize(); syncHash(); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && turning) settlePicker(turning, turning.phase === 'settling' ? turning.slot : null, true);
    pauseAnimation();
  });
  motion.addEventListener('change', () => {
    if (motion.matches && turning && turning.phase === 'settling') settlePicker(turning, turning.slot, true);
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
