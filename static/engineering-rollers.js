/* Two detented selectors. Reading/navigation remains owned by the workspace. */
(() => {
  window.ORCAEngineeringRollers = function ({ rows, groups, navigate, beforeInput }) {
    let current;
    let interaction;
    let frame;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const states = rows.map(row => ({ row, level: row.dataset.engineeringHeadingRow, slots: [...row.children] }));
    const clamp = (n, low, high) => Math.max(low, Math.min(high, n));
    function paint(state, position) {
      state.position = position;
      const center = Math.round(position);
      const distance = state.row.clientWidth * .46;
      state.row.style.setProperty('--roller-ticks', `${-position * distance}px`);
      state.slots.forEach((slot, i) => {
        const index = center + i - 1;
        const offset = index - position;
        const amount = Math.min(1.5, Math.abs(offset));
        slot.textContent = state.items[index]?.label || '';
        slot.dataset.rollerIndex = index;
        Object.assign(slot.style, {
          transform: `translateX(calc(-50% + ${offset * distance}px)) perspective(500px) rotateY(${-offset * 28}deg) scale(${1 - Math.min(1, amount) * .22})`,
          opacity: String(Math.max(0, 1 - amount * .66)),
          filter: `blur(${Math.min(1, amount) * .45}px)`, clipPath: 'none',
        });
      });
    }
    function sync(part) {
      cancelAnimationFrame(frame);
      interaction = null;
      current = part;
      const group = groups.find(group => group.parts.some(item => item.id === part));
      if (!group) return;
      states.forEach(state => {
        state.row.removeAttribute('data-dragging');
        state.items = state.level === 'group' ? groups : group.parts;
        state.index = state.items.findIndex(item => item.id === (state.level === 'group' ? group.id : part));
        const locked = state.items.length === 1;
        state.row.dataset.locked = String(locked);
        state.row.setAttribute('aria-disabled', String(locked));
        state.row.setAttribute('aria-valuemin', '1');
        state.row.setAttribute('aria-valuemax', String(state.items.length));
        state.row.setAttribute('aria-valuenow', String(state.index + 1));
        state.row.setAttribute('aria-valuetext', `${state.items[state.index].label}, ${state.index + 1} of ${state.items.length}`);
        state.row.tabIndex = locked ? -1 : 0;
        paint(state, state.index);
      });
    }
    function settle(state, target) {
      cancelAnimationFrame(frame);
      target = clamp(target, 0, state.items.length - 1);
      const from = state.position;
      const start = performance.now();
      interaction = { state, settling: true };
      const finish = () => {
        interaction = null;
        paint(state, target);
        if (target !== state.index) {
          const item = state.items[target];
          navigate(state.level === 'group' ? item.parts[0].id : item.id);
        } else sync(current);
      };
      if (reduced.matches) { finish(); return; }
      function tick(now) {
        const t = Math.min(1, (now - start) / 200);
        paint(state, from + (target - from) * (1 - (1 - t) ** 3));
        if (t < 1) frame = requestAnimationFrame(tick); else finish();
      }
      frame = requestAnimationFrame(tick);
    }
    states.forEach(state => {
      const { row } = state;
      row.setAttribute('role', 'slider');
      row.setAttribute('aria-orientation', 'horizontal');
      row.setAttribute('aria-label', state.level === 'group' ? 'Engineering category' : 'Engineering module');
      row.setAttribute('aria-describedby', 'engineering-roller-help');
      row.addEventListener('pointerdown', event => {
        if (event.button !== 0 || !event.isPrimary || state.items.length < 2) return;
        beforeInput();
        sync(current);
        row.focus({ preventScroll: true });
        row.setPointerCapture(event.pointerId);
        interaction = { state, x: event.clientX, y: event.clientY, pointer: event.pointerId, index: state.index, clicked: Number(event.target.dataset.rollerIndex), moved: false };
      });
      row.addEventListener('pointermove', event => {
        const drag = interaction;
        if (!drag || drag.state !== state || drag.pointer !== event.pointerId) return;
        const dx = event.clientX - drag.x;
        if (!drag.moved && Math.abs(dx) < 6) return;
        drag.moved = true;
        row.dataset.dragging = 'true';
        const value = drag.index - dx / (row.clientWidth * .46);
        const bounded = clamp(value, 0, state.items.length - 1);
        paint(state, bounded + (value - bounded) * .15);
      });
      function release(event, cancelled) {
        const drag = interaction;
        if (!drag || drag.state !== state || drag.pointer !== event.pointerId) return;
        row.removeAttribute('data-dragging');
        interaction = null;
        if (row.hasPointerCapture(event.pointerId)) row.releasePointerCapture(event.pointerId);
        const target = cancelled ? drag.index : drag.moved ? Math.round(state.position) : Number.isFinite(drag.clicked) ? drag.clicked : drag.index;
        settle(state, target);
      }
      row.addEventListener('pointerup', event => release(event, false));
      row.addEventListener('pointercancel', event => release(event, true));
      row.addEventListener('lostpointercapture', event => release(event, true));
      row.addEventListener('keydown', event => {
        if (event.altKey || event.ctrlKey || event.metaKey || state.items.length < 2) return;
        const delta = ['ArrowRight', 'ArrowUp'].includes(event.key) ? 1 : ['ArrowLeft', 'ArrowDown'].includes(event.key) ? -1 : 0;
        if (!delta && !['Home', 'End', 'Escape'].includes(event.key)) return;
        event.preventDefault();
        beforeInput();
        const target = event.key === 'Home' ? 0 : event.key === 'End' ? state.items.length - 1 : event.key === 'Escape' ? state.index : state.index + delta;
        settle(state, target);
      });
    });
    addEventListener('resize', () => current && sync(current));
    document.addEventListener('visibilitychange', () => { if (document.hidden && current) sync(current); });
    reduced.addEventListener('change', () => { if (current) sync(current); });
    return { sync };
  };
})();
