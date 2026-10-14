(() => {
  'use strict';
  const root = document.documentElement;
  if (root.classList.contains('orca-cursor-enabled')) return;
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const contrast = matchMedia('(forced-colors: active)');
  const layer = document.createElement('div');
  layer.className = 'orca-cursor-layer';
  layer.setAttribute('aria-hidden', 'true');
  const halo = document.createElement('div');
  halo.className = 'orca-cursor-halo';
  layer.append(halo);
  document.body.append(layer);
  let target = null, active = null, x = 0, y = 0, frame = 0, pressed = false;
  const enabled = () => fine.matches && !contrast.matches;
  const animated = () => enabled() && !reduced.matches;
  const clearActive = () => {
    active?.removeAttribute('data-orca-cursor');
    active = null;
  };
  const hide = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    pressed = false;
    target = null;
    clearActive();
    halo.classList.remove('is-visible', 'is-pressed');
    layer.querySelectorAll('.orca-cursor-ripple').forEach(node => node.remove());
  };
  function classify(element) {
    clearActive();
    if (!enabled() || !(element instanceof Element)) return false;
    if (element.closest(':disabled, [aria-disabled="true"], [inert]')) return false;
    if (element.closest('[data-bio-handle], [data-bio-hit], [draggable="true"], [data-cursor="native"]')) return false;
    // Respect authored grab, grabbing, text, resize and other functional cursors.
    const cursor = getComputedStyle(element).cursor;
    if (!/(?:^|,\s*)(auto|default|pointer)$/.test(cursor)) return false;
    if (cursor === 'pointer' || element.closest('a[href], button, summary, [role="button"], [role="link"], [data-cursor="pointer"]')) {
      active = element;
      active.setAttribute('data-orca-cursor', 'link');
      return true;
    }
    return false;
  }
  function render() {
    frame = 0;
    const interactive = classify(target);
    halo.style.transform = `translate3d(${x - 17}px, ${y - 17}px, 0)`;
    halo.classList.toggle('is-visible', interactive && animated());
    halo.classList.toggle('is-pressed', interactive && pressed);
  }
  function update(event) {
    if (event.pointerType !== 'mouse' || !enabled()) { hide(); return; }
    x = event.clientX;
    y = event.clientY;
    target = event.target;
    if (!frame) frame = requestAnimationFrame(render);
  }
  function syncPreferences() {
    hide();
    root.classList.toggle('orca-cursor-enabled', enabled());
  }
  for (const preference of [fine, reduced, contrast]) preference.addEventListener('change', syncPreferences);
  syncPreferences();
  document.addEventListener('pointermove', update, { passive: true });
  document.addEventListener('pointerover', update, { passive: true });
  document.addEventListener('pointerdown', event => {
    update(event);
    if (event.pointerType !== 'mouse' || event.button !== 0 || !enabled()) return;
    pressed = true;
    cancelAnimationFrame(frame);
    render();
    if (!active || !animated()) return;
    // Bound the transient DOM even during rapid repeated clicks.
    if (layer.childElementCount >= 5) layer.children[1].remove();
    const ripple = document.createElement('div');
    ripple.className = 'orca-cursor-ripple';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
    layer.append(ripple);
  }, { passive: true });
  document.addEventListener('pointerup', event => { pressed = false; update(event); }, { passive: true });
  document.addEventListener('pointercancel', hide, { passive: true });
  document.addEventListener('pointerleave', hide);
  document.addEventListener('keydown', hide);
  window.addEventListener('blur', hide);
  window.addEventListener('pagehide', hide);
  document.addEventListener('visibilitychange', () => { if (document.hidden) hide(); });
  // A wheel can move a new target under a stationary mouse.
  document.addEventListener('scroll', () => {
    if (!target) return;
    target = document.elementFromPoint(x, y);
    if (!frame) frame = requestAnimationFrame(render);
  }, { passive: true, capture: true });
})();
