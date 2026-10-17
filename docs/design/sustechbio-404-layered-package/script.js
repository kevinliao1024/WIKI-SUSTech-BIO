document.querySelectorAll('[data-float]').forEach((el, i) => {
  el.style.animationDelay = `${-0.7 * i}s`;
});
