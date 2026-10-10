(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reveals = document.querySelectorAll('.reveal');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach((node) => node.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver((entries, instance) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        instance.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach((node) => observer.observe(node));
  }

  const progress = document.querySelector('[data-story-progress] i');
  const progressBar = document.querySelector('[data-story-progress]');
  const backToTop = document.querySelector('[data-back-to-top]');

  const updateScrollUI = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = scrollable > 0 ? Math.min(1, window.scrollY / scrollable) : 0;
    if (progress) progress.style.width = `${ratio * 100}%`;
    if (progressBar) progressBar.setAttribute('aria-valuenow', String(Math.round(ratio * 100)));
    if (backToTop) backToTop.classList.toggle('is-visible', window.scrollY > 700);
  };

  window.addEventListener('scroll', updateScrollUI, { passive: true });
  updateScrollUI();

  if (backToTop) {
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));
  }

  const navigation = document.querySelector('.whale-navigation');
  const groups = [...document.querySelectorAll('[data-rna-nav]')];
  const menuMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let menuEffect;
  let closeTimer;

  function stopMenuParticles(panel) {
    if (!menuEffect || (panel && menuEffect.panel !== panel)) return;
    cancelAnimationFrame(menuEffect.frame);
    menuEffect.canvas.remove();
    menuEffect.panel.classList.remove('is-gathering');
    menuEffect.panel.style.removeProperty('--rna-reveal');
    menuEffect = null;
  }

  function gatherMenu(panel) {
    stopMenuParticles();
    if (menuMotion.matches || document.hidden) return;
    const box = panel.getBoundingClientRect();
    const width = Math.round(box.width), height = Math.round(box.height);
    if (!width || !height) return;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const mask = document.createElement('canvas');
    const ink = mask.getContext('2d', { willReadFrequently: true });
    if (!context || !ink) return;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    canvas.className = 'rna-menu__particles';
    canvas.setAttribute('aria-hidden', 'true');
    context.scale(ratio, ratio);
    mask.width = width;
    mask.height = height;
    ink.fillStyle = '#fff';
    ink.textBaseline = 'top';

    // Sample the real glyph positions, including labels that wrap on mobile.
    // Only sample the visible front face of editable bases; the U back face
    // should not become a second overlapping glyph in the particle mask.
    for (const label of panel.querySelectorAll('.rna-branch__label, [data-rna-glyph]')) {
      const style = getComputedStyle(label);
      ink.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      for (const node of label.childNodes) {
        if (node.nodeType !== Node.TEXT_NODE) continue;
        const range = document.createRange();
        for (let i = 0; i < node.length; i++) {
          if (!node.textContent[i].trim()) continue;
          range.setStart(node, i);
          range.setEnd(node, i + 1);
          const letter = range.getBoundingClientRect();
          ink.fillText(node.textContent[i], letter.left - box.left, letter.top - box.top);
        }
      }
    }
    const pixels = ink.getImageData(0, 0, width, height).data;
    const targets = [];
    for (let y = 1; y < height - 1; y += 2) {
      for (let x = 1; x < width - 1; x += 2) {
        if (pixels[(y * width + x) * 4 + 3] > 80) targets.push({ x, y, color: '#9fd0ff' });
      }
    }
    for (const path of panel.querySelectorAll('.rna-menu__lead path, .rna-menu__backbone path')) {
      const matrix = path.getScreenCTM();
      if (!matrix) continue;
      for (let d = 0, length = path.getTotalLength(); d <= length; d += 5) {
        const point = path.getPointAtLength(d).matrixTransform(matrix);
        targets.push({ x: point.x - box.left, y: point.y - box.top, color: '#5cffb8' });
      }
    }
    for (const base of panel.querySelectorAll('.rna-branch__base')) {
      const r = base.getBoundingClientRect();
      for (let a = 0; a < Math.PI * 2; a += .28) {
        targets.push({ x: r.left - box.left + r.width / 2 + Math.cos(a) * r.width / 2,
          y: r.top - box.top + r.height / 2 + Math.sin(a) * r.height / 2, color: '#ff6a55' });
      }
    }
    for (let x = 4; x < width - 4; x += 9) {
      targets.push({ x, y: 2, color: '#9fd0ff' }, { x, y: height - 3, color: '#9fd0ff' });
    }
    for (let y = 5; y < height - 5; y += 9) {
      targets.push({ x: 2, y, color: '#9fd0ff' }, { x: width - 3, y, color: '#9fd0ff' });
    }
    const stride = Math.max(1, Math.ceil(targets.length / 1100));
    const particles = targets.filter((point, index) => index % stride === 0 && point.y >= 0 && point.y <= height).map((point, index) => {
      const side = index % 4;
      return { ...point, sx: side === 0 ? -12 : side === 1 ? width + 12 : Math.random() * width,
        sy: side === 2 ? -12 : side === 3 ? height + 12 : Math.random() * height,
        delay: Math.random() * .13, bend: (Math.random() - .5) * 40 };
    });
    panel.append(canvas);
    panel.style.setProperty('--rna-reveal', '0');
    panel.classList.add('is-gathering');
    const effect = { panel, canvas, frame: 0 };
    menuEffect = effect;
    const started = performance.now();
    function frame(now) {
      if (menuEffect !== effect) return;
      if (panel.hidden || document.hidden || menuMotion.matches) { stopMenuParticles(panel); return; }
      const progress = Math.min(1, (now - started) / 720);
      if (progress === 1) { stopMenuParticles(panel); return; }
      context.clearRect(0, 0, width, height);
      const reveal = Math.max(0, Math.min(1, (progress - .52) / .4));
      panel.style.setProperty('--rna-reveal', String(reveal));
      context.globalAlpha = Math.min(1, progress * 8) * (1 - reveal);
      for (const dot of particles) {
        const travel = Math.max(0, Math.min(1, (progress - dot.delay) / .6));
        const ease = 1 - Math.pow(1 - travel, 3);
        const curve = Math.sin(travel * Math.PI) * dot.bend;
        context.fillStyle = dot.color;
        context.beginPath();
        context.arc(dot.sx + (dot.x - dot.sx) * ease + curve,
          dot.sy + (dot.y - dot.sy) * ease, .85 + (1 - travel) * .65, 0, Math.PI * 2);
        context.fill();
      }
      effect.frame = requestAnimationFrame(frame);
    }
    effect.frame = requestAnimationFrame(frame);
  }

  function closeGroup(group) {
    const panel = group.querySelector('.rna-menu');
    stopMenuParticles(panel);
    group.classList.remove('is-open');
    group.querySelector('.rna-toggle').setAttribute('aria-expanded', 'false');
    panel.hidden = true;
  }
  function closeAll(except) {
    groups.forEach((group) => {
      if (group === except) return;
      closeGroup(group);
    });
  }
  function open(group) {
    clearTimeout(closeTimer);
    closeAll(group);
    if (group.classList.contains('is-open')) return;
    group.classList.add('is-open');
    group.querySelector('.rna-toggle').setAttribute('aria-expanded', 'true');
    const panel = group.querySelector('.rna-menu');
    panel.hidden = false;
    const box = panel.getBoundingClientRect();
    const whale = group.querySelector('.rna-toggle').getBoundingClientRect();
    const origin = Math.max(16, Math.min(box.width - 16, whale.left + whale.width / 2 - box.left));
    panel.querySelector('.rna-menu__lead path').setAttribute('d', `M${origin} 0 C${origin} 14 46 0 46 18`);
    try { gatherMenu(panel); } catch { stopMenuParticles(panel); }
  }
  groups.forEach((group) => {
    const toggle = group.querySelector('.rna-toggle');
    const panel = group.querySelector('.rna-menu');
    group.addEventListener('pointerenter', (event) => {
      if (event.pointerType !== 'touch') open(group);
    });
    group.addEventListener('pointerleave', () => {
      closeTimer = setTimeout(() => {
        if (group.classList.contains('is-open') && !group.matches(':hover') && !group.contains(document.activeElement)) closeAll();
      }, 240);
    });
    panel.addEventListener('pointerenter', () => clearTimeout(closeTimer));
    panel.addEventListener('focusin', () => stopMenuParticles(panel));
    toggle.addEventListener('click', (event) => {
      if (event.pointerType === 'touch' && group.classList.contains('is-open')) closeAll();
      else open(group);
    });
    group.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeAll();
        toggle.focus();
      } else if (event.target === toggle && event.key === 'ArrowDown') {
        event.preventDefault();
        open(group);
        panel.querySelector('a').focus();
      }
    });
    group.addEventListener('focusout', () => {
      setTimeout(() => {
        if (!group.contains(document.activeElement) && !group.matches(':hover')) {
          closeGroup(group);
        }
      }, 0);
    });
  });
  document.addEventListener('pointerdown', (event) => {
    if (navigation && !navigation.contains(event.target)) closeAll();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeAll();
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) closeAll(); });
  window.addEventListener('resize', () => stopMenuParticles());
  menuMotion.addEventListener?.('change', () => stopMenuParticles());
})();
