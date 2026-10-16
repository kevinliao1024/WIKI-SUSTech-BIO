/* A conceptual process walkthrough; no model values or biological time axis. */
(() => {
  'use strict';
  document.querySelectorAll('[data-delivery-body]').forEach(root => {
    if (root.dataset.bodyInitialized) return;
    const buttons = [...root.querySelectorAll('[data-body-stage]')];
    const descriptions = [...root.querySelectorAll('[data-body-description]')];
    const playButton = root.querySelector('[data-body-play]');
    const previous = root.querySelector('[data-body-previous]');
    const next = root.querySelector('[data-body-next]');
    const position = root.querySelector('[data-body-position]');
    const liveDescription = root.querySelector('[data-body-descriptions]');
    if (!buttons.length || !playButton || !previous || !next || !liveDescription) return;
    const tracks = [...root.querySelectorAll('[data-body-track]')].map(group => {
      const path = group.querySelector('[data-body-path]');
      return {group, stage: Number(group.dataset.bodyTrack), path,
        dots: [...group.querySelectorAll('[data-body-dot]')], length: path.getTotalLength()};
    });
    const emphasis = [...root.querySelectorAll('[data-body-emphasis]')];
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let stage = 0;
    let playing = false;
    let visible = !('IntersectionObserver' in window);
    let frame = 0;
    let lastTick = 0;
    let stageElapsed = 0;
    let particleElapsed = 0;
    // These durations control presentation pacing only, never model time.
    const stageDuration = 7600;
    const particleDuration = 2600;

    function drawParticles() {
      tracks.forEach(track => {
        if (track.stage !== stage) return;
        track.dots.forEach((dot, index) => {
          const progress = (particleElapsed / particleDuration + index / track.dots.length) % 1;
          const point = track.path.getPointAtLength(progress * track.length);
          dot.setAttribute('cx', point.x.toFixed(2));
          dot.setAttribute('cy', point.y.toFixed(2));
        });
      });
      const phase = Math.min(1, stageElapsed / stageDuration);
      buttons[stage].style.setProperty('--body-stage-progress', String(phase));
      root.dataset.bodyStageProgress = phase.toFixed(4);
      root.dispatchEvent(new CustomEvent('body:progress', {detail: {stage, phase, flowPhase: particleElapsed / particleDuration}}));
    }

    function selectStage(value, announce = true) {
      stage = (value + buttons.length) % buttons.length;
      stageElapsed = 0;
      particleElapsed = 0;
      buttons.forEach((button, index) => {
        button.setAttribute('aria-pressed', String(index === stage));
        button.style.setProperty('--body-stage-progress', '0');
      });
      descriptions.forEach((description, index) => { description.hidden = index !== stage; });
      emphasis.forEach(group => group.classList.toggle('is-active', group.dataset.bodyEmphasis.split(' ').includes(String(stage))));
      tracks.forEach(track => track.group.classList.toggle('is-active', track.stage === stage));
      position.textContent = `${stage + 1} / ${buttons.length}`;
      root.dataset.bodyCurrentStage = String(stage);
      root.dispatchEvent(new CustomEvent('body:stage', {detail: {stage}}));
      liveDescription.setAttribute('aria-live', announce && !playing ? 'polite' : 'off');
      drawParticles();
    }

    function updatePlayControl() {
      playButton.setAttribute('aria-pressed', String(playing));
      root.querySelector('[data-body-play-label]').textContent = playing ? 'Pause' : 'Play';
      playButton.setAttribute('aria-label', playing ? 'Pause selected stage' : 'Play selected stage');
      root.querySelector('[data-body-play-icon]').setAttribute('d', playing ? 'M5 3 H8 V17 H5 Z M12 3 H15 V17 H12 Z' : 'M6 3 L16 10 L6 17 Z');
      root.classList.toggle('is-playing', playing);
    }

    function stopFrame() {
      cancelAnimationFrame(frame);
      frame = 0;
      lastTick = 0;
    }

    function canAnimate() {
      return playing && visible && !document.hidden && !motion.matches;
    }

    function tick(time) {
      frame = 0;
      if (!canAnimate()) { lastTick = 0; return; }
      const elapsed = lastTick ? Math.min(time - lastTick, 100) : 0;
      if (lastTick && elapsed < 32) { frame = requestAnimationFrame(tick); return; }
      lastTick = time;
      stageElapsed += elapsed;
      particleElapsed += elapsed;
      if (stageElapsed >= stageDuration) {
        stageElapsed = stageDuration;
        drawParticles();
        pause();
        return;
      }
      drawParticles();
      frame = requestAnimationFrame(tick);
    }

    function syncAnimation() {
      stopFrame();
      if (canAnimate()) frame = requestAnimationFrame(tick);
    }

    function pause() {
      playing = false;
      updatePlayControl();
      syncAnimation();
      liveDescription.setAttribute('aria-live', 'polite');
    }

    function manualStage(value) {
      pause();
      selectStage(value);
    }

    buttons.forEach((button, index) => {
      button.addEventListener('click', () => manualStage(index));
      button.addEventListener('keydown', event => {
        let target;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') target = (index + 1) % buttons.length;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') target = (index + buttons.length - 1) % buttons.length;
        if (event.key === 'Home') target = 0;
        if (event.key === 'End') target = buttons.length - 1;
        if (target === undefined) return;
        event.preventDefault();
        manualStage(target);
        buttons[target].focus();
      });
    });
    previous.addEventListener('click', () => manualStage(stage - 1));
    next.addEventListener('click', () => manualStage(stage + 1));
    playButton.addEventListener('click', () => {
      if (playing) { pause(); return; }
      if (motion.matches) { manualStage(stage + 1); return; }
      if (stageElapsed >= stageDuration) selectStage(stage, false);
      playing = true;
      liveDescription.setAttribute('aria-live', 'off');
      updatePlayControl();
      syncAnimation();
    });
    function applyMotionPreference() {
      if (motion.matches) pause();
      playButton.hidden = motion.matches;
      root.querySelector('[data-body-motion-note]').textContent = motion.matches
        ? 'Reduced motion · use the stage controls'
        : 'Conceptual motion · no biological time scale';
      syncAnimation();
    }
    if (motion.addEventListener) motion.addEventListener('change', applyMotionPreference);
    else motion.addListener(applyMotionPreference);
    document.addEventListener('visibilitychange', syncAnimation);
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        visible = entries.some(entry => entry.isIntersecting);
        syncAnimation();
      }, {threshold: 0.05});
      observer.observe(root);
    }
    root.dataset.bodyInitialized = 'true';
    root.classList.add('is-ready');
    root.querySelector('[data-body-stage-controls]').hidden = false;
    root.querySelector('[data-body-transport]').hidden = false;
    selectStage(0, false);
    applyMotionPreference();
    const anatomy = root.querySelector('[data-body-3d]');
    if (anatomy) {
      let requested = false;
      const loadAnatomy = async () => {
        if (requested) return;
        requested = true;
        try {
          const module = await import(new URL(anatomy.getAttribute('data-body-3d-module'), document.baseURI).href);
          await module.mountBody(root);
        } catch (error) {
          root.querySelector('[data-body-3d-status]').textContent = 'Static anatomy shown. The delivery stages remain available.';
          console.warn('Body anatomy viewer:', error);
        }
      };
      if ('IntersectionObserver' in window) {
        const anatomyObserver = new IntersectionObserver(entries => {
          if (entries.some(entry => entry.isIntersecting)) { anatomyObserver.disconnect(); loadAnatomy(); }
        }, {rootMargin: '300px 0px'});
        anatomyObserver.observe(anatomy);
      } else loadAnatomy();
    }
    const mechanisms = root.querySelector('[data-delivery-mechanisms-3d]');
    if (mechanisms) {
      let mechanismsRequested = false;
      const loadMechanisms = async () => {
        if (mechanismsRequested) return;
        mechanismsRequested = true;
        try {
          const cssURL = new URL(mechanisms.getAttribute('data-mechanism-css'), document.baseURI).href;
          let stylesheet = document.querySelector('link[data-delivery-mechanism-css]') || [...document.querySelectorAll('link[rel="stylesheet"]')].find(link => link.href === cssURL);
          if (!stylesheet) {
            stylesheet = document.createElement('link'); stylesheet.rel = 'stylesheet'; stylesheet.href = cssURL;
            stylesheet.setAttribute('data-delivery-mechanism-css', '');
            const stylesReady = new Promise((resolve, reject) => { stylesheet.onload = resolve; stylesheet.onerror = reject; });
            document.head.append(stylesheet);
            await stylesReady;
          }
          const module = await import(new URL(mechanisms.getAttribute('data-mechanism-module'), document.baseURI).href);
          await module.mountMechanisms(root);
        } catch (error) {
          console.warn('Delivery mechanism viewers:', error);
        }
      };
      if ('IntersectionObserver' in window) {
        const mechanismObserver = new IntersectionObserver(entries => {
          if (entries.some(entry => entry.isIntersecting)) { mechanismObserver.disconnect(); loadMechanisms(); }
        }, {rootMargin: '300px 0px'});
        mechanismObserver.observe(mechanisms);
      } else loadMechanisms();
    }
  });
})();
