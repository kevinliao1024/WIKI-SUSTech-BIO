/* Contact-aware choreography. The browser interpolates CSS/WAAPI joint poses. */
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const states = [...document.querySelectorAll('.module-card:has(.character-rig)')].map(card => {
    const rig = card.querySelector('.character-rig');
    const module = Number(card.getAttribute('href').replace('#module', ''));
    const edges = [...card.querySelectorAll('.rig-network-edge')];
    const nodes = [...card.querySelectorAll('.rig-network-node')];
    const upper = card.querySelector('.rig-upper-arm');
    const forearm = card.querySelector('.rig-forearm');
    let hovered = false, focused = false, visible = true, running = false;
    let generation = 0, cancelWait = null, animations = [];
    const armSpace = card.querySelector('.rig-arm-space');
    const curvedArm = card.querySelector('.rig-curved-arm');
    const wrist = card.querySelector('.rig-wrist');
    let curveFrame = 0, settleUntil = 0;
    const drawArm = now => {
      curveFrame = 0;
      const inverse = armSpace.getCTM().inverse();
      const elbowPoint = new DOMPoint(0, 0).matrixTransform(forearm.getCTM()).matrixTransform(inverse);
      const handPoint = new DOMPoint(0, 0).matrixTransform(wrist.getCTM()).matrixTransform(inverse);
      // One continuous quadratic curve replaces the two visible rigid bones.
      curvedArm.setAttribute('d', `M0 0Q${elbowPoint.x} ${elbowPoint.y} ${handPoint.x} ${handPoint.y}`);
      if (running || now < settleUntil) curveFrame = requestAnimationFrame(drawArm);
    };
    const followArm = () => {
      settleUntil = performance.now() + 800;
      if (!curveFrame) curveFrame = requestAnimationFrame(drawArm);
    };
    followArm();
    const wanted = () => !reduced.matches && !document.hidden && visible && (hovered || focused);
    const wait = (ms, token) => new Promise(resolve => {
      const timer = setTimeout(() => { cancelWait = null; resolve(token === generation && wanted()); }, ms);
      cancelWait = () => { clearTimeout(timer); cancelWait = null; resolve(false); };
    });
    const phase = name => { card.dataset.characterPhase = name; };
    const timing = (ms, easing = 'cubic-bezier(.45,0,.25,1)') => {
      card.style.setProperty('--rig-duration', `${ms}ms`);
      card.style.setProperty('--rig-easing', easing);
    };
    // Solve the two bone angles for the actual lens center / fingertip / pencil tip.
    // Vectors include the rigid tool offset, so visual contact is not guessed.
    const solve = ([x, y]) => {
      const mirrored = module !== 2;
      const originX = module === 4 ? 525 : module === 1 ? 569 : 55;
      const dx = (mirrored ? (originX - x) / .92 : x - originX) - 125;
      const dy = (mirrored ? (y - 20) / .92 : y - 20) - 208;
      const a = [70, 30];
      const b = module === 1 ? [127, -90] : module === 2 ? [142, -39] : [156, -86];
      const l1 = Math.hypot(...a), l2 = Math.hypot(...b);
      const bend = -Math.acos(Math.max(-1, Math.min(1, (dx * dx + dy * dy - l1 * l1 - l2 * l2) / (2 * l1 * l2))));
      const shoulder = Math.atan2(dy, dx) - Math.atan2(l2 * Math.sin(bend), l1 + l2 * Math.cos(bend));
      const u = (shoulder - Math.atan2(a[1], a[0])) * 180 / Math.PI;
      return [u, (shoulder + bend - Math.atan2(b[1], b[0])) * 180 / Math.PI - u];
    };
    const setPose = ([u, f]) => {
      rig.style.setProperty('--upper-active', `${u}deg`);
      rig.style.setProperty('--fore-active', `${f}deg`);
      rig.style.setProperty('--wrist-active', '0deg');
    };
    const move = (point, ms) => {
      timing(ms);
      setPose(solve(point));
      card.classList.add('is-performing');
    };
    const retreat = (ms = 850) => { timing(ms); card.classList.remove('is-performing'); };
    const markNode = point => nodes.find(node => node.dataset.point === point.join(','))?.classList.add('is-visible');
    const clearDrawing = () => {
      edges.forEach(edge => { edge.style.strokeDashoffset = '1'; });
      nodes.forEach(node => node.classList.remove('is-visible'));
    };
    const stop = () => {
      generation++;
      running = false;
      cancelWait?.();
      // Capture the current joints before cancelling a partially drawn edge.
      const current = [upper, forearm].map(el => getComputedStyle(el).transform);
      animations.forEach(animation => animation.cancel());
      animations = [];
      card.classList.remove('is-tracing');
      timing(650);
      card.classList.remove('is-performing', 'is-inspecting', 'is-protein-changed', 'is-erasing');
      clearDrawing();
      phase('idle');
      followArm();
      if (!reduced.matches) [upper, forearm].forEach((el, i) => {
        // Smooth release even if an SVG drawing stroke was interrupted halfway.
        const target = getComputedStyle(rig).getPropertyValue(i ? '--fore-rest' : '--upper-rest').trim();
        el.animate([{ transform: current[i] }, { transform: `rotate(${target})` }], { duration: 650, easing: 'ease-out' });
      });
    };
    const drawEdge = async (edge, token) => {
      const start = edge.dataset.start.split(',').map(Number);
      const end = edge.dataset.end.split(',').map(Number);
      phase('positioning');
      move(start, 220);
      if (!await wait(240, token)) return false;
      markNode(start);
      phase('drawing');
      card.classList.add('is-tracing');
      // Intermediate IK samples keep the pencil on the straight SVG edge.
      // WAAPI interpolates them; no per-frame JS render loop is used.
      const poses = Array.from({ length: 25 }, (_, i) => {
        const t = i / 24;
        return solve([start[0] + (end[0] - start[0]) * t, start[1] + (end[1] - start[1]) * t]);
      });
      const options = { duration: 440, easing: 'linear', fill: 'forwards' };
      animations = [
        upper.animate(poses.map(p => ({ transform: `rotate(${p[0]}deg)` })), options),
        forearm.animate(poses.map(p => ({ transform: `rotate(${p[1]}deg)` })), options),
        edge.animate([{ strokeDashoffset: '1' }, { strokeDashoffset: '0' }], options),
      ];
      if (!await wait(460, token)) return false;
      setPose(poses.at(-1));
      edge.style.strokeDashoffset = '0';
      animations.forEach(animation => animation.cancel());
      animations = [];
      card.classList.remove('is-tracing');
      markNode(end);
      return true;
    };
    const play = async token => {
      while (token === generation && wanted()) {
        if (module === 1) {
          phase('approaching'); move([260, 196], 1050);
          if (!await wait(1100, token)) return;
          phase('inspecting'); card.classList.add('is-inspecting');
          if (!await wait(850, token)) return;
          card.classList.remove('is-inspecting'); phase('retreating'); retreat();
          if (!await wait(1250, token)) return;
        } else if (module === 2) {
          phase('approaching'); move([365, 164], 1050);
          if (!await wait(1100, token)) return;
          card.classList.toggle('is-protein-changed'); phase('tapping');
          if (!await wait(420, token)) return;
          phase('retreating'); retreat();
          if (!await wait(1250, token)) return;
        } else if (module === 4) {
          card.classList.remove('is-erasing'); clearDrawing();
          phase('approaching'); move([200, 160], 900);
          if (!await wait(950, token)) return;
          for (const edge of edges) if (!await drawEdge(edge, token)) return;
          phase('displaying'); retreat();
          if (!await wait(950, token)) return;
          phase('erasing'); card.classList.add('is-erasing');
          if (!await wait(650, token)) return;
          clearDrawing();
          if (!await wait(300, token)) return;
        } else {
          timing(1300); card.classList.toggle('is-performing'); phase('moving');
          if (!await wait(1550, token)) return;
        }
      }
    };
    const update = () => {
      if (!wanted()) { if (running) stop(); }
      else if (!running) { running = true; followArm(); void play(++generation); }
    };
    card.addEventListener('pointerenter', event => {
      hovered = event.pointerType === 'mouse' || event.pointerType === 'pen';
      update();
    });
    card.addEventListener('pointerleave', () => { hovered = false; update(); });
    card.addEventListener('pointercancel', () => { hovered = false; update(); });
    card.addEventListener('focus', () => { focused = card.matches(':focus-visible'); update(); });
    card.addEventListener('blur', () => { focused = false; update(); });
    const observer = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      update();
    });
    observer.observe(card);
    return update;
  });
  reduced.addEventListener('change', () => states.forEach(update => update()));
  document.addEventListener('visibilitychange', () => states.forEach(update => update()));
})();
