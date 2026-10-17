(() => {
  const stage = document.querySelector('.nf-stage');
  if (!stage) return;
  stage.querySelectorAll('[data-nf-float]').forEach((layer, index) => {
    layer.style.animationDelay = `${-0.7 * index}s`;
  });
})();
