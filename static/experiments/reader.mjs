// The original page is a lossless PDF raster; zoom changes only its display size.
document.querySelectorAll('.page-zoom').forEach(button => {
  button.addEventListener('click', () => {
    const sheet = button.closest('.page-sheet');
    const expanded = sheet.classList.toggle('is-enlarged');
    button.setAttribute('aria-pressed', String(expanded));
    button.setAttribute('aria-label', button.getAttribute('aria-label').replace(/^(Enlarge|Fit)/, expanded ? 'Fit' : 'Enlarge'));
    if (!expanded) {
      const viewport = sheet.closest('.page-viewport');
      viewport.scrollLeft = 0;
      viewport.scrollTop = 0;
    }
  });
});
document.querySelectorAll('.section-links a').forEach(link => {
  link.addEventListener('click', event => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = document.getElementById(link.hash.slice(1));
    if (!target) return;
    event.preventDefault();
    link.closest('details').open = false;
    history.replaceState(null, '', link.hash);
    requestAnimationFrame(() => target.scrollIntoView({block:'start'}));
  });
});
