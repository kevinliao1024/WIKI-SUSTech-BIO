/* ORCA home — crayon layer driver.
 *
 * Follows the base take without touching it: onetake.js writes --ot-p onto
 * [data-ot] every frame, and this file only listens for that change. No second
 * animation loop, so a hidden tab (where the base stops drawing) costs nothing
 * here either.
 */
const root = document.querySelector('[data-ot]');
const figs = [...document.querySelectorAll('[data-ot-fig]')].map((el) => ({
  el, a: parseFloat(el.dataset.in), b: parseFloat(el.dataset.out),
}));
const flecks = document.querySelector('[data-ot-flecks]');

const reduce = matchMedia('(prefers-reduced-motion: reduce)');

function sync() {
  const p = parseFloat(root.style.getPropertyValue('--ot-p'));
  if (Number.isNaN(p)) return;
  let ink = 0;
  for (const f of figs) {
    const on = p >= f.a && p < f.b;
    f.el.classList.toggle('is-on', on);
    if (on) ink = 1;
  }
  root.style.setProperty('--ot-crayon-ink', ink);
}

/* Deterministic so a reload looks the same and screenshots are comparable. */
function scatterFlecks() {
  if (!flecks || reduce.matches) return;
  const palette = ['#f2989f', '#9b9ef7', '#fffefc', '#f2989f'];
  let s = 20261002;
  const rnd = () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296);
  const count = matchMedia('(max-width: 760px)').matches ? 0 : 16;
  for (let i = 0; i < count; i++) {
    const el = document.createElement('i');
    el.className = 'ot-fleck';
    el.style.cssText = [
      `--x:${(rnd() * 100).toFixed(1)}%`,
      `--w:${(7 + rnd() * 13).toFixed(1)}px`,
      `--c:${palette[Math.floor(rnd() * palette.length)]}`,
      `--o:${(0.25 + rnd() * 0.4).toFixed(2)}`,
      `--dur:${(13 + rnd() * 14).toFixed(1)}s`,
      `--delay:${(-rnd() * 24).toFixed(1)}s`,
      `--drift:${(-6 + rnd() * 14).toFixed(1)}vw`,
    ].join(';');
    flecks.append(el);
  }
}

if (root && figs.length) {
  new MutationObserver(sync).observe(root, { attributes: true, attributeFilter: ['style'] });
  sync();
}
scatterFlecks();
