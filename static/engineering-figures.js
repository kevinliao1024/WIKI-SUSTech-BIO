(() => {
  const images = [...document.querySelectorAll('.engineering-copy img.engineering-figure')];
  if (!images.length) return;

  // The href remains a usable original-image link if dialog support is absent.
  const dialog = document.createElement('dialog');
  dialog.className = 'engineering-figure-dialog';
  dialog.setAttribute('aria-labelledby', 'engineering-figure-title');
  dialog.innerHTML = `
    <div class="engineering-figure-toolbar">
      <h2 class="engineering-figure-title" id="engineering-figure-title"></h2>
      <div class="engineering-figure-actions">
        <button type="button" data-figure-fit aria-pressed="true">Fit width</button>
        <button type="button" data-figure-detail aria-pressed="false">Read labels</button>
        <a data-figure-original target="_blank" rel="noopener">Original</a>
        <button type="button" data-figure-close aria-label="Close figure" autofocus>Close</button>
      </div>
    </div>
    <div class="engineering-figure-viewport" tabindex="0" role="region" aria-label="Enlarged figure, scroll to explore">
      <img class="engineering-figure-detail" alt="">
    </div>`;
  document.body.append(dialog);
  const title = dialog.querySelector('.engineering-figure-title');
  const detail = dialog.querySelector('.engineering-figure-detail');
  const viewport = dialog.querySelector('.engineering-figure-viewport');
  const fitButton = dialog.querySelector('[data-figure-fit]');
  const detailButton = dialog.querySelector('[data-figure-detail]');
  const original = dialog.querySelector('[data-figure-original]');
  let opener;

  function setDetail(enabled) {
    dialog.dataset.detail = String(enabled);
    fitButton.setAttribute('aria-pressed', String(!enabled));
    detailButton.setAttribute('aria-pressed', String(enabled));
    viewport.scrollTo(0, 0);
  }
  function openFigure(image, link) {
    opener = link;
    title.textContent = image.alt;
    detail.alt = image.alt;
    detail.src = image.currentSrc || image.src;
    original.href = image.src;
    const width = image.style.getPropertyValue('--engineering-detail-width');
    dialog.style.setProperty('--engineering-detail-width', width || '1200px');
    setDetail(false);
    dialog.showModal();
  }
  fitButton.addEventListener('click', () => setDetail(false));
  detailButton.addEventListener('click', () => setDetail(true));
  dialog.querySelector('[data-figure-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => opener?.focus({ preventScroll: true }));
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  // Do not let image exploration trigger the Engineering chapter wheel.
  dialog.addEventListener('keydown', event => event.stopPropagation());
  dialog.addEventListener('wheel', event => event.stopPropagation(), { passive: true });

  for (const image of images) {
    if (image.closest('a')) continue;
    const link = document.createElement('a');
    link.className = 'engineering-figure-link';
    link.href = image.src;
    link.target = '_blank';
    link.rel = 'noopener';
    link.setAttribute('aria-label', `Enlarge: ${image.alt}`);
    link.title = 'Enlarge figure';
    link.style.setProperty('--engineering-figure-width', image.style.getPropertyValue('--engineering-figure-width'));
    image.before(link);
    link.append(image);
    link.addEventListener('click', event => {
      if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || typeof dialog.showModal !== 'function') return;
      event.preventDefault();
      openFigure(image, link);
    });
  }
})();
