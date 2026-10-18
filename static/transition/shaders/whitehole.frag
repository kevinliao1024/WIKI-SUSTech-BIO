/* ORCA — white-hole portal, full-screen pass.
 *
 * One quad draws the whole universe: depth-layered starfield, nebula and dust,
 * a gravitationally lensed sky, a tilted accretion structure intersected in
 * real 3D, the photon ring, and the white-hole core inside it.
 *
 * Progress is a single 0..1 number; the beats are derived here so the preview
 * scrubber, the departure and the arrival all read the same timeline.
 *
 *   form   0.06–0.46  the hole condenses out of the field
 *   push   0.48–0.88  the camera advances and the sky stretches past
 *   flood  0.88–1.00  light fills the frame
 *
 * Direction 0 is Home → light world, 1 is light world → Home. They are separate
 * compositions: the way out is a white hole, the way back is a cold entrance.
 */
precision highp float;

varying vec2 vUv;

uniform vec2  uResolution;
uniform float uTime;
uniform float uFlow;
uniform float uProgress;
uniform float uDirection;
uniform float uReveal;
uniform float uQuality;   // 1.0 full, 0.0 reduced (mobile / adaptive)

/* ---------------------------------------------------------------- utility -- */

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
vec2 hash22(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.xx + p3.yz) * p3.zy);
}
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash12(i), hash12(i + vec2(1.0, 0.0)), u.x),
             mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm3(vec2 p) {
  float a = 0.5, s = 0.0;
  for (int i = 0; i < 3; i++) { s += a * vnoise(p); p = p * 2.03 + 11.7; a *= 0.5; }
  return s;
}
float fbm5(vec2 p) {
  float a = 0.5, s = 0.0;
  for (int i = 0; i < 5; i++) { s += a * vnoise(p); p = p * 2.03 + 11.7; a *= 0.5; }
  return s;
}
/* Filmic response. Keeps a bright core from flattening into a clipped plate:
   highlights roll off and hold their gradient instead of blowing out. */
vec3 tonemap(vec3 x) {
  x = max(x, 0.0);
  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
}

/* One layer of stars. `mag` is skewed hard so a few dominate and the rest read
   as faint dust; `clump` thins the field where the local density is low, which
   is what stops it looking like evenly scattered points. */
float starLayer(vec2 uv, float scale, float seed, float threshold, float size) {
  vec2 cell = floor(uv * scale);
  vec2 local = fract(uv * scale) - hash22(cell + seed);
  float h = hash12(cell + seed * 1.7);
  float mag = pow(h, 3.2);
  float core = exp(-dot(local, local) / (size * (0.30 + mag * 3.4)));
  return core * step(threshold, h) * (0.20 + mag * 1.9);
}

/* The universe. Sampled in `q`, the lensed screen direction, so the whole field
   is bent by the same deflection as the hole. `near` layers take extra zoom,
   which is what reads as parallax while the camera advances. */
vec3 sky(vec2 uv, float near, out float dust) {
  float drift = uTime * 0.015;
  vec2 vu = uv * (1.0 + near * 0.9) + vec2(drift * 0.6, drift * 0.22);

  float s = starLayer(vu, 58.0, 0.0, 0.60, 0.0026) * 1.00
          + starLayer(vu * 1.9, 133.0, 3.1, 0.76, 0.0017) * 0.52
          + starLayer(vu * 2.7, 271.0, 7.7, 0.88, 0.0011) * 0.28;
  float clump = fbm3(vu * 1.7 + 4.3);
  s *= 0.30 + 1.35 * smoothstep(0.24, 0.86, clump);

  // Nebula: broad cold clouds, with a warmer core where the gas is densest.
  float n1 = uQuality > 0.5 ? fbm5(vu * 1.15 + vec2(drift, -drift * 0.5))
                           : fbm3(vu * 1.15 + vec2(drift, -drift * 0.5));
  float n2 = uQuality > 0.5 ? fbm3(vu * 2.9 - vec2(drift * 1.4, drift * 0.3)) : n1;
  float veil = smoothstep(0.30, 0.95, n1);
  vec3 nebula = vec3(0.569, 0.780, 1.0) * veil * 0.085;
  nebula += vec3(0.573, 0.624, 1.0) * smoothstep(0.42, 1.0, n2) * 0.070;
  nebula += vec3(1.0, 0.90, 0.72) * smoothstep(0.72, 1.0, n1) * 0.022;

  // Dust: subtractive lanes, so the field has depth rather than only brightness.
  dust = smoothstep(0.34, 0.78, uQuality > 0.5 ? fbm3(vu * 1.5 + 21.0) : n1);

  vec3 base = vec3(0.0235, 0.0784, 0.1804);
  return base + nebula + vec3(0.569, 0.780, 1.0) * s;
}

/* -------------------------------------------------------------- main pass -- */

void main() {
  float t = clamp(uProgress, 0.0, 1.0);
  float toHome = step(0.5, uDirection);
  float aspect = uResolution.x / max(uResolution.y, 1.0);

  float form  = smoothstep(0.06, 0.46, t);
  float push  = smoothstep(0.48, 0.88, t);
  float flood = smoothstep(0.95, 1.0, t);

  /* Camera. Advancing is expressed as the screen shrinking around the hole, so
     every layer — sky, disk, core — grows together instead of one disc scaling
     up while the surroundings sit still. */
  float camDist = mix(6.6, 2.10, push);
  float zoom = mix(1.0, 1.30, form) * mix(1.0, 2.95, push * push);
  vec2 q = (vUv - 0.5) * vec2(aspect, 1.0) / zoom;
  float b = length(q);

  /* ------------------------------------------------------------ lensing -- */
  /* A ray at impact parameter b is deflected by roughly 1/b. Applying that to
     the sample rather than to the output is what piles the sky into a
     compressed secondary ring just outside the photon sphere — the signature
     that says "lens", not "circle". */
  float defl = 1.30 / (b * b + 0.20);
  vec2 skyUv = q * (1.0 + defl * form);

  float dust;
  vec3 color = sky(skyUv, push, dust);
  color *= mix(1.0, 0.45, dust * form);

  /* The secondary image: the same sky wrapped the other way around the hole.
     Faint, and only where it belongs — a few tenths of a unit off the ring. */
  float nearRing = exp(-pow((b - 1.0) / 0.42, 2.0));
  if (uQuality > 0.5 && nearRing > 0.003) {
    float d2;
    vec3 wrapped = sky(q * (1.0 + 3.30 / (b * b + 0.028)), push * 1.4, d2);
    color += wrapped * nearRing * 0.42 * form;
  }

  /* ------------------------------------------------------- accretion -- */
  /* Intersect the sight line with a tilted plane through the hole instead of
     drawing an ellipse. Gives correct foreshortening, limb brightening, and a
     disk that genuinely passes in front of the photon ring. */
  float incl = radians(76.0);
  vec3 N = vec3(0.0, sin(incl), cos(incl));
  vec3 C = vec3(0.0, 0.0, camDist);
  vec3 D = normalize(vec3(q, -1.0));
  float dN = dot(D, N);
  dN = dN >= 0.0 ? max(dN, 8e-4) : min(dN, -8e-4);
  float tHit = -dot(C, N) / dN;

  vec3 X = C + tHit * D;
  float y0 = X.y;
  // The far side is lifted up and over the shadow: the Einstein arc.
  X.y += smoothstep(0.0, 0.45, X.y) * form * 2.05 / (b * b + 0.34);

  float rd = length(X);
  float az = atan(X.z, X.x);
  float valid = step(0.0, tHit) * (1.0 - smoothstep(3.2, 6.4, rd));

  float radial = 1.0 / (0.34 + rd * rd * 0.52);
  float spiralTravel = clamp((t - 0.10) / 0.86, 0.0, 1.0);
  float waitingFlow = max(0.0, uTime - t * 1.5);
  float flowRotation = toHome > 0.5 ? -uTime * 0.42 : uFlow;
  float shear = az + 1.25 / (rd + 0.22) - flowRotation;
  float turb = fbm3(vec2(rd * 3.4 - uTime * 0.55, shear * 2.3));
  float lanes = 0.52 + 0.48 * sin(rd * 13.0 + (az - flowRotation) * 3.0);
  float band = radial * (0.42 + 0.95 * turb) * lanes * valid;

  // Beaming: the limb sweeping toward the viewer is brighter than the receding one.
  float side = normalize(X + vec3(1e-4)).x;
  float beam = mix(0.28, 2.35, smoothstep(-1.0, 1.0, -side));

  // The shadow hides the far side of the disk. This is the front/back relation
  // that a flat ellipse can never express.
  float shadow = 1.0 - smoothstep(0.93, 1.07, b);
  float occl = 1.0 - shadow * smoothstep(0.0, 0.10, y0);

  vec3 ice = vec3(0.569, 0.780, 1.0);
  vec3 violet = vec3(0.573, 0.624, 1.0);
  vec3 gold = vec3(1.0, 0.90, 0.72);
  vec3 white = vec3(0.973, 0.969, 0.957);
  vec3 navy = vec3(0.0235, 0.0784, 0.1804);

  vec3 diskCol = ice * band * beam * occl;
  diskCol += gold * band * beam * occl * 0.10;
  diskCol += violet * pow(radial * valid, 1.5) * 0.55 * occl;   // broad scatter
  color += diskCol * form;

  /* ------------------------------------------------------- photon ring -- */
  // Two scales: an incandescent line and the glow bleeding off it.
  float line = exp(-pow((b - 1.0) / 0.016, 2.0));
  float bleed = exp(-pow((b - 1.0) / 0.075, 2.0));
  color += ice * bleed * 0.30 * form;
  color += white * line * 1.15 * form;

  // A cool chromatic edge just outside the line — cheap, and it sells the
  // refraction that a pure white ring does not have.
  color += violet * exp(-pow((b - 1.055) / 0.020, 2.0)) * 0.34 * form;

  /* ------------------------------------------------------------- core -- */
  /* White-hole interior. Not a filled disc: a dense knot, a smooth
     inverse-power falloff, and internal structure that survives the tonemap so
     the eye reads volume and depth rather than a clipped highlight. */
  float coreR = 0.055 + 0.150 * form + 0.30 * push + 2.10 * pow(smoothstep(0.80, 1.0, t), 3.0);
  float cr = b / max(coreR, 1e-4);
  float knot = exp(-cr * cr * 1.25);
  float halo = 1.0 / (1.0 + 3.1 * pow(cr, 1.7));
  float mottle = 0.82 + 0.18 * fbm3(q * 9.0 / max(coreR, 0.02) * 0.35 + uTime * 0.10);
  vec3 core = white * (knot * 1.42 + halo * 0.34) * mottle;
  core += ice * pow(halo, 1.6) * 0.24;
  // Inside the photon sphere the sky is still there, crushed and dimmed.
  core += mix(navy * 1.5, ice * 0.10, halo) * (1.0 - knot) * 0.55;
  color = mix(color, core, smoothstep(0.0, 0.30, form) * (1.0 - 0.35 * push));

  // Wall grooves follow the slower particle field; the lettering overtakes it.
  // log(radius) supplies the depth shear of a spiral receding into the core.
  if (toHome < 0.5) {
    vec2 screenQ = (vUv - 0.5) * vec2(aspect, 1.0);
    float wallRadius = max(length(screenQ), 0.001);
    float wallAngle = atan(screenQ.y, screenQ.x);
    float groovePhase = wallAngle - flowRotation - log(wallRadius + 0.025) * 1.4;
    float groove = pow(0.5 + 0.5 * cos(groovePhase * 5.0), 18.0);
    float wall = smoothstep(0.035, 0.16, wallRadius) * exp(-wallRadius * 0.85);
    color += ice * groove * wall * smoothstep(0.16, 0.42, t) * (1.0 - flood) * 0.24;
  }

  /* ---------------------------------------------- the way back to Home -- */
  if (toHome > 0.5) {
    /* The light world folding inward: flat, parallel filaments drawn in screen
       space, collapsing toward an opening that then swallows the frame. */
    float conv = smoothstep(0.0, 0.50, t);
    float rings = smoothstep(0.045, 0.30, abs(sin(b * 26.0 - uTime * 0.4)));
    float weave = rings * exp(-b * 0.55) * (1.0 - conv * 0.85);
    vec3 flatWorld = mix(navy * 2.2, vec3(0.973, 0.969, 0.957), 0.55);
    flatWorld = mix(flatWorld, violet, 0.35 * weave * 0.5);
    color = mix(flatWorld * (1.0 - 0.25 * conv), color, smoothstep(0.0, 0.34, t) * 0.72);
    color += ice * weave * 0.16 * (1.0 - push);
    // The aperture: the dark well the camera falls into.
    color = mix(color, navy, (1.0 - smoothstep(0.62, 1.02, b)) * form * 0.86);
    color += ice * pow(1.0 - smoothstep(0.0, 0.10, abs(b - 1.0)), 2.0) * form * 0.55;
    color = mix(color, navy, smoothstep(0.88, 1.0, t) * 0.92);
  } else {
    /* The way out: light floods the frame, and a cool rim survives inside it so
       the white is a lit space rather than a blank plate. */
    vec3 wash = mix(white, ice, 0.16 * (1.0 - flood));
    color = mix(color, wash, flood);
    color += ice * (1.0 - flood) * pow(1.0 - smoothstep(0.0, 0.85, b), 3.0) * 0.35;
  }

  /* ------------------------------------------------------------- grade -- */
  // Vignette, fine grain, and a touch of lift in the shadows.
  float vig = 1.0 - 0.34 * dot(vUv - 0.5, vUv - 0.5) * 2.2;
  color *= vig;
  color += (hash12(gl_FragCoord.xy + fract(uTime) * 441.0) - 0.5) * 0.007;
  color = max(color, 0.0);

  float opacity = smoothstep(0.0, 0.10, t) * (1.0 - uReveal);
  gl_FragColor = vec4(tonemap(color * 1.06), opacity);
}
