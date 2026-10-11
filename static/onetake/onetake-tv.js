/* ORCA home — the opening television.
 *
 * The take opens already looking at a labyrinth (mazeShape in onetake.js), so
 * this file never draws anything itself. It only frames that shot, then pushes
 * into the screen as the reader scrolls: picture and casing scale together, as
 * if the camera dollied into the set, until the glass is the viewport and the
 * casing has gone. The labyrinth then carries on full-screen.
 *
 * Driven by --ot-p, the value onetake.js writes onto [data-ot] every frame.
 * Read here, never written, and no requestAnimationFrame of its own: if the
 * base take is hidden or reduced, this layer simply sits at its last frame.
 */
const root = document.querySelector('[data-ot]');
const set = document.querySelector('[data-ot-tv]');
const pic = document.querySelector('[data-ot-pic]');

const reduceQuery = matchMedia('(prefers-reduced-motion: reduce)');
const small = matchMedia('(max-width: 760px)');

/* The window of the take the set lives in, in take units (the take opens at
   -0.19). The push-in starts on the first scroll and is over before the
   "Lost" beat (-0.1), so that line plays over a full-screen labyrinth and the
   brain (stage 0, from 0.03) is never seen inside the glass. */
const A = -0.18;   // set at rest, labyrinth inside it
const B = -0.095;  // glass fills the viewport, casing gone

/* Must match --tv-hw in onetake-tv.css (49vw, 86vw under 760px). */
const FILL = 0.49;
const FILL_SMALL = 0.86;

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (t) => t * t * (3 - 2 * t);

let last = NaN;
let lastPhase = '';

function sync(force = false) {
  const p = parseFloat(root.style.getPropertyValue('--ot-p'));
  if (Number.isNaN(p)) return;
  if (!force && Math.abs(p - last) < 0.0002) return;
  last = p;

  const w = innerWidth, h = innerHeight;
  const hw = w * (small.matches ? FILL_SMALL : FILL);
  const hh = hw * 0.56;
  // At rest the whole viewport-sized picture is shrunk to cover the hole;
  // pushing in multiplies picture and casing by the same k, so the picture
  // always covers the hole and ends at exactly scale 1.
  const s0 = Math.max(hw / w, hh / h);
  const t = smooth(clamp((p - A) / (B - A)));
  const k = 1 + (1 / s0 - 1) * t * t;   // ease-in: a slow lean, then the plunge
  const s = s0 * k;

  pic.style.transform = `scale(${s.toFixed(4)})`;
  set.style.transform = `scale(${k.toFixed(4)})`;
  // Whatever casing is still on screen at the end (the screen is 16:9, the
  // viewport rarely is) fades out over the last stretch of the push.
  const o = (1 - smooth(clamp((t - 0.72) / 0.26))).toFixed(3);
  set.style.opacity = o;
  // The hero nameplate is in the story track, not in the set, so it gets the
  // same scale and fade as variables.
  root.style.setProperty('--tv-k', k.toFixed(4));
  root.style.setProperty('--tv-o', o);

  const phase = t >= 0.999 ? 'off' : t > 0 ? 'leaving' : 'on';
  if (phase !== lastPhase) {
    lastPhase = phase;
    set.dataset.phase = phase;
    pic.dataset.fullscreen = phase === 'off' ? '1' : '0';
  }
  const flutter = reduceQuery.matches ? 0 : 0.5 + 0.5 * Math.sin(performance.now() / 900);
  root.style.setProperty('--tv-p', t.toFixed(4));
  root.style.setProperty('--tv-a', (flutter * (1 - t)).toFixed(3));
}

if (root && set && pic) {
  const kick = () => sync(true);
  new MutationObserver(() => sync()).observe(root, { attributes: true, attributeFilter: ['style'] });
  addEventListener('resize', kick, { passive: true });
  small.addEventListener?.('change', kick);
  reduceQuery.addEventListener?.('change', kick);
}
