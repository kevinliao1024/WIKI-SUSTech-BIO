import * as THREE from '../vendor/three/three.module.js';

const clamp = value => Math.max(0, Math.min(1, value));
const smooth = (a, b, value) => { const t = clamp((value - a) / (b - a)); return t * t * (3 - 2 * t); };
let shaderSource;
export class PortalShader {
  static load() {
    return shaderSource ||= Promise.all(['whitehole.vert', 'whitehole.frag'].map(async file => {
      const response = await fetch(new URL(`shaders/${file}`, import.meta.url));
      if (!response.ok) throw new Error('Portal shader unavailable');
      return response.text();
    }));
  }
  constructor(vertexShader, fragmentShader) {
    this.uniforms = {
      uResolution: { value: new THREE.Vector2(1, 1) }, uTime: { value: 0 },
      uProgress: { value: 0 }, uDirection: { value: 0 }, uReveal: { value: 0 }, uFlow: { value: 0 },
      uQuality: { value: 1.0 },
    };
    this.material = new THREE.ShaderMaterial({ vertexShader, fragmentShader,
      uniforms: this.uniforms, transparent: true, depthTest: false, depthWrite: false });
    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.material);
  }
  dispose() { this.mesh.geometry.dispose(); this.material.dispose(); }
}

const particleVertex = `
attribute vec4 aSeed;
attribute float aTip;
attribute vec3 aColor;
uniform float uTime, uProgress, uDirection, uReveal, uFlow;
varying vec3 vColor;
varying float vAlpha;
void main() {
  float push = smoothstep(0.42, 0.86, uProgress);
  float converge = smoothstep(0.0, 0.48, uProgress);
  float travel = clamp((uProgress - 0.10) / 0.86, 0.0, 1.0);
  float angle = aSeed.x + converge * (0.45 + aSeed.w * 0.6);
  float depth = 1.0 + mod(aSeed.z - push * (5.0 + aSeed.w * 8.0) + 14.0, 12.0);
  float radius = aSeed.y * (1.0 - converge * 0.40);
  if (uDirection > 0.5) radius *= mix(0.45, 1.6, uReveal);
  float trail = aTip * (0.002 + push * 0.7) * (0.4 + aSeed.w);
  vec3 p;
  float trailVisibility = 1.0;
  if (uDirection < 0.5) {
    // The wall turns at 75% of the word's speed, so LOADING gains on it.
    // Wrap the shared head only. Wrapping each tail vertex reconnects opposite
    // ends of the tunnel, producing a long isolated line over the lettering.
    float waitingFlow = max(0.0, uTime - uProgress * 1.5);
    float headDepth = 1.0 + mod(aSeed.z - push * (5.0 + aSeed.w * 8.0) + 14.0 - waitingFlow * 1.2, 12.0);
    trailVisibility = smoothstep(1.0, 1.5, headDepth) * (1.0 - smoothstep(12.4, 13.0, headDepth));
    depth = headDepth + trail * 0.95;
    angle = aSeed.x + uFlow - depth * 0.24;
    radius = (0.55 + aSeed.y * 0.12) * (1.0 - converge * 0.15);
    p = vec3(cos(angle) * radius, sin(angle) * radius, -depth);
  } else {
    p = vec3(cos(angle) * radius, sin(angle) * radius, -depth);
    p.xy *= 1.0 + trail;
    p.z -= trail * 1.5;
  }
  if (uDirection > 0.5 && uProgress < 0.45) {
    p.z = -5.0;
    p.xy *= 0.4 + (1.0 - converge) * 1.4;
  }
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  vColor = aColor;
  float incoming = uDirection > 0.5 ? smoothstep(0.28, 0.6, uProgress) : 1.0;
  vAlpha = trailVisibility * (0.25 + aSeed.w * 0.6) * incoming * smoothstep(0.0, 0.13, uProgress) * (1.0 - uReveal);
  vAlpha *= 1.0 - smoothstep(0.92, 1.0, uProgress) * (1.0 - step(0.5, uDirection));
}`;
const particleFragment = `varying vec3 vColor; varying float vAlpha;
void main() { gl_FragColor = vec4(vColor, vAlpha); }`;

export class ParticleSystem {
  constructor(count) {
    this.count = count;
    this.verticesPerTrail = 8; // Four connected segments follow the helix.
    const vertices = count * this.verticesPerTrail;
    const positions = new Float32Array(vertices * 3), seeds = new Float32Array(vertices * 4);
    const tips = new Float32Array(vertices), colors = new Float32Array(vertices * 3);
    const palette = ['#91c7ff', '#929fff', '#f8f7f4', '#f4d69a', '#f4a7be', '#98e7ca'].map(c => new THREE.Color(c).convertLinearToSRGB());
    let state = 2026;
    const random = () => ((state = (1664525 * state + 1013904223) >>> 0) / 4294967296);
    for (let i = 0; i < count; i++) {
      const seed = [random() * Math.PI * 2, 0.4 + random() * 12, random() * 12, random()];
      const c = palette[i % 24 < 21 ? i % 3 : 3 + i % 3];
      for (let segment = 0; segment < 4; segment++) {
        for (let tip = 0; tip < 2; tip++) {
          const vertex = i * this.verticesPerTrail + segment * 2 + tip;
          seeds.set(seed, vertex * 4); tips[vertex] = (segment + tip) / 4;
          colors.set([c.r, c.g, c.b], vertex * 3);
        }
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 4));
    geometry.setAttribute('aTip', new THREE.BufferAttribute(tips, 1));
    geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
    this.uniforms = { uTime: { value: 0 }, uProgress: { value: 0 }, uDirection: { value: 0 }, uReveal: { value: 0 }, uFlow: { value: 0 } };
    const material = new THREE.ShaderMaterial({ vertexShader: particleVertex, fragmentShader: particleFragment,
      uniforms: this.uniforms, transparent: true, blending: THREE.AdditiveBlending, depthTest: false, depthWrite: false });
    this.mesh = new THREE.LineSegments(geometry, material);
    this.mesh.frustumCulled = false;
  }
  dispose() { this.mesh.geometry.dispose(); this.mesh.material.dispose(); }
}

export class WhiteHoleScene {
  static async create(container) {
    const source = await PortalShader.load();
    const scene = new WhiteHoleScene(container, source);
    try {
      await scene.warmup();
      container.prepend(scene.renderer.domElement);
      container.dataset.renderer = 'webgl'; container.dataset.quality = scene.quality;
      return scene;
    } catch (error) {
      scene.dispose();
      throw error;
    }
  }
  constructor(container, source) {
    this.container = container;
    const low = innerWidth < 700 || (navigator.hardwareConcurrency || 4) <= 4 || (navigator.deviceMemory || 8) <= 4;
    this.quality = low ? 'low' : 'high';
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'low-power' });
    // Text remains full-resolution DOM; render the soft light field more cheaply.
    this.renderer.setPixelRatio(Math.min(devicePixelRatio || 1, low ? 0.85 : 1));
    this.renderer.setClearColor(0, 0);
    this.renderer.debug.onShaderError = () => { this.failed = true; };
    this.scene = new THREE.Scene(); this.portalScene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(62, 1, 0.1, 50);
    this.screenCamera = new THREE.Camera();
    this.portal = new PortalShader(...source); this.portalScene.add(this.portal.mesh);
    this.particles = new ParticleSystem(low ? 650 : 2100); this.scene.add(this.particles.mesh);
    this.renderer.autoClear = false;
    this.resize = () => {
      const width = container.clientWidth || innerWidth, height = container.clientHeight || innerHeight;
      this.renderer.setSize(width, height, false); this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix(); this.portal.uniforms.uResolution.value.set(width, height);
    };
    this.onLost = event => { event.preventDefault(); this.failed = true; container.dataset.renderer = 'css'; };
    this.renderer.domElement.addEventListener('webglcontextlost', this.onLost);
    this.resize();
    addEventListener('resize', this.resize, { passive: true });
    this.samples = []; this.previous = 0; this.frameCount = 0; this.flowAngle = null;
    this.sampled = document.documentElement.hasAttribute('data-wh-preview');
  }
  async warmup() {
    // Compile both programs before exposing the canvas. Parallel shader compile
    // avoids the first visible render waiting for the driver to link a program.
    await Promise.all([
      this.renderer.compileAsync(this.portalScene, this.screenCamera),
      this.renderer.compileAsync(this.scene, this.camera),
    ]);
    if (this.failed) throw new Error('Portal shader failed');
    // Upload the trail buffers and allocate the drawing surface offscreen too.
    this.render(0, 'to-light');
    if (this.failed) throw new Error('Portal warmup failed');
    // Preparation must not contribute a long first-frame delta or advance flow.
    this.previous = 0; this.frameCount = 0; this.samples = []; this.flowAngle = null;
  }
  render(progress, direction, reveal = 0, time = progress * 1.5) {
    if (this.failed) { this.container.dataset.renderer = 'css'; return; }
    const now = performance.now();
    const delta = this.previous ? Math.max(0, (now - this.previous) / 1000) : 0;
    if (this.sampled || this.flowAngle === null) {
      this.flowAngle = clamp((progress - 0.10) / 0.86) * 14.14;
    } else {
      // Advance every display frame, independently of letter/departure progress.
      // Bound catch-up after a long tab pause rather than jumping the wall.
      this.flowAngle += Math.min(delta, 0.05) * (14.14 / (4.2 * 0.86));
    }
    for (const uniforms of [this.portal.uniforms, this.particles.uniforms]) {
      uniforms.uProgress.value = progress; uniforms.uDirection.value = direction === 'to-home' ? 1 : 0;
      uniforms.uReveal.value = reveal; uniforms.uTime.value = time;
      uniforms.uFlow.value = this.flowAngle;
    }
    this.portal.uniforms.uQuality.value = this.quality === 'low' ? 0.0 : 1.0;
    this.camera.position.z = -smooth(0.46, 0.84, progress) * 0.7;
    this.renderer.clear(); this.renderer.render(this.portalScene, this.screenCamera);
    this.renderer.render(this.scene, this.camera);
    if (this.previous) this.samples.push(now - this.previous);
    this.previous = now; this.frameCount++;
    if (this.samples.length > 60) this.samples.shift();
    if (this.samples.length >= 20 && this.frameCount % 12 === 0) {
      const ordered = [...this.samples].sort((a, b) => a - b);
      const median = ordered[Math.floor(ordered.length / 2)];
      const p95 = ordered[Math.floor((ordered.length - 1) * 0.95)];
      this.container.dataset.frameMedianMs = median.toFixed(1);
      this.container.dataset.frameP95Ms = p95.toFixed(1);
      if (median > 22 && this.renderer.getPixelRatio() > 0.75) {
        this.quality = 'low'; this.renderer.setPixelRatio(0.75);
        this.particles.mesh.geometry.setDrawRange(0, 650 * this.particles.verticesPerTrail);
        this.resize(); this.container.dataset.quality = 'adaptive';
      }
    }
  }
  dispose() {
    removeEventListener('resize', this.resize);
    this.renderer.domElement.removeEventListener('webglcontextlost', this.onLost);
    this.portal.dispose(); this.particles.dispose(); this.renderer.dispose();
    this.renderer.forceContextLoss(); this.renderer.domElement.remove();
    this.container.dataset.renderer = 'css';
  }
}
