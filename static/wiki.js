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
  const backToTop = document.querySelector('[data-back-to-top]');

  const updateScrollUI = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = scrollable > 0 ? Math.min(1, window.scrollY / scrollable) : 0;
    if (progress) progress.style.width = `${ratio * 100}%`;
    if (backToTop) backToTop.classList.toggle('is-visible', window.scrollY > 700);
  };

  window.addEventListener('scroll', updateScrollUI, { passive: true });
  updateScrollUI();

  if (backToTop) {
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));
  }

  document.querySelectorAll('.navbar-collapse a').forEach((link) => {
    link.addEventListener('click', () => {
      const menu = document.querySelector('.navbar-collapse.show');
      if (menu && window.bootstrap) window.bootstrap.Collapse.getOrCreateInstance(menu).hide();
    });
  });
})();
