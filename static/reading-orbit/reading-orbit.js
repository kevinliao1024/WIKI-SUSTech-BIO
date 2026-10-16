(() => {
  const orbit = document.querySelector('[data-reading-orbit]');
  const traveler = orbit?.querySelector('[data-orbit-traveler]');
  const value = orbit?.querySelector('[data-orbit-value]');
  const footer = document.querySelector('footer');
  if (!orbit || !traveler) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let queued = false;
  let drag = null;
  const clamp = value => Math.max(0, Math.min(1, value));
  function measure() {
    const scrollable = Math.max(0, document.documentElement.scrollHeight - innerHeight);
    return {
      scrollable,
      ratio: scrollable ? clamp(scrollY / scrollable) : 0,
      travel: Math.max(0, orbit.clientHeight - traveler.offsetHeight),
      top: orbit.getBoundingClientRect().top,
    };
  }
  function rebaseDrag({ ratio, travel, top }) {
    if (drag && (drag.travel !== travel || drag.top !== top)) {
      // Keep the current reading position when the viewport or navigation changes size.
      drag.offset = drag.lastY - top - ratio * travel;
      drag.travel = travel;
      drag.top = top;
    }
  }
  function endDrag(event) {
    if (!drag || (event?.pointerId !== undefined && event.pointerId !== drag.pointerId)) return;
    const pointerId = drag.pointerId;
    drag = null;
    orbit.classList.remove('is-dragging');
    if (traveler.hasPointerCapture(pointerId)) traveler.releasePointerCapture(pointerId);
  }
  function update() {
    queued = false;
    const metrics = measure();
    const { scrollable, ratio, travel } = metrics;
    const disabled = !scrollable || !travel;
    if (disabled) endDrag();
    rebaseDrag(metrics);
    orbit.style.setProperty('--orbit-y', `${(ratio * travel).toFixed(2)}px`);
    orbit.style.setProperty('--orbit-turn', `${motion.matches ? 0 : (ratio * 720).toFixed(2)}deg`);
    orbit.classList.toggle('is-over-footer', !!footer && footer.getBoundingClientRect().top < traveler.getBoundingClientRect().bottom);
    const percent = String(Math.round(ratio * 100));
    orbit.setAttribute('aria-valuenow', percent);
    orbit.setAttribute('aria-valuetext', `${percent}% of page`);
    orbit.setAttribute('aria-disabled', String(disabled));
    orbit.tabIndex = disabled ? -1 : 0;
    if (value) value.textContent = `${percent}%`;
  }
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  }
  traveler.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0 || drag) return;
    const { scrollable, travel, top, ratio } = measure();
    if (!scrollable || !travel) return;
    event.preventDefault();
    orbit.classList.add('is-pointer-focused');
    orbit.focus({ preventScroll: true });
    drag = {
      pointerId: event.pointerId,
      offset: event.clientY - top - ratio * travel,
      lastY: event.clientY,
      travel,
      top,
    };
    traveler.setPointerCapture(event.pointerId);
    orbit.classList.add('is-dragging');
  });
  traveler.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const metrics = measure();
    if (!metrics.scrollable || !metrics.travel) return endDrag();
    rebaseDrag(metrics);
    drag.lastY = event.clientY;
    const ratio = clamp((event.clientY - metrics.top - drag.offset) / metrics.travel);
    // Explicitly override page-level smooth scrolling so the handle follows the pointer.
    scrollTo({ top: ratio * metrics.scrollable, behavior: 'instant' });
    update();
  });
  traveler.addEventListener('pointerup', endDrag);
  traveler.addEventListener('pointercancel', endDrag);
  traveler.addEventListener('lostpointercapture', endDrag);
  addEventListener('blur', () => endDrag());
  orbit.addEventListener('blur', () => orbit.classList.remove('is-pointer-focused'));
  orbit.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const { scrollable, travel } = measure();
    if (!scrollable || !travel) return;
    const positions = {
      ArrowUp: scrollY - 40,
      ArrowDown: scrollY + 40,
      PageUp: scrollY - innerHeight * .9,
      PageDown: scrollY + innerHeight * .9,
      Home: 0,
      End: scrollable,
    };
    if (!Object.hasOwn(positions, event.key)) return;
    event.preventDefault();
    orbit.classList.remove('is-pointer-focused');
    scrollTo({ top: Math.max(0, Math.min(scrollable, positions[event.key])), behavior: 'instant' });
    update();
  });
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  addEventListener('load', schedule);
  addEventListener('pageshow', schedule);
  motion.addEventListener('change', schedule);
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(schedule);
    observer.observe(document.body);
    observer.observe(orbit);
  }
  document.fonts?.ready.then(schedule);
  schedule();
})();
