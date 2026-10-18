(() => {
  const workspace = document.querySelector('[data-engineering-workspace]');
  if (!workspace) return;
  const reader = workspace.querySelector('[data-engineering-scroll]');
  const wheel = workspace.querySelector('[data-dbtl-wheel]');
  const stageLinks = [...wheel.querySelectorAll('[data-dbtl-stage]')];
  const cycleNav = workspace.querySelector('[data-engineering-cycles]');
  const cycleTuner = new window.ORCACycleTuner(cycleNav);
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
  let rollers;
  const boundary = new window.ORCAChapterBoundary();
  const hint = document.createElement('div');
  hint.className = 'engineering-boundary';
  hint.setAttribute('role', 'status');
  hint.setAttribute('aria-live', 'polite');
  hint.setAttribute('aria-atomic', 'true');
  hint.setAttribute('aria-hidden', 'true');
  hint.innerHTML = '<span class="engineering-boundary__arrow" aria-hidden="true"></span><span><strong></strong><small></small></span>';
  paper.append(hint);
  let lastReaderTop = reader.scrollTop;
  let gesture = 'initial';
  let gestureNumber = 0;

  function neighbor(direction) {
    return partOrder[partOrder.indexOf(activePanel?.dataset.engineeringPanel) + direction];
  }
  function hideHint() {
    hint.removeAttribute('data-open');
    hint.setAttribute('aria-hidden', 'true');
  }
  function showHint(result) {
    if (result.action !== 'hint') { hideHint(); return; }
    const previous = result.direction < 0;
    const label = `${previous ? 'Previous chapter' : 'Next chapter'}: ${parts.get(result.chapter)}`;
    if (hint.hasAttribute('data-open') && hint.querySelector('strong').textContent === label) return;
    if (hint.querySelector('strong').textContent !== label) {
      hint.querySelector('strong').textContent = label;
      hint.querySelector('small').textContent = previous ? 'Scroll up again to return' : 'Scroll down again to continue';
      hint.querySelector('.engineering-boundary__arrow').textContent = previous ? '↑' : '↓';
    }
    hint.dataset.edge = previous ? 'top' : 'bottom';
    hint.setAttribute('data-open', '');
    hint.setAttribute('aria-hidden', 'false');
  }

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
  let contentPanel = panelFor(partOrder[0]);
  for (const node of [...article.childNodes]) {
    if (node.nodeType === Node.ELEMENT_NODE && /^H[2-6]$/.test(node.tagName)) {
      const part = partAlias(node.id);
      if (parts.has(part)) contentPanel = panelFor(part);
      else if (node.tagName === 'H2') contentPanel = panelFor(node.id);
    }
    contentPanel.append(node);
  }
  article.append(...panels.values());

  // Apply the approved reading face only inside authored cycle boundaries.
  // Chapter introductions, headings, captions, tables and references keep their fonts.
  for (const panel of panels.values()) {
    let cycleLevel = null;
    for (const node of panel.children) {
      if (/^H[2-6]$/.test(node.tagName)) {
        const level = Number(node.tagName.slice(1));
        const cycle = node.id.match(cyclePattern);
        if (cycle && !cycle[3]) cycleLevel = level;
        else if (cycleLevel !== null && level <= cycleLevel) cycleLevel = null;
        continue;
      }
      if (cycleLevel === null) continue;
      const prose = [...node.querySelectorAll('p, li, blockquote')];
      if (node.matches('p, li, blockquote')) prose.unshift(node);
      for (const element of prose) {
        if (!element.closest('figure, figcaption, .figure-caption, table, pre') &&
            !element.querySelector('img, table, pre')) {
          element.classList.add('engineering-cycle-prose');
        }
      }
    }
  }

  // Keep stage headings and anchor IDs semantic; decorate them as compact badges.
  for (const heading of article.querySelectorAll(':is(h3,h4,h5,h6)[id]')) {
    const stage = heading.id.match(cyclePattern)?.[3];
    if (!stage) continue;
    heading.classList.add('engineering-stage-label');
    heading.dataset.stage = stage;
    const [name, ...description] = heading.textContent.trim().split(/\s+—\s+/);
    const badge = document.createElement('span');
    badge.className = 'engineering-stage-badge';
    badge.textContent = name;
    const icon = document.createElement('span');
    icon.className = 'engineering-stage-icon';
    icon.setAttribute('aria-hidden', 'true');
    badge.prepend(icon);
    heading.replaceChildren(badge);
    if (description.length) {
      const detail = document.createElement('span');
      detail.className = 'engineering-stage-detail';
      detail.textContent = description.join(' — ');
      heading.append(document.createTextNode(' '), detail);
    }
  }

  // Lift each authored Overview into its own surface, preserving the original
  // heading IDs, node order and section boundaries for links and scroll tracking.
  for (const panel of panels.values()) {
    for (const heading of panel.querySelectorAll(':is(h3,h4,h5,h6)[id$="-overview"]')) {
      if (heading.textContent.trim().toLowerCase() !== 'overview') continue;
      const card = document.createElement('section');
      card.className = 'engineering-overview-card';
      card.setAttribute('aria-labelledby', heading.id);
      heading.before(card);
      const level = Number(heading.tagName.slice(1));
      let node = heading;
      while (node) {
        if (node !== heading && node.nodeType === Node.ELEMENT_NODE &&
            /^H[1-6]$/.test(node.tagName) && Number(node.tagName.slice(1)) <= level) break;
        const next = node.nextSibling;
        card.append(node);
        node = next;
      }
    }
  }

  function showReader() {
    workspace.dataset.engineeringView = 'reader';
    map.hidden = true;
    controls.hidden = false;
    paper.hidden = false;
    back.hidden = false;
  }

  function showMap({ historyEntry = false, focus = false } = {}) {
    cancelTurn();
    boundary.clear();
    hideHint();
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
    // Card-heading links reveal the whole raised surface, including its top edge.
    if (target.matches('.engineering-overview-card > :is(h3,h4,h5,h6):first-child')) target = target.parentElement;
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
    // Design-only chapters retain the mascot without implying a DBTL cycle.
    wheel.closest('.dbtl-directory').hidden = false;
    wheel.toggleAttribute('data-mascot-only', !number);
    wheel.setAttribute('aria-label', number
      ? 'Engineering cycle: Design, Build, Test, Learn'
      : `${parts.get(part)} proposed design`);
    const portrait = portraits.get(cycle) || portraits.get(`${part}-cycle-01`) || portraits.values().next().value;
    if (portrait && selectedPortrait !== portrait) {
      portraits.forEach(image => image.classList.toggle('is-hidden', image !== portrait));
      wheel.dataset.portrait = portrait.dataset.dbtlPortrait;
      selectedPortrait = portrait;
    }
    cycleTuner.render(record, number, overview);
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

  function renderHeading(part, boundaryPreview = false) {
    if (rollers && !boundaryPreview) { rollers.sync(part); return; }
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
    if (mapPart) rollers?.sync(mapPart);
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
    renderHeading(mapPart, true);
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
    const duration = 180;
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

  function focusTarget(target) {
    const temporary = !target.hasAttribute('tabindex');
    if (temporary) target.tabIndex = -1;
    target.focus({ preventScroll: true });
    if (temporary) target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
  }

  function go(target, { historyEntry = true, focus = true, instant = false, keepGesture = false } = {}) {
    if (!target) return;
    cancelTurn();
    boundary.clear(!keepGesture);
    hideHint();
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
    lastReaderTop = reader.scrollTop;
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
    const target = hashTarget(link.getAttribute('href'));
    if (!target) return;
    event.preventDefault();
    // A cycle or part change is a direct jump. Only the four nearby DBTL
    // stages use smooth scrolling within their current record.
    go(target, { instant: link.hasAttribute('data-engineering-cycle') || link.hasAttribute('data-overview-target') || link.hasAttribute('data-engineering-group') || link.hasAttribute('data-engineering-part') });
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
    go(target, { historyEntry: false, focus: false, instant: true, keepGesture: true });
    reader.scrollTo({ top: direction > 0 ? 0 : reader.scrollHeight - reader.clientHeight, behavior: 'instant' });
    reader.focus({ preventScroll: true });
    pending = null;
    anchoredTarget = null;
    schedule();
    history.replaceState(history.state, '', `#${target.id}`);
    lastReaderTop = reader.scrollTop;
    if (animatePaper) paperEntrance = article.animate([
      { opacity: .15, transform: `translateY(${direction * 7}px)` },
      { opacity: 1, transform: 'translateY(0)' },
    ], { duration: 180, easing: 'ease-out' });
  }

  function boundaryInput(direction, distance, threshold = 32) {
    cancelPending();
    if (turning) {
      if (turning.direction === direction) return true;
      // A reversal releases the article immediately, even during the title slide.
      cancelTurn();
      boundary.clear();
    }
    const result = boundary.input({ direction, distance, threshold, gesture, edge: atEdge(direction), chapter: neighbor(direction) });
    if (result.action === 'turn') {
      hideHint();
      const turn = beginPicker('boundary', direction);
      if (turn) { turn.direction = direction; settlePicker(turn, direction); }
    } else if (result.action !== 'absorb') showHint(result);
    return result.action !== 'read';
  }

  const wheelGestures = new window.ORCAWheelGestures();
  reader.addEventListener('wheel', event => {
    if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY) || !event.deltaY) return;
    const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? reader.clientHeight : 1);
    // Fractional tail/rebound events must not retract a revealed drawer or
    // keep postponing recognition of the reader's next deliberate gesture.
    if (Math.abs(delta) < 2) {
      if (boundary.preview || turning || boundary.consumed) event.preventDefault();
      return;
    }
    gesture = wheelGestures.next(delta, performance.now());
    if (boundaryInput(Math.sign(delta), Math.abs(delta), 12)) event.preventDefault();
  }, { passive: false });

  let swipe;
  reader.addEventListener('touchstart', event => {
    cancelPending();
    if (event.touches.length !== 1) { swipe = null; return; }
    const touch = event.touches[0];
    gesture = `touch-${++gestureNumber}`;
    swipe = { x: touch.clientX, y: touch.clientY, lastY: touch.clientY, intercepted: false };
  }, { passive: true });
  reader.addEventListener('touchmove', event => {
    if (!swipe || event.touches.length !== 1 || !event.cancelable) return;
    const touch = event.touches[0];
    const dy = swipe.lastY - touch.clientY;
    const totalY = swipe.y - touch.clientY;
    swipe.lastY = touch.clientY;
    if (!dy || Math.abs(totalY) <= Math.abs(swipe.x - touch.clientX)) return;
    if (boundaryInput(Math.sign(dy), Math.abs(dy))) {
      event.preventDefault();
      swipe.intercepted = true;
    } else if (swipe.intercepted) {
      // Once a touch has been cancelled, some browsers cannot resume native
      // scrolling until release. Keep the reverse drag responsive ourselves.
      event.preventDefault();
      reader.scrollTop += dy;
    }
  }, { passive: false });
  reader.addEventListener('touchend', () => { swipe = null; }, { passive: true });
  reader.addEventListener('touchcancel', () => {
    swipe = null;
    boundary.clear();
    hideHint();
  }, { passive: true });
  reader.addEventListener('scroll', () => {
    // Clamp elastic overscroll before calculating movement. Native rebound
    // at an edge is not a request to close and reopen the drawer.
    const maximum = Math.max(0, reader.scrollHeight - reader.clientHeight);
    const top = Math.max(0, Math.min(maximum, reader.scrollTop));
    const direction = Math.sign(top - lastReaderTop);
    lastReaderTop = top;
    if (!turning && direction) {
      const preview = boundary.preview;
      if (preview && (preview.direction < 0 ? top <= 8 : maximum - top <= 8)) {
        // Keep the already-open drawer stationary at the boundary.
      } else if (atEdge(direction) && neighbor(direction) && !pending) {
        showHint(boundary.offer(direction, neighbor(direction), gesture));
      } else {
        boundary.clear(false);
        hideHint();
      }
    }
    schedule();
  }, { passive: true });
  let keyGesture;
  reader.addEventListener('keyup', () => { keyGesture = null; });
  reader.addEventListener('blur', () => { keyGesture = null; });
  reader.addEventListener('keydown', event => {
    if (event.target.closest('input, textarea, select, button, [contenteditable="true"]') || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'Escape') { cancelTurn(); boundary.clear(); hideHint(); return; }
    if (['Home', 'End'].includes(event.key)) {
      cancelTurn(); cancelPending(); boundary.clear(); hideHint();
      gesture = `key-${++gestureNumber}`;
      return;
    }
    const direction = ['ArrowDown', 'PageDown'].includes(event.key) ? 1
      : ['ArrowUp', 'PageUp'].includes(event.key) ? -1
      : event.key === ' ' ? (event.shiftKey ? -1 : 1) : 0;
    if (!direction) return;
    if (!event.repeat || !keyGesture) keyGesture = `key-${++gestureNumber}`;
    gesture = keyGesture;
    if (boundaryInput(direction, 40)) event.preventDefault();
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
  rollers = new window.ORCAEngineeringRollers({
    rows: headingRows, groups,
    beforeInput: () => { cancelTurn(); boundary.clear(); hideHint(); },
    navigate: part => {
      const target = document.getElementById(part);
      go(target, { focus: false, instant: true });
    },
  });
  resize();
  pauseAnimation();
  syncHash();
  schedule();
})();
