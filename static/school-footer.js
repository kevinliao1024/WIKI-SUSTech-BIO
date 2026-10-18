/* Dependency-free adaptation of the SUSTech-BIO 2025 footer carousel/lightbox.
   Original: https://2025.igem.wiki/sustech-bio/ (CC BY 4.0). */
(() => {
  const footer = document.querySelector('[data-school-footer]');
  if (!footer) return;
  const scroller = footer.querySelector('[data-footer-sponsor-scroll]');
  const track = footer.querySelector('[data-footer-sponsor-track]');
  const group = footer.querySelector('[data-footer-sponsor-group]');
  const dialog = footer.querySelector('[data-footer-lightbox]');
  const enlarged = dialog.querySelector('[data-footer-lightbox-image]');
  const close = dialog.querySelector('[data-footer-lightbox-close]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let trigger;
  let savedScroll;
  let hovering = false;
  let focused = false;
  let visible = false;
  let frame = 0;
  let previous = 0;
  let position = 0;
  let cycleWidth = 0;

  // One copy creates a seamless visual loop. Only the original group is in the
  // accessibility tree and keyboard order; all original logos remain scrollable.
  const copy = group.cloneNode(true);
  copy.removeAttribute('data-footer-sponsor-group');
  copy.setAttribute('aria-hidden', 'true');
  copy.querySelectorAll('button').forEach(button => { button.tabIndex = -1; });
  track.append(copy);

  function measure() {
    cycleWidth = group.getBoundingClientRect().width;
    position = scroller.scrollLeft;
  }
  function canAnimate() {
    return visible && !document.hidden && !reduced.matches && !hovering && !focused && !dialog.open && cycleWidth > 0;
  }
  function tick(now) {
    frame = 0;
    if (!canAnimate()) { previous = 0; return; }
    if (previous) {
      position += Math.min(now - previous, 64) * .06;
      if (position >= cycleWidth) position %= cycleWidth;
      scroller.scrollLeft = position;
    }
    previous = now;
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    copy.hidden = reduced.matches;
    if (canAnimate()) {
      if (!frame) { position = scroller.scrollLeft; previous = 0; frame = requestAnimationFrame(tick); }
    } else if (frame) {
      cancelAnimationFrame(frame);
      frame = 0;
      previous = 0;
    }
  }
  scroller.addEventListener('mouseenter', () => { hovering = true; sync(); });
  scroller.addEventListener('mouseleave', () => { hovering = false; sync(); });
  scroller.addEventListener('focusin', () => { focused = true; sync(); });
  scroller.addEventListener('focusout', event => { focused = scroller.contains(event.relatedTarget); sync(); });
  scroller.addEventListener('touchstart', () => { hovering = true; sync(); }, { passive: true });
  scroller.addEventListener('touchend', () => { hovering = false; sync(); }, { passive: true });
  scroller.addEventListener('touchcancel', () => { hovering = false; sync(); }, { passive: true });
  group.querySelectorAll('img').forEach(image => image.addEventListener('load', measure));
  if ('ResizeObserver' in window) new ResizeObserver(measure).observe(group);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => { visible = entries.some(entry => entry.isIntersecting); sync(); }).observe(scroller);
  } else { visible = true; }
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', () => { measure(); sync(); });

  footer.addEventListener('click', event => {
    const button = event.target.closest('[data-footer-image]');
    if (!button) return;
    const image = button.querySelector('img');
    if (!image) return;
    trigger = button;
    savedScroll = { x: window.scrollX, y: window.scrollY, style: document.body.getAttribute('style') };
    Object.assign(document.body.style, {
      position: 'fixed', top: `-${savedScroll.y}px`, left: `-${savedScroll.x}px`,
      width: '100%', overflow: 'hidden'
    });
    enlarged.src = image.currentSrc || image.src;
    enlarged.alt = image.alt;
    dialog.classList.toggle('footer-lightbox--dark', Boolean(button.querySelector('.community-logo-surface--dark')));
    dialog.setAttribute('aria-label', image.alt);
    dialog.showModal();
    close.focus();
    sync();
  });
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => {
    if (savedScroll) {
      if (savedScroll.style === null) document.body.removeAttribute('style');
      else document.body.setAttribute('style', savedScroll.style);
      window.scrollTo({ left: savedScroll.x, top: savedScroll.y, behavior: 'instant' });
      savedScroll = null;
    }
    trigger?.focus({ preventScroll: true });
    sync();
  });
  measure();
  sync();
})();
