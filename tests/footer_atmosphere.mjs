import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const source = readFileSync(new URL('../static/footer-atmosphere.js', import.meta.url), 'utf8');
const values = () => ({ props: {}, setProperty(k, v) { this.props[k] = v; } });
const particles = Array.from({length: 15}, () => ({style: values(), classList: {contains: () => false}}));
const layer = { style: values(), clientHeight: 400, querySelectorAll: () => particles };
const events = {}, docEvents = {}, frames = new Map();
let id = 0, intersection, changeMotion;
const motion = {matches: false, addEventListener: (_, callback) => {changeMotion = callback;}};
const footer = {querySelector: s => s === '.footer-glints' ? layer : {getBoundingClientRect: () => ({top: 500})}, getBoundingClientRect: () => ({top: 100, left: 0, width: 1000, height: 700}), addEventListener: (name, callback) => {events[name] = callback;}};
const document = {hidden: false, querySelector: () => footer, addEventListener: (name, callback) => {docEvents[name] = callback;}};
vm.runInNewContext(source, {
 document, matchMedia: () => motion, Math,
 requestAnimationFrame: callback => {frames.set(++id, callback);return id;},
 cancelAnimationFrame: id => frames.delete(id),
 IntersectionObserver: class {constructor(callback) {intersection = callback;} observe() {}},
 ResizeObserver: class {observe() {}},
 window: {IntersectionObserver: true, ResizeObserver: true, addEventListener() {}},
});
const step = now => {const callbacks = [...frames.values()];frames.clear();callbacks.forEach(fn => fn(now));};
assert.equal(layer.style.height, '400px', 'Scene stops at the white community band');
assert.equal(frames.size, 0, 'No animation loop before visibility');
assert.equal(new Set(particles.map(p => p.style.props['--x'])).size, 15, 'Each particle has a randomized position');
intersection([{isIntersecting: true}]);
intersection([{isIntersecting: true}]);
assert.equal(frames.size, 1, 'Visibility notifications must not duplicate the loop');
events.pointermove({pointerType:'mouse',clientX:1000,clientY:500});
step(100);step(164);
assert.ok(parseFloat(layer.style.props['--follow-x']) > 0, 'Pointer produces smoothed parallax');
assert.ok(parseFloat(layer.style.props['--follow-x']) <= 22, 'Follow offset stays bounded');
const before = particles.map(p => p.style.transform);
step(228);
assert.ok(particles.some((p,i) => p.style.transform !== before[i]), 'All ornament types can wander');
document.hidden = true;docEvents.visibilitychange();
assert.equal(frames.size,0, 'Hidden documents stop the loop');
document.hidden = false;docEvents.visibilitychange();
motion.matches = true;changeMotion();
assert.equal(frames.size,0, 'Reduced motion stops the loop');
assert.equal(layer.style.props['--follow-x'], '0px');
assert.ok(particles.every(p => p.style.transform === ''), 'Reduced motion restores static ornaments');
console.log('Footer atmosphere: randomization, clipping, bounded follow, motion, visibility and reduced-motion checks passed.');
