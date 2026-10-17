(() => {
  const map = document.querySelector('[data-engineering-map]');
  if (!map) return;
  const { groups } = window.ORCAEngineering;
  const groupButtons = [...map.querySelectorAll('[data-engineering-group]')];
  const leafButtons = [...map.querySelectorAll('.engineering-map-leaf[data-engineering-part]')];
  const branchGroups = [...map.querySelectorAll('[data-map-branch-group]')];
  const branches = map.querySelector('.engineering-map-branches');
  const cycles = map.querySelector('.engineering-map-cycles');
  let cycleLinks = [];
  const canvas = map.querySelector('[data-map-canvas]');
  const lines = map.querySelector('[data-map-lines]');
  const root = map.querySelector('.engineering-map-root');
  const desktop = matchMedia('(min-width: 901px)');
  const hover = matchMedia('(hover: hover) and (pointer: fine)');
  const overview = () => !desktop.matches || !hover.matches;
  const namespace = 'http://www.w3.org/2000/svg';
  const streams = new Map();
  let selectedGroup;
  let selectedPart;
  let queued = false;
  let keyboardNavigation = false;
  let keyboardSettlingUntil = 0;
  let pointerPosition;

  const groupButton = () => groupButtons.find(button => button.dataset.engineeringGroup === selectedGroup);
  const visibleLeaves = () => leafButtons.filter(button => !button.closest('[data-map-branch-group]').hidden);
  const nodeId = node => node.dataset.engineeringGroup || node.dataset.engineeringPart ||
    (node.dataset.mapCycle ? `${selectedPart}-cycle-${node.dataset.mapCycle}` : 'engineering');

  // Keep each downstream cluster beside its parent, clamped to the map canvas.
  // Only layout changes measure nodes; animation itself runs in CSS, without a frame loop.
  function placeCluster(cluster, parent, property, bounds) {
    cluster.style.setProperty(property, '0px');
    if (overview() || !parent || cluster.hidden) return;
    const box = cluster.getBoundingClientRect();
    const origin = box.top - bounds.top;
    const parentBox = parent.getBoundingClientRect();
    const desired = parentBox.top + parentBox.height / 2 - bounds.top - box.height / 2;
    const inset = 22;
    const top = Math.max(inset, Math.min(desired, bounds.height - box.height - inset));
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

  function draw() {
    queued = false;
    if (map.hidden) return;
    const bounds = canvas.getBoundingClientRect();
    const currentGroup = groupButton();
    placeCluster(branches, currentGroup, '--branch-top', bounds);
    const leaves = visibleLeaves();
    const currentLeaf = leaves.find(button => button.dataset.engineeringPart === selectedPart);
    placeCluster(cycles, currentLeaf || currentGroup, '--cycle-top', bounds);
    lines.setAttribute('viewBox', `0 0 ${bounds.width} ${bounds.height}`);
    const retained = new Set();

    function connect(from, to, active) {
      if (!from) return;
      const a = (from.querySelector('.map-label, h1') || from).getBoundingClientRect();
      const b = (to.querySelector('.map-label') || to).getBoundingClientRect();
      const rootAbove = overview() && from === root;
      const cyclesBelow = overview() && to.dataset.mapCycle;
      const horizontal = !overview() || (!cyclesBelow && b.left >= a.right + 8);
      const start = rootAbove ? [a.left - 10, a.top + a.height / 2] : horizontal ? [a.right + 10, a.top + a.height / 2] : [a.left + a.width / 2, a.bottom + 10];
      const end = rootAbove ? [b.left - 10, b.top + b.height / 2] : horizontal ? [b.left - 10, b.top + b.height / 2] : [b.left + b.width / 2, b.top - 10];
      const x1 = start[0] - bounds.left, y1 = start[1] - bounds.top;
      const x2 = end[0] - bounds.left, y2 = end[1] - bounds.top;
      const bend = Math.max(24, Math.abs(x2 - x1) * .55);
      const leftBranch = Math.max(10, Math.min(x1, x2) - 30);
      const points = rootAbove
        ? [[x1,y1],[leftBranch,y1],[leftBranch,y2],[x2,y2]]
        : horizontal
        ? [[x1,y1],[x1+bend,y1],[x2-bend,y2],[x2,y2]]
        : [[x1,y1],[x1,(y1+y2)/2],[x2,(y1+y2)/2],[x2,y2]];
      const d = `M${points[0]} C${points[1]} ${points[2]} ${points[3]}`;
      const fromId = nodeId(from), toId = nodeId(to), key = `${fromId}:${toId}`;
      retained.add(key);
      const stream = streams.get(key) || makeStream(key);
      stream.classList.toggle('is-active', active);
      stream.dataset.from = fromId;
      stream.dataset.to = toId;
      if (stream.dataset.path !== d) {
        stream.dataset.path = d;
        stream.querySelector('path').setAttribute('d', d);
        stream.querySelectorAll('circle').forEach((anchor, index) => {
          anchor.setAttribute('cx', String(index ? x2 : x1));
          anchor.setAttribute('cy', String(index ? y2 : y1));
        });
      }
    }
    groupButtons.forEach(button => connect(root, button, button.dataset.engineeringGroup === selectedGroup));
    leaves.forEach(button => {
      const groupId = button.closest('[data-map-branch-group]').dataset.mapBranchGroup;
      connect(groupButtons.find(group => group.dataset.engineeringGroup === groupId), button, button.dataset.engineeringPart === selectedPart);
    });
    if (!cycles.hidden) cycleLinks.forEach(link => connect(currentLeaf || currentGroup, link, true));
    streams.forEach((stream, key) => {
      if (!retained.has(key)) { stream.remove(); streams.delete(key); }
    });
  }

  function schedule() {
    if (!queued) { queued = true; requestAnimationFrame(draw); }
  }

  function choosePart(id, focus = false) {
    const group = groups.find(item => item.parts.some(part => part.id === id));
    if (!group) return;
    if (selectedGroup !== group.id) chooseGroup(group.id);
    selectedPart = id;
    const part = group.parts.find(item => item.id === id);
    leafButtons.forEach(button => button.classList.toggle('is-selected', button.dataset.engineeringPart === id));
    cycles.hidden = false;
    cycles.setAttribute('aria-label', `${part.label} cycles`);
    if (cycles.dataset.part !== id) {
      cycleLinks = part.cycles.map(number => {
        const link = document.createElement('a');
        link.className = 'engineering-map-cycle';
        link.dataset.mapCycle = number;
        const label = document.createElement('strong');
        label.className = 'map-label';
        label.textContent = `Cycle ${number}`;
        link.append(label);
        return link;
      });
      cycles.replaceChildren(...cycleLinks);
      cycles.dataset.part = id;
      cycles.dataset.cycleCount = String(cycleLinks.length);
    }
    cycleLinks.forEach(link => {
      link.href = `#${id}-cycle-${link.dataset.mapCycle}`;
      link.setAttribute('aria-label', `${part.label}, Cycle ${link.dataset.mapCycle}`);
    });
    if (focus) {
      const target = leafButtons.find(button => button.dataset.engineeringPart === id) || groupButton();
      target.focus({ preventScroll: true });
      requestAnimationFrame(() => target.scrollIntoView({ block: 'nearest', inline: 'nearest' }));
    }
    schedule();
  }

  function chooseGroup(id) {
    const group = groups.find(item => item.id === id);
    // Crossing the same parent again must not close the already selected cycle branch.
    if (!group || selectedGroup === id) return;
    selectedGroup = id;
    selectedPart = null;
    map.dataset.selectedGroup = id;
    map.dataset.simple = String(group.parts.length === 1);
    groupButtons.forEach(button => button.classList.toggle('is-selected', button.dataset.engineeringGroup === id));
    branchGroups.forEach(section => { section.hidden = !overview() && section.dataset.mapBranchGroup !== id; });
    leafButtons.forEach(button => button.classList.remove('is-selected'));
    cycles.hidden = true;
    if (group.parts.length === 1) choosePart(group.parts[0].id);
    schedule();
  }

  function hoverNode(button) {
    if (!hover.matches || map.hidden) return;
    if (button.dataset.engineeringGroup) chooseGroup(button.dataset.engineeringGroup);
    else if (button.dataset.engineeringPart !== selectedPart) choosePart(button.dataset.engineeringPart);
  }
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
    keyboardSettlingUntil = performance.now() + 300;
    if (!['ArrowRight', 'ArrowLeft'].includes(event.key)) return;
    const group = event.target.closest('[data-engineering-group]');
    const leaf = event.target.closest('.engineering-map-leaf[data-engineering-part]');
    const cycle = event.target.closest('[data-map-cycle]');
    if (!group && !leaf && !cycle) return;
    event.preventDefault();
    if (event.key === 'ArrowRight') {
      if (group) {
        chooseGroup(group.dataset.engineeringGroup);
        (visibleLeaves().find(button => button.closest('[data-map-branch-group]').dataset.mapBranchGroup === selectedGroup) || cycleLinks[0]).focus();
      } else if (leaf) {
        choosePart(leaf.dataset.engineeringPart);
        cycleLinks[0].focus();
      }
    } else if (cycle) {
      (visibleLeaves().find(button => button.dataset.engineeringPart === selectedPart) || groupButton()).focus();
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
    map.dataset.flowPaused = String(map.hidden || document.hidden);
    if (!map.hidden) schedule();
  }
  function updateLayout() {
    map.dataset.overview = String(overview());
    branchGroups.forEach(section => { section.hidden = !overview() && section.dataset.mapBranchGroup !== selectedGroup; });
    schedule();
  }
  new MutationObserver(updateMotion).observe(map, { attributes: true, attributeFilter: ['hidden'] });
  document.addEventListener('visibilitychange', updateMotion);
  addEventListener('resize', updateLayout);
  hover.addEventListener('change', updateLayout);
  addEventListener('load', schedule);
  if ('ResizeObserver' in window) new ResizeObserver(schedule).observe(canvas);
  document.fonts?.ready.then(schedule);
  updateLayout();
  updateMotion();
})();
