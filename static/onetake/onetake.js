/* ORCA home — "One Letter", a single unbroken camera take.
 *
 * One particle system re-forms through five shapes while the camera travels
 * a single spline: brain → astrocyte → RNA strand → protein burden → the
 * corrected strand → brain. Scroll only drives a timeline value; the camera
 * and every uniform are pure functions of that value, so scrubbing backwards
 * replays the take exactly in reverse.
 *
 * Everything is procedural: no textures, no models, no remote requests.
 */
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const root = document.querySelector('[data-ot]');
const canvas = root?.querySelector('[data-ot-canvas]');
const story = root?.querySelector('[data-ot-story]');

const reduceQuery = matchMedia('(prefers-reduced-motion: reduce)');
const small = matchMedia('(max-width: 760px)').matches;

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ramp = (p, a, b) => clamp((p - a) / (b - a));
const smooth = (v) => v * v * (3 - 2 * v);
const lerp = (a, b, t) => a + (b - a) * t;

/* ------------------------------------------------------------------ */
/* Deterministic randomness and a small value noise for brain folds.   */
/* ------------------------------------------------------------------ */
let seed = 20260929;
const rnd = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
const sphereDir = () => {
  let x, y, z, d;
  do { x = rnd() * 2 - 1; y = rnd() * 2 - 1; z = rnd() * 2 - 1; d = x * x + y * y + z * z; } while (d > 1 || d < 1e-4);
  d = Math.sqrt(d);
  return [x / d, y / d, z / d];
};
const hash3 = (x, y, z) => {
  let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(z, 1440662683);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};
const vnoise = (x, y, z) => {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = x - xi, yf = y - yi, zf = z - zi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf);
  const c = (a, b, d) => hash3(xi + a, yi + b, zi + d);
  const x00 = lerp(c(0, 0, 0), c(1, 0, 0), u), x10 = lerp(c(0, 1, 0), c(1, 1, 0), u);
  const x01 = lerp(c(0, 0, 1), c(1, 0, 1), u), x11 = lerp(c(0, 1, 1), c(1, 1, 1), u);
  return lerp(lerp(x00, x10, v), lerp(x01, x11, v), w);
};

/* ------------------------------------------------------------------ */
/* Shapes. Each returns {pos: Float32Array(n*3), meta: Float32Array(n)} */
/* ------------------------------------------------------------------ */
/* The opening: a labyrinth drawn inside the brain's silhouette, with one
   faint path wandering through it and doubling back on itself. */
function mazeShape(n) {
  const W = 23, H = 15, S = 0.62;
  const cx = (i) => (i + 0.5 - W / 2) * S, cy = (j) => (j + 0.5 - H / 2) * S;
  const inside = (i, j) => i >= 0 && j >= 0 && i < W && j < H && (cx(i) / 7.1) ** 2 + (cy(j) / 4.5) ** 2 < 1;
  const id = (i, j) => j * W + i;
  const key = (a, b) => (a < b ? `${a}-${b}` : `${b}-${a}`);
  const open = new Set();
  const adj = new Map();
  const link = (a, b) => {
    open.add(key(a, b));
    if (!adj.has(a)) adj.set(a, []); if (!adj.has(b)) adj.set(b, []);
    adj.get(a).push(b); adj.get(b).push(a);
  };
  const mid = H >> 1;
  let si = 0; while (!inside(si, mid)) si++;
  let ei = W - 1; while (!inside(ei, mid)) ei--;
  const seen = new Uint8Array(W * H);
  const stack = [[si, mid]]; seen[id(si, mid)] = 1;
  const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  while (stack.length) {
    const [i, j] = stack[stack.length - 1];
    const next = DIRS.map(([a, b]) => [i + a, j + b]).filter(([a, b]) => inside(a, b) && !seen[id(a, b)]);
    if (!next.length) { stack.pop(); continue; }
    const [a, b] = next[Math.floor(rnd() * next.length)];
    seen[id(a, b)] = 1; link(id(i, j), id(a, b)); stack.push([a, b]);
  }

  const segs = [];
  const wall = (x0, y0, x1, y1) => segs.push([x0, y0, x1, y1]);
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    if (!inside(i, j)) continue;
    const x0 = (i - W / 2) * S, y0 = (j - H / 2) * S, x1 = x0 + S, y1 = y0 + S;
    const has = (a, b) => inside(a, b) && open.has(key(id(i, j), id(a, b)));
    if (!has(i + 1, j) && !(i === ei && j === mid)) wall(x1, y0, x1, y1);
    if (!has(i, j + 1)) wall(x0, y1, x1, y1);
    if (!inside(i - 1, j) && !(i === si && j === mid)) wall(x0, y0, x0, y1);
    if (!inside(i, j - 1)) wall(x0, y0, x1, y0);
  }

  // The wanderer rarely turns back, so it drifts into dead ends and retraces.
  const path = [id(si, mid)];
  let prev = -1;
  for (let k = 0; k < 110; k++) {
    const cur = path[path.length - 1];
    let opts = adj.get(cur) || [];
    if (opts.length > 1 && rnd() < 0.9) opts = opts.filter((o) => o !== prev);
    prev = cur; path.push(opts[Math.floor(rnd() * opts.length)]);
  }
  const pts = path.map((c) => [cx(c % W), cy(Math.floor(c / W))]);
  const cum = [0];
  for (let k = 1; k < pts.length; k++) cum.push(cum[k - 1] + Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]));
  const total = cum[cum.length - 1];

  const bowl = (x, y) => -0.03 * (x * x + y * y);
  const pos = new Float32Array(n * 3);
  const meta = new Float32Array(n);   // -1 wall · 0..1 position along the wandering path
  for (let i = 0; i < n; i++) {
    let x, y;
    const j = sphereDir();
    if (rnd() < 0.06) {
      const u = rnd() * total;
      let k = 1; while (cum[k] < u) k++;
      const t = (u - cum[k - 1]) / Math.max(1e-6, cum[k] - cum[k - 1]);
      x = lerp(pts[k - 1][0], pts[k][0], t) + j[0] * 0.03; y = lerp(pts[k - 1][1], pts[k][1], t) + j[1] * 0.03;
      meta[i] = u / total;
    } else {
      const g = segs[Math.floor(rnd() * segs.length)], t = rnd();
      x = lerp(g[0], g[2], t) + j[0] * 0.022; y = lerp(g[1], g[3], t) + j[1] * 0.022;
      meta[i] = -1;
    }
    pos.set([x, y + 0.2, bowl(x, y) + j[2] * 0.04], i * 3);
  }
  return { pos, meta };
}

/* An anatomical brain: lobes as blended ellipsoids per hemisphere, sampled
   on the surface, then folded into gyri with a warped ridge pattern. */
function brainShape(n) {
  const ell = (p, c, r) => (Math.hypot((p[0] - c[0]) / r[0], (p[1] - c[1]) / r[1], (p[2] - c[2]) / r[2]) - 1) * Math.min(...r);
  const smin = (a, b, k) => { const h = clamp(0.5 + 0.5 * (b - a) / k); return lerp(b, a, h) - k * h * (1 - h); };
  // Local hemisphere frame: +x frontal, +y up, z = distance from the midline.
  const FRONTAL = [[1.95, 0.5, 1.45], [2.6, 2.1, 1.5]];
  const PARIETAL = [[-0.7, 1.0, 1.5], [2.5, 2.05, 1.55]];
  const OCCIPITAL = [[-3.05, 0.05, 1.3], [1.55, 1.7, 1.25]];
  const TEMPORAL = [[0.5, -1.3, 1.75], [2.35, 1.0, 1.2]];
  const CEREB = [[-2.75, -1.95, 1.0], [1.5, 0.92, 1.1]];
  const cortex = (p) => {
    const upper = smin(smin(ell(p, ...FRONTAL), ell(p, ...PARIETAL), 0.9), ell(p, ...OCCIPITAL), 0.8);
    const tem = ell(p, ...TEMPORAL);
    return { d: smin(upper, tem, 0.3), upper, tem };
  };
  const surface = (c, d, f) => {
    let lo = 0, hi = 7;
    for (let k = 0; k < 24; k++) {
      const m = (lo + hi) / 2;
      if (f([c[0] + d[0] * m, c[1] + d[1] * m, c[2] + d[2] * m]) < 0) lo = m; else hi = m;
    }
    return lo;
  };
  const L = (() => { const v = [0.45, 0.75, 0.5], l = Math.hypot(...v); return v.map((x) => x / l); })();
  const lit = (d) => 0.55 + 0.45 * clamp(d[0] * L[0] + d[1] * L[1] + d[2] * L[2]);

  const pos = new Float32Array(n * 3);
  const shade = new Float32Array(n);
  let i = 0;
  while (i < n) {
    const r = rnd();
    const h = rnd() < 0.5 ? -1 : 1;
    let x, y, z, s;
    if (r < 0.8) {
      const c = [-0.2, 0.3, 1.5], d = sphereDir();
      const t = surface(c, d, (q) => cortex(q).d);
      let q = [c[0] + d[0] * t, c[1] + d[1] * t, c[2] + d[2] * t];
      // Gyri: a domain-warped ridge field; sulci are its zero lines.
      const f = 0.95;
      const w = 1.6 * vnoise(q[0] * 0.5 + 5, q[1] * 0.5, q[2] * 0.5 + 2);
      const nv = 0.75 * vnoise(q[0] * f + w, q[1] * f - w * 0.6, q[2] * f + 9) + 0.25 * vnoise(q[0] * 2.1, q[1] * 2.1 + 4, q[2] * 2.1);
      const groove = smooth(clamp(Math.abs(2 * nv - 1) / 0.17));
      if (groove < 0.5 && rnd() < 0.6) continue;
      const { upper, tem } = cortex(q);
      const fiss = smooth(clamp(Math.abs(upper - tem) / 0.28));             // lateral (Sylvian) fissure
      const cs = smooth(clamp(Math.abs((q[0] + 0.25) - (3.1 - q[1]) * 0.4) / 0.14)); // central sulcus
      const csOn = q[1] > 0.2 ? cs : 1;
      const k = t - 0.13 * (1 - groove);
      q = [c[0] + d[0] * k, c[1] + d[1] * k, Math.max(0.09, c[2] + d[2] * k)];
      [x, y, z] = q;
      s = groove * (0.3 + 0.7 * fiss) * (0.35 + 0.65 * csOn) * lit([d[0], d[1], q[2] <= 0.09 ? 0 : d[2]]);
    } else if (r < 0.9) {
      const c = CEREB[0], d = sphereDir();
      const t = surface(c, d, (q) => ell(q, ...CEREB));
      const q = [c[0] + d[0] * t, c[1] + d[1] * t, Math.max(0.06, c[2] + d[2] * t)];
      if (cortex(q).d < -0.05) continue;
      const rr = Math.hypot(q[0] + 2.3, q[1] + 1.4);
      [x, y, z] = q;
      s = (0.3 + 0.7 * Math.abs(Math.sin(rr * 20))) * lit(d);
    } else if (r < 0.95) {
      const t = rnd(), a = rnd() * Math.PI * 2;
      const rr = lerp(0.55, 0.38, t) + 0.22 * Math.exp(-((t - 0.28) ** 2) * 40);   // pons bulge
      x = lerp(-0.95, -0.55, t) + Math.cos(a) * rr * 0.85; y = lerp(-1.5, -4.1, t); z = Math.abs(Math.sin(a) * rr);
      s = (0.45 + 0.3 * rnd()) * lit([Math.cos(a), 0, Math.sin(a)]);
    } else {
      const d = sphereDir(), q = Math.cbrt(rnd());
      x = -0.4 + d[0] * 3.4 * q; y = 0.3 + d[1] * 2.1 * q; z = 1.5 + d[2] * 1.2 * q;
      s = 0.1;
    }
    pos.set([x, y + 0.4, z * h], i * 3);
    shade[i] = s;
    i++;
  }
  return { pos, meta: shade };
}

function astrocyteShape(n) {
  const segs = [];
  const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
  const norm = (a) => { const l = Math.hypot(...a) || 1; return mul(a, 1 / l); };
  const grow = (start, dir, len, r0, depth) => {
    const end = add(start, mul(dir, len));
    const ctrl = add(add(start, mul(dir, len * 0.5)), mul(sphereDir(), len * 0.28));
    const r1 = r0 * 0.5;
    segs.push({ a: start, c: ctrl, b: end, r0, r1, w: len * (r0 + r1) });
    if (depth < 2) {
      const kids = depth === 0 ? 3 : 2;
      for (let k = 0; k < kids; k++) grow(end, norm(add(dir, mul(sphereDir(), 0.85))), len * 0.62, r1, depth + 1);
    } else {
      segs.push({ a: end, c: end, b: end, r0: 0.14, r1: 0.14, w: 0.08, bulb: true });
    }
  };
  for (let i = 0; i < 12; i++) {
    const d = sphereDir();
    grow(mul(d, 0.8), d, 1.7 + rnd() * 1.1, 0.26, 0);
  }
  const total = segs.reduce((s, g) => s + g.w, 0);
  const cdf = []; let acc = 0;
  for (const g of segs) { acc += g.w / total; cdf.push(acc); }

  const pos = new Float32Array(n * 3);
  const meta = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    let p;
    if (rnd() < 0.24) {
      const d = sphereDir();
      const r = 1.05 * (0.88 + 0.12 * rnd()) * (1 + 0.18 * (vnoise(d[0] * 2, d[1] * 2, d[2] * 2) - 0.5));
      p = mul(d, rnd() < 0.8 ? r : r * Math.cbrt(rnd()));
      meta[i] = 1;
    } else {
      const u = rnd();
      let j = 0; while (cdf[j] < u && j < cdf.length - 1) j++;
      const g = segs[j];
      const t = rnd(), it = 1 - t;
      const c = [0, 1, 2].map((k) => it * it * g.a[k] + 2 * it * t * g.c[k] + t * t * g.b[k]);
      const rr = lerp(g.r0, g.r1, t) * Math.sqrt(rnd());
      p = add(c, mul(sphereDir(), rr));
      meta[i] = g.bulb ? 0.9 : 0.55 + 0.3 * (1 - t);
    }
    pos.set(mul(p, 1.12), i * 3);
  }
  return { pos, meta };
}

const STRAND = { centerX: -22, half: 22, radius: 1.05, pitch: 6.2, baseStep: 0.62 };
function strandShape(n) {
  const { centerX, half, radius, pitch, baseStep } = STRAND;
  const pos = new Float32Array(n * 3);
  const kind = new Float32Array(n);        // 0 backbone · 1 base · 2 target base
  const theta = (x) => (x / pitch) * Math.PI * 2;
  const bases = Math.floor((half * 2) / baseStep);
  const targetIndex = Math.round(half / baseStep);
  for (let i = 0; i < n; i++) {
    const r = rnd();
    let x, y, z;
    if (r < 0.03) {
      // The single letter that matters: a dense glowing knot on its stub.
      const bx = targetIndex * baseStep - half;
      const d = sphereDir(), q = Math.cbrt(rnd()) * 0.3;
      const t = rnd();
      const rr = lerp(radius, 0.15, t);
      x = bx + d[0] * q; y = Math.cos(theta(bx)) * rr + d[1] * q * 0.6; z = Math.sin(theta(bx)) * rr + d[2] * q;
      kind[i] = 2;
    } else if (r < 0.55) {
      x = (rnd() * 2 - 1) * half;
      const th = theta(x), j = sphereDir(), w = 0.075;
      y = Math.cos(th) * radius + j[1] * w; z = Math.sin(th) * radius + j[2] * w; x += j[0] * w;
      kind[i] = 0;
    } else {
      let b = Math.floor(rnd() * bases);
      if (b === targetIndex) b = (b + 1) % bases;
      const bx = b * baseStep - half, th = theta(bx), t = rnd();
      const rr = lerp(radius, 0.2, t), j = sphereDir(), w = 0.05;
      x = bx + j[0] * w; y = Math.cos(th) * rr + j[1] * w; z = Math.sin(th) * rr + j[2] * w;
      kind[i] = 1;
    }
    pos.set([x + centerX, y, z], i * 3);
  }
  const tx = targetIndex * baseStep - half;
  const target = new THREE.Vector3(tx + centerX, Math.cos(theta(tx)) * radius * 0.58, Math.sin(theta(tx)) * radius * 0.58);
  return { pos, meta: kind, target };
}

/* Sort a shape's points left-to-right so particle i travels locally between
   shapes: the brain unrolls into the strand instead of exploding. */
function sortShape(shape, n) {
  const order = Array.from({ length: n }, (_, i) => i);
  const key = (i) => shape.pos[i * 3] + 0.3 * shape.pos[i * 3 + 1] + 0.12 * shape.pos[i * 3 + 2];
  order.sort((a, b) => key(a) - key(b));
  const pos = new Float32Array(n * 3), meta = new Float32Array(n);
  order.forEach((src, dst) => {
    pos[dst * 3] = shape.pos[src * 3]; pos[dst * 3 + 1] = shape.pos[src * 3 + 1]; pos[dst * 3 + 2] = shape.pos[src * 3 + 2];
    meta[dst] = shape.meta[src];
  });
  return { ...shape, pos, meta };
}

/* ------------------------------------------------------------------ */
/* Shaders                                                             */
/* ------------------------------------------------------------------ */
const NOISE = /* glsl */`
vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1./6.,1./3.);const vec4 D=vec4(0.,.5,1.,2.);
  vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
  float n_=.142857142857;vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.*x_);
  vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.+1.;vec4 s1=floor(b1)*2.+1.;vec4 sh=-step(h,vec4(0.));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);m=m*m;
  return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`;

const particleVertex = /* glsl */`
uniform float uTime, uStage, uIntro, uBurden, uFix, uWave, uTurb, uPR, uSize, uRot, uMotion, uAspect, uMouseOn;
uniform vec2 uMouse;
attribute vec3 aMaze, aBrain, aCell, aStrand, aClump;
attribute float aMazeK;  // -1 maze wall · 0..1 along the wandering path
attribute vec4 aInfo;   // brain shade · strand kind · clumpy · strand x (-1..1)
attribute vec4 aRnd;    // delay · size · phase · spare
varying vec3 vColor;
varying float vAlpha;
${NOISE}
float morph(float x, float d){ return smoothstep(0., 1., clamp((x - d * .45) / .55, 0., 1.)); }
void main(){
  float kind = aInfo.y;
  float dust = step(2.5, kind);
  float d = aRnd.x;
  float c = cos(uRot), s = sin(uRot);
  vec3 brain = vec3(c * aBrain.x + s * aBrain.z, aBrain.y, -s * aBrain.x + c * aBrain.z);

  float e0 = morph(uStage + 1., d);
  float e1 = morph(uStage, d), e2 = morph(uStage - 1., d), e3 = morph(uStage - 2., d);
  float e4 = morph(uStage - 3., d), e5 = morph(uStage - 4., d);
  vec3 p = mix(aMaze, brain, e0);
  p = mix(p, aCell, e1);
  p = mix(p, aStrand, e2);
  p = mix(p, aClump, e3);
  p = mix(p, aStrand, e4);
  p = mix(p, brain, e5);

  // Particles travel on curling currents while between shapes.
  float energy = 4. * (e0*(1.-e0) + e1*(1.-e1) + e2*(1.-e2) + e3*(1.-e3) + e4*(1.-e4) + e5*(1.-e5));
  vec3 q = p * .16 + vec3(aRnd.z * .2, 0., uTime * .04);
  vec3 flow = vec3(snoise(q), snoise(q + vec3(31.4, 0., 0.)), snoise(q + vec3(0., 17.2, 0.)));
  float onStrand = e2 * (1. - e5);
  p += flow * (energy * 2.4 + uMotion * (mix(.012, .045, e0) + uTurb * .5 * onStrand + .16 * uBurden * aInfo.z * e3 * (1. - e4)));

  // Intro: gather from a wide scatter into the brain.
  vec3 scatter = normalize(vec3(aRnd.y - .5, aRnd.z - .5, aRnd.w - .5) + 1e-3) * (16. + aRnd.w * 18.);
  float intro = smoothstep(0., 1., clamp(uIntro * 1.6 - d * .6, 0., 1.));
  p = mix(scatter, p, intro);
  p = mix(p, aBrain + flow * .6 * uMotion, dust);

  // Colour.
  vec3 ice = vec3(.62, .82, 1.), deep = vec3(.10, .22, .72), coral = vec3(1., .36, .26);
  vec3 mint = vec3(.36, 1., .72), violet = vec3(.52, .40, 1.);
  float shade = aInfo.x;
  vec3 col = mix(deep, ice, shade);
  vec3 cellCol = mix(violet, ice, aRnd.w * .6 + .2);
  col = mix(col, cellCol, e1 * (1. - e2));
  float isBase = step(.5, kind) * (1. - step(1.5, kind));
  float isTarget = step(1.5, kind) * (1. - dust);
  vec3 strandCol = mix(ice, deep * 1.6, isBase * .6);
  col = mix(col, strandCol, onStrand);
  float clumped = aInfo.z * e3 * (1. - e4);
  col = mix(col, coral, clumped * (.35 + .65 * uBurden));
  col = mix(col, mix(coral, mint, uFix) * 1.6, isTarget * onStrand);
  float front = abs(abs(aInfo.w) - uWave * 1.05);
  float wave = exp(-front * front * 90.) * step(.001, uWave) * (1. - smoothstep(.9, 1., uWave)) * onStrand;
  col = mix(col, mint * 1.8, wave);
  col = mix(col, mix(col, mint, .22 * shade), e5);
  // The maze: cold dim walls, one amber path with a travelling head.
  float onPath = step(-.5, aMazeK);
  float head = fract(uTime * .045);
  float lag = fract(head - aMazeK);
  float glow = onPath * (exp(-lag * 22.) + .25 * exp(-lag * 3.));
  vec3 mazeCol = mix(vec3(.30, .45, .95), vec3(1., .62, .32) * (.5 + 1.6 * glow), onPath);
  col = mix(mazeCol, col, e0);
  col = mix(col, vec3(.45, .55, .9), dust);

  float alpha = mix(.32 + .5 * shade, .55, e1 * (1. - e5));
  alpha = mix(alpha, .6 - .25 * isBase, onStrand);
  alpha = mix(alpha, .85, isTarget * onStrand);
  alpha *= mix(1., smoothstep(1., .55, abs(aInfo.w)), onStrand * (1. - clumped));
  alpha = mix(mix(.42, .18 + .8 * glow, onPath), alpha, e0);
  alpha = mix(alpha, .35, dust);
  alpha *= mix(.08, 1., intro);

  vec4 mv = modelViewMatrix * vec4(p, 1.);
  gl_Position = projectionMatrix * mv;

  // Pointer parts the particles in screen space.
  vec2 ndc = gl_Position.xy / gl_Position.w;
  vec2 dm = (ndc - uMouse) * vec2(uAspect, 1.);
  float push = exp(-dot(dm, dm) * 14.) * .07 * uMouseOn * (1. - dust);
  gl_Position.xy += normalize(dm + 1e-5) * push * gl_Position.w;

  float size = uSize * (.55 + aRnd.y * .9);
  size *= 1. + isTarget * onStrand * 1.6 + wave * 1.4 + clumped * .5;
  size *= 1. + glow * 1.4 * (1. - e0);
  size *= mix(1., .7, dust);
  gl_PointSize = max(1., size * uPR * (14. / -mv.z));
  alpha *= smoothstep(.6, 2.2, -mv.z);
  vColor = col;
  vAlpha = alpha;
}`;

const particleFragment = /* glsl */`
varying vec3 vColor;
varying float vAlpha;
void main(){
  float r = length(gl_PointCoord - .5);
  float a = smoothstep(.5, 0., r);
  gl_FragColor = vec4(vColor, a * a * vAlpha);
}`;

/* The editor: a fresnel-lit ring that finds the letter and closes on it. */
const ringVertex = /* glsl */`
varying vec3 vN; varying vec3 vV;
void main(){
  vec4 mv = modelViewMatrix * vec4(position, 1.);
  vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}`;
const ringFragment = /* glsl */`
uniform vec3 uColor; uniform float uOpacity;
varying vec3 vN; varying vec3 vV;
void main(){
  float f = pow(1. - abs(dot(vN, vV)), 2.2);
  gl_FragColor = vec4(uColor * (.25 + 2.2 * f), (.15 + .85 * f) * uOpacity);
}`;

/* Final grade: chromatic aberration toward the edges, film grain, vignette. */
const GradeShader = {
  uniforms: { tDiffuse: { value: null }, uTime: { value: 0 }, uAberration: { value: .0007 }, uGrain: { value: .035 } },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,
  fragmentShader: /* glsl */`
    uniform sampler2D tDiffuse; uniform float uTime, uAberration, uGrain; varying vec2 vUv;
    float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    void main(){
      vec2 c = vUv - .5; float d = dot(c, c);
      vec2 o = c * smoothstep(.04, .35, d) * uAberration * 20.;
      vec4 col = texture2D(tDiffuse, vUv);
      col.r = texture2D(tDiffuse, vUv + o).r;
      col.b = texture2D(tDiffuse, vUv - o).b;
      col.rgb *= smoothstep(.95, .18, d * 1.9);
      col.rgb += (hash(vUv * 1000. + fract(uTime) * 91.) - .5) * uGrain;
      gl_FragColor = col;
    }`,
};

/* ------------------------------------------------------------------ */
/* The take: camera keyframes over the scroll track.                   */
/* ------------------------------------------------------------------ */
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const KEYS = [
  { p: -0.19, stage: -1, cam: V(0, 0.1, 17.5), look: V(0, 0.2, 0) },
  { p: -0.075, stage: -1, cam: V(-2.2, -1.2, 13.8), look: V(-0.4, 0, 0) },
  { p: 0.03, stage: 0, cam: V(1.2, 0.5, 15.5), look: V(0, 0.2, 0) },
  { p: 0.10, stage: 0, cam: V(3.2, 1.0, 14.5), look: V(0, 0.2, 0) },
  { p: 0.19, stage: 0, cam: V(-2.6, 1.4, 13), look: V(0, 0.2, 0) },
  { p: 0.26, stage: 1, cam: V(1.4, 0.6, 9.6), look: V(0, 0, 0) },
  { p: 0.33, stage: 1, cam: V(-1.8, 1.4, 8.4), look: V(0, 0, 0) },
  // Follow the RNA continuously left; its target base stays ahead of us.
  { p: 0.43, stage: 2, cam: V(-9, 2.6, 9.5), look: V(-10, 0, 0) },
  { p: 0.51, stage: 2, cam: V(-16.5, 1.6, 6.8), look: V(-20, 0.3, 0) },
  { p: 0.58, stage: 2, cam: V(-20.5, 0.9, 4.4), look: V(-21, 0.6, 0) },
  { p: 0.68, stage: 3, cam: V(-21.3, 2.2, 14), look: V(-22, 0, 0) },
  { p: 0.77, stage: 3, cam: V(-22.8, 3.2, 17), look: V(-22, -0.5, 0) },
  { p: 0.84, stage: 4, cam: V(-23.1, 1.0, 5.0), look: V(-22, 0.6, 0) },
  { p: 0.885, stage: 4, cam: V(-24.5, 1.8, 10), look: V(-22, 0.3, 0) },
  { p: 0.94, stage: 5, cam: V(0.6, 0.6, 15), look: V(0, 0.3, 0) },
  { p: 1.00, stage: 5, cam: V(-0.8, 0.5, 16.5), look: V(0, 0.3, 0) },
];
// Let the leftward RNA journey run longer, with lighter pacing elsewhere.
// The longer CSS track keeps morphs at their original scroll speed.
// Text, camera and effects all use this same reversible timeline mapping.
const HOLD_WEIGHT = 1.6;
const RNA_HOLD_WEIGHT = 3.6;
let trackLength = 0;
const TRACK = KEYS.slice(1).map((key, i) => {
  const previous = KEYS[i];
  const start = trackLength;
  const weight = key.stage === previous.stage ? (key.stage === 2 ? RNA_HOLD_WEIGHT : HOLD_WEIGHT) : 1;
  trackLength += (key.p - previous.p) * weight;
  return { start, end: trackLength, from: previous.p, to: key.p };
});
function takeOf(p) {
  const distance = p * trackLength;
  const segment = TRACK.find((part) => distance <= part.end) || TRACK[TRACK.length - 1];
  return lerp(segment.from, segment.to, (distance - segment.start) / (segment.end - segment.start));
}
const camCurve = new THREE.CatmullRomCurve3(KEYS.map((k) => k.cam), false, 'centripetal');
const lookCurve = new THREE.CatmullRomCurve3(KEYS.map((k) => k.look), false, 'centripetal');

function sample(p) {
  let i = 0;
  while (i < KEYS.length - 2 && p > KEYS[i + 1].p) i++;
  const a = KEYS[i], b = KEYS[i + 1];
  const u = clamp((p - a.p) / (b.p - a.p));
  const t = (i + u) / (KEYS.length - 1);
  return { t, stage: lerp(a.stage, b.stage, smooth(u)) };
}

/* ------------------------------------------------------------------ */
/* DOM choreography                                                    */
/* ------------------------------------------------------------------ */
function setupDom() {
  const chapters = [...document.querySelectorAll('[data-ot-chapter]')].map((el) => ({
    el, a: parseFloat(el.dataset.in), b: parseFloat(el.dataset.out),
  }));
  const counters = [...document.querySelectorAll('[data-ot-count]')];
  const bar = document.querySelector('.ot-bar');
  return (p, live) => {
    bar.classList.toggle('is-story-ended', p >= 1);
    for (const c of chapters) c.el.classList.toggle('is-on', p >= c.a && p < c.b);
    for (const el of counters) {
      const k = smooth(ramp(p, +el.dataset.from, +el.dataset.to));
      el.textContent = `${Math.round(+el.dataset.target * (live ? k : 1)).toLocaleString('en-US')}+`;
    }
  };
}

function setupMenu() {
  const btn = document.querySelector('[data-ot-menu-btn]');
  const menu = document.querySelector('[data-ot-menu]');
  if (!btn || !menu) return;
  btn.hidden = false;
  document.querySelector('[data-ot-menu-fallback]').hidden = true;
  const set = (open) => {
    btn.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('ot-menu-open', open);
    for (const el of document.querySelectorAll('main, .site-footer, [data-back-to-top]')) el.inert = open;
    if (open) { menu.hidden = false; requestAnimationFrame(() => menu.classList.add('is-open')); menu.querySelector('a')?.focus(); }
    else { menu.classList.remove('is-open'); menu.hidden = true; }
  };
  btn.addEventListener('click', () => set(btn.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { set(false); btn.focus(); } });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab' || btn.getAttribute('aria-expanded') !== 'true') return;
    const links = [...menu.querySelectorAll('a[href]')];
    const last = links[links.length - 1];
    if (e.shiftKey && document.activeElement === btn) { e.preventDefault(); last?.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); btn.focus(); }
  });
}

/* ------------------------------------------------------------------ */
/* Boot                                                                */
/* ------------------------------------------------------------------ */
function webglAvailable() {
  try { return !!document.createElement('canvas').getContext('webgl2'); } catch { return false; }
}

function showStatic() {
  root?.classList.add('ot--static', 'is-ready');
  for (const el of document.querySelectorAll('[data-ot-count]')) {
    el.textContent = `${Number(el.dataset.target).toLocaleString('en-US')}+`;
  }
}

function boot() {
  if (!root || !canvas || !story) return;
  setupMenu();
  const updateDom = setupDom();
  const letter = document.querySelector('[data-ot-letter]');

  // ?p=0.55 pins the take to one frame (review screenshots).
  const pinned = parseFloat(new URLSearchParams(location.search).get('p'));
  const progressOf = () => {
    if (!Number.isNaN(pinned)) return pinned;
    const r = story.getBoundingClientRect();
    return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1.2);
  };

  if (reduceQuery.matches || !webglAvailable()) {
    showStatic();
    return;
  }
  root.classList.remove('ot--static');

  const N = small ? 26000 : 64000;
  const DUST = Math.floor(N * 0.07);
  const M = N - DUST;

  const maze = sortShape(mazeShape(M), M);
  const brain = sortShape(brainShape(M), M);
  const cell = sortShape(astrocyteShape(M), M);
  const strand = sortShape(strandShape(M), M);

  // Burden: ~40% of particles leave the strand and gather into aggregates.
  const clumps = Array.from({ length: 34 }, () => {
    const x = STRAND.centerX + (rnd() * 2 - 1) * 15 * Math.sqrt(rnd());
    const a = rnd() * Math.PI * 2, d = 1.7 + rnd() * 2.8;
    return { c: [x, Math.cos(a) * d, Math.sin(a) * d], r: 0.35 + rnd() * 0.75 };
  });
  const clumpPos = new Float32Array(N * 3);
  const info = new Float32Array(N * 4);
  const rand4 = new Float32Array(N * 4);
  const mazePos = new Float32Array(N * 3), mazeK = new Float32Array(N).fill(-1);
  mazePos.set(maze.pos); mazeK.set(maze.meta);
  const brainPos = new Float32Array(N * 3), cellPos = new Float32Array(N * 3), strandPos = new Float32Array(N * 3);
  brainPos.set(brain.pos); cellPos.set(cell.pos); strandPos.set(strand.pos);

  for (let i = 0; i < N; i++) {
    const isDust = i >= M;
    if (isDust) {
      const d = sphereDir(), r = 12 + rnd() * 30;
      const p = [d[0] * r * 1.4, d[1] * r * 0.8, d[2] * r - 6];
      mazePos.set(p, i * 3); brainPos.set(p, i * 3); cellPos.set(p, i * 3); strandPos.set(p, i * 3); clumpPos.set(p, i * 3);
      info.set([0.3, 3, 0, 0], i * 4);
    } else {
      const kind = strand.meta[i];
      const clumpy = kind < 1.5 && rnd() < 0.4 ? 1 : 0;
      if (clumpy) {
        const k = clumps[Math.floor(rnd() * clumps.length)];
        const d = sphereDir(), q = k.r * Math.pow(rnd(), 0.6);
        clumpPos.set([k.c[0] + d[0] * q, k.c[1] + d[1] * q, k.c[2] + d[2] * q], i * 3);
      } else {
        clumpPos.set(strand.pos.subarray(i * 3, i * 3 + 3), i * 3);
      }
      info.set([brain.meta[i], kind, clumpy, (strand.pos[i * 3] - STRAND.centerX) / STRAND.half], i * 4);
    }
    rand4.set([rnd(), rnd(), rnd(), rnd()], i * 4);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(brainPos, 3));
  geometry.setAttribute('aMaze', new THREE.BufferAttribute(mazePos, 3));
  geometry.setAttribute('aMazeK', new THREE.BufferAttribute(mazeK, 1));
  geometry.setAttribute('aBrain', new THREE.BufferAttribute(brainPos, 3));
  geometry.setAttribute('aCell', new THREE.BufferAttribute(cellPos, 3));
  geometry.setAttribute('aStrand', new THREE.BufferAttribute(strandPos, 3));
  geometry.setAttribute('aClump', new THREE.BufferAttribute(clumpPos, 3));
  geometry.setAttribute('aInfo', new THREE.BufferAttribute(info, 4));
  geometry.setAttribute('aRnd', new THREE.BufferAttribute(rand4, 4));
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 80);

  const uniforms = {
    uTime: { value: 0 }, uStage: { value: 0 }, uIntro: { value: 0 }, uBurden: { value: 0 },
    uFix: { value: 0 }, uWave: { value: 0 }, uTurb: { value: 0 }, uPR: { value: 1 },
    uSize: { value: small ? 2.6 : 2.2 }, uRot: { value: 0 }, uMotion: { value: 1 },
    uAspect: { value: 1 }, uMouse: { value: new THREE.Vector2(9, 9) }, uMouseOn: { value: 0 },
  };
  const material = new THREE.ShaderMaterial({
    uniforms, vertexShader: particleVertex, fragmentShader: particleFragment,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const points = new THREE.Points(geometry, material);

  const ringUniforms = { uColor: { value: new THREE.Color(0x5cffb8) }, uOpacity: { value: 0 } };
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.62, 0.035, 24, 128),
    new THREE.ShaderMaterial({ uniforms: ringUniforms, vertexShader: ringVertex, fragmentShader: ringFragment, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }),
  );

  const scene = new THREE.Scene();
  scene.add(points, ring);
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 200);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance' });
  renderer.setClearColor(0x03050b, 1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.85, 0.55, 0.12);
  composer.addPass(bloom);
  const grade = new ShaderPass(GradeShader);
  composer.addPass(grade);
  composer.addPass(new OutputPass());

  const resize = () => {
    const w = innerWidth, h = innerHeight;
    const pr = Math.min(devicePixelRatio, small ? 1.5 : 1.75);
    renderer.setPixelRatio(pr); renderer.setSize(w, h, false);
    composer.setPixelRatio(pr); composer.setSize(w, h);
    bloom.resolution.set(w, h);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    uniforms.uPR.value = pr; uniforms.uAspect.value = w / h;
  };
  resize();
  addEventListener('resize', resize);

  const mouse = new THREE.Vector2(9, 9), mouseSmooth = new THREE.Vector2(0, 0);
  let mouseOn = 0;
  addEventListener('pointermove', (e) => {
    mouse.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    mouseOn = e.pointerType === 'mouse' ? 1 : 0;
  }, { passive: true });
  document.addEventListener('pointerleave', () => { mouseOn = 0; });

  let reduce = reduceQuery.matches;
  reduceQuery.addEventListener?.('change', (e) => { reduce = e.matches; });

  const camPos = new THREE.Vector3(), camLook = new THREE.Vector3(), tmp = new THREE.Vector3();
  const clock = new THREE.Clock();
  let p = progressOf(), time = Number.isNaN(pinned) ? 0 : 4, intro = 0, started = false;

  function frame() {
    const dt = Math.min(clock.getDelta(), 0.05);
    const target = progressOf();
    p = reduce ? target : p + (target - p) * (1 - Math.exp(-dt * 5.5));
    if (Math.abs(target - p) < 1e-5) p = target;
    const q = takeOf(p);
    const P = clamp(q, -1, 1);
    updateDom(q, !reduce && Number.isNaN(pinned));
    const motion = reduce ? 0 : 1;
    time += dt * motion;
    intro = reduce || !Number.isNaN(pinned) ? 1 : Math.min(1, intro + dt / 3.2);

    const { t, stage } = sample(P);
    camCurve.getPoint(t, camPos); lookCurve.getPoint(t, camLook);
    // Narrow screens: pull the camera back along its own axis.
    const aspect = innerWidth / innerHeight;
    const pull = Math.max(1, 1.15 / aspect);
    camPos.sub(camLook).multiplyScalar(pull).add(camLook);
    mouseSmooth.lerp(mouseOn ? mouse : tmp.set(0, 0, 0), 1 - Math.exp(-dt * 3));
    camPos.x += mouseSmooth.x * 0.5 * motion; camPos.y += mouseSmooth.y * 0.3 * motion;
    // Intro dolly: the take opens slightly further out.
    camPos.z += (1 - smooth(intro)) * 6;
    camera.position.copy(camPos); camera.lookAt(camLook);
    // Keep the C/U overlay aligned with this frame's camera before projection.
    camera.updateMatrixWorld();

    uniforms.uTime.value = time;
    uniforms.uStage.value = stage;
    uniforms.uIntro.value = intro;
    uniforms.uRot.value = reduce ? 0.3 : 0.3 + Math.sin(time * 0.12) * 0.4;
    uniforms.uBurden.value = ramp(P, 0.6, 0.7) * (1 - ramp(P, 0.8, 0.86));
    uniforms.uTurb.value = ramp(P, 0.6, 0.72) * (1 - ramp(P, 0.79, 0.85));
    uniforms.uFix.value = smooth(ramp(P, 0.815, 0.845));
    uniforms.uWave.value = ramp(P, 0.835, 0.885);
    uniforms.uMotion.value = motion;
    uniforms.uMouse.value.copy(mouseSmooth);
    uniforms.uMouseOn.value = mouseOn * motion;

    // The editor ring: arrives along the strand, closes on the letter, leaves.
    const ringIn = smooth(ramp(P, 0.79, 0.825)), ringOut = smooth(ramp(P, 0.87, 0.9));
    ring.position.copy(strand.target);
    ring.position.x += (1 - ringIn) * -9 + ringOut * 9;
    ring.rotation.set(0, Math.PI / 2, 0);
    ring.scale.setScalar(lerp(1.8, 1, ringIn) * lerp(1, 0.6, ringOut));
    ringUniforms.uOpacity.value = ringIn * (1 - ringOut);

    grade.uniforms.uTime.value = time;
    bloom.strength = 0.75 + 0.12 * uniforms.uFix.value * (1 - ramp(P, 0.9, 1)) + 0.25 * ramp(P, 0.52, 0.58) * (1 - ramp(P, 0.6, 0.66));

    // Project the letter onto the page so the type sits on the particle knot.
    const letterOn = ramp(P, 0.515, 0.54) * (1 - ramp(P, 0.6, 0.625)) + ramp(P, 0.81, 0.83) * (1 - ramp(P, 0.885, 0.905));
    if (letterOn > 0.001) {
      tmp.copy(strand.target).project(camera);
      letter.style.transform = `translate3d(${(tmp.x * 0.5 + 0.5) * innerWidth}px, ${(-tmp.y * 0.5 + 0.5) * innerHeight}px, 0) translate(-50%, -115%)`;
    }
    letter.style.opacity = letterOn.toFixed(3);
    letter.style.setProperty('--fix', uniforms.uFix.value.toFixed(3));

    root.style.setProperty('--ot-p', P.toFixed(4));
    composer.render();
    if (!started) { started = true; root.classList.add('is-ready'); }
    raf = requestAnimationFrame(frame);
  }
  let raf = requestAnimationFrame(frame);
  let contextLost = false;
  canvas.addEventListener('webglcontextlost', () => {
    contextLost = true;
    cancelAnimationFrame(raf);
    showStatic();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else if (!contextLost) { clock.getDelta(); raf = requestAnimationFrame(frame); }
  });
}

try {
  boot();
} catch (error) {
  showStatic();
  console.warn('Particle scene unavailable; showing the readable home page.', error);
}
