// Two static coordinate renders. The divider reveals images; it does not
// interpolate atoms or imply that RNA editing was observed in these entries.
(() => {
  const section = document.querySelector('[data-apoe112]');
  if (!section) return;
  // The particle take computes its scroll-track height during startup. Restore
  // the review anchor after that layout settles, so it opens the plate rather
  // than an earlier chapter. This script is loaded only by the clone.
  if (location.hash === '#apoe112') {
    const root = document.querySelector('[data-structure-preview]');
    const jump = () => requestAnimationFrame(() => requestAnimationFrame(() => section.scrollIntoView({ block: 'start', behavior: 'instant' })));
    if (root?.classList.contains('is-ready')) jump();
    else if (root) {
      const observer = new MutationObserver(() => {
        if (!root.classList.contains('is-ready')) return;
        observer.disconnect();
        jump();
      });
      observer.observe(root, { attributes: true, attributeFilter: ['class'] });
      window.addEventListener('load', jump, { once: true });
    }
  }
  const pair = section.querySelector('[data-apoe-pair]');
  const sliderView = section.querySelector('[data-apoe-slider-view]');
  const modes = [...section.querySelectorAll('[data-apoe-view]')];
  const range = section.querySelector('[data-apoe-range]');
  const compare = section.querySelector('[data-apoe-compare]');
  modes.forEach(button => button.addEventListener('click', () => {
    const slider = button.dataset.apoeView === 'slider';
    pair.hidden = slider;
    sliderView.hidden = !slider;
    modes.forEach(mode => mode.setAttribute('aria-pressed', String(mode === button)));
  }));
  const reveal = value => {
    range.value = String(value);
    compare.style.setProperty('--reveal', `${value}%`);
    range.setAttribute('aria-valuetext', value === 100 ? 'APOE4 Arg112, PDB 1B68' : value === 0 ? 'APOE3 reference Cys112, PDB 1LPE' : `Both reference structures, comparison divider at ${value} percent`);
  };
  range.addEventListener('input', () => reveal(Number(range.value)));
  section.querySelectorAll('[data-apoe-endpoint]').forEach(button => button.addEventListener('click', () => reveal(Number(button.dataset.apoeEndpoint))));

  const dialog = section.querySelector('[data-apoe-dialog]');
  const image = section.querySelector('[data-apoe-dialog-image]');
  const title = section.querySelector('[data-apoe-dialog-title]');
  const caption = section.querySelector('[data-apoe-dialog-caption]');
  let trigger;
  section.querySelectorAll('[data-apoe-enlarge]').forEach(button => button.addEventListener('click', () => {
    trigger = button;
    const e4 = button.dataset.apoeEnlarge === 'e4';
    image.src = button.querySelector('img').src;
    image.alt = button.querySelector('img').alt;
    title.textContent = e4 ? 'APOE4 · Arg112' : 'APOE3 reference · Cys112';
    caption.textContent = `${e4 ? 'PDB 1B68 · 2.00 Å · Chain A · ARG 112' : 'PDB 1LPE · 2.25 Å · Chain A · CYS 112'}. Public N-terminal reference structure; not an ORCA editing result.`;
    dialog.showModal();
  }));
  section.querySelector('[data-apoe-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => trigger?.focus({ preventScroll: true }));
})();
