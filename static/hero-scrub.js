/* Shared scroll-scrub driver for the ORCA hero scenes.
   Each scene supplies a render callback; this file owns measuring, the
   requestAnimationFrame loop, the ?<name>Progress= preview hook and the
   prefers-reduced-motion fallback so the scenes stay small and consistent. */
(() => {
  'use strict';

  const clamp = (value) => Math.max(0, Math.min(1, value));
  const between = (value, start, end) => clamp((value - start) / (end - start));
  const smooth = (value) => value * value * (3 - 2 * value);
  const easeOut = (value) => 1 - Math.pow(1 - value, 3);
  const fadeWindow = (p, enterStart, enterEnd, exitStart, exitEnd) =>
    Math.min(easeOut(between(p, enterStart, enterEnd)), 1 - easeOut(between(p, exitStart, exitEnd)));

  function create(options) {
    const scene = document.querySelector(options.scene);
    if (!scene) return null;

    const viewport = scene.querySelector(options.viewport);
    const refs = {};
    Object.keys(options.refs || {}).forEach((key) => {
      refs[key] = scene.querySelector(options.refs[key]);
    });

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const requested = Number.parseFloat(new URLSearchParams(window.location.search).get(options.param));
    const fixedProgress = Number.isFinite(requested) ? clamp(requested) : null;

    let startY = 0;
    let range = 1;
    let raf = 0;
    let last = -1;
    const set = options.render;

    function draw(progressValue, force) {
      const progress = clamp(progressValue);
      if (!force && Math.abs(progress - last) < .0004) return;
      last = progress;
      scene.style.setProperty(options.property, progress.toFixed(4));
      if (options.progress) options.progress.style.transform = `scaleY(${progress.toFixed(4)})`;
      if (options.label) {
        const next = options.label(progress);
        if (next && options.labelNode.textContent !== next) options.labelNode.textContent = next;
      }
      set(progress, refs);
      if (options.phase) scene.dataset.phase = options.phase(progress);
    }

    function measure() {
      const stickyTop = Number.parseFloat(getComputedStyle(viewport).top) || 0;
      startY = scene.getBoundingClientRect().top + window.scrollY - stickyTop;
      range = Math.max(1, scene.offsetHeight - viewport.offsetHeight);
      draw(fixedProgress ?? (reducedMotion.matches ? 1 : (window.scrollY - startY) / range), true);
    }

    let previousFrame = 0;
    function update(time) {
      raf = 0;
      if (fixedProgress !== null || reducedMotion.matches) return;
      const target = clamp((window.scrollY - startY) / range);
      const elapsed = previousFrame ? Math.min(64, time - previousFrame) : 16;
      previousFrame = time;
      const current = Math.max(0, last);
      const next = current + (target - current) * (1 - Math.exp(-elapsed / 70));
      draw(Math.abs(target - next) < .0005 ? target : next);
      if (Math.abs(target - next) >= .0005) raf = requestAnimationFrame(update);
      else previousFrame = 0;
    }

    function schedule() {
      if (!raf) raf = requestAnimationFrame(update);
    }

    if (fixedProgress === null) window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', () => requestAnimationFrame(measure), { passive: true });
    if (reducedMotion.addEventListener) reducedMotion.addEventListener('change', measure);
    else reducedMotion.addListener(measure);

    if (fixedProgress !== null) {
      scene.scrollIntoView({ block: 'start' });
      draw(fixedProgress, true);
    } else {
      measure();
    }

    return { draw, measure, scene, viewport, reducedMotion, fixedProgress };
  }

  window.OrcaScrub = { create, clamp, between, smooth, easeOut, fadeWindow };
})();
