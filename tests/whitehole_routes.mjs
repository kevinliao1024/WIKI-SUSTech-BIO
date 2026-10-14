import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../static/transition/whitehole.js', import.meta.url), 'utf8');
const assigned = [];
const context = { URL, window: {}, document: { documentElement: { hasAttribute: () => false } },
  location: { href: 'https://wiki.test/description', origin: 'https://wiki.test', assign: url => assigned.push(url) } };
runInNewContext(source, context);
const prototype = context.window.ORCAWhiteHoleClasses.PageTransitionController.prototype;
const controller = Object.create(prototype);
controller.config = { home: 'https://wiki.test/' };
controller.busy = false;
controller.begin = () => { throw new Error('Ordinary page navigation must not begin a transition'); };
const link = href => ({ target: '', rel: '', hasAttribute: () => false, closest: () => null, getAttribute: () => href });
const click = { button: 0, defaultPrevented: false };
assert.equal(controller.eligible(link('/experiments'), click), null);
assert.equal(controller.eligible(link('/model'), click), null);
assert.equal(controller.eligible(link('/'), click).pathname, '/');
assert.equal(controller.eligible(link('/next'), click).pathname, '/next');
await controller.navigate('/experiments');
assert.deepEqual(assigned, ['https://wiki.test/experiments']);
let resets = 0;
controller.reset = () => { resets++; };
await controller.arrive({ direction: 'light' });
assert.equal(resets, 1, 'An old incoming fade is cleared without playback');

context.location.href = 'https://wiki.test/';
assert.equal(controller.eligible(link('/description'), click).pathname, '/description');
assert.equal(controller.direction(new URL('/description', context.location.href)), 'to-light');
assert.equal(controller.eligible(link('/description'), { ...click, ctrlKey: true }), null);
context.location.href = 'https://wiki.test/sustech/model';
controller.config.home = 'https://wiki.test/sustech/index.html';
assert.equal(controller.eligible(link('/sustech/experiments'), click), null);
assert.equal(controller.eligible(link('/sustech/index.html'), click).pathname, '/sustech/index.html');
assert.equal(controller.direction(new URL('/sustech/index.html', context.location.href)), 'to-home');

const boot = readFileSync(new URL('../static/transition/whitehole-boot.js', import.meta.url), 'utf8');
for (const direction of ['light', 'to-light', 'to-home']) {
  const root = { dataset: {}, removeAttribute() {} };
  const state = { version: 1, direction, created: Date.now(), to: 'https://wiki.test/model' };
  let cleared = false;
  const sandbox = { URL, Date, location: { href: state.to }, window: {},
    document: { documentElement: root, currentScript: { src: 'https://wiki.test/static/transition/whitehole-boot.js', dataset: { home: '/' } } },
    sessionStorage: { getItem: () => JSON.stringify(state), removeItem: () => { cleared = true; } },
    performance: { getEntriesByType: () => [{ type: 'navigate' }] }, setTimeout: () => 1, addEventListener() {} };
  runInNewContext(boot, sandbox);
  assert.equal(cleared, true);
  assert.equal(sandbox.window.__orcaWhiteHole.incoming?.direction ?? null, direction === 'light' ? null : direction);
  assert.equal(root.dataset.whCover, direction === 'light' ? undefined : direction === 'to-home' ? 'home' : 'light');
}
console.log('Passed native internal navigation, stale fade cleanup, Home transitions, modifier clicks and frozen hosting routes.');
