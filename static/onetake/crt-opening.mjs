const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = v => v * v * (3 - 2 * v);
const mix = (a, b, t) => a + (b - a) * t;

export function createCrtOpening(root) {
  const picture = root.querySelector('[data-crt-picture]');
  if (!picture) return null;
  const anchor = root.querySelector('[data-crt-anchor]');
  const set = root.querySelector('[data-crt-set]');
  const stage = picture.querySelector('.ot-stage');
  let base, mount, rect, lastZoom = -1;
  const resize = () => {
    base = anchor.getBoundingClientRect();
    mount = root.querySelector('[data-crt-mount]').getBoundingClientRect();
    lastZoom = -1;
  };
  resize();
  addEventListener('resize', resize, { passive: true });
  const update = p => {
    const zoom = smooth(clamp((p + 0.184) / 0.039));
    const signal = smooth(clamp((p + 0.18) / 0.027));
    if (zoom !== lastZoom) {
      lastZoom = zoom;
      rect = { x: mix(base.x, 0, zoom), y: mix(base.y, 0, zoom),
        width: mix(base.width, innerWidth, zoom), height: mix(base.height, innerHeight, zoom) };
      Object.assign(picture.style, { left: `${rect.x}px`, top: `${rect.y}px`, width: `${rect.width}px`, height: `${rect.height}px`, borderRadius: `${mix(base.width * 0.063, 0, zoom)}px / ${mix(base.height * 0.078, 0, zoom)}px` });
      stage.style.transform = `scale(${rect.width / innerWidth}, ${rect.height / innerHeight})`;
      const kx = rect.width / base.width, ky = rect.height / base.height;
      const tx = rect.x - base.x + (base.x - mount.x) * (1 - kx);
      const ty = rect.y - base.y + (base.y - mount.y) * (1 - ky);
      set.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${kx}, ${ky})`;
      root.style.setProperty('--crt-shell', (1 - smooth(clamp((zoom - 0.66) / 0.3))).toFixed(4));
      root.style.setProperty('--crt-glass', (1 - zoom).toFixed(4));
      root.style.setProperty('--crt-title', smooth(clamp((zoom - 0.76) / 0.24)).toFixed(4));
      root.dataset.crtPhase = zoom === 1 ? 'maze' : zoom === 0 ? 'television' : 'entering';
    }
    return signal;
  };
  const pointer = (x, y) => ({
    x: ((x - rect.x) / rect.width) * 2 - 1,
    y: 1 - ((y - rect.y) / rect.height) * 2,
    inside: x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height,
  });
  update(-0.19);
  return { update, pointer };
}
