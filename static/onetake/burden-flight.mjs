/* The dementia comparison's camera: one continuous flight from a high
   overview of the whole field of lights down to eye level inside it, where
   the lights run past every edge of the frame and there is no boundary to
   see. Shared by the renderer and the flight tests so the shot is verified
   rather than eyeballed.

   The world is centred on the origin: x east in [-2, 2], z south in [-1, 1],
   y up. Dots sit on y = 0 and rise into short vertical columns, which is what
   lets a low camera fill the top of the frame as well as the bottom. */

export const WORLD = Object.freeze({ halfWidth: 2, halfDepth: 1 });
export const COLUMN_HEIGHT = 1.25;

/* Dot index -> column height. Deterministic: the same lattice always produces
   the same skyline, so a screenshot can be compared against a later build. */
export function columnHeight(i) {
  const n = Math.sin(i * 12.9898) * 43758.5453;
  return 0.10 + 0.62 * (n - Math.floor(n));
}

const mix = (a, b, t) => a + (b - a) * t;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smoothstep = (e0, e1, x) => { const t = clamp((x - e0) / (e1 - e0)); return t * t * (3 - 2 * t); };

/* Start: high and looking down — the whole field fits in frame, so the first
   thing the reader sees is that it is finite and countable.
   End: low and nearly level, inside the crowd, drifting east — the field now
   covers every edge and the reader cannot see where it stops. */
/* Positions chosen against the real lattice so the closing frame bleeds past
   all four edges (verified in tests/burden_flight.mjs), which is what makes
   the field read as endless rather than as a map with a border. */
const OPEN = Object.freeze({ x: 0, y: 2.55, z: 0.10, pitch: 87, yaw: 0 });
const CLOSE = Object.freeze({ x: 0.20, y: 0.34, z: -0.60, pitch: 10, yaw: 45 });

/* Vertical half-angle of the shot, matching what the renderer sets its focal
   length from. */
export const HALF_FOV = 35 * Math.PI / 180;

export function cameraAt(t, aspect = 16 / 9, openY = OPEN.y) {
  const k = clamp(t);
  // Order matters. The camera drops into the crowd while still facing the way
  // it opened, and only turns once it is low and surrounded by lights.
  // Turning early (while high, looking down) pointed the view off the edge of
  // the lattice and showed empty water in the middle of the shot.
  const descend = smoothstep(0.06, 0.62, k);
  const travel = smoothstep(0.30, 0.88, k);
  const yaw = mix(OPEN.yaw, CLOSE.yaw, smoothstep(0.48, 0.92, k));
  const pitch = mix(OPEN.pitch, CLOSE.pitch, smoothstep(0.10, 0.72, k));
  return {
    x: mix(OPEN.x, CLOSE.x, travel),
    // `openY` is the height that fits the whole field at this aspect ratio;
    // see openingHeightFor. Narrow (portrait) frames need a taller start.
    y: mix(openY, CLOSE.y, descend),
    z: mix(OPEN.z, CLOSE.z, travel),
    pitch: pitch * Math.PI / 180,
    yaw: yaw * Math.PI / 180,
  };
}

/* Camera height at which the opening frame still contains the whole field.
   Resolved against the REAL lattice rather than an analytic box: the field is
   an irregular scatter of land, not a rectangle, and the opening view is tilted
   off vertical (pitch 87deg), which shifts the frame centre sideways by an
   amount that grows with height. Both effects make a rectangle solve wrong.

   `points` is the flat quantised lattice [x0,y0,x1,y1,...] with its grid
   width, so renderer and tests resolve the identical height. */
const OPEN_HEIGHT_CACHE = new Map();
export function openingHeightFor(points, gridW, gridH, aspect) {
  const key = Math.round(Math.max(aspect, 0.4) * 40) / 40;
  if (OPEN_HEIGHT_CACHE.has(key)) return OPEN_HEIGHT_CACHE.get(key);

  // Work in real pixels at a nominal height, so the projection maths here is
  // exactly the maths the renderer uses. Getting this wrong (scaling the frame
  // in "frame units" instead of pixels) silently inverted the vertical
  // constraint and made every solve overshoot.
  const VH = 1000, VW = Math.round(1000 * key);
  const focal = (VH / 2) / Math.tan(HALF_FOV);
  const halfW = VW / 2, halfH = VH / 2;

  const corner = [[Infinity, Infinity], [-Infinity, -Infinity]];
  for (let i = 0; i < points.length; i += 2) {
    const x = (points[i] / gridW * 2 - 1) * WORLD.halfWidth;
    const z = (points[i + 1] / gridH * 2 - 1) * WORLD.halfDepth;
    if (x < corner[0][0]) corner[0][0] = x;
    if (z < corner[0][1]) corner[0][1] = z;
    if (x > corner[1][0]) corner[1][0] = x;
    if (z > corner[1][1]) corner[1][1] = z;
  }
  const candidates = [
    [corner[0][0], corner[0][1]], [corner[1][0], corner[0][1]],
    [corner[0][0], corner[1][1]], [corner[1][0], corner[1][1]],
    [0, corner[0][1]], [0, corner[1][1]], [corner[0][0], 0], [corner[1][0], 0],
  ];
  for (let i = 0; i < points.length; i += 24) {
    candidates.push([
      (points[i] / gridW * 2 - 1) * WORLD.halfWidth,
      (points[i + 1] / gridH * 2 - 1) * WORLD.halfDepth,
    ]);
  }

  const fits = (y) => {
    const camera = { x: OPEN.x, y, z: OPEN.z, pitch: OPEN.pitch * Math.PI / 180, yaw: OPEN.yaw * Math.PI / 180 };
    const basis = basisAt(camera);
    for (const level of [0, 1]) {
      for (const [x, z] of candidates) {
        const p = projectPoint(camera, basis, x, level * COLUMN_HEIGHT, z, focal, halfW, halfH);
        if (!p || p.sx < 0 || p.sx > VW || p.sy < 0 || p.sy > VH) return false;
      }
    }
    return true;
  };

  let low = CLOSE.y, high = OPEN.y;
  for (let i = 0; i < 60 && !fits(high); i++) high *= 1.5;
  if (fits(low)) high = low;
  else for (let i = 0; i < 50; i++) {
    const mid = (low + high) / 2;
    if (fits(mid)) high = mid; else low = mid;
  }
  const value = Math.ceil(high * 1000) / 1000;
  OPEN_HEIGHT_CACHE.set(key, value);
  return value;
}

/* Camera basis. Right-handed, looking along fwd. */
export function basisAt(camera) {
  const cp = Math.cos(camera.pitch), sp = Math.sin(camera.pitch);
  const cy = Math.cos(camera.yaw), sy = Math.sin(camera.yaw);
  return {
    fwd: [sy * cp, -sp, cy * cp],
    right: [-cy, 0, sy],
    up: [sy * sp, cp, cy * sp],
  };
}

/* Project a world point. Returns null when it is behind the camera. */
export function projectPoint(camera, basis, x, y, z, focal, halfW, halfH) {
  const dx = x - camera.x, dy = y - camera.y, dz = z - camera.z;
  const depth = dx * basis.fwd[0] + dy * basis.fwd[1] + dz * basis.fwd[2];
  if (depth < 0.03) return null;
  const sx = halfW + (dx * basis.right[0] + dz * basis.right[2]) / depth * focal;
  const sy = halfH - (dx * basis.up[0] + dy * basis.up[1] + dz * basis.up[2]) / depth * focal;
  return { sx, sy, depth };
}

/* Each dot is drawn as a short vertical column, sampled at these fractions of
   its height. Stacking five (rather than three) keeps the frame full while the
   camera passes through the mid-altitude band, where single dots are at their
   smallest. */
export const COLUMN_LEVELS = Object.freeze([0, 0.25, 0.5, 0.75, 1]);

/* Fog: dots fade out with distance instead of ending at a visible edge. A long
   falloff keeps the middle distance populated during the descent. */
export const FADE_NEAR = 3.0;
export const FADE_FAR = 8.0;
export function fogAt(depth) {
  return 1 - smoothstep(FADE_NEAR, FADE_FAR, depth);
}

/* Screen radius for a dot: grows as it approaches, clamped to a small range so
   a column never becomes a blob. The lower bound is deliberately not tiny —
   mid-descent the camera passes through a band where dots are furthest away,
   and a smaller floor made the frame look empty for a moment there. */
export function radiusAt(depth) {
  return clamp(0.95 * (0.34 + 0.66 / Math.max(depth, 0.10)), 0.70, 2.4);
}
