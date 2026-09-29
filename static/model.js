(() => {
  const caret = document.querySelector('.typing-caret');
  if (caret) setTimeout(() => { caret.hidden = true; }, 2240);
  const modules = [...document.querySelectorAll('[data-model-module]')];
  const links = [...document.querySelectorAll('[data-module-link]')];
  const chapters = [...document.querySelectorAll('[data-model-chapter]')];
  const chapterLinks = [...document.querySelectorAll('[data-chapter-link]')];
  if (!modules.length) return;
  for (const link of links) {
    link.addEventListener('click', () => {
      const wasOpen = link.getAttribute('aria-expanded') === 'true';
      for (const other of links) {
        const panel = document.getElementById(other.getAttribute('aria-controls'));
        if (!panel) continue;
        const expanded = other === link && !wasOpen;
        other.setAttribute('aria-expanded', String(expanded));
        panel.hidden = !expanded;
      }
    });
  }
  // Reveal the generated artwork once without moving the interactive contents.
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  const revealAnimations = new Set();
  const reveal = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) {
      reveal.unobserve(entry.target);
      if (motionPreference.matches) continue;
      const art = entry.target.querySelector('.neuron-frame');
      const animation = art.animate([{opacity:.35, transform:'translateY(12px)'}, {opacity:1, transform:'translateY(0)'}], {duration:650, easing:'cubic-bezier(.22,1,.36,1)'});
      revealAnimations.add(animation);
      animation.finished.then(() => revealAnimations.delete(animation)).catch(() => {});
    }
  }, {threshold:.15});
  document.querySelectorAll('.module-card').forEach(card => reveal.observe(card));
  motionPreference.addEventListener('change', () => {
    if (motionPreference.matches) {
      revealAnimations.forEach(animation => animation.cancel());
      revealAnimations.clear();
    }
  });
  let queued = false;
  function update() {
    const offset = (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 112) + (innerWidth <= 760 ? 100 : 55);
    let current = null;
    for (const section of modules) if (section.getBoundingClientRect().top <= offset) current = section.id;
    for (const link of links) {
      if (link.dataset.module === current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
    let chapter = null;
    for (const heading of chapters) {
      if (heading.closest('[data-model-module]')?.id === current && heading.getBoundingClientRect().top <= offset + 20) chapter = heading.id;
    }
    for (const link of chapterLinks) {
      if (link.hash === `#${chapter}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
    queued = false;
  }
  function schedule() { if (!queued) { queued = true; requestAnimationFrame(update); } }
  addEventListener('scroll', schedule, {passive: true});
  addEventListener('resize', schedule);
  function openDetail() {
    const target = document.getElementById(location.hash.slice(1));
    if (target?.matches('details')) target.open = true;
    schedule();
  }
  addEventListener('hashchange', openDetail);
  openDetail();
})();
