// The original page is a lossless PDF raster; zoom changes only its display size.
const intro = document.querySelector('.page-intro');
const sheets = [...document.querySelectorAll('.page-sheet')];
function fitPages() {
  // Reserve the actual controls height so the first page fits from top to bottom.
  const height = Math.max(1, window.innerHeight - intro.getBoundingClientRect().height - 16);
  for (const sheet of sheets) {
    const image = sheet.querySelector('img');
    const ratio = Number(image.getAttribute('width')) / Number(image.getAttribute('height'));
    sheet.style.setProperty('--page-fit-width', `${height * ratio}px`);
  }
}
fitPages();
window.addEventListener('resize', fitPages);
new ResizeObserver(fitPages).observe(intro);
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
    fitPages();
    history.replaceState(null, '', link.hash);
    requestAnimationFrame(() => target.scrollIntoView({block:'start'}));
  });
});
