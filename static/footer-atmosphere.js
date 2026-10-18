/* Small, independent footer ambience. Values below control its random range. */
(() => {
  const footer = document.querySelector('[data-school-footer]');
  const layer = footer?.querySelector('.footer-glints');
  if (!layer) return;
  const config = { followPixels: 22, driftPixels: 22, minSpeed: .12, maxSpeed: .28, edgePercent: 7 };
  const random = (min, max) => min + Math.random() * (max - min);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const particles = [...layer.querySelectorAll('.footer-glint')].map(element => {
    element.style.setProperty('--x', `${random(config.edgePercent, 100 - config.edgePercent)}%`);
    element.style.setProperty('--y', `${random(8, 92)}%`);
    element.style.setProperty('--size', `${random(5, element.classList.contains('footer-glint--bubble') ? 16 : 11)}px`);
    element.style.setProperty('--delay', `${-random(0, 12)}s`);
    return { element, phase: random(0, Math.PI * 2), speed: random(config.minSpeed, config.maxSpeed), radius: random(7, config.driftPixels) };
  });
  let visible = false, frame = 0, last = 0, elapsed = 0;
  let targetX = 0, targetY = 0, followX = 0, followY = 0;
  let bounds;
  function measure() {
    bounds = footer.getBoundingClientRect();
    const community = footer.querySelector('.footer-sponsors');
    // Restrict the scene to the navy area above the white community band.
    const height = community ? community.getBoundingClientRect().top - bounds.top : bounds.height;
    layer.style.height = `${Math.max(0, height)}px`;
  }
  function tick(now) {
    frame = 0;
    if (!visible || document.hidden || reduced.matches) { last = 0; return; }
    const delta = last ? Math.min((now - last) / 1000, .064) : 0;
    last = now;
    elapsed += delta;
    const ease = 1 - Math.exp(-delta * 3);
    followX += (targetX - followX) * ease;
    followY += (targetY - followY) * ease;
    layer.style.setProperty('--follow-x', `${followX.toFixed(2)}px`);
    layer.style.setProperty('--follow-y', `${followY.toFixed(2)}px`);
    particles.forEach(({ element, phase, speed, radius }) => {
      const t = elapsed * speed;
      // Incommensurate waves give each ornament its own smooth wandering path.
      const x = radius * (Math.sin(t + phase) + .32 * Math.sin(t * 1.73 + phase * 2));
      const y = radius * (Math.cos(t * .79 + phase) + .38 * Math.sin(t * 1.31));
      element.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
    });
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    if (visible && !document.hidden && !reduced.matches) {
      if (!frame) frame = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(frame); frame = 0; last = 0;
      if (reduced.matches) {
        layer.style.setProperty('--follow-x', '0px');
        layer.style.setProperty('--follow-y', '0px');
        particles.forEach(({ element }) => { element.style.transform = ''; });
        targetX = targetY = followX = followY = 0;
      }
    }
  }
  footer.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch' || reduced.matches || !visible) return;
    // Rect positions change as the page scrolls; sizes are measured on resize.
    bounds = footer.getBoundingClientRect();
    const height = layer.clientHeight || bounds.height;
    targetX = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1)) * config.followPixels;
    targetY = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / height * 2 - 1)) * config.followPixels;
  }, { passive: true });
  footer.addEventListener('pointerleave', () => { targetX = targetY = 0; });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => { visible = entries.some(entry => entry.isIntersecting); sync(); }).observe(footer);
  } else { visible = true; }
  if ('ResizeObserver' in window) new ResizeObserver(measure).observe(footer);
  window.addEventListener('resize', measure, { passive: true });
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', sync);
  measure(); sync();
})();
