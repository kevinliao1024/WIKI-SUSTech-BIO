(() => {
  'use strict';

  const hero = document.querySelector('[data-hero-scene]');
  if (!hero) return;

  const pin = hero.querySelector('[data-hero-pin]');
  const waveStatic = hero.querySelector('[data-wave-static]');
  const waveDeform = hero.querySelector('[data-wave-deform]');
  const segments = [...hero.querySelectorAll('[data-wave-segment]')].map((node) => ({
    node,
    shift: Number(node.dataset.shift || 0),
    rotation: Number(node.dataset.rotation || 0),
  }));

  const marker = (selector) => {
    const node = hero.querySelector(selector);
    return {
      node,
      crop: node ? node.querySelector('[data-marker-crop]') : null,
    };
  };

  const markers = {
    center: marker('.mrna-hero__asset--center'),
    left: marker('.mrna-hero__asset--left'),
    right: marker('.mrna-hero__asset--right'),
  };

  const debugProgress = hero.querySelector('[data-hero-progress]');
  const debugBeat = hero.querySelector('[data-hero-beat]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // 支持 ?debugScene=1 以及 ?debugHero=1
  const searchParams = new URLSearchParams(window.location.search);
  const debug = searchParams.get('debugScene') === '1' || searchParams.get('debugHero') === '1';

  const clamp = (value) => Math.max(0, Math.min(1, value));
  const rangeProgress = (value, start, end) => clamp((value - start) / (end - start));
  const smooth = (value) => value * value * (3 - 2 * value);
  const easeOutCubic = (value) => 1 - (1 - value) ** 3;
  const mix = (start, end, amount) => start + (end - start) * amount;

  let startY = 0;
  let scrollRange = 1;
  let renderedProgress = -1;
  let frame = 0;
  let resizeFrame = 0;
  let motionReduced = reducedMotion.matches;

  /**
   * 严格对照任务书的 3 个 Beat 时间轴:
   * Beat 1 (0.00–0.30): 只显示波浪状 mRNA
   * Beat 2 (0.30–0.62): 显现 C / U / C 标记点 (mainC: 0.30-0.42, sideU: 0.40-0.52, sideC: 0.48-0.60)
   * Beat 3 (0.62–1.00): RNA 逐渐拉直 / 变平 (0.62-1.00)
   */
  function beatLabelFor(p) {
    if (p < 0.30) return 'Beat 1 (Wavy mRNA only)';
    if (p < 0.42) return 'Beat 2a (mainC appearing)';
    if (p < 0.52) return 'Beat 2b (sideU appearing)';
    if (p < 0.62) return 'Beat 2c (sideC appearing · all markers settled)';
    return 'Beat 3 (Straightening RNA)';
  }

  function setMarkerReveal(item, progress, start, end, isCenter = false) {
    if (!item || !item.crop) return;
    const reveal = smooth(rangeProgress(progress, start, end));

    let scale;
    if (isCenter) {
      // mainC 略带弹性入场
      const peak = 0.75;
      scale = reveal <= peak
        ? mix(0.2, 1.08, easeOutCubic(reveal / peak))
        : mix(1.08, 1.0, smooth((reveal - peak) / (1 - peak)));
    } else {
      scale = mix(0.2, 1.0, easeOutCubic(reveal));
    }

    item.crop.style.opacity = reveal.toFixed(4);
    item.crop.style.transform = `scale(${scale.toFixed(4)})`;
  }

  function render(progress, force = false) {
    const next = clamp(progress);
    if (!force && Math.abs(next - renderedProgress) < 0.0001) return;
    renderedProgress = next;

    // --- Beat 2: 标记点显现 (0.30 - 0.62) ---
    // mainC: 0.30 - 0.42
    setMarkerReveal(markers.center, next, 0.30, 0.42, true);
    // sideU: 0.40 - 0.52
    setMarkerReveal(markers.left, next, 0.40, 0.52, false);
    // sideC: 0.48 - 0.60
    setMarkerReveal(markers.right, next, 0.48, 0.60, false);

    // --- Beat 3: RNA 逐渐拉直 / 变平 (0.62 - 1.00) ---
    // 在 0.62 之前完全保持波浪态；从 0.62 到 1.00 逐渐切换为拉直分段并完成旋转/位移插值
    const straighten = smooth(rangeProgress(next, 0.62, 1.00));
    const deformCrossfade = smooth(rangeProgress(next, 0.60, 0.66));

    if (waveStatic && waveDeform) {
      waveStatic.style.opacity = (1 - deformCrossfade).toFixed(4);
      waveDeform.style.opacity = deformCrossfade.toFixed(4);
    }

    // 分段执行反向旋转与平移实现整体变平拉直
    segments.forEach(({ node, shift, rotation }) => {
      const curShift = (shift * straighten).toFixed(4);
      const curRot = (rotation * straighten).toFixed(4);
      node.style.transform = `translate3d(0, ${curShift}px, 0) rotate(${curRot}deg)`;
    });

    // 标记点随 RNA 整体拉直有微小的连带轻微贴合 (保持视觉不飘移)
    if (markers.left && markers.left.node) {
      markers.left.node.style.transform = `translate3d(0, ${(10 * straighten).toFixed(3)}px, 0)`;
    }
    if (markers.right && markers.right.node) {
      markers.right.node.style.transform = `translate3d(0, ${(-8 * straighten).toFixed(3)}px, 0)`;
    }

    // --- Debug / 状态绑定 ---
    hero.dataset.progress = next.toFixed(4);
    if (debugProgress) debugProgress.textContent = next.toFixed(3);
    if (debugBeat) debugBeat.textContent = beatLabelFor(next);
  }

  function progressFromScroll() {
    return clamp((window.scrollY - startY) / scrollRange);
  }

  function measure() {
    const stickyTop = Number.parseFloat(window.getComputedStyle(pin).top) || 0;
    startY = hero.getBoundingClientRect().top + window.scrollY - stickyTop;
    scrollRange = Math.max(1, hero.offsetHeight - pin.offsetHeight);
    render(motionReduced ? 1 : progressFromScroll(), true);
  }

  function scheduleRender() {
    if (motionReduced || frame) return;
    frame = window.requestAnimationFrame(() => {
      frame = 0;
      render(progressFromScroll());
    });
  }

  function scheduleMeasure() {
    if (resizeFrame) return;
    resizeFrame = window.requestAnimationFrame(() => {
      resizeFrame = 0;
      measure();
    });
  }

  function configureMotion() {
    motionReduced = reducedMotion.matches;
    hero.classList.add('is-motion-ready');
    hero.classList.toggle('is-reduced-motion', motionReduced);
    scheduleMeasure();
  }

  hero.classList.toggle('is-debug', debug);
  hero.dataset.debug = String(debug);

  window.addEventListener('scroll', scheduleRender, { passive: true });
  window.addEventListener('resize', scheduleMeasure, { passive: true });

  if (reducedMotion.addEventListener) {
    reducedMotion.addEventListener('change', configureMotion);
  } else {
    reducedMotion.addListener(configureMotion);
  }

  configureMotion();
})();
