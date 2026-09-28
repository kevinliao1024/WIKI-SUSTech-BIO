import createGlobe from './vendor/cobe.js';

const canvas = document.querySelector('[data-globe]');
const wrap = document.querySelector('[data-globe-wrap]');
const scene = document.querySelector('[data-global-scene]');

if (canvas && wrap) {
  let globe;
  let size = 1200;
  let time = 0;
  let markerCount = -1;
  let activeMarkers = [];
  let frame;
  let sceneActive = false;

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const range = (p, start, end) => clamp((p - start) / (end - start));
  const smooth = (value) => {
    const v = clamp(value);
    return v * v * (3 - 2 * v);
  };

  let randomState = 20200622;
  const random = () => {
    randomState = (randomState * 1664525 + 1013904223) >>> 0;
    return randomState / 4294967296;
  };

  /* Population hubs keep the lights attached to inhabited land rather than
     scattering them uniformly over the oceans. The round-robin assembly lets
     every region begin glowing before local density builds. */
  const hubs = [
    [40.7, -74.0, 12, 5, 7], [34.1, -118.2, 8, 5, 7], [19.4, -99.1, 8, 5, 6],
    [-23.6, -46.6, 11, 6, 8], [-34.6, -58.4, 6, 5, 7], [51.5, -.1, 11, 4, 6],
    [48.9, 2.4, 9, 4, 6], [52.5, 13.4, 8, 4, 7], [40.4, -3.7, 7, 5, 7],
    [55.8, 37.6, 8, 6, 10], [41.0, 29.0, 9, 5, 7], [30.0, 31.2, 8, 6, 8],
    [6.5, 3.4, 9, 7, 9], [-26.2, 28.0, 7, 7, 10], [28.6, 77.2, 14, 7, 9],
    [19.1, 72.9, 12, 7, 8], [23.8, 90.4, 10, 6, 7], [13.8, 100.5, 8, 7, 8],
    [1.3, 103.8, 7, 5, 6], [-6.2, 106.8, 11, 7, 9], [39.9, 116.4, 14, 7, 10],
    [31.2, 121.5, 14, 6, 8], [35.7, 139.7, 13, 6, 7], [37.6, 127.0, 9, 5, 6],
    [14.6, 121.0, 9, 7, 8], [-33.9, 151.2, 7, 6, 8], [-37.8, 145.0, 5, 5, 7],
    [22.3, 114.2, 10, 5, 6], [25.0, 55.3, 7, 6, 8], [35.7, 51.4, 6, 6, 8],
  ];

  const buckets = hubs.map(([lat, lng, count, latSpread, lngSpread], hubIndex) => {
    const points = [];
    for (let index = 0; index < count * 36; index += 1) {
      const latitude = clamp(lat + (random() - .5) * latSpread * 2, -68, 72);
      let longitude = lng + (random() - .5) * lngSpread * 2;
      if (longitude > 180) longitude -= 360;
      if (longitude < -180) longitude += 360;
      const palette = (index + hubIndex) % 11;
      const color = palette === 0
        ? [.96, .55, .61]
        : palette === 5
          ? [.62, .61, .98]
          : [1, .82 + random() * .12, .72 + random() * .16];
      points.push({
        location: [latitude, longitude],
        size: .00055 + random() * .00155,
        color,
      });
    }
    return points;
  });

  const allMarkers = [];
  const longest = Math.max(...buckets.map((bucket) => bucket.length));
  for (let index = 0; index < longest; index += 1) {
    buckets.forEach((bucket) => {
      if (bucket[index]) allMarkers.push(bucket[index]);
    });
  }

  const resize = () => {
    size = Math.max(900, Math.min(2200, Math.round(wrap.clientWidth)));
    if (globe) globe.update({ width: size, height: size });
  };

  const startGlobe = () => {
    if (globe) return;
    resize();
    const dpr = Math.min(1.15, window.devicePixelRatio || 1);
    globe = createGlobe(canvas, {
      devicePixelRatio: dpr,
      width: size,
      height: size,
      phi: 2.7,
      theta: .18,
      dark: 1,
      diffuse: 1.08,
      mapSamples: 65000,
      mapBrightness: .8,
      mapBaseBrightness: .015,
      baseColor: [.24, .17, .12],
      markerColor: [1, .84, .74],
      glowColor: [.12, .23, .5],
      markerElevation: .012,
      markers: [],
      arcs: [],
      scale: .5,
    });

    const draw = () => {
      if (!globe) return;
      if (sceneActive && !document.hidden) {
        const p = clamp(Number(scene?.dataset.progress) || 0);
        const approach = smooth(range(p, .06, .66));
        const lights = smooth(range(p, .18, .78));
        const rawCount = Math.round(allMarkers.length * lights);
        const nextCount = Math.min(allMarkers.length, Math.round(rawCount / 48) * 48);
        const state = {
          phi: 2.7 + approach * 2.05 + time,
          theta: .18 + approach * .08,
          scale: .36 + approach * .84,
          mapBrightness: .55 + lights * 4.1,
          mapBaseBrightness: .012 + lights * .025,
        };
        if (nextCount !== markerCount) {
          markerCount = nextCount;
          activeMarkers = allMarkers.slice(0, nextCount);
          state.markers = activeMarkers;
        }
        globe.update(state);
        time += .001;
      }
      frame = window.requestAnimationFrame(draw);
    };
    draw();
  };

  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(wrap);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries, observer) => {
      if (!entries[0].isIntersecting) return;
      sceneActive = true;
      startGlobe();
      observer.disconnect();
    }, { rootMargin: '600px' }).observe(wrap);
    new IntersectionObserver((entries) => {
      sceneActive = entries[0].isIntersecting;
    }, { rootMargin: '1000px' }).observe(scene || wrap);
  } else {
    sceneActive = true;
    startGlobe();
  }

  window.addEventListener('pagehide', () => {
    if (frame) window.cancelAnimationFrame(frame);
    globe?.destroy();
    globe = null;
  }, { once: true });
}
