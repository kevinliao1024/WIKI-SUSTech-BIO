import createGlobe from './vendor/cobe.js';

const canvas = document.querySelector('[data-globe]');
const wrap = document.querySelector('[data-globe-wrap]');
const ticker = document.querySelector('[data-number-ticker]');

if (canvas && wrap) {
  let globe;
  let phi = 0;
  let size = 480;

  const resize = () => {
    size = Math.max(260, Math.min(560, wrap.clientWidth));
    if (globe) globe.update({ width: size, height: size });
  };

  const startGlobe = () => {
    resize();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    globe = createGlobe(canvas, {
      devicePixelRatio: dpr,
      width: size,
      height: size,
      phi: 0.15,
      theta: 0.18,
      dark: 0.35,
      diffuse: 1.25,
      mapSamples: 16000,
      mapBrightness: 5.5,
      baseColor: [0.62, 0.62, 0.98],
      markerColor: [0.96, 0.56, 0.61],
      glowColor: [0.36, 0.35, 0.84],
      arcColor: [0.96, 0.56, 0.61],
      arcWidth: 0.7,
      arcHeight: 0.28,
      markers: [
        { location: [22.3, 114.2], size: 0.055 },
        { location: [35.7, 139.7], size: 0.045 },
        { location: [51.5, -0.1], size: 0.04 },
        { location: [42.4, -71.1], size: 0.05 },
      ],
      arcs: [
        { from: [22.3, 114.2], to: [35.7, 139.7] },
        { from: [22.3, 114.2], to: [51.5, -0.1] },
        { from: [22.3, 114.2], to: [42.4, -71.1] },
      ],
      onRender: (state) => {
        state.phi = phi;
        phi += 0.003;
      },
    });
  };

  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(wrap);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries, observer) => {
      if (!entries[0].isIntersecting) return;
      startGlobe();
      observer.disconnect();
    }, { rootMargin: '240px' }).observe(wrap);
  } else startGlobe();
}

if (ticker) {
  const target = Number(ticker.dataset.target || 0);
  let started = false;
  const animate = () => {
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min(1, (now - start) / 1400);
      const eased = 1 - ((1 - progress) ** 3);
      ticker.textContent = Math.round(target * eased).toLocaleString('en-US');
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const observer = new IntersectionObserver((entries) => {
    if (started || !entries[0].isIntersecting) return;
    started = true;
    animate();
    observer.disconnect();
  }, { threshold: 0.35 });
  observer.observe(ticker);
}
