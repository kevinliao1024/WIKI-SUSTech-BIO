(() => {
  const map = document.querySelector('[data-engineering-map]');
  if (!map) return;
  const { groups } = window.ORCAEngineering;
  const groupButtons = [...map.querySelectorAll('[data-engineering-group]')];
  const leafButtons = [...map.querySelectorAll('.engineering-map-leaf[data-engineering-part]')];
  const branchGroups = [...map.querySelectorAll('[data-map-branch-group]')];
  const branches = map.querySelector('.engineering-map-branches');
  const canvas = map.querySelector('[data-map-canvas]');
  const lines = map.querySelector('[data-map-lines]');
  const root = map.querySelector('.engineering-map-root');
  const desktop = matchMedia('(min-width: 600px)');
  const wide = matchMedia('(min-width: 901px)');
  const hover = matchMedia('(hover: hover) and (pointer: fine)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const overview = () => !desktop.matches || !hover.matches;
  const namespace = 'http://www.w3.org/2000/svg';
  const streams = new Map();
  let selectedGroup;
  let selectedPart;
  let queued = false;
  let keyboardNavigation = false;
  let keyboardSettlingUntil = 0;
  let pointerPosition;
  let frame = 0;
  let lastFrame = 0;
  let motionTime = 0;
  let pointerDown = false;
  let canvasBounds;
  let activeNodes = [];
  let connections = [];
  const motionStates = new Map();
  const pointer = { inside: false, x: 0, y: 0, nx: 0, ny: 0, node: null };
  const currents = map.querySelector('.engineering-map-currents');
  const clamp = (value, min, max) => Math.max(min, Math.min(value, max));
  const canFloat = () => wide.matches && !map.hidden && !document.hidden && !overview() && !reducedMotion.matches && !keyboardNavigation;

  const groupButton = () => groupButtons.find(button => button.dataset.engineeringGroup === selectedGroup);
  const visibleLeaves = () => leafButtons.filter(button => !button.closest('[data-map-branch-group]').hidden);
  const nodeId = node => node.dataset.engineeringGroup || node.dataset.engineeringPart ||
    'engineering';


  const art = map.querySelector('[data-engineering-overview]');
  const layers = [...art.querySelectorAll('[data-overview-layer]')];
  const diagramLinks = [...art.querySelectorAll('[data-overview-target]')];
  // Write real SVG paint values, rather than trusting compositing filters on
  // groups of <use> glyphs. Keep an immutable copy for exact color restoration.
  const paints = new Map(layers.map(layer => [layer,
    [...layer.querySelectorAll('[fill], [stroke]')].flatMap(node =>
      ['fill', 'stroke'].flatMap(attribute => {
        const color = node.getAttribute(attribute);
        if (!/^#[0-9a-f]{6}$/i.test(color || '')) return [];
        const rgb = [1, 3, 5].map(offset => parseInt(color.slice(offset, offset + 2), 16));
        const value = Math.round(rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722);
        return [{ node, attribute, color, gray: '#' + value.toString(16).padStart(2, '0').repeat(3) }];
      }))
  ]));
  function highlight(group, part = '') {
    if (art.dataset.activeGroup === group && art.dataset.activePart === part) return;
    art.dataset.activeGroup = group;
    art.dataset.activePart = part;
    layers.forEach(layer => {
      const active = layer.dataset.overviewFamily === group && (!part || layer.dataset.overviewParts.split(' ').includes(part));
      layer.classList.toggle('is-active', active);
      paints.get(layer).forEach(({ node, attribute, color, gray }) => node.setAttribute(attribute, active ? color : gray));
    });
    diagramLinks.forEach(link => link.classList.toggle('is-active', part
      ? link.dataset.overviewTarget === part && !link.dataset.overviewSelectGroup
      : link.dataset.overviewSelectGroup === group));
  }
  function selectDiagram(link) {
    if (map.hidden) return;
    if (link.dataset.overviewSelectGroup) chooseGroup(link.dataset.overviewSelectGroup);
    else choosePart(link.dataset.overviewTarget.replace(/-cycle-\d{2}.*$/, ''));
  }
  diagramLinks.forEach(link => {
    link.addEventListener('pointermove', event => {
      if (event.pointerType !== 'mouse') return;
      // Focusing/scrolling can fire hover events beneath a stationary cursor.
      // Only a real pointer movement may override the keyboard selection.
      if ((keyboardNavigation || performance.now() < keyboardSettlingUntil) && !event.movementX && !event.movementY) return;
      keyboardNavigation = false;
      selectDiagram(link);
    });
    link.addEventListener('focus', () => {
      keyboardNavigation = true;
      keyboardSettlingUntil = performance.now() + 300;
      selectDiagram(link);
    });
    link.addEventListener('click', () => selectDiagram(link));
  });
  function visualSurface(node) {
    if (node === root) return node;
    let surface = node.querySelector('.map-node-surface');
    if (!surface) {
      surface = document.createElement('span');
      surface.className = 'map-node-surface';
      surface.setAttribute('aria-hidden', 'true');
      surface.append(node.querySelector('.map-label').cloneNode(true));
      node.append(surface);
      node.classList.add('has-motion-surface');
    }
    return surface;
  }

  // Keep each downstream cluster beside its parent, clamped to the map canvas.
  // Layout is measured only on selection/resize. Animation uses cached rectangles.
  function placeCluster(cluster, parent, property, bounds) {
    cluster.style.setProperty(property, '0px');
    if (overview() || !parent || cluster.hidden) return;
    const box = cluster.getBoundingClientRect();
    const origin = box.top - bounds.top;
    const parentBox = parent.getBoundingClientRect();
    const desired = parentBox.top + parentBox.height / 2 - bounds.top - box.height / 2;
    const inset = wide.matches ? 22 : root.getBoundingClientRect().bottom - bounds.top + 16;
    const top = Math.max(inset, Math.min(desired, bounds.height - box.height - 22));
    cluster.style.setProperty(property, `${Math.round(top - origin)}px`);
  }

  function makeStream(key) {
    const stream = document.createElementNS(namespace, 'g');
    stream.setAttribute('class', 'engineering-map-stream');
    const path = document.createElementNS(namespace, 'path');
    path.setAttribute('class', 'map-connection-path');
    stream.append(path);
    for (let index = 0; index < 2; index += 1) {
      const anchor = document.createElementNS(namespace, 'circle');
      anchor.setAttribute('class', 'map-connection-anchor');
      anchor.setAttribute('r', '2.5');
      stream.append(anchor);
    }
    lines.append(stream);
    streams.set(key, stream);
    return stream;
  }

  function movingBox(node) {
    const state = motionStates.get(node);
    const box = state.box;
    const dx = box.width * (state.scale - 1) / 2;
    const dy = box.height * (state.scale - 1) / 2;
    return { left: box.left + state.x - dx, right: box.right + state.x + dx,
      top: box.top + state.y - dy, bottom: box.bottom + state.y + dy,
      width: box.width * state.scale, height: box.height * state.scale };
  }

  function paintConnection({ from, to, stream }) {
    const a = movingBox(from), b = movingBox(to);
    const peer = to.classList.contains('engineering-map-peer');
    const rootAbove = !peer && (!wide.matches || overview()) && from === root;
    const horizontal = !peer && (!overview() || b.left >= a.right + 8);
    const start = peer ? [a.left - 10, a.top + a.height / 2] : rootAbove ? [a.left - 10, a.top + a.height / 2] : horizontal ? [a.right + 10, a.top + a.height / 2] : [a.left + a.width / 2, a.bottom + 10];
    const end = peer ? [b.left - 10, b.top + b.height / 2] : rootAbove ? [b.left - 10, b.top + b.height / 2] : horizontal ? [b.left - 10, b.top + b.height / 2] : [b.left + b.width / 2, b.top - 10];
    const [x1, y1] = start, [x2, y2] = end;
    const bend = Math.max(24, Math.abs(x2 - x1) * .55);
    const leftBranch = Math.max(10, Math.min(x1, x2) - (peer ? 48 : 30));
    const points = peer || rootAbove
      ? [[x1,y1],[leftBranch,y1],[leftBranch,y2],[x2,y2]]
      : horizontal ? [[x1,y1],[x1+bend,y1],[x2-bend,y2],[x2,y2]]
      : [[x1,y1],[x1,(y1+y2)/2],[x2,(y1+y2)/2],[x2,y2]];
    const d = `M${points[0]} C${points[1]} ${points[2]} ${points[3]}`;
    if (stream.dataset.path === d) return;
    stream.dataset.path = d;
    stream.firstElementChild.setAttribute('d', d);
    [...stream.children].slice(1).forEach((anchor, index) => {
      anchor.setAttribute('cx', String(index ? x2 : x1));
      anchor.setAttribute('cy', String(index ? y2 : y1));
    });
  }

  function resetFloating() {
    for (const [node, state] of motionStates) {
      state.x = state.y = state.vx = state.vy = 0;
      state.scale = 1;
      state.surface.style.removeProperty('transform');
      node.classList.remove('is-attracted');
    }
    currents.style.removeProperty('transform');
    connections.forEach(paintConnection);
  }

  function animate(now) {
    frame = 0;
    if (!canFloat()) { resetFloating(); return; }
    frame = requestAnimationFrame(animate);
    // Follow the display refresh rate; cached geometry keeps layout out of this loop.
    const dt = Math.min((now - (lastFrame || now - 16.7)) / 1000, 1 / 30);
    lastFrame = now;
    if (pointerDown) return;
    motionTime += dt;
    const currentGroup = groupButton();
    activeNodes.forEach((node, index) => {
      const state = motionStates.get(node), box = state.box;
      const primary = pointer.inside && pointer.node === node;
      const linked = pointer.inside && pointer.node && (node === root || node === currentGroup || node.dataset.engineeringPart === selectedPart);
      const phase = node === root ? 0 : index * .85;
      const depth = node === root ? .9 : 1;
      const cx = box.left + box.width / 2, cy = box.top + box.height / 2;
      const pull = primary ? .12 : linked ? .018 : 0;
      const tx = Math.sin(motionTime * .4 + phase) * 2.2 + (pointer.inside ? pointer.nx * 22 * depth : 0) + clamp((pointer.x - cx) * pull, primary ? -7 : -2.5, primary ? 7 : 2.5);
      const ty = Math.sin(motionTime * .52 + phase) * 2.6 + (pointer.inside ? pointer.ny * 14 * depth : 0) + clamp((pointer.y - cy) * pull, primary ? -5 : -1.5, primary ? 5 : 1.5) - (primary ? 2 : 0);
      // A softer, nearly critically damped spring preserves momentum when the
      // pointer reverses or leaves. Bound the target, not the spring's travel.
      state.vx += ((tx - state.x) * 32 - state.vx * 11.5) * dt;
      state.vy += ((ty - state.y) * 32 - state.vy * 11.5) * dt;
      state.x += state.vx * dt;
      state.y += state.vy * dt;
      state.scale += ((primary && node !== root ? 1.018 : 1) - state.scale) * (1 - Math.exp(-dt * 10));
      state.surface.style.transform = `translate3d(${state.x.toFixed(2)}px,${state.y.toFixed(2)}px,0) scale(${state.scale.toFixed(4)})`;
      node.classList.toggle('is-attracted', primary);
    });
    const drift = motionStates.get(root);
    if (drift) {
      currents.style.transform = `translate3d(${(-drift.x * .7).toFixed(2)}px,${(-drift.y * .5).toFixed(2)}px,0)`;
    }
    connections.forEach(paintConnection);
  }

  function syncFloating() {
    map.dataset.motionEnabled = String(canFloat());
    if (!canFloat()) {
      cancelAnimationFrame(frame); frame = 0; lastFrame = 0;
      pointer.inside = false; pointer.node = null;
      resetFloating();
    } else if (!frame) { lastFrame = 0; frame = requestAnimationFrame(animate); }
  }

  function draw() {
    queued = false;
    if (map.hidden) return;
    // Temporarily clear visual offsets while measuring the stable layout.
    motionStates.forEach(state => state.surface.style.removeProperty('transform'));
    const bounds = canvas.getBoundingClientRect();
    canvasBounds = bounds;
    const clusterBounds = { top: bounds.top, height: bounds.height };
    const currentGroup = groupButton();
    placeCluster(branches, currentGroup, '--branch-top', clusterBounds);
    const leaves = visibleLeaves();
    lines.setAttribute('viewBox', `0 0 ${bounds.width} ${bounds.height}`);
    const retained = new Set();
    activeNodes = [root, ...groupButtons, ...leaves];
    connections = [];
    for (const node of motionStates.keys()) {
      if (!activeNodes.includes(node)) { node.classList.remove('is-attracted'); motionStates.delete(node); }
    }
    activeNodes.forEach(node => {
      const rect = node.getBoundingClientRect();
      const state = motionStates.get(node) || { x: 0, y: 0, vx: 0, vy: 0, scale: 1 };
      state.surface = visualSurface(node);
      state.box = { left:rect.left-bounds.left, right:rect.right-bounds.left, top:rect.top-bounds.top, bottom:rect.bottom-bounds.top, width:rect.width, height:rect.height };
      motionStates.set(node, state);
      state.surface.style.transform = `translate3d(${state.x}px,${state.y}px,0) scale(${state.scale})`;
    });

    function connect(from, to, active) {
      if (!from) return;
      const fromId = nodeId(from), toId = nodeId(to), key = `${fromId}:${toId}`;
      retained.add(key);
      const stream = streams.get(key) || makeStream(key);
      stream.classList.toggle('is-active', active);
      stream.dataset.from = fromId;
      stream.dataset.to = toId;
      const connection = { from, to, stream };
      connections.push(connection);
      paintConnection(connection);
    }
    groupButtons.forEach(button => connect(root, button, button.dataset.engineeringGroup === selectedGroup));
    leaves.forEach(button => {
      const groupId = button.closest('[data-map-branch-group]').dataset.mapBranchGroup;
      connect(groupButtons.find(group => group.dataset.engineeringGroup === groupId), button, button.dataset.engineeringPart === selectedPart);
    });
    streams.forEach((stream, key) => {
      if (!retained.has(key)) { stream.remove(); streams.delete(key); }
    });
    syncFloating();
  }

  function schedule() {
    if (!queued) { queued = true; requestAnimationFrame(draw); }
  }

  function choosePart(id, focus = false) {
    const group = groups.find(item => item.parts.some(part => part.id === id));
    if (!group) return;
    if (selectedGroup !== group.id) chooseGroup(group.id);
    selectedPart = id;
    map.dataset.selectedPart = id;
    leafButtons.forEach(button => button.classList.toggle('is-selected', button.dataset.engineeringPart === id));
    if (focus) {
      const target = leafButtons.find(button => button.dataset.engineeringPart === id) || groupButton();
      target.focus({ preventScroll: true });
      requestAnimationFrame(() => target.scrollIntoView({ block: 'nearest', inline: 'nearest' }));
    }
    highlight(group.id, id);
    schedule();
  }

  function chooseGroup(id) {
    const group = groups.find(item => item.id === id);
    if (!group) return;
    selectedGroup = id;
    selectedPart = null;
    map.dataset.selectedPart = '';
    map.dataset.selectedGroup = id;
    map.dataset.simple = String(group.parts.length === 1);
    groupButtons.forEach(button => button.classList.toggle('is-selected', button.dataset.engineeringGroup === id));
    branchGroups.forEach(section => { section.hidden = !overview() && section.dataset.mapBranchGroup !== id; });
    leafButtons.forEach(button => button.classList.remove('is-selected'));
    if (group.parts.length === 1) choosePart(group.parts[0].id);
    highlight(id);
    schedule();
  }

  function hoverNode(button) {
    if (!hover.matches || map.hidden) return;
    if (button.dataset.engineeringGroup) chooseGroup(button.dataset.engineeringGroup);
    else choosePart(button.dataset.engineeringPart);
  }
  let motionPointerPosition;
  canvas.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || overview() || reducedMotion.matches) return;
    const position = `${event.clientX}:${event.clientY}`;
    // Transformed nodes can generate enter/leave events under a stationary
    // cursor. Only physical pointer movement changes the attracted node.
    if (pointer.inside && motionPointerPosition === position) return;
    motionPointerPosition = position;
    keyboardNavigation = false;
    if (!canvasBounds) return;
    pointer.inside = true;
    pointer.x = event.clientX - canvasBounds.left;
    pointer.y = event.clientY - canvasBounds.top;
    pointer.nx = clamp(pointer.x / canvasBounds.width * 2 - 1, -1, 1);
    pointer.ny = clamp(pointer.y / canvasBounds.height * 2 - 1, -1, 1);
    pointer.node = event.target.closest('.engineering-map-group,.engineering-map-leaf');
    syncFloating();
  }, { passive: true });
  canvas.addEventListener('pointerleave', () => { pointer.inside = false; pointer.node = null; pointerPosition = undefined; });
  map.addEventListener('pointerdown', () => { pointerDown = true; }, { passive: true });
  addEventListener('pointerup', () => { pointerDown = false; }, { passive: true });
  addEventListener('pointercancel', () => { pointerDown = false; pointer.inside = false; });
  addEventListener('blur', () => { pointerDown = false; pointer.inside = false; pointer.node = null; });
  map.addEventListener('scroll', schedule, { passive: true });
  document.addEventListener('keydown', event => {
    if (event.key === 'Tab' && !map.hidden) { keyboardNavigation = true; syncFloating(); }
  });
  [...groupButtons, ...leafButtons].forEach(button => {
    button.addEventListener('mousemove', event => {
      // Revealing or resizing a branch must not select a different node under
      // a stationary pointer, especially while navigating with the keyboard.
      if ((performance.now() < keyboardSettlingUntil || keyboardNavigation) && !event.movementX && !event.movementY) return;
      const position = `${event.clientX}:${event.clientY}`;
      if (pointerPosition === position) return;
      pointerPosition = position;
      keyboardNavigation = false;
      hoverNode(button);
    });
    // Keep the expanded subtree open while the pointer crosses the space between nodes.
  });
  groupButtons.forEach(button => button.addEventListener('focus', () => {
    if (!map.hidden) chooseGroup(button.dataset.engineeringGroup);
  }));
  leafButtons.forEach(button => button.addEventListener('focus', () => {
    if (!map.hidden) choosePart(button.dataset.engineeringPart);
  }));

  map.addEventListener('click', event => {
    const group = event.target.closest('[data-engineering-group]');
    const leaf = event.target.closest('.engineering-map-leaf[data-engineering-part]');
    if (group) chooseGroup(group.dataset.engineeringGroup);
    else if (leaf) choosePart(leaf.dataset.engineeringPart);
  });
  map.addEventListener('keydown', event => {
    keyboardNavigation = true;
    syncFloating();
    keyboardSettlingUntil = performance.now() + 300;
    if (!['ArrowRight', 'ArrowLeft'].includes(event.key)) return;
    const group = event.target.closest('[data-engineering-group]');
    const leaf = event.target.closest('.engineering-map-leaf[data-engineering-part]');
    if (!group && !leaf) return;
    event.preventDefault();
    if (event.key === 'ArrowRight') {
      if (group) {
        chooseGroup(group.dataset.engineeringGroup);
        (visibleLeaves().find(button => button.closest('[data-map-branch-group]').dataset.mapBranchGroup === selectedGroup))?.focus();
      }
    } else if (leaf) groupButton().focus();
  });

  document.addEventListener('engineering:map-select', event => {
    if (event.detail.focus) {
      keyboardNavigation = true;
      keyboardSettlingUntil = performance.now() + 300;
    }
    if (event.detail.part) choosePart(event.detail.part, event.detail.focus);
    schedule();
  });
  function updateMotion() {
    map.dataset.flowPaused = String(map.hidden || document.hidden || reducedMotion.matches);
    if (map.hidden || document.hidden) pointerDown = false;
    syncFloating();
    if (!map.hidden) schedule();
  }
  function updateLayout() {
    map.dataset.overview = String(overview());
    branchGroups.forEach(section => { section.hidden = !overview() && section.dataset.mapBranchGroup !== selectedGroup; });
    syncFloating();
    schedule();
  }
  new MutationObserver(updateMotion).observe(map, { attributes: true, attributeFilter: ['hidden'] });
  document.addEventListener('visibilitychange', updateMotion);
  addEventListener('resize', updateLayout);
  hover.addEventListener('change', updateLayout);
  reducedMotion.addEventListener('change', updateMotion);
  addEventListener('load', schedule);
  if ('ResizeObserver' in window) new ResizeObserver(schedule).observe(canvas);
  document.fonts?.ready.then(schedule);
  updateLayout();
  // Restore the reader's module when returning from a deep link.
  choosePart('pod');
  updateMotion();
})();
