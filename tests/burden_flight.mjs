// Verifies the dementia comparison's flight against the real module the
// renderer uses, not a copy. What the shot has to do:
//
//   opening  — the whole field of lights is in frame, bounded, countable
//   flight   — the camera genuinely descends and turns
//   closing  — lights reach every edge, so there is no boundary to see
//   always   — depth stays sane, dots stay small enough to read as a crowd
import assert from 'node:assert/strict';
import { MAP_GRID, MAP_POINTS } from '../static/onetake/burden-map-points.mjs';
import {
  WORLD, COLUMN_HEIGHT, COLUMN_LEVELS, columnHeight, cameraAt, basisAt,
  projectPoint, fogAt, radiusAt, FADE_FAR, openingHeightFor,
} from '../static/onetake/burden-flight.mjs';

const [gridW, gridH] = MAP_GRID;
const COUNT = MAP_POINTS.length / 2;
const VW = 1280, VH = 640;
const FOCAL = (VH / 2) / Math.tan(35 * Math.PI / 180);
const HALF_W = VW / 2, HALF_H = VH / 2;

// Map lattice -> world, centred on the origin.
const worldX = i => (MAP_POINTS[i * 2] / gridW * 2 - 1) * WORLD.halfWidth;
const worldZ = i => (MAP_POINTS[i * 2 + 1] / gridH * 2 - 1) * WORLD.halfDepth;

// Dots are drawn at every level of their column, exactly as the renderer does,
// so a low camera sees a skyline rather than a single flat plane.
const LEVELS = COLUMN_LEVELS;

function frame(t) {
  const camera = cameraAt(t, VW / VH, openingHeightFor(MAP_POINTS, gridW, gridH, VW / VH)), basis = basisAt(camera);
  const visible = [];
  for (let i = 0; i < COUNT; i++) {
    const top = columnHeight(i) * COLUMN_HEIGHT;
    for (const level of LEVELS) {
      const p = projectPoint(camera, basis, worldX(i), top * level, worldZ(i), FOCAL, HALF_W, HALF_H);
      if (!p) continue;
      if (p.sx < 0 || p.sx > VW || p.sy < 0 || p.sy > VH) continue;
      visible.push({ ...p, fog: fogAt(p.depth), r: radiusAt(p.depth) });
    }
  }
  return { camera, visible };
}

// Fraction of sampled points along each frame edge that have a dot nearby.
function edgeFill(visible) {
  const reach = 54, step = 32;
  const near = (x, y) => visible.some(p => Math.abs(p.sx - x) < reach && Math.abs(p.sy - y) < reach);
  let top = 0, bottom = 0, left = 0, right = 0, across = 0, down = 0;
  for (let x = 0; x <= VW; x += step) { across++; if (near(x, 0)) top++; if (near(x, VH)) bottom++; }
  for (let y = 0; y <= VH; y += step) { down++; if (near(0, y)) left++; if (near(VW, y)) right++; }
  return { top: top / across, bottom: bottom / across, left: left / down, right: right / down };
}

const failures = [];
const check = (ok, msg) => { (ok ? console.log('ok   ', msg) : (failures.push(msg), console.log('FAIL ', msg))); };

// 1. Opening: the entire field is in frame, seen from above.
{
  const { camera, visible } = frame(0);
  const seen = new Set(visible.map(p => Math.round(p.sx * 1000) + ':' + Math.round(p.sy * 1000)));
  check(visible.length >= COUNT * LEVELS.length - 4,
    `opening frame shows all ${COUNT} dots (${visible.length} drawn points in frame)`);
  check(camera.y > 2, `opening camera is high (y=${camera.y.toFixed(2)})`);
  check(camera.pitch > 80 * Math.PI / 180, `opening camera looks down (${(camera.pitch * 180 / Math.PI).toFixed(0)}deg)`);
  const fill = edgeFill(visible);
  check(fill.top + fill.bottom + fill.left + fill.right < 1.6,
    `opening frame is bounded, not bleeding off every edge (fill ${['top', 'bottom', 'left', 'right'].map(k => (fill[k] * 100).toFixed(0) + '%').join(' ')})`);
}

// 2. The camera genuinely moves and turns.
{
  const OPEN_Y = openingHeightFor(MAP_POINTS, gridW, gridH, VW / VH);
  const a = cameraAt(0, VW / VH, OPEN_Y), z = cameraAt(1, VW / VH, OPEN_Y);
  const travelled = Math.hypot(z.x - a.x, z.y - a.y, z.z - a.z);
  check(travelled > 2, `camera travels ${travelled.toFixed(2)} world units`);
  const tilt = (a.pitch - z.pitch) * 180 / Math.PI;
  check(tilt > 60, `pitch swings ${tilt.toFixed(0)}deg from overhead to eye level`);
  check(Math.abs(z.yaw - a.yaw) > 0.4, `yaw turns ${((z.yaw - a.yaw) * 180 / Math.PI).toFixed(0)}deg`);
  check(z.y < 0.5, `closing camera is low enough to stand inside the field (y=${z.y.toFixed(2)})`);
}

// 3. Once the camera is down among the lights, no frame may show an edge:
//    the field has to run past all four sides, or the reader sees a border
//    and the "endless crowd" illusion breaks. The opening is exempt — there
//    the whole field is meant to be visible and bounded.
{
  const offenders = [];
  for (let k = 0; k <= 20; k++) {
    const t = k / 20;
    if (t < 0.6) continue;
    const { visible } = frame(t);
    const fill = edgeFill(visible);
    const worst = Math.min(fill.top, fill.bottom, fill.left, fill.right);
    if (worst < 0.7) offenders.push(`t=${t.toFixed(2)} worst edge ${(worst * 100).toFixed(0)}%`);
  }
  check(offenders.length === 0,
    offenders.length ? `frames exposing an edge: ${offenders.join('; ')}`
      : 'no frame after the descent shows an edge (all four sides stay filled)');

  const { visible } = frame(1);
  const fill = edgeFill(visible);
  const avg = (fill.top + fill.bottom + fill.left + fill.right) / 4;
  check(avg > 0.9,
    `closing frame bleeds past every edge (fill ${['top', 'bottom', 'left', 'right'].map(k => (fill[k] * 100).toFixed(0) + '%').join(' ')}, avg ${(avg * 100).toFixed(0)}%)`);
  check(visible.length > 400, `closing frame still holds a crowd (${visible.length} drawn points)`);
}

// 4. The crowd closes in. Raw point counts are the wrong measure: looking
//    straight down puts the entire plane in frame (tens of thousands of tiny
//    dots), while standing inside it shows a few thousand large ones. What
//    actually reads as "crowded" is how much of the frame the dots FILL, and
//    how large the near ones are.
{
  const cover = k => {
    const { visible } = frame(k);
    let area = 0;
    for (const p of visible) area += Math.PI * p.r * p.r * (0.35 + 0.65 * p.fog);
    return area / (VW * VH);
  };
  const series = [];
  for (let k = 0; k <= 10; k++) series.push(cover(k / 10));
  // A dolly through a point field necessarily shrinks individual dots partway.
  // What must never happen is the frame going bare, so the floor matters more
  // than monotonicity.
  check(Math.min(...series) > 0.012,
    `the frame never goes bare mid-flight (min cover ${(Math.min(...series) * 100).toFixed(1)}%)`);
  check(series.at(-1) > series[0],
    `the closing frame covers more of the screen than the opening (${(series[0] * 100).toFixed(1)}% -> ${(series.at(-1) * 100).toFixed(1)}%)`);

  // Near dots must get bigger: that is the sensation of walking into a crowd.
  const nearRadius = k => {
    const { visible } = frame(k);
    const near = visible.filter(p => p.depth < 1.2);
    return near.length ? near.reduce((s, p) => s + p.r, 0) / near.length : 0;
  };
  const r0 = nearRadius(0), r1 = nearRadius(1);
  check(r1 > r0, `dots near the camera grow from ${r0.toFixed(2)}px to ${r1.toFixed(2)}px`);
}

// 4b. No frame of the flight may be sparse: something is always on screen.
{
  const counts = [];
  for (let k = 0; k <= 20; k++) counts.push(frame(k / 20).visible.length);
  check(Math.min(...counts) > 1000, `every frame stays populated (min ${Math.min(...counts)} drawn points)`);
}

// 5. Depth stays sane across the whole flight.
{
  let drawn = 0, culled = 0;
  for (let k = 0; k <= 20; k++) {
    const camera = cameraAt(k / 20, VW / VH, openingHeightFor(MAP_POINTS, gridW, gridH, VW / VH)), basis = basisAt(camera);
    for (let i = 0; i < COUNT; i++) {
      const top = columnHeight(i) * COLUMN_HEIGHT;
      for (const level of LEVELS) {
        const p = projectPoint(camera, basis, worldX(i), top * level, worldZ(i), FOCAL, HALF_W, HALF_H);
        if (p) drawn++; else culled++;
      }
    }
  }
  check(drawn > 0 && culled < drawn * 0.75, `depth stays sane (${culled} culled vs ${drawn} drawn)`);
}

// 6. Dots stay small enough to read as a crowd rather than blobs.
{
  let worst = 0;
  for (let k = 0; k <= 20; k++) {
    const { visible } = frame(k / 20);
    for (const p of visible) worst = Math.max(worst, p.r);
  }
  check(worst <= 2.4 + 1e-9, `largest dot on screen is ${worst.toFixed(2)}px radius`);
}

// 7. Fog retires the distance instead of cutting it off.
{
  check(fogAt(FADE_FAR + 0.1) === 0 && fogAt(0.5) > 0.95, 'fog fades far dots and keeps near ones solid');
  const { visible } = frame(1);
  const readable = visible.filter(p => p.fog > 0.35);
  check(readable.length > 150, `closing frame keeps ${readable.length} clearly readable dots`);
}


// 8. The same flight must hold at other aspect ratios. This is what caught the
//    original bug: the camera height was tuned on a 2:1 canvas, so on a phone
//    in portrait the opening frame showed a cropped fragment of the field and
//    then went nearly empty.
{
  const shapes = [
    ['desktop 16:9', 1920, 1080],
    ['wide 2:1', 1280, 640],
    ['portrait phone', 390, 844 - 140],
    ['square-ish', 820, 1180],
  ];
  for (const [label, w, h] of shapes) {
    const aspect = w / h;
    const focal = (h / 2) / Math.tan(35 * Math.PI / 180);
    const lens = { focal, halfW: w / 2, halfH: h / 2, aspect };

    const at = t => {
      const camera = cameraAt(t, aspect, openingHeightFor(MAP_POINTS, gridW, gridH, aspect)), basis = basisAt(camera);
      const out = [];
      for (let i = 0; i < COUNT; i++) {
        const top = columnHeight(i) * COLUMN_HEIGHT;
        for (const level of LEVELS) {
          const p = projectPoint(camera, basis, worldX(i), top * level, worldZ(i), lens.focal, lens.halfW, lens.halfH);
          if (!p || p.sx < 0 || p.sx > w || p.sy < 0 || p.sy > h) continue;
          out.push(p);
        }
      }
      return out;
    };

    // Opening: the whole field is in frame.
    const open = at(0);
    check(open.length >= COUNT * LEVELS.length - 4,
      `${label}: opening frame holds the whole field (${open.length} points)`);

    // Mid-flight: never bare.
    let minMid = Infinity;
    for (let k = 3; k <= 8; k++) minMid = Math.min(minMid, at(k / 20).length);
    check(minMid > 900, `${label}: the flight never goes bare (min ${minMid} points mid-flight)`);

    // Closing: lights reach all four edges.
    const close = at(1);
    const reach = 54;
    const near = (pts, x, y) => pts.some(p => Math.abs(p.sx - x) < reach && Math.abs(p.sy - y) < reach);
    const sample = (fn, n) => { let hit = 0; for (let s = 0; s <= n; s++) { const [x, y] = fn(s / n); if (near(close, x, y)) hit++; } return hit / (n + 1); };
    const edges = {
      top: sample(t => [t * (w - 1), 0], 20),
      bottom: sample(t => [t * (w - 1), h - 1], 20),
      left: sample(t => [0, t * (h - 1)], 20),
      right: sample(t => [w - 1, t * (h - 1)], 20),
    };
    const worst = Math.min(...Object.values(edges));
    check(worst > 0.7,
      `${label}: closing frame reaches every edge (worst ${(worst * 100).toFixed(0)}%; ${Object.entries(edges).map(([k, v]) => k + ' ' + (v * 100).toFixed(0) + '%').join(' ')})`);
  }
}

console.log(failures.length
  ? `\n${failures.length} check(s) failed:\n- ${failures.join('\n- ')}`
  : '\nAll flight checks passed');
process.exit(failures.length ? 1 : 0);
