/* Team opening controller: progressive, package-gated and package-aware. */
(() => {
  'use strict';
  const opening = document.querySelector('[data-team-opening]');
  if (!opening) return;
  const scrollRoot = document.documentElement;
  scrollRoot.style.setProperty('--team-opening-scroll-top', `${-window.scrollY}px`);
  scrollRoot.classList.add('team-opening-scroll-locked');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const packageButton = opening.querySelector('[data-team-package]');
  const packageFrames = (packageButton?.dataset.teamPackageFrames || '').split('|').filter(Boolean);
  const frameCache = new Map(packageFrames.map(source => {
    const cached = new Image();
    cached.src = source;
    cached.decode?.().catch(() => {});
    return [source, cached];
  }));
  const phaseTimers = [];
  let startTimer;
  let compileTimer;
  let frameTimer;
  let compiledLines = [];

  const clearTimers = () => {
    clearTimeout(startTimer);
    clearTimeout(frameTimer);
    clearInterval(compileTimer);
    phaseTimers.splice(0).forEach(clearTimeout);
  };
  const setPhase = phase => {
    if (opening.hidden) return;
    opening.dataset.phase = phase;
    document.body.classList.toggle('team-page--opening-blur', ['preview', 'title', 'package'].includes(phase));
  };
  const createParticleBurst = (deck, origin) => {
    if (!deck || motion.matches) return;
    const cards = [...deck.querySelectorAll('.member-card')].map(card => card.getBoundingClientRect())
      .filter(rect => rect.width && rect.height && rect.bottom > -80 && rect.top < innerHeight + 80);
    if (!cards.length) return;
    const field = document.createElement('div');
    field.className = 'team-particle-field';
    field.setAttribute('aria-hidden', 'true');
    const pattern = [
      [.08, .12], [.5, .08], [.92, .12],
      [.14, .4], [.5, .38], [.86, .4],
      [.08, .84], [.5, .86], [.92, .84],
      [.28, .6], [.72, .6], [.5, .98],
    ];
    const colors = ['#E9E8FF', '#F58F9C', '#BFA8FF', '#FFFFFF'];
    const originX = origin ? origin.left + origin.width / 2 : innerWidth / 2;
    const originY = origin ? origin.top + origin.height / 2 : innerHeight / 2;
    field.style.setProperty('--particle-origin-x', `${originX}px`);
    field.style.setProperty('--particle-origin-y', `${originY}px`);
    cards.forEach(rect => pattern.forEach(([x, y], index) => {
      const particle = document.createElement('i');
      particle.style.setProperty('--particle-x', `${rect.left + rect.width * x - originX}px`);
      particle.style.setProperty('--particle-y', `${rect.top + rect.height * y - originY}px`);
      particle.style.setProperty('--particle-delay', `${index * 24}ms`);
      particle.style.setProperty('--particle-size', `${3 + (index % 3)}px`);
      particle.style.setProperty('--particle-color', colors[index % colors.length]);
      field.appendChild(particle);
    }));
    document.body.appendChild(field);
    requestAnimationFrame(() => field.classList.add('is-active'));
    setTimeout(() => field.remove(), 1700);
  };
  const listeners = new AbortController();
  const options = { signal: listeners.signal };

  const finish = ({ packageOpen = false } = {}) => {
    if (opening.hidden) return;
    const restoreFocus = opening.contains(document.activeElement);
    clearTimers();
    scrollRoot.classList.remove('team-opening-scroll-locked');
    scrollRoot.style.removeProperty('--team-opening-scroll-top');
    document.body.classList.remove('team-page--opening-blur');
    const deck = packageOpen ? document.querySelector('.team-deck') : null;
    const header = document.querySelector('[data-team-package-header]');
    if (packageOpen) {
      compiledLines.forEach(({ node, text }) => {
        node.hidden = false;
        node.textContent = text;
        node.classList.remove('is-typing');
      });
      const compilation = opening.querySelector('[data-team-compile]');
      const button = opening.querySelector('[data-team-package]');
      button?.classList.remove('is-unpacking');
      button?.classList.remove('is-complete');
      button?.setAttribute('aria-busy', 'false');
      button?.setAttribute('aria-label', 'ORCA team package unpacked');
      const status = button?.querySelector('[data-team-package-status]');
      if (status) status.textContent = 'ORCA team package unpacked.';
      if (compilation) document.querySelector('[data-team-package-mount]')?.replaceChildren(compilation);
      document.body.classList.add('team-package-open');
      deck?.classList.add('team-deck--package-open');
      document.querySelectorAll('.team-deck .member-card').forEach((card, index) => {
        card.style.setProperty('--package-index', String(index));
      });
    }
    setPhase('clear');
    opening.hidden = true;
    listeners.abort();
    motion.removeEventListener('change', motionChanged);
    if (restoreFocus) header?.focus({ preventScroll: true });
    if (packageOpen) {
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
        header?.querySelectorAll('.team-opening__compile-code').forEach(panel => {
          panel.scrollTo({ top: panel.scrollHeight, behavior: 'instant' });
        });
        requestAnimationFrame(() => createParticleBurst(deck, header?.querySelector('.team-opening__pkg-art')?.getBoundingClientRect()));
      });
    }
  };

  const motionChanged = () => {
    if (motion.matches && !opening.hidden) {
      if (opening.dataset.phase === 'package') {
        finish({ packageOpen: true });
        return;
      }
      clearTimers();
      setPhase('title');
    }
  };
  const startTimeline = () => {
    if (opening.hidden) return;
    if (document.documentElement.matches('[data-wh-cover], [data-wh-busy]')) {
      startTimer = setTimeout(startTimeline, 120);
      return;
    }
    if (motion.matches) {
      setPhase('title');
      return;
    }
    phaseTimers.push(setTimeout(() => setPhase('preview'), 2200));
    phaseTimers.push(setTimeout(() => setPhase('title'), 3550));
  };

  packageButton?.addEventListener('click', event => {
    const button = event.currentTarget;
    const frame = button.querySelector('[data-team-package-frame]');
    const status = button.querySelector('[data-team-package-status]');
    const frames = (button.dataset.teamPackageFrames || '').split('|').filter(Boolean);
    const sequence = [...frames, ...frames];
    if (!frame || !sequence.length || button.disabled) return;
    clearTimers();
    const compilation = opening.querySelector('[data-team-compile]');
    const lines = [...opening.querySelectorAll('[data-team-compile-order]')]
      .sort((a, b) => Number(a.dataset.teamCompileOrder) - Number(b.dataset.teamCompileOrder))
      .map(node => ({ node, text: node.textContent.trim() }));
    compiledLines = lines;
    compilation?.classList.add('is-active');
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    button.classList.add('is-unpacking');
    if (status) status.textContent = 'Compiling ORCA_TEAM.skill…';
    setPhase('package');

    if (motion.matches) {
      lines.forEach(({ node, text }) => { node.hidden = false; node.textContent = text; });
      phaseTimers.push(setTimeout(() => finish({ packageOpen: true }), 350));
      return;
    }

    const holdDuration = 600;
    const outputSpeed = 1.1 * 1.3;
    const outputDuration = (Math.max(8000, lines.length * 260 + holdDuration) - holdDuration) / outputSpeed;
    const duration = outputDuration + holdDuration;
    const lineInterval = outputDuration / Math.max(lines.length, 1);
    const typingDuration = Math.min(190 / outputSpeed, lineInterval * .75);
    const startedAt = performance.now();
    let codeComplete = false;
    let framesComplete = false;
    let completionStarted = false;
    const completeWhenReady = () => {
      if (!codeComplete || !framesComplete || completionStarted || opening.hidden) return;
      completionStarted = true;
      button.setAttribute('aria-busy', 'false');
      button.classList.remove('is-unpacking');
      button.classList.add('is-complete');
      if (status) status.textContent = 'Unpacked';
      phaseTimers.push(setTimeout(() => finish({ packageOpen: true }), 1400));
    };
    const showFrame = index => {
      if (opening.hidden) return;
      let ready = false;
      const holdFrame = () => {
        if (ready || opening.hidden) return;
        ready = true;
        frame.removeEventListener('load', holdFrame);
        frame.removeEventListener('error', holdFrame);
        clearTimeout(frameTimer);
        frameTimer = setTimeout(() => {
          if (index + 1 < sequence.length) showFrame(index + 1);
          else {
            framesComplete = true;
            completeWhenReady();
          }
        }, duration / sequence.length);
      };
      frame.addEventListener('load', holdFrame, options);
      frame.addEventListener('error', holdFrame, options);
      // A missing image must not keep the page locked indefinitely.
      frameTimer = setTimeout(holdFrame, 2000);
      frame.src = frameCache.get(sequence[index])?.src || sequence[index];
      if (frame.complete) holdFrame();
    };
    const advance = () => {
      const elapsed = performance.now() - startedAt;
      const scrollPanels = new Set();
      lines.forEach(({ node, text }, index) => {
        const lineElapsed = elapsed - index * lineInterval;
        if (lineElapsed < 0) return;
        if (node.hidden) {
          node.hidden = false;
          scrollPanels.add(node.parentElement);
        }
        const length = Math.min(text.length, Math.max(1, Math.ceil(text.length * lineElapsed / typingDuration)));
        const typed = text.slice(0, length);
        if (node.textContent !== typed) {
          node.textContent = typed;
          if (length === text.length) scrollPanels.add(node.parentElement);
        }
        node.classList.toggle('is-typing', length < text.length);
      });
      scrollPanels.forEach(panel => panel.scrollTo({ top: panel.scrollHeight, behavior: 'smooth' }));
      if (elapsed >= duration) {
        clearInterval(compileTimer);
        codeComplete = true;
        completeWhenReady();
      }
    };
    advance();
    compileTimer = setInterval(advance, 32);
    showFrame(0);
  }, options);
  motion.addEventListener('change', motionChanged);
  startTimeline();
})();
