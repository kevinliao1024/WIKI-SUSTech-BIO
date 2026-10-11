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
  direction.value = name === 'light' ? 'to-light' : name;
  const token = await prepare(name), duration = controller.motion.matches ? 80 : name === 'light' ? 250 : 2000;
  await controller.timeline.play(duration, p => {
    const ms = p * 2000;
    if (name === 'light') controller.draw(p < .5 ? p * 2 : 1, p < .5 ? 0 : (p - .5) * 2);
    else controller.draw(Math.min(ms / 1500, 1), ms > 1500 ? (ms - 1500) / 500 : 0);
    time.value = ms; report(ms);
  });
  if (token === controller.generation) { controller.reset(); status.value = 'Complete · GPU released'; }
}
document.querySelector('#play-light').onclick = () => play('to-light');
document.querySelector('#play-home').onclick = () => play('to-home');
document.querySelector('#play-short').onclick = () => play('light');
document.querySelector('#reset').onclick = () => { controller.reset(); time.value = 0; report(0); };
document.querySelector('#core').onclick = () => sample(650);
document.querySelector('#warp').onclick = () => sample(1100);
document.querySelector('#cover').onclick = () => sample(1500);
time.oninput = () => sample(Number(time.value));
direction.onchange = () => sample(Number(time.value));
fallback.onchange = async () => { controller.reset(); await sample(Number(time.value)); };
