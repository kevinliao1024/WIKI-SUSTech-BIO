/* The dementia comparison: one short flight through a field of lights.
 *
 * There is no number to watch and no city arithmetic. The camera starts high,
 * where the whole field fits in frame, then drops into it until the lights run
 * past every edge and the reader cannot see where they stop. The sentences
 * cross-fade in turn, so the segment keeps changing without anything being
 * clicked. The point is simply that there are a great many of them.
 *
 * Geometry and camera come from burden-flight.mjs, which the flight tests
 * verify directly.
 */
import { MAP_GRID, MAP_POINTS } from './burden-map-points.mjs';
import { BURDEN_IN, BURDEN_OUT } from './burden-pacing.mjs';
import {
  WORLD, COLUMN_HEIGHT, COLUMN_LEVELS, HALF_FOV, columnHeight,
  cameraAt, basisAt, projectPoint, fogAt, radiusAt, openingHeightFor,
} from './burden-flight.mjs';

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

function mount(el) {
  const root = el.closest('[data-ot]');
  const chapter = el.closest('[data-ot-chapter]');
  const canvas = el.querySelector('[data-burden-canvas]');
  const ctx = canvas?.getContext('2d');
  const lines = [...el.querySelectorAll('[data-burden-line]')];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');

  const count = MAP_POINTS ? MAP_POINTS.length / 2 : 0;
  const [gridW, gridH] = MAP_GRID || [512, 256];
  // Precompute world positions once; the lattice never changes.
  const wx = new Float32Array(count);
  const wz = new Float32Array(count);
  const hh = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    wx[i] = (MAP_POINTS[i * 2] / gridW * 2 - 1) * WORLD.halfWidth;
    wz[i] = (MAP_POINTS[i * 2 + 1] / gridH * 2 - 1) * WORLD.halfDepth;
    hh[i] = columnHeight(i) * COLUMN_HEIGHT;
  }

  let width = 0, height = 0, dpr = 1, focal = 1, aspect = 16 / 9, openY = 0;
  let local = 0, shown = 0, resting = true;
  let raf = 0, running = false, lastFrame = 0, announced = -1, visibleLine = -1;

  function resize() {
    if (!canvas) return;
    const bounds = canvas.getBoundingClientRect();
    width = bounds.width; height = bounds.height;
    if (width <= 0 || height <= 0) return;
    dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));
    ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    // Match the half-angle the flight was verified against, and tell the
    // camera the real aspect so the opening frame still fits the whole field
    // on a narrow (portrait) screen.
    focal = (height / 2) / Math.tan(HALF_FOV);
    aspect = width / height;
    // Re-solve the opening height for this frame shape (cached per aspect), so
    // a portrait phone still opens on the whole field.
    openY = openingHeightFor(MAP_POINTS, gridW, gridH, aspect);
    draw(performance.now());
  }

  /* Colour: a cold far field warming as it approaches, so depth reads without
     any fog sprite. Values are the page's own --ot-ice / --ot-coral, mixed. */
  const FAR = [138, 170, 214];
  const NEAR = [159, 208, 255];
  const HOT = [255, 106, 85];

  function draw(time) {
    if (!ctx || width <= 0 || height <= 0 || !count) return;
    ctx.clearRect(0, 0, width, height);
    const camera = cameraAt(shown, aspect, openY);
    const basis = basisAt(camera);
    const halfW = width / 2, halfH = height / 2;
    const drift = reduce.matches ? 0 : time * 0.0006;

    // Buckets by alpha so the whole field costs a handful of fill calls.
    const BUCKETS = 10;
    const paths = [];
    for (let i = 0; i < count; i++) {
      const top = hh[i];
      for (let L = 0; L < COLUMN_LEVELS.length; L++) {
        const y = top * COLUMN_LEVELS[L];
        const p = projectPoint(camera, basis, wx[i], y, wz[i], focal, halfW, halfH);
        if (!p) continue;
        if (p.sx < -8 || p.sx > width + 8 || p.sy < -8 || p.sy > height + 8) continue;
        const fog = fogAt(p.depth);
        if (fog <= 0.02) continue;
        // Near lights warm slightly and shimmer, so the field is alive.
        const shimmer = reduce.matches ? 1 : 0.86 + 0.14 * Math.sin(drift * 3.1 + i * 0.7 + L);
        const alpha = clamp(fog * shimmer);
        const bucket = Math.min(BUCKETS - 1, Math.max(0, Math.round(alpha * BUCKETS) - 1));
        if (!paths[bucket]) paths[bucket] = new Path2D();
        const r = radiusAt(p.depth);
        paths[bucket].moveTo(p.sx + r, p.sy);
        paths[bucket].arc(p.sx, p.sy, r, 0, Math.PI * 2);
      }
    }
    for (let b = 0; b < BUCKETS; b++) {
      if (!paths[b]) continue;
      const a = (b + 1) / BUCKETS;
      const mixTo = clamp((shown - 0.25) / 0.7);
      ctx.globalAlpha = a;
      ctx.fillStyle = `rgb(${Math.round(FAR[0] + (NEAR[0] - FAR[0]) * mixTo + (HOT[0] - NEAR[0]) * mixTo * a * 0.35)},${Math.round(FAR[1] + (NEAR[1] - FAR[1]) * mixTo)},${Math.round(FAR[2] + (NEAR[2] - FAR[2]) * mixTo)})`;
      ctx.fill(paths[b]);
    }
    ctx.globalAlpha = 1;
  }

  /* One sentence at a time, cross-faded by scroll position. */
  function setLines(value) {
    if (!lines.length) return;
    const span = 1 / lines.length;
    const index = Math.min(lines.length - 1, Math.floor(clamp(value) / span));
    if (index === visibleLine) return;
    visibleLine = index;
    lines.forEach((line, i) => line.classList.toggle('is-on', i === index));
    // First sentence carries the headline number, so it reads even with no JS.
    if (index !== announced) {
      announced = index;
      el.setAttribute('aria-label', lines[index].textContent.trim());
    }
  }

  function frame(time) {
    raf = 0;
    if (!running) return;
    // A zero or missing timestamp (two frames in the same tick, or a stubbed
    // clock) must not stall the easing, or the flight freezes half-way.
    const dt = lastFrame ? Math.min(Math.max((time - lastFrame) / 1000, 1 / 120), .05) : 1 / 60;
    lastFrame = time;
    // Ease toward the scroll-driven target so scrubbing reads as one motion.
    shown += (local - shown) * (1 - Math.exp(-dt * 5.5));
    if (Math.abs(local - shown) < 2e-4) { shown = local; resting = true; }
    draw(time);
    setLines(shown);
    if (!resting) raf = requestAnimationFrame(frame);
  }

  function start() {
    // Always re-arm: the loop may have parked at the target while the reader
    // kept scrolling, in which case there is no live frame to resume.
    if (running && raf) return;
    running = true; lastFrame = 0; resting = false;
    if (!raf) raf = requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  // Scroll drives everything: the particle loop publishes its take each frame.
  root?.addEventListener('ot:frame', event => {
    const take = Number(event.detail?.take);
    if (!Number.isFinite(take)) return;
    local = clamp((take - BURDEN_IN) / (BURDEN_OUT - BURDEN_IN));
    const on = take >= BURDEN_IN && take <= BURDEN_OUT;
    if (on) {
      resting = false;
      el.classList.add('is-live');
      start();
    } else if (running) {
      stop();
    }
  });

  /* Reduced motion and the no-WebGL fallback never receive ot:frame: present
     the finished shot — the field at eye level — once, with both sentences. */
  function settle() {
    local = 1; shown = 1; resting = true;
    resize();
    lines.forEach(line => line.classList.add('is-on'));
    visibleLine = lines.length - 1;
    draw(performance.now());
  }

  const observer = new MutationObserver(() => {
    if (root?.classList.contains('ot--static')) { stop(); settle(); }
  });
  if (root) observer.observe(root, { attributes: true, attributeFilter: ['class'] });
  reduce.addEventListener('change', () => { stop(); settle(); });

  if ('ResizeObserver' in window && canvas) new ResizeObserver(resize).observe(canvas);
  window.addEventListener('resize', resize);

  if (root?.classList.contains('ot--static') || reduce.matches) settle();
  else { resize(); setLines(0); }
  chapter?.classList.add('is-ready');
}

if (typeof document !== 'undefined') {
  for (const el of document.querySelectorAll('[data-burden]')) mount(el);
}
