import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../static/team-opening.js', import.meta.url), 'utf8');

function setup(reduced = false, { imageDelay = 0 } = {}) {
  let now = 0;
  let nextId = 0;
  const timers = new Map();
  const classes = () => {
    const values = new Set();
    return {
      add: (...names) => names.forEach(name => values.add(name)),
      remove: name => values.delete(name),
      toggle(name, active) { if (active) values.add(name); else values.delete(name); },
      contains: name => values.has(name),
    };
  };
  const schedule = (fn, delay, interval = 0) => {
    const id = ++nextId;
    timers.set(id, { fn, time: now + delay, interval });
    return id;
  };
  const advance = duration => {
    const end = now + duration;
    while (true) {
      const pending = [...timers].filter(([, timer]) => timer.time <= end)
        .sort((a, b) => a[1].time - b[1].time)[0];
      if (!pending) break;
      const [id, timer] = pending;
      now = Math.max(now, timer.time);
      if (timer.interval) timer.time = now + timer.interval;
      else timers.delete(id);
      timer.fn();
    }
    now = end;
  };
  const panels = [0, 1].map(() => ({
    children: [], scrolls: [],
    get scrollHeight() { return this.children.filter(line => !line.hidden).length * 25; },
    scrollTo(options) { this.scrolls.push(options); },
  }));
  const lines = Array.from({ length: 30 }, (_, index) => {
    const node = {
      hidden: true,
      textContent: `extract member_${index}_skill.md`,
      dataset: { teamCompileOrder: String(index) },
      classList: classes(), parentElement: panels[index % 2],
    };
    panels[index % 2].children.push(node);
    return node;
  });
  const original = lines.map(line => line.textContent);
  const frames = [];
  const frameEvents = [];
  const preloadedFrames = [];
  const imageListeners = new Map();
  const frame = {
    complete: imageDelay === 0,
    set src(value) {
      frames.push(value);
      frameEvents.push({ source: value, time: now });
      this.complete = imageDelay === 0;
      if (Number.isFinite(imageDelay) && imageDelay > 0) schedule(() => {
        this.complete = true;
        [...(imageListeners.get('load') || [])].forEach(fn => fn());
      }, imageDelay);
    },
    addEventListener(type, fn) {
      if (!imageListeners.has(type)) imageListeners.set(type, new Set());
      imageListeners.get(type).add(fn);
    },
    removeEventListener(type, fn) { imageListeners.get(type)?.delete(fn); },
  };
  class CachedImage {
    set src(value) { this.source = value; preloadedFrames.push(value); }
    get src() { return this.source; }
  }
  const status = {};
  let click;
  let change;
  const motion = {
    matches: reduced,
    addEventListener(type, fn) { change = fn; },
    removeEventListener() { change = undefined; },
  };
  const button = {
    disabled: false, classList: classes(),
    dataset: { teamPackageFrames: '01|02|03|04' },
    attributes: {},
    setAttribute(name, value) { this.attributes[name] = value; },
    querySelector(selector) { return selector.includes('frame') ? frame : status; },
    addEventListener(type, fn) { click = fn; },
  };
  const compilation = { classList: classes() };
  const mount = { replaceChildren(node) { this.child = node; } };
  const header = {
    focused: false,
    focus() { this.focused = true; },
    querySelectorAll() { return panels; },
    querySelector() { return null; },
  };
  const pageScrolls = [];
  const deck = {
    classList: classes(),
    querySelectorAll() { return []; },
    scrollIntoView() { assert.fail('The package header must stay in view after unpacking.'); },
  };
  const opening = {
    hidden: false, dataset: {}, contains: element => element === button,
    querySelector(selector) { return selector === '[data-team-package]' ? button : compilation; },
    querySelectorAll() { return lines; },
  };
  const body = { classList: classes() };
  const rootStyles = new Map();
  const root = {
    matches: () => false, classList: classes(),
    style: {
      setProperty: (name, value) => rootStyles.set(name, value),
      removeProperty: name => rootStyles.delete(name),
    },
  };
  const document = {
    body, activeElement: null, documentElement: root,
    querySelector(selector) {
      if (selector === '[data-team-opening]') return opening;
      if (selector === '.team-deck') return deck;
      if (selector === '[data-team-package-header]') return header;
      if (selector === '[data-team-package-mount]') return mount;
      return null;
    },
    querySelectorAll() { return []; },
  };
  vm.runInNewContext(source, {
    document, matchMedia: () => motion, performance: { now: () => now },
    window: { scrollY: 123, scrollTo: options => pageScrolls.push(options) },
    AbortController, Image: CachedImage, innerWidth: 1200, innerHeight: 800,
    setTimeout: (fn, delay) => schedule(fn, delay),
    setInterval: (fn, delay) => schedule(fn, delay, delay),
    clearTimeout: id => timers.delete(id), clearInterval: id => timers.delete(id),
    requestAnimationFrame: fn => schedule(fn, 16),
  });
  return {
    advance, opening, body, lines, original, panels, frames, frameEvents, preloadedFrames, button, mount, compilation, header, pageScrolls, root, rootStyles,
    stall(duration) { now += duration; },
    click() { document.activeElement = button; click({ currentTarget: button }); },
    reduceMotion() { motion.matches = true; change?.(); },
  };
}

const run = setup();
assert.deepEqual(run.preloadedFrames, ['01', '02', '03', '04'], 'All four images should preload before clicking.');
assert.equal(run.frames.length, 0, 'Preloading must not start the animation.');
assert.equal(run.root.classList.contains('team-opening-scroll-locked'), true, 'The opening must freeze background scrolling immediately.');
assert.equal(run.rootStyles.get('--team-opening-scroll-top'), '-123px', 'Freezing the body should preserve its initial visual position.');
run.advance(20000);
assert.equal(run.opening.hidden, false, 'Waiting must not bypass the package button.');
assert.equal(run.opening.dataset.phase, 'title');
assert.ok(run.lines.every(line => line.hidden), 'No code should appear before clicking.');
assert.equal(run.root.classList.contains('team-opening-scroll-locked'), true, 'Waiting on the blurred preview must keep scrolling locked.');
run.click();
assert.equal(run.lines.filter(line => !line.hidden).length, 1);
assert.notEqual(run.lines[0].textContent, run.original[0], 'The first line should type gradually.');
run.advance(160);
assert.equal(run.lines[0].textContent, run.original[0]);
assert.equal(run.lines[1].hidden, true);
run.advance(32);
assert.equal(run.lines.filter(line => !line.hidden).length, 2, 'The next line should appear by 192 ms at 1.3x the previous output speed.');
run.advance(2808);
assert.equal(run.opening.hidden, false, 'Compilation should outlast the old three-second loading.');
assert.equal(run.root.classList.contains('team-opening-scroll-locked'), true, 'Compilation must keep background scrolling locked.');
run.click();
run.advance(3000);
assert.equal(run.button.classList.contains('is-complete'), false, 'The final reading pause must finish before the completion pop starts.');
run.advance(200);
assert.equal(run.opening.hidden, false, 'The completed code should remain during its reading pause.');
assert.equal(run.button.classList.contains('is-complete'), true, 'The faster output should reach completion by 6.2 seconds.');
assert.deepEqual(run.lines.map(line => line.textContent), run.original);
assert.ok(run.panels.every(panel => panel.scrolls.length >= 15), 'Both logs should scroll to new lines.');
run.advance(1000);
assert.equal(run.opening.hidden, false, 'The completion pop should remain visible before entering the roster.');
assert.equal(run.button.classList.contains('is-complete'), true);
assert.equal(run.button.classList.contains('is-unpacking'), false);
assert.equal(run.root.classList.contains('team-opening-scroll-locked'), true, 'The completion pop must keep the blurred page locked.');
run.advance(400);
assert.equal(run.opening.hidden, true);
assert.equal(run.body.classList.contains('team-package-open'), true);
assert.equal(run.root.classList.contains('team-opening-scroll-locked'), false, 'The roster must regain scrolling after unpacking.');
assert.equal(run.rootStyles.has('--team-opening-scroll-top'), false);
assert.deepEqual(run.frames, ['01', '02', '03', '04', '01', '02', '03', '04']);
assert.ok(run.frameEvents.slice(1).every((event, index) => event.time - run.frameEvents[index].time >= 750),
  'Every image in both cycles must have its own visible hold.');
assert.equal(run.mount.child, run.compilation, 'The actual package and completed log should remain in the page header.');
assert.equal(run.header.focused, true, 'Keyboard focus should leave the dismissed opening.');
assert.equal(run.button.classList.contains('is-unpacking'), false);
assert.equal(run.button.classList.contains('is-complete'), false);
assert.equal(run.button.attributes['aria-busy'], 'false');
assert.ok(run.lines.every(line => !line.hidden && !line.classList.contains('is-typing')));
assert.equal(run.pageScrolls.at(-1).top, 0, 'The header should stay above the visible roster.');

const reduced = setup(true);
reduced.click();
assert.ok(reduced.lines.every(line => !line.hidden));
reduced.advance(400);
assert.equal(reduced.opening.hidden, true, 'Reduced motion must not strand a disabled button.');
assert.equal(reduced.root.classList.contains('team-opening-scroll-locked'), false);
assert.ok(reduced.panels.every(panel => panel.scrolls.every(scroll => scroll.behavior === 'instant')),
  'Reduced motion should only position the finished logs without animated scrolling.');
assert.equal(reduced.mount.child, reduced.compilation);

const changed = setup();
changed.click();
changed.advance(1200);
changed.reduceMotion();
assert.equal(changed.opening.hidden, true, 'Enabling reduced motion during compilation should finish it.');
assert.equal(changed.root.classList.contains('team-opening-scroll-locked'), false);
assert.deepEqual(changed.lines.map(line => line.textContent), changed.original,
  'The docked log must be complete when reduced motion is enabled mid-compilation.');
const previousFrames = [...changed.frames];
changed.advance(10000);
assert.deepEqual(changed.frames, previousFrames, 'No frame timer may remain after completion.');

const completed = setup();
completed.click();
completed.advance(6800);
assert.equal(completed.button.classList.contains('is-complete'), true);
completed.reduceMotion();
assert.equal(completed.opening.hidden, true, 'Reduced motion should also finish the completion pop immediately.');
assert.equal(completed.root.classList.contains('team-opening-scroll-locked'), false);
completed.advance(3000);
assert.equal(completed.mount.child, completed.compilation);

const stalled = setup();
stalled.click();
stalled.stall(6000);
stalled.advance(0);
assert.deepEqual(stalled.frames, ['01', '02'], 'A delayed timer must advance one frame without skipping the first cycle.');
stalled.advance(12000);
assert.deepEqual(stalled.frames, ['01', '02', '03', '04', '01', '02', '03', '04']);
assert.equal(stalled.opening.hidden, true);

const slowImages = setup(false, { imageDelay: 1500 });
slowImages.click();
slowImages.advance(7800);
assert.equal(slowImages.opening.hidden, false);
assert.equal(slowImages.button.classList.contains('is-complete'), false,
  'The code finishing must not end the animation before both image cycles finish.');
slowImages.advance(20000);
assert.deepEqual(slowImages.frames, ['01', '02', '03', '04', '01', '02', '03', '04']);
assert.equal(slowImages.opening.hidden, true);

const missingImages = setup(false, { imageDelay: Infinity });
missingImages.click();
missingImages.advance(30000);
assert.equal(missingImages.opening.hidden, true, 'Unavailable images must not leave scrolling permanently locked.');
assert.equal(missingImages.root.classList.contains('team-opening-scroll-locked'), false);

console.log('Team compilation: two complete image cycles, preloading, slow images, delayed timers, missing-image recovery, scroll lock, typing, completion pop and reduced motion passed.');
