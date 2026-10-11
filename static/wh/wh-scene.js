/* ORCA — white-hole portal: the WebGL stage.
 *
 * One fullscreen quad carries the deep-space grading, the starfield, the white
 * hole, the halo and the lens distortion. Two point/line systems sit in front of
 * it: the ambient particle field and the RNA helix that straightens into light
 * lines as the camera pushes through.
 *
 * The stage is created per hop and disposed the moment the animation finishes,
 * so the transition never holds a GPU context while the user reads the site.
 *
 * Colours are written to the framebuffer verbatim (colour management off) so the
 * shader palette matches the CSS palette exactly.
 */

import * as THREE from '../vendor/three/three.module.js';

const PAL = {
  navy: 0x06142e,
  indigo: 0x101d42,
  ice: 0x91c7ff,
  peri: 0x929fff,
  gold: 0xf4d69a,
  pink: 0xf4a7be,
  mint: 0x98e7ca,
  warm: 0xf8f7f4,
};

/* ---------------------------------------------------------------- shaders -- */

const QUAD_VERT = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const QUAD_FRAG = `
precision highp float;

uniform vec2  uRes;
uniform float uTime;
uniform float uCore;
uniform float uPortal;
uniform float uHalo;
uniform float uDistort;
uniform float uPush;
uniform float uFlood;
uniform float uAlpha;

varying vec2 vUv;

float h21(vec2 p) {
  p = fract(p * vec2(127.1, 311.7));
  p += dot(p, p + 34.56);
  return fract(p.x * p.y);
}

/* Sparse twinkling stars. Three calls at different scales give three depths. */
float stars(vec2 uv, float scale, float t, float thresh) {
  vec2 g = uv * scale;
  vec2 id = floor(g);
  vec2 f = fract(g) - 0.5;
  float h = h21(id);
  if (h < thresh) return 0.0;
  vec2 off = (vec2(h21(id + 3.7), h21(id + 9.1)) - 0.5) * 0.66;
  float d = length(f - off);
  float tw = 0.55 + 0.45 * sin(t * 1.7 + h * 62.0);
  return smoothstep(0.055, 0.0, d) * tw * (0.45 + h * 0.55);
}

void main() {
  vec2 uv = vUv;
  float aspect = uRes.x / max(uRes.y, 1.0);
  float screenR = length((uv - 0.5) * vec2(aspect, 1.0));

  /* ---- lens: a swirl plus a radial squeeze, both local to the portal ---- */
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);
  float portal2 = max(uPortal * uPortal * 0.55, 1e-4);
  float fall = exp(-dot(p, p) / portal2);

  float swirl = uDistort * 1.15 * fall;
  float cs = cos(swirl), sn = sin(swirl);
  vec2 q = vec2(cs * p.x - sn * p.y, sn * p.x + cs * p.y);
  q *= 1.0 - uDistort * 0.32 * fall;
  vec2 suv = q * vec2(1.0 / aspect, 1.0) + 0.5;
  float sr = length(q);

  /* ---- deep space grade: navy into indigo, never flat black ---- */
  vec3 col = mix(uNavyHack(), uIndigoHack(), smoothstep(0.0, 0.9, sr));

  /* ---- nebula wisps ---- */
  float neb = exp(-pow(length(q - vec2(-0.36, 0.20)) * 1.85, 2.0)) * 0.55
            + exp(-pow(length(q - vec2(0.44, -0.26)) * 2.35, 2.0)) * 0.38
            + exp(-pow(length(q - vec2(0.06, 0.50)) * 3.10, 2.0)) * 0.26;
  col += mix(vec3(0.06, 0.11, 0.26), vec3(0.57, 0.78, 1.00), 0.5) * neb * 0.75;

  /* ---- starfield, three depths ---- */
  float st = stars(suv, 44.0, uTime, 0.900) * 0.50
           + stars(suv * 1.9 + 11.0, 92.0, uTime * 1.35, 0.930) * 0.80
           + stars(suv * 3.1 + 27.0, 168.0, uTime * 1.90, 0.958) * 1.10;
  col += mix(vec3(0.57, 0.78, 1.00), vec3(0.97, 0.97, 0.96), 0.35) * st * st * 0.30;

  /* ---- radial streaks: the stretch you feel as the camera accelerates ---- */
  float ang = atan(p.y, p.x);
  float band = fract(ang * 3.5013 + h21(vec2(floor(ang * 7.0), 0.0)) * 0.9);
  float sb = abs(band - 0.5) * 2.0;
  float streak = pow(1.0 - sb, 5.0) * exp(-screenR * 0.85) * uPush;
  col += vec3(0.57, 0.78, 1.00) * streak * 0.40;

  /* ---- halo: an irregular rotating ring riding the portal edge ---- */
  float ripple = 0.5
    + 0.28 * sin(ang * 3.0 + uTime * 0.55)
    + 0.14 * sin(ang * 5.0 - uTime * 0.90 + 1.7)
    + 0.09 * sin(ang * 8.0 + uTime * 1.40);
  float rw = max(uPortal * 0.17, 0.006);
  float ring = exp(-pow((sr - uPortal * 1.06) / rw, 2.0));
  col += vec3(0.57, 0.78, 1.00) * ring * uHalo * (0.30 + ripple * 0.85);

  /* A thin gold seam — the only place gold is allowed to sit. */
  float seam = exp(-pow((sr - uPortal * 0.985) / (rw * 0.30), 2.0));
  col += vec3(0.96, 0.84, 0.60) * seam * uHalo * 0.34;

  /* Pink and mint only ever tint the ring asymmetrically. */
  col += vec3(0.96, 0.65, 0.75) * ring * uHalo * 0.15 * max(sin(ang * 2.0 + uTime * 0.40), 0.0);
  col += vec3(0.60, 0.91, 0.79) * ring * uHalo * 0.11 * max(sin(ang * 3.0 - uTime * 0.60 + 2.2), 0.0);

  /* ---- the core: a disc with a wide soft bloom, layered over the halo ---- */
  float disc = 1.0 - smoothstep(uCore * 0.30, uCore, sr);
  float bloom = exp(-sr / max(uCore * 1.45, 1e-4));
  col += mix(vec3(0.57, 0.78, 1.00), vec3(0.97, 0.97, 0.96), 0.62) * bloom * uCore * 2.4;
  col = mix(col, vec3(0.97, 0.97, 0.96), clamp(disc, 0.0, 1.0));

  /* ---- flood, and the coverage that irises the portal open ---- */
  col = mix(col, vec3(0.973, 0.969, 0.957), clamp(uFlood, 0.0, 1.0));

  float cover = 1.0 - smoothstep(uPortal * 0.94, uPortal * 1.12, screenR);
  float alpha = clamp(max(uAlpha, max(cover, uFlood)), 0.0, 1.0);
  alpha *= 1.0 - 0.06 * smoothstep(0.8, 1.35, screenR);

  gl_FragColor = vec4(col, alpha);
}
`;

/* GLSL has no way to read the JS palette, so the two colours the grade needs
   are injected as literals before compilation. */
function quadFragment() {
  return QUAD_FRAG
    .replace('uNavyHack()', glslVec3(PAL.navy))
    .replace('uIndigoHack()', glslVec3(PAL.indigo));
}

function glslVec3(hex) {
  const r = ((hex >> 16) & 255) / 255;
  const g = ((hex >> 8) & 255) / 255;
  const b = (hex & 255) / 255;
  return 'vec3(' + r.toFixed(4) + ', ' + g.toFixed(4) + ', ' + b.toFixed(4) + ')';
}

const POINT_VERT = `
attribute float aSeed;
attribute float aSize;
attribute vec3  aColor;

uniform float uK;
uniform float uTime;
uniform float uDpr;
uniform float uPull;
uniform float uRush;
uniform float uSpin;
uniform float uFlood;

varying vec3  vColor;
varying float vFade;

void main() {
  vec3 p = position;

  /* Depth-staggered so the field moves as a volume, not a plane. */
  float kk = clamp((uK - aSeed * 0.30) / 0.70, 0.0, 1.0);
  kk = kk * kk * (3.0 - 2.0 * kk);

  float spin = kk * uSpin;
  float cs = cos(spin), sn = sin(spin);
  p.xy = vec2(cs * p.x - sn * p.y, sn * p.x + cs * p.y);
  p.xy *= 1.0 - kk * uPull;
  p.z += kk * uRush;

  /* A slow ambient drift so nothing is ever perfectly still. */
  p.x += sin(uTime * 0.31 + aSeed * 37.0) * 0.07;
  p.y += cos(uTime * 0.27 + aSeed * 51.0) * 0.07;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = min(
    aSize * uDpr * (1.0 + kk * 2.2) * (170.0 / max(0.4, -mv.z)),
    110.0 * uDpr
  );

  vColor = aColor;
  vFade = (0.40 + kk * 0.95) * (1.0 - uFlood);
}
`;

const POINT_FRAG = `
precision highp float;
varying vec3  vColor;
varying float vFade;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  float a = smoothstep(0.5, 0.05, d);
  a *= a;
  if (a < 0.004) discard;
  gl_FragColor = vec4(vColor, a * vFade * 0.9);
}
`;

const RNA_VERT = `
attribute vec3 aColor;

uniform float uK;
uniform float uTime;
uniform float uDpr;
uniform float uFlood;

varying vec3  vColor;
varying float vFade;

void main() {
  vec3 p = position;

  /* The helix holds its shape at first, then the coils straighten: the radius
     collapses while z is preserved, so the strands become long light lines
     converging on the vanishing point. */
  float kk = clamp((uK - 0.06) / 0.66, 0.0, 1.0);
  float e = kk * kk * (3.0 - 2.0 * kk);

  p.xy *= mix(1.0, 0.22, e);
  p.xy *= 1.0 - clamp((uK - 0.84) / 0.16, 0.0, 1.0) * 0.92;
  p.z = p.z * mix(1.0, 0.86, e) - e * 5.0;

  float a = uTime * 0.32;
  float cs = cos(a), sn = sin(a);
  p.xy = vec2(cs * p.x - sn * p.y, sn * p.x + cs * p.y);

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = 2.4 * uDpr;

  vColor = aColor;
  vFade = mix(0.30, 1.0, e) * (1.0 - uFlood);
}
`;

const RNA_LINE_FRAG = `
precision highp float;
varying vec3  vColor;
varying float vFade;
void main() {
  gl_FragColor = vec4(vColor, vFade * 0.42);
}
`;

const RNA_POINT_FRAG = `
precision highp float;
varying vec3  vColor;
varying float vFade;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  float a = smoothstep(0.5, 0.10, d);
  if (a < 0.01) discard;
  gl_FragColor = vec4(vColor, a * vFade * 0.85);
}
`;

/* -------------------------------------------------------------- timeline -- */

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (t) => t * t * (3 - 2 * t);
const easeOut = (t) => 1 - Math.pow(1 - t, 3);

/* Piecewise keyframe interpolation over the 0..1 scene progress. */
function track(k, keys, ease) {
  const f = ease || smooth;
  for (let i = 1; i < keys.length; i++) {
    const [ka, va] = keys[i - 1];
    const [kb, vb] = keys[i];
    if (k <= kb) {
      const span = kb - ka;
      const t = span <= 0 ? 1 : clamp01((k - ka) / span);
      return va + (vb - va) * f(t);
    }
  }
  return keys[keys.length - 1][1];
}

/* Leaving the dark home page: converge, open, push through, flood.
   Fractions are the brief's 0.00–0.25 / 0.25–0.65 / 0.65–1.15 / 1.15–1.45s
   mapped onto a 1.25s run. */
const OUT = {
  alpha: [[0, 0], [0.08, 0.45], [0.22, 1], [1, 1]],
  core: [[0, 0.001], [0.17, 0.10], [0.43, 0.20], [0.77, 0.34], [1, 1.85]],
  portal: [[0, 0.02], [0.17, 0.09], [0.43, 0.40], [0.77, 0.92], [1, 1.50]],
  halo: [[0, 0], [0.12, 0.25], [0.30, 1.00], [0.60, 1.15], [0.80, 0.70], [1, 0.35]],
  distort: [[0, 0], [0.14, 0.35], [0.40, 1.00], [0.72, 1.25], [0.88, 0.70], [1, 0.25]],
  push: [[0, 0], [0.40, 0.10], [0.62, 0.90], [0.80, 1.50], [0.92, 0.50], [1, 0]],
  flood: [[0, 0], [0.78, 0], [0.88, 0.30], [1, 1]],
  particleK: [[0, 0], [0.30, 0.28], [1, 1]],
};

/* Leaving a light page: the entrance irises open from the centre out. */
const IN = {
  alpha: [[0, 0], [1, 0]],
  core: [[0, 0.001], [0.30, 0.03], [0.60, 0.09], [0.85, 0.05], [1, 0.001]],
  portal: [[0, 0.012], [0.16, 0.10], [0.50, 0.62], [0.78, 1.05], [1, 1.42]],
  halo: [[0, 0], [0.10, 0.50], [0.35, 1.20], [0.70, 1.00], [0.92, 0.40], [1, 0.15]],
  distort: [[0, 0], [0.20, 0.50], [0.55, 1.00], [0.85, 0.80], [1, 0.45]],
  push: [[0, 0], [0.45, 0.20], [0.70, 1.10], [0.90, 0.60], [1, 0.15]],
  flood: [[0, 0], [1, 0]],
  particleK: [[0, 0], [0.35, 0.45], [1, 1]],
};

/* ----------------------------------------------------------- geometry -- */

const PARTICLE_SIZES = {
  common: [0.28, 0.62],
  accent: [0.55, 1.05],
};

/* Proportions follow the brief: ice and periwinkle carry the field, warm white
   is the highlight, gold is rare, pink and mint are accents only. */
const PARTICLE_MIX = [
  { hex: PAL.ice, weight: 44, accent: false },
  { hex: PAL.peri, weight: 29, accent: false },
  { hex: PAL.warm, weight: 15, accent: false },
  { hex: PAL.gold, weight: 7, accent: true },
  { hex: PAL.pink, weight: 3, accent: true },
  { hex: PAL.mint, weight: 2, accent: true },
];

function pickMix() {
  let total = 0;
  for (const m of PARTICLE_MIX) total += m.weight;
  let r = Math.random() * total;
  for (const m of PARTICLE_MIX) {
    r -= m.weight;
    if (r <= 0) return m;
  }
  return PARTICLE_MIX[0];
}

function buildParticles(count) {
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const seed = new Float32Array(count);
  const size = new Float32Array(count);
  const c = new THREE.Color();

  for (let i = 0; i < count; i++) {
    /* A wide disc with real depth, so the field has volume rather than a wall. */
    const a = Math.random() * Math.PI * 2;
    const r = Math.pow(Math.random(), 0.62) * 15.5;
    pos[i * 3] = Math.cos(a) * r;
    pos[i * 3 + 1] = Math.sin(a) * r * 0.82;
    pos[i * 3 + 2] = -2 - Math.pow(Math.random(), 0.75) * 74;

    const m = pickMix();
    c.setHex(m.hex);
    col[i * 3] = c.r;
    col[i * 3 + 1] = c.g;
    col[i * 3 + 2] = c.b;

    seed[i] = Math.random();
    const band = m.accent ? PARTICLE_SIZES.accent : PARTICLE_SIZES.common;
    size[i] = band[0] + Math.random() * (band[1] - band[0]);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
  geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
  return geo;
}

/* A double helix that converges down the tunnel axis. Base dots cycle through
   the four accent hues so the strands read as RNA rather than as generic glow. */
function buildRNA() {
  const linePos = [];
  const lineCol = [];
  const dotPos = [];
  const dotCol = [];

  const N = 190;
  const Z0 = -64;
  const Z1 = -7;
  const strands = [PAL.ice, PAL.peri];
  const bases = [PAL.peri, PAL.ice, PAL.pink, PAL.mint];
  const c = new THREE.Color();

  let prevA = null;
  let prevB = null;

  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const z = Z0 + (Z1 - Z0) * t;
    const ang = t * Math.PI * 9 + 0.6;
    const rad = 2.1 + Math.sin(t * 4.3) * 0.45;
    const ax = Math.cos(ang) * rad;
    const ay = Math.sin(ang) * rad;
    const bx = Math.cos(ang + Math.PI) * rad;
    const by = Math.sin(ang + Math.PI) * rad;

    if (prevA) {
      linePos.push(prevA[0], prevA[1], prevA[2], ax, ay, z);
      c.setHex(strands[0]);
      lineCol.push(c.r, c.g, c.b, c.r, c.g, c.b);
      linePos.push(prevB[0], prevB[1], prevB[2], bx, by, z);
      c.setHex(strands[1]);
      lineCol.push(c.r, c.g, c.b, c.r, c.g, c.b);
    }

    if (i % 5 === 0) {
      linePos.push(ax, ay, z, bx, by, z);
      c.setHex(PAL.peri).multiplyScalar(0.62);
      lineCol.push(c.r, c.g, c.b, c.r, c.g, c.b);

      c.setHex(bases[(i / 5) % 4]);
      dotPos.push(ax, ay, z, bx, by, z);
      dotCol.push(c.r, c.g, c.b, c.r, c.g, c.b);
    }

    prevA = [ax, ay, z];
    prevB = [bx, by, z];
  }

  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePos, 3));
  lineGeo.setAttribute('aColor', new THREE.Float32BufferAttribute(lineCol, 3));

  const dotGeo = new THREE.BufferGeometry();
  dotGeo.setAttribute('position', new THREE.Float32BufferAttribute(dotPos, 3));
  dotGeo.setAttribute('aColor', new THREE.Float32BufferAttribute(dotCol, 3));

  return { lineGeo, dotGeo };
}

/* ---------------------------------------------------------------- stage -- */

export function webglAvailable() {
  try {
    const probe = document.createElement('canvas');
    return !!(probe.getContext('webgl2') || probe.getContext('webgl'));
  } catch (e) {
    return false;
  }
}

export async function createStage(canvas) {
  THREE.ColorManagement.enabled = false;

  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const small = window.innerWidth < 760;
  const lowPower = coarse || small;
  const dpr = Math.min(window.devicePixelRatio || 1, lowPower ? 1.5 : 2);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    premultipliedAlpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: 'high-performance',
  });
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  renderer.setPixelRatio(dpr);
  renderer.setClearColor(0x000000, 0);
  renderer.autoClear = false;

  let w = canvas.clientWidth || window.innerWidth;
  let h = canvas.clientHeight || window.innerHeight;
  renderer.setSize(w, h, false);

  /* -- background pass -- */
  const bgScene = new THREE.Scene();
  const bgCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const uniforms = {
    uRes: { value: new THREE.Vector2(w * dpr, h * dpr) },
    uTime: { value: 0 },
    uCore: { value: 0.001 },
    uPortal: { value: 0.02 },
    uHalo: { value: 0 },
    uDistort: { value: 0 },
    uPush: { value: 0 },
    uFlood: { value: 0 },
    uAlpha: { value: 0 },
  };
  const bgMat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: QUAD_VERT,
    fragmentShader: quadFragment(),
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });
  const bgGeo = new THREE.PlaneGeometry(2, 2);
  bgScene.add(new THREE.Mesh(bgGeo, bgMat));

  /* -- foreground pass: particle field and RNA -- */
  const fgScene = new THREE.Scene();
  const fgCam = new THREE.PerspectiveCamera(62, w / Math.max(h, 1), 0.1, 220);
  fgCam.position.set(0, 0, 0);

  const count = lowPower ? 2600 : 7000;

  const pointUniforms = {
    uK: { value: 0 },
    uTime: { value: 0 },
    uDpr: { value: dpr },
    uPull: { value: 0.94 },
    uRush: { value: 30 },
    uSpin: { value: 1.4 },
    uFlood: { value: 0 },
  };
  const pointMat = new THREE.ShaderMaterial({
    uniforms: pointUniforms,
    vertexShader: POINT_VERT,
    fragmentShader: POINT_FRAG,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const particleGeo = buildParticles(count);
  fgScene.add(new THREE.Points(particleGeo, pointMat));

  const rna = buildRNA();
  const rnaUniforms = {
    uK: { value: 0 },
    uTime: { value: 0 },
    uDpr: { value: dpr },
    uFlood: { value: 0 },
  };
  const rnaLineMat = new THREE.ShaderMaterial({
    uniforms: rnaUniforms,
    vertexShader: RNA_VERT,
    fragmentShader: RNA_LINE_FRAG,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const rnaDotMat = new THREE.ShaderMaterial({
    uniforms: rnaUniforms,
    vertexShader: RNA_VERT,
    fragmentShader: RNA_POINT_FRAG,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const rnaLines = new THREE.LineSegments(rna.lineGeo, rnaLineMat);
  const rnaDots = new THREE.Points(rna.dotGeo, rnaDotMat);
  fgScene.add(rnaLines, rnaDots);

  const onResize = () => {
    w = canvas.clientWidth || window.innerWidth;
    h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    uniforms.uRes.value.set(w * dpr, h * dpr);
    fgCam.aspect = w / Math.max(h, 1);
    fgCam.updateProjectionMatrix();
  };
  window.addEventListener('resize', onResize);

  let raf = 0;
  let stopped = false;
  let clock = 0;
  let last = performance.now();

  const draw = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    clock += dt;
    uniforms.uTime.value = clock;
    pointUniforms.uTime.value = clock;
    rnaUniforms.uTime.value = clock;

    renderer.clear();
    renderer.render(bgScene, bgCam);
    renderer.render(fgScene, fgCam);
  };

  /* Drives the timeline; resolves once the scene has run to completion. */
  const run = (spec, ms, particleSpec) =>
    new Promise((resolve) => {
      const t0 = performance.now();
      const step = (now) => {
        if (stopped) return resolve();
        const k = clamp01((now - t0) / ms);
        if (spec.alpha) uniforms.uAlpha.value = track(k, spec.alpha, easeOut);
        uniforms.uCore.value = track(k, spec.core);
        uniforms.uPortal.value = track(k, spec.portal);
        uniforms.uHalo.value = track(k, spec.halo);
        uniforms.uDistort.value = track(k, spec.distort);
        uniforms.uPush.value = track(k, spec.push);
        uniforms.uFlood.value = track(k, spec.flood);

        const pk = track(k, spec.particleK, easeOut);
        pointUniforms.uK.value = pk;
        pointUniforms.uPull.value = particleSpec.pull;
        pointUniforms.uRush.value = particleSpec.rush;
        pointUniforms.uSpin.value = particleSpec.spin;
        pointUniforms.uFlood.value = uniforms.uFlood.value;
        rnaUniforms.uK.value = clamp01(pk * 1.18);
        rnaUniforms.uFlood.value = uniforms.uFlood.value;

        draw(now);
        if (k < 1) raf = requestAnimationFrame(step);
        else resolve();
      };
      raf = requestAnimationFrame(step);
    });

  const dispose = () => {
    stopped = true;
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', onResize);
    particleGeo.dispose();
    rna.lineGeo.dispose();
    rna.dotGeo.dispose();
    bgGeo.dispose();
    pointMat.dispose();
    rnaLineMat.dispose();
    rnaDotMat.dispose();
    bgMat.dispose();
    renderer.dispose();
    /* Hand the context back immediately rather than waiting for GC — the page
       the user is about to read must not share a GPU budget with this. */
    try {
      renderer.forceContextLoss();
    } catch (e) {
      /* not fatal */
    }
  };

  return {
    canvas,
    runOut: (ms) =>
      run(OUT, ms, { pull: 0.94, rush: 30, spin: 1.4 }),
    runIn: (ms) =>
      run(IN, ms, { pull: 0.55, rush: 8, spin: 2.2 }),
    dispose,
  };
}
