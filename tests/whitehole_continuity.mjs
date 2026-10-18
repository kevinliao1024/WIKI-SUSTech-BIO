import assert from 'node:assert/strict';
import { WhiteHoleScene } from '../static/transition/whitehole-scene.js';
// Neither shader may trigger the first upload/draw before both have linked.
const pending = [];
let warmed = 0;
const startup = {
  renderer: { compileAsync: () => new Promise(resolve => pending.push(resolve)) },
  render(progress, direction) {
    assert.equal(progress, 0); assert.equal(direction, 'to-light'); warmed++;
    this.previous = 300; this.flowAngle = 1; this.samples = [40]; this.frameCount = 1;
  },
};
const ready = WhiteHoleScene.prototype.warmup.call(startup);
assert.equal(pending.length, 2);
pending[0](); await Promise.resolve();
assert.equal(warmed, 0, 'Do not upload/draw while the second program is still compiling');
pending[1](); await ready;
assert.equal(warmed, 1, 'Upload the first frame before the scene is published');
assert.equal(startup.previous, 0); assert.equal(startup.flowAngle, null);
assert.deepEqual(startup.samples, []); assert.equal(startup.frameCount, 0);
await assert.rejects(WhiteHoleScene.prototype.warmup.call({
  renderer: { compileAsync: async () => { throw new Error('compile failed'); } },
  render() { assert.fail('Failed shader preparation must never render'); },
}), /compile failed/);
const uniformSet = () => Object.fromEntries(['uProgress','uDirection','uReveal','uTime','uFlow','uQuality'].map(key => [key, { value: 0 }]));
let now = 100, draws = 0;
const previousPerformance = globalThis.performance;
Object.defineProperty(globalThis, 'performance', { configurable: true, value: { now: () => now } });
try {
  const scene = {
    failed: false, sampled: false, flowAngle: null, previous: 0, frameCount: 0, samples: [], quality: 'high',
    container: { dataset: {} },
    portal: { uniforms: uniformSet() }, particles: { uniforms: uniformSet() },
    camera: { position: {} },
    renderer: { clear() {}, render() { draws++; }, getPixelRatio: () => 1 },
  };
  const render = WhiteHoleScene.prototype.render.bind(scene);
  render(0.7, 'to-light');
  const first = scene.portal.uniforms.uFlow.value;
  now += 16.7; render(0.7, 'to-light');
  const second = scene.portal.uniforms.uFlow.value;
  now += 16.7; render(0.7, 'to-light');
  const third = scene.portal.uniforms.uFlow.value;
  assert.ok(second > first && third > second, 'The wall advances every frame even when page/letter progress is held');
  assert.ok(Math.abs((second - first) - (third - second)) < 1e-10, 'Equal display intervals keep a constant wall speed');
  assert.equal(scene.portal.uniforms.uFlow.value, scene.particles.uniforms.uFlow.value, 'Grooves and particles share one continuous clock');
  now += 5000; render(0.7, 'to-light');
  assert.ok(scene.portal.uniforms.uFlow.value - third < 0.21, 'A resumed tab must not jump through the missed rotations');
  assert.equal(draws, 8, 'Both scene passes render on every frame');
  scene.sampled = true;
  now += 16.7; render(0.4, 'to-light');
  const heldSample = scene.portal.uniforms.uFlow.value;
  now += 16.7; render(0.4, 'to-light');
  assert.equal(scene.portal.uniforms.uFlow.value, heldSample, 'Authored frame sampling remains deterministic');
  console.log('Passed continuous wall motion at held progress, constant frame speed, shared flow clock and tab-resume recovery.');
} finally {
  Object.defineProperty(globalThis, 'performance', { configurable: true, value: previousPerformance });
}
