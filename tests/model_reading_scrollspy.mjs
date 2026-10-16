// Run the shared navigation controller against visible and hidden heading layouts.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../static/model.js', import.meta.url), 'utf8');
const events = new Map();
const frames = [];
let context;

function element(id, top, { tagName = 'H3', chapter = false, laidOut = true, module } = {}) {
  const attributes = new Map();
  return {
    id, tagName, top, laidOut, dataset: module ? { module } : {}, hash: `#${id}`,
    getBoundingClientRect() {
      return this.laidOut ? { top: this.top - context.scrollY, width: 600, height: 40 } : { top: 0, width: 0, height: 0 };
    },
    getClientRects() { return this.laidOut ? [this.getBoundingClientRect()] : []; },
    matches() { return chapter; },
    getAttribute(name) { return attributes.get(name) || null; },
    setAttribute(name, value) { attributes.set(name, value); },
    removeAttribute(name) { attributes.delete(name); },
    hasAttribute(name) { return attributes.has(name); },
    toggleAttribute(name, on) { if (on) attributes.set(name, ''); else attributes.delete(name); },
    addEventListener() {},
  };
}

const overview = element('rewire-purpose', 700, { chapter: true });
const mechanism = element('mechanism-barrier-title', 1000, { tagName: 'H4', laidOut: false });
const approach = element('rewire-logic', 1500, { chapter: true });
const results = element('rewire-results', 2100, { chapter: true });
const spatial = element('spatial-cell-title', 2300, { tagName: 'H4', laidOut: false });
const library = element('rewire-library', 2600, { chapter: true });
const headings = [overview, mechanism, approach, results, spatial, library];
const workbenchOverview = element('workbench-purpose', 3200, { chapter: true });
const modules = [element('rewire', 400), element('workbench', 3000)];
modules[0].querySelectorAll = () => headings;
modules[1].querySelectorAll = () => [workbenchOverview];
const links = modules.map(item => element(`link-${item.id}`, 0, { module: item.id }));
const chapterLinks = [overview, approach, results, library, workbenchOverview].map(item => element(item.id, 0));

context = {
  scrollY: 0,
  history: { scrollRestoration: 'auto' },
  location: { hash: '' },
  document: {
    documentElement: {},
    querySelector: () => null,
    querySelectorAll(selector) {
      if (selector === '[data-model-module]') return modules;
      if (selector === '[data-module-link]') return links;
      if (selector === '[data-chapter-link], [data-subchapter-link]') return chapterLinks;
      return [];
    },
    getElementById: () => null,
    addEventListener() {},
  },
  getComputedStyle: () => ({ getPropertyValue: () => '112' }),
  matchMedia: query => ({ matches: query.includes('prefers-reduced-motion'), addEventListener() {} }),
  addEventListener(type, listener) { events.set(type, listener); },
  requestAnimationFrame(callback) { frames.push(callback); return frames.length; },
  IntersectionObserver: class { observe() {} },
  ResizeObserver: class { observe() {} },
};
runInNewContext(source, context);

function checkAt(scroll, expected, message) {
  context.scrollY = scroll;
  events.get('scroll')();
  while (frames.length) frames.shift()();
  assert.equal(chapterLinks.find(link => link.hasAttribute('aria-current'))?.id || null, expected, message);
}

checkAt(400, null, 'The lead figure before Overview must not activate hidden Results headings.');
checkAt(600, 'rewire-purpose', 'Overview must remain selected while the interactive viewers are hidden.');
checkAt(1400, 'rewire-logic', 'Modeling approach follows Overview in document order.');
checkAt(2000, 'rewire-results', 'Results becomes selected only when its visible heading is reached.');
checkAt(2500, 'rewire-library', 'State and flux profiles follows Results.');

spatial.laidOut = true;
mechanism.laidOut = true;
checkAt(600, 'rewire-purpose', 'Loading the viewers must not jump selection ahead.');
checkAt(2200, 'rewire-results', 'A visible viewer subheading retains its parent Results chapter.');
spatial.laidOut = false;
checkAt(1400, 'rewire-logic', 'Hiding viewer content must not overwrite the current visible chapter.');
checkAt(3100, 'workbench-purpose', 'The next software section tracks its own Overview.');
checkAt(600, 'rewire-purpose', 'Scrolling back from the second section restores the first Overview.');

console.log('Passed heading order, hidden viewer exclusion, viewer visibility changes and cross-section scroll tracking.');
