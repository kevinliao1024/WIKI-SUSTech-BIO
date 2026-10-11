precision highp float;
varying vec2 vUv;
uniform vec2 uResolution;
uniform float uTime;
uniform float uProgress;
uniform float uDirection;
uniform float uReveal;

float band(float d, float width) { return exp(-d * d / width); }
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float stars(vec2 p, float scale) {
  vec2 cell = floor(p * scale);
  vec2 local = fract(p * scale) - vec2(hash(cell), hash(cell + 7.1));
  float size = 0.008 + 0.024 * hash(cell + 2.8);
  return exp(-dot(local, local) / (size * size)) * step(0.73, hash(cell + 13.2));
}
void main() {
  vec2 p = (vUv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);
  float t = uProgress;
  float form = smoothstep(0.10, 0.46, t);
  float push = smoothstep(0.46, 0.84, t);
  float radius = 0.085 + 0.02 * form + 0.18 * push + 2.6 * pow(smoothstep(0.78, 1.0, t), 3.0);
  vec2 q = p / radius;
  float r = length(q);
  float a = atan(q.y, q.x);
  float wobble = sin(a * 5.0 + uTime * 1.5) * 0.025 + sin(a * 11.0 - uTime) * 0.012;
  float lensR = r + wobble * form;
  // Broad light scatter, bright photon rim, a second refracted arc, and inner core.
  float corona = 0.12 / (0.35 + r * r) * form;
  float rim = band(lensR - 1.13, 0.006) * 1.6 + band(lensR - 1.32, 0.016) * 0.55;
  float secondary = band(lensR - 1.65, 0.013) * (0.45 + 0.3 * sin(a * 3.0 + uTime));
  float core = 1.0 - smoothstep(0.68, 1.02, r);
  // Tilted equatorial disk: narrow bright lanes with broader gaseous scattering.
  vec2 disk = mat2(0.985, -0.174, 0.174, 0.985) * q;
  float ellipse = length(disk * vec2(0.38, 2.6));
  float lanes = band(ellipse - 1.35 - 0.06 * sin(a * 7.0 - uTime * 2.0), 0.008);
  lanes += 0.50 * band(ellipse - 1.70, 0.016) + 0.25 * band(ellipse - 2.18, 0.022);
  float diskGlow = exp(-abs(disk.y) * 12.0) * exp(-abs(disk.x) * 0.45);
  float texture = 0.55 + 0.45 * sin(ellipse * 42.0 + a * 8.0 - uTime * 3.0);
  float jet = exp(-abs(q.x) * 110.0) * exp(-abs(q.y) * 0.15) * 0.6;
  vec3 navy = vec3(0.0235, 0.0784, 0.1804);
  vec3 ice = vec3(0.569, 0.780, 1.0);
  vec3 violet = vec3(0.573, 0.624, 1.0);
  vec3 white = vec3(0.973, 0.969, 0.957);
  float mist = sin(a * 4.0 + log(r + 0.1) * 7.0 - uTime * 0.3);
  vec3 color = navy + violet * (0.025 + 0.018 * mist) * exp(-r * 0.14);
  // Procedural refracted background and filaments supply depth around the photon rim.
  vec2 refracted = p + normalize(p + 0.0001) * form * 0.018 / (0.3 + r);
  float starLight = stars(refracted, 95.0) + 0.6 * stars(refracted, 171.0);
  float spiral = pow(0.5 + 0.5 * sin(a * 3.0 + log(r + 0.1) * 6.0 - uTime * 0.5), 7.0);
  color += ice * starLight * 0.45 + violet * spiral * exp(-r * 0.28) * 0.045 * form;
  color += (ice * rim + violet * secondary + ice * corona) * form;
  color += (ice * lanes * texture + violet * diskGlow * 0.35 + vec3(1.0, 0.89, 0.72) * lanes * 0.07) * form;
  color += ice * jet * form;
  color = mix(color, white * 1.25, core * form);
  if (uDirection > 0.5) {
    // A distinct flat-world composition: parallel vector-like filaments collapse inward.
    float converge = smoothstep(0.0, 0.48, t);
    float grid = band(sin(a * 12.0 + r * (1.0 - converge) * 0.6), 0.009);
    float filaments = grid * smoothstep(1.2, 2.0, r) * exp(-r * 0.12);
    color = mix(white, mix(violet, ice, 0.5), filaments * 0.35 * (1.0 - push));
    float opening = 1.0 - smoothstep(0.88, 1.05, r);
    color = mix(color, navy, opening * form);
    color = mix(color, ice, clamp(rim * form * 0.42, 0.0, 0.9));
    color = mix(color, violet, clamp(secondary * form * 0.20, 0.0, 0.5));
    color = mix(color, navy, smoothstep(0.85, 1.0, t));
  } else {
    color = mix(color, white, smoothstep(0.88, 1.0, t));
  }
  color += (hash(gl_FragCoord.xy + floor(uTime * 30.0)) - 0.5) * 0.004;
  float opacity = smoothstep(0.0, 0.13, t) * (1.0 - uReveal);
  gl_FragColor = vec4(color, opacity);
}
