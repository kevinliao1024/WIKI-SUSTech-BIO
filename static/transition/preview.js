const controller = new window.ORCAWhiteHoleClasses.PageTransitionController(window.__orcaWhiteHole);
window.ORCAWhiteHole = controller;
const time = document.querySelector('#time'), direction = document.querySelector('#direction');
const status = document.querySelector('#status'), fallback = document.querySelector('#fallback');
async function prepare(name) {
  controller.reset(); const token = controller.begin(name);
  if (!fallback.checked) await controller.prepareScene(token);
  return token;
}
function report(ms) {
  document.querySelector('#time-label').value = `${(ms / 1000).toFixed(2)}s`;
  status.value = `${controller.overlay.dataset.renderer.toUpperCase()} · ${controller.overlay.dataset.quality || 'fallback'} · ${controller.scene?.particles.count || 0} particles`;
}
async function sample(ms) {
  if (!controller.busy || controller.directionName !== direction.value) await prepare(direction.value);
  controller.timeline.cancel();
  controller.draw(Math.min(ms / 1500, 1), ms > 1500 ? (ms - 1500) / 500 : 0);
  time.value = ms; report(ms);
}
async function play(name) {
  direction.value = name;
  const token = await prepare(name), duration = controller.motion.matches ? 80 : 2000;
  await controller.timeline.play(duration, p => {
    const ms = p * 2000;
    controller.draw(Math.min(ms / 1500, 1), ms > 1500 ? (ms - 1500) / 500 : 0);
    time.value = ms; report(ms);
  });
  if (token === controller.generation) { controller.reset(); status.value = 'Complete · GPU released'; }
}
document.querySelector('#play-light').onclick = () => play('to-light');
document.querySelector('#play-home').onclick = () => play('to-home');
document.querySelector('#reset').onclick = () => { controller.reset(); time.value = 0; report(0); };
document.querySelector('#core').onclick = () => sample(650);
document.querySelector('#warp').onclick = () => sample(1100);
document.querySelector('#cover').onclick = () => sample(1500);
time.oninput = () => sample(Number(time.value));
direction.onchange = () => sample(Number(time.value));
fallback.onchange = async () => { controller.reset(); await sample(Number(time.value)); };

/* Frame sampling, for headless capture.
 *
 *   preview.html?whsample=560&whdir=to-light
 *
 * Paints one authored frame and holds it. The redraw runs on every animation
 * frame rather than once: a single draw can be composited out before the
 * screenshot is taken, and looping also keeps the real render path honest.
 * The authored time is passed in explicitly so a capture is reproducible.
 */
const params = new URLSearchParams(location.search);
if (params.has('whsample')) {
  document.documentElement.dataset.whSample = '';
  const ms = Number(params.get('whsample')) || 0;
  const dir = params.get('whdir') === 'to-home' ? 'to-home' : 'to-light';
  direction.value = dir;
  const token = await prepare(dir);
  if (token === controller.generation) {
    const p = Math.min(ms / 1500, 1);
    const reveal = ms > 1500 ? (ms - 1500) / 500 : 0;
    const hold = () => {
      controller.draw(p, reveal, ms / 1000);
      report(ms);
      requestAnimationFrame(hold);
    };
    hold();
  }
}
