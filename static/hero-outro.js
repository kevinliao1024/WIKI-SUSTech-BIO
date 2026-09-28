(() => {
  'use strict';

  const scene = document.querySelector('[data-solution-reveal]');
  if (!scene) return;

  const viewport = scene.querySelector('[data-solution-viewport]');
  const carry = scene.querySelector('[data-solution-carry]');
  const scan = scene.querySelector('[data-solution-scan]');
  const base = scene.querySelector('[data-solution-base]');
  const copy = scene.querySelector('[data-solution-copy]');
  const enter = scene.querySelector('[data-solution-enter]');
  const paper = scene.querySelector('[data-solution-paper]');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const range = (p, start, end) => clamp((p - start) / (end - start));
  const ease = (t) => 1 - Math.pow(1 - clamp(t), 3);
  let ticking = false;

  function progressFromScroll() {
    const rect = scene.getBoundingClientRect();
    const travel = Math.max(1, rect.height - viewport.offsetHeight);
    return clamp(-rect.top / travel);
  }

  function render(forcedProgress) {
    const p = typeof forcedProgress === 'number' ? forcedProgress : progressFromScroll();
    const transfer = ease(range(p, .04, .38));
    const scanMove = ease(range(p, .12, .52));
    const baseIn = ease(range(p, .22, .48));
    const baseOut = 1 - ease(range(p, .5, .67));
    const copyIn = ease(range(p, .46, .72));
    const enterIn = ease(range(p, .66, .82));
    const wipe = ease(range(p, .88, 1));

    if (carry) {
      carry.style.opacity = (.78 * (1 - transfer)).toFixed(3);
      carry.style.transform = `translate3d(-50%, -50%, 0) scale(${1 + transfer * .18})`;
      carry.style.filter = `brightness(0) invert(1) blur(${transfer * 5}px)`;
    }
    if (scan) {
      scan.style.opacity = Math.sin(scanMove * Math.PI).toFixed(3);
      scan.style.left = `${14 + scanMove * 72}%`;
    }
    if (base) {
      base.style.opacity = Math.min(baseIn, baseOut).toFixed(3);
      base.style.transform = `translate3d(-50%, -50%, 0) scale(${.6 + baseIn * .4 + (1 - baseOut) * .3})`;
    }
    if (copy) {
      copy.style.opacity = (copyIn * (1 - wipe)).toFixed(3);
      copy.style.transform = `translate3d(0, ${(1 - copyIn) * 30 - wipe * 24}px, 0)`;
    }
    if (enter) {
      enter.style.opacity = (enterIn * (1 - wipe)).toFixed(3);
      enter.style.transform = `translate3d(-50%, ${(1 - enterIn) * 18}px, 0)`;
    }
    if (paper) paper.style.transform = `scaleY(${wipe})`;
    scene.dataset.phase = p < .44 ? 'correction' : p < .88 ? 'orca' : 'handoff';
    ticking = false;
  }

  const preview = Number.parseFloat(new URLSearchParams(window.location.search).get('solutionProgress'));
  if (Number.isFinite(preview)) {
    const previewProgress = clamp(preview);
    window.requestAnimationFrame(() => {
      document.documentElement.style.scrollBehavior = 'auto';
      window.scrollTo(0, scene.offsetTop);
      render(previewProgress);
    });
    return;
  }

  if (reduced.matches) return;
  function requestRender() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => render());
  }
  window.addEventListener('scroll', requestRender, { passive: true });
  window.addEventListener('resize', requestRender, { passive: true });
  render();
})();
