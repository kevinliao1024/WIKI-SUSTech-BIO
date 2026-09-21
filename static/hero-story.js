(() => {
  'use strict';

  const hero = document.querySelector('[data-hero-storyboard]');
  if (!hero) return;

  const track = hero.querySelector('#heroStoryTrack');
  const img = hero.querySelector('#heroStoryImage');
  const indicatorBar = hero.querySelector('#indicatorBar');
  const indicatorScene = hero.querySelector('#indicatorScene');
  const cue = hero.querySelector('#heroStoryCue');

  const SCENE_NAMES = [
    'Scene 01 · Highlighted C',
    'Scene 02 · mRNA U-C-C Sequence',
    'Scene 03 · Abnormal Cell in Tissue',
    'Scene 04 · Microglia Clearance Effort',
    'Scene 05 · Clearance Overwhelmed',
    'Scene 06 · Synaptic & Tissue Strain',
    'Scene 07 · Individual & Memory Impact',
    'Scene 08 · Global Patient Reality',
  ];

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  let startY = 0;
  let scrollDistance = 5000;
  let maxTranslateY = 0;
  let isTicking = false;

  function measure() {
    if (!img) return;
    const viewportHeight = hero.querySelector('.hero-story__viewport').offsetHeight;
    const imgHeight = img.offsetHeight;
    // 确保长图底部完整到达视口底部
    maxTranslateY = Math.max(0, imgHeight - viewportHeight);
    startY = hero.getBoundingClientRect().top + window.scrollY;
  }

  function updateScene(p) {
    if (indicatorBar) {
      indicatorBar.style.width = `${Math.max(5, p * 100)}%`;
    }

    // 0 ~ 1 均分 8 个 Scene 区间
    const sceneIndex = Math.min(7, Math.floor(p * 8));
    if (indicatorScene) {
      indicatorScene.textContent = SCENE_NAMES[sceneIndex];
    }

    if (cue) {
      cue.style.opacity = p > 0.04 ? '0' : '1';
    }
  }

  // 检查 GSAP + ScrollTrigger
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && !reducedMotion.matches) {
    gsap.registerPlugin(ScrollTrigger);

    ScrollTrigger.create({
      trigger: hero,
      start: 'top top',
      end: '+=5400',
      pin: true,
      scrub: 0.6,
      anticipatePin: 1,
      onRefresh: measure,
      onUpdate: (self) => {
        const p = self.progress;
        const currentY = -p * maxTranslateY;

        // 核心：长图 Y 轴滚动平移
        gsap.set(track, { y: currentY });

        // 每一幕经过视口中心时的微弱弹性呼吸与逐渐浮现质感
        const scenePhase = (p * 8) % 1;
        const blurAmount = Math.sin(scenePhase * Math.PI) * 1.5;
        const scaleAmount = 1 + Math.sin(scenePhase * Math.PI) * 0.015;

        gsap.set(img, {
          scale: scaleAmount,
          filter: `blur(${blurAmount * 0.4}px)`,
        });

        updateScene(p);
      },
    });

  } else {
    // 原生 Scroll + RAF 高性能降级实现（完全免依赖、100% 稳定运行）
    let isPinned = false;

    function render() {
      const scrollY = window.scrollY;
      const p = Math.max(0, Math.min(1, (scrollY - startY) / scrollDistance));

      if (maxTranslateY === 0) measure();

      const currentY = -p * maxTranslateY;
      if (track) {
        track.style.transform = `translate3d(0, ${currentY}px, 0)`;
      }

      updateScene(p);
      isTicking = false;
    }

    function onScroll() {
      if (!isTicking) {
        window.requestAnimationFrame(render);
        isTicking = true;
      }
    }

    // 简单设置高度以允许滚动
    hero.style.height = `${scrollDistance + window.innerHeight}px`;
    const viewport = hero.querySelector('.hero-story__viewport');
    viewport.style.position = 'sticky';
    viewport.style.top = 'var(--nav-h, 76px)';

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', measure, { passive: true });
    img.addEventListener('load', measure);

    measure();
    render();
  }
})();
