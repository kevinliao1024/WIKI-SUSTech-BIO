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
  let closeTimer;
  function closeAll(except) {
    groups.forEach((group) => {
      if (group === except) return;
      group.classList.remove('is-open');
      group.querySelector('.rna-toggle').setAttribute('aria-expanded', 'false');
      group.querySelector('.rna-menu').hidden = true;
    });
  }
  function open(group) {
    clearTimeout(closeTimer);
    closeAll(group);
    group.classList.add('is-open');
    group.querySelector('.rna-toggle').setAttribute('aria-expanded', 'true');
    const panel = group.querySelector('.rna-menu');
    panel.hidden = false;
    const box = panel.getBoundingClientRect();
    const whale = group.querySelector('.rna-toggle').getBoundingClientRect();
    const origin = Math.max(16, Math.min(box.width - 16, whale.left + whale.width / 2 - box.left));
    panel.querySelector('.rna-menu__lead path').setAttribute('d', `M${origin} 0 C${origin} 14 46 0 46 18`);
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
          group.classList.remove('is-open');
          toggle.setAttribute('aria-expanded', 'false');
          panel.hidden = true;
        }
      }, 0);
    });
  });
  document.addEventListener('pointerdown', (event) => {
    if (navigation && !navigation.contains(event.target)) closeAll();
  });
})();
