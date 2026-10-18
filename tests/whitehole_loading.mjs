import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
const source = readFileSync(new URL('../static/transition/whitehole.js', import.meta.url), 'utf8');
const waits = [], assigned = [];
let ownsOpening = false;
const context = {
  URL, AbortController, navigator: {}, window: {},
  document: {
    documentElement: { hasAttribute: () => false },
    fonts: { ready: new Promise(() => {}) },
    querySelector: () => ownsOpening ? {} : null,
  },
  location: { href: 'https://wiki.test/', origin: 'https://wiki.test', assign: url => assigned.push(url) },
  requestAnimationFrame: callback => callback(0),
  setTimeout(callback, ms) { waits.push(ms); if (ms === 350) callback(); return waits.length; },
  clearTimeout() {}, cancelAnimationFrame() {},
  fetch: async () => ({ ok: true, url: 'https://wiki.test/description', headers: { get: () => 'text/html' }, text: async () => '<html></html>' }),
  sessionStorage: { setItem() {} },
};
runInNewContext(source, context);
const { loadingPose } = context.window.ORCAWhiteHoleClasses;
const far = loadingPose(0.22, 3), near = loadingPose(1, 3);
assert.ok(near.size > far.size * 5, 'Perspective must grow as the word approaches');
assert.ok(Math.hypot(near.x, near.y) > Math.hypot(far.x, far.y) * 5, 'The wall expands outward');
assert.ok(Math.abs(near.rotation - far.rotation) > 720, 'Approach must complete multiple orbits around the wall');
for (const p of [0.22, 0.4, 0.6, 0.8, 1]) {
  const arc = Array.from({ length: 7 }, (_, i) => loadingPose(p, i));
  assert.ok(arc.every(pose => Object.values(pose).every(Number.isFinite)));
  for (let i = 1; i < arc.length; i++) {
    const spacing = Math.hypot(arc[i].x - arc[i-1].x, arc[i].y - arc[i-1].y);
    assert.ok(spacing > arc[i].size * 0.7, 'Letter centers must leave enough space for the glyphs');
  }
  assert.notEqual(arc[0].rotation, arc[6].rotation, 'Letters follow local wall tangents, not one flat rotation');
}
assert.ok(loadingPose(0.3, 3).size > 3, 'The word must be large enough to see before the final approach');
const prototype = context.window.ORCAWhiteHoleClasses.PageTransitionController.prototype;
const finalStyles = new Map();
prototype.draw.call({ directionName: 'to-light', overlay: { style: { setProperty: (key, value) => finalStyles.set(key, value) } } }, 1);
assert.equal(finalStyles.get('--wh-train-opacity'), '0', 'LOADING must leave before navigation and never hold over the destination');
for (let i = 0; i < 7; i++) {
  const pose = loadingPose(1, i);
  assert.ok(Math.hypot(pose.x, pose.y) - pose.size > 100, 'Every letter passes beyond the visible wall at the end');
}
const controller = Object.create(prototype);
await controller.ready();
assert.deepEqual(waits, [350], 'Unresolved fonts have a short bound without waiting for image/window load');
let resets = 0;
controller.reset = () => resets++;
controller.begin = () => { throw new Error('An authored opening must own its arrival'); };
ownsOpening = true;
await controller.arrive({ direction: 'to-light' });
assert.equal(resets, 1);
ownsOpening = false;
Object.assign(controller, {
  busy: false, generation: 0, config: { home: 'https://wiki.test/', key: 'test' },
  overlay: { dataset: {} }, motion: { matches: false },
  begin() { this.busy = true; return ++this.generation; },
  // GPU preparation never resolves; it must not delay the CSS animation/navigation.
  prepareScene: () => new Promise(() => {}),
  timeline: { play: async () => true }, emit() {},
});
// Do not drive synthetic animation frames recursively while the mocked fetch settles.
context.performance = { now: () => 0 };
context.requestAnimationFrame = () => 1;
assert.equal(await controller.navigate('/description'), true);
assert.deepEqual(assigned, ['https://wiki.test/description']);
assert.equal(controller.overlay.dataset.phase, 'covered');
console.log('Passed bounded font readiness, authored-opening bypass, and navigation with stalled GPU preparation.');
