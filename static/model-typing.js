(() => {
  const scene = document.querySelector('[data-typing-scene]');
  if (!scene) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const arms = [...scene.querySelectorAll('[data-typing-arm]')].map(arm => ({
    shoulder: arm.dataset.shoulder.split(',').map(Number),
    elbow: arm.dataset.elbow.split(',').map(Number),
    wrist: arm.dataset.wrist.split(',').map(Number),
    phase: Number(arm.dataset.phase),
    forearm: arm.querySelector('[data-typing-forearm]'),
    hand: arm.querySelector('[data-typing-hand]'),
  }));
  let frame = 0;
  let visible = false;
  let previousTime = null;
  let elapsed = 0;

  function pose(time, resting = false) {
    for (const arm of arms) {
      // Each hand briefly lifts, then settles on its own row of keys.
      const wave = Math.max(0, Math.sin(time * Math.PI * 2 / 920 + arm.phase));
      const lift = resting ? 0 : wave * wave * 22;
      const x = arm.wrist[0];
      const y = arm.wrist[1] - lift;
      arm.forearm.setAttribute('d', `M${arm.shoulder[0]} ${arm.shoulder[1]}Q${arm.elbow[0]} ${arm.elbow[1] - lift * .45} ${x} ${y}`);
      arm.hand.setAttribute('transform', `translate(${x} ${y})`);
    }
  }

  function tick(time) {
    if (previousTime !== null) elapsed += Math.min(time - previousTime, 60);
    previousTime = time;
    pose(elapsed);
    frame = requestAnimationFrame(tick);
  }

  function update() {
    const playing = visible && !document.hidden && !reduced.matches;
    if (playing && !frame) frame = requestAnimationFrame(tick);
    if (!playing) {
      cancelAnimationFrame(frame);
      frame = 0;
      previousTime = null;
      if (reduced.matches) pose(0, true);
    }
  }

  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    update();
  }).observe(scene);
  reduced.addEventListener('change', update);
  document.addEventListener('visibilitychange', update);
  pose(0, true);
})();
