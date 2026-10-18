import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
const source = readFileSync(new URL('../static/transition/whitehole.js', import.meta.url), 'utf8');
const element = values => ({ getAttribute: key => values[key] ?? null });
const assets = {
  'link[rel~="stylesheet"][href]': [element({ href: '/static/page.css' }), element({ href: 'https://unrelated.test/style.css' })],
  'script[src]': [element({ src: '/static/page.js' }), element({ src: '/static/scene.mjs', type: 'module' }), element({ src: '/data.json', type: 'application/json' })],
  'link[rel="preload"][as="font"][href]': [element({ href: '/static/font.woff2' })],
  'main img[src]': [element({ src: '/assets/hero.avif', loading: 'lazy' })],
  'img[src]:not([loading="lazy"])': [element({ src: '/assets/hero.avif' }), element({ src: 'https://static.igem.wiki/teams/6085/hero.webp' })],
};
let finishRequest, finishAnimation;
const links = [], events = [], assigned = [], frames = new Map();
let nextFrame = 1, disposed = 0;
const root = { hasAttribute: () => false, removeAttribute() {} };
const sandbox = {
  URL, AbortController, performance: { now: () => 0 }, window: {}, navigator: {},
  location: { href: 'https://wiki.test/', origin: 'https://wiki.test', assign: value => assigned.push(value) },
  DOMParser: class { parseFromString() { return { querySelector: () => null, querySelectorAll: selector => assets[selector] || [] }; } },
  document: { documentElement: root, createElement(tag) {
    assert.equal(tag, 'link', 'Preloading must not create executable scripts or a hidden page');
    return { remove() { this.removed = true; } };
  }, head: { append(link) { links.push(link); events.push('preload'); } } },
  fetch() { events.push('fetch'); return new Promise(resolve => { finishRequest = resolve; }); },
  requestAnimationFrame(callback) { const id = nextFrame++; frames.set(id, callback); return id; },
  cancelAnimationFrame(id) { frames.delete(id); }, setTimeout: () => 1, clearTimeout() {},
  sessionStorage: { setItem() {}, removeItem() {} },
};
runInNewContext(source, sandbox);
const prototype = sandbox.window.ORCAWhiteHoleClasses.PageTransitionController.prototype;
const controller = Object.assign(Object.create(prototype), {
  busy: false, generation: 0, motion: { matches: false }, config: { home: 'https://wiki.test/', key: 'test' },
  overlay: { dataset: {}, style: { setProperty() {} }, removeAttribute() {} },
  begin() { this.busy = true; this.directionName = 'to-light'; return ++this.generation; },
  prepareScene: async () => {}, draw() {}, emit() {},
  scene: { dispose() { disposed++; } },
  timeline: { play(duration) {
    events.push(`animation:${duration}`);
    if (duration === 70) return Promise.resolve(true);
    return new Promise(resolve => { finishAnimation = resolve; });
  }, cancel() {} },
});
const navigation = controller.navigate('/description');
assert.deepEqual(events.slice(0, 2), ['fetch', 'animation:3948']);
finishRequest({ ok: true, url: 'https://wiki.test/description', headers: { get: () => 'text/html' }, text: async () => '<html></html>' });
await new Promise(setImmediate);
assert.equal(links.length, 6, 'Styles, classic/module scripts, font and visible images warm during the orbit');
assert.deepEqual(links.map(link => link.as), ['style', 'script', 'script', 'font', 'image', 'image']);
assert.equal(links[2].rel, 'modulepreload');
assert.equal(links[3].crossOrigin, 'anonymous');
assert.equal(assigned.length, 0, 'Warming does not navigate or run the target opening');
assert.equal(disposed, 0, 'The scene remains alive through the orbit');
finishAnimation(true);
assert.equal(await navigation, true);
assert.ok(events.includes('animation:70'), 'The final bright-ray exit is limited to 70ms');
assert.deepEqual(assigned, ['https://wiki.test/description']);
assert.equal(disposed, 1);
controller.reset();
assert.ok(links.every(link => link.removed), 'Reset removes only the links this transition created');

// A delayed response keeps the live wall moving, and failed pages recover.
events.length = 0; frames.clear(); assigned.length = 0;
controller.showNotice = message => { events.push(message); };
const draws = [];
controller.draw = (...args) => draws.push(args);
controller.scene = { dispose() { disposed++; } };
const slowNavigation = controller.navigate('/description');
finishAnimation(true);
await new Promise(setImmediate);
assert.equal(frames.size, 1);
const [id, callback] = frames.entries().next().value;
frames.delete(id); callback(500);
assert.equal(draws[0][0], 0.94);
assert.ok(draws[0][2] > 0.94 * 1.5, 'The shader clock continues while the destination is delayed');
assert.equal(assigned.length, 0);
finishRequest({ ok: false });
assert.equal(await slowNavigation, false);
assert.equal(controller.busy, false);
assert.equal(frames.size, 0);
assert.ok(events.some(value => value.includes('could not be opened')));
console.log('Passed concurrent destination resource warming, native handoff, short exit, cleanup and flowing slow-response recovery.');
