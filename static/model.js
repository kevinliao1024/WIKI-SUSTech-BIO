(() => {
  const modules = [...document.querySelectorAll('[data-model-module]')];
  const links = [...document.querySelectorAll('[data-module-link]')];
  const chapters = [...document.querySelectorAll('[data-model-chapter]')];
  const chapterLinks = [...document.querySelectorAll('[data-chapter-link]')];
  if (!modules.length) return;
  for (const link of links) {
    if (!link.hasAttribute('aria-controls')) continue;
    link.addEventListener('click', () => {
      const panel = document.getElementById(link.getAttribute('aria-controls'));
      const expanded = link.getAttribute('aria-expanded') === 'true';
      link.setAttribute('aria-expanded', String(!expanded));
      panel.hidden = expanded;
    });
  }
  let queued = false;
  function update() {
    const offset = (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 112) + (innerWidth <= 760 ? 100 : 55);
    let current = null;
    for (const section of modules) if (section.getBoundingClientRect().top <= offset) current = section.id;
    for (const link of links) {
      if (link.hash === `#${current}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
    let chapter = null;
    for (const heading of chapters) {
      if (heading.closest('[data-model-module]').id === current && heading.getBoundingClientRect().top <= offset + 20) chapter = heading.id;
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
