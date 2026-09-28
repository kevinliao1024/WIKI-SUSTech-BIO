(() => {
  'use strict';

  const scene = document.querySelector('[data-global-scene]');
  if (!scene) return;

  const viewport = scene.querySelector('[data-global-viewport]');
  const copy = scene.querySelector('[data-global-copy]');
  const countWrap = scene.querySelector('[data-global-count-wrap]');
  const count = scene.querySelector('[data-global-count]');
  const alzheimer = scene.querySelector('[data-global-alzheimer]');
  const alzheimerBar = alzheimer?.querySelector('i b');
  const annual = scene.querySelector('[data-global-annual]');
  const globe = scene.querySelector('[data-global-globe]');
  const atmosphere = scene.querySelector('[data-global-atmosphere]');
  const progress = scene.querySelector('[data-global-progress]');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const target = 57000000;
  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const range = (p, start, end) => clamp((p - start) / (end - start));
  const smooth = (t) => {
    const v = clamp(t);
    return v * v * (3 - 2 * v);
  };
  const ease = (t) => 1 - Math.pow(1 - clamp(t), 3);
  let ticking = false;

  function progressFromScroll() {
    const rect = scene.getBoundingClientRect();
    const travel = Math.max(1, rect.height - viewport.offsetHeight);
    return clamp(-rect.top / travel);
  }

  function reveal(node, value, y = 18) {
    if (!node) return;
    node.style.opacity = value.toFixed(3);
    node.style.transform = `translate3d(0, ${(1 - value) * y}px, 0)`;
  }

  function render(forcedProgress) {
    const p = typeof forcedProgress === 'number' ? forcedProgress : progressFromScroll();
    const earthIn = ease(range(p, .015, .12));
    const approach = smooth(range(p, .08, .64));
    const orbitLock = smooth(range(p, .58, .74));
    const copyIn = ease(range(p, .74, .82));
    const countIn = ease(range(p, .8, .88));
    const countProgress = ease(range(p, .79, .94));
    const shareIn = ease(range(p, .9, .96));
    const annualIn = ease(range(p, .94, .99));

    scene.style.setProperty('--global-progress', p.toFixed(4));
    scene.dataset.progress = p.toFixed(4);
    window.__orcaGlobalProgress = p;

    if (globe) {
      const x = 18 - approach * 75;
      const y = 4 - approach * 81;
      const tilt = -4 - approach * 7;
      globe.style.opacity = earthIn.toFixed(3);
      globe.style.transform = `translate(-50%, -50%) translate3d(${x.toFixed(2)}vw, ${y.toFixed(2)}vh, 0) rotate(${tilt.toFixed(2)}deg)`;
      globe.style.filter = `drop-shadow(0 0 ${Math.round(70 + orbitLock * 90)}px rgba(63,91,180,${(.18 + orbitLock * .2).toFixed(3)}))`;
    }
    if (atmosphere) {
      atmosphere.style.opacity = (earthIn * (.05 + approach * .1)).toFixed(3);
      atmosphere.style.transform = `scale(${(.72 + approach * .34).toFixed(4)})`;
    }

    reveal(copy, copyIn, 24);
    reveal(countWrap, countIn, 28);
    reveal(alzheimer, shareIn, 18);
    reveal(annual, annualIn, 16);

    if (count) count.textContent = Math.round(target * countProgress).toLocaleString('en-US');
    if (alzheimerBar) alzheimerBar.style.transform = `scaleX(${shareIn.toFixed(4)})`;
    if (progress) progress.style.transform = `scaleY(${p.toFixed(4)})`;

    scene.dataset.phase = p < .14 ? 'space' : p < .64 ? 'approach' : p < .82 ? 'lights' : 'worldwide-burden';
    ticking = false;
  }

  const preview = Number.parseFloat(new URLSearchParams(window.location.search).get('globalProgress'));
  if (Number.isFinite(preview)) {
    const previewProgress = clamp(preview);
    window.requestAnimationFrame(() => {
      document.documentElement.style.scrollBehavior = 'auto';
      window.scrollTo(0, scene.offsetTop);
      render(previewProgress);
    });
    return;
  }

  if (reduced.matches) {
    if (count) count.textContent = target.toLocaleString('en-US');
    window.__orcaGlobalProgress = 1;
    return;
  }

  function requestRender() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => render());
  }

  window.addEventListener('scroll', requestRender, { passive: true });
  window.addEventListener('resize', requestRender, { passive: true });
  render();
})();
