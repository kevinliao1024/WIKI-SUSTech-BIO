(() => {
  const neuron = document.querySelector('[data-neuron-nav]');
  if (!neuron) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;
  let restTimer;
  function draw() {
    frame = 0;
    const max = document.documentElement.scrollHeight - innerHeight;
    const progress = Math.max(0, Math.min(1, max > 0 ? scrollY / max : 0));
    const navHeight = document.querySelector('.site-nav').getBoundingClientRect().height;
    const start = navHeight + 32;
    const travel = Math.max(0, innerHeight - start - neuron.offsetHeight - 28);
    const sway = reduced.matches ? 0 : Math.sin(progress * Math.PI * 4) * (innerWidth < 650 ? 4 : 9);
    const tilt = reduced.matches ? 0 : Math.sin(progress * Math.PI * 4 + .5) * 8;
    neuron.style.transform = `translate3d(${sway}px,${start + progress * travel}px,0) rotate(${tilt}deg)`;
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(draw); }
  addEventListener('scroll', () => {
    schedule();
    if (!reduced.matches) neuron.classList.add('is-swimming');
    clearTimeout(restTimer);
    restTimer = setTimeout(() => neuron.classList.remove('is-swimming'), 180);
  }, { passive:true });
  addEventListener('resize', schedule, { passive:true });
  reduced.addEventListener('change', () => { neuron.classList.remove('is-swimming'); schedule(); });
  neuron.addEventListener('click', () => {
    // "instant" intentionally overrides the document's smooth-scroll style.
    window.scrollTo({ top:0, left:0, behavior:'instant' });
    neuron.classList.remove('is-swimming');
    window.dispatchEvent(new CustomEvent('orca:return-top'));
    draw();
  });
  draw();
})();
