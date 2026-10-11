(() => {
  const caret = document.querySelector('.typing-caret');
  if (caret) setTimeout(() => { caret.hidden = true; }, 2240);
  const modules = [...document.querySelectorAll('[data-model-module]')];
  const links = [...document.querySelectorAll('[data-module-link]')];
  const chapters = [...document.querySelectorAll('[data-model-chapter]')];
  const chapterLinks = [...document.querySelectorAll('[data-chapter-link]')];
  const sidebar = document.querySelector('.model-sidebar');
  const reading = document.querySelector('.model-reading');
  const footer = document.querySelector('.site-footer');
  if (!modules.length) return;
  const hoverNavigation = matchMedia('(hover: hover) and (pointer: fine)');
  function expand(link) {
    for (const other of links) {
      const panel = document.getElementById(other.getAttribute('aria-controls'));
      if (!panel) continue;
      const expanded = other === link;
      other.setAttribute('aria-expanded', String(expanded));
      panel.hidden = !expanded;
    }
  }
  for (const link of links) {
    const group = link.closest('.module-nav-group');
    group.addEventListener('pointerenter', event => {
      if (hoverNavigation.matches && event.pointerType !== 'touch') expand(link);
    });
    group.addEventListener('pointerleave', event => {
      if (!hoverNavigation.matches || event.pointerType === 'touch') return;
      if (group.contains(document.activeElement) && document.activeElement.matches(':focus-visible')) return;
      if (link.getAttribute('aria-expanded') === 'true') expand(null);
    });
    group.addEventListener('focusin', event => {
      if (event.target.matches(':focus-visible')) expand(link);
    });
    group.addEventListener('focusout', event => {
      if (!group.contains(event.relatedTarget)) expand(null);
    });
    link.addEventListener('click', event => {
      // Hover and keyboard focus already open the panel; touch toggles it.
      const close = !hoverNavigation.matches && event.detail !== 0 && link.getAttribute('aria-expanded') === 'true';
      expand(close ? null : link);
    });
    group.addEventListener('keydown', event => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      link.focus();
      expand(null);
    });
  }
  sidebar?.addEventListener('click', event => {
    if (event.target.closest('a[href^="#"]')) expand(null);
  });
  document.addEventListener('pointerdown', event => {
    if (!sidebar?.contains(event.target)) expand(null);
  });
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
    const navHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 112;
    const offset = navHeight + (innerWidth <= 760 ? 100 : 55);
    if (sidebar && reading) {
      const bounds = reading.getBoundingClientRect();
      const beforeFooter = !footer || footer.getBoundingClientRect().top >= innerHeight;
      const visible = bounds.top <= navHeight + 40 && bounds.bottom > offset && beforeFooter;
      sidebar.classList.toggle('is-visible', visible);
      sidebar.inert = !visible;
      if (!visible) expand(null);
    }
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
  addEventListener('load', schedule);
  addEventListener('hashchange', schedule);
  const layoutObserver = new ResizeObserver(schedule);
  document.querySelectorAll('.model-overview, .model-reading').forEach(element => layoutObserver.observe(element));
  schedule();
})();
