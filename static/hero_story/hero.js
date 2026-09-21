(() => {
  'use strict';

  const section = document.querySelector('[data-hero-story]');
  if (!section) return;

  const frame3 = section.querySelector('.hero-frame--3');
  const frame4 = section.querySelector('.hero-frame--4');
  const frame5 = section.querySelector('.hero-frame--5');
  const frame6 = section.querySelector('.hero-frame--6');
  const frame7 = section.querySelector('.hero-frame--7');
  const frame8 = section.querySelector('.hero-frame--8');
  const glowC = section.querySelector('#heroGlowC');
  const glowCorrect = section.querySelector('#heroGlowCorrect');
  const scrollCue = section.querySelector('.hero-scroll-cue');

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reducedMotion.matches) {
    // 减少动态模式直接展示第8帧
    if (frame3) frame3.style.opacity = '0';
    if (frame8) frame8.style.opacity = '1';
    return;
  }

  // 检查 GSAP / ScrollTrigger 是否可用，有则使用 Timeline，无则使用轻量原生 RAF 驱动
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: '+=3200',
        pin: true,
        scrub: 0.6,
        anticipatePin: 1,
      },
    });

    // Stage 1 -> Stage 2 (0% - 40%): 3.png -> 4.png (平滑 crossfade + 微缩放)
    tl.to(scrollCue, { opacity: 0, duration: 0.1 }, 0.05);

    tl.to(frame3, { opacity: 0, scale: 0.98, ease: 'power1.inOut', duration: 0.2 }, 0.2);
    tl.fromTo(frame4, { opacity: 0, scale: 1.02 }, { opacity: 1, scale: 1, ease: 'power1.inOut', duration: 0.2 }, 0.2);

    // Stage 2 -> Stage 3 (40% - 60%): 4.png -> 5.png (C/U/C site appears + subtle pulse/glow)
    tl.to(frame4, { opacity: 0, scale: 0.98, ease: 'power1.inOut', duration: 0.2 }, 0.4);
    tl.fromTo(frame5, { opacity: 0, scale: 1.04 }, { opacity: 1, scale: 1, ease: 'power1.out', duration: 0.2 }, 0.4);
    if (glowC) {
      tl.fromTo(glowC, { opacity: 0, scale: 0.6 }, { opacity: 0.8, scale: 1.15, duration: 0.15, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 0.48);
    }

    // Stage 3 -> Stage 4 (60% - 80%): 5.png -> 6.png -> 7.png (correction / straightening)
    tl.to(frame5, { opacity: 0, duration: 0.1 }, 0.6);
    tl.fromTo(frame6, { opacity: 0 }, { opacity: 1, duration: 0.1 }, 0.6);
    if (glowCorrect) {
      tl.fromTo(glowCorrect, { opacity: 0 }, { opacity: 0.7, duration: 0.1 }, 0.62);
    }

    tl.to(frame6, { opacity: 0, duration: 0.1 }, 0.7);
    tl.fromTo(frame7, { opacity: 0 }, { opacity: 1, duration: 0.1 }, 0.7);

    // Stage 5 (80% - 100%): 7.png -> 8.png (future restored state)
    tl.to(frame7, { opacity: 0, duration: 0.1 }, 0.82);
    if (glowCorrect) {
      tl.to(glowCorrect, { opacity: 0, duration: 0.1 }, 0.82);
    }
    tl.fromTo(frame8, { opacity: 0, scale: 1.01 }, { opacity: 1, scale: 1, ease: 'power2.out', duration: 0.18 }, 0.82);

  } else {
    // 原生 Scroll + RAF 高性能降级实现 (完全不需要任何外部依赖)
    let startY = 0;
    let range = 1;
    let ticking = false;

    function measure() {
      startY = section.getBoundingClientRect().top + window.scrollY;
      range = Math.max(1, section.offsetHeight * 2.5);
    }

    function setOpacity(el, val) {
      if (el) el.style.opacity = Math.max(0, Math.min(1, val)).toFixed(4);
    }

    function render() {
      const p = Math.max(0, Math.min(1, (window.scrollY - startY) / range));

      // 0.0 - 0.2: frame 3
      // 0.2 - 0.4: frame 3 -> 4
      // 0.4 - 0.6: frame 4 -> 5
      // 0.6 - 0.7: frame 5 -> 6
      // 0.7 - 0.8: frame 6 -> 7
      // 0.8 - 1.0: frame 7 -> 8
      if (p < 0.2) {
        setOpacity(frame3, 1);
        setOpacity(frame4, 0);
        setOpacity(frame5, 0);
        setOpacity(frame6, 0);
        setOpacity(frame7, 0);
        setOpacity(frame8, 0);
      } else if (p < 0.4) {
        const t = (p - 0.2) / 0.2;
        setOpacity(frame3, 1 - t);
        setOpacity(frame4, t);
        setOpacity(frame5, 0);
        setOpacity(frame6, 0);
        setOpacity(frame7, 0);
        setOpacity(frame8, 0);
      } else if (p < 0.6) {
        const t = (p - 0.4) / 0.2;
        setOpacity(frame3, 0);
        setOpacity(frame4, 1 - t);
        setOpacity(frame5, t);
        setOpacity(frame6, 0);
        setOpacity(frame7, 0);
        setOpacity(frame8, 0);
        if (glowC) setOpacity(glowC, Math.sin(t * Math.PI) * 0.7);
      } else if (p < 0.7) {
        const t = (p - 0.6) / 0.1;
        setOpacity(frame3, 0);
        setOpacity(frame4, 0);
        setOpacity(frame5, 1 - t);
        setOpacity(frame6, t);
        setOpacity(frame7, 0);
        setOpacity(frame8, 0);
      } else if (p < 0.8) {
        const t = (p - 0.7) / 0.1;
        setOpacity(frame3, 0);
        setOpacity(frame4, 0);
        setOpacity(frame5, 0);
        setOpacity(frame6, 1 - t);
        setOpacity(frame7, t);
        setOpacity(frame8, 0);
      } else {
        const t = (p - 0.8) / 0.2;
        setOpacity(frame3, 0);
        setOpacity(frame4, 0);
        setOpacity(frame5, 0);
        setOpacity(frame6, 0);
        setOpacity(frame7, 1 - t);
        setOpacity(frame8, t);
      }

      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(render);
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', measure, { passive: true });
    measure();
    render();
  }
})();
